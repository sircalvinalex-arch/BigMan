import { useMemo, useState } from "react";
import { calculatePlates } from "./PlateCalculator.jsx";

const s = {
  card: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 12,
    padding: 16,
  },
  input: {
    width: "100%",
    background: "var(--input-bg)",
    border: "1px solid var(--border-strong)",
    borderRadius: 8,
    color: "var(--text)",
    padding: "10px 12px",
    fontSize: 14,
    fontFamily: "inherit",
    marginBottom: 8,
  },
  row: { display: "flex", gap: 8, marginBottom: 8 },
  segment: (active) => ({
    flex: 1,
    padding: "10px",
    borderRadius: 8,
    fontSize: 13,
    textAlign: "center",
    border: "1px solid " + (active ? "var(--accent-blue)" : "var(--border-strong)"),
    background: active ? "var(--accent-blue)" : "transparent",
    color: active ? "var(--bg)" : "var(--text-muted)",
    cursor: "pointer",
  }),
  label: { fontSize: 12, color: "var(--text-muted)", marginBottom: 4 },
  ramp: { marginTop: 12, display: "flex", flexDirection: "column", gap: 6 },
  step: (isWorkingSet) => ({
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 12px",
    borderRadius: 8,
    background: isWorkingSet ? "var(--accent-green-bg)" : "var(--bg)",
    border: "1px solid " + (isWorkingSet ? "var(--accent-green-border)" : "var(--border)"),
  }),
  stepLeft: { display: "flex", flexDirection: "column" },
  stepWeight: { fontSize: 15, fontWeight: 700 },
  stepMeta: { fontSize: 12, color: "var(--text-muted)", marginTop: 2 },
  plateRow: { display: "flex", gap: 4, flexWrap: "wrap", justifyContent: "flex-end", maxWidth: "55%" },
  plate: (color) => ({
    padding: "3px 6px",
    borderRadius: 5,
    fontSize: 11,
    fontWeight: 700,
    background: color,
    color: "var(--on-accent)",
  }),
  note: { fontSize: 12, color: "var(--text-faint)", marginTop: 10, lineHeight: 1.5 },
};

// Ramp scheme depends on the working set's rep target, not just its
// weight: a heavy low-rep top set needs a longer, more gradual ramp
// (nervous system + tendons need the warning) than a lighter
// higher-rep hypertrophy set, which can jump to working weight faster
// without needing a near-max-effort warm-up rep along the way.
function schemeForReps(reps) {
  if (reps <= 5) {
    return [
      { pct: 0.4, reps: 8 },
      { pct: 0.6, reps: 5 },
      { pct: 0.75, reps: 3 },
      { pct: 0.85, reps: 2 },
      { pct: 0.92, reps: 1 },
    ];
  }
  if (reps <= 10) {
    return [
      { pct: 0.5, reps: 8 },
      { pct: 0.7, reps: 5 },
      { pct: 0.85, reps: 3 },
    ];
  }
  return [
    { pct: 0.6, reps: 8 },
    { pct: 0.8, reps: 4 },
  ];
}

function buildWarmupSets(workingWeight, workingReps, barWeight, unit) {
  const increment = unit === "lb" ? 5 : 2.5; // smallest total (both-sides) jump with standard plates
  const roundToIncrement = (w) => Math.round(w / increment) * increment;

  const sets = [];

  // Only worth an empty-bar set if the working weight is meaningfully
  // above the bar — otherwise "warm up with the bar" is the same as
  // the working set and just wastes time.
  if (workingWeight > barWeight * 1.3) {
    sets.push({ weight: barWeight, reps: 10, label: "Empty bar" });
  }

  for (const step of schemeForReps(workingReps)) {
    const raw = workingWeight * step.pct;
    const weight = Math.max(barWeight, roundToIncrement(raw));
    // Skip a step that rounds down to essentially the bar (already
    // covered above) or collapses onto the previous step's weight.
    if (weight <= barWeight * 1.05) continue;
    if (sets.length && sets[sets.length - 1].weight === weight) continue;
    if (weight >= workingWeight) continue;
    sets.push({ weight, reps: step.reps });
  }

  sets.push({ weight: workingWeight, reps: workingReps, isWorkingSet: true });
  return sets;
}

export default function WarmupCalculator() {
  const [workingWeight, setWorkingWeight] = useState("");
  const [workingReps, setWorkingReps] = useState("8");
  const [unit, setUnit] = useState("lb");
  const [barWeight, setBarWeight] = useState(45);

  const handleUnitChange = (newUnit) => {
    setUnit(newUnit);
    setBarWeight(newUnit === "lb" ? 45 : 20);
  };

  const sets = useMemo(() => {
    const weight = Number(workingWeight);
    const reps = Number(workingReps);
    if (!weight || weight <= 0 || !reps || reps <= 0) return null;
    return buildWarmupSets(weight, reps, Number(barWeight), unit);
  }, [workingWeight, workingReps, barWeight, unit]);

  return (
    <div style={s.card}>
      <div style={s.row}>
        <div style={s.segment(unit === "lb")} onClick={() => handleUnitChange("lb")}>lb</div>
        <div style={s.segment(unit === "kg")} onClick={() => handleUnitChange("kg")}>kg</div>
      </div>

      <div style={s.label}>Working weight (your top set)</div>
      <input
        style={s.input}
        type="number"
        placeholder={`Working weight (${unit})`}
        value={workingWeight}
        onChange={(e) => setWorkingWeight(e.target.value)}
      />

      <div style={s.label}>Reps at that weight</div>
      <input
        style={s.input}
        type="number"
        placeholder="Reps"
        value={workingReps}
        onChange={(e) => setWorkingReps(e.target.value)}
      />

      <div style={s.label}>Bar weight</div>
      <input
        style={s.input}
        type="number"
        placeholder="Bar weight"
        value={barWeight}
        onChange={(e) => setBarWeight(e.target.value)}
      />

      {sets && (
        <div style={s.ramp}>
          {sets.map((set, i) => {
            const plates = calculatePlates(set.weight, Number(barWeight), unit);
            return (
              <div key={i} style={s.step(set.isWorkingSet)}>
                <div style={s.stepLeft}>
                  <div style={s.stepWeight}>
                    {set.weight} {unit} × {set.reps}
                  </div>
                  <div style={s.stepMeta}>
                    {set.isWorkingSet ? "Working set" : set.label ?? `${Math.round((set.weight / Number(workingWeight)) * 100)}%`}
                  </div>
                </div>
                <div style={s.plateRow}>
                  {plates.plates.length === 0 ? (
                    <span style={{ color: "var(--text-faint)", fontSize: 11 }}>bar only</span>
                  ) : (
                    plates.plates.map((p) => (
                      <div key={p.weight} style={s.plate(p.color)}>
                        {p.weight}×{p.count}
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}

          <div style={s.note}>
            Ramp is based on your working reps, not just the weight — lower-rep,
            heavier top sets get a longer ramp with a near-effort single along
            the way; higher-rep sets skip straight there since the load itself
            is lighter. Treat this as a starting template, not a rule — cut a
            step if you're already warm, add one if a joint needs more notice.
          </div>
        </div>
      )}
    </div>
  );
}
