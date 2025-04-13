// utils/supabaseUtils.js
import { supabase } from "../lib/supabase";

// ✔️ Login (Email + Password)
export async function loginUser(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { data, error };
}

// ✔️ Signup
export async function signupUser(email, password) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  return { data, error };
}

// ✔️ Logout
export async function logoutUser() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

// ✔️ Get current logged-in user
export async function getCurrentUser() {
  const { data: { session }, error } = await supabase.auth.getSession();
  return { user: session?.user, error };
}

// ✔️ Update workout count by playerName
export async function updateWorkoutCount(playerName) {
  if (!playerName) return;

  const { data, error } = await supabase
    .from("players")
    .select("workouts_completed")
    .eq("name", playerName)
    .single();

  if (error) {
    console.error("Error fetching player:", error);
    return;
  }

  const currentCount = data?.workouts_completed || 0;

  const { error: updateError } = await supabase
    .from("players")
    .update({ workouts_completed: currentCount + 1 })
    .eq("name", playerName);

  if (updateError) {
    console.error("Error updating workouts:", updateError);
  } else {
    console.log("✅ Workout count updated!");
  }
}

// ✔️ Log detailed workout history (for charts, XP, etc.)
export async function logWorkout(playerId, workoutType, xp) {
  const { data, error } = await supabase.from("workout_history").insert([{
    player_id: playerId,
    workout_type: workoutType,
    xp: xp
  }]);
  return { data, error };
}

// ✔️ Fetch workout history for charts
export async function fetchWorkoutHistory(playerId) {
  const { data, error } = await supabase
    .from("workout_history")
    .select("*")
    .eq("player_id", playerId)
    .order("timestamp", { ascending: true });

  return { data, error };
}
