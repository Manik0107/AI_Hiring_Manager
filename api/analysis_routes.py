"""
Analysis routes for generating candidate interview analysis
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import json
import os
from dotenv import load_dotenv

from core.database import get_db
from core.models import Candidate
from core.auth import get_current_user
from agno.agent import Agent
from agno.models.groq import Groq

load_dotenv()

router = APIRouter(prefix="/interview", tags=["Analysis"])


def generate_analysis_with_llm(candidate: Candidate) -> dict:
    """
    Generate comprehensive analysis using LLM based on all 3 rounds
    
    Args:
        candidate: Candidate object with scores and analysis
        
    Returns:
        dict with key_strengths, areas_to_improve, and summary
    """
    # Prepare input data
    round_1_score = candidate.round_1_score or 0
    round_2_score = candidate.round_2_score or 0
    round_3_score = candidate.round_3_score or 0
    
    # Parse round 3 conversation if available
    round_3_data = {}
    if candidate.round_3_analysis:
        try:
            round_3_data = json.loads(candidate.round_3_analysis)
        except:
            pass
    
    # Create LLM agent
    agent = Agent(
        name="Interview Analyst",
        model=Groq(id="llama-3.3-70b-versatile"),
        description="Generates comprehensive interview analysis",
        markdown=False,
    )
    
    # Build prompt
    prompt = f"""You are an expert HR analyst reviewing a candidate's complete interview performance.

**Candidate Performance Summary:**
- Round 1 (Aptitude Quiz): {round_1_score}/5 ({round_1_score * 20}%)
- Round 2 (DSA Quiz): {round_2_score}/5 ({round_2_score * 20}%)
- Round 3 (Voice Interview): {round_3_score}/100

**Round 3 Details:**
The candidate completed a structured voice interview with technical and behavioral questions.
Score breakdown: {json.dumps(round_3_data, indent=2)}

Based on this comprehensive data, generate a professional analysis in VALID JSON format:

{{
  "key_strengths": ["strength 1", "strength 2", "strength 3", "strength 4"],
  "areas_to_improve": ["area 1", "area 2"],
  "summary": "A 2-3 sentence professional summary of the candidate's overall performance, suitability, and recommendation."
}}

IMPORTANT:
- Provide 3-4 specific, actionable strengths
- Provide 2 constructive areas for improvement
- Keep the summary concise but comprehensive
- Return ONLY valid JSON, no other text
- Base your analysis on the scores provided
"""
    
    response = agent.run(prompt)
    response_text = response.content if hasattr(response, 'content') else str(response)
    
    # Parse JSON response
    try:
        # Try to extract JSON from response
        start = response_text.find('{')
        end = response_text.rfind('}') + 1
        if start != -1 and end > start:
            json_str = response_text[start:end]
            analysis = json.loads(json_str)
            return analysis
        else:
            raise ValueError("No JSON found in response")
    except Exception as e:
        print(f"Error parsing LLM response: {e}")
        print(f"Response: {response_text}")
        # Fallback analysis
        return {
            "key_strengths": [
                "Completed all interview rounds",
                f"Scored {round_3_score}% in the voice interview",
                "Demonstrated commitment to the process"
            ],
            "areas_to_improve": [
                "Continue building technical skills",
                "Practice articulating complex ideas"
            ],
            "summary": f"The candidate completed all three interview rounds with an overall voice interview score of {round_3_score}%. They show potential and would benefit from continued skill development."
        }


@router.get("/{candidate_id}/analysis")
async def get_candidate_analysis(
    candidate_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Get or generate comprehensive analysis for a candidate
    Admin-only endpoint
    """
    # Verify admin access
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Get candidate
    candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    
    # Check if candidate has completed all rounds
    if candidate.overall_status != "completed":
        raise HTTPException(
            status_code=400, 
            detail="Analysis only available for completed candidates"
        )
    
    # Check if analysis already exists
    if candidate.overall_analysis:
        try:
            return json.loads(candidate.overall_analysis)
        except:
            pass
    
    # Generate new analysis
    analysis = generate_analysis_with_llm(candidate)
    
    # Save to database
    candidate.overall_analysis = json.dumps(analysis)
    db.commit()
    
    return analysis
