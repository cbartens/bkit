Verdict: CONCERNS
Failures: 6
Redesign: false
Fingerprint: 49ec4e59a633d86182d1b6c682b80de75d747e75565c31abbcc01127255c405b
<!-- verdict:end -->

# Plan Scope Check

Lens: Scope audit — scope, criteria, verification.

Plan: `docs/plans/202611/logs/958-agents-orchestrator-write/plan-v1-draft.md`. Supplied plan-check findings: none (`plan-generate-check.md` reports `Problems: 0`, `Existence: 0`). Related issues search unavailable; related deferrals and failures: none. Every section `docs/templates/bkit-plan.md` mandates is present and filled in. Ledger keys on the `**Ledger rows:**` line exist (`docs/decisions.jsonl:962-970`, `docs/deferrals.jsonl:510-511`). No task scopes an edit inside a `bkit:start` / `bkit:end` block. Both `Out of Scope` rows are `Exempt` (issue non-goals) with matching deferral rows.

## CRITICAL

- (plan edit) `plan-v1-draft.md:728` — Task 8 `DONE WHEN` cannot be met: `grep -rn 'renderResult\|result-file\|Fingerprint' .bkit/core/engine --include='*.ts'` "finds only the guard tests", but `Fingerprint` also matches unrelated live symbols that this plan keeps: `worktreeFingerprint` (`.bkit/core/engine/commands/lib.ts:674`, `status.ts:36`), `egressFingerprint` (`.bkit/core/engine/install/cloud-env.ts:657`, `network-allowlist.ts:9`), `chatFingerprint` (`.bkit/core/engine/commands/workflow/run-facts.ts:331`) and `detectCloudBootstrapFingerprintMissing` (`.bkit/core/engine/checks/before/files.ts:156`). Narrow the pattern to the removed names and scope it to `.bkit/core/engine/commands/workflow/`.
- (plan edit) `plan-v1-draft.md:857` — Task 15 `DONE WHEN` cannot be met: its grep for `error.md` must print nothing, but the paths Task 14 introduces (`{LOG_DIR}/{workflow}-error.md`, `ship-error.md`, `.worktrees/bkit-error-auto.md`) all contain `error.md`. Grep for the removed strings instead (`{OUTBOX_ROOT}/error.md`, `{OUTBOX}/stderr.log`).
- (plan edit) `plan-v1-draft.md:834` — Task 14's scope misses the `workflows fail` command lines. The clause `workflow-error-file` (`.bkit/instructions.md:5756`) carries only the prose; each workflow's Failure Path bash names `--error-file="{OUTBOX_ROOT}/error.md"` directly, outside any clause (e.g. `.bkit/core/workflows/bkit-build.md:125`, `.bkit/core/workflows/bkit-ship.md:97`; 2 hits each in six workflows). `instructions:sync` does not reach them, so Task 14's own test stays red. Add one `UPDATE` line per workflow for its command line.
- (plan edit) `plan-v1-draft.md:612` — Tasks 4, 13 and 14 change five workflows, which breaks the render baselines `.bkit/core/engine/render/__snapshots__/bkit-{plan,design,build,debug,ship}.none.txt` checked by `.bkit/core/engine/render/trackers.test.ts:417`. No task names regenerating them. Add the refresh to each task's `UPDATE` and `DONE WHEN` (not as `TEST FIRST`).
- (plan edit) `plan-v1-draft.md:554` — The #1016 item 1 guard has no verification. `Context & Goals` (`:29`) and `Derived Test Matrix` row 3 (`:119`) promise a test that every header line of a result prompt parses through `promptHeader`, but Task 1 names only the count-rule test. Add the header-parse test to Task 1, failing on the `Strategy` field in `bkit-debug-failure-diagnose.md`.
- (plan edit) `plan-v1-draft.md:365` — Two `Reuse Inventory` `EXTEND` rows are untraced: `verdict-vocabulary.test.ts` (`:365`) and `workflow-shape.test.ts` (`:366`) have runbook tasks but no `[MODIFY]` entry in `Architecture & Component Changes`.

## OPTIONAL

- `plan-v1-draft.md:126` / `:638` — Matrix row "empty severity or an unknown key" is half landed: Task 5 tests only the unknown key.
- `plan-v1-draft.md:139` / `:789` — Matrix row "recommends Try again or Decide" lands only the Decide case.
- Edge Cases with no matrix row or test: `## CRITICAL` says `None` (`:96`); challenge `CONCERNS` with a `CRITICAL` block (`:561`); audit report with no findings (`:100`); decision pause with no loop (`:101`); `Status` computed from merged items (`:754`).
- Success Criterion 2 rests on the `workflow-finish` clause edit (`:608`); no static check asserts the exit-6 route is the re-ask, not the Failure Path.
- Tasks 1, 5 and 9 edit engine `.ts` but their `DONE WHEN` omits `pnpm build` / `dist/` (`:550`, `:635`, `:757`).
- `.bkit/core/prompts/bkit-ship-deferred-sweep.md:117` also declares `Failures: <integer >= 0>`; say whether it stays a plain integer on purpose (Breaking Changes `:169`).
- `Documentation Updates` (`:499`) says eight ledger rows; the line lists ten, and `docs/deferrals.jsonl` has no row there.
- No `Reuse Inventory` row for the `template-shape.test.ts` guard (Task 7, `:696`).
- Task 14 relies on the Failure Path commit carrying the log-folder error file (Q5, `:213`) with no check.
- Open questions: Q4, Q5 and Q7 lead with identifiers before the plain-English decision; numbering runs Q1-Q5, Q8, Q6, Q7.
- `.bkit/core/engine/commands/workflow/decisions.ts:1` header comment names `decisions compose`; Task 13 should update it.

## OUT OF SCOPE

- The orchestrator's other file-tool writes under `.git/bkit-outbox/` (`bkit-plan.md:541`, `bkit-design.md:635`, `bkit-debug.md:370`, `bkit-audit-generate.md:242`) are not shell writes, so the issue's criterion does not require them; a follow-up should confirm whether file-tool writes into `.git/` also prompt in auto mode.

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** (plan edit) Task 8 DONE WHEN grep for Fingerprint matches unrelated live engine symbols
  **Severity:** CRITICAL · **Fixable:** true · **Location:** `docs/plans/202611/logs/958-agents-orchestrator-write/plan-v1-draft.md:728` · **Round:** 1
  - **DONE WHEN:** Task 8 DONE WHEN greps only the removed names (FINGERPRINT, artifactFingerprint, fingerprintProblem, withFingerprint, fingerprintOf, --result-file, renderResult) under .bkit/core/engine/commands/workflow/, so worktreeFingerprint (lib.ts:674), egressFingerprint (cloud-env.ts:657), chatFingerprint (run-facts.ts:331) and detectCloudBootstrapFingerprintMissing (files.ts:156) no longer match
  - **TEST FIRST:**
<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->
- [ ] **TASK 2:** (plan edit) Task 15 DONE WHEN grep for error.md matches the new error-file paths
  **Severity:** CRITICAL · **Fixable:** true · **Location:** `docs/plans/202611/logs/958-agents-orchestrator-write/plan-v1-draft.md:857` · **Round:** 1
  - **DONE WHEN:** Task 15 DONE WHEN greps for the removed strings {OUTBOX_ROOT}/error.md and {OUTBOX}/stderr.log instead of the bare error.md, which every new path ({workflow}-error.md, ship-error.md, bkit-error-auto.md) contains
  - **TEST FIRST:**
<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->
- [ ] **TASK 3:** (plan edit) Task 14 omits the workflows fail --error-file command lines, which no clause carries
  **Severity:** CRITICAL · **Fixable:** true · **Location:** `docs/plans/202611/logs/958-agents-orchestrator-write/plan-v1-draft.md:834` · **Round:** 1
  - **DONE WHEN:** Task 14 has an UPDATE line per workflow (bkit-plan, bkit-design, bkit-build, bkit-debug, bkit-ship, bkit-auto) for its workflows fail --error-file/--stderr-file command line (e.g. bkit-build.md:125, bkit-ship.md:97), since instructions:sync only reaches the workflow-error-file clause at .bkit/instructions.md:5756
  - **TEST FIRST:**
<!-- bkit:task 3 end -->

<!-- bkit:task 4 start -->
- [ ] **TASK 4:** (plan edit) Tasks 4, 13 and 14 break the render baselines and no task updates them
  **Severity:** CRITICAL · **Fixable:** true · **Location:** `docs/plans/202611/logs/958-agents-orchestrator-write/plan-v1-draft.md:612` · **Round:** 1
  - **DONE WHEN:** Tasks 4, 13 and 14 each name refreshing .bkit/core/engine/render/__snapshots__/bkit-{plan,design,build,debug,ship}.none.txt in UPDATE and .bkit/core/engine/render/trackers.test.ts passing in DONE WHEN (not as TEST FIRST)
  - **TEST FIRST:**
<!-- bkit:task 4 end -->

<!-- bkit:task 5 start -->
- [ ] **TASK 5:** (plan edit) The #1016 item 1 header-parse guard has no named test
  **Severity:** CRITICAL · **Fixable:** true · **Location:** `docs/plans/202611/logs/958-agents-orchestrator-write/plan-v1-draft.md:554` · **Round:** 1
  - **DONE WHEN:** Task 1 TEST FIRST names a verdict-vocabulary.test.ts test that every header line of a result prompt parses through promptHeader, failing on the Strategy field of bkit-debug-failure-diagnose.md, matching Derived Test Matrix row 3 and Context & Goals line 29
  - **TEST FIRST:**
<!-- bkit:task 5 end -->

<!-- bkit:task 6 start -->
- [ ] **TASK 6:** (plan edit) Two Reuse Inventory EXTEND rows have no [MODIFY] entry in Architecture & Component Changes
  **Severity:** CRITICAL · **Fixable:** true · **Location:** `docs/plans/202611/logs/958-agents-orchestrator-write/plan-v1-draft.md:365` · **Round:** 1
  - **DONE WHEN:** Architecture & Component Changes has [MODIFY] entries for .bkit/core/engine/audits/workflows/verdict-vocabulary.test.ts and .bkit/core/engine/audits/workflows/workflow-shape.test.ts, tracing Reuse Inventory rows at lines 365 and 366
  - **TEST FIRST:**
<!-- bkit:task 6 end -->
