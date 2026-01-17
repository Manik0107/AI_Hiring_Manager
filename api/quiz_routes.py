"""
Quiz/Round completion routes
Handles quiz submissions and score updates for candidates
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List

from core.database import get_db
from core.models import User, Candidate
from core.auth import get_current_user

router = APIRouter(prefix="/quiz", tags=["Quiz"])


class QuizAnswer(BaseModel):
    question_id: int
    answer: str
    is_correct: bool


class QuizSubmission(BaseModel):
    round_number: int  # 1 for Aptitude, 2 for DSA
    answers: List[QuizAnswer]
    total_questions: int


@router.post("/submit")
async def submit_quiz(
    submission: QuizSubmission,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Submit quiz answers and update candidate record with score
    """
    # Find candidate record
    candidate = db.query(Candidate).filter(
        Candidate.user_id == current_user.id
    ).first()
    
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate record not found")
    
    # Calculate score (correct answers out of total)
    correct_answers = sum(1 for answer in submission.answers if answer.is_correct)
    score = correct_answers  # Store as number of correct answers out of 5
    
    # Update candidate record based on round
    if submission.round_number == 1:
        # Aptitude round - first round of attempt
        candidate.round_1_score = score
        candidate.current_round = 1
        passed = score >= 3  # Need 3/5 to pass
        
        # Clear re-attempt flag if they were granted access
        if candidate.can_reattempt:
            candidate.can_reattempt = False
            
    elif submission.round_number == 2:
        # DSA round
        candidate.round_2_score = score
        candidate.current_round = 2
        passed = score >= 3  # Need 3/5 to pass
    else:
        raise HTTPException(status_code=400, detail="Invalid round number")
    
    # Update status
    if passed:
        if submission.round_number < 3:
            candidate.overall_status = "in_progress"
        else:
            candidate.overall_status = "completed"
    else:
        candidate.overall_status = "rejected"
    
    db.commit()
    db.refresh(candidate)
    
    return {
        "success": True,
        "passed": passed,
        "score": score,
        "total_questions": submission.total_questions,
        "message": f"Round {submission.round_number} completed with score {score}/{submission.total_questions}",
        "candidate_status": candidate.overall_status
    }


@router.get("/status")
async def get_quiz_status(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get current quiz/interview status for logged-in candidate
    """
    candidate = db.query(Candidate).filter(
        Candidate.user_id == current_user.id
    ).first()
    
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate record not found")
    
    return {
        "current_round": candidate.current_round,
        "round_1_score": candidate.round_1_score,
        "round_2_score": candidate.round_2_score,
        "round_3_score": candidate.round_3_score,
        "overall_status": candidate.overall_status,
        "can_reattempt": candidate.can_reattempt,
        "current_attempt_number": candidate.current_attempt_number
    }
