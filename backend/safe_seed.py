import sys
import os

sys.path.append(os.getcwd())

from database import SessionLocal, Base, engine
import models.user
import models.section
import models.qr_session
from models.user import User
from models.section import Section, SectionStudent
from utils.auth import get_password_hash

def seed():
    db = SessionLocal()
    try:
        print("Creating 3 sections...")
        s_names = ["CS-101", "Math-202", "Physics-303"]
        sections = []
        for name in s_names:
            sec = db.query(Section).filter(Section.name == name).first()
            if not sec:
                sec = Section(name=name, institution_id="auratten_main")
                db.add(sec)
            sections.append(sec)
        db.commit()
        for s in sections: db.refresh(s)
        
        print("Creating 120 students (40 per section)...")
        for idx, s in enumerate(sections):
            existing_count = db.query(SectionStudent).filter(SectionStudent.section_id == s.id).count()
            needed = 40 - existing_count
            if needed > 0:
                students_for_section = []
                for i in range(1, needed + 1):
                    email = f"student_{s.name.replace(' ', '_').lower()}_{i}@auratten.io"
                    existing_st = db.query(User).filter(User.email == email).first()
                    if not existing_st:
                        student = User(
                            name=f"Student {s.name.split('-')[0]} {i}",
                            email=email,
                            password=get_password_hash("password123"),
                            role="STUDENT",
                            institution_id="auratten_main"
                        )
                        students_for_section.append(student)
                
                if students_for_section:
                    db.add_all(students_for_section)
                    db.commit()
                    
                    for st in students_for_section:
                        mapping = SectionStudent(section_id=s.id, user_id=st.id)
                        db.add(mapping)
                    db.commit()
                print(f"Created {len(students_for_section)} students for {s.name}")
            else:
                print(f"{s.name} already has 40 students")

        print("Setting auratten_main for all users to fix UI...")
        users = db.query(User).filter(User.institution_id == None).all()
        for u in users:
            u.institution_id = "auratten_main"
        db.commit()

        print("Safe seeding complete!")
    except Exception as e:
        print(f"Error during seeding: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed()
