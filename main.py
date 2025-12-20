"""
AI Hiring Manager - Main Entry Point
This is the launcher for the FastAPI application.

For development: python main.py
For production: See deployment guides in docs/DEPLOYMENT.md
"""
import uvicorn
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

if __name__ == "__main__":
    print("=" * 60)
    print("🚀 Starting AI Hiring Manager Server")
    print("=" * 60)
    print(f"📍 Server: http://0.0.0.0:8000")
    print(f"📚 API Docs: http://0.0.0.0:8000/docs")
    print(f"🎤 Interview UI: file://{os.getcwd()}/frontend.html")
    print("=" * 60)
    print("\nPress Ctrl+C to stop\n")
    
    # Start the server
    uvicorn.run(
        "api.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
