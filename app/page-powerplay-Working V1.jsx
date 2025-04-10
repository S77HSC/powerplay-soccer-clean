
"use client";

import { useState, useEffect } from "react";

export default function PowerPlayApp() {
  const [darkMode, setDarkMode] = useState(false);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

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
  const [timer, setTimer] = useState(0);
  const [isActive, setIsActive] = useState(false);

  const [matchTime, setMatchTime] = useState(600);
  const [matchRunning, setMatchRunning] = useState(false);

  const startPowerPlay = (team, play) => {
    setActiveTeam(team);
    setActivePlay(play);
    setTimer(120);
    setIsActive(true);
  };

  useEffect(() => {
    let interval = null;
    if (matchRunning && matchTime > 0) {
      interval = setInterval(() => setMatchTime(t => t - 1), 1000);
    } else if (matchTime === 0) {
      setMatchRunning(false);
      setIsActive(false);
      setActiveTeam("");
      setActivePlay("");
    }
    return () => clearInterval(interval);
  }, [matchRunning, matchTime]);

  useEffect(() => {
    let interval = null;
    if (isActive && timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    } else if (timer === 0 && isActive) {
      setIsActive(false);
      setActivePlay("");
      setActiveTeam("");
    }
    return () => clearInterval(interval);
  }, [isActive, timer]);

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
          <img src="/logo.png" alt="Logo" className="h-16" />
          <button onClick={() => setDarkMode(!darkMode)} className="px-4 py-2 bg-black text-white dark:bg-white dark:text-black rounded">
            {darkMode ? "Light" : "Dark"} Mode
          </button>
        </div>

        <div className="text-center my-6">
          <div className="text-3xl font-mono mb-2">{scoreA} v {scoreB}</div>
          <div className="flex justify-center gap-4">
            <button onClick={() => setScoreA(Math.max(0, scoreA - 1))} className="bg-red-500 px-3 py-1 text-white rounded">-1 {teamA}</button>
            <button onClick={() => setScoreA(scoreA + 1)} className="bg-green-500 px-3 py-1 text-white rounded">+1 {teamA}</button>
            <button onClick={() => setScoreB(Math.max(0, scoreB - 1))} className="bg-red-500 px-3 py-1 text-white rounded">-1 {teamB}</button>
            <button onClick={() => setScoreB(scoreB + 1)} className="bg-green-500 px-3 py-1 text-white rounded">+1 {teamB}</button>
          </div>
        </div>

        <div className="text-center my-4">
          <h2 className="text-xl mb-1">Match Timer</h2>
          <div className="text-4xl font-mono tracking-widest">{formatTime(matchTime)}</div>
          <div className="mt-2 flex justify-center gap-2">
            <button onClick={() => setMatchRunning(!matchRunning)} className="px-3 py-1 rounded bg-blue-600 text-white">
              {matchRunning ? "Pause" : "Start"}
            </button>
            <button onClick={() => { setMatchRunning(false); setMatchTime(600); }} className="px-3 py-1 rounded bg-gray-600 text-white">
              Reset
            </button>
          </div>
        </div>

        <div className="my-8">
          {[{ team: teamA, selections: selectedPowerPlaysA, setSelections: setSelectedPowerPlaysA },
            { team: teamB, selections: selectedPowerPlaysB, setSelections: setSelectedPowerPlaysB }]
            .map(({ team, selections, setSelections }) => (
            <div key={team} className="mb-6">
              <h3 className="text-lg font-semibold mb-2">{team} - Select PowerPlays</h3>
              <div className="flex gap-2 flex-wrap">
                {powerPlayOptions.map((play) => {
                  const playIcon =
                    play === "Overload" ? "/overload.png"
                    : play === "Double Trouble" ? "/doubletrouble.png"
                    : "/hotzone.png";
                  return (
                    <button
                      key={play}
                      disabled={selections.includes(play) || selections.length >= 2}
                      onClick={() => {
                        if (!selections.includes(play)) setSelections([...selections, play]);
                      }}
                      className={`p-2 w-24 rounded flex flex-col items-center text-xs text-center transition ${
                        selections.includes(play) ? "bg-green-500 text-white" : "bg-white hover:bg-gray-100"
                      }`}
                    >
                      <img src={playIcon} alt={play} className="h-10 w-10 mb-1 object-contain" />
                      <span>{play}</span>
                    </button>
                  );
                })}
              </div>
              <div className="mt-2">
                {selections.map((play) => (
                  <button key={play} onClick={() => startPowerPlay(team, play)} className="mr-2 mt-2 px-3 py-1 bg-blue-600 text-white rounded">
                    Start {team} - {play}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mb-6">
          <h2 className="text-xl mb-1">Active Power Play</h2>
          {isActive ? (
            <div className="text-3xl font-mono">{activeTeam} - {activePlay} ({formatTime(timer)})</div>
          ) : (
            <p className="text-gray-400">None</p>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {[{ team: teamA, players: playersA, side: "A" },
            { team: teamB, players: playersB, side: "B" }]
            .map(({ team, players, side }) => (
            <div key={team} className="bg-white dark:bg-gray-800 rounded p-3 shadow">
              <h2 className="text-lg font-semibold mb-2">{team} Players</h2>
              <button onClick={() => addPlayer(side)} className="mb-3 bg-blue-500 text-white px-3 py-1 rounded">+ Add Player</button>
              <ul>
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
            </div>
          ))}
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
