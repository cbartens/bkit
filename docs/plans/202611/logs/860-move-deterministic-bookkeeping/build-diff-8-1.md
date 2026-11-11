diff --git a/.agents/plugins/bkit/skills/bkit-plan/SKILL.md b/.agents/plugins/bkit/skills/bkit-plan/SKILL.md
index d45553c32..b7d03c7be 100644
--- a/.agents/plugins/bkit/skills/bkit-plan/SKILL.md
+++ b/.agents/plugins/bkit/skills/bkit-plan/SKILL.md
@@ -305,6 +305,7 @@ Before generating, ask the engine for this step's invocation id and keep the pri
      ```bash
      "{BKIT}" ledgers query --ledger=knowledge --status=ACTIVE --limit=500 > "docs/plans/{YYYYMM}/logs/{FID}/related-knowledge.md"
      ```
+   - **If** the saved output's `nextCursor` is not null → run the same command again with `--limit` set to the saved output's `total`, so `related-knowledge.md` holds every row and never a truncated page.
 2. Launch these subagents in parallel using `view_file` tool:
    - **Subagent:** Invoke `view_file` `.agents/plugins/bkit/agents/bkit-plan-review-1.md` using `view_file` tool:
      Context: You are a subagent in the Plan phase running in parallel with two other agents. Switch into the working directory with `cd "{WORKTREE_PATH}"`, check it with `pwd`, and use it for every file operation that follows. Plan caps (`bkit.workflows.tasks`): {MAX_TASKS_PER_GROUP} tasks and {MAX_TESTS_PER_GROUP} `TEST FIRST` tests per group; {MAX_TESTS_PER_TASK} tests across {MAX_TEST_FILES_PER_TASK} test files per task.
diff --git a/.agents/skills/bkit-plan/SKILL.md b/.agents/skills/bkit-plan/SKILL.md
index f1e891e19..f15a4b830 100644
--- a/.agents/skills/bkit-plan/SKILL.md
+++ b/.agents/skills/bkit-plan/SKILL.md
@@ -305,6 +305,7 @@ Before generating, ask the engine for this step's invocation id and keep the pri
      ```bash
      "{BKIT}" ledgers query --ledger=knowledge --status=ACTIVE --limit=500 > "docs/plans/{YYYYMM}/logs/{FID}/related-knowledge.md"
      ```
+   - **If** the saved output's `nextCursor` is not null → run the same command again with `--limit` set to the saved output's `total`, so `related-knowledge.md` holds every row and never a truncated page.
 2. Launch these subagents in parallel using `Agent` tool:
    - **Subagent:** Invoke `@bkit-plan-review-1` using `Agent` tool:
      Context: You are a subagent in the Plan phase running in parallel with two other agents. Switch into the working directory with `cd "{WORKTREE_PATH}"`, check it with `pwd`, and use it for every file operation that follows. Plan caps (`bkit.workflows.tasks`): {MAX_TASKS_PER_GROUP} tasks and {MAX_TESTS_PER_GROUP} `TEST FIRST` tests per group; {MAX_TESTS_PER_TASK} tests across {MAX_TEST_FILES_PER_TASK} test files per task.
diff --git a/.bkit/cli.md b/.bkit/cli.md
index 1348bbfb4..48e47efd8 100644
--- a/.bkit/cli.md
+++ b/.bkit/cli.md
@@ -48,7 +48,7 @@ CI check names come from `package.json` `bkit.testing.ciCapstone` (default `bkit
 
 No workflow file calls a script outside a `bkit` command; the slop plugin `bkit-slop-type-suppression.mjs` is a copy-and-own template (`scripts/slop/`). `bkit-cloud.yml` reads the debug limits from `package.json` with `jq` because its guards run before bkit is installed.
 
-**Bounded correction:** `bkit ledgers append --operation=<id>` is replay-safe; a guaranteed no-write rejection prints a structured error (effects = none, correctable = true) with a `scope`. The corrected candidate is `bkit ledgers append --correction-of=<rejected operation> --operation=<fresh id>`; `bkit counters correction` spends from the same two-retry budget per scope, and a replay of a counted operation spends nothing. `bkit ledgers query` reads a ledger's canonical winners without writing, so an agent checks state instead of guessing it. `bkit runs handoff` records CI poll observations so a re-entered `bkit runs dispatch --invocation=<id>` resumes from persisted rows, with no counter supplied. `bkit counters correction` works inside a workflow run only.
+**Bounded correction:** `bkit ledgers append --operation=<id>` is replay-safe; a guaranteed no-write rejection prints a structured error (effects = none, correctable = true) with a `scope`. The corrected candidate is `bkit ledgers append --correction-of=<rejected operation> --operation=<fresh id>`; `bkit counters correction` spends from the same two-retry budget per scope, and a replay of a counted operation spends nothing only for the same request: `--request-hash` carries the candidate's canonical hash (`ledgers append --correction-of` passes it itself), and the same id with other rows is refused. `bkit ledgers query` reads a ledger's canonical winners without writing, so an agent checks state instead of guessing it. `bkit runs handoff` records CI poll observations so a re-entered `bkit runs dispatch --invocation=<id>` resumes from persisted rows, with no counter supplied. `bkit counters correction` works inside a workflow run only.
 
 First install, upgrade and uninstall: `.bkit/install.md`. Upgrade prompt to paste into your AI: `.bkit/install.md` § Upgrade — already installed.
 
@@ -160,7 +160,7 @@ Attempt counters derived from status.jsonl, and the ask points' limits.
 | `run` | workflow | **`--file`** **`--workflow`** | Which run of the workflow this invocation is (1-based; a resume keeps its number). |
 | `route` | workflow | **`--name`** `--value` `--of` `--rows` `--file` `--workflow` `--group` `--all-runs` `--since-clean` `--max` `--point` `--continue` `--exceeded` | Compare a counter to its max: exit 0 continue, exit 1 exceeded; with --point, also whether to ask. |
 | `grant` | workflow | **`--name`** `--value` `--of` `--rows` `--file` `--workflow` `--group` `--all-runs` `--since-clean` **`--point`** | Give one loop one more full allowance after the owner chose to continue at its used-up limit: exit 0 granted, exit 1 not (below the limit, ask off or headless). |
-| `correction` | workflow | **`--file`** **`--workflow`** **`--scope`** **`--operation`** `--limit` | Spend one corrected retry of a rejected sub-step: exit 0 allowed (or a replay of a counted operation), exit 1 the scope's budget is used up. The budget is two per scope in the active run unless a stricter --limit names one. |
+| `correction` | workflow | **`--file`** **`--workflow`** **`--scope`** **`--operation`** `--request-hash` `--limit` | Spend one corrected retry of a rejected sub-step: exit 0 allowed (or a replay of a counted operation), exit 1 the scope's budget is used up. The budget is two per scope in the active run unless a stricter --limit names one. |
 | `max` | workflow | `--point` `--file` `--workflow` `--group` | The ask points' limits and ask settings: one by --point, or all. |
 | `progress` | workflow | **`--file`** **`--workflow`** **`--check`** **`--fix`** `--group` `--since-clean` | Progress report for a fix loop in the active run: counts per round, code change, strategy, trend. |
 | `rows` | workflow | **`--file`** **`--workflow`** **`--type`** **`--position`** | Count rows of one audit type in the active run (since its workflow-started row). |
@@ -358,7 +358,7 @@ Write a step's status row, finish a step in one call, read a verdict header, che
 | `finish` | workflow | **`--file`** **`--workflow`** **`--step`** `--artifact` `--optional-artifact` `--agent` `--verdict` `--allowed` `--failures` `--attempt` `--attempt-of` `--count-field` `--group` `--strategy` `--scope` `--field` `--clamp-log` `--docs-only` `--plan` `--parent-sha` `--commit` `--message` `--done-fallback` `--verbose-ci-local` `--number` `--title` `--post` `--group-count` `--link-ref` `--tree` `--owner-repo` `--comment-body` `--comment-field` | End a step: read the verdict header(s), derive the attempt, check the gate, write the row, commit, print the tracker comment. |
 | `verdict` | by hand | **`--file`** `--agent` `--allowed` `--field` `--result-file` | Read an artifact's header down to <!-- verdict:end -->. |
 | `gate` | workflow | `--file` `--ref` **`--workflow`** **`--step`** `--group` `--progress-number` `--attempt` `--attempt-of` `--artifact` `--verdict-required` `--agent` `--allowed` `--placeholder` `--fid` `--issue` `--month` `--token` | Mechanical gate checks for one step: placeholders, FID, lock, artifacts, verdict, status row (with its attempt / strategy / scope where the step writes them). |
-| `stub` | workflow | `--from` **`--to`** `--agent` `--result-file` `--strip-header` | Seed a versioned artifact: copy the prior version, then put a PENDING verdict header on top. |
+| `stub` | workflow | `--from` **`--to`** `--agent` `--result-file` `--invocation` `--strip-header` | Seed a versioned artifact: copy the prior version, then put a PENDING verdict header on top. |
 
 ### `tasks`
 
diff --git a/.bkit/core/.bkit/cli.md b/.bkit/core/.bkit/cli.md
index c5ca71088..47663bce0 100644
--- a/.bkit/core/.bkit/cli.md
+++ b/.bkit/core/.bkit/cli.md
@@ -48,7 +48,7 @@ CI check names come from `package.json` `bkit.testing.ciCapstone` (default `bkit
 
 No workflow file calls a script outside a `bkit` command; the slop plugin `bkit-slop-type-suppression.mjs` is a copy-and-own template (`scripts/slop/`). `bkit-cloud.yml` reads the debug limits from `package.json` with `jq` because its guards run before bkit is installed.
 
-**Bounded correction:** `bkit ledgers append --operation=<id>` is replay-safe; a guaranteed no-write rejection prints a structured error (effects = none, correctable = true) with a `scope`. The corrected candidate is `bkit ledgers append --correction-of=<rejected operation> --operation=<fresh id>`; `bkit counters correction` spends from the same two-retry budget per scope, and a replay of a counted operation spends nothing. `bkit ledgers query` reads a ledger's canonical winners without writing, so an agent checks state instead of guessing it. `bkit runs handoff` records CI poll observations so a re-entered `bkit runs dispatch --invocation=<id>` resumes from persisted rows, with no counter supplied. `bkit counters correction` works inside a workflow run only.
+**Bounded correction:** `bkit ledgers append --operation=<id>` is replay-safe; a guaranteed no-write rejection prints a structured error (effects = none, correctable = true) with a `scope`. The corrected candidate is `bkit ledgers append --correction-of=<rejected operation> --operation=<fresh id>`; `bkit counters correction` spends from the same two-retry budget per scope, and a replay of a counted operation spends nothing only for the same request: `--request-hash` carries the candidate's canonical hash (`ledgers append --correction-of` passes it itself), and the same id with other rows is refused. `bkit ledgers query` reads a ledger's canonical winners without writing, so an agent checks state instead of guessing it. `bkit runs handoff` records CI poll observations so a re-entered `bkit runs dispatch --invocation=<id>` resumes from persisted rows, with no counter supplied. `bkit counters correction` works inside a workflow run only.
 
 First install, upgrade and uninstall: `.bkit/install.md`. Upgrade prompt to paste into your AI: `.bkit/install.md` § Upgrade — already installed.
 
@@ -160,7 +160,7 @@ Attempt counters derived from status.jsonl, and the ask points' limits.
 | `run` | workflow | **`--file`** **`--workflow`** | Which run of the workflow this invocation is (1-based; a resume keeps its number). |
 | `route` | workflow | **`--name`** `--value` `--of` `--rows` `--file` `--workflow` `--group` `--all-runs` `--since-clean` `--max` `--point` `--continue` `--exceeded` | Compare a counter to its max: exit 0 continue, exit 1 exceeded; with --point, also whether to ask. |
 | `grant` | workflow | **`--name`** `--value` `--of` `--rows` `--file` `--workflow` `--group` `--all-runs` `--since-clean` **`--point`** | Give one loop one more full allowance after the owner chose to continue at its used-up limit: exit 0 granted, exit 1 not (below the limit, ask off or headless). |
-| `correction` | workflow | **`--file`** **`--workflow`** **`--scope`** **`--operation`** `--limit` | Spend one corrected retry of a rejected sub-step: exit 0 allowed (or a replay of a counted operation), exit 1 the scope's budget is used up. The budget is two per scope in the active run unless a stricter --limit names one. |
+| `correction` | workflow | **`--file`** **`--workflow`** **`--scope`** **`--operation`** `--request-hash` `--limit` | Spend one corrected retry of a rejected sub-step: exit 0 allowed (or a replay of a counted operation), exit 1 the scope's budget is used up. The budget is two per scope in the active run unless a stricter --limit names one. |
 | `max` | workflow | `--point` `--file` `--workflow` `--group` | The ask points' limits and ask settings: one by --point, or all. |
 | `progress` | workflow | **`--file`** **`--workflow`** **`--check`** **`--fix`** `--group` `--since-clean` | Progress report for a fix loop in the active run: counts per round, code change, strategy, trend. |
 | `rows` | workflow | **`--file`** **`--workflow`** **`--type`** **`--position`** | Count rows of one audit type in the active run (since its workflow-started row). |
@@ -358,7 +358,7 @@ Write a step's status row, finish a step in one call, read a verdict header, che
 | `finish` | workflow | **`--file`** **`--workflow`** **`--step`** `--artifact` `--optional-artifact` `--agent` `--verdict` `--allowed` `--failures` `--attempt` `--attempt-of` `--count-field` `--group` `--strategy` `--scope` `--field` `--clamp-log` `--docs-only` `--plan` `--parent-sha` `--commit` `--message` `--done-fallback` `--verbose-ci-local` `--number` `--title` `--post` `--group-count` `--link-ref` `--tree` `--owner-repo` `--comment-body` `--comment-field` | End a step: read the verdict header(s), derive the attempt, check the gate, write the row, commit, print the tracker comment. |
 | `verdict` | by hand | **`--file`** `--agent` `--allowed` `--field` `--result-file` | Read an artifact's header down to <!-- verdict:end -->. |
 | `gate` | workflow | `--file` `--ref` **`--workflow`** **`--step`** `--group` `--progress-number` `--attempt` `--attempt-of` `--artifact` `--verdict-required` `--agent` `--allowed` `--placeholder` `--fid` `--issue` `--month` `--token` | Mechanical gate checks for one step: placeholders, FID, lock, artifacts, verdict, status row (with its attempt / strategy / scope where the step writes them). |
-| `stub` | workflow | `--from` **`--to`** `--agent` `--result-file` `--strip-header` | Seed a versioned artifact: copy the prior version, then put a PENDING verdict header on top. |
+| `stub` | workflow | `--from` **`--to`** `--agent` `--result-file` `--invocation` `--strip-header` | Seed a versioned artifact: copy the prior version, then put a PENDING verdict header on top. |
 
 ### `tasks`
 
diff --git a/.bkit/core/.bkit/jsonl.md b/.bkit/core/.bkit/jsonl.md
index 8d7d67420..8adefe9c1 100644
--- a/.bkit/core/.bkit/jsonl.md
+++ b/.bkit/core/.bkit/jsonl.md
@@ -397,7 +397,7 @@ These are rows in a run's `status.jsonl`; the status fold ignores types it does
 | --- | --- | --- |
 | `ci-handoff` | `bkit runs handoff`, `bkit runs dispatch --invocation` | the target (`provider`, `repo`, `pr`, `head`, `branch`), the cumulative observation (`result`, `attempts`, `errors`) and an optional re-trigger checkpoint `intended`, `commit-created`, `push-completed` or `receipt-completed` (the receipt) |
 | `correction-rejected` | `bkit ledgers append --correction-of` | the rejected `operation`, the `scope` and the engine's rejection code |
-| `correction-candidate` | `bkit counters correction` | the candidate `operation` that spent one retry in the `scope` |
+| `correction-candidate` | `bkit counters correction` | the candidate `operation` that spent one retry in the `scope`, and its `requestHash` |
 | `correction-succeeded` | `bkit ledgers append --correction-of` | the verified `operation` and the `scope` it closed |
 
 - **Phase and totals** are derived by the engine from these rows; a caller never supplies an attempt count.
diff --git a/.bkit/core/engine/commands/lib.ts b/.bkit/core/engine/commands/lib.ts
index 004e81dd5..340d5fe6e 100644
--- a/.bkit/core/engine/commands/lib.ts
+++ b/.bkit/core/engine/commands/lib.ts
@@ -145,6 +145,11 @@ export interface FlagSpec {
    * cannot rewrite.
    */
   positional?: boolean;
+  /**
+   * For `--invocation` only: the verb compares the id itself, so the dispatcher does not
+   * resolve it as an issued invocation (it may name one this checkout never issued).
+   */
+  unresolved?: boolean;
   help: string;
 }
 
@@ -898,7 +903,7 @@ export async function runCommand(
     const invocationId = ctx.flags["invocation"];
     if (
       typeof invocationId === "string" &&
-      spec.flags.some((f) => f.name === INVOCATION_FLAG.name)
+      spec.flags.some((f) => f.name === INVOCATION_FLAG.name && f.unresolved !== true)
     ) {
       ctx.invocation = resolveInvocation(ctx.cwd, invocationId, ctx.flags);
     }
diff --git a/.bkit/core/engine/commands/workflow/counters.test.ts b/.bkit/core/engine/commands/workflow/counters.test.ts
index 90440d6c1..d06869716 100644
--- a/.bkit/core/engine/commands/workflow/counters.test.ts
+++ b/.bkit/core/engine/commands/workflow/counters.test.ts
@@ -1158,4 +1158,36 @@ describe("bkit counters correction", () => {
     expect(none.code).toBe(1);
     expect(none.json).toMatchObject({ allowed: false, used: 0, limit: 0 });
   });
+
+  it("refuses a reused correction candidate id with different rows", async () => {
+    const file = log([started("plan", "2026-11-01T00:00:00Z")]);
+    const scope = "ledgers-append:failures:append";
+    const withRows = (operation: string, hash: string) =>
+      correct(file, scope, operation, `--request-hash=${hash}`);
+
+    // The first candidate under op-b is spent once.
+    const first = await withRows("op-b", "hash-1");
+    expect(first.code).toBe(0);
+    expect(first.json).toMatchObject({ allowed: true, used: 1, limit: 2, remaining: 1 });
+
+    // The same id with the same request is a free replay.
+    const replay = await withRows("op-b", "hash-1");
+    expect(replay.code).toBe(0);
+    expect(replay.json).toMatchObject({ allowed: true, used: 1, replayed: true });
+
+    // The same id carrying other rows is refused and writes nothing: it is no replay and no new spend.
+    const changed = await withRows("op-b", "hash-2");
+    expect(changed.code).toBe(1);
+    expect(changed.json).toMatchObject({ allowed: false });
+    expect(changed.json).not.toMatchObject({ replayed: true });
+    expect(candidates(file)).toHaveLength(1);
+
+    // Distinct requests under their own ids spend the budget, and the limit then holds.
+    const second = await withRows("op-c", "hash-3");
+    expect(second.json).toMatchObject({ allowed: true, used: 2, remaining: 0 });
+    const final = await withRows("op-d", "hash-4");
+    expect(final.code).toBe(1);
+    expect(final.json).toMatchObject({ allowed: false, used: 2, limit: 2, remaining: 0 });
+    expect(candidates(file)).toHaveLength(2);
+  });
 });
diff --git a/.bkit/core/engine/commands/workflow/counters.ts b/.bkit/core/engine/commands/workflow/counters.ts
index 878188238..2bf080526 100644
--- a/.bkit/core/engine/commands/workflow/counters.ts
+++ b/.bkit/core/engine/commands/workflow/counters.ts
@@ -191,6 +191,8 @@ export interface CorrectionSpend {
   remaining: number;
   /** The operation was already counted: nothing was spent. */
   replayed: boolean;
+  /** The operation was counted for another request: refused, nothing written. */
+  conflict?: boolean;
 }
 
 /**
@@ -211,14 +213,13 @@ export function spendCorrection(
   rows.forEach((r, i) => {
     if (r.type === "workflow-started" && r.workflow === workflow) start = i;
   });
-  const spent = new Set<string>(
-    rows
-      .slice(start + 1)
-      .filter(
-        (r) => r.type === CORRECTION_CANDIDATE_ROW && r.workflow === workflow && r.scope === scope,
-      )
-      .map((r) => String(r.operation)),
-  );
+  const counted = rows
+    .slice(start + 1)
+    .filter(
+      (r) => r.type === CORRECTION_CANDIDATE_ROW && r.workflow === workflow && r.scope === scope,
+    );
+  const spent = new Set<string>(counted.map((r) => String(r.operation)));
+  const asked = typeof extra.requestHash === "string" ? extra.requestHash : undefined;
   const verdict = (allowed: boolean, replayed: boolean): CorrectionSpend => ({
     allowed,
     used: spent.size,
@@ -226,7 +227,16 @@ export function spendCorrection(
     remaining: Math.max(0, limit - spent.size),
     replayed,
   });
-  if (spent.has(operation)) return verdict(true, true);
+  if (spent.has(operation)) {
+    // A known id is a free replay only for the request it was counted for.
+    const hashes = counted
+      .filter((r) => String(r.operation) === operation)
+      .map((r) => r.requestHash)
+      .filter((h): h is string => typeof h === "string");
+    if (asked !== undefined && hashes.length > 0 && !hashes.includes(asked))
+      return { ...verdict(false, false), conflict: true };
+    return verdict(true, true);
+  }
   if (spent.size >= limit) return verdict(false, false);
   fs.appendFileSync(
     file,
@@ -668,6 +678,11 @@ export const countersCommand: CommandSpec = {
           required: true,
           help: "the corrected candidate's fresh operation id",
         },
+        {
+          name: "request-hash",
+          type: "string",
+          help: "the candidate's canonical request hash: a known operation replays free only for the same hash, and a different one is refused",
+        },
         {
           name: "limit",
           type: "string",
@@ -691,6 +706,9 @@ export const countersCommand: CommandSpec = {
           String(ctx.flags.scope),
           String(ctx.flags.operation),
           wholeNumber(ctx.flags.limit, "limit", CORRECTION_LIMIT),
+          str(ctx.flags.requestHash) === undefined
+            ? {}
+            : { requestHash: str(ctx.flags.requestHash) },
         );
         ctx.emit({ ...spend });
         return spend.allowed ? EXIT.OK : EXIT.NO;
diff --git a/.bkit/core/engine/commands/workflow/ledgers.test.ts b/.bkit/core/engine/commands/workflow/ledgers.test.ts
index 5eb55cbf0..fd4a80cb0 100644
--- a/.bkit/core/engine/commands/workflow/ledgers.test.ts
+++ b/.bkit/core/engine/commands/workflow/ledgers.test.ts
@@ -2168,6 +2168,29 @@ describe("bkit ledgers query", () => {
     await q(r, "--key=k1");
     expect(fs.readFileSync(path.join(r, FILE), "utf-8")).toBe(bytes);
   });
+
+  it("marks a page with a next cursor as not clean", async () => {
+    const r = repo();
+    put(r, FILE, `${dec("k1", 1001, "ACTIVE")}\n${dec("k2", 1002, "ACTIVE")}\n`);
+
+    // A page that stops before the last winner is an unfinished scan, whatever the ledger holds.
+    const partial = await q(r, "--limit=1");
+    expect(partial.code).toBe(0);
+    expect(partial.json.rows).toHaveLength(1);
+    expect(partial.json.nextCursor).not.toBeNull();
+    expect(partial.json.coverage.clean).toBe(false);
+    expect(partial.json.coverage.status).not.toBe("clean");
+
+    // The last page of the same clean ledger finishes the scan.
+    const last = await q(r, "--limit=1", `--cursor=${partial.json.nextCursor}`);
+    expect(last.json.nextCursor).toBeNull();
+    expect(last.json.coverage).toMatchObject({ clean: true });
+
+    // One page that holds every winner is clean.
+    const whole = await q(r, "--limit=5");
+    expect(whole.json.nextCursor).toBeNull();
+    expect(whole.json.coverage).toMatchObject({ clean: true, status: "clean" });
+  });
 });
 
 describe("bkit ledgers append --operation", () => {
diff --git a/.bkit/core/engine/commands/workflow/ledgers.ts b/.bkit/core/engine/commands/workflow/ledgers.ts
index 41ab6672c..7ab313fc2 100644
--- a/.bkit/core/engine/commands/workflow/ledgers.ts
+++ b/.bkit/core/engine/commands/workflow/ledgers.ts
@@ -909,7 +909,7 @@ export const ledgersCommand: CommandSpec = {
         total: "winners that pass the filter, across all pages",
         diagnostics: "each unreadable line: {line, reason}; on every page",
         coverage:
-          "{status: complete|partial|missing|unreadable, clean, malformedLines, lines}; clean is true only for a complete scan with no unreadable line",
+          "{status: clean|incomplete|partial|missing|unreadable, clean, malformedLines, lines}; clean is true only for a finished scan (nextCursor null) with no unreadable line, so a page with a nextCursor is incomplete",
       },
       run: (ctx) => query(ctx),
     },
@@ -1750,6 +1750,14 @@ export function appendLedgerRows(
             options.checkpoint?.("receipted");
             return result(intent, intent.block, true);
           }
+          // Whole lines decide "landed": rows share a byte prefix (`{"schema":3,"ts":...`), so a
+          // foreign row is told apart by being a complete line that differs from ours.
+          const wantNl = want.indexOf(0x0a);
+          const wantFirst = wantNl < 0 ? want : want.subarray(0, wantNl + 1);
+          const tail = have.subarray(intent.offset);
+          const haveNl = tail.indexOf(0x0a);
+          const haveFirst = haveNl < 0 ? tail : tail.subarray(0, haveNl + 1);
+          const foreignWholeLine = haveNl >= 0 && !haveFirst.equals(wantFirst);
           let landedBytes = 0;
           while (
             landedBytes < seg.length &&
@@ -1757,7 +1765,10 @@ export function appendLedgerRows(
             seg[landedBytes] === want[landedBytes]
           )
             landedBytes++;
-          if (landedBytes > 0 || (seg.length > 0 && have.length === intent.offset + seg.length))
+          if (
+            !foreignWholeLine &&
+            (landedBytes > 0 || (seg.length > 0 && have.length === intent.offset + seg.length))
+          )
             throw new UncertainEffect(
               EXIT_STAGE,
               `operation ${operation}: ${file} holds ${landedBytes} of ${want.length} prepared bytes at the recorded offset; the effect is uncertain, nothing was truncated or retried`,
@@ -1864,11 +1875,14 @@ function append(ctx: RunContext): number {
       of: correctionOf,
       step: book.step,
       substep: "append",
+      requestHash: actionHash(canonicalJson({ ledger, rows: parsed.value })),
     });
     if (!spend.allowed)
       throw new CorrectionExhausted(
         EXIT.NO,
-        `the correction budget of ${scope} is spent (${spend.used} of ${spend.limit}); nothing was written`,
+        spend.conflict === true
+          ? `operation ${operation} was already counted as a correction of ${scope} for different rows; a changed candidate needs a fresh operation id and spends the budget (${spend.used} of ${spend.limit}); nothing was written`
+          : `the correction budget of ${scope} is spent (${spend.used} of ${spend.limit}); nothing was written`,
         scope,
       );
   }
@@ -1990,7 +2004,9 @@ function query(ctx: RunContext): number {
       ? "unreadable"
       : result.diagnostics.length > 0
         ? "partial"
-        : "complete";
+        : next !== null
+          ? "incomplete"
+          : "clean";
   ctx.emit({
     ledger,
     file,
@@ -2001,7 +2017,7 @@ function query(ctx: RunContext): number {
     diagnostics: result.diagnostics,
     coverage: {
       status,
-      clean: status === "complete",
+      clean: status === "clean",
       malformedLines: result.diagnostics.length,
       lines: result.lines,
       ...(!read.ok && !missing ? { error: read.error } : {}),
diff --git a/.bkit/core/engine/commands/workflow/runs.ts b/.bkit/core/engine/commands/workflow/runs.ts
index ba5a60ea3..41d5eda56 100644
--- a/.bkit/core/engine/commands/workflow/runs.ts
+++ b/.bkit/core/engine/commands/workflow/runs.ts
@@ -779,6 +779,8 @@ function landEmptyOwnCommits(
   fid: string,
   branch: string,
   log: (m: string) => void,
+  /** Called with the copy's SHA before it is pushed, so a lost push response is recoverable. */
+  onCopy?: (sha: string) => void,
 ): { kind: "landed"; sha: string } | { kind: "not-empty" } | { kind: "failed" } {
   const rec = readRecord(cwd, fid);
   if (rec === null || !runGit(cwd, ["fetch", "origin", branch]).ok) return { kind: "failed" };
@@ -789,10 +791,9 @@ function landEmptyOwnCommits(
   const pending = rec.commits.filter(
     (c) => !landed.has(c) && !runGit(cwd, ["merge-base", "--is-ancestor", c, tip]).ok,
   );
-  if (pending.length === 0) {
-    const sha = rec.pushed?.at(-1);
-    return sha === undefined ? { kind: "failed" } : { kind: "landed", sha };
-  }
+  // Every run commit is already on the remote, or was pushed as a copy with a SHA of its own:
+  // the remote tip is what holds them, never a recorded local original.
+  if (pending.length === 0) return { kind: "landed", sha: tip };
   const empty = (c: string) => {
     const tree = git(cwd, ["rev-parse", `${c}^{tree}`]);
     return tree !== null && tree === git(cwd, ["rev-parse", `${c}^^{tree}`]);
@@ -811,6 +812,7 @@ function landEmptyOwnCommits(
     if (!made.ok) return { kind: "failed" };
     parent = made.stdout;
   }
+  onCopy?.(parent);
   const pushed = runGit(cwd, ["push", "origin", `${parent}:refs/heads/${branch}`]);
   if (!pushed.ok) {
     log(`pushing the run's empty commits to ${branch} failed: ${pushed.stderr}`);
@@ -1115,7 +1117,24 @@ export async function ciDispatchGate(
         }
         remoteSha = remoteTip(o.cwd, branch) === cur.commit ? cur.commit : null;
       } else {
-        const empties = landEmptyOwnCommits(o.cwd, o.fid, branch, deps.log);
+        // A copy persisted by an earlier attempt may already be on the remote: the push
+        // response can be lost, so check before copying again.
+        const earlier = cur.copy;
+        const held =
+          earlier !== undefined &&
+          runGit(o.cwd, ["fetch", "origin", branch]).ok &&
+          runGit(o.cwd, ["merge-base", "--is-ancestor", earlier, `origin/${branch}`]).ok;
+        if (held) {
+          markRecordPushed(o.cwd, o.fid, [cur.commit]);
+          remoteSha = earlier;
+        }
+        const empties = held
+          ? ({ kind: "landed", sha: earlier } as const)
+          : landEmptyOwnCommits(o.cwd, o.fid, branch, deps.log, (copy) => {
+              cur = { ...cur, copy };
+              curRt = cur;
+              persist("poll", lastResult);
+            });
         if (empties.kind === "landed") remoteSha = empties.sha;
         else if (empties.kind === "failed") remoteSha = null;
         else {
diff --git a/.bkit/core/engine/commands/workflow/steps.test.ts b/.bkit/core/engine/commands/workflow/steps.test.ts
index 3e0573eb7..f84ac82ab 100644
--- a/.bkit/core/engine/commands/workflow/steps.test.ts
+++ b/.bkit/core/engine/commands/workflow/steps.test.ts
@@ -2555,6 +2555,24 @@ describe("bkit steps stub --result-file", () => {
     expect(fs.existsSync(path.join(cwd, "logs/c.md"))).toBe(false);
   });
 
+  it("refuses a result file left from an earlier round", async () => {
+    const cwd = repo();
+    const agent = "bkit-build-challenge-1";
+    // Round 1's subagent wrote this result, carrying the invocation it ran under.
+    resultFile(cwd, "logs/build-challenge-1-result.json", {
+      findings: [finding(1)],
+      invocation: "inv-round-1",
+    });
+    // Round 2 launched under another invocation and its subagent died before writing a result.
+    const res = await run(cwd, [
+      ...stubArgs(agent, "logs/build-challenge-1-result.json", "logs/challenge-2.md"),
+      "--invocation=inv-round-2",
+    ]);
+    expect(res.code).toBe(6);
+    expect(res.err).toMatch(/invocation|round|earlier|stale/i);
+    expect(fs.existsSync(path.join(cwd, "logs/challenge-2.md"))).toBe(false);
+  });
+
   it("audit result render keeps an existing anchored report intact", async () => {
     const cwd = repo();
     const report = [
diff --git a/.bkit/core/engine/commands/workflow/steps.ts b/.bkit/core/engine/commands/workflow/steps.ts
index b357e095d..fcc25cc08 100644
--- a/.bkit/core/engine/commands/workflow/steps.ts
+++ b/.bkit/core/engine/commands/workflow/steps.ts
@@ -2295,6 +2295,12 @@ export const stepsCommand: CommandSpec = {
           type: "string",
           help: "render the artifact from this structured result JSON {findings, judgments, body, evidenceComplete} (audit: the audit result) instead of copying --from",
         },
+        {
+          name: "invocation",
+          type: "string",
+          unresolved: true,
+          help: "with --result-file: the invocation id this step runs under; a result that names another invocation is stale and refused (exit 6, nothing written)",
+        },
         {
           name: "strip-header",
           type: "boolean",
@@ -2324,11 +2330,19 @@ export const stepsCommand: CommandSpec = {
           if (ctx.flags.agent === undefined)
             throw new CommandError(EXIT.USAGE, "--result-file needs --agent");
           try {
-            const rendered = renderResult(
-              ctx.cwd,
-              String(ctx.flags.agent),
-              readResult(ctx.cwd, String(ctx.flags.resultFile)),
-            );
+            const result = readResult(ctx.cwd, String(ctx.flags.resultFile));
+            const issued = str(ctx.flags.invocation);
+            const carried =
+              typeof result === "object" && result !== null && !Array.isArray(result)
+                ? (result as Record<string, unknown>).invocation
+                : undefined;
+            // A result written under another invocation is left over from an earlier round or run.
+            if (issued !== undefined && carried !== undefined && carried !== issued)
+              throw new CommandError(
+                EXIT_INVALID,
+                `result: ${String(ctx.flags.resultFile)} was written under invocation ${String(carried)}, not ${issued}; it is a stale result from an earlier round or run (nothing written)`,
+              );
+            const rendered = renderResult(ctx.cwd, String(ctx.flags.agent), result);
             const requested = path.resolve(ctx.cwd, String(ctx.flags.to));
             // An audit's --to is the finished report; the summary never replaces it.
             const keepsReport =
diff --git a/.bkit/core/engine/install/modules/core.integration.test.ts b/.bkit/core/engine/install/modules/core.integration.test.ts
index cc40854b5..90386b6b8 100644
--- a/.bkit/core/engine/install/modules/core.integration.test.ts
+++ b/.bkit/core/engine/install/modules/core.integration.test.ts
@@ -2656,7 +2656,7 @@ describe("deterministic bookkeeping contracts in a fresh consumer", { timeout: 1
     // The canonical read agrees with the append: one winner, a complete scan.
     const queried = bkit(dir, "ledgers", "query", `--root=${dir}`, "--ledger=knowledge");
     expect(queried.json!["rows"]).toHaveLength(1);
-    expect(queried.json!["coverage"]).toMatchObject({ status: "complete", clean: true });
+    expect(queried.json!["coverage"]).toMatchObject({ status: "clean", clean: true });
     // Resume with a new process and a new invocation: the correction budget and CI totals carry on.
     const scope = (corrected.json!["correction"] as { scope: string }).scope;
     const counter = bkit(
diff --git a/.bkit/core/engine/ledgers/journal.integration.test.ts b/.bkit/core/engine/ledgers/journal.integration.test.ts
index aeb37b65c..a4141f9b3 100644
--- a/.bkit/core/engine/ledgers/journal.integration.test.ts
+++ b/.bkit/core/engine/ledgers/journal.integration.test.ts
@@ -20,7 +20,7 @@ import {
   type CommandSpec,
   type GhResult,
 } from "../commands/lib";
-import { ledgerOperationsFile } from "./status";
+import { ledgerOperationsFile, pendingLedgerIntents } from "./status";
 import { COMMANDS } from "../commands/registry";
 import { branchesCommand } from "../commands/workflow/branches";
 import {
@@ -546,7 +546,7 @@ describe("canonical ledger reads on real files", () => {
     fs.writeFileSync(file, `${dec("a")}\n${dec("b")}\n`);
     const clean = await query();
     expect(clean.json!["diagnostics"]).toEqual([]);
-    expect(clean.json!["coverage"]).toMatchObject({ status: "complete", clean: true });
+    expect(clean.json!["coverage"]).toMatchObject({ status: "clean", clean: true });
 
     // Reads wrote nothing beyond the ledger fixture this test itself created.
     fs.rmSync(file);
@@ -1003,6 +1003,41 @@ describe("replay-safe ledger appends on real files", () => {
     expect(after).toBe(before);
     expect(after.split('"key":"first-landed"')).toHaveLength(2);
   });
+
+  it("prepares afresh when nothing landed and a foreign row followed", () => {
+    const root = bookRoot();
+    const file = path.join(root, "docs", "failures.jsonl");
+    const request = [failureRow({ key: "ours-never-landed" })];
+    expect(() =>
+      appendLedgerRows(root, "failures", request, undefined, {
+        operation: "op-nothing-landed",
+        checkpoint: failAt("prepared"),
+      }),
+    ).toThrow();
+    expect(fs.existsSync(file)).toBe(false);
+
+    // Nothing of ours landed. Another writer's schema-3 row takes the recorded offset.
+    appendLedgerRows(root, "failures", [failureRow({ key: "foreign-writer" })]);
+    const foreign = fs.readFileSync(file, "utf-8");
+
+    const replay = appendLedgerRows(root, "failures", request, undefined, {
+      operation: "op-nothing-landed",
+    });
+    expect(replay.appended).toBe(1);
+    const written = rows(file);
+    expect(written.map((r) => r["key"])).toEqual(["foreign-writer", "ours-never-landed"]);
+    expect(fs.readFileSync(file, "utf-8").startsWith(foreign)).toBe(true);
+    expect(replay.receipt).toMatchObject({ operation: "op-nothing-landed", replayed: false });
+
+    // The operation is settled: a further replay is a pure read and no intent stays pending.
+    const bytes = fs.readFileSync(file, "utf-8");
+    const again = appendLedgerRows(root, "failures", request, undefined, {
+      operation: "op-nothing-landed",
+    });
+    expect(again.appended).toBe(0);
+    expect(fs.readFileSync(file, "utf-8")).toBe(bytes);
+    expect(pendingLedgerIntents(ledgerOperationsFile(root)!, "docs/failures.jsonl")).toEqual([]);
+  });
 });
 
 describe("persistent CI handoff on a real local remote", () => {
@@ -1279,6 +1314,51 @@ describe("persistent CI handoff on a real local remote", () => {
       ),
     ).toHaveLength(0);
   });
+
+  it("does not push a second re-trigger copy after a lost push response on a shared branch", async () => {
+    const shared = remoteRepo("dev", true);
+    await expect(
+      ciDispatchGate(options(shared, { checkpoint: crashAt("push-completed") }), {
+        gh: pollingGh(none(30)).gh,
+        ...quiet(),
+      }),
+    ).rejects.toThrow("process lost at push-completed");
+    // The copy is on the bare remote.
+    expect(shared.retriggers()).toBe(1);
+    const copy = shared.tip();
+
+    // The push response was lost: nothing after the push persisted. Put the handoff row back to
+    // its state before `push-completed` and unmark the shared-checkout record.
+    const lines = fs
+      .readFileSync(shared.status, "utf-8")
+      .split("\n")
+      .filter((l) => l !== "");
+    const handoffAt = lines
+      .map((l, i) => ({ type: (JSON.parse(l) as Record<string, unknown>)["type"], i }))
+      .filter((r) => r.type === "ci-handoff");
+    const at = handoffAt.at(-1)!.i;
+    const last = JSON.parse(lines[at]!) as { retrigger: Record<string, unknown> };
+    expect(last.retrigger["state"]).toBe("push-completed");
+    const { remote: _remote, ref: _ref, ...rest } = last.retrigger;
+    lines[at] = JSON.stringify({ ...last, retrigger: { ...rest, state: "commit-created" } });
+    fs.writeFileSync(shared.status, `${lines.join("\n")}\n`);
+    const rec = readRecord(shared.work, "1-x")!;
+    const { pushed: _pushed, ...unmarked } = rec;
+    writeRecord(shared.work, unmarked);
+
+    const resumedGh = pollingGh([FOUND]);
+    const resumed = await ciDispatchGate(options(shared), { gh: resumedGh.gh, ...quiet() });
+    expect(resumed.ciDispatch).toMatchObject({ outcome: "self-healed", retrigger: true });
+    // No second copy was pushed; the remote still ends at the one copy.
+    expect(shared.retriggers()).toBe(1);
+    expect(shared.tip()).toBe(copy);
+    const remoteSha = (handoffRows(shared).at(-1)!["retrigger"] as { remote?: string }).remote;
+    expect(remoteSha).toBe(copy);
+    expect(git(shared.remote, ["cat-file", "-t", remoteSha!])).toBe("commit");
+    expect(handoffRows(shared).at(-1)).toMatchObject({
+      retrigger: { state: "receipt-completed", remote: copy },
+    });
+  });
 });
 
 describe("bounded correction on real ledgers", () => {
diff --git a/.bkit/core/engine/ledgers/status.ts b/.bkit/core/engine/ledgers/status.ts
index c1c918885..a4562d27c 100644
--- a/.bkit/core/engine/ledgers/status.ts
+++ b/.bkit/core/engine/ledgers/status.ts
@@ -125,6 +125,8 @@ export type CiHandoffRetrigger = {
   state: CiRetriggerState;
   original: string;
   commit?: string;
+  /** Shared branch: the copy of `commit` made for the remote tip, persisted before it is pushed. */
+  copy?: string;
   ref?: string;
   remote?: string;
   receipt?: string;
@@ -179,6 +181,7 @@ function validRetrigger(value: unknown): value is CiHandoffRetrigger {
   if (state === undefined) return false;
   if (typeof value.original !== "string" || !SHA_RE.test(value.original)) return false;
   const sha = (k: string) => typeof value[k] === "string" && SHA_RE.test(value[k]);
+  if (value.copy !== undefined && !sha("copy")) return false;
   if (state === "intended") return true;
   if (!sha("commit")) return false;
   if (state === "commit-created") return true;
diff --git a/.bkit/core/engine/render/__snapshots__/bkit-plan.none.txt b/.bkit/core/engine/render/__snapshots__/bkit-plan.none.txt
index ebc0dcae6..af7e6e6f3 100644
--- a/.bkit/core/engine/render/__snapshots__/bkit-plan.none.txt
+++ b/.bkit/core/engine/render/__snapshots__/bkit-plan.none.txt
@@ -260,6 +260,7 @@ Before generating, ask the engine for this step's invocation id and keep the pri
      ```bash
      "{BKIT}" ledgers query --ledger=knowledge --status=ACTIVE --limit=500 > "docs/plans/{YYYYMM}/logs/{FID}/related-knowledge.md"
      ```
+   - **If** the saved output's `nextCursor` is not null → run the same command again with `--limit` set to the saved output's `total`, so `related-knowledge.md` holds every row and never a truncated page.
 2. Launch these subagents in parallel using `Agent` tool:
    - **Subagent:** Invoke `@bkit-plan-review-1` using `Agent` tool:
      Context: You are a subagent in the Plan phase running in parallel with two other agents. Switch into the working directory with `cd "{WORKTREE_PATH}"`, check it with `pwd`, and use it for every file operation that follows. Plan caps (`bkit.workflows.tasks`): {MAX_TASKS_PER_GROUP} tasks and {MAX_TESTS_PER_GROUP} `TEST FIRST` tests per group; {MAX_TESTS_PER_TASK} tests across {MAX_TEST_FILES_PER_TASK} test files per task.
diff --git a/.bkit/core/workflows/bkit-plan.md b/.bkit/core/workflows/bkit-plan.md
index 370b78acd..3db0c9f10 100644
--- a/.bkit/core/workflows/bkit-plan.md
+++ b/.bkit/core/workflows/bkit-plan.md
@@ -361,6 +361,7 @@ Before generating, ask the engine for this step's invocation id and keep the pri
      ```bash
      "{BKIT}" ledgers query --ledger=knowledge --status=ACTIVE --limit=500 > "docs/plans/{YYYYMM}/logs/{FID}/related-knowledge.md"
      ```
+   - **If** the saved output's `nextCursor` is not null → run the same command again with `--limit` set to the saved output's `total`, so `related-knowledge.md` holds every row and never a truncated page.
 2. Launch these subagents in parallel using `Agent` tool:
    - **Subagent:** Invoke `@bkit-plan-review-1` using `Agent` tool:
      Context: You are a subagent in the Plan phase running in parallel with two other agents. Switch into the working directory with `cd "{WORKTREE_PATH}"`, check it with `pwd`, and use it for every file operation that follows. Plan caps (`bkit.workflows.tasks`): {MAX_TASKS_PER_GROUP} tasks and {MAX_TESTS_PER_GROUP} `TEST FIRST` tests per group; {MAX_TESTS_PER_TASK} tests across {MAX_TEST_FILES_PER_TASK} test files per task.
diff --git a/.bkit/instructions.md b/.bkit/instructions.md
index 5fec78778..ee203c500 100644
--- a/.bkit/instructions.md
+++ b/.bkit/instructions.md
@@ -10519,6 +10519,7 @@ Check that the latest review did not fail:
 **If** `verdict` = FAIL → Step 5. Step 6 applied that review, so the applied plan gets its one re-review.
 Latest review checked (`status route`)
 Save the active knowledge rows for the reviewers, who have no shell:
+**If** the saved output's `nextCursor` is not null → run the same command again with `--limit` set to the saved output's `total`, so `related-knowledge.md` holds every row and never a truncated page.
 ```
 
 #### bkit-ship
diff --git a/.bkit/jsonl.md b/.bkit/jsonl.md
index ac0a817f9..33b3cf2e8 100644
--- a/.bkit/jsonl.md
+++ b/.bkit/jsonl.md
@@ -397,7 +397,7 @@ These are rows in a run's `status.jsonl`; the status fold ignores types it does
 | --- | --- | --- |
 | `ci-handoff` | `bkit runs handoff`, `bkit runs dispatch --invocation` | the target (`provider`, `repo`, `pr`, `head`, `branch`), the cumulative observation (`result`, `attempts`, `errors`) and an optional re-trigger checkpoint `intended`, `commit-created`, `push-completed` or `receipt-completed` (the receipt) |
 | `correction-rejected` | `bkit ledgers append --correction-of` | the rejected `operation`, the `scope` and the engine's rejection code |
-| `correction-candidate` | `bkit counters correction` | the candidate `operation` that spent one retry in the `scope` |
+| `correction-candidate` | `bkit counters correction` | the candidate `operation` that spent one retry in the `scope`, and its `requestHash` |
 | `correction-succeeded` | `bkit ledgers append --correction-of` | the verified `operation` and the `scope` it closed |
 
 - **Phase and totals** are derived by the engine from these rows; a caller never supplies an attempt count.
diff --git a/.bkit/version b/.bkit/version
index 2d4c9208b..ef43595eb 100644
--- a/.bkit/version
+++ b/.bkit/version
@@ -27,7 +27,7 @@
     ".claude/commands/bkit-build.md": "426b8f62cea33cd90be59ea7d9c1caf21d211bb0a4d3fe80fed58c5e3b9e745d",
     ".claude/commands/bkit-debug.md": "c376e4a25d8682a9ce07b97b3493d199b33d7e7b9c7cb71cf695f9a2a9860c44",
     ".claude/commands/bkit-design.md": "594293945816f777094ac13d9133111eef25e09c044a5a67e8ba88f10d79316c",
-    ".claude/commands/bkit-plan.md": "53c716511317613f965908bb6c74ee69ec0ca1554490cb0bb3be2c953645503a",
+    ".claude/commands/bkit-plan.md": "9ab1a5a8c910ef9f920c9f85e33c7303353c3d29553c41450f49efad7b02a791",
     ".claude/commands/bkit-ship.md": "cd8f450890114d8247f3d07935b685acb1fb835a629191f5a853c3b49cd0b789",
     ".claude/agents/bkit-build-challenge-1.md": "7c5ec0033b80ba0b158ef91c7c71f7d4ab7ffa9b3e00d2134b081c35fde1f24a",
     ".claude/agents/bkit-build-challenge-2.md": "4de5b379052cf5f4041f1f4486748e4c837d937a69b03ef2892b53fdfd38f983",
@@ -59,7 +59,7 @@
     ".cursor/commands/bkit-build.md": "32331dcd953f7a7fcae154d79107226037add5a5edd34e956e2da21dd3b1f348",
     ".cursor/commands/bkit-debug.md": "ee4f01ba8a3ab9825208d47de674043a34ffc4bdcacf88156584b8bd4b0491b8",
     ".cursor/commands/bkit-design.md": "c5944f5f27379d6ac2c707621f888b1652319b38695364cfc3c319bdfa47f47f",
-    ".cursor/commands/bkit-plan.md": "11e8b23f854a2855728ec31a6dcf02e39587c4aade3788a2762bb541cdbddc24",
+    ".cursor/commands/bkit-plan.md": "60f93e7ebe7edc4bfd76b700bca2d84c4fd6d46b5b71f6695b36592ddad0675f",
     ".cursor/commands/bkit-ship.md": "4d933c1fde88fe0bb05e50f50bc5f3d47fb633b6968519d927a677f556e2afa4",
     ".cursor/agents/bkit-build-challenge-1.md": "0c460827d301e085b733eacdbd6884ccdec073f4666e3c04cca1759b0ee66cd9",
     ".cursor/agents/bkit-build-challenge-2.md": "a3ac229579b34b36b3db97c899852825fe02804a7788cb438ac5f8859a555e10",
@@ -117,7 +117,7 @@
     ".opencode/commands/bkit-build.md": "fc656cb63ed698820cc8d1d31d122b3e3aac9256ef60943b1e7f9b5260bb9164",
     ".opencode/commands/bkit-debug.md": "46b9033c5d004ce033a867ec812a6634caac5d98c0f3310fbd85e00ccfe5ea06",
     ".opencode/commands/bkit-design.md": "5a95519825a50136f9611893e344f2f2072a6a6fbcf4f83e2c8643b4085d3898",
-    ".opencode/commands/bkit-plan.md": "d7b7b905ab12dd6d60a83b58a60cbea5a46d8a3ef9b87d5301ae77f58290b01a",
+    ".opencode/commands/bkit-plan.md": "6e0cc8e439b7603fd62b763c131e83a816a928d1a78dd52010aa14039e347359",
     ".opencode/commands/bkit-ship.md": "24a590509e227966ade90886488b0e038ae2a4e8df836f7517b56c966ef1f188",
     ".claude/agents/bkit-design-spike.md": "3bc27aa9f1c3f905093b875554ee54283abefda2bf32271016c66f98c656ab18",
     ".cursor/agents/bkit-design-spike.md": "5b8a175d7440dbb68e343a9cf3aab07db891d51465a42f6376d77fbc7850dc0a",
@@ -220,7 +220,7 @@
     ".bkit/cloud.md": "4b3fbcae7dcfdf991aa78774f4c487d3aff343b90fc27bbdf3f4aa492320dd4c",
     ".bkit/comparison.md": "48845a4c08abe236dcb5af4947db755a10aad06996a87c5d5b1bed07528514de",
     ".bkit/install.md": "e3b5b919f56548adec89507bf6d9ee28b1f45f2907d314bef57ded8b51ef51f3",
-    ".bkit/jsonl.md": "0522f2575e2b9f641aa064bada251c4d99c425fedd27bc89eed54343344e3b02",
+    ".bkit/jsonl.md": "46d5a251c224a324b8117f6402fafdda6ca457e66d0252781458cfc334d08e9c",
     ".bkit/providers.md": "e87503c7cc4d045997c30ea315f76438589abc9bcf038f63ce291ca85b8f1e1f",
     ".bkit/prompts.md": "2ca2ff0fc3e096f949c6ccb096441893876cf2e55907eabb3bf1c937e61f7257",
     ".bkit/trackers.md": "c3b91b7ffcf75333bc2d09af7c9d887397850539b87b964441025e8978f41803",
@@ -264,7 +264,7 @@
     ".codex/hooks/bkit-rules.cjs": "8aee2cde5448c083ae0dc07a4f1db86ce7e815a2a2eafe54b886b7f4393cab91",
     ".opencode/plugin/bkit-rules.js": "417d3ca107ebf005060953a17340620e1fcfb5bcdf491316a937e0c747b0377e",
     ".bkit/router.md": "c20d006757e350c173da94686d48500bc83e12d9f7bb6ff5911e47e332e45eab",
-    ".bkit/cli.md": "2efa67209194cde8309d913303a4d74c8166fcb634708c2e8001825b9609e222",
+    ".bkit/cli.md": "0785d17e2b262bb29a5435d54961c057d122d0b531e0b5a7a71781e15d01e294",
     ".claude/agents/bkit-build-plan-tests.md": "847282b9ef997b2c8f0688e042bc41274a5efdb23cd8266b36f6641e8091c8a1",
     ".cursor/agents/bkit-build-plan-tests.md": "0dc1e67d9415dfd3c2da251d9856474afbe384b80d619c39889557fcc55b09f2",
     ".opencode/agents/bkit-build-plan-tests.md": "31d4504be22e90dfa44520bc75eda4bf05f36015828bad9de9fc509d94ed2c52",
diff --git a/.claude/commands/bkit-plan.md b/.claude/commands/bkit-plan.md
index f9ecf1999..a180dcb7a 100644
--- a/.claude/commands/bkit-plan.md
+++ b/.claude/commands/bkit-plan.md
@@ -304,6 +304,7 @@ Before generating, ask the engine for this step's invocation id and keep the pri
      ```bash
      "{BKIT}" ledgers query --ledger=knowledge --status=ACTIVE --limit=500 > "docs/plans/{YYYYMM}/logs/{FID}/related-knowledge.md"
      ```
+   - **If** the saved output's `nextCursor` is not null → run the same command again with `--limit` set to the saved output's `total`, so `related-knowledge.md` holds every row and never a truncated page.
 2. Launch these subagents in parallel using `Agent` tool:
    - **Subagent:** Invoke `@bkit-plan-review-1` using `Agent` tool:
      Context: You are a subagent in the Plan phase running in parallel with two other agents. Switch into the working directory with `cd "{WORKTREE_PATH}"`, check it with `pwd`, and use it for every file operation that follows. Plan caps (`bkit.workflows.tasks`): {MAX_TASKS_PER_GROUP} tasks and {MAX_TESTS_PER_GROUP} `TEST FIRST` tests per group; {MAX_TESTS_PER_TASK} tests across {MAX_TEST_FILES_PER_TASK} test files per task.
diff --git a/.cursor/commands/bkit-plan.md b/.cursor/commands/bkit-plan.md
index 30a0fb5c1..adc1ba014 100644
--- a/.cursor/commands/bkit-plan.md
+++ b/.cursor/commands/bkit-plan.md
@@ -303,6 +303,7 @@ Before generating, ask the engine for this step's invocation id and keep the pri
      ```bash
      "{BKIT}" ledgers query --ledger=knowledge --status=ACTIVE --limit=500 > "docs/plans/{YYYYMM}/logs/{FID}/related-knowledge.md"
      ```
+   - **If** the saved output's `nextCursor` is not null → run the same command again with `--limit` set to the saved output's `total`, so `related-knowledge.md` holds every row and never a truncated page.
 2. Launch these subagents in parallel using `Task` tool:
    - **Subagent:** Invoke `/bkit-plan-review-1` using `Task` tool:
      Context: You are a subagent in the Plan phase running in parallel with two other agents. Switch into the working directory with `cd "{WORKTREE_PATH}"`, check it with `pwd`, and use it for every file operation that follows. Plan caps (`bkit.workflows.tasks`): {MAX_TASKS_PER_GROUP} tasks and {MAX_TESTS_PER_GROUP} `TEST FIRST` tests per group; {MAX_TESTS_PER_TASK} tests across {MAX_TEST_FILES_PER_TASK} test files per task.
diff --git a/.opencode/commands/bkit-plan.md b/.opencode/commands/bkit-plan.md
index 6c34d316d..923a6abeb 100644
--- a/.opencode/commands/bkit-plan.md
+++ b/.opencode/commands/bkit-plan.md
@@ -307,6 +307,7 @@ Before generating, ask the engine for this step's invocation id and keep the pri
      ```bash
      "{BKIT}" ledgers query --ledger=knowledge --status=ACTIVE --limit=500 > "docs/plans/{YYYYMM}/logs/{FID}/related-knowledge.md"
      ```
+   - **If** the saved output's `nextCursor` is not null → run the same command again with `--limit` set to the saved output's `total`, so `related-knowledge.md` holds every row and never a truncated page.
 2. Launch these subagents in parallel using `subagent` tool:
    - **Subagent:** Invoke `/bkit-plan-review-1` using `subagent` tool:
      Context: You are a subagent in the Plan phase running in parallel with two other agents. Switch into the working directory with `cd "{WORKTREE_PATH}"`, check it with `pwd`, and use it for every file operation that follows. Plan caps (`bkit.workflows.tasks`): {MAX_TASKS_PER_GROUP} tasks and {MAX_TESTS_PER_GROUP} `TEST FIRST` tests per group; {MAX_TESTS_PER_TASK} tests across {MAX_TEST_FILES_PER_TASK} test files per task.
diff --git a/dist/commands/lib.js b/dist/commands/lib.js
index 5f23b8a18..d8ab17e04 100644
--- a/dist/commands/lib.js
+++ b/dist/commands/lib.js
@@ -687,7 +687,7 @@ export async function runCommand(argv, commands, options) {
         ctx.flags = parseFlags(own, spec.flags);
         const invocationId = ctx.flags["invocation"];
         if (typeof invocationId === "string" &&
-            spec.flags.some((f) => f.name === INVOCATION_FLAG.name)) {
+            spec.flags.some((f) => f.name === INVOCATION_FLAG.name && f.unresolved !== true)) {
             ctx.invocation = resolveInvocation(ctx.cwd, invocationId, ctx.flags);
         }
         input = { noun: cmd.noun, verb, argv: rest, flags: ctx.flags, cwd: ctx.cwd };
diff --git a/dist/commands/workflow/counters.js b/dist/commands/workflow/counters.js
index c5f345582..55e4b8bc9 100644
--- a/dist/commands/workflow/counters.js
+++ b/dist/commands/workflow/counters.js
@@ -132,10 +132,11 @@ export function spendCorrection(file, workflow, scope, operation, limit, extra =
         if (r.type === "workflow-started" && r.workflow === workflow)
             start = i;
     });
-    const spent = new Set(rows
+    const counted = rows
         .slice(start + 1)
-        .filter((r) => r.type === CORRECTION_CANDIDATE_ROW && r.workflow === workflow && r.scope === scope)
-        .map((r) => String(r.operation)));
+        .filter((r) => r.type === CORRECTION_CANDIDATE_ROW && r.workflow === workflow && r.scope === scope);
+    const spent = new Set(counted.map((r) => String(r.operation)));
+    const asked = typeof extra.requestHash === "string" ? extra.requestHash : undefined;
     const verdict = (allowed, replayed) => ({
         allowed,
         used: spent.size,
@@ -143,8 +144,16 @@ export function spendCorrection(file, workflow, scope, operation, limit, extra =
         remaining: Math.max(0, limit - spent.size),
         replayed,
     });
-    if (spent.has(operation))
+    if (spent.has(operation)) {
+        // A known id is a free replay only for the request it was counted for.
+        const hashes = counted
+            .filter((r) => String(r.operation) === operation)
+            .map((r) => r.requestHash)
+            .filter((h) => typeof h === "string");
+        if (asked !== undefined && hashes.length > 0 && !hashes.includes(asked))
+            return { ...verdict(false, false), conflict: true };
         return verdict(true, true);
+    }
     if (spent.size >= limit)
         return verdict(false, false);
     fs.appendFileSync(file, appendLine({
@@ -520,6 +529,11 @@ export const countersCommand = {
                     required: true,
                     help: "the corrected candidate's fresh operation id",
                 },
+                {
+                    name: "request-hash",
+                    type: "string",
+                    help: "the candidate's canonical request hash: a known operation replays free only for the same hash, and a different one is refused",
+                },
                 {
                     name: "limit",
                     type: "string",
@@ -538,7 +552,9 @@ export const countersCommand = {
                 const file = statusFile(ctx);
                 if (!fs.existsSync(file))
                     throw new CommandError(EXIT_NO_STATUS, `${file} does not exist`);
-                const spend = spendCorrection(file, String(ctx.flags.workflow), String(ctx.flags.scope), String(ctx.flags.operation), wholeNumber(ctx.flags.limit, "limit", CORRECTION_LIMIT));
+                const spend = spendCorrection(file, String(ctx.flags.workflow), String(ctx.flags.scope), String(ctx.flags.operation), wholeNumber(ctx.flags.limit, "limit", CORRECTION_LIMIT), str(ctx.flags.requestHash) === undefined
+                    ? {}
+                    : { requestHash: str(ctx.flags.requestHash) });
                 ctx.emit({ ...spend });
                 return spend.allowed ? EXIT.OK : EXIT.NO;
             },
diff --git a/dist/commands/workflow/ledgers.js b/dist/commands/workflow/ledgers.js
index 82dc486ca..e2e481b00 100644
--- a/dist/commands/workflow/ledgers.js
+++ b/dist/commands/workflow/ledgers.js
@@ -718,7 +718,7 @@ export const ledgersCommand = {
                 snapshot: "digest of the bytes read; every page of one scan shares it",
                 total: "winners that pass the filter, across all pages",
                 diagnostics: "each unreadable line: {line, reason}; on every page",
-                coverage: "{status: complete|partial|missing|unreadable, clean, malformedLines, lines}; clean is true only for a complete scan with no unreadable line",
+                coverage: "{status: clean|incomplete|partial|missing|unreadable, clean, malformedLines, lines}; clean is true only for a finished scan (nextCursor null) with no unreadable line, so a page with a nextCursor is incomplete",
             },
             run: (ctx) => query(ctx),
         },
@@ -1403,12 +1403,21 @@ export function appendLedgerRows(root, ledger, rows, invocation, options = {}) {
                         options.checkpoint?.("receipted");
                         return result(intent, intent.block, true);
                     }
+                    // Whole lines decide "landed": rows share a byte prefix (`{"schema":3,"ts":...`), so a
+                    // foreign row is told apart by being a complete line that differs from ours.
+                    const wantNl = want.indexOf(0x0a);
+                    const wantFirst = wantNl < 0 ? want : want.subarray(0, wantNl + 1);
+                    const tail = have.subarray(intent.offset);
+                    const haveNl = tail.indexOf(0x0a);
+                    const haveFirst = haveNl < 0 ? tail : tail.subarray(0, haveNl + 1);
+                    const foreignWholeLine = haveNl >= 0 && !haveFirst.equals(wantFirst);
                     let landedBytes = 0;
                     while (landedBytes < seg.length &&
                         landedBytes < want.length &&
                         seg[landedBytes] === want[landedBytes])
                         landedBytes++;
-                    if (landedBytes > 0 || (seg.length > 0 && have.length === intent.offset + seg.length))
+                    if (!foreignWholeLine &&
+                        (landedBytes > 0 || (seg.length > 0 && have.length === intent.offset + seg.length)))
                         throw new UncertainEffect(EXIT_STAGE, `operation ${operation}: ${file} holds ${landedBytes} of ${want.length} prepared bytes at the recorded offset; the effect is uncertain, nothing was truncated or retried`);
                     if (have.length === intent.offset) {
                         // Nothing landed: write the exact prepared bytes again.
@@ -1493,9 +1502,12 @@ function append(ctx) {
             of: correctionOf,
             step: book.step,
             substep: "append",
+            requestHash: actionHash(canonicalJson({ ledger, rows: parsed.value })),
         });
         if (!spend.allowed)
-            throw new CorrectionExhausted(EXIT.NO, `the correction budget of ${scope} is spent (${spend.used} of ${spend.limit}); nothing was written`, scope);
+            throw new CorrectionExhausted(EXIT.NO, spend.conflict === true
+                ? `operation ${operation} was already counted as a correction of ${scope} for different rows; a changed candidate needs a fresh operation id and spends the budget (${spend.used} of ${spend.limit}); nothing was written`
+                : `the correction budget of ${scope} is spent (${spend.used} of ${spend.limit}); nothing was written`, scope);
     }
     let r;
     try {
@@ -1596,7 +1608,9 @@ function query(ctx) {
             ? "unreadable"
             : result.diagnostics.length > 0
                 ? "partial"
-                : "complete";
+                : next !== null
+                    ? "incomplete"
+                    : "clean";
     ctx.emit({
         ledger,
         file,
@@ -1607,7 +1621,7 @@ function query(ctx) {
         diagnostics: result.diagnostics,
         coverage: {
             status,
-            clean: status === "complete",
+            clean: status === "clean",
             malformedLines: result.diagnostics.length,
             lines: result.lines,
             ...(!read.ok && !missing ? { error: read.error } : {}),
diff --git a/dist/commands/workflow/runs.js b/dist/commands/workflow/runs.js
index d91484862..1afa8dcd9 100644
--- a/dist/commands/workflow/runs.js
+++ b/dist/commands/workflow/runs.js
@@ -496,7 +496,9 @@ function pushCurrentBranch(cwd) {
  * to validate, and no foreign local commit rides along. `not-empty` hands the push to
  * `pushBranch`, whose landing gate covers content.
  */
-function landEmptyOwnCommits(cwd, fid, branch, log) {
+function landEmptyOwnCommits(cwd, fid, branch, log, 
+/** Called with the copy's SHA before it is pushed, so a lost push response is recoverable. */
+onCopy) {
     const rec = readRecord(cwd, fid);
     if (rec === null || !runGit(cwd, ["fetch", "origin", branch]).ok)
         return { kind: "failed" };
@@ -506,10 +508,10 @@ function landEmptyOwnCommits(cwd, fid, branch, log) {
         return { kind: "failed" };
     const landed = new Set(rec.pushed ?? []);
     const pending = rec.commits.filter((c) => !landed.has(c) && !runGit(cwd, ["merge-base", "--is-ancestor", c, tip]).ok);
-    if (pending.length === 0) {
-        const sha = rec.pushed?.at(-1);
-        return sha === undefined ? { kind: "failed" } : { kind: "landed", sha };
-    }
+    // Every run commit is already on the remote, or was pushed as a copy with a SHA of its own:
+    // the remote tip is what holds them, never a recorded local original.
+    if (pending.length === 0)
+        return { kind: "landed", sha: tip };
     const empty = (c) => {
         const tree = git(cwd, ["rev-parse", `${c}^{tree}`]);
         return tree !== null && tree === git(cwd, ["rev-parse", `${c}^^{tree}`]);
@@ -530,6 +532,7 @@ function landEmptyOwnCommits(cwd, fid, branch, log) {
             return { kind: "failed" };
         parent = made.stdout;
     }
+    onCopy?.(parent);
     const pushed = runGit(cwd, ["push", "origin", `${parent}:refs/heads/${branch}`]);
     if (!pushed.ok) {
         log(`pushing the run's empty commits to ${branch} failed: ${pushed.stderr}`);
@@ -801,7 +804,23 @@ export async function ciDispatchGate(o, deps) {
                 remoteSha = remoteTip(o.cwd, branch) === cur.commit ? cur.commit : null;
             }
             else {
-                const empties = landEmptyOwnCommits(o.cwd, o.fid, branch, deps.log);
+                // A copy persisted by an earlier attempt may already be on the remote: the push
+                // response can be lost, so check before copying again.
+                const earlier = cur.copy;
+                const held = earlier !== undefined &&
+                    runGit(o.cwd, ["fetch", "origin", branch]).ok &&
+                    runGit(o.cwd, ["merge-base", "--is-ancestor", earlier, `origin/${branch}`]).ok;
+                if (held) {
+                    markRecordPushed(o.cwd, o.fid, [cur.commit]);
+                    remoteSha = earlier;
+                }
+                const empties = held
+                    ? { kind: "landed", sha: earlier }
+                    : landEmptyOwnCommits(o.cwd, o.fid, branch, deps.log, (copy) => {
+                        cur = { ...cur, copy };
+                        curRt = cur;
+                        persist("poll", lastResult);
+                    });
                 if (empties.kind === "landed")
                     remoteSha = empties.sha;
                 else if (empties.kind === "failed")
diff --git a/dist/commands/workflow/steps.js b/dist/commands/workflow/steps.js
index a60d829c7..71f1fed8b 100644
--- a/dist/commands/workflow/steps.js
+++ b/dist/commands/workflow/steps.js
@@ -1921,6 +1921,12 @@ export const stepsCommand = {
                     type: "string",
                     help: "render the artifact from this structured result JSON {findings, judgments, body, evidenceComplete} (audit: the audit result) instead of copying --from",
                 },
+                {
+                    name: "invocation",
+                    type: "string",
+                    unresolved: true,
+                    help: "with --result-file: the invocation id this step runs under; a result that names another invocation is stale and refused (exit 6, nothing written)",
+                },
                 {
                     name: "strip-header",
                     type: "boolean",
@@ -1948,7 +1954,15 @@ export const stepsCommand = {
                     if (ctx.flags.agent === undefined)
                         throw new CommandError(EXIT.USAGE, "--result-file needs --agent");
                     try {
-                        const rendered = renderResult(ctx.cwd, String(ctx.flags.agent), readResult(ctx.cwd, String(ctx.flags.resultFile)));
+                        const result = readResult(ctx.cwd, String(ctx.flags.resultFile));
+                        const issued = str(ctx.flags.invocation);
+                        const carried = typeof result === "object" && result !== null && !Array.isArray(result)
+                            ? result.invocation
+                            : undefined;
+                        // A result written under another invocation is left over from an earlier round or run.
+                        if (issued !== undefined && carried !== undefined && carried !== issued)
+                            throw new CommandError(EXIT_INVALID, `result: ${String(ctx.flags.resultFile)} was written under invocation ${String(carried)}, not ${issued}; it is a stale result from an earlier round or run (nothing written)`);
+                        const rendered = renderResult(ctx.cwd, String(ctx.flags.agent), result);
                         const requested = path.resolve(ctx.cwd, String(ctx.flags.to));
                         // An audit's --to is the finished report; the summary never replaces it.
                         const keepsReport = ctx.flags.agent === AUDIT_AGENT &&
diff --git a/dist/ledgers/status.js b/dist/ledgers/status.js
index 8e87dabaa..56228b68c 100644
--- a/dist/ledgers/status.js
+++ b/dist/ledgers/status.js
@@ -111,6 +111,8 @@ function validRetrigger(value) {
     if (typeof value.original !== "string" || !SHA_RE.test(value.original))
         return false;
     const sha = (k) => typeof value[k] === "string" && SHA_RE.test(value[k]);
+    if (value.copy !== undefined && !sha("copy"))
+        return false;
     if (state === "intended")
         return true;
     if (!sha("commit"))
diff --git a/docs/deferrals.jsonl b/docs/deferrals.jsonl
index b94f92a19..fdb0156c9 100644
--- a/docs/deferrals.jsonl
+++ b/docs/deferrals.jsonl
@@ -235,3 +235,6 @@
 {"schema":3,"ts":1794307371533,"firstTs":1794307371533,"updates":1,"kind":"deferral","key":"860-move-deterministic-bookkeeping-challenge-low-bkit-core-engine-commands-workflow-ledgers-ts-1709","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-challenge"},"references":["860-move-deterministic-bookkeeping"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"Every operation-bound append writes its full row block twice into the committed `.bkit/ledger-operations.jsonl` (intent and receipt `detail`), which no compaction trims and which every later append parses whole twice","description":"LOW build challenge finding at .bkit/core/engine/commands/workflow/ledgers.ts:1709: Every operation-bound append writes its full row block twice into the committed `.bkit/ledger-operations.jsonl` (intent and receipt `detail`), which no compaction trims and which every later append parses whole twice. Done when: The receipt row records the offset, byte count and block digest only, and replay reads the receipted rows back from the ledger at that offset, so the store grows by a fixed size per operation rather than by the rows' size, and `docs/observability.md:38` ('None of them stores a secret, a row body or a token') holds for the receipt.","source":".bkit/core/engine/commands/workflow/ledgers.ts:1709"}
 {"schema":3,"ts":1794307371534,"firstTs":1794307371534,"updates":1,"kind":"deferral","key":"860-move-deterministic-bookkeeping-challenge-low-bkit-core-engine-commands-workflow-ledgers-ts-1688","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-challenge"},"references":["860-move-deterministic-bookkeeping"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"A replayed operation returns its stored receipt (`replayed: true`, exit 0) without checking that the target ledger still holds the receipted rows. After a branch switch, rebase, revert, or a receipt carried in from another checkout, a finding the caller believes is recorded is silently missing.","description":"LOW build challenge finding at .bkit/core/engine/commands/workflow/ledgers.ts:1688: A replayed operation returns its stored receipt (`replayed: true`, exit 0) without checking that the target ledger still holds the receipted rows. After a branch switch, rebase, revert, or a receipt carried in from another checkout, a finding the caller believes is recorded is silently missing.. Done when: Before a `replay` returns, it confirms that every receipted row line is present in the current target file. When any is absent, the call exits non-zero as an uncertain effect, writes nothing and names the operation.","source":".bkit/core/engine/commands/workflow/ledgers.ts:1688"}
 {"schema":3,"ts":1794307371535,"firstTs":1794307371535,"updates":1,"kind":"deferral","key":"860-move-deterministic-bookkeeping-challenge-low-bkit-core-engine-commands-workflow-ledgers-ts-1521","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-challenge"},"references":["860-move-deterministic-bookkeeping"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"A standalone invocation's `<id>.corrections.jsonl` is created in the outbox with default permissions (typically world-readable 0644), unlike the 0600 receipt beside it. This breaks the `docs/security.md` contract that invocation files under Git-common `bkit-outbox` are private.","description":"LOW build challenge finding at .bkit/core/engine/commands/workflow/ledgers.ts:1521: A standalone invocation's `<id>.corrections.jsonl` is created in the outbox with default permissions (typically world-readable 0644), unlike the 0600 receipt beside it. This breaks the `docs/security.md` contract that invocation files under Git-common `bkit-outbox` are private.. Done when: The corrections file is created with mode 0600 before any row is appended to it, matching `writeInvocation` in `.bkit/core/engine/commands/lib.ts`.","source":".bkit/core/engine/commands/workflow/ledgers.ts:1521"}
+{"schema":3,"ts":1794365894792,"firstTs":1794365894792,"updates":1,"kind":"deferral","key":"860-move-deterministic-bookkeeping-challenge-low-bkit-core-engine-ledgers-status-ts-868","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-challenge"},"references":["860-move-deterministic-bookkeeping"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"A process killed while it holds a target lock leaves `<ledger>.bkit-lock` in the working tree, and nothing ignores it: a lock beside a run's `status.jsonl` (taken by `restoreBranchRows` and `carryOwnBook`) matches the `docs/plans/<month>/logs/<fid>/*` book pathspec, so the next `ledgers commit` commits it, and every clone of that branch then waits 10 s and fails on that file because a committed lock is never reclaimed","description":"LOW build challenge finding at .bkit/core/engine/ledgers/status.ts:868: A process killed while it holds a target lock leaves `<ledger>.bkit-lock` in the working tree, and nothing ignores it: a lock beside a run's `status.jsonl` (taken by `restoreBranchRows` and `carryOwnBook`) matches the `docs/plans/<month>/logs/<fid>/*` book pathspec, so the next `ledgers commit` commits it, and every clone of that branch then waits 10 s and fails on that file because a committed lock is never reclaimed. Done when: `*.bkit-lock` files are ignored by the shipped gitignore block and excluded from every `bookPathspecs` / `UNION_PATHSPECS` entry (or the lock lives under the git common dir), so `ledgers commit` never stages a lock file.","source":".bkit/core/engine/ledgers/status.ts:868"}
+{"schema":3,"ts":1794365894794,"firstTs":1794365894794,"updates":1,"kind":"deferral","key":"860-move-deterministic-bookkeeping-challenge-low-bkit-core-engine-commands-lib-ts-635","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-challenge"},"references":["860-move-deterministic-bookkeeping"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"The `worktree` fingerprint in the committed `invocation` event is an unsalted SHA-256 of the absolute checkout path, so anyone reading a public `status.jsonl` can confirm a guessed username offline: the repository and FID are public, and checkout layouts such as `/Users/<name>/Documents/GitHub/<repo>/.worktrees/<fid>` are few. This undoes the privacy goal of Task 22.","description":"LOW build challenge finding at .bkit/core/engine/commands/lib.ts:635: The `worktree` fingerprint in the committed `invocation` event is an unsalted SHA-256 of the absolute checkout path, so anyone reading a public `status.jsonl` can confirm a guessed username offline: the repository and FID are public, and checkout layouts such as `/Users/<name>/Documents/GitHub/<repo>/.worktrees/<fid>` are few. This undoes the privacy goal of Task 22.. Done when: `worktreeFingerprint` is an HMAC (or salted hash) of the checkout top, keyed by a random per-clone secret that is created once with mode 0600 under `<git common dir>/bkit-outbox/`. The committed event's `worktree` value cannot be recomputed from the path alone. `rebuildInvocation` still rebuilds a receipt in the issuing clone, and still refuses an event from another checkout.","source":".bkit/core/engine/commands/lib.ts:635"}
+{"schema":3,"ts":1794365894795,"firstTs":1794365894795,"updates":1,"kind":"deferral","key":"860-move-deterministic-bookkeeping-challenge-low-bkit-core-engine-commands-workflow-challenge-ts-282","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-challenge"},"references":["860-move-deterministic-bookkeeping"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"A structured challenge or review finding whose `title`, `doneWhen`, `cls` or `tests` entry holds a line break is rendered verbatim into its task block. A value carrying `<!-- bkit:task N end -->` or `<!-- bkit:task N start -->` lines can end the real block early (its Severity line falls outside it) or add a forged block. `challenge merge` and `steps finish` read the Findings Log with `parseFindings` and merge those blocks into the plan, while the engine-derived `Failures` and `Fingerprint` header still match the structured input. This is the same forgery Task 24 closed for header values, reached through the body. Untrusted diff text that an agent quotes into a finding is enough to trigger it.","description":"LOW build challenge finding at .bkit/core/engine/commands/workflow/challenge.ts:282: A structured challenge or review finding whose `title`, `doneWhen`, `cls` or `tests` entry holds a line break is rendered verbatim into its task block. A value carrying `<!-- bkit:task N end -->` or `<!-- bkit:task N start -->` lines can end the real block early (its Severity line falls outside it) or add a forged block. `challenge merge` and `steps finish` read the Findings Log with `parseFindings` and merge those blocks into the plan, while the engine-derived `Failures` and `Fingerprint` header still match the structured input. This is the same forgery Task 24 closed for header values, reached through the body. Untrusted diff text that an agent quotes into a finding is enough to trigger it.. Done when: `structuredFindings` refuses (EXIT_OLD_FORMAT, so `steps stub --result-file` exits 6 and writes nothing) any `title`, `doneWhen`, `cls` or `tests` entry that contains CR or LF. Every rendered Findings Log then parses back with `parseFindings` to exactly the structured findings given.","source":".bkit/core/engine/commands/workflow/challenge.ts:282"}
