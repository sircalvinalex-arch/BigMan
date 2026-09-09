// exerciseLibrary.js
// Talks to a self-hosted ExerciseDB-compatible API for exercise data:
// name, target muscles, equipment, instructions, images, and GIFs/videos.
//
// Deploy your own free instance (one click, no backend to manage):
//   https://github.com/cyberboyanmol/exercisedb-api
// Then set VITE_EXERCISEDB_URL in your .env to that deployment's URL.

const BASE_URL = import.meta.env.VITE_EXERCISEDB_URL;

if (!BASE_URL) {
  console.warn(
    "VITE_EXERCISEDB_URL is not set — exercise library features will not work until you deploy an ExerciseDB instance and add its URL to .env."
  );
}

async function fetchJson(path) {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) throw new Error(`ExerciseDB request failed: ${res.status}`);
  return res.json();
}

// Search exercises by name (e.g. "bench press")
async function searchExercises(query, { limit = 20 } = {}) {
  const data = await fetchJson(`/exercises/name/${encodeURIComponent(query)}?limit=${limit}`);
  return data.data ?? data;
}

// Browse by target body part (e.g. "chest", "back", "legs")
async function getExercisesByBodyPart(bodyPart, { limit = 30 } = {}) {
  const data = await fetchJson(`/exercises/bodyPart/${encodeURIComponent(bodyPart)}?limit=${limit}`);
  return data.data ?? data;
}

// Get full detail for one exercise (instructions, tips, video, image)
async function getExerciseById(id) {
  const data = await fetchJson(`/exercises/exercise/${id}`);
  return data.data ?? data;
}

async function getBodyPartList() {
  const data = await fetchJson(`/exercises/bodyPartList`);
  return data.data ?? data;
}

export const exerciseLibrary = {
  searchExercises,
  getExercisesByBodyPart,
  getExerciseById,
  getBodyPartList,
};
