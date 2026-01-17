"""
Dashboard routes for admin panel
Provides endpoints for dashboard statistics and candidate data
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict, Any

from core.database import get_db
from core.models import User, Candidate
from core.auth import require_admin

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/stats")
async def get_dashboard_stats(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Get dashboard statistics for admin
    Only accessible by admins
    """
    # Total candidates count
    total_candidates = db.query(Candidate).count()
    
    # Candidates with completed applications
    active_candidates = db.query(Candidate).filter(
        Candidate.application_completed == True
    ).count()
    
    # Calculate average score from completed interviews (round 3)
    avg_score_result = db.query(func.avg(Candidate.round_3_score)).filter(
        Candidate.round_3_score.isnot(None)
    ).scalar()
    avg_score = round(avg_score_result) if avg_score_result else 0
    
    # Count of candidates with any interview progress
    candidates_interviewed = db.query(Candidate).filter(
        Candidate.current_round > 0
    ).count()
    
    return {
        "total_interviews": candidates_interviewed,
        "active_candidates": active_candidates,
        "avg_score": avg_score,
        "total_candidates": total_candidates
    }


@router.get("/candidates")
async def get_recent_candidates(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
    limit: int = 10
):
    """
    Get recent candidates with their interview status
    Only accessible by admins
    """
    candidates = db.query(Candidate).join(User).order_by(
        Candidate.updated_at.desc()
    ).limit(limit).all()
    
    result = []
    for candidate in candidates:
        # Determine status based on current round and scores
        status = "registered"
        if candidate.current_round == 0:
            status = "registered"
        elif candidate.current_round < 3:
            status = "in_progress"
        elif candidate.current_round == 3 and candidate.round_3_score is not None:
            status = "completed"
        else:
            status = "pending"
        
        # Calculate overall score if interview is completed
        overall_score = None
        if candidate.round_3_score is not None:
            overall_score = candidate.round_3_score
        
        result.append({
            "id": candidate.id,
            "candidateName": candidate.full_name or candidate.user.name or candidate.user.email.split('@')[0],
            "email": candidate.user.email,
            "role": candidate.role_applied_for or "Not specified",
            "status": status,
            "score": overall_score,
            "currentRound": candidate.current_round,
            "round1Score": candidate.round_1_score,
            "round2Score": candidate.round_2_score,
            "round3Score": candidate.round_3_score,
            "applicationDate": candidate.application_date.isoformat() if candidate.application_date else None,
            "updatedAt": candidate.updated_at.isoformat() if candidate.updated_at else None
        })
    
    return result
