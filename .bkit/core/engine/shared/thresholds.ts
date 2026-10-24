// shared/thresholds.ts — the MAX_* caps every workflow routes on, by name.
//
// One table read by `bkit counters max|route` and by `bkit status route`.

/** Every MAX_* threshold the workflows route on. */
export const THRESHOLDS = {
  // build
  MAX_VERIFY_ATTEMPT: 3,
  MAX_TEST_ATTEMPT: 3,
  MAX_CHALLENGE_REMEDIATE_ATTEMPT: 1,
  // debug — mode-matched pairs
  MAX_DEBUG_ATTEMPT: 3,
  MAX_NORMAL_ATTEMPT: 3,
  MAX_SOAK_ATTEMPT: 3,
  // ship
  MAX_MERGE_ATTEMPT: 3,
  /** gate-refusal (10/11/14) poll-only re-entries into the sweep step */
  MAX_REVALIDATE_ATTEMPT: 3,
  // bkit-cloud.yml
  /** distinct failed dev CI SHAs per FID that may each dispatch a debug run */
  MAX_DEV_DISPATCH_ATTEMPTS: 3,
} as const satisfies Readonly<Record<string, number>>;

/**
 * Fix-loop caps `bkit.loopPause` (default on) lowers to one round. Running out then
 * routes to `--exceeded-paused`, where the owner decides whether another round runs.
 */
export const LOOP_PAUSE_THRESHOLDS: Readonly<Record<string, number>> = {
  MAX_VERIFY_ATTEMPT: 1,
  MAX_TEST_ATTEMPT: 1,
  MAX_MERGE_ATTEMPT: 1,
};
