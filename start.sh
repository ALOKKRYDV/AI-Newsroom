#!/bin/bash

echo "🚀 AI Newsroom Setup Script"
echo ""

# Check if Docker is installed
echo "Checking prerequisites..."
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

echo "✅ Docker found"

# Copy environment file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit .env file and add your API keys!"
    echo ""
    echo "Required API keys:"
    echo "  - OPENAI_API_KEY (required for AI features)"
    echo "  - JWT_SECRET (generate a random string)"
    echo ""
    echo "Optional OAuth credentials:"
    echo "  - GOOGLE_CLIENT_ID & GOOGLE_CLIENT_SECRET"
    echo "  - GITHUB_CLIENT_ID & GITHUB_CLIENT_SECRET"
    echo ""
    
    read -p "Have you updated the .env file? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Please update .env file and run this script again."
        exit 0
    fi
fi

# Start Docker Compose
echo ""
echo "Starting Docker containers..."
docker-compose up -d

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ AI Newsroom is starting up!"
    echo ""
    echo "Services:"
    echo "  🌐 Frontend:  http://localhost:3000"
    echo "  🔧 Backend:   http://localhost:5000"
    echo "  🗄️  Database:  localhost:5432"
    echo ""
    echo "View logs with: docker-compose logs -f"
    echo "Stop services: docker-compose down"
    echo ""
    echo "The application will be ready in a few moments..."
else
    echo "❌ Failed to start Docker containers"
    echo "Please check the error messages above"
fi
