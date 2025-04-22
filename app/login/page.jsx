"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    const { data: userData } = await supabase.from('players').select('role').eq('auth_id', data.user.id).maybeSingle();
    const role = userData?.role;
    if (role === 'coach') {
      router.push('/coach-dashboard');
    } else {
      router.push('/player-dashboard');
    }
  };

  return (
    <div className="relative min-h-screen bg-black text-white flex items-center justify-center px-4 overflow-hidden">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-30 z-0"
      >
        <source src="/videos/powerplay-login-bg.mp4" type="video/mp4" />
      </video>

      <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-20">
        <img src="/powerplay-logo.png" alt="PowerPlay Logo" className="w-36 sm:w-40 md:w-48 lg:w-52 xl:w-56" />
      </div>

      <div className="relative z-10 bg-[#0f172a] bg-opacity-90 p-8 rounded-xl shadow-xl max-w-md w-full space-y-6 mt-24 sm:mt-32 md:mt-40">
        <h1 className="text-2xl font-bold text-center text-white">Welcome to PowerPlay Soccer</h1>
        <p className="text-center text-gray-300">Log in to your account</p>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-800 text-white border border-gray-600 rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-800 text-white border border-gray-600 rounded px-3 py-2"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-cyan-600 hover:bg-cyan-700 px-4 py-2 rounded font-semibold"
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <div className="text-center mt-4">
          <p className="text-sm text-gray-400">Don't have an account?</p>
          <button
            onClick={() => router.push('/register')}
            className="mt-2 text-cyan-400 hover:text-cyan-300 text-sm font-medium"
          >
            Register
          </button>
        </div>
      </div>
    </div>
  );
}
