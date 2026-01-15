import random
import string
import json
from pathlib import Path
from core.config import DATA_DIR, RESEND_API_KEY, SENDER_EMAIL

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
    Send OTP via Resend API (bypasses SMTP port restrictions).
    """
    print(f"\nSTARTING email send task for {email}")
    print(f"Using Resend API")
    print(f"RESEND_API_KEY configured: {bool(RESEND_API_KEY)}\n")
    
    if not RESEND_API_KEY:
        print("ERROR: RESEND_API_KEY not configured in environment variables")
        return False
    
    try:
        import resend
        resend.api_key = RESEND_API_KEY
        
        print("Step 1: Building email content...")
        
        # HTML email body
        html_content = f"""
        <html>
            <head>
                <style>
                    body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                    .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                    .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                    .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
                    .otp-box {{ background: white; border: 2px dashed #667eea; padding: 20px; margin: 20px 0; text-align: center; border-radius: 8px; }}
                    .otp {{ font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 8px; }}
                    .footer {{ text-align: center; margin-top: 20px; color: #666; font-size: 12px; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>AI Hiring Manager</h1>
                        <p>You've Advanced to the Next Round!</p>
                    </div>
                    <div class="content">
                        <h2>Hello!</h2>
                        <p>Congratulations! You have been moved to the next round: <strong>{round_name}</strong>.</p>
                        
                        <div class="otp-box">
                            <p style="margin: 0; color: #666;">Your One-Time Password (OTP) is:</p>
                            <p class="otp">{otp}</p>
                        </div>
                        
                        <p>Please use this OTP to verify and proceed to the next stage of your application.</p>
                        
                        <p><strong>Important:</strong> This OTP is valid for this round only. Do not share it with anyone.</p>
                        
                        <p>Good luck!</p>
                        
                        <div class="footer">
                            <p>This is an automated message from AI Hiring Manager.<br>
                            Please do not reply to this email.</p>
                        </div>
                    </div>
                </div>
            </body>
        </html>
        """
        
        print("Step 2: Sending via Resend API...")
        
        # Use Resend's test sender (no verification needed)
        # For production: add your own domain at resend.com/domains
        sender_email = "onboarding@resend.dev"
        
        params = {
            "from": f"AI Hiring Manager <{sender_email}>",
            "to": [email],
            "subject": f"Action Required for your {round_name} - AI Hiring Manager",
            "html": html_content,
        }
        
        response = resend.Emails.send(params)
        
        print(f"\nOTP Email successfully sent to: {email}")
        print(f"Round: {round_name}")
        print(f"Resend Email ID: {response.get('id', 'N/A')}\n")
        return True
        
    except Exception as e:
        print(f"\nFailed to send OTP email to {email}")
        print(f"Error type: {type(e).__name__}")
        print(f"Error: {str(e)}\n")
        import traceback
        traceback.print_exc()
        return False

def send_offer_letter_email(email, name, role):
    """
    Send offer letter via Resend API when candidate completes all rounds.
    """
    print(f"\nSTARTING offer letter send task for {email}")
    
    if not RESEND_API_KEY:
        print("ERROR: RESEND_API_KEY not configured in environment variables")
        return False
    
    try:
        import resend
        resend.api_key = RESEND_API_KEY
        
        print("Building offer letter content...")
        
        # HTML email body
        html_content = f"""
        <html>
            <head>
                <style>
                    body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                    .container {{ max-width: 700px; margin: 0 auto; padding: 20px; background: #ffffff; }}
                    .header {{ background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; padding: 40px; text-align: center; border-radius: 10px 10px 0 0; }}
                    .content {{ background: #f9f9f9; padding: 40px; border-radius: 0 0 10px 10px; }}
                    .offer-box {{ background: white; border-left: 5px solid #11998e; padding: 25px; margin: 25px 0; border-radius: 5px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }}
                    .congratulations {{ font-size: 28px; font-weight: bold; color: #11998e; margin-bottom: 10px; }}
                    .role-title {{ font-size: 24px; color: #38ef7d; font-weight: bold; margin: 15px 0; }}
                    .details {{ margin: 20px 0; line-height: 1.8; }}
                    .footer {{ text-align: center; margin-top: 30px; padding-top: 20px; border-top: 2px solid #e0e0e0; color: #666; font-size: 13px; }}
                    .signature {{ margin-top: 30px; font-style: italic; color: #555; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1 style="margin: 0; font-size: 36px;">CONGRATULATIONS!</h1>
                        <p style="margin: 10px 0 0 0; font-size: 18px;">You've Successfully Completed All Rounds!</p>
                    </div>
                    <div class="content">
                        <div class="offer-box">
                            <p class="congratulations">Dear {name},</p>
                            
                            <p>We are thrilled to inform you that you have <strong>successfully completed all stages</strong> of our recruitment process! Your performance across the Resume Screening, Aptitude Round, DSA Round, and HR Interview has been impressive.</p>
                            
                            <p class="role-title">📋 Position: {role}</p>
                            
                            <div class="details">
                                <p><strong>Your Journey:</strong></p>
                                <ul style="line-height: 2;">
                                    <li>Resume Screening - <strong>Passed</strong></li>
                                    <li>Aptitude Round - <strong>Passed</strong></li>
                                    <li>DSA Round - <strong>Passed</strong></li>
                                    <li>HR Interview - <strong>Passed</strong></li>
                                </ul>
                            </div>
                            
                            <p><strong>Welcome to the Team!</strong></p>
                            
                            <p>We believe your skills, knowledge, and attitude make you an excellent fit for our organization. We're excited to have you join our team and contribute to our mission.</p>
                            
                            <p><strong>Next Steps:</strong></p>
                            <p>Our HR team will reach out to you within the next 2-3 business days with the formal offer letter, compensation details, and onboarding information.</p>
                            
                            <p style="margin-top: 25px;">Once again, congratulations on this achievement! We look forward to working with you.</p>
                            
                            <div class="signature">
                                <p>Best Regards,<br>
                                <strong>AI Hiring Manager Team</strong><br>
                                Talent Acquisition Department</p>
                            </div>
                        </div>
                        
                        <div class="footer">
                            <p>This is an automated message from AI Hiring Manager.<br>
                            For any queries, please contact our HR department.<br>
                            © 2024 AI Hiring Manager. All rights reserved.</p>
                        </div>
                    </div>
                </div>
            </body>
        </html>
        """
        
        print("Sending via Resend API...")
        
        # Use Resend's test sender (no verification needed)
        sender_email = "onboarding@resend.dev"
        
        params = {
            "from": f"AI Hiring Manager <{sender_email}>",
            "to": [email],
            "subject": "Congratulations! Offer Letter from AI Hiring Manager",
            "html": html_content,
        }
        
        response = resend.Emails.send(params)
        
        print(f"\nOffer Letter Email successfully sent to: {email}")
        print(f"Candidate: {name}")
        print(f"Role: {role}")
        print(f"Resend Email ID: {response.get('id', 'N/A')}\n")
        return True
        
    except Exception as e:
        print(f"\nFailed to send Offer Letter to {email}")
        print(f"Error: {str(e)}\n")
        return False

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
    # Note: send_otp_email will be called as a background task by the route
    return candidate_data, otp

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
            # Note: send_otp_email will be called as a background task
            return candidate, new_otp, next_round
        else:
            # All rounds completed
            candidate["status"] = "Completed"
            candidate["next_round"] = "Offer Letter Sent"
            save_candidate(email, candidate)
            # Note: send_offer_letter_email will be called as a background task
            return candidate, None, None
    except ValueError:
        return None
