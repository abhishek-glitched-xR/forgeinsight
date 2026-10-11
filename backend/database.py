
import logging

import pymysql
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from config import settings

logger = logging.getLogger(__name__)

# Base class for SQLAlchemy models
Base = declarative_base()


def get_db_ssl_args():
    """
    Configure SSL for TiDB Cloud connections.
    SSL remains disabled for local MySQL unless DB_SSL=true.
    """
    if not settings.DB_SSL:
        return {}

    if not settings.DB_SSL_CA:
        raise RuntimeError(
            "DB_SSL_CA must be configured when DB_SSL=true."
        )

    return {
        "ssl_ca": settings.DB_SSL_CA,
        "ssl_verify_cert": True,
        "ssl_verify_identity": True,
    }


def create_database_if_not_exists():
    """
    Ensure the target database exists.

    Note:
    TiDB Cloud users generally need to create the database
    manually in TiDB Cloud SQL Editor. Their credentials may
    not have permission to create databases.
    """
    conn = None

    try:
        conn = pymysql.connect(
            host=settings.DB_HOST,
            port=settings.DB_PORT,
            user=settings.DB_USER,
            password=settings.DB_PASSWORD,
            charset="utf8mb4",
            connect_timeout=10,
            **get_db_ssl_args(),
        )

        with conn.cursor() as cursor:
            cursor.execute(
                f"CREATE DATABASE IF NOT EXISTS `{settings.DB_NAME}` "
                "CHARACTER SET utf8mb4;"
            )

        conn.commit()

        logger.info(
            "Database '%s' verified or created successfully.",
            settings.DB_NAME,
        )
        return True

    except Exception:
        logger.exception(
            "Could not create or verify database '%s'. "
            "Check database credentials, permissions, host, port, and SSL.",
            settings.DB_NAME,
        )
        return False

    finally:
        if conn is not None:
            conn.close()


# SQLAlchemy database engine
engine = create_engine(
    settings.database_url,
    connect_args={
        **get_db_ssl_args(),
        "connect_timeout": 10,
    },
    pool_pre_ping=True,
    pool_recycle=3600,
    pool_size=5,
    max_overflow=2,
    echo=False,
)


# Database session factory
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


def get_db():
    """
    Provide a database session to FastAPI routes
    and close it after the request finishes.
    """
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()
