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

function ownTesting(): Record<string, unknown> | undefined {
  const pkg = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, "package.json"), "utf-8")) as {
    bkit?: { testing?: Record<string, unknown> };
  };
  return pkg.bkit?.testing;
}

describe("bkit's own package.json", () => {
  it("declares bkit.testing.ciCapstone 'bkit-tests-check'", () => {
    expect(ownTesting()?.ciCapstone).toBe("bkit-tests-check");
  });

  it("declares bkit.testing.ciWorkflow 'bkit-ci.yml'", () => {
    expect(ownTesting()?.ciWorkflow).toBe("bkit-ci.yml");
  });

  // Code 16 is opt-in (a lane whose `if:` is event-scoped cannot run pre-merge).
  // Install seeds `[]`, which reads the same as absent: the capstone's green decides.
  it("declares no bkit.testing.shipGate lane", () => {
    expect([undefined, []]).toContainEqual(ownTesting()?.shipGate);
  });
});
