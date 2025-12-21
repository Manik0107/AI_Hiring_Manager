import os
from pypdf import PdfReader
from agno.agent import Agent
from agno.models.openrouter import OpenRouter
from agno.models.groq import Groq
from core.config import MODEL_NAME, MODEL_PROVIDER

def extract_text_from_pdf(pdf_path):
    """Extract text from a PDF file"""
    try:
        reader = PdfReader(pdf_path)
        text = ""
        for page in reader.pages:
            text += page.extract_text()
        return text
    except Exception as e:
        print(f"Error extracting PDF: {e}")
        return ""

def screen_resume(resume_text: str, job_role: str) -> bool:
    """
    Screen a resume against a job role using LLM.
    Returns True if suitable (LLM says 'yes'), False otherwise.
    """
    if not resume_text:
        return False

    # Initialize agent with Groq (more reliable for screening)
    model = Groq(id="llama-3.3-70b-versatile")

    screening_agent = Agent(
        model=model,
        instructions=[
            "You are an expert HR recruiter.",
            f"Your task is to determine if the candidate's resume is suitable for the role of '{job_role}'.",
            "Evaluate based on skills, experience, and education.",
            "Respond ONLY with 'yes' or 'no'. No other text, no explanation.",
        ],
        markdown=False,
    )

    # Truncate resume if too long to avoid token issues
    max_resume_length = 2000  # characters
    truncated_resume = resume_text[:max_resume_length] if len(resume_text) > max_resume_length else resume_text
    
    prompt = f"Resume Content:\n{truncated_resume}\n\nIs this resume suitable for the role of '{job_role}'? Answer yes or no."
    
    try:
        response = screening_agent.run(prompt)
        content = ""
        if hasattr(response, 'content'):
            content = response.content.strip().lower()
        elif isinstance(response, str):
            content = response.strip().lower()
        else:
            content = str(response).strip().lower()
            
        print(f"Screening response for {job_role}: {content}")
        return "yes" in content
    except Exception as e:
        print(f"Error screening resume: {e}")
        return False
