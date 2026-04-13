from database import SessionLocal
from models.user import User
from utils.auth import verify_password, get_password_hash

def check_admin():
    db = SessionLocal()
    admin = db.query(User).filter(User.email == "admin@auratten.com").first()
    if admin:
        print(f"Found user: {admin.email}")
        print(f"Role: {admin.role}")
        print(f"Status: {admin.status}")
        
        test_pass = "admin123"
        is_match = verify_password(test_pass, admin.password)
        print(f"Password 'admin123' matches: {is_match}")
    else:
        print("User admin@auratten.com not found!")
    db.close()

if __name__ == "__main__":
    check_admin()
