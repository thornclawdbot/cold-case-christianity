@echo off
REM Daily Briefing Dashboard - Quick Start

echo ================================================
echo   Daily Briefing Dashboard
echo ================================================
echo.

if exist node_modules (
    echo Starting server...
    node server.js
) else (
    echo Installing dependencies...
    npm init -y >nul 2>&1
    npm install --save-dev nodemon >nul 2>&1
    
    echo.
    echo Dependencies installed!
    echo.
    echo Starting server...
    node server.js
)
