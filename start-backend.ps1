# Backend Server Startup Script
# Run this script to start the backend server

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Starting Backend Server" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Navigate to server directory
Set-Location -Path "server"

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
    Write-Host ""
}

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  WARNING: .env file not found!" -ForegroundColor Red
    Write-Host "Please create a .env file in the server folder with:" -ForegroundColor Yellow
    Write-Host "  PORT=5000" -ForegroundColor Gray
    Write-Host "  MONGODB_URI=your_mongodb_connection_string" -ForegroundColor Gray
    Write-Host "  JWT_SECRET=your_secret_key" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Press any key to continue anyway..." -ForegroundColor Yellow
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

Write-Host "Starting backend server..." -ForegroundColor Green
Write-Host "Server will run on: http://localhost:5000" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Start the server
npm start
