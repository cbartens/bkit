// commands/install/check.test.ts — Unit tests for `bkit check`'s installed-module detection.

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { detectInstalledModules } from "./check";

describe("detectInstalledModules — sentinel-file module detection", () => {
  let cwd: string;
  beforeEach(() => {
    cwd = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-detect-mods-"));
  });
  afterEach(() => {
    fs.rmSync(cwd, { recursive: true, force: true });
  });
  const touch = (rel: string) => {
    const p = path.join(cwd, rel);
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, "", "utf-8");
  };
  const mkdir = (rel: string) => fs.mkdirSync(path.join(cwd, rel), { recursive: true });

  it("returns just core for an empty dir", () => {
    expect([...detectInstalledModules(cwd)]).toEqual(["core"]);
  });

  it("detects each host module by its agents dir", () => {
    mkdir(".claude/agents");
    mkdir(".cursor/agents");
    mkdir(".opencode/agents");
    const mods = detectInstalledModules(cwd);
    expect(mods.has("claude")).toBe(true);
    expect(mods.has("cursor")).toBe(true);
    expect(mods.has("opencode")).toBe(true);
  });

  it("detects lint via the owned slop-scan plugin", () => {
    touch(".bkit/scripts/bkit-slop-type-suppression.mjs");
    expect(detectInstalledModules(cwd).has("lint")).toBe(true);
  });

  it("detects no module from adopted templates (ci.yml, .vale.ini, husky, lint configs)", () => {
    for (const rel of [
      ".github/workflows/ci.yml",
      ".vale.ini",
      ".husky/pre-commit",
      ".husky/pre-push",
      "slop-scan.config.json",
      ".prettierignore",
    ]) {
      touch(rel);
    }
    expect([...detectInstalledModules(cwd)]).toEqual(["core"]);
  });
});
