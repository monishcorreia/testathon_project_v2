@echo off
REM Car Rental Price Monitor - Windows Scheduled Task Runner
REM This script is called by Windows Task Scheduler

cd /d "C:\path\to\your\project"
set GMAIL_USER=monish.correia@gmail.com
set GMAIL_PASSWORD=your-16-char-app-password

node price-monitor.js >> price-monitor.log 2>&1

echo.
echo Price check completed at %date% %time% >> price-monitor.log
