"""
Database migration script to add re-attempt functionality
Adds can_reattempt and current_attempt_number columns to candidates table
Creates candidate_attempts table for storing attempt history
"""
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from core.database import engine, Base
from core.models import Candidate, CandidateAttempt

def migrate_database():
    """Apply migration to add re-attempt functionality"""
    print("Running re-attempt migration...")
    print(f"Database: {engine.url}")
    
    try:
        # Create all tables from models (includes new fields and CandidateAttempt table)
        print("Creating/updating database tables...")
        Base.metadata.create_all(bind=engine)
        
        print("✓ Migration completed successfully!")
        print("  - Added can_reattempt column to candidates table")
        print("  - Added current_attempt_number column to candidates table")
        print("  - Created candidate_attempts table")
        
    except Exception as e:
        print(f"Error during migration: {e}")
        raise

if __name__ == "__main__":
    migrate_database()

