"""
Chatbot module - handles agent and knowledge base initialization
"""
import os
from dotenv import load_dotenv
from agno.agent import Agent
from agno.knowledge.knowledge import Knowledge
from agno.vectordb.qdrant import Qdrant
from agno.models.openrouter import OpenRouter
from agno.models.groq import Groq
from agno.knowledge.embedder.google import GeminiEmbedder
from core.config import MODEL_NAME, COLLECTION_NAME, DATA_DIR, DOCUMENTS_DIR, MODEL_PROVIDER

# Load environment variables
load_dotenv()

# Initialize components lazily
_agent = None
_knowledge_base = None

def get_agent():
    global _agent, _knowledge_base
    if _agent is None:
        # Load environment variables
        load_dotenv()
        
        # Initialize vector database with Gemini embeddings
        vector_db = Qdrant(
            collection=COLLECTION_NAME,
            path=str(DATA_DIR),
            embedder=GeminiEmbedder(),
        )
        
        # Create knowledge base
        _knowledge_base = Knowledge(
            vector_db=vector_db,
        )
        
        # Initialize agent with selected model provider
        model = Groq(id=MODEL_NAME) if MODEL_PROVIDER == "groq" else OpenRouter(MODEL_NAME)
        
        _agent = Agent(
            model=model,
            knowledge=_knowledge_base,
            search_knowledge=True,  # Enable knowledge base search
            add_history_to_context=True,  # Enable conversation memory
            num_history_runs=5,  # Keep last 5 conversation turns
            debug_mode=False,
            markdown=False,
        )
    return _agent

def get_knowledge_base():
    if _agent is None:
        get_agent()
    return _knowledge_base

def load_documents():
    """Load all PDF documents from the documents directory into the knowledge base"""
    pdf_files = list(DOCUMENTS_DIR.glob("*.pdf"))
    
    if not pdf_files:
        print(f"No PDF files found in {DOCUMENTS_DIR}")
        return
    
    kb = get_knowledge_base()
    for pdf_file in pdf_files:
        try:
            print(f"Loading {pdf_file.name}...")
            kb.add_content(path=str(pdf_file))
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
        agent = get_agent()
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
