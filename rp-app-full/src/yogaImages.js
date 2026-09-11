// yogaImages.js
//
// Pulls a pose illustration (SVG or PNG) from the free, hosted yoga-api
// project: https://github.com/alexcumplido/yoga-api
//
// Rather than guessing a search term per pose and hoping the API's own
// ?name= endpoint does the fuzzy matching we want (it turned out to be
// stricter than expected — several reasonable-looking guesses came back
// empty), this fetches the API's FULL pose list ONCE, caches it, and
// does the fuzzy name-matching ourselves against the real data. This is
// more robust since we're matching against actual values instead of
// guessing what the API expects.
//
// IMPORTANT LICENSING NOTE (per that repo's README):
// - Some images are CC0 (public domain), no attribution needed
// - Others are sourced from Flaticon and REQUIRE this exact attribution
//   wherever they're used:
//     <a href="https://www.flaticon.com/free-icons/easy">Easy icons
//     created by monkik - Flaticon</a>
//     <a href="https://www.flaticon.com/free-icons/yoga">Yoga icons
//     created by dDara - Flaticon</a>
// The API's JSON response does not indicate which license a given image
// falls under, so both attributions are shown together in the Yoga tab's
// footer (see YogaLibrary.jsx) any time an image from this API is used.
//
// This is a free third-party service on a free Render.com tier, which
// can take 30-60 seconds to "wake up" on its first request after being
// idle. The app treats a failed/slow fetch as "no image available"
// rather than blocking anything — poses always still work with
// text-only instructions.

const BASE_URL = "https://yoga-api-nzy4.onrender.com/v1";

let allPosesCache = null; // the full list fetched from the API, once
let fetchAttempted = false;

function normalize(str) {
  return (str ?? "")
    .toLowerCase()
    .replace(/pose|posture|\(.*?\)/g, "") // strip generic filler words
    .replace(/[^a-z\s]/g, "")
    .trim();
}

async function fetchAllPoses() {
  if (allPosesCache) return allPosesCache;
  if (fetchAttempted) return null; // already tried once this session and failed, don't retry every call
  fetchAttempted = true;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000); // free-tier host may need to "wake up"
    const res = await fetch(`${BASE_URL}/poses`, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) return null;
    const data = await res.json();
    allPosesCache = Array.isArray(data) ? data : null;
    return allPosesCache;
  } catch {
    return null;
  }
}

// Finds the best match for one of our poses against the API's real pose
// list, checking both English and Sanskrit names in both directions
// (their name contains ours, or ours contains theirs) since neither
// naming convention is guaranteed to match exactly.
function findBestMatch(poses, sanskritName, englishName) {
  const targets = [normalize(sanskritName), normalize(englishName)].filter(Boolean);

  for (const pose of poses) {
    const candidates = [
      normalize(pose.english_name),
      normalize(pose.sanskrit_name_adapted),
      normalize(pose.sanskrit_name),
    ].filter(Boolean);

    for (const target of targets) {
      for (const candidate of candidates) {
        if (!target || !candidate) continue;
        if (candidate === target || candidate.includes(target) || target.includes(candidate)) {
          return pose;
        }
      }
    }
  }
  return null;
}

const resultCache = {}; // { poseId: url | null }

export async function getPoseImage(poseId, sanskritName, englishName) {
  if (poseId in resultCache) return resultCache[poseId];

  const allPoses = await fetchAllPoses();
  if (!allPoses) {
    resultCache[poseId] = null;
    return null;
  }

  const match = findBestMatch(allPoses, sanskritName, englishName);
  const url = match?.url_png ?? match?.url_svg ?? null;
  resultCache[poseId] = url;
  return url;
}
