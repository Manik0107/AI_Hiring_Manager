"""
FastAPI routes for speech-to-speech interview
"""
from fastapi import APIRouter, WebSocket
from api.websocket_handler import interview_websocket_endpoint

# Create router
router = APIRouter(prefix="/interview", tags=["Interview"])


@router.websocket("/ws")
async def websocket_interview(websocket: WebSocket):
    """
    WebSocket endpoint for real-time speech-to-speech interview
    
    Protocol:
    1. Client connects and sends init message:
       {"type": "init", "session_id": "unique_id", "job_role": "Software Engineer"}
    
    2. Server sends introduction:
       {"type": "interviewer_response", "text": "...", "audio": "base64_audio", "stage": "introduction"}
    
    3. Client sends audio chunks as binary WebSocket frames
    
    4. Server responds with:
       {"type": "interviewer_response", "text": "...", "transcript": "...", "audio": "base64_audio", "stage": "..."}
    
    5. Interview ends with:
       {"type": "interview_complete", "summary": {...scores and details...}}
    """
    await interview_websocket_endpoint(websocket)


@router.get("/")
async def interview_info():
    """Get information about the interview API"""
    return {
        "name": "Speech-to-Speech HR Interview API",
        "websocket_endpoint": "/interview/ws",
        "protocol": {
            "init": {
                "type": "init",
                "session_id": "unique_session_id",
                "job_role": "Software Engineer"
            },
            "audio_format": "WebM/MP3 binary data",
            "response_format": {
                "type": "interviewer_response",
                "text": "Response text",
                "audio": "Base64 encoded MP3",
                "transcript": "What you said",
                "stage": "introduction|technical|behavioral|conclusion"
            }
        },
        "features": [
            "Real-time speech-to-speech conversation",
            "Structured interview flow (intro, technical, behavioral, conclusion)",
            "Automatic scoring and evaluation",
            "Interview summary with scores"
        ]
    }
