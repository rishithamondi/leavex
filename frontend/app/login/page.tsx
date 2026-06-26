'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import LoginPage from '@/components/Auth/LoginPage';

// GuestRoute equivalent: redirect authenticated users away from /login
export default function LoginRoute() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      const redirectTo =
        user.userType === 'admin' ? '/admin/dashboard' : '/student/dashboard';
      router.replace(redirectTo);
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Render nothing while redirect fires for authenticated users
  if (user) return null;

  return <LoginPage />;
}
