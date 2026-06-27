'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Search, MessageSquare } from 'lucide-react';
import { getLeavesApi, updateLeaveStatusApi } from '@/lib/api';
import type { LeaveWithStudent } from '@/lib/types';
import { useNotifications } from '@/contexts/NotificationContext';

const AllApplications: React.FC = () => {
  const { addNotification, addNotificationForUser } = useNotifications();
  const [applications, setApplications] = useState<LeaveWithStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Remarks state: tracks which application is getting a remark & the text
  const [remarksState, setRemarksState] = useState<{
    appId: number | null;
    pendingStatus: 'accepted' | 'rejected' | null;
    text: string;
  }>({ appId: null, pendingStatus: null, text: '' });

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const data = await getLeavesApi();
      setApplications(data as LeaveWithStudent[]);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Step 1: clicking Accept/Reject opens the remarks input inline
  const openRemarksFor = (appId: number, status: 'accepted' | 'rejected') => {
    setRemarksState({ appId, pendingStatus: status, text: '' });
  };

  // Step 2: confirming submits the update
  const confirmStatusUpdate = async () => {
    const { appId, pendingStatus, text } = remarksState;
    if (!appId || !pendingStatus) return;

    const app = applications.find((a) => a.id === appId);

    try {
      await updateLeaveStatusApi(appId, pendingStatus, 'admin', text || undefined);
      setApplications((prev) =>
        prev.map((a) =>
          a.id === appId
            ? { ...a, status: pendingStatus, updated_at: new Date().toISOString(), remarks: text || undefined }
            : a
        )
      );

      // Notify admin
      addNotification(
        pendingStatus === 'accepted' ? 'leave_accepted' : 'leave_rejected',
        `Leave ${pendingStatus === 'accepted' ? 'Approved' : 'Rejected'}`,
        `${app?.students?.name ?? 'Student'}'s ${app?.leave_type ?? 'leave'} has been ${pendingStatus}.`
      );
      // Notify the student (written to their localStorage key for when they next login)
      if (app?.student_id) {
        addNotificationForUser(
          app.student_id,
          pendingStatus === 'accepted' ? 'leave_accepted' : 'leave_rejected',
          `Leave ${pendingStatus === 'accepted' ? 'Approved' : 'Rejected'}`,
          `Your ${app.leave_type} application (${app.start_date} → ${app.end_date}) was ${pendingStatus} by the warden.`
        );
      }
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setRemarksState({ appId: null, pendingStatus: null, text: '' });
    }
  };

  const cancelRemarks = () => {
    setRemarksState({ appId: null, pendingStatus: null, text: '' });
  };

  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.students.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.students.reg_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.leave_type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      default: return 'text-yellow-600 bg-yellow-100';
    }
  };

  const calculateDuration = (startDate: string, endDate: string) => {
    const diffTime = Math.abs(new Date(endDate).getTime() - new Date(startDate).getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-900">All Applications</h1>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-auto">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search applications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['Student', 'Leave Details', 'Duration', 'Reason', 'Status', 'Actions'].map((h) => (
                  <th
                    key={h}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredApplications.map((application) => (
                <tr key={application.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{application.students.name}</div>
                    <div className="text-sm text-gray-500">{application.students.reg_no}</div>
                    <div className="text-sm text-gray-500">
                      {application.students.year_of_study} - {application.students.branch}
                    </div>
                    <div className="text-sm text-gray-500">Room: {application.students.hostel_room_no}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{application.leave_type}</div>
                    <div className="text-sm text-gray-500">
                      {new Date(application.start_date).toLocaleDateString()} -{' '}
                      {new Date(application.end_date).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-gray-500">
                      Applied: {new Date(application.applied_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {calculateDuration(application.start_date, application.end_date)} day(s)
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div
                      className="text-sm text-gray-900 max-w-xs truncate"
                      title={application.reason}
                    >
                      {application.reason}
                    </div>
                    {/* Show existing remarks if already set */}
                    {application.remarks && (
                      <div className="mt-1 flex items-start gap-1 text-xs text-indigo-700 bg-indigo-50 px-2 py-1 rounded max-w-xs">
                        <MessageSquare size={11} className="mt-0.5 flex-shrink-0" />
                        <span className="italic truncate" title={application.remarks}>{application.remarks}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}
                    >
                      {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {application.status === 'pending' ? (
                      remarksState.appId === application.id ? (
                        /* Inline remarks input */
                        <div className="w-48 space-y-2">
                          <textarea
                            rows={2}
                            placeholder="Optional remarks..."
                            value={remarksState.text}
                            onChange={(e) =>
                              setRemarksState((prev) => ({ ...prev, text: e.target.value }))
                            }
                            className="w-full text-xs px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-indigo-400 resize-none"
                          />
                          <div className="flex gap-1">
                            <button
                              onClick={confirmStatusUpdate}
                              className={`flex-1 text-xs px-2 py-1 rounded font-medium text-white ${
                                remarksState.pendingStatus === 'accepted'
                                  ? 'bg-green-600 hover:bg-green-700'
                                  : 'bg-red-600 hover:bg-red-700'
                              }`}
                            >
                              Confirm {remarksState.pendingStatus === 'accepted' ? 'Accept' : 'Reject'}
                            </button>
                            <button
                              onClick={cancelRemarks}
                              className="px-2 py-1 text-xs rounded border border-gray-300 text-gray-600 hover:bg-gray-50"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openRemarksFor(application.id, 'accepted')}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                          >
                            <CheckCircle size={14} className="mr-1" />
                            Accept
                          </button>
                          <button
                            onClick={() => openRemarksFor(application.id, 'rejected')}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                          >
                            <XCircle size={14} className="mr-1" />
                            Reject
                          </button>
                        </div>
                      )
                    ) : (
                      <span className="text-sm text-gray-500">
                        {application.status === 'accepted' ? 'Approved' : 'Declined'}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="block md:hidden divide-y divide-gray-100">
          {filteredApplications.map((application) => (
            <div key={application.id} className="p-4 space-y-3.5">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">{application.students.name}</h3>
                  <p className="text-xs text-gray-500 font-medium">{application.students.reg_no} · Room {application.students.hostel_room_no}</p>
                  <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">{application.students.year_of_study} - {application.students.branch}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(application.status)}`}>
                  {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                </span>
              </div>

              <div className="bg-gray-50/50 p-3 rounded-lg border border-gray-100/50 space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="font-semibold text-gray-400 block uppercase tracking-wider text-[9px] mb-0.5">Leave Type</span>
                    <span className="text-gray-950 font-semibold">{application.leave_type}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-400 block uppercase tracking-wider text-[9px] mb-0.5">Duration</span>
                    <span className="text-gray-950 font-semibold">
                      {calculateDuration(application.start_date, application.end_date)} day(s)
                    </span>
                  </div>
                </div>
                <div>
                  <span className="font-semibold text-gray-400 block uppercase tracking-wider text-[9px] mb-0.5">Dates</span>
                  <span className="text-gray-900 font-medium">
                    {new Date(application.start_date).toLocaleDateString()} -{' '}
                    {new Date(application.end_date).toLocaleDateString()}
                  </span>
                  <span className="text-[10px] text-gray-400 block mt-0.5">
                    Applied: {new Date(application.applied_at).toLocaleDateString()} at {new Date(application.applied_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-gray-400 block uppercase tracking-wider text-[9px] mb-0.5">Reason</span>
                  <p className="text-gray-800 break-words leading-relaxed">{application.reason}</p>
                </div>

                {application.remarks && (
                  <div className="flex items-start gap-1.5 text-xs text-indigo-700 bg-indigo-50 border border-indigo-100/50 px-2 py-1.5 rounded-md mt-1">
                    <MessageSquare size={12} className="mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <span className="font-bold text-[9px] uppercase tracking-wider text-indigo-500 block">Warden Remarks</span>
                      <p className="italic break-words">{application.remarks}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="pt-1 flex flex-col sm:flex-row gap-2">
                {application.status === 'pending' ? (
                  remarksState.appId === application.id ? (
                    /* Inline remarks input on mobile */
                    <div className="w-full space-y-2 bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                        Remarks for {remarksState.pendingStatus === 'accepted' ? 'Approval' : 'Rejection'}
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Provide optional remarks..."
                        value={remarksState.text}
                        onChange={(e) =>
                          setRemarksState((prev) => ({ ...prev, text: e.target.value }))
                        }
                        className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none bg-white"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={confirmStatusUpdate}
                          className={`flex-1 text-xs px-3 py-2 rounded-lg font-semibold text-white transition-colors ${
                            remarksState.pendingStatus === 'accepted'
                              ? 'bg-green-600 hover:bg-green-700'
                              : 'bg-red-600 hover:bg-red-700'
                          }`}
                        >
                          Confirm {remarksState.pendingStatus === 'accepted' ? 'Accept' : 'Reject'}
                        </button>
                        <button
                          onClick={cancelRemarks}
                          className="px-3 py-2 text-xs rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition-colors bg-white font-medium"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2 w-full">
                      <button
                        onClick={() => openRemarksFor(application.id, 'accepted')}
                        className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-xs font-semibold rounded-lg text-white bg-green-600 hover:bg-green-700 transition-colors"
                      >
                        <CheckCircle size={14} className="mr-1.5" />
                        Accept
                      </button>
                      <button
                        onClick={() => openRemarksFor(application.id, 'rejected')}
                        className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-xs font-semibold rounded-lg text-white bg-red-600 hover:bg-red-700 transition-colors"
                      >
                        <XCircle size={14} className="mr-1.5" />
                        Reject
                      </button>
                    </div>
                  )
                ) : (
                  <div className="text-right text-xs font-semibold text-gray-500 w-full py-1">
                    Processed as:{' '}
                    <span className={application.status === 'accepted' ? 'text-green-600' : 'text-red-600'}>
                      {application.status === 'accepted' ? 'Approved' : 'Declined'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredApplications.length === 0 && (
          <div className="text-center py-12">
            <Clock className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No applications found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your search criteria or filters.'
                : 'No leave applications have been submitted yet.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllApplications;
