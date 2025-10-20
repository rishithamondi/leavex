import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types
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
  students?: Student;
}

export interface LeaveWithStudent extends Leave {
  students: Student;
}
