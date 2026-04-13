from database import SessionLocal
from models.user import User
from utils.auth import get_password_hash

def restore_user():
    db = SessionLocal()
    email = "2320030408@klh.edu.in"
    user = db.query(User).filter(User.email == email).first()
    if not user:
        print(f"Restoring user: {email}")
        user = User(
            name="KLH Student",
            email=email,
            password=get_password_hash("password123"), # Temporary password
            role="STUDENT",
            status="ACTIVE",
            institution_id="auratten_main"
        )
        db.add(user)
        db.commit()
        print("User restored and activated.")
    else:
        print("User already exists, ensuring ACTIVE status.")
        user.status = "ACTIVE"
        db.commit()
    db.close()

if __name__ == "__main__":
    restore_user()
