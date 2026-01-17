"""
Script to seed initial admin user
Run this once to create the admin account
"""
from core.database import SessionLocal, init_db
from core.models import User, Admin
from core.auth import hash_password

def seed_admin():
    """
    Create initial admin user if it doesn't exist
    """
    # Initialize database first
    init_db()
    
    db = SessionLocal()
    
    try:
        # Check if admin already exists
        admin_email = "manikmanavenddra@gmail.com"
        existing_user = db.query(User).filter(User.email == admin_email).first()
        
        if existing_user:
            print(f"Admin user {admin_email} already exists")
            return
        
        # Create admin user
        admin_user = User(
            email=admin_email,
            name="Admin",  # Proper name for admin
            password_hash=hash_password("admin123"),
            role="admin"
        )
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        
        # Create admin profile
        admin_profile = Admin(
            user_id=admin_user.id,
            name="Admin"
        )
        db.add(admin_profile)
        db.commit()
        
        print(f"✓ Admin user created successfully: {admin_email}")
        print(f"✓ Default password: admin123")
        print(f"✓ Please change the password after first login")
        
    except Exception as e:
        print(f"Error creating admin user: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    seed_admin()
