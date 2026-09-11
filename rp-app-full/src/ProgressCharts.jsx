import { useEffect, useMemo, useState } from "react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { storage } from "./storage.js";
import { personalRecords, volumeByMuscleOverTime, e1rmTrendForExercise, loggedExerciseNames } from "./stats.js";
import { aiClient } from "./aiClient.js";

const s = {
  card: {
    background: "#161616",
    border: "1px solid #262626",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 14, fontWeight: 700, marginBottom: 12 },
  prRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: 13,
    padding: "6px 0",
    borderBottom: "1px solid #222",
  },
  select: {
    width: "100%",
    background: "#111",
    border: "1px solid #2a2a2a",
    borderRadius: 8,
    color: "#f2f2f2",
    padding: "10px 12px",
    fontSize: 14,
    marginBottom: 12,
  },
  empty: { color: "#666", fontSize: 13, fontStyle: "italic" },
};

const MUSCLE_COLORS = {
  chest: "#5b8def", lats: "#7ad67a", shoulders: "#e0c85b", quadriceps: "#e05b5b",
  hamstrings: "#c98bd6", glutes: "#d67ab0", biceps: "#7ae0d6", triceps: "#e0a05b",
  abdominals: "#a0a0a0", calves: "#8be0a0", middle_back: "#7a9ee0", traps: "#e0e07a",
};

function CoachingSummary({ workouts }) {
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await aiClient.getCoachingSummary(workouts);
      setSummary(result);
    } catch (err) {
      setError(err.message || "Couldn't generate a summary right now.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ ...s.card, borderColor: "#3a3a5a" }}>
      <div style={s.sectionTitle}>Coaching summary (AI Boost)</div>
      {!summary && !loading && (
        <button
          style={{
            width: "100%", background: "#e8e8e8", color: "#0a0a0a", border: "none",
            borderRadius: 8, padding: "10px", fontWeight: 700, fontSize: 13, cursor: "pointer",
          }}
          onClick={handleGenerate}
        >
          Get a summary of my recent training
        </button>
      )}
      {loading && <p style={s.empty}>Reading your recent training...</p>}
      {error && <p style={{ color: "#e07a7a", fontSize: 12 }}>{error}</p>}
      {summary && <p style={{ fontSize: 13, lineHeight: 1.6, color: "#ddd" }}>{summary}</p>}
    </div>
  );
}

export default function ProgressCharts() {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExercise, setSelectedExercise] = useState("");

  useEffect(() => {
    storage.getWorkouts().then((data) => {
      setWorkouts(data);
      setLoading(false);
    });
  }, []);

  const records = useMemo(() => personalRecords(workouts), [workouts]);
  const [volumeData, setVolumeData] = useState([]);

  useEffect(() => {
    if (workouts.length === 0) return;
    volumeByMuscleOverTime(workouts).then(setVolumeData);
  }, [workouts]);
  const exerciseNames = useMemo(() => loggedExerciseNames(workouts), [workouts]);
  const trendData = useMemo(
    () => (selectedExercise ? e1rmTrendForExercise(workouts, selectedExercise) : []),
    [workouts, selectedExercise]
  );

  const muscleKeys = useMemo(() => {
    const keys = new Set();
    volumeData.forEach((week) => Object.keys(week).forEach((k) => k !== "week" && keys.add(k)));
    return Array.from(keys);
  }, [volumeData]);

  if (loading) return <p style={s.empty}>Loading your progress...</p>;
  if (workouts.length === 0) {
    return <p style={s.empty}>Log a few workouts and your progress will show up here.</p>;
  }

  return (
    <div>
      {aiClient.isAiBoostEnabled() && <CoachingSummary workouts={workouts} />}

      <div style={s.card}>
        <div style={s.sectionTitle}>Personal records (estimated 1RM)</div>
        {Object.values(records).length === 0 && <p style={s.empty}>No records yet.</p>}
        {Object.values(records)
          .sort((a, b) => b.e1rm - a.e1rm)
          .map((r) => (
            <div key={r.name} style={s.prRow}>
              <span>{r.name}</span>
              <span>{r.weight} × {r.reps} (~{r.e1rm} e1RM)</span>
            </div>
          ))}
      </div>

      {volumeData.length > 0 && (
        <div style={s.card}>
          <div style={s.sectionTitle}>Weekly set volume by muscle group</div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={volumeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
              <XAxis dataKey="week" tick={{ fill: "#888", fontSize: 11 }} />
              <YAxis tick={{ fill: "#888", fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "#161616", border: "1px solid #262626" }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              {muscleKeys.map((muscle) => (
                <Bar key={muscle} dataKey={muscle} stackId="a" fill={MUSCLE_COLORS[muscle] ?? "#888"} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div style={s.card}>
        <div style={s.sectionTitle}>Strength trend (estimated 1RM)</div>
        <select
          style={s.select}
          value={selectedExercise}
          onChange={(e) => setSelectedExercise(e.target.value)}
        >
          <option value="">Pick an exercise...</option>
          {exerciseNames.map((name) => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>

        {selectedExercise && trendData.length > 0 && (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
              <XAxis dataKey="date" tick={{ fill: "#888", fontSize: 11 }} />
              <YAxis tick={{ fill: "#888", fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "#161616", border: "1px solid #262626" }} />
              <Line type="monotone" dataKey="e1rm" stroke="#e8e8e8" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
        {selectedExercise && trendData.length === 0 && (
          <p style={s.empty}>No data logged for this exercise yet.</p>
        )}
      </div>
    </div>
  );
}
