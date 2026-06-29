'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Bell,
  CheckCheck,
  Trash2,
  X,
  CircleCheckBig,
  CircleX,
  Clock3,
  FilePlus2,
  BellRing,
  Info,
} from 'lucide-react';
import { useNotifications, type AppNotification } from '@/contexts/NotificationContext';

const NotificationBell: React.FC = () => {
  const { notifications, unreadCount, markOneRead, markAllRead, clearAll, deleteOne } = useNotifications();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close panel on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    return d.toLocaleDateString();
  };

  const renderNotificationIcon = (type: AppNotification['type']) => {
    const size = 18;
    const strokeWidth = 2;
    switch (type) {
      case 'leave_submitted':
        return (
          <div className="flex items-center justify-center text-blue-600 flex-shrink-0">
            <FilePlus2 size={size} strokeWidth={strokeWidth} />
          </div>
        );
      case 'leave_accepted':
        return (
          <div className="flex items-center justify-center text-green-600 flex-shrink-0">
            <CircleCheckBig size={size} strokeWidth={strokeWidth} />
          </div>
        );
      case 'leave_rejected':
        return (
          <div className="flex items-center justify-center text-red-600 flex-shrink-0">
            <CircleX size={size} strokeWidth={strokeWidth} />
          </div>
        );
      case 'student_added':
        return (
          <div className="flex items-center justify-center text-amber-600 flex-shrink-0">
            <BellRing size={size} strokeWidth={strokeWidth} />
          </div>
        );
      case 'student_deleted':
        return (
          <div className="flex items-center justify-center text-red-600 flex-shrink-0">
            <CircleX size={size} strokeWidth={strokeWidth} />
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center text-blue-600 flex-shrink-0">
            <Info size={size} strokeWidth={strokeWidth} />
          </div>
        );
    }
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Button */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="relative p-2 rounded-lg text-gray-600 hover:text-indigo-600 transition-colors"
        aria-label="Notifications"
        title="Notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Mobile view backdrop */}
      {open && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 md:hidden animate-fade-in" onClick={() => setOpen(false)} />
      )}

      {/* Dropdown Panel */}
      {open && (
        <div className="
          fixed bottom-0 left-0 right-0 max-h-[80vh] rounded-t-2xl z-50 bg-white shadow-2xl border-t border-gray-200 overflow-y-auto animate-slide-up
          md:absolute md:bottom-auto md:left-auto md:right-0 md:top-12 md:w-80 md:rounded-xl md:shadow-lg md:border md:overflow-hidden md:animate-fade-in
        ">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
            <h3 className="text-sm font-semibold text-gray-900">
              Notifications
              {unreadCount > 0 && (
                <span className="ml-2 text-xs font-medium text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </h3>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="p-1.5 rounded text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                  title="Mark all as read"
                >
                  <CheckCheck size={14} />
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  className="p-1.5 rounded text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                  title="Clear all"
                >
                  <Trash2 size={14} />
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                title="Close"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Notification List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
            {notifications.length === 0 ? (
              <div className="py-10 text-center">
                <Bell className="mx-auto h-8 w-8 text-gray-300 mb-2" />
                <p className="text-sm text-gray-400">No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`group relative w-full text-left px-4 py-3 transition-colors hover:bg-gray-50/80 flex items-start justify-between gap-3 ${
                    !n.read ? 'bg-indigo-50/40' : 'bg-white'
                  }`}
                >
                  <button
                    onClick={() => markOneRead(n.id)}
                    className="flex-1 text-left flex items-start gap-3 min-w-0 focus:outline-none"
                  >
                    {renderNotificationIcon(n.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1.5">
                        <p className={`text-xs font-bold leading-tight ${!n.read ? 'text-gray-900 font-extrabold' : 'text-gray-700'}`}>
                          {n.title}
                        </p>
                        {!n.read && (
                          <span className="h-1.5 w-1.5 bg-indigo-500 rounded-full flex-shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-[11px] text-gray-500 mt-1 leading-relaxed line-clamp-2">{n.message}</p>
                      <p className="text-[9px] text-gray-400 font-semibold tracking-wide uppercase mt-1.5">{formatTime(n.timestamp)}</p>
                    </div>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteOne(n.id);
                    }}
                    className="p-1 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors self-center opacity-100 md:opacity-0 md:group-hover:opacity-100"
                    title="Delete notification"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
