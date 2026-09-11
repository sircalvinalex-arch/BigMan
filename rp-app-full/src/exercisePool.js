// exercisePool.js
//
// Curated exercise pool per muscle group, with names matched exactly to
// the free-exercise-db dataset so they link back into the Exercise Library
// (photos + instructions) when the generator picks them.
//
// "priority" is a rough compound-first ordering used by the generator to
// pick primary vs accessory movements. "tracks" marks which programming
// track(s) favor this exercise as a priority pick when a muscle group has
// multiple viable options — this reflects common program emphasis (e.g.
// NROLW-style posterior chain focus), not a claim about who "should" do
// which exercise. Any exercise works for anyone; this only affects what
// the generator suggests first.

export const EXERCISE_POOL = {
  chest: [
    { name: "Barbell Bench Press - Medium Grip", equipment: "barbell", compound: true },
    { name: "Barbell Incline Bench Press - Medium Grip", equipment: "barbell", compound: true },
    { name: "Cable Chest Press", equipment: "cable", compound: true },
    { name: "Cable Crossover", equipment: "cable", compound: false },
    { name: "Butterfly", equipment: "machine", compound: false },
  ],
  lats: [
    { name: "Chin-Up", equipment: "body only", compound: true },
    { name: "Full Range-Of-Motion Lat Pulldown", equipment: "cable", compound: true },
    { name: "Close-Grip Front Lat Pulldown", equipment: "cable", compound: true },
    { name: "Elevated Cable Rows", equipment: "cable", compound: true },
  ],
  middle_back: [
    { name: "Bent Over Barbell Row", equipment: "barbell", compound: true },
    { name: "Bent Over Two-Dumbbell Row", equipment: "dumbbell", compound: true },
    { name: "Dumbbell Incline Row", equipment: "dumbbell", compound: true },
    { name: "Leverage High Row", equipment: "machine", compound: true },
  ],
  shoulders: [
    { name: "Barbell Shoulder Press", equipment: "barbell", compound: true },
    { name: "Arnold Dumbbell Press", equipment: "dumbbell", compound: true },
    { name: "Alternating Cable Shoulder Press", equipment: "cable", compound: true },
    { name: "Alternating Deltoid Raise", equipment: "dumbbell", compound: false },
    { name: "Bent Over Dumbbell Rear Delt Raise With Head On Bench", equipment: "dumbbell", compound: false },
  ],
  biceps: [
    { name: "Barbell Curl", equipment: "barbell", compound: false },
    { name: "Alternate Incline Dumbbell Curl", equipment: "dumbbell", compound: false },
    { name: "Cable Preacher Curl", equipment: "cable", compound: false },
    { name: "Close-Grip EZ Bar Curl", equipment: "e-z curl bar", compound: false },
  ],
  triceps: [
    { name: "Bench Dips", equipment: "body only", compound: true },
    { name: "Cable Lying Triceps Extension", equipment: "cable", compound: false },
    { name: "Cable Incline Triceps Extension", equipment: "cable", compound: false },
  ],
  quadriceps: [
    { name: "Barbell Squat", equipment: "barbell", compound: true, tracks: ["female"] },
    { name: "Barbell Walking Lunge", equipment: "barbell", compound: true },
    { name: "Barbell Step Ups", equipment: "barbell", compound: true, tracks: ["female"] },
    { name: "Barbell Full Squat", equipment: "barbell", compound: true },
  ],
  hamstrings: [
    { name: "Good Morning", equipment: "barbell", compound: true, tracks: ["female"] },
    { name: "Glute Ham Raise", equipment: "machine", compound: true, tracks: ["female"] },
    { name: "Clean Deadlift", equipment: "barbell", compound: true },
  ],
  glutes: [
    { name: "Barbell Hip Thrust", equipment: "barbell", compound: true, tracks: ["female"] },
    { name: "Barbell Glute Bridge", equipment: "barbell", compound: true, tracks: ["female"] },
    { name: "Glute Kickback", equipment: "body only", compound: false, tracks: ["female"] },
  ],
  calves: [
    { name: "Seated Calf Raise", equipment: "machine", compound: false },
    { name: "Calf Press", equipment: "machine", compound: false },
    { name: "Calf Raise On A Dumbbell", equipment: "dumbbell", compound: false },
  ],
  abdominals: [
    { name: "Air Bike", equipment: "body only", compound: true },
    { name: "Barbell Ab Rollout", equipment: "barbell", compound: true },
    { name: "3/4 Sit-Up", equipment: "body only", compound: false },
  ],
  traps: [
    { name: "Barbell Shrug", equipment: "barbell", compound: false },
    { name: "Dumbbell Shrug", equipment: "dumbbell", compound: false },
    { name: "Cable Shrugs", equipment: "cable", compound: false },
  ],
};

// Returns exercises for a muscle group, filtered to available equipment
// and sorted so track-favored + compound movements come first.
export function pickExercisesForMuscle(muscle, { equipment = [], track = "neutral", count = 2 } = {}) {
  const pool = EXERCISE_POOL[muscle] ?? [];
  const available = equipment.length === 0
    ? pool
    : pool.filter((ex) => equipment.includes(ex.equipment));

  const sorted = [...available].sort((a, b) => {
    const aFav = a.tracks?.includes(track) ? 1 : 0;
    const bFav = b.tracks?.includes(track) ? 1 : 0;
    if (aFav !== bFav) return bFav - aFav;
    if (a.compound !== b.compound) return a.compound ? -1 : 1;
    return 0;
  });

  return sorted.slice(0, count);
}
