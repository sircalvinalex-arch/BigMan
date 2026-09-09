// storage.js
// Cross-device persistence via Supabase (Postgres + auth).
// Every function is scoped to the currently logged-in user automatically,
// via Row Level Security policies defined in supabase-schema.sql.

import { supabase } from "./supabaseClient.js";

// ---- Auth ----

async function getUser() {
  const { data } = await supabase.auth.getUser();
  return data?.user ?? null;
}

async function signInWithEmail(email) {
  // Magic-link login: no password to manage.
  const { error } = await supabase.auth.signInWithOtp({ email });
  if (error) throw error;
}

async function signOut() {
  await supabase.auth.signOut();
}

function onAuthStateChange(callback) {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null);
  });
  return data.subscription.unsubscribe;
}

// ---- Mesocycles ----

async function createMesocycle({ name, weeks = 5, focus = [] }) {
  const { data, error } = await supabase
    .from("mesocycles")
    .insert({ name, weeks, focus })
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function getMesocycles() {
  const { data, error } = await supabase
    .from("mesocycles")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data;
}

async function deleteMesocycle(id) {
  const { error } = await supabase.from("mesocycles").delete().eq("id", id);
  if (error) throw error;
}

// ---- Workouts ----

async function logWorkout({ mesocycleId = null, exercises }) {
  const { data, error } = await supabase
    .from("workouts")
    .insert({ mesocycle_id: mesocycleId, exercises })
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function getWorkouts({ mesocycleId } = {}) {
  let query = supabase.from("workouts").select("*").order("date", { ascending: false });
  if (mesocycleId) query = query.eq("mesocycle_id", mesocycleId);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

async function deleteWorkout(id) {
  const { error } = await supabase.from("workouts").delete().eq("id", id);
  if (error) throw error;
}

export const storage = {
  getUser,
  signInWithEmail,
  signOut,
  onAuthStateChange,
  createMesocycle,
  getMesocycles,
  deleteMesocycle,
  logWorkout,
  getWorkouts,
  deleteWorkout,
};
