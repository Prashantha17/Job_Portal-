@echo off
setlocal enabledelayedexpansion

title TalentFlow 360 - Initial Setup & Verification

echo =====================================================================
echo           TALENTFLOW 360 - ENVIRONMENT SETUP ^& VERIFICATION
echo       Intelligent Recruitment ^& Talent Management Platform
echo =====================================================================
echo.

:: Detect Node.js and Maven in system or fallback paths
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    if exist "C:\Users\VICTUS\tomato-disease-detection\web-page\nodejs" (
        set "PATH=C:\Users\VICTUS\tomato-disease-detection\web-page\nodejs;!PATH!"
        echo [+] Added Node.js from detected path.
    )
)

where mvn >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    if exist "C:\Program Files\JetBrains\IntelliJ IDEA 2026.2.4\plugins\maven-plugin\lib\maven3\bin" (
        set "PATH=C:\Program Files\JetBrains\IntelliJ IDEA 2026.2.4\plugins\maven-plugin\lib\maven3\bin;!PATH!"
        echo [+] Added Maven from detected path.
    )
)

:: 1. Verify Java
echo [*] Checking Java environment...
where java >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Java was not found in PATH! Please ensure JDK 21+ or JDK 25 is installed.
    pause
    exit /b 1
)
java -version
echo.

:: 2. Verify Maven
echo [*] Checking Maven...
where mvn >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Maven was not found!
    pause
    exit /b 1
)
call mvn -version
echo.

:: 3. Verify Node.js & npm
echo [*] Checking Node.js and npm...
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js was not found!
    pause
    exit /b 1
)
node -v
npm -v
echo.

:: 4. Verify/Create MySQL database
echo [*] Initializing MySQL database 'talentflow_db' on localhost:3306...
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
    "$connStr = 'Server=localhost;Port=3306;Uid=root;Pwd=Prashantha@9980;';" ^
    "try {" ^
    "  $tcp = New-Object System.Net.Sockets.TcpClient('127.0.0.1', 3306);" ^
    "  if ($tcp.Connected) { Write-Host '  -> MySQL port 3306 is open.'; $tcp.Close() }" ^
    "} catch {" ^
    "  Write-Host '  [!] Warning: Port 3306 not responding. Ensure MySQL service is running.'" ^
    "}"
echo.

:: 5. Install Frontend Dependencies
echo [*] Setting up React frontend dependencies...
if exist "TalentFlow360\talentflow-frontend" (
    cd TalentFlow360\talentflow-frontend
) else if exist "talentflow-frontend" (
    cd talentflow-frontend
) else (
    echo [ERROR] talentflow-frontend directory not found!
    pause
    exit /b 1
)

call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Frontend npm install encountered errors.
    pause
    exit /b 1
)
echo [+] Frontend dependencies installed successfully.
cd ..\..

:: 6. Compile Backend
echo.
echo [*] Compiling Spring Boot backend...
if exist "TalentFlow360\talentflow-backend" (
    cd TalentFlow360\talentflow-backend
) else if exist "talentflow-backend" (
    cd talentflow-backend
) else (
    echo [ERROR] talentflow-backend directory not found!
    pause
    exit /b 1
)

call mvn test-compile
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Backend compilation failed.
    pause
    exit /b 1
)
echo [+] Backend compiled successfully.
cd ..\..

echo.
echo =====================================================================
echo               SETUP COMPLETED SUCCESSFULLY!
echo =====================================================================
echo.
echo You can now launch both Backend and Frontend by double-clicking:
echo   start.bat
echo.
pause

