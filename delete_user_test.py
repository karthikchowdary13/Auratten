import sys
import os

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from database import SessionLocal
from models.user import User

db = SessionLocal()
user = db.query(User).filter(User.email == "karthikchowdary1315@gmail.com").first()
if user:
    print(f"Deleting user: {user.email}")
    db.delete(user)
    db.commit()
    print("Deleted.")
else:
    print("User not found.")
db.close()
