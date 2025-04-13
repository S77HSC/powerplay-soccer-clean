"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabase";
import Image from "next/image";

export default function PlayerProfile({ playerId }) {
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const id = playerId || router.query.id;

  useEffect(() => {
    if (!id) return;
    const fetchPlayer = async () => {
      const { data, error } = await supabase
        .from("players")
        .select("*")
        .eq("id", id)
        .single();

      if (data) setPlayer(data);
      setLoading(false);
    };

    fetchPlayer();
  }, [id]);

  if (loading) return <div className="p-6 text-center">Loading player...</div>;
  if (!player) return <div className="p-6 text-center text-red-500">Player not found.</div>;

  // Badge logic
  const badges = [
    player.games_played >= 1 && {
      icon: "/badge_rookie.png",
      name: "🏅 Rookie",
    },
    player.points >= 50 && {
      icon: "/badge_competitor.png",
      name: "🥈 Competitor",
    },
    player.matches_won >= 1 && {
      icon: "/badge_champion.png",
      name: "🥇 Champion",
    },
    player.workouts_completed >= 5 && {
      icon: "/badge_beast.png",
      name: "🔥 Fitness Beast",
    },
  ].filter(Boolean);

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-2 text-center">{player.name}'s Profile</h1>

      <div className="text-center mb-4">
        <Image
          src={player.avatar_url || "/default-avatar.png"}
          alt="Avatar"
          width={120}
          height={120}
          className="rounded-full mx-auto shadow"
        />
      </div>

      <div className="space-y-2 text-sm text-gray-700">
        <p><strong>Games Played:</strong> {player.games_played}</p>
        <p><strong>Matches Won:</strong> {player.matches_won}</p>
        <p><strong>Points:</strong> {player.points}</p>
        <p><strong>Workouts Completed:</strong> {player.workouts_completed}</p>
      </div>

      <h2 className="mt-6 text-lg font-semibold">🏆 Badges</h2>
      <div className="flex flex-wrap gap-4 mt-3">
        {badges.length > 0 ? (
          badges.map((badge, idx) => (
            <div key={idx} className="flex flex-col items-center text-xs">
              <Image src={badge.icon} alt={badge.name} width={60} height={60} />
              <span>{badge.name}</span>
            </div>
          ))
        ) : (
          <p>No badges earned yet. Keep grinding! 💪</p>
        )}
      </div>
    </div>
  );
}
