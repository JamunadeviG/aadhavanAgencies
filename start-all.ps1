# Start Both Backend and Frontend Servers
# This script opens two separate PowerShell windows

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Starting ERP Application" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Start backend in a new window
Write-Host "Starting backend server in new window..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\server'; if (-not (Test-Path 'node_modules')) { npm install }; npm start"

# Wait a moment for backend to start
Start-Sleep -Seconds 3

# Start frontend in a new window
Write-Host "Starting frontend server in new window..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\client'; if (-not (Test-Path 'node_modules')) { npm install }; npm run dev"

Write-Host ""
Write-Host "✅ Both servers are starting!" -ForegroundColor Green
Write-Host "Backend:  http://localhost:5000" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Two new windows will open - one for each server." -ForegroundColor Yellow
Write-Host "Keep both windows open while using the application." -ForegroundColor Yellow
Write-Host ""
Write-Host "Press any key to exit this window..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
