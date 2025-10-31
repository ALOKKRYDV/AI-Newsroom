@echo off
title AI Newsroom Frontend Server
color 0B
echo ========================================
echo    AI Newsroom Frontend Server
echo ========================================
echo.

cd /d "%~dp0frontend"

:start
echo Starting frontend server...
echo.
npm run dev

echo.
echo ========================================
echo Frontend server stopped!
echo Restarting in 3 seconds...
echo Press Ctrl+C to exit
echo ========================================
timeout /t 3 /nobreak > nul

goto start
