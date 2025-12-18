"""
AI Hiring Manager - Main Entry Point

This file serves as the main entry point for the application.
The actual API implementation is in the api/ directory.

To run the FastAPI server:
    python main.py
    
Or use uvicorn directly:
    uv run uvicorn api.main:app --reload --port 8000
"""

if __name__ == "__main__":
    import uvicorn
    
    print("=" * 60)
    print("Starting AI Hiring Manager API Server")
    print("=" * 60)
    print("\nAPI Documentation will be available at:")
    print("  - Swagger UI: http://localhost:8000/docs")
    print("  - ReDoc:      http://localhost:8000/redoc")
    print("  - API Root:   http://localhost:8000")
    print("\nPress CTRL+C to stop the server")
    print("=" * 60)
    print()
    
    # Start the FastAPI server
    uvicorn.run(
        "api.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
