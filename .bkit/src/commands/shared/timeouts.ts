// commands/shared/timeouts.ts — bkit-owned waits, poll intervals and stale ages.
//
// One table so a command never hard-codes a number the shell already names: the
// seven `.dev.lock` copies in the workflows typed 900 / 600 by hand although
// `bkit-ship-timeouts.sh` defined them. Units are in the name (`_S` seconds), as
// in the shell file. `timeouts.test.ts` holds this table equal to the shell file
// while both exist.

export const TIMEOUTS = {
  /** Wall-clock seconds to wait for a CI run to appear and complete after a head move. */
  SHIP_CI_WAIT_TIMEOUT_S: 1800,
  /** Seconds between CI status checks during SHIP_CI_WAIT_TIMEOUT_S. */
  SHIP_POLL_INTERVAL_S: 30,
  /** Re-validate presence probe: seconds between checks for a run at the validated head. */
  SHIP_PROBE_INTERVAL_S: 10,
  /** Re-validate presence probe: how many checks (6 x 10s = the 60s a push-triggered run needs). */
  SHIP_PROBE_ATTEMPTS: 6,
  /** A `.dev.lock` older than this many seconds is stale and may be reclaimed. */
  SHIP_DEV_LOCK_STALE_S: 900,
  /** Seconds to contend for `.dev.lock` before giving up. */
  SHIP_DEV_LOCK_ACQUIRE_DEADLINE_S: 600,
} as const;

export type TimeoutName = keyof typeof TIMEOUTS;
