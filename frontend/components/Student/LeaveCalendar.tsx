'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Info, X, CheckCircle2, Clock3, CircleX } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getLeavesApi } from '@/lib/api';
import type { Leave } from '@/lib/types';

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
}

const LeaveCalendar: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);

  // Calendar view state
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());

  useEffect(() => {
    if (user?.userType === 'student') {
      fetchLeaves();
    }
  }, [user]);

  const fetchLeaves = async () => {
    if (user?.userType !== 'student') return;
    try {
      const data = await getLeavesApi(user.id);
      setLeaves(data as Leave[]);
    } catch (error) {
      console.error('Error fetching leaves:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date: Date): CalendarDay[] => {
    const year = date.getFullYear();
    const month = date.getMonth(); // 0-indexed
    
    // First day of current month
    const firstDay = new Date(year, month, 1);
    // Day of the week for the 1st day (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
    const firstDayIndex = firstDay.getDay();

    const days: CalendarDay[] = [];

    // Previous month's padding days
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const daysInPrevMonth = new Date(prevYear, prevMonth + 1, 0).getDate();

    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      days.push({
        date: new Date(prevYear, prevMonth, dayNum),
        isCurrentMonth: false,
      });
    }

    // Current month's days
    const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
    for (let i = 1; i <= daysInCurrentMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
      });
    }

    // Next month's padding days to make it exactly 42 cells (6 rows of 7 columns)
    const totalCells = 42;
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    const nextMonthDaysNeeded = totalCells - days.length;

    for (let i = 1; i <= nextMonthDaysNeeded; i++) {
      days.push({
        date: new Date(nextYear, nextMonth, i),
        isCurrentMonth: false,
      });
    }

    return days;
  };

  const formatDateString = (d: Date): string => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const isToday = (d: Date): boolean => {
    return formatDateString(d) === formatDateString(new Date());
  };

  const isWeekend = (d: Date): boolean => {
    const dayOfWeek = d.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday
  };

  const getLeavesForDate = (d: Date): Leave[] => {
    const dateStr = formatDateString(d);
    return leaves.filter((leave) => {
      // Comparison by YYYY-MM-DD
      return leave.start_date <= dateStr && dateStr <= leave.end_date;
    });
  };

  const handlePrevMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleGoToToday = () => {
    setCurrentDate(new Date());
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100';
      case 'rejected':
        return 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100';
      default:
        return 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100';
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const daysGrid = getDaysInMonth(currentDate);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CalendarIcon className="h-6 w-6 text-indigo-600" />
            Leave Calendar
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            View all your submitted, approved, and rejected leave applications in a monthly calendar.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-medium bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            Approved
          </span>
          <span className="flex items-center gap-1.5">
            <Clock3 className="h-4 w-4 text-yellow-600" />
            Pending
          </span>
          <span className="flex items-center gap-1.5">
            <CircleX className="h-4 w-4 text-red-600" />
            Rejected
          </span>
        </div>
      </div>

      {/* Calendar Controls */}
      <div className="bg-white rounded-t-xl border-t border-l border-r border-gray-200 p-4 flex items-center justify-center shadow-sm">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevMonth}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"
            title="Previous Month"
          >
            <ChevronLeft size={20} />
          </button>
          <h2 className="text-lg font-bold text-gray-800 min-w-[140px] text-center">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <button
            onClick={handleNextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"
            title="Next Month"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Calendar Body */}
      <div className="bg-white rounded-b-xl border border-gray-200 overflow-hidden shadow-sm">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {weekdayNames.map((name) => (
            <div key={name} className="py-3 border-r border-gray-200 last:border-r-0">
              {name}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 grid-rows-6">
          {daysGrid.map((day, idx) => {
            const dateLeaves = getLeavesForDate(day.date);
            const isDayWeekend = isWeekend(day.date);
            const isDayToday = isToday(day.date);
            const isSelected = formatDateString(day.date) === formatDateString(selectedDate);
            
            const approvedCount = dateLeaves.filter(l => l.status === 'accepted').length;
            const pendingCount = dateLeaves.filter(l => l.status === 'pending').length;
            const rejectedCount = dateLeaves.filter(l => l.status === 'rejected').length;
            const totalCount = dateLeaves.length;

            const getHeatmapClass = (count: number) => {
              if (count === 0) return '';
              if (count === 1) return 'bg-indigo-50/20 hover:bg-indigo-100/30';
              if (count === 2) return 'bg-indigo-50/45 hover:bg-indigo-100/50';
              if (count >= 3 && count <= 5) return 'bg-indigo-100/50 hover:bg-indigo-200/60';
              return 'bg-indigo-200/65 hover:bg-indigo-300/70';
            };

            const bgClass = totalCount > 0 
              ? getHeatmapClass(totalCount)
              : (isDayWeekend ? 'bg-gray-50/70' : 'bg-white');

            return (
              <div
                key={idx}
                onClick={() => {
                  setSelectedDate(day.date);
                }}
                className={`min-h-[75px] md:min-h-[85px] p-1.5 border-r border-b border-gray-200 last:border-r-0 relative flex flex-col justify-between cursor-pointer transition-colors ${bgClass} ${
                  isSelected ? 'ring-2 ring-indigo-500 z-10' : ''
                }`}
              >
                {/* Date Label */}
                <div className="flex justify-between items-center mb-0.5">
                  <span
                    className={`inline-flex items-center justify-center text-xs md:text-sm font-semibold rounded-full w-6 h-6 md:w-7 md:h-7 ${
                      isDayToday
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : !day.isCurrentMonth
                        ? 'text-gray-400 font-normal'
                        : 'text-gray-700'
                    }`}
                  >
                    {day.date.getDate()}
                  </span>
                </div>

                {/* Status Summaries inside date */}
                <div className="flex items-center justify-center gap-1 w-full mt-auto flex-wrap">
                  {approvedCount > 0 && (
                    <div className="flex items-center text-[10px] font-semibold text-green-600" title={`${approvedCount} Approved`}>
                      <CheckCircle2 size={12} className="flex-shrink-0" />
                      <span className="ml-0.5">{approvedCount}</span>
                    </div>
                  )}
                  {pendingCount > 0 && (
                    <div className="flex items-center text-[10px] font-semibold text-yellow-600" title={`${pendingCount} Pending`}>
                      <Clock3 size={12} className="flex-shrink-0" />
                      <span className="ml-0.5">{pendingCount}</span>
                    </div>
                  )}
                  {rejectedCount > 0 && (
                    <div className="flex items-center text-[10px] font-semibold text-red-600" title={`${rejectedCount} Rejected`}>
                      <CircleX size={12} className="flex-shrink-0" />
                      <span className="ml-0.5">{rejectedCount}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Day Leaves Details Inline Panel */}
      <div
        key={selectedDate.toString()}
        className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-fade-in-up"
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4.5 w-4.5 text-indigo-600" />
            <h3 className="text-sm font-bold text-gray-900">
              My Leave Details for {selectedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
            </h3>
          </div>
          <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200 whitespace-nowrap flex-shrink-0">
            {getLeavesForDate(selectedDate).length} {getLeavesForDate(selectedDate).length === 1 ? 'request' : 'requests'}
          </span>
        </div>

        {/* Content Body */}
        {(() => {
          const dateLeaves = getLeavesForDate(selectedDate);
          const totalCount = dateLeaves.length;

          if (totalCount === 0) {
            return (
              <div className="p-8 text-center text-gray-500">
                <div className="flex flex-col items-center justify-center space-y-2">
                  <CalendarIcon className="h-10 w-10 text-gray-300" />
                  <p className="text-sm font-semibold text-gray-700">No leave requests for this day</p>
                  <p className="text-xs text-gray-400">Select another date in the calendar to view its scheduled leaves.</p>
                </div>
              </div>
            );
          }

          if (totalCount === 1) {
            const leave = dateLeaves[0];
            const diffTime = Math.abs(new Date(leave.end_date).getTime() - new Date(leave.start_date).getTime());
            const duration = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            const statusTitle = leave.status === 'accepted' ? 'Approved' : leave.status === 'rejected' ? 'Rejected' : 'Pending';
            const statusColorClass = leave.status === 'accepted' ? 'text-green-700 bg-green-50 border-green-200' : leave.status === 'rejected' ? 'text-red-700 bg-red-50 border-red-200' : 'text-yellow-700 bg-yellow-50 border-yellow-200';

            return (
              <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1 ${statusColorClass}`}>
                      {leave.status === 'accepted' ? (
                        <CheckCircle2 size={10} className="flex-shrink-0" />
                      ) : leave.status === 'rejected' ? (
                        <CircleX size={10} className="flex-shrink-0" />
                      ) : (
                        <Clock3 size={10} className="flex-shrink-0" />
                      )}
                      {statusTitle}
                    </span>
                    <span className="text-xs text-gray-400 font-mono">ID: #{leave.id}</span>
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-gray-900">{leave.leave_type}</h4>
                  </div>

                  <div className="text-xs sm:text-sm text-gray-700 space-y-1.5 bg-gray-50 p-3.5 rounded-xl border border-gray-100 max-w-3xl">
                    <p><strong>Duration:</strong> {duration} day(s)</p>
                    <p><strong>Dates:</strong> {new Date(leave.start_date).toLocaleDateString()} to {new Date(leave.end_date).toLocaleDateString()}</p>
                    {leave.reason && (
                      <p className="mt-2 text-xs text-gray-500 italic border-t border-gray-200 pt-2">
                        &quot;{leave.reason}&quot;
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex-shrink-0 self-start md:self-center">
                  <button
                    onClick={() => router.push(`/student/leaves/${leave.id}`)}
                    className="w-full md:w-auto px-4 py-2 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors"
                  >
                    View Timeline
                  </button>
                </div>
              </div>
            );
          }

          // Multiple leaves
          return (
            <div className="p-5 max-h-[380px] overflow-y-auto space-y-6 scrollbar-thin">
              {['pending', 'accepted', 'rejected'].map((status) => {
                const statusLeaves = dateLeaves.filter(l => l.status === status);
                if (statusLeaves.length === 0) return null;

                const statusTitle = status === 'accepted' ? 'Approved' : status === 'rejected' ? 'Rejected' : 'Pending';
                const statusColorClass = status === 'accepted' ? 'text-green-700 bg-green-50 border-green-200' : status === 'rejected' ? 'text-red-700 bg-red-55 border-red-200' : 'text-yellow-700 bg-yellow-50 border-yellow-200';

                return (
                  <div key={status} className="space-y-3">
                    <h4 className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${statusColorClass}`}>
                      {status === 'accepted' ? (
                        <CheckCircle2 size={10} className="flex-shrink-0" />
                      ) : status === 'rejected' ? (
                        <CircleX size={10} className="flex-shrink-0" />
                      ) : (
                        <Clock3 size={10} className="flex-shrink-0" />
                      )}
                      {statusTitle} ({statusLeaves.length})
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-1">
                      {statusLeaves.map((leave) => {
                        const diffTime = Math.abs(new Date(leave.end_date).getTime() - new Date(leave.start_date).getTime());
                        const duration = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        return (
                          <div
                            key={leave.id}
                            onClick={() => router.push(`/student/leaves/${leave.id}`)}
                            className="p-4 bg-gray-50/50 hover:bg-gray-50 border border-gray-100 rounded-xl cursor-pointer transition-colors space-y-2 hover:shadow-sm flex flex-col justify-between"
                          >
                            <div>
                              <div className="flex justify-between items-start">
                                <p className="font-bold text-gray-900 text-sm">{leave.leave_type}</p>
                                <span className="text-[10px] text-gray-400 font-mono">#{leave.id}</span>
                              </div>

                              <div className="text-xs text-gray-600 space-y-1 bg-white p-2.5 rounded-lg border border-gray-100/50 mt-2">
                                <p><strong>Duration:</strong> {duration} day(s)</p>
                                <p><strong>Dates:</strong> {new Date(leave.start_date).toLocaleDateString()} - {new Date(leave.end_date).toLocaleDateString()}</p>
                                {leave.reason && (
                                  <p className="mt-1.5 text-gray-500 italic border-t border-gray-200 pt-1.5 text-[11px] truncate">
                                    &quot;{leave.reason}&quot;
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}
      </div>

      {/* Embedded CSS for fadeInUp animation */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>


    </div>
  );
};

export default LeaveCalendar;
