import { useEffect, useState } from "react";
import { storage } from "./storage.js";
import { offlineQueue } from "./offlineQueue.js";
import ExerciseLibrary from "./ExerciseLibrary.jsx";
import MesocycleGenerator from "./MesocycleGenerator.jsx";
import ExerciseSubstitution from "./ExerciseSubstitution.jsx";
import ProgressCharts from "./ProgressCharts.jsx";
import MeasurementsTracker from "./MeasurementsTracker.jsx";
import CalendarView from "./CalendarView.jsx";
import PlateCalculator from "./PlateCalculator.jsx";
import WarmupCalculator from "./WarmupCalculator.jsx";
import RestTimer from "./RestTimer.jsx";
import YogaLibrary from "./YogaLibrary.jsx";
import { exportMesocycleAsPDF } from "./exportMesocycle.js";
import { autoregulateNextWeek, summarizeAdjustments } from "./autoregulate.js";
import { computeFatigueSignals } from "./fatigueSignals.js";
import FatigueBanner from "./FatigueBanner.jsx";
import BackgroundMotif from "./BackgroundMotif.jsx";
import { personalRecords, findNewPRs } from "./stats.js";
import { aiClient } from "./aiClient.js";
import VoiceInputButton from "./VoiceInputButton.jsx";

const s = {
  page: {
    minHeight: "100vh",
    // Transparent, not var(--bg) — html/body already paint that color
    // globally, and leaving this opaque would fully occlude the fixed
    // background motif on any screen close to 480px wide (i.e. every
    // phone this app actually targets).
    background: "transparent",
    color: "var(--text)",
    padding: "24px 16px 80px",
    maxWidth: 480,
    margin: "0 auto",
  },
  h1: { fontSize: 22, fontWeight: 800, marginBottom: 4 },
  sub: { fontSize: 13, color: "var(--text-faint)", marginBottom: 24 },
  section: { marginBottom: 32 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: "var(--text)",
    marginBottom: 12,
  },
  card: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },
  input: {
    width: "100%",
    background: "var(--input-bg)",
    border: "1px solid var(--border-strong)",
    borderRadius: 8,
    color: "var(--text)",
    padding: "10px 12px",
    fontSize: 14,
    fontFamily: "inherit",
    marginBottom: 8,
  },
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
  },
  smallButton: {
    background: "transparent",
    border: "1px solid var(--border-strong)",
    color: "var(--text-muted)",
    borderRadius: 6,
    padding: "6px 10px",
    fontSize: 11,
    cursor: "pointer",
  },
  ghostButton: {
    width: "100%",
    background: "transparent",
    color: "var(--text-faint)",
    border: "1px solid var(--border-strong)",
    borderRadius: 8,
    padding: "10px",
    fontSize: 13,
    cursor: "pointer",
    marginTop: 6,
  },
  empty: { color: "var(--text-faint)", fontSize: 13, fontStyle: "italic" },
  setRow: { display: "flex", gap: 6, marginBottom: 6 },
  dayPlanCard: {
    background: "var(--input-bg)",
    border: "1px solid var(--border)",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  dayPlanTitle: { fontSize: 12, fontWeight: 700, color: "var(--accent-gold)", marginBottom: 8 },
  dayPlanRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
    padding: "8px 0",
    borderBottom: "1px solid var(--border)",
  },
  dayPlanExercise: { fontSize: 13, fontWeight: 600, color: "var(--text)" },
  dayPlanMeta: { fontSize: 11, color: "var(--text-muted)", marginTop: 2 },
  center: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    background: "var(--bg)",
    color: "var(--text)",
    padding: 24,
  },
  tabRow: {
    display: "flex",
    gap: 8,
    marginBottom: 24,
    overflowX: "auto",
    paddingBottom: 4,
  },
  tabButton: (active) => ({
    flexShrink: 0,
    background: active ? "transparent" : "transparent",
    color: active ? "var(--accent-blue)" : "var(--text-faint)",
    border: "1px solid " + (active ? "var(--accent-blue)" : "var(--border-strong)"),
    borderRadius: 8,
    padding: "8px 14px",
    fontSize: 13,
    cursor: "pointer",
    whiteSpace: "nowrap",
  }),
  prBadge: {
    display: "inline-block",
    background: "var(--accent-gold-bg)",
    color: "var(--accent-gold)",
    fontSize: 10,
    fontWeight: 700,
    padding: "2px 6px",
    borderRadius: 4,
    marginLeft: 6,
  },
  offlineBanner: {
    background: "var(--accent-gold-bg)",
    color: "var(--accent-gold)",
    fontSize: 12,
    padding: "8px 12px",
    borderRadius: 8,
    marginBottom: 16,
    textAlign: "center",
  },
  weekDaySelect: { display: "flex", gap: 6, marginBottom: 8 },
};

function LoginScreen() {
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
            {error && <p style={{ color: "var(--danger)", fontSize: 13, marginTop: 8 }}>{error}</p>}
          </form>
        )}
      </div>
    </div>
  );
}

const TABS = [
  { id: "log", label: "Train" },
  { id: "library", label: "Exercise Library" },
  { id: "generate", label: "Generate" },
  { id: "progress", label: "Progress" },
  { id: "measurements", label: "Measurements" },
  { id: "calendar", label: "Calendar" },
  { id: "timer", label: "Rest Timer" },
  { id: "plates", label: "Plates" },
  { id: "warmup", label: "Warm-up" },
  { id: "yoga", label: "Yoga / Off-Day" },
];

function formatMuscleLabel(muscle) {
  return muscle
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function Dashboard({ user }) {
  const [tab, setTab] = useState("log");
  const [mesocycles, setMesocycles] = useState([]);
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [queueLength, setQueueLength] = useState(0);
  const [lastPRs, setLastPRs] = useState([]);

  const [mesoName, setMesoName] = useState("");
  const [mesoWeeks, setMesoWeeks] = useState(5);

  const [exerciseName, setExerciseName] = useState("");
  const [sets, setSets] = useState([{ weight: "", reps: "", rir: "" }]);
  const [activeMesoId, setActiveMesoId] = useState("");
  const [selectedWeekDay, setSelectedWeekDay] = useState(null); // { weekIndex, dayIndex }
  const [aiBoost, setAiBoost] = useState(aiClient.isAiBoostEnabled());
  const [nlText, setNlText] = useState("");
  const [nlParsing, setNlParsing] = useState(false);
  const [nlError, setNlError] = useState("");

  const refresh = async () => {
    const [m, w] = await Promise.all([storage.getMesocycles(), storage.getWorkouts()]);
    setMesocycles(m);
    setWorkouts(w);
    setLoading(false);
    setQueueLength(offlineQueue.getQueueLength());
  };

  useEffect(() => {
    refresh();
    // Try flushing any offline-queued writes on load, and again whenever
    // the connection comes back.
    storage.flushOfflineQueue().then(() => refresh());
    const unsubscribe = offlineQueue.onReconnect(() => {
      storage.flushOfflineQueue().then(() => refresh());
    });
    return unsubscribe;
  }, []);

  const activeMeso = mesocycles.find((m) => m.id === activeMesoId);

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

  const handleAutoregulate = async (meso) => {
    if (!meso.plan) return;
    const mesoWorkouts = workouts.filter((w) => w.mesocycle_id === meso.id);
    const adjustedPlan = autoregulateNextWeek(meso.plan, mesoWorkouts);
    const changes = summarizeAdjustments(meso.plan, adjustedPlan);
    if (changes.length === 0) {
      alert("No adjustment needed yet — either not enough data logged, or performance matched the plan closely.");
      return;
    }
    const confirmed = window.confirm(
      "Auto-regulation suggests:\n\n" + changes.join("\n") + "\n\nApply these changes to next week?"
    );
    if (confirmed) {
      await storage.updateMesocyclePlan(meso.id, adjustedPlan);
      refresh();
    }
  };

  const updateSet = (idx, field, value) => {
    setSets((prev) => prev.map((set, i) => (i === idx ? { ...set, [field]: value } : set)));
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

    const priorRecords = personalRecords(workouts);
    const newWorkout = { exercises: [{ name: exerciseName.trim(), sets: cleanSets }], date: new Date().toISOString() };
    const newPRs = findNewPRs(newWorkout, priorRecords);

    await storage.logWorkout({
      mesocycleId: activeMesoId || null,
      exercises: newWorkout.exercises,
      weekIndex: selectedWeekDay?.weekIndex ?? null,
      dayIndex: selectedWeekDay?.dayIndex ?? null,
    });

    setLastPRs(newPRs);
    setExerciseName("");
    setSets([{ weight: "", reps: "", rir: "" }]);
    refresh();
  };

  const handleDeleteWorkout = async (id) => {
    await storage.deleteWorkout(id);
    refresh();
  };

  const handleDuplicateWorkout = async (id) => {
    await storage.duplicateWorkout(id);
    refresh();
  };

  const toggleAiBoost = () => {
    const next = !aiBoost;
    aiClient.setAiBoostEnabled(next);
    setAiBoost(next);
  };

  const handleParseNl = async () => {
    if (!nlText.trim()) return;
    setNlParsing(true);
    setNlError("");
    try {
      const parsed = await aiClient.parseWorkoutText(nlText.trim());
      if (!parsed.exerciseName || !parsed.sets?.length) {
        setNlError("Couldn't confidently parse that — try rephrasing, or enter it manually below.");
        return;
      }
      setExerciseName(parsed.exerciseName);
      setSets(parsed.sets.map((s) => ({
        weight: String(s.weight ?? ""),
        reps: String(s.reps ?? ""),
        rir: s.rir === null || s.rir === undefined ? "" : String(s.rir),
      })));
      setNlText("");
    } catch (err) {
      setNlError(err.message || "Something went wrong parsing that.");
    } finally {
      setNlParsing(false);
    }
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
          style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: 12, cursor: "pointer" }}
        >
          Sign out
        </button>
      </div>
      <p style={s.sub}>Signed in as {user.email} — synced across your devices.</p>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>AI Boost {aiBoost ? "on" : "off"}</span>
        <button
          onClick={toggleAiBoost}
          style={{
            width: 44, height: 24, borderRadius: 12, border: "none", cursor: "pointer",
            background: aiBoost ? "var(--accent-green)" : "var(--border-strong)", position: "relative",
          }}
        >
          <div style={{
            width: 18, height: 18, borderRadius: 9, background: "var(--text)", position: "absolute",
            top: 3, left: aiBoost ? 23 : 3, transition: "left 0.15s",
          }} />
        </button>
      </div>

      {queueLength > 0 && (
        <div style={s.offlineBanner}>
          {queueLength} workout{queueLength > 1 ? "s" : ""} saved offline, waiting to sync...
        </div>
      )}

      {activeMeso && <FatigueBanner signals={computeFatigueSignals(activeMeso, workouts)} />}

      <div style={s.tabRow}>
        {TABS.map((t) => (
          <button key={t.id} style={s.tabButton(tab === t.id)} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "generate" && (
        <div style={s.section}>
          <MesocycleGenerator onSaved={refresh} />
        </div>
      )}

      {tab === "library" && (
        <div style={s.section}>
          <ExerciseLibrary onSelectExercise={(name) => { setExerciseName(name); setTab("log"); }} />
        </div>
      )}

      {tab === "progress" && (
        <div style={s.section}>
          <ProgressCharts />
        </div>
      )}

      {tab === "measurements" && (
        <div style={s.section}>
          <MeasurementsTracker />
        </div>
      )}

      {tab === "calendar" && (
        <div style={s.section}>
          <CalendarView mesocycles={mesocycles} />
        </div>
      )}

      {tab === "timer" && (
        <div style={s.section}>
          <RestTimer />
        </div>
      )}

      {tab === "plates" && (
        <div style={s.section}>
          <PlateCalculator />
        </div>
      )}

      {tab === "warmup" && (
        <div style={s.section}>
          <WarmupCalculator />
        </div>
      )}

      {tab === "yoga" && (
        <div style={s.section}>
          <YogaLibrary />
        </div>
      )}

      {tab === "log" && (
      <>
      <div style={s.section}>
        <div style={s.sectionTitle}>Mesocycles</div>

        {mesocycles.length === 0 && (
          <p style={s.empty}>No mesocycles yet. Create one below, or use Generate for a full plan.</p>
        )}

        {mesocycles.map((m) => (
          <div key={m.id} style={s.card}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontWeight: 700 }}>{m.name}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{m.weeks} weeks</div>
              </div>
              <button
                onClick={() => handleDeleteMeso(m.id)}
                style={{ ...s.smallButton }}
              >
                Delete
              </button>
            </div>
            {m.plan && (
              <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                <button style={s.smallButton} onClick={() => handleAutoregulate(m)}>
                  Auto-adjust next week
                </button>
                <button style={s.smallButton} onClick={() => exportMesocycleAsPDF(m)}>
                  Export as PDF
                </button>
              </div>
            )}
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
          <button style={s.button} type="submit">Create mesocycle (manual)</button>
        </form>
      </div>

      <div style={s.section}>
        <div style={s.sectionTitle}>Log a workout</div>

        {lastPRs.length > 0 && (
          <div style={{ ...s.card, borderColor: "var(--accent-gold)" }}>
            <div style={{ fontWeight: 700, color: "var(--accent-gold)", marginBottom: 4 }}>New PR!</div>
            {lastPRs.map((pr, i) => (
              <div key={i} style={{ fontSize: 13 }}>
                {pr.name}: {pr.weight} × {pr.reps} (~{pr.e1rm} e1RM)
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleLogWorkout} style={s.card}>
          {aiBoost && (
            <div style={{ marginBottom: 12, paddingBottom: 12, borderBottom: "1px solid var(--border)" }}>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 6 }}>
                AI Boost: describe your set in plain language
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <input
                  style={{ ...s.input, marginBottom: 0, flex: 1 }}
                  placeholder='e.g. "bench 185 for 3 sets of 8, felt like 2 in the tank"'
                  value={nlText}
                  onChange={(e) => setNlText(e.target.value)}
                />
                <VoiceInputButton onResult={(transcript) => setNlText(transcript)} />
                <button
                  type="button"
                  style={{ ...s.smallButton, flexShrink: 0 }}
                  onClick={handleParseNl}
                  disabled={nlParsing}
                >
                  {nlParsing ? "..." : "Parse"}
                </button>
              </div>
              <p style={{ fontSize: 10, color: "var(--text-faint)", marginTop: 4 }}>
                On iPhone, use the microphone icon on your keyboard instead — it works directly in this field.
              </p>
              {nlError && <p style={{ color: "var(--danger)", fontSize: 12, marginTop: 6 }}>{nlError}</p>}
            </div>
          )}

          {mesocycles.length > 0 && (
            <select
              style={s.input}
              value={activeMesoId}
              onChange={(e) => { setActiveMesoId(e.target.value); setSelectedWeekDay(null); }}
            >
              <option value="">No mesocycle</option>
              {mesocycles.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          )}

          {activeMeso?.plan && (
            <select
              style={s.input}
              value={selectedWeekDay ? `${selectedWeekDay.weekIndex}-${selectedWeekDay.dayIndex}` : ""}
              onChange={(e) => {
                if (!e.target.value) { setSelectedWeekDay(null); return; }
                const [weekIndex, dayIndex] = e.target.value.split("-").map(Number);
                setSelectedWeekDay({ weekIndex, dayIndex });
              }}
            >
              <option value="">Which planned day? (optional, enables auto-regulation)</option>
              {activeMeso.plan.weekPlans.flatMap((week) =>
                week.days.map((day) => (
                  <option key={`${week.weekIndex}-${day.dayIndex}`} value={`${week.weekIndex}-${day.dayIndex}`}>
                    Week {week.weekIndex}, Day {day.dayIndex}{week.isDeload ? " (deload)" : ""}
                  </option>
                ))
              )}
            </select>
          )}

          {activeMeso?.plan && selectedWeekDay && (() => {
            const week = activeMeso.plan.weekPlans.find((w) => w.weekIndex === selectedWeekDay.weekIndex);
            const day = week?.days.find((d) => d.dayIndex === selectedWeekDay.dayIndex);
            if (!day) return null;
            return (
              <div style={s.dayPlanCard}>
                <div style={s.dayPlanTitle}>
                  Planned for Week {selectedWeekDay.weekIndex}, Day {selectedWeekDay.dayIndex}
                  {week.isDeload ? " (deload)" : ""}
                </div>
                {day.exercises.length === 0 ? (
                  <p style={s.empty}>No exercises planned for this day.</p>
                ) : (
                  day.exercises.map((ex, i) => (
                    <div key={i} style={s.dayPlanRow}>
                      <div>
                        <div style={s.dayPlanExercise}>{ex.name}</div>
                        <div style={s.dayPlanMeta}>
                          {ex.sets} × {ex.reps} @ RIR {ex.rir} · {formatMuscleLabel(ex.muscle)}
                        </div>
                      </div>
                      <button type="button" style={s.smallButton} onClick={() => setExerciseName(ex.name)}>
                        Log this
                      </button>
                    </div>
                  ))
                )}
              </div>
            );
          })()}

          <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 8 }}>
            <input
              style={{ ...s.input, marginBottom: 0, flex: 1 }}
              placeholder="Exercise (e.g. Bench Press)"
              value={exerciseName}
              onChange={(e) => setExerciseName(e.target.value)}
            />
            <ExerciseSubstitution currentExercise={exerciseName} onSubstitute={setExerciseName} />
          </div>

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
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                {new Date(w.date).toLocaleDateString()}
                {typeof w.week_index === "number" && ` · Week ${w.week_index}, Day ${w.day_index}`}
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button style={s.smallButton} onClick={() => handleDuplicateWorkout(w.id)}>
                  Duplicate
                </button>
                <button style={s.smallButton} onClick={() => handleDeleteWorkout(w.id)}>
                  Delete
                </button>
              </div>
            </div>
            {w.exercises.map((ex, i) => (
              <div key={i} style={{ marginTop: 8 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{ex.name}</div>
                {ex.sets.map((set, si) => (
                  <div key={si} style={{ fontSize: 13, color: "var(--text-muted)" }}>
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
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    storage.getUser().then(setUser);
    const unsubscribe = storage.onAuthStateChange(setUser);
    return unsubscribe;
  }, []);

  return (
    <>
      <BackgroundMotif />
      {user === undefined ? (
        <div style={s.center}>
          <p style={s.empty}>Loading...</p>
        </div>
      ) : user ? (
        <Dashboard user={user} />
      ) : (
        <LoginScreen />
      )}
    </>
  );
}
