import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import App from '../App';
import LoginPage from '../components/Auth/LoginPage';
import AdminDashboard from '../components/Dashboard/AdminDashboard';
import StudentDashboard from '../components/Dashboard/StudentDashboard';
import AllStudents from '../components/Admin/AllStudents';
import AllApplications from '../components/Admin/AllApplications';
import AddStudent from '../components/Admin/AddStudent';
import AllLeaves from '../components/Student/AllLeaves';
import ApplyLeave from '../components/Student/ApplyLeave';
import ProtectedRoute from '../components/Layout/ProtectedRoute';
import GuestRoute from '../components/Layout/GuestRoute';
import AppLayout from '../components/Layout/AppLayout';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <Navigate to="/login" replace />,
      },
      {
        element: <GuestRoute />,
        children: [
          {
            path: 'login',
            element: <LoginPage />,
          },
        ],
      },
      {
        element: <ProtectedRoute allowedUserType="admin" />,
        children: [
          {
            path: 'admin',
            element: <AppLayout />,
            children: [
              { path: 'dashboard', element: <AdminDashboard /> },
              { path: 'students', element: <AllStudents /> },
              { path: 'applications', element: <AllApplications /> },
              { path: 'add-student', element: <AddStudent /> },
              { index: true, element: <Navigate to="/admin/dashboard" replace /> },
            ],
          },
        ],
      },
      {
        element: <ProtectedRoute allowedUserType="student" />,
        children: [
          {
            path: 'student',
            element: <AppLayout />,
            children: [
              { path: 'dashboard', element: <StudentDashboard /> },
              { path: 'leaves', element: <AllLeaves /> },
              { path: 'apply-leave', element: <ApplyLeave /> },
              { index: true, element: <Navigate to="/student/dashboard" replace /> },
            ],
          },
        ],
      },
    ],
  },
]);
