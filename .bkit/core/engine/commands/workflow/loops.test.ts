import { describe, expect, it } from "vitest";

import { LOOPS, fixTestStep, gatedCheckStep, loopGateStep } from "./loops.js";

describe("build fix loops", () => {
  it("loopGateStep names the gate's test-run step, per group for a grouped loop", () => {
    expect(loopGateStep(LOOPS.verify!, 2)).toBe("build-group-gate-2");
    expect(loopGateStep(LOOPS.verify!)).toBeUndefined();
    expect(loopGateStep(LOOPS.holistic!)).toBe("build-holistic-gate");
    expect(loopGateStep(LOOPS.tests!)).toBeUndefined();
  });

  it.each([
    ["build-plan-gaps-remediate", 3, "build-group-gate-3"],
    ["build-plan-gaps-remediate", undefined, undefined],
    ["build-plan-gaps-remediate-holistic", undefined, "build-holistic-gate"],
    ["build-failure-diagnose", undefined, "build-run-tests"],
    ["debug-failure-diagnose", undefined, "debug-run-tests"],
    ["build-challenge", undefined, undefined],
  ])("fixTestStep(%s, %s) is %s", (fix, group, expected) => {
    expect(fixTestStep(fix, group)).toBe(expected);
  });

  it.each([
    ["build-plan-gaps-remediate", "build-plan-verify"],
    ["build-plan-gaps-remediate-holistic", "build-plan-verify-holistic"],
    ["build-failure-diagnose", undefined],
    ["debug-failure-diagnose", undefined],
  ])("gatedCheckStep(%s) is %s: only a loop with a gate has one", (fix, expected) => {
    expect(gatedCheckStep(fix)).toBe(expected);
  });
});
