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