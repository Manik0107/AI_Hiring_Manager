from fastapi import APIRouter, UploadFile, File, Form, HTTPException, BackgroundTasks
import shutil
from pathlib import Path
from typing import Optional
from core.resume_service import extract_text_from_pdf, screen_resume
from core.notification_service import (
    initialize_candidate, 
    verify_otp, 
    get_candidates_db, 
    advance_candidate, 
    send_otp_email, 
    send_offer_letter_email
)
from core.config import DOCUMENTS_DIR

router = APIRouter(prefix="/candidates", tags=["Candidates"])

@router.post("/apply")
async def apply(
    background_tasks: BackgroundTasks,
    fullName: str = Form(...),
    email: str = Form(...),
    role: str = Form(...),
    resume: UploadFile = File(...)
):
    """
    Handle candidate application:
    1. Save resume
    2. Screen resume using LLM
    3. If suitable, initialize candidate and send OTP email in background
    """
    # Save the resume temporarily
    resume_path = DOCUMENTS_DIR / f"{email}_resume.pdf"
    with open(resume_path, "wb") as buffer:
        shutil.copyfileobj(resume.file, buffer)
    
    # Extract text and screen
    text = extract_text_from_pdf(resume_path)
    is_suitable = screen_resume(text, role)
    
    if is_suitable:
        candidate_data, otp = initialize_candidate(email, fullName, role)
        # Send email in background to speed up response
        background_tasks.add_task(send_otp_email, email, otp, "Aptitude Round")
        
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
async def complete_round(background_tasks: BackgroundTasks, email: str = Form(...)):
    """Mark the current round as completed and trigger next steps in background"""
    result = advance_candidate(email)
    if result:
        candidate, next_otp, next_round = result
        
        if next_otp and next_round:
            # Send next round OTP in background
            background_tasks.add_task(send_otp_email, email, next_otp, next_round)
            return {"status": "success", "message": f"Round completed. OTP for {next_round} sent in background.", "candidate": candidate}
        else:
            # All rounds completed - send offer letter in background
            background_tasks.add_task(
                send_offer_letter_email, 
                email, 
                candidate.get("name", "Candidate"), 
                candidate.get("role", "the position")
            )
            return {"status": "success", "message": "All rounds completed! Offer letter sent in background.", "candidate": candidate}
    else:
        raise HTTPException(status_code=404, detail="Candidate not found or error advancing")
