import psycopg2
from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

def fix_db():
    try:
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()
        
        # Add status column to attendance table if it doesn't exist
        print("Checking for 'status' column in 'attendance' table...")
        cur.execute("""
            ALTER TABLE attendance 
            ADD COLUMN IF NOT EXISTS status VARCHAR DEFAULT 'PRESENT';
        """)
        
        conn.commit()
        print("Success: 'status' column verified/added.")
        
        cur.close()
        conn.close()
    except Exception as e:
        print(f"Error fixing database: {e}")

if __name__ == "__main__":
    fix_db()
