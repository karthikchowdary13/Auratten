import sys
import os

# add current dir to path
sys.path.append(os.getcwd())

from database import SessionLocal, Base, engine
from models.user import User
from models.section import Section, SectionStudent
from models.qr_session import Session as QRSession
from models.attendance import Attendance
from utils.auth import get_password_hash
from datetime import datetime, timedelta

def seed():
    print("Dropping all tables to reset schema...")
    Base.metadata.drop_all(bind=engine)
    print("Creating all tables...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        print("Creating teacher: karthikmb77@gmail.com / Srikar@0417")
        teacher = User(
            name="Karthik Chowdary",
            email="karthikmb77@gmail.com",
            password=get_password_hash("Srikar@0417"),
            role="teacher",
            institution_id="auratten_main"
        )
        db.add(teacher)
        db.commit()

        print("Creating 3 sections...")
        sections = [
            Section(name="Grade 10 - Mathematics"),
            Section(name="Grade 12 - Physics"),
            Section(name="Grade 11 - Computing")
        ]
        db.add_all(sections)
        db.commit()
        for s in sections: db.refresh(s)
        
        print("Creating 120 students (40 per section)...")
        for idx, s in enumerate(sections):
            students_for_section = []
            for i in range(1, 41):
                email = f"student_{idx+1}_{i}@auratten.io"
                student = User(
                    name=f"Student {idx+1}.{i}",
                    email=email,
                    password=get_password_hash("password123"),
                    role="student",
                    institution_id="auratten_main"
                )
                students_for_section.append(student)
            
            db.add_all(students_for_section)
            db.commit()
            
            # map to section
            for st in students_for_section:
                mapping = SectionStudent(section_id=s.id, user_id=st.id)
                db.add(mapping)
            db.commit()
            print(f"Created 40 students and mappings for {s.name}")
        
        print("Seeding complete!")
    except Exception as e:
        print(f"Error during seeding: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed()
