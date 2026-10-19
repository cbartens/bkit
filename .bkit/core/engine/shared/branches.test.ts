// shared/branches.test.ts — Unit tests for the shared-branch rule.

import { describe, expect, it } from "vitest";
import { DEV, SHARED_BRANCHES, isSharedBranch } from "./branches";

describe("shared/branches", () => {
  it("names dev as the integration branch and dev + main as the shared branches", () => {
    expect(DEV).toBe("dev");
    expect([...SHARED_BRANCHES].sort()).toEqual(["dev", "main"]);
  });

  it("isSharedBranch is true for dev and main", () => {
    expect(isSharedBranch("dev")).toBe(true);
    expect(isSharedBranch("main")).toBe(true);
  });

  it("isSharedBranch is false for any other name, including look-alikes and the empty string", () => {
    for (const branch of ["feat/x", "devel", "develop", "Main", "origin/dev", "dev ", ""]) {
      expect(isSharedBranch(branch)).toBe(false);
    }
  });
});
