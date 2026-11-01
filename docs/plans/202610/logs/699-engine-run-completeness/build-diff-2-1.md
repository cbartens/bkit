diff --git a/.bkit/core/.bkit/jsonl.md b/.bkit/core/.bkit/jsonl.md
index 0f549f181..c062c51c3 100644
--- a/.bkit/core/.bkit/jsonl.md
+++ b/.bkit/core/.bkit/jsonl.md
@@ -49,7 +49,7 @@ One file per `kind`; writers:
 | `counter` | `.bkit/stats.jsonl` | `bkit workflows close` of design / plan / build / debug / ship (attempt counters) |
 | `chat` | `harvest/stats.jsonl` (bkit repo only) | bkit's harvest script: per agent chat on the maintainer's machine, any repo or host |
 | `run` | `harvest/stats.jsonl` (bkit repo only) | Same script: per workflow run in the run logs of every repo a chat ran in |
-| `friction` | `.bkit/friction.jsonl` | orchestrator workflows (design / plan / build / debug / ship / auto) on observed friction |
+| `friction` | `.bkit/friction.jsonl` | orchestrator workflows (design / plan / build / debug / ship / auto) on observed friction; the engine itself, as the active workflow, on a bkit command's undeclared non-zero exit (`category: "tool-failure"`, `scope: "bkit-repo"`, in the active run's own book root; `BKIT_ENGINE_JOURNAL=off` disables it) |
 | `deferral` | `docs/deferrals.jsonl` | `@bkit-design-generate`, `@bkit-plan-generate`, `@bkit-plan-update`, `@bkit-debug-abort-handover`, `@bkit-ship-deferred-sweep` (adjudication only), `@bkit-utility-update-deferrals` (close / triage / locator), build orchestrator (`LOW` challenge finding → `low-severity`, through `bkit challenge merge`), ship orchestrator (assumed accept nobody confirmed → `needs-decision`, through `bkit decisions pending --defer`) |
 | `failure` | `docs/failures.jsonl` | any agent on a discovered bug; `@bkit-debug-abort-handover`; `@bkit-audit-generate` (`MEDIUM`+ findings; rerun closes rows it no longer finds); `@bkit-utility-update-failures` (close / triage / locator) |
 | `knowledge` | `docs/knowledge.jsonl` | `@bkit-build-plan-execute`, `@bkit-build-plan-gaps-remediate`, `@bkit-debug-failure-remediate` (after verified fix), `@bkit-utility-update-knowledge` (supersede / correct) |
@@ -256,7 +256,7 @@ Free-form; closest term, `other` if none. `deferral` + `failure` → domain set;
 | `permission-prompt` | tool / permission approval prompt |
 | `agent-rework` | agent redo / self-correction |
 | `manual-install` | manual dependency / tool install |
-| `tool-failure` | tool / command error |
+| `tool-failure` | tool / command error; the engine writes it on a bkit command's exit that is neither a shared routing code nor one of the verb's own `exitCodes`, or on a non-`CommandError` throw. `key` = `<noun>-<verb>/<step>` (`<step>` = the command's `--step=`, else `<noun>-<verb>`), kept under 60 chars because the identity-gated prune truncates a friction key at about 68; a recurrence raises `recurrenceCount` on the one row |
 | `destructive-backout` | reverted a destructive action |
 | `other` | none of the above |
 
diff --git a/.bkit/core/engine/commands/lib.test.ts b/.bkit/core/engine/commands/lib.test.ts
index ce9ba47ef..5bb1b22de 100644
--- a/.bkit/core/engine/commands/lib.test.ts
+++ b/.bkit/core/engine/commands/lib.test.ts
@@ -198,6 +198,39 @@ const OMITTING: CommandSpec = {
   },
 };
 
+const ODD: CommandSpec = {
+  noun: "widgets",
+  summary: "journal probe",
+  verbs: {
+    odd: {
+      summary: "exits 9, which it does not declare",
+      flags: [],
+      output: { odd: "n" },
+      run: (ctx) => {
+        ctx.emit({ odd: 1 });
+        return 9;
+      },
+    },
+    declared: {
+      summary: "exits 4, which it declares",
+      flags: [],
+      output: {},
+      exitCodes: { 4: "declared" },
+      run: () => 4,
+    },
+    fine: { summary: "exits 0", flags: [], output: {}, run: () => EXIT.OK },
+    "needs-human": { summary: "exits 82", flags: [], output: {}, run: () => EXIT.NEEDS_HUMAN },
+    boom: {
+      summary: "throws",
+      flags: [],
+      output: {},
+      run: () => {
+        throw new Error("boom");
+      },
+    },
+  },
+};
+
 function harness() {
   const out: string[] = [];
   const err: string[] = [];
@@ -258,6 +291,69 @@ describe("runCommand", () => {
     expect(h.err).toEqual(["[bkit-widgets] a human has to look\n"]);
   });
 
+  it("passes the command's exit code through when the journal write throws", async () => {
+    const calls: string[] = [];
+    const journal = {
+      call: () => {
+        calls.push("call");
+        throw new Error("disk full");
+      },
+      failure: () => {
+        calls.push("failure");
+        throw new Error("disk full");
+      },
+    };
+    const h = harness();
+    const code = await runCommand(["widgets", "odd"], [ODD], {
+      classicVerbs: new Set(),
+      io: { stdout: (t) => h.out.push(t), stderr: (t) => h.err.push(t) },
+      journal,
+    });
+    expect(code).toBe(9);
+    expect(calls).toEqual(["call", "failure"]);
+    expect(h.out).toEqual(["odd: 1\n"]);
+  });
+
+  it("logs one [bkit-telemetry] line when the journal throws, however many writes fail", async () => {
+    const journal = {
+      call: () => {
+        throw new Error("disk full");
+      },
+      failure: () => {
+        throw new Error("disk full");
+      },
+    };
+    const h = harness();
+    await runCommand(["widgets", "odd"], [ODD], {
+      classicVerbs: new Set(),
+      io: { stdout: (t) => h.out.push(t), stderr: (t) => h.err.push(t) },
+      journal,
+    });
+    expect(h.err).toEqual(["[bkit-telemetry] journal write failed: disk full\n"]);
+  });
+
+  it("hands the journal the failure only for an undeclared exit", async () => {
+    const seen: Array<[string, number | null]> = [];
+    const journal = {
+      call: () => {},
+      failure: (i: { verb: string; code: number | null }) => {
+        seen.push([i.verb, i.code]);
+      },
+    };
+    const io = { stdout: () => {}, stderr: () => {} };
+    await runCommand(["widgets", "odd"], [ODD], { classicVerbs: new Set(), io, journal });
+    await runCommand(["widgets", "declared"], [ODD], { classicVerbs: new Set(), io, journal });
+    await runCommand(["widgets", "fine"], [ODD], { classicVerbs: new Set(), io, journal });
+    await runCommand(["widgets", "needs-human"], [ODD], { classicVerbs: new Set(), io, journal });
+    await expect(
+      runCommand(["widgets", "boom"], [ODD], { classicVerbs: new Set(), io, journal }),
+    ).rejects.toThrow("boom");
+    expect(seen).toEqual([
+      ["odd", 9],
+      ["boom", null],
+    ]);
+  });
+
   it("refuses a second JSON object", async () => {
     await expect(harness().run(["widgets", "twice"])).rejects.toThrow("emitted twice");
   });
diff --git a/.bkit/core/engine/commands/lib.ts b/.bkit/core/engine/commands/lib.ts
index 8b5c1bbbf..1637c9fc9 100644
--- a/.bkit/core/engine/commands/lib.ts
+++ b/.bkit/core/engine/commands/lib.ts
@@ -13,7 +13,17 @@ import * as fs from "node:fs";
 import * as os from "node:os";
 import * as path from "node:path";
 
-import { gitEnv } from "../ledgers/telemetry.js";
+import {
+  appendFrictionRow,
+  appendJournalRow,
+  engineCallRow,
+  frictionRow,
+  journalEnabled,
+  shouldRecordFriction,
+} from "../ledgers/journal.js";
+import { fold, type StatusEvent } from "../ledgers/status.js";
+import { gitEnv, resolveGitSha } from "../ledgers/telemetry.js";
+import { parseJson } from "../shared/json.js";
 import { renderText } from "../shared/text.js";
 
 // ---------------------------------------------------------------------------
@@ -306,6 +316,182 @@ function omitNote(spec: VerbSpec, key: string): string {
   return typeof o === "string" ? " (--json only)" : " (text: only when it matters)";
 }
 
+// ---------------------------------------------------------------------------
+// Journal seam — what `runCommand` records while a workflow run is active
+// ---------------------------------------------------------------------------
+
+export interface JournalInput {
+  noun: string;
+  verb: string;
+  /** The argv after the verb; the journal keeps flag names only. */
+  argv: string[];
+  flags: Record<string, FlagValue>;
+  cwd: string;
+}
+
+/** The two writes the seam makes; injectable so a test can make either throw. */
+export interface Journal {
+  /** One `engine-call` row at dispatch entry. */
+  call(input: JournalInput): void;
+  /** One `tool-failure` friction row; `code` is null when the command threw. */
+  failure(input: JournalInput & { code: number | null }): void;
+}
+
+/** The active run a call is attributed to: its `status.jsonl` and the root its other books live under. */
+export interface ActiveRun {
+  workflow: string;
+  file: string;
+  bookRoot: string;
+}
+
+/** Row types `fold` reads; the other rows a `status.jsonl` carries (engine-call, ...) stay out of it. */
+const FOLD_TYPES = new Set([
+  "workflow-started",
+  "step-done",
+  "workflow-meta",
+  "workflow-done",
+  "workflow-failed",
+]);
+
+/** Most `status.jsonl` files `resolveActiveRun` reads when it walks a checkout. */
+const ACTIVE_RUN_SCAN_CAP = 500;
+
+/** The workflow of the last run in `file` when that run is IN_PROGRESS, else undefined. */
+function inProgressWorkflow(file: string): string | undefined {
+  if (!fs.existsSync(file)) return undefined;
+  const events: StatusEvent[] = [];
+  for (const line of fs.readFileSync(file, "utf-8").split("\n")) {
+    if (line.trim() === "") continue;
+    const parsed = parseJson(line);
+    if (!parsed.ok || parsed.value === null || typeof parsed.value !== "object") continue;
+    const type = (parsed.value as { type?: unknown }).type;
+    if (typeof type === "string" && FOLD_TYPES.has(type)) events.push(parsed.value as StatusEvent);
+  }
+  const last = fold(events).at(-1);
+  return last?.status === "IN_PROGRESS" ? last.workflow : undefined;
+}
+
+/** The directories under `dir`, by name; none when `dir` is missing. */
+function subdirs(dir: string): string[] {
+  if (!fs.existsSync(dir)) return [];
+  return fs
+    .readdirSync(dir, { withFileTypes: true })
+    .filter((e) => e.isDirectory())
+    .map((e) => e.name);
+}
+
+/**
+ * The run a command call belongs to, or undefined. In order: the command's own
+ * `--file`; `--fid` (+ `--month`, default this UTC month) through `statusLocation`;
+ * the single IN_PROGRESS run among the `docs/plans/<month>/logs/<fid>/status.jsonl`
+ * files under the cwd's git toplevel (capped). From the main checkout a feature
+ * worktree's run is not found, so an out-of-worktree call is skipped, never
+ * attributed to another run. Reads with this module's own `node:fs` and `parseJson`
+ * and folds with `ledgers/status.ts`, so it never imports a `commands/**` module.
+ */
+export function resolveActiveRun(opts: {
+  cwd: string;
+  file?: string;
+  fid?: string;
+  month?: string;
+  workflow?: string;
+}): ActiveRun | undefined {
+  if (opts.file !== undefined) {
+    const file = path.resolve(opts.cwd, opts.file);
+    const workflow = inProgressWorkflow(file);
+    const logs = path.dirname(path.dirname(file));
+    if (
+      workflow === undefined ||
+      path.basename(file) !== "status.jsonl" ||
+      path.basename(logs) !== "logs" ||
+      path.basename(path.dirname(path.dirname(logs))) !== "plans"
+    ) {
+      return undefined;
+    }
+    return {
+      workflow,
+      file,
+      bookRoot: path.dirname(path.dirname(path.dirname(path.dirname(logs)))),
+    };
+  }
+  if (opts.fid !== undefined) {
+    try {
+      const loc = statusLocation({
+        cwd: opts.cwd,
+        workflow: opts.workflow ?? "build",
+        fid: opts.fid,
+        month: opts.month ?? utcMonth(),
+      });
+      const workflow = inProgressWorkflow(loc.path);
+      if (workflow !== undefined) return { workflow, file: loc.path, bookRoot: loc.bookRoot };
+    } catch (err) {
+      if (!(err instanceof CommandError)) throw err;
+    }
+  }
+  const top = git(opts.cwd, ["rev-parse", "--show-toplevel"]);
+  if (top === null) return undefined;
+  const found: ActiveRun[] = [];
+  let read = 0;
+  for (const month of subdirs(path.join(top, "docs", "plans"))) {
+    for (const fid of subdirs(path.join(top, "docs", "plans", month, "logs"))) {
+      if (++read > ACTIVE_RUN_SCAN_CAP) return undefined;
+      const file = path.join(top, statusRelPath(month, fid));
+      const workflow = inProgressWorkflow(file);
+      if (workflow !== undefined) found.push({ workflow, file, bookRoot: top });
+    }
+  }
+  return found.length === 1 ? found[0] : undefined;
+}
+
+/** The journal `runCommand` uses unless a caller injects one: writes into the active run's own books. */
+function engineJournal(): Journal {
+  let resolved = false;
+  let run: ActiveRun | undefined;
+  const active = (i: JournalInput): ActiveRun | undefined => {
+    if (!resolved) {
+      resolved = true;
+      const text = (v: FlagValue) => (typeof v === "string" ? v : undefined);
+      run = resolveActiveRun({
+        cwd: i.cwd,
+        file: text(i.flags["file"]),
+        fid: text(i.flags["fid"]),
+        month: text(i.flags["month"]),
+        workflow: text(i.flags["workflow"]),
+      });
+    }
+    return run;
+  };
+  return {
+    call(i) {
+      if (!journalEnabled()) return;
+      const r = active(i);
+      if (r === undefined) return;
+      const wrote = appendJournalRow(
+        r.file,
+        engineCallRow({ workflow: r.workflow, noun: i.noun, verb: i.verb, flags: i.argv }),
+      );
+      if (!wrote.ok) throw new Error(wrote.error);
+    },
+    failure(i) {
+      if (!journalEnabled()) return;
+      const r = active(i);
+      if (r === undefined) return;
+      const step = i.flags["step"];
+      const row = frictionRow({
+        workflow: r.workflow,
+        step: typeof step === "string" ? step : undefined,
+        noun: i.noun,
+        verb: i.verb,
+        code: i.code,
+        bookRoot: r.bookRoot,
+        parentSha: resolveGitSha("HEAD", r.bookRoot),
+      });
+      const wrote = appendFrictionRow(r.bookRoot, row);
+      if (!wrote.ok) throw new Error(wrote.error);
+    },
+  };
+}
+
 /**
  * Run `argv` (without the leading `bkit`) if it names a registered command.
  * Returns the exit code, or null when `argv` is not a command, so the caller falls
@@ -317,7 +503,7 @@ function omitNote(spec: VerbSpec, key: string): string {
 export async function runCommand(
   argv: string[],
   commands: readonly CommandSpec[],
-  options: { classicVerbs: ReadonlySet<string>; cwd?: string; io?: Io },
+  options: { classicVerbs: ReadonlySet<string>; cwd?: string; io?: Io; journal?: Journal },
 ): Promise<number | null> {
   const io = options.io ?? processIo;
   const cmd = commands.find((c) => c.noun === argv[0]);
@@ -354,6 +540,25 @@ export async function runCommand(
       io.stdout(ctx.json ? `${JSON.stringify(output)}\n` : renderText(textOutput(spec, output)));
     },
   };
+  // The journal never changes the verb's exit code, output or throw: each write is
+  // swallowed, and the first failure logs one line.
+  const journal = options.journal ?? engineJournal();
+  let journalWarned = false;
+  const guarded = (write: () => void) => {
+    try {
+      write();
+    } catch (err) {
+      if (journalWarned) return;
+      journalWarned = true;
+      io.stderr(`[bkit-telemetry] journal write failed: ${(err as Error).message}\n`);
+    }
+  };
+  const excluded = new Set(
+    [...Object.keys(SHARED_EXIT_CODES), ...Object.keys(spec.exitCodes ?? {})].map(Number),
+  );
+  let input: JournalInput | undefined;
+  /** undefined: not dispatched; null: the verb threw; a number: its exit code. */
+  let outcome: number | null | undefined;
   try {
     const own = rest.filter((arg) => arg !== JSON_FLAG);
     if (own.some((arg) => arg.startsWith(`${JSON_FLAG}=`))) {
@@ -361,11 +566,23 @@ export async function runCommand(
     }
     ctx.json = own.length !== rest.length;
     ctx.flags = parseFlags(own, spec.flags);
-    return await spec.run(ctx);
+    input = { noun: cmd.noun, verb, argv: rest, flags: ctx.flags, cwd: ctx.cwd };
+    const entered = input;
+    guarded(() => journal.call(entered));
+    outcome = null;
+    const code = await spec.run(ctx);
+    outcome = code;
+    return code;
   } catch (err) {
     if (!(err instanceof CommandError)) throw err;
     io.stderr(`${tag} ${err.message}\n`);
+    outcome = err.code;
     return err.code;
+  } finally {
+    if (input !== undefined && outcome !== undefined && shouldRecordFriction(outcome, excluded)) {
+      const failed = { ...input, code: outcome };
+      guarded(() => journal.failure(failed));
+    }
   }
 }
 
diff --git a/.bkit/core/engine/ledgers/journal.integration.test.ts b/.bkit/core/engine/ledgers/journal.integration.test.ts
new file mode 100644
index 000000000..39e16f2ee
--- /dev/null
+++ b/.bkit/core/engine/ledgers/journal.integration.test.ts
@@ -0,0 +1,157 @@
+// journal.integration.test.ts — boundary: the real filesystem and real git worktrees.
+//
+// Drives the real `runCommand` from a temp repo whose `.worktrees/{fid}` is a real git
+// worktree holding an IN_PROGRESS `status.jsonl`, and asserts the bytes the dispatch seam
+// wrote: the friction row in the WORKTREE's `.bkit/friction.jsonl` (spike C4: `repoRoot(cwd)`
+// from a worktree resolves to the main checkout, a different inode), nothing in the main
+// checkout's, and nothing at all when no run is active in the cwd.
+
+import { spawnSync } from "node:child_process";
+import * as fs from "node:fs";
+import * as os from "node:os";
+import * as path from "node:path";
+
+import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
+
+import { runCommand, type CommandSpec } from "../commands/lib";
+
+const FID = "901-journal";
+const STATUS_REL = path.join("docs", "plans", "202610", "logs", FID, "status.jsonl");
+
+const ODD: CommandSpec = {
+  noun: "widgets",
+  summary: "journal probe",
+  verbs: {
+    odd: {
+      summary: "exits 9, which it does not declare",
+      flags: [{ name: "step", type: "string", help: "step" }],
+      output: {},
+      run: () => 9,
+    },
+    "needs-human": {
+      summary: "exits 82",
+      flags: [],
+      output: {},
+      run: () => 82,
+    },
+  },
+};
+
+function git(cwd: string, args: string[]): string {
+  const res = spawnSync("git", ["-c", "user.name=t", "-c", "user.email=t@t", ...args], {
+    cwd,
+    encoding: "utf-8",
+  });
+  if (res.status !== 0) throw new Error(`git ${args.join(" ")}: ${res.stderr}`);
+  return res.stdout.trim();
+}
+
+let main: string;
+let worktree: string;
+
+beforeEach(() => {
+  vi.stubEnv("BKIT_ENGINE_JOURNAL", "on");
+  main = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-journal-int-")));
+  git(main, ["init", "-q", "-b", "dev"]);
+  fs.writeFileSync(path.join(main, "README.md"), "x\n");
+  git(main, ["add", "."]);
+  git(main, ["commit", "-q", "-m", "init"]);
+  worktree = path.join(main, ".worktrees", FID);
+  git(main, ["worktree", "add", "-q", "-b", `feat/${FID}`, worktree]);
+  const status = path.join(worktree, STATUS_REL);
+  fs.mkdirSync(path.dirname(status), { recursive: true });
+  fs.writeFileSync(
+    status,
+    `${JSON.stringify({ type: "workflow-started", workflow: "build", at: "2026-10-29T10:00:00Z" })}\n`,
+  );
+});
+
+afterEach(() => {
+  vi.unstubAllEnvs();
+  fs.rmSync(main, { recursive: true, force: true });
+});
+
+async function run(cwd: string, argv: string[]): Promise<{ code: number | null; err: string[] }> {
+  const err: string[] = [];
+  const code = await runCommand(argv, [ODD], {
+    classicVerbs: new Set(),
+    cwd,
+    io: { stdout: () => {}, stderr: (t) => err.push(t) },
+  });
+  return { code, err };
+}
+
+const rows = (file: string): Array<Record<string, unknown>> =>
+  fs.existsSync(file)
+    ? fs
+        .readFileSync(file, "utf-8")
+        .split("\n")
+        .filter((l) => l !== "")
+        .map((l) => JSON.parse(l) as Record<string, unknown>)
+    : [];
+
+describe("the dispatch seam on a real worktree", () => {
+  it("writes friction to the run's own book root", async () => {
+    const { code, err } = await run(worktree, ["widgets", "odd", "--step=build-summary"]);
+    expect(code).toBe(9);
+    expect(err).toEqual([]);
+
+    const friction = rows(path.join(worktree, ".bkit", "friction.jsonl"));
+    expect(friction).toHaveLength(1);
+    expect(friction[0]).toMatchObject({
+      kind: "friction",
+      key: "widgets-odd/build-summary",
+      category: "tool-failure",
+      scope: "bkit-repo",
+      by: { workflow: "build", step: "build-summary" },
+    });
+    expect(fs.existsSync(path.join(main, ".bkit", "friction.jsonl"))).toBe(false);
+
+    const call = rows(path.join(worktree, STATUS_REL)).filter((r) => r["type"] === "engine-call");
+    expect(call).toHaveLength(1);
+    expect(call[0]).toMatchObject({
+      workflow: "build",
+      noun: "widgets",
+      verb: "odd",
+      flags: ["step"],
+    });
+  });
+
+  it("writes no friction row for a declared routing exit", async () => {
+    expect((await run(worktree, ["widgets", "needs-human"])).code).toBe(82);
+    expect(fs.existsSync(path.join(worktree, ".bkit", "friction.jsonl"))).toBe(false);
+    expect(
+      rows(path.join(worktree, STATUS_REL)).filter((r) => r["type"] === "engine-call"),
+    ).toHaveLength(1);
+  });
+
+  it("skips a call made outside the run's worktree", async () => {
+    const { code, err } = await run(main, ["widgets", "odd"]);
+    expect(code).toBe(9);
+    expect(err).toEqual([]);
+    const calls = () =>
+      rows(path.join(worktree, STATUS_REL)).filter((r) => r["type"] === "engine-call");
+    expect(calls()).toEqual([]);
+    expect(fs.existsSync(path.join(worktree, ".bkit", "friction.jsonl"))).toBe(false);
+    expect(fs.existsSync(path.join(main, ".bkit", "friction.jsonl"))).toBe(false);
+    // Control: the same verb from inside the worktree is journaled, so the empty read above is the skip.
+    await run(worktree, ["widgets", "odd"]);
+    expect(calls()).toHaveLength(1);
+  });
+
+  it("writes nothing when no run is active in the cwd", async () => {
+    const status = path.join(worktree, STATUS_REL);
+    const saved = fs.readFileSync(status, "utf-8");
+    fs.rmSync(path.join(worktree, "docs"), { recursive: true });
+    const { code, err } = await run(worktree, ["widgets", "odd"]);
+    expect(code).toBe(9);
+    expect(err).toEqual([]);
+    expect(fs.existsSync(path.join(worktree, ".bkit", "friction.jsonl"))).toBe(false);
+    expect(fs.existsSync(path.join(worktree, "docs"))).toBe(false);
+    // Control: with the run back, the same call is journaled.
+    fs.mkdirSync(path.dirname(status), { recursive: true });
+    fs.writeFileSync(status, saved);
+    await run(worktree, ["widgets", "odd"]);
+    expect(rows(status).filter((r) => r["type"] === "engine-call")).toHaveLength(1);
+  });
+});
diff --git a/.bkit/core/engine/ledgers/journal.test.ts b/.bkit/core/engine/ledgers/journal.test.ts
new file mode 100644
index 000000000..c84b6f75a
--- /dev/null
+++ b/.bkit/core/engine/ledgers/journal.test.ts
@@ -0,0 +1,149 @@
+import * as fs from "node:fs";
+import * as os from "node:os";
+import * as path from "node:path";
+
+import { afterEach, describe, expect, it } from "vitest";
+
+import {
+  appendFrictionRow,
+  appendJournalRow,
+  engineCallRow,
+  frictionKey,
+  frictionRow,
+  journalEnabled,
+  shouldRecordFriction,
+} from "./journal";
+import { validate, writerProblem } from "./telemetry";
+
+const dirs: string[] = [];
+const tmp = () => {
+  const d = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-journal-"));
+  dirs.push(d);
+  return d;
+};
+afterEach(() => {
+  for (const d of dirs.splice(0)) fs.rmSync(d, { recursive: true, force: true });
+});
+
+const SHARED = new Set([0, 1, 2, 80, 81, 82]);
+const own = (root: string, over: Partial<Parameters<typeof frictionRow>[0]> = {}) =>
+  frictionRow({
+    workflow: "build",
+    step: "build-summary",
+    noun: "workflows",
+    verb: "summary",
+    code: 9,
+    bookRoot: root,
+    parentSha: "a".repeat(40),
+    ...over,
+  });
+
+describe("shouldRecordFriction", () => {
+  it("writes no friction row for a declared routing exit", () => {
+    const excluded = new Set([...SHARED, 3, 4]);
+    for (const code of [0, 1, 2, 3, 4, 80, 81, 82]) {
+      expect(shouldRecordFriction(code, excluded)).toBe(false);
+    }
+    expect(shouldRecordFriction(9, excluded)).toBe(true);
+    expect(shouldRecordFriction(null, excluded)).toBe(true);
+  });
+});
+
+describe("frictionRow", () => {
+  it("never leaves by.step empty", () => {
+    const root = tmp();
+    for (const step of [undefined, ""]) {
+      const row = own(root, { step });
+      expect((row["by"] as { step: string }).step).toBe("workflows-summary");
+      expect(row["key"]).toBe("workflows-summary/workflows-summary");
+      expect(validate(row)).toEqual({ ok: true });
+      expect(writerProblem(row)).toBeUndefined();
+    }
+    const named = own(root);
+    expect((named["by"] as { step: string }).step).toBe("build-summary");
+    expect(named["key"]).toBe(frictionKey("workflows", "summary", "build-summary"));
+    expect(named["category"]).toBe("tool-failure");
+    expect(validate(named)).toEqual({ ok: true });
+  });
+
+  it("keeps the key under the identity-gated prune's truncation bound", () => {
+    expect(frictionKey("workflows", "summary", "s".repeat(200)).length).toBeLessThanOrEqual(60);
+  });
+
+  it("writes a friction row with no run object when parentSha is unresolvable", () => {
+    const root = tmp();
+    const row = own(root, { parentSha: "" });
+    expect(row).not.toHaveProperty("run");
+    expect(validate(row)).toEqual({ ok: true });
+    expect(appendFrictionRow(root, row)).toEqual({ ok: true });
+    const line = fs.readFileSync(path.join(root, ".bkit", "friction.jsonl"), "utf-8");
+    expect(JSON.parse(line)).not.toHaveProperty("run");
+    expect(own(root)["run"]).toEqual({ parentSha: "a".repeat(40) });
+  });
+});
+
+describe("appendFrictionRow", () => {
+  it("raises recurrenceCount on a same-key row", () => {
+    const root = tmp();
+    expect(appendFrictionRow(root, own(root))).toEqual({ ok: true });
+    expect(appendFrictionRow(root, own(root))).toEqual({ ok: true });
+    expect(appendFrictionRow(root, own(root))).toEqual({ ok: true });
+    appendFrictionRow(root, own(root, { step: "build-other" }));
+    const lines = fs
+      .readFileSync(path.join(root, ".bkit", "friction.jsonl"), "utf-8")
+      .trim()
+      .split("\n")
+      .map((l) => JSON.parse(l) as Record<string, unknown>);
+    expect(lines).toHaveLength(2);
+    expect(lines[0]!["recurrenceCount"]).toBe(3);
+    expect(lines[1]!["recurrenceCount"]).toBeUndefined();
+  });
+
+  it("returns a failed result instead of throwing when the row is refused", () => {
+    const root = tmp();
+    const result = appendFrictionRow(root, own(root, { workflow: "audit" }));
+    expect(result.ok).toBe(false);
+    expect(fs.existsSync(path.join(root, ".bkit", "friction.jsonl"))).toBe(false);
+  });
+});
+
+describe("engineCallRow", () => {
+  it("journals flag names only", () => {
+    const row = engineCallRow({
+      workflow: "build",
+      at: "2026-10-29T10:00:00Z",
+      noun: "steps",
+      verb: "finish",
+      flags: ["--step=build-summary", "--token=SECRET", "--file", "/home/me/x", "--json"],
+    });
+    expect(row).toEqual({
+      type: "engine-call",
+      workflow: "build",
+      at: "2026-10-29T10:00:00Z",
+      noun: "steps",
+      verb: "finish",
+      flags: ["step", "token", "file", "json"],
+    });
+    expect(JSON.stringify(row)).not.toMatch(/SECRET|\/home\/me|build-summary/);
+  });
+});
+
+describe("appendJournalRow", () => {
+  it("appends one status line and reports a failed write instead of throwing", () => {
+    const root = tmp();
+    const file = path.join(root, "status.jsonl");
+    const row = engineCallRow({ workflow: "build", noun: "a", verb: "b", flags: [] });
+    expect(appendJournalRow(file, row)).toEqual({ ok: true });
+    expect(fs.readFileSync(file, "utf-8").trim().split("\n")).toHaveLength(1);
+    const bad = appendJournalRow(path.join(root, "missing", "status.jsonl"), row);
+    expect(bad.ok).toBe(false);
+  });
+});
+
+describe("journalEnabled", () => {
+  it("writes no row when BKIT_ENGINE_JOURNAL is off", () => {
+    expect(journalEnabled({ BKIT_ENGINE_JOURNAL: "off" })).toBe(false);
+    expect(journalEnabled({ BKIT_ENGINE_JOURNAL: "on" })).toBe(true);
+    expect(journalEnabled({})).toBe(true);
+  });
+});
diff --git a/.bkit/core/engine/ledgers/journal.ts b/.bkit/core/engine/ledgers/journal.ts
new file mode 100644
index 000000000..9825d67b5
--- /dev/null
+++ b/.bkit/core/engine/ledgers/journal.ts
@@ -0,0 +1,202 @@
+// ledgers/journal.ts — the dispatch seam's row primitives.
+//
+// `commands/lib.ts` `runCommand` writes two kinds of row while a workflow run is
+// active: an `engine-call` row in the run's `status.jsonl` (one per bkit command
+// dispatched) and a `friction` row in the run's own `.bkit/friction.jsonl` (one per
+// unexpected non-zero exit). This module builds and appends them. It is a leaf:
+// it imports only `node:*`, `../shared/json.js`, `./status.js` and `./telemetry.js`, never a `commands/**`
+// module, so `lib.ts` can import it without a cycle. The caller passes in the exit
+// codes that are declared routing (`SHARED_EXIT_CODES` plus the verb's own).
+//
+// Every export is synchronous and never throws; a write returns a result object the
+// caller logs and swallows, so the journal can never change a command's exit code.
+
+import * as fs from "node:fs";
+import * as path from "node:path";
+
+import { parseJson } from "../shared/json.js";
+import { appendLine, statusTimestamp } from "./status.js";
+import {
+  APPEND_LEDGERS,
+  SCHEMA,
+  mintTs,
+  resolveRepoSlug,
+  validate,
+  writerProblem,
+} from "./telemetry.js";
+
+export type JournalResult = { ok: true } | { ok: false; error: string };
+
+/** The kill switch: `BKIT_ENGINE_JOURNAL=off` keeps the seam from writing any row. */
+export function journalEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
+  return env["BKIT_ENGINE_JOURNAL"] !== "off";
+}
+
+/** Flag names in `argv` (`--name=value` and `--name value` both give `name`); values are never kept. */
+function flagNames(argv: readonly string[]): string[] {
+  const names = argv
+    .filter((arg) => arg.startsWith("--") && arg.length > 2)
+    .map((arg) => {
+      const eq = arg.indexOf("=");
+      return arg.slice(2, eq === -1 ? undefined : eq);
+    });
+  return [...new Set(names)];
+}
+
+export type EngineCallRow = {
+  type: "engine-call";
+  workflow: string;
+  at: string;
+  noun: string;
+  verb: string;
+  /** Flag names only, never values. */
+  flags: string[];
+};
+
+/** The `status.jsonl` row recording that a bkit command was dispatched. `flags` is the raw argv after the verb. */
+export function engineCallRow(input: {
+  workflow: string;
+  at?: string;
+  noun: string;
+  verb: string;
+  flags: readonly string[];
+}): EngineCallRow {
+  return {
+    type: "engine-call",
+    workflow: input.workflow,
+    at: input.at ?? statusTimestamp(),
+    noun: input.noun,
+    verb: input.verb,
+    flags: flagNames(input.flags),
+  };
+}
+
+/** True when `code` (null = the command threw) is not a declared routing exit. */
+export function shouldRecordFriction(
+  code: number | null,
+  excludedCodes: ReadonlySet<number>,
+): boolean {
+  return code === null || !excludedCodes.has(code);
+}
+
+/**
+ * Dedup key `<noun>-<verb>/<step>`. The identity-gated prune truncates a friction
+ * key at about 68 characters, so two longer keys with one prefix collide; the key
+ * stays under KEY_LIMIT by clipping the step.
+ */
+export function frictionKey(noun: string, verb: string, step: string): string {
+  const head = `${noun}-${verb}/`;
+  return head + step.slice(0, Math.max(0, KEY_LIMIT - head.length));
+}
+
+const KEY_LIMIT = 60;
+
+/** `bkit.version` from `<bookRoot>/.bkit/version`; "unknown" when unreadable. */
+function pinnedVersion(bookRoot: string): string {
+  const file = path.join(bookRoot, ".bkit", "version");
+  if (!fs.existsSync(file)) return "unknown";
+  const hit = /"pinnedVersion"\s*:\s*"([^"]+)"/.exec(fs.readFileSync(file, "utf-8"));
+  return hit?.[1] ?? "unknown";
+}
+
+/**
+ * The `tool-failure` friction row for an unexpected exit. `by.step` is the failing
+ * command's own `--step=` value, else the `<noun>-<verb>` sentinel, so it is never
+ * empty. `run` carries `parentSha` only when it resolved.
+ */
+export function frictionRow(input: {
+  workflow: string;
+  step?: string;
+  noun: string;
+  verb: string;
+  code: number | null;
+  bookRoot: string;
+  parentSha?: string;
+}): Record<string, unknown> {
+  const step = input.step && input.step !== "" ? input.step : `${input.noun}-${input.verb}`;
+  const how = input.code === null ? "threw an unhandled error" : `exited ${input.code}`;
+  const row: Record<string, unknown> = {
+    schema: SCHEMA,
+    ts: mintTs(),
+    kind: "friction",
+    key: frictionKey(input.noun, input.verb, step),
+    repo: resolveRepoSlug(input.bookRoot) || "unknown/repo",
+    bkit: { version: pinnedVersion(input.bookRoot) },
+    by: { workflow: input.workflow, step },
+    category: "tool-failure",
+    scope: "bkit-repo",
+    severity: "MEDIUM",
+    summary: `bkit ${input.noun} ${input.verb} ${how}`,
+    description: `\`bkit ${input.noun} ${input.verb}\` ${how} at ${step}; the code is not one the command declares as routing.`,
+    source: "orchestrator",
+    status: "OPEN",
+  };
+  if (input.parentSha !== undefined && input.parentSha !== "") {
+    row["run"] = { parentSha: input.parentSha };
+  }
+  return row;
+}
+
+/** Append one `engine-call` row to a run's `status.jsonl`. */
+export function appendJournalRow(file: string, row: EngineCallRow): JournalResult {
+  try {
+    fs.appendFileSync(file, appendLine(row));
+    return { ok: true };
+  } catch (err) {
+    return { ok: false, error: (err as Error).message };
+  }
+}
+
+/**
+ * Append a friction row to `<bookRoot>/.bkit/friction.jsonl`, or raise the
+ * `recurrenceCount` of the one existing same-`key` row in place.
+ */
+export function appendFrictionRow(bookRoot: string, row: Record<string, unknown>): JournalResult {
+  const checked = validate(row);
+  if (!checked.ok) return { ok: false, error: checked.reason ?? "invalid friction row" };
+  const who = writerProblem(row);
+  if (who !== undefined) return { ok: false, error: who };
+  const file = path.join(bookRoot, APPEND_LEDGERS.friction.file);
+  try {
+    fs.mkdirSync(path.dirname(file), { recursive: true });
+    const text = fs.existsSync(file) ? fs.readFileSync(file, "utf-8") : "";
+    const lines = text.split("\n");
+    const at = lines.map((line) => sameKey(line, row["key"])).lastIndexOf(true);
+    if (at === -1) {
+      fs.appendFileSync(
+        file,
+        `${text !== "" && !text.endsWith("\n") ? "\n" : ""}${JSON.stringify(row)}\n`,
+      );
+      return { ok: true };
+    }
+    const prior = readRow(lines[at]!) ?? {};
+    const count = typeof prior["recurrenceCount"] === "number" ? prior["recurrenceCount"] : 1;
+    lines[at] = JSON.stringify({
+      ...prior,
+      recurrenceCount: count + 1,
+      lastConfirmed: row["ts"],
+    });
+    const tmp = `${file}.${process.pid}.tmp`;
+    fs.writeFileSync(tmp, lines.join("\n"));
+    fs.renameSync(tmp, file);
+    return { ok: true };
+  } catch (err) {
+    return { ok: false, error: (err as Error).message };
+  }
+}
+
+/** True when `line` is a friction row with this `key`. */
+function sameKey(line: string, key: unknown): boolean {
+  if (!line.includes(`"key":${JSON.stringify(key)}`)) return false;
+  const parsed = readRow(line);
+  return parsed?.["kind"] === "friction" && parsed["key"] === key;
+}
+
+function readRow(line: string): Record<string, unknown> | undefined {
+  const parsed = parseJson(line);
+  if (!parsed.ok) return undefined;
+  const value = parsed.value;
+  return value !== null && typeof value === "object" && !Array.isArray(value)
+    ? (value as Record<string, unknown>)
+    : undefined;
+}
diff --git a/.bkit/jsonl.md b/.bkit/jsonl.md
index 02d3c89e7..d06b68a9b 100644
--- a/.bkit/jsonl.md
+++ b/.bkit/jsonl.md
@@ -49,7 +49,7 @@ One file per `kind`; writers:
 | `counter` | `.bkit/stats.jsonl` | `bkit workflows close` of design / plan / build / debug / ship (attempt counters) |
 | `chat` | `harvest/stats.jsonl` (bkit repo only) | bkit's harvest script: per agent chat on the maintainer's machine, any repo or host |
 | `run` | `harvest/stats.jsonl` (bkit repo only) | Same script: per workflow run in the run logs of every repo a chat ran in |
-| `friction` | `.bkit/friction.jsonl` | orchestrator workflows (design / plan / build / debug / ship / auto) on observed friction |
+| `friction` | `.bkit/friction.jsonl` | orchestrator workflows (design / plan / build / debug / ship / auto) on observed friction; the engine itself, as the active workflow, on a bkit command's undeclared non-zero exit (`category: "tool-failure"`, `scope: "bkit-repo"`, in the active run's own book root; `BKIT_ENGINE_JOURNAL=off` disables it) |
 | `deferral` | `docs/deferrals.jsonl` | `@bkit-design-generate`, `@bkit-plan-generate`, `@bkit-plan-update`, `@bkit-debug-abort-handover`, `@bkit-ship-deferred-sweep` (adjudication only), `@bkit-utility-update-deferrals` (close / triage / locator), build orchestrator (`LOW` challenge finding → `low-severity`, through `bkit challenge merge`), ship orchestrator (assumed accept nobody confirmed → `needs-decision`, through `bkit decisions pending --defer`) |
 | `failure` | `docs/failures.jsonl` | any agent on a discovered bug; `@bkit-debug-abort-handover`; `@bkit-audit-generate` (`MEDIUM`+ findings; rerun closes rows it no longer finds); `@bkit-utility-update-failures` (close / triage / locator) |
 | `knowledge` | `docs/knowledge.jsonl` | `@bkit-build-plan-execute`, `@bkit-build-plan-gaps-remediate`, `@bkit-debug-failure-remediate` (after verified fix), `@bkit-utility-update-knowledge` (supersede / correct) |
@@ -256,7 +256,7 @@ Free-form; closest term, `other` if none. `deferral` + `failure` → domain set;
 | `permission-prompt` | tool / permission approval prompt |
 | `agent-rework` | agent redo / self-correction |
 | `manual-install` | manual dependency / tool install |
-| `tool-failure` | tool / command error |
+| `tool-failure` | tool / command error; the engine writes it on a bkit command's exit that is neither a shared routing code nor one of the verb's own `exitCodes`, or on a non-`CommandError` throw. `key` = `<noun>-<verb>/<step>` (`<step>` = the command's `--step=`, else `<noun>-<verb>`), kept under 60 chars because the identity-gated prune truncates a friction key at about 68; a recurrence raises `recurrenceCount` on the one row |
 | `destructive-backout` | reverted a destructive action |
 | `other` | none of the above |
 
diff --git a/.bkit/version b/.bkit/version
index 3d62500ff..24813fe66 100644
--- a/.bkit/version
+++ b/.bkit/version
@@ -224,7 +224,7 @@
     ".bkit/cloud.md": "c06cf16e2553d0e1ecfac5ae16c1ca4439c488b6eb68300cbb38b0524f72ed47",
     ".bkit/comparison.md": "55c9cc956a824f699898e66dd9a9bd7534d984d29e095187e37ed0229e9e01e5",
     ".bkit/install.md": "406ba71349bc016d164a2119eeb35836bb0451eae03b92f54e134df07e921c46",
-    ".bkit/jsonl.md": "f1b9dfbbe99cad4be0dba3dda44386022d27324bff0a2d4c8ffe3664962cd020",
+    ".bkit/jsonl.md": "d15bd44b1d987b3046ee08b4b6409ae391e79c6387255dd5d462acc471600b5f",
     ".bkit/providers.md": "9b1486ca46eb2ee3c6637700ddcf7e2cadf32979e85d0336c12378de23d61ca5",
     ".bkit/prompts.md": "11073ff6c2402286452b27472d8b104d89fdf34eb50080adbc3255bd795a7c11",
     ".bkit/trackers.md": "189cac5e7f50b729b2c1a3e7b7e5bee875556a227273521d904537b748e11986",
diff --git a/dist/commands/lib.js b/dist/commands/lib.js
index 83a081dec..01f19bcb8 100644
--- a/dist/commands/lib.js
+++ b/dist/commands/lib.js
@@ -11,7 +11,10 @@ import { spawnSync } from "node:child_process";
 import * as fs from "node:fs";
 import * as os from "node:os";
 import * as path from "node:path";
-import { gitEnv } from "../ledgers/telemetry.js";
+import { appendFrictionRow, appendJournalRow, engineCallRow, frictionRow, journalEnabled, shouldRecordFriction, } from "../ledgers/journal.js";
+import { fold } from "../ledgers/status.js";
+import { gitEnv, resolveGitSha } from "../ledgers/telemetry.js";
+import { parseJson } from "../shared/json.js";
 import { renderText } from "../shared/text.js";
 // ---------------------------------------------------------------------------
 // Exit codes
@@ -211,6 +214,154 @@ function omitNote(spec, key) {
         return "";
     return typeof o === "string" ? " (--json only)" : " (text: only when it matters)";
 }
+/** Row types `fold` reads; the other rows a `status.jsonl` carries (engine-call, ...) stay out of it. */
+const FOLD_TYPES = new Set([
+    "workflow-started",
+    "step-done",
+    "workflow-meta",
+    "workflow-done",
+    "workflow-failed",
+]);
+/** Most `status.jsonl` files `resolveActiveRun` reads when it walks a checkout. */
+const ACTIVE_RUN_SCAN_CAP = 500;
+/** The workflow of the last run in `file` when that run is IN_PROGRESS, else undefined. */
+function inProgressWorkflow(file) {
+    if (!fs.existsSync(file))
+        return undefined;
+    const events = [];
+    for (const line of fs.readFileSync(file, "utf-8").split("\n")) {
+        if (line.trim() === "")
+            continue;
+        const parsed = parseJson(line);
+        if (!parsed.ok || parsed.value === null || typeof parsed.value !== "object")
+            continue;
+        const type = parsed.value.type;
+        if (typeof type === "string" && FOLD_TYPES.has(type))
+            events.push(parsed.value);
+    }
+    const last = fold(events).at(-1);
+    return last?.status === "IN_PROGRESS" ? last.workflow : undefined;
+}
+/** The directories under `dir`, by name; none when `dir` is missing. */
+function subdirs(dir) {
+    if (!fs.existsSync(dir))
+        return [];
+    return fs
+        .readdirSync(dir, { withFileTypes: true })
+        .filter((e) => e.isDirectory())
+        .map((e) => e.name);
+}
+/**
+ * The run a command call belongs to, or undefined. In order: the command's own
+ * `--file`; `--fid` (+ `--month`, default this UTC month) through `statusLocation`;
+ * the single IN_PROGRESS run among the `docs/plans/<month>/logs/<fid>/status.jsonl`
+ * files under the cwd's git toplevel (capped). From the main checkout a feature
+ * worktree's run is not found, so an out-of-worktree call is skipped, never
+ * attributed to another run. Reads with this module's own `node:fs` and `parseJson`
+ * and folds with `ledgers/status.ts`, so it never imports a `commands/**` module.
+ */
+export function resolveActiveRun(opts) {
+    if (opts.file !== undefined) {
+        const file = path.resolve(opts.cwd, opts.file);
+        const workflow = inProgressWorkflow(file);
+        const logs = path.dirname(path.dirname(file));
+        if (workflow === undefined ||
+            path.basename(file) !== "status.jsonl" ||
+            path.basename(logs) !== "logs" ||
+            path.basename(path.dirname(path.dirname(logs))) !== "plans") {
+            return undefined;
+        }
+        return {
+            workflow,
+            file,
+            bookRoot: path.dirname(path.dirname(path.dirname(path.dirname(logs)))),
+        };
+    }
+    if (opts.fid !== undefined) {
+        try {
+            const loc = statusLocation({
+                cwd: opts.cwd,
+                workflow: opts.workflow ?? "build",
+                fid: opts.fid,
+                month: opts.month ?? utcMonth(),
+            });
+            const workflow = inProgressWorkflow(loc.path);
+            if (workflow !== undefined)
+                return { workflow, file: loc.path, bookRoot: loc.bookRoot };
+        }
+        catch (err) {
+            if (!(err instanceof CommandError))
+                throw err;
+        }
+    }
+    const top = git(opts.cwd, ["rev-parse", "--show-toplevel"]);
+    if (top === null)
+        return undefined;
+    const found = [];
+    let read = 0;
+    for (const month of subdirs(path.join(top, "docs", "plans"))) {
+        for (const fid of subdirs(path.join(top, "docs", "plans", month, "logs"))) {
+            if (++read > ACTIVE_RUN_SCAN_CAP)
+                return undefined;
+            const file = path.join(top, statusRelPath(month, fid));
+            const workflow = inProgressWorkflow(file);
+            if (workflow !== undefined)
+                found.push({ workflow, file, bookRoot: top });
+        }
+    }
+    return found.length === 1 ? found[0] : undefined;
+}
+/** The journal `runCommand` uses unless a caller injects one: writes into the active run's own books. */
+function engineJournal() {
+    let resolved = false;
+    let run;
+    const active = (i) => {
+        if (!resolved) {
+            resolved = true;
+            const text = (v) => (typeof v === "string" ? v : undefined);
+            run = resolveActiveRun({
+                cwd: i.cwd,
+                file: text(i.flags["file"]),
+                fid: text(i.flags["fid"]),
+                month: text(i.flags["month"]),
+                workflow: text(i.flags["workflow"]),
+            });
+        }
+        return run;
+    };
+    return {
+        call(i) {
+            if (!journalEnabled())
+                return;
+            const r = active(i);
+            if (r === undefined)
+                return;
+            const wrote = appendJournalRow(r.file, engineCallRow({ workflow: r.workflow, noun: i.noun, verb: i.verb, flags: i.argv }));
+            if (!wrote.ok)
+                throw new Error(wrote.error);
+        },
+        failure(i) {
+            if (!journalEnabled())
+                return;
+            const r = active(i);
+            if (r === undefined)
+                return;
+            const step = i.flags["step"];
+            const row = frictionRow({
+                workflow: r.workflow,
+                step: typeof step === "string" ? step : undefined,
+                noun: i.noun,
+                verb: i.verb,
+                code: i.code,
+                bookRoot: r.bookRoot,
+                parentSha: resolveGitSha("HEAD", r.bookRoot),
+            });
+            const wrote = appendFrictionRow(r.bookRoot, row);
+            if (!wrote.ok)
+                throw new Error(wrote.error);
+        },
+    };
+}
 /**
  * Run `argv` (without the leading `bkit`) if it names a registered command.
  * Returns the exit code, or null when `argv` is not a command, so the caller falls
@@ -256,6 +407,25 @@ export async function runCommand(argv, commands, options) {
             io.stdout(ctx.json ? `${JSON.stringify(output)}\n` : renderText(textOutput(spec, output)));
         },
     };
+    // The journal never changes the verb's exit code, output or throw: each write is
+    // swallowed, and the first failure logs one line.
+    const journal = options.journal ?? engineJournal();
+    let journalWarned = false;
+    const guarded = (write) => {
+        try {
+            write();
+        }
+        catch (err) {
+            if (journalWarned)
+                return;
+            journalWarned = true;
+            io.stderr(`[bkit-telemetry] journal write failed: ${err.message}\n`);
+        }
+    };
+    const excluded = new Set([...Object.keys(SHARED_EXIT_CODES), ...Object.keys(spec.exitCodes ?? {})].map(Number));
+    let input;
+    /** undefined: not dispatched; null: the verb threw; a number: its exit code. */
+    let outcome;
     try {
         const own = rest.filter((arg) => arg !== JSON_FLAG);
         if (own.some((arg) => arg.startsWith(`${JSON_FLAG}=`))) {
@@ -263,14 +433,27 @@ export async function runCommand(argv, commands, options) {
         }
         ctx.json = own.length !== rest.length;
         ctx.flags = parseFlags(own, spec.flags);
-        return await spec.run(ctx);
+        input = { noun: cmd.noun, verb, argv: rest, flags: ctx.flags, cwd: ctx.cwd };
+        const entered = input;
+        guarded(() => journal.call(entered));
+        outcome = null;
+        const code = await spec.run(ctx);
+        outcome = code;
+        return code;
     }
     catch (err) {
         if (!(err instanceof CommandError))
             throw err;
         io.stderr(`${tag} ${err.message}\n`);
+        outcome = err.code;
         return err.code;
     }
+    finally {
+        if (input !== undefined && outcome !== undefined && shouldRecordFriction(outcome, excluded)) {
+            const failed = { ...input, code: outcome };
+            guarded(() => journal.failure(failed));
+        }
+    }
 }
 // ---------------------------------------------------------------------------
 // Repo facts
diff --git a/dist/ledgers/journal.js b/dist/ledgers/journal.js
new file mode 100644
index 000000000..5ef49fd95
--- /dev/null
+++ b/dist/ledgers/journal.js
@@ -0,0 +1,156 @@
+// ledgers/journal.ts — the dispatch seam's row primitives.
+//
+// `commands/lib.ts` `runCommand` writes two kinds of row while a workflow run is
+// active: an `engine-call` row in the run's `status.jsonl` (one per bkit command
+// dispatched) and a `friction` row in the run's own `.bkit/friction.jsonl` (one per
+// unexpected non-zero exit). This module builds and appends them. It is a leaf:
+// it imports only `node:*`, `../shared/json.js`, `./status.js` and `./telemetry.js`, never a `commands/**`
+// module, so `lib.ts` can import it without a cycle. The caller passes in the exit
+// codes that are declared routing (`SHARED_EXIT_CODES` plus the verb's own).
+//
+// Every export is synchronous and never throws; a write returns a result object the
+// caller logs and swallows, so the journal can never change a command's exit code.
+import * as fs from "node:fs";
+import * as path from "node:path";
+import { parseJson } from "../shared/json.js";
+import { appendLine, statusTimestamp } from "./status.js";
+import { APPEND_LEDGERS, SCHEMA, mintTs, resolveRepoSlug, validate, writerProblem, } from "./telemetry.js";
+/** The kill switch: `BKIT_ENGINE_JOURNAL=off` keeps the seam from writing any row. */
+export function journalEnabled(env = process.env) {
+    return env["BKIT_ENGINE_JOURNAL"] !== "off";
+}
+/** Flag names in `argv` (`--name=value` and `--name value` both give `name`); values are never kept. */
+function flagNames(argv) {
+    const names = argv
+        .filter((arg) => arg.startsWith("--") && arg.length > 2)
+        .map((arg) => {
+        const eq = arg.indexOf("=");
+        return arg.slice(2, eq === -1 ? undefined : eq);
+    });
+    return [...new Set(names)];
+}
+/** The `status.jsonl` row recording that a bkit command was dispatched. `flags` is the raw argv after the verb. */
+export function engineCallRow(input) {
+    return {
+        type: "engine-call",
+        workflow: input.workflow,
+        at: input.at ?? statusTimestamp(),
+        noun: input.noun,
+        verb: input.verb,
+        flags: flagNames(input.flags),
+    };
+}
+/** True when `code` (null = the command threw) is not a declared routing exit. */
+export function shouldRecordFriction(code, excludedCodes) {
+    return code === null || !excludedCodes.has(code);
+}
+/**
+ * Dedup key `<noun>-<verb>/<step>`. The identity-gated prune truncates a friction
+ * key at about 68 characters, so two longer keys with one prefix collide; the key
+ * stays under KEY_LIMIT by clipping the step.
+ */
+export function frictionKey(noun, verb, step) {
+    const head = `${noun}-${verb}/`;
+    return head + step.slice(0, Math.max(0, KEY_LIMIT - head.length));
+}
+const KEY_LIMIT = 60;
+/** `bkit.version` from `<bookRoot>/.bkit/version`; "unknown" when unreadable. */
+function pinnedVersion(bookRoot) {
+    const file = path.join(bookRoot, ".bkit", "version");
+    if (!fs.existsSync(file))
+        return "unknown";
+    const hit = /"pinnedVersion"\s*:\s*"([^"]+)"/.exec(fs.readFileSync(file, "utf-8"));
+    return hit?.[1] ?? "unknown";
+}
+/**
+ * The `tool-failure` friction row for an unexpected exit. `by.step` is the failing
+ * command's own `--step=` value, else the `<noun>-<verb>` sentinel, so it is never
+ * empty. `run` carries `parentSha` only when it resolved.
+ */
+export function frictionRow(input) {
+    const step = input.step && input.step !== "" ? input.step : `${input.noun}-${input.verb}`;
+    const how = input.code === null ? "threw an unhandled error" : `exited ${input.code}`;
+    const row = {
+        schema: SCHEMA,
+        ts: mintTs(),
+        kind: "friction",
+        key: frictionKey(input.noun, input.verb, step),
+        repo: resolveRepoSlug(input.bookRoot) || "unknown/repo",
+        bkit: { version: pinnedVersion(input.bookRoot) },
+        by: { workflow: input.workflow, step },
+        category: "tool-failure",
+        scope: "bkit-repo",
+        severity: "MEDIUM",
+        summary: `bkit ${input.noun} ${input.verb} ${how}`,
+        description: `\`bkit ${input.noun} ${input.verb}\` ${how} at ${step}; the code is not one the command declares as routing.`,
+        source: "orchestrator",
+        status: "OPEN",
+    };
+    if (input.parentSha !== undefined && input.parentSha !== "") {
+        row["run"] = { parentSha: input.parentSha };
+    }
+    return row;
+}
+/** Append one `engine-call` row to a run's `status.jsonl`. */
+export function appendJournalRow(file, row) {
+    try {
+        fs.appendFileSync(file, appendLine(row));
+        return { ok: true };
+    }
+    catch (err) {
+        return { ok: false, error: err.message };
+    }
+}
+/**
+ * Append a friction row to `<bookRoot>/.bkit/friction.jsonl`, or raise the
+ * `recurrenceCount` of the one existing same-`key` row in place.
+ */
+export function appendFrictionRow(bookRoot, row) {
+    const checked = validate(row);
+    if (!checked.ok)
+        return { ok: false, error: checked.reason ?? "invalid friction row" };
+    const who = writerProblem(row);
+    if (who !== undefined)
+        return { ok: false, error: who };
+    const file = path.join(bookRoot, APPEND_LEDGERS.friction.file);
+    try {
+        fs.mkdirSync(path.dirname(file), { recursive: true });
+        const text = fs.existsSync(file) ? fs.readFileSync(file, "utf-8") : "";
+        const lines = text.split("\n");
+        const at = lines.map((line) => sameKey(line, row["key"])).lastIndexOf(true);
+        if (at === -1) {
+            fs.appendFileSync(file, `${text !== "" && !text.endsWith("\n") ? "\n" : ""}${JSON.stringify(row)}\n`);
+            return { ok: true };
+        }
+        const prior = readRow(lines[at]) ?? {};
+        const count = typeof prior["recurrenceCount"] === "number" ? prior["recurrenceCount"] : 1;
+        lines[at] = JSON.stringify({
+            ...prior,
+            recurrenceCount: count + 1,
+            lastConfirmed: row["ts"],
+        });
+        const tmp = `${file}.${process.pid}.tmp`;
+        fs.writeFileSync(tmp, lines.join("\n"));
+        fs.renameSync(tmp, file);
+        return { ok: true };
+    }
+    catch (err) {
+        return { ok: false, error: err.message };
+    }
+}
+/** True when `line` is a friction row with this `key`. */
+function sameKey(line, key) {
+    if (!line.includes(`"key":${JSON.stringify(key)}`))
+        return false;
+    const parsed = readRow(line);
+    return parsed?.["kind"] === "friction" && parsed["key"] === key;
+}
+function readRow(line) {
+    const parsed = parseJson(line);
+    if (!parsed.ok)
+        return undefined;
+    const value = parsed.value;
+    return value !== null && typeof value === "object" && !Array.isArray(value)
+        ? value
+        : undefined;
+}
diff --git a/docs/architecture.md b/docs/architecture.md
index 7a2122d48..1de069a1f 100644
--- a/docs/architecture.md
+++ b/docs/architecture.md
@@ -65,6 +65,7 @@ cbartens/bkit (this repo)
 │   │   └── after/               # Phase 3 — index.ts runs one file per group of findings (auth, github,
 │   │                            #   vercel, ci-yml, tools, managed); checklist formatter
 │   ├── ledgers/                 # JSONL ledger codecs
+│   │   ├── journal.ts           # Dispatch-seam row primitives (leaf: no `commands/**` import): `engine-call` status row, `tool-failure` friction row, dedup key, `BKIT_ENGINE_JOURNAL` kill switch; `commands/lib.ts` `runCommand` calls it
 │   │   ├── migrate.ts           # Install / upgrade rewrite of ledger rows without `schema` into the current shape via `normalize`; `isSchemaLedger` keeps ledgers out of canonicalHashes
 │   │   ├── status.ts            # status.jsonl workflow-log contract + fold reducer + invariant validator (the `bkit status` verb lives in commands/install/doctor.ts)
 │   │   └── telemetry.ts         # Unified JSONL telemetry codec — TelemetryEvent union, normalize/parse/fold/foldFrom/validate/totalsProblem/appendLine (#234 WS-1)
diff --git a/scripts/harvest/ledgers.integration.test.ts b/scripts/harvest/ledgers.integration.test.ts
index 9730b7866..8af88d65b 100644
--- a/scripts/harvest/ledgers.integration.test.ts
+++ b/scripts/harvest/ledgers.integration.test.ts
@@ -7,7 +7,7 @@
 // The pruning tests cover: the store accumulates, malformed lines are never pruned,
 // unharvested rows survive.
 
-import { execSync } from "node:child_process";
+import { execSync, spawnSync } from "node:child_process";
 import * as fs from "node:fs";
 import * as os from "node:os";
 import * as path from "node:path";
@@ -24,6 +24,7 @@ import {
   stampRepo,
 } from "./ledgers";
 import { normalize, type TelemetryEvent } from "../../.bkit/core/engine/ledgers/telemetry";
+import { requireTsx } from "../../vitest.tsx-bin";
 
 interface FileSnapshot {
   content: string;
@@ -646,3 +647,88 @@ describe("consumerPathToSlug — resolves from the consumer's git remote", () =>
     expect(consumerPathToSlug(dir)).toBe("no-remote-app");
   });
 });
+
+// ---------------------------------------------------------------------------
+// A row the engine's dispatch seam wrote survives `ledgers commit` and the harvest
+// ---------------------------------------------------------------------------
+
+// The row is the seam's own output: the real CLI runs in a real worktree that holds an
+// active run, one verb fails with an undeclared exit, and the seam appends the friction
+// row to the run's own `.bkit/friction.jsonl`. Nothing here is a seeded row.
+describe("Harvest: a friction row the dispatch seam wrote", () => {
+  const FID = "902-seam";
+  const CLI = path.resolve(__dirname, "../../.bkit/core/engine/cli.ts");
+
+  const git = (cwd: string, args: string[]): string => {
+    const res = spawnSync("git", args, { cwd, encoding: "utf-8" });
+    if (res.status !== 0) throw new Error(`git ${args.join(" ")}: ${res.stderr}`);
+    return res.stdout.trim();
+  };
+
+  const bkit = (cwd: string, args: string[], journal: "on" | "off") =>
+    spawnSync(requireTsx(), [CLI, ...args], {
+      cwd,
+      encoding: "utf-8",
+      env: { ...process.env, NODE_NO_WARNINGS: "1", BKIT_ENGINE_JOURNAL: journal },
+      timeout: 60_000,
+    });
+
+  it("keeps a seam-written tool-failure row through commit and harvest", () => {
+    fs.mkdirSync(path.join(tmpDir, "consumer-app"), { recursive: true });
+    const main = fs.realpathSync(path.join(tmpDir, "consumer-app"));
+    git(main, ["init", "-q", "-b", "dev"]);
+    git(main, ["config", "user.name", "t"]);
+    git(main, ["config", "user.email", "t@t"]);
+    git(main, ["remote", "add", "origin", "https://github.com/test-owner/consumer-app.git"]);
+    fs.writeFileSync(path.join(main, "README.md"), "x\n");
+    git(main, ["add", "."]);
+    git(main, ["commit", "-q", "-m", "init"]);
+    const worktree = path.join(main, ".worktrees", FID);
+    git(main, ["worktree", "add", "-q", "-b", `feat/${FID}`, worktree]);
+    const statusRel = path.join("docs", "plans", "202610", "logs", FID, "status.jsonl");
+    fs.mkdirSync(path.dirname(path.join(worktree, statusRel)), { recursive: true });
+    fs.writeFileSync(
+      path.join(worktree, statusRel),
+      `${JSON.stringify({ type: "workflow-started", workflow: "build", at: "2026-10-29T10:00:00Z" })}\n`,
+    );
+
+    // `ledgers check --plan=<a directory>` dies on a raw EISDIR: an exit no verb declares.
+    const failed = bkit(worktree, ["ledgers", "check", `--plan=${worktree}`], "on");
+    expect(failed.status).toBe(1);
+
+    const frictionFile = path.join(worktree, ".bkit", "friction.jsonl");
+    const written = fs.readFileSync(frictionFile, "utf-8").trim().split("\n");
+    expect(written).toHaveLength(1);
+    const seamRow = JSON.parse(written[0]!) as Record<string, unknown>;
+    expect(seamRow).toMatchObject({
+      kind: "friction",
+      category: "tool-failure",
+      key: "ledgers-check/ledgers-check",
+      by: { workflow: "build", step: "ledgers-check" },
+    });
+
+    // The real `ledgers commit` writer carries it into the run's branch.
+    const committed = bkit(
+      worktree,
+      ["ledgers", "commit", "--scope=core", "--mode=commit", "--month=202610", `--fid=${FID}`, "--message=chore: bookkeeping"],
+      "off",
+    );
+    expect(committed.status, committed.stderr).toBe(0);
+    expect(git(worktree, ["show", "HEAD:.bkit/friction.jsonl"]).trim()).toBe(written[0]);
+
+    // And the harvest banks it, then prunes it from the run's checkout.
+    const bkitRoot = makeBkitRoot(tmpDir, [worktree]);
+    runHarvest(bkitRoot);
+    const store = fs
+      .readFileSync(path.join(bkitRoot, HARVEST_DEST_DIR, "friction.jsonl"), "utf-8")
+      .trim()
+      .split("\n")
+      .map((l) => JSON.parse(l) as Record<string, unknown>);
+    expect(store.filter((r) => r["key"] === seamRow["key"])).toHaveLength(1);
+    expect(store.find((r) => r["key"] === seamRow["key"])).toMatchObject({
+      kind: "friction",
+      category: "tool-failure",
+    });
+    expect(fs.readFileSync(frictionFile, "utf-8")).toBe("");
+  });
+});
diff --git a/vitest.setup.ts b/vitest.setup.ts
index 0c8c38ae0..da4feabcf 100644
--- a/vitest.setup.ts
+++ b/vitest.setup.ts
@@ -65,6 +65,11 @@ process.env.BKIT_NO_UPDATE_CHECK = "1";
 delete process.env.CLAUDE_CODE_SESSION_ID;
 delete process.env.CLAUDE_CONFIG_DIR;
 
+// No test journals into a real run: `runCommand` appends `engine-call` rows to the active
+// run's `status.jsonl` found from the cwd, and a test run from this repo's own worktree would
+// write into the live run. A test of the journal sets `BKIT_ENGINE_JOURNAL` itself.
+process.env.BKIT_ENGINE_JOURNAL = "off";
+
 // No test reads or writes the developer's real bkit config and cache folders: a real
 // `~/.config/bkit/disk-prune.mjs` holds delete steps, and any test that mints a worktree
 // runs `bkit disk prune`'s low-disk check (`commands/workflow/disk.ts`). Each worker gets
