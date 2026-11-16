import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { defaultRange, featureBase } from "./feature-base.js";

const dirs: string[] = [];

function g(dir: string, ...args: string[]): string {
  const r = spawnSync("git", args, { cwd: dir, encoding: "utf-8" });
  return r.stdout.trim();
}

function commit(dir: string, file: string, text: string): string {
  fs.writeFileSync(path.join(dir, file), text);
  g(dir, "add", "-A");
  g(dir, "-c", "user.name=t", "-c", "user.email=t@t", "commit", "-q", "-m", file);
  return g(dir, "rev-parse", "HEAD");
}

function repo(): { dir: string; base: string } {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "feature-base-"));
  dirs.push(dir);
  g(dir, "init", "-q", "-b", "dev");
  const base = commit(dir, "a.txt", "a");
  g(dir, "update-ref", "refs/remotes/origin/dev", "HEAD");
  g(dir, "checkout", "-q", "-b", "feat/1-x");
  return { dir, base };
}

afterEach(() => {
  for (const d of dirs.splice(0)) fs.rmSync(d, { recursive: true, force: true });
});

describe("featureBase and defaultRange", () => {
  it("name the origin/dev meeting point when local dev has not moved", () => {
    const { dir, base } = repo();
    commit(dir, "b.txt", "b");
    expect(featureBase(dir)).toBe(base);
    expect(defaultRange(dir)).toEqual({ base: "origin/dev", range: "origin/dev...HEAD" });
  });

  it("read from local dev's tip when the branch was cut after local dev moved ahead", () => {
    const { dir } = repo();
    g(dir, "checkout", "-q", "dev");
    const ahead = commit(dir, "c.txt", "c");
    g(dir, "checkout", "-q", "feat/1-x");
    g(dir, "reset", "-q", "--hard", "dev");
    commit(dir, "b.txt", "b");
    expect(featureBase(dir)).toBe(ahead);
    expect(defaultRange(dir)).toEqual({ base: ahead, range: `${ahead}..HEAD` });
  });

  it("featureBase falls back to the origin/dev meeting point when local dev already contains HEAD", () => {
    const { dir, base } = repo();
    commit(dir, "b.txt", "b");
    g(dir, "branch", "-f", "dev", "HEAD");
    const head = g(dir, "rev-parse", "HEAD");
    expect(featureBase(dir)).not.toBe(head);
    expect(featureBase(dir)).toBe(base);
  });
});
