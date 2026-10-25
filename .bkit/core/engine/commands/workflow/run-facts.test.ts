import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { type StatusEvent, appendLine, recordAction } from "../../ledgers/status";
import { foldFrom, SCHEMA, totalsProblem, validate } from "../../ledgers/telemetry";
import { appendLedgerRows } from "./ledgers";
import { readStatusEvents } from "./status";
import {
  agentContextBlock,
  buildBlock,
  chatFingerprint,
  ciEntry,
  claudeTranscripts,
  ciList,
  hostChat,
  lineClass,
  minutesOf,
  planBlock,
  planFiles,
  planTasks,
  restateOutcome,
  runChats,
  runLines,
  runStatusRows,
  stepsBlock,
  timeBlock,
} from "./run-facts";

// Real git repos per test; a busy machine needs more than the default 5s.
const TIMEOUT = { timeout: 30_000 };

const dirs: string[] = [];
afterEach(() => {
  for (const d of dirs.splice(0)) fs.rmSync(d, { recursive: true, force: true });
});

const tmp = () => {
  const d = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-run-facts-")));
  dirs.push(d);
  return d;
};
const git = (cwd: string, ...args: string[]) =>
  spawnSync("git", ["-c", "user.email=t@t", "-c", "user.name=t", ...args], {
    cwd,
    encoding: "utf-8",
  }).stdout.trim();
const write = (root: string, rel: string, body: string) => {
  fs.mkdirSync(path.dirname(path.join(root, rel)), { recursive: true });
  fs.writeFileSync(path.join(root, rel), body);
};
const lines = (n: number) => Array.from({ length: n }, (_, i) => `l${i}`).join("\n") + "\n";
/** Write `files` and commit them; returns the new HEAD. */
const commit = (cwd: string, msg: string, files: Record<string, string>) => {
  for (const [rel, body] of Object.entries(files)) write(cwd, rel, body);
  git(cwd, "add", "-A");
  git(cwd, "commit", "-qm", msg);
  return git(cwd, "rev-parse", "HEAD");
};
function repo() {
  const cwd = tmp();
  git(cwd, "init", "-q", "-b", "dev");
  const base = commit(cwd, "base", { "README.md": "base\n" });
  return { cwd, base };
}

type Row = StatusEvent & Record<string, unknown>;
const T0 = Date.parse("2026-10-01T00:00:00Z");
/** A status row's step, or its type for a row with no step. */
const labelOf = (r: StatusEvent): string => ("step" in r ? String(r.step) : r.type);
const at = (minutes: number) => new Date(T0 + minutes * 60_000).toISOString();
const step = (minutes: number, name: string, extra: Record<string, unknown> = {}): Row =>
  ({ type: "step-done", workflow: "build", step: name, at: at(minutes), ...extra }) as Row;
const started = (minutes = 0): Row =>
  ({ type: "workflow-started", workflow: "build", at: at(minutes) }) as Row;

// ---------------------------------------------------------------------------

describe("lineClass", () => {
  it("splits changed files into code, tests and docs", () => {
    expect(lineClass("src/a.ts")).toBe("code");
    expect(lineClass("src/a.test.ts")).toBe("tests");
    expect(lineClass("tests/fixtures/x.json")).toBe("tests");
    expect(lineClass("pkg/foo_test.go")).toBe("tests");
    expect(lineClass("README.md")).toBe("docs");
    expect(lineClass("docs/diagram.svg")).toBe("docs");
  });
});

describe("timeBlock / minutesOf", () => {
  it("is start to end in minutes, to one decimal", () => {
    expect(minutesOf(90_000)).toBe(1.5);
    expect(timeBlock(T0, T0 + 196.4 * 60_000)).toEqual({
      start: T0,
      end: T0 + 196.4 * 60_000,
      totalMinutes: 196.4,
    });
  });
});

describe("runLines", TIMEOUT, () => {
  it("counts code, tests and docs apart, and leaves out plans, run logs and the ledgers", () => {
    const { cwd, base } = repo();
    const last = commit(cwd, "work", {
      "src/a.ts": lines(2),
      "src/a.test.ts": lines(3),
      "docs/guide.md": lines(1),
      "CHANGELOG.md": lines(1),
      // Left out: the plan and its log folder, and the ledgers.
      "docs/plans/202610/1-x-plan.md": lines(40),
      "docs/plans/202610/logs/1-x/status.jsonl": lines(9),
      "docs/deferrals.jsonl": lines(5),
      ".bkit/stats.jsonl": lines(7),
    });
    expect(runLines(cwd, base, last)).toEqual({
      total: { added: 7, deleted: 0, changed: 7, files: 4 },
      code: { added: 2, deleted: 0, files: 1 },
      tests: { added: 3, deleted: 0, files: 1 },
      docs: { added: 2, deleted: 0, files: 2 },
      merges: 0,
    });
  });

  it("counts deleted lines into changed", () => {
    const { cwd } = repo();
    const first = commit(cwd, "add", { "src/a.ts": lines(4) });
    const last = commit(cwd, "trim", { "src/a.ts": lines(1) });
    expect(runLines(cwd, first, last)?.total).toEqual({
      added: 0,
      deleted: 3,
      changed: 3,
      files: 1,
    });
  });

  it("cuts at each merge on the first-parent chain, so merged-in work is not counted", () => {
    const { cwd, base } = repo();
    git(cwd, "checkout", "-q", "-b", "side");
    commit(cwd, "side work", { "src/side.ts": lines(50) });
    git(cwd, "checkout", "-q", "dev");
    commit(cwd, "before merge", { "src/f1.ts": lines(1) });
    git(cwd, "merge", "-q", "--no-ff", "-m", "sync", "side");
    const last = commit(cwd, "after merge", { "src/f2.ts": lines(2) });
    expect(runLines(cwd, base, last)).toEqual({
      total: { added: 3, deleted: 0, changed: 3, files: 2 },
      code: { added: 3, deleted: 0, files: 2 },
      tests: { added: 0, deleted: 0, files: 0 },
      docs: { added: 0, deleted: 0, files: 0 },
      merges: 1,
    });
  });

  it("is null when first is not an ancestor of last, or either is missing", () => {
    const { cwd, base } = repo();
    git(cwd, "checkout", "-q", "-b", "other");
    const other = commit(cwd, "other", { "x.ts": lines(1) });
    git(cwd, "checkout", "-q", "dev");
    const last = commit(cwd, "mine", { "y.ts": lines(1) });
    expect(runLines(cwd, other, last)).toBeNull();
    expect(runLines(cwd, "", last)).toBeNull();
    expect(runLines(cwd, base, "")).toBeNull();
    expect(runLines(cwd, "0".repeat(40), last)).toBeNull();
  });

  it("is all zero for an empty range", () => {
    const { cwd, base } = repo();
    expect(runLines(cwd, base, base)).toMatchObject({
      total: { added: 0, deleted: 0, changed: 0, files: 0 },
      merges: 0,
    });
  });
});

describe("runStatusRows / stepsBlock / ciList", () => {
  it("takes the workflow's rows from its start on, in time order", () => {
    const events = [
      step(5, "build-a"),
      started(1),
      step(0, "build-before-start"),
      { ...step(3, "build-other"), workflow: "plan" },
      step(2, "build-b"),
    ] as StatusEvent[];
    expect(runStatusRows(events, "build", at(1)).map(labelOf)).toEqual([
      "workflow-started",
      "build-b",
      "build-a",
    ]);
  });

  it("leaves out engine-action rows (they carry no workflow)", () => {
    const file = path.join(tmp(), "status.jsonl");
    fs.writeFileSync(file, appendLine(started(1)));
    recordAction(file, { action: "comment", key: "k", hash: "h", ref: null });
    fs.appendFileSync(file, appendLine(step(3, "build-a")));
    expect(runStatusRows(readStatusEvents(file), "build", at(1)).map(labelOf)).toEqual([
      "workflow-started",
      "build-a",
    ]);
  });

  it("counts each step's rows and the minutes since the row before each; total = sum of byStep", () => {
    const rows = [
      started(0),
      step(1, "build-plan-verify"),
      { type: "workflow-meta", workflow: "build", at: at(2) } as Row,
      step(4, "build-task-red"),
      step(5.5, "build-plan-verify"),
    ];
    const steps = stepsBlock(rows);
    expect(steps).toEqual({
      total: { n: 3, totalMinutes: 4.5 },
      byStep: {
        "build-plan-verify": { n: 2, totalMinutes: 2.5 },
        "build-task-red": { n: 1, totalMinutes: 2 },
      },
    });
    expect(totalsProblem({ steps })).toBeUndefined();
  });

  it("is empty when the run has only its start row", () => {
    expect(stepsBlock([started(0)])).toEqual({ total: { n: 0, totalMinutes: 0 }, byStep: {} });
  });

  it("lists every close step's CI dispatch, in order, with outcome as status", () => {
    const rows = [
      started(0),
      step(1, "build-close-workflow", {
        ciDispatch: { outcome: "unresolved", reason: "ci-declared-no-run", attempts: 12 },
      }),
      step(2, "build-plan-verify", { ciDispatch: { outcome: "dispatched" } }),
      step(3, "build-close-workflow"),
      step(4, "build-close-workflow", { ciDispatch: { outcome: "dispatched", attempts: 1 } }),
    ];
    expect(ciList(rows)).toEqual([
      { status: "unresolved", reason: "ci-declared-no-run", attempts: 12 },
      { status: "dispatched", reason: null, attempts: 1 },
    ]);
    expect(ciEntry({})).toEqual({ status: null, reason: null, attempts: null });
  });
});

// ---------------------------------------------------------------------------

const FID = "5-x";
const MONTH = "202610";
const planRel = (name: string) => `docs/plans/${MONTH}/${name}`;
/** A task block with its TEST FIRST field (none when `tests` is null) and sub-step checkboxes. */
const task = (
  n: number,
  tests: Array<[string, string]> | null,
  subSteps = 0,
  extra: string[] = [],
) =>
  [
    `<!-- bkit:task ${n} start -->`,
    `- [ ] **TASK ${n}:** Do ${n}.`,
    ...extra,
    "  - **DONE WHEN:** done.",
    ...(tests === null
      ? []
      : ["  - **TEST FIRST:**", ...tests.map(([file, name]) => `    - \`${file}\` \`${name}\``)]),
    ...Array.from({ length: subSteps }, (_, i) => `  - [ ] Step ${n}.${i + 1}`),
    `<!-- bkit:task ${n} end -->`,
  ].join("\n");
/** GROUP `g` holding `tasks`. */
const group = (g: number, ...tasks: string[]) =>
  [
    `<!-- bkit:group ${g} start -->`,
    `### GROUP ${g}: Work`,
    ...tasks,
    `<!-- bkit:group ${g} end -->`,
  ].join("\n");
/** A plan holding `tasks` in GROUP 1. */
const plan = (...tasks: string[]) => `# Plan\n\n${group(1, ...tasks)}\n`;

describe("planBlock", () => {
  const convertRow = step(1, "build-plan-convert", { attempt: 1 });

  it("counts task headings, not every `- [` line: sub-step checkboxes are not tasks", () => {
    const root = tmp();
    write(
      root,
      planRel(`${FID}-plan.md`),
      plan(task(1, [["a.test.ts", "one"]], 3), task(2, [["b.test.ts", "two"]], 3)),
    );
    const block = planBlock(root, MONTH, FID, []);
    // Eight `- [` lines, two tasks.
    expect(block?.total.tasks).toBe(2);
    expect(block?.groups[0]?.tasks).toHaveLength(2);
  });

  it("planBlock reports converted when a convert row exists", () => {
    const root = tmp();
    write(root, planRel(`${FID}-plan.md`), plan(task(1, null)));
    expect(planBlock(root, MONTH, FID, [started(0)])?.source).toBe("file");
    expect(planBlock(root, MONTH, FID, [started(0), convertRow])?.source).toBe("converted");
    // A convert row of another workflow, or one that is not a step row, is not a conversion.
    const shipRow = { ...convertRow, workflow: "ship" } as Row;
    const meta = {
      type: "workflow-meta",
      workflow: "build",
      at: at(1),
      step: "build-plan-convert",
    };
    expect(planBlock(root, MONTH, FID, [shipRow, meta as Row])?.source).toBe("file");
  });

  it("planBlock reads groups from the plan", () => {
    const root = tmp();
    const pad = (text: string, kb: number) => text + "x".repeat(kb * 1024 - text.length);
    const text = `# Plan\n\n${group(1, task(1, null), task(2, [["a.test.ts", "x"]]))}\n${group(2, task(3, null))}\n`;
    write(root, planRel(`${FID}-plan.md`), pad(text, 2));
    // Files a split wrote are not read: the plan file is the whole plan.
    write(root, planRel(`${FID}-plan-1.md`), plan(task(1, null)));
    const block = planBlock(root, MONTH, FID, [convertRow]);
    expect(block).toEqual({
      source: "converted",
      total: { tasks: 3, kb: 2 },
      groups: [
        {
          tasks: [
            { tests: null, testFiles: null },
            { tests: 1, testFiles: 1 },
          ],
        },
        { tasks: [{ tests: null, testFiles: null }] },
      ],
    });
    expect(totalsProblem({ plan: block })).toBeUndefined();
    expect(block).not.toHaveProperty("subPlans");
    expect(block).not.toHaveProperty("complexity");
  });

  it("reads per task its Test first tests and distinct test files; null for a task without the field", () => {
    const root = tmp();
    write(
      root,
      planRel(`${FID}-plan.md`),
      plan(
        task(1, [
          ["a.test.ts", "one"],
          ["a.test.ts", "two"],
          ["b.test.ts", "three"],
        ]),
        task(2, null),
        [
          "<!-- bkit:task 3 start -->",
          "- [ ] **TASK 3:** Docs.",
          "  - **DONE WHEN:** done.",
          "  - **TEST FIRST:** n/a — docs only.",
          "<!-- bkit:task 3 end -->",
        ].join("\n"),
      ),
    );
    expect(planBlock(root, MONTH, FID, [])?.groups[0]?.tasks).toEqual([
      { tests: 3, testFiles: 2 },
      { tests: null, testFiles: null },
      { tests: 0, testFiles: 0 },
    ]);
  });

  it("planTasks counts tasks per group", () => {
    const text = `# Plan\n\n${group(1, task(1, null), task(2, null))}\n${group(2, task(3, [["a.test.ts", "x"]]))}\n`;
    expect(planTasks(text)).toEqual([
      [
        { tests: null, testFiles: null },
        { tests: null, testFiles: null },
      ],
      [{ tests: 1, testFiles: 1 }],
    ]);
  });

  it("is undefined when the feature has no plan file", () => {
    const root = tmp();
    write(root, planRel(`${FID}-plan-1.md`), plan(task(1, null)));
    expect(planBlock(root, MONTH, FID, [convertRow])).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------

describe("buildBlock", () => {
  const rows = [
    started(0),
    step(1, "build-task-red"),
    step(2, "build-task-red"),
    step(3, "build-plan-verify", { group: 1, attempt: 1, verdict: "FAIL", failures: 1 }),
    step(4, "build-plan-gaps-remediate", {
      group: 1,
      attempt: 1,
      verdict: "FAIL",
      strategy: "STANDARD",
    }),
    step(5, "build-plan-verify", { group: 1, attempt: 2, verdict: "PASS", failures: 0 }),
    step(6, "build-task-red"),
    step(7, "build-plan-verify-holistic", { verdict: "FAIL", failures: 2 }),
    step(8, "build-plan-verify-holistic", { verdict: "PASS", failures: 0 }),
    step(9, "build-challenge", { verdict: "CONCERNS" }),
  ];

  function logs() {
    const logDir = tmp();
    fs.writeFileSync(
      path.join(logDir, "build-plan-verify-1-1.md"),
      "Verdict: FAIL\nFailures: 1\n\n- Task 2 — no-red — not fixable here\n- Task 3 — late-red — not fixable\n",
    );
    // Its verdict does not match the round's row, so its gaps are not counted.
    fs.writeFileSync(
      path.join(logDir, "build-plan-verify-1-2.md"),
      "Verdict: FAIL\nFailures: 3\n\n- Task 1 — no-red — not fixable\n",
    );
    return logDir;
  }

  /** A plan file holding planned tasks and the tasks `challenge merge` appended at `severities`. */
  function challengePlan(...severities: string[]) {
    const file = path.join(tmp(), "plan.md");
    const appended = severities.map((sev, i) =>
      task(i + 3, [["src/a.test.ts", "guards it"]], 0, [
        `  **Severity:** ${sev} · **Fixable:** true · **Location:** \`src/a.ts:${i + 1}\` · **Round:** 1`,
      ]),
    );
    fs.writeFileSync(
      file,
      `# Plan\n\n${group(1, task(1, null), task(2, null))}\n${group(2, ...appended)}\n`,
    );
    return file;
  }
  /** `docs/deferrals.jsonl` rows `challenge merge` writes for LOW findings, plus one from another step. */
  const lowRows = (n: number) => [
    ...Array.from({ length: n }, (_, i) => ({
      kind: "deferral",
      key: `5-x-challenge-low-src-b-ts-${i}`,
      severity: "LOW",
      by: { workflow: "build", step: "build-challenge" },
    })),
    { kind: "deferral", key: "other", severity: "LOW", by: { workflow: "build", step: "build-x" } },
  ];

  it("reads every verify and gaps-remediate round, the last holistic and challenge, and the red-test runs", () => {
    const block = buildBlock(rows, logs(), [challengePlan("HIGH", "MEDIUM")], lowRows(2));
    expect(block).toEqual({
      verify: [
        { group: 1, attempt: 1, verdict: "FAIL", failures: 1, testOrderGaps: 2 },
        { group: 1, attempt: 2, verdict: "PASS", failures: 0, testOrderGaps: null },
      ],
      gapsRemediate: [{ group: 1, attempt: 1, verdict: "FAIL", strategy: "STANDARD" }],
      holistic: { verdict: "PASS", failures: 0 },
      challenge: {
        verdict: "CONCERNS",
        findings: { total: 4, CRITICAL: 0, HIGH: 1, MEDIUM: 1, LOW: 2 },
      },
      redTests: 3,
    });
  });

  it("buildBlock keys verify attempts by group", () => {
    const logDir = tmp();
    fs.writeFileSync(
      path.join(logDir, "build-plan-verify-2-1.md"),
      "Verdict: FAIL\nFailures: 1\n\n- Task 4 — no-red — not fixable\n",
    );
    // Group 1's attempt 1 report: group 2's attempt 1 row never reads it.
    fs.writeFileSync(
      path.join(logDir, "build-plan-verify-1-1.md"),
      "Verdict: FAIL\nFailures: 1\n\n- Task 1 — no-red — not fixable\n- Task 2 — late-red — not fixable\n",
    );
    const grouped = [
      started(0),
      step(1, "build-plan-verify", { group: 1, attempt: 1, verdict: "PASS", failures: 0 }),
      step(2, "build-plan-verify", { group: 2, attempt: 1, verdict: "FAIL", failures: 1 }),
      step(3, "build-plan-gaps-remediate", {
        group: 2,
        attempt: 1,
        verdict: "PASS",
        strategy: "STANDARD",
      }),
    ];
    const block = buildBlock(grouped, logDir, [], []);
    expect(block.verify).toEqual([
      { group: 1, attempt: 1, verdict: "PASS", failures: 0, testOrderGaps: null },
      { group: 2, attempt: 1, verdict: "FAIL", failures: 1, testOrderGaps: 1 },
    ]);
    expect(block.gapsRemediate).toEqual([
      { group: 2, attempt: 1, verdict: "PASS", strategy: "STANDARD" },
    ]);
    for (const v of [...block.verify!, ...block.gapsRemediate!])
      expect(v).not.toHaveProperty("subPlan");
  });

  it("its totals match their parts: findings total = the four severities, redTests = the build-task-red rows", () => {
    const build = buildBlock(rows, logs(), [challengePlan("HIGH", "MEDIUM")], lowRows(2));
    const f = build.challenge!.findings!;
    expect(f.total).toBe(f.CRITICAL + f.HIGH + f.MEDIUM + f.LOW);
    const steps = stepsBlock(rows);
    expect(build.redTests).toBe(steps.byStep["build-task-red"]!.n);
    expect(totalsProblem({ steps, build })).toBeUndefined();
  });

  it("carries the latest challenge size gate on the challenge block", () => {
    const gateRow = (
      linesChanged: number,
      filesChanged: number,
      size: string,
      skipped: boolean,
    ) => ({
      type: "challenge-gate",
      workflow: "build",
      at: rows.at(-1)!.at,
      range: "origin/dev...HEAD",
      linesChanged,
      filesChanged,
      size,
      skipped,
    });
    // `challenge-gate` rows are not fold events; the run's rows carry them all the same.
    const withGate = [
      ...rows.slice(0, -1),
      gateRow(900, 12, "large", false),
      gateRow(42, 3, "small", true),
      rows.at(-1)!,
    ] as typeof rows;
    const block = buildBlock(withGate, logs(), [challengePlan()], []);
    expect(block.challenge).toEqual({
      verdict: "CONCERNS",
      findings: { total: 0, CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 },
      gate: { size: "small", linesChanged: 42, filesChanged: 3, skipped: true },
    });
  });

  it("counts challenge findings from appended tasks", () => {
    expect(
      buildBlock(rows, logs(), [challengePlan("HIGH", "MEDIUM")], lowRows(1)).challenge,
    ).toEqual({
      verdict: "CONCERNS",
      findings: { total: 3, CRITICAL: 0, HIGH: 1, MEDIUM: 1, LOW: 1 },
    });
  });

  it("counts findings once the merge ran; empty without the build's steps", () => {
    expect(buildBlock(rows, logs(), [challengePlan()], []).challenge).toEqual({
      verdict: "CONCERNS",
      findings: { total: 0, CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 },
    });
    expect(buildBlock([started(0)], tmp(), [challengePlan("HIGH")], lowRows(1))).toEqual({
      verify: [],
      gapsRemediate: [],
      holistic: null,
      challenge: null,
      redTests: 0,
    });
  });
});

// ---------------------------------------------------------------------------

describe("restateOutcome", () => {
  const SHA = "a".repeat(40);
  function closed(opts: { done?: boolean; outcome?: boolean } = {}) {
    const tree = tmp();
    const status = path.join(tree, "status.jsonl");
    const rows = [
      { type: "workflow-started", workflow: "build", at: at(0) },
      ...(opts.done === false
        ? []
        : [
            { type: "workflow-done", workflow: "build", at: at(1), parentSha: "b".repeat(40) },
            { type: "workflow-done", workflow: "build", at: at(5), parentSha: SHA },
            { type: "workflow-done", workflow: "plan", at: at(6), parentSha: "c".repeat(40) },
          ]),
    ];
    fs.writeFileSync(status, rows.map((r) => `${JSON.stringify(r)}\n`).join(""));
    if (opts.outcome !== false) {
      appendLedgerRows(tree, "stats", [
        {
          kind: "outcome",
          by: { workflow: "build", step: "build-close-workflow" },
          run: { parentSha: SHA },
          time: timeBlock(T0, T0 + 60_000),
          ending: "done",
          ci: [{ status: "unresolved", reason: "gh-error", attempts: 3 }],
          ledgers: { deferrals: { repo: 0 }, failures: { repo: 0 }, friction: {} },
        },
      ]);
    }
    return { tree, status, stats: path.join(tree, ".bkit", "stats.jsonl") };
  }
  const readRows = (file: string) =>
    fs
      .readFileSync(file, "utf-8")
      .split("\n")
      .filter(Boolean)
      .map((l) => JSON.parse(l) as Record<string, unknown>);

  it("appends the run's outcome again with the dispatch added to ci; it supersedes the close's", () => {
    const { tree, status, stats } = closed();
    const log: string[] = [];
    expect(
      restateOutcome(tree, status, "build", { outcome: "dispatched", attempts: 1 }, (m) =>
        log.push(m),
      ),
    ).toBe(true);
    const [first, second] = readRows(stats);
    expect(second).toMatchObject({
      schema: 3,
      kind: "outcome",
      run: { parentSha: SHA },
      ending: "done",
      ci: [
        { status: "unresolved", reason: "gh-error", attempts: 3 },
        { status: "dispatched", reason: null, attempts: 1 },
      ],
    });
    expect(second!.ts as number).toBeGreaterThan(first!.ts as number);
    expect(validate(second)).toEqual({ ok: true });
    const folded = [...foldFrom([stats]).state.values()].filter((e) => e.kind === "outcome");
    expect(folded).toHaveLength(1);
    expect(folded[0]).toMatchObject({ ending: "done", ci: [{}, { status: "dispatched" }] });
    expect(log).toEqual([]);
  });

  it("ending is close-failed when the dispatch is unresolved", () => {
    const { tree, status, stats } = closed();
    restateOutcome(tree, status, "build", { outcome: "unresolved", reason: "gh-error" }, () => {});
    expect(readRows(stats).at(-1)).toMatchObject({
      ending: "close-failed",
      ci: [{}, { status: "unresolved", reason: "gh-error", attempts: null }],
    });
  });

  it("is logged and returns false with no workflow-done row carrying parentSha, or no outcome row for it", () => {
    const noDone = closed({ done: false });
    const log: string[] = [];
    expect(restateOutcome(noDone.tree, noDone.status, "build", {}, (m) => log.push(m))).toBe(false);
    expect(log.join("\n")).toContain("no build workflow-done row with parentSha");

    const noOutcome = closed({ outcome: false });
    expect(restateOutcome(noOutcome.tree, noOutcome.status, "build", {}, (m) => log.push(m))).toBe(
      false,
    );
    expect(log.join("\n")).toContain(`no build outcome row for ${SHA.slice(0, 12)}`);
    expect(fs.existsSync(noOutcome.stats)).toBe(false);
  });
});

describe("agentContextBlock", () => {
  const SID = "bd405f8d-04d5-5a84-a4a1-4aeb49608fa9";
  const T0 = Date.parse("2026-10-24T10:00:00.000Z");
  const iso = (ms: number) => new Date(ms).toISOString();
  /** One assistant line: context = input + cache write + cache read. */
  const turn = (ms: number, id: string, input: number, write: number, read: number, model = "m") =>
    JSON.stringify({
      type: "assistant",
      timestamp: iso(ms),
      message: {
        id,
        model,
        usage: {
          input_tokens: input,
          cache_creation_input_tokens: write,
          cache_read_input_tokens: read,
          output_tokens: 7,
        },
      },
    });
  /** A Claude config dir holding `agents` as subagents of session SID under project `proj`. */
  const claudeDir = (
    agents: Array<{ name: string; type?: string; lines: string[] }>,
    proj = "-tmp-repo",
  ) => {
    const dir = tmp();
    const sub = path.join(dir, "projects", proj, SID, "subagents");
    fs.mkdirSync(sub, { recursive: true });
    fs.writeFileSync(path.join(dir, "projects", proj, `${SID}.jsonl`), "");
    for (const a of agents) {
      fs.writeFileSync(path.join(sub, `${a.name}.jsonl`), a.lines.join("\n") + "\n");
      if (a.type !== undefined)
        fs.writeFileSync(
          path.join(sub, `${a.name}.meta.json`),
          JSON.stringify({ agentType: a.type }),
        );
    }
    return dir;
  };

  it("per agent type: the largest context of any of its subagents and how many ran", () => {
    const dir = claudeDir([
      {
        name: "agent-a1",
        type: "bkit-build-plan-execute",
        lines: [turn(T0 + 1000, "m1", 10, 100, 1000), turn(T0 + 2000, "m2", 5, 50, 90_000)],
      },
      {
        name: "agent-a2",
        type: "bkit-build-plan-execute",
        lines: [turn(T0 + 3000, "m3", 1, 2, 170_000)],
      },
      { name: "agent-a3", type: "bkit-build-plan-verify", lines: [turn(T0 + 4000, "m4", 1, 1, 1)] },
    ]);
    expect(agentContextBlock(T0, T0 + 60_000, { sessionId: SID, claudeDir: dir })).toEqual({
      host: "claude-code",
      byAgent: {
        "bkit-build-plan-execute": { peak: 170_003, runs: 2 },
        "bkit-build-plan-verify": { peak: 3, runs: 1 },
      },
    });
  });

  it("leaves out model calls outside the run, synthetic messages and malformed lines", () => {
    const dir = claudeDir([
      { name: "agent-early", type: "x", lines: [turn(T0 - 1000, "e1", 1, 1, 500_000)] },
      { name: "agent-late", type: "x", lines: [turn(T0 + 120_000, "l1", 1, 1, 500_000)] },
      {
        name: "agent-in",
        type: "x",
        lines: [
          "{not json",
          turn(T0 + 10, "i1", 1, 0, 9),
          turn(T0 + 20, "i2", 0, 0, 999_999, "<synthetic>"),
        ],
      },
    ]);
    expect(agentContextBlock(T0, T0 + 60_000, { sessionId: SID, claudeDir: dir })).toEqual({
      host: "claude-code",
      byAgent: { x: { peak: 10, runs: 1 } },
    });
  });

  it("context block counts calls by their own time across the run's chats", () => {
    const dir = claudeDir([
      {
        name: "agent-span",
        type: "x",
        lines: [turn(T0 - 1000, "s1", 0, 0, 400_000), turn(T0 + 10, "s2", 0, 0, 20)],
      },
    ]);
    const OTHER = "0a0b0c0d-1111-2222-3333-444455556666";
    const sub = path.join(dir, "projects", "-tmp-repo", OTHER, "subagents");
    fs.mkdirSync(sub, { recursive: true });
    fs.writeFileSync(path.join(sub, "agent-o.jsonl"), turn(T0 + 20, "o1", 0, 0, 30) + "\n");
    fs.writeFileSync(path.join(sub, "agent-o.meta.json"), JSON.stringify({ agentType: "y" }));
    const src = { sessionId: SID, claudeDir: dir };
    // Started before the run, called the model inside it: only the call inside counts.
    expect(agentContextBlock(T0, T0 + 60_000, src)?.byAgent).toEqual({ x: { peak: 20, runs: 1 } });
    // A second chat named on the run's session rows is read too.
    expect(
      agentContextBlock(T0, T0 + 60_000, src, [chatFingerprint("claude-code", OTHER)])?.byAgent,
    ).toEqual({ x: { peak: 20, runs: 1 }, y: { peak: 30, runs: 1 } });
    // With no running chat, the session rows alone name the chats.
    expect(
      agentContextBlock(T0, T0 + 60_000, { sessionId: undefined, claudeDir: dir }, [
        chatFingerprint("claude-code", OTHER),
      ])?.byAgent,
    ).toEqual({ y: { peak: 30, runs: 1 } });
  });

  it("a chat fingerprint is fp: and the first 12 hex of sha256 of `<platform>:<id>`", () => {
    expect(chatFingerprint("claude-code", SID)).toBe(
      `fp:${createHash("sha256").update(`claude-code:${SID}`).digest("hex").slice(0, 12)}`,
    );
    expect(hostChat({ CLAUDE_CODE_SESSION_ID: SID })).toEqual({ platform: "claude-code", id: SID });
    expect(hostChat({ CLAUDE_CODE_SESSION_ID: "../x" })).toBeUndefined();
    expect(hostChat({})).toBeUndefined();
  });

  it("runChats: the run's session fingerprints, each once, in row order", () => {
    const rows = [
      { type: "workflow-started", workflow: "build", at: "a" },
      { type: "session", workflow: "build", at: "b", session: "fp:1" },
      { type: "session", workflow: "build", at: "c", session: "fp:2" },
      { type: "session", workflow: "build", at: "d", session: "fp:1" },
    ];
    expect(runChats(rows as never)).toEqual(["fp:1", "fp:2"]);
  });

  it("stepsBlock skips session and owner rows when timing a step", () => {
    const at = (m: number) => new Date(T0 + m * 60_000).toISOString();
    const rows = [
      { type: "workflow-started", workflow: "build", at: at(0) },
      { type: "session", workflow: "build", at: at(5) },
      { type: "owner-pause", workflow: "build", at: at(6) },
      { type: "owner-answer", workflow: "build", at: at(8) },
      { type: "step-done", workflow: "build", step: "build-x", at: at(10) },
    ];
    expect(stepsBlock(rows as never).byStep["build-x"]).toEqual({ n: 1, totalMinutes: 10 });
  });

  it("a subagent without a meta file counts as `unknown`", () => {
    const dir = claudeDir([{ name: "agent-n", lines: [turn(T0 + 10, "n1", 4, 0, 0)] }]);
    expect(agentContextBlock(T0, T0 + 60_000, { sessionId: SID, claudeDir: dir })?.byAgent).toEqual(
      { unknown: { peak: 4, runs: 1 } },
    );
  });

  it("undefined, never a throw, without a session id, a transcript or a subagent in the run", () => {
    const dir = claudeDir([{ name: "agent-e", type: "x", lines: [turn(T0 - 5, "e", 1, 1, 1)] }]);
    expect(agentContextBlock(T0, T0 + 1, { sessionId: undefined, claudeDir: dir })).toBeUndefined();
    expect(agentContextBlock(T0, T0 + 1, { sessionId: "../etc", claudeDir: dir })).toBeUndefined();
    expect(
      agentContextBlock(T0, T0 + 1, { sessionId: SID, claudeDir: path.join(dir, "missing") }),
    ).toBeUndefined();
    expect(agentContextBlock(T0, T0 + 1, { sessionId: SID, claudeDir: dir })).toBeUndefined();
    const other = claudeDir([]);
    fs.writeFileSync(path.join(other, "projects", "a-file"), "");
    expect(agentContextBlock(T0, T0 + 1, { sessionId: SID, claudeDir: other })).toBeUndefined();
  });

  it.skipIf(process.getuid?.() === 0)(
    "undefined, never a throw, when a folder cannot be read",
    () => {
      const dir = claudeDir([{ name: "agent-u", type: "x", lines: [turn(T0 + 1, "u", 1, 1, 1)] }]);
      const sub = path.join(dir, "projects", "-tmp-repo", SID, "subagents");
      const run = () => agentContextBlock(T0, T0 + 10, { sessionId: SID, claudeDir: dir });
      for (const [locked, mode] of [
        [sub, 0o000],
        [sub, 0o444],
        [path.join(dir, "projects"), 0o000],
        [dir, 0o000],
      ] as const) {
        fs.chmodSync(locked, mode);
        try {
          expect(run(), `${locked} ${mode.toString(8)}`).toBeUndefined();
        } finally {
          fs.chmodSync(locked, 0o755);
        }
      }
      fs.mkdirSync(path.join(dir, "projects", "-a-locked"));
      fs.chmodSync(path.join(dir, "projects", "-a-locked"), 0o000);
      try {
        expect(run()?.byAgent).toEqual({ x: { peak: 3, runs: 1 } });
      } finally {
        fs.chmodSync(path.join(dir, "projects", "-a-locked"), 0o755);
      }
    },
  );

  it("the block passes outcome-row validation", () => {
    const dir = claudeDir([{ name: "agent-v", type: "x", lines: [turn(T0 + 1, "v", 1, 2, 3)] }]);
    const context = agentContextBlock(T0, T0 + 10, { sessionId: SID, claudeDir: dir });
    const row = {
      schema: SCHEMA,
      ts: T0,
      kind: "outcome",
      repo: "o/r",
      bkit: { version: "1.0.0" },
      by: { workflow: "build", step: "build-close-workflow" },
      run: { parentSha: "a".repeat(40) },
      time: null,
      ending: "done",
      ledgers: { deferrals: { repo: 0 }, failures: { repo: 0 }, friction: {} },
      context,
    };
    expect(validate(row)).toEqual({ ok: true });
    expect(
      validate({ ...row, context: { host: "claude-code", byAgent: { x: { peak: "1" } } } }).ok,
    ).toBe(false);
  });
});

describe("claudeTranscripts", () => {
  it("reads the session id from CLAUDE_CODE_SESSION_ID and the dir from CLAUDE_CONFIG_DIR", () => {
    expect(
      claudeTranscripts({ CLAUDE_CODE_SESSION_ID: "abc", CLAUDE_CONFIG_DIR: "/c" }, "/home/u"),
    ).toEqual({ sessionId: "abc", claudeDir: "/c" });
    expect(claudeTranscripts({}, "/home/u")).toEqual({
      sessionId: undefined,
      claudeDir: path.join("/home/u", ".claude"),
    });
  });
});

describe("planFiles", () => {
  const plans = (...names: string[]) => {
    const tree = tmp();
    const dir = path.join(tree, "docs", "plans", "202610");
    fs.mkdirSync(dir, { recursive: true });
    for (const n of names) fs.writeFileSync(path.join(dir, n), "# plan\n");
    return (fid: string) => planFiles(tree, "202610", fid).map((f) => path.basename(f));
  };

  it("a single plan is the plan file", () => {
    expect(plans("7-x-plan.md")("7-x")).toEqual(["7-x-plan.md"]);
  });

  it("reads only the plan file, never {FID}-plan-N.md files; none without it", () => {
    expect(plans("7-x-plan.md", "7-x-plan-2.md", "7-x-plan-1.md")("7-x")).toEqual(["7-x-plan.md"]);
    expect(plans("7-x-plan-1.md", "7-y-plan.md")("7-x")).toEqual([]);
  });
});
