import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { highestVersion } from "./plan-versions";

const dirs: string[] = [];
afterEach(() => {
  for (const d of dirs.splice(0)) fs.rmSync(d, { recursive: true, force: true });
});

function logDir(...files: string[]): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-hv-"));
  dirs.push(dir);
  for (const f of files) fs.writeFileSync(path.join(dir, f), "");
  return dir;
}

describe("highestVersion", () => {
  it("highestVersion counts every named plan-vN draft", () => {
    const dir = logDir("plan-v1-draft.md", "plan-v2-reviewed.md", "plan-v4-converted.md");
    expect(highestVersion(dir, "plan")).toEqual({ file: "plan-v4-converted.md", n: 4 });
  });

  it("files an older bkit's split wrote stay invisible, so a re-run's reviewed plan is found", () => {
    const dir = logDir("plan-v2-reviewed.md", "plan-v3-split.md", "plan-v3-1.md", "plan-v3-2.md");
    expect(highestVersion(dir, "plan")).toEqual({ file: "plan-v2-reviewed.md", n: 2 });
  });

  it("ignores other workflows, and is null for a missing folder", () => {
    const dir = logDir("plan-v3-1.md", "design-v4-organised.md");
    expect(highestVersion(dir, "plan")).toBeNull();
    expect(highestVersion(path.join(dir, "missing"), "plan")).toBeNull();
  });
});
