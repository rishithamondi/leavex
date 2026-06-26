import { redirect } from 'next/navigation';

// Always redirect root to /login.
// The login page handles redirecting authenticated users to their dashboard.
export default function Home() {
  redirect('/login');
}
