from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from services.supabase_client import supabase
from datetime import datetime, timezone

router = APIRouter()


class LeaveCreate(BaseModel):
    student_id: int
    leave_type: str
    start_date: str
    end_date: str
    reason: str


class LeaveStatusUpdate(BaseModel):
    status: str  # 'accepted' | 'rejected'
    user_type: str  # must be 'admin' to update status
    remarks: Optional[str] = None  # optional warden remarks


@router.get("")
def get_leaves(student_id: Optional[int] = None):
    """
    Get leaves.
    - If student_id is provided: return leaves for that student only.
    - If no student_id: return all leaves with student details (admin view).
    """
    if student_id is not None:
        res = (
            supabase.table("leaves")
            .select("*")
            .eq("student_id", student_id)
            .order("applied_at", desc=True)
            .execute()
        )
    else:
        res = (
            supabase.table("leaves")
            .select("*, students(id, name, reg_no, year_of_study, branch, hostel_room_no)")
            .order("applied_at", desc=True)
            .execute()
        )
    return res.data


@router.post("", status_code=201)
def apply_leave(body: LeaveCreate):
    """Submit a new leave application (student)."""
    payload = {
        "student_id": body.student_id,
        "leave_type": body.leave_type,
        "start_date": body.start_date,
        "end_date": body.end_date,
        "reason": body.reason.strip(),
        "status": "pending",
    }
    res = supabase.table("leaves").insert(payload).execute()
    if not res.data:
        raise HTTPException(status_code=400, detail="Failed to submit leave application")
    return res.data[0]


@router.patch("/{leave_id}")
def update_leave_status(leave_id: int, body: LeaveStatusUpdate):
    """Update leave status — accepts or rejects a pending application (admin only)."""
    if body.user_type != "admin":
        raise HTTPException(status_code=403, detail="Only admins can update leave status")

    if body.status not in ("accepted", "rejected"):
        raise HTTPException(status_code=400, detail="Status must be 'accepted' or 'rejected'")

    # Check if a verification token already exists for this leave
    existing = (
        supabase.table("leaves")
        .select("verification_token")
        .eq("id", leave_id)
        .execute()
    )
    existing_token = None
    if existing.data:
        existing_token = existing.data[0].get("verification_token")

    update_payload: dict = {
        "status": body.status,
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    if body.remarks is not None:
        update_payload["remarks"] = body.remarks.strip()

    if body.status == "accepted":
        if not existing_token:
            import secrets
            update_payload["verification_token"] = secrets.token_urlsafe(32)

    res = (
        supabase.table("leaves")
        .update(update_payload)
        .eq("id", leave_id)
        .execute()
    )
    if not res.data:
        raise HTTPException(status_code=404, detail="Leave not found")
        
    # Email notification (Only when leave request is approved)
    if body.status == "accepted":
        try:
            leave_data = res.data[0]
            student_res = (
                supabase.table("students")
                .select("name, email")
                .eq("id", leave_data["student_id"])
                .execute()
            )
            if student_res.data:
                student_info = student_res.data[0]
                from services.email_service import send_leave_approved_email
                send_leave_approved_email(
                    to_email=student_info["email"],
                    student_name=student_info["name"],
                    leave_type=leave_data["leave_type"],
                    start_date=leave_data["start_date"],
                    end_date=leave_data["end_date"],
                    remarks=leave_data.get("remarks")
                )
        except Exception as e:
            # Catching exceptions to ensure email failures do not affect application flow
            import logging
            logging.getLogger("leaves_router").error(f"Failed to process approval email: {str(e)}")

    return res.data[0]


@router.get("/verify/{token}")
def verify_leave_token(token: str):
    """Verify a leave application token and return details."""
    res = (
        supabase.table("leaves")
        .select("*, students(id, name, reg_no, year_of_study, branch, hostel_room_no)")
        .eq("verification_token", token)
        .execute()
    )
    if not res.data:
        raise HTTPException(status_code=404, detail="Invalid verification token")
    return res.data[0]


@router.get("/{leave_id}")
def get_leave_by_id(leave_id: int):
    """Get details of a single leave application, including student info."""
    res = (
        supabase.table("leaves")
        .select("*, students(id, name, reg_no, year_of_study, branch, hostel_room_no)")
        .eq("id", leave_id)
        .execute()
    )
    if not res.data:
        raise HTTPException(status_code=404, detail="Leave application not found")
    return res.data[0]


