// vitest.timeout-budget.ts — this repo's per-test and per-hook time limits.
//
// Two settings, no load reading:
//   - CI (`CI=true` or `CI=1`): the strict bases below (5s test / 10s hook unit, 30s integration),
//     so a genuinely hung test still fails fast on a runner we size.
//   - Everywhere else: a fixed LOCAL_HANG_FACTOR (6) times those bases. A test that takes longer
//     than that is hung, not starved by a busy laptop.
//
// Why a multiple at all: both tiers spawn real subprocesses — `git`, `tsx`, the bkit CLI, fake
// binaries — so on a shared laptop a test can take several times its idle wall time.
// A fixed multiple keeps the limit the same on every run and reads nothing from the machine.

export const UNIT_TEST_TIMEOUT_MS = 5_000;
export const INTEGRATION_TEST_TIMEOUT_MS = 30_000;
export const UNIT_HOOK_TIMEOUT_MS = 10_000;
export const LOCAL_HANG_FACTOR = 6;

/** Env var vitest.setup.ts fills with the factor, before it clears `CI` for the tests. */
export const LIMIT_FACTOR_ENV = "BKIT_LIMIT_FACTOR";

/** 1 when `env` carries CI (`CI=true` or `CI=1`), else LOCAL_HANG_FACTOR. Reads `CI` only. */
export function ciLimitFactor(env: NodeJS.ProcessEnv = process.env): number {
  return env.CI === "true" || env.CI === "1" ? 1 : LOCAL_HANG_FACTOR;
}

/**
 * The factor now: 1 under CI (`CI=true` or `CI=1`), else the factor the setup recorded before it
 * cleared `CI` (so a test file under CI still reads 1), else LOCAL_HANG_FACTOR.
 */
export function limitFactor(env: NodeJS.ProcessEnv = process.env): number {
  if (env.CI === "true" || env.CI === "1") return 1;
  const recorded = Number(env[LIMIT_FACTOR_ENV]);
  return recorded === 1 ? 1 : LOCAL_HANG_FACTOR;
}

/** A limit a test file sets itself, in ms: unchanged under CI, LOCAL_HANG_FACTOR times it elsewhere. */
export function localLimit(ms: number, factor: number = limitFactor()): number {
  return Math.ceil(ms * factor);
}

/**
 * `testTimeout` and `hookTimeout` for a test file, scaled by `factor`. `integration` picks the
 * 30s integration base over the 5s / 10s unit base.
 */
export function tierTimeouts(
  integration: boolean,
  factor: number = limitFactor(),
): { testTimeout: number; hookTimeout: number } {
  return {
    testTimeout: localLimit(
      integration ? INTEGRATION_TEST_TIMEOUT_MS : UNIT_TEST_TIMEOUT_MS,
      factor,
    ),
    hookTimeout: localLimit(
      integration ? INTEGRATION_TEST_TIMEOUT_MS : UNIT_HOOK_TIMEOUT_MS,
      factor,
    ),
  };
}

/** The unit tier's budget for the config, scaled by `factor`. */
export function unitTimeouts(factor: number = limitFactor()): {
  testTimeout: number;
  hookTimeout: number;
} {
  return tierTimeouts(false, factor);
}
