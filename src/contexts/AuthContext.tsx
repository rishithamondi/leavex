import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, Admin, Student } from '../lib/supabase';

interface AuthContextType {
  user: (Admin & { userType: 'admin' }) | (Student & { userType: 'student' }) | null;
  login: (regNo: string, password: string) => Promise<{ success: boolean; userType?: 'admin' | 'student'; error?: string }>;
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
  const [user, setUser] = useState<AuthContextType['user']>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('leavex_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (regNo: string, password: string): Promise<{ success: boolean; userType?: 'admin' | 'student'; error?: string }> => {
    try {
      // First try admin login
      const { data: adminData, error: adminError } = await supabase
        .from('admins')
        .select('*')
        .eq('reg_no', regNo)
        .eq('password', password)
        .single();

      if (adminData && !adminError) {
        const adminUser = { ...adminData, userType: 'admin' as const };
        setUser(adminUser);
        localStorage.setItem('leavex_user', JSON.stringify(adminUser));
        return { success: true, userType: 'admin' };
      }

      // Then try student login
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('*')
        .eq('reg_no', regNo)
        .single();

      if (studentData) {
        // Generate expected password from DOB (YYYYMMDD format)
        const expectedPassword = new Date(studentData.dob).toISOString().slice(0, 10).replace(/-/g, '');
        
        if (password === expectedPassword) {
          const studentUser = { ...studentData, userType: 'student' as const };
          setUser(studentUser);
          localStorage.setItem('leavex_user', JSON.stringify(studentUser));
          return { success: true, userType: 'student' };
        } else {
          return { success: false, error: 'Invalid credentials' };
        }
      }

      return { success: false, error: 'Invalid credentials' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed. Please try again.' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('leavex_user');
  };

  const value = {
    user,
    login,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
