@echo off
setlocal
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is not available. Please install Node.js first.
  pause
  exit /b 1
)

start "Yuli Studio server" /b node server.js
timeout /t 1 /nobreak >nul
start "" "http://127.0.0.1:4173/"

echo Yuli Studio is running at http://127.0.0.1:4173/
echo Keep this window open while previewing the site.
pause
