from database import engine
from sqlalchemy import text

def add_missing_columns():
    try:
        with engine.connect() as conn:
            print("Checking for mobile_number column...")
            conn.execute(text('ALTER TABLE users ADD COLUMN IF NOT EXISTS mobile_number VARCHAR;'))
            conn.commit()
            print("Database schema updated successfully.")
    except Exception as e:
        print(f"Error updating database: {e}")

if __name__ == "__main__":
    add_missing_columns()
