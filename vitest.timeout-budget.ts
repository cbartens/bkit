// vitest.timeout-budget.ts — this repo's per-test and per-hook time limits, scaled to how
// overloaded the machine is when the run starts.
//
// Mirror of a consumer's load-scaled timeout budget. The unit tier's limits
// are sampled once, when `vitest.config.ts` loads; `vitest.setup.ts` re-reads them as each test
// FILE starts, so a load ramp mid-run (a second agent session, a build) cannot starve late
// files past a stale budget. CI pins the factor to 1, so the gate stays strict there (5s unit /
// 30s integration) and a genuinely hung test still fails fast.
//
// Why it exists: both tiers spawn real subprocesses — `git`, `tsx`, the bkit CLI, fake
// binaries — so wall time is a test's CPU cost multiplied by how many runnable processes share
// each core. On a shared laptop that reads as a flaky product: `Error: Test timed out in
// 5000ms` on a DIFFERENT test each run, all green in isolation (docs/failures.jsonl
// `subprocess-integration-tests-time-out-at-5000ms-under-high-load`).
import os from "node:os";

export const UNIT_TEST_TIMEOUT_MS = 5_000;
export const INTEGRATION_TEST_TIMEOUT_MS = 30_000;
export const UNIT_HOOK_TIMEOUT_MS = 10_000;
export const MAX_LOAD_FACTOR = 6;

/**
 * How many times longer than on an idle machine a CPU-bound test takes now: load average per
 * core, never below 1, never above MAX_LOAD_FACTOR. 1 on CI and where the platform reports no
 * load average.
 */
export function loadFactor(
  loadAverage: number = os.loadavg()[0] ?? 0,
  cores: number = os.availableParallelism(),
  env: NodeJS.ProcessEnv = process.env,
): number {
  // CI keeps the strict gate: a runner is a machine we size, so a test that takes longer there
  // is slow, not starved. Only a shared laptop's load scales the limits.
  if (env.CI === "true" || env.CI === "1") return 1;
  const measured =
    !Number.isFinite(loadAverage) || !Number.isFinite(cores) || cores < 1 ? 0 : loadAverage / cores;
  // A runner that plans its own parallel load exports the per-core figure it fits; the reading
  // above alone sees a quiet machine before that load has built up.
  const planned = Number(env.UNIT_PLANNED_LOAD_PER_CORE);
  return Math.min(MAX_LOAD_FACTOR, Math.max(1, measured, Number.isFinite(planned) ? planned : 0));
}

/**
 * `testTimeout` and `hookTimeout` for a test file, scaled by `factor`. `integration` picks the
 * 30s integration base over the 5s / 10s unit base.
 */
export function tierTimeouts(
  integration: boolean,
  factor: number = loadFactor(),
): { testTimeout: number; hookTimeout: number } {
  return {
    testTimeout: Math.ceil(
      (integration ? INTEGRATION_TEST_TIMEOUT_MS : UNIT_TEST_TIMEOUT_MS) * factor,
    ),
    hookTimeout: Math.ceil(
      (integration ? INTEGRATION_TEST_TIMEOUT_MS : UNIT_HOOK_TIMEOUT_MS) * factor,
    ),
  };
}

/**
 * The unit tier's budget for the config, scaled by `factor`. Logs one line per config load when
 * the factor is above 1, so a timeout under load can be read against the budget in force.
 */
export function unitTimeouts(factor: number = loadFactor()): {
  testTimeout: number;
  hookTimeout: number;
} {
  const budget = tierTimeouts(false, factor);
  if (factor > 1) {
    console.warn(
      `[test-timeout-budget] load average ${os.loadavg()[0]?.toFixed(1)} on ${os.availableParallelism()} cores: ` +
        `unit limits ${budget.testTimeout}ms per test, ${budget.hookTimeout}ms per hook (x${factor.toFixed(2)})`,
    );
  }
  return budget;
}
