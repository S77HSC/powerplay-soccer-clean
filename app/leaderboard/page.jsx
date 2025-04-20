'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import LeaderboardPreviewCard from '../../components/LeaderboardPreviewCard';

export default function LeaderboardPage() {
  const [players, setPlayers] = useState([]);
  const [workoutLeaders, setWorkoutLeaders] = useState([]);
  const [myTeam, setMyTeam] = useState(null);

  useEffect(() => {
    const fetchPlayers = async () => {
      const { data, error } = await supabase
        .from('players')
        .select('id, name, team, points, country, avatar_url')
        .order('points', { ascending: false });

      if (error) {
        console.error('Error loading leaderboard:', error);
        setPlayers([]);
        return;
      }

      setPlayers(data || []);
    };

    const fetchWorkoutStats = async () => {
      const { data: sessions, error } = await supabase
        .from('workout_sessions')
        .select('player_id, work_time');

      if (error) {
        console.error('Error fetching workout sessions:', error);
        return;
      }

      const stats = {};
      sessions.forEach(({ player_id, work_time }) => {
        if (!stats[player_id]) {
          stats[player_id] = { count: 0, total: 0 };
        }
        stats[player_id].count++;
        stats[player_id].total += work_time || 0;
      });

      const { data: allPlayers } = await supabase
        .from('players')
        .select('id, name, team, points, country, avatar_url');

      const enriched = (allPlayers || []).map(p => ({
        ...p,
        sessions: stats[p.id]?.count || 0,
        workoutTime: stats[p.id]?.total || 0,
      }));

      const sorted = enriched.sort((a, b) => (b.workoutTime + b.sessions) - (a.workoutTime + a.sessions));
      setWorkoutLeaders(sorted);
    };

    const fetchMyTeam = async () => {
      const {
        data: { user }
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data: player } = await supabase
        .from('players')
        .select('team')
        .eq('auth_id', user.id)
        .single();

      if (player?.team) setMyTeam(player.team);
    };

    fetchPlayers();
    fetchWorkoutStats();
    fetchMyTeam();
  }, []);

  return (
    <main className="min-h-screen px-4 py-8 bg-black text-white">
      <h1 className="text-2xl font-bold mb-6 text-center">🌍 Full Global Leaderboard</h1>
      <div className="max-w-4xl mx-auto mb-10">
        <LeaderboardPreviewCard players={players} />
      </div>

      <h2 className="text-xl font-semibold mb-4 text-center">🔥 Top by Workouts + Time</h2>
      <div className="max-w-4xl mx-auto mb-10">
        <LeaderboardPreviewCard players={workoutLeaders} showWorkouts />
      </div>

      {myTeam && (
        <>
          <h2 className="text-xl font-semibold mb-4 text-center">🛡️ My Team: {myTeam}</h2>
          <div className="max-w-4xl mx-auto">
            <LeaderboardPreviewCard players={players} teamName={myTeam} />
          </div>
        </>
      )}
    </main>
  );
}
