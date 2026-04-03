import psycopg2
from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

def migrate_db():
    try:
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()
        
        # 1. Verification of attendance.status
        print("Ensuring 'status' exists on 'attendance'...")
        cur.execute("""
            ALTER TABLE attendance 
            ADD COLUMN IF NOT EXISTS status VARCHAR DEFAULT 'PRESENT';
        """)
        
        # 2. Add created_by_id to sessions
        print("Adding 'created_by_id' to 'sessions'...")
        cur.execute("""
            ALTER TABLE sessions 
            ADD COLUMN IF NOT EXISTS created_by_id INTEGER REFERENCES users(id) ON DELETE SET NULL;
        """)
        
        conn.commit()
        print("Migration successful.")
        
        cur.close()
        conn.close()
    except Exception as e:
        print(f"Error during migration: {e}")

if __name__ == "__main__":
    migrate_db()
