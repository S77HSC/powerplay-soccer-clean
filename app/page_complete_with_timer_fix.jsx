"use client";

import { useState, useEffect } from "react";

export default function PowerPlayApp() {
  const [darkMode, setDarkMode] = useState(false);
  const [teamA, setTeamA] = useState("Team A");
  const [teamB, setTeamB] = useState("Team B");
  const [scoreA, setScoreA] = useState(0);
  const [scoreB, setScoreB] = useState(0);
  const [playersA, setPlayersA] = useState([]);
  const [playersB, setPlayersB] = useState([]);
  const [selectedPowerPlaysA, setSelectedPowerPlaysA] = useState([]);
  const [selectedPowerPlaysB, setSelectedPowerPlaysB] = useState([]);
  const [powerPlayOptions] = useState(["Overload", "Double Trouble", "Hot Zone"]);
  const [activeTeam, setActiveTeam] = useState("");
  const [activePlay, setActivePlay] = useState("");
  const [powerTimer, setPowerTimer] = useState(0);
  const [isPowerActive, setIsPowerActive] = useState(false);
  const [matchTime, setMatchTime] = useState(300); // default 5 mins
  const [timer, setTimer] = useState(300);
  const [matchRunning, setMatchRunning] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  useEffect(() => {
    if (!matchRunning) setTimer(matchTime);
  }, [matchTime, matchRunning]);

  useEffect(() => {
    let interval = null;
    if (matchRunning && timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    } else if (timer === 0 && matchRunning) {
      setMatchRunning(false);
    }
    return () => clearInterval(interval);
  }, [matchRunning, timer]);

  useEffect(() => {
    let interval = null;
    if (isPowerActive && powerTimer > 0) {
      interval = setInterval(() => setPowerTimer((t) => t - 1), 1000);
    } else if (powerTimer === 0 && isPowerActive) {
      setIsPowerActive(false);
      setActivePlay("");
      setActiveTeam("");
    }
    return () => clearInterval(interval);
  }, [isPowerActive, powerTimer]);

  const startPowerPlay = (team, play) => {
    setActiveTeam(team);
    setActivePlay(play);
    setPowerTimer(120);
    setIsPowerActive(true);
  };

  const formatTime = (t) => {
    const min = Math.floor(t / 60);
    const sec = t % 60;
    return `${min}:${sec < 10 ? "0" : ""}${sec}`;
  };

  const addPlayer = (team) => {
    const name = prompt("Enter player name:");
    if (!name) return;
    const newPlayer = { name, points: 0 };
    if (team === "A") setPlayersA([...playersA, newPlayer]);
    else setPlayersB([...playersB, newPlayer]);
  };

  const updatePoints = (team, index, delta) => {
    const players = team === "A" ? [...playersA] : [...playersB];
    players[index].points += delta;
    if (team === "A") setPlayersA(players);
    else setPlayersB(players);
  };

  const getLeaderboard = () => {
    return [...playersA, ...playersB].sort((a, b) => b.points - a.points);
  };

  return (
    <div className={"min-h-screen p-4 transition-all font-sans " + (darkMode ? "dark bg-gray-900 text-white" : "bg-gray-100 text-black")}>
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <input type="text" value={teamA} onChange={(e) => setTeamA(e.target.value)} className="px-3 py-1 rounded border text-lg font-semibold" />
            <span className="text-xl font-bold">vs</span>
            <input type="text" value={teamB} onChange={(e) => setTeamB(e.target.value)} className="px-3 py-1 rounded border text-lg font-semibold" />
          </div>
          <button onClick={() => setDarkMode(!darkMode)} className="px-4 py-2 bg-black text-white dark:bg-white dark:text-black rounded">
            {darkMode ? "Light" : "Dark"} Mode
          </button>
        </div>

        <div className="text-center my-6">
          <div className="text-3xl font-mono mb-2">{scoreA} v {scoreB}</div>
          <div className="flex justify-center gap-4 flex-wrap">
            <button onClick={() => setScoreA(Math.max(0, scoreA - 1))} className="bg-red-500 px-3 py-1 text-white rounded">-1 {teamA}</button>
            <button onClick={() => setScoreA(scoreA + 1)} className="bg-green-500 px-3 py-1 text-white rounded">+1 {teamA}</button>
            <button onClick={() => setScoreB(Math.max(0, scoreB - 1))} className="bg-red-500 px-3 py-1 text-white rounded">-1 {teamB}</button>
            <button onClick={() => setScoreB(scoreB + 1)} className="bg-green-500 px-3 py-1 text-white rounded">+1 {teamB}</button>
          </div>
        </div>

        <div className="text-center my-4">
          <h2 className="text-xl mb-1">Match Timer</h2>
          <div className="text-4xl font-mono tracking-widest">{formatTime(timer)}</div>
          <div className="mt-2 flex justify-center gap-2 flex-wrap">
            <select value={matchTime} onChange={(e) => setMatchTime(Number(e.target.value))} className="px-2 py-1 rounded">
              {[300, 600, 900, 1200].map((s) => (
                <option key={s} value={s}>{s / 60} min</option>
              ))}
            </select>
            <button onClick={() => setMatchRunning(!matchRunning)} className="px-3 py-1 bg-blue-600 text-white rounded">
              {matchRunning ? "Pause" : "Start"}
            </button>
            <button onClick={() => { setMatchRunning(false); setTimer(matchTime); }} className="px-3 py-1 bg-gray-600 text-white rounded">
              Reset
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {[{ team: teamA, players: playersA, side: "A", selections: selectedPowerPlaysA, setSelections: setSelectedPowerPlaysA },
            { team: teamB, players: playersB, side: "B", selections: selectedPowerPlaysB, setSelections: setSelectedPowerPlaysB }]
            .map(({ team, players, side, selections, setSelections }) => (
            <div key={team} className="bg-white dark:bg-gray-800 rounded p-3 shadow">
              <h2 className="text-lg font-semibold mb-2">{team} Players</h2>
              <button onClick={() => addPlayer(side)} className="mb-3 bg-blue-500 text-white px-3 py-1 rounded">+ Add Player</button>
              <ul className="mb-3">
                {players.map((p, i) => (
                  <li key={i} className="flex justify-between items-center py-1">
                    <span>{p.name}</span>
                    <div className="flex items-center gap-2">
                      <button onClick={() => updatePoints(side, i, -1)} className="bg-gray-300 px-2 rounded">-</button>
                      <span>{p.points}</span>
                      <button onClick={() => updatePoints(side, i, 1)} className="bg-gray-300 px-2 rounded">+</button>
                    </div>
                  </li>
                ))}
              </ul>
              <div>
                <h3 className="font-semibold mb-1">PowerPlays</h3>
                <div className="flex gap-2 flex-wrap">
                  {powerPlayOptions.map((play) => (
                    <button key={play}
                      disabled={selections.includes(play) || selections.length >= 2}
                      onClick={() => setSelections([...selections, play])}
                      className={`px-2 py-1 rounded ${selections.includes(play) ? "bg-green-600 text-white" : "bg-gray-200"}`}
                    >
                      {play}
                    </button>
                  ))}
                </div>
                <div className="mt-2">
                  {selections.map((play) => (
                    <button key={play} onClick={() => startPowerPlay(team, play)} className="mr-2 mt-2 px-3 py-1 bg-blue-600 text-white rounded">
                      Start {team} - {play}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mb-6">
          <h2 className="text-xl mb-1">Active Power Play</h2>
          {isPowerActive ? (
            <div className="text-3xl font-mono">{activeTeam} - {activePlay} ({formatTime(powerTimer)})</div>
          ) : (
            <p className="text-gray-400">None</p>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">Leaderboard</h2>
          <ul>
            {getLeaderboard().map((p, i) => (
              <li key={i} className="flex justify-between">
                <span>{p.name}</span>
                <span className="font-mono">{p.points} pts</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
