"""
Re-attempt routes for admin to grant candidates permission to retake assessments
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
import json

from core.database import get_db
from core.models import Candidate, CandidateAttempt, User
from core.auth import get_current_user, require_admin

router = APIRouter(prefix="/admin/candidate", tags=["Re-Attempt"])


def archive_current_attempt(candidate: Candidate, db: Session):
    """
    Archive the current attempt data before starting a new attempt
    
    Args:
        candidate: The candidate whose data to archive
        db: Database session
    """
    # Calculate overall score if available
    overall_score = None
    if candidate.round_3_score is not None:
        overall_score = candidate.round_3_score
    
    # Determine recommendation based on scores
    recommendation = None
    if overall_score is not None:
        if overall_score >= 70:
            recommendation = "Recommended to Hire"
        elif overall_score >= 50:
            recommendation = "Consider for Next Steps"
        else:
            recommendation = "Not Recommended"
    
    # Create attempt record
    attempt = CandidateAttempt(
        candidate_id=candidate.id,
        attempt_number=candidate.current_attempt_number,
        round_1_score=candidate.round_1_score,
        round_2_score=candidate.round_2_score,
        round_3_score=candidate.round_3_score,
        round_3_analysis=candidate.round_3_analysis,
        overall_score=overall_score,
        overall_status=candidate.overall_status,
        overall_analysis=candidate.overall_analysis,
        recommendation=recommendation,
        started_at=candidate.updated_at,
        completed_at=datetime.utcnow() if candidate.overall_status == "completed" else None
    )
    
    db.add(attempt)
    db.commit()
    return attempt


@router.post("/{candidate_id}/grant-reattempt")
async def grant_reattempt(
    candidate_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Grant a candidate permission to re-attempt the assessment
    Archives current attempt data and resets scores
    """
    # Get candidate
    candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    
    # Archive current attempt if they have taken it
    if candidate.current_round > 0:
        archive_current_attempt(candidate, db)
    
    # Reset candidate scores and progress
    candidate.current_round = 0
    candidate.round_1_score = None
    candidate.round_2_score = None
    candidate.round_3_score = None
    candidate.round_3_analysis = None
    candidate.overall_analysis = None
    candidate.overall_status = "registered"
    
    # Increment attempt number and grant permission
    candidate.current_attempt_number += 1
    candidate.can_reattempt = True
    candidate.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(candidate)
    
    return {
        "message": "Re-attempt access granted successfully",
        "candidate_id": candidate.id,
        "candidate_name": candidate.full_name or candidate.user.name,
        "new_attempt_number": candidate.current_attempt_number,
        "can_reattempt": candidate.can_reattempt
    }


@router.delete("/{candidate_id}/revoke-reattempt")
async def revoke_reattempt(
    candidate_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Revoke re-attempt permission before candidate starts
    Admin can change their mind
    """
    candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    
    if not candidate.can_reattempt:
        raise HTTPException(status_code=400, detail="Candidate does not have re-attempt permission")
    
    if candidate.current_round > 0:
        raise HTTPException(
            status_code=400, 
            detail="Cannot revoke permission - candidate has already started the new attempt"
        )
    
    candidate.can_reattempt = False
    db.commit()
    
    return {
        "message": "Re-attempt permission revoked",
        "candidate_id": candidate.id
    }


@router.get("/{candidate_id}/attempts")
async def get_candidate_attempts(
    candidate_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Get all attempts for a specific candidate
    Returns historical attempt data
    """
    candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    
    # Get all archived attempts
    attempts = db.query(CandidateAttempt).filter(
        CandidateAttempt.candidate_id == candidate_id
    ).order_by(CandidateAttempt.attempt_number).all()
    
    result = []
    for attempt in attempts:
        # Parse analysis if available
        analysis = None
        if attempt.overall_analysis:
            try:
                analysis = json.loads(attempt.overall_analysis)
            except:
                pass
        
        result.append({
            "attempt_number": attempt.attempt_number,
            "round_1_score": attempt.round_1_score,
            "round_2_score": attempt.round_2_score,
            "round_3_score": attempt.round_3_score,
            "overall_score": attempt.overall_score,
            "overall_status": attempt.overall_status,
            "recommendation": attempt.recommendation,
            "started_at": attempt.started_at.isoformat() if attempt.started_at else None,
            "completed_at": attempt.completed_at.isoformat() if attempt.completed_at else None,
            "analysis": analysis
        })
    
    # Add current attempt if in progress or completed
    if candidate.current_round > 0 or candidate.overall_status == "completed":
        current_analysis = None
        if candidate.overall_analysis:
            try:
                current_analysis = json.loads(candidate.overall_analysis)
            except:
                pass
        
        # Calculate current overall score
        current_overall_score = None
        if candidate.round_3_score is not None:
            current_overall_score = candidate.round_3_score
        
        # Determine current recommendation
        current_recommendation = None
        if current_overall_score is not None:
            if current_overall_score >= 70:
                current_recommendation = "Recommended to Hire"
            elif current_overall_score >= 50:
                current_recommendation = "Consider for Next Steps"
            else:
                current_recommendation = "Not Recommended"
        
        result.append({
            "attempt_number": candidate.current_attempt_number,
            "round_1_score": candidate.round_1_score,
            "round_2_score": candidate.round_2_score,
            "round_3_score": candidate.round_3_score,
            "overall_score": current_overall_score,
            "overall_status": candidate.overall_status,
            "recommendation": current_recommendation,
            "started_at": candidate.updated_at.isoformat() if candidate.updated_at else None,
            "completed_at": None if candidate.overall_status != "completed" else datetime.utcnow().isoformat(),
            "analysis": current_analysis,
            "is_current": True
        })
    
    return {
        "candidate_id": candidate_id,
        "candidate_name": candidate.full_name or candidate.user.name,
        "total_attempts": len(result),
        "current_attempt_number": candidate.current_attempt_number,
        "can_reattempt": candidate.can_reattempt,
        "attempts": result
    }
