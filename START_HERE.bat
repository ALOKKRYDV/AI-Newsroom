@echo off
title AI Newsroom - Starting All Services
color 0E

echo ========================================
echo    AI Newsroom Startup Script
echo ========================================
echo.
echo Starting backend and frontend servers...
echo.
echo Two windows will open:
echo   1. Backend Server (Green) - Port 5000
echo   2. Frontend Server (Blue) - Port 3000
echo.
echo Keep both windows open to use the application!
echo ========================================
echo.

cd /d "%~dp0"

:: Start Backend in new window
start "AI Newsroom Backend" "%~dp0start-backend.bat"

:: Wait 3 seconds
timeout /t 3 /nobreak > nul

:: Start Frontend in new window
start "AI Newsroom Frontend" "%~dp0start-frontend.bat"

echo.
echo ========================================
echo Both servers are starting!
echo.
echo Access your application at:
echo   http://localhost:3000
echo.
echo DO NOT CLOSE the server windows!
echo ========================================
echo.
pause
