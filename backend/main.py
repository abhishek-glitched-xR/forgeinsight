from contextlib import asynccontextmanager
import logging
from typing import List
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text

from config import settings
from database import engine, Base, get_db, create_database_if_not_exists
import models
import schemas
import crud

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB connection and tables if MySQL is running
    logger.info("Initializing MySQL database connection...")
    created = create_database_if_not_exists()
    if created:
        try:
            Base.metadata.create_all(bind=engine)
            logger.info("Database tables initialized successfully.")
        except Exception as e:
            logger.warning(f"Could not create tables on startup: {e}")
    else:
        logger.warning(
            "MySQL is not yet reachable or credentials are not configured in backend/.env. "
            "Backend is still running and will connect once MySQL is ready."
        )
    yield
    logger.info("Shutting down backend server.")

app = FastAPI(
    title="Forge Insight API",
    description="Python FastAPI backend connected to MySQL database",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_ORIGIN,
        "http://localhost:8443",
        "http://127.0.0.1:8443",
        "http://localhost:5173",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/", tags=["Health"])
def root():
    return {
        "message": "Forge Insight Backend API is running",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/api/health", response_model=schemas.StatusResponse, tags=["Health"])
def health_check(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        return schemas.StatusResponse(
            status="healthy",
            database="connected",
            details="MySQL connection active and verified"
        )
    except Exception as e:
        logger.error(f"Health check MySQL connection failed: {e}")
        return schemas.StatusResponse(
            status="degraded",
            database="disconnected",
            details=f"Cannot reach MySQL: {str(e)}"
        )

@app.post(
    "/api/contact",
    response_model=schemas.ContactResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["Contact"]
)
def submit_contact(inquiry: schemas.ContactCreate, db: Session = Depends(get_db)):
    try:
        created_inquiry = crud.create_contact_submission(db, inquiry)
        return created_inquiry
    except Exception as e:
        logger.error(f"Error submitting contact form: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save contact inquiry to MySQL: {str(e)}"
        )

@app.get(
    "/api/contact",
    response_model=List[schemas.ContactResponse],
    tags=["Contact"]
)
def list_contacts(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    try:
        return crud.get_contact_submissions(db, skip=skip, limit=limit)
    except Exception as e:
        logger.error(f"Error fetching contacts: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch contacts from MySQL: {str(e)}"
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.BACKEND_HOST,
        port=settings.BACKEND_PORT,
        reload=True
    )
