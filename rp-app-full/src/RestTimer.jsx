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

// Three short beeps rather than one — a single 0.5s beep is easy to miss
// if the phone isn't in hand. Reuses a persistent AudioContext (see
// ensureAudioContext below) rather than creating a fresh one here: many
// mobile browsers, especially iOS Safari, block audio from a context
// that wasn't created/resumed during a direct user tap, and this fires
// from a setInterval callback, not a tap.
function playAlarm(ctx) {
  if (ctx) {
    try {
      [0, 0.35, 0.7].forEach((offset) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 880;
        gain.gain.setValueAtTime(0.3, ctx.currentTime + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + offset + 0.25);
        osc.start(ctx.currentTime + offset);
        osc.stop(ctx.currentTime + offset + 0.25);
      });
    } catch {
      // Audio not available — fall through to vibration below.
    }
  }
  // Vibration is a useful backup on phones (works even on silent mode on
  // most Android browsers) and costs nothing to also try on top of audio.
  if (navigator.vibrate) {
    try {
      navigator.vibrate([200, 100, 200, 100, 200]);
    } catch {
      // Not supported (e.g. iOS Safari) — ignore.
    }
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
  const audioCtxRef = useRef(null);

  // Create (or resume) the AudioContext only from within a real tap —
  // the Start button click — so it's actually unlocked by the time the
  // alarm needs to fire later from a timer callback.
  const ensureAudioContext = () => {
    if (!audioCtxRef.current) {
      try {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      } catch {
        audioCtxRef.current = null;
      }
    }
    if (audioCtxRef.current?.state === "suspended") {
      audioCtxRef.current.resume();
    }
  };

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            playAlarm(audioCtxRef.current);
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
    ensureAudioContext();
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
