import { useState } from "react";
import { getMuscleFunction, getRealLifeTranslation } from "./exerciseInsights.js";
import { listExercisesForMuscle } from "./exercisePool.js";
import { storage } from "./storage.js";

function formatMuscleLabel(muscle) {
  return (muscle ?? "")
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// Produces an updated plan with exactly one exercise slot renamed, leaving
// everything else (sets/reps/rir ramp, other days/weeks) untouched.
function planWithExerciseSwapped(plan, { weekIndex, dayIndex, exerciseIndex, newName }) {
  return {
    ...plan,
    weekPlans: plan.weekPlans.map((week) => {
      if (week.weekIndex !== weekIndex) return week;
      return {
        ...week,
        days: week.days.map((day) => {
          if (day.dayIndex !== dayIndex) return day;
          return {
            ...day,
            exercises: day.exercises.map((ex, i) =>
              i === exerciseIndex ? { ...ex, name: newName } : ex
            ),
          };
        }),
      };
    }),
  };
}

const s = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.85)",
    zIndex: 60,
    display: "flex",
    alignItems: "flex-end",
  },
  sheet: {
    width: "100%",
    background: "var(--surface)",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    maxHeight: "80vh",
    overflowY: "auto",
  },
  title: { fontWeight: 800, fontSize: 17, marginBottom: 2 },
  meta: { fontSize: 12, color: "var(--text-muted)", marginBottom: 14 },
  box: { background: "var(--input-bg)", borderRadius: 8, padding: 10, marginBottom: 10 },
  boxLabelBlue: { fontSize: 11, color: "var(--accent-blue)", fontWeight: 700, marginBottom: 4 },
  boxLabelGreen: { fontSize: 11, color: "var(--accent-green)", fontWeight: 700, marginBottom: 4 },
  boxText: { fontSize: 12, color: "var(--text)", lineHeight: 1.5 },
  actionRow: { display: "flex", gap: 8, marginTop: 4, marginBottom: 4 },
  actionButton: {
    flex: 1,
    background: "var(--accent-blue)",
    color: "var(--on-accent)",
    border: "none",
    borderRadius: 8,
    padding: "10px",
    fontWeight: 700,
    fontSize: 13,
    cursor: "pointer",
  },
  actionButtonOutline: {
    flex: 1,
    background: "transparent",
    color: "var(--text)",
    border: "1px solid var(--border-strong)",
    borderRadius: 8,
    padding: "10px",
    fontWeight: 700,
    fontSize: 13,
    cursor: "pointer",
  },
  swapSection: { marginTop: 12 },
  option: {
    padding: "12px",
    borderRadius: 8,
    background: "var(--input-bg)",
    border: "1px solid var(--border-strong)",
    marginBottom: 8,
    cursor: "pointer",
    fontSize: 14,
  },
  altMeta: { fontSize: 11, color: "var(--text-muted)", marginTop: 2 },
  closeButton: {
    width: "100%",
    background: "transparent",
    border: "1px solid var(--border-strong)",
    color: "var(--text-muted)",
    borderRadius: 8,
    padding: "10px",
    fontSize: 13,
    cursor: "pointer",
    marginTop: 8,
  },
  empty: { color: "var(--text-muted)", fontSize: 13 },
  error: { color: "var(--danger)", fontSize: 12, marginBottom: 8 },
};

// exercise: { name, muscle, sets, reps, rir }
// planContext (optional): { meso, weekIndex, dayIndex, exerciseIndex } — when
//   present, enables the "Swap exercise" action, which persists the change
//   back to that mesocycle's plan. Without it (e.g. browsing from a plain
//   library context) the sheet is informational only.
export default function ExerciseDetailSheet({ exercise, planContext, onClose, onLogThis, onSwapped }) {
  const [showSwap, setShowSwap] = useState(false);
  const [loadingAlts, setLoadingAlts] = useState(false);
  const [alternatives, setAlternatives] = useState([]);
  const [swapping, setSwapping] = useState(false);
  const [error, setError] = useState("");

  if (!exercise) return null;

  const muscleFunction = exercise.muscle ? getMuscleFunction(exercise.muscle) : null;
  const realLife = getRealLifeTranslation(exercise.name);

  const handleShowSwap = async () => {
    setShowSwap(true);
    setLoadingAlts(true);
    setError("");
    try {
      const all = await listExercisesForMuscle(exercise.muscle);
      setAlternatives(all.filter((alt) => alt.name !== exercise.name));
    } finally {
      setLoadingAlts(false);
    }
  };

  const handlePickAlternative = async (newName) => {
    if (!planContext || swapping) return;
    setSwapping(true);
    setError("");
    try {
      const { meso, weekIndex, dayIndex, exerciseIndex } = planContext;
      const updatedPlan = planWithExerciseSwapped(meso.plan, { weekIndex, dayIndex, exerciseIndex, newName });
      await storage.updateMesocyclePlan(meso.id, updatedPlan);
      onSwapped?.(newName);
      onClose();
    } catch (err) {
      setError(err.message || "Couldn't save that swap — try again.");
      setSwapping(false);
    }
  };

  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.sheet} onClick={(e) => e.stopPropagation()}>
        <div style={s.title}>{exercise.name}</div>
        {exercise.muscle && (
          <div style={s.meta}>
            {formatMuscleLabel(exercise.muscle)}
            {exercise.sets ? ` · ${exercise.sets} × ${exercise.reps} @ RIR ${exercise.rir}` : ""}
          </div>
        )}

        {muscleFunction && (
          <div style={s.box}>
            <div style={s.boxLabelBlue}>What this muscle does</div>
            <p style={s.boxText}>{muscleFunction.function}</p>
          </div>
        )}

        <div style={s.box}>
          <div style={s.boxLabelGreen}>In real life</div>
          <p style={s.boxText}>{realLife}</p>
        </div>

        <div style={s.actionRow}>
          {onLogThis && (
            <button style={s.actionButton} onClick={() => { onLogThis(exercise.name); onClose(); }}>
              Log this
            </button>
          )}
          {planContext && !showSwap && (
            <button style={s.actionButtonOutline} onClick={handleShowSwap}>
              Swap exercise
            </button>
          )}
        </div>

        {showSwap && (
          <div style={s.swapSection}>
            {error && <p style={s.error}>{error}</p>}
            {loadingAlts && <p style={s.empty}>Finding alternatives for this muscle group...</p>}
            {!loadingAlts && alternatives.length === 0 && (
              <p style={s.empty}>No other exercises found for this muscle group.</p>
            )}
            {!loadingAlts &&
              alternatives.map((alt) => (
                <div key={alt.name} style={s.option} onClick={() => handlePickAlternative(alt.name)}>
                  {alt.name}
                  <div style={s.altMeta}>{alt.equipment} · {alt.compound ? "compound" : "isolation"}</div>
                </div>
              ))}
          </div>
        )}

        <button style={s.closeButton} onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
