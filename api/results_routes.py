"""
Interview results routes
Provides detailed interview results for candidates
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from core.database import get_db
from core.models import User, Candidate
from core.auth import require_admin, get_current_user

router = APIRouter(prefix="/interview", tags=["Interview Results"])


@router.get("/{candidate_id}/results")
async def get_interview_results(
    candidate_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get detailed interview results for a candidate
    Accessible by admins or the candidate themselves
    """
    # Fetch candidate
    candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    
    # Check authorization - admin or the candidate themselves
    if current_user.role != "admin" and candidate.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view these results")
    
    # Get user info
    user = db.query(User).filter(User.id == candidate.user_id).first()
    
    # Calculate round percentages
    round_1_percentage = (candidate.round_1_score * 20) if candidate.round_1_score else None  # Out of 5 -> percentage
    round_2_percentage = (candidate.round_2_score * 20) if candidate.round_2_score else None  # Out of 5 -> percentage
    round_3_percentage = candidate.round_3_score  # Already a percentage
    
    # Calculate overall score
    scores = []
    if round_1_percentage is not None:
        scores.append(round_1_percentage)
    if round_2_percentage is not None:
        scores.append(round_2_percentage)
    if round_3_percentage is not None:
        scores.append(round_3_percentage)
    
    overall_score = round(sum(scores) / len(scores)) if scores else None
    
    # Determine recommendation
    recommendation = None
    if overall_score:
        if overall_score >= 70:
            recommendation = "Recommended to Hire"
        elif overall_score >= 50:
            recommendation = "Consider for Next Steps"
        else:
            recommendation = "Not Recommended"
    
    return {
        "candidate_id": candidate.id,
        "candidate_name": candidate.full_name or user.name or user.email.split('@')[0],
        "email": user.email,
        "role": candidate.role_applied_for or "Not specified",
        "application_date": candidate.application_date.isoformat() if candidate.application_date else None,
        "current_round": candidate.current_round,
        "overall_status": candidate.overall_status,
        "overall_score": overall_score,
        "recommendation": recommendation,
        "can_reattempt": candidate.can_reattempt,
        "current_attempt_number": candidate.current_attempt_number,
        "rounds": {
            "round_1": {
                "title": "Aptitude Test",
                "score": round_1_percentage,
                "raw_score": candidate.round_1_score,
                "total_questions": 5,
                "passed": candidate.round_1_score >= 3 if candidate.round_1_score else None,
                "status": "completed" if candidate.round_1_score is not None else "not_started"
            },
            "round_2": {
                "title": "DSA Assessment",
                "score": round_2_percentage,
                "raw_score": candidate.round_2_score,
                "total_questions": 5,
                "passed": candidate.round_2_score >= 3 if candidate.round_2_score else None,
                "status": "completed" if candidate.round_2_score is not None else "not_started"
            },
            "round_3": {
                "title": "Voice Interview",
                "score": round_3_percentage,
                "analysis": candidate.round_3_analysis,
                "passed": candidate.round_3_score >= 60 if candidate.round_3_score else None,
                "status": "completed" if candidate.round_3_score is not None else "not_started"
            }
        }
    }
