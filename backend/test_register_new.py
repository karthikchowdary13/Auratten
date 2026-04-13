import requests
import time

BASE_URL = "http://localhost:3000/auth"

def test_register():
    email = f"test_user_{int(time.time())}@gmail.com"
    print(f"Registering {email}...")
    res = requests.post(f"{BASE_URL}/register", json={
        "name": "Test User",
        "email": email,
        "password": "Password123",
        "role": "student"
    })
    print(f"Status Code: {res.status_code}")
    print(f"Response: {res.text}")

if __name__ == "__main__":
    test_register()
