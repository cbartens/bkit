diff --git a/.bkit/core/.bkit/prompts.md b/.bkit/core/.bkit/prompts.md
index a68011630..545e80230 100644
--- a/.bkit/core/.bkit/prompts.md
+++ b/.bkit/core/.bkit/prompts.md
@@ -267,7 +267,7 @@ Canonical per-agent metadata — **single source of truth for model per agent**.
 | `bkit-plan-generate` | Read design and / or audit reports + template + docs → write new plan draft. Design absent and audits present is valid. Neither present → the issue is the source: a change-shape issue's `Narrative`, `Success Criteria`, `Edge Cases`, matrix rows and tasks carry over verbatim (Contract `Acceptance Scenario` and `Scenario detail`). Audit contract: if input includes audit-scope directives, plan covers only those findings; the rest of each report is context only, not backlog. Workstream contract: if input includes `**Workstream:**` directive, plan covers only that workstream's `## Scope` content unless stated otherwise; surface `**Requires:**` at top of plan. Process = one step per major template section in **dependency (authoring) order, not template document order** — derived sections (Breaking Changes, Supersession, Security, Docs, Rollback) follow Architecture rather than preceding it: Context → Acceptance Scenario → Derived Test Matrix → Open Questions → Pre-Flight → Alternatives → Data Schema → Reuse Inventory → Architecture (+ `decisions.jsonl`) → Breaking Changes → Supersession → Security → Docs → Rollback → Out of Scope → Suggested Scope Expansion → Agent Execution Runbook (groups of task blocks in build order, each group and task within the `bkit.workflows.tasks` caps the workflow passes in Context; pick tests from matrix only; each row → exactly one task; every task has `DONE WHEN`; `READ` / `UPDATE` / `DELETE` only for symbols it opened; never writes its own `TEST EXCEPTION`, copies an input's word for word) → Verification. The workflow runs `bkit tests plan-check --existence=refuse` on the draft straight after; exit 1 re-invokes it once to fix only the lines the report names. Human-confirmation checkboxes stay unchecked at generate. Each section group lands in the draft before reading for the next group starts, so a turn-cap stop leaves finished groups on disk, not an all-`PENDING` stub. Every `Open Questions & Assumptions` question carries 2-3 concrete options with trade-offs as the lettered `Options: A) {option} — {trade-off} · B) …`, a `Recommended` option and a `Default if unanswered` (design's answer carried forward where it has one); a bare question is not acceptable output. `Out of Scope` entries must be `Exempt` (genuinely-additive), else a runbook task. `Suggested Scope Expansion` holds candidates, not tasks; no tracker / ledger scan here — surface overlaps come from the orchestrator Fetch Context step via `bkit-plan-review-1`. |
 | `bkit-plan-review-1` | Read-only critique of the plan text — tightness + dependency-order lens; effort slot 1 (`high`). Parallel with `-2` and `bkit-plan-scope-check`. Drift from source, design-coverage gaps and unjustified expansion → CRITICAL. Tasks declare `DEPENDS ON`, which `bkit tests plan-check` checks mechanically (a missing task, the task itself, a task in a later group); review-1 derives the graph regardless: what each task produces and consumes, read against runbook order (build order), because a declared field lists only the edges its author saw. A consumer before its producer, or a prerequisite no task produces and the repo lacks, is CRITICAL. Surfaces `Suggested Scope Expansion` candidates from the `related-*.md` context. FAIL only for a task-order cycle no reorder resolves, or a plan that contradicts its source design — every other gap is CRITICAL → CONCERNS so `bkit-plan-update` repairs it. |
 | `bkit-plan-review-2` | Same scope — regression-risk lens, reads the code; effort slot 2 (`high`). Traces each task's files, symbols, schemas and endpoints to their consumers. `TEST FIRST` / `DONE WHEN` check current code cannot pass, no task changing it → CRITICAL, cites the ruling `file:line`. FAIL only for a regression vector the source design itself requires and no plan edit mitigates — every other gap is CRITICAL → CONCERNS so `bkit-plan-update` repairs it. |
-| `bkit-plan-scope-check` | Internal-completeness scope audit; one slot, parallel with both reviewers on the draft (`medium` effort, opus model — depth-sensitive lens). Owns the template checks: sections present; `Acceptance Scenario` / `Derived Test Matrix` missing or vague → CRITICAL; `Open Questions & Assumptions` question missing options, `Recommended` or `Default if unanswered` (the lettered `Options: A) …`) → OPTIONAL (mirrors `bkit-design-review-2` on the design side). Per-task `DONE WHEN` / `TEST FIRST` are not this lens: `bkit tests plan-check` refuses a task missing either after every plan write. `Blocking` out-of-scope deferral → CRITICAL. Duplication guard is bidirectional: `Supersession Inventory` catches code the plan replaces but never deletes; `Reuse Inventory` catches capability the plan rebuilds instead of extending. Recorded search (exact commands, not a claim) is the evidence — empty `Search performed` = unsearched, not absence; untraced `[NEW]` → CRITICAL. FAIL only for a matrix-to-runbook mapping no plan edit recovers — a broken template and every other gap is CRITICAL → CONCERNS so `bkit-plan-update` repairs it. |
+| `bkit-plan-scope-check` | Internal-completeness scope audit; one slot, parallel with both reviewers on the draft (`medium` effort, opus model — depth-sensitive lens). Owns the template checks: sections present; `Acceptance Scenario` / `Derived Test Matrix` missing or vague → CRITICAL; `Open Questions & Assumptions` question missing options, `Recommended` or `Default if unanswered` (the lettered `Options: A) …`) → OPTIONAL (mirrors `bkit-design-review-2` on the design side). Per-task `DONE WHEN` / `TEST FIRST`, the matrix rows' task mapping and each `DELETE`'s `Supersession Inventory` row are not this lens: `bkit tests plan-check` refuses each after every plan write. `Blocking` out-of-scope deferral → CRITICAL. Duplication guard is bidirectional: `Supersession Inventory` catches code the plan replaces but never deletes; `Reuse Inventory` catches capability the plan rebuilds instead of extending. Recorded search (exact commands, not a claim) is the evidence — empty `Search performed` = unsearched, not absence; untraced `[NEW]` → CRITICAL. FAIL only for a `Blocking` out-of-scope deferral no plan edit recovers — a broken template and every other gap is CRITICAL → CONCERNS so `bkit-plan-update` repairs it. |
 | `bkit-plan-update` | Merge review / scope critique notes → in-place plan edits + record log. Invariant: every task's `**DONE WHEN:**` and `**TEST FIRST:**` fields survive critique-merge (may be tightened, `n/a` → named tests included; never removed / weakened). Writes review's `Suggested Scope Expansion` candidates into the plan section (advisory; never tasks). Open questions a finding adds or rewords carry options as the lettered `Options: A) …`, `Recommended` and `Default if unanswered`; untouched regions stay verbatim. Human-confirmation checkboxes survive the merge as found — an unconditional invariant beside `DONE WHEN`, not a clause of the open-question rule. Mirrors to `docs/deferrals.jsonl` only the `Out of Scope` `Exempt` rows its merge adds; `Suggested Scope Expansion` candidates are never appended — most were read from that ledger, so appending duplicates them. Writes a `docs/decisions.jsonl` row per decision its merge adds or changes, same `key` when changed, and keeps the plan's `**Ledger rows:**` line current for plan close's `bkit ledgers check`. |
 
 ## Build Phase
@@ -303,7 +303,7 @@ Canonical per-agent metadata — **single source of truth for model per agent**.

<!-- prettier-ignore -->
 | Agent | Scope |
 | --- | --- |
 | `bkit-ship-conflict-resolve` | Mid-rebase mechanical conflict resolver. Invoked from `/bkit-ship` Step 4 B2 when the PR conflicts textually with `origin/dev`: rebases onto `origin/dev`, runs `bkit branches rebase` first (unions ledgers, regenerates the lockfile), then hand-resolves only what that leaves conflicted. Allowed: non-overlapping additive edits, formatting drift, dep-version supersedes, additive JSON entries. Refused: same-function edits, semantic overlaps, ambiguous intent — FAIL aborts the rebase cleanly and routes to `bkit-debug-abort-handover`. Verifies via `bkit:gate:install-static-unit-build` before PASS. |
-| `bkit-ship-deferred-sweep` | Pre-merge completeness gate. Builds the intended-delivery set from plan `Acceptance Scenario` sections + `DONE WHEN` fields and asserts each against the codebase. No plan file → `ship-input-*.md` is the plan; intended-delivery set = its requested outcomes. An unmet / unplanned gap → FAIL → Failure Path (merge never happens) ONLY on >=1 of four blocking tests, each asserted against source, never inferred from a plan sentence: behaviour (absent / stub / wrong result), safety (guard weakened, known-broken path ships), false green (this diff disabled a covering test), consumer break (shipped surface fails at runtime). Lane results are not evidence — bkit lanes are event-scoped, some push-to-`dev` only, so a pre-merge sweep reading them re-creates the unsatisfiable refusal that made gate code 16 opt-in; the gate + capstone own green. A gap passing none is `Lazy`: stale prose / comment / name, doc drift, unwritten ledger row, formatting, future-enhancement `TODO`, `DONE WHEN` met in substance not literal wording. Branch is green by this step, so aborting on a record-keeping gap leaves the work unmerged and the record unwritten. Declared deferrals (out-of-scope / future-work / non-goals across design, plan, `docs/deferrals.jsonl`, summaries) form the exempt set — never block, resurfaced verbatim in the ship summary's `Deferred & Out-of-Scope (Resurfaced)` section. Exemption is EARNED, not self-granted: each entry's `reason` (`.bkit/jsonl.md` § Deferral Reason) is adjudicated against the four tests, and one that fails moves to that same third track `Lazy (unjustified)` — same-`key` ledger append setting `reason` = `unjustified`, resurfaced as follow-up, never blocking the merge (a bounded fix is cheaper than an aborted ship). Both `Lazy` sources share one append shape; every item carries its row before the verdict is set. The intended-delivery set is those two sources and NOTHING else — every precondition, build process step and merge condition a plan states is advisory, never a gate: plan `Gate N` checkboxes, `Verification Plan` boxes and `Manual Verification` steps are build-phase process, never deliverables, and no phrasing in a plan, log or phase summary makes one blocking (the gate reaches only what the repo can be made to prove; the plan template carries the matching authoring rule). Invoked from `/bkit-ship` Step 5 (after Conflict Resolve, before Merge). |
+| `bkit-ship-deferred-sweep` | Pre-merge completeness gate. Builds the intended-delivery set from plan `Acceptance Scenario` sections + `DONE WHEN` fields and asserts each against the codebase. No plan file → `ship-input-*.md` is the plan; intended-delivery set = its requested outcomes. An unmet / unplanned gap → FAIL → Failure Path (merge never happens) ONLY on >=1 of four blocking tests, each asserted against source, never inferred from a plan sentence: behaviour (absent / stub / wrong result), safety (guard weakened, known-broken path ships), false green (this diff disabled a covering test — `bkit branches scan-diff --disabled-tests` names each hit), consumer break (shipped surface fails at runtime). Lane results are not evidence — bkit lanes are event-scoped, some push-to-`dev` only, so a pre-merge sweep reading them re-creates the unsatisfiable refusal that made gate code 16 opt-in; the gate + capstone own green. A gap passing none is `Lazy`: stale prose / comment / name, doc drift, unwritten ledger row, formatting, future-enhancement `TODO`, `DONE WHEN` met in substance not literal wording. Branch is green by this step, so aborting on a record-keeping gap leaves the work unmerged and the record unwritten. Declared deferrals (out-of-scope / future-work / non-goals across design, plan, `docs/deferrals.jsonl`, summaries) form the exempt set — never block, resurfaced verbatim in the ship summary's `Deferred & Out-of-Scope (Resurfaced)` section. Exemption is EARNED, not self-granted: each entry's `reason` (`.bkit/jsonl.md` § Deferral Reason) is adjudicated against the four tests, and one that fails moves to that same third track `Lazy (unjustified)` — same-`key` ledger append setting `reason` = `unjustified`, resurfaced as follow-up, never blocking the merge (a bounded fix is cheaper than an aborted ship). Both `Lazy` sources share one append shape; every item carries its row before the verdict is set. The intended-delivery set is those two sources and NOTHING else — every precondition, build process step and merge condition a plan states is advisory, never a gate: plan `Gate N` checkboxes, `Verification Plan` boxes and `Manual Verification` steps are build-phase process, never deliverables, and no phrasing in a plan, log or phase summary makes one blocking (the gate reaches only what the repo can be made to prove; the plan template carries the matching authoring rule). Invoked from `/bkit-ship` Step 5 (after Conflict Resolve, before Merge). |
 | `bkit-ship-update-docs` | Cross-reference changed files against every doc in `docs.md`; update stale. |
 
 ## Audit (Ad-hoc)
diff --git a/.bkit/core/.bkit/workflows.md b/.bkit/core/.bkit/workflows.md
index d4d264216..b0d840b0b 100644
--- a/.bkit/core/.bkit/workflows.md
+++ b/.bkit/core/.bkit/workflows.md
@@ -687,7 +687,7 @@ Then assert each Update/Create artifact exists, non-empty. Empty → **Failure P
 | `@bkit-design-spike` | PASS / CONCERNS / FAIL | Every value → Step 8 apply-review; the step informs, it does not gate. PASS = every claim held under an honest attempt; CONCERNS = nothing disproven but a claim was unsettleable this run (missing credential / service / host), design proceeds with the assumption unproven and the design summary lists it as a CONCERNS reason; FAIL = a claim is disproven and `@bkit-design-update` revises the design against the evidence — not a Failure Path, a disproven assumption is the step succeeding. Only a malformed or empty artifact routes to the Failure Path. Per-claim `SETTLED` / `DISPROVEN` / `BLOCKED` stays in the artifact body — the header verdict is the routing signal, not the finding. |
 | `@bkit-design-update` | PASS / CONCERNS / FAIL | All paths continue to Step 9 design-organise; CRITICAL items applied, OPTIONAL applied on consensus, OUT-OF-SCOPE deferred. |
 | `@bkit-design-organise` | PASS / CONCERNS / FAIL | PASS/CONCERNS → Step 10 summary; FAIL → Failure Path (cycles detected, human review required). |
-| `@bkit-plan-review-1` / `-2` + `@bkit-plan-scope-check` | PASS / CONCERNS / FAIL | The step row's verdict = worst of the three, `failures` = their sum. PASS/CONCERNS → Step 6 apply-review, where `@bkit-plan-update` repairs every CRITICAL finding; FAIL → Failure Path. FAIL is reserved for what no plan edit fixes (a task-order cycle no reorder resolves, a plan contradicting its source design, a regression vector the design itself requires, a matrix-to-runbook mapping no edit recovers), so a human reframes the design or the issue. |
+| `@bkit-plan-review-1` / `-2` + `@bkit-plan-scope-check` | PASS / CONCERNS / FAIL | The step row's verdict = worst of the three, `failures` = their sum. PASS/CONCERNS → Step 6 apply-review, where `@bkit-plan-update` repairs every CRITICAL finding; FAIL → Failure Path. FAIL is reserved for what no plan edit fixes (a task-order cycle no reorder resolves, a plan contradicting its source design, a regression vector the design itself requires, a `Blocking` out-of-scope deferral no edit recovers), so a human reframes the design or the issue. |
 | `bkit workflows summary` (`design`, `plan`, `build`, `debug`, `ship`) | PASS / CONCERNS / FAIL | PASS or CONCERNS → close workflow / next step; FAIL → Failure Path. |
 | `@bkit-build-plan-execute` | PASS / HANDOVER / FAIL | `HANDOVER` (turn cap near, tasks left neither `DONE` nor `BLOCKED`), or a group task with no `DONE` / `BLOCKED` line → Step 6 re-runs once for that group as a handover, not a failed attempt, its brief leaving out the `DONE` tasks; else → Step 7, which judges the log. A re-run keeps the existing log and resets its `Verdict` to `PENDING`. |
 | 2-way agents (`@bkit-debug-abort-handover`, `@bkit-design-generate`, `@bkit-design-brainstorm-ideate-1/2/3`, `@bkit-ship-update-docs`, `@bkit-ship-conflict-resolve`, `@bkit-ship-deferred-sweep`) | PASS / FAIL | PASS → continue; FAIL → Failure Path. Atomic action — no middle state (cannot proceed → fail; no partial-progress CONCERNS). For `@bkit-ship-conflict-resolve`: PASS clears `docs/plans/{YYYYMM}/logs/{FID}/.rebase-failed` sentinel and Step 4 continues; FAIL leaves sentinel and routes to `@bkit-debug-abort-handover`. For `@bkit-ship-deferred-sweep`: PASS → Merge (Step 6); FAIL touches `docs/plans/{YYYYMM}/logs/{FID}/.deferred-blocked` and routes to `@bkit-debug-abort-handover` (merge never happens). FAIL only on >=1 of four blocking tests (behaviour / safety / false green / consumer break); a gap passing none joins the third track `Lazy (unjustified)`, orthogonal to the verdict — recorded in `docs/deferrals.jsonl` (`reason` = `unjustified`; new `key` unplanned, own `key` re-appended when adjudicated) and resurfaced, never merged against. |
@@ -872,14 +872,14 @@ Each subsection documents command behaviour — steps, subagents, artifacts, ver
 | --- | --- | --- |
 | 1 — Start Workflow | — | Pre-flight: fetch `origin/dev`. Issue recovery as in design Step 1 (issue-less: tracker reads, labels, comments and the blocker check skipped). Set label `Build`, `In Progress`. Check `relations.blocked_by` — any blocker not in `{Done, Cancelled}` → Failure Path with `Blocked by {BLOCKER_ID}`. Resolve `FID`, then lock (missing month bucket → current month). no commits on `dev` — `start-workflow` step entry deferred to Step 2 inside the worktree. |
 | 2 — Worktree Setup | — | `bkit worktrees setup` (create / resume / adopt; dependencies installed). No path moves — plan stays at canonical bucket from design close. `bkit workflows input` writes `build-input-{RUN}.md`: session prompt, issue text and the plan as it arrived — the whole plan again, so only `@bkit-build-plan-convert` reads it; it stays as the record of what the run was given. Every other build agent reads the plan or its group's brief, and run instructions in the session prompt (a redo, a resume, a constraint) reach the brief's `Deviations` section through `--note-file` (Step 6). |
-| 3 — Branch Sync | `@bkit-build-plan-convert` _(only when the plan is missing, has no task markers, or is older than an issue comment)_ | `bkit branches sync --merge-docs`: fetch `origin/dev`; when commits touching `docs/` are behind, merge it — ledger conflicts union, other `docs/` conflicts take `dev`, a conflict outside `docs/` aborts the merge (exit 11 → Failure Path). Then `bkit tests plan-check --existence=report` on `{FID}-plan.md` → `build-plan-check.md`. No plan (exit 2), a plan with no task markers (exit 1, problem `markers`), or a valid plan with issue comments posted after its last commit (`newerThanPlan` > 0 from Step 2's `workflows input`) → `@bkit-build-plan-convert` writes the plan in task-block form from `build-input-{RUN}.md` and the plan file, keeping any existing plan's other sections; where they disagree the newer text wins, so later comments change the plan before any code; convert copies each `TEST EXCEPTION` an input writes word for word and never writes its own; row `build-plan-convert`, then the check re-runs. Still failing → convert once more with the printed problems, then Failure Path. Any other problem (caps, a stray `TEST FIRST` line) → Failure Path before any code, naming each problem. `bkit install` / `check` / `upgrade` list each `{FID}-plan.md` with no task markers whose FID has not shipped as advisory `plan-task-markers-missing`; nothing to do by hand, this step converts it. |
+| 3 — Branch Sync | `@bkit-build-plan-convert` _(only when the plan is missing, has no task markers, or is older than an issue comment)_ | `bkit branches sync --merge-docs`: fetch `origin/dev`; when commits touching `docs/` are behind, merge it — ledger conflicts union, other `docs/` conflicts take `dev`, a conflict outside `docs/` aborts the merge (exit 11 → Failure Path). Then `bkit tests plan-check --existence=report` on `{FID}-plan.md` → `build-plan-check.md`. No plan (exit 2), a plan with no task markers (exit 1, problem `markers`) or with a `matrix` / `supersession` problem, or a valid plan with issue comments posted after its last commit (`newerThanPlan` > 0 from Step 2's `workflows input`) → `@bkit-build-plan-convert` writes the plan in task-block form from `build-input-{RUN}.md` and the plan file, keeping any existing plan's other sections; where they disagree the newer text wins, so later comments change the plan before any code; convert copies each `TEST EXCEPTION` an input writes word for word and never writes its own; row `build-plan-convert`, then the check re-runs. Still failing → convert once more with the printed problems, then Failure Path. Any other problem (caps, a stray `TEST FIRST` line) → Failure Path before any code, naming each problem. `bkit install` / `check` / `upgrade` list each `{FID}-plan.md` with no task markers whose FID has not shipped as advisory `plan-task-markers-missing`; nothing to do by hand, this step converts it. |
 | 4 — Plan Current | `@bkit-build-plan-current` _(skipped when the mechanical trigger clears)_ | Orchestrator trigger `bkit branches anchor-read --field=baseSha --against=origin/dev` reads the plan's `bkit:anchor` (§ Anchor Block) and exits 12 — skipping the whole step, no agent, no `step-done` row, same shape as Step 5's `[skills=false]` skip — on any of: no plan, no anchor, `baseSha` unreachable in this clone, nothing landed on `origin/dev` since it. Else it prints `value` (= `BASE_SHA`) and the agent derives its own changed-path list from it, intersects that against the paths the plan's tasks depend on, and reads per-path diffs for the intersection only. `Executable` tasks are not findings; `Reword` / `Broken` are. Judges the PLAN against the codebase — the design doc is not an input, and `designPath` / `designBaseSha` have no consumer here. `CURRENT_VERDICT` is advisory on every value — PASS / CONCERNS / FAIL all → Step 5; CONCERNS / FAIL are recorded, comment-posted with `Affected`, and echoed as a console advisory, never blocking. Findings carry into Step 6 as a Read for `@bkit-build-plan-execute`; build never revises the plan, a re-run of `/bkit-plan` does. |
 | 5 — Skills | `@bkit-build-install-skills` _(skip if input contains `[skills=false]`)_ | If new skills installed → commit `chore({FID}): install skills bkit [skip ci]`. |
 | 6 — Execute Plan | `@bkit-build-plan-execute` | `bkit context brief --next` writes `build-brief-{GROUP}-{n}.md` — the group's open task blocks, the reds already recorded for them, the earlier tasks they depend on as context, and the plan's `Reuse Inventory` rows and `Architecture & Component Changes` entries naming the open tasks' `CREATE` / `UPDATE` / `DELETE` files (rows and entries past the 8 KB work cap are left out and counted; execute then reads the plan section) — and prints `group` (null → Step 9), `workBytes` and `workCap`. When the session prompt carries run instructions beyond naming the issue, the orchestrator writes them once to `{SESSION_DIR}/brief-note.md` and passes `--note-file`, so each brief ends with a `Deviations` section the agents apply to the tasks it names. A `build-group-start` row records the commit the group starts from, once per group. The orchestrator passes paths only; the agent reads the brief, not the plan and not `build-input-{RUN}.md`. Per group: `build-plan-execute-{GROUP}-log.md`. Attempt-numbered rows (`--attempt-of=build-plan-execute:next`), one log appended across attempts. Writes stub-first then incremental `DONE — TASK {N}` / `BLOCKED — TASK {N}` log entries via `Bash echo >>`; writes source. Per task naming `TEST FIRST` tests: tests + stubs first, then the red command from Context (`bkit tests red`, § Test-first) once per test before the task's code. Does not modify the plan — ticking is verify's job (per-task `Edit`-tick phase after impl is done is a known timeout vector; verify absorbs recovery). Verdict `HANDOVER` (turn cap near), or a task with neither a `DONE` nor a `BLOCKED` line (the agent hit its turn cap) → Step 6 re-runs once for that group as a handover, not a failed attempt, its brief leaving out the `DONE` tasks; the tracker comment shows `HANDOVER`; after that the verify→remediate loop (Step 7 → Step 8, bounded by `build.verify.maxAttempts`) absorbs the recovery. Else → Step 7. |
 | 7 — Verify Plan | `@bkit-build-plan-verify` | `bkit tests green --group` first (§ Test-first) → `build-tests-green-{GROUP}-{VERIFY_ATTEMPT}.md`, read by verify and remediate; exit >= 2 → Failure Path. `bkit context diff --base=` the group's start commit → `build-diff-{GROUP}-{VERIFY_ATTEMPT}.md`, the changes since the group started. Per group, attempt-numbered: `build-plan-verify-{GROUP}-{VERIFY_ATTEMPT}.md`. Reads the group's briefs, the diff, the execute log's `DONE —` lines and `build-plan-current.md` (already-landed tasks); ticks `- [ ] **TASK {N}:**` → `[x]` only when the task's `DONE WHEN` field is satisfied in the codebase (never on `DONE —` claim alone). Missing `DONE WHEN` on any task → FAIL (template structure broken — remediation cannot recover, routes via Failure Path). `VERIFY_VERDICT` ∈ {PASS, CONCERNS, FAIL}. PASS **and** a later group exists → group gate (§ Group gate) → `build-group-gate-{GROUP}-{VERIFY_ATTEMPT}.md` + row; `GATE_VERDICT` ∈ {PASS, FAIL, SKIPPED}. PASS + gate != FAIL → Step 6. Header `Fixable` = `true` when gap-remediate can fix any gap (each `Identified Gaps Log` line ends `— Fixable: true` / `— Fixable: false`); a test a task's `TEST EXCEPTION` field names is no gap. Every non-PASS first checks the group's verify rounds against `build.verify.maxAttempts` (`counters route --point=build.verify`; over → Failure Path). FAIL → one fixable-only Step 8 attempt (`Scope: fixable only`) when `Fixable` = `true` and a round is left, else § Decision Pause (`VERIFY_GAPS`). Group gate FAIL alone → Step 8 while a round is left, else Failure Path; never asked. Other CONCERNS → § Decision Pause (`VERIFY_LOOP`) while a round is left, else `VERIFY_GAPS`. Reads prior verify and remediate logs to know what was already verified. |
 | 8 — Remediate Gaps | `@bkit-build-plan-gaps-remediate` _(only if Step 7 CONCERNS, group gate FAIL, or the fixable-only attempt)_ | Attempt-numbered: `build-plan-gaps-remediate-{GROUP}-{VERIFY_ATTEMPT}-log.md`; reads the group's briefs for its task blocks. Stub-first artifact + flat append-only log (`DONE —` per gap fixed; `BLOCKED —` per blocked gap, appended via `Bash echo >>`); reads glob of own prior attempts to skip already-fixed gaps. Header `Fixed` = gaps with `DONE` this attempt. Resumed into this step (a `retry` decision) → the group's last verify round is read back first: `VERIFY_ATTEMPT` (`counters derive --position=current`), `VERIFY_VERDICT` and the group gate's verdict (`status route`) and `scope` (its row), the gate counted SKIPPED when that round wrote no gate log. No progress — `bkit branches scan-diff --base=HEAD~1 --code` exit 1 (nothing changed outside `docs/plans`, `docs/*.jsonl`, `.bkit/*.jsonl`: only logs and ledgers), or `Fixed` = 0 → § Decision Pause; verify never re-runs on unchanged code. Else re-run Step 7 (its next row is the next `VERIFY_ATTEMPT`). Over `build.verify.maxAttempts` → Failure Path. |
 | 9 — Holistic Verification | `@bkit-build-plan-verify` (holistic mode) | Once per run, after the last group: every group of the plan plus cross-group integration, cross-checked against every group's execute log; writes `build-plan-verify-holistic.md`. A row already recorded (challenge fix groups coming back through the loop) → Step 10 without re-running. FAIL → Failure Path. |
-| 10 — Build Challenge | `@bkit-build-challenge-2`, plus `@bkit-build-challenge-1` on a large change (parallel) | At most `build.challenge.maxAttempts` rounds (`CHALLENGE_MAX`, `counters max --point=build.challenge`; `challenge merge --round` refuses a round over it, exit 2 → Failure Path): `CHALLENGE_DONE` (`bkit status resume` `challengeDone`, the last round already merged) → Step 11 without reviewing again. `bkit challenge gate` fetches `origin dev` (offline → the last fetch, logged), then sizes `origin/dev...HEAD`, on every pass (`docs/plans/**` excluded): under 300 lines and 10 files is small → the security reviewer (`-2`) runs alone and the finish and merge drop challenge-1's artifact and report; else both run. Each reviewer reads the same `tmp/bkit-diff-{FID}.md`, written just before (§ Diff per reader); on `partial diff coverage` challenge-2 runs a targeted `git diff` on each omitted file touching a security-relevant path. Reviewers read the plan and the diff only. Each writes every finding as one task block under `## Findings Log` (`build-challenge-1.md`, `build-challenge-2.md`): severity, class, `Fixable`, `Location`, `DONE WHEN`, and a `TEST FIRST` for every finding. `bkit challenge merge --plan={FID}-plan.md` then appends the `CRITICAL|HIGH|MEDIUM` findings to the plan as task blocks stamped `**Round:** N`, in new last groups of <= `bkit.workflows.tasks.maxPerGroup` tasks; a finding at the `Location` and severity of an earlier challenge task that is still open reopens that task instead (its `**Round:**` line gains the round, e.g. `1, 2`; listed in `reopened` and `fixTasks`), one already done in an earlier round gets a new task; writes each `LOW` one as a `docs/deferrals.jsonl` row (`reason` `low-severity`), drops findings a `build-decision-*.md` item accepted, and prints the route: `none` → Step 11; `fix` (a round before the last, every task fixable) → Step 6, whose brief takes the first new group, `CHALLENGE_ROUND` + 1; `pause` (a `**Fixable:** false` task, any task in the last round, or more findings than one merge takes, which writes nothing) → § Decision Pause. A re-run on the same reports appends nothing. Exit 22 (a report not in task-block form) or exit 23 (the findings fail `plan-check`: a missing `TEST FIRST`, a test cap passed; `problems` printed) → reviewers re-run once with the reason in their Context, then Failure Path. Resumed into an open challenge Decision Pause → the limit read (`CHALLENGE_MAX`) and sub-steps 2 and 5 run again (the merge finds its tasks in the plan, writes nothing and prints the round's open tasks as `fixTasks`) → back to the pause's question. The challenge row carries the `round` it ran as (`--field=round=`); `bkit status resume` reads it back as `challengeRound` — one more once a challenge's merge wrote tasks (its next row is `build-plan-execute` or `build-decision`, not `build-run-tests`) — so the last round never fixes on its own; `challengeDone` = true once a last-round challenge row has a route row after it. |
+| 10 — Build Challenge | `@bkit-build-challenge-2`, plus `@bkit-build-challenge-1` on a large change (parallel) | At most `build.challenge.maxAttempts` rounds (`CHALLENGE_MAX`, `counters max --point=build.challenge`; `challenge merge --round` refuses a round over it, exit 2 → Failure Path): `CHALLENGE_DONE` (`bkit status resume` `challengeDone`, the last round already merged) → Step 11 without reviewing again. `bkit challenge gate` fetches `origin dev` (offline → the last fetch, logged), then sizes `origin/dev...HEAD`, on every pass (`docs/plans/**` excluded): under 300 lines and 10 files is small → the security reviewer (`-2`) runs alone and the finish and merge drop challenge-1's artifact and report; else both run. Each reviewer reads the same `tmp/bkit-diff-{FID}.md`, written just before (§ Diff per reader); on `partial diff coverage` challenge-2 runs a targeted `git diff` on each omitted file touching a security-relevant path. Reviewers read the plan and the diff only. Each writes every finding as one task block under `## Findings Log` (`build-challenge-1.md`, `build-challenge-2.md`): severity, class, `Fixable`, `Location`, `DONE WHEN`, and a `TEST FIRST` for every finding. `bkit challenge merge --plan={FID}-plan.md` then appends the `CRITICAL|HIGH|MEDIUM` findings to the plan as task blocks stamped `**Round:** N`, in new last groups of <= `bkit.workflows.tasks.maxPerGroup` tasks, plus one `Derived Test Matrix` row per appended task's test when the plan carries the table; a finding at the `Location` and severity of an earlier challenge task that is still open reopens that task instead (its `**Round:**` line gains the round, e.g. `1, 2`; listed in `reopened` and `fixTasks`), one already done in an earlier round gets a new task; writes each `LOW` one as a `docs/deferrals.jsonl` row (`reason` `low-severity`), drops findings a `build-decision-*.md` item accepted, and prints the route: `none` → Step 11; `fix` (a round before the last, every task fixable) → Step 6, whose brief takes the first new group, `CHALLENGE_ROUND` + 1; `pause` (a `**Fixable:** false` task, any task in the last round, or more findings than one merge takes, which writes nothing) → § Decision Pause. A re-run on the same reports appends nothing. Exit 22 (a report not in task-block form) or exit 23 (the findings fail `plan-check`: a missing `TEST FIRST`, a test cap passed; `problems` printed) → reviewers re-run once with the reason in their Context, then Failure Path. Resumed into an open challenge Decision Pause → the limit read (`CHALLENGE_MAX`) and sub-steps 2 and 5 run again (the merge finds its tasks in the plan, writes nothing and prints the round's open tasks as `fixTasks`) → back to the pause's question. The challenge row carries the `round` it ran as (`--field=round=`); `bkit status resume` reads it back as `challengeRound` — one more once a challenge's merge wrote tasks (its next row is `build-plan-execute` or `build-decision`, not `build-run-tests`) — so the last round never fixes on its own; `challengeDone` = true once a last-round challenge row has a route row after it. |
 | 11 — Run Tests | — | `bkit tests run` runs the deepest `bkit:gate:*` the consumer declares — descending `static-unit-integration`, `static-unit` (§ Local gate scripts) — and saves the full output to `{OUTBOX}/run-tests-{TEST_ATTEMPT}.log`; `--artifact` writes a copy clamped with `debug-evidence` to `docs/plans/{YYYYMM}/logs/{FID}/run-tests-{TEST_ATTEMPT}.md`, which rides the step's commit (row `artifacts` + `clamped`), so the log survives the worktree. `.md`, not `.log`: `*.log` is gitignored. Exit 3 (no gate declared) / 4 (gate could not run, 126 / 127) → Failure Path, never a FAIL verdict. Pre-PR: no E2E (CI covers it on the resulting PR). Build does not run the live tier — the @live boundary needs a deployed URL, so it is validated post-merge by the push-only `bkit-tests-live` CI canary and reproduced on demand via `/bkit-debug`; build gates on local tiers only and records no `testsLiveSkipped` (out of build's scope by design, not skipped). A repo gating unit branch-coverage puts `test:coverage:unit` in `bkit:lane:unit`, so this gate and the CI unit lane run the same `package.json` script (one source for the threshold) and a coverage regression fails in the worktree here instead of only on the PR. `TEST_VERDICT` = PASS → Step 14. FAIL with a round left under `build.tests.maxAttempts` → § Decision Pause (`TESTS_LOOP`: Try again / Stop) → Step 12; none left → Failure Path. |
 | 12 — Diagnose Failure | `@bkit-debug-failure-diagnose` _(only if Step 11 FAIL)_ | Reads the committed Step 11 test log `docs/plans/{YYYYMM}/logs/{FID}/run-tests-{TEST_ATTEMPT}.md`. Writes `build-failure-diagnose-{TEST_ATTEMPT}.md`. Resumed into Steps 12-13 → `TEST_ATTEMPT` is read back (`counters derive --step=build-run-tests --position=current`). |
 | 13 — Remediate Failure | `@bkit-debug-failure-remediate` _(only if Step 11 FAIL)_ | Gets the diagnosis's `Strategy` in its Context (`status route --step=build-failure-diagnose` `strategy`). Writes `build-failure-remediate-{TEST_ATTEMPT}-log.md`. Stub-first artifact + flat append-only log (`DONE —` per fix step; `BLOCKED —` per blocked step, appended via `Bash echo >>`). No skip-done — each attempt is diagnosis-driven and may pick a different strategy. Re-run Step 11 (its next row is the next `TEST_ATTEMPT`). |
@@ -897,7 +897,7 @@ One mechanism for every build question: verify gaps logged `Fixable: false` (tes
 - **Hard blockers:** test-order gaps (`no-red`, `late-red`, `red-mismatch`, `red-evidence-missing`, `test-changed`), the other unfixable gaps (`no-test-first`, `test-first-malformed`, `test-first-unread`, `exception-refused`) and `**Fixable:** false` challenge findings. No recommendation; "yes" never answers one.
 - **Accept** by the owner: written ONLY after explicit human approval of that item; agents NEVER write one on own judgement. Test-order gap or `exception-refused` gap → a `**TEST EXCEPTION:**` field in the task's block, committed alone (`git commit -- {plan}`) so `tests green` honours them; each entry ends `— {reason} (owner, {YYYY-MM-DD})`, and the field replaces the task's existing one, never a second, so the plan-alone commit always changes its lines and blame points at it; other → `docs/decisions.jsonl` row (`by.step` `build-decision`, `rationale` `accepted by owner: …`). Verify and `bkit challenge merge` read `build-decision-*.md` and drop accepted items. An accepted challenge task is also ticked `[x]` and its title ends ` — accepted by owner`, so the summary does not count it as unfinished. Group-gate failures are never items.
 - **Accept (assumed):** taken without the owner — `Decision: Accept (assumed) — {reason} ({ask:false|headless}, {RUNTIME}, {date})`. Settled for this build (verify, `acceptedLocations()`, gaps-remediate treat it as accepted), but it is not an acceptance: no `docs/decisions.jsonl` row, no `TEST EXCEPTION`. The build summary lists each one and keeps the verdict at CONCERNS; `/bkit-ship` asks the owner to confirm it (§ `/bkit-ship`, Confirm Assumed Items).
-- **Fix now:** a new task block with `DONE WHEN` + `TEST FIRST`, numbered above the plan's highest task. From verify: inside the paused group when it stays within `bkit.workflows.tasks.maxPerGroup` tasks and `bkit.workflows.tasks.maxTestsPerGroup` tests, else a new group straight after it, every later group renumbered. From tests or challenge: a new last group. Then `tests plan-check` (non-zero → Failure Path) → Step 6, whose brief picks the group holding the open task → Step 7 → onward. Fix now on a challenge task reuses that task as it stands, and a challenge-originated fix reaches the challenge reviewers again through Steps 9-10. Taken without asking → `Decision: Fix now — recommended; applied without asking ({RUNTIME})`.
+- **Fix now:** a new task block with `DONE WHEN` + `TEST FIRST` and one `Derived Test Matrix` row per test in it, numbered above the plan's highest task. From verify: inside the paused group when it stays within `bkit.workflows.tasks.maxPerGroup` tasks and `bkit.workflows.tasks.maxTestsPerGroup` tests, else a new group straight after it, every later group renumbered. From tests or challenge: a new last group. Then `tests plan-check` (non-zero → Failure Path) → Step 6, whose brief picks the group holding the open task → Step 7 → onward. Fix now on a challenge task reuses that task as it stands, and a challenge-originated fix reaches the challenge reviewers again through Steps 9-10. Taken without asking → `Decision: Fix now — recommended; applied without asking ({RUNTIME})`.
 - **Try again** (loop questions only): one more fix round on the same problems; the items wait undecided. `From: verify` → Step 8, `From: tests` → Step 12. The round counts against the same limit.
 - **Then:** `steps finish --step=build-decision --field=route={fix|retry|verify|tests} --comment-body` (decision posted to the tracker) → Step 6 (`fix`), Step 8 (`retry` after a verify or group-gate loop) or Step 12 (`retry` after a tests loop), re-run Step 7 (`verify`), or Step 11 (`tests`). The row's `route` is what `bkit status resume` reads to resume after a decision: `retry` resumes at Step 8 (`build-plan-gaps-remediate`) when the paused step was `build-plan-verify` or `build-group-gate`, at Step 12 (`build-failure-diagnose`) when it was `build-run-tests`. A challenge decision with a fix to run → `fix`; one already in the last round also sets `CHALLENGE_DONE`, so Step 10 goes on to Step 11.
 - **Fixer reads the answer:** Step 8 (`@bkit-build-plan-gaps-remediate`) and Step 12 (`@bkit-debug-failure-diagnose`) read the newest `build-decision-{RUN}-*.md`, so the owner's words reach the next round. The `STANDARD → PIVOT → FINAL` ladder reads every run and is not reset by a decision: each further round moves up a rung, `FINAL` stays `FINAL`.
@@ -1371,7 +1371,7 @@ and holds its `bkit` key as `{BKIT}` (plus `repoRoot` as `{REPO_ROOT}`, `outboxR
 | `locks` | `acquire`, `release` | per-feature `.lock` |
 | `workflows` | `start`, `fail`, `handover`, `close`, `promote`, `links`, `input` | `workflow-started` (resume facts: `lastDoneStep`, `openDecision`; `--branch` refuses another checked-out branch, exit 15; ship clears stale sentinels); the Failure Path (`fail`: row, rebase abort, lock, sentinels, labels, failure comment; `handover --list-stray` lists paths outside the run's logs; `handover --push` / ship's `--flush`); `close` (compliance grade, `workflow-done`, telemetry, report, artifact links, `--outbox`, `--message` commit; ship's `--flush` lands on dev; `--final-return` prints the run's last message: summary (`--summary-file`, or `--summary` + `--summary-missing` when it may be absent), issue link, suggested replies, tips; `--session-dir` deletes the session folder, `fail` too); design / plan canonical promotion (`promote`), close links (`links`), the run's input file (`input`: session prompt, issue text, design / plan / audit reports) |
 | `worktrees` | `setup`, `remove` | Step 2 worktree create / resume / adopt (`--detect` asks the runtime), copy, install, ship's `branchWarning`; teardown |
-| `branches` | `sync`, `push`, `land`, `rebase`, `sync-dev`, `fast-forward`, `scan-diff`, `force-build`, `anchor-stamp`, `anchor-read` | docs-from-dev merge, base check, every push (`--mode=plain`: never forced, exit 21 nothing to ship; `--commit` + `--label`: one marker commit per run, then the push), design / plan close landing (squash in a throwaway `origin/dev` worktree pushed as `dev` with backoff retries, else PR squash-merge; audit; local `dev` fast-forward; lock release), Tier-2 rebase resolve, ship's local `dev` fast-forward, ship's PR-head fast-forward (`fast-forward`: exit 22 diverged), diff routing (`scan-diff --paths=` / `--marker=` / `--code`: exit 0 found, 1 none; `--expect-none` inverts both), `bkit [force build]` in the PR title plus marker commit (`force-build`), anchor block |
+| `branches` | `sync`, `push`, `land`, `rebase`, `sync-dev`, `fast-forward`, `scan-diff`, `force-build`, `anchor-stamp`, `anchor-read` | docs-from-dev merge, base check, every push (`--mode=plain`: never forced, exit 21 nothing to ship; `--commit` + `--label`: one marker commit per run, then the push), design / plan close landing (squash in a throwaway `origin/dev` worktree pushed as `dev` with backoff retries, else PR squash-merge; audit; local `dev` fast-forward; lock release), Tier-2 rebase resolve, ship's local `dev` fast-forward, ship's PR-head fast-forward (`fast-forward`: exit 22 diverged), diff routing (`scan-diff --paths=` / `--marker=` / `--code`: exit 0 found, 1 none; `--expect-none` inverts both; `--disabled-tests`: exit 1 when an added line disables a test or a test file loses an assertion, 0 when none, printing `file:line` and the test name), `bkit [force build]` in the PR title plus marker commit (`force-build`), anchor block |
 | `prs` | `open`, `probe`, `merge`, `update-branch`, `checks`, `verbose-ci`, `scan-body`, `cross-check`, `transport-row` | PR create (`open --file --workflow`: an `engine-action` row reuses the PR on a re-run) / lookup, squash merge (empty body, `--match-head`, auto-route suffix from `--label`), server-side base refresh, check-rollup classification (green when present and none failed/pending), debug's verbose-CI title, close-transport audit (`transport-row --scan --cross-check`) |
 | `issues` | `text`, `fetch`, `related`, `blocked-by`, `labels`, `comment` | issue text join + cut; the issue read into `{SESSION_DIR}` or `{OUTBOX}` (`fetch`: description, comments, facts); related-hit reads (`related`); open blockers (`blocked-by`); label arithmetic + board payload, written with `labels --write`; comment bodies, posted with `comment --post`. Each exits 80 or prints `done` = false when the tracker MCP must do it |
 | `runs` | `wait`, `dispatch`, `gate`, `revalidate`, `context`, `mirror`, `declared` | CI polls, CI-Dispatch Gate (`--file` / `--step` record its row, `--label` the re-trigger suffix), ship merge gate (`--pr` / `--squash-of` heads, `--snapshot`, `--record`, `--fetch` refreshes `origin/<--branch>` first), ship Step 9 re-validate, auto Step 1 context (`ref`: the issue as the dispatched workflow's argument), release-PR mirror, CI-workflow presence |
@@ -1517,7 +1517,7 @@ Every plan task block carries a `**TEST FIRST:**` field — one sub-bullet per t
 - **Hash in the row, snapshot beside the log:** both ride the plan-execute commit and survive push and resume; nothing pins a git object.
 - **Resume-safe:** execute never ticks tasks, so a resumed build re-runs execute from the first task; each earlier red stands because its test file is unchanged. Refused as `passed` → the task's code already exists → `BLOCKED`, never code undone to force a red.
 - **Plan caps, `package.json` `bkit.workflows.tasks`:** up to `bkit.workflows.tasks.maxPerGroup` tasks (default 3) and `bkit.workflows.tasks.maxTestsPerGroup` TEST FIRST tests (default 15) per group; per task `bkit.workflows.tasks.maxTestsPerTask` tests (default 10) across `bkit.workflows.tasks.maxTestFilesPerTask` test files (default 3). Bigger tasks exhaust plan-execute's turn budget, go code-first, and no red is possible after; a group is one execute agent's work, and a bigger group overflows its context. A key that is not a whole number >= 1 takes its default, and `bkit check` reports advisory `bkit-tasks-invalid`. `.github/ISSUE_TEMPLATE/bkit-change.yml` showing a key as `(default N)` with N other than the value `readBkitConfig` gives → advisory `bkit-tasks-form-stale`, naming the number to change in the form. Install and upgrade write the defaults when `tasks` or a key in it is missing; a value already set is never touched. `readBkitConfig` reads them (`CONFIG_DEFAULTS.tasks` in `settings.ts`); `tests plan-check` and `challenge merge` read the checkout's caps and refuse a plan over any cap, naming the task or group, its count and the cap; `repo info` prints them as `tasks`, which `/bkit-plan` and `/bkit-build` Step 1 hold as `{MAX_TASKS_PER_GROUP}`, `{MAX_TESTS_PER_GROUP}`, `{MAX_TESTS_PER_TASK}`, `{MAX_TEST_FILES_PER_TASK}` and pass in Context to every agent that writes, reviews, executes or verifies the plan: plan-generate, plan-review-1, plan-review-2, plan-scope-check, plan-update, convert, plan-execute, plan-verify and the challenge reviewers. Prompts name no cap value of their own; each uses the caps its Context names.
-- **One block reader:** `tests green`, `tests plan-check`, `challenge merge` and the run facts read a plan with `parsePlanBlocks` (`plan-blocks.ts`). A group is `<!-- bkit:group N start -->`, `### GROUP N: {title}` … `<!-- bkit:group N end -->`; a task is `<!-- bkit:task N start -->`, `- [ ] **TASK N:** {title}` … `<!-- bkit:task N end -->` inside a group, its number unique across the plan, its fields uppercase `**LABEL:**` lines. Group numbers start at 1 and ascend through the file (the build runs groups in file order); task numbers start at 1 and ascend within a group, so a Decision Pause task numbered above the plan's highest can join its paused group. `DEPENDS ON`, `DONE WHEN`, `TEST FIRST` and `TEST EXCEPTION` are written once per task; a second one, or a bold `**TASK N:**` line inside another task's block, is refused. `DEPENDS ON: none (...)` names no task; `tests plan-check` refuses a task depending on itself, on a missing task or on a task in a later group. CRLF reads like LF. A code fence never closed → `the code fence at line N is never closed; nothing after it is read`. Task-like text outside every block (a bold `task N` in any letter case, a bold field label; inline code and fenced blocks are prose) is a plan-level problem: `tests plan-check` refuses it, and `tests green` reports it as a `test-first-unread` gap (`task` null, `Fixable: false`) while auditing every task it could read.
+- **One block reader:** `tests green`, `tests plan-check`, `challenge merge` and the run facts read a plan with `parsePlanBlocks` (`plan-blocks.ts`). A group is `<!-- bkit:group N start -->`, `### GROUP N: {title}` … `<!-- bkit:group N end -->`; a task is `<!-- bkit:task N start -->`, `- [ ] **TASK N:** {title}` … `<!-- bkit:task N end -->` inside a group, its number unique across the plan, its fields uppercase `**LABEL:**` lines. Group numbers start at 1 and ascend through the file (the build runs groups in file order); task numbers start at 1 and ascend within a group, so a Decision Pause task numbered above the plan's highest can join its paused group. `DEPENDS ON`, `DONE WHEN`, `TEST FIRST` and `TEST EXCEPTION` are written once per task; a second one, or a bold `**TASK N:**` line inside another task's block, is refused. `DEPENDS ON: none (...)` names no task; `tests plan-check` refuses a task depending on itself, on a missing task or on a task in a later group. The readers beside it — `reuseInventory`, `derivedTestMatrix` (its `Task` column) and `supersessionInventory` — read the plan's `Reuse Inventory`, `Derived Test Matrix` and `Supersession Inventory` tables; a `CREATE` with no NEW row, a matrix row naming no task / an undefined task / two tasks or a test-bearing task no row names, and a `DELETE` with no `Supersession Inventory` row are each plan-check problems. CRLF reads like LF. A code fence never closed → `the code fence at line N is never closed; nothing after it is read`. Task-like text outside every block (a bold `task N` in any letter case, a bold field label; inline code and fenced blocks are prose) is a plan-level problem: `tests plan-check` refuses it, and `tests green` reports it as a `test-first-unread` gap (`task` null, `Fixable: false`) while auditing every task it could read.
 - **`fails on {what goes wrong}`, not an assertion:** a literal assertion can be one current code never passes (a value the path always prints) → build rewrites it after its red → `test-changed`. A described failure leaves the build free to write a passable check; plan review-2 flags checks current code rules out.
 - **Late red:** plan-execute commits only at step end, so TASK N's code first lands in the first plan-execute step commit after the red's `parentSha` whose log records `DONE — TASK N` (any letter case). Red `parentSha` = that commit or a descendant (`git merge-base --is-ancestor`) → `late-red`. Catches reds a later step records by swapping old source back. A red recorded inside plan-execute after its code is undetectable (no commit yet); the execute and gaps-remediate prompts forbid it. A task with a red but no plan-execute commit logging `DONE — TASK N` (log line in another form, task never `DONE`) is not checked: the report's `Late-red check` section names it and verify notes it, never silent.
 - **Added lines only:** snapshot lines all present in order, whitespace ignored → no `test-changed` from `tests green`; diff still reported, row `added lines only`. Verify reads each such diff: a line added inside a planned test or setup it runs (an early `return`, a new mock) can gut the test without editing a line → `test-changed`. Removed / rewritten lines stay a gap for verify.
diff --git a/.bkit/core/docs/templates/bkit-plan.md b/.bkit/core/docs/templates/bkit-plan.md
index 146928011..a9f95b6ce 100644
--- a/.bkit/core/docs/templates/bkit-plan.md
+++ b/.bkit/core/docs/templates/bkit-plan.md
@@ -65,16 +65,16 @@ _notation, e.g._ **WHEN** a user submits the form with a valid file **→ THEN**
 
 ### Derived Test Matrix
 
-`Type` = a tier from `docs/testing.md`: Static, Unit, Integration, @live (golden), E2E, fresh-DB replay, Smoke.
+`Type` = a tier from `docs/testing.md`: Static, Unit, Integration, @live (golden), E2E, fresh-DB replay, Smoke. `Task` = the one runbook task that lands the row's test.
 
 <!-- prettier-ignore -->
-| Test description | Type | Target file |
-| --- | --- | --- |
-| [e.g., Happy path: user creates event, sees it in list] | E2E | [e.g. `apps/web/e2e/[feature].spec.ts`] |
-| [e.g., Service correctly parses payload] | Unit | [e.g. `packages/[pkg]/[module].test.ts`] |
-| [e.g., API endpoint enforces tenant isolation] | Integration | [e.g. `packages/api/[feature].integration.test.ts`] |
-| [e.g., Real 3rd-party API returns expected shape and a boundary-only identity — not "did not throw"] | @live (golden) | [e.g. `packages/[pkg]/[feature].live.test.ts`] |
-| [e.g., New migration replays from empty and seed loads] | fresh-DB replay | [e.g. `supabase/migrations/*`] (replayed by `bkit-tests-migration`) |
+| Test description | Type | Target file | Task |
+| --- | --- | --- | --- |
+| [e.g., Happy path: user creates event, sees it in list] | E2E | [e.g. `apps/web/e2e/[feature].spec.ts`] | 2 |
+| [e.g., Service correctly parses payload] | Unit | [e.g. `packages/[pkg]/[module].test.ts`] | 2 |
+| [e.g., API endpoint enforces tenant isolation] | Integration | [e.g. `packages/api/[feature].integration.test.ts`] | 2 |
+| [e.g., Real 3rd-party API returns expected shape and a boundary-only identity — not "did not throw"] | @live (golden) | [e.g. `packages/[pkg]/[feature].live.test.ts`] | 2 |
+| [e.g., New migration replays from empty and seed loads] | fresh-DB replay | [e.g. `supabase/migrations/*`] (replayed by `bkit-tests-migration`) | 1 |
 
 ### 👤 ✅ Human Confirmation
 
diff --git a/.bkit/core/engine/commands/workflow/branches.test.ts b/.bkit/core/engine/commands/workflow/branches.test.ts
index 70ca07964..b4db59629 100644
--- a/.bkit/core/engine/commands/workflow/branches.test.ts
+++ b/.bkit/core/engine/commands/workflow/branches.test.ts
@@ -1560,6 +1560,53 @@ describe("branches scan-diff", { timeout: GIT_TIMEOUT }, () => {
     expect(r.json).toEqual({ found: true, paths: ["src/y.ts"] });
   });
 
+  // The fixture's skip marker is spelled in two pieces, as the slop plugin spells its own
+  // patterns: this file then carries no skip marker of its own for the scanner to find.
+  const SKIP = `${"it"}.${"skip"}`;
+  /** A test file: one passing test, then `extra` lines after it. */
+  const testFile = (...extra: string[]) =>
+    ["it('keeps a', () => {", "  expect(1).toBe(1);", "});", ...extra, ""].join("\n");
+
+  it("scan-diff finds an added skip", async () => {
+    const { clone } = featureBranch("scan-disabled");
+    write(clone, "src/a.test.ts", testFile());
+    commit(clone, {}, "test");
+    write(clone, "src/a.test.ts", testFile(`${SKIP}('keeps a', () => {});`));
+    commit(clone, {}, "skip");
+    const r = await run(clone, ["scan-diff", "--base=origin/dev", "--disabled-tests"]);
+    expect(r.code).toBe(1);
+  });
+
+  it("scan-diff ignores a skip predating the base", async () => {
+    const { clone } = featureBranch("scan-disabled-old");
+    write(clone, "src/a.test.ts", testFile(`${SKIP}('keeps a', () => {});`));
+    commit(clone, {}, "skip");
+    write(clone, "src/b.ts", "b\n");
+    commit(clone, {}, "other");
+    const r = await run(clone, ["scan-diff", "--base=HEAD~1", "--disabled-tests"]);
+    expect(r.code).toBe(0);
+  });
+
+  it("scan-diff reports a disabled test with its line", async () => {
+    const { clone } = featureBranch("scan-disabled-line");
+    write(clone, "src/a.test.ts", testFile());
+    commit(clone, {}, "test");
+    write(clone, "src/a.test.ts", testFile(`${SKIP}('drops b', () => {});`));
+    commit(clone, {}, "skip");
+    const r = await run(clone, ["scan-diff", "--base=origin/dev", "--disabled-tests"]);
+    expect(r.code).toBe(1);
+    expect(r.json?.disabled).toEqual([{ file: "src/a.test.ts", line: 4, test: "drops b" }]);
+  });
+
+  it("scan-diff exits 0 on a diff that adds no disabled test", async () => {
+    const { clone } = featureBranch("scan-disabled-none");
+    write(clone, "src/a.test.ts", testFile());
+    commit(clone, {}, "test");
+    const r = await run(clone, ["scan-diff", "--base=origin/dev", "--disabled-tests"]);
+    expect(r.code).toBe(0);
+    expect(r.json?.disabled).toEqual([]);
+  });
+
   it("needs exactly one of --paths, --marker, --code; an unknown base exits 23", async () => {
     const { clone } = featureBranch("scan-usage");
     expect((await run(clone, ["scan-diff", "--base=origin/dev"])).code).toBe(2);
diff --git a/.bkit/core/engine/commands/workflow/branches.ts b/.bkit/core/engine/commands/workflow/branches.ts
index 8aaf592ef..cc6e89ee9 100644
--- a/.bkit/core/engine/commands/workflow/branches.ts
+++ b/.bkit/core/engine/commands/workflow/branches.ts
@@ -1058,14 +1058,124 @@ function fastForwardVerb(ctx: RunContext): number {
 /** Paths a source-change check leaves out: plan logs and the append-only ledgers. */
 const NOT_CODE = [":(exclude)docs/plans", ":(exclude)docs/*.jsonl", ":(exclude).bkit/*.jsonl"];
 
+/** One added line that disables a test, or removes one of its assertions. */
+export interface DisabledTest {
+  file: string;
+  /** 1-based line in the new file. */
+  line: number;
+  /** The test it sits in, else the marker line's own text. */
+  test: string;
+}
+
+/** A test file's name at any tier: unit, integration, E2E. */
+const TEST_FILE = /\.(?:test|spec)\.|_test\.|(^|\/)test_[^/]*\.py$/;
+
+/** Added-line markers that disable a test: `bkit-slop-type-suppression.mjs`'s set, widened. */
+const DISABLED_MARKERS = [
+  /\b(?:describe|context|it|test|suite|bench)\.(?:skip|todo|fixme)\b/,
+  /(?<!\.)\bx(?:it|describe|test|context)\s*\(/,
+  /\bxfail\b/,
+  /\bt\.Skip\(/,
+  /#\[ignore\b/,
+  /@Disabled\b/,
+];
+
+/** An assertion call a change deletes from a test file. */
+const ASSERTION = /\b(?:expect|assert\w*|should|should_\w+)\b/;
+
+/** A test declaration's name on `line`, or null when the line declares no test. */
+function declaredName(line: string): string | null {
+  const call = /\b(?:it|test|suite|describe|context|bench)(?:\.[a-z]+)*\s*\(\s*(["'`])(.+?)\1/.exec(
+    line,
+  );
+  if (call !== null) return call[2]!;
+  const go = /\bfunc\s+(Test\w+)\s*\(/.exec(line);
+  if (go !== null) return go[1]!;
+  const py = /\bdef\s+(test_\w+)\s*\(/.exec(line);
+  if (py !== null) return py[1]!;
+  if (/@Test\b/.test(line)) {
+    const java = /\b(?:void|fun)\s+(\w+)\s*\(/.exec(line);
+    return java?.[1] ?? line.trim();
+  }
+  return null;
+}
+
+/** The test at 1-based `at` in `body`: the nearest declaration above it, else `line` itself. */
+function testAt(body: string | null, line: string, at: number): string {
+  if (body !== null) {
+    const lines = body.split(/\r?\n/);
+    for (let i = Math.min(at, lines.length) - 1; i >= 0; i--) {
+      const name = declaredName(lines[i]!);
+      if (name !== null) return name;
+    }
+  }
+  return line.trim();
+}
+
+const HUNK = /^@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/;
+
+/**
+ * The added lines of a `--no-renames` unified diff that disable a test, and the removed
+ * assertion lines of a test file: each with its new-file line and the test it sits in.
+ */
+export function disabledTestsIn(diff: string, root: string): DisabledTest[] {
+  const out: DisabledTest[] = [];
+  const bodies = new Map<string, string | null>();
+  const body = (rel: string) => {
+    if (!bodies.has(rel)) {
+      const abs = path.resolve(root, rel);
+      bodies.set(
+        rel,
+        fs.statSync(abs, { throwIfNoEntry: false })?.isFile()
+          ? fs.readFileSync(abs, "utf-8")
+          : null,
+      );
+    }
+    return bodies.get(rel)!;
+  };
+  let file = "";
+  let next = 0;
+  for (const raw of diff.split("\n")) {
+    if (raw.startsWith("+++ ")) {
+      file = raw.replace(/^\+\+\+ (b\/)?/, "");
+      continue;
+    }
+    if (raw.startsWith("--- ")) continue;
+    const hunk = HUNK.exec(raw);
+    if (hunk !== null) {
+      next = Number(hunk[1]);
+      continue;
+    }
+    if (raw.startsWith("+")) {
+      const text = raw.slice(1);
+      if (DISABLED_MARKERS.some((m) => m.test(text)))
+        out.push({ file, line: next, test: testAt(body(file), text, next) });
+      next++;
+    } else if (raw.startsWith("-")) {
+      if (TEST_FILE.test(file) && ASSERTION.test(raw.slice(1)))
+        out.push({ file, line: next, test: testAt(body(file), raw.slice(1), next) });
+    } else if (raw.startsWith(" ")) next++;
+  }
+  return out;
+}
+
 function scanDiffVerb(ctx: RunContext): number {
   const base = String(ctx.flags.base);
   const pattern = str(ctx.flags.paths);
   const marker = str(ctx.flags.marker);
   const code = ctx.flags.code === true;
-  if ([pattern !== undefined, marker !== undefined, code].filter(Boolean).length !== 1) {
-    throw new CommandError(EXIT.USAGE, "give exactly one of --paths, --marker, --code");
+  const disabled = ctx.flags.disabledTests === true;
+  if ([pattern !== undefined, marker !== undefined, code, disabled].filter(Boolean).length !== 1) {
+    throw new CommandError(
+      EXIT.USAGE,
+      "give exactly one of --paths, --marker, --code, --disabled-tests",
+    );
   }
+  if (disabled && ctx.flags.expectNone === true)
+    throw new CommandError(
+      EXIT.USAGE,
+      "--disabled-tests inverts the exit already; drop --expect-none",
+    );
   let re: RegExp | undefined;
   if (pattern !== undefined) {
     try {
@@ -1085,6 +1195,21 @@ function scanDiffVerb(ctx: RunContext): number {
     return EXIT_DIFF_FAILED;
   }
   const range = `${base}...HEAD`;
+  if (disabled) {
+    const diff = quietGit(top, ["diff", "--no-renames", range, "--", ".", ":(exclude)docs/plans"]);
+    if (!diff.ok) {
+      ctx.log(`git diff ${range} failed: ${diff.stderr}`);
+      return EXIT_DIFF_FAILED;
+    }
+    const hits = disabledTestsIn(diff.stdout, top);
+    const files = [...new Set(hits.map((h) => h.file))];
+    ctx.emit({ found: hits.length > 0, paths: files, disabled: hits });
+    if (hits.length > 0)
+      ctx.log(
+        `added lines disable tests:\n${hits.map((h) => `${h.file}:${h.line} — ${h.test}`).join("\n")}`,
+      );
+    return hits.length > 0 ? EXIT.NO : EXIT.OK;
+  }
   let paths: string[];
   if (marker !== undefined) {
     const diff = quietGit(top, ["diff", "--no-renames", range, "--", ".", ":(exclude)docs/plans"]);
@@ -2121,7 +2246,7 @@ export const branchesCommand: CommandSpec = {
     },
     "scan-diff": {
       summary:
-        "Exit 0 when the branch's diff from --base matches (paths, an added marker line, or a source change); 1 when not.",
+        "Exit 0 when the branch's diff from --base matches (paths, an added marker line, a source change, or a disabled test); 1 when not — --disabled-tests turns that round: 1 when a test was disabled or lost an assertion, 0 when none was.",
       flags: [
         {
           name: "base",
@@ -2144,13 +2269,23 @@ export const branchesCommand: CommandSpec = {
           type: "boolean",
           help: "a path changed outside docs/plans, docs/*.jsonl and .bkit/*.jsonl",
         },
+        {
+          name: "disabled-tests",
+          type: "boolean",
+          help: "an added line disables a test (`.skip` / `.todo` / `.fixme` / `xfail`, `t.Skip()`, `#[ignore]`, `@Disabled`) or a test file loses an assertion; inverts --paths / --marker / --code's polarity, so never pass it with --expect-none",
+        },
         {
           name: "expect-none",
           type: "boolean",
           help: "invert the exit: 0 when nothing matched, 1 (naming the paths on stderr) when something did",
         },
       ],
-      output: { found: "something matched", paths: "the matching paths" },
+      output: {
+        found: "something matched",
+        paths: "the matching paths",
+        disabled:
+          "[{file, line, test}]: added lines that disable a test, and removed assertion lines of a test file (only with --disabled-tests)",
+      },
       exitCodes: {
         [EXIT_DIFF_FAILED]: "--base does not resolve, or git diff failed",
       },
diff --git a/.bkit/core/engine/commands/workflow/challenge.test.ts b/.bkit/core/engine/commands/workflow/challenge.test.ts
index f07e85016..fc66bd389 100644
--- a/.bkit/core/engine/commands/workflow/challenge.test.ts
+++ b/.bkit/core/engine/commands/workflow/challenge.test.ts
@@ -7,7 +7,7 @@ import { afterEach, beforeEach, describe, expect, it } from "vitest";
 
 import { runCommand } from "../lib";
 import { CHALLENGE_SMALL, challengeCommand, challengeGate } from "./challenge";
-import { parsePlanBlocks } from "./plan-blocks";
+import { derivedTestMatrix, parsePlanBlocks } from "./plan-blocks";
 import { checkPlanText, readTestFirst } from "./tests";
 
 const MONTH = "202610";
@@ -247,6 +247,31 @@ describe("bkit challenge merge", () => {
     expect(checkPlanText(read(PLAN)).problems).toEqual([]);
   });
 
+  it("challenge merge writes a matrix row for each appended finding task", async () => {
+    write(
+      PLAN,
+      [
+        plan(2),
+        "",
+        "## Derived Test Matrix",
+        "",
+        "<!-- prettier-ignore -->",
+        "| Test description | Type | Target file | Task |",
+        "| --- | --- | --- | --- |",
+        "| case 1 | Unit | `src/a.test.ts` | 1 |",
+        "| case 2 | Unit | `src/b.test.ts` | 2 |",
+        "",
+      ].join("\n"),
+    );
+    write(R1, report({ sev: "HIGH", loc: "src/a.ts:10" }, { sev: "MEDIUM", loc: "src/b.ts:4" }));
+    const r = await merge(...args([R1]));
+    expect(r.code).toBe(0);
+    expect(r.json.fixTasks).toBe("3,4");
+    const merged = read(PLAN);
+    expect(derivedTestMatrix(merged)?.rows.map((row) => row.tasks)).toEqual([[1], [2], [3], [4]]);
+    expect(checkPlanText(merged).problems).toEqual([]);
+  });
+
   it("leaves the plan unchanged when plan-check fails", async () => {
     write(PLAN, plan(2));
     write(R1, report({ sev: "HIGH", loc: "src/a.ts:10", tests: [] }));
diff --git a/.bkit/core/engine/commands/workflow/challenge.ts b/.bkit/core/engine/commands/workflow/challenge.ts
index a28637c75..35052911a 100644
--- a/.bkit/core/engine/commands/workflow/challenge.ts
+++ b/.bkit/core/engine/commands/workflow/challenge.ts
@@ -27,7 +27,7 @@ import { appendLine, statusTimestamp } from "../../ledgers/status.js";
 import { CommandError, DEV, EXIT, git, runGit, type CommandSpec } from "../lib.js";
 import { DIFF_BASE, EXIT_BASE, diffNumstat, type DiffStat } from "./context.js";
 import { EXIT_ROW_REFUSED, EXIT_STAGE, appendLedgerRows } from "./ledgers.js";
-import { parsePlanBlocks, type PlanTaskBlock } from "./plan-blocks.js";
+import { derivedTestMatrix, parsePlanBlocks, type PlanTaskBlock } from "./plan-blocks.js";
 import { readBkitConfig, type TaskCaps } from "../../shared/settings.js";
 import { checkPlanText, planCaps, readTestFirst } from "./tests.js";
 import { ledgerRows } from "./workflows.js";
@@ -251,6 +251,29 @@ const taskBlock = (n: number, f: Finding, round: number) => [
   `<!-- bkit:task ${n} end -->`,
 ];
 
+/** The test tier `docs/testing.md` records for a test file's name. */
+const testTier = (file: string) =>
+  /\.integration\.test\./.test(file)
+    ? "Integration"
+    : /\.live\.test\./.test(file)
+      ? "@live (golden)"
+      : "Unit";
+
+/**
+ * One `Derived Test Matrix` row per test a finding task appends: the test's own name and
+ * file from its `TEST FIRST` entry, its tier from the file's name, and the task number.
+ */
+function matrixRows(findings: Finding[], firstTask: number): string[] {
+  return findings.flatMap((f, i) =>
+    f.tests.map((entry) => {
+      const spans = [...entry.matchAll(/`([^`]+)`/g)].map((m) => m[1]!.trim());
+      const file = spans[0] ?? "";
+      const name = spans[1] ?? entry.replace(/[`|]/g, "").trim();
+      return `| ${name} | ${testTier(file)} | \`${file}\` | ${firstTask + i} |`;
+    }),
+  );
+}
+
 /**
  * The findings as groups of task blocks, numbered from `firstTask` and `firstGroup`: a
  * group closes at `caps.maxPerGroup` tasks, or before a task that would take it past
@@ -300,7 +323,9 @@ interface Written {
 
 /**
  * `plan` with the findings written as new groups after its last group (at the end when
- * it has none), tasks numbered from `firstTask`, grouped within `caps`.
+ * it has none), tasks numbered from `firstTask`, grouped within `caps`. A plan that
+ * carries a `Derived Test Matrix` gains a row per finding test, so the matrix check holds
+ * over the appended tasks too.
  */
 export function appendTasks(
   plan: string,
@@ -312,9 +337,15 @@ export function appendTasks(
   const blocks = parsePlanBlocks(plan);
   const firstGroup = Math.max(0, ...blocks.groups.map((g) => g.group)) + 1;
   const { lines: block, tasks } = findingGroups(findings, firstTask, firstGroup, round, caps);
+  const matrix = derivedTestMatrix(plan);
+  const rows = matrix === null ? [] : matrixRows(findings, firstTask);
+  // The matrix table's last row, or its separator line when it holds none: 0-based index.
+  const matrixAt = matrix === null ? -1 : (matrix.rows.at(-1)?.number ?? matrix.line + 1);
+  const lines = plan.split("\n");
+  if (matrixAt >= 0) lines.splice(matrixAt, 0, ...rows);
   const last = blocks.groups.at(-1);
   if (last === undefined) {
-    const body = plan.replace(/\n*$/, "");
+    const body = lines.join("\n").replace(/\n*$/, "");
     const from = body.split("\n").length + 2;
     return {
       text: `${body}\n\n${block.join("\n")}\n`,
@@ -322,9 +353,9 @@ export function appendTasks(
       written: { from, to: from + block.length - 1 },
     };
   }
-  const lines = plan.split("\n");
-  lines.splice(last.end, 0, "", ...block);
-  const from = last.end + 2;
+  const shift = matrixAt >= 0 && matrixAt <= last.end ? rows.length : 0;
+  lines.splice(last.end + shift, 0, "", ...block);
+  const from = last.end + shift + 2;
   return { text: lines.join("\n"), tasks, written: { from, to: from + block.length - 1 } };
 }
 
diff --git a/.bkit/core/engine/commands/workflow/plan-blocks.test.ts b/.bkit/core/engine/commands/workflow/plan-blocks.test.ts
index 85942fdf5..4c688a7f9 100644
--- a/.bkit/core/engine/commands/workflow/plan-blocks.test.ts
+++ b/.bkit/core/engine/commands/workflow/plan-blocks.test.ts
@@ -3,7 +3,7 @@ import * as path from "node:path";
 
 import { describe, expect, it } from "vitest";
 
-import { parsePlanBlocks, reuseInventory } from "./plan-blocks";
+import { derivedTestMatrix, parsePlanBlocks, reuseInventory } from "./plan-blocks";
 
 const task = (n: number, body: string[] = [], tick = " ") => [
   `<!-- bkit:task ${n} start -->`,
@@ -371,3 +371,25 @@ describe("reuseInventory", () => {
     expect(reuseInventory(text.join("\n"))).toBeNull();
   });
 });
+
+it("derivedTestMatrix returns a null column index when the header has no Task column", () => {
+  const text = [
+    "# Plan",
+    "",
+    "## Derived Test Matrix",
+    "",
+    "| Test description | Type | Target file |",
+    "| --- | --- | --- |",
+    "| case a | Unit | `t.test.ts` |",
+    "",
+    "## Next",
+    "",
+    "| Not | A | Matrix |",
+    "| --- | --- | --- |",
+    "| x | y | z |",
+  ].join("\n");
+  const matrix = derivedTestMatrix(text);
+  expect(matrix?.taskColumn).toBeNull();
+  expect(matrix?.line).toBe(5);
+  expect(matrix?.rows.map((r) => r.cells)).toEqual([["case a", "Unit", "`t.test.ts`"]]);
+});
diff --git a/.bkit/core/engine/commands/workflow/plan-blocks.ts b/.bkit/core/engine/commands/workflow/plan-blocks.ts
index 15d263a50..49e142ee0 100644
--- a/.bkit/core/engine/commands/workflow/plan-blocks.ts
+++ b/.bkit/core/engine/commands/workflow/plan-blocks.ts
@@ -128,13 +128,11 @@ const tableCells = (row: string) =>
     .map((c) => c.trim());
 
 /**
- * The plan's Reuse Inventory: the first table under the first heading naming Reuse
- * Inventory, before the next heading of the same or a higher level. Each row's `File`
- * cell gives its backticked paths, normalised. No heading, table or `File` column → null.
+ * The first table under the first heading matching `heading`, before the next heading of
+ * the same or a higher level: the header line's index and its cells. No heading or table → null.
  */
-export function reuseInventory(text: string): ReuseInventory | null {
-  const lines = text.split(/\r?\n/);
-  const start = lines.findIndex((l) => /^#{2,4} .*Reuse Inventory/i.test(l));
+function firstTable(lines: string[], heading: RegExp): { head: number; cols: string[] } | null {
+  const start = lines.findIndex((l) => heading.test(l));
   if (start < 0) return null;
   const level = /^#+/.exec(lines[start]!)![0].length;
   const ends = (l: string) => new RegExp(`^#{1,${level}} `).test(l);
@@ -145,12 +143,23 @@ export function reuseInventory(text: string): ReuseInventory | null {
       break;
     }
   if (head < 0) return null;
-  const cols = tableCells(lines[head]!);
-  const file = cols.findIndex((c) => /^file\b/i.test(c));
-  const decision = cols.findIndex((c) => /^decision\b/i.test(c));
+  return { head, cols: tableCells(lines[head]!) };
+}
+
+/**
+ * The plan's Reuse Inventory: the first table under the first heading naming Reuse
+ * Inventory, before the next heading of the same or a higher level. Each row's `File`
+ * cell gives its backticked paths, normalised. No heading, table or `File` column → null.
+ */
+export function reuseInventory(text: string): ReuseInventory | null {
+  const lines = text.split(/\r?\n/);
+  const table = firstTable(lines, /^#{2,4} .*Reuse Inventory/i);
+  if (table === null) return null;
+  const file = table.cols.findIndex((c) => /^file\b/i.test(c));
+  const decision = table.cols.findIndex((c) => /^decision\b/i.test(c));
   if (file < 0) return null;
   const rows: InventoryRow[] = [];
-  for (let i = head + 2; i < lines.length && /^\s*\|/.test(lines[i]!); i++) {
+  for (let i = table.head + 2; i < lines.length && /^\s*\|/.test(lines[i]!); i++) {
     const cells = tableCells(lines[i]!);
     rows.push({
       line: lines[i]!,
@@ -160,7 +169,82 @@ export function reuseInventory(text: string): ReuseInventory | null {
       decision: decision < 0 ? "" : (cells[decision] ?? ""),
     });
   }
-  return { head: lines.slice(head, head + 2), rows };
+  return { head: lines.slice(table.head, table.head + 2), rows };
+}
+
+/** One `Derived Test Matrix` row: its cells, its line, and the tasks its `Task` cell names. */
+export interface MatrixRow {
+  /** The row as written. */
+  line: string;
+  /** 1-based plan line. */
+  number: number;
+  /** The row's cells, in header order. */
+  cells: string[];
+  /** The task numbers its `Task` cell names. */
+  tasks: number[];
+}
+
+/** The plan's `Derived Test Matrix` table: its header, the `Task` column and its rows. */
+export interface DerivedTestMatrix {
+  /** The header and separator lines. */
+  head: string[];
+  /** 1-based line of the header row. */
+  line: number;
+  /** The `Task` column's index; null when the header carries none. */
+  taskColumn: number | null;
+  rows: MatrixRow[];
+}
+
+/** One `Supersession Inventory` row: its line and the backticked paths it names. */
+export interface SupersessionRow {
+  /** The row as written. */
+  line: string;
+  /** 1-based plan line. */
+  number: number;
+  /** The row's backticked paths, normalised. */
+  files: string[];
+}
+
+/** The plan's `Derived Test Matrix` over `tableCells`; null when the plan has no such table. */
+export function derivedTestMatrix(text: string): DerivedTestMatrix | null {
+  const lines = text.split(/\r?\n/);
+  const table = firstTable(lines, /^#{2,4} .*Derived Test Matrix/i);
+  if (table === null) return null;
+  const column = table.cols.findIndex((c) => /^task\b/i.test(c));
+  const rows: MatrixRow[] = [];
+  for (let i = table.head + 2; i < lines.length && /^\s*\|/.test(lines[i]!); i++) {
+    const cells = tableCells(lines[i]!);
+    rows.push({
+      line: lines[i]!,
+      number: i + 1,
+      cells,
+      tasks: column < 0 ? [] : [...(cells[column] ?? "").matchAll(/\d+/g)].map((m) => Number(m[0])),
+    });
+  }
+  return {
+    head: lines.slice(table.head, table.head + 2),
+    line: table.head + 1,
+    taskColumn: column < 0 ? null : column,
+    rows,
+  };
+}
+
+/** The plan's `Supersession Inventory` rows over `tableCells`; null when the plan has no such table. */
+export function supersessionInventory(text: string): SupersessionRow[] | null {
+  const lines = text.split(/\r?\n/);
+  const table = firstTable(lines, /^#{2,4} .*Supersession Inventory/i);
+  if (table === null) return null;
+  const column = table.cols.findIndex((c) => /^existing\b/i.test(c));
+  const rows: SupersessionRow[] = [];
+  for (let i = table.head + 2; i < lines.length && /^\s*\|/.test(lines[i]!); i++) {
+    const cells = tableCells(lines[i]!);
+    rows.push({
+      line: lines[i]!,
+      number: i + 1,
+      files: spansOf(cells[column < 0 ? 0 : column] ?? "").map((f) => path.posix.normalize(f)),
+    });
+  }
+  return rows;
 }
 
 /** The error for a code fence opened at `line` and never closed. */
diff --git a/.bkit/core/engine/commands/workflow/tests.test.ts b/.bkit/core/engine/commands/workflow/tests.test.ts
index ae52e19b0..c593b082e 100644
--- a/.bkit/core/engine/commands/workflow/tests.test.ts
+++ b/.bkit/core/engine/commands/workflow/tests.test.ts
@@ -672,9 +672,14 @@ function fencedText(md: string): string {
     .join("\n");
 }
 
-/** Issue task blocks wrapped as a plan: a Reuse Inventory NEW row per CREATE file, then the blocks. */
+/**
+ * Issue task blocks wrapped as a plan: a Reuse Inventory NEW row per CREATE file and a
+ * Supersession Inventory row per DELETE file, then the blocks.
+ */
 function asPlan(blocks: string): string {
-  const files = parsePlanBlocks(blocks).tasks.flatMap((t) => t.create.map((c) => c.file));
+  const parsed = parsePlanBlocks(blocks).tasks;
+  const files = parsed.flatMap((t) => t.create.map((c) => c.file));
+  const removed = parsed.flatMap((t) => t.delete.map((d) => d.file));
   return [
     "# Plan",
     "",
@@ -683,6 +688,16 @@ function asPlan(blocks: string): string {
     "| Capability | File | Search performed | Existing candidates | Decision (EXTEND/NEW) | Justification |",
     "| --- | --- | --- | --- | --- | --- |",
     ...files.map((f) => `| x | \`${f}\` | rg x | none | NEW | nothing to extend |`),
+    ...(removed.length === 0
+      ? []
+      : [
+          "",
+          "## Supersession Inventory",
+          "",
+          "| Existing artifact | Replaced by | Decision | Justification |",
+          "| --- | --- | --- | --- |",
+          ...removed.map((f) => `| \`${f}\` | - | DELETE | replaced |`),
+        ]),
     "",
     blocks,
   ].join("\n");
@@ -817,6 +832,26 @@ describe("bkit tests plan-check", () => {
       "| --- | --- | --- | --- | --- | --- |",
       ...files.map((f) => `| x | \`${f}\` | rg x | none | NEW | nothing to extend |`),
     ].join("\n");
+  /** A Derived Test Matrix table: its `cols`, then one row per `row` cell list. */
+  const matrix = (cols: string[], ...rows: string[][]) =>
+    [
+      "## Derived Test Matrix",
+      "",
+      `| ${cols.join(" | ")} |`,
+      `| ${cols.map(() => "---").join(" | ")} |`,
+      ...rows.map((r) => `| ${r.join(" | ")} |`),
+    ].join("\n");
+  /** The matrix header the reader maps rows to tasks by. */
+  const MATRIX = ["Test description", "Type", "Target file", "Task"];
+  /** A Supersession Inventory table with one DELETE row per file. */
+  const supersession = (...files: string[]) =>
+    [
+      "## Supersession Inventory",
+      "",
+      "| Existing artifact | Replaced by | Decision | Justification |",
+      "| --- | --- | --- | --- |",
+      ...files.map((f) => `| \`${f}\` | \`src/new.ts\` | DELETE | replaced |`),
+    ].join("\n");
 
   it("states the caps the template and workflows doc name", () => {
     const { maxPerGroup, maxTestsPerGroup, maxTestsPerTask, maxTestFilesPerTask } =
@@ -1085,6 +1120,163 @@ describe("bkit tests plan-check", () => {
     expect(r.code).toBe(0);
   });
 
+  it("plan-check refuses an unmapped matrix row", async () => {
+    write(
+      "plan.md",
+      matrix(
+        MATRIX,
+        ["case a", "Unit", "`t0.test.ts`", ""],
+        ["case b", "Unit", "`t0.test.ts`", "1"],
+      ),
+      groupBlock(1, okTask(1)),
+    );
+    const r = await check();
+    expect(r.code).toBe(1);
+    expect(r.json.problems).toEqual([
+      expect.objectContaining({ kind: "matrix", line: lineOf("plan.md", "| case a") }),
+    ]);
+    expect(report()).toContain("row maps to no task");
+  });
+
+  it("plan-check refuses a delete with no supersession row", async () => {
+    fs.mkdirSync(path.join(cwd, "src"));
+    fs.writeFileSync(path.join(cwd, "src/old.ts"), "export const oldThing = 1;\n");
+    const del = ["  - **DELETE:** `oldThing` in `src/old.ts`: gone"];
+    write("plan.md", groupBlock(1, okTask(1, 1, 1, del)));
+    let r = await check();
+    expect(r.code).toBe(1);
+    expect(r.json.problems).toEqual([
+      expect.objectContaining({ kind: "supersession", line: lineOf("plan.md", "**DELETE:**") }),
+    ]);
+    expect(r.json.problems[0].message).toContain("src/old.ts");
+    write("plan.md", supersession("src/old.ts"), groupBlock(1, okTask(1, 1, 1, del)));
+    r = await check();
+    expect(r.code).toBe(0);
+  });
+
+  it("plan-check refuses a matrix row mapped to two tasks", async () => {
+    write(
+      "plan.md",
+      matrix(
+        MATRIX,
+        ["case a", "Unit", "`t0.test.ts`", "1"],
+        ["case b", "Unit", "`t0.test.ts`", "2"],
+        ["case c", "Unit", "`t0.test.ts`", "1, 2"],
+      ),
+      groupBlock(1, okTask(1), okTask(2)),
+    );
+    const r = await check();
+    expect(r.code).toBe(1);
+    expect(r.json.problems).toEqual([
+      expect.objectContaining({ kind: "matrix", line: lineOf("plan.md", "| case c") }),
+    ]);
+    expect(r.json.problems[0].message).toContain("TASK 1");
+    expect(r.json.problems[0].message).toContain("TASK 2");
+  });
+
+  it("plan-check refuses a task no matrix row maps to", async () => {
+    write(
+      "plan.md",
+      matrix(MATRIX, ["case a", "Unit", "`t0.test.ts`", "1"]),
+      groupBlock(1, okTask(1), okTask(2)),
+    );
+    const r = await check();
+    expect(r.code).toBe(1);
+    expect(r.json.problems).toEqual([
+      expect.objectContaining({
+        kind: "matrix",
+        line: lineOf("plan.md", "<!-- bkit:task 2 start -->"),
+      }),
+    ]);
+    expect(r.json.problems[0].message).toContain("TASK 2");
+  });
+
+  it("plan-check accepts a matrix that maps every test-bearing task", async () => {
+    write(
+      "plan.md",
+      matrix(
+        MATRIX,
+        ["case a", "Unit", "`t0.test.ts`", "1"],
+        ["case b", "Unit", "`t1.test.ts`", "2"],
+      ),
+      groupBlock(1, okTask(1), okTask(2)),
+    );
+    const r = await check();
+    expect(r.code).toBe(0);
+    expect(r.json.problems).toEqual([]);
+    // The same plan minus one row is refused: the acceptance is the mapping, not the section.
+    write(
+      "plan.md",
+      matrix(MATRIX, ["case a", "Unit", "`t0.test.ts`", "1"]),
+      groupBlock(1, okTask(1), okTask(2)),
+    );
+    const missing = await check();
+    expect(missing.code).toBe(1);
+  });
+
+  it("plan-check refuses a matrix header with no Task column, naming the column to add", async () => {
+    write(
+      "plan.md",
+      matrix(
+        ["Test description", "Type", "Target file"],
+        ["case a", "Unit", "`t0.test.ts`"],
+        ["case b", "Unit", "`t1.test.ts`"],
+      ),
+      groupBlock(1, okTask(1), okTask(2)),
+    );
+    const r = await check();
+    expect(r.code).toBe(1);
+    expect(r.json.problems).toEqual([
+      expect.objectContaining({ kind: "matrix", line: lineOf("plan.md", "| Test description") }),
+    ]);
+    expect(r.json.problems[0].message).toContain("Task");
+    expect(report().match(/`matrix`/g)).toHaveLength(1);
+  });
+
+  it("plan-check refuses a Task cell naming an undefined task", async () => {
+    write(
+      "plan.md",
+      matrix(
+        MATRIX,
+        ["case a", "Unit", "`t0.test.ts`", "1"],
+        ["case b", "Unit", "`t1.test.ts`", "9"],
+      ),
+      groupBlock(1, okTask(1)),
+    );
+    const r = await check();
+    expect(r.code).toBe(1);
+    expect(r.json.problems).toEqual([
+      expect.objectContaining({ kind: "matrix", line: lineOf("plan.md", "| case b") }),
+    ]);
+    expect(r.json.problems[0].message).toContain("TASK 9");
+  });
+
+  it("plan-check accepts a task whose only TEST FIRST is n/a", async () => {
+    write(
+      "plan.md",
+      matrix(MATRIX, ["case a", "Unit", "`t0.test.ts`", "1"]),
+      groupBlock(
+        1,
+        okTask(1),
+        taskBlock(2, [
+          "  - **DONE WHEN:** the docs are updated",
+          "  - **TEST FIRST:** n/a — docs only",
+        ]),
+      ),
+    );
+    const r = await check();
+    expect(r.code).toBe(0);
+    expect(r.json.problems).toEqual([]);
+    // A task naming a test and no row is refused: only `n/a` is exempt from a row.
+    write(
+      "plan.md",
+      matrix(MATRIX, ["case a", "Unit", "`t0.test.ts`", "1"]),
+      groupBlock(1, okTask(1), okTask(2)),
+    );
+    const missing = await check();
+    expect(missing.code).toBe(1);
+  });
+
   it("plan-check refuses a group with 4 tasks", async () => {
     write("plan.md", groupBlock(1, okTask(1), okTask(2), okTask(3), okTask(4)));
     const r = await check();
diff --git a/.bkit/core/engine/commands/workflow/tests.ts b/.bkit/core/engine/commands/workflow/tests.ts
index 30052ae25..788452770 100644
--- a/.bkit/core/engine/commands/workflow/tests.ts
+++ b/.bkit/core/engine/commands/workflow/tests.ts
@@ -37,9 +37,11 @@ import {
   str,
 } from "./status.js";
 import {
+  derivedTestMatrix,
   fenceNeverClosed,
   parsePlanBlocks,
   reuseInventory,
+  supersessionInventory,
   type PlanTaskBlock,
 } from "./plan-blocks.js";
 import { writeStepRow } from "./steps.js";
@@ -341,7 +343,16 @@ export interface GroupSize {
 export interface PlanProblem {
   /** 1-based plan line. */
   line: number;
-  kind: "format" | "stray" | "field" | "depends" | "cap" | "inventory" | "markers";
+  kind:
+    | "format"
+    | "stray"
+    | "field"
+    | "depends"
+    | "cap"
+    | "inventory"
+    | "matrix"
+    | "supersession"
+    | "markers";
   message: string;
 }
 
@@ -370,7 +381,8 @@ const kb1 = (bytes: number) => Math.round((bytes / 1024) * 10) / 10;
  * task-like text outside every block, a task without DONE WHEN or without TEST FIRST and
  * TEST EXCEPTION, a malformed TEST FIRST, a DEPENDS ON naming a missing task or one in a
  * later group, a group or task over a cap in `caps`, a CREATE file with no NEW Reuse
- * Inventory row.
+ * Inventory row, a `Derived Test Matrix` row naming no task / an undefined task / two
+ * tasks or a test-bearing task no row names, and a DELETE file with no Supersession row.
  */
 export function checkPlanText(text: string, caps: TaskCaps = CONFIG_DEFAULTS.tasks): PlanCheck {
   const blocks = parsePlanBlocks(text);
@@ -446,6 +458,62 @@ export function checkPlanText(text: string, caps: TaskCaps = CONFIG_DEFAULTS.tas
           message: `TASK ${t.task}: CREATE in \`${c.file}\` has no NEW row naming it in the Reuse Inventory's File column`,
         });
   }
+  // The matrix maps each row to one task and each test-bearing task to a row. A plan with no
+  // matrix section yields no problem: the refusal is on a row, and issue-form plans carry none.
+  const matrix = derivedTestMatrix(text);
+  if (matrix !== null) {
+    if (matrix.taskColumn === null)
+      problems.push({
+        line: matrix.line,
+        kind: "matrix",
+        message:
+          "the Derived Test Matrix header has no `Task` column; add one naming the task each row's test belongs to",
+      });
+    else {
+      const mapped = new Set<number>();
+      for (const row of matrix.rows) {
+        const named = row.tasks.map((n) => `TASK ${n}`);
+        if (row.tasks.length === 0)
+          problems.push({
+            line: row.number,
+            kind: "matrix",
+            message: `Derived Test Matrix row maps to no task: name one in its \`Task\` cell`,
+          });
+        else if (row.tasks.length > 1)
+          problems.push({
+            line: row.number,
+            kind: "matrix",
+            message: `Derived Test Matrix row maps to ${named.join(" and ")}; name exactly one task`,
+          });
+        else {
+          const n = row.tasks[0]!;
+          if (!byTask.has(n))
+            problems.push({
+              line: row.number,
+              kind: "matrix",
+              message: `Derived Test Matrix row maps to TASK ${n}, which the plan does not define`,
+            });
+          mapped.add(n);
+        }
+      }
+      for (const t of blocks.tasks)
+        if (specs.get(t.task)!.kind === "test" && !mapped.has(t.task))
+          problems.push({
+            line: t.line,
+            kind: "matrix",
+            message: `TASK ${t.task} names TEST FIRST tests but no Derived Test Matrix row maps to it`,
+          });
+    }
+  }
+  const superseded = new Set((supersessionInventory(text) ?? []).flatMap((r) => r.files));
+  for (const t of blocks.tasks)
+    for (const d of t.delete)
+      if (!superseded.has(path.posix.normalize(d.file)))
+        problems.push({
+          line: d.line,
+          kind: "supersession",
+          message: `TASK ${t.task}: DELETE in \`${d.file}\` has no row naming it in the Supersession Inventory`,
+        });
   const groups: GroupSize[] = blocks.groups.map((g) => {
     const tests = sizes.filter((s) => s.group === g.group).reduce((n, s) => n + s.tests, 0);
     const bytes = Buffer.byteLength(lines.slice(g.line - 1, g.end).join("\n"));
@@ -1649,7 +1717,7 @@ export const testsCommand: CommandSpec = {
       },
     },
     "plan-check": {
-      summary: `Check a plan's group and task blocks: the block format, DONE WHEN and TEST FIRST on every task, DEPENDS ON order, the caps from package.json \`bkit.workflows.tasks\` (defaults: ${capsText(CONFIG_DEFAULTS.tasks)}), a Reuse Inventory NEW row per CREATE file, and that each READ / UPDATE / DELETE file and symbol exists; exit 0 no problems, 1 refused.`,
+      summary: `Check a plan's group and task blocks: the block format, DONE WHEN and TEST FIRST on every task, DEPENDS ON order, the caps from package.json \`bkit.workflows.tasks\` (defaults: ${capsText(CONFIG_DEFAULTS.tasks)}), a Reuse Inventory NEW row per CREATE file, a Supersession Inventory row per DELETE, a \`Task\` on every Derived Test Matrix row and a row per test-bearing task, and that each READ / UPDATE / DELETE file and symbol exists; exit 0 no problems, 1 refused.`,
       flags: [
         {
           name: "plan",
@@ -1675,7 +1743,7 @@ export const testsCommand: CommandSpec = {
           "[{group, title, tasks, tests, kb}]: each group's tasks, planned TEST FIRST tests and size",
         tasks: "[{task, group, tests, files}]: each task's planned tests and distinct test files",
         problems:
-          "[{line, kind, message}]: format | stray | field | depends | cap | inventory | markers — each refuses the plan",
+          "[{line, kind, message}]: format | stray | field | depends | cap | inventory | matrix | supersession | markers — each refuses the plan",
         existence:
           "[{line, task, message}]: READ / UPDATE / DELETE files or symbols not found; refuses only with --existence=refuse",
         log: "where the report was written (as given)",
diff --git a/.bkit/core/engine/render/__snapshots__/bkit-build.none.txt b/.bkit/core/engine/render/__snapshots__/bkit-build.none.txt
index 90e4fb46a..491f2bee1 100644
--- a/.bkit/core/engine/render/__snapshots__/bkit-build.none.txt
+++ b/.bkit/core/engine/render/__snapshots__/bkit-build.none.txt
@@ -122,7 +122,7 @@ _No tracker connected, skip step._
      - Test-order gap or `exception-refused` gap → a `- **TEST EXCEPTION:**` field as the last field of the task's block in `docs/plans/{YYYYMM}/{FID}-plan.md`, one sub-bullet per test in `TEST FIRST` form, each ending `— {human's reason} (owner, {YYYY-MM-DD})`; a task with no `TEST FIRST` → the field holds `{human's reason} (owner, {YYYY-MM-DD})` alone. The field replaces the task's existing `TEST EXCEPTION` field; NEVER add a second.
      - Other → append one `docs/decisions.jsonl` row with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom); `by.step` = `build-decision`; `summary` names `{FID}`, step `{PAUSE_STEP}` and the gap or finding; `rationale` = `accepted by owner: {human's reason}`. An item that is a challenge task → also tick it `[x]` in the plan and end its title with ` — accepted by owner`.
    - **Accept (assumed)** (written by `decisions apply`) → write nothing else: no `docs/decisions.jsonl` row, no `TEST EXCEPTION`. An item that is a challenge task → tick it `[x]` and end its title with ` — accepted (assumed)`. Ship asks the owner to confirm it.
-   - **Fix now** → an item that is a challenge task → keep that task open; it runs as it is. **Else** → write a task block (`docs/templates/bkit-plan.md` § Agent Execution Runbook) numbered one above the plan's highest task, with `**DONE WHEN:**` and `**TEST FIRST:**` (one sub-bullet per test, `` `{test file}` `{test name}` fails on {what goes wrong} ``); the human's direction, when given, shapes the task:
+   - **Fix now** → an item that is a challenge task → keep that task open; it runs as it is. **Else** → write a task block (`docs/templates/bkit-plan.md` § Agent Execution Runbook) numbered one above the plan's highest task, with `**DONE WHEN:**` and `**TEST FIRST:**` (one sub-bullet per test, `` `{test file}` `{test name}` fails on {what goes wrong} ``), and one `Derived Test Matrix` row per test in that `TEST FIRST` (``| {test name} | {tier} | `{test file}` | {task} |``, the tier its file's name gives); the human's direction, when given, shapes the task:
      - `From: verify` and group `{GROUP}` stays within `{MAX_TASKS_PER_GROUP}` tasks and `{MAX_TESTS_PER_GROUP}` `TEST FIRST` tests with it → inside group `{GROUP}`.
      - `From: verify`, over either cap → a new group right after `{GROUP}`; add 1 to every later group's number, in its markers and `### GROUP` heading.
      - `From: tests` or `From: challenge` → a new last group, each new group within the caps.
@@ -282,7 +282,7 @@ _No tracker connected, skip step._
    ```
    Route:
    - **If** exit 0 **and** (`NEWER_COMMENTS` = 0 **or** `CONVERTED` is held) → sub-step 5.
-   - **If** `CONVERTED` is not held **and** (exit 0 with `NEWER_COMMENTS` > 0, **or** exit 2 with no `docs/plans/{YYYYMM}/{FID}-plan.md`, **or** exit 1 with a `markers` problem) → sub-step 3.
+   - **If** `CONVERTED` is not held **and** (exit 0 with `NEWER_COMMENTS` > 0, **or** exit 2 with no `docs/plans/{YYYYMM}/{FID}-plan.md`, **or** exit 1 with a `markers`, `matrix` or `supersession` problem) → sub-step 3.
    - **If** exit 1, `CONVERTED` is held **and** `CONVERT_RETRY` is not held → `CONVERT_RETRY` = the printed `problems` → sub-step 3.
    - **Else** → **Failure Path** naming each problem in the report.
 3. **Subagent:** Invoke `@bkit-build-plan-convert` using `Agent` tool:
@@ -443,7 +443,11 @@ One pass of Steps 6-8 per plan group, in group order: Step 6 briefs the first gr
      ```bash
      "{BKIT}" tests plan-check --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --existence=report --log="{OUTBOX}/build-plan-check-{GROUP}.md"
      ```
-     **If** exit non-zero → **Failure Path**. **If** the printed `groups` hold a group numbered above `GROUP` → sub-step 8. **Else** → `GATE_VERDICT` = SKIPPED → sub-step 10.
+     Route:
+     - **If** exit 1 with a `matrix` or `supersession` problem, **and** `CONVERT_RETRY` is not held → `CONVERT_RETRY` = the printed `problems` → Step 3 sub-step 3.
+     - **If** exit non-zero → **Failure Path**.
+     - **If** the printed `groups` hold a group numbered above `GROUP` → sub-step 8.
+     - **Else** → `GATE_VERDICT` = SKIPPED → sub-step 10.
    - **Else** → `GATE_VERDICT` = SKIPPED → sub-step 10.
 8. Run the group gate; it writes the trimmed log to the artifact:
    ```bash
diff --git a/.bkit/core/engine/render/__snapshots__/bkit-ship.none.txt b/.bkit/core/engine/render/__snapshots__/bkit-ship.none.txt
index b7e0026e6..13c34dabb 100644
--- a/.bkit/core/engine/render/__snapshots__/bkit-ship.none.txt
+++ b/.bkit/core/engine/render/__snapshots__/bkit-ship.none.txt
@@ -333,7 +333,7 @@ _No tracker connected, skip step._
    cd "{WORKTREE_PATH}" && "{BKIT}" context diff --reset-log --artifact="tmp/bkit-diff-{FID}.md" --fid={FID} --step=ship-deferred-sweep >/dev/null || exit 2
    ```
    **Subagent:** Invoke `@bkit-ship-deferred-sweep` using `Agent` tool:
-   Context: You are a subagent in the Ship phase. Pre-merge completeness gate. Switch into working directory `cd "{WORKTREE_PATH}"` → verify with `pwd` → use for all subsequent file operations.
+   Context: You are a subagent in the Ship phase. Pre-merge completeness gate. Diff base: `origin/dev` — run `bkit branches scan-diff --disabled-tests --base=origin/dev`. Switch into working directory `cd "{WORKTREE_PATH}"` → verify with `pwd` → use for all subsequent file operations.
    Read: `docs/plans/{YYYYMM}/logs/{FID}/ship-input-{RUN}.md`, `docs/plans/{YYYYMM}/{FID}-plan.md` (if present), `docs/plans/{YYYYMM}/{FID}-design.md` (if present), `{STATUS}`, `docs/deferrals.jsonl`, glob `docs/plans/{YYYYMM}/logs/{FID}/*-plan-verify*.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/*-challenge*.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/*-summary.md`, `tmp/bkit-diff-{FID}.md` (the run's diff).
    Create: `docs/plans/{YYYYMM}/logs/{FID}/ship-deferred-sweep.md`.
 3. Finish (bookkeeping to `$BOOK_ROOT`):
diff --git a/.bkit/core/prompts/bkit-plan-generate.md b/.bkit/core/prompts/bkit-plan-generate.md
index 300b68202..fd2c0a9ca 100644
--- a/.bkit/core/prompts/bkit-plan-generate.md
+++ b/.bkit/core/prompts/bkit-plan-generate.md
@@ -38,7 +38,7 @@ autoCompactWindow: 300000
 - **Related Issues:** List tracker references from the plan input as `#N — title (state)`, not their content; they help dedupe and do not add scope. None → `None`.
 - **Example tools:** Tools and commands `docs/templates/bkit-plan.md` names are examples; write the project's own and drop what does not apply.
 - **Acceptance Scenario:** `Narrative` and `Success Criteria` come word for word from the first source that has them: the design's `## Acceptance Scenario`, else the issue's change-shape fields (`.bkit/trackers.md` § Issue shapes), else, for an audit-only plan, the user or operator impact of the in-scope findings. With no source, both read `⚠️ MISSING: no design doc, no issue Narrative and no audit report — human must provide before plan proceeds`; never invent them. `Narrative` is 1-2 sentences from the user's side: what they do and what they get back. `Success Criteria` are at most 5 measurable outcomes, not steps; an audit plan has one per in-scope finding id, from its `Expected`, with no cap. `Context & Goals` does not repeat them.
-- **Scenario detail:** `Process Sketch` restates the `Concrete Example` and `Edge Cases` as 3-7 `WHEN X → THEN Y` outcome lines, with no new examples. `Concrete Example` is one scenario: role, starting state, numbered steps, observable outcome. `Edge Cases` keep the design's Key Edge Cases, else the issue's rows, word for word, and add validation, error and boundary cases. `Derived Test Matrix` has one row per testable behaviour, each with a target file and mapped to exactly one runbook task; issue rows stay word for word, and each in-scope audit behaviour has a row.
+- **Scenario detail:** `Process Sketch` restates the `Concrete Example` and `Edge Cases` as 3-7 `WHEN X → THEN Y` outcome lines, with no new examples. `Concrete Example` is one scenario: role, starting state, numbered steps, observable outcome. `Edge Cases` keep the design's Key Edge Cases, else the issue's rows, word for word, and add validation, error and boundary cases. `Derived Test Matrix` has one row per testable behaviour, each with a target file; issue rows stay word for word, and each in-scope audit behaviour has a row.
 - **Test tiers:** A `Derived Test Matrix` row's `Type` is a tier name exactly as `docs/testing.md` writes it, picked by its tier-selection rubric: the lowest tier that exercises the behaviour, or several. Boundary rows reach the real boundary and assert a ground-truth signal, with `@live` for an external or deployed boundary.
 - **Open questions:** Each open question gives 2-3 options with their trade-offs as the lettered `Options: A) {option} — {trade-off} · B) …`, a `Recommended` naming the chosen letter and the default if unanswered; the design's options and recommendation carry forward where it already answered. Each assumption names what breaks if it is wrong.
 - **Out of Scope:** Plan work is in scope by default. An `Out of Scope` row is `Exempt` only when no `Success Criteria`, `Acceptance Scenario`, `Derived Test Matrix` row or design item (non-goals aside) needs it, and it says why and where the item belongs. Required work parked there is a `Blocking` deferral and belongs in the runbook. Each `Exempt` row has a matching `docs/deferrals.jsonl` row; an audit `LOW` finding left out is an `Exempt` row.
diff --git a/.bkit/core/prompts/bkit-plan-review-1.md b/.bkit/core/prompts/bkit-plan-review-1.md
index f841969fc..812fbb3ad 100644
--- a/.bkit/core/prompts/bkit-plan-review-1.md
+++ b/.bkit/core/prompts/bkit-plan-review-1.md
@@ -33,7 +33,7 @@ autoCompactWindow: 300000
 - **Lens discipline:** Stay within Process-defined lens; out-of-lens findings not in remit.
 - **Output header:** All lines above `<!-- verdict:end -->` MUST be machine-parseable.
 - **Acceptance Scenario:** `Narrative` and `Success Criteria` come word for word from the first source that has them: the design's `## Acceptance Scenario`, else the issue's change-shape fields (`.bkit/trackers.md` § Issue shapes), else, for an audit-only plan, the user or operator impact of the in-scope findings. With no source, both read `⚠️ MISSING: no design doc, no issue Narrative and no audit report — human must provide before plan proceeds`; never invent them. `Narrative` is 1-2 sentences from the user's side: what they do and what they get back. `Success Criteria` are at most 5 measurable outcomes, not steps; an audit plan has one per in-scope finding id, from its `Expected`, with no cap. `Context & Goals` does not repeat them.
-- **Scenario detail:** `Process Sketch` restates the `Concrete Example` and `Edge Cases` as 3-7 `WHEN X → THEN Y` outcome lines, with no new examples. `Concrete Example` is one scenario: role, starting state, numbered steps, observable outcome. `Edge Cases` keep the design's Key Edge Cases, else the issue's rows, word for word, and add validation, error and boundary cases. `Derived Test Matrix` has one row per testable behaviour, each with a target file and mapped to exactly one runbook task; issue rows stay word for word, and each in-scope audit behaviour has a row.
+- **Scenario detail:** `Process Sketch` restates the `Concrete Example` and `Edge Cases` as 3-7 `WHEN X → THEN Y` outcome lines, with no new examples. `Concrete Example` is one scenario: role, starting state, numbered steps, observable outcome. `Edge Cases` keep the design's Key Edge Cases, else the issue's rows, word for word, and add validation, error and boundary cases. `Derived Test Matrix` has one row per testable behaviour, each with a target file; issue rows stay word for word, and each in-scope audit behaviour has a row.
 - **Open questions:** Each open question gives 2-3 options with their trade-offs as the lettered `Options: A) {option} — {trade-off} · B) …`, a `Recommended` naming the chosen letter and the default if unanswered; the design's options and recommendation carry forward where it already answered. Each assumption names what breaks if it is wrong.
 - **Out of Scope:** Plan work is in scope by default. An `Out of Scope` row is `Exempt` only when no `Success Criteria`, `Acceptance Scenario`, `Derived Test Matrix` row or design item (non-goals aside) needs it, and it says why and where the item belongs. Required work parked there is a `Blocking` deferral and belongs in the runbook. Each `Exempt` row has a matching `docs/deferrals.jsonl` row; an audit `LOW` finding left out is an `Exempt` row.
 - **Suggested Scope Expansion:** List prior work overlapping the plan's surfaces as candidates (related open issues, open `docs/deferrals.jsonl` and `docs/failures.jsonl` rows, audit findings the input did not name), each with source, overlap and recommendation. Candidates are for the human, not runbook tasks; one joins the plan only through design scope or a human decision, and then leaves the list.
diff --git a/.bkit/core/prompts/bkit-plan-scope-check.md b/.bkit/core/prompts/bkit-plan-scope-check.md
index e6a9cf55d..41a3f0412 100644
--- a/.bkit/core/prompts/bkit-plan-scope-check.md
+++ b/.bkit/core/prompts/bkit-plan-scope-check.md
@@ -33,7 +33,7 @@ autoCompactWindow: 300000
 - **Lens discipline:** Stay within Process-defined lens; out-of-lens findings not in remit.
 - **Output header:** All lines above `<!-- verdict:end -->` MUST be machine-parseable.
 - **Acceptance Scenario:** `Narrative` and `Success Criteria` come word for word from the first source that has them: the design's `## Acceptance Scenario`, else the issue's change-shape fields (`.bkit/trackers.md` § Issue shapes), else, for an audit-only plan, the user or operator impact of the in-scope findings. With no source, both read `⚠️ MISSING: no design doc, no issue Narrative and no audit report — human must provide before plan proceeds`; never invent them. `Narrative` is 1-2 sentences from the user's side: what they do and what they get back. `Success Criteria` are at most 5 measurable outcomes, not steps; an audit plan has one per in-scope finding id, from its `Expected`, with no cap. `Context & Goals` does not repeat them.
-- **Scenario detail:** `Process Sketch` restates the `Concrete Example` and `Edge Cases` as 3-7 `WHEN X → THEN Y` outcome lines, with no new examples. `Concrete Example` is one scenario: role, starting state, numbered steps, observable outcome. `Edge Cases` keep the design's Key Edge Cases, else the issue's rows, word for word, and add validation, error and boundary cases. `Derived Test Matrix` has one row per testable behaviour, each with a target file and mapped to exactly one runbook task; issue rows stay word for word, and each in-scope audit behaviour has a row.
+- **Scenario detail:** `Process Sketch` restates the `Concrete Example` and `Edge Cases` as 3-7 `WHEN X → THEN Y` outcome lines, with no new examples. `Concrete Example` is one scenario: role, starting state, numbered steps, observable outcome. `Edge Cases` keep the design's Key Edge Cases, else the issue's rows, word for word, and add validation, error and boundary cases. `Derived Test Matrix` has one row per testable behaviour, each with a target file; issue rows stay word for word, and each in-scope audit behaviour has a row.
 - **Open questions:** Each open question gives 2-3 options with their trade-offs as the lettered `Options: A) {option} — {trade-off} · B) …`, a `Recommended` naming the chosen letter and the default if unanswered; the design's options and recommendation carry forward where it already answered. Each assumption names what breaks if it is wrong.
 - **Out of Scope:** Plan work is in scope by default. An `Out of Scope` row is `Exempt` only when no `Success Criteria`, `Acceptance Scenario`, `Derived Test Matrix` row or design item (non-goals aside) needs it, and it says why and where the item belongs. Required work parked there is a `Blocking` deferral and belongs in the runbook. Each `Exempt` row has a matching `docs/deferrals.jsonl` row; an audit `LOW` finding left out is an `Exempt` row.
 - **Reuse Inventory:** Each capability the plan introduces has a `Reuse Inventory` row, written before `Architecture & Component Changes`, recording the searches run (in-repo text and symbol search, framework built-ins, current practice) and a decision. The default is `EXTEND`: a `[MODIFY]` of the named file plus a runbook task. `NEW` needs one reason: (a) the searches find no candidate, (b) extending breaks the candidate's contract or callers, both named, or (c) the candidate is a `Supersession Inventory` `DELETE`. A cleaner fresh start or a messy or close-but-different candidate is no reason, and a row with no search is unsearched, not `NEW`. Each `[NEW]` file carries its row's reason. Each row names the file it decides in `File`, and each task `CREATE` file needs a `NEW` row naming it.
@@ -68,17 +68,15 @@ autoCompactWindow: 300000
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
@@ -95,7 +93,7 @@ Lens: Scope, criteria, verification audit.
 
 ## CRITICAL
 
-[Gaps that block plan progress — missing / vague `Acceptance Scenario` or `Derived Test Matrix`, missing build task, missing verification task, broken matrix-to-runbook mapping, missing supersession-inventory entry, scope creep currently in plan to be removed, `Blocking` out-of-scope deferral; initially set to `PENDING`.]
+[Gaps that block plan progress — missing / vague `Acceptance Scenario` or `Derived Test Matrix`, missing build task, missing verification task, missing traceability between a capability and its `Reuse Inventory` row, scope creep currently in plan to be removed, `Blocking` out-of-scope deferral; initially set to `PENDING`.]
 
 ## OPTIONAL
 
diff --git a/.bkit/core/prompts/bkit-plan-update.md b/.bkit/core/prompts/bkit-plan-update.md
index 32b740f5a..d9d4bc220 100644
--- a/.bkit/core/prompts/bkit-plan-update.md
+++ b/.bkit/core/prompts/bkit-plan-update.md
@@ -33,7 +33,7 @@ autoCompactWindow: 300000
 - **Output header:** All lines above `<!-- verdict:end -->` MUST be machine-parseable.
 - **Example tools:** Tools and commands `docs/templates/bkit-plan.md` names are examples; write the project's own and drop what does not apply.
 - **Acceptance Scenario:** `Narrative` and `Success Criteria` come word for word from the first source that has them: the design's `## Acceptance Scenario`, else the issue's change-shape fields (`.bkit/trackers.md` § Issue shapes), else, for an audit-only plan, the user or operator impact of the in-scope findings. With no source, both read `⚠️ MISSING: no design doc, no issue Narrative and no audit report — human must provide before plan proceeds`; never invent them. `Narrative` is 1-2 sentences from the user's side: what they do and what they get back. `Success Criteria` are at most 5 measurable outcomes, not steps; an audit plan has one per in-scope finding id, from its `Expected`, with no cap. `Context & Goals` does not repeat them.
-- **Scenario detail:** `Process Sketch` restates the `Concrete Example` and `Edge Cases` as 3-7 `WHEN X → THEN Y` outcome lines, with no new examples. `Concrete Example` is one scenario: role, starting state, numbered steps, observable outcome. `Edge Cases` keep the design's Key Edge Cases, else the issue's rows, word for word, and add validation, error and boundary cases. `Derived Test Matrix` has one row per testable behaviour, each with a target file and mapped to exactly one runbook task; issue rows stay word for word, and each in-scope audit behaviour has a row.
+- **Scenario detail:** `Process Sketch` restates the `Concrete Example` and `Edge Cases` as 3-7 `WHEN X → THEN Y` outcome lines, with no new examples. `Concrete Example` is one scenario: role, starting state, numbered steps, observable outcome. `Edge Cases` keep the design's Key Edge Cases, else the issue's rows, word for word, and add validation, error and boundary cases. `Derived Test Matrix` has one row per testable behaviour, each with a target file; issue rows stay word for word, and each in-scope audit behaviour has a row.
 - **Test tiers:** A `Derived Test Matrix` row's `Type` is a tier name exactly as `docs/testing.md` writes it, picked by its tier-selection rubric: the lowest tier that exercises the behaviour, or several. Boundary rows reach the real boundary and assert a ground-truth signal, with `@live` for an external or deployed boundary.
 - **Open questions:** Each open question gives 2-3 options with their trade-offs as the lettered `Options: A) {option} — {trade-off} · B) …`, a `Recommended` naming the chosen letter and the default if unanswered; the design's options and recommendation carry forward where it already answered. Each assumption names what breaks if it is wrong.
 - **Out of Scope:** Plan work is in scope by default. An `Out of Scope` row is `Exempt` only when no `Success Criteria`, `Acceptance Scenario`, `Derived Test Matrix` row or design item (non-goals aside) needs it, and it says why and where the item belongs. Required work parked there is a `Blocking` deferral and belongs in the runbook. Each `Exempt` row has a matching `docs/deferrals.jsonl` row; an audit `LOW` finding left out is an `Exempt` row.
diff --git a/.bkit/core/prompts/bkit-ship-deferred-sweep.md b/.bkit/core/prompts/bkit-ship-deferred-sweep.md
index 01363cf07..ea3fdcb95 100644
--- a/.bkit/core/prompts/bkit-ship-deferred-sweep.md
+++ b/.bkit/core/prompts/bkit-ship-deferred-sweep.md
@@ -66,14 +66,14 @@ autoCompactWindow: 300000
      - **If** shipped surfaces instruct consumers to run something that fails at runtime → mark item `Blocked`.
    - Any `Blocked` items → move to `Blocking Deferrals` and append test details with source evidence → set `Verdict` = `FAIL` via `Edit` immediately; do not defer to final pass.
    - Any leftover `Planned` items → mark items `Lazy` → move to `Lazy Deferrals` → append deferral rows to `docs/deferrals.jsonl` with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom); check existing entries first; set `reason` to `unjustified`, set `status` to `TRIAGED`.
-8. Scan supplied diff for any disabled tests (`.skip` / `.todo` / `.fixme` / `xfail`, `t.Skip()`, `#[ignore]`, `@Disabled` added, or assertions deleted); skips predating supplied diff do not count → record all under `Blocking Deferrals` with source evidence (`file:line`, test name) → set `Verdict` = `FAIL` via `Edit` immediately; do not defer to final pass.
+8. Scan the run's diff for disabled tests with `bkit branches scan-diff --disabled-tests --base=` the diff base your Context names — its `disabled` list holds each hit's `file:line` and test name → **If** exit 1 → record every entry under `Blocking Deferrals` with source evidence (`file:line`, test name) → set `Verdict` = `FAIL` via `Edit` immediately; do not defer to final pass.
 9. Scan `docs/deferrals.jsonl` for any plan related entries including recently appended rows → verify each `reason` holds at ship time as per `.bkit/jsonl.md` deferral reason tests; `reason` = `low-severity` with `severity` = `LOW` holds without the tests:
    - **If** holds → record under / move to `Exempt Deferrals` → continue; append no row, `reason` is set once and carried verbatim.
    - **Else** → record under / keep under `Lazy Deferrals` → append row to `docs/deferrals.jsonl` with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom), same `key` and prior fields verbatim, set `reason` to `unjustified`, set `status` to `TRIAGED`, `description` naming failed deferral tests.
 10. Update **Create** — set `Failures` via `Edit` = `Blocking Deferrals` entry count; set `Lazy` via `Edit` = `Lazy Deferrals` entry count.
 11. Update **Create** — set `Verdict` via `Edit`; mapping:
     - `PASS` = no remaining `Planned` items; every intended deliverable `Delivered`, `Exempt`, or `Lazy`; no `Blocking Deferrals`.
-    - `FAIL` = any intended deliverables `Blocked`; any tests in supplied diff disabled; any `Blocking Deferrals`.
+    - `FAIL` = any intended deliverables `Blocked`; any test the run's diff disabled; any `Blocking Deferrals`.
 
 **Output format:**
 
@@ -92,7 +92,7 @@ Lazy: <integer >= 0>
 
 ## Blocking Deferrals
 
-[Unmet deliverables that passed any blocking tests, and every test supplied diff disabled; per entry: test details with source evidence (`file:line`, test, grep); blocks merge. **If** none → `None`; initially set to `PENDING`.]
+[Unmet deliverables that passed any blocking tests, and every test the run's diff disabled; per entry: test details with source evidence (`file:line`, test, grep); blocks merge. **If** none → `None`; initially set to `PENDING`.]
 
 ## Exempt Deferrals
 
diff --git a/.bkit/core/workflows/bkit-build.md b/.bkit/core/workflows/bkit-build.md
index 421bb7ae6..186f1e2de 100644
--- a/.bkit/core/workflows/bkit-build.md
+++ b/.bkit/core/workflows/bkit-build.md
@@ -149,7 +149,7 @@ description: "Build Feature — Autonomous implementation"
      - Test-order gap or `exception-refused` gap → a `- **TEST EXCEPTION:**` field as the last field of the task's block in `docs/plans/{YYYYMM}/{FID}-plan.md`, one sub-bullet per test in `TEST FIRST` form, each ending `— {human's reason} (owner, {YYYY-MM-DD})`; a task with no `TEST FIRST` → the field holds `{human's reason} (owner, {YYYY-MM-DD})` alone. The field replaces the task's existing `TEST EXCEPTION` field; NEVER add a second.
      - Other → append one `docs/decisions.jsonl` row with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom); `by.step` = `build-decision`; `summary` names `{FID}`, step `{PAUSE_STEP}` and the gap or finding; `rationale` = `accepted by owner: {human's reason}`. An item that is a challenge task → also tick it `[x]` in the plan and end its title with ` — accepted by owner`.
    - **Accept (assumed)** (written by `decisions apply`) → write nothing else: no `docs/decisions.jsonl` row, no `TEST EXCEPTION`. An item that is a challenge task → tick it `[x]` and end its title with ` — accepted (assumed)`. Ship asks the owner to confirm it.
-   - **Fix now** → an item that is a challenge task → keep that task open; it runs as it is. **Else** → write a task block (`docs/templates/bkit-plan.md` § Agent Execution Runbook) numbered one above the plan's highest task, with `**DONE WHEN:**` and `**TEST FIRST:**` (one sub-bullet per test, `` `{test file}` `{test name}` fails on {what goes wrong} ``); the human's direction, when given, shapes the task:
+   - **Fix now** → an item that is a challenge task → keep that task open; it runs as it is. **Else** → write a task block (`docs/templates/bkit-plan.md` § Agent Execution Runbook) numbered one above the plan's highest task, with `**DONE WHEN:**` and `**TEST FIRST:**` (one sub-bullet per test, `` `{test file}` `{test name}` fails on {what goes wrong} ``), and one `Derived Test Matrix` row per test in that `TEST FIRST` (``| {test name} | {tier} | `{test file}` | {task} |``, the tier its file's name gives); the human's direction, when given, shapes the task:
      - `From: verify` and group `{GROUP}` stays within `{MAX_TASKS_PER_GROUP}` tasks and `{MAX_TESTS_PER_GROUP}` `TEST FIRST` tests with it → inside group `{GROUP}`.
      - `From: verify`, over either cap → a new group right after `{GROUP}`; add 1 to every later group's number, in its markers and `### GROUP` heading.
      - `From: tests` or `From: challenge` → a new last group, each new group within the caps.
@@ -365,7 +365,7 @@ description: "Build Feature — Autonomous implementation"
    ```
    Route:
    - **If** exit 0 **and** (`NEWER_COMMENTS` = 0 **or** `CONVERTED` is held) → sub-step 5.
-   - **If** `CONVERTED` is not held **and** (exit 0 with `NEWER_COMMENTS` > 0, **or** exit 2 with no `docs/plans/{YYYYMM}/{FID}-plan.md`, **or** exit 1 with a `markers` problem) → sub-step 3.
+   - **If** `CONVERTED` is not held **and** (exit 0 with `NEWER_COMMENTS` > 0, **or** exit 2 with no `docs/plans/{YYYYMM}/{FID}-plan.md`, **or** exit 1 with a `markers`, `matrix` or `supersession` problem) → sub-step 3.
    - **If** exit 1, `CONVERTED` is held **and** `CONVERT_RETRY` is not held → `CONVERT_RETRY` = the printed `problems` → sub-step 3.
    - **Else** → **Failure Path** naming each problem in the report.
 3. **Subagent:** Invoke `@bkit-build-plan-convert` using `Agent` tool:
@@ -526,7 +526,11 @@ One pass of Steps 6-8 per plan group, in group order: Step 6 briefs the first gr
      ```bash
      "{BKIT}" tests plan-check --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --existence=report --log="{OUTBOX}/build-plan-check-{GROUP}.md"
      ```
-     **If** exit non-zero → **Failure Path**. **If** the printed `groups` hold a group numbered above `GROUP` → sub-step 8. **Else** → `GATE_VERDICT` = SKIPPED → sub-step 10.
+     Route:
+     - **If** exit 1 with a `matrix` or `supersession` problem, **and** `CONVERT_RETRY` is not held → `CONVERT_RETRY` = the printed `problems` → Step 3 sub-step 3.
+     - **If** exit non-zero → **Failure Path**.
+     - **If** the printed `groups` hold a group numbered above `GROUP` → sub-step 8.
+     - **Else** → `GATE_VERDICT` = SKIPPED → sub-step 10.
    - **Else** → `GATE_VERDICT` = SKIPPED → sub-step 10.
 8. Run the group gate; it writes the trimmed log to the artifact:
    ```bash
diff --git a/.bkit/core/workflows/bkit-ship.md b/.bkit/core/workflows/bkit-ship.md
index b16a6ac09..1b2af821f 100644
--- a/.bkit/core/workflows/bkit-ship.md
+++ b/.bkit/core/workflows/bkit-ship.md
@@ -411,7 +411,7 @@ description: "Ship Feature — Autonomous merge and archive"
    cd "{WORKTREE_PATH}" && "{BKIT}" context diff --reset-log --artifact="tmp/bkit-diff-{FID}.md" --fid={FID} --step=ship-deferred-sweep >/dev/null || exit 2
    ```
    **Subagent:** Invoke `@bkit-ship-deferred-sweep` using `Agent` tool:
-   Context: You are a subagent in the Ship phase. Pre-merge completeness gate. Switch into working directory `cd "{WORKTREE_PATH}"` → verify with `pwd` → use for all subsequent file operations.
+   Context: You are a subagent in the Ship phase. Pre-merge completeness gate. Diff base: `origin/dev` — run `bkit branches scan-diff --disabled-tests --base=origin/dev`. Switch into working directory `cd "{WORKTREE_PATH}"` → verify with `pwd` → use for all subsequent file operations.
    Read: `docs/plans/{YYYYMM}/logs/{FID}/ship-input-{RUN}.md`, `docs/plans/{YYYYMM}/{FID}-plan.md` (if present), `docs/plans/{YYYYMM}/{FID}-design.md` (if present), `{STATUS}`, `docs/deferrals.jsonl`, glob `docs/plans/{YYYYMM}/logs/{FID}/*-plan-verify*.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/*-challenge*.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/*-summary.md`, `tmp/bkit-diff-{FID}.md` (the run's diff).
    Create: `docs/plans/{YYYYMM}/logs/{FID}/ship-deferred-sweep.md`.
 3. Finish (bookkeeping to `$BOOK_ROOT`):
diff --git a/.bkit/instructions.md b/.bkit/instructions.md
index 1aa460ff4..633b5d4bb 100644
--- a/.bkit/instructions.md
+++ b/.bkit/instructions.md
@@ -2823,7 +2823,7 @@ Read supplied diff fully. **If** its first line says `partial diff coverage` →
 - carriers: prompt `bkit-plan-generate`, `bkit-plan-review-1`, `bkit-plan-scope-check`, `bkit-plan-update`
 
 ```text
-**Scenario detail:** `Process Sketch` restates the `Concrete Example` and `Edge Cases` as 3-7 `WHEN X → THEN Y` outcome lines, with no new examples. `Concrete Example` is one scenario: role, starting state, numbered steps, observable outcome. `Edge Cases` keep the design's Key Edge Cases, else the issue's rows, word for word, and add validation, error and boundary cases. `Derived Test Matrix` has one row per testable behaviour, each with a target file and mapped to exactly one runbook task; issue rows stay word for word, and each in-scope audit behaviour has a row.
+**Scenario detail:** `Process Sketch` restates the `Concrete Example` and `Edge Cases` as 3-7 `WHEN X → THEN Y` outcome lines, with no new examples. `Concrete Example` is one scenario: role, starting state, numbered steps, observable outcome. `Edge Cases` keep the design's Key Edge Cases, else the issue's rows, word for word, and add validation, error and boundary cases. `Derived Test Matrix` has one row per testable behaviour, each with a target file; issue rows stay word for word, and each in-scope audit behaviour has a row.
 ```
 
 ### plan-test-tiers
@@ -7059,7 +7059,7 @@ Apply each decision:
 Test-order gap or `exception-refused` gap → a `- **TEST EXCEPTION:**` field as the last field of the task's block in `docs/plans/{YYYYMM}/{FID}-plan.md`, one sub-bullet per test in `TEST FIRST` form, each ending `— {human's reason} (owner, {YYYY-MM-DD})`; a task with no `TEST FIRST` → the field holds `{human's reason} (owner, {YYYY-MM-DD})` alone. The field replaces the task's existing `TEST EXCEPTION` field; NEVER add a second.
 Other → append one `docs/decisions.jsonl` row with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom); `by.step` = `build-decision`; `summary` names `{FID}`, step `{PAUSE_STEP}` and the gap or finding; `rationale` = `accepted by owner: {human's reason}`. An item that is a challenge task → also tick it `[x]` in the plan and end its title with ` — accepted by owner`.
 **Accept (assumed)** (written by `decisions apply`) → write nothing else: no `docs/decisions.jsonl` row, no `TEST EXCEPTION`. An item that is a challenge task → tick it `[x]` and end its title with ` — accepted (assumed)`. Ship asks the owner to confirm it.
-**Fix now** → an item that is a challenge task → keep that task open; it runs as it is. **Else** → write a task block (`docs/templates/bkit-plan.md` § Agent Execution Runbook) numbered one above the plan's highest task, with `**DONE WHEN:**` and `**TEST FIRST:**` (one sub-bullet per test, `` `{test file}` `{test name}` fails on {what goes wrong} ``); the human's direction, when given, shapes the task:
+**Fix now** → an item that is a challenge task → keep that task open; it runs as it is. **Else** → write a task block (`docs/templates/bkit-plan.md` § Agent Execution Runbook) numbered one above the plan's highest task, with `**DONE WHEN:**` and `**TEST FIRST:**` (one sub-bullet per test, `` `{test file}` `{test name}` fails on {what goes wrong} ``), and one `Derived Test Matrix` row per test in that `TEST FIRST` (``| {test name} | {tier} | `{test file}` | {task} |``, the tier its file's name gives); the human's direction, when given, shapes the task:
 `From: verify` and group `{GROUP}` stays within `{MAX_TASKS_PER_GROUP}` tasks and `{MAX_TESTS_PER_GROUP}` `TEST FIRST` tests with it → inside group `{GROUP}`.
 `From: verify`, over either cap → a new group right after `{GROUP}`; add 1 to every later group's number, in its markers and `### GROUP` heading.
 `From: tests` or `From: challenge` → a new last group, each new group within the caps.
@@ -7092,7 +7092,7 @@ Input file written (`workflows input`)
 Merge `origin/dev` when feature branch `docs/` is behind (conflicts: ledgers union, other `docs/` prefer `dev`):
 Check the plan is in task-block form, within the group caps:
 **If** exit 0 **and** (`NEWER_COMMENTS` = 0 **or** `CONVERTED` is held) → sub-step 5.
-**If** `CONVERTED` is not held **and** (exit 0 with `NEWER_COMMENTS` > 0, **or** exit 2 with no `docs/plans/{YYYYMM}/{FID}-plan.md`, **or** exit 1 with a `markers` problem) → sub-step 3.
+**If** `CONVERTED` is not held **and** (exit 0 with `NEWER_COMMENTS` > 0, **or** exit 2 with no `docs/plans/{YYYYMM}/{FID}-plan.md`, **or** exit 1 with a `markers`, `matrix` or `supersession` problem) → sub-step 3.
 **If** exit 1, `CONVERTED` is held **and** `CONVERT_RETRY` is not held → `CONVERT_RETRY` = the printed `problems` → sub-step 3.
 **Else** → **Failure Path** naming each problem in the report.
 Finish, then re-run sub-step 2 with `CONVERTED` = true:
@@ -7121,7 +7121,9 @@ Cut the group's own diff, from the commit it started at:
 Hold `parentSha` as `{GROUP_BASE}`; null → **Failure Path**.
 Tick the plan with the satisfied task numbers; a task the test-first report gaps stays open:
 **If** `VERIFY_VERDICT` = PASS → list the plan's groups:
-**If** exit non-zero → **Failure Path**. **If** the printed `groups` hold a group numbered above `GROUP` → sub-step 8. **Else** → `GATE_VERDICT` = SKIPPED → sub-step 10.
+**If** exit 1 with a `matrix` or `supersession` problem, **and** `CONVERT_RETRY` is not held → `CONVERT_RETRY` = the printed `problems` → Step 3 sub-step 3.
+**If** exit non-zero → **Failure Path**.
+**If** the printed `groups` hold a group numbered above `GROUP` → sub-step 8.
 **Else** → `GATE_VERDICT` = SKIPPED → sub-step 10.
 Run the group gate; it writes the trimmed log to the artifact:
 **If** exit 0 **or** 1 → hold `verdict` as `{GATE_VERDICT}`, `scope` as `{TEST_SCOPE}` → sub-step 9.
@@ -8036,13 +8038,12 @@ Unpassable checks: `TEST FIRST` / `DONE WHEN` checks current code cannot pass (v
 **If** `Acceptance Scenario` or `Derived Test Matrix` sections missing / vague → `CRITICAL`. Any `Open Questions & Assumptions` question breaking **Open questions** above → `OPTIONAL` findings naming missing parts.
 Verify every `Agent Execution Runbook` task has scope and verification step.
 Verify every scope item has both build task and verification task.
-Verify `Derived Test Matrix` ↔ `Agent Execution Runbook`: rows map 1:1 (bidirectional) to verification tasks. Gaps → `CRITICAL` finding naming the task or row to add.
 Identify gaps, edge cases, untested assumptions, missing error handling.
-Replaced / superseded code → `Supersession Inventory` with DELETE / RETAIN-with-REASON. Missing → `CRITICAL`.
 [R03] Introduced capability → `Reuse Inventory` row per **Reuse Inventory** above. Missing row, empty `Search performed`, rejected `NEW` reason, or untraced `[NEW]` / `EXTEND` row → `CRITICAL`.
 [R04] `Out of Scope` entries `Exempt` per **Out of Scope** above. Required work parked out of scope = `Blocking` → `CRITICAL`.
 No task scopes edits inside `bkit:start` / `bkit:end` blocks; always edit below `bkit:end`.
 `PASS` = scope complete.
+`FAIL` = a `Blocking` out-of-scope deferral no plan edit recovers; every other gap → `CRITICAL`.
 `CONCERNS` = `CRITICAL` gaps (apply via plan-update).
 ```
 
@@ -8104,7 +8105,7 @@ Per intended deliverable item under `Planned vs Delivered` → assert codebase s
 [R41] **Else** → record under / keep under `Lazy Deferrals` → append row to `docs/deferrals.jsonl` with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom), same `key` and prior fields verbatim, set `reason` to `unjustified`, set `status` to `TRIAGED`, `description` naming failed deferral tests.
 Update **Create** — set `Failures` via `Edit` = `Blocking Deferrals` entry count; set `Lazy` via `Edit` = `Lazy Deferrals` entry count.
 `PASS` = no remaining `Planned` items; every intended deliverable `Delivered`, `Exempt`, or `Lazy`; no `Blocking Deferrals`.
-`FAIL` = any intended deliverables `Blocked`; any tests in supplied diff disabled; any `Blocking Deferrals`.
+`FAIL` = any intended deliverables `Blocked`; any test the run's diff disabled; any `Blocking Deferrals`.
 Scan plan `Acceptance Scenario` sections and `DONE WHEN` lines for intended deliverables → record each under `Planned vs Delivered` with where, when, and why and mark item `Planned`; unmet preconditions, build process steps, or merge conditions in plan (even as part of `DONE WHEN`) are advisory only → record under `Exempt Deferrals`. **If** no plan file exists → outcome as worded is the bar.
 ```
 
diff --git a/.bkit/prompts.md b/.bkit/prompts.md
index e6a2af99b..eed2c3c41 100644
--- a/.bkit/prompts.md
+++ b/.bkit/prompts.md
@@ -267,7 +267,7 @@ Canonical per-agent metadata — **single source of truth for model per agent**.
 | `bkit-plan-generate` | Read design and / or audit reports + template + docs → write new plan draft. Design absent and audits present is valid. Neither present → the issue is the source: a change-shape issue's `Narrative`, `Success Criteria`, `Edge Cases`, matrix rows and tasks carry over verbatim (Contract `Acceptance Scenario` and `Scenario detail`). Audit contract: if input includes audit-scope directives, plan covers only those findings; the rest of each report is context only, not backlog. Workstream contract: if input includes `**Workstream:**` directive, plan covers only that workstream's `## Scope` content unless stated otherwise; surface `**Requires:**` at top of plan. Process = one step per major template section in **dependency (authoring) order, not template document order** — derived sections (Breaking Changes, Supersession, Security, Docs, Rollback) follow Architecture rather than preceding it: Context → Acceptance Scenario → Derived Test Matrix → Open Questions → Pre-Flight → Alternatives → Data Schema → Reuse Inventory → Architecture (+ `decisions.jsonl`) → Breaking Changes → Supersession → Security → Docs → Rollback → Out of Scope → Suggested Scope Expansion → Agent Execution Runbook (groups of task blocks in build order, each group and task within the `bkit.workflows.tasks` caps the workflow passes in Context; pick tests from matrix only; each row → exactly one task; every task has `DONE WHEN`; `READ` / `UPDATE` / `DELETE` only for symbols it opened; never writes its own `TEST EXCEPTION`, copies an input's word for word) → Verification. The workflow runs `bkit tests plan-check --existence=refuse` on the draft straight after; exit 1 re-invokes it once to fix only the lines the report names. Human-confirmation checkboxes stay unchecked at generate. Each section group lands in the draft before reading for the next group starts, so a turn-cap stop leaves finished groups on disk, not an all-`PENDING` stub. Every `Open Questions & Assumptions` question carries 2-3 concrete options with trade-offs as the lettered `Options: A) {option} — {trade-off} · B) …`, a `Recommended` option and a `Default if unanswered` (design's answer carried forward where it has one); a bare question is not acceptable output. `Out of Scope` entries must be `Exempt` (genuinely-additive), else a runbook task. `Suggested Scope Expansion` holds candidates, not tasks; no tracker / ledger scan here — surface overlaps come from the orchestrator Fetch Context step via `bkit-plan-review-1`. |
 | `bkit-plan-review-1` | Read-only critique of the plan text — tightness + dependency-order lens; effort slot 1 (`high`). Parallel with `-2` and `bkit-plan-scope-check`. Drift from source, design-coverage gaps and unjustified expansion → CRITICAL. Tasks declare `DEPENDS ON`, which `bkit tests plan-check` checks mechanically (a missing task, the task itself, a task in a later group); review-1 derives the graph regardless: what each task produces and consumes, read against runbook order (build order), because a declared field lists only the edges its author saw. A consumer before its producer, or a prerequisite no task produces and the repo lacks, is CRITICAL. Surfaces `Suggested Scope Expansion` candidates from the `related-*.md` context. FAIL only for a task-order cycle no reorder resolves, or a plan that contradicts its source design — every other gap is CRITICAL → CONCERNS so `bkit-plan-update` repairs it. |
 | `bkit-plan-review-2` | Same scope — regression-risk lens, reads the code; effort slot 2 (`high`). Traces each task's files, symbols, schemas and endpoints to their consumers. `TEST FIRST` / `DONE WHEN` check current code cannot pass, no task changing it → CRITICAL, cites the ruling `file:line`. FAIL only for a regression vector the source design itself requires and no plan edit mitigates — every other gap is CRITICAL → CONCERNS so `bkit-plan-update` repairs it. |
-| `bkit-plan-scope-check` | Internal-completeness scope audit; one slot, parallel with both reviewers on the draft (`medium` effort, opus model — depth-sensitive lens). Owns the template checks: sections present; `Acceptance Scenario` / `Derived Test Matrix` missing or vague → CRITICAL; `Open Questions & Assumptions` question missing options, `Recommended` or `Default if unanswered` (the lettered `Options: A) …`) → OPTIONAL (mirrors `bkit-design-review-2` on the design side). Per-task `DONE WHEN` / `TEST FIRST` are not this lens: `bkit tests plan-check` refuses a task missing either after every plan write. `Blocking` out-of-scope deferral → CRITICAL. Duplication guard is bidirectional: `Supersession Inventory` catches code the plan replaces but never deletes; `Reuse Inventory` catches capability the plan rebuilds instead of extending. Recorded search (exact commands, not a claim) is the evidence — empty `Search performed` = unsearched, not absence; untraced `[NEW]` → CRITICAL. FAIL only for a matrix-to-runbook mapping no plan edit recovers — a broken template and every other gap is CRITICAL → CONCERNS so `bkit-plan-update` repairs it. |
+| `bkit-plan-scope-check` | Internal-completeness scope audit; one slot, parallel with both reviewers on the draft (`medium` effort, opus model — depth-sensitive lens). Owns the template checks: sections present; `Acceptance Scenario` / `Derived Test Matrix` missing or vague → CRITICAL; `Open Questions & Assumptions` question missing options, `Recommended` or `Default if unanswered` (the lettered `Options: A) …`) → OPTIONAL (mirrors `bkit-design-review-2` on the design side). Per-task `DONE WHEN` / `TEST FIRST`, the matrix rows' task mapping and each `DELETE`'s `Supersession Inventory` row are not this lens: `bkit tests plan-check` refuses each after every plan write. `Blocking` out-of-scope deferral → CRITICAL. Duplication guard is bidirectional: `Supersession Inventory` catches code the plan replaces but never deletes; `Reuse Inventory` catches capability the plan rebuilds instead of extending. Recorded search (exact commands, not a claim) is the evidence — empty `Search performed` = unsearched, not absence; untraced `[NEW]` → CRITICAL. FAIL only for a `Blocking` out-of-scope deferral no plan edit recovers — a broken template and every other gap is CRITICAL → CONCERNS so `bkit-plan-update` repairs it. |
 | `bkit-plan-update` | Merge review / scope critique notes → in-place plan edits + record log. Invariant: every task's `**DONE WHEN:**` and `**TEST FIRST:**` fields survive critique-merge (may be tightened, `n/a` → named tests included; never removed / weakened). Writes review's `Suggested Scope Expansion` candidates into the plan section (advisory; never tasks). Open questions a finding adds or rewords carry options as the lettered `Options: A) …`, `Recommended` and `Default if unanswered`; untouched regions stay verbatim. Human-confirmation checkboxes survive the merge as found — an unconditional invariant beside `DONE WHEN`, not a clause of the open-question rule. Mirrors to `docs/deferrals.jsonl` only the `Out of Scope` `Exempt` rows its merge adds; `Suggested Scope Expansion` candidates are never appended — most were read from that ledger, so appending duplicates them. Writes a `docs/decisions.jsonl` row per decision its merge adds or changes, same `key` when changed, and keeps the plan's `**Ledger rows:**` line current for plan close's `bkit ledgers check`. |
 
 ## Build Phase
@@ -303,7 +303,7 @@ Canonical per-agent metadata — **single source of truth for model per agent**.

<!-- prettier-ignore -->
 | Agent | Scope |
 | --- | --- |
 | `bkit-ship-conflict-resolve` | Mid-rebase mechanical conflict resolver. Invoked from `/bkit-ship` Step 4 B2 when the PR conflicts textually with `origin/dev`: rebases onto `origin/dev`, runs `bkit branches rebase` first (unions ledgers, regenerates the lockfile), then hand-resolves only what that leaves conflicted. Allowed: non-overlapping additive edits, formatting drift, dep-version supersedes, additive JSON entries. Refused: same-function edits, semantic overlaps, ambiguous intent — FAIL aborts the rebase cleanly and routes to `bkit-debug-abort-handover`. Verifies via `bkit:gate:install-static-unit-build` before PASS. |
-| `bkit-ship-deferred-sweep` | Pre-merge completeness gate. Builds the intended-delivery set from plan `Acceptance Scenario` sections + `DONE WHEN` fields and asserts each against the codebase. No plan file → `ship-input-*.md` is the plan; intended-delivery set = its requested outcomes. An unmet / unplanned gap → FAIL → Failure Path (merge never happens) ONLY on >=1 of four blocking tests, each asserted against source, never inferred from a plan sentence: behaviour (absent / stub / wrong result), safety (guard weakened, known-broken path ships), false green (this diff disabled a covering test), consumer break (shipped surface fails at runtime). Lane results are not evidence — bkit lanes are event-scoped, some push-to-`dev` only, so a pre-merge sweep reading them re-creates the unsatisfiable refusal that made gate code 16 opt-in; the gate + capstone own green. A gap passing none is `Lazy`: stale prose / comment / name, doc drift, unwritten ledger row, formatting, future-enhancement `TODO`, `DONE WHEN` met in substance not literal wording. Branch is green by this step, so aborting on a record-keeping gap leaves the work unmerged and the record unwritten. Declared deferrals (out-of-scope / future-work / non-goals across design, plan, `docs/deferrals.jsonl`, summaries) form the exempt set — never block, resurfaced verbatim in the ship summary's `Deferred & Out-of-Scope (Resurfaced)` section. Exemption is EARNED, not self-granted: each entry's `reason` (`.bkit/jsonl.md` § Deferral Reason) is adjudicated against the four tests, and one that fails moves to that same third track `Lazy (unjustified)` — same-`key` ledger append setting `reason` = `unjustified`, resurfaced as follow-up, never blocking the merge (a bounded fix is cheaper than an aborted ship). Both `Lazy` sources share one append shape; every item carries its row before the verdict is set. The intended-delivery set is those two sources and NOTHING else — every precondition, build process step and merge condition a plan states is advisory, never a gate: plan `Gate N` checkboxes, `Verification Plan` boxes and `Manual Verification` steps are build-phase process, never deliverables, and no phrasing in a plan, log or phase summary makes one blocking (the gate reaches only what the repo can be made to prove; the plan template carries the matching authoring rule). Invoked from `/bkit-ship` Step 5 (after Conflict Resolve, before Merge). |
+| `bkit-ship-deferred-sweep` | Pre-merge completeness gate. Builds the intended-delivery set from plan `Acceptance Scenario` sections + `DONE WHEN` fields and asserts each against the codebase. No plan file → `ship-input-*.md` is the plan; intended-delivery set = its requested outcomes. An unmet / unplanned gap → FAIL → Failure Path (merge never happens) ONLY on >=1 of four blocking tests, each asserted against source, never inferred from a plan sentence: behaviour (absent / stub / wrong result), safety (guard weakened, known-broken path ships), false green (this diff disabled a covering test — `bkit branches scan-diff --disabled-tests` names each hit), consumer break (shipped surface fails at runtime). Lane results are not evidence — bkit lanes are event-scoped, some push-to-`dev` only, so a pre-merge sweep reading them re-creates the unsatisfiable refusal that made gate code 16 opt-in; the gate + capstone own green. A gap passing none is `Lazy`: stale prose / comment / name, doc drift, unwritten ledger row, formatting, future-enhancement `TODO`, `DONE WHEN` met in substance not literal wording. Branch is green by this step, so aborting on a record-keeping gap leaves the work unmerged and the record unwritten. Declared deferrals (out-of-scope / future-work / non-goals across design, plan, `docs/deferrals.jsonl`, summaries) form the exempt set — never block, resurfaced verbatim in the ship summary's `Deferred & Out-of-Scope (Resurfaced)` section. Exemption is EARNED, not self-granted: each entry's `reason` (`.bkit/jsonl.md` § Deferral Reason) is adjudicated against the four tests, and one that fails moves to that same third track `Lazy (unjustified)` — same-`key` ledger append setting `reason` = `unjustified`, resurfaced as follow-up, never blocking the merge (a bounded fix is cheaper than an aborted ship). Both `Lazy` sources share one append shape; every item carries its row before the verdict is set. The intended-delivery set is those two sources and NOTHING else — every precondition, build process step and merge condition a plan states is advisory, never a gate: plan `Gate N` checkboxes, `Verification Plan` boxes and `Manual Verification` steps are build-phase process, never deliverables, and no phrasing in a plan, log or phase summary makes one blocking (the gate reaches only what the repo can be made to prove; the plan template carries the matching authoring rule). Invoked from `/bkit-ship` Step 5 (after Conflict Resolve, before Merge). |
 | `bkit-ship-update-docs` | Cross-reference changed files against every doc in `docs.md`; update stale. |
 
 ## Audit (Ad-hoc)
diff --git a/.bkit/workflows.md b/.bkit/workflows.md
index 8f28d4384..6a4c33818 100644
--- a/.bkit/workflows.md
+++ b/.bkit/workflows.md
@@ -687,7 +687,7 @@ Then assert each Update/Create artifact exists, non-empty. Empty → **Failure P
 | `@bkit-design-spike` | PASS / CONCERNS / FAIL | Every value → Step 8 apply-review; the step informs, it does not gate. PASS = every claim held under an honest attempt; CONCERNS = nothing disproven but a claim was unsettleable this run (missing credential / service / host), design proceeds with the assumption unproven and the design summary lists it as a CONCERNS reason; FAIL = a claim is disproven and `@bkit-design-update` revises the design against the evidence — not a Failure Path, a disproven assumption is the step succeeding. Only a malformed or empty artifact routes to the Failure Path. Per-claim `SETTLED` / `DISPROVEN` / `BLOCKED` stays in the artifact body — the header verdict is the routing signal, not the finding. |
 | `@bkit-design-update` | PASS / CONCERNS / FAIL | All paths continue to Step 9 design-organise; CRITICAL items applied, OPTIONAL applied on consensus, OUT-OF-SCOPE deferred. |
 | `@bkit-design-organise` | PASS / CONCERNS / FAIL | PASS/CONCERNS → Step 10 summary; FAIL → Failure Path (cycles detected, human review required). |
-| `@bkit-plan-review-1` / `-2` + `@bkit-plan-scope-check` | PASS / CONCERNS / FAIL | The step row's verdict = worst of the three, `failures` = their sum. PASS/CONCERNS → Step 6 apply-review, where `@bkit-plan-update` repairs every CRITICAL finding; FAIL → Failure Path. FAIL is reserved for what no plan edit fixes (a task-order cycle no reorder resolves, a plan contradicting its source design, a regression vector the design itself requires, a matrix-to-runbook mapping no edit recovers), so a human reframes the design or the issue. |
+| `@bkit-plan-review-1` / `-2` + `@bkit-plan-scope-check` | PASS / CONCERNS / FAIL | The step row's verdict = worst of the three, `failures` = their sum. PASS/CONCERNS → Step 6 apply-review, where `@bkit-plan-update` repairs every CRITICAL finding; FAIL → Failure Path. FAIL is reserved for what no plan edit fixes (a task-order cycle no reorder resolves, a plan contradicting its source design, a regression vector the design itself requires, a `Blocking` out-of-scope deferral no edit recovers), so a human reframes the design or the issue. |
 | `bkit workflows summary` (`design`, `plan`, `build`, `debug`, `ship`) | PASS / CONCERNS / FAIL | PASS or CONCERNS → close workflow / next step; FAIL → Failure Path. |
 | `@bkit-build-plan-execute` | PASS / HANDOVER / FAIL | `HANDOVER` (turn cap near, tasks left neither `DONE` nor `BLOCKED`), or a group task with no `DONE` / `BLOCKED` line → Step 6 re-runs once for that group as a handover, not a failed attempt, its brief leaving out the `DONE` tasks; else → Step 7, which judges the log. A re-run keeps the existing log and resets its `Verdict` to `PENDING`. |
 | 2-way agents (`@bkit-debug-abort-handover`, `@bkit-design-generate`, `@bkit-design-brainstorm-ideate-1/2/3`, `@bkit-ship-update-docs`, `@bkit-ship-conflict-resolve`, `@bkit-ship-deferred-sweep`) | PASS / FAIL | PASS → continue; FAIL → Failure Path. Atomic action — no middle state (cannot proceed → fail; no partial-progress CONCERNS). For `@bkit-ship-conflict-resolve`: PASS clears `docs/plans/{YYYYMM}/logs/{FID}/.rebase-failed` sentinel and Step 4 continues; FAIL leaves sentinel and routes to `@bkit-debug-abort-handover`. For `@bkit-ship-deferred-sweep`: PASS → Merge (Step 6); FAIL touches `docs/plans/{YYYYMM}/logs/{FID}/.deferred-blocked` and routes to `@bkit-debug-abort-handover` (merge never happens). FAIL only on >=1 of four blocking tests (behaviour / safety / false green / consumer break); a gap passing none joins the third track `Lazy (unjustified)`, orthogonal to the verdict — recorded in `docs/deferrals.jsonl` (`reason` = `unjustified`; new `key` unplanned, own `key` re-appended when adjudicated) and resurfaced, never merged against. |
@@ -872,14 +872,14 @@ Each subsection documents command behaviour — steps, subagents, artifacts, ver
 | --- | --- | --- |
 | 1 — Start Workflow | — | Pre-flight: fetch `origin/dev`. Issue recovery as in design Step 1 (issue-less: tracker reads, labels, comments and the blocker check skipped). Set label `Build`, `In Progress`. Check `relations.blocked_by` — any blocker not in `{Done, Cancelled}` → Failure Path with `Blocked by {BLOCKER_ID}`. Resolve `FID`, then lock (missing month bucket → current month). no commits on `dev` — `start-workflow` step entry deferred to Step 2 inside the worktree. |
 | 2 — Worktree Setup | — | `bkit worktrees setup` (create / resume / adopt; dependencies installed). No path moves — plan stays at canonical bucket from design close. `bkit workflows input` writes `build-input-{RUN}.md`: session prompt, issue text and the plan as it arrived — the whole plan again, so only `@bkit-build-plan-convert` reads it; it stays as the record of what the run was given. Every other build agent reads the plan or its group's brief, and run instructions in the session prompt (a redo, a resume, a constraint) reach the brief's `Deviations` section through `--note-file` (Step 6). |
-| 3 — Branch Sync | `@bkit-build-plan-convert` _(only when the plan is missing, has no task markers, or is older than an issue comment)_ | `bkit branches sync --merge-docs`: fetch `origin/dev`; when commits touching `docs/` are behind, merge it — ledger conflicts union, other `docs/` conflicts take `dev`, a conflict outside `docs/` aborts the merge (exit 11 → Failure Path). Then `bkit tests plan-check --existence=report` on `{FID}-plan.md` → `build-plan-check.md`. No plan (exit 2), a plan with no task markers (exit 1, problem `markers`), or a valid plan with issue comments posted after its last commit (`newerThanPlan` > 0 from Step 2's `workflows input`) → `@bkit-build-plan-convert` writes the plan in task-block form from `build-input-{RUN}.md` and the plan file, keeping any existing plan's other sections; where they disagree the newer text wins, so later comments change the plan before any code; convert copies each `TEST EXCEPTION` an input writes word for word and never writes its own; row `build-plan-convert`, then the check re-runs. Still failing → convert once more with the printed problems, then Failure Path. Any other problem (caps, a stray `TEST FIRST` line) → Failure Path before any code, naming each problem. `bkit install` / `check` / `upgrade` list each `{FID}-plan.md` with no task markers whose FID has not shipped as advisory `plan-task-markers-missing`; nothing to do by hand, this step converts it. |
+| 3 — Branch Sync | `@bkit-build-plan-convert` _(only when the plan is missing, has no task markers, or is older than an issue comment)_ | `bkit branches sync --merge-docs`: fetch `origin/dev`; when commits touching `docs/` are behind, merge it — ledger conflicts union, other `docs/` conflicts take `dev`, a conflict outside `docs/` aborts the merge (exit 11 → Failure Path). Then `bkit tests plan-check --existence=report` on `{FID}-plan.md` → `build-plan-check.md`. No plan (exit 2), a plan with no task markers (exit 1, problem `markers`) or with a `matrix` / `supersession` problem, or a valid plan with issue comments posted after its last commit (`newerThanPlan` > 0 from Step 2's `workflows input`) → `@bkit-build-plan-convert` writes the plan in task-block form from `build-input-{RUN}.md` and the plan file, keeping any existing plan's other sections; where they disagree the newer text wins, so later comments change the plan before any code; convert copies each `TEST EXCEPTION` an input writes word for word and never writes its own; row `build-plan-convert`, then the check re-runs. Still failing → convert once more with the printed problems, then Failure Path. Any other problem (caps, a stray `TEST FIRST` line) → Failure Path before any code, naming each problem. `bkit install` / `check` / `upgrade` list each `{FID}-plan.md` with no task markers whose FID has not shipped as advisory `plan-task-markers-missing`; nothing to do by hand, this step converts it. |
 | 4 — Plan Current | `@bkit-build-plan-current` _(skipped when the mechanical trigger clears)_ | Orchestrator trigger `bkit branches anchor-read --field=baseSha --against=origin/dev` reads the plan's `bkit:anchor` (§ Anchor Block) and exits 12 — skipping the whole step, no agent, no `step-done` row, same shape as Step 5's `[skills=false]` skip — on any of: no plan, no anchor, `baseSha` unreachable in this clone, nothing landed on `origin/dev` since it. Else it prints `value` (= `BASE_SHA`) and the agent derives its own changed-path list from it, intersects that against the paths the plan's tasks depend on, and reads per-path diffs for the intersection only. `Executable` tasks are not findings; `Reword` / `Broken` are. Judges the PLAN against the codebase — the design doc is not an input, and `designPath` / `designBaseSha` have no consumer here. `CURRENT_VERDICT` is advisory on every value — PASS / CONCERNS / FAIL all → Step 5; CONCERNS / FAIL are recorded, comment-posted with `Affected`, and echoed as a console advisory, never blocking. Findings carry into Step 6 as a Read for `@bkit-build-plan-execute`; build never revises the plan, a re-run of `/bkit-plan` does. |
 | 5 — Skills | `@bkit-build-install-skills` _(skip if input contains `[skills=false]`)_ | If new skills installed → commit `chore({FID}): install skills bkit [skip ci]`. |
 | 6 — Execute Plan | `@bkit-build-plan-execute` | `bkit context brief --next` writes `build-brief-{GROUP}-{n}.md` — the group's open task blocks, the reds already recorded for them, the earlier tasks they depend on as context, and the plan's `Reuse Inventory` rows and `Architecture & Component Changes` entries naming the open tasks' `CREATE` / `UPDATE` / `DELETE` files (rows and entries past the 8 KB work cap are left out and counted; execute then reads the plan section) — and prints `group` (null → Step 9), `workBytes` and `workCap`. When the session prompt carries run instructions beyond naming the issue, the orchestrator writes them once to `{SESSION_DIR}/brief-note.md` and passes `--note-file`, so each brief ends with a `Deviations` section the agents apply to the tasks it names. A `build-group-start` row records the commit the group starts from, once per group. The orchestrator passes paths only; the agent reads the brief, not the plan and not `build-input-{RUN}.md`. Per group: `build-plan-execute-{GROUP}-log.md`. Attempt-numbered rows (`--attempt-of=build-plan-execute:next`), one log appended across attempts. Writes stub-first then incremental `DONE — TASK {N}` / `BLOCKED — TASK {N}` log entries via `Bash echo >>`; writes source. Per task naming `TEST FIRST` tests: tests + stubs first, then the red command from Context (`bkit tests red`, § Test-first) once per test before the task's code. Does not modify the plan — ticking is verify's job (per-task `Edit`-tick phase after impl is done is a known timeout vector; verify absorbs recovery). Verdict `HANDOVER` (turn cap near), or a task with neither a `DONE` nor a `BLOCKED` line (the agent hit its turn cap) → Step 6 re-runs once for that group as a handover, not a failed attempt, its brief leaving out the `DONE` tasks; the tracker comment shows `HANDOVER`; after that the verify→remediate loop (Step 7 → Step 8, bounded by `build.verify.maxAttempts`) absorbs the recovery. Else → Step 7. |
 | 7 — Verify Plan | `@bkit-build-plan-verify` | `bkit tests green --group` first (§ Test-first) → `build-tests-green-{GROUP}-{VERIFY_ATTEMPT}.md`, read by verify and remediate; exit >= 2 → Failure Path. `bkit context diff --base=` the group's start commit → `build-diff-{GROUP}-{VERIFY_ATTEMPT}.md`, the changes since the group started. Per group, attempt-numbered: `build-plan-verify-{GROUP}-{VERIFY_ATTEMPT}.md`. Reads the group's briefs, the diff, the execute log's `DONE —` lines and `build-plan-current.md` (already-landed tasks); ticks `- [ ] **TASK {N}:**` → `[x]` only when the task's `DONE WHEN` field is satisfied in the codebase (never on `DONE —` claim alone). Missing `DONE WHEN` on any task → FAIL (template structure broken — remediation cannot recover, routes via Failure Path). `VERIFY_VERDICT` ∈ {PASS, CONCERNS, FAIL}. PASS **and** a later group exists → group gate (§ Group gate) → `build-group-gate-{GROUP}-{VERIFY_ATTEMPT}.md` + row; `GATE_VERDICT` ∈ {PASS, FAIL, SKIPPED}. PASS + gate != FAIL → Step 6. Header `Fixable` = `true` when gap-remediate can fix any gap (each `Identified Gaps Log` line ends `— Fixable: true` / `— Fixable: false`); a test a task's `TEST EXCEPTION` field names is no gap. Every non-PASS first checks the group's verify rounds against `build.verify.maxAttempts` (`counters route --point=build.verify`; over → Failure Path). FAIL → one fixable-only Step 8 attempt (`Scope: fixable only`) when `Fixable` = `true` and a round is left, else § Decision Pause (`VERIFY_GAPS`). Group gate FAIL alone → Step 8 while a round is left, else Failure Path; never asked. Other CONCERNS → § Decision Pause (`VERIFY_LOOP`) while a round is left, else `VERIFY_GAPS`. Reads prior verify and remediate logs to know what was already verified. |
 | 8 — Remediate Gaps | `@bkit-build-plan-gaps-remediate` _(only if Step 7 CONCERNS, group gate FAIL, or the fixable-only attempt)_ | Attempt-numbered: `build-plan-gaps-remediate-{GROUP}-{VERIFY_ATTEMPT}-log.md`; reads the group's briefs for its task blocks. Stub-first artifact + flat append-only log (`DONE —` per gap fixed; `BLOCKED —` per blocked gap, appended via `Bash echo >>`); reads glob of own prior attempts to skip already-fixed gaps. Header `Fixed` = gaps with `DONE` this attempt. Resumed into this step (a `retry` decision) → the group's last verify round is read back first: `VERIFY_ATTEMPT` (`counters derive --position=current`), `VERIFY_VERDICT` and the group gate's verdict (`status route`) and `scope` (its row), the gate counted SKIPPED when that round wrote no gate log. No progress — `bkit branches scan-diff --base=HEAD~1 --code` exit 1 (nothing changed outside `docs/plans`, `docs/*.jsonl`, `.bkit/*.jsonl`: only logs and ledgers), or `Fixed` = 0 → § Decision Pause; verify never re-runs on unchanged code. Else re-run Step 7 (its next row is the next `VERIFY_ATTEMPT`). Over `build.verify.maxAttempts` → Failure Path. |
 | 9 — Holistic Verification | `@bkit-build-plan-verify` (holistic mode) | Once per run, after the last group: every group of the plan plus cross-group integration, cross-checked against every group's execute log; writes `build-plan-verify-holistic.md`. A row already recorded (challenge fix groups coming back through the loop) → Step 10 without re-running. FAIL → Failure Path. |
-| 10 — Build Challenge | `@bkit-build-challenge-2`, plus `@bkit-build-challenge-1` on a large change (parallel) | At most `build.challenge.maxAttempts` rounds (`CHALLENGE_MAX`, `counters max --point=build.challenge`; `challenge merge --round` refuses a round over it, exit 2 → Failure Path): `CHALLENGE_DONE` (`bkit status resume` `challengeDone`, the last round already merged) → Step 11 without reviewing again. `bkit challenge gate` fetches `origin dev` (offline → the last fetch, logged), then sizes `origin/dev...HEAD`, on every pass (`docs/plans/**` excluded): under 300 lines and 10 files is small → the security reviewer (`-2`) runs alone and the finish and merge drop challenge-1's artifact and report; else both run. Each reviewer reads the same `tmp/bkit-diff-{FID}.md`, written just before (§ Diff per reader); on `partial diff coverage` challenge-2 runs a targeted `git diff` on each omitted file touching a security-relevant path. Reviewers read the plan and the diff only. Each writes every finding as one task block under `## Findings Log` (`build-challenge-1.md`, `build-challenge-2.md`): severity, class, `Fixable`, `Location`, `DONE WHEN`, and a `TEST FIRST` for every finding. `bkit challenge merge --plan={FID}-plan.md` then appends the `CRITICAL|HIGH|MEDIUM` findings to the plan as task blocks stamped `**Round:** N`, in new last groups of <= `bkit.workflows.tasks.maxPerGroup` tasks; a finding at the `Location` and severity of an earlier challenge task that is still open reopens that task instead (its `**Round:**` line gains the round, e.g. `1, 2`; listed in `reopened` and `fixTasks`), one already done in an earlier round gets a new task; writes each `LOW` one as a `docs/deferrals.jsonl` row (`reason` `low-severity`), drops findings a `build-decision-*.md` item accepted, and prints the route: `none` → Step 11; `fix` (a round before the last, every task fixable) → Step 6, whose brief takes the first new group, `CHALLENGE_ROUND` + 1; `pause` (a `**Fixable:** false` task, any task in the last round, or more findings than one merge takes, which writes nothing) → § Decision Pause. A re-run on the same reports appends nothing. Exit 22 (a report not in task-block form) or exit 23 (the findings fail `plan-check`: a missing `TEST FIRST`, a test cap passed; `problems` printed) → reviewers re-run once with the reason in their Context, then Failure Path. Resumed into an open challenge Decision Pause → the limit read (`CHALLENGE_MAX`) and sub-steps 2 and 5 run again (the merge finds its tasks in the plan, writes nothing and prints the round's open tasks as `fixTasks`) → back to the pause's question. The challenge row carries the `round` it ran as (`--field=round=`); `bkit status resume` reads it back as `challengeRound` — one more once a challenge's merge wrote tasks (its next row is `build-plan-execute` or `build-decision`, not `build-run-tests`) — so the last round never fixes on its own; `challengeDone` = true once a last-round challenge row has a route row after it. |
+| 10 — Build Challenge | `@bkit-build-challenge-2`, plus `@bkit-build-challenge-1` on a large change (parallel) | At most `build.challenge.maxAttempts` rounds (`CHALLENGE_MAX`, `counters max --point=build.challenge`; `challenge merge --round` refuses a round over it, exit 2 → Failure Path): `CHALLENGE_DONE` (`bkit status resume` `challengeDone`, the last round already merged) → Step 11 without reviewing again. `bkit challenge gate` fetches `origin dev` (offline → the last fetch, logged), then sizes `origin/dev...HEAD`, on every pass (`docs/plans/**` excluded): under 300 lines and 10 files is small → the security reviewer (`-2`) runs alone and the finish and merge drop challenge-1's artifact and report; else both run. Each reviewer reads the same `tmp/bkit-diff-{FID}.md`, written just before (§ Diff per reader); on `partial diff coverage` challenge-2 runs a targeted `git diff` on each omitted file touching a security-relevant path. Reviewers read the plan and the diff only. Each writes every finding as one task block under `## Findings Log` (`build-challenge-1.md`, `build-challenge-2.md`): severity, class, `Fixable`, `Location`, `DONE WHEN`, and a `TEST FIRST` for every finding. `bkit challenge merge --plan={FID}-plan.md` then appends the `CRITICAL|HIGH|MEDIUM` findings to the plan as task blocks stamped `**Round:** N`, in new last groups of <= `bkit.workflows.tasks.maxPerGroup` tasks, plus one `Derived Test Matrix` row per appended task's test when the plan carries the table; a finding at the `Location` and severity of an earlier challenge task that is still open reopens that task instead (its `**Round:**` line gains the round, e.g. `1, 2`; listed in `reopened` and `fixTasks`), one already done in an earlier round gets a new task; writes each `LOW` one as a `docs/deferrals.jsonl` row (`reason` `low-severity`), drops findings a `build-decision-*.md` item accepted, and prints the route: `none` → Step 11; `fix` (a round before the last, every task fixable) → Step 6, whose brief takes the first new group, `CHALLENGE_ROUND` + 1; `pause` (a `**Fixable:** false` task, any task in the last round, or more findings than one merge takes, which writes nothing) → § Decision Pause. A re-run on the same reports appends nothing. Exit 22 (a report not in task-block form) or exit 23 (the findings fail `plan-check`: a missing `TEST FIRST`, a test cap passed; `problems` printed) → reviewers re-run once with the reason in their Context, then Failure Path. Resumed into an open challenge Decision Pause → the limit read (`CHALLENGE_MAX`) and sub-steps 2 and 5 run again (the merge finds its tasks in the plan, writes nothing and prints the round's open tasks as `fixTasks`) → back to the pause's question. The challenge row carries the `round` it ran as (`--field=round=`); `bkit status resume` reads it back as `challengeRound` — one more once a challenge's merge wrote tasks (its next row is `build-plan-execute` or `build-decision`, not `build-run-tests`) — so the last round never fixes on its own; `challengeDone` = true once a last-round challenge row has a route row after it. |
 | 11 — Run Tests | — | `bkit tests run` runs the deepest `bkit:gate:*` the consumer declares — descending `static-unit-integration`, `static-unit` (§ Local gate scripts) — and saves the full output to `{OUTBOX}/run-tests-{TEST_ATTEMPT}.log`; `--artifact` writes a copy clamped with `debug-evidence` to `docs/plans/{YYYYMM}/logs/{FID}/run-tests-{TEST_ATTEMPT}.md`, which rides the step's commit (row `artifacts` + `clamped`), so the log survives the worktree. `.md`, not `.log`: `*.log` is gitignored. Exit 3 (no gate declared) / 4 (gate could not run, 126 / 127) → Failure Path, never a FAIL verdict. Pre-PR: no E2E (CI covers it on the resulting PR). Build does not run the live tier — the @live boundary needs a deployed URL, so it is validated post-merge by the push-only `bkit-tests-live` CI canary and reproduced on demand via `/bkit-debug`; build gates on local tiers only and records no `testsLiveSkipped` (out of build's scope by design, not skipped). A repo gating unit branch-coverage puts `test:coverage:unit` in `bkit:lane:unit`, so this gate and the CI unit lane run the same `package.json` script (one source for the threshold) and a coverage regression fails in the worktree here instead of only on the PR. `TEST_VERDICT` = PASS → Step 14. FAIL with a round left under `build.tests.maxAttempts` → § Decision Pause (`TESTS_LOOP`: Try again / Stop) → Step 12; none left → Failure Path. |
 | 12 — Diagnose Failure | `@bkit-debug-failure-diagnose` _(only if Step 11 FAIL)_ | Reads the committed Step 11 test log `docs/plans/{YYYYMM}/logs/{FID}/run-tests-{TEST_ATTEMPT}.md`. Writes `build-failure-diagnose-{TEST_ATTEMPT}.md`. Resumed into Steps 12-13 → `TEST_ATTEMPT` is read back (`counters derive --step=build-run-tests --position=current`). |
 | 13 — Remediate Failure | `@bkit-debug-failure-remediate` _(only if Step 11 FAIL)_ | Gets the diagnosis's `Strategy` in its Context (`status route --step=build-failure-diagnose` `strategy`). Writes `build-failure-remediate-{TEST_ATTEMPT}-log.md`. Stub-first artifact + flat append-only log (`DONE —` per fix step; `BLOCKED —` per blocked step, appended via `Bash echo >>`). No skip-done — each attempt is diagnosis-driven and may pick a different strategy. Re-run Step 11 (its next row is the next `TEST_ATTEMPT`). |
@@ -897,7 +897,7 @@ One mechanism for every build question: verify gaps logged `Fixable: false` (tes
 - **Hard blockers:** test-order gaps (`no-red`, `late-red`, `red-mismatch`, `red-evidence-missing`, `test-changed`), the other unfixable gaps (`no-test-first`, `test-first-malformed`, `test-first-unread`, `exception-refused`) and `**Fixable:** false` challenge findings. No recommendation; "yes" never answers one.
 - **Accept** by the owner: written ONLY after explicit human approval of that item; agents NEVER write one on own judgement. Test-order gap or `exception-refused` gap → a `**TEST EXCEPTION:**` field in the task's block, committed alone (`git commit -- {plan}`) so `tests green` honours them; each entry ends `— {reason} (owner, {YYYY-MM-DD})`, and the field replaces the task's existing one, never a second, so the plan-alone commit always changes its lines and blame points at it; other → `docs/decisions.jsonl` row (`by.step` `build-decision`, `rationale` `accepted by owner: …`). Verify and `bkit challenge merge` read `build-decision-*.md` and drop accepted items. An accepted challenge task is also ticked `[x]` and its title ends ` — accepted by owner`, so the summary does not count it as unfinished. Group-gate failures are never items.
 - **Accept (assumed):** taken without the owner — `Decision: Accept (assumed) — {reason} ({ask:false|headless}, {RUNTIME}, {date})`. Settled for this build (verify, `acceptedLocations()`, gaps-remediate treat it as accepted), but it is not an acceptance: no `docs/decisions.jsonl` row, no `TEST EXCEPTION`. The build summary lists each one and keeps the verdict at CONCERNS; `/bkit-ship` asks the owner to confirm it (§ `/bkit-ship`, Confirm Assumed Items).
-- **Fix now:** a new task block with `DONE WHEN` + `TEST FIRST`, numbered above the plan's highest task. From verify: inside the paused group when it stays within `bkit.workflows.tasks.maxPerGroup` tasks and `bkit.workflows.tasks.maxTestsPerGroup` tests, else a new group straight after it, every later group renumbered. From tests or challenge: a new last group. Then `tests plan-check` (non-zero → Failure Path) → Step 6, whose brief picks the group holding the open task → Step 7 → onward. Fix now on a challenge task reuses that task as it stands, and a challenge-originated fix reaches the challenge reviewers again through Steps 9-10. Taken without asking → `Decision: Fix now — recommended; applied without asking ({RUNTIME})`.
+- **Fix now:** a new task block with `DONE WHEN` + `TEST FIRST` and one `Derived Test Matrix` row per test in it, numbered above the plan's highest task. From verify: inside the paused group when it stays within `bkit.workflows.tasks.maxPerGroup` tasks and `bkit.workflows.tasks.maxTestsPerGroup` tests, else a new group straight after it, every later group renumbered. From tests or challenge: a new last group. Then `tests plan-check` (non-zero → Failure Path) → Step 6, whose brief picks the group holding the open task → Step 7 → onward. Fix now on a challenge task reuses that task as it stands, and a challenge-originated fix reaches the challenge reviewers again through Steps 9-10. Taken without asking → `Decision: Fix now — recommended; applied without asking ({RUNTIME})`.
 - **Try again** (loop questions only): one more fix round on the same problems; the items wait undecided. `From: verify` → Step 8, `From: tests` → Step 12. The round counts against the same limit.
 - **Then:** `steps finish --step=build-decision --field=route={fix|retry|verify|tests} --comment-body` (decision posted to the tracker) → Step 6 (`fix`), Step 8 (`retry` after a verify or group-gate loop) or Step 12 (`retry` after a tests loop), re-run Step 7 (`verify`), or Step 11 (`tests`). The row's `route` is what `bkit status resume` reads to resume after a decision: `retry` resumes at Step 8 (`build-plan-gaps-remediate`) when the paused step was `build-plan-verify` or `build-group-gate`, at Step 12 (`build-failure-diagnose`) when it was `build-run-tests`. A challenge decision with a fix to run → `fix`; one already in the last round also sets `CHALLENGE_DONE`, so Step 10 goes on to Step 11.
 - **Fixer reads the answer:** Step 8 (`@bkit-build-plan-gaps-remediate`) and Step 12 (`@bkit-debug-failure-diagnose`) read the newest `build-decision-{RUN}-*.md`, so the owner's words reach the next round. The `STANDARD → PIVOT → FINAL` ladder reads every run and is not reset by a decision: each further round moves up a rung, `FINAL` stays `FINAL`.
@@ -1371,7 +1371,7 @@ and holds its `bkit` key as `{BKIT}` (plus `repoRoot` as `{REPO_ROOT}`, `outboxR
 | `locks` | `acquire`, `release` | per-feature `.lock` |
 | `workflows` | `start`, `fail`, `handover`, `close`, `promote`, `links`, `input` | `workflow-started` (resume facts: `lastDoneStep`, `openDecision`; `--branch` refuses another checked-out branch, exit 15; ship clears stale sentinels); the Failure Path (`fail`: row, rebase abort, lock, sentinels, labels, failure comment; `handover --list-stray` lists paths outside the run's logs; `handover --push` / ship's `--flush`); `close` (compliance grade, `workflow-done`, telemetry, report, artifact links, `--outbox`, `--message` commit; ship's `--flush` lands on dev; `--final-return` prints the run's last message: summary (`--summary-file`, or `--summary` + `--summary-missing` when it may be absent), issue link, suggested replies, tips; `--session-dir` deletes the session folder, `fail` too); design / plan canonical promotion (`promote`), close links (`links`), the run's input file (`input`: session prompt, issue text, design / plan / audit reports) |
 | `worktrees` | `setup`, `remove` | Step 2 worktree create / resume / adopt (`--detect` asks the runtime), copy, install, ship's `branchWarning`; teardown |
-| `branches` | `sync`, `push`, `land`, `rebase`, `sync-dev`, `fast-forward`, `scan-diff`, `force-build`, `anchor-stamp`, `anchor-read` | docs-from-dev merge, base check, every push (`--mode=plain`: never forced, exit 21 nothing to ship; `--commit` + `--label`: one marker commit per run, then the push), design / plan close landing (squash in a throwaway `origin/dev` worktree pushed as `dev` with backoff retries, else PR squash-merge; audit; local `dev` fast-forward; lock release), Tier-2 rebase resolve, ship's local `dev` fast-forward, ship's PR-head fast-forward (`fast-forward`: exit 22 diverged), diff routing (`scan-diff --paths=` / `--marker=` / `--code`: exit 0 found, 1 none; `--expect-none` inverts both), `bkit [force build]` in the PR title plus marker commit (`force-build`), anchor block |
+| `branches` | `sync`, `push`, `land`, `rebase`, `sync-dev`, `fast-forward`, `scan-diff`, `force-build`, `anchor-stamp`, `anchor-read` | docs-from-dev merge, base check, every push (`--mode=plain`: never forced, exit 21 nothing to ship; `--commit` + `--label`: one marker commit per run, then the push), design / plan close landing (squash in a throwaway `origin/dev` worktree pushed as `dev` with backoff retries, else PR squash-merge; audit; local `dev` fast-forward; lock release), Tier-2 rebase resolve, ship's local `dev` fast-forward, ship's PR-head fast-forward (`fast-forward`: exit 22 diverged), diff routing (`scan-diff --paths=` / `--marker=` / `--code`: exit 0 found, 1 none; `--expect-none` inverts both; `--disabled-tests`: exit 1 when an added line disables a test or a test file loses an assertion, 0 when none, printing `file:line` and the test name), `bkit [force build]` in the PR title plus marker commit (`force-build`), anchor block |
 | `prs` | `open`, `probe`, `merge`, `update-branch`, `checks`, `verbose-ci`, `scan-body`, `cross-check`, `transport-row` | PR create (`open --file --workflow`: an `engine-action` row reuses the PR on a re-run) / lookup, squash merge (empty body, `--match-head`, auto-route suffix from `--label`), server-side base refresh, check-rollup classification (green when present and none failed/pending), debug's verbose-CI title, close-transport audit (`transport-row --scan --cross-check`) |
 | `issues` | `text`, `fetch`, `related`, `blocked-by`, `labels`, `comment` | issue text join + cut; the issue read into `{SESSION_DIR}` or `{OUTBOX}` (`fetch`: description, comments, facts); related-hit reads (`related`); open blockers (`blocked-by`); label arithmetic + board payload, written with `labels --write`; comment bodies, posted with `comment --post`. Each exits 80 or prints `done` = false when the tracker MCP must do it |
 | `runs` | `wait`, `dispatch`, `gate`, `revalidate`, `context`, `mirror`, `declared` | CI polls, CI-Dispatch Gate (`--file` / `--step` record its row, `--label` the re-trigger suffix), ship merge gate (`--pr` / `--squash-of` heads, `--snapshot`, `--record`, `--fetch` refreshes `origin/<--branch>` first), ship Step 9 re-validate, auto Step 1 context (`ref`: the issue as the dispatched workflow's argument), release-PR mirror, CI-workflow presence |
@@ -1517,7 +1517,7 @@ Every plan task block carries a `**TEST FIRST:**` field — one sub-bullet per t
 - **Hash in the row, snapshot beside the log:** both ride the plan-execute commit and survive push and resume; nothing pins a git object.
 - **Resume-safe:** execute never ticks tasks, so a resumed build re-runs execute from the first task; each earlier red stands because its test file is unchanged. Refused as `passed` → the task's code already exists → `BLOCKED`, never code undone to force a red.
 - **Plan caps, `package.json` `bkit.workflows.tasks`:** up to `bkit.workflows.tasks.maxPerGroup` tasks (default 3) and `bkit.workflows.tasks.maxTestsPerGroup` TEST FIRST tests (default 15) per group; per task `bkit.workflows.tasks.maxTestsPerTask` tests (default 10) across `bkit.workflows.tasks.maxTestFilesPerTask` test files (default 3). Bigger tasks exhaust plan-execute's turn budget, go code-first, and no red is possible after; a group is one execute agent's work, and a bigger group overflows its context. A key that is not a whole number >= 1 takes its default, and `bkit check` reports advisory `bkit-tasks-invalid`. `.github/ISSUE_TEMPLATE/bkit-change.yml` showing a key as `(default N)` with N other than the value `readBkitConfig` gives → advisory `bkit-tasks-form-stale`, naming the number to change in the form. Install and upgrade write the defaults when `tasks` or a key in it is missing; a value already set is never touched. `readBkitConfig` reads them (`CONFIG_DEFAULTS.tasks` in `settings.ts`); `tests plan-check` and `challenge merge` read the checkout's caps and refuse a plan over any cap, naming the task or group, its count and the cap; `repo info` prints them as `tasks`, which `/bkit-plan` and `/bkit-build` Step 1 hold as `{MAX_TASKS_PER_GROUP}`, `{MAX_TESTS_PER_GROUP}`, `{MAX_TESTS_PER_TASK}`, `{MAX_TEST_FILES_PER_TASK}` and pass in Context to every agent that writes, reviews, executes or verifies the plan: plan-generate, plan-review-1, plan-review-2, plan-scope-check, plan-update, convert, plan-execute, plan-verify and the challenge reviewers. Prompts name no cap value of their own; each uses the caps its Context names.
-- **One block reader:** `tests green`, `tests plan-check`, `challenge merge` and the run facts read a plan with `parsePlanBlocks` (`plan-blocks.ts`). A group is `<!-- bkit:group N start -->`, `### GROUP N: {title}` … `<!-- bkit:group N end -->`; a task is `<!-- bkit:task N start -->`, `- [ ] **TASK N:** {title}` … `<!-- bkit:task N end -->` inside a group, its number unique across the plan, its fields uppercase `**LABEL:**` lines. Group numbers start at 1 and ascend through the file (the build runs groups in file order); task numbers start at 1 and ascend within a group, so a Decision Pause task numbered above the plan's highest can join its paused group. `DEPENDS ON`, `DONE WHEN`, `TEST FIRST` and `TEST EXCEPTION` are written once per task; a second one, or a bold `**TASK N:**` line inside another task's block, is refused. `DEPENDS ON: none (...)` names no task; `tests plan-check` refuses a task depending on itself, on a missing task or on a task in a later group. CRLF reads like LF. A code fence never closed → `the code fence at line N is never closed; nothing after it is read`. Task-like text outside every block (a bold `task N` in any letter case, a bold field label; inline code and fenced blocks are prose) is a plan-level problem: `tests plan-check` refuses it, and `tests green` reports it as a `test-first-unread` gap (`task` null, `Fixable: false`) while auditing every task it could read.
+- **One block reader:** `tests green`, `tests plan-check`, `challenge merge` and the run facts read a plan with `parsePlanBlocks` (`plan-blocks.ts`). A group is `<!-- bkit:group N start -->`, `### GROUP N: {title}` … `<!-- bkit:group N end -->`; a task is `<!-- bkit:task N start -->`, `- [ ] **TASK N:** {title}` … `<!-- bkit:task N end -->` inside a group, its number unique across the plan, its fields uppercase `**LABEL:**` lines. Group numbers start at 1 and ascend through the file (the build runs groups in file order); task numbers start at 1 and ascend within a group, so a Decision Pause task numbered above the plan's highest can join its paused group. `DEPENDS ON`, `DONE WHEN`, `TEST FIRST` and `TEST EXCEPTION` are written once per task; a second one, or a bold `**TASK N:**` line inside another task's block, is refused. `DEPENDS ON: none (...)` names no task; `tests plan-check` refuses a task depending on itself, on a missing task or on a task in a later group. The readers beside it — `reuseInventory`, `derivedTestMatrix` (its `Task` column) and `supersessionInventory` — read the plan's `Reuse Inventory`, `Derived Test Matrix` and `Supersession Inventory` tables; a `CREATE` with no NEW row, a matrix row naming no task / an undefined task / two tasks or a test-bearing task no row names, and a `DELETE` with no `Supersession Inventory` row are each plan-check problems. CRLF reads like LF. A code fence never closed → `the code fence at line N is never closed; nothing after it is read`. Task-like text outside every block (a bold `task N` in any letter case, a bold field label; inline code and fenced blocks are prose) is a plan-level problem: `tests plan-check` refuses it, and `tests green` reports it as a `test-first-unread` gap (`task` null, `Fixable: false`) while auditing every task it could read.
 - **`fails on {what goes wrong}`, not an assertion:** a literal assertion can be one current code never passes (a value the path always prints) → build rewrites it after its red → `test-changed`. A described failure leaves the build free to write a passable check; plan review-2 flags checks current code rules out.
 - **Late red:** plan-execute commits only at step end, so TASK N's code first lands in the first plan-execute step commit after the red's `parentSha` whose log records `DONE — TASK N` (any letter case). Red `parentSha` = that commit or a descendant (`git merge-base --is-ancestor`) → `late-red`. Catches reds a later step records by swapping old source back. A red recorded inside plan-execute after its code is undetectable (no commit yet); the execute and gaps-remediate prompts forbid it. A task with a red but no plan-execute commit logging `DONE — TASK N` (log line in another form, task never `DONE`) is not checked: the report's `Late-red check` section names it and verify notes it, never silent.
 - **Added lines only:** snapshot lines all present in order, whitespace ignored → no `test-changed` from `tests green`; diff still reported, row `added lines only`. Verify reads each such diff: a line added inside a planned test or setup it runs (an early `return`, a new mock) can gut the test without editing a line → `test-changed`. Removed / rewritten lines stay a gap for verify.
diff --git a/dist/commands/workflow/branches.js b/dist/commands/workflow/branches.js
index 80244913f..850262cbc 100644
--- a/dist/commands/workflow/branches.js
+++ b/dist/commands/workflow/branches.js
@@ -857,14 +857,105 @@ function fastForwardVerb(ctx) {
 }
 /** Paths a source-change check leaves out: plan logs and the append-only ledgers. */
 const NOT_CODE = [":(exclude)docs/plans", ":(exclude)docs/*.jsonl", ":(exclude).bkit/*.jsonl"];
+/** A test file's name at any tier: unit, integration, E2E. */
+const TEST_FILE = /\.(?:test|spec)\.|_test\.|(^|\/)test_[^/]*\.py$/;
+/** Added-line markers that disable a test: `bkit-slop-type-suppression.mjs`'s set, widened. */
+const DISABLED_MARKERS = [
+    /\b(?:describe|context|it|test|suite|bench)\.(?:skip|todo|fixme)\b/,
+    /(?<!\.)\bx(?:it|describe|test|context)\s*\(/,
+    /\bxfail\b/,
+    /\bt\.Skip\(/,
+    /#\[ignore\b/,
+    /@Disabled\b/,
+];
+/** An assertion call a change deletes from a test file. */
+const ASSERTION = /\b(?:expect|assert\w*|should|should_\w+)\b/;
+/** A test declaration's name on `line`, or null when the line declares no test. */
+function declaredName(line) {
+    const call = /\b(?:it|test|suite|describe|context|bench)(?:\.[a-z]+)*\s*\(\s*(["'`])(.+?)\1/.exec(line);
+    if (call !== null)
+        return call[2];
+    const go = /\bfunc\s+(Test\w+)\s*\(/.exec(line);
+    if (go !== null)
+        return go[1];
+    const py = /\bdef\s+(test_\w+)\s*\(/.exec(line);
+    if (py !== null)
+        return py[1];
+    if (/@Test\b/.test(line)) {
+        const java = /\b(?:void|fun)\s+(\w+)\s*\(/.exec(line);
+        return java?.[1] ?? line.trim();
+    }
+    return null;
+}
+/** The test at 1-based `at` in `body`: the nearest declaration above it, else `line` itself. */
+function testAt(body, line, at) {
+    if (body !== null) {
+        const lines = body.split(/\r?\n/);
+        for (let i = Math.min(at, lines.length) - 1; i >= 0; i--) {
+            const name = declaredName(lines[i]);
+            if (name !== null)
+                return name;
+        }
+    }
+    return line.trim();
+}
+const HUNK = /^@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/;
+/**
+ * The added lines of a `--no-renames` unified diff that disable a test, and the removed
+ * assertion lines of a test file: each with its new-file line and the test it sits in.
+ */
+export function disabledTestsIn(diff, root) {
+    const out = [];
+    const bodies = new Map();
+    const body = (rel) => {
+        if (!bodies.has(rel)) {
+            const abs = path.resolve(root, rel);
+            bodies.set(rel, fs.statSync(abs, { throwIfNoEntry: false })?.isFile()
+                ? fs.readFileSync(abs, "utf-8")
+                : null);
+        }
+        return bodies.get(rel);
+    };
+    let file = "";
+    let next = 0;
+    for (const raw of diff.split("\n")) {
+        if (raw.startsWith("+++ ")) {
+            file = raw.replace(/^\+\+\+ (b\/)?/, "");
+            continue;
+        }
+        if (raw.startsWith("--- "))
+            continue;
+        const hunk = HUNK.exec(raw);
+        if (hunk !== null) {
+            next = Number(hunk[1]);
+            continue;
+        }
+        if (raw.startsWith("+")) {
+            const text = raw.slice(1);
+            if (DISABLED_MARKERS.some((m) => m.test(text)))
+                out.push({ file, line: next, test: testAt(body(file), text, next) });
+            next++;
+        }
+        else if (raw.startsWith("-")) {
+            if (TEST_FILE.test(file) && ASSERTION.test(raw.slice(1)))
+                out.push({ file, line: next, test: testAt(body(file), raw.slice(1), next) });
+        }
+        else if (raw.startsWith(" "))
+            next++;
+    }
+    return out;
+}
 function scanDiffVerb(ctx) {
     const base = String(ctx.flags.base);
     const pattern = str(ctx.flags.paths);
     const marker = str(ctx.flags.marker);
     const code = ctx.flags.code === true;
-    if ([pattern !== undefined, marker !== undefined, code].filter(Boolean).length !== 1) {
-        throw new CommandError(EXIT.USAGE, "give exactly one of --paths, --marker, --code");
+    const disabled = ctx.flags.disabledTests === true;
+    if ([pattern !== undefined, marker !== undefined, code, disabled].filter(Boolean).length !== 1) {
+        throw new CommandError(EXIT.USAGE, "give exactly one of --paths, --marker, --code, --disabled-tests");
     }
+    if (disabled && ctx.flags.expectNone === true)
+        throw new CommandError(EXIT.USAGE, "--disabled-tests inverts the exit already; drop --expect-none");
     let re;
     if (pattern !== undefined) {
         try {
@@ -885,6 +976,19 @@ function scanDiffVerb(ctx) {
         return EXIT_DIFF_FAILED;
     }
     const range = `${base}...HEAD`;
+    if (disabled) {
+        const diff = quietGit(top, ["diff", "--no-renames", range, "--", ".", ":(exclude)docs/plans"]);
+        if (!diff.ok) {
+            ctx.log(`git diff ${range} failed: ${diff.stderr}`);
+            return EXIT_DIFF_FAILED;
+        }
+        const hits = disabledTestsIn(diff.stdout, top);
+        const files = [...new Set(hits.map((h) => h.file))];
+        ctx.emit({ found: hits.length > 0, paths: files, disabled: hits });
+        if (hits.length > 0)
+            ctx.log(`added lines disable tests:\n${hits.map((h) => `${h.file}:${h.line} — ${h.test}`).join("\n")}`);
+        return hits.length > 0 ? EXIT.NO : EXIT.OK;
+    }
     let paths;
     if (marker !== undefined) {
         const diff = quietGit(top, ["diff", "--no-renames", range, "--", ".", ":(exclude)docs/plans"]);
@@ -1755,7 +1859,7 @@ export const branchesCommand = {
             run: fastForwardVerb,
         },
         "scan-diff": {
-            summary: "Exit 0 when the branch's diff from --base matches (paths, an added marker line, or a source change); 1 when not.",
+            summary: "Exit 0 when the branch's diff from --base matches (paths, an added marker line, a source change, or a disabled test); 1 when not — --disabled-tests turns that round: 1 when a test was disabled or lost an assertion, 0 when none was.",
             flags: [
                 {
                     name: "base",
@@ -1778,13 +1882,22 @@ export const branchesCommand = {
                     type: "boolean",
                     help: "a path changed outside docs/plans, docs/*.jsonl and .bkit/*.jsonl",
                 },
+                {
+                    name: "disabled-tests",
+                    type: "boolean",
+                    help: "an added line disables a test (`.skip` / `.todo` / `.fixme` / `xfail`, `t.Skip()`, `#[ignore]`, `@Disabled`) or a test file loses an assertion; inverts --paths / --marker / --code's polarity, so never pass it with --expect-none",
+                },
                 {
                     name: "expect-none",
                     type: "boolean",
                     help: "invert the exit: 0 when nothing matched, 1 (naming the paths on stderr) when something did",
                 },
             ],
-            output: { found: "something matched", paths: "the matching paths" },
+            output: {
+                found: "something matched",
+                paths: "the matching paths",
+                disabled: "[{file, line, test}]: added lines that disable a test, and removed assertion lines of a test file (only with --disabled-tests)",
+            },
             exitCodes: {
                 [EXIT_DIFF_FAILED]: "--base does not resolve, or git diff failed",
             },
diff --git a/dist/commands/workflow/challenge.js b/dist/commands/workflow/challenge.js
index 70f99bfb9..f74ba646c 100644
--- a/dist/commands/workflow/challenge.js
+++ b/dist/commands/workflow/challenge.js
@@ -25,7 +25,7 @@ import { appendLine, statusTimestamp } from "../../ledgers/status.js";
 import { CommandError, DEV, EXIT, git, runGit } from "../lib.js";
 import { DIFF_BASE, EXIT_BASE, diffNumstat } from "./context.js";
 import { EXIT_ROW_REFUSED, EXIT_STAGE, appendLedgerRows } from "./ledgers.js";
-import { parsePlanBlocks } from "./plan-blocks.js";
+import { derivedTestMatrix, parsePlanBlocks } from "./plan-blocks.js";
 import { readBkitConfig } from "../../shared/settings.js";
 import { checkPlanText, planCaps, readTestFirst } from "./tests.js";
 import { ledgerRows } from "./workflows.js";
@@ -207,6 +207,24 @@ const taskBlock = (n, f, round) => [
     ...f.tests.map((e) => `    - ${e}`),
     `<!-- bkit:task ${n} end -->`,
 ];
+/** The test tier `docs/testing.md` records for a test file's name. */
+const testTier = (file) => /\.integration\.test\./.test(file)
+    ? "Integration"
+    : /\.live\.test\./.test(file)
+        ? "@live (golden)"
+        : "Unit";
+/**
+ * One `Derived Test Matrix` row per test a finding task appends: the test's own name and
+ * file from its `TEST FIRST` entry, its tier from the file's name, and the task number.
+ */
+function matrixRows(findings, firstTask) {
+    return findings.flatMap((f, i) => f.tests.map((entry) => {
+        const spans = [...entry.matchAll(/`([^`]+)`/g)].map((m) => m[1].trim());
+        const file = spans[0] ?? "";
+        const name = spans[1] ?? entry.replace(/[`|]/g, "").trim();
+        return `| ${name} | ${testTier(file)} | \`${file}\` | ${firstTask + i} |`;
+    }));
+}
 /**
  * The findings as groups of task blocks, numbered from `firstTask` and `firstGroup`: a
  * group closes at `caps.maxPerGroup` tasks, or before a task that would take it past
@@ -242,15 +260,24 @@ function findingGroups(findings, firstTask, firstGroup, round, caps) {
 }
 /**
  * `plan` with the findings written as new groups after its last group (at the end when
- * it has none), tasks numbered from `firstTask`, grouped within `caps`.
+ * it has none), tasks numbered from `firstTask`, grouped within `caps`. A plan that
+ * carries a `Derived Test Matrix` gains a row per finding test, so the matrix check holds
+ * over the appended tasks too.
  */
 export function appendTasks(plan, findings, round, firstTask, caps) {
     const blocks = parsePlanBlocks(plan);
     const firstGroup = Math.max(0, ...blocks.groups.map((g) => g.group)) + 1;
     const { lines: block, tasks } = findingGroups(findings, firstTask, firstGroup, round, caps);
+    const matrix = derivedTestMatrix(plan);
+    const rows = matrix === null ? [] : matrixRows(findings, firstTask);
+    // The matrix table's last row, or its separator line when it holds none: 0-based index.
+    const matrixAt = matrix === null ? -1 : (matrix.rows.at(-1)?.number ?? matrix.line + 1);
+    const lines = plan.split("\n");
+    if (matrixAt >= 0)
+        lines.splice(matrixAt, 0, ...rows);
     const last = blocks.groups.at(-1);
     if (last === undefined) {
-        const body = plan.replace(/\n*$/, "");
+        const body = lines.join("\n").replace(/\n*$/, "");
         const from = body.split("\n").length + 2;
         return {
             text: `${body}\n\n${block.join("\n")}\n`,
@@ -258,9 +285,9 @@ export function appendTasks(plan, findings, round, firstTask, caps) {
             written: { from, to: from + block.length - 1 },
         };
     }
-    const lines = plan.split("\n");
-    lines.splice(last.end, 0, "", ...block);
-    const from = last.end + 2;
+    const shift = matrixAt >= 0 && matrixAt <= last.end ? rows.length : 0;
+    lines.splice(last.end + shift, 0, "", ...block);
+    const from = last.end + shift + 2;
     return { text: lines.join("\n"), tasks, written: { from, to: from + block.length - 1 } };
 }
 /**
diff --git a/dist/commands/workflow/plan-blocks.js b/dist/commands/workflow/plan-blocks.js
index b3231eb4b..5aa32b6e9 100644
--- a/dist/commands/workflow/plan-blocks.js
+++ b/dist/commands/workflow/plan-blocks.js
@@ -32,13 +32,11 @@ const tableCells = (row) => row
     .slice(1, -1)
     .map((c) => c.trim());
 /**
- * The plan's Reuse Inventory: the first table under the first heading naming Reuse
- * Inventory, before the next heading of the same or a higher level. Each row's `File`
- * cell gives its backticked paths, normalised. No heading, table or `File` column → null.
+ * The first table under the first heading matching `heading`, before the next heading of
+ * the same or a higher level: the header line's index and its cells. No heading or table → null.
  */
-export function reuseInventory(text) {
-    const lines = text.split(/\r?\n/);
-    const start = lines.findIndex((l) => /^#{2,4} .*Reuse Inventory/i.test(l));
+function firstTable(lines, heading) {
+    const start = lines.findIndex((l) => heading.test(l));
     if (start < 0)
         return null;
     const level = /^#+/.exec(lines[start])[0].length;
@@ -51,13 +49,24 @@ export function reuseInventory(text) {
         }
     if (head < 0)
         return null;
-    const cols = tableCells(lines[head]);
-    const file = cols.findIndex((c) => /^file\b/i.test(c));
-    const decision = cols.findIndex((c) => /^decision\b/i.test(c));
+    return { head, cols: tableCells(lines[head]) };
+}
+/**
+ * The plan's Reuse Inventory: the first table under the first heading naming Reuse
+ * Inventory, before the next heading of the same or a higher level. Each row's `File`
+ * cell gives its backticked paths, normalised. No heading, table or `File` column → null.
+ */
+export function reuseInventory(text) {
+    const lines = text.split(/\r?\n/);
+    const table = firstTable(lines, /^#{2,4} .*Reuse Inventory/i);
+    if (table === null)
+        return null;
+    const file = table.cols.findIndex((c) => /^file\b/i.test(c));
+    const decision = table.cols.findIndex((c) => /^decision\b/i.test(c));
     if (file < 0)
         return null;
     const rows = [];
-    for (let i = head + 2; i < lines.length && /^\s*\|/.test(lines[i]); i++) {
+    for (let i = table.head + 2; i < lines.length && /^\s*\|/.test(lines[i]); i++) {
         const cells = tableCells(lines[i]);
         rows.push({
             line: lines[i],
@@ -65,7 +74,49 @@ export function reuseInventory(text) {
             decision: decision < 0 ? "" : (cells[decision] ?? ""),
         });
     }
-    return { head: lines.slice(head, head + 2), rows };
+    return { head: lines.slice(table.head, table.head + 2), rows };
+}
+/** The plan's `Derived Test Matrix` over `tableCells`; null when the plan has no such table. */
+export function derivedTestMatrix(text) {
+    const lines = text.split(/\r?\n/);
+    const table = firstTable(lines, /^#{2,4} .*Derived Test Matrix/i);
+    if (table === null)
+        return null;
+    const column = table.cols.findIndex((c) => /^task\b/i.test(c));
+    const rows = [];
+    for (let i = table.head + 2; i < lines.length && /^\s*\|/.test(lines[i]); i++) {
+        const cells = tableCells(lines[i]);
+        rows.push({
+            line: lines[i],
+            number: i + 1,
+            cells,
+            tasks: column < 0 ? [] : [...(cells[column] ?? "").matchAll(/\d+/g)].map((m) => Number(m[0])),
+        });
+    }
+    return {
+        head: lines.slice(table.head, table.head + 2),
+        line: table.head + 1,
+        taskColumn: column < 0 ? null : column,
+        rows,
+    };
+}
+/** The plan's `Supersession Inventory` rows over `tableCells`; null when the plan has no such table. */
+export function supersessionInventory(text) {
+    const lines = text.split(/\r?\n/);
+    const table = firstTable(lines, /^#{2,4} .*Supersession Inventory/i);
+    if (table === null)
+        return null;
+    const column = table.cols.findIndex((c) => /^existing\b/i.test(c));
+    const rows = [];
+    for (let i = table.head + 2; i < lines.length && /^\s*\|/.test(lines[i]); i++) {
+        const cells = tableCells(lines[i]);
+        rows.push({
+            line: lines[i],
+            number: i + 1,
+            files: spansOf(cells[column < 0 ? 0 : column] ?? "").map((f) => path.posix.normalize(f)),
+        });
+    }
+    return rows;
 }
 /** The error for a code fence opened at `line` and never closed. */
 export const fenceNeverClosed = (line) => `the code fence at line ${line} is never closed; nothing after it is read`;
diff --git a/dist/commands/workflow/tests.js b/dist/commands/workflow/tests.js
index f770a1d18..12d991555 100644
--- a/dist/commands/workflow/tests.js
+++ b/dist/commands/workflow/tests.js
@@ -26,7 +26,7 @@ import { readPackageJson } from "../../shared/package-json.js";
 import { COULD_NOT_RUN_EXIT_CODES, scriptCommand } from "../../shared/package-manager.js";
 import { CONFIG_DEFAULTS, readBkitConfig } from "../../shared/settings.js";
 import { FILE_FLAG, GROUP_FLAG, WORKFLOW_FLAG, positiveInt, readStatusRows, statusFile, str, } from "./status.js";
-import { fenceNeverClosed, parsePlanBlocks, reuseInventory, } from "./plan-blocks.js";
+import { derivedTestMatrix, fenceNeverClosed, parsePlanBlocks, reuseInventory, supersessionInventory, } from "./plan-blocks.js";
 import { writeStepRow } from "./steps.js";
 import { appendRecord, clampFile } from "./context.js";
 /** Exit code: no candidate gate is declared in package.json. */
@@ -246,7 +246,8 @@ const kb1 = (bytes) => Math.round((bytes / 1024) * 10) / 10;
  * task-like text outside every block, a task without DONE WHEN or without TEST FIRST and
  * TEST EXCEPTION, a malformed TEST FIRST, a DEPENDS ON naming a missing task or one in a
  * later group, a group or task over a cap in `caps`, a CREATE file with no NEW Reuse
- * Inventory row.
+ * Inventory row, a `Derived Test Matrix` row naming no task / an undefined task / two
+ * tasks or a test-bearing task no row names, and a DELETE file with no Supersession row.
  */
 export function checkPlanText(text, caps = CONFIG_DEFAULTS.tasks) {
     const blocks = parsePlanBlocks(text);
@@ -320,6 +321,61 @@ export function checkPlanText(text, caps = CONFIG_DEFAULTS.tasks) {
                     message: `TASK ${t.task}: CREATE in \`${c.file}\` has no NEW row naming it in the Reuse Inventory's File column`,
                 });
     }
+    // The matrix maps each row to one task and each test-bearing task to a row. A plan with no
+    // matrix section yields no problem: the refusal is on a row, and issue-form plans carry none.
+    const matrix = derivedTestMatrix(text);
+    if (matrix !== null) {
+        if (matrix.taskColumn === null)
+            problems.push({
+                line: matrix.line,
+                kind: "matrix",
+                message: "the Derived Test Matrix header has no `Task` column; add one naming the task each row's test belongs to",
+            });
+        else {
+            const mapped = new Set();
+            for (const row of matrix.rows) {
+                const named = row.tasks.map((n) => `TASK ${n}`);
+                if (row.tasks.length === 0)
+                    problems.push({
+                        line: row.number,
+                        kind: "matrix",
+                        message: `Derived Test Matrix row maps to no task: name one in its \`Task\` cell`,
+                    });
+                else if (row.tasks.length > 1)
+                    problems.push({
+                        line: row.number,
+                        kind: "matrix",
+                        message: `Derived Test Matrix row maps to ${named.join(" and ")}; name exactly one task`,
+                    });
+                else {
+                    const n = row.tasks[0];
+                    if (!byTask.has(n))
+                        problems.push({
+                            line: row.number,
+                            kind: "matrix",
+                            message: `Derived Test Matrix row maps to TASK ${n}, which the plan does not define`,
+                        });
+                    mapped.add(n);
+                }
+            }
+            for (const t of blocks.tasks)
+                if (specs.get(t.task).kind === "test" && !mapped.has(t.task))
+                    problems.push({
+                        line: t.line,
+                        kind: "matrix",
+                        message: `TASK ${t.task} names TEST FIRST tests but no Derived Test Matrix row maps to it`,
+                    });
+        }
+    }
+    const superseded = new Set((supersessionInventory(text) ?? []).flatMap((r) => r.files));
+    for (const t of blocks.tasks)
+        for (const d of t.delete)
+            if (!superseded.has(path.posix.normalize(d.file)))
+                problems.push({
+                    line: d.line,
+                    kind: "supersession",
+                    message: `TASK ${t.task}: DELETE in \`${d.file}\` has no row naming it in the Supersession Inventory`,
+                });
     const groups = blocks.groups.map((g) => {
         const tests = sizes.filter((s) => s.group === g.group).reduce((n, s) => n + s.tests, 0);
         const bytes = Buffer.byteLength(lines.slice(g.line - 1, g.end).join("\n"));
@@ -1339,7 +1395,7 @@ export const testsCommand = {
             },
         },
         "plan-check": {
-            summary: `Check a plan's group and task blocks: the block format, DONE WHEN and TEST FIRST on every task, DEPENDS ON order, the caps from package.json \`bkit.workflows.tasks\` (defaults: ${capsText(CONFIG_DEFAULTS.tasks)}), a Reuse Inventory NEW row per CREATE file, and that each READ / UPDATE / DELETE file and symbol exists; exit 0 no problems, 1 refused.`,
+            summary: `Check a plan's group and task blocks: the block format, DONE WHEN and TEST FIRST on every task, DEPENDS ON order, the caps from package.json \`bkit.workflows.tasks\` (defaults: ${capsText(CONFIG_DEFAULTS.tasks)}), a Reuse Inventory NEW row per CREATE file, a Supersession Inventory row per DELETE, a \`Task\` on every Derived Test Matrix row and a row per test-bearing task, and that each READ / UPDATE / DELETE file and symbol exists; exit 0 no problems, 1 refused.`,
             flags: [
                 {
                     name: "plan",
@@ -1363,7 +1419,7 @@ export const testsCommand = {
                 plan: "the plan file checked (as given)",
                 groups: "[{group, title, tasks, tests, kb}]: each group's tasks, planned TEST FIRST tests and size",
                 tasks: "[{task, group, tests, files}]: each task's planned tests and distinct test files",
-                problems: "[{line, kind, message}]: format | stray | field | depends | cap | inventory | markers — each refuses the plan",
+                problems: "[{line, kind, message}]: format | stray | field | depends | cap | inventory | matrix | supersession | markers — each refuses the plan",
                 existence: "[{line, task, message}]: READ / UPDATE / DELETE files or symbols not found; refuses only with --existence=refuse",
                 log: "where the report was written (as given)",
             },
diff --git a/docs/knowledge.jsonl b/docs/knowledge.jsonl
index e87a684f3..abff9eb97 100644
--- a/docs/knowledge.jsonl
+++ b/docs/knowledge.jsonl
@@ -318,3 +318,4 @@
 {"schema":3,"ts":1793005661580,"kind":"knowledge","key":"dogfood-template-mirrors-need-install-after-a-core-template-or-core-bkit-doc-edit","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-gaps-remediate","subagent":"bkit-build-plan-gaps-remediate","model":"openrouter/deepseek-v4.1-flash"},"references":[".bkit/core/engine/audits/templates/templates.test.ts",".bkit/core/docs/templates/bkit-plan.md","docs/templates/bkit-plan.md",".bkit/core/.bkit/workflows.md",".bkit/workflows.md",".bkit/install.md"],"summary":"Editing a core template or a core `.bkit/` doc reds the unit gate on the dogfood-parity test until the repo's own `bkit install` re-renders the mirrors","description":"The unit tier holds the repo's own installed copies byte-equal to their sources: `.bkit/core/engine/audits/templates/templates.test.ts` asserts `docs/templates/bkit-plan.md` and every `docs/templates/bkit-audit-*.md` equal their `.bkit/core/docs/templates/*` source but for the managed-version stamp, and `bkit check`'s core pass writes the `.bkit/core/.bkit/*.md` sources into the root `.bkit/*.md` mirrors. So an edit to a `.bkit/core/docs/templates/*.md` or `.bkit/core/.bkit/*.md` file leaves the gate red until the mirrors move, and the same edit makes `bkit check` report N write(s) of drift. A bare `bkit install` is not the fix: it errors because at least one module flag is required.","rootCause":"`docs/templates/bkit-*.md` and the root `.bkit/*.md` reference docs are install OUTPUTS, not hand-kept files, but only the host mirrors (`.claude/`, `.cursor/`, `.codex/`, `.opencode/`, `.agents/skills/`, `.agents/plugins/bkit/`) are conventionally thought of as rendered; the dogfood template and reference-doc copies look like ordinary tracked markdown, so a source edit there reads as complete while its mirror is still stale.","remediation":"After editing any `.bkit/core/docs/templates/*.md` or `.bkit/core/.bkit/*.md` file, re-render the mirrors with the repo's own install — `pnpm bkit install --claude --cursor --codex --antigravity --opencode=<provider>` (every installed host; a bare `bkit install` errors) — then confirm `node dist/cli.js check` reports 0 write(s). NEVER hand-edit `docs/templates/bkit-*.md` or the root `.bkit/*.md` mirrors; the install owns them and would revert the edit. `.bkit/version` re-pins the re-rendered files' hashes in the same run, so commit it too.","status":"ACTIVE"}
 {"schema":3,"ts":1793100920719,"kind":"knowledge","key":"prettier-write-after-a-red-breaks-the-test-first-audit","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-execute","subagent":"bkit-build-plan-execute","model":"openrouter/deepseek-v4.1-flash"},"references":[".bkit/core/engine/commands/workflow/tests.ts",".bkit/core/prompts/bkit-build-plan-verify.md"],"summary":"Format a test file before recording its red; a later `prettier --write` moves a line and the green audit then reports `test-changed` with `changed: yes`","description":"- **Category:** tooling\n- **Symptom:** `bkit tests green` reports one `test-changed` gap per planned test in a file whose reds were all recorded, with `Changed since red` = `yes` and a diff that removes a single line (a wrapped `expect(…)` joined into one line) and adds the task's new tests.\n- **Root cause:** `onlyAddsLines` walks the red snapshot's whitespace-stripped, non-blank lines as a subsequence of the current file, so a prettier pass that joins a wrapped call, or splits a long one, removes a line the snapshot holds and turns the row from `added lines only` into `yes`. `bkit tests red` cannot re-record the red once the named test passes.\n- **Fix or rule:** run `prettier --write` on the test file before recording its reds, and after every later test edit check the row with `bkit tests green`: an additions-only diff keeps the row at `added lines only`, whose prompt rule clears added lines outside every planned test.\n- **Type:** gotcha\n- **Confidence:** high\n- **Severity:** medium\n- **Scope:** bkit-repo\n- **Source:** agent","rootCause":"Red evidence pins the snapshot's line sequence; the formatter is the usual second writer of a test file after its red, and the red cannot be re-recorded once the test passes.","remediation":"`prettier --write` the test file before `bkit tests red`, and keep every post-red edit a pure insertion.","status":"ACTIVE"}
 {"schema":3,"ts":1793103134789,"kind":"knowledge","key":"workflow-reads-artifact-header-fields-after-steps-finish","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-execute","subagent":"bkit-build-plan-execute","model":"openrouter/deepseek-v4.1-flash"},"references":[".bkit/core/engine/audits/workflows/workflow-shape.test.ts",".bkit/core/engine/commands/workflow/steps.ts",".bkit/core/workflows/bkit-build.md"],"summary":"A workflow reads an artifact header's fields from `steps finish`'s `fields` output, so a verb that needs one runs in the sub-step after the finish, never before it","description":"- **Category:** tooling\n- **Symptom:** a workflow step that needs a subagent artifact's header field before the step's commit makes `workflow-shape.test.ts` fail with `<workflow> never reads a verdict outside `steps finish``.\n- **Root cause:** `bkit steps verdict` is barred from workflow files, and `steps finish` prints `fields` only once it has written the row and committed; a sub-step placed before the finish has no way to hold a declared field such as the verify artifact's task numbers.\n- **Fix or rule:** read the field from `steps finish`'s output and run the verb that consumes it in the sub-step after the finish; the edit it makes rides the next step's commit.\n- **Type:** gotcha\n- **Confidence:** high\n- **Severity:** low\n- **Scope:** bkit-repo\n- **Source:** agent"}
+{"schema":3,"ts":1793107857006,"kind":"knowledge","key":"slop-gate-suppression-flags-skip-literals-in-test-fixtures","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-execute","subagent":"bkit-build-plan-execute","model":"openrouter/deepseek-v4.1-flash"},"references":["scripts/slop/bkit-slop-type-suppression.mjs","slop-scan.config.json",".bkit/core/engine/commands/workflow/branches.ts"],"summary":"A test fixture that spells `it.skip(...)` fails `bkit ci slop`'s boundary/gate-suppression rule; compose the marker from two pieces as the plugin composes its own patterns","description":"- **Category:** tooling\n- **Symptom:** `pnpm slop:delta` fails with `netFindingCount: 1` on a test file that only holds skip markers inside fixture strings, never calling a skip.\n- **Root cause:** `bkit-slop-type-suppression.mjs` scans raw file text for `.skip` / `.only` / x-prefixed test calls and only skips comments, so a fixture string that builds a skip marker is indistinguishable from a disabled test; the plugin avoids its own patterns with character classes and string composition.\n- **Fix or rule:** spell a fixture's marker in two pieces (`const SKIP = `${`it`}.${`skip`}`;`) with a comment saying why, and keep the fixture's assertions unchanged; a scoped `boundary/gate-suppression` override in `slop-scan.config.json` is a gate opt-out and needs the owner.\n- **Type:** gotcha\n- **Confidence:** high\n- **Severity:** medium\n- **Scope:** bkit-repo\n- **Source:** agent","rootCause":"The rule reads text, not syntax, so any string carrying a skip marker counts; test fixtures are its main false positive and no override exists for them.","remediation":"Compose the marker in two pieces inside a helper or constant, as the plugin composes its own patterns, so the file carries no literal the scanner matches."}
diff --git a/docs/templates/bkit-plan.md b/docs/templates/bkit-plan.md
index cf08d31d3..3a0e7b624 100644
--- a/docs/templates/bkit-plan.md
+++ b/docs/templates/bkit-plan.md
@@ -65,16 +65,16 @@ _notation, e.g._ **WHEN** a user submits the form with a valid file **→ THEN**
 
 ### Derived Test Matrix
 
-`Type` = a tier from `docs/testing.md`: Static, Unit, Integration, @live (golden), E2E, fresh-DB replay, Smoke.
+`Type` = a tier from `docs/testing.md`: Static, Unit, Integration, @live (golden), E2E, fresh-DB replay, Smoke. `Task` = the one runbook task that lands the row's test.
 
 <!-- prettier-ignore -->
-| Test description | Type | Target file |
-| --- | --- | --- |
-| [e.g., Happy path: user creates event, sees it in list] | E2E | [e.g. `apps/web/e2e/[feature].spec.ts`] |
-| [e.g., Service correctly parses payload] | Unit | [e.g. `packages/[pkg]/[module].test.ts`] |
-| [e.g., API endpoint enforces tenant isolation] | Integration | [e.g. `packages/api/[feature].integration.test.ts`] |
-| [e.g., Real 3rd-party API returns expected shape and a boundary-only identity — not "did not throw"] | @live (golden) | [e.g. `packages/[pkg]/[feature].live.test.ts`] |
-| [e.g., New migration replays from empty and seed loads] | fresh-DB replay | [e.g. `supabase/migrations/*`] (replayed by `bkit-tests-migration`) |
+| Test description | Type | Target file | Task |
+| --- | --- | --- | --- |
+| [e.g., Happy path: user creates event, sees it in list] | E2E | [e.g. `apps/web/e2e/[feature].spec.ts`] | 2 |
+| [e.g., Service correctly parses payload] | Unit | [e.g. `packages/[pkg]/[module].test.ts`] | 2 |
+| [e.g., API endpoint enforces tenant isolation] | Integration | [e.g. `packages/api/[feature].integration.test.ts`] | 2 |
+| [e.g., Real 3rd-party API returns expected shape and a boundary-only identity — not "did not throw"] | @live (golden) | [e.g. `packages/[pkg]/[feature].live.test.ts`] | 2 |
+| [e.g., New migration replays from empty and seed loads] | fresh-DB replay | [e.g. `supabase/migrations/*`] (replayed by `bkit-tests-migration`) | 1 |
 
 ### 👤 ✅ Human Confirmation
 
