import { useEffect, useRef, useState } from "react";

const s = {
  card: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 12,
    padding: 16,
    textAlign: "center",
  },
  time: { fontSize: 40, fontWeight: 800, marginBottom: 12, fontVariantNumeric: "tabular-nums" },
  presetRow: { display: "flex", gap: 6, marginBottom: 12, justifyContent: "center" },
  preset: (active) => ({
    padding: "8px 12px",
    borderRadius: 8,
    fontSize: 13,
    border: "1px solid " + (active ? "var(--accent-blue)" : "var(--border-strong)"),
    background: active ? "var(--accent-blue)" : "transparent",
    color: active ? "var(--bg)" : "var(--text-muted)",
    cursor: "pointer",
  }),
  button: {
    padding: "10px 20px",
    borderRadius: 8,
    fontWeight: 700,
    fontSize: 14,
    border: "none",
    cursor: "pointer",
    marginRight: 8,
  },
  startButton: { background: "var(--accent-blue)", color: "var(--on-accent)" },
  resetButton: { background: "transparent", border: "1px solid var(--border-strong)", color: "var(--text-muted)" },
};

const PRESETS = [60, 90, 120, 180];

// Short beep using the Web Audio API — no audio file needed.
function playBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } catch {
    // Audio not available (e.g. autoplay restrictions) — silently skip.
  }
}

function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const sec = totalSeconds % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export default function RestTimer() {
  const [duration, setDuration] = useState(90);
  const [remaining, setRemaining] = useState(90);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            playBeep();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  const selectPreset = (seconds) => {
    setDuration(seconds);
    setRemaining(seconds);
    setRunning(false);
  };

  const handleStart = () => {
    if (remaining === 0) setRemaining(duration);
    setRunning(true);
  };

  const handleReset = () => {
    setRunning(false);
    setRemaining(duration);
  };

  return (
    <div style={s.card}>
      <div style={s.time}>{formatTime(remaining)}</div>

      <div style={s.presetRow}>
        {PRESETS.map((sec) => (
          <button key={sec} style={s.preset(duration === sec)} onClick={() => selectPreset(sec)}>
            {sec}s
          </button>
        ))}
      </div>

      <button style={{ ...s.button, ...s.startButton }} onClick={running ? () => setRunning(false) : handleStart}>
        {running ? "Pause" : remaining === 0 ? "Restart" : "Start"}
      </button>
      <button style={{ ...s.button, ...s.resetButton }} onClick={handleReset}>
        Reset
      </button>
    </div>
  );
}
