# Script to check and validate .env file
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Checking .env Configuration" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$envPath = Join-Path $PSScriptRoot ".env"

if (-not (Test-Path $envPath)) {
    Write-Host "❌ .env file not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Creating .env file template..." -ForegroundColor Yellow
    
    @"
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/erp_db?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
"@ | Out-File -FilePath $envPath -Encoding utf8
    
    Write-Host "✅ .env file created!" -ForegroundColor Green
    Write-Host ""
    Write-Host "⚠️  Please edit .env file and add your MongoDB connection string" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ .env file exists" -ForegroundColor Green
Write-Host ""

# Read and check .env file
$envContent = Get-Content $envPath -Raw

# Check for MONGODB_URI
if ($envContent -match 'MONGODB_URI=(.+)') {
    $mongoUri = $matches[1].Trim()
    
    Write-Host "MONGODB_URI found:" -ForegroundColor Cyan
    
    # Check if it's a placeholder
    if ($mongoUri -match 'your_mongodb|placeholder|xxxxx') {
        Write-Host "  ❌ Still contains placeholder value!" -ForegroundColor Red
        Write-Host "  Current: $($mongoUri.Substring(0, [Math]::Min(60, $mongoUri.Length)))..." -ForegroundColor Gray
        Write-Host ""
        Write-Host "⚠️  Please replace with your actual MongoDB connection string" -ForegroundColor Yellow
    }
    elseif (-not ($mongoUri -match '^mongodb\+srv://|^mongodb://')) {
        Write-Host "  ❌ Invalid format! Must start with mongodb:// or mongodb+srv://" -ForegroundColor Red
        Write-Host "  Current: $($mongoUri.Substring(0, [Math]::Min(60, $mongoUri.Length)))..." -ForegroundColor Gray
    }
    else {
        Write-Host "  ✅ Format looks correct" -ForegroundColor Green
        Write-Host "  $($mongoUri.Substring(0, [Math]::Min(60, $mongoUri.Length)))..." -ForegroundColor Gray
    }
}
else {
    Write-Host "❌ MONGODB_URI not found in .env file" -ForegroundColor Red
}

Write-Host ""

# Check for JWT_SECRET
if ($envContent -match 'JWT_SECRET=(.+)') {
    $jwtSecret = $matches[1].Trim()
    if ($jwtSecret -match 'your_super_secret|change_this|placeholder') {
        Write-Host "⚠️  JWT_SECRET is still set to default value" -ForegroundColor Yellow
        Write-Host "  Consider changing it for security" -ForegroundColor Gray
    }
    else {
        Write-Host "✅ JWT_SECRET is set" -ForegroundColor Green
    }
}
else {
    Write-Host "❌ JWT_SECRET not found in .env file" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "To edit .env file, run:" -ForegroundColor Yellow
Write-Host "  notepad $envPath" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
