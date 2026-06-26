from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.supabase_client import supabase

router = APIRouter()


class LoginRequest(BaseModel):
    reg_no: str
    password: str


@router.post("/login")
def login(body: LoginRequest):
    """
    Authenticate admin or student.
    Mirrors the exact logic from the original AuthContext.tsx login function.
    """
    # 1. Try admin login (reg_no + plaintext password match)
    admin_res = (
        supabase.table("admins")
        .select("*")
        .eq("reg_no", body.reg_no)
        .eq("password", body.password)
        .execute()
    )

    if admin_res.data:
        admin = admin_res.data[0]
        return {"success": True, "userType": "admin", "user": admin}

    # 2. Try student login (reg_no + DOB-derived password)
    student_res = (
        supabase.table("students")
        .select("*")
        .eq("reg_no", body.reg_no)
        .execute()
    )

    if student_res.data:
        student = student_res.data[0]
        # Password is DOB formatted as YYYYMMDD — existing business rule
        from datetime import date
        dob = date.fromisoformat(student["dob"])
        expected_password = dob.strftime("%Y%m%d")

        if body.password == expected_password:
            return {"success": True, "userType": "student", "user": student}
        else:
            raise HTTPException(status_code=401, detail="Invalid credentials")

    raise HTTPException(status_code=401, detail="Invalid credentials")
