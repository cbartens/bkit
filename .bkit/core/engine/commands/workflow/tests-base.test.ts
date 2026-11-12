import { describe, expect, it } from "vitest";

import { baseVerdict, caseFile } from "./tests-base";
import type { JunitCase } from "./junit";

const failing = (over: Partial<JunitCase>): JunitCase => ({
  name: "case",
  state: "failure",
  classname: null,
  file: null,
  message: "",
  detail: "",
  ...over,
});

type AtBase = "red" | "pass" | "absent" | "unknown";
const row = (name: string, atBase: AtBase, file: string | null = "tests/a.test.ts") => ({
  name,
  file,
  atBase,
});

describe("baseVerdict", () => {
  it("all when every failing case also fails at base", () => {
    const v = baseVerdict([row("a", "red"), row("b", "red"), row("c", "red", "tests/b.test.ts")]);
    expect(v).toMatchObject({
      verdict: "all",
      reason: null,
      failing: 3,
      baseRed: 3,
      branch: 0,
      undetermined: 0,
    });
  });

  it("some with the base-red and branch counts", () => {
    const v = baseVerdict([
      row("a", "red"),
      row("b", "red"),
      row("c", "red"),
      row("d", "pass"),
      row("e", "absent", "tests/new.test.ts"),
    ]);
    expect(v).toMatchObject({
      verdict: "some",
      reason: null,
      failing: 5,
      baseRed: 3,
      branch: 2,
      undetermined: 0,
    });
  });

  it("none when each case passes, is absent, or its file is absent at base", () => {
    const v = baseVerdict([
      row("a", "pass"),
      row("b", "absent"),
      row("c", "absent", "tests/new.test.ts"),
    ]);
    expect(v).toMatchObject({
      verdict: "none",
      reason: null,
      failing: 3,
      baseRed: 0,
      branch: 3,
      undetermined: 0,
    });
  });

  it("unknown with a reason when no case is base-red and one is undetermined", () => {
    const v = baseVerdict([row("a", "pass"), row("b", "unknown", null)]);
    expect(v.verdict).toBe("unknown");
    expect(v.baseRed).toBe(0);
    expect(v.undetermined).toBe(1);
    expect(typeof v.reason).toBe("string");
    expect(v.reason).toContain("1");
  });

  it("some with an undetermined case names it in the reason", () => {
    const v = baseVerdict([row("a", "red"), row("b", "pass"), row("c", "unknown", null)]);
    expect(v).toMatchObject({
      verdict: "some",
      failing: 3,
      baseRed: 1,
      branch: 1,
      undetermined: 1,
    });
    expect(typeof v.reason).toBe("string");
    expect(v.reason).toContain("1");
  });

  it("unknown when a red gate has no failing case", () => {
    const v = baseVerdict([]);
    expect(v.verdict).toBe("unknown");
    expect(v.reason).toBe("gate red with no failing test case");
    expect(v.failing).toBe(0);
  });
});

describe("caseFile", () => {
  const tracked = [
    "src/a.test.ts",
    "test/b.test.ts",
    "tests/bats/c.bats",
    "pkg1/dup.test.ts",
    "pkg2/dup.test.ts",
  ];

  it("resolves from file, then a classname path, then one matching tracked basename", () => {
    expect(caseFile(failing({ file: "src/a.test.ts", classname: "other" }), tracked)).toBe(
      "src/a.test.ts",
    );
    expect(caseFile(failing({ file: null, classname: "test/b.test.ts" }), tracked)).toBe(
      "test/b.test.ts",
    );
    expect(
      caseFile(failing({ file: "gone/x.test.ts", classname: "test/b.test.ts" }), tracked),
    ).toBe("test/b.test.ts");
    expect(caseFile(failing({ file: null, classname: "c.bats" }), tracked)).toBe(
      "tests/bats/c.bats",
    );
  });

  it("a classname matching two tracked basenames leaves the case undetermined", () => {
    expect(caseFile(failing({ file: null, classname: "dup.test.ts" }), tracked)).toBeNull();
  });

  it("an untracked or outside-repo file attribute leaves the case undetermined", () => {
    expect(caseFile(failing({ file: "../x.test.ts", classname: null }), tracked)).toBeNull();
    expect(caseFile(failing({ file: "/etc/x.test.ts", classname: null }), tracked)).toBeNull();
    expect(caseFile(failing({ file: "untracked/y.test.ts", classname: null }), tracked)).toBeNull();
    expect(caseFile(failing({ file: null, classname: "../x.test.ts" }), tracked)).toBeNull();
  });
});
