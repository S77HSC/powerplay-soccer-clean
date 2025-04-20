'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import Image from 'next/image';

export default function LeaderboardPage() {
  const [players, setPlayers] = useState([]);
  const [xpLeaders, setXpLeaders] = useState([]);
  const [workoutLeaders, setWorkoutLeaders] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: playerData, error: playerError } = await supabase
        .from('players')
        .select('id, name, points, country, avatar_url, hasWon');

      const { data: sessionData, error: sessionError } = await supabase
        .from('workout_sessions')
        .select('player_id, work_time');

      if (playerError || sessionError) {
        console.error('Supabase fetch error:', playerError || sessionError);
        return;
      }

      const workoutStats = sessionData.reduce((acc, curr) => {
        acc[curr.player_id] = acc[curr.player_id] || { count: 0, time: 0 };
        acc[curr.player_id].count++;
        acc[curr.player_id].time += curr.work_time || 0;
        return acc;
      }, {});

      const enrichedPlayers = playerData.map(p => ({
        ...p,
        workouts_completed: workoutStats[p.id]?.count || 0,
        total_workout_time: workoutStats[p.id]?.time || 0
      }));

      const combinedSorted = [...enrichedPlayers].sort((a, b) => ((b.workouts_completed || 0) + (b.points || 0)) - ((a.workouts_completed || 0) + (a.points || 0)));
      setPlayers(combinedSorted);
      setXpLeaders([...enrichedPlayers].sort((a, b) => b.points - a.points).slice(0, 5));
      setWorkoutLeaders([...enrichedPlayers].sort((a, b) => (b.hasWon || 0) - (a.hasWon || 0)).slice(0, 5));
  };

    fetchData();
  }, []);

  const getCountryFlag = (countryName) => {
    if (!countryName) return null;
    const code = {
      'United Kingdom': 'gb',
      England: 'gb',
      Scotland: 'gb',
      Wales: 'gb',
      USA: 'us',
      'United States': 'us',
      Spain: 'es',
      'South Korea': 'kr',
    }[countryName] || countryName.toLowerCase().slice(0, 2);

    return `https://flagcdn.com/w40/${code}.png`;
  };

  const renderTable = (title, list, statKey, statLabel) => {
    const showTime = title.includes('Combined');
    return (
      <div className="bg-[#1a1a2a] p-6 rounded-xl shadow-xl border border-blue-700 mb-10">
        <h2 className="text-xl font-bold text-cyan-400 mb-4">{title}</h2>
        <div className="grid grid-cols-5 font-semibold text-sm text-gray-400 mb-3 border-b border-gray-600 pb-2">
          <span>Name</span>
          <span>Flag</span>
          <span className="text-center">{statLabel}</span>
          {showTime && <span className="text-center">Time</span>}
          <span className="text-right">XP</span>
        </div>
        {list.map((p, i) => (
          <div key={i} className="grid grid-cols-5 mb-4 items-center gap-2 text-sm">
            <span className="flex items-center gap-2 font-medium text-white">
              <span className="text-gray-400">#{i + 1}</span>
              <Image
                src={p.avatar_url ? `https://uitlajpnqruvvykrcyyg.supabase.co/storage/v1/object/public/avatars/${p.avatar_url}` : '/default-avatar.png'}
                alt={p.name}
                width={28}
                height={28}
                className="rounded-full border border-gray-500"
              />
              {p.name}
            </span>
            <span>
              {p.country && (
                <Image
                  src={getCountryFlag(p.country)}
                  alt={p.country}
                  width={24}
                  height={16}
                  className="inline-block"
                />
              )}
            </span>
            <span className="text-center">{p[statKey] || 0}</span>
            {showTime && <span className="text-center">{p.total_workout_time || 0} min</span>}
            <div className="w-full">
              <div className="bg-gray-700 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 h-full transition-all duration-700 animate-pulse"
                  style={{ width: `${Math.min((p.points % 1000) / 10, 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-400 text-right mt-1">{p.points} XP</p>
            </div>
          </div>
        ))}
      </div>
    );
  }


  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('players')
        .select('*')
        .eq('auth_id', user.id)
        .single();

      if (!data) return;

      const interval = setInterval(() => {
        if (players.length > 0) {
          const rank = players.findIndex(p => p.name === data.name);
          setProfile({ ...data, rank: rank !== -1 ? rank + 1 : 'N/A', workouts_completed: players[rank]?.workouts_completed || 0, total_workout_time: players[rank]?.total_workout_time || 0 });
          clearInterval(interval);
        }
      }, 100);
    };

    fetchProfile();
  }, [players]);

  return (
    <main className="bg-gradient-to-br from-[#050A1F] to-[#0c1228] min-h-screen px-4 py-10 text-white">
      <h1 className="text-3xl font-bold text-center mb-12 text-cyan-400">🏆 Global Leaderboards</h1>

      {profile && (
        <div className="max-w-4xl mx-auto bg-[#12172e] border border-blue-700 p-4 rounded-lg shadow-md mb-10 flex items-center gap-4">
          <Image
            src={
              profile.avatar_url
                ? `https://uitlajpnqruvvykrcyyg.supabase.co/storage/v1/object/public/avatars/${profile.avatar_url}`
                : '/default-avatar.png'
            }
            alt={profile.name}
            width={64}
            height={64}
            className="rounded-full border object-cover"
          />
          <div>
            <h2 className="text-xl font-bold">{profile.name} <span className="text-sm font-normal text-gray-400">(Rank #{profile.rank})</span></h2>
            <p className="text-sm text-blue-300">
              {profile.country && (
                <>
                  <Image
                    src={getCountryFlag(profile.country)}
                    alt={profile.country}
                    width={24}
                    height={16}
                    className="inline-block mr-2"
                  />
                  {profile.country}
                </>
              )}
              <span className="ml-4">⭐ XP: {profile.points ?? 0}</span>
              <span className="ml-4">🏋️ Workouts: {profile.workouts_completed ?? 0}</span>
              <span className="ml-4">🕒 Total Time: {profile.total_workout_time ?? 0} mins</span>
              <span className="ml-4">🏆 Wins: {profile.hasWon ?? 0}</span>
            </p>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        {renderTable('🏅 Combined Leaderboard (Workouts + XP)', players, 'workouts_completed', 'Workouts')}
        {renderTable('⚡ XP Leaders', xpLeaders, 'points', 'XP')}
        {renderTable('🔥 Wins Champions', workoutLeaders, 'hasWon', 'Wins')}
      </div>
    </main>
  );
}
