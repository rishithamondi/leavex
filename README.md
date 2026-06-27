# LeaveX — Hostel Leave Management System

A leave management system for hostel students and administrators.

## Architecture

```
LEAVEX-main/
├── frontend/       ← Next.js 15 + TypeScript + Tailwind CSS
├── backend/        ← FastAPI + Python + Supabase
├── src/            ← Legacy Vite+React app (do not delete until migration approved)
└── supabase/       ← Supabase configuration
```

### Request flow
```
Browser → Next.js (port 3000) → FastAPI (port 8000) → Supabase PostgreSQL
```

---

## Running locally

### Prerequisites
- Node.js 18+
- Python 3.11+
- pip

---

### 1. Backend (FastAPI)

```bash
cd backend

# Create and activate virtual environment
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start server
uvicorn main:app --reload --port 8000
```

API docs available at: **http://localhost:8000/docs**

---

### 2. Frontend (Next.js)

```bash
cd frontend
npm install      # first time only
npm run dev
```

App available at: **http://localhost:3000**

> **Important:** Start the backend before the frontend. The frontend calls FastAPI on port 8000.

---

## Environment Variables

### `frontend/.env.local`
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### `backend/.env`
```
SUPABASE_URL=<your-supabase-url>
SUPABASE_ANON_KEY=<your-supabase-anon-key>
ALLOWED_ORIGINS=http://localhost:3000
```

---

## Login Credentials (development)

| Role    | Username   | Password                   |
|---------|------------|----------------------------|
| Admin   | ADM202327  | 22102006                   |
| Student | Reg number | Date of birth (YYYYMMDD)   |

> Students must be added by an admin before they can log in.

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST   | `/api/auth/login` | Login for admin or student |
| GET    | `/api/students` | List all students (admin) |
| POST   | `/api/students` | Add a student (admin) |
| GET    | `/api/leaves` | All leaves (admin) |
| GET    | `/api/leaves?student_id=N` | Student's leaves |
| POST   | `/api/leaves` | Submit leave application |
| PATCH  | `/api/leaves/{id}` | Accept / reject application |
| GET    | `/api/dashboard/admin-stats` | Admin dashboard stats |
| GET    | `/api/dashboard/student-stats/{id}` | Student dashboard stats |
| GET    | `/api/health` | Health check |
LEAVEX - An Online Leave Management System

Several problems were identified within the hostel community regarding leave management :
a.	Manual Paper-Based Process
b.	Delayed Approvals
c.	Lack of Transparency 
d.	Record Maintenance Issues 
e.	Limited Communication with Parents/Guardians
f.	No Centralized Digital System

Hostel administration plays a crucial role in ensuring student safety, discipline, and transparency. Traditionally, hostel leave applications are managed through manual registers or paper slips, which are often prone to delays, loss of records, and lack of accountability. This creates challenges for both students and wardens in processing leave requests efficiently.
To address these issues, our team developed the Hostel Leave Management System (HLMS), a web- based application that enables students to apply for leave online, and wardens/administrators approve, reject, and track leave requests seamlessly. Unlike manual systems, HLMS ensures real- time tracking, transparency, and secure record management, making hostel leave processing more reliable and user-friendly.The main aim of this project is to digitalize hostel leave workflows using web technologies, ensuring efficiency, accountability, and convenience for both students and hostel staff.
