'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [country, setCountry] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [age, setAge] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [role, setRole] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const numericAge = parseInt(age);
    if (!numericAge || numericAge <= 0) {
      setError('Please enter a valid age.');
      setLoading(false);
      return;
    }

    if (numericAge < 18 && !parentEmail) {
      setError('Parent/guardian email is required for users under 18.');
      setLoading(false);
      return;
    }

    if (!role) {
      setError('Please select a role.');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      setError(signUpError.message || 'Registration failed.');
      setLoading(false);
      return;
    }

    // If email confirmation is enabled and session is null
    if (!data.session) {
      setLoading(false);
      alert('Check your email to confirm your account before logging in.');
      router.push('/login');
      return;
    }

    const user = data.user;

    const { error: insertError } = await supabase.from('players').insert({
      auth_id: user.id,
      name,
      country,
      role,
      age: numericAge,
      parent_email: parentEmail || null,
    });

    if (insertError) {
      setError('Failed to create player profile.');
      setLoading(false);
      return;
    }

    router.push('/homepage');
  };

  return (
    <div className="relative min-h-screen bg-black text-white flex items-center justify-center px-4 overflow-hidden">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-30"
      >
        <source src="/video/powerplay-login-bg.mp4" type="video/mp4" />
      </video>
      <div className="absolute top-8 flex justify-center w-full z-20">
        <img src="/powerplay-logo.png" alt="PowerPlay Logo" width={180} height={60} />
      </div>
      <div className="relative z-10 bg-[#0f172a] bg-opacity-90 p-8 rounded-xl shadow-xl max-w-md w-full space-y-6">
        <h1 className="text-2xl font-bold text-center text-white">Join PowerPlay Soccer</h1>
        <p className="text-center text-gray-300">Create your account</p>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-800 text-white border border-gray-600 rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Age</label>
            <input
              type="number"
              required
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full bg-gray-800 text-white border border-gray-600 rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Country</label>
            <input
              type="text"
              required
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full bg-gray-800 text-white border border-gray-600 rounded px-3 py-2"
            />
          </div>

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

          <div>
            <label className="block text-sm text-gray-400 mb-1">Confirm Password</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-gray-800 text-white border border-gray-600 rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Role</label>
            <select
              required
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-gray-800 text-white border border-gray-600 rounded px-3 py-2"
            >
              <option value="">Select your role</option>
              <option value="player">Player</option>
              <option value="coach">Coach</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-cyan-600 hover:bg-cyan-700 px-4 py-2 rounded font-semibold"
          >
            {loading ? 'Registering...' : 'Create Account'}
          </button>
        <div>
            <label className="block text-sm text-gray-400 mb-1">Parent Email (if under 18)</label>
            <input
              type="email"
              value={parentEmail}
              onChange={(e) => setParentEmail(e.target.value)}
              className="w-full bg-gray-800 text-white border border-gray-600 rounded px-3 py-2"
            />
          </div>

        </form>

        <div className="text-center mt-4">
          <p className="text-sm text-gray-400">Already have an account?</p>
          <button
            onClick={() => router.push('/login')}
            className="mt-2 text-cyan-400 hover:text-cyan-300 text-sm font-medium"
          >
            Log in
          </button>
        </div>
      </div>
    </div>
  );
}
