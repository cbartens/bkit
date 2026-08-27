// bkit-config-keys.test.ts — #384 SP1 T1 — config surface contract.
//
// Asserts the bkit.ship-related config keys resolve as documented in
// `docs/plans/202607/384-ship-bookkeeping-plan-1.md` Task 1:
//   - bkit.capstoneJob (default "bkit-tests-check") — read by bkit-protect-main.sh
//     and the bkit-ship-gate.sh merge gate (SP1 T4).
//   - bkit.ciWorkflow (default "ci.yml") — read by the gate's run-selection query.
//
// Both keys live under `bkit.*` in package.json. `stripManagedKeys` only consults
// `scripts` and `devDependencies` (see bkit-package-json.ts:81-119), so these
// keys are NEVER removed by uninstall — this test asserts that property too.

import { execFileSync } from "node:child_process";
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

// ---------------------------------------------------------------------------
// bkit.capstoneJob
// ---------------------------------------------------------------------------

describe("bkit.capstoneJob", () => {
  it("bkit's own package.json declares the default 'bkit-tests-check'", () => {
    const pkgPath = path.join(REPO_ROOT, "package.json");
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8")) as Record<
      string,
      Record<string, unknown>
    >;
    expect(pkg.bkit?.capstoneJob).toBe("bkit-tests-check");
  });

  it("defaults to 'bkit-tests-check' via the jq read bkit-protect-main.sh uses", () => {
    writePkg({ name: "consumer", bkit: {} });
    const resolved = execFileSync(
      "jq",
      ["-r", '.bkit.capstoneJob // "bkit-tests-check"', "package.json"],
      { encoding: "utf-8" },
    ).trim();
    expect(resolved).toBe("bkit-tests-check");
  });

  it("resolves a consumer override (single-job repo adopting the capstone later)", () => {
    writePkg({ name: "single-job", bkit: { capstoneJob: "build" } });
    const resolved = execFileSync(
      "jq",
      ["-r", '.bkit.capstoneJob // "bkit-tests-check"', "package.json"],
      { encoding: "utf-8" },
    ).trim();
    expect(resolved).toBe("build");
  });
});

// ---------------------------------------------------------------------------
// bkit.ciWorkflow
// ---------------------------------------------------------------------------

describe("bkit.ciWorkflow", () => {
  it("bkit's own package.json declares the default 'ci.yml'", () => {
    const pkgPath = path.join(REPO_ROOT, "package.json");
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8")) as Record<
      string,
      Record<string, unknown>
    >;
    expect(pkg.bkit?.ciWorkflow).toBe("ci.yml");
  });

  it("defaults to 'ci.yml' via the jq read the gate's run-selection query uses", () => {
    writePkg({ name: "consumer", bkit: {} });
    const resolved = execFileSync("jq", ["-r", '.bkit.ciWorkflow // "ci.yml"', "package.json"], {
      encoding: "utf-8",
    }).trim();
    expect(resolved).toBe("ci.yml");
  });

  it("resolves a consumer override (repo whose CI workflow is named differently)", () => {
    writePkg({ name: "alt", bkit: { ciWorkflow: "validation.yml" } });
    const resolved = execFileSync("jq", ["-r", '.bkit.ciWorkflow // "ci.yml"', "package.json"], {
      encoding: "utf-8",
    }).trim();
    expect(resolved).toBe("validation.yml");
  });
});

// ---------------------------------------------------------------------------
// bkit.shipGateRequiredLanes — the opt-in surface for ship-gate code 16.
//
// Code 16 refuses a merge when a NAMED lane concluded `skipped`. It is opt-in
// because a blanket refuse-on-any-skip is unsatisfiable for bkit's own CI shape:
// a lane whose `if:` is event-scoped (native builds, `@live` on push to dev)
// cannot run pre-merge at all, so demanding it refuses every PR forever.
// The resolution below must therefore degrade to EMPTY on absent/malformed
// input — an accidental refusal here blocks every ship in the consumer repo.
// ---------------------------------------------------------------------------

describe("bkit.shipGateRequiredLanes", () => {
  const JQ_READ =
    '(.bkit.shipGateRequiredLanes // []) | if type == "array" then map(select(type == "string")) | join(",") else "" end';

  it("absent key resolves to the empty list (default: trust the capstone, never refuse)", () => {
    writePkg({ name: "consumer", bkit: {} });
    const resolved = execFileSync("jq", ["-r", JQ_READ, "package.json"], {
      encoding: "utf-8",
    }).trim();
    expect(resolved).toBe("");
  });

  it("resolves a declared lane list to the comma-separated form the gate consumes", () => {
    writePkg({
      name: "consumer",
      bkit: { shipGateRequiredLanes: ["bkit-tests-unit", "bkit-tests-static"] },
    });
    const resolved = execFileSync("jq", ["-r", JQ_READ, "package.json"], {
      encoding: "utf-8",
    }).trim();
    expect(resolved).toBe("bkit-tests-unit,bkit-tests-static");
  });

  it("a malformed value (string where an array belongs) degrades to empty, not to a jq error", () => {
    writePkg({ name: "consumer", bkit: { shipGateRequiredLanes: "bkit-tests-unit" } });
    const resolved = execFileSync("jq", ["-r", JQ_READ, "package.json"], {
      encoding: "utf-8",
    }).trim();
    expect(resolved).toBe("");
  });

  it("drops non-string entries rather than emitting them as lane names", () => {
    writePkg({ name: "consumer", bkit: { shipGateRequiredLanes: ["bkit-tests-unit", 42, null] } });
    const resolved = execFileSync("jq", ["-r", JQ_READ, "package.json"], {
      encoding: "utf-8",
    }).trim();
    expect(resolved).toBe("bkit-tests-unit");
  });

  it("bkit's own package.json does NOT declare it — bkit's capstone asserts its own lanes", () => {
    const pkgPath = path.join(REPO_ROOT, "package.json");
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8")) as Record<
      string,
      Record<string, unknown>
    >;
    expect(pkg.bkit?.shipGateRequiredLanes).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// stripManagedKeys leaves both keys intact (consumer-value-wins, but these
// keys are not in the managed surface at all — scripts + devDependencies only)
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
    const pkg = readPkg();
    const bkit = pkg.bkit as Record<string, unknown>;
    expect(bkit.capstoneJob).toBe("bkit-tests-check");
    expect(bkit.ciWorkflow).toBe("ci.yml");
  });

  it("preserves a consumer-tuned capstoneJob through a full module strip", () => {
    writePkg({
      name: "consumer",
      bkit: { capstoneJob: "e2e-capstone" },
      devDependencies: {},
    });
    const result = stripManagedKeys([]);
    expect(result.missingPkg).toBe(false);
    const pkg = readPkg();
    const bkit = pkg.bkit as Record<string, unknown>;
    expect(bkit.capstoneJob).toBe("e2e-capstone");
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
    const pkg = readPkg();
    const bkit = pkg.bkit as Record<string, unknown>;
    expect(bkit.shipGateRequiredLanes).toEqual(["bkit-tests-unit"]);
  });
});

// ---------------------------------------------------------------------------
// bkit-protect-main.sh contract — reads bkit.capstoneJob, not the literal
// ---------------------------------------------------------------------------

describe("bkit-protect-main.sh reads bkit.capstoneJob via jq (not the literal)", () => {
  const SCRIPTS = [
    ".bkit/scripts/bkit-protect-main.sh",
    ".bkit/templates/.bkit/scripts/bkit-protect-main.sh",
  ];

  for (const rel of SCRIPTS) {
    it(`${rel} has no REQUIRED_JOB="bkit-tests-check" literal assignment`, () => {
      const script = fs.readFileSync(path.join(REPO_ROOT, rel), "utf-8");
      // The hard-coded assignment must be gone — it has been replaced by a jq read.
      expect(script).not.toMatch(/^\s*REQUIRED_JOB="bkit-tests-check"\s*$/m);
    });

    it(`${rel} reads bkit.capstoneJob via jq with the default fallback`, () => {
      const script = fs.readFileSync(path.join(REPO_ROOT, rel), "utf-8");
      expect(script).toMatch(/jq\s+-r\s+['"]\.bkit\.capstoneJob\s*\/\/\s*"bkit-tests-check"['"]/);
    });
  }
});
