// generator.js
//
// Builds a full mesocycle: a week-by-week, day-by-day plan with exercises,
// target sets, and rep/RIR ranges — using the volume landmarks and
// exercise pool as inputs. Async because exercise selection now queries
// the full exercise dataset (fetched from GitHub) rather than a small
// hardcoded list.

import { VOLUME_LANDMARKS, targetSetsForWeek } from "./volumeLandmarks.js";
import { pickExercisesForMuscle } from "./exercisePool.js";

// Splits by days-per-week, listing which muscle groups get direct work
// each day. Two styles: "bodypart" (push/pull/legs-ish — a muscle is
// trained on specific days) and "fullbody" (every muscle trained every
// day, with that muscle's weekly sets divided across all of them instead
// of concentrated on one or two days). The per-day set math below
// already divides a muscle's weekly target by however many days it
// appears in the split, so full-body "just works" by listing every
// muscle on every day — no separate volume logic needed for it.
// Order matters here, not just membership — this list IS the exercise
// order for every full-body day (see ALL_MUSCLES.map below). Legs first
// (most fatiguing, most technically demanding — trained while freshest),
// then alternating push/pull upper-body patterns (back, chest, shoulders)
// so no muscle gets trained as a synergist right after being isolated
// (e.g. triceps right before a pressing movement would blunt it),
// arm isolation work in an antagonist pair (biceps/triceps don't
// interfere with each other), then calves/abs last since they're both
// small and being fatigued by them doesn't hurt anything after.
const ALL_MUSCLES = [
  "quadriceps", "hamstrings", "glutes",
  "lats", "middle_back", "chest", "shoulders", "traps",
  "biceps", "triceps",
  "calves", "abdominals",
];

const SPLIT_TEMPLATES = {
  bodypart: {
    2: [
      ["chest", "lats", "quadriceps", "hamstrings", "shoulders", "abdominals"],
      ["middle_back", "glutes", "biceps", "triceps", "calves", "abdominals"],
    ],
    3: [
      ["chest", "shoulders", "triceps", "abdominals"],
      ["lats", "middle_back", "biceps", "traps"],
      ["quadriceps", "hamstrings", "glutes", "calves"],
    ],
    4: [
      ["chest", "shoulders", "triceps"],
      ["lats", "middle_back", "biceps"],
      ["quadriceps", "glutes", "calves"],
      ["hamstrings", "glutes", "abdominals", "traps"],
    ],
    5: [
      ["chest", "triceps"],
      ["lats", "middle_back", "biceps"],
      ["quadriceps", "calves"],
      ["shoulders", "traps", "abdominals"],
      ["hamstrings", "glutes"],
    ],
  },
  fullbody: {
    2: [ALL_MUSCLES, ALL_MUSCLES],
    3: [ALL_MUSCLES, ALL_MUSCLES, ALL_MUSCLES],
    4: [ALL_MUSCLES, ALL_MUSCLES, ALL_MUSCLES, ALL_MUSCLES],
    5: [ALL_MUSCLES, ALL_MUSCLES, ALL_MUSCLES, ALL_MUSCLES, ALL_MUSCLES],
  },
};

// Rep range by RIR-based intensity — widens slightly through the ramp,
// tightens toward lower RIR near the end, per the "intensity of effort
// matters more than a fixed rep range" principle from Schoenfeld's work.
function repRangeForWeek(weekIndex, totalWeeks) {
  const isDeload = weekIndex === totalWeeks - 1;
  if (isDeload) return { reps: "12-15", rir: 4 };
  const progress = (totalWeeks - 1) <= 1 ? 1 : weekIndex / (totalWeeks - 2);
  const rir = Math.max(0, Math.round(3 - progress * 3)); // ramps 3 -> 0 RIR
  return { reps: "8-12", rir };
}

export async function generateMesocycle({
  name,
  weeks = 5,
  daysPerWeek = 4,
  track = "neutral", // "male" | "female" | "neutral"
  splitStyle = "bodypart", // "bodypart" (push/pull/legs-ish) | "fullbody" (every muscle, every day)
  equipment = [],       // "home"/selected-equipment variant — used when equipmentByDay is not provided
  equipmentByDay = null, // optional: array of equipment-lists, one per day index (home variant only)
  excludeBench = false, // home variant only — true = skip any exercise that needs a bench
}) {
  const styleTemplates = SPLIT_TEMPLATES[splitStyle] ?? SPLIT_TEMPLATES.bodypart;
  const split = styleTemplates[daysPerWeek] ?? styleTemplates[4];
  const landmarks = VOLUME_LANDMARKS[track] ?? VOLUME_LANDMARKS.neutral;

  // Every mesocycle generates TWO parallel exercise-name variants — a
  // "gym" version (no equipment restriction at all, since a real gym is
  // assumed to have everything) and a "home" version using whatever
  // equipment the person actually selected below. Both variants share
  // the exact same skeleton: same muscles, same sets, same reps/RIR ramp
  // week to week — only WHICH exercise fulfills each slot differs. That
  // means switching between them mid-mesocycle (see App.jsx's variant
  // switcher) never changes the programming itself, just which specific
  // movements you're doing — so going gym-to-home-to-gym doesn't require
  // regenerating anything or losing progression.
  const weekPlansGym = [];
  const weekPlansHome = [];

  for (let weekIndex = 0; weekIndex < weeks; weekIndex++) {
    const { reps, rir } = repRangeForWeek(weekIndex, weeks);

    const dayPairs = await Promise.all(
      split.map(async (muscles, dayIndex) => {
        const dayEquipment = equipmentByDay?.[dayIndex] ?? equipment;

        const perMuscle = await Promise.all(
          muscles.map(async (muscle) => {
            const totalSets = targetSetsForWeek(landmarks, muscle, weekIndex, weeks);
            // Split the muscle's weekly sets across however many days train it
            const daysHittingThisMuscle = split.filter((d) => d.includes(muscle)).length;
            const setsThisDay = Math.max(1, Math.round(totalSets / daysHittingThisMuscle));
            const count = setsThisDay > 6 ? 2 : 1; // split heavier volume across 2 exercises — shared by both variants

            const [gymPicks, homePicks] = await Promise.all([
              pickExercisesForMuscle(muscle, { equipment: [], excludeBench: false, track, count, weekIndex, dayIndex }),
              pickExercisesForMuscle(muscle, { equipment: dayEquipment, excludeBench, track, count, weekIndex, dayIndex }),
            ]);

            const buildExercises = (picks) =>
              picks
                .map((ex, i) => ({
                  muscle,
                  name: ex.name,
                  sets: i === 0 ? Math.ceil(setsThisDay / picks.length) : Math.floor(setsThisDay / picks.length),
                  reps,
                  rir,
                }))
                .filter((e) => e.sets > 0);

            return { gym: buildExercises(gymPicks), home: buildExercises(homePicks) };
          })
        );

        return {
          dayIndex: dayIndex + 1,
          gym: { dayIndex: dayIndex + 1, exercises: perMuscle.flatMap((p) => p.gym) },
          home: { dayIndex: dayIndex + 1, exercises: perMuscle.flatMap((p) => p.home) },
        };
      })
    );

    weekPlansGym.push({ weekIndex: weekIndex + 1, isDeload: weekIndex === weeks - 1, days: dayPairs.map((d) => d.gym) });
    weekPlansHome.push({ weekIndex: weekIndex + 1, isDeload: weekIndex === weeks - 1, days: dayPairs.map((d) => d.home) });
  }

  const homeEquipmentLabel = equipmentByDay
    ? "Per-day equipment"
    : equipment.length > 0
    ? equipment.join(", ")
    : "Any equipment";

  return {
    name,
    weeks,
    daysPerWeek,
    track,
    splitStyle,
    homeEquipmentLabel,
    activeVariant: "home", // which variant weekPlans below currently reflects
    // weekPlans is the "currently active" variant — every existing
    // consumer (logging, autoregulation, calendar, stats, export) reads
    // this exactly as before and doesn't need to know variants exist at
    // all. Switching variants (see App.jsx) replaces this in place.
    weekPlans: weekPlansHome,
    variants: { gym: weekPlansGym, home: weekPlansHome },
  };
}

export { SPLIT_TEMPLATES };
