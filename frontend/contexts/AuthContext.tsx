'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { loginApi } from '@/lib/api';
import type { Admin, Student } from '@/lib/types';

type AuthUser =
  | (Admin & { userType: 'admin' })
  | (Student & { userType: 'student' })
  | null;

interface AuthContextType {
  user: AuthUser;
  login: (
    regNo: string,
    password: string
  ) => Promise<{ success: boolean; userType?: 'admin' | 'student'; error?: string }>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // localStorage is only available on the client — useEffect ensures this
    const storedUser = localStorage.getItem('leavex_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (
    regNo: string,
    password: string
  ): Promise<{ success: boolean; userType?: 'admin' | 'student'; error?: string }> => {
    try {
      const result = await loginApi(regNo, password);
      const authUser = { ...result.user, userType: result.userType };
      setUser(authUser as AuthUser);
      localStorage.setItem('leavex_user', JSON.stringify(authUser));
      return { success: true, userType: result.userType };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Login failed. Please try again.',
      };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('leavex_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
