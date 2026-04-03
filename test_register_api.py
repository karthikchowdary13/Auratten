import requests
import json

url = "http://127.0.0.1:3000/auth/register"
payload = {
    "name": "Karthik Chowdary",
    "email": "karthikchowdary1315@gmail.com",
    "password": "password123", # User didn't give password but I'll use a dummy one
    "role": "STUDENT",
    "mobileNumber": "8790339472"
}

response = requests.post(url, json=payload)
print(f"Status: {response.status_code}")
print(f"Response: {response.text}")
