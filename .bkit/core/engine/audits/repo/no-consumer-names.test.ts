// audits/repo/no-consumer-names.test.ts — no tracked file names a bkit consumer.
//
// The names come from the maintainer-local, gitignored `harvest/consumers.md` (checkout
// basename + `origin` owner and repo), so this guard never writes them into the repo itself.
// Absent list (CI, fresh clones) → skipped.

import * as fs from "node:fs";
import * as path from "node:path";
import { spawnSync } from "node:child_process";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const CONSUMERS = path.join(ROOT, "harvest", "consumers.md");

function consumerNames(): string[] {
  const names = new Set<string>();
  for (const raw of fs.readFileSync(CONSUMERS, "utf-8").split("\n")) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const dir = line.replace(/\/+$/, "");
    names.add(path.basename(dir));
    const remote = spawnSync("git", ["-C", dir, "remote", "get-url", "origin"], {
      encoding: "utf-8",
    });
    const m = /[:/]([^/:]+)\/([^/]+?)(?:\.git)?\s*$/.exec(remote.stdout ?? "");
    if (m) {
      names.add(m[1]);
      names.add(m[2]);
    }
  }
  return [...names].filter((n) => n.length >= 4).map((n) => n.toLowerCase());
}

describe.skipIf(!fs.existsSync(CONSUMERS))("no consumer names in tracked files", () => {
  it("git grep finds no consumer checkout, owner or repo name", () => {
    const names = consumerNames();
    expect(names.length).toBeGreaterThan(0);
    const r = spawnSync(
      "git",
      ["grep", "-I", "-i", "-l", "-F", ...names.flatMap((n) => ["-e", n])],
      {
        cwd: ROOT,
        encoding: "utf-8",
      },
    );
    expect([0, 1], r.stderr).toContain(r.status); // 1 = no match; anything else = git failed
    expect(r.stdout.trim().split("\n").filter(Boolean)).toEqual([]);
  });
});
