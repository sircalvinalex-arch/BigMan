import { useEffect, useState } from "react";
import { storage } from "./storage.js";
import ExerciseLibrary from "./ExerciseLibrary.jsx";

const s = {
  page: {
    minHeight: "100vh",
    background: "#0a0a0a",
    color: "#f2f2f2",
    padding: "24px 16px 80px",
    maxWidth: 480,
    margin: "0 auto",
  },
  h1: { fontSize: 22, fontWeight: 800, marginBottom: 4 },
  sub: { fontSize: 13, color: "#8a8a8a", marginBottom: 24 },
  section: { marginBottom: 32 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: "#e0e0e0",
    marginBottom: 12,
  },
  card: {
    background: "#161616",
    border: "1px solid #262626",
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },
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
  button: {
    width: "100%",
    background: "#e8e8e8",
    color: "#0a0a0a",
    border: "none",
    borderRadius: 8,
    padding: "12px",
    fontWeight: 700,
    fontSize: 14,
    cursor: "pointer",
  },
  ghostButton: {
    width: "100%",
    background: "transparent",
    color: "#8a8a8a",
    border: "1px solid #2a2a2a",
    borderRadius: 8,
    padding: "10px",
    fontSize: 13,
    cursor: "pointer",
    marginTop: 6,
  },
  empty: { color: "#666", fontSize: 13, fontStyle: "italic" },
  setRow: { display: "flex", gap: 6, marginBottom: 6 },
  center: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    background: "#0a0a0a",
    color: "#f2f2f2",
    padding: 24,
  },
};

function LoginScreen({ onSent }) {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSending(true);
    setError("");
    try {
      await storage.signInWithEmail(email.trim());
      setSent(true);
      onSent?.();
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={s.center}>
      <div style={{ width: "100%", maxWidth: 340 }}>
        <h1 style={s.h1}>RP Workout</h1>
        <p style={s.sub}>Sign in to sync your training across devices.</p>
        {sent ? (
          <p style={{ fontSize: 14 }}>
            Check <strong>{email}</strong> for a magic link to finish signing in.
          </p>
        ) : (
          <form onSubmit={handleSubmit}>
            <input
              style={s.input}
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button style={s.button} type="submit" disabled={sending}>
              {sending ? "Sending..." : "Send magic link"}
            </button>
            {error && (
              <p style={{ color: "#e07a7a", fontSize: 13, marginTop: 8 }}>{error}</p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}

function Dashboard({ user }) {
  const [tab, setTab] = useState("log"); // "log" | "library"
  const [mesocycles, setMesocycles] = useState([]);
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [mesoName, setMesoName] = useState("");
  const [mesoWeeks, setMesoWeeks] = useState(5);

  const [exerciseName, setExerciseName] = useState("");
  const [sets, setSets] = useState([{ weight: "", reps: "", rir: "" }]);
  const [activeMesoId, setActiveMesoId] = useState("");

  const refresh = async () => {
    const [m, w] = await Promise.all([storage.getMesocycles(), storage.getWorkouts()]);
    setMesocycles(m);
    setWorkouts(w);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  const handleCreateMeso = async (e) => {
    e.preventDefault();
    if (!mesoName.trim()) return;
    await storage.createMesocycle({ name: mesoName.trim(), weeks: Number(mesoWeeks) });
    setMesoName("");
    setMesoWeeks(5);
    refresh();
  };

  const handleDeleteMeso = async (id) => {
    await storage.deleteMesocycle(id);
    refresh();
  };

  const updateSet = (idx, field, value) => {
    setSets((prev) =>
      prev.map((set, i) => (i === idx ? { ...set, [field]: value } : set))
    );
  };

  const addSetRow = () => setSets((prev) => [...prev, { weight: "", reps: "", rir: "" }]);

  const handleLogWorkout = async (e) => {
    e.preventDefault();
    if (!exerciseName.trim()) return;
    const cleanSets = sets
      .filter((set) => set.weight !== "" && set.reps !== "")
      .map((set) => ({
        weight: Number(set.weight),
        reps: Number(set.reps),
        rir: set.rir === "" ? null : Number(set.rir),
      }));
    if (cleanSets.length === 0) return;

    await storage.logWorkout({
      mesocycleId: activeMesoId || null,
      exercises: [{ name: exerciseName.trim(), sets: cleanSets }],
    });

    setExerciseName("");
    setSets([{ weight: "", reps: "", rir: "" }]);
    refresh();
  };

  const handleDeleteWorkout = async (id) => {
    await storage.deleteWorkout(id);
    refresh();
  };

  if (loading) {
    return (
      <div style={s.page}>
        <p style={s.empty}>Loading your training data...</p>
      </div>
    );
  }

  return (
    <div style={s.page}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <h1 style={s.h1}>RP Workout</h1>
        <button
          onClick={() => storage.signOut()}
          style={{ background: "none", border: "none", color: "#888", fontSize: 12, cursor: "pointer" }}
        >
          Sign out
        </button>
      </div>
      <p style={s.sub}>Signed in as {user.email} — synced across your devices.</p>

      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        <button
          onClick={() => setTab("log")}
          style={{ ...s.ghostButton, marginTop: 0, borderColor: tab === "log" ? "#e8e8e8" : "#2a2a2a", color: tab === "log" ? "#e8e8e8" : "#8a8a8a" }}
        >
          Train
        </button>
        <button
          onClick={() => setTab("library")}
          style={{ ...s.ghostButton, marginTop: 0, borderColor: tab === "library" ? "#e8e8e8" : "#2a2a2a", color: tab === "library" ? "#e8e8e8" : "#8a8a8a" }}
        >
          Exercise Library
        </button>
      </div>

      {tab === "library" && (
        <div style={s.section}>
          <ExerciseLibrary onSelectExercise={(name) => { setExerciseName(name); setTab("log"); }} />
        </div>
      )}

      {tab === "log" && (
      <>
      <div style={s.section}>
        <div style={s.sectionTitle}>Mesocycles</div>

        {mesocycles.length === 0 && (
          <p style={s.empty}>No mesocycles yet. Create one below.</p>
        )}

        {mesocycles.map((m) => (
          <div key={m.id} style={s.card}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontWeight: 700 }}>{m.name}</div>
                <div style={{ fontSize: 12, color: "#888" }}>{m.weeks} weeks</div>
              </div>
              <button
                onClick={() => handleDeleteMeso(m.id)}
                style={{ ...s.ghostButton, width: "auto", padding: "4px 10px", marginTop: 0 }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}

        <form onSubmit={handleCreateMeso} style={{ marginTop: 12 }}>
          <input
            style={s.input}
            placeholder="Mesocycle name (e.g. Hypertrophy Block 1)"
            value={mesoName}
            onChange={(e) => setMesoName(e.target.value)}
          />
          <input
            style={s.input}
            type="number"
            min="1"
            placeholder="Weeks"
            value={mesoWeeks}
            onChange={(e) => setMesoWeeks(e.target.value)}
          />
          <button style={s.button} type="submit">Create mesocycle</button>
        </form>
      </div>

      <div style={s.section}>
        <div style={s.sectionTitle}>Log a workout</div>
        <form onSubmit={handleLogWorkout} style={s.card}>
          {mesocycles.length > 0 && (
            <select
              style={s.input}
              value={activeMesoId}
              onChange={(e) => setActiveMesoId(e.target.value)}
            >
              <option value="">No mesocycle</option>
              {mesocycles.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          )}

          <input
            style={s.input}
            placeholder="Exercise (e.g. Bench Press)"
            value={exerciseName}
            onChange={(e) => setExerciseName(e.target.value)}
          />

          {sets.map((set, idx) => (
            <div style={s.setRow} key={idx}>
              <input
                style={s.input}
                type="number"
                placeholder="Weight"
                value={set.weight}
                onChange={(e) => updateSet(idx, "weight", e.target.value)}
              />
              <input
                style={s.input}
                type="number"
                placeholder="Reps"
                value={set.reps}
                onChange={(e) => updateSet(idx, "reps", e.target.value)}
              />
              <input
                style={s.input}
                type="number"
                placeholder="RIR"
                value={set.rir}
                onChange={(e) => updateSet(idx, "rir", e.target.value)}
              />
            </div>
          ))}

          <button type="button" style={s.ghostButton} onClick={addSetRow}>
            + Add set
          </button>
          <div style={{ height: 10 }} />
          <button style={s.button} type="submit">Log workout</button>
        </form>
      </div>

      <div style={s.section}>
        <div style={s.sectionTitle}>History</div>
        {workouts.length === 0 && <p style={s.empty}>No workouts logged yet.</p>}
        {workouts.map((w) => (
          <div key={w.id} style={s.card}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div style={{ fontSize: 12, color: "#888" }}>
                {new Date(w.date).toLocaleDateString()}
              </div>
              <button
                onClick={() => handleDeleteWorkout(w.id)}
                style={{ ...s.ghostButton, width: "auto", padding: "4px 10px", marginTop: 0 }}
              >
                Delete
              </button>
            </div>
            {w.exercises.map((ex, i) => (
              <div key={i} style={{ marginTop: 8 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{ex.name}</div>
                {ex.sets.map((set, si) => (
                  <div key={si} style={{ fontSize: 13, color: "#aaa" }}>
                    {set.weight} × {set.reps} {set.rir !== null ? `@ RIR ${set.rir}` : ""}
                  </div>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
      </>
      )}
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(undefined); // undefined = loading, null = logged out

  useEffect(() => {
    storage.getUser().then(setUser);
    const unsubscribe = storage.onAuthStateChange(setUser);
    return unsubscribe;
  }, []);

  if (user === undefined) {
    return (
      <div style={s.center}>
        <p style={s.empty}>Loading...</p>
      </div>
    );
  }

  return user ? <Dashboard user={user} /> : <LoginScreen />;
}
