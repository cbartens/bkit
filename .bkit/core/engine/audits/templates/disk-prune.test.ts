// audits/templates/disk-prune.test.ts — the shipped `bkit disk prune` step-file examples and
// the hook lines that start them. The examples load as valid steps and never carry a delete
// whose loss does not come back by itself; the hooks start the sweep last.

import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { runCommand } from "../../commands/lib";
import { diskCommand, machineStepsPath, REPO_STEPS } from "../../commands/workflow/disk";

const REPO = process.cwd();
const TEMPLATES = path.join(REPO, ".bkit/templates/scripts/cleanup");
const REPO_TEMPLATE = path.join(TEMPLATES, "bkit-disk-prune.mjs");
const MACHINE_TEMPLATE = path.join(TEMPLATES, "bkit-disk-prune.machine.mjs");

const dirs: string[] = [];
const tmp = (prefix: string) => {
  const d = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), prefix)));
  dirs.push(d);
  return d;
};
beforeEach(() => {
  vi.stubEnv("CI", "");
  vi.stubEnv("CLAUDE_CODE_REMOTE", "");
  vi.stubEnv("CURSOR_REMOTE_AGENT", "");
  vi.stubEnv("XDG_CONFIG_HOME", tmp("bkit-disk-tpl-config-"));
  vi.stubEnv("XDG_CACHE_HOME", tmp("bkit-disk-tpl-cache-"));
});
afterEach(() => {
  vi.unstubAllEnvs();
  for (const d of dirs.splice(0)) fs.rmSync(d, { recursive: true, force: true });
});

describe("disk prune step-file templates", () => {
  it("both copy into place and load as valid steps of both modes", async () => {
    // An empty home, so `--dry-run` does not size the real caches its paths name.
    vi.stubEnv("HOME", tmp("bkit-disk-tpl-home-"));
    const cwd = tmp("bkit-disk-tpl-repo-");
    spawnSync("git", ["init", "-q"], { cwd });
    fs.mkdirSync(path.join(cwd, path.dirname(REPO_STEPS)), { recursive: true });
    fs.copyFileSync(REPO_TEMPLATE, path.join(cwd, REPO_STEPS));
    fs.mkdirSync(path.dirname(machineStepsPath()), { recursive: true });
    fs.copyFileSync(MACHINE_TEMPLATE, machineStepsPath());

    const out: string[] = [];
    const code = await runCommand(["disk", "prune", "--mode=max", "--dry-run"], [diskCommand], {
      classicVerbs: new Set(),
      cwd,
      io: { stdout: (t) => out.push(t), stderr: () => {} },
    });
    const r = JSON.parse(out.join("")) as {
      files: { scope: string; steps: number; error: string | null }[];
      steps: { scope: string; mode: string; outcome: string }[];
    };
    expect(code).toBe(0);
    expect(r.files.map((f) => [f.scope, f.error])).toEqual([
      ["repo", null],
      ["machine", null],
    ]);
    for (const scope of ["repo", "machine"]) {
      const modes = new Set(r.steps.filter((s) => s.scope === scope).map((s) => s.mode));
      expect([...modes].sort(), scope).toEqual(["max", "min"]);
    }
    expect(r.steps.every((s) => s.outcome === "would-run")).toBe(true);
  });

  // Each of these deletes something that does not come back by itself: a database, a
  // runtime or SDK to reinstall by hand, or every simulator at once.
  it.each([
    ["named Docker volumes", /docker volume prune[^\n]*(-a\b|--all)/],
    ["docker system prune --volumes", /docker system prune[^\n]*--volumes/],
    ["every simulator", /simctl[^\n]*delete[^\n]*\ball\b/],
    ["simulator runtimes", /simctl[^\n]*runtime[^\n]*delete/],
    ["Android SDK packages", /sdkmanager[^\n]*--uninstall/],
    ["the whole pnpm store", /rm -rf[^\n]*pnpm[^\n]*store/],
  ])("no template step deletes %s", (_what, pattern) => {
    for (const file of [REPO_TEMPLATE, MACHINE_TEMPLATE]) {
      const code = fs
        .readFileSync(file, "utf-8")
        .split("\n")
        .filter((line) => !/^\s*(\/\/|\*|\/\*\*)/.test(line))
        .join("\n");
      expect(code, path.basename(file)).not.toMatch(pattern);
    }
  });
});

describe("disk prune hook lines", () => {
  /** The hook's last command, its comment lines and blank lines dropped. */
  const lastCommand = (hook: string) =>
    fs
      .readFileSync(path.join(REPO, hook), "utf-8")
      .split("\n")
      .filter((line) => line.trim() !== "" && !line.trimStart().startsWith("#"))
      .slice(-2)
      .join("\n");

  it.each([
    [".bkit/templates/.husky/pre-commit", "min", "pre-commit", "commit"],
    [".husky/pre-commit", "min", "pre-commit", "commit"],
    [".bkit/templates/.husky/pre-push", "max", "pre-push", "push"],
    [".husky/pre-push", "max", "pre-push", "push"],
  ])("%s ends by starting the %s sweep, and its failure never blocks", (hook, mode, tag, act) => {
    expect(lastCommand(hook)).toBe(
      `pnpm -s bkit disk prune --mode=${mode} --auto < /dev/null > /dev/null ||\n` +
        `  echo "[${tag}] WARN: disk prune failed; ${act} continues" >&2`,
    );
  });
});
