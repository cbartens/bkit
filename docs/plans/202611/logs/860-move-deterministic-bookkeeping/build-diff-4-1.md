diff --git a/.bkit/core/.bkit/cli.md b/.bkit/core/.bkit/cli.md
index 4fe638441..b6f7a2faa 100644
--- a/.bkit/core/.bkit/cli.md
+++ b/.bkit/core/.bkit/cli.md
@@ -48,6 +48,8 @@ CI check names come from `package.json` `bkit.testing.ciCapstone` (default `bkit
 
 No workflow file calls a script outside a `bkit` command; the slop plugin `bkit-slop-type-suppression.mjs` is a copy-and-own template (`scripts/slop/`). `bkit-cloud.yml` reads the debug limits from `package.json` with `jq` because its guards run before bkit is installed.
 
+**Bounded correction:** `bkit ledgers append --operation=<id>` is replay-safe; a guaranteed no-write rejection prints a structured error (effects = none, correctable = true) with a `scope`. The corrected candidate is `bkit ledgers append --correction-of=<rejected operation> --operation=<fresh id>`; `bkit counters correction` spends from the same two-retry budget per scope, and a replay of a counted operation spends nothing. `bkit ledgers query` reads a ledger's canonical winners without writing, so an agent checks state instead of guessing it. `bkit runs handoff` records CI poll observations so a re-entered `bkit runs dispatch --invocation=<id>` resumes from persisted rows, with no counter supplied.
+
 First install, upgrade and uninstall: `.bkit/install.md`. Upgrade prompt to paste into your AI: `.bkit/install.md` § Upgrade — already installed.
 
 <!-- cli:start -->
@@ -158,6 +160,7 @@ Attempt counters derived from status.jsonl, and the ask points' limits.
 | `run` | workflow | **`--file`** **`--workflow`** | Which run of the workflow this invocation is (1-based; a resume keeps its number). |
 | `route` | workflow | **`--name`** `--value` `--of` `--rows` `--file` `--workflow` `--group` `--all-runs` `--since-clean` `--max` `--point` `--continue` `--exceeded` | Compare a counter to its max: exit 0 continue, exit 1 exceeded; with --point, also whether to ask. |
 | `grant` | workflow | **`--name`** `--value` `--of` `--rows` `--file` `--workflow` `--group` `--all-runs` `--since-clean` **`--point`** | Give one loop one more full allowance after the owner chose to continue at its used-up limit: exit 0 granted, exit 1 not (below the limit, ask off or headless). |
+| `correction` | workflow | **`--file`** **`--workflow`** **`--scope`** **`--operation`** `--limit` | Spend one corrected retry of a rejected sub-step: exit 0 allowed (or a replay of a counted operation), exit 1 the scope's budget is used up. The budget is two per scope in the active run unless a stricter --limit names one. |
 | `max` | workflow | `--point` `--file` `--workflow` `--group` | The ask points' limits and ask settings: one by --point, or all. |
 | `progress` | workflow | **`--file`** **`--workflow`** **`--check`** **`--fix`** `--group` `--since-clean` | Progress report for a fix loop in the active run: counts per round, code change, strategy, trend. |
 | `rows` | workflow | **`--file`** **`--workflow`** **`--type`** **`--position`** | Count rows of one audit type in the active run (since its workflow-started row). |
@@ -220,7 +223,7 @@ Stage and commit bookkeeping by allow-list; union ledgers; check a range is book
 | `commit` | workflow | `--root` **`--month`** **`--fid`** `--scope` **`--mode`** `--stage-tracked-updates` `--path` `--squash-of` `--only-if-dirty-tracked` `--message` | Stage (and commit) the bookkeeping allow-list for one feature. |
 | `union` | workflow | **`--src`** **`--dst`** | Append a worktree's new ledger rows into another checkout (never .bkit/issues.jsonl). |
 | `only-bookkeeping` | by hand | `--root` **`--month`** **`--fid`** **`--from`** **`--to`** | Exit 0 when every path changed in from..to is on the --scope=pr allow-list. |
-| `append` | by hand | `--root` **`--ledger`** **`--rows`** `--invocation` `--operation` `--issue-operation` | Append validated rows to one ledger, minting each row's ts at append time. |
+| `append` | by hand | `--root` **`--ledger`** **`--rows`** `--invocation` `--operation` `--issue-operation` `--correction-of` | Append validated rows to one ledger, minting each row's ts at append time. |
 | `query` | by hand | `--root` **`--ledger`** `--key` `--status` `--limit` `--cursor` | Read one ledger's canonical winners (filtered after the fold), paged, with line diagnostics and coverage. Writes nothing. |
 | `triage` | workflow | `--root` **`--fid`** **`--plan`** | Bucket each deferral row the FID declared by the four Deferral Reason tests, and write the unjustified ones. |
 | `check` | by hand | `--root` **`--plan`** | Check that every decision / deferral key on a plan's `**Ledger rows:**` line is on disk. |
@@ -293,7 +296,8 @@ CI runs: wait for one, prove one was dispatched, re-validate and gate a merge on
 | --- | --- | --- | --- |
 | `locate` | workflow | **`--prompt-file`** `--issue-text-file` **`--branch`** **`--repo`** `--file` **`--selection-out`** `--evidence-file` | Select and validate the red CI run for the adopted debug branch before local discovery: exit 0 selects red CI, 1 selects local discovery, 2 rejects arguments, 8 rejects ambiguous references, 80 requests read fallback, and 82 requires owner action for unavailable or mismatched evidence. |
 | `wait` | by hand | `--pr` `--head` `--branch` `--until` `--budget-s` `--interval-s` `--once` `--dispatch-if-absent` | Bounded poll for a CI check on a PR (--pr) or a CI run at a head (--head --branch), present or completed. |
-| `dispatch` | workflow | `--pr` `--sha` **`--fid`** `--label` `--file` `--workflow` `--step` `--artifact` `--field` `--budget-s` `--interval-s` `--poll-result` `--attempts` `--all-errored` `--retriggered` | CI-Dispatch Gate after the last push: poll, one clean re-trigger, the ciDispatch verdict, and the body scan. A run in place on dev has no PR: it polls the push-event run at the pushed sha, and its re-trigger commits and pushes only the run's own work. |
+| `handoff` | workflow | `--invocation` **`--repo`** **`--pr`** **`--head`** **`--branch`** `--budget-s` `--interval-s` **`--result`** **`--polls`** | Persist one batch of CI poll observations into the invocation's run and derive the phase, cumulative attempts and errors, next action and verdict from the persisted rows (poll-again \| retrigger \| reconcile-retrigger \| verdict). Rows for another repo, PR or head never count. |
+| `dispatch` | workflow | `--invocation` `--pr` `--sha` **`--fid`** `--label` `--file` `--workflow` `--step` `--artifact` `--field` `--budget-s` `--interval-s` `--poll-result` `--attempts` `--all-errored` `--retriggered` | CI-Dispatch Gate after the last push: poll, one clean re-trigger, the ciDispatch verdict, and the body scan. A run in place on dev has no PR: it polls the push-event run at the pushed sha, and its re-trigger commits and pushes only the run's own work. With --invocation it resumes from the persisted `runs handoff` rows: attempts, errors and the re-trigger checkpoint are never supplied. |
 | `gate` | workflow | `--ci-selection-file` `--head` `--pr` `--squash-of` `--snapshot` `--record` `--validated` `--month` `--fid` `--repo` `--branch` `--fetch` `--event` `--file` `--capstone-only` | Ship merge gate: the capstone job present and green at the head (exit 0), or why not. |
 | `revalidate` | workflow | **`--pr`** **`--entry-head`** **`--code-head`** **`--branch`** **`--month`** **`--fid`** **`--file`** `--reason` `--repo` | Ship: pick the head CI must pass at, probe for a run there, dispatch only when none, wait for it to complete. |
 | `mirror` | workflow | **`--head`** `--branch` `--repo` `--ci-workflow` `--capstone` `--absent-minutes` `--max-minutes` `--interval-s` | Release PR: wait for the branch's push run at the head and copy its capstone verdict. |
diff --git a/.bkit/core/.bkit/jsonl.md b/.bkit/core/.bkit/jsonl.md
index 5b2436fe5..6c23575b7 100644
--- a/.bkit/core/.bkit/jsonl.md
+++ b/.bkit/core/.bkit/jsonl.md
@@ -388,6 +388,21 @@ An identity match means the same thing, not an automatic skip:
 - **Nothing changed** → skip.
 - **Something changed** → append (§ Updating a Row).
 
+## `ci-handoff` and correction rows
+
+These are rows in a run's `status.jsonl`; the status fold ignores types it does not know, so they never change a step's state.
+
+<!-- prettier-ignore -->
+| `type` | Written by | Fields |
+| --- | --- | --- |
+| `ci-handoff` | `bkit runs handoff`, `bkit runs dispatch --invocation` | the target (`provider`, `repo`, `pr`, `head`, `branch`), the cumulative observation (`result`, `attempts`, `errors`) and an optional re-trigger checkpoint `intended`, `commit-created`, `push-completed` or `receipt-completed` (the receipt) |
+| `correction-rejected` | `bkit ledgers append --correction-of` | the rejected `operation`, the `scope` and the engine's rejection code |
+| `correction-candidate` | `bkit counters correction` | the candidate `operation` that spent one retry in the `scope` |
+| `correction-succeeded` | `bkit ledgers append --correction-of` | the verified `operation` and the `scope` it closed |
+
+- **Phase and totals** are derived by the engine from these rows; a caller never supplies an attempt count.
+- **Other targets:** a `ci-handoff` row for another repo, PR, head or branch is counted as stale and never resumes the gate.
+
 ## `engine-action` rows
 
 This is not a ledger but a row in a run's `status.jsonl` (`.bkit/workflows.md` § `status.jsonl`). An engine action unsafe to repeat — a tracker comment, a marker commit, a CI re-trigger, a PR open — appends one once it is done, and checks for it first, so a re-run of the same block does not act twice. Actions safe to repeat (a label already set) record nothing.
diff --git a/.bkit/core/.bkit/prompts.md b/.bkit/core/.bkit/prompts.md
index 9399c68ea..569754f44 100644
--- a/.bkit/core/.bkit/prompts.md
+++ b/.bkit/core/.bkit/prompts.md
@@ -451,6 +451,7 @@ Hooks add text to an agent's context mid-run. The text reaches every agent and s
 | **`acceptEdits` hard requirement** | All in-pipeline agents | `Bash(*)`/`Edit(*)`/`Write(*)` blanket-allow lives in `.claude/settings.json`; `acceptEdits` skips per-call prompts. Stricter modes break end-to-end runs. |
 | **Plan task ticking owned by verify** | `bkit-build-plan-tasks` (ticks only applicable Pre-Flight and gate boxes), `bkit-build-plan-verify` (ticks task boxes `[ ]`→`[x]` only on verified codebase artifact) | Task checkboxes are verify's derived view of the codebase. The executor's durable progress record is its flat append-only log of `DONE —` lines, which keeps resume safe and keeps per-task `Edit` ticks out of its turn budget. Execute ticks each applicable Pre-Flight and gate box as that gate passes and continues without asking; it never ticks a task box or a human-confirmation box. |
 | **Flat append-only log for source modifiers** | `bkit-build-plan-tests`, `bkit-build-plan-tasks`, `bkit-build-plan-gaps-remediate`, `bkit-debug-failure-remediate` | Output format collapses to a single H1 + flat log body (no separate `Brief` / `Strategy` body sections: `Strategy` lives in the machine-parseable header alongside `Verdict`, and the reasoning is implicit in the `DONE —` / `BLOCKED —` lines). Stub state: `Verdict: PENDING` header + H1 + empty body. After every discrete unit of work (task / gap / finding / fix step): `Bash echo "DONE — {Unit} {N}: {name} — {outcome} ({path or commit ref})" >> {artifact}`. On failure: `BLOCKED — {Unit} {N}: {name} — {reason}`. Step 4 standing directive: `Update **Create** output — append DONE/BLOCKED log entries at EOF as content becomes available.` (vs canonical `replace each PENDING via Edit` for multi-section verdict-bearing agents). `Verdict` flips PENDING → PASS / CONCERNS / FAIL at the end via `Edit` on the header line. **Two wins:** (1) timeout resilience: partial progress is on disk after every appended line, so a budget-exhausted agent leaves a usable record, where ~30 ticks clustered at the end would all be lost on a timeout; (2) `Bash echo >>` is cheaper than `Edit`, because it needs no file read for an `old_string` match. **Skip-done logic** (read prior attempts via Read glob, skip units already in `DONE —`) is added only where the workflow already attempt-numbers and globs the artifact: `bkit-build-plan-gaps-remediate` (via `VERIFY_ATTEMPT`, glob already in its Read) and `bkit-build-plan-tasks` (one `build-plan-tasks-{GROUP}-log.md` per group; every attempt — a turn-cap re-run or a Decision Pause `Fix now` re-run — appends to it, and `bkit context brief --next` leaves out tasks it logs `DONE — TASK {N}:`). On PENDING (subagent timeout) the verify→remediate loop bounded by `build.verify.maxAttempts` absorbs recovery via `bkit-build-plan-gaps-remediate`. `bkit-debug-failure-remediate` is diagnosis-driven (each attempt takes a fresh strategy via `bkit-debug-failure-diagnose`), so skip-done would be the wrong shape. It gets stub+log only, but the flat log still feeds `bkit-debug-failure-diagnose`'s loop-context glob with finer evidence. |
+| **Engine-owned model evidence** | every subagent whose rows carry `by.model` | `bkit ledgers append --invocation=<id>` fills the row's `by.model`, `by.configuredModel` and `by.modelSource` (`host`, `configured` or `unavailable`) from the issued invocation; an agent never copies a model name into a row. |
 
 ## Model Presets
 
diff --git a/.bkit/core/.bkit/workflows.md b/.bkit/core/.bkit/workflows.md
index 707c116fb..0bc04c8b4 100644
--- a/.bkit/core/.bkit/workflows.md
+++ b/.bkit/core/.bkit/workflows.md
@@ -1350,6 +1350,8 @@ An outcome-verification gate. After the final loud push, it confirms that the bk
 - **Ship Step 9 duplicate-dispatch probe (not the gate):** `bkit runs wait --head=<VALIDATED_HEAD> --branch= --until=present --dispatch-if-absent` probes for a CI-workflow run at that head, presence only (`SHIP_PROBE_ATTEMPTS` x `SHIP_PROBE_INTERVAL_S`), and runs `gh workflow run {bkit.testing.ciWorkflow}` only on no-run. The head move it follows (Path B's Step 4 push of the local `origin/dev` merge) carries `[skip ci]`, so no `pull_request` run fires and the probe dispatches one; a run that did fire at the same SHA is found and reused instead, and the template `bkit-ci.yml` groups `pull_request` by PR number but `workflow_dispatch` by ref — different groups, so neither cancels the other and both runs complete. The probe carries no outcome vocabulary and is never a pass condition (no `self-healed`/`no-ci` path exists at ship): the head-anchored completion poll (`--until=completed`) and `bkit runs gate` at Gate 10 still own the verdict, so the "masks essential tests skipped" objection does not apply. Probe `err` → dispatch. Row `ship-revalidate-dispatch` records `probe` / `dispatched` / `attempts`. The 60s budget is load-bearing: a `pull_request` run surfacing after it reproduces the duplicate this probe removes. Auto-fired runs typically appear ~10-20s after the push, but auto-fire is intermittent, so the probe must keep failing safe to dispatch rather than reading a slow or absent run as "no CI".
 - **Ship Gate 10 + squash `--body ""`:** merge — squash subject = dev HEAD.
 
+**Bounded correction and CI re-entry:** A bkit command rejected before any write (effects = none, correctable = true) gets at most two corrected retries per printed `scope` through `bkit ledgers append --correction-of=<rejected operation>`; the engine derives the scope and the count, so a replay spends nothing. Uncertain effects are reconciled with the original `--operation` first. A stricter command-specific route or limit wins; authorization, gate and check failures keep the Failure Path. The CI wait turn-loop records each poll turn with `bkit runs handoff --invocation=<id>`, and `bkit runs dispatch --invocation=<id>` resumes from the persisted rows: no counter is supplied, a re-trigger commit and push happen once, and rows for another repo, PR or head never count.
+
 **Gate outcomes (4-state terminal verdict):**
 
 - `dispatched` — bkit CI check on pushed HEAD within poll budget. Proceed.
diff --git a/.bkit/core/engine/commands/lib.test.ts b/.bkit/core/engine/commands/lib.test.ts
index 25f622700..352d56abb 100644
--- a/.bkit/core/engine/commands/lib.test.ts
+++ b/.bkit/core/engine/commands/lib.test.ts
@@ -9,7 +9,9 @@ import {
   CommandError,
   EXIT,
   INVOCATION_FLAG,
+  NoWriteRejection,
   SKIP_CI_TOKEN,
+  UncertainEffect,
   commandHelp,
   ghUnavailable,
   parseFlags,
@@ -994,3 +996,91 @@ describe("explicit invocation context", () => {
     expect(seen).toHaveLength(1);
   });
 });
+
+describe("bounded correction eligibility", () => {
+  const verbThrowing = (make: () => Error): CommandSpec => ({
+    noun: "probe",
+    summary: "correction probe",
+    verbs: {
+      go: {
+        summary: "throws what the test gives it",
+        use: "workflow",
+        flags: [],
+        output: {},
+        run: () => {
+          throw make();
+        },
+      },
+    },
+  });
+
+  async function fail(make: () => Error, journal?: Parameters<typeof runCommand>[2]["journal"]) {
+    const out: string[] = [];
+    const err: string[] = [];
+    const code = await runCommand(["probe", "go", "--json"], [verbThrowing(make)], {
+      classicVerbs: new Set(),
+      cwd: os.tmpdir(),
+      io: { stdout: (t) => out.push(t), stderr: (t) => err.push(t) },
+      ...(journal === undefined ? {} : { journal }),
+    });
+    return { code, out: out.join(""), err: err.join("") };
+  }
+
+  const errorOf = (out: string) => (JSON.parse(out) as { error: Record<string, unknown> }).error;
+
+  it("exposes no-write correction eligibility only for declared pre-effect validation", async () => {
+    // Declared pre-effect validation: the structured error says nothing was written and a correction may follow.
+    const declared = await fail(
+      () =>
+        new NoWriteRejection(EXIT.USAGE, "row 2 has no summary", {
+          scope: "ledgers-append:failures",
+          substep: "append",
+        }),
+    );
+    expect(declared.code).toBe(EXIT.USAGE);
+    expect(declared.err).toContain("row 2 has no summary");
+    expect(errorOf(declared.out)).toMatchObject({
+      code: EXIT.USAGE,
+      message: "row 2 has no summary",
+      effects: "none",
+      correctable: true,
+      scope: "ledgers-append:failures",
+      substep: "append",
+    });
+
+    // A generic failure carries no declaration, so it never gets retry permission.
+    const generic = await fail(() => new CommandError(EXIT.USAGE, "bad flag"));
+    expect(generic.code).toBe(EXIT.USAGE);
+    expect(generic.out).not.toContain('correctable":true');
+    expect(generic.out).toBe("");
+
+    // A failure after an effect began is never correctable, whatever its exit code.
+    const post = await fail(() => new UncertainEffect(EXIT.NO, "append response lost"));
+    expect(post.code).toBe(EXIT.NO);
+    expect(errorOf(post.out)).toMatchObject({ effects: "uncertain", correctable: false });
+    expect(errorOf(post.out)).not.toHaveProperty("scope");
+
+    // A gate or permission refusal is a plain command error and stays uncorrectable.
+    const gate = await fail(() => new CommandError(EXIT.NEEDS_HUMAN, "gate refused"));
+    expect(gate.code).toBe(EXIT.NEEDS_HUMAN);
+    expect(gate.out).toBe("");
+
+    // Optional telemetry failing never masks the required mutation error or its eligibility.
+    const brokenJournal = {
+      call: () => {
+        throw new Error("telemetry down");
+      },
+      failure: () => {
+        throw new Error("telemetry down");
+      },
+    };
+    const masked = await fail(
+      () =>
+        new NoWriteRejection(EXIT.USAGE, "row 2 has no summary", { scope: "s", substep: "append" }),
+      brokenJournal,
+    );
+    expect(masked.code).toBe(EXIT.USAGE);
+    expect(errorOf(masked.out)).toMatchObject({ effects: "none", correctable: true });
+    expect(masked.err).toContain("row 2 has no summary");
+  });
+});
diff --git a/.bkit/core/engine/commands/lib.ts b/.bkit/core/engine/commands/lib.ts
index b52f4b0a1..70d7b6c41 100644
--- a/.bkit/core/engine/commands/lib.ts
+++ b/.bkit/core/engine/commands/lib.ts
@@ -70,6 +70,63 @@ export class CommandError extends Error {
   }
 }
 
+/**
+ * A refusal the receiving handler declares as pre-effect validation: nothing was written,
+ * so a corrected retry of the same sub-step is permitted within its correction budget.
+ * Only this class (never a generic `CommandError`) carries that permission.
+ */
+export class NoWriteRejection extends CommandError {
+  constructor(
+    code: number,
+    message: string,
+    readonly detail: { scope: string; substep: string },
+  ) {
+    super(code, message);
+  }
+}
+
+/** A failure after an effect may have begun: the state must be reconciled, never auto-retried. */
+export class UncertainEffect extends CommandError {}
+
+/** The correction budget of `scope` is spent: nothing was written and no further retry is allowed. */
+export class CorrectionExhausted extends CommandError {
+  constructor(
+    code: number,
+    message: string,
+    readonly scope: string,
+  ) {
+    super(code, message);
+  }
+}
+
+/** The structured `--json` error for the declared classes; every other error prints none. */
+function structuredError(err: CommandError): Record<string, unknown> | null {
+  if (err instanceof CorrectionExhausted) {
+    return {
+      code: err.code,
+      message: err.message,
+      effects: "none",
+      correctable: false,
+      exhausted: true,
+      scope: err.scope,
+    };
+  }
+  if (err instanceof NoWriteRejection) {
+    return {
+      code: err.code,
+      message: err.message,
+      effects: "none",
+      correctable: true,
+      scope: err.detail.scope,
+      substep: err.detail.substep,
+    };
+  }
+  if (err instanceof UncertainEffect) {
+    return { code: err.code, message: err.message, effects: "uncertain", correctable: false };
+  }
+  return null;
+}
+
 // ---------------------------------------------------------------------------
 // Specs
 // ---------------------------------------------------------------------------
@@ -769,6 +826,24 @@ export async function runCommand(
   }
   const rest = argv.slice(2);
   if (rest.some(isHelp)) {
+    if (rest.includes("--json")) {
+      const s = cmd.verbs[verb]!;
+      io.stdout(
+        `${JSON.stringify({
+          noun: cmd.noun,
+          verb,
+          summary: s.summary,
+          flags: s.flags.map((f) => ({
+            name: f.name,
+            type: f.type,
+            required: f.required === true,
+          })),
+          output: s.output,
+          exitCodes: s.exitCodes ?? {},
+        })}\n`,
+      );
+      return EXIT.OK;
+    }
     io.stdout(verbHelp(cmd, verb));
     return EXIT.OK;
   }
@@ -838,6 +913,8 @@ export async function runCommand(
   } catch (err) {
     if (!(err instanceof CommandError)) throw err;
     io.stderr(`${tag} ${err.message}\n`);
+    const structured = ctx.json ? structuredError(err) : null;
+    if (structured !== null) io.stdout(`${JSON.stringify({ error: structured })}\n`);
     outcome = err.code;
     return err.code;
   } finally {
diff --git a/.bkit/core/engine/commands/workflow/counters.test.ts b/.bkit/core/engine/commands/workflow/counters.test.ts
index eb2b20b70..90440d6c1 100644
--- a/.bkit/core/engine/commands/workflow/counters.test.ts
+++ b/.bkit/core/engine/commands/workflow/counters.test.ts
@@ -1083,3 +1083,79 @@ describe("bkit counters rows", () => {
     expect((await run(missing)).code).toBe(3);
   });
 });
+
+describe("bkit counters correction", () => {
+  const correct = (file: string, scope: string, operation: string, ...extra: string[]) =>
+    run([
+      "counters",
+      "correction",
+      `--file=${file}`,
+      "--workflow=plan",
+      `--scope=${scope}`,
+      `--operation=${operation}`,
+      ...extra,
+    ]);
+  const candidates = (file: string) =>
+    fs
+      .readFileSync(file, "utf-8")
+      .split("\n")
+      .filter((l) => l !== "")
+      .map((l) => JSON.parse(l) as Record<string, unknown>)
+      .filter((r) => r["type"] === "correction-candidate");
+
+  it("shares correction budget across candidate operations and honors specific limits", async () => {
+    const file = log([started("plan", "2026-11-01T00:00:00Z")]);
+    const scope = "ledgers-append:failures:append";
+
+    // Two corrected retries by default, each candidate under a fresh operation id.
+    const first = await correct(file, scope, "op-1");
+    expect(first.code).toBe(0);
+    expect(first.json).toMatchObject({ allowed: true, used: 1, limit: 2, remaining: 1 });
+    const second = await correct(file, scope, "op-2");
+    expect(second.json).toMatchObject({ allowed: true, used: 2, limit: 2, remaining: 0 });
+
+    // A third fresh operation, as a helper or a new tool call would mint, gains nothing.
+    const third = await correct(file, scope, "op-3");
+    expect(third.code).toBe(1);
+    expect(third.json).toMatchObject({ allowed: false, used: 2, limit: 2, remaining: 0 });
+    expect(candidates(file).map((r) => r["operation"])).toEqual(["op-1", "op-2"]);
+
+    // Asking again for an operation already counted is a replay: it spends nothing.
+    const replay = await correct(file, scope, "op-2");
+    expect(replay.code).toBe(0);
+    expect(replay.json).toMatchObject({ allowed: true, used: 2, replayed: true });
+
+    // A resume and other counter calls in between reset nothing.
+    fs.appendFileSync(
+      file,
+      `${JSON.stringify({ type: "workflow-meta", workflow: "plan", at: "2026-11-01T00:05:00Z", resumed: true })}\n${JSON.stringify(done("plan", "plan-review", "2026-11-01T00:06:00Z"))}\n`,
+    );
+    expect((await derive(file, "plan-review", "next")).code).toBe(0);
+    const afterResume = await correct(file, scope, "op-4");
+    expect(afterResume.code).toBe(1);
+    expect(afterResume.json).toMatchObject({ allowed: false, used: 2 });
+
+    // Another scope has its own budget.
+    const other = await correct(file, "ledgers-append:knowledge:append", "op-5");
+    expect(other.json).toMatchObject({ allowed: true, used: 1, limit: 2 });
+
+    // A route with a stricter limit of one never gains a second correction.
+    const strict = "ledgers-append:decisions:append";
+    expect((await correct(file, strict, "op-a", "--limit=1")).json).toMatchObject({
+      allowed: true,
+      used: 1,
+      limit: 1,
+      remaining: 0,
+    });
+    const denied = await correct(file, strict, "op-b", "--limit=1");
+    expect(denied.code).toBe(1);
+    expect(denied.json).toMatchObject({ allowed: false, used: 1, limit: 1 });
+    // Asking again under yet another operation id still gains nothing.
+    expect((await correct(file, strict, "op-c", "--limit=1")).code).toBe(1);
+
+    // A limit of zero permits no correction at all.
+    const none = await correct(file, "ledgers-append:roadmap:append", "op-z", "--limit=0");
+    expect(none.code).toBe(1);
+    expect(none.json).toMatchObject({ allowed: false, used: 0, limit: 0 });
+  });
+});
diff --git a/.bkit/core/engine/commands/workflow/counters.ts b/.bkit/core/engine/commands/workflow/counters.ts
index 1cd7dcba7..878188238 100644
--- a/.bkit/core/engine/commands/workflow/counters.ts
+++ b/.bkit/core/engine/commands/workflow/counters.ts
@@ -17,6 +17,7 @@ import {
   activeDoneStepsSinceClean,
   allRunsDoneSteps,
   appendLine,
+  CORRECTION_CANDIDATE_ROW,
   lastCleanRound,
   lastDoneStepAllRuns,
   nextStrategy,
@@ -39,6 +40,7 @@ import {
   type CommandSpec,
   type FlagValue,
   type RunContext,
+  wholeNumber,
 } from "../lib.js";
 import {
   EXIT_NO_STATUS,
@@ -179,6 +181,68 @@ function typedRowCount(file: string, workflow: string, type: string): number {
     .filter((r) => r.type === type && (r.workflow === undefined || r.workflow === workflow)).length;
 }
 
+/** Corrected retries a rejected sub-step gets unless its route names a stricter limit. */
+export const CORRECTION_LIMIT = 2;
+
+export interface CorrectionSpend {
+  allowed: boolean;
+  used: number;
+  limit: number;
+  remaining: number;
+  /** The operation was already counted: nothing was spent. */
+  replayed: boolean;
+}
+
+/**
+ * Spend one corrected retry of `scope` for `operation` in `workflow`'s active run. The budget is
+ * per scope and survives tools, helpers, resumes and any other counter call; a new operation id
+ * gains nothing, and asking again for a counted one spends nothing. `extra` joins the row.
+ */
+export function spendCorrection(
+  file: string,
+  workflow: string,
+  scope: string,
+  operation: string,
+  limit: number,
+  extra: Record<string, unknown> = {},
+): CorrectionSpend {
+  const rows = readStatusRows(file);
+  let start = -1;
+  rows.forEach((r, i) => {
+    if (r.type === "workflow-started" && r.workflow === workflow) start = i;
+  });
+  const spent = new Set<string>(
+    rows
+      .slice(start + 1)
+      .filter(
+        (r) => r.type === CORRECTION_CANDIDATE_ROW && r.workflow === workflow && r.scope === scope,
+      )
+      .map((r) => String(r.operation)),
+  );
+  const verdict = (allowed: boolean, replayed: boolean): CorrectionSpend => ({
+    allowed,
+    used: spent.size,
+    limit,
+    remaining: Math.max(0, limit - spent.size),
+    replayed,
+  });
+  if (spent.has(operation)) return verdict(true, true);
+  if (spent.size >= limit) return verdict(false, false);
+  fs.appendFileSync(
+    file,
+    appendLine({
+      type: CORRECTION_CANDIDATE_ROW,
+      workflow,
+      at: statusTimestamp(),
+      scope,
+      operation,
+      ...extra,
+    }),
+  );
+  spent.add(operation);
+  return verdict(true, false);
+}
+
 /** The row `counters grant` writes: the owner gave one loop one more full allowance. */
 export const ALLOWANCE_ROW = "allowance-granted";
 
@@ -585,6 +649,53 @@ export const countersCommand: CommandSpec = {
         return EXIT.OK;
       },
     },
+    correction: {
+      summary:
+        "Spend one corrected retry of a rejected sub-step: exit 0 allowed (or a replay of a counted operation), exit 1 the scope's budget is used up. The budget is two per scope in the active run unless a stricter --limit names one.",
+      use: "workflow",
+      flags: [
+        FILE_FLAG,
+        WORKFLOW_FLAG,
+        {
+          name: "scope",
+          type: "string",
+          required: true,
+          help: "the engine-derived correction scope",
+        },
+        {
+          name: "operation",
+          type: "string",
+          required: true,
+          help: "the corrected candidate's fresh operation id",
+        },
+        {
+          name: "limit",
+          type: "string",
+          help: `corrected retries this route allows (default ${CORRECTION_LIMIT}); a smaller one wins`,
+        },
+      ],
+      output: {
+        allowed: "true when the correction may run",
+        used: "operations counted in this scope",
+        limit: "retries this route allows",
+        remaining: "retries left",
+        replayed: "true when the operation was already counted: nothing was spent",
+      },
+      exitCodes: { [EXIT_NO_STATUS]: "status.jsonl missing, unreadable, or not valid NDJSON" },
+      run: (ctx) => {
+        const file = statusFile(ctx);
+        if (!fs.existsSync(file)) throw new CommandError(EXIT_NO_STATUS, `${file} does not exist`);
+        const spend = spendCorrection(
+          file,
+          String(ctx.flags.workflow),
+          String(ctx.flags.scope),
+          String(ctx.flags.operation),
+          wholeNumber(ctx.flags.limit, "limit", CORRECTION_LIMIT),
+        );
+        ctx.emit({ ...spend });
+        return spend.allowed ? EXIT.OK : EXIT.NO;
+      },
+    },
     max: {
       summary: "The ask points' limits and ask settings: one by --point, or all.",
       use: "workflow",
diff --git a/.bkit/core/engine/commands/workflow/ledgers.ts b/.bkit/core/engine/commands/workflow/ledgers.ts
index eba8076a6..9bb6e0adf 100644
--- a/.bkit/core/engine/commands/workflow/ledgers.ts
+++ b/.bkit/core/engine/commands/workflow/ledgers.ts
@@ -33,32 +33,41 @@ import {
 } from "../../ledgers/telemetry.js";
 import { COMPACT_LEDGERS, compactLedgers, type CompactLedger } from "../../ledgers/compact.js";
 import {
+  CORRECTION_REJECTED_ROW,
+  CORRECTION_SUCCEEDED_ROW,
   LEDGER_OPERATIONS_FILE,
   actionHash,
   appendHeld,
+  appendLine,
+  correctionScope,
   ledgerIntent,
   ledgerOperation,
   pendingLedgerIntents,
   recordLedgerIntent,
   recordLedgerOperation,
+  statusTimestamp,
   withTargetLock,
   writePrepared,
   type AppendCheckpoint,
 } from "../../ledgers/status.js";
 import {
   CommandError,
+  CorrectionExhausted,
   EXIT,
   INVOCATION_FLAG,
   isIgnoredPath,
   isSharedBranch,
+  NoWriteRejection,
   parseJson,
+  UncertainEffect,
   wholeNumber,
   type CommandSpec,
   type FlagSpec,
   type Invocation,
   type RunContext,
 } from "../lib.js";
-import { str } from "./status.js";
+import { CORRECTION_LIMIT, spendCorrection, type CorrectionSpend } from "./counters.js";
+import { readStatusRows, str } from "./status.js";
 import {
   NO_MARKERS_REASON,
   outOfScope,
@@ -841,6 +850,11 @@ export const ledgersCommand: CommandSpec = {
           type: "boolean",
           help: "let the engine issue the operation id from --invocation and the request, so a retried call after a lost response replays instead of appending again; exclusive with --operation",
         },
+        {
+          name: "correction-of",
+          type: "string",
+          help: "the operation of an earlier guaranteed no-write rejection of this ledger append in this step: this call is its corrected retry (two per scope), under its own fresh --operation or --issue-operation",
+        },
       ],
       output: {
         ledger: "the ledger appended to",
@@ -849,6 +863,8 @@ export const ledgersCommand: CommandSpec = {
         keys: "each row's key, in order (null when a row has none)",
         receipt:
           "with --operation: {operation, ledger, file, offset, bytes, rows[{key, ts}], replayed}; replayed is true when the original effect is returned",
+        correction:
+          "with --correction-of: {scope, operation, of, used, limit, substep, verified}; verified is true when the rows landed (or the original receipt was returned)",
       },
       exitCodes: {
         [EXIT_STAGE]:
@@ -1438,6 +1454,43 @@ export interface AppendOptions {
   checkpoint?: AppendCheckpoint;
 }
 
+/**
+ * The operation id of an append request: the caller's `--operation`, else (with
+ * `--issue-operation`) one issued from the invocation and the request, so retrying a lost
+ * response gets the same id.
+ */
+export function appendOperationId(
+  ledger: string,
+  rows: unknown,
+  invocation: Invocation | undefined,
+  options: { operation?: string; issueOperation?: boolean },
+): string | undefined {
+  if (options.operation !== undefined) return options.operation;
+  if (options.issueOperation !== true || invocation === undefined) return undefined;
+  const hash = actionHash(JSON.stringify({ ledger, rows, invocation: invocation.id }));
+  return `op-${invocation.id.slice(4, 16)}-${hash.slice(0, 12)}`;
+}
+
+/** The correction scope of an append by a workflow-run invocation; null for any other caller. */
+export function appendCorrectionScope(invocation: Invocation, ledger: string): string | null {
+  if (
+    invocation.scope !== "run" ||
+    invocation.statusPath === null ||
+    invocation.workflow === null ||
+    invocation.step === null
+  )
+    return null;
+  return correctionScope({
+    workflow: invocation.workflow,
+    run: invocation.run,
+    step: invocation.step,
+    group: invocation.group,
+    attempt: invocation.attempt,
+    ledger,
+    substep: "append",
+  });
+}
+
 /** The `{key, ts}` of each row in prepared `block` bytes. */
 function receiptRows(block: string): LedgerReceipt["rows"] {
   const out: LedgerReceipt["rows"] = [];
@@ -1495,12 +1548,16 @@ export function appendLedgerRows(
       EXIT.USAGE,
       "--issue-operation needs --invocation: the id is issued from that invocation's context",
     );
-  // Issued from the invocation and the request hash, so retrying a lost response gets the same id.
-  const operation =
-    options.operation ??
-    (options.issueOperation === true && invocation !== undefined
-      ? `op-${invocation.id.slice(4, 16)}-${hash.slice(0, 12)}`
-      : undefined);
+  const operation = appendOperationId(ledger, rows, invocation, options);
+  // A rejection before any write is correctable only inside a workflow run (it has a scope to
+  // spend from) and only when the operation can be named by the corrected retry.
+  const scope = invocation === undefined ? null : appendCorrectionScope(invocation, ledger);
+  const reject = (why: string, row: number) => {
+    const message = `row ${row}: ${why}`;
+    return scope !== null && operation !== undefined
+      ? new NoWriteRejection(EXIT_ROW_REFUSED, message, { scope, substep: "append" })
+      : new CommandError(EXIT_ROW_REFUSED, message);
+  };
 
   const result = (landed: { offset: number; bytes: number }, block: string, replayed: boolean) => {
     const parsedRows = receiptRows(block);
@@ -1533,7 +1590,7 @@ export function appendLedgerRows(
     const out: Array<Record<string, unknown>> = rows.map((raw, i) => {
       const refuse = (why: string) => new CommandError(EXIT_ROW_REFUSED, `row ${i + 1}: ${why}`);
       if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
-        throw refuse("not a JSON object");
+        throw reject("not a JSON object", i + 1);
       }
       const r =
         invocation === undefined
@@ -1543,15 +1600,17 @@ export function appendLedgerRows(
         throw refuse(
           "by.modelSource unavailable needs a validated --invocation; the engine records it, a caller cannot assert it",
         );
-      if (Object.hasOwn(r, "ts")) throw refuse("carries ts; ts is minted at append time");
-      if (Object.hasOwn(r, "schema")) throw refuse("carries schema; it is set at append time");
+      if (Object.hasOwn(r, "ts")) throw reject("carries ts; ts is minted at append time", i + 1);
+      if (Object.hasOwn(r, "schema"))
+        throw reject("carries schema; it is set at append time", i + 1);
       if (!takes.includes(String(r["kind"]))) {
-        throw refuse(
+        throw reject(
           `kind must be ${takes.join(" | ")} in --ledger=${ledger} (got ${String(r["kind"])})`,
+          i + 1,
         );
       }
       if (Object.hasOwn(r, "bkit"))
-        throw refuse("carries bkit; bkit.version is set at append time");
+        throw reject("carries bkit; bkit.version is set at append time", i + 1);
       repo ??= resolveRepoSlug(root) || "unknown/repo";
       version ??= readBkitVersion(path.join(root, ".bkit", "version"))?.pinnedVersion || "unknown";
       last = mintTs(last);
@@ -1566,7 +1625,7 @@ export function appendLedgerRows(
       for (const k of TOP_ORDER) if (filled[k] !== undefined) row[k] = filled[k];
       for (const [k, v] of Object.entries(filled)) if (!(k in row)) row[k] = v;
       const v = validate(row);
-      if (!v.ok) throw refuse(v.reason ?? "invalid");
+      if (!v.ok) throw reject(v.reason ?? "invalid", i + 1);
       const who = writerProblem(row);
       if (who !== undefined) throw refuse(who);
       prior.push(row);
@@ -1635,7 +1694,7 @@ export function appendLedgerRows(
             return result(intent, intent.block, true);
           }
           if (seg.length > 0 && have.length === intent.offset + seg.length)
-            throw new CommandError(
+            throw new UncertainEffect(
               EXIT_STAGE,
               `operation ${operation}: ${file} holds ${seg.length} of ${want.length} prepared bytes; the effect is uncertain, nothing was truncated or retried`,
             );
@@ -1694,16 +1753,132 @@ function append(ctx: RunContext): number {
         `conflict: --root ${root} is outside the checkout ${ctx.invocation.worktree} that issued invocation ${ctx.invocation.id}`,
       );
   }
-  const r = appendLedgerRows(root, String(ctx.flags.ledger), parsed.value, ctx.invocation, {
+  const ledger = String(ctx.flags.ledger);
+  const request = {
     operation: str(ctx.flags.operation),
     issueOperation: ctx.flags.issueOperation === true,
-  });
+  };
+  const run = ctx.invocation;
+  const scope = run === undefined ? null : appendCorrectionScope(run, ledger);
+  const operation = appendOperationId(ledger, parsed.value, run, request);
+  const correctionOf = str(ctx.flags.correctionOf);
+  let spend: CorrectionSpend | undefined;
+  if (correctionOf !== undefined) {
+    if (run === undefined || scope === null || run.statusPath === null || run.workflow === null)
+      throw new CommandError(
+        EXIT.USAGE,
+        "--correction-of needs a workflow-run --invocation: the correction budget lives in that run",
+      );
+    if (operation === undefined || operation === correctionOf)
+      throw new CommandError(
+        EXIT.USAGE,
+        "--correction-of needs a fresh --operation or --issue-operation: a corrected candidate has its own operation id",
+      );
+    const rejected = readStatusRows(run.statusPath).some(
+      (row) =>
+        row.type === CORRECTION_REJECTED_ROW &&
+        row.operation === correctionOf &&
+        row.scope === scope &&
+        row.workflow === run.workflow,
+    );
+    if (!rejected)
+      throw new CommandError(
+        EXIT.USAGE,
+        `--correction-of=${correctionOf} names no rejected ${ledger} append in this step; only a guaranteed no-write rejection of this sub-step can be corrected`,
+      );
+    // An earlier operation on this ledger whose effect is unconfirmed is reconciled first.
+    const target = Object.hasOwn(APPEND_LEDGERS, ledger)
+      ? APPEND_LEDGERS[ledger as AppendLedger].file
+      : undefined;
+    if (
+      target !== undefined &&
+      pendingLedgerIntents(path.join(root, LEDGER_OPERATIONS_FILE), target).length > 0
+    )
+      throw new UncertainEffect(
+        EXIT_STAGE,
+        `${target} holds an operation whose effect is unconfirmed; reconcile it before any corrected candidate — nothing was written`,
+      );
+    spend = spendCorrection(run.statusPath, run.workflow, scope, operation, CORRECTION_LIMIT, {
+      of: correctionOf,
+      step: run.step,
+      substep: "append",
+    });
+    if (!spend.allowed)
+      throw new CorrectionExhausted(
+        EXIT.NO,
+        `the correction budget of ${scope} is spent (${spend.used} of ${spend.limit}); nothing was written`,
+        scope,
+      );
+  }
+  let r: AppendResult;
+  try {
+    r = appendLedgerRows(root, ledger, parsed.value, ctx.invocation, request);
+  } catch (err) {
+    if (
+      err instanceof NoWriteRejection &&
+      run?.statusPath != null &&
+      run.workflow !== null &&
+      operation !== undefined
+    ) {
+      fs.appendFileSync(
+        run.statusPath,
+        appendLine({
+          type: CORRECTION_REJECTED_ROW,
+          workflow: run.workflow,
+          at: statusTimestamp(),
+          scope: err.detail.scope,
+          substep: err.detail.substep,
+          operation,
+          step: run.step,
+        }),
+      );
+      // The last allowed retry was just used: the rejection is final, not correctable.
+      if (spend !== undefined && spend.remaining === 0)
+        throw new CommandError(err.code, err.message);
+    }
+    throw err;
+  }
   ctx.log(
     r.receipt?.replayed === true
       ? `operation ${r.receipt.operation} already appended to ${r.file}; nothing written`
       : `appended ${r.appended} row(s) to ${r.file}`,
   );
-  ctx.emit({ ...r });
+  if (spend === undefined || run?.statusPath == null || run.workflow === null || scope === null) {
+    ctx.emit({ ...r });
+    return EXIT.OK;
+  }
+  const verified =
+    r.receipt?.replayed === true || r.appended === (parsed.value as unknown[]).length;
+  const statusPath = run.statusPath;
+  const succeeded = readStatusRows(statusPath).some(
+    (row) => row.type === CORRECTION_SUCCEEDED_ROW && row.operation === operation,
+  );
+  if (verified && !succeeded)
+    fs.appendFileSync(
+      statusPath,
+      appendLine({
+        type: CORRECTION_SUCCEEDED_ROW,
+        workflow: run.workflow,
+        at: statusTimestamp(),
+        scope,
+        substep: "append",
+        operation,
+        of: correctionOf,
+        step: run.step,
+      }),
+    );
+  ctx.emit({
+    ...r,
+    correction: {
+      scope,
+      operation,
+      of: correctionOf,
+      used: spend.used,
+      limit: spend.limit,
+      substep: "append",
+      verified,
+    },
+  });
   return EXIT.OK;
 }
 
diff --git a/.bkit/core/engine/commands/workflow/runs.test.ts b/.bkit/core/engine/commands/workflow/runs.test.ts
index be0b5b205..aa454ebaa 100644
--- a/.bkit/core/engine/commands/workflow/runs.test.ts
+++ b/.bkit/core/engine/commands/workflow/runs.test.ts
@@ -7,6 +7,7 @@ import { afterEach, describe, expect, it } from "vitest";
 import { useGateRunner } from "../../../../../vitest.gate-fixture";
 
 import { runCommand } from "../lib";
+import { COMMANDS } from "../registry";
 import {
   checkNamespace,
   ciDispatchGate,
@@ -3077,3 +3078,245 @@ describe(
     });
   },
 );
+
+describe("bkit runs handoff", { timeout: 30_000 }, () => {
+  const REL = "docs/plans/202611/logs/1-x/status.jsonl";
+  const HEAD = "a".repeat(40);
+  const OTHER_HEAD = "c".repeat(40);
+  const NEW_HEAD = "b".repeat(40);
+  const TARGET = {
+    provider: "github",
+    repo: "example/example",
+    pr: "7",
+    head: HEAD,
+    branch: "feat/1-x",
+  };
+
+  /** A real repo with a run's status log and an engine-issued invocation bound to it. */
+  async function handoffRepo(o: { ciFile?: boolean } = {}) {
+    const cwd = tmp("bkit-handoff-");
+    gitIn(cwd, "init", "-q", "-b", "feat/1-x");
+    const status = path.join(cwd, REL);
+    fs.mkdirSync(path.dirname(status), { recursive: true });
+    fs.writeFileSync(
+      status,
+      `${JSON.stringify({ type: "workflow-started", workflow: "build", at: "2026-11-01T00:00:00Z" })}\n`,
+    );
+    if (o.ciFile) {
+      fs.mkdirSync(path.join(cwd, ".github/workflows"), { recursive: true });
+      fs.writeFileSync(path.join(cwd, ".github/workflows/bkit-ci.yml"), "name: bkit-ci\n");
+    }
+    gitIn(cwd, "add", "-A");
+    gitIn(cwd, "commit", "-q", "-m", "init");
+    const out: string[] = [];
+    const code = await runCommand(
+      [
+        "status",
+        "invocation",
+        "--workflow=build",
+        "--step=build-close-workflow",
+        `--file=${REL}`,
+        "--host=claude",
+        "--configured-model=sonnet",
+        "--json",
+      ],
+      COMMANDS,
+      {
+        classicVerbs: new Set(["status"]),
+        cwd,
+        io: { stdout: (t) => out.push(t), stderr: () => {} },
+      },
+    );
+    expect(code).toBe(0);
+    const id = (JSON.parse(out.join("")) as { invocation: string }).invocation;
+    return { cwd, status, id };
+  }
+
+  type Repo = Awaited<ReturnType<typeof handoffRepo>>;
+  const observe = (r: Repo, flags: string[], target: Record<string, string> = {}) =>
+    cli(r.cwd, [
+      "handoff",
+      `--invocation=${r.id}`,
+      `--repo=${target.repo ?? TARGET.repo}`,
+      `--pr=${target.pr ?? TARGET.pr}`,
+      `--head=${target.head ?? TARGET.head}`,
+      `--branch=${TARGET.branch}`,
+      "--budget-s=60",
+      "--interval-s=10",
+      ...flags,
+    ]);
+  const handoffRows = (r: Repo) =>
+    fs
+      .readFileSync(r.status, "utf-8")
+      .split("\n")
+      .filter((l) => l !== "")
+      .map((l) => JSON.parse(l) as Record<string, any>)
+      .filter((row) => row["type"] === "ci-handoff");
+  /** What a dispatcher already persisted before this process started. */
+  const persist = (r: Repo, rows: Array<Record<string, unknown>>) =>
+    fs.appendFileSync(r.status, rows.map((row) => `${JSON.stringify(row)}\n`).join(""));
+  const persisted = (at: string, over: Record<string, unknown>) => ({
+    type: "ci-handoff",
+    workflow: "build",
+    at,
+    phase: "poll",
+    target: TARGET,
+    observation: { result: "none", attempts: 6, errors: 0 },
+    ...over,
+  });
+  const RETRIGGER = { original: HEAD, commit: NEW_HEAD, ref: "refs/heads/feat/1-x" };
+
+  it("derives handoff decisions from persisted poll observations and target identity", async () => {
+    // Fresh polls accumulate: engine-derived totals, the next action, one persisted row per observation.
+    const fresh = await handoffRepo();
+    const first = await observe(fresh, ["--result=none", "--polls=3"]);
+    expect(first.code).toBe(0);
+    expect(first.json).toMatchObject({
+      phase: "poll",
+      attempts: 3,
+      errors: 0,
+      nextAction: "poll-again",
+      stale: 0,
+    });
+    const second = await observe(fresh, ["--result=none", "--polls=3"]);
+    expect(second.json).toMatchObject({ phase: "poll", attempts: 6, nextAction: "retrigger" });
+    expect(handoffRows(fresh)).toHaveLength(2);
+    expect(handoffRows(fresh).at(-1)).toMatchObject({
+      phase: "poll",
+      target: TARGET,
+      observation: { result: "none", attempts: 6, errors: 0 },
+    });
+
+    // Every kind of observation that proves a run exists ends the poll with a dispatched verdict.
+    for (const result of ["pending", "success", "failure"]) {
+      const repo = await handoffRepo();
+      const found = await observe(repo, [`--result=${result}`, "--polls=1"]);
+      expect(found.json).toMatchObject({
+        nextAction: "verdict",
+        outcome: "dispatched",
+        attempts: 1,
+        ciResult: result,
+      });
+    }
+
+    // A provider that only errors is unresolved, never a clean absence of CI.
+    const broken = await handoffRepo();
+    const errored = await observe(broken, ["--result=provider-error", "--polls=6"]);
+    expect(errored.json).toMatchObject({
+      attempts: 6,
+      errors: 6,
+      nextAction: "verdict",
+      outcome: "unresolved",
+      reason: "gh-error",
+    });
+
+    // Supplied counters and a supplied success are not evidence: the flags do not exist.
+    const forged = await handoffRepo();
+    const before = fs.readFileSync(forged.status, "utf-8");
+    for (const flag of ["--attempts=99", "--errors=0", "--success", "--poll-result=found"]) {
+      expect((await observe(forged, ["--result=none", "--polls=1", flag])).code).toBe(2);
+    }
+    expect((await observe(forged, ["--result=maybe", "--polls=1"])).code).toBe(2);
+    expect((await observe(forged, ["--polls=1"])).code).toBe(2);
+    expect(fs.readFileSync(forged.status, "utf-8")).toBe(before);
+
+    // Without an engine-issued invocation there is no run to persist into: refused, nothing written.
+    const bare = await handoffRepo();
+    const noInvocation = await cli(bare.cwd, [
+      "handoff",
+      "--repo=example/example",
+      "--pr=7",
+      `--head=${HEAD}`,
+      "--result=none",
+      "--polls=1",
+    ]);
+    expect(noInvocation.code).toBe(2);
+    expect(handoffRows(bare)).toEqual([]);
+
+    // An unresolved retrigger intent is not a completed retrigger: the poll cannot reach a verdict.
+    for (const retrigger of [
+      { state: "intended", original: HEAD },
+      { state: "commit-created", ...RETRIGGER },
+    ]) {
+      const pending = await handoffRepo();
+      persist(pending, [persisted("2026-11-01T00:01:00Z", { retrigger })]);
+      const silent = await observe(pending, ["--result=none", "--polls=6"]);
+      expect(silent.json).toMatchObject({ nextAction: "reconcile-retrigger", attempts: 12 });
+      expect(silent.json).not.toHaveProperty("outcome");
+      expect(handoffRows(pending).at(-1)).toMatchObject({ retrigger: { state: retrigger.state } });
+    }
+
+    // After a completed retrigger the second poll carries the running total and decides.
+    const completed = {
+      state: "receipt-completed",
+      ...RETRIGGER,
+      remote: NEW_HEAD,
+      receipt: "retrigger-1",
+    };
+    const afterRetrigger = (over: Record<string, unknown>) =>
+      persisted("2026-11-01T00:02:00Z", { phase: "repoll", retrigger: completed, ...over });
+    const quietNoCi = await handoffRepo();
+    persist(quietNoCi, [afterRetrigger({})]);
+    expect(await observe(quietNoCi, ["--result=none", "--polls=6"])).toMatchObject({
+      json: { phase: "repoll", attempts: 12, nextAction: "verdict", outcome: "no-ci" },
+    });
+    const declared = await handoffRepo({ ciFile: true });
+    persist(declared, [afterRetrigger({})]);
+    expect((await observe(declared, ["--result=none", "--polls=6"])).json).toMatchObject({
+      outcome: "unresolved",
+      reason: "ci-declared-no-run",
+    });
+    const healed = await handoffRepo();
+    persist(healed, [afterRetrigger({})]);
+    expect((await observe(healed, ["--result=pending", "--polls=1"])).json).toMatchObject({
+      phase: "repoll",
+      nextAction: "verdict",
+      outcome: "self-healed",
+      attempts: 7,
+    });
+
+    // Evidence for another head, PR or repository is stale: it adds nothing and decides nothing.
+    const moved = await handoffRepo();
+    persist(moved, [
+      persisted("2026-11-01T00:03:00Z", {
+        target: { ...TARGET, head: OTHER_HEAD },
+        observation: { result: "success", attempts: 9, errors: 0 },
+      }),
+      persisted("2026-11-01T00:03:30Z", {
+        target: { ...TARGET, pr: "8" },
+        observation: { result: "failure", attempts: 9, errors: 0 },
+      }),
+      persisted("2026-11-01T00:04:00Z", {
+        target: { ...TARGET, repo: "other/example" },
+        observation: { result: "success", attempts: 9, errors: 0 },
+      }),
+    ]);
+    const current = await observe(moved, ["--result=none", "--polls=1"]);
+    expect(current.json).toMatchObject({
+      phase: "poll",
+      attempts: 1,
+      nextAction: "poll-again",
+      stale: 3,
+    });
+    expect(current.json).not.toHaveProperty("outcome");
+    // The same state asked for the other head answers from that head's own evidence only.
+    const other = await observe(moved, ["--result=pending", "--polls=1"], { head: OTHER_HEAD });
+    expect(other.json).toMatchObject({ attempts: 10, outcome: "dispatched", stale: 3 });
+
+    // A target that does not name its head, PR and repository cannot ask for a decision.
+    for (const missing of ["--head=", "--repo=", "--pr="]) {
+      const bad = await cli(moved.cwd, [
+        "handoff",
+        `--invocation=${moved.id}`,
+        "--repo=example/example",
+        "--pr=7",
+        `--head=${HEAD}`,
+        `--branch=${TARGET.branch}`,
+        missing,
+        "--result=none",
+        "--polls=1",
+      ]);
+      expect(bad.code).toBe(2);
+    }
+  });
+});
diff --git a/.bkit/core/engine/commands/workflow/runs.ts b/.bkit/core/engine/commands/workflow/runs.ts
index 969d2a6d4..af4063a21 100644
--- a/.bkit/core/engine/commands/workflow/runs.ts
+++ b/.bkit/core/engine/commands/workflow/runs.ts
@@ -25,10 +25,18 @@ import * as path from "node:path";
 import { readJsonFile } from "../../shared/json.js";
 
 import {
+  appendLine,
+  CI_HANDOFF_RESULTS,
   CI_TIERS,
+  foldCiHandoff,
   lastRun,
   statusTimestamp,
+  validateCiHandoffEvent,
   validateCiSelection,
+  type CiHandoffResult,
+  type CiHandoffRetrigger,
+  type CiHandoffState,
+  type CiHandoffTarget,
   type CiSelection,
   type CiTier,
 } from "../../ledgers/status.js";
@@ -39,6 +47,7 @@ import {
   DEV,
   EXIT,
   git,
+  INVOCATION_FLAG,
   isSharedBranch,
   parseJson,
   runGh,
@@ -58,7 +67,15 @@ import { FID_PATTERNS, fromBranch, fromMarker, issueIdOf, readIssueTracker } fro
 import type { IssueTracker } from "../../install/manifest.js";
 import { AUTO_LABEL, AUTO_ROUTE_SUFFIX } from "./issues.js";
 import { fetchRemoteRef, pushBranch } from "./branches.js";
-import { activeRecord, checkOnlyBookkeeping, retriggerCommit } from "./ledgers.js";
+import {
+  activeRecord,
+  appendRecordCommit,
+  checkOnlyBookkeeping,
+  commitOwnSet,
+  markRecordPushed,
+  readRecord,
+  retriggerCommit,
+} from "./ledgers.js";
 import {
   closeTransportRow,
   crossCheckFile,
@@ -67,9 +84,9 @@ import {
   probePr,
   type PrInfo,
 } from "./prs.js";
-import { resolveOwnerRepo, splitSlug } from "./repo.js";
+import { originOwnerRepo, resolveOwnerRepo, splitSlug } from "./repo.js";
 import { restateOutcome } from "./run-facts.js";
-import { extraField, readRuns, str } from "./status.js";
+import { extraField, readRuns, readStatusRows, str } from "./status.js";
 import { writeStepRow } from "./steps.js";
 import { attempt, issueRef, readLabels, trackerTarget } from "./tracker.js";
 
@@ -705,6 +722,20 @@ export interface DispatchOptions {
    * An own-commit push lands copies, so it is not necessarily local HEAD.
    */
   sha?: string;
+  /**
+   * Durable continuation: every poll observation and re-trigger checkpoint is appended to
+   * `statusPath` as a `ci-handoff` row, and a fresh call with the same path resumes from them.
+   */
+  handoff?: HandoffOptions;
+}
+
+export interface HandoffOptions {
+  statusPath: string;
+  /** The receipt written once the re-trigger is complete. */
+  operation: string;
+  workflow?: string;
+  /** Called after each re-trigger checkpoint is durable. */
+  checkpoint?: (name: "commit-created" | "push-completed" | "receipt-completed") => void;
 }
 
 export interface DispatchResult {
@@ -736,6 +767,105 @@ function pushCurrentBranch(cwd: string): { ok: boolean; error: string } {
   return { ok: res.ok, error: res.ok ? "" : res.stderr || res.stdout };
 }
 
+/**
+ * Land a shared-branch run's own commits when every one of them changes nothing (a re-trigger and
+ * an empty close): each is copied onto the remote tip with that tip's own tree and pushed as a
+ * fast-forward. The tree is one the remote already holds, so there is nothing for a landing gate
+ * to validate, and no foreign local commit rides along. `not-empty` hands the push to
+ * `pushBranch`, whose landing gate covers content.
+ */
+function landEmptyOwnCommits(
+  cwd: string,
+  fid: string,
+  branch: string,
+  log: (m: string) => void,
+): { kind: "landed"; sha: string } | { kind: "not-empty" } | { kind: "failed" } {
+  const rec = readRecord(cwd, fid);
+  if (rec === null || !runGit(cwd, ["fetch", "origin", branch]).ok) return { kind: "failed" };
+  const tip = git(cwd, ["rev-parse", "-q", "--verify", `origin/${branch}`]);
+  const tipTree = tip === null ? null : git(cwd, ["rev-parse", `${tip}^{tree}`]);
+  if (tip === null || tipTree === null) return { kind: "failed" };
+  const landed = new Set(rec.pushed ?? []);
+  const pending = rec.commits.filter(
+    (c) => !landed.has(c) && !runGit(cwd, ["merge-base", "--is-ancestor", c, tip]).ok,
+  );
+  if (pending.length === 0) {
+    const sha = rec.pushed?.at(-1);
+    return sha === undefined ? { kind: "failed" } : { kind: "landed", sha };
+  }
+  const empty = (c: string) => {
+    const tree = git(cwd, ["rev-parse", `${c}^{tree}`]);
+    return tree !== null && tree === git(cwd, ["rev-parse", `${c}^^{tree}`]);
+  };
+  if (!pending.every(empty)) return { kind: "not-empty" };
+  let parent = tip;
+  for (const c of pending) {
+    const made = runGit(cwd, [
+      "commit-tree",
+      tipTree,
+      "-p",
+      parent,
+      "-m",
+      git(cwd, ["log", "-1", "--format=%B", c]) ?? "",
+    ]);
+    if (!made.ok) return { kind: "failed" };
+    parent = made.stdout;
+  }
+  const pushed = runGit(cwd, ["push", "origin", `${parent}:refs/heads/${branch}`]);
+  if (!pushed.ok) {
+    log(`pushing the run's empty commits to ${branch} failed: ${pushed.stderr}`);
+    return { kind: "failed" };
+  }
+  markRecordPushed(cwd, fid, pending);
+  log(
+    `landed ${pending.length} empty commit(s) of the run on ${branch} as copies (${parent.slice(0, 12)})`,
+  );
+  return { kind: "landed", sha: parent };
+}
+
+/** The persisted `ci-handoff` rows of a status file (none when the file does not exist yet). */
+function handoffRowsOf(statusPath: string): object[] {
+  return fs.existsSync(statusPath) ? readStatusRows(statusPath) : [];
+}
+
+/** The tip of `branch` on origin: its sha, "" when the branch is absent there, null when the lookup failed. */
+function remoteTip(cwd: string, branch: string): string | null {
+  const res = runGit(cwd, ["ls-remote", "origin", `refs/heads/${branch}`]);
+  if (!res.ok) return null;
+  return res.stdout.split(/\s+/)[0] ?? "";
+}
+
+/**
+ * The head a target is persisted under. Rows written before a re-trigger carry the head the
+ * re-trigger started from, so a process that finds HEAD on the re-trigger commit resumes them.
+ */
+function resolveHandoffHead(
+  rows: object[],
+  identity: Omit<CiHandoffTarget, "head">,
+  cwd: string,
+  current: string,
+): string {
+  const mine = rows
+    .filter(validateCiHandoffEvent)
+    .filter(
+      (e) =>
+        e.target.repo.toLowerCase() === identity.repo.toLowerCase() &&
+        e.target.pr === identity.pr &&
+        e.target.branch === identity.branch,
+    );
+  const latest = mine.at(-1);
+  if (latest === undefined || latest.target.head === current) return current;
+  const rt = latest.retrigger;
+  if (rt?.commit === current) return latest.target.head;
+  if (
+    rt?.state === "intended" &&
+    git(cwd, ["rev-parse", "HEAD^"]) === rt.original &&
+    /re-trigger/.test(commitMessage(cwd, current) ?? "")
+  )
+    return latest.target.head;
+  return current;
+}
+
 /**
  * The CI-Dispatch Gate after build / debug's last push. Never pushes after the
  * verdict: a later commit would move the PR head away from the run it proved.
@@ -784,7 +914,97 @@ export async function ciDispatchGate(
         ciWorkflow: declared.ciWorkflow,
         namespace: checkNamespace(capstoneJob),
       };
+  // Durable continuation: the persisted state of this target, and the totals kept in step with it.
+  const hand = o.handoff;
+  const rowsAtStart = hand ? handoffRowsOf(hand.statusPath) : [];
+  const identity = {
+    provider: "github" as const,
+    repo: originOwnerRepo(o.cwd) ?? "local/origin",
+    pr: o.pr,
+    branch: branch || "HEAD",
+  };
+  const ht: CiHandoffTarget = {
+    ...identity,
+    head: hand ? resolveHandoffHead(rowsAtStart, identity, o.cwd, res.head) : res.head,
+  };
+  const hs: CiHandoffState | null = hand ? foldCiHandoff(rowsAtStart, ht) : null;
+  let cumAttempts = hs?.attempts ?? 0;
+  let cumErrors = hs?.errors ?? 0;
+  let curRt: CiHandoffRetrigger | null = hs?.retrigger ?? null;
+  const repollBase = hs?.retriggerBase ?? null;
+  let lastResult: CiHandoffResult = hs?.last?.result ?? "none";
+  if (hs) res.attempts = hs.attempts;
+  const persist = (phase: "poll" | "repoll", result: CiHandoffResult) => {
+    if (!hand) return;
+    lastResult = result;
+    fs.appendFileSync(
+      hand.statusPath,
+      appendLine({
+        type: "ci-handoff",
+        workflow: hand.workflow ?? "build",
+        at: statusTimestamp(),
+        phase,
+        target: ht,
+        observation: { result, attempts: cumAttempts, errors: cumErrors },
+        ...(curRt === null ? {} : { retrigger: curRt }),
+      }),
+    );
+  };
+  const pollBudget = Math.max(1, Math.ceil(o.budgetS / o.intervalS));
+  const handoffPoll = async (phase: "poll" | "repoll"): Promise<SuppliedPoll | null> => {
+    // The first phase ends where the re-trigger began; the re-poll counts from there.
+    // No PR to read is the shell's empty-PR poll: zero attempts, all errored.
+    if (o.pr === null && !byRun) return { pollResult: "err", attempts: 0, allErrored: true };
+    if (byRun) target.head = head();
+    const baseA = phase === "repoll" ? (repollBase?.attempts ?? cumAttempts) : 0;
+    const baseE = phase === "repoll" ? (repollBase?.errors ?? cumErrors) : 0;
+    const endA = phase === "poll" && repollBase ? repollBase.attempts : cumAttempts;
+    const endE = phase === "poll" && repollBase ? repollBase.errors : cumErrors;
+    const foundBefore =
+      hs?.last !== null &&
+      hs?.last !== undefined &&
+      ["pending", "success", "failure"].includes(hs.last.result) &&
+      hs.phase === phase;
+    if (foundBefore && endA === cumAttempts) {
+      return { pollResult: "found", attempts: cumAttempts - baseA, allErrored: false };
+    }
+    const remaining = pollBudget - (endA - baseA);
+    if (remaining <= 0) {
+      return {
+        pollResult: "none",
+        attempts: endA - baseA,
+        allErrored: endA - baseA > 0 && endE - baseE === endA - baseA,
+      };
+    }
+    let errs = 0;
+    deps.log(
+      `polling for a ${target.namespace} check on PR #${o.pr} (${remaining} attempt(s) left, interval ${o.intervalS}s)`,
+    );
+    const w = await waitLoop(
+      { budgetS: remaining * o.intervalS, intervalS: o.intervalS, once: false },
+      () => {
+        const p = pollOnce(target, deps.gh);
+        if (p.state === "err") errs += 1;
+        return p;
+      },
+      deps.sleep,
+      deps.log,
+    );
+    cumAttempts += w.attempts;
+    cumErrors += errs;
+    res.attempts = cumAttempts;
+    const phaseAttempts = cumAttempts - baseA;
+    const allErrored = phaseAttempts > 0 && cumErrors - baseE === phaseAttempts;
+    persist(phase, w.result === "found" ? "pending" : allErrored ? "provider-error" : "none");
+    if (w.blocked || w.ghMissing) {
+      res.phase = phase;
+      res.handoff = w.ghMissing ? EXIT.USE_MCP : EXIT.AGENT_WAIT;
+      return null;
+    }
+    return { pollResult: w.result, attempts: phaseAttempts, allErrored };
+  };
   const poll = async (phase: "poll" | "repoll"): Promise<SuppliedPoll | null> => {
+    if (hand) return handoffPoll(phase);
     // A supplied result answers only the poll that was handed off; later polls run fresh.
     if (o.supplied && (phase === "repoll") === o.retriggered) {
       deps.log(
@@ -828,16 +1048,116 @@ export async function ciDispatchGate(
     return res;
   };
 
-  if (!o.retriggered) {
+  /**
+   * The re-trigger as persisted checkpoints: intended -> commit-created -> push-completed ->
+   * receipt-completed. A fresh process continues from the last one; no effect repeats.
+   */
+  const handoffRetrigger = async (
+    message: string,
+    rec: ReturnType<typeof activeRecord>,
+  ): Promise<boolean> => {
+    if (!hand) return false;
+    const refName = `refs/heads/${branch}`;
+    let cur: CiHandoffRetrigger = curRt ?? { state: "intended", original: head() };
+    if (curRt === null) {
+      curRt = cur;
+      persist("poll", lastResult);
+    }
+    if (cur.state === "intended") {
+      const parent = git(o.cwd, ["rev-parse", "HEAD^"]);
+      const adopted =
+        git(o.cwd, ["rev-parse", "HEAD"]) !== cur.original &&
+        parent === cur.original &&
+        /re-trigger/.test(commitMessage(o.cwd, "HEAD") ?? "");
+      let sha: string | null;
+      if (adopted) {
+        sha = git(o.cwd, ["rev-parse", "HEAD"]);
+        if (rec !== null && sha !== null && !readRecord(o.cwd, o.fid)?.commits.includes(sha))
+          appendRecordCommit(o.cwd, o.fid, sha);
+      } else {
+        const made =
+          rec === null
+            ? commitOwnSet(o.cwd, { plain: [], ledgers: [] }, message, { allowEmpty: true })
+            : retriggerCommit(o.cwd, rec, message);
+        if (!made.ok) deps.log(`re-trigger commit failed: ${made.error}`);
+        sha = made.ok ? made.sha : null;
+      }
+      if (sha === null) return false;
+      cur = { state: "commit-created", original: cur.original, commit: sha };
+      curRt = cur;
+      persist("poll", lastResult);
+      hand.checkpoint?.("commit-created");
+    }
+    if (cur.state === "commit-created" && cur.commit !== undefined) {
+      let remoteSha: string | null;
+      if (rec === null) {
+        const tip = remoteTip(o.cwd, branch);
+        if (tip === null) {
+          deps.log("re-trigger push blocked: the remote branch could not be read");
+          return false;
+        }
+        if (tip !== cur.commit) {
+          const tracking = git(o.cwd, ["rev-parse", "-q", "--verify", `origin/${branch}`]);
+          const fastForward =
+            tip === "" || runGit(o.cwd, ["merge-base", "--is-ancestor", tip, cur.commit]).ok;
+          if (!fastForward && tip !== tracking) {
+            deps.log(
+              `re-trigger push blocked: ${branch} moved on the remote to ${tip.slice(0, 12)} after the re-trigger commit was made`,
+            );
+            return false;
+          }
+          const push = pushCurrentBranch(o.cwd);
+          if (!push.ok) {
+            deps.log(`re-trigger push failed: ${push.error}`);
+            return false;
+          }
+        }
+        remoteSha = remoteTip(o.cwd, branch) === cur.commit ? cur.commit : null;
+      } else {
+        const empties = landEmptyOwnCommits(o.cwd, o.fid, branch, deps.log);
+        if (empties.kind === "landed") remoteSha = empties.sha;
+        else if (empties.kind === "failed") remoteSha = null;
+        else {
+          const out = await pushBranch(o.cwd, { mode: "feature", fid: o.fid }, deps.log);
+          remoteSha = out.out.pushed
+            ? out.out.sha
+            : out.out.skipped === "no-run-commits"
+              ? (readRecord(o.cwd, o.fid)?.pushed?.at(-1) ?? null)
+              : null;
+        }
+      }
+      if (remoteSha === null) {
+        deps.log("re-trigger push did not land the re-trigger commit on the remote");
+        return false;
+      }
+      cur = { ...cur, state: "push-completed", ref: refName, remote: remoteSha };
+      curRt = cur;
+      persist("poll", lastResult);
+      hand.checkpoint?.("push-completed");
+    }
+    if (cur.state === "push-completed" && cur.remote !== undefined) {
+      if (rec === null && remoteTip(o.cwd, branch) !== cur.remote) {
+        deps.log("re-trigger receipt blocked: the remote branch no longer holds the pushed commit");
+        return false;
+      }
+      cur = { ...cur, state: "receipt-completed", receipt: hand.operation };
+      curRt = cur;
+      persist("repoll", lastResult);
+      hand.checkpoint?.("receipt-completed");
+    }
+    return curRt.state === "receipt-completed";
+  };
+
+  if (!o.retriggered && curRt?.state !== "receipt-completed") {
     const first = await poll("poll");
     if (first === null) return res;
-    res.attempts = first.attempts;
+    res.attempts = hand ? cumAttempts : first.attempts;
     if (first.pollResult === "found") return verdict("dispatched");
     if (first.allErrored) {
       deps.log("unresolved(gh-error): every poll errored — gh unavailable or unauthenticated");
       return verdict("unresolved", "gh-error");
     }
-    if (SKIP_CI_TOKEN.test(commitMessage(o.cwd, res.head) ?? "")) {
+    if (curRt === null && SKIP_CI_TOKEN.test(commitMessage(o.cwd, res.head) ?? "")) {
       deps.log(
         "unresolved(timeout-dirty): no run and the pushed head carries a CI suppressor — not re-triggering a dirty head",
       );
@@ -857,13 +1177,16 @@ export async function ciDispatchGate(
     }
     let pushed: boolean;
     let failure = "";
-    if (rec === null) {
+    if (hand) {
+      pushed = await handoffRetrigger(message, rec);
+    } else if (rec === null) {
       landed = null;
       const before = git(o.cwd, ["rev-parse", "HEAD"]);
-      const made = runGit(o.cwd, ["commit", "--allow-empty", "-m", message]);
+      // Nothing from the index goes in: a path the user staged never lands in the re-trigger.
+      const made = commitOwnSet(o.cwd, { plain: [], ledgers: [] }, message, { allowEmpty: true });
       if (!made.ok) {
         pushed = false;
-        failure = made.stderr || made.stdout;
+        failure = made.error;
       } else {
         const push = pushCurrentBranch(o.cwd);
         pushed = push.ok;
@@ -893,15 +1216,25 @@ export async function ciDispatchGate(
       return res;
     }
     res.retrigger = true;
+    if (hand && curRt?.remote !== undefined && shared) landed = curRt.remote;
     res.head = head();
     deps.log("re-trigger pushed; re-polling");
   }
+  if (hand && curRt?.state === "receipt-completed") {
+    res.retrigger = true;
+    if (shared && curRt.remote !== undefined) landed = curRt.remote;
+    res.head = head();
+  }
 
   const prior = res.attempts;
   const second = await poll("repoll");
   if (second === null) return res;
   // A supplied re-poll carries the running total; a fresh one adds to the first poll.
-  res.attempts = o.retriggered && o.supplied ? second.attempts : prior + second.attempts;
+  res.attempts = hand
+    ? cumAttempts
+    : o.retriggered && o.supplied
+      ? second.attempts
+      : prior + second.attempts;
   res.head = head();
   if (SKIP_CI_TOKEN.test(commitMessage(o.cwd, res.head) ?? "")) {
     deps.log(
@@ -1725,6 +2058,113 @@ async function waitFor(
   return { code: EXIT.NO, out };
 }
 
+/**
+ * `runs handoff`: record one batch of CI poll observations in the invocation's run and derive the
+ * phase, the cumulative totals and the next action from the persisted rows. The caller supplies
+ * what it saw (`--result`, `--polls`), never a count, a phase or a verdict.
+ */
+function runHandoff(ctx: RunContext): number {
+  const f = ctx.flags;
+  const inv = ctx.invocation;
+  if (
+    inv === undefined ||
+    inv.scope !== "run" ||
+    inv.statusPath === null ||
+    inv.workflow === null
+  ) {
+    throw new CommandError(
+      EXIT.USAGE,
+      "--invocation is required: an invocation issued by `bkit status invocation` for a workflow run",
+    );
+  }
+  const text = (v: FlagValue) => (typeof v === "string" ? v : "");
+  const repo = text(f.repo);
+  const pr = text(f.pr);
+  const head = text(f.head);
+  const branch = text(f.branch);
+  const result = CI_HANDOFF_RESULTS.find((r) => r === text(f.result));
+  if (result === undefined) {
+    throw new CommandError(EXIT.USAGE, `--result must be one of ${CI_HANDOFF_RESULTS.join(" | ")}`);
+  }
+  const polls = wholeNumber(f.polls, "polls", 0, 1);
+  const budgetS = wholeNumber(f.budgetS, "budget-s", 60);
+  const intervalS = wholeNumber(f.intervalS, "interval-s", 10, 1);
+  const target: CiHandoffTarget = { provider: "github", repo, pr, head, branch };
+  const probe = {
+    type: "ci-handoff",
+    workflow: inv.workflow,
+    at: statusTimestamp(),
+    phase: "poll",
+    target,
+    observation: { result: "none", attempts: 0, errors: 0 },
+  };
+  if (!validateCiHandoffEvent(probe)) {
+    throw new CommandError(
+      EXIT.USAGE,
+      "--repo, --pr, --head and --branch must name the owner/repo, PR number, full commit sha and branch",
+    );
+  }
+  const state = foldCiHandoff(readStatusRows(inv.statusPath), target);
+  const attempts = state.attempts + polls;
+  const errors = state.errors + (result === "provider-error" ? polls : 0);
+  const retrigger = state.retrigger;
+  const phase = retrigger?.state === "receipt-completed" ? "repoll" : "poll";
+  fs.appendFileSync(
+    inv.statusPath,
+    appendLine({
+      ...probe,
+      phase,
+      observation: { result, attempts, errors },
+      ...(retrigger === null ? {} : { retrigger }),
+    }),
+  );
+  const max = Math.max(1, Math.ceil(budgetS / intervalS));
+  const base = phase === "repoll" ? (state.retriggerBase ?? { attempts: 0, errors: 0 }) : null;
+  const phaseAttempts = attempts - (base?.attempts ?? 0);
+  const phaseErrors = errors - (base?.errors ?? 0);
+  const found = result === "pending" || result === "success" || result === "failure";
+  const out: Record<string, unknown> = {
+    phase,
+    attempts,
+    errors,
+    ciResult: result,
+    stale: state.stale,
+  };
+  const verdict = (outcome: DispatchOutcome, reason?: DispatchReason) =>
+    ctx.emit({
+      ...out,
+      nextAction: "verdict",
+      outcome,
+      ...(reason === undefined ? {} : { reason }),
+    });
+  if (retrigger !== null && retrigger.state !== "receipt-completed") {
+    ctx.emit({ ...out, nextAction: "reconcile-retrigger", retrigger });
+    return EXIT.OK;
+  }
+  if (found) {
+    verdict(phase === "repoll" ? "self-healed" : "dispatched");
+    return EXIT.OK;
+  }
+  if (phaseAttempts < max) {
+    ctx.emit({ ...out, nextAction: "poll-again" });
+    return EXIT.OK;
+  }
+  if (phaseErrors === phaseAttempts) {
+    verdict("unresolved", "gh-error");
+    return EXIT.OK;
+  }
+  if (phase === "poll") {
+    ctx.emit({ ...out, nextAction: "retrigger" });
+    return EXIT.OK;
+  }
+  const declared = ciDeclared(checkoutRoot(ctx.cwd));
+  if (SKIP_CI_TOKEN.test(commitMessage(ctx.cwd, retrigger?.commit ?? "HEAD") ?? "")) {
+    verdict("unresolved", "retrigger-suppressed");
+  } else if (declared.declared) verdict("unresolved", "ci-declared-no-run");
+  else verdict("no-ci");
+  return EXIT.OK;
+}
+
 async function runWait(ctx: RunContext): Promise<number> {
   const f = ctx.flags;
   const r = await waitFor(
@@ -1810,6 +2250,17 @@ async function runDispatch(ctx: RunContext): Promise<number> {
             },
       retriggered: f.retriggered === true,
       sha,
+      handoff:
+        ctx.invocation !== undefined &&
+        ctx.invocation.scope === "run" &&
+        ctx.invocation.statusPath !== null &&
+        pollResult === undefined
+          ? {
+              statusPath: ctx.invocation.statusPath,
+              operation: `ci-retrigger:${ctx.invocation.id}`,
+              ...(ctx.invocation.workflow === null ? {} : { workflow: ctx.invocation.workflow }),
+            }
+          : undefined,
     },
     d,
   );
@@ -2604,11 +3055,44 @@ export const runsCommand: CommandSpec = {
       exitCodes: { [EXIT_TRIGGER_FAILED]: "--dispatch-if-absent: gh workflow run failed" },
       run: runWait,
     },
+    handoff: {
+      summary:
+        "Persist one batch of CI poll observations into the invocation's run and derive the phase, cumulative attempts and errors, next action and verdict from the persisted rows (poll-again | retrigger | reconcile-retrigger | verdict). Rows for another repo, PR or head never count.",
+      use: "workflow",
+      flags: [
+        INVOCATION_FLAG,
+        { name: "repo", type: "string", required: true, help: "owner/repo of the PR" },
+        { name: "pr", type: "string", required: true, help: "PR number" },
+        { name: "head", type: "string", required: true, help: "full commit sha the polls ran at" },
+        { name: "branch", type: "string", required: true, help: "branch the PR is on" },
+        BUDGET_FLAG,
+        INTERVAL_FLAG,
+        {
+          name: "result",
+          type: "string",
+          required: true,
+          help: "what the polls saw: none | pending | success | failure | provider-error",
+        },
+        { name: "polls", type: "string", required: true, help: "polls this batch ran (>= 1)" },
+      ],
+      output: {
+        phase: "poll | repoll (repoll once the re-trigger is receipt-completed)",
+        attempts: "cumulative polls for this target",
+        errors: "cumulative provider-error polls for this target",
+        nextAction: "poll-again | retrigger | reconcile-retrigger | verdict",
+        outcome: "dispatched | self-healed | no-ci | unresolved (nextAction verdict only)",
+        reason: "unresolved reason: gh-error | retrigger-suppressed | ci-declared-no-run",
+        ciResult: "the result this batch recorded",
+        stale: "persisted rows for another repo, PR, head or branch, not counted",
+      },
+      run: runHandoff,
+    },
     dispatch: {
       summary:
-        "CI-Dispatch Gate after the last push: poll, one clean re-trigger, the ciDispatch verdict, and the body scan. A run in place on dev has no PR: it polls the push-event run at the pushed sha, and its re-trigger commits and pushes only the run's own work.",
+        "CI-Dispatch Gate after the last push: poll, one clean re-trigger, the ciDispatch verdict, and the body scan. A run in place on dev has no PR: it polls the push-event run at the pushed sha, and its re-trigger commits and pushes only the run's own work. With --invocation it resumes from the persisted `runs handoff` rows: attempts, errors and the re-trigger checkpoint are never supplied.",
       use: "workflow",
       flags: [
+        INVOCATION_FLAG,
         {
           name: "pr",
           type: "string",
diff --git a/.bkit/core/engine/install/modules/core.integration.test.ts b/.bkit/core/engine/install/modules/core.integration.test.ts
index 9c3706776..cc40854b5 100644
--- a/.bkit/core/engine/install/modules/core.integration.test.ts
+++ b/.bkit/core/engine/install/modules/core.integration.test.ts
@@ -34,6 +34,12 @@ import { BKIT_GATE_CHANGED_SCRIPT, BKIT_GATE_SCRIPTS } from "../manifest";
 import { readBkitConfig } from "../../shared/settings";
 import { hashFile, readBkitVersion, readManagedVersion, writeBkitVersion } from "../version-file";
 import { applyTokens } from "../placeholders";
+import {
+  buildAntigravityModelLookup,
+  buildOpencodeModelLookup,
+  parseEffortMap,
+  parseModelLookup,
+} from "../../render/models";
 
 // ---------------------------------------------------------------------------
 // Helpers
@@ -2441,3 +2447,244 @@ describe("migrateValeHouseStyle (via runBkitDocs)", () => {
     }
   });
 });
+
+describe("deterministic bookkeeping contracts in a fresh consumer", { timeout: 180_000 }, () => {
+  const promptsMd = path.join(getBkitDocsRoot(), "prompts.md");
+  const HOSTS = ["claude", "cursor", "opencode", "codex", "antigravity"] as const;
+  const TRACKERS = ["github", "linear", "jira", "none"] as const;
+  const WORKFLOW_FILES: Record<(typeof HOSTS)[number], string> = {
+    claude: ".claude/commands/bkit-build.md",
+    cursor: ".cursor/commands/bkit-build.md",
+    opencode: ".opencode/commands/bkit-build.md",
+    codex: ".agents/skills/bkit-build/SKILL.md",
+    antigravity: ".agents/plugins/bkit/skills/bkit-build/SKILL.md",
+  };
+  const extraDirs: string[] = [];
+  afterEach(() => {
+    process.chdir(originalCwd);
+    for (const d of extraDirs.splice(0)) fs.rmSync(d, { recursive: true, force: true });
+  });
+
+  const consumer = (): string => {
+    const dir = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-consumer-")));
+    extraDirs.push(dir);
+    fs.writeFileSync(
+      path.join(dir, "package.json"),
+      JSON.stringify({ name: "test-project", packageManager: "pnpm@10.4.1" }),
+      "utf-8",
+    );
+    process.chdir(dir);
+    return dir;
+  };
+  const install = (host: (typeof HOSTS)[number], tracker: (typeof TRACKERS)[number]): WriteSet => {
+    const ws = makeWriteSet();
+    dispatchModules(
+      new Set(["core", host]),
+      makeCtx({
+        ws,
+        issueTracker: tracker,
+        modelLookup: parseModelLookup(promptsMd),
+        codexModelLookup: buildOpencodeModelLookup(promptsMd, "openai"),
+        opencodeModelLookup: buildOpencodeModelLookup(promptsMd, "openrouter"),
+        antigravityModelLookup: buildAntigravityModelLookup(promptsMd),
+        effortMap: parseEffortMap(promptsMd),
+        opencodeProvider: "openrouter",
+      }),
+    );
+    return ws;
+  };
+  const read = (dir: string, rel: string) => fs.readFileSync(path.join(dir, rel), "utf-8");
+  const correction = (text: string) =>
+    /\*\*Bounded correction:\*\*[\s\S]*?(?:\n\s*\n|$)/.exec(text)?.[0].replace(/\s+/g, " ") ?? "";
+
+  const CLI = path.join(getPkgRoot(), "dist", "cli.js");
+  const bkit = (cwd: string, ...argv: string[]) => {
+    const res = spawnSync(process.execPath, [CLI, ...argv, "--json"], {
+      cwd,
+      encoding: "utf-8",
+    });
+    return {
+      code: res.status,
+      json: res.stdout.trim() === "" ? undefined : (JSON.parse(res.stdout) as Record<string, any>),
+      err: res.stderr,
+    };
+  };
+  const gitIn = (cwd: string, ...args: string[]) => {
+    const res = spawnSync("git", ["-c", "user.name=t", "-c", "user.email=t@t", ...args], {
+      cwd,
+      encoding: "utf-8",
+    });
+    return res.stdout.trim();
+  };
+  const jsonRows = (file: string) =>
+    fs
+      .readFileSync(file, "utf-8")
+      .split("\n")
+      .filter((l) => l !== "")
+      .map((l) => JSON.parse(l) as Record<string, any>);
+
+  it("installs and upgrades fresh consumers with deterministic bookkeeping contracts", () => {
+    const snapshots = new Map<string, Record<string, string>>();
+
+    // Fresh install: every host x tracker renders the same recovery contract and engine-owned CI re-entry.
+    for (const host of HOSTS) {
+      for (const tracker of TRACKERS) {
+        const dir = consumer();
+        install(host, tracker);
+        const workflow = read(dir, WORKFLOW_FILES[host]);
+        expect(correction(workflow), `${host}/${tracker}`).toMatch(/guaranteed no-write/i);
+        expect(correction(workflow), `${host}/${tracker}`).toMatch(/two corrected retries/i);
+        expect(workflow, `${host}/${tracker}`).toContain("bkit runs handoff");
+        expect(workflow, `${host}/${tracker}`).not.toContain("--attempts=<total>");
+        expect(workflow, `${host}/${tracker}`).not.toContain("{CI_REENTRY}");
+        snapshots.set(`${host}/${tracker}`, {
+          contract: correction(workflow),
+          cli: read(dir, ".bkit/cli.md"),
+          jsonl: read(dir, ".bkit/jsonl.md"),
+          workflows: read(dir, ".bkit/workflows.md"),
+          prompts: read(dir, ".bkit/prompts.md"),
+        });
+      }
+    }
+    // One wording and one set of docs across the matrix.
+    const contracts = new Set([...snapshots.values()].map((s) => s.contract));
+    expect(contracts.size).toBe(1);
+    const first = [...snapshots.values()][0]!;
+    for (const s of snapshots.values()) {
+      expect(s.cli).toBe(first.cli);
+      expect(s.jsonl).toBe(first.jsonl);
+    }
+    // The shipped docs state each ownership boundary, and the catalog lists the new verbs.
+    for (const verb of ["ledgers query", "runs handoff", "counters correction"]) {
+      expect(first.cli, verb).toContain(verb);
+    }
+    expect(first.cli).toContain("--correction-of");
+    expect(first.cli).toContain("--operation");
+    expect(first.jsonl).toContain("ci-handoff");
+    expect(first.jsonl).toContain("correction-rejected");
+    expect(first.jsonl).toMatch(/receipt/i);
+    expect(first.workflows).toContain("Bounded correction");
+    expect(first.prompts).toMatch(/modelSource/);
+
+    // Upgrade: stale managed files are put back to the fresh bytes, and a further install writes nothing.
+    const dir = consumer();
+    install("claude", "github");
+    const fresh = {
+      workflow: read(dir, WORKFLOW_FILES.claude),
+      cli: read(dir, ".bkit/cli.md"),
+      jsonl: read(dir, ".bkit/jsonl.md"),
+    };
+    fs.writeFileSync(path.join(dir, WORKFLOW_FILES.claude), `${fresh.workflow}\nstale\n`);
+    fs.writeFileSync(
+      path.join(dir, ".bkit/cli.md"),
+      fresh.cli.replace("runs handoff", "runs wait"),
+    );
+    fs.writeFileSync(path.join(dir, ".bkit/jsonl.md"), "stale\n");
+    install("claude", "github");
+    expect(read(dir, WORKFLOW_FILES.claude)).toBe(fresh.workflow);
+    expect(read(dir, ".bkit/cli.md")).toBe(fresh.cli);
+    expect(read(dir, ".bkit/jsonl.md")).toBe(fresh.jsonl);
+    expect(install("claude", "github").writes).toEqual([]);
+
+    // The built CLI the consumer runs agrees with the installed catalog and completes the journey.
+    gitIn(dir, "init", "-q", "-b", "feat/1-x");
+    fs.writeFileSync(path.join(dir, "README.md"), "x\n");
+    gitIn(dir, "add", "-A");
+    gitIn(dir, "commit", "-q", "-m", "init");
+    const rel = "docs/plans/202611/logs/1-x/status.jsonl";
+    fs.mkdirSync(path.dirname(path.join(dir, rel)), { recursive: true });
+    fs.writeFileSync(
+      path.join(dir, rel),
+      `${JSON.stringify({ type: "workflow-started", workflow: "build", at: "2026-11-01T00:00:00Z" })}\n`,
+    );
+    for (const verb of [
+      ["ledgers", "query"],
+      ["runs", "handoff"],
+      ["counters", "correction"],
+    ]) {
+      expect(bkit(dir, ...verb, "--help").code, verb.join(" ")).toBe(0);
+    }
+    // Missing observed model: the engine fills what it can verify and leaves the rest absent.
+    const issued = bkit(
+      dir,
+      "status",
+      "invocation",
+      "--workflow=build",
+      "--step=build-plan-tests",
+      `--file=${rel}`,
+      "--host=claude",
+      "--configured-model=sonnet",
+      "--agent=bkit-build-plan-tests",
+    );
+    expect(issued.code).toBe(0);
+    const id = issued.json!["invocation"] as string;
+    const rowsFile = path.join(dir, "rows.json");
+    const append = (rows: unknown[], ...extra: string[]) => {
+      fs.writeFileSync(rowsFile, JSON.stringify(rows));
+      return bkit(
+        dir,
+        "ledgers",
+        "append",
+        `--root=${dir}`,
+        "--ledger=knowledge",
+        `--rows=${rowsFile}`,
+        `--invocation=${id}`,
+        ...extra,
+      );
+    };
+    const row = { kind: "knowledge", key: "gotcha", summary: "a gotcha worth keeping" };
+    // A guaranteed no-write rejection, then the corrected candidate, then a lost-response replay.
+    const rejected = append([{ ...row, status: "BOGUS" }], "--operation=op-1");
+    expect(rejected.code).toBe(8);
+    expect(rejected.json!["error"]).toMatchObject({ effects: "none", correctable: true });
+    expect(fs.existsSync(path.join(dir, "docs", "knowledge.jsonl"))).toBe(false);
+    const corrected = append([row], "--operation=op-2", "--correction-of=op-1");
+    expect(corrected.code).toBe(0);
+    expect(corrected.json!["correction"]).toMatchObject({ used: 1, limit: 2, verified: true });
+    const replayed = append([row], "--operation=op-2", "--correction-of=op-1");
+    expect(replayed.json!["receipt"]).toMatchObject({ operation: "op-2", replayed: true });
+    const stored = jsonRows(path.join(dir, "docs", "knowledge.jsonl"));
+    expect(stored).toHaveLength(1);
+    expect(stored[0]!["by"]).toMatchObject({
+      workflow: "build",
+      step: "build-plan-tests",
+      subagent: "bkit-build-plan-tests",
+      configuredModel: "sonnet",
+      host: "claude",
+    });
+    expect(stored[0]!["by"]).not.toHaveProperty("model");
+    // The canonical read agrees with the append: one winner, a complete scan.
+    const queried = bkit(dir, "ledgers", "query", `--root=${dir}`, "--ledger=knowledge");
+    expect(queried.json!["rows"]).toHaveLength(1);
+    expect(queried.json!["coverage"]).toMatchObject({ status: "complete", clean: true });
+    // Resume with a new process and a new invocation: the correction budget and CI totals carry on.
+    const scope = (corrected.json!["correction"] as { scope: string }).scope;
+    const counter = bkit(
+      dir,
+      "counters",
+      "correction",
+      `--file=${rel}`,
+      "--workflow=build",
+      `--scope=${scope}`,
+      "--operation=op-3",
+    );
+    expect(counter.json).toMatchObject({ allowed: true, used: 2, limit: 2 });
+    const poll = (result: string) =>
+      bkit(
+        dir,
+        "runs",
+        "handoff",
+        `--invocation=${id}`,
+        "--repo=acme/test-project",
+        "--pr=7",
+        `--head=${"a".repeat(40)}`,
+        "--branch=feat/1-x",
+        "--budget-s=60",
+        "--interval-s=10",
+        `--result=${result}`,
+        "--polls=3",
+      );
+    expect(poll("none").json).toMatchObject({ attempts: 3, nextAction: "poll-again" });
+    expect(poll("none").json).toMatchObject({ attempts: 6, nextAction: "retrigger" });
+  });
+});
diff --git a/.bkit/core/engine/ledgers/journal.integration.test.ts b/.bkit/core/engine/ledgers/journal.integration.test.ts
index 04005dc7b..fa27d07fa 100644
--- a/.bkit/core/engine/ledgers/journal.integration.test.ts
+++ b/.bkit/core/engine/ledgers/journal.integration.test.ts
@@ -13,10 +13,18 @@ import * as path from "node:path";
 
 import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
 
-import { INVOCATION_FLAG, runCommand, type CommandSpec } from "../commands/lib";
+import { INVOCATION_FLAG, runCommand, type CommandSpec, type GhResult } from "../commands/lib";
 import { COMMANDS } from "../commands/registry";
 import { branchesCommand } from "../commands/workflow/branches";
-import { appendLedgerRows, ledgersCommand } from "../commands/workflow/ledgers";
+import {
+  appendLedgerRows,
+  appendRecordCommit,
+  ledgersCommand,
+  newRecord,
+  readRecord,
+  writeRecord,
+} from "../commands/workflow/ledgers";
+import { ciDispatchGate, type Gh } from "../commands/workflow/runs";
 
 const FID = "901-journal";
 const STATUS_REL = path.join("docs", "plans", "202610", "logs", FID, "status.jsonl");
@@ -847,3 +855,498 @@ describe("replay-safe ledger appends on real files", () => {
     expect(fs.existsSync(path.join(repo, "docs", "plans"))).toBe(false);
   });
 });
+
+describe("persistent CI handoff on a real local remote", () => {
+  const roots: string[] = [];
+  afterEach(() => {
+    for (const d of roots.splice(0)) fs.rmSync(d, { recursive: true, force: true });
+  });
+
+  const ok = (stdout: string): GhResult => ({ ok: true, stdout, stderr: "", missing: false });
+  const rollup = (name: string) =>
+    ok(JSON.stringify({ statusCheckRollup: [{ name, status: "QUEUED" }] }));
+  const NONE = rollup("vercel");
+  const FOUND = rollup("bkit-tests-unit");
+  const none = (n: number) => Array.from({ length: n }, () => NONE);
+
+  /** A gh whose `pr view` answers come from `replies` in order (the last repeats); counts the polls. */
+  function pollingGh(replies: GhResult[]) {
+    let polls = 0;
+    const gh: Gh = (args) => {
+      if (args[0] !== "pr" || args[1] !== "view")
+        return { ok: false, stdout: "", stderr: "HTTP 500", missing: false };
+      const reply = replies[Math.min(polls, replies.length - 1)]!;
+      polls += 1;
+      return reply;
+    };
+    return { gh, polls: () => polls };
+  }
+
+  const instant = async (ms: number) => ms;
+  const quiet = (sleep: (ms: number) => Promise<number> = instant) => ({
+    sleep,
+    log: () => undefined,
+  });
+  const crashAt = (point: string) => (name: string) => {
+    if (name === point) throw new Error(`process lost at ${point}`);
+  };
+
+  /** A work clone of a bare remote with one pushed commit; `shared` makes it a run in place on dev. */
+  function remoteRepo(branch: string, shared: boolean) {
+    const root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-handoff-int-")));
+    roots.push(root);
+    const remote = path.join(root, "remote.git");
+    const work = path.join(root, "work");
+    git(root, ["init", "-q", "--bare", "-b", branch, remote]);
+    git(root, ["init", "-q", "-b", branch, work]);
+    fs.writeFileSync(path.join(work, "package.json"), JSON.stringify({ private: true }));
+    git(work, ["add", "package.json"]);
+    git(work, ["commit", "-q", "-m", "base"]);
+    git(work, ["remote", "add", "origin", remote]);
+    git(work, ["push", "-q", "-u", "origin", branch]);
+    if (shared) {
+      git(work, ["commit", "-q", "--allow-empty", "-m", "foreign local commit"]);
+      writeRecord(work, newRecord(work, "1-x", branch));
+    }
+    git(work, ["commit", "-q", "--allow-empty", "-m", "chore(1-x): close-workflow"]);
+    if (shared) appendRecordCommit(work, "1-x", git(work, ["rev-parse", "HEAD"]));
+    const status = path.join(root, "logs", "status.jsonl");
+    fs.mkdirSync(path.dirname(status), { recursive: true });
+    fs.writeFileSync(
+      status,
+      `${JSON.stringify({ type: "workflow-started", workflow: "build", at: "2026-11-01T00:00:00Z" })}\n`,
+    );
+    return {
+      root,
+      remote,
+      work,
+      status,
+      tip: () => git(remote, ["rev-parse", branch]),
+      log: () => git(remote, ["log", "--format=%s", branch]).split("\n"),
+      retriggers: () =>
+        git(remote, ["log", "--format=%s", branch])
+          .split("\n")
+          .filter((s) => s.includes("re-trigger")).length,
+    };
+  }
+
+  const options = (
+    r: ReturnType<typeof remoteRepo>,
+    handoff: { checkpoint?: (name: string) => void } = {},
+  ) => ({
+    cwd: r.work,
+    pr: "7",
+    fid: "1-x",
+    autoRouteSuffix: "",
+    budgetS: 60,
+    intervalS: 10,
+    retriggered: false,
+    handoff: { statusPath: r.status, operation: "handoff-1", ...handoff },
+  });
+  const handoffRows = (r: ReturnType<typeof remoteRepo>) =>
+    rows(r.status).filter((row) => row["type"] === "ci-handoff");
+
+  it("resumes nonwaiting CI polls without resetting attempts or duplicating retrigger", async () => {
+    // A poll interrupted after three attempts continues in a fresh process: the budget is not reset.
+    const waiting = remoteRepo("feat/1-x", false);
+    let sleeps = 0;
+    const handedOff = await ciDispatchGate(options(waiting), {
+      gh: pollingGh(none(6)).gh,
+      ...quiet(async (ms) => {
+        sleeps += 1;
+        return ms + 6000 * Number(sleeps > 2);
+      }),
+    });
+    expect(handedOff).toMatchObject({ phase: "poll", handoff: 81, attempts: 3 });
+    expect(handoffRows(waiting).at(-1)).toMatchObject({
+      phase: "poll",
+      observation: { result: "none", attempts: 3, errors: 0 },
+    });
+    const resumedGh = pollingGh(none(30));
+    const resumed = await ciDispatchGate(options(waiting), { gh: resumedGh.gh, ...quiet() });
+    // 3 more first-poll attempts, then 6 after the one re-trigger: 9 polls, 12 in total.
+    expect(resumedGh.polls()).toBe(9);
+    expect(resumed.ciDispatch).toMatchObject({ outcome: "no-ci", attempts: 12, retrigger: true });
+    expect(waiting.retriggers()).toBe(1);
+
+    // A process lost at each durable checkpoint of the retrigger is resumed to exactly one reachable commit.
+    for (const point of ["commit-created", "push-completed", "receipt-completed"] as const) {
+      const r = remoteRepo("feat/1-x", false);
+      const base = git(r.work, ["rev-parse", "HEAD"]);
+      const tipBefore = r.tip();
+      const lost = ciDispatchGate(options(r, { checkpoint: crashAt(point) }), {
+        gh: pollingGh(none(30)).gh,
+        ...quiet(),
+      });
+      await expect(lost).rejects.toThrow(`process lost at ${point}`);
+      const localHead = git(r.work, ["rev-parse", "HEAD"]);
+      expect(localHead).not.toBe(base);
+      expect(r.retriggers()).toBe(
+        { "commit-created": 0, "push-completed": 1, "receipt-completed": 1 }[point],
+      );
+      expect(r.tip()).toBe(
+        {
+          "commit-created": tipBefore,
+          "push-completed": localHead,
+          "receipt-completed": localHead,
+        }[point],
+      );
+      expect(handoffRows(r).at(-1)).toMatchObject({
+        phase: {
+          "commit-created": "poll",
+          "push-completed": "poll",
+          "receipt-completed": "repoll",
+        }[point],
+        retrigger: { state: point, original: base, commit: localHead },
+      });
+
+      // The fresh process finishes the interrupted effect: no second commit, no second push, no first poll again.
+      const secondGh = pollingGh([FOUND]);
+      const finished = await ciDispatchGate(options(r), { gh: secondGh.gh, ...quiet() });
+      expect(secondGh.polls()).toBe(1);
+      expect(finished.ciDispatch).toMatchObject({
+        outcome: "self-healed",
+        retrigger: true,
+        attempts: 7,
+        head: localHead,
+      });
+      expect(git(r.work, ["rev-parse", "HEAD"])).toBe(localHead);
+      expect(r.tip()).toBe(localHead);
+      expect(r.retriggers()).toBe(1);
+      expect(git(r.remote, ["rev-list", "--count", "feat/1-x"])).toBe("3");
+      // The pushed commit owns nothing but itself: its tree is its parent's.
+      expect(git(r.remote, ["rev-parse", `${localHead}^{tree}`])).toBe(
+        git(r.remote, ["rev-parse", `${localHead}~1^{tree}`]),
+      );
+      expect(handoffRows(r).at(-1)).toMatchObject({
+        phase: "repoll",
+        retrigger: {
+          state: "receipt-completed",
+          original: base,
+          commit: localHead,
+          ref: "refs/heads/feat/1-x",
+          remote: localHead,
+          receipt: "handoff-1",
+        },
+      });
+
+      // A third process after the receipt is a pure read of the same effect.
+      const thirdGh = pollingGh([FOUND]);
+      const again = await ciDispatchGate(options(r), { gh: thirdGh.gh, ...quiet() });
+      expect(again.ciDispatch).toMatchObject({ outcome: "self-healed", retrigger: true });
+      expect(r.tip()).toBe(localHead);
+      expect(r.retriggers()).toBe(1);
+      expect(git(r.work, ["rev-parse", "HEAD"])).toBe(localHead);
+    }
+
+    // Unrelated staged content is never published by the retrigger.
+    const staged = remoteRepo("feat/1-x", false);
+    fs.writeFileSync(path.join(staged.work, "unrelated.txt"), "user work\n");
+    git(staged.work, ["add", "unrelated.txt"]);
+    const stagedGh = pollingGh([...none(6), FOUND]);
+    const stagedRun = await ciDispatchGate(options(staged), { gh: stagedGh.gh, ...quiet() });
+    expect(stagedRun.ciDispatch).toMatchObject({ outcome: "self-healed" });
+    expect(git(staged.remote, ["ls-tree", "-r", "--name-only", staged.tip()])).not.toContain(
+      "unrelated.txt",
+    );
+    expect(git(staged.remote, ["show", "--name-only", "--format=", staged.tip()])).toBe("");
+    expect(git(staged.work, ["diff", "--cached", "--name-only"])).toBe("unrelated.txt");
+
+    // A conflicting remote movement after the commit was made blocks every further effect.
+    const moved = remoteRepo("feat/1-x", false);
+    await expect(
+      ciDispatchGate(options(moved, { checkpoint: crashAt("commit-created") }), {
+        gh: pollingGh(none(30)).gh,
+        ...quiet(),
+      }),
+    ).rejects.toThrow("process lost at commit-created");
+    const other = path.join(moved.root, "other");
+    git(moved.root, ["clone", "-q", "-b", "feat/1-x", moved.remote, other]);
+    git(other, ["commit", "-q", "--allow-empty", "-m", "someone else moved the branch"]);
+    git(other, ["push", "-q", "origin", "feat/1-x"]);
+    const movedTip = moved.tip();
+    const blocked = await ciDispatchGate(options(moved), {
+      gh: pollingGh([FOUND]).gh,
+      ...quiet(),
+    });
+    expect(blocked).toMatchObject({ handoff: 6, ciDispatch: null });
+    expect(moved.tip()).toBe(movedTip);
+    expect(moved.retriggers()).toBe(0);
+    expect(moved.log()[0]).toBe("someone else moved the branch");
+    expect(handoffRows(moved).at(-1)).toMatchObject({ retrigger: { state: "commit-created" } });
+
+    // A run in place on a shared branch pushes only its own commits, even across the interruption.
+    const shared = remoteRepo("dev", true);
+    await expect(
+      ciDispatchGate(options(shared, { checkpoint: crashAt("commit-created") }), {
+        gh: pollingGh(none(30)).gh,
+        ...quiet(),
+      }),
+    ).rejects.toThrow("process lost at commit-created");
+    expect(shared.retriggers()).toBe(0);
+    const sharedGh = pollingGh([FOUND]);
+    const sharedRun = await ciDispatchGate(options(shared), { gh: sharedGh.gh, ...quiet() });
+    expect(sharedRun.ciDispatch).toMatchObject({ outcome: "self-healed", retrigger: true });
+    expect(shared.log()).not.toContain("foreign local commit");
+    expect(shared.log()).toContain("chore(1-x): close-workflow");
+    expect(shared.retriggers()).toBe(1);
+    expect(git(shared.work, ["rev-list", "--count", "--grep=re-trigger", "HEAD"])).toBe("1");
+    expect(readRecord(shared.work, "1-x")?.commits).toHaveLength(2);
+    expect(handoffRows(shared).at(-1)).toMatchObject({
+      retrigger: { state: "receipt-completed", remote: shared.tip(), receipt: "handoff-1" },
+    });
+  });
+});
+
+describe("bounded correction on real ledgers", () => {
+  const knowledge = (over: Record<string, unknown> = {}) => ({
+    kind: "knowledge",
+    key: "gotcha",
+    summary: "a gotcha worth keeping",
+    ...over,
+  });
+  /** Fails the engine's own row validation after the deterministic fill: nothing is written. */
+  const invalidRow = () => knowledge({ status: "BOGUS" });
+  const failure = (over: Record<string, unknown> = {}) => ({
+    kind: "failure",
+    key: "parser-drops-last-line",
+    summary: "parser drops the last line",
+    severity: "HIGH",
+    status: "OPEN",
+    ...over,
+  });
+
+  const append = (id: string, payload: unknown, ledger: string, ...extra: string[]) => {
+    const file = path.join(main, `rows-${ledger}.json`);
+    fs.writeFileSync(file, JSON.stringify(payload));
+    return call(
+      worktree,
+      [ledgersCommand],
+      [
+        "ledgers",
+        "append",
+        `--root=${worktree}`,
+        `--ledger=${ledger}`,
+        `--rows=${file}`,
+        `--invocation=${id}`,
+        ...extra,
+      ],
+    );
+  };
+  const lostAt = (point: string) => (name: string) => {
+    if (name === point) throw new Error("response lost");
+  };
+  const statusFile = () => path.join(worktree, STATUS_REL);
+  const corrections = () =>
+    rows(statusFile()).filter((r) => String(r["type"]).startsWith("correction-"));
+  const ledgerBytes = (name: string) => {
+    const file = path.join(worktree, "docs", `${name}.jsonl`);
+    return fs.existsSync(file) ? fs.readFileSync(file, "utf-8") : "";
+  };
+
+  it("resumes corrected substep and blocks exhausted unauthorized or uncertain effects", async () => {
+    const first = await issue(worktree, ["--agent=bkit-build-plan-tests"]);
+
+    // A guaranteed no-write rejection after the deterministic fill names its exact sub-step.
+    const rejected = await append(first, [invalidRow()], "knowledge", "--operation=op-1");
+    expect(rejected.code).toBe(8);
+    expect(rejected.json!["error"]).toMatchObject({
+      effects: "none",
+      correctable: true,
+      substep: "append",
+    });
+    const scope = rejected.json!["error"].scope as string;
+    expect(scope).toContain("knowledge");
+    expect(ledgerBytes("knowledge")).toBe("");
+    expect(corrections()).toEqual([
+      expect.objectContaining({
+        type: "correction-rejected",
+        scope,
+        substep: "append",
+        operation: "op-1",
+        step: "build-plan-tests",
+      }),
+    ]);
+
+    // The corrected candidate carries a fresh immutable operation and resumes the same sub-step.
+    const fixed = await append(
+      first,
+      [knowledge()],
+      "knowledge",
+      "--operation=op-2",
+      "--correction-of=op-1",
+    );
+    expect(fixed.code).toBe(0);
+    expect(fixed.json).toMatchObject({
+      appended: 1,
+      receipt: { operation: "op-2", replayed: false },
+      correction: {
+        scope,
+        operation: "op-2",
+        of: "op-1",
+        used: 1,
+        limit: 2,
+        substep: "append",
+        verified: true,
+      },
+    });
+    expect(rows(path.join(worktree, "docs", "knowledge.jsonl"))).toHaveLength(1);
+    expect(corrections().map((r) => r["type"])).toEqual([
+      "correction-rejected",
+      "correction-candidate",
+      "correction-succeeded",
+    ]);
+    expect(corrections().every((r) => r["scope"] === scope)).toBe(true);
+
+    // Replaying the corrected operation after a lost response returns its receipt and spends nothing.
+    const bytes = ledgerBytes("knowledge");
+    const replay = await append(
+      first,
+      [knowledge()],
+      "knowledge",
+      "--operation=op-2",
+      "--correction-of=op-1",
+    );
+    expect(replay.code).toBe(0);
+    expect(replay.json!["receipt"]).toMatchObject({ operation: "op-2", replayed: true });
+    expect(replay.json!["correction"]).toMatchObject({ used: 1 });
+    expect(ledgerBytes("knowledge")).toBe(bytes);
+
+    // A candidate must continue the sub-step it corrects: another ledger or an unknown rejection is refused.
+    const elsewhere = await append(
+      first,
+      [failure()],
+      "failures",
+      "--operation=op-x",
+      "--correction-of=op-1",
+    );
+    expect(elsewhere.code).toBe(2);
+    const unknown = await append(
+      first,
+      [knowledge({ key: "other" })],
+      "knowledge",
+      "--operation=op-y",
+      "--correction-of=never-rejected",
+    );
+    expect(unknown.code).toBe(2);
+    expect(ledgerBytes("failures")).toBe("");
+    expect(ledgerBytes("knowledge")).toBe(bytes);
+
+    // Two corrected retries per scope, however many invocations, operations or helpers ask.
+    const idA = await issue(worktree, [], "build-plan-verify");
+    const idB = await issue(worktree, [], "build-plan-verify");
+    const firstReject = await append(idA, [invalidRow()], "knowledge", "--operation=op-a");
+    expect(firstReject.json!["error"]).toMatchObject({ correctable: true });
+    const scope2 = firstReject.json!["error"].scope as string;
+    expect(scope2).not.toBe(scope);
+    const retryOne = await append(
+      idB,
+      [invalidRow()],
+      "knowledge",
+      "--operation=op-b",
+      "--correction-of=op-a",
+    );
+    expect(retryOne.code).toBe(8);
+    expect(retryOne.json!["error"]).toMatchObject({ correctable: true, scope: scope2 });
+    const retryTwo = await append(
+      idA,
+      [invalidRow()],
+      "knowledge",
+      "--operation=op-c",
+      "--correction-of=op-a",
+    );
+    expect(retryTwo.code).toBe(8);
+    const before = ledgerBytes("knowledge");
+    for (const [id, operationFlag] of [
+      [idB, "--operation=op-d"],
+      [idA, "--issue-operation"],
+    ] as const) {
+      const exhausted = await append(
+        id,
+        [knowledge({ key: "valid-but-late" })],
+        "knowledge",
+        operationFlag,
+        "--correction-of=op-a",
+      );
+      expect(exhausted.code).toBe(1);
+      expect(exhausted.json!["error"]).toMatchObject({
+        effects: "none",
+        correctable: false,
+        exhausted: true,
+        scope: scope2,
+      });
+    }
+    expect(ledgerBytes("knowledge")).toBe(before);
+    // The shared counter agrees: the same scope has no correction left for any other caller.
+    const counter = await call(worktree, COMMANDS, [
+      "counters",
+      "correction",
+      `--file=${statusFile()}`,
+      "--workflow=build",
+      `--scope=${scope2}`,
+      "--operation=op-z",
+    ]);
+    expect(counter.code).toBe(1);
+    expect(counter.json).toMatchObject({ allowed: false, used: 2, limit: 2 });
+
+    // An authorship conflict is a permission refusal, never auto-corrected.
+    const idC = await issue(worktree, [], "build-plan-gaps-remediate");
+    const unauthorized = await append(
+      idC,
+      [knowledge({ key: "forged", by: { subagent: "someone-else" } })],
+      "knowledge",
+      "--operation=op-auth",
+    );
+    expect(unauthorized.code).toBe(8);
+    expect(unauthorized.err).toMatch(/conflict/i);
+    expect(unauthorized.json?.["error"]?.correctable).not.toBe(true);
+    const retryAuth = await append(
+      idC,
+      [knowledge({ key: "forged" })],
+      "knowledge",
+      "--operation=op-auth-2",
+      "--correction-of=op-auth",
+    );
+    expect(retryAuth.code).toBe(2);
+    expect(ledgerBytes("knowledge")).toBe(before);
+
+    // An uncertain earlier effect on the ledger blocks any corrected candidate: nothing is appended.
+    const idD = await issue(worktree, [], "build-challenge");
+    const failureRejected = await append(
+      idD,
+      [failure({ status: "BOGUS" })],
+      "failures",
+      "--operation=op-f1",
+    );
+    expect(failureRejected.json!["error"]).toMatchObject({ correctable: true });
+    expect(() =>
+      appendLedgerRows(
+        worktree,
+        "failures",
+        [failure({ by: { workflow: "build", step: "build-challenge" } })],
+        undefined,
+        {
+          operation: "op-torn",
+          checkpoint: lostAt("written"),
+        },
+      ),
+    ).toThrow();
+    const torn = fs.readFileSync(path.join(worktree, "docs", "failures.jsonl"));
+    fs.writeFileSync(
+      path.join(worktree, "docs", "failures.jsonl"),
+      torn.subarray(0, torn.length - 15),
+    );
+    const cut = ledgerBytes("failures");
+    const uncertain = await append(
+      idD,
+      [failure({ key: "second-failure" })],
+      "failures",
+      "--operation=op-f2",
+      "--correction-of=op-f1",
+    );
+    expect(uncertain.code).not.toBe(0);
+    expect(uncertain.json!["error"]).toMatchObject({ effects: "uncertain", correctable: false });
+    expect(ledgerBytes("failures")).toBe(cut);
+    expect(corrections().filter((r) => r["type"] === "correction-succeeded")).toHaveLength(1);
+  });
+});
diff --git a/.bkit/core/engine/ledgers/status.test.ts b/.bkit/core/engine/ledgers/status.test.ts
index 443006cc9..c26a755b9 100644
--- a/.bkit/core/engine/ledgers/status.test.ts
+++ b/.bkit/core/engine/ledgers/status.test.ts
@@ -17,8 +17,11 @@ import {
   recordLedgerOperation,
   validateCiSelection,
   ciSelectionIdentity,
+  ciHandoffIdentity,
+  foldCiHandoff,
+  validateCiHandoffEvent,
 } from "./status";
-import { readStatusEvents } from "../commands/workflow/status";
+import { readStatusEvents, readStatusRows } from "../commands/workflow/status";
 
 describe("CI evidence selection contract", () => {
   it("validates atomic CI and local selections with stable evidence identities", () => {
@@ -340,3 +343,212 @@ describe("ledger operation receipts", () => {
     expect(fold(readStatusEvents(file))).toEqual([]);
   });
 });
+
+describe("CI handoff events", () => {
+  const SHA = "a".repeat(40);
+  const NEW_SHA = "b".repeat(40);
+  const OTHER_SHA = "c".repeat(40);
+  const target = {
+    provider: "github" as const,
+    repo: "example/example",
+    pr: "7",
+    head: SHA,
+    branch: "feat/1-x",
+  };
+  const handoff = (at: string, over: Record<string, unknown> = {}) => ({
+    type: "ci-handoff",
+    workflow: "build",
+    at,
+    phase: "poll",
+    target,
+    observation: { result: "none", attempts: 6, errors: 0 },
+    ...over,
+  });
+  const observation = (result: string, attempts: number, errors: number) => ({
+    result,
+    attempts,
+    errors,
+  });
+  const retrigger = (state: string, extra: Record<string, unknown> = {}) => ({
+    state,
+    original: SHA,
+    ...extra,
+  });
+  const logFile = (rows: object[]) => {
+    const file = path.join(
+      fs.mkdtempSync(path.join(os.tmpdir(), "bkit-handoff-")),
+      "logs",
+      "status.jsonl",
+    );
+    fs.mkdirSync(path.dirname(file), { recursive: true });
+    fs.writeFileSync(file, rows.map((r) => `${JSON.stringify(r)}\n`).join(""));
+    return file;
+  };
+
+  it("preserves handoff events across status folding and rejects stale CI selection", () => {
+    // Every observation kind and every retrigger checkpoint is a valid event with its own identity.
+    const valid = [
+      handoff("2026-11-01T00:00:01Z", { observation: observation("none", 6, 0) }),
+      handoff("2026-11-01T00:00:02Z", { observation: observation("pending", 3, 0) }),
+      handoff("2026-11-01T00:00:03Z", { observation: observation("success", 2, 0) }),
+      handoff("2026-11-01T00:00:04Z", { observation: observation("failure", 2, 0) }),
+      handoff("2026-11-01T00:00:05Z", { observation: observation("provider-error", 8, 4) }),
+      handoff("2026-11-01T00:00:06Z", { retrigger: retrigger("intended") }),
+      handoff("2026-11-01T00:00:07Z", {
+        observation: observation("pending", 8, 4),
+        retrigger: retrigger("commit-created", { commit: NEW_SHA }),
+      }),
+      handoff("2026-11-01T00:00:08Z", {
+        phase: "repoll",
+        observation: observation("pending", 8, 4),
+        retrigger: retrigger("push-completed", {
+          commit: NEW_SHA,
+          ref: "refs/heads/feat/1-x",
+          remote: NEW_SHA,
+        }),
+      }),
+      handoff("2026-11-01T00:00:09Z", {
+        phase: "repoll",
+        observation: observation("pending", 8, 4),
+        retrigger: retrigger("receipt-completed", {
+          commit: NEW_SHA,
+          ref: "refs/heads/feat/1-x",
+          remote: NEW_SHA,
+          receipt: "retrigger-1",
+        }),
+      }),
+    ];
+    for (const event of valid) expect(validateCiHandoffEvent(event)).toBe(true);
+
+    // Shapes that carry no usable identity or phase evidence are refused.
+    const invalid: Array<Record<string, unknown>> = [
+      handoff("t", { observation: observation("maybe", 1, 0) }),
+      handoff("t", { observation: observation("none", -1, 0) }),
+      handoff("t", { observation: observation("none", 1.5, 0) }),
+      handoff("t", { observation: observation("provider-error", 1, 2) }),
+      handoff("t", { target: { ...target, head: "not-a-commit" } }),
+      handoff("t", { target: { ...target, repo: "../example" } }),
+      handoff("t", { target: { ...target, provider: "other" } }),
+      handoff("t", { phase: "later" }),
+      handoff("t", { phase: "repoll" }),
+      handoff("t", { retrigger: retrigger("commit-created") }),
+      handoff("t", { retrigger: retrigger("push-completed", { commit: NEW_SHA }) }),
+      handoff("t", {
+        retrigger: retrigger("receipt-completed", { commit: NEW_SHA, remote: NEW_SHA }),
+      }),
+    ];
+    for (const event of invalid) expect(validateCiHandoffEvent(event)).toBe(false);
+
+    // The target identity ignores wording and tracks repo, PR, head and branch.
+    const identity = ciHandoffIdentity(target);
+    expect(identity).toBe(ciHandoffIdentity({ ...target, repo: "Example/Example" }));
+    expect(identity).not.toBe(ciHandoffIdentity({ ...target, head: OTHER_SHA }));
+    expect(identity).not.toBe(ciHandoffIdentity({ ...target, pr: "8" }));
+    expect(identity).not.toBe(ciHandoffIdentity({ ...target, repo: "other/example" }));
+
+    // Written, unioned (duplicate and shuffled), read back and folded: the identity and totals survive.
+    const rows = [
+      { type: "workflow-started", workflow: "build", at: "2026-11-01T00:00:00Z" },
+      valid[0],
+      valid[4],
+      valid[6],
+      valid[8],
+    ];
+    const shuffled = [rows[0]!, rows[4]!, rows[2]!, rows[1]!, rows[3]!, rows[2]!];
+    const file = logFile(shuffled);
+    const reread = readStatusRows(file);
+    const state = foldCiHandoff(reread, target);
+    expect(state).toMatchObject({
+      phase: "repoll",
+      attempts: 8,
+      errors: 4,
+      stale: 0,
+      last: { result: "pending" },
+      retrigger: {
+        state: "receipt-completed",
+        original: SHA,
+        commit: NEW_SHA,
+        remote: NEW_SHA,
+        receipt: "retrigger-1",
+      },
+    });
+    // A restart reads the same state from the same bytes.
+    expect(foldCiHandoff(readStatusRows(file), target)).toEqual(state);
+    // The run fold never mistakes a handoff row for a step or a run.
+    expect(fold(readStatusEvents(file))).toEqual([
+      { workflow: "build", startedAt: "2026-11-01T00:00:00Z", status: "IN_PROGRESS", steps: [] },
+    ]);
+
+    // Evidence for another head, PR or repository never counts toward this target.
+    const mixed = [
+      valid[0],
+      handoff("2026-11-01T00:01:00Z", {
+        target: { ...target, head: OTHER_SHA },
+        observation: observation("success", 1, 0),
+      }),
+      handoff("2026-11-01T00:02:00Z", {
+        target: { ...target, pr: "8" },
+        observation: observation("failure", 1, 0),
+      }),
+      handoff("2026-11-01T00:03:00Z", {
+        target: { ...target, repo: "other/example" },
+        observation: observation("success", 1, 0),
+      }),
+    ];
+    expect(foldCiHandoff(mixed, target)).toMatchObject({
+      attempts: 6,
+      errors: 0,
+      stale: 3,
+      last: { result: "none" },
+    });
+    expect(foldCiHandoff(mixed, { ...target, head: OTHER_SHA })).toMatchObject({
+      attempts: 1,
+      stale: 3,
+      last: { result: "success" },
+    });
+    // A cumulative count that goes backwards is refused, not folded.
+    expect(
+      foldCiHandoff(
+        [valid[0], handoff("2026-11-01T00:04:00Z", { observation: observation("none", 2, 0) })],
+        target,
+      ),
+    ).toMatchObject({ attempts: 6, invalid: 1 });
+    // No events for the target is a state, not an error.
+    expect(foldCiHandoff([], target)).toMatchObject({
+      attempts: 0,
+      errors: 0,
+      last: null,
+      retrigger: null,
+    });
+
+    // The failed-only debug selection stays closed to handoff observations and keeps its identity.
+    const selection = {
+      mode: "ci" as const,
+      provider: "github" as const,
+      repo: "example/example",
+      runId: "123",
+      runAttempt: 1,
+      runUrl: "https://github.com/example/example/actions/runs/123/attempts/1",
+      workflowId: "456",
+      workflowPath: ".github/workflows/consumer-ci.yml",
+      headBranch: "feat/1-x",
+      headSha: SHA,
+      conclusion: "failure" as const,
+      redTiers: ["unit" as const],
+      via: "prompt-run",
+    };
+    expect(validateCiSelection(selection)).toBe(true);
+    expect(validateCiSelection({ ...selection, conclusion: "success" })).toBe(false);
+    expect(validateCiSelection({ ...selection, conclusion: "pending" })).toBe(false);
+    expect(validateCiSelection(valid[2])).toBe(false);
+    expect(validateCiHandoffEvent(selection)).toBe(false);
+    expect(ciSelectionIdentity({ ...selection, via: "issue-run" })).toBe(
+      ciSelectionIdentity(selection),
+    );
+    // A saved selection for a different head is not the evidence this target handed off.
+    expect(ciSelectionIdentity({ ...selection, headSha: OTHER_SHA })).not.toBe(
+      ciSelectionIdentity(selection),
+    );
+    expect(ciHandoffIdentity(target)).not.toBe(ciSelectionIdentity(selection));
+  });
+});
diff --git a/.bkit/core/engine/ledgers/status.ts b/.bkit/core/engine/ledgers/status.ts
index 041a09125..f47cf79ee 100644
--- a/.bkit/core/engine/ledgers/status.ts
+++ b/.bkit/core/engine/ledgers/status.ts
@@ -98,6 +98,169 @@ export function ciSelectionIdentity(selection: CiSelection): string {
   );
 }
 
+export const CI_HANDOFF_RESULTS = [
+  "none",
+  "pending",
+  "success",
+  "failure",
+  "provider-error",
+] as const;
+export type CiHandoffResult = (typeof CI_HANDOFF_RESULTS)[number];
+export const CI_RETRIGGER_STATES = [
+  "intended",
+  "commit-created",
+  "push-completed",
+  "receipt-completed",
+] as const;
+export type CiRetriggerState = (typeof CI_RETRIGGER_STATES)[number];
+export type CiHandoffTarget = {
+  provider: "github";
+  repo: string;
+  pr: string | null;
+  head: string;
+  branch: string;
+};
+export type CiHandoffRetrigger = {
+  state: CiRetriggerState;
+  original: string;
+  commit?: string;
+  ref?: string;
+  remote?: string;
+  receipt?: string;
+};
+/** One persisted CI wait observation (cumulative counts) with its target identity and retrigger checkpoint. */
+export type CiHandoffEvent = {
+  type: "ci-handoff";
+  workflow: string;
+  at: string;
+  phase: "poll" | "repoll";
+  target: CiHandoffTarget;
+  observation: { result: CiHandoffResult; attempts: number; errors: number };
+  retrigger?: CiHandoffRetrigger;
+};
+export type CiHandoffState = {
+  phase: "poll" | "repoll";
+  attempts: number;
+  errors: number;
+  last: { result: CiHandoffResult; at: string } | null;
+  retrigger: CiHandoffRetrigger | null;
+  /** The cumulative counts when the retrigger first appeared: the re-poll counts from here. */
+  retriggerBase: { attempts: number; errors: number } | null;
+  /** Events for another target (repo, PR, head or branch). */
+  stale: number;
+  /** Events refused because a cumulative count went backwards. */
+  invalid: number;
+};
+
+const SHA_RE = /^(?:[0-9a-f]{40}|[0-9a-f]{64})$/;
+const REPO_RE = /^[A-Za-z0-9][A-Za-z0-9_.-]*\/[A-Za-z0-9][A-Za-z0-9_.-]*$/;
+const isRecord = (v: unknown): v is Record<string, unknown> =>
+  v !== null && typeof v === "object" && !Array.isArray(v);
+const isCount = (v: unknown): v is number => Number.isSafeInteger(v) && Number(v) >= 0;
+const nonEmpty = (v: unknown): v is string => typeof v === "string" && v.trim().length > 0;
+
+function validHandoffTarget(value: unknown): value is CiHandoffTarget {
+  if (!isRecord(value)) return false;
+  return (
+    value.provider === "github" &&
+    typeof value.repo === "string" &&
+    REPO_RE.test(value.repo) &&
+    (value.pr === null || (typeof value.pr === "string" && /^[1-9][0-9]*$/.test(value.pr))) &&
+    typeof value.head === "string" &&
+    SHA_RE.test(value.head) &&
+    nonEmpty(value.branch)
+  );
+}
+
+function validRetrigger(value: unknown): value is CiHandoffRetrigger {
+  if (!isRecord(value)) return false;
+  const state = CI_RETRIGGER_STATES.find((s) => s === value.state);
+  if (state === undefined) return false;
+  if (typeof value.original !== "string" || !SHA_RE.test(value.original)) return false;
+  const sha = (k: string) => typeof value[k] === "string" && SHA_RE.test(value[k]);
+  if (state === "intended") return true;
+  if (!sha("commit")) return false;
+  if (state === "commit-created") return true;
+  if (!nonEmpty(value.ref) || !sha("remote")) return false;
+  if (state === "push-completed") return true;
+  return nonEmpty(value.receipt);
+}
+
+/** Validate one `ci-handoff` row before any reader treats it as evidence. */
+export function validateCiHandoffEvent(value: unknown): value is CiHandoffEvent {
+  if (!isRecord(value) || value.type !== "ci-handoff") return false;
+  if (!nonEmpty(value.workflow) || !nonEmpty(value.at)) return false;
+  if (value.phase !== "poll" && value.phase !== "repoll") return false;
+  if (!validHandoffTarget(value.target)) return false;
+  const o = value.observation;
+  if (!isRecord(o)) return false;
+  if (!CI_HANDOFF_RESULTS.some((r) => r === o.result)) return false;
+  if (!isCount(o.attempts) || !isCount(o.errors) || o.errors > o.attempts) return false;
+  if (value.retrigger !== undefined && !validRetrigger(value.retrigger)) return false;
+  return value.phase !== "repoll" || value.retrigger !== undefined;
+}
+
+/** Wording and transport do not change which target a handoff row is about. */
+export function ciHandoffIdentity(target: CiHandoffTarget): string {
+  return JSON.stringify([
+    target.provider,
+    target.repo.toLowerCase(),
+    target.pr,
+    target.head,
+    target.branch,
+  ]);
+}
+
+/**
+ * The cumulative handoff state of one target: de-dupes, orders by `at`, counts rows for other
+ * targets as `stale` and rows whose cumulative counts go backwards as `invalid`.
+ */
+export function foldCiHandoff(rows: readonly object[], target: CiHandoffTarget): CiHandoffState {
+  const seen = new Set<string>();
+  const events: CiHandoffEvent[] = [];
+  for (const row of rows) {
+    if (!validateCiHandoffEvent(row)) continue;
+    const key = JSON.stringify(row);
+    if (seen.has(key)) continue;
+    seen.add(key);
+    events.push(row);
+  }
+  const ordered = events
+    .map((e, i) => ({ e, i }))
+    .sort((a, b) => (a.e.at < b.e.at ? -1 : a.e.at > b.e.at ? 1 : a.i - b.i))
+    .map((x) => x.e);
+  const want = ciHandoffIdentity(target);
+  const state: CiHandoffState = {
+    phase: "poll",
+    attempts: 0,
+    errors: 0,
+    last: null,
+    retrigger: null,
+    retriggerBase: null,
+    stale: 0,
+    invalid: 0,
+  };
+  for (const e of ordered) {
+    if (ciHandoffIdentity(e.target) !== want) {
+      state.stale += 1;
+      continue;
+    }
+    if (e.observation.attempts < state.attempts || e.observation.errors < state.errors) {
+      state.invalid += 1;
+      continue;
+    }
+    state.attempts = e.observation.attempts;
+    state.errors = e.observation.errors;
+    state.phase = e.phase;
+    state.last = { result: e.observation.result, at: e.at };
+    if (e.retrigger !== undefined) {
+      state.retriggerBase ??= { attempts: e.observation.attempts, errors: e.observation.errors };
+      state.retrigger = e.retrigger;
+    }
+  }
+  return state;
+}
+
 export type Step = {
   step: string;
   status: "DONE" | "FAILED";
@@ -516,6 +679,37 @@ const ledgerOpKey = (operation: string) => actionKey("ledger-op", operation);
 export type LedgerOperationState =
   { state: "new" } | { state: "replay" | "conflict"; row: EngineActionRow };
 
+/** The status rows of one bounded correction: a guaranteed no-write rejection, a corrected retry, its success. */
+export const CORRECTION_REJECTED_ROW = "correction-rejected";
+export const CORRECTION_CANDIDATE_ROW = "correction-candidate";
+export const CORRECTION_SUCCEEDED_ROW = "correction-succeeded";
+
+/**
+ * The stable scope one rejected sub-step's corrected retries share: derived from the run, step,
+ * task group and attempt, the ledger and the sub-step, never from an invocation or operation id,
+ * so a new tool call, helper or resume spends from the same budget.
+ */
+export function correctionScope(o: {
+  workflow: string;
+  run: number | null;
+  step: string;
+  group: string | null;
+  attempt: string | null;
+  ledger: string;
+  substep: string;
+}): string {
+  return [
+    "ledgers-append",
+    o.ledger,
+    o.substep,
+    o.workflow,
+    `run${o.run ?? 0}`,
+    o.step,
+    ...(o.group === null ? [] : [`group${o.group}`]),
+    ...(o.attempt === null ? [] : [`attempt${o.attempt}`]),
+  ].join(":");
+}
+
 /** Where `operation` stands in `file`: unseen, done with this request, or used for another. */
 export function ledgerOperation(
   file: string,
diff --git a/.bkit/core/engine/tools/instructions.test.ts b/.bkit/core/engine/tools/instructions.test.ts
index 0c44344a9..0b0c71357 100644
--- a/.bkit/core/engine/tools/instructions.test.ts
+++ b/.bkit/core/engine/tools/instructions.test.ts
@@ -47,6 +47,8 @@ import {
   type Surface,
   type CorpusFile,
 } from "./instructions";
+import { applyOpencodeCommand, applyT1, applyT2 } from "../render/hosts";
+import { substituteWorkflow } from "../render/trackers";
 
 /**
  * The whole-corpus cases' time limit: a 60s base for a CPU-bound scan of every agent-read
@@ -1253,3 +1255,84 @@ describe("the Template Instructions tables match the prompts", () => {
     expect(listed).toEqual(actual);
   });
 });
+
+describe("the recovery precedence contract", () => {
+  const TRACKERS = ["github", "linear", "jira", "none"] as const;
+  const HOSTS: Record<string, (content: string) => string> = {
+    claude: (c) => c,
+    cursor: (c) => applyT2(applyT1(c)),
+    opencode: (c) => applyOpencodeCommand(c),
+  };
+  const workflows = CORPUS.filter(
+    (f) => f.surface === "workflow" && f.content.includes("**Failures:**"),
+  );
+  const renderings = (file: CorpusFile) =>
+    TRACKERS.flatMap((tracker) =>
+      Object.entries(HOSTS).map(([host, render]) => ({
+        label: `${file.name} ${host}/${tracker}`,
+        text: render(substituteWorkflow(file.content, tracker).output),
+      })),
+    );
+  /** The paragraph that opens with the bounded-correction label, to its blank line. */
+  const correction = (text: string) =>
+    /\*\*Bounded correction:\*\*[\s\S]*?(?:\n\s*\n|$)/.exec(text)?.[0].trim() ?? "";
+  const failuresLine = (text: string) => /\*\*Failures:\*\*[^\n]*/.exec(text)?.[0] ?? "";
+
+  it("renders one recovery precedence contract for all hosts and tracker adapters", () => {
+    expect(workflows.length).toBeGreaterThanOrEqual(5);
+    for (const file of workflows) {
+      const rendered = renderings(file);
+      const contracts = new Set(rendered.map((r) => correction(r.text).replace(/\s+/g, " ")));
+      // One wording, whatever the host transform or tracker variant.
+      expect({ file: file.name, wordings: contracts.size }).toEqual({
+        file: file.name,
+        wordings: 1,
+      });
+      const [contract] = [...contracts];
+      expect(contract, file.name).toMatch(/guaranteed no-write/i);
+      expect(contract, file.name).toMatch(/engine (?:deterministic )?fill/i);
+      expect(contract, file.name).toMatch(/two corrected retries/i);
+      expect(contract, file.name).toMatch(/same (?:sub-step|substep)/i);
+      expect(contract, file.name).toMatch(/uncertain/i);
+      expect(contract, file.name).toMatch(/reconcile/i);
+      // A stricter command-specific route beats the general allowance.
+      expect(contract, file.name).toMatch(/stricter[^.]*(?:route|limit)[^.]*(?:wins|first)/i);
+      // Authorization, gates and checks keep their own routes.
+      expect(contract, file.name).toMatch(/authori[sz]ation/i);
+      expect(contract, file.name).toMatch(/gate/i);
+
+      for (const r of rendered) {
+        // The Failures carrier names the correction route beside the other explicit routes,
+        // before the Failure Path fallback it still ends in.
+        const failures = failuresLine(r.text);
+        expect(failures, r.label).toContain("Sandbox recovery");
+        expect(failures, r.label).toContain("Bounded correction");
+        expect(failures.indexOf("Bounded correction"), r.label).toBeLessThan(
+          failures.indexOf("Failure Path"),
+        );
+        // No blanket carrier sends every failure to the Failure Path, ahead of its recovery routes.
+        expect(r.text, r.label).not.toMatch(
+          /\*\*If\*\* any step, tool,? command fails, or gate cannot pass → \*\*Failure Path\*\*/,
+        );
+        // A generic non-zero exit still is not a retry: only a declared route recovers.
+        expect(r.text, r.label).toMatch(
+          /Exit non-zero with no `Route:` or recovery under \*\*Failures\*\*/,
+        );
+        expect(correction(r.text), r.label).not.toMatch(
+          /any (?:non-zero|failing) (?:exit|command)[^.]*retry/i,
+        );
+      }
+    }
+
+    // The workflows that wait for CI re-enter on persisted observations, with no copied counters.
+    const waiting = workflows.filter((f) => f.content.includes("CI wait turn-loop"));
+    expect(waiting.map((f) => f.name).sort()).toEqual(["bkit-build", "bkit-debug"]);
+    for (const file of waiting) {
+      for (const r of renderings(file)) {
+        expect(r.text, r.label).toContain("bkit runs handoff");
+        expect(r.text, r.label).not.toContain("--attempts=<total>");
+        expect(r.text, r.label).not.toContain("{CI_REENTRY}");
+      }
+    }
+  });
+});
diff --git a/.bkit/core/workflows/bkit-auto.md b/.bkit/core/workflows/bkit-auto.md
index 6e5dec4e8..2f4d147f5 100644
--- a/.bkit/core/workflows/bkit-auto.md
+++ b/.bkit/core/workflows/bkit-auto.md
@@ -13,7 +13,7 @@ description: "Auto — Phase-routed dispatch of any bkit phase"
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 - **Narrate:** Emit user-visible lines at key points (step start, subagent return, pivot, blocker). After each completed numbered step, show its printed `progressLine` word for word as plain text outside code blocks. Show each completed row's line once; delayed bookkeeping and repeated validation gates add no second line. `/bkit-auto` shows its delegated workflow's lines. Headless runs show the same lines without waiting for acknowledgement. Silence between actions = compliance regression; Auto-apply does not mean silent.
-- **Failures:** Apply explicit recovery routes, including **Sandbox recovery** and **Read-only helper recovery**, before **Failure Path**.
+- **Failures:** Apply explicit recovery routes, including **Sandbox recovery**, **Read-only helper recovery** and **Bounded correction**, before **Failure Path**.
   - **If** a step, tool or command still fails, or a gate cannot pass → **Failure Path**.
 - **Sandbox recovery:** **If** the host reports a sandbox or permission denial:
   - Retry the same operation once through the host's approval mechanism only when permitted.
@@ -34,6 +34,7 @@ description: "Auto — Phase-routed dispatch of any bkit phase"
 - **Recovery scope:** Repository code, bkit commands, test and gate failures keep their explicit recovery or failure routes.
 - **Placeholders:** Assert `{PLACEHOLDERS}` such as `{PHASE}`, `{ARG}`, `{FID}`, `{ISSUE_ID}`, `{OWNER_REPO}`, `{OWNER}`, `{REPO}`, `{BRANCH}`, `{PR_NUMBER}`, etc non-empty if required before making tool calls (`{ISSUE_ID}` only when tracker wired — empty under `none`). **Else** → **Failure Path**.
 - **Commands:** Blocks run `"{BKIT}" <noun> <verb> --flag=value`; `{BKIT}` = `bkit` printed by Step 1 `repo info`, until then `"$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/node_modules/.bin/bkit"`. Stdout is `key: value` lines, nested keys indented under their parent (`a.b` = `b` under `a:`), lists of rows as tables: hold named keys under bare `UPPER_SNAKE` names, a `"quoted"` value without its quotes, and write a held name as `{VAR}` where it goes into a command or a `Context:` / `Read:` / `Create:` line. Exit non-zero with no `Route:` or recovery under **Failures** → **Failure Path**; exit 81 → end turn, re-run block. A flag still holding a literal `{PLACEHOLDER}` exits 2.
+- **Bounded correction:** **If** a bkit command fails with a structured error that declares effects = none and correctable = true (a guaranteed no-write rejection, checked by the engine fill before any write) → correct only what the error names, and retry with `--correction-of=<the rejected --operation>` and a fresh `--operation`. Allow two corrected retries per printed `scope`; a replay of a counted operation spends nothing. After a verified retry (`correction.verified`) resume the same sub-step. **If** the error reports uncertain effects → reconcile first by re-running the original `--operation`, and make no corrected candidate until that settles. A stricter command-specific route or limit wins over this allowance. Authorization failures, gate and check failures, exhausted budgets and unverified retries keep **Failure Path**.
 
 **Contract:** The terms between this agent and whoever runs it.
 
diff --git a/.bkit/core/workflows/bkit-build.md b/.bkit/core/workflows/bkit-build.md
index d5eebaa6f..26aa6cfea 100644
--- a/.bkit/core/workflows/bkit-build.md
+++ b/.bkit/core/workflows/bkit-build.md
@@ -13,7 +13,7 @@ description: "Build Feature — Autonomous implementation"
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 - **Narrate:** Emit user-visible lines at key points (step start, subagent return, pivot, blocker). After each completed numbered step, show its printed `progressLine` word for word as plain text outside code blocks. Show each completed row's line once; delayed bookkeeping and repeated validation gates add no second line. `/bkit-auto` shows its delegated workflow's lines. Headless runs show the same lines without waiting for acknowledgement. Silence between actions = compliance regression; Auto-apply does not mean silent.
-- **Failures:** Apply explicit recovery routes, including **Sandbox recovery** and **Read-only helper recovery**, before **Failure Path**.
+- **Failures:** Apply explicit recovery routes, including **Sandbox recovery**, **Read-only helper recovery** and **Bounded correction**, before **Failure Path**.
   - **If** a step, tool or command still fails, or a gate cannot pass → **Failure Path**.
 - **Sandbox recovery:** **If** the host reports a sandbox or permission denial:
   - Retry the same operation once through the host's approval mechanism only when permitted.
@@ -34,7 +34,8 @@ description: "Build Feature — Autonomous implementation"
 - **Recovery scope:** Repository code, bkit commands, test and gate failures keep their explicit recovery or failure routes.
 - **Placeholders:** Assert `{PLACEHOLDERS}` such as `{FID}`, `{YYYYMM}`, etc non-empty if required before making tool calls<!-- bkit:tracker true start --> (`{ISSUE_ID}` may be empty)<!-- bkit:tracker true end -->. **Else** → **Failure Path**.
 - **Commands:** Blocks run `"{BKIT}" <noun> <verb> --flag=value`; `{BKIT}` = `bkit` printed by Step 1 `repo info`, until then `"$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/node_modules/.bin/bkit"`. Stdout is `key: value` lines, nested keys indented under their parent (`a.b` = `b` under `a:`), lists of rows as tables: hold named keys under bare `UPPER_SNAKE` names, a `"quoted"` value without its quotes, and write a held name as `{VAR}` where it goes into a command or a `Context:` / `Read:` / `Create:` line. Exit non-zero with no `Route:` or recovery under **Failures** → **Failure Path**; exit 80 → mapped MCP tool (**gh MCP fallback**); exit 81 → end turn, re-run block. A flag still holding a literal `{PLACEHOLDER}` exits 2.
-- **CI wait turn-loop:** **If** a `bkit runs dispatch` block exits 81 (runtime cannot wait) or 80 (`gh` unavailable) → resolve the poll in the agent turn loop: each orchestrator turn run once `bkit runs wait --pr={PR_NUMBER} --once` (on exit 80 read the PR's checks via `pull_request_read` instead) — check present → `found`; 6th unresolved turn → `none`, or `err` when every turn errored; **Else** → end turn and repeat. Re-run the block with `{CI_REENTRY}` = `--poll-result=<found|none|err> --attempts=<total>`, plus `--all-errored` when every turn errored and `--retriggered` when the printed `phase` = repoll. `{CI_REENTRY}` is empty on a block's first run.
+- **CI wait turn-loop:** **If** a `bkit runs dispatch` block exits 81 (runtime cannot wait) or 80 (`gh` unavailable) → resolve the poll in the agent turn loop. Pass `--invocation="{INVOCATION}"` on every run of the block. Each orchestrator turn run once `bkit runs wait --pr={PR_NUMBER} --once` (on exit 80 read the PR's checks via `pull_request_read` instead), then record what it saw with `bkit runs handoff --invocation="{INVOCATION}" --repo={OWNER_REPO} --pr={PR_NUMBER} --head=<printed head> --branch={BRANCH} --result=<none|pending|success|failure|provider-error> --polls=1`. Follow the printed `nextAction`: `poll-again` → end turn and repeat; `retrigger`, `reconcile-retrigger` or `verdict` → re-run the block. The engine derives the attempts, errors and re-trigger state from the persisted rows; never supply a counter.
+- **Bounded correction:** **If** a bkit command fails with a structured error that declares effects = none and correctable = true (a guaranteed no-write rejection, checked by the engine fill before any write) → correct only what the error names, and retry with `--correction-of=<the rejected --operation>` and a fresh `--operation`. Allow two corrected retries per printed `scope`; a replay of a counted operation spends nothing. After a verified retry (`correction.verified`) resume the same sub-step. **If** the error reports uncertain effects → reconcile first by re-running the original `--operation`, and make no corrected candidate until that settles. A stricter command-specific route or limit wins over this allowance. Authorization failures, gate and check failures, exhausted budgets and unverified retries keep **Failure Path**.
 
 **Contract:** The terms between this agent and whoever runs it.
 
@@ -1288,9 +1289,12 @@ This block appends the roadmap row in the worktree only, closes and commits the
    "{BKIT}" steps done --workflow=build --step=build-create-pr --file="{STATUS}" --artifact={PR_URL} --commit=none
    ```
 6. Run the CI-Dispatch Gate. It records `build-close-workflow` with its `ciDispatch` verdict, cross-checks the transport and records the close transport.
-   **If** re-entering from the **CI wait turn-loop** → fill `{CI_REENTRY}`:
+   Issue the invocation once and hold its `invocation` as `INVOCATION`:
    ```bash
-   "{BKIT}" runs dispatch --pr={PR_NUMBER} --fid={FID} {LABEL_FLAGS} --file="{STATUS}" --workflow=build --step=build-close-workflow {CI_REENTRY}
+   "{BKIT}" status invocation --workflow=build --step=build-close-workflow --file="{STATUS}"
+   ```
+   ```bash
+   "{BKIT}" runs dispatch --pr={PR_NUMBER} --fid={FID} {LABEL_FLAGS} --file="{STATUS}" --workflow=build --step=build-close-workflow --invocation="{INVOCATION}"
    ```
    Route:
    - **If** exit 80 **or** 81 → **CI wait turn-loop** → re-run this block.
diff --git a/.bkit/core/workflows/bkit-debug.md b/.bkit/core/workflows/bkit-debug.md
index a990b80e6..2439d53a9 100644
--- a/.bkit/core/workflows/bkit-debug.md
+++ b/.bkit/core/workflows/bkit-debug.md
@@ -13,7 +13,7 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 - **Narrate:** Emit user-visible lines at key points (step start, subagent return, pivot, blocker). After each completed numbered step, show its printed `progressLine` word for word as plain text outside code blocks. Show each completed row's line once; delayed bookkeeping and repeated validation gates add no second line. `/bkit-auto` shows its delegated workflow's lines. Headless runs show the same lines without waiting for acknowledgement. Silence between actions = compliance regression; Auto-apply does not mean silent.
-- **Failures:** Apply explicit recovery routes, including **Sandbox recovery** and **Read-only helper recovery**, before **Failure Path**.
+- **Failures:** Apply explicit recovery routes, including **Sandbox recovery**, **Read-only helper recovery** and **Bounded correction**, before **Failure Path**.
   - **If** a step, tool or command still fails, or a gate cannot pass → **Failure Path**.
 - **Sandbox recovery:** **If** the host reports a sandbox or permission denial:
   - Retry the same operation once through the host's approval mechanism only when permitted.
@@ -34,7 +34,8 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
 - **Recovery scope:** Repository code, bkit commands, test and gate failures keep their explicit recovery or failure routes.
 - **Placeholders:** Assert `{PLACEHOLDERS}` such as `{FID}`, `{YYYYMM}`, etc non-empty if required before making tool calls<!-- bkit:tracker true start --> (`{ISSUE_ID}` may be empty)<!-- bkit:tracker true end -->. **Else** → **Failure Path**.
 - **Commands:** Blocks run `"{BKIT}" <noun> <verb> --flag=value`; `{BKIT}` = `bkit` printed by Step 1 `repo info`, until then `"$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/node_modules/.bin/bkit"`. Stdout is `key: value` lines, nested keys indented under their parent (`a.b` = `b` under `a:`), lists of rows as tables: hold named keys under bare `UPPER_SNAKE` names, a `"quoted"` value without its quotes, and write a held name as `{VAR}` where it goes into a command or a `Context:` / `Read:` / `Create:` line. Exit non-zero with no `Route:` or recovery under **Failures** → **Failure Path**; exit 80 → mapped MCP tool (**gh MCP fallback**); exit 81 → end turn, re-run block. A flag still holding a literal `{PLACEHOLDER}` exits 2.
-- **CI wait turn-loop:** **If** a `bkit runs dispatch` block exits 81 (runtime cannot wait) or 80 (`gh` unavailable) → resolve the poll in the agent turn loop: each orchestrator turn run once `bkit runs wait --pr={PR_NUMBER} --once` (on exit 80 read the PR's checks via `pull_request_read` instead) — check present → `found`; 6th unresolved turn → `none`, or `err` when every turn errored; **Else** → end turn and repeat. Re-run the block with `{CI_REENTRY}` = `--poll-result=<found|none|err> --attempts=<total>`, plus `--all-errored` when every turn errored and `--retriggered` when the printed `phase` = repoll. `{CI_REENTRY}` is empty on a block's first run.
+- **CI wait turn-loop:** **If** a `bkit runs dispatch` block exits 81 (runtime cannot wait) or 80 (`gh` unavailable) → resolve the poll in the agent turn loop. Pass `--invocation="{INVOCATION}"` on every run of the block. Each orchestrator turn run once `bkit runs wait --pr={PR_NUMBER} --once` (on exit 80 read the PR's checks via `pull_request_read` instead), then record what it saw with `bkit runs handoff --invocation="{INVOCATION}" --repo={OWNER_REPO} --pr={PR_NUMBER} --head=<printed head> --branch={BRANCH} --result=<none|pending|success|failure|provider-error> --polls=1`. Follow the printed `nextAction`: `poll-again` → end turn and repeat; `retrigger`, `reconcile-retrigger` or `verdict` → re-run the block. The engine derives the attempts, errors and re-trigger state from the persisted rows; never supply a counter.
+- **Bounded correction:** **If** a bkit command fails with a structured error that declares effects = none and correctable = true (a guaranteed no-write rejection, checked by the engine fill before any write) → correct only what the error names, and retry with `--correction-of=<the rejected --operation>` and a fresh `--operation`. Allow two corrected retries per printed `scope`; a replay of a counted operation spends nothing. After a verified retry (`correction.verified`) resume the same sub-step. **If** the error reports uncertain effects → reconcile first by re-running the original `--operation`, and make no corrected candidate until that settles. A stricter command-specific route or limit wins over this allowance. Authorization failures, gate and check failures, exhausted budgets and unverified retries keep **Failure Path**.
 
 **Contract:** The terms between this agent and whoever runs it.
 
@@ -787,25 +788,37 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
 7. **Run only if** `{PR_OPEN}` = 1 **or** `TRIGGER_PR` = 1 **or** `BRANCH` = `dev` **or** CI is selected.
    **If** `{PR_OPEN}` = 1 **or** `TRIGGER_PR` = 1 → run the CI-Dispatch Gate on the pushed head. It records `{DISPATCH_ROW}`, cross-checks the transport and records the close transport. `{DISPATCH_ROW}` = `--step=debug-close-workflow {LIVE_SKIPPED}` when `{PR_OPEN}` = 1, `--step=debug-create-pr --artifact={PR_URL}` after a created PR. `{LABEL_FLAGS}` as in sub-step 6:
 
+   Issue the invocation for the `{DISPATCH_ROW}` step once and hold its `invocation` as `INVOCATION` for every re-run:
+
+   ```bash
+   "{BKIT}" status invocation --workflow=debug --step=<the {DISPATCH_ROW} step> --file="{STATUS}"
+   ```
+
    ```bash
-   "{BKIT}" runs dispatch --pr={PR_NUMBER} --fid={FID} {LABEL_FLAGS} --file="{STATUS}" --workflow=debug {DISPATCH_ROW} {CI_REENTRY}
+   "{BKIT}" runs dispatch --pr={PR_NUMBER} --fid={FID} {LABEL_FLAGS} --file="{STATUS}" --workflow=debug {DISPATCH_ROW} --invocation="{INVOCATION}"
    ```
 
    Route:
    - **If** exit 0 → hold `head` as `VERIFY_HEAD`; with selected CI, run the verification below before sub-step 8; with local discovery, continue at sub-step 8.
-   - **If** exit 81 **or** 80 → **CI wait turn-loop** → re-run this block with `{CI_REENTRY}`.
+   - **If** exit 81 **or** 80 → **CI wait turn-loop** → re-run this block with the held `INVOCATION`.
    - **Else** (1 unresolved verdict, 4 skip token in the pushed body, 5 / 6 / other) → **Failure Path**.
 
    - **If** `BRANCH` = `dev` **and** `DEV_PUSHED` = false → only release the lock (the last block below).
    - **If** `BRANCH` = `dev` **and** `DEV_PUSHED` = true → gate the push-event CI run at `{DEV_SHA}`, then release the lock. `{LIVE_SKIPPED}` and `{LABEL_FLAGS}` as above:
 
+     Issue a fresh invocation for `debug-close-workflow` and hold it as `INVOCATION`:
+
+     ```bash
+     "{BKIT}" status invocation --workflow=debug --step=debug-close-workflow --file="{STATUS}"
+     ```
+
      ```bash
-     "{BKIT}" runs dispatch --sha="{DEV_SHA}" --fid={FID} {LABEL_FLAGS} --file="{STATUS}" --workflow=debug --step=debug-close-workflow {LIVE_SKIPPED} {CI_REENTRY}
+     "{BKIT}" runs dispatch --sha="{DEV_SHA}" --fid={FID} {LABEL_FLAGS} --file="{STATUS}" --workflow=debug --step=debug-close-workflow {LIVE_SKIPPED} --invocation="{INVOCATION}"
      ```
 
      Route:
      - **If** exit 0 → hold the printed `head` as `DEV_SHA` → wait below.
-     - **If** exit 81 **or** 80 → hold the printed `head` as `DEV_SHA` → **CI wait turn-loop**, polling `runs wait --head="{DEV_SHA}" --branch=dev --once` in place of `--pr` → re-run this block with `{CI_REENTRY}`, `--sha="{DEV_SHA}"` re-held from each printed `head` (after a `repoll` phase too).
+     - **If** exit 81 **or** 80 → hold the printed `head` as `DEV_SHA` → **CI wait turn-loop**, polling `runs wait --head="{DEV_SHA}" --branch=dev --once` in place of `--pr` → re-run this block with `--invocation="{INVOCATION}"`, `--sha="{DEV_SHA}"` re-held from each printed `head` (after a `repoll` phase too).
      - **Else** → **Failure Path**.
 
      ```bash
diff --git a/.bkit/core/workflows/bkit-design.md b/.bkit/core/workflows/bkit-design.md
index 633bc8e4d..10c4cfc90 100644
--- a/.bkit/core/workflows/bkit-design.md
+++ b/.bkit/core/workflows/bkit-design.md
@@ -13,7 +13,7 @@ description: "Design Feature — Autonomous design phase"
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 - **Narrate:** Emit user-visible lines at key points (step start, subagent return, pivot, blocker). After each completed numbered step, show its printed `progressLine` word for word as plain text outside code blocks. Show each completed row's line once; delayed bookkeeping and repeated validation gates add no second line. `/bkit-auto` shows its delegated workflow's lines. Headless runs show the same lines without waiting for acknowledgement. Silence between actions = compliance regression; Auto-apply does not mean silent.
-- **Failures:** Apply explicit recovery routes, including **Sandbox recovery** and **Read-only helper recovery**, before **Failure Path**.
+- **Failures:** Apply explicit recovery routes, including **Sandbox recovery**, **Read-only helper recovery** and **Bounded correction**, before **Failure Path**.
   - **If** a step, tool or command still fails, or a gate cannot pass → **Failure Path**.
 - **Sandbox recovery:** **If** the host reports a sandbox or permission denial:
   - Retry the same operation once through the host's approval mechanism only when permitted.
@@ -34,6 +34,7 @@ description: "Design Feature — Autonomous design phase"
 - **Recovery scope:** Repository code, bkit commands, test and gate failures keep their explicit recovery or failure routes.
 - **Placeholders:** Assert `{PLACEHOLDERS}` such as `{FID}`, `{YYYYMM}`, etc non-empty if required before making tool calls<!-- bkit:tracker true start --> (`{ISSUE_ID}` may be empty)<!-- bkit:tracker true end -->. **Else** → **Failure Path**.
 - **Commands:** Blocks run `"{BKIT}" <noun> <verb> --flag=value`; `{BKIT}` = `bkit` printed by Step 1 `repo info`, until then `"$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/node_modules/.bin/bkit"`. Stdout is `key: value` lines, nested keys indented under their parent (`a.b` = `b` under `a:`), lists of rows as tables: hold named keys under bare `UPPER_SNAKE` names, a `"quoted"` value without its quotes, and write a held name as `{VAR}` where it goes into a command or a `Context:` / `Read:` / `Create:` line. Exit non-zero with no `Route:` or recovery under **Failures** → **Failure Path**; exit 80 → mapped MCP tool (**gh MCP fallback**); exit 81 → end turn, re-run block. A flag still holding a literal `{PLACEHOLDER}` exits 2.
+- **Bounded correction:** **If** a bkit command fails with a structured error that declares effects = none and correctable = true (a guaranteed no-write rejection, checked by the engine fill before any write) → correct only what the error names, and retry with `--correction-of=<the rejected --operation>` and a fresh `--operation`. Allow two corrected retries per printed `scope`; a replay of a counted operation spends nothing. After a verified retry (`correction.verified`) resume the same sub-step. **If** the error reports uncertain effects → reconcile first by re-running the original `--operation`, and make no corrected candidate until that settles. A stricter command-specific route or limit wins over this allowance. Authorization failures, gate and check failures, exhausted budgets and unverified retries keep **Failure Path**.
 
 **Contract:** The terms between this agent and whoever runs it.
 
diff --git a/.bkit/core/workflows/bkit-plan.md b/.bkit/core/workflows/bkit-plan.md
index 0195b69c1..be5e93716 100644
--- a/.bkit/core/workflows/bkit-plan.md
+++ b/.bkit/core/workflows/bkit-plan.md
@@ -13,7 +13,7 @@ description: "Plan Feature — Autonomous plan generation"
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 - **Narrate:** Emit user-visible lines at key points (step start, subagent return, pivot, blocker). After each completed numbered step, show its printed `progressLine` word for word as plain text outside code blocks. Show each completed row's line once; delayed bookkeeping and repeated validation gates add no second line. `/bkit-auto` shows its delegated workflow's lines. Headless runs show the same lines without waiting for acknowledgement. Silence between actions = compliance regression; Auto-apply does not mean silent.
-- **Failures:** Apply explicit recovery routes, including **Sandbox recovery** and **Read-only helper recovery**, before **Failure Path**.
+- **Failures:** Apply explicit recovery routes, including **Sandbox recovery**, **Read-only helper recovery** and **Bounded correction**, before **Failure Path**.
   - **If** a step, tool or command still fails, or a gate cannot pass → **Failure Path**.
 - **Sandbox recovery:** **If** the host reports a sandbox or permission denial:
   - Retry the same operation once through the host's approval mechanism only when permitted.
@@ -34,6 +34,7 @@ description: "Plan Feature — Autonomous plan generation"
 - **Recovery scope:** Repository code, bkit commands, test and gate failures keep their explicit recovery or failure routes.
 - **Placeholders:** Assert `{PLACEHOLDERS}` such as `{FID}`, `{YYYYMM}`, `{PARENT_FID}`, `{PARENT_YYYYMM}`, etc non-empty if required before making tool calls<!-- bkit:tracker true start --> (`{ISSUE_ID}` may be empty)<!-- bkit:tracker true end -->. **Else** → **Failure Path**.
 - **Commands:** Blocks run `"{BKIT}" <noun> <verb> --flag=value`; `{BKIT}` = `bkit` printed by Step 1 `repo info`, until then `"$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/node_modules/.bin/bkit"`. Stdout is `key: value` lines, nested keys indented under their parent (`a.b` = `b` under `a:`), lists of rows as tables: hold named keys under bare `UPPER_SNAKE` names, a `"quoted"` value without its quotes, and write a held name as `{VAR}` where it goes into a command or a `Context:` / `Read:` / `Create:` line. Exit non-zero with no `Route:` or recovery under **Failures** → **Failure Path**; exit 80 → mapped MCP tool (**gh MCP fallback**); exit 81 → end turn, re-run block. A flag still holding a literal `{PLACEHOLDER}` exits 2.
+- **Bounded correction:** **If** a bkit command fails with a structured error that declares effects = none and correctable = true (a guaranteed no-write rejection, checked by the engine fill before any write) → correct only what the error names, and retry with `--correction-of=<the rejected --operation>` and a fresh `--operation`. Allow two corrected retries per printed `scope`; a replay of a counted operation spends nothing. After a verified retry (`correction.verified`) resume the same sub-step. **If** the error reports uncertain effects → reconcile first by re-running the original `--operation`, and make no corrected candidate until that settles. A stricter command-specific route or limit wins over this allowance. Authorization failures, gate and check failures, exhausted budgets and unverified retries keep **Failure Path**.
 
 **Contract:** The terms between this agent and whoever runs it.
 
diff --git a/.bkit/core/workflows/bkit-ship.md b/.bkit/core/workflows/bkit-ship.md
index 8598da8e5..3ddc81ba5 100644
--- a/.bkit/core/workflows/bkit-ship.md
+++ b/.bkit/core/workflows/bkit-ship.md
@@ -13,7 +13,7 @@ description: "Ship Feature — Autonomous merge and archive"
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 - **Narrate:** Emit user-visible lines at key points (step start, subagent return, pivot, blocker). After each completed numbered step, show its printed `progressLine` word for word as plain text outside code blocks. Show each completed row's line once; delayed bookkeeping and repeated validation gates add no second line. `/bkit-auto` shows its delegated workflow's lines. Headless runs show the same lines without waiting for acknowledgement. Silence between actions = compliance regression; Auto-apply does not mean silent.
-- **Failures:** Apply explicit recovery routes, including **Sandbox recovery** and **Read-only helper recovery**, before **Failure Path**.
+- **Failures:** Apply explicit recovery routes, including **Sandbox recovery**, **Read-only helper recovery** and **Bounded correction**, before **Failure Path**.
   - **If** a step, tool or command still fails, or a gate cannot pass → **Failure Path**.
 - **Sandbox recovery:** **If** the host reports a sandbox or permission denial:
   - Retry the same operation once through the host's approval mechanism only when permitted.
@@ -34,6 +34,7 @@ description: "Ship Feature — Autonomous merge and archive"
 - **Recovery scope:** Repository code, bkit commands, test and gate failures keep their explicit recovery or failure routes.
 - **Placeholders:** Assert `{PLACEHOLDERS}` such as `{FID}`, `{YYYYMM}`, etc non-empty if required before making tool calls<!-- bkit:tracker true start --> (`{ISSUE_ID}` may be empty)<!-- bkit:tracker true end -->. **Else** → **Failure Path**.
 - **Commands:** Blocks run `"{BKIT}" <noun> <verb> --flag=value`; `{BKIT}` = `bkit` printed by Step 1 `repo info`, until then `"$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/node_modules/.bin/bkit"`. Stdout is `key: value` lines, nested keys indented under their parent (`a.b` = `b` under `a:`), lists of rows as tables: hold named keys under bare `UPPER_SNAKE` names, a `"quoted"` value without its quotes, and write a held name as `{VAR}` where it goes into a command or a `Context:` / `Read:` / `Create:` line. Exit non-zero with no `Route:` or recovery under **Failures** → **Failure Path**; exit 80 → mapped MCP tool (**gh MCP fallback**); exit 81 → end turn, re-run block. A flag still holding a literal `{PLACEHOLDER}` exits 2.
+- **Bounded correction:** **If** a bkit command fails with a structured error that declares effects = none and correctable = true (a guaranteed no-write rejection, checked by the engine fill before any write) → correct only what the error names, and retry with `--correction-of=<the rejected --operation>` and a fresh `--operation`. Allow two corrected retries per printed `scope`; a replay of a counted operation spends nothing. After a verified retry (`correction.verified`) resume the same sub-step. **If** the error reports uncertain effects → reconcile first by re-running the original `--operation`, and make no corrected candidate until that settles. A stricter command-specific route or limit wins over this allowance. Authorization failures, gate and check failures, exhausted budgets and unverified retries keep **Failure Path**.
 
 **Contract:** The terms between this agent and whoever runs it.
 
diff --git a/.bkit/instructions.md b/.bkit/instructions.md
index 66b981d7d..32d540607 100644
--- a/.bkit/instructions.md
+++ b/.bkit/instructions.md
@@ -1138,11 +1138,11 @@ Clause section lines:
 - audit:
   - specialised: `bkit-audit-adoption`, `bkit-audit-dependencies`, `bkit-audit-usability`
 - drift:
-  - `bkit-build:419`: "--only-if-dirty-tracked --scope=core --mode=commit" Commits every dirty tracked file in scope core, not only files this run touched; `commits` says ONLY commit files you touched, named explicitly
+  - `bkit-build:420`: "--only-if-dirty-tracked --scope=core --mode=commit" Commits every dirty tracked file in scope core, not only files this run touched; `commits` says ONLY commit files you touched, named explicitly
     - kept: commits only the bookkeeping allow-list (this run's log dir and ledgers) on the originating branch, never pushed, so the new worktree branch carries the run's log and ledger rows
-  - `bkit-design:202`: "--only-if-dirty-tracked --scope=core --mode=commit" Commits every dirty tracked file in scope core, not only files this run touched; `commits` says ONLY commit files you touched, named explicitly
+  - `bkit-design:203`: "--only-if-dirty-tracked --scope=core --mode=commit" Commits every dirty tracked file in scope core, not only files this run touched; `commits` says ONLY commit files you touched, named explicitly
     - kept: commits only the bookkeeping allow-list (this run's log dir and ledgers) on the originating branch, never pushed, so the new worktree branch carries the run's log and ledger rows
-  - `bkit-plan:216`: "--only-if-dirty-tracked --scope=core --mode=commit" Commits every dirty tracked file in scope core, not only files this run touched; `commits` says ONLY commit files you touched, named explicitly
+  - `bkit-plan:217`: "--only-if-dirty-tracked --scope=core --mode=commit" Commits every dirty tracked file in scope core, not only files this run touched; `commits` says ONLY commit files you touched, named explicitly
     - kept: commits only the bookkeeping allow-list (this run's log dir and ledgers) on the originating branch, never pushed, so the new worktree branch carries the run's log and ledger rows
   - `bkit-ship-conflict-resolve:32`: "`git add`, `git checkout --theirs|--ours <conflicted>`" Permits `git add` (`commits` says subagents do not commit; staging is allowed here only for rebase or merge resolution, matching `destructive-git-prohibited`'s in-progress-rebase carve-out)
     - kept: staging and `git rebase --continue` are the in-progress rebase resolution `destructive-git-prohibited` carves out, and `git merge --abort` is on none of its prohibited forms; the caller commits and pushes
@@ -1235,11 +1235,11 @@ Clause section lines:
 - audit:
   - specialised: `bkit-audit-adoption`, `bkit-audit-dependencies`, `bkit-audit-repo`, `bkit-audit-usability`
 - drift:
-  - `bkit-build:419`: "--only-if-dirty-tracked --scope=core --mode=commit" Commits every dirty tracked file in scope core, not only files this run touched; `commits` says ONLY commit files you touched, named explicitly
+  - `bkit-build:420`: "--only-if-dirty-tracked --scope=core --mode=commit" Commits every dirty tracked file in scope core, not only files this run touched; `commits` says ONLY commit files you touched, named explicitly
     - kept: commits only the bookkeeping allow-list (this run's log dir and ledgers) on the originating branch, never pushed, so the new worktree branch carries the run's log and ledger rows
-  - `bkit-design:202`: "--only-if-dirty-tracked --scope=core --mode=commit" Commits every dirty tracked file in scope core, not only files this run touched; `commits` says ONLY commit files you touched, named explicitly
+  - `bkit-design:203`: "--only-if-dirty-tracked --scope=core --mode=commit" Commits every dirty tracked file in scope core, not only files this run touched; `commits` says ONLY commit files you touched, named explicitly
     - kept: commits only the bookkeeping allow-list (this run's log dir and ledgers) on the originating branch, never pushed, so the new worktree branch carries the run's log and ledger rows
-  - `bkit-plan:216`: "--only-if-dirty-tracked --scope=core --mode=commit" Commits every dirty tracked file in scope core, not only files this run touched; `commits` says ONLY commit files you touched, named explicitly
+  - `bkit-plan:217`: "--only-if-dirty-tracked --scope=core --mode=commit" Commits every dirty tracked file in scope core, not only files this run touched; `commits` says ONLY commit files you touched, named explicitly
     - kept: commits only the bookkeeping allow-list (this run's log dir and ledgers) on the originating branch, never pushed, so the new worktree branch carries the run's log and ledger rows
   - `utility-new-release:30`: "are pre-approved by the owner's release request" Declares commit / push / PR / merge into main / tag pre-approved by 'the owner's release request'; `pushes` says one approval covers one push, but this run does up to three pushes (dev backmerge, release branch, tag); `production-merge` requires explicit human confirmation for any merge into main
     - kept: release flow as designed: the human release request approves its commit, pushes, PR into `main`, merge and tag
@@ -1369,7 +1369,7 @@ Clause section lines:
 - audit:
   - specialised: `bkit-audit-annotations`, `bkit-audit-ci-performance`
 - drift:
-  - `bkit-ship:584`: "probes for a run at it first, dispatches only when none" Dispatches CI by hand (gh workflow run via --dispatch-if-absent per `.bkit/workflows.md` § CI-Dispatch Gate (shared, single source)) when no run is found; `ci` says pushes auto-trigger CI, NEVER manually
+  - `bkit-ship:585`: "probes for a run at it first, dispatches only when none" Dispatches CI by hand (gh workflow run via --dispatch-if-absent per `.bkit/workflows.md` § CI-Dispatch Gate (shared, single source)) when no run is found; `ci` says pushes auto-trigger CI, NEVER manually
     - kept: Re-validate probes for an existing run first and dispatches only when the head has none, which happens when the head commit carries `[skip ci]` or GitHub started no run
 
 ```text
@@ -1668,7 +1668,7 @@ Clause section lines:
 - audit:
   - specialised: `bkit-audit-ci-performance`
 - drift:
-  - `bkit-ship:584`: "probes for a run at it first, dispatches only when none" Dispatches CI by hand (gh workflow run via --dispatch-if-absent per `.bkit/workflows.md` § CI-Dispatch Gate (shared, single source)) when no run is found; `ci` says pushes auto-trigger CI, NEVER manually
+  - `bkit-ship:585`: "probes for a run at it first, dispatches only when none" Dispatches CI by hand (gh workflow run via --dispatch-if-absent per `.bkit/workflows.md` § CI-Dispatch Gate (shared, single source)) when no run is found; `ci` says pushes auto-trigger CI, NEVER manually
     - kept: Re-validate probes for an existing run first and dispatches only when the head has none, which happens when the head commit carries `[skip ci]` or GitHub started no run
 
 ```text
@@ -2627,10 +2627,11 @@ One `### {name}` per clause, in the lines of § Format, Clause section lines. He
 - carriers: workflow all
 
 ```text
-**Failures:** Apply explicit recovery routes, including **Sandbox recovery** and **Read-only helper recovery**, before **Failure Path**.
+**Failures:** Apply explicit recovery routes, including **Sandbox recovery**, **Read-only helper recovery** and **Bounded correction**, before **Failure Path**.
 ```
 
 ```retired
+**Failures:** Apply explicit recovery routes, including **Sandbox recovery** and **Read-only helper recovery**, before **Failure Path**.
 **Failures:** Follow explicit recovery routes, including **Sandbox recovery** and **Read-only helper recovery**, before entering **Failure Path**.
 **Failures:** Follow explicit recovery routes, including **Sandbox recovery**, before entering **Failure Path**.
 **Failures:** Follow explicit recovery routes, including **Sandbox recovery**, before entering **Failure Path**. **If** a step, tool or command still fails, or a gate cannot pass → **Failure Path**.
@@ -2905,9 +2906,23 @@ Continue from the interrupted sub-step only after the retry is verified.
 - carriers: workflow `bkit-build`, `bkit-debug`
 
 ```text
+**CI wait turn-loop:** **If** a `bkit runs dispatch` block exits 81 (runtime cannot wait) or 80 (`gh` unavailable) → resolve the poll in the agent turn loop. Pass `--invocation="{INVOCATION}"` on every run of the block. Each orchestrator turn run once `bkit runs wait --pr={PR_NUMBER} --once` (on exit 80 read the PR's checks via `pull_request_read` instead), then record what it saw with `bkit runs handoff --invocation="{INVOCATION}" --repo={OWNER_REPO} --pr={PR_NUMBER} --head=<printed head> --branch={BRANCH} --result=<none|pending|success|failure|provider-error> --polls=1`. Follow the printed `nextAction`: `poll-again` → end turn and repeat; `retrigger`, `reconcile-retrigger` or `verdict` → re-run the block. The engine derives the attempts, errors and re-trigger state from the persisted rows; never supply a counter.
+```
+
+```retired
 **CI wait turn-loop:** **If** a `bkit runs dispatch` block exits 81 (runtime cannot wait) or 80 (`gh` unavailable) → resolve the poll in the agent turn loop: each orchestrator turn run once `bkit runs wait --pr={PR_NUMBER} --once` (on exit 80 read the PR's checks via `pull_request_read` instead) — check present → `found`; 6th unresolved turn → `none`, or `err` when every turn errored; **Else** → end turn and repeat. Re-run the block with `{CI_REENTRY}` = `--poll-result=<found|none|err> --attempts=<total>`, plus `--all-errored` when every turn errored and `--retriggered` when the printed `phase` = repoll. `{CI_REENTRY}` is empty on a block's first run.
 ```
 
+### workflow-bounded-correction
+
+- workflow: required
+- block: protocol
+- carriers: workflow all
+
+```text
+**Bounded correction:** **If** a bkit command fails with a structured error that declares effects = none and correctable = true (a guaranteed no-write rejection, checked by the engine fill before any write) → correct only what the error names, and retry with `--correction-of=<the rejected --operation>` and a fresh `--operation`. Allow two corrected retries per printed `scope`; a replay of a counted operation spends nothing. After a verified retry (`correction.verified`) resume the same sub-step. **If** the error reports uncertain effects → reconcile first by re-running the original `--operation`, and make no corrected candidate until that settles. A stricter command-specific route or limit wins over this allowance. Authorization failures, gate and check failures, exhausted budgets and unverified retries keep **Failure Path**.
+```
+
 ### contract-lead
 
 - prompt: required
@@ -10051,7 +10066,6 @@ Hold its URL as `PR_URL` and its number as `PR_NUMBER`.
 **If** exit 80 → append ` bkit [force build]` to the title with `update_pull_request`, then re-run the block with `--title-set`.
 Record `build-create-pr`:
 [mcp-fallback] Run the CI-Dispatch Gate. It records `build-close-workflow` with its `ciDispatch` verdict, cross-checks the transport and records the close transport.
-**If** re-entering from the **CI wait turn-loop** → fill `{CI_REENTRY}`:
 **If** exit 80 **or** 81 → **CI wait turn-loop** → re-run this block.
 Re-read the issue's labels after the push, for the kill-switch check:
 **If** `PUBLISH` = true → also run:
@@ -10191,10 +10205,10 @@ Set `TRIGGER_PR`:
 **If** exit 80 → `create_pull_request` with the printed `title` / `body` / `base` / `head` → hold its number as `PR_NUMBER` and its URL as `PR_URL`.
 [code-commits] **If** `TRIGGER_PR` = 1 → commit and push the CI-triggering head. `{LABEL_FLAGS}` = one `--label=<name>` per re-read `LABELS` entry<!-- bkit:tracker true start -->, empty when `ISSUE_ID` is empty<!-- bkit:tracker true end -->:
 **Run only if** `{PR_OPEN}` = 1 **or** `TRIGGER_PR` = 1 **or** `BRANCH` = `dev` **or** CI is selected.
-**If** exit 81 **or** 80 → **CI wait turn-loop** → re-run this block with `{CI_REENTRY}`.
+**If** exit 81 **or** 80 → **CI wait turn-loop** → re-run this block with the held `INVOCATION`.
 **If** `BRANCH` = `dev` **and** `DEV_PUSHED` = false → only release the lock (the last block below).
 **If** `BRANCH` = `dev` **and** `DEV_PUSHED` = true → gate the push-event CI run at `{DEV_SHA}`, then release the lock. `{LIVE_SKIPPED}` and `{LABEL_FLAGS}` as above:
-**If** exit 81 **or** 80 → hold the printed `head` as `DEV_SHA` → **CI wait turn-loop**, polling `runs wait --head="{DEV_SHA}" --branch=dev --once` in place of `--pr` → re-run this block with `{CI_REENTRY}`, `--sha="{DEV_SHA}"` re-held from each printed `head` (after a `repoll` phase too).
+**If** exit 81 **or** 80 → hold the printed `head` as `DEV_SHA` → **CI wait turn-loop**, polling `runs wait --head="{DEV_SHA}" --branch=dev --once` in place of `--pr` → re-run this block with `--invocation="{INVOCATION}"`, `--sha="{DEV_SHA}"` re-held from each printed `head` (after a `repoll` phase too).
 [fit `workflow-verdict-fail` 0.67; keep: fails on a missing CI run, not on a FAIL verdict] **If** `result` != `found` → **Failure Path**.
 **If** `conclusion` != `success` → **Failure Path** naming the run at `{DEV_SHA}`.
 [fit `workflow-else-failure` 0.67; keep: names what the failure report carries] **Else** → **Failure Path** naming the run (`runUrl`).
diff --git a/dist/commands/lib.js b/dist/commands/lib.js
index bd9b1edb6..5107d8723 100644
--- a/dist/commands/lib.js
+++ b/dist/commands/lib.js
@@ -52,6 +52,56 @@ export class CommandError extends Error {
         this.code = code;
     }
 }
+/**
+ * A refusal the receiving handler declares as pre-effect validation: nothing was written,
+ * so a corrected retry of the same sub-step is permitted within its correction budget.
+ * Only this class (never a generic `CommandError`) carries that permission.
+ */
+export class NoWriteRejection extends CommandError {
+    detail;
+    constructor(code, message, detail) {
+        super(code, message);
+        this.detail = detail;
+    }
+}
+/** A failure after an effect may have begun: the state must be reconciled, never auto-retried. */
+export class UncertainEffect extends CommandError {
+}
+/** The correction budget of `scope` is spent: nothing was written and no further retry is allowed. */
+export class CorrectionExhausted extends CommandError {
+    scope;
+    constructor(code, message, scope) {
+        super(code, message);
+        this.scope = scope;
+    }
+}
+/** The structured `--json` error for the declared classes; every other error prints none. */
+function structuredError(err) {
+    if (err instanceof CorrectionExhausted) {
+        return {
+            code: err.code,
+            message: err.message,
+            effects: "none",
+            correctable: false,
+            exhausted: true,
+            scope: err.scope,
+        };
+    }
+    if (err instanceof NoWriteRejection) {
+        return {
+            code: err.code,
+            message: err.message,
+            effects: "none",
+            correctable: true,
+            scope: err.detail.scope,
+            substep: err.detail.substep,
+        };
+    }
+    if (err instanceof UncertainEffect) {
+        return { code: err.code, message: err.message, effects: "uncertain", correctable: false };
+    }
+    return null;
+}
 /** Parse a whole-number flag, using its fallback only when absent. */
 export const wholeNumber = (v, flag, fallback, min = 0) => {
     if (v === undefined)
@@ -570,6 +620,22 @@ export async function runCommand(argv, commands, options) {
     }
     const rest = argv.slice(2);
     if (rest.some(isHelp)) {
+        if (rest.includes("--json")) {
+            const s = cmd.verbs[verb];
+            io.stdout(`${JSON.stringify({
+                noun: cmd.noun,
+                verb,
+                summary: s.summary,
+                flags: s.flags.map((f) => ({
+                    name: f.name,
+                    type: f.type,
+                    required: f.required === true,
+                })),
+                output: s.output,
+                exitCodes: s.exitCodes ?? {},
+            })}\n`);
+            return EXIT.OK;
+        }
         io.stdout(verbHelp(cmd, verb));
         return EXIT.OK;
     }
@@ -640,6 +706,9 @@ export async function runCommand(argv, commands, options) {
         if (!(err instanceof CommandError))
             throw err;
         io.stderr(`${tag} ${err.message}\n`);
+        const structured = ctx.json ? structuredError(err) : null;
+        if (structured !== null)
+            io.stdout(`${JSON.stringify({ error: structured })}\n`);
         outcome = err.code;
         return err.code;
     }
diff --git a/dist/commands/workflow/counters.js b/dist/commands/workflow/counters.js
index 036dfc364..c5f345582 100644
--- a/dist/commands/workflow/counters.js
+++ b/dist/commands/workflow/counters.js
@@ -10,10 +10,10 @@
 //            0 is a legal answer (that step simply has not run).
 import * as fs from "node:fs";
 import * as path from "node:path";
-import { activeDoneSteps, activeDoneStepsSinceClean, allRunsDoneSteps, appendLine, lastCleanRound, lastDoneStepAllRuns, nextStrategy, runNumber, statusTimestamp, } from "../../ledgers/status.js";
+import { activeDoneSteps, activeDoneStepsSinceClean, allRunsDoneSteps, appendLine, CORRECTION_CANDIDATE_ROW, lastCleanRound, lastDoneStepAllRuns, nextStrategy, runNumber, statusTimestamp, } from "../../ledgers/status.js";
 import { ASK_POINTS, readBkitConfig, } from "../../shared/settings.js";
 import { headlessRun } from "./runtime.js";
-import { CommandError, EXIT, git, runGit, } from "../lib.js";
+import { CommandError, EXIT, git, runGit, wholeNumber, } from "../lib.js";
 import { EXIT_NO_STATUS, FILE_FLAG, GROUP_FLAG, STEP_FLAG, WORKFLOW_FLAG, positiveInt, readRuns, readStatusRows, statusFile, str, } from "./status.js";
 /** An ask point by name (`build.verify`); an unknown name is a usage error. */
 export function askPoint(name) {
@@ -118,6 +118,46 @@ function typedRowCount(file, workflow, type) {
         .slice(start + 1)
         .filter((r) => r.type === type && (r.workflow === undefined || r.workflow === workflow)).length;
 }
+/** Corrected retries a rejected sub-step gets unless its route names a stricter limit. */
+export const CORRECTION_LIMIT = 2;
+/**
+ * Spend one corrected retry of `scope` for `operation` in `workflow`'s active run. The budget is
+ * per scope and survives tools, helpers, resumes and any other counter call; a new operation id
+ * gains nothing, and asking again for a counted one spends nothing. `extra` joins the row.
+ */
+export function spendCorrection(file, workflow, scope, operation, limit, extra = {}) {
+    const rows = readStatusRows(file);
+    let start = -1;
+    rows.forEach((r, i) => {
+        if (r.type === "workflow-started" && r.workflow === workflow)
+            start = i;
+    });
+    const spent = new Set(rows
+        .slice(start + 1)
+        .filter((r) => r.type === CORRECTION_CANDIDATE_ROW && r.workflow === workflow && r.scope === scope)
+        .map((r) => String(r.operation)));
+    const verdict = (allowed, replayed) => ({
+        allowed,
+        used: spent.size,
+        limit,
+        remaining: Math.max(0, limit - spent.size),
+        replayed,
+    });
+    if (spent.has(operation))
+        return verdict(true, true);
+    if (spent.size >= limit)
+        return verdict(false, false);
+    fs.appendFileSync(file, appendLine({
+        type: CORRECTION_CANDIDATE_ROW,
+        workflow,
+        at: statusTimestamp(),
+        scope,
+        operation,
+        ...extra,
+    }));
+    spent.add(operation);
+    return verdict(true, false);
+}
 /** The row `counters grant` writes: the owner gave one loop one more full allowance. */
 export const ALLOWANCE_ROW = "allowance-granted";
 /**
@@ -462,6 +502,47 @@ export const countersCommand = {
                 return EXIT.OK;
             },
         },
+        correction: {
+            summary: "Spend one corrected retry of a rejected sub-step: exit 0 allowed (or a replay of a counted operation), exit 1 the scope's budget is used up. The budget is two per scope in the active run unless a stricter --limit names one.",
+            use: "workflow",
+            flags: [
+                FILE_FLAG,
+                WORKFLOW_FLAG,
+                {
+                    name: "scope",
+                    type: "string",
+                    required: true,
+                    help: "the engine-derived correction scope",
+                },
+                {
+                    name: "operation",
+                    type: "string",
+                    required: true,
+                    help: "the corrected candidate's fresh operation id",
+                },
+                {
+                    name: "limit",
+                    type: "string",
+                    help: `corrected retries this route allows (default ${CORRECTION_LIMIT}); a smaller one wins`,
+                },
+            ],
+            output: {
+                allowed: "true when the correction may run",
+                used: "operations counted in this scope",
+                limit: "retries this route allows",
+                remaining: "retries left",
+                replayed: "true when the operation was already counted: nothing was spent",
+            },
+            exitCodes: { [EXIT_NO_STATUS]: "status.jsonl missing, unreadable, or not valid NDJSON" },
+            run: (ctx) => {
+                const file = statusFile(ctx);
+                if (!fs.existsSync(file))
+                    throw new CommandError(EXIT_NO_STATUS, `${file} does not exist`);
+                const spend = spendCorrection(file, String(ctx.flags.workflow), String(ctx.flags.scope), String(ctx.flags.operation), wholeNumber(ctx.flags.limit, "limit", CORRECTION_LIMIT));
+                ctx.emit({ ...spend });
+                return spend.allowed ? EXIT.OK : EXIT.NO;
+            },
+        },
         max: {
             summary: "The ask points' limits and ask settings: one by --point, or all.",
             use: "workflow",
diff --git a/dist/commands/workflow/ledgers.js b/dist/commands/workflow/ledgers.js
index f1b8e593e..deb243dfa 100644
--- a/dist/commands/workflow/ledgers.js
+++ b/dist/commands/workflow/ledgers.js
@@ -17,9 +17,10 @@ import { readBkitVersion } from "../../install/version-file.js";
 import { readBkitConfig } from "../../shared/settings.js";
 import { APPEND_LEDGERS, SCHEMA, UNJUSTIFIED_REASON, gitEnv, parse, queryLedger, mintTs, resolveRepoSlug, validate, withLineage, writerProblem, } from "../../ledgers/telemetry.js";
 import { COMPACT_LEDGERS, compactLedgers } from "../../ledgers/compact.js";
-import { LEDGER_OPERATIONS_FILE, actionHash, appendHeld, ledgerIntent, ledgerOperation, pendingLedgerIntents, recordLedgerIntent, recordLedgerOperation, withTargetLock, writePrepared, } from "../../ledgers/status.js";
-import { CommandError, EXIT, INVOCATION_FLAG, isIgnoredPath, isSharedBranch, parseJson, wholeNumber, } from "../lib.js";
-import { str } from "./status.js";
+import { CORRECTION_REJECTED_ROW, CORRECTION_SUCCEEDED_ROW, LEDGER_OPERATIONS_FILE, actionHash, appendHeld, appendLine, correctionScope, ledgerIntent, ledgerOperation, pendingLedgerIntents, recordLedgerIntent, recordLedgerOperation, statusTimestamp, withTargetLock, writePrepared, } from "../../ledgers/status.js";
+import { CommandError, CorrectionExhausted, EXIT, INVOCATION_FLAG, isIgnoredPath, isSharedBranch, NoWriteRejection, parseJson, UncertainEffect, wholeNumber, } from "../lib.js";
+import { CORRECTION_LIMIT, spendCorrection } from "./counters.js";
+import { readStatusRows, str } from "./status.js";
 import { NO_MARKERS_REASON, outOfScope, parsePlanBlocks, reuseInventory, } from "./plan-blocks.js";
 /** Root is not a directory or repo, git is too old, or a ref does not resolve. */
 export const EXIT_ROOT = 3;
@@ -665,6 +666,11 @@ export const ledgersCommand = {
                     type: "boolean",
                     help: "let the engine issue the operation id from --invocation and the request, so a retried call after a lost response replays instead of appending again; exclusive with --operation",
                 },
+                {
+                    name: "correction-of",
+                    type: "string",
+                    help: "the operation of an earlier guaranteed no-write rejection of this ledger append in this step: this call is its corrected retry (two per scope), under its own fresh --operation or --issue-operation",
+                },
             ],
             output: {
                 ledger: "the ledger appended to",
@@ -672,6 +678,7 @@ export const ledgersCommand = {
                 appended: "rows written",
                 keys: "each row's key, in order (null when a row has none)",
                 receipt: "with --operation: {operation, ledger, file, offset, bytes, rows[{key, ts}], replayed}; replayed is true when the original effect is returned",
+                correction: "with --correction-of: {scope, operation, of, used, limit, substep, verified}; verified is true when the rows landed (or the original receipt was returned)",
             },
             exitCodes: {
                 [EXIT_STAGE]: "mkdir or append failed, the ledger is locked by another writer, or a prior attempt left an uncertain partial write",
@@ -1139,6 +1146,36 @@ function withInvocationBy(row, inv, refuse) {
     }
     return { ...row, by };
 }
+/**
+ * The operation id of an append request: the caller's `--operation`, else (with
+ * `--issue-operation`) one issued from the invocation and the request, so retrying a lost
+ * response gets the same id.
+ */
+export function appendOperationId(ledger, rows, invocation, options) {
+    if (options.operation !== undefined)
+        return options.operation;
+    if (options.issueOperation !== true || invocation === undefined)
+        return undefined;
+    const hash = actionHash(JSON.stringify({ ledger, rows, invocation: invocation.id }));
+    return `op-${invocation.id.slice(4, 16)}-${hash.slice(0, 12)}`;
+}
+/** The correction scope of an append by a workflow-run invocation; null for any other caller. */
+export function appendCorrectionScope(invocation, ledger) {
+    if (invocation.scope !== "run" ||
+        invocation.statusPath === null ||
+        invocation.workflow === null ||
+        invocation.step === null)
+        return null;
+    return correctionScope({
+        workflow: invocation.workflow,
+        run: invocation.run,
+        step: invocation.step,
+        group: invocation.group,
+        attempt: invocation.attempt,
+        ledger,
+        substep: "append",
+    });
+}
 /** The `{key, ts}` of each row in prepared `block` bytes. */
 function receiptRows(block) {
     const out = [];
@@ -1184,11 +1221,16 @@ export function appendLedgerRows(root, ledger, rows, invocation, options = {}) {
         throw new CommandError(EXIT.USAGE, "--issue-operation and --operation are exclusive: the engine issues the id, or the caller names it");
     if (options.issueOperation === true && invocation === undefined)
         throw new CommandError(EXIT.USAGE, "--issue-operation needs --invocation: the id is issued from that invocation's context");
-    // Issued from the invocation and the request hash, so retrying a lost response gets the same id.
-    const operation = options.operation ??
-        (options.issueOperation === true && invocation !== undefined
-            ? `op-${invocation.id.slice(4, 16)}-${hash.slice(0, 12)}`
-            : undefined);
+    const operation = appendOperationId(ledger, rows, invocation, options);
+    // A rejection before any write is correctable only inside a workflow run (it has a scope to
+    // spend from) and only when the operation can be named by the corrected retry.
+    const scope = invocation === undefined ? null : appendCorrectionScope(invocation, ledger);
+    const reject = (why, row) => {
+        const message = `row ${row}: ${why}`;
+        return scope !== null && operation !== undefined
+            ? new NoWriteRejection(EXIT_ROW_REFUSED, message, { scope, substep: "append" })
+            : new CommandError(EXIT_ROW_REFUSED, message);
+    };
     const result = (landed, block, replayed) => {
         const parsedRows = receiptRows(block);
         return {
@@ -1219,7 +1261,7 @@ export function appendLedgerRows(root, ledger, rows, invocation, options = {}) {
         const out = rows.map((raw, i) => {
             const refuse = (why) => new CommandError(EXIT_ROW_REFUSED, `row ${i + 1}: ${why}`);
             if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
-                throw refuse("not a JSON object");
+                throw reject("not a JSON object", i + 1);
             }
             const r = invocation === undefined
                 ? raw
@@ -1227,14 +1269,14 @@ export function appendLedgerRows(root, ledger, rows, invocation, options = {}) {
             if (invocation === undefined && byOfRow(r)["modelSource"] === "unavailable")
                 throw refuse("by.modelSource unavailable needs a validated --invocation; the engine records it, a caller cannot assert it");
             if (Object.hasOwn(r, "ts"))
-                throw refuse("carries ts; ts is minted at append time");
+                throw reject("carries ts; ts is minted at append time", i + 1);
             if (Object.hasOwn(r, "schema"))
-                throw refuse("carries schema; it is set at append time");
+                throw reject("carries schema; it is set at append time", i + 1);
             if (!takes.includes(String(r["kind"]))) {
-                throw refuse(`kind must be ${takes.join(" | ")} in --ledger=${ledger} (got ${String(r["kind"])})`);
+                throw reject(`kind must be ${takes.join(" | ")} in --ledger=${ledger} (got ${String(r["kind"])})`, i + 1);
             }
             if (Object.hasOwn(r, "bkit"))
-                throw refuse("carries bkit; bkit.version is set at append time");
+                throw reject("carries bkit; bkit.version is set at append time", i + 1);
             repo ??= resolveRepoSlug(root) || "unknown/repo";
             version ??= readBkitVersion(path.join(root, ".bkit", "version"))?.pinnedVersion || "unknown";
             last = mintTs(last);
@@ -1254,7 +1296,7 @@ export function appendLedgerRows(root, ledger, rows, invocation, options = {}) {
                     row[k] = v;
             const v = validate(row);
             if (!v.ok)
-                throw refuse(v.reason ?? "invalid");
+                throw reject(v.reason ?? "invalid", i + 1);
             const who = writerProblem(row);
             if (who !== undefined)
                 throw refuse(who);
@@ -1312,7 +1354,7 @@ export function appendLedgerRows(root, ledger, rows, invocation, options = {}) {
                         return result(intent, intent.block, true);
                     }
                     if (seg.length > 0 && have.length === intent.offset + seg.length)
-                        throw new CommandError(EXIT_STAGE, `operation ${operation}: ${file} holds ${seg.length} of ${want.length} prepared bytes; the effect is uncertain, nothing was truncated or retried`);
+                        throw new UncertainEffect(EXIT_STAGE, `operation ${operation}: ${file} holds ${seg.length} of ${want.length} prepared bytes; the effect is uncertain, nothing was truncated or retried`);
                     if (have.length === intent.offset) {
                         // Nothing landed: write the exact prepared bytes again.
                         writePrepared(abs, intent.block, intent.offset);
@@ -1364,14 +1406,99 @@ function append(ctx) {
         if (rel.startsWith("..") || path.isAbsolute(rel))
             throw new CommandError(EXIT.USAGE, `conflict: --root ${root} is outside the checkout ${ctx.invocation.worktree} that issued invocation ${ctx.invocation.id}`);
     }
-    const r = appendLedgerRows(root, String(ctx.flags.ledger), parsed.value, ctx.invocation, {
+    const ledger = String(ctx.flags.ledger);
+    const request = {
         operation: str(ctx.flags.operation),
         issueOperation: ctx.flags.issueOperation === true,
-    });
+    };
+    const run = ctx.invocation;
+    const scope = run === undefined ? null : appendCorrectionScope(run, ledger);
+    const operation = appendOperationId(ledger, parsed.value, run, request);
+    const correctionOf = str(ctx.flags.correctionOf);
+    let spend;
+    if (correctionOf !== undefined) {
+        if (run === undefined || scope === null || run.statusPath === null || run.workflow === null)
+            throw new CommandError(EXIT.USAGE, "--correction-of needs a workflow-run --invocation: the correction budget lives in that run");
+        if (operation === undefined || operation === correctionOf)
+            throw new CommandError(EXIT.USAGE, "--correction-of needs a fresh --operation or --issue-operation: a corrected candidate has its own operation id");
+        const rejected = readStatusRows(run.statusPath).some((row) => row.type === CORRECTION_REJECTED_ROW &&
+            row.operation === correctionOf &&
+            row.scope === scope &&
+            row.workflow === run.workflow);
+        if (!rejected)
+            throw new CommandError(EXIT.USAGE, `--correction-of=${correctionOf} names no rejected ${ledger} append in this step; only a guaranteed no-write rejection of this sub-step can be corrected`);
+        // An earlier operation on this ledger whose effect is unconfirmed is reconciled first.
+        const target = Object.hasOwn(APPEND_LEDGERS, ledger)
+            ? APPEND_LEDGERS[ledger].file
+            : undefined;
+        if (target !== undefined &&
+            pendingLedgerIntents(path.join(root, LEDGER_OPERATIONS_FILE), target).length > 0)
+            throw new UncertainEffect(EXIT_STAGE, `${target} holds an operation whose effect is unconfirmed; reconcile it before any corrected candidate — nothing was written`);
+        spend = spendCorrection(run.statusPath, run.workflow, scope, operation, CORRECTION_LIMIT, {
+            of: correctionOf,
+            step: run.step,
+            substep: "append",
+        });
+        if (!spend.allowed)
+            throw new CorrectionExhausted(EXIT.NO, `the correction budget of ${scope} is spent (${spend.used} of ${spend.limit}); nothing was written`, scope);
+    }
+    let r;
+    try {
+        r = appendLedgerRows(root, ledger, parsed.value, ctx.invocation, request);
+    }
+    catch (err) {
+        if (err instanceof NoWriteRejection &&
+            run?.statusPath != null &&
+            run.workflow !== null &&
+            operation !== undefined) {
+            fs.appendFileSync(run.statusPath, appendLine({
+                type: CORRECTION_REJECTED_ROW,
+                workflow: run.workflow,
+                at: statusTimestamp(),
+                scope: err.detail.scope,
+                substep: err.detail.substep,
+                operation,
+                step: run.step,
+            }));
+            // The last allowed retry was just used: the rejection is final, not correctable.
+            if (spend !== undefined && spend.remaining === 0)
+                throw new CommandError(err.code, err.message);
+        }
+        throw err;
+    }
     ctx.log(r.receipt?.replayed === true
         ? `operation ${r.receipt.operation} already appended to ${r.file}; nothing written`
         : `appended ${r.appended} row(s) to ${r.file}`);
-    ctx.emit({ ...r });
+    if (spend === undefined || run?.statusPath == null || run.workflow === null || scope === null) {
+        ctx.emit({ ...r });
+        return EXIT.OK;
+    }
+    const verified = r.receipt?.replayed === true || r.appended === parsed.value.length;
+    const statusPath = run.statusPath;
+    const succeeded = readStatusRows(statusPath).some((row) => row.type === CORRECTION_SUCCEEDED_ROW && row.operation === operation);
+    if (verified && !succeeded)
+        fs.appendFileSync(statusPath, appendLine({
+            type: CORRECTION_SUCCEEDED_ROW,
+            workflow: run.workflow,
+            at: statusTimestamp(),
+            scope,
+            substep: "append",
+            operation,
+            of: correctionOf,
+            step: run.step,
+        }));
+    ctx.emit({
+        ...r,
+        correction: {
+            scope,
+            operation,
+            of: correctionOf,
+            used: spend.used,
+            limit: spend.limit,
+            substep: "append",
+            verified,
+        },
+    });
     return EXIT.OK;
 }
 /** Page cursor: the snapshot and filter it was cut from, and the offset of the next row. */
diff --git a/dist/commands/workflow/runs.js b/dist/commands/workflow/runs.js
index 645fcc257..f6cdc66ef 100644
--- a/dist/commands/workflow/runs.js
+++ b/dist/commands/workflow/runs.js
@@ -22,18 +22,18 @@
 import * as fs from "node:fs";
 import * as path from "node:path";
 import { readJsonFile } from "../../shared/json.js";
-import { CI_TIERS, lastRun, statusTimestamp, validateCiSelection, } from "../../ledgers/status.js";
-import { bodySkipToken, commitMessage, CommandError, DEV, EXIT, git, isSharedBranch, parseJson, runGh, runGit, runTool, SKIP_CI_TOKEN, wholeNumber, } from "../lib.js";
+import { appendLine, CI_HANDOFF_RESULTS, CI_TIERS, foldCiHandoff, lastRun, statusTimestamp, validateCiHandoffEvent, validateCiSelection, } from "../../ledgers/status.js";
+import { bodySkipToken, commitMessage, CommandError, DEV, EXIT, git, INVOCATION_FLAG, isSharedBranch, parseJson, runGh, runGit, runTool, SKIP_CI_TOKEN, wholeNumber, } from "../lib.js";
 import { ciGeneratedSteps, readBkitConfig } from "../../shared/settings.js";
 import { TIMEOUTS } from "../../shared/timeouts.js";
 import { FID_PATTERNS, fromBranch, fromMarker, issueIdOf, readIssueTracker } from "./fids.js";
 import { AUTO_LABEL, AUTO_ROUTE_SUFFIX } from "./issues.js";
 import { fetchRemoteRef, pushBranch } from "./branches.js";
-import { activeRecord, checkOnlyBookkeeping, retriggerCommit } from "./ledgers.js";
+import { activeRecord, appendRecordCommit, checkOnlyBookkeeping, commitOwnSet, markRecordPushed, readRecord, retriggerCommit, } from "./ledgers.js";
 import { closeTransportRow, crossCheckFile, devRequiresChecks, prRepoSlug, probePr, } from "./prs.js";
-import { resolveOwnerRepo, splitSlug } from "./repo.js";
+import { originOwnerRepo, resolveOwnerRepo, splitSlug } from "./repo.js";
 import { restateOutcome } from "./run-facts.js";
-import { extraField, readRuns, str } from "./status.js";
+import { extraField, readRuns, readStatusRows, str } from "./status.js";
 import { writeStepRow } from "./steps.js";
 import { attempt, issueRef, readLabels, trackerTarget } from "./tracker.js";
 const GH_MISSING = "gh is not on PATH — use the mapped GitHub MCP tool instead";
@@ -489,6 +489,89 @@ function pushCurrentBranch(cwd) {
     const res = runGit(cwd, args);
     return { ok: res.ok, error: res.ok ? "" : res.stderr || res.stdout };
 }
+/**
+ * Land a shared-branch run's own commits when every one of them changes nothing (a re-trigger and
+ * an empty close): each is copied onto the remote tip with that tip's own tree and pushed as a
+ * fast-forward. The tree is one the remote already holds, so there is nothing for a landing gate
+ * to validate, and no foreign local commit rides along. `not-empty` hands the push to
+ * `pushBranch`, whose landing gate covers content.
+ */
+function landEmptyOwnCommits(cwd, fid, branch, log) {
+    const rec = readRecord(cwd, fid);
+    if (rec === null || !runGit(cwd, ["fetch", "origin", branch]).ok)
+        return { kind: "failed" };
+    const tip = git(cwd, ["rev-parse", "-q", "--verify", `origin/${branch}`]);
+    const tipTree = tip === null ? null : git(cwd, ["rev-parse", `${tip}^{tree}`]);
+    if (tip === null || tipTree === null)
+        return { kind: "failed" };
+    const landed = new Set(rec.pushed ?? []);
+    const pending = rec.commits.filter((c) => !landed.has(c) && !runGit(cwd, ["merge-base", "--is-ancestor", c, tip]).ok);
+    if (pending.length === 0) {
+        const sha = rec.pushed?.at(-1);
+        return sha === undefined ? { kind: "failed" } : { kind: "landed", sha };
+    }
+    const empty = (c) => {
+        const tree = git(cwd, ["rev-parse", `${c}^{tree}`]);
+        return tree !== null && tree === git(cwd, ["rev-parse", `${c}^^{tree}`]);
+    };
+    if (!pending.every(empty))
+        return { kind: "not-empty" };
+    let parent = tip;
+    for (const c of pending) {
+        const made = runGit(cwd, [
+            "commit-tree",
+            tipTree,
+            "-p",
+            parent,
+            "-m",
+            git(cwd, ["log", "-1", "--format=%B", c]) ?? "",
+        ]);
+        if (!made.ok)
+            return { kind: "failed" };
+        parent = made.stdout;
+    }
+    const pushed = runGit(cwd, ["push", "origin", `${parent}:refs/heads/${branch}`]);
+    if (!pushed.ok) {
+        log(`pushing the run's empty commits to ${branch} failed: ${pushed.stderr}`);
+        return { kind: "failed" };
+    }
+    markRecordPushed(cwd, fid, pending);
+    log(`landed ${pending.length} empty commit(s) of the run on ${branch} as copies (${parent.slice(0, 12)})`);
+    return { kind: "landed", sha: parent };
+}
+/** The persisted `ci-handoff` rows of a status file (none when the file does not exist yet). */
+function handoffRowsOf(statusPath) {
+    return fs.existsSync(statusPath) ? readStatusRows(statusPath) : [];
+}
+/** The tip of `branch` on origin: its sha, "" when the branch is absent there, null when the lookup failed. */
+function remoteTip(cwd, branch) {
+    const res = runGit(cwd, ["ls-remote", "origin", `refs/heads/${branch}`]);
+    if (!res.ok)
+        return null;
+    return res.stdout.split(/\s+/)[0] ?? "";
+}
+/**
+ * The head a target is persisted under. Rows written before a re-trigger carry the head the
+ * re-trigger started from, so a process that finds HEAD on the re-trigger commit resumes them.
+ */
+function resolveHandoffHead(rows, identity, cwd, current) {
+    const mine = rows
+        .filter(validateCiHandoffEvent)
+        .filter((e) => e.target.repo.toLowerCase() === identity.repo.toLowerCase() &&
+        e.target.pr === identity.pr &&
+        e.target.branch === identity.branch);
+    const latest = mine.at(-1);
+    if (latest === undefined || latest.target.head === current)
+        return current;
+    const rt = latest.retrigger;
+    if (rt?.commit === current)
+        return latest.target.head;
+    if (rt?.state === "intended" &&
+        git(cwd, ["rev-parse", "HEAD^"]) === rt.original &&
+        /re-trigger/.test(commitMessage(cwd, current) ?? ""))
+        return latest.target.head;
+    return current;
+}
 /**
  * The CI-Dispatch Gate after build / debug's last push. Never pushes after the
  * verdict: a later commit would move the PR head away from the run it proved.
@@ -535,7 +618,92 @@ export async function ciDispatchGate(o, deps) {
             ciWorkflow: declared.ciWorkflow,
             namespace: checkNamespace(capstoneJob),
         };
+    // Durable continuation: the persisted state of this target, and the totals kept in step with it.
+    const hand = o.handoff;
+    const rowsAtStart = hand ? handoffRowsOf(hand.statusPath) : [];
+    const identity = {
+        provider: "github",
+        repo: originOwnerRepo(o.cwd) ?? "local/origin",
+        pr: o.pr,
+        branch: branch || "HEAD",
+    };
+    const ht = {
+        ...identity,
+        head: hand ? resolveHandoffHead(rowsAtStart, identity, o.cwd, res.head) : res.head,
+    };
+    const hs = hand ? foldCiHandoff(rowsAtStart, ht) : null;
+    let cumAttempts = hs?.attempts ?? 0;
+    let cumErrors = hs?.errors ?? 0;
+    let curRt = hs?.retrigger ?? null;
+    const repollBase = hs?.retriggerBase ?? null;
+    let lastResult = hs?.last?.result ?? "none";
+    if (hs)
+        res.attempts = hs.attempts;
+    const persist = (phase, result) => {
+        if (!hand)
+            return;
+        lastResult = result;
+        fs.appendFileSync(hand.statusPath, appendLine({
+            type: "ci-handoff",
+            workflow: hand.workflow ?? "build",
+            at: statusTimestamp(),
+            phase,
+            target: ht,
+            observation: { result, attempts: cumAttempts, errors: cumErrors },
+            ...(curRt === null ? {} : { retrigger: curRt }),
+        }));
+    };
+    const pollBudget = Math.max(1, Math.ceil(o.budgetS / o.intervalS));
+    const handoffPoll = async (phase) => {
+        // The first phase ends where the re-trigger began; the re-poll counts from there.
+        // No PR to read is the shell's empty-PR poll: zero attempts, all errored.
+        if (o.pr === null && !byRun)
+            return { pollResult: "err", attempts: 0, allErrored: true };
+        if (byRun)
+            target.head = head();
+        const baseA = phase === "repoll" ? (repollBase?.attempts ?? cumAttempts) : 0;
+        const baseE = phase === "repoll" ? (repollBase?.errors ?? cumErrors) : 0;
+        const endA = phase === "poll" && repollBase ? repollBase.attempts : cumAttempts;
+        const endE = phase === "poll" && repollBase ? repollBase.errors : cumErrors;
+        const foundBefore = hs?.last !== null &&
+            hs?.last !== undefined &&
+            ["pending", "success", "failure"].includes(hs.last.result) &&
+            hs.phase === phase;
+        if (foundBefore && endA === cumAttempts) {
+            return { pollResult: "found", attempts: cumAttempts - baseA, allErrored: false };
+        }
+        const remaining = pollBudget - (endA - baseA);
+        if (remaining <= 0) {
+            return {
+                pollResult: "none",
+                attempts: endA - baseA,
+                allErrored: endA - baseA > 0 && endE - baseE === endA - baseA,
+            };
+        }
+        let errs = 0;
+        deps.log(`polling for a ${target.namespace} check on PR #${o.pr} (${remaining} attempt(s) left, interval ${o.intervalS}s)`);
+        const w = await waitLoop({ budgetS: remaining * o.intervalS, intervalS: o.intervalS, once: false }, () => {
+            const p = pollOnce(target, deps.gh);
+            if (p.state === "err")
+                errs += 1;
+            return p;
+        }, deps.sleep, deps.log);
+        cumAttempts += w.attempts;
+        cumErrors += errs;
+        res.attempts = cumAttempts;
+        const phaseAttempts = cumAttempts - baseA;
+        const allErrored = phaseAttempts > 0 && cumErrors - baseE === phaseAttempts;
+        persist(phase, w.result === "found" ? "pending" : allErrored ? "provider-error" : "none");
+        if (w.blocked || w.ghMissing) {
+            res.phase = phase;
+            res.handoff = w.ghMissing ? EXIT.USE_MCP : EXIT.AGENT_WAIT;
+            return null;
+        }
+        return { pollResult: w.result, attempts: phaseAttempts, allErrored };
+    };
     const poll = async (phase) => {
+        if (hand)
+            return handoffPoll(phase);
         // A supplied result answers only the poll that was handed off; later polls run fresh.
         if (o.supplied && (phase === "repoll") === o.retriggered) {
             deps.log(`poll result supplied by the agent turn loop: ${o.supplied.pollResult} (attempts ${o.supplied.attempts})`);
@@ -569,18 +737,116 @@ export async function ciDispatchGate(o, deps) {
         deps.log(`verdict: ${outcome}${reason ? `(${reason})` : ""} head=${res.head} attempts=${res.attempts} retrigger=${res.retrigger}`);
         return res;
     };
-    if (!o.retriggered) {
+    /**
+     * The re-trigger as persisted checkpoints: intended -> commit-created -> push-completed ->
+     * receipt-completed. A fresh process continues from the last one; no effect repeats.
+     */
+    const handoffRetrigger = async (message, rec) => {
+        if (!hand)
+            return false;
+        const refName = `refs/heads/${branch}`;
+        let cur = curRt ?? { state: "intended", original: head() };
+        if (curRt === null) {
+            curRt = cur;
+            persist("poll", lastResult);
+        }
+        if (cur.state === "intended") {
+            const parent = git(o.cwd, ["rev-parse", "HEAD^"]);
+            const adopted = git(o.cwd, ["rev-parse", "HEAD"]) !== cur.original &&
+                parent === cur.original &&
+                /re-trigger/.test(commitMessage(o.cwd, "HEAD") ?? "");
+            let sha;
+            if (adopted) {
+                sha = git(o.cwd, ["rev-parse", "HEAD"]);
+                if (rec !== null && sha !== null && !readRecord(o.cwd, o.fid)?.commits.includes(sha))
+                    appendRecordCommit(o.cwd, o.fid, sha);
+            }
+            else {
+                const made = rec === null
+                    ? commitOwnSet(o.cwd, { plain: [], ledgers: [] }, message, { allowEmpty: true })
+                    : retriggerCommit(o.cwd, rec, message);
+                if (!made.ok)
+                    deps.log(`re-trigger commit failed: ${made.error}`);
+                sha = made.ok ? made.sha : null;
+            }
+            if (sha === null)
+                return false;
+            cur = { state: "commit-created", original: cur.original, commit: sha };
+            curRt = cur;
+            persist("poll", lastResult);
+            hand.checkpoint?.("commit-created");
+        }
+        if (cur.state === "commit-created" && cur.commit !== undefined) {
+            let remoteSha;
+            if (rec === null) {
+                const tip = remoteTip(o.cwd, branch);
+                if (tip === null) {
+                    deps.log("re-trigger push blocked: the remote branch could not be read");
+                    return false;
+                }
+                if (tip !== cur.commit) {
+                    const tracking = git(o.cwd, ["rev-parse", "-q", "--verify", `origin/${branch}`]);
+                    const fastForward = tip === "" || runGit(o.cwd, ["merge-base", "--is-ancestor", tip, cur.commit]).ok;
+                    if (!fastForward && tip !== tracking) {
+                        deps.log(`re-trigger push blocked: ${branch} moved on the remote to ${tip.slice(0, 12)} after the re-trigger commit was made`);
+                        return false;
+                    }
+                    const push = pushCurrentBranch(o.cwd);
+                    if (!push.ok) {
+                        deps.log(`re-trigger push failed: ${push.error}`);
+                        return false;
+                    }
+                }
+                remoteSha = remoteTip(o.cwd, branch) === cur.commit ? cur.commit : null;
+            }
+            else {
+                const empties = landEmptyOwnCommits(o.cwd, o.fid, branch, deps.log);
+                if (empties.kind === "landed")
+                    remoteSha = empties.sha;
+                else if (empties.kind === "failed")
+                    remoteSha = null;
+                else {
+                    const out = await pushBranch(o.cwd, { mode: "feature", fid: o.fid }, deps.log);
+                    remoteSha = out.out.pushed
+                        ? out.out.sha
+                        : out.out.skipped === "no-run-commits"
+                            ? (readRecord(o.cwd, o.fid)?.pushed?.at(-1) ?? null)
+                            : null;
+                }
+            }
+            if (remoteSha === null) {
+                deps.log("re-trigger push did not land the re-trigger commit on the remote");
+                return false;
+            }
+            cur = { ...cur, state: "push-completed", ref: refName, remote: remoteSha };
+            curRt = cur;
+            persist("poll", lastResult);
+            hand.checkpoint?.("push-completed");
+        }
+        if (cur.state === "push-completed" && cur.remote !== undefined) {
+            if (rec === null && remoteTip(o.cwd, branch) !== cur.remote) {
+                deps.log("re-trigger receipt blocked: the remote branch no longer holds the pushed commit");
+                return false;
+            }
+            cur = { ...cur, state: "receipt-completed", receipt: hand.operation };
+            curRt = cur;
+            persist("repoll", lastResult);
+            hand.checkpoint?.("receipt-completed");
+        }
+        return curRt.state === "receipt-completed";
+    };
+    if (!o.retriggered && curRt?.state !== "receipt-completed") {
         const first = await poll("poll");
         if (first === null)
             return res;
-        res.attempts = first.attempts;
+        res.attempts = hand ? cumAttempts : first.attempts;
         if (first.pollResult === "found")
             return verdict("dispatched");
         if (first.allErrored) {
             deps.log("unresolved(gh-error): every poll errored — gh unavailable or unauthenticated");
             return verdict("unresolved", "gh-error");
         }
-        if (SKIP_CI_TOKEN.test(commitMessage(o.cwd, res.head) ?? "")) {
+        if (curRt === null && SKIP_CI_TOKEN.test(commitMessage(o.cwd, res.head) ?? "")) {
             deps.log("unresolved(timeout-dirty): no run and the pushed head carries a CI suppressor — not re-triggering a dirty head");
             return verdict("unresolved", "timeout-dirty");
         }
@@ -596,13 +862,17 @@ export async function ciDispatchGate(o, deps) {
         }
         let pushed;
         let failure = "";
-        if (rec === null) {
+        if (hand) {
+            pushed = await handoffRetrigger(message, rec);
+        }
+        else if (rec === null) {
             landed = null;
             const before = git(o.cwd, ["rev-parse", "HEAD"]);
-            const made = runGit(o.cwd, ["commit", "--allow-empty", "-m", message]);
+            // Nothing from the index goes in: a path the user staged never lands in the re-trigger.
+            const made = commitOwnSet(o.cwd, { plain: [], ledgers: [] }, message, { allowEmpty: true });
             if (!made.ok) {
                 pushed = false;
-                failure = made.stderr || made.stdout;
+                failure = made.error;
             }
             else {
                 const push = pushCurrentBranch(o.cwd);
@@ -635,15 +905,27 @@ export async function ciDispatchGate(o, deps) {
             return res;
         }
         res.retrigger = true;
+        if (hand && curRt?.remote !== undefined && shared)
+            landed = curRt.remote;
         res.head = head();
         deps.log("re-trigger pushed; re-polling");
     }
+    if (hand && curRt?.state === "receipt-completed") {
+        res.retrigger = true;
+        if (shared && curRt.remote !== undefined)
+            landed = curRt.remote;
+        res.head = head();
+    }
     const prior = res.attempts;
     const second = await poll("repoll");
     if (second === null)
         return res;
     // A supplied re-poll carries the running total; a fresh one adds to the first poll.
-    res.attempts = o.retriggered && o.supplied ? second.attempts : prior + second.attempts;
+    res.attempts = hand
+        ? cumAttempts
+        : o.retriggered && o.supplied
+            ? second.attempts
+            : prior + second.attempts;
     res.head = head();
     if (SKIP_CI_TOKEN.test(commitMessage(o.cwd, res.head) ?? "")) {
         deps.log("unresolved(retrigger-suppressed): the re-trigger head carries a suppressor — cannot tell no-ci from suppression");
@@ -1243,6 +1525,103 @@ async function waitFor(cwd, i, d) {
         return { code: EXIT.AGENT_WAIT, out };
     return { code: EXIT.NO, out };
 }
+/**
+ * `runs handoff`: record one batch of CI poll observations in the invocation's run and derive the
+ * phase, the cumulative totals and the next action from the persisted rows. The caller supplies
+ * what it saw (`--result`, `--polls`), never a count, a phase or a verdict.
+ */
+function runHandoff(ctx) {
+    const f = ctx.flags;
+    const inv = ctx.invocation;
+    if (inv === undefined ||
+        inv.scope !== "run" ||
+        inv.statusPath === null ||
+        inv.workflow === null) {
+        throw new CommandError(EXIT.USAGE, "--invocation is required: an invocation issued by `bkit status invocation` for a workflow run");
+    }
+    const text = (v) => (typeof v === "string" ? v : "");
+    const repo = text(f.repo);
+    const pr = text(f.pr);
+    const head = text(f.head);
+    const branch = text(f.branch);
+    const result = CI_HANDOFF_RESULTS.find((r) => r === text(f.result));
+    if (result === undefined) {
+        throw new CommandError(EXIT.USAGE, `--result must be one of ${CI_HANDOFF_RESULTS.join(" | ")}`);
+    }
+    const polls = wholeNumber(f.polls, "polls", 0, 1);
+    const budgetS = wholeNumber(f.budgetS, "budget-s", 60);
+    const intervalS = wholeNumber(f.intervalS, "interval-s", 10, 1);
+    const target = { provider: "github", repo, pr, head, branch };
+    const probe = {
+        type: "ci-handoff",
+        workflow: inv.workflow,
+        at: statusTimestamp(),
+        phase: "poll",
+        target,
+        observation: { result: "none", attempts: 0, errors: 0 },
+    };
+    if (!validateCiHandoffEvent(probe)) {
+        throw new CommandError(EXIT.USAGE, "--repo, --pr, --head and --branch must name the owner/repo, PR number, full commit sha and branch");
+    }
+    const state = foldCiHandoff(readStatusRows(inv.statusPath), target);
+    const attempts = state.attempts + polls;
+    const errors = state.errors + (result === "provider-error" ? polls : 0);
+    const retrigger = state.retrigger;
+    const phase = retrigger?.state === "receipt-completed" ? "repoll" : "poll";
+    fs.appendFileSync(inv.statusPath, appendLine({
+        ...probe,
+        phase,
+        observation: { result, attempts, errors },
+        ...(retrigger === null ? {} : { retrigger }),
+    }));
+    const max = Math.max(1, Math.ceil(budgetS / intervalS));
+    const base = phase === "repoll" ? (state.retriggerBase ?? { attempts: 0, errors: 0 }) : null;
+    const phaseAttempts = attempts - (base?.attempts ?? 0);
+    const phaseErrors = errors - (base?.errors ?? 0);
+    const found = result === "pending" || result === "success" || result === "failure";
+    const out = {
+        phase,
+        attempts,
+        errors,
+        ciResult: result,
+        stale: state.stale,
+    };
+    const verdict = (outcome, reason) => ctx.emit({
+        ...out,
+        nextAction: "verdict",
+        outcome,
+        ...(reason === undefined ? {} : { reason }),
+    });
+    if (retrigger !== null && retrigger.state !== "receipt-completed") {
+        ctx.emit({ ...out, nextAction: "reconcile-retrigger", retrigger });
+        return EXIT.OK;
+    }
+    if (found) {
+        verdict(phase === "repoll" ? "self-healed" : "dispatched");
+        return EXIT.OK;
+    }
+    if (phaseAttempts < max) {
+        ctx.emit({ ...out, nextAction: "poll-again" });
+        return EXIT.OK;
+    }
+    if (phaseErrors === phaseAttempts) {
+        verdict("unresolved", "gh-error");
+        return EXIT.OK;
+    }
+    if (phase === "poll") {
+        ctx.emit({ ...out, nextAction: "retrigger" });
+        return EXIT.OK;
+    }
+    const declared = ciDeclared(checkoutRoot(ctx.cwd));
+    if (SKIP_CI_TOKEN.test(commitMessage(ctx.cwd, retrigger?.commit ?? "HEAD") ?? "")) {
+        verdict("unresolved", "retrigger-suppressed");
+    }
+    else if (declared.declared)
+        verdict("unresolved", "ci-declared-no-run");
+    else
+        verdict("no-ci");
+    return EXIT.OK;
+}
 async function runWait(ctx) {
     const f = ctx.flags;
     const r = await waitFor(ctx.cwd, {
@@ -1314,6 +1693,16 @@ async function runDispatch(ctx) {
             },
         retriggered: f.retriggered === true,
         sha,
+        handoff: ctx.invocation !== undefined &&
+            ctx.invocation.scope === "run" &&
+            ctx.invocation.statusPath !== null &&
+            pollResult === undefined
+            ? {
+                statusPath: ctx.invocation.statusPath,
+                operation: `ci-retrigger:${ctx.invocation.id}`,
+                ...(ctx.invocation.workflow === null ? {} : { workflow: ctx.invocation.workflow }),
+            }
+            : undefined,
     }, d);
     const scanResult = r.ciDispatch && r.ciDispatch.outcome !== "unresolved" ? scanBody(ctx.cwd, r.head) : null;
     // With --file / --step: the verdict lands on the step's row, and a passed one is
@@ -2038,10 +2427,42 @@ export const runsCommand = {
             exitCodes: { [EXIT_TRIGGER_FAILED]: "--dispatch-if-absent: gh workflow run failed" },
             run: runWait,
         },
+        handoff: {
+            summary: "Persist one batch of CI poll observations into the invocation's run and derive the phase, cumulative attempts and errors, next action and verdict from the persisted rows (poll-again | retrigger | reconcile-retrigger | verdict). Rows for another repo, PR or head never count.",
+            use: "workflow",
+            flags: [
+                INVOCATION_FLAG,
+                { name: "repo", type: "string", required: true, help: "owner/repo of the PR" },
+                { name: "pr", type: "string", required: true, help: "PR number" },
+                { name: "head", type: "string", required: true, help: "full commit sha the polls ran at" },
+                { name: "branch", type: "string", required: true, help: "branch the PR is on" },
+                BUDGET_FLAG,
+                INTERVAL_FLAG,
+                {
+                    name: "result",
+                    type: "string",
+                    required: true,
+                    help: "what the polls saw: none | pending | success | failure | provider-error",
+                },
+                { name: "polls", type: "string", required: true, help: "polls this batch ran (>= 1)" },
+            ],
+            output: {
+                phase: "poll | repoll (repoll once the re-trigger is receipt-completed)",
+                attempts: "cumulative polls for this target",
+                errors: "cumulative provider-error polls for this target",
+                nextAction: "poll-again | retrigger | reconcile-retrigger | verdict",
+                outcome: "dispatched | self-healed | no-ci | unresolved (nextAction verdict only)",
+                reason: "unresolved reason: gh-error | retrigger-suppressed | ci-declared-no-run",
+                ciResult: "the result this batch recorded",
+                stale: "persisted rows for another repo, PR, head or branch, not counted",
+            },
+            run: runHandoff,
+        },
         dispatch: {
-            summary: "CI-Dispatch Gate after the last push: poll, one clean re-trigger, the ciDispatch verdict, and the body scan. A run in place on dev has no PR: it polls the push-event run at the pushed sha, and its re-trigger commits and pushes only the run's own work.",
+            summary: "CI-Dispatch Gate after the last push: poll, one clean re-trigger, the ciDispatch verdict, and the body scan. A run in place on dev has no PR: it polls the push-event run at the pushed sha, and its re-trigger commits and pushes only the run's own work. With --invocation it resumes from the persisted `runs handoff` rows: attempts, errors and the re-trigger checkpoint are never supplied.",
             use: "workflow",
             flags: [
+                INVOCATION_FLAG,
                 {
                     name: "pr",
                     type: "string",
diff --git a/dist/ledgers/status.js b/dist/ledgers/status.js
index aa9cf0272..aac2ffbbc 100644
--- a/dist/ledgers/status.js
+++ b/dist/ledgers/status.js
@@ -72,6 +72,138 @@ export function ciSelectionIdentity(selection) {
             selection.headSha,
         ]);
 }
+export const CI_HANDOFF_RESULTS = [
+    "none",
+    "pending",
+    "success",
+    "failure",
+    "provider-error",
+];
+export const CI_RETRIGGER_STATES = [
+    "intended",
+    "commit-created",
+    "push-completed",
+    "receipt-completed",
+];
+const SHA_RE = /^(?:[0-9a-f]{40}|[0-9a-f]{64})$/;
+const REPO_RE = /^[A-Za-z0-9][A-Za-z0-9_.-]*\/[A-Za-z0-9][A-Za-z0-9_.-]*$/;
+const isRecord = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
+const isCount = (v) => Number.isSafeInteger(v) && Number(v) >= 0;
+const nonEmpty = (v) => typeof v === "string" && v.trim().length > 0;
+function validHandoffTarget(value) {
+    if (!isRecord(value))
+        return false;
+    return (value.provider === "github" &&
+        typeof value.repo === "string" &&
+        REPO_RE.test(value.repo) &&
+        (value.pr === null || (typeof value.pr === "string" && /^[1-9][0-9]*$/.test(value.pr))) &&
+        typeof value.head === "string" &&
+        SHA_RE.test(value.head) &&
+        nonEmpty(value.branch));
+}
+function validRetrigger(value) {
+    if (!isRecord(value))
+        return false;
+    const state = CI_RETRIGGER_STATES.find((s) => s === value.state);
+    if (state === undefined)
+        return false;
+    if (typeof value.original !== "string" || !SHA_RE.test(value.original))
+        return false;
+    const sha = (k) => typeof value[k] === "string" && SHA_RE.test(value[k]);
+    if (state === "intended")
+        return true;
+    if (!sha("commit"))
+        return false;
+    if (state === "commit-created")
+        return true;
+    if (!nonEmpty(value.ref) || !sha("remote"))
+        return false;
+    if (state === "push-completed")
+        return true;
+    return nonEmpty(value.receipt);
+}
+/** Validate one `ci-handoff` row before any reader treats it as evidence. */
+export function validateCiHandoffEvent(value) {
+    if (!isRecord(value) || value.type !== "ci-handoff")
+        return false;
+    if (!nonEmpty(value.workflow) || !nonEmpty(value.at))
+        return false;
+    if (value.phase !== "poll" && value.phase !== "repoll")
+        return false;
+    if (!validHandoffTarget(value.target))
+        return false;
+    const o = value.observation;
+    if (!isRecord(o))
+        return false;
+    if (!CI_HANDOFF_RESULTS.some((r) => r === o.result))
+        return false;
+    if (!isCount(o.attempts) || !isCount(o.errors) || o.errors > o.attempts)
+        return false;
+    if (value.retrigger !== undefined && !validRetrigger(value.retrigger))
+        return false;
+    return value.phase !== "repoll" || value.retrigger !== undefined;
+}
+/** Wording and transport do not change which target a handoff row is about. */
+export function ciHandoffIdentity(target) {
+    return JSON.stringify([
+        target.provider,
+        target.repo.toLowerCase(),
+        target.pr,
+        target.head,
+        target.branch,
+    ]);
+}
+/**
+ * The cumulative handoff state of one target: de-dupes, orders by `at`, counts rows for other
+ * targets as `stale` and rows whose cumulative counts go backwards as `invalid`.
+ */
+export function foldCiHandoff(rows, target) {
+    const seen = new Set();
+    const events = [];
+    for (const row of rows) {
+        if (!validateCiHandoffEvent(row))
+            continue;
+        const key = JSON.stringify(row);
+        if (seen.has(key))
+            continue;
+        seen.add(key);
+        events.push(row);
+    }
+    const ordered = events
+        .map((e, i) => ({ e, i }))
+        .sort((a, b) => (a.e.at < b.e.at ? -1 : a.e.at > b.e.at ? 1 : a.i - b.i))
+        .map((x) => x.e);
+    const want = ciHandoffIdentity(target);
+    const state = {
+        phase: "poll",
+        attempts: 0,
+        errors: 0,
+        last: null,
+        retrigger: null,
+        retriggerBase: null,
+        stale: 0,
+        invalid: 0,
+    };
+    for (const e of ordered) {
+        if (ciHandoffIdentity(e.target) !== want) {
+            state.stale += 1;
+            continue;
+        }
+        if (e.observation.attempts < state.attempts || e.observation.errors < state.errors) {
+            state.invalid += 1;
+            continue;
+        }
+        state.attempts = e.observation.attempts;
+        state.errors = e.observation.errors;
+        state.phase = e.phase;
+        state.last = { result: e.observation.result, at: e.at };
+        if (e.retrigger !== undefined) {
+            state.retriggerBase ??= { attempts: e.observation.attempts, errors: e.observation.errors };
+            state.retrigger = e.retrigger;
+        }
+    }
+    return state;
+}
 /** Validate the bounded CI evidence variant without relaxing local exit codes. */
 export function testRunProblem(value) {
     if (!value || typeof value !== "object")
@@ -355,6 +487,27 @@ export function recordAction(file, a) {
 /** The operations store, relative to a book root; `.bkit/*.jsonl` is allow-listed and unioned. */
 export const LEDGER_OPERATIONS_FILE = path.join(".bkit", "ledger-operations.jsonl");
 const ledgerOpKey = (operation) => actionKey("ledger-op", operation);
+/** The status rows of one bounded correction: a guaranteed no-write rejection, a corrected retry, its success. */
+export const CORRECTION_REJECTED_ROW = "correction-rejected";
+export const CORRECTION_CANDIDATE_ROW = "correction-candidate";
+export const CORRECTION_SUCCEEDED_ROW = "correction-succeeded";
+/**
+ * The stable scope one rejected sub-step's corrected retries share: derived from the run, step,
+ * task group and attempt, the ledger and the sub-step, never from an invocation or operation id,
+ * so a new tool call, helper or resume spends from the same budget.
+ */
+export function correctionScope(o) {
+    return [
+        "ledgers-append",
+        o.ledger,
+        o.substep,
+        o.workflow,
+        `run${o.run ?? 0}`,
+        o.step,
+        ...(o.group === null ? [] : [`group${o.group}`]),
+        ...(o.attempt === null ? [] : [`attempt${o.attempt}`]),
+    ].join(":");
+}
 /** Where `operation` stands in `file`: unseen, done with this request, or used for another. */
 export function ledgerOperation(file, operation, hash) {
     const known = engineActions(file)
