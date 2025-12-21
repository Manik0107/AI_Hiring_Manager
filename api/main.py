"""
FastAPI application for AI Hiring Manager chatbot
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import os
import sys
import logging
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging to suppress agno library warnings
logging.getLogger("agno").setLevel(logging.ERROR)
logging.getLogger("qdrant_client").setLevel(logging.ERROR)

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from core.chatbot import get_response, load_documents
from api.formatter import format_response
from api.interview_routes import router as interview_router
from api.candidate_routes import router as candidate_router

# Initialize FastAPI app
app = FastAPI(
    title="AI Hiring Manager API",
    description="Professional chatbot API with knowledge base integration and speech-to-speech interviews",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add CORS middleware to allow frontend connections
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(interview_router)
app.include_router(candidate_router)

# Pydantic models for request/response
class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "message": "What is a ReLU function?",
                "session_id": "user123"
            }
        }

class ChatResponse(BaseModel):
    response: str
    formatted_response: str
    
    class Config:
        json_schema_extra = {
            "example": {
                "response": "The ReLU function is...",
                "formatted_response": "The ReLU function is..."
            }
        }

class HealthResponse(BaseModel):
    status: str
    message: str

# Startup event to load documents
@app.on_event("startup")
async def startup_event():
    """Load documents into knowledge base on startup"""
    print("Starting AI Hiring Manager API...")
    print("Loading documents into knowledge base...")
    load_documents()
    print("API ready!")

# Health check endpoint
@app.get("/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    """
    Health check endpoint to verify API is running
    """
    return HealthResponse(
        status="healthy",
        message="AI Hiring Manager API is running"
    )

# Chat endpoint
@app.post("/chat", response_model=ChatResponse, tags=["Chat"])
async def chat(request: ChatRequest):
    """
    Send a message to the chatbot and receive a formatted response
    
    - **message**: The user's question or message
    - **session_id**: Optional session identifier for tracking conversations
    
    Returns a clean, professionally formatted response without emojis or special symbols.
    """
    if not request.message or not request.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")
    
    try:
        # Get session ID or use message hash as fallback
        session_id = request.session_id if request.session_id else "default"
        
        # Get response from agent with session tracking
        raw_response = get_response(request.message, session_id=session_id)
        
        # Format the response
        formatted = format_response(raw_response)
        
        return ChatResponse(
            response=raw_response,
            formatted_response=formatted
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error processing request: {str(e)}"
        )

# Root endpoint
@app.get("/", tags=["Info"])
async def root():
    """
    Root endpoint with API information
    """
    return {
        "name": "AI Hiring Manager API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health",
        "chat": "/chat"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api.main:app", host="0.0.0.0", port=8000, reload=True)
