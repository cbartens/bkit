diff --git a/.bkit/cli.md b/.bkit/cli.md
index 19271eb35..596da88c0 100644
--- a/.bkit/cli.md
+++ b/.bkit/cli.md
@@ -220,7 +220,8 @@ Stage and commit bookkeeping by allow-list; union ledgers; check a range is book
 | `commit` | workflow | `--root` **`--month`** **`--fid`** `--scope` **`--mode`** `--stage-tracked-updates` `--path` `--squash-of` `--only-if-dirty-tracked` `--message` | Stage (and commit) the bookkeeping allow-list for one feature. |
 | `union` | workflow | **`--src`** **`--dst`** | Append a worktree's new ledger rows into another checkout (never .bkit/issues.jsonl). |
 | `only-bookkeeping` | by hand | `--root` **`--month`** **`--fid`** **`--from`** **`--to`** | Exit 0 when every path changed in from..to is on the --scope=pr allow-list. |
-| `append` | by hand | `--root` **`--ledger`** **`--rows`** | Append validated rows to one ledger, minting each row's ts at append time. |
+| `append` | by hand | `--root` **`--ledger`** **`--rows`** `--invocation` | Append validated rows to one ledger, minting each row's ts at append time. |
+| `query` | by hand | `--root` **`--ledger`** `--key` `--status` `--limit` `--cursor` | Read one ledger's canonical winners (filtered after the fold), paged, with line diagnostics and coverage. Writes nothing. |
 | `triage` | workflow | `--root` **`--fid`** **`--plan`** | Bucket each deferral row the FID declared by the four Deferral Reason tests, and write the unjustified ones. |
 | `check` | by hand | `--root` **`--plan`** | Check that every decision / deferral key on a plan's `**Ledger rows:**` line is on disk. |
 | `compact` | by hand | `--root` `--ledger` `--dry-run` | Rewrite keyed ledgers to their fold winners, stamping each winner's firstTs + updates. |
@@ -337,6 +338,7 @@ Read and annotate a workflow's status.jsonl.
 | --- | --- | --- | --- |
 | `path` | by hand | **`--workflow`** **`--fid`** **`--month`** | Where this workflow's status.jsonl lives. |
 | `route` | workflow | `--file` **`--workflow`** `--step` `--group` `--require` `--expect` `--prompt-file` `--fid` `--month` | Routing state: last verdict / failures / strategy of a step, debug and push mode; with --prompt-file, debug's start decisions. |
+| `invocation` | workflow | `--workflow` `--step` `--file` `--agent` `--host` `--configured-model` `--observed-model` `--standalone` `--name` | Issue an engine-bound invocation: a run's step (and agent), or a runless audit or utility call. |
 | `resume` | by hand | **`--file`** **`--workflow`** | The step a stopped run continues at: after its last DONE step, setup steps and retired rows aside. |
 | `meta` | workflow | **`--file`** **`--workflow`** `--debug-mode` `--push-mode` `--debug-attempt` `--opened-pr` `--ci-selection-file` | Append a workflow-meta row (run-level routing state). |
 | `row` | workflow | **`--file`** **`--workflow`** **`--type`** `--field` | Append a typed audit row the fold does not model (ship's gate refusals, CI probes, merge CI); an owner-pause row also logs a human-confirm friction row. |
diff --git a/.bkit/core/.bkit/cli.md b/.bkit/core/.bkit/cli.md
index 5adfacbe0..c29e08ec7 100644
--- a/.bkit/core/.bkit/cli.md
+++ b/.bkit/core/.bkit/cli.md
@@ -220,7 +220,8 @@ Stage and commit bookkeeping by allow-list; union ledgers; check a range is book
 | `commit` | workflow | `--root` **`--month`** **`--fid`** `--scope` **`--mode`** `--stage-tracked-updates` `--path` `--squash-of` `--only-if-dirty-tracked` `--message` | Stage (and commit) the bookkeeping allow-list for one feature. |
 | `union` | workflow | **`--src`** **`--dst`** | Append a worktree's new ledger rows into another checkout (never .bkit/issues.jsonl). |
 | `only-bookkeeping` | by hand | `--root` **`--month`** **`--fid`** **`--from`** **`--to`** | Exit 0 when every path changed in from..to is on the --scope=pr allow-list. |
-| `append` | by hand | `--root` **`--ledger`** **`--rows`** | Append validated rows to one ledger, minting each row's ts at append time. |
+| `append` | by hand | `--root` **`--ledger`** **`--rows`** `--invocation` | Append validated rows to one ledger, minting each row's ts at append time. |
+| `query` | by hand | `--root` **`--ledger`** `--key` `--status` `--limit` `--cursor` | Read one ledger's canonical winners (filtered after the fold), paged, with line diagnostics and coverage. Writes nothing. |
 | `triage` | workflow | `--root` **`--fid`** **`--plan`** | Bucket each deferral row the FID declared by the four Deferral Reason tests, and write the unjustified ones. |
 | `check` | by hand | `--root` **`--plan`** | Check that every decision / deferral key on a plan's `**Ledger rows:**` line is on disk. |
 | `compact` | by hand | `--root` `--ledger` `--dry-run` | Rewrite keyed ledgers to their fold winners, stamping each winner's firstTs + updates. |
@@ -337,6 +338,7 @@ Read and annotate a workflow's status.jsonl.
 | --- | --- | --- | --- |
 | `path` | by hand | **`--workflow`** **`--fid`** **`--month`** | Where this workflow's status.jsonl lives. |
 | `route` | workflow | `--file` **`--workflow`** `--step` `--group` `--require` `--expect` `--prompt-file` `--fid` `--month` | Routing state: last verdict / failures / strategy of a step, debug and push mode; with --prompt-file, debug's start decisions. |
+| `invocation` | workflow | `--workflow` `--step` `--file` `--agent` `--host` `--configured-model` `--observed-model` `--standalone` `--name` | Issue an engine-bound invocation: a run's step (and agent), or a runless audit or utility call. |
 | `resume` | by hand | **`--file`** **`--workflow`** | The step a stopped run continues at: after its last DONE step, setup steps and retired rows aside. |
 | `meta` | workflow | **`--file`** **`--workflow`** `--debug-mode` `--push-mode` `--debug-attempt` `--opened-pr` `--ci-selection-file` | Append a workflow-meta row (run-level routing state). |
 | `row` | workflow | **`--file`** **`--workflow`** **`--type`** `--field` | Append a typed audit row the fold does not model (ship's gate refusals, CI probes, merge CI); an owner-pause row also logs a human-confirm friction row. |
diff --git a/.bkit/core/engine/commands/lib.test.ts b/.bkit/core/engine/commands/lib.test.ts
index c9dfb4b37..e167dd960 100644
--- a/.bkit/core/engine/commands/lib.test.ts
+++ b/.bkit/core/engine/commands/lib.test.ts
@@ -8,6 +8,7 @@ import { afterEach, describe, expect, it } from "vitest";
 import {
   CommandError,
   EXIT,
+  INVOCATION_FLAG,
   SKIP_CI_TOKEN,
   commandHelp,
   ghUnavailable,
@@ -844,3 +845,108 @@ describe("resolveActiveRun", () => {
     expect(run).toEqual({ workflow: "build", file: status, bookRoot: cwd });
   });
 });
+
+describe("explicit invocation context", () => {
+  const PROBE: CommandSpec = {
+    noun: "probe",
+    summary: "invocation probe",
+    verbs: {
+      show: {
+        summary: "emits the invocation the shared flag resolved",
+        use: "workflow",
+        flags: [
+          INVOCATION_FLAG,
+          { name: "workflow", type: "string", help: "asserted workflow" },
+          { name: "file", type: "string", help: "asserted status.jsonl" },
+        ],
+        output: { invocation: "the resolved invocation, or null" },
+        run: (ctx) => {
+          ctx.emit({ invocation: ctx.invocation ?? null });
+          return 0;
+        },
+      },
+    },
+  };
+  const REL = "docs/plans/202611/logs/860-x/status.jsonl";
+
+  const invocationRepo = () => {
+    const root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-lib-inv-")));
+    cleanups.push(root);
+    spawnSync("git", ["init", "-q", "-b", "dev"], { cwd: root });
+    fs.mkdirSync(path.dirname(path.join(root, REL)), { recursive: true });
+    fs.writeFileSync(
+      path.join(root, REL),
+      `${JSON.stringify({ type: "workflow-started", workflow: "build", at: "2026-11-09T10:00:00Z" })}\n`,
+    );
+    return root;
+  };
+  const cleanups: string[] = [];
+  afterEach(() => {
+    for (const d of cleanups.splice(0)) fs.rmSync(d, { recursive: true, force: true });
+  });
+
+  async function call(cwd: string, specs: CommandSpec[], argv: string[]) {
+    const out: string[] = [];
+    const err: string[] = [];
+    const code = await runCommand([...argv, "--json"], specs, {
+      classicVerbs: new Set(["status"]),
+      cwd,
+      io: { stdout: (t) => out.push(t), stderr: (t) => err.push(t) },
+    });
+    return { code, out: out.join(""), err: err.join("") };
+  }
+
+  it("rejects stale cross-worktree invocation and conflicting overrides", async () => {
+    const a = invocationRepo();
+    const b = invocationRepo();
+    const issued = await call(a, COMMANDS, [
+      "status",
+      "invocation",
+      "--workflow=build",
+      "--step=build-branch-sync",
+      `--file=${REL}`,
+    ]);
+    expect(issued.code).toBe(0);
+    const id = (JSON.parse(issued.out) as { invocation: string }).invocation;
+    expect(id).not.toBe("");
+
+    // Control: the checkout that issued it resolves it to its own run and status file.
+    const ok = await call(a, [PROBE], ["probe", "show", `--invocation=${id}`]);
+    expect(ok.code).toBe(0);
+    expect(
+      (JSON.parse(ok.out) as { invocation: Record<string, unknown> }).invocation,
+    ).toMatchObject({
+      workflow: "build",
+      step: "build-branch-sync",
+      statusPath: path.join(a, REL),
+    });
+
+    // Another checkout, a forged id and each conflicting override are refused, with no output.
+    const other = await call(b, [PROBE], ["probe", "show", `--invocation=${id}`]);
+    expect(other.code).toBe(EXIT.USAGE);
+    expect(other.err).toMatch(/invocation/i);
+    expect(other.out).toBe("");
+
+    const forged = await call(a, [PROBE], ["probe", "show", "--invocation=inv-forged"]);
+    expect(forged.code).toBe(EXIT.USAGE);
+    expect(forged.out).toBe("");
+
+    const wrongWorkflow = await call(
+      a,
+      [PROBE],
+      ["probe", "show", `--invocation=${id}`, "--workflow=debug"],
+    );
+    expect(wrongWorkflow.code).toBe(EXIT.USAGE);
+    expect(wrongWorkflow.err).toMatch(/conflict/i);
+    expect(wrongWorkflow.out).toBe("");
+
+    const wrongFile = await call(
+      a,
+      [PROBE],
+      ["probe", "show", `--invocation=${id}`, `--file=${path.join(b, REL)}`],
+    );
+    expect(wrongFile.code).toBe(EXIT.USAGE);
+    expect(wrongFile.err).toMatch(/conflict/i);
+    expect(wrongFile.out).toBe("");
+  });
+});
diff --git a/.bkit/core/engine/commands/lib.ts b/.bkit/core/engine/commands/lib.ts
index 2f69af0f0..7243e86e8 100644
--- a/.bkit/core/engine/commands/lib.ts
+++ b/.bkit/core/engine/commands/lib.ts
@@ -143,6 +143,8 @@ export interface RunContext {
   cwd: string;
   /** Explicit publishing ownership; never inferred from another active run. */
   publication?: { invocation: string; workflow: string };
+  /** The engine-issued invocation `--invocation` resolved and validated; absent without the flag. */
+  invocation?: Invocation;
   /** The global `--json` flag was given. Taken by every verb, never declared in a verb's spec. */
   json: boolean;
   /** Human-readable line on stderr, tagged `[bkit-<noun>]`. */
@@ -503,6 +505,120 @@ export function resolveActiveRun(opts: {
   return found.length === 1 ? found[0] : undefined;
 }
 
+// ---------------------------------------------------------------------------
+// Invocation context
+// ---------------------------------------------------------------------------
+
+/**
+ * The engine-issued identity of one workflow step or agent call. `bkit status invocation`
+ * issues it into the repository's private outbox; a verb that declares `INVOCATION_FLAG`
+ * receives it validated as `ctx.invocation`. Never inferred from the most recent run.
+ */
+export interface Invocation {
+  id: string;
+  version: 1;
+  /** `run`: bound to one workflow run and its `status.jsonl`; `outbox`: a runless audit or utility call. */
+  scope: "run" | "outbox";
+  workflow: string | null;
+  step: string | null;
+  number: number | null;
+  title: string | null;
+  /** The workflow's run number at issuance; null for `outbox` scope. */
+  run: number | null;
+  statusPath: string | null;
+  bookRoot: string | null;
+  agent: string | null;
+  host: string | null;
+  /** The pin the agent was launched with; never the model it ran on. */
+  configuredModel: string | null;
+  /** The model the host reported, or `unavailable`; null when none was asserted. */
+  observedModel: string | null;
+  /** `audit` or `utility` for an `outbox` scope call. */
+  standalone: string | null;
+  name: string | null;
+  /** Git toplevel of the checkout that issued it; resolution is refused anywhere else. */
+  worktree: string;
+  issuedAt: string;
+}
+
+export const INVOCATION_FLAG: FlagSpec = {
+  name: "invocation",
+  type: "string",
+  help: "invocation id from `bkit status invocation`; must be issued by this checkout, and any --workflow, --step, --agent or --file given must agree with it",
+};
+
+const INVOCATION_ID = /^inv-[0-9a-f]{32}$/;
+
+/** `<git common dir>/bkit-outbox/invocation-context`: one receipt per issued invocation. */
+export function invocationDir(cwd: string): string | null {
+  const root = outboxRoot(cwd);
+  return root === null ? null : path.join(root, "invocation-context");
+}
+
+/** Persist an issued invocation; returns its receipt path. */
+export function writeInvocation(cwd: string, inv: Invocation): string {
+  const dir = invocationDir(cwd);
+  if (dir === null) throw new CommandError(EXIT.USAGE, `not inside a git repository: ${cwd}`);
+  fs.mkdirSync(dir, { recursive: true });
+  const file = path.join(dir, `${inv.id}.json`);
+  fs.writeFileSync(file, `${JSON.stringify(inv)}\n`, { mode: 0o600, flag: "wx" });
+  return file;
+}
+
+/**
+ * Resolve `--invocation` against the outbox and refuse (exit 2) a forged, unissued,
+ * other-checkout or stale id, and any asserted `--workflow`, `--step`, `--agent` or
+ * `--file` that disagrees with it. A run-scoped id is stale once a newer run of its
+ * workflow has started.
+ */
+export function resolveInvocation(
+  cwd: string,
+  id: string,
+  flags: Record<string, FlagValue>,
+): Invocation {
+  const refuse = (why: string): never => {
+    throw new CommandError(EXIT.USAGE, `invocation ${id}: ${why}`);
+  };
+  if (!INVOCATION_ID.test(id)) return refuse("not an id issued by `bkit status invocation`");
+  const dir = invocationDir(cwd);
+  const file = dir === null ? null : path.join(dir, `${id}.json`);
+  if (file === null || !fs.existsSync(file)) return refuse("not issued in this repository");
+  const parsed = parseJson(fs.readFileSync(file, "utf-8"));
+  const inv = parsed.ok ? (parsed.value as Invocation | null) : null;
+  if (inv === null || typeof inv !== "object" || inv.id !== id || inv.version !== 1)
+    return refuse("receipt is unreadable");
+  const top = git(cwd, ["rev-parse", "--show-toplevel"]);
+  if (top === null || top !== inv.worktree)
+    return refuse(`issued in another checkout (${inv.worktree})`);
+  if (inv.scope === "run") {
+    if (inv.statusPath === null || inv.workflow === null || inv.run === null)
+      return refuse("run receipt lacks its status file");
+    if (!fs.existsSync(inv.statusPath)) return refuse(`stale: ${inv.statusPath} is gone`);
+    const events: StatusEvent[] = [];
+    for (const line of fs.readFileSync(inv.statusPath, "utf-8").split("\n")) {
+      const row = line.trim() === "" ? null : parseJson(line);
+      if (row?.ok && row.value !== null && typeof row.value === "object") {
+        const type = (row.value as { type?: unknown }).type;
+        if (typeof type === "string" && FOLD_TYPES.has(type)) events.push(row.value as StatusEvent);
+      }
+    }
+    const started = fold(events).filter((r) => r.workflow === inv.workflow).length;
+    if (started > inv.run) return refuse(`stale: a newer ${inv.workflow} run has started`);
+    if (started < inv.run - 1) return refuse("stale: its run is gone");
+  }
+  const text = (v: FlagValue) => (typeof v === "string" ? v : undefined);
+  const conflict = (flag: string, given: string, bound: string | null) =>
+    refuse(`conflict: --${flag}=${given} disagrees with the invocation (${bound ?? "none"})`);
+  for (const flag of ["workflow", "step", "agent"] as const) {
+    const given = text(flags[flag]);
+    if (given !== undefined && given !== inv[flag]) conflict(flag, given, inv[flag]);
+  }
+  const file2 = text(flags["file"]);
+  if (file2 !== undefined && path.resolve(cwd, file2) !== inv.statusPath)
+    conflict("file", file2, inv.statusPath);
+  return inv;
+}
+
 /** The journal `runCommand` uses unless a caller injects one: writes into the active run's own books. */
 function engineJournal(): Journal {
   let resolved = false;
@@ -628,9 +744,18 @@ export async function runCommand(
     }
     ctx.json = own.length !== rest.length;
     ctx.flags = parseFlags(own, spec.flags);
+    const invocationId = ctx.flags["invocation"];
+    if (
+      typeof invocationId === "string" &&
+      spec.flags.some((f) => f.name === INVOCATION_FLAG.name)
+    ) {
+      ctx.invocation = resolveInvocation(ctx.cwd, invocationId, ctx.flags);
+    }
     input = { noun: cmd.noun, verb, argv: rest, flags: ctx.flags, cwd: ctx.cwd };
     const entered = input;
-    guarded(() => journal.call(entered));
+    // An invocation-bound call is attributed by its receipt; it appends no engine-call row,
+    // so resuming or reading under an invocation never changes the run's status file.
+    if (ctx.invocation === undefined) guarded(() => journal.call(entered));
     outcome = null;
     const code = await spec.run(ctx);
     outcome = code;
diff --git a/.bkit/core/engine/commands/registry.ts b/.bkit/core/engine/commands/registry.ts
index ce521a052..8f8c0bce8 100644
--- a/.bkit/core/engine/commands/registry.ts
+++ b/.bkit/core/engine/commands/registry.ts
@@ -33,7 +33,7 @@ import { testsCommand } from "./workflow/tests.js";
 import { workflowsCommand } from "./workflow/workflows.js";
 import { worktreesCommand } from "./workflow/worktrees.js";
 
-export const COMMANDS: readonly CommandSpec[] = [
+export const COMMANDS: CommandSpec[] = [
   statusCommand,
   countersCommand,
   stepsCommand,
diff --git a/.bkit/core/engine/commands/workflow/ledgers.test.ts b/.bkit/core/engine/commands/workflow/ledgers.test.ts
index d5d0c23ec..1d2e1480a 100644
--- a/.bkit/core/engine/commands/workflow/ledgers.test.ts
+++ b/.bkit/core/engine/commands/workflow/ledgers.test.ts
@@ -16,6 +16,7 @@ import {
   readRecord,
   writeRecord,
 } from "./ledgers";
+import { COMMANDS } from "../registry";
 import { NO_MARKERS_REASON } from "./plan-blocks";
 
 const dirs: string[] = [];
@@ -1787,3 +1788,184 @@ describe("bkit ledgers triage", () => {
     ]);
   });
 });
+
+describe("bkit ledgers append --invocation", () => {
+  const STATUS = "docs/plans/202611/logs/860-x/status.jsonl";
+  const knowledge = (o: Record<string, unknown> = {}) => ({
+    kind: "knowledge",
+    key: "gotcha",
+    summary: "a gotcha worth keeping",
+    ...o,
+  });
+
+  async function issue(r: string, extra: string[] = []) {
+    const out: string[] = [];
+    const code = await runCommand(
+      [
+        "status",
+        "invocation",
+        "--workflow=build",
+        "--step=build-plan-tests",
+        `--file=${STATUS}`,
+        "--host=claude",
+        "--configured-model=sonnet",
+        ...extra,
+        "--json",
+      ],
+      COMMANDS,
+      {
+        classicVerbs: new Set(["status"]),
+        cwd: r,
+        io: { stdout: (t) => out.push(t), stderr: () => {} },
+      },
+    );
+    expect(code).toBe(0);
+    return (JSON.parse(out.join("")) as { invocation: string }).invocation;
+  }
+
+  function buildRepo() {
+    const r = repo();
+    put(
+      r,
+      STATUS,
+      `${JSON.stringify({ type: "workflow-started", workflow: "build", at: "2026-11-09T10:00:00Z" })}\n`,
+    );
+    return r;
+  }
+
+  async function appendWith(r: string, ledger: string, rows: unknown, flags: string[]) {
+    const file = path.join(tmp(), "rows.json");
+    fs.writeFileSync(file, JSON.stringify(rows));
+    return run(r, ["append", `--root=${r}`, `--ledger=${ledger}`, `--rows=${file}`, ...flags]);
+  }
+
+  it("rejects conflicting attribution and retains legacy writer restrictions", async () => {
+    const r = buildRepo();
+    const id = await issue(r, ["--agent=bkit-build-plan-tests", "--observed-model=opus-observed"]);
+    const ledgerFile = path.join(r, "docs/knowledge.jsonl");
+
+    // Control: a row with no `by` is completed from the invocation and written.
+    const filled = await appendWith(r, "knowledge", [knowledge()], [`--invocation=${id}`]);
+    expect(filled.code).toBe(0);
+    const written = fs.readFileSync(ledgerFile, "utf-8");
+
+    // An asserted actor, step or run that disagrees with the invocation is refused, not overwritten.
+    for (const by of [
+      { workflow: "debug", step: "build-plan-tests" },
+      { workflow: "build", step: "build-plan-tests", subagent: "bkit-build-plan-gaps-remediate" },
+      {
+        workflow: "build",
+        step: "build-plan-tests",
+        subagent: "bkit-build-plan-tests",
+        model: "other",
+      },
+      { workflow: "build", step: "build-close-workflow", subagent: "bkit-build-plan-tests" },
+    ]) {
+      const res = await appendWith(
+        r,
+        "knowledge",
+        [knowledge({ key: "second", by })],
+        [`--invocation=${id}`],
+      );
+      expect(res.code).toBe(EXIT_ROW_REFUSED);
+      expect(res.err).toMatch(/conflict/i);
+      expect(fs.readFileSync(ledgerFile, "utf-8")).toBe(written);
+    }
+
+    // Legacy callers keep their restrictions: no invocation, an unlisted orchestrator is refused.
+    const legacy = await appendWith(
+      r,
+      "knowledge",
+      [knowledge({ key: "third", by: { workflow: "build", step: "build-close-workflow" } })],
+      [],
+    );
+    expect(legacy.code).toBe(EXIT_ROW_REFUSED);
+    expect(legacy.err).toContain("does not write knowledge rows");
+
+    // An invocation whose agent may not write the kind cannot launder the row.
+    const other = await issue(r, ["--agent=bkit-build-challenge", "--observed-model=m"]);
+    const unauthorized = await appendWith(
+      r,
+      "knowledge",
+      [knowledge({ key: "fourth" })],
+      [`--invocation=${other}`],
+    );
+    expect(unauthorized.code).toBe(EXIT_ROW_REFUSED);
+    expect(unauthorized.err).toContain("does not write knowledge rows");
+    expect(fs.readFileSync(ledgerFile, "utf-8")).toBe(written);
+  });
+});
+
+describe("bkit ledgers query", () => {
+  const dec = (key: string, ts: number, status: string) =>
+    JSON.stringify({
+      schema: 3,
+      ts,
+      kind: "decision",
+      key,
+      repo: "o/r",
+      bkit: { version: "6.0.0" },
+      by: { workflow: "build", step: "manual" },
+      summary: `${key} at ${ts}`,
+      status,
+    });
+  const FILE = "docs/decisions.jsonl";
+
+  const fixture = () => {
+    const r = repo();
+    put(
+      r,
+      FILE,
+      [
+        dec("k1", 1001, "ACTIVE"),
+        dec("k2", 1002, "ACTIVE"),
+        "{not json",
+        dec("k2", 1003, "SUPERSEDED"),
+        dec("k3", 1004, "ACTIVE"),
+        dec("k4", 1005, "ACTIVE"),
+        dec("k5", 1006, "ACTIVE"),
+      ].join("\n") + "\n",
+    );
+    return r;
+  };
+  const q = (r: string, ...flags: string[]) =>
+    run(r, ["query", `--root=${r}`, "--ledger=decisions", ...flags]);
+
+  it("pages canonical winners with diagnostics and rejects stale cursors", async () => {
+    const r = fixture();
+    const bytes = fs.readFileSync(path.join(r, FILE), "utf-8");
+
+    const whole = await q(r, "--status=ACTIVE");
+    expect(whole.code).toBe(0);
+    const expected = whole.json.rows.map((x: { key: string }) => x.key);
+    // The superseded k2 winner is filtered out, and its older ACTIVE row is not resurrected.
+    expect([...expected].sort()).toEqual(["k1", "k3", "k4", "k5"]);
+
+    const page1 = await q(r, "--status=ACTIVE", "--limit=2");
+    expect(page1.code).toBe(0);
+    const page2 = await q(r, "--status=ACTIVE", "--limit=2", `--cursor=${page1.json.nextCursor}`);
+    expect(page2.code).toBe(0);
+    for (const page of [page1, page2]) {
+      expect(page.json.rows).toHaveLength(2);
+      // The malformed line is reported with its line number on every page, never as a clean scan.
+      expect(page.json.diagnostics).toEqual([expect.objectContaining({ line: 3 })]);
+      expect(page.json.coverage).toMatchObject({ clean: false, malformedLines: 1 });
+    }
+    expect(page2.json.nextCursor).toBeNull();
+    const seen = [...page1.json.rows, ...page2.json.rows].map((x: { key: string }) => x.key);
+    expect(seen).toEqual(expected);
+
+    // A cursor from before the ledger changed is refused.
+    const first = await q(r, "--status=ACTIVE", "--limit=2");
+    fs.appendFileSync(path.join(r, FILE), `${dec("k6", 1007, "ACTIVE")}\n`);
+    const stale = await q(r, "--status=ACTIVE", "--limit=2", `--cursor=${first.json.nextCursor}`);
+    expect(stale.code).toBe(2);
+    expect(stale.err).toMatch(/cursor|stale|snapshot/i);
+    expect(stale.json).toBeUndefined();
+
+    // Reading never writes.
+    fs.writeFileSync(path.join(r, FILE), bytes);
+    await q(r, "--key=k1");
+    expect(fs.readFileSync(path.join(r, FILE), "utf-8")).toBe(bytes);
+  });
+});
diff --git a/.bkit/core/engine/commands/workflow/ledgers.ts b/.bkit/core/engine/commands/workflow/ledgers.ts
index f5ed2602b..e836b691b 100644
--- a/.bkit/core/engine/commands/workflow/ledgers.ts
+++ b/.bkit/core/engine/commands/workflow/ledgers.ts
@@ -10,6 +10,7 @@
 // everything already in the index, not nothing.
 
 import { spawnSync } from "node:child_process";
+import { createHash } from "node:crypto";
 import * as fs from "node:fs";
 import * as os from "node:os";
 import * as path from "node:path";
@@ -22,6 +23,7 @@ import {
   UNJUSTIFIED_REASON,
   gitEnv,
   parse,
+  queryLedger,
   mintTs,
   resolveRepoSlug,
   validate,
@@ -33,11 +35,14 @@ import { COMPACT_LEDGERS, compactLedgers, type CompactLedger } from "../../ledge
 import {
   CommandError,
   EXIT,
+  INVOCATION_FLAG,
   isIgnoredPath,
   isSharedBranch,
   parseJson,
+  wholeNumber,
   type CommandSpec,
   type FlagSpec,
+  type Invocation,
   type RunContext,
 } from "../lib.js";
 import { str } from "./status.js";
@@ -62,6 +67,9 @@ export const EXIT_NOT_BOOKKEEPING = 7;
 /** append: a row was refused (supplied `ts`, wrong kind, invalid, unlisted writer). */
 export const EXIT_ROW_REFUSED = 8;
 
+/** Rows per `ledgers query` page unless --limit says otherwise. */
+const QUERY_PAGE = 200;
+
 const SCOPES = ["core", "full", "pr"] as const;
 export type Scope = (typeof SCOPES)[number];
 const MODES = ["stage", "commit", "commit-allow-empty"];
@@ -806,6 +814,10 @@ export const ledgersCommand: CommandSpec = {
           required: true,
           help: "file holding a JSON array of rows without schema, ts or bkit, or - for stdin",
         },
+        {
+          ...INVOCATION_FLAG,
+          help: `${INVOCATION_FLAG.help}; fills each row's by block (workflow, step, subagent, model, provenance) and refuses a row whose own by disagrees`,
+        },
       ],
       output: {
         ledger: "the ledger appended to",
@@ -820,6 +832,44 @@ export const ledgersCommand: CommandSpec = {
       },
       run: (ctx) => append(ctx),
     },
+    query: {
+      summary:
+        "Read one ledger's canonical winners (filtered after the fold), paged, with line diagnostics and coverage. Writes nothing.",
+      use: "by-hand",
+      flags: [
+        { name: "root", type: "string", help: "checkout whose ledger to read (default: cwd)" },
+        {
+          name: "ledger",
+          type: "string",
+          required: true,
+          help: Object.keys(APPEND_LEDGERS).join(" | "),
+        },
+        { name: "key", type: "string", help: "only the winner with this key" },
+        { name: "status", type: "string", help: "only winners whose status is this (e.g. ACTIVE)" },
+        {
+          name: "limit",
+          type: "string",
+          help: `rows per page (default ${QUERY_PAGE}, at least 1)`,
+        },
+        {
+          name: "cursor",
+          type: "string",
+          help: "nextCursor of the previous page; refused when the ledger or the filter changed",
+        },
+      ],
+      output: {
+        ledger: "the ledger read",
+        file: "its path, relative to --root",
+        rows: "this page of fold winners, oldest ts first (equal ts by identity)",
+        nextCursor: "pass as --cursor for the next page, or null on the last page",
+        snapshot: "digest of the bytes read; every page of one scan shares it",
+        total: "winners that pass the filter, across all pages",
+        diagnostics: "each unreadable line: {line, reason}; on every page",
+        coverage:
+          "{status: complete|partial|missing|unreadable, clean, malformedLines, lines}; clean is true only for a complete scan with no unreadable line",
+      },
+      run: (ctx) => query(ctx),
+    },
     triage: {
       summary:
         "Bucket each deferral row the FID declared by the four Deferral Reason tests, and write the unjustified ones.",
@@ -1268,6 +1318,64 @@ const TOP_ORDER = [
   "references",
 ];
 
+/** The `by` fields an invocation owns; a row may repeat them but never disagree. */
+const INVOCATION_BY_KEYS = [
+  "workflow",
+  "step",
+  "subagent",
+  "model",
+  "modelSource",
+  "configuredModel",
+  "host",
+] as const;
+
+/**
+ * `row` with its `by` block completed from the verified invocation. A field the row
+ * asserts that differs from the invocation's, or that the invocation cannot vouch for,
+ * is refused rather than overwritten. A configured pin is recorded as `configuredModel`
+ * only, never as the model that ran.
+ */
+function withInvocationBy(
+  row: Record<string, unknown>,
+  inv: Invocation,
+  refuse: (why: string) => CommandError,
+): Record<string, unknown> {
+  const unavailable = inv.observedModel === "unavailable";
+  const expected: Record<string, string | undefined> = {
+    workflow: inv.workflow ?? inv.standalone ?? undefined,
+    step: inv.step ?? undefined,
+    subagent: inv.agent ?? undefined,
+    model:
+      inv.agent !== null && inv.observedModel !== null && !unavailable
+        ? inv.observedModel
+        : undefined,
+    modelSource:
+      inv.agent === null || inv.observedModel === null
+        ? undefined
+        : unavailable
+          ? "unavailable"
+          : "observed",
+    configuredModel: inv.agent !== null ? (inv.configuredModel ?? undefined) : undefined,
+    host: inv.agent !== null ? (inv.host ?? undefined) : undefined,
+  };
+  const asserted = row["by"];
+  if (
+    asserted !== undefined &&
+    (asserted === null || typeof asserted !== "object" || Array.isArray(asserted))
+  )
+    throw refuse("by must be an object");
+  const by: Record<string, unknown> = { ...(asserted as Record<string, unknown> | undefined) };
+  for (const key of INVOCATION_BY_KEYS) {
+    if (by[key] !== undefined && by[key] !== expected[key]) {
+      throw refuse(
+        `conflict: by.${key}=${JSON.stringify(by[key])} disagrees with invocation ${inv.id} (${expected[key] === undefined ? "none" : JSON.stringify(expected[key])})`,
+      );
+    }
+    if (by[key] === undefined && expected[key] !== undefined) by[key] = expected[key];
+  }
+  return { ...row, by };
+}
+
 /**
  * Append `rows` to one ledger. Every row is checked before any is written, so a
  * refused row leaves the file byte-identical. Each row gets `schema` and a `ts`
@@ -1277,7 +1385,12 @@ const TOP_ORDER = [
  * Never rewrites existing rows. Throws a CommandError (USAGE / EXIT_ROW_REFUSED /
  * EXIT_STAGE).
  */
-export function appendLedgerRows(root: string, ledger: string, rows: unknown): AppendResult {
+export function appendLedgerRows(
+  root: string,
+  ledger: string,
+  rows: unknown,
+  invocation?: Invocation,
+): AppendResult {
   if (!Object.hasOwn(APPEND_LEDGERS, ledger)) {
     throw new CommandError(
       EXIT.USAGE,
@@ -1299,7 +1412,10 @@ export function appendLedgerRows(root: string, ledger: string, rows: unknown): A
     if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
       throw refuse("not a JSON object");
     }
-    const r = raw as Record<string, unknown>;
+    const r =
+      invocation === undefined
+        ? (raw as Record<string, unknown>)
+        : withInvocationBy(raw as Record<string, unknown>, invocation, refuse);
     if (Object.hasOwn(r, "ts")) throw refuse("carries ts; ts is minted at append time");
     if (Object.hasOwn(r, "schema")) throw refuse("carries schema; it is set at append time");
     if (!takes.includes(String(r["kind"]))) {
@@ -1370,12 +1486,90 @@ function append(ctx: RunContext): number {
   if (text.trim() === "") throw new CommandError(EXIT.USAGE, "--rows holds no rows");
   const parsed = parseJson(text);
   if (!parsed.ok) throw new CommandError(EXIT.USAGE, "--rows is not JSON");
-  const r = appendLedgerRows(root, String(ctx.flags.ledger), parsed.value);
+  const bound = ctx.invocation?.bookRoot;
+  if (bound !== undefined && bound !== null && bound !== root)
+    throw new CommandError(
+      EXIT.USAGE,
+      `conflict: --root ${root} is not the invocation's book root ${bound}`,
+    );
+  const r = appendLedgerRows(root, String(ctx.flags.ledger), parsed.value, ctx.invocation);
   ctx.log(`appended ${r.appended} row(s) to ${r.file}`);
   ctx.emit({ ...r });
   return EXIT.OK;
 }
 
+/** Page cursor: the snapshot and filter it was cut from, and the offset of the next row. */
+function encodeCursor(c: { s: string; f: string; o: number }): string {
+  return Buffer.from(JSON.stringify(c)).toString("base64url");
+}
+
+function decodeCursor(text: string): { s: string; f: string; o: number } | null {
+  const parsed = parseJson(Buffer.from(text, "base64url").toString("utf-8"));
+  if (!parsed.ok || parsed.value === null || typeof parsed.value !== "object") return null;
+  const v = parsed.value as Record<string, unknown>;
+  return typeof v["s"] === "string" && typeof v["f"] === "string" && Number.isInteger(v["o"])
+    ? { s: v["s"], f: v["f"], o: v["o"] as number }
+    : null;
+}
+
+function query(ctx: RunContext): number {
+  const root = rootOf(ctx);
+  const ledger = String(ctx.flags.ledger);
+  if (!Object.hasOwn(APPEND_LEDGERS, ledger)) {
+    throw new CommandError(
+      EXIT.USAGE,
+      `--ledger must be one of ${Object.keys(APPEND_LEDGERS).join(", ")} (got '${ledger}')`,
+    );
+  }
+  const { file } = APPEND_LEDGERS[ledger as AppendLedger];
+  const filter = { key: str(ctx.flags.key), status: str(ctx.flags.status) };
+  const limit = wholeNumber(ctx.flags.limit, "limit", QUERY_PAGE, 1);
+  const filterId = JSON.stringify([filter.key ?? null, filter.status ?? null]);
+  const cursorText = str(ctx.flags.cursor);
+  const cursor = cursorText === undefined ? null : decodeCursor(cursorText);
+  if (cursorText !== undefined && cursor === null)
+    throw new CommandError(EXIT.USAGE, "--cursor is not a cursor from this command");
+
+  const abs = path.join(root, file);
+  const read = readText(abs);
+  const missing = !read.ok && !fs.existsSync(abs);
+  const raw = read.ok ? read.text : "";
+  const snapshot = createHash("sha256").update(raw).digest("hex").slice(0, 16);
+  if (cursor !== null && (cursor.s !== snapshot || cursor.f !== filterId))
+    throw new CommandError(
+      EXIT.USAGE,
+      "stale cursor: the ledger or the filter changed since this scan began; start again without --cursor",
+    );
+  const result = queryLedger(raw, filter);
+  const offset = cursor?.o ?? 0;
+  const page = result.rows.slice(offset, offset + limit);
+  const next = offset + limit < result.rows.length ? offset + limit : null;
+  const status = missing
+    ? "missing"
+    : !read.ok
+      ? "unreadable"
+      : result.diagnostics.length > 0
+        ? "partial"
+        : "complete";
+  ctx.emit({
+    ledger,
+    file,
+    rows: page,
+    nextCursor: next === null ? null : encodeCursor({ s: snapshot, f: filterId, o: next }),
+    snapshot,
+    total: result.rows.length,
+    diagnostics: result.diagnostics,
+    coverage: {
+      status,
+      clean: status === "complete",
+      malformedLines: result.diagnostics.length,
+      lines: result.lines,
+      ...(!read.ok && !missing ? { error: read.error } : {}),
+    },
+  });
+  return EXIT.OK;
+}
+
 const LEDGER_ROWS_LINE = /^\*\*Ledger rows:\*\*(.*)$/m;
 const CHECKED_LEDGERS = [APPEND_LEDGERS.decisions, APPEND_LEDGERS.deferrals];
 
diff --git a/.bkit/core/engine/commands/workflow/status.test.ts b/.bkit/core/engine/commands/workflow/status.test.ts
index 1fbf8447a..074a00ebb 100644
--- a/.bkit/core/engine/commands/workflow/status.test.ts
+++ b/.bkit/core/engine/commands/workflow/status.test.ts
@@ -1155,3 +1155,77 @@ describe("bkit status row owner-pause friction", () => {
     expect(readStatusRows(file).filter((r) => r.type === "owner-pause")).toHaveLength(1);
   });
 });
+
+describe("bkit status invocation", () => {
+  const REL = "docs/plans/202611/logs/860-x/status.jsonl";
+  const runRepo = (rows: object[] = [started("build", "2026-11-09T10:00:00Z")]) => {
+    const root = tmp();
+    spawnSync("git", ["init", "-q", "-b", "dev"], { cwd: root });
+    fs.mkdirSync(path.dirname(path.join(root, REL)), { recursive: true });
+    fs.writeFileSync(path.join(root, REL), rows.map((r) => JSON.stringify(r)).join("\n") + "\n");
+    return root;
+  };
+
+  it("issues invocation metadata from an explicit run and registered step", async () => {
+    const root = runRepo();
+    const statusBefore = fs.readFileSync(path.join(root, REL), "utf-8");
+    const r = await run(
+      [
+        "status",
+        "invocation",
+        "--workflow=build",
+        "--step=build-branch-sync",
+        `--file=${REL}`,
+        "--agent=bkit-build-plan-tests",
+        "--host=claude",
+        "--configured-model=sonnet",
+      ],
+      root,
+    );
+    expect(r.code).toBe(0);
+    // Number, title and paths come from the step table and the explicit run, not the caller.
+    expect(r.json).toMatchObject({
+      workflow: "build",
+      step: "build-branch-sync",
+      number: 3,
+      title: "Branch Sync",
+      run: 1,
+      scope: "run",
+      statusPath: path.join(root, REL),
+      bookRoot: root,
+      agent: "bkit-build-plan-tests",
+      host: "claude",
+      configuredModel: "sonnet",
+    });
+    expect(typeof r.json.invocation).toBe("string");
+    expect(r.json.invocation).not.toBe("");
+    // Issuing mutates no run state; the receipt lives in the outbox.
+    expect(fs.readFileSync(path.join(root, REL), "utf-8")).toBe(statusBefore);
+    expect(fs.existsSync(String(r.json.receipt))).toBe(true);
+    expect(String(r.json.receipt)).toContain("bkit-outbox");
+
+    // An unregistered step, and a step of another workflow, are refused.
+    const bad = await run(
+      ["status", "invocation", "--workflow=build", "--step=not-a-step", `--file=${REL}`],
+      root,
+    );
+    expect(bad.code).toBe(2);
+    const cross = await run(
+      ["status", "invocation", "--workflow=build", "--step=plan-generate", `--file=${REL}`],
+      root,
+    );
+    expect(cross.code).toBe(2);
+
+    // A runless audit gets scoped outbox authority without a fabricated run or status file.
+    const bare = tmp();
+    spawnSync("git", ["init", "-q", "-b", "dev"], { cwd: bare });
+    const audit = await run(
+      ["status", "invocation", "--standalone=audit", "--name=bkit-audit-example"],
+      bare,
+    );
+    expect(audit.code).toBe(0);
+    expect(audit.json).toMatchObject({ scope: "outbox", run: null, statusPath: null });
+    expect(fs.existsSync(String(audit.json.receipt))).toBe(true);
+    expect(fs.existsSync(path.join(bare, "docs"))).toBe(false);
+  });
+});
diff --git a/.bkit/core/engine/commands/workflow/status.ts b/.bkit/core/engine/commands/workflow/status.ts
index 14a58be8f..817c6b261 100644
--- a/.bkit/core/engine/commands/workflow/status.ts
+++ b/.bkit/core/engine/commands/workflow/status.ts
@@ -1,5 +1,6 @@
 // bkit status route|resume|meta|path|row — read and annotate a workflow's `status.jsonl`.
 
+import { randomBytes } from "node:crypto";
 import * as fs from "node:fs";
 import * as path from "node:path";
 
@@ -31,7 +32,9 @@ import {
   parseJson,
   resolveActiveRun,
   statusLocation,
+  writeInvocation,
   type CommandSpec,
+  type Invocation,
   type FlagSpec,
   type FlagValue,
   type RunContext,
@@ -551,6 +554,149 @@ export const statusCommand: CommandSpec = {
         return failed.length === 0 && differ.length === 0 ? EXIT.OK : EXIT_ROUTE_MISSING;
       },
     },
+    invocation: {
+      summary:
+        "Issue an engine-bound invocation: a run's step (and agent), or a runless audit or utility call.",
+      use: "workflow",
+      flags: [
+        { ...WORKFLOW_FLAG, required: false, help: "workflow name, with --step and --file" },
+        { ...STEP_FLAG, required: false, help: "registered step of the workflow" },
+        { ...FILE_FLAG, required: false, help: "the run's status.jsonl, relative to the cwd" },
+        { name: "agent", type: "string", help: "the subagent this invocation is for" },
+        { name: "host", type: "string", help: "the host running the agent" },
+        {
+          name: "configured-model",
+          type: "string",
+          help: "the pin the agent was launched with; kept apart from the observed model",
+        },
+        {
+          name: "observed-model",
+          type: "string",
+          help: "the model the host reported, or `unavailable`",
+        },
+        { name: "standalone", type: "string", help: "audit|utility: a call with no run" },
+        { name: "name", type: "string", help: "with --standalone: the audit or utility name" },
+      ],
+      output: {
+        invocation: "the id to pass as --invocation to later commands",
+        receipt: "the outbox file holding the issued context",
+        scope: "run (bound to a status.jsonl) or outbox (runless audit or utility)",
+        workflow: "the workflow, or null",
+        step: "the registered step, or null",
+        number: "the step's registered number, or null",
+        title: "the step's registered title, or null",
+        run: "the workflow's run number, or null without a run",
+        statusPath: "absolute path to the run's status.jsonl, or null",
+        bookRoot: "root the run's books live under, or null",
+        agent: "the agent, or null",
+        host: "the host, or null",
+        configuredModel: "the launch pin, or null",
+        observedModel: "the reported model or `unavailable`, or null",
+      },
+      exitCodes: { [EXIT_NO_STATUS]: "status.jsonl missing, unreadable, or not valid NDJSON" },
+      run: (ctx) => {
+        const top = git(ctx.cwd, ["rev-parse", "--show-toplevel"]);
+        if (top === null) throw new CommandError(EXIT.USAGE, "not inside a git repository");
+        const standalone = str(ctx.flags.standalone);
+        const workflow = str(ctx.flags.workflow);
+        const step = str(ctx.flags.step);
+        const file = str(ctx.flags.file);
+        const base = {
+          agent: str(ctx.flags.agent) ?? null,
+          host: str(ctx.flags.host) ?? null,
+          configuredModel: str(ctx.flags.configuredModel) ?? null,
+          observedModel: str(ctx.flags.observedModel) ?? null,
+        };
+        let inv: Omit<Invocation, "id" | "issuedAt" | "version" | "worktree">;
+        if (standalone !== undefined) {
+          oneOf(standalone, ["audit", "utility"], "--standalone");
+          if ([workflow, step, file].some((v) => v !== undefined))
+            throw new CommandError(
+              EXIT.USAGE,
+              "--standalone has no run: drop --workflow, --step and --file",
+            );
+          const name = str(ctx.flags.name);
+          if (name === undefined || name === "")
+            throw new CommandError(EXIT.USAGE, "--standalone needs --name");
+          inv = {
+            scope: "outbox",
+            workflow: null,
+            step: null,
+            number: null,
+            title: null,
+            run: null,
+            statusPath: null,
+            bookRoot: null,
+            standalone,
+            name,
+            ...base,
+          };
+        } else {
+          if (workflow === undefined || step === undefined || file === undefined)
+            throw new CommandError(
+              EXIT.USAGE,
+              "give --workflow, --step and --file, or --standalone=audit|utility with --name",
+            );
+          if (ctx.flags.name !== undefined)
+            throw new CommandError(EXIT.USAGE, "--name is for --standalone");
+          if (!isResumable(workflow))
+            throw new CommandError(
+              EXIT.USAGE,
+              `--workflow must be ${Object.keys(WORKFLOW_STEPS).join("|")}, got "${workflow}"`,
+            );
+          const registered = WORKFLOW_STEPS[workflow].find((s) => s.step === step);
+          if (registered === undefined)
+            throw new CommandError(
+              EXIT.USAGE,
+              `--step ${step} is not a registered ${workflow} step`,
+            );
+          const statusPath = path.resolve(ctx.cwd, file);
+          const logs = path.dirname(path.dirname(statusPath));
+          if (
+            path.basename(statusPath) !== "status.jsonl" ||
+            path.basename(logs) !== "logs" ||
+            path.basename(path.dirname(path.dirname(logs))) !== "plans"
+          )
+            throw new CommandError(
+              EXIT.USAGE,
+              `--file ${file} is not a docs/plans/<month>/logs/<fid>/status.jsonl`,
+            );
+          inv = {
+            scope: "run",
+            workflow,
+            step,
+            number: registered.number,
+            title: registered.title,
+            run: runNumber(readRuns(statusPath), workflow),
+            statusPath,
+            bookRoot: path.dirname(path.dirname(path.dirname(path.dirname(logs)))),
+            standalone: null,
+            name: null,
+            ...base,
+          };
+        }
+        const id = `inv-${randomBytes(16).toString("hex")}`;
+        const issued: Invocation = {
+          id,
+          version: 1,
+          ...inv,
+          worktree: top,
+          issuedAt: statusTimestamp(),
+        };
+        const receipt = writeInvocation(ctx.cwd, issued);
+        const {
+          id: _id,
+          version: _v,
+          worktree: _w,
+          issuedAt: _at,
+          standalone: _s,
+          name: _n,
+          ...out
+        } = issued;
+        ctx.emit({ invocation: id, receipt, ...out });
+        return EXIT.OK;
+      },
+    },
     resume: {
       summary:
         "The step a stopped run continues at: after its last DONE step, setup steps and retired rows aside.",
diff --git a/.bkit/core/engine/ledgers/journal.integration.test.ts b/.bkit/core/engine/ledgers/journal.integration.test.ts
index 73a5640b1..f26ce817b 100644
--- a/.bkit/core/engine/ledgers/journal.integration.test.ts
+++ b/.bkit/core/engine/ledgers/journal.integration.test.ts
@@ -13,8 +13,10 @@ import * as path from "node:path";
 
 import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
 
-import { runCommand, type CommandSpec } from "../commands/lib";
+import { INVOCATION_FLAG, runCommand, type CommandSpec } from "../commands/lib";
+import { COMMANDS } from "../commands/registry";
 import { branchesCommand } from "../commands/workflow/branches";
+import { ledgersCommand } from "../commands/workflow/ledgers";
 
 const FID = "901-journal";
 const STATUS_REL = path.join("docs", "plans", "202610", "logs", FID, "status.jsonl");
@@ -242,3 +244,228 @@ describe("the dispatch seam on a real worktree", () => {
     expect(calls[0]).toMatchObject({ workflow: "build", noun: "branches", verb: "anchor-read" });
   });
 });
+
+const PROBE: CommandSpec = {
+  noun: "probe",
+  summary: "invocation probe",
+  verbs: {
+    show: {
+      summary: "emits the invocation the shared flag resolved",
+      use: "workflow",
+      flags: [INVOCATION_FLAG],
+      output: { invocation: "the resolved invocation, or null" },
+      run: (ctx) => {
+        ctx.emit({ invocation: ctx.invocation ?? null });
+        return 0;
+      },
+    },
+  },
+};
+
+async function call(cwd: string, specs: readonly CommandSpec[], argv: string[]) {
+  const out: string[] = [];
+  const err: string[] = [];
+  const code = await runCommand([...argv, "--json"], specs, {
+    classicVerbs: new Set(["status"]),
+    cwd,
+    io: { stdout: (t) => out.push(t), stderr: (t) => err.push(t) },
+  });
+  return {
+    code,
+    json: out.length > 0 ? (JSON.parse(out.join("")) as Record<string, any>) : undefined,
+    err: err.join(""),
+  };
+}
+
+async function issue(cwd: string, extra: string[] = [], step = "build-plan-tests") {
+  const res = await call(cwd, COMMANDS, [
+    "status",
+    "invocation",
+    "--workflow=build",
+    `--step=${step}`,
+    `--file=${STATUS_REL}`,
+    "--host=claude",
+    "--configured-model=sonnet",
+    ...extra,
+  ]);
+  expect(res.code).toBe(0);
+  return res.json!["invocation"] as string;
+}
+
+describe("explicit invocation on real worktrees", () => {
+  it("resumes explicit invocation across two real worktrees without identity leakage", async () => {
+    const other = path.join(main, ".worktrees", "902-other");
+    git(main, ["worktree", "add", "-q", "-b", "feat/902-other", other]);
+    const otherStatus = path.join(other, STATUS_REL);
+    fs.mkdirSync(path.dirname(otherStatus), { recursive: true });
+    fs.writeFileSync(
+      otherStatus,
+      `${JSON.stringify({ type: "workflow-started", workflow: "build", at: "2026-10-29T11:00:00Z" })}\n`,
+    );
+    const statusA = path.join(worktree, STATUS_REL);
+
+    const idA = await issue(worktree);
+    const idB = await issue(other);
+    expect(idA).not.toBe(idB);
+
+    // The run moves on between two commands: resume must keep the same identity.
+    fs.appendFileSync(
+      statusA,
+      `${JSON.stringify({ type: "step-done", workflow: "build", step: "build-branch-sync", status: "DONE", at: "2026-10-29T10:05:00Z", parentSha: "a".repeat(40), artifacts: [] })}\n`,
+    );
+    const bytesA = fs.readFileSync(statusA, "utf-8");
+    const bytesB = fs.readFileSync(otherStatus, "utf-8");
+
+    const resumedA = await call(worktree, [PROBE], ["probe", "show", `--invocation=${idA}`]);
+    expect(resumedA.code).toBe(0);
+    expect(resumedA.json!["invocation"]).toMatchObject({
+      id: idA,
+      run: 1,
+      workflow: "build",
+      step: "build-plan-tests",
+      statusPath: statusA,
+    });
+    const resumedB = await call(other, [PROBE], ["probe", "show", `--invocation=${idB}`]);
+    expect(resumedB.json!["invocation"]).toMatchObject({ id: idB, statusPath: otherStatus });
+
+    // Each id is refused anywhere but its own worktree: the other worktree and the main checkout.
+    for (const [cwd, id] of [
+      [other, idA],
+      [worktree, idB],
+      [main, idA],
+    ] as const) {
+      const leaked = await call(cwd, [PROBE], ["probe", "show", `--invocation=${id}`]);
+      expect(leaked.code).toBe(2);
+      expect(leaked.json).toBeUndefined();
+    }
+    expect(fs.readFileSync(statusA, "utf-8")).toBe(bytesA);
+    expect(fs.readFileSync(otherStatus, "utf-8")).toBe(bytesB);
+  });
+
+  it("completes missing subagent attribution before a real append", async () => {
+    const id = await issue(worktree, [
+      "--agent=bkit-build-plan-tests",
+      "--observed-model=opus-observed",
+    ]);
+    const rowsFile = path.join(main, "rows.json");
+    fs.writeFileSync(
+      rowsFile,
+      JSON.stringify([{ kind: "knowledge", key: "gotcha", summary: "a gotcha worth keeping" }]),
+    );
+    const appended = await call(
+      worktree,
+      [ledgersCommand],
+      [
+        "ledgers",
+        "append",
+        `--root=${worktree}`,
+        "--ledger=knowledge",
+        `--rows=${rowsFile}`,
+        `--invocation=${id}`,
+      ],
+    );
+    expect(appended.code).toBe(0);
+    const ledger = rows(path.join(worktree, "docs", "knowledge.jsonl"));
+    expect(ledger).toHaveLength(1);
+    expect(ledger[0]!["by"]).toEqual({
+      workflow: "build",
+      step: "build-plan-tests",
+      subagent: "bkit-build-plan-tests",
+      model: "opus-observed",
+      modelSource: "observed",
+      configuredModel: "sonnet",
+      host: "claude",
+    });
+    expect(fs.existsSync(path.join(main, "docs", "knowledge.jsonl"))).toBe(false);
+
+    // An unavailable observation is accepted with provenance and the pin kept apart from it.
+    const unavailableId = await issue(worktree, [
+      "--agent=bkit-build-plan-tests",
+      "--observed-model=unavailable",
+    ]);
+    fs.writeFileSync(
+      rowsFile,
+      JSON.stringify([{ kind: "knowledge", key: "second", summary: "a second gotcha" }]),
+    );
+    const second = await call(
+      worktree,
+      [ledgersCommand],
+      [
+        "ledgers",
+        "append",
+        `--root=${worktree}`,
+        "--ledger=knowledge",
+        `--rows=${rowsFile}`,
+        `--invocation=${unavailableId}`,
+      ],
+    );
+    expect(second.code).toBe(0);
+    const by = rows(path.join(worktree, "docs", "knowledge.jsonl"))[1]!["by"] as Record<
+      string,
+      unknown
+    >;
+    expect(by).toMatchObject({ modelSource: "unavailable", configuredModel: "sonnet" });
+    expect(by).not.toHaveProperty("model");
+  });
+});
+
+describe("canonical ledger reads on real files", () => {
+  const dec = (key: string) =>
+    JSON.stringify({
+      schema: 3,
+      ts: 1_700_000_000_001,
+      kind: "decision",
+      key,
+      repo: "o/r",
+      bkit: { version: "6.0.0" },
+      by: { workflow: "build", step: "manual" },
+      summary: key,
+      status: "ACTIVE",
+    });
+  const query = (extra: string[] = []) =>
+    call(
+      worktree,
+      [ledgersCommand],
+      ["ledgers", "query", `--root=${worktree}`, "--ledger=decisions", ...extra],
+    );
+
+  it("distinguishes unreadable missing malformed and clean ledger coverage without writing", async () => {
+    const file = path.join(worktree, "docs", "decisions.jsonl");
+    const porcelain = () => git(worktree, ["status", "--porcelain"]);
+    const before = porcelain();
+
+    // Missing: no rows, and not a clean scan.
+    const missing = await query();
+    expect(missing.code).toBe(0);
+    expect(missing.json!["rows"]).toEqual([]);
+    expect(missing.json!["coverage"]).toMatchObject({ status: "missing", clean: false });
+    expect(fs.existsSync(file)).toBe(false);
+
+    // Unreadable: the path is a directory, so the read fails.
+    fs.mkdirSync(file, { recursive: true });
+    const unreadable = await query();
+    expect(unreadable.code).toBe(0);
+    expect(unreadable.json!["rows"]).toEqual([]);
+    expect(unreadable.json!["coverage"]).toMatchObject({ status: "unreadable", clean: false });
+    fs.rmSync(file, { recursive: true });
+
+    // Malformed: valid rows come back with a located diagnostic; the bytes are untouched.
+    const body = `${dec("a")}\n{broken\n${dec("b")}\n`;
+    fs.writeFileSync(file, body);
+    const malformed = await query();
+    expect(malformed.json!["rows"].map((r: { key: string }) => r.key)).toEqual(["a", "b"]);
+    expect(malformed.json!["diagnostics"]).toEqual([expect.objectContaining({ line: 2 })]);
+    expect(malformed.json!["coverage"]).toMatchObject({ status: "partial", clean: false });
+    expect(fs.readFileSync(file, "utf-8")).toBe(body);
+
+    // Clean: only now is the scan reported clean.
+    fs.writeFileSync(file, `${dec("a")}\n${dec("b")}\n`);
+    const clean = await query();
+    expect(clean.json!["diagnostics"]).toEqual([]);
+    expect(clean.json!["coverage"]).toMatchObject({ status: "complete", clean: true });
+
+    // Reads wrote nothing beyond the ledger fixture this test itself created.
+    fs.rmSync(file);
+    expect(porcelain()).toBe(before);
+  });
+});
diff --git a/.bkit/core/engine/ledgers/telemetry.test.ts b/.bkit/core/engine/ledgers/telemetry.test.ts
index d2c3c88df..7d9073bd4 100644
--- a/.bkit/core/engine/ledgers/telemetry.test.ts
+++ b/.bkit/core/engine/ledgers/telemetry.test.ts
@@ -36,6 +36,7 @@ import {
   normalizeEvent,
   parse,
   placeLineage,
+  queryLedger,
   totalsProblem,
   validate,
   withLineage,
@@ -2966,3 +2967,102 @@ describe("validate — schema-2 top section", () => {
     expect(r.reason).toContain("bkit.version");
   });
 });
+
+describe("verified model attribution", () => {
+  const subagentBy = (extra: Row) => ({
+    workflow: "build",
+    step: "build-plan-tests",
+    subagent: "bkit-build-plan-tests",
+    ...extra,
+  });
+
+  it("accepts verified unavailable model without confusing configured and observed models", () => {
+    // Unavailable: authoritative provenance and the configured pin, but no model value.
+    const unavailable = knowledgeEvent("k", {
+      by: subagentBy({ modelSource: "unavailable", configuredModel: "sonnet" }),
+    });
+    expect(validate(unavailable).ok).toBe(true);
+    expect(writerProblem(unavailable as unknown as Record<string, unknown>)).toBeUndefined();
+
+    // The configured pin is never recorded as the runtime model.
+    const pinAsRuntime = knowledgeEvent("k", {
+      by: subagentBy({ model: "sonnet", modelSource: "unavailable", configuredModel: "sonnet" }),
+    });
+    expect(validate(pinAsRuntime).ok).toBe(false);
+
+    // Observed and configured stay two distinct fields through normalize and fold.
+    const observed = knowledgeEvent("k2", {
+      by: subagentBy({
+        model: "opus-observed",
+        modelSource: "observed",
+        configuredModel: "sonnet",
+      }),
+    });
+    expect(validate(observed).ok).toBe(true);
+    const winner = [...fold([observed]).values()][0]!;
+    expect(winner.by).toMatchObject({
+      model: "opus-observed",
+      modelSource: "observed",
+      configuredModel: "sonnet",
+    });
+
+    // An unknown source is refused, and an unknown optional field survives normalization.
+    expect(validate(knowledgeEvent("k3", { by: subagentBy({ modelSource: "guessed" }) })).ok).toBe(
+      false,
+    );
+    const extra = knowledgeEvent("k4", {
+      by: subagentBy({ model: "m", modelSource: "observed", futureField: "kept" }),
+    });
+    expect((normalizeEvent(extra).by as Record<string, unknown>)["futureField"]).toBe("kept");
+
+    // Legacy: a subagent row with neither a model nor a provenance is still refused.
+    expect(writerProblem({ kind: "knowledge", by: subagentBy({}) })).toContain("by.model");
+    // Legacy: an old row with only `model` still validates.
+    expect(validate(knowledgeEvent("k5", { by: subagentBy({ model: "m" }) })).ok).toBe(true);
+  });
+});
+
+describe("queryLedger — canonical winners before filtering", () => {
+  const line = (key: string, ts: number, status: string) =>
+    JSON.stringify(decisionEvent(key, { ts, status }));
+
+  it("folds numeric timestamps and equal timestamp ties before filtering", () => {
+    const raw = [
+      line("k1", 1000, "ACTIVE"),
+      line("k1", 2000, "SUPERSEDED"),
+      // Equal ts: the later line wins the tie.
+      line("k2", 3000, "ACTIVE"),
+      line("k2", 3000, "SUPERSEDED"),
+      // Numeric, not string, order: 10 is newer than 9.
+      line("k3", 10, "SUPERSEDED"),
+      line("k3", 9, "ACTIVE"),
+      "{not json",
+      line("k4", 5000, "ACTIVE"),
+    ].join("\n");
+
+    // Control: the canonical fold alone already picks these winners.
+    const winners = [...fold(parse(raw).events).values()].map((e) => [e.key, e["status"]]);
+    expect(winners).toEqual(
+      expect.arrayContaining([
+        ["k1", "SUPERSEDED"],
+        ["k2", "SUPERSEDED"],
+        ["k3", "SUPERSEDED"],
+        ["k4", "ACTIVE"],
+      ]),
+    );
+
+    // Filtering applies to the winners: no older ACTIVE row is resurrected.
+    const active = queryLedger(raw, { status: "ACTIVE" });
+    expect(active.rows.map((r) => r.key)).toEqual(["k4"]);
+    const superseded = queryLedger(raw, { status: "SUPERSEDED" });
+    expect(superseded.rows.map((r) => r.key).sort()).toEqual(["k1", "k2", "k3"]);
+    expect(queryLedger(raw, { key: "k1" }).rows.map((r) => r["status"])).toEqual(["SUPERSEDED"]);
+
+    // The malformed line is a located diagnostic, never silently dropped.
+    expect(active.diagnostics).toEqual([expect.objectContaining({ line: 7 })]);
+    // The same input gives the same order each time.
+    expect(queryLedger(raw, {}).rows.map((r) => r.key)).toEqual(
+      queryLedger(raw, {}).rows.map((r) => r.key),
+    );
+  });
+});
diff --git a/.bkit/core/engine/ledgers/telemetry.ts b/.bkit/core/engine/ledgers/telemetry.ts
index 9a4ee8a4e..0c9731d9a 100644
--- a/.bkit/core/engine/ledgers/telemetry.ts
+++ b/.bkit/core/engine/ledgers/telemetry.ts
@@ -141,8 +141,23 @@ export interface RowBy {
    * exactly when `subagent` is set.
    */
   model?: string;
+  /**
+   * Where `model` came from: `observed` (the host reported it) or `unavailable` (the host
+   * reported nothing, so `model` is absent). Absent on rows written before provenance.
+   */
+  modelSource?: ModelSource;
+  /** The pin the subagent was launched with; never the model it ran on. Subagent rows only. */
+  configuredModel?: string;
+  /** The host that ran the subagent, when known. */
+  host?: string;
+  /** Fields a newer writer adds survive normalization. */
+  [field: string]: unknown;
 }
 
+/** Provenance of a subagent row's model: the host reported it, or reported nothing. */
+export type ModelSource = "observed" | "unavailable";
+export const MODEL_SOURCES: ReadonlySet<string> = new Set<ModelSource>(["observed", "unavailable"]);
+
 /** The bkit that wrote a row; `chat` rows add what the chat did with bkit. */
 export interface BkitBlock {
   /** bkit version stamped on every row for regression attribution; null on a chat / run row when unknown. */
@@ -182,6 +197,8 @@ export interface TelemetryEnvelope {
    * never an identity: `ts` (with `key` for keyed kinds) identifies the row.
    */
   references?: string[];
+  /** Lifecycle or triage status on the kinds that carry one; narrowed by each payload. */
+  status?: string;
 }
 
 /** The identity block of every row that belongs to one workflow run. */
@@ -472,7 +489,8 @@ export function writerProblem(row: Record<string, unknown>): string | undefined
     if (typeof subagent !== "string" || subagent === "") {
       return "by.subagent must be a non-empty string";
     }
-    if (typeof by["model"] !== "string" || by["model"] === "") {
+    const unavailable = by["modelSource"] === "unavailable" && by["model"] === undefined;
+    if (!unavailable && (typeof by["model"] !== "string" || by["model"] === "")) {
       return `subagent ${subagent} row missing by.model (its prompt's frontmatter model:)`;
     }
     if (writers.subagents === ANY_WRITER || writers.subagents.has(subagent)) return undefined;
@@ -1571,7 +1589,7 @@ export function validate(event: unknown): ValidationResult {
   if (typeof by["step"] !== "string" || by["step"] === "") {
     return { ok: false, reason: "by.step must be a non-empty string" };
   }
-  for (const f of ["workflow", "subagent", "model"]) {
+  for (const f of ["workflow", "subagent", "model", "configuredModel", "host"]) {
     if (by[f] !== undefined && (typeof by[f] !== "string" || by[f] === "")) {
       return { ok: false, reason: `by.${f} must be a non-empty string when present` };
     }
@@ -1579,6 +1597,26 @@ export function validate(event: unknown): ValidationResult {
   if (by["model"] !== undefined && by["subagent"] === undefined) {
     return { ok: false, reason: "by.model is set only on subagent rows" };
   }
+  if (by["modelSource"] !== undefined) {
+    if (typeof by["modelSource"] !== "string" || !MODEL_SOURCES.has(by["modelSource"])) {
+      return { ok: false, reason: "by.modelSource must be observed|unavailable when present" };
+    }
+    if (by["subagent"] === undefined) {
+      return { ok: false, reason: "by.modelSource is set only on subagent rows" };
+    }
+    if (by["modelSource"] === "unavailable" && by["model"] !== undefined) {
+      return {
+        ok: false,
+        reason: "by.model must be absent when by.modelSource is unavailable",
+      };
+    }
+    if (by["modelSource"] === "observed" && by["model"] === undefined) {
+      return { ok: false, reason: "by.modelSource observed needs by.model" };
+    }
+  }
+  if (by["configuredModel"] !== undefined && by["subagent"] === undefined) {
+    return { ok: false, reason: "by.configuredModel is set only on subagent rows" };
+  }
   if (e["references"] !== undefined && !Array.isArray(e["references"])) {
     return { ok: false, reason: "references must be an array when present" };
   }
@@ -1930,6 +1968,68 @@ export function fold(events: TelemetryEvent[]): FoldedState {
   return state;
 }
 
+// ---------------------------------------------------------------------------
+// Query — canonical winners, filtered after the fold, with located line diagnostics
+// ---------------------------------------------------------------------------
+
+/** A ledger line the query could not read as a row. */
+export interface LineDiagnostic {
+  /** 1-based line number in the file as read. */
+  line: number;
+  reason: "malformed-json" | "not-an-object";
+}
+
+export interface LedgerQuery {
+  key?: string;
+  status?: string;
+}
+
+export interface LedgerQueryResult {
+  /** The fold winners that pass the filter, oldest `ts` first, equal `ts` by identity. */
+  rows: TelemetryEvent[];
+  diagnostics: LineDiagnostic[];
+  /** Non-blank lines read. */
+  lines: number;
+  /** Rows read before folding. */
+  readRows: number;
+}
+
+/** Statuses of the keyed lifecycle kinds: a row with no `status` is ACTIVE. */
+const DEFAULT_ACTIVE_KINDS: ReadonlySet<string> = new Set(["decision", "knowledge"]);
+
+/**
+ * The canonical ledger read: parse every line (reporting each unreadable one with its line
+ * number), fold with {@link fold}, and only then apply `filter` to the winners, so an older
+ * row a newer winner superseded is never resurrected. Pure and read-only.
+ */
+export function queryLedger(raw: string, filter: LedgerQuery = {}): LedgerQueryResult {
+  const diagnostics: LineDiagnostic[] = [];
+  const events: TelemetryEvent[] = [];
+  let lines = 0;
+  raw.split("\n").forEach((text, i) => {
+    const trimmed = text.trim();
+    if (trimmed === "") return;
+    lines++;
+    const obj = parseJson(trimmed);
+    if (!obj.ok) diagnostics.push({ line: i + 1, reason: "malformed-json" });
+    else if (obj.value === null || typeof obj.value !== "object" || Array.isArray(obj.value))
+      diagnostics.push({ line: i + 1, reason: "not-an-object" });
+    else events.push(obj.value as TelemetryEvent);
+  });
+  const winners = [...fold(events).entries()].sort(
+    ([ia, a], [ib, b]) => compareTs(a, b) || (ia < ib ? -1 : ia > ib ? 1 : 0),
+  );
+  const rows = winners
+    .map(([, e]) => e)
+    .filter((e) => {
+      if (filter.key !== undefined && e.key !== filter.key) return false;
+      if (filter.status === undefined) return true;
+      const status = e.status ?? (DEFAULT_ACTIVE_KINDS.has(String(e.kind)) ? "ACTIVE" : undefined);
+      return status === filter.status;
+    });
+  return { rows, diagnostics, lines, readRows: events.length };
+}
+
 // ---------------------------------------------------------------------------
 // Lineage — the entry age + row count a fold winner carries (AGED_KINDS)
 // ---------------------------------------------------------------------------
diff --git a/.bkit/version b/.bkit/version
index a06afb4e3..7f7c31ac2 100644
--- a/.bkit/version
+++ b/.bkit/version
@@ -264,7 +264,7 @@
     ".codex/hooks/bkit-rules.cjs": "8aee2cde5448c083ae0dc07a4f1db86ce7e815a2a2eafe54b886b7f4393cab91",
     ".opencode/plugin/bkit-rules.js": "417d3ca107ebf005060953a17340620e1fcfb5bcdf491316a937e0c747b0377e",
     ".bkit/router.md": "c20d006757e350c173da94686d48500bc83e12d9f7bb6ff5911e47e332e45eab",
-    ".bkit/cli.md": "00be8c3d28b5323276abc3d86b1de3a39f1475a71d04f54e062218ebc129e051",
+    ".bkit/cli.md": "a1d40c44fa9d0c6a9bbaed9ca09a06b9aad02c061fdf093a01726e6649c47675",
     ".claude/agents/bkit-build-plan-tests.md": "f7b4e6be48b6950d27256c42d5d2c48b20bd23b90d66b0d1f59745a33ad251b5",
     ".cursor/agents/bkit-build-plan-tests.md": "57996d02186862b35c6e22dd150e0b1d19a243f10fddb16002feefd7d42c7838",
     ".opencode/agents/bkit-build-plan-tests.md": "896af5e894b0ae4c9911cc5ee3f54e5426efdf2e4f8ec5c758ed990b82fac6d4",
diff --git a/dist/commands/lib.js b/dist/commands/lib.js
index f7c187a12..af8e1fe07 100644
--- a/dist/commands/lib.js
+++ b/dist/commands/lib.js
@@ -347,6 +347,82 @@ export function resolveActiveRun(opts) {
     }
     return found.length === 1 ? found[0] : undefined;
 }
+export const INVOCATION_FLAG = {
+    name: "invocation",
+    type: "string",
+    help: "invocation id from `bkit status invocation`; must be issued by this checkout, and any --workflow, --step, --agent or --file given must agree with it",
+};
+const INVOCATION_ID = /^inv-[0-9a-f]{32}$/;
+/** `<git common dir>/bkit-outbox/invocation-context`: one receipt per issued invocation. */
+export function invocationDir(cwd) {
+    const root = outboxRoot(cwd);
+    return root === null ? null : path.join(root, "invocation-context");
+}
+/** Persist an issued invocation; returns its receipt path. */
+export function writeInvocation(cwd, inv) {
+    const dir = invocationDir(cwd);
+    if (dir === null)
+        throw new CommandError(EXIT.USAGE, `not inside a git repository: ${cwd}`);
+    fs.mkdirSync(dir, { recursive: true });
+    const file = path.join(dir, `${inv.id}.json`);
+    fs.writeFileSync(file, `${JSON.stringify(inv)}\n`, { mode: 0o600, flag: "wx" });
+    return file;
+}
+/**
+ * Resolve `--invocation` against the outbox and refuse (exit 2) a forged, unissued,
+ * other-checkout or stale id, and any asserted `--workflow`, `--step`, `--agent` or
+ * `--file` that disagrees with it. A run-scoped id is stale once a newer run of its
+ * workflow has started.
+ */
+export function resolveInvocation(cwd, id, flags) {
+    const refuse = (why) => {
+        throw new CommandError(EXIT.USAGE, `invocation ${id}: ${why}`);
+    };
+    if (!INVOCATION_ID.test(id))
+        return refuse("not an id issued by `bkit status invocation`");
+    const dir = invocationDir(cwd);
+    const file = dir === null ? null : path.join(dir, `${id}.json`);
+    if (file === null || !fs.existsSync(file))
+        return refuse("not issued in this repository");
+    const parsed = parseJson(fs.readFileSync(file, "utf-8"));
+    const inv = parsed.ok ? parsed.value : null;
+    if (inv === null || typeof inv !== "object" || inv.id !== id || inv.version !== 1)
+        return refuse("receipt is unreadable");
+    const top = git(cwd, ["rev-parse", "--show-toplevel"]);
+    if (top === null || top !== inv.worktree)
+        return refuse(`issued in another checkout (${inv.worktree})`);
+    if (inv.scope === "run") {
+        if (inv.statusPath === null || inv.workflow === null || inv.run === null)
+            return refuse("run receipt lacks its status file");
+        if (!fs.existsSync(inv.statusPath))
+            return refuse(`stale: ${inv.statusPath} is gone`);
+        const events = [];
+        for (const line of fs.readFileSync(inv.statusPath, "utf-8").split("\n")) {
+            const row = line.trim() === "" ? null : parseJson(line);
+            if (row?.ok && row.value !== null && typeof row.value === "object") {
+                const type = row.value.type;
+                if (typeof type === "string" && FOLD_TYPES.has(type))
+                    events.push(row.value);
+            }
+        }
+        const started = fold(events).filter((r) => r.workflow === inv.workflow).length;
+        if (started > inv.run)
+            return refuse(`stale: a newer ${inv.workflow} run has started`);
+        if (started < inv.run - 1)
+            return refuse("stale: its run is gone");
+    }
+    const text = (v) => (typeof v === "string" ? v : undefined);
+    const conflict = (flag, given, bound) => refuse(`conflict: --${flag}=${given} disagrees with the invocation (${bound ?? "none"})`);
+    for (const flag of ["workflow", "step", "agent"]) {
+        const given = text(flags[flag]);
+        if (given !== undefined && given !== inv[flag])
+            conflict(flag, given, inv[flag]);
+    }
+    const file2 = text(flags["file"]);
+    if (file2 !== undefined && path.resolve(cwd, file2) !== inv.statusPath)
+        conflict("file", file2, inv.statusPath);
+    return inv;
+}
 /** The journal `runCommand` uses unless a caller injects one: writes into the active run's own books. */
 function engineJournal() {
     let resolved = false;
@@ -471,9 +547,17 @@ export async function runCommand(argv, commands, options) {
         }
         ctx.json = own.length !== rest.length;
         ctx.flags = parseFlags(own, spec.flags);
+        const invocationId = ctx.flags["invocation"];
+        if (typeof invocationId === "string" &&
+            spec.flags.some((f) => f.name === INVOCATION_FLAG.name)) {
+            ctx.invocation = resolveInvocation(ctx.cwd, invocationId, ctx.flags);
+        }
         input = { noun: cmd.noun, verb, argv: rest, flags: ctx.flags, cwd: ctx.cwd };
         const entered = input;
-        guarded(() => journal.call(entered));
+        // An invocation-bound call is attributed by its receipt; it appends no engine-call row,
+        // so resuming or reading under an invocation never changes the run's status file.
+        if (ctx.invocation === undefined)
+            guarded(() => journal.call(entered));
         outcome = null;
         const code = await spec.run(ctx);
         outcome = code;
diff --git a/dist/commands/workflow/ledgers.js b/dist/commands/workflow/ledgers.js
index 2268a0b6f..2304be394 100644
--- a/dist/commands/workflow/ledgers.js
+++ b/dist/commands/workflow/ledgers.js
@@ -9,14 +9,15 @@
 // before `git commit`: `git commit --pathspec-from-file=<empty file>` commits
 // everything already in the index, not nothing.
 import { spawnSync } from "node:child_process";
+import { createHash } from "node:crypto";
 import * as fs from "node:fs";
 import * as os from "node:os";
 import * as path from "node:path";
 import { readBkitVersion } from "../../install/version-file.js";
 import { readBkitConfig } from "../../shared/settings.js";
-import { APPEND_LEDGERS, SCHEMA, UNJUSTIFIED_REASON, gitEnv, parse, mintTs, resolveRepoSlug, validate, withLineage, writerProblem, } from "../../ledgers/telemetry.js";
+import { APPEND_LEDGERS, SCHEMA, UNJUSTIFIED_REASON, gitEnv, parse, queryLedger, mintTs, resolveRepoSlug, validate, withLineage, writerProblem, } from "../../ledgers/telemetry.js";
 import { COMPACT_LEDGERS, compactLedgers } from "../../ledgers/compact.js";
-import { CommandError, EXIT, isIgnoredPath, isSharedBranch, parseJson, } from "../lib.js";
+import { CommandError, EXIT, INVOCATION_FLAG, isIgnoredPath, isSharedBranch, parseJson, wholeNumber, } from "../lib.js";
 import { str } from "./status.js";
 import { NO_MARKERS_REASON, outOfScope, parsePlanBlocks, reuseInventory, } from "./plan-blocks.js";
 /** Root is not a directory or repo, git is too old, or a ref does not resolve. */
@@ -31,6 +32,8 @@ export const EXIT_EMPTY = 6;
 export const EXIT_NOT_BOOKKEEPING = 7;
 /** append: a row was refused (supplied `ts`, wrong kind, invalid, unlisted writer). */
 export const EXIT_ROW_REFUSED = 8;
+/** Rows per `ledgers query` page unless --limit says otherwise. */
+const QUERY_PAGE = 200;
 const SCOPES = ["core", "full", "pr"];
 const MODES = ["stage", "commit", "commit-allow-empty"];
 /** `package.json` globs as git pathspecs: `:(glob)` unless an entry carries its own magic. */
@@ -647,6 +650,10 @@ export const ledgersCommand = {
                     required: true,
                     help: "file holding a JSON array of rows without schema, ts or bkit, or - for stdin",
                 },
+                {
+                    ...INVOCATION_FLAG,
+                    help: `${INVOCATION_FLAG.help}; fills each row's by block (workflow, step, subagent, model, provenance) and refuses a row whose own by disagrees`,
+                },
             ],
             output: {
                 ledger: "the ledger appended to",
@@ -660,6 +667,42 @@ export const ledgersCommand = {
             },
             run: (ctx) => append(ctx),
         },
+        query: {
+            summary: "Read one ledger's canonical winners (filtered after the fold), paged, with line diagnostics and coverage. Writes nothing.",
+            use: "by-hand",
+            flags: [
+                { name: "root", type: "string", help: "checkout whose ledger to read (default: cwd)" },
+                {
+                    name: "ledger",
+                    type: "string",
+                    required: true,
+                    help: Object.keys(APPEND_LEDGERS).join(" | "),
+                },
+                { name: "key", type: "string", help: "only the winner with this key" },
+                { name: "status", type: "string", help: "only winners whose status is this (e.g. ACTIVE)" },
+                {
+                    name: "limit",
+                    type: "string",
+                    help: `rows per page (default ${QUERY_PAGE}, at least 1)`,
+                },
+                {
+                    name: "cursor",
+                    type: "string",
+                    help: "nextCursor of the previous page; refused when the ledger or the filter changed",
+                },
+            ],
+            output: {
+                ledger: "the ledger read",
+                file: "its path, relative to --root",
+                rows: "this page of fold winners, oldest ts first (equal ts by identity)",
+                nextCursor: "pass as --cursor for the next page, or null on the last page",
+                snapshot: "digest of the bytes read; every page of one scan shares it",
+                total: "winners that pass the filter, across all pages",
+                diagnostics: "each unreadable line: {line, reason}; on every page",
+                coverage: "{status: complete|partial|missing|unreadable, clean, malformedLines, lines}; clean is true only for a complete scan with no unreadable line",
+            },
+            run: (ctx) => query(ctx),
+        },
         triage: {
             summary: "Bucket each deferral row the FID declared by the four Deferral Reason tests, and write the unjustified ones.",
             use: "workflow",
@@ -1027,6 +1070,53 @@ const TOP_ORDER = [
     "by",
     "references",
 ];
+/** The `by` fields an invocation owns; a row may repeat them but never disagree. */
+const INVOCATION_BY_KEYS = [
+    "workflow",
+    "step",
+    "subagent",
+    "model",
+    "modelSource",
+    "configuredModel",
+    "host",
+];
+/**
+ * `row` with its `by` block completed from the verified invocation. A field the row
+ * asserts that differs from the invocation's, or that the invocation cannot vouch for,
+ * is refused rather than overwritten. A configured pin is recorded as `configuredModel`
+ * only, never as the model that ran.
+ */
+function withInvocationBy(row, inv, refuse) {
+    const unavailable = inv.observedModel === "unavailable";
+    const expected = {
+        workflow: inv.workflow ?? inv.standalone ?? undefined,
+        step: inv.step ?? undefined,
+        subagent: inv.agent ?? undefined,
+        model: inv.agent !== null && inv.observedModel !== null && !unavailable
+            ? inv.observedModel
+            : undefined,
+        modelSource: inv.agent === null || inv.observedModel === null
+            ? undefined
+            : unavailable
+                ? "unavailable"
+                : "observed",
+        configuredModel: inv.agent !== null ? (inv.configuredModel ?? undefined) : undefined,
+        host: inv.agent !== null ? (inv.host ?? undefined) : undefined,
+    };
+    const asserted = row["by"];
+    if (asserted !== undefined &&
+        (asserted === null || typeof asserted !== "object" || Array.isArray(asserted)))
+        throw refuse("by must be an object");
+    const by = { ...asserted };
+    for (const key of INVOCATION_BY_KEYS) {
+        if (by[key] !== undefined && by[key] !== expected[key]) {
+            throw refuse(`conflict: by.${key}=${JSON.stringify(by[key])} disagrees with invocation ${inv.id} (${expected[key] === undefined ? "none" : JSON.stringify(expected[key])})`);
+        }
+        if (by[key] === undefined && expected[key] !== undefined)
+            by[key] = expected[key];
+    }
+    return { ...row, by };
+}
 /**
  * Append `rows` to one ledger. Every row is checked before any is written, so a
  * refused row leaves the file byte-identical. Each row gets `schema` and a `ts`
@@ -1036,7 +1126,7 @@ const TOP_ORDER = [
  * Never rewrites existing rows. Throws a CommandError (USAGE / EXIT_ROW_REFUSED /
  * EXIT_STAGE).
  */
-export function appendLedgerRows(root, ledger, rows) {
+export function appendLedgerRows(root, ledger, rows, invocation) {
     if (!Object.hasOwn(APPEND_LEDGERS, ledger)) {
         throw new CommandError(EXIT.USAGE, `--ledger must be one of ${Object.keys(APPEND_LEDGERS).join(", ")} (got '${ledger}')`);
     }
@@ -1056,7 +1146,9 @@ export function appendLedgerRows(root, ledger, rows) {
         if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
             throw refuse("not a JSON object");
         }
-        const r = raw;
+        const r = invocation === undefined
+            ? raw
+            : withInvocationBy(raw, invocation, refuse);
         if (Object.hasOwn(r, "ts"))
             throw refuse("carries ts; ts is minted at append time");
         if (Object.hasOwn(r, "schema"))
@@ -1140,11 +1232,77 @@ function append(ctx) {
     const parsed = parseJson(text);
     if (!parsed.ok)
         throw new CommandError(EXIT.USAGE, "--rows is not JSON");
-    const r = appendLedgerRows(root, String(ctx.flags.ledger), parsed.value);
+    const bound = ctx.invocation?.bookRoot;
+    if (bound !== undefined && bound !== null && bound !== root)
+        throw new CommandError(EXIT.USAGE, `conflict: --root ${root} is not the invocation's book root ${bound}`);
+    const r = appendLedgerRows(root, String(ctx.flags.ledger), parsed.value, ctx.invocation);
     ctx.log(`appended ${r.appended} row(s) to ${r.file}`);
     ctx.emit({ ...r });
     return EXIT.OK;
 }
+/** Page cursor: the snapshot and filter it was cut from, and the offset of the next row. */
+function encodeCursor(c) {
+    return Buffer.from(JSON.stringify(c)).toString("base64url");
+}
+function decodeCursor(text) {
+    const parsed = parseJson(Buffer.from(text, "base64url").toString("utf-8"));
+    if (!parsed.ok || parsed.value === null || typeof parsed.value !== "object")
+        return null;
+    const v = parsed.value;
+    return typeof v["s"] === "string" && typeof v["f"] === "string" && Number.isInteger(v["o"])
+        ? { s: v["s"], f: v["f"], o: v["o"] }
+        : null;
+}
+function query(ctx) {
+    const root = rootOf(ctx);
+    const ledger = String(ctx.flags.ledger);
+    if (!Object.hasOwn(APPEND_LEDGERS, ledger)) {
+        throw new CommandError(EXIT.USAGE, `--ledger must be one of ${Object.keys(APPEND_LEDGERS).join(", ")} (got '${ledger}')`);
+    }
+    const { file } = APPEND_LEDGERS[ledger];
+    const filter = { key: str(ctx.flags.key), status: str(ctx.flags.status) };
+    const limit = wholeNumber(ctx.flags.limit, "limit", QUERY_PAGE, 1);
+    const filterId = JSON.stringify([filter.key ?? null, filter.status ?? null]);
+    const cursorText = str(ctx.flags.cursor);
+    const cursor = cursorText === undefined ? null : decodeCursor(cursorText);
+    if (cursorText !== undefined && cursor === null)
+        throw new CommandError(EXIT.USAGE, "--cursor is not a cursor from this command");
+    const abs = path.join(root, file);
+    const read = readText(abs);
+    const missing = !read.ok && !fs.existsSync(abs);
+    const raw = read.ok ? read.text : "";
+    const snapshot = createHash("sha256").update(raw).digest("hex").slice(0, 16);
+    if (cursor !== null && (cursor.s !== snapshot || cursor.f !== filterId))
+        throw new CommandError(EXIT.USAGE, "stale cursor: the ledger or the filter changed since this scan began; start again without --cursor");
+    const result = queryLedger(raw, filter);
+    const offset = cursor?.o ?? 0;
+    const page = result.rows.slice(offset, offset + limit);
+    const next = offset + limit < result.rows.length ? offset + limit : null;
+    const status = missing
+        ? "missing"
+        : !read.ok
+            ? "unreadable"
+            : result.diagnostics.length > 0
+                ? "partial"
+                : "complete";
+    ctx.emit({
+        ledger,
+        file,
+        rows: page,
+        nextCursor: next === null ? null : encodeCursor({ s: snapshot, f: filterId, o: next }),
+        snapshot,
+        total: result.rows.length,
+        diagnostics: result.diagnostics,
+        coverage: {
+            status,
+            clean: status === "complete",
+            malformedLines: result.diagnostics.length,
+            lines: result.lines,
+            ...(!read.ok && !missing ? { error: read.error } : {}),
+        },
+    });
+    return EXIT.OK;
+}
 const LEDGER_ROWS_LINE = /^\*\*Ledger rows:\*\*(.*)$/m;
 const CHECKED_LEDGERS = [APPEND_LEDGERS.decisions, APPEND_LEDGERS.deferrals];
 /**
diff --git a/dist/commands/workflow/status.js b/dist/commands/workflow/status.js
index f86a927df..80f78e2b3 100644
--- a/dist/commands/workflow/status.js
+++ b/dist/commands/workflow/status.js
@@ -1,4 +1,5 @@
 // bkit status route|resume|meta|path|row — read and annotate a workflow's `status.jsonl`.
+import { randomBytes } from "node:crypto";
 import * as fs from "node:fs";
 import * as path from "node:path";
 import { BKIT_DEBUG_GATES } from "../../install/manifest.js";
@@ -6,7 +7,7 @@ import { appendFrictionRow, journalEnabled, pauseFrictionRow } from "../../ledge
 import { resolveGitSha } from "../../ledgers/telemetry.js";
 import { readBkitConfig } from "../../shared/settings.js";
 import { activeDoneSteps, validateCiSelection, ciSelectionIdentity, allRunsDoneSteps, appendLine, fold, lastDoneStepAllRuns, lastRun, nextStrategy, runNumber, runOrStepField, statusTimestamp, } from "../../ledgers/status.js";
-import { CommandError, EXIT, git, parseJson, resolveActiveRun, statusLocation, } from "../lib.js";
+import { CommandError, EXIT, git, parseJson, resolveActiveRun, statusLocation, writeInvocation, } from "../lib.js";
 import { WORKFLOW_STEPS, isResumable, resumePoint } from "./step-table.js";
 // ---------------------------------------------------------------------------
 // Shared with counters / steps
@@ -463,6 +464,125 @@ export const statusCommand = {
                 return failed.length === 0 && differ.length === 0 ? EXIT.OK : EXIT_ROUTE_MISSING;
             },
         },
+        invocation: {
+            summary: "Issue an engine-bound invocation: a run's step (and agent), or a runless audit or utility call.",
+            use: "workflow",
+            flags: [
+                { ...WORKFLOW_FLAG, required: false, help: "workflow name, with --step and --file" },
+                { ...STEP_FLAG, required: false, help: "registered step of the workflow" },
+                { ...FILE_FLAG, required: false, help: "the run's status.jsonl, relative to the cwd" },
+                { name: "agent", type: "string", help: "the subagent this invocation is for" },
+                { name: "host", type: "string", help: "the host running the agent" },
+                {
+                    name: "configured-model",
+                    type: "string",
+                    help: "the pin the agent was launched with; kept apart from the observed model",
+                },
+                {
+                    name: "observed-model",
+                    type: "string",
+                    help: "the model the host reported, or `unavailable`",
+                },
+                { name: "standalone", type: "string", help: "audit|utility: a call with no run" },
+                { name: "name", type: "string", help: "with --standalone: the audit or utility name" },
+            ],
+            output: {
+                invocation: "the id to pass as --invocation to later commands",
+                receipt: "the outbox file holding the issued context",
+                scope: "run (bound to a status.jsonl) or outbox (runless audit or utility)",
+                workflow: "the workflow, or null",
+                step: "the registered step, or null",
+                number: "the step's registered number, or null",
+                title: "the step's registered title, or null",
+                run: "the workflow's run number, or null without a run",
+                statusPath: "absolute path to the run's status.jsonl, or null",
+                bookRoot: "root the run's books live under, or null",
+                agent: "the agent, or null",
+                host: "the host, or null",
+                configuredModel: "the launch pin, or null",
+                observedModel: "the reported model or `unavailable`, or null",
+            },
+            exitCodes: { [EXIT_NO_STATUS]: "status.jsonl missing, unreadable, or not valid NDJSON" },
+            run: (ctx) => {
+                const top = git(ctx.cwd, ["rev-parse", "--show-toplevel"]);
+                if (top === null)
+                    throw new CommandError(EXIT.USAGE, "not inside a git repository");
+                const standalone = str(ctx.flags.standalone);
+                const workflow = str(ctx.flags.workflow);
+                const step = str(ctx.flags.step);
+                const file = str(ctx.flags.file);
+                const base = {
+                    agent: str(ctx.flags.agent) ?? null,
+                    host: str(ctx.flags.host) ?? null,
+                    configuredModel: str(ctx.flags.configuredModel) ?? null,
+                    observedModel: str(ctx.flags.observedModel) ?? null,
+                };
+                let inv;
+                if (standalone !== undefined) {
+                    oneOf(standalone, ["audit", "utility"], "--standalone");
+                    if ([workflow, step, file].some((v) => v !== undefined))
+                        throw new CommandError(EXIT.USAGE, "--standalone has no run: drop --workflow, --step and --file");
+                    const name = str(ctx.flags.name);
+                    if (name === undefined || name === "")
+                        throw new CommandError(EXIT.USAGE, "--standalone needs --name");
+                    inv = {
+                        scope: "outbox",
+                        workflow: null,
+                        step: null,
+                        number: null,
+                        title: null,
+                        run: null,
+                        statusPath: null,
+                        bookRoot: null,
+                        standalone,
+                        name,
+                        ...base,
+                    };
+                }
+                else {
+                    if (workflow === undefined || step === undefined || file === undefined)
+                        throw new CommandError(EXIT.USAGE, "give --workflow, --step and --file, or --standalone=audit|utility with --name");
+                    if (ctx.flags.name !== undefined)
+                        throw new CommandError(EXIT.USAGE, "--name is for --standalone");
+                    if (!isResumable(workflow))
+                        throw new CommandError(EXIT.USAGE, `--workflow must be ${Object.keys(WORKFLOW_STEPS).join("|")}, got "${workflow}"`);
+                    const registered = WORKFLOW_STEPS[workflow].find((s) => s.step === step);
+                    if (registered === undefined)
+                        throw new CommandError(EXIT.USAGE, `--step ${step} is not a registered ${workflow} step`);
+                    const statusPath = path.resolve(ctx.cwd, file);
+                    const logs = path.dirname(path.dirname(statusPath));
+                    if (path.basename(statusPath) !== "status.jsonl" ||
+                        path.basename(logs) !== "logs" ||
+                        path.basename(path.dirname(path.dirname(logs))) !== "plans")
+                        throw new CommandError(EXIT.USAGE, `--file ${file} is not a docs/plans/<month>/logs/<fid>/status.jsonl`);
+                    inv = {
+                        scope: "run",
+                        workflow,
+                        step,
+                        number: registered.number,
+                        title: registered.title,
+                        run: runNumber(readRuns(statusPath), workflow),
+                        statusPath,
+                        bookRoot: path.dirname(path.dirname(path.dirname(path.dirname(logs)))),
+                        standalone: null,
+                        name: null,
+                        ...base,
+                    };
+                }
+                const id = `inv-${randomBytes(16).toString("hex")}`;
+                const issued = {
+                    id,
+                    version: 1,
+                    ...inv,
+                    worktree: top,
+                    issuedAt: statusTimestamp(),
+                };
+                const receipt = writeInvocation(ctx.cwd, issued);
+                const { id: _id, version: _v, worktree: _w, issuedAt: _at, standalone: _s, name: _n, ...out } = issued;
+                ctx.emit({ invocation: id, receipt, ...out });
+                return EXIT.OK;
+            },
+        },
         resume: {
             summary: "The step a stopped run continues at: after its last DONE step, setup steps and retired rows aside.",
             use: "by-hand",
diff --git a/dist/ledgers/telemetry.js b/dist/ledgers/telemetry.js
index 666fb2dce..31afbdfed 100644
--- a/dist/ledgers/telemetry.js
+++ b/dist/ledgers/telemetry.js
@@ -109,6 +109,7 @@ export function resolveRepoSlug(cwd) {
 export const SCHEMA = 3;
 /** The schema {@link normalize} stamps on a row written without one: the shape it builds. */
 const NORMALIZED_SCHEMA = 2;
+export const MODEL_SOURCES = new Set(["observed", "unavailable"]);
 export const VALID_KINDS = new Set([
     "compliance",
     "outcome",
@@ -274,7 +275,8 @@ export function writerProblem(row) {
         if (typeof subagent !== "string" || subagent === "") {
             return "by.subagent must be a non-empty string";
         }
-        if (typeof by["model"] !== "string" || by["model"] === "") {
+        const unavailable = by["modelSource"] === "unavailable" && by["model"] === undefined;
+        if (!unavailable && (typeof by["model"] !== "string" || by["model"] === "")) {
             return `subagent ${subagent} row missing by.model (its prompt's frontmatter model:)`;
         }
         if (writers.subagents === ANY_WRITER || writers.subagents.has(subagent))
@@ -928,7 +930,7 @@ export function validate(event) {
     if (typeof by["step"] !== "string" || by["step"] === "") {
         return { ok: false, reason: "by.step must be a non-empty string" };
     }
-    for (const f of ["workflow", "subagent", "model"]) {
+    for (const f of ["workflow", "subagent", "model", "configuredModel", "host"]) {
         if (by[f] !== undefined && (typeof by[f] !== "string" || by[f] === "")) {
             return { ok: false, reason: `by.${f} must be a non-empty string when present` };
         }
@@ -936,6 +938,26 @@ export function validate(event) {
     if (by["model"] !== undefined && by["subagent"] === undefined) {
         return { ok: false, reason: "by.model is set only on subagent rows" };
     }
+    if (by["modelSource"] !== undefined) {
+        if (typeof by["modelSource"] !== "string" || !MODEL_SOURCES.has(by["modelSource"])) {
+            return { ok: false, reason: "by.modelSource must be observed|unavailable when present" };
+        }
+        if (by["subagent"] === undefined) {
+            return { ok: false, reason: "by.modelSource is set only on subagent rows" };
+        }
+        if (by["modelSource"] === "unavailable" && by["model"] !== undefined) {
+            return {
+                ok: false,
+                reason: "by.model must be absent when by.modelSource is unavailable",
+            };
+        }
+        if (by["modelSource"] === "observed" && by["model"] === undefined) {
+            return { ok: false, reason: "by.modelSource observed needs by.model" };
+        }
+    }
+    if (by["configuredModel"] !== undefined && by["subagent"] === undefined) {
+        return { ok: false, reason: "by.configuredModel is set only on subagent rows" };
+    }
     if (e["references"] !== undefined && !Array.isArray(e["references"])) {
         return { ok: false, reason: "references must be an array when present" };
     }
@@ -1264,6 +1286,43 @@ export function fold(events) {
     }
     return state;
 }
+/** Statuses of the keyed lifecycle kinds: a row with no `status` is ACTIVE. */
+const DEFAULT_ACTIVE_KINDS = new Set(["decision", "knowledge"]);
+/**
+ * The canonical ledger read: parse every line (reporting each unreadable one with its line
+ * number), fold with {@link fold}, and only then apply `filter` to the winners, so an older
+ * row a newer winner superseded is never resurrected. Pure and read-only.
+ */
+export function queryLedger(raw, filter = {}) {
+    const diagnostics = [];
+    const events = [];
+    let lines = 0;
+    raw.split("\n").forEach((text, i) => {
+        const trimmed = text.trim();
+        if (trimmed === "")
+            return;
+        lines++;
+        const obj = parseJson(trimmed);
+        if (!obj.ok)
+            diagnostics.push({ line: i + 1, reason: "malformed-json" });
+        else if (obj.value === null || typeof obj.value !== "object" || Array.isArray(obj.value))
+            diagnostics.push({ line: i + 1, reason: "not-an-object" });
+        else
+            events.push(obj.value);
+    });
+    const winners = [...fold(events).entries()].sort(([ia, a], [ib, b]) => compareTs(a, b) || (ia < ib ? -1 : ia > ib ? 1 : 0));
+    const rows = winners
+        .map(([, e]) => e)
+        .filter((e) => {
+        if (filter.key !== undefined && e.key !== filter.key)
+            return false;
+        if (filter.status === undefined)
+            return true;
+        const status = e.status ?? (DEFAULT_ACTIVE_KINDS.has(String(e.kind)) ? "ACTIVE" : undefined);
+        return status === filter.status;
+    });
+    return { rows, diagnostics, lines, readRows: events.length };
+}
 const positiveInt = (v) => Number.isInteger(v) && v > 0 ? v : undefined;
 /**
  * `firstTs` + `updates` of one entry from all of its rows, in any order. A row
