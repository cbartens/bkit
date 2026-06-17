// bkit-package-json.test.ts — P2.T4 — stripManagedKeys tests.
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { stripManagedKeys } from "./bkit-package-json";

let tmpDir: string;
let originalCwd: string;

beforeEach(() => {
  originalCwd = process.cwd();
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-pkgjson-test-"));
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
// Error conditions
// ---------------------------------------------------------------------------

describe("stripManagedKeys — error conditions", () => {
  it("returns missingPkg=true when package.json is absent", () => {
    const result = stripManagedKeys(["lint"]);
    expect(result.missingPkg).toBe(true);
    expect(result.removedScripts).toEqual([]);
  });

  it("returns malformed=true when package.json is invalid JSON", () => {
    fs.writeFileSync("package.json", "{ not valid", "utf-8");
    const result = stripManagedKeys(["lint"]);
    expect(result.malformed).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Default script removal
// ---------------------------------------------------------------------------

describe("stripManagedKeys — default script removal", () => {
  it("removes lint:slop script when value matches bkit default", () => {
    writePkg({
      name: "test",
      scripts: {
        "lint:slop": "slop-scan scan .",
        build: "tsc",
      },
    });

    const result = stripManagedKeys(["lint"]);
    expect(result.removedScripts).toContain("lint:slop");
    expect(result.preservedScripts).not.toContain("lint:slop");

    const pkg = readPkg();
    const scripts = pkg.scripts as Record<string, string>;
    expect(scripts).not.toHaveProperty("lint:slop");
    expect(scripts).toHaveProperty("build"); // consumer script preserved
  });

  it("removes format:check script when value matches bkit default", () => {
    writePkg({
      name: "test",
      scripts: {
        "format:check": "prettier --check .",
      },
    });

    const result = stripManagedKeys(["lint"]);
    expect(result.removedScripts).toContain("format:check");
  });

  it("removes prepare script when value matches bkit default (husky)", () => {
    writePkg({
      name: "test",
      scripts: {
        prepare: "husky",
        build: "tsc",
      },
    });

    const result = stripManagedKeys(["git-hooks"]);
    expect(result.removedScripts).toContain("prepare");

    const pkg = readPkg();
    const scripts = pkg.scripts as Record<string, string>;
    expect(scripts).not.toHaveProperty("prepare");
    expect(scripts).toHaveProperty("build"); // consumer script preserved
  });
});

// ---------------------------------------------------------------------------
// Consumer-customised values preserved
// ---------------------------------------------------------------------------

describe("stripManagedKeys — consumer value preserved", () => {
  it("preserves consumer-customised lint:slop when value differs from default", () => {
    writePkg({
      name: "test",
      scripts: {
        "lint:slop": "slop-scan scan . --custom-flag",
      },
    });

    const result = stripManagedKeys(["lint"]);
    expect(result.preservedScripts).toContain("lint:slop");
    expect(result.removedScripts).not.toContain("lint:slop");

    const pkg = readPkg();
    const scripts = pkg.scripts as Record<string, string>;
    expect(scripts["lint:slop"]).toBe("slop-scan scan . --custom-flag");
  });

  it("preserves consumer-customised prepare script (e.g. husky install)", () => {
    writePkg({
      name: "test",
      scripts: {
        prepare: "husky install", // legacy form — consumer chose it
      },
    });

    const result = stripManagedKeys(["git-hooks"]);
    expect(result.preservedScripts).toContain("prepare");
    expect(result.removedScripts).not.toContain("prepare");
  });
});

// ---------------------------------------------------------------------------
// devDependency removal
// ---------------------------------------------------------------------------

describe("stripManagedKeys — devDependency removal", () => {
  it("removes prettier devDep when spec matches bkit default", () => {
    writePkg({
      name: "test",
      devDependencies: {
        prettier: "^3.5.3",
        typescript: "^5.4.0",
      },
    });

    const result = stripManagedKeys(["lint"]);
    expect(result.removedDevDeps).toContain("prettier");
    expect(result.preservedDevDeps).not.toContain("prettier");

    const pkg = readPkg();
    const devDeps = pkg.devDependencies as Record<string, string>;
    expect(devDeps).not.toHaveProperty("prettier");
    expect(devDeps).toHaveProperty("typescript"); // consumer dep preserved
  });

  it("preserves prettier devDep when consumer has custom version pin", () => {
    writePkg({
      name: "test",
      devDependencies: {
        prettier: "3.2.0", // custom pin, not bkit default
      },
    });

    const result = stripManagedKeys(["lint"]);
    expect(result.preservedDevDeps).toContain("prettier");
    expect(result.removedDevDeps).not.toContain("prettier");
  });

  it("removes husky devDep when spec matches bkit default", () => {
    writePkg({
      name: "test",
      devDependencies: {
        husky: "^9.1.7",
      },
    });

    const result = stripManagedKeys(["git-hooks"]);
    expect(result.removedDevDeps).toContain("husky");
  });
});

// ---------------------------------------------------------------------------
// dryRun mode
// ---------------------------------------------------------------------------

describe("stripManagedKeys — dryRun mode", () => {
  it("dryRun=true reports removals without writing to disk", () => {
    writePkg({
      name: "test",
      scripts: { "lint:slop": "slop-scan scan ." },
    });

    const result = stripManagedKeys(["lint"], true);
    expect(result.removedScripts).toContain("lint:slop");

    const pkg = readPkg();
    const scripts = pkg.scripts as Record<string, string>;
    expect(scripts["lint:slop"]).toBe("slop-scan scan ."); // NOT removed in dryRun
  });
});

// ---------------------------------------------------------------------------
// Empty scripts section cleanup
// ---------------------------------------------------------------------------

describe("stripManagedKeys — cleanup", () => {
  it("removes empty scripts section after stripping all managed scripts", () => {
    writePkg({
      name: "test",
      scripts: {
        typecheck: "tsc --noEmit",
      },
    });

    const result = stripManagedKeys(["lint"]);
    expect(result.removedScripts).toContain("typecheck");

    const pkg = readPkg();
    expect(pkg.scripts).toBeUndefined();
  });

  it("is a no-op when no managed keys present in package.json", () => {
    writePkg({
      name: "test",
      scripts: { build: "tsc" },
    });

    const result = stripManagedKeys(["lint"]);
    expect(result.removedScripts).toEqual([]);
    expect(result.removedDevDeps).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Cross-module: key list driven from manifest (not hand-listed)
// ---------------------------------------------------------------------------

describe("stripManagedKeys — manifest-driven key list", () => {
  it("key list driven from manifest — typecheck script from lint module (#265)", () => {
    writePkg({
      name: "test",
      scripts: {
        typecheck: "tsc --noEmit",
        "other-script": "echo ok",
      },
    });

    // lint module declares typecheck (moved ci→lint in #265); should be removed if default value
    const result = stripManagedKeys(["lint"]);
    expect(result.removedScripts).toContain("typecheck");

    const pkg = readPkg();
    const scripts = pkg.scripts as Record<string, string>;
    expect(scripts["other-script"]).toBe("echo ok"); // consumer script preserved
  });

  it("does not remove scripts from other modules when only lint specified", () => {
    writePkg({
      name: "test",
      scripts: {
        typecheck: "tsc --noEmit", // lint module (#265)
        "lint:slop": "slop-scan scan .", // lint module
        prepare: "husky", // git-hooks module
      },
    });

    // Only lint module — removes its own scripts (lint:slop + typecheck) but not git-hooks' prepare
    const result = stripManagedKeys(["lint"]);
    expect(result.removedScripts).toContain("lint:slop");
    expect(result.removedScripts).toContain("typecheck");
    expect(result.removedScripts).not.toContain("prepare");
  });
});
