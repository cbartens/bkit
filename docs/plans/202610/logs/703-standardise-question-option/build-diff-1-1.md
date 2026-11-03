diff --git a/.bkit/core/engine/commands/workflow/decisions.test.ts b/.bkit/core/engine/commands/workflow/decisions.test.ts
index b4aee8ff1..1c22336e6 100644
--- a/.bkit/core/engine/commands/workflow/decisions.test.ts
+++ b/.bkit/core/engine/commands/workflow/decisions.test.ts
@@ -95,13 +95,22 @@ describe("bkit decisions compose", () => {
expect(text).toContain(
"**Q1 — Task 3 [src/a.ts:10]:** MEDIUM: the retry has no cap. Accept it?",
);

- expect(text).toContain("Recommended: Fix now — a secret reaches the log");

* expect(text).toContain("Recommended: B) Fix now — a secret reaches the log");
  expect(text).toContain("No recommendation — only the owner can waive test-first");
  expect(text.trimEnd().split("\n").at(-1)).toBe(
  'Reply per question. "yes" takes every recommendation. "stop" writes a handover; the run can be resumed.',
  );
  });

* it("compose letters every option and the recommended one", async () => {
* const { root, logs } = checkout();
* const { out } = await compose(root, logs, [ITEMS[1]]);
* const text = fs.readFileSync(out, "utf-8");
* expect(text).toContain("Options: A) Accept / B) Fix now");
* expect(text).toContain("Recommended: B) Fix now — a secret reaches the log");
* expect(text).not.toContain("Options: Accept / Fix now");
* });
* it("refuses an item whose recommendation is not one of its options", async () => {
  const { root, logs } = checkout();
  const bad = [{ ...ITEMS[0], recommended: "Maybe" }];
  @@ -146,10 +155,44 @@ describe("bkit decisions compose", () => {
  expect(text).toContain("build verify: attempt 2 of 2");
  expect(text).toContain("Problems after each round: 4 → 4");
  expect(text).toMatch(/\*\*Q1 — Verify:\*\* decide the items below/);

- expect(text).toContain("Options: Try again / Decide");

* expect(text).toContain("Options: A) Try again / B) Decide");
  expect(text).toContain("**Q2 — Task 3 [src/a.ts:10]:**");
  });

* it("--loop letters the loop question's options and recommendation", async () => {
* const { root, logs } = checkout();
* const status = path.join(logs, "status.jsonl");
* fs.writeFileSync(
*      status,
*      [
*        { type: "workflow-started", workflow: "build", at: "2026-10-01T00:00:00Z" },
*        {
*          type: "step-done",
*          workflow: "build",
*          step: "build-plan-verify",
*          status: "DONE",
*          at: "2026-10-01T00:10:00Z",
*          group: 1,
*          failures: 2,
*        },
*      ]
*        .map((x) => JSON.stringify(x))
*        .join("\n") + "\n",
* );
* const { out } = await compose(
*      root,
*      logs,
*      ITEMS,
*      "--loop=verify",
*      `--file=${status}`,
*      "--group=1",
* );
* const text = fs.readFileSync(out, "utf-8");
* expect(text).toContain("Options: A) Try again / B) Decide");
* expect(text).not.toContain("Options: Try again / Decide");
* expect(text).toMatch(/Recommended: [AB]\) (Try again|Decide) — /);
* });
* it("--loop needs --file", async () => {
  const { root, logs } = checkout();
  expect((await compose(root, logs, ITEMS, "--loop=verify")).r.code).toBe(2);
  @@ -212,6 +255,44 @@ describe("bkit decisions apply --by=headless", () => {
  });
  });

+describe("parseDecisionItems", () => {

- it("parseDecisionItems keeps the bare option name, dropping the letter", () => {
- const text = [
-      "Status: OPEN",
-      "",
-      "**Q1 — Task 3 [src/a.ts:10]:** accept it?",
-      "Options: A) Accept / B) Fix now",
-      "Recommended: B) Fix now — a secret reaches the log",
-      "",
- ].join("\n");
- const item = parseDecisionItems(text)[0]!;
- expect(item.options).toEqual(["Accept", "Fix now"]);
- expect(item.recommended).toBe("Fix now");
- expect(item.reason).toBe("a secret reaches the log");
- });
-
- it("a decision file written before the letters still parses", () => {
- const legacy = [
-      "Status: OPEN",
-      "",
-      "**Q1 — Task 3 [src/a.ts:10]:** accept it?",
-      "Options: Accept / Fix now",
-      "Recommended: Accept — the caller already caps it",
-      "",
- ].join("\n");
- const items = parseDecisionItems(legacy);
- expect(items[0]!.options).toEqual(["Accept", "Fix now"]);
- expect(items[0]!.recommended).toBe("Accept");
- const lettered = parseDecisionItems(
-      legacy
-        .replace("Options: Accept / Fix now", "Options: A) Accept / B) Fix now")
-        .replace("Recommended: Accept —", "Recommended: A) Accept —"),
- );
- expect(lettered[0]!.options).toEqual(items[0]!.options);
- expect(lettered[0]!.recommended).toEqual(items[0]!.recommended);
- });
  +});
-

describe("applyRecommendations", () => {
it("a Try again loop answer settles the loop alone; the items wait for the next round", () => {
const text = [
@@ -230,6 +311,20 @@ describe("applyRecommendations", () => {
expect(r).toMatchObject({ applied: [1], hardBlockers: [], loop: "Try again" });
expect(parseDecisionItems(r.text)[1]!.decision).toBeNull();
}); +

- it("a lettered recommendation still settles its item by name", () => {
- const text = [
-      "Status: OPEN",
-      "",
-      "**Q1 — Gap:** accept it?",
-      "Options: A) Accept / B) Fix now",
-      "Recommended: A) Accept — minor",
-      "",
- ].join("\n");
- const r = applyRecommendations(text, "LOCAL", "ask:false");
- expect(r).toMatchObject({ applied: [1], hardBlockers: [], loop: null });
- expect(parseDecisionItems(r.text)[0]!.decision).toMatch(/^Accept \(assumed\) — minor \(/);
- });
  });

describe("bkit decisions apply --by=owner and pending", () => {
@@ -304,6 +399,15 @@ describe("bkit decisions apply --by=owner and pending", () => {
expect((await pending(root)).json.count).toBe(0);
});

- it("--defer letters the options in the deferral row", async () => {
- const { root } = await assumed();
- await pending(root, "--defer");
- const row = JSON.parse(
-      fs.readFileSync(path.join(root, "docs/deferrals.jsonl"), "utf-8").trim().split("\n")[0]!,
- );
- expect(row.description).toContain("Options: A) Accept / B) Fix now");
- });
- it("refuses a malformed --month", async () => {
  const { root } = checkout();
  expect((await run(["decisions", "pending", "--fid=7-x", "--month=2026-10"], root)).code).toBe(
  diff --git a/.bkit/core/engine/commands/workflow/decisions.ts b/.bkit/core/engine/commands/workflow/decisions.ts
  index 24e421f6f..3dcf36e0d 100644
  --- a/.bkit/core/engine/commands/workflow/decisions.ts
  +++ b/.bkit/core/engine/commands/workflow/decisions.ts
  @@ -4,8 +4,8 @@
  // lines, an optional progress block, then one item per question:
  //
  // **Q{n} — {title}:** {question}
  -// Options: {A} / {B}
  -// Recommended: {A} — {reason} (a hard blocker: `No recommendation — {why}`)
  +// Options: A) {A} / B) {B}
  +// Recommended: A) {A} — {reason} (a hard blocker: `No recommendation — {why}`)
  // Decision: {answer} — {words} (once decided)
  //
  // `apply --by=headless` takes each recommendation when nobody can or should be asked: an
  @@ -48,6 +48,17 @@ const ITEM_SPLIT = /^(?=\*\*Q\d+ — )/m;
  const lineOf = (text: string, key: string): string | null =>
  new RegExp(`^${key}:[ \\t]*(.+?)[ \\t]*$`, "m").exec(text)?.[1] ?? null;

+/** `A`, `B`, … for option index `i`. _/
+const letterAt = (i: number): string => String.fromCharCode(65 + i);
+/_* An option entry's leading letter (`A) `) dropped, so a parsed name stays bare. _/
+const bareName = (s: string): string => s.replace(/^[A-Z]\)[ \t]_/, "");
+/** The option list as it is written: `A) {A} / B) {B}`. */
+const letteredOptions = (options: string[]): string =>

- options.map((o, i) => `${letterAt(i)}) ${o}`).join(" / ");
  +/** The letter `name` holds in `options`, or null when it is not one of them. */
  +const letterOf = (options: string[], name: string): string | null =>
- options.includes(name) ? letterAt(options.indexOf(name)) : null;
-

/** The items of a decision file's text, in file order. */
export function parseDecisionItems(text: string): DecisionItem[] {
return text
@@ -65,9 +76,9 @@ export function parseDecisionItems(text: string): DecisionItem[] {
text: part.trimEnd(),
options: (lineOf(part, "Options") ?? "")
.split(" / ")

-          .map((o) => o.trim())

*          .map((o) => bareName(o.trim()))
           .filter(Boolean),

-        recommended: none || rec === null ? null : (option ?? "").trim(),

*        recommended: none || rec === null ? null : bareName((option ?? "").trim()),
         reason: why.join(" — ").trim(),
         decision,
         assumed: decision !== null && /^Accept \(assumed\)/.test(decision),

@@ -174,13 +185,17 @@ function composeItems(raw: unknown): ComposeItem[] {
});
}

-const itemLines = (n: number, it: ComposeItem): string[] => [

- `**Q${n} — ${it.title}:** ${it.question}`,
- `Options: ${it.options.join(" / ")}`,
- it.noRecommendation
- ? `No recommendation — ${it.noRecommendation}`
- : `Recommended: ${it.recommended} — ${it.reason || "the orchestrator's call"}`,
  -];
  +const itemLines = (n: number, it: ComposeItem): string[] => {

* const rec = it.recommended ?? "";
* const letter = letterOf(it.options, rec);
* return [
* `**Q${n} — ${it.title}:** ${it.question}`,
* `Options: ${letteredOptions(it.options)}`,
* it.noRecommendation
*      ? `No recommendation — ${it.noRecommendation}`
*      : `Recommended: ${letter === null ? rec : `${letter}) ${rec}`} — ${it.reason || "the orchestrator's call"}`,
* ];
  +};

// ---------------------------------------------------------------------------
// apply
@@ -245,7 +260,7 @@ function deferralRow(file: string, it: DecisionItem): Record<string, unknown> {
severity,
reason: "needs-decision",
summary: `${fid}: ${it.title} accepted without the owner (${ref})`,

- description: `Decision needed: accept or fix "${it.title}". Options: ${it.options.join(" / ")}. ${it.rejected ? "The owner rejected the assumed accept at ship." : "Nobody confirmed the assumed accept before the merge."} Item: ${it.text.split("\n")[0]}`,

* description: `Decision needed: accept or fix "${it.title}". Options: ${letteredOptions(it.options)}. ${it.rejected ? "The owner rejected the assumed accept at ship." : "Nobody confirmed the assumed accept before the merge."} Item: ${it.text.split("\n")[0]}`,
  status: "OPEN",
  };
  }
  diff --git a/.bkit/friction.jsonl b/.bkit/friction.jsonl
  index 3ea95ee05..64bc03a1d 100644
  --- a/.bkit/friction.jsonl
  +++ b/.bkit/friction.jsonl
  @@ -1 +1,2 @@
  {"schema":3,"ts":1792989246062,"kind":"friction","key":"worktree-copy-gitignored-file-commit-failure","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-worktree-setup"},"references":["700","702","f4273d2ca"],"category":"tool-failure","scope":"universal","severity":"HIGH","summary":"Repeated `bkit steps finish` commit failures (exit 8) on a worktree whose worktree.copy names a gitignored file; the run had to abort at Step 2","description":"On build run 1 of 700-session-start-nudge the Step 2 `bkit steps finish` exited 8 (EXIT_COMMIT): the row landed but `git add -A -- . :(exclude).bkit/.env` refused because `.bkit/.env` is gitignored and was copied into the worktree by `bkit worktrees setup`. Every subsequent commit would fail the same way, so the run could not persist work and was routed to the Failure Path; `bkit workflows fail` and the handover push then ran (the handover commit succeeded via a different path). Root cause recorded as failures key `worktree-copy-gitignored-file-breaks-commit`.","status":"OPEN"}
  +{"schema":3,"ts":1793002242358,"kind":"friction","key":"build-group-commit-blocked-by-dist-freshness-hook-when-plan-schedules-rebuild-late","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-execute"},"category":"tool-failure","scope":"bkit-repo","severity":"MEDIUM","summary":"build Step 6 group commit blocked by the dist freshness hook because the plan scheduled the dist rebuild after the engine source change","description":"The plan for 703 edits non-test engine source in .bkit/core/engine/commands/workflow/decisions.ts (GROUP 1, TASK 1) but schedules the mandated `pnpm build` dist rebuild as TASK 6 in GROUP 3. bkit's own pre-commit hook runs `pnpm bkit:check:dist` on any staged non-test .bkit/core/engine/**/\*.ts change, so the Step 6 build-plan-execute commit failed with exit 8 (row written, commit failed) and every later step commit would fail the same way until dist is rebuilt. Recovery was the planned TASK 6 work (`pnpm build`) executed early, then `steps finish` re-run.","remediation":"Plan-convert must fold the `pnpm build` dist rebuild into the same task as any non-test engine source edit, or place the rebuild task in the earliest group that changes engine source (KN-7).","source":"orchestrator","status":"OPEN"}
  diff --git a/dist/commands/workflow/decisions.js b/dist/commands/workflow/decisions.js
  index fbf670fe8..d0254c35f 100644
  --- a/dist/commands/workflow/decisions.js
  +++ b/dist/commands/workflow/decisions.js
  @@ -4,8 +4,8 @@
  // lines, an optional progress block, then one item per question:
  //
  // **Q{n} — {title}:** {question}
  -// Options: {A} / {B}
  -// Recommended: {A} — {reason} (a hard blocker: `No recommendation — {why}`)
  +// Options: A) {A} / B) {B}
  +// Recommended: A) {A} — {reason} (a hard blocker: `No recommendation — {why}`)
  // Decision: {answer} — {words} (once decided)
  //
  // `apply --by=headless` takes each recommendation when nobody can or should be asked: an
  @@ -26,6 +26,14 @@ import { positiveInt, str } from "./status.js";
  export const EXIT_HARD_BLOCKERS = 4;
  const ITEM_SPLIT = /^(?=\*\*Q\d+ — )/m;
  const lineOf = (text, key) => new RegExp(`^${key}:[ \\t]*(.+?)[ \\t]*$`, "m").exec(text)?.[1] ?? null;
  +/** `A`, `B`, … for option index `i`. _/
  +const letterAt = (i) => String.fromCharCode(65 + i);
  +/_* An option entry's leading letter (`A) `) dropped, so a parsed name stays bare. _/
  +const bareName = (s) => s.replace(/^[A-Z]\)[ \t]_/, "");
  +/** The option list as it is written: `A) {A} / B) {B}`. _/
  +const letteredOptions = (options) => options.map((o, i) => `${letterAt(i)}) ${o}`).join(" / ");
  +/_* The letter `name` holds in `options`, or null when it is not one of them. _/
  +const letterOf = (options, name) => options.includes(name) ? letterAt(options.indexOf(name)) : null;
  /_* The items of a decision file's text, in file order. */
  export function parseDecisionItems(text) {
  return text
  @@ -43,9 +51,9 @@ export function parseDecisionItems(text) {
  text: part.trimEnd(),
  options: (lineOf(part, "Options") ?? "")
  .split(" / ")

-                .map((o) => o.trim())

*                .map((o) => bareName(o.trim()))
                 .filter(Boolean),

-            recommended: none || rec === null ? null : (option ?? "").trim(),

*            recommended: none || rec === null ? null : bareName((option ?? "").trim()),
             reason: why.join(" — ").trim(),
             decision,
             assumed: decision !== null && /^Accept \(assumed\)/.test(decision),

@@ -128,13 +136,17 @@ function composeItems(raw) {
};
});
}
-const itemLines = (n, it) => [

- `**Q${n} — ${it.title}:** ${it.question}`,
- `Options: ${it.options.join(" / ")}`,
- it.noRecommendation
-        ? `No recommendation — ${it.noRecommendation}`
-        : `Recommended: ${it.recommended} — ${it.reason || "the orchestrator's call"}`,

-];
+const itemLines = (n, it) => {

- const rec = it.recommended ?? "";
- const letter = letterOf(it.options, rec);
- return [
-        `**Q${n} — ${it.title}:** ${it.question}`,
-        `Options: ${letteredOptions(it.options)}`,
-        it.noRecommendation
-            ? `No recommendation — ${it.noRecommendation}`
-            : `Recommended: ${letter === null ? rec : `${letter}) ${rec}`} — ${it.reason || "the orchestrator's call"}`,
- ];
  +};
  // ---------------------------------------------------------------------------
  // apply
  // ---------------------------------------------------------------------------
  @@ -192,7 +204,7 @@ function deferralRow(file, it) {
  severity,
  reason: "needs-decision",
  summary: `${fid}: ${it.title} accepted without the owner (${ref})`,

*        description: `Decision needed: accept or fix "${it.title}". Options: ${it.options.join(" / ")}. ${it.rejected ? "The owner rejected the assumed accept at ship." : "Nobody confirmed the assumed accept before the merge."} Item: ${it.text.split("\n")[0]}`,

-        description: `Decision needed: accept or fix "${it.title}". Options: ${letteredOptions(it.options)}. ${it.rejected ? "The owner rejected the assumed accept at ship." : "Nobody confirmed the assumed accept before the merge."} Item: ${it.text.split("\n")[0]}`,
         status: "OPEN",
  };
  }
  diff --git a/docs/knowledge.jsonl b/docs/knowledge.jsonl
  index e1048d60b..831cd3f47 100644
  --- a/docs/knowledge.jsonl
  +++ b/docs/knowledge.jsonl
  @@ -307,3 +307,4 @@
  {"schema":2,"ts":1792718454116,"kind":"knowledge","key":"tracker-true-block-between-group-and-false-block-breaks-none-render","repo":"cbartens/bkit","bkit":{"version":"5.5.1"},"by":{"workflow":"build","step":"build-challenge-remediate","subagent":"bkit-build-challenge-remediate","model":"claude-sonnet-5-5"},"summary":"A standalone tracker true block placed between a github/linear/jira group and its false block makes the none render print a spurious No tracker connected stub","rootCause":"The tracker renderer pairs the github, linear and jira blocks with a false block only when the false block follows the group directly; anything between them leaves the group unpaired and it renders the NONE_STUB line under none, while the false block then renders as a separate standalone block.","remediation":"Order a Step 1 tracker region as github, linear, jira, false, then any standalone true block. After editing workflow sources, run the none render baselines (trackers.test.ts) and read the snapshot diff for a stray stub line.","status":"ACTIVE"}
  {"schema":2,"ts":1792718455123,"kind":"knowledge","key":"wording-retired-prefix-of-new-text-and-loose-list-items","repo":"cbartens/bkit","bkit":{"version":"5.5.1"},"by":{"workflow":"build","step":"build-challenge-remediate","subagent":"bkit-build-challenge-remediate","model":"claude-sonnet-5-5"},"summary":"A retired wording that is a prefix of its new text makes pnpm wording:sync re-expand synced lines; a blank line inside a workflow list item makes prettier pad every block in it","rootCause":"wording:sync rewrites any line that starts with a retired text into the clause text, so a retired block equal to the first part of the new text appends the new tail again on every run. Separately, one blank line inside a markdown list item makes prettier treat the item as loose and insert blank lines around every block in it, including tracker marker lines that must stay tight.","remediation":"When the old clause text is a prefix of the new one, leave the old text out of the retired block. In a tracker-block list item, keep the block free of blank lines (put the else-case in the lead-in sentence or as a Route bullet), then run prettier --check on the workflow files and wording:sync twice to confirm it is idempotent.","status":"ACTIVE"}
  {"schema":2,"ts":1792747332665,"kind":"knowledge","key":"identity-gated-prune-destroys-fold-losers-truncated-friction-keys-collide","repo":"cbartens/bkit","bkit":{"version":"5.5.1"},"by":{"workflow":"utility","step":"manual","subagent":"bkit-utility-update-knowledge","model":"claude-opus-5-5"},"references":["343","234","scripts/harvest/ledgers.ts",".bkit/core/engine/ledgers/telemetry.ts (identity, VALID_KINDS)","docs/observability.md § [bkit-harvest] prefix","8badea26","abe49983","683"],"summary":"A prune gated on identity destroys rows the dedup fold dropped — friction keys truncate to ~68 chars and collide, so two distinct entries share one identity and only one is ever stored","description":"Found while making bkit harvest MOVE consumer friction (#343). fold() is last-write-wins per identity(), so colliding rows collapse to ONE stored row. An identity-gated prune then deletes EVERY colliding row from the consumer while the store kept one — the loser exists nowhere. Reproduced against live consumer-a data: 'Plan Step 11: close-workflow STRAY guard rejects protocol-mandated docs/pending.md edit' (ts 1783944967776) and a different entry about docs/decisions.md + docs/pending.md edits truncate to the byte-identical key 'friction-plan-step-11-close-workflow-stray-guard-rejects-protocol-ma'; the first was destroyed. Harmless under the old copy-only harvest, fatal the moment harvest deletes. Second instance of the same shape: identity() has no default branch, so rows whose kind is outside VALID_KINDS all collide on undefined — live data has kind:'tool-failure' and kind:'agent-rework' rows in consumer-a friction, and the newer evicted the older from the store.","rootCause":"identity() is a lossy projection of a row (kind+repo+key, or ts when key is absent), and fold() treats an identity match as an upsert. Anything gating a DELETE on that projection deletes rows the projection cannot distinguish. Two independent sources of collision: (1) friction keys are truncated at write time, so distinct content yields identical keys; (2) identity() returns undefined for kinds outside VALID_KINDS, mapping every unknown-kind row onto a single fold slot.","remediation":"Gate any destructive drain on byte-for-byte row CONTENT read back off disk, never on identity, and keep a store of every DISTINCT row (content dedup), never of fold winners — `scripts/harvest/ledgers.ts` header invariants (the harvest, `pnpm harvest`). The same gate covers friction rows and the `chat` / `run` rows pruned from `.bkit/stats.jsonl`. A fold loser is then stored and safe to prune; consumer lines not in the store stay and are logged (`kept N line(s) not in the store`). `identity()` (`.bkit/core/engine/ledgers/telemetry.ts`) still has no branch for kinds outside VALID_KINDS — never gate a delete on it. General rule: an identity used for dedup/upsert is NOT safe as a delete gate.","status":"ACTIVE"}
  +{"schema":3,"ts":1793002056434,"kind":"knowledge","key":"prettier-check-fails-on-generated-build-task-red-and-build-brief-logs","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-execute","subagent":"bkit-build-plan-execute","model":"openrouter/deepseek-v4.1-flash"},"references":["docs/plans/202610/logs/703-standardise-question-option/build-task-red-1-1-1.md",".prettierignore"],"summary":"`pnpm format:check` fails on the raw gate logs a build writes under `docs/plans/*/logs/*/` (`build-task-red-*.md`, `build-brief-*.md`) because `.prettierignore` lists only some generated-log families; running prettier --write on them mangles the raw command output, so add an ignore pattern instead","description":"- **Category:** tooling\n- **Symptom:** `pnpm format:check` (`prettier --check .`) reports `[warn]` for the files a build run just generated under `docs/plans/{YYYYMM}/logs/{FID}/`: the `build-task-red-{RUN}-{TASK}-{POS}.md` evidence logs written by `bkit tests red` and the `build-brief-{GROUP}-{N}.md` briefs written by the group start. Lint and typecheck stay green, so the gate fails only on these logs, and the failure appears the moment a red is recorded, before any task code is written.\n- **Root cause:** `.prettierignore` enumerates the raw gate output it must skip (`run-tests-*`, `build-group-gate-*`, `build-subplan-gate-*`, `context-tests-local-*`) but never gained entries for the red-evidence logs or the group briefs. `bkit tests red` saves the runner's own stdout, so when the runner also prints a per-test tree and its transform hint the file is not prettier-stable as markdown, and prettier reflows it.\n- **Fix or rule:** NEVER `prettier --write` a red-evidence log — prettier rewrites the raw runner output (it reflows the indented vitest test tree and deletes the leading blank line), which is evidence, not markdown. Add the missing families to `.prettierignore` (`docs/plans/*/logs/*/build-task-red-*.md`, `docs/plans/*/logs/*/build-brief-*.md`) beside the existing raw-gate-output entries; a red log that happens to be prettier-stable is luck, not a contract. Confirm the source files the task owns are clean with a targeted `prettier --check` on them, and leave the generated logs to the format-fallout step.\n- **Type:** gotcha\n- **Confidence:** high\n- **Severity:** low\n- **Scope:** bkit-repo\n- **Source:** agent\n- **Related:** `.prettierignore` (ignored-logs block); `bkit tests red` log writer in `.bkit/core/engine/commands/workflow/tests.ts`.","rootCause":".prettierignore enumerates the raw gate output it must skip (run-tests-_, build-group-gate-_, build-subplan-gate-_, context-tests-local-_) but has no entry for build-task-red-* or build-brief-*. bkit tests red saves the runner's own stdout, so a run whose output prettier would reflow leaves `pnpm format:check` failing on evidence logs.","remediation":"Add `docs/plans/*/logs/*/build-task-red-*.md` and `docs/plans/*/logs/*/build-brief-*.md` to `.prettierignore` beside the existing raw-gate-output entries. Never prettier --write a red-evidence log: prettier rewrites the raw runner output it holds. Verify the task's own source files with a targeted prettier --check instead.","status":"ACTIVE"}
