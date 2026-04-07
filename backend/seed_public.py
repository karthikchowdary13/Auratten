import requests
import json
import random

BASE_URL = "http://13.235.76.151:8000"
INSTITUTION_ID = "auratten_main"

def seed():
    print("Starting secure remote seeding...")
    
    # 1. Register a super admin
    admin_data = {
        "email": "admin@auratten.com",
        "name": "Super Admin",
        "password": "Password123",
        "role": "ADMIN",
        "mobileNumber": "0000000000",
        "institutionId": INSTITUTION_ID
    }
    requests.post(f"{BASE_URL}/auth/register", json=admin_data)
    
    # login to get token
    login_res = requests.post(f"{BASE_URL}/auth/login", json={"email": "admin@auratten.com", "password": "Password123"})
    if login_res.status_code != 200:
        print("Failed to login admin", login_res.text)
        return
    token = login_res.json()["accessToken"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # 2. Create 3 sections
    sections = ["CS-101", "CS-102", "CS-103"]
    section_ids = []
    for s_name in sections:
        res = requests.post(f"{BASE_URL}/sections", json={"institutionId": INSTITUTION_ID, "name": s_name}, headers=headers)
        if res.status_code == 200:
            section_ids.append(res.json()["id"])
            print(f"Created section {s_name} (ID: {section_ids[-1]})")
        else:
            print(f"Failed to create {s_name}", res.text)
            
    # if sections already existed, let's fetch them
    if not section_ids:
        res = requests.get(f"{BASE_URL}/sections/institution/{INSTITUTION_ID}", headers=headers)
        section_ids = [s["id"] for s in res.json()]
    
    # 3. Create 120 students and assign them
    print("Creating 120 mock students...")
    for idx in range(1, 121):
        email = f"student{idx}@auratten.com"
        s_data = {
            "email": email,
            "name": f"Mock Student {idx}",
            "password": "password123",
            "role": "STUDENT",
            "mobileNumber": f"12345{idx:05d}",
            "institutionId": INSTITUTION_ID
        }
        res = requests.post(f"{BASE_URL}/auth/register", json=s_data)
        
        if res.status_code == 200:
            user_id = res.json()["id"]
            # Assign to one of the 3 sections iteratively
            sec_idx = (idx - 1) % 3
            if sec_idx < len(section_ids):
                target_sec_id = section_ids[sec_idx]
                requests.post(f"{BASE_URL}/sections/{target_sec_id}/students", json={"userId": user_id, "role": "STUDENT"}, headers=headers)
        
        if idx % 20 == 0:
            print(f"...Created {idx} students")
            
    print("Remote Seeding successfully completed!")
    
if __name__ == "__main__":
    seed()
