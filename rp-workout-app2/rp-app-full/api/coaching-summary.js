// api/coaching-summary.js
//
// Same pattern as parse-workout.js: server-side only, holds the real
// API key, called by the client via fetch("/api/coaching-summary").

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { workouts } = req.body ?? {};
  if (!Array.isArray(workouts)) {
    return res.status(400).json({ error: "Missing 'workouts' array in request body" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "ANTHROPIC_API_KEY is not configured on the server" });
  }

  // Trim to a compact summary before sending — keeps token usage (and
  // cost) low and avoids sending more personal data than needed.
  const compact = workouts.slice(0, 30).map((w) => ({
    date: w.date?.slice(0, 10),
    exercises: (w.exercises ?? []).map((ex) => ({
      name: ex.name,
      sets: (ex.sets ?? []).map((s) => ({ weight: s.weight, reps: s.reps, rir: s.rir })),
    })),
  }));

  const systemPrompt = `You are a knowledgeable, direct strength-training coach reviewing a lifter's recent logged workouts. Write a short summary (3-5 sentences, plain language, no headers or bullet points) covering:
- Any clear trend in volume or intensity (RIR) over the period
- One thing going well
- One thing worth watching (e.g. a muscle group with declining RIR suggesting fatigue, or a stalled lift)

Be specific and reference actual exercises/numbers from the data. Don't give medical advice or diagnose anything. If there isn't enough data to say something meaningful, say so plainly instead of padding.`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 400,
        system: systemPrompt,
        messages: [{ role: "user", content: JSON.stringify(compact) }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(502).json({ error: `Claude API error: ${errText}` });
    }

    const data = await response.json();
    const summary = data.content?.[0]?.text ?? "No summary generated.";
    return res.status(200).json({ summary });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Failed to generate summary" });
  }
}
