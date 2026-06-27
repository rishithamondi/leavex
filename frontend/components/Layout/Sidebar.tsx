'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  FileText,
  UserPlus,
  Calendar,
  ClipboardList,
  CalendarDays,
  X,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const adminMenuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/students', label: 'All Students', icon: Users },
    { path: '/admin/applications', label: 'All Applications', icon: FileText },
    { path: '/admin/calendar', label: 'Calendar', icon: CalendarDays },
    { path: '/admin/add-student', label: 'Add Student', icon: UserPlus },
  ];

  const studentMenuItems = [
    { path: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/student/leaves', label: 'All Leaves', icon: ClipboardList },
    { path: '/student/calendar', label: 'Calendar', icon: CalendarDays },
    { path: '/student/apply-leave', label: 'Apply Leave', icon: Calendar },
  ];


  const menuItems = user?.userType === 'admin' ? adminMenuItems : studentMenuItems;

  const getFirstName = (fullName?: string) => {
    if (!fullName) return 'Student Portal';
    return fullName.trim().split(/\s+/)[0] || '';
  };

  return (
    <>
      {/* Mobile Sidebar backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-sm border-r border-gray-200 flex-shrink-0 h-full transition-transform duration-300 transform lg:static lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 flex flex-col h-full justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-800">
                {user?.userType === 'admin' ? 'Admin Portal' : getFirstName(user?.name)}
              </h2>
              {onClose && (
                <button
                  onClick={onClose}
                  className="lg:hidden p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg focus:outline-none"
                  title="Close Menu"
                >
                  <X size={18} />
                </button>
              )}
            </div>
            <nav className="space-y-2">
              {menuItems.map((item) => {
                const isActive = pathname.startsWith(item.path);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={onClose}
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

          <div className="pt-4 border-t border-gray-100">
            <button
              onClick={logout}
              className="w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
            >
              <LogOut size={20} />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
