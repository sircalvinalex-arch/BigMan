// aiClient.js
// Calls the app's own serverless functions (api/parse-workout.js,
// api/coaching-summary.js) — never calls Anthropic's API directly from
// the browser, since that would require exposing the API key client-side.

const AI_BOOST_KEY = "rp-workout-app:ai-boost-enabled";

function isAiBoostEnabled() {
  return localStorage.getItem(AI_BOOST_KEY) === "true";
}

function setAiBoostEnabled(enabled) {
  localStorage.setItem(AI_BOOST_KEY, enabled ? "true" : "false");
}

async function parseWorkoutText(text) {
  const res = await fetch("/api/parse-workout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to parse workout text");
  }
  return res.json();
}

async function getCoachingSummary(workouts) {
  const res = await fetch("/api/coaching-summary", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ workouts }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to generate summary");
  }
  const data = await res.json();
  return data.summary;
}

export const aiClient = {
  isAiBoostEnabled,
  setAiBoostEnabled,
  parseWorkoutText,
  getCoachingSummary,
};
