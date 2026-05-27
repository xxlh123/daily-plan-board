@echo off
setlocal

cd /d "%~dp0"

if not exist "node_modules" (
  echo Installing dependencies...
  call npm.cmd install
)

echo Starting Daily Plan Board at http://127.0.0.1:5173/
start "Daily Plan Board Server" /min "%~dp0run-daily-plan-server.bat"

ping 127.0.0.1 -n 4 >nul
start "" "http://127.0.0.1:5173/"

endlocal
