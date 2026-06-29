'use client';

import React, { useState, useRef } from 'react';
import { Calendar, Send, FileText } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { applyLeaveApi } from '@/lib/api';
import { useNotifications } from '@/contexts/NotificationContext';

interface LeaveFormData {
  leave_type: string;
  start_date: string;
  end_date: string;
  reason: string;
}

const emptyForm: LeaveFormData = { leave_type: '', start_date: '', end_date: '', reason: '' };

const leaveTypes = [
  'Medical Leave', 'Emergency Leave', 'Personal Leave',
  'Family Leave', 'Academic Leave', 'Other',
];

const ApplyLeave: React.FC = () => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [formData, setFormData] = useState<LeaveFormData>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError('');
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      if (!validTypes.includes(file.type)) {
        setFileError('Invalid file type. Only PDF, JPG, JPEG, and PNG files are allowed.');
        e.target.value = '';
        return;
      }
      setUploadedFile(file);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setFileError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleReplaceClick = () => {
    fileInputRef.current?.click();
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const startDate = new Date(formData.start_date);
      const endDate = new Date(formData.end_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (startDate < today) throw new Error('Start date cannot be in the past');
      if (endDate < startDate) throw new Error('End date cannot be before start date');
      if (user?.userType !== 'student') throw new Error('Only students can apply for leave');

      // Conditional File Upload Validation
      if (formData.leave_type === 'Medical Leave' && !uploadedFile) {
        throw new Error('Medical certificate is required for Medical Leave');
      }

      await applyLeaveApi({
        student_id: user.id,
        leave_type: formData.leave_type,
        start_date: formData.start_date,
        end_date: formData.end_date,
        reason: formData.reason.trim(),
      });

      setMessage({
        type: 'success',
        text: 'Leave application submitted successfully! You will be notified once it is reviewed.',
      });
      addNotification(
        'leave_submitted',
        'Leave Application Submitted',
        `Your ${formData.leave_type} application (${formData.start_date} → ${formData.end_date}) has been submitted and is pending review.`
      );
      setFormData(emptyForm);
      setUploadedFile(null);
      setFileError('');
    } catch (error: unknown) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to submit leave application. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateDuration = () => {
    if (formData.start_date && formData.end_date) {
      const diffTime = Math.abs(
        new Date(formData.end_date).getTime() - new Date(formData.start_date).getTime()
      );
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    return 0;
  };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  const inputClass =
    'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent';

  return (
    <div className="p-4 md:p-6">
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
                <select id="leave_type" name="leave_type" required value={formData.leave_type} onChange={handleChange} className={inputClass}>
                  <option value="">Select leave type</option>
                  {leaveTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                <div className="flex items-center space-x-2 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg">
                  <Calendar size={16} className="text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {calculateDuration() > 0 ? `${calculateDuration()} day(s)` : 'Select dates'}
                  </span>
                </div>
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date Range <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full">
                  <input
                    type="date"
                    id="start_date"
                    name="start_date"
                    required
                    min={minDate}
                    value={formData.start_date}
                    onChange={handleChange}
                    className={`${inputClass} cursor-pointer`}
                  />
                  <span className="text-gray-400 font-medium text-sm text-center">to</span>
                  <input
                    type="date"
                    id="end_date"
                    name="end_date"
                    required
                    min={formData.start_date || minDate}
                    value={formData.end_date}
                    onChange={handleChange}
                    className={`${inputClass} cursor-pointer`}
                  />
                </div>
              </div>
            </div>

            {/* Conditional File Upload Section */}
            {(formData.leave_type === 'Medical Leave' || formData.leave_type === 'Academic Leave') && (
              <div className="border-t border-gray-100 pt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {formData.leave_type === 'Medical Leave' ? (
                    <>
                      Medical Certificate Upload <span className="text-red-500">*</span>
                    </>
                  ) : (
                    <>Supporting Document Upload (Optional)</>
                  )}
                </label>

                {fileError && (
                  <p className="text-xs text-red-600 mb-2 font-medium">{fileError}</p>
                )}

                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                  />

                  {!uploadedFile ? (
                    <button
                      type="button"
                      onClick={handleReplaceClick}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors bg-white flex items-center gap-1.5"
                    >
                      Choose File
                    </button>
                  ) : (
                    <div className="flex items-center justify-between p-3 bg-gray-50/50 border border-gray-200 rounded-lg w-full max-w-md">
                      <div className="flex items-center gap-2 truncate">
                        <FileText size={16} className="text-gray-400 flex-shrink-0" />
                        <span className="text-xs font-medium text-gray-700 truncate" title={uploadedFile.name}>
                          {uploadedFile.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                        <button
                          type="button"
                          onClick={handleReplaceClick}
                          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline transition-colors"
                        >
                          Replace
                        </button>
                        <span className="text-gray-300">|</span>
                        <button
                          type="button"
                          onClick={handleRemoveFile}
                          className="text-xs font-semibold text-red-600 hover:text-red-800 hover:underline transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Acceptable formats: PDF, JPG, JPEG, PNG
                </p>
              </div>
            )}

            <div>
              <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Leave <span className="text-red-500">*</span>
              </label>
              <textarea id="reason" name="reason" rows={4} required value={formData.reason} onChange={handleChange} placeholder="Please provide a detailed reason for your leave application..." className={inputClass} />
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
