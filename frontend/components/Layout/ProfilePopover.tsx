'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  LogOut,
  Mail,
  Hash,
  BookOpen,
  Calendar,
  Home,
  Phone,
  Copy,
  Check,
  Shield,
  X,
} from 'lucide-react';

interface ProfilePopoverProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfilePopover: React.FC<ProfilePopoverProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const popoverRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Close on Esc key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !user) return null;

  const handleCopyRegNo = () => {
    navigator.clipboard.writeText(user.reg_no);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getInitials = (name?: string) => {
    if (!name) return 'A';
    return name
      .trim()
      .split(/\s+/)
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  const isStudent = user.userType === 'student';
  const student = isStudent ? (user as any) : null;

  return (
    <>
      {/* Mobile Backdrop (centered bottom sheet style) */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 md:hidden transition-opacity duration-300" onClick={onClose} />

      {/* Popover Card */}
      <div
        ref={popoverRef}
        className="
          fixed bottom-0 left-0 right-0 max-h-[90vh] rounded-t-2xl z-50 bg-white shadow-2xl border-t border-gray-200 overflow-y-auto animate-slide-up
          md:absolute md:bottom-auto md:left-auto md:right-0 md:top-14 md:w-80 md:rounded-2xl md:border md:animate-fade-in
        "
      >
        {/* Header (Blue/Indigo banner like the reference) */}
        <div className="bg-indigo-600 text-white p-5 rounded-t-2xl md:rounded-t-2xl flex flex-col justify-between relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white md:hidden"
            aria-label="Close"
          >
            <X size={20} />
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-lg font-bold border border-white/30">
              {isStudent ? getInitials(student?.name) : 'AD'}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold truncate text-base leading-tight">
                {isStudent ? student?.name : 'System Administrator'}
              </h4>
              <p className="text-xs text-indigo-100 mt-0.5 font-medium">
                {isStudent ? 'Student Account' : 'Administrator'}
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-indigo-100">
            <div className="min-w-0">
              <span className="opacity-80 block text-[10px] uppercase tracking-wider font-semibold">Registration ID</span>
              <span className="font-mono font-semibold truncate block mt-0.5">{user.reg_no}</span>
            </div>
            <button
              onClick={handleCopyRegNo}
              className="p-1.5 hover:bg-white/15 rounded-lg transition-colors flex items-center space-x-1"
              title="Copy ID"
            >
              {copied ? <Check size={14} className="text-green-300" /> : <Copy size={14} />}
            </button>
          </div>
        </div>

        {/* Content Details */}
        <div className="p-4 space-y-3.5">
          {isStudent ? (
            <>
              <div className="flex items-start space-x-2.5">
                <Mail className="text-gray-400 mt-0.5 flex-shrink-0" size={16} />
                <div className="min-w-0">
                  <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Email</p>
                  <p className="text-sm text-gray-700 font-medium truncate">{student?.email}</p>
                </div>
              </div>

              <div className="flex items-start space-x-2.5">
                <BookOpen className="text-gray-400 mt-0.5 flex-shrink-0" size={16} />
                <div className="min-w-0">
                  <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Department</p>
                  <p className="text-sm text-gray-700 font-medium truncate">{student?.branch}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-start space-x-2.5">
                  <Calendar className="text-gray-400 mt-0.5 flex-shrink-0" size={16} />
                  <div className="min-w-0">
                    <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Year</p>
                    <p className="text-sm text-gray-700 font-medium truncate">{student?.year_of_study}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-2.5">
                  <Home className="text-gray-400 mt-0.5 flex-shrink-0" size={16} />
                  <div className="min-w-0">
                    <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Hostel Room</p>
                    <p className="text-sm text-gray-700 font-medium truncate">{student?.hostel_room_no || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {student?.phone && (
                <div className="flex items-start space-x-2.5">
                  <Phone className="text-gray-400 mt-0.5 flex-shrink-0" size={16} />
                  <div className="min-w-0">
                    <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Phone</p>
                    <p className="text-sm text-gray-700 font-medium truncate">{student?.phone}</p>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="flex items-start space-x-2.5">
                <Mail className="text-gray-400 mt-0.5 flex-shrink-0" size={16} />
                <div className="min-w-0">
                  <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Email</p>
                  <p className="text-sm text-gray-700 font-medium truncate">rishithashivanandh@gmail.com</p>
                </div>
              </div>

              <div className="flex items-start space-x-2.5">
                <Shield className="text-gray-400 mt-0.5 flex-shrink-0" size={16} />
                <div className="min-w-0">
                  <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Role</p>
                  <p className="text-sm text-gray-700 font-medium truncate">System Administrator</p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer/Logout Action */}
        <div className="border-t border-gray-100 p-3 bg-gray-50 flex justify-end">
          <button
            onClick={() => {
              onClose();
              logout();
            }}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 border.5 border-red-100 text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors rounded-xl text-sm font-semibold cursor-pointer"
          >
            <LogOut size={16} />
            <span>Log out</span>
          </button>
        </div>
      </div>
    </>
  );
};
