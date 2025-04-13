"use client";

import { useState, useEffect } from "react";
import ReactPlayer from "react-player";
import Image from "next/image";
import { updateWorkoutCount } from "../utils/supabaseUtils"; // 👈 utility for Supabase update

export default function SkillSession({ playerName }) {
  const [rounds, setRounds] = useState(5);
  const [duration, setDuration] = useState(30);
  const [breakTime, setBreakTime] = useState(30);
  const [currentRound, setCurrentRound] = useState(0);
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isRunning, setIsRunning] = useState(false);
  const [xp, setXP] = useState(0);
  const [sessionComplete, setSessionComplete] = useState(false);

  useEffect(() => {
    let timer;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    } else if (isRunning && timeLeft === 0) {
      clearInterval(timer);
      if (currentRound < rounds) {
        setCurrentRound((r) => r + 1);
        setTimeLeft(breakTime);
      } else {
        setIsRunning(false);
        setSessionComplete(true);
        setXP((x) => x + 10);
        const msg = new SpeechSynthesisUtterance("Great job. Believe in yourself like Ronaldo.");
        speechSynthesis.speak(msg);

        // 🎯 Update Supabase when workout completes
        if (playerName) {
          updateWorkoutCount(playerName);
        }
      }
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft, currentRound]);

  const startSession = () => {
    setCurrentRound(1);
    setTimeLeft(duration);
    setIsRunning(true);
    setSessionComplete(false);
  };

  const resetSession = () => {
    setIsRunning(false);
    setCurrentRound(0);
    setTimeLeft(duration);
    setSessionComplete(false);
  };

  return (
    <div className="min-h-screen bg-white p-6 font-sans text-gray-800">
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6 items-start">
        <div>
          <Image src="/ss_online_logo.png" alt="Logo" width={160} height={160} />
          <h1 className="text-2xl font-semibold my-4 italic text-blue-800">"Believe in yourself like Ronaldo."</h1>
          <ReactPlayer url="/s1_toetaps.mp4" controls width="100%" height="auto" />
          <Image src="/ronaldo.png" alt="Ronaldo" width={120} height={120} className="mt-4 rounded shadow" />
        </div>
        <div className="bg-gray-50 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold mb-4">Toe Taps HIIT Challenge</h2>
          <div className="space-y-3">
            <div>
              <label className="block">Number of Sets</label>
              <input type="number" value={rounds} onChange={(e) => setRounds(Number(e.target.value))} className="w-full border p-2 rounded" />
            </div>
            <div>
              <label className="block">Duration (sec)</label>
              <input type="number" value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="w-full border p-2 rounded" />
            </div>
            <div>
              <label className="block">Break Time (sec)</label>
              <input type="number" value={breakTime} onChange={(e) => setBreakTime(Number(e.target.value))} className="w-full border p-2 rounded" />
            </div>
            <div className="text-center text-4xl font-mono py-4">{isRunning ? timeLeft : "Ready?"}</div>
            <div className="flex justify-between">
              <button onClick={startSession} className="bg-green-600 text-white px-4 py-2 rounded">Start</button>
              <button onClick={resetSession} className="bg-red-500 text-white px-4 py-2 rounded">Reset</button>
            </div>
            <div className="mt-4">
              <div className="mb-1 text-sm">XP Progress</div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div className="bg-yellow-400 h-4 rounded-full transition-all" style={{ width: `${xp}%` }}></div>
              </div>
              <div className="text-right text-sm mt-1">{xp} XP</div>
            </div>
            {sessionComplete && (
              <div className="mt-4 p-3 bg-green-100 text-green-800 text-center rounded">✅ Workout Completed!</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
