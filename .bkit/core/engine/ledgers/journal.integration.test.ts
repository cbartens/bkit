// journal.integration.test.ts — boundary: the real filesystem and real git worktrees.
//
// Drives the real `runCommand` from a temp repo whose `.worktrees/{fid}` is a real git
// worktree holding an IN_PROGRESS `status.jsonl`, and asserts the bytes the dispatch seam
// wrote: the friction row in the WORKTREE's `.bkit/friction.jsonl` (spike C4: `repoRoot(cwd)`
// from a worktree resolves to the main checkout, a different inode), nothing in the main
// checkout's, and nothing at all when no run is active in the cwd.

import { spawn, spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  INVOCATION_FLAG,
  resolveInvocation,
  runCommand,
  type CommandSpec,
  type GhResult,
} from "../commands/lib";
import { ledgerOperationsFile, pendingLedgerIntents } from "./status";
import { COMMANDS } from "../commands/registry";
import { branchesCommand } from "../commands/workflow/branches";
import {
  appendLedgerRows,
  appendRecordCommit,
  ledgersCommand,
  newRecord,
  readRecord,
  writeRecord,
} from "../commands/workflow/ledgers";
import { ciDispatchGate, type Gh } from "../commands/workflow/runs";

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

    const afterB = fs.readFileSync(otherStatus, "utf-8");

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
    // Only the issuing run's own status log grows, and only by engine-call rows; refused ids write nowhere.
    const afterA = fs.readFileSync(statusA, "utf-8");
    expect(afterA.startsWith(bytesA)).toBe(true);
    const grown = afterA
      .slice(bytesA.length)
      .split("\n")
      .filter((l) => l !== "")
      .map((l) => JSON.parse(l) as Record<string, unknown>);
    expect(grown.length).toBeGreaterThan(0);
    expect(grown.every((r) => r["type"] === "engine-call")).toBe(true);
    expect(fs.readFileSync(otherStatus, "utf-8")).toBe(afterB);
  });

  it("keeps invocation events and engine-call rows inside the issuing worktree after receipt loss", async () => {
    const other = path.join(main, ".worktrees", "902-other");
    git(main, ["worktree", "add", "-q", "-b", "feat/902-other", other]);
    const otherStatus = path.join(other, STATUS_REL);
    fs.mkdirSync(path.dirname(otherStatus), { recursive: true });
    fs.writeFileSync(
      otherStatus,
      `${JSON.stringify({ type: "workflow-started", workflow: "build", at: "2026-10-29T11:00:00Z" })}\n`,
    );
    const statusA = path.join(worktree, STATUS_REL);
    const mainStatusDir = path.join(main, "docs");
    const otherBytes = fs.readFileSync(otherStatus, "utf-8");
    const startA = fs.readFileSync(statusA, "utf-8");

    const id = await issue(worktree);

    // The invocation is an event in the issuing run's own status log, and nowhere else.
    const issuedA = fs.readFileSync(statusA, "utf-8");
    expect(issuedA.startsWith(startA)).toBe(true);
    const events = issuedA
      .slice(startA.length)
      .split("\n")
      .filter((l) => l !== "")
      .map((l) => JSON.parse(l) as Record<string, unknown>);
    expect(events.filter((r) => JSON.stringify(r).includes(id))).toHaveLength(1);
    expect(fs.readFileSync(otherStatus, "utf-8")).toBe(otherBytes);

    // Receipt loss: the resumed command still resolves from the status log, and writes its engine-call row.
    const receipt = path.join(
      git(worktree, ["rev-parse", "--path-format=absolute", "--git-common-dir"]),
      "bkit-outbox",
      "invocation-context",
      `${id}.json`,
    );
    expect(fs.existsSync(receipt)).toBe(true);
    fs.rmSync(receipt);
    const resumed = await call(worktree, [PROBE], ["probe", "show", `--invocation=${id}`]);
    expect(resumed.code).toBe(0);
    expect(resumed.json!["invocation"]).toMatchObject({
      id,
      workflow: "build",
      step: "build-plan-tests",
      statusPath: statusA,
    });

    const calls = rows(statusA).filter((r) => r["type"] === "engine-call");
    expect(calls).toHaveLength(1);
    expect(calls[0]).toMatchObject({ workflow: "build", noun: "probe", verb: "show" });

    // Nothing leaked: the other worktree's status and the main checkout's docs are untouched.
    expect(fs.readFileSync(otherStatus, "utf-8")).toBe(otherBytes);
    expect(fs.existsSync(path.join(other, "docs", "knowledge.jsonl"))).toBe(false);
    expect(fs.existsSync(mainStatusDir)).toBe(false);
    // The id is still refused in the other worktree even after the receipt came back.
    const leaked = await call(other, [PROBE], ["probe", "show", `--invocation=${id}`]);
    expect(leaked.code).toBe(2);
    expect(fs.readFileSync(otherStatus, "utf-8")).toBe(otherBytes);
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

describe("replay-safe ledger appends on real files", () => {
  const roots: string[] = [];
  afterEach(() => {
    for (const d of roots.splice(0)) fs.rmSync(d, { recursive: true, force: true });
  });
  const bookRoot = (): string => {
    const d = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-op-int-")));
    roots.push(d);
    git(d, ["init", "-q", "-b", "dev"]);
    return d;
  };
  const failureRow = (o: Record<string, unknown> = {}) => ({
    kind: "failure",
    by: { workflow: "build", step: "build-challenge" },
    key: "parser-drops-last-line",
    summary: "parser drops the last line",
    severity: "HIGH",
    status: "OPEN",
    ...o,
  });

  const failAt = (point: string) => (name: string) => {
    if (name === point) throw new Error("response lost");
  };

  it("reconciles lost append response at each durable checkpoint without duplicate rows", () => {
    for (const checkpoint of ["prepared", "written", "receipted"] as const) {
      const root = bookRoot();
      const file = path.join(root, "docs", "failures.jsonl");
      const operation = `op-${checkpoint}`;

      // The response is lost at this checkpoint: the caller sees a failure, whatever is on disk.
      expect(() =>
        appendLedgerRows(root, "failures", [failureRow()], undefined, {
          operation,
          checkpoint: failAt(checkpoint),
        }),
      ).toThrow();

      // The same operation again reconciles to the one effect and never appends a second row.
      const replay = appendLedgerRows(root, "failures", [failureRow()], undefined, { operation });
      const written = rows(file);
      expect(written).toHaveLength(1);
      expect(replay.receipt).toMatchObject({
        operation,
        offset: 0,
        bytes: fs.statSync(file).size,
        rows: [{ key: "parser-drops-last-line", ts: written[0]!["ts"] }],
      });

      // A further replay is a pure read: same receipt, same bytes.
      const bytes = fs.readFileSync(file, "utf-8");
      const again = appendLedgerRows(root, "failures", [failureRow()], undefined, { operation });
      expect(again.appended).toBe(0);
      expect(again.receipt).toMatchObject({ rows: replay.receipt!.rows, replayed: true });
      expect(fs.readFileSync(file, "utf-8")).toBe(bytes);
    }
  });

  // One writer process: pauses after preparing its append when `ready` is set, until `release` exists.
  const WRITER = `
    const j = await import(process.argv[1]);
    const fs = await import("node:fs");
    const [, , book, ready, release, workflow, reason] = process.argv;
    const row = j.pauseFrictionRow({ workflow, reason, bookRoot: book });
    const res = j.appendFrictionRow(book, row, {
      checkpoint: (name) => {
        if (name !== "prepared" || ready === "-") return;
        fs.writeFileSync(ready, "1");
        while (!fs.existsSync(release)) Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 20);
      },
    });
    console.log(JSON.stringify(res));
  `;
  const JOURNAL = path.resolve(__dirname, "journal.ts");

  function writer(book: string, ready: string, release: string, workflow: string, reason: string) {
    return new Promise<{ code: number | null; result: Record<string, any> }>((resolve) => {
      const child = spawn(
        process.execPath,
        [
          "--import",
          "tsx",
          "--input-type=module",
          "-e",
          WRITER,
          JOURNAL,
          book,
          ready,
          release,
          workflow,
          reason,
        ],
        { cwd: __dirname, stdio: ["ignore", "pipe", "pipe"] },
      );
      let out = "";
      child.stdout.on("data", (t) => (out += String(t)));
      child.on("close", (code) => {
        const last = out.trim().split("\n").at(-1) ?? "{}";
        resolve({ code, result: JSON.parse(last) as Record<string, any> });
      });
    });
  }
  const until = async (file: string) => {
    for (let i = 0; i < 1000 && !fs.existsSync(file); i += 1)
      await new Promise((r) => setTimeout(r, 20));
    expect(fs.existsSync(file)).toBe(true);
  };

  it("serializes concurrent append operations and blocks partial uncertain ledger writes", async () => {
    // Two real processes: the first pauses after preparing its append, the second writes meanwhile.
    for (const [second, sameKey] of [
      [["build", "same"], true],
      [["debug", "other"], false],
    ] as const) {
      const book = bookRoot();
      const file = path.join(book, ".bkit", "friction.jsonl");
      const ready = path.join(book, "ready");
      const release = path.join(book, "release");
      const first = writer(book, ready, release, "build", "same");
      await until(ready);
      const other = writer(book, "-", release, second[0], second[1]);
      await new Promise((r) => setTimeout(r, 800));
      fs.writeFileSync(release, "1");
      const [a, b] = await Promise.all([first, other]);

      // The paused writer prepared against an empty ledger, so its row is first at offset 0.
      expect(a.result["ok"]).toBe(true);
      const text = fs.readFileSync(file, "utf-8");
      expect(text.endsWith("\n")).toBe(true);
      const written = rows(file);
      const okCount = [a, b].filter((w) => w.result["ok"] === true).length;
      expect(written).toHaveLength(okCount);
      // The second either serialised behind the first or visibly refused; it never tore or reordered a row.
      const outcome = ({ true: "written", false: "refused" } as const)[
        String(b.result["ok"] === true) as "true" | "false"
      ];
      expect({ written: undefined, refused: "string" }[outcome]).toBe(
        { written: undefined, refused: typeof b.result["error"] }[outcome],
      );
      const sizes = text
        .split("\n")
        .filter((l) => l !== "")
        .map((l) => Buffer.byteLength(`${l}\n`));
      expect(a.result["receipt"]).toMatchObject({ offset: 0, bytes: sizes[0] });
      expect(b.result["receipt"]?.offset).toBe({ written: sizes[0], refused: undefined }[outcome]);
      expect(b.result["receipt"]?.bytes).toBe({ written: sizes[1], refused: undefined }[outcome]);
      expect(written.map((r) => r["recurrenceCount"])).toEqual(
        {
          written: { true: [1, 2], false: [1, 1] }[String(sameKey) as "true" | "false"],
          refused: [1],
        }[outcome],
      );
      const lastRow = written.at(-1)!;
      expect(lastRow["lastConfirmed"]).toBe(
        {
          written: { true: lastRow["ts"], false: undefined }[String(sameKey) as "true" | "false"],
          refused: undefined,
        }[outcome],
      );
      expect(written.map((r) => r["ts"] as number)).toEqual(
        written.map((r) => r["ts"] as number).sort((x, y) => x - y),
      );
    }

    // A response lost with the bytes written but not all durable is uncertain: it blocks, and truncates nothing.
    const root = bookRoot();
    const file = path.join(root, "docs", "failures.jsonl");
    expect(() =>
      appendLedgerRows(root, "failures", [failureRow()], undefined, {
        operation: "op-torn",
        checkpoint: failAt("written"),
      }),
    ).toThrow();
    const full = fs.readFileSync(file);
    fs.writeFileSync(file, full.subarray(0, full.length - 15));
    const torn = fs.readFileSync(file);
    expect(() =>
      appendLedgerRows(root, "failures", [failureRow()], undefined, { operation: "op-torn" }),
    ).toThrow(/uncertain/i);
    expect(fs.readFileSync(file).equals(torn)).toBe(true);

    // Compact refuses to rewrite a ledger while an operation on it has bytes without a receipt.
    const pending = bookRoot();
    const pendingFile = path.join(pending, "docs", "failures.jsonl");
    expect(() =>
      appendLedgerRows(pending, "failures", [failureRow()], undefined, {
        operation: "op-pending",
        checkpoint: failAt("written"),
      }),
    ).toThrow();
    const before = fs.readFileSync(pendingFile, "utf-8");
    const compacted = await call(
      pending,
      [ledgersCommand],
      ["ledgers", "compact", `--root=${pending}`, "--ledger=failures"],
    );
    expect(compacted.code).not.toBe(0);
    expect(fs.readFileSync(pendingFile, "utf-8")).toBe(before);
    // Replaying the operation completes its receipt without a second row, and then compact may run.
    const done = appendLedgerRows(pending, "failures", [failureRow()], undefined, {
      operation: "op-pending",
    });
    expect(done.receipt).toMatchObject({ offset: 0, rows: [{ key: "parser-drops-last-line" }] });
    expect(rows(pendingFile)).toHaveLength(1);
    expect(
      (
        await call(
          pending,
          [ledgersCommand],
          ["ledgers", "compact", `--root=${pending}`, "--ledger=failures"],
        )
      ).code,
    ).toBe(0);
  });

  it("keeps rendered audit report appended rows and tracker draft counts identical", async () => {
    // A runless audit: a fresh checkout with no status file, run or FID.
    const repo = bookRoot();
    fs.writeFileSync(path.join(repo, "README.md"), "x\n");
    git(repo, ["add", "."]);
    git(repo, ["commit", "-q", "-m", "init"]);
    const inv = await call(repo, COMMANDS, [
      "status",
      "invocation",
      "--standalone=audit",
      "--name=security",
    ]);
    expect(inv.code).toBe(0);
    const invocation = inv.json!["invocation"] as string;

    const result = {
      slug: "security",
      status: "COMPLETE",
      report: "docs/audits/202611/security.md",
      findings: [
        { severity: "HIGH", title: "Token logged", location: "src/a.ts:10" },
        { severity: "LOW", title: "Verbose error", location: "src/b.ts:2" },
        { severity: "LOW", title: "Old cipher", location: "src/c.ts:7" },
      ],
      notChecked: ["Mobile client: no device available"],
    };
    fs.writeFileSync(path.join(repo, "result.json"), JSON.stringify(result));
    const totals = "CRITICAL 0 \u00b7 HIGH 1 \u00b7 MEDIUM 0 \u00b7 LOW 2";

    // 1. The report header and ledger payloads come from the one result.
    const stub = await call(repo, COMMANDS, [
      "steps",
      "stub",
      "--agent=bkit-audit-generate",
      "--result-file=result.json",
      "--to=docs/audits/202611/security-summary.md",
    ]);
    expect(stub.code).toBe(0);
    const summary = fs.readFileSync(
      path.join(repo, "docs/audits/202611/security-summary.md"),
      "utf-8",
    );
    expect(summary).toContain(`Findings: ${totals}`);

    // 2. The same payloads append once under one operation, with the standalone invocation.
    const payload = (stub.json!["ledgerRows"] as Array<Record<string, unknown>>).map(
      ({ by: _by, ...row }) => row,
    );
    fs.writeFileSync(path.join(repo, "rows.json"), JSON.stringify(payload));
    const appendArgs = [
      "ledgers",
      "append",
      `--root=${repo}`,
      "--ledger=failures",
      `--rows=${path.join(repo, "rows.json")}`,
      `--invocation=${invocation}`,
      "--operation=audit-security-1",
    ];
    const appended = await call(repo, [ledgersCommand], appendArgs);
    expect(appended.code).toBe(0);
    const persisted = rows(path.join(repo, "docs", "failures.jsonl"));
    expect(persisted).toHaveLength(3);

    // 3. The tracker draft is rendered from the same result.
    const draft = await call(repo, COMMANDS, [
      "issues",
      "comment",
      "--kind=audit",
      "--audit-slug=security",
      "--result-file=result.json",
    ]);
    expect(draft.code).toBe(0);
    expect(draft.json!["comment"]).toContain(`Findings: ${totals}`);

    // The three surfaces agree: header, persisted rows and draft.
    const bySeverity = (sev: string) => persisted.filter((r) => r["severity"] === sev).length;
    expect(
      `CRITICAL ${bySeverity("CRITICAL")} \u00b7 HIGH ${bySeverity("HIGH")} \u00b7 MEDIUM ${bySeverity("MEDIUM")} \u00b7 LOW ${bySeverity("LOW")}`,
    ).toBe(totals);

    // 4. Replaying the publication appends nothing and returns the original receipt.
    const before = fs.readFileSync(path.join(repo, "docs", "failures.jsonl"), "utf-8");
    const replay = await call(repo, [ledgersCommand], appendArgs);
    expect(replay.code).toBe(0);
    expect(replay.json!["receipt"]).toMatchObject({
      replayed: true,
      operation: "audit-security-1",
    });
    expect(fs.readFileSync(path.join(repo, "docs", "failures.jsonl"), "utf-8")).toBe(before);
    expect(fs.existsSync(path.join(repo, "docs", "plans"))).toBe(false);
  });

  it("resolves a pending ledger intent after its invocation is stale", async () => {
    // The ledger already holds a row, so a later union takes the existing-file path.
    appendLedgerRows(worktree, "failures", [failureRow({ key: "earlier-row" })]);
    const first = resolveInvocation(worktree, await issue(worktree), {});
    const rowNoBy = {
      kind: "failure",
      key: "lost-row",
      summary: "a lost row",
      severity: "HIGH",
      status: "OPEN",
    };

    // The response is lost after the intent is recorded and before the bytes land.
    expect(() =>
      appendLedgerRows(worktree, "failures", [rowNoBy], first, {
        operation: "op-stale",
        checkpoint: failAt("prepared"),
      }),
    ).toThrow();
    const intents = rows(ledgerOperationsFile(worktree)!).filter(
      (r) => r["type"] === "ledger-intent",
    );
    expect(intents).toHaveLength(1);

    // A newer run of the same workflow starts: the first invocation is stale.
    fs.appendFileSync(
      path.join(worktree, STATUS_REL),
      `${JSON.stringify({ type: "workflow-started", workflow: "build", at: "2026-10-29T12:00:00Z" })}\n`,
    );
    expect(() => resolveInvocation(worktree, first.id, {})).toThrow(/stale/);
    const second = resolveInvocation(worktree, await issue(worktree), {});

    // The operation is still reachable: replaying it by id completes it with exactly one row.
    const replay = appendLedgerRows(worktree, "failures", [rowNoBy], second, {
      operation: "op-stale",
    });
    expect(replay.receipt).toMatchObject({ operation: "op-stale", rows: [{ key: "lost-row" }] });
    const ledger = rows(path.join(worktree, "docs", "failures.jsonl"));
    expect(ledger.map((r) => r["key"])).toEqual(["earlier-row", "lost-row"]);

    // A teardown union into this checkout is no longer blocked by the intent.
    fs.mkdirSync(path.join(main, "docs"), { recursive: true });
    fs.writeFileSync(
      path.join(main, "docs", "failures.jsonl"),
      `${JSON.stringify(failureRow({ key: "from-elsewhere", ts: 1, schema: 1 }))}\n`,
    );
    const unioned = await call(
      worktree,
      [ledgersCommand],
      ["ledgers", "union", `--src=${main}`, `--dst=${worktree}`],
    );
    expect(unioned.code).toBe(0);
    expect(unioned.err).not.toContain("replay them first");
  });

  it("appends the printed audit ledgerRows verbatim under the standalone invocation", async () => {
    const repo = bookRoot();
    fs.writeFileSync(path.join(repo, "README.md"), "x\n");
    git(repo, ["add", "."]);
    git(repo, ["commit", "-q", "-m", "init"]);
    const inv = await call(repo, COMMANDS, [
      "status",
      "invocation",
      "--standalone=audit",
      "--name=security",
    ]);
    expect(inv.code).toBe(0);
    fs.writeFileSync(
      path.join(repo, "result.json"),
      JSON.stringify({
        slug: "security",
        status: "COMPLETE",
        report: "docs/audits/202611/security.md",
        findings: [
          { severity: "HIGH", title: "Token logged", location: "src/a.ts:10" },
          { severity: "LOW", title: "Verbose error", location: "src/b.ts:2" },
        ],
        notChecked: [],
      }),
    );
    const stub = await call(repo, COMMANDS, [
      "steps",
      "stub",
      "--agent=bkit-audit-generate",
      "--result-file=result.json",
      "--to=docs/audits/202611/security-summary.md",
    ]);
    expect(stub.code).toBe(0);
    // The printed rows go in exactly as printed, `by` included.
    const printed = stub.json!["ledgerRows"] as Array<Record<string, unknown>>;
    expect(printed).toHaveLength(2);
    fs.writeFileSync(path.join(repo, "rows.json"), JSON.stringify(printed));
    const appended = await call(
      repo,
      [ledgersCommand],
      [
        "ledgers",
        "append",
        `--root=${repo}`,
        "--ledger=failures",
        `--rows=${path.join(repo, "rows.json")}`,
        `--invocation=${inv.json!["invocation"] as string}`,
      ],
    );
    expect(appended.err).not.toContain("disagrees with invocation");
    expect(appended.code).toBe(0);
    expect(rows(path.join(repo, "docs", "failures.jsonl")).map((r) => r["key"])).toEqual(
      printed.map((r) => r["key"]),
    );
  });

  it("refuses to re-append a partly landed block after a foreign writer appended", () => {
    const root = bookRoot();
    const file = path.join(root, "docs", "failures.jsonl");
    const request = [failureRow({ key: "first-landed" }), failureRow({ key: "second-torn" })];
    expect(() =>
      appendLedgerRows(root, "failures", request, undefined, {
        operation: "op-partial",
        checkpoint: failAt("prepared"),
      }),
    ).toThrow();
    const intent = rows(ledgerOperationsFile(root)!).find((r) => r["type"] === "ledger-intent")!;
    const lines = String(intent["block"])
      .split("\n")
      .filter((l) => l !== "");
    expect(lines).toHaveLength(2);

    // The first row and half of the second landed; the response was lost; the lock was cleared.
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, `${lines[0]}\n${lines[1]!.slice(0, Math.floor(lines[1]!.length / 2))}`);
    // A plain append from another writer lands next; it checks no pending intent.
    appendLedgerRows(root, "failures", [failureRow({ key: "foreign-writer" })]);
    const before = fs.readFileSync(file, "utf-8");

    expect(() =>
      appendLedgerRows(root, "failures", request, undefined, { operation: "op-partial" }),
    ).toThrow(/uncertain/i);
    const after = fs.readFileSync(file, "utf-8");
    expect(after).toBe(before);
    expect(after.split('"key":"first-landed"')).toHaveLength(2);
  });

  it("prepares afresh when nothing landed and a foreign row followed", () => {
    const root = bookRoot();
    const file = path.join(root, "docs", "failures.jsonl");
    const request = [failureRow({ key: "ours-never-landed" })];
    expect(() =>
      appendLedgerRows(root, "failures", request, undefined, {
        operation: "op-nothing-landed",
        checkpoint: failAt("prepared"),
      }),
    ).toThrow();
    expect(fs.existsSync(file)).toBe(false);

    // Nothing of ours landed. Another writer's schema-3 row takes the recorded offset.
    appendLedgerRows(root, "failures", [failureRow({ key: "foreign-writer" })]);
    const foreign = fs.readFileSync(file, "utf-8");

    const replay = appendLedgerRows(root, "failures", request, undefined, {
      operation: "op-nothing-landed",
    });
    expect(replay.appended).toBe(1);
    const written = rows(file);
    expect(written.map((r) => r["key"])).toEqual(["foreign-writer", "ours-never-landed"]);
    expect(fs.readFileSync(file, "utf-8").startsWith(foreign)).toBe(true);
    expect(replay.receipt).toMatchObject({ operation: "op-nothing-landed", replayed: false });

    // The operation is settled: a further replay is a pure read and no intent stays pending.
    const bytes = fs.readFileSync(file, "utf-8");
    const again = appendLedgerRows(root, "failures", request, undefined, {
      operation: "op-nothing-landed",
    });
    expect(again.appended).toBe(0);
    expect(fs.readFileSync(file, "utf-8")).toBe(bytes);
    expect(pendingLedgerIntents(ledgerOperationsFile(root)!, "docs/failures.jsonl")).toEqual([]);
  });
});

describe("persistent CI handoff on a real local remote", () => {
  const roots: string[] = [];
  afterEach(() => {
    for (const d of roots.splice(0)) fs.rmSync(d, { recursive: true, force: true });
  });

  const ok = (stdout: string): GhResult => ({ ok: true, stdout, stderr: "", missing: false });
  const rollup = (name: string) =>
    ok(JSON.stringify({ statusCheckRollup: [{ name, status: "QUEUED" }] }));
  const NONE = rollup("vercel");
  const FOUND = rollup("bkit-tests-unit");
  const none = (n: number) => Array.from({ length: n }, () => NONE);

  /** A gh whose `pr view` answers come from `replies` in order (the last repeats); counts the polls. */
  function pollingGh(replies: GhResult[]) {
    let polls = 0;
    const gh: Gh = (args) => {
      if (args[0] !== "pr" || args[1] !== "view")
        return { ok: false, stdout: "", stderr: "HTTP 500", missing: false };
      const reply = replies[Math.min(polls, replies.length - 1)]!;
      polls += 1;
      return reply;
    };
    return { gh, polls: () => polls };
  }

  const instant = async (ms: number) => ms;
  const quiet = (sleep: (ms: number) => Promise<number> = instant) => ({
    sleep,
    log: () => undefined,
  });
  const crashAt = (point: string) => (name: string) => {
    if (name === point) throw new Error(`process lost at ${point}`);
  };

  /** A work clone of a bare remote with one pushed commit; `shared` makes it a run in place on dev. */
  function remoteRepo(branch: string, shared: boolean) {
    const root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-handoff-int-")));
    roots.push(root);
    const remote = path.join(root, "remote.git");
    const work = path.join(root, "work");
    git(root, ["init", "-q", "--bare", "-b", branch, remote]);
    git(root, ["init", "-q", "-b", branch, work]);
    fs.writeFileSync(path.join(work, "package.json"), JSON.stringify({ private: true }));
    git(work, ["add", "package.json"]);
    git(work, ["commit", "-q", "-m", "base"]);
    git(work, ["remote", "add", "origin", remote]);
    git(work, ["push", "-q", "-u", "origin", branch]);
    if (shared) {
      git(work, ["commit", "-q", "--allow-empty", "-m", "foreign local commit"]);
      writeRecord(work, newRecord(work, "1-x", branch));
    }
    git(work, ["commit", "-q", "--allow-empty", "-m", "chore(1-x): close-workflow"]);
    if (shared) appendRecordCommit(work, "1-x", git(work, ["rev-parse", "HEAD"]));
    const status = path.join(root, "logs", "status.jsonl");
    fs.mkdirSync(path.dirname(status), { recursive: true });
    fs.writeFileSync(
      status,
      `${JSON.stringify({ type: "workflow-started", workflow: "build", at: "2026-11-01T00:00:00Z" })}\n`,
    );
    return {
      root,
      remote,
      work,
      status,
      tip: () => git(remote, ["rev-parse", branch]),
      log: () => git(remote, ["log", "--format=%s", branch]).split("\n"),
      retriggers: () =>
        git(remote, ["log", "--format=%s", branch])
          .split("\n")
          .filter((s) => s.includes("re-trigger")).length,
    };
  }

  const options = (
    r: ReturnType<typeof remoteRepo>,
    handoff: { checkpoint?: (name: string) => void } = {},
  ) => ({
    cwd: r.work,
    pr: "7",
    fid: "1-x",
    autoRouteSuffix: "",
    budgetS: 60,
    intervalS: 10,
    retriggered: false,
    handoff: { statusPath: r.status, operation: "handoff-1", ...handoff },
  });
  const handoffRows = (r: ReturnType<typeof remoteRepo>) =>
    rows(r.status).filter((row) => row["type"] === "ci-handoff");

  it("resumes nonwaiting CI polls without resetting attempts or duplicating retrigger", async () => {
    // A poll interrupted after three attempts continues in a fresh process: the budget is not reset.
    const waiting = remoteRepo("feat/1-x", false);
    let sleeps = 0;
    const handedOff = await ciDispatchGate(options(waiting), {
      gh: pollingGh(none(6)).gh,
      ...quiet(async (ms) => {
        sleeps += 1;
        return ms + 6000 * Number(sleeps > 2);
      }),
    });
    expect(handedOff).toMatchObject({ phase: "poll", handoff: 81, attempts: 3 });
    expect(handoffRows(waiting).at(-1)).toMatchObject({
      phase: "poll",
      observation: { result: "none", attempts: 3, errors: 0 },
    });
    const resumedGh = pollingGh(none(30));
    const resumed = await ciDispatchGate(options(waiting), { gh: resumedGh.gh, ...quiet() });
    // 3 more first-poll attempts, then 6 after the one re-trigger: 9 polls, 12 in total.
    expect(resumedGh.polls()).toBe(9);
    expect(resumed.ciDispatch).toMatchObject({ outcome: "no-ci", attempts: 12, retrigger: true });
    expect(waiting.retriggers()).toBe(1);

    // A process lost at each durable checkpoint of the retrigger is resumed to exactly one reachable commit.
    for (const point of ["commit-created", "push-completed", "receipt-completed"] as const) {
      const r = remoteRepo("feat/1-x", false);
      const base = git(r.work, ["rev-parse", "HEAD"]);
      const tipBefore = r.tip();
      const lost = ciDispatchGate(options(r, { checkpoint: crashAt(point) }), {
        gh: pollingGh(none(30)).gh,
        ...quiet(),
      });
      await expect(lost).rejects.toThrow(`process lost at ${point}`);
      const localHead = git(r.work, ["rev-parse", "HEAD"]);
      expect(localHead).not.toBe(base);
      expect(r.retriggers()).toBe(
        { "commit-created": 0, "push-completed": 1, "receipt-completed": 1 }[point],
      );
      expect(r.tip()).toBe(
        {
          "commit-created": tipBefore,
          "push-completed": localHead,
          "receipt-completed": localHead,
        }[point],
      );
      expect(handoffRows(r).at(-1)).toMatchObject({
        phase: {
          "commit-created": "poll",
          "push-completed": "poll",
          "receipt-completed": "repoll",
        }[point],
        retrigger: { state: point, original: base, commit: localHead },
      });

      // The fresh process finishes the interrupted effect: no second commit, no second push, no first poll again.
      const secondGh = pollingGh([FOUND]);
      const finished = await ciDispatchGate(options(r), { gh: secondGh.gh, ...quiet() });
      expect(secondGh.polls()).toBe(1);
      expect(finished.ciDispatch).toMatchObject({
        outcome: "self-healed",
        retrigger: true,
        attempts: 7,
        head: localHead,
      });
      expect(git(r.work, ["rev-parse", "HEAD"])).toBe(localHead);
      expect(r.tip()).toBe(localHead);
      expect(r.retriggers()).toBe(1);
      expect(git(r.remote, ["rev-list", "--count", "feat/1-x"])).toBe("3");
      // The pushed commit owns nothing but itself: its tree is its parent's.
      expect(git(r.remote, ["rev-parse", `${localHead}^{tree}`])).toBe(
        git(r.remote, ["rev-parse", `${localHead}~1^{tree}`]),
      );
      expect(handoffRows(r).at(-1)).toMatchObject({
        phase: "repoll",
        retrigger: {
          state: "receipt-completed",
          original: base,
          commit: localHead,
          ref: "refs/heads/feat/1-x",
          remote: localHead,
          receipt: "handoff-1",
        },
      });

      // A third process after the receipt is a pure read of the same effect.
      const thirdGh = pollingGh([FOUND]);
      const again = await ciDispatchGate(options(r), { gh: thirdGh.gh, ...quiet() });
      expect(again.ciDispatch).toMatchObject({ outcome: "self-healed", retrigger: true });
      expect(r.tip()).toBe(localHead);
      expect(r.retriggers()).toBe(1);
      expect(git(r.work, ["rev-parse", "HEAD"])).toBe(localHead);
    }

    // Unrelated staged content is never published by the retrigger.
    const staged = remoteRepo("feat/1-x", false);
    fs.writeFileSync(path.join(staged.work, "unrelated.txt"), "user work\n");
    git(staged.work, ["add", "unrelated.txt"]);
    const stagedGh = pollingGh([...none(6), FOUND]);
    const stagedRun = await ciDispatchGate(options(staged), { gh: stagedGh.gh, ...quiet() });
    expect(stagedRun.ciDispatch).toMatchObject({ outcome: "self-healed" });
    expect(git(staged.remote, ["ls-tree", "-r", "--name-only", staged.tip()])).not.toContain(
      "unrelated.txt",
    );
    expect(git(staged.remote, ["show", "--name-only", "--format=", staged.tip()])).toBe("");
    expect(git(staged.work, ["diff", "--cached", "--name-only"])).toBe("unrelated.txt");

    // A conflicting remote movement after the commit was made blocks every further effect.
    const moved = remoteRepo("feat/1-x", false);
    await expect(
      ciDispatchGate(options(moved, { checkpoint: crashAt("commit-created") }), {
        gh: pollingGh(none(30)).gh,
        ...quiet(),
      }),
    ).rejects.toThrow("process lost at commit-created");
    const other = path.join(moved.root, "other");
    git(moved.root, ["clone", "-q", "-b", "feat/1-x", moved.remote, other]);
    git(other, ["commit", "-q", "--allow-empty", "-m", "someone else moved the branch"]);
    git(other, ["push", "-q", "origin", "feat/1-x"]);
    const movedTip = moved.tip();
    const blocked = await ciDispatchGate(options(moved), {
      gh: pollingGh([FOUND]).gh,
      ...quiet(),
    });
    expect(blocked).toMatchObject({ handoff: 6, ciDispatch: null });
    expect(moved.tip()).toBe(movedTip);
    expect(moved.retriggers()).toBe(0);
    expect(moved.log()[0]).toBe("someone else moved the branch");
    expect(handoffRows(moved).at(-1)).toMatchObject({ retrigger: { state: "commit-created" } });

    // A run in place on a shared branch pushes only its own commits, even across the interruption.
    const shared = remoteRepo("dev", true);
    await expect(
      ciDispatchGate(options(shared, { checkpoint: crashAt("commit-created") }), {
        gh: pollingGh(none(30)).gh,
        ...quiet(),
      }),
    ).rejects.toThrow("process lost at commit-created");
    expect(shared.retriggers()).toBe(0);
    const sharedGh = pollingGh([FOUND]);
    const sharedRun = await ciDispatchGate(options(shared), { gh: sharedGh.gh, ...quiet() });
    expect(sharedRun.ciDispatch).toMatchObject({ outcome: "self-healed", retrigger: true });
    expect(shared.log()).not.toContain("foreign local commit");
    expect(shared.log()).toContain("chore(1-x): close-workflow");
    expect(shared.retriggers()).toBe(1);
    expect(git(shared.work, ["rev-list", "--count", "--grep=re-trigger", "HEAD"])).toBe("1");
    expect(readRecord(shared.work, "1-x")?.commits).toHaveLength(2);
    expect(handoffRows(shared).at(-1)).toMatchObject({
      retrigger: { state: "receipt-completed", remote: shared.tip(), receipt: "handoff-1" },
    });
  });

  it("blocks a resumed re-trigger push when the remote moved and the tracking ref already holds it", async () => {
    const moved = remoteRepo("feat/1-x", false);
    await expect(
      ciDispatchGate(options(moved, { checkpoint: crashAt("commit-created") }), {
        gh: pollingGh(none(30)).gh,
        ...quiet(),
      }),
    ).rejects.toThrow("process lost at commit-created");

    // Someone else pushes, and a fetch moves origin/<branch> onto their commit.
    const other = path.join(moved.root, "other");
    git(moved.root, ["clone", "-q", "-b", "feat/1-x", moved.remote, other]);
    git(other, ["commit", "-q", "--allow-empty", "-m", "someone else moved the branch"]);
    git(other, ["push", "-q", "origin", "feat/1-x"]);
    const foreign = moved.tip();
    git(moved.work, ["fetch", "-q", "origin"]);
    expect(git(moved.work, ["rev-parse", "origin/feat/1-x"])).toBe(foreign);

    const blocked = await ciDispatchGate(options(moved), {
      gh: pollingGh([FOUND]).gh,
      ...quiet(),
    });
    expect(blocked).toMatchObject({ handoff: 6, ciDispatch: null });
    expect(moved.tip()).toBe(foreign);
    expect(moved.log()[0]).toBe("someone else moved the branch");
    expect(moved.retriggers()).toBe(0);
    expect(handoffRows(moved).at(-1)).toMatchObject({ retrigger: { state: "commit-created" } });
    expect(
      handoffRows(moved).filter(
        (row) => (row["retrigger"] as { state?: string } | undefined)?.state === "push-completed",
      ),
    ).toHaveLength(0);
  });

  it("does not push a second re-trigger copy after a lost push response on a shared branch", async () => {
    const shared = remoteRepo("dev", true);
    await expect(
      ciDispatchGate(options(shared, { checkpoint: crashAt("push-completed") }), {
        gh: pollingGh(none(30)).gh,
        ...quiet(),
      }),
    ).rejects.toThrow("process lost at push-completed");
    // The copy is on the bare remote.
    expect(shared.retriggers()).toBe(1);
    const copy = shared.tip();

    // The push response was lost: nothing after the push persisted. Put the handoff row back to
    // its state before `push-completed` and unmark the shared-checkout record.
    const lines = fs
      .readFileSync(shared.status, "utf-8")
      .split("\n")
      .filter((l) => l !== "");
    const handoffAt = lines
      .map((l, i) => ({ type: (JSON.parse(l) as Record<string, unknown>)["type"], i }))
      .filter((r) => r.type === "ci-handoff");
    const at = handoffAt.at(-1)!.i;
    const last = JSON.parse(lines[at]!) as { retrigger: Record<string, unknown> };
    expect(last.retrigger["state"]).toBe("push-completed");
    const { remote: _remote, ref: _ref, ...rest } = last.retrigger;
    lines[at] = JSON.stringify({ ...last, retrigger: { ...rest, state: "commit-created" } });
    fs.writeFileSync(shared.status, `${lines.join("\n")}\n`);
    const rec = readRecord(shared.work, "1-x")!;
    const { pushed: _pushed, ...unmarked } = rec;
    writeRecord(shared.work, unmarked);

    const resumedGh = pollingGh([FOUND]);
    const resumed = await ciDispatchGate(options(shared), { gh: resumedGh.gh, ...quiet() });
    expect(resumed.ciDispatch).toMatchObject({ outcome: "self-healed", retrigger: true });
    // No second copy was pushed; the remote still ends at the one copy.
    expect(shared.retriggers()).toBe(1);
    expect(shared.tip()).toBe(copy);
    const remoteSha = (handoffRows(shared).at(-1)!["retrigger"] as { remote?: string }).remote;
    expect(remoteSha).toBe(copy);
    expect(git(shared.remote, ["cat-file", "-t", remoteSha!])).toBe("commit");
    expect(handoffRows(shared).at(-1)).toMatchObject({
      retrigger: { state: "receipt-completed", remote: copy },
    });
  });
});

describe("bounded correction on real ledgers", () => {
  const knowledge = (over: Record<string, unknown> = {}) => ({
    kind: "knowledge",
    key: "gotcha",
    summary: "a gotcha worth keeping",
    ...over,
  });
  /** Fails the engine's own row validation after the deterministic fill: nothing is written. */
  const invalidRow = () => knowledge({ status: "BOGUS" });
  const failure = (over: Record<string, unknown> = {}) => ({
    kind: "failure",
    key: "parser-drops-last-line",
    summary: "parser drops the last line",
    severity: "HIGH",
    status: "OPEN",
    ...over,
  });

  const append = (id: string, payload: unknown, ledger: string, ...extra: string[]) => {
    const file = path.join(main, `rows-${ledger}.json`);
    fs.writeFileSync(file, JSON.stringify(payload));
    return call(
      worktree,
      [ledgersCommand],
      [
        "ledgers",
        "append",
        `--root=${worktree}`,
        `--ledger=${ledger}`,
        `--rows=${file}`,
        `--invocation=${id}`,
        ...extra,
      ],
    );
  };
  const lostAt = (point: string) => (name: string) => {
    if (name === point) throw new Error("response lost");
  };
  const statusFile = () => path.join(worktree, STATUS_REL);
  const corrections = () =>
    rows(statusFile()).filter((r) => String(r["type"]).startsWith("correction-"));
  const ledgerBytes = (name: string) => {
    const file = path.join(worktree, "docs", `${name}.jsonl`);
    return fs.existsSync(file) ? fs.readFileSync(file, "utf-8") : "";
  };

  it("resumes corrected substep and blocks exhausted unauthorized or uncertain effects", async () => {
    const first = await issue(worktree, ["--agent=bkit-build-plan-tests"]);

    // A guaranteed no-write rejection after the deterministic fill names its exact sub-step.
    const rejected = await append(first, [invalidRow()], "knowledge", "--operation=op-1");
    expect(rejected.code).toBe(8);
    expect(rejected.json!["error"]).toMatchObject({
      effects: "none",
      correctable: true,
      substep: "append",
    });
    const scope = rejected.json!["error"].scope as string;
    expect(scope).toContain("knowledge");
    expect(ledgerBytes("knowledge")).toBe("");
    expect(corrections()).toEqual([
      expect.objectContaining({
        type: "correction-rejected",
        scope,
        substep: "append",
        operation: "op-1",
        step: "build-plan-tests",
      }),
    ]);

    // The corrected candidate carries a fresh immutable operation and resumes the same sub-step.
    const fixed = await append(
      first,
      [knowledge()],
      "knowledge",
      "--operation=op-2",
      "--correction-of=op-1",
    );
    expect(fixed.code).toBe(0);
    expect(fixed.json).toMatchObject({
      appended: 1,
      receipt: { operation: "op-2", replayed: false },
      correction: {
        scope,
        operation: "op-2",
        of: "op-1",
        used: 1,
        limit: 2,
        substep: "append",
        verified: true,
      },
    });
    expect(rows(path.join(worktree, "docs", "knowledge.jsonl"))).toHaveLength(1);
    expect(corrections().map((r) => r["type"])).toEqual([
      "correction-rejected",
      "correction-candidate",
      "correction-succeeded",
    ]);
    expect(corrections().every((r) => r["scope"] === scope)).toBe(true);

    // Replaying the corrected operation after a lost response returns its receipt and spends nothing.
    const bytes = ledgerBytes("knowledge");
    const replay = await append(
      first,
      [knowledge()],
      "knowledge",
      "--operation=op-2",
      "--correction-of=op-1",
    );
    expect(replay.code).toBe(0);
    expect(replay.json!["receipt"]).toMatchObject({ operation: "op-2", replayed: true });
    expect(replay.json!["correction"]).toMatchObject({ used: 1 });
    expect(ledgerBytes("knowledge")).toBe(bytes);

    // A candidate must continue the sub-step it corrects: another ledger or an unknown rejection is refused.
    const elsewhere = await append(
      first,
      [failure()],
      "failures",
      "--operation=op-x",
      "--correction-of=op-1",
    );
    expect(elsewhere.code).toBe(2);
    const unknown = await append(
      first,
      [knowledge({ key: "other" })],
      "knowledge",
      "--operation=op-y",
      "--correction-of=never-rejected",
    );
    expect(unknown.code).toBe(2);
    expect(ledgerBytes("failures")).toBe("");
    expect(ledgerBytes("knowledge")).toBe(bytes);

    // Two corrected retries per scope, however many invocations, operations or helpers ask.
    const idA = await issue(worktree, [], "build-plan-verify");
    const idB = await issue(worktree, [], "build-plan-verify");
    const firstReject = await append(idA, [invalidRow()], "knowledge", "--operation=op-a");
    expect(firstReject.json!["error"]).toMatchObject({ correctable: true });
    const scope2 = firstReject.json!["error"].scope as string;
    expect(scope2).not.toBe(scope);
    const retryOne = await append(
      idB,
      [invalidRow()],
      "knowledge",
      "--operation=op-b",
      "--correction-of=op-a",
    );
    expect(retryOne.code).toBe(8);
    expect(retryOne.json!["error"]).toMatchObject({ correctable: true, scope: scope2 });
    const retryTwo = await append(
      idA,
      [invalidRow()],
      "knowledge",
      "--operation=op-c",
      "--correction-of=op-a",
    );
    expect(retryTwo.code).toBe(8);
    const before = ledgerBytes("knowledge");
    for (const [id, operationFlag] of [
      [idB, "--operation=op-d"],
      [idA, "--issue-operation"],
    ] as const) {
      const exhausted = await append(
        id,
        [knowledge({ key: "valid-but-late" })],
        "knowledge",
        operationFlag,
        "--correction-of=op-a",
      );
      expect(exhausted.code).toBe(1);
      expect(exhausted.json!["error"]).toMatchObject({
        effects: "none",
        correctable: false,
        exhausted: true,
        scope: scope2,
      });
    }
    expect(ledgerBytes("knowledge")).toBe(before);
    // The shared counter agrees: the same scope has no correction left for any other caller.
    const counter = await call(worktree, COMMANDS, [
      "counters",
      "correction",
      `--file=${statusFile()}`,
      "--workflow=build",
      `--scope=${scope2}`,
      "--operation=op-z",
    ]);
    expect(counter.code).toBe(1);
    expect(counter.json).toMatchObject({ allowed: false, used: 2, limit: 2 });

    // An authorship conflict is a permission refusal, never auto-corrected.
    const idC = await issue(worktree, [], "build-plan-gaps-remediate");
    const unauthorized = await append(
      idC,
      [knowledge({ key: "forged", by: { subagent: "someone-else" } })],
      "knowledge",
      "--operation=op-auth",
    );
    expect(unauthorized.code).toBe(8);
    expect(unauthorized.err).toMatch(/conflict/i);
    expect(unauthorized.json?.["error"]?.correctable).not.toBe(true);
    const retryAuth = await append(
      idC,
      [knowledge({ key: "forged" })],
      "knowledge",
      "--operation=op-auth-2",
      "--correction-of=op-auth",
    );
    expect(retryAuth.code).toBe(2);
    expect(ledgerBytes("knowledge")).toBe(before);

    // An uncertain earlier effect on the ledger blocks any corrected candidate: nothing is appended.
    const idD = await issue(worktree, [], "build-challenge");
    const failureRejected = await append(
      idD,
      [failure({ status: "BOGUS" })],
      "failures",
      "--operation=op-f1",
    );
    expect(failureRejected.json!["error"]).toMatchObject({ correctable: true });
    expect(() =>
      appendLedgerRows(
        worktree,
        "failures",
        [failure({ by: { workflow: "build", step: "build-challenge" } })],
        undefined,
        {
          operation: "op-torn",
          checkpoint: lostAt("written"),
        },
      ),
    ).toThrow();
    const torn = fs.readFileSync(path.join(worktree, "docs", "failures.jsonl"));
    fs.writeFileSync(
      path.join(worktree, "docs", "failures.jsonl"),
      torn.subarray(0, torn.length - 15),
    );
    const cut = ledgerBytes("failures");
    const uncertain = await append(
      idD,
      [failure({ key: "second-failure" })],
      "failures",
      "--operation=op-f2",
      "--correction-of=op-f1",
    );
    expect(uncertain.code).not.toBe(0);
    expect(uncertain.json!["error"]).toMatchObject({ effects: "uncertain", correctable: false });
    expect(ledgerBytes("failures")).toBe(cut);
    expect(corrections().filter((r) => r["type"] === "correction-succeeded")).toHaveLength(1);
  });
});
