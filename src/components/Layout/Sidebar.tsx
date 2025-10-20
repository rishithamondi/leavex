import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  UserPlus, 
  Calendar,
  ClipboardList
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  const adminMenuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/students', label: 'All Students', icon: Users },
    { path: '/admin/applications', label: 'All Applications', icon: FileText },
    { path: '/admin/add-student', label: 'Add Student', icon: UserPlus },
  ];

  const studentMenuItems = [
    { path: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/student/leaves', label: 'All Leaves', icon: ClipboardList },
    { path: '/student/apply-leave', label: 'Apply Leave', icon: Calendar },
  ];

  const menuItems = user?.userType === 'admin' ? adminMenuItems : studentMenuItems;

  return (
    <aside className="w-64 bg-white shadow-sm border-r border-gray-200 flex-shrink-0 h-full">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-6">
          {user?.userType === 'admin' ? 'Admin Portal' : 'Student Portal'}
        </h2>
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-colors ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 font-bold'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
