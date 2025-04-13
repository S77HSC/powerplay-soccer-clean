"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../lib/supabase";
import Image from "next/image";
import {
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";

import PlayerProgressChart from "../../../components/PlayerProgressChart"; // ✅ Update here

export default function PlayerProfilePage() {
  const params = useParams();
  const id = params?.id;

  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [globalRank, setGlobalRank] = useState(null);
  const [countryRank, setCountryRank] = useState(null);
  const [playerCount, setPlayerCount] = useState(0);
  const [countryPlayerCount, setCountryPlayerCount] = useState(0);

  useEffect(() => {
    if (!id) return;

    const fetchPlayer = async () => {
      const { data: playerData, error } = await supabase
        .from("players")
        .select("*")
        .eq("id", id)
        .single();

      if (playerData) {
        setPlayer(playerData);
        fetchRankings(playerData);
      } else {
        setNotFound(true);
      }

      setLoading(false);
    };

    const fetchRankings = async (currentPlayer) => {
      const { data: allPlayers } = await supabase
        .from("players")
        .select("id, points, country")
        .order("points", { ascending: false });

      if (allPlayers) {
        setPlayerCount(allPlayers.length);

        const globalIndex = allPlayers.findIndex((p) => p.id === currentPlayer.id);
        setGlobalRank(globalIndex + 1);

        const sameCountry = allPlayers.filter(
          (p) => p.country?.toLowerCase() === currentPlayer.country?.toLowerCase()
        );
        setCountryPlayerCount(sameCountry.length);

        const countryIndex = sameCountry.findIndex((p) => p.id === currentPlayer.id);
        setCountryRank(countryIndex + 1);
      }
    };

    fetchPlayer();
  }, [id]);

  if (loading) return <p className="p-4 text-center">Loading player data...</p>;
  if (notFound) return <p className="p-4 text-center text-red-500">❌ Player not found.</p>;

  const getBadges = () => {
    if (!player) return [];

    const badges = [];
    if (player.games_played >= 1)
      badges.push({ name: "Rookie", icon: "/badges/amateur.png" });
    if (player.points >= 50)
      badges.push({ name: "Competitor", icon: "/badges/semipro.png" });
    if (player.matches_won >= 1)
      badges.push({ name: "Champion", icon: "/badges/pro.png" });
    if (player.workouts_completed >= 5)
      badges.push({ name: "Fitness Beast", icon: "/badges/worldclass.png" });

    return badges;
  };

  const progressData = [
    {
      name: "XP",
      value: Math.min(player?.points || 0, 100),
      fill: "#facc15",
    },
    {
      name: "Workouts",
      value: Math.min(player?.workouts_completed * 10 || 0, 100),
      fill: "#4ade80",
    },
    {
      name: "Wins",
      value: Math.min(player?.matches_won * 20 || 0, 100),
      fill: "#60a5fa",
    },
  ];

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white shadow-md rounded-lg">
      {/* Avatar + Info */}
      <div className="flex items-center gap-4 mb-4">
        <img
          src={player.avatar_url || "/default-avatar.png"}
          alt={player.name}
          className="w-16 h-16 rounded-full border object-cover"
        />
        <div>
          <h1 className="text-2xl font-bold text-blue-700">{player.name}</h1>
          <p className="text-sm text-gray-600">
            {player.team && <span className="mr-2">{player.team}</span>}
            {player.country && <span>🌍 {player.country}</span>}
          </p>
        </div>
      </div>

      {/* Global + Country Rank */}
      {globalRank && playerCount && (
        <p className="text-sm text-gray-600 mb-4">
          🌍 <strong>Global Rank:</strong> #{globalRank} of {playerCount}
          {player.country && countryRank && countryPlayerCount > 1 && (
            <>
              {" • "}
              <strong>{player.country} Rank:</strong> #{countryRank} of {countryPlayerCount}
            </>
          )}
        </p>
      )}

      {/* Progress Rings */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
        {progressData.map((stat, index) => (
          <div
            key={index}
            className="bg-gray-100 rounded-lg p-4 flex flex-col items-center justify-center shadow"
          >
            <div className="w-24 h-24">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  innerRadius="70%"
                  outerRadius="100%"
                  data={[stat]}
                  startAngle={90}
                  endAngle={-270}
                >
                  <PolarAngleAxis
                    type="number"
                    domain={[0, 100]}
                    angleAxisId={0}
                    tick={false}
                  />
                  <RadialBar
                    minAngle={15}
                    background
                    clockWise
                    dataKey="value"
                    cornerRadius={10}
                  />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-sm text-gray-500 mt-2">{stat.name}</p>
            <p className="text-xl font-bold">
              {stat.name === "XP"
                ? player.points
                : stat.name === "Workouts"
                ? player.workouts_completed
                : player.matches_won}
            </p>
          </div>
        ))}
      </div>

      {/* 📊 Toggleable Progress Chart */}
      <div className="mt-8">
        <PlayerProgressChart playerId={player.id} />
      </div>

      {/* Badges */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-2">🏅 Badges & Achievements</h2>
        <div className="flex gap-4 flex-wrap">
          {getBadges().map((badge, index) => (
            <div key={index} className="text-center">
              <Image
                src={badge.icon}
                alt={badge.name}
                width={64}
                height={64}
                className="mx-auto mb-1"
              />
              <span className="text-sm">{badge.name}</span>
            </div>
          ))}
          {getBadges().length === 0 && (
            <p className="text-sm text-gray-500">No badges earned yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}





