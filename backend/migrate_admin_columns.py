from sqlalchemy import text
from database import engine

def migrate():
    with engine.connect() as conn:
        print("Altering 'users' table...")
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR DEFAULT 'PENDING'"))
            conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS last_active TIMESTAMP WITH TIME ZONE"))
            conn.commit()
            print("Successfully added columns to 'users' table.")
        except Exception as e:
            print(f"Error altering 'users' table: {e}")
            conn.rollback()

if __name__ == "__main__":
    migrate()
