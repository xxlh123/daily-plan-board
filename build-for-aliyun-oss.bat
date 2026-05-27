@echo off
setlocal

cd /d "%~dp0"

if not exist "node_modules" (
  echo Installing dependencies...
  call npm.cmd install
)

echo Building production files for Aliyun OSS...
call npm.cmd run build

echo.
echo Done. Upload everything inside the "dist" folder to your OSS bucket root.
echo Local folder:
echo %~dp0dist
echo.
pause

endlocal
