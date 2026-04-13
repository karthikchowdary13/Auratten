from database import SessionLocal
from models.user import User
from models.settings import SystemSettings
from utils.auth import get_password_hash

def seed_admin():
    db = SessionLocal()
    try:
        # Seed Admin
        admin_email = "admin@auratten.com"
        admin = db.query(User).filter(User.email == admin_email).first()
        if not admin:
            print(f"Seeding super admin: {admin_email}")
            admin = User(
                name="Auratten Admin",
                email=admin_email,
                password=get_password_hash("admin123"),
                role="SUPER_ADMIN",
                status="ACTIVE"
            )
            db.add(admin)
            db.commit()
            print("Admin seeded successfully.")
        else:
            print("Admin already exists.")
            # Ensure status is ACTIVE and role is SUPER_ADMIN
            admin.status = "ACTIVE"
            admin.role = "SUPER_ADMIN"
            db.commit()
            print("Admin updated to ACTIVE/SUPER_ADMIN.")

        # Seed Settings
        if not db.query(SystemSettings).first():
            db.add(SystemSettings())
            db.commit()
            print("Default settings seeded.")
            
    except Exception as e:
        print(f"Error seeding: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_admin()
