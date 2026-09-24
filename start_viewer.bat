@echo off
title PDF Document Viewer - splt_organized.pdf
echo =======================================================
echo   PDF Document Viewer
echo   splt_organized.pdf
echo =======================================================
echo.
echo Opening viewer in your browser...
echo.

:: Check if python is available to start a local server
python --version >nul 2>&1
if %errorlevel% equ 0 (
    echo Starting local web server on port 8080...
    start "" http://localhost:8080
    python -m http.server 8080
) else (
    echo Opening index.html directly...
    start "" "index.html"
)
pause
