from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.supabase_client import supabase

router = APIRouter()


class StudentCreate(BaseModel):
    name: str
    reg_no: str
    dob: str
    year_of_study: str
    branch: str
    phone: str
    email: str
    hostel_room_no: str
    parent_name: str
    parent_phone: str
    parent_address: str


@router.get("")
def get_all_students():
    """Return all students ordered by creation date (admin only)."""
    res = (
        supabase.table("students")
        .select("*")
        .order("created_at", desc=True)
        .execute()
    )
    return res.data


@router.post("", status_code=201)
def add_student(body: StudentCreate):
    """Add a new student (admin only)."""
    try:
        res = supabase.table("students").insert(body.model_dump()).execute()
        if not res.data:
            raise HTTPException(status_code=400, detail="Failed to add student")

        student = res.data[0]
        # Return auto-generated credentials so the frontend can display them
        from datetime import date
        dob = date.fromisoformat(student["dob"])
        password = dob.strftime("%Y%m%d")

        return {
            "student": student,
            "credentials": {"username": student["reg_no"], "password": password},
        }
    except Exception as e:
        error_str = str(e)
        if "23505" in error_str:
            raise HTTPException(
                status_code=409,
                detail="A student with this registration number or email already exists",
            )
        raise HTTPException(status_code=400, detail=error_str)
