import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { BKIT_BUILD_GATES, BKIT_DEBUG_GATES } from "../../bkit-manifest";
import { runCommand } from "../lib";
import { PACKAGE_RUNNER } from "../shared/package-manager";
import { gateScope, resolveGate, testsCommand } from "./tests";

const dirs: string[] = [];
const tmp = (prefix: string) => {
  const d = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), prefix)));
  dirs.push(d);
  return d;
};

const DEEP = "bkit:gate:static-unit-integration";
const SHALLOW = "bkit:gate:static-unit";
const scripts = (s: Record<string, string>) => JSON.stringify({ scripts: s });

/**
 * A checkout declaring `scripts`, and a fake package runner on PATH that echoes
 * the script it was asked for on stdout and stderr, then exits FAKE_EXIT.
 */
let cwd: string;
let bin: string;
function checkout(pkg: string | null) {
  cwd = tmp("bkit-tests-");
  spawnSync("git", ["init", "-q", cwd]);
  if (pkg !== null) fs.writeFileSync(path.join(cwd, "package.json"), pkg);
}
beforeEach(() => {
  bin = tmp("bkit-tests-bin-");
  fs.writeFileSync(
    path.join(bin, PACKAGE_RUNNER),
    '#!/bin/sh\necho "out: $1 in $(pwd)"\necho "err: $1" >&2\nexit "${FAKE_EXIT:-0}"\n',
    { mode: 0o755 },
  );
  vi.stubEnv("FAKE_EXIT", "0");
  vi.stubEnv("PATH", `${bin}:${process.env.PATH}`);
  checkout(scripts({ [SHALLOW]: "x", [DEEP]: "y" }));
});
afterEach(() => {
  vi.unstubAllEnvs();
  for (const d of dirs.splice(0)) fs.rmSync(d, { recursive: true, force: true });
});

async function run(argv: string[], at = cwd) {
  const out: string[] = [];
  const err: string[] = [];
  const code = await runCommand(["tests", "run", ...argv], [testsCommand], {
    classicVerbs: new Set(),
    cwd: at,
    io: { stdout: (t) => out.push(t), stderr: (t) => err.push(t) },
  });
  return { code, json: out.length ? JSON.parse(out.join("")) : undefined, err: err.join("") };
}

const BUILD = [...BKIT_BUILD_GATES.map((g) => `--gate=${g}`), "--log=logs/test.md"];
const readLog = () => fs.readFileSync(path.join(cwd, "logs/test.md"), "utf-8");

describe("resolveGate", () => {
  it("picks the deepest declared candidate, not the first declared in package.json", () => {
    expect(resolveGate(cwd, [DEEP, SHALLOW])).toBe(DEEP);
  });

  it("falls back to a shallower candidate when the deeper one is undeclared", () => {
    checkout(scripts({ [SHALLOW]: "x" }));
    expect(resolveGate(cwd, [DEEP, SHALLOW])).toBe(SHALLOW);
  });

  it("an empty script is not declared: it would run nothing and exit 0 (fix)", () => {
    checkout(scripts({ [DEEP]: "  ", [SHALLOW]: "x" }));
    expect(resolveGate(cwd, [DEEP, SHALLOW])).toBe(SHALLOW);
  });

  it("no package.json, no scripts, or unparseable -> null", () => {
    checkout(null);
    expect(resolveGate(cwd, [SHALLOW])).toBeNull();
    checkout("{}");
    expect(resolveGate(cwd, [SHALLOW])).toBeNull();
    checkout("{oops");
    expect(resolveGate(cwd, [SHALLOW])).toBeNull();
  });

  it("debug's live-first chain stops at the deepest declared tier", () => {
    checkout(scripts({ "bkit:gate:static-unit-integration-e2e": "e", [SHALLOW]: "x" }));
    expect(resolveGate(cwd, BKIT_DEBUG_GATES)).toBe("bkit:gate:static-unit-integration-e2e");
  });
});

describe("bkit tests run", () => {
  it("PASS: runs the gate through the package runner, saves stdout and stderr to the log", async () => {
    const r = await run(BUILD);
    expect(r.code).toBe(0);
    expect(r.json).toEqual({
      verdict: "PASS",
      exitCode: 0,
      gate: DEEP,
      scope: gateScope(DEEP),
      failures: 0,
      log: "logs/test.md",
      logBytes: fs.statSync(path.join(cwd, "logs/test.md")).size,
    });
    expect(r.json.scope).toBe(`${PACKAGE_RUNNER} ${DEEP}`);
    expect(readLog()).toContain(`out: ${DEEP}`);
    expect(readLog()).toContain(`err: ${DEEP}`);
    expect(r.err).toContain(`[bkit-tests] out: ${DEEP}`);
  });

  it("FAIL: a non-zero exit is a FAIL verdict, exit 1, and the log is still saved (build saved none)", async () => {
    vi.stubEnv("FAKE_EXIT", "3");
    const r = await run(BUILD);
    expect(r.code).toBe(1);
    expect(r.json).toMatchObject({ verdict: "FAIL", exitCode: 3, failures: null });
    expect(readLog()).toContain("out:");
  });

  it.each([
    [127, "command not found"],
    [126, "not executable"],
  ])(
    "exit %i from the gate could not run: exit 4, verdict null, never FAIL (#498)",
    async (code, words) => {
      vi.stubEnv("FAKE_EXIT", String(code));
      const r = await run(BUILD);
      expect(r.code).toBe(4);
      expect(r.json).toMatchObject({ verdict: null, exitCode: code });
      expect(r.err).toContain(words);
      expect(r.err).toContain("not a FAIL verdict");
    },
  );

  it("the package runner itself missing could not run either (exit 4, 127 in the log)", async () => {
    const onlyGit = tmp("bkit-tests-onlygit-");
    const gitBin = spawnSync("sh", ["-c", "command -v git"], { encoding: "utf-8" }).stdout.trim();
    fs.symlinkSync(gitBin, path.join(onlyGit, "git"));
    vi.stubEnv("PATH", onlyGit);
    const r = await run(BUILD);
    expect(r.code).toBe(4);
    expect(r.json.exitCode).toBe(127);
    expect(readLog()).toContain("not found on PATH");
  });

  it("no candidate declared: exit 3, nothing run, and the hint names bkit:gate:* — not an install flag (fix)", async () => {
    checkout(scripts({ test: "x" }));
    const r = await run(BUILD);
    expect(r.code).toBe(3);
    expect(r.json).toBeUndefined();
    expect(r.err).toContain("no bkit:gate:* script declared");
    expect(r.err).toContain("declare a bkit:gate:* script in package.json");
    expect(r.err).not.toContain("--typescript");
    expect(fs.existsSync(path.join(cwd, "logs"))).toBe(false);
  });

  it("a missing or broken package.json is named, then reads as nothing declared", async () => {
    checkout("{oops");
    const broken = await run(BUILD);
    expect(broken.code).toBe(3);
    expect(broken.err).toContain("is unparseable");
    checkout(null);
    expect((await run(BUILD)).err).toContain("is missing");
  });

  it("runs at the checkout top from a subdirectory; the log path resolves against the caller's cwd", async () => {
    fs.mkdirSync(path.join(cwd, "sub"));
    const r = await run([`--gate=${SHALLOW}`, "--log=here.md"], path.join(cwd, "sub"));
    expect(r.code).toBe(0);
    const log = fs.readFileSync(path.join(cwd, "sub", "here.md"), "utf-8");
    expect(log).toContain(`in ${cwd}\n`);
  });

  it("--tail bounds the echoed lines; --tail=0 echoes none", async () => {
    expect((await run([...BUILD, "--tail=1"])).err).not.toContain("out:");
    const quiet = await run([...BUILD, "--tail=0"]);
    expect(quiet.err).not.toContain("err:");
    expect((await run([...BUILD, "--tail=x"])).code).toBe(2);
  });

  it("--gate and --log are required", async () => {
    expect((await run(["--log=l.md"])).code).toBe(2);
    expect((await run([`--gate=${SHALLOW}`])).code).toBe(2);
  });
});
