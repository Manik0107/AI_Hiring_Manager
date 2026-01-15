#!/bin/bash
# Start the AI Hiring Manager server

echo "Starting AI Hiring Manager..."
echo "Server will run at: http://localhost:8000"
echo "API Docs: http://localhost:8000/docs"
echo "Press Ctrl+C to stop"
echo ""

uv run uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload
