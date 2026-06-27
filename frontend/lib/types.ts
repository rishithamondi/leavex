// Shared TypeScript interfaces — single source of truth

export interface Admin {
  id: number;
  reg_no: string;
  password: string;
  created_at: string;
}

export interface Student {
  id: number;
  name: string;
  reg_no: string;
  dob: string;
  year_of_study: string;
  branch: string;
  phone: string;
  email: string;
  hostel_room_no: string;
  parent_name: string;
  parent_phone: string;
  parent_address: string;
  created_at: string;
}

export interface Leave {
  id: number;
  student_id: number;
  leave_type: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: 'pending' | 'accepted' | 'rejected';
  applied_at: string;
  updated_at: string;
  remarks?: string;
  verification_token?: string;
  students?: Student;
}

export interface LeaveWithStudent extends Leave {
  students: Student;
}
