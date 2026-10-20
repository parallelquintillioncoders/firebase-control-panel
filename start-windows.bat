@echo off
setlocal
cd /d "%~dp0"
title Launchpad Firebase Control Panel v4
color 0B
echo.
echo  ====================================================
echo       LAUNCHPAD FIREBASE CONTROL PANEL v4
echo  ====================================================
echo.
where node >nul 2>&1
if errorlevel 1 (
  echo ERROR: Node.js is missing. Install Node.js 20+ from https://nodejs.org/
  pause
  exit /b 1
)
if not exist "node_modules\firebase-tools\package.json" (
  echo First-time setup: installing dashboard + Firebase CLI locally...
  echo Internet is needed for this first installation only.
  call npm install --no-audit --no-fund
  if errorlevel 1 (
    echo ERROR: npm install failed. Check your internet connection, then retry.
    pause
    exit /b 1
  )
)
if not exist "node_modules\express\package.json" (
  call npm install --no-audit --no-fund
  if errorlevel 1 (pause & exit /b 1)
)
if not exist "node_modules\adm-zip\package.json" (
  call npm install --no-audit --no-fund
  if errorlevel 1 (pause & exit /b 1)
)
if not exist "node_modules\multer\package.json" (
  call npm install --no-audit --no-fund
  if errorlevel 1 (pause & exit /b 1)
)
echo [*] Local Firebase CLI ready. No global PATH setup needed.
echo [*] Opening Dashboard: http://127.0.0.1:4183 ...
echo [*] Keep this window open for background deployments.
echo.
set "LAUNCHPAD_AUTO_OPEN=1"
node server\index.js
if errorlevel 1 echo Dashboard server stopped with an error.
pause
