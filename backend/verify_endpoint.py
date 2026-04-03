import requests

BASE_URL = "http://localhost:3000/auth"

def test_verify_password():
    # This will fail without a token, but we should see if it returns 401 instead of 405
    try:
        response = requests.post(f"{BASE_URL}/verify-password", json={"password": "test"})
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        if response.status_code == 401:
            print("SUCCESS: Endpoint exists and requires auth (expected 401).")
        elif response.status_code == 405:
            print("FAILURE: Endpoint still returns 405.")
        else:
            print(f"Unexpected status: {response.status_code}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_verify_password()
