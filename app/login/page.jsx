"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    let data, error;
    if (mode === "signup") {
      ({ data, error } = await supabase.auth.signUp({ email, password }));
    } else {
      ({ data, error } = await supabase.auth.signInWithPassword({ email, password }));
    }

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    const user = data?.user || data?.session?.user;
    if (!user) {
      setError("No user session found.");
      setLoading(false);
      return;
    }

    const { data: player, error: profileError } = await supabase
      .from("players")
      .select("id")
      .eq("auth_id", user.id)
      .single();

    if (profileError || !player) {
      router.push("/setup");
    } else {
      router.push("/homepage");
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-black text-white px-4">
      {/* Background Video */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover object-[center_40%] z-0"
        style={{ filter: "brightness(0.4)" }}
      >
        <source src="/videos/powerplay-login-bg.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Dark overlay for legibility */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-10" />

      {/* Login Form */}
      <form
        onSubmit={handleSubmit}
        className="relative z-20 bg-white bg-opacity-90 p-10 rounded-xl shadow-2xl w-full max-w-md border border-gray-200"
      >
        <div className="flex flex-col items-center mb-4">
          <Image src="/powerplay-logo.png" alt="PowerPlay Logo" width={120} height={120} />
          <p className="text-sm text-gray-600 text-center italic mt-2">
            Where players lead the game.
          </p>
        </div>

        <h1 className="text-3xl font-extrabold text-center text-black mb-6">
          PowerPlay Soccer
        </h1>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1 w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
          />
        </div>

        {error && <p className="text-red-500 text-sm mb-4">❌ {error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-semibold transition-all shadow-md"
        >
          {loading ? "Please wait..." : mode === "signup" ? "Sign Up" : "Log In"}
        </button>

        <div className="text-sm text-center mt-4 text-black">
          {mode === "login" ? (
            <span>
              Don’t have an account?{' '}
              <button
                type="button"
                className="text-blue-600 hover:underline"
                onClick={() => setMode("signup")}
              >
                Sign Up
              </button>
            </span>
          ) : (
            <span>
              Already registered?{' '}
              <button
                type="button"
                className="text-blue-600 hover:underline"
                onClick={() => setMode("login")}
              >
                Log In
              </button>
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
