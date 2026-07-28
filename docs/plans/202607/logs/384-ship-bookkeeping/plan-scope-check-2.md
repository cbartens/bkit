Verdict: PASS
Failures: 0
<!-- verdict:end -->

# Plan Scope Check — Lens 2

**Scope:** Issue-intent alignment, design acceptance coverage (SC1–SC5 + narrative), deferred-boundary integrity, #341 sequencing scope, over-engineering (YAGNI), rollback scope.

**Inputs:** `plan-v2-reviewed.md` (12 tasks: Task 0–11), `plan-input.md` (issue body + comments + appended parent design), `related-deferrals.md` (10 deferral rows).

## Issue-Intent Alignment

Issue "Agreed solution" (plan-input.md:98–131) — each element mapped to a task:

| Agreed-solution element                                                    | Task(s)                           | Status |
| -------------------------------------------------------------------------- | --------------------------------- | ------ |
| Two paths keyed on `git merge-base --is-ancestor` (A/B)                    | Task 7 Step 3                     | ✓      |
| Frozen head — bookkeeping never rides branch                               | Task 7 Step 1, Task 3 (invariant) | ✓      |
| Single capstone gate common to both paths                                  | Task 4                            | ✓      |
| `gh pr update-branch` for B1                                               | Task 7 Step 4 B1                  | ✓      |
| B2: worktree + `@bkit-ship-conflict-resolve` + push --force-with-lease     | Task 7 Step 4 B2                  | ✓      |
| Re-validation mandatory in B (unconditional `gh workflow run`)             | Task 7 Step 5                     | ✓      |
| Bookkeeping off the branch, `[skip ci]` push at close                      | Task 7 Step 1 + Steps 7+          | ✓      |
| `.deferred-blocked` writer (Finding 2)                                     | Task 5(a)                         | ✓      |
| Failure Path status target fix (Finding 4)                                 | Task 5(b),(c)                     | ✓      |
| `--match-head-commit` on every merge                                       | Task 7 Step 6b, Task 3            | ✓      |
| Verification gap (status-hole detector)                                    | Task 10                           | ✓      |
| Resulting shape: start→verify→base-check→integrate→re-validate→merge→close | Task 7                            | ✓      |

Issue "In" scope (plan-input.md:141) — `bkit-ship.md`, `.deferred-blocked` writer, Failure Path target, `.bkit/workflows.md` step table, rendered mirrors — all have tasks. No agreed-solution element is missing a task.

## Design Acceptance Coverage — SC → Task

| SC  | Success Criterion                                                                                               | Owning task(s)                                                                                                                                                       | Covered |
| --- | --------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| 1   | Merge refuses non-validated head (capstone present+`success` at PR head AND `--match-head-commit`)              | Task 4 (gate asserts capstone+success+headSha); Task 7 Step 6b (`--match-head-commit`); Task 3 (Tier-2 invariant: every `gh pr merge` carries `--match-head-commit`) | ✓       |
| 2   | No non-integration push to `feat/{FID}`; every head move followed by re-validation                              | Task 3 (invariant: no commit/push to `feat/{FID}` outside B2 block); Task 7 Step 5 (re-validation on observed head move)                                             | ✓       |
| 3   | One `status.jsonl` per run, one tree, terminal row, no dangling `IN_PROGRESS`; refusals + poll-timeout emit row | Task 7 Step 1 (BOOK_ROOT once); Task 7 Step 5/6 (row before each cap + per refusal); Task 5(b) (Failure Path reads BOOK_ROOT); Task 8 (workflows.md)                 | ✓       |
| 4   | Deferred-sweep FAIL → handover artifact, never bare STOP                                                        | Task 5(a) (`.deferred-blocked` writer); Task 3 (writer referenced under BOOK_ROOT); Task 11 Manual Step 3 (trigger FAIL → handover)                                  | ✓       |
| 5   | Staging never outside `BOOK_PATHS` allow-list, verified mechanically                                            | Task 3 (Tier-2 positive presence: `BOOK_PATHS` = frozen 8-path list, every `git add` resolves via it, no `git add -A`); Task 7 (uses `BOOK_PATHS`)                   | ✓       |

### Narrative WHEN→THEN → Task

| WHEN step                        | THEN → Task                                                                           |
| -------------------------------- | ------------------------------------------------------------------------------------- |
| ship starts                      | BOOK_ROOT/BOOK_PATHS resolved once → Task 7 Step 1                                    |
| Path A (dev ancestor)            | no integration, straight to gate → Task 7 Step 3                                      |
| Path B1 mergeable                | `gh pr update-branch` → Task 7 Step 4 B1                                              |
| Path B2 conflicting              | worktree+resolve+push, or handover → Task 7 Step 4 B2                                 |
| head SHA differs from ENTRY_HEAD | unconditional dispatch + bounded poll + status row → Task 7 Step 5                    |
| capstone present+success+no skip | merge `--match-head-commit`; ELSE refuse w/ both SHAs+URL → Task 7 Step 6/6b + Task 4 |
| deferred sweep FAILs             | `.deferred-blocked` + handover → Task 5(a)                                            |
| run ends by any route            | one complete path-scoped record set in BOOK_ROOT + terminal row → Task 7 + Task 5     |

Every SC and every narrative step maps to ≥1 task. No uncovered SC or WHEN→THEN.

## Deferred-Boundary Integrity

The design + deferrals explicitly DEFERRED these. Verified NONE silently absorbed as tasks:

| Deferred item (key)                                                                                     | Plan handling                                                                                                                                                         | Absorbed?                         |
| ------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| Full kernel extraction (`384-extract-ship-git-ci-mechanics-into-a-tested-kernel`)                       | Only merge gate extracted (Task 4); base/integrate/re-validate stay prose. Out-of-Scope row present. Task 9 records ledger row.                                       | No ✓                              |
| Status-hole detector promotion advisory→gate (`384-promote-status-hole-detector-from-advisory-to-gate`) | Task 10 ships fail-open advisory; Done-when asserts exit 0 advisory (NOT non-zero). Promotion criteria recorded by Task 9.                                            | No ✓                              |
| Ship-without-branch-checkout outside B2 (`384-ship-without-a-writable-branch-checkout-outside-b2`)      | Only the 2 findings the deferral itself authorizes absorbed (Step 12 ownership → Task 5; push-timing → Task 7). Full removal NOT in scope.                            | No ✓ (authorized absorption only) |
| Per-workflow rollback mechanism (`per-workflow-rollback-path-for-shipped-bkit-workflow-changes`)        | Manual rollback path documented in scope (Task 9, docs/deployments.md); the per-workflow _mechanism_ explicitly the follow-up. Suggested Scope Expansion row says so. | No ✓                              |
| Merge queue                                                                                             | Out-of-Scope row (unavailable: private non-Enterprise repos). Not a task.                                                                                             | No ✓                              |
| Surgical patch (13-step skeleton)                                                                       | Out-of-Scope row (REJECTED). Not a task.                                                                                                                              | No ✓                              |
| `384-ship-redesign-sequence-after-341`                                                                  | Satisfied by plan existing + Task 0 recording serialisation decision. Does not absorb #341 work.                                                                      | No ✓                              |

Deferred-boundary intact. No deferred item silently absorbed into a build task.

## #341 Sequencing Scope

WS-1 / **Task 0** is correctly scoped as a **verify-only GO/NO-GO pre-implementation gate**:

- "Verify #341's ship-touching workstreams have landed... Confirm no other open PR/branch is rewriting `bkit-ship.md`."
- Done-when: `git log d64ef5be..HEAD` empty/own-FID; decisions.jsonl row `384-341-serialisation`; grep markers `bkit_runtime_row ship` ≥1 and `RUNTIME_DEVPUSHES` ≥1 present (confirms diff base).
- It CHECKS that #341 markers exist; it does NOT add them. It does NOT re-implement `bkit_close_guard_checkout` (Done-when explicitly states asserting that call in ship Step 9 is wrong).
- The plan re-derives its diff against post-#341 state (#341 is CLOSED, merged `d64ef5be`).

No re-implementation of #341 territory. ✓

## Over-Engineering (YAGNI) Check

| Artifact                                                   | Origin                                                                                                            | Verdict                                   |
| ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| `bkit.capstoneJob` / `bkit.ciWorkflow` config keys         | Design Decisions + config-home rule; retires 3rd hard-coded copy in `bkit-protect-main.sh`                        | Justified, design-mandated                |
| `bkit-ship-timeouts.sh` managed config (5 named constants) | Design (plan-input.md:522): follows `bkit-counter-bus-config.sh` precedent; consumed by Task 7 Step 5 poll + lock | Justified, precedent-backed               |
| `BKIT_SHIP_GATE_OVERRIDE` escape                           | Design Flow 5; gate writes own row                                                                                | Design-mandated                           |
| `bkit ship:audit` CLI (Task 10)                            | "or wired into existing `bkit slop:delta` channel" — reuses existing channel rather than new                      | Hedged to existing infra; not speculative |
| Outbox / pre-merge snapshot                                | Design Flow 1 + Data Model; solves Finding 6 loss                                                                 | Design-mandated                           |

No speculative config/flags/abstraction/"for the future" items. Every new artifact traces to a design Decision or Approach. No YAGNI violation.

## Rollback Scope

Plan `Rollback Strategy` section (plan-v2-reviewed.md:428–438) + Task 9 covers all axes required by the design's rollback requirement (Risk 8, Decisions row "Publish a consumer rollback path"):

| Axis                         | Scoped                                                                  | Where                                            |
| ---------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------ |
| Code (gate script + mirrors) | `git revert` (two-file pair together)                                   | Rollback Strategy                                |
| Code (workflow prose)        | `git revert` (single file)                                              | Rollback Strategy                                |
| Consumer rollback (3 repos)  | Pin previous `@cbartens/bkit`; hold `bkit upgrade`; audit override rows | Rollback Strategy + Task 9 → docs/deployments.md |
| Config keys                  | Remove keys; defaults = pre-change behaviour                            | Rollback Strategy                                |
| Risk window (version skew)   | `bkit check` catches partial upgrade                                    | Rollback Strategy                                |

Rollback path present and task-backed. ✓

## Findings

### CRITICAL

None. No agreed-solution element missing; no SC uncovered; no deferred item absorbed; #341 not re-implemented.

### MAJOR

None.

### MINOR (observations, non-blocking — accepted design limits faithfully inherited, surfaced for transparency)

1. **Mode-3 live E2E deferred.** Task 11 explicitly does NOT live-verify mode-3 (`RUNTIME_DEVPUSHES=false`) `BOOK_ROOT`; it defers to row `384-mode-3-bookkeeping-e2e-deferred-to-341-live-run` (depends on OPEN `341-live-run-verification-mode-1-and-mode-3`). The prose contract is mechanically asserted by Task 3's Tier-2 presence check. This is **properly handled** (presence check + documented deferral with named dependency) — not a gap, but reviewers should note SC3's "one tree in every runtime" is proven mechanically for mode-3, not by a live run.

2. **SC3 terminal-row across ALL abort routes is presence-checked (Tier-2), not consumed.** Risk 9 explicitly accepts "a prose-invariant test verifies presence, not consumption." E2E (Task 11) covers Path A + Path B2 + one failure route (deferred-sweep FAIL) but not every gate-refusal exit code (13/14/15/16) or poll-timeout abort in a live consumer run. This is an **accepted design trade-off** (Risk 9, 13), inherited faithfully by the plan — not a missing task.

## Verdict Rationale

All six lens checks pass:

- Issue-intent alignment: every agreed-solution element has a task.
- Design acceptance coverage: SC1–SC5 and all narrative WHEN→THEN steps map to tasks.
- Deferred-boundary integrity: no deferred item silently absorbed (only the 2 Step-12/push-timing findings the deferral ledger itself authorizes).
- Sequencing scope: Task 0 is a verify-only gate; no #341 re-implementation.
- Over-engineering: no speculative scope; all artifacts design-mandated.
- Rollback scope: full Rollback Strategy present and task-backed.

Only 2 MINOR observations, both accepted design limitations faithfully inherited and documented. No CRITICAL or MAJOR findings.
