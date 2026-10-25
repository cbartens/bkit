import * as fs from "node:fs";
import * as path from "node:path";

import { describe, expect, it } from "vitest";

import { parsePlanBlocks, reuseInventory } from "./plan-blocks";

const task = (n: number, body: string[] = [], tick = " ") => [
  `<!-- bkit:task ${n} start -->`,
  `- [${tick}] **TASK ${n}:** Task ${n} title.`,
  ...body,
  `<!-- bkit:task ${n} end -->`,
];
const group = (n: number, ...tasks: string[][]) => [
  `<!-- bkit:group ${n} start -->`,
  `### GROUP ${n}: Group ${n} title`,
  "",
  ...tasks.flatMap((t) => [...t, ""]),
  `<!-- bkit:group ${n} end -->`,
];
const lineOf = (lines: string[], text: string) => lines.indexOf(text) + 1;

describe("parsePlanBlocks", () => {
  it("DEPENDS ON reads bare task numbers, as the plan template writes them", () => {
    const body = (deps: string) => [
      `  - **DEPENDS ON:** ${deps}`,
      "  - **DONE WHEN:** done",
      "  - **TEST FIRST:** n/a — docs only",
    ];
    const lines = [
      ...group(1, task(1, body("none")), task(2, body("1")), task(3, body("1, 2"))),
      ...group(2, task(4, body("TASK 3 (its 2 fields)"))),
    ];
    const r = parsePlanBlocks(lines.join("\n"));
    expect(r.errors).toEqual([]);
    expect(r.tasks.map((t) => t.dependsOn)).toEqual([[], [1], [1, 2], [3]]);
  });

  it("parses groups and tasks in order", () => {
    const lines = [
      "# Plan",
      "",
      ...group(
        1,
        task(1, [
          "  - **UPDATE:** `landPr` in `src/ship.ts`: stop with exit 7",
          "  - **READ:** `unresolvedThreads` in `src/gh.ts`",
          "  - **DONE WHEN:** ship exits 7",
          "  - **TEST FIRST:**",
          "    - `src/ship.test.ts` `blocks on threads` fails on the merge going ahead",
        ]),
        task(2, [
          "  - **CREATE:** `countThreads` in `src/gh.ts`: count open threads",
          "  - **DEPENDS ON:** TASK 1",
          "  - **DONE WHEN:** count printed",
          "  - **TEST FIRST:** n/a — docs only",
        ]),
      ),
      "",
      ...group(
        2,
        task(
          3,
          [
            "  - **DELETE:** `oldGate` in `src/ship.ts`: replaced",
            "  - **DONE WHEN:** gone",
            "  - **TEST FIRST:**",
            "    - `src/ship.test.ts` `no old gate` fails on the old gate running",
          ],
          "x",
        ),
      ),
    ];
    const r = parsePlanBlocks(lines.join("\n"));
    expect(r.errors).toEqual([]);
    expect(r.groups.map((g) => [g.group, g.title, g.tasks.map((t) => t.task)])).toEqual([
      [1, "Group 1 title", [1, 2]],
      [2, "Group 2 title", [3]],
    ]);
    const [t1, t2, t3] = r.tasks;
    expect(t1).toMatchObject({
      task: 1,
      group: 1,
      title: "Task 1 title.",
      done: false,
      update: [{ symbol: "landPr", file: "src/ship.ts", what: "stop with exit 7" }],
      read: [{ symbol: "unresolvedThreads", file: "src/gh.ts", what: "" }],
      doneWhen: "ship exits 7",
      testFirst: {
        tests: [{ test: "src/ship.test.ts", name: "blocks on threads" }],
        malformed: [],
      },
    });
    expect(t2).toMatchObject({
      task: 2,
      create: [{ symbol: "countThreads", file: "src/gh.ts" }],
      dependsOn: [1],
      testFirst: { na: "docs only", tests: [] },
    });
    expect(t3).toMatchObject({ task: 3, group: 2, done: true, delete: [{ symbol: "oldGate" }] });
    expect(t1!.update[0]!.line).toBe(
      lineOf(
        lines,
        lines.find((l) => l.includes("UPDATE"))!,
      ),
    );
  });

  it("rejects a task outside a group", () => {
    const lines = ["# Plan", ...task(1, ["  - **DONE WHEN:** x"])];
    const r = parsePlanBlocks(lines.join("\n"));
    expect(r.errors).toEqual([
      expect.objectContaining({ line: 2, kind: "format", message: expect.stringMatching(/group/) }),
    ]);
  });

  it("rejects mismatched start and end markers", () => {
    const lines = [
      "<!-- bkit:group 1 start -->",
      "### GROUP 1: G",
      "<!-- bkit:task 3 start -->",
      "- [ ] **TASK 3:** T.",
      "  - **DONE WHEN:** x",
      "<!-- bkit:task 4 end -->",
      "<!-- bkit:group 1 end -->",
    ];
    const r = parsePlanBlocks(lines.join("\n"));
    expect(r.errors).toHaveLength(1);
    expect(r.errors[0]).toMatchObject({ line: 6, kind: "format" });
    expect(r.errors[0]!.message).toContain("line 3");
  });

  it("rejects a duplicate task number across groups", () => {
    const lines = [...group(1, task(4)), ...group(2, task(4))];
    const r = parsePlanBlocks(lines.join("\n"));
    expect(r.errors).toEqual([
      expect.objectContaining({
        line: lines.lastIndexOf("<!-- bkit:task 4 start -->") + 1,
        message: expect.stringContaining("TASK 4"),
      }),
    ]);
  });

  it("flags task-like text outside a block", () => {
    const lines = [
      "# Plan",
      "- [ ] **Task 7:** Old style.",
      "**DONE WHEN:** loose",
      "Prose naming `**TEST FIRST:**` in code is fine.",
      ...group(1, task(1, ["  - **DONE WHEN:** x", "  - **TEST FIRST:** n/a — docs"])),
    ];
    const r = parsePlanBlocks(lines.join("\n"));
    expect(r.errors.map((e) => [e.line, e.kind])).toEqual([
      [2, "stray"],
      [3, "stray"],
    ]);
  });

  it("ignores markers inside fenced code", () => {
    const lines = [
      "# Plan",
      "```markdown",
      ...group(9, task(9, ["  - **DONE WHEN:** example"])),
      "**Task 9:** example",
      "```",
      ...group(1, task(1, ["  - **DONE WHEN:** x"])),
    ];
    const r = parsePlanBlocks(lines.join("\n"));
    expect(r.errors).toEqual([]);
    expect(r.tasks.map((t) => t.task)).toEqual([1]);
  });

  it("parses the file-only form", () => {
    const lines = group(1, task(1, ["  - **UPDATE:** `docs/x.md`: add a section"]));
    const [t] = parsePlanBlocks(lines.join("\n")).tasks;
    expect(t!.update).toEqual([{ file: "docs/x.md", what: "add a section", line: 6 }]);
  });

  it("splits TEST FIRST into one test per sub-bullet", () => {
    const lines = group(
      1,
      task(1, [
        "  - **TEST FIRST:**",
        "    - `a.test.ts` `clamps low` fails on a low value; it passes through",
        "    - `a.test.ts` `clamps high` fails on a high value",
        "    - `b.test.ts` `stores` fails on no row",
      ]),
    );
    const [t] = parsePlanBlocks(lines.join("\n")).tasks;
    expect(t!.testFirst!.tests.map((x) => [x.test, x.name])).toEqual([
      ["a.test.ts", "clamps low"],
      ["a.test.ts", "clamps high"],
      ["b.test.ts", "stores"],
    ]);
  });

  it("rejects groups out of file order and tasks out of order within a group", () => {
    const lines = [
      ...group(2, task(3, ["  - **DONE WHEN:** x"])),
      ...group(1, task(1, ["  - **DONE WHEN:** x"]), task(2)),
      ...group(3, task(5), task(4)),
    ];
    const r = parsePlanBlocks(lines.join("\n"));
    expect(r.errors.map((e) => [e.line, e.message])).toEqual([
      [
        lineOf(lines, "<!-- bkit:group 1 start -->"),
        "GROUP 1 comes after GROUP 2; number groups in ascending order",
      ],
      [
        lineOf(lines, "<!-- bkit:task 4 start -->"),
        "TASK 4 comes after TASK 5; number tasks in ascending order",
      ],
    ]);
  });

  it("accepts a task numbered above the plan's highest inside an earlier group", () => {
    const lines = [...group(1, task(1), task(2), task(4)), ...group(2, task(3))];
    expect(parsePlanBlocks(lines.join("\n")).errors).toEqual([]);
  });

  it("rejects TASK 0 and GROUP 0", () => {
    const lines = group(0, task(0));
    const r = parsePlanBlocks(lines.join("\n"));
    expect(r.errors.map((e) => [e.line, e.message])).toEqual([
      [1, "GROUP 0: group numbers start at 1"],
      [lineOf(lines, "<!-- bkit:task 0 start -->"), "TASK 0: task numbers start at 1"],
    ]);
  });

  it("rejects a repeated single-valued field and keeps the first", () => {
    const lines = group(
      1,
      task(1, [
        "  - **DONE WHEN:** first",
        "  - **TEST FIRST:**",
        "    - `a.test.ts` `one` fails",
        "    - `a.test.ts` `two` fails",
        "  - **TEST FIRST:**",
        "    - `a.test.ts` `three` fails",
        "  - **DONE WHEN:** second",
        "  - **DEPENDS ON:** none",
        "  - **DEPENDS ON:** none",
        "  - **TEST EXCEPTION:** a",
        "  - **TEST EXCEPTION:** b",
        "  - **UPDATE:** `x` in `a.ts`: one",
        "  - **UPDATE:** `y` in `a.ts`: two",
      ]),
    );
    const r = parsePlanBlocks(lines.join("\n"));
    const twice = (label: string, first: number, again: number) => [
      again,
      `TASK 1: **${label}:** is written twice (first at line ${first}); write each field once`,
    ];
    expect(r.errors.map((e) => [e.line, e.message])).toEqual([
      twice("TEST FIRST", 7, 10),
      twice("DONE WHEN", 6, 12),
      twice("DEPENDS ON", 13, 14),
      twice("TEST EXCEPTION", 15, 16),
    ]);
    const [t] = r.tasks;
    expect(t!.doneWhen).toBe("first");
    expect(t!.testFirst!.tests.map((x) => x.name)).toEqual(["one", "two"]);
    expect(t!.testException!.text).toBe("a");
    expect(t!.update.map((u) => u.symbol)).toEqual(["x", "y"]);
  });

  it("rejects a second task line inside a task block", () => {
    const lines = group(
      1,
      task(1, [
        "  - **DONE WHEN:** first",
        "- [ ] **TASK 9:** Swallowed.",
        "  - **TEST FIRST:** n/a — docs",
      ]),
    );
    const r = parsePlanBlocks(lines.join("\n"));
    expect(r.errors.map((e) => [e.line, e.message])).toEqual([
      [
        lineOf(lines, "- [ ] **TASK 9:** Swallowed."),
        "TASK 1: a second task line inside its block; give that task its own `<!-- bkit:task N start -->` block",
      ],
    ]);
    expect(r.tasks.map((t) => t.task)).toEqual([1]);
  });

  it("reads a CRLF plan like an LF one", () => {
    const lines = group(1, task(1, ["  - **DONE WHEN:** x", "  - **TEST FIRST:** n/a — docs"]));
    const lf = parsePlanBlocks(lines.join("\n"));
    const crlf = parsePlanBlocks(lines.join("\r\n"));
    expect(crlf.errors).toEqual([]);
    expect(crlf.tasks.map((t) => [t.task, t.title, t.doneWhen])).toEqual([
      [1, "Task 1 title.", "x"],
    ]);
    expect(crlf.groups.map((g) => g.title)).toEqual(lf.groups.map((g) => g.title));
  });

  it("DEPENDS ON none followed by anything is no dependency", () => {
    const lines = group(1, task(1, ["  - **DEPENDS ON:** none (group 2 is independent)"]));
    expect(parsePlanBlocks(lines.join("\n")).tasks[0]!.dependsOn).toEqual([]);
  });

  it.each([
    ["GROUP 1 tasks", []],
    ["GROUP 1 tasks and 2", [2]],
    ["groups 1, 2 and 3", []],
    ["TASK 2 of GROUP 1", [2]],
  ])("DEPENDS ON %s never reads a group number as a task", (deps, want) => {
    const lines = group(1, task(1, [`  - **DEPENDS ON:** ${deps}`]));
    expect(parsePlanBlocks(lines.join("\n")).tasks[0]!.dependsOn).toEqual(want);
  });

  it("a fence line with an info string never closes an open fence", () => {
    const lines = [
      "```markdown",
      ...group(9, task(9, ["  - **DONE WHEN:** example"])),
      "```text",
      ...group(8, task(8, ["  - **DONE WHEN:** example"])),
      "```",
      ...group(1, task(1, ["  - **DONE WHEN:** x"])),
    ];
    const r = parsePlanBlocks(lines.join("\n"));
    expect(r.errors).toEqual([]);
    expect(r.tasks.map((t) => t.task)).toEqual([1]);
  });

  it("reports a code fence that never closes", () => {
    const lines = ["# Plan", "", "```text", ...group(1, task(1, ["  - **DONE WHEN:** x"]))];
    const r = parsePlanBlocks(lines.join("\n"));
    expect(r.tasks).toEqual([]);
    expect(r.fenceOpen).toBe(3);
    expect(r.errors).toEqual([
      {
        line: 3,
        kind: "format",
        message: "the code fence at line 3 is never closed; nothing after it is read",
      },
    ]);
  });

  it("has no file-system access", () => {
    const src = fs.readFileSync(path.join(__dirname, "plan-blocks.ts"), "utf-8");
    expect(src).not.toMatch(/from "node:fs"/);
  });
});

describe("reuseInventory", () => {
  it("reads the table under the Reuse Inventory heading, File paths and Decision", () => {
    const text = [
      "## Reuse Inventory",
      "",
      "| File | Decision |",
      "| --- | --- |",
      "| `./src/a.ts` | **NEW** |",
      "| `src/b.ts`, `src/c.ts` | EXTEND |",
    ].join("\r\n");
    expect(reuseInventory(text)).toEqual({
      head: ["| File | Decision |", "| --- | --- |"],
      rows: [
        { line: "| `./src/a.ts` | **NEW** |", files: ["src/a.ts"], decision: "**NEW**" },
        {
          line: "| `src/b.ts`, `src/c.ts` | EXTEND |",
          files: ["src/b.ts", "src/c.ts"],
          decision: "EXTEND",
        },
      ],
    });
  });

  it("never reads a table from a later section", () => {
    const text = ["## Reuse Inventory", "None.", "## Other", "| File |", "| --- |", "| `x` |"];
    expect(reuseInventory(text.join("\n"))).toBeNull();
  });
});
