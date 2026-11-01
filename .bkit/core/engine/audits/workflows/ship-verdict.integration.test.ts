/**
 * audits/workflows/ship-verdict.integration.test.ts
 *
 * Boundary: real bash + real fs + the built `bkit roadmap feature` (dist/, no
 * mocks for the happy path). Runs the EXACT Step 6 `roadmap feature --strict`
 * line shipped in `.bkit/core/workflows/bkit-ship.md` — the SHIPPED row append, and
 * the exit that stops the step when the row did not land.
 */

import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

const REPO_ROOT = path.resolve(import.meta.dirname, "..", "..", "..", "..", "..");
const SHIP_MD = path.join(REPO_ROOT, ".bkit", "core", "workflows", "bkit-ship.md");
const BKIT_BIN = path.join(REPO_ROOT, "dist", "cli.js");
const FID = "412-export-csv";

/** The Step 6 `roadmap feature` line (the step's row writes need a status log and are not run). */
function extractStep6Line(): string {
  const content = fs.readFileSync(SHIP_MD, "utf-8");
  const start = content.search(/^## .*Step 6 —/m);
  expect(start, "bkit-ship.md Step 6 heading not found").toBeGreaterThan(-1);
  const step6 = content.slice(start, content.indexOf("### ", start));
  const line = step6
    .split("\n")
    .map((l) => l.trim())
    .find((l) => l.startsWith('"{BKIT}" roadmap feature '));
  expect(line, "Step 6 bkit roadmap feature line not found").toBeDefined();
  return line!;
}

/** The first line of `stepHeading`'s step in `file` that starts with `prefix`, trimmed. */
function extractStepLine(stepHeading: RegExp, prefix: string, file = SHIP_MD): string {
  const content = fs.readFileSync(file, "utf-8");
  const start = content.search(stepHeading);
  expect(start, `${stepHeading} heading not found`).toBeGreaterThan(-1);
  const end = content.indexOf("\n### ", start);
  const line = content
    .slice(start, end === -1 ? undefined : end)
    .split("\n")
    .map((l) => l.trim())
    .find((l) => l.startsWith(prefix));
  expect(line, `${stepHeading} line starting ${prefix} not found`).toBeDefined();
  return line!;
}

let tmpDir: string;
let worktree: string;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-ship-verdict-test-"));
  worktree = path.join(tmpDir, "wt");
  fs.mkdirSync(path.join(worktree, "docs"), { recursive: true });
  fs.mkdirSync(path.join(worktree, ".bkit"), { recursive: true });
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

/** Run the shipped line with `{BKIT}` = `bkit` (a path to an executable), from an unrelated cwd; its exit code. */
function runStep6(bkit: string): number {
  const snippet = extractStep6Line()
    .replaceAll("{BKIT}", bkit)
    .replaceAll("{WORKTREE_PATH}", worktree)
    .replaceAll("{FID}", FID);
  const otherDir = fs.mkdtempSync(path.join(tmpDir, "cwd-"));
  const res = spawnSync("bash", ["-c", `cd "${otherDir}"\n${snippet}`], { encoding: "utf-8" });
  return res.status ?? -1;
}

/** An executable `bkit` stand-in that prints `stdout` and exits `code`. */
function stub(stdout: string, code = 0): string {
  const file = path.join(tmpDir, `bkit-stub-${Math.random().toString(36).slice(2)}`);
  fs.writeFileSync(file, `#!/bin/bash\ncat <<'EOF'\n${stdout}\nEOF\nexit ${code}\n`, {
    mode: 0o755,
  });
  return file;
}

function realBkit(): string {
  const file = path.join(tmpDir, "bkit");
  fs.writeFileSync(file, `#!/bin/bash\nexec node "${BKIT_BIN}" "$@"\n`, { mode: 0o755 });
  return file;
}

describe("Step 6 SHIPPED row via bkit roadmap feature --strict (#380, matrix row 10)", () => {
  it("exits 0, and the SHIPPED row lands in the worktree ledger (not the cwd)", () => {
    expect(fs.existsSync(BKIT_BIN), "dist/cli.js missing — run the build").toBe(true);
    expect(runStep6(realBkit())).toBe(0);
    const rows = fs
      .readFileSync(path.join(worktree, ".bkit", "issues.jsonl"), "utf-8")
      .trim()
      .split("\n")
      .map((l) => JSON.parse(l));
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      schema: 3,
      kind: "feature",
      key: FID,
      by: { workflow: "ship", step: "ship-update-docs" },
      status: "SHIPPED",
    });
  });

  it("stops the step when the ledger could not be written (fail-open append, appended=false)", () => {
    fs.mkdirSync(path.join(worktree, ".bkit", "issues.jsonl"));
    expect(runStep6(realBkit())).not.toBe(0);
  });

  it("stops the step when the command crashed or was misused", () => {
    expect(runStep6(stub("", 2))).not.toBe(0);
    expect(runStep6(stub("not json", 1))).not.toBe(0);
  });
});

const GH_FIXTURE = path.join(REPO_ROOT, "tests", "fixtures", "gh");
const PR_NUMBER = 7;
const PR_URL = `https://github.com/example/example/pull/${PR_NUMBER}`;

/**
 * A `gh` on `tmpDir/bin` that records every argv to `tmpDir/gh-calls.jsonl`, answers `pr list` /
 * `pr create` / `pr view` / `pr merge` from a small state file and the bare origin's refs, and
 * hands every `gh api …` call (the CI gate's reads) to `tests/fixtures/gh/bin/gh`.
 */
function writeGhShim(): void {
  const bin = path.join(tmpDir, "bin");
  fs.mkdirSync(bin, { recursive: true });
  const script = `#!/usr/bin/env node
const fs = require("node:fs");
const cp = require("node:child_process");
const argv = process.argv.slice(2);
const dir = process.env.SHIM_DIR;
fs.appendFileSync(dir + "/gh-calls.jsonl", JSON.stringify({ argv }) + "\\n");
const stateFile = dir + "/pr-state.json";
const read = () => (fs.existsSync(stateFile) ? JSON.parse(fs.readFileSync(stateFile, "utf-8")) : null);
const flag = (name) => { const i = argv.indexOf(name); return i === -1 ? undefined : argv[i + 1]; };
const headOid = () => cp.spawnSync("git", ["--git-dir=" + process.env.SHIM_BARE, "rev-parse", "refs/heads/" + process.env.SHIM_BRANCH], { encoding: "utf-8" }).stdout.trim();
const fields = (s) => ({
  number: ${PR_NUMBER}, url: "${PR_URL}", state: s.state, baseRefName: s.base,
  headRefName: process.env.SHIM_BRANCH, headRefOid: headOid(), title: s.title,
  mergeCommit: s.state === "MERGED" ? { oid: s.mergeOid } : null, mergeable: "MERGEABLE",
});
const [a, b] = argv;
if (a === "pr" && b === "list") { const s = read(); console.log(JSON.stringify(s ? [fields(s)] : [])); }
else if (a === "pr" && b === "create") {
  fs.writeFileSync(stateFile, JSON.stringify({ state: "OPEN", base: flag("--base"), title: flag("--title") }));
  console.log("${PR_URL}");
}
else if (a === "pr" && b === "view") { const s = read(); if (!s) { console.error("no pull requests found"); process.exit(1); } console.log(JSON.stringify(fields(s))); }
else if (a === "pr" && b === "merge") {
  const s = read(); s.state = "MERGED"; s.mergeOid = headOid();
  fs.writeFileSync(stateFile, JSON.stringify(s));
}
else if (a === "run" && b === "list") console.log("[]");
else if (a === "api") {
  const res = cp.spawnSync("${path.join(GH_FIXTURE, "bin", "gh")}", argv, { stdio: "inherit", env: { ...process.env, BKIT_FAKE_GH_FIXTURE_ROOT: process.env.SHIM_FIXTURES } });
  process.exit(res.status ?? 1);
}
else { console.error("gh shim: unhandled " + argv.join(" ")); process.exit(1); }
`;
  fs.writeFileSync(path.join(bin, "gh"), script, { mode: 0o755 });
}

/** The argv of each recorded `gh` call, in order. */
function ghCalls(): string[][] {
  const file = path.join(tmpDir, "gh-calls.jsonl");
  if (!fs.existsSync(file)) return [];
  return fs
    .readFileSync(file, "utf-8")
    .trim()
    .split("\n")
    .filter(Boolean)
    .map((l) => (JSON.parse(l) as { argv: string[] }).argv);
}

/** The first recorded `gh <a> <b> …` argv; fails the test when none was recorded. */
function ghCall(a: string, b: string): string[] {
  const call = ghCalls().find((c) => c[0] === a && c[1] === b);
  expect(call, `gh ${a} ${b} was not called`).toBeDefined();
  return call!;
}

/** The value after `flag` in a recorded argv. */
function flagValue(argv: string[], flag: string): string | undefined {
  const at = argv.indexOf(flag);
  expect(at, `${flag} missing from gh ${argv.join(" ")}`).toBeGreaterThan(-1);
  return argv[at + 1];
}

/** The URL argument of every recorded `gh api` call. */
function ghApiUrls(): string[] {
  return ghCalls()
    .filter((c) => c[0] === "api")
    .map((c) => c[1] ?? "");
}

describe("deferred landing of a held build (ship, matrix: held → landed)", () => {
  const DEFERRED_FID = "715-held-landing";
  const MONTH = "202610";
  const BRANCH = `feat/${DEFERRED_FID}`;
  let bare: string;
  let repo: string;
  let env: NodeJS.ProcessEnv;
  let bkit: string;

  const sh = (cwd: string, ...args: string[]): string => {
    const res = spawnSync("git", args, { cwd, encoding: "utf-8", env });
    if (res.status !== 0) throw new Error(`git ${args.join(" ")}: ${res.stderr}`);
    return res.stdout.trim();
  };
  const bareRefs = () =>
    spawnSync("git", [`--git-dir=${bare}`, "for-each-ref", "--format=%(refname) %(objectname)"], {
      encoding: "utf-8",
    }).stdout.trim();

  /** A held build's leftovers: `dev` on the bare origin, `feat/{FID}` local-only with a commit. */
  beforeEach(() => {
    bare = path.join(tmpDir, "origin.git");
    repo = path.join(tmpDir, "repo");
    spawnSync("git", ["init", "-q", "--bare", "-b", "dev", bare]);
    fs.mkdirSync(repo);
    env = {
      ...process.env,
      GIT_DIR: path.join(repo, ".git"),
      GIT_WORK_TREE: repo,
      BKIT_RUNTIME: "LOCAL",
      SHIM_DIR: tmpDir,
      SHIM_BARE: bare,
      SHIM_BRANCH: BRANCH,
      SHIM_FIXTURES: path.join(tmpDir, "gh-fixtures"),
      PATH: [path.join(tmpDir, "bin"), process.env.PATH].join(path.delimiter),
    };
    spawnSync("git", ["init", "-q", "-b", "dev"], { cwd: repo, env });
    sh(repo, "config", "user.email", "t@t.t");
    sh(repo, "config", "user.name", "t");
    sh(repo, "remote", "add", "origin", bare);
    fs.writeFileSync(path.join(repo, "app.ts"), "export {};\n");
    sh(repo, "add", "-A");
    sh(repo, "commit", "-q", "-m", "init");
    sh(repo, "push", "-q", "origin", "dev");
    sh(repo, "checkout", "-q", "-b", BRANCH);
    fs.mkdirSync(path.join(repo, "docs", "plans", MONTH, "logs", DEFERRED_FID), {
      recursive: true,
    });
    fs.writeFileSync(
      path.join(repo, "docs", "plans", MONTH, "logs", DEFERRED_FID, "status.jsonl"),
      "",
    );
    fs.writeFileSync(path.join(repo, "app.ts"), "export const built = 1;\n");
    sh(repo, "add", "-A");
    sh(repo, "commit", "-q", "-m", "feat: held build");
    sh(repo, "fetch", "-q", "origin");
    bkit = realBkit();
    writeGhShim();
    // CI fixtures keyed by the head the PR will carry once pushed.
    const head = sh(repo, "rev-parse", "HEAD");
    const root = path.join(tmpDir, "gh-fixtures");
    for (const d of ["runs", "jobs"]) fs.mkdirSync(path.join(root, d), { recursive: true });
    const runs = fs
      .readFileSync(path.join(GH_FIXTURE, "runs", "green-capstone.json"), "utf-8")
      .replaceAll("green-capstone", head);
    fs.writeFileSync(path.join(root, "runs", `${head}.json`), runs);
    fs.copyFileSync(
      path.join(GH_FIXTURE, "jobs", "1001.json"),
      path.join(root, "jobs", "1001.json"),
    );
  });

  const fill = (line: string, extra: Record<string, string> = {}): string => {
    const values: Record<string, string> = {
      BKIT: bkit,
      FID: DEFERRED_FID,
      YYYYMM: MONTH,
      ISSUE_ID: "715",
      STATUS: path.join(repo, "docs", "plans", MONTH, "logs", DEFERRED_FID, "status.jsonl"),
      SHIP_BRANCH: BRANCH,
      PR_NUMBER: String(PR_NUMBER),
      OWNER_REPO: "example/example",
      OUTBOX: path.join(tmpDir, "outbox"),
      LABEL_FLAGS: "",
      ...extra,
    };
    const out = line.replace(/\{([A-Z_]+)\}/g, (m, k: string) => values[k] ?? m);
    expect(out).not.toMatch(/\{[A-Z_]+\}/);
    return out;
  };

  const run = (script: string) =>
    spawnSync("bash", ["-c", script], { cwd: repo, encoding: "utf-8", env });

  /** Step 2's no-PR route: the probe finds none, then the push and the PR open. */
  function openPr() {
    const step2 = /^## .*Step 2 —/m;
    const probe = extractStepLine(step2, '"{BKIT}" prs probe --head=');
    const push = extractStepLine(step2, '"{BKIT}" branches push --mode=plain --set-upstream');
    const open = extractStepLine(step2, '"{BKIT}" prs open ');
    expect(run(fill(probe)).status, "no PR exists, so the probe exits 1").toBe(1);
    const res = run(`OPEN_EXIT=0\n${fill(push)}\n${fill(open)}`);
    expect(res.status, `${res.stdout}\n${res.stderr}`).toBe(0);
  }

  it("ship pushes the held branch and opens a dev PR", () => {
    expect(bareRefs()).not.toContain(BRANCH);
    const head = sh(repo, "rev-parse", "HEAD");

    openPr();

    expect(bareRefs()).toContain(`refs/heads/${BRANCH} ${head}`);
    const create = ghCall("pr", "create");
    expect(flagValue(create, "--base")).toBe("dev");
    expect(flagValue(create, "--head")).toBe(BRANCH);
  });

  it("ship gates on CI and merges the pinned head", () => {
    openPr();
    const head = sh(repo, "rev-parse", "HEAD");
    const step10 = /^## .*Step 10 —/m;
    const gate = extractStepLine(step10, '"{BKIT}" runs gate ');
    const merge = extractStepLine(step10, '"{BKIT}" prs merge ');
    const values = { VALIDATED_HEAD: head, GATE_HEAD: head };

    const gated = run(fill(gate, values));
    expect(gated.status, `${gated.stdout}\n${gated.stderr}`).toBe(0);
    const merged = run(fill(merge, values));
    expect(merged.status, `${merged.stdout}\n${merged.stderr}`).toBe(0);

    expect(ghApiUrls().some((u) => u.includes(`head_sha=${head}`))).toBe(true);
    const mergeCall = ghCall("pr", "merge");
    expect(flagValue(mergeCall, "--match-head-commit")).toBe(head);
    expect(mergeCall).toContain("--squash");
  });
});
