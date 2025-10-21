@echo off
echo ===================================
echo Binary Banner Generator - Web UI
echo ===================================
echo.

REM Check if virtual environment exists
if not exist ".venv\" (
    echo Creating virtual environment...
    python -m venv .venv
    if errorlevel 1 (
        echo Failed to create virtual environment
        pause
        exit /b 1
    )
    echo Virtual environment created
)

REM Activate virtual environment
echo Activating virtual environment...
call .venv\Scripts\activate.bat
if errorlevel 1 (
    echo Failed to activate virtual environment
    pause
    exit /b 1
)
echo Virtual environment activated

REM Install/upgrade dependencies
echo.
echo Installing dependencies...
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
if errorlevel 1 (
    echo Failed to install dependencies
    pause
    exit /b 1
)
echo Dependencies installed

REM Create necessary directories
echo.
echo Creating directories...
if not exist "uploads" mkdir uploads
if not exist "outputs" mkdir outputs
if not exist "templates" mkdir templates
if not exist "static\css" mkdir static\css
if not exist "static\js" mkdir static\js
echo Directories ready

REM Check for default mask
if not exist "finalmask.png" (
    echo.
    echo Warning: finalmask.png not found
    echo You'll need to upload a custom mask when using the app
)

REM Start the server
echo.
echo ===================================
echo Starting Flask server...
echo ===================================
echo.
echo Open http://localhost:5001 in your browser
echo Press Ctrl+C to stop the server
echo.

python app.py
pause

