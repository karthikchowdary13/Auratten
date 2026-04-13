from database import engine
from sqlalchemy import text

def check_case():
    with engine.connect() as conn:
        query = text("SELECT email FROM users WHERE email != LOWER(email)")
        result = conn.execute(query).fetchall()
        print(f"Mixed Case Emails: {result}")

if __name__ == "__main__":
    check_case()
