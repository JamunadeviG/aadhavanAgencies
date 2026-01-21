# Frontend Server Startup Script
# Run this script to start the frontend development server

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Starting Frontend Server" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Navigate to client directory
Set-Location -Path "client"

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
    Write-Host ""
}

Write-Host "Starting frontend development server..." -ForegroundColor Green
Write-Host "Frontend will run on: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Start the development server
npm run dev
