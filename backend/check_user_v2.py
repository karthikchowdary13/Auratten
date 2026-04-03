from sqlalchemy import create_engine, text

DB_URL = "postgresql://postgres:srikar1315@localhost:5432/auratten_db"
engine = create_engine(DB_URL)

def check_user_email(email):
    with engine.connect() as conn:
        result = conn.execute(text("SELECT email FROM users WHERE email = :email"), {"email": email}).fetchone()
        if result:
            print(f"User with email {email} EXISTS in database.")
        else:
            print(f"User with email {email} DOES NOT exist in database.")

if __name__ == "__main__":
    check_user_email("karthikchowdary1315@gmail.com")
