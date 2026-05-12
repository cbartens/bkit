import { describe, expect, it } from "vitest";

import { type Step, validateInvariants } from "./bkit-status";

describe("status.json invariants", () => {
  const base: Step = {
    step: "verify-plan",
    status: "DONE",
    at: "2026-04-28T07:33:00Z",
    parentSha: "a1b2c3d",
    artifacts: [],
  };

  it("PASS + failures=0 valid", () => {
    expect(validateInvariants({ ...base, verdict: "PASS", failures: 0 }).ok).toBe(true);
  });
  it("PASS + failures>0 rejected", () => {
    expect(validateInvariants({ ...base, verdict: "PASS", failures: 3 }).ok).toBe(false);
  });
  it("FAIL + failures>0 valid", () => {
    expect(validateInvariants({ ...base, verdict: "FAIL", failures: 3 }).ok).toBe(true);
  });
  it("FAIL + failures=0 rejected", () => {
    expect(validateInvariants({ ...base, verdict: "FAIL", failures: 0 }).ok).toBe(false);
  });
  it("CONCERNS + failures=0 valid", () => {
    expect(validateInvariants({ ...base, verdict: "CONCERNS", failures: 0 }).ok).toBe(true);
  });
  it("CONCERNS + failures>0 valid", () => {
    expect(validateInvariants({ ...base, verdict: "CONCERNS", failures: 2 }).ok).toBe(true);
  });
  it("plumbing step (no verdict) valid", () => {
    expect(validateInvariants({ ...base, step: "start-workflow" }).ok).toBe(true);
  });
});
