import requests

BASE_URL = "http://localhost:3000/auth"

def test_refresh_flow():
    # 1. Login to get initial tokens
    print("Testing Login...")
    login_res = requests.post(f"{BASE_URL}/login", json={
        "email": "karthikmb77@gmail.com",
        "password": "Srikar@0417"
    })
    
    if login_res.status_code != 200:
        print(f"Login failed: {login_res.text}")
        return
        
    data = login_res.json()
    refresh_token = data["refreshToken"]
    print(f"Got Refresh Token: {refresh_token[:10]}...")
    
    # 2. Test Refresh
    print("\nTesting Refresh...")
    refresh_res = requests.post(f"{BASE_URL}/refresh", json={
        "refreshToken": refresh_token
    })
    
    if refresh_res.status_code == 200:
        new_data = refresh_res.json()
        print("SUCCESS: Got new access token!")
        print(f"New Access Token: {new_data['accessToken'][:10]}...")
    else:
        print(f"Refresh failed: {refresh_res.status_code}")
        print(refresh_res.text)

if __name__ == "__main__":
    test_refresh_flow()
