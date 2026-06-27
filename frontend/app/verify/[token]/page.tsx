'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Calendar, 
  User, 
  Clock, 
  GraduationCap,
  MessageSquare
} from 'lucide-react';
import { verifyLeaveTokenApi } from '@/lib/api';
import type { LeaveWithStudent } from '@/lib/types';

export default function VerificationPage() {
  const params = useParams();
  const token = params?.token as string;

  const [leave, setLeave] = useState<LeaveWithStudent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVerification = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await verifyLeaveTokenApi(token);
      setLeave(data);
    } catch (err) {
      console.error('Error verifying token:', err);
      setError(err instanceof Error ? err.message : 'Invalid verification token');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchVerification();
    }
  }, [token, fetchVerification]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateDuration = (startDate: string, endDate: string) => {
    const diffTime = Math.abs(new Date(endDate).getTime() - new Date(startDate).getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="text-sm font-medium text-gray-500">Verifying leave credentials...</p>
        </div>
      </div>
    );
  }

  // If token is invalid or request failed
  if (error || !leave) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-6">
          <div className="text-center">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="w-10 h-10 text-red-600" />
              </div>
            </div>
            <h2 className="mt-4 text-2xl font-bold text-gray-900">Verification Failed</h2>
            <p className="mt-2 text-sm text-gray-600">The verification token could not be validated</p>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center space-y-2">
            <p className="text-sm font-semibold text-red-800">🔴 Invalid / Expired Token</p>
            <p className="text-xs text-red-600 leading-relaxed">
              This QR code is invalid, modified, or has been revoked by the hostel administration. Please check the source of the QR code.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Calculate status states
  const todayStr = new Date().toISOString().split('T')[0];
  const isExpired = leave.status === 'accepted' && todayStr > leave.end_date;
  const isRejected = leave.status === 'rejected';
  const isApproved = leave.status === 'accepted' && !isExpired;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="max-w-xl w-full mx-auto space-y-6">
        
        {/* Header App Brand */}
        <div className="text-center">
          <div className="flex justify-center mb-2">
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-indigo-600" />
            </div>
          </div>
          <h2 className="text-lg font-bold text-gray-900 tracking-tight font-sans">LeaveX Verification Portal</h2>
        </div>

        {/* Status Banner */}
        {isApproved && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center shadow-sm">
            <div className="flex justify-center mb-2">
              <CheckCircle2 className="w-12 h-12 text-green-500" />
            </div>
            <h3 className="text-xl font-bold text-green-800">🟢 Approved</h3>
            <p className="text-xs text-green-600 mt-1 font-medium">This leave is active and approved by the warden.</p>
          </div>
        )}

        {isExpired && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center shadow-sm">
            <div className="flex justify-center mb-2">
              <AlertTriangle className="w-12 h-12 text-amber-500" />
            </div>
            <h3 className="text-xl font-bold text-amber-800">🟠 Expired</h3>
            <p className="text-xs text-amber-600 mt-1 font-medium">This leave was approved but the end date has passed.</p>
          </div>
        )}

        {isRejected && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center shadow-sm">
            <div className="flex justify-center mb-2">
              <XCircle className="w-12 h-12 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-red-800">🔴 Rejected</h3>
            <p className="text-xs text-red-600 mt-1 font-medium">This leave request was rejected by the warden.</p>
          </div>
        )}

        {!isApproved && !isExpired && !isRejected && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 text-center shadow-sm">
            <div className="flex justify-center mb-2">
              <Clock className="w-12 h-12 text-yellow-500" />
            </div>
            <h3 className="text-xl font-bold text-yellow-800">🟡 Pending Review</h3>
            <p className="text-xs text-yellow-600 mt-1 font-medium">This leave is currently pending warden approval.</p>
          </div>
        )}

        {/* Card containing details */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 space-y-6">
          
          {/* Student Profile Section */}
          <div>
            <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <User size={14} /> Student Profile
            </h4>
            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100 text-sm">
              <div>
                <span className="text-xxs text-gray-400 block uppercase font-bold">Full Name</span>
                <span className="font-semibold text-gray-800">{leave.students?.name || 'N/A'}</span>
              </div>
              <div>
                <span className="text-xxs text-gray-400 block uppercase font-bold">Registration No</span>
                <span className="font-semibold text-gray-800">{leave.students?.reg_no || 'N/A'}</span>
              </div>
              <div className="col-span-2">
                <span className="text-xxs text-gray-400 block uppercase font-bold">Hostel Room No</span>
                <span className="font-semibold text-gray-800">{leave.students?.hostel_room_no || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Leave Information Section */}
          <div>
            <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Calendar size={14} /> Leave Details
            </h4>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-xxs text-gray-400 block uppercase font-bold">Leave Type</span>
                  <span className="font-semibold text-gray-800">{leave.leave_type}</span>
                </div>
                <div>
                  <span className="text-xxs text-gray-400 block uppercase font-bold">Duration</span>
                  <span className="font-semibold text-gray-800">{calculateDuration(leave.start_date, leave.end_date)} day(s)</span>
                </div>
                <div>
                  <span className="text-xxs text-gray-400 block uppercase font-bold">Start Date</span>
                  <span className="font-semibold text-gray-800">{formatDate(leave.start_date)}</span>
                </div>
                <div>
                  <span className="text-xxs text-gray-400 block uppercase font-bold">End Date</span>
                  <span className="font-semibold text-gray-800">{formatDate(leave.end_date)}</span>
                </div>
              </div>

              {/* Remarks */}
              {leave.remarks && (
                <div className="border-t border-gray-100 pt-3">
                  <span className="text-xxs text-gray-400 block uppercase font-bold mb-1.5 flex items-center gap-1">
                    <MessageSquare size={11} /> Warden Remarks
                  </span>
                  <div className="bg-indigo-50 bg-opacity-60 rounded-lg p-3 text-xs text-indigo-900 border border-indigo-100 italic">
                    {leave.remarks}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xxs text-gray-400">
          LeaveX Security Verification Protocol. Authenticated via Supabase database services.
        </p>
      </div>
    </div>
  );
}
