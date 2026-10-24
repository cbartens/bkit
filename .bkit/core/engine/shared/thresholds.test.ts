import { describe, expect, it } from "vitest";

import { LOOP_PAUSE_THRESHOLDS, THRESHOLDS } from "./thresholds";

describe("THRESHOLDS", () => {
  it("every threshold is a non-negative integer, and every attempt cap is at least 1", () => {
    const thresholds = Object.entries(THRESHOLDS);
    expect(thresholds.length).toBeGreaterThan(0);
    expect(thresholds.filter(([, value]) => !Number.isInteger(value))).toEqual([]);
    expect(thresholds.filter(([, value]) => value < 0)).toEqual([]);
    const attemptCaps = thresholds.filter(([name]) => name !== "MAX_CHALLENGE_REMEDIATE_ATTEMPT");
    expect(attemptCaps.filter(([, value]) => value < 1)).toEqual([]);
  });

  it("every loop-pause cap names a threshold and lowers it", () => {
    const caps: Readonly<Record<string, number>> = THRESHOLDS;
    for (const [name, value] of Object.entries(LOOP_PAUSE_THRESHOLDS)) {
      expect(caps[name], name).toBeGreaterThanOrEqual(value);
    }
  });
});
