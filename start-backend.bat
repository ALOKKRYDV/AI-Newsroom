@echo off
title AI Newsroom Backend Server
color 0A
echo ========================================
echo    AI Newsroom Backend Server
echo ========================================
echo.

cd /d "%~dp0backend"

:start
echo Starting backend server...
echo.
node src/index.js

echo.
echo ========================================
echo Backend server stopped!
echo Restarting in 3 seconds...
echo Press Ctrl+C to exit
echo ========================================
timeout /t 3 /nobreak > nul

goto start
