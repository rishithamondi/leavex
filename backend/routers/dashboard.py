from fastapi import APIRouter
from services.supabase_client import supabase

router = APIRouter()


@router.get("/admin-stats")
def get_admin_stats():
    """
    Aggregate dashboard stats for admin in a single endpoint.
    Replaces the 5 separate Supabase count calls from AdminDashboard.tsx.
    """
    total_students = (
        supabase.table("students").select("id", count="exact").execute().count or 0
    )

    leaves_res = supabase.table("leaves").select("status").execute()
    leaves = leaves_res.data or []

    total_applications = len(leaves)
    pending = sum(1 for l in leaves if l["status"] == "pending")
    accepted = sum(1 for l in leaves if l["status"] == "accepted")
    rejected = sum(1 for l in leaves if l["status"] == "rejected")

    return {
        "totalStudents": total_students,
        "totalApplications": total_applications,
        "pendingApplications": pending,
        "acceptedApplications": accepted,
        "rejectedApplications": rejected,
    }


@router.get("/student-stats/{student_id}")
def get_student_stats(student_id: int):
    """
    Dashboard stats for a specific student.
    Returns counts + 5 most recent leaves.
    """
    res = (
        supabase.table("leaves")
        .select("*")
        .eq("student_id", student_id)
        .order("applied_at", desc=True)
        .execute()
    )
    leaves = res.data or []

    # ── Leave Balance ────────────────────────────────────────────────────────
    ALLOWED_DAYS = 30  # configurable system-wide constant
    used_days = 0
    for leave in leaves:
        if leave["status"] == "accepted":
            try:
                from datetime import date as _date
                start = _date.fromisoformat(leave["start_date"])
                end = _date.fromisoformat(leave["end_date"])
                used_days += (end - start).days + 1
            except Exception:
                pass
    remaining = max(0, ALLOWED_DAYS - used_days)

    return {
        "totalLeaves": len(leaves),
        "pendingLeaves": sum(1 for l in leaves if l["status"] == "pending"),
        "acceptedLeaves": sum(1 for l in leaves if l["status"] == "accepted"),
        "rejectedLeaves": sum(1 for l in leaves if l["status"] == "rejected"),
        "recentLeaves": leaves[:5],
        "leaveBalance": {
            "allowed": ALLOWED_DAYS,
            "used": used_days,
            "remaining": remaining,
        },
    }

