@echo off
echo =========================================================================
echo   Starting Agentic AI-Powered Student Personal Assistant Full Stack
echo =========================================================================
echo.
echo [1/2] Starting Python FastAPI Backend on http://localhost:8000 ...
start "Student AI Backend (Port 8000)" cmd /k "cd backend && venv\Scripts\python.exe -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload"

timeout /t 3 /nobreak >nul

echo [2/2] Starting React + Vite Frontend on http://localhost:5173 ...
start "Student AI Frontend (Port 5173)" cmd /k "cd frontend && npm run dev -- --host 0.0.0.0 --port 5173"

echo.
echo =========================================================================
echo   Both servers launched!
echo   Frontend URL:  http://localhost:5173
echo   Backend API:   http://localhost:8000/docs
echo =========================================================================