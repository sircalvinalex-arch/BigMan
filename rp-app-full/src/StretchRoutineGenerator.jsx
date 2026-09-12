import { useState } from "react";
import { exerciseLibrary } from "./exerciseLibrary.js";

// Head-to-toe order, using the raw muscle-name strings this dataset uses
// (these are free-exercise-db's own primaryMuscles values, not the app's
// internal 12-muscle taxonomy — kept separate since stretch routines
// don't need to match the strength-training muscle split, just anatomy).
const HEAD_TO_TOE = [
  "neck",
  "shoulders",
  "chest",
  "lats",
  "middle back",
  "biceps",
  "triceps",
  "forearms",
  "abdominals",
  "lower back",
  "glutes",
  "abductors",
  "adductors",
  "quadriceps",
  "hamstrings",
  "calves",
];

// The dataset has no dynamic/static field, so this is a name-based
// heuristic — same approach as the bench-detection heuristic in
// exerciseLibrary.js. Checked against the real "stretching" category:
// flags things like "Arm Circles" and "Windmills" correctly, but only
// covers about 20 of the ~120 stretches, and 5 of the 16 regions below
// have no dynamic-tagged entry at all. So pre-workout mode PREFERS a
// dynamic pick when one exists for that region, and falls back to a
// static one (with a shorter hold, not a long one) rather than leaving
// that region out of the routine entirely.
const DYNAMIC_NAME_PATTERN =
  /\b(circle|circles|swing|swings|rotation|rotations|windmill|windmills|inchworm|groiner|groiners|hop|hops|lunge|lunges|kick|kicks|march|marches|dynamic|toe touch|toe touches|leg raise|leg raises|scissor)\b/i;

const MODE_CONFIG = {
  post: {
    title: "Post-workout: static stretches",
    generateLabel: "Generate head-to-toe routine",
    holdSeconds: 30,
    holdLabel: (name) => `Hold ${holdWithSide(30, name)}`,
    blurb:
      "Builds a full-body stretch routine, one static hold per region from neck down to calves — a good cooldown right after training.",
  },
  pre: {
    title: "Pre-workout: dynamic warm-up",
    generateLabel: "Generate warm-up routine",
    holdSeconds: 15,
    holdLabel: (name) => `${holdWithSide(15, name)} — keep it brief, don't hold long`,
    blurb:
      "Builds a movement-based warm-up, preferring dynamic drills (circles, swings, lunges) over long static holds — holding a stretch for 30s+ right before lifting can temporarily reduce power output, so this keeps things short and moving where it can.",
  },
};

function holdWithSide(seconds, name) {
  const perSide = /single|one|side/i.test(name);
  return `${seconds}s${perSide ? " per side" : ""}`;
}

function regionLabel(region) {
  return region.charAt(0).toUpperCase() + region.slice(1);
}

async function pickStretchFor(region, mode, exclude) {
  const candidates = await exerciseLibrary.getExercisesByBodyPart(region, { category: "stretching" });
  const pool = exclude ? candidates.filter((ex) => ex.name !== exclude) : candidates;
  if (pool.length === 0) return null;

  let usable = pool;
  if (mode === "pre") {
    const dynamic = pool.filter((ex) => DYNAMIC_NAME_PATTERN.test(ex.name));
    if (dynamic.length > 0) usable = dynamic; // prefer dynamic when this region actually has one
  }

  const pick = usable[Math.floor(Math.random() * usable.length)];
  return {
    region,
    name: pick.name,
    imageUrls: pick.imageUrls,
    isDynamic: DYNAMIC_NAME_PATTERN.test(pick.name),
  };
}

const s = {
  card: { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 16, marginBottom: 12 },
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
    marginBottom: 12,
  },
  meta: { fontSize: 12, color: "var(--text-muted)", marginBottom: 12 },
  row: { display: "flex", gap: 10, padding: "10px 0", borderBottom: "1px solid var(--border)" },
  thumb: { width: 56, height: 56, objectFit: "cover", borderRadius: 8, flexShrink: 0 },
  thumbEmpty: { width: 56, height: 56, borderRadius: 8, flexShrink: 0, background: "var(--input-bg)" },
  rowMain: { flex: 1 },
  region: { fontSize: 11, color: "var(--accent-green)", fontWeight: 700, marginBottom: 2 },
  name: { fontSize: 14, fontWeight: 600 },
  hold: { fontSize: 12, color: "var(--text-muted)", marginTop: 2 },
  swapButton: {
    background: "none",
    border: "1px solid var(--border-strong)",
    color: "var(--text-faint)",
    borderRadius: 6,
    padding: "4px 10px",
    fontSize: 11,
    cursor: "pointer",
    alignSelf: "center",
  },
  empty: { color: "var(--text-faint)", fontSize: 13, fontStyle: "italic" },
};

// mode: "post" (static cooldown, default) | "pre" (dynamic warm-up)
export default function StretchRoutineGenerator({ mode = "post" }) {
  const config = MODE_CONFIG[mode] ?? MODE_CONFIG.post;
  const [routine, setRoutine] = useState(null); // array of { region, name, imageUrls, isDynamic } | null
  const [loading, setLoading] = useState(false);
  const [swappingRegion, setSwappingRegion] = useState(null);

  const generate = async () => {
    setLoading(true);
    try {
      const picks = await Promise.all(HEAD_TO_TOE.map((region) => pickStretchFor(region, mode)));
      setRoutine(picks.filter(Boolean));
    } finally {
      setLoading(false);
    }
  };

  const swapOne = async (region, currentName) => {
    setSwappingRegion(region);
    try {
      const replacement = await pickStretchFor(region, mode, currentName);
      if (replacement) {
        setRoutine((prev) => prev.map((item) => (item.region === region ? replacement : item)));
      }
    } finally {
      setSwappingRegion(null);
    }
  };

  const totalMinutes = routine ? Math.round((routine.length * config.holdSeconds) / 60) : 0;

  return (
    <div style={s.card}>
      <button style={s.button} onClick={generate} disabled={loading}>
        {loading ? "Building routine..." : routine ? "Regenerate routine" : config.generateLabel}
      </button>

      {routine && (
        <>
          <div style={s.meta}>
            {routine.length} moves · ~{config.holdSeconds}s each · ~{totalMinutes} min total. Ordered head to toe —
            work straight down the list. Tap Swap if one doesn't work for you today.
          </div>

          {routine.map((item) => (
            <div key={item.region} style={s.row}>
              {item.imageUrls?.[0] ? (
                <img src={item.imageUrls[0]} alt={item.name} style={s.thumb} />
              ) : (
                <div style={s.thumbEmpty} />
              )}
              <div style={s.rowMain}>
                <div style={s.region}>
                  {regionLabel(item.region)}
                  {mode === "pre" && item.isDynamic ? " · dynamic" : ""}
                </div>
                <div style={s.name}>{item.name}</div>
                <div style={s.hold}>{config.holdLabel(item.name)}</div>
              </div>
              <button
                style={s.swapButton}
                onClick={() => swapOne(item.region, item.name)}
                disabled={swappingRegion === item.region}
              >
                {swappingRegion === item.region ? "..." : "Swap"}
              </button>
            </div>
          ))}
        </>
      )}

      {!routine && !loading && <p style={s.empty}>{config.blurb}</p>}
    </div>
  );
}
