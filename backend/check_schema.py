from database import engine
from sqlalchemy import text

def check_schema():
    with engine.connect() as conn:
        query = text("""
            SELECT column_name, data_type, character_maximum_length 
            FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name = 'password'
        """)
        result = conn.execute(query).fetchone()
        print(f"Password Column Schema: {result}")

if __name__ == "__main__":
    check_schema()
