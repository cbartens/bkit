Verdict: PASS
Failures: 0

<!-- verdict:end -->

# Plan Scope Check

Audit target: `docs/plans/logs/bar-155-workflow-friction-optimisation/plan-v2-reviewed.md`

Audit scope: template-section completeness, test-matrix ↔ runbook 1:1 mapping, scope-item build+verification coverage, supersession-inventory mirroring (Architecture `[DELETE]` + Runbook removal task), gap/edge-case identification.

## CRITICAL

None.

Verification:

1. **Template sections present:** Context & Goals, Acceptance Scenario (Narrative, Success Criteria, Concrete Example, Edge Cases, Derived Test Matrix, Human Confirmation), Breaking Changes & Naming Review, Alternative Approaches, Out of Scope, Merge Method, Supersession Inventory, Security & Privacy, Pre-Flight, Data Schema (None/None — explicit), Architecture & Component Changes, Documentation Updates, Rollback Strategy, Agent Execution Runbook (Tasks 1–15 + Gate 2/3/4), Verification Plan (Automated + Manual), Linear / Plan Lifecycle.
2. **Test matrix ↔ Runbook bidirectional 1:1 (16 rows):** All matrix rows resolve to a runbook task (T1+T2 freeform-stub-first; T7 multi-issue gate, task-count gate, scoped-detection; T8 long-branch advisory, parallel pair, reconcile step, renumber, counter lifecycle; T9 ship rebase Failure Path; T10 prompts.md sync; T11 workflows.md sync; T12 friction.md; T13 ADR + pending; T14 mirror regen; T15 cross-cutting Grep + ladder no-`BLOCK`/`WARN`). No matrix row is orphaned; no implementation task lacks a matrix row.
3. **Scope item ⇒ build + verification:** Each Fix (1b, 2, 3, 4a/b/c/d, 5, 6) has at least one build task (T1–T13) plus a verification (T14–T15 + Manual Verification steps 1–10).
4. **Supersession Inventory:** 4 DELETE rows. Each mirrored:
   - `bkit-build-challenge.md` → Architecture `[DELETE]` block (`#### [DELETE] .agents/prompts/bkit-build-challenge.md`) + Runbook Task 6 (`rm` + `git status`).
   - `bkit-build.md` Step 9 single-agent invocation → in-file rewrite documented in Architecture `[MODIFY] .agents/workflows/bkit-build.md` Change 2 + Runbook Task 8.
   - `bkit-ship.md` Step 2 `exit 1` line → in-file rewrite documented in Architecture `[MODIFY] .agents/workflows/bkit-ship.md` + Runbook Task 9.
   - `.agents/prompts.md` row `bkit-build-challenge` → Architecture `[MODIFY] .agents/prompts.md` (DROP row) + Runbook Task 10.
5. **No `RETAIN-WITH-REASON` rows** — all 4 are DELETE per template default.
6. **Self-consistency on the 15-task gate:** Plan ships a >15-task SPLIT gate (Fix 2) and itself contains exactly 15 numbered runbook tasks; gate would not block its own plan.
7. **Counter lifecycle traced:** `CHALLENGE_REMEDIATE_ATTEMPT` lifecycle through Step 9 → 10 → 11 → 12 → re-Step 9 explicitly walked in Architecture and Runbook Task 8 (init/read-only/increment/persist semantics preserved).
8. **Failure-Path wiring for rebase abort:** Step 2 sentinel + Failure Path Step 4 condition broadened to include rebase sentinel; `MAX_*_ATTEMPT` `[ -n "${VAR:-}" ]` guards specified to avoid false-evaluation when unset.

## OPTIONAL

1. **Task 15 Grep regex `Step 1[0-7]`** — comment says "matches only legitimate Step 10–17 references in the renumbered scheme" but post-renumber legitimate range is 10–18 (Close Workflow). Regex `Step 1[0-7]` would not catch a stale `Step 18` reference if any survived. Suggest broadening to `Step 1[0-9]` and verifying against renumber-table allowlist, or anchoring the check to the explicit forward-jump remap table walked row-by-row (already mentioned in Task 8). Minor — Task 8 row-by-row remap walk is the actual integrity check; Task 15 grep is a sanity belt-and-braces.
2. **Edge case "bkit install partial failure"** is documented in Edge Cases table with a recovery procedure, but no Runbook task explicitly verifies post-install mirror integrity beyond Task 14's existence/diff check. Consider adding (in Task 14 or as a sub-bullet) `diff -r .agents/prompts/ .claude/agents/` parity check on the three new files to catch silent T1 transform regressions.
3. **`bkit-build-challenge-tests.md` Process step slot** — Task 1 says to locate the slot since "Process layout differs". Plan acknowledges uncertainty; if the slot turns out to be missing, Task 2 has no fallback instruction (e.g. "if no compatible Process step exists, halt + ADR"). Consider adding an explicit halt-condition.
4. **Reconciler maxTurns reduction (50 → 30)** is justified in Architecture but not test-verified. Could add a Manual Verification step `Grep "maxTurns: 30" .agents/prompts/bkit-build-challenge-reconcile.md` — single hit, to lock the budget decision in.
5. **`prompts.md` § Models column-2 placeholder** (`<canonical column-2 value matching sibling -1 rows>`) — Task 10 instructs runbook executor to re-read the canonical value. Consider pre-resolving in this plan to remove the indirection (one less inference at execution time). Optional; doesn't block scope.
6. **Audit-pass classification record (Task 3)** — outcome of "(a) freeform multi-finding vs (b) stubbed verdict-bearing" classification will live only in commit message. Consider persisting to `docs/plans/logs/{FID}/` as an artifact for future auditors.

## OUT OF SCOPE

1. **Retrofit `bkit-design-review-*` / `bkit-plan-review-*` with explicit model/thinking-mode diversity** — already verified Opus/high vs Sonnet/medium per Alternatives Rejected; future health check could codify the invariant in `bkit-utility-audit-codebase`.
2. **`task-range` parameter for `bkit-build-plan-execute`** — captured in `docs/pending.md` per Task 13; revisit if 15-task SPLIT gate proves insufficient.
3. **KN/DE auto-renumber on rebase conflicts** — captured in `docs/pending.md`; deferred per stability concerns (sed/regex cross-platform fragility).
4. **Focused-brief mode for challenge** — captured in `docs/pending.md`; deferred per "diversity > narrowing" ADR.
5. **`bkit-build.md` Step 2 same `git rebase || exit 1` anti-pattern carry-over** — captured in `docs/pending.md` for follow-up issue (Linear-issue-scoped to ship Fix 5 only).
6. **2-week post-merge calibration of 15-task cap** — Linear issue notes 18 = highest clean / 20 = lowest dirty; future re-evaluation noted in Alternative Approaches.
7. **Structured `severity-rationale` field in reconciler** — only if downgrade-with-justification path gets used in practice.
