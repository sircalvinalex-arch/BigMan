// yogaPoses.js
//
// A curated set of well-known yoga poses (asanas) for off-day mobility
// and recovery work. Descriptions, benefits, and instructions are
// written from general, widely-known kinesiology concepts — not
// reproduced or closely paraphrased from any specific book. Pose names
// (Sanskrit and English) are standard, centuries-old terminology, not
// anyone's proprietary content.
//
// Each pose has a stable "id" (never shown to the user) used to cross-
// reference series (yogaSeries.js) and image lookups (yogaImages.js), so
// renaming display text later never breaks those references.
//
// "sanskritName" is the primary/traditional name, shown first.
// "englishName" is a plain-language secondary name.
// "targetAreas" uses broad body regions rather than the app's precise
// strength-training muscle-group keys, since a single pose typically
// involves a stretch on one side of a joint and a supporting/stabilizing
// action on the other.
//
// "holdSeconds" is a rough estimate from each pose's own breath-count/
// time guidance (roughly 5-6 seconds per slow breath) — used to estimate
// total series time, not a precise prescription. "bothSides" marks poses
// done once per side, doubling their time cost in a series estimate.

export const YOGA_POSES = [
  {
    id: "childs-pose",
    sanskritName: "Balasana",
    englishName: "Child's Pose",
    targetAreas: ["hips", "lower back", "shoulders"],
    intensity: "gentle",
    holdSeconds: 45,
    bothSides: false,
    benefit: "A resting shape that gently stretches the hips and lower back while the arms and shoulders relax overhead. Commonly used as a reset between more demanding poses, or as a low-key way to decompress the spine after a heavy training day.",
    instructions: [
      "Kneel on the floor, big toes touching, knees spread comfortably wide.",
      "Sit back onto your heels and fold your torso forward between your thighs.",
      "Extend your arms forward on the floor, or rest them alongside your body with palms up.",
      "Let your forehead rest on the mat and breathe slowly for 5-10 breaths.",
    ],
    caution: "If your knees are cranky, place a cushion between your calves and thighs, or skip this if kneeling itself is uncomfortable.",
  },
  {
    id: "downward-dog",
    sanskritName: "Adho Mukha Svanasana",
    englishName: "Downward-Facing Dog",
    targetAreas: ["hamstrings", "calves", "shoulders", "spine"],
    intensity: "moderate",
    holdSeconds: 40,
    bothSides: false,
    benefit: "Lengthens the hamstrings and calves while the shoulders and upper back work to support body weight — a genuinely useful counter-stretch after a leg or pulling day, since it loads the posterior chain in a very different way than lifting does.",
    instructions: [
      "Start on hands and knees, hands slightly ahead of your shoulders.",
      "Tuck your toes and lift your hips up and back, straightening your legs as much as feels okay.",
      "Press your chest toward your thighs and your heels toward (not necessarily touching) the floor.",
      "Keep a soft bend in the knees if your hamstrings are tight.",
      "Hold for 5-8 breaths.",
    ],
    caution: "Can put weight through the wrists — modify onto forearms if wrist strain is an issue.",
  },
  {
    id: "cat-pose",
    sanskritName: "Marjaryasana",
    englishName: "Cat Pose",
    targetAreas: ["spine", "core"],
    intensity: "gentle",
    holdSeconds: 25,
    bothSides: false,
    benefit: "Rounds the spine into flexion, stretching the muscles along the back — usually practiced flowing into Cow Pose as a paired movement.",
    instructions: [
      "From hands and knees, exhale and round your spine toward the ceiling.",
      "Tuck your chin toward your chest and draw your belly in.",
      "Hold briefly, then flow into Cow Pose on the inhale.",
    ],
    caution: "None significant.",
  },
  {
    id: "cow-pose",
    sanskritName: "Bitilasana",
    englishName: "Cow Pose",
    targetAreas: ["spine", "core"],
    intensity: "gentle",
    holdSeconds: 25,
    bothSides: false,
    benefit: "Extends the spine, opening the chest and stretching the front of the torso — the counter-movement to Cat Pose, together moving the whole spine through its range one segment at a time.",
    instructions: [
      "From hands and knees, inhale and drop your belly toward the floor.",
      "Lift your chest and tailbone, gaze gently upward.",
      "Hold briefly, then flow back into Cat Pose on the exhale.",
      "Repeat the Cat-Cow cycle for 8-10 breaths total.",
    ],
    caution: "None significant.",
  },
  {
    id: "pigeon-pose",
    sanskritName: "Eka Pada Rajakapotasana",
    englishName: "Pigeon Pose (simplified)",
    targetAreas: ["hips", "glutes"],
    intensity: "moderate to deep",
    holdSeconds: 40,
    bothSides: true,
    benefit: "A deep hip external-rotator and glute stretch — one of the most direct ways to address the hip tightness that builds up from squatting, lunging, and sitting.",
    instructions: [
      "From hands and knees, bring your right knee forward behind your right wrist, angling your shin across the mat.",
      "Slide your left leg straight back behind you, hips squared toward the front as much as possible.",
      "Fold forward over your front leg, or stay upright with hands on the floor for support.",
      "Hold for 5-8 breaths, then switch sides.",
    ],
    caution: "Go carefully if you have any history of knee issues. Stop if you feel pinching rather than stretching.",
  },
  {
    id: "cobra-pose",
    sanskritName: "Bhujangasana",
    englishName: "Cobra Pose",
    targetAreas: ["chest", "abdominals", "spine"],
    intensity: "gentle to moderate",
    holdSeconds: 45,
    bothSides: false,
    benefit: "Opens the chest and front of the shoulders while the lower back muscles work to lift the torso — a useful counter-stretch after a chest/pressing-heavy training day.",
    instructions: [
      "Lie face down, hands planted under your shoulders, elbows hugged in.",
      "Press through your hands to lift your chest off the floor, keeping some bend in the elbows.",
      "Draw your shoulders down away from your ears.",
      "Hold for 5 breaths, lower back down, repeat 2-3 times.",
    ],
    caution: "Keep it a small lift if you have any lower-back sensitivity.",
  },
  {
    id: "seated-forward-fold",
    sanskritName: "Paschimottanasana",
    englishName: "Seated Forward Fold",
    targetAreas: ["hamstrings", "lower back"],
    intensity: "moderate",
    holdSeconds: 50,
    bothSides: false,
    benefit: "A sustained hamstring and lower-back stretch — effective after a leg day, particularly for hamstring tightness from squats, deadlifts, or lunges.",
    instructions: [
      "Sit with legs extended straight in front of you.",
      "Inhale to lengthen your spine, then hinge forward from the hips.",
      "Reach for your shins, ankles, or feet — wherever you can hold without forcing it.",
      "Hold for 6-10 breaths, letting the stretch deepen gradually.",
    ],
    caution: "Keep a soft bend in the knees if tightness pulls your lower back into a rounded position.",
  },
  {
    id: "low-lunge",
    sanskritName: "Anjaneyasana",
    englishName: "Low Lunge",
    targetAreas: ["hip flexors", "quadriceps"],
    intensity: "moderate",
    holdSeconds: 35,
    bothSides: true,
    benefit: "Directly stretches the hip flexors (tight from both heavy squatting and long sitting) along with the quadriceps of the back leg.",
    instructions: [
      "From a kneeling lunge, step your right foot forward, knee stacked over ankle.",
      "Lower your left knee to the floor, untuck your back toes if comfortable.",
      "Shift your hips forward and slightly down, keeping your torso upright.",
      "Hold for 5-8 breaths, then switch sides.",
    ],
    caution: "Pad your back knee if kneeling on a hard floor bothers it.",
  },
  {
    id: "reclined-twist",
    sanskritName: "Supta Matsyendrasana",
    englishName: "Reclined Spinal Twist",
    targetAreas: ["spine", "glutes", "lower back"],
    intensity: "gentle",
    holdSeconds: 40,
    bothSides: true,
    benefit: "A passive rotational stretch for the spine and glutes, done lying down — good for a day you're sore or fatigued but still want to move a little.",
    instructions: [
      "Lie on your back, knees bent, feet flat on the floor.",
      "Drop both knees to one side, keeping shoulders flat on the ground.",
      "Turn your head the opposite direction if it feels good on your neck.",
      "Hold for 6-8 breaths, then switch sides.",
    ],
    caution: "None significant.",
  },
  {
    id: "happy-baby",
    sanskritName: "Ananda Balasana",
    englishName: "Happy Baby",
    targetAreas: ["hips", "inner thighs", "lower back"],
    intensity: "gentle",
    holdSeconds: 40,
    bothSides: false,
    benefit: "A gentle hip-opener that also decompresses the lower back, since it's done lying down with the low back flat on the floor.",
    instructions: [
      "Lie on your back, bring your knees toward your chest.",
      "Grab the outsides of your feet and open your knees toward your armpits.",
      "Gently rock side to side, or hold still, keeping your lower back on the floor.",
      "Hold for 6-8 breaths.",
    ],
    caution: "None significant.",
  },
  {
    id: "standing-forward-fold",
    sanskritName: "Uttanasana",
    englishName: "Standing Forward Fold",
    targetAreas: ["hamstrings", "calves", "lower back"],
    intensity: "moderate",
    holdSeconds: 40,
    bothSides: false,
    benefit: "Similar hamstring/calf stretch to the seated version, with the spine gently loaded in traction as you hang forward — many people find this relieves lower-back tightness more directly.",
    instructions: [
      "Stand with feet hip-width apart, slight bend in the knees.",
      "Hinge at the hips and fold your torso forward, letting your head and arms hang.",
      "Hold opposite elbows, or let your hands rest on the floor or a block.",
      "Hold for 6-8 breaths, bending your knees more if your lower back feels tight.",
    ],
    caution: "Come up slowly to avoid head-rush dizziness.",
  },
  {
    id: "bound-angle",
    sanskritName: "Baddha Konasana",
    englishName: "Butterfly / Bound Angle",
    targetAreas: ["inner thighs", "hips"],
    intensity: "gentle to moderate",
    holdSeconds: 45,
    bothSides: false,
    benefit: "Opens the inner thigh (adductor) muscles and hip joint — useful after heavy squatting, since the adductors stabilize the knee and hip through most lower-body lifts.",
    instructions: [
      "Sit with the soles of your feet together, knees falling out to the sides.",
      "Hold your feet or ankles, sit up tall rather than rounding forward.",
      "Optionally fold your torso gently forward over your feet.",
      "Hold for 6-8 breaths.",
    ],
    caution: "Don't force your knees toward the floor.",
  },
  {
    id: "thread-the-needle",
    sanskritName: "Parsva Balasana",
    englishName: "Thread the Needle",
    targetAreas: ["shoulders", "upper back"],
    intensity: "gentle",
    holdSeconds: 35,
    bothSides: true,
    benefit: "Stretches the shoulder and upper-back region on one side at a time — good after a pressing or pulling-heavy day when one shoulder feels tighter than the other.",
    instructions: [
      "From hands and knees, slide your right arm underneath your body, palm up, lowering your right shoulder and ear to the floor.",
      "Keep your left hand planted for support, or extend it forward.",
      "Hold for 5-6 breaths, then switch sides.",
    ],
    caution: "Keep the twist gentle through the neck.",
  },
  {
    id: "sphinx-pose",
    sanskritName: "Salamba Bhujangasana",
    englishName: "Sphinx Pose",
    targetAreas: ["chest", "abdominals", "spine"],
    intensity: "gentle",
    holdSeconds: 50,
    bothSides: false,
    benefit: "A gentler alternative to Cobra — same chest-opening benefit, with less demand on the lower back and wrists since you're propped on your forearms.",
    instructions: [
      "Lie face down, prop yourself up on your forearms, elbows under shoulders.",
      "Press your forearms down to lift your chest, keeping your lower belly and legs relaxed.",
      "Hold for 6-10 breaths.",
    ],
    caution: "None significant.",
  },
  {
    id: "legs-up-wall",
    sanskritName: "Viparita Karani",
    englishName: "Legs Up the Wall",
    targetAreas: ["hamstrings", "lower back"],
    intensity: "very gentle",
    holdSeconds: 240,
    bothSides: false,
    benefit: "A fully passive pose — lying down with legs resting up a wall. Mild hamstring stretch, but the bigger value is simply resting with legs elevated after a hard training block.",
    instructions: [
      "Sit sideways next to a wall, then swing your legs up the wall as you lie back.",
      "Scoot your hips as close to the wall as comfortable.",
      "Let your arms rest at your sides, close your eyes if you like.",
      "Stay for 3-5 minutes.",
    ],
    caution: "None significant.",
  },
  {
    id: "mountain-pose",
    sanskritName: "Tadasana",
    englishName: "Mountain Pose",
    targetAreas: ["full body", "core"],
    intensity: "very gentle",
    holdSeconds: 30,
    bothSides: false,
    benefit: "A standing alignment check more than a stretch — grounds through the feet, stacks the joints, and engages the core and legs isometrically. Often the starting and ending point of a standing sequence.",
    instructions: [
      "Stand with feet together or hip-width apart, weight even across both feet.",
      "Engage your thighs slightly, lengthen through the spine, relax your shoulders down.",
      "Let your arms rest at your sides, palms facing forward.",
      "Hold for 5-6 breaths, simply noticing your alignment.",
    ],
    caution: "None significant.",
  },
  {
    id: "tree-pose",
    sanskritName: "Vrikshasana",
    englishName: "Tree Pose",
    targetAreas: ["ankles", "core", "hips"],
    intensity: "moderate",
    holdSeconds: 30,
    bothSides: true,
    benefit: "A single-leg balance pose that trains ankle stability and core control — directly useful for the same balance demands as walking on uneven ground or single-leg strength work.",
    instructions: [
      "Stand tall, shift weight onto your left foot.",
      "Place your right foot on your inner left calf or thigh (not directly on the knee joint).",
      "Bring your hands to your chest or overhead once balanced.",
      "Hold for 5-6 breaths, then switch sides.",
    ],
    caution: "Keep a hand on a wall for support if balance is challenging — there's no need to force the full shape.",
  },
  {
    id: "warrior-two",
    sanskritName: "Virabhadrasana II",
    englishName: "Warrior II",
    targetAreas: ["hips", "quadriceps", "shoulders"],
    intensity: "moderate",
    holdSeconds: 35,
    bothSides: true,
    benefit: "A standing hip-opener and quad-strengthener held isometrically — builds the same hip stability used in a wide-stance squat or lateral lunge, while the arms and shoulders work statically.",
    instructions: [
      "Step your feet wide apart, turn your right foot out 90 degrees, back foot slightly in.",
      "Bend your right knee to a right angle, stacked over your ankle.",
      "Extend your arms parallel to the floor, gaze over your front hand.",
      "Hold for 5-6 breaths, then switch sides.",
    ],
    caution: "Don't let the front knee cave inward — keep it tracking over the middle toes.",
  },
  {
    id: "warrior-one",
    sanskritName: "Virabhadrasana I",
    englishName: "Warrior I",
    targetAreas: ["hip flexors", "quadriceps", "shoulders"],
    intensity: "moderate",
    holdSeconds: 35,
    bothSides: true,
    benefit: "Combines a hip flexor stretch on the back leg with a quad-dominant hold on the front leg, plus an overhead shoulder stretch — a genuinely multi-area pose.",
    instructions: [
      "From a lunge, square your hips toward the front of the mat.",
      "Bend your front knee to a right angle, back leg straight, back foot angled slightly in.",
      "Raise both arms overhead, palms facing each other.",
      "Hold for 5-6 breaths, then switch sides.",
    ],
    caution: "Keep the back heel grounded if possible, but it's fine to lift it if your ankle mobility doesn't allow it comfortably.",
  },
  {
    id: "triangle-pose",
    sanskritName: "Trikonasana",
    englishName: "Triangle Pose",
    targetAreas: ["hamstrings", "hips", "spine"],
    intensity: "moderate",
    holdSeconds: 35,
    bothSides: true,
    benefit: "A standing side-body and hamstring stretch, with the added benefit of light spinal rotation — good after a day involving a lot of unilateral or rotational work.",
    instructions: [
      "Step your feet wide apart, turn your right foot out, left foot slightly in.",
      "Extend your torso sideways over your right leg, reaching your right hand toward your shin or the floor.",
      "Extend your left arm toward the ceiling, opening your chest.",
      "Hold for 5-6 breaths, then switch sides.",
    ],
    caution: "Don't force your hand to the floor — a block or your shin is fine; the priority is a long spine, not depth.",
  },
  {
    id: "bridge-pose",
    sanskritName: "Setu Bandhasana",
    englishName: "Bridge Pose",
    targetAreas: ["glutes", "hip flexors", "spine"],
    intensity: "moderate",
    holdSeconds: 35,
    bothSides: false,
    benefit: "Strengthens the glutes isometrically while stretching the hip flexors and the front of the spine — a solid counter-movement after a lot of seated time or hip-flexor-dominant training.",
    instructions: [
      "Lie on your back, knees bent, feet flat, hip-width apart, close to your glutes.",
      "Press through your feet to lift your hips toward the ceiling.",
      "Interlace your hands underneath you if comfortable, or keep palms flat.",
      "Hold for 5-6 breaths, then lower slowly.",
    ],
    caution: "Keep the lift moderate if you have any neck sensitivity — avoid turning your head while lifted.",
  },
  {
    id: "camel-pose",
    sanskritName: "Ustrasana",
    englishName: "Camel Pose",
    targetAreas: ["chest", "hip flexors", "spine"],
    intensity: "deep",
    holdSeconds: 30,
    bothSides: false,
    benefit: "A deep backbend that opens the chest, shoulders, and hip flexors more intensely than Cobra or Sphinx — a good option when you specifically want a strong front-body opener.",
    instructions: [
      "Kneel with hips stacked over knees, tuck your toes under or keep them flat.",
      "Place your hands on your lower back for support, lift your chest and lean back gently.",
      "If it feels accessible, reach back for your heels one at a time — otherwise stay upright with hands on your back.",
      "Hold for 4-5 breaths.",
    ],
    caution: "Go carefully — this is one of the more intense backbends here. Skip it if you have any lower-back or neck issues, or keep the lean shallow.",
  },
  {
    id: "bow-pose",
    sanskritName: "Dhanurasana",
    englishName: "Bow Pose",
    targetAreas: ["chest", "quadriceps", "spine"],
    intensity: "deep",
    holdSeconds: 25,
    bothSides: false,
    benefit: "Combines a quad stretch with a chest-opening backbend — an efficient two-in-one, though a demanding one.",
    instructions: [
      "Lie face down, bend your knees, reach back and hold your ankles.",
      "Kick your feet back into your hands to lift your chest and thighs off the floor.",
      "Hold for 3-5 breaths, release slowly.",
    ],
    caution: "A more intense backbend — skip or keep it small if your lower back is sensitive.",
  },
  {
    id: "half-lord-of-fishes",
    sanskritName: "Ardha Matsyendrasana",
    englishName: "Seated Half Spinal Twist",
    targetAreas: ["spine", "hips", "shoulders"],
    intensity: "moderate",
    holdSeconds: 35,
    bothSides: true,
    benefit: "An active seated twist through the whole spine — a more engaged alternative to the reclined version, since you're upright and actively rotating rather than relaxing into gravity.",
    instructions: [
      "Sit with legs extended, bend your right knee and place your right foot outside your left thigh.",
      "Place your right hand behind you, left elbow outside your right knee.",
      "Inhale to lengthen your spine, exhale to twist toward your right side.",
      "Hold for 5 breaths, then switch sides.",
    ],
    caution: "Twist from the middle back, not by yanking on the knee — ease into it rather than forcing rotation.",
  },
  {
    id: "cow-face-pose",
    sanskritName: "Gomukhasana",
    englishName: "Cow Face Pose",
    targetAreas: ["shoulders", "hips"],
    intensity: "deep",
    holdSeconds: 35,
    bothSides: true,
    benefit: "A deep, simultaneous shoulder and hip stretch — one of the more demanding poses here for people with tight shoulders, since it stretches one shoulder into external rotation and the other into internal rotation at once.",
    instructions: [
      "Sit with knees stacked, one on top of the other, feet outside opposite hips.",
      "Reach your bottom arm behind your back, palm out, and your top arm overhead, bending the elbow.",
      "Try to clasp your hands behind your back, or hold a strap/towel between them if they don't reach.",
      "Hold for 5 breaths, then switch sides.",
    ],
    caution: "Don't force the hand clasp — a gap between your hands (bridged by a towel) is completely fine and common.",
  },
  {
    id: "garland-pose",
    sanskritName: "Malasana",
    englishName: "Garland Pose (Yogi Squat)",
    targetAreas: ["hips", "ankles", "inner thighs"],
    intensity: "moderate",
    holdSeconds: 40,
    bothSides: false,
    benefit: "A deep squat hold that stretches the ankles, inner thighs, and hips — genuinely useful for anyone whose ankle mobility limits squat depth in training.",
    instructions: [
      "Stand with feet slightly wider than hip-width, toes turned out slightly.",
      "Lower into a deep squat, hips toward your heels.",
      "Bring your palms together at your chest, using your elbows to gently press your knees outward.",
      "Hold for 6-8 breaths.",
    ],
    caution: "Support your heels on a rolled towel if they lift off the floor — no need to force flat heels.",
  },
  {
    id: "chair-pose",
    sanskritName: "Utkatasana",
    englishName: "Chair Pose",
    targetAreas: ["quadriceps", "glutes", "shoulders"],
    intensity: "moderate to challenging",
    holdSeconds: 30,
    bothSides: false,
    benefit: "An isometric quad and glute hold with the arms overhead — genuinely more of a strength-endurance pose than a stretch, useful as a finisher or a way to build positional strength for squats.",
    instructions: [
      "Stand with feet together or hip-width apart.",
      "Bend your knees and lower your hips as if sitting into a chair, keeping your weight in your heels.",
      "Raise your arms overhead, palms facing each other.",
      "Hold for 5-6 breaths.",
    ],
    caution: "Keep your knees tracking over your toes, not caving inward.",
  },
  {
    id: "dolphin-pose",
    sanskritName: "Ardha Pincha Mayurasana",
    englishName: "Dolphin Pose",
    targetAreas: ["shoulders", "upper back", "hamstrings"],
    intensity: "moderate",
    holdSeconds: 35,
    bothSides: false,
    benefit: "Similar shape to Downward Dog but on the forearms — builds shoulder and upper-back strength/stability while still stretching the hamstrings, without the wrist load of Downward Dog.",
    instructions: [
      "Start on your forearms and knees, elbows under shoulders.",
      "Tuck your toes and lift your hips up and back, straightening your legs as much as feels okay.",
      "Keep your head relaxed between your arms rather than looking forward.",
      "Hold for 5-6 breaths.",
    ],
    caution: "Keep some bend in the knees if your hamstrings are tight, same as Downward Dog.",
  },
  {
    id: "corpse-pose",
    sanskritName: "Savasana",
    englishName: "Corpse Pose (Final Relaxation)",
    targetAreas: ["full body"],
    intensity: "very gentle",
    holdSeconds: 180,
    bothSides: false,
    benefit: "Complete passive rest — traditionally used to close a practice. No stretch or strength component; the value is simply lying still and breathing normally after everything else.",
    instructions: [
      "Lie flat on your back, legs relaxed and slightly apart, arms at your sides with palms up.",
      "Close your eyes and let your breathing return to normal.",
      "Stay for 3-5 minutes, resisting the urge to check the time.",
    ],
    caution: "None significant.",
  },
];

// Rough per-pose time including both sides where applicable, plus a small
// transition buffer — used to estimate total series/flow time.
const TRANSITION_BUFFER_SECONDS = 10;

export function poseDuration(pose) {
  const base = pose.bothSides ? pose.holdSeconds * 2 : pose.holdSeconds;
  return base + TRANSITION_BUFFER_SECONDS;
}

export function formatDuration(totalSeconds) {
  const minutes = Math.round(totalSeconds / 60);
  return minutes <= 1 ? "~1 min" : `~${minutes} min`;
}

export function totalDurationForPoses(poseList) {
  return poseList.reduce((sum, pose) => sum + poseDuration(pose), 0);
}

// A basic "flow" generator that spans several different body areas rather
// than repeating the same one.
export function generateQuickFlow({ count = 6 } = {}) {
  const seenAreas = new Set();
  const flow = [];
  const shuffled = [...YOGA_POSES].sort(() => Math.random() - 0.5);

  for (const pose of shuffled) {
    const newArea = pose.targetAreas.some((a) => !seenAreas.has(a));
    if (newArea || flow.length < count) {
      flow.push(pose);
      pose.targetAreas.forEach((a) => seenAreas.add(a));
    }
    if (flow.length >= count) break;
  }

  return flow;
}
