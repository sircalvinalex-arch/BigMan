import { useState } from "react";

const SEVERITY_STYLE = {
  3: { border: "var(--danger-border)", bg: "var(--danger-bg)" },
  2: { border: "var(--accent-gold-border)", bg: "var(--accent-gold-bg)" },
  1: { border: "var(--accent-green-border)", bg: "var(--accent-green-bg)" },
};

const SEVERITY_HEADLINE = {
  3: "Fatigue check — worth acting on",
  2: "Fatigue check — worth watching",
  1: "Fatigue check",
};

const s = {
  wrap: (severity) => ({
    borderRadius: 12,
    border: `1px solid ${SEVERITY_STYLE[severity]?.border ?? "var(--border)"}`,
    background: SEVERITY_STYLE[severity]?.bg ?? "var(--surface)",
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
  toggle: { fontSize: 12, color: "var(--text-muted)" },
  note: { fontSize: 13, color: "var(--text)", lineHeight: 1.5, marginTop: 8 },
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
