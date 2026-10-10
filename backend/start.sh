#!/usr/bin/env bash
# Render build & start script for the Python FastAPI backend
set -e

# Install dependencies
pip install -r requirements.txt

# Start Uvicorn
exec uvicorn main:app --host 0.0.0.0 --port "${PORT:-8000}"
