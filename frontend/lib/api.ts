// Central API client — all requests go through FastAPI backend
import type { Admin, Student, Leave, LeaveWithStudent } from '@/lib/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Generic fetch wrapper
async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(error.detail || 'Request failed');
  }

  return res.json() as Promise<T>;
}

// ─── Auth ──────────────────────────────────────────────────────────────────
export interface LoginResponse {
  success: boolean;
  userType: 'admin' | 'student';
  user: Admin | Student;
}

export const loginApi = (regNo: string, password: string) =>
  apiFetch<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ reg_no: regNo, password }),
  });

// ─── Students ──────────────────────────────────────────────────────────────
export const getStudentsApi = () => apiFetch<Student[]>('/api/students');

export const addStudentApi = (data: Omit<Student, 'id' | 'created_at'>) =>
  apiFetch<{ student: Student; credentials: { username: string; password: string } }>(
    '/api/students',
    { method: 'POST', body: JSON.stringify(data) }
  );

// ─── Leaves ────────────────────────────────────────────────────────────────
export const getLeavesApi = (studentId?: number) =>
  apiFetch<LeaveWithStudent[] | Leave[]>(
    `/api/leaves${studentId !== undefined ? `?student_id=${studentId}` : ''}`
  );

export const applyLeaveApi = (data: {
  student_id: number;
  leave_type: string;
  start_date: string;
  end_date: string;
  reason: string;
}) => apiFetch<Leave>('/api/leaves', { method: 'POST', body: JSON.stringify(data) });

export const updateLeaveStatusApi = (
  leaveId: number,
  status: 'accepted' | 'rejected',
  userType: string
) =>
  apiFetch<Leave>(`/api/leaves/${leaveId}`, {
    method: 'PATCH',
    body: JSON.stringify({ status, user_type: userType }),
  });

// ─── Dashboard ─────────────────────────────────────────────────────────────
export interface AdminStats {
  totalStudents: number;
  totalApplications: number;
  pendingApplications: number;
  acceptedApplications: number;
  rejectedApplications: number;
}

export interface StudentStats {
  totalLeaves: number;
  pendingLeaves: number;
  acceptedLeaves: number;
  rejectedLeaves: number;
  recentLeaves: Leave[];
}

export const getAdminStatsApi = () =>
  apiFetch<AdminStats>('/api/dashboard/admin-stats');

export const getStudentStatsApi = (studentId: number) =>
  apiFetch<StudentStats>(`/api/dashboard/student-stats/${studentId}`);
