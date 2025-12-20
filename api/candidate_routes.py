from fastapi import APIRouter, UploadFile, File, Form, HTTPException
import shutil
from pathlib import Path
from typing import Optional
import os

from core.resume_service import extract_text_from_pdf, screen_resume
from core.notification_service import initialize_candidate, verify_otp, get_candidates_db, advance_candidate
from core.config import DOCUMENTS_DIR

router = APIRouter(prefix="/candidates", tags=["Candidates"])

@router.post("/apply")
async def apply(
    fullName: str = Form(...),
    email: str = Form(...),
    role: str = Form(...),
    resume: UploadFile = File(...)
):
    """
    Handle candidate application:
    1. Save resume
    2. Screen resume using LLM
    3. If suitable, initialize candidate and send OTP email
    """
    # Save the resume temporarily
    resume_path = DOCUMENTS_DIR / f"{email}_resume.pdf"
    with open(resume_path, "wb") as buffer:
        shutil.copyfileobj(resume.file, buffer)
    
    # Extract text and screen
    text = extract_text_from_pdf(resume_path)
    is_suitable = screen_resume(text, role)
    
    if is_suitable:
        candidate_data = initialize_candidate(email, fullName, role)
        return {
            "status": "success",
            "message": "Resume shortlisted! An OTP has been sent to your email.",
            "data": {
                "email": email,
                "name": fullName,
                "role": role,
                "shortlisted": True
            }
        }
    else:
        return {
            "status": "rejected",
            "message": "Unfortunately, your resume does not match our current requirements for this role.",
            "shortlisted": False
        }

@router.post("/verify-otp")
async def verify_candidate_otp(email: str = Form(...), otp: str = Form(...)):
    success, message = verify_otp(email, otp)
    if success:
        return {"status": "success", "message": message}
    else:
        raise HTTPException(status_code=400, detail=message)

@router.get("/status/{email}")
async def get_status(email: str):
    db = get_candidates_db()
    if email in db:
        return db[email]
    else:
        raise HTTPException(status_code=404, detail="Candidate not found")

@router.post("/complete-round")
async def complete_round(email: str = Form(...)):
    """Mark the current round as completed and trigger next OTP"""
    candidate = advance_candidate(email)
    if candidate:
        return {"status": "success", "message": "Round completed. Next OTP sent.", "candidate": candidate}
    else:
        raise HTTPException(status_code=404, detail="Candidate not found or error advancing")
