import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { runCommand } from "../lib";
import { ciCommand, gateFails, readSummary, resolveBaseRef, slopScanArgv } from "./ci";

const REPO = path.resolve(__dirname, "../../../..");
const REPO_BIN = path.join(REPO, "node_modules", ".bin");

const dirs: string[] = [];
const ENV_KEYS = [
  "PATH",
  "TMPDIR",
  "SLOP_BASE_REF",
  "FAKE_SLOP_JSON",
  "FAKE_SLOP_EXIT",
  "FAKE_SLOP_LOG",
];
let savedEnv: Record<string, string | undefined> = {};
let tmpRoot = "";

// Captured before beforeEach points TMPDIR at a per-test directory.
const SYSTEM_TMP = os.tmpdir();

const mkdir = (prefix: string) => {
  const d = fs.realpathSync(fs.mkdtempSync(path.join(SYSTEM_TMP, prefix)));
  dirs.push(d);
  return d;
};

beforeEach(() => {
  savedEnv = Object.fromEntries(ENV_KEYS.map((k) => [k, process.env[k]]));
  delete process.env.SLOP_BASE_REF;
  // The base worktree lands under os.tmpdir(); a private TMPDIR lets each test prove it was removed.
  tmpRoot = mkdir("bkit-ci-tmp-");
  process.env.TMPDIR = tmpRoot;
});

afterEach(() => {
  for (const [k, v] of Object.entries(savedEnv)) {
    if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  }
  for (const d of dirs.splice(0)) fs.rmSync(d, { recursive: true, force: true });
});

const git = (cwd: string, ...args: string[]) =>
  spawnSync("git", ["-c", "user.email=t@t", "-c", "user.name=t", ...args], {
    cwd,
    encoding: "utf-8",
  }).stdout.trim();

const write = (cwd: string, rel: string, body: string) => {
  fs.mkdirSync(path.dirname(path.join(cwd, rel)), { recursive: true });
  fs.writeFileSync(path.join(cwd, rel), body);
};

const commit = (cwd: string, msg: string) => {
  git(cwd, "add", "-A");
  git(cwd, "commit", "-q", "--allow-empty", "-m", msg);
  return git(cwd, "rev-parse", "HEAD");
};

/** A repo with two commits; `marker` differs between them so the base worktree's contents are checkable. */
function repo() {
  const cwd = mkdir("bkit-ci-repo-");
  git(cwd, "init", "-q", "-b", "feat/1-x");
  write(cwd, "marker", "base\n");
  const base = commit(cwd, "base");
  write(cwd, "marker", "head\n");
  const head = commit(cwd, "head");
  return { cwd, base, head };
}

/**
 * Put a fake `slop-scan` first on PATH. It prints `$FAKE_SLOP_JSON` (a file),
 * exits `$FAKE_SLOP_EXIT`, and logs its argv, cwd and the base worktree's `marker`.
 */
function fakeSlop(summary: Record<string, unknown> | string, exit = 0) {
  const bin = mkdir("bkit-ci-bin-");
  const json = path.join(bin, "out.json");
  fs.writeFileSync(
    json,
    typeof summary === "string" ? summary : JSON.stringify({ schemaVersion: 2, summary }),
  );
  const log = path.join(bin, "calls.log");
  fs.writeFileSync(
    path.join(bin, "slop-scan"),
    [
      "#!/bin/sh",
      'base=""; prev=""',
      'for a in "$@"; do [ "$prev" = "--base" ] && base="$a"; prev="$a"; done',
      'printf "argv=%s\\ncwd=%s\\nmarker=%s\\n" "$*" "$(pwd -P)" "$(cat "$base/marker" 2>/dev/null)" >> "$FAKE_SLOP_LOG"',
      'cat "$FAKE_SLOP_JSON"',
      'echo "fake slop-scan stderr" >&2',
      'exit "${FAKE_SLOP_EXIT:-0}"',
      "",
    ].join("\n"),
    { mode: 0o755 },
  );
  process.env.PATH = `${bin}${path.delimiter}${savedEnv.PATH ?? ""}`;
  process.env.FAKE_SLOP_JSON = json;
  process.env.FAKE_SLOP_EXIT = String(exit);
  process.env.FAKE_SLOP_LOG = log;
  return { calls: () => (fs.existsSync(log) ? fs.readFileSync(log, "utf-8") : "") };
}

const summary = (over: Record<string, number> = {}) => ({
  addedCount: 0,
  resolvedCount: 0,
  worsenedCount: 0,
  netFindingCount: 0,
  netRepoScore: 0,
  ...over,
});

async function run(cwd: string, argv: string[]) {
  const out: string[] = [];
  const err: string[] = [];
  const code = await runCommand(["ci", "slop", ...argv], [ciCommand], {
    classicVerbs: new Set(),
    cwd,
    io: { stdout: (t) => out.push(t), stderr: (t) => err.push(t) },
  });
  return { code, json: out.length ? JSON.parse(out.join("")) : undefined, err: err.join("") };
}

/** No base worktree left behind: not registered in the repo, nothing left in TMPDIR. */
function expectCleaned(cwd: string) {
  expect(git(cwd, "worktree", "list", "--porcelain").match(/^worktree /gm)).toHaveLength(1);
  expect(fs.readdirSync(tmpRoot).filter((f) => f.startsWith("slop-delta"))).toEqual([]);
}

describe("bkit ci slop — gate decision", () => {
  it("fails on a net-new finding, prints the guidance, and removes the base worktree", async () => {
    const { cwd, base } = repo();
    const fake = fakeSlop(summary({ addedCount: 1, netFindingCount: 1, netRepoScore: 3.5 }));
    const r = await run(cwd, [`--base=${base}`]);
    expect(r.code).toBe(1);
    expect(r.json).toEqual({
      passed: false,
      skipped: null,
      baseRef: base,
      base,
      added: 1,
      resolved: 0,
      worsened: 0,
      netFindingCount: 1,
      netScore: 3.5,
    });
    expect(r.err).toContain(
      "[bkit-ci] added 1, resolved 0, worsened 0; net findings 1, net score 3.50",
    );
    expect(r.err).toContain("FAIL — change adds/worsens slop on net.");
    expect(r.err).toContain("ONLY fix net-new, NEVER the baseline");
    expect(r.err).toContain("Inspect: slop-scan delta --base <base-worktree> --head .");
    expect(fake.calls()).toMatch(/argv=delta --base \S+ --head \. --json/);
    expectCleaned(cwd);
  });

  it("fails on a net score rise with no net count change", async () => {
    const { cwd, base } = repo();
    fakeSlop(summary({ worsenedCount: 1, netRepoScore: 0.5 }));
    const r = await run(cwd, [`--base=${base}`]);
    expect(r.code).toBe(1);
    expect(r.json.passed).toBe(false);
  });

  it("passes a pre-existing finding that only moved: added and resolved net to zero (#226)", async () => {
    const { cwd, base } = repo();
    fakeSlop(summary({ addedCount: 1, resolvedCount: 1 }));
    const r = await run(cwd, [`--base=${base}`]);
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({ passed: true, added: 1, resolved: 1, netFindingCount: 0 });
    expect(r.err).toContain("OK — no net-new or worsened findings (baseline line-shifts ignored).");
    expectCleaned(cwd);
  });

  it("treats a net score at or below 0.001 as float noise", async () => {
    const { cwd, base } = repo();
    fakeSlop(summary({ netRepoScore: 0.001 }));
    expect((await run(cwd, [`--base=${base}`])).code).toBe(0);
  });

  it("passes when the change only resolves findings", async () => {
    const { cwd, base } = repo();
    fakeSlop(summary({ resolvedCount: 2, netFindingCount: -2, netRepoScore: -7 }));
    expect((await run(cwd, [`--base=${base}`])).code).toBe(0);
  });

  it("compares the base commit's tree against the working-tree top, even when run from a subdirectory", async () => {
    const { cwd, base } = repo();
    write(cwd, "sub/dir/file.txt", "x\n");
    const fake = fakeSlop(summary());
    expect((await run(path.join(cwd, "sub", "dir"), [`--base=${base}`])).code).toBe(0);
    expect(fake.calls()).toContain("marker=base");
    expect(fake.calls()).toContain(`cwd=${cwd}\n`);
  });
});

describe("bkit ci slop — base ref resolution", () => {
  it("skips (exit 0) when the base ref is not present locally, without running slop-scan", async () => {
    const { cwd } = repo();
    const fake = fakeSlop(summary({ netFindingCount: 9 }));
    const r = await run(cwd, ["--base=origin/nope"]);
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({
      passed: true,
      skipped: "base-not-found",
      baseRef: "origin/nope",
      base: null,
    });
    expect(r.err).toContain("base ref 'origin/nope' not found locally");
    expect(fake.calls()).toBe("");
  });

  it("skips (exit 0) when the base resolves to HEAD", async () => {
    const { cwd, head } = repo();
    const fake = fakeSlop(summary({ netFindingCount: 9 }));
    const r = await run(cwd, ["--base=HEAD"]);
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({ skipped: "base-is-head", base: head });
    expect(fake.calls()).toBe("");
    expectCleaned(cwd);
  });

  it("reads $SLOP_BASE_REF when --base is not given, and --base wins over it", async () => {
    const { cwd, base } = repo();
    fakeSlop(summary());
    process.env.SLOP_BASE_REF = base;
    expect((await run(cwd, [])).json.base).toBe(base);
    expect((await run(cwd, ["--base=HEAD"])).json.skipped).toBe("base-is-head");
  });

  it("defaults to the merge-base with origin/dev, then origin/main, then HEAD~1", () => {
    const { cwd, base, head } = repo();
    commit(cwd, "third");
    expect(resolveBaseRef(cwd, undefined)).toBe(head);
    git(cwd, "update-ref", "refs/remotes/origin/main", head);
    expect(resolveBaseRef(cwd, undefined)).toBe(head);
    git(cwd, "update-ref", "refs/remotes/origin/dev", base);
    expect(resolveBaseRef(cwd, undefined)).toBe(base);
    expect(resolveBaseRef(cwd, "given")).toBe("given");
  });

  it("falls back to HEAD on a single-commit repo, which then skips as base-is-head", async () => {
    const cwd = mkdir("bkit-ci-one-");
    git(cwd, "init", "-q");
    commit(cwd, "only");
    fakeSlop(summary());
    const r = await run(cwd, []);
    expect(r.code).toBe(0);
    expect(r.json.skipped).toBe("base-is-head");
  });

  it("is a usage error outside a git repository", async () => {
    const r = await run(mkdir("bkit-ci-nogit-"), []);
    expect(r.code).toBe(2);
    expect(r.err).toContain("not inside a git repository");
  });
});

describe("bkit ci slop — slop-scan failures", () => {
  it("exits 4 when slop-scan fails, logs its stderr, and still removes the worktree", async () => {
    const { cwd, base } = repo();
    fakeSlop(summary(), 2);
    const r = await run(cwd, [`--base=${base}`]);
    expect(r.code).toBe(4);
    expect(r.json).toBeUndefined();
    expect(r.err).toContain("slop-scan delta failed (exit 2)");
    expect(r.err).toContain("fake slop-scan stderr");
    expectCleaned(cwd);
  });

  it("exits 3, not as a gate failure, when slop-scan could not run (126 / 127)", async () => {
    const { cwd, base } = repo();
    fakeSlop(summary(), 127);
    const r = await run(cwd, [`--base=${base}`]);
    expect(r.code).toBe(3);
    expect(r.err).toContain("slop-scan could not run");
    expectCleaned(cwd);
  });

  it.each([
    [
      "a dropped net field",
      JSON.stringify({ summary: { addedCount: 0, netFindingCount: 0 } }),
      "summary.resolvedCount",
    ],
    ["no summary", JSON.stringify({ schemaVersion: 3 }), "summary"],
    ["output that is not JSON", "not json", "summary (output is not JSON)"],
  ])("exits 4 on %s instead of silently passing", async (_, out, missing) => {
    const { cwd, base } = repo();
    fakeSlop(out);
    const r = await run(cwd, [`--base=${base}`]);
    expect(r.code).toBe(4);
    expect(r.err).toContain(`has no ${missing}`);
    expectCleaned(cwd);
  });

  it("exits 5 when the base worktree cannot be created", async () => {
    const { cwd, base } = repo();
    // A file where git keeps its worktree records makes `git worktree add` fail.
    fs.writeFileSync(path.join(cwd, ".git", "worktrees"), "");
    const fake = fakeSlop(summary());
    const r = await run(cwd, [`--base=${base}`]);
    expect(r.code).toBe(5);
    expect(r.err).toContain(`could not check out base ${base} as a worktree`);
    expect(fake.calls()).toBe("");
    expect(fs.readdirSync(tmpRoot)).toEqual([]);
  });
});

describe("bkit ci slop — large reports", () => {
  it("reads a report far larger than a pipe buffer from a slop-scan that exits straight after writing", async () => {
    const { cwd, base } = repo();
    const bin = mkdir("bkit-ci-bin-");
    const report = JSON.stringify({
      schemaVersion: 2,
      padding: "x".repeat(256 * 1024),
      summary: summary({ addedCount: 2, resolvedCount: 2 }),
    });
    fs.writeFileSync(path.join(bin, "report.json"), report);
    fs.writeFileSync(
      path.join(bin, "slop-scan"),
      [
        "#!/usr/bin/env node",
        'const fs = require("node:fs");',
        `process.stdout.write(fs.readFileSync(${JSON.stringify(path.join(bin, "report.json"))}, "utf-8"));`,
        "process.exit(0);",
        "",
      ].join("\n"),
      { mode: 0o755 },
    );
    process.env.PATH = `${bin}${path.delimiter}${savedEnv.PATH ?? ""}`;
    const r = await run(cwd, [`--base=${base}`]);
    expect(r.err).not.toContain("output is not JSON");
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({ passed: true, added: 2, resolved: 2, netFindingCount: 0 });
    expectCleaned(cwd);
  });
});

describe("slop-scan resolution and summary reading", () => {
  it("uses slop-scan from PATH, else npx --no-install", () => {
    const bin = mkdir("bkit-ci-path-");
    expect(slopScanArgv({ PATH: bin })).toEqual(["npx", "--no-install", "slop-scan"]);
    fs.writeFileSync(path.join(bin, "slop-scan"), "#!/bin/sh\n", { mode: 0o755 });
    expect(slopScanArgv({ PATH: bin })).toEqual(["slop-scan"]);
  });

  it("gates on the net figures only", () => {
    const s = readSummary(
      JSON.stringify({ summary: summary({ addedCount: 5, resolvedCount: 5 }) }),
    );
    expect("missing" in s).toBe(false);
    expect(gateFails(s as ReturnType<typeof summary>)).toBe(false);
    expect(gateFails(summary({ netFindingCount: 1 }))).toBe(true);
    expect(gateFails(summary({ netRepoScore: 0.0011 }))).toBe(true);
  });
});

// Behaviour cases against the real slop-scan this repo installs, end to end
// through the command.
describe("bkit ci slop — real slop-scan", () => {
  const CLEAN = "export function load(p: string) {\n  return JSON.parse(p);\n}\n";
  const EMPTY_CATCH = "export function risky() {\n  try {\n    doThing();\n  } catch (e) {}\n}\n";

  const realRepo = (files: Record<string, string>) => {
    const cwd = mkdir("bkit-ci-real-");
    git(cwd, "init", "-q");
    for (const [rel, body] of Object.entries(files)) write(cwd, rel, body);
    const base = commit(cwd, "base");
    commit(cwd, "head");
    process.env.PATH = `${REPO_BIN}${path.delimiter}${savedEnv.PATH ?? ""}`;
    return { cwd, base };
  };

  it("a genuinely new finding fails the gate", async () => {
    const { cwd, base } = realRepo({ "x.ts": CLEAN });
    write(cwd, "y.ts", EMPTY_CATCH);
    const r = await run(cwd, [`--base=${base}`]);
    expect(r.code).toBe(1);
    expect(r.json.netFindingCount).toBeGreaterThan(0);
    expectCleaned(cwd);
  }, 30_000);

  it("an unchanged tree nets to zero and passes — and every gated summary field is present", async () => {
    const { cwd, base } = realRepo({ "x.ts": CLEAN });
    const r = await run(cwd, [`--base=${base}`]);
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({ passed: true, netFindingCount: 0 });
  }, 30_000);

  it("a pre-existing finding that merely moves nets to zero and passes (#226)", async () => {
    const { cwd, base } = realRepo({ "y.ts": EMPTY_CATCH });
    write(cwd, "y.ts", "// new line one\n// new line two\n" + EMPTY_CATCH);
    const r = await run(cwd, [`--base=${base}`]);
    expect(r.code).toBe(0);
    expect(r.json.netFindingCount).toBe(0);
  }, 30_000);
});

describe("bkit ci slop — interrupted", () => {
  it("removes the base worktree when SIGTERM arrives mid-scan, then dies of the signal", () => {
    const { cwd, base } = repo();
    // The fake signals its parent (the command's process) while the scan blocks.
    const bin = mkdir("bkit-ci-sig-");
    fs.writeFileSync(
      path.join(bin, "slop-scan"),
      `#!/bin/sh\nkill -TERM $PPID\nsleep 0.2\necho '${JSON.stringify({ summary: summary() })}'\n`,
      { mode: 0o755 },
    );
    const driver = path.join(bin, "driver.mts");
    fs.writeFileSync(
      driver,
      [
        `import { runCommand } from ${JSON.stringify(path.join(__dirname, "..", "lib.ts"))};`,
        `import { ciCommand } from ${JSON.stringify(path.join(__dirname, "ci.ts"))};`,
        `const code = await runCommand(["ci", "slop", "--base=${base}"], [ciCommand], { classicVerbs: new Set(), cwd: ${JSON.stringify(cwd)} });`,
        `process.stdout.write("returned " + code);`,
      ].join("\n"),
    );
    const res = spawnSync(path.join(REPO_BIN, "tsx"), [driver], {
      cwd: REPO,
      encoding: "utf-8",
      env: { ...process.env, PATH: `${bin}${path.delimiter}${savedEnv.PATH ?? ""}` },
    });
    expect(res.stdout).not.toContain("returned");
    expect(res.status === 143 || res.signal === "SIGTERM").toBe(true);
    expectCleaned(cwd);
  }, 30_000);
});
