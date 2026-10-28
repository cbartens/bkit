diff --git a/.agents/plugins/bkit/agents/bkit-build-plan-convert.md b/.agents/plugins/bkit/agents/bkit-build-plan-convert.md
index 889c2fb21..f9b8b5bec 100644
--- a/.agents/plugins/bkit/agents/bkit-build-plan-convert.md
+++ b/.agents/plugins/bkit/agents/bkit-build-plan-convert.md
@@ -31,6 +31,7 @@ tools:
 - **Input dates:** Where two sections of the `*-input-*.md` file disagree, the newer one wins; older text still counts wherever nothing newer contradicts it.
 - **Same scope:** Every task traces to the input file or the existing plan; add no work they do not ask for, drop none they do.
 - **No anchor authoring:** Do not author `<!-- bkit:anchor` block; keep an existing one byte-for-byte.
+- **Matrix shape:** The plan's `Derived Test Matrix` has a `Task` column beside `Test description`, `Type` and `Target file`; each cell names the one runbook task that lands that row's test.
 - **Runbook tasks:** The runbook is groups of task blocks in build order (schema, then API, then UI). A group is `<!-- bkit:group N start -->`, `### GROUP N: {title}`, its task blocks and `<!-- bkit:group N end -->`, holding tasks and `TEST FIRST` tests within the per-group plan caps your Context names (`bkit.workflows.tasks`: tasks, and `TEST FIRST` tests in all); bigger → split the group. A task is `<!-- bkit:task N start -->`, `- [ ] **TASK N:** {title}`, one sub-bullet per field and `<!-- bkit:task N end -->`, its number unique across the plan. Fields, uppercase: `**CREATE:**` / `**READ:**` / `**UPDATE:**` / `**DELETE:**` (`` `{symbol}` in `{file}`: {what} `` or `` `{file}`: {what} ``, one line per reference), `**DEPENDS ON:**` (task numbers, same or earlier group), `**DONE WHEN:**`, `**TEST FIRST:**`, `**TEST EXCEPTION:**`; `bkit tests plan-check` refuses task-like text outside every block. `DONE WHEN` is short, testable and checkable in the codebase (a file exists, a signature matches, a test passes, a behaviour shows). A task that adds or changes logic names its own tests and fixes the tests it breaks; no task leaves its tests to a later one. Behaviour tests come only from `Derived Test Matrix` rows, and a task crossing a boundary (DB, API, model, network, migration) pairs them with non-mock tests. An audit plan has one task per in-scope finding id; tasks group findings only on one shared root cause and still name every id.
 - **TEST FIRST:** Each task carries a `**TEST FIRST:**` field after `DONE WHEN`. A behaviour change at the unit or integration tier lists one or more tests, within the per-task plan caps your Context names (tests, test files), one sub-bullet per test, each `` `{test file}` `` `` `{test name}` `` fails on {what goes wrong}: a repo-relative test file, the test name as the runner reports it or its last segments, and {what goes wrong} as the wrong behaviour a stub shows, not a literal assertion. More tests or files → split the task. No behaviour change (docs, config, pure refactor) or E2E / `@live` tier only → `n/a — {reason naming which}` on the field line.
 - **TEST EXCEPTION:** ONLY the human writes a `**TEST EXCEPTION:**` field, or the build orchestrator after the human approves it; never write one on your own judgement. It sits inside the task's block, with entries in `TEST FIRST` form each ending `— {reason}`.
diff --git a/.agents/plugins/bkit/agents/bkit-build-plan-current.md b/.agents/plugins/bkit/agents/bkit-build-plan-current.md
index 4b215ad1d..b5bf8c4e7 100644
--- a/.agents/plugins/bkit/agents/bkit-build-plan-current.md
+++ b/.agents/plugins/bkit/agents/bkit-build-plan-current.md
@@ -53,11 +53,11 @@ tools:
 2. Re-read all supplied inputs once at session start; do not trust session memory.
 3. Read `.agents/docs.md` → load docs for workflow / step / task; skip missing.
 4. Update **Create** after each affected task — append log at EOF via Bash `echo {log entry} >> {output}`; heredoc for multi-line. **If** any task `Broken` → set `Verdict` = `FAIL` via `Edit` immediately; do not defer to final pass.
-5. Per plan task block, record paths, symbols, and commands its `CREATE` / `READ` / `UPDATE` / `DELETE` and `DONE WHEN` fields depend on → in-scope set.
-6. Run `git diff --name-only {BASE_SHA}..origin/dev` → changed-path list. Task matches on any in-scope path in that list. For each task with no path match run `git diff {BASE_SHA}..origin/dev -S{needle} --name-only` per in-scope symbol and command; non-empty output → matched on that needle:
-   - **If** no tasks match → no affected tasks; do not read any diff.
-   - **Else** → continue with matched tasks only.
-7. Per matched task, run `git diff {BASE_SHA}..origin/dev -- {path}` for its matched paths and read it; needle match → paths named by that needle `-S` output; never diff whole range; never read paths outside match set.
+5. Per plan task block, record the paths, symbols, and commands its `CREATE` / `READ` / `UPDATE` / `DELETE` and `DONE WHEN` fields depend on → in-scope set.
+6. Run `bkit tasks currency --plan={plan file} --base={BASE_SHA} --against=origin/dev` → each task whose in-scope path or symbol moved in `{BASE_SHA}...origin/dev`, with its matched paths, needles and diff hunks:
+   - **If** no task is printed → no affected tasks; do not read any diff.
+   - **Else** → continue with the printed tasks only.
+7. Read the diff hunks `currency` printed for each matched task; never read a path outside its matched set.
 8. Per matched task, decide against diff — `Executable` tasks are not findings and are not logged:
    - `Executable` = landed changes leave task approach intact.
    - `Reword` = task approach holds; paths, symbols, or commands task names have moved and wording no longer matches.
diff --git a/.agents/plugins/bkit/agents/bkit-build-plan-verify.md b/.agents/plugins/bkit/agents/bkit-build-plan-verify.md
index 3920250b4..eb144e7fe 100644
--- a/.agents/plugins/bkit/agents/bkit-build-plan-verify.md
+++ b/.agents/plugins/bkit/agents/bkit-build-plan-verify.md
@@ -26,7 +26,7 @@ tools:
 **Contract:** The terms between this agent and whoever runs it.
 
 - **Read / Update / Create:** Use any appended Read / Update / Create as exact I/O paths.
-- **Mandate:** Verify plan implementation; change plan only to mark tasks done; do not build, install, or write code.
+- **Mandate:** Verify plan implementation and pass the task numbers you judged satisfied on the header's `Tasks` line; never edit the plan; do not build, install, or write code.
 - **No commits:** Do not run `git commit` / `git add` / `git push` (caller does).
 - **Output header:** All lines above `<!-- verdict:end -->` MUST be machine-parseable.
 - **Runbook tasks:** The runbook is groups of task blocks in build order (schema, then API, then UI). A group is `<!-- bkit:group N start -->`, `### GROUP N: {title}`, its task blocks and `<!-- bkit:group N end -->`, holding tasks and `TEST FIRST` tests within the per-group plan caps your Context names (`bkit.workflows.tasks`: tasks, and `TEST FIRST` tests in all); bigger → split the group. A task is `<!-- bkit:task N start -->`, `- [ ] **TASK N:** {title}`, one sub-bullet per field and `<!-- bkit:task N end -->`, its number unique across the plan. Fields, uppercase: `**CREATE:**` / `**READ:**` / `**UPDATE:**` / `**DELETE:**` (`` `{symbol}` in `{file}`: {what} `` or `` `{file}`: {what} ``, one line per reference), `**DEPENDS ON:**` (task numbers, same or earlier group), `**DONE WHEN:**`, `**TEST FIRST:**`, `**TEST EXCEPTION:**`; `bkit tests plan-check` refuses task-like text outside every block. `DONE WHEN` is short, testable and checkable in the codebase (a file exists, a signature matches, a test passes, a behaviour shows). A task that adds or changes logic names its own tests and fixes the tests it breaks; no task leaves its tests to a later one. Behaviour tests come only from `Derived Test Matrix` rows, and a task crossing a boundary (DB, API, model, network, migration) pairs them with non-mock tests. An audit plan has one task per in-scope finding id; tasks group findings only on one shared root cause and still name every id.
@@ -58,26 +58,21 @@ tools:
 1. Initialise **Create** output stub with `PENDING` placeholders.
 2. Re-read all supplied inputs once at session start; do not trust session memory.
 3. Read `.agents/docs.md` → load docs for workflow / step / task; skip missing.
-4. Update **Create** — replace each `PENDING` via `Edit` as content becomes available. Per gap — append log at EOF via Bash `echo {log entry} >> {output}`; heredoc for multi-line; each entry ends `— Fixable: true` or `— Fixable: false` (by gap-remediate). **If** any gap `Fixable: false` → set `Verdict` = `FAIL` via `Edit` immediately; do not defer to final pass.
+4. Update **Create** — replace each `PENDING` via `Edit` as content becomes available. Per gap — append log at EOF via Bash `echo {log entry} >> {output}`; heredoc for multi-line; `{log entry}` is the gap's report `logLine` with your decided `Fixable: true` / `Fixable: false` in place of the engine's `Fixable: null`; each entry ends `— Fixable: true` or `— Fixable: false` (by gap-remediate). **If** any gap `Fixable: false` → set `Verdict` = `FAIL` via `Edit` immediately; do not defer to final pass.
 5. Determine `Mode` from input Context (`Group` or `Holistic`).
-6. **If** `Group` → the supplied briefs' task blocks are the work; judge them against the supplied group diff (the changes since the group started), not the whole branch; a brief's `Deviations` section holds the owner's run instructions → judge the tasks it names as it directs. Every task field and gate maps to real codebase changes. Find missing components, skipped steps, unimplemented edge cases. Cross-reference the tasks vs the execute log's `DONE — TASK {N}` lines; a `DONE` line is a claim to check, never proof.
-7. **If** `Holistic` → same task / gate / `DONE` log cross-reference across every group of the plan, plus integration: groups' components work together? API contracts match? Shared state consistent? Cross-domain boundaries respected? Run `pnpm bkit:gate:static-unit`.
-8. **If** test-first audit report supplied (`Enforced` / `Gaps` header) → map its gaps per task:
-   - `not-green` → `Fixable: true`.
+6. **If** `Group` → the supplied briefs' task blocks are the work; judge them against the supplied group diff (the changes since the group started), not the whole branch; a brief's `Deviations` section holds the owner's run instructions → judge the tasks it names as it directs. Every task field and gate maps to real codebase changes. Find missing components, skipped steps, unimplemented edge cases.
+7. **If** `Holistic` → the same task and gate check across every group of the plan, plus integration: groups' components work together? API contracts match? Shared state consistent? Cross-domain boundaries respected? Run `pnpm bkit:gate:static-unit`.
+8. **If** test-first audit report supplied (`Enforced` / `Verdict` / `Gaps` header) → decide each gap: its `fixable` stands unless `null`, and a `null` one you decide from the diff it names:
    - `delete-still-referenced` → read each hit; a different thing with the same name → no gap; else `Fixable: true`.
    - `test-changed` → read its diff; only formatting → no gap; weakened, removed or rewritten assertions → `Fixable: false`.
-   - Row `Changed since red` = `added lines only` → read its diff; any line added inside a planned test or in setup it runs (`beforeEach`, fixture, mock) → `test-changed` gap, `Fixable: false`; added lines only outside every planned test → no gap.
+   - `test-changed` on a row whose `Changed since red` = `added lines only` → read its diff; any line added inside a planned test or in setup it runs (`beforeEach`, fixture, mock) → `Fixable: false`; added lines only outside every planned test → no gap.
    - `red-mismatch` → recorded test is the planned one renamed or moved **and** passes now → no gap, nor for that test's `not-green`; else `Fixable: false`.
-   - `no-red` on a task the plan-currency report classifies `Broken` with work already landed **and** the execute log records `DONE — TASK {N}: already landed` → no gap.
-   - `no-red`, `late-red`, `no-test-first`, `test-first-malformed`, `test-first-unread`, `red-evidence-missing`, `exception-refused` → `Fixable: false`.
-   - Test-order gap (`no-red`, `late-red`, `red-mismatch`, `red-evidence-missing`, `test-changed`) → log as ``TASK {N}: `{test file}` `{test name}` — {kind} — Fixable: false``.
+   - `no-red` on a task the plan-currency report classifies `Broken` with work already landed **and** the execute log records `DONE — TASK {N}: already landed` → no gap, overriding the gap's `Fixable: false`.
    - `Enforced: false` → reason in `Notes`; no gap.
    - `Late-red check` section → each task not checked in `Notes`; no gap.
-9. Per task → assert codebase satisfies `DONE WHEN` (file exists, signature matches, test passes, observable behaviour) and has no test-first audit gap; `BLOCKED` log lines, `docs/deferrals.jsonl` rows, and out-of-scope notes never satisfy it; gaps a supplied decision record accepts (`Decision: Accept`, or `Decision: Accept (assumed)`) are no gap (name the record in `Notes`; an assumed accept is taken without the owner, so add `assumed, not the owner's acceptance`). **If** satisfied → tick its `- [ ] **TASK {N}:**` line `[x]` in the plan file; tick nothing else. **If** not satisfied or missing → leave `[ ]`, append log; **If** the gap is `Fixable: false` → set `Verdict` = `FAIL` via `Edit` immediately; do not defer to final pass.
-10. Update **Create** — set `Failures` via `Edit` = count of unresolved gaps; set `Fixable` via `Edit` = `true` when any of those is `Fixable: true`, else `false`; set `Verdict` via `Edit`; mapping:
-    - `PASS` = no gaps.
-    - `FAIL` = any gap `Fixable: false`.
-    - `CONCERNS` = every gap `Fixable: true`.
+   - A gap you leave `Fixable: false` is a `FAIL`.
+9. Per task → assert codebase satisfies `DONE WHEN` (file exists, signature matches, test passes, observable behaviour) and has no test-first audit gap; `BLOCKED` log lines, `docs/deferrals.jsonl` rows, and out-of-scope notes never satisfy it; gaps a supplied decision record accepts (`Decision: Accept`, or `Decision: Accept (assumed)`) are no gap (name the record in `Notes`; an assumed accept is taken without the owner, so add `assumed, not the owner's acceptance`). **If** satisfied → name its number on the header's `Tasks` line; the workflow ticks the plan. **If** not satisfied or missing → leave it off that line, append log; **If** the gap is `Fixable: false` → set `Verdict` = `FAIL` via `Edit` immediately; do not defer to final pass.
+10. Update **Create** — set `Failures` via `Edit` = count of unresolved gaps; set `Fixable` via `Edit` = `true` when any of those is `Fixable: true`, else `false`; set `Verdict` via `Edit` = the roll-up over the `Fixable` you decided: any `false` → `FAIL`, **Else** any `true` → `CONCERNS`, **Else** → `PASS`; never the report's `null`.
 
 **Output format:**
 
@@ -85,6 +80,7 @@ tools:
 Verdict: PASS | CONCERNS | FAIL [Initially set to PENDING.]
 Failures: <integer >= 0>
 Fixable: true | false
+Tasks: <the task numbers you judged satisfied, comma-separated; none when there are none>
 
 <!-- verdict:end -->
 
diff --git a/.agents/plugins/bkit/agents/bkit-plan-generate.md b/.agents/plugins/bkit/agents/bkit-plan-generate.md
index d243cd529..8e830436b 100644
--- a/.agents/plugins/bkit/agents/bkit-plan-generate.md
+++ b/.agents/plugins/bkit/agents/bkit-plan-generate.md
@@ -36,7 +36,7 @@ tools:
 - **Related Issues:** List tracker references from the plan input as `#N — title (state)`, not their content; they help dedupe and do not add scope. None → `None`.
 - **Example tools:** Tools and commands `docs/templates/bkit-plan.md` names are examples; write the project's own and drop what does not apply.
 - **Acceptance Scenario:** `Narrative` and `Success Criteria` come word for word from the first source that has them: the design's `## Acceptance Scenario`, else the issue's change-shape fields (`.bkit/trackers.md` § Issue shapes), else, for an audit-only plan, the user or operator impact of the in-scope findings. With no source, both read `⚠️ MISSING: no design doc, no issue Narrative and no audit report — human must provide before plan proceeds`; never invent them. `Narrative` is 1-2 sentences from the user's side: what they do and what they get back. `Success Criteria` are at most 5 measurable outcomes, not steps; an audit plan has one per in-scope finding id, from its `Expected`, with no cap. `Context & Goals` does not repeat them.
-- **Scenario detail:** `Process Sketch` restates the `Concrete Example` and `Edge Cases` as 3-7 `WHEN X → THEN Y` outcome lines, with no new examples. `Concrete Example` is one scenario: role, starting state, numbered steps, observable outcome. `Edge Cases` keep the design's Key Edge Cases, else the issue's rows, word for word, and add validation, error and boundary cases. `Derived Test Matrix` has one row per testable behaviour, each with a target file and mapped to exactly one runbook task; issue rows stay word for word, and each in-scope audit behaviour has a row.
+- **Scenario detail:** `Process Sketch` restates the `Concrete Example` and `Edge Cases` as 3-7 `WHEN X → THEN Y` outcome lines, with no new examples. `Concrete Example` is one scenario: role, starting state, numbered steps, observable outcome. `Edge Cases` keep the design's Key Edge Cases, else the issue's rows, word for word, and add validation, error and boundary cases. `Derived Test Matrix` has one row per testable behaviour, each with a target file and a `Task` cell naming the one runbook task that lands its test; issue rows stay word for word, and each in-scope audit behaviour has a row.
 - **Test tiers:** A `Derived Test Matrix` row's `Type` is a tier name exactly as `docs/testing.md` writes it, picked by its tier-selection rubric: the lowest tier that exercises the behaviour, or several. Boundary rows reach the real boundary and assert a ground-truth signal, with `@live` for an external or deployed boundary.
 - **Open questions:** Each open question gives 2-3 options with their trade-offs as the lettered `Options: A) {option} — {trade-off} · B) …`, a `Recommended` naming the chosen letter and the default if unanswered; the design's options and recommendation carry forward where it already answered. Each assumption names what breaks if it is wrong.
 - **Out of Scope:** Plan work is in scope by default. An `Out of Scope` row is `Exempt` only when no `Success Criteria`, `Acceptance Scenario`, `Derived Test Matrix` row or design item (non-goals aside) needs it, and it says why and where the item belongs. Required work parked there is a `Blocking` deferral and belongs in the runbook. Each `Exempt` row has a matching `docs/deferrals.jsonl` row; an audit `LOW` finding left out is an `Exempt` row.
diff --git a/.agents/plugins/bkit/agents/bkit-plan-review-1.md b/.agents/plugins/bkit/agents/bkit-plan-review-1.md
index 0efd533c4..29c537327 100644
--- a/.agents/plugins/bkit/agents/bkit-plan-review-1.md
+++ b/.agents/plugins/bkit/agents/bkit-plan-review-1.md
@@ -31,7 +31,7 @@ tools:
 - **Lens discipline:** Stay within Process-defined lens; out-of-lens findings not in remit.
 - **Output header:** All lines above `<!-- verdict:end -->` MUST be machine-parseable.
 - **Acceptance Scenario:** `Narrative` and `Success Criteria` come word for word from the first source that has them: the design's `## Acceptance Scenario`, else the issue's change-shape fields (`.bkit/trackers.md` § Issue shapes), else, for an audit-only plan, the user or operator impact of the in-scope findings. With no source, both read `⚠️ MISSING: no design doc, no issue Narrative and no audit report — human must provide before plan proceeds`; never invent them. `Narrative` is 1-2 sentences from the user's side: what they do and what they get back. `Success Criteria` are at most 5 measurable outcomes, not steps; an audit plan has one per in-scope finding id, from its `Expected`, with no cap. `Context & Goals` does not repeat them.
-- **Scenario detail:** `Process Sketch` restates the `Concrete Example` and `Edge Cases` as 3-7 `WHEN X → THEN Y` outcome lines, with no new examples. `Concrete Example` is one scenario: role, starting state, numbered steps, observable outcome. `Edge Cases` keep the design's Key Edge Cases, else the issue's rows, word for word, and add validation, error and boundary cases. `Derived Test Matrix` has one row per testable behaviour, each with a target file and mapped to exactly one runbook task; issue rows stay word for word, and each in-scope audit behaviour has a row.
+- **Scenario detail:** `Process Sketch` restates the `Concrete Example` and `Edge Cases` as 3-7 `WHEN X → THEN Y` outcome lines, with no new examples. `Concrete Example` is one scenario: role, starting state, numbered steps, observable outcome. `Edge Cases` keep the design's Key Edge Cases, else the issue's rows, word for word, and add validation, error and boundary cases. `Derived Test Matrix` has one row per testable behaviour, each with a target file and a `Task` cell naming the one runbook task that lands its test; issue rows stay word for word, and each in-scope audit behaviour has a row.
 - **Open questions:** Each open question gives 2-3 options with their trade-offs as the lettered `Options: A) {option} — {trade-off} · B) …`, a `Recommended` naming the chosen letter and the default if unanswered; the design's options and recommendation carry forward where it already answered. Each assumption names what breaks if it is wrong.
 - **Out of Scope:** Plan work is in scope by default. An `Out of Scope` row is `Exempt` only when no `Success Criteria`, `Acceptance Scenario`, `Derived Test Matrix` row or design item (non-goals aside) needs it, and it says why and where the item belongs. Required work parked there is a `Blocking` deferral and belongs in the runbook. Each `Exempt` row has a matching `docs/deferrals.jsonl` row; an audit `LOW` finding left out is an `Exempt` row.
 - **Suggested Scope Expansion:** List prior work overlapping the plan's surfaces as candidates (related open issues, open `docs/deferrals.jsonl` and `docs/failures.jsonl` rows, audit findings the input did not name), each with source, overlap and recommendation. Candidates are for the human, not runbook tasks; one joins the plan only through design scope or a human decision, and then leaves the list.
diff --git a/.agents/plugins/bkit/agents/bkit-plan-scope-check.md b/.agents/plugins/bkit/agents/bkit-plan-scope-check.md
index ba5e9506b..c60c7cbfe 100644
--- a/.agents/plugins/bkit/agents/bkit-plan-scope-check.md
+++ b/.agents/plugins/bkit/agents/bkit-plan-scope-check.md
@@ -31,7 +31,7 @@ tools:
 - **Lens discipline:** Stay within Process-defined lens; out-of-lens findings not in remit.
 - **Output header:** All lines above `<!-- verdict:end -->` MUST be machine-parseable.
 - **Acceptance Scenario:** `Narrative` and `Success Criteria` come word for word from the first source that has them: the design's `## Acceptance Scenario`, else the issue's change-shape fields (`.bkit/trackers.md` § Issue shapes), else, for an audit-only plan, the user or operator impact of the in-scope findings. With no source, both read `⚠️ MISSING: no design doc, no issue Narrative and no audit report — human must provide before plan proceeds`; never invent them. `Narrative` is 1-2 sentences from the user's side: what they do and what they get back. `Success Criteria` are at most 5 measurable outcomes, not steps; an audit plan has one per in-scope finding id, from its `Expected`, with no cap. `Context & Goals` does not repeat them.
-- **Scenario detail:** `Process Sketch` restates the `Concrete Example` and `Edge Cases` as 3-7 `WHEN X → THEN Y` outcome lines, with no new examples. `Concrete Example` is one scenario: role, starting state, numbered steps, observable outcome. `Edge Cases` keep the design's Key Edge Cases, else the issue's rows, word for word, and add validation, error and boundary cases. `Derived Test Matrix` has one row per testable behaviour, each with a target file and mapped to exactly one runbook task; issue rows stay word for word, and each in-scope audit behaviour has a row.
+- **Scenario detail:** `Process Sketch` restates the `Concrete Example` and `Edge Cases` as 3-7 `WHEN X → THEN Y` outcome lines, with no new examples. `Concrete Example` is one scenario: role, starting state, numbered steps, observable outcome. `Edge Cases` keep the design's Key Edge Cases, else the issue's rows, word for word, and add validation, error and boundary cases. `Derived Test Matrix` has one row per testable behaviour, each with a target file and a `Task` cell naming the one runbook task that lands its test; issue rows stay word for word, and each in-scope audit behaviour has a row.
 - **Open questions:** Each open question gives 2-3 options with their trade-offs as the lettered `Options: A) {option} — {trade-off} · B) …`, a `Recommended` naming the chosen letter and the default if unanswered; the design's options and recommendation carry forward where it already answered. Each assumption names what breaks if it is wrong.
 - **Out of Scope:** Plan work is in scope by default. An `Out of Scope` row is `Exempt` only when no `Success Criteria`, `Acceptance Scenario`, `Derived Test Matrix` row or design item (non-goals aside) needs it, and it says why and where the item belongs. Required work parked there is a `Blocking` deferral and belongs in the runbook. Each `Exempt` row has a matching `docs/deferrals.jsonl` row; an audit `LOW` finding left out is an `Exempt` row.
 - **Reuse Inventory:** Each capability the plan introduces has a `Reuse Inventory` row, written before `Architecture & Component Changes`, recording the searches run (in-repo text and symbol search, framework built-ins, current practice) and a decision. The default is `EXTEND`: a `[MODIFY]` of the named file plus a runbook task. `NEW` needs one reason: (a) the searches find no candidate, (b) extending breaks the candidate's contract or callers, both named, or (c) the candidate is a `Supersession Inventory` `DELETE`. A cleaner fresh start or a messy or close-but-different candidate is no reason, and a row with no search is unsearched, not `NEW`. Each `[NEW]` file carries its row's reason. Each row names the file it decides in `File`, and each task `CREATE` file needs a `NEW` row naming it.
@@ -66,17 +66,15 @@ tools:
 6. **If** `Acceptance Scenario` or `Derived Test Matrix` sections missing / vague → `CRITICAL`. Any `Open Questions & Assumptions` question breaking **Open questions** above → `OPTIONAL` findings naming missing parts.
 7. Verify every `Agent Execution Runbook` task has scope and verification step.
 8. Verify every scope item has both build task and verification task.
-9. Verify `Derived Test Matrix` ↔ `Agent Execution Runbook`: rows map 1:1 (bidirectional) to verification tasks. Gaps → `CRITICAL` finding naming the task or row to add.
-10. Identify gaps, edge cases, untested assumptions, missing error handling.
-11. Replaced / superseded code → `Supersession Inventory` with DELETE / RETAIN-with-REASON. Missing → `CRITICAL`.
-12. Introduced capability → `Reuse Inventory` row per **Reuse Inventory** above. Missing row, empty `Search performed`, rejected `NEW` reason, or untraced `[NEW]` / `EXTEND` row → `CRITICAL`.
-13. `Out of Scope` entries `Exempt` per **Out of Scope** above. Required work parked out of scope = `Blocking` → `CRITICAL`.
-14. No task scopes edits inside `bkit:start` / `bkit:end` blocks; always edit below `bkit:end`.
-15. Sort findings into the three categories `CRITICAL`, `OPTIONAL` and `OUT OF SCOPE`.
-16. Update **Create** — set `Failures` via `Edit` = `CRITICAL` count; do not count incomplete findings.
-17. Update **Create** — set `Verdict` via `Edit`; mapping:
+9. Identify gaps, edge cases, untested assumptions, missing error handling.
+10. Introduced capability → `Reuse Inventory` row per **Reuse Inventory** above. Missing row, empty `Search performed`, rejected `NEW` reason, or untraced `[NEW]` / `EXTEND` row → `CRITICAL`.
+11. `Out of Scope` entries `Exempt` per **Out of Scope** above. Required work parked out of scope = `Blocking` → `CRITICAL`.
+12. No task scopes edits inside `bkit:start` / `bkit:end` blocks; always edit below `bkit:end`.
+13. Sort findings into the three categories `CRITICAL`, `OPTIONAL` and `OUT OF SCOPE`.
+14. Update **Create** — set `Failures` via `Edit` = `CRITICAL` count; do not count incomplete findings.
+15. Update **Create** — set `Verdict` via `Edit`; mapping:
     - `PASS` = scope complete.
-    - `FAIL` = matrix-to-runbook mapping no plan edit recovers; every other gap → `CRITICAL`.
+    - `FAIL` = a `Blocking` out-of-scope deferral no plan edit recovers; every other gap → `CRITICAL`.
     - `CONCERNS` = `CRITICAL` gaps (apply via plan-update).
 
 **Output format:**
@@ -93,7 +91,7 @@ Lens: Scope, criteria, verification audit.
 
 ## CRITICAL
 
-[Gaps that block plan progress — missing / vague `Acceptance Scenario` or `Derived Test Matrix`, missing build task, missing verification task, broken matrix-to-runbook mapping, missing supersession-inventory entry, scope creep currently in plan to be removed, `Blocking` out-of-scope deferral; initially set to `PENDING`.]
+[Gaps that block plan progress — missing / vague `Acceptance Scenario` or `Derived Test Matrix`, missing build task, missing verification task, missing traceability between a capability and its `Reuse Inventory` row, scope creep currently in plan to be removed, `Blocking` out-of-scope deferral; initially set to `PENDING`.]
 
 ## OPTIONAL
 
diff --git a/.agents/plugins/bkit/agents/bkit-plan-update.md b/.agents/plugins/bkit/agents/bkit-plan-update.md
index 8638a2136..2489cfb6c 100644
--- a/.agents/plugins/bkit/agents/bkit-plan-update.md
+++ b/.agents/plugins/bkit/agents/bkit-plan-update.md
@@ -31,7 +31,7 @@ tools:
 - **Output header:** All lines above `<!-- verdict:end -->` MUST be machine-parseable.
 - **Example tools:** Tools and commands `docs/templates/bkit-plan.md` names are examples; write the project's own and drop what does not apply.
 - **Acceptance Scenario:** `Narrative` and `Success Criteria` come word for word from the first source that has them: the design's `## Acceptance Scenario`, else the issue's change-shape fields (`.bkit/trackers.md` § Issue shapes), else, for an audit-only plan, the user or operator impact of the in-scope findings. With no source, both read `⚠️ MISSING: no design doc, no issue Narrative and no audit report — human must provide before plan proceeds`; never invent them. `Narrative` is 1-2 sentences from the user's side: what they do and what they get back. `Success Criteria` are at most 5 measurable outcomes, not steps; an audit plan has one per in-scope finding id, from its `Expected`, with no cap. `Context & Goals` does not repeat them.
-- **Scenario detail:** `Process Sketch` restates the `Concrete Example` and `Edge Cases` as 3-7 `WHEN X → THEN Y` outcome lines, with no new examples. `Concrete Example` is one scenario: role, starting state, numbered steps, observable outcome. `Edge Cases` keep the design's Key Edge Cases, else the issue's rows, word for word, and add validation, error and boundary cases. `Derived Test Matrix` has one row per testable behaviour, each with a target file and mapped to exactly one runbook task; issue rows stay word for word, and each in-scope audit behaviour has a row.
+- **Scenario detail:** `Process Sketch` restates the `Concrete Example` and `Edge Cases` as 3-7 `WHEN X → THEN Y` outcome lines, with no new examples. `Concrete Example` is one scenario: role, starting state, numbered steps, observable outcome. `Edge Cases` keep the design's Key Edge Cases, else the issue's rows, word for word, and add validation, error and boundary cases. `Derived Test Matrix` has one row per testable behaviour, each with a target file and a `Task` cell naming the one runbook task that lands its test; issue rows stay word for word, and each in-scope audit behaviour has a row.
 - **Test tiers:** A `Derived Test Matrix` row's `Type` is a tier name exactly as `docs/testing.md` writes it, picked by its tier-selection rubric: the lowest tier that exercises the behaviour, or several. Boundary rows reach the real boundary and assert a ground-truth signal, with `@live` for an external or deployed boundary.
 - **Open questions:** Each open question gives 2-3 options with their trade-offs as the lettered `Options: A) {option} — {trade-off} · B) …`, a `Recommended` naming the chosen letter and the default if unanswered; the design's options and recommendation carry forward where it already answered. Each assumption names what breaks if it is wrong.
 - **Out of Scope:** Plan work is in scope by default. An `Out of Scope` row is `Exempt` only when no `Success Criteria`, `Acceptance Scenario`, `Derived Test Matrix` row or design item (non-goals aside) needs it, and it says why and where the item belongs. Required work parked there is a `Blocking` deferral and belongs in the runbook. Each `Exempt` row has a matching `docs/deferrals.jsonl` row; an audit `LOW` finding left out is an `Exempt` row.
diff --git a/.agents/plugins/bkit/agents/bkit-ship-deferred-sweep.md b/.agents/plugins/bkit/agents/bkit-ship-deferred-sweep.md
index fc76b8340..e6a786b45 100644
--- a/.agents/plugins/bkit/agents/bkit-ship-deferred-sweep.md
+++ b/.agents/plugins/bkit/agents/bkit-ship-deferred-sweep.md
@@ -64,14 +64,15 @@ tools:
      - **If** shipped surfaces instruct consumers to run something that fails at runtime → mark item `Blocked`.
    - Any `Blocked` items → move to `Blocking Deferrals` and append test details with source evidence → set `Verdict` = `FAIL` via `Edit` immediately; do not defer to final pass.
    - Any leftover `Planned` items → mark items `Lazy` → move to `Lazy Deferrals` → append deferral rows to `docs/deferrals.jsonl` with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom); check existing entries first; set `reason` to `unjustified`, set `status` to `TRIAGED`.
-8. Scan supplied diff for any disabled tests (`.skip` / `.todo` / `.fixme` / `xfail`, `t.Skip()`, `#[ignore]`, `@Disabled` added, or assertions deleted); skips predating supplied diff do not count → record all under `Blocking Deferrals` with source evidence (`file:line`, test name) → set `Verdict` = `FAIL` via `Edit` immediately; do not defer to final pass.
-9. Scan `docs/deferrals.jsonl` for any plan related entries including recently appended rows → verify each `reason` holds at ship time as per `.bkit/jsonl.md` deferral reason tests; `reason` = `low-severity` with `severity` = `LOW` holds without the tests:
-   - **If** holds → record under / move to `Exempt Deferrals` → continue; append no row, `reason` is set once and carried verbatim.
-   - **Else** → record under / keep under `Lazy Deferrals` → append row to `docs/deferrals.jsonl` with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom), same `key` and prior fields verbatim, set `reason` to `unjustified`, set `status` to `TRIAGED`, `description` naming failed deferral tests.
+8. Scan the run's diff for disabled tests with `bkit branches scan-diff --disabled-tests --base=` the diff base your Context names — its `disabled` list holds each hit's `file:line` and test name → **If** exit 1 → record every entry under `Blocking Deferrals` with source evidence (`file:line`, test name) → set `Verdict` = `FAIL` via `Edit` immediately; do not defer to final pass.
+9. Bucket the plan-related deferral rows of the FID in your Context with `bkit ledgers triage --fid=` the FID in your Context `--plan=` the plan file. The verb applies the deferral tests and writes every `unjustified` / `TRIAGED` row itself; each of its `rows` carries the row's `key`, its `bucket` and the test result:
+   - **If** `bucket` = `Exempt` → record under / move to `Exempt Deferrals`; the row stands as written.
+   - **Else** → record under / keep under `Lazy Deferrals`, naming the tests the verb reports for it.
+   - **If** the plan file is absent → nothing to test against; record each plan-related row under `Exempt Deferrals` naming the missing plan.
 10. Update **Create** — set `Failures` via `Edit` = `Blocking Deferrals` entry count; set `Lazy` via `Edit` = `Lazy Deferrals` entry count.
 11. Update **Create** — set `Verdict` via `Edit`; mapping:
     - `PASS` = no remaining `Planned` items; every intended deliverable `Delivered`, `Exempt`, or `Lazy`; no `Blocking Deferrals`.
-    - `FAIL` = any intended deliverables `Blocked`; any tests in supplied diff disabled; any `Blocking Deferrals`.
+    - `FAIL` = any intended deliverables `Blocked`; any test the run's diff disabled; any `Blocking Deferrals`.
 
 **Output format:**
 
@@ -90,7 +91,7 @@ Lazy: <integer >= 0>
 
 ## Blocking Deferrals
 
-[Unmet deliverables that passed any blocking tests, and every test supplied diff disabled; per entry: test details with source evidence (`file:line`, test, grep); blocks merge. **If** none → `None`; initially set to `PENDING`.]
+[Unmet deliverables that passed any blocking tests, and every test the run's diff disabled; per entry: test details with source evidence (`file:line`, test, grep); blocks merge. **If** none → `None`; initially set to `PENDING`.]
 
 ## Exempt Deferrals
 
diff --git a/.agents/plugins/bkit/agents/bkit-ship-update-docs.md b/.agents/plugins/bkit/agents/bkit-ship-update-docs.md
index dbef2925b..84b906d74 100644
--- a/.agents/plugins/bkit/agents/bkit-ship-update-docs.md
+++ b/.agents/plugins/bkit/agents/bkit-ship-update-docs.md
@@ -57,7 +57,7 @@ tools:
 4. Per doc, always follow its `Rules` headers when making edits.
 5. Per doc, four passes in order: Sync content (gaps vs implementation) → reorganize structure (dedupe, move misplaced) → compress wording (more token-efficient) → update cross-references (inline `docs/*.md` links).
 6. Ensure agent memories (`MEMORY.md` / `memory/*.md`) do not duplicate content and only contain pointers (path, section, one-line hook) to relevant `docs/*.md` sections / `docs/*.jsonl` entries. **If** memory contains duplicate / stale content → update memory.
-7. Grep `docs/deferrals.jsonl` for `{FID}` matches → surface in output `Pending Items` for human review (do not write `docs/deferrals.jsonl`).
+7. Fill `Pending Items` from the `ship-pending-items.md` deferral scan supplied in your Read paths, one entry per line (do not write `docs/deferrals.jsonl`).
 8. Produce **Create** output.
 
 **Output format:**
@@ -75,7 +75,7 @@ tools:
 
 ## Pending Items
 
-[`{FID}` matches in `docs/deferrals.jsonl` for human review. **If** no matches → `None`.]
+[`{FID}` matches from the `ship-pending-items.md` deferral scan, for human review. **If** no matches → `None`.]
 
 ## Blockers
 
diff --git a/.agents/plugins/bkit/skills/bkit-build/SKILL.md b/.agents/plugins/bkit/skills/bkit-build/SKILL.md
index 92b994c06..460e0ba78 100644
--- a/.agents/plugins/bkit/skills/bkit-build/SKILL.md
+++ b/.agents/plugins/bkit/skills/bkit-build/SKILL.md
@@ -131,7 +131,7 @@ description: "Build Feature — Autonomous implementation"
      - Test-order gap or `exception-refused` gap → a `- **TEST EXCEPTION:**` field as the last field of the task's block in `docs/plans/{YYYYMM}/{FID}-plan.md`, one sub-bullet per test in `TEST FIRST` form, each ending `— {human's reason} (owner, {YYYY-MM-DD})`; a task with no `TEST FIRST` → the field holds `{human's reason} (owner, {YYYY-MM-DD})` alone. The field replaces the task's existing `TEST EXCEPTION` field; NEVER add a second.
      - Other → append one `docs/decisions.jsonl` row with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom); `by.step` = `build-decision`; `summary` names `{FID}`, step `{PAUSE_STEP}` and the gap or finding; `rationale` = `accepted by owner: {human's reason}`. An item that is a challenge task → also tick it `[x]` in the plan and end its title with ` — accepted by owner`.
    - **Accept (assumed)** (written by `decisions apply`) → write nothing else: no `docs/decisions.jsonl` row, no `TEST EXCEPTION`. An item that is a challenge task → tick it `[x]` and end its title with ` — accepted (assumed)`. Ship asks the owner to confirm it.
-   - **Fix now** → an item that is a challenge task → keep that task open; it runs as it is. **Else** → write a task block (`docs/templates/bkit-plan.md` § Agent Execution Runbook) numbered one above the plan's highest task, with `**DONE WHEN:**` and `**TEST FIRST:**` (one sub-bullet per test, `` `{test file}` `{test name}` fails on {what goes wrong} ``); the human's direction, when given, shapes the task:
+   - **Fix now** → an item that is a challenge task → keep that task open; it runs as it is. **Else** → write a task block (`docs/templates/bkit-plan.md` § Agent Execution Runbook) numbered one above the plan's highest task, with `**DONE WHEN:**` and `**TEST FIRST:**` (one sub-bullet per test, `` `{test file}` `{test name}` fails on {what goes wrong} ``), and one `Derived Test Matrix` row per test in that `TEST FIRST` (``| {test name} | {tier} | `{test file}` | {task} |``, the tier its file's name gives); the human's direction, when given, shapes the task:
      - `From: verify` and group `{GROUP}` stays within `{MAX_TASKS_PER_GROUP}` tasks and `{MAX_TESTS_PER_GROUP}` `TEST FIRST` tests with it → inside group `{GROUP}`.
      - `From: verify`, over either cap → a new group right after `{GROUP}`; add 1 to every later group's number, in its markers and `### GROUP` heading.
      - `From: tests` or `From: challenge` → a new last group, each new group within the caps.
@@ -324,7 +324,7 @@ description: "Build Feature — Autonomous implementation"
    ```
    Route:
    - **If** exit 0 **and** (`NEWER_COMMENTS` = 0 **or** `CONVERTED` is held) → sub-step 5.
-   - **If** `CONVERTED` is not held **and** (exit 0 with `NEWER_COMMENTS` > 0, **or** exit 2 with no `docs/plans/{YYYYMM}/{FID}-plan.md`, **or** exit 1 with a `markers` problem) → sub-step 3.
+   - **If** `CONVERTED` is not held **and** (exit 0 with `NEWER_COMMENTS` > 0, **or** exit 2 with no `docs/plans/{YYYYMM}/{FID}-plan.md`, **or** exit 1 with a `markers`, `matrix` or `supersession` problem) → sub-step 3.
    - **If** exit 1, `CONVERTED` is held **and** `CONVERT_RETRY` is not held → `CONVERT_RETRY` = the printed `problems` → sub-step 3.
    - **Else** → **Failure Path** naming each problem in the report.
 3. **Subagent:** Invoke `view_file` `.agents/plugins/bkit/agents/bkit-build-plan-convert.md` using `view_file` tool:
@@ -430,8 +430,12 @@ One pass of Steps 6-8 per plan group, in group order: Step 6 briefs the first gr
    "{BKIT}" steps finish --workflow=build --step=build-plan-execute --file="{STATUS}" --attempt-of=build-plan-execute:next --group={GROUP} --agent=bkit-build-plan-execute --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-execute-{GROUP}-log.md --message="chore({FID}): plan-execute group {GROUP} attempt <attempt>" --number=6 --post --title="Plan Execute"
    ```
    Hold `verdict` as `EXECUTE_VERDICT`.
-5. Route — the log's `DONE` and `BLOCKED` lines are the handover; only Step 7 ticks tasks:
-   - **If** (`EXECUTE_VERDICT` = HANDOVER **or** a task of `GROUP_TASKS` has neither a `DONE — TASK {N}` nor a `BLOCKED — TASK {N}` line in the log) **and** `EXECUTE_RESUMED` is not held for `GROUP` → the agent stopped at its turn cap: a handover, not a failed attempt → `EXECUTE_RESUMED` = `GROUP` → re-run Step 6; its brief leaves out the `DONE` tasks.
+5. Route — the engine reads the group's open tasks:
+   ```bash
+   "{BKIT}" tasks open --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --group={GROUP} --log="docs/plans/{YYYYMM}/logs/{FID}/build-plan-execute-{GROUP}-log.md"
+   ```
+   Hold `handover` as `EXECUTE_HANDOVER`.
+   - **If** (`EXECUTE_VERDICT` = HANDOVER **or** `EXECUTE_HANDOVER` = true) **and** `EXECUTE_RESUMED` is not held for `GROUP` → the agent stopped at its turn cap: a handover, not a failed attempt → `EXECUTE_RESUMED` = `GROUP` → re-run Step 6; its brief leaves out the `DONE` tasks.
    - **Else** → Step 7.
 
 ### 🔒 Gate 6 — Plan Execute
@@ -466,33 +470,40 @@ One pass of Steps 6-8 per plan group, in group order: Step 6 briefs the first gr
 4. **Subagent:** Invoke `view_file` `.agents/plugins/bkit/agents/bkit-build-plan-verify.md` using `view_file` tool:
    Context: You are a subagent in the Build phase. Group verification. Group `{GROUP}`, attempt `{VERIFY_ATTEMPT}`. Switch into working directory `cd "{WORKTREE_PATH}"` → verify with `pwd` → use for all subsequent file operations. Plan caps (`bkit.workflows.tasks`): {MAX_TASKS_PER_GROUP} tasks and {MAX_TESTS_PER_GROUP} `TEST FIRST` tests per group; {MAX_TESTS_PER_TASK} tests across {MAX_TEST_FILES_PER_TASK} test files per task.
    Read: glob `docs/plans/{YYYYMM}/logs/{FID}/build-brief-{GROUP}-*.md`, `docs/plans/{YYYYMM}/logs/{FID}/build-diff-{GROUP}-{VERIFY_ATTEMPT}.md`, `docs/plans/{YYYYMM}/logs/{FID}/build-plan-execute-{GROUP}-log.md`, `docs/plans/{YYYYMM}/logs/{FID}/build-tests-green-{GROUP}-{VERIFY_ATTEMPT}.md`, `docs/plans/{YYYYMM}/logs/{FID}/build-plan-current.md` (if present), glob `docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-{GROUP}-*.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-{GROUP}-*-log.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-decision-*.md`.
-   Update: `docs/plans/{YYYYMM}/{FID}-plan.md` (tick only group `{GROUP}`'s tasks).
    Create: `docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-{GROUP}-{VERIFY_ATTEMPT}.md`.
 5. Finish:
    ```bash
    "{BKIT}" steps finish --workflow=build --step=build-plan-verify --file="{STATUS}" --attempt-of=build-plan-verify:next --group={GROUP} --agent=bkit-build-plan-verify --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-{GROUP}-<attempt>.md" --message="chore({FID}): plan-verify group {GROUP} attempt <attempt>" --number=7 --post --title="Plan Verify"
    ```
-   Hold `verdict` as `VERIFY_VERDICT`, `failures` as `VERIFY_FAILURES`, `fields.Fixable` as `VERIFY_FIXABLE`.
-6. Route:
+   Hold `verdict` as `VERIFY_VERDICT`, `failures` as `VERIFY_FAILURES`, `fields.Fixable` as `VERIFY_FIXABLE`, `fields.Tasks` as `{VERIFIED_TASKS}`.
+6. Tick the plan with the satisfied task numbers; a task the test-first report gaps stays open:
+   ```bash
+   "{BKIT}" tasks tick --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --group={GROUP} --tasks="{VERIFIED_TASKS}" --green="docs/plans/{YYYYMM}/logs/{FID}/build-tests-green-{GROUP}-{VERIFY_ATTEMPT}.md"
+   ```
+7. Route:
    - **If** `VERIFY_VERDICT` = PASS → list the plan's groups:
      ```bash
      "{BKIT}" tests plan-check --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --existence=report --log="{OUTBOX}/build-plan-check-{GROUP}.md"
      ```
-     **If** exit non-zero → **Failure Path**. **If** the printed `groups` hold a group numbered above `GROUP` → sub-step 7. **Else** → `GATE_VERDICT` = SKIPPED → sub-step 9.
-   - **Else** → `GATE_VERDICT` = SKIPPED → sub-step 9.
-7. Run the group gate; it writes the trimmed log to the artifact:
+     Route:
+     - **If** exit 1 with a `matrix` or `supersession` problem, **and** `CONVERT_RETRY` is not held → `CONVERT_RETRY` = the printed `problems` → Step 3 sub-step 3.
+     - **If** exit non-zero → **Failure Path**.
+     - **If** the printed `groups` hold a group numbered above `GROUP` → sub-step 8.
+     - **Else** → `GATE_VERDICT` = SKIPPED → sub-step 10.
+   - **Else** → `GATE_VERDICT` = SKIPPED → sub-step 10.
+8. Run the group gate; it writes the trimmed log to the artifact:
    ```bash
    "{BKIT}" tests run --gate=bkit:gate:static-unit-integration --gate=bkit:gate:static-unit --log="{OUTBOX}/build-group-gate-{GROUP}-{VERIFY_ATTEMPT}.log" --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-group-gate-{GROUP}-{VERIFY_ATTEMPT}.md" --fid={FID} --step=build-group-gate-{GROUP} --attempt={VERIFY_ATTEMPT}
    ```
    Route:
-   - **If** exit 0 **or** 1 → hold `verdict` as `{GATE_VERDICT}`, `scope` as `{TEST_SCOPE}` → sub-step 8.
+   - **If** exit 0 **or** 1 → hold `verdict` as `{GATE_VERDICT}`, `scope` as `{TEST_SCOPE}` → sub-step 9.
    - **Else** → **Failure Path**.
-8. Finish:
+9. Finish:
    ```bash
    "{BKIT}" steps finish --workflow=build --step=build-group-gate --file="{STATUS}" --verdict={GATE_VERDICT} --scope="{TEST_SCOPE}" --attempt-of=build-plan-verify:current --group={GROUP} --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-group-gate-{GROUP}-<attempt>.md" --clamp-log="build-group-gate-{GROUP}:<attempt>" --message="chore({FID}): group-gate group {GROUP} attempt <attempt>" --number=7 --post --title="Group Gate"
    ```
-9. **If** `VERIFY_VERDICT` = PASS **and** `GATE_VERDICT` != FAIL → Step 6 (the next group, or Step 9 when none is open).
-10. **If** `VERIFY_VERDICT` = CONCERNS or FAIL, **or** `GATE_VERDICT` = FAIL → route on the group's verify rounds:
+10. **If** `VERIFY_VERDICT` = PASS **and** `GATE_VERDICT` != FAIL → Step 6 (the next group, or Step 9 when none is open).
+11. **If** `VERIFY_VERDICT` = CONCERNS or FAIL, **or** `GATE_VERDICT` = FAIL → route on the group's verify rounds:
     ```bash
     "{BKIT}" counters route --name=VERIFY_ATTEMPT --of=build-plan-verify:current --file="{STATUS}" --workflow=build --group={GROUP} --point=build.verify --continue=within-limit --exceeded=failure-path
     ```
@@ -505,7 +516,7 @@ One pass of Steps 6-8 per plan group, in group order: Step 6 briefs the first gr
     - **If** exit 0 **and** `VERIFY_ROUNDS` < `PAUSE_MAX` → `PAUSE_QUESTION` = `VERIFY_LOOP` → **Decision Pause**.
     - **If** exit 0 → `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause** (no round left: decide the open gaps).
     - **Else** → **Failure Path**.
-11. **Else** → **Failure Path**.
+12. **Else** → **Failure Path**.
 
 ### 🔒 Gate 7 — Plan Verify
 
@@ -521,7 +532,7 @@ One pass of Steps 6-8 per plan group, in group order: Step 6 briefs the first gr
 
 ### 🧠 Step 8 — Plan Gaps Remediate
 
-**Run only if** Step 7 sub-step 10 or the **Decision Pause** routed here.
+**Run only if** Step 7 sub-step 12 or the **Decision Pause** routed here.
 
 1. Read status.jsonl and derive next `STRATEGY`:
    ```bash
@@ -590,7 +601,12 @@ Runs once, after the last group; challenge fix groups pass through here on the w
    ```bash
    "{BKIT}" steps finish --workflow=build --step=build-plan-verify-holistic --file="{STATUS}" --attempt=1 --agent=bkit-build-plan-verify --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-holistic.md --message="chore({FID}): plan-verify-holistic" --number=9 --post --title="Plan Verify Holistic"
    ```
-4. Route:
+   Hold `fields.Tasks` as `{VERIFIED_TASKS}`.
+4. Tick each group's satisfied tasks — one call per plan group, `{GROUP}` that group and `{VERIFIED_TASKS}` the numbers `Tasks:` names for it:
+   ```bash
+   "{BKIT}" tasks tick --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --group={GROUP} --tasks="{VERIFIED_TASKS}"
+   ```
+5. Route:
    - **If** `verdict` = PASS or CONCERNS → Step 10.
    - **Else** → **Failure Path**.
 
diff --git a/.agents/plugins/bkit/skills/bkit-ship/SKILL.md b/.agents/plugins/bkit/skills/bkit-ship/SKILL.md
index b26aae0b6..bb27e8c7c 100644
--- a/.agents/plugins/bkit/skills/bkit-ship/SKILL.md
+++ b/.agents/plugins/bkit/skills/bkit-ship/SKILL.md
@@ -369,7 +369,7 @@ description: "Ship Feature — Autonomous merge and archive"
    cd "{WORKTREE_PATH}" && "{BKIT}" context diff --reset-log --artifact="tmp/bkit-diff-{FID}.md" --fid={FID} --step=ship-deferred-sweep >/dev/null || exit 2
    ```
    **Subagent:** Invoke `view_file` `.agents/plugins/bkit/agents/bkit-ship-deferred-sweep.md` using `view_file` tool:
-   Context: You are a subagent in the Ship phase. Pre-merge completeness gate. Switch into working directory `cd "{WORKTREE_PATH}"` → verify with `pwd` → use for all subsequent file operations.
+   Context: You are a subagent in the Ship phase. Pre-merge completeness gate. Diff base: `origin/dev` — run `bkit branches scan-diff --disabled-tests --base=origin/dev`. Switch into working directory `cd "{WORKTREE_PATH}"` → verify with `pwd` → use for all subsequent file operations.
    Read: `docs/plans/{YYYYMM}/logs/{FID}/ship-input-{RUN}.md`, `docs/plans/{YYYYMM}/{FID}-plan.md` (if present), `docs/plans/{YYYYMM}/{FID}-design.md` (if present), `{STATUS}`, `docs/deferrals.jsonl`, glob `docs/plans/{YYYYMM}/logs/{FID}/*-plan-verify*.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/*-challenge*.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/*-summary.md`, `tmp/bkit-diff-{FID}.md` (the run's diff).
    Create: `docs/plans/{YYYYMM}/logs/{FID}/ship-deferred-sweep.md`.
 3. Finish (bookkeeping to `$BOOK_ROOT`):
@@ -394,26 +394,30 @@ description: "Ship Feature — Autonomous merge and archive"
 
 ## 🧠 Step 6 — Update Docs & Summary
 
-1. **Subagent:** Invoke `view_file` `.agents/plugins/bkit/agents/bkit-ship-update-docs.md` using `view_file` tool:
+1. Write the FID's deferral lines to the artifact the docs agent reads `Pending Items` from:
+   ```bash
+   cd "{WORKTREE_PATH}" && "{BKIT}" context ledger-scan --terms="{FID}" --source=docs/deferrals.jsonl --artifact="{OUTBOX}/ship-pending-items.md" --fid={FID} --step=ship-update-docs --reset-log >/dev/null || exit 1
+   ```
+2. **Subagent:** Invoke `view_file` `.agents/plugins/bkit/agents/bkit-ship-update-docs.md` using `view_file` tool:
    Context: You are a subagent in the Ship phase. Switch into working directory `cd "{WORKTREE_PATH}"` → verify with `pwd` → use for all subsequent file operations.
-   Read: `docs/plans/{YYYYMM}/{FID}-plan.md` (if present), glob `docs/plans/{YYYYMM}/logs/{FID}/*.md` (excluding `*-summary.md` / `*-handover.md`).
+   Read: `docs/plans/{YYYYMM}/{FID}-plan.md` (if present), glob `docs/plans/{YYYYMM}/logs/{FID}/*.md` (excluding `*-summary.md` / `*-handover.md`), `{OUTBOX}/ship-pending-items.md`.
    Update: Doc files.
    Create: `docs/plans/{YYYYMM}/logs/{FID}/ship-update-docs.md`.
-2. Wait for the subagent to complete, then append the `SHIPPED` row to the worktree ledger and re-render the mechanical `roadmap-status` board from it (exit 1 when the row did not land), and finish the step (bookkeeping to `$BOOK_ROOT`):
+3. Wait for the subagent to complete, then append the `SHIPPED` row to the worktree ledger and re-render the mechanical `roadmap-status` board from it (exit 1 when the row did not land), and finish the step (bookkeeping to `$BOOK_ROOT`):
    ```bash
    "{BKIT}" roadmap feature --root="{WORKTREE_PATH}" --workflow=ship --fid="{FID}" --step=ship-update-docs --strict >/dev/null || exit 1
    "{BKIT}" steps finish --workflow=ship --step=ship-update-docs --file="{STATUS}" --artifact="docs/plans/{YYYYMM}/logs/{FID}/ship-update-docs.md" --commit=none >/dev/null || exit 1
    ```
-3. Write `ship-summary.md` from this run's status rows and the PR's size:
+4. Write `ship-summary.md` from this run's status rows and the PR's size:
    ```bash
    "{BKIT}" workflows summary --workflow=ship --file="{STATUS}" --pr={PR_NUMBER}
    ```
    **If** exit non-zero → **Failure Path**. Hold `verdict` as `SUMMARY_VERDICT`, `failures` as `SUMMARY_FAILURES`.
-4. Finish (bookkeeping to `$BOOK_ROOT`):
+5. Finish (bookkeeping to `$BOOK_ROOT`):
    ```bash
    "{BKIT}" steps finish --workflow=ship --step=ship-summary --file="{STATUS}" --attempt=1 --verdict={SUMMARY_VERDICT} --failures={SUMMARY_FAILURES} --artifact="docs/plans/{YYYYMM}/logs/{FID}/ship-summary.md" --commit=none --number=6 --post --title="Update Docs & Summary" --link-ref=dev --comment-body
    ```
-5. Route:
+6. Route:
    - **If** `SUMMARY_VERDICT` = PASS or CONCERNS → Step 7.
    - **If** `SUMMARY_VERDICT` = FAIL → display `ship-summary.md` content verbatim as final message to user. Line 1 of the final message = the no-issue warning, when one was emitted. → **Failure Path**.
    - **Else** → **Failure Path**.
diff --git a/.agents/skills/bkit-build/SKILL.md b/.agents/skills/bkit-build/SKILL.md
index 4504fdc8b..d23554ea4 100644
--- a/.agents/skills/bkit-build/SKILL.md
+++ b/.agents/skills/bkit-build/SKILL.md
@@ -131,7 +131,7 @@ description: "Build Feature — Autonomous implementation"
      - Test-order gap or `exception-refused` gap → a `- **TEST EXCEPTION:**` field as the last field of the task's block in `docs/plans/{YYYYMM}/{FID}-plan.md`, one sub-bullet per test in `TEST FIRST` form, each ending `— {human's reason} (owner, {YYYY-MM-DD})`; a task with no `TEST FIRST` → the field holds `{human's reason} (owner, {YYYY-MM-DD})` alone. The field replaces the task's existing `TEST EXCEPTION` field; NEVER add a second.
      - Other → append one `docs/decisions.jsonl` row with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom); `by.step` = `build-decision`; `summary` names `{FID}`, step `{PAUSE_STEP}` and the gap or finding; `rationale` = `accepted by owner: {human's reason}`. An item that is a challenge task → also tick it `[x]` in the plan and end its title with ` — accepted by owner`.
    - **Accept (assumed)** (written by `decisions apply`) → write nothing else: no `docs/decisions.jsonl` row, no `TEST EXCEPTION`. An item that is a challenge task → tick it `[x]` and end its title with ` — accepted (assumed)`. Ship asks the owner to confirm it.
-   - **Fix now** → an item that is a challenge task → keep that task open; it runs as it is. **Else** → write a task block (`docs/templates/bkit-plan.md` § Agent Execution Runbook) numbered one above the plan's highest task, with `**DONE WHEN:**` and `**TEST FIRST:**` (one sub-bullet per test, `` `{test file}` `{test name}` fails on {what goes wrong} ``); the human's direction, when given, shapes the task:
+   - **Fix now** → an item that is a challenge task → keep that task open; it runs as it is. **Else** → write a task block (`docs/templates/bkit-plan.md` § Agent Execution Runbook) numbered one above the plan's highest task, with `**DONE WHEN:**` and `**TEST FIRST:**` (one sub-bullet per test, `` `{test file}` `{test name}` fails on {what goes wrong} ``), and one `Derived Test Matrix` row per test in that `TEST FIRST` (``| {test name} | {tier} | `{test file}` | {task} |``, the tier its file's name gives); the human's direction, when given, shapes the task:
      - `From: verify` and group `{GROUP}` stays within `{MAX_TASKS_PER_GROUP}` tasks and `{MAX_TESTS_PER_GROUP}` `TEST FIRST` tests with it → inside group `{GROUP}`.
      - `From: verify`, over either cap → a new group right after `{GROUP}`; add 1 to every later group's number, in its markers and `### GROUP` heading.
      - `From: tests` or `From: challenge` → a new last group, each new group within the caps.
@@ -324,7 +324,7 @@ description: "Build Feature — Autonomous implementation"
    ```
    Route:
    - **If** exit 0 **and** (`NEWER_COMMENTS` = 0 **or** `CONVERTED` is held) → sub-step 5.
-   - **If** `CONVERTED` is not held **and** (exit 0 with `NEWER_COMMENTS` > 0, **or** exit 2 with no `docs/plans/{YYYYMM}/{FID}-plan.md`, **or** exit 1 with a `markers` problem) → sub-step 3.
+   - **If** `CONVERTED` is not held **and** (exit 0 with `NEWER_COMMENTS` > 0, **or** exit 2 with no `docs/plans/{YYYYMM}/{FID}-plan.md`, **or** exit 1 with a `markers`, `matrix` or `supersession` problem) → sub-step 3.
    - **If** exit 1, `CONVERTED` is held **and** `CONVERT_RETRY` is not held → `CONVERT_RETRY` = the printed `problems` → sub-step 3.
    - **Else** → **Failure Path** naming each problem in the report.
 3. **Subagent:** Invoke `@bkit-build-plan-convert` using `Agent` tool:
@@ -430,8 +430,12 @@ One pass of Steps 6-8 per plan group, in group order: Step 6 briefs the first gr
    "{BKIT}" steps finish --workflow=build --step=build-plan-execute --file="{STATUS}" --attempt-of=build-plan-execute:next --group={GROUP} --agent=bkit-build-plan-execute --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-execute-{GROUP}-log.md --message="chore({FID}): plan-execute group {GROUP} attempt <attempt>" --number=6 --post --title="Plan Execute"
    ```
    Hold `verdict` as `EXECUTE_VERDICT`.
-5. Route — the log's `DONE` and `BLOCKED` lines are the handover; only Step 7 ticks tasks:
-   - **If** (`EXECUTE_VERDICT` = HANDOVER **or** a task of `GROUP_TASKS` has neither a `DONE — TASK {N}` nor a `BLOCKED — TASK {N}` line in the log) **and** `EXECUTE_RESUMED` is not held for `GROUP` → the agent stopped at its turn cap: a handover, not a failed attempt → `EXECUTE_RESUMED` = `GROUP` → re-run Step 6; its brief leaves out the `DONE` tasks.
+5. Route — the engine reads the group's open tasks:
+   ```bash
+   "{BKIT}" tasks open --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --group={GROUP} --log="docs/plans/{YYYYMM}/logs/{FID}/build-plan-execute-{GROUP}-log.md"
+   ```
+   Hold `handover` as `EXECUTE_HANDOVER`.
+   - **If** (`EXECUTE_VERDICT` = HANDOVER **or** `EXECUTE_HANDOVER` = true) **and** `EXECUTE_RESUMED` is not held for `GROUP` → the agent stopped at its turn cap: a handover, not a failed attempt → `EXECUTE_RESUMED` = `GROUP` → re-run Step 6; its brief leaves out the `DONE` tasks.
    - **Else** → Step 7.
 
 ### 🔒 Gate 6 — Plan Execute
@@ -466,33 +470,40 @@ One pass of Steps 6-8 per plan group, in group order: Step 6 briefs the first gr
 4. **Subagent:** Invoke `@bkit-build-plan-verify` using `Agent` tool:
    Context: You are a subagent in the Build phase. Group verification. Group `{GROUP}`, attempt `{VERIFY_ATTEMPT}`. Switch into working directory `cd "{WORKTREE_PATH}"` → verify with `pwd` → use for all subsequent file operations. Plan caps (`bkit.workflows.tasks`): {MAX_TASKS_PER_GROUP} tasks and {MAX_TESTS_PER_GROUP} `TEST FIRST` tests per group; {MAX_TESTS_PER_TASK} tests across {MAX_TEST_FILES_PER_TASK} test files per task.
    Read: glob `docs/plans/{YYYYMM}/logs/{FID}/build-brief-{GROUP}-*.md`, `docs/plans/{YYYYMM}/logs/{FID}/build-diff-{GROUP}-{VERIFY_ATTEMPT}.md`, `docs/plans/{YYYYMM}/logs/{FID}/build-plan-execute-{GROUP}-log.md`, `docs/plans/{YYYYMM}/logs/{FID}/build-tests-green-{GROUP}-{VERIFY_ATTEMPT}.md`, `docs/plans/{YYYYMM}/logs/{FID}/build-plan-current.md` (if present), glob `docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-{GROUP}-*.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-{GROUP}-*-log.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-decision-*.md`.
-   Update: `docs/plans/{YYYYMM}/{FID}-plan.md` (tick only group `{GROUP}`'s tasks).
    Create: `docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-{GROUP}-{VERIFY_ATTEMPT}.md`.
 5. Finish:
    ```bash
    "{BKIT}" steps finish --workflow=build --step=build-plan-verify --file="{STATUS}" --attempt-of=build-plan-verify:next --group={GROUP} --agent=bkit-build-plan-verify --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-{GROUP}-<attempt>.md" --message="chore({FID}): plan-verify group {GROUP} attempt <attempt>" --number=7 --post --title="Plan Verify"
    ```
-   Hold `verdict` as `VERIFY_VERDICT`, `failures` as `VERIFY_FAILURES`, `fields.Fixable` as `VERIFY_FIXABLE`.
-6. Route:
+   Hold `verdict` as `VERIFY_VERDICT`, `failures` as `VERIFY_FAILURES`, `fields.Fixable` as `VERIFY_FIXABLE`, `fields.Tasks` as `{VERIFIED_TASKS}`.
+6. Tick the plan with the satisfied task numbers; a task the test-first report gaps stays open:
+   ```bash
+   "{BKIT}" tasks tick --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --group={GROUP} --tasks="{VERIFIED_TASKS}" --green="docs/plans/{YYYYMM}/logs/{FID}/build-tests-green-{GROUP}-{VERIFY_ATTEMPT}.md"
+   ```
+7. Route:
    - **If** `VERIFY_VERDICT` = PASS → list the plan's groups:
      ```bash
      "{BKIT}" tests plan-check --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --existence=report --log="{OUTBOX}/build-plan-check-{GROUP}.md"
      ```
-     **If** exit non-zero → **Failure Path**. **If** the printed `groups` hold a group numbered above `GROUP` → sub-step 7. **Else** → `GATE_VERDICT` = SKIPPED → sub-step 9.
-   - **Else** → `GATE_VERDICT` = SKIPPED → sub-step 9.
-7. Run the group gate; it writes the trimmed log to the artifact:
+     Route:
+     - **If** exit 1 with a `matrix` or `supersession` problem, **and** `CONVERT_RETRY` is not held → `CONVERT_RETRY` = the printed `problems` → Step 3 sub-step 3.
+     - **If** exit non-zero → **Failure Path**.
+     - **If** the printed `groups` hold a group numbered above `GROUP` → sub-step 8.
+     - **Else** → `GATE_VERDICT` = SKIPPED → sub-step 10.
+   - **Else** → `GATE_VERDICT` = SKIPPED → sub-step 10.
+8. Run the group gate; it writes the trimmed log to the artifact:
    ```bash
    "{BKIT}" tests run --gate=bkit:gate:static-unit-integration --gate=bkit:gate:static-unit --log="{OUTBOX}/build-group-gate-{GROUP}-{VERIFY_ATTEMPT}.log" --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-group-gate-{GROUP}-{VERIFY_ATTEMPT}.md" --fid={FID} --step=build-group-gate-{GROUP} --attempt={VERIFY_ATTEMPT}
    ```
    Route:
-   - **If** exit 0 **or** 1 → hold `verdict` as `{GATE_VERDICT}`, `scope` as `{TEST_SCOPE}` → sub-step 8.
+   - **If** exit 0 **or** 1 → hold `verdict` as `{GATE_VERDICT}`, `scope` as `{TEST_SCOPE}` → sub-step 9.
    - **Else** → **Failure Path**.
-8. Finish:
+9. Finish:
    ```bash
    "{BKIT}" steps finish --workflow=build --step=build-group-gate --file="{STATUS}" --verdict={GATE_VERDICT} --scope="{TEST_SCOPE}" --attempt-of=build-plan-verify:current --group={GROUP} --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-group-gate-{GROUP}-<attempt>.md" --clamp-log="build-group-gate-{GROUP}:<attempt>" --message="chore({FID}): group-gate group {GROUP} attempt <attempt>" --number=7 --post --title="Group Gate"
    ```
-9. **If** `VERIFY_VERDICT` = PASS **and** `GATE_VERDICT` != FAIL → Step 6 (the next group, or Step 9 when none is open).
-10. **If** `VERIFY_VERDICT` = CONCERNS or FAIL, **or** `GATE_VERDICT` = FAIL → route on the group's verify rounds:
+10. **If** `VERIFY_VERDICT` = PASS **and** `GATE_VERDICT` != FAIL → Step 6 (the next group, or Step 9 when none is open).
+11. **If** `VERIFY_VERDICT` = CONCERNS or FAIL, **or** `GATE_VERDICT` = FAIL → route on the group's verify rounds:
     ```bash
     "{BKIT}" counters route --name=VERIFY_ATTEMPT --of=build-plan-verify:current --file="{STATUS}" --workflow=build --group={GROUP} --point=build.verify --continue=within-limit --exceeded=failure-path
     ```
@@ -505,7 +516,7 @@ One pass of Steps 6-8 per plan group, in group order: Step 6 briefs the first gr
     - **If** exit 0 **and** `VERIFY_ROUNDS` < `PAUSE_MAX` → `PAUSE_QUESTION` = `VERIFY_LOOP` → **Decision Pause**.
     - **If** exit 0 → `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause** (no round left: decide the open gaps).
     - **Else** → **Failure Path**.
-11. **Else** → **Failure Path**.
+12. **Else** → **Failure Path**.
 
 ### 🔒 Gate 7 — Plan Verify
 
@@ -521,7 +532,7 @@ One pass of Steps 6-8 per plan group, in group order: Step 6 briefs the first gr
 
 ### 🧠 Step 8 — Plan Gaps Remediate
 
-**Run only if** Step 7 sub-step 10 or the **Decision Pause** routed here.
+**Run only if** Step 7 sub-step 12 or the **Decision Pause** routed here.
 
 1. Read status.jsonl and derive next `STRATEGY`:
    ```bash
@@ -590,7 +601,12 @@ Runs once, after the last group; challenge fix groups pass through here on the w
    ```bash
    "{BKIT}" steps finish --workflow=build --step=build-plan-verify-holistic --file="{STATUS}" --attempt=1 --agent=bkit-build-plan-verify --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-holistic.md --message="chore({FID}): plan-verify-holistic" --number=9 --post --title="Plan Verify Holistic"
    ```
-4. Route:
+   Hold `fields.Tasks` as `{VERIFIED_TASKS}`.
+4. Tick each group's satisfied tasks — one call per plan group, `{GROUP}` that group and `{VERIFIED_TASKS}` the numbers `Tasks:` names for it:
+   ```bash
+   "{BKIT}" tasks tick --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --group={GROUP} --tasks="{VERIFIED_TASKS}"
+   ```
+5. Route:
    - **If** `verdict` = PASS or CONCERNS → Step 10.
    - **Else** → **Failure Path**.
 
diff --git a/.agents/skills/bkit-ship/SKILL.md b/.agents/skills/bkit-ship/SKILL.md
index d37921ffc..40cd5a5d4 100644
--- a/.agents/skills/bkit-ship/SKILL.md
+++ b/.agents/skills/bkit-ship/SKILL.md
@@ -369,7 +369,7 @@ description: "Ship Feature — Autonomous merge and archive"
    cd "{WORKTREE_PATH}" && "{BKIT}" context diff --reset-log --artifact="tmp/bkit-diff-{FID}.md" --fid={FID} --step=ship-deferred-sweep >/dev/null || exit 2
    ```
    **Subagent:** Invoke `@bkit-ship-deferred-sweep` using `Agent` tool:
-   Context: You are a subagent in the Ship phase. Pre-merge completeness gate. Switch into working directory `cd "{WORKTREE_PATH}"` → verify with `pwd` → use for all subsequent file operations.
+   Context: You are a subagent in the Ship phase. Pre-merge completeness gate. Diff base: `origin/dev` — run `bkit branches scan-diff --disabled-tests --base=origin/dev`. Switch into working directory `cd "{WORKTREE_PATH}"` → verify with `pwd` → use for all subsequent file operations.
    Read: `docs/plans/{YYYYMM}/logs/{FID}/ship-input-{RUN}.md`, `docs/plans/{YYYYMM}/{FID}-plan.md` (if present), `docs/plans/{YYYYMM}/{FID}-design.md` (if present), `{STATUS}`, `docs/deferrals.jsonl`, glob `docs/plans/{YYYYMM}/logs/{FID}/*-plan-verify*.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/*-challenge*.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/*-summary.md`, `tmp/bkit-diff-{FID}.md` (the run's diff).
    Create: `docs/plans/{YYYYMM}/logs/{FID}/ship-deferred-sweep.md`.
 3. Finish (bookkeeping to `$BOOK_ROOT`):
@@ -394,26 +394,30 @@ description: "Ship Feature — Autonomous merge and archive"
 
 ## 🧠 Step 6 — Update Docs & Summary
 
-1. **Subagent:** Invoke `@bkit-ship-update-docs` using `Agent` tool:
+1. Write the FID's deferral lines to the artifact the docs agent reads `Pending Items` from:
+   ```bash
+   cd "{WORKTREE_PATH}" && "{BKIT}" context ledger-scan --terms="{FID}" --source=docs/deferrals.jsonl --artifact="{OUTBOX}/ship-pending-items.md" --fid={FID} --step=ship-update-docs --reset-log >/dev/null || exit 1
+   ```
+2. **Subagent:** Invoke `@bkit-ship-update-docs` using `Agent` tool:
    Context: You are a subagent in the Ship phase. Switch into working directory `cd "{WORKTREE_PATH}"` → verify with `pwd` → use for all subsequent file operations.
-   Read: `docs/plans/{YYYYMM}/{FID}-plan.md` (if present), glob `docs/plans/{YYYYMM}/logs/{FID}/*.md` (excluding `*-summary.md` / `*-handover.md`).
+   Read: `docs/plans/{YYYYMM}/{FID}-plan.md` (if present), glob `docs/plans/{YYYYMM}/logs/{FID}/*.md` (excluding `*-summary.md` / `*-handover.md`), `{OUTBOX}/ship-pending-items.md`.
    Update: Doc files.
    Create: `docs/plans/{YYYYMM}/logs/{FID}/ship-update-docs.md`.
-2. Wait for the subagent to complete, then append the `SHIPPED` row to the worktree ledger and re-render the mechanical `roadmap-status` board from it (exit 1 when the row did not land), and finish the step (bookkeeping to `$BOOK_ROOT`):
+3. Wait for the subagent to complete, then append the `SHIPPED` row to the worktree ledger and re-render the mechanical `roadmap-status` board from it (exit 1 when the row did not land), and finish the step (bookkeeping to `$BOOK_ROOT`):
    ```bash
    "{BKIT}" roadmap feature --root="{WORKTREE_PATH}" --workflow=ship --fid="{FID}" --step=ship-update-docs --strict >/dev/null || exit 1
    "{BKIT}" steps finish --workflow=ship --step=ship-update-docs --file="{STATUS}" --artifact="docs/plans/{YYYYMM}/logs/{FID}/ship-update-docs.md" --commit=none >/dev/null || exit 1
    ```
-3. Write `ship-summary.md` from this run's status rows and the PR's size:
+4. Write `ship-summary.md` from this run's status rows and the PR's size:
    ```bash
    "{BKIT}" workflows summary --workflow=ship --file="{STATUS}" --pr={PR_NUMBER}
    ```
    **If** exit non-zero → **Failure Path**. Hold `verdict` as `SUMMARY_VERDICT`, `failures` as `SUMMARY_FAILURES`.
-4. Finish (bookkeeping to `$BOOK_ROOT`):
+5. Finish (bookkeeping to `$BOOK_ROOT`):
    ```bash
    "{BKIT}" steps finish --workflow=ship --step=ship-summary --file="{STATUS}" --attempt=1 --verdict={SUMMARY_VERDICT} --failures={SUMMARY_FAILURES} --artifact="docs/plans/{YYYYMM}/logs/{FID}/ship-summary.md" --commit=none --number=6 --post --title="Update Docs & Summary" --link-ref=dev --comment-body
    ```
-5. Route:
+6. Route:
    - **If** `SUMMARY_VERDICT` = PASS or CONCERNS → Step 7.
    - **If** `SUMMARY_VERDICT` = FAIL → display `ship-summary.md` content verbatim as final message to user. Line 1 of the final message = the no-issue warning, when one was emitted. → **Failure Path**.
    - **Else** → **Failure Path**.
diff --git a/.bkit/core/.bkit/pipeline.md b/.bkit/core/.bkit/pipeline.md
index 166dbdc4a..de8cf83f0 100644
--- a/.bkit/core/.bkit/pipeline.md
+++ b/.bkit/core/.bkit/pipeline.md
@@ -84,7 +84,7 @@ Each phase lists subagents in execution order. "Parallel" = same-time run, merge
   │ 4. brief             (engine: the group's open tasks + plan context)
   │ 5. execute group     (producer — implement the group's tasks, reds first;
   │                       turn cap near → HANDOVER, re-run once)
-  │ 6. verify group      (critic — the group's own diff; tick only on confirmed artifacts)
+  │ 6. verify group      (critic — the group's own diff; passes satisfied task numbers, engine ticks)
   │                       ↶ producer-critic loop, capped 3 attempts;
   │                         unfixable gaps / no progress → Decision Pause (human, in session)
   │ 7. gaps-remediate    (fix verifier gaps, re-verify)
@@ -210,7 +210,7 @@ Output: PR to `dev`. Heaviest phase — most steps verify rather than produce. C
 | `bkit-build-plan-current` | Plan freshness | Judges whether changes landed since the plan was written leave it executable; findings feed execute. |
 | `bkit-build-install-skills` | Setup | Installs the skills the plan needs for this build. |
 | `bkit-build-plan-execute` | Producer | Implements one plan group's tasks from its brief, each task's tests seen failing first; iterates edit → lint/typecheck/test → edit. Near its turn cap it hands over (`HANDOVER`) and the group re-runs once. |
-| `bkit-build-plan-verify` | Critic | Verifies each task of one group against the group's own diff; ticks boxes only on confirmed artifacts. Producer-critic loop, capped at 3 attempts per group. |
+| `bkit-build-plan-verify` | Critic | Verifies each task of one group against the group's own diff; passes the satisfied task numbers, and `bkit tasks tick` sets the boxes. Producer-critic loop, capped at 3 attempts per group. |
 | `bkit-build-plan-gaps-remediate` | Gap-fixer | Fills gaps the verifier found, then re-verifies. |
 | `bkit-build-plan-verify` | Holistic critic | Second, whole-of-plan verification pass across everything built. |
 | `bkit-build-challenge-1` | Bug-hunting | Adversarial review of the full diff; writes each finding as a plan task with a test first. Forbidden from reading its sibling. Parallel. Runs only on a large change (300+ lines or 10+ files, `docs/plans/**` excluded, measured by `bkit challenge gate`); a small one runs `-2` alone. `bkit challenge merge` then appends the findings to the plan, and execute + verify fix them. |
diff --git a/.bkit/core/.bkit/prompts.md b/.bkit/core/.bkit/prompts.md
index 545e80230..7953b4161 100644
--- a/.bkit/core/.bkit/prompts.md
+++ b/.bkit/core/.bkit/prompts.md
@@ -275,11 +275,11 @@ Canonical per-agent metadata — **single source of truth for model per agent**.
 <!-- prettier-ignore -->
 | Agent | Scope |
 | --- | --- |
-| `bkit-build-plan-convert` | Write the plan's `Agent Execution Runbook` as groups of task blocks when `bkit tests plan-check` finds none, from whatever input arrives in `build-input-{RUN}.md` (session prompt, issue text, plan as it arrived) and the plan file. Keeps every section outside the runbook and every end state and test the inputs name, tightened and never weakened. Same scope: adds no work the issue or plan does not ask for, drops none. Group and task caps: the `bkit.workflows.tasks` values the workflow passes in Context. Names only files it opened; a symbol it did not find → the file alone. A `NEW` `Reuse Inventory` row per `CREATE` file. Never writes `TEST EXCEPTION` of its own and never authors a `bkit:anchor` block; copies each `TEST EXCEPTION` an input writes word for word (a request the owner confirms at the build's Decision Pause). Where the plan and the issue disagree, the plan wins. Runs the check command the orchestrator supplies, at most 3 times. No verdict header. |
-| `bkit-build-plan-current` | Judge whether changes landed on `origin/dev` since the plan's `bkit:anchor` `baseSha` leave its tasks executable. Derives its own changed-path list from `BASE_SHA` (orchestrator-supplied via Context), intersects it against the paths each task depends on, and reads per-path diffs for the intersection only — no whole-range diff, no path outside it. Same output shape as `bkit-build-challenge-*`: header count + one append-only findings section. `Executable` tasks are not findings and are not logged; `Reword` / `Broken` are, and `Affected` = their count. PASS = no affected task; CONCERNS = any `Reword`; FAIL = any `Broken`. All three are advisory — build proceeds on every verdict and `@bkit-build-plan-execute` reads the findings as its currency input. Judges the plan against the codebase — the design doc is not an input and a superseded design is not a finding. Commit distance and elapsed time never carry the verdict. Does not revise the plan: remediation is a `/bkit-plan` re-run, never `bkit-plan-update` from build. |
+| `bkit-build-plan-convert` | Write the plan's `Agent Execution Runbook` as groups of task blocks when `bkit tests plan-check` finds none, from whatever input arrives in `build-input-{RUN}.md` (session prompt, issue text, plan as it arrived) and the plan file. Keeps every section outside the runbook and every end state and test the inputs name, tightened and never weakened. Same scope: adds no work the issue or plan does not ask for, drops none. Group and task caps: the `bkit.workflows.tasks` values the workflow passes in Context. The plan's `Derived Test Matrix` keeps a `Task` column beside `Test description`, `Type` and `Target file`, each cell naming the one runbook task that lands that row's test. Names only files it opened; a symbol it did not find → the file alone. A `NEW` `Reuse Inventory` row per `CREATE` file. Never writes `TEST EXCEPTION` of its own and never authors a `bkit:anchor` block; copies each `TEST EXCEPTION` an input writes word for word (a request the owner confirms at the build's Decision Pause). Where the plan and the issue disagree, the plan wins. Runs the check command the orchestrator supplies, at most 3 times. No verdict header. |
+| `bkit-build-plan-current` | Judge whether changes landed on `origin/dev` since the plan's `bkit:anchor` `baseSha` leave its tasks executable. Runs `bkit tasks currency --plan= --base={BASE_SHA} --against=origin/dev` — the engine records each task's in-scope paths and symbols in the plan block and prints only the tasks whose path or symbol moved in `{BASE_SHA}...origin/dev`, each with its matched paths, needles and diff hunks — and reads those hunks only, no whole-range diff, no path outside a matched set. Same output shape as `bkit-build-challenge-*`: header count + one append-only findings section. `Executable` tasks are not findings and are not logged; `Reword` / `Broken` are, and `Affected` = their count. PASS = no affected task; CONCERNS = any `Reword`; FAIL = any `Broken`. All three are advisory — build proceeds on every verdict and `@bkit-build-plan-execute` reads the findings as its currency input. Judges the plan against the codebase — the design doc is not an input and a superseded design is not a finding. Commit distance and elapsed time never carry the verdict. Does not revise the plan: remediation is a `/bkit-plan` re-run, never `bkit-plan-update` from build. |
 | `bkit-build-install-skills` | Identify and install relevant skills via `npx skills find`/`add`: quality-hurdle the source (official publisher, or 1000+ installs / 100+ stars), install one named skill per gap, report provenance. |
 | `bkit-build-plan-execute` | Execute one plan group — the task blocks in the brief `bkit context brief --next` writes; earlier tasks in the brief are context only; the brief's `Deviations` section, when present, is the owner's run instruction, applied to the tasks it names. An existing log is kept and its `Verdict` reset to `PENDING`. Verdict PASS / HANDOVER / FAIL: `HANDOVER` = turn cap near with tasks neither `DONE` nor `BLOCKED` → stop after the current task's log line; the workflow re-runs the group once with a fresh brief, not as a failed attempt. Per task naming `TEST FIRST` tests: tests + stubs first, then the red command the orchestrator supplies in Context (`bkit tests red`) once per test — never the task's code before every red is recorded; skipped for tasks logged `DONE — TASK {N}: already landed`; refused as `passed` → `BLOCKED` (never undo code to force a red); no red for tests a task's `TEST EXCEPTION` field names, never touches one; other refusals → fix test / stub and re-run; `bkit:test:file` not declared → `red not enforced`; could not run → `BLOCKED` (`.bkit/workflows.md` § Test-first). Branches on the outcome the command prints, not its exit code; honours the brief's `Reuse Inventory` rows and `Architecture` entries at the only point the decision can still be quietly discarded — `EXTEND` row modifies named artifact, never a parallel file; rows or entries the brief left out (8 KB work cap) → reads the plan section it names; reusable artifact found mid-build folds in, never forks; reads each task's `DONE WHEN` field as the completion criterion to satisfy; modify source; write stub artifact first then incremental `## Task Log` entries — one `DONE — TASK {N}:` or `BLOCKED — TASK {N}:` line per task at line start, which the next brief reads to skip finished tasks. Reads `build-plan-current.md` when present: findings are fact, plan is intent — `Reword` tasks build at the paths the report names as current, `Broken` tasks whose work already landed log `DONE — TASK {N}: already landed`, the rest build the intent against current code. Never edits the plan file; tasks absent from the findings follow plan wording verbatim. Does not tick plan checkboxes (verify owns that). Does not write `docs/deferrals.jsonl` — a blocked task is a `BLOCKED` log line for verify to catch, not a deferral. |
-| `bkit-build-plan-verify` | Verify implementation vs plan; writes Plan Verification log. `Group` mode judges one group's briefs against the group diff (changes since the group's start commit); `Holistic` mode runs once after the last group, across every group, plus integration. Ticks plan `- [ ] **TASK {N}:**` → `[x]` only when the task's `DONE WHEN` field is satisfied in the codebase and the orchestrator's test-first audit report (`bkit tests green`) shows no gap for it — `not-green` `Fixable: true`; `test-changed` / `red-mismatch` judged from the diff; `added lines only` diff read, a line added inside a planned test or its setup → `test-changed`; `red-mismatch` for a planned test renamed or moved and passing now → no gap; `no-red` on an already-landed task (plan-currency `Broken` + execute `DONE — TASK {N}: already landed`) → no gap; `delete-still-referenced` → each hit read, a different thing with the same name → no gap, else `Fixable: true`; other `no-red`, `late-red`, `exception-refused` and the plan-defect kinds `Fixable: false`; each gap logged `TASK {N}` with `— Fixable: true` / `— Fixable: false`, header `Fixable: true` when any gap is (build → fixable-only remediate, then Decision Pause); test-order gaps logged with task, test file and test name; a test a task's `TEST EXCEPTION` field names is no gap; `Late-red check` tasks → `Notes` — a `BLOCKED` log line or a deferral row never discharges a task, so unfinished work routes to `@bkit-build-plan-gaps-remediate` in-loop instead of surfacing at ship. Missing `DONE WHEN` on any task → FAIL (template structure broken; remediation cannot recover). |
+| `bkit-build-plan-verify` | Verify implementation vs plan; writes Plan Verification log. `Group` mode judges one group's briefs against the group diff (changes since the group's start commit); `Holistic` mode runs once after the last group, across every group, plus integration. Ticks are the engine's: the header's `Tasks` line names the task numbers the codebase satisfies and `bkit tasks tick --green=` writes the `[x]`; the prompt edits no plan and never ticks a box. `bkit tests green` prints `verdict` and a `fixable` per gap, so the prompt holds no kind→`Fixable` table and no verdict mapping. Its four diff reads decide only a `null` gap: `delete-still-referenced` → each hit read, a different thing with the same name → no gap, else `Fixable: true`; `test-changed` → only formatting → no gap, weakened / removed / rewritten assertions → `Fixable: false`, and on `added lines only` any line added inside a planned test or its setup → `Fixable: false`; `red-mismatch` → recorded test is the planned one renamed or moved and passes now → no gap, nor for that test's `not-green`, else `Fixable: false`; `no-red` on a task the plan-currency report classifies `Broken` with work already landed **and** the execute log records `DONE — TASK {N}: already landed` → no gap, overriding the engine's `Fixable: false`. Each gap is appended as the report's `logLine` with the decided `Fixable` in place of `null`; every other gap keeps its printed `fixable`; header `Failures` = unresolved gap count and `Fixable` = `true` when any is (build → fixable-only remediate, then Decision Pause); a test a task's `TEST EXCEPTION` field names is no gap; `Late-red check` tasks → `Notes` — a `BLOCKED` log line or a deferral row never discharges a task, so unfinished work routes to `@bkit-build-plan-gaps-remediate` in-loop instead of surfacing at ship. Missing `DONE WHEN` on any task → FAIL (template structure broken; remediation cannot recover). |
 | `bkit-build-plan-gaps-remediate` | Fix specific gaps from the group's latest verify log + group gate log failures (the tests of the groups so far; that gate MUST pass too); reads the group's briefs for its task blocks; Standard / Pivot / Final escalation. Context `Scope: fixable only` → `— Fixable: false` gaps out of scope. Header `Fixed` = gaps `DONE` this attempt (0 → build Decision Pause). A supplied decision record → the owner's `Decision:` words steer the round. No strategy records a red by undoing or swapping out code; test-order gap → `BLOCKED`; never touches a `TEST EXCEPTION` field (`.bkit/workflows.md` § Test-first). |
 | `bkit-build-challenge-1` | Adversarial review of `git diff origin/dev...HEAD` — bug-hunting lens; effort slot 1 (`high`). Parallel with `-2`. Writes each finding as one task block — `Severity`, `Class` (`mechanical\|architectural`), `Fixable`, `Location`, `DONE WHEN`, `TEST FIRST` within the per-task `bkit.workflows.tasks` caps the workflow passes in Context — that `bkit challenge merge` appends to the plan as a new last group. Never references sibling output (circular reasoning guard). |
 | `bkit-build-challenge-2` | Same as `-1` — security lens; effort slot 2 (`high` on Claude / opus — depth-sensitive; Grok on Cursor — first-party depth, same native pool as `-1`). |
@@ -303,8 +303,8 @@ Canonical per-agent metadata — **single source of truth for model per agent**.

<!-- prettier-ignore -->
 | Agent | Scope |
 | --- | --- |
 | `bkit-ship-conflict-resolve` | Mid-rebase mechanical conflict resolver. Invoked from `/bkit-ship` Step 4 B2 when the PR conflicts textually with `origin/dev`: rebases onto `origin/dev`, runs `bkit branches rebase` first (unions ledgers, regenerates the lockfile), then hand-resolves only what that leaves conflicted. Allowed: non-overlapping additive edits, formatting drift, dep-version supersedes, additive JSON entries. Refused: same-function edits, semantic overlaps, ambiguous intent — FAIL aborts the rebase cleanly and routes to `bkit-debug-abort-handover`. Verifies via `bkit:gate:install-static-unit-build` before PASS. |
-| `bkit-ship-deferred-sweep` | Pre-merge completeness gate. Builds the intended-delivery set from plan `Acceptance Scenario` sections + `DONE WHEN` fields and asserts each against the codebase. No plan file → `ship-input-*.md` is the plan; intended-delivery set = its requested outcomes. An unmet / unplanned gap → FAIL → Failure Path (merge never happens) ONLY on >=1 of four blocking tests, each asserted against source, never inferred from a plan sentence: behaviour (absent / stub / wrong result), safety (guard weakened, known-broken path ships), false green (this diff disabled a covering test — `bkit branches scan-diff --disabled-tests` names each hit), consumer break (shipped surface fails at runtime). Lane results are not evidence — bkit lanes are event-scoped, some push-to-`dev` only, so a pre-merge sweep reading them re-creates the unsatisfiable refusal that made gate code 16 opt-in; the gate + capstone own green. A gap passing none is `Lazy`: stale prose / comment / name, doc drift, unwritten ledger row, formatting, future-enhancement `TODO`, `DONE WHEN` met in substance not literal wording. Branch is green by this step, so aborting on a record-keeping gap leaves the work unmerged and the record unwritten. Declared deferrals (out-of-scope / future-work / non-goals across design, plan, `docs/deferrals.jsonl`, summaries) form the exempt set — never block, resurfaced verbatim in the ship summary's `Deferred & Out-of-Scope (Resurfaced)` section. Exemption is EARNED, not self-granted: each entry's `reason` (`.bkit/jsonl.md` § Deferral Reason) is adjudicated against the four tests, and one that fails moves to that same third track `Lazy (unjustified)` — same-`key` ledger append setting `reason` = `unjustified`, resurfaced as follow-up, never blocking the merge (a bounded fix is cheaper than an aborted ship). Both `Lazy` sources share one append shape; every item carries its row before the verdict is set. The intended-delivery set is those two sources and NOTHING else — every precondition, build process step and merge condition a plan states is advisory, never a gate: plan `Gate N` checkboxes, `Verification Plan` boxes and `Manual Verification` steps are build-phase process, never deliverables, and no phrasing in a plan, log or phase summary makes one blocking (the gate reaches only what the repo can be made to prove; the plan template carries the matching authoring rule). Invoked from `/bkit-ship` Step 5 (after Conflict Resolve, before Merge). |
-| `bkit-ship-update-docs` | Cross-reference changed files against every doc in `docs.md`; update stale. |
+| `bkit-ship-deferred-sweep` | Pre-merge completeness gate. Builds the intended-delivery set from plan `Acceptance Scenario` sections + `DONE WHEN` fields and asserts each against the codebase. No plan file → `ship-input-*.md` is the plan; intended-delivery set = its requested outcomes. An unmet / unplanned gap → FAIL → Failure Path (merge never happens) ONLY on >=1 of four blocking tests, each asserted against source, never inferred from a plan sentence: behaviour (absent / stub / wrong result), safety (guard weakened, known-broken path ships), false green (this diff disabled a covering test — `bkit branches scan-diff --disabled-tests` names each hit), consumer break (shipped surface fails at runtime). Lane results are not evidence — bkit lanes are event-scoped, some push-to-`dev` only, so a pre-merge sweep reading them re-creates the unsatisfiable refusal that made gate code 16 opt-in; the gate + capstone own green. A gap passing none is `Lazy`: stale prose / comment / name, doc drift, unwritten ledger row, formatting, future-enhancement `TODO`, `DONE WHEN` met in substance not literal wording. Branch is green by this step, so aborting on a record-keeping gap leaves the work unmerged and the record unwritten. Declared deferrals (out-of-scope / future-work / non-goals across design, plan, `docs/deferrals.jsonl`, summaries) form the exempt set — never block, resurfaced verbatim in the ship summary's `Deferred & Out-of-Scope (Resurfaced)` section. Exemption is EARNED, not self-granted: the prompt holds no reason test — `bkit ledgers triage --fid= --plan=` applies the deferral tests and writes every `unjustified` / `TRIAGED` row itself, printing each plan-related row's `key`, `bucket` and test result, and one that fails moves to that third track `Lazy (unjustified)`, resurfaced as follow-up, never blocking the merge (a bounded fix is cheaper than an aborted ship). Both `Lazy` sources share one append shape; every item carries its row before the verdict is set. The intended-delivery set is those two sources and NOTHING else — every precondition, build process step and merge condition a plan states is advisory, never a gate: plan `Gate N` checkboxes, `Verification Plan` boxes and `Manual Verification` steps are build-phase process, never deliverables, and no phrasing in a plan, log or phase summary makes one blocking (the gate reaches only what the repo can be made to prove; the plan template carries the matching authoring rule). Invoked from `/bkit-ship` Step 5 (after Conflict Resolve, before Merge). |
+| `bkit-ship-update-docs` | Cross-reference changed files against every doc in `docs.md`; update stale. `Pending Items` comes from the `ship-pending-items.md` deferral scan the workflow writes with `bkit context ledger-scan --terms={FID} --source=docs/deferrals.jsonl`; the agent writes no ledger row and reads no `docs/deferrals.jsonl` directly. |
 
 ## Audit (Ad-hoc)
 
diff --git a/.bkit/core/.bkit/workflows.md b/.bkit/core/.bkit/workflows.md
index b0d840b0b..536d571e4 100644
--- a/.bkit/core/.bkit/workflows.md
+++ b/.bkit/core/.bkit/workflows.md
@@ -875,10 +875,10 @@ Each subsection documents command behaviour — steps, subagents, artifacts, ver
 | 3 — Branch Sync | `@bkit-build-plan-convert` _(only when the plan is missing, has no task markers, or is older than an issue comment)_ | `bkit branches sync --merge-docs`: fetch `origin/dev`; when commits touching `docs/` are behind, merge it — ledger conflicts union, other `docs/` conflicts take `dev`, a conflict outside `docs/` aborts the merge (exit 11 → Failure Path). Then `bkit tests plan-check --existence=report` on `{FID}-plan.md` → `build-plan-check.md`. No plan (exit 2), a plan with no task markers (exit 1, problem `markers`) or with a `matrix` / `supersession` problem, or a valid plan with issue comments posted after its last commit (`newerThanPlan` > 0 from Step 2's `workflows input`) → `@bkit-build-plan-convert` writes the plan in task-block form from `build-input-{RUN}.md` and the plan file, keeping any existing plan's other sections; where they disagree the newer text wins, so later comments change the plan before any code; convert copies each `TEST EXCEPTION` an input writes word for word and never writes its own; row `build-plan-convert`, then the check re-runs. Still failing → convert once more with the printed problems, then Failure Path. Any other problem (caps, a stray `TEST FIRST` line) → Failure Path before any code, naming each problem. `bkit install` / `check` / `upgrade` list each `{FID}-plan.md` with no task markers whose FID has not shipped as advisory `plan-task-markers-missing`; nothing to do by hand, this step converts it. |
 | 4 — Plan Current | `@bkit-build-plan-current` _(skipped when the mechanical trigger clears)_ | Orchestrator trigger `bkit branches anchor-read --field=baseSha --against=origin/dev` reads the plan's `bkit:anchor` (§ Anchor Block) and exits 12 — skipping the whole step, no agent, no `step-done` row, same shape as Step 5's `[skills=false]` skip — on any of: no plan, no anchor, `baseSha` unreachable in this clone, nothing landed on `origin/dev` since it. Else it prints `value` (= `BASE_SHA`) and the agent derives its own changed-path list from it, intersects that against the paths the plan's tasks depend on, and reads per-path diffs for the intersection only. `Executable` tasks are not findings; `Reword` / `Broken` are. Judges the PLAN against the codebase — the design doc is not an input, and `designPath` / `designBaseSha` have no consumer here. `CURRENT_VERDICT` is advisory on every value — PASS / CONCERNS / FAIL all → Step 5; CONCERNS / FAIL are recorded, comment-posted with `Affected`, and echoed as a console advisory, never blocking. Findings carry into Step 6 as a Read for `@bkit-build-plan-execute`; build never revises the plan, a re-run of `/bkit-plan` does. |
 | 5 — Skills | `@bkit-build-install-skills` _(skip if input contains `[skills=false]`)_ | If new skills installed → commit `chore({FID}): install skills bkit [skip ci]`. |
-| 6 — Execute Plan | `@bkit-build-plan-execute` | `bkit context brief --next` writes `build-brief-{GROUP}-{n}.md` — the group's open task blocks, the reds already recorded for them, the earlier tasks they depend on as context, and the plan's `Reuse Inventory` rows and `Architecture & Component Changes` entries naming the open tasks' `CREATE` / `UPDATE` / `DELETE` files (rows and entries past the 8 KB work cap are left out and counted; execute then reads the plan section) — and prints `group` (null → Step 9), `workBytes` and `workCap`. When the session prompt carries run instructions beyond naming the issue, the orchestrator writes them once to `{SESSION_DIR}/brief-note.md` and passes `--note-file`, so each brief ends with a `Deviations` section the agents apply to the tasks it names. A `build-group-start` row records the commit the group starts from, once per group. The orchestrator passes paths only; the agent reads the brief, not the plan and not `build-input-{RUN}.md`. Per group: `build-plan-execute-{GROUP}-log.md`. Attempt-numbered rows (`--attempt-of=build-plan-execute:next`), one log appended across attempts. Writes stub-first then incremental `DONE — TASK {N}` / `BLOCKED — TASK {N}` log entries via `Bash echo >>`; writes source. Per task naming `TEST FIRST` tests: tests + stubs first, then the red command from Context (`bkit tests red`, § Test-first) once per test before the task's code. Does not modify the plan — ticking is verify's job (per-task `Edit`-tick phase after impl is done is a known timeout vector; verify absorbs recovery). Verdict `HANDOVER` (turn cap near), or a task with neither a `DONE` nor a `BLOCKED` line (the agent hit its turn cap) → Step 6 re-runs once for that group as a handover, not a failed attempt, its brief leaving out the `DONE` tasks; the tracker comment shows `HANDOVER`; after that the verify→remediate loop (Step 7 → Step 8, bounded by `build.verify.maxAttempts`) absorbs the recovery. Else → Step 7. |
-| 7 — Verify Plan | `@bkit-build-plan-verify` | `bkit tests green --group` first (§ Test-first) → `build-tests-green-{GROUP}-{VERIFY_ATTEMPT}.md`, read by verify and remediate; exit >= 2 → Failure Path. `bkit context diff --base=` the group's start commit → `build-diff-{GROUP}-{VERIFY_ATTEMPT}.md`, the changes since the group started. Per group, attempt-numbered: `build-plan-verify-{GROUP}-{VERIFY_ATTEMPT}.md`. Reads the group's briefs, the diff, the execute log's `DONE —` lines and `build-plan-current.md` (already-landed tasks); ticks `- [ ] **TASK {N}:**` → `[x]` only when the task's `DONE WHEN` field is satisfied in the codebase (never on `DONE —` claim alone). Missing `DONE WHEN` on any task → FAIL (template structure broken — remediation cannot recover, routes via Failure Path). `VERIFY_VERDICT` ∈ {PASS, CONCERNS, FAIL}. PASS **and** a later group exists → group gate (§ Group gate) → `build-group-gate-{GROUP}-{VERIFY_ATTEMPT}.md` + row; `GATE_VERDICT` ∈ {PASS, FAIL, SKIPPED}. PASS + gate != FAIL → Step 6. Header `Fixable` = `true` when gap-remediate can fix any gap (each `Identified Gaps Log` line ends `— Fixable: true` / `— Fixable: false`); a test a task's `TEST EXCEPTION` field names is no gap. Every non-PASS first checks the group's verify rounds against `build.verify.maxAttempts` (`counters route --point=build.verify`; over → Failure Path). FAIL → one fixable-only Step 8 attempt (`Scope: fixable only`) when `Fixable` = `true` and a round is left, else § Decision Pause (`VERIFY_GAPS`). Group gate FAIL alone → Step 8 while a round is left, else Failure Path; never asked. Other CONCERNS → § Decision Pause (`VERIFY_LOOP`) while a round is left, else `VERIFY_GAPS`. Reads prior verify and remediate logs to know what was already verified. |
+| 6 — Execute Plan | `@bkit-build-plan-execute` | `bkit context brief --next` writes `build-brief-{GROUP}-{n}.md` — the group's open task blocks, the reds already recorded for them, the earlier tasks they depend on as context, and the plan's `Reuse Inventory` rows and `Architecture & Component Changes` entries naming the open tasks' `CREATE` / `UPDATE` / `DELETE` files (rows and entries past the 8 KB work cap are left out and counted; execute then reads the plan section) — and prints `group` (null → Step 9), `workBytes` and `workCap`. When the session prompt carries run instructions beyond naming the issue, the orchestrator writes them once to `{SESSION_DIR}/brief-note.md` and passes `--note-file`, so each brief ends with a `Deviations` section the agents apply to the tasks it names. A `build-group-start` row records the commit the group starts from, once per group. The orchestrator passes paths only; the agent reads the brief, not the plan and not `build-input-{RUN}.md`. Per group: `build-plan-execute-{GROUP}-log.md`. Attempt-numbered rows (`--attempt-of=build-plan-execute:next`), one log appended across attempts. Writes stub-first then incremental `DONE — TASK {N}` / `BLOCKED — TASK {N}` log entries via `Bash echo >>`; writes source. Per task naming `TEST FIRST` tests: tests + stubs first, then the red command from Context (`bkit tests red`, § Test-first) once per test before the task's code. Does not modify the plan — ticking is verify's job (per-task `Edit`-tick phase after impl is done is a known timeout vector; verify absorbs recovery). `bkit tasks open --plan= --group= --log=` names each task the plan leaves open and prints `handover`; verdict `HANDOVER` (turn cap near) or `handover` = true (a task with neither a `DONE` nor a `BLOCKED` line — the agent hit its turn cap) → Step 6 re-runs once for that group as a handover, not a failed attempt, its brief leaving out the `DONE` tasks; the tracker comment shows `HANDOVER`; after that the verify→remediate loop (Step 7 → Step 8, bounded by `build.verify.maxAttempts`) absorbs the recovery. Else → Step 7. |
+| 7 — Verify Plan | `@bkit-build-plan-verify` | `bkit tests green --group` first (§ Test-first) → `build-tests-green-{GROUP}-{VERIFY_ATTEMPT}.md`, read by verify and remediate; exit >= 2 → Failure Path. `bkit context diff --base=` the group's start commit → `build-diff-{GROUP}-{VERIFY_ATTEMPT}.md`, the changes since the group started. Per group, attempt-numbered: `build-plan-verify-{GROUP}-{VERIFY_ATTEMPT}.md`. Reads the group's briefs, the diff, the execute log's `DONE —` lines, `build-tests-green-{GROUP}-{VERIFY_ATTEMPT}.md` and `build-plan-current.md` (already-landed tasks). The tick is the engine's: the agent names the task numbers the codebase satisfies on the header's `Tasks` line and `bkit tasks tick --plan= --group= --tasks="<numbers>" --green=<tests-green artifact>` writes the `[x]` — a task is satisfied only when its `DONE WHEN` field is satisfied in the codebase and the green report shows no gap for it (never on a `DONE —` claim alone). `tests green` prints `verdict` and a `fixable` per gap, so the prompt keeps only its four diff reads and the already-landed `no-red` override. Missing `DONE WHEN` on any task → FAIL (template structure broken — remediation cannot recover, routes via Failure Path). `VERIFY_VERDICT` ∈ {PASS, CONCERNS, FAIL}. PASS → `bkit tests plan-check --existence=report` lists the plan's groups: exit 1 with a `matrix` / `supersession` problem → one convert retry at Step 3 sub-step 3 (still failing → Failure Path); a group numbered above `GROUP` → group gate (§ Group gate) → `build-group-gate-{GROUP}-{VERIFY_ATTEMPT}.md` + row; none → `GATE_VERDICT` = SKIPPED. `GATE_VERDICT` ∈ {PASS, FAIL, SKIPPED}; PASS + gate != FAIL → Step 6. Header `Fixable` = `true` when gap-remediate can fix any gap (each `Identified Gaps Log` line ends `— Fixable: true` / `— Fixable: false`); a test a task's `TEST EXCEPTION` field names is no gap. Every non-PASS first checks the group's verify rounds against `build.verify.maxAttempts` (`counters route --point=build.verify`; over → Failure Path). FAIL → one fixable-only Step 8 attempt (`Scope: fixable only`) when `Fixable` = `true` and a round is left, else § Decision Pause (`VERIFY_GAPS`). Group gate FAIL alone → Step 8 while a round is left, else Failure Path; never asked. Other CONCERNS → § Decision Pause (`VERIFY_LOOP`) while a round is left, else `VERIFY_GAPS`. Reads prior verify and remediate logs to know what was already verified. |
 | 8 — Remediate Gaps | `@bkit-build-plan-gaps-remediate` _(only if Step 7 CONCERNS, group gate FAIL, or the fixable-only attempt)_ | Attempt-numbered: `build-plan-gaps-remediate-{GROUP}-{VERIFY_ATTEMPT}-log.md`; reads the group's briefs for its task blocks. Stub-first artifact + flat append-only log (`DONE —` per gap fixed; `BLOCKED —` per blocked gap, appended via `Bash echo >>`); reads glob of own prior attempts to skip already-fixed gaps. Header `Fixed` = gaps with `DONE` this attempt. Resumed into this step (a `retry` decision) → the group's last verify round is read back first: `VERIFY_ATTEMPT` (`counters derive --position=current`), `VERIFY_VERDICT` and the group gate's verdict (`status route`) and `scope` (its row), the gate counted SKIPPED when that round wrote no gate log. No progress — `bkit branches scan-diff --base=HEAD~1 --code` exit 1 (nothing changed outside `docs/plans`, `docs/*.jsonl`, `.bkit/*.jsonl`: only logs and ledgers), or `Fixed` = 0 → § Decision Pause; verify never re-runs on unchanged code. Else re-run Step 7 (its next row is the next `VERIFY_ATTEMPT`). Over `build.verify.maxAttempts` → Failure Path. |
-| 9 — Holistic Verification | `@bkit-build-plan-verify` (holistic mode) | Once per run, after the last group: every group of the plan plus cross-group integration, cross-checked against every group's execute log; writes `build-plan-verify-holistic.md`. A row already recorded (challenge fix groups coming back through the loop) → Step 10 without re-running. FAIL → Failure Path. |
+| 9 — Holistic Verification | `@bkit-build-plan-verify` (holistic mode) | Once per run, after the last group: every group of the plan plus cross-group integration, cross-checked against every group's execute log; writes `build-plan-verify-holistic.md`. The agent names the satisfied task numbers per group on the header's `Tasks` line and the workflow ticks them — one `bkit tasks tick --plan= --group= --tasks="<numbers>"` call per plan group; the agent edits no plan. A row already recorded (challenge fix groups coming back through the loop) → Step 10 without re-running. FAIL → Failure Path. |
 | 10 — Build Challenge | `@bkit-build-challenge-2`, plus `@bkit-build-challenge-1` on a large change (parallel) | At most `build.challenge.maxAttempts` rounds (`CHALLENGE_MAX`, `counters max --point=build.challenge`; `challenge merge --round` refuses a round over it, exit 2 → Failure Path): `CHALLENGE_DONE` (`bkit status resume` `challengeDone`, the last round already merged) → Step 11 without reviewing again. `bkit challenge gate` fetches `origin dev` (offline → the last fetch, logged), then sizes `origin/dev...HEAD`, on every pass (`docs/plans/**` excluded): under 300 lines and 10 files is small → the security reviewer (`-2`) runs alone and the finish and merge drop challenge-1's artifact and report; else both run. Each reviewer reads the same `tmp/bkit-diff-{FID}.md`, written just before (§ Diff per reader); on `partial diff coverage` challenge-2 runs a targeted `git diff` on each omitted file touching a security-relevant path. Reviewers read the plan and the diff only. Each writes every finding as one task block under `## Findings Log` (`build-challenge-1.md`, `build-challenge-2.md`): severity, class, `Fixable`, `Location`, `DONE WHEN`, and a `TEST FIRST` for every finding. `bkit challenge merge --plan={FID}-plan.md` then appends the `CRITICAL|HIGH|MEDIUM` findings to the plan as task blocks stamped `**Round:** N`, in new last groups of <= `bkit.workflows.tasks.maxPerGroup` tasks, plus one `Derived Test Matrix` row per appended task's test when the plan carries the table; a finding at the `Location` and severity of an earlier challenge task that is still open reopens that task instead (its `**Round:**` line gains the round, e.g. `1, 2`; listed in `reopened` and `fixTasks`), one already done in an earlier round gets a new task; writes each `LOW` one as a `docs/deferrals.jsonl` row (`reason` `low-severity`), drops findings a `build-decision-*.md` item accepted, and prints the route: `none` → Step 11; `fix` (a round before the last, every task fixable) → Step 6, whose brief takes the first new group, `CHALLENGE_ROUND` + 1; `pause` (a `**Fixable:** false` task, any task in the last round, or more findings than one merge takes, which writes nothing) → § Decision Pause. A re-run on the same reports appends nothing. Exit 22 (a report not in task-block form) or exit 23 (the findings fail `plan-check`: a missing `TEST FIRST`, a test cap passed; `problems` printed) → reviewers re-run once with the reason in their Context, then Failure Path. Resumed into an open challenge Decision Pause → the limit read (`CHALLENGE_MAX`) and sub-steps 2 and 5 run again (the merge finds its tasks in the plan, writes nothing and prints the round's open tasks as `fixTasks`) → back to the pause's question. The challenge row carries the `round` it ran as (`--field=round=`); `bkit status resume` reads it back as `challengeRound` — one more once a challenge's merge wrote tasks (its next row is `build-plan-execute` or `build-decision`, not `build-run-tests`) — so the last round never fixes on its own; `challengeDone` = true once a last-round challenge row has a route row after it. |
 | 11 — Run Tests | — | `bkit tests run` runs the deepest `bkit:gate:*` the consumer declares — descending `static-unit-integration`, `static-unit` (§ Local gate scripts) — and saves the full output to `{OUTBOX}/run-tests-{TEST_ATTEMPT}.log`; `--artifact` writes a copy clamped with `debug-evidence` to `docs/plans/{YYYYMM}/logs/{FID}/run-tests-{TEST_ATTEMPT}.md`, which rides the step's commit (row `artifacts` + `clamped`), so the log survives the worktree. `.md`, not `.log`: `*.log` is gitignored. Exit 3 (no gate declared) / 4 (gate could not run, 126 / 127) → Failure Path, never a FAIL verdict. Pre-PR: no E2E (CI covers it on the resulting PR). Build does not run the live tier — the @live boundary needs a deployed URL, so it is validated post-merge by the push-only `bkit-tests-live` CI canary and reproduced on demand via `/bkit-debug`; build gates on local tiers only and records no `testsLiveSkipped` (out of build's scope by design, not skipped). A repo gating unit branch-coverage puts `test:coverage:unit` in `bkit:lane:unit`, so this gate and the CI unit lane run the same `package.json` script (one source for the threshold) and a coverage regression fails in the worktree here instead of only on the PR. `TEST_VERDICT` = PASS → Step 14. FAIL with a round left under `build.tests.maxAttempts` → § Decision Pause (`TESTS_LOOP`: Try again / Stop) → Step 12; none left → Failure Path. |
 | 12 — Diagnose Failure | `@bkit-debug-failure-diagnose` _(only if Step 11 FAIL)_ | Reads the committed Step 11 test log `docs/plans/{YYYYMM}/logs/{FID}/run-tests-{TEST_ATTEMPT}.md`. Writes `build-failure-diagnose-{TEST_ATTEMPT}.md`. Resumed into Steps 12-13 → `TEST_ATTEMPT` is read back (`counters derive --step=build-run-tests --position=current`). |
@@ -1012,8 +1012,8 @@ Every point where a run can ask the owner has two settings under `package.json`
 | Confirm Assumed Items | — | `bkit decisions pending` lists the build's `Decision: Accept (assumed)` items nobody confirmed. In a session (never headless; `ship.merge.ask` does not apply) the orchestrator asks `Confirm` / `Reject` per item; `bkit decisions apply --by=owner` writes the answer (confirm → the real acceptance, a `docs/decisions.jsonl` row). Then `pending --defer` writes one `needs-decision` deferral per item still unconfirmed, and ship carries on and merges; `bkit workflows summary` adds a `## Ship Completed with Assumed Items` heading listing them. |
 | 3 — Base Check | — | `bkit branches sync --head=<ENTRY_HEAD>` → `basePath`: A (`origin/dev` is an ancestor) → Step 5; B → Step 4. |
 | 4 — Integrate (Path B only) | `@bkit-ship-conflict-resolve` _(B2 only)_ | B1 mergeable: `bkit prs update-branch --only-if-required` (refreshes only when `dev` requires status checks) → Step 5. B2 conflicting: worktree + `@bkit-ship-conflict-resolve` + one `bkit ledgers commit --scope=full --mode=commit --stage-tracked-updates --message="chore({FID}): conflict-resolve bkit [skip ci]"` (bookkeeping plus every tracked modification, the resolved sources included) + `bkit branches push --mode=feature` (`--force-with-lease`) → Step 5. Non-mechanical: handover. `UNKNOWN` (GitHub has not computed mergeability yet, typical for a few seconds after a push): end the turn, one more `bkit prs probe --number`, then the B1 / B2 route; still `UNKNOWN` → Failure Path, no subagent. |
-| 5 — Deferred Sweep | `@bkit-ship-deferred-sweep` | `bkit branches fast-forward --onto=origin/{SHIP_BRANCH}` (fetch failed → exit 10, diverged → exit 22; both → Failure Path). No `{FID}-plan.md` → warning: every build writes one, so the branch was not built by `/bkit-build`. `@bkit-ship-deferred-sweep`: PASS → Step 6; FAIL touches `$BOOK_ROOT/.../logs/{FID}/.deferred-blocked` → Failure Path (merge never happens). First pass only — gate-refusal re-entry lands at Step 9. |
-| 6 — Update Docs & Summary | `@bkit-ship-update-docs`, then `bkit workflows summary --pr={PR_NUMBER}` | `update-docs` runs in `{WORKTREE_PATH}`, writes `ship-update-docs.md` + edits cataloged docs. Then `bkit roadmap feature --root=$WT` appends the `SHIPPED` row and folds the board — `DOCS_VERDICT` requires it appended with `status` = `SHIPPED`. The summary writes `ship-summary.md` with the PR's size from `gh pr view` (line dropped when `gh` fails). Summary FAIL → Failure Path before any merge. |
+| 5 — Deferred Sweep | `@bkit-ship-deferred-sweep` | `bkit branches fast-forward --onto=origin/{SHIP_BRANCH}` (fetch failed → exit 10, diverged → exit 22; both → Failure Path). No `{FID}-plan.md` → warning: every build writes one, so the branch was not built by `/bkit-build`. Two engine verbs settle the sweep's mechanical facts: `bkit branches scan-diff --disabled-tests --base=origin/dev` (exit 1 → its `disabled` list holds each hit's `file:line` and test name → `Blocking Deferrals` → FAIL) and `bkit ledgers triage --fid= --plan=` (applies the deferral tests, writes each `unjustified` / `TRIAGED` row, prints each row's `key`, `bucket` and test result). `@bkit-ship-deferred-sweep`: PASS → Step 6; FAIL touches `$BOOK_ROOT/.../logs/{FID}/.deferred-blocked` → Failure Path (merge never happens). First pass only — gate-refusal re-entry lands at Step 9. |
+| 6 — Update Docs & Summary | `@bkit-ship-update-docs`, then `bkit workflows summary --pr={PR_NUMBER}` | `bkit context ledger-scan --terms={FID} --source=docs/deferrals.jsonl --artifact={OUTBOX}/ship-pending-items.md` writes the deferral scan the docs agent fills `Pending Items` from — the agent reads that artifact, never `docs/deferrals.jsonl`, and writes no ledger row. `update-docs` runs in `{WORKTREE_PATH}`, writes `ship-update-docs.md` + edits cataloged docs. Then `bkit roadmap feature --root=$WT` appends the `SHIPPED` row and folds the board — `DOCS_VERDICT` requires it appended with `status` = `SHIPPED`. The summary writes `ship-summary.md` with the PR's size from `gh pr view` (line dropped when `gh` fails). Summary FAIL → Failure Path before any merge. |
 | 7 — Prune Skills | — | `bkit skills prune` in the worktree: uninstalls every non-`bkit-*` skill `.agents/skills.md` does not list (whole-name match). Warns and carries on: a missing registry skips the prune, a failed uninstall is listed in `failed`. Reconciles the union of on-disk `.agents/skills/` directories and `skills-lock.json` keys — a disk-only scan strands lock entries whose directory was removed out-of-band. |
 | 8 — Commit + Push Bookkeeping | — | Record `CODE_HEAD`; `ship-bookkeeping-push` row first; one `bkit ledgers commit --scope=pr` commit `docs({FID}): ship bookkeeping bkit [skip ci]` (docs, FID logs, ledgers, skill removals; refuses on `dev`, `main` or a detached HEAD, exit 12); `bkit branches push --mode=plain` to `{SHIP_BRANCH}` only when `outcome` = committed — an unconditional push would start a CI run on every ship. |
 | 9 — Re-validate | — | Resolve `VALIDATED_HEAD` (carry-forward above). Wait only when `VALIDATED_HEAD` != `ENTRY_HEAD` **or** `REVALIDATE_REASON` = `gate-refusal`: `bkit runs wait --head=<VALIDATED_HEAD> --until=present --dispatch-if-absent` (6 polls; `gh workflow run {bkit.testing.ciWorkflow}` only on no-run, then `VALIDATED_HEAD` = PR head) → `ship-revalidate-dispatch` row → head-anchored `--until=completed` (`SHIP_CI_WAIT_TIMEOUT_S`; budget exhausted → `ship-revalidate-timeout` row → Failure Path) → Step 10. |
@@ -1376,12 +1376,13 @@ and holds its `bkit` key as `{BKIT}` (plus `repoRoot` as `{REPO_ROOT}`, `outboxR
 | `issues` | `text`, `fetch`, `related`, `blocked-by`, `labels`, `comment` | issue text join + cut; the issue read into `{SESSION_DIR}` or `{OUTBOX}` (`fetch`: description, comments, facts); related-hit reads (`related`); open blockers (`blocked-by`); label arithmetic + board payload, written with `labels --write`; comment bodies, posted with `comment --post`. Each exits 80 or prints `done` = false when the tracker MCP must do it |
 | `runs` | `wait`, `dispatch`, `gate`, `revalidate`, `context`, `mirror`, `declared` | CI polls, CI-Dispatch Gate (`--file` / `--step` record its row, `--label` the re-trigger suffix), ship merge gate (`--pr` / `--squash-of` heads, `--snapshot`, `--record`, `--fetch` refreshes `origin/<--branch>` first), ship Step 9 re-validate, auto Step 1 context (`ref`: the issue as the dispatched workflow's argument), release-PR mirror, CI-workflow presence |
 | `challenge` | `gate`, `merge` | `gate`: fetches `origin dev` first with the default base (a failed fetch is logged and the last fetch measured), then sizes the build diff (`{base}...HEAD`, `docs/plans/**` excluded) — under 300 lines and 10 files = `small` (challenge-2 alone), else `large`; appends a `challenge-gate` status row; exit 5 = `--base` names no commit. `merge`: build challenge fold: report findings (task blocks under `## Findings Log`) deduped by `path:line` (a location needs no file extension), Decision Pause accepts dropped; earlier challenge tasks matched on `Location` + severity: open → reopened (round added to its `**Round:**` line), done in an earlier round → a new task, same round re-run → skipped; new CRITICAL / HIGH / MEDIUM appended as task blocks in new last groups (`Challenge round N findings`, each within `bkit.workflows.tasks.maxPerGroup` tasks and `bkit.workflows.tasks.maxTestsPerGroup` tests), task numbers carrying on from the plan's highest (more than 4 x `bkit.workflows.tasks.maxPerGroup` new tasks: nothing written, `overflow` = new CRITICAL / HIGH / MEDIUM count, `pause`), LOW → `low-severity` deferral rows; the written blocks checked before the write (exit 23: nothing written, `problems` printed); prints `route` = `pause` (`Fixable: false`, tasks left by the last round `bkit.workflows.build.challenge.maxAttempts` allows, or `overflow`) / `fix` / `none`, `fixTasks` (reopened, then appended), `appended`, `reopened`, `deferred` (rows written), `dropped`, `plan`, `round`; re-run appends nothing |
-| `tests` | `run`, `red`, `green` | deepest-declared `bkit:gate:*` run + saved log + verdict; build test-first: a task's red via `bkit:test:file` (row + test snapshot), a plan's or one group's audit report (§ Test-first) |
+| `tests` | `run`, `red`, `green`, `plan-check` | deepest-declared `bkit:gate:*` run + saved log + verdict; build test-first: a task's red via `bkit:test:file` (row + test snapshot), a plan's or one group's audit report (§ Test-first: `verdict`, a `fixable` per gap, each gap's ready-to-append `logLine`); a plan's group and task blocks (`plan-check`: block format, `DONE WHEN` / `TEST FIRST`, `DEPENDS ON` order, the caps, a `Reuse Inventory` `NEW` row per `CREATE` file, a `Supersession Inventory` row per `DELETE`, a `Task` on every matrix row and a row per test-bearing task; exit 1 refused) |
+| `tasks` | `tick`, `open`, `currency` | the plan tick (`tick --plan= --group= --tasks=<numbers>… [--green=<tests-green artifact>]`: `[x]` on the named group tasks, less those the green report gaps; prints `ticked`), the group's open tasks (`open --plan= --group= --log=`: numbers holding neither a `DONE` nor a `BLOCKED` line, `handover`), plan-currency matching (`currency --plan= --base= --against=`: each task whose `CREATE` / `READ` / `UPDATE` / `DELETE` path or symbol moved, with matched paths, needles and diff hunks) |
 | `status` | `path`, `route`, `resume`, `meta`, `row` | status location, routing state (`route --expect=field=value`), the step a stopped run resumes at (§ `status.jsonl` Resume rule), `workflow-meta` rows (`meta --debug-attempt=run` records the active run's number), typed audit rows the fold skips |
 | `counters` | `derive`, `rows`, `run`, `route`, `max`, `progress` | attempt counters (step rows or typed audit rows), run number, ask-point routing (`route --point=`: `--of=<step>:<pos>` derives the value; `--of=<step>,<step>:count` sums several steps; `--rows=<type>:count` adds typed audit rows; `--all-runs` counts every run; prints `max` and `ask`), `max --point=` (limit and `ask`), fix-loop progress report (`progress`, § Ask points) |
 | `decisions` | `compose`, `apply`, `pending` | decision files (§ Decision Pause): `compose` writes `build-decision-{RUN}-{K}.md` from an items JSON in the question layout (`--loop=verify|tests` adds the progress block and loop question); `apply --by=headless` takes each recommendation (assumed Accepts, unasked Fix now; exit 4 when hard blockers remain), `apply --by=owner --q= --confirm|--reject` records ship's answer (confirm appends a `docs/decisions.jsonl` row); `pending --fid= --month=` lists unconfirmed assumed Accepts, `--defer` writes one `needs-decision` deferral each |
 | `steps` | `done`, `finish`, `verdict`, `gate`, `stub` | `step-done` row + commit; the one-call step ending (§ Step endings); verdict header read; mechanical gate items (placeholders, FID, lock, artifacts, the row's `attempt` / `strategy` / `scope`; `--ref` reads `status.jsonl` as committed on a ref); seeding a versioned artifact with a PENDING header |
-| `ledgers` | `commit`, `union`, `only-bookkeeping`, `append`, `check` | path-scoped bookkeeping staging (`--stage-tracked-updates` in a commit mode commits tracked modifications too; `--path` commits one file alone), ledger union, carry-forward check, validated row append, plan close: every `**Ledger rows:**` `key` on disk (exit 11) |
+| `ledgers` | `commit`, `union`, `only-bookkeeping`, `append`, `check`, `triage` | path-scoped bookkeeping staging (`--stage-tracked-updates` in a commit mode commits tracked modifications too; `--path` commits one file alone), ledger union, carry-forward check, validated row append, plan close: every `**Ledger rows:**` `key` on disk (exit 11), deferral triage (`triage --fid= --plan=`: applies the deferral tests, writes every `unjustified` / `TRIAGED` row itself, prints each row's `key`, `bucket` and test result) |
 | `context` | `clamp`, `clamp-log`, `ledger-scan`, `diff`, `brief`, `list-blocks`, `run-block`, `fetch`, `finalise` | artifact clamping, plan ledger scan, the run's diff (`--base` = a group's start commit), a build group's brief (`build-brief-{G}-{n}.md`: the plan's why and what, where the group fits, its open task blocks, the reds already recorded for them, one-line summaries of the earlier tasks they depend on, the `Reuse Inventory` rows and `Architecture & Component Changes` entries naming the open tasks' `CREATE` / `UPDATE` / `DELETE` files within the 8 KB work cap (the rest left out and counted), the `--note-file` deviations; prints only `artifact`, `bytes`, `group`, `tasks`, `workBytes`, `workCap`; `--next` = first group with an open task), debug `context-fetch`, `bkit-cloud-bootstrap.sh` provision recipes (`list-blocks` → `provision`) |
 | `roadmap` | `fold`, `feature`, `mirror` | `docs/roadmap.md` re-render; append a phase's `kind:"feature"` row then re-render (`--strict`: exit 1 when it did not land); build / debug close: the row in the worktree, then on dev through the throwaway landing |
 | `workstreams` | `parse`, `comment` | design Step 11 advisory comment |
diff --git a/.bkit/core/prompts/bkit-build-plan-convert.md b/.bkit/core/prompts/bkit-build-plan-convert.md
index eaf5d7a85..4870b5668 100644
--- a/.bkit/core/prompts/bkit-build-plan-convert.md
+++ b/.bkit/core/prompts/bkit-build-plan-convert.md
@@ -33,6 +33,7 @@ autoCompactWindow: 300000
 - **Input dates:** Where two sections of the `*-input-*.md` file disagree, the newer one wins; older text still counts wherever nothing newer contradicts it.
 - **Same scope:** Every task traces to the input file or the existing plan; add no work they do not ask for, drop none they do.
 - **No anchor authoring:** Do not author `<!-- bkit:anchor` block; keep an existing one byte-for-byte.
+- **Matrix shape:** The plan's `Derived Test Matrix` has a `Task` column beside `Test description`, `Type` and `Target file`; each cell names the one runbook task that lands that row's test.
 - **Runbook tasks:** The runbook is groups of task blocks in build order (schema, then API, then UI). A group is `<!-- bkit:group N start -->`, `### GROUP N: {title}`, its task blocks and `<!-- bkit:group N end -->`, holding tasks and `TEST FIRST` tests within the per-group plan caps your Context names (`bkit.workflows.tasks`: tasks, and `TEST FIRST` tests in all); bigger → split the group. A task is `<!-- bkit:task N start -->`, `- [ ] **TASK N:** {title}`, one sub-bullet per field and `<!-- bkit:task N end -->`, its number unique across the plan. Fields, uppercase: `**CREATE:**` / `**READ:**` / `**UPDATE:**` / `**DELETE:**` (`` `{symbol}` in `{file}`: {what} `` or `` `{file}`: {what} ``, one line per reference), `**DEPENDS ON:**` (task numbers, same or earlier group), `**DONE WHEN:**`, `**TEST FIRST:**`, `**TEST EXCEPTION:**`; `bkit tests plan-check` refuses task-like text outside every block. `DONE WHEN` is short, testable and checkable in the codebase (a file exists, a signature matches, a test passes, a behaviour shows). A task that adds or changes logic names its own tests and fixes the tests it breaks; no task leaves its tests to a later one. Behaviour tests come only from `Derived Test Matrix` rows, and a task crossing a boundary (DB, API, model, network, migration) pairs them with non-mock tests. An audit plan has one task per in-scope finding id; tasks group findings only on one shared root cause and still name every id.
 - **TEST FIRST:** Each task carries a `**TEST FIRST:**` field after `DONE WHEN`. A behaviour change at the unit or integration tier lists one or more tests, within the per-task plan caps your Context names (tests, test files), one sub-bullet per test, each `` `{test file}` `` `` `{test name}` `` fails on {what goes wrong}: a repo-relative test file, the test name as the runner reports it or its last segments, and {what goes wrong} as the wrong behaviour a stub shows, not a literal assertion. More tests or files → split the task. No behaviour change (docs, config, pure refactor) or E2E / `@live` tier only → `n/a — {reason naming which}` on the field line.
 - **TEST EXCEPTION:** ONLY the human writes a `**TEST EXCEPTION:**` field, or the build orchestrator after the human approves it; never write one on your own judgement. It sits inside the task's block, with entries in `TEST FIRST` form each ending `— {reason}`.
diff --git a/.bkit/core/prompts/bkit-plan-generate.md b/.bkit/core/prompts/bkit-plan-generate.md
index fd2c0a9ca..80176e98f 100644
--- a/.bkit/core/prompts/bkit-plan-generate.md
+++ b/.bkit/core/prompts/bkit-plan-generate.md
@@ -38,7 +38,7 @@ autoCompactWindow: 300000
 - **Related Issues:** List tracker references from the plan input as `#N — title (state)`, not their content; they help dedupe and do not add scope. None → `None`.
 - **Example tools:** Tools and commands `docs/templates/bkit-plan.md` names are examples; write the project's own and drop what does not apply.
 - **Acceptance Scenario:** `Narrative` and `Success Criteria` come word for word from the first source that has them: the design's `## Acceptance Scenario`, else the issue's change-shape fields (`.bkit/trackers.md` § Issue shapes), else, for an audit-only plan, the user or operator impact of the in-scope findings. With no source, both read `⚠️ MISSING: no design doc, no issue Narrative and no audit report — human must provide before plan proceeds`; never invent them. `Narrative` is 1-2 sentences from the user's side: what they do and what they get back. `Success Criteria` are at most 5 measurable outcomes, not steps; an audit plan has one per in-scope finding id, from its `Expected`, with no cap. `Context & Goals` does not repeat them.
-- **Scenario detail:** `Process Sketch` restates the `Concrete Example` and `Edge Cases` as 3-7 `WHEN X → THEN Y` outcome lines, with no new examples. `Concrete Example` is one scenario: role, starting state, numbered steps, observable outcome. `Edge Cases` keep the design's Key Edge Cases, else the issue's rows, word for word, and add validation, error and boundary cases. `Derived Test Matrix` has one row per testable behaviour, each with a target file; issue rows stay word for word, and each in-scope audit behaviour has a row.
+- **Scenario detail:** `Process Sketch` restates the `Concrete Example` and `Edge Cases` as 3-7 `WHEN X → THEN Y` outcome lines, with no new examples. `Concrete Example` is one scenario: role, starting state, numbered steps, observable outcome. `Edge Cases` keep the design's Key Edge Cases, else the issue's rows, word for word, and add validation, error and boundary cases. `Derived Test Matrix` has one row per testable behaviour, each with a target file and a `Task` cell naming the one runbook task that lands its test; issue rows stay word for word, and each in-scope audit behaviour has a row.
 - **Test tiers:** A `Derived Test Matrix` row's `Type` is a tier name exactly as `docs/testing.md` writes it, picked by its tier-selection rubric: the lowest tier that exercises the behaviour, or several. Boundary rows reach the real boundary and assert a ground-truth signal, with `@live` for an external or deployed boundary.
 - **Open questions:** Each open question gives 2-3 options with their trade-offs as the lettered `Options: A) {option} — {trade-off} · B) …`, a `Recommended` naming the chosen letter and the default if unanswered; the design's options and recommendation carry forward where it already answered. Each assumption names what breaks if it is wrong.
 - **Out of Scope:** Plan work is in scope by default. An `Out of Scope` row is `Exempt` only when no `Success Criteria`, `Acceptance Scenario`, `Derived Test Matrix` row or design item (non-goals aside) needs it, and it says why and where the item belongs. Required work parked there is a `Blocking` deferral and belongs in the runbook. Each `Exempt` row has a matching `docs/deferrals.jsonl` row; an audit `LOW` finding left out is an `Exempt` row.
diff --git a/.bkit/core/prompts/bkit-plan-review-1.md b/.bkit/core/prompts/bkit-plan-review-1.md
index 812fbb3ad..6e8c90d7b 100644
--- a/.bkit/core/prompts/bkit-plan-review-1.md
+++ b/.bkit/core/prompts/bkit-plan-review-1.md
@@ -33,7 +33,7 @@ autoCompactWindow: 300000
 - **Lens discipline:** Stay within Process-defined lens; out-of-lens findings not in remit.
 - **Output header:** All lines above `<!-- verdict:end -->` MUST be machine-parseable.
 - **Acceptance Scenario:** `Narrative` and `Success Criteria` come word for word from the first source that has them: the design's `## Acceptance Scenario`, else the issue's change-shape fields (`.bkit/trackers.md` § Issue shapes), else, for an audit-only plan, the user or operator impact of the in-scope findings. With no source, both read `⚠️ MISSING: no design doc, no issue Narrative and no audit report — human must provide before plan proceeds`; never invent them. `Narrative` is 1-2 sentences from the user's side: what they do and what they get back. `Success Criteria` are at most 5 measurable outcomes, not steps; an audit plan has one per in-scope finding id, from its `Expected`, with no cap. `Context & Goals` does not repeat them.
-- **Scenario detail:** `Process Sketch` restates the `Concrete Example` and `Edge Cases` as 3-7 `WHEN X → THEN Y` outcome lines, with no new examples. `Concrete Example` is one scenario: role, starting state, numbered steps, observable outcome. `Edge Cases` keep the design's Key Edge Cases, else the issue's rows, word for word, and add validation, error and boundary cases. `Derived Test Matrix` has one row per testable behaviour, each with a target file; issue rows stay word for word, and each in-scope audit behaviour has a row.
+- **Scenario detail:** `Process Sketch` restates the `Concrete Example` and `Edge Cases` as 3-7 `WHEN X → THEN Y` outcome lines, with no new examples. `Concrete Example` is one scenario: role, starting state, numbered steps, observable outcome. `Edge Cases` keep the design's Key Edge Cases, else the issue's rows, word for word, and add validation, error and boundary cases. `Derived Test Matrix` has one row per testable behaviour, each with a target file and a `Task` cell naming the one runbook task that lands its test; issue rows stay word for word, and each in-scope audit behaviour has a row.
 - **Open questions:** Each open question gives 2-3 options with their trade-offs as the lettered `Options: A) {option} — {trade-off} · B) …`, a `Recommended` naming the chosen letter and the default if unanswered; the design's options and recommendation carry forward where it already answered. Each assumption names what breaks if it is wrong.
 - **Out of Scope:** Plan work is in scope by default. An `Out of Scope` row is `Exempt` only when no `Success Criteria`, `Acceptance Scenario`, `Derived Test Matrix` row or design item (non-goals aside) needs it, and it says why and where the item belongs. Required work parked there is a `Blocking` deferral and belongs in the runbook. Each `Exempt` row has a matching `docs/deferrals.jsonl` row; an audit `LOW` finding left out is an `Exempt` row.
 - **Suggested Scope Expansion:** List prior work overlapping the plan's surfaces as candidates (related open issues, open `docs/deferrals.jsonl` and `docs/failures.jsonl` rows, audit findings the input did not name), each with source, overlap and recommendation. Candidates are for the human, not runbook tasks; one joins the plan only through design scope or a human decision, and then leaves the list.
diff --git a/.bkit/core/prompts/bkit-plan-scope-check.md b/.bkit/core/prompts/bkit-plan-scope-check.md
index 41a3f0412..d10c6ec21 100644
--- a/.bkit/core/prompts/bkit-plan-scope-check.md
+++ b/.bkit/core/prompts/bkit-plan-scope-check.md
@@ -33,7 +33,7 @@ autoCompactWindow: 300000
 - **Lens discipline:** Stay within Process-defined lens; out-of-lens findings not in remit.
 - **Output header:** All lines above `<!-- verdict:end -->` MUST be machine-parseable.
 - **Acceptance Scenario:** `Narrative` and `Success Criteria` come word for word from the first source that has them: the design's `## Acceptance Scenario`, else the issue's change-shape fields (`.bkit/trackers.md` § Issue shapes), else, for an audit-only plan, the user or operator impact of the in-scope findings. With no source, both read `⚠️ MISSING: no design doc, no issue Narrative and no audit report — human must provide before plan proceeds`; never invent them. `Narrative` is 1-2 sentences from the user's side: what they do and what they get back. `Success Criteria` are at most 5 measurable outcomes, not steps; an audit plan has one per in-scope finding id, from its `Expected`, with no cap. `Context & Goals` does not repeat them.
-- **Scenario detail:** `Process Sketch` restates the `Concrete Example` and `Edge Cases` as 3-7 `WHEN X → THEN Y` outcome lines, with no new examples. `Concrete Example` is one scenario: role, starting state, numbered steps, observable outcome. `Edge Cases` keep the design's Key Edge Cases, else the issue's rows, word for word, and add validation, error and boundary cases. `Derived Test Matrix` has one row per testable behaviour, each with a target file; issue rows stay word for word, and each in-scope audit behaviour has a row.
+- **Scenario detail:** `Process Sketch` restates the `Concrete Example` and `Edge Cases` as 3-7 `WHEN X → THEN Y` outcome lines, with no new examples. `Concrete Example` is one scenario: role, starting state, numbered steps, observable outcome. `Edge Cases` keep the design's Key Edge Cases, else the issue's rows, word for word, and add validation, error and boundary cases. `Derived Test Matrix` has one row per testable behaviour, each with a target file and a `Task` cell naming the one runbook task that lands its test; issue rows stay word for word, and each in-scope audit behaviour has a row.
 - **Open questions:** Each open question gives 2-3 options with their trade-offs as the lettered `Options: A) {option} — {trade-off} · B) …`, a `Recommended` naming the chosen letter and the default if unanswered; the design's options and recommendation carry forward where it already answered. Each assumption names what breaks if it is wrong.
 - **Out of Scope:** Plan work is in scope by default. An `Out of Scope` row is `Exempt` only when no `Success Criteria`, `Acceptance Scenario`, `Derived Test Matrix` row or design item (non-goals aside) needs it, and it says why and where the item belongs. Required work parked there is a `Blocking` deferral and belongs in the runbook. Each `Exempt` row has a matching `docs/deferrals.jsonl` row; an audit `LOW` finding left out is an `Exempt` row.
 - **Reuse Inventory:** Each capability the plan introduces has a `Reuse Inventory` row, written before `Architecture & Component Changes`, recording the searches run (in-repo text and symbol search, framework built-ins, current practice) and a decision. The default is `EXTEND`: a `[MODIFY]` of the named file plus a runbook task. `NEW` needs one reason: (a) the searches find no candidate, (b) extending breaks the candidate's contract or callers, both named, or (c) the candidate is a `Supersession Inventory` `DELETE`. A cleaner fresh start or a messy or close-but-different candidate is no reason, and a row with no search is unsearched, not `NEW`. Each `[NEW]` file carries its row's reason. Each row names the file it decides in `File`, and each task `CREATE` file needs a `NEW` row naming it.
diff --git a/.bkit/core/prompts/bkit-plan-update.md b/.bkit/core/prompts/bkit-plan-update.md
index d9d4bc220..b1dfb3c47 100644
--- a/.bkit/core/prompts/bkit-plan-update.md
+++ b/.bkit/core/prompts/bkit-plan-update.md
@@ -33,7 +33,7 @@ autoCompactWindow: 300000
 - **Output header:** All lines above `<!-- verdict:end -->` MUST be machine-parseable.
 - **Example tools:** Tools and commands `docs/templates/bkit-plan.md` names are examples; write the project's own and drop what does not apply.
 - **Acceptance Scenario:** `Narrative` and `Success Criteria` come word for word from the first source that has them: the design's `## Acceptance Scenario`, else the issue's change-shape fields (`.bkit/trackers.md` § Issue shapes), else, for an audit-only plan, the user or operator impact of the in-scope findings. With no source, both read `⚠️ MISSING: no design doc, no issue Narrative and no audit report — human must provide before plan proceeds`; never invent them. `Narrative` is 1-2 sentences from the user's side: what they do and what they get back. `Success Criteria` are at most 5 measurable outcomes, not steps; an audit plan has one per in-scope finding id, from its `Expected`, with no cap. `Context & Goals` does not repeat them.
-- **Scenario detail:** `Process Sketch` restates the `Concrete Example` and `Edge Cases` as 3-7 `WHEN X → THEN Y` outcome lines, with no new examples. `Concrete Example` is one scenario: role, starting state, numbered steps, observable outcome. `Edge Cases` keep the design's Key Edge Cases, else the issue's rows, word for word, and add validation, error and boundary cases. `Derived Test Matrix` has one row per testable behaviour, each with a target file; issue rows stay word for word, and each in-scope audit behaviour has a row.
+- **Scenario detail:** `Process Sketch` restates the `Concrete Example` and `Edge Cases` as 3-7 `WHEN X → THEN Y` outcome lines, with no new examples. `Concrete Example` is one scenario: role, starting state, numbered steps, observable outcome. `Edge Cases` keep the design's Key Edge Cases, else the issue's rows, word for word, and add validation, error and boundary cases. `Derived Test Matrix` has one row per testable behaviour, each with a target file and a `Task` cell naming the one runbook task that lands its test; issue rows stay word for word, and each in-scope audit behaviour has a row.
 - **Test tiers:** A `Derived Test Matrix` row's `Type` is a tier name exactly as `docs/testing.md` writes it, picked by its tier-selection rubric: the lowest tier that exercises the behaviour, or several. Boundary rows reach the real boundary and assert a ground-truth signal, with `@live` for an external or deployed boundary.
 - **Open questions:** Each open question gives 2-3 options with their trade-offs as the lettered `Options: A) {option} — {trade-off} · B) …`, a `Recommended` naming the chosen letter and the default if unanswered; the design's options and recommendation carry forward where it already answered. Each assumption names what breaks if it is wrong.
 - **Out of Scope:** Plan work is in scope by default. An `Out of Scope` row is `Exempt` only when no `Success Criteria`, `Acceptance Scenario`, `Derived Test Matrix` row or design item (non-goals aside) needs it, and it says why and where the item belongs. Required work parked there is a `Blocking` deferral and belongs in the runbook. Each `Exempt` row has a matching `docs/deferrals.jsonl` row; an audit `LOW` finding left out is an `Exempt` row.
diff --git a/.bkit/friction.jsonl b/.bkit/friction.jsonl
index 0ad0c33ea..582a8a82b 100644
--- a/.bkit/friction.jsonl
+++ b/.bkit/friction.jsonl
@@ -10,3 +10,4 @@
 {"schema":3,"ts":1793002242358,"kind":"friction","key":"build-group-commit-blocked-by-dist-freshness-hook-when-plan-schedules-rebuild-late","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-execute"},"category":"tool-failure","scope":"bkit-repo","severity":"MEDIUM","summary":"build Step 6 group commit blocked by the dist freshness hook because the plan scheduled the dist rebuild after the engine source change","description":"The plan for 703 edits non-test engine source in .bkit/core/engine/commands/workflow/decisions.ts (GROUP 1, TASK 1) but schedules the mandated `pnpm build` dist rebuild as TASK 6 in GROUP 3. bkit's own pre-commit hook runs `pnpm bkit:check:dist` on any staged non-test .bkit/core/engine/**/*.ts change, so the Step 6 build-plan-execute commit failed with exit 8 (row written, commit failed) and every later step commit would fail the same way until dist is rebuilt. Recovery was the planned TASK 6 work (`pnpm build`) executed early, then `steps finish` re-run.","remediation":"Plan-convert must fold the `pnpm build` dist rebuild into the same task as any non-test engine source edit, or place the rebuild task in the earliest group that changes engine source (KN-7).","source":"orchestrator","status":"OPEN"}
 {"schema":3,"ts":1793091484984,"kind":"friction","key":"ship-bookkeeping-skip-ci-push-blocked-by-open-pr-guard","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"ship","step":"ship-bookkeeping-push"},"references":["703","https://github.com/cbartens/bkit/pull/711"],"category":"other","scope":"bkit-repo","severity":"MEDIUM","summary":"Ship Step 8's mandated bookkeeping push uses a `[skip ci]` subject, but the pre-push hook blocks any push whose HEAD carries a CI-suppressor token while the branch has an open PR, so the orchestrator must add a bare trigger commit before the push can land","description":"`bkit ledgers commit --scope=pr` commits the ship bookkeeping with the workflow-mandated subject `docs({FID}): ship bookkeeping bkit [skip ci]`. `.husky/pre-push` (CI-suppressor HEAD guard) then refuses the Step 8 `bkit branches push --mode=plain`: HEAD carries `[skip ci]` and PR #711 is open, so the PR's checks would stay vacuously green. The push failed with exit 8 and no route in the workflow; the hook's own message names the fix, so the orchestrator ran `git commit --allow-empty -m \"chore(703-standardise-question-option): re-trigger\"` and re-pushed. CI then ran at the trigger commit and the merge gate validated at the code head.","remediation":"Either drop `[skip ci]` from the ship bookkeeping subject (it lands on a feature branch, not dev, so CI must run at HEAD), or have `bkit ledgers commit --scope=pr` append a bare trigger commit when the target branch has an open PR, or give `bkit branches push` a documented re-trigger path so Step 8 is not left with an unrouted exit 8.","source":"orchestrator","status":"OPEN","confidence":0.9}
 {"schema":3,"ts":1793091484985,"kind":"friction","key":"ship-close-gate-file-path-unresolvable-in-bare-main-checkout","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"ship","step":"ship-close-workflow"},"references":["703","https://github.com/cbartens/bkit/pull/711"],"category":"tool-failure","scope":"bkit-repo","severity":"LOW","summary":"Gate 14's `bkit steps gate --file=\"{REPO_ROOT}/docs/plans/.../status.jsonl\" --ref=origin/dev` exits 3 in a bare main checkout because `readStatusRowsAt` walks up to the bare root, where `git rev-parse --show-toplevel` fails","description":"The main checkout for this repo is bare (`git rev-parse --is-bare-repository` = true); worktrees live under `.worktrees/`. After Step 14 removed the ship worktree, the Gate 14 command's `{REPO_ROOT}` path has no working tree, so `readStatusRowsAt` (`status.ts`) resolves the nearest existing parent to the bare root and `git rev-parse --show-toplevel` returns null → exit 3 (`... is not inside a git repo`). The orchestrator re-ran the same gate anchored at an existing worktree path with the same `--ref=origin/dev`, which read the file from origin/dev and passed.","remediation":"Have `readStatusRowsAt` fall back to `git rev-parse --git-common-dir` / the main-checkout resolver (as `lib.ts` already does) when `--show-toplevel` fails, so the close gate works in a bare main checkout; or have the ship workflow run Gate 14 from a worktree anchor.","source":"orchestrator","status":"OPEN","confidence":0.8}
+{"schema":3,"ts":1793136932866,"kind":"friction","key":"build-701-group6-verify-subagent-credits","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-verify"},"category":"tool-failure","scope":"bkit-repo","severity":"MEDIUM","summary":"Verify subagent blocked by provider credit limit","description":"The @bkit-build-plan-verify subagent for group 6 failed before any work with a provider error: the request needed 256000 max tokens while only 21981 credits remained. Retried once.","status":"OPEN"}
diff --git a/.bkit/instructions.md b/.bkit/instructions.md
index 74ce8e545..afe61464d 100644
--- a/.bkit/instructions.md
+++ b/.bkit/instructions.md
@@ -2823,6 +2823,10 @@ Read supplied diff fully. **If** its first line says `partial diff coverage` →
 - carriers: prompt `bkit-plan-generate`, `bkit-plan-review-1`, `bkit-plan-scope-check`, `bkit-plan-update`
 
 ```text
+**Scenario detail:** `Process Sketch` restates the `Concrete Example` and `Edge Cases` as 3-7 `WHEN X → THEN Y` outcome lines, with no new examples. `Concrete Example` is one scenario: role, starting state, numbered steps, observable outcome. `Edge Cases` keep the design's Key Edge Cases, else the issue's rows, word for word, and add validation, error and boundary cases. `Derived Test Matrix` has one row per testable behaviour, each with a target file and a `Task` cell naming the one runbook task that lands its test; issue rows stay word for word, and each in-scope audit behaviour has a row.
+```
+
+```retired
 **Scenario detail:** `Process Sketch` restates the `Concrete Example` and `Edge Cases` as 3-7 `WHEN X → THEN Y` outcome lines, with no new examples. `Concrete Example` is one scenario: role, starting state, numbered steps, observable outcome. `Edge Cases` keep the design's Key Edge Cases, else the issue's rows, word for word, and add validation, error and boundary cases. `Derived Test Matrix` has one row per testable behaviour, each with a target file; issue rows stay word for word, and each in-scope audit behaviour has a row.
 ```
 
@@ -7632,6 +7636,7 @@ Per selected skill, run `npx skills add <owner/repo>@<skill> -y` — one named s
 ```text
 **Role:** Senior engineer turning an issue or a free-form plan into a plan in task-block form.
 **Same scope:** Every task traces to the input file or the existing plan; add no work they do not ask for, drop none they do.
+**Matrix shape:** The plan's `Derived Test Matrix` has a `Task` column beside `Test description`, `Type` and `Target file`; each cell names the one runbook task that lands that row's test.
 Read `docs/templates/bkit-plan.md` § `Agent Execution Runbook` → the group and task-block shape; the rules are **Runbook tasks**, **TEST FIRST** and **TEST EXCEPTION** above.
 **If** the plan file exists → keep every section except `Agent Execution Runbook` as written and rewrite the runbook. **Else** → create the plan with `# {title} Implementation Plan`, `## Context & Goals` (the goal in 1-3 lines), `## Reuse Inventory` and `## Agent Execution Runbook`. Either way, carry over every end state and test the inputs name, tightened and never weakened, in their order.
 Split the work into tasks, each one testable change. Group them in build order: each group within the per-group plan caps your Context names (`bkit.workflows.tasks`: tasks, and `TEST FIRST` tests in all); a group's `DEPENDS ON` names only tasks in earlier groups or its own. Number tasks from 1 across the plan.
diff --git a/.bkit/pipeline.md b/.bkit/pipeline.md
index 0d0b9388c..eb0bc2236 100644
--- a/.bkit/pipeline.md
+++ b/.bkit/pipeline.md
@@ -84,7 +84,7 @@ Each phase lists subagents in execution order. "Parallel" = same-time run, merge
   │ 4. brief             (engine: the group's open tasks + plan context)
   │ 5. execute group     (producer — implement the group's tasks, reds first;
   │                       turn cap near → HANDOVER, re-run once)
-  │ 6. verify group      (critic — the group's own diff; tick only on confirmed artifacts)
+  │ 6. verify group      (critic — the group's own diff; passes satisfied task numbers, engine ticks)
   │                       ↶ producer-critic loop, capped 3 attempts;
   │                         unfixable gaps / no progress → Decision Pause (human, in session)
   │ 7. gaps-remediate    (fix verifier gaps, re-verify)
@@ -210,7 +210,7 @@ Output: PR to `dev`. Heaviest phase — most steps verify rather than produce. C
 | `bkit-build-plan-current` | Plan freshness | Judges whether changes landed since the plan was written leave it executable; findings feed execute. |
 | `bkit-build-install-skills` | Setup | Installs the skills the plan needs for this build. |
 | `bkit-build-plan-execute` | Producer | Implements one plan group's tasks from its brief, each task's tests seen failing first; iterates edit → lint/typecheck/test → edit. Near its turn cap it hands over (`HANDOVER`) and the group re-runs once. |
-| `bkit-build-plan-verify` | Critic | Verifies each task of one group against the group's own diff; ticks boxes only on confirmed artifacts. Producer-critic loop, capped at 3 attempts per group. |
+| `bkit-build-plan-verify` | Critic | Verifies each task of one group against the group's own diff; passes the satisfied task numbers, and `bkit tasks tick` sets the boxes. Producer-critic loop, capped at 3 attempts per group. |
 | `bkit-build-plan-gaps-remediate` | Gap-fixer | Fills gaps the verifier found, then re-verifies. |
 | `bkit-build-plan-verify` | Holistic critic | Second, whole-of-plan verification pass across everything built. |
 | `bkit-build-challenge-1` | Bug-hunting | Adversarial review of the full diff; writes each finding as a plan task with a test first. Forbidden from reading its sibling. Parallel. Runs only on a large change (300+ lines or 10+ files, `docs/plans/**` excluded, measured by `bkit challenge gate`); a small one runs `-2` alone. `bkit challenge merge` then appends the findings to the plan, and execute + verify fix them. |
diff --git a/.bkit/prompts.md b/.bkit/prompts.md
index eed2c3c41..e9ee5e08e 100644
--- a/.bkit/prompts.md
+++ b/.bkit/prompts.md
@@ -275,11 +275,11 @@ Canonical per-agent metadata — **single source of truth for model per agent**.
 <!-- prettier-ignore -->
 | Agent | Scope |
 | --- | --- |
-| `bkit-build-plan-convert` | Write the plan's `Agent Execution Runbook` as groups of task blocks when `bkit tests plan-check` finds none, from whatever input arrives in `build-input-{RUN}.md` (session prompt, issue text, plan as it arrived) and the plan file. Keeps every section outside the runbook and every end state and test the inputs name, tightened and never weakened. Same scope: adds no work the issue or plan does not ask for, drops none. Group and task caps: the `bkit.workflows.tasks` values the workflow passes in Context. Names only files it opened; a symbol it did not find → the file alone. A `NEW` `Reuse Inventory` row per `CREATE` file. Never writes `TEST EXCEPTION` of its own and never authors a `bkit:anchor` block; copies each `TEST EXCEPTION` an input writes word for word (a request the owner confirms at the build's Decision Pause). Where the plan and the issue disagree, the plan wins. Runs the check command the orchestrator supplies, at most 3 times. No verdict header. |
-| `bkit-build-plan-current` | Judge whether changes landed on `origin/dev` since the plan's `bkit:anchor` `baseSha` leave its tasks executable. Derives its own changed-path list from `BASE_SHA` (orchestrator-supplied via Context), intersects it against the paths each task depends on, and reads per-path diffs for the intersection only — no whole-range diff, no path outside it. Same output shape as `bkit-build-challenge-*`: header count + one append-only findings section. `Executable` tasks are not findings and are not logged; `Reword` / `Broken` are, and `Affected` = their count. PASS = no affected task; CONCERNS = any `Reword`; FAIL = any `Broken`. All three are advisory — build proceeds on every verdict and `@bkit-build-plan-execute` reads the findings as its currency input. Judges the plan against the codebase — the design doc is not an input and a superseded design is not a finding. Commit distance and elapsed time never carry the verdict. Does not revise the plan: remediation is a `/bkit-plan` re-run, never `bkit-plan-update` from build. |
+| `bkit-build-plan-convert` | Write the plan's `Agent Execution Runbook` as groups of task blocks when `bkit tests plan-check` finds none, from whatever input arrives in `build-input-{RUN}.md` (session prompt, issue text, plan as it arrived) and the plan file. Keeps every section outside the runbook and every end state and test the inputs name, tightened and never weakened. Same scope: adds no work the issue or plan does not ask for, drops none. Group and task caps: the `bkit.workflows.tasks` values the workflow passes in Context. The plan's `Derived Test Matrix` keeps a `Task` column beside `Test description`, `Type` and `Target file`, each cell naming the one runbook task that lands that row's test. Names only files it opened; a symbol it did not find → the file alone. A `NEW` `Reuse Inventory` row per `CREATE` file. Never writes `TEST EXCEPTION` of its own and never authors a `bkit:anchor` block; copies each `TEST EXCEPTION` an input writes word for word (a request the owner confirms at the build's Decision Pause). Where the plan and the issue disagree, the plan wins. Runs the check command the orchestrator supplies, at most 3 times. No verdict header. |
+| `bkit-build-plan-current` | Judge whether changes landed on `origin/dev` since the plan's `bkit:anchor` `baseSha` leave its tasks executable. Runs `bkit tasks currency --plan= --base={BASE_SHA} --against=origin/dev` — the engine records each task's in-scope paths and symbols in the plan block and prints only the tasks whose path or symbol moved in `{BASE_SHA}...origin/dev`, each with its matched paths, needles and diff hunks — and reads those hunks only, no whole-range diff, no path outside a matched set. Same output shape as `bkit-build-challenge-*`: header count + one append-only findings section. `Executable` tasks are not findings and are not logged; `Reword` / `Broken` are, and `Affected` = their count. PASS = no affected task; CONCERNS = any `Reword`; FAIL = any `Broken`. All three are advisory — build proceeds on every verdict and `@bkit-build-plan-execute` reads the findings as its currency input. Judges the plan against the codebase — the design doc is not an input and a superseded design is not a finding. Commit distance and elapsed time never carry the verdict. Does not revise the plan: remediation is a `/bkit-plan` re-run, never `bkit-plan-update` from build. |
 | `bkit-build-install-skills` | Identify and install relevant skills via `npx skills find`/`add`: quality-hurdle the source (official publisher, or 1000+ installs / 100+ stars), install one named skill per gap, report provenance. |
 | `bkit-build-plan-execute` | Execute one plan group — the task blocks in the brief `bkit context brief --next` writes; earlier tasks in the brief are context only; the brief's `Deviations` section, when present, is the owner's run instruction, applied to the tasks it names. An existing log is kept and its `Verdict` reset to `PENDING`. Verdict PASS / HANDOVER / FAIL: `HANDOVER` = turn cap near with tasks neither `DONE` nor `BLOCKED` → stop after the current task's log line; the workflow re-runs the group once with a fresh brief, not as a failed attempt. Per task naming `TEST FIRST` tests: tests + stubs first, then the red command the orchestrator supplies in Context (`bkit tests red`) once per test — never the task's code before every red is recorded; skipped for tasks logged `DONE — TASK {N}: already landed`; refused as `passed` → `BLOCKED` (never undo code to force a red); no red for tests a task's `TEST EXCEPTION` field names, never touches one; other refusals → fix test / stub and re-run; `bkit:test:file` not declared → `red not enforced`; could not run → `BLOCKED` (`.bkit/workflows.md` § Test-first). Branches on the outcome the command prints, not its exit code; honours the brief's `Reuse Inventory` rows and `Architecture` entries at the only point the decision can still be quietly discarded — `EXTEND` row modifies named artifact, never a parallel file; rows or entries the brief left out (8 KB work cap) → reads the plan section it names; reusable artifact found mid-build folds in, never forks; reads each task's `DONE WHEN` field as the completion criterion to satisfy; modify source; write stub artifact first then incremental `## Task Log` entries — one `DONE — TASK {N}:` or `BLOCKED — TASK {N}:` line per task at line start, which the next brief reads to skip finished tasks. Reads `build-plan-current.md` when present: findings are fact, plan is intent — `Reword` tasks build at the paths the report names as current, `Broken` tasks whose work already landed log `DONE — TASK {N}: already landed`, the rest build the intent against current code. Never edits the plan file; tasks absent from the findings follow plan wording verbatim. Does not tick plan checkboxes (verify owns that). Does not write `docs/deferrals.jsonl` — a blocked task is a `BLOCKED` log line for verify to catch, not a deferral. |
-| `bkit-build-plan-verify` | Verify implementation vs plan; writes Plan Verification log. `Group` mode judges one group's briefs against the group diff (changes since the group's start commit); `Holistic` mode runs once after the last group, across every group, plus integration. Ticks plan `- [ ] **TASK {N}:**` → `[x]` only when the task's `DONE WHEN` field is satisfied in the codebase and the orchestrator's test-first audit report (`bkit tests green`) shows no gap for it — `not-green` `Fixable: true`; `test-changed` / `red-mismatch` judged from the diff; `added lines only` diff read, a line added inside a planned test or its setup → `test-changed`; `red-mismatch` for a planned test renamed or moved and passing now → no gap; `no-red` on an already-landed task (plan-currency `Broken` + execute `DONE — TASK {N}: already landed`) → no gap; `delete-still-referenced` → each hit read, a different thing with the same name → no gap, else `Fixable: true`; other `no-red`, `late-red`, `exception-refused` and the plan-defect kinds `Fixable: false`; each gap logged `TASK {N}` with `— Fixable: true` / `— Fixable: false`, header `Fixable: true` when any gap is (build → fixable-only remediate, then Decision Pause); test-order gaps logged with task, test file and test name; a test a task's `TEST EXCEPTION` field names is no gap; `Late-red check` tasks → `Notes` — a `BLOCKED` log line or a deferral row never discharges a task, so unfinished work routes to `@bkit-build-plan-gaps-remediate` in-loop instead of surfacing at ship. Missing `DONE WHEN` on any task → FAIL (template structure broken; remediation cannot recover). |
+| `bkit-build-plan-verify` | Verify implementation vs plan; writes Plan Verification log. `Group` mode judges one group's briefs against the group diff (changes since the group's start commit); `Holistic` mode runs once after the last group, across every group, plus integration. Ticks are the engine's: the header's `Tasks` line names the task numbers the codebase satisfies and `bkit tasks tick --green=` writes the `[x]`; the prompt edits no plan and never ticks a box. `bkit tests green` prints `verdict` and a `fixable` per gap, so the prompt holds no kind→`Fixable` table and no verdict mapping. Its four diff reads decide only a `null` gap: `delete-still-referenced` → each hit read, a different thing with the same name → no gap, else `Fixable: true`; `test-changed` → only formatting → no gap, weakened / removed / rewritten assertions → `Fixable: false`, and on `added lines only` any line added inside a planned test or its setup → `Fixable: false`; `red-mismatch` → recorded test is the planned one renamed or moved and passes now → no gap, nor for that test's `not-green`, else `Fixable: false`; `no-red` on a task the plan-currency report classifies `Broken` with work already landed **and** the execute log records `DONE — TASK {N}: already landed` → no gap, overriding the engine's `Fixable: false`. Each gap is appended as the report's `logLine` with the decided `Fixable` in place of `null`; every other gap keeps its printed `fixable`; header `Failures` = unresolved gap count and `Fixable` = `true` when any is (build → fixable-only remediate, then Decision Pause); a test a task's `TEST EXCEPTION` field names is no gap; `Late-red check` tasks → `Notes` — a `BLOCKED` log line or a deferral row never discharges a task, so unfinished work routes to `@bkit-build-plan-gaps-remediate` in-loop instead of surfacing at ship. Missing `DONE WHEN` on any task → FAIL (template structure broken; remediation cannot recover). |
 | `bkit-build-plan-gaps-remediate` | Fix specific gaps from the group's latest verify log + group gate log failures (the tests of the groups so far; that gate MUST pass too); reads the group's briefs for its task blocks; Standard / Pivot / Final escalation. Context `Scope: fixable only` → `— Fixable: false` gaps out of scope. Header `Fixed` = gaps `DONE` this attempt (0 → build Decision Pause). A supplied decision record → the owner's `Decision:` words steer the round. No strategy records a red by undoing or swapping out code; test-order gap → `BLOCKED`; never touches a `TEST EXCEPTION` field (`.bkit/workflows.md` § Test-first). |
 | `bkit-build-challenge-1` | Adversarial review of `git diff origin/dev...HEAD` — bug-hunting lens; effort slot 1 (`high`). Parallel with `-2`. Writes each finding as one task block — `Severity`, `Class` (`mechanical\|architectural`), `Fixable`, `Location`, `DONE WHEN`, `TEST FIRST` within the per-task `bkit.workflows.tasks` caps the workflow passes in Context — that `bkit challenge merge` appends to the plan as a new last group. Never references sibling output (circular reasoning guard). |
 | `bkit-build-challenge-2` | Same as `-1` — security lens; effort slot 2 (`high` on Claude / opus — depth-sensitive; Grok on Cursor — first-party depth, same native pool as `-1`). |
@@ -303,8 +303,8 @@ Canonical per-agent metadata — **single source of truth for model per agent**.
 | Agent | Scope |
 | --- | --- |
 | `bkit-ship-conflict-resolve` | Mid-rebase mechanical conflict resolver. Invoked from `/bkit-ship` Step 4 B2 when the PR conflicts textually with `origin/dev`: rebases onto `origin/dev`, runs `bkit branches rebase` first (unions ledgers, regenerates the lockfile), then hand-resolves only what that leaves conflicted. Allowed: non-overlapping additive edits, formatting drift, dep-version supersedes, additive JSON entries. Refused: same-function edits, semantic overlaps, ambiguous intent — FAIL aborts the rebase cleanly and routes to `bkit-debug-abort-handover`. Verifies via `bkit:gate:install-static-unit-build` before PASS. |
-| `bkit-ship-deferred-sweep` | Pre-merge completeness gate. Builds the intended-delivery set from plan `Acceptance Scenario` sections + `DONE WHEN` fields and asserts each against the codebase. No plan file → `ship-input-*.md` is the plan; intended-delivery set = its requested outcomes. An unmet / unplanned gap → FAIL → Failure Path (merge never happens) ONLY on >=1 of four blocking tests, each asserted against source, never inferred from a plan sentence: behaviour (absent / stub / wrong result), safety (guard weakened, known-broken path ships), false green (this diff disabled a covering test — `bkit branches scan-diff --disabled-tests` names each hit), consumer break (shipped surface fails at runtime). Lane results are not evidence — bkit lanes are event-scoped, some push-to-`dev` only, so a pre-merge sweep reading them re-creates the unsatisfiable refusal that made gate code 16 opt-in; the gate + capstone own green. A gap passing none is `Lazy`: stale prose / comment / name, doc drift, unwritten ledger row, formatting, future-enhancement `TODO`, `DONE WHEN` met in substance not literal wording. Branch is green by this step, so aborting on a record-keeping gap leaves the work unmerged and the record unwritten. Declared deferrals (out-of-scope / future-work / non-goals across design, plan, `docs/deferrals.jsonl`, summaries) form the exempt set — never block, resurfaced verbatim in the ship summary's `Deferred & Out-of-Scope (Resurfaced)` section. Exemption is EARNED, not self-granted: each entry's `reason` (`.bkit/jsonl.md` § Deferral Reason) is adjudicated against the four tests, and one that fails moves to that same third track `Lazy (unjustified)` — same-`key` ledger append setting `reason` = `unjustified`, resurfaced as follow-up, never blocking the merge (a bounded fix is cheaper than an aborted ship). Both `Lazy` sources share one append shape; every item carries its row before the verdict is set. The intended-delivery set is those two sources and NOTHING else — every precondition, build process step and merge condition a plan states is advisory, never a gate: plan `Gate N` checkboxes, `Verification Plan` boxes and `Manual Verification` steps are build-phase process, never deliverables, and no phrasing in a plan, log or phase summary makes one blocking (the gate reaches only what the repo can be made to prove; the plan template carries the matching authoring rule). Invoked from `/bkit-ship` Step 5 (after Conflict Resolve, before Merge). |
-| `bkit-ship-update-docs` | Cross-reference changed files against every doc in `docs.md`; update stale. |
+| `bkit-ship-deferred-sweep` | Pre-merge completeness gate. Builds the intended-delivery set from plan `Acceptance Scenario` sections + `DONE WHEN` fields and asserts each against the codebase. No plan file → `ship-input-*.md` is the plan; intended-delivery set = its requested outcomes. An unmet / unplanned gap → FAIL → Failure Path (merge never happens) ONLY on >=1 of four blocking tests, each asserted against source, never inferred from a plan sentence: behaviour (absent / stub / wrong result), safety (guard weakened, known-broken path ships), false green (this diff disabled a covering test — `bkit branches scan-diff --disabled-tests` names each hit), consumer break (shipped surface fails at runtime). Lane results are not evidence — bkit lanes are event-scoped, some push-to-`dev` only, so a pre-merge sweep reading them re-creates the unsatisfiable refusal that made gate code 16 opt-in; the gate + capstone own green. A gap passing none is `Lazy`: stale prose / comment / name, doc drift, unwritten ledger row, formatting, future-enhancement `TODO`, `DONE WHEN` met in substance not literal wording. Branch is green by this step, so aborting on a record-keeping gap leaves the work unmerged and the record unwritten. Declared deferrals (out-of-scope / future-work / non-goals across design, plan, `docs/deferrals.jsonl`, summaries) form the exempt set — never block, resurfaced verbatim in the ship summary's `Deferred & Out-of-Scope (Resurfaced)` section. Exemption is EARNED, not self-granted: the prompt holds no reason test — `bkit ledgers triage --fid= --plan=` applies the deferral tests and writes every `unjustified` / `TRIAGED` row itself, printing each plan-related row's `key`, `bucket` and test result, and one that fails moves to that third track `Lazy (unjustified)`, resurfaced as follow-up, never blocking the merge (a bounded fix is cheaper than an aborted ship). Both `Lazy` sources share one append shape; every item carries its row before the verdict is set. The intended-delivery set is those two sources and NOTHING else — every precondition, build process step and merge condition a plan states is advisory, never a gate: plan `Gate N` checkboxes, `Verification Plan` boxes and `Manual Verification` steps are build-phase process, never deliverables, and no phrasing in a plan, log or phase summary makes one blocking (the gate reaches only what the repo can be made to prove; the plan template carries the matching authoring rule). Invoked from `/bkit-ship` Step 5 (after Conflict Resolve, before Merge). |
+| `bkit-ship-update-docs` | Cross-reference changed files against every doc in `docs.md`; update stale. `Pending Items` comes from the `ship-pending-items.md` deferral scan the workflow writes with `bkit context ledger-scan --terms={FID} --source=docs/deferrals.jsonl`; the agent writes no ledger row and reads no `docs/deferrals.jsonl` directly. |
 
 ## Audit (Ad-hoc)
 
diff --git a/.bkit/version b/.bkit/version
index ff43124f6..2be3b4c07 100644
--- a/.bkit/version
+++ b/.bkit/version
@@ -24,17 +24,17 @@
     ".opencode/opencode.json": "8188271e9949a4fe71808bae5d70b33c192abf7cd5645b5051803ab531c2f2ac",
     "docs/design.md": "ca5146835a83d6e22e28e990b11e2df619096482b02c6d6e2567592cff2bea41",
     ".claude/commands/bkit-auto.md": "0f0a4f496d1a5f4ba274c5f47e7b53df02c8bd399d18db2bdf2e1dcc0579f85b",
-    ".claude/commands/bkit-build.md": "e13cf2199c2cb67f68acb5b33f817f0c609badd8d9bd32eaf659ee55493395fc",
+    ".claude/commands/bkit-build.md": "6a51fb5294f3fb6b50aa624f2f45a7dd9c3fd10f0444bb264b4b057742b02255",
     ".claude/commands/bkit-debug.md": "4ecc9b4fabd1d0b637980516d151ed0e8b111a71be4922fd7c30fc9583ff03f2",
     ".claude/commands/bkit-design.md": "2e4b188c6e63869a1765bdfc5d9c5a331c6e81870e55711a846f1915f089a56d",
     ".claude/commands/bkit-plan.md": "3224b463becdea2cac33cbc4eef9ffcf381302a61e56dc57aa1c756ec9b638fb",
-    ".claude/commands/bkit-ship.md": "74ac2c7202c1bbb8d47b535942e2a1d6db3b023de268da0facf03cd01648cdbb",
+    ".claude/commands/bkit-ship.md": "d55650a976fc75c6637b1c9d69dc619cc5b234be8c753b1a1f4d5096360643d0",
     ".claude/agents/bkit-build-challenge-1.md": "7832acfe83fa8aa8d3f735cf1a76ff8d6a3ee423571071aafc832cc957433ab3",
     ".claude/agents/bkit-build-challenge-2.md": "68ff1b0db44b5186b272b9804bdf339e3094ba996a3c49aff398902bfbe31823",
     ".claude/agents/bkit-build-install-skills.md": "cf22d1043380a8946a24fedff88d9cedb00d9266773685a2024d460a248e7b6c",
     ".claude/agents/bkit-build-plan-execute.md": "23de122b2e2a0ed82292501da5f015229c4b4d00e96627d5ddf0ae20d15d08d2",
     ".claude/agents/bkit-build-plan-gaps-remediate.md": "696494f623b81e61a28d4c5007094f34edbe4240919e27c14af037b3ab08c698",
-    ".claude/agents/bkit-build-plan-verify.md": "b0bca00d46fefbe5229c7f6cc831a8f0e365ec2fe9615381792a87a7dc1ad02d",
+    ".claude/agents/bkit-build-plan-verify.md": "da0c13903a30241f2664e2c2734cb93953bb61a1fd7763b79ebe77daad87a418",
     ".claude/agents/bkit-debug-abort-handover.md": "710d68c971506b117a2e8107d71b234813c92690c0081c0823593a9b70ded4ef",
     ".claude/agents/bkit-debug-failure-diagnose.md": "3f35f23b591f2609e95b08f02a24d8712327b4d84004cf4f307282021385e04c",
     ".claude/agents/bkit-debug-failure-remediate.md": "1b105a4cd262185921e29735685684f4240665c7fe31d637f7739ccfd82c6986",
@@ -47,27 +47,27 @@
     ".claude/agents/bkit-design-review-1.md": "1b8e8009431eecafcf248736d36ac6724e6b24cd459bda455161e764780dfacd",
     ".claude/agents/bkit-design-review-2.md": "fe6a2b1c78128ac2b267470ceedfe1334bb996d26af6177250b6c9326f8d44c7",
     ".claude/agents/bkit-design-update.md": "4bc40a15349cf93d36d1d42080a8660cbde1455eadcffa529cbec5e99991a094",
-    ".claude/agents/bkit-plan-generate.md": "2eba32d4fad68f7617921a6305d271ca76c6997ad8a02e16e133ba118236567e",
-    ".claude/agents/bkit-plan-review-1.md": "f3742203484ee1af9ad80fd20ccf23b445304d45243fa8f7625070de45c9b477",
+    ".claude/agents/bkit-plan-generate.md": "03ef268c749dd5f09d943b72312f3f4210a857df65daced2c77ec79b653dfbab",
+    ".claude/agents/bkit-plan-review-1.md": "36671c5f8cb9a129ac3a5480c1d025ea1fea75e7d593a8c04d8094bdd0e0984f",
     ".claude/agents/bkit-plan-review-2.md": "6fb3da5b014fe5ceb3def3606a5be261fdd89e4934eec91db5b8b9a2cd6fa511",
-    ".claude/agents/bkit-plan-update.md": "3929387b20903eaea2e907f86196b44cfcb65c4e71e4d48f5d80feee2a08f2fa",
+    ".claude/agents/bkit-plan-update.md": "59b1d8d05514d4de522ec8988b18c6d6e5bf7815e8fc6b14cd9ac863b8596227",
     ".claude/agents/bkit-ship-conflict-resolve.md": "6f62b2d64665c1f4cee0a19d5b439869964388e9464607286fa696749e1a1566",
-    ".claude/agents/bkit-ship-deferred-sweep.md": "91c5cc150791dee0ba1534d926667f0d512bdf25a7e0909282e93eb11b2350fc",
-    ".claude/agents/bkit-ship-update-docs.md": "33eb43ffb20499d9410e2318ea7fb3d3b2a3b2222edc2e2a141386ed3c99df1b",
+    ".claude/agents/bkit-ship-deferred-sweep.md": "d09e1bdd53990cd03417f18f91738e4ea0b5ff9976b58a5f29aac26822938b67",
+    ".claude/agents/bkit-ship-update-docs.md": "c33fffa1db5ffeea212ba5105f922fb5abb552eb17c4e6a92ecd03d6e897bf88",
     ".claude/agents/bkit-utility-compress-markdown.md": "1fec2147e04b0948b07f2d2a036c03c3e20f5e7b01e5c9fda6ff3f170bb20429",
     ".claude/agents/bkit-utility-update-documentation.md": "c3ab27e9c74f234c6dee971ad1423dca38fbf495e90397ff27957236dd5f1030",
     ".cursor/commands/bkit-auto.md": "c7529c630eab40cb88df138a386f7418e3edf02275344d430697c56a1d511a2e",
-    ".cursor/commands/bkit-build.md": "7f8e6ff312e52744c038fd6c1d4a91a0e124aff65110438fee14b47dfc1586c0",
+    ".cursor/commands/bkit-build.md": "7bd388444aa76f5ed92c251cd5eb7e4f2414bd7493d9875ddfc667f034b68088",
     ".cursor/commands/bkit-debug.md": "b7311d09acbb67a1cb1a270c27913a887390e78cfdbf5f26a1041ee250238e67",
     ".cursor/commands/bkit-design.md": "3b04d7822843f31f0057baead14d6b003c2afb1508f0769344ac67139babd09b",
     ".cursor/commands/bkit-plan.md": "0d4dff08688a236e86adc1207a0220885f02e9428e79bef490c619045d4ef900",
-    ".cursor/commands/bkit-ship.md": "5c4e06d4f9b3aff894eead5637d33d0de67aa7983c3358f48a0c2ee17b07f1c6",
+    ".cursor/commands/bkit-ship.md": "5d26022cb46d2928d9c27f45f939560a687b1875138d1ef580cc04bbf81fac1b",
     ".cursor/agents/bkit-build-challenge-1.md": "2cd2876bb30561a401420ee6f7b6b76aa20368648433d42a4a3fb1b96f47e020",
     ".cursor/agents/bkit-build-challenge-2.md": "cff77dd983626782ff0677469bad82e7838c63ec478fb7523ae024a6c09989c8",
     ".cursor/agents/bkit-build-install-skills.md": "5ac7a4b470c71fd7167c7ee9326883c2997947f43727bc7825592c5dc58bca83",
     ".cursor/agents/bkit-build-plan-execute.md": "514cf2ec8e695ca6f6f08b1ea8b1fecbda423d27bb7dc71e76f59810a7d864d4",
     ".cursor/agents/bkit-build-plan-gaps-remediate.md": "2d591a063282313d22cb63a897b441f3509ad2066ae0ac62d55a032ddb62e6b8",
-    ".cursor/agents/bkit-build-plan-verify.md": "a9199bca2a52265926dd3bab79841b03f1d36d91a0f2de95c9755a88bbcbbfb0",
+    ".cursor/agents/bkit-build-plan-verify.md": "b6eb61e06ec1863da7fa86ab9aa5fc644c3a32482648236aaf01c4d82d4c3137",
     ".cursor/agents/bkit-debug-abort-handover.md": "97d2b65fb6cf1f59b7c4bbed6081dd420c5d14376ff5ef5d8e4d3382ec11f2ea",
     ".cursor/agents/bkit-debug-failure-diagnose.md": "99346d70425ebadc266482d138d39c2bc0e345fe95c585f79e368737af5cc57a",
     ".cursor/agents/bkit-debug-failure-remediate.md": "7d80c15b0c9d6430644f9f783b19f81c147e5c56cfd9dd7d4f1f471c725a47d4",
@@ -80,13 +80,13 @@
     ".cursor/agents/bkit-design-review-1.md": "5bb1c9a9441e3875f984957eff077877c9ba8527b78127dcd1a8618b4dcd095d",
     ".cursor/agents/bkit-design-review-2.md": "ccc1f05b874ce49e5ddb9c7c77cb4e086d93cff0b7c8c859aa867564ccb80be4",
     ".cursor/agents/bkit-design-update.md": "15e5f8cdd46bc231ab2488ef753ce66d8f74ec5121ed2cacbb3bd935a3f3aa06",
-    ".cursor/agents/bkit-plan-generate.md": "805ad4d0093658e43fe2427249fca88d4c51c4fbff54ca1319cf0e7356f18056",
-    ".cursor/agents/bkit-plan-review-1.md": "2a96ff295479b9647b97f187e2a1be711c95578d06c896ba01af752d66511362",
+    ".cursor/agents/bkit-plan-generate.md": "af43bb6b68c1cb99dede578ff653a38e1d06972524fde13cc848bb708772899d",
+    ".cursor/agents/bkit-plan-review-1.md": "9162d4e8762830cfd92bf6d567808cdc343ca7a6de827f284f7019e4a8fccdfa",
     ".cursor/agents/bkit-plan-review-2.md": "4a005f93de547ec4e587a00987fba5df09de87934b067fcc4446b7a2bb0f1e9d",
-    ".cursor/agents/bkit-plan-update.md": "2fb186f94b7707b9350281cdea688be3791fa57aeb79a4becb36c4002e67dcc8",
+    ".cursor/agents/bkit-plan-update.md": "f96eac134185a5deb962c153a5f38992c6b1e6f0a619c9920ccd161139d63c9b",
     ".cursor/agents/bkit-ship-conflict-resolve.md": "e3345bde6049ef741b49d3a93d0a456caae34bd0f5093802ebdd972027f892f2",
-    ".cursor/agents/bkit-ship-deferred-sweep.md": "55ab4cd23348c4f00ca4f98e7ef45f5a44d4f5e2fae11b95411ffe9097a4e39b",
-    ".cursor/agents/bkit-ship-update-docs.md": "4720a3d6b44d4bc436a3cfea882e3612f7d41c3d90f803942e8d5b6b830d10e6",
+    ".cursor/agents/bkit-ship-deferred-sweep.md": "7faf117d9ead767f1da5d979a164db7eed5e78b90b46b9817a00c8f85b849286",
+    ".cursor/agents/bkit-ship-update-docs.md": "356bbf9f7b223314cdbdac081634f3ec758563389aec1632858e26ae1f154d15",
     ".cursor/agents/bkit-utility-compress-markdown.md": "82036e97a1f9e99a8bc15586f6aec2e3bb30e04ce5ba8138fdfdedd03766d50c",
     ".cursor/agents/bkit-utility-update-documentation.md": "ed8c38e910b9f4dc3f79d6dcbc92f9bb5cc4bdd0962400e8e100ba763b64b7fa",
     ".opencode/agents/bkit-build-challenge-1.md": "6e4db2a334a838ef7a2d9ce439194cc85c09368890b7ee5ffbe197ae4cb65216",
@@ -94,7 +94,7 @@
     ".opencode/agents/bkit-build-install-skills.md": "3f612b227967bbe097a76382118a454954487b043f51f86d043d410f695eee0c",
     ".opencode/agents/bkit-build-plan-execute.md": "58d9e39126817b3c64cb8cfdc06b1c5e72f0e771f96927942cbc289c7170c787",
     ".opencode/agents/bkit-build-plan-gaps-remediate.md": "e59d3c3b2efd383cd55fb447ef86167595bee244f1734aa31d0e327a08bcfcfb",
-    ".opencode/agents/bkit-build-plan-verify.md": "bfda260d8c1f5720315cfab56545cf391e6db18636637acf7b0751fcfdafbc7a",
+    ".opencode/agents/bkit-build-plan-verify.md": "7cd7dc3e83f92d9d04a9d3bb0423677d8a786c9b825e812669b874546056b7ac",
     ".opencode/agents/bkit-debug-abort-handover.md": "b4ab4683ba872630cba2d9ced991cb954cc35a9b6944dd2cf5fc8bcd78f42c4d",
     ".opencode/agents/bkit-debug-failure-diagnose.md": "5c8de636c1625ec81916cb9bafe0f41e6c4b6f4772825f18a36576cc9ce1426f",
     ".opencode/agents/bkit-debug-failure-remediate.md": "a8e843f7a85851ee480d713e214c428b11cd73608496a6a10102ee5a1dd349bd",
@@ -107,36 +107,36 @@
     ".opencode/agents/bkit-design-review-1.md": "464b5199b8b11b44bc82d365e5be76e479c89f9e462f422b6823f000a2ea7ff1",
     ".opencode/agents/bkit-design-review-2.md": "0716df6146d2a8102d88b78eb868e3f9b264ec2815cdbcf621ed078a4fd5acfb",
     ".opencode/agents/bkit-design-update.md": "219d47076d9bafb72b75e435b71f2aeac476e5c8f0bd97fbda0a7f6397c75ddd",
-    ".opencode/agents/bkit-plan-generate.md": "67b7a029515a5c2ba382e286e69425f5bde81ddf4e1ce16fc197cf162f19ae78",
-    ".opencode/agents/bkit-plan-review-1.md": "3a0f5239a1f30eff2de4256b5401cffc14d6cb3108736bd3194ff7be245251a4",
+    ".opencode/agents/bkit-plan-generate.md": "fdb31ccdd6863ae6c1ddb0af70b0b4098e978a66833ecb400ca88f81b3ff93c0",
+    ".opencode/agents/bkit-plan-review-1.md": "6141b1b2c597eebe94416472e359e34f3856f9d227988d1a30013751a6165165",
     ".opencode/agents/bkit-plan-review-2.md": "905a914b6b0a2f28735d7c2764e7665a5b7ee35ecaac291d993b33d6278bcb22",
-    ".opencode/agents/bkit-plan-update.md": "0d52f9129546e07a5fe07a7851b2c5fa9e4ad10d6cb845d62546d1888e8a8d7a",
+    ".opencode/agents/bkit-plan-update.md": "a37105cbf25bfbd53aad2a9243445e1521e284c9a79a1fa7a32d7b474270c16e",
     ".opencode/agents/bkit-ship-conflict-resolve.md": "c4e1bac703a58fcfc5e5aa2c644b9e8bbed59c5710f1635d0ad3cafb9fed09a8",
-    ".opencode/agents/bkit-ship-deferred-sweep.md": "e11dbc511d333ff5bfad94b36cccb881bbb87dece2f506938ffabddc75f0e849",
-    ".opencode/agents/bkit-ship-update-docs.md": "3b851bd028880513b29ae4199d0cb49e8a0b8e3e53b2522e433f261dcdaea6f5",
+    ".opencode/agents/bkit-ship-deferred-sweep.md": "116525703ca17b7c7858c2d1cce2f8f55e35e3639dfc0f6530a16da103c6c8b0",
+    ".opencode/agents/bkit-ship-update-docs.md": "10adb592a33396eaa2c05a2d09cdba9e8effae2315c7bbb783a302d2eba66627",
     ".opencode/agents/bkit-utility-compress-markdown.md": "ae64115c1eb4f34a6e02d0c315127b375e4f4626cb674b0687dd2806d0c663ed",
     ".opencode/agents/bkit-utility-update-documentation.md": "9a8da1ca93e745f941f94d891ab36a0b0dc46725e05cfe19adbe21fdc1ecb02b",
     ".opencode/commands/bkit-auto.md": "5e8e9b3a2092de9fca48e787c3b60c33a4d86845a063a269fc6ee7a4dea13501",
-    ".opencode/commands/bkit-build.md": "5da5f55be593c0111c8010e2fc421c68823b627999088957f4e835370d9e0cf8",
+    ".opencode/commands/bkit-build.md": "2b2da5860ba5f08873d6146a38000177cd6706087d6cac31d6fccd0b253b63d7",
     ".opencode/commands/bkit-debug.md": "919608836851a6289527f00c992373f8e7ce9b2ef5adbfdfc9adae969c14295f",
     ".opencode/commands/bkit-design.md": "0758c67c78c8f2db89ccb9017132bfefbe39ac68ba07814a84e484a92b9d388a",
     ".opencode/commands/bkit-plan.md": "a944fd69d4dc424a3303c216bb5416c82b6e8b19542e608369fb7935489e7117",
-    ".opencode/commands/bkit-ship.md": "73e6b548224651972422194fe7c2305900f220d8558562c4ee90198744a506f1",
+    ".opencode/commands/bkit-ship.md": "dd4ec63b6efbc035ec3e04e86668d41f4835b8aac6f5ae2e73c3bba7dbca4023",
     ".claude/agents/bkit-design-spike.md": "656a3c2bd9758d1ced17e1250f0b9748f4760c8b3b1a49ab1aeed88cac0ad911",
     ".cursor/agents/bkit-design-spike.md": "9e15f3557dc959b9a14b532129fb72bcbd92f830e328e126919e3e2dbc92a256",
     ".opencode/agents/bkit-design-spike.md": "48b318899c36f05e2b1ddd9b9f7712eb55de568a7f92317ffde2ad36e0e491c2",
-    ".claude/agents/bkit-build-plan-current.md": "a741053bfb12b86ce1d6286d82c0c774c61ee58b547e0d38507f20ab46ea3c88",
-    ".cursor/agents/bkit-build-plan-current.md": "db7931900b3c7f2c5677eeee5644cec06bb96b6d3ab370375ff88914499eb91a",
-    ".opencode/agents/bkit-build-plan-current.md": "e71d101daf9a628bdfde45d7ae31ccd96a2a31a4e755c3dbdec9fdd105f48e2e",
+    ".claude/agents/bkit-build-plan-current.md": "c0b93a92824bed13dfe0e32edc6fe37d40fed2a21e0d769923e07d689710eb06",
+    ".cursor/agents/bkit-build-plan-current.md": "a6141c761a3b533159b70e53285c0f56053370d1e1f639f170d3bb859ffb005d",
+    ".opencode/agents/bkit-build-plan-current.md": "d335b61f1a2482709baaa2ffc960a1cb6fb50c7ebc14b166493e7da7ff01b463",
     "package.json": "dd9d5e365e21741ed22b080f74efb542143c19078752892c5c7a6095e26a02ec",
     "docs/noise.md": "a8d995f933f2fd93768689ed5a87a1ff47b21abbd020e35cc314c1f87ec9b995",
     ".codex/agents/bkit-build-challenge-1.toml": "18d94c6f2da3186ad95f0e724ebd786eb5e3ceb1022307e2c303ce4f0104b913",
     ".codex/agents/bkit-build-challenge-2.toml": "ff5702b800948015979bdbfd7ba1773d7c4fde328fce33463d198c7e42af7a6c",
     ".codex/agents/bkit-build-install-skills.toml": "e2cfd6b17e0cdc074f683397948dd258db7760cc4ce3964303ec13912bf5aa5b",
-    ".codex/agents/bkit-build-plan-current.toml": "b659d232f14117ca56e21b0d480f971f94f8bf1f4a23bc8133b9b92f770c944e",
+    ".codex/agents/bkit-build-plan-current.toml": "7698141a92491c10d84882a4acef40fc2c609ff8a98bc4e705029f26c604e518",
     ".codex/agents/bkit-build-plan-execute.toml": "575cbf8d7b8b332948f6c77eee574b3b3d2d5eed8a3dce1a882461c0ee48a41f",
     ".codex/agents/bkit-build-plan-gaps-remediate.toml": "60620bec11d2121b728e385377ac8643562dfe651ed3e01fa797210d260cf277",
-    ".codex/agents/bkit-build-plan-verify.toml": "70dcbfb8d3093d8c821e18e3c24bac3052cbedb96d56e9905c455817d31daa91",
+    ".codex/agents/bkit-build-plan-verify.toml": "948ac9ad2529f81e87ae41b66c81ce88106aabc21e4d644d0fa5599f8fd24bf8",
     ".codex/agents/bkit-debug-abort-handover.toml": "c517ff91e110d2c85df969c691e4f300dfd58340a84434e50702a67af9964d77",
     ".codex/agents/bkit-debug-failure-diagnose.toml": "a972802a1eed3532292570373f029585160f6594868e5018843cf8684389e22b",
     ".codex/agents/bkit-debug-failure-remediate.toml": "42ff6622dd5a24daeb041bb8e41ca5d78fbfb5c7ad307e84b871c9c8ce0df15f",
@@ -150,13 +150,13 @@
     ".codex/agents/bkit-design-review-2.toml": "7db22e246f98a2244aa76965e7968c82167394c17e38391e40bd7e51da801ba0",
     ".codex/agents/bkit-design-spike.toml": "1968c8c894a91dc4a6ecba0c794e127bc7886fdff7ea1dcef8ca605020eac473",
     ".codex/agents/bkit-design-update.toml": "c66ad4af8eff67f05066fce987e99f9e71ba996a92b73cb9d945c89c647ba310",
-    ".codex/agents/bkit-plan-generate.toml": "a5204efa79df9b49a9b2b6e56cc559c5e6a11e4ef9f007bf02ae038cc6599bcf",
-    ".codex/agents/bkit-plan-review-1.toml": "bb34bc1464dfed9d9e82c2bd90836183c0f389523aad64e65060e576047a9db6",
+    ".codex/agents/bkit-plan-generate.toml": "a46827f2e4e237118bf4626a7a68515914e75077d721fcd75be382ae3c19a0e3",
+    ".codex/agents/bkit-plan-review-1.toml": "fbf80ae9a15e670ba41e0e22d8c5f3e8113befa677bed57f4fcee99e38d36169",
     ".codex/agents/bkit-plan-review-2.toml": "0dbc09a96b017a5a2fd2fa7be4a130f12e3e1f0f0d862c0b2e5e665e1912c586",
-    ".codex/agents/bkit-plan-update.toml": "8ddebf0e7733c39a8933b1405ae21de58ff46f1c8ff99e714e27b150593893eb",
+    ".codex/agents/bkit-plan-update.toml": "f6ae8e630c7a62bf8e66550530cdf4bc3079f893970d29b3d335c8bfe01c9e1a",
     ".codex/agents/bkit-ship-conflict-resolve.toml": "cb87a8abd541c9693c9c129f0b8081e86953dd26442b7aa2f003f017bffc2d8a",
-    ".codex/agents/bkit-ship-deferred-sweep.toml": "e76b6d484eb8ed826a1c84e88692dbbeaea8244a3bec52396b6dd1d6b0b6537b",
-    ".codex/agents/bkit-ship-update-docs.toml": "b4ec1f66530d1347f5838967dce0e027cb00b58caca85b974f35f6444d10ee78",
+    ".codex/agents/bkit-ship-deferred-sweep.toml": "88a3bfcdfe29cd1c1d8f072ec91d040d21c890f71dd67e4a903882d6351c605d",
+    ".codex/agents/bkit-ship-update-docs.toml": "f88ebfc265d4cc346a635950950ddfda234f723222df646b67932d43ab047f79",
     ".codex/agents/bkit-utility-compress-markdown.toml": "d2d207968b0fa208b8f18d5b3e16dd8e0fa7513aa5904595d1cb28a6e32ed053",
     ".codex/agents/bkit-utility-update-documentation.toml": "f773ee47957dac97cb2674c3a012a3fdc589c9edf34cc9f91e6768cbb3257873",
     ".codex/hooks.json": "a6605aff7bb90e089d415c1c07083baa23424f46c21b94e535d2988e82c9aea8",
@@ -226,9 +226,9 @@
     ".bkit/install.md": "406ba71349bc016d164a2119eeb35836bb0451eae03b92f54e134df07e921c46",
     ".bkit/jsonl.md": "0c9c8b5bf4f1241e64b07898a9ed16e54d3825c40f43067608ea374a5680d549",
     ".bkit/providers.md": "e2a071238dfc7ce2cbb65454fc1989e7b59c803fe4493884960bca54e1b25724",
-    ".bkit/prompts.md": "12cfd82d3db6b0a5a40d583307b551ac3b3785d4c291323490356459b89bb1c7",
+    ".bkit/prompts.md": "69655c47a2d9f08323d8660a7d635f234c10cd69d678879e3d4846e34b16b6c1",
     ".bkit/trackers.md": "189cac5e7f50b729b2c1a3e7b7e5bee875556a227273521d904537b748e11986",
-    ".bkit/workflows.md": "50c581667bc0af88bf019a9e402869b67daf75d5d76ee46a43ee2a34f8ee5697",
+    ".bkit/workflows.md": "2360b73946e60b1bd096c0ab4dd36f4fa236bc22f66701c4612aa442b9393f56",
     ".bkit/README.md": "f736ccce1d773794e8178b9abb8ef0be8f2238e26b5bc2d45e423e39680c151e",
     ".cursor/rules/bkit-rules.mdc": "164c1bc7aed517d5eca01abac2f0c0e87a1102ceb1700eae02e340ef6f9ce797",
     ".claude/hooks/bkit-gateguard.cjs": "839a1e2c52484956a310f763df6ce749d649e4dab9ac035f52b462b4b69609d6",
@@ -247,7 +247,7 @@
     ".opencode/plugin/bkit-readguard.js": "a82c152f497645023d32959a6499e13afe2f51346957208331ff74478691f682",
     ".codex/hooks/bkit-readguard.cjs": "a4dff7174dcd17d6bb20447bfda5dcaf08696a6b022021978ce0feb1f66079df",
     ".bkit/lite.md": "22217c63e18a0fc7c7d0878bd08a144b7b4ce8c6fb13a01b26ef5ae4263db9e3",
-    ".bkit/pipeline.md": "d8209e794725b895ae142ecd958e0b8922ce47955cd00df50cc98d2c9941ed1e",
+    ".bkit/pipeline.md": "87950d880aec9448afa8d56f67904fe96c01ae46c8cbf0e7333ee5e41b02ce32",
     ".claude/agents/bkit-debug-failure-reproduce.md": "344d1285e665ae3f231e1974f4045420046314d0a021055fc62fdd78fb4a10d6",
     ".cursor/agents/bkit-debug-failure-reproduce.md": "7e86e56d2047b18c2adb749e00390bf6d4cacdd81428758e4c562c0297c0e4c8",
     ".opencode/agents/bkit-debug-failure-reproduce.md": "f8e416e8bb9825bc925d5f2f46f253a6cca5f66e789634e98001aeec9da7e145",
@@ -257,14 +257,14 @@
     ".cursor/agents/bkit-utility-update-tracker.md": "431cd453d982dfc6a6cbc239a0d5751bcf460bf95c01b90d21b0c15638b74c2c",
     ".opencode/agents/bkit-utility-update-tracker.md": "44ac8485b295a451e5f1398241051429a070c247be46d87f8852a278342910eb",
     ".codex/agents/bkit-utility-update-tracker.toml": "fcb877540ab342cbb1fd856ddaa3d8cdbe13557d424bcb185d3383e0eaa15230",
-    ".claude/agents/bkit-plan-scope-check.md": "7d803664e422ac92cb2e6ef6ed96896898747c3bc97ed66053c7f57d3a5b2335",
-    ".cursor/agents/bkit-plan-scope-check.md": "24de661501dd57c4f3771f1a005abd9b5003cca84beb052174b64fbc7a6b9751",
-    ".opencode/agents/bkit-plan-scope-check.md": "4c0cbdb72e70a4ef8c34d5243d61240d2d365e7c045c7b3e3111f794eb1aa0c0",
-    ".codex/agents/bkit-plan-scope-check.toml": "96af7b5c98348d6e2fadd73ff4751054bfae2e545b9fff43b6e9b0bae98757ea",
-    ".claude/agents/bkit-build-plan-convert.md": "d93fe0c79415e75826657778f756ba6cd0d29b3a86ccda930e4906b1f83f44bf",
-    ".cursor/agents/bkit-build-plan-convert.md": "85b09edacf552ae8ffaa9a99e24577f9cb3c95711dd4fadfef460737cabb5afc",
-    ".opencode/agents/bkit-build-plan-convert.md": "a9d4bf192714a216958d2a59b1a19744dfdce376fc199354d433af5dc2681c4a",
-    ".codex/agents/bkit-build-plan-convert.toml": "114f3d7eb538b94088ae441b3181648f41511fa94bbd090b5ade02f225b2d0cc",
+    ".claude/agents/bkit-plan-scope-check.md": "1b25fc30499617a26f4ce3a4760aee1cc0d5d581b5935b4fa6b1b26253f965ca",
+    ".cursor/agents/bkit-plan-scope-check.md": "881356f880f9ed3ca6e7c39350b478578c6992cb75db1fdb892703e2f36af86a",
+    ".opencode/agents/bkit-plan-scope-check.md": "17cb7dca3813cc8b96663cff6651b6ca988a12f054b7b415e1cc737fa7e97390",
+    ".codex/agents/bkit-plan-scope-check.toml": "720406c19a763088fabb4d8bd0d3aa2e301e40df75ad0bfc33d9a970448c5e88",
+    ".claude/agents/bkit-build-plan-convert.md": "2d886c733036ef1bf37d4e8c3755cc95187d5d8b7ca9d2c70c20a72b1c6546e8",
+    ".cursor/agents/bkit-build-plan-convert.md": "eac030ea1056ff8c30b4acaec2c70d6e23f8a2818efac79c59f0717ec610beee",
+    ".opencode/agents/bkit-build-plan-convert.md": "aa0de3a56a6cd7593d0f82dd4455f758e9a038a3ef414def3206e2ad15a68e22",
+    ".codex/agents/bkit-build-plan-convert.toml": "1fd4d891787fe6889230483d52f6dc033bdcdf4f4edcbccdaea30edfe88796a7",
     ".bkit/authoring.md": "e71d65a92799b533e9e5bbc9ee1c7deddf9cac757ccd6a3388cff5072b368895"
   },
   "claudeAllowDerived": [
diff --git a/.bkit/workflows.md b/.bkit/workflows.md
index 6a4c33818..355c43390 100644
--- a/.bkit/workflows.md
+++ b/.bkit/workflows.md
@@ -875,10 +875,10 @@ Each subsection documents command behaviour — steps, subagents, artifacts, ver
 | 3 — Branch Sync | `@bkit-build-plan-convert` _(only when the plan is missing, has no task markers, or is older than an issue comment)_ | `bkit branches sync --merge-docs`: fetch `origin/dev`; when commits touching `docs/` are behind, merge it — ledger conflicts union, other `docs/` conflicts take `dev`, a conflict outside `docs/` aborts the merge (exit 11 → Failure Path). Then `bkit tests plan-check --existence=report` on `{FID}-plan.md` → `build-plan-check.md`. No plan (exit 2), a plan with no task markers (exit 1, problem `markers`) or with a `matrix` / `supersession` problem, or a valid plan with issue comments posted after its last commit (`newerThanPlan` > 0 from Step 2's `workflows input`) → `@bkit-build-plan-convert` writes the plan in task-block form from `build-input-{RUN}.md` and the plan file, keeping any existing plan's other sections; where they disagree the newer text wins, so later comments change the plan before any code; convert copies each `TEST EXCEPTION` an input writes word for word and never writes its own; row `build-plan-convert`, then the check re-runs. Still failing → convert once more with the printed problems, then Failure Path. Any other problem (caps, a stray `TEST FIRST` line) → Failure Path before any code, naming each problem. `bkit install` / `check` / `upgrade` list each `{FID}-plan.md` with no task markers whose FID has not shipped as advisory `plan-task-markers-missing`; nothing to do by hand, this step converts it. |
 | 4 — Plan Current | `@bkit-build-plan-current` _(skipped when the mechanical trigger clears)_ | Orchestrator trigger `bkit branches anchor-read --field=baseSha --against=origin/dev` reads the plan's `bkit:anchor` (§ Anchor Block) and exits 12 — skipping the whole step, no agent, no `step-done` row, same shape as Step 5's `[skills=false]` skip — on any of: no plan, no anchor, `baseSha` unreachable in this clone, nothing landed on `origin/dev` since it. Else it prints `value` (= `BASE_SHA`) and the agent derives its own changed-path list from it, intersects that against the paths the plan's tasks depend on, and reads per-path diffs for the intersection only. `Executable` tasks are not findings; `Reword` / `Broken` are. Judges the PLAN against the codebase — the design doc is not an input, and `designPath` / `designBaseSha` have no consumer here. `CURRENT_VERDICT` is advisory on every value — PASS / CONCERNS / FAIL all → Step 5; CONCERNS / FAIL are recorded, comment-posted with `Affected`, and echoed as a console advisory, never blocking. Findings carry into Step 6 as a Read for `@bkit-build-plan-execute`; build never revises the plan, a re-run of `/bkit-plan` does. |
 | 5 — Skills | `@bkit-build-install-skills` _(skip if input contains `[skills=false]`)_ | If new skills installed → commit `chore({FID}): install skills bkit [skip ci]`. |
-| 6 — Execute Plan | `@bkit-build-plan-execute` | `bkit context brief --next` writes `build-brief-{GROUP}-{n}.md` — the group's open task blocks, the reds already recorded for them, the earlier tasks they depend on as context, and the plan's `Reuse Inventory` rows and `Architecture & Component Changes` entries naming the open tasks' `CREATE` / `UPDATE` / `DELETE` files (rows and entries past the 8 KB work cap are left out and counted; execute then reads the plan section) — and prints `group` (null → Step 9), `workBytes` and `workCap`. When the session prompt carries run instructions beyond naming the issue, the orchestrator writes them once to `{SESSION_DIR}/brief-note.md` and passes `--note-file`, so each brief ends with a `Deviations` section the agents apply to the tasks it names. A `build-group-start` row records the commit the group starts from, once per group. The orchestrator passes paths only; the agent reads the brief, not the plan and not `build-input-{RUN}.md`. Per group: `build-plan-execute-{GROUP}-log.md`. Attempt-numbered rows (`--attempt-of=build-plan-execute:next`), one log appended across attempts. Writes stub-first then incremental `DONE — TASK {N}` / `BLOCKED — TASK {N}` log entries via `Bash echo >>`; writes source. Per task naming `TEST FIRST` tests: tests + stubs first, then the red command from Context (`bkit tests red`, § Test-first) once per test before the task's code. Does not modify the plan — ticking is verify's job (per-task `Edit`-tick phase after impl is done is a known timeout vector; verify absorbs recovery). Verdict `HANDOVER` (turn cap near), or a task with neither a `DONE` nor a `BLOCKED` line (the agent hit its turn cap) → Step 6 re-runs once for that group as a handover, not a failed attempt, its brief leaving out the `DONE` tasks; the tracker comment shows `HANDOVER`; after that the verify→remediate loop (Step 7 → Step 8, bounded by `build.verify.maxAttempts`) absorbs the recovery. Else → Step 7. |
-| 7 — Verify Plan | `@bkit-build-plan-verify` | `bkit tests green --group` first (§ Test-first) → `build-tests-green-{GROUP}-{VERIFY_ATTEMPT}.md`, read by verify and remediate; exit >= 2 → Failure Path. `bkit context diff --base=` the group's start commit → `build-diff-{GROUP}-{VERIFY_ATTEMPT}.md`, the changes since the group started. Per group, attempt-numbered: `build-plan-verify-{GROUP}-{VERIFY_ATTEMPT}.md`. Reads the group's briefs, the diff, the execute log's `DONE —` lines and `build-plan-current.md` (already-landed tasks); ticks `- [ ] **TASK {N}:**` → `[x]` only when the task's `DONE WHEN` field is satisfied in the codebase (never on `DONE —` claim alone). Missing `DONE WHEN` on any task → FAIL (template structure broken — remediation cannot recover, routes via Failure Path). `VERIFY_VERDICT` ∈ {PASS, CONCERNS, FAIL}. PASS **and** a later group exists → group gate (§ Group gate) → `build-group-gate-{GROUP}-{VERIFY_ATTEMPT}.md` + row; `GATE_VERDICT` ∈ {PASS, FAIL, SKIPPED}. PASS + gate != FAIL → Step 6. Header `Fixable` = `true` when gap-remediate can fix any gap (each `Identified Gaps Log` line ends `— Fixable: true` / `— Fixable: false`); a test a task's `TEST EXCEPTION` field names is no gap. Every non-PASS first checks the group's verify rounds against `build.verify.maxAttempts` (`counters route --point=build.verify`; over → Failure Path). FAIL → one fixable-only Step 8 attempt (`Scope: fixable only`) when `Fixable` = `true` and a round is left, else § Decision Pause (`VERIFY_GAPS`). Group gate FAIL alone → Step 8 while a round is left, else Failure Path; never asked. Other CONCERNS → § Decision Pause (`VERIFY_LOOP`) while a round is left, else `VERIFY_GAPS`. Reads prior verify and remediate logs to know what was already verified. |
+| 6 — Execute Plan | `@bkit-build-plan-execute` | `bkit context brief --next` writes `build-brief-{GROUP}-{n}.md` — the group's open task blocks, the reds already recorded for them, the earlier tasks they depend on as context, and the plan's `Reuse Inventory` rows and `Architecture & Component Changes` entries naming the open tasks' `CREATE` / `UPDATE` / `DELETE` files (rows and entries past the 8 KB work cap are left out and counted; execute then reads the plan section) — and prints `group` (null → Step 9), `workBytes` and `workCap`. When the session prompt carries run instructions beyond naming the issue, the orchestrator writes them once to `{SESSION_DIR}/brief-note.md` and passes `--note-file`, so each brief ends with a `Deviations` section the agents apply to the tasks it names. A `build-group-start` row records the commit the group starts from, once per group. The orchestrator passes paths only; the agent reads the brief, not the plan and not `build-input-{RUN}.md`. Per group: `build-plan-execute-{GROUP}-log.md`. Attempt-numbered rows (`--attempt-of=build-plan-execute:next`), one log appended across attempts. Writes stub-first then incremental `DONE — TASK {N}` / `BLOCKED — TASK {N}` log entries via `Bash echo >>`; writes source. Per task naming `TEST FIRST` tests: tests + stubs first, then the red command from Context (`bkit tests red`, § Test-first) once per test before the task's code. Does not modify the plan — ticking is verify's job (per-task `Edit`-tick phase after impl is done is a known timeout vector; verify absorbs recovery). `bkit tasks open --plan= --group= --log=` names each task the plan leaves open and prints `handover`; verdict `HANDOVER` (turn cap near) or `handover` = true (a task with neither a `DONE` nor a `BLOCKED` line — the agent hit its turn cap) → Step 6 re-runs once for that group as a handover, not a failed attempt, its brief leaving out the `DONE` tasks; the tracker comment shows `HANDOVER`; after that the verify→remediate loop (Step 7 → Step 8, bounded by `build.verify.maxAttempts`) absorbs the recovery. Else → Step 7. |
+| 7 — Verify Plan | `@bkit-build-plan-verify` | `bkit tests green --group` first (§ Test-first) → `build-tests-green-{GROUP}-{VERIFY_ATTEMPT}.md`, read by verify and remediate; exit >= 2 → Failure Path. `bkit context diff --base=` the group's start commit → `build-diff-{GROUP}-{VERIFY_ATTEMPT}.md`, the changes since the group started. Per group, attempt-numbered: `build-plan-verify-{GROUP}-{VERIFY_ATTEMPT}.md`. Reads the group's briefs, the diff, the execute log's `DONE —` lines, `build-tests-green-{GROUP}-{VERIFY_ATTEMPT}.md` and `build-plan-current.md` (already-landed tasks). The tick is the engine's: the agent names the task numbers the codebase satisfies on the header's `Tasks` line and `bkit tasks tick --plan= --group= --tasks="<numbers>" --green=<tests-green artifact>` writes the `[x]` — a task is satisfied only when its `DONE WHEN` field is satisfied in the codebase and the green report shows no gap for it (never on a `DONE —` claim alone). `tests green` prints `verdict` and a `fixable` per gap, so the prompt keeps only its four diff reads and the already-landed `no-red` override. Missing `DONE WHEN` on any task → FAIL (template structure broken — remediation cannot recover, routes via Failure Path). `VERIFY_VERDICT` ∈ {PASS, CONCERNS, FAIL}. PASS → `bkit tests plan-check --existence=report` lists the plan's groups: exit 1 with a `matrix` / `supersession` problem → one convert retry at Step 3 sub-step 3 (still failing → Failure Path); a group numbered above `GROUP` → group gate (§ Group gate) → `build-group-gate-{GROUP}-{VERIFY_ATTEMPT}.md` + row; none → `GATE_VERDICT` = SKIPPED. `GATE_VERDICT` ∈ {PASS, FAIL, SKIPPED}; PASS + gate != FAIL → Step 6. Header `Fixable` = `true` when gap-remediate can fix any gap (each `Identified Gaps Log` line ends `— Fixable: true` / `— Fixable: false`); a test a task's `TEST EXCEPTION` field names is no gap. Every non-PASS first checks the group's verify rounds against `build.verify.maxAttempts` (`counters route --point=build.verify`; over → Failure Path). FAIL → one fixable-only Step 8 attempt (`Scope: fixable only`) when `Fixable` = `true` and a round is left, else § Decision Pause (`VERIFY_GAPS`). Group gate FAIL alone → Step 8 while a round is left, else Failure Path; never asked. Other CONCERNS → § Decision Pause (`VERIFY_LOOP`) while a round is left, else `VERIFY_GAPS`. Reads prior verify and remediate logs to know what was already verified. |
 | 8 — Remediate Gaps | `@bkit-build-plan-gaps-remediate` _(only if Step 7 CONCERNS, group gate FAIL, or the fixable-only attempt)_ | Attempt-numbered: `build-plan-gaps-remediate-{GROUP}-{VERIFY_ATTEMPT}-log.md`; reads the group's briefs for its task blocks. Stub-first artifact + flat append-only log (`DONE —` per gap fixed; `BLOCKED —` per blocked gap, appended via `Bash echo >>`); reads glob of own prior attempts to skip already-fixed gaps. Header `Fixed` = gaps with `DONE` this attempt. Resumed into this step (a `retry` decision) → the group's last verify round is read back first: `VERIFY_ATTEMPT` (`counters derive --position=current`), `VERIFY_VERDICT` and the group gate's verdict (`status route`) and `scope` (its row), the gate counted SKIPPED when that round wrote no gate log. No progress — `bkit branches scan-diff --base=HEAD~1 --code` exit 1 (nothing changed outside `docs/plans`, `docs/*.jsonl`, `.bkit/*.jsonl`: only logs and ledgers), or `Fixed` = 0 → § Decision Pause; verify never re-runs on unchanged code. Else re-run Step 7 (its next row is the next `VERIFY_ATTEMPT`). Over `build.verify.maxAttempts` → Failure Path. |
-| 9 — Holistic Verification | `@bkit-build-plan-verify` (holistic mode) | Once per run, after the last group: every group of the plan plus cross-group integration, cross-checked against every group's execute log; writes `build-plan-verify-holistic.md`. A row already recorded (challenge fix groups coming back through the loop) → Step 10 without re-running. FAIL → Failure Path. |
+| 9 — Holistic Verification | `@bkit-build-plan-verify` (holistic mode) | Once per run, after the last group: every group of the plan plus cross-group integration, cross-checked against every group's execute log; writes `build-plan-verify-holistic.md`. The agent names the satisfied task numbers per group on the header's `Tasks` line and the workflow ticks them — one `bkit tasks tick --plan= --group= --tasks="<numbers>"` call per plan group; the agent edits no plan. A row already recorded (challenge fix groups coming back through the loop) → Step 10 without re-running. FAIL → Failure Path. |
 | 10 — Build Challenge | `@bkit-build-challenge-2`, plus `@bkit-build-challenge-1` on a large change (parallel) | At most `build.challenge.maxAttempts` rounds (`CHALLENGE_MAX`, `counters max --point=build.challenge`; `challenge merge --round` refuses a round over it, exit 2 → Failure Path): `CHALLENGE_DONE` (`bkit status resume` `challengeDone`, the last round already merged) → Step 11 without reviewing again. `bkit challenge gate` fetches `origin dev` (offline → the last fetch, logged), then sizes `origin/dev...HEAD`, on every pass (`docs/plans/**` excluded): under 300 lines and 10 files is small → the security reviewer (`-2`) runs alone and the finish and merge drop challenge-1's artifact and report; else both run. Each reviewer reads the same `tmp/bkit-diff-{FID}.md`, written just before (§ Diff per reader); on `partial diff coverage` challenge-2 runs a targeted `git diff` on each omitted file touching a security-relevant path. Reviewers read the plan and the diff only. Each writes every finding as one task block under `## Findings Log` (`build-challenge-1.md`, `build-challenge-2.md`): severity, class, `Fixable`, `Location`, `DONE WHEN`, and a `TEST FIRST` for every finding. `bkit challenge merge --plan={FID}-plan.md` then appends the `CRITICAL|HIGH|MEDIUM` findings to the plan as task blocks stamped `**Round:** N`, in new last groups of <= `bkit.workflows.tasks.maxPerGroup` tasks, plus one `Derived Test Matrix` row per appended task's test when the plan carries the table; a finding at the `Location` and severity of an earlier challenge task that is still open reopens that task instead (its `**Round:**` line gains the round, e.g. `1, 2`; listed in `reopened` and `fixTasks`), one already done in an earlier round gets a new task; writes each `LOW` one as a `docs/deferrals.jsonl` row (`reason` `low-severity`), drops findings a `build-decision-*.md` item accepted, and prints the route: `none` → Step 11; `fix` (a round before the last, every task fixable) → Step 6, whose brief takes the first new group, `CHALLENGE_ROUND` + 1; `pause` (a `**Fixable:** false` task, any task in the last round, or more findings than one merge takes, which writes nothing) → § Decision Pause. A re-run on the same reports appends nothing. Exit 22 (a report not in task-block form) or exit 23 (the findings fail `plan-check`: a missing `TEST FIRST`, a test cap passed; `problems` printed) → reviewers re-run once with the reason in their Context, then Failure Path. Resumed into an open challenge Decision Pause → the limit read (`CHALLENGE_MAX`) and sub-steps 2 and 5 run again (the merge finds its tasks in the plan, writes nothing and prints the round's open tasks as `fixTasks`) → back to the pause's question. The challenge row carries the `round` it ran as (`--field=round=`); `bkit status resume` reads it back as `challengeRound` — one more once a challenge's merge wrote tasks (its next row is `build-plan-execute` or `build-decision`, not `build-run-tests`) — so the last round never fixes on its own; `challengeDone` = true once a last-round challenge row has a route row after it. |
 | 11 — Run Tests | — | `bkit tests run` runs the deepest `bkit:gate:*` the consumer declares — descending `static-unit-integration`, `static-unit` (§ Local gate scripts) — and saves the full output to `{OUTBOX}/run-tests-{TEST_ATTEMPT}.log`; `--artifact` writes a copy clamped with `debug-evidence` to `docs/plans/{YYYYMM}/logs/{FID}/run-tests-{TEST_ATTEMPT}.md`, which rides the step's commit (row `artifacts` + `clamped`), so the log survives the worktree. `.md`, not `.log`: `*.log` is gitignored. Exit 3 (no gate declared) / 4 (gate could not run, 126 / 127) → Failure Path, never a FAIL verdict. Pre-PR: no E2E (CI covers it on the resulting PR). Build does not run the live tier — the @live boundary needs a deployed URL, so it is validated post-merge by the push-only `bkit-tests-live` CI canary and reproduced on demand via `/bkit-debug`; build gates on local tiers only and records no `testsLiveSkipped` (out of build's scope by design, not skipped). A repo gating unit branch-coverage puts `test:coverage:unit` in `bkit:lane:unit`, so this gate and the CI unit lane run the same `package.json` script (one source for the threshold) and a coverage regression fails in the worktree here instead of only on the PR. `TEST_VERDICT` = PASS → Step 14. FAIL with a round left under `build.tests.maxAttempts` → § Decision Pause (`TESTS_LOOP`: Try again / Stop) → Step 12; none left → Failure Path. |
 | 12 — Diagnose Failure | `@bkit-debug-failure-diagnose` _(only if Step 11 FAIL)_ | Reads the committed Step 11 test log `docs/plans/{YYYYMM}/logs/{FID}/run-tests-{TEST_ATTEMPT}.md`. Writes `build-failure-diagnose-{TEST_ATTEMPT}.md`. Resumed into Steps 12-13 → `TEST_ATTEMPT` is read back (`counters derive --step=build-run-tests --position=current`). |
@@ -1012,8 +1012,8 @@ Every point where a run can ask the owner has two settings under `package.json`
 | Confirm Assumed Items | — | `bkit decisions pending` lists the build's `Decision: Accept (assumed)` items nobody confirmed. In a session (never headless; `ship.merge.ask` does not apply) the orchestrator asks `Confirm` / `Reject` per item; `bkit decisions apply --by=owner` writes the answer (confirm → the real acceptance, a `docs/decisions.jsonl` row). Then `pending --defer` writes one `needs-decision` deferral per item still unconfirmed, and ship carries on and merges; `bkit workflows summary` adds a `## Ship Completed with Assumed Items` heading listing them. |
 | 3 — Base Check | — | `bkit branches sync --head=<ENTRY_HEAD>` → `basePath`: A (`origin/dev` is an ancestor) → Step 5; B → Step 4. |
 | 4 — Integrate (Path B only) | `@bkit-ship-conflict-resolve` _(B2 only)_ | B1 mergeable: `bkit prs update-branch --only-if-required` (refreshes only when `dev` requires status checks) → Step 5. B2 conflicting: worktree + `@bkit-ship-conflict-resolve` + one `bkit ledgers commit --scope=full --mode=commit --stage-tracked-updates --message="chore({FID}): conflict-resolve bkit [skip ci]"` (bookkeeping plus every tracked modification, the resolved sources included) + `bkit branches push --mode=feature` (`--force-with-lease`) → Step 5. Non-mechanical: handover. `UNKNOWN` (GitHub has not computed mergeability yet, typical for a few seconds after a push): end the turn, one more `bkit prs probe --number`, then the B1 / B2 route; still `UNKNOWN` → Failure Path, no subagent. |
-| 5 — Deferred Sweep | `@bkit-ship-deferred-sweep` | `bkit branches fast-forward --onto=origin/{SHIP_BRANCH}` (fetch failed → exit 10, diverged → exit 22; both → Failure Path). No `{FID}-plan.md` → warning: every build writes one, so the branch was not built by `/bkit-build`. `@bkit-ship-deferred-sweep`: PASS → Step 6; FAIL touches `$BOOK_ROOT/.../logs/{FID}/.deferred-blocked` → Failure Path (merge never happens). First pass only — gate-refusal re-entry lands at Step 9. |
-| 6 — Update Docs & Summary | `@bkit-ship-update-docs`, then `bkit workflows summary --pr={PR_NUMBER}` | `update-docs` runs in `{WORKTREE_PATH}`, writes `ship-update-docs.md` + edits cataloged docs. Then `bkit roadmap feature --root=$WT` appends the `SHIPPED` row and folds the board — `DOCS_VERDICT` requires it appended with `status` = `SHIPPED`. The summary writes `ship-summary.md` with the PR's size from `gh pr view` (line dropped when `gh` fails). Summary FAIL → Failure Path before any merge. |
+| 5 — Deferred Sweep | `@bkit-ship-deferred-sweep` | `bkit branches fast-forward --onto=origin/{SHIP_BRANCH}` (fetch failed → exit 10, diverged → exit 22; both → Failure Path). No `{FID}-plan.md` → warning: every build writes one, so the branch was not built by `/bkit-build`. Two engine verbs settle the sweep's mechanical facts: `bkit branches scan-diff --disabled-tests --base=origin/dev` (exit 1 → its `disabled` list holds each hit's `file:line` and test name → `Blocking Deferrals` → FAIL) and `bkit ledgers triage --fid= --plan=` (applies the deferral tests, writes each `unjustified` / `TRIAGED` row, prints each row's `key`, `bucket` and test result). `@bkit-ship-deferred-sweep`: PASS → Step 6; FAIL touches `$BOOK_ROOT/.../logs/{FID}/.deferred-blocked` → Failure Path (merge never happens). First pass only — gate-refusal re-entry lands at Step 9. |
+| 6 — Update Docs & Summary | `@bkit-ship-update-docs`, then `bkit workflows summary --pr={PR_NUMBER}` | `bkit context ledger-scan --terms={FID} --source=docs/deferrals.jsonl --artifact={OUTBOX}/ship-pending-items.md` writes the deferral scan the docs agent fills `Pending Items` from — the agent reads that artifact, never `docs/deferrals.jsonl`, and writes no ledger row. `update-docs` runs in `{WORKTREE_PATH}`, writes `ship-update-docs.md` + edits cataloged docs. Then `bkit roadmap feature --root=$WT` appends the `SHIPPED` row and folds the board — `DOCS_VERDICT` requires it appended with `status` = `SHIPPED`. The summary writes `ship-summary.md` with the PR's size from `gh pr view` (line dropped when `gh` fails). Summary FAIL → Failure Path before any merge. |
 | 7 — Prune Skills | — | `bkit skills prune` in the worktree: uninstalls every non-`bkit-*` skill `.agents/skills.md` does not list (whole-name match). Warns and carries on: a missing registry skips the prune, a failed uninstall is listed in `failed`. Reconciles the union of on-disk `.agents/skills/` directories and `skills-lock.json` keys — a disk-only scan strands lock entries whose directory was removed out-of-band. |
 | 8 — Commit + Push Bookkeeping | — | Record `CODE_HEAD`; `ship-bookkeeping-push` row first; one `bkit ledgers commit --scope=pr` commit `docs({FID}): ship bookkeeping bkit [skip ci]` (docs, FID logs, ledgers, skill removals; refuses on `dev`, `main` or a detached HEAD, exit 12); `bkit branches push --mode=plain` to `{SHIP_BRANCH}` only when `outcome` = committed — an unconditional push would start a CI run on every ship. |
 | 9 — Re-validate | — | Resolve `VALIDATED_HEAD` (carry-forward above). Wait only when `VALIDATED_HEAD` != `ENTRY_HEAD` **or** `REVALIDATE_REASON` = `gate-refusal`: `bkit runs wait --head=<VALIDATED_HEAD> --until=present --dispatch-if-absent` (6 polls; `gh workflow run {bkit.testing.ciWorkflow}` only on no-run, then `VALIDATED_HEAD` = PR head) → `ship-revalidate-dispatch` row → head-anchored `--until=completed` (`SHIP_CI_WAIT_TIMEOUT_S`; budget exhausted → `ship-revalidate-timeout` row → Failure Path) → Step 10. |
@@ -1376,12 +1376,13 @@ and holds its `bkit` key as `{BKIT}` (plus `repoRoot` as `{REPO_ROOT}`, `outboxR
 | `issues` | `text`, `fetch`, `related`, `blocked-by`, `labels`, `comment` | issue text join + cut; the issue read into `{SESSION_DIR}` or `{OUTBOX}` (`fetch`: description, comments, facts); related-hit reads (`related`); open blockers (`blocked-by`); label arithmetic + board payload, written with `labels --write`; comment bodies, posted with `comment --post`. Each exits 80 or prints `done` = false when the tracker MCP must do it |
 | `runs` | `wait`, `dispatch`, `gate`, `revalidate`, `context`, `mirror`, `declared` | CI polls, CI-Dispatch Gate (`--file` / `--step` record its row, `--label` the re-trigger suffix), ship merge gate (`--pr` / `--squash-of` heads, `--snapshot`, `--record`, `--fetch` refreshes `origin/<--branch>` first), ship Step 9 re-validate, auto Step 1 context (`ref`: the issue as the dispatched workflow's argument), release-PR mirror, CI-workflow presence |
 | `challenge` | `gate`, `merge` | `gate`: fetches `origin dev` first with the default base (a failed fetch is logged and the last fetch measured), then sizes the build diff (`{base}...HEAD`, `docs/plans/**` excluded) — under 300 lines and 10 files = `small` (challenge-2 alone), else `large`; appends a `challenge-gate` status row; exit 5 = `--base` names no commit. `merge`: build challenge fold: report findings (task blocks under `## Findings Log`) deduped by `path:line` (a location needs no file extension), Decision Pause accepts dropped; earlier challenge tasks matched on `Location` + severity: open → reopened (round added to its `**Round:**` line), done in an earlier round → a new task, same round re-run → skipped; new CRITICAL / HIGH / MEDIUM appended as task blocks in new last groups (`Challenge round N findings`, each within `bkit.workflows.tasks.maxPerGroup` tasks and `bkit.workflows.tasks.maxTestsPerGroup` tests), task numbers carrying on from the plan's highest (more than 4 x `bkit.workflows.tasks.maxPerGroup` new tasks: nothing written, `overflow` = new CRITICAL / HIGH / MEDIUM count, `pause`), LOW → `low-severity` deferral rows; the written blocks checked before the write (exit 23: nothing written, `problems` printed); prints `route` = `pause` (`Fixable: false`, tasks left by the last round `bkit.workflows.build.challenge.maxAttempts` allows, or `overflow`) / `fix` / `none`, `fixTasks` (reopened, then appended), `appended`, `reopened`, `deferred` (rows written), `dropped`, `plan`, `round`; re-run appends nothing |
-| `tests` | `run`, `red`, `green` | deepest-declared `bkit:gate:*` run + saved log + verdict; build test-first: a task's red via `bkit:test:file` (row + test snapshot), a plan's or one group's audit report (§ Test-first) |
+| `tests` | `run`, `red`, `green`, `plan-check` | deepest-declared `bkit:gate:*` run + saved log + verdict; build test-first: a task's red via `bkit:test:file` (row + test snapshot), a plan's or one group's audit report (§ Test-first: `verdict`, a `fixable` per gap, each gap's ready-to-append `logLine`); a plan's group and task blocks (`plan-check`: block format, `DONE WHEN` / `TEST FIRST`, `DEPENDS ON` order, the caps, a `Reuse Inventory` `NEW` row per `CREATE` file, a `Supersession Inventory` row per `DELETE`, a `Task` on every matrix row and a row per test-bearing task; exit 1 refused) |
+| `tasks` | `tick`, `open`, `currency` | the plan tick (`tick --plan= --group= --tasks=<numbers>… [--green=<tests-green artifact>]`: `[x]` on the named group tasks, less those the green report gaps; prints `ticked`), the group's open tasks (`open --plan= --group= --log=`: numbers holding neither a `DONE` nor a `BLOCKED` line, `handover`), plan-currency matching (`currency --plan= --base= --against=`: each task whose `CREATE` / `READ` / `UPDATE` / `DELETE` path or symbol moved, with matched paths, needles and diff hunks) |
 | `status` | `path`, `route`, `resume`, `meta`, `row` | status location, routing state (`route --expect=field=value`), the step a stopped run resumes at (§ `status.jsonl` Resume rule), `workflow-meta` rows (`meta --debug-attempt=run` records the active run's number), typed audit rows the fold skips |
 | `counters` | `derive`, `rows`, `run`, `route`, `max`, `progress` | attempt counters (step rows or typed audit rows), run number, ask-point routing (`route --point=`: `--of=<step>:<pos>` derives the value; `--of=<step>,<step>:count` sums several steps; `--rows=<type>:count` adds typed audit rows; `--all-runs` counts every run; prints `max` and `ask`), `max --point=` (limit and `ask`), fix-loop progress report (`progress`, § Ask points) |
 | `decisions` | `compose`, `apply`, `pending` | decision files (§ Decision Pause): `compose` writes `build-decision-{RUN}-{K}.md` from an items JSON in the question layout (`--loop=verify|tests` adds the progress block and loop question); `apply --by=headless` takes each recommendation (assumed Accepts, unasked Fix now; exit 4 when hard blockers remain), `apply --by=owner --q= --confirm|--reject` records ship's answer (confirm appends a `docs/decisions.jsonl` row); `pending --fid= --month=` lists unconfirmed assumed Accepts, `--defer` writes one `needs-decision` deferral each |
 | `steps` | `done`, `finish`, `verdict`, `gate`, `stub` | `step-done` row + commit; the one-call step ending (§ Step endings); verdict header read; mechanical gate items (placeholders, FID, lock, artifacts, the row's `attempt` / `strategy` / `scope`; `--ref` reads `status.jsonl` as committed on a ref); seeding a versioned artifact with a PENDING header |
-| `ledgers` | `commit`, `union`, `only-bookkeeping`, `append`, `check` | path-scoped bookkeeping staging (`--stage-tracked-updates` in a commit mode commits tracked modifications too; `--path` commits one file alone), ledger union, carry-forward check, validated row append, plan close: every `**Ledger rows:**` `key` on disk (exit 11) |
+| `ledgers` | `commit`, `union`, `only-bookkeeping`, `append`, `check`, `triage` | path-scoped bookkeeping staging (`--stage-tracked-updates` in a commit mode commits tracked modifications too; `--path` commits one file alone), ledger union, carry-forward check, validated row append, plan close: every `**Ledger rows:**` `key` on disk (exit 11), deferral triage (`triage --fid= --plan=`: applies the deferral tests, writes every `unjustified` / `TRIAGED` row itself, prints each row's `key`, `bucket` and test result) |
 | `context` | `clamp`, `clamp-log`, `ledger-scan`, `diff`, `brief`, `list-blocks`, `run-block`, `fetch`, `finalise` | artifact clamping, plan ledger scan, the run's diff (`--base` = a group's start commit), a build group's brief (`build-brief-{G}-{n}.md`: the plan's why and what, where the group fits, its open task blocks, the reds already recorded for them, one-line summaries of the earlier tasks they depend on, the `Reuse Inventory` rows and `Architecture & Component Changes` entries naming the open tasks' `CREATE` / `UPDATE` / `DELETE` files within the 8 KB work cap (the rest left out and counted), the `--note-file` deviations; prints only `artifact`, `bytes`, `group`, `tasks`, `workBytes`, `workCap`; `--next` = first group with an open task), debug `context-fetch`, `bkit-cloud-bootstrap.sh` provision recipes (`list-blocks` → `provision`) |
 | `roadmap` | `fold`, `feature`, `mirror` | `docs/roadmap.md` re-render; append a phase's `kind:"feature"` row then re-render (`--strict`: exit 1 when it did not land); build / debug close: the row in the worktree, then on dev through the throwaway landing |
 | `workstreams` | `parse`, `comment` | design Step 11 advisory comment |
diff --git a/.claude/agents/bkit-build-plan-convert.md b/.claude/agents/bkit-build-plan-convert.md
index 66a79660d..74dab3746 100644
--- a/.claude/agents/bkit-build-plan-convert.md
+++ b/.claude/agents/bkit-build-plan-convert.md
@@ -34,6 +34,7 @@ autoCompactWindow: 300000
 - **Input dates:** Where two sections of the `*-input-*.md` file disagree, the newer one wins; older text still counts wherever nothing newer contradicts it.
 - **Same scope:** Every task traces to the input file or the existing plan; add no work they do not ask for, drop none they do.
 - **No anchor authoring:** Do not author `<!-- bkit:anchor` block; keep an existing one byte-for-byte.
+- **Matrix shape:** The plan's `Derived Test Matrix` has a `Task` column beside `Test description`, `Type` and `Target file`; each cell names the one runbook task that lands that row's test.
 - **Runbook tasks:** The runbook is groups of task blocks in build order (schema, then API, then UI). A group is `<!-- bkit:group N start -->`, `### GROUP N: {title}`, its task blocks and `<!-- bkit:group N end -->`, holding tasks and `TEST FIRST` tests within the per-group plan caps your Context names (`bkit.workflows.tasks`: tasks, and `TEST FIRST` tests in all); bigger → split the group. A task is `<!-- bkit:task N start -->`, `- [ ] **TASK N:** {title}`, one sub-bullet per field and `<!-- bkit:task N end -->`, its number unique across the plan. Fields, uppercase: `**CREATE:**` / `**READ:**` / `**UPDATE:**` / `**DELETE:**` (`` `{symbol}` in `{file}`: {what} `` or `` `{file}`: {what} ``, one line per reference), `**DEPENDS ON:**` (task numbers, same or earlier group), `**DONE WHEN:**`, `**TEST FIRST:**`, `**TEST EXCEPTION:**`; `bkit tests plan-check` refuses task-like text outside every block. `DONE WHEN` is short, testable and checkable in the codebase (a file exists, a signature matches, a test passes, a behaviour shows). A task that adds or changes logic names its own tests and fixes the tests it breaks; no task leaves its tests to a later one. Behaviour tests come only from `Derived Test Matrix` rows, and a task crossing a boundary (DB, API, model, network, migration) pairs them with non-mock tests. An audit plan has one task per in-scope finding id; tasks group findings only on one shared root cause and still name every id.
 - **TEST FIRST:** Each task carries a `**TEST FIRST:**` field after `DONE WHEN`. A behaviour change at the unit or integration tier lists one or more tests, within the per-task plan caps your Context names (tests, test files), one sub-bullet per test, each `` `{test file}` `` `` `{test name}` `` fails on {what goes wrong}: a repo-relative test file, the test name as the runner reports it or its last segments, and {what goes wrong} as the wrong behaviour a stub shows, not a literal assertion. More tests or files → split the task. No behaviour change (docs, config, pure refactor) or E2E / `@live` tier only → `n/a — {reason naming which}` on the field line.
 - **TEST EXCEPTION:** ONLY the human writes a `**TEST EXCEPTION:**` field, or the build orchestrator after the human approves it; never write one on your own judgement. It sits inside the task's block, with entries in `TEST FIRST` form each ending `— {reason}`.
diff --git a/.claude/agents/bkit-build-plan-current.md b/.claude/agents/bkit-build-plan-current.md
index b25c4046e..523762bb4 100644
--- a/.claude/agents/bkit-build-plan-current.md
+++ b/.claude/agents/bkit-build-plan-current.md
@@ -56,11 +56,11 @@ autoCompactWindow: 300000
 2. Re-read all supplied inputs once at session start; do not trust session memory.
 3. Read `.agents/docs.md` → load docs for workflow / step / task; skip missing.
 4. Update **Create** after each affected task — append log at EOF via Bash `echo {log entry} >> {output}`; heredoc for multi-line. **If** any task `Broken` → set `Verdict` = `FAIL` via `Edit` immediately; do not defer to final pass.
-5. Per plan task block, record paths, symbols, and commands its `CREATE` / `READ` / `UPDATE` / `DELETE` and `DONE WHEN` fields depend on → in-scope set.
-6. Run `git diff --name-only {BASE_SHA}..origin/dev` → changed-path list. Task matches on any in-scope path in that list. For each task with no path match run `git diff {BASE_SHA}..origin/dev -S{needle} --name-only` per in-scope symbol and command; non-empty output → matched on that needle:
-   - **If** no tasks match → no affected tasks; do not read any diff.
-   - **Else** → continue with matched tasks only.
-7. Per matched task, run `git diff {BASE_SHA}..origin/dev -- {path}` for its matched paths and read it; needle match → paths named by that needle `-S` output; never diff whole range; never read paths outside match set.
+5. Per plan task block, record the paths, symbols, and commands its `CREATE` / `READ` / `UPDATE` / `DELETE` and `DONE WHEN` fields depend on → in-scope set.
+6. Run `bkit tasks currency --plan={plan file} --base={BASE_SHA} --against=origin/dev` → each task whose in-scope path or symbol moved in `{BASE_SHA}...origin/dev`, with its matched paths, needles and diff hunks:
+   - **If** no task is printed → no affected tasks; do not read any diff.
+   - **Else** → continue with the printed tasks only.
+7. Read the diff hunks `currency` printed for each matched task; never read a path outside its matched set.
 8. Per matched task, decide against diff — `Executable` tasks are not findings and are not logged:
    - `Executable` = landed changes leave task approach intact.
    - `Reword` = task approach holds; paths, symbols, or commands task names have moved and wording no longer matches.
diff --git a/.claude/agents/bkit-build-plan-verify.md b/.claude/agents/bkit-build-plan-verify.md
index daacb0f53..2e2da0a3f 100644
--- a/.claude/agents/bkit-build-plan-verify.md
+++ b/.claude/agents/bkit-build-plan-verify.md
@@ -29,7 +29,7 @@ autoCompactWindow: 300000
 **Contract:** The terms between this agent and whoever runs it.
 
 - **Read / Update / Create:** Use any appended Read / Update / Create as exact I/O paths.
-- **Mandate:** Verify plan implementation; change plan only to mark tasks done; do not build, install, or write code.
+- **Mandate:** Verify plan implementation and pass the task numbers you judged satisfied on the header's `Tasks` line; never edit the plan; do not build, install, or write code.
 - **No commits:** Do not run `git commit` / `git add` / `git push` (caller does).
 - **Output header:** All lines above `<!-- verdict:end -->` MUST be machine-parseable.
 - **Runbook tasks:** The runbook is groups of task blocks in build order (schema, then API, then UI). A group is `<!-- bkit:group N start -->`, `### GROUP N: {title}`, its task blocks and `<!-- bkit:group N end -->`, holding tasks and `TEST FIRST` tests within the per-group plan caps your Context names (`bkit.workflows.tasks`: tasks, and `TEST FIRST` tests in all); bigger → split the group. A task is `<!-- bkit:task N start -->`, `- [ ] **TASK N:** {title}`, one sub-bullet per field and `<!-- bkit:task N end -->`, its number unique across the plan. Fields, uppercase: `**CREATE:**` / `**READ:**` / `**UPDATE:**` / `**DELETE:**` (`` `{symbol}` in `{file}`: {what} `` or `` `{file}`: {what} ``, one line per reference), `**DEPENDS ON:**` (task numbers, same or earlier group), `**DONE WHEN:**`, `**TEST FIRST:**`, `**TEST EXCEPTION:**`; `bkit tests plan-check` refuses task-like text outside every block. `DONE WHEN` is short, testable and checkable in the codebase (a file exists, a signature matches, a test passes, a behaviour shows). A task that adds or changes logic names its own tests and fixes the tests it breaks; no task leaves its tests to a later one. Behaviour tests come only from `Derived Test Matrix` rows, and a task crossing a boundary (DB, API, model, network, migration) pairs them with non-mock tests. An audit plan has one task per in-scope finding id; tasks group findings only on one shared root cause and still name every id.
@@ -61,26 +61,21 @@ autoCompactWindow: 300000
 1. Initialise **Create** output stub with `PENDING` placeholders.
 2. Re-read all supplied inputs once at session start; do not trust session memory.
 3. Read `.agents/docs.md` → load docs for workflow / step / task; skip missing.
-4. Update **Create** — replace each `PENDING` via `Edit` as content becomes available. Per gap — append log at EOF via Bash `echo {log entry} >> {output}`; heredoc for multi-line; each entry ends `— Fixable: true` or `— Fixable: false` (by gap-remediate). **If** any gap `Fixable: false` → set `Verdict` = `FAIL` via `Edit` immediately; do not defer to final pass.
+4. Update **Create** — replace each `PENDING` via `Edit` as content becomes available. Per gap — append log at EOF via Bash `echo {log entry} >> {output}`; heredoc for multi-line; `{log entry}` is the gap's report `logLine` with your decided `Fixable: true` / `Fixable: false` in place of the engine's `Fixable: null`; each entry ends `— Fixable: true` or `— Fixable: false` (by gap-remediate). **If** any gap `Fixable: false` → set `Verdict` = `FAIL` via `Edit` immediately; do not defer to final pass.
 5. Determine `Mode` from input Context (`Group` or `Holistic`).
-6. **If** `Group` → the supplied briefs' task blocks are the work; judge them against the supplied group diff (the changes since the group started), not the whole branch; a brief's `Deviations` section holds the owner's run instructions → judge the tasks it names as it directs. Every task field and gate maps to real codebase changes. Find missing components, skipped steps, unimplemented edge cases. Cross-reference the tasks vs the execute log's `DONE — TASK {N}` lines; a `DONE` line is a claim to check, never proof.
-7. **If** `Holistic` → same task / gate / `DONE` log cross-reference across every group of the plan, plus integration: groups' components work together? API contracts match? Shared state consistent? Cross-domain boundaries respected? Run `pnpm bkit:gate:static-unit`.
-8. **If** test-first audit report supplied (`Enforced` / `Gaps` header) → map its gaps per task:
-   - `not-green` → `Fixable: true`.
+6. **If** `Group` → the supplied briefs' task blocks are the work; judge them against the supplied group diff (the changes since the group started), not the whole branch; a brief's `Deviations` section holds the owner's run instructions → judge the tasks it names as it directs. Every task field and gate maps to real codebase changes. Find missing components, skipped steps, unimplemented edge cases.
+7. **If** `Holistic` → the same task and gate check across every group of the plan, plus integration: groups' components work together? API contracts match? Shared state consistent? Cross-domain boundaries respected? Run `pnpm bkit:gate:static-unit`.
+8. **If** test-first audit report supplied (`Enforced` / `Verdict` / `Gaps` header) → decide each gap: its `fixable` stands unless `null`, and a `null` one you decide from the diff it names:
    - `delete-still-referenced` → read each hit; a different thing with the same name → no gap; else `Fixable: true`.
    - `test-changed` → read its diff; only formatting → no gap; weakened, removed or rewritten assertions → `Fixable: false`.
-   - Row `Changed since red` = `added lines only` → read its diff; any line added inside a planned test or in setup it runs (`beforeEach`, fixture, mock) → `test-changed` gap, `Fixable: false`; added lines only outside every planned test → no gap.
+   - `test-changed` on a row whose `Changed since red` = `added lines only` → read its diff; any line added inside a planned test or in setup it runs (`beforeEach`, fixture, mock) → `Fixable: false`; added lines only outside every planned test → no gap.
    - `red-mismatch` → recorded test is the planned one renamed or moved **and** passes now → no gap, nor for that test's `not-green`; else `Fixable: false`.
-   - `no-red` on a task the plan-currency report classifies `Broken` with work already landed **and** the execute log records `DONE — TASK {N}: already landed` → no gap.
-   - `no-red`, `late-red`, `no-test-first`, `test-first-malformed`, `test-first-unread`, `red-evidence-missing`, `exception-refused` → `Fixable: false`.
-   - Test-order gap (`no-red`, `late-red`, `red-mismatch`, `red-evidence-missing`, `test-changed`) → log as ``TASK {N}: `{test file}` `{test name}` — {kind} — Fixable: false``.
+   - `no-red` on a task the plan-currency report classifies `Broken` with work already landed **and** the execute log records `DONE — TASK {N}: already landed` → no gap, overriding the gap's `Fixable: false`.
    - `Enforced: false` → reason in `Notes`; no gap.
    - `Late-red check` section → each task not checked in `Notes`; no gap.
-9. Per task → assert codebase satisfies `DONE WHEN` (file exists, signature matches, test passes, observable behaviour) and has no test-first audit gap; `BLOCKED` log lines, `docs/deferrals.jsonl` rows, and out-of-scope notes never satisfy it; gaps a supplied decision record accepts (`Decision: Accept`, or `Decision: Accept (assumed)`) are no gap (name the record in `Notes`; an assumed accept is taken without the owner, so add `assumed, not the owner's acceptance`). **If** satisfied → tick its `- [ ] **TASK {N}:**` line `[x]` in the plan file; tick nothing else. **If** not satisfied or missing → leave `[ ]`, append log; **If** the gap is `Fixable: false` → set `Verdict` = `FAIL` via `Edit` immediately; do not defer to final pass.
-10. Update **Create** — set `Failures` via `Edit` = count of unresolved gaps; set `Fixable` via `Edit` = `true` when any of those is `Fixable: true`, else `false`; set `Verdict` via `Edit`; mapping:
-    - `PASS` = no gaps.
-    - `FAIL` = any gap `Fixable: false`.
-    - `CONCERNS` = every gap `Fixable: true`.
+   - A gap you leave `Fixable: false` is a `FAIL`.
+9. Per task → assert codebase satisfies `DONE WHEN` (file exists, signature matches, test passes, observable behaviour) and has no test-first audit gap; `BLOCKED` log lines, `docs/deferrals.jsonl` rows, and out-of-scope notes never satisfy it; gaps a supplied decision record accepts (`Decision: Accept`, or `Decision: Accept (assumed)`) are no gap (name the record in `Notes`; an assumed accept is taken without the owner, so add `assumed, not the owner's acceptance`). **If** satisfied → name its number on the header's `Tasks` line; the workflow ticks the plan. **If** not satisfied or missing → leave it off that line, append log; **If** the gap is `Fixable: false` → set `Verdict` = `FAIL` via `Edit` immediately; do not defer to final pass.
+10. Update **Create** — set `Failures` via `Edit` = count of unresolved gaps; set `Fixable` via `Edit` = `true` when any of those is `Fixable: true`, else `false`; set `Verdict` via `Edit` = the roll-up over the `Fixable` you decided: any `false` → `FAIL`, **Else** any `true` → `CONCERNS`, **Else** → `PASS`; never the report's `null`.
 
 **Output format:**
 
@@ -88,6 +83,7 @@ autoCompactWindow: 300000
 Verdict: PASS | CONCERNS | FAIL [Initially set to PENDING.]
 Failures: <integer >= 0>
 Fixable: true | false
+Tasks: <the task numbers you judged satisfied, comma-separated; none when there are none>
 
 <!-- verdict:end -->
 
diff --git a/.claude/agents/bkit-plan-generate.md b/.claude/agents/bkit-plan-generate.md
index fdff366a0..67f432677 100644
--- a/.claude/agents/bkit-plan-generate.md
+++ b/.claude/agents/bkit-plan-generate.md
@@ -39,7 +39,7 @@ autoCompactWindow: 300000
 - **Related Issues:** List tracker references from the plan input as `#N — title (state)`, not their content; they help dedupe and do not add scope. None → `None`.
 - **Example tools:** Tools and commands `docs/templates/bkit-plan.md` names are examples; write the project's own and drop what does not apply.
 - **Acceptance Scenario:** `Narrative` and `Success Criteria` come word for word from the first source that has them: the design's `## Acceptance Scenario`, else the issue's change-shape fields (`.bkit/trackers.md` § Issue shapes), else, for an audit-only plan, the user or operator impact of the in-scope findings. With no source, both read `⚠️ MISSING: no design doc, no issue Narrative and no audit report — human must provide before plan proceeds`; never invent them. `Narrative` is 1-2 sentences from the user's side: what they do and what they get back. `Success Criteria` are at most 5 measurable outcomes, not steps; an audit plan has one per in-scope finding id, from its `Expected`, with no cap. `Context & Goals` does not repeat them.
-- **Scenario detail:** `Process Sketch` restates the `Concrete Example` and `Edge Cases` as 3-7 `WHEN X → THEN Y` outcome lines, with no new examples. `Concrete Example` is one scenario: role, starting state, numbered steps, observable outcome. `Edge Cases` keep the design's Key Edge Cases, else the issue's rows, word for word, and add validation, error and boundary cases. `Derived Test Matrix` has one row per testable behaviour, each with a target file and mapped to exactly one runbook task; issue rows stay word for word, and each in-scope audit behaviour has a row.
+- **Scenario detail:** `Process Sketch` restates the `Concrete Example` and `Edge Cases` as 3-7 `WHEN X → THEN Y` outcome lines, with no new examples. `Concrete Example` is one scenario: role, starting state, numbered steps, observable outcome. `Edge Cases` keep the design's Key Edge Cases, else the issue's rows, word for word, and add validation, error and boundary cases. `Derived Test Matrix` has one row per testable behaviour, each with a target file and a `Task` cell naming the one runbook task that lands its test; issue rows stay word for word, and each in-scope audit behaviour has a row.
 - **Test tiers:** A `Derived Test Matrix` row's `Type` is a tier name exactly as `docs/testing.md` writes it, picked by its tier-selection rubric: the lowest tier that exercises the behaviour, or several. Boundary rows reach the real boundary and assert a ground-truth signal, with `@live` for an external or deployed boundary.
 - **Open questions:** Each open question gives 2-3 options with their trade-offs as the lettered `Options: A) {option} — {trade-off} · B) …`, a `Recommended` naming the chosen letter and the default if unanswered; the design's options and recommendation carry forward where it already answered. Each assumption names what breaks if it is wrong.
 - **Out of Scope:** Plan work is in scope by default. An `Out of Scope` row is `Exempt` only when no `Success Criteria`, `Acceptance Scenario`, `Derived Test Matrix` row or design item (non-goals aside) needs it, and it says why and where the item belongs. Required work parked there is a `Blocking` deferral and belongs in the runbook. Each `Exempt` row has a matching `docs/deferrals.jsonl` row; an audit `LOW` finding left out is an `Exempt` row.
diff --git a/.claude/agents/bkit-plan-review-1.md b/.claude/agents/bkit-plan-review-1.md
index 87562964c..af2be5a6f 100644
--- a/.claude/agents/bkit-plan-review-1.md
+++ b/.claude/agents/bkit-plan-review-1.md
@@ -34,7 +34,7 @@ autoCompactWindow: 300000
 - **Lens discipline:** Stay within Process-defined lens; out-of-lens findings not in remit.
 - **Output header:** All lines above `<!-- verdict:end -->` MUST be machine-parseable.
 - **Acceptance Scenario:** `Narrative` and `Success Criteria` come word for word from the first source that has them: the design's `## Acceptance Scenario`, else the issue's change-shape fields (`.bkit/trackers.md` § Issue shapes), else, for an audit-only plan, the user or operator impact of the in-scope findings. With no source, both read `⚠️ MISSING: no design doc, no issue Narrative and no audit report — human must provide before plan proceeds`; never invent them. `Narrative` is 1-2 sentences from the user's side: what they do and what they get back. `Success Criteria` are at most 5 measurable outcomes, not steps; an audit plan has one per in-scope finding id, from its `Expected`, with no cap. `Context & Goals` does not repeat them.
-- **Scenario detail:** `Process Sketch` restates the `Concrete Example` and `Edge Cases` as 3-7 `WHEN X → THEN Y` outcome lines, with no new examples. `Concrete Example` is one scenario: role, starting state, numbered steps, observable outcome. `Edge Cases` keep the design's Key Edge Cases, else the issue's rows, word for word, and add validation, error and boundary cases. `Derived Test Matrix` has one row per testable behaviour, each with a target file and mapped to exactly one runbook task; issue rows stay word for word, and each in-scope audit behaviour has a row.
+- **Scenario detail:** `Process Sketch` restates the `Concrete Example` and `Edge Cases` as 3-7 `WHEN X → THEN Y` outcome lines, with no new examples. `Concrete Example` is one scenario: role, starting state, numbered steps, observable outcome. `Edge Cases` keep the design's Key Edge Cases, else the issue's rows, word for word, and add validation, error and boundary cases. `Derived Test Matrix` has one row per testable behaviour, each with a target file and a `Task` cell naming the one runbook task that lands its test; issue rows stay word for word, and each in-scope audit behaviour has a row.
 - **Open questions:** Each open question gives 2-3 options with their trade-offs as the lettered `Options: A) {option} — {trade-off} · B) …`, a `Recommended` naming the chosen letter and the default if unanswered; the design's options and recommendation carry forward where it already answered. Each assumption names what breaks if it is wrong.
 - **Out of Scope:** Plan work is in scope by default. An `Out of Scope` row is `Exempt` only when no `Success Criteria`, `Acceptance Scenario`, `Derived Test Matrix` row or design item (non-goals aside) needs it, and it says why and where the item belongs. Required work parked there is a `Blocking` deferral and belongs in the runbook. Each `Exempt` row has a matching `docs/deferrals.jsonl` row; an audit `LOW` finding left out is an `Exempt` row.
 - **Suggested Scope Expansion:** List prior work overlapping the plan's surfaces as candidates (related open issues, open `docs/deferrals.jsonl` and `docs/failures.jsonl` rows, audit findings the input did not name), each with source, overlap and recommendation. Candidates are for the human, not runbook tasks; one joins the plan only through design scope or a human decision, and then leaves the list.
diff --git a/.claude/agents/bkit-plan-scope-check.md b/.claude/agents/bkit-plan-scope-check.md
index 0fd85e723..b3bff3753 100644
--- a/.claude/agents/bkit-plan-scope-check.md
+++ b/.claude/agents/bkit-plan-scope-check.md
@@ -34,7 +34,7 @@ autoCompactWindow: 300000
 - **Lens discipline:** Stay within Process-defined lens; out-of-lens findings not in remit.
 - **Output header:** All lines above `<!-- verdict:end -->` MUST be machine-parseable.
 - **Acceptance Scenario:** `Narrative` and `Success Criteria` come word for word from the first source that has them: the design's `## Acceptance Scenario`, else the issue's change-shape fields (`.bkit/trackers.md` § Issue shapes), else, for an audit-only plan, the user or operator impact of the in-scope findings. With no source, both read `⚠️ MISSING: no design doc, no issue Narrative and no audit report — human must provide before plan proceeds`; never invent them. `Narrative` is 1-2 sentences from the user's side: what they do and what they get back. `Success Criteria` are at most 5 measurable outcomes, not steps; an audit plan has one per in-scope finding id, from its `Expected`, with no cap. `Context & Goals` does not repeat them.
-- **Scenario detail:** `Process Sketch` restates the `Concrete Example` and `Edge Cases` as 3-7 `WHEN X → THEN Y` outcome lines, with no new examples. `Concrete Example` is one scenario: role, starting state, numbered steps, observable outcome. `Edge Cases` keep the design's Key Edge Cases, else the issue's rows, word for word, and add validation, error and boundary cases. `Derived Test Matrix` has one row per testable behaviour, each with a target file and mapped to exactly one runbook task; issue rows stay word for word, and each in-scope audit behaviour has a row.
+- **Scenario detail:** `Process Sketch` restates the `Concrete Example` and `Edge Cases` as 3-7 `WHEN X → THEN Y` outcome lines, with no new examples. `Concrete Example` is one scenario: role, starting state, numbered steps, observable outcome. `Edge Cases` keep the design's Key Edge Cases, else the issue's rows, word for word, and add validation, error and boundary cases. `Derived Test Matrix` has one row per testable behaviour, each with a target file and a `Task` cell naming the one runbook task that lands its test; issue rows stay word for word, and each in-scope audit behaviour has a row.
 - **Open questions:** Each open question gives 2-3 options with their trade-offs as the lettered `Options: A) {option} — {trade-off} · B) …`, a `Recommended` naming the chosen letter and the default if unanswered; the design's options and recommendation carry forward where it already answered. Each assumption names what breaks if it is wrong.
 - **Out of Scope:** Plan work is in scope by default. An `Out of Scope` row is `Exempt` only when no `Success Criteria`, `Acceptance Scenario`, `Derived Test Matrix` row or design item (non-goals aside) needs it, and it says why and where the item belongs. Required work parked there is a `Blocking` deferral and belongs in the runbook. Each `Exempt` row has a matching `docs/deferrals.jsonl` row; an audit `LOW` finding left out is an `Exempt` row.
 - **Reuse Inventory:** Each capability the plan introduces has a `Reuse Inventory` row, written before `Architecture & Component Changes`, recording the searches run (in-repo text and symbol search, framework built-ins, current practice) and a decision. The default is `EXTEND`: a `[MODIFY]` of the named file plus a runbook task. `NEW` needs one reason: (a) the searches find no candidate, (b) extending breaks the candidate's contract or callers, both named, or (c) the candidate is a `Supersession Inventory` `DELETE`. A cleaner fresh start or a messy or close-but-different candidate is no reason, and a row with no search is unsearched, not `NEW`. Each `[NEW]` file carries its row's reason. Each row names the file it decides in `File`, and each task `CREATE` file needs a `NEW` row naming it.
@@ -69,17 +69,15 @@ autoCompactWindow: 300000
 6. **If** `Acceptance Scenario` or `Derived Test Matrix` sections missing / vague → `CRITICAL`. Any `Open Questions & Assumptions` question breaking **Open questions** above → `OPTIONAL` findings naming missing parts.
 7. Verify every `Agent Execution Runbook` task has scope and verification step.
 8. Verify every scope item has both build task and verification task.
-9. Verify `Derived Test Matrix` ↔ `Agent Execution Runbook`: rows map 1:1 (bidirectional) to verification tasks. Gaps → `CRITICAL` finding naming the task or row to add.
-10. Identify gaps, edge cases, untested assumptions, missing error handling.
-11. Replaced / superseded code → `Supersession Inventory` with DELETE / RETAIN-with-REASON. Missing → `CRITICAL`.
-12. Introduced capability → `Reuse Inventory` row per **Reuse Inventory** above. Missing row, empty `Search performed`, rejected `NEW` reason, or untraced `[NEW]` / `EXTEND` row → `CRITICAL`.
-13. `Out of Scope` entries `Exempt` per **Out of Scope** above. Required work parked out of scope = `Blocking` → `CRITICAL`.
-14. No task scopes edits inside `bkit:start` / `bkit:end` blocks; always edit below `bkit:end`.
-15. Sort findings into the three categories `CRITICAL`, `OPTIONAL` and `OUT OF SCOPE`.
-16. Update **Create** — set `Failures` via `Edit` = `CRITICAL` count; do not count incomplete findings.
-17. Update **Create** — set `Verdict` via `Edit`; mapping:
+9. Identify gaps, edge cases, untested assumptions, missing error handling.
+10. Introduced capability → `Reuse Inventory` row per **Reuse Inventory** above. Missing row, empty `Search performed`, rejected `NEW` reason, or untraced `[NEW]` / `EXTEND` row → `CRITICAL`.
+11. `Out of Scope` entries `Exempt` per **Out of Scope** above. Required work parked out of scope = `Blocking` → `CRITICAL`.
+12. No task scopes edits inside `bkit:start` / `bkit:end` blocks; always edit below `bkit:end`.
+13. Sort findings into the three categories `CRITICAL`, `OPTIONAL` and `OUT OF SCOPE`.
+14. Update **Create** — set `Failures` via `Edit` = `CRITICAL` count; do not count incomplete findings.
+15. Update **Create** — set `Verdict` via `Edit`; mapping:
     - `PASS` = scope complete.
-    - `FAIL` = matrix-to-runbook mapping no plan edit recovers; every other gap → `CRITICAL`.
+    - `FAIL` = a `Blocking` out-of-scope deferral no plan edit recovers; every other gap → `CRITICAL`.
     - `CONCERNS` = `CRITICAL` gaps (apply via plan-update).
 
 **Output format:**
@@ -96,7 +94,7 @@ Lens: Scope, criteria, verification audit.
 
 ## CRITICAL
 
-[Gaps that block plan progress — missing / vague `Acceptance Scenario` or `Derived Test Matrix`, missing build task, missing verification task, broken matrix-to-runbook mapping, missing supersession-inventory entry, scope creep currently in plan to be removed, `Blocking` out-of-scope deferral; initially set to `PENDING`.]
+[Gaps that block plan progress — missing / vague `Acceptance Scenario` or `Derived Test Matrix`, missing build task, missing verification task, missing traceability between a capability and its `Reuse Inventory` row, scope creep currently in plan to be removed, `Blocking` out-of-scope deferral; initially set to `PENDING`.]
 
 ## OPTIONAL
 
diff --git a/.claude/agents/bkit-plan-update.md b/.claude/agents/bkit-plan-update.md
index d674bc0b2..edca9dba4 100644
--- a/.claude/agents/bkit-plan-update.md
+++ b/.claude/agents/bkit-plan-update.md
@@ -34,7 +34,7 @@ autoCompactWindow: 300000
 - **Output header:** All lines above `<!-- verdict:end -->` MUST be machine-parseable.
 - **Example tools:** Tools and commands `docs/templates/bkit-plan.md` names are examples; write the project's own and drop what does not apply.
 - **Acceptance Scenario:** `Narrative` and `Success Criteria` come word for word from the first source that has them: the design's `## Acceptance Scenario`, else the issue's change-shape fields (`.bkit/trackers.md` § Issue shapes), else, for an audit-only plan, the user or operator impact of the in-scope findings. With no source, both read `⚠️ MISSING: no design doc, no issue Narrative and no audit report — human must provide before plan proceeds`; never invent them. `Narrative` is 1-2 sentences from the user's side: what they do and what they get back. `Success Criteria` are at most 5 measurable outcomes, not steps; an audit plan has one per in-scope finding id, from its `Expected`, with no cap. `Context & Goals` does not repeat them.
-- **Scenario detail:** `Process Sketch` restates the `Concrete Example` and `Edge Cases` as 3-7 `WHEN X → THEN Y` outcome lines, with no new examples. `Concrete Example` is one scenario: role, starting state, numbered steps, observable outcome. `Edge Cases` keep the design's Key Edge Cases, else the issue's rows, word for word, and add validation, error and boundary cases. `Derived Test Matrix` has one row per testable behaviour, each with a target file and mapped to exactly one runbook task; issue rows stay word for word, and each in-scope audit behaviour has a row.
+- **Scenario detail:** `Process Sketch` restates the `Concrete Example` and `Edge Cases` as 3-7 `WHEN X → THEN Y` outcome lines, with no new examples. `Concrete Example` is one scenario: role, starting state, numbered steps, observable outcome. `Edge Cases` keep the design's Key Edge Cases, else the issue's rows, word for word, and add validation, error and boundary cases. `Derived Test Matrix` has one row per testable behaviour, each with a target file and a `Task` cell naming the one runbook task that lands its test; issue rows stay word for word, and each in-scope audit behaviour has a row.
 - **Test tiers:** A `Derived Test Matrix` row's `Type` is a tier name exactly as `docs/testing.md` writes it, picked by its tier-selection rubric: the lowest tier that exercises the behaviour, or several. Boundary rows reach the real boundary and assert a ground-truth signal, with `@live` for an external or deployed boundary.
 - **Open questions:** Each open question gives 2-3 options with their trade-offs as the lettered `Options: A) {option} — {trade-off} · B) …`, a `Recommended` naming the chosen letter and the default if unanswered; the design's options and recommendation carry forward where it already answered. Each assumption names what breaks if it is wrong.
 - **Out of Scope:** Plan work is in scope by default. An `Out of Scope` row is `Exempt` only when no `Success Criteria`, `Acceptance Scenario`, `Derived Test Matrix` row or design item (non-goals aside) needs it, and it says why and where the item belongs. Required work parked there is a `Blocking` deferral and belongs in the runbook. Each `Exempt` row has a matching `docs/deferrals.jsonl` row; an audit `LOW` finding left out is an `Exempt` row.
diff --git a/.claude/agents/bkit-ship-deferred-sweep.md b/.claude/agents/bkit-ship-deferred-sweep.md
index 6766c61d5..ac98ad583 100644
--- a/.claude/agents/bkit-ship-deferred-sweep.md
+++ b/.claude/agents/bkit-ship-deferred-sweep.md
@@ -67,14 +67,15 @@ autoCompactWindow: 300000
      - **If** shipped surfaces instruct consumers to run something that fails at runtime → mark item `Blocked`.
    - Any `Blocked` items → move to `Blocking Deferrals` and append test details with source evidence → set `Verdict` = `FAIL` via `Edit` immediately; do not defer to final pass.
    - Any leftover `Planned` items → mark items `Lazy` → move to `Lazy Deferrals` → append deferral rows to `docs/deferrals.jsonl` with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom); check existing entries first; set `reason` to `unjustified`, set `status` to `TRIAGED`.
-8. Scan supplied diff for any disabled tests (`.skip` / `.todo` / `.fixme` / `xfail`, `t.Skip()`, `#[ignore]`, `@Disabled` added, or assertions deleted); skips predating supplied diff do not count → record all under `Blocking Deferrals` with source evidence (`file:line`, test name) → set `Verdict` = `FAIL` via `Edit` immediately; do not defer to final pass.
-9. Scan `docs/deferrals.jsonl` for any plan related entries including recently appended rows → verify each `reason` holds at ship time as per `.bkit/jsonl.md` deferral reason tests; `reason` = `low-severity` with `severity` = `LOW` holds without the tests:
-   - **If** holds → record under / move to `Exempt Deferrals` → continue; append no row, `reason` is set once and carried verbatim.
-   - **Else** → record under / keep under `Lazy Deferrals` → append row to `docs/deferrals.jsonl` with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom), same `key` and prior fields verbatim, set `reason` to `unjustified`, set `status` to `TRIAGED`, `description` naming failed deferral tests.
+8. Scan the run's diff for disabled tests with `bkit branches scan-diff --disabled-tests --base=` the diff base your Context names — its `disabled` list holds each hit's `file:line` and test name → **If** exit 1 → record every entry under `Blocking Deferrals` with source evidence (`file:line`, test name) → set `Verdict` = `FAIL` via `Edit` immediately; do not defer to final pass.
+9. Bucket the plan-related deferral rows of the FID in your Context with `bkit ledgers triage --fid=` the FID in your Context `--plan=` the plan file. The verb applies the deferral tests and writes every `unjustified` / `TRIAGED` row itself; each of its `rows` carries the row's `key`, its `bucket` and the test result:
+   - **If** `bucket` = `Exempt` → record under / move to `Exempt Deferrals`; the row stands as written.
+   - **Else** → record under / keep under `Lazy Deferrals`, naming the tests the verb reports for it.
+   - **If** the plan file is absent → nothing to test against; record each plan-related row under `Exempt Deferrals` naming the missing plan.
 10. Update **Create** — set `Failures` via `Edit` = `Blocking Deferrals` entry count; set `Lazy` via `Edit` = `Lazy Deferrals` entry count.
 11. Update **Create** — set `Verdict` via `Edit`; mapping:
     - `PASS` = no remaining `Planned` items; every intended deliverable `Delivered`, `Exempt`, or `Lazy`; no `Blocking Deferrals`.
-    - `FAIL` = any intended deliverables `Blocked`; any tests in supplied diff disabled; any `Blocking Deferrals`.
+    - `FAIL` = any intended deliverables `Blocked`; any test the run's diff disabled; any `Blocking Deferrals`.
 
 **Output format:**
 
@@ -93,7 +94,7 @@ Lazy: <integer >= 0>
 
 ## Blocking Deferrals
 
-[Unmet deliverables that passed any blocking tests, and every test supplied diff disabled; per entry: test details with source evidence (`file:line`, test, grep); blocks merge. **If** none → `None`; initially set to `PENDING`.]
+[Unmet deliverables that passed any blocking tests, and every test the run's diff disabled; per entry: test details with source evidence (`file:line`, test, grep); blocks merge. **If** none → `None`; initially set to `PENDING`.]
 
 ## Exempt Deferrals
 
diff --git a/.claude/agents/bkit-ship-update-docs.md b/.claude/agents/bkit-ship-update-docs.md
index 19146f96e..5b4df3be3 100644
--- a/.claude/agents/bkit-ship-update-docs.md
+++ b/.claude/agents/bkit-ship-update-docs.md
@@ -60,7 +60,7 @@ autoCompactWindow: 300000
 4. Per doc, always follow its `Rules` headers when making edits.
 5. Per doc, four passes in order: Sync content (gaps vs implementation) → reorganize structure (dedupe, move misplaced) → compress wording (more token-efficient) → update cross-references (inline `docs/*.md` links).
 6. Ensure agent memories (`MEMORY.md` / `memory/*.md`) do not duplicate content and only contain pointers (path, section, one-line hook) to relevant `docs/*.md` sections / `docs/*.jsonl` entries. **If** memory contains duplicate / stale content → update memory.
-7. Grep `docs/deferrals.jsonl` for `{FID}` matches → surface in output `Pending Items` for human review (do not write `docs/deferrals.jsonl`).
+7. Fill `Pending Items` from the `ship-pending-items.md` deferral scan supplied in your Read paths, one entry per line (do not write `docs/deferrals.jsonl`).
 8. Produce **Create** output.
 
 **Output format:**
@@ -78,7 +78,7 @@ autoCompactWindow: 300000
 
 ## Pending Items
 
-[`{FID}` matches in `docs/deferrals.jsonl` for human review. **If** no matches → `None`.]
+[`{FID}` matches from the `ship-pending-items.md` deferral scan, for human review. **If** no matches → `None`.]
 
 ## Blockers
 
diff --git a/.claude/commands/bkit-build.md b/.claude/commands/bkit-build.md
index ec69d7917..0af6f491c 100644
--- a/.claude/commands/bkit-build.md
+++ b/.claude/commands/bkit-build.md
@@ -130,7 +130,7 @@ description: "Build Feature — Autonomous implementation"
      - Test-order gap or `exception-refused` gap → a `- **TEST EXCEPTION:**` field as the last field of the task's block in `docs/plans/{YYYYMM}/{FID}-plan.md`, one sub-bullet per test in `TEST FIRST` form, each ending `— {human's reason} (owner, {YYYY-MM-DD})`; a task with no `TEST FIRST` → the field holds `{human's reason} (owner, {YYYY-MM-DD})` alone. The field replaces the task's existing `TEST EXCEPTION` field; NEVER add a second.
      - Other → append one `docs/decisions.jsonl` row with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom); `by.step` = `build-decision`; `summary` names `{FID}`, step `{PAUSE_STEP}` and the gap or finding; `rationale` = `accepted by owner: {human's reason}`. An item that is a challenge task → also tick it `[x]` in the plan and end its title with ` — accepted by owner`.
    - **Accept (assumed)** (written by `decisions apply`) → write nothing else: no `docs/decisions.jsonl` row, no `TEST EXCEPTION`. An item that is a challenge task → tick it `[x]` and end its title with ` — accepted (assumed)`. Ship asks the owner to confirm it.
-   - **Fix now** → an item that is a challenge task → keep that task open; it runs as it is. **Else** → write a task block (`docs/templates/bkit-plan.md` § Agent Execution Runbook) numbered one above the plan's highest task, with `**DONE WHEN:**` and `**TEST FIRST:**` (one sub-bullet per test, `` `{test file}` `{test name}` fails on {what goes wrong} ``); the human's direction, when given, shapes the task:
+   - **Fix now** → an item that is a challenge task → keep that task open; it runs as it is. **Else** → write a task block (`docs/templates/bkit-plan.md` § Agent Execution Runbook) numbered one above the plan's highest task, with `**DONE WHEN:**` and `**TEST FIRST:**` (one sub-bullet per test, `` `{test file}` `{test name}` fails on {what goes wrong} ``), and one `Derived Test Matrix` row per test in that `TEST FIRST` (``| {test name} | {tier} | `{test file}` | {task} |``, the tier its file's name gives); the human's direction, when given, shapes the task:
      - `From: verify` and group `{GROUP}` stays within `{MAX_TASKS_PER_GROUP}` tasks and `{MAX_TESTS_PER_GROUP}` `TEST FIRST` tests with it → inside group `{GROUP}`.
      - `From: verify`, over either cap → a new group right after `{GROUP}`; add 1 to every later group's number, in its markers and `### GROUP` heading.
      - `From: tests` or `From: challenge` → a new last group, each new group within the caps.
@@ -323,7 +323,7 @@ description: "Build Feature — Autonomous implementation"
    ```
    Route:
    - **If** exit 0 **and** (`NEWER_COMMENTS` = 0 **or** `CONVERTED` is held) → sub-step 5.
-   - **If** `CONVERTED` is not held **and** (exit 0 with `NEWER_COMMENTS` > 0, **or** exit 2 with no `docs/plans/{YYYYMM}/{FID}-plan.md`, **or** exit 1 with a `markers` problem) → sub-step 3.
+   - **If** `CONVERTED` is not held **and** (exit 0 with `NEWER_COMMENTS` > 0, **or** exit 2 with no `docs/plans/{YYYYMM}/{FID}-plan.md`, **or** exit 1 with a `markers`, `matrix` or `supersession` problem) → sub-step 3.
    - **If** exit 1, `CONVERTED` is held **and** `CONVERT_RETRY` is not held → `CONVERT_RETRY` = the printed `problems` → sub-step 3.
    - **Else** → **Failure Path** naming each problem in the report.
 3. **Subagent:** Invoke `@bkit-build-plan-convert` using `Agent` tool:
@@ -429,8 +429,12 @@ One pass of Steps 6-8 per plan group, in group order: Step 6 briefs the first gr
    "{BKIT}" steps finish --workflow=build --step=build-plan-execute --file="{STATUS}" --attempt-of=build-plan-execute:next --group={GROUP} --agent=bkit-build-plan-execute --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-execute-{GROUP}-log.md --message="chore({FID}): plan-execute group {GROUP} attempt <attempt>" --number=6 --post --title="Plan Execute"
    ```
    Hold `verdict` as `EXECUTE_VERDICT`.
-5. Route — the log's `DONE` and `BLOCKED` lines are the handover; only Step 7 ticks tasks:
-   - **If** (`EXECUTE_VERDICT` = HANDOVER **or** a task of `GROUP_TASKS` has neither a `DONE — TASK {N}` nor a `BLOCKED — TASK {N}` line in the log) **and** `EXECUTE_RESUMED` is not held for `GROUP` → the agent stopped at its turn cap: a handover, not a failed attempt → `EXECUTE_RESUMED` = `GROUP` → re-run Step 6; its brief leaves out the `DONE` tasks.
+5. Route — the engine reads the group's open tasks:
+   ```bash
+   "{BKIT}" tasks open --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --group={GROUP} --log="docs/plans/{YYYYMM}/logs/{FID}/build-plan-execute-{GROUP}-log.md"
+   ```
+   Hold `handover` as `EXECUTE_HANDOVER`.
+   - **If** (`EXECUTE_VERDICT` = HANDOVER **or** `EXECUTE_HANDOVER` = true) **and** `EXECUTE_RESUMED` is not held for `GROUP` → the agent stopped at its turn cap: a handover, not a failed attempt → `EXECUTE_RESUMED` = `GROUP` → re-run Step 6; its brief leaves out the `DONE` tasks.
    - **Else** → Step 7.
 
 ### 🔒 Gate 6 — Plan Execute
@@ -465,33 +469,40 @@ One pass of Steps 6-8 per plan group, in group order: Step 6 briefs the first gr
 4. **Subagent:** Invoke `@bkit-build-plan-verify` using `Agent` tool:
    Context: You are a subagent in the Build phase. Group verification. Group `{GROUP}`, attempt `{VERIFY_ATTEMPT}`. Switch into working directory `cd "{WORKTREE_PATH}"` → verify with `pwd` → use for all subsequent file operations. Plan caps (`bkit.workflows.tasks`): {MAX_TASKS_PER_GROUP} tasks and {MAX_TESTS_PER_GROUP} `TEST FIRST` tests per group; {MAX_TESTS_PER_TASK} tests across {MAX_TEST_FILES_PER_TASK} test files per task.
    Read: glob `docs/plans/{YYYYMM}/logs/{FID}/build-brief-{GROUP}-*.md`, `docs/plans/{YYYYMM}/logs/{FID}/build-diff-{GROUP}-{VERIFY_ATTEMPT}.md`, `docs/plans/{YYYYMM}/logs/{FID}/build-plan-execute-{GROUP}-log.md`, `docs/plans/{YYYYMM}/logs/{FID}/build-tests-green-{GROUP}-{VERIFY_ATTEMPT}.md`, `docs/plans/{YYYYMM}/logs/{FID}/build-plan-current.md` (if present), glob `docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-{GROUP}-*.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-{GROUP}-*-log.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-decision-*.md`.
-   Update: `docs/plans/{YYYYMM}/{FID}-plan.md` (tick only group `{GROUP}`'s tasks).
    Create: `docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-{GROUP}-{VERIFY_ATTEMPT}.md`.
 5. Finish:
    ```bash
    "{BKIT}" steps finish --workflow=build --step=build-plan-verify --file="{STATUS}" --attempt-of=build-plan-verify:next --group={GROUP} --agent=bkit-build-plan-verify --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-{GROUP}-<attempt>.md" --message="chore({FID}): plan-verify group {GROUP} attempt <attempt>" --number=7 --post --title="Plan Verify"
    ```
-   Hold `verdict` as `VERIFY_VERDICT`, `failures` as `VERIFY_FAILURES`, `fields.Fixable` as `VERIFY_FIXABLE`.
-6. Route:
+   Hold `verdict` as `VERIFY_VERDICT`, `failures` as `VERIFY_FAILURES`, `fields.Fixable` as `VERIFY_FIXABLE`, `fields.Tasks` as `{VERIFIED_TASKS}`.
+6. Tick the plan with the satisfied task numbers; a task the test-first report gaps stays open:
+   ```bash
+   "{BKIT}" tasks tick --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --group={GROUP} --tasks="{VERIFIED_TASKS}" --green="docs/plans/{YYYYMM}/logs/{FID}/build-tests-green-{GROUP}-{VERIFY_ATTEMPT}.md"
+   ```
+7. Route:
    - **If** `VERIFY_VERDICT` = PASS → list the plan's groups:
      ```bash
      "{BKIT}" tests plan-check --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --existence=report --log="{OUTBOX}/build-plan-check-{GROUP}.md"
      ```
-     **If** exit non-zero → **Failure Path**. **If** the printed `groups` hold a group numbered above `GROUP` → sub-step 7. **Else** → `GATE_VERDICT` = SKIPPED → sub-step 9.
-   - **Else** → `GATE_VERDICT` = SKIPPED → sub-step 9.
-7. Run the group gate; it writes the trimmed log to the artifact:
+     Route:
+     - **If** exit 1 with a `matrix` or `supersession` problem, **and** `CONVERT_RETRY` is not held → `CONVERT_RETRY` = the printed `problems` → Step 3 sub-step 3.
+     - **If** exit non-zero → **Failure Path**.
+     - **If** the printed `groups` hold a group numbered above `GROUP` → sub-step 8.
+     - **Else** → `GATE_VERDICT` = SKIPPED → sub-step 10.
+   - **Else** → `GATE_VERDICT` = SKIPPED → sub-step 10.
+8. Run the group gate; it writes the trimmed log to the artifact:
    ```bash
    "{BKIT}" tests run --gate=bkit:gate:static-unit-integration --gate=bkit:gate:static-unit --log="{OUTBOX}/build-group-gate-{GROUP}-{VERIFY_ATTEMPT}.log" --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-group-gate-{GROUP}-{VERIFY_ATTEMPT}.md" --fid={FID} --step=build-group-gate-{GROUP} --attempt={VERIFY_ATTEMPT}
    ```
    Route:
-   - **If** exit 0 **or** 1 → hold `verdict` as `{GATE_VERDICT}`, `scope` as `{TEST_SCOPE}` → sub-step 8.
+   - **If** exit 0 **or** 1 → hold `verdict` as `{GATE_VERDICT}`, `scope` as `{TEST_SCOPE}` → sub-step 9.
    - **Else** → **Failure Path**.
-8. Finish:
+9. Finish:
    ```bash
    "{BKIT}" steps finish --workflow=build --step=build-group-gate --file="{STATUS}" --verdict={GATE_VERDICT} --scope="{TEST_SCOPE}" --attempt-of=build-plan-verify:current --group={GROUP} --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-group-gate-{GROUP}-<attempt>.md" --clamp-log="build-group-gate-{GROUP}:<attempt>" --message="chore({FID}): group-gate group {GROUP} attempt <attempt>" --number=7 --post --title="Group Gate"
    ```
-9. **If** `VERIFY_VERDICT` = PASS **and** `GATE_VERDICT` != FAIL → Step 6 (the next group, or Step 9 when none is open).
-10. **If** `VERIFY_VERDICT` = CONCERNS or FAIL, **or** `GATE_VERDICT` = FAIL → route on the group's verify rounds:
+10. **If** `VERIFY_VERDICT` = PASS **and** `GATE_VERDICT` != FAIL → Step 6 (the next group, or Step 9 when none is open).
+11. **If** `VERIFY_VERDICT` = CONCERNS or FAIL, **or** `GATE_VERDICT` = FAIL → route on the group's verify rounds:
     ```bash
     "{BKIT}" counters route --name=VERIFY_ATTEMPT --of=build-plan-verify:current --file="{STATUS}" --workflow=build --group={GROUP} --point=build.verify --continue=within-limit --exceeded=failure-path
     ```
@@ -504,7 +515,7 @@ One pass of Steps 6-8 per plan group, in group order: Step 6 briefs the first gr
     - **If** exit 0 **and** `VERIFY_ROUNDS` < `PAUSE_MAX` → `PAUSE_QUESTION` = `VERIFY_LOOP` → **Decision Pause**.
     - **If** exit 0 → `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause** (no round left: decide the open gaps).
     - **Else** → **Failure Path**.
-11. **Else** → **Failure Path**.
+12. **Else** → **Failure Path**.
 
 ### 🔒 Gate 7 — Plan Verify
 
@@ -520,7 +531,7 @@ One pass of Steps 6-8 per plan group, in group order: Step 6 briefs the first gr
 
 ### 🧠 Step 8 — Plan Gaps Remediate
 
-**Run only if** Step 7 sub-step 10 or the **Decision Pause** routed here.
+**Run only if** Step 7 sub-step 12 or the **Decision Pause** routed here.
 
 1. Read status.jsonl and derive next `STRATEGY`:
    ```bash
@@ -589,7 +600,12 @@ Runs once, after the last group; challenge fix groups pass through here on the w
    ```bash
    "{BKIT}" steps finish --workflow=build --step=build-plan-verify-holistic --file="{STATUS}" --attempt=1 --agent=bkit-build-plan-verify --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-holistic.md --message="chore({FID}): plan-verify-holistic" --number=9 --post --title="Plan Verify Holistic"
    ```
-4. Route:
+   Hold `fields.Tasks` as `{VERIFIED_TASKS}`.
+4. Tick each group's satisfied tasks — one call per plan group, `{GROUP}` that group and `{VERIFIED_TASKS}` the numbers `Tasks:` names for it:
+   ```bash
+   "{BKIT}" tasks tick --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --group={GROUP} --tasks="{VERIFIED_TASKS}"
+   ```
+5. Route:
    - **If** `verdict` = PASS or CONCERNS → Step 10.
    - **Else** → **Failure Path**.
 
diff --git a/.claude/commands/bkit-ship.md b/.claude/commands/bkit-ship.md
index 55ed2e2fc..c7fb4170d 100644
--- a/.claude/commands/bkit-ship.md
+++ b/.claude/commands/bkit-ship.md
@@ -368,7 +368,7 @@ description: "Ship Feature — Autonomous merge and archive"
    cd "{WORKTREE_PATH}" && "{BKIT}" context diff --reset-log --artifact="tmp/bkit-diff-{FID}.md" --fid={FID} --step=ship-deferred-sweep >/dev/null || exit 2
    ```
    **Subagent:** Invoke `@bkit-ship-deferred-sweep` using `Agent` tool:
-   Context: You are a subagent in the Ship phase. Pre-merge completeness gate. Switch into working directory `cd "{WORKTREE_PATH}"` → verify with `pwd` → use for all subsequent file operations.
+   Context: You are a subagent in the Ship phase. Pre-merge completeness gate. Diff base: `origin/dev` — run `bkit branches scan-diff --disabled-tests --base=origin/dev`. Switch into working directory `cd "{WORKTREE_PATH}"` → verify with `pwd` → use for all subsequent file operations.
    Read: `docs/plans/{YYYYMM}/logs/{FID}/ship-input-{RUN}.md`, `docs/plans/{YYYYMM}/{FID}-plan.md` (if present), `docs/plans/{YYYYMM}/{FID}-design.md` (if present), `{STATUS}`, `docs/deferrals.jsonl`, glob `docs/plans/{YYYYMM}/logs/{FID}/*-plan-verify*.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/*-challenge*.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/*-summary.md`, `tmp/bkit-diff-{FID}.md` (the run's diff).
    Create: `docs/plans/{YYYYMM}/logs/{FID}/ship-deferred-sweep.md`.
 3. Finish (bookkeeping to `$BOOK_ROOT`):
@@ -393,26 +393,30 @@ description: "Ship Feature — Autonomous merge and archive"
 
 ## 🧠 Step 6 — Update Docs & Summary
 
-1. **Subagent:** Invoke `@bkit-ship-update-docs` using `Agent` tool:
+1. Write the FID's deferral lines to the artifact the docs agent reads `Pending Items` from:
+   ```bash
+   cd "{WORKTREE_PATH}" && "{BKIT}" context ledger-scan --terms="{FID}" --source=docs/deferrals.jsonl --artifact="{OUTBOX}/ship-pending-items.md" --fid={FID} --step=ship-update-docs --reset-log >/dev/null || exit 1
+   ```
+2. **Subagent:** Invoke `@bkit-ship-update-docs` using `Agent` tool:
    Context: You are a subagent in the Ship phase. Switch into working directory `cd "{WORKTREE_PATH}"` → verify with `pwd` → use for all subsequent file operations.
-   Read: `docs/plans/{YYYYMM}/{FID}-plan.md` (if present), glob `docs/plans/{YYYYMM}/logs/{FID}/*.md` (excluding `*-summary.md` / `*-handover.md`).
+   Read: `docs/plans/{YYYYMM}/{FID}-plan.md` (if present), glob `docs/plans/{YYYYMM}/logs/{FID}/*.md` (excluding `*-summary.md` / `*-handover.md`), `{OUTBOX}/ship-pending-items.md`.
    Update: Doc files.
    Create: `docs/plans/{YYYYMM}/logs/{FID}/ship-update-docs.md`.
-2. Wait for the subagent to complete, then append the `SHIPPED` row to the worktree ledger and re-render the mechanical `roadmap-status` board from it (exit 1 when the row did not land), and finish the step (bookkeeping to `$BOOK_ROOT`):
+3. Wait for the subagent to complete, then append the `SHIPPED` row to the worktree ledger and re-render the mechanical `roadmap-status` board from it (exit 1 when the row did not land), and finish the step (bookkeeping to `$BOOK_ROOT`):
    ```bash
    "{BKIT}" roadmap feature --root="{WORKTREE_PATH}" --workflow=ship --fid="{FID}" --step=ship-update-docs --strict >/dev/null || exit 1
    "{BKIT}" steps finish --workflow=ship --step=ship-update-docs --file="{STATUS}" --artifact="docs/plans/{YYYYMM}/logs/{FID}/ship-update-docs.md" --commit=none >/dev/null || exit 1
    ```
-3. Write `ship-summary.md` from this run's status rows and the PR's size:
+4. Write `ship-summary.md` from this run's status rows and the PR's size:
    ```bash
    "{BKIT}" workflows summary --workflow=ship --file="{STATUS}" --pr={PR_NUMBER}
    ```
    **If** exit non-zero → **Failure Path**. Hold `verdict` as `SUMMARY_VERDICT`, `failures` as `SUMMARY_FAILURES`.
-4. Finish (bookkeeping to `$BOOK_ROOT`):
+5. Finish (bookkeeping to `$BOOK_ROOT`):
    ```bash
    "{BKIT}" steps finish --workflow=ship --step=ship-summary --file="{STATUS}" --attempt=1 --verdict={SUMMARY_VERDICT} --failures={SUMMARY_FAILURES} --artifact="docs/plans/{YYYYMM}/logs/{FID}/ship-summary.md" --commit=none --number=6 --post --title="Update Docs & Summary" --link-ref=dev --comment-body
    ```
-5. Route:
+6. Route:
    - **If** `SUMMARY_VERDICT` = PASS or CONCERNS → Step 7.
    - **If** `SUMMARY_VERDICT` = FAIL → display `ship-summary.md` content verbatim as final message to user. Line 1 of the final message = the no-issue warning, when one was emitted. → **Failure Path**.
    - **Else** → **Failure Path**.
diff --git a/.codex/agents/bkit-build-plan-convert.toml b/.codex/agents/bkit-build-plan-convert.toml
index b03c09098..4e1205a1f 100644
--- a/.codex/agents/bkit-build-plan-convert.toml
+++ b/.codex/agents/bkit-build-plan-convert.toml
@@ -21,6 +21,7 @@ developer_instructions = """
 - **Input dates:** Where two sections of the `*-input-*.md` file disagree, the newer one wins; older text still counts wherever nothing newer contradicts it.
 - **Same scope:** Every task traces to the input file or the existing plan; add no work they do not ask for, drop none they do.
 - **No anchor authoring:** Do not author `<!-- bkit:anchor` block; keep an existing one byte-for-byte.
+- **Matrix shape:** The plan's `Derived Test Matrix` has a `Task` column beside `Test description`, `Type` and `Target file`; each cell names the one runbook task that lands that row's test.
 - **Runbook tasks:** The runbook is groups of task blocks in build order (schema, then API, then UI). A group is `<!-- bkit:group N start -->`, `### GROUP N: {title}`, its task blocks and `<!-- bkit:group N end -->`, holding tasks and `TEST FIRST` tests within the per-group plan caps your Context names (`bkit.workflows.tasks`: tasks, and `TEST FIRST` tests in all); bigger → split the group. A task is `<!-- bkit:task N start -->`, `- [ ] **TASK N:** {title}`, one sub-bullet per field and `<!-- bkit:task N end -->`, its number unique across the plan. Fields, uppercase: `**CREATE:**` / `**READ:**` / `**UPDATE:**` / `**DELETE:**` (`` `{symbol}` in `{file}`: {what} `` or `` `{file}`: {what} ``, one line per reference), `**DEPENDS ON:**` (task numbers, same or earlier group), `**DONE WHEN:**`, `**TEST FIRST:**`, `**TEST EXCEPTION:**`; `bkit tests plan-check` refuses task-like text outside every block. `DONE WHEN` is short, testable and checkable in the codebase (a file exists, a signature matches, a test passes, a behaviour shows). A task that adds or changes logic names its own tests and fixes the tests it breaks; no task leaves its tests to a later one. Behaviour tests come only from `Derived Test Matrix` rows, and a task crossing a boundary (DB, API, model, network, migration) pairs them with non-mock tests. An audit plan has one task per in-scope finding id; tasks group findings only on one shared root cause and still name every id.
 - **TEST FIRST:** Each task carries a `**TEST FIRST:**` field after `DONE WHEN`. A behaviour change at the unit or integration tier lists one or more tests, within the per-task plan caps your Context names (tests, test files), one sub-bullet per test, each `` `{test file}` `` `` `{test name}` `` fails on {what goes wrong}: a repo-relative test file, the test name as the runner reports it or its last segments, and {what goes wrong} as the wrong behaviour a stub shows, not a literal assertion. More tests or files → split the task. No behaviour change (docs, config, pure refactor) or E2E / `@live` tier only → `n/a — {reason naming which}` on the field line.
 - **TEST EXCEPTION:** ONLY the human writes a `**TEST EXCEPTION:**` field, or the build orchestrator after the human approves it; never write one on your own judgement. It sits inside the task's block, with entries in `TEST FIRST` form each ending `— {reason}`.
diff --git a/.codex/agents/bkit-build-plan-current.toml b/.codex/agents/bkit-build-plan-current.toml
index a1696de3b..fcaafaa30 100644
--- a/.codex/agents/bkit-build-plan-current.toml
+++ b/.codex/agents/bkit-build-plan-current.toml
@@ -43,11 +43,11 @@ developer_instructions = """
 2. Re-read all supplied inputs once at session start; do not trust session memory.
 3. Read `.agents/docs.md` → load docs for workflow / step / task; skip missing.
 4. Update **Create** after each affected task — append log at EOF via Bash `echo {log entry} >> {output}`; heredoc for multi-line. **If** any task `Broken` → set `Verdict` = `FAIL` via `Edit` immediately; do not defer to final pass.
-5. Per plan task block, record paths, symbols, and commands its `CREATE` / `READ` / `UPDATE` / `DELETE` and `DONE WHEN` fields depend on → in-scope set.
-6. Run `git diff --name-only {BASE_SHA}..origin/dev` → changed-path list. Task matches on any in-scope path in that list. For each task with no path match run `git diff {BASE_SHA}..origin/dev -S{needle} --name-only` per in-scope symbol and command; non-empty output → matched on that needle:
-   - **If** no tasks match → no affected tasks; do not read any diff.
-   - **Else** → continue with matched tasks only.
-7. Per matched task, run `git diff {BASE_SHA}..origin/dev -- {path}` for its matched paths and read it; needle match → paths named by that needle `-S` output; never diff whole range; never read paths outside match set.
+5. Per plan task block, record the paths, symbols, and commands its `CREATE` / `READ` / `UPDATE` / `DELETE` and `DONE WHEN` fields depend on → in-scope set.
+6. Run `bkit tasks currency --plan={plan file} --base={BASE_SHA} --against=origin/dev` → each task whose in-scope path or symbol moved in `{BASE_SHA}...origin/dev`, with its matched paths, needles and diff hunks:
+   - **If** no task is printed → no affected tasks; do not read any diff.
+   - **Else** → continue with the printed tasks only.
+7. Read the diff hunks `currency` printed for each matched task; never read a path outside its matched set.
 8. Per matched task, decide against diff — `Executable` tasks are not findings and are not logged:
    - `Executable` = landed changes leave task approach intact.
    - `Reword` = task approach holds; paths, symbols, or commands task names have moved and wording no longer matches.
diff --git a/.codex/agents/bkit-build-plan-verify.toml b/.codex/agents/bkit-build-plan-verify.toml
index 785393567..4597ec3f4 100644
--- a/.codex/agents/bkit-build-plan-verify.toml
+++ b/.codex/agents/bkit-build-plan-verify.toml
@@ -16,7 +16,7 @@ developer_instructions = """
 **Contract:** The terms between this agent and whoever runs it.
 
 - **Read / Update / Create:** Use any appended Read / Update / Create as exact I/O paths.
-- **Mandate:** Verify plan implementation; change plan only to mark tasks done; do not build, install, or write code.
+- **Mandate:** Verify plan implementation and pass the task numbers you judged satisfied on the header's `Tasks` line; never edit the plan; do not build, install, or write code.
 - **No commits:** Do not run `git commit` / `git add` / `git push` (caller does).
 - **Output header:** All lines above `<!-- verdict:end -->` MUST be machine-parseable.
 - **Runbook tasks:** The runbook is groups of task blocks in build order (schema, then API, then UI). A group is `<!-- bkit:group N start -->`, `### GROUP N: {title}`, its task blocks and `<!-- bkit:group N end -->`, holding tasks and `TEST FIRST` tests within the per-group plan caps your Context names (`bkit.workflows.tasks`: tasks, and `TEST FIRST` tests in all); bigger → split the group. A task is `<!-- bkit:task N start -->`, `- [ ] **TASK N:** {title}`, one sub-bullet per field and `<!-- bkit:task N end -->`, its number unique across the plan. Fields, uppercase: `**CREATE:**` / `**READ:**` / `**UPDATE:**` / `**DELETE:**` (`` `{symbol}` in `{file}`: {what} `` or `` `{file}`: {what} ``, one line per reference), `**DEPENDS ON:**` (task numbers, same or earlier group), `**DONE WHEN:**`, `**TEST FIRST:**`, `**TEST EXCEPTION:**`; `bkit tests plan-check` refuses task-like text outside every block. `DONE WHEN` is short, testable and checkable in the codebase (a file exists, a signature matches, a test passes, a behaviour shows). A task that adds or changes logic names its own tests and fixes the tests it breaks; no task leaves its tests to a later one. Behaviour tests come only from `Derived Test Matrix` rows, and a task crossing a boundary (DB, API, model, network, migration) pairs them with non-mock tests. An audit plan has one task per in-scope finding id; tasks group findings only on one shared root cause and still name every id.
@@ -48,26 +48,21 @@ developer_instructions = """
 1. Initialise **Create** output stub with `PENDING` placeholders.
 2. Re-read all supplied inputs once at session start; do not trust session memory.
 3. Read `.agents/docs.md` → load docs for workflow / step / task; skip missing.
-4. Update **Create** — replace each `PENDING` via `Edit` as content becomes available. Per gap — append log at EOF via Bash `echo {log entry} >> {output}`; heredoc for multi-line; each entry ends `— Fixable: true` or `— Fixable: false` (by gap-remediate). **If** any gap `Fixable: false` → set `Verdict` = `FAIL` via `Edit` immediately; do not defer to final pass.
+4. Update **Create** — replace each `PENDING` via `Edit` as content becomes available. Per gap — append log at EOF via Bash `echo {log entry} >> {output}`; heredoc for multi-line; `{log entry}` is the gap's report `logLine` with your decided `Fixable: true` / `Fixable: false` in place of the engine's `Fixable: null`; each entry ends `— Fixable: true` or `— Fixable: false` (by gap-remediate). **If** any gap `Fixable: false` → set `Verdict` = `FAIL` via `Edit` immediately; do not defer to final pass.
 5. Determine `Mode` from input Context (`Group` or `Holistic`).
-6. **If** `Group` → the supplied briefs' task blocks are the work; judge them against the supplied group diff (the changes since the group started), not the whole branch; a brief's `Deviations` section holds the owner's run instructions → judge the tasks it names as it directs. Every task field and gate maps to real codebase changes. Find missing components, skipped steps, unimplemented edge cases. Cross-reference the tasks vs the execute log's `DONE — TASK {N}` lines; a `DONE` line is a claim to check, never proof.
-7. **If** `Holistic` → same task / gate / `DONE` log cross-reference across every group of the plan, plus integration: groups' components work together? API contracts match? Shared state consistent? Cross-domain boundaries respected? Run `pnpm bkit:gate:static-unit`.
-8. **If** test-first audit report supplied (`Enforced` / `Gaps` header) → map its gaps per task:
-   - `not-green` → `Fixable: true`.
+6. **If** `Group` → the supplied briefs' task blocks are the work; judge them against the supplied group diff (the changes since the group started), not the whole branch; a brief's `Deviations` section holds the owner's run instructions → judge the tasks it names as it directs. Every task field and gate maps to real codebase changes. Find missing components, skipped steps, unimplemented edge cases.
+7. **If** `Holistic` → the same task and gate check across every group of the plan, plus integration: groups' components work together? API contracts match? Shared state consistent? Cross-domain boundaries respected? Run `pnpm bkit:gate:static-unit`.
+8. **If** test-first audit report supplied (`Enforced` / `Verdict` / `Gaps` header) → decide each gap: its `fixable` stands unless `null`, and a `null` one you decide from the diff it names:
    - `delete-still-referenced` → read each hit; a different thing with the same name → no gap; else `Fixable: true`.
    - `test-changed` → read its diff; only formatting → no gap; weakened, removed or rewritten assertions → `Fixable: false`.
-   - Row `Changed since red` = `added lines only` → read its diff; any line added inside a planned test or in setup it runs (`beforeEach`, fixture, mock) → `test-changed` gap, `Fixable: false`; added lines only outside every planned test → no gap.
+   - `test-changed` on a row whose `Changed since red` = `added lines only` → read its diff; any line added inside a planned test or in setup it runs (`beforeEach`, fixture, mock) → `Fixable: false`; added lines only outside every planned test → no gap.
    - `red-mismatch` → recorded test is the planned one renamed or moved **and** passes now → no gap, nor for that test's `not-green`; else `Fixable: false`.
-   - `no-red` on a task the plan-currency report classifies `Broken` with work already landed **and** the execute log records `DONE — TASK {N}: already landed` → no gap.
-   - `no-red`, `late-red`, `no-test-first`, `test-first-malformed`, `test-first-unread`, `red-evidence-missing`, `exception-refused` → `Fixable: false`.
-   - Test-order gap (`no-red`, `late-red`, `red-mismatch`, `red-evidence-missing`, `test-changed`) → log as ``TASK {N}: `{test file}` `{test name}` — {kind} — Fixable: false``.
+   - `no-red` on a task the plan-currency report classifies `Broken` with work already landed **and** the execute log records `DONE — TASK {N}: already landed` → no gap, overriding the gap's `Fixable: false`.
    - `Enforced: false` → reason in `Notes`; no gap.
    - `Late-red check` section → each task not checked in `Notes`; no gap.
-9. Per task → assert codebase satisfies `DONE WHEN` (file exists, signature matches, test passes, observable behaviour) and has no test-first audit gap; `BLOCKED` log lines, `docs/deferrals.jsonl` rows, and out-of-scope notes never satisfy it; gaps a supplied decision record accepts (`Decision: Accept`, or `Decision: Accept (assumed)`) are no gap (name the record in `Notes`; an assumed accept is taken without the owner, so add `assumed, not the owner's acceptance`). **If** satisfied → tick its `- [ ] **TASK {N}:**` line `[x]` in the plan file; tick nothing else. **If** not satisfied or missing → leave `[ ]`, append log; **If** the gap is `Fixable: false` → set `Verdict` = `FAIL` via `Edit` immediately; do not defer to final pass.
-10. Update **Create** — set `Failures` via `Edit` = count of unresolved gaps; set `Fixable` via `Edit` = `true` when any of those is `Fixable: true`, else `false`; set `Verdict` via `Edit`; mapping:
-    - `PASS` = no gaps.
-    - `FAIL` = any gap `Fixable: false`.
-    - `CONCERNS` = every gap `Fixable: true`.
+   - A gap you leave `Fixable: false` is a `FAIL`.
+9. Per task → assert codebase satisfies `DONE WHEN` (file exists, signature matches, test passes, observable behaviour) and has no test-first audit gap; `BLOCKED` log lines, `docs/deferrals.jsonl` rows, and out-of-scope notes never satisfy it; gaps a supplied decision record accepts (`Decision: Accept`, or `Decision: Accept (assumed)`) are no gap (name the record in `Notes`; an assumed accept is taken without the owner, so add `assumed, not the owner's acceptance`). **If** satisfied → name its number on the header's `Tasks` line; the workflow ticks the plan. **If** not satisfied or missing → leave it off that line, append log; **If** the gap is `Fixable: false` → set `Verdict` = `FAIL` via `Edit` immediately; do not defer to final pass.
+10. Update **Create** — set `Failures` via `Edit` = count of unresolved gaps; set `Fixable` via `Edit` = `true` when any of those is `Fixable: true`, else `false`; set `Verdict` via `Edit` = the roll-up over the `Fixable` you decided: any `false` → `FAIL`, **Else** any `true` → `CONCERNS`, **Else** → `PASS`; never the report's `null`.
 
 **Output format:**
 
@@ -75,6 +70,7 @@ developer_instructions = """
 Verdict: PASS | CONCERNS | FAIL [Initially set to PENDING.]
 Failures: <integer >= 0>
 Fixable: true | false
+Tasks: <the task numbers you judged satisfied, comma-separated; none when there are none>
 
 <!-- verdict:end -->
 
diff --git a/.codex/agents/bkit-plan-generate.toml b/.codex/agents/bkit-plan-generate.toml
index ab905e2cd..a194730f7 100644
--- a/.codex/agents/bkit-plan-generate.toml
+++ b/.codex/agents/bkit-plan-generate.toml
@@ -26,7 +26,7 @@ developer_instructions = """
 - **Related Issues:** List tracker references from the plan input as `#N — title (state)`, not their content; they help dedupe and do not add scope. None → `None`.
 - **Example tools:** Tools and commands `docs/templates/bkit-plan.md` names are examples; write the project's own and drop what does not apply.
 - **Acceptance Scenario:** `Narrative` and `Success Criteria` come word for word from the first source that has them: the design's `## Acceptance Scenario`, else the issue's change-shape fields (`.bkit/trackers.md` § Issue shapes), else, for an audit-only plan, the user or operator impact of the in-scope findings. With no source, both read `⚠️ MISSING: no design doc, no issue Narrative and no audit report — human must provide before plan proceeds`; never invent them. `Narrative` is 1-2 sentences from the user's side: what they do and what they get back. `Success Criteria` are at most 5 measurable outcomes, not steps; an audit plan has one per in-scope finding id, from its `Expected`, with no cap. `Context & Goals` does not repeat them.
-- **Scenario detail:** `Process Sketch` restates the `Concrete Example` and `Edge Cases` as 3-7 `WHEN X → THEN Y` outcome lines, with no new examples. `Concrete Example` is one scenario: role, starting state, numbered steps, observable outcome. `Edge Cases` keep the design's Key Edge Cases, else the issue's rows, word for word, and add validation, error and boundary cases. `Derived Test Matrix` has one row per testable behaviour, each with a target file and mapped to exactly one runbook task; issue rows stay word for word, and each in-scope audit behaviour has a row.
+- **Scenario detail:** `Process Sketch` restates the `Concrete Example` and `Edge Cases` as 3-7 `WHEN X → THEN Y` outcome lines, with no new examples. `Concrete Example` is one scenario: role, starting state, numbered steps, observable outcome. `Edge Cases` keep the design's Key Edge Cases, else the issue's rows, word for word, and add validation, error and boundary cases. `Derived Test Matrix` has one row per testable behaviour, each with a target file and a `Task` cell naming the one runbook task that lands its test; issue rows stay word for word, and each in-scope audit behaviour has a row.
 - **Test tiers:** A `Derived Test Matrix` row's `Type` is a tier name exactly as `docs/testing.md` writes it, picked by its tier-selection rubric: the lowest tier that exercises the behaviour, or several. Boundary rows reach the real boundary and assert a ground-truth signal, with `@live` for an external or deployed boundary.
 - **Open questions:** Each open question gives 2-3 options with their trade-offs as the lettered `Options: A) {option} — {trade-off} · B) …`, a `Recommended` naming the chosen letter and the default if unanswered; the design's options and recommendation carry forward where it already answered. Each assumption names what breaks if it is wrong.
 - **Out of Scope:** Plan work is in scope by default. An `Out of Scope` row is `Exempt` only when no `Success Criteria`, `Acceptance Scenario`, `Derived Test Matrix` row or design item (non-goals aside) needs it, and it says why and where the item belongs. Required work parked there is a `Blocking` deferral and belongs in the runbook. Each `Exempt` row has a matching `docs/deferrals.jsonl` row; an audit `LOW` finding left out is an `Exempt` row.
diff --git a/.codex/agents/bkit-plan-review-1.toml b/.codex/agents/bkit-plan-review-1.toml
index 6cc66afe8..5a68f0e43 100644
--- a/.codex/agents/bkit-plan-review-1.toml
+++ b/.codex/agents/bkit-plan-review-1.toml
@@ -22,7 +22,7 @@ developer_instructions = """
 - **Lens discipline:** Stay within Process-defined lens; out-of-lens findings not in remit.
 - **Output header:** All lines above `<!-- verdict:end -->` MUST be machine-parseable.
 - **Acceptance Scenario:** `Narrative` and `Success Criteria` come word for word from the first source that has them: the design's `## Acceptance Scenario`, else the issue's change-shape fields (`.bkit/trackers.md` § Issue shapes), else, for an audit-only plan, the user or operator impact of the in-scope findings. With no source, both read `⚠️ MISSING: no design doc, no issue Narrative and no audit report — human must provide before plan proceeds`; never invent them. `Narrative` is 1-2 sentences from the user's side: what they do and what they get back. `Success Criteria` are at most 5 measurable outcomes, not steps; an audit plan has one per in-scope finding id, from its `Expected`, with no cap. `Context & Goals` does not repeat them.
-- **Scenario detail:** `Process Sketch` restates the `Concrete Example` and `Edge Cases` as 3-7 `WHEN X → THEN Y` outcome lines, with no new examples. `Concrete Example` is one scenario: role, starting state, numbered steps, observable outcome. `Edge Cases` keep the design's Key Edge Cases, else the issue's rows, word for word, and add validation, error and boundary cases. `Derived Test Matrix` has one row per testable behaviour, each with a target file and mapped to exactly one runbook task; issue rows stay word for word, and each in-scope audit behaviour has a row.
+- **Scenario detail:** `Process Sketch` restates the `Concrete Example` and `Edge Cases` as 3-7 `WHEN X → THEN Y` outcome lines, with no new examples. `Concrete Example` is one scenario: role, starting state, numbered steps, observable outcome. `Edge Cases` keep the design's Key Edge Cases, else the issue's rows, word for word, and add validation, error and boundary cases. `Derived Test Matrix` has one row per testable behaviour, each with a target file and a `Task` cell naming the one runbook task that lands its test; issue rows stay word for word, and each in-scope audit behaviour has a row.
 - **Open questions:** Each open question gives 2-3 options with their trade-offs as the lettered `Options: A) {option} — {trade-off} · B) …`, a `Recommended` naming the chosen letter and the default if unanswered; the design's options and recommendation carry forward where it already answered. Each assumption names what breaks if it is wrong.
 - **Out of Scope:** Plan work is in scope by default. An `Out of Scope` row is `Exempt` only when no `Success Criteria`, `Acceptance Scenario`, `Derived Test Matrix` row or design item (non-goals aside) needs it, and it says why and where the item belongs. Required work parked there is a `Blocking` deferral and belongs in the runbook. Each `Exempt` row has a matching `docs/deferrals.jsonl` row; an audit `LOW` finding left out is an `Exempt` row.
 - **Suggested Scope Expansion:** List prior work overlapping the plan's surfaces as candidates (related open issues, open `docs/deferrals.jsonl` and `docs/failures.jsonl` rows, audit findings the input did not name), each with source, overlap and recommendation. Candidates are for the human, not runbook tasks; one joins the plan only through design scope or a human decision, and then leaves the list.
diff --git a/.codex/agents/bkit-plan-scope-check.toml b/.codex/agents/bkit-plan-scope-check.toml
index fa2c800fe..166c33138 100644
--- a/.codex/agents/bkit-plan-scope-check.toml
+++ b/.codex/agents/bkit-plan-scope-check.toml
@@ -22,7 +22,7 @@ developer_instructions = """
 - **Lens discipline:** Stay within Process-defined lens; out-of-lens findings not in remit.
 - **Output header:** All lines above `<!-- verdict:end -->` MUST be machine-parseable.
 - **Acceptance Scenario:** `Narrative` and `Success Criteria` come word for word from the first source that has them: the design's `## Acceptance Scenario`, else the issue's change-shape fields (`.bkit/trackers.md` § Issue shapes), else, for an audit-only plan, the user or operator impact of the in-scope findings. With no source, both read `⚠️ MISSING: no design doc, no issue Narrative and no audit report — human must provide before plan proceeds`; never invent them. `Narrative` is 1-2 sentences from the user's side: what they do and what they get back. `Success Criteria` are at most 5 measurable outcomes, not steps; an audit plan has one per in-scope finding id, from its `Expected`, with no cap. `Context & Goals` does not repeat them.
-- **Scenario detail:** `Process Sketch` restates the `Concrete Example` and `Edge Cases` as 3-7 `WHEN X → THEN Y` outcome lines, with no new examples. `Concrete Example` is one scenario: role, starting state, numbered steps, observable outcome. `Edge Cases` keep the design's Key Edge Cases, else the issue's rows, word for word, and add validation, error and boundary cases. `Derived Test Matrix` has one row per testable behaviour, each with a target file and mapped to exactly one runbook task; issue rows stay word for word, and each in-scope audit behaviour has a row.
+- **Scenario detail:** `Process Sketch` restates the `Concrete Example` and `Edge Cases` as 3-7 `WHEN X → THEN Y` outcome lines, with no new examples. `Concrete Example` is one scenario: role, starting state, numbered steps, observable outcome. `Edge Cases` keep the design's Key Edge Cases, else the issue's rows, word for word, and add validation, error and boundary cases. `Derived Test Matrix` has one row per testable behaviour, each with a target file and a `Task` cell naming the one runbook task that lands its test; issue rows stay word for word, and each in-scope audit behaviour has a row.
 - **Open questions:** Each open question gives 2-3 options with their trade-offs as the lettered `Options: A) {option} — {trade-off} · B) …`, a `Recommended` naming the chosen letter and the default if unanswered; the design's options and recommendation carry forward where it already answered. Each assumption names what breaks if it is wrong.
 - **Out of Scope:** Plan work is in scope by default. An `Out of Scope` row is `Exempt` only when no `Success Criteria`, `Acceptance Scenario`, `Derived Test Matrix` row or design item (non-goals aside) needs it, and it says why and where the item belongs. Required work parked there is a `Blocking` deferral and belongs in the runbook. Each `Exempt` row has a matching `docs/deferrals.jsonl` row; an audit `LOW` finding left out is an `Exempt` row.
 - **Reuse Inventory:** Each capability the plan introduces has a `Reuse Inventory` row, written before `Architecture & Component Changes`, recording the searches run (in-repo text and symbol search, framework built-ins, current practice) and a decision. The default is `EXTEND`: a `[MODIFY]` of the named file plus a runbook task. `NEW` needs one reason: (a) the searches find no candidate, (b) extending breaks the candidate's contract or callers, both named, or (c) the candidate is a `Supersession Inventory` `DELETE`. A cleaner fresh start or a messy or close-but-different candidate is no reason, and a row with no search is unsearched, not `NEW`. Each `[NEW]` file carries its row's reason. Each row names the file it decides in `File`, and each task `CREATE` file needs a `NEW` row naming it.
@@ -57,17 +57,15 @@ developer_instructions = """
 6. **If** `Acceptance Scenario` or `Derived Test Matrix` sections missing / vague → `CRITICAL`. Any `Open Questions & Assumptions` question breaking **Open questions** above → `OPTIONAL` findings naming missing parts.
 7. Verify every `Agent Execution Runbook` task has scope and verification step.
 8. Verify every scope item has both build task and verification task.
-9. Verify `Derived Test Matrix` ↔ `Agent Execution Runbook`: rows map 1:1 (bidirectional) to verification tasks. Gaps → `CRITICAL` finding naming the task or row to add.
-10. Identify gaps, edge cases, untested assumptions, missing error handling.
-11. Replaced / superseded code → `Supersession Inventory` with DELETE / RETAIN-with-REASON. Missing → `CRITICAL`.
-12. Introduced capability → `Reuse Inventory` row per **Reuse Inventory** above. Missing row, empty `Search performed`, rejected `NEW` reason, or untraced `[NEW]` / `EXTEND` row → `CRITICAL`.
-13. `Out of Scope` entries `Exempt` per **Out of Scope** above. Required work parked out of scope = `Blocking` → `CRITICAL`.
-14. No task scopes edits inside `bkit:start` / `bkit:end` blocks; always edit below `bkit:end`.
-15. Sort findings into the three categories `CRITICAL`, `OPTIONAL` and `OUT OF SCOPE`.
-16. Update **Create** — set `Failures` via `Edit` = `CRITICAL` count; do not count incomplete findings.
-17. Update **Create** — set `Verdict` via `Edit`; mapping:
+9. Identify gaps, edge cases, untested assumptions, missing error handling.
+10. Introduced capability → `Reuse Inventory` row per **Reuse Inventory** above. Missing row, empty `Search performed`, rejected `NEW` reason, or untraced `[NEW]` / `EXTEND` row → `CRITICAL`.
+11. `Out of Scope` entries `Exempt` per **Out of Scope** above. Required work parked out of scope = `Blocking` → `CRITICAL`.
+12. No task scopes edits inside `bkit:start` / `bkit:end` blocks; always edit below `bkit:end`.
+13. Sort findings into the three categories `CRITICAL`, `OPTIONAL` and `OUT OF SCOPE`.
+14. Update **Create** — set `Failures` via `Edit` = `CRITICAL` count; do not count incomplete findings.
+15. Update **Create** — set `Verdict` via `Edit`; mapping:
     - `PASS` = scope complete.
-    - `FAIL` = matrix-to-runbook mapping no plan edit recovers; every other gap → `CRITICAL`.
+    - `FAIL` = a `Blocking` out-of-scope deferral no plan edit recovers; every other gap → `CRITICAL`.
     - `CONCERNS` = `CRITICAL` gaps (apply via plan-update).
 
 **Output format:**
@@ -84,7 +82,7 @@ Lens: Scope, criteria, verification audit.
 
 ## CRITICAL
 
-[Gaps that block plan progress — missing / vague `Acceptance Scenario` or `Derived Test Matrix`, missing build task, missing verification task, broken matrix-to-runbook mapping, missing supersession-inventory entry, scope creep currently in plan to be removed, `Blocking` out-of-scope deferral; initially set to `PENDING`.]
+[Gaps that block plan progress — missing / vague `Acceptance Scenario` or `Derived Test Matrix`, missing build task, missing verification task, missing traceability between a capability and its `Reuse Inventory` row, scope creep currently in plan to be removed, `Blocking` out-of-scope deferral; initially set to `PENDING`.]
 
 ## OPTIONAL
 
diff --git a/.codex/agents/bkit-plan-update.toml b/.codex/agents/bkit-plan-update.toml
index 7018755b2..71a3e3a06 100644
--- a/.codex/agents/bkit-plan-update.toml
+++ b/.codex/agents/bkit-plan-update.toml
@@ -22,7 +22,7 @@ developer_instructions = """
 - **Output header:** All lines above `<!-- verdict:end -->` MUST be machine-parseable.
 - **Example tools:** Tools and commands `docs/templates/bkit-plan.md` names are examples; write the project's own and drop what does not apply.
 - **Acceptance Scenario:** `Narrative` and `Success Criteria` come word for word from the first source that has them: the design's `## Acceptance Scenario`, else the issue's change-shape fields (`.bkit/trackers.md` § Issue shapes), else, for an audit-only plan, the user or operator impact of the in-scope findings. With no source, both read `⚠️ MISSING: no design doc, no issue Narrative and no audit report — human must provide before plan proceeds`; never invent them. `Narrative` is 1-2 sentences from the user's side: what they do and what they get back. `Success Criteria` are at most 5 measurable outcomes, not steps; an audit plan has one per in-scope finding id, from its `Expected`, with no cap. `Context & Goals` does not repeat them.
-- **Scenario detail:** `Process Sketch` restates the `Concrete Example` and `Edge Cases` as 3-7 `WHEN X → THEN Y` outcome lines, with no new examples. `Concrete Example` is one scenario: role, starting state, numbered steps, observable outcome. `Edge Cases` keep the design's Key Edge Cases, else the issue's rows, word for word, and add validation, error and boundary cases. `Derived Test Matrix` has one row per testable behaviour, each with a target file and mapped to exactly one runbook task; issue rows stay word for word, and each in-scope audit behaviour has a row.
+- **Scenario detail:** `Process Sketch` restates the `Concrete Example` and `Edge Cases` as 3-7 `WHEN X → THEN Y` outcome lines, with no new examples. `Concrete Example` is one scenario: role, starting state, numbered steps, observable outcome. `Edge Cases` keep the design's Key Edge Cases, else the issue's rows, word for word, and add validation, error and boundary cases. `Derived Test Matrix` has one row per testable behaviour, each with a target file and a `Task` cell naming the one runbook task that lands its test; issue rows stay word for word, and each in-scope audit behaviour has a row.
 - **Test tiers:** A `Derived Test Matrix` row's `Type` is a tier name exactly as `docs/testing.md` writes it, picked by its tier-selection rubric: the lowest tier that exercises the behaviour, or several. Boundary rows reach the real boundary and assert a ground-truth signal, with `@live` for an external or deployed boundary.
 - **Open questions:** Each open question gives 2-3 options with their trade-offs as the lettered `Options: A) {option} — {trade-off} · B) …`, a `Recommended` naming the chosen letter and the default if unanswered; the design's options and recommendation carry forward where it already answered. Each assumption names what breaks if it is wrong.
 - **Out of Scope:** Plan work is in scope by default. An `Out of Scope` row is `Exempt` only when no `Success Criteria`, `Acceptance Scenario`, `Derived Test Matrix` row or design item (non-goals aside) needs it, and it says why and where the item belongs. Required work parked there is a `Blocking` deferral and belongs in the runbook. Each `Exempt` row has a matching `docs/deferrals.jsonl` row; an audit `LOW` finding left out is an `Exempt` row.
diff --git a/.codex/agents/bkit-ship-deferred-sweep.toml b/.codex/agents/bkit-ship-deferred-sweep.toml
index 4f7d0363b..6d6e4c833 100644
--- a/.codex/agents/bkit-ship-deferred-sweep.toml
+++ b/.codex/agents/bkit-ship-deferred-sweep.toml
@@ -54,14 +54,15 @@ developer_instructions = """
      - **If** shipped surfaces instruct consumers to run something that fails at runtime → mark item `Blocked`.
    - Any `Blocked` items → move to `Blocking Deferrals` and append test details with source evidence → set `Verdict` = `FAIL` via `Edit` immediately; do not defer to final pass.
    - Any leftover `Planned` items → mark items `Lazy` → move to `Lazy Deferrals` → append deferral rows to `docs/deferrals.jsonl` with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom); check existing entries first; set `reason` to `unjustified`, set `status` to `TRIAGED`.
-8. Scan supplied diff for any disabled tests (`.skip` / `.todo` / `.fixme` / `xfail`, `t.Skip()`, `#[ignore]`, `@Disabled` added, or assertions deleted); skips predating supplied diff do not count → record all under `Blocking Deferrals` with source evidence (`file:line`, test name) → set `Verdict` = `FAIL` via `Edit` immediately; do not defer to final pass.
-9. Scan `docs/deferrals.jsonl` for any plan related entries including recently appended rows → verify each `reason` holds at ship time as per `.bkit/jsonl.md` deferral reason tests; `reason` = `low-severity` with `severity` = `LOW` holds without the tests:
-   - **If** holds → record under / move to `Exempt Deferrals` → continue; append no row, `reason` is set once and carried verbatim.
-   - **Else** → record under / keep under `Lazy Deferrals` → append row to `docs/deferrals.jsonl` with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom), same `key` and prior fields verbatim, set `reason` to `unjustified`, set `status` to `TRIAGED`, `description` naming failed deferral tests.
+8. Scan the run's diff for disabled tests with `bkit branches scan-diff --disabled-tests --base=` the diff base your Context names — its `disabled` list holds each hit's `file:line` and test name → **If** exit 1 → record every entry under `Blocking Deferrals` with source evidence (`file:line`, test name) → set `Verdict` = `FAIL` via `Edit` immediately; do not defer to final pass.
+9. Bucket the plan-related deferral rows of the FID in your Context with `bkit ledgers triage --fid=` the FID in your Context `--plan=` the plan file. The verb applies the deferral tests and writes every `unjustified` / `TRIAGED` row itself; each of its `rows` carries the row's `key`, its `bucket` and the test result:
+   - **If** `bucket` = `Exempt` → record under / move to `Exempt Deferrals`; the row stands as written.
+   - **Else** → record under / keep under `Lazy Deferrals`, naming the tests the verb reports for it.
+   - **If** the plan file is absent → nothing to test against; record each plan-related row under `Exempt Deferrals` naming the missing plan.
 10. Update **Create** — set `Failures` via `Edit` = `Blocking Deferrals` entry count; set `Lazy` via `Edit` = `Lazy Deferrals` entry count.
 11. Update **Create** — set `Verdict` via `Edit`; mapping:
     - `PASS` = no remaining `Planned` items; every intended deliverable `Delivered`, `Exempt`, or `Lazy`; no `Blocking Deferrals`.
-    - `FAIL` = any intended deliverables `Blocked`; any tests in supplied diff disabled; any `Blocking Deferrals`.
+    - `FAIL` = any intended deliverables `Blocked`; any test the run's diff disabled; any `Blocking Deferrals`.
 
 **Output format:**
 
@@ -80,7 +81,7 @@ Lazy: <integer >= 0>
 
 ## Blocking Deferrals
 
-[Unmet deliverables that passed any blocking tests, and every test supplied diff disabled; per entry: test details with source evidence (`file:line`, test, grep); blocks merge. **If** none → `None`; initially set to `PENDING`.]
+[Unmet deliverables that passed any blocking tests, and every test the run's diff disabled; per entry: test details with source evidence (`file:line`, test, grep); blocks merge. **If** none → `None`; initially set to `PENDING`.]
 
 ## Exempt Deferrals
 
diff --git a/.codex/agents/bkit-ship-update-docs.toml b/.codex/agents/bkit-ship-update-docs.toml
index a6f55b4a0..858bf95a7 100644
--- a/.codex/agents/bkit-ship-update-docs.toml
+++ b/.codex/agents/bkit-ship-update-docs.toml
@@ -47,7 +47,7 @@ developer_instructions = """
 4. Per doc, always follow its `Rules` headers when making edits.
 5. Per doc, four passes in order: Sync content (gaps vs implementation) → reorganize structure (dedupe, move misplaced) → compress wording (more token-efficient) → update cross-references (inline `docs/*.md` links).
 6. Ensure agent memories (`MEMORY.md` / `memory/*.md`) do not duplicate content and only contain pointers (path, section, one-line hook) to relevant `docs/*.md` sections / `docs/*.jsonl` entries. **If** memory contains duplicate / stale content → update memory.
-7. Grep `docs/deferrals.jsonl` for `{FID}` matches → surface in output `Pending Items` for human review (do not write `docs/deferrals.jsonl`).
+7. Fill `Pending Items` from the `ship-pending-items.md` deferral scan supplied in your Read paths, one entry per line (do not write `docs/deferrals.jsonl`).
 8. Produce **Create** output.
 
 **Output format:**
@@ -65,7 +65,7 @@ developer_instructions = """
 
 ## Pending Items
 
-[`{FID}` matches in `docs/deferrals.jsonl` for human review. **If** no matches → `None`.]
+[`{FID}` matches from the `ship-pending-items.md` deferral scan, for human review. **If** no matches → `None`.]
 
 ## Blockers
 
diff --git a/.cursor/agents/bkit-build-plan-convert.md b/.cursor/agents/bkit-build-plan-convert.md
index 8978760fd..00e9d2bb0 100644
--- a/.cursor/agents/bkit-build-plan-convert.md
+++ b/.cursor/agents/bkit-build-plan-convert.md
@@ -31,6 +31,7 @@ tools:
 - **Input dates:** Where two sections of the `*-input-*.md` file disagree, the newer one wins; older text still counts wherever nothing newer contradicts it.
 - **Same scope:** Every task traces to the input file or the existing plan; add no work they do not ask for, drop none they do.
 - **No anchor authoring:** Do not author `<!-- bkit:anchor` block; keep an existing one byte-for-byte.
+- **Matrix shape:** The plan's `Derived Test Matrix` has a `Task` column beside `Test description`, `Type` and `Target file`; each cell names the one runbook task that lands that row's test.
 - **Runbook tasks:** The runbook is groups of task blocks in build order (schema, then API, then UI). A group is `<!-- bkit:group N start -->`, `### GROUP N: {title}`, its task blocks and `<!-- bkit:group N end -->`, holding tasks and `TEST FIRST` tests within the per-group plan caps your Context names (`bkit.workflows.tasks`: tasks, and `TEST FIRST` tests in all); bigger → split the group. A task is `<!-- bkit:task N start -->`, `- [ ] **TASK N:** {title}`, one sub-bullet per field and `<!-- bkit:task N end -->`, its number unique across the plan. Fields, uppercase: `**CREATE:**` / `**READ:**` / `**UPDATE:**` / `**DELETE:**` (`` `{symbol}` in `{file}`: {what} `` or `` `{file}`: {what} ``, one line per reference), `**DEPENDS ON:**` (task numbers, same or earlier group), `**DONE WHEN:**`, `**TEST FIRST:**`, `**TEST EXCEPTION:**`; `bkit tests plan-check` refuses task-like text outside every block. `DONE WHEN` is short, testable and checkable in the codebase (a file exists, a signature matches, a test passes, a behaviour shows). A task that adds or changes logic names its own tests and fixes the tests it breaks; no task leaves its tests to a later one. Behaviour tests come only from `Derived Test Matrix` rows, and a task crossing a boundary (DB, API, model, network, migration) pairs them with non-mock tests. An audit plan has one task per in-scope finding id; tasks group findings only on one shared root cause and still name every id.
 - **TEST FIRST:** Each task carries a `**TEST FIRST:**` field after `DONE WHEN`. A behaviour change at the unit or integration tier lists one or more tests, within the per-task plan caps your Context names (tests, test files), one sub-bullet per test, each `` `{test file}` `` `` `{test name}` `` fails on {what goes wrong}: a repo-relative test file, the test name as the runner reports it or its last segments, and {what goes wrong} as the wrong behaviour a stub shows, not a literal assertion. More tests or files → split the task. No behaviour change (docs, config, pure refactor) or E2E / `@live` tier only → `n/a — {reason naming which}` on the field line.
 - **TEST EXCEPTION:** ONLY the human writes a `**TEST EXCEPTION:**` field, or the build orchestrator after the human approves it; never write one on your own judgement. It sits inside the task's block, with entries in `TEST FIRST` form each ending `— {reason}`.
diff --git a/.cursor/agents/bkit-build-plan-current.md b/.cursor/agents/bkit-build-plan-current.md
index 7d8f720f5..0551dcc8d 100644
--- a/.cursor/agents/bkit-build-plan-current.md
+++ b/.cursor/agents/bkit-build-plan-current.md
@@ -53,11 +53,11 @@ tools:
 2. Re-read all supplied inputs once at session start; do not trust session memory.
 3. Read `.agents/docs.md` → load docs for workflow / step / task; skip missing.
 4. Update **Create** after each affected task — append log at EOF via Bash `echo {log entry} >> {output}`; heredoc for multi-line. **If** any task `Broken` → set `Verdict` = `FAIL` via `Edit` immediately; do not defer to final pass.
-5. Per plan task block, record paths, symbols, and commands its `CREATE` / `READ` / `UPDATE` / `DELETE` and `DONE WHEN` fields depend on → in-scope set.
-6. Run `git diff --name-only {BASE_SHA}..origin/dev` → changed-path list. Task matches on any in-scope path in that list. For each task with no path match run `git diff {BASE_SHA}..origin/dev -S{needle} --name-only` per in-scope symbol and command; non-empty output → matched on that needle:
-   - **If** no tasks match → no affected tasks; do not read any diff.
-   - **Else** → continue with matched tasks only.
-7. Per matched task, run `git diff {BASE_SHA}..origin/dev -- {path}` for its matched paths and read it; needle match → paths named by that needle `-S` output; never diff whole range; never read paths outside match set.
+5. Per plan task block, record the paths, symbols, and commands its `CREATE` / `READ` / `UPDATE` / `DELETE` and `DONE WHEN` fields depend on → in-scope set.
+6. Run `bkit tasks currency --plan={plan file} --base={BASE_SHA} --against=origin/dev` → each task whose in-scope path or symbol moved in `{BASE_SHA}...origin/dev`, with its matched paths, needles and diff hunks:
+   - **If** no task is printed → no affected tasks; do not read any diff.
+   - **Else** → continue with the printed tasks only.
+7. Read the diff hunks `currency` printed for each matched task; never read a path outside its matched set.
 8. Per matched task, decide against diff — `Executable` tasks are not findings and are not logged:
    - `Executable` = landed changes leave task approach intact.
    - `Reword` = task approach holds; paths, symbols, or commands task names have moved and wording no longer matches.
diff --git a/.cursor/agents/bkit-build-plan-verify.md b/.cursor/agents/bkit-build-plan-verify.md
index 70df03feb..841e48556 100644
--- a/.cursor/agents/bkit-build-plan-verify.md
+++ b/.cursor/agents/bkit-build-plan-verify.md
@@ -26,7 +26,7 @@ tools:
 **Contract:** The terms between this agent and whoever runs it.
 
 - **Read / Update / Create:** Use any appended Read / Update / Create as exact I/O paths.
-- **Mandate:** Verify plan implementation; change plan only to mark tasks done; do not build, install, or write code.
+- **Mandate:** Verify plan implementation and pass the task numbers you judged satisfied on the header's `Tasks` line; never edit the plan; do not build, install, or write code.
 - **No commits:** Do not run `git commit` / `git add` / `git push` (caller does).
 - **Output header:** All lines above `<!-- verdict:end -->` MUST be machine-parseable.
 - **Runbook tasks:** The runbook is groups of task blocks in build order (schema, then API, then UI). A group is `<!-- bkit:group N start -->`, `### GROUP N: {title}`, its task blocks and `<!-- bkit:group N end -->`, holding tasks and `TEST FIRST` tests within the per-group plan caps your Context names (`bkit.workflows.tasks`: tasks, and `TEST FIRST` tests in all); bigger → split the group. A task is `<!-- bkit:task N start -->`, `- [ ] **TASK N:** {title}`, one sub-bullet per field and `<!-- bkit:task N end -->`, its number unique across the plan. Fields, uppercase: `**CREATE:**` / `**READ:**` / `**UPDATE:**` / `**DELETE:**` (`` `{symbol}` in `{file}`: {what} `` or `` `{file}`: {what} ``, one line per reference), `**DEPENDS ON:**` (task numbers, same or earlier group), `**DONE WHEN:**`, `**TEST FIRST:**`, `**TEST EXCEPTION:**`; `bkit tests plan-check` refuses task-like text outside every block. `DONE WHEN` is short, testable and checkable in the codebase (a file exists, a signature matches, a test passes, a behaviour shows). A task that adds or changes logic names its own tests and fixes the tests it breaks; no task leaves its tests to a later one. Behaviour tests come only from `Derived Test Matrix` rows, and a task crossing a boundary (DB, API, model, network, migration) pairs them with non-mock tests. An audit plan has one task per in-scope finding id; tasks group findings only on one shared root cause and still name every id.
@@ -58,26 +58,21 @@ tools:
 1. Initialise **Create** output stub with `PENDING` placeholders.
 2. Re-read all supplied inputs once at session start; do not trust session memory.
 3. Read `.agents/docs.md` → load docs for workflow / step / task; skip missing.
-4. Update **Create** — replace each `PENDING` via `Edit` as content becomes available. Per gap — append log at EOF via Bash `echo {log entry} >> {output}`; heredoc for multi-line; each entry ends `— Fixable: true` or `— Fixable: false` (by gap-remediate). **If** any gap `Fixable: false` → set `Verdict` = `FAIL` via `Edit` immediately; do not defer to final pass.
+4. Update **Create** — replace each `PENDING` via `Edit` as content becomes available. Per gap — append log at EOF via Bash `echo {log entry} >> {output}`; heredoc for multi-line; `{log entry}` is the gap's report `logLine` with your decided `Fixable: true` / `Fixable: false` in place of the engine's `Fixable: null`; each entry ends `— Fixable: true` or `— Fixable: false` (by gap-remediate). **If** any gap `Fixable: false` → set `Verdict` = `FAIL` via `Edit` immediately; do not defer to final pass.
 5. Determine `Mode` from input Context (`Group` or `Holistic`).
-6. **If** `Group` → the supplied briefs' task blocks are the work; judge them against the supplied group diff (the changes since the group started), not the whole branch; a brief's `Deviations` section holds the owner's run instructions → judge the tasks it names as it directs. Every task field and gate maps to real codebase changes. Find missing components, skipped steps, unimplemented edge cases. Cross-reference the tasks vs the execute log's `DONE — TASK {N}` lines; a `DONE` line is a claim to check, never proof.
-7. **If** `Holistic` → same task / gate / `DONE` log cross-reference across every group of the plan, plus integration: groups' components work together? API contracts match? Shared state consistent? Cross-domain boundaries respected? Run `pnpm bkit:gate:static-unit`.
-8. **If** test-first audit report supplied (`Enforced` / `Gaps` header) → map its gaps per task:
-   - `not-green` → `Fixable: true`.
+6. **If** `Group` → the supplied briefs' task blocks are the work; judge them against the supplied group diff (the changes since the group started), not the whole branch; a brief's `Deviations` section holds the owner's run instructions → judge the tasks it names as it directs. Every task field and gate maps to real codebase changes. Find missing components, skipped steps, unimplemented edge cases.
+7. **If** `Holistic` → the same task and gate check across every group of the plan, plus integration: groups' components work together? API contracts match? Shared state consistent? Cross-domain boundaries respected? Run `pnpm bkit:gate:static-unit`.
+8. **If** test-first audit report supplied (`Enforced` / `Verdict` / `Gaps` header) → decide each gap: its `fixable` stands unless `null`, and a `null` one you decide from the diff it names:
    - `delete-still-referenced` → read each hit; a different thing with the same name → no gap; else `Fixable: true`.
    - `test-changed` → read its diff; only formatting → no gap; weakened, removed or rewritten assertions → `Fixable: false`.
-   - Row `Changed since red` = `added lines only` → read its diff; any line added inside a planned test or in setup it runs (`beforeEach`, fixture, mock) → `test-changed` gap, `Fixable: false`; added lines only outside every planned test → no gap.
+   - `test-changed` on a row whose `Changed since red` = `added lines only` → read its diff; any line added inside a planned test or in setup it runs (`beforeEach`, fixture, mock) → `Fixable: false`; added lines only outside every planned test → no gap.
    - `red-mismatch` → recorded test is the planned one renamed or moved **and** passes now → no gap, nor for that test's `not-green`; else `Fixable: false`.
-   - `no-red` on a task the plan-currency report classifies `Broken` with work already landed **and** the execute log records `DONE — TASK {N}: already landed` → no gap.
-   - `no-red`, `late-red`, `no-test-first`, `test-first-malformed`, `test-first-unread`, `red-evidence-missing`, `exception-refused` → `Fixable: false`.
-   - Test-order gap (`no-red`, `late-red`, `red-mismatch`, `red-evidence-missing`, `test-changed`) → log as ``TASK {N}: `{test file}` `{test name}` — {kind} — Fixable: false``.
+   - `no-red` on a task the plan-currency report classifies `Broken` with work already landed **and** the execute log records `DONE — TASK {N}: already landed` → no gap, overriding the gap's `Fixable: false`.
    - `Enforced: false` → reason in `Notes`; no gap.
    - `Late-red check` section → each task not checked in `Notes`; no gap.
-9. Per task → assert codebase satisfies `DONE WHEN` (file exists, signature matches, test passes, observable behaviour) and has no test-first audit gap; `BLOCKED` log lines, `docs/deferrals.jsonl` rows, and out-of-scope notes never satisfy it; gaps a supplied decision record accepts (`Decision: Accept`, or `Decision: Accept (assumed)`) are no gap (name the record in `Notes`; an assumed accept is taken without the owner, so add `assumed, not the owner's acceptance`). **If** satisfied → tick its `- [ ] **TASK {N}:**` line `[x]` in the plan file; tick nothing else. **If** not satisfied or missing → leave `[ ]`, append log; **If** the gap is `Fixable: false` → set `Verdict` = `FAIL` via `Edit` immediately; do not defer to final pass.
-10. Update **Create** — set `Failures` via `Edit` = count of unresolved gaps; set `Fixable` via `Edit` = `true` when any of those is `Fixable: true`, else `false`; set `Verdict` via `Edit`; mapping:
-    - `PASS` = no gaps.
-    - `FAIL` = any gap `Fixable: false`.
-    - `CONCERNS` = every gap `Fixable: true`.
+   - A gap you leave `Fixable: false` is a `FAIL`.
+9. Per task → assert codebase satisfies `DONE WHEN` (file exists, signature matches, test passes, observable behaviour) and has no test-first audit gap; `BLOCKED` log lines, `docs/deferrals.jsonl` rows, and out-of-scope notes never satisfy it; gaps a supplied decision record accepts (`Decision: Accept`, or `Decision: Accept (assumed)`) are no gap (name the record in `Notes`; an assumed accept is taken without the owner, so add `assumed, not the owner's acceptance`). **If** satisfied → name its number on the header's `Tasks` line; the workflow ticks the plan. **If** not satisfied or missing → leave it off that line, append log; **If** the gap is `Fixable: false` → set `Verdict` = `FAIL` via `Edit` immediately; do not defer to final pass.
+10. Update **Create** — set `Failures` via `Edit` = count of unresolved gaps; set `Fixable` via `Edit` = `true` when any of those is `Fixable: true`, else `false`; set `Verdict` via `Edit` = the roll-up over the `Fixable` you decided: any `false` → `FAIL`, **Else** any `true` → `CONCERNS`, **Else** → `PASS`; never the report's `null`.
 
 **Output format:**
 
@@ -85,6 +80,7 @@ tools:
 Verdict: PASS | CONCERNS | FAIL [Initially set to PENDING.]
 Failures: <integer >= 0>
 Fixable: true | false
+Tasks: <the task numbers you judged satisfied, comma-separated; none when there are none>
 
 <!-- verdict:end -->
 
diff --git a/.cursor/agents/bkit-plan-generate.md b/.cursor/agents/bkit-plan-generate.md
index 7247c1d15..2045623a9 100644
--- a/.cursor/agents/bkit-plan-generate.md
+++ b/.cursor/agents/bkit-plan-generate.md
@@ -36,7 +36,7 @@ tools:
 - **Related Issues:** List tracker references from the plan input as `#N — title (state)`, not their content; they help dedupe and do not add scope. None → `None`.
 - **Example tools:** Tools and commands `docs/templates/bkit-plan.md` names are examples; write the project's own and drop what does not apply.
 - **Acceptance Scenario:** `Narrative` and `Success Criteria` come word for word from the first source that has them: the design's `## Acceptance Scenario`, else the issue's change-shape fields (`.bkit/trackers.md` § Issue shapes), else, for an audit-only plan, the user or operator impact of the in-scope findings. With no source, both read `⚠️ MISSING: no design doc, no issue Narrative and no audit report — human must provide before plan proceeds`; never invent them. `Narrative` is 1-2 sentences from the user's side: what they do and what they get back. `Success Criteria` are at most 5 measurable outcomes, not steps; an audit plan has one per in-scope finding id, from its `Expected`, with no cap. `Context & Goals` does not repeat them.
-- **Scenario detail:** `Process Sketch` restates the `Concrete Example` and `Edge Cases` as 3-7 `WHEN X → THEN Y` outcome lines, with no new examples. `Concrete Example` is one scenario: role, starting state, numbered steps, observable outcome. `Edge Cases` keep the design's Key Edge Cases, else the issue's rows, word for word, and add validation, error and boundary cases. `Derived Test Matrix` has one row per testable behaviour, each with a target file and mapped to exactly one runbook task; issue rows stay word for word, and each in-scope audit behaviour has a row.
+- **Scenario detail:** `Process Sketch` restates the `Concrete Example` and `Edge Cases` as 3-7 `WHEN X → THEN Y` outcome lines, with no new examples. `Concrete Example` is one scenario: role, starting state, numbered steps, observable outcome. `Edge Cases` keep the design's Key Edge Cases, else the issue's rows, word for word, and add validation, error and boundary cases. `Derived Test Matrix` has one row per testable behaviour, each with a target file and a `Task` cell naming the one runbook task that lands its test; issue rows stay word for word, and each in-scope audit behaviour has a row.
 - **Test tiers:** A `Derived Test Matrix` row's `Type` is a tier name exactly as `docs/testing.md` writes it, picked by its tier-selection rubric: the lowest tier that exercises the behaviour, or several. Boundary rows reach the real boundary and assert a ground-truth signal, with `@live` for an external or deployed boundary.
 - **Open questions:** Each open question gives 2-3 options with their trade-offs as the lettered `Options: A) {option} — {trade-off} · B) …`, a `Recommended` naming the chosen letter and the default if unanswered; the design's options and recommendation carry forward where it already answered. Each assumption names what breaks if it is wrong.
 - **Out of Scope:** Plan work is in scope by default. An `Out of Scope` row is `Exempt` only when no `Success Criteria`, `Acceptance Scenario`, `Derived Test Matrix` row or design item (non-goals aside) needs it, and it says why and where the item belongs. Required work parked there is a `Blocking` deferral and belongs in the runbook. Each `Exempt` row has a matching `docs/deferrals.jsonl` row; an audit `LOW` finding left out is an `Exempt` row.
diff --git a/.cursor/agents/bkit-plan-review-1.md b/.cursor/agents/bkit-plan-review-1.md
index 50787713b..0bc5276e9 100644
--- a/.cursor/agents/bkit-plan-review-1.md
+++ b/.cursor/agents/bkit-plan-review-1.md
@@ -31,7 +31,7 @@ tools:
 - **Lens discipline:** Stay within Process-defined lens; out-of-lens findings not in remit.
 - **Output header:** All lines above `<!-- verdict:end -->` MUST be machine-parseable.
 - **Acceptance Scenario:** `Narrative` and `Success Criteria` come word for word from the first source that has them: the design's `## Acceptance Scenario`, else the issue's change-shape fields (`.bkit/trackers.md` § Issue shapes), else, for an audit-only plan, the user or operator impact of the in-scope findings. With no source, both read `⚠️ MISSING: no design doc, no issue Narrative and no audit report — human must provide before plan proceeds`; never invent them. `Narrative` is 1-2 sentences from the user's side: what they do and what they get back. `Success Criteria` are at most 5 measurable outcomes, not steps; an audit plan has one per in-scope finding id, from its `Expected`, with no cap. `Context & Goals` does not repeat them.
-- **Scenario detail:** `Process Sketch` restates the `Concrete Example` and `Edge Cases` as 3-7 `WHEN X → THEN Y` outcome lines, with no new examples. `Concrete Example` is one scenario: role, starting state, numbered steps, observable outcome. `Edge Cases` keep the design's Key Edge Cases, else the issue's rows, word for word, and add validation, error and boundary cases. `Derived Test Matrix` has one row per testable behaviour, each with a target file and mapped to exactly one runbook task; issue rows stay word for word, and each in-scope audit behaviour has a row.
+- **Scenario detail:** `Process Sketch` restates the `Concrete Example` and `Edge Cases` as 3-7 `WHEN X → THEN Y` outcome lines, with no new examples. `Concrete Example` is one scenario: role, starting state, numbered steps, observable outcome. `Edge Cases` keep the design's Key Edge Cases, else the issue's rows, word for word, and add validation, error and boundary cases. `Derived Test Matrix` has one row per testable behaviour, each with a target file and a `Task` cell naming the one runbook task that lands its test; issue rows stay word for word, and each in-scope audit behaviour has a row.
 - **Open questions:** Each open question gives 2-3 options with their trade-offs as the lettered `Options: A) {option} — {trade-off} · B) …`, a `Recommended` naming the chosen letter and the default if unanswered; the design's options and recommendation carry forward where it already answered. Each assumption names what breaks if it is wrong.
 - **Out of Scope:** Plan work is in scope by default. An `Out of Scope` row is `Exempt` only when no `Success Criteria`, `Acceptance Scenario`, `Derived Test Matrix` row or design item (non-goals aside) needs it, and it says why and where the item belongs. Required work parked there is a `Blocking` deferral and belongs in the runbook. Each `Exempt` row has a matching `docs/deferrals.jsonl` row; an audit `LOW` finding left out is an `Exempt` row.
 - **Suggested Scope Expansion:** List prior work overlapping the plan's surfaces as candidates (related open issues, open `docs/deferrals.jsonl` and `docs/failures.jsonl` rows, audit findings the input did not name), each with source, overlap and recommendation. Candidates are for the human, not runbook tasks; one joins the plan only through design scope or a human decision, and then leaves the list.
diff --git a/.cursor/agents/bkit-plan-scope-check.md b/.cursor/agents/bkit-plan-scope-check.md
index 22b654cb4..8be01a482 100644
--- a/.cursor/agents/bkit-plan-scope-check.md
+++ b/.cursor/agents/bkit-plan-scope-check.md
@@ -31,7 +31,7 @@ tools:
 - **Lens discipline:** Stay within Process-defined lens; out-of-lens findings not in remit.
 - **Output header:** All lines above `<!-- verdict:end -->` MUST be machine-parseable.
 - **Acceptance Scenario:** `Narrative` and `Success Criteria` come word for word from the first source that has them: the design's `## Acceptance Scenario`, else the issue's change-shape fields (`.bkit/trackers.md` § Issue shapes), else, for an audit-only plan, the user or operator impact of the in-scope findings. With no source, both read `⚠️ MISSING: no design doc, no issue Narrative and no audit report — human must provide before plan proceeds`; never invent them. `Narrative` is 1-2 sentences from the user's side: what they do and what they get back. `Success Criteria` are at most 5 measurable outcomes, not steps; an audit plan has one per in-scope finding id, from its `Expected`, with no cap. `Context & Goals` does not repeat them.
-- **Scenario detail:** `Process Sketch` restates the `Concrete Example` and `Edge Cases` as 3-7 `WHEN X → THEN Y` outcome lines, with no new examples. `Concrete Example` is one scenario: role, starting state, numbered steps, observable outcome. `Edge Cases` keep the design's Key Edge Cases, else the issue's rows, word for word, and add validation, error and boundary cases. `Derived Test Matrix` has one row per testable behaviour, each with a target file and mapped to exactly one runbook task; issue rows stay word for word, and each in-scope audit behaviour has a row.
+- **Scenario detail:** `Process Sketch` restates the `Concrete Example` and `Edge Cases` as 3-7 `WHEN X → THEN Y` outcome lines, with no new examples. `Concrete Example` is one scenario: role, starting state, numbered steps, observable outcome. `Edge Cases` keep the design's Key Edge Cases, else the issue's rows, word for word, and add validation, error and boundary cases. `Derived Test Matrix` has one row per testable behaviour, each with a target file and a `Task` cell naming the one runbook task that lands its test; issue rows stay word for word, and each in-scope audit behaviour has a row.
 - **Open questions:** Each open question gives 2-3 options with their trade-offs as the lettered `Options: A) {option} — {trade-off} · B) …`, a `Recommended` naming the chosen letter and the default if unanswered; the design's options and recommendation carry forward where it already answered. Each assumption names what breaks if it is wrong.
 - **Out of Scope:** Plan work is in scope by default. An `Out of Scope` row is `Exempt` only when no `Success Criteria`, `Acceptance Scenario`, `Derived Test Matrix` row or design item (non-goals aside) needs it, and it says why and where the item belongs. Required work parked there is a `Blocking` deferral and belongs in the runbook. Each `Exempt` row has a matching `docs/deferrals.jsonl` row; an audit `LOW` finding left out is an `Exempt` row.
 - **Reuse Inventory:** Each capability the plan introduces has a `Reuse Inventory` row, written before `Architecture & Component Changes`, recording the searches run (in-repo text and symbol search, framework built-ins, current practice) and a decision. The default is `EXTEND`: a `[MODIFY]` of the named file plus a runbook task. `NEW` needs one reason: (a) the searches find no candidate, (b) extending breaks the candidate's contract or callers, both named, or (c) the candidate is a `Supersession Inventory` `DELETE`. A cleaner fresh start or a messy or close-but-different candidate is no reason, and a row with no search is unsearched, not `NEW`. Each `[NEW]` file carries its row's reason. Each row names the file it decides in `File`, and each task `CREATE` file needs a `NEW` row naming it.
@@ -66,17 +66,15 @@ tools:
 6. **If** `Acceptance Scenario` or `Derived Test Matrix` sections missing / vague → `CRITICAL`. Any `Open Questions & Assumptions` question breaking **Open questions** above → `OPTIONAL` findings naming missing parts.
 7. Verify every `Agent Execution Runbook` task has scope and verification step.
 8. Verify every scope item has both build task and verification task.
-9. Verify `Derived Test Matrix` ↔ `Agent Execution Runbook`: rows map 1:1 (bidirectional) to verification tasks. Gaps → `CRITICAL` finding naming the task or row to add.
-10. Identify gaps, edge cases, untested assumptions, missing error handling.
-11. Replaced / superseded code → `Supersession Inventory` with DELETE / RETAIN-with-REASON. Missing → `CRITICAL`.
-12. Introduced capability → `Reuse Inventory` row per **Reuse Inventory** above. Missing row, empty `Search performed`, rejected `NEW` reason, or untraced `[NEW]` / `EXTEND` row → `CRITICAL`.
-13. `Out of Scope` entries `Exempt` per **Out of Scope** above. Required work parked out of scope = `Blocking` → `CRITICAL`.
-14. No task scopes edits inside `bkit:start` / `bkit:end` blocks; always edit below `bkit:end`.
-15. Sort findings into the three categories `CRITICAL`, `OPTIONAL` and `OUT OF SCOPE`.
-16. Update **Create** — set `Failures` via `Edit` = `CRITICAL` count; do not count incomplete findings.
-17. Update **Create** — set `Verdict` via `Edit`; mapping:
+9. Identify gaps, edge cases, untested assumptions, missing error handling.
+10. Introduced capability → `Reuse Inventory` row per **Reuse Inventory** above. Missing row, empty `Search performed`, rejected `NEW` reason, or untraced `[NEW]` / `EXTEND` row → `CRITICAL`.
+11. `Out of Scope` entries `Exempt` per **Out of Scope** above. Required work parked out of scope = `Blocking` → `CRITICAL`.
+12. No task scopes edits inside `bkit:start` / `bkit:end` blocks; always edit below `bkit:end`.
+13. Sort findings into the three categories `CRITICAL`, `OPTIONAL` and `OUT OF SCOPE`.
+14. Update **Create** — set `Failures` via `Edit` = `CRITICAL` count; do not count incomplete findings.
+15. Update **Create** — set `Verdict` via `Edit`; mapping:
     - `PASS` = scope complete.
-    - `FAIL` = matrix-to-runbook mapping no plan edit recovers; every other gap → `CRITICAL`.
+    - `FAIL` = a `Blocking` out-of-scope deferral no plan edit recovers; every other gap → `CRITICAL`.
     - `CONCERNS` = `CRITICAL` gaps (apply via plan-update).
 
 **Output format:**
@@ -93,7 +91,7 @@ Lens: Scope, criteria, verification audit.
 
 ## CRITICAL
 
-[Gaps that block plan progress — missing / vague `Acceptance Scenario` or `Derived Test Matrix`, missing build task, missing verification task, broken matrix-to-runbook mapping, missing supersession-inventory entry, scope creep currently in plan to be removed, `Blocking` out-of-scope deferral; initially set to `PENDING`.]
+[Gaps that block plan progress — missing / vague `Acceptance Scenario` or `Derived Test Matrix`, missing build task, missing verification task, missing traceability between a capability and its `Reuse Inventory` row, scope creep currently in plan to be removed, `Blocking` out-of-scope deferral; initially set to `PENDING`.]
 
 ## OPTIONAL
 
diff --git a/.cursor/agents/bkit-plan-update.md b/.cursor/agents/bkit-plan-update.md
index 19b16f13a..2d37e454d 100644
--- a/.cursor/agents/bkit-plan-update.md
+++ b/.cursor/agents/bkit-plan-update.md
@@ -31,7 +31,7 @@ tools:
 - **Output header:** All lines above `<!-- verdict:end -->` MUST be machine-parseable.
 - **Example tools:** Tools and commands `docs/templates/bkit-plan.md` names are examples; write the project's own and drop what does not apply.
 - **Acceptance Scenario:** `Narrative` and `Success Criteria` come word for word from the first source that has them: the design's `## Acceptance Scenario`, else the issue's change-shape fields (`.bkit/trackers.md` § Issue shapes), else, for an audit-only plan, the user or operator impact of the in-scope findings. With no source, both read `⚠️ MISSING: no design doc, no issue Narrative and no audit report — human must provide before plan proceeds`; never invent them. `Narrative` is 1-2 sentences from the user's side: what they do and what they get back. `Success Criteria` are at most 5 measurable outcomes, not steps; an audit plan has one per in-scope finding id, from its `Expected`, with no cap. `Context & Goals` does not repeat them.
-- **Scenario detail:** `Process Sketch` restates the `Concrete Example` and `Edge Cases` as 3-7 `WHEN X → THEN Y` outcome lines, with no new examples. `Concrete Example` is one scenario: role, starting state, numbered steps, observable outcome. `Edge Cases` keep the design's Key Edge Cases, else the issue's rows, word for word, and add validation, error and boundary cases. `Derived Test Matrix` has one row per testable behaviour, each with a target file and mapped to exactly one runbook task; issue rows stay word for word, and each in-scope audit behaviour has a row.
+- **Scenario detail:** `Process Sketch` restates the `Concrete Example` and `Edge Cases` as 3-7 `WHEN X → THEN Y` outcome lines, with no new examples. `Concrete Example` is one scenario: role, starting state, numbered steps, observable outcome. `Edge Cases` keep the design's Key Edge Cases, else the issue's rows, word for word, and add validation, error and boundary cases. `Derived Test Matrix` has one row per testable behaviour, each with a target file and a `Task` cell naming the one runbook task that lands its test; issue rows stay word for word, and each in-scope audit behaviour has a row.
 - **Test tiers:** A `Derived Test Matrix` row's `Type` is a tier name exactly as `docs/testing.md` writes it, picked by its tier-selection rubric: the lowest tier that exercises the behaviour, or several. Boundary rows reach the real boundary and assert a ground-truth signal, with `@live` for an external or deployed boundary.
 - **Open questions:** Each open question gives 2-3 options with their trade-offs as the lettered `Options: A) {option} — {trade-off} · B) …`, a `Recommended` naming the chosen letter and the default if unanswered; the design's options and recommendation carry forward where it already answered. Each assumption names what breaks if it is wrong.
 - **Out of Scope:** Plan work is in scope by default. An `Out of Scope` row is `Exempt` only when no `Success Criteria`, `Acceptance Scenario`, `Derived Test Matrix` row or design item (non-goals aside) needs it, and it says why and where the item belongs. Required work parked there is a `Blocking` deferral and belongs in the runbook. Each `Exempt` row has a matching `docs/deferrals.jsonl` row; an audit `LOW` finding left out is an `Exempt` row.
diff --git a/.cursor/agents/bkit-ship-deferred-sweep.md b/.cursor/agents/bkit-ship-deferred-sweep.md
index e9f9e5195..df6c9695c 100644
--- a/.cursor/agents/bkit-ship-deferred-sweep.md
+++ b/.cursor/agents/bkit-ship-deferred-sweep.md
@@ -64,14 +64,15 @@ tools:
      - **If** shipped surfaces instruct consumers to run something that fails at runtime → mark item `Blocked`.
    - Any `Blocked` items → move to `Blocking Deferrals` and append test details with source evidence → set `Verdict` = `FAIL` via `Edit` immediately; do not defer to final pass.
    - Any leftover `Planned` items → mark items `Lazy` → move to `Lazy Deferrals` → append deferral rows to `docs/deferrals.jsonl` with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom); check existing entries first; set `reason` to `unjustified`, set `status` to `TRIAGED`.
-8. Scan supplied diff for any disabled tests (`.skip` / `.todo` / `.fixme` / `xfail`, `t.Skip()`, `#[ignore]`, `@Disabled` added, or assertions deleted); skips predating supplied diff do not count → record all under `Blocking Deferrals` with source evidence (`file:line`, test name) → set `Verdict` = `FAIL` via `Edit` immediately; do not defer to final pass.
-9. Scan `docs/deferrals.jsonl` for any plan related entries including recently appended rows → verify each `reason` holds at ship time as per `.bkit/jsonl.md` deferral reason tests; `reason` = `low-severity` with `severity` = `LOW` holds without the tests:
-   - **If** holds → record under / move to `Exempt Deferrals` → continue; append no row, `reason` is set once and carried verbatim.
-   - **Else** → record under / keep under `Lazy Deferrals` → append row to `docs/deferrals.jsonl` with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom), same `key` and prior fields verbatim, set `reason` to `unjustified`, set `status` to `TRIAGED`, `description` naming failed deferral tests.
+8. Scan the run's diff for disabled tests with `bkit branches scan-diff --disabled-tests --base=` the diff base your Context names — its `disabled` list holds each hit's `file:line` and test name → **If** exit 1 → record every entry under `Blocking Deferrals` with source evidence (`file:line`, test name) → set `Verdict` = `FAIL` via `Edit` immediately; do not defer to final pass.
+9. Bucket the plan-related deferral rows of the FID in your Context with `bkit ledgers triage --fid=` the FID in your Context `--plan=` the plan file. The verb applies the deferral tests and writes every `unjustified` / `TRIAGED` row itself; each of its `rows` carries the row's `key`, its `bucket` and the test result:
+   - **If** `bucket` = `Exempt` → record under / move to `Exempt Deferrals`; the row stands as written.
+   - **Else** → record under / keep under `Lazy Deferrals`, naming the tests the verb reports for it.
+   - **If** the plan file is absent → nothing to test against; record each plan-related row under `Exempt Deferrals` naming the missing plan.
 10. Update **Create** — set `Failures` via `Edit` = `Blocking Deferrals` entry count; set `Lazy` via `Edit` = `Lazy Deferrals` entry count.
 11. Update **Create** — set `Verdict` via `Edit`; mapping:
     - `PASS` = no remaining `Planned` items; every intended deliverable `Delivered`, `Exempt`, or `Lazy`; no `Blocking Deferrals`.
-    - `FAIL` = any intended deliverables `Blocked`; any tests in supplied diff disabled; any `Blocking Deferrals`.
+    - `FAIL` = any intended deliverables `Blocked`; any test the run's diff disabled; any `Blocking Deferrals`.
 
 **Output format:**
 
@@ -90,7 +91,7 @@ Lazy: <integer >= 0>
 
 ## Blocking Deferrals
 
-[Unmet deliverables that passed any blocking tests, and every test supplied diff disabled; per entry: test details with source evidence (`file:line`, test, grep); blocks merge. **If** none → `None`; initially set to `PENDING`.]
+[Unmet deliverables that passed any blocking tests, and every test the run's diff disabled; per entry: test details with source evidence (`file:line`, test, grep); blocks merge. **If** none → `None`; initially set to `PENDING`.]
 
 ## Exempt Deferrals
 
diff --git a/.cursor/agents/bkit-ship-update-docs.md b/.cursor/agents/bkit-ship-update-docs.md
index 804ebba3b..e6c02d9c9 100644
--- a/.cursor/agents/bkit-ship-update-docs.md
+++ b/.cursor/agents/bkit-ship-update-docs.md
@@ -57,7 +57,7 @@ tools:
 4. Per doc, always follow its `Rules` headers when making edits.
 5. Per doc, four passes in order: Sync content (gaps vs implementation) → reorganize structure (dedupe, move misplaced) → compress wording (more token-efficient) → update cross-references (inline `docs/*.md` links).
 6. Ensure agent memories (`MEMORY.md` / `memory/*.md`) do not duplicate content and only contain pointers (path, section, one-line hook) to relevant `docs/*.md` sections / `docs/*.jsonl` entries. **If** memory contains duplicate / stale content → update memory.
-7. Grep `docs/deferrals.jsonl` for `{FID}` matches → surface in output `Pending Items` for human review (do not write `docs/deferrals.jsonl`).
+7. Fill `Pending Items` from the `ship-pending-items.md` deferral scan supplied in your Read paths, one entry per line (do not write `docs/deferrals.jsonl`).
 8. Produce **Create** output.
 
 **Output format:**
@@ -75,7 +75,7 @@ tools:
 
 ## Pending Items
 
-[`{FID}` matches in `docs/deferrals.jsonl` for human review. **If** no matches → `None`.]
+[`{FID}` matches from the `ship-pending-items.md` deferral scan, for human review. **If** no matches → `None`.]
 
 ## Blockers
 
diff --git a/.cursor/commands/bkit-build.md b/.cursor/commands/bkit-build.md
index d8875960e..8b34038f9 100644
--- a/.cursor/commands/bkit-build.md
+++ b/.cursor/commands/bkit-build.md
@@ -129,7 +129,7 @@ Build Feature — Autonomous implementation
      - Test-order gap or `exception-refused` gap → a `- **TEST EXCEPTION:**` field as the last field of the task's block in `docs/plans/{YYYYMM}/{FID}-plan.md`, one sub-bullet per test in `TEST FIRST` form, each ending `— {human's reason} (owner, {YYYY-MM-DD})`; a task with no `TEST FIRST` → the field holds `{human's reason} (owner, {YYYY-MM-DD})` alone. The field replaces the task's existing `TEST EXCEPTION` field; NEVER add a second.
      - Other → append one `docs/decisions.jsonl` row with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom); `by.step` = `build-decision`; `summary` names `{FID}`, step `{PAUSE_STEP}` and the gap or finding; `rationale` = `accepted by owner: {human's reason}`. An item that is a challenge task → also tick it `[x]` in the plan and end its title with ` — accepted by owner`.
    - **Accept (assumed)** (written by `decisions apply`) → write nothing else: no `docs/decisions.jsonl` row, no `TEST EXCEPTION`. An item that is a challenge task → tick it `[x]` and end its title with ` — accepted (assumed)`. Ship asks the owner to confirm it.
-   - **Fix now** → an item that is a challenge task → keep that task open; it runs as it is. **Else** → write a task block (`docs/templates/bkit-plan.md` § Agent Execution Runbook) numbered one above the plan's highest task, with `**DONE WHEN:**` and `**TEST FIRST:**` (one sub-bullet per test, `` `{test file}` `{test name}` fails on {what goes wrong} ``); the human's direction, when given, shapes the task:
+   - **Fix now** → an item that is a challenge task → keep that task open; it runs as it is. **Else** → write a task block (`docs/templates/bkit-plan.md` § Agent Execution Runbook) numbered one above the plan's highest task, with `**DONE WHEN:**` and `**TEST FIRST:**` (one sub-bullet per test, `` `{test file}` `{test name}` fails on {what goes wrong} ``), and one `Derived Test Matrix` row per test in that `TEST FIRST` (``| {test name} | {tier} | `{test file}` | {task} |``, the tier its file's name gives); the human's direction, when given, shapes the task:
      - `From: verify` and group `{GROUP}` stays within `{MAX_TASKS_PER_GROUP}` tasks and `{MAX_TESTS_PER_GROUP}` `TEST FIRST` tests with it → inside group `{GROUP}`.
      - `From: verify`, over either cap → a new group right after `{GROUP}`; add 1 to every later group's number, in its markers and `### GROUP` heading.
      - `From: tests` or `From: challenge` → a new last group, each new group within the caps.
@@ -322,7 +322,7 @@ Build Feature — Autonomous implementation
    ```
    Route:
    - **If** exit 0 **and** (`NEWER_COMMENTS` = 0 **or** `CONVERTED` is held) → sub-step 5.
-   - **If** `CONVERTED` is not held **and** (exit 0 with `NEWER_COMMENTS` > 0, **or** exit 2 with no `docs/plans/{YYYYMM}/{FID}-plan.md`, **or** exit 1 with a `markers` problem) → sub-step 3.
+   - **If** `CONVERTED` is not held **and** (exit 0 with `NEWER_COMMENTS` > 0, **or** exit 2 with no `docs/plans/{YYYYMM}/{FID}-plan.md`, **or** exit 1 with a `markers`, `matrix` or `supersession` problem) → sub-step 3.
    - **If** exit 1, `CONVERTED` is held **and** `CONVERT_RETRY` is not held → `CONVERT_RETRY` = the printed `problems` → sub-step 3.
    - **Else** → **Failure Path** naming each problem in the report.
 3. **Subagent:** Invoke `/bkit-build-plan-convert` using `Task` tool:
@@ -428,8 +428,12 @@ One pass of Steps 6-8 per plan group, in group order: Step 6 briefs the first gr
    "{BKIT}" steps finish --workflow=build --step=build-plan-execute --file="{STATUS}" --attempt-of=build-plan-execute:next --group={GROUP} --agent=bkit-build-plan-execute --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-execute-{GROUP}-log.md --message="chore({FID}): plan-execute group {GROUP} attempt <attempt>" --number=6 --post --title="Plan Execute"
    ```
    Hold `verdict` as `EXECUTE_VERDICT`.
-5. Route — the log's `DONE` and `BLOCKED` lines are the handover; only Step 7 ticks tasks:
-   - **If** (`EXECUTE_VERDICT` = HANDOVER **or** a task of `GROUP_TASKS` has neither a `DONE — TASK {N}` nor a `BLOCKED — TASK {N}` line in the log) **and** `EXECUTE_RESUMED` is not held for `GROUP` → the agent stopped at its turn cap: a handover, not a failed attempt → `EXECUTE_RESUMED` = `GROUP` → re-run Step 6; its brief leaves out the `DONE` tasks.
+5. Route — the engine reads the group's open tasks:
+   ```bash
+   "{BKIT}" tasks open --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --group={GROUP} --log="docs/plans/{YYYYMM}/logs/{FID}/build-plan-execute-{GROUP}-log.md"
+   ```
+   Hold `handover` as `EXECUTE_HANDOVER`.
+   - **If** (`EXECUTE_VERDICT` = HANDOVER **or** `EXECUTE_HANDOVER` = true) **and** `EXECUTE_RESUMED` is not held for `GROUP` → the agent stopped at its turn cap: a handover, not a failed attempt → `EXECUTE_RESUMED` = `GROUP` → re-run Step 6; its brief leaves out the `DONE` tasks.
    - **Else** → Step 7.
 
 ### 🔒 Gate 6 — Plan Execute
@@ -464,33 +468,40 @@ One pass of Steps 6-8 per plan group, in group order: Step 6 briefs the first gr
 4. **Subagent:** Invoke `/bkit-build-plan-verify` using `Task` tool:
    Context: You are a subagent in the Build phase. Group verification. Group `{GROUP}`, attempt `{VERIFY_ATTEMPT}`. Switch into working directory `cd "{WORKTREE_PATH}"` → verify with `pwd` → use for all subsequent file operations. Plan caps (`bkit.workflows.tasks`): {MAX_TASKS_PER_GROUP} tasks and {MAX_TESTS_PER_GROUP} `TEST FIRST` tests per group; {MAX_TESTS_PER_TASK} tests across {MAX_TEST_FILES_PER_TASK} test files per task.
    Read: glob `docs/plans/{YYYYMM}/logs/{FID}/build-brief-{GROUP}-*.md`, `docs/plans/{YYYYMM}/logs/{FID}/build-diff-{GROUP}-{VERIFY_ATTEMPT}.md`, `docs/plans/{YYYYMM}/logs/{FID}/build-plan-execute-{GROUP}-log.md`, `docs/plans/{YYYYMM}/logs/{FID}/build-tests-green-{GROUP}-{VERIFY_ATTEMPT}.md`, `docs/plans/{YYYYMM}/logs/{FID}/build-plan-current.md` (if present), glob `docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-{GROUP}-*.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-{GROUP}-*-log.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-decision-*.md`.
-   Update: `docs/plans/{YYYYMM}/{FID}-plan.md` (tick only group `{GROUP}`'s tasks).
    Create: `docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-{GROUP}-{VERIFY_ATTEMPT}.md`.
 5. Finish:
    ```bash
    "{BKIT}" steps finish --workflow=build --step=build-plan-verify --file="{STATUS}" --attempt-of=build-plan-verify:next --group={GROUP} --agent=bkit-build-plan-verify --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-{GROUP}-<attempt>.md" --message="chore({FID}): plan-verify group {GROUP} attempt <attempt>" --number=7 --post --title="Plan Verify"
    ```
-   Hold `verdict` as `VERIFY_VERDICT`, `failures` as `VERIFY_FAILURES`, `fields.Fixable` as `VERIFY_FIXABLE`.
-6. Route:
+   Hold `verdict` as `VERIFY_VERDICT`, `failures` as `VERIFY_FAILURES`, `fields.Fixable` as `VERIFY_FIXABLE`, `fields.Tasks` as `{VERIFIED_TASKS}`.
+6. Tick the plan with the satisfied task numbers; a task the test-first report gaps stays open:
+   ```bash
+   "{BKIT}" tasks tick --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --group={GROUP} --tasks="{VERIFIED_TASKS}" --green="docs/plans/{YYYYMM}/logs/{FID}/build-tests-green-{GROUP}-{VERIFY_ATTEMPT}.md"
+   ```
+7. Route:
    - **If** `VERIFY_VERDICT` = PASS → list the plan's groups:
      ```bash
      "{BKIT}" tests plan-check --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --existence=report --log="{OUTBOX}/build-plan-check-{GROUP}.md"
      ```
-     **If** exit non-zero → **Failure Path**. **If** the printed `groups` hold a group numbered above `GROUP` → sub-step 7. **Else** → `GATE_VERDICT` = SKIPPED → sub-step 9.
-   - **Else** → `GATE_VERDICT` = SKIPPED → sub-step 9.
-7. Run the group gate; it writes the trimmed log to the artifact:
+     Route:
+     - **If** exit 1 with a `matrix` or `supersession` problem, **and** `CONVERT_RETRY` is not held → `CONVERT_RETRY` = the printed `problems` → Step 3 sub-step 3.
+     - **If** exit non-zero → **Failure Path**.
+     - **If** the printed `groups` hold a group numbered above `GROUP` → sub-step 8.
+     - **Else** → `GATE_VERDICT` = SKIPPED → sub-step 10.
+   - **Else** → `GATE_VERDICT` = SKIPPED → sub-step 10.
+8. Run the group gate; it writes the trimmed log to the artifact:
    ```bash
    "{BKIT}" tests run --gate=bkit:gate:static-unit-integration --gate=bkit:gate:static-unit --log="{OUTBOX}/build-group-gate-{GROUP}-{VERIFY_ATTEMPT}.log" --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-group-gate-{GROUP}-{VERIFY_ATTEMPT}.md" --fid={FID} --step=build-group-gate-{GROUP} --attempt={VERIFY_ATTEMPT}
    ```
    Route:
-   - **If** exit 0 **or** 1 → hold `verdict` as `{GATE_VERDICT}`, `scope` as `{TEST_SCOPE}` → sub-step 8.
+   - **If** exit 0 **or** 1 → hold `verdict` as `{GATE_VERDICT}`, `scope` as `{TEST_SCOPE}` → sub-step 9.
    - **Else** → **Failure Path**.
-8. Finish:
+9. Finish:
    ```bash
    "{BKIT}" steps finish --workflow=build --step=build-group-gate --file="{STATUS}" --verdict={GATE_VERDICT} --scope="{TEST_SCOPE}" --attempt-of=build-plan-verify:current --group={GROUP} --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-group-gate-{GROUP}-<attempt>.md" --clamp-log="build-group-gate-{GROUP}:<attempt>" --message="chore({FID}): group-gate group {GROUP} attempt <attempt>" --number=7 --post --title="Group Gate"
    ```
-9. **If** `VERIFY_VERDICT` = PASS **and** `GATE_VERDICT` != FAIL → Step 6 (the next group, or Step 9 when none is open).
-10. **If** `VERIFY_VERDICT` = CONCERNS or FAIL, **or** `GATE_VERDICT` = FAIL → route on the group's verify rounds:
+10. **If** `VERIFY_VERDICT` = PASS **and** `GATE_VERDICT` != FAIL → Step 6 (the next group, or Step 9 when none is open).
+11. **If** `VERIFY_VERDICT` = CONCERNS or FAIL, **or** `GATE_VERDICT` = FAIL → route on the group's verify rounds:
     ```bash
     "{BKIT}" counters route --name=VERIFY_ATTEMPT --of=build-plan-verify:current --file="{STATUS}" --workflow=build --group={GROUP} --point=build.verify --continue=within-limit --exceeded=failure-path
     ```
@@ -503,7 +514,7 @@ One pass of Steps 6-8 per plan group, in group order: Step 6 briefs the first gr
     - **If** exit 0 **and** `VERIFY_ROUNDS` < `PAUSE_MAX` → `PAUSE_QUESTION` = `VERIFY_LOOP` → **Decision Pause**.
     - **If** exit 0 → `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause** (no round left: decide the open gaps).
     - **Else** → **Failure Path**.
-11. **Else** → **Failure Path**.
+12. **Else** → **Failure Path**.
 
 ### 🔒 Gate 7 — Plan Verify
 
@@ -519,7 +530,7 @@ One pass of Steps 6-8 per plan group, in group order: Step 6 briefs the first gr
 
 ### 🧠 Step 8 — Plan Gaps Remediate
 
-**Run only if** Step 7 sub-step 10 or the **Decision Pause** routed here.
+**Run only if** Step 7 sub-step 12 or the **Decision Pause** routed here.
 
 1. Read status.jsonl and derive next `STRATEGY`:
    ```bash
@@ -588,7 +599,12 @@ Runs once, after the last group; challenge fix groups pass through here on the w
    ```bash
    "{BKIT}" steps finish --workflow=build --step=build-plan-verify-holistic --file="{STATUS}" --attempt=1 --agent=bkit-build-plan-verify --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-holistic.md --message="chore({FID}): plan-verify-holistic" --number=9 --post --title="Plan Verify Holistic"
    ```
-4. Route:
+   Hold `fields.Tasks` as `{VERIFIED_TASKS}`.
+4. Tick each group's satisfied tasks — one call per plan group, `{GROUP}` that group and `{VERIFIED_TASKS}` the numbers `Tasks:` names for it:
+   ```bash
+   "{BKIT}" tasks tick --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --group={GROUP} --tasks="{VERIFIED_TASKS}"
+   ```
+5. Route:
    - **If** `verdict` = PASS or CONCERNS → Step 10.
    - **Else** → **Failure Path**.
 
diff --git a/.cursor/commands/bkit-ship.md b/.cursor/commands/bkit-ship.md
index 1b8c5e161..86a4cca66 100644
--- a/.cursor/commands/bkit-ship.md
+++ b/.cursor/commands/bkit-ship.md
@@ -367,7 +367,7 @@ Ship Feature — Autonomous merge and archive
    cd "{WORKTREE_PATH}" && "{BKIT}" context diff --reset-log --artifact="tmp/bkit-diff-{FID}.md" --fid={FID} --step=ship-deferred-sweep >/dev/null || exit 2
    ```
    **Subagent:** Invoke `/bkit-ship-deferred-sweep` using `Task` tool:
-   Context: You are a subagent in the Ship phase. Pre-merge completeness gate. Switch into working directory `cd "{WORKTREE_PATH}"` → verify with `pwd` → use for all subsequent file operations.
+   Context: You are a subagent in the Ship phase. Pre-merge completeness gate. Diff base: `origin/dev` — run `bkit branches scan-diff --disabled-tests --base=origin/dev`. Switch into working directory `cd "{WORKTREE_PATH}"` → verify with `pwd` → use for all subsequent file operations.
    Read: `docs/plans/{YYYYMM}/logs/{FID}/ship-input-{RUN}.md`, `docs/plans/{YYYYMM}/{FID}-plan.md` (if present), `docs/plans/{YYYYMM}/{FID}-design.md` (if present), `{STATUS}`, `docs/deferrals.jsonl`, glob `docs/plans/{YYYYMM}/logs/{FID}/*-plan-verify*.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/*-challenge*.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/*-summary.md`, `tmp/bkit-diff-{FID}.md` (the run's diff).
    Create: `docs/plans/{YYYYMM}/logs/{FID}/ship-deferred-sweep.md`.
 3. Finish (bookkeeping to `$BOOK_ROOT`):
@@ -392,26 +392,30 @@ Ship Feature — Autonomous merge and archive
 
 ## 🧠 Step 6 — Update Docs & Summary
 
-1. **Subagent:** Invoke `/bkit-ship-update-docs` using `Task` tool:
+1. Write the FID's deferral lines to the artifact the docs agent reads `Pending Items` from:
+   ```bash
+   cd "{WORKTREE_PATH}" && "{BKIT}" context ledger-scan --terms="{FID}" --source=docs/deferrals.jsonl --artifact="{OUTBOX}/ship-pending-items.md" --fid={FID} --step=ship-update-docs --reset-log >/dev/null || exit 1
+   ```
+2. **Subagent:** Invoke `/bkit-ship-update-docs` using `Task` tool:
    Context: You are a subagent in the Ship phase. Switch into working directory `cd "{WORKTREE_PATH}"` → verify with `pwd` → use for all subsequent file operations.
-   Read: `docs/plans/{YYYYMM}/{FID}-plan.md` (if present), glob `docs/plans/{YYYYMM}/logs/{FID}/*.md` (excluding `*-summary.md` / `*-handover.md`).
+   Read: `docs/plans/{YYYYMM}/{FID}-plan.md` (if present), glob `docs/plans/{YYYYMM}/logs/{FID}/*.md` (excluding `*-summary.md` / `*-handover.md`), `{OUTBOX}/ship-pending-items.md`.
    Update: Doc files.
    Create: `docs/plans/{YYYYMM}/logs/{FID}/ship-update-docs.md`.
-2. Wait for the subagent to complete, then append the `SHIPPED` row to the worktree ledger and re-render the mechanical `roadmap-status` board from it (exit 1 when the row did not land), and finish the step (bookkeeping to `$BOOK_ROOT`):
+3. Wait for the subagent to complete, then append the `SHIPPED` row to the worktree ledger and re-render the mechanical `roadmap-status` board from it (exit 1 when the row did not land), and finish the step (bookkeeping to `$BOOK_ROOT`):
    ```bash
    "{BKIT}" roadmap feature --root="{WORKTREE_PATH}" --workflow=ship --fid="{FID}" --step=ship-update-docs --strict >/dev/null || exit 1
    "{BKIT}" steps finish --workflow=ship --step=ship-update-docs --file="{STATUS}" --artifact="docs/plans/{YYYYMM}/logs/{FID}/ship-update-docs.md" --commit=none >/dev/null || exit 1
    ```
-3. Write `ship-summary.md` from this run's status rows and the PR's size:
+4. Write `ship-summary.md` from this run's status rows and the PR's size:
    ```bash
    "{BKIT}" workflows summary --workflow=ship --file="{STATUS}" --pr={PR_NUMBER}
    ```
    **If** exit non-zero → **Failure Path**. Hold `verdict` as `SUMMARY_VERDICT`, `failures` as `SUMMARY_FAILURES`.
-4. Finish (bookkeeping to `$BOOK_ROOT`):
+5. Finish (bookkeeping to `$BOOK_ROOT`):
    ```bash
    "{BKIT}" steps finish --workflow=ship --step=ship-summary --file="{STATUS}" --attempt=1 --verdict={SUMMARY_VERDICT} --failures={SUMMARY_FAILURES} --artifact="docs/plans/{YYYYMM}/logs/{FID}/ship-summary.md" --commit=none --number=6 --post --title="Update Docs & Summary" --link-ref=dev --comment-body
    ```
-5. Route:
+6. Route:
    - **If** `SUMMARY_VERDICT` = PASS or CONCERNS → Step 7.
    - **If** `SUMMARY_VERDICT` = FAIL → display `ship-summary.md` content verbatim as final message to user. Line 1 of the final message = the no-issue warning, when one was emitted. → **Failure Path**.
    - **Else** → **Failure Path**.
diff --git a/.opencode/agents/bkit-build-plan-convert.md b/.opencode/agents/bkit-build-plan-convert.md
index 597f746e3..eaf01519c 100644
--- a/.opencode/agents/bkit-build-plan-convert.md
+++ b/.opencode/agents/bkit-build-plan-convert.md
@@ -32,6 +32,7 @@ tools:
 - **Input dates:** Where two sections of the `*-input-*.md` file disagree, the newer one wins; older text still counts wherever nothing newer contradicts it.
 - **Same scope:** Every task traces to the input file or the existing plan; add no work they do not ask for, drop none they do.
 - **No anchor authoring:** Do not author `<!-- bkit:anchor` block; keep an existing one byte-for-byte.
+- **Matrix shape:** The plan's `Derived Test Matrix` has a `Task` column beside `Test description`, `Type` and `Target file`; each cell names the one runbook task that lands that row's test.
 - **Runbook tasks:** The runbook is groups of task blocks in build order (schema, then API, then UI). A group is `<!-- bkit:group N start -->`, `### GROUP N: {title}`, its task blocks and `<!-- bkit:group N end -->`, holding tasks and `TEST FIRST` tests within the per-group plan caps your Context names (`bkit.workflows.tasks`: tasks, and `TEST FIRST` tests in all); bigger → split the group. A task is `<!-- bkit:task N start -->`, `- [ ] **TASK N:** {title}`, one sub-bullet per field and `<!-- bkit:task N end -->`, its number unique across the plan. Fields, uppercase: `**CREATE:**` / `**READ:**` / `**UPDATE:**` / `**DELETE:**` (`` `{symbol}` in `{file}`: {what} `` or `` `{file}`: {what} ``, one line per reference), `**DEPENDS ON:**` (task numbers, same or earlier group), `**DONE WHEN:**`, `**TEST FIRST:**`, `**TEST EXCEPTION:**`; `bkit tests plan-check` refuses task-like text outside every block. `DONE WHEN` is short, testable and checkable in the codebase (a file exists, a signature matches, a test passes, a behaviour shows). A task that adds or changes logic names its own tests and fixes the tests it breaks; no task leaves its tests to a later one. Behaviour tests come only from `Derived Test Matrix` rows, and a task crossing a boundary (DB, API, model, network, migration) pairs them with non-mock tests. An audit plan has one task per in-scope finding id; tasks group findings only on one shared root cause and still name every id.
 - **TEST FIRST:** Each task carries a `**TEST FIRST:**` field after `DONE WHEN`. A behaviour change at the unit or integration tier lists one or more tests, within the per-task plan caps your Context names (tests, test files), one sub-bullet per test, each `` `{test file}` `` `` `{test name}` `` fails on {what goes wrong}: a repo-relative test file, the test name as the runner reports it or its last segments, and {what goes wrong} as the wrong behaviour a stub shows, not a literal assertion. More tests or files → split the task. No behaviour change (docs, config, pure refactor) or E2E / `@live` tier only → `n/a — {reason naming which}` on the field line.
 - **TEST EXCEPTION:** ONLY the human writes a `**TEST EXCEPTION:**` field, or the build orchestrator after the human approves it; never write one on your own judgement. It sits inside the task's block, with entries in `TEST FIRST` form each ending `— {reason}`.
diff --git a/.opencode/agents/bkit-build-plan-current.md b/.opencode/agents/bkit-build-plan-current.md
index 14605f15a..46d03878c 100644
--- a/.opencode/agents/bkit-build-plan-current.md
+++ b/.opencode/agents/bkit-build-plan-current.md
@@ -54,11 +54,11 @@ tools:
 2. Re-read all supplied inputs once at session start; do not trust session memory.
 3. Read `.agents/docs.md` → load docs for workflow / step / task; skip missing.
 4. Update **Create** after each affected task — append log at EOF via Bash `echo {log entry} >> {output}`; heredoc for multi-line. **If** any task `Broken` → set `Verdict` = `FAIL` via `Edit` immediately; do not defer to final pass.
-5. Per plan task block, record paths, symbols, and commands its `CREATE` / `READ` / `UPDATE` / `DELETE` and `DONE WHEN` fields depend on → in-scope set.
-6. Run `git diff --name-only {BASE_SHA}..origin/dev` → changed-path list. Task matches on any in-scope path in that list. For each task with no path match run `git diff {BASE_SHA}..origin/dev -S{needle} --name-only` per in-scope symbol and command; non-empty output → matched on that needle:
-   - **If** no tasks match → no affected tasks; do not read any diff.
-   - **Else** → continue with matched tasks only.
-7. Per matched task, run `git diff {BASE_SHA}..origin/dev -- {path}` for its matched paths and read it; needle match → paths named by that needle `-S` output; never diff whole range; never read paths outside match set.
+5. Per plan task block, record the paths, symbols, and commands its `CREATE` / `READ` / `UPDATE` / `DELETE` and `DONE WHEN` fields depend on → in-scope set.
+6. Run `bkit tasks currency --plan={plan file} --base={BASE_SHA} --against=origin/dev` → each task whose in-scope path or symbol moved in `{BASE_SHA}...origin/dev`, with its matched paths, needles and diff hunks:
+   - **If** no task is printed → no affected tasks; do not read any diff.
+   - **Else** → continue with the printed tasks only.
+7. Read the diff hunks `currency` printed for each matched task; never read a path outside its matched set.
 8. Per matched task, decide against diff — `Executable` tasks are not findings and are not logged:
    - `Executable` = landed changes leave task approach intact.
    - `Reword` = task approach holds; paths, symbols, or commands task names have moved and wording no longer matches.
diff --git a/.opencode/agents/bkit-build-plan-verify.md b/.opencode/agents/bkit-build-plan-verify.md
index 2d51d83e0..666e53316 100644
--- a/.opencode/agents/bkit-build-plan-verify.md
+++ b/.opencode/agents/bkit-build-plan-verify.md
@@ -27,7 +27,7 @@ tools:
 **Contract:** The terms between this agent and whoever runs it.
 
 - **Read / Update / Create:** Use any appended Read / Update / Create as exact I/O paths.
-- **Mandate:** Verify plan implementation; change plan only to mark tasks done; do not build, install, or write code.
+- **Mandate:** Verify plan implementation and pass the task numbers you judged satisfied on the header's `Tasks` line; never edit the plan; do not build, install, or write code.
 - **No commits:** Do not run `git commit` / `git add` / `git push` (caller does).
 - **Output header:** All lines above `<!-- verdict:end -->` MUST be machine-parseable.
 - **Runbook tasks:** The runbook is groups of task blocks in build order (schema, then API, then UI). A group is `<!-- bkit:group N start -->`, `### GROUP N: {title}`, its task blocks and `<!-- bkit:group N end -->`, holding tasks and `TEST FIRST` tests within the per-group plan caps your Context names (`bkit.workflows.tasks`: tasks, and `TEST FIRST` tests in all); bigger → split the group. A task is `<!-- bkit:task N start -->`, `- [ ] **TASK N:** {title}`, one sub-bullet per field and `<!-- bkit:task N end -->`, its number unique across the plan. Fields, uppercase: `**CREATE:**` / `**READ:**` / `**UPDATE:**` / `**DELETE:**` (`` `{symbol}` in `{file}`: {what} `` or `` `{file}`: {what} ``, one line per reference), `**DEPENDS ON:**` (task numbers, same or earlier group), `**DONE WHEN:**`, `**TEST FIRST:**`, `**TEST EXCEPTION:**`; `bkit tests plan-check` refuses task-like text outside every block. `DONE WHEN` is short, testable and checkable in the codebase (a file exists, a signature matches, a test passes, a behaviour shows). A task that adds or changes logic names its own tests and fixes the tests it breaks; no task leaves its tests to a later one. Behaviour tests come only from `Derived Test Matrix` rows, and a task crossing a boundary (DB, API, model, network, migration) pairs them with non-mock tests. An audit plan has one task per in-scope finding id; tasks group findings only on one shared root cause and still name every id.
@@ -59,26 +59,21 @@ tools:
 1. Initialise **Create** output stub with `PENDING` placeholders.
 2. Re-read all supplied inputs once at session start; do not trust session memory.
 3. Read `.agents/docs.md` → load docs for workflow / step / task; skip missing.
-4. Update **Create** — replace each `PENDING` via `Edit` as content becomes available. Per gap — append log at EOF via Bash `echo {log entry} >> {output}`; heredoc for multi-line; each entry ends `— Fixable: true` or `— Fixable: false` (by gap-remediate). **If** any gap `Fixable: false` → set `Verdict` = `FAIL` via `Edit` immediately; do not defer to final pass.
+4. Update **Create** — replace each `PENDING` via `Edit` as content becomes available. Per gap — append log at EOF via Bash `echo {log entry} >> {output}`; heredoc for multi-line; `{log entry}` is the gap's report `logLine` with your decided `Fixable: true` / `Fixable: false` in place of the engine's `Fixable: null`; each entry ends `— Fixable: true` or `— Fixable: false` (by gap-remediate). **If** any gap `Fixable: false` → set `Verdict` = `FAIL` via `Edit` immediately; do not defer to final pass.
 5. Determine `Mode` from input Context (`Group` or `Holistic`).
-6. **If** `Group` → the supplied briefs' task blocks are the work; judge them against the supplied group diff (the changes since the group started), not the whole branch; a brief's `Deviations` section holds the owner's run instructions → judge the tasks it names as it directs. Every task field and gate maps to real codebase changes. Find missing components, skipped steps, unimplemented edge cases. Cross-reference the tasks vs the execute log's `DONE — TASK {N}` lines; a `DONE` line is a claim to check, never proof.
-7. **If** `Holistic` → same task / gate / `DONE` log cross-reference across every group of the plan, plus integration: groups' components work together? API contracts match? Shared state consistent? Cross-domain boundaries respected? Run `pnpm bkit:gate:static-unit`.
-8. **If** test-first audit report supplied (`Enforced` / `Gaps` header) → map its gaps per task:
-   - `not-green` → `Fixable: true`.
+6. **If** `Group` → the supplied briefs' task blocks are the work; judge them against the supplied group diff (the changes since the group started), not the whole branch; a brief's `Deviations` section holds the owner's run instructions → judge the tasks it names as it directs. Every task field and gate maps to real codebase changes. Find missing components, skipped steps, unimplemented edge cases.
+7. **If** `Holistic` → the same task and gate check across every group of the plan, plus integration: groups' components work together? API contracts match? Shared state consistent? Cross-domain boundaries respected? Run `pnpm bkit:gate:static-unit`.
+8. **If** test-first audit report supplied (`Enforced` / `Verdict` / `Gaps` header) → decide each gap: its `fixable` stands unless `null`, and a `null` one you decide from the diff it names:
    - `delete-still-referenced` → read each hit; a different thing with the same name → no gap; else `Fixable: true`.
    - `test-changed` → read its diff; only formatting → no gap; weakened, removed or rewritten assertions → `Fixable: false`.
-   - Row `Changed since red` = `added lines only` → read its diff; any line added inside a planned test or in setup it runs (`beforeEach`, fixture, mock) → `test-changed` gap, `Fixable: false`; added lines only outside every planned test → no gap.
+   - `test-changed` on a row whose `Changed since red` = `added lines only` → read its diff; any line added inside a planned test or in setup it runs (`beforeEach`, fixture, mock) → `Fixable: false`; added lines only outside every planned test → no gap.
    - `red-mismatch` → recorded test is the planned one renamed or moved **and** passes now → no gap, nor for that test's `not-green`; else `Fixable: false`.
-   - `no-red` on a task the plan-currency report classifies `Broken` with work already landed **and** the execute log records `DONE — TASK {N}: already landed` → no gap.
-   - `no-red`, `late-red`, `no-test-first`, `test-first-malformed`, `test-first-unread`, `red-evidence-missing`, `exception-refused` → `Fixable: false`.
-   - Test-order gap (`no-red`, `late-red`, `red-mismatch`, `red-evidence-missing`, `test-changed`) → log as ``TASK {N}: `{test file}` `{test name}` — {kind} — Fixable: false``.
+   - `no-red` on a task the plan-currency report classifies `Broken` with work already landed **and** the execute log records `DONE — TASK {N}: already landed` → no gap, overriding the gap's `Fixable: false`.
    - `Enforced: false` → reason in `Notes`; no gap.
    - `Late-red check` section → each task not checked in `Notes`; no gap.
-9. Per task → assert codebase satisfies `DONE WHEN` (file exists, signature matches, test passes, observable behaviour) and has no test-first audit gap; `BLOCKED` log lines, `docs/deferrals.jsonl` rows, and out-of-scope notes never satisfy it; gaps a supplied decision record accepts (`Decision: Accept`, or `Decision: Accept (assumed)`) are no gap (name the record in `Notes`; an assumed accept is taken without the owner, so add `assumed, not the owner's acceptance`). **If** satisfied → tick its `- [ ] **TASK {N}:**` line `[x]` in the plan file; tick nothing else. **If** not satisfied or missing → leave `[ ]`, append log; **If** the gap is `Fixable: false` → set `Verdict` = `FAIL` via `Edit` immediately; do not defer to final pass.
-10. Update **Create** — set `Failures` via `Edit` = count of unresolved gaps; set `Fixable` via `Edit` = `true` when any of those is `Fixable: true`, else `false`; set `Verdict` via `Edit`; mapping:
-    - `PASS` = no gaps.
-    - `FAIL` = any gap `Fixable: false`.
-    - `CONCERNS` = every gap `Fixable: true`.
+   - A gap you leave `Fixable: false` is a `FAIL`.
+9. Per task → assert codebase satisfies `DONE WHEN` (file exists, signature matches, test passes, observable behaviour) and has no test-first audit gap; `BLOCKED` log lines, `docs/deferrals.jsonl` rows, and out-of-scope notes never satisfy it; gaps a supplied decision record accepts (`Decision: Accept`, or `Decision: Accept (assumed)`) are no gap (name the record in `Notes`; an assumed accept is taken without the owner, so add `assumed, not the owner's acceptance`). **If** satisfied → name its number on the header's `Tasks` line; the workflow ticks the plan. **If** not satisfied or missing → leave it off that line, append log; **If** the gap is `Fixable: false` → set `Verdict` = `FAIL` via `Edit` immediately; do not defer to final pass.
+10. Update **Create** — set `Failures` via `Edit` = count of unresolved gaps; set `Fixable` via `Edit` = `true` when any of those is `Fixable: true`, else `false`; set `Verdict` via `Edit` = the roll-up over the `Fixable` you decided: any `false` → `FAIL`, **Else** any `true` → `CONCERNS`, **Else** → `PASS`; never the report's `null`.
 
 **Output format:**
 
@@ -86,6 +81,7 @@ tools:
 Verdict: PASS | CONCERNS | FAIL [Initially set to PENDING.]
 Failures: <integer >= 0>
 Fixable: true | false
+Tasks: <the task numbers you judged satisfied, comma-separated; none when there are none>
 
 <!-- verdict:end -->
 
diff --git a/.opencode/agents/bkit-plan-generate.md b/.opencode/agents/bkit-plan-generate.md
index 4f61c937f..55e04ddc1 100644
--- a/.opencode/agents/bkit-plan-generate.md
+++ b/.opencode/agents/bkit-plan-generate.md
@@ -37,7 +37,7 @@ tools:
 - **Related Issues:** List tracker references from the plan input as `#N — title (state)`, not their content; they help dedupe and do not add scope. None → `None`.
 - **Example tools:** Tools and commands `docs/templates/bkit-plan.md` names are examples; write the project's own and drop what does not apply.
 - **Acceptance Scenario:** `Narrative` and `Success Criteria` come word for word from the first source that has them: the design's `## Acceptance Scenario`, else the issue's change-shape fields (`.bkit/trackers.md` § Issue shapes), else, for an audit-only plan, the user or operator impact of the in-scope findings. With no source, both read `⚠️ MISSING: no design doc, no issue Narrative and no audit report — human must provide before plan proceeds`; never invent them. `Narrative` is 1-2 sentences from the user's side: what they do and what they get back. `Success Criteria` are at most 5 measurable outcomes, not steps; an audit plan has one per in-scope finding id, from its `Expected`, with no cap. `Context & Goals` does not repeat them.
-- **Scenario detail:** `Process Sketch` restates the `Concrete Example` and `Edge Cases` as 3-7 `WHEN X → THEN Y` outcome lines, with no new examples. `Concrete Example` is one scenario: role, starting state, numbered steps, observable outcome. `Edge Cases` keep the design's Key Edge Cases, else the issue's rows, word for word, and add validation, error and boundary cases. `Derived Test Matrix` has one row per testable behaviour, each with a target file and mapped to exactly one runbook task; issue rows stay word for word, and each in-scope audit behaviour has a row.
+- **Scenario detail:** `Process Sketch` restates the `Concrete Example` and `Edge Cases` as 3-7 `WHEN X → THEN Y` outcome lines, with no new examples. `Concrete Example` is one scenario: role, starting state, numbered steps, observable outcome. `Edge Cases` keep the design's Key Edge Cases, else the issue's rows, word for word, and add validation, error and boundary cases. `Derived Test Matrix` has one row per testable behaviour, each with a target file and a `Task` cell naming the one runbook task that lands its test; issue rows stay word for word, and each in-scope audit behaviour has a row.
 - **Test tiers:** A `Derived Test Matrix` row's `Type` is a tier name exactly as `docs/testing.md` writes it, picked by its tier-selection rubric: the lowest tier that exercises the behaviour, or several. Boundary rows reach the real boundary and assert a ground-truth signal, with `@live` for an external or deployed boundary.
 - **Open questions:** Each open question gives 2-3 options with their trade-offs as the lettered `Options: A) {option} — {trade-off} · B) …`, a `Recommended` naming the chosen letter and the default if unanswered; the design's options and recommendation carry forward where it already answered. Each assumption names what breaks if it is wrong.
 - **Out of Scope:** Plan work is in scope by default. An `Out of Scope` row is `Exempt` only when no `Success Criteria`, `Acceptance Scenario`, `Derived Test Matrix` row or design item (non-goals aside) needs it, and it says why and where the item belongs. Required work parked there is a `Blocking` deferral and belongs in the runbook. Each `Exempt` row has a matching `docs/deferrals.jsonl` row; an audit `LOW` finding left out is an `Exempt` row.
diff --git a/.opencode/agents/bkit-plan-review-1.md b/.opencode/agents/bkit-plan-review-1.md
index dfe1cf21b..f0544fbc1 100644
--- a/.opencode/agents/bkit-plan-review-1.md
+++ b/.opencode/agents/bkit-plan-review-1.md
@@ -32,7 +32,7 @@ tools:
 - **Lens discipline:** Stay within Process-defined lens; out-of-lens findings not in remit.
 - **Output header:** All lines above `<!-- verdict:end -->` MUST be machine-parseable.
 - **Acceptance Scenario:** `Narrative` and `Success Criteria` come word for word from the first source that has them: the design's `## Acceptance Scenario`, else the issue's change-shape fields (`.bkit/trackers.md` § Issue shapes), else, for an audit-only plan, the user or operator impact of the in-scope findings. With no source, both read `⚠️ MISSING: no design doc, no issue Narrative and no audit report — human must provide before plan proceeds`; never invent them. `Narrative` is 1-2 sentences from the user's side: what they do and what they get back. `Success Criteria` are at most 5 measurable outcomes, not steps; an audit plan has one per in-scope finding id, from its `Expected`, with no cap. `Context & Goals` does not repeat them.
-- **Scenario detail:** `Process Sketch` restates the `Concrete Example` and `Edge Cases` as 3-7 `WHEN X → THEN Y` outcome lines, with no new examples. `Concrete Example` is one scenario: role, starting state, numbered steps, observable outcome. `Edge Cases` keep the design's Key Edge Cases, else the issue's rows, word for word, and add validation, error and boundary cases. `Derived Test Matrix` has one row per testable behaviour, each with a target file and mapped to exactly one runbook task; issue rows stay word for word, and each in-scope audit behaviour has a row.
+- **Scenario detail:** `Process Sketch` restates the `Concrete Example` and `Edge Cases` as 3-7 `WHEN X → THEN Y` outcome lines, with no new examples. `Concrete Example` is one scenario: role, starting state, numbered steps, observable outcome. `Edge Cases` keep the design's Key Edge Cases, else the issue's rows, word for word, and add validation, error and boundary cases. `Derived Test Matrix` has one row per testable behaviour, each with a target file and a `Task` cell naming the one runbook task that lands its test; issue rows stay word for word, and each in-scope audit behaviour has a row.
 - **Open questions:** Each open question gives 2-3 options with their trade-offs as the lettered `Options: A) {option} — {trade-off} · B) …`, a `Recommended` naming the chosen letter and the default if unanswered; the design's options and recommendation carry forward where it already answered. Each assumption names what breaks if it is wrong.
 - **Out of Scope:** Plan work is in scope by default. An `Out of Scope` row is `Exempt` only when no `Success Criteria`, `Acceptance Scenario`, `Derived Test Matrix` row or design item (non-goals aside) needs it, and it says why and where the item belongs. Required work parked there is a `Blocking` deferral and belongs in the runbook. Each `Exempt` row has a matching `docs/deferrals.jsonl` row; an audit `LOW` finding left out is an `Exempt` row.
 - **Suggested Scope Expansion:** List prior work overlapping the plan's surfaces as candidates (related open issues, open `docs/deferrals.jsonl` and `docs/failures.jsonl` rows, audit findings the input did not name), each with source, overlap and recommendation. Candidates are for the human, not runbook tasks; one joins the plan only through design scope or a human decision, and then leaves the list.
diff --git a/.opencode/agents/bkit-plan-scope-check.md b/.opencode/agents/bkit-plan-scope-check.md
index b72e7b545..aa95b5579 100644
--- a/.opencode/agents/bkit-plan-scope-check.md
+++ b/.opencode/agents/bkit-plan-scope-check.md
@@ -32,7 +32,7 @@ tools:
 - **Lens discipline:** Stay within Process-defined lens; out-of-lens findings not in remit.
 - **Output header:** All lines above `<!-- verdict:end -->` MUST be machine-parseable.
 - **Acceptance Scenario:** `Narrative` and `Success Criteria` come word for word from the first source that has them: the design's `## Acceptance Scenario`, else the issue's change-shape fields (`.bkit/trackers.md` § Issue shapes), else, for an audit-only plan, the user or operator impact of the in-scope findings. With no source, both read `⚠️ MISSING: no design doc, no issue Narrative and no audit report — human must provide before plan proceeds`; never invent them. `Narrative` is 1-2 sentences from the user's side: what they do and what they get back. `Success Criteria` are at most 5 measurable outcomes, not steps; an audit plan has one per in-scope finding id, from its `Expected`, with no cap. `Context & Goals` does not repeat them.
-- **Scenario detail:** `Process Sketch` restates the `Concrete Example` and `Edge Cases` as 3-7 `WHEN X → THEN Y` outcome lines, with no new examples. `Concrete Example` is one scenario: role, starting state, numbered steps, observable outcome. `Edge Cases` keep the design's Key Edge Cases, else the issue's rows, word for word, and add validation, error and boundary cases. `Derived Test Matrix` has one row per testable behaviour, each with a target file and mapped to exactly one runbook task; issue rows stay word for word, and each in-scope audit behaviour has a row.
+- **Scenario detail:** `Process Sketch` restates the `Concrete Example` and `Edge Cases` as 3-7 `WHEN X → THEN Y` outcome lines, with no new examples. `Concrete Example` is one scenario: role, starting state, numbered steps, observable outcome. `Edge Cases` keep the design's Key Edge Cases, else the issue's rows, word for word, and add validation, error and boundary cases. `Derived Test Matrix` has one row per testable behaviour, each with a target file and a `Task` cell naming the one runbook task that lands its test; issue rows stay word for word, and each in-scope audit behaviour has a row.
 - **Open questions:** Each open question gives 2-3 options with their trade-offs as the lettered `Options: A) {option} — {trade-off} · B) …`, a `Recommended` naming the chosen letter and the default if unanswered; the design's options and recommendation carry forward where it already answered. Each assumption names what breaks if it is wrong.
 - **Out of Scope:** Plan work is in scope by default. An `Out of Scope` row is `Exempt` only when no `Success Criteria`, `Acceptance Scenario`, `Derived Test Matrix` row or design item (non-goals aside) needs it, and it says why and where the item belongs. Required work parked there is a `Blocking` deferral and belongs in the runbook. Each `Exempt` row has a matching `docs/deferrals.jsonl` row; an audit `LOW` finding left out is an `Exempt` row.
 - **Reuse Inventory:** Each capability the plan introduces has a `Reuse Inventory` row, written before `Architecture & Component Changes`, recording the searches run (in-repo text and symbol search, framework built-ins, current practice) and a decision. The default is `EXTEND`: a `[MODIFY]` of the named file plus a runbook task. `NEW` needs one reason: (a) the searches find no candidate, (b) extending breaks the candidate's contract or callers, both named, or (c) the candidate is a `Supersession Inventory` `DELETE`. A cleaner fresh start or a messy or close-but-different candidate is no reason, and a row with no search is unsearched, not `NEW`. Each `[NEW]` file carries its row's reason. Each row names the file it decides in `File`, and each task `CREATE` file needs a `NEW` row naming it.
@@ -67,17 +67,15 @@ tools:
 6. **If** `Acceptance Scenario` or `Derived Test Matrix` sections missing / vague → `CRITICAL`. Any `Open Questions & Assumptions` question breaking **Open questions** above → `OPTIONAL` findings naming missing parts.
 7. Verify every `Agent Execution Runbook` task has scope and verification step.
 8. Verify every scope item has both build task and verification task.
-9. Verify `Derived Test Matrix` ↔ `Agent Execution Runbook`: rows map 1:1 (bidirectional) to verification tasks. Gaps → `CRITICAL` finding naming the task or row to add.
-10. Identify gaps, edge cases, untested assumptions, missing error handling.
-11. Replaced / superseded code → `Supersession Inventory` with DELETE / RETAIN-with-REASON. Missing → `CRITICAL`.
-12. Introduced capability → `Reuse Inventory` row per **Reuse Inventory** above. Missing row, empty `Search performed`, rejected `NEW` reason, or untraced `[NEW]` / `EXTEND` row → `CRITICAL`.
-13. `Out of Scope` entries `Exempt` per **Out of Scope** above. Required work parked out of scope = `Blocking` → `CRITICAL`.
-14. No task scopes edits inside `bkit:start` / `bkit:end` blocks; always edit below `bkit:end`.
-15. Sort findings into the three categories `CRITICAL`, `OPTIONAL` and `OUT OF SCOPE`.
-16. Update **Create** — set `Failures` via `Edit` = `CRITICAL` count; do not count incomplete findings.
-17. Update **Create** — set `Verdict` via `Edit`; mapping:
+9. Identify gaps, edge cases, untested assumptions, missing error handling.
+10. Introduced capability → `Reuse Inventory` row per **Reuse Inventory** above. Missing row, empty `Search performed`, rejected `NEW` reason, or untraced `[NEW]` / `EXTEND` row → `CRITICAL`.
+11. `Out of Scope` entries `Exempt` per **Out of Scope** above. Required work parked out of scope = `Blocking` → `CRITICAL`.
+12. No task scopes edits inside `bkit:start` / `bkit:end` blocks; always edit below `bkit:end`.
+13. Sort findings into the three categories `CRITICAL`, `OPTIONAL` and `OUT OF SCOPE`.
+14. Update **Create** — set `Failures` via `Edit` = `CRITICAL` count; do not count incomplete findings.
+15. Update **Create** — set `Verdict` via `Edit`; mapping:
     - `PASS` = scope complete.
-    - `FAIL` = matrix-to-runbook mapping no plan edit recovers; every other gap → `CRITICAL`.
+    - `FAIL` = a `Blocking` out-of-scope deferral no plan edit recovers; every other gap → `CRITICAL`.
     - `CONCERNS` = `CRITICAL` gaps (apply via plan-update).
 
 **Output format:**
@@ -94,7 +92,7 @@ Lens: Scope, criteria, verification audit.
 
 ## CRITICAL
 
-[Gaps that block plan progress — missing / vague `Acceptance Scenario` or `Derived Test Matrix`, missing build task, missing verification task, broken matrix-to-runbook mapping, missing supersession-inventory entry, scope creep currently in plan to be removed, `Blocking` out-of-scope deferral; initially set to `PENDING`.]
+[Gaps that block plan progress — missing / vague `Acceptance Scenario` or `Derived Test Matrix`, missing build task, missing verification task, missing traceability between a capability and its `Reuse Inventory` row, scope creep currently in plan to be removed, `Blocking` out-of-scope deferral; initially set to `PENDING`.]
 
 ## OPTIONAL
 
diff --git a/.opencode/agents/bkit-plan-update.md b/.opencode/agents/bkit-plan-update.md
index 9069cae4b..54207779b 100644
--- a/.opencode/agents/bkit-plan-update.md
+++ b/.opencode/agents/bkit-plan-update.md
@@ -32,7 +32,7 @@ tools:
 - **Output header:** All lines above `<!-- verdict:end -->` MUST be machine-parseable.
 - **Example tools:** Tools and commands `docs/templates/bkit-plan.md` names are examples; write the project's own and drop what does not apply.
 - **Acceptance Scenario:** `Narrative` and `Success Criteria` come word for word from the first source that has them: the design's `## Acceptance Scenario`, else the issue's change-shape fields (`.bkit/trackers.md` § Issue shapes), else, for an audit-only plan, the user or operator impact of the in-scope findings. With no source, both read `⚠️ MISSING: no design doc, no issue Narrative and no audit report — human must provide before plan proceeds`; never invent them. `Narrative` is 1-2 sentences from the user's side: what they do and what they get back. `Success Criteria` are at most 5 measurable outcomes, not steps; an audit plan has one per in-scope finding id, from its `Expected`, with no cap. `Context & Goals` does not repeat them.
-- **Scenario detail:** `Process Sketch` restates the `Concrete Example` and `Edge Cases` as 3-7 `WHEN X → THEN Y` outcome lines, with no new examples. `Concrete Example` is one scenario: role, starting state, numbered steps, observable outcome. `Edge Cases` keep the design's Key Edge Cases, else the issue's rows, word for word, and add validation, error and boundary cases. `Derived Test Matrix` has one row per testable behaviour, each with a target file and mapped to exactly one runbook task; issue rows stay word for word, and each in-scope audit behaviour has a row.
+- **Scenario detail:** `Process Sketch` restates the `Concrete Example` and `Edge Cases` as 3-7 `WHEN X → THEN Y` outcome lines, with no new examples. `Concrete Example` is one scenario: role, starting state, numbered steps, observable outcome. `Edge Cases` keep the design's Key Edge Cases, else the issue's rows, word for word, and add validation, error and boundary cases. `Derived Test Matrix` has one row per testable behaviour, each with a target file and a `Task` cell naming the one runbook task that lands its test; issue rows stay word for word, and each in-scope audit behaviour has a row.
 - **Test tiers:** A `Derived Test Matrix` row's `Type` is a tier name exactly as `docs/testing.md` writes it, picked by its tier-selection rubric: the lowest tier that exercises the behaviour, or several. Boundary rows reach the real boundary and assert a ground-truth signal, with `@live` for an external or deployed boundary.
 - **Open questions:** Each open question gives 2-3 options with their trade-offs as the lettered `Options: A) {option} — {trade-off} · B) …`, a `Recommended` naming the chosen letter and the default if unanswered; the design's options and recommendation carry forward where it already answered. Each assumption names what breaks if it is wrong.
 - **Out of Scope:** Plan work is in scope by default. An `Out of Scope` row is `Exempt` only when no `Success Criteria`, `Acceptance Scenario`, `Derived Test Matrix` row or design item (non-goals aside) needs it, and it says why and where the item belongs. Required work parked there is a `Blocking` deferral and belongs in the runbook. Each `Exempt` row has a matching `docs/deferrals.jsonl` row; an audit `LOW` finding left out is an `Exempt` row.
diff --git a/.opencode/agents/bkit-ship-deferred-sweep.md b/.opencode/agents/bkit-ship-deferred-sweep.md
index 681ddf9c9..006a8a922 100644
--- a/.opencode/agents/bkit-ship-deferred-sweep.md
+++ b/.opencode/agents/bkit-ship-deferred-sweep.md
@@ -65,14 +65,15 @@ tools:
      - **If** shipped surfaces instruct consumers to run something that fails at runtime → mark item `Blocked`.
    - Any `Blocked` items → move to `Blocking Deferrals` and append test details with source evidence → set `Verdict` = `FAIL` via `Edit` immediately; do not defer to final pass.
    - Any leftover `Planned` items → mark items `Lazy` → move to `Lazy Deferrals` → append deferral rows to `docs/deferrals.jsonl` with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom); check existing entries first; set `reason` to `unjustified`, set `status` to `TRIAGED`.
-8. Scan supplied diff for any disabled tests (`.skip` / `.todo` / `.fixme` / `xfail`, `t.Skip()`, `#[ignore]`, `@Disabled` added, or assertions deleted); skips predating supplied diff do not count → record all under `Blocking Deferrals` with source evidence (`file:line`, test name) → set `Verdict` = `FAIL` via `Edit` immediately; do not defer to final pass.
-9. Scan `docs/deferrals.jsonl` for any plan related entries including recently appended rows → verify each `reason` holds at ship time as per `.bkit/jsonl.md` deferral reason tests; `reason` = `low-severity` with `severity` = `LOW` holds without the tests:
-   - **If** holds → record under / move to `Exempt Deferrals` → continue; append no row, `reason` is set once and carried verbatim.
-   - **Else** → record under / keep under `Lazy Deferrals` → append row to `docs/deferrals.jsonl` with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom), same `key` and prior fields verbatim, set `reason` to `unjustified`, set `status` to `TRIAGED`, `description` naming failed deferral tests.
+8. Scan the run's diff for disabled tests with `bkit branches scan-diff --disabled-tests --base=` the diff base your Context names — its `disabled` list holds each hit's `file:line` and test name → **If** exit 1 → record every entry under `Blocking Deferrals` with source evidence (`file:line`, test name) → set `Verdict` = `FAIL` via `Edit` immediately; do not defer to final pass.
+9. Bucket the plan-related deferral rows of the FID in your Context with `bkit ledgers triage --fid=` the FID in your Context `--plan=` the plan file. The verb applies the deferral tests and writes every `unjustified` / `TRIAGED` row itself; each of its `rows` carries the row's `key`, its `bucket` and the test result:
+   - **If** `bucket` = `Exempt` → record under / move to `Exempt Deferrals`; the row stands as written.
+   - **Else** → record under / keep under `Lazy Deferrals`, naming the tests the verb reports for it.
+   - **If** the plan file is absent → nothing to test against; record each plan-related row under `Exempt Deferrals` naming the missing plan.
 10. Update **Create** — set `Failures` via `Edit` = `Blocking Deferrals` entry count; set `Lazy` via `Edit` = `Lazy Deferrals` entry count.
 11. Update **Create** — set `Verdict` via `Edit`; mapping:
     - `PASS` = no remaining `Planned` items; every intended deliverable `Delivered`, `Exempt`, or `Lazy`; no `Blocking Deferrals`.
-    - `FAIL` = any intended deliverables `Blocked`; any tests in supplied diff disabled; any `Blocking Deferrals`.
+    - `FAIL` = any intended deliverables `Blocked`; any test the run's diff disabled; any `Blocking Deferrals`.
 
 **Output format:**
 
@@ -91,7 +92,7 @@ Lazy: <integer >= 0>
 
 ## Blocking Deferrals
 
-[Unmet deliverables that passed any blocking tests, and every test supplied diff disabled; per entry: test details with source evidence (`file:line`, test, grep); blocks merge. **If** none → `None`; initially set to `PENDING`.]
+[Unmet deliverables that passed any blocking tests, and every test the run's diff disabled; per entry: test details with source evidence (`file:line`, test, grep); blocks merge. **If** none → `None`; initially set to `PENDING`.]
 
 ## Exempt Deferrals
 
diff --git a/.opencode/agents/bkit-ship-update-docs.md b/.opencode/agents/bkit-ship-update-docs.md
index 2c2cb1350..2e7c796b0 100644
--- a/.opencode/agents/bkit-ship-update-docs.md
+++ b/.opencode/agents/bkit-ship-update-docs.md
@@ -58,7 +58,7 @@ tools:
 4. Per doc, always follow its `Rules` headers when making edits.
 5. Per doc, four passes in order: Sync content (gaps vs implementation) → reorganize structure (dedupe, move misplaced) → compress wording (more token-efficient) → update cross-references (inline `docs/*.md` links).
 6. Ensure agent memories (`MEMORY.md` / `memory/*.md`) do not duplicate content and only contain pointers (path, section, one-line hook) to relevant `docs/*.md` sections / `docs/*.jsonl` entries. **If** memory contains duplicate / stale content → update memory.
-7. Grep `docs/deferrals.jsonl` for `{FID}` matches → surface in output `Pending Items` for human review (do not write `docs/deferrals.jsonl`).
+7. Fill `Pending Items` from the `ship-pending-items.md` deferral scan supplied in your Read paths, one entry per line (do not write `docs/deferrals.jsonl`).
 8. Produce **Create** output.
 
 **Output format:**
@@ -76,7 +76,7 @@ tools:
 
 ## Pending Items
 
-[`{FID}` matches in `docs/deferrals.jsonl` for human review. **If** no matches → `None`.]
+[`{FID}` matches from the `ship-pending-items.md` deferral scan, for human review. **If** no matches → `None`.]
 
 ## Blockers
 
diff --git a/.opencode/commands/bkit-build.md b/.opencode/commands/bkit-build.md
index c5faecbc5..d54e4764a 100644
--- a/.opencode/commands/bkit-build.md
+++ b/.opencode/commands/bkit-build.md
@@ -133,7 +133,7 @@ $ARGUMENTS
      - Test-order gap or `exception-refused` gap → a `- **TEST EXCEPTION:**` field as the last field of the task's block in `docs/plans/{YYYYMM}/{FID}-plan.md`, one sub-bullet per test in `TEST FIRST` form, each ending `— {human's reason} (owner, {YYYY-MM-DD})`; a task with no `TEST FIRST` → the field holds `{human's reason} (owner, {YYYY-MM-DD})` alone. The field replaces the task's existing `TEST EXCEPTION` field; NEVER add a second.
      - Other → append one `docs/decisions.jsonl` row with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom); `by.step` = `build-decision`; `summary` names `{FID}`, step `{PAUSE_STEP}` and the gap or finding; `rationale` = `accepted by owner: {human's reason}`. An item that is a challenge task → also tick it `[x]` in the plan and end its title with ` — accepted by owner`.
    - **Accept (assumed)** (written by `decisions apply`) → write nothing else: no `docs/decisions.jsonl` row, no `TEST EXCEPTION`. An item that is a challenge task → tick it `[x]` and end its title with ` — accepted (assumed)`. Ship asks the owner to confirm it.
-   - **Fix now** → an item that is a challenge task → keep that task open; it runs as it is. **Else** → write a task block (`docs/templates/bkit-plan.md` § Agent Execution Runbook) numbered one above the plan's highest task, with `**DONE WHEN:**` and `**TEST FIRST:**` (one sub-bullet per test, `` `{test file}` `{test name}` fails on {what goes wrong} ``); the human's direction, when given, shapes the task:
+   - **Fix now** → an item that is a challenge task → keep that task open; it runs as it is. **Else** → write a task block (`docs/templates/bkit-plan.md` § Agent Execution Runbook) numbered one above the plan's highest task, with `**DONE WHEN:**` and `**TEST FIRST:**` (one sub-bullet per test, `` `{test file}` `{test name}` fails on {what goes wrong} ``), and one `Derived Test Matrix` row per test in that `TEST FIRST` (``| {test name} | {tier} | `{test file}` | {task} |``, the tier its file's name gives); the human's direction, when given, shapes the task:
      - `From: verify` and group `{GROUP}` stays within `{MAX_TASKS_PER_GROUP}` tasks and `{MAX_TESTS_PER_GROUP}` `TEST FIRST` tests with it → inside group `{GROUP}`.
      - `From: verify`, over either cap → a new group right after `{GROUP}`; add 1 to every later group's number, in its markers and `### GROUP` heading.
      - `From: tests` or `From: challenge` → a new last group, each new group within the caps.
@@ -326,7 +326,7 @@ $ARGUMENTS
    ```
    Route:
    - **If** exit 0 **and** (`NEWER_COMMENTS` = 0 **or** `CONVERTED` is held) → sub-step 5.
-   - **If** `CONVERTED` is not held **and** (exit 0 with `NEWER_COMMENTS` > 0, **or** exit 2 with no `docs/plans/{YYYYMM}/{FID}-plan.md`, **or** exit 1 with a `markers` problem) → sub-step 3.
+   - **If** `CONVERTED` is not held **and** (exit 0 with `NEWER_COMMENTS` > 0, **or** exit 2 with no `docs/plans/{YYYYMM}/{FID}-plan.md`, **or** exit 1 with a `markers`, `matrix` or `supersession` problem) → sub-step 3.
    - **If** exit 1, `CONVERTED` is held **and** `CONVERT_RETRY` is not held → `CONVERT_RETRY` = the printed `problems` → sub-step 3.
    - **Else** → **Failure Path** naming each problem in the report.
 3. **Subagent:** Invoke `/bkit-build-plan-convert` using `subagent` tool:
@@ -432,8 +432,12 @@ One pass of Steps 6-8 per plan group, in group order: Step 6 briefs the first gr
    "{BKIT}" steps finish --workflow=build --step=build-plan-execute --file="{STATUS}" --attempt-of=build-plan-execute:next --group={GROUP} --agent=bkit-build-plan-execute --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-execute-{GROUP}-log.md --message="chore({FID}): plan-execute group {GROUP} attempt <attempt>" --number=6 --post --title="Plan Execute"
    ```
    Hold `verdict` as `EXECUTE_VERDICT`.
-5. Route — the log's `DONE` and `BLOCKED` lines are the handover; only Step 7 ticks tasks:
-   - **If** (`EXECUTE_VERDICT` = HANDOVER **or** a task of `GROUP_TASKS` has neither a `DONE — TASK {N}` nor a `BLOCKED — TASK {N}` line in the log) **and** `EXECUTE_RESUMED` is not held for `GROUP` → the agent stopped at its turn cap: a handover, not a failed attempt → `EXECUTE_RESUMED` = `GROUP` → re-run Step 6; its brief leaves out the `DONE` tasks.
+5. Route — the engine reads the group's open tasks:
+   ```bash
+   "{BKIT}" tasks open --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --group={GROUP} --log="docs/plans/{YYYYMM}/logs/{FID}/build-plan-execute-{GROUP}-log.md"
+   ```
+   Hold `handover` as `EXECUTE_HANDOVER`.
+   - **If** (`EXECUTE_VERDICT` = HANDOVER **or** `EXECUTE_HANDOVER` = true) **and** `EXECUTE_RESUMED` is not held for `GROUP` → the agent stopped at its turn cap: a handover, not a failed attempt → `EXECUTE_RESUMED` = `GROUP` → re-run Step 6; its brief leaves out the `DONE` tasks.
    - **Else** → Step 7.
 
 ### 🔒 Gate 6 — Plan Execute
@@ -468,33 +472,40 @@ One pass of Steps 6-8 per plan group, in group order: Step 6 briefs the first gr
 4. **Subagent:** Invoke `/bkit-build-plan-verify` using `subagent` tool:
    Context: You are a subagent in the Build phase. Group verification. Group `{GROUP}`, attempt `{VERIFY_ATTEMPT}`. Switch into working directory `cd "{WORKTREE_PATH}"` → verify with `pwd` → use for all subsequent file operations. Plan caps (`bkit.workflows.tasks`): {MAX_TASKS_PER_GROUP} tasks and {MAX_TESTS_PER_GROUP} `TEST FIRST` tests per group; {MAX_TESTS_PER_TASK} tests across {MAX_TEST_FILES_PER_TASK} test files per task.
    Read: glob `docs/plans/{YYYYMM}/logs/{FID}/build-brief-{GROUP}-*.md`, `docs/plans/{YYYYMM}/logs/{FID}/build-diff-{GROUP}-{VERIFY_ATTEMPT}.md`, `docs/plans/{YYYYMM}/logs/{FID}/build-plan-execute-{GROUP}-log.md`, `docs/plans/{YYYYMM}/logs/{FID}/build-tests-green-{GROUP}-{VERIFY_ATTEMPT}.md`, `docs/plans/{YYYYMM}/logs/{FID}/build-plan-current.md` (if present), glob `docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-{GROUP}-*.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-{GROUP}-*-log.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-decision-*.md`.
-   Update: `docs/plans/{YYYYMM}/{FID}-plan.md` (tick only group `{GROUP}`'s tasks).
    Create: `docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-{GROUP}-{VERIFY_ATTEMPT}.md`.
 5. Finish:
    ```bash
    "{BKIT}" steps finish --workflow=build --step=build-plan-verify --file="{STATUS}" --attempt-of=build-plan-verify:next --group={GROUP} --agent=bkit-build-plan-verify --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-{GROUP}-<attempt>.md" --message="chore({FID}): plan-verify group {GROUP} attempt <attempt>" --number=7 --post --title="Plan Verify"
    ```
-   Hold `verdict` as `VERIFY_VERDICT`, `failures` as `VERIFY_FAILURES`, `fields.Fixable` as `VERIFY_FIXABLE`.
-6. Route:
+   Hold `verdict` as `VERIFY_VERDICT`, `failures` as `VERIFY_FAILURES`, `fields.Fixable` as `VERIFY_FIXABLE`, `fields.Tasks` as `{VERIFIED_TASKS}`.
+6. Tick the plan with the satisfied task numbers; a task the test-first report gaps stays open:
+   ```bash
+   "{BKIT}" tasks tick --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --group={GROUP} --tasks="{VERIFIED_TASKS}" --green="docs/plans/{YYYYMM}/logs/{FID}/build-tests-green-{GROUP}-{VERIFY_ATTEMPT}.md"
+   ```
+7. Route:
    - **If** `VERIFY_VERDICT` = PASS → list the plan's groups:
      ```bash
      "{BKIT}" tests plan-check --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --existence=report --log="{OUTBOX}/build-plan-check-{GROUP}.md"
      ```
-     **If** exit non-zero → **Failure Path**. **If** the printed `groups` hold a group numbered above `GROUP` → sub-step 7. **Else** → `GATE_VERDICT` = SKIPPED → sub-step 9.
-   - **Else** → `GATE_VERDICT` = SKIPPED → sub-step 9.
-7. Run the group gate; it writes the trimmed log to the artifact:
+     Route:
+     - **If** exit 1 with a `matrix` or `supersession` problem, **and** `CONVERT_RETRY` is not held → `CONVERT_RETRY` = the printed `problems` → Step 3 sub-step 3.
+     - **If** exit non-zero → **Failure Path**.
+     - **If** the printed `groups` hold a group numbered above `GROUP` → sub-step 8.
+     - **Else** → `GATE_VERDICT` = SKIPPED → sub-step 10.
+   - **Else** → `GATE_VERDICT` = SKIPPED → sub-step 10.
+8. Run the group gate; it writes the trimmed log to the artifact:
    ```bash
    "{BKIT}" tests run --gate=bkit:gate:static-unit-integration --gate=bkit:gate:static-unit --log="{OUTBOX}/build-group-gate-{GROUP}-{VERIFY_ATTEMPT}.log" --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-group-gate-{GROUP}-{VERIFY_ATTEMPT}.md" --fid={FID} --step=build-group-gate-{GROUP} --attempt={VERIFY_ATTEMPT}
    ```
    Route:
-   - **If** exit 0 **or** 1 → hold `verdict` as `{GATE_VERDICT}`, `scope` as `{TEST_SCOPE}` → sub-step 8.
+   - **If** exit 0 **or** 1 → hold `verdict` as `{GATE_VERDICT}`, `scope` as `{TEST_SCOPE}` → sub-step 9.
    - **Else** → **Failure Path**.
-8. Finish:
+9. Finish:
    ```bash
    "{BKIT}" steps finish --workflow=build --step=build-group-gate --file="{STATUS}" --verdict={GATE_VERDICT} --scope="{TEST_SCOPE}" --attempt-of=build-plan-verify:current --group={GROUP} --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-group-gate-{GROUP}-<attempt>.md" --clamp-log="build-group-gate-{GROUP}:<attempt>" --message="chore({FID}): group-gate group {GROUP} attempt <attempt>" --number=7 --post --title="Group Gate"
    ```
-9. **If** `VERIFY_VERDICT` = PASS **and** `GATE_VERDICT` != FAIL → Step 6 (the next group, or Step 9 when none is open).
-10. **If** `VERIFY_VERDICT` = CONCERNS or FAIL, **or** `GATE_VERDICT` = FAIL → route on the group's verify rounds:
+10. **If** `VERIFY_VERDICT` = PASS **and** `GATE_VERDICT` != FAIL → Step 6 (the next group, or Step 9 when none is open).
+11. **If** `VERIFY_VERDICT` = CONCERNS or FAIL, **or** `GATE_VERDICT` = FAIL → route on the group's verify rounds:
     ```bash
     "{BKIT}" counters route --name=VERIFY_ATTEMPT --of=build-plan-verify:current --file="{STATUS}" --workflow=build --group={GROUP} --point=build.verify --continue=within-limit --exceeded=failure-path
     ```
@@ -507,7 +518,7 @@ One pass of Steps 6-8 per plan group, in group order: Step 6 briefs the first gr
     - **If** exit 0 **and** `VERIFY_ROUNDS` < `PAUSE_MAX` → `PAUSE_QUESTION` = `VERIFY_LOOP` → **Decision Pause**.
     - **If** exit 0 → `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause** (no round left: decide the open gaps).
     - **Else** → **Failure Path**.
-11. **Else** → **Failure Path**.
+12. **Else** → **Failure Path**.
 
 ### 🔒 Gate 7 — Plan Verify
 
@@ -523,7 +534,7 @@ One pass of Steps 6-8 per plan group, in group order: Step 6 briefs the first gr
 
 ### 🧠 Step 8 — Plan Gaps Remediate
 
-**Run only if** Step 7 sub-step 10 or the **Decision Pause** routed here.
+**Run only if** Step 7 sub-step 12 or the **Decision Pause** routed here.
 
 1. Read status.jsonl and derive next `STRATEGY`:
    ```bash
@@ -592,7 +603,12 @@ Runs once, after the last group; challenge fix groups pass through here on the w
    ```bash
    "{BKIT}" steps finish --workflow=build --step=build-plan-verify-holistic --file="{STATUS}" --attempt=1 --agent=bkit-build-plan-verify --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-holistic.md --message="chore({FID}): plan-verify-holistic" --number=9 --post --title="Plan Verify Holistic"
    ```
-4. Route:
+   Hold `fields.Tasks` as `{VERIFIED_TASKS}`.
+4. Tick each group's satisfied tasks — one call per plan group, `{GROUP}` that group and `{VERIFIED_TASKS}` the numbers `Tasks:` names for it:
+   ```bash
+   "{BKIT}" tasks tick --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --group={GROUP} --tasks="{VERIFIED_TASKS}"
+   ```
+5. Route:
    - **If** `verdict` = PASS or CONCERNS → Step 10.
    - **Else** → **Failure Path**.
 
diff --git a/.opencode/commands/bkit-ship.md b/.opencode/commands/bkit-ship.md
index 19f4ae647..26b5a77e2 100644
--- a/.opencode/commands/bkit-ship.md
+++ b/.opencode/commands/bkit-ship.md
@@ -371,7 +371,7 @@ $ARGUMENTS
    cd "{WORKTREE_PATH}" && "{BKIT}" context diff --reset-log --artifact="tmp/bkit-diff-{FID}.md" --fid={FID} --step=ship-deferred-sweep >/dev/null || exit 2
    ```
    **Subagent:** Invoke `/bkit-ship-deferred-sweep` using `subagent` tool:
-   Context: You are a subagent in the Ship phase. Pre-merge completeness gate. Switch into working directory `cd "{WORKTREE_PATH}"` → verify with `pwd` → use for all subsequent file operations.
+   Context: You are a subagent in the Ship phase. Pre-merge completeness gate. Diff base: `origin/dev` — run `bkit branches scan-diff --disabled-tests --base=origin/dev`. Switch into working directory `cd "{WORKTREE_PATH}"` → verify with `pwd` → use for all subsequent file operations.
    Read: `docs/plans/{YYYYMM}/logs/{FID}/ship-input-{RUN}.md`, `docs/plans/{YYYYMM}/{FID}-plan.md` (if present), `docs/plans/{YYYYMM}/{FID}-design.md` (if present), `{STATUS}`, `docs/deferrals.jsonl`, glob `docs/plans/{YYYYMM}/logs/{FID}/*-plan-verify*.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/*-challenge*.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/*-summary.md`, `tmp/bkit-diff-{FID}.md` (the run's diff).
    Create: `docs/plans/{YYYYMM}/logs/{FID}/ship-deferred-sweep.md`.
 3. Finish (bookkeeping to `$BOOK_ROOT`):
@@ -396,26 +396,30 @@ $ARGUMENTS
 
 ## 🧠 Step 6 — Update Docs & Summary
 
-1. **Subagent:** Invoke `/bkit-ship-update-docs` using `subagent` tool:
+1. Write the FID's deferral lines to the artifact the docs agent reads `Pending Items` from:
+   ```bash
+   cd "{WORKTREE_PATH}" && "{BKIT}" context ledger-scan --terms="{FID}" --source=docs/deferrals.jsonl --artifact="{OUTBOX}/ship-pending-items.md" --fid={FID} --step=ship-update-docs --reset-log >/dev/null || exit 1
+   ```
+2. **Subagent:** Invoke `/bkit-ship-update-docs` using `subagent` tool:
    Context: You are a subagent in the Ship phase. Switch into working directory `cd "{WORKTREE_PATH}"` → verify with `pwd` → use for all subsequent file operations.
-   Read: `docs/plans/{YYYYMM}/{FID}-plan.md` (if present), glob `docs/plans/{YYYYMM}/logs/{FID}/*.md` (excluding `*-summary.md` / `*-handover.md`).
+   Read: `docs/plans/{YYYYMM}/{FID}-plan.md` (if present), glob `docs/plans/{YYYYMM}/logs/{FID}/*.md` (excluding `*-summary.md` / `*-handover.md`), `{OUTBOX}/ship-pending-items.md`.
    Update: Doc files.
    Create: `docs/plans/{YYYYMM}/logs/{FID}/ship-update-docs.md`.
-2. Wait for the subagent to complete, then append the `SHIPPED` row to the worktree ledger and re-render the mechanical `roadmap-status` board from it (exit 1 when the row did not land), and finish the step (bookkeeping to `$BOOK_ROOT`):
+3. Wait for the subagent to complete, then append the `SHIPPED` row to the worktree ledger and re-render the mechanical `roadmap-status` board from it (exit 1 when the row did not land), and finish the step (bookkeeping to `$BOOK_ROOT`):
    ```bash
    "{BKIT}" roadmap feature --root="{WORKTREE_PATH}" --workflow=ship --fid="{FID}" --step=ship-update-docs --strict >/dev/null || exit 1
    "{BKIT}" steps finish --workflow=ship --step=ship-update-docs --file="{STATUS}" --artifact="docs/plans/{YYYYMM}/logs/{FID}/ship-update-docs.md" --commit=none >/dev/null || exit 1
    ```
-3. Write `ship-summary.md` from this run's status rows and the PR's size:
+4. Write `ship-summary.md` from this run's status rows and the PR's size:
    ```bash
    "{BKIT}" workflows summary --workflow=ship --file="{STATUS}" --pr={PR_NUMBER}
    ```
    **If** exit non-zero → **Failure Path**. Hold `verdict` as `SUMMARY_VERDICT`, `failures` as `SUMMARY_FAILURES`.
-4. Finish (bookkeeping to `$BOOK_ROOT`):
+5. Finish (bookkeeping to `$BOOK_ROOT`):
    ```bash
    "{BKIT}" steps finish --workflow=ship --step=ship-summary --file="{STATUS}" --attempt=1 --verdict={SUMMARY_VERDICT} --failures={SUMMARY_FAILURES} --artifact="docs/plans/{YYYYMM}/logs/{FID}/ship-summary.md" --commit=none --number=6 --post --title="Update Docs & Summary" --link-ref=dev --comment-body
    ```
-5. Route:
+6. Route:
    - **If** `SUMMARY_VERDICT` = PASS or CONCERNS → Step 7.
    - **If** `SUMMARY_VERDICT` = FAIL → display `ship-summary.md` content verbatim as final message to user. Line 1 of the final message = the no-issue warning, when one was emitted. → **Failure Path**.
    - **Else** → **Failure Path**.
diff --git a/docs/capabilities.md b/docs/capabilities.md
index ff7a12b5f..152dccdbb 100644
--- a/docs/capabilities.md
+++ b/docs/capabilities.md
@@ -27,7 +27,7 @@
 > - `budgeted` = solid border + blue box. Still drawn, because a declared bypass is still a bypass, but it is settled, not an open question.
 > - Which status is which: `split` fine dash · `bypassed` long dash · `dead` even dash · `gap` dotted · `budgeted` no dash.
 > - A fetched URL is a STRING, never an edge, because `assert-routes-reachable.mjs` is the only check that sees it.
-> - Table rescanned every run, never stale. Diagrams from `graph.json` @ `84f596709`; when that differs from HEAD ⇒ run `pnpm graph:update` first.
+> - Table rescanned every run, never stale. Diagrams from `graph.json` @ `094f40ca9`; when that differs from HEAD ⇒ run `pnpm graph:update` first.
 > - Detail-level module graph → `pnpm graph`. This doc is the altitude above that: capabilities, not files.
 
 ## Status Vocabulary
@@ -77,15 +77,15 @@ Not scanned; run the rollup with `--reachability`.
 
 ## Import-time side effects
 
-14 module-scope side effects in 5 of 106 source files. A call here runs on **import**, not on first use, so every file downstream pays for it, because under Jest that is a mandatory stub in tests that never touch the thing. Sorted by reach.
+14 module-scope side effects in 5 of 107 source files. A call here runs on **import**, not on first use, so every file downstream pays for it, because under Jest that is a mandatory stub in tests that never touch the thing. Sorted by reach.
 
 <!-- prettier-ignore -->
 | File | Evaluates at import | Downstream files | of which tests |
 | --- | --- | --- | --- |
-| `.bkit/core/engine/shared/text.ts` | `Symbol` | 182 | 109 |
-| `.bkit/core/engine/checks/tips/index.ts` | `STAR_TIP.replace` | 173 | 104 |
-| `.bkit/core/engine/commands/workflow/branches.ts` | `LEDGERS.map` | 173 | 104 |
-| `.bkit/core/engine/commands/workflow/workflows.ts` | `Error` | 173 | 104 |
+| `.bkit/core/engine/shared/text.ts` | `Symbol` | 184 | 110 |
+| `.bkit/core/engine/checks/tips/index.ts` | `STAR_TIP.replace` | 175 | 105 |
+| `.bkit/core/engine/commands/workflow/branches.ts` | `LEDGERS.map` | 175 | 105 |
+| `.bkit/core/engine/commands/workflow/workflows.ts` | `Error` | 175 | 105 |
 
 1 further file nothing imports, though an entrypoint is supposed to do work when it loads. In the JSON report only.
 
@@ -174,8 +174,8 @@ config:
     useMaxWidth: false
 ---
 flowchart LR
-  %% Generated by bkit-graphify-rollup.py from 84f59670947bda23bd5ccce2c3632651e574a4c6 — do not edit
-  n_bkit_core[".bkit/core<br/>2521 symbols · 117 files<br/>Cursor API access · 1 of 2 sites skip the owner"]
+  %% Generated by bkit-graphify-rollup.py from 094f40ca9acab2fa516bf8df815d888c6ead89d5 — do not edit
+  n_bkit_core[".bkit/core<br/>2570 symbols · 118 files<br/>Cursor API access · 1 of 2 sites skip the owner"]
   nscripts_harvest["scripts/harvest<br/>199 symbols · 2 files"]
   nscripts_harvest -->|21| n_bkit_core
   style n_bkit_core stroke:#65a30d,stroke-width:4px,stroke-dasharray:8 4,fill:#ffcc80,color:#1f2328
@@ -199,7 +199,7 @@ config:
     useMaxWidth: false
 ---
 flowchart LR
-  %% Generated by bkit-graphify-rollup.py from 84f59670947bda23bd5ccce2c3632651e574a4c6 — do not edit
+  %% Generated by bkit-graphify-rollup.py from 094f40ca9acab2fa516bf8df815d888c6ead89d5 — do not edit
   subgraph gncustom_health_checks["Health checks"]
     n_bkit_core_engine_checks_after_index[".bkit/core/engine/checks/after/index<br/>11 symbols · 1 files"]
     n_bkit_core_engine_checks_before_index[".bkit/core/engine/checks/before/index<br/>4 symbols · 1 files"]
@@ -251,17 +251,17 @@ flowchart LR
       n_bkit_core_engine_commands_lib["lib<br/>53 symbols · 1 files"]
       n_bkit_core_engine_commands_setup_setup[".bkit/core/engine/commands/setup/setup<br/>11 symbols · 1 files"]
       subgraph gn_bkit_core_engine_commands_workflow[".bkit/core/engine/commands/workflow"]
-        n_bkit_core_engine_commands_workflow_branches["branches<br/>87 symbols · 1 files"]
-        n_bkit_core_engine_commands_workflow_challenge["challenge<br/>32 symbols · 1 files"]
+        n_bkit_core_engine_commands_workflow_branches["branches<br/>92 symbols · 1 files"]
+        n_bkit_core_engine_commands_workflow_challenge["challenge<br/>34 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_context["context<br/>85 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_counters["counters<br/>15 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_decisions["decisions<br/>26 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_disk["disk<br/>48 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_fids["fids<br/>56 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_issues["issues<br/>45 symbols · 1 files"]
-        n_bkit_core_engine_commands_workflow_ledgers["ledgers<br/>79 symbols · 1 files"]
+        n_bkit_core_engine_commands_workflow_ledgers["ledgers<br/>99 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_locks["locks<br/>31 symbols · 1 files"]
-        n_bkit_core_engine_commands_workflow_plan_blocks["plan-blocks<br/>24 symbols · 1 files"]
+        n_bkit_core_engine_commands_workflow_plan_blocks["plan-blocks<br/>31 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_prs["prs<br/>53 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_repo["repo<br/>12 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_roadmap["roadmap<br/>37 symbols · 1 files"]
@@ -271,7 +271,8 @@ flowchart LR
         n_bkit_core_engine_commands_workflow_status["status<br/>34 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_steps["steps<br/>48 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_summary["summary<br/>19 symbols · 1 files"]
-        n_bkit_core_engine_commands_workflow_tests["tests<br/>77 symbols · 1 files"]
+        n_bkit_core_engine_commands_workflow_tasks["tasks<br/>11 symbols · 1 files"]
+        n_bkit_core_engine_commands_workflow_tests["tests<br/>81 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_tracker["tracker<br/>72 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_workflows["workflows<br/>81 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_workstreams["workstreams<br/>9 symbols · 1 files"]
@@ -312,8 +313,8 @@ flowchart LR
   n_bkit_core_engine_commands_workflow_runs -->|54| n_bkit_core_engine_commands_lib
   n_bkit_core_engine_commands_workflow_prs -->|53| n_bkit_core_engine_commands_lib
   n_bkit_core_engine_commands_workflow_issues -->|37| n_bkit_core_engine_commands_workflow_tracker
+  n_bkit_core_engine_commands_workflow_ledgers -->|35| n_bkit_core_engine_commands_lib
   n_bkit_core_engine_commands_workflow_worktrees -->|33| n_bkit_core_engine_commands_lib
-  n_bkit_core_engine_commands_workflow_ledgers -->|32| n_bkit_core_engine_commands_lib
   n_bkit_core_engine_commands_workflow_issues -->|31| n_bkit_core_engine_commands_lib
   n_bkit_core_engine_commands_workflow_workflows -->|30| n_bkit_core_engine_commands_workflow_run_facts
   n_bkit_core_engine_commands_ci_ci -->|28| n_bkit_core_engine_commands_lib
@@ -327,9 +328,9 @@ flowchart LR
   n_bkit_core_engine_commands_workflow_workflows -->|21| n_bkit_core_engine_commands_workflow_locks
   n_bkit_core_engine_tools_instructions -->|20| n_bkit_core_engine_tools_instructions_sources
   n_bkit_core_engine_checks_after_index -->|19| n_bkit_core_engine_checks_after_ci_yml
+  n_bkit_core_engine_commands_workflow_ledgers -->|19| n_bkit_core_engine_ledgers_telemetry
   n_bkit_core_engine_commands_workflow_status -->|19| n_bkit_core_engine_commands_lib
   n_bkit_core_engine_commands_workflow_workflows -->|19| n_bkit_core_engine_commands_workflow_issues
-  n_bkit_core_engine_commands_workflow_ledgers -->|18| n_bkit_core_engine_ledgers_telemetry
   n_bkit_core_engine_commands_workflow_prs -->|18| n_bkit_core_engine_ledgers_status
   n_bkit_core_engine_commands_workflow_roadmap -->|18| n_bkit_core_engine_commands_lib
   n_bkit_core_engine_checks_before_index -->|17| n_bkit_core_engine_checks_before_repo
@@ -356,6 +357,7 @@ flowchart LR
   n_bkit_core_engine_checks_after_index -->|13| n_bkit_core_engine_checks_after_github
   n_bkit_core_engine_commands_workflow_run_facts -->|13| n_bkit_core_engine_ledgers_telemetry
   n_bkit_core_engine_commands_workflow_runs -->|13| n_bkit_core_engine_commands_workflow_prs
+  n_bkit_core_engine_commands_workflow_tests -->|13| n_bkit_core_engine_commands_workflow_plan_blocks
   n_bkit_core_engine_commands_workflow_worktrees -->|13| n_bkit_core_engine_commands_workflow_ledgers
   n_bkit_core_engine_render_hosts -->|13| n_bkit_core_engine_render_models
   n_bkit_core_engine_checks_before_repo -->|12| n_bkit_core_engine_shared_settings
@@ -403,7 +405,7 @@ flowchart LR
   n_bkit_core_engine_commands_workflow_locks -->|9| n_bkit_core_engine_ledgers_status
   n_bkit_core_engine_commands_workflow_run_facts -->|9| n_bkit_core_engine_shared_json
   n_bkit_core_engine_commands_workflow_steps -->|9| n_bkit_core_engine_commands_workflow_tracker
-  n_bkit_core_engine_commands_workflow_tests -->|9| n_bkit_core_engine_commands_workflow_plan_blocks
+  n_bkit_core_engine_commands_workflow_tasks -->|9| n_bkit_core_engine_commands_lib
   n_bkit_core_engine_install_modules_antigravity -->|9| n_bkit_core_engine_shared_package_roots
   n_bkit_core_engine_install_modules_claude -->|9| n_bkit_core_engine_shared_package_roots
   n_bkit_core_engine_install_modules_codex -->|9| n_bkit_core_engine_shared_package_roots
@@ -413,7 +415,10 @@ flowchart LR
   n_bkit_core_engine_install_modules_opencode -->|9| n_bkit_core_engine_render_models
   n_bkit_core_engine_install_modules_opencode -->|9| n_bkit_core_engine_shared_package_roots
   n_bkit_core_engine_commands_install_upgrade -->|8| n_bkit_core_engine_shared_package_roots
+  n_bkit_core_engine_commands_workflow_challenge -->|8| n_bkit_core_engine_commands_workflow_plan_blocks
   n_bkit_core_engine_commands_workflow_context -->|8| n_bkit_core_engine_commands_workflow_plan_blocks
+  n_bkit_core_engine_commands_workflow_ledgers -->|8| n_bkit_core_engine_commands_workflow_plan_blocks
+  n_bkit_core_engine_commands_workflow_tasks -->|8| n_bkit_core_engine_commands_workflow_plan_blocks
   n_bkit_core_engine_commands_workflow_workflows -->|8| n_bkit_core_engine_commands_workflow_worktrees
   n_bkit_core_engine_commands_workflow_workflows -->|8| n_bkit_core_engine_commands_land
   n_bkit_core_engine_install_modules_antigravity -->|8| n_bkit_core_engine_install_write
@@ -462,7 +467,6 @@ flowchart LR
   n_bkit_core_engine_commands_install_uninstall -->|6| n_bkit_core_engine_shared_json
   n_bkit_core_engine_commands_install_upgrade -->|6| n_bkit_core_engine_shared_package_json
   n_bkit_core_engine_commands_install_upgrade -->|6| n_bkit_core_engine_install_write
-  n_bkit_core_engine_commands_workflow_challenge -->|6| n_bkit_core_engine_commands_workflow_plan_blocks
   n_bkit_core_engine_commands_workflow_challenge -->|6| n_bkit_core_engine_commands_workflow_tests
   n_bkit_core_engine_commands_workflow_counters -->|6| n_bkit_core_engine_shared_settings
   n_bkit_core_engine_commands_workflow_issues -->|6| n_bkit_core_engine_shared_settings
@@ -527,6 +531,7 @@ flowchart LR
   style n_bkit_core_engine_commands_workflow_status stroke:#0891b2,stroke-width:2px
   style n_bkit_core_engine_commands_workflow_steps stroke:#1d4ed8,stroke-width:2px
   style n_bkit_core_engine_commands_workflow_summary stroke:#2563eb,stroke-width:2px
+  style n_bkit_core_engine_commands_workflow_tasks stroke:#8b949e,stroke-width:2px
   style n_bkit_core_engine_commands_workflow_tests stroke:#8250df,stroke-width:2px
   style n_bkit_core_engine_commands_workflow_tracker stroke:#0891b2,stroke-width:2px
   style n_bkit_core_engine_commands_workflow_workflows stroke:#8b949e,stroke-width:2px
@@ -570,9 +575,9 @@ flowchart LR
   linkStyle 17 stroke:#0e7490,stroke-width:2px
   linkStyle 18 stroke:#bf3989,stroke-width:2px
   linkStyle 19 stroke:#9a6700,stroke-width:2px
-  linkStyle 20 stroke:#be123c,stroke-width:2px
-  linkStyle 21 stroke:#4d7c0f,stroke-width:2px
-  linkStyle 22 stroke:#65a30d,stroke-width:2px
+  linkStyle 20 stroke:#65a30d,stroke-width:2px
+  linkStyle 21 stroke:#be123c,stroke-width:2px
+  linkStyle 22 stroke:#4d7c0f,stroke-width:2px
   linkStyle 23 stroke:#2563eb,stroke-width:2px
   linkStyle 24 stroke:#be123c,stroke-width:2px
   linkStyle 25 stroke:#0969da,stroke-width:2px
@@ -599,121 +604,124 @@ flowchart LR
   linkStyle 46 stroke:#4d7c0f,stroke-width:2px
   linkStyle 47 stroke:#65a30d,stroke-width:2px
   linkStyle 48 stroke:#9a6700,stroke-width:2px
-  linkStyle 49 stroke:#b45309,stroke-width:2px
-  linkStyle 50 stroke:#be123c,stroke-width:2px
-  linkStyle 51 stroke:#9a6700,stroke-width:2px
-  linkStyle 52 stroke:#be123c,stroke-width:2px
+  linkStyle 49 stroke:#c2410c,stroke-width:2px
+  linkStyle 50 stroke:#b45309,stroke-width:2px
+  linkStyle 51 stroke:#be123c,stroke-width:2px
+  linkStyle 52 stroke:#9a6700,stroke-width:2px
   linkStyle 53 stroke:#be123c,stroke-width:2px
   linkStyle 54 stroke:#be123c,stroke-width:2px
-  linkStyle 55 stroke:#65a30d,stroke-width:2px
-  linkStyle 56 stroke:#be123c,stroke-width:2px
-  linkStyle 57 stroke:#65a30d,stroke-width:2px
-  linkStyle 58 stroke:#5b8c00,stroke-width:2px
-  linkStyle 59 stroke:#1a7f37,stroke-width:2px
-  linkStyle 60 stroke:#b45309,stroke-width:2px
-  linkStyle 61 stroke:#b91c1c,stroke-width:2px
-  linkStyle 62 stroke:#0891b2,stroke-width:2px
-  linkStyle 63 stroke:#be123c,stroke-width:2px
-  linkStyle 64 stroke:#b45309,stroke-width:2px
-  linkStyle 65 stroke:#0891b2,stroke-width:2px
-  linkStyle 66 stroke:#a21caf,stroke-width:2px
-  linkStyle 67 stroke:#b45309,stroke-width:2px
-  linkStyle 68 stroke:#2563eb,stroke-width:2px
-  linkStyle 69 stroke:#0891b2,stroke-width:2px
-  linkStyle 70 stroke:#9a6700,stroke-width:2px
-  linkStyle 71 stroke:#0891b2,stroke-width:2px
-  linkStyle 72 stroke:#b45309,stroke-width:2px
-  linkStyle 73 stroke:#be123c,stroke-width:2px
-  linkStyle 74 stroke:#0891b2,stroke-width:2px
-  linkStyle 75 stroke:#d73a4a,stroke-width:2px
+  linkStyle 55 stroke:#be123c,stroke-width:2px
+  linkStyle 56 stroke:#65a30d,stroke-width:2px
+  linkStyle 57 stroke:#be123c,stroke-width:2px
+  linkStyle 58 stroke:#65a30d,stroke-width:2px
+  linkStyle 59 stroke:#5b8c00,stroke-width:2px
+  linkStyle 60 stroke:#1a7f37,stroke-width:2px
+  linkStyle 61 stroke:#b45309,stroke-width:2px
+  linkStyle 62 stroke:#b91c1c,stroke-width:2px
+  linkStyle 63 stroke:#0891b2,stroke-width:2px
+  linkStyle 64 stroke:#be123c,stroke-width:2px
+  linkStyle 65 stroke:#b45309,stroke-width:2px
+  linkStyle 66 stroke:#0891b2,stroke-width:2px
+  linkStyle 67 stroke:#a21caf,stroke-width:2px
+  linkStyle 68 stroke:#b45309,stroke-width:2px
+  linkStyle 69 stroke:#2563eb,stroke-width:2px
+  linkStyle 70 stroke:#0891b2,stroke-width:2px
+  linkStyle 71 stroke:#9a6700,stroke-width:2px
+  linkStyle 72 stroke:#0891b2,stroke-width:2px
+  linkStyle 73 stroke:#b45309,stroke-width:2px
+  linkStyle 74 stroke:#be123c,stroke-width:2px
+  linkStyle 75 stroke:#0891b2,stroke-width:2px
   linkStyle 76 stroke:#d73a4a,stroke-width:2px
-  linkStyle 77 stroke:#c026d3,stroke-width:2px
+  linkStyle 77 stroke:#d73a4a,stroke-width:2px
   linkStyle 78 stroke:#c026d3,stroke-width:2px
   linkStyle 79 stroke:#c026d3,stroke-width:2px
-  linkStyle 80 stroke:#1a7f37,stroke-width:2px
-  linkStyle 81 stroke:#c026d3,stroke-width:2px
+  linkStyle 80 stroke:#c026d3,stroke-width:2px
+  linkStyle 81 stroke:#1a7f37,stroke-width:2px
   linkStyle 82 stroke:#c026d3,stroke-width:2px
   linkStyle 83 stroke:#c026d3,stroke-width:2px
-  linkStyle 84 stroke:#9a6700,stroke-width:2px
-  linkStyle 85 stroke:#c026d3,stroke-width:2px
+  linkStyle 84 stroke:#c026d3,stroke-width:2px
+  linkStyle 85 stroke:#9a6700,stroke-width:2px
   linkStyle 86 stroke:#c026d3,stroke-width:2px
-  linkStyle 87 stroke:#c2410c,stroke-width:2px
-  linkStyle 88 stroke:#0f766e,stroke-width:2px
-  linkStyle 89 stroke:#bf3989,stroke-width:2px
-  linkStyle 90 stroke:#be123c,stroke-width:2px
-  linkStyle 91 stroke:#2563eb,stroke-width:2px
-  linkStyle 92 stroke:#be123c,stroke-width:2px
-  linkStyle 93 stroke:#2563eb,stroke-width:2px
-  linkStyle 94 stroke:#d73a4a,stroke-width:2px
-  linkStyle 95 stroke:#0891b2,stroke-width:2px
-  linkStyle 96 stroke:#c2410c,stroke-width:2px
-  linkStyle 97 stroke:#5b8c00,stroke-width:2px
+  linkStyle 87 stroke:#c026d3,stroke-width:2px
+  linkStyle 88 stroke:#c2410c,stroke-width:2px
+  linkStyle 89 stroke:#0f766e,stroke-width:2px
+  linkStyle 90 stroke:#bf3989,stroke-width:2px
+  linkStyle 91 stroke:#be123c,stroke-width:2px
+  linkStyle 92 stroke:#2563eb,stroke-width:2px
+  linkStyle 93 stroke:#be123c,stroke-width:2px
+  linkStyle 94 stroke:#2563eb,stroke-width:2px
+  linkStyle 95 stroke:#d73a4a,stroke-width:2px
+  linkStyle 96 stroke:#0891b2,stroke-width:2px
+  linkStyle 97 stroke:#be123c,stroke-width:2px
   linkStyle 98 stroke:#5b8c00,stroke-width:2px
   linkStyle 99 stroke:#5b8c00,stroke-width:2px
-  linkStyle 100 stroke:#d73a4a,stroke-width:2px
-  linkStyle 101 stroke:#bf3989,stroke-width:2px
-  linkStyle 102 stroke:#5b8c00,stroke-width:2px
-  linkStyle 103 stroke:#be123c,stroke-width:2px
-  linkStyle 104 stroke:#5b8c00,stroke-width:2px
+  linkStyle 100 stroke:#5b8c00,stroke-width:2px
+  linkStyle 101 stroke:#d73a4a,stroke-width:2px
+  linkStyle 102 stroke:#bf3989,stroke-width:2px
+  linkStyle 103 stroke:#5b8c00,stroke-width:2px
+  linkStyle 104 stroke:#be123c,stroke-width:2px
   linkStyle 105 stroke:#5b8c00,stroke-width:2px
-  linkStyle 106 stroke:#c2410c,stroke-width:2px
-  linkStyle 107 stroke:#a21caf,stroke-width:2px
-  linkStyle 108 stroke:#b91c1c,stroke-width:2px
-  linkStyle 109 stroke:#1a7f37,stroke-width:2px
-  linkStyle 110 stroke:#1a7f37,stroke-width:2px
-  linkStyle 111 stroke:#5b8c00,stroke-width:2px
-  linkStyle 112 stroke:#9a6700,stroke-width:2px
-  linkStyle 113 stroke:#a21caf,stroke-width:2px
-  linkStyle 114 stroke:#0891b2,stroke-width:2px
-  linkStyle 115 stroke:#4d7c0f,stroke-width:2px
-  linkStyle 116 stroke:#0891b2,stroke-width:2px
-  linkStyle 117 stroke:#b45309,stroke-width:2px
-  linkStyle 118 stroke:#65a30d,stroke-width:2px
-  linkStyle 119 stroke:#5b8c00,stroke-width:2px
-  linkStyle 120 stroke:#0f766e,stroke-width:2px
-  linkStyle 121 stroke:#c026d3,stroke-width:2px
-  linkStyle 122 stroke:#c026d3,stroke-width:2px
-  linkStyle 123 stroke:#b45309,stroke-width:2px
-  linkStyle 124 stroke:#b45309,stroke-width:2px
-  linkStyle 125 stroke:#be123c,stroke-width:2px
-  linkStyle 126 stroke:#5b8c00,stroke-width:2px
-  linkStyle 127 stroke:#c026d3,stroke-width:2px
-  linkStyle 128 stroke:#bf3989,stroke-width:2px
-  linkStyle 129 stroke:#0e7490,stroke-width:2px
-  linkStyle 130 stroke:#0e7490,stroke-width:2px
-  linkStyle 131 stroke:#a21caf,stroke-width:2px
-  linkStyle 132 stroke:#be123c,stroke-width:2px
-  linkStyle 133 stroke:#be123c,stroke-width:2px
-  linkStyle 134 stroke:#9a6700,stroke-width:2px
-  linkStyle 135 stroke:#b45309,stroke-width:2px
-  linkStyle 136 stroke:#5b8c00,stroke-width:2px
-  linkStyle 137 stroke:#9a6700,stroke-width:2px
-  linkStyle 138 stroke:#0e7490,stroke-width:2px
-  linkStyle 139 stroke:#2563eb,stroke-width:2px
-  linkStyle 140 stroke:#be123c,stroke-width:2px
-  linkStyle 141 stroke:#b45309,stroke-width:2px
-  linkStyle 142 stroke:#1a7f37,stroke-width:2px
-  linkStyle 143 stroke:#d73a4a,stroke-width:2px
-  linkStyle 144 stroke:#bf3989,stroke-width:2px
-  linkStyle 145 stroke:#5b8c00,stroke-width:2px
-  linkStyle 146 stroke:#0891b2,stroke-width:2px
+  linkStyle 106 stroke:#5b8c00,stroke-width:2px
+  linkStyle 107 stroke:#c2410c,stroke-width:2px
+  linkStyle 108 stroke:#c2410c,stroke-width:2px
+  linkStyle 109 stroke:#c2410c,stroke-width:2px
+  linkStyle 110 stroke:#c2410c,stroke-width:2px
+  linkStyle 111 stroke:#a21caf,stroke-width:2px
+  linkStyle 112 stroke:#b91c1c,stroke-width:2px
+  linkStyle 113 stroke:#1a7f37,stroke-width:2px
+  linkStyle 114 stroke:#1a7f37,stroke-width:2px
+  linkStyle 115 stroke:#5b8c00,stroke-width:2px
+  linkStyle 116 stroke:#9a6700,stroke-width:2px
+  linkStyle 117 stroke:#a21caf,stroke-width:2px
+  linkStyle 118 stroke:#0891b2,stroke-width:2px
+  linkStyle 119 stroke:#4d7c0f,stroke-width:2px
+  linkStyle 120 stroke:#0891b2,stroke-width:2px
+  linkStyle 121 stroke:#b45309,stroke-width:2px
+  linkStyle 122 stroke:#65a30d,stroke-width:2px
+  linkStyle 123 stroke:#5b8c00,stroke-width:2px
+  linkStyle 124 stroke:#0f766e,stroke-width:2px
+  linkStyle 125 stroke:#c026d3,stroke-width:2px
+  linkStyle 126 stroke:#c026d3,stroke-width:2px
+  linkStyle 127 stroke:#b45309,stroke-width:2px
+  linkStyle 128 stroke:#b45309,stroke-width:2px
+  linkStyle 129 stroke:#be123c,stroke-width:2px
+  linkStyle 130 stroke:#5b8c00,stroke-width:2px
+  linkStyle 131 stroke:#c026d3,stroke-width:2px
+  linkStyle 132 stroke:#bf3989,stroke-width:2px
+  linkStyle 133 stroke:#0e7490,stroke-width:2px
+  linkStyle 134 stroke:#0e7490,stroke-width:2px
+  linkStyle 135 stroke:#a21caf,stroke-width:2px
+  linkStyle 136 stroke:#be123c,stroke-width:2px
+  linkStyle 137 stroke:#be123c,stroke-width:2px
+  linkStyle 138 stroke:#9a6700,stroke-width:2px
+  linkStyle 139 stroke:#b45309,stroke-width:2px
+  linkStyle 140 stroke:#5b8c00,stroke-width:2px
+  linkStyle 141 stroke:#9a6700,stroke-width:2px
+  linkStyle 142 stroke:#0e7490,stroke-width:2px
+  linkStyle 143 stroke:#2563eb,stroke-width:2px
+  linkStyle 144 stroke:#be123c,stroke-width:2px
+  linkStyle 145 stroke:#b45309,stroke-width:2px
+  linkStyle 146 stroke:#1a7f37,stroke-width:2px
   linkStyle 147 stroke:#d73a4a,stroke-width:2px
-  linkStyle 148 stroke:#5b8c00,stroke-width:2px
-  linkStyle 149 stroke:#d73a4a,stroke-width:2px
-  linkStyle 150 stroke:#d73a4a,stroke-width:2px
-  linkStyle 151 stroke:#be123c,stroke-width:2px
-  linkStyle 152 stroke:#d73a4a,stroke-width:2px
-  linkStyle 153 stroke:#4d7c0f,stroke-width:2px
-  linkStyle 154 stroke:#1a7f37,stroke-width:2px
-  linkStyle 155 stroke:#c2410c,stroke-width:2px
-  linkStyle 156 stroke:#8250df,stroke-width:2px
-  linkStyle 157 stroke:#9a6700,stroke-width:2px
-  linkStyle 158 stroke:#9a6700,stroke-width:2px
-  linkStyle 159 stroke:#0891b2,stroke-width:2px
+  linkStyle 148 stroke:#bf3989,stroke-width:2px
+  linkStyle 149 stroke:#5b8c00,stroke-width:2px
+  linkStyle 150 stroke:#0891b2,stroke-width:2px
+  linkStyle 151 stroke:#d73a4a,stroke-width:2px
+  linkStyle 152 stroke:#5b8c00,stroke-width:2px
+  linkStyle 153 stroke:#d73a4a,stroke-width:2px
+  linkStyle 154 stroke:#d73a4a,stroke-width:2px
+  linkStyle 155 stroke:#be123c,stroke-width:2px
+  linkStyle 156 stroke:#d73a4a,stroke-width:2px
+  linkStyle 157 stroke:#4d7c0f,stroke-width:2px
+  linkStyle 158 stroke:#1a7f37,stroke-width:2px
+  linkStyle 159 stroke:#8250df,stroke-width:2px
   linkStyle 160 stroke:#9a6700,stroke-width:2px
-  linkStyle 161 stroke:#1d4ed8,stroke-width:2px
+  linkStyle 161 stroke:#9a6700,stroke-width:2px
   linkStyle 162 stroke:#0891b2,stroke-width:2px
-  linkStyle 163 stroke:#d73a4a,stroke-width:2px
-  linkStyle 164 stroke:#d73a4a,stroke-width:2px
-  linkStyle 165 stroke:#c026d3,stroke-width:2px
+  linkStyle 163 stroke:#9a6700,stroke-width:2px
+  linkStyle 164 stroke:#1d4ed8,stroke-width:2px
+  linkStyle 165 stroke:#0891b2,stroke-width:2px
+  linkStyle 166 stroke:#d73a4a,stroke-width:2px
+  linkStyle 167 stroke:#d73a4a,stroke-width:2px
+  linkStyle 168 stroke:#c026d3,stroke-width:2px
 ```
diff --git a/docs/knowledge.jsonl b/docs/knowledge.jsonl
index abff9eb97..edb21e65c 100644
--- a/docs/knowledge.jsonl
+++ b/docs/knowledge.jsonl
@@ -319,3 +319,4 @@
 {"schema":3,"ts":1793100920719,"kind":"knowledge","key":"prettier-write-after-a-red-breaks-the-test-first-audit","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-execute","subagent":"bkit-build-plan-execute","model":"openrouter/deepseek-v4.1-flash"},"references":[".bkit/core/engine/commands/workflow/tests.ts",".bkit/core/prompts/bkit-build-plan-verify.md"],"summary":"Format a test file before recording its red; a later `prettier --write` moves a line and the green audit then reports `test-changed` with `changed: yes`","description":"- **Category:** tooling\n- **Symptom:** `bkit tests green` reports one `test-changed` gap per planned test in a file whose reds were all recorded, with `Changed since red` = `yes` and a diff that removes a single line (a wrapped `expect(…)` joined into one line) and adds the task's new tests.\n- **Root cause:** `onlyAddsLines` walks the red snapshot's whitespace-stripped, non-blank lines as a subsequence of the current file, so a prettier pass that joins a wrapped call, or splits a long one, removes a line the snapshot holds and turns the row from `added lines only` into `yes`. `bkit tests red` cannot re-record the red once the named test passes.\n- **Fix or rule:** run `prettier --write` on the test file before recording its reds, and after every later test edit check the row with `bkit tests green`: an additions-only diff keeps the row at `added lines only`, whose prompt rule clears added lines outside every planned test.\n- **Type:** gotcha\n- **Confidence:** high\n- **Severity:** medium\n- **Scope:** bkit-repo\n- **Source:** agent","rootCause":"Red evidence pins the snapshot's line sequence; the formatter is the usual second writer of a test file after its red, and the red cannot be re-recorded once the test passes.","remediation":"`prettier --write` the test file before `bkit tests red`, and keep every post-red edit a pure insertion.","status":"ACTIVE"}
 {"schema":3,"ts":1793103134789,"kind":"knowledge","key":"workflow-reads-artifact-header-fields-after-steps-finish","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-execute","subagent":"bkit-build-plan-execute","model":"openrouter/deepseek-v4.1-flash"},"references":[".bkit/core/engine/audits/workflows/workflow-shape.test.ts",".bkit/core/engine/commands/workflow/steps.ts",".bkit/core/workflows/bkit-build.md"],"summary":"A workflow reads an artifact header's fields from `steps finish`'s `fields` output, so a verb that needs one runs in the sub-step after the finish, never before it","description":"- **Category:** tooling\n- **Symptom:** a workflow step that needs a subagent artifact's header field before the step's commit makes `workflow-shape.test.ts` fail with `<workflow> never reads a verdict outside `steps finish``.\n- **Root cause:** `bkit steps verdict` is barred from workflow files, and `steps finish` prints `fields` only once it has written the row and committed; a sub-step placed before the finish has no way to hold a declared field such as the verify artifact's task numbers.\n- **Fix or rule:** read the field from `steps finish`'s output and run the verb that consumes it in the sub-step after the finish; the edit it makes rides the next step's commit.\n- **Type:** gotcha\n- **Confidence:** high\n- **Severity:** low\n- **Scope:** bkit-repo\n- **Source:** agent"}
 {"schema":3,"ts":1793107857006,"kind":"knowledge","key":"slop-gate-suppression-flags-skip-literals-in-test-fixtures","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-execute","subagent":"bkit-build-plan-execute","model":"openrouter/deepseek-v4.1-flash"},"references":["scripts/slop/bkit-slop-type-suppression.mjs","slop-scan.config.json",".bkit/core/engine/commands/workflow/branches.ts"],"summary":"A test fixture that spells `it.skip(...)` fails `bkit ci slop`'s boundary/gate-suppression rule; compose the marker from two pieces as the plugin composes its own patterns","description":"- **Category:** tooling\n- **Symptom:** `pnpm slop:delta` fails with `netFindingCount: 1` on a test file that only holds skip markers inside fixture strings, never calling a skip.\n- **Root cause:** `bkit-slop-type-suppression.mjs` scans raw file text for `.skip` / `.only` / x-prefixed test calls and only skips comments, so a fixture string that builds a skip marker is indistinguishable from a disabled test; the plugin avoids its own patterns with character classes and string composition.\n- **Fix or rule:** spell a fixture's marker in two pieces (`const SKIP = `${`it`}.${`skip`}`;`) with a comment saying why, and keep the fixture's assertions unchanged; a scoped `boundary/gate-suppression` override in `slop-scan.config.json` is a gate opt-out and needs the owner.\n- **Type:** gotcha\n- **Confidence:** high\n- **Severity:** medium\n- **Scope:** bkit-repo\n- **Source:** agent","rootCause":"The rule reads text, not syntax, so any string carrying a skip marker counts; test fixtures are its main false positive and no override exists for them.","remediation":"Compose the marker in two pieces inside a helper or constant, as the plugin composes its own patterns, so the file carries no literal the scanner matches."}
+{"schema":3,"ts":1793110852612,"kind":"knowledge","key":"plan-derived-test-matrix-needs-a-task-column","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-execute","subagent":"bkit-build-plan-execute","model":"openrouter/deepseek-v4.1-flash"},"references":[".bkit/core/engine/commands/workflow/tests.ts",".bkit/core/engine/commands/workflow/plan-blocks.ts",".bkit/core/engine/commands/workflow/challenge.ts",".bkit/core/docs/templates/bkit-plan.md"],"summary":"`bkit tests plan-check` refuses a `Derived Test Matrix` header with no `Task` column, so every matrix the build writes (converted, challenge-merged, Fix now) carries one cell naming exactly one runbook task","description":"- **Category:** process\n- **Symptom:** `bkit tests plan-check` exits 1 with `the Derived Test Matrix header has no `Task` column`, then `Derived Test Matrix row maps to no task`, `maps to TASK {n}, which the plan does not define`, or `TASK {n} names TEST FIRST tests but no Derived Test Matrix row maps to it`.\n- **Root cause:** the matrix-to-runbook mapping is a plan contract with one right answer, so `plan-check` derives it from the table; a plan converted from an issue body carries the issue's three-column matrix (`Test description | Type | Target file`) with no mapping, and a task appended later (challenge merge, Decision Pause Fix now) adds its test to `TEST FIRST` without a row.\n- **Fix or rule:** write the matrix as `Test description | Type | Target file | Task`, one task number per row, and append one row per test every later task adds; `bkit challenge merge` and the Fix-now task writer add both together.\n- **Type:** gotcha\n- **Confidence:** high\n- **Severity:** medium\n- **Scope:** bkit-repo\n- **Source:** agent","rootCause":"The issue's change shape carries a three-column matrix while the plan's table is the runbook's coverage map; converting one to the other adds the column only if the writer knows the mapping is checked.","remediation":"Give the table a `Task` column, name one defined task per row, and add a row beside every test a later task appends; run `bkit tests plan-check` after any plan write."}
diff --git a/docs/testing.md b/docs/testing.md
index 40d20bea3..133753730 100644
--- a/docs/testing.md
+++ b/docs/testing.md
@@ -608,18 +608,21 @@ The status-hole detector (`.bkit/core/engine/checks/status-holes.ts`) is **advis
 | `commands/workflow/repo.test.ts` | Unit (boundary: real temp git repo) | `bkit repo info`: owner / repo from `gh`, else the origin remote; neither → exit 3; detached HEAD → exit 4 unless `--allow-detached`; `behindDev` / `divergedAgo`, null (never a false 0) when `origin/dev` is unknown; `--fetch` failure logged, not fatal; `repoRoot` / `bkit` / `outboxRoot` name the main checkout from a worktree too; `sessionDir` is a new empty `sessions/<utc-time>-<random>/` folder per call, with name-stamped folders older than 7 days pruned; `bkitVersion` / `bkitLatest` / `bkitOutdated` / `bkitAdvisory` from a seeded cache: advisory printed when the pin is older, quiet when current or ahead, null (never an error) on a remembered registry failure or an unpinned repo. |
 | `shared/bkit-latest.test.ts` | Unit (boundary: temp dirs, fake `pnpm` on PATH) | Outdated-bkit check: `compareSemver` numeric order (5.10.0 > 5.9.0) and prerelease order; unpinned and `BKIT_NO_UPDATE_CHECK` skip the registry (`0` does not); one lookup per day, a failed lookup remembered for an hour, corrupt / future-dated cache rewritten, no git dir → no cache; `lookupLatestPublished` null on a pnpm failure, non-version output, or no pnpm. |
 | `commands/workflow/fids.test.ts` | Unit | `bkit fids check / parse`: per-tracker shapes, `any` for CI_DEV, linear / jira lowercased, tracker from the main checkout's `package.json`; marker beats branch, malformed or foreign marker falls through, neither → exit 3; `bkit fids check --issue`: an issue given → the FID must embed that same id (`123-foo` with `--issue=456` fails), empty → any lowercase slug; `parse --branch` takes the suffix verbatim and links an embedded issue only when `.bkit/issues.jsonl` has a feature row for it (else `issueId` null, `upgrade-react-19` accepted, a non-slug exits 3); `featureIssueIds`; `parse --prompt-file`: per-tracker issue forms in prompt order, `ref`, a named FID, a missing file exits 7; `slugWords` / `mintFid`; `bkit fids resolve`: prompt, branch, logged (working tree and `dev`, several → exit 4), minted, then the first free `-b`, `-c`, … suffix, an IN_PROGRESS run continued, exit 5 when every name is used, exit 1 on a bad format; `bkit fids plans`: single / none (numbered files beside the plan are not plans); `bkit fids design --description-file --prompt-file`: link, own design, audit paths, exit 7 for a missing file. `bkit fids find --issue`: one (0) / none (1) / several (4), never a longer issue number, Linear case-insensitive; auto's FID entry points go through `runs context`. |
-| `commands/workflow/tests.test.ts` | Unit (boundary: real subprocess) | `bkit tests run`: deepest declared gate wins, an empty script is not declared; PASS / FAIL with the log always saved; no gate declared → exit 3; runner could not run → exit 4 (never FAIL); runs at the checkout top; `--tail`. |
+| `commands/workflow/tests.test.ts` | Unit (boundary: real subprocess) | `bkit tests run`: deepest declared gate wins, an empty script is not declared; PASS / FAIL with the log always saved; no gate declared → exit 3; runner could not run → exit 4 (never FAIL); runs at the checkout top; `--tail`. `bkit tests plan-check`: the group and task blocks, `DONE WHEN` / `TEST FIRST`, `DEPENDS ON` order, a `Reuse Inventory` `NEW` row per `CREATE` file, a `Supersession Inventory` row per `DELETE`, a `Task` column on the matrix and a row per test-bearing task (an unmapped row, two tasks, an undefined task, a header with no column and a test-bearing task with no row each refused), the caps from `bkit.workflows.tasks`, symbol existence skipped on a ticked task, the change-issue form example accepted. `bkit tests red` / `green`: the named test decides, never the exit code alone; a red row + snapshot per test; green prints `verdict` and a `fixable` per gap, an empty `gaps` on a clean plan. |
+| `commands/workflow/tasks.test.ts` | Unit (boundary: real temp git repo for `currency`) | `bkit tasks tick / open / currency`: `tick` marks only the named group tasks, refuses another group's task, a plan with no task blocks, a non-number and a missing file, narrows the group by `--tasks`, leaves every other plan line byte-identical, idempotent on a ticked task; `open` lists each task holding neither a `DONE` nor a `BLOCKED` line and sets `handover` only when one is open; `currency` matches a task on a moved symbol, emits no hunk outside the matched set, judges `{base}...{against}`, exits 0 with no match, refuses a plan with no task blocks. |
+| `commands/workflow/plan-blocks.test.ts` | Unit (no file-system access) | `parsePlanBlocks`: group and task order, one `TEST FIRST` test per sub-bullet, `DEPENDS ON` bare numbers, CRLF plans read like LF, markers inside a fence ignored, a fence line with an info string, an unclosed fence, the file-only form, a repeated field keeping the first, task-like text outside a block, TASK 0 and GROUP 0, duplicate task numbers, mismatched markers; `reuseInventory`, `outOfScope` and `derivedTestMatrix` read the table under their own heading, never a later section's. |
+| `commands/workflow/challenge.test.ts` | Unit (boundary: real temp git repo) | `bkit challenge merge`: findings appended as task blocks in new last groups within the caps (7 findings → groups of 3, 3 and 1), one `Derived Test Matrix` row per appended task, dedupe by `path:line`, an open earlier task reopened vs a done one getting a new task, `LOW` → a `low-severity` deferral row (a failed append leaves the plan unchanged), overflow → `pause` writing nothing, exit 23 for a block that fails `plan-check`. `bkit challenge gate`: sizes the diff, fetches `origin/dev` first, writes a `challenge-gate` row. |
 | `commands/workflow/locks.test.ts` | Unit (boundary: real temp git repo + linked worktree) | `bkit locks acquire / release`: month bucket (existing, UTC new, split refused); live vs reclaimable holder (a step in the last 30 minutes is live; an idle, finished or log-less holder is reclaimed whatever the lock file's age; worktree copy first); ship's lock in the main checkout from its worktree; only the workflow kind; release by token, never another owner's. |
 | `commands/workflow/workflows.test.ts` | Unit (boundary: real temp git repos + bare remote) | `bkit workflows start / fail / handover / close / promote / links`: run opened vs resumed, `--lock-held`, `lastDoneStep` and the run's own `OPEN` decision as `openDecision` on a resume; failed row, own-lock release, rebase abort only when in progress, sentinel clearing, `handoverNeeded` (incl. debug `SOAK`), nothing changed without `--token` (empty values count as absent), labels, failure comment from `--error-file`; handover `--push` (the record committed and pushed on the feature branch with or without a handover, open PR → 9 with no link, pushed → linked comment, the named worktree committed in, and from `dev` only the logs and ledgers landed through a throwaway checkout with the checkout's code untouched, then the landed copies handed back so local `dev` fast-forwards onto them while a staged ledger stays and is named, a refusal → 10 with the record kept) and ship `--flush` (one FAILED commit landed on `dev` from a throwaway checkout with the main checkout untouched, nothing-to-commit, the named worktree's logs carried, a refused push keeping the record in the book with exit 10); ship `close --flush` (one DONE commit on `dev` carrying the book, then the owned worktree and branch removed; an unowned worktree and its branch left in place); compliance rows before counter + outcome rows, one `run.parentSha` on all three, a `build-plan-convert` row → `plan.source` `converted` with groups, plan tasks counted from task headings, unwritable stats never failing the close, ship size + coverage, artifact links, `--message` commit with the exact-match auto-route marker and `--verbose-ci-local`, `--record-step`, `--outbox` + `--number` comment; promote (`--resolve`, exit 12, archive of a changed canonical, anchor from the base commit, bkit release and outdated warning in the anchor, the plan copied alone, a stray `{FID}-plan-N.md` neither copied nor archived); links (comment, branch name in URLs). |
 | `commands/workflow/worktrees.test.ts`, `worktrees.integration.test.ts` | Unit and Integration (real git remote) | `bkit worktrees setup / remove`: adopt in place, debug / ship branch rules, mint off a freshly fetched `origin/dev` — always for design / plan, and off local `dev` when it is ahead for build / debug (diverged → `origin/dev`, narrated) —, a resumed design / plan branch carrying unpushed `dev` commits refused (7) while the same worktree resumes for build, resume rebase onto the same base + sentinel, a failed ship's uncommitted leftovers committed before that rebase (logs dev already holds dropped, copied entries never committed; a refused commit → exit 9), `direnv allow` only for a `.envrc` identical to the main checkout's (direnv stubbed on PATH), `bkit.workflows.worktree.copy` list with missing entries narrated, install in every workflow (design / plan included), install failure vs could-not-run exits, `--detect` taking mint vs adopt from the runtime (exclusive with `--worktrees`), ownership marker, removal only of a marked worktree, `--branch` deleting the local and remote branch unless another worktree holds it (`branchBlockedBy`); debug in place on `dev` writes the shared-checkout record (`startSha`, `aheadAtStart`) and exits 13 when another feature's live run holds the checkout; a ship of `dev` / `main` and `main` for design / plan / build exit 7. |
 | `commands/workflow/shared-checkout.integration.test.ts` | Integration (real git, real bare `origin`) | A debug run in place on `dev` with foreign work in flight (a modified file, an untracked one, a staged one, a pre-existing ledger row, a local commit): the push sends only the run's commits (replayed as copies onto `origin/dev` when local `dev` is ahead or `origin/dev` moved, a plain push when level, a foreign commit never; with the run's record gone, or another run's newer record present, the push refuses with exit 20 or selects its own `--fid` record), and the run's commits, close commit and roadmap mirror row carry only its own paths and rows, leaving foreign staged, untracked and `.bkit/issues.jsonl` changes behind. |
-| `commands/workflow/branches.test.ts` | Unit (boundary: real temp git repos) | `bkit branches rebase / anchor-stamp / anchor-read / push / sync / sync-dev`: ledger union byte-identical to `merge=union`, lockfile from the rebase target then regenerated, refuse-before-mutate; idempotent anchor stamp, `--base-ref` override, `bkitVersion` / `bkitLatest` stamped and the visible outdated line written then dropped after an upgrade, the outdated stamp prettier-clean and stable on re-stamp, empty `bkitLatest` when unknown; `--against` skip exits; one `git push`, lease only off `dev`/`main`, `--require-ci`, abort guard + `--open-pr`; docs-from-dev merge; `sync-dev` fast-forwarding local `dev` without a checkout, moving the checkout and installing only when on `dev` and `dev` moved (16 on a failed install), listing local-only `dev` commits with the publish command and pushing none (10 on a failed fetch); a refused rebase whose `--abort` fails reports `aborted: false` and `ABORT FAILED`. `bkit branches land`: workflow refusal, stray main-checkout artifacts (17), squash off `origin/dev` → `design DONE` commit pushed + audited + local `dev` fast-forwarded, staged files in the main checkout left staged, local-only `dev` commits left unpushed (`localDev: skipped`), another checked-out branch kept with only the `dev` pointer moved, `dev` moving under the push rebuilt and retried (`pushAttempts: 2`) or exhausted (8, branch kept, throwaway worktree gone), non-doc files refused (17) — a branch carrying unpushed `dev` commits additionally named as such, with the unpushed count and `git push origin dev` —, refused `dev` push → PR shape handing the PR to MCP (80, stage `open`) after pushing the roadmap commit (cloud, and on a laptop from the worktree holding the branch), refused PR merge → `update-branch` then merged, a CLOSED PR stopping at once (17), uncommitted files in the feature worktree keeping the worktree and branch (`worktree.reason: uncommitted`), branch work missing from `origin/dev` stopping (18) with branch and worktree kept; `landBackoffMs` schedule (2s doubling, 30s cap, jitter, 3min total); the full local close is also run from the workflow in `close-squash.integration.test.ts`. |
+| `commands/workflow/branches.test.ts` | Unit (boundary: real temp git repos) | `bkit branches rebase / anchor-stamp / anchor-read / push / sync / sync-dev`: ledger union byte-identical to `merge=union`, lockfile from the rebase target then regenerated, refuse-before-mutate; idempotent anchor stamp, `--base-ref` override, `bkitVersion` / `bkitLatest` stamped and the visible outdated line written then dropped after an upgrade, the outdated stamp prettier-clean and stable on re-stamp, empty `bkitLatest` when unknown; `--against` skip exits; one `git push`, lease only off `dev`/`main`, `--require-ci`, abort guard + `--open-pr`; docs-from-dev merge; `sync-dev` fast-forwarding local `dev` without a checkout, moving the checkout and installing only when on `dev` and `dev` moved (16 on a failed install), listing local-only `dev` commits with the publish command and pushing none (10 on a failed fetch); a refused rebase whose `--abort` fails reports `aborted: false` and `ABORT FAILED`. `bkit branches land`: workflow refusal, stray main-checkout artifacts (17), squash off `origin/dev` → `design DONE` commit pushed + audited + local `dev` fast-forwarded, staged files in the main checkout left staged, local-only `dev` commits left unpushed (`localDev: skipped`), another checked-out branch kept with only the `dev` pointer moved, `dev` moving under the push rebuilt and retried (`pushAttempts: 2`) or exhausted (8, branch kept, throwaway worktree gone), non-doc files refused (17) — a branch carrying unpushed `dev` commits additionally named as such, with the unpushed count and `git push origin dev` —, refused `dev` push → PR shape handing the PR to MCP (80, stage `open`) after pushing the roadmap commit (cloud, and on a laptop from the worktree holding the branch), refused PR merge → `update-branch` then merged, a CLOSED PR stopping at once (17), uncommitted files in the feature worktree keeping the worktree and branch (`worktree.reason: uncommitted`), branch work missing from `origin/dev` stopping (18) with branch and worktree kept; `landBackoffMs` schedule (2s doubling, 30s cap, jitter, 3min total); the full local close is also run from the workflow in `close-squash.integration.test.ts`. `scan-diff --disabled-tests`: an added `.skip` / `@Disabled` / `t.Skip()` exits 1 with each hit's `file:line` and test name, a diff adding none exits 0 with an empty `disabled`. |
 | `commands/land.test.ts` | Unit (boundary: real temp git repos + bare remote) | `pushToDev`, the one routine every `dev` write goes through: commit built in a throwaway `origin/dev` checkout and pushed as `dev`, the main checkout untouched, local-only `dev` commits never pushed, `dev` moving under the push rebuilt and retried or exhausted, any other refusal handed to the caller's `refused` hook with the throwaway checkout still there, fetch failure, a throwing build; the throwaway checkout gone on every path; `landBackoffMs` schedule. |
 | `commands/workflow/skills.test.ts` | Unit (stub skills CLI) | `bkit skills prune`: union of folders and lock keys, never `bkit-*`, whole-name and literal matching, skips with a warning (exit 0) without `.agents/skills.md`, CLI failure and could-not-run warned and listed in `failed` (exit 0). |
 | `commands/workflow/prs.test.ts` | Unit (stub `gh`) | `bkit prs open / probe / merge / verbose-ci / scan-body / cross-check / transport-row`: marker first in every body, open-PR refusal vs reuse, one retry, base read-back, 80 with the printed title / body; probe states; merge (empty body, `--match-head`, `--delete-branch`, exact-match auto-route subject, already-merged skip, `--expect-merged` 7, 80; `--base=refs/heads/main` spellings refused; a base retarget after the merge fails loudly); verbose-ci on / off / no-op / 5 / 80; body-only token scan; fallback-row cross-check; `transport-row --scan` (clean, token recorded then exit 1, unreadable 8, `--cross-check` refusal unrecorded). |
 | `commands/workflow/issues.test.ts` | Unit | `bkit issues text / labels / comment`: generated drop before the last-marker cut, oldest-first sort; phase vs additive label arithmetic, `merged` clears `bkit:failed`, board payloads from `bkit.tracker.github.project`; comment bodies, defused cut marker, fenced stderr, `--error-file`. Never shells out, because tracker writes stay on MCP. |
 | `commands/workflow/runs.test.ts` | Unit (`tests/fixtures/gh/` stub, stub `gh`) | `bkit runs gate / mirror / wait / dispatch / revalidate / context / declared` — see § Ship merge-gate. Gate `--pr` / `--squash-of` heads, title skip token (18), `--snapshot` written before deciding, `--record` refusal / `ship-merge-ci` rows, unreadable PR (20); revalidate with no head move, unreadable PR (1), 80, bad `--reason`; auto context BRIEF / CI_DEV (slug refused, 9) / CI (marker, branch fallback, not open 7, no run 8, unknown phase 3, 80); dispatch `--file` / `--step` row + close transport. |
-| `commands/workflow/ledgers.test.ts` | Unit (boundary: real temp git repo) | `bkit ledgers commit / union / only-bookkeeping`: allow-list per scope, unmatched glob never aborts, empty pathspec refused (exit 6), staging failure no false success, `--squash-of`, `--only-if-dirty-tracked`; union append-only, never `.bkit/issues.jsonl`; carry-forward range check; `append` mints a non-round `ts` and fills `schema` / `repo` / `bkit.version`, keeps a row's own `repo`, takes `compliance` / `counter` / `outcome` with `--ledger=stats`, refuses a supplied `ts` / `schema` / `bkit`, a flat top-level field `by` holds, a wrong kind, an invalid row, an empty rows file, an unlisted writer and the `issues` ledger, writing nothing on refusal; `check` passes when every `**Ledger rows:**` key has a `decision` / `deferral` row or the line reads `None`, and exits 11 naming keys with no row (a `knowledge` row does not count), on a missing line or an unfilled one. |
+| `commands/workflow/ledgers.test.ts` | Unit (boundary: real temp git repo) | `bkit ledgers commit / union / only-bookkeeping`: allow-list per scope, unmatched glob never aborts, empty pathspec refused (exit 6), staging failure no false success, `--squash-of`, `--only-if-dirty-tracked`; union append-only, never `.bkit/issues.jsonl`; carry-forward range check; `append` mints a non-round `ts` and fills `schema` / `repo` / `bkit.version`, keeps a row's own `repo`, takes `compliance` / `counter` / `outcome` with `--ledger=stats`, refuses a supplied `ts` / `schema` / `bkit`, a flat top-level field `by` holds, a wrong kind, an invalid row, an empty rows file, an unlisted writer and the `issues` ledger, writing nothing on refusal; `check` passes when every `**Ledger rows:**` key has a `decision` / `deferral` row or the line reads `None`, and exits 11 naming keys with no row (a `knowledge` row does not count), on a missing line or an unfilled one. `triage --fid= --plan=`: a `low-severity` deferral stays `Exempt`, another feature's rows and a FID with no row print and write nothing, an unjustified row prints its `bucket` and appends one same-`key` `unjustified` / `TRIAGED` row with a minted `ts`, a row whose only declaration is itself stays `Lazy`. |
 | `commands/workflow/context.test.ts` | Unit (boundary: real `bash` for blocks, real temp git repos for `diff`) | `bkit context clamp / clamp-log / ledger-scan / diff / brief / list-blocks / run-block / finalise` (`fetch` in `context-fetch.test.ts`): both profiles read against the clamped FILE, in-place loss markers, ceiling; ranked ledger scan; `diff` writes `{base}...HEAD` without `docs/plans/**` with `--numstat` totals, `--base` narrows to a group's start sha (a `build-group-start` row's `parentSha` via `status route`), unknown base exits 5 and writes nothing, empty range writes a one-line note, past the 10000-line guard a `partial diff coverage` first line + `--stat` + the largest files first cut to 500 lines each, `topFiles` / `totalLines` ceiling, record in the clamp log; `brief` `--next` picks the first group with an open task (none open: nothing written, `group: null`), leaves out a task with a `DONE — TASK N` log line, carries one-line summaries of earlier `DEPENDS ON` tasks, the note file under Deviations, the reds already recorded, the Reuse Inventory rows and Architecture entries naming the open tasks' files (past the 8 KB work cap left out and counted), prints only path / size / group / tasks / `workBytes` / `workCap`, an unknown group exits 2; block parsing by ordinal; fence written byte-for-byte, clamp inside the fence; finalise verdict / contexts / records; `finalise --record` writes + commits the `context-fetch` row and prints the comment (`--file` required). |
 | `commands/workflow/roadmap.test.ts` | Unit (real fixture ledgers, real git remote for `mirror`) | `bkit roadmap fold`: ledger projection, deterministic regenerate, `ABANDONED` hidden, fail-open on malformed / absent ledger and unwritable board, consumer text preserved, notes blocks, `## Shipped` cap, marker self-heal. `feature --strict` (exit 1 when not appended). `mirror`: worktree row then the same row committed in a throwaway `origin/dev` checkout and pushed as `dev`, skipped only on `dev`, a refused push never fails the close. |
 | `.bkit/core/engine/ledgers/migrate.test.ts` | Unit | Ledger rows without `schema` rewritten through `normalize` (idempotent; malformed, non-object, blank and schema lines kept byte-for-byte; CRLF and missing final newline kept; an old line whose rewrite the file holds dropped, repeated old lines with none kept); `migrateLedgers` rewrites in place via temp file, dry run counts only, missing ledgers skipped; `isSchemaLedger` covers every ledger. |
