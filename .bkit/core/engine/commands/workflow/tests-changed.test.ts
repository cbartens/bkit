import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { BKIT_GATE_CHANGED_SCRIPT } from "../../install/manifest";
import { runCommand } from "../lib";
import { PACKAGE_RUNNER } from "../../shared/package-manager";
import { changedFiles } from "./tests-changed";
import { testsCommand } from "./tests";

const dirs: string[] = [];
const tmp = (prefix: string) => {
  const d = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), prefix)));
  dirs.push(d);
  return d;
};

const GIT_ENV = {
  ...process.env,
  GIT_AUTHOR_NAME: "t",
  GIT_AUTHOR_EMAIL: "t@t",
  GIT_COMMITTER_NAME: "t",
  GIT_COMMITTER_EMAIL: "t@t",
};
const STATIC = "bkit:gate:static";

/**
 * A committed checkout declaring `scripts`, with `src/a.ts` and `src/b.ts` tracked, and a
 * fake package runner on PATH that writes each argument it got, one per line, to
 * $FAKE_ARGS, then exits FAKE_EXIT.
 */
let cwd: string;
let argsFile: string;
const git = (...args: string[]) =>
  spawnSync("git", ["-C", cwd, ...args], { encoding: "utf-8", env: GIT_ENV }).stdout.trim();
const write = (rel: string, body = "x\n") => {
  fs.mkdirSync(path.dirname(path.join(cwd, rel)), { recursive: true });
  fs.writeFileSync(path.join(cwd, rel), body);
};
const commit = (message: string) => {
  git("add", "-A");
  git("commit", "-q", "-m", message);
  return git("rev-parse", "HEAD");
};
function checkout(scripts: Record<string, string>) {
  cwd = tmp("bkit-tests-changed-");
  git("init", "-q");
  fs.writeFileSync(path.join(cwd, "package.json"), JSON.stringify({ scripts }));
  fs.writeFileSync(path.join(cwd, ".gitignore"), "ignored/\n");
  write("src/a.ts");
  write("src/b.ts");
  return commit("base");
}
beforeEach(() => {
  const bin = tmp("bkit-tests-changed-bin-");
  argsFile = path.join(bin, "args");
  fs.writeFileSync(
    path.join(bin, PACKAGE_RUNNER),
    '#!/bin/sh\nfor a in "$@"; do echo "$a" >> "$FAKE_ARGS"; done\necho "ran $1"\nexit "${FAKE_EXIT:-0}"\n',
    { mode: 0o755 },
  );
  vi.stubEnv("FAKE_ARGS", argsFile);
  vi.stubEnv("FAKE_EXIT", "0");
  vi.stubEnv("PATH", `${bin}:${process.env.PATH}`);
});
afterEach(() => {
  vi.unstubAllEnvs();
  for (const d of dirs.splice(0)) fs.rmSync(d, { recursive: true, force: true });
});

/** The arguments the fake runner got, or null when it never ran. */
const ranWith = () =>
  fs.existsSync(argsFile) ? fs.readFileSync(argsFile, "utf-8").trim().split("\n") : null;

async function changed(argv: string[]) {
  const out: string[] = [];
  const err: string[] = [];
  const code = await runCommand(["tests", "changed", ...argv, "--json"], [testsCommand], {
    classicVerbs: new Set(),
    cwd,
    io: { stdout: (t) => out.push(t), stderr: (t) => err.push(t) },
  });
  return {
    code,
    json: out.length ? (JSON.parse(out.join("")) as Record<string, unknown>) : undefined,
    err: err.join(""),
  };
}

describe("changedFiles", () => {
  it("lists modified, staged and untracked files, and leaves out ignored and deleted ones", () => {
    const base = checkout({});
    write("src/a.ts", "changed\n");
    write("src/new.ts");
    write("ignored/out.ts");
    fs.rmSync(path.join(cwd, "src/b.ts"));
    write("src/staged.ts");
    git("add", "src/staged.ts");
    expect(changedFiles(cwd, base)).toEqual(["src/a.ts", "src/new.ts", "src/staged.ts"]);
  });

  it("adds files changed in commits since the base, and drops one a later commit deleted", () => {
    const base = checkout({});
    write("src/a.ts", "committed\n");
    write("src/gone.ts");
    commit("step work");
    fs.rmSync(path.join(cwd, "src/gone.ts"));
    commit("drop gone");
    write("src/later.ts");
    expect(changedFiles(cwd, base)).toEqual(["src/a.ts", "src/later.ts"]);
    expect(changedFiles(cwd, git("rev-parse", "HEAD"))).toEqual(["src/later.ts"]);
  });
});

describe("tests changed", () => {
  it("tests changed with a --lock-wait-s that is not a whole number exits 2 and runs no gate", async () => {
    checkout({ [BKIT_GATE_CHANGED_SCRIPT]: "x", [STATIC]: "y" });
    write("src/a.ts", "changed\n");
    const results = await Promise.all(
      ["-1", "1.5", "bad"].map((value) =>
        changed([`--lock-wait-s=${value}`, `--fallback=${STATIC}`]),
      ),
    );
    expect(results.map((result) => result.code)).toEqual([2, 2, 2]);
    expect(results.map((result) => result.err)).toEqual([
      expect.stringContaining("--lock-wait-s takes a whole number >= 0"),
      expect.stringContaining("--lock-wait-s takes a whole number >= 0"),
      expect.stringContaining("--lock-wait-s takes a whole number >= 0"),
    ]);
    expect(ranWith()).toBeNull();
  });

  it("runs bkit:gate:changed with the changed files as its arguments", async () => {
    checkout({ [BKIT_GATE_CHANGED_SCRIPT]: "x", [STATIC]: "y" });
    write("src/a.ts", "changed\n");
    write("src/new.ts");
    const r = await changed([`--fallback=${STATIC}`]);
    expect(r.code).toBe(0);
    expect(ranWith()).toEqual([BKIT_GATE_CHANGED_SCRIPT, "src/a.ts", "src/new.ts"]);
    expect(r.json).toMatchObject({
      files: ["src/a.ts", "src/new.ts"],
      gate: BKIT_GATE_CHANGED_SCRIPT,
      verdict: "PASS",
      exitCode: 0,
    });
    expect(r.err).toContain(`ran ${BKIT_GATE_CHANGED_SCRIPT}`);
  });

  it("counts files committed since --base", async () => {
    const base = checkout({ [BKIT_GATE_CHANGED_SCRIPT]: "x" });
    write("src/b.ts", "committed\n");
    commit("step work");
    const r = await changed([`--base=${base}`]);
    expect(r.code).toBe(0);
    expect(ranWith()).toEqual([BKIT_GATE_CHANGED_SCRIPT, "src/b.ts"]);
  });

  it("returns FAIL with exit 1 when bkit:gate:changed fails", async () => {
    checkout({ [BKIT_GATE_CHANGED_SCRIPT]: "x" });
    write("src/a.ts", "changed\n");
    vi.stubEnv("FAKE_EXIT", "2");
    const r = await changed([]);
    expect(r.code).toBe(1);
    expect(r.json).toMatchObject({ verdict: "FAIL", exitCode: 2 });
  });

  it("runs nothing and exits 0 when no file changed", async () => {
    checkout({ [BKIT_GATE_CHANGED_SCRIPT]: "x", [STATIC]: "y" });
    const r = await changed([`--fallback=${STATIC}`]);
    expect(r.code).toBe(0);
    expect(ranWith()).toBeNull();
    expect(r.json).toMatchObject({ files: [], gate: null, verdict: null, exitCode: null });
  });

  it("runs the --fallback gate with no file arguments when bkit:gate:changed is undeclared", async () => {
    checkout({ [BKIT_GATE_CHANGED_SCRIPT]: " ", [STATIC]: "y" });
    write("src/a.ts", "changed\n");
    const r = await changed([`--fallback=${STATIC}`]);
    expect(r.code).toBe(0);
    expect(ranWith()).toEqual([STATIC]);
    expect(r.json).toMatchObject({ files: ["src/a.ts"], gate: STATIC, verdict: "PASS" });
  });

  it("runs the --fallback gate even when no file changed, as it did before", async () => {
    checkout({ [STATIC]: "y" });
    const r = await changed([`--fallback=${STATIC}`]);
    expect(r.code).toBe(0);
    expect(ranWith()).toEqual([STATIC]);
  });

  it("exits 3 when neither bkit:gate:changed nor the --fallback gate is declared", async () => {
    checkout({});
    write("src/a.ts", "changed\n");
    const r = await changed([`--fallback=${STATIC}`]);
    expect(r.code).toBe(3);
    expect(ranWith()).toBeNull();
    expect(r.err).toContain(BKIT_GATE_CHANGED_SCRIPT);
  });

  it("exits 4 when the gate could not run", async () => {
    checkout({ [BKIT_GATE_CHANGED_SCRIPT]: "x" });
    write("src/a.ts", "changed\n");
    vi.stubEnv("FAKE_EXIT", "127");
    const r = await changed([]);
    expect(r.code).toBe(4);
    expect(r.json).toMatchObject({ verdict: null, exitCode: 127 });
  });

  it("refuses a --base that names no commit", async () => {
    checkout({ [BKIT_GATE_CHANGED_SCRIPT]: "x" });
    const r = await changed(["--base=no-such-ref"]);
    expect(r.code).toBe(2);
    expect(ranWith()).toBeNull();
  });
});
