// storage.js
// Cross-device persistence via Supabase (Postgres + auth).
// Every function is scoped to the currently logged-in user automatically,
// via Row Level Security policies defined in supabase-schema.sql and
// supabase-schema-v2.sql.

import { supabase } from "./supabaseClient.js";
import { offlineQueue } from "./offlineQueue.js";

// ---- Auth ----

async function getUser() {
  const { data } = await supabase.auth.getUser();
  return data?.user ?? null;
}

async function signInWithEmail(email) {
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

async function createMesocycle({ name, weeks = 5, focus = [], plan = null }) {
  const { data, error } = await supabase
    .from("mesocycles")
    .insert({ name, weeks, focus, plan })
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

async function updateMesocyclePlan(id, plan) {
  const { data, error } = await supabase
    .from("mesocycles")
    .update({ plan })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function deleteMesocycle(id) {
  const { error } = await supabase.from("mesocycles").delete().eq("id", id);
  if (error) throw error;
}

// ---- Workouts ----

async function logWorkout({ mesocycleId = null, exercises, weekIndex = null, dayIndex = null }) {
  return offlineQueue.runOrQueue("logWorkout", { mesocycleId, exercises, weekIndex, dayIndex }, async () => {
    const { data, error } = await supabase
      .from("workouts")
      .insert({ mesocycle_id: mesocycleId, exercises, week_index: weekIndex, day_index: dayIndex })
      .select()
      .single();
    if (error) throw error;
    return data;
  });
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

// Duplicates a past workout as a new entry dated today — handy for
// repeat days instead of re-entering everything.
async function duplicateWorkout(workoutId) {
  const { data: original, error: fetchError } = await supabase
    .from("workouts")
    .select("*")
    .eq("id", workoutId)
    .single();
  if (fetchError) throw fetchError;

  const { data, error } = await supabase
    .from("workouts")
    .insert({
      mesocycle_id: original.mesocycle_id,
      exercises: original.exercises,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Flushes any queued offline writes. Call this on reconnect (App.jsx
// wires this to the browser's "online" event) and optionally on app load.
async function flushOfflineQueue() {
  return offlineQueue.flushQueue({
    logWorkout: async (payload) => {
      const { error } = await supabase
        .from("workouts")
        .insert({
          mesocycle_id: payload.mesocycleId,
          exercises: payload.exercises,
          week_index: payload.weekIndex,
          day_index: payload.dayIndex,
        });
      if (error) throw error;
    },
  });
}

// ---- Measurements ----

async function logMeasurement({ weight = null, bodyFatPct = null, custom = {} }) {
  const { data, error } = await supabase
    .from("measurements")
    .insert({ weight, body_fat_pct: bodyFatPct, custom })
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function getMeasurements() {
  const { data, error } = await supabase
    .from("measurements")
    .select("*")
    .order("date", { ascending: true });
  if (error) throw error;
  return data;
}

async function deleteMeasurement(id) {
  const { error } = await supabase.from("measurements").delete().eq("id", id);
  if (error) throw error;
}

// ---- Progress photos ----
// Requires a Supabase Storage bucket named "progress-photos" — see
// SETUP.md for the one-time creation step.

async function uploadProgressPhoto(file, { note = "" } = {}) {
  const user = await getUser();
  if (!user) throw new Error("Must be signed in to upload a photo.");

  const path = `${user.id}/${Date.now()}-${file.name}`;
  const { error: uploadError } = await supabase.storage
    .from("progress-photos")
    .upload(path, file);
  if (uploadError) throw uploadError;

  const { data, error } = await supabase
    .from("progress_photos")
    .insert({ storage_path: path, note })
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function getProgressPhotos() {
  const { data, error } = await supabase
    .from("progress_photos")
    .select("*")
    .order("date", { ascending: false });
  if (error) throw error;

  // Attach a signed URL (valid 1 hour) for each photo so the UI can
  // render it directly without the bucket needing to be public.
  const withUrls = await Promise.all(
    data.map(async (photo) => {
      const { data: signed } = await supabase.storage
        .from("progress-photos")
        .createSignedUrl(photo.storage_path, 3600);
      return { ...photo, url: signed?.signedUrl ?? null };
    })
  );
  return withUrls;
}

async function deleteProgressPhoto(id, storagePath) {
  await supabase.storage.from("progress-photos").remove([storagePath]);
  const { error } = await supabase.from("progress_photos").delete().eq("id", id);
  if (error) throw error;
}

export const storage = {
  getUser,
  signInWithEmail,
  signOut,
  onAuthStateChange,
  createMesocycle,
  getMesocycles,
  updateMesocyclePlan,
  deleteMesocycle,
  logWorkout,
  getWorkouts,
  deleteWorkout,
  duplicateWorkout,
  flushOfflineQueue,
  logMeasurement,
  getMeasurements,
  deleteMeasurement,
  uploadProgressPhoto,
  getProgressPhotos,
  deleteProgressPhoto,
};
