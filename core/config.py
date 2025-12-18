# Core configuration settings
import os
from pathlib import Path

# Base directory
BASE_DIR = Path(__file__).parent.parent

# Environment variables
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

# Model settings
MODEL_NAME = "google/gemini-2.5-flash"
COLLECTION_NAME = "hiring-manager-knowledge"

# Paths
DATA_DIR = BASE_DIR / "data"
DOCUMENTS_DIR = BASE_DIR / "documents"

# Ensure directories exist
DATA_DIR.mkdir(exist_ok=True)
DOCUMENTS_DIR.mkdir(exist_ok=True)
