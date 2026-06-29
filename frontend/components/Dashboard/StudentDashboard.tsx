'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getStudentStatsApi, type StudentStats } from '@/lib/api';

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<StudentStats>({
    totalLeaves: 0,
    pendingLeaves: 0,
    acceptedLeaves: 0,
    rejectedLeaves: 0,
    recentLeaves: [],
    leaveBalance: { allowed: 30, used: 0, remaining: 30 },
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    if (user?.userType !== 'student') return;
    try {
      const data = await getStudentStatsApi(user.id);
      setStats(data);
    } catch (error) {
      console.error('Error fetching student stats:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user?.userType === 'student') {
      fetchStats();
    }
  }, [user, fetchStats]);

  const statCards = [
    { title: 'Total Applications', value: stats.totalLeaves, icon: Calendar, color: 'bg-blue-500' },
    { title: 'Pending', value: stats.pendingLeaves, icon: Clock, color: 'bg-yellow-500' },
    { title: 'Accepted', value: stats.acceptedLeaves, icon: CheckCircle, color: 'bg-green-500' },
    { title: 'Rejected', value: stats.rejectedLeaves, icon: XCircle, color: 'bg-red-500' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      default: return 'text-yellow-600 bg-yellow-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Student Dashboard</h1>
      <p className="text-gray-600 mb-8">Welcome back, {user?.userType === 'student' ? user.name : ''}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="text-indigo-600 p-2 flex items-center justify-center">
                  <Icon className="h-7 w-7" />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">{card.title}</h3>
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Leave Balance Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Leave Balance (Current Year)</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col items-center justify-center text-center p-4 rounded-lg bg-blue-50 border border-blue-100">
            <p className="text-2xl font-bold text-blue-700">{stats.leaveBalance.allowed}</p>
            <p className="text-xs font-semibold text-blue-500 mt-1">Allowed</p>
          </div>
          <div className="flex flex-col items-center justify-center text-center p-4 rounded-lg bg-orange-50 border border-orange-100">
            <p className="text-2xl font-bold text-orange-700">{stats.leaveBalance.used}</p>
            <p className="text-xs font-semibold text-orange-500 mt-1">Used</p>
          </div>
          <div className={`flex flex-col items-center justify-center text-center p-4 rounded-lg border ${
            stats.leaveBalance.remaining <= 5
              ? 'bg-red-50 border-red-100'
              : 'bg-green-50 border-green-100'
          }`}>
            <p className={`text-2xl font-bold ${
              stats.leaveBalance.remaining <= 5 ? 'text-red-700' : 'text-green-700'
            }`}>{stats.leaveBalance.remaining}</p>
            <p className={`text-xs font-semibold mt-1 ${
              stats.leaveBalance.remaining <= 5 ? 'text-red-500' : 'text-green-500'
            }`}>Remaining</p>
          </div>
        </div>
        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Used: {stats.leaveBalance.used} days</span>
            <span>{stats.leaveBalance.allowed} days total</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                stats.leaveBalance.remaining <= 5 ? 'bg-red-500' : 'bg-indigo-500'
              }`}
              style={{
                width: `${Math.min(
                  (stats.leaveBalance.used / stats.leaveBalance.allowed) * 100,
                  100
                )}%`,
              }}
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Leave Applications</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {stats.recentLeaves.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No leave applications yet. Apply for your first leave!
            </div>
          ) : (
            stats.recentLeaves.map((leave) => (
              <div key={leave.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{leave.leave_type}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(leave.start_date).toLocaleDateString()} -{' '}
                      {new Date(leave.end_date).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">{leave.reason}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(leave.status)}`}
                  >
                    {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
