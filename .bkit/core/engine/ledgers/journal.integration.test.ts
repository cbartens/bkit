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

import { INVOCATION_FLAG, runCommand, type CommandSpec } from "../commands/lib";
import { COMMANDS } from "../commands/registry";
import { branchesCommand } from "../commands/workflow/branches";
import { ledgersCommand } from "../commands/workflow/ledgers";

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

  it("a call launched from a git hook writes no engine-call row", async () => {
    // The environment real git gives a pre-commit hook in the run's worktree.
    const dump = path.join(main, "hook-env.json");
    const hook = path.join(main, ".git", "hooks", "pre-commit");
    fs.writeFileSync(
      hook,
      `#!/bin/sh\nnode -e 'require("fs").writeFileSync(process.argv[1], JSON.stringify(process.env))' "${dump}"\n`,
    );
    fs.chmodSync(hook, 0o755);
    fs.writeFileSync(path.join(worktree, "change.txt"), "x\n");
    git(worktree, ["add", "change.txt"]);
    git(worktree, ["commit", "-q", "-m", "hooked"]);
    const hookEnv = JSON.parse(fs.readFileSync(dump, "utf-8")) as Record<string, string>;
    const gitVars = Object.keys(hookEnv).filter((k) => k.startsWith("GIT_"));
    expect(gitVars.length).toBeGreaterThan(0);

    const status = path.join(worktree, STATUS_REL);
    const calls = () => rows(status).filter((r) => r["type"] === "engine-call");
    for (const k of gitVars) vi.stubEnv(k, hookEnv[k]);
    const { code, err } = await run(worktree, ["widgets", "odd", "--step=build-summary"]);
    expect(code).toBe(9);
    expect(err).toEqual([]);
    expect(calls()).toEqual([]);
    // Friction still records: `.bkit/friction.jsonl` is not a file the commit snapshots.
    expect(rows(path.join(worktree, ".bkit", "friction.jsonl"))).toHaveLength(1);

    // Control: the same call without the hook's environment is journaled.
    for (const k of gitVars) vi.stubEnv(k, undefined);
    await run(worktree, ["widgets", "odd", "--step=build-summary"]);
    expect(calls()).toHaveLength(1);
  });

  it("branches rebase finishes a rebase paused on a commit that carries the run's status file", async () => {
    // The resolver's own call lands mid-rebase: its row must not dirty the tracked status file.
    git(main, ["config", "user.name", "t"]);
    git(main, ["config", "user.email", "t@t"]);
    const ledger = path.join("docs", "knowledge.jsonl");
    fs.mkdirSync(path.join(main, "docs"), { recursive: true });
    fs.writeFileSync(path.join(main, ledger), '{"key":"dev"}\n');
    git(main, ["add", ledger]);
    git(main, ["commit", "-q", "-m", "dev row"]);
    fs.mkdirSync(path.join(worktree, "docs"), { recursive: true });
    fs.writeFileSync(path.join(worktree, ledger), '{"key":"feat"}\n');
    git(worktree, ["add", ledger, STATUS_REL]);
    git(worktree, ["commit", "-q", "-m", "feat row"]);
    const status = path.join(worktree, STATUS_REL);
    const committed = fs.readFileSync(status, "utf-8");
    const paused = spawnSync("git", ["rebase", "dev"], { cwd: worktree, encoding: "utf-8" });
    expect(paused.status).not.toBe(0);
    expect(git(worktree, ["diff", "--name-only", "--diff-filter=U"])).toBe(ledger);

    const err: string[] = [];
    const code = await runCommand(["branches", "rebase"], [branchesCommand], {
      classicVerbs: new Set(),
      cwd: worktree,
      io: { stdout: () => {}, stderr: (t) => err.push(t) },
    });
    expect(err.join("")).not.toContain("REFUSE");
    expect(code).toBe(0);
    expect(git(worktree, ["status", "--porcelain"])).toBe("");
    expect(fs.readFileSync(status, "utf-8")).toBe(committed);
    expect(fs.readFileSync(path.join(worktree, ledger), "utf-8")).toBe(
      '{"key":"dev"}\n{"key":"feat"}\n',
    );

    // Control: with the rebase finished, the same verb is journaled again.
    await run(worktree, ["widgets", "odd"]);
    expect(rows(status).filter((r) => r["type"] === "engine-call")).toHaveLength(1);
  });

  it("branches anchor-read with a plan --file journals into the active run", async () => {
    const plan = path.join(worktree, "docs", "plans", "202610", `${FID}-plan.md`);
    fs.mkdirSync(path.dirname(plan), { recursive: true });
    fs.writeFileSync(plan, "# Plan\n");
    await runCommand(
      ["branches", "anchor-read", `--file=${path.relative(worktree, plan)}`],
      [branchesCommand],
      { classicVerbs: new Set(), cwd: worktree, io: { stdout: () => {}, stderr: () => {} } },
    );
    const calls = rows(path.join(worktree, STATUS_REL)).filter((r) => r["type"] === "engine-call");
    expect(calls).toHaveLength(1);
    expect(calls[0]).toMatchObject({ workflow: "build", noun: "branches", verb: "anchor-read" });
  });
});

const PROBE: CommandSpec = {
  noun: "probe",
  summary: "invocation probe",
  verbs: {
    show: {
      summary: "emits the invocation the shared flag resolved",
      use: "workflow",
      flags: [INVOCATION_FLAG],
      output: { invocation: "the resolved invocation, or null" },
      run: (ctx) => {
        ctx.emit({ invocation: ctx.invocation ?? null });
        return 0;
      },
    },
  },
};

async function call(cwd: string, specs: readonly CommandSpec[], argv: string[]) {
  const out: string[] = [];
  const err: string[] = [];
  const code = await runCommand([...argv, "--json"], specs, {
    classicVerbs: new Set(["status"]),
    cwd,
    io: { stdout: (t) => out.push(t), stderr: (t) => err.push(t) },
  });
  return {
    code,
    json: out.length > 0 ? (JSON.parse(out.join("")) as Record<string, any>) : undefined,
    err: err.join(""),
  };
}

async function issue(cwd: string, extra: string[] = [], step = "build-plan-tests") {
  const res = await call(cwd, COMMANDS, [
    "status",
    "invocation",
    "--workflow=build",
    `--step=${step}`,
    `--file=${STATUS_REL}`,
    "--host=claude",
    "--configured-model=sonnet",
    ...extra,
  ]);
  expect(res.code).toBe(0);
  return res.json!["invocation"] as string;
}

describe("explicit invocation on real worktrees", () => {
  it("resumes explicit invocation across two real worktrees without identity leakage", async () => {
    const other = path.join(main, ".worktrees", "902-other");
    git(main, ["worktree", "add", "-q", "-b", "feat/902-other", other]);
    const otherStatus = path.join(other, STATUS_REL);
    fs.mkdirSync(path.dirname(otherStatus), { recursive: true });
    fs.writeFileSync(
      otherStatus,
      `${JSON.stringify({ type: "workflow-started", workflow: "build", at: "2026-10-29T11:00:00Z" })}\n`,
    );
    const statusA = path.join(worktree, STATUS_REL);

    const idA = await issue(worktree);
    const idB = await issue(other);
    expect(idA).not.toBe(idB);

    // The run moves on between two commands: resume must keep the same identity.
    fs.appendFileSync(
      statusA,
      `${JSON.stringify({ type: "step-done", workflow: "build", step: "build-branch-sync", status: "DONE", at: "2026-10-29T10:05:00Z", parentSha: "a".repeat(40), artifacts: [] })}\n`,
    );
    const bytesA = fs.readFileSync(statusA, "utf-8");
    const bytesB = fs.readFileSync(otherStatus, "utf-8");

    const resumedA = await call(worktree, [PROBE], ["probe", "show", `--invocation=${idA}`]);
    expect(resumedA.code).toBe(0);
    expect(resumedA.json!["invocation"]).toMatchObject({
      id: idA,
      run: 1,
      workflow: "build",
      step: "build-plan-tests",
      statusPath: statusA,
    });
    const resumedB = await call(other, [PROBE], ["probe", "show", `--invocation=${idB}`]);
    expect(resumedB.json!["invocation"]).toMatchObject({ id: idB, statusPath: otherStatus });

    // Each id is refused anywhere but its own worktree: the other worktree and the main checkout.
    for (const [cwd, id] of [
      [other, idA],
      [worktree, idB],
      [main, idA],
    ] as const) {
      const leaked = await call(cwd, [PROBE], ["probe", "show", `--invocation=${id}`]);
      expect(leaked.code).toBe(2);
      expect(leaked.json).toBeUndefined();
    }
    expect(fs.readFileSync(statusA, "utf-8")).toBe(bytesA);
    expect(fs.readFileSync(otherStatus, "utf-8")).toBe(bytesB);
  });

  it("completes missing subagent attribution before a real append", async () => {
    const id = await issue(worktree, [
      "--agent=bkit-build-plan-tests",
      "--observed-model=opus-observed",
    ]);
    const rowsFile = path.join(main, "rows.json");
    fs.writeFileSync(
      rowsFile,
      JSON.stringify([{ kind: "knowledge", key: "gotcha", summary: "a gotcha worth keeping" }]),
    );
    const appended = await call(
      worktree,
      [ledgersCommand],
      [
        "ledgers",
        "append",
        `--root=${worktree}`,
        "--ledger=knowledge",
        `--rows=${rowsFile}`,
        `--invocation=${id}`,
      ],
    );
    expect(appended.code).toBe(0);
    const ledger = rows(path.join(worktree, "docs", "knowledge.jsonl"));
    expect(ledger).toHaveLength(1);
    expect(ledger[0]!["by"]).toEqual({
      workflow: "build",
      step: "build-plan-tests",
      subagent: "bkit-build-plan-tests",
      model: "opus-observed",
      modelSource: "observed",
      configuredModel: "sonnet",
      host: "claude",
    });
    expect(fs.existsSync(path.join(main, "docs", "knowledge.jsonl"))).toBe(false);

    // An unavailable observation is accepted with provenance and the pin kept apart from it.
    const unavailableId = await issue(worktree, [
      "--agent=bkit-build-plan-tests",
      "--observed-model=unavailable",
    ]);
    fs.writeFileSync(
      rowsFile,
      JSON.stringify([{ kind: "knowledge", key: "second", summary: "a second gotcha" }]),
    );
    const second = await call(
      worktree,
      [ledgersCommand],
      [
        "ledgers",
        "append",
        `--root=${worktree}`,
        "--ledger=knowledge",
        `--rows=${rowsFile}`,
        `--invocation=${unavailableId}`,
      ],
    );
    expect(second.code).toBe(0);
    const by = rows(path.join(worktree, "docs", "knowledge.jsonl"))[1]!["by"] as Record<
      string,
      unknown
    >;
    expect(by).toMatchObject({ modelSource: "unavailable", configuredModel: "sonnet" });
    expect(by).not.toHaveProperty("model");
  });
});

describe("canonical ledger reads on real files", () => {
  const dec = (key: string) =>
    JSON.stringify({
      schema: 3,
      ts: 1_700_000_000_001,
      kind: "decision",
      key,
      repo: "o/r",
      bkit: { version: "6.0.0" },
      by: { workflow: "build", step: "manual" },
      summary: key,
      status: "ACTIVE",
    });
  const query = (extra: string[] = []) =>
    call(
      worktree,
      [ledgersCommand],
      ["ledgers", "query", `--root=${worktree}`, "--ledger=decisions", ...extra],
    );

  it("distinguishes unreadable missing malformed and clean ledger coverage without writing", async () => {
    const file = path.join(worktree, "docs", "decisions.jsonl");
    const porcelain = () => git(worktree, ["status", "--porcelain"]);
    const before = porcelain();

    // Missing: no rows, and not a clean scan.
    const missing = await query();
    expect(missing.code).toBe(0);
    expect(missing.json!["rows"]).toEqual([]);
    expect(missing.json!["coverage"]).toMatchObject({ status: "missing", clean: false });
    expect(fs.existsSync(file)).toBe(false);

    // Unreadable: the path is a directory, so the read fails.
    fs.mkdirSync(file, { recursive: true });
    const unreadable = await query();
    expect(unreadable.code).toBe(0);
    expect(unreadable.json!["rows"]).toEqual([]);
    expect(unreadable.json!["coverage"]).toMatchObject({ status: "unreadable", clean: false });
    fs.rmSync(file, { recursive: true });

    // Malformed: valid rows come back with a located diagnostic; the bytes are untouched.
    const body = `${dec("a")}\n{broken\n${dec("b")}\n`;
    fs.writeFileSync(file, body);
    const malformed = await query();
    expect(malformed.json!["rows"].map((r: { key: string }) => r.key)).toEqual(["a", "b"]);
    expect(malformed.json!["diagnostics"]).toEqual([expect.objectContaining({ line: 2 })]);
    expect(malformed.json!["coverage"]).toMatchObject({ status: "partial", clean: false });
    expect(fs.readFileSync(file, "utf-8")).toBe(body);

    // Clean: only now is the scan reported clean.
    fs.writeFileSync(file, `${dec("a")}\n${dec("b")}\n`);
    const clean = await query();
    expect(clean.json!["diagnostics"]).toEqual([]);
    expect(clean.json!["coverage"]).toMatchObject({ status: "complete", clean: true });

    // Reads wrote nothing beyond the ledger fixture this test itself created.
    fs.rmSync(file);
    expect(porcelain()).toBe(before);
  });
});
