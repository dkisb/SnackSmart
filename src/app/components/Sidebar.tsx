'use client';

import { useAuth } from '../providers/AuthProvider';
import ErrorPage from './ErrorPage';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

export default function Sidebar() {
  const { user, logout, isReady } = useAuth();

  if (!isReady) return null;

  return (
    <aside className="w-64 bg-[#111] text-[#F5F5F5] p-4 border-r border-[#333]">
      <h2 className="text-xl font-bold mb-4 text-[#FFD700]">SnackSmart</h2>

      {!user ? (
        <div className="space-y-6">
          <ErrorPage message="No User found" />
        </div>
      ) : (
        <div>
          <p className="mb-2">👋 {user.name || user.email}</p>
          <button onClick={logout} className="w-full bg-[#333] text-[#FFD700] py-2 rounded">
            Logout
          </button>
        </div>
      )}
    </aside>
  );
}
