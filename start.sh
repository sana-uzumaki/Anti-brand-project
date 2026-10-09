#!/usr/bin/env bash
set -e

echo "=========================================================="
echo " Starting HACXL Digital Risk Protection Platform"
echo "=========================================================="

# 1. Start FastAPI Backend
echo "Starting Backend on http://localhost:8000..."
cd backend
./venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
cd ..

# 2. Start React/Bun Frontend
echo "Starting Frontend on http://localhost:3000..."
cd frontend
/home/Drowzy_Cat/.bun/bin/bun run dev --port 3000 --host 0.0.0.0 &
FRONTEND_PID=$!
cd ..

echo "----------------------------------------------------------"
echo "Platform is Live!"
echo "Dashboard UI: http://localhost:3000"
echo "API Docs:     http://localhost:8000/docs"
echo "----------------------------------------------------------"

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null" EXIT
wait
