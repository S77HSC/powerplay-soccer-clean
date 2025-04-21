'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export default function CoachDashboard() {
  const [userTeam, setUserTeam] = useState(null);
  const [players, setPlayers] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', due_date: '' });
  const [status, setStatus] = useState('');

  useEffect(() => {
    const fetchTeamAndPlayers = async () => {
      const {
        data: { user }
      } = await supabase.auth.getUser();

      const { data: coach, error: coachError } = await supabase
        .from('players')
        .select('team, role')
        .eq('auth_id', user.id)
        .single();

      // TEMP: bypass coach role check for development
      setUserTeam(coach.team);

      const { data: teamPlayers } = await supabase
        .from('players')
        .select('id, name, country, points')
        .eq('team', coach.team);

      setPlayers(teamPlayers || []);
    };

    fetchTeamAndPlayers();
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

  if (!userTeam) return <p className="text-white p-4">Loading coach dashboard...</p>;

  return (
    <div className="min-h-screen bg-black text-white px-6 py-10 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <img src="/powerplay-logo.png" alt="Logo" width={140} height={50} />
      </div>
    
      <h1 className="text-3xl font-bold mb-6 text-center">🧑‍🏫 Coach Dashboard</h1>

      <form onSubmit={handleSubmit} className="space-y-4 mb-10">
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

      <div>
        <h2 className="text-xl font-semibold mb-4">👟 Team Players</h2>
        {players.length === 0 ? (
          <p className="text-gray-400">No players found for this team.</p>
        ) : (
          <ul className="space-y-2">
            {players.map((p) => (
              <li
                key={p.id}
                className="bg-gray-800 rounded-lg px-4 py-2 border border-gray-700 flex justify-between items-center"
              >
                <div>
                  <p className="font-bold text-white">{p.name}</p>
                  <p className="text-sm text-gray-400">{p.country}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-yellow-300">XP: {p.points}</p>
<button
  onClick={() => window.open(`/player-dashboard?id=${p.id}`, '_blank')}
  className="mt-3 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-medium text-xs px-4 py-2 rounded-lg shadow-sm transition duration-200"

  
>
  View Player Dashboard
</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-10">
        <a href="/powerplay" className="bg-gradient-to-br from-[#141e30] to-[#243b55] hover:scale-105 transition-transform duration-300 p-6 rounded-xl shadow-xl text-center font-bold text-xl cursor-pointer border border-green-600 hover:shadow-glow">
          <img src="/powerplay-logo.png" alt="PowerPlay Logo" className="mx-auto mb-4" width={80} height={80} />
          PowerPlay
          <p className="text-sm font-normal text-gray-300 mt-2">Build. Compete. Dominate.</p>
        </a>
        <a href="/sacrifice-league/new" className="bg-gradient-to-br from-[#222831] to-[#393e46] hover:scale-105 transition-transform duration-300 p-6 rounded-xl shadow-xl text-center font-bold text-xl cursor-pointer border border-blue-600 hover:shadow-glow">
          <img src="/tournament-sparkle.png" alt="Tournament Logo" className="mx-auto mb-4" width={80} height={80} />
          Power League
          <p className="text-sm font-normal text-gray-300 mt-2">Tournament creator.</p>
        </a>
        <a href="/survivor_mode" className="bg-gradient-to-br from-[#2d2d2d] to-[#444] hover:scale-105 transition-transform duration-300 p-6 rounded-xl shadow-xl text-center font-bold text-xl cursor-pointer border border-red-600 hover:shadow-glow">
          <img src="/sacrifice_logo.png" alt="Survivor Logo" className="mx-auto mb-4" width={80} height={80} />
          Survivor Mode
          <p className="text-sm font-normal text-gray-300 mt-2">Score and survive!</p>
        </a>
      </div>
    </div>
  );
}
