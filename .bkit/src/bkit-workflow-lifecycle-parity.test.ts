/**
 * bkit-workflow-lifecycle-parity.test.ts — `bkit locks` and `bkit workflows close`
 * answer as the shell they replace, while both exist.
 *
 * Two shell sources: the Step 1 "Acquire concurrency lock" block of each phase
 * workflow (extracted and run as shipped), and `bkit-workflow-telemetry.sh`.
 * Each fixture is given to both; any disagreement fails, except the deviations
 * pinned at the end of each section. Retire this file when the workflows call
 * the commands and the script is deleted.
 */

import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { afterAll, describe, expect, it } from "vitest";

import { runCommand } from "./commands/lib";
import { locksCommand } from "./commands/workflow/locks";
import { workflowsCommand } from "./commands/workflow/workflows";

const WORKFLOWS = path.resolve(__dirname, "../workflows");
const SCRIPTS = path.resolve(__dirname, "../templates/.bkit/scripts");
const hasTools =
  spawnSync("git", ["--version"]).status === 0 && spawnSync("jq", ["--version"]).status === 0;

const tmp = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-lifecycle-parity-")));
afterAll(() => fs.rmSync(tmp, { recursive: true, force: true }));

// ship's lock block ends with a `gh api` preflight; a failing stub keeps it off the network.
const stubBin = path.join(tmp, "bin");
fs.mkdirSync(stubBin);
fs.writeFileSync(path.join(stubBin, "gh"), "#!/bin/sh\nexit 1\n", { mode: 0o755 });
const shellEnv = (tz: string) => ({
  ...process.env,
  TZ: tz,
  PATH: `${stubBin}${path.delimiter}${process.env.PATH ?? ""}`,
});

const FID = "68-digital-agent-mvp";
const M = "202610";
let seq = 0;

const git = (cwd: string, ...args: string[]) =>
  spawnSync("git", ["-c", "user.email=t@t", "-c", "user.name=t", ...args], {
    cwd,
    encoding: "utf-8",
  }).stdout.trim();

function repo(): string {
  const cwd = path.join(tmp, String(seq++));
  fs.mkdirSync(path.join(cwd, ".bkit", "scripts"), { recursive: true });
  git(cwd, "init", "-q", "-b", "dev");
  git(cwd, "commit", "-q", "--allow-empty", "-m", "init");
  fs.copyFileSync(
    path.join(SCRIPTS, "bkit-status-fold.sh"),
    path.join(cwd, ".bkit", "scripts", "bkit-status-fold.sh"),
  );
  return cwd;
}

async function command(cwd: string, argv: string[]) {
  const out: string[] = [];
  const code = (await runCommand(argv, [locksCommand, workflowsCommand], {
    classicVerbs: new Set(),
    cwd,
    io: { stdout: (t) => out.push(t), stderr: () => undefined },
  }))!;
  return { code, json: out.length ? JSON.parse(out.join("")) : undefined };
}

// ---------------------------------------------------------------------------
// Workflow lock
// ---------------------------------------------------------------------------

/** The bash block under "Acquire concurrency lock" in a phase workflow, placeholders filled. */
function lockBlock(workflow: string): string {
  const lines = fs.readFileSync(path.join(WORKFLOWS, `bkit-${workflow}.md`), "utf-8").split("\n");
  const head = lines.findIndex((l) => l.includes("Acquire concurrency lock"));
  const open = lines.findIndex((l, i) => i > head && l.trim() === "```bash");
  const close = lines.findIndex((l, i) => i > open && l.trim() === "```");
  return lines
    .slice(open + 1, close)
    .join("\n")
    .replaceAll("{FID}", FID)
    .replaceAll("{RUNTIME_DEVPUSHES}", "true")
    .replaceAll("{STATUS_REL}", `docs/plans/${M}/logs/${FID}/status.jsonl`)
    .replaceAll("{OWNER_REPO}", "o/r");
}

const PHASES = ["design", "plan", "build", "debug", "ship"];
const logDir = (root: string, month = M) => path.join(root, "docs", "plans", month, "logs", FID);
const iso = (minAgo: number) =>
  new Date(Date.now() - minAgo * 60_000).toISOString().replace(/\.\d{3}Z$/, "Z");

interface LockFixture {
  /** Runs of the lock's holder (design) as status rows; undefined = no status log. */
  status?: object[];
  /** Age of an existing lock in minutes; undefined = no lock. */
  lockAgeMin?: number;
  /** Also log the feature in a second month bucket. */
  split?: boolean;
}

function lockFixture(f: LockFixture): string {
  const cwd = repo();
  fs.mkdirSync(logDir(cwd), { recursive: true });
  if (f.split) fs.mkdirSync(logDir(cwd, "202611"), { recursive: true });
  if (f.status) {
    fs.writeFileSync(
      path.join(logDir(cwd), "status.jsonl"),
      f.status.map((r) => `${JSON.stringify(r)}\n`).join(""),
    );
  }
  if (f.lockAgeMin !== undefined) {
    const lock = path.join(logDir(cwd), ".lock");
    fs.writeFileSync(lock, "2026-10-01T00:00:00Z design\n");
    const t = (Date.now() - f.lockAgeMin * 60_000) / 1000;
    fs.utimesSync(lock, t, t);
  }
  return cwd;
}

const started = (minAgo: number) => ({
  type: "workflow-started",
  workflow: "design",
  at: iso(minAgo),
});
const step = (minAgo: number) => ({
  type: "step-done",
  workflow: "design",
  step: "design-x",
  status: "DONE",
  at: iso(minAgo),
  parentSha: "0".repeat(40),
  artifacts: [],
});
const done = (minAgo: number) => ({ type: "workflow-done", workflow: "design", at: iso(minAgo) });

const CASES: Record<string, LockFixture> = {
  "no lock": {},
  "holder stepped 5 min ago": { status: [started(60), step(5)], lockAgeMin: 60 },
  "holder idle 40 min, lock 60 min old": { status: [started(90), step(40)], lockAgeMin: 60 },
  "holder DONE, lock 60 min old": { status: [started(90), done(80)], lockAgeMin: 60 },
  "holder DONE, lock 5 min old": { status: [started(90), done(80)], lockAgeMin: 5 },
  "no status log, lock 60 min old": { lockAgeMin: 60 },
  "no status log, lock 5 min old": { lockAgeMin: 5 },
  "feature split across buckets": { split: true },
};

function shellLock(workflow: string, cwd: string, tz = "UTC"): number {
  return (
    spawnSync("bash", ["-c", lockBlock(workflow)], { cwd, encoding: "utf-8", env: shellEnv(tz) })
      .status ?? -1
  );
}

const acquireArgs = (workflow: string) => [
  "locks",
  "acquire",
  "--kind=workflow",
  `--workflow=${workflow}`,
  `--fid=${FID}`,
  ...(workflow === "ship" ? ["--dev-pushes"] : []),
];

// Each case spawns real git / bash / jq; a busy machine needs more than the default 5s.
const SLOW = { timeout: 120_000 };

describe.skipIf(!hasTools)("workflow lock: Step 1 shell block vs bkit locks acquire", SLOW, () => {
  for (const workflow of PHASES) {
    it(`bkit-${workflow}.md: same refuse / acquire answer on every fixture`, async () => {
      expect(lockBlock(workflow)).toContain(".lock");
      for (const [name, fixture] of Object.entries(CASES)) {
        const shell = shellLock(workflow, lockFixture(fixture));
        const cmdRepo = lockFixture(fixture);
        const cmd = await command(cmdRepo, acquireArgs(workflow));
        expect(cmd.code === 0, `${name}: shell exit ${shell}, command exit ${cmd.code}`).toBe(
          shell === 0,
        );
        if (cmd.code === 0) expect(fs.existsSync(path.join(logDir(cmdRepo), ".lock"))).toBe(true);
      }
    });
  }

  // Deviation: a fresh lock over a run idle 30+ minutes is a resume that just took
  // it. The shell judged by the idle step alone and reclaimed it.
  it("deviation: refuses a fresh lock over an idle IN_PROGRESS run (the shell reclaimed it)", async () => {
    const fixture = { status: [started(90), step(40)], lockAgeMin: 5 };
    expect(shellLock("build", lockFixture(fixture))).toBe(0);
    expect((await command(lockFixture(fixture), acquireArgs("build"))).code).toBe(1);
  });

  // Deviation: BSD `date -j -f ...Z` reads the UTC timestamp as LOCAL time, so east
  // of UTC a live run looks hours idle and its lock is reclaimed.
  it.skipIf(process.platform !== "darwin")(
    "deviation: macOS east of UTC, the shell reclaims a live run's lock; the command refuses",
    async () => {
      const fixture = { status: [started(60), step(5)], lockAgeMin: 60 };
      expect(shellLock("build", lockFixture(fixture), "Australia/Brisbane")).toBe(0);
      expect((await command(lockFixture(fixture), acquireArgs("build"))).code).toBe(1);
    },
  );
});

// ---------------------------------------------------------------------------
// Close telemetry
// ---------------------------------------------------------------------------

const COMPARED = [
  "workflow",
  "step",
  "repo",
  "bkitVersion",
  "parentSha",
  "linesAdded",
  "linesDeleted",
  "linesChanged",
  "filesChanged",
  "taskCount",
  "deferrals",
  "failures",
  "frictionAdded",
  "deferralsAdded",
  "failuresAdded",
  "planSource",
];

/** A build run started in 2020 from `base`, with plan tasks, ledgers and committed work. */
function closeFixture(planSource: boolean): string {
  const cwd = repo();
  git(cwd, "remote", "add", "origin", "https://github.com/cbartens/bkit.git");
  fs.writeFileSync(path.join(cwd, ".bkit", "version"), JSON.stringify({ pinnedVersion: "4.6.3" }));
  fs.writeFileSync(path.join(cwd, "a.txt"), "base\nold\n");
  git(cwd, "add", "-A");
  git(cwd, "commit", "-qm", "base");
  const base = git(cwd, "rev-parse", "HEAD");
  const put = (rel: string, body: string) => {
    fs.mkdirSync(path.dirname(path.join(cwd, rel)), { recursive: true });
    fs.writeFileSync(path.join(cwd, rel), body);
  };
  const jsonl = (rows: object[]) => rows.map((r) => `${JSON.stringify(r)}\n`).join("");
  put(
    `docs/plans/${M}/logs/${FID}/status.jsonl`,
    jsonl([
      { type: "workflow-started", workflow: "build", at: "2020-01-01T00:00:00Z", parentSha: base },
      ...(planSource
        ? [
            {
              type: "workflow-meta",
              workflow: "build",
              at: "2020-01-01T00:00:01Z",
              planSource: "brief",
            },
          ]
        : []),
    ]),
  );
  put(`docs/plans/${M}/${FID}-plan.md`, "- [ ] a\n- [x] b\n");
  put(`docs/plans/${M}/${FID}-plan-2.md`, "- [ ] c\n");
  put(
    ".bkit/friction.jsonl",
    jsonl([
      { ts: 1577836801000, kind: "friction", workflow: "build", key: "f1" },
      { ts: 1577836801500, kind: "friction", workflow: "build", key: "f1" },
      { ts: 1577836700000, kind: "friction", workflow: "build", key: "early" },
    ]),
  );
  put(
    "docs/deferrals.jsonl",
    jsonl([
      { ts: 1, kind: "deferral", workflow: "plan", key: "d1" },
      { ts: 1577836802000, kind: "deferral", workflow: "build", key: "d2" },
    ]),
  );
  put(
    "docs/failures.jsonl",
    jsonl([{ ts: 1577836803000, kind: "failure", workflow: "build", key: "x1" }]),
  );
  put("a.txt", "base\nnew\nmore\n");
  put("b.txt", "b\n");
  git(cwd, "add", "-A");
  git(cwd, "commit", "-qm", "work");
  return cwd;
}

const lastOutcome = (cwd: string) =>
  fs
    .readFileSync(path.join(cwd, ".bkit", "stats.jsonl"), "utf-8")
    .split("\n")
    .filter(Boolean)
    .map((l) => JSON.parse(l) as Record<string, unknown>)
    .filter((r) => r.kind === "outcome")
    .at(-1)!;

function shellTelemetry(cwd: string, tz = "UTC") {
  spawnSync("bash", [path.join(SCRIPTS, "bkit-workflow-telemetry.sh"), "build", M, FID], {
    cwd,
    encoding: "utf-8",
    env: shellEnv(tz),
  });
  return lastOutcome(cwd);
}

const pick = (row: Record<string, unknown>) => Object.fromEntries(COMPARED.map((k) => [k, row[k]]));

describe.skipIf(!hasTools)(
  "close telemetry: bkit-workflow-telemetry.sh vs bkit workflows close",
  SLOW,
  () => {
    for (const planSource of [false, true]) {
      it(`same outcome row (planSource ${planSource ? "brief" : "absent"})`, async () => {
        const cwd = closeFixture(planSource);
        const shell = shellTelemetry(cwd);
        const cmd = await command(cwd, ["workflows", "close", "--workflow=build", `--fid=${FID}`]);
        expect(cmd.code).toBe(0);
        expect(pick(cmd.json.outcomeRow)).toEqual(pick(shell));
        expect(pick(lastOutcome(cwd))).toEqual(pick(shell));
        expect(
          Math.abs(Number(cmd.json.outcomeRow.durationSeconds) - Number(shell.durationSeconds)),
        ).toBeLessThan(10);
      });
    }

    // Same BSD `date -j` bug as the lock: east of UTC the run looks hours longer.
    it.skipIf(process.platform !== "darwin")(
      "deviation: macOS east of UTC, the script inflates durationSeconds by the UTC offset",
      async () => {
        const cwd = closeFixture(false);
        const shell = shellTelemetry(cwd, "Australia/Brisbane");
        const cmd = await command(cwd, ["workflows", "close", "--workflow=build", `--fid=${FID}`]);
        const gap = Number(shell.durationSeconds) - Number(cmd.json.outcomeRow.durationSeconds);
        expect(Math.abs(gap - 10 * 3600)).toBeLessThan(10);
      },
    );
  },
);
