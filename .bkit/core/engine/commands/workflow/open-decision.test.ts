import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import {
  decisionHeader,
  decisionItems,
  gateRerun,
  openDecision,
  optionAnswer,
  parseDecisionItems,
  pauseStatus,
  skipProblem,
  statusOf,
  undecidedBesidesLoop,
} from "./open-decision.js";

const tmpDirs: string[] = [];
afterEach(() => {
  for (const d of tmpDirs.splice(0)) fs.rmSync(d, { recursive: true, force: true });
});

/** The orchestrator's decision file: its header, no `Status`, `Source changed` or `Gate`, and its questions from Q2. */
const orchestratorFile = (o: { answer?: string | null; from?: string } = {}) =>
  [
    "Question: CHALLENGE",
    `From: ${o.from ?? "verify"}`,
    "Group: 1",
    "",
    "**Q2 — Task 3 [src/a.ts:10]:** MEDIUM: the retry has no cap. Accept it?",
    "A) Accept — the item is recorded as accepted",
    "B) Fix now — a fix task is added to the plan",
    "Recommended: A) Accept — the caller already caps it",
    "Default if unanswered: the run waits for you; taken as A when nobody can be asked",
    ...(o.answer === null || o.answer === undefined ? [] : [`Decision: ${o.answer}`]),
    "",
  ].join("\n");

/** A log folder holding `build-decision-1-1.md`. */
function pauseDir(orchestrator: string) {
  const tree = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-open-decision-"));
  tmpDirs.push(tree);
  const logDir = path.join(tree, "logs");
  fs.mkdirSync(logDir);
  fs.writeFileSync(path.join(logDir, "build-decision-1-1.md"), orchestrator);
  const rel = "logs/build-decision-1-1.md";
  const read = (r: string) => {
    const f = path.join(tree, r);
    return fs.existsSync(f) ? fs.readFileSync(f, "utf-8") : null;
  };
  return { tree, logDir, rel, read };
}

const ROW_FILE = "logs/build-decision-1-1.md";
/** The loop question a `decision-counts` row holds. */
const LOOP_QUESTION = {
  title: "Verify",
  options: ["Try again", "Decide"],
  recommended: "Decide",
  reason: "another round is unlikely to help",
};
const statusRow = (type: string, o: Record<string, unknown>) => ({
  type,
  workflow: "build",
  at: "2026-11-01T00:00:00Z",
  file: ROW_FILE,
  ...o,
});
/** The `decision-counts` row `decisions counts` appends for the pause above. */
const countsRow = (o: Record<string, unknown> = {}) =>
  statusRow("decision-counts", { sourceChanged: false, gate: "FAIL", loop: LOOP_QUESTION, ...o });
/** A `decision-answer` row for question `q`. */
const answerRow = (q: number, answer: string, o: Record<string, unknown> = {}) =>
  statusRow("decision-answer", { q, answer, by: "owner", ...o });
/**
 * Run 1's `workflow-started` row. `marked` = it carries `decisionLayout: "rows"`, which this
 * engine writes; without it, the run started before the marker existed.
 */
const startRow = (marked: boolean) => ({
  type: "workflow-started",
  workflow: "build",
  at: "2026-10-31T00:00:00Z",
  ...(marked ? { decisionLayout: "rows" } : {}),
});
/** A log folder holding `build-decision-1-1.md` and the run's `status.jsonl` with `rows`. */
function rowDir(orchestrator: string, rows: object[]) {
  const dir = pauseDir(orchestrator);
  fs.writeFileSync(
    path.join(dir.logDir, "status.jsonl"),
    rows.map((r) => JSON.stringify(r)).join("\n") + "\n",
  );
  return dir;
}

/** A pause file: its header lines, the loop question when `loop` is given, then one gap item. */
const pause = (o: { headers: string[]; loop?: string | null; answer?: string | null }) =>
  [
    ...o.headers,
    "",
    ...(o.loop === undefined
      ? []
      : [
          "## Progress",
          "",
          "**Q1 — Verify loop:** decide the items below instead of another round?",
          "A) Try again — another fix round runs",
          "B) Decide — the questions below are asked instead of another round",
          "Recommended: B) Decide — another round is unlikely to help",
          ...(o.loop === null ? [] : [`Decision: ${o.loop}`]),
          "",
        ]),
    "**Q2 — Task 3 [src/a.ts:10]:** MEDIUM: the retry has no cap. Accept it?",
    "A) Accept — the item is recorded as accepted",
    "B) Fix now — a fix task is added to the plan",
    "Recommended: A) Accept — the caller already caps it",
    ...(o.answer === null ? [] : [`Decision: ${o.answer ?? "Accept — the caller caps it"}`]),
    "",
  ].join("\n");

const SETTLED = ["Status: DECIDED", "From: verify", "Group: 1", "Source changed: false"];

describe("decision file readers", () => {
  it("decisionHeader reads the header block only, first value winning", () => {
    const text = pause({ headers: [...SETTLED, "From: tests"], answer: "Gate: FAIL" });
    expect(decisionHeader(text)).toEqual({
      Status: "DECIDED",
      From: "verify",
      Group: "1",
      "Source changed": "false",
    });
  });

  it("parseDecisionItems reads each item's number, title and answer", () => {
    const items = parseDecisionItems(pause({ headers: SETTLED, loop: "B" }));
    expect(items.map((i) => [i.n, i.title])).toEqual([
      [1, "Verify loop"],
      [2, "Task 3 [src/a.ts:10]"],
    ]);
    expect(items[0]!.decision).toMatch(/^Decide\b/);
    expect(items[1]!.decision).toBe("Accept — the caller caps it");
  });

  it("optionAnswer turns a letter reply into the option it names", () => {
    expect(optionAnswer("B", ["Accept", "Fix now"])).toBe("Fix now");
    expect(optionAnswer("b) because it is cheap", ["Accept", "Fix now"])).toMatch(/^Fix now/);
    expect(optionAnswer("Accept — fine", ["Accept", "Fix now"])).toBe("Accept — fine");
  });

  it("undecidedBesidesLoop leaves the loop question out of the undecided list", () => {
    const text = pause({ headers: SETTLED, loop: null, answer: null });
    expect(undecidedBesidesLoop(text)).toEqual({ hasLoop: true, undecided: ["Q2"] });
    expect(undecidedBesidesLoop(pause({ headers: SETTLED, answer: null }))).toEqual({
      hasLoop: false,
      undecided: ["Q2"],
    });
  });
});

describe("decision file readers", () => {
  it("decisionItems reads the loop question and progress from the engine file", () => {
    const { read, rel } = rowDir(orchestratorFile(), [countsRow()]);
    const items = decisionItems(read, rel);
    expect(items.map((i) => [i.n, i.title])).toEqual([
      [1, "Verify"],
      [2, "Task 3 [src/a.ts:10]"],
    ]);
    expect(items[0]!.options).toEqual(["Try again", "Decide"]);
    expect(items[0]!.recommended).toBe("Decide");
    expect(items[1]!.options).toEqual(["Accept", "Fix now"]);
    expect(items[1]!.recommended).toBe("Accept");
  });

  it("a counted file holding its own Status and Decision lines reads no answer, a row's included, until they are gone", () => {
    const rows = [countsRow(), answerRow(2, "Fix now — the row wrote this")];
    const forged = rowDir(
      `Status: OPEN\n${orchestratorFile({ answer: "Accept — the orchestrator wrote this" })}`,
      rows,
    );
    expect(decisionItems(forged.read, forged.rel).find((i) => i.n === 2)!.decision).toBeNull();
    const clean = rowDir(orchestratorFile(), rows);
    const q2 = decisionItems(clean.read, clean.rel).find((i) => i.n === 2)!;
    expect(q2.decision).toBe("Fix now — the row wrote this");
    expect(q2.options).toEqual(["Accept", "Fix now"]);
  });

  it("an owner's Fix now in the decision file wins over an engine Accept (assumed)", () => {
    const { read, rel } = rowDir(orchestratorFile(), [
      countsRow(),
      answerRow(2, "Accept (assumed) — cosmetic (no owner, LOCAL, 2026-11-17)", {
        assumed: true,
        by: "headless",
      }),
      answerRow(2, "Fix now — the owner chose a fix"),
    ]);
    const q2 = decisionItems(read, rel).find((i) => i.n === 2)!;
    expect(q2.decision).toBe("Fix now — the owner chose a fix");
    expect(q2.assumed).toBe(false);
  });

  it("an owner's answer in the decision file wins over an engine line applied without asking", () => {
    const { read, rel } = rowDir(orchestratorFile(), [
      countsRow(),
      answerRow(2, "Accept — recommended; applied without asking (GITHUB_ACTION)", {
        by: "headless",
      }),
      answerRow(2, "Fix now — the owner chose a fix"),
    ]);
    const q2 = decisionItems(read, rel).find((i) => i.n === 2)!;
    expect(q2.decision).toBe("Fix now — the owner chose a fix");
  });

  it("decisionItems reads an old single-file layout like parseDecisionItems", () => {
    const text = pause({ headers: SETTLED, loop: "B" });
    const { read, rel } = rowDir(text, [startRow(false)]);
    expect(decisionItems(read, rel)).toEqual(parseDecisionItems(text));
  });

  it("openDecision reads Gate and Source changed from the engine file's header", () => {
    const { tree, logDir } = rowDir(orchestratorFile(), [countsRow({ sourceChanged: true })]);
    const open = openDecision(logDir, tree, "build", 1);
    expect(open).toMatchObject({
      file: "logs/build-decision-1-1.md",
      from: "verify",
      question: "CHALLENGE",
      group: 1,
      gate: "FAIL",
      sourceChanged: "true",
      status: "OPEN",
      counted: true,
    });
  });

  it("a pause whose loop answer is Try again reads DECIDED", () => {
    const { tree, logDir, rel } = rowDir(orchestratorFile(), [
      countsRow(),
      answerRow(1, "Try again — one more round"),
    ]);
    expect(openDecision(logDir, tree, "build", 1, [rel])).toBeNull();
    // The same pause with its loop question unanswered is still open.
    const unanswered = rowDir(orchestratorFile(), [countsRow()]);
    expect(
      openDecision(unanswered.logDir, unanswered.tree, "build", 1, [unanswered.rel]),
    ).toMatchObject({
      status: "OPEN",
    });
  });
});

describe("gateRerun", () => {
  it("re-runs a red-gate pause laid out in two files", () => {
    const orchestrator = ["Question: VERIFY_GAPS", "From: verify", "Group: 1", ""].join("\n");
    // `decisions counts` offers `Stop` in place of `Decide` when the file holds no item.
    const loop = { ...LOOP_QUESTION, options: ["Try again", "Stop"], recommended: "Stop" };
    const { tree, logDir, read, rel } = rowDir(orchestrator, [countsRow({ loop })]);
    const open = openDecision(logDir, tree, "build", 1);
    expect(open).not.toBeNull();
    expect(gateRerun(open, read, rel)).toEqual({ gateRerun: true, rerunFrom: "verify" });
  });

  const red = { gate: "FAIL", status: "OPEN", from: "holistic" };
  const loopOnly = pause({ headers: ["Status: OPEN", "From: holistic"], loop: null });

  it("is true for an open red-gate pause whose only undecided question is the loop question", () => {
    expect(gateRerun(red, loopOnly)).toEqual({ gateRerun: true, rerunFrom: "holistic" });
  });

  it.each([
    ["a gate that is not red", { ...red, gate: "PASS" }, loopOnly],
    ["a pause that is not open", { ...red, status: "DECIDED" }, loopOnly],
    ["a From that re-runs nothing", { ...red, from: "challenge" }, loopOnly],
    [
      "an undecided item beside the loop question",
      red,
      pause({ headers: [], loop: null, answer: null }),
    ],
    ["a pause with no loop question", red, pause({ headers: [] })],
    ["no open pause", null, loopOnly],
  ])("is false for %s", (_name, open, text) => {
    expect(gateRerun(open, text)).toEqual({ gateRerun: false, rerunFrom: null });
  });
});

describe("skipProblem", () => {
  it("reads Source changed and the loop answer from the engine file", () => {
    const orchestrator = orchestratorFile();
    const decided = rowDir(orchestrator, [
      countsRow({ gate: undefined }),
      answerRow(2, "Accept — the caller caps it"),
      answerRow(1, "Decide"),
    ]);
    expect(skipProblem(decided.read, decided.rel)).toBeNull();
    const again = rowDir(orchestrator, [
      countsRow({ gate: undefined }),
      answerRow(2, "Accept — the caller caps it"),
      answerRow(1, "Try again"),
    ]);
    expect(skipProblem(again.read, again.rel)).toBe(
      'the loop question Q1 is "Try again", not Decide',
    );
  });

  it("an old file keeps its Source changed header after a ship row names it", () => {
    const { read, rel } = rowDir(oldFile({ q2: "Accept — the id is above" }), [
      startRow(false),
      answerRow(1, "Accept — the owner confirmed it", { workflow: "ship" }),
    ]);
    expect(skipProblem(read, rel)).toBeNull();
  });

  it("is null when all five conditions hold", () => {
    expect(skipProblem(pause({ headers: SETTLED, loop: "B" }))).toBeNull();
    expect(skipProblem(pause({ headers: SETTLED }))).toBeNull();
  });

  it.each([
    ["no From header", { headers: ["Status: DECIDED", "Source changed: false"] }],
    [
      'From is "tests", not verify or holistic',
      { headers: ["From: tests", "Source changed: false"] },
    ],
    ['Q2 is "Fix now — do it", not Accept', { headers: SETTLED, answer: "Fix now — do it" }],
    ["Q2 is undecided, not Accept", { headers: SETTLED, answer: null }],
    ['the loop question Q1 is "Try again", not Decide', { headers: SETTLED, loop: "A" }],
    ["Gate: FAIL header: the gate is red", { headers: [...SETTLED, "Gate: FAIL"] }],
    ["no Source changed header", { headers: ["Status: DECIDED", "From: holistic"] }],
    [
      'Source changed is "true", not false',
      { headers: ["From: holistic", "Source changed: true"] },
    ],
  ])("names the first failing fact: %s", (problem, o) => {
    expect(skipProblem(pause(o))).toBe(problem);
  });
});

/** An old verify decision file: its Status, From, Group and Source changed headers, then Q1 and Q2 each decided in the file. */
const oldFile = (o: { q1?: string | null; q2?: string | null } = {}) =>
  [
    "Question: CHALLENGE",
    "Status: DECIDED",
    "From: verify",
    "Group: 1",
    "Source changed: false",
    "",
    "**Q1 — Task 3 [src/a.ts:10]:** MEDIUM: the retry has no cap. Accept it?",
    "A) Accept — the item is recorded as accepted",
    "B) Fix now — a fix task is added to the plan",
    "Recommended: A) Accept — the caller already caps it",
    ...(o.q1 === null ? [] : [`Decision: ${o.q1 ?? "Accept (assumed) — the caller caps it"}`]),
    "",
    "**Q2 — Task 4 [src/b.ts:20]:** MEDIUM: the log line has no id. Accept it?",
    "A) Accept — the item is recorded as accepted",
    "B) Fix now — a fix task is added to the plan",
    "Recommended: A) Accept — the id is in the line above",
    ...(o.q2 === null ? [] : [`Decision: ${o.q2 ?? "Accept (assumed) — the id is above"}`]),
    "",
  ].join("\n");

describe("decision rows", () => {
  it("an old file keeps the in-file answers of questions no row names after ship confirms one", () => {
    const { read, rel } = rowDir(oldFile(), [
      startRow(false),
      answerRow(1, "Accept — the owner confirmed it", { by: "owner", workflow: "ship" }),
    ]);
    const items = decisionItems(read, rel);
    const q1 = items.find((i) => i.n === 1)!;
    const q2 = items.find((i) => i.n === 2)!;
    expect(q1.decision).toBe("Accept — the owner confirmed it");
    expect(q2.decision).toBe("Accept (assumed) — the id is above");
    expect(q2.assumed).toBe(true);
  });

  it("a recommendation naming an option that starts with None is that option, not a hard blocker", () => {
    const text = [
      "From: verify",
      "",
      "**Q2 — Gap 1:** change anything?",
      "A) None needed — nothing changes and the build moves on",
      "B) Fix now — one more fix round runs",
      "Recommended: A) None needed — the gap is cosmetic",
      "",
      "**Q3 — Gap 2:** who decides?",
      "A) Accept — the item is recorded as accepted",
      "B) Stop — the run stops",
      "Recommended: none — only the owner knows",
      "",
    ].join("\n");
    const [named, blocker] = parseDecisionItems(text);
    expect(named).toMatchObject({ n: 2, recommended: "None needed" });
    expect(blocker).toMatchObject({ n: 3, recommended: null });
  });

  it("an orchestrator question answered Try again leaves the pause open while another question waits", () => {
    const text = [
      orchestratorFile().replace(
        "B) Fix now — a fix task is added to the plan",
        "B) Try again — one more round runs",
      ),
      "**Q3 — Task 4 [src/b.ts:2]:** HIGH: the token is logged. Accept it?",
      "A) Accept — the item is recorded as accepted",
      "B) Fix now — a fix task is added to the plan",
      "Recommended: B) Fix now — a secret reaches the log",
      "Default if unanswered: the run waits for you; taken as B when nobody can be asked",
      "",
    ].join("\n");
    expect(text).toContain("B) Try again — one more round runs");
    const { read, rel } = rowDir(text, [
      countsRow({ loop: undefined }),
      answerRow(2, "Try again — one more round"),
    ]);
    expect(pauseStatus(read, rel)).toBe("OPEN");
  });

  it("a decision file with CRLF line endings reads its header, items and Status like LF", () => {
    const lf = oldFile({ q1: "Accept — the caller caps it", q2: "B" });
    const crlf = lf.replace(/\n/g, "\r\n");
    expect(crlf).toContain("From: verify\r\n");
    expect(decisionHeader(crlf)).toEqual(decisionHeader(lf));
    const strip = (t: string) => parseDecisionItems(t).map(({ text: _text, ...rest }) => rest);
    expect(strip(crlf)).toEqual(strip(lf));
    expect(pauseStatus(crlf)).toBe("DECIDED");
    expect(skipProblem(crlf)).toBe(skipProblem(lf));
  });

  it("a counted file's Status and Decision lines are not answers: skip, pause status and items read it open", () => {
    const text = `Status: DECIDED\n${orchestratorFile({ answer: "Accept — fine" })}`;
    const { read, rel, tree, logDir } = rowDir(text, [countsRow({ gate: undefined })]);
    expect(decisionItems(read, rel).find((i) => i.n === 2)!.decision).toBeNull();
    expect(pauseStatus(read, rel)).toBe("OPEN");
    expect(openDecision(logDir, tree, "build", 1)).toMatchObject({ status: "OPEN" });
    expect(skipProblem(read, rel)).toBe("Q2 is undecided, not Accept");
  });

  it("the row appended last wins even when its at is earlier", () => {
    const { read, rel } = rowDir(orchestratorFile(), [
      countsRow(),
      answerRow(2, "Accept — appended first, dated later", { at: "2026-11-02T00:00:00Z" }),
      answerRow(2, "Fix now — appended last, dated earlier", { at: "2026-11-01T00:00:00Z" }),
    ]);
    const q2 = decisionItems(read, rel).find((i) => i.n === 2)!;
    expect(q2.decision).toBe("Fix now — appended last, dated earlier");
  });

  it("a Decision line in a file with no Status header is not read as an answer", () => {
    const { read, rel } = rowDir(orchestratorFile({ answer: "Accept — pasted into the file" }), [
      countsRow(),
    ]);
    const q2 = decisionItems(read, rel).find((i) => i.n === 2)!;
    expect(q2.decision).toBeNull();
  });

  it("a file with a Gate header, a Decision line and no rows reads no answer", () => {
    const text = orchestratorFile({ answer: "Accept — pasted into the file" }).replace(
      /^Status:.*\n/m,
      "",
    );
    const { read, rel } = rowDir(`Gate: FAIL\n${text}`, []);
    expect(decisionItems(read, rel).find((i) => i.n === 2)!.decision).toBeNull();
  });

  it("a no-question file reads OPEN whatever Status line it carries", () => {
    const text = ["Question: CHALLENGE", "Status: DECIDED", "From: verify", "Group: 1", ""].join(
      "\n",
    );
    const { read, rel, tree, logDir } = rowDir(text, []);
    expect(pauseStatus(read, rel)).toBe("OPEN");
    expect(openDecision(logDir, tree, "build", 1)).toMatchObject({ status: "OPEN", questions: 0 });
  });

  it("a loop pause whose questions decisions check refuses resumes to Decision Pause step 2, not a gate re-run", () => {
    const refused = orchestratorFile({ from: "verify" }).replace("**Q2 — ", "**Q2 \u2013 ");
    expect(refused).toContain("**Q2 \u2013 Task 3");
    const { tree, logDir, read, rel } = rowDir(refused, [countsRow()]);
    const open = openDecision(logDir, tree, "build", 1);
    expect(open).toMatchObject({ from: "verify", gate: "FAIL", status: "OPEN" });
    expect(open?.questions).toBe(0);
    expect(gateRerun(open, read, rel)).toEqual({ gateRerun: false, rerunFrom: null });
  });

  it("an old file in a run started before the marker keeps the in-file answers of questions a build row does not name", () => {
    const { read, rel } = rowDir(oldFile(), [
      startRow(false),
      answerRow(1, "Accept — the owner confirmed it", { by: "owner" }),
    ]);
    const items = decisionItems(read, rel);
    expect(items.find((i) => i.n === 1)!.decision).toBe("Accept — the owner confirmed it");
    expect(items.find((i) => i.n === 2)!.decision).toBe("Accept (assumed) — the id is above");
    expect(pauseStatus(read, rel)).toBe("ASSUMED");
  });

  it("a half-answered old file keeps its in-file answer after the owner answers the other question", () => {
    const { read, rel } = rowDir(oldFile({ q2: null }), [
      startRow(false),
      answerRow(2, "Fix now — the owner chose a fix", { by: "owner" }),
    ]);
    const items = decisionItems(read, rel);
    expect(items.find((i) => i.n === 1)!.decision).toBe("Accept (assumed) — the caller caps it");
    expect(items.find((i) => i.n === 2)!.decision).toBe("Fix now — the owner chose a fix");
    expect(pauseStatus(read, rel)).toBe("ASSUMED");
  });

  /** A 6.2.0 red-gate pause in flight: the loop question in the file, Q2 answered in the file. */
  const inFlight = pause({
    headers: ["Question: VERIFY_GAPS", "Status: OPEN", "From: verify", "Group: 1", "Gate: FAIL"],
    loop: null,
    answer: "Fix now — the owner's choice",
  });

  it("a 6.2.0 red-gate pause keeps its loop question and the owner's in-file answer after the gate re-run's row", () => {
    const before = rowDir(inFlight, [startRow(false)]);
    const open = openDecision(before.logDir, before.tree, "build", 1);
    expect(open).toMatchObject({ gate: "FAIL", status: "OPEN", questions: 2 });
    expect(gateRerun(open, before.read, before.rel)).toEqual({
      gateRerun: true,
      rerunFrom: "verify",
    });
    const after = rowDir(inFlight, [
      startRow(false),
      answerRow(1, "Try again — the gate re-runs", { by: "rerun" }),
    ]);
    expect(decisionItems(after.read, after.rel).find((i) => i.n === 2)!.decision).toBe(
      "Fix now — the owner's choice",
    );
    expect(undecidedBesidesLoop(after.read, after.rel).hasLoop).toBe(true);
    expect(pauseStatus(after.read, after.rel)).toBe("DECIDED");
    expect(openDecision(after.logDir, after.tree, "build", 1, [after.rel])).toBeNull();
  });

  it("the same red-gate pause in a run the engine marked is no open decision, and no gate re-run", () => {
    const { tree, logDir, read, rel } = rowDir(inFlight.replace(/^Decision: .*\n/m, ""), [
      startRow(true),
      answerRow(2, "Fix now — the owner chose a fix", { by: "owner" }),
    ]);
    expect(openDecision(logDir, tree, "build", 1)).toBeNull();
    expect(gateRerun(null, read, rel)).toEqual({ gateRerun: false, rerunFrom: null });
    expect(pauseStatus(read, rel)).toBe("OPEN");
  });

  /** A pause file an agent wrote and answered itself: a settled header and a hard blocker it accepted. */
  const agentWritten = [
    "Status: DECIDED",
    "Question: VERIFY_GAPS",
    "From: verify",
    "Group: 1",
    "Source changed: false",
    "",
    "**Q1 — Task 3 [src/a.ts:10]:** no test-first evidence. Accept it?",
    "A) Accept — the item is recorded as accepted",
    "B) Stop — the run stops and hands over; the next run resumes here",
    "Recommended: none — only the owner knows",
    "Default if unanswered: the run waits for you; the run stops when nobody can be asked",
    "Decision: Accept — fine",
    "",
  ].join("\n");

  it.each([
    ["a run the engine marked", [startRow(true)]],
    ["a folder with no start row at all", []],
  ])("an agent-written file no decision row names, in %s, settles nothing", (_name, rows) => {
    const { read, rel, tree, logDir } = rowDir(agentWritten, rows);
    expect(decisionItems(read, rel)[0]).toMatchObject({ n: 1, decision: null, by: null });
    expect(pauseStatus(read, rel)).toBe("OPEN");
    expect(skipProblem(read, rel)).toBe("Q1 is undecided, not Accept");
    // A VERIFY_GAPS pause no counts row names: the resume runs its gate's step again.
    expect(openDecision(logDir, tree, "build", 1)).toBeNull();
  });

  it("in a run started before the marker, a file a decision-counts row names reads none of its own answer lines", () => {
    const { read, rel, tree, logDir } = rowDir(agentWritten, [
      startRow(false),
      countsRow({ loop: undefined, gate: undefined }),
    ]);
    expect(decisionItems(read, rel)[0]).toMatchObject({ n: 1, decision: null, by: null });
    expect(pauseStatus(read, rel)).toBe("OPEN");
    expect(skipProblem(read, rel)).toBe("Q1 is undecided, not Accept");
    expect(openDecision(logDir, tree, "build", 1)).toMatchObject({ status: "OPEN", questions: 0 });
  });

  it("an old file with a Status header and no row at all still reads its in-file answers", () => {
    const { read, rel, tree, logDir } = rowDir(oldFile({ q2: null }), [startRow(false)]);
    expect(decisionItems(read, rel).find((i) => i.n === 1)!.decision).toMatch(
      /^Accept \(assumed\)/,
    );
    expect(pauseStatus(read, rel)).toBe("DECIDED");
    expect(openDecision(logDir, tree, "build", 1)).toMatchObject({
      status: "DECIDED",
      questions: 2,
    });
  });

  /** A pause file asking `question`, numbered from `first`, as Decision Pause step 2 writes it. */
  const written = (question: string, from: string, first: number) =>
    orchestratorFile({ from })
      .replace("Question: CHALLENGE", `Question: ${question}`)
      .replace("**Q2 — ", `**Q${first} — `);

  it.each([
    ["VERIFY_GAPS", "verify", 2],
    ["VERIFY_GAPS", "holistic", 1],
    ["TESTS_LOOP", "tests", 2],
  ])(
    "a %s pause from %s that no decision-counts row names is not the open decision: its gate's step writes it again",
    (question, from, first) => {
      const { tree, logDir } = rowDir(written(question, from, first), [startRow(true)]);
      expect(openDecision(logDir, tree, "build", 1)).toBeNull();
    },
  );

  it.each([
    ["CHALLENGE", "challenge"],
    ["CHANGED_TESTS", "summary"],
    ["UNPROVEN", "summary"],
  ])(
    "a %s pause that no decision-counts row names is still the open decision, counted false",
    (question, from) => {
      const { tree, logDir } = rowDir(written(question, from, 1), [startRow(true)]);
      expect(openDecision(logDir, tree, "build", 1)).toMatchObject({
        question,
        status: "OPEN",
        questions: 0,
        counted: false,
      });
    },
  );

  it("an uncounted loop pause above a counted open one leaves the counted one as the open decision", () => {
    const { tree, logDir } = rowDir(written("VERIFY_GAPS", "verify", 2), [
      startRow(true),
      countsRow(),
    ]);
    fs.writeFileSync(
      path.join(logDir, "build-decision-1-2.md"),
      written("VERIFY_GAPS", "verify", 2),
    );
    expect(openDecision(logDir, tree, "build", 1)).toMatchObject({
      file: "logs/build-decision-1-1.md",
      counted: true,
    });
  });

  it("an old VERIFY_GAPS file with no readable question is not the open decision", () => {
    const text = ["Question: VERIFY_GAPS", "Status: OPEN", "From: verify", "Group: 1", ""].join(
      "\n",
    );
    const { tree, logDir } = rowDir(text, [startRow(false)]);
    expect(openDecision(logDir, tree, "build", 1)).toBeNull();
  });

  it("an old VERIFY_GAPS file no decision-counts row names is still the open decision", () => {
    const text = oldFile({ q2: null }).replace("Question: CHALLENGE", "Question: VERIFY_GAPS");
    const { tree, logDir } = rowDir(text.replace("Status: DECIDED", "Status: OPEN"), [
      startRow(false),
    ]);
    expect(openDecision(logDir, tree, "build", 1)).toMatchObject({
      status: "OPEN",
      counted: false,
    });
  });

  it("a decision file with no readable question reads OPEN with questions 0", () => {
    expect(statusOf([])).toBe("OPEN");
    const empty = ["Question: CHALLENGE", "From: verify", "Group: 1", ""].join("\n");
    const { tree, logDir } = rowDir(empty, []);
    expect(openDecision(logDir, tree, "build", 1)).toMatchObject({
      status: "OPEN",
      questions: 0,
    });
  });
});
