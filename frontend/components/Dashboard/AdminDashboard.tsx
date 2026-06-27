'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Activity, 
  ArrowRight, 
  Calendar,
  LogOut,
  LogIn,
  CheckCircle2,
  Clock3,
  CircleX
} from 'lucide-react';
import { getAdminStatsApi, getLeavesApi, type AdminStats } from '@/lib/api';
import type { LeaveWithStudent } from '@/lib/types';

interface ActivityEvent {
  id: string;
  leaveId: number;
  studentName: string;
  action: string;
  detail: string;
  timestamp: Date;
  type: 'applied' | 'accepted' | 'rejected';
}

const AdminDashboard: React.FC = () => {
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats>({
    totalStudents: 0,
    totalApplications: 0,
    pendingApplications: 0,
    acceptedApplications: 0,
    rejectedApplications: 0,
  });
  const [leaves, setLeaves] = useState<LeaveWithStudent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsData, leavesData] = await Promise.all([
        getAdminStatsApi(),
        getLeavesApi()
      ]);
      setStats(statsData);
      setLeaves(leavesData as LeaveWithStudent[]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get current date string in YYYY-MM-DD local format
  const getTodayStr = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const todayStr = getTodayStr();

  // 1. Monthly Leave Trend (Last 6 Months)
  const getMonthlyTrendData = () => {
    const monthNamesList = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const trend: Array<{ label: string; monthIndex: number; year: number; count: number }> = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mIndex = d.getMonth();
      const y = d.getFullYear();
      trend.push({
        label: `${monthNamesList[mIndex]} ${y.toString().slice(-2)}`,
        monthIndex: mIndex,
        year: y,
        count: 0
      });
    }

    leaves.forEach((l) => {
      if (!l.applied_at) return;
      const appliedDate = new Date(l.applied_at);
      const leaveMonth = appliedDate.getMonth();
      const leaveYear = appliedDate.getFullYear();

      const match = trend.find(t => t.monthIndex === leaveMonth && t.year === leaveYear);
      if (match) {
        match.count += 1;
      }
    });

    return trend;
  };

  const trendData = getMonthlyTrendData();
  const maxTrendCount = Math.max(...trendData.map(t => t.count), 1);

  // 2. Leave Status Distribution (Donut Chart percentages)
  const totalApps = stats.pendingApplications + stats.acceptedApplications + stats.rejectedApplications;
  const pendingPercent = totalApps > 0 ? (stats.pendingApplications / totalApps) * 100 : 0;
  const acceptedPercent = totalApps > 0 ? (stats.acceptedApplications / totalApps) * 100 : 0;
  const rejectedPercent = totalApps > 0 ? (stats.rejectedApplications / totalApps) * 100 : 0;

  // Donut chart stroke metrics
  const radius = 36;
  const circumference = 2 * Math.PI * radius; // ~226.2
  const strokeA = (acceptedPercent / 100) * circumference;
  const strokeP = (pendingPercent / 100) * circumference;
  const strokeR = (rejectedPercent / 100) * circumference;

  // 3. Leave Type Distribution
  const getLeaveTypeData = () => {
    const typeCounts: { [key: string]: number } = {};
    leaves.forEach((l) => {
      const t = l.leave_type || 'Other';
      typeCounts[t] = (typeCounts[t] || 0) + 1;
    });

    return Object.keys(typeCounts)
      .map((type) => ({
        type,
        count: typeCounts[type],
        percentage: leaves.length > 0 ? (typeCounts[type] / leaves.length) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  const leaveTypeData = getLeaveTypeData();

  // 4. Students Currently Outside
  const outsideStudents = leaves.filter((l) => {
    return l.status === 'accepted' && l.start_date <= todayStr && todayStr <= l.end_date;
  });

  // 5. Students Returning Today
  const returningStudents = leaves.filter((l) => {
    return l.status === 'accepted' && l.end_date === todayStr;
  });

  // 6. Recent Activity Timeline
  const getRecentActivity = (): ActivityEvent[] => {
    const events: ActivityEvent[] = [];

    leaves.forEach((l) => {
      const sName = l.students?.name || 'Student';
      
      // Submit Event
      if (l.applied_at) {
        events.push({
          id: `applied-${l.id}`,
          leaveId: l.id,
          studentName: sName,
          action: 'applied for',
          detail: l.leave_type,
          timestamp: new Date(l.applied_at),
          type: 'applied'
        });
      }

      // Review Event
      if (l.status !== 'pending' && l.updated_at) {
        events.push({
          id: `decided-${l.id}`,
          leaveId: l.id,
          studentName: sName,
          action: l.status === 'accepted' ? 'approved for' : 'rejected for',
          detail: l.leave_type,
          timestamp: new Date(l.updated_at),
          type: l.status
        });
      }
    });

    return events
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 6);
  };

  const recentActivities = getRecentActivity();

  const formatRelativeTime = (date: Date) => {
    const diffMs = new Date().getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  const statCards = [
    { title: 'Total Students', value: stats.totalStudents, icon: Users, color: 'bg-blue-500' },
    { title: 'Total Applications', value: stats.totalApplications, icon: FileText, color: 'bg-purple-500' },
    { title: 'Pending Applications', value: stats.pendingApplications, icon: Clock, color: 'bg-yellow-500' },
    { title: 'Accepted Applications', value: stats.acceptedApplications, icon: CheckCircle, color: 'bg-green-500' },
    { title: 'Rejected Applications', value: stats.rejectedApplications, icon: XCircle, color: 'bg-red-500' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Real-time stats, leave trends, and student outside status summaries.</p>
      </div>

      {/* Top Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center justify-between hover:shadow-md transition-shadow">
              <div className="space-y-1">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">{card.title}</h3>
                <p className="text-3xl font-bold text-gray-900">{card.value}</p>
              </div>
              <div className="text-indigo-600 flex items-center justify-center p-2">
                <Icon className="h-6 w-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Row 1: Monthly Trend & Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Monthly Leave Trend */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:col-span-2 flex flex-col justify-between">
          <div className="mb-4">
            <h2 className="text-base font-bold text-gray-900">Monthly Leave Trend</h2>
            <p className="text-xs text-gray-500">Volume of leave applications submitted over the past 6 months</p>
          </div>
          
          {/* Custom SVG Bar Chart */}
          <div className="h-[200px] w-full flex items-end">
            <svg viewBox="0 0 500 220" className="w-full h-full" preserveAspectRatio="none">
              {/* Grid Lines */}
              <line x1="40" y1="170" x2="480" y2="170" stroke="#E5E7EB" strokeWidth="1.5" />
              <line x1="40" y1="100" x2="480" y2="100" stroke="#F3F4F6" strokeWidth="1" strokeDasharray="4" />
              <line x1="40" y1="30" x2="480" y2="30" stroke="#F3F4F6" strokeWidth="1" strokeDasharray="4" />
              
              {/* Bars */}
              {trendData.map((data, idx) => {
                const barWidth = 32;
                const gap = (440 - (trendData.length * barWidth)) / (trendData.length - 1);
                const x = 40 + idx * (barWidth + gap);
                const barHeight = (data.count / maxTrendCount) * 140;
                const y = 170 - barHeight;

                return (
                  <g key={idx} className="group">
                    {/* Bar Rect */}
                    <rect
                      x={x}
                      y={y}
                      width={barWidth}
                      height={barHeight}
                      fill="url(#indigoGrad)"
                      rx="4"
                      className="transition-all duration-300 hover:fill-indigo-500 cursor-pointer"
                    />
                    {/* Value label on top of bar */}
                    {data.count > 0 && (
                      <text
                        x={x + barWidth / 2}
                        y={y - 8}
                        textAnchor="middle"
                        className="text-[10px] font-bold fill-indigo-600 transition-opacity"
                      >
                        {data.count}
                      </text>
                    )}
                    {/* X Axis Label */}
                    <text
                      x={x + barWidth / 2}
                      y="190"
                      textAnchor="middle"
                      className="text-[10px] font-medium fill-gray-400 group-hover:fill-gray-900 transition-colors"
                    >
                      {data.label}
                    </text>
                  </g>
                );
              })}

              {/* Definitions for Gradient */}
              <defs>
                <linearGradient id="indigoGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366F1" />
                  <stop offset="100%" stopColor="#818CF8" stopOpacity="0.4" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-900">Status Distribution</h2>
            <p className="text-xs text-gray-500">Breakdown of application decision statuses</p>
          </div>

          {/* SVG Donut Chart */}
          <div className="relative flex items-center justify-center my-4">
            <svg width="160" height="160" viewBox="0 0 100 100" className="transform -rotate-90">
              {totalApps === 0 ? (
                /* Empty placeholder state */
                <circle cx="50" cy="50" r={radius} fill="transparent" stroke="#F3F4F6" strokeWidth="10" />
              ) : (
                <>
                  {/* Approved Circle */}
                  {acceptedPercent > 0 && (
                    <circle
                      cx="50"
                      cy="50"
                      r={radius}
                      fill="transparent"
                      stroke="#10B981"
                      strokeWidth="10"
                      strokeDasharray={`${strokeA} ${circumference}`}
                      strokeDashoffset="0"
                    />
                  )}
                  {/* Pending Circle */}
                  {pendingPercent > 0 && (
                    <circle
                      cx="50"
                      cy="50"
                      r={radius}
                      fill="transparent"
                      stroke="#F59E0B"
                      strokeWidth="10"
                      strokeDasharray={`${strokeP} ${circumference}`}
                      strokeDashoffset={`-${strokeA}`}
                    />
                  )}
                  {/* Rejected Circle */}
                  {rejectedPercent > 0 && (
                    <circle
                      cx="50"
                      cy="50"
                      r={radius}
                      fill="transparent"
                      stroke="#EF4444"
                      strokeWidth="10"
                      strokeDasharray={`${strokeR} ${circumference}`}
                      strokeDashoffset={`-${strokeA + strokeP}`}
                    />
                  )}
                </>
              )}
            </svg>
            
            {/* Center Label */}
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-gray-900">{totalApps}</span>
              <span className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">Total</span>
            </div>
          </div>

          {/* Legend and stats */}
          <div className="grid grid-cols-3 gap-2 border-t border-gray-100 pt-4 text-center">
            <div>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full mb-1">
                <CheckCircle2 size={12} className="text-emerald-500" />
                Approved
              </span>
              <p className="text-sm font-bold text-gray-800">{stats.acceptedApplications}</p>
              <p className="text-[10px] text-gray-400">{acceptedPercent.toFixed(0)}%</p>
            </div>
            <div>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full mb-1">
                <Clock3 size={12} className="text-amber-500" />
                Pending
              </span>
              <p className="text-sm font-bold text-gray-800">{stats.pendingApplications}</p>
              <p className="text-[10px] text-gray-400">{pendingPercent.toFixed(0)}%</p>
            </div>
            <div>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full mb-1">
                <CircleX size={12} className="text-red-500" />
                Rejected
              </span>
              <p className="text-sm font-bold text-gray-800">{stats.rejectedApplications}</p>
              <p className="text-[10px] text-gray-400">{rejectedPercent.toFixed(0)}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Leave Type Distribution & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        {/* Leave Type Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:col-span-2 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-900">Leave Types</h2>
            <p className="text-xs text-gray-500 mb-6">Popular types of leave requested by students</p>
            
            <div className="space-y-4">
              {leaveTypeData.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">No leave records to display</div>
              ) : (
                leaveTypeData.map((data, idx) => {
                  const colors = ['bg-indigo-600', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-blue-500'];
                  const barColor = colors[idx % colors.length];
                  
                  return (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold text-gray-700">
                        <span>{data.type}</span>
                        <span>{data.count} ({data.percentage.toFixed(0)}%)</span>
                      </div>
                      <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                          style={{ width: `${data.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:col-span-3 flex flex-col justify-between">
          <div className="mb-4">
            <h2 className="text-base font-bold text-gray-900">Recent Activity</h2>
            <p className="text-xs text-gray-500">Live timeline of recent application statuses and updates</p>
          </div>

          <div className="relative pl-4 border-l border-gray-200 space-y-5 my-2 ml-2 flex-1">
            {recentActivities.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">No activity recorded yet</div>
            ) : (
              recentActivities.map((act) => {
                let colorClass = 'bg-yellow-100 text-yellow-700 border-yellow-300';
                let Icon = Clock;
                if (act.type === 'accepted') {
                  colorClass = 'bg-green-100 text-green-700 border-green-300';
                  Icon = LogOut;
                } else if (act.type === 'rejected') {
                  colorClass = 'bg-red-100 text-red-700 border-red-300';
                  Icon = XCircle;
                }

                return (
                  <div key={act.id} className="relative group">
                    {/* Activity node dot */}
                    <div className="absolute -left-[27px] top-0.5 bg-white border border-gray-200 rounded-full p-1 shadow-sm group-hover:scale-110 transition-transform">
                      <div className={`h-3 w-3 rounded-full flex items-center justify-center ${act.type === 'applied' ? 'bg-indigo-500' : act.type === 'accepted' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    </div>

                    <div className="flex justify-between items-start text-xs">
                      <div>
                        <p className="text-gray-800 leading-relaxed">
                          <span className="font-bold text-gray-900">{act.studentName}</span>{' '}
                          <span className={`${act.type === 'applied' ? 'text-indigo-600 font-semibold' : act.type === 'accepted' ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}`}>
                            {act.action}
                          </span>{' '}
                          <span className="font-medium text-gray-800 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">{act.detail}</span>
                        </p>
                        <button 
                          onClick={() => router.push(`/admin/leaves/${act.leaveId}`)}
                          className="mt-1 inline-flex items-center gap-0.5 text-[10px] text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
                        >
                          View Details <ArrowRight size={10} />
                        </button>
                      </div>
                      <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">
                        {formatRelativeTime(act.timestamp)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* Row 3: Students Outside & Students Returning Today */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Students Currently Outside */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between">
          <div className="mb-4 flex justify-between items-center">
            <div>
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
                Students Outside
              </h2>
              <p className="text-xs text-gray-500">Students currently checked out on approved leave</p>
            </div>
            <span className="text-xs font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded-lg">
              {outsideStudents.length} outside
            </span>
          </div>

          <div className="max-h-[300px] overflow-y-auto space-y-3 flex-1 scrollbar-thin">
            {outsideStudents.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-sm border border-dashed border-gray-100 rounded-xl">
                All students are currently inside the hostel.
              </div>
            ) : (
              outsideStudents.map((l) => (
                <div key={l.id} className="p-3 bg-gray-50/50 hover:bg-gray-50 border border-gray-100 rounded-xl flex justify-between items-center text-xs transition-colors">
                  <div className="space-y-0.5">
                    <p className="font-bold text-gray-900">{l.students?.name}</p>
                    <p className="text-gray-500">{l.students?.reg_no} · Room {l.students?.hostel_room_no}</p>
                    <p className="text-indigo-600 font-medium">{l.leave_type}</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg">
                      Returns: {new Date(l.end_date).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
                    </span>
                    <button 
                      onClick={() => router.push(`/admin/leaves/${l.id}`)}
                      className="block mt-2 text-[10px] text-indigo-600 hover:underline text-right w-full"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Students Returning Today */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between">
          <div className="mb-4 flex justify-between items-center">
            <div>
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-indigo-600" />
                Returning Today
              </h2>
              <p className="text-xs text-gray-500">Students whose approved leaves end today ({new Date().toLocaleDateString(undefined, {month: 'short', day: 'numeric'})})</p>
            </div>
            <span className="text-xs font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded-lg">
              {returningStudents.length} due
            </span>
          </div>

          <div className="max-h-[300px] overflow-y-auto space-y-3 flex-1 scrollbar-thin">
            {returningStudents.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-sm border border-dashed border-gray-100 rounded-xl">
                No student returns scheduled for today.
              </div>
            ) : (
              returningStudents.map((l) => (
                <div key={l.id} className="p-3 bg-gray-50/50 hover:bg-gray-50 border border-gray-100 rounded-xl flex justify-between items-center text-xs transition-colors">
                  <div className="space-y-0.5">
                    <p className="font-bold text-gray-900">{l.students?.name}</p>
                    <p className="text-gray-500">{l.students?.reg_no} · Room {l.students?.hostel_room_no}</p>
                    <p className="text-indigo-600 font-medium">{l.leave_type}</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-100 rounded-lg">
                      Due Today
                    </span>
                    <button 
                      onClick={() => router.push(`/admin/leaves/${l.id}`)}
                      className="block mt-2 text-[10px] text-indigo-600 hover:underline text-right w-full"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default AdminDashboard;
