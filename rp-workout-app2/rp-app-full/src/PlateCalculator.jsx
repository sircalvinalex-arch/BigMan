import { useMemo, useState } from "react";

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
  result: {
    marginTop: 12,
    padding: 12,
    background: "var(--bg)",
    borderRadius: 8,
    fontSize: 14,
    textAlign: "center",
  },
  plateRow: { display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap", marginTop: 8 },
  plate: (color) => ({
    padding: "8px 10px",
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 700,
    background: color,
    color: "var(--on-accent)",
  }),
  warning: { color: "var(--accent-gold)", fontSize: 12, marginTop: 8, textAlign: "center" },
};

// Standard Olympic plate set (lb and kg), heaviest first, with a rough
// color mapping for quick visual identification.
// Exported so other components (e.g. WarmupCalculator) can show a plate
// breakdown for a weight without duplicating this table.
export const PLATE_SETS = {
  lb: [
    { weight: 45, color: "#5b8def" },
    { weight: 35, color: "#e05b5b" },
    { weight: 25, color: "#e0c85b" },
    { weight: 10, color: "#7ad67a" },
    { weight: 5, color: "#d3d3d3" },
    { weight: 2.5, color: "#c98bd6" },
  ],
  kg: [
    { weight: 25, color: "#5b8def" },
    { weight: 20, color: "#e05b5b" },
    { weight: 15, color: "#e0c85b" },
    { weight: 10, color: "#7ad67a" },
    { weight: 5, color: "#d3d3d3" },
    { weight: 2.5, color: "#c98bd6" },
    { weight: 1.25, color: "#c98bd6" },
  ],
};

export function calculatePlates(targetWeight, barWeight, unit) {
  const perSide = (targetWeight - barWeight) / 2;
  if (perSide <= 0) return { plates: [], remainder: 0, perSide: 0 };

  const plates = [];
  let remaining = perSide;
  for (const plate of PLATE_SETS[unit]) {
    const count = Math.floor(remaining / plate.weight);
    if (count > 0) {
      plates.push({ ...plate, count });
      remaining -= count * plate.weight;
    }
  }
  return { plates, remainder: Math.round(remaining * 100) / 100, perSide };
}

export default function PlateCalculator() {
  const [targetWeight, setTargetWeight] = useState("");
  const [unit, setUnit] = useState("lb");
  const [barWeight, setBarWeight] = useState(unit === "lb" ? 45 : 20);

  const handleUnitChange = (newUnit) => {
    setUnit(newUnit);
    setBarWeight(newUnit === "lb" ? 45 : 20);
  };

  const result = useMemo(() => {
    const target = Number(targetWeight);
    if (!target || target <= 0) return null;
    return calculatePlates(target, Number(barWeight), unit);
  }, [targetWeight, barWeight, unit]);

  return (
    <div style={s.card}>
      <div style={s.row}>
        <div style={s.segment(unit === "lb")} onClick={() => handleUnitChange("lb")}>lb</div>
        <div style={s.segment(unit === "kg")} onClick={() => handleUnitChange("kg")}>kg</div>
      </div>

      <input
        style={s.input}
        type="number"
        placeholder={`Target weight (${unit})`}
        value={targetWeight}
        onChange={(e) => setTargetWeight(e.target.value)}
      />
      <input
        style={s.input}
        type="number"
        placeholder="Bar weight"
        value={barWeight}
        onChange={(e) => setBarWeight(e.target.value)}
      />

      {result && (
        <div style={s.result}>
          <div>{result.perSide} {unit} per side</div>
          <div style={s.plateRow}>
            {result.plates.length === 0 && <span style={{ color: "var(--text-muted)" }}>Just the bar</span>}
            {result.plates.map((p) => (
              <div key={p.weight} style={s.plate(p.color)}>
                {p.weight} × {p.count}
              </div>
            ))}
          </div>
          {result.remainder > 0.01 && (
            <div style={s.warning}>
              Can't hit this exactly with standard plates — {result.remainder} {unit} short per side
            </div>
          )}
        </div>
      )}
    </div>
  );
}
