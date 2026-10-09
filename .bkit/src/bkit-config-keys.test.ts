// bkit-config-keys.test.ts — the `bkit.*` config keys bkit's own package.json
// declares, and that uninstall never strips.
//
// How each key resolves (defaults, overrides, malformed values) is tested where it
// is read: commands/shared/config.test.ts (readBkitConfig), and the commands that
// consume it — commands/setup/setup.test.ts (capstoneJob, ciWorkflow) and
// commands/workflow/runs.test.ts (capstoneJob, ciWorkflow, shipGateRequiredLanes).
//
// `stripManagedKeys` only consults `scripts` and `devDependencies`, so these keys
// are never removed by uninstall — asserted below.

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { stripManagedKeys } from "./bkit-package-json";

const REPO_ROOT = path.resolve(__dirname, "../..");

let tmpDir: string;
let originalCwd: string;

beforeEach(() => {
  originalCwd = process.cwd();
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-config-keys-"));
  process.chdir(tmpDir);
});

afterEach(() => {
  process.chdir(originalCwd);
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

function writePkg(content: object): void {
  fs.writeFileSync("package.json", JSON.stringify(content, null, 2) + "\n", "utf-8");
}

function readPkg(): Record<string, unknown> {
  return JSON.parse(fs.readFileSync("package.json", "utf-8")) as Record<string, unknown>;
}

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

  it("declares bkit.ciWorkflow 'ci.yml'", () => {
    expect(ownBkit()?.ciWorkflow).toBe("ci.yml");
  });

  // Code 16 is opt-in: bkit's capstone asserts its own lanes, and a lane whose `if:`
  // is event-scoped cannot run pre-merge, so naming it would refuse every PR.
  it("does NOT declare bkit.shipGateRequiredLanes", () => {
    expect(ownBkit()?.shipGateRequiredLanes).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// stripManagedKeys leaves these keys intact (consumer-value-wins, but they are
// not in the managed surface at all — scripts + devDependencies only)
// ---------------------------------------------------------------------------

describe("stripManagedKeys leaves bkit.capstoneJob / bkit.ciWorkflow intact", () => {
  it("does not remove bkit.capstoneJob even when at default value", () => {
    writePkg({
      name: "consumer",
      bkit: { capstoneJob: "bkit-tests-check", ciWorkflow: "ci.yml" },
      scripts: {},
    });
    const result = stripManagedKeys([]);
    expect(result.missingPkg).toBe(false);
    const bkit = readPkg().bkit as Record<string, unknown>;
    expect(bkit.capstoneJob).toBe("bkit-tests-check");
    expect(bkit.ciWorkflow).toBe("ci.yml");
  });

  it("preserves a consumer-tuned capstoneJob through a full module strip", () => {
    writePkg({ name: "consumer", bkit: { capstoneJob: "e2e-capstone" }, devDependencies: {} });
    const result = stripManagedKeys([]);
    expect(result.missingPkg).toBe(false);
    expect((readPkg().bkit as Record<string, unknown>).capstoneJob).toBe("e2e-capstone");
  });

  it("preserves a consumer's shipGateRequiredLanes opt-in through a full module strip", () => {
    // If a strip dropped this, a consumer who deliberately opted a lane back in
    // would silently lose the gate on the next `bkit install`/`upgrade`.
    writePkg({
      name: "consumer",
      bkit: { shipGateRequiredLanes: ["bkit-tests-unit"] },
      devDependencies: {},
    });
    const result = stripManagedKeys([]);
    expect(result.missingPkg).toBe(false);
    expect((readPkg().bkit as Record<string, unknown>).shipGateRequiredLanes).toEqual([
      "bkit-tests-unit",
    ]);
  });
});
