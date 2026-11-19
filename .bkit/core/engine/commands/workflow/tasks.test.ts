/**
 * commands/workflow/tasks.test.ts — `bkit tasks`: the plan tick, the group's open set
 * and the path / symbol match against landed changes.
 *
 * Each test writes a plan and (for `open`) an execute log in a temp folder and reads
 * the command's one output object; the plan file's other lines are compared byte for
 * byte, because the tick rewrites one heading line and nothing else. `currency` runs
 * against a real temp git repo: the commit range is its subject, so a stub diff would
 * test nothing.
 */

import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { runCommand } from "../lib";
import { parsePlanBlocks } from "./plan-blocks";
import { addTakeoverTasks, gappedTasks, tasksCommand } from "./tasks";
import { checkPlanText, planTakeovers } from "./tests";

const dirs: string[] = [];
const tmp = () => {
  const d = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-tasks-")));
  dirs.push(d);
  return d;
};
afterEach(() => {
  for (const d of dirs.splice(0)) fs.rmSync(d, { recursive: true, force: true });
  cwd = "";
});

const task = (n: number, tick = " ") => [
  `<!-- bkit:task ${n} start -->`,
  `- [${tick}] **TASK ${n}:** Task ${n} title.`,
  "  - **DONE WHEN:** done",
  "  - **TEST FIRST:** n/a — docs only",
  `<!-- bkit:task ${n} end -->`,
];
const group = (n: number, ...tasks: string[][]) => [
  `<!-- bkit:group ${n} start -->`,
  `### GROUP ${n}: Group ${n} title`,
  "",
  ...tasks.flatMap((t) => [...t, ""]),
  `<!-- bkit:group ${n} end -->`,
];
/** A plan with the given groups and prose after them, so an untouched trailing line is real. */
const planText = (...groups: string[][]) =>
  [
    "# Plan",
    "",
    "## The work",
    "",
    ...groups.flatMap((g) => [...g, ""]),
    "## Tail",
    "",
    "| left | right |",
    "| --- | --- |",
    "| a | b |",
    "",
  ].join("\n");

let cwd = "";
/** The test's temp folder, created on first use. */
const dir = () => {
  if (cwd === "") cwd = tmp();
  return cwd;
};
const write = (name: string, text: string) => {
  const file = path.join(dir(), name);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, text);
  return file;
};
const read = (file: string) => fs.readFileSync(file, "utf-8");
/**
 * Writes an old decision file as `old/build-decision-1-1.md`, beside a `status.jsonl` whose run 1
 * started before the engine marked its start row, so the file's own answers stand.
 */
const oldDecision = (text: string) => {
  write(
    "old/status.jsonl",
    `${JSON.stringify({ type: "workflow-started", workflow: "build", at: "2026-10-01T00:00:00Z" })}\n`,
  );
  return write("old/build-decision-1-1.md", text);
};

/** git in a fixture repo; a non-zero exit is the fixture's bug, so it throws. */
const git = (repo: string, ...args: string[]) => {
  const r = spawnSync("git", ["-c", "user.email=t@t", "-c", "user.name=t", ...args], {
    cwd: repo,
    encoding: "utf-8",
  });
  if (r.status !== 0) throw new Error(`git ${args.join(" ")}: ${r.stderr}`);
  return (r.stdout ?? "").trim();
};
const writeIn = (repo: string, rel: string, body: string) => {
  const abs = path.join(repo, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, body);
};
const commit = (repo: string, message: string) => {
  git(repo, "add", "-A");
  git(repo, "commit", "-q", "-m", message);
  return git(repo, "rev-parse", "HEAD");
};
/** A fixture repo on `main` holding `files`, its first commit made. */
const repo = (files: Record<string, string>) => {
  const d = tmp();
  git(d, "init", "-q", "-b", "main");
  for (const [rel, body] of Object.entries(files)) writeIn(d, rel, body);
  commit(d, "base");
  return d;
};
/** A plan whose one task refs `refs` as `` `symbol` in `file`: what `` UPDATE lines. */
const refPlan = (...refs: string[]) =>
  planText(
    group(1, [
      "<!-- bkit:task 4 start -->",
      "- [ ] **TASK 4:** Currency task.",
      ...refs.map((r) => `  - **UPDATE:** ${r}`),
      "  - **DONE WHEN:** done",
      "  - **TEST FIRST:** n/a — docs only",
      "<!-- bkit:task 4 end -->",
    ]),
  );

async function run(argv: string[]) {
  const out: string[] = [];
  const err: string[] = [];
  const code = await runCommand(["tasks", ...argv, "--json"], [tasksCommand], {
    classicVerbs: new Set(),
    cwd,
    io: { stdout: (t) => out.push(t), stderr: (t) => err.push(t) },
  });
  return { code, json: out.length ? JSON.parse(out.join("")) : undefined, err: err.join("") };
}

/** The heading line of task `n` in `text`: the line a tick rewrites. */
const headOf = (text: string, n: number) =>
  text.split("\n").find((l) => l.includes(`**TASK ${n}:**`))!;
const tickOf = (text: string, n: number) => /^- \[([ x])\]/.exec(headOf(text, n))![1];

describe("bkit tasks tick", () => {
  /** A verify-pause decision file: one item per `[title, answer]`, titled as the orchestrator titles a gap. */
  const decisionFile = (...items: Array<[string, string | null]>) =>
    [
      "Status: DECIDED",
      "Question: VERIFY_GAPS",
      "From: verify",
      "Group: 1",
      "",
      ...items.flatMap(([title, answer], i) => [
        `**Q${i + 1} — ${title}:** accept it?`,
        "Options: A) Accept / B) Fix now",
        "Recommended: A) Accept — minor",
        ...(answer === null ? [] : [`Decision: ${answer}`]),
        "",
      ]),
    ].join("\n");

  it("tick --decision ticks the tasks of accepted verify-gap items", async () => {
    const plan = write("plan.md", planText(group(1, task(1), task(2), task(3))));
    const decision = oldDecision(
      decisionFile(["Task 1 gap", "Accept — minor"], ["Task 3 gap", "Accept (assumed) — headless"]),
    );
    const r = await run(["tick", `--plan=${plan}`, "--group=1", `--decision=${decision}`]);
    expect(r.code).toBe(0);
    expect(r.json.ticked).toEqual([1, 3]);
    expect([tickOf(read(plan), 1), tickOf(read(plan), 2), tickOf(read(plan), 3)]).toEqual([
      "x",
      " ",
      "x",
    ]);
  });

  it("tick --decision ticks a task whose item title reads TASK {N}", async () => {
    const plan = write("plan.md", planText(group(1, task(1), task(2), task(3))));
    const decision = oldDecision(decisionFile(["TASK 3", "Accept — minor"], ["TASK 2", "Fix now"]));
    const r = await run(["tick", `--plan=${plan}`, "--group=1", `--decision=${decision}`]);
    expect(r.code).toBe(0);
    expect(r.json.ticked).toEqual([3]);
    expect([tickOf(read(plan), 1), tickOf(read(plan), 2), tickOf(read(plan), 3)]).toEqual([
      " ",
      " ",
      "x",
    ]);
  });

  it("tick --decision leaves a Fix now item's task open", async () => {
    const plan = write("plan.md", planText(group(1, task(1), task(2), task(3))));
    const decision = oldDecision(
      decisionFile(
        ["Task 1 gap", "Accept — minor"],
        ["Task 2 gap", "Fix now"],
        ["Task 3 gap", null],
      ),
    );
    const r = await run(["tick", `--plan=${plan}`, "--group=1", `--decision=${decision}`]);
    expect(r.code).toBe(0);
    expect(r.json.ticked).toEqual([1]);
    expect([tickOf(read(plan), 1), tickOf(read(plan), 2), tickOf(read(plan), 3)]).toEqual([
      "x",
      " ",
      " ",
    ]);
  });

  it("ticks the task an Accept row names and no task for a Fix now row", async () => {
    const plan = write("plan.md", planText(group(1, task(1), task(2), task(3))));
    const question = (n: number) => [
      `**Q${n} — Task ${n} gap:** accept it?`,
      "A) Accept — the item is recorded as accepted",
      "B) Fix now — a fix task is added to the plan",
      "Recommended: A) Accept — minor",
      "Default if unanswered: the run waits for you; taken as A when nobody can be asked",
      "",
    ];
    const decision = write(
      "rows/build-decision-1-1.md",
      [
        "Question: VERIFY_GAPS",
        "From: verify",
        "Group: 1",
        "",
        ...question(1),
        ...question(2),
        ...question(3),
      ].join("\n"),
    );
    const answer = (q: number, text: string, extra: object = {}) => ({
      type: "decision-answer",
      workflow: "build",
      at: "2026-11-01T00:00:00Z",
      file: decision,
      q,
      answer: text,
      by: "owner",
      ...extra,
    });
    write(
      "rows/status.jsonl",
      [
        { type: "decision-counts", workflow: "build", at: "2026-11-01T00:00:00Z", file: decision },
        answer(1, "Accept — minor"),
        answer(2, "Fix now — add a test", { fixTask: 2 }),
        answer(3, "Accept (assumed) — headless", { assumed: true, by: "headless" }),
      ]
        .map((row) => JSON.stringify(row))
        .join("\n") + "\n",
    );
    const r = await run(["tick", `--plan=${plan}`, "--group=1", `--decision=${decision}`]);
    expect(r.code).toBe(0);
    expect(r.json.ticked).toEqual([1, 3]);
    expect([tickOf(read(plan), 1), tickOf(read(plan), 2), tickOf(read(plan), 3)]).toEqual([
      "x",
      " ",
      "x",
    ]);
  });

  it("tick --decision ticks nothing for a Decision line in a file the engine has counted", async () => {
    const plan = write("plan.md", planText(group(1, task(1), task(2))));
    const decision = write(
      "counted/build-decision-1-1.md",
      decisionFile(["Task 1 gap", "Accept — fine"]),
    );
    write(
      "counted/status.jsonl",
      JSON.stringify({
        type: "decision-counts",
        workflow: "build",
        at: "2026-11-01T00:00:00Z",
        file: decision,
        sourceChanged: false,
      }) + "\n",
    );
    const r = await run(["tick", `--plan=${plan}`, "--group=1", `--decision=${decision}`]);
    expect(r.code).toBe(0);
    expect(r.json.ticked).toEqual([]);
    expect(tickOf(read(plan), 1)).toBe(" ");
  });

  it("tick --decision reads a per-line decision file with a lettered answer", async () => {
    const plan = write("plan.md", planText(group(1, task(1), task(2), task(3))));
    const decision = oldDecision(
      [
        "Status: DECIDED",
        "Question: VERIFY_GAPS",
        "From: verify",
        "Group: 1",
        "",
        "**Q1 — Task 1 gap:** accept it?",
        "A) Accept — the item is recorded as accepted and the build moves on",
        "B) Fix now — one more fix round runs before the build moves on",
        "Recommended: A) Accept — minor",
        "Default if unanswered: the run waits for you; taken as A when nobody can be asked",
        "Decision: A",
        "",
        "**Q2 — Task 2 gap:** accept it?",
        "A) Accept — the item is recorded as accepted and the build moves on",
        "B) Fix now — one more fix round runs before the build moves on",
        "Recommended: A) Accept — minor",
        "Default if unanswered: the run waits for you; taken as A when nobody can be asked",
        "Decision: B",
        "",
      ].join("\n"),
    );
    const r = await run(["tick", `--plan=${plan}`, "--group=1", `--decision=${decision}`]);
    expect(r.code).toBe(0);
    expect(r.json.ticked).toEqual([1]);
  });

  it("tick marks only the named tasks", async () => {
    const plan = write("plan.md", planText(group(1, task(1), task(2), task(3))));
    const r = await run(["tick", `--plan=${plan}`, "--group=1", "--tasks=2"]);
    expect(r.code).toBe(0);
    expect(r.json.ticked).toEqual([2]);
    expect([tickOf(read(plan), 1), tickOf(read(plan), 2), tickOf(read(plan), 3)]).toEqual([
      " ",
      "x",
      " ",
    ]);
  });

  it("tick refuses a task in another group", async () => {
    const text = planText(group(1, task(1)), group(2, task(2)));
    const plan = write("other-group.md", text);
    const r = await run(["tick", `--plan=${plan}`, "--group=1", "--tasks=2"]);
    expect(r.code).toBe(2);
    expect(r.err).toContain("TASK 2");
    expect(r.err).toContain("group 2");
    expect(read(plan)).toBe(text);
  });

  it("tick refuses a plan with no task blocks", async () => {
    const plan = write("no-blocks.md", "# Plan\n\nNo task blocks here.\n");
    const r = await run(["tick", `--plan=${plan}`, "--group=1", "--tasks=1"]);
    expect(r.code).toBe(1);
    expect(r.err).toMatch(/no task markers/);
  });

  it("tick narrows the group's gap-free tasks by --tasks", async () => {
    const plan = write("gapped.md", planText(group(1, task(1), task(2))));
    const green = write(
      "green.md",
      [
        "Enforced: true",
        "Verdict: CONCERNS",
        "Gaps: 1",
        "",
        "<!-- verdict:end -->",
        "",
        "## Gaps",
        "",
        "- Task 2 `not-green` — `.bkit/x.test.ts` `b` does not exist — Fixable: true — log: TASK 2: not-green",
        "",
      ].join("\n"),
    );
    const r = await run(["tick", `--plan=${plan}`, "--group=1", "--tasks=1,2", `--green=${green}`]);
    expect(r.code).toBe(0);
    expect(r.json.ticked).toEqual([1]);
    expect(tickOf(read(plan), 2)).toBe(" ");
  });

  it("ticks a task listed only under Updated tests", async () => {
    const plan = write("updated-tests.md", planText(group(1, task(8), task(9))));
    const green = write(
      "green-updated.md",
      [
        "Enforced: true",
        "Verdict: PASS",
        "Gaps: 0",
        "",
        "<!-- verdict:end -->",
        "",
        "## Gaps",
        "",
        "None.",
        "",
        "## Updated tests",
        "",
        "- Task 9 `updated` — `.bkit/x.test.ts` `a` changed",
        "",
      ].join("\n"),
    );
    const r = await run(["tick", `--plan=${plan}`, "--group=1", "--tasks=8,9", `--green=${green}`]);
    expect(r.code).toBe(0);
    expect(r.json.ticked).toEqual([8, 9]);
    expect(tickOf(read(plan), 9)).toBe("x");
  });

  it("ticks a task listed only under Already landed and skips a Gaps task", async () => {
    const plan = write("landed.md", planText(group(1, task(7), task(8), task(9))));
    const green = write(
      "green-landed.md",
      [
        "Enforced: true",
        "Verdict: CONCERNS",
        "Gaps: 1",
        "",
        "<!-- verdict:end -->",
        "",
        "## Already landed",
        "",
        "- Task 7 `passes` — `.bkit/x.test.ts` `a` already passes",
        "",
        "## Gaps",
        "",
        "- Task 9 `not-green` — `.bkit/x.test.ts` `b` does not exist — Fixable: true — log: TASK 9: not-green",
        "",
      ].join("\n"),
    );
    const r = await run([
      "tick",
      `--plan=${plan}`,
      "--group=1",
      "--tasks=7,8,9",
      `--green=${green}`,
    ]);
    expect(r.code).toBe(0);
    expect(r.json.ticked).toEqual([7, 8]);
    expect(tickOf(read(plan), 7)).toBe("x");
    expect(tickOf(read(plan), 9)).toBe(" ");
  });

  it("tasks tick --green refuses a report with no Gaps heading", async () => {
    const text = planText(group(1, task(1), task(2)));
    const plan = write("no-gaps-heading.md", text);
    const green = write(
      "green-no-gaps.md",
      ["Enforced: true", "Verdict: PASS", "Gaps: 0", "", "<!-- verdict:end -->", ""].join("\n"),
    );
    const r = await run(["tick", `--plan=${plan}`, "--group=1", `--green=${green}`]);
    expect(r.code).toBe(2);
    expect(r.err).toContain("report has no Gaps section");
    expect(read(plan)).toBe(text);
  });

  it("tasks tick --green refuses a report whose gap lines are fewer than its Gaps header", async () => {
    const text = planText(group(1, task(1), task(2), task(3)));
    const plan = write("short-gaps.md", text);
    const green = write(
      "green-short.md",
      [
        "Enforced: true",
        "Verdict: CONCERNS",
        "Gaps: 2",
        "",
        "<!-- verdict:end -->",
        "",
        "## Gaps",
        "",
        "- Task 1 `not-green` — not-green: expected:",
        "## Heading",
        "- Task 3 `not-green` — not-green: still red — Fixable: true — log: TASK 3: not-green",
        "",
      ].join("\n"),
    );
    const r = await run(["tick", `--plan=${plan}`, "--group=1", `--green=${green}`]);
    expect(r.code).toBe(2);
    expect(r.err).toContain("Gaps: 2");
    expect(r.err).toContain("1 gap line");
    expect(read(plan)).toBe(text);
  });

  it("tick --decision ticks nothing for a title that only mentions a task", async () => {
    const text = planText(group(1, task(1), task(2)));
    const plan = write("mention.md", text);
    const decision = oldDecision(
      decisionFile(["No test covers the retry path that task 2 adds", "Accept — minor"]),
    );
    const r = await run(["tick", `--plan=${plan}`, "--group=1", `--decision=${decision}`]);
    expect(r.code).toBe(0);
    expect(r.json.ticked).toEqual([]);
    expect(read(plan)).toBe(text);
  });

  it("tick --decision still refuses a --tasks number from another group", async () => {
    const text = planText(group(1, task(1)), group(2, task(9)));
    const plan = write("decision-other-group.md", text);
    const decision = oldDecision(decisionFile(["Task 1 gap", "Accept — minor"]));
    const r = await run([
      "tick",
      `--plan=${plan}`,
      "--group=1",
      "--tasks=9",
      `--decision=${decision}`,
    ]);
    expect(r.code).toBe(2);
    expect(r.err).toContain("TASK 9 is in group 2, not group 1");
    expect(read(plan)).toBe(text);
  });

  it("tick --decision still refuses an unknown --tasks number", async () => {
    const text = planText(group(1, task(1)));
    const plan = write("decision-unknown.md", text);
    const decision = oldDecision(decisionFile(["Task 1 gap", "Accept — minor"]));
    const r = await run([
      "tick",
      `--plan=${plan}`,
      "--group=1",
      "--tasks=7",
      `--decision=${decision}`,
    ]);
    expect(r.code).toBe(2);
    expect(r.err).toContain("has no TASK 7");
    expect(read(plan)).toBe(text);
  });

  /** A decision file whose header block is `header`, with one accepted `Task 1 gap` item. */
  const headed = (...header: string[]) =>
    [
      ...header,
      "",
      "**Q1 — Task 1 gap:** accept it?",
      "Options: A) Accept / B) Fix now",
      "Recommended: A) Accept — minor",
      "Decision: Accept — minor",
      "",
    ].join("\n");

  it.each([
    ["no From header", ["Status: DECIDED", "Group: 1"], "no From header"],
    [
      "a From that is not verify or holistic",
      ["Status: DECIDED", "From: challenge", "Group: 1"],
      'From is "challenge", not verify or holistic',
    ],
    [
      "a Gate: FAIL header",
      ["Status: DECIDED", "From: verify", "Group: 1", "Gate: FAIL"],
      "Gate: FAIL",
    ],
    [
      "a verify Group that differs from --group",
      ["Status: DECIDED", "From: verify", "Group: 2"],
      'Group is "2", not group 1',
    ],
    ["a verify file with no Group header", ["Status: DECIDED", "From: verify"], "no Group header"],
  ])("tick --decision refuses %s", async (_name, header, problem) => {
    const text = planText(group(1, task(1)), group(2, task(2)));
    const plan = write("refused.md", text);
    const decision = oldDecision(headed(...header));
    const r = await run(["tick", `--plan=${plan}`, "--group=1", `--decision=${decision}`]);
    expect(r.code).toBe(2);
    expect(r.err).toContain(problem);
    expect(read(plan)).toBe(text);
  });

  it("tick --decision ticks a holistic file's accepted tasks across groups without --group", async () => {
    const plan = write("holistic.md", planText(group(1, task(1), task(2)), group(2, task(3))));
    const decision = oldDecision(
      [
        "Status: DECIDED",
        "Question: VERIFY_GAPS",
        "From: holistic",
        "Pause step: 10",
        "",
        "**Q1 — Task 1:** accept it?",
        "Options: A) Accept / B) Fix now",
        "Recommended: A) Accept — minor",
        "Decision: Accept — minor",
        "",
        "**Q2 — Task 3:** accept it?",
        "Options: A) Accept / B) Fix now",
        "Recommended: A) Accept — minor",
        "Decision: Accept (assumed) — headless",
        "",
        "**Q3 — Cross-group wiring is missing:** accept it?",
        "Options: A) Accept / B) Fix now",
        "Recommended: A) Accept — minor",
        "Decision: Accept — minor",
        "",
      ].join("\n"),
    );
    const r = await run(["tick", `--plan=${plan}`, `--decision=${decision}`]);
    expect(r.code).toBe(0);
    expect(r.json.ticked).toEqual([1, 3]);
    expect([tickOf(read(plan), 1), tickOf(read(plan), 2), tickOf(read(plan), 3)]).toEqual([
      "x",
      " ",
      "x",
    ]);
    const again = await run(["tick", `--plan=${plan}`, `--decision=${decision}`]);
    expect(again.code).toBe(0);
    expect(again.json.ticked).toEqual([]);
  });

  it("tick --decision still needs --group for a verify file", async () => {
    const text = planText(group(1, task(1)));
    const plan = write("verify-no-group.md", text);
    const decision = oldDecision(decisionFile(["Task 1 gap", "Accept — minor"]));
    const r = await run(["tick", `--plan=${plan}`, `--decision=${decision}`]);
    expect(r.code).toBe(2);
    expect(r.err).toContain("--group");
    expect(read(plan)).toBe(text);
  });

  it("gappedTasks still reads a report whose Gaps section is empty", async () => {
    const plan = write("empty-gaps.md", planText(group(1, task(1), task(2))));
    const green = write(
      "green-empty-gaps.md",
      [
        "Enforced: true",
        "Verdict: PASS",
        "Gaps: 0",
        "",
        "<!-- verdict:end -->",
        "",
        "## Gaps",
        "",
      ].join("\n"),
    );
    const r = await run(["tick", `--plan=${plan}`, "--group=1", `--green=${green}`]);
    expect(r.code).toBe(0);
    expect(r.json.ticked).toEqual([1, 2]);
    expect(gappedTasks(read(green))).toEqual([]);
  });

  it("tick is idempotent on an already-ticked task", async () => {
    const plan = write("idempotent.md", planText(group(1, task(1), task(2))));
    const first = await run(["tick", `--plan=${plan}`, "--group=1", "--tasks=1,2"]);
    expect(first.code).toBe(0);
    const once = read(plan);
    const second = await run(["tick", `--plan=${plan}`, "--group=1", "--tasks=1,2"]);
    expect(second.code).toBe(0);
    expect(second.json.ticked).toEqual([]);
    expect(read(plan)).toBe(once);
  });

  it("tick refuses a --tasks value that is not a task number", async () => {
    const text = planText(group(1, task(1)));
    const plan = write("bad-number.md", text);
    const r = await run(["tick", `--plan=${plan}`, "--group=1", "--tasks=one"]);
    expect(r.code).toBe(2);
    expect(r.err).toContain("--tasks");
    expect(read(plan)).toBe(text);
  });

  it("tick refuses a --plan that is no file", async () => {
    dir();
    const r = await run(["tick", "--plan=no-such-plan.md", "--group=1", "--tasks=1"]);
    expect(r.code).toBe(2);
    expect(r.err).toContain("no-such-plan.md");
  });

  it("tick treats the header's none as nothing to tick", async () => {
    const text = planText(group(1, task(1), task(2)));
    const plan = write("none.md", text);
    const r = await run(["tick", `--plan=${plan}`, "--group=1", "--tasks=none"]);
    expect(r.code).toBe(0);
    expect(r.json.ticked).toEqual([]);
    expect(read(plan)).toBe(text);
  });

  it("tick leaves every other plan line byte-identical", async () => {
    const text = planText(group(1, task(1), task(2)), group(2, task(3)));
    const plan = write("bytes.md", text);
    const r = await run(["tick", `--plan=${plan}`, "--group=1", "--tasks=2"]);
    expect(r.code).toBe(0);
    const after = read(plan).split("\n");
    const before = text.split("\n");
    expect(after).toHaveLength(before.length);
    expect(after.filter((l, i) => l !== before[i])).toEqual(["- [x] **TASK 2:** Task 2 title."]);
  });

  it("tick refuses a call with no --group or with neither selector", async () => {
    const text = planText(group(1, task(1)));
    const plan = write("no-group.md", text);
    const noGroup = await run(["tick", `--plan=${plan}`, "--tasks=1"]);
    expect(noGroup.code).toBe(2);
    expect(noGroup.err).toContain("--group");
    const noSelector = await run(["tick", `--plan=${plan}`, "--group=1"]);
    expect(noSelector.code).toBe(2);
    expect(noSelector.err).toMatch(/--tasks|--green/);
    expect(read(plan)).toBe(text);
  });
});

describe("bkit tasks open", () => {
  it("open lists tasks with no done line", async () => {
    const plan = write("open.md", planText(group(1, task(1), task(2), task(3))));
    const log = write(
      "open-log.md",
      [
        "DONE — TASK 1: First — implemented (a.ts)",
        "BLOCKED — TASK 2: Second — the migration is missing",
        "",
      ].join("\n"),
    );
    const r = await run(["open", `--plan=${plan}`, "--group=1", `--log=${log}`]);
    expect(r.code).toBe(0);
    expect(r.json.tasks).toEqual([3]);
    expect(r.json.handover).toBe(true);
  });

  it("open sets handover only when a task is open", async () => {
    const plan = write("open-all.md", planText(group(1, task(1), task(2))));
    const log = write(
      "open-all-log.md",
      [
        "DONE — TASK 1: First — implemented (a.ts)",
        "BLOCKED — TASK 2: Second — the migration is missing",
        "",
      ].join("\n"),
    );
    const r = await run(["open", `--plan=${plan}`, "--group=1", `--log=${log}`]);
    expect(r.code).toBe(0);
    expect(r.json.tasks).toEqual([]);
    expect(r.json.handover).toBe(false);
  });

  it("open does not list a ticked task with no log line", async () => {
    const plan = write("open-ticked.md", planText(group(1, task(1, "x"), task(2, "x"))));
    const log = write("open-ticked-log.md", "DONE — TASK 1: First — implemented (a.ts)\n");
    const r = await run(["open", `--plan=${plan}`, "--group=1", `--log=${log}`]);
    expect(r.code).toBe(0);
    expect(r.json.tasks).toEqual([]);
    expect(r.json.handover).toBe(false);
  });

  it("open lists an unticked task with no log line next to a ticked one", async () => {
    const plan = write("open-mixed.md", planText(group(1, task(1), task(2, "x"), task(3))));
    const log = write("open-mixed-log.md", "DONE — TASK 1: First — implemented (a.ts)\n");
    const r = await run(["open", `--plan=${plan}`, "--group=1", `--log=${log}`]);
    expect(r.code).toBe(0);
    expect(r.json.tasks).toEqual([3]);
    expect(r.json.handover).toBe(true);
  });

  it("open refuses a plan with no task blocks", async () => {
    const plan = write("open-plain.md", "# Plan\n\nNo task blocks here.\n");
    const log = write("open-plain-log.md", "");
    const r = await run(["open", `--plan=${plan}`, "--group=1", `--log=${log}`]);
    expect(r.code).toBe(1);
    expect(r.err).toMatch(/no task markers/);
  });
});

describe("bkit tasks currency", () => {
  it("currency matches a task on a moved symbol", async () => {
    cwd = repo({ "src/money.ts": "export const price = 1;\n" });
    const base = git(cwd, "rev-parse", "HEAD");
    writeIn(cwd, "src/money.ts", "export const total = 1;\n");
    commit(cwd, "rename price to total");
    const plan = write(
      "currency-symbol.md",
      refPlan("`total` in `src/money.ts`: renamed from price"),
    );
    const r = await run(["currency", `--plan=${plan}`, `--base=${base}`, "--against=HEAD"]);
    expect(r.code).toBe(0);
    expect(r.json.tasks.map((t: { task: number }) => t.task)).toEqual([4]);
    expect(r.json.tasks[0].paths).toEqual(["src/money.ts"]);
    expect(r.json.tasks[0].needles).toEqual(["total"]);
    expect(r.json.tasks[0].hunks.join("\n")).toContain("total");
  });

  it("currency leaves run logs out: a symbol named only in another plan's log matches no task", async () => {
    cwd = repo({ "src/money.ts": "export const price = 1;\n" });
    const base = git(cwd, "rev-parse", "HEAD");
    writeIn(cwd, "docs/plans/202610/logs/9-other/build-plan-tasks-1-log.md", "DONE — total\n");
    commit(cwd, "another feature's run log");
    const plan = write(
      "currency-logs.md",
      refPlan("`total` in `src/money.ts`: renamed from price"),
    );
    const r = await run(["currency", `--plan=${plan}`, `--base=${base}`, "--against=HEAD"]);
    expect(r.code).toBe(0);
    expect(r.json.tasks).toEqual([]);
  });

  it("currency emits no hunk outside the matched set", async () => {
    cwd = repo({
      "src/matched.ts": "export const alpha = 1;\n",
      "src/other.ts": "export const beta = 1;\n",
    });
    const base = git(cwd, "rev-parse", "HEAD");
    writeIn(cwd, "src/matched.ts", "export const alpha = 2;\n");
    writeIn(cwd, "src/other.ts", "export const beta = 2;\n");
    commit(cwd, "both change");
    const plan = write("currency-hunks.md", refPlan("`alpha` in `src/matched.ts`: value changed"));
    const r = await run(["currency", `--plan=${plan}`, `--base=${base}`, "--against=HEAD"]);
    expect(r.code).toBe(0);
    const hunks = r.json.tasks[0].hunks.join("\n");
    expect(hunks).toContain("src/matched.ts");
    expect(hunks).not.toContain("src/other.ts");
  });

  it("currency refuses a plan with no task blocks", async () => {
    cwd = repo({ "src/x.ts": "x\n" });
    const plan = write("currency-plain.md", "# Plan\n\nNo task blocks here.\n");
    const r = await run(["currency", `--plan=${plan}`]);
    expect(r.code).toBe(1);
    expect(r.err).toMatch(/no task markers/);
  });

  it("currency exits 0 with no hunks when no task matches", async () => {
    cwd = repo({ "src/untouched.ts": "one\n", "src/elsewhere.ts": "one\n" });
    const base = git(cwd, "rev-parse", "HEAD");
    writeIn(cwd, "src/elsewhere.ts", "two\n");
    commit(cwd, "elsewhere changed");
    const plan = write(
      "currency-nomatch.md",
      refPlan("`absent` in `src/untouched.ts`: nothing moved"),
    );
    const r = await run(["currency", `--plan=${plan}`, `--base=${base}`, "--against=HEAD"]);
    expect(r.code).toBe(0);
    expect(r.json.tasks).toEqual([]);
  });

  it("currency judges base...against (origin/dev), not base...HEAD", async () => {
    cwd = repo({
      "src/base.ts": "base\n",
      "src/dev-moved.ts": "one\n",
      "src/branch-moved.ts": "one\n",
    });
    const base = git(cwd, "rev-parse", "HEAD");
    git(cwd, "checkout", "-q", "-b", "dev");
    writeIn(cwd, "src/dev-moved.ts", "two\n");
    commit(cwd, "dev moves");
    git(cwd, "checkout", "-q", "-b", "feature", base);
    writeIn(cwd, "src/branch-moved.ts", "two\n");
    commit(cwd, "branch moves");
    const plan = write(
      "currency-range.md",
      refPlan(
        "`devMoved` in `src/dev-moved.ts`: moved on dev",
        "`branchMoved` in `src/branch-moved.ts`: moved on the branch",
      ),
    );
    const r = await run(["currency", `--plan=${plan}`, `--base=${base}`, "--against=dev"]);
    expect(r.code).toBe(0);
    expect(r.json.tasks[0].paths).toEqual(["src/dev-moved.ts"]);
    expect(r.json.tasks[0].hunks.join("\n")).not.toContain("branch-moved");
  });
});

describe("bkit tasks takeover", () => {
  const TEST = "src/a.test.ts";
  const STATUS = "logs/status.jsonl";
  /** A task naming `name` in `src/a.test.ts` on its TEST FIRST. */
  const testTask = (n: number, name: string, tick: string) => [
    `<!-- bkit:task ${n} start -->`,
    `- [${tick}] **TASK ${n}:** Task ${n} title.`,
    "  - **DONE WHEN:** passes",
    "  - **TEST FIRST:**",
    `    - \`${TEST}\` \`${name}\` fails on the stub`,
    `<!-- bkit:task ${n} end -->`,
  ];
  /** GROUP 1 TASK 1 (ticked) owns `adds a row`, GROUP 2 TASK 2 (open) owns `counts rows`; a matrix row each. */
  const PLAN = [
    "# Plan",
    "",
    "## Derived Test Matrix",
    "",
    "| Test description | Type | Target file | Task |",
    "| --- | --- | --- | --- |",
    `| adds a row | Unit | \`${TEST}\` | 1 |`,
    `| counts rows | Unit | \`${TEST}\` | 2 |`,
    "",
    "## Implementation Tasks",
    "",
    ...group(1, testTask(1, "adds a row", "x")),
    "",
    ...group(2, testTask(2, "counts rows", " ")),
    "",
    "## Tail",
    "",
    "Kept as written.",
    "",
  ].join("\n");
  const setup = () => {
    cwd = repo({ "plan.md": PLAN, [TEST]: "it('adds a row', () => {});\n" });
    fs.mkdirSync(path.join(cwd, "logs"), { recursive: true });
  };
  /** The engine's write, as a code step's `steps finish` calls it on a contradiction. */
  const takeover = (name: string, task: number | null = 2, test = TEST) =>
    addTakeoverTasks(
      cwd,
      path.join(cwd, "plan.md"),
      path.join(cwd, STATUS),
      [{ test, name, from: 1, task, reason: "rows now start at 0" }],
      () => {},
    );
  const pending = () => run(["takeover", "--pending", "--plan=plan.md", `--file=${STATUS}`]);
  const plan = () => read(path.join(cwd, "plan.md"));
  const rows = () =>
    read(path.join(cwd, STATUS))
      .trim()
      .split("\n")
      .filter((l) => l !== "")
      .map((l) => JSON.parse(l) as Record<string, unknown>)
      .filter((r) => r.step === "build-takeover");

  it("addTakeoverTasks appends a takeover task in a new last group that plan-check accepts", () => {
    setup();
    expect(takeover("adds a row")).toEqual([3]);
    const text = plan();
    expect(text).toContain("<!-- bkit:group 3 start -->");
    expect(text).toContain("- [ ] **TASK 3:** Take over `adds a row` from TASK 1");
    expect(text).toContain("  - **DEPENDS ON:** 2");
    expect(text).toContain(`    - \`${TEST}\` \`adds a row\` fails until TASK 2's code exists`);
    expect(text).toContain(`| Take over adds a row from TASK 1 | Unit | \`${TEST}\` | 3 |`);
    expect(text.indexOf("<!-- bkit:group 3 end -->")).toBeLessThan(text.indexOf("## Tail"));
    expect(text.endsWith("## Tail\n\nKept as written.\n")).toBe(true);
    expect(checkPlanText(text).problems).toEqual([]);
    expect(planTakeovers(text)).toEqual([
      expect.objectContaining({ task: 3, from: 1, test: TEST, name: "adds a row" }),
    ]);
    expect(rows()).toEqual([
      expect.objectContaining({
        workflow: "build",
        status: "DONE",
        task: 3,
        from: 1,
        test: TEST,
        name: "adds a row",
        reason: "rows now start at 0",
      }),
    ]);
  });

  it("addTakeoverTasks reuses the open task on a second call", () => {
    setup();
    expect(takeover("adds a row")).toEqual([3]);
    const once = plan();
    expect(takeover("adds a row")).toEqual([3]);
    expect(plan()).toBe(once);
    expect(rows()).toHaveLength(1);
  });

  /** The tests step's red row for the takeover task, as `steps finish` records it. */
  const recordRed = (group: number, task: number, name: string) =>
    fs.appendFileSync(
      path.join(cwd, STATUS),
      `${JSON.stringify({
        type: "step-done",
        workflow: "build",
        step: "build-tests-red",
        status: "DONE",
        group,
        tests: [{ task, test: TEST, testName: name, state: "red", blob: null }],
      })}\n`,
    );

  it("addTakeoverTasks adds a new task when the open takeover task already has a red record", async () => {
    setup();
    expect(takeover("adds a row")).toEqual([3]);
    recordRed(3, 3, "adds a row");
    expect(takeover("adds a row")).toEqual([4]);
    const text = plan();
    expect(text).toContain("- [ ] **TASK 4:** Take over `adds a row` from TASK 1");
    expect(checkPlanText(text).problems).toEqual([]);
    expect(rows()).toEqual([
      expect.objectContaining({ task: 3, name: "adds a row" }),
      expect.objectContaining({ task: 4, name: "adds a row" }),
    ]);
    const p = (await pending()).json;
    expect(p.pending).toEqual(expect.objectContaining({ tasks: [4] }));
  });

  it("addTakeoverTasks reuses the new task on a repeat call after a recorded takeover", () => {
    setup();
    expect(takeover("adds a row")).toEqual([3]);
    recordRed(3, 3, "adds a row");
    expect(takeover("adds a row")).toEqual([4]);
    const once = plan();
    expect(takeover("adds a row")).toEqual([4]);
    expect(plan()).toBe(once);
    expect(rows()).toHaveLength(2);
  });

  it("addTakeoverTasks writes only the missing row when a run stopped after the plan write", () => {
    setup();
    takeover("adds a row");
    const once = plan();
    fs.writeFileSync(path.join(cwd, STATUS), "");
    expect(takeover("adds a row")).toEqual([3]);
    expect(plan()).toBe(once);
    expect(rows()).toEqual([expect.objectContaining({ task: 3, name: "adds a row" })]);
  });

  it("addTakeoverTasks puts a second contradiction into the same pending group", () => {
    setup();
    expect(takeover("adds a row")).toEqual([3]);
    expect(takeover("counts rows", null)).toEqual([4]);
    const text = plan();
    expect(text).not.toContain("<!-- bkit:group 4 start -->");
    expect(text).toContain("- [ ] **TASK 4:** Take over `counts rows` from TASK 1");
    expect(checkPlanText(text).problems).toEqual([]);
  });

  it("addTakeoverTasks writes a name holding backticks so the plan reads the same name back", () => {
    setup();
    const name = "ASK on `git reset HEAD~1 --soft` — all five hosts";
    expect(takeover(name)).toEqual([3]);
    const task3 = parsePlanBlocks(plan()).tasks.find((t) => t.task === 3)!;
    expect(task3.testFirst!.malformed).toEqual([]);
    expect(task3.testFirst!.tests.map((t) => [t.test, t.name])).toEqual([[TEST, name]]);
    const once = plan();
    expect(takeover(name)).toEqual([3]);
    expect(plan()).toBe(once);
  });

  it("addTakeoverTasks takes the matrix tier from the test file's name", () => {
    setup();
    takeover("adds a row", 2, "src/a.integration.test.ts");
    expect(plan()).toContain(
      "| Take over adds a row from TASK 1 | Integration | `src/a.integration.test.ts` | 3 |",
    );
  });

  it("tasks takeover refuses a call without --pending: steps finish adds the tasks", async () => {
    setup();
    const r = await run(["takeover", "--plan=plan.md", `--file=${STATUS}`]);
    expect(r.code).toBe(2);
    expect(plan()).toBe(PLAN);
  });

  it("tasks takeover --pending prints the group until its tests are recorded", async () => {
    setup();
    expect((await pending()).json).toEqual({ plan: "plan.md", pending: null });
    takeover("adds a row");
    expect((await pending()).json).toEqual({
      plan: "plan.md",
      pending: { group: 3, tasks: [3] },
    });
    fs.appendFileSync(
      path.join(cwd, STATUS),
      `${JSON.stringify({
        type: "step-done",
        workflow: "build",
        step: "build-tests-red",
        status: "DONE",
        group: 3,
        tests: [{ task: 3, test: TEST, testName: "adds a row", state: "red", blob: null }],
      })}\n`,
    );
    expect((await pending()).json).toEqual({ plan: "plan.md", pending: null });
  });
});
