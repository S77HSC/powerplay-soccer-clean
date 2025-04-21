// FULL RESTORED VERSION: Player Dashboard
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/AuthContext";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function PlayerDashboard() {
  const { player, loading } = useAuth();
  const router = useRouter();
  const [sessions, setSessions] = useState([]);
  const [xp, setXp] = useState(0);
  const [workouts, setWorkouts] = useState(0);
  const [wins, setWins] = useState(0);
  const [selectedRange, setSelectedRange] = useState("Weekly");

  useEffect(() => {
    const checkSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
    };
    checkSession();
  }, []);

  useEffect(() => {
    if (!loading && !player) {
      router.replace("/login");
    }
  }, [loading, player, router]);

  useEffect(() => {
    if (!player?.id) return;

    const fetchData = async () => {
      const { data: sessionData, error: sessionError } = await supabase
        .from("workout_sessions")
        .select("*")
        .eq("player_id", player.id);

      if (sessionError) {
        console.error("Failed to fetch sessions", sessionError);
        return;
      }

      setSessions(sessionData || []);

      const totalXP = sessionData.reduce((sum, s) => sum + (s.xr_awarded || 0), 0);
      setXp(totalXP);
      setWorkouts(sessionData.length);
      const winCount = sessionData.filter(s => s.is_win).length;
      setWins(winCount);
    };

    fetchData();
  }, [player]);

  const groupedData = {};
  (sessions || []).forEach((session) => {
    const date = new Date(session.completed_at);
    let key;

    if (selectedRange === "Monthly") {
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    } else if (selectedRange === "Daily") {
      key = date.toISOString().split("T")[0];
    } else {
      const firstDayOfWeek = new Date(date);
      firstDayOfWeek.setDate(date.getDate() - date.getDay());
      key = firstDayOfWeek.toISOString().split("T")[0];
    }

    if (!groupedData[key]) {
      groupedData[key] = { xp: 0, workouts: 0 };
    }

    groupedData[key].xp += session.xr_awarded || 0;
    groupedData[key].workouts += 1;
  });

  const labels = Object.keys(groupedData);
  const xpValues = labels.map((key) => groupedData[key].xp);
  const workoutCounts = labels.map((key) => groupedData[key].workouts);

  const chartData = {
    labels,
    datasets: [
      {
        label: "XP Gained",
        data: xpValues,
        backgroundColor: "#facc15",
      },
      {
        label: "Workouts",
        data: workoutCounts,
        backgroundColor: "#4ade80",
      },
    ],
  };

  const timeChartData = {
    labels,
    datasets: [
      {
        label: "Time Spent (min)",
        data: labels.map(label => {
          const sessionsOnDate = sessions.filter(s => {
            const date = new Date(s.completed_at);
            const formatted = selectedRange === "Daily" ? date.toISOString().split("T")[0] :
              selectedRange === "Monthly" ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}` :
              (() => {
                const firstDayOfWeek = new Date(date);
                firstDayOfWeek.setDate(date.getDate() - date.getDay());
                return firstDayOfWeek.toISOString().split("T")[0];
              })();
            return formatted === label;
          });
          return parseFloat(sessionsOnDate.reduce((acc, s) => acc + ((s.work_time || 0) * (s.reps || 0)) / 60, 0).toFixed(1));
        }),
        borderColor: "#60a5fa",
        backgroundColor: "rgba(96, 165, 250, 0.3)",
        fill: true,
        tension: 0.4,
      },
    ]
  };

  const skillsGrouped = {};
  (sessions || []).forEach((s) => {
    if (!skillsGrouped[s.skill_name]) {
      skillsGrouped[s.skill_name] = 0;
    }
    skillsGrouped[s.skill_name] += ((s.work_time || 0) * (s.reps || 0)) / 60;
  });

  const skillTimeChart = {
    labels: Object.keys(skillsGrouped),
    datasets: [
      {
        label: "Time per Skill (min)",
        data: Object.values(skillsGrouped),
        backgroundColor: "#818cf8"
      }
    ]
  };

  return (
    <div style={{ background: "#0A0F24", color: "white", padding: "2rem", minHeight: "100vh" }}>
      <div className="max-w-6xl mx-auto">
  <h1 className="text-3xl font-bold mb-6">📊 Player Dashboard</h1>

  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
    <div className="bg-gray-900 p-6 rounded-lg shadow text-center">
      <h2 className="text-lg font-semibold mb-2">🏆 Total XP</h2>
      <p className="text-yellow-400 text-2xl font-bold">{xp}</p>
    </div>
    <div className="bg-gray-900 p-6 rounded-lg shadow text-center">
      <h2 className="text-lg font-semibold mb-2">🔥 Workouts</h2>
      <p className="text-green-400 text-2xl font-bold">{workouts}</p>
    </div>
    <div className="bg-gray-900 p-6 rounded-lg shadow text-center">
      <h2 className="text-lg font-semibold mb-2">✅ Wins</h2>
      <p className="text-blue-400 text-2xl font-bold">{wins}</p>
    </div>
  </div>

  <div className="mb-6">
    <label className="block text-sm font-medium text-white mb-1">Select Range:</label>
    <select
      value={selectedRange}
      onChange={(e) => setSelectedRange(e.target.value)}
      className="text-black px-3 py-2 rounded border border-gray-300"
    >
      <option value="Daily">Daily</option>
      <option value="Weekly">Weekly</option>
      <option value="Monthly">Monthly</option>
    </select>
  </div>

  <div className="bg-gray-900 p-6 rounded-lg shadow mb-8">
    <h2 className="text-xl font-semibold mb-4">📈 XP & Workouts Over Time</h2>
    <Bar data={chartData} />
  </div>

  <div className="bg-gray-900 p-6 rounded-lg shadow mb-8">
    <h2 className="text-xl font-semibold mb-4">⏱ Time Spent per Period</h2>
    <Bar data={timeChartData} />
  </div>

  <div className="bg-gray-900 p-6 rounded-lg shadow">
    <h2 className="text-xl font-semibold mb-4">⚽️ Time per Skill</h2>
    <Bar data={skillTimeChart} />
  </div>
</div>
    </div>
  );
}
