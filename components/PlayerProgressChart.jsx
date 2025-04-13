"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const groupBy = (data, range) => {
  const groups = {};
  data.forEach((entry) => {
    const date = new Date(entry.completed_at);
    let key;
    switch (range) {
      case "daily":
        key = date.toISOString().slice(0, 10); // YYYY-MM-DD
        break;
      case "weekly":
        const week = new Date(date);
        week.setDate(date.getDate() - date.getDay());
        key = week.toISOString().slice(0, 10);
        break;
      case "monthly":
        key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}`;
        break;
    }
    if (!groups[key]) {
      groups[key] = { xp: 0, workouts: 0 };
    }
    groups[key].xp += entry.xp_awarded || 0;
    groups[key].workouts += 1;
  });
  return Object.entries(groups).map(([key, val]) => ({ date: key, ...val }));
};

export default function PlayerProgressChart({ playerId }) {
  const [data, setData] = useState([]);
  const [range, setRange] = useState("weekly");

  useEffect(() => {
    const fetchSessions = async () => {
      const { data: sessions, error } = await supabase
        .from("workout_sessions")
        .select("completed_at, xp_awarded")
        .eq("player_id", playerId);

      if (sessions) {
        const grouped = groupBy(sessions, range);
        setData(grouped);
      } else {
        console.error("Error loading sessions:", error);
      }
    };

    if (playerId) fetchSessions();
  }, [playerId, range]);

  return (
    <div className="bg-white rounded-lg p-4 shadow mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">📊 XP & Workout Progress</h2>
        <div className="space-x-2">
          {[
            { label: "Daily", value: "daily" },
            { label: "Weekly", value: "weekly" },
            { label: "Monthly", value: "monthly" },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setRange(option.value)}
              className={`px-2 py-1 rounded text-sm border ${
                range === option.value
                  ? "bg-blue-600 text-white"
                  : "bg-white text-blue-600 border-blue-600"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Legend />
          <Bar dataKey="xp" fill="#facc15" name="XP Gained" />
          <Bar dataKey="workouts" fill="#4ade80" name="Workouts" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
