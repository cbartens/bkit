import { describe, expect, it } from "vitest";

import { TIMEOUTS } from "./timeouts";

describe("TIMEOUTS", () => {
  it("every wait is a positive whole number of seconds", () => {
    for (const [name, v] of Object.entries(TIMEOUTS)) {
      expect(Number.isInteger(v), name).toBe(true);
      expect(v, name).toBeGreaterThan(0);
    }
  });

  it("the re-validate probe keeps the 60s a push-triggered run needs to show up", () => {
    expect(TIMEOUTS.SHIP_PROBE_ATTEMPTS * TIMEOUTS.SHIP_PROBE_INTERVAL_S).toBeGreaterThanOrEqual(
      60,
    );
  });

  it("a close's retry wait starts below its cap", () => {
    expect(TIMEOUTS.LAND_BACKOFF_START_S).toBeLessThan(TIMEOUTS.LAND_BACKOFF_CAP_S);
  });
});
