@echo off
title AI Newsroom - All Servers
color 0A

echo ========================================
echo    AI Newsroom - Starting Servers
echo ========================================
echo.
echo Starting both Backend and Frontend...
echo.
echo - Backend: http://localhost:5000
echo - Frontend: http://localhost:3000
echo.
echo Auto-restart: ENABLED
echo Press CTRL+C to stop all servers
echo ========================================
echo.

cd /d "%~dp0"

:start
echo [%time%] Starting servers...
call npm run dev
echo.
echo [%time%] Servers stopped! Auto-restarting in 3 seconds...
echo Press CTRL+C now if you want to stop
timeout /t 3 /nobreak > nul
goto start
