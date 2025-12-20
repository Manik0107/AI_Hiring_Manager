"""
Audio services for speech-to-text and text-to-speech using Groq and Edge-TTS
"""
import os
import asyncio
import tempfile
from pathlib import Path
from typing import AsyncGenerator
import edge_tts
from groq import Groq


class SpeechToTextService:
    """Speech-to-Text using Groq Whisper API"""
    
    def __init__(self, api_key: str = None):
        """
        Initialize STT service
        
        Args:
            api_key: Groq API key (reads from env if not provided)
        """
        self.api_key = api_key or os.getenv("GROQ_API_KEY")
        if not self.api_key:
            raise ValueError("GROQ_API_KEY not found in environment")
        
        self.client = Groq(api_key=self.api_key)
        self.model = "whisper-large-v3"
    
    def transcribe_audio(self, audio_file_path: str) -> str:
        """
        Transcribe audio file to text
        
        Args:
            audio_file_path: Path to audio file
            
        Returns:
            Transcribed text
        """
        try:
            with open(audio_file_path, "rb") as audio_file:
                transcription = self.client.audio.transcriptions.create(
                    file=(Path(audio_file_path).name, audio_file.read()),
                    model=self.model,
                    response_format="json",
                    language="en",
                )
            
            return transcription.text
        
        except Exception as e:
            print(f"Error in transcription: {e}")
            return ""
    
    async def transcribe_audio_async(self, audio_file_path: str) -> str:
        """
        Async version of transcribe_audio
        
        Args:
            audio_file_path: Path to audio file
            
        Returns:
            Transcribed text
        """
        # Run sync version in thread pool
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, self.transcribe_audio, audio_file_path)


class TextToSpeechService:
    """Text-to-Speech using Edge-TTS"""
    
    def __init__(self, voice: str = "en-US-AriaNeural"):
        """
        Initialize TTS service
        
        Args:
            voice: Voice to use for synthesis
        """
        self.voice = voice
        # Available voices:
        # en-US-AriaNeural (female, professional)
        # en-US-GuyNeural (male, professional)
        # en-US-JennyNeural (female, friendly)
        # en-US-ChristopherNeural (male, warm)
    
    async def synthesize_speech(self, text: str, output_path: str = None) -> str:
        """
        Convert text to speech
        
        Args:
            text: Text to convert
            output_path: Path to save audio file (creates temp if None)
            
        Returns:
            Path to generated audio file
        """
        try:
            # Create temp file if no path provided
            if output_path is None:
                temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".mp3")
                output_path = temp_file.name
                temp_file.close()
            
            # Generate speech
            communicate = edge_tts.Communicate(text, self.voice)
            await communicate.save(output_path)
            
            return output_path
        
        except Exception as e:
            print(f"Error in TTS: {e}")
            return ""
    
    async def synthesize_speech_stream(self, text: str) -> AsyncGenerator[bytes, None]:
        """
        Stream audio synthesis (for real-time playback)
        
        Args:
            text: Text to convert
            
        Yields:
            Audio bytes chunks
        """
        try:
            communicate = edge_tts.Communicate(text, self.voice)
            async for chunk in communicate.stream():
                if chunk["type"] == "audio":
                    yield chunk["data"]
        
        except Exception as e:
            print(f"Error in TTS streaming: {e}")
    
    @staticmethod
    async def list_voices():
        """List all available voices"""
        voices = await edge_tts.list_voices()
        return voices


class AudioProcessor:
    """Combined audio processing service"""
    
    def __init__(self, groq_api_key: str = None, tts_voice: str = "en-US-AriaNeural"):
        """
        Initialize audio processor with STT and TTS
        
        Args:
            groq_api_key: Groq API key
            tts_voice: Voice for TTS
        """
        self.stt = SpeechToTextService(api_key=groq_api_key)
        self.tts = TextToSpeechService(voice=tts_voice)
    
    async def process_interview_turn(self, audio_file_path: str) -> tuple[str, str]:
        """
        Process one interview turn: audio -> text -> response -> audio
        
        Args:
            audio_file_path: Path to recorded audio
            
        Returns:
            Tuple of (transcript, response_audio_path)
        """
        # Transcribe user audio
        transcript = await self.stt.transcribe_audio_async(audio_file_path)
        
        # Note: Response generation should be done by InterviewAgent
        # This function would be called from WebSocket handler
        
        return transcript
    
    async def generate_speech_response(self, text: str, output_path: str = None) -> str:
        """
        Generate speech from text
        
        Args:
            text: Text to speak
            output_path: Where to save audio
            
        Returns:
            Path to audio file
        """
        return await self.tts.synthesize_speech(text, output_path)


# Example usage
async def test_audio_services():
    """Test the audio services"""
    processor = AudioProcessor()
    
    # Test TTS
    print("Testing TTS...")
    audio_path = await processor.tts.synthesize_speech(
        "Hello! I'm your AI interviewer. Let's begin the interview."
    )
    print(f"Audio saved to: {audio_path}")
    
    # List voices
    print("\nAvailable voices:")
    voices = await TextToSpeechService.list_voices()
    for voice in voices[:5]:  # Show first 5
        print(f"  - {voice['Name']}: {voice['Gender']}, {voice['Locale']}")


if __name__ == "__main__":
    asyncio.run(test_audio_services())
