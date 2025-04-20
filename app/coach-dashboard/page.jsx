'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export default function CoachDashboard() {
  const [userTeam, setUserTeam] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', due_date: '' });
  const [status, setStatus] = useState('');

  useEffect(() => {
    const fetchTeam = async () => {
      const {
        data: { user }
      } = await supabase.auth.getUser();

      const { data: player } = await supabase
        .from('players')
        .select('team, role')
        .eq('auth_id', user.id)
        .single();

      if (player?.role === 'coach') {
        setUserTeam(player.team);
      }
    };

    fetchTeam();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Submitting...');

    const {
      data: { user }
    } = await supabase.auth.getUser();

    const { error } = await supabase.from('homework').insert([
      {
        team: userTeam,
        title: form.title,
        description: form.description,
        due_date: form.due_date,
        created_by: user.id,
      },
    ]);

    if (error) {
      setStatus('Error saving homework.');
    } else {
      setStatus('✅ Homework assigned!');
      setForm({ title: '', description: '', due_date: '' });
    }
  };

  if (!userTeam) return <p className="text-white p-4">Loading coach access...</p>;

  return (
    <div className="min-h-screen bg-black text-white px-6 py-10 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">🧑‍🏫 Coach Dashboard</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-semibold">Team:</label>
          <input type="text" value={userTeam} disabled className="w-full bg-gray-800 text-white px-3 py-2 rounded border border-gray-600" />
        </div>

        <div>
          <label className="block mb-1 font-semibold">Homework Title:</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
            className="w-full bg-gray-800 text-white px-3 py-2 rounded border border-gray-600"
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold">Description:</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
            className="w-full bg-gray-800 text-white px-3 py-2 rounded border border-gray-600"
          ></textarea>
        </div>

        <div>
          <label className="block mb-1 font-semibold">Due Date:</label>
          <input
            type="date"
            value={form.due_date}
            onChange={(e) => setForm({ ...form, due_date: e.target.value })}
            required
            className="w-full bg-gray-800 text-white px-3 py-2 rounded border border-gray-600"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded font-semibold"
        >
          Assign Homework
        </button>

        {status && <p className="text-sm mt-2 text-center text-green-400">{status}</p>}
      </form>
    </div>
  );
}
