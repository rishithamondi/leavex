import React, { useState } from 'react';
import { Calendar, Send } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface LeaveFormData {
  leave_type: string;
  start_date: string;
  end_date: string;
  reason: string;
}

const ApplyLeave: React.FC = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<LeaveFormData>({
    leave_type: '',
    start_date: '',
    end_date: '',
    reason: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const leaveTypes = [
    'Medical Leave',
    'Emergency Leave',
    'Personal Leave',
    'Family Leave',
    'Academic Leave',
    'Other'
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Validate dates
      const startDate = new Date(formData.start_date);
      const endDate = new Date(formData.end_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (startDate < today) {
        throw new Error('Start date cannot be in the past');
      }

      if (endDate < startDate) {
        throw new Error('End date cannot be before start date');
      }

      if (user?.userType !== 'student') {
        throw new Error('Only students can apply for leave');
      }

      const { error } = await supabase
        .from('leaves')
        .insert([{
          student_id: user.id,
          leave_type: formData.leave_type,
          start_date: formData.start_date,
          end_date: formData.end_date,
          reason: formData.reason.trim(),
          status: 'pending'
        }]);

      if (error) throw error;

      setMessage({
        type: 'success',
        text: 'Leave application submitted successfully! You will be notified once it is reviewed.'
      });

      // Reset form
      setFormData({
        leave_type: '',
        start_date: '',
        end_date: '',
        reason: '',
      });
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Failed to submit leave application. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateDuration = () => {
    if (formData.start_date && formData.end_date) {
      const start = new Date(formData.start_date);
      const end = new Date(formData.end_date);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    }
    return 0;
  };

  // Get tomorrow's date as minimum date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <Calendar className="h-6 w-6 text-indigo-600 mr-2" />
        <h1 className="text-2xl font-bold text-gray-900">Apply for Leave</h1>
      </div>

      {message.text && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="leave_type" className="block text-sm font-medium text-gray-700 mb-2">
                  Leave Type <span className="text-red-500">*</span>
                </label>
                <select
                  id="leave_type"
                  name="leave_type"
                  required
                  value={formData.leave_type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Select leave type</option>
                  {leaveTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration
                </label>
                <div className="flex items-center space-x-2 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg">
                  <Calendar size={16} className="text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {calculateDuration() > 0 ? `${calculateDuration()} day(s)` : 'Select dates'}
                  </span>
                </div>
              </div>

              <div>
                <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="start_date"
                  name="start_date"
                  required
                  min={minDate}
                  value={formData.start_date}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-2">
                  End Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="end_date"
                  name="end_date"
                  required
                  min={formData.start_date || minDate}
                  value={formData.end_date}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Leave <span className="text-red-500">*</span>
              </label>
              <textarea
                id="reason"
                name="reason"
                rows={4}
                required
                value={formData.reason}
                onChange={handleChange}
                placeholder="Please provide a detailed reason for your leave application..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <p className="mt-1 text-sm text-gray-500">
                Provide a clear and detailed reason for your leave request.
              </p>
            </div>

            {calculateDuration() > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Leave Summary</h4>
                <div className="text-sm text-blue-800">
                  <p><strong>Type:</strong> {formData.leave_type}</p>
                  <p><strong>Duration:</strong> {calculateDuration()} day(s)</p>
                  <p><strong>From:</strong> {new Date(formData.start_date).toLocaleDateString()}</p>
                  <p><strong>To:</strong> {new Date(formData.end_date).toLocaleDateString()}</p>
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Send size={16} className="mr-2" />
                )}
                {loading ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ApplyLeave;
