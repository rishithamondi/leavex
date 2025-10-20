import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, Leave } from '../../lib/supabase';

interface StudentStats {
  totalLeaves: number;
  pendingLeaves: number;
  acceptedLeaves: number;
  rejectedLeaves: number;
  recentLeaves: Leave[];
}

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<StudentStats>({
    totalLeaves: 0,
    pendingLeaves: 0,
    acceptedLeaves: 0,
    rejectedLeaves: 0,
    recentLeaves: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.userType === 'student') {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    if (user?.userType !== 'student') return;

    try {
      // Get all leaves for this student
      const { data: leaves, error } = await supabase
        .from('leaves')
        .select('*')
        .eq('student_id', user.id)
        .order('applied_at', { ascending: false });

      if (error) throw error;

      const totalLeaves = leaves?.length || 0;
      const pendingLeaves = leaves?.filter(leave => leave.status === 'pending').length || 0;
      const acceptedLeaves = leaves?.filter(leave => leave.status === 'accepted').length || 0;
      const rejectedLeaves = leaves?.filter(leave => leave.status === 'rejected').length || 0;
      const recentLeaves = leaves?.slice(0, 5) || [];

      setStats({
        totalLeaves,
        pendingLeaves,
        acceptedLeaves,
        rejectedLeaves,
        recentLeaves,
      });
    } catch (error) {
      console.error('Error fetching student stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Applications',
      value: stats.totalLeaves,
      icon: Calendar,
      color: 'bg-blue-500',
    },
    {
      title: 'Pending',
      value: stats.pendingLeaves,
      icon: Clock,
      color: 'bg-yellow-500',
    },
    {
      title: 'Accepted',
      value: stats.acceptedLeaves,
      icon: CheckCircle,
      color: 'bg-green-500',
    },
    {
      title: 'Rejected',
      value: stats.rejectedLeaves,
      icon: XCircle,
      color: 'bg-red-500',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'text-green-600 bg-green-100';
      case 'rejected':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-yellow-600 bg-yellow-100';
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
      <p className="text-gray-600 mb-8">Welcome back, {user?.name}</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className={`${card.color} rounded-lg p-3`}>
                  <Icon className="h-6 w-6 text-white" />
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
                      {new Date(leave.start_date).toLocaleDateString()} - {new Date(leave.end_date).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">{leave.reason}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(leave.status)}`}>
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
