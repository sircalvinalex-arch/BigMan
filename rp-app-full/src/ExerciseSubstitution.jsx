import { useState } from "react";
import { findMuscleForExercise, listExercisesForMuscle } from "./exercisePool.js";

const s = {
  trigger: {
    background: "none",
    border: "1px solid var(--border-strong)",
    color: "var(--text-faint)",
    borderRadius: 6,
    padding: "4px 10px",
    fontSize: 11,
    cursor: "pointer",
  },
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
    maxHeight: "70vh",
    overflowY: "auto",
  },
  title: { fontWeight: 700, fontSize: 15, marginBottom: 12 },
  option: {
    padding: "12px",
    borderRadius: 8,
    background: "var(--input-bg)",
    border: "1px solid var(--border-strong)",
    marginBottom: 8,
    cursor: "pointer",
    fontSize: 14,
  },
  meta: { fontSize: 11, color: "var(--text-muted)", marginTop: 2 },
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
};

export default function ExerciseSubstitution({ currentExercise, onSubstitute }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alternatives, setAlternatives] = useState([]);
  const [notFound, setNotFound] = useState(false);

  const handleOpen = async () => {
    setOpen(true);
    setLoading(true);
    setNotFound(false);
    try {
      const muscle = await findMuscleForExercise(currentExercise);
      if (!muscle) {
        setNotFound(true);
        setAlternatives([]);
        return;
      }
      const all = await listExercisesForMuscle(muscle);
      setAlternatives(all.filter((ex) => ex.name !== currentExercise));
    } finally {
      setLoading(false);
    }
  };

  if (!currentExercise) return null;

  return (
    <>
      <button style={s.trigger} onClick={handleOpen} type="button">
        Swap exercise
      </button>

      {open && (
        <div style={s.overlay} onClick={() => setOpen(false)}>
          <div style={s.sheet} onClick={(e) => e.stopPropagation()}>
            <div style={s.title}>Swap "{currentExercise}"</div>

            {loading && <p style={s.empty}>Finding alternatives...</p>}

            {!loading && notFound && (
              <p style={s.empty}>
                Couldn't identify this exercise's muscle group — it may be misspelled,
                or not in the dataset. Try the Exercise Library to search manually.
              </p>
            )}

            {!loading && !notFound && alternatives.length === 0 && (
              <p style={s.empty}>No other exercises found for this muscle group.</p>
            )}

            {alternatives.map((alt) => (
              <div
                key={alt.name}
                style={s.option}
                onClick={() => {
                  onSubstitute(alt.name);
                  setOpen(false);
                }}
              >
                {alt.name}
                <div style={s.meta}>{alt.equipment} · {alt.compound ? "compound" : "isolation"}</div>
              </div>
            ))}
            <button style={s.closeButton} onClick={() => setOpen(false)}>Cancel</button>
          </div>
        </div>
      )}
    </>
  );
}
