import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { clampLogPath, readRecords } from "./clamp-log";

const dirs: string[] = [];
afterEach(() => {
  for (const d of dirs.splice(0)) fs.rmSync(d, { recursive: true, force: true });
});

const tmp = () => {
  const d = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-clamp-log-")));
  dirs.push(d);
  return d;
};

describe("clampLogPath", () => {
  it("lives under tmp/ of the checkout the cwd sits in, attempt suffixed when given", () => {
    const repo = tmp();
    spawnSync("git", ["init", "-q"], { cwd: repo });
    fs.mkdirSync(path.join(repo, "sub"));
    expect(clampLogPath(path.join(repo, "sub"), "1-x", "build-run-tests", 2)).toBe(
      path.join(repo, "tmp", "bkit-clamp-1-x-build-run-tests-2.jsonl"),
    );
    expect(clampLogPath(repo, "1-x", "context-fetch")).toBe(
      path.join(repo, "tmp", "bkit-clamp-1-x-context-fetch.jsonl"),
    );
  });

  it("falls back to the cwd outside git", () => {
    const d = tmp();
    expect(clampLogPath(d, "1-x", "s", 1)).toBe(path.join(d, "tmp", "bkit-clamp-1-x-s-1.jsonl"));
  });
});

describe("readRecords", () => {
  it("returns every record, never draining the log", () => {
    const log = path.join(tmp(), "log.jsonl");
    fs.writeFileSync(log, '{"artifact":"a.md"}\n\n{"artifact":"b.md"}\n');
    expect(readRecords(log)).toEqual([{ artifact: "a.md" }, { artifact: "b.md" }]);
    expect(readRecords(log)).toHaveLength(2);
  });

  it("skips a malformed line and reports it", () => {
    const log = path.join(tmp(), "log.jsonl");
    fs.writeFileSync(log, '{"ok":1}\nnot json\n');
    const bad: string[] = [];
    expect(readRecords(log, (l) => bad.push(l))).toEqual([{ ok: 1 }]);
    expect(bad).toEqual(["not json"]);
  });

  it("is empty for a missing log", () => {
    expect(readRecords(path.join(tmp(), "none.jsonl"))).toEqual([]);
  });
});
