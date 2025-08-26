'use client';

import { useState } from 'react';
import { useAction } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useAuth } from '../providers/AuthProvider';

export default function RegisterForm() {
  const signup = useAction(api.authActions.signupAction);
  const { setAuth } = useAuth();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const { token, user } = await signup({ email, name, password });
      setAuth(token, user);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    }
  };

  return (
    <form onSubmit={onSubmit} className="bg-[#222] p-6 rounded-lg shadow-lg border border-[#333] space-y-4">
      <h2 className="text-2xl font-bold text-[#FFD700]">Register</h2>

      {error && <p className="text-red-400">{error}</p>}

      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="bg-[#333] text-white border border-[#444] p-3 w-full rounded"
        required
      />

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="bg-[#333] text-white border border-[#444] p-3 w-full rounded"
        required
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="bg-[#333] text-white border border-[#444] p-3 w-full rounded"
        required
      />

      <button type="submit" className="bg-[#FFD700] hover:bg-yellow-400 text-black font-bold px-4 py-2 rounded w-full">
        Sign Up
      </button>
    </form>
  );
}
