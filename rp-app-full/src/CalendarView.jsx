import { useState } from "react";

const s = {
  card: {
    background: "#161616",
    border: "1px solid #262626",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
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
  grid: { display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 },
  dayCell: (hasWorkout, isDeload) => ({
    aspectRatio: "1",
    borderRadius: 6,
    background: hasWorkout ? (isDeload ? "#3a3320" : "#1e2f1e") : "#111",
    border: "1px solid #262626",
    padding: 4,
    fontSize: 10,
    color: hasWorkout ? "#ccc" : "#555",
    display: "flex",
    flexDirection: "column",
  }),
  dateNum: { fontWeight: 700, marginBottom: 2 },
  weekLabel: { fontSize: 9, color: "#888" },
  empty: { color: "#666", fontSize: 13, fontStyle: "italic" },
};

const WEEKDAY_LABELS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

function buildCalendarDays(mesocycle) {
  if (!mesocycle.plan) return [];
  const startDate = new Date(mesocycle.start_date);
  const daysPerWeek = mesocycle.plan.daysPerWeek;
  const trainingDayGap = Math.floor(7 / daysPerWeek);

  const calendarDays = [];
  let currentDate = new Date(startDate);

  mesocycle.plan.weekPlans.forEach((week) => {
    week.days.forEach((day) => {
      calendarDays.push({
        date: new Date(currentDate),
        weekIndex: week.weekIndex,
        dayIndex: day.dayIndex,
        isDeload: week.isDeload,
        exerciseCount: day.exercises.length,
      });
      currentDate.setDate(currentDate.getDate() + trainingDayGap);
    });
  });

  return calendarDays;
}

export default function CalendarView({ mesocycles }) {
  const [selectedId, setSelectedId] = useState(mesocycles[0]?.id ?? "");
  const selected = mesocycles.find((m) => m.id === selectedId);
  const calendarDays = selected ? buildCalendarDays(selected) : [];

  if (mesocycles.length === 0) {
    return <p style={s.empty}>Create a mesocycle to see it laid out on a calendar.</p>;
  }

  const firstDay = calendarDays[0]?.date;
  const leadingPad = firstDay ? (firstDay.getDay() + 6) % 7 : 0;
  const gridCells = [...Array(leadingPad).fill(null), ...calendarDays];

  return (
    <div>
      <div style={s.card}>
        <select style={s.select} value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
          {mesocycles.map((m) => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>

        {!selected?.plan && (
          <p style={s.empty}>This mesocycle has no generated plan to lay out (created manually rather than via Generate).</p>
        )}

        {selected?.plan && (
          <>
            <div style={{ ...s.grid, marginBottom: 6 }}>
              {WEEKDAY_LABELS.map((label) => (
                <div key={label} style={{ ...s.weekLabel, textAlign: "center" }}>{label}</div>
              ))}
            </div>
            <div style={s.grid}>
              {gridCells.map((cell, i) => (
                <div key={i} style={cell ? s.dayCell(true, cell.isDeload) : s.dayCell(false, false)}>
                  {cell && (
                    <>
                      <div style={s.dateNum}>{cell.date.getDate()}</div>
                      <div style={s.weekLabel}>W{cell.weekIndex}D{cell.dayIndex}</div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
