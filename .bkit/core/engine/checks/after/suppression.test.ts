// checks/after/suppression.test.ts — Unit tests for the per-package advisory opt-out
// (`package.json` `bkit.ignoreAdvisories`).

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { ignoredAdvisoryIds, isAdvisorySuppressed } from "./suppression";

let tmpDir: string;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-suppression-test-"));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

/** Write `dir/package.json` from a JS value, or a raw string when it must be invalid JSON. */
function writePkg(pkg: unknown, dir: string = tmpDir): void {
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(
    path.join(dir, "package.json"),
    typeof pkg === "string" ? pkg : JSON.stringify(pkg),
  );
}

describe("ignoredAdvisoryIds", () => {
  it("returns no ids when package.json is absent", () => {
    expect([...ignoredAdvisoryIds(tmpDir)]).toEqual([]);
  });
  it("returns no ids when package.json is not JSON", () => {
    writePkg("{ not json");
    expect([...ignoredAdvisoryIds(tmpDir)]).toEqual([]);
  });
  it("returns no ids when the bkit key is absent", () => {
    writePkg({ name: "a", scripts: { test: "vitest" } });
    expect([...ignoredAdvisoryIds(tmpDir)]).toEqual([]);
  });
  it("returns no ids when bkit is not an object", () => {
    writePkg({ bkit: "nope" });
    expect([...ignoredAdvisoryIds(tmpDir)]).toEqual([]);
  });
  it("returns no ids when bkit is an array", () => {
    writePkg({ bkit: ["tagged-tests-no-ci-home"] });
    expect([...ignoredAdvisoryIds(tmpDir)]).toEqual([]);
  });
  it("returns no ids when ignoreAdvisories is not an array", () => {
    writePkg({ bkit: { ignoreAdvisories: "tagged-tests-no-ci-home" } });
    expect([...ignoredAdvisoryIds(tmpDir)]).toEqual([]);
  });
  it("returns the ids of a valid array", () => {
    writePkg({ bkit: { ignoreAdvisories: ["tagged-tests-no-ci-home", "x"] } });
    expect([...ignoredAdvisoryIds(tmpDir)].sort()).toEqual(["tagged-tests-no-ci-home", "x"]);
  });
  it("drops non-string entries", () => {
    writePkg({ bkit: { ignoreAdvisories: ["a", 1, null, { b: 2 }] } });
    expect([...ignoredAdvisoryIds(tmpDir)]).toEqual(["a"]);
  });
  it("reads the given package directory, not the cwd", () => {
    const nested = path.join(tmpDir, "tooling", "eslint");
    writePkg({ bkit: { ignoreAdvisories: ["tagged-tests-no-ci-home"] } }, nested);
    expect([...ignoredAdvisoryIds(nested)]).toEqual(["tagged-tests-no-ci-home"]);
    expect([...ignoredAdvisoryIds(tmpDir)]).toEqual([]);
  });
});

describe("isAdvisorySuppressed", () => {
  it("is true for an advisory whose id is listed", () => {
    writePkg({ bkit: { ignoreAdvisories: ["tagged-tests-no-ci-home"] } });
    expect(isAdvisorySuppressed(tmpDir, "tagged-tests-no-ci-home", "advisory")).toBe(true);
  });
  it("is false for an advisory whose id is not listed", () => {
    writePkg({ bkit: { ignoreAdvisories: ["tagged-tests-no-ci-home"] } });
    expect(isAdvisorySuppressed(tmpDir, "test-integration-env-not-asserted", "advisory")).toBe(
      false,
    );
  });
  it("is false for a blocker even when its id is listed", () => {
    writePkg({ bkit: { ignoreAdvisories: ["bkit-managed-stale"] } });
    expect(isAdvisorySuppressed(tmpDir, "bkit-managed-stale", "blocker")).toBe(false);
  });
});
