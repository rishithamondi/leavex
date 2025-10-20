import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const GuestRoute: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (user) {
    const redirectTo = user.userType === 'admin' ? '/admin/dashboard' : '/student/dashboard';
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
};

export default GuestRoute;
