import React, { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, Leave } from '../../lib/supabase';

const AllLeaves: React.FC = () => {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.userType === 'student') {
      fetchLeaves();
    }
  }, [user]);

  const fetchLeaves = async () => {
    if (user?.userType !== 'student') return;

    try {
      const { data, error } = await supabase
        .from('leaves')
        .select('*')
        .eq('student_id', user.id)
        .order('applied_at', { ascending: false });

      if (error) throw error;
      setLeaves(data || []);
    } catch (error) {
      console.error('Error fetching leaves:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

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

  const calculateDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">All Leave Applications</h1>
        <div className="text-sm text-gray-500">
          Total: {leaves.length} application(s)
        </div>
      </div>

      <div className="space-y-4">
        {leaves.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No leave applications</h3>
            <p className="text-gray-500">You haven't applied for any leaves yet. Click on "Apply Leave" to get started.</p>
          </div>
        ) : (
          leaves.map((leave) => (
            <div key={leave.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    {getStatusIcon(leave.status)}
                    <h3 className="text-lg font-medium text-gray-900">{leave.leave_type}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(leave.status)}`}>
                      {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Duration</h4>
                      <p className="text-sm text-gray-900">
                        {new Date(leave.start_date).toLocaleDateString()} - {new Date(leave.end_date).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        {calculateDuration(leave.start_date, leave.end_date)} day(s)
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Applied On</h4>
                      <p className="text-sm text-gray-900">
                        {new Date(leave.applied_at).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(leave.applied_at).toLocaleTimeString()}
                      </p>
                    </div>
                    
                    {leave.status !== 'pending' && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Updated On</h4>
                        <p className="text-sm text-gray-900">
                          {new Date(leave.updated_at).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(leave.updated_at).toLocaleTimeString()}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Reason</h4>
                    <p className="text-sm text-gray-900">{leave.reason}</p>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AllLeaves;
