// exerciseInsights.js
//
// Two kinds of plain-language context:
//   1. What a muscle group actually DOES functionally (not just "target: chest")
//   2. What a given exercise's movement pattern translates to in daily life
//
// The muscle function text is authored per muscle group (only 12, so worth
// writing well). The real-life translation is pattern-based rather than
// authored per exercise — with 876 exercises, matching by movement pattern
// (squat, hinge, push, pull, carry, etc.) scales correctly instead of
// requiring hand-written text for every single one.

export const MUSCLE_FUNCTIONS = {
  chest: {
    function: "Presses the arm forward and across the body. Primary mover any time you push something away from your torso.",
    realLife: "Pushing open a heavy door, pushing a stalled car, getting up from the floor via a push-up-like motion.",
  },
  lats: {
    function: "Pulls the arm down and back toward the body. The main pulling muscle of the upper body, and a big contributor to posture.",
    realLife: "Pulling yourself up (a ledge, a pool edge), hauling a heavy bag onto your shoulder, rowing a boat.",
  },
  middle_back: {
    function: "Pulls the shoulder blades together and stabilizes the upper back. Works with the lats on most pulling movements.",
    realLife: "Standing up straighter under load, carrying heavy grocery bags without rounding forward, rowing motions.",
  },
  shoulders: {
    function: "Raises the arm in every direction — forward, sideways, and overhead. Also stabilizes the shoulder joint during almost every upper-body movement.",
    realLife: "Lifting a suitcase into an overhead bin, reaching for something on a high shelf, throwing a ball.",
  },
  biceps: {
    function: "Bends the elbow and rotates the forearm. A secondary mover on most pulling exercises.",
    realLife: "Carrying a bag with a bent elbow, pulling a lawnmower cord, curling a heavy box up to your chest.",
  },
  triceps: {
    function: "Straightens the elbow. The main mover any time you push something away from you with a straight(ening) arm.",
    realLife: "Pushing yourself up out of a chair, pushing a heavy door open with a straight arm, throwing a punch.",
  },
  quadriceps: {
    function: "Straightens the knee. Does most of the work standing up from a squat or a seated position.",
    realLife: "Standing up from a low chair or the toilet, climbing stairs, getting up off the floor.",
  },
  hamstrings: {
    function: "Bends the knee and extends the hip. Central to any hip-hinge movement and to decelerating the leg while running.",
    realLife: "Picking something up off the floor with a flat back (a hinge, not a squat), sprinting, getting out of a low car.",
  },
  glutes: {
    function: "Extends the hip — the main driver of standing up from a squat or hinge, and of forward propulsion when walking or running.",
    realLife: "The power behind climbing stairs two at a time, standing up from a deep squat, sprinting starts.",
  },
  calves: {
    function: "Points the foot downward (plantar flexion). Propels the body forward with every step.",
    realLife: "Pushing off the ground when walking or running, standing on tiptoe to reach something, jumping.",
  },
  abdominals: {
    function: "Flexes the spine and stabilizes the torso against rotation and extension — braces the trunk so force from the arms and legs doesn't leak.",
    realLife: "Bracing your core to lift something heavy safely, staying upright when someone bumps into you, coughing without straining your back.",
  },
  traps: {
    function: "Elevates and rotates the shoulder blade. Supports the neck and upper back under load.",
    realLife: "Carrying heavy bags at your sides without your shoulders collapsing forward, shrugging a heavy backpack into place.",
  },
};

// Movement-pattern keyword matching, checked in order — first match wins.
// This is intentionally simple (keyword-based) rather than a full
// biomechanical classifier, since it only needs to be right often enough
// to give a useful real-life translation, not be a kinesiology reference.
const PATTERN_RULES = [
  {
    pattern: "squat",
    keywords: ["squat"],
    realLife: "This is a squat pattern — the same motion as standing up from a low chair, getting off the floor, or picking up a heavy box by bending your knees instead of your back.",
  },
  {
    pattern: "hinge",
    keywords: ["deadlift", "good morning", "hip thrust", "glute bridge", "romanian"],
    realLife: "This is a hip-hinge pattern — bending at the hips with a flat back, the safe way to pick up anything heavy off the ground (a couch, a fallen bike, a toddler).",
  },
  {
    pattern: "lunge",
    keywords: ["lunge", "step up", "step-up", "split squat"],
    realLife: "This is a single-leg pattern — builds the stability you use walking on uneven ground, climbing stairs, or catching your balance when you stumble.",
  },
  {
    pattern: "horizontal push",
    keywords: ["bench press", "push-up", "pushup", "chest press", "push up"],
    realLife: "This is a horizontal push — the same motion as pushing open a heavy door or pushing yourself up off the floor.",
  },
  {
    pattern: "vertical push",
    keywords: ["overhead press", "shoulder press", "military press", "push press"],
    realLife: "This is an overhead push — the motion you use putting a suitcase in an overhead bin or lifting a box onto a high shelf.",
  },
  {
    pattern: "horizontal pull",
    keywords: ["row"],
    realLife: "This is a horizontal pull — the same motion as starting a lawnmower, rowing a boat, or pulling open a stuck drawer.",
  },
  {
    pattern: "vertical pull",
    keywords: ["pulldown", "pull-up", "pullup", "chin-up", "chinup"],
    realLife: "This is a vertical pull — builds the strength to pull yourself up over a ledge or out of a pool.",
  },
  {
    pattern: "carry",
    keywords: ["farmer", "carry", "walk"],
    realLife: "This is a loaded carry — directly builds the grip and posture you use carrying heavy grocery bags or luggage.",
  },
  {
    pattern: "rotation",
    keywords: ["twist", "rotation", "wood chop", "russian twist"],
    realLife: "This is a rotational/anti-rotation pattern — the trunk control you use swinging a bat or golf club, or bracing when someone bumps into you off-balance.",
  },
  {
    pattern: "isolation curl",
    keywords: ["curl"],
    realLife: "This isolates the elbow-flexor muscles — supports any carrying or pulling task where your elbow stays bent under load.",
  },
  {
    pattern: "isolation extension",
    keywords: ["extension", "pushdown", "kickback"],
    realLife: "This isolates the elbow or hip extensors — supports pushing and standing-up tasks without the rest of the body having to compensate.",
  },
  {
    pattern: "isolation raise",
    keywords: ["raise", "fly", "flye"],
    realLife: "This isolates the shoulder/hip through a single plane of motion — builds shoulder stability for overhead reaching or hip stability for single-leg balance.",
  },
];

export function getMuscleFunction(muscleKey) {
  return MUSCLE_FUNCTIONS[muscleKey] ?? null;
}

export function getRealLifeTranslation(exerciseName) {
  const lower = exerciseName.toLowerCase();
  for (const rule of PATTERN_RULES) {
    // Word-boundary match, not plain substring — otherwise short keywords
    // like "row" false-positive inside unrelated words (e.g. "throw").
    const matches = rule.keywords.some((kw) => {
      const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      return new RegExp(`\\b${escaped}\\b`).test(lower);
    });
    if (matches) return rule.realLife;
  }
  return "A strength movement that builds the underlying muscle and coordination used in everyday pushing, pulling, lifting, or carrying tasks.";
}
