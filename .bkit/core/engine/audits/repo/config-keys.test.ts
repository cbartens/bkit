// audits/repo/config-keys.test.ts — the `bkit.*` config keys bkit's own package.json
// declares.
//
// How each key resolves (defaults, overrides, malformed values) is tested where it
// is read: shared/settings.test.ts (readBkitConfig), and the commands that
// consume it — commands/setup/setup.test.ts (capstoneJob, ciWorkflow) and
// commands/workflow/runs.test.ts (capstoneJob, ciWorkflow, shipGateRequiredLanes).

import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

const REPO_ROOT = path.resolve(__dirname, "../../../../..");

function ownBkit(): Record<string, unknown> | undefined {
  const pkg = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, "package.json"), "utf-8")) as Record<
    string,
    Record<string, unknown>
  >;
  return pkg.bkit;
}

describe("bkit's own package.json", () => {
  it("declares bkit.capstoneJob 'bkit-tests-check'", () => {
    expect(ownBkit()?.capstoneJob).toBe("bkit-tests-check");
  });

  it("declares bkit.ciWorkflow 'bkit-ci.yml'", () => {
    expect(ownBkit()?.ciWorkflow).toBe("bkit-ci.yml");
  });

  // Code 16 is opt-in (a lane whose `if:` is event-scoped cannot run pre-merge).
  it("does NOT declare bkit.shipGateRequiredLanes", () => {
    expect(ownBkit()?.shipGateRequiredLanes).toBeUndefined();
  });
});
