'use client';

import { useState } from 'react';
import Link from 'next/link';
import { LogOut, User, Home, Menu, GraduationCap } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import NotificationBell from '@/components/Layout/NotificationBell';
import { ProfilePopover } from '@/components/Layout/ProfilePopover';

interface NavbarProps {
  onMenuClick?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
  const { user } = useAuth();
  const [popoverOpen, setPopoverOpen] = useState(false);

  const dashboardPath =
    user?.userType === 'admin' ? '/admin/dashboard' : '/student/dashboard';

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-30 h-16">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {onMenuClick && (
              <button
                onClick={onMenuClick}
                className="lg:hidden p-2 mr-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg focus:outline-none"
                title="Toggle Navigation"
              >
                <Menu size={20} />
              </button>
            )}
            <Link href={dashboardPath} className="flex-shrink-0 flex items-center gap-2">
              <GraduationCap className="w-7 h-7 text-indigo-600" />
              <h1 className="text-xl font-bold text-indigo-600">LeaveX</h1>
            </Link>
          </div>

          <div className="flex items-center space-x-2 relative">
            <Link
              href={dashboardPath}
              className="p-2 rounded-lg text-gray-600 hover:text-indigo-600 transition-colors flex items-center justify-center"
              title="Dashboard"
            >
              <Home size={18} />
            </Link>

            <NotificationBell />

            <button
              onClick={() => setPopoverOpen(!popoverOpen)}
              className="p-2 rounded-lg text-gray-600 hover:text-indigo-600 hover:bg-gray-50 transition-colors flex items-center justify-center cursor-pointer focus:outline-none"
              title={`${(user?.userType === 'student' ? user.name : undefined) || user?.reg_no} (${user?.userType === 'admin' ? 'Admin' : 'Student'})`}
            >
              <User size={18} />
            </button>

            <ProfilePopover isOpen={popoverOpen} onClose={() => setPopoverOpen(false)} />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

