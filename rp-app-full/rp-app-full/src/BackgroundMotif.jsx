// BackgroundMotif.jsx
//
// A quiet, original piece of set-dressing for the app: a plate silhouette
// bleeding off the top-right corner, drawn in flat line art at low
// opacity. Purely decorative, sits behind every screen regardless of tab.
//
// Deliberately NOT a photo — a photo behind this much dense text/inputs
// would fight for attention and hurt legibility on a small screen. This
// is quiet enough to read as texture, not decoration competing with the
// content on top of it.

export default function BackgroundMotif() {
  return (
    <svg
      viewBox="0 0 400 400"
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        zIndex: -1,
        pointerEvents: "none",
        opacity: 0.06,
      }}
      preserveAspectRatio="xMaxYMin slice"
      aria-hidden="true"
    >
      {/* Plate face, bleeding off the top-right corner */}
      <circle cx="400" cy="40" r="170" fill="none" stroke="var(--text)" strokeWidth="2" />
      <circle cx="400" cy="40" r="120" fill="none" stroke="var(--text)" strokeWidth="2" />
      <circle cx="400" cy="40" r="28" fill="none" stroke="var(--text)" strokeWidth="3" />
      {/* Bar passing behind the plate */}
      <line x1="60" y1="40" x2="330" y2="40" stroke="var(--text)" strokeWidth="4" />
    </svg>
  );
}
