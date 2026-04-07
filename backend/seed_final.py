import sys
import os

# add parent directory to path to import database/models
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import SessionLocal
from models.user import User
from models.section import Section, SectionStudent
from utils.auth import get_password_hash

def seed_final():
    db = SessionLocal()
    try:
        # 1. Clear existing data if needed (optional, but good for clean slate)
        # We'll just add new ones to avoid deleting user's own account
        
        institution_id = "auratten_main"
        password = get_password_hash("password123")
        
        section_names = ["CS-101", "CS-102", "CS-103"]
        sections = []
        
        print("Creating 3 sections...")
        for name in section_names:
            # Check if exists
            s = db.query(Section).filter(Section.name == name).first()
            if not s:
                s = Section(name=name, institution_id=institution_id)
                db.add(s)
                db.commit()
                db.refresh(s)
            sections.append(s)
            
        print(f"Sections ready: {[s.name for s in sections]}")
        
        # 2. Create 40 students per section
        for section in sections:
            print(f"Seeding 40 students for {section.name}...")
            for i in range(1, 41):
                email = f"student_{section.name.lower()}_{i}@auratten.io"
                name = f"Student {i} ({section.name})"
                
                # Check if user exists
                user = db.query(User).filter(User.email == email).first()
                if not user:
                    user = User(
                        name=name,
                        email=email,
                        password=password,
                        role="student",
                        institution_id=institution_id
                    )
                    db.add(user)
                    db.commit()
                    db.refresh(user)
                
                # Link to section
                link = db.query(SectionStudent).filter(
                    SectionStudent.section_id == section.id,
                    SectionStudent.user_id == user.id
                ).first()
                
                if not link:
                    link = SectionStudent(section_id=section.id, user_id=user.id)
                    db.add(link)
        
        db.commit()
        print("Success! 3 sections and 120 students created and linked.")
        
    except Exception as e:
        print(f"Error during seeding: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_final()
