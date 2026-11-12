import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { runCommand } from "../lib";
import { COMMANDS } from "../registry";
import { applyRecommendations, EXIT_HARD_BLOCKERS, parseDecisionItems } from "./decisions";

const dirs: string[] = [];
const runtimeBefore = process.env.BKIT_RUNTIME;
afterEach(() => {
  for (const d of dirs.splice(0)) fs.rmSync(d, { recursive: true, force: true });
  if (runtimeBefore === undefined) delete process.env.BKIT_RUNTIME;
  else process.env.BKIT_RUNTIME = runtimeBefore;
});

async function run(argv: string[], cwd: string) {
  const out: string[] = [];
  const err: string[] = [];
  const code = await runCommand([...argv, "--json"], COMMANDS, {
    classicVerbs: new Set(),
    cwd,
    io: { stdout: (t) => out.push(t), stderr: (t) => err.push(t) },
  });
  return { code, json: out.length ? JSON.parse(out.join("")) : undefined, err: err.join("") };
}

/** A git checkout with a feature log directory; returns the checkout and the log dir. */
function checkout() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-decisions-"));
  dirs.push(root);
  spawnSync("git", ["init", "-q", "-b", "dev"], { cwd: root });
  const logs = path.join(root, "docs/plans/202610/logs/7-x");
  fs.mkdirSync(logs, { recursive: true });
  return { root, logs };
}

const ITEMS = [
  {
    title: "Task 3 [src/a.ts:10]",
    question: "MEDIUM: the retry has no cap. Accept it?",
    options: ["Accept", "Fix now"],
    recommended: "Accept",
    reason: "the caller already caps it",
  },
  {
    title: "Task 4 [src/b.ts:2]",
    question: "HIGH: the token is logged. Fix it now?",
    options: ["Accept", "Fix now"],
    recommended: "Fix now",
    reason: "a secret reaches the log",
  },
];
const BLOCKER = {
  title: "Task 5 [src/c.ts:1]",
  question: "no test-first evidence. Accept it?",
  options: ["Accept", "Fix now", "Stop"],
  noRecommendation: "only the owner can waive test-first",
};

async function compose(root: string, logs: string, items: unknown[], ...extra: string[]) {
  const itemsFile = path.join(root, "items.json");
  fs.writeFileSync(itemsFile, JSON.stringify(items));
  const out = path.join(logs, "build-decision-1-1.md");
  const r = await run(
    [
      "decisions",
      "compose",
      `--out=${out}`,
      "--header=Question=CHALLENGE",
      "--header=From=challenge",
      `--items=${itemsFile}`,
      ...extra,
    ],
    root,
  );
  return { r, out };
}

describe("bkit decisions compose", () => {
  it("writes the header, one item per question and the reply line", async () => {
    const { root, logs } = checkout();
    const { r, out } = await compose(root, logs, [...ITEMS, BLOCKER]);
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({ questions: 3, loopRecommended: null });
    const text = fs.readFileSync(out, "utf-8");
    expect(text.split("\n").slice(0, 3)).toEqual([
      "Status: OPEN",
      "Question: CHALLENGE",
      "From: challenge",
    ]);
    expect(text).toContain(
      "**Q1 — Task 3 [src/a.ts:10]:** MEDIUM: the retry has no cap. Accept it?",
    );
    expect(text).toContain("Recommended: B) Fix now — a secret reaches the log");
    expect(text).toContain("No recommendation — only the owner can waive test-first");
    expect(text.trimEnd().split("\n").at(-1)).toBe(
      'Reply per question. "yes" takes every recommendation. "stop" writes a handover; the run can be resumed.',
    );
  });

  it("compose letters every option and the recommended one", async () => {
    const { root, logs } = checkout();
    const { out } = await compose(root, logs, [ITEMS[1]]);
    const text = fs.readFileSync(out, "utf-8");
    expect(text).toContain("Options: A) Accept / B) Fix now");
    expect(text).toContain("Recommended: B) Fix now — a secret reaches the log");
    expect(text).not.toContain("Options: Accept / Fix now");
  });

  it("refuses an item whose recommendation is not one of its options", async () => {
    const { root, logs } = checkout();
    const bad = [{ ...ITEMS[0], recommended: "Maybe" }];
    expect((await compose(root, logs, bad)).r.code).toBe(2);
  });

  it("refuses an item with more options than letters", async () => {
    const { root, logs } = checkout();
    const options = Array.from({ length: 27 }, (_, i) => `Option ${i + 1}`);
    const bad = [{ ...ITEMS[0], options, recommended: "Option 27" }];
    expect((await compose(root, logs, bad)).r.code).toBe(2);
  });

  it("round-trips the last lettered option through parseDecisionItems", async () => {
    const { root, logs } = checkout();
    const options = Array.from({ length: 26 }, (_, i) => `Option ${i + 1}`);
    const { r, out } = await compose(root, logs, [
      { ...ITEMS[0], options, recommended: "Option 26" },
    ]);
    expect(r.code).toBe(0);
    const item = parseDecisionItems(fs.readFileSync(out, "utf-8"))[0]!;
    expect(item.options).toEqual(options);
    expect(item.recommended).toBe("Option 26");
  });

  it("--loop adds the attempt line, the progress block and the loop question as Q1", async () => {
    const { root, logs } = checkout();
    const status = path.join(logs, "status.jsonl");
    const verify = (at: string, failures: number) => ({
      type: "step-done",
      workflow: "build",
      step: "build-plan-verify",
      status: "DONE",
      at,
      group: 1,
      failures,
    });
    fs.writeFileSync(
      status,
      [
        { type: "workflow-started", workflow: "build", at: "2026-10-01T00:00:00Z" },
        verify("2026-10-01T00:10:00Z", 4),
        verify("2026-10-01T00:20:00Z", 4),
      ]
        .map((x) => JSON.stringify(x))
        .join("\n") + "\n",
    );
    const { r, out } = await compose(
      root,
      logs,
      ITEMS,
      "--loop=verify",
      `--file=${status}`,
      "--group=1",
      "--attempt=2",
      "--max=2",
    );
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({ questions: 3, loopRecommended: "Decide" });
    const text = fs.readFileSync(out, "utf-8");
    expect(text).toContain("build verify: attempt 2 of 2");
    expect(text).toContain("Problems after each round: 4 → 4");
    expect(text).toMatch(/\*\*Q1 — Verify:\*\* decide the items below/);
    expect(text).toContain("Options: A) Try again / B) Decide");
    expect(text).toContain("**Q2 — Task 3 [src/a.ts:10]:**");
  });

  it("--loop letters the loop question's options and recommendation", async () => {
    const { root, logs } = checkout();
    const status = path.join(logs, "status.jsonl");
    fs.writeFileSync(
      status,
      [
        { type: "workflow-started", workflow: "build", at: "2026-10-01T00:00:00Z" },
        {
          type: "step-done",
          workflow: "build",
          step: "build-plan-verify",
          status: "DONE",
          at: "2026-10-01T00:10:00Z",
          group: 1,
          failures: 2,
        },
      ]
        .map((x) => JSON.stringify(x))
        .join("\n") + "\n",
    );
    const { out } = await compose(
      root,
      logs,
      ITEMS,
      "--loop=verify",
      `--file=${status}`,
      "--group=1",
    );
    const text = fs.readFileSync(out, "utf-8");
    expect(text).toContain("Options: A) Try again / B) Decide");
    expect(text).not.toContain("Options: Try again / Decide");
    expect(text).toMatch(/Recommended: [AB]\) (Try again|Decide) — /);
  });

  it("--loop=holistic counts only the rounds since the whole-feature check was last clean", async () => {
    const { root, logs } = checkout();
    const status = path.join(logs, "status.jsonl");
    const holistic = (at: string, verdict: string, failures: number) => ({
      type: "step-done",
      workflow: "build",
      step: "build-plan-verify-holistic",
      status: "DONE",
      at,
      verdict,
      failures,
    });
    fs.writeFileSync(
      status,
      [
        { type: "workflow-started", workflow: "build", at: "2026-10-01T00:00:00Z" },
        holistic("2026-10-01T00:10:00Z", "FAIL", 5),
        holistic("2026-10-01T00:20:00Z", "PASS", 0),
        holistic("2026-10-01T00:30:00Z", "FAIL", 3),
        holistic("2026-10-01T00:40:00Z", "FAIL", 3),
      ]
        .map((x) => JSON.stringify(x))
        .join("\n") + "\n",
    );
    const { r, out } = await compose(
      root,
      logs,
      ITEMS,
      "--loop=holistic",
      `--file=${status}`,
      "--attempt=2",
      "--max=2",
    );
    expect(r.code).toBe(0);
    const text = fs.readFileSync(out, "utf-8");
    expect(text).toContain("build verify: attempt 2 of 2");
    expect(text).toContain("Problems after each round: 3 → 3");
    expect(text).toMatch(/\*\*Q1 — Holistic verify:\*\* decide the items below/);
  });

  it("prints the group gate's failing tests per round for the verify loop", async () => {
    const { root, logs } = checkout();
    const status = path.join(logs, "status.jsonl");
    const verifyRow = (at: string, attempt: number) => ({
      type: "step-done",
      workflow: "build",
      step: "build-plan-verify",
      status: "DONE",
      at,
      group: 1,
      attempt,
      failures: 0,
    });
    const gateRow = (at: string, attempt: number) => ({
      type: "test-run",
      workflow: "build",
      at,
      step: "build-group-gate-1",
      attempt,
      run: 1,
      verdict: "FAIL",
      exitCode: 1,
      failures: 3,
      scope: "gate",
      log: "x.log",
    });
    fs.writeFileSync(
      status,
      [
        { type: "workflow-started", workflow: "build", at: "2026-10-01T00:00:00Z" },
        gateRow("2026-10-01T00:09:00Z", 1),
        verifyRow("2026-10-01T00:10:00Z", 1),
        gateRow("2026-10-01T00:29:00Z", 2),
        verifyRow("2026-10-01T00:30:00Z", 2),
      ]
        .map((x) => JSON.stringify(x))
        .join("\n") + "\n",
    );
    const { r, out } = await compose(
      root,
      logs,
      ITEMS,
      "--loop=verify",
      `--file=${status}`,
      "--group=1",
    );
    expect(r.code).toBe(0);
    const text = fs.readFileSync(out, "utf-8");
    expect(text).toContain("Group gate failures after each round: 3 → 3");
    expect(text).toContain("Problems after each round: 3 → 3");
  });

  /** A verify loop stuck at 4 → 4, so the trend alone recommends `Decide` (`Stop` with no items). */
  function stuckStatus(logs: string) {
    const status = path.join(logs, "status.jsonl");
    const verify = (at: string) => ({
      type: "step-done",
      workflow: "build",
      step: "build-plan-verify",
      status: "DONE",
      at,
      group: 1,
      failures: 4,
    });
    fs.writeFileSync(
      status,
      [
        { type: "workflow-started", workflow: "build", at: "2026-10-01T00:00:00Z" },
        verify("2026-10-01T00:10:00Z"),
        verify("2026-10-01T00:20:00Z"),
      ]
        .map((x) => JSON.stringify(x))
        .join("\n") + "\n",
    );
    return status;
  }

  const baseCheck = (over: Record<string, unknown>) => ({
    verdict: "all",
    reason: null,
    base: "abc1234",
    source: "local",
    failing: 3,
    baseRed: 3,
    branch: 0,
    undetermined: 0,
    cases: [],
    adopt: false,
    ...over,
  });

  async function composeWithBase(
    over: Record<string, unknown>,
    items: unknown[],
    opts: { raw?: string } = {},
  ) {
    const { root, logs } = checkout();
    const status = stuckStatus(logs);
    const baseFile = path.join(root, "base-check.json");
    fs.writeFileSync(baseFile, opts.raw ?? JSON.stringify(baseCheck(over)));
    const { r, out } = await compose(
      root,
      logs,
      items,
      "--loop=verify",
      `--file=${status}`,
      "--group=1",
      "--attempt=2",
      "--max=2",
      `--base-check=${baseFile}`,
    );
    return { r, text: fs.existsSync(out) ? fs.readFileSync(out, "utf-8") : "" };
  }

  it("base check all with no items recommends Stop", async () => {
    const { r, text } = await composeWithBase({}, []);
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({ loopRecommended: "Stop" });
    expect(text).toMatch(/Recommended: B\) Stop — .*fail on `dev` too/);
    expect(text).toContain("Fix `dev`, then resume.");
  });

  it("base check all with items recommends Decide", async () => {
    const { r, text } = await composeWithBase({}, ITEMS);
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({ loopRecommended: "Decide" });
    expect(text).toMatch(/Recommended: B\) Decide — .*fail on `dev` too/);
  });

  it("base check all says a gate still red after resume comes from this branch", async () => {
    const { r, text } = await composeWithBase({}, []);
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({ loopRecommended: "Stop" });
    expect(text).toMatch(/still red after `dev` is fixed and the run resumed[^.]*this branch/);
  });

  it("base check all in adopt mode adds the merge sentence", async () => {
    const adopt = await composeWithBase({ adopt: true }, []);
    expect(adopt.text).toContain("merge `dev` into the branch before resuming");
    const plain = await composeWithBase({ adopt: false }, []);
    expect(plain.text).not.toContain("merge `dev` into the branch before resuming");
  });

  it("base check some names the split", async () => {
    const { r, text } = await composeWithBase(
      { verdict: "some", failing: 5, baseRed: 3, branch: 2 },
      ITEMS,
    );
    expect(r.code).toBe(0);
    expect(text).toContain("a round can fix 2 of 5");
    expect(text).toContain("the build will still stop on the 3 from `dev`");
    expect(text).toMatch(/Recommended: B\) Decide — a round can fix 2 of 5/);
  });

  it("base check some with undetermined cases counts only the branch's as fixable", async () => {
    const { r, text } = await composeWithBase(
      {
        verdict: "some",
        failing: 3,
        baseRed: 1,
        branch: 1,
        undetermined: 1,
        reason: "the base run crashed",
      },
      ITEMS,
    );
    expect(r.code).toBe(0);
    expect(text).toContain("a round can fix 1 of 3");
    expect(text).not.toContain("a round can fix 2 of 3");
    expect(text).toContain("the build will still stop on the 1 from `dev`");
    expect(text).toMatch(/1 could not be checked: the base run crashed/);
  });

  it("base check none keeps the trend and names the branch", async () => {
    const { r, text } = await composeWithBase(
      { verdict: "none", failing: 3, baseRed: 0, branch: 3 },
      ITEMS,
    );
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({ loopRecommended: "Decide" });
    expect(text).toMatch(/Recommended: B\) Decide — the failures come from this branch/);
  });

  it("base check unknown keeps the trend and says why", async () => {
    const { r, text } = await composeWithBase(
      {
        verdict: "unknown",
        reason: "no JUnit report",
        base: null,
        source: null,
        baseRed: 0,
      },
      ITEMS,
    );
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({ loopRecommended: "Decide" });
    expect(text).toMatch(/Recommended: B\) Decide — cause unknown: no JUnit report/);
  });

  it("Try again is offered for every base verdict", async () => {
    const variants: Record<string, unknown>[] = [
      { verdict: "all" },
      { verdict: "some", failing: 5, baseRed: 3, branch: 2 },
      { verdict: "none", failing: 3, baseRed: 0, branch: 3 },
      { verdict: "unknown", reason: "no JUnit report", base: null, source: null },
    ];
    for (const over of variants) {
      for (const items of [[], ITEMS]) {
        const { text } = await composeWithBase(over, items);
        expect(text, `${String(over.verdict)} with ${items.length} items`).toMatch(
          /\*\*Q1 — Verify:\*\*[^\n]*\nOptions: A\) Try again \/ B\) (Decide|Stop)/,
        );
      }
    }
  });

  it("base check prints how many failing tests are also red on base", async () => {
    const all = await composeWithBase({}, []);
    expect(all.text).toContain("Also red on base abc1234: 3 of 3 (local run)");
    const unknown = await composeWithBase(
      { verdict: "unknown", reason: "no JUnit report", base: null, source: null },
      [],
    );
    expect(unknown.text).toContain("Also red on base unknown: can't tell (no JUnit report)");
  });

  it("a missing or malformed base check is a usage error that names the problem", async () => {
    const { root, logs } = checkout();
    const status = stuckStatus(logs);
    const missing = await compose(
      root,
      logs,
      ITEMS,
      "--loop=verify",
      `--file=${status}`,
      "--group=1",
      `--base-check=${path.join(root, "no-such-base.json")}`,
    );
    expect(missing.r.code).toBe(2);
    expect(missing.r.err).toContain("no-such-base.json");
    expect(missing.r.err).not.toContain("unknown flag");

    const noVerdict = { ...baseCheck({}) } as Record<string, unknown>;
    delete noVerdict.verdict;
    const bad = await composeWithBase({}, ITEMS, { raw: JSON.stringify(noVerdict) });
    expect(bad.r.code).toBe(2);
    expect(bad.r.err).toContain("verdict");
    expect(bad.r.err).not.toContain("unknown flag");
  });

  it("--loop needs --file", async () => {
    const { root, logs } = checkout();
    expect((await compose(root, logs, ITEMS, "--loop=verify")).r.code).toBe(2);
  });
});

describe("bkit decisions apply --by=rerun", () => {
  const rerun = (root: string, out: string) =>
    run(["decisions", "apply", "--by=rerun", `--file=${out}`], root);

  it("records the re-run under Q1 and closes the file", async () => {
    const { root, logs } = checkout();
    const status = path.join(logs, "status.jsonl");
    const verify = (at: string) => ({
      type: "step-done",
      workflow: "build",
      step: "build-plan-verify",
      status: "DONE",
      at,
      group: 1,
      failures: 4,
    });
    fs.writeFileSync(
      status,
      [
        { type: "workflow-started", workflow: "build", at: "2026-10-01T00:00:00Z" },
        verify("2026-10-01T00:10:00Z"),
        verify("2026-10-01T00:20:00Z"),
      ]
        .map((x) => JSON.stringify(x))
        .join("\n") + "\n",
    );
    const { out } = await compose(
      root,
      logs,
      [],
      "--header=Gate=FAIL",
      "--loop=verify",
      `--file=${status}`,
      "--group=1",
    );
    expect(fs.readFileSync(out, "utf-8")).toContain("Gate: FAIL");
    const r = await rerun(root, out);
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({ status: "DECIDED" });
    const text = fs.readFileSync(out, "utf-8");
    expect(text).toMatch(/^Status: DECIDED$/m);
    expect(text).toMatch(
      /Decision: Re-run gate — the owner resumed the run, so the gate runs again first \(\d{4}-\d{2}-\d{2}\)/,
    );
    const q1 = text.indexOf("**Q1");
    expect(text.indexOf("Decision: Re-run gate")).toBeGreaterThan(q1);
  });

  it("refuses a file without Gate: FAIL or not OPEN", async () => {
    const { root, logs } = checkout();
    const plain = await compose(root, logs, [ITEMS[1]]);
    const before = fs.readFileSync(plain.out, "utf-8");
    const noGate = await rerun(root, plain.out);
    expect(noGate.code).toBe(2);
    expect(noGate.err).toContain("Gate: FAIL");
    expect(noGate.err).not.toContain("--by must be headless or owner");
    expect(fs.readFileSync(plain.out, "utf-8")).toBe(before);

    const gated = await compose(root, logs, [ITEMS[1]], "--header=Gate=FAIL");
    const closed = fs.readFileSync(gated.out, "utf-8").replace("Status: OPEN", "Status: DECIDED");
    fs.writeFileSync(gated.out, closed);
    const notOpen = await rerun(root, gated.out);
    expect(notOpen.code).toBe(2);
    expect(notOpen.err).toContain("DECIDED");
    expect(notOpen.err).not.toContain("--by must be headless or owner");
    expect(fs.readFileSync(gated.out, "utf-8")).toBe(closed);
  });

  it("refuses a Gate: FAIL file whose Q1 is an item, not the loop question", async () => {
    const { root, logs } = checkout();
    const { out } = await compose(root, logs, [BLOCKER], "--header=Gate=FAIL");
    const before = fs.readFileSync(out, "utf-8");
    const r = await rerun(root, out);
    expect(r.code).toBe(2);
    expect(r.err).toContain("Q1");
    expect(fs.readFileSync(out, "utf-8")).toBe(before);
    expect(fs.readFileSync(out, "utf-8")).toMatch(/^Status: OPEN$/m);
    expect(fs.readFileSync(out, "utf-8")).not.toContain("Decision: Re-run gate");
  });

  it("refuses a loop file with an undecided item question", async () => {
    const { root, logs } = checkout();
    const status = path.join(logs, "status.jsonl");
    const verify = (at: string) => ({
      type: "step-done",
      workflow: "build",
      step: "build-plan-verify",
      status: "DONE",
      at,
      group: 1,
      failures: 4,
    });
    fs.writeFileSync(
      status,
      [
        { type: "workflow-started", workflow: "build", at: "2026-10-01T00:00:00Z" },
        verify("2026-10-01T00:10:00Z"),
        verify("2026-10-01T00:20:00Z"),
      ]
        .map((x) => JSON.stringify(x))
        .join("\n") + "\n",
    );
    const { out } = await compose(
      root,
      logs,
      [BLOCKER],
      "--header=Gate=FAIL",
      "--loop=verify",
      `--file=${status}`,
      "--group=1",
    );
    const before = fs.readFileSync(out, "utf-8");
    expect(before).toContain("**Q2");
    const r = await rerun(root, out);
    expect(r.code).toBe(2);
    expect(r.err).toContain("Q2");
    expect(fs.readFileSync(out, "utf-8")).toBe(before);
    expect(fs.readFileSync(out, "utf-8")).toMatch(/^Status: OPEN$/m);
  });

  it("refuses a file whose only Gate: FAIL line is in an item body", async () => {
    const { root, logs } = checkout();
    const smuggled = { ...ITEMS[1], question: "Fix it?\nGate: FAIL" };
    const { out } = await compose(root, logs, [smuggled]);
    const before = fs.readFileSync(out, "utf-8");
    const r = await rerun(root, out);
    expect(r.code).toBe(2);
    expect(r.err).toContain("Gate: FAIL");
    expect(r.err).not.toContain("--by must be headless or owner");
    expect(fs.readFileSync(out, "utf-8")).toBe(before);
    expect(fs.readFileSync(out, "utf-8")).toMatch(/^Status: OPEN$/m);
  });
});

describe("bkit decisions apply --by=headless", () => {
  it("takes each recommendation: an Accept is assumed, Fix now is written as such", async () => {
    const { root, logs } = checkout();
    const { out } = await compose(root, logs, ITEMS);
    process.env.BKIT_RUNTIME = "GITHUB_ACTION";
    const r = await run(["decisions", "apply", "--by=headless", `--file=${out}`], root);
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({
      status: "ASSUMED",
      applied: [1, 2],
      fixNow: [2],
      hardBlockers: [],
    });
    const items = parseDecisionItems(fs.readFileSync(out, "utf-8"));
    expect(items[0]!.assumed).toBe(true);
    expect(items[0]!.decision).toMatch(
      /^Accept \(assumed\) — the caller already caps it \(headless, GITHUB_ACTION, /,
    );
    expect(items[1]!.decision).toBe(
      "Fix now — recommended; applied without asking (GITHUB_ACTION)",
    );
    expect(fs.existsSync(path.join(root, "docs/decisions.jsonl"))).toBe(false);
  });

  it("leaves hard blockers for the owner and exits with the hard-blocker code", async () => {
    const { root, logs } = checkout();
    const { out } = await compose(root, logs, [ITEMS[0], BLOCKER]);
    process.env.BKIT_RUNTIME = "LOCAL";
    const r = await run(["decisions", "apply", "--by=headless", `--file=${out}`], root);
    expect(r.code).toBe(EXIT_HARD_BLOCKERS);
    expect(r.json).toMatchObject({ status: "OPEN", applied: [1], hardBlockers: [2] });
    expect(r.err).toContain("hard blockers need the owner: Q2");
    expect(fs.readFileSync(out, "utf-8")).toContain("(ask:false, LOCAL, ");
  });

  it("labels the runtime from the main checkout's Cursor marker when run in a build worktree", async () => {
    const { root } = checkout();
    spawnSync(
      "git",
      ["-c", "user.email=t@t", "-c", "user.name=t", "commit", "-q", "--allow-empty", "-m", "i"],
      { cwd: root },
    );
    spawnSync("git", ["worktree", "add", "-q", "-b", "feat/7-x", ".worktrees/7-x"], { cwd: root });
    fs.mkdirSync(path.join(root, ".bkit"));
    fs.writeFileSync(path.join(root, ".bkit", ".runtime-cursor"), "");
    const wt = path.join(root, ".worktrees", "7-x");
    const logs = path.join(wt, "docs/plans/202610/logs/7-x");
    fs.mkdirSync(logs, { recursive: true });
    const { out } = await compose(wt, logs, [ITEMS[0]]);
    delete process.env.BKIT_RUNTIME;
    const r = await run(["decisions", "apply", "--by=headless", `--file=${out}`], wt);
    expect(r.code).toBe(0);
    expect(fs.readFileSync(out, "utf-8")).toContain("(ask:false, CLOUD_CURSOR, ");
  });
});

describe("parseDecisionItems", () => {
  it("parseDecisionItems keeps the bare option name, dropping the letter", () => {
    const text = [
      "Status: OPEN",
      "",
      "**Q1 — Task 3 [src/a.ts:10]:** accept it?",
      "Options: A) Accept / B) Fix now",
      "Recommended: B) Fix now — a secret reaches the log",
      "",
    ].join("\n");
    const item = parseDecisionItems(text)[0]!;
    expect(item.options).toEqual(["Accept", "Fix now"]);
    expect(item.recommended).toBe("Fix now");
    expect(item.reason).toBe("a secret reaches the log");
  });

  it("a decision file written before the letters still parses", () => {
    const legacy = [
      "Status: OPEN",
      "",
      "**Q1 — Task 3 [src/a.ts:10]:** accept it?",
      "Options: Accept / Fix now",
      "Recommended: Accept — the caller already caps it",
      "",
    ].join("\n");
    const items = parseDecisionItems(legacy);
    expect(items[0]!.options).toEqual(["Accept", "Fix now"]);
    expect(items[0]!.recommended).toBe("Accept");
    const lettered = parseDecisionItems(
      legacy
        .replace("Options: Accept / Fix now", "Options: A) Accept / B) Fix now")
        .replace("Recommended: Accept —", "Recommended: A) Accept —"),
    );
    expect(lettered[0]!.options).toEqual(items[0]!.options);
    expect(lettered[0]!.recommended).toEqual(items[0]!.recommended);
  });

  it("parseDecisionItems reads a lettered decision as the option its letter labels", () => {
    const decided = (decision: string) =>
      parseDecisionItems(
        [
          "Status: OPEN",
          "",
          "**Q1 — Task 3 [src/a.ts:10]:** accept it?",
          "Options: A) Accept / B) Fix now",
          "Recommended: A) Accept — minor",
          `Decision: ${decision}`,
          "",
        ].join("\n"),
      )[0]!.decision;
    expect(decided("B")).toBe("Fix now");
    expect(decided("b")).toBe("Fix now");
    expect(decided("B)")).toBe("Fix now");
    expect(decided("B) Fix now")).toBe("Fix now");
    expect(decided("B) Fix now — a secret reaches the log")).toBe(
      "Fix now — a secret reaches the log",
    );
    expect(decided("B — a secret reaches the log")).toBe("Fix now — a secret reaches the log");
    expect(decided("B fix now, please")).toBe("Fix now, please");
    expect(decided("A) Accept — fine by me")).toBe("Accept — fine by me");
    expect(decided("Accept — fine by me")).toBe("Accept — fine by me");
    expect(decided("A fine call")).toBe("A fine call");
    expect(decided("C — no such option")).toBe("C — no such option");
  });

  it("a lettered assumed Accept decision still reads as assumed", () => {
    const items = parseDecisionItems(
      [
        "Status: ASSUMED",
        "",
        "**Q1 — Gap:** accept it?",
        "Options: A) Accept / B) Fix now",
        "Recommended: A) Accept — minor",
        "Decision: A) Accept (assumed) — minor (ask:false, LOCAL, 2026-10-28)",
        "",
      ].join("\n"),
    );
    expect(items[0]!.decision).toBe("Accept (assumed) — minor (ask:false, LOCAL, 2026-10-28)");
    expect(items[0]!.assumed).toBe(true);
  });
});

describe("applyRecommendations", () => {
  it("a Try again loop answer settles the loop alone; the items wait for the next round", () => {
    const text = [
      "Status: OPEN",
      "",
      "**Q1 — Verify:** another fix round?",
      "Options: Try again / Decide",
      "Recommended: Try again — the last round made progress",
      "",
      "**Q2 — Gap:** accept it?",
      "Options: Accept / Fix now",
      "Recommended: Accept — minor",
      "",
    ].join("\n");
    const r = applyRecommendations(text, "LOCAL", "ask:false");
    expect(r).toMatchObject({ applied: [1], hardBlockers: [], loop: "Try again" });
    expect(parseDecisionItems(r.text)[1]!.decision).toBeNull();
  });

  it("a lettered recommendation still settles its item by name", () => {
    const text = [
      "Status: OPEN",
      "",
      "**Q1 — Gap:** accept it?",
      "Options: A) Accept / B) Fix now",
      "Recommended: A) Accept — minor",
      "",
    ].join("\n");
    const r = applyRecommendations(text, "LOCAL", "ask:false");
    expect(r).toMatchObject({ applied: [1], hardBlockers: [], loop: null });
    expect(parseDecisionItems(r.text)[0]!.decision).toMatch(/^Accept \(assumed\) — minor \(/);
  });

  it("applyRecommendations reads a lettered Try again decision as the loop answer", () => {
    const text = [
      "Status: OPEN",
      "",
      "**Q1 — Verify:** another fix round?",
      "Options: A) Try again / B) Decide",
      "Recommended: B) Decide — stuck",
      "Decision: A) Try again — one more",
      "",
      "**Q2 — Gap:** accept it?",
      "Options: A) Accept / B) Fix now",
      "Recommended: A) Accept — minor",
      "",
    ].join("\n");
    const r = applyRecommendations(text, "LOCAL", "ask:false");
    expect(r).toMatchObject({ applied: [], hardBlockers: [], loop: "Try again" });
    expect(parseDecisionItems(r.text)[1]!.decision).toBeNull();
  });
});

describe("bkit decisions apply --by=owner and pending", () => {
  async function assumed() {
    const { root, logs } = checkout();
    const { out } = await compose(root, logs, [
      ITEMS[0],
      { ...ITEMS[0], title: "Task 6 [src/d.ts:4]" },
    ]);
    process.env.BKIT_RUNTIME = "GITHUB_ACTION";
    await run(["decisions", "apply", "--by=headless", `--file=${out}`], root);
    return { root, out };
  }
  const pending = (root: string, ...extra: string[]) =>
    run(["decisions", "pending", "--fid=7-x", "--month=202610", ...extra], root);

  it("pending lists each assumed Accept nobody confirmed", async () => {
    const { root } = await assumed();
    const r = await pending(root);
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({ count: 2, deferred: [] });
    expect(r.json.items[0]).toMatchObject({
      file: "docs/plans/202610/logs/7-x/build-decision-1-1.md",
      q: 1,
      title: "Task 3 [src/a.ts:10]",
      state: "pending",
    });
  });

  it("--confirm writes the owner's decision row and the real Accept; --reject marks it rejected", async () => {
    const { root, out } = await assumed();
    const owner = (q: string, ...extra: string[]) =>
      run(["decisions", "apply", "--by=owner", `--file=${out}`, `--q=${q}`, ...extra], root);
    const confirm = await owner("1", "--confirm", "--reason=fine as is");
    expect(confirm.code).toBe(0);
    expect(confirm.json.decisionKey).toBe("7-x-accepted-task-3-src-a-ts-10");
    const ledger = fs.readFileSync(path.join(root, "docs/decisions.jsonl"), "utf-8");
    expect(JSON.parse(ledger.trim())).toMatchObject({
      kind: "decision",
      rationale: "accepted by owner: fine as is",
      by: { workflow: "ship" },
    });
    expect((await owner("2", "--reject", "--reason=fix it later")).code).toBe(0);
    const items = parseDecisionItems(fs.readFileSync(out, "utf-8"));
    expect(items[0]!.decision).toMatch(/^Accept — fine as is \(owner, confirmed at ship, /);
    expect(items[1]!.rejected).toBe(true);
    expect((await pending(root)).json.items).toEqual([
      expect.objectContaining({ q: 2, state: "rejected" }),
    ]);
  });

  it("refuses an item that is not an assumed Accept, or a call without one of --confirm / --reject", async () => {
    const { root, out } = await assumed();
    const base = ["decisions", "apply", "--by=owner", `--file=${out}`, "--reason=x"];
    expect((await run([...base, "--q=9", "--confirm"], root)).code).toBe(2);
    expect((await run([...base, "--q=1"], root)).code).toBe(2);
    expect((await run([...base, "--q=1", "--confirm", "--reject"], root)).code).toBe(2);
  });

  it("--defer writes one needs-decision deferral per listed item, then lists none", async () => {
    const { root } = await assumed();
    const r = await pending(root, "--defer");
    expect(r.code).toBe(0);
    expect(r.json.deferred).toHaveLength(2);
    const rows = fs
      .readFileSync(path.join(root, "docs/deferrals.jsonl"), "utf-8")
      .trim()
      .split("\n")
      .map((l) => JSON.parse(l));
    expect(rows.map((x) => x.reason)).toEqual(["needs-decision", "needs-decision"]);
    expect(rows[0]).toMatchObject({ kind: "deferral", severity: "MEDIUM", status: "OPEN" });
    expect((await pending(root)).json.count).toBe(0);
  });

  it("--defer letters the options in the deferral row", async () => {
    const { root } = await assumed();
    await pending(root, "--defer");
    const row = JSON.parse(
      fs.readFileSync(path.join(root, "docs/deferrals.jsonl"), "utf-8").trim().split("\n")[0]!,
    );
    expect(row.description).toContain("Options: A) Accept / B) Fix now");
  });

  it("refuses a malformed --month", async () => {
    const { root } = checkout();
    expect((await run(["decisions", "pending", "--fid=7-x", "--month=2026-10"], root)).code).toBe(
      2,
    );
  });
});
