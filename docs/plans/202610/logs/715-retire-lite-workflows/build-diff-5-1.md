diff --git a/.bkit/core/.bkit/jsonl.md b/.bkit/core/.bkit/jsonl.md
index b3f77dd63..d91524100 100644
--- a/.bkit/core/.bkit/jsonl.md
+++ b/.bkit/core/.bkit/jsonl.md
@@ -104,7 +104,7 @@ Same name, same shape on `outcome` and `run`:

<!-- prettier-ignore -->
 | Kind | Fields (beyond the top section) |
 | --- | --- |
 | `counter` | `run:{parentSha}`, `counter:{name, value:number, source:"model-self-report"\|"shell-bus"}`. |
-| `outcome` | `run:{parentSha, pr?}` (`pr` ship-only), `time` (`null` = no start row), `ending:"done"\|"close-failed"` (`close-failed` = work done, its close's CI never started), `lines?\|null`, `steps?`, `ci?`, `ledgers:{deferrals:{repo,added?}, failures:{repo,added?}, friction:{added?}}` (`repo` = the repo's distinct folded entries at close, not lines; `added` = distinct keys this run added — rows of `by.workflow` at or after its start; absent when the start is unknown), `plan?` (plan / build / ship), `build?` (build), `context?:{host:"claude-code", byAgent:{<agent type>:{peak, runs}}}` (the run's subagents per agent type: `runs` = subagents with a model call in the run, `peak` = largest input + cache write + cache read tokens of one model call in the run; read at close from the subagent transcripts of the closing Claude Code chat and of every chat the run's `session` status rows name, each call counted when its own timestamp falls between the run's start and the close; absent on other hosts or with no data; `bkit stats` judges peaks against 160,000 tokens), `ship?:{coverage?:{unit?,integration?,e2e?}}` (each `{lines,branches,functions,statements}` %; a tier absent when its coverage report is not produced). The close's CI dispatch re-appends it: dispatch added to `ci`, `ending` `close-failed` when CI never started; newer row supersedes (§ Identity / Dedup). |
+| `outcome` | `run:{parentSha, pr?}` (`pr` ship-only), `time` (`null` = no start row), `ending:"done"\|"close-failed"\|"held"` (`close-failed` = work done, its close's CI never started; `held` = a local build that published nothing), `publish?:boolean` (a build's resolved publish value; `false` with `held`), `lines?\|null`, `steps?`, `ci?`, `ledgers:{deferrals:{repo,added?}, failures:{repo,added?}, friction:{added?}}` (`repo` = the repo's distinct folded entries at close, not lines; `added` = distinct keys this run added — rows of `by.workflow` at or after its start; absent when the start is unknown), `plan?` (plan / build / ship), `build?` (build), `context?:{host:"claude-code", byAgent:{<agent type>:{peak, runs}}}` (the run's subagents per agent type: `runs` = subagents with a model call in the run, `peak` = largest input + cache write + cache read tokens of one model call in the run; read at close from the subagent transcripts of the closing Claude Code chat and of every chat the run's `session` status rows name, each call counted when its own timestamp falls between the run's start and the close; absent on other hosts or with no data; `bkit stats` judges peaks against 160,000 tokens), `ship?:{coverage?:{unit?,integration?,e2e?}}` (each `{lines,branches,functions,statements}` %; a tier absent when its coverage report is not produced). The close's CI dispatch re-appends it: dispatch added to `ci`, `ending` `close-failed` when CI never started; newer row supersedes (§ Identity / Dedup). |
 | `compliance` | `run:{parentSha}`, `rule:{id, verdict:"pass"\|"fail"\|"n/a", evidence?}` (`evidence` on fail rows). |
 | `friction` | `key`, `category` (§ Categories), `scope:"bkit-repo"\|"consumer"\|"universal"`, `severity`, `summary?`, `description`, `remediation?`, `source?`, `status:"OPEN"\|"TRIAGED"\|"CLOSED"\|string?` (see § Updating a Row), `confidence?:number`, `lastConfirmed?:number`, `recurrenceCount?:number`. |
 | `deferral` | `key`, `type:"issue"\|"feature"`, `category` (§ Categories), `severity`, `reason` (§ Deferral Reason), `summary?`, `description`, `remediation?`, `source?`, `status:"OPEN"\|"TRIAGED"\|"CLOSED"?`. |
@@ -112,7 +112,7 @@ Same name, same shape on `outcome` and `run`:
 | `knowledge` | `key`, `summary`, `description?`, `rootCause?`, `remediation?`, `status:"ACTIVE"\|"SUPERSEDED"?`. |
 | `decision` | `key`, `summary`, `description?`, `rationale?`, `alternatives?`, `status:"ACTIVE"\|"SUPERSEDED"?`. |
 | `chat` | `key` (`<platform>:<session id>`); `bkit` adds `versionSource:"repo-history"\|"prompt"\|"none"` (`prompt` = an expanded workflow command's managed marker), `via` (`command` / `subagent`; empty = no bkit; `command` only when the chat ran a `/bkit-*` command itself), `workflows`, `prompts` (bkit prompt families, audit and utility included), `cli:{total, byVerb}`; `session:{platform, id, hostVersion?, entrypoint?, prompts}` (`platform` `claude-code` / `codex` / `opencode` / `cursor` / `antigravity`; `prompts` = messages the human typed); `time:{start, end, totalMinutes, activeMinutes, spans, lastActivity}` (`ts` = `end`; `spans` = `[[startMs,endMs]]`, chat + subagents, split at gaps over 5 min; `activeMinutes` = their sum; `lastActivity` = last write to the chat's files); `issue:{id, all, mentioned, source:"command"\|"summary"\|"mention"\|"none"}` (fingerprints; named only in the host's summary of an earlier chat → `summary`); `run:{parentShas}` (printed by `bkit workflows close` — exact join to `run.parentSha`); `effort` (turns per level); `usage:{total:{turns, tokens, context:{start,peak}, compactions}, main:{turns, tokens, context:{peak}, compactions, mix}, byModel:{<model>:{turns, tokens}}, byRun:{<run key>:{main:{turns, tokens}, agents:{turns, tokens}}}\|null}` (`tokens` = `{input, cacheWrite, cacheRead, output, outputEst, read}`, `read` = the three sent types; `mix` = calls by kind `{read, edit, grep, shellRead, shellList, tests, serena}`; `byRun` = the chat's model calls per run it worked on — a run's `session` rows name the chat, or same repo, the run's issue in `issue.all` and overlapping time — each call to the run whose first-to-last status row window holds its time, the later-started run when two do; `{}` = no run, `null` = a call has no time, e.g. Cursor, Antigravity); `agents:{total:{n, errors}, byAgent:{<agent type>:{n, errors, instances:[{turns, contextPeak, contextAt10}], usage, mix, planReads:{full, partial}}}}` (`contextAt10` = context read by the instance's 10th model call, `null` under 10; `planReads` = reads of a `docs/plans/<YYYYMM>/<FID>-plan(-N).md` file, `partial` = a line range or `sed` / `head` / `tail`); `tools:{total:{calls, errors}, byTool:{<tool>:{calls, errors, byCategory?}}, filesRead}`; `scan:{files, bytes, settled, tokensRecorded}` (`settled` = unchanged for the settle window, `false` = open: counted and marked, not in medians; `tokensRecorded` false = host records none, e.g. Cursor). New same-`key` row when `scan.bytes` or `scan.settled` changes, or the stored row has no `usage.byRun`. `schema: 2` chat rows hold `ctx` / `ctxPeak`; readers rename them to `context` / `contextPeak`. `repo` and issues are fingerprints: `fp:` + 12 hex of sha256(`owner/repo` / `owner/repo#N`); no paths, branch names or prompt text. Field reference: the script's header. |
-| `run` | `key` (`<fid>:<workflow>:<start>`); `run:{fid, issue, n, parentSha, parentShas}` (`fid` = fingerprint of `owner/repo:<FID>`; `issue` = fingerprint of the FID's leading number, else `null`; `n` = nth run of that workflow in the log; `parentSha` = its last `workflow-done` row's, else its last close step's, else `null` — exact join to the run's `outcome` / `counter` / `compliance`; `parentShas` = every commit its status rows name); `time:{start, end, totalMinutes, activeMinutes, activeFrom:{chats,bytes}, lastActivity}` (first / last status row; `activeMinutes` = run time inside the spans of counted chats naming its issue by command or summary, `null` = none yet; `lastActivity` = log's last row, after-end rows included); `ending:"done"\|"close-failed"\|"failed"\|"decision-pause"\|"stopped"` (last end row; `close-failed` = after `workflow-done` only the close failed: last close's CI dispatch `unresolved`, or a `workflow-failed` row with no close after it; no end row → `decision-pause` if its `build-decision-*.md` is `Status: OPEN`, else `stopped`); `ci`, `steps` (with `activeMinutes`), `lines` (build, debug), `plan` (a feature's last plan run), `build` (build; `testOrderGaps` `null` = round's report gone — an earlier build's counts only if written before the next build started) — § Shared Blocks; `owner:{waitBeforeMinutes, total:{stops, minutes}, stops:[{minutes, open, reason}]}` (owner waits from `owner-pause` → next `owner-answer` status rows, pauses before an answer joined into one stop; `open` = no answer yet, `minutes: null`; `reason` `decision` / `grill` / `draft`; `waitBeforeMinutes` = the same log's previous run's last row to this run's first, `null` for the first); `usage:{total, main, agents}\|null` (each `{turns, tokens}`; sum of the matched chats' `usage.byRun[key]`; `null` = no chat matched, or one has no `byRun`); `scan:{rows, afterEnd, settled}` (`afterEnd` = rows after the end row, e.g. a hand rewind; `settled` = last row older than the settle window). `ts` = scan time. New same-`key` row when `scan.rows`, `time.activeFrom`, `scan.settled`, `usage` or `owner` changes. No limits applied; no FID text, paths or branch names. |
+| `run` | `key` (`<fid>:<workflow>:<start>`); `run:{fid, issue, n, parentSha, parentShas}` (`fid` = fingerprint of `owner/repo:<FID>`; `issue` = fingerprint of the FID's leading number, else `null`; `n` = nth run of that workflow in the log; `parentSha` = its last `workflow-done` row's, else its last close step's, else `null` — exact join to the run's `outcome` / `counter` / `compliance`; `parentShas` = every commit its status rows name); `time:{start, end, totalMinutes, activeMinutes, activeFrom:{chats,bytes}, lastActivity}` (first / last status row; `activeMinutes` = run time inside the spans of counted chats naming its issue by command or summary, `null` = none yet; `lastActivity` = log's last row, after-end rows included); `ending:"done"\|"close-failed"\|"failed"\|"decision-pause"\|"stopped"\|"held"` (last end row; `held` = the last `workflow-done` row says `ending: held`; `close-failed` = after `workflow-done` only the close failed: last close's CI dispatch `unresolved`, or a `workflow-failed` row with no close after it; no end row → `decision-pause` if its `build-decision-*.md` is `Status: OPEN`, else `stopped`); `ci`, `steps` (with `activeMinutes`), `lines` (build, debug), `plan` (a feature's last plan run), `build` (build; `testOrderGaps` `null` = round's report gone — an earlier build's counts only if written before the next build started) — § Shared Blocks; `owner:{waitBeforeMinutes, total:{stops, minutes}, stops:[{minutes, open, reason}]}` (owner waits from `owner-pause` → next `owner-answer` status rows, pauses before an answer joined into one stop; `open` = no answer yet, `minutes: null`; `reason` `decision` / `grill` / `draft`; `waitBeforeMinutes` = the same log's previous run's last row to this run's first, `null` for the first); `usage:{total, main, agents}\|null` (each `{turns, tokens}`; sum of the matched chats' `usage.byRun[key]`; `null` = no chat matched, or one has no `byRun`); `scan:{rows, afterEnd, settled}` (`afterEnd` = rows after the end row, e.g. a hand rewind; `settled` = last row older than the settle window). `ts` = scan time. New same-`key` row when `scan.rows`, `time.activeFrom`, `scan.settled`, `usage` or `owner` changes. No limits applied; no FID text, paths or branch names. |
 | `feature` | `key` (the FID), `category` (§ Categories), `summary?`, `description`, `status:"DESIGNED"\|"PLANNED"\|"BUILT"\|"DEBUGGED"\|"SHIPPED"\|"ABANDONED"` (required — no severity; see `docs/roadmap.md`), `shippedAt:number?` (§ Ship Date). |
 
 ## Who Wrote It — `by.step` vs `by.subagent` vs `by.model`
diff --git a/.bkit/core/engine/commands/stats.test.ts b/.bkit/core/engine/commands/stats.test.ts
index 6a67ec097..34a6ef99c 100644
--- a/.bkit/core/engine/commands/stats.test.ts
+++ b/.bkit/core/engine/commands/stats.test.ts
@@ -54,6 +54,25 @@ describe("bkit stats", () => {
     expect(md).toContain("## Run durations");
   });
 
+  it("counts a held outcome row in its kind total", () => {
+    fs.writeFileSync(
+      path.join(root, ".bkit", "stats.jsonl"),
+      [
+        row(1_700_000_000_001, "outcome", {
+          run: { parentSha: "a".repeat(40) },
+          ending: "held",
+          publish: false,
+        }),
+        row(1_700_000_000_002, "outcome", { run: { parentSha: "b".repeat(40) }, ending: "done" }),
+      ].join("\n") + "\n",
+    );
+
+    const md = buildRepoStats(root);
+
+    expect(md).toContain("| outcome | 2 |");
+    expect(md).not.toContain("| held |");
+  });
+
   it("prints each table unpadded under a prettier-ignore marker", () => {
     fs.writeFileSync(
       path.join(root, ".bkit", "stats.jsonl"),
diff --git a/.bkit/core/engine/commands/workflow/workflows.test.ts b/.bkit/core/engine/commands/workflow/workflows.test.ts
index 9c99628ac..10417a35a 100644
--- a/.bkit/core/engine/commands/workflow/workflows.test.ts
+++ b/.bkit/core/engine/commands/workflow/workflows.test.ts
@@ -815,6 +815,35 @@ describe("bkit workflows close", () => {
     expect(r.json.report.length).toBeGreaterThan(0);
   });
 
+  it("records ending held and publish false on the workflow-done row", async () => {
+    const cwd = closable();
+    const r = await run(cwd, wf("close", "build", "--ending=held", "--publish=false"));
+    expect(r.code).toBe(0);
+    const done = rows(statusOf(cwd)).filter((x) => x.type === "workflow-done");
+    expect(done).toHaveLength(1);
+    expect(done[0]).toMatchObject({ ending: "held", publish: false });
+    const outcome = writtenOutcome(cwd);
+    expect(outcome).toMatchObject({ ending: "held", publish: false });
+    expect(validate(outcome!)).toEqual({ ok: true });
+  });
+
+  it("defaults the close row to ending done", async () => {
+    const cwd = closable();
+    expect((await run(cwd, wf("close", "build"))).code).toBe(0);
+    const done = rows(statusOf(cwd)).filter((x) => x.type === "workflow-done");
+    expect(done[0]).toMatchObject({ ending: "done" });
+    expect(done[0]).not.toHaveProperty("publish");
+    expect(writtenOutcome(cwd)).toMatchObject({ ending: "done" });
+    expect(writtenOutcome(cwd)).not.toHaveProperty("publish");
+  });
+
+  it("refuses an unknown ending", async () => {
+    const cwd = closable();
+    expect((await run(cwd, wf("close", "build", "--ending=paused"))).code).toBe(2);
+    expect((await run(cwd, wf("close", "build", "--publish=maybe"))).code).toBe(2);
+    expect(rows(statusOf(cwd)).some((x) => x.type === "workflow-done")).toBe(false);
+  });
+
   it("stamps its compliance rows with the same run.parentSha as its counter and outcome, at the close step", async () => {
     const cwd = closable();
     expect((await run(cwd, wf("close", "build"))).code).toBe(0);
diff --git a/.bkit/core/engine/commands/workflow/workflows.ts b/.bkit/core/engine/commands/workflow/workflows.ts
index 5599029e5..886d29e13 100644
--- a/.bkit/core/engine/commands/workflow/workflows.ts
+++ b/.bkit/core/engine/commands/workflow/workflows.ts
@@ -1086,6 +1086,20 @@ function closeComment(
   });
 }
 
+/** `--ending` / `--publish` of the close verb, validated. */
+function closeEnding(f: Record<string, FlagValue>): Pick<CloseInput, "ending" | "publish"> {
+  const ending = str(f.ending);
+  if (ending !== undefined && ending !== "done" && ending !== "held")
+    throw new CommandError(EXIT.USAGE, `--ending must be done or held, got ${ending}`);
+  const publish = str(f.publish);
+  if (publish !== undefined && publish !== "true" && publish !== "false")
+    throw new CommandError(EXIT.USAGE, `--publish must be true or false, got ${publish}`);
+  return {
+    ...(ending === undefined ? {} : { ending }),
+    ...(publish === undefined ? {} : { publish: publish === "true" }),
+  };
+}
+
 export interface CloseInput {
   workflow: string;
   fid: string;
@@ -1103,6 +1117,10 @@ export interface CloseInput {
   number?: string;
   title?: string;
   tree?: string;
+  /** `held` = a local build that published nothing; default `done`. */
+  ending?: "done" | "held";
+  /** The resolved publish value of a build; absent when unset. */
+  publish?: boolean;
 }
 
 /**
@@ -1143,7 +1161,15 @@ export function closeWorkflow(
     );
   }
   const endAt = statusTimestamp();
-  const row = { type: "workflow-done" as const, workflow, at: endAt, parentSha };
+  const ending = o.ending ?? "done";
+  const row = {
+    type: "workflow-done" as const,
+    workflow,
+    at: endAt,
+    parentSha,
+    ending,
+    ...(o.publish === undefined ? {} : { publish: o.publish }),
+  };
   fs.appendFileSync(where.status, appendLine(row));
 
   const repo = resolveRepoSlug(where.root) || "unknown/repo";
@@ -1200,7 +1226,8 @@ export function closeWorkflow(
     by,
     run: { parentSha, ...(o.prNumber === undefined ? {} : { pr: o.prNumber }) },
     time: startKnown === undefined ? null : timeBlock(startKnown, Math.max(startKnown, endMs)),
-    ending: "done",
+    ending,
+    ...(o.publish === undefined ? {} : { publish: o.publish }),
     lines,
     ...(runRowsOf.length > 0 ? { steps: stepsBlock(runRowsOf) } : {}),
     ...(ci.length > 0 ? { ci } : {}),
@@ -2219,6 +2246,16 @@ export const workflowsCommand: CommandSpec = {
         },
         ...COMMENT_FLAGS,
         { name: "tree", type: "string", help: "the close comment links the tree of this ref" },
+        {
+          name: "ending",
+          type: "string",
+          help: "done|held (default done); held = a local build that published nothing",
+        },
+        {
+          name: "publish",
+          type: "string",
+          help: "build: true|false, the resolved publish value; recorded on the workflow-done and outcome rows",
+        },
         {
           name: "flush",
           type: "boolean",
@@ -2323,6 +2360,7 @@ export const workflowsCommand: CommandSpec = {
           number: str(f.number),
           title: str(f.title),
           tree: str(f.tree),
+          ...closeEnding(f),
         };
         const finalParts = finalReturnParts(ctx, input.fid);
         if (f.flush === true) {
diff --git a/.bkit/core/engine/ledgers/status.ts b/.bkit/core/engine/ledgers/status.ts
index ed0ffa437..244d3007a 100644
--- a/.bkit/core/engine/ledgers/status.ts
+++ b/.bkit/core/engine/ledgers/status.ts
@@ -54,7 +54,15 @@ export type StatusEvent =
   | ({ type: "step-done"; workflow: string } & Step)
   | ({ type: "workflow-meta"; workflow: string; at: string } & Record<string, unknown>)
   // `parentSha`: HEAD at close, the run's join key (`run.parentSha` on its ledger rows).
-  | { type: "workflow-done"; workflow: string; at: string; parentSha?: string }
+  // `ending` / `publish`: a build's close; `held` = a local build that published nothing.
+  | {
+      type: "workflow-done";
+      workflow: string;
+      at: string;
+      parentSha?: string;
+      ending?: "done" | "held";
+      publish?: boolean;
+    }
   | { type: "workflow-failed"; workflow: string; at: string };
 
 // Identity for de-dup under union merge. `step-done` is unique per
diff --git a/.bkit/core/engine/ledgers/telemetry.test.ts b/.bkit/core/engine/ledgers/telemetry.test.ts
index b68d85494..b88945491 100644
--- a/.bkit/core/engine/ledgers/telemetry.test.ts
+++ b/.bkit/core/engine/ledgers/telemetry.test.ts
@@ -15,6 +15,8 @@ import {
   SCHEMA,
   SEVERITY_KINDS,
   TRIAGE_STATUSES,
+  OUTCOME_ENDINGS,
+  RUN_ENDINGS,
   UNJUSTIFIED_REASON,
   VALID_KINDS,
   VALID_SEVERITIES,
@@ -1435,6 +1437,28 @@ describe("outcome — shape and inline-jq parity", () => {
     }
   });
 
+  it("accepts held in outcome and run endings", () => {
+    expect(validate(outcomeEvent({ ending: "held" }))).toEqual({ ok: true });
+    expect(OUTCOME_ENDINGS.has("held")).toBe(true);
+    expect(RUN_ENDINGS.has("held")).toBe(true);
+    expect(validate(runEvent("fp:x:build:1", { ending: "held" })).ok).toBe(true);
+    expect(validate(outcomeEvent({ ending: "paused" })).reason).toBe(
+      `outcome ending must be ${[...OUTCOME_ENDINGS].join("|")} (got: paused)`,
+    );
+  });
+
+  it("keeps publish false on the outcome row", () => {
+    const e = outcomeEvent({ ending: "held", publish: false });
+    expect(validate(e)).toEqual({ ok: true });
+    expect(parse(JSON.stringify(e)).events[0]).toMatchObject({ ending: "held", publish: false });
+  });
+
+  it("rejects a non-boolean publish", () => {
+    const bad = validate(outcomeEvent({ ending: "held", publish: "false" }));
+    expect(bad.ok).toBe(false);
+    expect(bad.reason).toBe("outcome publish must be a boolean (got: false)");
+  });
+
   it("folds outcome by (repo, run.pr)", () => {
     const e = outcomeEvent();
     const state = fold([e]);
@@ -1695,6 +1719,12 @@ describe("workflowTelemetry — this-run vs med·5 baseline", () => {
     expect(file.lines.join("\n")).not.toContain("brief");
   });
 
+  it("shows an ending row for a held close", () => {
+    const run = outcomeEvent({ run: { parentSha: "held-sha" }, ending: "held", publish: false });
+    const s = workflowTelemetry(foldFrom([writeStats([run])]), "build");
+    expect(s.lines.some((l) => l.startsWith("| ending | held "))).toBe(true);
+  });
+
   it("prints — for the baseline until at least 3 prior runs exist", () => {
     const runs = [20, 40].map((minutes, i) =>
       outcomeEvent({ ts: 1000 + i, run: { parentSha: `s${i}` }, time: timeOf(minutes) }),
diff --git a/.bkit/core/engine/ledgers/telemetry.ts b/.bkit/core/engine/ledgers/telemetry.ts
index 7792ceaa2..98fd76ccd 100644
--- a/.bkit/core/engine/ledgers/telemetry.ts
+++ b/.bkit/core/engine/ledgers/telemetry.ts
@@ -604,7 +604,7 @@ export interface ContextBlock {
   byAgent: Record<string, { peak: number; runs: number }>;
 }
 
-export const OUTCOME_ENDINGS: Set<string> = new Set(["done", "close-failed"]);
+export const OUTCOME_ENDINGS: Set<string> = new Set(["done", "close-failed", "held"]);
 
 // outcome — one row per WORKFLOW RUN, keyed by (repo, by.workflow, run.parentSha), written
 // by `bkit workflows close`. Blocks that do not apply to the workflow are absent.
@@ -612,8 +612,13 @@ export interface OutcomePayload {
   run: RunRef;
   /** null when the run's start row is missing. */
   time: TimeBlock | null;
-  /** `close-failed` = the work finished and the close after it did not (its CI never started). */
-  ending: "done" | "close-failed";
+  /**
+   * `close-failed` = the work finished and the close after it did not (its CI never started);
+   * `held` = a local build that published nothing.
+   */
+  ending: "done" | "close-failed" | "held";
+  /** A build's resolved publish value; `false` with `held`. */
+  publish?: boolean;
   lines?: LinesBlock | null;
   steps?: StepsBlock;
   ci?: CiDispatch[];
@@ -794,7 +799,7 @@ export interface RunPayload {
     parentShas: string[];
   };
   time: TimeBlock;
-  ending: "done" | "close-failed" | "failed" | "decision-pause" | "stopped";
+  ending: "done" | "close-failed" | "failed" | "decision-pause" | "stopped" | "held";
   scan: { rows: number; afterEnd: number; settled: boolean };
   [field: string]: unknown;
 }
@@ -805,6 +810,7 @@ export const RUN_ENDINGS: Set<string> = new Set([
   "failed",
   "decision-pause",
   "stopped",
+  "held",
 ]);
 
 // ---------------------------------------------------------------------------
@@ -1703,7 +1709,13 @@ export function validate(event: unknown): ValidationResult {
     if (!OUTCOME_ENDINGS.has(e["ending"] as string)) {
       return {
         ok: false,
-        reason: `outcome ending must be done|close-failed (got: ${String(e["ending"])})`,
+        reason: `outcome ending must be ${[...OUTCOME_ENDINGS].join("|")} (got: ${String(e["ending"])})`,
+      };
+    }
+    if (e["publish"] !== undefined && typeof e["publish"] !== "boolean") {
+      return {
+        ok: false,
+        reason: `outcome publish must be a boolean (got: ${String(e["publish"])})`,
       };
     }
     const ledgers = e["ledgers"];
@@ -2207,7 +2219,7 @@ export function workflowTelemetry(result: FoldFromResult, workflow?: string): Te
       show("lines.total.files", (r) => r.lines?.total?.files);
     }
     show("plan.total.tasks", (r) => r.plan?.total?.tasks);
-    if (cur.ending === "close-failed") row("ending", "close-failed", "—");
+    if (cur.ending === "close-failed" || cur.ending === "held") row("ending", cur.ending, "—");
     // Instinct-loop deltas — friction is the featured signal (shown even at 0).
     show("ledgers.friction.added", (r) => r.ledgers?.friction?.added);
     show("ledgers.deferrals.added", (r) => r.ledgers?.deferrals?.added);
diff --git a/dist/commands/workflow/workflows.js b/dist/commands/workflow/workflows.js
index bfd74c2a3..bb3a1913b 100644
--- a/dist/commands/workflow/workflows.js
+++ b/dist/commands/workflow/workflows.js
@@ -848,6 +848,19 @@ function closeComment(cwd, outbox, o) {
         sections,
     });
 }
+/** `--ending` / `--publish` of the close verb, validated. */
+function closeEnding(f) {
+    const ending = str(f.ending);
+    if (ending !== undefined && ending !== "done" && ending !== "held")
+        throw new CommandError(EXIT.USAGE, `--ending must be done or held, got ${ending}`);
+    const publish = str(f.publish);
+    if (publish !== undefined && publish !== "true" && publish !== "false")
+        throw new CommandError(EXIT.USAGE, `--publish must be true or false, got ${publish}`);
+    return {
+        ...(ending === undefined ? {} : { ending }),
+        ...(publish === undefined ? {} : { publish: publish === "true" }),
+    };
+}
 /**
  * Grade compliance, append the workflow-done row (and, with `recordStep`, the
  * close step's row first), the counter and outcome telemetry rows, and build the
@@ -877,7 +890,15 @@ export function closeWorkflow(cwd, o, log) {
         writeStepRow(where.tree, { file: where.status, workflow, step, artifacts: [], commit: "none" }, log);
     }
     const endAt = statusTimestamp();
-    const row = { type: "workflow-done", workflow, at: endAt, parentSha };
+    const ending = o.ending ?? "done";
+    const row = {
+        type: "workflow-done",
+        workflow,
+        at: endAt,
+        parentSha,
+        ending,
+        ...(o.publish === undefined ? {} : { publish: o.publish }),
+    };
     fs.appendFileSync(where.status, appendLine(row));
     const repo = resolveRepoSlug(where.root) || "unknown/repo";
     const started = lastOfType(events, "workflow-started", workflow);
@@ -922,7 +943,8 @@ export function closeWorkflow(cwd, o, log) {
         by,
         run: { parentSha, ...(o.prNumber === undefined ? {} : { pr: o.prNumber }) },
         time: startKnown === undefined ? null : timeBlock(startKnown, Math.max(startKnown, endMs)),
-        ending: "done",
+        ending,
+        ...(o.publish === undefined ? {} : { publish: o.publish }),
         lines,
         ...(runRowsOf.length > 0 ? { steps: stepsBlock(runRowsOf) } : {}),
         ...(ci.length > 0 ? { ci } : {}),
@@ -1848,6 +1870,16 @@ export const workflowsCommand = {
                 },
                 ...COMMENT_FLAGS,
                 { name: "tree", type: "string", help: "the close comment links the tree of this ref" },
+                {
+                    name: "ending",
+                    type: "string",
+                    help: "done|held (default done); held = a local build that published nothing",
+                },
+                {
+                    name: "publish",
+                    type: "string",
+                    help: "build: true|false, the resolved publish value; recorded on the workflow-done and outcome rows",
+                },
                 {
                     name: "flush",
                     type: "boolean",
@@ -1943,6 +1975,7 @@ export const workflowsCommand = {
                     number: str(f.number),
                     title: str(f.title),
                     tree: str(f.tree),
+                    ...closeEnding(f),
                 };
                 const finalParts = finalReturnParts(ctx, input.fid);
                 if (f.flush === true) {
diff --git a/dist/ledgers/telemetry.js b/dist/ledgers/telemetry.js
index 1b140723a..0b5e302bf 100644
--- a/dist/ledgers/telemetry.js
+++ b/dist/ledgers/telemetry.js
@@ -297,13 +297,14 @@ export function mintTs(after) {
  * tokens" per build group). Rows store peaks only; readers judge them against this.
  */
 export const AGENT_CONTEXT_CAP = 160_000;
-export const OUTCOME_ENDINGS = new Set(["done", "close-failed"]);
+export const OUTCOME_ENDINGS = new Set(["done", "close-failed", "held"]);
 export const RUN_ENDINGS = new Set([
     "done",
     "close-failed",
     "failed",
     "decision-pause",
     "stopped",
+    "held",
 ]);
 // ---------------------------------------------------------------------------
 // Identity — per-kind composite tuple for dedup (NOT bare ts)
@@ -1064,7 +1065,13 @@ export function validate(event) {
         if (!OUTCOME_ENDINGS.has(e["ending"])) {
             return {
                 ok: false,
-                reason: `outcome ending must be done|close-failed (got: ${String(e["ending"])})`,
+                reason: `outcome ending must be ${[...OUTCOME_ENDINGS].join("|")} (got: ${String(e["ending"])})`,
+            };
+        }
+        if (e["publish"] !== undefined && typeof e["publish"] !== "boolean") {
+            return {
+                ok: false,
+                reason: `outcome publish must be a boolean (got: ${String(e["publish"])})`,
             };
         }
         const ledgers = e["ledgers"];
@@ -1464,8 +1471,8 @@ export function workflowTelemetry(result, workflow) {
             show("lines.total.files", (r) => r.lines?.total?.files);
         }
         show("plan.total.tasks", (r) => r.plan?.total?.tasks);
-        if (cur.ending === "close-failed")
-            row("ending", "close-failed", "—");
+        if (cur.ending === "close-failed" || cur.ending === "held")
+            row("ending", cur.ending, "—");
         // Instinct-loop deltas — friction is the featured signal (shown even at 0).
         show("ledgers.friction.added", (r) => r.ledgers?.friction?.added);
         show("ledgers.deferrals.added", (r) => r.ledgers?.deferrals?.added);
diff --git a/docs/observability.md b/docs/observability.md
index 5038e5252..deaebd811 100644
--- a/docs/observability.md
+++ b/docs/observability.md
@@ -222,7 +222,7 @@ pnpm harvest report      # rewrite harvest/stats.md only
 - Per run: a chat's tokens split by run (`usage.byRun`, main chat vs subagents). A chat belongs to a run when the run's `session` status rows name it, or same repo, issue and overlapping time; each model call goes to the run whose first-to-last status row window holds it. The run row sums them (`usage`); `null` when a chat lacks call times (Cursor, Antigravity).
 - Row shape: `.bkit/jsonl.md` § Generic Fields, § Shared Blocks, § Per-Kind Fields — every total computed from its parts at write and checked; a row that fails is not written (`[bkit-telemetry] … not written: <reason>` on stderr).
 - `run` rows: one per run in `docs/plans/<YYYYMM>/logs/<FID>/status.jsonl`, main checkout and `.worktrees/*` (largest copy wins); new row when the log grows, its counted chats change or it settles. Fields → `.bkit/jsonl.md` § Per-Kind Fields.
-  - `ending`: last end row (a close after it writes its own). `close-failed` = work done, close failed (CI never started, or a failed row), until a later close starts CI → `done`. No end row → `decision-pause` (`build-decision-*.md` `Status: OPEN`), else `stopped`. `ci` = each close's CI dispatch.
+  - `ending`: last end row (a close after it writes its own). `close-failed` = work done, close failed (CI never started, or a failed row), until a later close starts CI → `done`. No end row → `decision-pause` (`build-decision-*.md` `Status: OPEN`), else `stopped`. `held` = the last `workflow-done` row says `ending: held` (a local build that published nothing; the row and the `outcome` row also carry `publish: false`). `ci` = each close's CI dispatch.
   - Active minutes: chat spans (main + subagents) split at gaps over 5 min; a run's = overlap with the spans of counted chats naming its issue (command or summary); per step too. A tool call over 5 min counts as idle.
   - Steps: count, total minutes (since the previous status row; `session` / `owner-pause` / `owner-answer` rows skipped), active minutes; `steps.total` beside `steps.byStep`.
   - Owner waits (`owner`): each stop from an `owner-pause` row to the next `owner-answer`, with its reason; open stops marked; minutes since the same log's previous run.
diff --git a/scripts/harvest/bkit-harvest.mjs b/scripts/harvest/bkit-harvest.mjs
index 78a0ea255..f05cf100f 100644
--- a/scripts/harvest/bkit-harvest.mjs
+++ b/scripts/harvest/bkit-harvest.mjs
@@ -81,7 +81,7 @@
  *            `workflow-done` row's, else its last close step's, else null), parentShas (every
  *            commit its status rows name)
  *   time     start, end, totalMinutes, activeMinutes, activeFrom {chats, bytes}, lastActivity
- *   ending   `done` | `close-failed` | `failed` | `decision-pause` | `stopped`
+ *   ending   `done` | `close-failed` | `failed` | `decision-pause` | `stopped` | `held`
  *   ci       one entry per close step that dispatched CI: {status, reason?, attempts}
  *   steps    total {n, totalMinutes, activeMinutes}, byStep {<step>: {n, totalMinutes,
  *            activeMinutes}}; a step's minutes run from the row before it that is not a mark row
@@ -1448,9 +1448,10 @@ const joinSha = (run) =>
  * `workflow-done` and the close after it failed: its last close found CI never started
  * (`ciDispatch.outcome: "unresolved"`), or a `workflow-failed` row came after the done row with
  * no close after it. With no end row, `decision-pause` when its `build-decision-<run>-*.md` is
- * still `Status: OPEN`, else `stopped`.
+ * still `Status: OPEN`, else `stopped`. `held` when the last `workflow-done` row says `ending: held`.
  */
 export function endingOf(run, dir, ordinal) {
+  if (run.rows.findLast((r) => r.type === "workflow-done")?.ending === "held") return "held";
   // splitRuns keeps only close steps after an end row, so a done row before the last end row
   // means the work finished and anything after it is the close.
   if (run.end && run.rows.some((r) => r.type === "workflow-done")) {
@@ -4210,7 +4211,7 @@ export function renderReport(ledgerRows, names, now = Date.now(), logDirs = new
   out.push(
     "## Workflow runs, from the run logs\n\n" +
       "Every run is listed; one whose log changed within the settle window is **open**: counted here, left out of the medians. " +
-      "**Ending**: `done` / `failed` from its last end row; `close-failed` = the work wrote `workflow-done` and only the close after it failed, or its last close found CI never started (a later close that started CI → `done`); with no end row, `decision-pause` when its `build-decision-*.md` is still `Status: OPEN`, else `stopped`. **Close CI not started**: closes, counted one by one, whose `ciDispatch` found CI never started, by reason.\n",
+      "**Ending**: `done` / `failed` from its last end row; `close-failed` = the work wrote `workflow-done` and only the close after it failed, or its last close found CI never started (a later close that started CI → `done`); with no end row, `decision-pause` when its `build-decision-*.md` is still `Status: OPEN`, else `stopped`; `held` = the last `workflow-done` row says `ending: held` (a local build that published nothing). **Close CI not started**: closes, counted one by one, whose `ciDispatch` found CI never started, by reason.\n",
   );
   const wfs = uniq(runs.map(wfOf)).sort();
   /** Median of the known values, `-` when none is known; with how many runs it covers when not all. */
@@ -4220,7 +4221,7 @@ export function renderReport(ledgerRows, names, now = Date.now(), logDirs = new
     const m = Math.round(median(known));
     return known.length === xs.length ? m : `${m} (${known.length} of ${xs.length})`;
   };
-  const endings = ["done", "close-failed", "failed", "decision-pause", "stopped"];
+  const endings = ["done", "close-failed", "failed", "decision-pause", "stopped", "held"];
   out.push(
     table(
       [
diff --git a/scripts/harvest/bkit-harvest.test.mjs b/scripts/harvest/bkit-harvest.test.mjs
index 44fe3f7ff..a3cf641bf 100644
--- a/scripts/harvest/bkit-harvest.test.mjs
+++ b/scripts/harvest/bkit-harvest.test.mjs
@@ -1272,6 +1272,61 @@ await test("endingOf: a failure only at close is close-failed; a later close tha
   );
 });
 
+await test("derives held from a workflow-done row ending held", () => {
+  const rows = [
+    { type: "workflow-started", workflow: "build", at: at(0) },
+    { type: "workflow-done", workflow: "build", at: at(1), ending: "held", publish: false },
+  ];
+  assert.equal(endingOf(splitRuns(rows)[0], logDir, 1), "held");
+});
+
+await test("keeps a normal done run as done", () => {
+  const rows = [
+    { type: "workflow-started", workflow: "build", at: at(0) },
+    { type: "workflow-done", workflow: "build", at: at(1), ending: "done" },
+  ];
+  assert.equal(endingOf(splitRuns(rows)[0], logDir, 1), "done");
+  const bare = [rows[0], { type: "workflow-done", workflow: "build", at: at(1) }];
+  assert.equal(endingOf(splitRuns(bare)[0], logDir, 1), "done");
+});
+
+await test("counts held runs in the workflow report", () => {
+  const run = (start, ending) => ({
+    ts: start,
+    kind: "run",
+    repo: repoFp("acme/widget"),
+    bkitVersion: "5.5.1",
+    workflow: "build",
+    step: "scan",
+    key: `k:${start}`,
+    fid: fingerprint(`acme/widget:${FID}`),
+    issue: issueFp("acme/widget", 650),
+    run: 1,
+    start,
+    end: start + 60_000,
+    lastActivityAt: start + 60_000,
+    minutes: 1,
+    activeMinutes: null,
+    activeFrom: null,
+    ending,
+    steps: {},
+    closeCi: [],
+    settled: true,
+  });
+  const md = renderReport(
+    [
+      ...readLedger(statsFile).filter((r) => r.kind === "chat"),
+      run(T0, "held"),
+      run(T0 + DAY, "held"),
+      run(T0 + 2 * DAY, "done"),
+    ],
+    new Map([[fingerprint(`acme/widget:${FID}`), FID]]),
+    T0 + 5 * DAY,
+  );
+  assert.match(md, /\| decision-pause \| stopped \| held \|/);
+  assert.match(md, /\| build \| 3 \| 0 \| 1 \| 0 \| 0 \| 0 \| 0 \| 2 \|/);
+});
+
 await test("scan appends one run row per finished run, with fingerprints and no FID text", async () => {
   const res = await scan({
     hosts: hostsFor(home, ["claude-code"]),
@@ -1929,7 +1984,7 @@ await test("the report lists open runs, marked, and leaves them out of the media
     new Map([[fingerprint(`acme/widget:${FID}`), FID]]),
     T0 + 2 * DAY,
   );
-  assert.match(md, /\| build \| 2 \| 1 \| 1 \| 0 \| 0 \| 0 \| 1 \| 100 \| 100 \|/);
+  assert.match(md, /\| build \| 2 \| 1 \| 1 \| 0 \| 0 \| 0 \| 1 \| 0 \| 100 \| 100 \|/);
   assert.match(md, /\| 650-secret-feature \(open\) \| 5\.5\.1 \| stopped \| 7 \|/);
   assert.match(
     md,
