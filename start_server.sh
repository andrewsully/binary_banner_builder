#!/bin/bash

echo "==================================="
echo "Binary Banner Generator - Web UI"
echo "==================================="
echo ""

# Check if virtual environment exists
if [ ! -d ".venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv .venv
    if [ $? -ne 0 ]; then
        echo "❌ Failed to create virtual environment"
        exit 1
    fi
    echo "✓ Virtual environment created"
fi

# Activate virtual environment
echo "Activating virtual environment..."
source .venv/bin/activate
if [ $? -ne 0 ]; then
    echo "❌ Failed to activate virtual environment"
    exit 1
fi
echo "✓ Virtual environment activated"

# Install/upgrade dependencies
echo ""
echo "Installing dependencies..."
pip install --upgrade pip
pip install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi
echo "✓ Dependencies installed"

# Create necessary directories
echo ""
echo "Creating directories..."
mkdir -p uploads outputs templates static/css static/js
echo "✓ Directories ready"

# Check for default mask
if [ ! -f "finalmask.png" ]; then
    echo ""
    echo "⚠️  Warning: finalmask.png not found"
    echo "   You'll need to upload a custom mask when using the app"
fi

# Start the server
echo ""
echo "==================================="
echo "Starting Flask server..."
echo "==================================="
echo ""
echo "🌐 Open http://localhost:5001 in your browser"
echo "   Press Ctrl+C to stop the server"
echo ""

python3 app.py

