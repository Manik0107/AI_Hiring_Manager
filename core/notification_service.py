import random
import string
import json
from pathlib import Path
from core.config import DATA_DIR

CANDIDATES_FILE = DATA_DIR / "candidates.json"

def get_candidates_db():
    if not CANDIDATES_FILE.exists():
        with open(CANDIDATES_FILE, 'w') as f:
            json.dump({}, f)
        return {}
    
    try:
        with open(CANDIDATES_FILE, 'r') as f:
            return json.load(f)
    except Exception:
        return {}

def save_candidate(email, data):
    db = get_candidates_db()
    db[email] = data
    with open(CANDIDATES_FILE, 'w') as f:
        json.dump(db, f, indent=4)

def generate_otp(length=6):
    """Generate a random numeric OTP"""
    return ''.join(random.choices(string.digits, k=length))

def send_otp_email(email, otp, round_name):
    """
    Mock function to send OTP via email.
    In a real app, this would use an SMTP server or email API like SendGrid.
    """
    print(f"\n" + "="*50)
    print(f"📧 EMAIL SENT TO: {email}")
    print(f"Subject: Action Required for your {round_name} - AI Hiring Manager")
    print(f"Body: Hello! You have been moved to the next round: {round_name}.")
    print(f"Your OTP for this round is: {otp}")
    print(f"Please use this OTP to proceed.")
    print("="*50 + "\n")
    
    # Return true to simulate success
    return True

def initialize_candidate(email, name, role):
    """Initialize a new candidate after resume screening success"""
    otp = generate_otp()
    candidate_data = {
        "email": email,
        "name": name,
        "role": role,
        "current_round": "Resume Screening", # Already passed
        "next_round": "Aptitude Round",
        "otp": otp,
        "otp_verified": False,
        "status": "Shortlisted",
        "rounds": {
            "Resume Screening": {"status": "Passed", "date": "2023-10-01"},
            "Aptitude Round": {"status": "Pending", "otp": otp},
            "DSA Round": {"status": "Locked"},
            "HR Interview": {"status": "Locked"}
        }
    }
    save_candidate(email, candidate_data)
    send_otp_email(email, otp, "Aptitude Round")
    return candidate_data

def verify_otp(email, user_otp):
    db = get_candidates_db()
    if email not in db:
        return False, "Candidate not found"
    
    candidate = db[email]
    
    # Get current pending round
    current_round = candidate.get("next_round")
    round_info = candidate["rounds"].get(current_round)
    
    if not round_info or round_info.get("status") != "Pending":
        return False, "No pending OTP for this round"
    
    if round_info.get("otp") == user_otp:
        # Success! Mark round as Ready
        round_info["status"] = "Verified"
        candidate["otp_verified"] = True
        save_candidate(email, candidate)
        return True, "OTP Verified successfully"
    else:
        return False, "Invalid OTP"

def advance_candidate(email):
    """Call this when a round is completed to generate next OTP"""
    db = get_candidates_db()
    if email not in db:
        return None
    
    candidate = db[email]
    rounds_order = ["Resume Screening", "Aptitude Round", "DSA Round", "HR Interview"]
    current_round = candidate["next_round"]
    
    try:
        curr_idx = rounds_order.index(current_round)
        # Mark current round as Passed
        candidate["rounds"][current_round]["status"] = "Passed"
        
        if curr_idx + 1 < len(rounds_order):
            next_round = rounds_order[curr_idx + 1]
            candidate["next_round"] = next_round
            
            # Generate new OTP for next round
            new_otp = generate_otp()
            candidate["rounds"][next_round] = {
                "status": "Pending",
                "otp": new_otp
            }
            candidate["otp_verified"] = False
            save_candidate(email, candidate)
            send_otp_email(email, new_otp, next_round)
            return candidate
        else:
            candidate["status"] = "Completed"
            candidate["next_round"] = "Done"
            save_candidate(email, candidate)
            return candidate
    except ValueError:
        return None
