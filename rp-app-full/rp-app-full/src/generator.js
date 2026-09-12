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
// each day. Kept intentionally simple (full-body / upper-lower / PPL-ish)
// rather than modeling every possible split.
const SPLIT_TEMPLATES = {
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
  equipment = [],       // used when equipmentByDay is not provided
  equipmentByDay = null, // optional: array of equipment-lists, one per day index
  excludeBench = false, // true = skip any exercise that needs a bench, regardless of equipment selected
}) {
  const split = SPLIT_TEMPLATES[daysPerWeek] ?? SPLIT_TEMPLATES[4];
  const landmarks = VOLUME_LANDMARKS[track] ?? VOLUME_LANDMARKS.neutral;

  const weekPlans = [];

  for (let weekIndex = 0; weekIndex < weeks; weekIndex++) {
    const { reps, rir } = repRangeForWeek(weekIndex, weeks);

    const days = await Promise.all(
      split.map(async (muscles, dayIndex) => {
        const dayEquipment = equipmentByDay?.[dayIndex] ?? equipment;

        const exercisesPerMuscle = await Promise.all(
          muscles.map(async (muscle) => {
            const totalSets = targetSetsForWeek(landmarks, muscle, weekIndex, weeks);
            // Split the muscle's weekly sets across however many days train it
            const daysHittingThisMuscle = split.filter((d) => d.includes(muscle)).length;
            const setsThisDay = Math.max(1, Math.round(totalSets / daysHittingThisMuscle));

            const picks = await pickExercisesForMuscle(muscle, {
              equipment: dayEquipment,
              excludeBench,
              track,
              count: setsThisDay > 6 ? 2 : 1, // split heavier volume across 2 exercises
              weekIndex, // rotates which exercise gets picked week to week
            });

            return picks
              .map((ex, i) => ({
                muscle,
                name: ex.name,
                sets: i === 0 ? Math.ceil(setsThisDay / picks.length) : Math.floor(setsThisDay / picks.length),
                reps,
                rir,
              }))
              .filter((e) => e.sets > 0);
          })
        );

        return { dayIndex: dayIndex + 1, exercises: exercisesPerMuscle.flat() };
      })
    );

    weekPlans.push({ weekIndex: weekIndex + 1, isDeload: weekIndex === weeks - 1, days });
  }

  return {
    name,
    weeks,
    daysPerWeek,
    track,
    weekPlans,
  };
}

export { SPLIT_TEMPLATES };
