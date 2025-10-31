# Quick Start Script for Windows PowerShell

Write-Host "🚀 AI Newsroom Setup Script" -ForegroundColor Green
Write-Host ""

# Check if Docker is installed
Write-Host "Checking prerequisites..." -ForegroundColor Yellow
if (!(Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Docker is not installed. Please install Docker Desktop first." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Docker found" -ForegroundColor Green

# Copy environment file if it doesn't exist
if (!(Test-Path .env)) {
    Write-Host "Creating .env file from template..." -ForegroundColor Yellow
    Copy-Item .env.example .env
    Write-Host "⚠️  Please edit .env file and add your API keys!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Required API keys:" -ForegroundColor Cyan
    Write-Host "  - OPENAI_API_KEY (required for AI features)" -ForegroundColor White
    Write-Host "  - JWT_SECRET (generate a random string)" -ForegroundColor White
    Write-Host ""
    Write-Host "Optional OAuth credentials:" -ForegroundColor Cyan
    Write-Host "  - GOOGLE_CLIENT_ID & GOOGLE_CLIENT_SECRET" -ForegroundColor White
    Write-Host "  - GITHUB_CLIENT_ID & GITHUB_CLIENT_SECRET" -ForegroundColor White
    Write-Host ""
    
    $continue = Read-Host "Have you updated the .env file? (y/n)"
    if ($continue -ne "y") {
        Write-Host "Please update .env file and run this script again." -ForegroundColor Yellow
        exit 0
    }
}

# Start Docker Compose
Write-Host ""
Write-Host "Starting Docker containers..." -ForegroundColor Yellow
docker-compose up -d

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ AI Newsroom is starting up!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Services:" -ForegroundColor Cyan
    Write-Host "  🌐 Frontend:  http://localhost:3000" -ForegroundColor White
    Write-Host "  🔧 Backend:   http://localhost:5000" -ForegroundColor White
    Write-Host "  🗄️  Database:  localhost:5432" -ForegroundColor White
    Write-Host ""
    Write-Host "View logs with: docker-compose logs -f" -ForegroundColor Yellow
    Write-Host "Stop services: docker-compose down" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "The application will be ready in a few moments..." -ForegroundColor Green
} else {
    Write-Host "❌ Failed to start Docker containers" -ForegroundColor Red
    Write-Host "Please check the error messages above" -ForegroundColor Yellow
}
