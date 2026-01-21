@echo off
REM Backend Server Startup Script (Windows Batch)
echo ========================================
echo   Starting Backend Server
echo ========================================
echo.

cd server

if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    echo.
)

if not exist ".env" (
    echo WARNING: .env file not found!
    echo Please create a .env file in the server folder
    echo.
    pause
)

echo Starting backend server...
echo Server will run on: http://localhost:5000
echo Press Ctrl+C to stop the server
echo.

call npm start

pause
