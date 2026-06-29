'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  User, 
  FileText,
  AlertCircle,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getLeaveByIdApi } from '@/lib/api';
import type { LeaveWithStudent } from '@/lib/types';
import { getVerificationUrl } from '@/lib/utils';

interface LeaveDetailsProps {
  leaveId: number;
}

const LeaveDetails: React.FC<LeaveDetailsProps> = ({ leaveId }) => {
  const { user } = useAuth();
  const router = useRouter();
  const [leave, setLeave] = useState<LeaveWithStudent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');

  useEffect(() => {
    if (leave?.verification_token) {
      const verifyUrl = getVerificationUrl(leave.verification_token, leave.verification_url);
      import('qrcode').then((QRCode) => {
        QRCode.toDataURL(verifyUrl, { width: 256, margin: 2 })
          .then((url) => setQrCodeDataUrl(url))
          .catch((err) => console.error('Error generating QR code:', err));
      });
    }
  }, [leave?.verification_token, leave?.verification_url]);

  useEffect(() => {
    if (user) {
      fetchLeaveDetails();
    }
  }, [user, leaveId]);

  const fetchLeaveDetails = async () => {
    try {
      const data = await getLeaveByIdApi(leaveId);
      setLeave(data);
    } catch (err) {
      console.error('Error fetching leave details:', err);
      setError(err instanceof Error ? err.message : 'Failed to load leave details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'text-green-700 bg-green-50 border-green-200';
      case 'rejected': return 'text-red-700 bg-red-50 border-red-200';
      default: return 'text-yellow-700 bg-yellow-50 border-yellow-200';
    }
  };

  const calculateDuration = (startDate: string, endDate: string) => {
    const diffTime = Math.abs(new Date(endDate).getTime() - new Date(startDate).getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !leave) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <button 
          onClick={() => router.back()}
          className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 mb-6"
        >
          <ArrowLeft size={16} className="mr-2" /> Back
        </button>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-medium text-red-900 mb-2">Error Loading Leave Details</h3>
          <p className="text-red-700 mb-4">{error || 'Leave application not found.'}</p>
          <button
            onClick={fetchLeaveDetails}
            className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Determine timeline steps
  // Step 1: Submitted (Always completed)
  const isSubmittedDone = true;
  
  // Step 2: Under Review (Always completed once submitted in our schema flow)
  const isUnderReviewDone = true;
  
  // Step 3: Approved/Rejected (Completed if status is accepted or rejected)
  const isDecisionDone = leave.status === 'accepted' || leave.status === 'rejected';
  
  // Step 4: Completed (Completed if accepted and today's date > end_date)
  const todayStr = new Date().toISOString().split('T')[0];
  const isCompletedDone = leave.status === 'accepted' && todayStr > leave.end_date;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Back Button */}
      <button 
        onClick={() => router.back()}
        className="flex items-center text-sm font-medium text-gray-600 hover:text-indigo-600 mb-6 transition-colors"
      >
        <ArrowLeft size={16} className="mr-2" /> Back
      </button>

      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Leave Details</h1>
        <p className="text-sm text-gray-500 mt-1">
          Application Reference: #{leave.id}
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Details Card */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-start border-b border-gray-100 pb-4 mb-6">
              <div>
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Leave Type</span>
                <h2 className="text-xl font-bold text-gray-900 mt-0.5">{leave.leave_type}</h2>
              </div>
              <div className="flex items-center gap-3">
                {leave.status === 'accepted' && leave.verification_token && (
                  <button
                    onClick={() => setShowQRModal(true)}
                    className="inline-flex items-center px-3 py-1.5 border border-indigo-200 text-xs font-semibold rounded-full text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors"
                  >
                    Show QR
                  </button>
                )}
                <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${getStatusBadgeColor(leave.status)}`}>
                  {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
              <div>
                <span className="text-xs font-medium text-gray-400 block mb-1">Start Date</span>
                <div className="flex items-center gap-2 text-sm text-gray-900 font-medium">
                  <Calendar size={16} className="text-gray-400" />
                  {formatDate(leave.start_date)}
                </div>
              </div>

              <div>
                <span className="text-xs font-medium text-gray-400 block mb-1">End Date</span>
                <div className="flex items-center gap-2 text-sm text-gray-900 font-medium">
                  <Calendar size={16} className="text-gray-400" />
                  {formatDate(leave.end_date)}
                </div>
              </div>

              <div>
                <span className="text-xs font-medium text-gray-400 block mb-1">Duration</span>
                <div className="flex items-center gap-2 text-sm text-gray-900 font-medium">
                  <Clock size={16} className="text-gray-400" />
                  {calculateDuration(leave.start_date, leave.end_date)} day(s)
                </div>
              </div>

              <div>
                <span className="text-xs font-medium text-gray-400 block mb-1">Applied Date</span>
                <div className="flex items-center gap-2 text-sm text-gray-900 font-medium">
                  <Calendar size={16} className="text-gray-400" />
                  {formatDate(leave.applied_at)} at {formatTime(leave.applied_at)}
                </div>
              </div>

              {leave.status !== 'pending' && (
                <div className="md:col-span-2">
                  <span className="text-xs font-medium text-gray-400 block mb-1">Updated Date</span>
                  <div className="flex items-center gap-2 text-sm text-gray-900 font-medium">
                    <Calendar size={16} className="text-gray-400" />
                    {formatDate(leave.updated_at)} at {formatTime(leave.updated_at)}
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-gray-100 mt-6 pt-6">
              <span className="text-xs font-medium text-gray-400 block mb-2">Reason for Leave</span>
              <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 leading-relaxed border border-gray-100">
                {leave.reason}
              </div>
            </div>

            {/* Warden Remarks — only shown when present */}
            {leave.remarks && (
              <div className="border-t border-gray-100 mt-4 pt-4">
                <span className="text-xs font-medium text-gray-400 block mb-2 flex items-center gap-1">
                  <MessageSquare size={12} /> Warden Remarks
                </span>
                <div className="bg-indigo-50 rounded-lg p-4 text-sm text-indigo-800 leading-relaxed border border-indigo-100 italic">
                  {leave.remarks}
                </div>
              </div>
            )}
          </div>

          {/* Student Info Card (Reusing exist schema/API details) */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-sm font-bold text-gray-950 mb-4 flex items-center gap-2">
              <User size={18} className="text-indigo-600" />
              Student Profile Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-xs text-gray-400">Name</span>
                <p className="font-semibold text-gray-800">{leave.students?.name}</p>
              </div>
              <div>
                <span className="text-xs text-gray-400">Registration Number</span>
                <p className="font-semibold text-gray-800">{leave.students?.reg_no}</p>
              </div>
              <div>
                <span className="text-xs text-gray-400">Year & Branch</span>
                <p className="font-semibold text-gray-800">
                  {leave.students?.year_of_study} - {leave.students?.branch}
                </p>
              </div>
              <div>
                <span className="text-xs text-gray-400">Hostel Room No</span>
                <p className="font-semibold text-gray-800">{leave.students?.hostel_room_no}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Vertical Timeline */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-fit">
          <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-4 mb-6 flex items-center gap-2">
            <FileText size={18} className="text-indigo-600" />
            Leave Status Timeline
          </h3>

          <div className="relative pl-6 border-l border-gray-200 ml-3 space-y-8 py-2">
            
            {/* Step 1: Submitted */}
            <div className="relative">
              {/* Connector Dot */}
              <div className="absolute -left-[31px] top-1.5 bg-green-500 rounded-full border-4 border-white h-5 w-5 flex items-center justify-center shadow-sm">
                <div className="h-1.5 w-1.5 bg-white rounded-full"></div>
              </div>
              
              <div>
                <h4 className="text-sm font-bold text-gray-900">Submitted</h4>
                <p className="text-xs text-gray-500 mt-0.5">
                  {formatDate(leave.applied_at)} at {formatTime(leave.applied_at)}
                </p>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  Leave application submitted successfully and queued for review.
                </p>
              </div>
            </div>

            {/* Step 2: Under Review */}
            <div className="relative">
              {/* Connector Dot */}
              <div className={`absolute -left-[31px] top-1.5 rounded-full border-4 border-white h-5 w-5 flex items-center justify-center shadow-sm ${
                isUnderReviewDone ? 'bg-yellow-500' : 'bg-gray-200'
              }`}>
                <div className="h-1.5 w-1.5 bg-white rounded-full"></div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-gray-900">Under Review</h4>
                <p className="text-xs text-gray-500 mt-0.5">
                  {formatDate(leave.applied_at)} at {formatTime(leave.applied_at)}
                </p>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  Application is under evaluation by the hostel administration.
                </p>
              </div>
            </div>

            {/* Step 3: Approved/Rejected */}
            <div className="relative">
              {/* Connector Dot */}
              <div className={`absolute -left-[31px] top-1.5 rounded-full border-4 border-white h-5 w-5 flex items-center justify-center shadow-sm ${
                !isDecisionDone 
                  ? 'bg-gray-200' 
                  : leave.status === 'accepted' 
                    ? 'bg-green-500' 
                    : 'bg-red-500'
              }`}>
                <div className="h-1.5 w-1.5 bg-white rounded-full"></div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-gray-900">
                  {leave.status === 'accepted' 
                    ? 'Approved' 
                    : leave.status === 'rejected' 
                      ? 'Rejected' 
                      : 'Approval Decision'}
                </h4>
                {isDecisionDone && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    {formatDate(leave.updated_at)} at {formatTime(leave.updated_at)}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  {leave.status === 'accepted'
                    ? 'Warden approved your leave application. You can travel.'
                    : leave.status === 'rejected'
                      ? 'Warden rejected your leave application. Check details.'
                      : 'Awaiting hostel administrator decision.'}
                </p>
              </div>
            </div>

            {/* Step 4: Completed (future) */}
            <div className="relative">
              {/* Connector Dot */}
              <div className={`absolute -left-[31px] top-1.5 rounded-full border-4 border-white h-5 w-5 flex items-center justify-center shadow-sm ${
                isCompletedDone ? 'bg-indigo-600' : 'bg-gray-200'
              }`}>
                <div className="h-1.5 w-1.5 bg-white rounded-full"></div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-gray-900">
                  Completed {!isCompletedDone && <span className="text-xxs font-normal text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded ml-1">future</span>}
                </h4>
                <p className="text-xs text-gray-500 mt-0.5">
                  Expected end date: {formatDate(leave.end_date)}
                </p>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  {isCompletedDone 
                    ? 'Leave period is complete. Student has returned to hostel.'
                    : 'Leave completes automatically after the end date.'}
                </p>
              </div>
            </div>

          </div>
        </div>

      </div>

      {showQRModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl border border-gray-200 max-w-sm w-full p-6 relative">
            <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">Leave Verification QR</h3>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 mb-4 flex justify-center">
              {qrCodeDataUrl ? (
                <Image
                  src={qrCodeDataUrl}
                  alt="QR Code"
                  width={192}
                  height={192}
                  unoptimized
                  className="w-48 h-48"
                />
              ) : (
                <div className="w-48 h-48 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 text-center mb-6 leading-relaxed">
              Scan this QR code to verify the authenticity of this leave application.
            </p>
            <button
              onClick={() => setShowQRModal(false)}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveDetails;
