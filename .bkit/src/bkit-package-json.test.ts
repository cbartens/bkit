// bkit-package-json.test.ts — repointLegacyScripts: superseded bkit script values.
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { repointLegacyScripts } from "./bkit-package-json";
import {
  LINT_PROSE_SCRIPT,
  LEGACY_LINT_PROSE_SCRIPTS,
  LEGACY_SLOP_DELTA_SCRIPTS,
  SLOP_DELTA_SCRIPT,
} from "./bkit-manifest";

let tmpDir: string;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-pkgjson-test-"));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

function writePkg(content: object): void {
  fs.writeFileSync(
    path.join(tmpDir, "package.json"),
    JSON.stringify(content, null, 2) + "\n",
    "utf-8",
  );
}

function readScripts(): Record<string, string> {
  return (
    JSON.parse(fs.readFileSync(path.join(tmpDir, "package.json"), "utf-8")) as {
      scripts: Record<string, string>;
    }
  ).scripts;
}

// ---------------------------------------------------------------------------
// repointLegacyScripts — install and upgrade both run it. bkit does not seed
// these scripts, so without it a consumer would keep a lint:prose an older bkit
// wrote (which silently self-disables in worktrees), or a slop:delta that calls
// a script bkit does not ship.
// ---------------------------------------------------------------------------

describe("repointLegacyScripts", () => {
  const LEGACY_PROSE = LEGACY_LINT_PROSE_SCRIPTS[0];
  const LEGACY_SLOP = LEGACY_SLOP_DELTA_SCRIPTS[0];

  it("re-points superseded lint:prose and slop:delta values to the current ones", () => {
    writePkg({
      name: "t",
      scripts: { "lint:prose": LEGACY_PROSE, "slop:delta": LEGACY_SLOP, build: "tsc" },
    });
    expect(repointLegacyScripts(tmpDir, false).sort()).toEqual(["lint:prose", "slop:delta"]);
    const scripts = readScripts();
    expect(scripts["lint:prose"]).toBe(LINT_PROSE_SCRIPT);
    expect(scripts["slop:delta"]).toBe(SLOP_DELTA_SCRIPT);
    expect(scripts.build).toBe("tsc"); // consumer script untouched
  });

  it("is replace-only — never creates a script when absent", () => {
    writePkg({ name: "t", scripts: { build: "tsc" } });
    expect(repointLegacyScripts(tmpDir, false)).toEqual([]);
    expect(readScripts()).toEqual({ build: "tsc" });
  });

  it("leaves consumer-customised values alone", () => {
    writePkg({ name: "t", scripts: { "lint:prose": "my-own-linter", "slop:delta": "true" } });
    expect(repointLegacyScripts(tmpDir, false)).toEqual([]);
    expect(readScripts()).toEqual({ "lint:prose": "my-own-linter", "slop:delta": "true" });
  });

  it("is idempotent — values already current are a no-op", () => {
    writePkg({
      name: "t",
      scripts: { "lint:prose": LINT_PROSE_SCRIPT, "slop:delta": SLOP_DELTA_SCRIPT },
    });
    expect(repointLegacyScripts(tmpDir, false)).toEqual([]);
  });

  it("dryRun reports without writing", () => {
    writePkg({ name: "t", scripts: { "slop:delta": LEGACY_SLOP } });
    expect(repointLegacyScripts(tmpDir, true)).toEqual(["slop:delta"]);
    expect(readScripts()["slop:delta"]).toBe(LEGACY_SLOP);
  });

  it("returns nothing on a missing or malformed package.json instead of throwing", () => {
    // Never abort a half-finished install or upgrade over an unparseable consumer file.
    expect(repointLegacyScripts(tmpDir, false)).toEqual([]);
    fs.writeFileSync(path.join(tmpDir, "package.json"), "{ not json", "utf-8");
    expect(repointLegacyScripts(tmpDir, false)).toEqual([]);
  });

  it("preserves 4-space indent style", () => {
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({ name: "t", scripts: { "lint:prose": LEGACY_PROSE } }, null, 4) + "\n",
      "utf-8",
    );
    repointLegacyScripts(tmpDir, false);
    const raw = fs.readFileSync(path.join(tmpDir, "package.json"), "utf-8");
    expect(raw).toContain('\n    "name"');
    expect(raw.endsWith("\n")).toBe(true);
  });
});
