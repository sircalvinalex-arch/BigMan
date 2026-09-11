// autoregulate.js
//
// Compares the RIR you actually logged against the RIR the plan called
// for, and nudges the next unplayed week's sets up or down accordingly.
// This is the practical version of RP's "auto-regulation" principle:
// the plan is a starting hypothesis, not a fixed prescription — actual
// performance each week should influence what comes next.
//
// Logic, in plain terms:
//   - If you're consistently hitting LOWER RIR than planned (working
//     harder / closer to failure than intended), that muscle group is
//     accumulating fatigue faster than expected — pull back next week's
//     sets slightly versus what the fixed ramp would have called for.
//   - If you're consistently hitting HIGHER RIR than planned (sets felt
//     easier than intended), there's headroom — add a bit more volume
//     next week versus the fixed ramp.
//   - Small deviations (within ~1 RIR) are treated as noise and don't
//     trigger an adjustment, since session-to-session variance is normal.

const NOISE_THRESHOLD = 1; // RIR difference within this range is ignored
const MAX_ADJUSTMENT_SETS = 2; // cap how much any single week can shift

// workouts: array of logged workout rows (each with .exercises[].sets[].rir)
// plannedExercisesForWeek: the plan's exercise list for the week just completed,
//   each with { muscle, name, sets, rir (planned) }
function computeMuscleFeedback(workouts, plannedExercisesForWeek) {
  const feedbackByMuscle = {};

  for (const planned of plannedExercisesForWeek) {
    const actualRirValues = [];

    for (const workout of workouts) {
      for (const ex of workout.exercises ?? []) {
        if (ex.name !== planned.name) continue;
        for (const set of ex.sets ?? []) {
          if (typeof set.rir === "number") actualRirValues.push(set.rir);
        }
      }
    }

    if (actualRirValues.length === 0) continue; // no data logged for this exercise

    const avgActualRir =
      actualRirValues.reduce((sum, v) => sum + v, 0) / actualRirValues.length;
    const diff = avgActualRir - planned.rir; // positive = easier than planned

    if (!feedbackByMuscle[planned.muscle]) feedbackByMuscle[planned.muscle] = [];
    feedbackByMuscle[planned.muscle].push(diff);
  }

  return feedbackByMuscle;
}

// Returns an updated `plan` (same shape as generator.js output) with the
// next unplayed week's set counts nudged based on feedback from the most
// recently completed week.
export function autoregulateNextWeek(plan, workouts) {
  const loggedWeekIndexes = workouts.map((w) => w.week_index).filter((v) => typeof v === "number");
  const completedWeekIndex = loggedWeekIndexes.length > 0 ? Math.max(...loggedWeekIndexes) : -1;

  // Find the most recently completed week in the plan and the next one.
  const lastWeek = plan.weekPlans.find((w) => w.weekIndex === completedWeekIndex + 1);
  const nextWeekIdx = plan.weekPlans.findIndex((w) => w.weekIndex === completedWeekIndex + 2);

  if (!lastWeek || nextWeekIdx === -1) return plan; // nothing to adjust yet, or already at the end

  const lastWeekWorkouts = workouts.filter((w) => w.week_index === completedWeekIndex + 1);
  const plannedExercises = lastWeek.days.flatMap((day) => day.exercises);
  const feedback = computeMuscleFeedback(lastWeekWorkouts, plannedExercises);

  const updatedWeekPlans = plan.weekPlans.map((week, idx) => {
    if (idx !== nextWeekIdx) return week;

    const updatedDays = week.days.map((day) => ({
      ...day,
      exercises: day.exercises.map((ex) => {
        const diffs = feedback[ex.muscle];
        if (!diffs || diffs.length === 0) return ex;

        const avgDiff = diffs.reduce((s, v) => s + v, 0) / diffs.length;
        if (Math.abs(avgDiff) < NOISE_THRESHOLD) return ex;

        // Easier than planned (positive diff) -> add sets. Harder -> remove.
        const rawAdjustment = Math.round(avgDiff);
        const adjustment = Math.max(-MAX_ADJUSTMENT_SETS, Math.min(MAX_ADJUSTMENT_SETS, rawAdjustment));
        const newSets = Math.max(1, ex.sets + adjustment);

        return { ...ex, sets: newSets, autoregulated: adjustment !== 0 };
      }),
    }));

    return { ...week, days: updatedDays };
  });

  return { ...plan, weekPlans: updatedWeekPlans };
}

// Human-readable summary of what changed, for showing the user before
// they commit to the adjusted plan.
export function summarizeAdjustments(originalPlan, adjustedPlan) {
  const notes = [];
  for (let i = 0; i < adjustedPlan.weekPlans.length; i++) {
    const original = originalPlan.weekPlans[i];
    const adjusted = adjustedPlan.weekPlans[i];
    for (let d = 0; d < adjusted.days.length; d++) {
      for (let e = 0; e < adjusted.days[d].exercises.length; e++) {
        const orig = original.days[d].exercises[e];
        const upd = adjusted.days[d].exercises[e];
        if (orig.sets !== upd.sets) {
          const direction = upd.sets > orig.sets ? "+" : "";
          notes.push(
            `Week ${adjusted.weekIndex}, ${upd.name}: ${orig.sets} → ${upd.sets} sets (${direction}${upd.sets - orig.sets})`
          );
        }
      }
    }
  }
  return notes;
}
