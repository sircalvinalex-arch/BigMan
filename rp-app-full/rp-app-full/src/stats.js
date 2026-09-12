// stats.js
// Calculation functions over logged workout history.

import { buildMuscleIndex } from "./exercisePool.js";

// Epley formula — a standard, widely-used estimated-1RM approximation.
// Like any e1RM formula, it's an estimate that gets less accurate above
// ~12 reps; treat it as a trend indicator, not a literal max prediction.
export function estimatedOneRepMax(weight, reps) {
  if (!weight || !reps) return 0;
  return Math.round(weight * (1 + reps / 30));
}

// Best (weight, reps, e1RM) ever logged for each exercise name.
export function personalRecords(workouts) {
  const records = {};
  for (const workout of workouts) {
    for (const ex of workout.exercises ?? []) {
      for (const set of ex.sets ?? []) {
        const e1rm = estimatedOneRepMax(set.weight, set.reps);
        const current = records[ex.name];
        if (!current || e1rm > current.e1rm) {
          records[ex.name] = {
            name: ex.name,
            weight: set.weight,
            reps: set.reps,
            e1rm,
            date: workout.date,
          };
        }
      }
    }
  }
  return records;
}

// Given a single newly-logged workout and the PRs from BEFORE that
// workout, returns which sets in it were new PRs — used to show a
// celebratory flag right after logging.
// Given a single newly-logged workout and the PRs from BEFORE that
// workout, returns which EXERCISES had a new best e1RM in this workout —
// one entry per exercise (the best set from this session), not one per
// set. Without deduping like this, three identical sets in one session
// would each independently "beat" an empty prior record and all get
// flagged, showing the same PR three times.
export function findNewPRs(newWorkout, priorRecords) {
  const bestThisWorkout = {}; // { exerciseName: { name, weight, reps, e1rm } }

  for (const ex of newWorkout.exercises ?? []) {
    for (const set of ex.sets ?? []) {
      const e1rm = estimatedOneRepMax(set.weight, set.reps);
      const currentBest = bestThisWorkout[ex.name]?.e1rm ?? 0;
      if (e1rm > currentBest) {
        bestThisWorkout[ex.name] = { name: ex.name, weight: set.weight, reps: set.reps, e1rm };
      }
    }
  }

  return Object.values(bestThisWorkout).filter((best) => {
    const priorBest = priorRecords[best.name]?.e1rm ?? 0;
    return best.e1rm > priorBest;
  });
}

// Weekly logged set-volume per muscle group, for charting. Weeks are
// bucketed by ISO week start (Monday) for consistency.
function startOfIsoWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString().slice(0, 10);
}

export async function volumeByMuscleOverTime(workouts) {
  const muscleIndex = await buildMuscleIndex();
  const byWeek = {}; // { weekStart: { muscle: setCount } }

  for (const workout of workouts) {
    const week = startOfIsoWeek(workout.date);
    if (!byWeek[week]) byWeek[week] = {};

    for (const ex of workout.exercises ?? []) {
      const muscle = muscleIndex[ex.name] ?? "other";
      const sets = ex.sets?.length ?? 0;
      byWeek[week][muscle] = (byWeek[week][muscle] ?? 0) + sets;
    }
  }

  return Object.entries(byWeek)
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([week, muscles]) => ({ week, ...muscles }));
}

// e1RM trend over time for a single exercise, for a strength-progress chart.
export function e1rmTrendForExercise(workouts, exerciseName) {
  const points = [];
  for (const workout of workouts) {
    for (const ex of workout.exercises ?? []) {
      if (ex.name !== exerciseName) continue;
      const best = Math.max(...(ex.sets ?? []).map((s) => estimatedOneRepMax(s.weight, s.reps)), 0);
      if (best > 0) points.push({ date: workout.date.slice(0, 10), e1rm: best });
    }
  }
  return points.sort((a, b) => (a.date < b.date ? -1 : 1));
}

// List of exercise names actually present in the logged history, for
// populating a "pick an exercise to chart" dropdown.
export function loggedExerciseNames(workouts) {
  const names = new Set();
  for (const workout of workouts) {
    for (const ex of workout.exercises ?? []) names.add(ex.name);
  }
  return Array.from(names).sort();
}
