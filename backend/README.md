# Backend API & MySQL Setup Guide

This backend is built with **Python 3**, **FastAPI**, **SQLAlchemy**, and **PyMySQL**.

---

## 📁 Directory Structure
```
backend/
├── venv/                 # Virtual environment (ready with all dependencies installed)
├── config.py             # App & MySQL settings loaded from .env
├── database.py           # SQLAlchemy engine & session maker
├── models.py             # MySQL ORM models (contact_submissions table)
├── schemas.py            # Pydantic validation schemas
├── crud.py               # Database query operations
├── main.py               # FastAPI application & REST endpoints
├── init.sql              # Raw SQL script to initialize MySQL database and tables
├── requirements.txt      # Dependency list
├── .env                  # Active database configuration
├── .env.example          # Environment variables template
└── README.md             # This documentation
```

---

## ⚙️ 1. Configure MySQL Credentials

Open [`backend/.env`](file:///Users/abhishek/Desktop/project%2002/backend/.env) and update the values to match your MySQL database instance:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=forge_insight

BACKEND_HOST=0.0.0.0
BACKEND_PORT=8000
FRONTEND_ORIGIN=http://localhost:8443
```

---

## 🚀 2. Running the Backend Server

The virtual environment is already prepared with all libraries installed. To run the server:

```bash
cd backend
source venv/bin/activate
python main.py
```

Or using uvicorn directly:
```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

---

## 📡 3. Available Endpoints

- **Root info**: `GET http://localhost:8000/`
- **Interactive Swagger Docs**: `GET http://localhost:8000/docs`
- **Database Health Check**: `GET http://localhost:8000/api/health`
- **Submit Contact / Inquiry**: `POST http://localhost:8000/api/contact`
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "phone": "+1 555-0199",
    "message": "We would like to consult on AI automation."
  }
  ```
- **List All Inquiries**: `GET http://localhost:8000/api/contact`

---

## 🗄️ 4. Manual Database Setup (Optional)

If your MySQL user does not have permission to `CREATE DATABASE`, you can execute [`backend/init.sql`](file:///Users/abhishek/Desktop/project%2002/backend/init.sql) in MySQL CLI, MySQL Workbench, or phpMyAdmin:

```bash
mysql -u root -p < init.sql
```
