import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { requireTsx } from "../../../../../vitest.tsx-bin";
import { runCommand } from "../lib";
import {
  ciCommand,
  EXIT_VALE_FAILED,
  formatFindings,
  gateFails,
  globToRegExp,
  netNewFindings,
  proseFiles,
  readSummary,
  resolveBaseRef,
  slopScanArgv,
} from "./ci";

const REPO = path.resolve(__dirname, "../../../../..");
const REPO_BIN = path.join(REPO, "node_modules", ".bin");

const dirs: string[] = [];
const ENV_KEYS = [
  "PATH",
  "TMPDIR",
  "SLOP_BASE_REF",
  "FAKE_SLOP_JSON",
  "FAKE_SLOP_EXIT",
  "FAKE_SLOP_LOG",
  "FAKE_VALE_EXIT",
  "FAKE_VALE_LOG",
  "FAKE_VALE_SYNC",
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

/** PATH with `bin` first, ahead of the PATH the test started with. */
const pathWith = (bin: string) => `${bin}${path.delimiter}${savedEnv.PATH ?? ""}`;

/** A child killed by SIGTERM reports either exit status 143 (shell) or signal SIGTERM (node). */
const diedOfSigterm = (res: { status: number | null; signal: NodeJS.Signals | null }) =>
  res.status === 143 || res.signal === "SIGTERM";

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
  process.env.PATH = pathWith(bin);
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

/** A `slop-scan delta --json` change; `added` / `worsened` carry a head snapshot, `resolved` a base one. */
const change = (status: string, file: string | null, ruleId: string, message: string, line = 1) => {
  const snapshot = { message, primaryLocation: { path: file, line }, locations: [] };
  return {
    status,
    path: file,
    ruleId,
    base: status === "added" ? null : snapshot,
    head: status === "resolved" ? null : snapshot,
  };
};

async function run(cwd: string, argv: string[], verb = "slop") {
  const out: string[] = [];
  const err: string[] = [];
  const code = await runCommand(["ci", verb, ...argv, "--json"], [ciCommand], {
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
      findings: [],
    });
    expect(r.err).toContain(
      "[bkit-ci] added 1, resolved 0, worsened 0; net findings 1, net score 3.50",
    );
    expect(r.err).toContain("names no single net-new finding");
    expect(r.err).toContain("FAIL — change adds/worsens slop on net.");
    expect(r.err).toContain("ONLY fix net-new, NEVER the baseline");
    expect(r.err).toContain("Inspect: slop-scan delta --base <base-worktree> --head .");
    expect(fake.calls()).toMatch(/argv=delta --base \S+ --head \. --json/);
    expectCleaned(cwd);
  });

  it("names each net-new and worsened finding in the log and the JSON", async () => {
    const { cwd, base } = repo();
    fakeSlop(
      JSON.stringify({
        summary: summary({ addedCount: 1, worsenedCount: 1, netFindingCount: 1, netRepoScore: 2 }),
        paths: [
          {
            path: "src/a.ts",
            changes: [
              change("added", "src/a.ts", "defensive.empty-catch", "Empty catch block", 12),
            ],
          },
          {
            path: "src/b.ts",
            changes: [change("worsened", "src/b.ts", "structure.x", "Too many params", 40)],
          },
        ],
        repoChanges: [],
      }),
    );
    const r = await run(cwd, [`--base=${base}`]);
    expect(r.code).toBe(1);
    expect(r.err).toContain("Net-new / worsened findings:");
    expect(r.err).toContain("added     src/a.ts:12  defensive.empty-catch  Empty catch block");
    expect(r.err).toContain("worsened  src/b.ts:40  structure.x  Too many params");
    expect(r.json.findings).toEqual([
      {
        status: "worsened",
        path: "src/b.ts",
        line: 40,
        ruleId: "structure.x",
        message: "Too many params",
      },
      {
        status: "added",
        path: "src/a.ts",
        line: 12,
        ruleId: "defensive.empty-catch",
        message: "Empty catch block",
      },
    ]);
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
    process.env.PATH = pathWith(bin);
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

describe("netNewFindings", () => {
  const report = (changes: ReturnType<typeof change>[]) =>
    JSON.stringify({ summary: summary(), paths: [{ path: "a.ts", changes }], repoChanges: [] });

  it("drops a line shift: one added and one resolved for the same file and rule", () => {
    expect(
      netNewFindings(
        report([change("resolved", "a.ts", "r", "m", 3), change("added", "a.ts", "r", "m", 5)]),
      ),
    ).toEqual([]);
  });

  it("cancels the shifted finding by message and keeps the new one", () => {
    expect(
      netNewFindings(
        report([
          change("resolved", "a.ts", "r", "old", 3),
          change("added", "a.ts", "r", "new", 4),
          change("added", "a.ts", "r", "old", 9),
        ]),
      ),
    ).toEqual([{ status: "added", path: "a.ts", line: 4, ruleId: "r", message: "new" }]);
  });

  it("reads repo-scoped changes, which have no path", () => {
    const raw = JSON.stringify({
      summary: summary(),
      paths: [],
      repoChanges: [change("added", null, "dup", "Duplicated function")],
    });
    expect(netNewFindings(raw)).toEqual([
      { status: "added", path: null, line: 1, ruleId: "dup", message: "Duplicated function" },
    ]);
    expect(formatFindings(netNewFindings(raw))[1]).toBe(
      "  added     (repo):1  dup  Duplicated function",
    );
  });

  it("is empty for a report with no change lists, or not JSON", () => {
    expect(netNewFindings(JSON.stringify({ summary: summary() }))).toEqual([]);
    expect(netNewFindings("not json")).toEqual([]);
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
    process.env.PATH = pathWith(REPO_BIN);
    return { cwd, base };
  };

  it("a genuinely new finding fails the gate", async () => {
    const { cwd, base } = realRepo({ "x.ts": CLEAN });
    write(cwd, "y.ts", EMPTY_CATCH);
    const r = await run(cwd, [`--base=${base}`]);
    expect(r.code).toBe(1);
    expect(r.json.netFindingCount).toBeGreaterThan(0);
    expect(r.json.findings).toContainEqual(
      expect.objectContaining({ status: "added", path: "y.ts", line: expect.any(Number) }),
    );
    expect(r.err).toMatch(/added {5}y\.ts:\d+ {2}\S+/);
    expectCleaned(cwd);
  }, 30_000);

  it("names the file and rule when a per-file finding's count grows (score rise, flat count)", async () => {
    const { cwd, base } = realRepo({ "y.ts": EMPTY_CATCH });
    write(cwd, "y.ts", "// shifted\n" + EMPTY_CATCH + EMPTY_CATCH.replace("risky", "risky2"));
    const r = await run(cwd, [`--base=${base}`]);
    expect(r.code).toBe(1);
    expect(r.json.netFindingCount).toBe(0);
    expect(
      r.json.findings.map((f: { path: string; line: number }) => `${f.path}:${f.line}`),
    ).toEqual(["y.ts:3", "y.ts:8"]);
    expect(r.err).toContain("y.ts:8  defensive.empty-catch  Found 2 empty catch blocks");
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
    const res = spawnSync(requireTsx(), [driver], {
      cwd: REPO,
      encoding: "utf-8",
      env: { ...process.env, PATH: pathWith(bin) },
    });
    expect(res.stdout).not.toContain("returned");
    expect(diedOfSigterm(res)).toBe(true);
    expectCleaned(cwd);
  }, 30_000);
});

// ---------------------------------------------------------------------------
// bkit ci prose
// ---------------------------------------------------------------------------

/**
 * Put a fake `vale` first on PATH. It logs each argv line to `$FAKE_VALE_LOG`, exits
 * `$FAKE_VALE_EXIT`, and on `vale sync` creates write-good when `$FAKE_VALE_SYNC=1`.
 */
function fakeVale(exit = 0, sync = false) {
  const bin = mkdir("bkit-ci-vale-");
  const log = path.join(bin, "calls.log");
  fs.writeFileSync(
    path.join(bin, "vale"),
    [
      "#!/bin/sh",
      'echo "$*" >> "$FAKE_VALE_LOG"',
      'if [ "$1" = "sync" ]; then',
      '  [ "$FAKE_VALE_SYNC" = "1" ] && mkdir -p .vale/styles/write-good',
      "  exit 0",
      "fi",
      'exit "${FAKE_VALE_EXIT:-0}"',
      "",
    ].join("\n"),
    { mode: 0o755 },
  );
  process.env.PATH = pathWith(bin);
  process.env.FAKE_VALE_LOG = log;
  process.env.FAKE_VALE_EXIT = String(exit);
  process.env.FAKE_VALE_SYNC = sync ? "1" : "0";
  return { calls: () => (fs.existsSync(log) ? fs.readFileSync(log, "utf-8").trim() : "") };
}

/** A repo with markdown at several depths, one under node_modules, and write-good synced. */
function proseRepo(writeGood = true) {
  const cwd = mkdir("bkit-ci-prose-");
  git(cwd, "init", "-q", "-b", "dev");
  for (const rel of [
    "README.md",
    "docs/a.md",
    "docs/plans/p.md",
    ".agents/rules.md",
    "node_modules/pkg/README.md",
    "src/x.ts",
  ]) {
    write(cwd, rel, "text\n");
  }
  if (writeGood) fs.mkdirSync(path.join(cwd, ".vale/styles/write-good"), { recursive: true });
  commit(cwd, "init");
  return cwd;
}

describe("bkit ci prose — file selection", () => {
  it("defaults to every markdown file outside node_modules", () => {
    expect(proseFiles(proseRepo(), ["**/*.md"])).toEqual([
      ".agents/rules.md",
      "README.md",
      "docs/a.md",
      "docs/plans/p.md",
    ]);
  });

  it("a one-level glob does not descend; ** does; each file once across globs", () => {
    const cwd = proseRepo();
    expect(proseFiles(cwd, ["docs/*.md", "*.md", "./docs/a.md"])).toEqual([
      "README.md",
      "docs/a.md",
    ]);
    expect(proseFiles(cwd, ["docs/**/*.md"])).toEqual(["docs/a.md", "docs/plans/p.md"]);
  });

  it("globToRegExp: * and ? stay within one folder, **/ spans zero or more", () => {
    const re = globToRegExp("**/*.md");
    expect(re.test("a.md")).toBe(true);
    expect(re.test("x/y/a.md")).toBe(true);
    expect(re.test("a.mdx")).toBe(false);
    expect(globToRegExp("docs/*.md").test("docs/plans/p.md")).toBe(false);
    expect(globToRegExp("doc?/a.md").test("docs/a.md")).toBe(true);
    expect(globToRegExp("a+b/(c).md").test("a+b/(c).md")).toBe(true);
  });
});

describe("bkit ci prose — gate", () => {
  it("skips with exit 0 when vale is not installed", async () => {
    const cwd = proseRepo();
    process.env.PATH = `${mkdir("bkit-ci-novale-")}${path.delimiter}/usr/bin${path.delimiter}/bin`;
    const r = await run(cwd, [], "prose");
    expect(r.code).toBe(0);
    expect(r.json).toEqual({ passed: true, skipped: "vale-missing", files: 0 });
    expect(r.err).toContain("vale not installed");
  });

  it("runs vale on exactly the selected files and passes on its exit 0", async () => {
    const cwd = proseRepo();
    const vale = fakeVale(0);
    const r = await run(cwd, ["--glob=docs/*.md", "--glob=*.md"], "prose");
    expect(r.code).toBe(0);
    expect(r.json).toEqual({ passed: true, skipped: null, files: 2 });
    expect(vale.calls()).toBe("README.md docs/a.md");
  });

  it("fails (exit 1) when vale reports alerts", async () => {
    const cwd = proseRepo();
    fakeVale(1);
    const r = await run(cwd, [], "prose");
    expect(r.code).toBe(1);
    expect(r.json).toMatchObject({ passed: false, skipped: null, files: 4 });
  });

  it("exits 6 on a vale runtime error", async () => {
    const cwd = proseRepo();
    fakeVale(2);
    const r = await run(cwd, [], "prose");
    expect(r.code).toBe(EXIT_VALE_FAILED);
    expect(r.json).toBeUndefined();
  });

  it("skips with exit 0 when no file matches", async () => {
    const cwd = proseRepo();
    const vale = fakeVale(0);
    const r = await run(cwd, ["--glob=missing/*.md"], "prose");
    expect(r.code).toBe(0);
    expect(r.json).toEqual({ passed: true, skipped: "no-files", files: 0 });
    expect(vale.calls()).toBe("");
  });
});

describe("bkit ci prose — write-good restore", () => {
  it("copies write-good from the main worktree into a linked one, without vale sync", async () => {
    const main = proseRepo();
    fs.writeFileSync(path.join(main, ".vale/styles/write-good/rule.yml"), "x\n");
    const linked = path.join(mkdir("bkit-ci-linked-"), "wt");
    git(main, "worktree", "add", "-q", "--detach", linked);
    const vale = fakeVale(0);
    const r = await run(linked, ["--glob=*.md"], "prose");
    expect(r.code).toBe(0);
    expect(fs.readFileSync(path.join(linked, ".vale/styles/write-good/rule.yml"), "utf-8")).toBe(
      "x\n",
    );
    expect(vale.calls()).toBe("README.md");
    expect(r.err).toContain("restoring");
  });

  it("falls back to vale sync when the main worktree has none", async () => {
    const cwd = proseRepo(false);
    const vale = fakeVale(0, true);
    const r = await run(cwd, ["--glob=*.md"], "prose");
    expect(r.code).toBe(0);
    expect(vale.calls().split("\n")).toEqual(["sync", "README.md"]);
  });

  it("skips loudly with exit 0 when vale sync cannot restore it either", async () => {
    const cwd = proseRepo(false);
    fakeVale(0, false);
    const r = await run(cwd, [], "prose");
    expect(r.code).toBe(0);
    expect(r.json).toEqual({ passed: true, skipped: "write-good-missing", files: 0 });
    expect(r.err).toContain("PROSE LINT SKIPPED");
  });
});

// ---------------------------------------------------------------------------
// bkit ci skip-token
// ---------------------------------------------------------------------------

describe("bkit ci skip-token", () => {
  it("exits 0 with the token when HEAD's message carries one, in subject or body", async () => {
    const { cwd } = repo();
    git(cwd, "commit", "-q", "--allow-empty", "-m", "docs(1): x bkit [skip ci]");
    expect((await run(cwd, [], "skip-token")).json).toMatchObject({
      ref: "HEAD",
      token: "[skip ci]",
    });
    git(cwd, "commit", "-q", "--allow-empty", "-m", "feat(1): x", "-m", "* chore: y [CI SKIP]");
    const r = await run(cwd, [], "skip-token");
    expect(r.code).toBe(0);
    expect(r.json.token).toBe("[CI SKIP]");
    expect(r.json.sha).toBe(git(cwd, "rev-parse", "HEAD"));
  });

  it("exits 1 with a null token when the message carries none; --ref reads another commit", async () => {
    const { cwd, base } = repo();
    git(cwd, "commit", "-q", "--allow-empty", "-m", "chore: [skip ci]");
    const r = await run(cwd, [`--ref=${base}`], "skip-token");
    expect(r.code).toBe(1);
    expect(r.json).toEqual({ ref: base, sha: base, token: null });
  });

  it("is a usage error when the commit cannot be read", async () => {
    const { cwd } = repo();
    const r = await run(cwd, ["--ref=no-such-ref"], "skip-token");
    expect(r.code).toBe(2);
    expect(r.err).toContain("cannot read commit 'no-such-ref'");
  });
});

// ---------------------------------------------------------------------------
// bkit ci min-push
// ---------------------------------------------------------------------------

describe("bkit ci min-push", () => {
  /** A repo whose first commit is `origin/dev`, then a branch commit writing `files`. */
  function pushed(files: Record<string, string>, pkg?: unknown) {
    const cwd = mkdir("bkit-ci-book-");
    git(cwd, "init", "-q", "-b", "feat/1-x");
    write(cwd, "src/a.ts", "export {};\n");
    if (pkg !== undefined) write(cwd, "package.json", JSON.stringify(pkg));
    const base = commit(cwd, "base");
    git(cwd, "update-ref", "refs/remotes/origin/dev", base);
    for (const [rel, body] of Object.entries(files)) write(cwd, rel, body);
    const head = commit(cwd, "docs(1): plan bkit [skip ci]");
    return { cwd, base, head };
  }

  it("exits 0 when every changed file is a plan log or a ledger", async () => {
    const { cwd, head } = pushed({
      "docs/plans/202610/logs/1-x/status.jsonl": "{}\n",
      "docs/plans/202610/1-x-plan.md": "# Plan\n",
      "docs/decisions.jsonl": "{}\n",
      ".bkit/friction.jsonl": "{}\n",
    });
    const r = await run(cwd, [`--ref=${head}`], "min-push");
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({ minPush: true, reason: null, changed: 4, outside: [] });
  });

  it("exits 1 naming the files outside, whatever the commit message says", async () => {
    const { cwd, head } = pushed({
      "docs/plans/202610/logs/1-x/status.jsonl": "{}\n",
      "docs/design.md": "# Design\n",
      "src/a.ts": "export const a = 1;\n",
    });
    const r = await run(cwd, [`--ref=${head}`], "min-push");
    expect(r.code).toBe(1);
    expect(r.json).toMatchObject({
      minPush: false,
      reason: "outside",
      changed: 3,
      outside: ["docs/design.md", "src/a.ts"],
    });
  });

  it("checks every --ref: one code ref among min-push refs fails the push", async () => {
    const { cwd, head } = pushed({ "docs/knowledge.jsonl": "{}\n" });
    git(cwd, "checkout", "-q", "-b", "feat/2-y", "origin/dev");
    write(cwd, "src/b.ts", "export {};\n");
    const code = commit(cwd, "feat(2): b");
    expect((await run(cwd, [`--ref=${head}`], "min-push")).code).toBe(0);
    const r = await run(cwd, [`--ref=${head}`, `--ref=${code}`], "min-push");
    expect(r.code).toBe(1);
    expect(r.json.outside).toEqual(["src/b.ts"]);
  });

  it("measures from the merge-base, so earlier code commits on the branch count", async () => {
    const { cwd } = pushed({ "src/c.ts": "export {};\n" });
    write(cwd, "docs/plans/202610/logs/1-x/status.jsonl", "{}\n");
    const head = commit(cwd, "docs(1): status bkit [skip ci]");
    const r = await run(cwd, [`--ref=${head}`], "min-push");
    expect(r.code).toBe(1);
    expect(r.json.outside).toEqual(["src/c.ts"]);
  });

  it("reads bkit.testing.minPushPaths from package.json; an explicit [] turns it off", async () => {
    const custom = pushed(
      { "notes/today.md": "x\n" },
      { bkit: { testing: { minPushPaths: ["notes/**"] } } },
    );
    expect((await run(custom.cwd, [`--ref=${custom.head}`], "min-push")).code).toBe(0);
    const off = pushed(
      { "docs/decisions.jsonl": "{}\n" },
      { bkit: { testing: { minPushPaths: [] } } },
    );
    const r = await run(off.cwd, [`--ref=${off.head}`], "min-push");
    expect(r.code).toBe(1);
    expect(r.json.reason).toBe("no-paths");
  });

  it("a top-level glob does not reach into folders", async () => {
    const { cwd, head } = pushed({ "docs/sub/notes.jsonl": "{}\n" });
    const r = await run(cwd, [`--ref=${head}`], "min-push");
    expect(r.code).toBe(1);
    expect(r.json.outside).toEqual(["docs/sub/notes.jsonl"]);
  });

  it("a push that changes no files is not proven a min push", async () => {
    const { cwd, base } = pushed({});
    const r = await run(cwd, [`--ref=${base}`], "min-push");
    expect(r.code).toBe(1);
    expect(r.json.reason).toBe("no-changes");
  });

  it("exits 7 when a commit or its base cannot be read", async () => {
    const { cwd } = pushed({ "docs/decisions.jsonl": "{}\n" });
    const unknown = await run(cwd, ["--ref=no-such-ref"], "min-push");
    expect(unknown.code).toBe(7);
    expect(unknown.json).toMatchObject({ minPush: false, reason: "unknown" });
    git(cwd, "update-ref", "-d", "refs/remotes/origin/dev");
    const noBase = await run(cwd, [], "min-push");
    expect(noBase.code).toBe(7);
    expect(noBase.err).toContain("neither origin/dev nor origin/main");
  });
});
