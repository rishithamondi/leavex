import React from 'react';
import { Link } from 'react-router-dom';
import { LogOut, User, Home } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

  const dashboardPath = user?.userType === 'admin' ? '/admin/dashboard' : '/student/dashboard';

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-10 h-16">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to={dashboardPath} className="flex-shrink-0">
              <h1 className="text-xl font-bold text-indigo-600">LeaveX</h1>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-gray-700">
              <User size={16} />
              <span className="text-sm font-medium">
                {user?.name || user?.reg_no} ({user?.userType === 'admin' ? 'Admin' : 'Student'})
              </span>
            </div>
            
            <Link
              to={dashboardPath}
              className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-600 hover:text-indigo-600 transition-colors"
            >
              <Home size={16} />
              <span>Dashboard</span>
            </Link>
            
            <button
              onClick={logout}
              className="flex items-center space-x-1 px-3 py-2 text-sm text-red-600 hover:text-red-700 transition-colors"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
