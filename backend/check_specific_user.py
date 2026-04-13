from database import SessionLocal
from models.user import User

def check():
    db = SessionLocal()
    u = db.query(User).filter(User.email == "2320030408@klh.edu.in").first()
    if u:
        print(f"User: {u.email}")
        print(f"Role: {u.role}")
        print(f"Status: {u.status}")
        print(f"Password Hash: {u.password[:10]}...")
    else:
        print("User not found")
    db.close()

if __name__ == "__main__":
    check()
