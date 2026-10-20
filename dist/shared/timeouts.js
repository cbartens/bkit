// shared/timeouts.ts — bkit-owned waits, poll intervals and stale ages.
//
// One table so no command hard-codes a wait of its own. Units are in the name
// (`_S` seconds).
export const TIMEOUTS = {
    /** Wall-clock seconds to wait for a CI run to appear and complete after a head move. */
    SHIP_CI_WAIT_TIMEOUT_S: 1800,
    /** Seconds between CI status checks during SHIP_CI_WAIT_TIMEOUT_S. */
    SHIP_POLL_INTERVAL_S: 30,
    /** Re-validate presence probe: seconds between checks for a run at the validated head. */
    SHIP_PROBE_INTERVAL_S: 10,
    /** Re-validate presence probe: how many checks (6 x 10s = the 60s a push-triggered run needs). */
    SHIP_PROBE_ATTEMPTS: 6,
    /** Every dev landing: tries at the dev push (dev moved underneath); design / plan close: at the PR merge too. */
    LAND_ATTEMPTS: 10,
    /** Seconds before the first retry of a landing; doubles each retry up to LAND_BACKOFF_CAP_S. */
    LAND_BACKOFF_START_S: 2,
    /** Longest single wait between landing retries, in seconds. */
    LAND_BACKOFF_CAP_S: 30,
    /** Seconds a registry answer for the newest published bkit is reused before asking again. */
    BKIT_LATEST_CACHE_S: 86400,
    /** Seconds a failed registry lookup is remembered, so an offline run does not wait on every call. */
    BKIT_LATEST_RETRY_S: 3600,
    /** Seconds the registry lookup may take before it counts as failed. */
    BKIT_LATEST_LOOKUP_TIMEOUT_S: 5,
};
