@echo off
setlocal enabledelayedexpansion

title TalentFlow 360 - Launcher

echo =====================================================================
echo                     STARTING TALENTFLOW 360
echo       Intelligent Recruitment ^& Talent Management Platform
echo =====================================================================
echo.

:: Detect Node.js and Maven in system or fallback paths
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    if exist "C:\Users\VICTUS\tomato-disease-detection\web-page\nodejs" (
        set "PATH=C:\Users\VICTUS\tomato-disease-detection\web-page\nodejs;!PATH!"
    )
)

where mvn >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    if exist "C:\Program Files\JetBrains\IntelliJ IDEA 2026.2.4\plugins\maven-plugin\lib\maven3\bin" (
        set "PATH=C:\Program Files\JetBrains\IntelliJ IDEA 2026.2.4\plugins\maven-plugin\lib\maven3\bin;!PATH!"
    )
)

:: Locate directories
set "ROOT_DIR=%~dp0"
if exist "%ROOT_DIR%TalentFlow360\talentflow-backend" (
    set "BACKEND_DIR=%ROOT_DIR%TalentFlow360\talentflow-backend"
    set "FRONTEND_DIR=%ROOT_DIR%TalentFlow360\talentflow-frontend"
) else (
    set "BACKEND_DIR=%ROOT_DIR%talentflow-backend"
    set "FRONTEND_DIR=%ROOT_DIR%talentflow-frontend"
)

echo [*] Launching Spring Boot 3.4 Backend (Port 8080)...
start "TalentFlow 360 - Spring Boot Backend (Port 8080)" cmd /k "cd /d !BACKEND_DIR! && echo Starting Spring Boot... && mvn spring-boot:run"

echo [*] Launching React.js Frontend with Vite (Port 5173)...
start "TalentFlow 360 - React.js Frontend (Port 5173)" cmd /k "cd /d !FRONTEND_DIR! && echo Starting Vite Dev Server... && npm run dev"

echo.
echo =====================================================================
echo                   SERVICES ARE STARTING UP!
echo =====================================================================
echo.
echo   [1] Frontend Application (React.js):
echo       http://localhost:5173
echo.
echo   [2] Backend REST API (Spring Boot):
echo       http://localhost:8080
echo.
echo   [3] Health ^& Diagnostics Endpoint:
echo       http://localhost:8080/api/v1/health
echo.
echo   [4] Swagger OpenAPI 3.0 Documentation:
echo       http://localhost:8080/swagger-ui.html
echo.
echo =====================================================================
echo.
echo Opening browser in 4 seconds...
timeout /t 4 /nobreak >nul
start http://localhost:5173

echo.
echo Both application windows are now running in the background.
echo Keep those windows open while using TalentFlow 360.
echo.
pause

