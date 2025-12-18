# AI Hiring Manager

An end-to-end AI-powered hiring automation system that streamlines the entire recruitment process from resume screening to employee onboarding.

## What is AI Hiring Manager?

AI Hiring Manager is an intelligent automation platform that revolutionizes the hiring process by leveraging artificial intelligence to handle every step of recruitment. The system eliminates manual overhead and accelerates hiring decisions while maintaining high-quality candidate evaluation.

### Complete Hiring Automation

The platform automates the entire hiring lifecycle:

1. **Resume Screening & Analysis**
   - Automatically reviews and analyzes candidate resumes
   - Extracts key qualifications, skills, and experience
   - Ranks candidates based on job requirements
   - Identifies top talent instantly

2. **Candidate Evaluation**
   - Conducts AI-powered initial screenings
   - Asks relevant technical and behavioral questions
   - Evaluates responses against job criteria
   - Provides detailed candidate assessments

3. **Interview Process**
   - Schedules and conducts preliminary interviews
   - Asks contextual follow-up questions
   - Records and analyzes candidate responses
   - Generates comprehensive interview reports

4. **Decision Support**
   - Compares candidates objectively
   - Highlights strengths and potential concerns
   - Provides hiring recommendations
   - Reduces unconscious bias in selection

5. **Onboarding Automation**
   - Generates personalized onboarding plans
   - Automates documentation and paperwork
   - Schedules orientation sessions
   - Tracks onboarding progress

## How It Works

### Architecture

The system is built on a modern, scalable architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                     FastAPI Backend                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   API Layer  │  │  Core Logic  │  │   Knowledge  │      │
│  │              │  │              │  │     Base     │      │
│  │  • Routes    │  │  • Agent     │  │              │      │
│  │  • Formatter │  │  • Chatbot   │  │  • Qdrant    │      │
│  │  • Schemas   │  │  • Config    │  │  • PDFs      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    AI Processing Layer                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │    Gemini    │  │  OpenRouter  │  │   Vector DB  │      │
│  │  Embeddings  │  │    (LLM)     │  │   (Qdrant)   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

**Backend Framework:**
- **FastAPI** - High-performance async web framework
- **Uvicorn** - ASGI server for production deployment

**AI & ML:**
- **Agno** - Multi-agent AI framework for intelligent automation
- **Google Gemini** - Advanced language model via OpenRouter
- **Qdrant** - Vector database for semantic search and retrieval

**Knowledge Management:**
- **PDF Processing** - Automatic document parsing and indexing
- **Vector Embeddings** - Semantic understanding of documents
- **RAG (Retrieval-Augmented Generation)** - Context-aware responses

### How the System Processes Hiring Requests

1. **Document Ingestion**
   - HR uploads job descriptions, company policies, and hiring guidelines as PDFs
   - System automatically processes and indexes all documents
   - Creates searchable knowledge base with semantic understanding

2. **Intelligent Query Processing**
   - Receives hiring-related queries via REST API
   - Uses vector search to find relevant information from knowledge base
   - Generates contextual, accurate responses using AI

3. **Professional Response Formatting**
   - Removes unnecessary formatting and emojis
   - Structures responses with clear numbering and indentation
   - Provides actionable, to-the-point information

4. **Continuous Learning**
   - System improves with each interaction
   - Adapts to company-specific hiring practices
   - Maintains consistency across all hiring decisions

## Key Features

✅ **Fully Automated** - End-to-end hiring process automation  
✅ **AI-Powered** - Advanced language models for intelligent decision-making  
✅ **Knowledge-Based** - Learns from company documents and policies  
✅ **Scalable** - Handles multiple candidates simultaneously  
✅ **Unbiased** - Objective evaluation based on qualifications  
✅ **Fast** - Reduces hiring time from weeks to days  
✅ **API-First** - Easy integration with existing HR systems  
✅ **Professional** - Clean, formatted responses for business use

## Getting Started

### Prerequisites
- Python 3.11+
- Google API Key (for Gemini embeddings)
- OpenRouter API Key (for LLM access)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Manik0107/AI_Hiring_Manager.git
   cd AI_Hiring_Manager
   ```

2. Install dependencies:
   ```bash
   uv sync
   ```

3. Configure environment variables:
   ```bash
   # Create .env file
   GOOGLE_API_KEY=your_google_api_key
   OPENROUTER_API_KEY=your_openrouter_api_key
   ```

4. Add your hiring documents:
   ```bash
   # Place PDF files in documents/ directory
   cp your_hiring_policies.pdf documents/
   ```

5. Start the server:
   ```bash
   python main.py
   ```

The API will be available at:
- **Swagger UI**: http://localhost:8000/docs
- **API Root**: http://localhost:8000

## API Usage

### Chat Endpoint

Send hiring-related queries to the AI:

```bash
POST /chat
{
  "message": "What qualifications should we look for in a senior developer?",
  "session_id": "hr_session_123"
}
```

Response:
```json
{
  "response": "Based on the hiring guidelines...",
  "formatted_response": "1. Technical Skills\n   - 5+ years experience...\n2. Leadership..."
}
```

### Health Check

```bash
GET /health
```

## Project Structure

```
AI_Hiring_Manager/
├── api/                  # FastAPI application
│   ├── main.py          # API endpoints & server
│   └── formatter.py     # Response formatting
├── core/                # Core business logic
│   ├── config.py        # Configuration
│   └── chatbot.py       # AI agent & knowledge base
├── documents/           # Hiring documents (PDFs)
├── data/                # Vector database (auto-generated)
├── main.py              # Application launcher
└── requirements.txt     # Dependencies
```

## License

MIT License - see LICENSE file for details

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

**Built with ❤️ to revolutionize hiring through AI automation**
