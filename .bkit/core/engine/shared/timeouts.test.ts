import { describe, expect, it } from "vitest";

import { TIMEOUTS } from "./timeouts";

describe("TIMEOUTS", () => {
  it("every wait is a positive whole number of seconds", () => {
    for (const [name, v] of Object.entries(TIMEOUTS)) {
      expect(Number.isInteger(v) && v > 0, name).toBe(true);
    }
  });

  it("the re-validate probe keeps the 60s a push-triggered run needs to show up", () => {
    expect(TIMEOUTS.SHIP_PROBE_ATTEMPTS * TIMEOUTS.SHIP_PROBE_INTERVAL_S).toBeGreaterThanOrEqual(
      60,
    );
  });
});
