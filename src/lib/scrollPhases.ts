// The services "split" moment: while raw scroll keeps advancing, the camera
// freezes in place and the light trail fans out across the screen into three
// stops (left / center / right); keep scrolling and the branches merge back
// into one, then the flight resumes. World-driven motion (camera, trail
// head, traveling light) therefore runs on a remapped "world progress" that
// pauses inside this window while the raw scroll drives the split itself.

export const SPLIT_START = 0.36;
export const SPLIT_END = 0.56;

export function getWorldProgress(progress: number): number {
  const p = Math.min(1, Math.max(0, progress));
  if (p <= SPLIT_START) return p;
  if (p <= SPLIT_END) return SPLIT_START;
  // Compress the remaining scroll so the journey still completes at p=1.
  return SPLIT_START + ((p - SPLIT_END) * (1 - SPLIT_START)) / (1 - SPLIT_END);
}

/** 0..1 phase inside the split window (0 before, 1 after). */
export function getSplitPhase(progress: number): number {
  return Math.min(1, Math.max(0, (progress - SPLIT_START) / (SPLIT_END - SPLIT_START)));
}

// Sub-phases of the split: branches extend, hold (apps clickable), retract.
export const SPLIT_EXTEND_END = 0.28;
export const SPLIT_RETRACT_START = 0.74;

/** 0..1 how far the branches are extended at this phase. */
export function getBranchGrowth(splitPhase: number): number {
  if (splitPhase <= 0 || splitPhase >= 1) return 0;
  if (splitPhase < SPLIT_EXTEND_END) {
    const t = splitPhase / SPLIT_EXTEND_END;
    return t * t * (3 - 2 * t);
  }
  if (splitPhase > SPLIT_RETRACT_START) {
    const t = (splitPhase - SPLIT_RETRACT_START) / (1 - SPLIT_RETRACT_START);
    const eased = t * t * (3 - 2 * t);
    return 1 - eased;
  }
  return 1;
}
