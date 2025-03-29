@echo off
REM Blackbox to XAMPP Copy Script for Windows
echo Copying project to XAMPP...

set BLACKBOX_PROJECT="C:\path\to\blackbox\project"
set XAMPP_DIR="C:\xampp\htdocs\money-transfer"

REM Create target directory if it doesn't exist
if not exist %XAMPP_DIR% (
  mkdir %XAMPP_DIR%
)

REM Copy all files
xcopy %BLACKBOX_PROJECT%\* %XAMPP_DIR% /E /H /C /I /Q /Y

echo Copy complete!
echo Please run these commands in order:
echo 1. cd C:\xampp\htdocs\money-transfer\backend
echo 2. npm install
echo 3. npm start
pause