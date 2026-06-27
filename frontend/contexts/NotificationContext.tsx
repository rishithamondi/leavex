'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { useAuth } from '@/contexts/AuthContext';

// ─── Types ─────────────────────────────────────────────────────────────────
export type NotificationType =
  | 'leave_submitted'
  | 'leave_accepted'
  | 'leave_rejected'
  | 'student_added'
  | 'student_deleted'
  | 'student_updated';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  addNotification: (type: NotificationType, title: string, message: string) => void;
  /** Write a notification directly into another user's localStorage store (cross-user push). */
  addNotificationForUser: (
    targetUserId: number,
    type: NotificationType,
    title: string,
    message: string
  ) => void;
  markOneRead: (id: string) => void;
  markAllRead: () => void;
  clearAll: () => void;
}

// ─── Context ────────────────────────────────────────────────────────────────
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
};

// ─── Storage helpers ─────────────────────────────────────────────────────────
const storageKey = (userId: string | number) => `leavex_notifications_${userId}`;

const loadFromStorage = (userId: string | number): AppNotification[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(storageKey(userId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveToStorage = (userId: string | number, data: AppNotification[]) => {
  if (typeof window === 'undefined') return;
  try {
    // Keep only the last 50 notifications
    localStorage.setItem(storageKey(userId), JSON.stringify(data.slice(0, 50)));
  } catch {
    /* storage full — ignore */
  }
};

// ─── Provider ────────────────────────────────────────────────────────────────
export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // Load when user changes
  useEffect(() => {
    if (user) {
      setNotifications(loadFromStorage(user.id));
    } else {
      setNotifications([]);
    }
  }, [user]);

  // Persist whenever notifications change
  useEffect(() => {
    if (user) {
      saveToStorage(user.id, notifications);
    }
  }, [notifications, user]);

  const addNotification = useCallback(
    (type: NotificationType, title: string, message: string) => {
      const newNote: AppNotification = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        type,
        title,
        message,
        timestamp: new Date().toISOString(),
        read: false,
      };
      setNotifications((prev) => [newNote, ...prev]);
    },
    []
  );

  /**
   * Write a notification directly to another user's localStorage store.
   * Useful for admin pushing accept/reject notifications to the student.
   */
  const addNotificationForUser = useCallback(
    (targetUserId: number, type: NotificationType, title: string, message: string) => {
      if (typeof window === 'undefined') return;
      try {
        const key = storageKey(targetUserId);
        const existing: AppNotification[] = JSON.parse(localStorage.getItem(key) || '[]');
        const newNote: AppNotification = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          type,
          title,
          message,
          timestamp: new Date().toISOString(),
          read: false,
        };
        localStorage.setItem(key, JSON.stringify([newNote, ...existing].slice(0, 50)));
      } catch {
        /* storage full — ignore */
      }
    },
    []
  );

  const markOneRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, addNotification, addNotificationForUser, markOneRead, markAllRead, clearAll }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
