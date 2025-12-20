# 🎯 Enterprise AI Hiring Manager

A full-stack, automated recruitment system featuring **AI Resume Screening**, **OTP-secured rounds**, **Interactive Skill Assessments**, and a **Real-time Speech-to-Speech HR Interviewer**.

## 🚀 Key Features

*   🤖 **AI Resume Screening**: Automatically evaluates resumes against job roles using LLMs with a binary suitability classifier.
*   🔐 **OTP-Secured Journey**: Every recruitment stage (Aptitude, DSA, HR Interview) is protected by a unique OTP sent via simulated email.
*   📝 **Interactive Skill Quizzes**:
    *   **Aptitude Round**: 5-question logic/math assessment.
    *   **DSA Round**: 5-question technical assessment on Core Data Structures & Algorithms.
    *   **Passing Criteria**: Candidates must score 3/5 to trigger the next stage.
*   🎤 **AI HR Interview**: Real-time speech-to-speech interaction powered by **Groq Llama 3.3**, **Whisper**, and **Edge-TTS**.
*   📊 **Candidate Analytics**: Automatic evaluation of technical and behavioral proficiency with visual score reports.
*   🌟 **Empathic Rejection**: Human-centric feedback for candidates who don't meet the threshold, maintaining a positive employer brand.

## 🛠️ Tech Stack

### Backend
*   **FastAPI**: High-performance asynchronous API framework.
*   **Agno (Agentic AI)**: Orchestrating LLM agents for screening and interviewing.
*   **Groq / OpenRouter**: High-speed LLM inference (Llama 3.3 70B).
*   **Qdrant**: Vector database for AI knowledge base integration.
*   **Pypdf**: Resume text extraction.

### Frontend
*   **React (Vite)**: Modern, responsive frontend architecture.
*   **Vanilla CSS**: Premium dark-mode aesthetics with glassmorphism.
*   **Web Audio API**: Handling real-time audio streams for speech interviews.

## 📁 Project Structure

```bash
AI_Hiring_Manager/
├── api/
│   ├── candidate_routes.py    # Application, OTP, and Stage management
│   ├── interview_routes.py    # WebSocket interaction
│   └── main.py                # FastAPI entry point
├── core/
│   ├── resume_service.py      # LLM-based resume screening
│   ├── notification_service.py # OTP generation and simulated delivery
│   ├── interview_agent.py     # HR Interviewer logic
│   └── audio_services.py      # STT and TTS engines
├── gcc-hiring-frontend/       # React application
│   ├── src/pages/ApplyPage.jsx     # AI Screening initiation
│   ├── src/pages/ProfilePage.jsx   # Candidate Journey & OTP Verify
│   ├── src/pages/QuizGateway.jsx   # Multi-round Skill Assessments
│   └── src/pages/InterviewPage.jsx # Speech-to-Speech UI
└── data/                      # Local JSON persistence (Mock Database)
```

## ⚙️ Setup & Installation

### 1. Prerequisites
*   Python 3.10+
*   Node.js & npm

### 2. Backend Setup
```bash
# Clone the repository
git clone <repo-url>
cd AI_Hiring_Manager

# Create and activate virtual environment
uv venv
source .venv/bin/activate

# Install dependencies
uv pip install -r requirements.txt

# Configure .env
cp .env.example .env # Add your GOOGLE_API_KEY, OPENROUTER_API_KEY, or GROQ_API_KEY
```

### 3. Frontend Setup
```bash
cd gcc-hiring-frontend
npm install
```

## 🏃 Running the Application

### Start Backend
```bash
# From root
uv run python api/main.py
```

### Start Frontend
```bash
# From gcc-hiring-frontend
npm run dev
```

## 🧪 Recruitment Workflow

1.  **Apply**: Candidate submits resume. AI screens for role suitability (e.g., Software Dev, AI & ML).
2.  **Verify**: If shortlisted, check the terminal console for the **Aptitude OTP**.
3.  **Aptitude Round**: Verify OTP in Profile, then complete the 5-question logic quiz.
4.  **DSA Round**: Upon passing Aptitude, a new **DSA OTP** is generated. Clear the technical quiz.
5.  **HR Interview**: The final stage is a real-time voice conversation with the AI HR Manager.
6.  **Results**: Receive a full Proficiency Summary and next steps.

## 📜 License
MIT License. See [LICENSE](LICENSE) for details.
