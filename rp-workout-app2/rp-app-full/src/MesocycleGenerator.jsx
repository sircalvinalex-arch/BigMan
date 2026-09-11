import { useState } from "react";
import { generateMesocycle, SPLIT_TEMPLATES } from "./generator.js";
import { EQUIPMENT_OPTIONS } from "./exerciseLibrary.js";
import { storage } from "./storage.js";
import { getWeekInsight } from "./weekInsights.js";

const s = {
  card: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
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
  label: { fontSize: 12, color: "var(--text-muted)", marginBottom: 4 },
  segmented: { display: "flex", gap: 6, marginBottom: 8 },
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
  chip: (active) => ({
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: 12,
    border: "1px solid " + (active ? "var(--accent-blue)" : "var(--border-strong)"),
    background: active ? "var(--accent-blue)" : "transparent",
    color: active ? "var(--bg)" : "var(--text-muted)",
    cursor: "pointer",
  }),
  chipRow: { display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 },
  button: {
    width: "100%",
    background: "var(--accent-blue)",
    color: "var(--on-accent)",
    border: "none",
    borderRadius: 8,
    padding: "12px",
    fontWeight: 700,
    fontSize: 14,
    cursor: "pointer",
  },
  disclosure: {
    fontSize: 11,
    color: "var(--text-faint)",
    lineHeight: 1.5,
    marginBottom: 12,
  },
  weekBlock: { marginBottom: 16 },
  weekTitle: { fontWeight: 700, fontSize: 14, marginBottom: 6 },
  dayBlock: { marginBottom: 8, paddingLeft: 8, borderLeft: "2px solid var(--border-strong)" },
  dayTitle: { fontSize: 13, color: "var(--text)", marginBottom: 4, fontWeight: 700 },
  exerciseLine: { fontSize: 12, color: "var(--text-muted)", marginBottom: 2 },
};

export default function MesocycleGenerator({ onSaved }) {
  const [name, setName] = useState("");
  const [weeks, setWeeks] = useState(5);
  const [daysPerWeek, setDaysPerWeek] = useState(4);
  const [track, setTrack] = useState(null); // asked fresh each time — no default
  const [equipment, setEquipment] = useState([]);
  const [perDayEquipment, setPerDayEquipment] = useState(false);
  const [equipmentByDay, setEquipmentByDay] = useState({}); // { [dayIndex]: string[] }
  const [plan, setPlan] = useState(null);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState("");

  const toggleEquipment = (item) => {
    setEquipment((prev) => (prev.includes(item) ? prev.filter((e) => e !== item) : [...prev, item]));
  };

  const toggleDayEquipment = (dayIndex, item) => {
    setEquipmentByDay((prev) => {
      const current = prev[dayIndex] ?? [];
      const next = current.includes(item) ? current.filter((e) => e !== item) : [...current, item];
      return { ...prev, [dayIndex]: next };
    });
  };

  const handleGenerate = async () => {
    if (!track) return;
    setGenerating(true);
    setGenerateError("");
    try {
      const generated = await generateMesocycle({
        name: name.trim() || "Untitled Mesocycle",
        weeks: Number(weeks),
        daysPerWeek: Number(daysPerWeek),
        track,
        equipment: perDayEquipment ? [] : equipment,
        equipmentByDay: perDayEquipment
          ? Array.from({ length: Number(daysPerWeek) }, (_, i) => equipmentByDay[i] ?? [])
          : null,
      });
      setPlan(generated);
    } catch (err) {
      setGenerateError(err.message || "Couldn't generate a plan — check your connection and try again.");
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!plan) return;
    setSaving(true);
    try {
      await storage.createMesocycle({
        name: plan.name,
        weeks: plan.weeks,
        focus: [`track:${plan.track}`, `days:${plan.daysPerWeek}`],
        plan, // full week-by-week plan, needed for auto-regulation later
      });
      onSaved?.();
      setPlan(null);
      setName("");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div style={s.card}>
        <div style={s.label}>Mesocycle name</div>
        <input
          style={s.input}
          placeholder="e.g. Hypertrophy Block 1"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <div style={s.row}>
          <div style={{ flex: 1 }}>
            <div style={s.label}>Weeks</div>
            <input
              style={s.input}
              type="number"
              min="3"
              max="8"
              value={weeks}
              onChange={(e) => setWeeks(e.target.value)}
            />
          </div>
          <div style={{ flex: 1 }}>
            <div style={s.label}>Days per week</div>
            <input
              style={s.input}
              type="number"
              min="2"
              max="5"
              value={daysPerWeek}
              onChange={(e) => setDaysPerWeek(e.target.value)}
            />
          </div>
        </div>

        <div style={s.label}>Track for this mesocycle</div>
        <div style={s.segmented}>
          <div style={s.segment(track === "female")} onClick={() => setTrack("female")}>Female</div>
          <div style={s.segment(track === "male")} onClick={() => setTrack("male")}>Male</div>
          <div style={s.segment(track === "neutral")} onClick={() => setTrack("neutral")}>Neutral</div>
        </div>
        <p style={s.disclosure}>
          These tracks adjust default volume and exercise emphasis based on common
          programming patterns in the research (RP's volume landmarks, NROLW's posterior-chain
          emphasis) — they're starting points to auto-regulate from, not a claim about what
          your body specifically needs. Pick whichever fits your goals for this block, and
          adjust as you go based on how it actually feels.
        </p>

        <div style={s.label}>Available equipment (optional — leave blank for all)</div>
        <div style={{ ...s.segmented, marginBottom: 8 }}>
          <div style={s.segment(!perDayEquipment)} onClick={() => setPerDayEquipment(false)}>
            Same every day
          </div>
          <div style={s.segment(perDayEquipment)} onClick={() => setPerDayEquipment(true)}>
            Different per day
          </div>
        </div>

        {!perDayEquipment && (
          <div style={s.chipRow}>
            {EQUIPMENT_OPTIONS.map((item) => (
              <button key={item} style={s.chip(equipment.includes(item))} onClick={() => toggleEquipment(item)}>
                {item}
              </button>
            ))}
          </div>
        )}

        {perDayEquipment && (
          <div>
            {Array.from({ length: Number(daysPerWeek) || 0 }).map((_, dayIndex) => (
              <div key={dayIndex} style={{ marginBottom: 10 }}>
                <div style={s.label}>Day {dayIndex + 1} equipment</div>
                <div style={s.chipRow}>
                  {EQUIPMENT_OPTIONS.map((item) => (
                    <button
                      key={item}
                      style={s.chip((equipmentByDay[dayIndex] ?? []).includes(item))}
                      onClick={() => toggleDayEquipment(dayIndex, item)}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <button style={s.button} onClick={handleGenerate} disabled={!track || generating}>
          {generating ? "Generating..." : track ? "Generate mesocycle" : "Pick a track first"}
        </button>
        {generateError && (
          <p style={{ color: "var(--danger)", fontSize: 12, marginTop: 8 }}>{generateError}</p>
        )}
      </div>

      {plan && (
        <div style={s.card}>
          <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 4 }}>{plan.name}</div>
          <p style={{ ...s.disclosure, marginBottom: 12 }}>
            {plan.weeks} weeks · {plan.daysPerWeek} days/week · {plan.track} track — sets ramp from
            MEV toward MRV each week, then deload in the final week.
          </p>

          {plan.weekPlans.map((week) => {
            const insight = getWeekInsight(week, plan.weeks, plan.track);
            return (
            <div key={week.weekIndex} style={s.weekBlock}>
              <div style={s.weekTitle}>
                Week {week.weekIndex} {week.isDeload ? "(deload)" : ""} — {insight.phase}
              </div>
              <div style={{ background: "var(--bg)", borderRadius: 8, padding: 10, marginBottom: 10 }}>
                <div style={{ fontSize: 12, color: "var(--accent-gold)", fontWeight: 700, marginBottom: 4 }}>{insight.summary}</div>
                <p style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.5 }}>{insight.detail}</p>
              </div>
              {week.days.map((day) => (
                <div key={day.dayIndex} style={s.dayBlock}>
                  <div style={s.dayTitle}>Day {day.dayIndex}</div>
                  {day.exercises.map((ex, i) => (
                    <div key={i} style={s.exerciseLine}>
                      {ex.name} — {ex.sets} × {ex.reps} @ RIR {ex.rir}
                    </div>
                  ))}
                </div>
              ))}
            </div>
            );
          })}

          <button style={s.button} onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save as a mesocycle"}
          </button>
        </div>
      )}
    </div>
  );
}
