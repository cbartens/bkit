Verdict: CONCERNS
Failures: 4

<!-- verdict:end -->

# Plan Scope Check

## CRITICAL

**C-1. Rebase sentinel mechanism conflict between Architecture section and Task 9 (bkit-ship.md Fix 5)**

The Architecture section (§ `[MODIFY]` `.agents/workflows/bkit-ship.md`) prescribes a sentinel FILE approach:

```
touch docs/plans/logs/{FID}/.rebase-failed
```

with a prose sub-step `3a` checking the file after the bash block. Task 9 of the Runbook contradicts this by saying to keep the check INSIDE the same bash block (to avoid inter-block variable loss), and proposes using `REBASE_FAILED=true` + `exit 42` sentinel exit code as an alternative to the sentinel file. The two mechanisms are mutually exclusive: the sentinel-file approach survives bash-block boundaries and is used by a prose sub-step, while the in-block variable approach requires the check to be in the same shell invocation. No tie-breaker is stated; the executing agent must guess. SC-4 can only confirm one mechanism is present. The Failure Path wiring note also references both sentinel-file presence (`docs/plans/logs/{FID}/.rebase-failed` exists) AND the `REBASE_FAILED` environment variable as trigger conditions. Resolution: the Architecture section and Task 9 must agree on exactly one mechanism; the Failure Path condition must match.

**C-2. Human Gate 1 confirmation checkboxes are `[ ]` (unchecked)**

Both `👤 Acceptance Scenario confirmed` (line 110) and `Breaking Changes confirmed` (line 147) checkboxes remain unchecked. Per the template and the plan's own caution block, Gate 1 cannot pass and execution must not begin until these are `[x]`. The plan summary agent must issue `REVISE`. This is a pre-execution blocker; no tasks should be started.

**C-3. Utility audit-pass (Task 3) has no Derived Test Matrix row and no Verification Plan step**

Task 3 audits `bkit-utility-audit-*.md` agents and may apply Fix-1b edits to any classified as freeform-multi-finding. However, the Derived Test Matrix has no row for these files, and the Verification Plan (Manual Verification Steps 1–10) has no step confirming that audit-pass fixes were applied or that classification decisions are correct. If Task 3 edits utility agents, those edits are unverified end-to-end. Either a matrix row covering "Fix-1b directive present in any utility agent where audit-pass applied it" plus a verification grep step should be added, or the plan must explicitly state that the audit-pass scope is restricted to classification-only with no edits in this PR (contradicting Task 3's "Spot-fix any (a)" directive).

**C-4. "Run only if Step 9 CHALLENGE_VERDICT" guard semantics break after new Step 10 inserts verdict extraction**

After the plan's change, `CHALLENGE_VERDICT` is extracted in new Step 10 (Reconcile), not in Step 9 (parallel pair). The existing guards at current Step 10 and Step 11 (which become Steps 11 and 12 after renumber) read: "Run only if Step 9 `CHALLENGE_VERDICT` = CONCERNS or FAIL". Post-change, these guards reference the wrong step for verdict origin. The remap table's catch-all "Run-only-if guards — references to Steps 9/10/11/12 — re-target to new Step numbers per table above" does not specify whether "Step 9 `CHALLENGE_VERDICT`" in the guard text should become "Step 10 `CHALLENGE_VERDICT`" (semantically correct) or remain unchanged (since the variable name is the same regardless of where it was set). Task 8 does not call this out explicitly. If the guard text is updated to reference Step 10 but the variable is set in Step 10 and the guard is at Step 11, the flow is correct; if left as "Step 9" it is semantically misleading and may cause agent confusion on re-runs. Task 8 must explicitly resolve this.

## OPTIONAL

**O-1. No verification step for ADR and pending.md content quality**

Task 13 appends an ADR to `docs/decisions.md` and deferred items to `docs/pending.md`. The Derived Test Matrix rows 12 and 13 require a `Grep` check for the ADR section heading and deferred entries, but neither Task 15 nor Manual Verification Steps 1–10 include re-reading or grepping these files post-append. A `Grep` for the ADR heading and a `Grep` for "task-range" / "focused-brief" / "rebase || exit 1" in `docs/pending.md` should be added to Task 15 or Manual Verification to satisfy matrix row coverage.

**O-2. Mirror diff assertion (Manual Verification Step 8) may false-fail due to T1 transform**

Step 8 asserts byte-identity between `.agents/prompts/bkit-build-challenge-1.md` and `.claude/agents/bkit-build-challenge-1.md` via `diff`. However, `bkit install` applies a T1 frontmatter transform to agent files — the mirrors are NOT byte-identical to their canonical sources; T1 strips or rewrites YAML frontmatter. The diff will always show differences in frontmatter, making the Step 8 verification incorrectly stated. The verification should instead assert that the mirror file EXISTS and its body (non-frontmatter) matches the canonical source body, or use `bkit install`'s own exit code + `git status` diff scoping as the primary verification (Task 14 already covers this better).

**O-3. BAR_COUNT dry-run assumes plan-input.md is present in worktree at Task 7 time**

Task 7 says "Verification: dry-run the awk pipeline on this plan's own `plan-input.md` and confirm BAR_COUNT = 1." The `plan-input.md` file lives at `docs/plans/logs/{FID}/plan-input.md`. At Task 7 execution time this file should exist in the worktree (it was written during `bkit-plan`), but the runbook does not assert its presence before the dry-run. If the worktree was created fresh for build without prior plan artifacts, the dry-run would fail with a file-not-found rather than a BAR_COUNT mismatch — masking the gate logic verification. Add an existence assertion before the dry-run.

**O-4. prompts.md `maxTurns` tier-M definition not pre-verified**

Architecture § `[MODIFY]` `.agents/prompts.md` sets reconciler `maxTurns: 30` and notes "runbook Task 10 verifies this aligns with table tier M definition." Task 10 does say to re-read `prompts.md` Models table to get the canonical column values, but does not explicitly verify that tier M is defined as 30 in the `maxTurns calibration table`. If tier M is actually a different value, the reconciler's `maxTurns: 30` would be miscategorised. Task 10 should explicitly grep the `maxTurns` calibration table to confirm tier M = 30.

## OUT OF SCOPE

**S-1. `bkit-build.md` Step 2 rebase anti-pattern** — same `git rebase origin/dev || { echo "..."; exit 1; }` exists in `bkit-build.md` Step 2. The plan correctly defers this via `docs/pending.md` and marks it as out of scope for this PR. No action required in this plan.

**S-2. Consumer-repo propagation** — changes take effect in consumer repos on next `bkit install` run. No consumer-repo edits required or planned. Correctly excluded.

**S-3. `bkit-design-review-*` and `bkit-plan-review-*` model diversity retrofit** — correctly noted as already verified (Opus/high vs Sonnet/medium) and excluded from this plan's scope.

**S-4. Automated test harness for prompts/workflows** — no automated test surface exists for `.agents/` markdown files. Manual workflow trace + `Grep` is the established convention. No new test infrastructure is in scope here.
