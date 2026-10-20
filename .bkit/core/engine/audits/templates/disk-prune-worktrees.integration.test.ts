// audits/templates/disk-prune-worktrees.integration.test.ts — the example repo step that
// removes leftover worktrees, run for real against temp repos. It removes only a worktree
// nothing would be lost from, keeps one in use without a word, and notes the rest. Stub
// `pnpm` runs the built CLI; stub `gh` reports a merged pull request for feat/squashed.

import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const REPO = process.cwd();
const TEMPLATE = path.join(REPO, ".bkit/templates/scripts/cleanup/bkit-disk-prune.mjs");
const OLD = "2020-01-01T00:00:00Z";

interface Step {
  name: string;
  run: (ctx: { cwd: string; log: (m: string) => void; note: (m: string) => void }) => unknown;
}

let tmp: string;
beforeEach(() => {
  tmp = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-disk-wt-")));
});
afterEach(() => {
  vi.unstubAllEnvs();
  fs.rmSync(tmp, { recursive: true, force: true });
});

/** git in `cwd`; `date` sets the commit dates, so a commit can look days old. */
function git(cwd: string, args: string[], date?: string): string {
  const env = date
    ? { ...process.env, GIT_AUTHOR_DATE: date, GIT_COMMITTER_DATE: date }
    : process.env;
  const r = spawnSync("git", ["-c", "user.email=t@t", "-c", "user.name=t", ...args], {
    cwd,
    env,
    encoding: "utf-8",
  });
  expect(r.status, `git ${args.join(" ")}: ${r.stderr}`).toBe(0);
  return r.stdout.trim();
}

/** A main checkout with a pushed commit, an origin, and stub `pnpm` / `gh` on PATH. */
function checkout(): string {
  const origin = path.join(tmp, "origin.git");
  const main = path.join(tmp, "main");
  git(tmp, ["init", "-q", "--bare", "-b", "dev", origin]);
  git(tmp, ["init", "-q", "-b", "dev", main]);
  git(main, ["commit", "-q", "--allow-empty", "-m", "init"], OLD);
  git(main, ["remote", "add", "origin", origin]);
  git(main, ["push", "-q", "origin", "dev"]);
  const bin = path.join(tmp, "bin");
  fs.mkdirSync(bin);
  fs.writeFileSync(
    path.join(bin, "pnpm"),
    `#!/bin/sh\nshift 2\nexec node ${JSON.stringify(path.join(REPO, "dist", "cli.js"))} "$@"\n`,
    { mode: 0o755 },
  );
  fs.writeFileSync(
    path.join(bin, "gh"),
    `#!/bin/sh\ncase "$*" in *feat/squashed*) cat "${tmp}/squashed.json" ;; *) echo "[]" ;; esac\n`,
    { mode: 0o755 },
  );
  vi.stubEnv("PATH", `${bin}:${process.env.PATH}`);
  return main;
}

/** `.worktrees/{fid}` on a new `feat/{fid}`, plus an unpushed commit dated `commit`. */
function worktree(main: string, fid: string, commit?: string): string {
  const wt = path.join(main, ".worktrees", fid);
  git(main, ["worktree", "add", "-q", wt, "-b", `feat/${fid}`]);
  if (commit) git(wt, ["commit", "-q", "--allow-empty", "-m", fid], commit);
  return wt;
}

async function sweep(main: string) {
  const steps = (await import(TEMPLATE)).default as Step[];
  const step = steps.find((s) => s.name.startsWith("Leftover agent worktrees"))!;
  const logs: string[] = [];
  const notes: string[] = [];
  await step.run({ cwd: main, log: (m) => logs.push(m), note: (m) => notes.push(m) });
  return { logs, notes };
}

describe("example repo step — leftover worktrees", () => {
  it("removes what loses nothing, keeps what is in use, notes the rest", async () => {
    const main = checkout();
    const clean = worktree(main, "clean");
    const owned = worktree(main, "owned");
    const marker = path.join(main, ".git", "bkit-outbox", "owned", ".worktree-owned");
    fs.mkdirSync(path.dirname(marker), { recursive: true });
    fs.writeFileSync(marker, "");
    const dirty = worktree(main, "dirty");
    fs.writeFileSync(path.join(dirty, "notes.txt"), "draft\n");
    const unpushed = worktree(main, "unpushed", OLD);
    const squashed = worktree(main, "squashed", OLD);
    fs.writeFileSync(
      path.join(tmp, "squashed.json"),
      JSON.stringify([{ headRefOid: git(squashed, ["rev-parse", "HEAD"]) }]),
    );
    const fresh = worktree(main, "fresh", new Date().toISOString());

    const { logs, notes } = await sweep(main);

    for (const gone of [clean, owned, squashed]) expect(fs.existsSync(gone), gone).toBe(false);
    for (const kept of [dirty, unpushed, fresh]) expect(fs.existsSync(kept), kept).toBe(true);
    expect(fs.existsSync(marker)).toBe(false);
    expect(notes).toEqual([
      expect.stringMatching(/^\.worktrees\/dirty: uncommitted or untracked files/),
      ".worktrees/unpushed: commits on no remote branch, and no merged pull request ends at HEAD",
    ]);
    expect(logs).toContain("kept .worktrees/fresh: committed to in the last 2 days");
    // Branches stay: only the folders go.
    expect(git(main, ["branch", "--list", "feat/clean", "feat/squashed"])).toContain("feat/clean");
  });

  it("keeps a worktree whose workflow holds its lock, without a note", async () => {
    const main = checkout();
    const wt = worktree(main, "locked");
    const lock = path.join(main, "docs", "plans", "202610", "logs", "locked", ".lock");
    fs.mkdirSync(path.dirname(lock), { recursive: true });
    fs.writeFileSync(lock, "x\n");
    const { logs, notes } = await sweep(main);
    expect(fs.existsSync(wt)).toBe(true);
    expect(notes).toEqual([]);
    expect(logs).toContain("kept .worktrees/locked: a bkit workflow holds its lock");
  });
});
