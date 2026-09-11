// volumeLandmarks.js
//
// Weekly set-volume landmarks per muscle group: MEV (Minimum Effective
// Volume), MAV (Maximum Adaptive Volume), MRV (Maximum Recoverable Volume).
// Framework from RP's "Scientific Principles of Hypertrophy Training"
// (Israetel, Hoffmann, Davis, Feather) and Schoenfeld's meta-analytic work
// on volume-hypertrophy dose-response.
//
// IMPORTANT CONTEXT ON THE TWO TRACKS BELOW:
// The research base here does NOT establish rigorous, universally-agreed
// numeric landmarks that differ by sex — MEV/MAV/MRV are individual,
// trainee-specific values that RP itself says should be adjusted based on
// your own recovery and progress, not assigned by sex. What the literature
// DOES support as general (not universal) tendencies:
//   - Some evidence for faster recovery between sessions in women on
//     average, supporting a somewhat higher frequency/volume tolerance
//     ceiling in aggregate data (not a guarantee for any individual)
//   - NROLW-style programming philosophy emphasizes higher lower-body/
//     posterior-chain volume, reflecting a common (not universal) training
//     goal rather than a physiological requirement
//
// These two presets are a REASONABLE STARTING POINT to auto-regulate from,
// not a claim that your body must follow either one. The app should let
// you override any of this once you have a session or two of real data.

const BASE_LANDMARKS = {
  chest:        { mev: 8,  mav: 14, mrv: 20 },
  lats:         { mev: 8,  mav: 14, mrv: 20 },
  middle_back:  { mev: 6,  mav: 12, mrv: 18 },
  shoulders:    { mev: 8,  mav: 16, mrv: 24 },
  biceps:       { mev: 6,  mav: 14, mrv: 20 },
  triceps:      { mev: 6,  mav: 12, mrv: 18 },
  quadriceps:   { mev: 8,  mav: 14, mrv: 20 },
  hamstrings:   { mev: 6,  mav: 12, mrv: 18 },
  glutes:       { mev: 4,  mav: 12, mrv: 16 },
  calves:       { mev: 8,  mav: 14, mrv: 20 },
  abdominals:   { mev: 0,  mav: 12, mrv: 20 },
  traps:        { mev: 4,  mav: 10, mrv: 16 },
};

// "female" track: modestly higher volume ceiling on lower body / glutes,
// reflecting the NROLW-style emphasis and the recovery-tolerance research
// noted above — still a starting point, not a hard rule.
const FEMALE_ADJUSTMENTS = {
  glutes:     { mev: 6,  mav: 16, mrv: 22 },
  hamstrings: { mev: 8,  mav: 14, mrv: 20 },
  quadriceps: { mev: 8,  mav: 15, mrv: 22 },
};

// "male" track: modestly higher ceiling on upper-body pressing/pulling,
// reflecting typical goal emphasis in mainstream hypertrophy programming
// — again a starting point, not a physiological mandate.
const MALE_ADJUSTMENTS = {
  chest:     { mev: 8,  mav: 16, mrv: 22 },
  lats:      { mev: 8,  mav: 16, mrv: 22 },
  shoulders: { mev: 8,  mav: 18, mrv: 26 },
};

function buildLandmarks(track) {
  const adjustments = track === "female" ? FEMALE_ADJUSTMENTS : track === "male" ? MALE_ADJUSTMENTS : {};
  const result = {};
  for (const [muscle, base] of Object.entries(BASE_LANDMARKS)) {
    result[muscle] = { ...base, ...(adjustments[muscle] ?? {}) };
  }
  return result;
}

export const VOLUME_LANDMARKS = {
  neutral: buildLandmarks("neutral"),
  male: buildLandmarks("male"),
  female: buildLandmarks("female"),
};

// Given a week index (0-based) within a mesocycle of N weeks (last week
// being a deload), returns the target set count for a muscle group —
// ramping from MEV toward MRV, then dropping sharply for the deload week.
export function targetSetsForWeek(landmarks, muscle, weekIndex, totalWeeks) {
  const { mev, mav, mrv } = landmarks[muscle] ?? { mev: 6, mav: 12, mrv: 18 };
  const isDeloadWeek = weekIndex === totalWeeks - 1;
  if (isDeloadWeek) return Math.round(mev * 0.5);

  const rampWeeks = totalWeeks - 1; // all weeks except the deload
  const progress = rampWeeks <= 1 ? 1 : weekIndex / (rampWeeks - 1);
  const target = mev + (mrv - mev) * progress;
  return Math.min(Math.round(target), mrv);
}
