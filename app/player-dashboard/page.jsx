"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import Link from "next/link";

export default function PlayerDashboard() {
  const [searchName, setSearchName] = useState("");
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [rank, setRank] = useState(null);
  const [topPlayers, setTopPlayers] = useState([]);

  const handleSearch = async () => {
    setLoading(true);
    setPlayer(null);
    setRank(null);
    setNotFound(false);

    const { data: playerData, error: playerError } = await supabase
      .from("players")
      .select("*")
      .eq("name", searchName)
      .single();

    if (!playerData || playerError) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    setPlayer(playerData);

    const { data: allPlayers } = await supabase
      .from("players")
      .select("id, name, points") // ✅ include "id" here
      .order("points", { ascending: false });

    const playerIndex = allPlayers.findIndex((p) => p.name === playerData.name);
    if (playerIndex !== -1) setRank(playerIndex + 1);

    setTopPlayers(allPlayers.slice(0, 10));
    setLoading(false);
  };

  const unlockSkill =
    player &&
    (player.games_played >= 3 || player.points >= 50 || player.matches_won >= 1);

  const getBadge = (r) => {
    if (!r) return "🏃 Beginner";
    if (r <= 3) return "⚽ World Class";
    if (r <= 10) return "🔥 Pro";
    if (r <= 50) return "💪 Semi-Pro";
    return "🏃 Amateur";
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">🔐 Player Dashboard</h1>

      <div className="mb-4 flex gap-2">
        <input
          type="text"
          placeholder="Enter player name..."
          className="flex-1 border px-3 py-2 rounded"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
        />
        <button
          onClick={handleSearch}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Search
        </button>
      </div>

      {loading && <p>Loading player data...</p>}
      {notFound && <p className="text-red-500">❌ Player not found.</p>}

      {player && (
        <>
          <div className="bg-white p-4 rounded shadow">
            <Link href={`/player/${player.id}`}>
              <h2 className="text-xl font-semibold mb-2 text-blue-700 hover:underline">
                👋 Welcome, {player.name}
              </h2>
            </Link>
            <p>Games Played: {player.games_played}</p>
            <p>Points: {player.points}</p>
            <p>Matches Won: {player.matches_won}</p>
            {rank && (
              <>
                <p className="mt-2 text-green-600 font-bold">🌍 Global Rank: #{rank}</p>
                <p className="text-purple-600 font-semibold">🏅 Badge: {getBadge(rank)}</p>
              </>
            )}
          </div>

          <div className="mt-6">
            {unlockSkill ? (
              <div className="bg-green-100 text-green-800 p-4 rounded text-center font-semibold">
                🎉 New Skill Unlocked!
              </div>
            ) : (
              <div className="bg-yellow-100 text-yellow-800 p-4 rounded text-center">
                🔒 Keep going to unlock your next skill!
              </div>
            )}
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-2">🏆 Top 10 Players</h3>
            <ul className="space-y-1 text-sm">
              {topPlayers.map((p, i) => (
                <li
                  key={p.id}
                  className="flex justify-between bg-gray-100 px-3 py-2 rounded"
                >
                  <Link href={`/player/${p.id}`} className="text-blue-700 hover:underline">
                    #{i + 1} {p.name}
                  </Link>
                  <span>{p.points} pts</span>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
