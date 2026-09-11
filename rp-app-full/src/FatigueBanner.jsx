import { useState } from "react";

const SEVERITY_STYLE = {
  3: { border: "#5a3a3a", bg: "#241616" },
  2: { border: "#5a4a2a", bg: "#241f14" },
  1: { border: "#3a4a3a", bg: "#161e16" },
};

const SEVERITY_HEADLINE = {
  3: "Fatigue check — worth acting on",
  2: "Fatigue check — worth watching",
  1: "Fatigue check",
};

const s = {
  wrap: (severity) => ({
    borderRadius: 12,
    border: `1px solid ${SEVERITY_STYLE[severity]?.border ?? "#333"}`,
    background: SEVERITY_STYLE[severity]?.bg ?? "#161616",
    padding: "12px 14px",
    marginBottom: 16,
  }),
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    cursor: "pointer",
  },
  headline: { fontSize: 13, fontWeight: 700 },
  toggle: { fontSize: 12, color: "#999" },
  note: { fontSize: 13, color: "#ddd", lineHeight: 1.5, marginTop: 8 },
  list: { marginTop: 10, display: "flex", flexDirection: "column", gap: 8 },
};

export default function FatigueBanner({ signals }) {
  const [expanded, setExpanded] = useState(false);
  if (!signals || signals.length === 0) return null;

  const topSeverity = signals[0].severity;
  const headline = SEVERITY_HEADLINE[topSeverity] ?? "Fatigue check";
  const rest = signals.slice(1);

  return (
    <div style={s.wrap(topSeverity)}>
      <div style={s.headerRow} onClick={() => setExpanded((e) => !e)}>
        <div style={s.headline}>
          {headline} · {signals.length} note{signals.length > 1 ? "s" : ""}
        </div>
        {signals.length > 1 && <div style={s.toggle}>{expanded ? "Hide" : "Show all"}</div>}
      </div>

      <div style={s.note}>{signals[0].message}</div>

      {expanded && rest.length > 0 && (
        <div style={s.list}>
          {rest.map((sig, i) => (
            <div key={i} style={s.note}>
              {sig.message}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
