// fatigueSignals.js
//
// Turns math that already exists elsewhere — RIR-vs-plan feedback in
// autoregulate.js, MEV/MAV/MRV landmarks in volumeLandmarks.js — into a
// short list of human-readable "here's what's happening with your
// fatigue" notes, meant to be shown proactively on the dashboard.
//
// This module is read-only: it never changes your plan. Applying an
// autoregulated adjustment is still the separate, deliberate action via
// the existing "Autoregulate" button. This just makes sure you see the
// signal before you decide whether to act on it, instead of the app
// quietly sitting on it until you remember to click that button.

import { VOLUME_LANDMARKS } from "./volumeLandmarks.js";
import { computeMuscleFeedback, NOISE_THRESHOLD } from "./autoregulate.js";

function currentWeekNumber(workouts) {
  const loggedWeeks = workouts.map((w) => w.week_index).filter((v) => typeof v === "number");
  // Nothing logged yet -> week 1 is current. Otherwise, current week is
  // one past the most recent week with any logged workout.
  return loggedWeeks.length === 0 ? 1 : Math.max(...loggedWeeks) + 1;
}

function mostRecentlyLoggedWeekNumber(workouts) {
  const loggedWeeks = workouts.map((w) => w.week_index).filter((v) => typeof v === "number");
  return loggedWeeks.length === 0 ? null : Math.max(...loggedWeeks);
}

function muscleLabel(muscle) {
  return muscle
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// Is the muscle trending harder or easier than planned, based on the
// most recently logged week's actual RIR vs. the plan's target RIR?
function rirSignals(meso, mesoWorkouts) {
  const lastLoggedWeek = mostRecentlyLoggedWeekNumber(mesoWorkouts);
  if (lastLoggedWeek === null) return [];

  const weekPlan = meso.plan.weekPlans.find((w) => w.weekIndex === lastLoggedWeek);
  if (!weekPlan) return [];

  const weekWorkouts = mesoWorkouts.filter((w) => w.week_index === lastLoggedWeek);
  const plannedExercises = weekPlan.days.flatMap((d) => d.exercises);
  const feedback = computeMuscleFeedback(weekWorkouts, plannedExercises);

  const signals = [];
  for (const [muscle, diffs] of Object.entries(feedback)) {
    if (diffs.length === 0) continue;
    const avgDiff = diffs.reduce((sum, v) => sum + v, 0) / diffs.length;
    if (Math.abs(avgDiff) < NOISE_THRESHOLD) continue;

    if (avgDiff < 0) {
      signals.push({
        muscle,
        severity: Math.min(3, Math.round(Math.abs(avgDiff))),
        type: "rir-hard",
        message: `${muscleLabel(muscle)} came in harder than planned last week — fatigue may be building faster than the plan expected.`,
      });
    } else {
      signals.push({
        muscle,
        severity: 1,
        type: "rir-easy",
        message: `${muscleLabel(muscle)} felt easier than planned last week — there's headroom to add volume.`,
      });
    }
  }
  return signals;
}

// How close is the CURRENT (in-progress or upcoming) week's planned
// volume to that muscle's MRV?
function volumeSignals(meso, mesoWorkouts) {
  const weekNum = currentWeekNumber(mesoWorkouts);
  const weekPlan = meso.plan.weekPlans.find((w) => w.weekIndex === weekNum);
  if (!weekPlan || weekPlan.isDeload) return []; // nothing to warn about once you're already deloading, or the meso is over

  const landmarks = VOLUME_LANDMARKS[meso.plan.track] ?? VOLUME_LANDMARKS.neutral;
  const setsByMuscle = {};
  for (const day of weekPlan.days) {
    for (const ex of day.exercises) {
      setsByMuscle[ex.muscle] = (setsByMuscle[ex.muscle] ?? 0) + ex.sets;
    }
  }

  const signals = [];
  for (const [muscle, totalSets] of Object.entries(setsByMuscle)) {
    const mrv = landmarks[muscle]?.mrv;
    if (!mrv) continue;
    const ratio = totalSets / mrv;

    if (ratio >= 1) {
      signals.push({
        muscle,
        severity: 3,
        type: "mrv-over",
        message: `${muscleLabel(muscle)} is planned at ${totalSets} sets this week — at or above your MRV (${mrv}). A deload isn't far off.`,
      });
    } else if (ratio >= 0.85) {
      signals.push({
        muscle,
        severity: 2,
        type: "mrv-near",
        message: `${muscleLabel(muscle)} is planned at ${totalSets} sets this week — approaching your MRV (${mrv}).`,
      });
    }
  }
  return signals;
}

// meso: a mesocycle row with a generated .plan (see generator.js)
// allWorkouts: full workouts array from state — this filters to the meso itself
export function computeFatigueSignals(meso, allWorkouts) {
  if (!meso?.plan) return [];
  const mesoWorkouts = allWorkouts.filter((w) => w.mesocycle_id === meso.id);
  const signals = [...rirSignals(meso, mesoWorkouts), ...volumeSignals(meso, mesoWorkouts)];
  return signals.sort((a, b) => b.severity - a.severity);
}
