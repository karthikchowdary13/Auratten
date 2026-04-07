from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from config import settings

from routes import auth, sections, users, qr
from database import engine, Base, SessionLocal
import models.user 
import models.section
import models.qr_session
import models.attendance

# create database tables if they don't exist
Base.metadata.create_all(bind=engine)

# initialization to ensure 3 sections and 120 students exist
def initialize_data():
    db = SessionLocal()
    try:
        from models.user import User
        from models.section import Section, SectionStudent
        from utils.auth import get_password_hash
        
        # 1. Lowercase existing emails
        users = db.query(User).all()
        for u in users:
            if u.email and u.email != u.email.lower():
                u.email = u.email.lower().strip()
        db.commit()

        # 2. Seed 3 sections x 40 students if roster is empty
        institution_id = "auratten_main"
        if db.query(User).filter(User.role == "student").count() < 100:
            print("Seeding requested 120 students across 3 sections...")
            password = get_password_hash("password123")
            section_names = ["CS-101", "CS-102", "CS-103"]
            
            for s_name in section_names:
                # Get or create section
                section = db.query(Section).filter(Section.name == s_name).first()
                if not section:
                    section = Section(name=s_name, institution_id=institution_id)
                    db.add(section)
                    db.commit()
                    db.refresh(section)
                
                # Create 40 students
                for i in range(1, 41):
                    email = f"student_{s_name.lower()}_{i}@auratten.io"
                    name = f"Student {i} ({s_name})"
                    
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
                        db.add(SectionStudent(section_id=section.id, user_id=user.id))
            db.commit()
            print("Seeding complete.")
    except Exception as e:
        print(f"Initialization error: {e}")
    finally:
        db.close()

initialize_data()

# init our fastapi app
app = FastAPI(
    title="Auratten API",
    description="QR Attendance Platform API",
    version="0.1.0-beta",
    docs_url="/docs",
    redoc_url="/redoc",
    redirect_slashes=True
)

# cors setup (Top level)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3001", 
        "http://127.0.0.1:3001",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://auratten.vercel.app",
        "https://auratten-next.vercel.app",
    ],
    allow_origin_regex=r"https://auratten-.*\.vercel\.app", # Allow all Vercel preview deployments
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# compress responses
app.add_middleware(GZipMiddleware, minimum_size=1000)

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    import traceback
    error_msg = f"Global Exception Hook: {str(exc)}"
    print(error_msg)
    print(traceback.format_exc())
    from fastapi.responses import JSONResponse
    
    # Dynamically allow the requester's origin if it's in our allowed list
    origin = request.headers.get("origin")
    
    return JSONResponse(
        status_code=500,
        content={"message": "An internal server error occurred", "detail": str(exc), "error": "InternalServerError"},
        headers={
            "Access-Control-Allow-Origin": origin if origin else "*",
            "Access-Control-Allow-Credentials": "true"
        }
    )

# register routers
from routes import auth, sections, users, qr, attendance, dashboard, reports
# ...
app.include_router(auth.router)
app.include_router(sections.router)
app.include_router(users.router)
app.include_router(qr.router)
app.include_router(attendance.router)
app.include_router(dashboard.router)
app.include_router(reports.router)

@app.get("/health")
def health_check():
    # basic health check to see if api is alive
    return {"status": "ok"}

@app.get("/")
def home():
    # root endpoint with welcome message
    return {"message": "Welcome to Auratten API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=3000, reload=True)
