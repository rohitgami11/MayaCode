@echo off
REM Find Node.js 20.x installation on Azure App Service
REM Run this in Kudu Console: CMD

echo Searching for Node.js installations...
echo.

echo Checking Program Files (x86):
dir "D:\Program Files (x86)\nodejs" 2>nul
if %errorlevel% == 0 (
    echo Found: D:\Program Files (x86)\nodejs
    dir "D:\Program Files (x86)\nodejs" /b
)

echo.
echo Checking Program Files:
dir "D:\Program Files\nodejs" 2>nul
if %errorlevel% == 0 (
    echo Found: D:\Program Files\nodejs
    dir "D:\Program Files\nodejs" /b
)

echo.
echo Searching entire D: drive for node.exe:
dir /s /b "D:\node.exe" 2>nul | findstr /i "20\."

echo.
echo Current node.exe location:
where node

echo.
echo Current node version:
node -v

echo.
echo WEBSITE_NODE_DEFAULT_VERSION:
echo %WEBSITE_NODE_DEFAULT_VERSION%

