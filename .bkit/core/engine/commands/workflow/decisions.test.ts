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

  it("--loop needs --file", async () => {
    const { root, logs } = checkout();
    expect((await compose(root, logs, ITEMS, "--loop=verify")).r.code).toBe(2);
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
