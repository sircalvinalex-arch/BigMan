// weekInsights.js
//
// Plain-language explanation of what a given week of a mesocycle is
// actually doing, and why — based on the SRA (Stimulus, Recovery,
// Adaptation) and fatigue-management framework from RP's "Scientific
// Principles of Hypertrophy Training." This is written in my own words
// throughout, not quoted or closely paraphrased from that book.
//
// Core idea in plain terms: each week nudges the balance between two
// competing things — the training STIMULUS (which drives adaptation) and
// the FATIGUE it costs you (which needs to be paid down before it
// outweighs the benefit). Early weeks bank fitness cheaply; later weeks
// spend recovery capacity faster than they build it, which is exactly why
// a deload has to come before that debt catches up with you.

export function getWeekInsight(week, totalWeeks, track) {
  const { weekIndex, isDeload } = week;

  if (isDeload) {
    return {
      phase: "Deload",
      summary: "Fatigue dissipation week — volume and effort intentionally drop so your body catches up on recovery.",
      detail:
        "By this point in the block, you've been accumulating fatigue faster than you've been dissipating it — that's normal and intentional, not a sign anything went wrong. This week deliberately trades away training stimulus (fewer sets, more reps in reserve) to let recovery catch up. The strength and size you built over the last few weeks were mostly earned already; this week is about being fresh enough to actually express and keep it, not about adding more.",
    };
  }

  const progress = totalWeeks <= 2 ? 1 : weekIndex / (totalWeeks - 1); // 0 at week 1, ~1 at the last non-deload week

  if (progress < 0.34) {
    return {
      phase: "Accumulation start",
      summary: "Volume starts near your minimum effective dose — enough stimulus to trigger adaptation without much fatigue cost.",
      detail:
        "This early in the block, sets are deliberately kept modest and reps in reserve stay relatively high (you're stopping sets a few reps short of failure). The goal isn't to push hard yet — it's to introduce enough training stimulus to start the adaptation process cheaply, while your fatigue is still low from the last deload. Pushing harder than this now wouldn't meaningfully speed up results; it would just spend recovery capacity you'll want later in the block.",
    };
  }

  if (progress < 0.7) {
    return {
      phase: "Accumulation, ramping",
      summary: "Volume and effort are climbing — you're now trading more fatigue for more stimulus on purpose.",
      detail:
        "Sets per muscle group are increasing and reps in reserve are dropping, meaning sets are getting closer to failure. This is the block doing its actual job: your first couple of weeks built a base without much cost, and now the plan is spending down some of that low-fatigue headroom to push adaptation further. Expect sessions to start feeling noticeably harder than week one, even though your working weights may not have jumped much yet — that's fatigue accumulating as designed, not a sign of doing something wrong.",
    };
  }

  return {
    phase: "Peak week",
    summary: "Volume and intensity of effort are at or near their highest point for this block, right before the deload.",
    detail:
      "This is the most demanding week of the mesocycle on purpose — sets are near your estimated recoverable ceiling and reps in reserve are low (working close to failure). You're not expected to feel fresh; the whole point of a mesocycle is to push into meaningful fatigue right before backing off, because that combination of stimulus and subsequent recovery is what drives the adaptation. If this week feels genuinely brutal, that's the plan working as intended — the deload immediately after this is what turns this fatigue into progress instead of burnout.",
  };
}

// One-line summary suitable for a compact UI (e.g. next to a week header),
// separate from the fuller explanation above.
export function getWeekPhaseLabel(week, totalWeeks) {
  return getWeekInsight(week, totalWeeks).phase;
}
