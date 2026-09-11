// yogaSeries.js
//
// Named, structured sequences — as opposed to yogaPoses.js's random
// "quick flow" generator. Each series is built around a specific purpose
// with a deliberate pose order. References poses by their stable "id"
// field (not display name), so renaming a pose's Sanskrit/English text
// never silently breaks a series.

import { YOGA_POSES, totalDurationForPoses, formatDuration } from "./yogaPoses.js";

function resolvePoses(ids) {
  return ids.map((id) => YOGA_POSES.find((p) => p.id === id)).filter(Boolean);
}

const SERIES_DEFINITIONS = [
  {
    name: "Morning Wake-Up",
    description: "A short sequence to loosen the spine and hips before the day starts.",
    poseIds: ["cat-pose", "cow-pose", "downward-dog", "standing-forward-fold", "cobra-pose", "childs-pose"],
  },
  {
    name: "Post-Leg-Day Recovery",
    description: "Targets the hips, hamstrings, and glutes — the areas that tend to feel tightest after squats, deadlifts, or lunges.",
    poseIds: ["pigeon-pose", "seated-forward-fold", "bound-angle", "happy-baby", "legs-up-wall"],
  },
  {
    name: "Hip Opener Flow",
    description: "A deeper focus on hip mobility — useful on a recurring basis if hip tightness is limiting your squat depth or lunge range.",
    poseIds: ["low-lunge", "pigeon-pose", "garland-pose", "bound-angle", "happy-baby", "reclined-twist"],
  },
  {
    name: "Upper Body & Shoulder Release",
    description: "For after a heavy pressing or pulling day, when the chest and shoulders feel tight rather than the legs.",
    poseIds: ["thread-the-needle", "cow-face-pose", "cobra-pose", "sphinx-pose", "childs-pose"],
  },
  {
    name: "Standing Strength & Balance",
    description: "A standing sequence combining balance work with isometric strength holds — good as a genuine mobility/stability session, not just a stretch.",
    poseIds: ["mountain-pose", "tree-pose", "warrior-one", "warrior-two", "triangle-pose", "chair-pose"],
  },
  {
    name: "Backbend Opener",
    description: "Progressively deeper backbends for the chest, hip flexors, and spine — save this for a day you're not already sore through the lower back.",
    poseIds: ["cobra-pose", "sphinx-pose", "bridge-pose", "camel-pose"],
  },
  {
    name: "Full Body Reset",
    description: "A longer, more complete sequence touching hips, hamstrings, spine, and shoulders — for a day you want a fuller session rather than a quick one.",
    poseIds: ["cat-pose", "cow-pose", "downward-dog", "low-lunge", "pigeon-pose", "seated-forward-fold", "half-lord-of-fishes", "legs-up-wall"],
  },
  {
    name: "Pre-Bed Wind-Down",
    description: "All gentle, mostly passive poses — meant to help you wind down in the evening, not to build a training stimulus.",
    poseIds: ["childs-pose", "reclined-twist", "happy-baby", "legs-up-wall", "corpse-pose"],
  },
];

export const YOGA_SERIES = SERIES_DEFINITIONS.map((series) => {
  const poses = resolvePoses(series.poseIds);
  const totalSeconds = totalDurationForPoses(poses);
  return {
    ...series,
    poses,
    estimatedDuration: formatDuration(totalSeconds),
    estimatedSeconds: totalSeconds,
  };
});
