// bkit's own checkout only; never shipped (not in dist, .bkit/core, .bkit/shared or .bkit/templates).
/**
 * bkit-test-limits.mjs — the time limit for `node --test` and bats runs, taken from the Vitest
 * integration budget (`vitest.timeout-budget.ts`) so every runner bkit uses on itself shares one
 * number: 30s under CI, scaled by machine load elsewhere.
 */

import { tierTimeouts } from "../../vitest.timeout-budget.ts";

const limitMs = () => tierTimeouts(true).testTimeout;

/** `node --test` flags: a per-test limit, and exit once the tests finish even if a handle stays open. */
export const nodeTestLimitArgs = () => [`--test-timeout=${limitMs()}`, "--test-force-exit"];

/** The same limit in whole seconds, for bats' `BATS_TEST_TIMEOUT`. */
export const batsTestTimeoutSeconds = () => Math.ceil(limitMs() / 1000);
