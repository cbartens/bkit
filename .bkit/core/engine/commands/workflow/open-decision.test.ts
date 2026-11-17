import { describe, expect, it } from "vitest";

import {
  decisionHeader,
  gateRerun,
  optionAnswer,
  parseDecisionItems,
  skipProblem,
  undecidedBesidesLoop,
} from "./open-decision.js";

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

describe("gateRerun", () => {
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
