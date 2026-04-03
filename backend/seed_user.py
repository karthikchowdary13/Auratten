from database import SessionLocal
from models.user import User
from utils.auth import get_password_hash

def seed_user():
    db = SessionLocal()
    try:
        # Check if user already exists (shouldn't, but good practice)
        existing = db.query(User).filter(User.email == "karthikmb77@gmail.com").first()
        if existing:
            print("User already exists.")
            return

        # Create user
        new_user = User(
            name="Karthik Chowdary",
            email="karthikmb77@gmail.com",
            mobile_number="8790339472",
            password=get_password_hash("Srikar@0417"),
            role="teacher"
        )
        db.add(new_user)
        db.commit()
        print("User Karthik Chowdary created successfully!")
    except Exception as e:
        print(f"Error seeding user: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_user()
