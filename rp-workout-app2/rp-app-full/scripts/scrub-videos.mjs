// scrub-videos.mjs
//
// Pages through your deployed ExerciseDB instance, checks each exercise's
// videoUrl with a HEAD request, and writes out only the ones that actually
// resolve to a video (status 200, video content-type).
//
// Usage:
//   node scrub-videos.mjs https://your-exercisedb-deployment.vercel.app
//
// Output:
//   verified-exercises.json   — full exercise objects with a working video
//   verified-video-ids.json   — just the exercise IDs (small, easy to diff against)

const BASE_URL = process.argv[2];

if (!BASE_URL) {
  console.error("Usage: node scrub-videos.mjs <exercisedb-base-url>");
  process.exit(1);
}

const PAGE_LIMIT = 50;
const CONCURRENCY = 10; // how many video checks to run at once

async function fetchPage(offset) {
  const res = await fetch(`${BASE_URL}/exercises?limit=${PAGE_LIMIT}&offset=${offset}`);
  if (!res.ok) throw new Error(`Failed to fetch page at offset ${offset}: ${res.status}`);
  const json = await res.json();
  return json.data ?? json;
}

async function hasWorkingVideo(exercise) {
  if (!exercise.videoUrl) return false;
  try {
    const res = await fetch(exercise.videoUrl, { method: "HEAD" });
    if (!res.ok) return false;
    const contentType = res.headers.get("content-type") || "";
    return contentType.startsWith("video/") || contentType === "application/octet-stream";
  } catch {
    return false;
  }
}

// Simple concurrency-limited map so we don't fire hundreds of requests at once.
async function mapWithConcurrency(items, limit, fn) {
  const results = [];
  let index = 0;
  async function worker() {
    while (index < items.length) {
      const current = index++;
      results[current] = await fn(items[current]);
    }
  }
  await Promise.all(Array.from({ length: limit }, worker));
  return results;
}

async function main() {
  console.log(`Fetching all exercises from ${BASE_URL} ...`);

  let allExercises = [];
  let offset = 0;
  while (true) {
    const page = await fetchPage(offset);
    if (!page || page.length === 0) break;
    allExercises = allExercises.concat(page);
    offset += PAGE_LIMIT;
    process.stdout.write(`\rFetched ${allExercises.length} exercises...`);
    if (page.length < PAGE_LIMIT) break;
  }
  console.log(`\nTotal exercises found: ${allExercises.length}`);

  console.log("Checking video links (this can take a few minutes)...");
  const checks = await mapWithConcurrency(allExercises, CONCURRENCY, async (ex) => {
    const ok = await hasWorkingVideo(ex);
    return { ex, ok };
  });

  const verified = checks.filter((c) => c.ok).map((c) => c.ex);
  const verifiedIds = verified.map((ex) => ex.exerciseId ?? ex.id);

  const fs = await import("fs/promises");
  await fs.writeFile("verified-exercises.json", JSON.stringify(verified, null, 2));
  await fs.writeFile("verified-video-ids.json", JSON.stringify(verifiedIds, null, 2));

  console.log(`\nDone.`);
  console.log(`${verified.length} of ${allExercises.length} exercises have a working video.`);
  console.log(`Written to verified-exercises.json and verified-video-ids.json`);
}

main().catch((err) => {
  console.error("Script failed:", err);
  process.exit(1);
});
