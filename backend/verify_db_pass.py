from sqlalchemy import create_engine, text
from passlib.context import CryptContext

DB_URL = "postgresql://postgres:srikar1315@localhost:5432/auratten_db"
engine = create_engine(DB_URL)
pwd_context = CryptContext(schemes=["pbkdf2_sha256", "bcrypt"], deprecated="auto")

def check_password(email, password):
    with engine.connect() as conn:
        result = conn.execute(text("SELECT password FROM users WHERE email = :email"), {"email": email}).fetchone()
        if result:
            hashed = result[0]
            print(f"Hashed password in DB: {hashed}")
            is_valid = pwd_context.verify(password, hashed)
            print(f"Password '{password}' valid: {is_valid}")
        else:
            print(f"User {email} not found.")

if __name__ == "__main__":
    check_password("karthikmb77@gmail.com", "Srikar@0417")
