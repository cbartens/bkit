import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { BKIT_GATE_CHANGED_SCRIPT } from "../../install/manifest";
import { runCommand } from "../lib";
import { PACKAGE_RUNNER } from "../../shared/package-manager";
import {
  changedBetween,
  changedFiles,
  deletedFiles,
  importersOf,
  snapshotTree,
} from "./tests-changed";
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
 * $FAKE_ARGS, then exits FAKE_EXIT. With FAKE_LOCK_GIVEUP it writes a tests-lock give-up to
 * $LOCAL_STACK_LOCK_STATUS_FILE and exits 75.
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
    '#!/bin/sh\nfor a in "$@"; do echo "$a" >> "$FAKE_ARGS"; done\necho "ran $1"\n' +
      'if [ -n "$FAKE_LOCK_GIVEUP" ]; then echo "[machine-lock] a reworded line the engine never reads"; printf "lock=tests\\noutcome=gave-up\\nholder=another agent — /tmp/holder (pid 123, since 12:00:00)\\n" > "$LOCAL_STACK_LOCK_STATUS_FILE"; exit 75; fi\n' +
      'exit "${FAKE_EXIT:-0}"\n',
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

describe("snapshotTree / changedBetween", () => {
  it("the tested snapshot holds uncommitted and untracked files", () => {
    checkout({});
    const head = git("rev-parse", "HEAD");
    write("src/a.ts", "changed\n");
    write("src/new.ts", "new\n");
    write("ignored/out.ts");
    fs.rmSync(path.join(cwd, "src/b.ts"));
    const sha = snapshotTree(cwd);
    expect(sha).toMatch(/^[0-9a-f]{40}$/);
    expect(git("cat-file", "-t", sha!)).toBe("commit");
    expect(git("rev-parse", `${sha!}^`)).toBe(head);
    expect(git("ls-tree", "-r", "--name-only", sha!).split("\n")).toEqual([
      ".gitignore",
      "package.json",
      "src/a.ts",
      "src/new.ts",
    ]);
    expect(git("show", `${sha!}:src/a.ts`)).toBe("changed");
  });

  it("snapshotting leaves the index and working tree as they were", () => {
    checkout({});
    write("src/a.ts", "changed\n");
    write("src/staged.ts");
    git("add", "src/staged.ts");
    write("src/new.ts");
    const before = {
      status: git("status", "--porcelain=v1", "-uall"),
      cached: git("diff", "--cached", "--name-status"),
      refs: git("for-each-ref"),
      head: git("rev-parse", "HEAD"),
      stash: git("stash", "list"),
    };
    expect(snapshotTree(cwd)).toMatch(/^[0-9a-f]{40}$/);
    expect({
      status: git("status", "--porcelain=v1", "-uall"),
      cached: git("diff", "--cached", "--name-status"),
      refs: git("for-each-ref"),
      head: git("rev-parse", "HEAD"),
      stash: git("stash", "list"),
    }).toEqual(before);
  });

  it("a checkout with no commit yet snapshots with no parent", () => {
    cwd = tmp("bkit-tests-changed-empty-");
    git("init", "-q");
    write("src/a.ts");
    const sha = snapshotTree(cwd);
    expect(git("cat-file", "-t", sha!)).toBe("commit");
    expect(git("rev-list", "--parents", "-n", "1", sha!)).toBe(sha);
  });

  it("changedBetween lists the existing files that differ from a snapshot, and the deleted ones apart", () => {
    checkout({});
    write("src/a.ts", "changed\n");
    const snap = snapshotTree(cwd)!;
    expect(changedBetween(cwd, snap)).toEqual({ files: [], deleted: [] });
    write("src/a.ts", "changed again\n");
    write("src/new.ts");
    fs.rmSync(path.join(cwd, "src/b.ts"));
    expect(changedBetween(cwd, snap)).toEqual({
      files: ["src/a.ts", "src/new.ts"],
      deleted: ["src/b.ts"],
    });
  });

  it("changedBetween is null when the snapshot is gone", () => {
    checkout({});
    expect(changedBetween(cwd, "f".repeat(40))).toBeNull();
  });
});

describe("deletedFiles", () => {
  it("deletedFiles lists a file removed since the base", () => {
    const base = checkout({});
    write("src/gone.ts");
    write("src/back.ts");
    commit("more");
    const start = git("rev-parse", "HEAD");
    fs.rmSync(path.join(cwd, "src/a.ts"));
    fs.rmSync(path.join(cwd, "src/back.ts"));
    commit("drop a and back");
    write("src/back.ts", "restored\n");
    fs.rmSync(path.join(cwd, "src/b.ts"));
    expect(deletedFiles(cwd, start)).toEqual(["src/a.ts", "src/b.ts"]);
    expect(deletedFiles(cwd, base)).toEqual(["src/a.ts", "src/b.ts"]);
  });
});

describe("importersOf", () => {
  it("importersOf lists the unchanged files that mention a deleted file's name", () => {
    checkout({});
    write("src/widget.ts", "export const w = 1;\n");
    write("src/user.ts", 'import { w } from "./widget";\n');
    write("docs/notes.md", "see widget for details\n");
    write("src/other.ts", "export const o = 2;\n");
    const base = commit("widget");
    fs.rmSync(path.join(cwd, "src/widget.ts"));
    fs.rmSync(path.join(cwd, "src/a.ts"));
    expect(importersOf(cwd, base, ["src/widget.ts", "src/lonely.ts"])).toEqual(
      new Map([
        ["src/widget.ts", ["docs/notes.md", "src/user.ts"]],
        ["src/lonely.ts", []],
      ]),
    );
  });

  it("importersOf leaves out a file that no longer exists", () => {
    checkout({});
    write("src/widget.ts", "export const w = 1;\n");
    write("src/user.ts", 'import { w } from "./widget";\n');
    const base = commit("widget");
    fs.rmSync(path.join(cwd, "src/widget.ts"));
    fs.rmSync(path.join(cwd, "src/user.ts"));
    expect(importersOf(cwd, base, ["src/widget.ts"])).toEqual(new Map([["src/widget.ts", []]]));
  });

  it("importersOf returns null when the base tree cannot be searched", () => {
    checkout({});
    write("src/widget.ts", "export const w = 1;\n");
    write("src/user.ts", 'import { w } from "./widget";\n');
    const base = commit("widget");
    const blob = git("rev-parse", `${base}:src/user.ts`);
    fs.rmSync(path.join(cwd, ".git/objects", blob.slice(0, 2), blob.slice(2)));
    fs.rmSync(path.join(cwd, "src/widget.ts"));
    expect(importersOf(cwd, base, ["src/widget.ts"])).toBeNull();
    expect(importersOf(cwd, "0".repeat(40), ["src/widget.ts"])).toBeNull();
  });

  it("importersOf returns null when a blob is unreadable even though another file matched", () => {
    checkout({});
    write("src/widget.ts", "export const w = 1;\n");
    write("src/user.ts", 'import { w } from "./widget";\n');
    const base = commit("widget");
    const blob = git("rev-parse", `${base}:src/widget.ts`);
    fs.rmSync(path.join(cwd, ".git/objects", blob.slice(0, 2), blob.slice(2)));
    fs.rmSync(path.join(cwd, "src/widget.ts"));
    expect(importersOf(cwd, base, ["src/widget.ts"])).toBeNull();
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

  it("changed-since exits 81 with the holder read from the status file", async () => {
    checkout({ [BKIT_GATE_CHANGED_SCRIPT]: "x" });
    write("src/a.ts", "changed\n");
    const temp = tmp("bkit-tests-changed-temp-");
    vi.stubEnv("TMPDIR", temp);
    vi.stubEnv("FAKE_LOCK_GIVEUP", "1");
    const r = await changed(["--lock-wait-s=0"]);
    expect(r.code).toBe(81);
    expect(r.json).toMatchObject({
      verdict: null,
      exitCode: 75,
      lockHolder: "another agent — /tmp/holder (pid 123, since 12:00:00)",
    });
    expect(fs.readdirSync(temp)).toEqual([]);
  });

  it("exits 1 when the gate exits 75 and writes no status file", async () => {
    checkout({ [BKIT_GATE_CHANGED_SCRIPT]: "x" });
    write("src/a.ts", "changed\n");
    vi.stubEnv("FAKE_EXIT", "75");
    const r = await changed([]);
    expect(r.code).toBe(1);
    expect(r.json).toMatchObject({ verdict: "FAIL", exitCode: 75, lockHolder: null });
  });

  it("refuses a --base that names no commit", async () => {
    checkout({ [BKIT_GATE_CHANGED_SCRIPT]: "x" });
    const r = await changed(["--base=no-such-ref"]);
    expect(r.code).toBe(2);
    expect(ranWith()).toBeNull();
  });
});
