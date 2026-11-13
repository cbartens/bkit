import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { countReportFailures, logEnv, parseJunit, reportFailures } from "./junit";

const dirs: string[] = [];
const tmp = () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-junit-"));
  dirs.push(dir);
  return dir;
};

afterEach(() => {
  for (const dir of dirs.splice(0)) fs.rmSync(dir, { recursive: true, force: true });
});

const report = (body: string) => `<testsuite>${body}</testsuite>`;

describe("logEnv", () => {
  it("drops pnpm's silent reporter and keeps every other variable and reporter", () => {
    const silent = logEnv({ npm_config_reporter: "silent", PATH: "/bin" }, { EXTRA: "1" });
    expect(silent).toEqual({ PATH: "/bin", EXTRA: "1" });
    expect(logEnv({ npm_config_reporter: "ndjson" })).toEqual({ npm_config_reporter: "ndjson" });
    expect(logEnv({}, { npm_config_reporter: "silent" })).toEqual({});
  });
});

describe("parseJunit", () => {
  it("reads classname and file as null when a case carries neither", () => {
    expect(parseJunit(report('<testcase name="a"/>'))[0]).toMatchObject({
      name: "a",
      classname: null,
      file: null,
    });
  });
});

describe("countReportFailures", () => {
  it("counts failures and errors, 0 for a clean report and null with no report", () => {
    const dir = tmp();
    expect(countReportFailures(dir)).toBeNull();
    fs.writeFileSync(path.join(dir, "ok.xml"), report('<testcase name="a"/>'));
    expect(countReportFailures(dir)).toBe(0);
    expect(reportFailures(dir)).toBeNull();
    fs.writeFileSync(
      path.join(dir, "bad.xml"),
      report(
        '<testcase name="b"><failure message="x"/></testcase><testcase name="c"><error/></testcase>',
      ),
    );
    expect(countReportFailures(dir)).toBe(2);
    expect(reportFailures(dir)?.map((c) => c.name)).toEqual(["b", "c"]);
  });
});
