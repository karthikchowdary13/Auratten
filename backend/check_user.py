from database import engine
from sqlalchemy import text

def check_user():
    with engine.connect() as conn:
        result = conn.execute(text("SELECT email, password, role FROM users WHERE email='karthikmb77@gmail.com'"))
        user = result.fetchone()
        if user:
            print(f"User found: Email={user[0]}, Role={user[2]}")
            print(f"Password Hash: {user[1]}")
        else:
            print("User NOT found in database.")

if __name__ == "__main__":
    check_user()
