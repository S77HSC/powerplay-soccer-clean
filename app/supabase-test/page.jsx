"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import NewPlayerForm from "../../components/NewPlayerForm";

export default function SupabaseTestPage() {
  const [players, setPlayers] = useState([]);

  const fetchPlayers = async () => {
    const { data, error } = await supabase.from("players").select("*").order("id", { ascending: true });
    if (error) {
      console.error("Error fetching players:", error.message);
    } else {
      setPlayers(data);
    }
  };

  useEffect(() => {
    fetchPlayers();

    const subscription = supabase
      .channel("players-db")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "players" },
        () => {
          fetchPlayers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  return (
    <div style={{ padding: "2rem", maxWidth: "600px", margin: "auto" }}>
      <h1 style={{ fontSize: "1.8rem", marginBottom: "1rem" }}>🧑‍🎮 Players from Supabase</h1>

      <NewPlayerForm />

      <ul style={{ listStyle: "none", padding: 0 }}>
        {players.map((player) => (
          <li
            key={player.id}
            style={{
              border: "1px solid #ccc",
              borderRadius: "6px",
              padding: "10px",
              marginBottom: "10px",
              background: "#f9f9f9",
            }}
          >
            <strong>{player.name}</strong> — {player.points} XP <br />
            <small>Team: {player.team || "N/A"}</small>
          </li>
        ))}
      </ul>
    </div>
  );
}
