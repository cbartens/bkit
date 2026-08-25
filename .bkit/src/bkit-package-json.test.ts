// bkit-package-json.test.ts — P2.T4 — stripManagedKeys tests.
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { stripManagedKeys, repointLegacyLintProse } from "./bkit-package-json";
import { LINT_PROSE_SCRIPT, LEGACY_LINT_PROSE_SCRIPTS } from "./bkit-manifest";

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

  it("removes lint:prose when value matches the CURRENT bkit default", () => {
    writePkg({ name: "test", scripts: { "lint:prose": LINT_PROSE_SCRIPT, build: "tsc" } });
    const result = stripManagedKeys(["lint"]);
    expect(result.removedScripts).toContain("lint:prose");
    const scripts = readPkg().scripts as Record<string, string>;
    expect(scripts).not.toHaveProperty("lint:prose");
    expect(scripts).toHaveProperty("build"); // consumer script preserved
  });

  it("removes lint:prose when value matches a SUPERSEDED bkit default", () => {
    // A consumer who installed before the default changed and never re-ran
    // install still has bkit's own script — uninstall must reclaim it, not
    // orphan it as though they had customised it.
    for (const legacy of LEGACY_LINT_PROSE_SCRIPTS) {
      writePkg({ name: "test", scripts: { "lint:prose": legacy, build: "tsc" } });
      const result = stripManagedKeys(["lint"]);
      expect(result.removedScripts).toContain("lint:prose");
      expect(result.preservedScripts).not.toContain("lint:prose");
      const scripts = readPkg().scripts as Record<string, string>;
      expect(scripts).not.toHaveProperty("lint:prose");
      expect(scripts).toHaveProperty("build");
    }
  });

  it("preserves a consumer-customised lint:prose matching neither current nor legacy", () => {
    writePkg({ name: "test", scripts: { "lint:prose": "vale --glob='*.md' ." } });
    const result = stripManagedKeys(["lint"]);
    expect(result.preservedScripts).toContain("lint:prose");
    expect(result.removedScripts).not.toContain("lint:prose");
    expect((readPkg().scripts as Record<string, string>)["lint:prose"]).toBe(
      "vale --glob='*.md' .",
    );
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

// ---------------------------------------------------------------------------
// repointLegacyLintProse — the upgrade-engine half of the lint:prose correction
//
// install and upgrade are SEPARATE engines. runLintModule handles install;
// upgrade never touches package.json scripts, so without this helper the
// documented `bkit upgrade --latest` path would leave a consumer on the
// lint:prose that silently self-disables in worktrees.
// ---------------------------------------------------------------------------

describe("repointLegacyLintProse", () => {
  const LEGACY = LEGACY_LINT_PROSE_SCRIPTS[0];

  it("re-points a superseded bkit default to the current one", () => {
    writePkg({ name: "t", scripts: { "lint:prose": LEGACY, build: "tsc" } });
    const msg = repointLegacyLintProse(tmpDir, false);
    expect(msg).toContain("re-pointed");
    const scripts = readPkg().scripts as Record<string, string>;
    expect(scripts["lint:prose"]).toBe(LINT_PROSE_SCRIPT);
    expect(scripts.build).toBe("tsc"); // consumer script untouched
  });

  it("is replace-only — never creates lint:prose when absent", () => {
    // Upgrade must not force-create a script for a module the consumer never
    // installed (same rule that keeps upgrade from seeding opt-in module files).
    writePkg({ name: "t", scripts: { build: "tsc" } });
    expect(repointLegacyLintProse(tmpDir, false)).toBeNull();
    expect(readPkg().scripts).not.toHaveProperty("lint:prose");
  });

  it("leaves a consumer-customised lint:prose alone", () => {
    writePkg({ name: "t", scripts: { "lint:prose": "my-own-linter" } });
    expect(repointLegacyLintProse(tmpDir, false)).toBeNull();
    expect((readPkg().scripts as Record<string, string>)["lint:prose"]).toBe("my-own-linter");
  });

  it("is idempotent — a script already at the current default is a no-op", () => {
    writePkg({ name: "t", scripts: { "lint:prose": LINT_PROSE_SCRIPT } });
    expect(repointLegacyLintProse(tmpDir, false)).toBeNull();
  });

  it("dryRun reports without writing", () => {
    writePkg({ name: "t", scripts: { "lint:prose": LEGACY } });
    expect(repointLegacyLintProse(tmpDir, true)).toContain("re-pointed");
    expect((readPkg().scripts as Record<string, string>)["lint:prose"]).toBe(LEGACY);
  });

  it("returns null on a missing or malformed package.json instead of throwing", () => {
    // Never abort a half-finished upgrade over an unparseable consumer file.
    fs.rmSync(path.join(tmpDir, "package.json"), { force: true });
    expect(repointLegacyLintProse(tmpDir, false)).toBeNull();
    fs.writeFileSync(path.join(tmpDir, "package.json"), "{ not json", "utf-8");
    expect(repointLegacyLintProse(tmpDir, false)).toBeNull();
  });

  it("preserves 4-space indent style", () => {
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({ name: "t", scripts: { "lint:prose": LEGACY } }, null, 4) + "\n",
      "utf-8",
    );
    repointLegacyLintProse(tmpDir, false);
    const raw = fs.readFileSync(path.join(tmpDir, "package.json"), "utf-8");
    expect(raw).toContain('\n    "name"');
    expect(raw.endsWith("\n")).toBe(true);
  });
});
