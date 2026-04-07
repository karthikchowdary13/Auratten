import sys
import os
import requests

def test_login():
    res = requests.post("http://localhost:3000/auth/login", json={
        "email": "karthikmb77@gmail.com",
        "password": "password123"
    })
    
    # if karthikmb77@gmail.com fails because Srikar@0417, try different one:
    if res.status_code != 200:
        res = requests.post("http://localhost:3000/auth/login", json={
            "email": "karthikmb77@gmail.com",
            "password": "Srikar@0417"
        })
        
    print(res.status_code)
    print(res.text)

if __name__ == "__main__":
    test_login()
