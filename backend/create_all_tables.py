from database import engine, Base
import models.user
import models.section
import models.qr_session
import models.attendance
import models.institution
import models.audit_log
import models.settings
import models.fraud_log

def create_tables():
    print("Creating all tables if they don't exist...")
    Base.metadata.create_all(bind=engine)
    print("Table creation complete.")

if __name__ == "__main__":
    create_tables()
