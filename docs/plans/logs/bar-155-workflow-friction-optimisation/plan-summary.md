Verdict: CONCERNS

<!-- verdict:end -->

# Plan Summary

## Overview

BAR-155 is a bkit-repo-internal tooling maintenance plan addressing recurring workflow friction across six distinct failure modes discovered 2026-05-06 → 2026-05-08:
1. Freeform review agents budget-exhaust → silent `Verdict: PENDING` logs (BAR-141, BAR-93, BAR-132)
2. `bkit-plan-generate` stream-times-out on 32KB multi-issue input with no artifact
3. Single-reviewer `bkit-build-challenge` has same-model blind spots (inconsistent with parallel-pair reviewers)
4. `bkit-ship` rebase abort exits via bare `exit 1`, bypasses Failure Path handover logic
5. Builds emit no signal of branch drift until ship-time rebase pain
6. Task-count and multi-issue inputs lack deterministic gates

The plan prescribes six fixes (1b, 2, 3, 4a–d, 5, 6) to `.agents/prompts/`, `.agents/workflows/`, and index docs (`.agents/prompts.md`, `.agents/workflows.md`, `.agents/friction.md`). No design work; no database/API/env-var changes. All 15 runbook tasks fit under the plan's own ≤15-task gate.

Plan-v3-checked has `Verdict: CONCERNS` at file header. Status.json shows `apply-scope` step issued `CONCERNS` verdict; prior `apply-review` step was `PASS`. Acceptance Scenario and Breaking Changes sections both carry human confirmation checkboxes (`[x]` checked).

## Plan Quality

**Scope:** Well-defined and tightly bounded. Six fixes map 1:1 to Linear issue § Suggested Fixes. Each fix has a concrete success criterion (SC-1 through SC-5) and explicit test matrix row.

**Dependencies:** Explicit — BAR-137 parent fix (stub-first pattern) shipped 2026-05-05. No new dependencies on packages/APIs.

**Gates:** Three explicit gates present:
- Gate 1: Acceptance Scenario + Breaking Changes (both human-confirmed `[x]`)
- Gate 2: Code Implementation Check (15 runbook tasks)
- Gate 3: Testing & Documentation (verbatim `Grep` checks, manual workflow trace)
- Gate 4: Automated Verification (markdown lint, `bkit install` exit code)

**Risk mitigation:** Edge cases table (11 scenarios) explicitly handles boundary conditions (task count = 15, reconciler verdict divergence, branch 0 commits behind, partial parallel-pair failures, `bkit install` partial failure, rebase abort mid-conflict). Rollback strategy is single `git revert {SQUASH_SHA}` with mirror regeneration.

**Authoring compliance:** Plan correctly references `.agents/prompts/*.md` (not `.agents/agents/*`, which is obsolete terminology per plan § Path note). Cites verbatim source locations for existing `echo >>` pattern and all precedent templates (`bkit-design-review-*`, `bkit-plan-review-*`, `bkit-design-update.md`). No `bkit:start/end` block edits (confirmed Out of Scope); no consumer-repo changes.

## Completeness

**Artifact coverage:** Plan specifies THREE new agents (bkit-build-challenge-1, -2, -reconcile) + FIVE modified (bkit-plan.md, bkit-build.md, bkit-ship.md, bkit-plan-complexity-check.md, four utility-audit prompts via audit-pass Task 3) + ONE deletion (bkit-build-challenge.md) + FOUR index-doc syncs (prompts.md, workflows.md, friction.md, decisions.md + pending.md appends).

**Testing plan:** Verification Plan section prescribes 10 distinct manual verification steps (Grep on verbatim phrase, diff checks, workflow trace, parallel-pair-partial-failure edge case, rebase sentinel-file wiring) + 4 automated checks (markdown lint, `bkit install` exit 0, mirror diff scope, cross-cutting Grep on NO-leak terms like `REBASE_FAILED`, `BLOCK`/`WARN`). Test Matrix (13 rows) maps 1:1 to runbook tasks. **No automated test surface** — this is prompt/workflow-only; verification = manual trace + Grep per stated Testing Strategy § No automated tests.

**Documentation:** ADR required for parallel challenge + reconcile decision (Context / Decision / Alternatives Rejected / Consequences). Deferred items appended to docs/pending.md (task-range parameter, KN/DE auto-renumber, focused-brief mode, rebase || exit 1 anti-pattern carry-over). Friction-log 5 retained entries marked `FIXED-IN: BAR-155` (Status line only per log § Rules).

**Index maintenance:** `.agents/prompts.md` § Models table requires drop+add (bkit-build-challenge → three new rows). Effort tiers, Tool set patterns, maxTurns, Special Behaviors, and Stubbed output rows must be synced. `.agents/workflows.md` § Build Phase table same pattern. No `.agents/rules.md` bkit:start/end block edits (confirmed).

**Completeness verdict:** All required artifacts, tests, and docs have explicit tasks. No gaps identified. Runbook Task 15 includes comprehensive cross-cutting verification (ADR/pending appends, `Grep` on rejected mechanism variants, re-read of critical workflow sections).

## Acceptance Scenario

**Adheres to template spec:** Narrative clearly states success = deterministic Failure-Path artifacts (no silent `Verdict: PENDING`, no bare `exit 1`). Success Criteria column specifies five measurable outcomes (SC-1 through SC-5), each tied to concrete verification method (Grep, manual trace, dry-run). Acceptance Scenario section includes Narrative, Success Criteria, Edge Cases (11 rows with explicit expected behaviour), Derived Test Matrix (13 rows mapping to runbook tasks), and **Human Confirmation checkbox** `[x] Acceptance Scenario confirmed`.

**Edge case coverage:** Scope-check-2 introduced a reconciliation note (C-1) explicitly rejecting the `REBASE_FAILED=true` env-var mechanism in favour of sentinel-file `.rebase-failed`. Architecture § `[MODIFY]` `.agents/workflows/bkit-ship.md` confirms sentinel as canonical. Runbook Task 9 embeds C-1 reconciliation note explicitly: "Do NOT use `REBASE_FAILED` env-var pattern or `exit 42` exit-code pattern — those are explicitly rejected."

**Unchecked gates:** Both acceptance-scenario and breaking-changes checkboxes are CHECKED (`[x]`). Gate 1 Pre-Flight checkbox is **NOT** checked (`[ ]`). This is expected pre-review state (human confirms scenario; executor checks pre-flight). Per protocol: unchecked human-confirmation gates are NOT a downgrade trigger per contract § "Note unchecked human-confirmation gates as expected pre-review state, NOT a downgrade trigger".

## Design Alignment

**Input design vs plan:** Plan-input § Linear Issue clearly states this is a **follow-up to BAR-137**. BAR-137 shipped the stub-first verdict-artifact pattern for `bkit-build-plan-execute`. BAR-155 propagates that pattern (Fix 1b) to freeform agents (`bkit-build-plan-verify`, `bkit-build-challenge-tests`) and introduces complementary fixes (deterministic task/multi-issue gates, parallel-pair challenge, rebase abort routing). Narrative directly references the same friction-log entries and observed failure modes.

**No design doc:** There is NO `design-*.md` file in the logs directory. This is correct per Linear issue scoping: "No new design work. All changes are in `.agents/*` (canonical sources only)." The plan-input itself documents the observed friction modes and prescribed fixes verbatim from the Linear issue. Plan § Out of Scope confirms "No design doc needed — fixes are structural/prompt changes only, no architecture risk."

**Scope containment:** All proposed changes stay within `.agents/` (prompts, workflows, index docs, friction log). Explicitly out-of-scope: `.claude/` or `.cursor/` direct edits, `.agents/rules.md` `bkit:start/end` block, consumer-repo changes, telemetry, CI gates, KN/DE auto-renumber, opt-in flags for multi-issue input.

## Risks

**Unknowns & assumptions:**

1. **Utility audit-pass classification (Task 3):** Plan assumes 8 utility-audit agents exist and asks executor to classify each as (a) freeform multi-finding or (b) stubbed verdict-bearing. If any agent's structure is ambiguous or exhibits a hybrid pattern, Task 3 could stall. **Mitigation:** Task 3 explicitly says "persist classification record" so executor work is documented; fallback is "audit-pass surfaced zero (a)-classified files; no spot-fix edits applied."

2. **Parallel-pair circular-reasoning in `bkit-build-challenge-1/-2`:** Plan references `bkit-design-review-1.md` § Parallel line as a template. If that line does not exist or differs, -1/-2 frontmatter sync could diverge. **Mitigation:** Verification Plan Step 8 does a `diff` check between agent files and mirror files to catch drift; Task 10 explicit "use canonical column-2 value for sibling rows" guards against copy-paste artefacts.

3. **Tier-M maxTurns calibration (Task 10):** Plan assumes `prompts.md` § maxTurns table defines tier M = 30. If tier M is not 30 (or doesn't exist), reconciler frontmatter is miscategorised. **Mitigation:** Task 10 explicit O-4 instruction: "explicitly read the `§ maxTurns calibration` table and confirm tier M is defined as 30. If tier M is not 30, halt and adjust." Commit message must document verified tier-M definition.

4. **Scoped BAR-N detection false negatives:** awk pipeline counts only tokens inside `## Linear Issue:` heading section. If that heading is absent or malformed in a future plan-input, the gate could pass silently when it should fail. **Mitigation:** Task 7 O-3 input existence assertion: "before running dry-run, assert `[ -e docs/plans/logs/{FID}/plan-input.md ]`; fail Task 7 if absent." Dry-run verifies scoped grep on plan-input returns BAR_COUNT=1 (BAR-155 only, not 8+).

5. **CHALLENGE_REMEDIATE_ATTEMPT counter lifecycle across Step 9 → Step 10 → Step 11 → Step 12 re-run cycle:** Renumbering introduces four new step boundaries. If Step 12 (formerly 11) re-runs Step 9, counter must NOT reset. **Mitigation:** Task 8 explicit "Counter-lifecycle verification" sub-step traces init/read/increment/persist flow; Task 15 includes explicit "Re-run Step 9 on FAIL — counter persists, NOT reset" verification.

6. **Reconciler verdict/severity tie-break edge case:** Plan specifies max-wins on `FAIL > CONCERNS > PASS` for verdict and `CRITICAL > HIGH > MEDIUM > LOW` for findings. If a finding has same severity on both reviewers but different text, dedup heuristic triggers on root-cause cluster. Executor judgment call required. **Mitigation:** Task 5 (reconciler body design) explicitly states "Reconciler may downgrade only with explicit `## Justification` block." Downgrade path is explicit and auditable.

**Dependencies & assumptions:**

- BAR-137 parent fix already shipped (verified 2026-05-05).
- `.agents/docs.md` workflow matrix remains current (no structural doc changes expected).
- `bkit-design-update.md`, `bkit-design-review-1.md`, `bkit-plan-review-1.md` precedent files exist and are canonical (confirmed via Glob in plan-input).

**Mechanism risks:**

- **Single squash-merge PR:** All six fixes land atomically. If any fix creates a downstream dependency issue (e.g., orchestrator Step 10 references a prompt that wasn't created), the entire PR fails. **Mitigation:** Gate 1 pre-flight enforces "all Core items checked"; Gate 2 runs Task 1–15 sequentially; Gate 4 auto-checks markdown lint and `bkit install`.

- **Mirror regeneration at end-of-session:** If `bkit install` fails mid-session, executor must re-run before push. **Mitigation:** Task 14 explicit verification: `.claude/agents/*` files exist; `.cursor/commands/*` step numbers match (18 headers, no stale refs).

## Action Items

This plan carries `Verdict: CONCERNS` per prior scope-check-2 step in status.json. The note in the plan header states "Plan-v3-checked has `Verdict: CONCERNS` at file header." Re-reading the plan, uncovered reason: **no explicit revision items listed in the prior scope-check-2 or apply-review artifacts** are visible in this review session. 

The plan itself is **well-formed, comprehensive, and ready for execution**, with one caveat: **Gate 1 pre-flight checklist is unchecked** (the two human-confirmation checkboxes in Acceptance Scenario and Breaking Changes are `[x]`, but the Gate 1 final checkbox `[ ] Gate 1 - Verified: All Core items checked` is NOT). This is expected pre-review state per protocol.

**No revisions required** based on completeness, scope, or acceptance-scenario adherence. The CONCERNS verdict appears to be from a prior planning phase (apply-scope step) and has not been updated. 

**To proceed to execution:** Check Gate 1 final checkbox (`Gate 1 - Verified`) and begin Task 1 of Agent Execution Runbook (Phase A, Task 1: read echo >> verbatim source).

File paths for reference:
- Plan file: `/Users/christian/Documents/GitHub/bkit/.worktrees/bar-155-workflow-friction-optimisation/docs/plans/logs/bar-155-workflow-friction-optimisation/plan-v3-checked.md`
- Status file: `/Users/christian/Documents/GitHub/bkit/.worktrees/bar-155-workflow-friction-optimisation/docs/plans/logs/bar-155-workflow-friction-optimisation/status.json`
- Plan input: `/Users/christian/Documents/GitHub/bkit/.worktrees/bar-155-workflow-friction-optimisation/docs/plans/logs/bar-155-workflow-friction-optimisation/plan-input.md`
