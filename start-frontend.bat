@echo off
REM Frontend Server Startup Script (Windows Batch)
echo ========================================
echo   Starting Frontend Server
echo ========================================
echo.

cd client

if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    echo.
)

echo Starting frontend development server...
echo Frontend will run on: http://localhost:3000
echo Press Ctrl+C to stop the server
echo.

call npm run dev

pause
