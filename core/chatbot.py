"""
Chatbot module - handles agent and knowledge base initialization
"""
import os
from dotenv import load_dotenv
from agno.agent import Agent
from agno.knowledge.knowledge import Knowledge
from agno.vectordb.qdrant import Qdrant
from agno.models.openrouter import OpenRouter
from agno.knowledge.embedder.google import GeminiEmbedder
from core.config import MODEL_NAME, COLLECTION_NAME, DATA_DIR, DOCUMENTS_DIR

# Load environment variables
load_dotenv()

# Initialize vector database with Gemini embeddings
vector_db = Qdrant(
    collection=COLLECTION_NAME,
    path=str(DATA_DIR),
    embedder=GeminiEmbedder(),
)

# Create knowledge base
knowledge_base = Knowledge(
    vector_db=vector_db,
)

# Initialize agent with OpenRouter
agent = Agent(
    model=OpenRouter(MODEL_NAME),
    knowledge=knowledge_base,
    debug_mode=False,  # Disable debug for clean output
    markdown=False,    # Disable markdown formatting
)

def load_documents():
    """Load all PDF documents from the documents directory into the knowledge base"""
    pdf_files = list(DOCUMENTS_DIR.glob("*.pdf"))
    
    if not pdf_files:
        print(f"No PDF files found in {DOCUMENTS_DIR}")
        return
    
    for pdf_file in pdf_files:
        try:
            print(f"Loading {pdf_file.name}...")
            knowledge_base.add_content(path=str(pdf_file))
            print(f"✓ Loaded {pdf_file.name}")
        except Exception as e:
            print(f"✗ Error loading {pdf_file.name}: {e}")

def get_response(message: str) -> str:
    """
    Get a response from the agent for the given message
    
    Args:
        message: User's question or message
        
    Returns:
        Agent's response as a string
    """
    try:
        # Get response from agent
        response = agent.run(message)
        
        # Extract the content from the response
        if hasattr(response, 'content'):
            return response.content
        elif isinstance(response, str):
            return response
        else:
            return str(response)
            
    except Exception as e:
        return f"Error: {str(e)}"
