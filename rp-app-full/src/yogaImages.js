// yogaImages.js
//
// Pulls a pose illustration (SVG or PNG) from the free, hosted yoga-api
// project: https://github.com/alexcumplido/yoga-api
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

// Query terms per pose id, matched against the API's "english_name"
// field (per its docs: "name: english and not sanskrit or adapted").
// Chosen from the pose's own English name where that's a clean, common
// term the API is likely to use verbatim; simplified for poses with a
// more elaborate English name than the API would likely use. Not
// verified against live data (that API blocks automated browsing tools,
// though not actual browser fetch calls) — if a query comes back "not
// found," the pose just shows text-only, same as before this feature
// existed.
const POSE_ID_QUERIES = {
  "childs-pose": "child",
  "downward-dog": "downward dog",
  "cat-pose": "cat",
  "cow-pose": "cow",
  "pigeon-pose": "pigeon",
  "cobra-pose": "cobra",
  "seated-forward-fold": "seated forward bend",
  "low-lunge": "lunge",
  "reclined-twist": "reclined twist",
  "happy-baby": "happy baby",
  "standing-forward-fold": "standing forward bend",
  "bound-angle": "butterfly",
  "thread-the-needle": "thread the needle",
  "sphinx-pose": "sphinx",
  "legs-up-wall": "legs up the wall",
  "mountain-pose": "mountain",
  "tree-pose": "tree",
  "warrior-two": "warrior 2",
  "warrior-one": "warrior 1",
  "triangle-pose": "triangle",
  "bridge-pose": "bridge",
  "camel-pose": "camel",
  "bow-pose": "bow",
  "half-lord-of-fishes": "half lord of the fishes",
  "cow-face-pose": "cow face",
  "garland-pose": "garland",
  "chair-pose": "chair",
  "dolphin-pose": "dolphin",
  "corpse-pose": "corpse",
};

const cache = {}; // { poseId: url | null }

export async function getPoseImage(poseId) {
  if (poseId in cache) return cache[poseId];

  const query = POSE_ID_QUERIES[poseId];
  if (!query) {
    cache[poseId] = null;
    return null;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000); // don't hang forever on a sleeping free-tier API
    const res = await fetch(`${BASE_URL}/poses?name=${encodeURIComponent(query)}`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      cache[poseId] = null;
      return null;
    }

    const data = await res.json();
    const pose = Array.isArray(data) ? data[0] : data;
    const url = pose?.url_png ?? pose?.url_svg ?? null;
    cache[poseId] = url;
    return url;
  } catch {
    cache[poseId] = null;
    return null;
  }
}
