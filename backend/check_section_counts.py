from database import SessionLocal
from models.section import Section, SectionStudent
from models.user import User

db = SessionLocal()
try:
    sections = db.query(Section).all()
    print(f"Total sections: {len(sections)}")
    for s in sections:
        students = db.query(User).join(SectionStudent).filter(SectionStudent.section_id == s.id).all()
        print(f"Section {s.id} ({s.name}) has {len(students)} students")
        if len(students) > 40:
            print(f"WARNING: Section {s.id} exceeds 40 student limit!")
finally:
    db.close()
