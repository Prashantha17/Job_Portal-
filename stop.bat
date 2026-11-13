@echo off
title TalentFlow 360 - Stop Services

echo =====================================================================
echo                     STOPPING TALENTFLOW 360
echo =====================================================================
echo.

echo [*] Finding and stopping processes on Port 8080 (Spring Boot)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8080" ^| findstr "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
    echo [+] Terminated Port 8080 process PID: %%a
)

echo [*] Finding and stopping processes on Port 5173 (React Vite)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5173" ^| findstr "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
    echo [+] Terminated Port 5173 process PID: %%a
)

echo.
echo [+] Services stopped.
echo.
timeout /t 2 /nobreak >nul

