import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from routers import auth, students, leaves, dashboard

load_dotenv()

app = FastAPI(
    title="LeaveX API",
    description="Backend API for LeaveX Hostel Leave Management System",
    version="1.0.0",
)

# CORS — restrict to frontend origin only
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in allowed_origins],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE"],
    allow_headers=["*"],
)

# Mount routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(students.router, prefix="/api/students", tags=["students"])
app.include_router(leaves.router, prefix="/api/leaves", tags=["leaves"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["dashboard"])


@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "LeaveX API"}
