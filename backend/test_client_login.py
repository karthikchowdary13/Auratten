from fastapi.testclient import TestClient
from main import app
import traceback

client = TestClient(app)

def test_login():
    print("Testing login with TestClient...")
    try:
        response = client.post("/auth/login", json={
            "email": "karthikmb77@gmail.com",
            "password": "Srikar@0417"
        })
        print(f"Status Code: {response.status_code}")
        print(f"Response JSON: {response.json()}")
    except Exception:
        print("--- CRASH DURING TestClient REQUEST ---")
        traceback.print_exc()

if __name__ == "__main__":
    test_login()
