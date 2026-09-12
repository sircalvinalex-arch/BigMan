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

// The upstream dataset mistags some exercises as "body only" (truly
// no-equipment) when they actually require a bench, step, or other prop
// to perform — meaning they'd wrongly show up when someone filters to
// "I only have my body." This corrects those known cases. Add more here
// if you spot others; each entry overrides just the "equipment" field.
const EQUIPMENT_CORRECTIONS = {
  "Bench Dips": "other",
  "Bench Jump": "other",
  "Crunch - Legs On Exercise Ball": "exercise ball",
  "Decline Crunch": "other",
  "Decline Oblique Crunch": "other",
  "Decline Reverse Crunch": "other",
  "Flat Bench Leg Pull-In": "other",
  "Flat Bench Lying Leg Raise": "other",
  "Incline Push-Up": "other",
  "Incline Push-Up Close-Grip": "other",
  "Incline Push-Up Medium": "other",
  "Incline Push-Up Reverse Grip": "other",
  "Incline Push-Up Wide": "other",
  "Seated Flat Bench Leg Pull-In": "other",
  "Step-up with Knee Raise": "other",
  "V-Bar Pullup": "other",
  // NOT corrected: "Hyperextensions With No Hyperextension Bench" — the
  // name means it's the variant designed to NOT need a bench, so "body
  // only" is actually correct there despite matching the word "bench".
};

// The dataset's "equipment" field is single-valued (e.g. "dumbbell"), so
// it can't separately capture that an exercise ALSO needs a bench —
// "Dumbbell Bench Press" and "Standing Dumbbell Curl" are both tagged
// "dumbbell" with no way to tell them apart. Overwriting equipment to
// "bench" would lose the fact that it's still fundamentally a dumbbell
// exercise (useful to someone who does have one), so this is a second,
// independent flag layered on top instead — heuristic, based on the
// exercise name, since the dataset itself has no explicit bench field.
// Not perfect (a name-based guess can't be), but catches the large
// majority: any exercise whose name says "bench", "incline", or
// "decline" is done on a bench in this dataset's naming convention.
const BENCH_NAME_PATTERN = /\b(bench|incline|decline)\b/i;

function applyCorrections(exercise) {
  const corrected = EQUIPMENT_CORRECTIONS[exercise.name];
  const withEquipment = corrected ? { ...exercise, equipment: corrected } : exercise;
  return { ...withEquipment, requiresBench: BENCH_NAME_PATTERN.test(exercise.name) };
}

// The full dataset is ~800 exercises in one JSON file — small enough to
// fetch once and cache in memory for the session rather than re-fetching
// on every search.
let cache = null;

async function loadAll() {
  if (cache) return cache;
  const res = await fetch(DATA_URL);
  if (!res.ok) throw new Error(`Failed to load exercise data: ${res.status}`);
  const raw = await res.json();
  cache = raw.map(applyCorrections);
  return cache;
}

function withImageUrls(exercise) {
  return {
    ...exercise,
    imageUrls: (exercise.images ?? []).map((path) => `${IMAGE_BASE}${path}`),
  };
}

async function searchExercises(query, { limit = 20, equipment = [], category = null, excludeBench = false } = {}) {
  const all = await loadAll();
  const q = query.toLowerCase();
  return all
    .filter((ex) => ex.name.toLowerCase().includes(q))
    .filter((ex) => equipment.length === 0 || equipment.includes(ex.equipment))
    .filter((ex) => !category || ex.category === category)
    .filter((ex) => !excludeBench || !ex.requiresBench)
    .slice(0, limit)
    .map(withImageUrls);
}

// Body part browsing maps onto this dataset's "primaryMuscles" field
// rather than a bodyPart field, so we match loosely by keyword.
async function getExercisesByBodyPart(bodyPart, { limit = 30, equipment = [], category = null, excludeBench = false } = {}) {
  const all = await loadAll();
  const q = bodyPart.toLowerCase();
  return all
    .filter((ex) =>
      (ex.primaryMuscles ?? []).some((m) => m.toLowerCase().includes(q))
    )
    .filter((ex) => equipment.length === 0 || equipment.includes(ex.equipment))
    .filter((ex) => !category || ex.category === category)
    .filter((ex) => !excludeBench || !ex.requiresBench)
    .slice(0, limit)
    .map(withImageUrls);
}

async function getExerciseById(id) {
  const all = await loadAll();
  const found = all.find((ex) => ex.id === id);
  return found ? withImageUrls(found) : null;
}

// Exact-name lookup (case-insensitive) — used by ExerciseDetailSheet.jsx,
// which only has a plain exercise name from the mesocycle plan (not the
// dataset's internal id). Safe to match by exact name here because the
// generator's exercise pool is built from this same dataset (see
// exercisePool.js), so a planned exercise's name should always match one
// entry here exactly, not just approximately.
async function getExerciseByName(name) {
  const all = await loadAll();
  const target = name.trim().toLowerCase();
  const found = all.find((ex) => ex.name.trim().toLowerCase() === target);
  return found ? withImageUrls(found) : null;
}

// Raw access to the full corrected dataset, for the generator's exercise
// pool logic — no image URLs attached here since the generator only
// needs name/equipment/mechanic/muscle metadata, not photos.
async function getAllExercises() {
  return loadAll();
}

// Equipment values as they appear in the dataset, for building a filter UI.
export const EQUIPMENT_OPTIONS = [
  "body only",
  "dumbbell",
  "barbell",
  "cable",
  "machine",
  "kettlebells",
  "bands",
  "e-z curl bar",
  "exercise ball",
  "medicine ball",
  "foam roll",
  "other",
];

export const exerciseLibrary = {
  searchExercises,
  getExercisesByBodyPart,
  getExerciseById,
  getExerciseByName,
  getAllExercises,
};
