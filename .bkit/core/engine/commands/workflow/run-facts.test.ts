import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import type { StatusEvent } from "../../ledgers/status";
import { foldFrom, totalsProblem, validate } from "../../ledgers/telemetry";
import { appendLedgerRows } from "./ledgers";
import {
  buildBlock,
  ciEntry,
  ciList,
  lineClass,
  minutesOf,
  planBlock,
  restateOutcome,
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
const testFirst = (...tests: Array<[string, string]>) =>
  tests.map(([file, name]) => `\`${file}\` \`${name}\` fails`).join("; ");
/** A task bullet with its `Test first` line (none when `tests` is null) and sub-step checkboxes. */
const task = (n: number, tests: Array<[string, string]> | null, subSteps = 0) =>
  [
    `- [ ] **Task ${n}:** Do ${n}. **Done when:** done.${tests === null ? "" : ` **Test first:** ${testFirst(...tests)}.`}`,
    ...Array.from({ length: subSteps }, (_, i) => `  - [ ] Step ${n}.${i + 1}`),
  ].join("\n");
const plan = (...tasks: string[]) => `# Plan\n\n${tasks.join("\n")}\n`;

describe("planBlock", () => {
  function tree() {
    const root = tmp();
    const logDir = path.join(root, `docs/plans/${MONTH}/logs/${FID}`);
    fs.mkdirSync(logDir, { recursive: true });
    return { root, logDir };
  }

  it("counts task headings, not every `- [` line: sub-step checkboxes are not tasks", () => {
    const { root, logDir } = tree();
    write(
      root,
      planRel(`${FID}-plan.md`),
      plan(task(1, [["a.test.ts", "one"]], 3), task(2, [["b.test.ts", "two"]], 3)),
    );
    const block = planBlock(root, MONTH, FID, logDir, undefined);
    // Eight `- [` lines, two tasks.
    expect(block?.total?.tasks).toBe(2);
    expect(block?.subPlans?.[0]?.tasks).toHaveLength(2);
  });

  it("reads per task its Test first tests and distinct test files; null for a task without the field", () => {
    const { root, logDir } = tree();
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
        "- [ ] **Task 3:** Docs. **Done when:** done. **Test first:** n/a — docs only.",
      ),
    );
    expect(planBlock(root, MONTH, FID, logDir, "file")?.subPlans?.[0]?.tasks).toEqual([
      { tests: 3, testFiles: 2 },
      { tests: null, testFiles: null },
      { tests: 0, testFiles: 0 },
    ]);
  });

  it("reads sub-plans {fid}-plan-N.md in N order, over the unsplit plan; totals sum the sub-plans", () => {
    const { root, logDir } = tree();
    const pad = (text: string, kb: number) => text + "x".repeat(kb * 1024 - text.length);
    write(root, planRel(`${FID}-plan.md`), plan(task(1, null)));
    write(root, planRel(`${FID}-plan-10.md`), pad(plan(task(1, null)), 3));
    write(root, planRel(`${FID}-plan-2.md`), pad(plan(task(1, null), task(2, null)), 2));
    write(
      root,
      planRel(`${FID}-plan-1.md`),
      pad(plan(task(1, null), task(2, null), task(3, null)), 1),
    );
    write(root, planRel(`99-other-plan-1.md`), plan(task(1, null)));
    const block = planBlock(root, MONTH, FID, logDir, "file");
    expect(block?.source).toBe("file");
    expect(block?.subPlans?.map((s) => [s.kb, s.tasks.length])).toEqual([
      [1, 3],
      [2, 2],
      [3, 1],
    ]);
    expect(block?.total).toEqual({ tasks: 6, kb: 6 });
    expect(totalsProblem({ plan: block })).toBeUndefined();
  });

  it("a brief run carries only source: brief", () => {
    const { root, logDir } = tree();
    write(root, planRel(`${FID}-plan.md`), plan(task(1, null)));
    expect(planBlock(root, MONTH, FID, logDir, "brief")).toEqual({ source: "brief" });
  });

  it("is undefined when the feature has no plan file", () => {
    const { root, logDir } = tree();
    expect(planBlock(root, MONTH, FID, logDir, undefined)).toBeUndefined();
  });

  it("takes complexity from plan-complexity-check.md and the plan it read, with the split's reasons", () => {
    const { root, logDir } = tree();
    write(root, planRel(`${FID}-plan-1.md`), plan(task(1, null)));
    const many = Array.from({ length: 11 }, (_, i) => ["a.test.ts", `t${i}`] as [string, string]);
    const files = (["a", "b", "c", "d"] as const).map(
      (f) => [`${f}.test.ts`, "x"] as [string, string],
    );
    const checked = plan(
      task(1, many),
      task(2, files),
      ...Array.from({ length: 11 }, (_, i) => task(i + 3, [["z.test.ts", "z"]])),
    );
    fs.writeFileSync(path.join(logDir, "plan-v3-checked.md"), checked);
    fs.writeFileSync(path.join(logDir, "plan-complexity-check.md"), "# Check\n\nVerdict: SPLIT\n");
    expect(planBlock(root, MONTH, FID, logDir, "file")?.complexity).toEqual({
      verdict: "SPLIT",
      tasksChecked: 13,
      reasons: ["over-12-tasks", "task-1-over-10-tests", "task-2-over-3-test-files"],
    });

    fs.writeFileSync(path.join(logDir, "plan-complexity-check.md"), "Verdict: PASS\n");
    expect(planBlock(root, MONTH, FID, logDir, "file")?.complexity).toEqual({
      verdict: "PASS",
      tasksChecked: 13,
      reasons: [],
    });

    fs.rmSync(path.join(logDir, "plan-v3-checked.md"));
    expect(planBlock(root, MONTH, FID, logDir, "file")?.complexity).toEqual({
      verdict: "PASS",
      tasksChecked: null,
      reasons: [],
    });
  });

  it("has no complexity without plan-complexity-check.md", () => {
    const { root, logDir } = tree();
    write(root, planRel(`${FID}-plan.md`), plan(task(1, null)));
    expect(planBlock(root, MONTH, FID, logDir, "file")).not.toHaveProperty("complexity");
  });
});

// ---------------------------------------------------------------------------

describe("buildBlock", () => {
  const rows = [
    started(0),
    step(1, "build-task-red"),
    step(2, "build-task-red"),
    step(3, "build-plan-verify", { subPlan: 1, attempt: 1, verdict: "FAIL", failures: 1 }),
    step(4, "build-plan-gaps-remediate", {
      subPlan: 1,
      attempt: 1,
      verdict: "FAIL",
      strategy: "STANDARD",
    }),
    step(5, "build-plan-verify", { subPlan: 1, attempt: 2, verdict: "PASS", failures: 0 }),
    step(6, "build-task-red"),
    step(7, "build-plan-verify-holistic", { verdict: "FAIL", failures: 2 }),
    step(8, "build-plan-verify-holistic", { verdict: "PASS", failures: 0 }),
    step(9, "build-challenge", { verdict: "CONCERNS" }),
    step(10, "build-challenge-reconcile"),
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
    fs.writeFileSync(
      path.join(logDir, "build-challenge.md"),
      [
        "# Challenge",
        "### F1 — HIGH — null deref",
        "#### F2 MEDIUM retry loop (was LOW)",
        "### F3 — LOW — naming",
        "### F4 — LOW — comment",
        "## Summary: CRITICAL none",
      ].join("\n"),
    );
    return logDir;
  }

  it("reads every verify and gaps-remediate round, the last holistic and challenge, and the red-test runs", () => {
    const block = buildBlock(rows, logs());
    expect(block).toEqual({
      verify: [
        { subPlan: 1, attempt: 1, verdict: "FAIL", failures: 1, testOrderGaps: 2 },
        { subPlan: 1, attempt: 2, verdict: "PASS", failures: 0, testOrderGaps: null },
      ],
      gapsRemediate: [{ subPlan: 1, attempt: 1, verdict: "FAIL", strategy: "STANDARD" }],
      holistic: { verdict: "PASS", failures: 0 },
      challenge: {
        verdict: "CONCERNS",
        findings: { total: 4, CRITICAL: 0, HIGH: 1, MEDIUM: 1, LOW: 2 },
      },
      redTests: 3,
    });
  });

  it("its totals match their parts: findings total = the four severities, redTests = the build-task-red rows", () => {
    const build = buildBlock(rows, logs());
    const f = build.challenge!.findings!;
    expect(f.total).toBe(f.CRITICAL + f.HIGH + f.MEDIUM + f.LOW);
    const steps = stepsBlock(rows);
    expect(build.redTests).toBe(steps.byStep["build-task-red"]!.n);
    expect(totalsProblem({ steps, build })).toBeUndefined();
  });

  it("counts findings only once the challenge is reconciled; empty without the build's steps", () => {
    const unreconciled = rows.filter((r) => r.step !== "build-challenge-reconcile");
    expect(buildBlock(unreconciled, logs()).challenge).toEqual({
      verdict: "CONCERNS",
      findings: null,
    });
    expect(buildBlock([started(0)], tmp())).toEqual({
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
      schema: 2,
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
