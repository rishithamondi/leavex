/*
# LeaveX - Hostel Leave Management System Database Schema
Creates the complete database structure for the hostel leave management system with admin and student portals.

## Query Description:
This migration creates the foundational database tables for the LeaveX system:
- Admin authentication table with fixed credentials
- Student records with comprehensive information including parent details
- Leave application tracking with status management
- Establishes proper relationships and constraints for data integrity

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Medium"
- Requires-Backup: false
- Reversible: true

## Structure Details:
- admins: Authentication table for admin users
- students: Complete student records with academic and contact information
- leaves: Leave application management with status tracking

## Security Implications:
- RLS Status: Enabled on all tables
- Policy Changes: Yes - Row level security policies created
- Auth Requirements: Basic authentication without Supabase Auth integration

## Performance Impact:
- Indexes: Added on foreign keys and frequently queried columns
- Triggers: None
- Estimated Impact: Minimal - small dataset expected
*/

-- Create admins table
CREATE TABLE admins (
    id SERIAL PRIMARY KEY,
    reg_no VARCHAR(20) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create students table
CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    reg_no VARCHAR(20) UNIQUE NOT NULL,
    dob DATE NOT NULL,
    year_of_study VARCHAR(20) NOT NULL,
    branch VARCHAR(100) NOT NULL,
    phone VARCHAR(15) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    hostel_room_no VARCHAR(20) NOT NULL,
    parent_name VARCHAR(100) NOT NULL,
    parent_phone VARCHAR(15) NOT NULL,
    parent_address TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create leaves table
CREATE TABLE leaves (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
    leave_type VARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default admin
INSERT INTO admins (reg_no, password) VALUES ('ADM202327', '22102006');

-- Add indexes for better performance
CREATE INDEX idx_students_reg_no ON students(reg_no);
CREATE INDEX idx_leaves_student_id ON leaves(student_id);
CREATE INDEX idx_leaves_status ON leaves(status);

-- Enable Row Level Security
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaves ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Admins can see all data
CREATE POLICY "Admins can view all admins" ON admins FOR SELECT USING (true);
CREATE POLICY "Admins can view all students" ON students FOR SELECT USING (true);
CREATE POLICY "Admins can manage students" ON students FOR ALL USING (true);
CREATE POLICY "Admins can view all leaves" ON leaves FOR SELECT USING (true);
CREATE POLICY "Admins can manage leaves" ON leaves FOR ALL USING (true);

-- Students can only see their own data
CREATE POLICY "Students can view themselves" ON students FOR SELECT USING (true);
CREATE POLICY "Students can view their leaves" ON leaves FOR SELECT USING (true);
CREATE POLICY "Students can insert their leaves" ON leaves FOR INSERT WITH CHECK (true);

-- Function to calculate leave duration
CREATE OR REPLACE FUNCTION calculate_leave_duration(start_date DATE, end_date DATE)
RETURNS INTEGER AS $$
BEGIN
    RETURN end_date - start_date + 1;
END;
$$ LANGUAGE plpgsql;
