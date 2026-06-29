'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, Shield, Mail, Hash } from 'lucide-react';

export default function AdminProfilePage() {
  const { user, logout } = useAuth();

  if (!user || user.userType !== 'admin') {
    return null;
  }

  // Admin details
  const adminName = 'System Administrator';
  const adminEmail = `admin.${user.reg_no.toLowerCase()}@leavex.com`;

  const infoItems = [
    { label: 'Admin ID / Reg No', value: user.reg_no, icon: Hash },
    { label: 'Email Address', value: adminEmail, icon: Mail },
    { label: 'Role / Designation', value: 'System Admin', icon: Shield },
  ];

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Profile Header Banner */}
        <div className="h-32 bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center"></div>

        {/* Profile Content */}
        <div className="relative px-6 pb-6">
          {/* Avatar */}
          <div className="absolute -top-12 left-6">
            <div className="w-24 h-24 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-3xl font-bold border-4 border-white shadow-md">
              AD
            </div>
          </div>

          {/* Name and Basic Role */}
          <div className="pt-16 mb-6">
            <h1 className="text-2xl font-bold text-gray-900">{adminName}</h1>
            <p className="text-sm font-semibold text-indigo-600 mt-1">Admin Portal</p>
          </div>

          <hr className="border-gray-200 mb-6" />

          {/* Details Grid */}
          <div className="grid grid-cols-1 gap-6 mb-8">
            {infoItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="flex items-start space-x-3 p-3 rounded-xl bg-gray-50 border border-gray-100 hover:border-indigo-100 transition-colors">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                    <Icon size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{item.label}</p>
                    <p className="text-sm font-medium text-gray-800 mt-0.5">{item.value}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <hr className="border-gray-200 mb-6" />

          {/* Logout Section */}
          <div className="flex justify-center">
            <button
              onClick={logout}
              className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-3 border border-transparent rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors cursor-pointer"
            >
              <LogOut size={18} />
              <span>Logout Account</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
