
// exerciseLibrary.js
// Pulls exercise data directly from the free-exercise-db public domain
// dataset, hosted on GitHub — no backend deployment required.
//
// Source: https://github.com/yuhonas/free-exercise-db
// Data license: Unlicense (public domain). Images ship in the same repo;
// see that repo's issue tracker if you ever need to verify provenance
// before using this in anything commercial.

const DATA_URL =
  "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json";
const IMAGE_BASE =
  "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/";

// The full dataset is ~800 exercises in one JSON file — small enough to
// fetch once and cache in memory for the session rather than re-fetching
// on every search.
let cache = null;

async function loadAll() {
  if (cache) return cache;
  const res = await fetch(DATA_URL);
  if (!res.ok) throw new Error(`Failed to load exercise data: ${res.status}`);
  cache = await res.json();
  return cache;
}

function withImageUrls(exercise) {
  return {
    ...exercise,
    imageUrls: (exercise.images ?? []).map((path) => `${IMAGE_BASE}${path}`),
  };
}

async function searchExercises(query, { limit = 20 } = {}) {
  const all = await loadAll();
  const q = query.toLowerCase();
  return all
    .filter((ex) => ex.name.toLowerCase().includes(q))
    .slice(0, limit)
    .map(withImageUrls);
}

// Body part browsing maps onto this dataset's "primaryMuscles" field
// rather than a bodyPart field, so we match loosely by keyword.
async function getExercisesByBodyPart(bodyPart, { limit = 30 } = {}) {
  const all = await loadAll();
  const q = bodyPart.toLowerCase();
  return all
    .filter((ex) =>
      (ex.primaryMuscles ?? []).some((m) => m.toLowerCase().includes(q))
    )
    .slice(0, limit)
    .map(withImageUrls);
}

async function getExerciseById(id) {
  const all = await loadAll();
  const found = all.find((ex) => ex.id === id);
  return found ? withImageUrls(found) : null;
}

export const exerciseLibrary = {
  searchExercises,
  getExercisesByBodyPart,
  getExerciseById,
};
