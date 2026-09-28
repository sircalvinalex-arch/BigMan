// MuscleDiagram.jsx
//
// A simple, original body-silhouette illustration that highlights which
// muscle group a given exercise targets — shown next to the exercise's
// photo. Deliberately NOT a real anatomy photo or medical illustration:
// those are almost universally licensed/copyrighted (stock anatomy art,
// textbook diagrams), the same issue we navigated with the app's
// background art. A flat highlighted-silhouette is also just how most
// fitness apps solve this (MuscleWiki, Jefit, etc.) — it communicates
// "which region" clearly without needing anatomical precision.

function normalizeMuscle(muscle) {
  return (muscle ?? "").toLowerCase().trim().replace(/\s+/g, "_");
}

// Shared base body geometry — the same numbers describe both the front
// and back views, since a body's silhouette is the same shape from
// either side; only which region gets highlighted (and a couple of
// back-only/front-only regions) differs.
const BASE = {
  head: { cx: 100, cy: 30, r: 20 },
  neck: { x: 92, y: 48, width: 16, height: 10, rx: 4 },
  torso: { x: 65, y: 58, width: 70, height: 90, rx: 14 },
  hips: { x: 68, y: 148, width: 64, height: 25, rx: 10 },
  armL: { x: 40, y: 70, width: 20, height: 55, rx: 9 },
  armR: { x: 140, y: 70, width: 20, height: 55, rx: 9 },
  forearmL: { x: 38, y: 125, width: 18, height: 50, rx: 8 },
  forearmR: { x: 144, y: 125, width: 18, height: 50, rx: 8 },
  legL: { x: 68, y: 173, width: 28, height: 80, rx: 12 },
  legR: { x: 104, y: 173, width: 28, height: 80, rx: 12 },
  calfL: { x: 70, y: 253, width: 24, height: 70, rx: 10 },
  calfR: { x: 106, y: 253, width: 24, height: 70, rx: 10 },
};

// Per-muscle: which view to draw, and the highlight shape(s) layered on
// top of the base silhouette. Covers both the app's 12 internal landmark
// muscles (used by planned/logged exercises) and the raw free-exercise-db
// muscle strings (used by the Exercise Library and stretch routines) —
// normalized to underscores so "lower back" and "lower_back" both match.
const MUSCLE_REGIONS = {
  chest: { view: "front", shapes: [{ tag: "rect", x: 65, y: 58, width: 70, height: 38, rx: 10 }] },
  shoulders: { view: "front", shapes: [{ tag: "circle", cx: 58, cy: 65, r: 15 }, { tag: "circle", cx: 142, cy: 65, r: 15 }] },
  biceps: { view: "front", shapes: [{ tag: "rect", ...BASE.armL }, { tag: "rect", ...BASE.armR }] },
  forearms: { view: "front", shapes: [{ tag: "rect", ...BASE.forearmL }, { tag: "rect", ...BASE.forearmR }] },
  abdominals: { view: "front", shapes: [{ tag: "rect", x: 72, y: 98, width: 56, height: 45, rx: 8 }] },
  quadriceps: { view: "front", shapes: [{ tag: "rect", ...BASE.legL }, { tag: "rect", ...BASE.legR }] },
  adductors: { view: "front", shapes: [{ tag: "rect", x: 94, y: 178, width: 12, height: 68, rx: 6 }] },
  abductors: { view: "front", shapes: [{ tag: "rect", x: 58, y: 176, width: 11, height: 74, rx: 5 }, { tag: "rect", x: 131, y: 176, width: 11, height: 74, rx: 5 }] },
  neck: { view: "front", shapes: [{ tag: "rect", x: 89, y: 45, width: 22, height: 16, rx: 5 }] },
  calves: { view: "front", shapes: [{ tag: "rect", ...BASE.calfL }, { tag: "rect", ...BASE.calfR }] },

  traps: { view: "back", shapes: [{ tag: "polygon", points: "85,58 115,58 130,90 70,90" }] },
  lats: { view: "back", shapes: [{ tag: "rect", x: 62, y: 90, width: 76, height: 38, rx: 10 }] },
  middle_back: { view: "back", shapes: [{ tag: "rect", x: 85, y: 68, width: 30, height: 38, rx: 6 }] },
  lower_back: { view: "back", shapes: [{ tag: "rect", x: 72, y: 126, width: 56, height: 22, rx: 6 }] },
  triceps: { view: "back", shapes: [{ tag: "rect", ...BASE.armL }, { tag: "rect", ...BASE.armR }] },
  glutes: { view: "back", shapes: [{ tag: "rect", ...BASE.hips }] },
  hamstrings: { view: "back", shapes: [{ tag: "rect", ...BASE.legL }, { tag: "rect", ...BASE.legR }] },
};

function Shape({ shape, color }) {
  const common = { fill: color, opacity: 0.85 };
  if (shape.tag === "rect") return <rect {...shape} {...common} />;
  if (shape.tag === "circle") return <circle {...shape} {...common} />;
  if (shape.tag === "polygon") return <polygon {...shape} {...common} />;
  return null;
}

function BaseSilhouette() {
  const outline = { fill: "var(--input-bg)", stroke: "var(--border-strong)", strokeWidth: 2 };
  return (
    <>
      <circle {...BASE.head} {...outline} />
      <rect {...BASE.neck} {...outline} />
      <rect {...BASE.torso} {...outline} />
      <rect {...BASE.hips} {...outline} />
      <rect {...BASE.armL} {...outline} />
      <rect {...BASE.armR} {...outline} />
      <rect {...BASE.forearmL} {...outline} />
      <rect {...BASE.forearmR} {...outline} />
      <rect {...BASE.legL} {...outline} />
      <rect {...BASE.legR} {...outline} />
      <rect {...BASE.calfL} {...outline} />
      <rect {...BASE.calfR} {...outline} />
    </>
  );
}

// muscle: a muscle name in either the app's internal format ("middle_back")
// or the raw dataset format ("middle back") — normalized internally.
// size: pixel width/height of the rendered square diagram.
export default function MuscleDiagram({ muscle, size = 140 }) {
  const key = normalizeMuscle(muscle);
  const region = MUSCLE_REGIONS[key];
  if (!region) return null; // unrecognized muscle string — skip rather than show a blank/wrong diagram

  return (
    <svg
      viewBox="0 0 200 340"
      width={size}
      height={size}
      style={{ background: "var(--surface)", borderRadius: 8, flexShrink: 0 }}
      role="img"
      aria-label={`Body diagram highlighting the ${muscle} region`}
    >
      <BaseSilhouette />
      {region.shapes.map((shape, i) => (
        <Shape key={i} shape={shape} color="var(--accent-blue)" />
      ))}
    </svg>
  );
}
