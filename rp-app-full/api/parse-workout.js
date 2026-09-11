// api/parse-workout.js
//
// Vercel serverless function. Runs server-side only — this is where the
// real Anthropic API key lives, as an environment variable that is NEVER
// prefixed with VITE_ (so it's never bundled into the browser-side code).
//
// The client (src/aiClient.js) POSTs free text here; this calls Claude,
// asks for strict JSON back, and returns structured { exerciseName, sets }.

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { text } = req.body ?? {};
  if (!text || typeof text !== "string") {
    return res.status(400).json({ error: "Missing 'text' in request body" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "ANTHROPIC_API_KEY is not configured on the server" });
  }

  const systemPrompt = `You parse a lifter's free-text workout log into strict JSON. Output ONLY valid JSON, no markdown fences, no commentary.

Schema:
{
  "exerciseName": string,
  "sets": [ { "weight": number, "reps": number, "rir": number | null } ]
}

Rules:
- If multiple sets share the same weight/reps (e.g. "3 sets of 8 at 185"), expand into that many entries in "sets".
- "felt like 2 in the tank", "2 reps in reserve", "RIR 2" all mean rir: 2. If RIR isn't mentioned, use null.
- If the input describes more than one exercise, only parse the first one.
- If you cannot confidently parse an exercise name or at least one set, return { "exerciseName": null, "sets": [] }.`;

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
        max_tokens: 300,
        system: systemPrompt,
        messages: [{ role: "user", content: text }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(502).json({ error: `Claude API error: ${errText}` });
    }

    const data = await response.json();
    const rawText = data.content?.[0]?.text ?? "{}";
    const cleaned = rawText.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    return res.status(200).json(parsed);
  } catch (err) {
    return res.status(500).json({ error: err.message || "Failed to parse workout" });
  }
}
