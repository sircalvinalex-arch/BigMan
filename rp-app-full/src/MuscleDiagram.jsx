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

// Shared body geometry, described as tapered polygons/ellipses rather
// than plain rectangles — gives the silhouette an actual waist, shoulders
// wider than hips, hands, and feet, instead of a blocky mannequin. Same
// geometry describes both the front and back views (a body's outline is
// the same shape from either side); only which piece gets highlighted
// differs.
const BASE = {
  head: { tag: "circle", cx: 100, cy: 28, r: 20 },
  neck: { tag: "rect", x: 90, y: 44, width: 20, height: 14, rx: 4 },
  torso: { tag: "polygon", points: "62,58 138,58 128,150 72,150" },
  pelvis: { tag: "polygon", points: "72,150 128,150 136,180 64,180" },
  shoulderL: { tag: "circle", cx: 60, cy: 64, r: 17 },
  shoulderR: { tag: "circle", cx: 140, cy: 64, r: 17 },
  armL: { tag: "polygon", points: "40,62 62,62 56,122 46,122" },
  armR: { tag: "polygon", points: "160,62 138,62 144,122 154,122" },
  forearmL: { tag: "polygon", points: "46,122 56,122 52,172 44,172" },
  forearmR: { tag: "polygon", points: "154,122 144,122 148,172 156,172" },
  handL: { tag: "ellipse", cx: 48, cy: 180, rx: 9, ry: 12 },
  handR: { tag: "ellipse", cx: 152, cy: 180, rx: 9, ry: 12 },
  thighL: { tag: "polygon", points: "64,180 100,180 96,255 70,255" },
  thighR: { tag: "polygon", points: "136,180 100,180 104,255 130,255" },
  calfL: { tag: "polygon", points: "70,255 96,255 92,330 74,330" },
  calfR: { tag: "polygon", points: "130,255 104,255 108,330 126,330" },
  footL: { tag: "ellipse", cx: 83, cy: 336, rx: 14, ry: 8 },
  footR: { tag: "ellipse", cx: 117, cy: 336, rx: 14, ry: 8 },
};

// Per-muscle: which view to draw, and the highlight shape(s) layered on
// top of the base silhouette. Covers both the app's 12 internal landmark
// muscles (used by planned/logged exercises) and the raw free-exercise-db
// muscle strings (used by the Exercise Library and stretch routines) —
// normalized to underscores so "lower back" and "lower_back" both match.
const MUSCLE_REGIONS = {
  chest: { view: "front", shapes: [{ tag: "polygon", points: "62,58 138,58 133,100 67,100" }] },
  shoulders: { view: "front", shapes: [BASE.shoulderL, BASE.shoulderR] },
  biceps: { view: "front", shapes: [BASE.armL, BASE.armR] },
  forearms: { view: "front", shapes: [BASE.forearmL, BASE.forearmR] },
  abdominals: { view: "front", shapes: [{ tag: "polygon", points: "67,100 133,100 128,150 72,150" }] },
  quadriceps: { view: "front", shapes: [BASE.thighL, BASE.thighR] },
  adductors: { view: "front", shapes: [{ tag: "polygon", points: "96,182 104,182 102,250 98,250" }] },
  abductors: {
    view: "front",
    shapes: [
      { tag: "polygon", points: "64,182 72,182 70,253 66,253" },
      { tag: "polygon", points: "136,182 128,182 130,253 134,253" },
    ],
  },
  neck: { view: "front", shapes: [{ tag: "rect", x: 87, y: 41, width: 26, height: 18, rx: 5 }] },
  calves: { view: "front", shapes: [BASE.calfL, BASE.calfR] },

  traps: { view: "back", shapes: [{ tag: "polygon", points: "85,58 115,58 130,92 70,92" }] },
  lats: { view: "back", shapes: [{ tag: "polygon", points: "64,95 136,95 130,145 70,145" }] },
  middle_back: { view: "back", shapes: [{ tag: "polygon", points: "85,70 115,70 112,120 88,120" }] },
  lower_back: { view: "back", shapes: [{ tag: "rect", x: 72, y: 145, width: 56, height: 25, rx: 6 }] },
  triceps: { view: "back", shapes: [BASE.armL, BASE.armR] },
  glutes: { view: "back", shapes: [BASE.pelvis] },
  hamstrings: { view: "back", shapes: [BASE.thighL, BASE.thighR] },
};

function Shape({ shape, color, strokeOnly }) {
  const { tag, ...attrs } = shape;
  const style = strokeOnly
    ? { fill: "none", stroke: color, strokeWidth: 2 }
    : { fill: color, opacity: 0.85 };
  if (tag === "rect") return <rect {...attrs} {...style} />;
  if (tag === "circle") return <circle {...attrs} {...style} />;
  if (tag === "ellipse") return <ellipse {...attrs} {...style} />;
  if (tag === "polygon") return <polygon {...attrs} {...style} />;
  return null;
}

function BaseSilhouette() {
  const parts = Object.values(BASE);
  return (
    <>
      {parts.map((shape, i) => (
        <Shape key={`fill${i}`} shape={shape} color="var(--input-bg)" />
      ))}
      {/* Second pass draws just the outlines on top, so overlapping
          pieces (e.g. an arm crossing the torso's edge) still each show
          a visible edge instead of merging into one blob. */}
      {parts.map((shape, i) => (
        <Shape key={`stroke${i}`} shape={shape} color="var(--border-strong)" strokeOnly />
      ))}
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
      viewBox="0 0 200 360"
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
