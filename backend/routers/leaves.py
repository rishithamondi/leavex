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

    res = (
        supabase.table("leaves")
        .update({"status": body.status, "updated_at": datetime.now(timezone.utc).isoformat()})
        .eq("id", leave_id)
        .execute()
    )
    if not res.data:
        raise HTTPException(status_code=404, detail="Leave not found")
    return res.data[0]
