import requests
try:
    url = "http://127.0.0.1:3000/auth/login"
    payload = {
        "email": "karthikmb77@gmail.com",
        "password": "Srikar@0417"
    }
    response = requests.post(url, json=payload)
    print(f"Status Code: {response.status_code}")
    print(f"Response Body: {response.text}")
except Exception as e:
    print(f"Error making request: {e}")
