import urllib.request
import json

try:
    url = "http://127.0.0.1:3000/auth/login"
    payload = {
        "email": "karthikmb77@gmail.com",
        "password": "Srikar@0417"
    }
    data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(req) as response:
        print(f"Status Code: {response.status}")
        print(f"Response Body: {response.read().decode('utf-8')}")
except Exception as e:
    # Print more details about the error
    print(f"Error making request: {e}")
    if hasattr(e, 'read'):
        print(f"Error Response Body: {e.read().decode('utf-8')}")

print("\nChecking dependencies:")
try:
    import passlib
    print("passlib is installed")
except ImportError:
    print("passlib is NOT installed")

try:
    import jose
    print("jose is installed")
except ImportError:
    print("jose is NOT installed")
