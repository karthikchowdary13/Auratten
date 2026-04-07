import sys
import os
import json
import urllib.request
import urllib.error

sys.path.append(os.getcwd())

from database import SessionLocal
from models.section import Section
from models.user import User
from utils.auth import create_access_token

def do_request(url, method="POST", data=None, headers=None):
    if data:
        data = json.dumps(data).encode('utf-8')
    req = urllib.request.Request(url, data=data, method=method)
    if headers:
        for k, v in headers.items():
            req.add_header(k, v)
    req.add_header("Content-Type", "application/json")
    try:
        with urllib.request.urlopen(req) as response:
            return response.status, json.loads(response.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        body = e.read().decode('utf-8')
        try:
            return e.code, json.loads(body)
        except json.JSONDecodeError:
            return e.code, body

def test_qr():
    db = SessionLocal()

    teacher = db.query(User).filter(User.role == "teacher").first()
    teacher_token = create_access_token({"sub": teacher.email, "role": teacher.role})
    headers = {"Authorization": f"Bearer {teacher_token}"}

    section = db.query(Section).first()
    print("Testing for section:", section.name)

    base_url = "http://localhost:3000"

    status, session_data = do_request(f"{base_url}/qr/", data={
        "institutionId": "auratten_main", 
        "sectionId": str(section.id), 
        "expiresInMinutes": 60
    }, headers=headers)
    
    print("CREATE SESSION response:", status, session_data)
    
    qr_token = session_data.get("token")
    if not qr_token:
        qr_token = session_data.get("session", {}).get("token")

    email_pattern = f"student_{section.name.split('-')[0].lower()}%"
    student = db.query(User).filter(User.email.ilike(email_pattern)).first()
    
    if not student:
        print("No student found via ILIKE search, getting arbitrary student linked to section")
        from models.section import SectionStudent
        sec_st = db.query(SectionStudent).filter(SectionStudent.section_id == section.id).first()
        student = db.query(User).filter(User.id == sec_st.user_id).first()

    student_token = create_access_token({"sub": student.email, "role": student.role})
    student_headers = {"Authorization": f"Bearer {student_token}"}

    status2, result2 = do_request(f"{base_url}/attendance/mark-qr", data={"token": qr_token}, headers=student_headers)
    print("MARK ATTENDANCE response:", status2, result2)

if __name__ == "__main__":
    test_qr()
