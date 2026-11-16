// The build fix loops, and the step whose test-run rows judge each fix round.
// Kept apart from decisions.ts and status.ts so both can import it without an import cycle.

export interface FixLoop {
  /** The loop question's title in a decision file. */
  title: string;
  /** The step that counts the loop's problems. */
  check: string;
  /** The step that fixes them. */
  fix: string;
  /** The `build {point}: attempt` line's name. */
  point: string;
  /** Only the rounds after the check's last clean round count: the loop reopens. */
  sinceClean?: true;
  /** The gate's test-run step (prefix for a grouped loop): its failing tests join each round's count. */
  gate?: string;
  /** The gate's name in the decision file's progress lines. */
  gateTitle?: string;
  /** The gate runs per task group: its test-run step is `{gate}-{group}`. */
  grouped?: true;
}

export const LOOPS: Readonly<Record<string, FixLoop>> = {
  verify: {
    title: "Verify",
    check: "build-plan-verify",
    fix: "build-plan-gaps-remediate",
    point: "verify",
    gate: "build-group-gate",
    gateTitle: "Group gate",
    grouped: true,
  },
  // The whole-feature check reopens after each clean round, so its loop starts there. Its allowance is `build.holistic`.
  holistic: {
    title: "Holistic verify",
    check: "build-plan-verify-holistic",
    fix: "build-plan-gaps-remediate-holistic",
    point: "holistic",
    sinceClean: true,
    gate: "build-holistic-gate",
    gateTitle: "Holistic gate",
  },
  tests: {
    title: "Tests",
    check: "build-run-tests",
    fix: "build-failure-diagnose",
    point: "tests",
  },
};

/** Fix steps outside the build loops, and the test step each one's rounds are judged by. */
const OTHER_FIX_TESTS: Readonly<Record<string, string>> = {
  "debug-failure-diagnose": "debug-run-tests",
};

/**
 * The test-run step a loop's gate writes: the gate, with `-{group}` appended for a grouped
 * loop. Undefined for a loop with no gate, or a grouped loop given no group.
 */
export function loopGateStep(loop: FixLoop, group?: number): string | undefined {
  if (loop.gate === undefined) return undefined;
  if (loop.grouped !== true) return loop.gate;
  return group === undefined ? undefined : `${loop.gate}-${group}`;
}

/**
 * The step whose test-run rows show what a fix step's rounds left failing: the loop's gate
 * (with the group for a grouped loop), else its check; `debug-failure-diagnose` gives
 * `debug-run-tests`. Undefined for any other step, or a grouped loop given no group.
 */
export function fixTestStep(fix: string, group?: number): string | undefined {
  const other = OTHER_FIX_TESTS[fix];
  if (other !== undefined) return other;
  const loop = Object.values(LOOPS).find((l) => l.fix === fix);
  if (loop === undefined) return undefined;
  return loop.gate === undefined ? loop.check : loopGateStep(loop, group);
}

/**
 * The check step whose current attempt a fix step's round follows, for a loop whose gate
 * does not run on every round: the gate's newest row can belong to an older attempt.
 * Undefined for a loop with no gate, whose test step is the check itself.
 */
export function gatedCheckStep(fix: string): string | undefined {
  const loop = Object.values(LOOPS).find((l) => l.fix === fix);
  return loop?.gate === undefined ? undefined : loop.check;
}
