import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { describe, expect, it } from "vitest";

import { declaredName, diffLines, testChange } from "./test-blocks";

/** `testChange` over the lines `git diff -U0` reports between the two texts. */
function change(before: string[], after: string[], want: string) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-test-blocks-"));
  fs.writeFileSync(path.join(dir, "a"), `${before.join("\n")}\n`);
  fs.writeFileSync(path.join(dir, "b"), `${after.join("\n")}\n`);
  const diff = spawnSync("git", ["diff", "--no-index", "--no-color", "-U0", "--", "a", "b"], {
    cwd: dir,
    encoding: "utf-8",
  }).stdout;
  fs.rmSync(dir, { recursive: true, force: true });
  return testChange(`${before.join("\n")}\n`, `${after.join("\n")}\n`, want, diffLines(diff));
}

const file = [
  'import { describe, expect, it } from "vitest";',
  'import { asPlan, other } from "./fixtures";',
  "",
  "function shape(text: string) {",
  "  return asPlan(text).groups;",
  "}",
  "",
  'describe("plans", () => {',
  "  beforeEach(() => {",
  "    reset();",
  "  });",
  "",
  '  it("reads one group", () => {',
  '    expect(shape("x")).toHaveLength(1);',
  "  });",
  "",
  '  it("reads two groups", () => {',
  '    expect(other("y")).toHaveLength(2);',
  "  });",
  "});",
  "",
  'describe("tasks", () => {',
  "  beforeEach(() => {",
  "    seed();",
  "  });",
  "",
  '  it("ticks one", () => {',
  "    expect(tick()).toBe(true);",
  "  });",
  "});",
];
const edit = (at: number, ...lines: string[]) => [
  ...file.slice(0, at),
  ...lines,
  ...file.slice(at + 1),
];
const insert = (at: number, ...lines: string[]) => [
  ...file.slice(0, at),
  ...lines,
  ...file.slice(at),
];

describe("testChange", () => {
  it("an edit to another test in the file is no change to this one", () => {
    const after = edit(17, '    expect(other("y")).toEqual([1, 2]);');
    expect(change(file, after, "reads one group")).toEqual({ body: false, runs: [] });
  });

  it("a new test and a new helper it does not call are no change", () => {
    const after = insert(
      19,
      "",
      '  it("reads three groups", () => {',
      "    expect(count()).toBe(3);",
      "  });",
    );
    const withHelper = [
      ...after.slice(0, 7),
      "function count() {",
      "  return 3;",
      "}",
      "",
      ...after.slice(7),
    ];
    expect(change(file, withHelper, "plans > reads one group")).toEqual({ body: false, runs: [] });
  });

  it("an edit to the test's own lines is a body change", () => {
    const after = edit(13, '    expect(shape("x")).toBeDefined();');
    expect(change(file, after, "reads one group")).toEqual({ body: true, runs: [] });
  });

  it("re-indenting the test alone is no change", () => {
    const after = [
      ...file.slice(0, 12),
      ...file.slice(12, 15).map((l) => `  ${l}`),
      ...file.slice(15),
    ];
    expect(change(file, after, "reads one group")?.body).toBe(false);
  });

  it("an edit to a helper the test calls, through another helper, is code it runs", () => {
    const after = edit(4, "  return asPlan(text.trim()).groups;");
    expect(change(file, after, "reads one group")).toEqual({
      body: false,
      runs: ["function shape(text: string) {"],
    });
  });

  it("an edit to that helper is no change to a test that never calls it", () => {
    const after = edit(4, "  return asPlan(text.trim()).groups;");
    expect(change(file, after, "reads two groups")).toEqual({ body: false, runs: [] });
  });

  it("an edit to its describe's hook is code it runs; another describe's hook is not", () => {
    const after = edit(23, "    seed(2);");
    expect(change(file, after, "ticks one")?.runs).toEqual(["beforeEach(() => {"]);
    expect(change(file, after, "reads one group")?.runs).toEqual([]);
  });

  it("an import the test uses is code it runs; one it never names is not", () => {
    const after = edit(1, 'import { asPlan, other } from "./fixtures.js";');
    expect(change(file, after, "reads one group")?.runs).toEqual([
      'import { asPlan, other } from "./fixtures";',
      'import { asPlan, other } from "./fixtures.js";',
    ]);
    const unused = insert(2, 'import { unused } from "./elsewhere";');
    expect(change(file, unused, "reads one group")?.runs).toEqual([]);
  });

  it("finds a test whose long name the formatter wrapped onto its own line", () => {
    const wrapped = [
      "it(",
      '  "a name long enough to wrap",',
      "  () => {",
      "    expect(1).toBe(1);",
      "  },",
      ");",
      'it("other", () => {});',
    ];
    const after = [...wrapped.slice(0, 3), "    expect(1).toBe(2);", ...wrapped.slice(4)];
    expect(change(wrapped, after, "a name long enough to wrap")?.body).toBe(true);
    expect(change(wrapped, after, "other")).toEqual({ body: false, runs: [] });
  });

  it("reads a pytest file: a fixture the test takes is code it runs", () => {
    const py = [
      "import pytest",
      "",
      "@pytest.fixture",
      "def db():",
      "    return {}",
      "",
      "def helper():",
      "    return 1",
      "",
      "def test_reads(db):",
      "    assert db == {}",
      "",
      "def test_other():",
      "    assert helper() == 1",
    ];
    const fixture = [...py.slice(0, 4), "    return {'a': 1}", ...py.slice(5)];
    expect(change(py, fixture, "test_reads")?.runs).toEqual(["def db():"]);
    const helperEdit = [...py.slice(0, 7), "    return 2", ...py.slice(8)];
    expect(change(py, helperEdit, "test_reads")).toEqual({ body: false, runs: [] });
  });

  it("returns null when the test is missing or declared twice", () => {
    expect(change(file, file, "no such test")).toBeNull();
    const twice = [...file, 'it("ticks two", () => {});', 'it("ticks two", () => {});'];
    expect(change(twice, twice, "ticks two")).toBeNull();
  });

  it("tells same-named tests apart by the describe the name gives", () => {
    const twice = [...file, 'describe("more", () => {', '  it("ticks one", () => {});', "});"];
    const after = edit(27, "    expect(tick()).toBe(false);");
    const twiceAfter = [...after, ...twice.slice(file.length)];
    expect(change(twice, twiceAfter, "tasks > ticks one")?.body).toBe(true);
    expect(change(twice, twiceAfter, "more > ticks one")).toEqual({ body: false, runs: [] });
  });
});

describe("diffLines", () => {
  it("reads removed and added lines from -U0 hunk headers", () => {
    const diff = ["@@ -3 +3,2 @@", "-a", "+b", "+c", "@@ -10,2 +11,0 @@", "-d", "-e"].join("\n");
    expect(diffLines(diff)).toEqual({ removed: [3, 10, 11], added: [3, 4] });
  });
});

describe("declaredName", () => {
  it("reads a test's name across runners", () => {
    expect(
      [
        'it("reads", () => {',
        "func TestReads(t *testing.T) {",
        "def test_reads(db):",
        "const x = 1;",
      ].map(declaredName),
    ).toEqual(["reads", "TestReads", "test_reads", null]);
  });
});
