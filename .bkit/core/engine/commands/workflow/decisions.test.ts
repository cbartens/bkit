import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { runCommand } from "../lib";
import { COMMANDS } from "../registry";
import {
  applyRecommendations,
  decisionsCommand,
  EXIT_BAD_DECISION,
  EXIT_HARD_BLOCKERS,
} from "./decisions";
import { EXIT_ROW_REFUSED } from "./ledgers";
import { decisionHeader, decisionItems, parseDecisionItems, pauseStatus } from "./open-decision";

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
    options: [
      { name: "Accept", effect: "the item is recorded as accepted" },
      { name: "Fix now", effect: "a fix task is added to the plan" },
    ],
    recommended: "Accept",
    reason: "the caller already caps it",
  },
  {
    title: "Task 4 [src/b.ts:2]",
    question: "HIGH: the token is logged. Fix it now?",
    options: [
      { name: "Accept", effect: "the item is recorded as accepted" },
      { name: "Fix now", effect: "a fix task is added to the plan" },
    ],
    recommended: "Fix now",
    reason: "a secret reaches the log",
  },
];
const BLOCKER = {
  title: "Task 5 [src/c.ts:1]",
  question: "no test-first evidence. Accept it?",
  options: [
    { name: "Accept", effect: "the item is recorded as accepted" },
    { name: "Fix now", effect: "a fix task is added to the plan" },
    { name: "Stop", effect: "the run ends here with a handover; the next run resumes here" },
  ],
  noRecommendation: "only the owner can waive test-first",
};

/** An old-layout decision file (`Status` line, one file) holding `items`, written by hand. */
interface FixtureItem {
  title: string;
  question: string;
  options: Array<{ name: string; effect: string }>;
  recommended?: string;
  reason?: string;
  noRecommendation?: string;
}
async function compose(_root: string, logs: string, items: FixtureItem[], ...headers: string[]) {
  const out = path.join(logs, "build-decision-1-1.md");
  const lines = [
    "Status: OPEN",
    "Question: CHALLENGE",
    "From: challenge",
    ...headers.map((h) => h.replace(/^--header=/, "").replace("=", ": ")),
    "",
  ];
  items.forEach((it, i) => {
    const names = it.options.map((o) => o.name);
    const rec = it.recommended;
    lines.push(
      `**Q${i + 1} — ${it.title}:** ${it.question}`,
      ...it.options.map((o, k) => `${String.fromCharCode(65 + k)}) ${o.name} — ${o.effect}`),
      rec === undefined
        ? `Recommended: none — ${it.noRecommendation}`
        : `Recommended: ${String.fromCharCode(65 + names.indexOf(rec))}) ${rec} — ${it.reason}`,
      "Default if unanswered: the run waits for you",
      "",
    );
  });
  fs.writeFileSync(out, lines.join("\n"), "utf-8");
  seedStatus(logs);
  return { out };
}

/** `compose`'s items as this engine writes a pause: no `Status` line, and a bare `decision-counts` row. */
async function composeCounted(root: string, logs: string, items: FixtureItem[]) {
  const { out } = await compose(root, logs, items);
  fs.writeFileSync(out, fs.readFileSync(out, "utf-8").replace("Status: OPEN\n", ""));
  bareCountsRow(logs, out);
  return { out };
}

/** Writes the `status.jsonl` a decision file's rows are appended to, unless the folder has one. */
function seedStatus(logs: string) {
  const status = path.join(logs, "status.jsonl");
  if (!fs.existsSync(status))
    fs.writeFileSync(
      status,
      `${JSON.stringify({ type: "workflow-started", workflow: "build", at: "2026-10-01T00:00:00Z" })}\n`,
    );
  return status;
}

/** The `decision-counts` and `decision-answer` rows that name `file` in the `status.jsonl` beside it. */
function statusRows(file: string) {
  const status = path.join(path.dirname(file), "status.jsonl");
  if (!fs.existsSync(status)) return [];
  return fs
    .readFileSync(status, "utf-8")
    .split("\n")
    .filter(Boolean)
    .map((l) => JSON.parse(l) as Record<string, unknown>)
    .filter(
      (r) =>
        (r.type === "decision-counts" || r.type === "decision-answer") &&
        path.basename(String(r.file)) === path.basename(file),
    );
}

/** Appends a `decision-counts` row for `file` whose loop question is `loop`. */
function countsRow(logs: string, file: string, loop: Record<string, unknown>) {
  fs.appendFileSync(
    seedStatus(logs),
    `${JSON.stringify({
      type: "decision-counts",
      workflow: "build",
      at: "2026-10-01T00:05:00Z",
      file: path.relative(path.resolve(logs, "../../../../.."), file),
      sourceChanged: false,
      gate: "FAIL",
      loop,
    })}\n`,
  );
}

/** Appends the bare `decision-counts` row a pause with no count flags gets. */
function bareCountsRow(logs: string, file: string) {
  fs.appendFileSync(
    seedStatus(logs),
    `${JSON.stringify({
      type: "decision-counts",
      workflow: "build",
      at: "2026-10-01T00:05:00Z",
      file: path.relative(path.resolve(logs, "../../../../.."), file),
    })}\n`,
  );
}

const readFileOrNull = (f: string) => (fs.existsSync(f) ? fs.readFileSync(f, "utf-8") : null);

/** The text of a decision file and its engine file, read as the pause the engine reads. */
const pauseItems = (out: string) =>
  decisionItems((f) => (fs.existsSync(f) ? fs.readFileSync(f, "utf-8") : null), out);

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
    const out = orchestratorPause(logs, [], 2, false);
    fs.writeFileSync(
      path.join(root, "base.json"),
      JSON.stringify({
        verdict: "none",
        reason: null,
        base: "abc",
        source: "local",
        failing: 4,
        baseRed: 0,
        adopt: false,
      }),
    );
    const counted = await run(
      [
        "decisions",
        "counts",
        `--decision=${out}`,
        "--loop=verify",
        `--file=${status}`,
        "--group=1",
        "--attempt=2",
        "--max=2",
        `--base-check=${path.join(root, "base.json")}`,
      ],
      root,
    );
    expect(counted.code).toBe(0);
    expect(statusRows(out).find((x) => x.type === "decision-counts")).toMatchObject({
      gate: "FAIL",
    });
    const r = await rerun(root, out);
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({ status: "DECIDED" });
    const rows = statusRows(out);
    expect(JSON.stringify(rows)).not.toMatch(/Status:/);
    const answer = rows.find((x) => x.type === "decision-answer");
    expect(answer).toMatchObject({ q: 1, by: "rerun" });
    expect(String(answer?.answer)).toMatch(
      /^Try again — the owner resumed the run, so the gate runs again first \(\d{4}-\d{2}-\d{2}\)$/,
    );
    expect(rows.indexOf(answer!)).toBeGreaterThan(
      rows.findIndex((x) => x.type === "decision-counts"),
    );
  });

  it("records the re-run as a Q1 row and the pause reads DECIDED", async () => {
    const { root, logs } = checkout();
    const out = orchestratorPause(logs, [], 2, false);
    countsRow(logs, out, {
      title: "Verify",
      question: "another fix round?",
      options: ["Try again", "Stop"],
      recommended: "Try again",
      reason: "the last round made progress",
    });
    const before = fs.readFileSync(out, "utf-8");
    const r = await rerun(root, out);
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({ status: "DECIDED" });
    expect(fs.readFileSync(out, "utf-8")).toBe(before);
    expect(fs.existsSync(engineOf(out))).toBe(false);
    const answer = statusRows(out).find((x) => x.type === "decision-answer");
    expect(answer).toMatchObject({ q: 1, by: "rerun" });
    expect(String(answer?.answer)).toMatch(/^Try again — /);
    const q1 = pauseItems(out).find((i) => i.n === 1)!;
    expect(q1.options).toContain(String(q1.decision).split(" — ")[0]);
    expect(pauseStatus(readFileOrNull, out)).toBe("DECIDED");
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
    expect(statusRows(out).some((x) => x.by === "rerun")).toBe(false);
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
    const out = orchestratorPause(logs, ["Task 5 [src/c.ts:1]"], 2, false);
    fs.writeFileSync(
      path.join(root, "base.json"),
      JSON.stringify({
        verdict: "none",
        reason: null,
        base: "abc",
        source: "local",
        failing: 4,
        baseRed: 0,
        adopt: false,
      }),
    );
    await run(
      [
        "decisions",
        "counts",
        `--decision=${out}`,
        "--loop=verify",
        `--file=${status}`,
        "--group=1",
        "--attempt=2",
        "--max=2",
        `--base-check=${path.join(root, "base.json")}`,
      ],
      root,
    );
    const before = fs.readFileSync(out, "utf-8");
    const r = await rerun(root, out);
    expect(r.code).toBe(2);
    expect(r.err).toContain("Q2");
    expect(fs.readFileSync(out, "utf-8")).toBe(before);
    expect(statusRows(out).some((x) => x.type === "decision-counts")).toBe(true);
    expect(statusRows(out).some((x) => x.by === "rerun")).toBe(false);
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

describe("bkit decisions skip", () => {
  /** A settled verify pause: the loop question and two gap items, each answer as given. */
  const pause = (o: { headers?: string[]; loop?: string; answers?: [string, string] }) =>
    [
      ...(o.headers ?? ["Status: DECIDED", "From: verify", "Group: 1", "Source changed: false"]),
      "",
      "build verify: attempt 3 of 3",
      "",
      "## Progress",
      "",
      "Problems after each round: 3 → 2",
      "",
      "**Q1 — Verify loop:** decide the items below instead of another round? 3 → 2",
      "A) Try again — another fix round runs",
      "B) Decide — the questions below are asked instead of another round",
      "Recommended: B) Decide — another round is unlikely to close the remaining items",
      `Decision: ${o.loop ?? "B"}`,
      "",
      "**Q2 — Task 3 [src/a.ts:10]:** MEDIUM: the retry has no cap. Accept it?",
      "A) Accept — the item is recorded as accepted",
      "B) Fix now — a fix task is added to the plan",
      "Recommended: A) Accept — the caller already caps it",
      `Decision: ${(o.answers ?? [])[0] ?? "Accept — the caller caps it"}`,
      "",
      "**Q3 — Task 4 [src/b.ts:2]:** LOW: a name is unclear. Accept it?",
      "A) Accept — the item is recorded as accepted",
      "B) Fix now — a fix task is added to the plan",
      "Recommended: A) Accept — cosmetic",
      `Decision: ${(o.answers ?? [])[1] ?? "Accept (assumed) — cosmetic (no owner, LOCAL, 2026-11-17)"}`,
      "",
    ].join("\n");
  const skip = async (text: string) => {
    const { root, logs } = checkout();
    const file = path.join(logs, "build-decision-1-1.md");
    fs.writeFileSync(file, text);
    seedStatus(logs);
    return run(["decisions", "skip", `--file=${file}`], root);
  };

  it("decisions skip exits 0 when all five conditions hold", async () => {
    const r = await skip(pause({}));
    expect(r.code).toBe(0);
    expect(r.json).toEqual({ route: "continue", problem: null });
  });

  it("decisions skip exits 3, not 1, on a malformed status.jsonl beside the decision file, and lists 3", async () => {
    const { root, logs } = checkout();
    const file = path.join(logs, "build-decision-1-1.md");
    fs.writeFileSync(file, pause({}));
    fs.writeFileSync(path.join(logs, "status.jsonl"), "{not json\n");
    const r = await run(["decisions", "skip", `--file=${file}`], root);
    expect(r.code).toBe(3);
    expect(r.err).toContain("status.jsonl line 1");
    expect(Object.keys(decisionsCommand.verbs.skip!.exitCodes!)).toContain("3");
    expect(Object.keys(decisionsCommand.verbs.counts!.exitCodes!)).toContain("3");
  });

  it("decisions skip exits 1 and names the fact for a Gate: FAIL header", async () => {
    const r = await skip(
      pause({
        headers: ["Status: DECIDED", "From: verify", "Gate: FAIL", "Source changed: false"],
      }),
    );
    expect(r.code).toBe(1);
    expect(r.json.route).toBeNull();
    expect(r.json.problem).toContain("Gate: FAIL");
    expect(r.err).toContain("Gate: FAIL");
  });

  it("decisions skip exits 1 when the Source changed header is missing", async () => {
    const r = await skip(pause({ headers: ["Status: DECIDED", "From: holistic"] }));
    expect(r.code).toBe(1);
    expect(r.json.route).toBeNull();
    expect(r.json.problem).toContain("Source changed");
  });

  it("decisions skip exits 1 when an item is not Accept", async () => {
    const r = await skip(pause({ answers: ["Accept — fine", "Fix now — add a test"] }));
    expect(r.code).toBe(1);
    expect(r.json.route).toBeNull();
    expect(r.json.problem).toContain("Q3");
    expect(r.json.problem).toContain("Fix now");
  });

  it("decisions skip exits 1 when the loop question is not Decide", async () => {
    const r = await skip(pause({ loop: "A" }));
    expect(r.code).toBe(1);
    expect(r.json.route).toBeNull();
    expect(r.json.problem).toContain("Q1");
    expect(r.json.problem).toContain("Try again");
  });

  it("decisions skip exits 1 for a pause that is not from verify or holistic", async () => {
    const r = await skip(
      pause({ headers: ["Status: DECIDED", "From: challenge", "Source changed: false"] }),
    );
    expect(r.code).toBe(1);
    expect(r.json.problem).toContain("From");
  });

  it("keeps the re-run when the owner's Fix now beats an engine Accept (assumed)", async () => {
    const { root, logs } = checkout();
    const file = orchestratorPause(logs, ["Task 3 [src/a.ts:10]"], 1, false);
    const status = path.join(logs, "status.jsonl");
    fs.writeFileSync(
      status,
      `${JSON.stringify({ type: "workflow-started", workflow: "build", at: "2026-11-17T00:00:00Z" })}\n`,
    );
    const counted = await run(
      ["decisions", "counts", `--decision=${file}`, "--source-changed=false"],
      root,
    );
    expect(counted.code).toBe(0);
    const named = (
      JSON.parse(fs.readFileSync(status, "utf-8").trim().split("\n").at(-1)!) as { file: string }
    ).file;
    const answer = (text: string, extra: object) =>
      fs.appendFileSync(
        status,
        `${JSON.stringify({
          type: "decision-answer",
          workflow: "build",
          at: "2026-11-17T00:01:00Z",
          file: named,
          q: 1,
          answer: text,
          ...extra,
        })}\n`,
      );
    answer("Accept (assumed) — the caller caps it (no owner, LOCAL, 2026-11-17)", {
      by: "headless",
      assumed: true,
    });
    const settled = await run(["decisions", "skip", `--file=${file}`], root);
    expect(settled.code).toBe(0);
    expect(settled.json.route).toBe("continue");
    answer("Fix now — the owner wants it fixed", { by: "owner" });
    const r = await run(["decisions", "skip", `--file=${file}`], root);
    expect(r.code).toBe(1);
    expect(r.json.route).toBeNull();
    expect(r.json.problem).toContain("Fix now");
  });

  it("decisions skip exits 2 for a missing file", async () => {
    const { root, logs } = checkout();
    const r = await run(
      ["decisions", "skip", `--file=${path.join(logs, "build-decision-1-9.md")}`],
      root,
    );
    expect(r.code).toBe(2);
    expect(r.err).toContain("build-decision-1-9.md");
  });
});

describe("bkit decisions apply --by=headless", () => {
  it("takes each recommendation: an Accept is assumed, Fix now is written as such", async () => {
    const { root, logs } = checkout();
    const { out } = await composeCounted(root, logs, ITEMS);
    process.env.BKIT_RUNTIME = "GITHUB_ACTION";
    const r = await run(["decisions", "apply", "--by=headless", `--file=${out}`], root);
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({
      status: "ASSUMED",
      applied: [1, 2],
      fixNow: [2],
      hardBlockers: [],
    });
    const items = pauseItems(out);
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
    const { out } = await composeCounted(root, logs, [ITEMS[0], BLOCKER]);
    process.env.BKIT_RUNTIME = "LOCAL";
    const r = await run(["decisions", "apply", "--by=headless", `--file=${out}`], root);
    expect(r.code).toBe(EXIT_HARD_BLOCKERS);
    expect(r.json).toMatchObject({ status: "OPEN", applied: [1], hardBlockers: [2] });
    expect(r.err).toContain("hard blockers need the owner: Q2");
    expect(JSON.stringify(statusRows(out))).toContain("(ask:false, LOCAL, ");
  });

  it("a Recommended: none line with words after none passes the check and is a hard blocker headless", async () => {
    const { root, logs } = checkout();
    const { out } = await composeCounted(root, logs, [ITEMS[0], BLOCKER]);
    fs.writeFileSync(
      out,
      fs
        .readFileSync(out, "utf-8")
        .replace("Status: OPEN\n", "")
        .replace("Recommended: none — ", "Recommended: none (hard blocker) — "),
    );
    expect(fs.readFileSync(out, "utf-8")).toContain("Recommended: none (hard blocker) — ");
    const checked = await run(["decisions", "check", `--file=${out}`], root);
    expect(checked.code).toBe(0);
    process.env.BKIT_RUNTIME = "LOCAL";
    const r = await run(["decisions", "apply", "--by=headless", `--file=${out}`], root);
    expect(r.code).toBe(EXIT_HARD_BLOCKERS);
    expect(r.json).toMatchObject({ applied: [1], hardBlockers: [2] });
    expect(statusRows(out).some((x) => x.q === 2)).toBe(false);
  });

  it("apply --by=headless leaves a Recommended: none item for the owner", async () => {
    const { root, logs } = checkout();
    const out = path.join(logs, "build-decision-1-1.md");
    fs.writeFileSync(
      out,
      [
        "From: verify",
        "",
        "**Q1 — Task 5 [src/c.ts:1]:** no test-first evidence. Accept it?",
        "A) Accept — the item is recorded as accepted",
        "B) Stop — the run ends here with a handover; the next run resumes here",
        "Recommended: none — only the owner can waive test-first",
        "Default if unanswered: the run waits for you; the run stops when nobody can be asked",
        "",
      ].join("\n"),
    );
    bareCountsRow(logs, out);
    process.env.BKIT_RUNTIME = "LOCAL";
    const r = await run(["decisions", "apply", "--by=headless", `--file=${out}`], root);
    expect(r.code).toBe(EXIT_HARD_BLOCKERS);
    expect(r.json).toMatchObject({ status: "OPEN", applied: [], hardBlockers: [1] });
    expect(fs.readFileSync(out, "utf-8")).not.toContain("Decision:");
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
    const { out } = await composeCounted(wt, logs, [ITEMS[0]]);
    delete process.env.BKIT_RUNTIME;
    const r = await run(["decisions", "apply", "--by=headless", `--file=${out}`], wt);
    expect(r.code).toBe(0);
    expect(JSON.stringify(statusRows(out))).toContain("(ask:false, CLOUD_CURSOR, ");
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

  const PER_LINE = [
    "Status: OPEN",
    "",
    "**Q1 — Task 3 [src/a.ts:10]:** accept it?",
    "A) Accept — the item is recorded as accepted",
    "B) Fix now — a fix task is added to the plan",
    "Recommended: B) Fix now — a secret reaches the log",
    "Default if unanswered: the run waits for you; taken as B when nobody can be asked",
  ];

  it("parseDecisionItems reads one option per line and drops each effect", () => {
    const item = parseDecisionItems([...PER_LINE, ""].join("\n"))[0]!;
    expect(item.options).toEqual(["Accept", "Fix now"]);
    expect(item.recommended).toBe("Fix now");
    expect(item.reason).toBe("a secret reaches the log");
  });

  it("parseDecisionItems reads Recommended: none as a hard blocker", () => {
    const text = [
      "Status: OPEN",
      "",
      "**Q1 — Task 5 [src/c.ts:1]:** accept it?",
      "A) Accept — the item is recorded as accepted",
      "B) Stop — the run ends here with a handover; the next run resumes here",
      "Recommended: none — only the owner can waive test-first",
      "Default if unanswered: the run waits for you; the run stops when nobody can be asked",
      "",
    ].join("\n");
    const item = parseDecisionItems(text)[0]!;
    expect(item.recommended).toBeNull();
    expect(item.reason).toBe("only the owner can waive test-first");
    expect(item.options).toEqual(["Accept", "Stop"]);
  });

  it("a lettered decision in a per-line file reads as the option its letter labels", () => {
    const decided = (decision: string) =>
      parseDecisionItems([...PER_LINE, `Decision: ${decision}`, ""].join("\n"))[0]!.decision;
    expect(decided("B")).toBe("Fix now");
    expect(decided("B) Fix now — a secret reaches the log")).toBe(
      "Fix now — a secret reaches the log",
    );
    expect(decided("A) Accept (assumed) — minor (ask:false, LOCAL, 2026-10-28)")).toBe(
      "Accept (assumed) — minor (ask:false, LOCAL, 2026-10-28)",
    );
  });

  it("a per-line option whose text holds a slash or a middle dot stays one option", () => {
    const text = [
      "Status: OPEN",
      "",
      "**Q1 — Layout:** how do we store it?",
      "A) keep the read/write split — reads and writes stay in two files · tests stay as they are",
      "B) merge them — one file holds both / the tests move",
      "Recommended: A) keep the read/write split — less churn",
      "Default if unanswered: the run waits for you; taken as A when nobody can be asked",
      "",
    ].join("\n");
    const item = parseDecisionItems(text)[0]!;
    expect(item.options).toEqual(["keep the read/write split", "merge them"]);
    expect(item.recommended).toBe("keep the read/write split");
  });

  it("a file mixing both layouts parses each item in its own layout", () => {
    const text = [
      "Status: OPEN",
      "",
      "**Q1 — Old:** accept it?",
      "Options: A) Accept / B) Fix now",
      "Recommended: A) Accept — minor",
      "",
      "**Q2 — New:** accept it?",
      "A) Accept — the item is recorded as accepted",
      "B) Fix now — a fix task is added to the plan",
      "Recommended: none — only the owner can say",
      "Default if unanswered: the run waits for you; the run stops when nobody can be asked",
      "",
    ].join("\n");
    const items = parseDecisionItems(text);
    expect(items[0]!.options).toEqual(["Accept", "Fix now"]);
    expect(items[0]!.recommended).toBe("Accept");
    expect(items[1]!.options).toEqual(["Accept", "Fix now"]);
    expect(items[1]!.recommended).toBeNull();
  });

  it("reads the task a Fix now item names on its Fix task line", () => {
    const item = (decision: string, fixLines: string[]) =>
      [
        "Status: DECIDED",
        "",
        "**Q1 — Gap:** accept it?",
        "Options: A) Accept / B) Fix now",
        "Recommended: B) Fix now — real",
        `Decision: ${decision}`,
        ...fixLines,
        "",
      ].join("\n");
    expect(parseDecisionItems(item("Fix now", ["Fix task: 42"]))[0]!.fixTask).toBe(42);
    expect(parseDecisionItems(item("Fix now", []))[0]!.fixTask).toBeNull();
    expect(parseDecisionItems(item("Fix now", ["Fix task: soon"]))[0]!.fixTask).toBeNull();
    expect(parseDecisionItems(item("Fix now", ["Fix task: 0"]))[0]!.fixTask).toBeNull();
  });

  it("decisionHeader reads the header block only", () => {
    const text = [
      "Status: DECIDED",
      "Question: VERIFY_GAPS",
      "From: verify",
      "Group: 9",
      "",
      "**Q1 — Gap:** accept it?",
      "Group: 3",
      "From: holistic",
      "Decision: Accept",
      "",
    ].join("\n");
    const header = decisionHeader(text);
    expect(header.From).toBe("verify");
    expect(header.Group).toBe("9");
    expect(header.Status).toBe("DECIDED");
    expect(decisionHeader("**Q1 — Gap:** x\nGroup: 3\n").Group).toBeUndefined();
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
    const r = applyRecommendations(parseDecisionItems(text), true, "LOCAL", "ask:false");
    expect(r).toMatchObject({ applied: [1], hardBlockers: [], loop: "Try again" });
    expect(r.rows.map((x) => x.q)).toEqual([1]);
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
    const r = applyRecommendations(parseDecisionItems(text), false, "LOCAL", "ask:false");
    expect(r).toMatchObject({ applied: [1], hardBlockers: [], loop: null });
    expect(r.rows).toHaveLength(1);
    expect(r.rows[0]).toMatchObject({
      type: "decision-answer",
      q: 1,
      by: "headless",
      assumed: true,
      runtime: "LOCAL",
    });
    expect(r.rows[0]!.answer).toMatch(/^Accept \(assumed\) — minor \(ask:false, LOCAL, /);
  });

  it("with no loop, an item offering Try again is an ordinary item and the others are still applied", () => {
    const text = [
      "From: verify",
      "",
      "**Q2 — Gap 1:** retry the flaky step?",
      "A) Try again — the step runs once more",
      "B) Accept — the item is recorded as accepted",
      "Recommended: A) Try again — it was a timeout",
      "",
      "**Q3 — Gap 2:** accept it?",
      "A) Accept — the item is recorded as accepted",
      "B) Fix now — a fix task is added",
      "Recommended: B) Fix now — it is a bug",
      "",
    ].join("\n");
    const r = applyRecommendations(parseDecisionItems(text), false, "LOCAL", "ask:false");
    expect(r).toMatchObject({ applied: [2, 3], hardBlockers: [], loop: null });
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
    const r = applyRecommendations(parseDecisionItems(text), true, "LOCAL", "ask:false");
    expect(r).toMatchObject({ applied: [], hardBlockers: [], loop: "Try again" });
    expect(r.rows).toEqual([]);
  });
});

describe("bkit decisions apply --by=owner and pending", () => {
  async function assumed() {
    const { root, logs } = checkout();
    const { out } = await composeCounted(root, logs, [
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
    const fine = path.join(path.dirname(out), "fine.md");
    fs.writeFileSync(fine, "fine as is\n");
    const later = path.join(path.dirname(out), "later.md");
    fs.writeFileSync(later, "fix it later\n");
    const confirm = await owner("1", "--confirm", `--reason-file=${fine}`);
    expect(confirm.code).toBe(0);
    expect(confirm.json.decisionKey).toBe("7-x-accepted-task-3-src-a-ts-10");
    const ledger = fs.readFileSync(path.join(root, "docs/decisions.jsonl"), "utf-8");
    expect(JSON.parse(ledger.trim())).toMatchObject({
      kind: "decision",
      rationale: "accepted by owner: fine as is",
      by: { workflow: "ship" },
    });
    expect((await owner("2", "--reject", `--reason-file=${later}`)).code).toBe(0);
    const items = pauseItems(out);
    expect(items[0]!.decision).toMatch(/^Accept — confirmed by the owner at ship /);
    expect(items[1]!.rejected).toBe(true);
    expect((await pending(root)).json.items).toEqual([
      expect.objectContaining({ q: 2, state: "rejected" }),
    ]);
  });

  it("apply --by=owner --confirm confirms an assumed item in a per-line file", async () => {
    const { root, logs } = checkout();
    const out = path.join(logs, "build-decision-1-1.md");
    fs.writeFileSync(
      out,
      [
        "Status: ASSUMED",
        "",
        "**Q1 — Task 3 [src/a.ts:10]:** MEDIUM: the retry has no cap. Accept it?",
        "A) Accept — the item is recorded as accepted",
        "B) Fix now — a fix task is added to the plan",
        "Recommended: A) Accept — the caller already caps it",
        "Default if unanswered: the run waits for you; taken as A when nobody can be asked",
        "Decision: A) Accept (assumed) — the caller already caps it (headless, GITHUB_ACTION, 2026-10-28)",
        "",
      ].join("\n"),
    );
    seedStatus(logs);
    const fineFile = path.join(logs, "fine.md");
    fs.writeFileSync(fineFile, "fine\n");
    const r = await run(
      [
        "decisions",
        "apply",
        "--by=owner",
        `--file=${out}`,
        "--q=1",
        "--confirm",
        `--reason-file=${fineFile}`,
      ],
      root,
    );
    expect(r.code).toBe(0);
    expect(r.json.decisionKey).toBe("7-x-accepted-task-3-src-a-ts-10");
    const items = pauseItems(out);
    expect(items[0]!.decision).toMatch(/^Accept — confirmed by the owner at ship /);
    expect(items[0]!.assumed).toBe(false);
    expect(items[0]!.options).toEqual(["Accept", "Fix now"]);
    expect(items[0]!.recommended).toBe("Accept");
  });

  /** An old per-line file with two assumed Accepts, and the confirm of Q1. */
  async function oldTwoAssumed() {
    const { root, logs } = checkout();
    const out = path.join(logs, "build-decision-1-1.md");
    const item = (n: number, title: string) => [
      `**Q${n} — ${title}:** MEDIUM: the retry has no cap. Accept it?`,
      "A) Accept — the item is recorded as accepted",
      "B) Fix now — a fix task is added to the plan",
      "Recommended: A) Accept — the caller already caps it",
      "Default if unanswered: the run waits for you; taken as A when nobody can be asked",
      "Decision: A) Accept (assumed) — the caller already caps it (headless, GITHUB_ACTION, 2026-10-28)",
      "",
    ];
    fs.writeFileSync(
      out,
      [
        "Status: ASSUMED",
        "",
        ...item(1, "Task 3 [src/a.ts:10]"),
        ...item(2, "Task 6 [src/d.ts:4]"),
      ].join("\n"),
    );
    seedStatus(logs);
    const fineFile = path.join(logs, "fine.md");
    fs.writeFileSync(fineFile, "fine\n");
    const owner = (q: string) =>
      run(
        [
          "decisions",
          "apply",
          "--by=owner",
          `--file=${out}`,
          `--q=${q}`,
          "--confirm",
          `--reason-file=${fineFile}`,
        ],
        root,
      );
    return { root, out, owner };
  }

  it("confirming Q1 of an old per-line file with two assumed Accepts leaves Q2 confirmable", async () => {
    const { owner } = await oldTwoAssumed();
    expect((await owner("1")).code).toBe(0);
    const second = await owner("2");
    expect(second.code).toBe(0);
    expect(second.json.decisionKey).toBe("7-x-accepted-task-6-src-d-ts-4");
  });

  it("pending lists the second assumed Accept of an old per-line file after the first is confirmed", async () => {
    const { root, owner } = await oldTwoAssumed();
    expect((await owner("1")).code).toBe(0);
    const r = await pending(root);
    expect(r.code).toBe(0);
    expect(r.json.count).toBe(1);
    expect(r.json.items[0]).toMatchObject({ q: 2, state: "pending" });
  });

  it("refuses an item that is not an assumed Accept, or a call without one of --confirm / --reject", async () => {
    const { root, out } = await assumed();
    const why = path.join(path.dirname(out), "why.md");
    fs.writeFileSync(why, "x\n");
    const base = ["decisions", "apply", "--by=owner", `--file=${out}`, `--reason-file=${why}`];
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

  it("pending --defer keeps the answer and marks it needs-decision", async () => {
    const { root, out } = await assumed();
    const before = statusRows(out).filter((x) => x.type === "decision-answer");
    const mdBefore = fs.readFileSync(out, "utf-8");
    const r = await pending(root, "--defer");
    expect(r.code).toBe(0);
    const after = statusRows(out).filter((x) => x.type === "decision-answer");
    const deferredRows = after.slice(before.length);
    expect(deferredRows).toHaveLength(2);
    for (const [i, row] of deferredRows.entries()) {
      expect(row).toMatchObject({ q: i + 1, deferred: "needs-decision", assumed: true });
      expect(String(row.answer)).toMatch(/^Accept \(assumed\)/);
    }
    expect(fs.readFileSync(out, "utf-8")).toBe(mdBefore);
    expect(fs.existsSync(engineOf(out))).toBe(false);
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

  it("pending refuses a --fid that climbs out of the log folder and reads and writes nothing", async () => {
    const { root } = checkout();
    const other = path.join(root, "docs/plans/202610/logs/other-run");
    fs.mkdirSync(other, { recursive: true });
    fs.writeFileSync(
      path.join(other, "build-decision-1-1.md"),
      [
        "Status: ASSUMED",
        "",
        "**Q1 — Task 3 [src/a.ts:10]:** MEDIUM: the retry has no cap. Accept it?",
        "A) Accept — the item is recorded as accepted",
        "B) Fix now — a fix task is added to the plan",
        "Recommended: A) Accept — the caller already caps it",
        "Default if unanswered: the run waits for you; taken as A when nobody can be asked",
        "Decision: A) Accept (assumed) — the caller already caps it (headless, GITHUB_ACTION, 2026-10-28)",
        "",
      ].join("\n"),
    );
    const r = await run(
      ["decisions", "pending", "--fid=../other-run", "--month=202610", "--defer"],
      root,
    );
    expect(r.code).toBe(2);
    expect(r.err).toContain("--fid");
    expect(r.json?.items).toBeUndefined();
    expect(fs.existsSync(path.join(root, "docs/deferrals.jsonl"))).toBe(false);
  });

  it("refuses a malformed --month", async () => {
    const { root } = checkout();
    expect((await run(["decisions", "pending", "--fid=7-x", "--month=2026-10"], root)).code).toBe(
      2,
    );
  });
});

/** An orchestrator decision file, written by hand: its header, then one lettered question per title from `first`. */
/** The orchestrator's pause file holding one item per title, plus the bare `decision-counts` row unless `counted` is false. */
function orchestratorPause(logs: string, titles: string[], first = 1, counted = true) {
  const file = path.join(logs, "build-decision-1-1.md");
  const lines = ["Question: CHALLENGE", "From: verify", "Group: 1", ""];
  titles.forEach((title, i) =>
    lines.push(
      `**Q${first + i} — ${title}:** MEDIUM: the retry has no cap. Accept it?`,
      "A) Accept — the item is recorded as accepted",
      "B) Fix now — a fix task is added to the plan",
      "Recommended: A) Accept — the caller already caps it",
      "Default if unanswered: the run waits for you; taken as A when nobody can be asked",
      "",
    ),
  );
  lines.push('Reply with a letter per question, or "yes" to take every recommendation.', "");
  fs.writeFileSync(file, lines.join("\n"), "utf-8");
  if (counted) bareCountsRow(logs, file);
  return file;
}
const engineOf = (file: string) => file.replace(/\.md$/, "-engine.md");

describe("bkit decisions check", () => {
  it("refuses a question without lettered options, naming it", async () => {
    const { root, logs } = checkout();
    const file = path.join(logs, "build-decision-1-1.md");
    fs.writeFileSync(
      file,
      [
        "Question: CHALLENGE",
        "From: verify",
        "",
        "**Q1 — Task 3 [src/a.ts:10]:** MEDIUM: the retry has no cap. Accept it?",
        "Recommended: Accept — the caller already caps it",
        "Default if unanswered: the run waits for you",
        "",
      ].join("\n"),
    );
    bareCountsRow(logs, file);
    const r = await run(["decisions", "check", `--file=${file}`], root);
    expect(r.code).toBe(6);
    expect(`${JSON.stringify(r.json)}${r.err}`).toContain("Q1");
  });

  it("refuses Q1 when the engine file holds the loop question", async () => {
    const { root, logs } = checkout();
    const file = orchestratorPause(logs, ["Task 3 [src/a.ts:10]"], 1, false);
    countsRow(logs, file, {
      title: "Verify",
      question: "decide the items below instead of another round?",
      options: ["Try again", "Decide"],
      recommended: "Decide",
      reason: "another round is unlikely to help",
    });
    const rows = statusRows(file);
    expect(rows.find((x) => x.type === "decision-counts")).toMatchObject({
      loop: { title: "Verify", options: ["Try again", "Decide"], recommended: "Decide" },
    });
    expect(fs.existsSync(engineOf(file))).toBe(false);
    const r = await run(["decisions", "check", `--file=${file}`], root);
    expect(r.code).toBe(6);
    expect(`${JSON.stringify(r.json)}${r.err}`).toContain("Q1");
  });

  it("refuses a question line written with an en dash, naming the line", async () => {
    const { root, logs } = checkout();
    const file = orchestratorPause(logs, ["Task 3 [src/a.ts:10]"], 1);
    fs.writeFileSync(file, fs.readFileSync(file, "utf-8").replace("**Q1 \u2014 ", "**Q1 \u2013 "));
    const r = await run(["decisions", "check", `--file=${file}`], root);
    expect(r.code).toBe(6);
    expect(`${JSON.stringify(r.json)}${r.err}`).toContain("Q1 \u2013");
  });

  it("refuses a question whose bold closes before the colon, naming the line", async () => {
    const { root, logs } = checkout();
    const file = orchestratorPause(logs, ["Task 3 [src/a.ts:10]"], 1);
    fs.writeFileSync(
      file,
      fs.readFileSync(file, "utf-8").replace("[src/a.ts:10]:**", "[src/a.ts:10]**:"),
    );
    expect(fs.readFileSync(file, "utf-8")).toContain("**Q1 \u2014 Task 3 [src/a.ts:10]**: MEDIUM");
    const r = await run(["decisions", "check", `--file=${file}`], root);
    expect(r.code).toBe(6);
    expect(`${JSON.stringify(r.json)}${r.err}`).toContain("Q1 \u2014 Task 3 [src/a.ts:10]**:");
  });

  it("refuses a question line behind a list marker on a loop pause, naming the line", async () => {
    const { root, logs } = checkout();
    const file = orchestratorPause(logs, ["Gap 1"], 2, false);
    fs.writeFileSync(
      file,
      fs.readFileSync(file, "utf-8").replace("**Q2 \u2014 ", "- **Q2 \u2014 "),
    );
    countsRow(logs, file, {
      title: "Verify",
      question: "another fix round, or stop here?",
      options: ["Try again", "Stop"],
      recommended: "Stop",
      reason: "no question is left to decide",
    });
    const r = await run(["decisions", "check", `--file=${file}`], root);
    expect(r.code).toBe(6);
    expect(`${JSON.stringify(r.json)}${r.err}`).toContain("- **Q2 \u2014 Gap 1:**");
  });

  it("refuses a question written as **Question 2 on a loop pause, naming the line", async () => {
    const { root, logs } = checkout();
    const file = orchestratorPause(logs, ["Gap 1"], 2, false);
    fs.writeFileSync(
      file,
      fs.readFileSync(file, "utf-8").replace("**Q2 \u2014 ", "**Question 2 \u2014 "),
    );
    countsRow(logs, file, {
      title: "Verify",
      question: "another fix round, or stop here?",
      options: ["Try again", "Stop"],
      recommended: "Stop",
      reason: "no question is left to decide",
    });
    const r = await run(["decisions", "check", `--file=${file}`], root);
    expect(r.code).toBe(6);
    expect(`${JSON.stringify(r.json)}${r.err}`).toContain("**Question 2 \u2014 Gap 1:**");
  });

  it("accepts a correctly written question numbered Q10", async () => {
    const { root, logs } = checkout();
    const items = Array.from({ length: 10 }, (_, i) => `Task ${i + 3} [src/a.ts:${i + 1}]`);
    const file = orchestratorPause(logs, items, 1);
    expect(fs.readFileSync(file, "utf-8")).toContain("**Q10 — ");
    const r = await run(["decisions", "check", `--file=${file}`], root);
    expect(r.code).toBe(0);
  });

  it("refuses a file with no question when the engine file holds no loop question", async () => {
    const { root, logs } = checkout();
    const file = path.join(logs, "build-decision-1-1.md");
    fs.writeFileSync(file, ["Question: CHALLENGE", "From: verify", "Group: 1", ""].join("\n"));
    bareCountsRow(logs, file);
    const r = await run(["decisions", "check", `--file=${file}`], root);
    expect(r.code).toBe(6);
    expect(`${JSON.stringify(r.json)}${r.err}`).toContain("the file holds no question");
  });

  it("refuses a Status, Source changed or Gate line in the orchestrator's header", async () => {
    for (const line of ["Status: OPEN", "Source changed: false", "Gate: FAIL"]) {
      const { root, logs } = checkout();
      const file = orchestratorPause(logs, ["Task 3 [src/a.ts:10]"], 1);
      fs.writeFileSync(
        file,
        fs.readFileSync(file, "utf-8").replace("From: verify\n", `From: verify\n${line}\n`),
      );
      const r = await run(["decisions", "check", `--file=${file}`], root);
      expect(r.code, line).toBe(6);
      expect(`${JSON.stringify(r.json)}${r.err}`, line).toContain(line.split(":")[0]);
    }
  });

  it("refuses a decision file whose question count no longer matches the engine file's loop options", async () => {
    const { root, logs } = checkout();
    const file = orchestratorPause(logs, ["Task 3 [src/a.ts:10]"], 2, false);
    countsRow(logs, file, {
      title: "Verify",
      question: "another fix round, or stop here?",
      options: ["Try again", "Stop"],
      recommended: "Stop",
      reason: "no question is left to decide",
    });
    expect(statusRows(file).find((x) => x.type === "decision-counts")).toMatchObject({
      loop: { options: ["Try again", "Stop"], recommended: "Stop" },
    });
    expect(fs.existsSync(engineOf(file))).toBe(false);
    const r = await run(["decisions", "check", `--file=${file}`], root);
    expect(r.code).toBe(6);
    expect(`${JSON.stringify(r.json)}${r.err}`).toContain("decisions counts");
  });

  it("accepts questions numbered from Q1 when the pause has no engine file", async () => {
    const { root, logs } = checkout();
    const file = orchestratorPause(logs, ["Task 3 [src/a.ts:10]", "Task 4 [src/b.ts:2]"], 1);
    expect(fs.existsSync(engineOf(file))).toBe(false);
    fs.appendFileSync(
      seedStatus(logs),
      `${JSON.stringify({
        type: "decision-counts",
        workflow: "build",
        at: "2026-10-01T00:05:00Z",
        file: path.relative(path.resolve(logs, "../../../../.."), file),
        sourceChanged: true,
        gate: "PASS",
      })}\n`,
    );
    expect(statusRows(file).find((x) => x.type === "decision-counts")?.loop).toBeUndefined();
    const r = await run(["decisions", "check", `--file=${file}`], root);
    expect(r.code).toBe(0);
  });

  it("refuses a Decision, Fix task, Rejected or Deferred line in the orchestrator's file", async () => {
    for (const line of [
      "Decision: Accept \u2014 looks fine",
      "Fix task: 31",
      "Rejected: the owner wants it fixed",
      "Deferred: needs-decision",
    ]) {
      const { root, logs } = checkout();
      const file = orchestratorPause(logs, ["Task 3 [src/a.ts:10]"], 1);
      fs.writeFileSync(
        file,
        fs
          .readFileSync(file, "utf-8")
          .replace("Default if unanswered:", `${line}\nDefault if unanswered:`),
      );
      const r = await run(["decisions", "check", `--file=${file}`], root);
      expect(r.code, line).toBe(6);
      const said = `${JSON.stringify(r.json)}${r.err}`;
      expect(said, line).toContain("Q1");
      expect(said, line).toContain(line.split(":")[0]);
    }
  });
});

describe("bkit decisions counts", () => {
  const verifyRow = (at: string, failures: number) => ({
    type: "step-done",
    workflow: "build",
    step: "build-plan-verify",
    status: "DONE",
    at,
    group: 1,
    failures,
  });
  /** A status log whose verify rounds ended at `counts` failures each. */
  function statusOf(logs: string, counts: number[]) {
    const status = path.join(logs, "status.jsonl");
    fs.writeFileSync(
      status,
      [
        { type: "workflow-started", workflow: "build", at: "2026-10-01T00:00:00Z" },
        ...counts.map((c, i) => verifyRow(`2026-10-01T00:${10 + 10 * i}:00Z`, c)),
      ]
        .map((x) => JSON.stringify(x))
        .join("\n") + "\n",
    );
    return status;
  }
  const baseFile = (root: string, over: Record<string, unknown>) => {
    const f = path.join(root, "base-check.json");
    fs.writeFileSync(
      f,
      JSON.stringify({
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
      }),
    );
    return f;
  };
  const counts = (root: string, out: string, status: string, ...extra: string[]) =>
    run(
      [
        "decisions",
        "counts",
        `--decision=${out}`,
        "--loop=verify",
        `--file=${status}`,
        "--group=1",
        "--attempt=2",
        "--max=2",
        ...extra,
      ],
      root,
    );

  /** `decisions counts` for the pause `decision`, its loop counted from the status log in `status`. */
  const countsAt = (root: string, decision: string, status: string, ...extra: string[]) =>
    run(
      [
        "decisions",
        "counts",
        `--decision=${decision}`,
        "--loop=verify",
        `--file=${status}`,
        "--group=1",
        "--attempt=2",
        "--max=2",
        ...extra,
      ],
      root,
    );
  /** The `decision-counts` rows in a log folder's status.jsonl. */
  const countsRows = (logs: string) =>
    fs
      .readFileSync(path.join(logs, "status.jsonl"), "utf-8")
      .split("\n")
      .filter(Boolean)
      .map((l) => JSON.parse(l) as Record<string, unknown>)
      .filter((r) => r.type === "decision-counts");
  /** The lines `decisions counts` prints for the owner, as one string. */
  const shownOf = (json: { show?: unknown }) => JSON.stringify(json.show);

  it("writes the attempt line, progress, base check and loop question into the engine file only", async () => {
    const { root, logs } = checkout();
    const out = orchestratorPause(logs, ["Task 3 [src/a.ts:10]", "Task 4 [src/b.ts:2]"], 2);
    const before = fs.readFileSync(out, "utf-8");
    const base = baseFile(root, { verdict: "none", baseRed: 0, branch: 3 });
    const r = await countsAt(
      root,
      out,
      statusOf(logs, [4, 4]),
      "--source-changed=false",
      `--base-check=${base}`,
    );
    expect(r.code).toBe(0);
    expect(fs.readFileSync(out, "utf-8")).toBe(before);
    expect(fs.existsSync(engineOf(out))).toBe(false);
    expect(fs.readdirSync(logs).filter((f) => f.endsWith(".md"))).toEqual([
      "build-decision-1-1.md",
    ]);
    const rows = countsRows(logs);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      type: "decision-counts",
      workflow: "build",
      sourceChanged: false,
      gate: "FAIL",
      loop: { recommended: "Decide" },
    });
    expect(String(rows[0]!.file)).toMatch(/build-decision-1-1\.md$/);
    expect(JSON.stringify(rows[0])).toContain("abc1234");
    const shown = shownOf(r.json);
    expect(shown).toContain("build verify: attempt 2 of 2");
    expect(shown).toContain("Problems after each round: 4 → 4");
    expect(shown).toContain("Also red on base abc1234: 0 of 3");
    expect(shown).toMatch(/\*\*Q1 — Verify:\*\* decide the items below/);
    expect(shown).toContain("A) Try again — one more fix round runs");
    expect(shown).toContain("B) Decide — ");
    expect(shown).not.toContain("**Q2");
  });

  it("carries the attempt, max and progress numbers in the row's loop", async () => {
    const { root, logs } = checkout();
    const out = orchestratorPause(logs, ["Task 3 [src/a.ts:10]"], 2);
    await countsAt(root, out, statusOf(logs, [4, 4]), "--source-changed=false");
    expect(countsRows(logs)[0]!.loop).toMatchObject({
      attempt: "2",
      max: "2",
      progress: {
        problems: "4 → 4",
        codeChanged: null,
        nextStrategy: expect.any(String),
      },
    });
  });

  it("recommends Decide when the last round changed no source", async () => {
    const { root, logs } = checkout();
    const out = orchestratorPause(logs, ["Task 3 [src/a.ts:10]"], 2);
    const r = await countsAt(root, out, statusOf(logs, [4, 4]), "--source-changed=false");
    expect(r.code).toBe(0);
    const rows = countsRows(logs);
    expect(rows[0]).toMatchObject({ sourceChanged: false, loop: { recommended: "Decide" } });
    expect(shownOf(r.json)).toMatch(/Recommended: B\) Decide — another round is unlikely/);
    expect(fs.existsSync(engineOf(out))).toBe(false);
  });

  it("recommends Try again when the last round made progress", async () => {
    const { root, logs } = checkout();
    const out = orchestratorPause(logs, ["Task 3 [src/a.ts:10]"], 2);
    const r = await countsAt(root, out, statusOf(logs, [5, 2]), "--source-changed=true");
    expect(r.code).toBe(0);
    const rows = countsRows(logs);
    expect(rows[0]).toMatchObject({ sourceChanged: true, loop: { recommended: "Try again" } });
    expect(shownOf(r.json)).toContain("(5 → 2)");
    expect(shownOf(r.json)).toMatch(/Recommended: A\) Try again — the last round made progress/);
    expect(fs.existsSync(engineOf(out))).toBe(false);
  });

  it("engine file recommends Stop when the base check is all and no questions are counted", async () => {
    const { root, logs } = checkout();
    const out = orchestratorPause(logs, [], 2);
    const r = await countsAt(
      root,
      out,
      statusOf(logs, [4, 4]),
      `--base-check=${baseFile(root, {})}`,
    );
    expect(r.code).toBe(0);
    expect(countsRows(logs)[0]).toMatchObject({ loop: { recommended: "Stop" } });
    expect(shownOf(r.json)).toMatch(/Recommended: B\) Stop — .*fail on `dev` too/);
    expect(shownOf(r.json)).toContain("Fix `dev`, then resume.");
    expect(fs.existsSync(engineOf(out))).toBe(false);
  });

  it("engine file recommends Decide when the base check is all and questions are counted", async () => {
    const { root, logs } = checkout();
    const out = orchestratorPause(logs, ["Task 3 [src/a.ts:10]", "Task 4 [src/b.ts:2]"], 2);
    const r = await countsAt(
      root,
      out,
      statusOf(logs, [4, 4]),
      `--base-check=${baseFile(root, {})}`,
    );
    expect(r.code).toBe(0);
    expect(countsRows(logs)[0]).toMatchObject({ loop: { recommended: "Decide" } });
    expect(shownOf(r.json)).toMatch(/Recommended: B\) Decide — .*fail on `dev` too/);
    expect(fs.existsSync(engineOf(out))).toBe(false);
  });

  it("writes Source changed and Gate into the engine file for a verify pause with no loop", async () => {
    const { root, logs } = checkout();
    const out = orchestratorPause(logs, ["Task 3 [src/a.ts:10]"], 1, false);
    const before = fs.readFileSync(out, "utf-8");
    fs.writeFileSync(
      path.join(logs, "status.jsonl"),
      `${JSON.stringify({ type: "workflow-started", workflow: "build", at: "2026-10-01T00:00:00Z" })}\n`,
    );
    const r = await run(
      [
        "decisions",
        "counts",
        `--decision=${out}`,
        "--source-changed=true",
        `--base-check=${baseFile(root, {})}`,
      ],
      root,
    );
    expect(r.code).toBe(0);
    expect(fs.readFileSync(out, "utf-8")).toBe(before);
    const rows = countsRows(logs);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ sourceChanged: true, gate: "FAIL" });
    expect(rows[0]!.loop).toBeUndefined();
    expect(shownOf(r.json)).not.toContain("**Q1");
    expect(fs.existsSync(engineOf(out))).toBe(false);
  });

  it("prints the attempt, progress, base and loop question lines in show", async () => {
    const { root, logs } = checkout();
    const out = orchestratorPause(logs, ["Task 3 [src/a.ts:10]", "Task 4 [src/b.ts:2]"], 2);
    const r = await countsAt(
      root,
      out,
      statusOf(logs, [4, 4]),
      "--source-changed=false",
      `--base-check=${baseFile(root, {})}`,
    );
    expect(r.code).toBe(0);
    expect(r.json.questions).toBe(2);
    expect(String(r.json.file)).toMatch(/build-decision-1-1\.md$/);
    expect(r.json.show).toBeDefined();
    const shown = shownOf(r.json);
    expect(shown).toContain("build verify: attempt 2 of 2");
    expect(shown).toContain("Problems after each round: 4 → 4");
    expect(shown).toContain("Also red on base abc1234");
    expect(shown).toMatch(/\*\*Q1 — Verify:\*\*/);
    expect(shown).toContain("A) Try again");
    expect(shown).toContain("Recommended:");
    expect(shown).toContain("Default if unanswered:");
  });

  const statusRows = (logs: string, rows: object[]) => {
    const status = path.join(logs, "status.jsonl");
    fs.writeFileSync(
      status,
      [{ type: "workflow-started", workflow: "build", at: "2026-10-01T00:00:00Z" }, ...rows]
        .map((x) => JSON.stringify(x))
        .join("\n") + "\n",
    );
    return status;
  };
  const gateRow = (at: string, step: string, attempt: number, failures: number | null) => ({
    type: "test-run",
    workflow: "build",
    at,
    step,
    attempt,
    run: 1,
    verdict: "FAIL",
    exitCode: 1,
    failures,
    scope: "gate",
    log: "x.log",
  });
  const groupVerify = (at: string, attempt: number, failures: number) => ({
    type: "step-done",
    workflow: "build",
    step: "build-plan-verify",
    status: "DONE",
    at,
    group: 1,
    attempt,
    failures,
  });
  const ITEM_TITLES = ["Task 3 [src/a.ts:10]", "Task 4 [src/b.ts:2]"];
  /** Runs `counts` over a fresh pause and returns the run result and the engine file text. */
  async function countsFor(
    flags: string[],
    status: (logs: string) => string,
    titles: string[] = ITEM_TITLES,
  ) {
    const { root, logs } = checkout();
    const out = orchestratorPause(logs, titles, 2);
    const r = await run(
      ["decisions", "counts", `--decision=${out}`, `--file=${status(logs)}`, ...flags],
      root,
    );
    return {
      root,
      r,
      engine: ((r.json?.show as string[] | undefined) ?? []).join("\n"),
    };
  }
  const stuck = (logs: string) =>
    statusRows(logs, [
      groupVerify("2026-10-01T00:10:00Z", 1, 4),
      groupVerify("2026-10-01T00:20:00Z", 2, 4),
    ]);

  it("--loop=holistic counts only the rounds since the whole-feature check was last clean", async () => {
    const holistic = (at: string, verdict: string, failures: number) => ({
      type: "step-done",
      workflow: "build",
      step: "build-plan-verify-holistic",
      status: "DONE",
      at,
      verdict,
      failures,
    });
    const { r, engine } = await countsFor(["--loop=holistic", "--attempt=2", "--max=2"], (logs) =>
      statusRows(logs, [
        holistic("2026-10-01T00:10:00Z", "FAIL", 5),
        holistic("2026-10-01T00:20:00Z", "PASS", 0),
        holistic("2026-10-01T00:30:00Z", "FAIL", 3),
        holistic("2026-10-01T00:40:00Z", "FAIL", 3),
      ]),
    );
    expect(r.code).toBe(0);
    expect(engine).toContain("build holistic: attempt 2 of 2");
    expect(engine).toContain("Problems after each round: 3 → 3");
    expect(engine).toMatch(/\*\*Q1 — Holistic verify:\*\* decide the items below/);
  });

  it("holistic limit pause prints the rounds run, never above max", async () => {
    const { r, engine } = await countsFor(["--loop=holistic", "--attempt=3", "--max=2"], (logs) =>
      statusRows(logs, []),
    );
    expect(r.code).toBe(0);
    expect(engine).toContain("build holistic: attempt 2 of 2");
    expect(engine).not.toContain("attempt 3 of 2");
  });

  it("prints the group gate's failing tests per round for the verify loop", async () => {
    const { r, engine } = await countsFor(["--loop=verify", "--group=1"], (logs) =>
      statusRows(logs, [
        gateRow("2026-10-01T00:09:00Z", "build-group-gate-1", 1, 3),
        groupVerify("2026-10-01T00:10:00Z", 1, 0),
        gateRow("2026-10-01T00:29:00Z", "build-group-gate-1", 2, 3),
        groupVerify("2026-10-01T00:30:00Z", 2, 0),
      ]),
    );
    expect(r.code).toBe(0);
    expect(engine).toContain("Group gate failures after each round: 3 → 3");
    expect(engine).toContain("Problems after each round: 3 → 3");
  });

  /** An uncounted group gate after a counted verify round: the trend reads `unknown`. */
  const unknownTrend = (attempt: number, max: number) =>
    countsFor(["--loop=verify", "--group=1", `--attempt=${attempt}`, `--max=${max}`], (logs) =>
      statusRows(logs, [
        groupVerify("2026-10-01T00:10:00Z", 1, 2),
        gateRow("2026-10-01T00:29:00Z", "build-group-gate-1", attempt, null),
        groupVerify("2026-10-01T00:30:00Z", 2, 0),
      ]),
    );

  it("--loop on an unknown trend says the limit is used up", async () => {
    const { r, engine } = await unknownTrend(2, 2);
    expect(r.code).toBe(0);
    expect(engine).toContain("Trend: unknown");
    expect(engine).toContain("limit is used up");
    expect(engine).not.toContain("a round is left");
    expect(engine).not.toContain("the last round made progress");
  });

  it("--loop on an unknown trend below the limit does not say the limit is used up", async () => {
    const { engine } = await unknownTrend(1, 3);
    expect(engine).toContain("Trend: unknown");
    expect(engine).not.toContain("the limit is used up");
  });

  /** Counts a stuck verify loop against a base check built from `over`. */
  async function countsWithBase(
    over: Record<string, unknown>,
    titles: string[],
    opts: { raw?: string } = {},
  ) {
    const { root, logs } = checkout();
    const out = orchestratorPause(logs, titles, 2);
    const base = path.join(root, "base-check.json");
    fs.writeFileSync(
      base,
      opts.raw ??
        JSON.stringify({
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
        }),
    );
    const r = await run(
      [
        "decisions",
        "counts",
        `--decision=${out}`,
        "--loop=verify",
        `--file=${stuck(logs)}`,
        "--group=1",
        "--attempt=2",
        "--max=2",
        `--base-check=${base}`,
      ],
      root,
    );
    return {
      r,
      engine: ((r.json?.show as string[] | undefined) ?? []).join("\n"),
    };
  }

  it("base check all in adopt mode adds the merge sentence", async () => {
    const adopt = await countsWithBase({ adopt: true }, []);
    expect(adopt.engine).toContain("merge `dev` into the branch before resuming");
    const plain = await countsWithBase({ adopt: false }, []);
    expect(plain.engine).not.toContain("merge `dev` into the branch before resuming");
  });

  it("base check some with undetermined cases counts only the branch's as fixable", async () => {
    const { r, engine } = await countsWithBase(
      {
        verdict: "some",
        failing: 3,
        baseRed: 1,
        branch: 1,
        undetermined: 1,
        reason: "the base run crashed",
      },
      ITEM_TITLES,
    );
    expect(r.code).toBe(0);
    expect(engine).toContain("a round can fix 1 of 3");
    expect(engine).not.toContain("a round can fix 2 of 3");
    expect(engine).toContain("the build will still stop on the 1 from `dev`");
    expect(engine).toMatch(/1 could not be checked: the base run crashed/);
  });

  it("--loop writes an effect for each loop option, Stop included when no item is counted", async () => {
    const { root, logs } = checkout();
    const out = orchestratorPause(logs, [], 2);
    const r = await counts(root, out, statusOf(logs, [2]));
    expect(r.code).toBe(0);
    const engine = (r.json?.show as string[]).join("\n");
    expect(engine).toContain("A) Try again — one more fix round runs");
    expect(engine).toContain(
      "B) Stop — the run ends here with a handover; the next run resumes here",
    );
    expect(engine).not.toContain("Options:");
  });

  it("prints the holistic gate's failing tests per round for the holistic loop", async () => {
    const holisticVerify = (at: string, attempt: number) => ({
      type: "step-done",
      workflow: "build",
      step: "build-plan-verify-holistic",
      status: "DONE",
      at,
      attempt,
      verdict: "PASS",
      failures: 0,
    });
    const { r, engine } = await countsFor(["--loop=holistic"], (logs) =>
      statusRows(logs, [
        holisticVerify("2026-10-01T00:10:00Z", 1),
        gateRow("2026-10-01T00:11:00Z", "build-holistic-gate", 1, 3),
        holisticVerify("2026-10-01T00:30:00Z", 2),
        gateRow("2026-10-01T00:31:00Z", "build-holistic-gate", 2, 3),
      ]),
    );
    expect(r.code).toBe(0);
    expect(engine).toContain("Holistic gate failures after each round: 3 → 3");
    expect(engine).toContain("Problems after each round: 3 → 3");
  });

  it("--loop on an unknown trend recommends Try again without claiming progress", async () => {
    const { engine } = await unknownTrend(2, 2);
    expect(engine).toContain("Trend: unknown");
    expect(engine).toMatch(/Recommended: (A\) )?Try again — /);
    expect(engine).not.toContain("the last round made progress");
  });

  it("base check all says a gate still red after resume comes from this branch", async () => {
    const { r, engine } = await countsWithBase({}, []);
    expect(r.code).toBe(0);
    expect(engine).toMatch(/Recommended: B\) Stop — /);
    expect(engine).toMatch(/still red after `dev` is fixed and the run resumed[^.]*this branch/);
  });

  it("base check some names the split", async () => {
    const { r, engine } = await countsWithBase(
      { verdict: "some", failing: 5, baseRed: 3, branch: 2 },
      ITEM_TITLES,
    );
    expect(r.code).toBe(0);
    expect(engine).toContain("a round can fix 2 of 5");
    expect(engine).toContain("the build will still stop on the 3 from `dev`");
    expect(engine).toMatch(/Recommended: B\) Decide — a round can fix 2 of 5/);
  });

  it("base check none keeps the trend and names the branch", async () => {
    const { r, engine } = await countsWithBase(
      { verdict: "none", failing: 3, baseRed: 0, branch: 3 },
      ITEM_TITLES,
    );
    expect(r.code).toBe(0);
    expect(engine).toMatch(/Recommended: B\) Decide — the failures come from this branch/);
  });

  it("base check unknown keeps the trend and says why", async () => {
    const { r, engine } = await countsWithBase(
      { verdict: "unknown", reason: "no JUnit report", base: null, source: null, baseRed: 0 },
      ITEM_TITLES,
    );
    expect(r.code).toBe(0);
    expect(engine).toMatch(/Recommended: B\) Decide — cause unknown: no JUnit report/);
  });

  it("Try again is offered for every base verdict", async () => {
    const variants: Record<string, unknown>[] = [
      { verdict: "all" },
      { verdict: "some", failing: 5, baseRed: 3, branch: 2 },
      { verdict: "none", failing: 3, baseRed: 0, branch: 3 },
      { verdict: "unknown", reason: "no JUnit report", base: null, source: null },
    ];
    for (const over of variants) {
      for (const titles of [[], ITEM_TITLES]) {
        const { engine } = await countsWithBase(over, titles);
        expect(engine, `${String(over.verdict)} with ${titles.length} items`).toMatch(
          /\*\*Q1 — Verify:\*\*[^\n]*\nA\) Try again — [^\n]*\nB\) (Decide|Stop) — /,
        );
      }
    }
  });

  it("base check prints how many failing tests are also red on base", async () => {
    const all = await countsWithBase({}, []);
    expect(all.engine).toContain("Also red on base abc1234: 3 of 3 (local run)");
    const unknown = await countsWithBase(
      { verdict: "unknown", reason: "no JUnit report", base: null, source: null },
      [],
    );
    expect(unknown.engine).toContain("Also red on base unknown: can't tell (no JUnit report)");
  });

  it("a missing or malformed base check is a usage error that names the problem", async () => {
    const { root, logs } = checkout();
    const out = orchestratorPause(logs, ITEM_TITLES, 2);
    const missing = await run(
      [
        "decisions",
        "counts",
        `--decision=${out}`,
        "--loop=verify",
        `--file=${stuck(logs)}`,
        "--group=1",
        `--base-check=${path.join(root, "no-such-base.json")}`,
      ],
      root,
    );
    expect(missing.code).toBe(2);
    expect(missing.err).toContain("no-such-base.json");
    expect(missing.err).not.toContain("unknown flag");

    const bad = await countsWithBase({}, ITEM_TITLES, {
      raw: JSON.stringify({ reason: null, base: "abc1234", failing: 3 }),
    });
    expect(bad.r.code).toBe(2);
    expect(bad.r.err).toContain("verdict");
    expect(bad.r.err).not.toContain("unknown flag");
  });

  it("--loop needs --file", async () => {
    const { root, logs } = checkout();
    const out = orchestratorPause(logs, ITEM_TITLES, 2);
    const r = await run(["decisions", "counts", `--decision=${out}`, "--loop=verify"], root);
    expect(r.code).toBe(2);
  });
});

describe("bkit decisions apply --by=headless", () => {
  it("appends an assumed Accept row per question and leaves the decision file unchanged", async () => {
    const { root, logs } = checkout();
    const out = orchestratorPause(logs, ["Task 3 [src/a.ts:10]", "Task 4 [src/b.ts:2]"], 1);
    seedStatus(logs);
    const before = fs.readFileSync(out, "utf-8");
    process.env.BKIT_RUNTIME = "GITHUB_ACTION";
    const r = await run(["decisions", "apply", "--by=headless", `--file=${out}`], root);
    expect(r.code).toBe(0);
    expect(fs.readFileSync(out, "utf-8")).toBe(before);
    expect(fs.existsSync(engineOf(out))).toBe(false);
    const rows = statusRows(out);
    const answers = rows.filter((x) => x.type === "decision-answer");
    expect(answers.map((x) => x.q)).toEqual([1, 2]);
    for (const a of answers) {
      expect(a).toMatchObject({ by: "headless", assumed: true });
      expect(String(a.answer)).toMatch(
        /Accept \(assumed\) — the caller already caps it \(headless, GITHUB_ACTION, /,
      );
    }
    expect(JSON.stringify(rows)).not.toMatch(/Status:/);
  });
});

describe("bkit decisions apply --by=owner and pending", () => {
  it("--confirm appends the owner's ship Accept row without the reason and writes no file", async () => {
    const { root, logs } = checkout();
    const out = path.join(logs, "build-decision-1-1.md");
    fs.writeFileSync(
      out,
      [
        "Question: CHALLENGE",
        "From: verify",
        "",
        "**Q1 — Task 3 [src/a.ts:10]:** MEDIUM: the retry has no cap. Accept it?",
        "A) Accept — the item is recorded as accepted",
        "B) Fix now — a fix task is added to the plan",
        "Recommended: A) Accept — the caller already caps it",
        "Default if unanswered: the run waits for you; taken as A when nobody can be asked",
        "",
      ].join("\n"),
    );
    bareCountsRow(logs, out);
    fs.appendFileSync(
      seedStatus(logs),
      `${JSON.stringify({
        type: "decision-answer",
        workflow: "build",
        at: "2026-10-28T00:00:00Z",
        file: path.relative(root, out),
        q: 1,
        answer:
          "Accept (assumed) — the caller already caps it (headless, GITHUB_ACTION, 2026-10-28)",
        by: "headless",
        assumed: true,
      })}\n`,
    );
    const before = fs.readFileSync(out, "utf-8");
    expect(fs.existsSync(engineOf(out))).toBe(false);
    const reasonFile = path.join(logs, "owner-reason.md");
    fs.writeFileSync(reasonFile, "fine\n");
    const r = await run(
      [
        "decisions",
        "apply",
        "--by=owner",
        `--file=${out}`,
        "--q=1",
        "--confirm",
        `--reason-file=${reasonFile}`,
      ],
      root,
    );
    expect(r.code).toBe(0);
    expect(fs.readFileSync(out, "utf-8")).toBe(before);
    expect(fs.existsSync(engineOf(out))).toBe(false);
    const rows = statusRows(out);
    const confirmed = rows.filter((x) => x.type === "decision-answer").at(-1);
    expect(confirmed).toMatchObject({ q: 1, by: "owner", workflow: "ship" });
    expect(String(confirmed?.answer)).toMatch(/^Accept — /);
    expect(String(confirmed?.answer)).not.toContain("fine");
    expect(JSON.stringify(rows.at(-1))).not.toContain("fine");
    expect(JSON.stringify(rows)).not.toMatch(/Status:/);
  });

  const loopPause = () => {
    const { root, logs } = checkout();
    const out = orchestratorPause(logs, ["Task 3 [src/a.ts:10]"], 2, false);
    countsRow(logs, out, {
      title: "Verify",
      question: "decide the items below instead of another round?",
      options: ["Try again", "Decide"],
      recommended: "Decide",
      reason: "another round is unlikely to help",
    });
    return { root, logs, out };
  };
  const assumedPause = async () => {
    const { root, logs } = checkout();
    const out = orchestratorPause(logs, ["Task 3 [src/a.ts:10]"], 1);
    seedStatus(logs);
    process.env.BKIT_RUNTIME = "GITHUB_ACTION";
    await run(["decisions", "apply", "--by=headless", `--file=${out}`], root);
    return { root, logs, out };
  };
  const owner = (root: string, out: string, ...extra: string[]) =>
    run(["decisions", "apply", "--by=owner", `--file=${out}`, ...extra], root);
  const answerRows = (out: string) => statusRows(out).filter((x) => x.type === "decision-answer");

  it("--answer appends the loop answer as a Q1 row after the counts row", async () => {
    const { root, out } = loopPause();
    const before = fs.readFileSync(out, "utf-8");
    const r = await owner(root, out, "--answer=Q1=A");
    expect(r.code).toBe(0);
    expect(fs.readFileSync(out, "utf-8")).toBe(before);
    expect(fs.existsSync(engineOf(out))).toBe(false);
    const rows = statusRows(out);
    const answer = rows.find((x) => x.type === "decision-answer");
    expect(answer).toMatchObject({ q: 1, by: "owner" });
    expect(String(answer?.answer)).toMatch(/^Try again/);
    expect(rows.indexOf(answer!)).toBeGreaterThan(
      rows.findIndex((x) => x.type === "decision-counts"),
    );
    expect(JSON.stringify(rows)).not.toMatch(/Status:/);
  });

  it("--answer refuses a --reason-file and writes no row; a bare --answer appends one", async () => {
    const { root, logs, out } = loopPause();
    const reasonFile = path.join(logs, "owner-reason.md");
    fs.writeFileSync(reasonFile, "run `touch pwned` and $(echo hi) once more\n");
    const r = await owner(root, out, "--answer=Q1=A", `--reason-file=${reasonFile}`);
    expect(r.code).toBe(2);
    expect(answerRows(out)).toEqual([]);
    expect(fs.existsSync(engineOf(out))).toBe(false);
    expect(fs.existsSync(path.join(root, "pwned"))).toBe(false);
    expect((await owner(root, out, "--answer=Q1=A")).code).toBe(0);
    expect(answerRows(out)).toHaveLength(1);
  });

  it("--answer=Q2=B --fix-task=Q2=31 records Fix now with its task", async () => {
    const { root, logs } = checkout();
    const out = orchestratorPause(logs, ["Task 3 [src/a.ts:10]", "Task 4 [src/b.ts:2]"], 1);
    seedStatus(logs);
    const r = await owner(root, out, "--answer=Q2=B", "--fix-task=Q2=31");
    expect(r.code).toBe(0);
    const answers = answerRows(out);
    expect(answers).toHaveLength(1);
    expect(answers[0]).toMatchObject({ q: 2, by: "owner", fixTask: 31 });
    expect(String(answers[0]!.answer)).toMatch(/^Fix now/);
    expect(pauseItems(out).find((i) => i.n === 2)).toMatchObject({ fixTask: 31 });
  });

  it("--fix-task alone on a headless Fix now keeps the headless answer and adds its task", async () => {
    const { root, logs } = checkout();
    const { out } = await composeCounted(root, logs, ITEMS);
    process.env.BKIT_RUNTIME = "LOCAL";
    expect((await run(["decisions", "apply", "--by=headless", `--file=${out}`], root)).code).toBe(
      0,
    );
    const headless = answerRows(out).find((x) => x.q === 2)!;
    expect(headless).toMatchObject({ by: "headless" });
    const r = await owner(root, out, "--fix-task=Q2=31");
    expect(r.code).toBe(0);
    const last = answerRows(out).at(-1)!;
    expect(last).toMatchObject({ q: 2, by: "headless", fixTask: 31, answer: headless.answer });
    expect(pauseItems(out).find((i) => i.n === 2)).toMatchObject({ by: "headless", fixTask: 31 });
    const before = answerRows(out).length;
    const refused = await owner(root, out, "--fix-task=Q1=32");
    expect(refused.code).toBe(2);
    expect(refused.err).toContain("Q1");
    expect(answerRows(out)).toHaveLength(before);
  });

  it("--fix-task alone copies the recorded Fix now row whole, runtime included, and adds only its task", async () => {
    const { root, logs } = checkout();
    const { out } = await composeCounted(root, logs, ITEMS);
    process.env.BKIT_RUNTIME = "LOCAL";
    expect((await run(["decisions", "apply", "--by=headless", `--file=${out}`], root)).code).toBe(
      0,
    );
    const headless = answerRows(out).find((x) => x.q === 2)!;
    expect(headless.runtime).toBe("LOCAL");
    expect((await owner(root, out, "--fix-task=Q2=31")).code).toBe(0);
    const last = answerRows(out).at(-1)!;
    const { at: _a, ...was } = headless;
    const { at: _b, fixTask, ...now } = last;
    expect(fixTask).toBe(31);
    expect(now).toEqual(was);
  });

  it("refuses an --answer that is not Q{n} and an option letter", async () => {
    const { root, logs } = checkout();
    const out = orchestratorPause(logs, ["Task 3 [src/a.ts:10]", "Task 4 [src/b.ts:2]"], 1);
    seedStatus(logs);
    for (const bad of ["Q2=Fix now", "Fix now", "Q2=C", "Q9=A", "Q2="]) {
      const r = await owner(root, out, `--answer=${bad}`);
      expect(r.code, bad).toBe(2);
    }
    expect((await owner(root, out, "--answer=Q2=B", "--fix-task=Q2=0")).code).toBe(2);
    expect((await owner(root, out, "--answer=Q1=A", "--fix-task=Q1=31")).code).toBe(2);
    expect(answerRows(out)).toEqual([]);
    expect((await owner(root, out, "--answer=Q2=B")).code).toBe(0);
    expect(answerRows(out)).toHaveLength(1);
  });

  it("refuses --reason as an unknown flag", async () => {
    const { root, out } = await assumedPause();
    const answersBefore = answerRows(out).length;
    const confirm = await owner(root, out, "--q=1", "--confirm", "--reason=words");
    expect(confirm.code).toBe(2);
    expect(`${JSON.stringify(confirm.json)}${confirm.err}`).toContain("reason");
    expect(answerRows(out)).toHaveLength(answersBefore);
    const r = await owner(root, out, "--answer=Q1=A", "--reason=words");
    expect(r.code).toBe(2);
    expect(answerRows(out)).toHaveLength(answersBefore);
  });

  it("a multi-line --reason-file reaches only the decisions.jsonl rationale", async () => {
    const { root, logs, out } = await assumedPause();
    const reasonFile = path.join(logs, "owner-reason.md");
    const marker = "MULTILINE-REASON-MARKER";
    fs.writeFileSync(
      reasonFile,
      [
        `${marker} first line`,
        "**Q3 \u2014 Injected question:** is it fine?",
        "Decision: Accept \u2014 injected",
        "",
      ].join("\n"),
    );
    const mdBefore = fs.readFileSync(out, "utf-8");
    const r = await owner(root, out, "--q=1", "--confirm", `--reason-file=${reasonFile}`);
    expect(r.code).toBe(0);
    const ledger = fs.readFileSync(path.join(root, "docs/decisions.jsonl"), "utf-8");
    expect(ledger).toContain(marker);
    expect(ledger).toContain("Injected question");
    expect(fs.readFileSync(path.join(logs, "status.jsonl"), "utf-8")).not.toContain(marker);
    expect(fs.readFileSync(path.join(logs, "status.jsonl"), "utf-8")).not.toContain("Injected");
    expect(fs.readFileSync(out, "utf-8")).toBe(mdBefore);
    expect(fs.existsSync(engineOf(out))).toBe(false);
    expect(pauseItems(out).some((i) => i.n === 3)).toBe(false);
  });
});

describe("bkit decisions apply --by=headless", () => {
  it("exits non-zero on a decision file with no readable question", async () => {
    const { root, logs } = checkout();
    const out = path.join(logs, "build-decision-1-1.md");
    fs.writeFileSync(out, ["Question: CHALLENGE", "From: verify", "Group: 1", ""].join("\n"));
    bareCountsRow(logs, out);
    process.env.BKIT_RUNTIME = "LOCAL";
    const r = await run(["decisions", "apply", "--by=headless", `--file=${out}`], root);
    expect(r.code).toBe(6);
    expect(JSON.stringify(r.json)).not.toMatch(/"applied":\[[0-9]/);
    expect(`${JSON.stringify(r.json)}${r.err}`).toContain("build-decision-1-1.md");
    expect(`${JSON.stringify(r.json)}${r.err}`).toContain("the file holds no question");
  });
});

describe("bkit decisions apply --by=headless", () => {
  it("exits 6 on a loop pause whose own questions decisions check refuses", async () => {
    const { root, logs } = checkout();
    const out = orchestratorPause(logs, ["Gap 1"], 2, false);
    fs.writeFileSync(out, fs.readFileSync(out, "utf-8").replace("**Q2 \u2014 ", "**Q2 \u2013 "));
    countsRow(logs, out, {
      title: "Verify",
      question: "decide the items below instead of another round?",
      options: ["Try again", "Decide"],
      recommended: "Decide",
      reason: "another round is unlikely to help",
    });
    process.env.BKIT_RUNTIME = "LOCAL";
    const r = await run(["decisions", "apply", "--by=headless", `--file=${out}`], root);
    expect(r.code).toBe(6);
    expect(`${JSON.stringify(r.json)}${r.err}`).toContain("Q2 \u2013");
    expect(statusRows(out).filter((x) => x.type === "decision-answer")).toEqual([]);
  });

  it("the apply verb names the decisions check refusal and lists every exit code it returns", () => {
    const apply = decisionsCommand.verbs.apply!;
    expect(apply.output?.problem).toContain("no readable question");
    expect(apply.output?.problem).toContain("decisions check");
    const codes = Object.keys(apply.exitCodes!).map(Number);
    expect(codes.sort((a, b) => a - b)).toEqual([
      3,
      EXIT_HARD_BLOCKERS,
      EXIT_BAD_DECISION,
      EXIT_ROW_REFUSED,
    ]);
    expect(apply.exitCodes?.[EXIT_BAD_DECISION]).toContain("decisions check");
  });
});

describe("bkit decisions answers", () => {
  const answerLine = (root: string, file: string, q: number, answer: string, extra: object) => ({
    type: "decision-answer",
    workflow: "build",
    at: "2026-11-17T00:01:00Z",
    file: path.relative(root, file),
    q,
    answer,
    ...extra,
  });

  it("prints the last appended answer per question with its writer", async () => {
    const { root, logs } = checkout();
    const file = orchestratorPause(logs, ["Task 3 [src/a.ts:10]", "Task 4 [src/b.ts:2]"], 1);
    const before = fs.readFileSync(file, "utf-8");
    const rows = [
      answerLine(
        root,
        file,
        1,
        "Accept (assumed) \u2014 the caller caps it (headless, LOCAL, 2026-11-17)",
        {
          by: "headless",
          assumed: true,
        },
      ),
      answerLine(
        root,
        file,
        2,
        "Accept (assumed) \u2014 the caller caps it (headless, LOCAL, 2026-11-17)",
        {
          by: "headless",
          assumed: true,
        },
      ),
      answerLine(root, file, 2, "Fix now \u2014 the owner wants it fixed (owner, 2026-11-17)", {
        by: "owner",
        fixTask: 31,
      }),
    ];
    fs.appendFileSync(seedStatus(logs), rows.map((x) => `${JSON.stringify(x)}\n`).join(""));
    const r = await run(["decisions", "answers", `--file=${file}`], root);
    expect(r.code).toBe(0);
    expect(r.json.items).toHaveLength(2);
    expect(r.json.items[0]).toMatchObject({
      q: 1,
      title: "Task 3 [src/a.ts:10]",
      by: "headless",
      assumed: true,
    });
    expect(r.json.items[1]).toMatchObject({
      q: 2,
      title: "Task 4 [src/b.ts:2]",
      by: "owner",
      assumed: false,
      fixTask: 31,
    });
    expect(String(r.json.items[1].answer)).toMatch(/^Fix now/);
    expect(fs.readFileSync(file, "utf-8")).toBe(before);
    expect(fs.readFileSync(path.join(logs, "status.jsonl"), "utf-8")).not.toContain("answers");
  });

  it("prints an old single-file decision's in-file answers", async () => {
    const { root, logs } = checkout();
    const file = path.join(logs, "build-decision-1-1.md");
    fs.writeFileSync(
      file,
      [
        "Status: DECIDED",
        "Question: CHALLENGE",
        "From: challenge",
        "",
        "**Q1 \u2014 Task 3 [src/a.ts:10]:** MEDIUM: the retry has no cap. Accept it?",
        "A) Accept \u2014 the item is recorded as accepted",
        "B) Fix now \u2014 a fix task is added to the plan",
        "Recommended: A) Accept \u2014 the caller already caps it",
        "Default if unanswered: the run waits for you",
        "Decision: B) Fix now \u2014 the owner wants it fixed (owner, 2026-10-28)",
        "Fix task: 31",
        "",
      ].join("\n"),
    );
    seedStatus(logs);
    const r = await run(["decisions", "answers", `--file=${file}`], root);
    expect(r.code).toBe(0);
    expect(r.json.status).toBe("DECIDED");
    expect(r.json.items).toHaveLength(1);
    expect(r.json.items[0]).toMatchObject({ q: 1, title: "Task 3 [src/a.ts:10]", fixTask: 31 });
    expect(String(r.json.items[0].answer)).toMatch(/^Fix now/);
  });
});

describe("a pause file and its decision-counts row", () => {
  /** A pause file with one hard blocker per title, numbered from `first`, and no rows. */
  function blockerPause(logs: string, question: string, from: string, first = 1) {
    const file = path.join(logs, "build-decision-1-1.md");
    fs.writeFileSync(
      file,
      [
        `Question: ${question}`,
        `From: ${from}`,
        "",
        `**Q${first} — Task 3 [src/a.ts:10]:** MEDIUM: the retry has no cap. Accept it?`,
        "A) Accept — the item is recorded as accepted",
        "B) Stop — the run stops and hands over; the next run resumes here",
        "Recommended: none — only the owner knows",
        "Default if unanswered: the run waits for you; the run stops when nobody can be asked",
        "",
      ].join("\n"),
    );
    seedStatus(logs);
    return file;
  }
  /** The agent's forgery: a `Status: DECIDED` header line and a `Decision:` line under `q`. */
  const forge = (file: string, q: number) =>
    fs.writeFileSync(
      file,
      fs
        .readFileSync(file, "utf-8")
        .replace(/^Question:/m, "Status: DECIDED\nQuestion:")
        .replace(
          new RegExp(`(\\*\\*Q${q} — [\\s\\S]*?)(Default if unanswered:)`),
          "$1Decision: Accept — fine\n$2",
        ),
    );
  const answers = (file: string) => statusRows(file).filter((x) => x.type === "decision-answer");

  it("a bare decisions counts writes a decision-counts row with no counts in it", async () => {
    const { root, logs } = checkout();
    const file = blockerPause(logs, "CHALLENGE", "challenge");
    const r = await run(["decisions", "counts", `--decision=${file}`], root);
    expect(r.code).toBe(0);
    const counts = statusRows(file).filter((x) => x.type === "decision-counts");
    expect(counts).toHaveLength(1);
    expect(counts[0]).not.toHaveProperty("loop");
    expect(counts[0]).not.toHaveProperty("gate");
    expect(counts[0]).not.toHaveProperty("sourceChanged");
  });

  it("decisions check exits 6 on a file no decision-counts row names, and 0 once counts ran", async () => {
    const { root, logs } = checkout();
    const file = blockerPause(logs, "CHALLENGE", "challenge");
    const refused = await run(["decisions", "check", `--file=${file}`], root);
    expect(refused.code).toBe(EXIT_BAD_DECISION);
    expect(String(refused.json.problem)).toContain("decision-counts");
    expect((await run(["decisions", "counts", `--decision=${file}`], root)).code).toBe(0);
    expect((await run(["decisions", "check", `--file=${file}`], root)).code).toBe(0);
  });

  it.each([
    ["CHALLENGE", "challenge"],
    ["CHANGED_TESTS", "tests"],
    ["UNPROVEN", "summary"],
  ])(
    "a %s pause never takes the agent's own Status and Decision lines as answers",
    async (question, from) => {
      const { root, logs } = checkout();
      const file = blockerPause(logs, question, from);
      expect((await run(["decisions", "counts", `--decision=${file}`], root)).code).toBe(0);
      expect((await run(["decisions", "check", `--file=${file}`], root)).code).toBe(0);
      forge(file, 1);
      const read = await run(["decisions", "answers", `--file=${file}`], root);
      expect(read.json.status).toBe("OPEN");
      expect(read.json.items[0]).toMatchObject({ q: 1, answer: null, by: null });
      process.env.BKIT_RUNTIME = "LOCAL";
      const applied = await run(["decisions", "apply", "--by=headless", `--file=${file}`], root);
      expect(applied.code).toBe(EXIT_BAD_DECISION);
      expect(answers(file)).toEqual([]);
    },
  );

  /** Starts the folder's `status.jsonl` with run 1's start row as this engine writes it. */
  const markedRun = (logs: string) =>
    fs.writeFileSync(
      path.join(logs, "status.jsonl"),
      `${JSON.stringify({ type: "workflow-started", workflow: "build", at: "2026-11-19T00:00:00Z", decisionLayout: "rows" })}\n`,
    );

  it.each([
    ["CHALLENGE", "challenge"],
    ["CHANGED_TESTS", "tests"],
    ["UNPROVEN", "summary"],
  ])(
    "a %s pause in a run the engine marked: check exits 6 until counts runs, and headless never answers its hard blocker",
    async (question, from) => {
      const { root, logs } = checkout();
      markedRun(logs);
      const file = blockerPause(logs, question, from);
      const before = await run(["decisions", "check", `--file=${file}`], root);
      expect(before.code).toBe(EXIT_BAD_DECISION);
      expect(String(before.json.problem)).toContain("decision-counts");
      process.env.BKIT_RUNTIME = "LOCAL";
      const early = await run(["decisions", "apply", "--by=headless", `--file=${file}`], root);
      expect(early.code).toBe(EXIT_BAD_DECISION);
      expect((await run(["decisions", "counts", `--decision=${file}`], root)).code).toBe(0);
      expect((await run(["decisions", "check", `--file=${file}`], root)).code).toBe(0);
      const applied = await run(["decisions", "apply", "--by=headless", `--file=${file}`], root);
      expect(applied.code).toBe(EXIT_HARD_BLOCKERS);
      expect(answers(file)).toEqual([]);
    },
  );

  it("an agent-written pause no decision row names, in a run the engine marked, routes nothing and reads open", async () => {
    const { root, logs } = checkout();
    markedRun(logs);
    const file = blockerPause(logs, "VERIFY_GAPS", "verify");
    forge(file, 1);
    fs.writeFileSync(
      file,
      fs
        .readFileSync(file, "utf-8")
        .replace("From: verify\n", "From: verify\nSource changed: false\n"),
    );
    const skipped = await run(["decisions", "skip", `--file=${file}`], root);
    expect(skipped.json.route).not.toBe("continue");
    expect(skipped.json.problem).toBe("Q1 is undecided, not Accept");
    const read = await run(["decisions", "answers", `--file=${file}`], root);
    expect(read.json.status).toBe("OPEN");
    expect(read.json.items[0]).toMatchObject({ q: 1, answer: null, by: null });
  });

  it("an owner answer on a file no counts row names, in a run the engine marked, is refused and leaves the agent's Decision line unread", async () => {
    const { root, logs } = checkout();
    markedRun(logs);
    const file = orchestratorPause(logs, ["Task 3 [src/a.ts:10]", "Task 4 [src/b.ts:2]"], 2, false);
    const owner = await run(
      ["decisions", "apply", "--by=owner", `--file=${file}`, "--answer=Q2=B"],
      root,
    );
    expect(owner.code).toBe(EXIT_BAD_DECISION);
    forge(file, 3);
    const read = await run(["decisions", "answers", `--file=${file}`], root);
    expect(read.json.status).toBe("OPEN");
    expect(read.json.items.find((i: { q: number }) => i.q === 3)).toMatchObject({
      answer: null,
      by: null,
    });
    // Until a decision-counts row names the file, no row settles it either.
    expect(read.json.items.find((i: { q: number }) => i.q === 2)).toMatchObject({
      answer: null,
      by: null,
    });
  });

  /** Rewrites the checked file's hard blocker to recommend a word that is no option, applies headless, and returns the answer rows. */
  async function applyRefusedRecommendation(root: string, file: string) {
    expect((await run(["decisions", "check", `--file=${file}`], root)).code).toBe(0);
    fs.writeFileSync(
      file,
      fs
        .readFileSync(file, "utf-8")
        .replace("Recommended: none — ", "Recommended: Ask the owner — "),
    );
    const checked = await run(["decisions", "check", `--file=${file}`], root);
    expect(checked.code).toBe(EXIT_BAD_DECISION);
    expect(String(checked.json.problem)).toContain('"Ask the owner"');
    process.env.BKIT_RUNTIME = "LOCAL";
    const r = await run(["decisions", "apply", "--by=headless", `--file=${file}`], root);
    expect(r.code).toBe(EXIT_BAD_DECISION);
    expect(r.json.problem).toBe(checked.json.problem);
    return answers(file);
  }

  it("headless apply writes no row for a recommendation decisions check refuses, with no loop", async () => {
    const { root, logs } = checkout();
    const file = blockerPause(logs, "VERIFY_GAPS", "verify", 1);
    expect((await run(["decisions", "counts", `--decision=${file}`], root)).code).toBe(0);
    expect(await applyRefusedRecommendation(root, file)).toEqual([]);
  });

  it("headless apply writes no row for a recommendation decisions check refuses, on a loop pause", async () => {
    const { root, logs } = checkout();
    const file = blockerPause(logs, "VERIFY_GAPS", "verify", 2);
    countsRow(logs, file, {
      title: "Verify",
      question: "decide the items below instead of another round?",
      options: ["Try again", "Decide"],
      recommended: "Decide",
      reason: "another round is unlikely to help",
    });
    expect(await applyRefusedRecommendation(root, file)).toEqual([]);
  });

  it("headless apply writes no row when the loop question was built for a different question count", async () => {
    const { root, logs } = checkout();
    const file = orchestratorPause(logs, ["Task 3 [src/a.ts:10]"], 2, false);
    countsRow(logs, file, {
      title: "Verify",
      question: "another fix round, or stop here?",
      options: ["Try again", "Stop"],
      recommended: "Stop",
      reason: "no question is left to decide",
    });
    const checked = await run(["decisions", "check", `--file=${file}`], root);
    expect(checked.code).toBe(EXIT_BAD_DECISION);
    process.env.BKIT_RUNTIME = "LOCAL";
    const r = await run(["decisions", "apply", "--by=headless", `--file=${file}`], root);
    expect(r.code).toBe(EXIT_BAD_DECISION);
    expect(r.json.problem).toBe(checked.json.problem);
    expect(answers(file)).toEqual([]);
  });

  it("a No recommendation line inside an item whose Recommended line names an option is not a hard blocker", async () => {
    const { root, logs } = checkout();
    const file = orchestratorPause(logs, ["Task 3 [src/a.ts:10]"], 1, false);
    fs.writeFileSync(
      file,
      fs
        .readFileSync(file, "utf-8")
        .replace(
          "Default if unanswered:",
          "No recommendation was needed upstream.\nDefault if unanswered:",
        ),
    );
    seedStatus(logs);
    expect((await run(["decisions", "counts", `--decision=${file}`], root)).code).toBe(0);
    expect((await run(["decisions", "check", `--file=${file}`], root)).code).toBe(0);
    expect(parseDecisionItems(fs.readFileSync(file, "utf-8"))[0]).toMatchObject({
      recommended: "Accept",
    });
    process.env.BKIT_RUNTIME = "LOCAL";
    const r = await run(["decisions", "apply", "--by=headless", `--file=${file}`], root);
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({ applied: [1], hardBlockers: [] });
  });

  /** A reason file for --confirm / --reject in `root`. */
  const reasonFile = (root: string) => {
    const f = path.join(root, "reason.txt");
    fs.writeFileSync(f, "the owner's words\n");
    return f;
  };

  it.each([
    ["--by=owner --answer", (_root: string) => ["--by=owner", "--answer=Q1=B"]],
    ["--by=owner --fix-task alone", (_root: string) => ["--by=owner", "--fix-task=Q1=3"]],
    [
      "--by=owner --confirm",
      (root: string) => ["--by=owner", "--confirm", "--q=1", `--reason-file=${reasonFile(root)}`],
    ],
    [
      "--by=owner --reject",
      (root: string) => ["--by=owner", "--reject", "--q=1", `--reason-file=${reasonFile(root)}`],
    ],
    ["--by=rerun", (_root: string) => ["--by=rerun"]],
  ])(
    "apply %s on a file decisions check refuses writes no row and exits 6",
    async (_form, flags) => {
      const { root, logs } = checkout();
      markedRun(logs);
      const file = orchestratorPause(logs, ["Task 3 [src/a.ts:10]"], 1, false);
      const r = await run(["decisions", "apply", ...flags(root), `--file=${file}`], root);
      expect(r.code).toBe(EXIT_BAD_DECISION);
      expect(String(r.json.problem)).toContain("decision-counts");
      expect(answers(file)).toEqual([]);
    },
  );

  /** A loop question as `decisions counts` builds it for a file with items (`Decide`) or none (`Stop`). */
  const loopFor = (withItems: boolean) => ({
    title: "Verify",
    question: "another fix round?",
    options: ["Try again", withItems ? "Decide" : "Stop"],
    recommended: "Try again",
    reason: "the last round made progress",
  });
  /** A counted verify pause with one item numbered Q2, whose loop question was built for none. */
  const outgrownPause = (logs: string) => {
    markedRun(logs);
    const file = orchestratorPause(logs, ["Task 3 [src/a.ts:10]"], 2, false);
    countsRow(logs, file, loopFor(false));
    return file;
  };

  it.each([
    ["--by=owner --answer", (_root: string) => ["--by=owner", "--answer=Q2=A"]],
    ["--by=owner --fix-task alone", (_root: string) => ["--by=owner", "--fix-task=Q2=3"]],
    [
      "--by=owner --confirm",
      (root: string) => ["--by=owner", "--confirm", "--q=2", `--reason-file=${reasonFile(root)}`],
    ],
    [
      "--by=owner --reject",
      (root: string) => ["--by=owner", "--reject", "--q=2", `--reason-file=${reasonFile(root)}`],
    ],
  ])(
    "apply %s on a counted file whose loop question was built for a different question count writes no row and exits 6",
    async (_form, flags) => {
      const { root, logs } = checkout();
      const file = outgrownPause(logs);
      const checked = await run(["decisions", "check", `--file=${file}`], root);
      expect(checked.code).toBe(EXIT_BAD_DECISION);
      const r = await run(["decisions", "apply", ...flags(root), `--file=${file}`], root);
      expect(r.code).toBe(EXIT_BAD_DECISION);
      expect(r.json.problem).toBe(checked.json.problem);
      expect(answers(file)).toEqual([]);
      const read = await run(["decisions", "answers", `--file=${file}`], root);
      expect(read.json.items.find((i: { q: number }) => i.q === 2)).toMatchObject({
        answer: null,
        by: null,
      });
    },
  );

  it("apply --by=rerun on a red-gate file whose loop question was built for a different question count writes no row and exits 6", async () => {
    const { root, logs } = checkout();
    markedRun(logs);
    const file = orchestratorPause(logs, [], 2, false);
    countsRow(logs, file, loopFor(true));
    const checked = await run(["decisions", "check", `--file=${file}`], root);
    expect(checked.code).toBe(EXIT_BAD_DECISION);
    const r = await run(["decisions", "apply", "--by=rerun", `--file=${file}`], root);
    expect(r.code).toBe(EXIT_BAD_DECISION);
    expect(r.json.problem).toBe(checked.json.problem);
    expect(answers(file)).toEqual([]);
  });

  it("apply --by=owner on a counted file an answer line was added to after the check writes no row and exits 6", async () => {
    const { root, logs } = checkout();
    markedRun(logs);
    const file = orchestratorPause(logs, ["Task 3 [src/a.ts:10]"], 2, false);
    countsRow(logs, file, loopFor(true));
    expect((await run(["decisions", "check", `--file=${file}`], root)).code).toBe(0);
    fs.writeFileSync(
      file,
      fs
        .readFileSync(file, "utf-8")
        .replace("Default if unanswered:", "Decision: A\nDefault if unanswered:"),
    );
    const r = await run(
      ["decisions", "apply", "--by=owner", `--file=${file}`, "--answer=Q2=B"],
      root,
    );
    expect(r.code).toBe(EXIT_BAD_DECISION);
    expect(String(r.json.problem)).toContain('"Decision:"');
    expect(answers(file)).toEqual([]);
  });

  it("apply --by=rerun on a red-gate file a header line was added to after the check writes no row and exits 6", async () => {
    const { root, logs } = checkout();
    markedRun(logs);
    const file = orchestratorPause(logs, [], 2, false);
    countsRow(logs, file, loopFor(false));
    expect((await run(["decisions", "check", `--file=${file}`], root)).code).toBe(0);
    fs.writeFileSync(
      file,
      fs
        .readFileSync(file, "utf-8")
        .replace("From: verify\n", "From: verify\nSource changed: false\n"),
    );
    const r = await run(["decisions", "apply", "--by=rerun", `--file=${file}`], root);
    expect(r.code).toBe(EXIT_BAD_DECISION);
    expect(String(r.json.problem)).toContain('"Source changed:"');
    expect(answers(file)).toEqual([]);
  });

  it("apply --by=owner on a counted file decisions check passes records the answers and reads DECIDED", async () => {
    const { root, logs } = checkout();
    markedRun(logs);
    const file = orchestratorPause(logs, ["Task 3 [src/a.ts:10]"], 2, false);
    countsRow(logs, file, loopFor(true));
    expect((await run(["decisions", "check", `--file=${file}`], root)).code).toBe(0);
    const r = await run(
      ["decisions", "apply", "--by=owner", `--file=${file}`, "--answer=Q1=B", "--answer=Q2=A"],
      root,
    );
    expect(r.code).toBe(0);
    expect(r.json.status).toBe("DECIDED");
    expect(answers(file).map((a) => a.q)).toEqual([1, 2]);
  });

  it("an Owner block of quoted lines appended after the owner answers leaves the file checked and the pause DECIDED", async () => {
    const { root, logs } = checkout();
    markedRun(logs);
    const file = orchestratorPause(logs, ["Task 3 [src/a.ts:10]"], 2, false);
    countsRow(logs, file, loopFor(true));
    expect((await run(["decisions", "check", `--file=${file}`], root)).code).toBe(0);
    const owner = await run(
      ["decisions", "apply", "--by=owner", `--file=${file}`, "--answer=Q1=B", "--answer=Q2=A"],
      root,
    );
    expect(owner.code).toBe(0);
    fs.appendFileSync(
      file,
      "\nOwner (2026-11-20):\n> Decision: A\n> **Q3 — x:**\n> - **Q4 — x:**\n",
    );
    expect((await run(["decisions", "check", `--file=${file}`], root)).code).toBe(0);
    const read = await run(["decisions", "answers", `--file=${file}`], root);
    expect(read.json.status).toBe("DECIDED");
  });

  it("a decision-counts row written after a refused owner answer finds no answer", async () => {
    const { root, logs } = checkout();
    markedRun(logs);
    const file = orchestratorPause(logs, ["Task 3 [src/a.ts:10]", "Task 4 [src/b.ts:2]"], 1, false);
    const owner = await run(
      ["decisions", "apply", "--by=owner", `--file=${file}`, "--answer=Q1=B"],
      root,
    );
    expect(owner.code).toBe(EXIT_BAD_DECISION);
    expect((await run(["decisions", "counts", `--decision=${file}`], root)).code).toBe(0);
    const read = await run(["decisions", "answers", `--file=${file}`], root);
    expect(read.json.status).toBe("OPEN");
    expect(read.json.items.find((i: { q: number }) => i.q === 1)).toMatchObject({
      answer: null,
      by: null,
    });
  });

  it("an answer row written before the file's first decision-counts row is never an answer", async () => {
    const { root, logs } = checkout();
    markedRun(logs);
    const file = orchestratorPause(logs, ["Task 3 [src/a.ts:10]"], 1, false);
    fs.appendFileSync(
      path.join(logs, "status.jsonl"),
      `${JSON.stringify({
        type: "decision-answer",
        workflow: "build",
        at: "2026-11-19T00:01:00Z",
        file: path.relative(root, file),
        q: 1,
        answer: "Fix now — the owner's choice (owner, 2026-11-19)",
        by: "owner",
      })}\n`,
    );
    expect((await run(["decisions", "counts", `--decision=${file}`], root)).code).toBe(0);
    const read = await run(["decisions", "answers", `--file=${file}`], root);
    expect(read.json.status).toBe("OPEN");
    expect(read.json.items[0]).toMatchObject({ q: 1, answer: null, by: null });
    // An answer written once the counts row exists still counts.
    const owner = await run(
      ["decisions", "apply", "--by=owner", `--file=${file}`, "--answer=Q1=A"],
      root,
    );
    expect(owner.code).toBe(0);
    expect(owner.json.status).toBe("DECIDED");
  });

  it("decisions check refuses a file numbered from Q2 whose decision-counts row holds no loop question", async () => {
    const { root, logs } = checkout();
    markedRun(logs);
    const file = blockerPause(logs, "VERIFY_GAPS", "verify", 2);
    expect((await run(["decisions", "counts", `--decision=${file}`], root)).code).toBe(0);
    const checked = await run(["decisions", "check", `--file=${file}`], root);
    expect(checked.code).toBe(EXIT_BAD_DECISION);
    expect(String(checked.json.problem)).toContain("Q2");
    expect(String(checked.json.problem)).toContain("loop");
  });

  it.each([
    ["CHALLENGE", "challenge"],
    ["CHANGED_TESTS", "tests"],
    ["UNPROVEN", "summary"],
  ])("a %s pause numbered from Q1 passes decisions check with a bare row", async (q, from) => {
    const { root, logs } = checkout();
    markedRun(logs);
    const file = blockerPause(logs, q, from, 1);
    expect((await run(["decisions", "counts", `--decision=${file}`], root)).code).toBe(0);
    expect((await run(["decisions", "check", `--file=${file}`], root)).code).toBe(0);
  });
});
