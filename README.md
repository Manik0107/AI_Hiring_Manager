# Speech-to-Speech HR Interviewer

A real-time speech-to-speech AI interviewer built with FastAPI, Groq API, and Edge-TTS.

## Features

- 🎤 **Speech-to-Speech**: Real-time voice conversation with AI interviewer
- 🚀 **Fast & Free**: Uses Groq API (free tier) for transcription and LLM
- 🎯 **Structured Interview**: Technical + Behavioral questions with scoring
- 📊 **Automatic Scoring**: Real-time evaluation and final score
- 🌐 **Web-based**: Works in any modern browser

## Tech Stack

- **Backend**: FastAPI + WebSockets
- **STT**: Groq Whisper API (free, fast)
- **LLM**: Groq Llama 3.1 70B via Agno wrapper (free, 80+ tokens/sec)
- **TTS**: Edge-TTS (free, high quality)
- **Frontend**: Vanilla JavaScript with Web Audio API

## Setup

### 1. Install Dependencies

```bash
# Install Python packages
pip install -r requirements.txt
```

### 2. Set Environment Variables

Create a `.env` file:

```env
GROQ_API_KEY=your_groq_api_key_here
```

Get your free Groq API key: https://console.groq.com

### 3. Test Components

```bash
# Test audio services (TTS/STT)
python test_audio.py

# Test interview agent logic
python test_interview_agent.py
```

### 4. Run the Server

```bash
# Start FastAPI server
uvicorn api.main:app --reload

# Or use the legacy launcher
python main.py
```

Server will run at: http://localhost:8000

## Usage

### Web Interface

1. Open `frontend.html` in your browser (or navigate to `/interview`)
2. Click "Start Interview"
3. Hold "Speak" button and answer questions
4. Release button when done speaking
5. Get your final score!

### API Documentation

Visit http://localhost:8000/docs for full API documentation.

### WebSocket Protocol

Connect to `ws://localhost:8000/interview/ws`

**1. Initialize:**
```json
{
  "type": "init",
  "session_id": "unique_id",
  "job_role": "Software Engineer"
}
```

**2. Send audio:**
Send binary WebSocket frames (audio chunks in WebM/MP3 format)

**3. Receive responses:**
```json
{
  "type": "interviewer_response",
  "text": "Can you tell me about your experience?",
  "audio": "base64_encoded_mp3",
  "transcript": "Your previous answer",
  "stage": "technical"
}
```

**4. End interview:**
```json
{
  "type": "end_interview"
}
```

## Interview Flow

1. **Introduction** (30s)
   - AI greets candidate
   - Explains interview format
   - Gets candidate name

2. **Technical Questions** (3 questions)
   - Technology experience
   - Problem-solving examples
   - Development practices

3. **Behavioral Questions** (2 questions)
   - Team collaboration
   - Work style
   - Career goals

4. **Conclusion** (30s)
   - Thank candidate
   - Provide final score
   - Next steps

## Scoring

- **Technical**: 60% weight
  - Relevance to question
  - Depth of knowledge
  - Examples provided

- **Behavioral**: 40% weight
  - Communication clarity
  - Professionalism
  - Self-awareness

**Final Score**: 0-100 points

## Project Structure

```
AI_Hiring_Manager/
├── api/
│   ├── main.py                 # FastAPI app
│   ├── interview_routes.py     # Interview endpoints
│   ├── websocket_handler.py    # WebSocket logic
│   └── formatter.py            # Response formatting
├── core/
│   ├── interview_agent.py      # Interview logic (Agno + Groq)
│   ├── audio_services.py       # STT/TTS services
│   ├── chatbot.py             # Original chatbot
│   └── config.py              # Configuration
├── frontend.html              # Web interface
├── test_audio.py             # Audio services test
├── test_interview_agent.py   # Agent test
└── requirements.txt          # Python dependencies
```

## Cost

**100% FREE** with Groq's free tier:
- 14,400 requests/day
- ~1,000 interviews/day possible
- No credit card required

## Performance

**Latency**: ~1-2 seconds end-to-end
- STT: 200-400ms (Groq Whisper)
- LLM: 500-1000ms (Llama 3.1 70B)
- TTS: 300-600ms (Edge-TTS)

## Troubleshooting

### No GROQ_API_KEY
```bash
# Add to .env file
GROQ_API_KEY=gsk_...
```

### WebSocket connection failed
```bash
# Make sure server is running
uvicorn api.main:app --reload
```

### Microphone not working
- Allow microphone access in browser
- Use HTTPS or localhost only
- Check browser console for errors

## Next Steps

- [ ] Add question customization
- [ ] Support multiple languages
- [ ] Improve scoring algorithm with LLM evaluation
- [ ] Add video support
- [ ] Create mobile app version

## License

See LICENSE file for details.
