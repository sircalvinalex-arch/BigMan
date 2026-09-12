// exercisePool.js
//
// Picks exercises for a given muscle group by querying the full
// free-exercise-db dataset (876 exercises) via exerciseLibrary.js,
// rather than a small hand-curated list — so the generator has real
// variety to draw from instead of repeating the same handful of moves
// every mesocycle.

import { exerciseLibrary } from "./exerciseLibrary.js";

// Maps our internal muscle-group keys (used throughout the generator,
// volume landmarks, and stats) to the dataset's primaryMuscles values.
const MUSCLE_KEY_TO_DATASET = {
  chest: "chest",
  lats: "lats",
  middle_back: "middle back",
  shoulders: "shoulders",
  biceps: "biceps",
  triceps: "triceps",
  quadriceps: "quadriceps",
  hamstrings: "hamstrings",
  glutes: "glutes",
  calves: "calves",
  abdominals: "abdominals",
  traps: "traps",
};

// Keyword-based track favoritism — reflects common program emphasis
// (e.g. NROLW-style posterior-chain focus), not a claim about who
// "should" do which exercise. Any exercise works for anyone; this only
// affects sort order when a muscle group has many viable options.
const TRACK_KEYWORDS = {
  female: ["hip thrust", "glute", "bridge", "good morning", "romanian", "step up", "step-up", "lunge", "kickback"],
  male: ["bench press", "overhead press", "military press", "pull-up", "pullup", "chin-up", "row", "deadlift"],
};

function matchesTrackKeywords(name, track) {
  const keywords = TRACK_KEYWORDS[track];
  if (!keywords) return false;
  const lower = name.toLowerCase();
  return keywords.some((kw) => lower.includes(kw));
}

let allExercisesCache = null;

// Only these categories represent genuine strength training — excludes
// "stretching" and "cardio", a couple of which the upstream dataset
// mistakenly tags with mechanic:"compound", which would otherwise let a
// stretch (e.g. "One Knee To Chest") get picked as a strength exercise.
const STRENGTH_CATEGORIES = ["strength", "powerlifting", "olympic weightlifting", "strongman"];

async function getCandidatesForMuscle(muscle, { equipment = [], excludeBench = false } = {}) {
  if (!allExercisesCache) {
    allExercisesCache = await exerciseLibrary.getAllExercises();
  }
  const datasetMuscle = MUSCLE_KEY_TO_DATASET[muscle];
  if (!datasetMuscle) return [];

  return allExercisesCache.filter((ex) => {
    const hitsThisMuscle = (ex.primaryMuscles ?? []).includes(datasetMuscle);
    if (!hitsThisMuscle) return false;
    if (!STRENGTH_CATEGORIES.includes(ex.category)) return false;
    if (equipment.length > 0 && !equipment.includes(ex.equipment)) return false;
    if (excludeBench && ex.requiresBench) return false;
    return true;
  });
}

// Returns a sorted candidate list: track-favored first, then compound
// movements, then everything else — stable otherwise so results are
// deterministic given the same inputs (needed for week-to-week rotation
// to behave predictably rather than randomly).
function sortCandidates(candidates, track) {
  return [...candidates].sort((a, b) => {
    const aFav = matchesTrackKeywords(a.name, track) ? 1 : 0;
    const bFav = matchesTrackKeywords(b.name, track) ? 1 : 0;
    if (aFav !== bFav) return bFav - aFav;

    const aCompound = a.mechanic === "compound" ? 1 : 0;
    const bCompound = b.mechanic === "compound" ? 1 : 0;
    if (aCompound !== bCompound) return bCompound - aCompound;

    return a.name.localeCompare(b.name); // stable tiebreaker
  });
}

// Public helper: given a logged exercise NAME, find which of our internal
// muscle-group keys it belongs to (reverse of MUSCLE_KEY_TO_DATASET). Used
// by stats.js to attribute logged volume to a muscle group, and by the
// substitution picker to find alternatives.
const DATASET_TO_MUSCLE_KEY = Object.fromEntries(
  Object.entries(MUSCLE_KEY_TO_DATASET).map(([key, val]) => [val, key])
);

export async function findMuscleForExercise(name) {
  if (!allExercisesCache) {
    allExercisesCache = await exerciseLibrary.getAllExercises();
  }
  const found = allExercisesCache.find((ex) => ex.name === name);
  if (!found) return null;
  const primary = (found.primaryMuscles ?? [])[0];
  return DATASET_TO_MUSCLE_KEY[primary] ?? null;
}

// Returns every candidate exercise for a muscle group (not just the top
// N) — used by the manual substitution picker, where the person should
// see the full list rather than only the generator's auto-picks.
export async function listExercisesForMuscle(muscle, { equipment = [], excludeBench = false } = {}) {
  const candidates = await getCandidatesForMuscle(muscle, { equipment, excludeBench });
  return sortCandidates(candidates, "neutral").map((ex) => ({
    name: ex.name,
    equipment: ex.equipment,
    compound: ex.mechanic === "compound",
  }));
}

// Builds a name -> muscle-key lookup for every exercise in the dataset in
// one pass — used by stats.js so it doesn't do one lookup per exercise.
let muscleIndexCache = null;
export async function buildMuscleIndex() {
  if (muscleIndexCache) return muscleIndexCache;
  if (!allExercisesCache) {
    allExercisesCache = await exerciseLibrary.getAllExercises();
  }
  const index = {};
  for (const ex of allExercisesCache) {
    const primary = (ex.primaryMuscles ?? [])[0];
    const muscleKey = DATASET_TO_MUSCLE_KEY[primary];
    if (muscleKey) index[ex.name] = muscleKey;
  }
  muscleIndexCache = index;
  return index;
}
// Picks `count` exercises for a muscle group, given available equipment
// and a programming track. `weekIndex` rotates which exercises from the
// top of the sorted candidate pool get used — so week 1 might use Barbell
// Bench Press while week 3 uses Incline Dumbbell Press, instead of the
// exact same exercise every single week of the block.
export async function pickExercisesForMuscle(muscle, {
  equipment = [],
  excludeBench = false,
  track = "neutral",
  count = 2,
  weekIndex = 0,
} = {}) {
  const candidates = await getCandidatesForMuscle(muscle, { equipment, excludeBench });
  if (candidates.length === 0) return [];

  const sorted = sortCandidates(candidates, track);

  // Rotate the starting point through the top slice of the sorted pool
  // (not the whole pool — we still want mostly-favored exercises, just
  // not the identical one every week). Cap the rotation window so we
  // don't rotate into weak, unfavored picks just for variety's sake.
  const rotationWindow = Math.min(sorted.length, Math.max(count * 3, 6));
  const pool = sorted.slice(0, rotationWindow);
  const offset = weekIndex % pool.length;
  const rotated = [...pool.slice(offset), ...pool.slice(0, offset)];

  return rotated.slice(0, count).map((ex) => ({
    name: ex.name,
    equipment: ex.equipment,
    compound: ex.mechanic === "compound",
  }));
}
