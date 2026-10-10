// bkit-check-owned-hooks.integration.test.ts — `bkit check` fails on a missing owned hook
//
// The claude and codex hook commands are `test -f <file> && node <file> || true`. `bkit check`
// exits 1 and names a missing file.
// The required set follows what is installed: the hook files of each detected host, plus
// `.claude/hooks/cloud-bootstrap.sh` only when `bkit.cloudAgents` is `claude`.
//
// Strategy: unit-test findMissingOwnedHooks against hand-built trees, then spawn the real
// install + check binaries against a tmpdir consumer for the exit code and message.

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { spawnSync } from "node:child_process";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { findMissingOwnedHooks, detectOwnedHookMissing } from "./bkit-postinstall";
import type { ModuleFlag } from "./bkit-cli";

const getInstallPath = () =>
  path.resolve(path.dirname(new URL(import.meta.url).pathname), "bkit-install.ts");
const getTsxBin = () =>
  path.resolve(path.dirname(new URL(import.meta.url).pathname), "../../node_modules/.bin/tsx");

function runBkit(cwd: string, args: string[]): { combined: string; status: number | null } {
  const result = spawnSync(getTsxBin(), [getInstallPath(), ...args], {
    cwd,
    encoding: "utf-8",
    env: { ...process.env, NODE_NO_WARNINGS: "1" },
    timeout: 90_000,
  });
  return { combined: `${result.stdout ?? ""}\n${result.stderr ?? ""}`, status: result.status };
}

function makeConsumer(prefix: string, bkitField?: Record<string, unknown>): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
  fs.writeFileSync(
    path.join(dir, "package.json"),
    JSON.stringify({ name: "owned-hooks-consumer", version: "0.0.0", bkit: bkitField }, null, 2),
  );
  fs.mkdirSync(path.join(dir, ".git"), { recursive: true });
  return dir;
}

function touch(dir: string, rel: string): void {
  fs.mkdirSync(path.dirname(path.join(dir, rel)), { recursive: true });
  fs.writeFileSync(path.join(dir, rel), "");
}

describe("findMissingOwnedHooks", () => {
  let dir: string;
  beforeEach(() => {
    dir = makeConsumer("bkit-owned-hooks-unit-");
  });
  afterEach(() => {
    fs.rmSync(dir, { recursive: true, force: true });
  });

  const paths = (modules: ModuleFlag[]) =>
    findMissingOwnedHooks(dir, new Set<ModuleFlag>(["core", ...modules])).map((h) => h.path);

  it("requires the hook files of each installed host, and only those", () => {
    expect(paths(["claude"]).sort()).toEqual([
      ".claude/hooks/gateguard.cjs",
      ".claude/hooks/guardrails.cjs",
      ".claude/hooks/preflight.sh",
    ]);
    expect(paths(["cursor"]).sort()).toEqual([
      ".cursor/hooks/gateguard.cjs",
      ".cursor/hooks/guardrails.cjs",
      ".cursor/hooks/preflight.sh",
    ]);
    expect(paths(["codex"]).sort()).toEqual([
      ".codex/hooks/gateguard.cjs",
      ".codex/hooks/guardrails.cjs",
    ]);
    expect(paths(["opencode"])).toEqual([".opencode/plugin/gateguard.js"]);
  });

  it("a host that is not installed is not required", () => {
    expect(paths([])).toEqual([]);
    expect(paths(["claude"]).some((p) => p.startsWith(".codex/"))).toBe(false);
  });

  it("present files are not reported", () => {
    touch(dir, ".codex/hooks/gateguard.cjs");
    touch(dir, ".codex/hooks/guardrails.cjs");
    expect(paths(["codex"])).toEqual([]);
  });

  it("requires cloud-bootstrap.sh only when bkit.cloudAgents is claude", () => {
    // Every claude settings.json references cloud-bootstrap.sh, so the reference alone is not a signal.
    touch(dir, ".claude/settings.json");
    expect(paths([])).toEqual([]);

    fs.writeFileSync(
      path.join(dir, "package.json"),
      JSON.stringify({ name: "x", bkit: { cloudAgents: "cursor" } }),
    );
    expect(paths([])).toEqual([]);

    fs.writeFileSync(
      path.join(dir, "package.json"),
      JSON.stringify({ name: "x", bkit: { cloudAgents: "claude" } }),
    );
    expect(findMissingOwnedHooks(dir, new Set<ModuleFlag>(["core"]))).toEqual([
      { path: ".claude/hooks/cloud-bootstrap.sh", restoreFlag: "--auto=claude" },
    ]);
  });

  it("detectOwnedHookMissing is a blocker naming every missing file, null when none", () => {
    expect(detectOwnedHookMissing([])).toBeNull();
    const finding = detectOwnedHookMissing(
      findMissingOwnedHooks(dir, new Set<ModuleFlag>(["core", "opencode"])),
    );
    expect(finding?.severity).toBe("blocker");
    expect(finding?.detect).toContain(".opencode/plugin/gateguard.js");
  });
});

describe("bkit check — exit code on a missing owned hook", () => {
  let dir: string;
  const haveTsx = fs.existsSync(getTsxBin());

  beforeAll(() => {
    dir = makeConsumer("bkit-owned-hooks-check-");
    if (!haveTsx) return; // CI without devDeps
    const install = runBkit(dir, [
      "install",
      "--claude",
      "--cursor",
      "--codex",
      "--opencode=openrouter",
      "--tracker=github",
      "--auto=claude",
    ]);
    expect(install.status, install.combined).toBe(0);
  }, 120_000);

  afterAll(() => {
    fs.rmSync(dir, { recursive: true, force: true });
  });

  it("clean install → check exits 0", () => {
    if (!haveTsx) return;
    const check = runBkit(dir, ["check"]);
    expect(check.status, check.combined).toBe(0);
    expect(check.combined).not.toContain("owned-hook-missing");
  });

  it.each([
    ".claude/hooks/guardrails.cjs",
    ".cursor/hooks/gateguard.cjs",
    ".codex/hooks/guardrails.cjs",
    ".opencode/plugin/gateguard.js",
    ".claude/hooks/cloud-bootstrap.sh",
  ])("missing %s → check exits 1 and names it", (rel) => {
    if (!haveTsx) return;
    const abs = path.join(dir, rel);
    const saved = fs.readFileSync(abs);
    fs.rmSync(abs);
    try {
      const check = runBkit(dir, ["check"]);
      expect(check.status, check.combined).toBe(1);
      expect(check.combined).toContain(`check: ${rel} is missing`);
    } finally {
      fs.writeFileSync(abs, saved);
    }
  });

  it("claude host without the cloud module → no cloud-bootstrap.sh required", () => {
    if (!haveTsx) return;
    const claudeOnly = makeConsumer("bkit-owned-hooks-claude-");
    try {
      expect(runBkit(claudeOnly, ["install", "--claude"]).status).toBe(0);
      expect(fs.existsSync(path.join(claudeOnly, ".claude/hooks/cloud-bootstrap.sh"))).toBe(false);
      const check = runBkit(claudeOnly, ["check"]);
      expect(check.status, check.combined).toBe(0);
    } finally {
      fs.rmSync(claudeOnly, { recursive: true, force: true });
    }
  });
});
