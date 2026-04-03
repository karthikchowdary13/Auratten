from database import engine
from sqlalchemy import text
import sys

def test_db():
    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1")).fetchone()
            print(f"Database connection successful: {result[0]}")
    except Exception as e:
        print(f"Database connection failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    test_db()
