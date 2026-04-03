from routes.auth import login
from schemas.auth import LoginRequest
from database import SessionLocal
import traceback

def manual_test():
    print("Starting manual login test...")
    db = SessionLocal()
    try:
        login_data = LoginRequest(email="karthikmb77@gmail.com", password="Srikar@0417")
        # Manually call the login function
        result = login(login_data, db)
        print(f"Login Result: {result}")
    except Exception:
        print("--- MANUAL LOGIN CRASH ---")
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    manual_test()
