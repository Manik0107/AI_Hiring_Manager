# Core configuration settings
import os
from pathlib import Path

# Base directory
BASE_DIR = Path(__file__).parent.parent

# Environment variables
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

# Email configuration
SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SENDER_EMAIL = os.getenv("SENDER_EMAIL", "manikmanavenddra@gmail.com")
GMAIL_APP_PASSWORD = os.getenv("GMAIL_APP_PASSWORD")
RESEND_API_KEY = os.getenv("RESEND_API_KEY")

# Model settings
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

# Default model selection - use OpenRouter for higher token limits
MODEL_NAME = os.getenv("MODEL_NAME", "google/gemini-3-flash-preview")
MODEL_PROVIDER = "openrouter"
COLLECTION_NAME = "hiring-manager-knowledge"

# Paths
DATA_DIR = BASE_DIR / "data"
DOCUMENTS_DIR = BASE_DIR / "documents"

# Ensure directories exist
DATA_DIR.mkdir(exist_ok=True)
DOCUMENTS_DIR.mkdir(exist_ok=True)
