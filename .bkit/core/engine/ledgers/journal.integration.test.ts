// journal.integration.test.ts — boundary: the real filesystem and real git worktrees.
//
// Drives the real `runCommand` from a temp repo whose `.worktrees/{fid}` is a real git
// worktree holding an IN_PROGRESS `status.jsonl`, and asserts the bytes the dispatch seam
// wrote: the friction row in the WORKTREE's `.bkit/friction.jsonl` (spike C4: `repoRoot(cwd)`
// from a worktree resolves to the main checkout, a different inode), nothing in the main
// checkout's, and nothing at all when no run is active in the cwd.

import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { runCommand, type CommandSpec } from "../commands/lib";

const FID = "901-journal";
const STATUS_REL = path.join("docs", "plans", "202610", "logs", FID, "status.jsonl");

const ODD: CommandSpec = {
  noun: "widgets",
  summary: "journal probe",
  verbs: {
    odd: {
      summary: "exits 9, which it does not declare",
      use: "by-hand",
      flags: [{ name: "step", type: "string", help: "step" }],
      output: {},
      run: () => 9,
    },
    "needs-human": {
      summary: "exits 82",
      use: "by-hand",
      flags: [],
      output: {},
      run: () => 82,
    },
  },
};

function git(cwd: string, args: string[]): string {
  const res = spawnSync("git", ["-c", "user.name=t", "-c", "user.email=t@t", ...args], {
    cwd,
    encoding: "utf-8",
  });
  if (res.status !== 0) throw new Error(`git ${args.join(" ")}: ${res.stderr}`);
  return res.stdout.trim();
}

let main: string;
let worktree: string;

beforeEach(() => {
  vi.stubEnv("BKIT_ENGINE_JOURNAL", "on");
  main = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-journal-int-")));
  git(main, ["init", "-q", "-b", "dev"]);
  fs.writeFileSync(path.join(main, "README.md"), "x\n");
  git(main, ["add", "."]);
  git(main, ["commit", "-q", "-m", "init"]);
  worktree = path.join(main, ".worktrees", FID);
  git(main, ["worktree", "add", "-q", "-b", `feat/${FID}`, worktree]);
  const status = path.join(worktree, STATUS_REL);
  fs.mkdirSync(path.dirname(status), { recursive: true });
  fs.writeFileSync(
    status,
    `${JSON.stringify({ type: "workflow-started", workflow: "build", at: "2026-10-29T10:00:00Z" })}\n`,
  );
});

afterEach(() => {
  vi.unstubAllEnvs();
  fs.rmSync(main, { recursive: true, force: true });
});

async function run(cwd: string, argv: string[]): Promise<{ code: number | null; err: string[] }> {
  const err: string[] = [];
  const code = await runCommand(argv, [ODD], {
    classicVerbs: new Set(),
    cwd,
    io: { stdout: () => {}, stderr: (t) => err.push(t) },
  });
  return { code, err };
}

const rows = (file: string): Array<Record<string, unknown>> =>
  fs.existsSync(file)
    ? fs
        .readFileSync(file, "utf-8")
        .split("\n")
        .filter((l) => l !== "")
        .map((l) => JSON.parse(l) as Record<string, unknown>)
    : [];

describe("the dispatch seam on a real worktree", () => {
  it("writes friction to the run's own book root", async () => {
    const { code, err } = await run(worktree, ["widgets", "odd", "--step=build-summary"]);
    expect(code).toBe(9);
    expect(err).toEqual([]);

    const friction = rows(path.join(worktree, ".bkit", "friction.jsonl"));
    expect(friction).toHaveLength(1);
    expect(friction[0]).toMatchObject({
      kind: "friction",
      key: "widgets-odd/build-summary",
      category: "tool-failure",
      scope: "bkit-repo",
      by: { workflow: "build", step: "build-summary" },
    });
    expect(fs.existsSync(path.join(main, ".bkit", "friction.jsonl"))).toBe(false);

    const call = rows(path.join(worktree, STATUS_REL)).filter((r) => r["type"] === "engine-call");
    expect(call).toHaveLength(1);
    expect(call[0]).toMatchObject({
      workflow: "build",
      noun: "widgets",
      verb: "odd",
      flags: ["step"],
    });
  });

  it("writes no friction row for a declared routing exit", async () => {
    expect((await run(worktree, ["widgets", "needs-human"])).code).toBe(82);
    expect(fs.existsSync(path.join(worktree, ".bkit", "friction.jsonl"))).toBe(false);
    expect(
      rows(path.join(worktree, STATUS_REL)).filter((r) => r["type"] === "engine-call"),
    ).toHaveLength(1);
  });

  it("skips a call made outside the run's worktree", async () => {
    const { code, err } = await run(main, ["widgets", "odd"]);
    expect(code).toBe(9);
    expect(err).toEqual([]);
    const calls = () =>
      rows(path.join(worktree, STATUS_REL)).filter((r) => r["type"] === "engine-call");
    expect(calls()).toEqual([]);
    expect(fs.existsSync(path.join(worktree, ".bkit", "friction.jsonl"))).toBe(false);
    expect(fs.existsSync(path.join(main, ".bkit", "friction.jsonl"))).toBe(false);
    // Control: the same verb from inside the worktree is journaled, so the empty read above is the skip.
    await run(worktree, ["widgets", "odd"]);
    expect(calls()).toHaveLength(1);
  });

  it("writes nothing when no run is active in the cwd", async () => {
    const status = path.join(worktree, STATUS_REL);
    const saved = fs.readFileSync(status, "utf-8");
    fs.rmSync(path.join(worktree, "docs"), { recursive: true });
    const { code, err } = await run(worktree, ["widgets", "odd"]);
    expect(code).toBe(9);
    expect(err).toEqual([]);
    expect(fs.existsSync(path.join(worktree, ".bkit", "friction.jsonl"))).toBe(false);
    expect(fs.existsSync(path.join(worktree, "docs"))).toBe(false);
    // Control: with the run back, the same call is journaled.
    fs.mkdirSync(path.dirname(status), { recursive: true });
    fs.writeFileSync(status, saved);
    await run(worktree, ["widgets", "odd"]);
    expect(rows(status).filter((r) => r["type"] === "engine-call")).toHaveLength(1);
  });
});
