from database import engine
from sqlalchemy import text

def check_duplicates():
    with engine.connect() as conn:
        query = text("""
            SELECT email, COUNT(*) 
            FROM users 
            GROUP BY email 
            HAVING COUNT(*) > 1
        """)
        result = conn.execute(query).fetchall()
        print(f"Exact Duplicates: {result}")
        
        query_lower = text("""
            SELECT LOWER(email), COUNT(*) 
            FROM users 
            GROUP BY LOWER(email) 
            HAVING COUNT(*) > 1
        """)
        result_lower = conn.execute(query_lower).fetchall()
        print(f"Case-Insensitive Duplicates: {result_lower}")

if __name__ == "__main__":
    check_duplicates()
