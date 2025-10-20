import React, { useState, useEffect } from 'react';
import { Users, FileText, CheckCircle, XCircle, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface DashboardStats {
  totalStudents: number;
  totalApplications: number;
  pendingApplications: number;
  acceptedApplications: number;
  rejectedApplications: number;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalApplications: 0,
    pendingApplications: 0,
    acceptedApplications: 0,
    rejectedApplications: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Get total students
      const { count: studentCount } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true });

      // Get total applications
      const { count: totalApplications } = await supabase
        .from('leaves')
        .select('*', { count: 'exact', head: true });

      // Get pending applications
      const { count: pendingCount } = await supabase
        .from('leaves')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Get accepted applications
      const { count: acceptedCount } = await supabase
        .from('leaves')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'accepted');

      // Get rejected applications
      const { count: rejectedCount } = await supabase
        .from('leaves')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'rejected');

      setStats({
        totalStudents: studentCount || 0,
        totalApplications: totalApplications || 0,
        pendingApplications: pendingCount || 0,
        acceptedApplications: acceptedCount || 0,
        rejectedApplications: rejectedCount || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Students',
      value: stats.totalStudents,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      title: 'Total Applications',
      value: stats.totalApplications,
      icon: FileText,
      color: 'bg-purple-500',
    },
    {
      title: 'Pending Applications',
      value: stats.pendingApplications,
      icon: Clock,
      color: 'bg-yellow-500',
    },
    {
      title: 'Accepted Applications',
      value: stats.acceptedApplications,
      icon: CheckCircle,
      color: 'bg-green-500',
    },
    {
      title: 'Rejected Applications',
      value: stats.rejectedApplications,
      icon: XCircle,
      color: 'bg-red-500',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
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

      <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Application Status Distribution</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Pending</span>
                <span className="text-sm font-medium text-yellow-600">{stats.pendingApplications}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Accepted</span>
                <span className="text-sm font-medium text-green-600">{stats.acceptedApplications}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Rejected</span>
                <span className="text-sm font-medium text-red-600">{stats.rejectedApplications}</span>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">System Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Students Registered</span>
                <span className="text-sm font-medium text-blue-600">{stats.totalStudents}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Leave Applications</span>
                <span className="text-sm font-medium text-purple-600">{stats.totalApplications}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
