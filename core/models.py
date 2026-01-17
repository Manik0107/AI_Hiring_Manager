"""
Database models for authentication and candidate management
"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Float
from sqlalchemy.orm import relationship
from datetime import datetime
from core.database import Base

class User(Base):
    """
    User model for authentication
    Stores login credentials for both admins and candidates
    """
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=True)  # User's display name
    password_hash = Column(String, nullable=False)
    role = Column(String, nullable=False)  # "admin" or "candidate"
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationship to candidate (if role is candidate)
    candidate = relationship("Candidate", back_populates="user", uselist=False)


class Admin(Base):
    """
    Admin model
    Stores additional admin information
    """
    __tablename__ = "admins"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    name = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User")


class Candidate(Base):
    """
    Candidate model for application data
    Linked to User model via user_id
    """
    __tablename__ = "candidates"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    full_name = Column(String)
    role_applied_for = Column(String)  # e.g., "Software Engineer"
    resume_path = Column(String)
    application_date = Column(DateTime, default=datetime.utcnow)
    application_completed = Column(Boolean, default=False)
    
    # Interview progress
    current_round = Column(Integer, default=0)  # 0 = not started, 1-3 = rounds
    round_1_score = Column(Integer, nullable=True)  # Aptitude score (out of 5)
    round_2_score = Column(Integer, nullable=True)  # DSA score (out of 5)
    round_3_score = Column(Integer, nullable=True)  # Voice interview score (0-100)
    round_3_analysis = Column(Text, nullable=True)  # JSON string with detailed feedback
    overall_analysis = Column(Text, nullable=True)  # Comprehensive analysis from all rounds (admin-only)
    
    # Status tracking
    overall_status = Column(
        String, 
        default="registered"
    )  # registered, applied, in_progress, completed, rejected
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Re-attempt fields
    can_reattempt = Column(Boolean, default=False)
    current_attempt_number = Column(Integer, default=1)
    
    # Relationships
    user = relationship("User", back_populates="candidate")
    attempts = relationship("CandidateAttempt", back_populates="candidate", cascade="all, delete-orphan")


class CandidateAttempt(Base):
    """
    Candidate Attempt model to store historical attempt data
    Each time a candidate re-attempts, their previous scores are archived here
    """
    __tablename__ = "candidate_attempts"
    
    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id"), nullable=False)
    attempt_number = Column(Integer, nullable=False)
    
    # Snapshot of scores from this attempt
    round_1_score = Column(Integer, nullable=True)
    round_2_score = Column(Integer, nullable=True)
    round_3_score = Column(Float, nullable=True)
    round_3_analysis = Column(Text, nullable=True)
    overall_score = Column(Float, nullable=True)
    
    # Attempt metadata
    overall_status = Column(String, nullable=True)
    overall_analysis = Column(Text, nullable=True)
    recommendation = Column(String, nullable=True)
    
    # Timestamps
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    
    # Relationship
    candidate = relationship("Candidate", back_populates="attempts")

