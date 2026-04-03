from database import engine
from sqlalchemy import text

def list_users():
    with engine.connect() as conn:
        result = conn.execute(text("SELECT id, name, email, role FROM users"))
        users = result.fetchall()
        if users:
            print("Users in database:")
            for user in users:
                print(f"ID={user[0]}, Name={user[1]}, Email={user[2]}, Role={user[3]}")
        else:
            print("No users found in database.")

if __name__ == "__main__":
    list_users()
