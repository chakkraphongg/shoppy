@echo off
title DEKROYSHOP - Local Web Server
echo ========================================================
echo        DEKROYSHOP - Web Server Launcher
echo ========================================================
echo.
echo Starting local web server at http://localhost:8080 ...
echo Press Ctrl+C anytime to stop the server.
echo.

if exist "C:\xampp\php\php.exe" (
    start http://localhost:8080/index.html
    "C:\xampp\php\php.exe" -S localhost:8080
) else (
    where php >nul 2>nul
    if %errorlevel% equ 0 (
        start http://localhost:8080/index.html
        php -S localhost:8080
    ) else (
        where python >nul 2>nul
        if %errorlevel% equ 0 (
            start http://localhost:8080/index.html
            python -m http.server 8080
        ) else (
            echo [!] PHP or Python not detected in PATH.
            echo Opening index.html directly...
            start index.html
            pause
        )
    )
)
