import { useEffect, useState } from "react";
import { exerciseLibrary, EQUIPMENT_OPTIONS } from "./exerciseLibrary.js";
import { findMuscleForExercise } from "./exercisePool.js";
import { getMuscleFunction, getRealLifeTranslation } from "./exerciseInsights.js";

const s = {
  wrap: { marginTop: 8 },
  input: {
    width: "100%",
    background: "#111",
    border: "1px solid #2a2a2a",
    borderRadius: 8,
    color: "#f2f2f2",
    padding: "10px 12px",
    fontSize: 14,
    fontFamily: "inherit",
    marginBottom: 8,
  },
  bodyPartRow: {
    display: "flex",
    gap: 6,
    overflowX: "auto",
    paddingBottom: 8,
    marginBottom: 8,
  },
  chip: (active) => ({
    flexShrink: 0,
    padding: "6px 12px",
    borderRadius: 999,
    fontSize: 12,
    border: "1px solid " + (active ? "#e8e8e8" : "#2a2a2a"),
    background: active ? "#e8e8e8" : "transparent",
    color: active ? "#0a0a0a" : "#aaa",
    cursor: "pointer",
    whiteSpace: "nowrap",
  }),
  card: {
    background: "#161616",
    border: "1px solid #262626",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    cursor: "pointer",
  },
  cardTitle: { fontWeight: 700, fontSize: 14, marginBottom: 4 },
  cardMeta: { fontSize: 12, color: "#888" },
  empty: { color: "#666", fontSize: 13, fontStyle: "italic" },
  detailOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.85)",
    zIndex: 50,
    overflowY: "auto",
    padding: "24px 16px 60px",
  },
  detailCard: {
    maxWidth: 480,
    margin: "0 auto",
    background: "#161616",
    border: "1px solid #262626",
    borderRadius: 12,
    padding: 20,
  },
  closeButton: {
    background: "none",
    border: "1px solid #2a2a2a",
    color: "#ccc",
    borderRadius: 8,
    padding: "6px 12px",
    fontSize: 13,
    cursor: "pointer",
    marginBottom: 16,
  },
  imageRow: {
    display: "flex",
    gap: 8,
    marginBottom: 12,
    overflowX: "auto",
  },
  image: {
    width: 140,
    height: 140,
    objectFit: "cover",
    borderRadius: 8,
    background: "#0a0a0a",
    flexShrink: 0,
  },
  step: { fontSize: 13, color: "#ccc", marginBottom: 8, lineHeight: 1.5 },
  addButton: {
    width: "100%",
    background: "#e8e8e8",
    color: "#0a0a0a",
    border: "none",
    borderRadius: 8,
    padding: "12px",
    fontWeight: 700,
    fontSize: 14,
    cursor: "pointer",
    marginTop: 12,
  },
  equipmentToggleRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  equipmentLink: {
    background: "none",
    border: "none",
    color: "#8a8a8a",
    fontSize: 12,
    cursor: "pointer",
    textDecoration: "underline",
  },
  equipmentPanel: {
    display: "flex",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 12,
  },
};

const EQUIPMENT_STORAGE_KEY = "rp-workout-app:available-equipment";

function loadSavedEquipment() {
  try {
    const raw = localStorage.getItem(EQUIPMENT_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// This dataset categorizes by primaryMuscles, not body region, so these
// chips map to the muscle-group terms actually used in the data.
const MUSCLE_GROUPS = ["chest", "lats", "shoulders", "quadriceps", "biceps", "abdominals"];

export default function ExerciseLibrary({ onSelectExercise }) {
  const [query, setQuery] = useState("");
  const [activeGroup, setActiveGroup] = useState(MUSCLE_GROUPS[0]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [muscleFunction, setMuscleFunction] = useState(null);
  const [selectedEquipment, setSelectedEquipment] = useState(loadSavedEquipment);
  const [showEquipmentPanel, setShowEquipmentPanel] = useState(false);

  useEffect(() => {
    localStorage.setItem(EQUIPMENT_STORAGE_KEY, JSON.stringify(selectedEquipment));
  }, [selectedEquipment]);

  const toggleEquipment = (item) => {
    setSelectedEquipment((prev) =>
      prev.includes(item) ? prev.filter((e) => e !== item) : [...prev, item]
    );
  };

  const runSearch = async () => {
    setLoading(true);
    setError("");
    try {
      const data = query.trim()
        ? await exerciseLibrary.searchExercises(query.trim(), { equipment: selectedEquipment })
        : await exerciseLibrary.getExercisesByBodyPart(activeGroup, { equipment: selectedEquipment });
      setResults(data);
    } catch (err) {
      setError("Couldn't load the exercise library right now. Try again in a moment.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeGroup, selectedEquipment]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    runSearch();
  };

  const openDetail = async (exercise) => {
    const full = await exerciseLibrary.getExerciseById(exercise.id);
    setSelected(full ?? exercise);
    const muscleKey = await findMuscleForExercise((full ?? exercise).name);
    setMuscleFunction(muscleKey ? getMuscleFunction(muscleKey) : null);
  };

  return (
    <div style={s.wrap}>
      <form onSubmit={handleSearchSubmit}>
        <input
          style={s.input}
          placeholder="Search exercises (e.g. bench press)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </form>

      <div style={s.equipmentToggleRow}>
        <button
          style={s.equipmentLink}
          onClick={() => setShowEquipmentPanel((v) => !v)}
        >
          {selectedEquipment.length === 0
            ? "Filter by available equipment"
            : `Equipment: ${selectedEquipment.length} selected`}
        </button>
        {selectedEquipment.length > 0 && (
          <button style={s.equipmentLink} onClick={() => setSelectedEquipment([])}>
            Clear
          </button>
        )}
      </div>

      {showEquipmentPanel && (
        <div style={s.equipmentPanel}>
          {EQUIPMENT_OPTIONS.map((item) => (
            <button
              key={item}
              style={s.chip(selectedEquipment.includes(item))}
              onClick={() => toggleEquipment(item)}
            >
              {item}
            </button>
          ))}
        </div>
      )}

      {!query.trim() && (
        <div style={s.bodyPartRow}>
          {MUSCLE_GROUPS.map((group) => (
            <button
              key={group}
              style={s.chip(group === activeGroup)}
              onClick={() => setActiveGroup(group)}
            >
              {group}
            </button>
          ))}
        </div>
      )}

      {loading && <p style={s.empty}>Loading exercises...</p>}
      {error && <p style={{ color: "#e07a7a", fontSize: 13 }}>{error}</p>}
      {!loading && !error && results.length === 0 && (
        <p style={s.empty}>No exercises found.</p>
      )}

      {results.map((ex) => (
        <div key={ex.id} style={s.card} onClick={() => openDetail(ex)}>
          <div style={s.cardTitle}>{ex.name}</div>
          <div style={s.cardMeta}>
            {(ex.primaryMuscles ?? []).join(", ")} {ex.equipment ? `· ${ex.equipment}` : ""}
          </div>
          {ex.mechanic === "compound" && ex.secondaryMuscles?.length > 0 && (
            <div style={{ ...s.cardMeta, fontSize: 11, color: "#666", marginTop: 2 }}>
              Also works: {ex.secondaryMuscles.join(", ")}
            </div>
          )}
        </div>
      ))}

      {selected && (
        <div style={s.detailOverlay} onClick={() => setSelected(null)}>
          <div style={s.detailCard} onClick={(e) => e.stopPropagation()}>
            <button style={s.closeButton} onClick={() => setSelected(null)}>← Back</button>
            <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 8 }}>{selected.name}</div>

            {selected.imageUrls?.length > 0 && (
              <div style={s.imageRow}>
                {selected.imageUrls.map((url, i) => (
                  <img key={i} style={s.image} src={url} alt={`${selected.name} step ${i + 1}`} />
                ))}
              </div>
            )}

            {selected.primaryMuscles && (
              <p style={s.cardMeta}>Primary: {selected.primaryMuscles.join(", ")}</p>
            )}
            {selected.secondaryMuscles?.length > 0 && (
              <p style={s.cardMeta}>Also works: {selected.secondaryMuscles.join(", ")}</p>
            )}
            {selected.equipment && (
              <p style={{ ...s.cardMeta, marginBottom: 12 }}>Equipment: {selected.equipment}</p>
            )}

            {muscleFunction && (
              <div style={{ background: "#0a0a0a", borderRadius: 8, padding: 10, marginBottom: 10 }}>
                <div style={{ fontSize: 11, color: "#8ab4e8", fontWeight: 700, marginBottom: 4 }}>What this muscle does</div>
                <p style={{ fontSize: 12, color: "#ccc", lineHeight: 1.5 }}>{muscleFunction.function}</p>
              </div>
            )}

            <div style={{ background: "#0a0a0a", borderRadius: 8, padding: 10, marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: "#7ad67a", fontWeight: 700, marginBottom: 4 }}>In real life</div>
              <p style={{ fontSize: 12, color: "#ccc", lineHeight: 1.5 }}>{getRealLifeTranslation(selected.name)}</p>
            </div>

            {(selected.instructions ?? []).map((step, i) => (
              <p key={i} style={s.step}>
                <strong>{i + 1}.</strong> {step}
              </p>
            ))}

            {onSelectExercise && (
              <button
                style={s.addButton}
                onClick={() => {
                  onSelectExercise(selected.name);
                  setSelected(null);
                }}
              >
                Use this exercise in my workout
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
