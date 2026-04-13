from database import engine
from sqlalchemy import text

def list_users_full():
    with engine.connect() as conn:
        result = conn.execute(text("SELECT id, email, password, role FROM users"))
        users = result.fetchall()
        for u in users:
            print(f"ID={u[0]}, Email={u[1]}, PassLen={len(u[2]) if u[2] else 0}, Role={u[3]}")

if __name__ == "__main__":
    list_users_full()
