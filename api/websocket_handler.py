"""
WebSocket handler for real-time speech-to-speech interview
"""
import os
import asyncio
import tempfile
import json
import base64
from pathlib import Path
from fastapi import WebSocket, WebSocketDisconnect
from typing import Dict
import sys

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from core.interview_agent import InterviewAgent
from core.audio_services import AudioProcessor
from core.database import SessionLocal
from core.models import Candidate, User
from core.auth import verify_token
from api.logger import logger


class InterviewSession:
    """Manages a single interview session"""
    
    def __init__(self, session_id: str, job_role: str = "Software Engineer"):
        """
        Initialize interview session
        
        Args:
            session_id: Unique session identifier
            job_role: Role being interviewed for
        """
        self.session_id = session_id
        self.job_role = job_role
        self.agent = InterviewAgent(job_role=job_role)
        self.audio_processor = AudioProcessor()
        self.is_active = True
        self.conversation_log = []
    
    async def start_interview(self) -> str:
        """
        Start the interview and get introduction audio
        
        Returns:
            Path to introduction audio file
        """
        # Get introduction text from agent
        intro_text = self.agent.get_introduction()
        
        # Log conversation
        self.conversation_log.append({
            "role": "interviewer",
            "text": intro_text,
            "stage": "introduction"
        })
        
        # Generate speech
        audio_path = await self.audio_processor.generate_speech_response(intro_text)
        
        return audio_path, intro_text
    
    async def process_candidate_audio(self, audio_data: bytes) -> tuple[str, str]:
        """
        Process candidate's audio response
        
        Args:
            audio_data: Raw audio bytes
            
        Returns:
            Tuple of (response_audio_path, response_text)
        """
        # Save audio to temp file
        temp_audio = tempfile.NamedTemporaryFile(delete=False, suffix=".webm")
        temp_audio.write(audio_data)
        temp_audio.close()
        
        try:
            # Transcribe audio
            transcript = await self.audio_processor.stt.transcribe_audio_async(temp_audio.name)
            
            # Log candidate response
            self.conversation_log.append({
                "role": "candidate",
                "text": transcript,
                "stage": str(self.agent.state.stage)
            })
            
            # Get agent response
            response_text = self.agent.process_candidate_response(transcript)
            
            # Log interviewer response
            self.conversation_log.append({
                "role": "interviewer",
                "text": response_text,
                "stage": str(self.agent.state.stage)
            })
            
            # Generate speech response
            response_audio_path = await self.audio_processor.generate_speech_response(response_text)
            
            return response_audio_path, response_text, transcript
        
        finally:
            # Clean up temp file
            try:
                os.unlink(temp_audio.name)
            except:
                pass
    
    def get_interview_summary(self) -> Dict:
        """Get final interview summary with scores"""
        scores = self.agent.get_final_score()
        
        return {
            "session_id": self.session_id,
            "candidate_name": self.agent.state.candidate_name,
            "job_role": self.job_role,
            "scores": scores,
            "total_questions": len(self.agent.state.responses),
            "conversation_log": self.conversation_log,
            "stage": str(self.agent.state.stage)
        }


class WebSocketManager:
    """Manages WebSocket connections and interview sessions"""
    
    def __init__(self):
        self.active_sessions: Dict[str, InterviewSession] = {}
    
    async def handle_interview_connection(self, websocket: WebSocket):
        """
        Handle WebSocket connection for interview
        
        Args:
            websocket: WebSocket connection
        """
        await websocket.accept()
        
        session_id = None
        
        try:
            # Wait for initialization message
            init_message = await websocket.receive_json()
            
            if init_message.get("type") != "init":
                await websocket.send_json({
                    "type": "error",
                    "message": "Expected init message"
                })
                return
            
            # Create new session
            session_id = init_message.get("session_id", f"session_{id(websocket)}")
            job_role = init_message.get("job_role", "Software Engineer")
            
            session = InterviewSession(session_id, job_role)
            
            # Try to get user ID from token if provided
            token = init_message.get("token")
            if token:
                try:
                    payload = verify_token(token)
                    session.user_id = payload.get("user_id")
                except Exception as e:
                    logger.error(f"Could not decode token: {e}")
                    session.user_id = None
            else:
                session.user_id = None
            
            self.active_sessions[session_id] = session
            
            # Start interview
            intro_audio_path, intro_text = await session.start_interview()
            
            # Read audio file and send
            with open(intro_audio_path, "rb") as f:
                audio_bytes = f.read()
            
            # Send introduction
            await websocket.send_json({
                "type": "interviewer_response",
                "text": intro_text,
                "audio": base64.b64encode(audio_bytes).decode('utf-8'),
                "stage": "introduction"
            })
            
            # Clean up intro audio with proper error handling
            await asyncio.sleep(0.5)  # Give time for file to be fully released
            try:
                if os.path.exists(intro_audio_path):
                    os.unlink(intro_audio_path)
            except Exception as e:
                logger.warning(f"Warning: Could not delete intro audio file: {e}")
                # Don't crash on cleanup errors
            
            # Main interview loop
            while session.is_active:
                # Receive message from client
                message = await websocket.receive()
                
                if "text" in message:
                    # Text message (control messages)
                    data = json.loads(message["text"])
                    
                    if data.get("type") == "end_interview":
                        session.is_active = False
                        summary = session.get_interview_summary()
                        await websocket.send_json({
                            "type": "interview_complete",
                            "summary": summary
                        })
                        break
                
                elif "bytes" in message:
                    # Audio data from candidate
                    audio_data = message["bytes"]
                    
                    # Send processing status
                    await websocket.send_json({
                        "type": "status",
                        "message": "Processing your response..."
                    })
                    
                    # Process audio
                    response_audio_path, response_text, transcript = await session.process_candidate_audio(audio_data)
                    
                    # FIRST: Send candidate's transcript (fix ordering bug)
                    await websocket.send_json({
                        "type": "candidate_transcript",
                        "transcript": transcript,
                        "stage": str(session.agent.state.stage)
                    })
                    
                    # THEN: Read and send AI response
                    with open(response_audio_path, "rb") as f:
                        response_audio_bytes = f.read()
                    
                    # Send AI response
                    await websocket.send_json({
                        "type": "interviewer_response",
                        "text": response_text,
                        "audio": base64.b64encode(response_audio_bytes).decode('utf-8'),
                        "stage": str(session.agent.state.stage)
                    })
                    
                    # Clean up audio file with proper error handling
                    await asyncio.sleep(0.5)  # Give time for file to be fully released
                    try:
                        if os.path.exists(response_audio_path):
                            os.unlink(response_audio_path)
                    except Exception as e:
                        logger.warning(f"Warning: Could not delete response audio file: {e}")
                        # Don't crash on cleanup errors
                    
                    # Check if interview is complete
                    if session.agent.state.stage.value == "conclusion":
                        session.is_active = False
                        summary = session.get_interview_summary()
                        
                        # Save Round 3 score to database
                        try:
                            # Get token from init message (we'll need to store it)
                            if hasattr(session, 'user_id') and session.user_id:
                                db = SessionLocal()
                                try:
                                    candidate = db.query(Candidate).filter(
                                        Candidate.user_id == session.user_id
                                    ).first()
                                    
                                    if candidate:
                                        # Calculate overall score from the summary
                                        scores = summary.get('scores', {})
                                        logger.debug(f"DEBUG: Full interview summary: {json.dumps(summary, indent=2)}")
                                        logger.debug(f"DEBUG: Scores object: {scores}")
                                        
                                        # Try different possible score keys
                                        overall_score = 0
                                        
                                        # Method 1: Direct overall/overall_score key
                                        if 'overall' in scores:
                                            overall_score = scores['overall']
                                        elif 'overall_score' in scores:
                                            overall_score = scores['overall_score']
                                        # Method 2: Calculate from component scores
                                        elif isinstance(scores, dict) and len(scores) > 0:
                                            # Extract numeric scores
                                            numeric_scores = []
                                            for key, value in scores.items():
                                                if isinstance(value, (int, float)) and value >= 0:
                                                    numeric_scores.append(value)
                                            
                                            if numeric_scores:
                                                overall_score = sum(numeric_scores) / len(numeric_scores)
                                                print(f"DEBUG: Calculated from components: {numeric_scores} → {overall_score}")
                                        
                                        # Ensure score is in valid range
                                        overall_score = max(0, min(100, overall_score))
                                        
                                        logger.debug(f"DEBUG: Final overall score to save: {overall_score}")
                                        
                                        # Save Round 3 score
                                        candidate.round_3_score = int(overall_score)
                                        candidate.round_3_analysis = json.dumps(scores)
                                        candidate.current_round = 3
                                        candidate.overall_status = "completed"
                                        
                                        db.commit()
                                    logger.info(f"✅ Saved Round 3 score: {overall_score}% for candidate {candidate.id}")
                                except Exception as db_error:
                                    logger.error(f"❌ Database error saving score: {db_error}")
                                    import traceback
                                    logger.error(traceback.format_exc())
                                    db.rollback()
                                finally:
                                    db.close()
                        except Exception as e:
                            logger.error(f"❌ Error saving interview score: {e}")
                            import traceback
                            logger.error(traceback.format_exc())
                        
                        # Wait for final audio to finish playing before sending complete message
                        # This prevents the thank you message from being cut off
                        await asyncio.sleep(2)
                        
                        await websocket.send_json({
                            "type": "interview_complete",
                            "summary": summary
                        })
                        break
        
        except WebSocketDisconnect:
            logger.info(f"WebSocket disconnected: {session_id}")
        
        except Exception as e:
            logger.error(f"Error in WebSocket handler: {e}")
            import traceback
            logger.error(traceback.format_exc())
            # Only send error if WebSocket is still open
            try:
                if websocket.client_state.value == 1:  # CONNECTED state
                    await websocket.send_json({
                        "type": "error",
                        "message": str(e)
                    })
            except:
                logger.error("Could not send error message, WebSocket already closed")
        
        finally:
            # Clean up session
            if session_id and session_id in self.active_sessions:
                del self.active_sessions[session_id]


# Global manager instance
websocket_manager = WebSocketManager()


async def interview_websocket_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint for interviews
    
    Usage from client:
    1. Connect to WebSocket
    2. Send init message: {"type": "init", "session_id": "...", "job_role": "..."}
    3. Receive introduction audio
    4. Send audio chunks as binary data
    5. Receive responses as JSON with audio
    6. Send {"type": "end_interview"} to end
    """
    await websocket_manager.handle_interview_connection(websocket)
