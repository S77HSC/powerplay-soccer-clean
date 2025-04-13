"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

// Country mapping and flag image generator
const countryMap = {
  "United Kingdom": "gb",
  "England": "gb",
  "Scotland": "gb",
  "Wales": "gb",
  "USA": "us",
  "United States": "us",
  "South Korea": "kr",
  "Spain": "es",

};

const getCountryFlag = (countryName) => {
  if (!countryName || typeof countryName !== "string") return null;

  const mapped =
    countryMap[countryName.trim()] ||
    countryName.toLowerCase().slice(0, 2);

  return `https://flagcdn.com/w40/${mapped}.png`;
};

export default function LeaderboardPage() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("points");

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("players")
        .select("id, name, points, workouts_completed, avatar_url, country, team")
        .order(sortBy, { ascending: false });

      if (error) {
        console.error("Error fetching leaderboard:", error.message);
      } else {
        setPlayers(data);
      }

      setLoading(false);
    };

    fetchLeaderboard();
  }, [sortBy]);

  const getBadge = (rank) => {
    if (rank <= 3) return { label: "World Class", icon: "/badges/worldclass.png" };
    if (rank <= 10) return { label: "Pro", icon: "/badges/pro.png" };
    if (rank <= 50) return { label: "Semi-Pro", icon: "/badges/semipro.png" };
    return { label: "Amateur", icon: "/badges/amateur.png" };
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4 text-center text-blue-800">
        🌍 Global Leaderboard
      </h1>

      {/* Sort Toggle */}
      <div className="flex justify-center mb-6 gap-4">
        <button
          onClick={() => setSortBy("points")}
          className={`px-4 py-2 rounded border ${
            sortBy === "points"
              ? "bg-blue-600 text-white"
              : "bg-white text-blue-600 border-blue-600"
          }`}
        >
          Sort by XP
        </button>
        <button
          onClick={() => setSortBy("workouts_completed")}
          className={`px-4 py-2 rounded border ${
            sortBy === "workouts_completed"
              ? "bg-blue-600 text-white"
              : "bg-white text-blue-600 border-blue-600"
          }`}
        >
          Sort by Workouts
        </button>
      </div>

      {loading ? (
        <p className="text-center text-gray-500">Loading leaderboard...</p>
      ) : players.length === 0 ? (
        <p className="text-center text-gray-500">No players found.</p>
      ) : (
        <ul className="space-y-3">
          <AnimatePresence>
            {players.map((player, index) => {
              const badge = getBadge(index + 1);

              return (
                <motion.li
                  key={player.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex justify-between items-center bg-white border rounded-lg px-4 py-3 shadow hover:bg-gray-50 transition"
                >
                  {/* Avatar + Info */}
                  <div className="flex items-center gap-4">
                    <img
                      src={player.avatar_url || "/default-avatar.png"}
                      alt={player.name}
                      className="w-12 h-12 rounded-full object-cover border"
                    />
                    <div>
                      <Link
                        href={`/player/${player.id}`}
                        className="text-blue-700 font-semibold text-lg hover:underline"
                      >
                        #{index + 1} {player.name}
                      </Link>
                      <div className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                        <span>{player.team || "No team"}</span>
                        {player.country && (
                          <>
                            <span>•</span>
                            <img
                              src={getCountryFlag(player.country)}
                              alt={player.country}
                              className="w-5 h-4 rounded-sm object-cover"
                              referrerPolicy="no-referrer"
                            />
                            <span>{player.country}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Stats + Badge */}
                  <div className="text-right text-sm">
                    {sortBy === "points" ? (
                      <p className="font-medium">{player.points} XP</p>
                    ) : (
                      <p className="font-medium">{player.workouts_completed} Workouts</p>
                    )}
                    <div className="flex justify-end mt-1">
                      <img
                        src={badge.icon}
                        alt="badge"
                        className="w-10 h-10 sm:w-12 sm:h-12"
                      />
                    </div>
                  </div>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
}
