// audits/repo/vitest-tsx-bin.test.ts — `hasTool` (vitest.tsx-bin.ts) is the one shared answer
// to "is this tool on PATH": false locally when absent, a loud throw on CI.
//
// PATH and CI are swapped in-process and restored; only temp dirs are touched, no subprocess.

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { hasTool } from "../../../../../vitest.tsx-bin";

describe("hasTool", () => {
  let dir = "";
  const saved = { PATH: process.env.PATH, CI: process.env.CI };

  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-hastool-"));
    process.env.PATH = dir;
    delete process.env.CI;
  });

  afterEach(() => {
    process.env.PATH = saved.PATH;
    if (saved.CI === undefined) delete process.env.CI;
    else process.env.CI = saved.CI;
    fs.rmSync(dir, { recursive: true, force: true });
  });

  it("returns true for an executable file on PATH", () => {
    const bin = path.join(dir, "fake-tool");
    fs.writeFileSync(bin, "#!/bin/sh\n", { mode: 0o755 });
    expect(hasTool("fake-tool")).toBe(true);
  });

  it("ignores a file on PATH that is not executable", () => {
    fs.writeFileSync(path.join(dir, "fake-tool"), "#!/bin/sh\n", { mode: 0o644 });
    expect(hasTool("fake-tool")).toBe(false);
  });

  it("hasTool returns false for a missing tool outside CI", () => {
    expect(hasTool("no-such-tool-xyz")).toBe(false);
  });

  it("hasTool throws naming the tool when CI is set", () => {
    process.env.CI = "true";
    expect(() => hasTool("no-such-tool-xyz")).toThrow(/no-such-tool-xyz not found on PATH/);
    process.env.CI = "1";
    expect(() => hasTool("no-such-tool-xyz")).toThrow(/the CI lane must install it/);
  });

  it("returns true under CI when the tool is present", () => {
    process.env.CI = "true";
    fs.writeFileSync(path.join(dir, "fake-tool"), "#!/bin/sh\n", { mode: 0o755 });
    expect(hasTool("fake-tool")).toBe(true);
  });
});
