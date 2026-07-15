Verdict: CONCERNS

<!-- verdict:end -->

# Plan Summary — Issue #58: Workflow Attempt Counters

## Overview

**What's planned:** Move workflow retry counters from orchestrator prose (model-tracked) to deterministic shell reads of `status.jsonl`, split across three sub-plans (15 / 14 / 8 tasks = 37 total). The 14-task sub-plan 2 is a justified exception to the 12-task cap — it contains the KN-26 atomic core (derivation + fail-closed hardening) which cannot be split. All three sub-plans ship in ONE PR via squash merge.

**Key gates:**

- Gate 1: Human confirmation of narrowed Acceptance Scenario (gated by two checkboxes in sub-plan 1)
- Gate 2a: Derivation helpers are available, before any call site converts
- Gate 2b: All 18 `--argjson` sites converted, before hardening ships
- Gate 2–4: Code implementation, testing, automated verification; manual verification (8 steps)

**Load-bearing constraints:**

- T3.0–T3.7 (derivation) and T3.8 (fail-closed hardening) ship together in sub-plan 2; cannot separate
- Hardening alone converts "may silently overrun" into "never retries" (KN-26 regression)
- WS-6 (delete inert primitives) runs last, after every site converts; deletes only once nothing depends on them
- Cross-run scoping for `DEBUG_ATTEMPT` preserved; active-run scoping for all others

## Plan Quality

**Well-scoped.** Design-coverage is complete — no acceptance criterion is omitted from tasks, and the scope discipline against the issue's explicit out-of-scope list is clean. Dependencies are correctly sequenced: additive sub-plan 1 gates atomic sub-plan 2, which gates cleanup sub-plan 3.

**Split is sound.** The partition respects the KN-26 seam on both sides (sub-plan boundary at Gate 2a is after T2.10, before T3.0; sub-plan 2→3 boundary is after T3.8 hardening, before T4.1 deletion). Task accounting independently verified: 37 unique definitions, 19-row derived test matrix (11+5+3), no duplicates or omissions.

**Critical tensions surfaced explicitly:**

- Sub-plan 2 exceeds the 12-task heuristic by 2 tasks — justified in the plan's own opening CAUTION and documented in the complexity-check rationale; this exception should not be silently overridden
- Two acceptance criteria have been narrowed from the issue's literal wording (§ Breaking Changes, items 5 and 10a); these require explicit human sign-off
- Workflow health: three friction rows logged (MCP search unavailable on private repo — recurrence 2; plan subagent left Verdict PENDING; API error left incomplete verification wiring)

## Completeness

**Scope:** 37 tasks cover all components. WS-1 single-sources the fold; WS-2 adds helpers alongside inert primitives; WS-3 converts all call sites then hardens; WS-4 deletes prose; WS-5 validates the conversion; WS-6 deletes inert primitives; WS-7 fixes telemetry honesty; WS-8 docs and regenerates mirrors.

**Testing:** Cross-process integration suites are mandatory (T2.2–T2.10). RED-before proofs for rules (T5.1, T5.3 red on unconverted prose/sites, green after WS-3). T5.4 validates the mapping via temporary edits. Manual verification (8 steps) includes live counter derivation, resume behavior, and honest telemetry emission.

**Docs:** Updated in sub-plan 3 (T8.2); ledger appends recorded in the plan itself (T8.2 asserts 6 deferrals, 3 total `58-`-keyed decisions of which 2 are new).

## Acceptance Scenario

**Narrative (agent-synthesised from issue #58 § Goal):** An engineer runs `/bkit-build` on a feature whose tests keep failing. Every retry is bounded by a number the shell counted from the run's event log, so the loop stops at the cap it advertises. If a counter is unusable, the run stops loudly instead of retrying forever.

**Success Criteria (inherited from issue #58, re-worded only where literal compliance is impossible — see § Breaking Changes item 5):**

- No `*_ATTEMPT` variable referenced in orchestrator markdown outside fenced blocks, including assignment and increment. Exemptions: `{X_ATTEMPT}` placeholders and bare `MAX_*` constant names (enforced by audit).
- No counter originates in orchestrator context; every one is read from `status.jsonl` at point of use — enforced by rule, not hand-list; no fenced block reads a bare `$X_ATTEMPT` it did not derive.
- All `MAX_*` thresholds from `bkit-counter-bus-config.sh`; no literal duplicated in prose.
- No legitimate first-attempt route (0 is legal) converted to Failure Path; only post-own-write position may refuse 0.
- Workflow exceeding `MAX_*` cannot silently continue; unusable counter cannot silently continue. Both route to Failure Path.
- Resume re-derives every counter; no restored state, no fresh budget.
- Every emitted counter row claims non-`model-self-report` provenance.

**Concrete example:** Step 13 derives TEST_ATTEMPT=1, writes row, re-derives 1 in routing block, continues. Step 13 attempt 4: derives 4, `decide_next` prints `failure-path` exit 1, `[bkit-telemetry] counter TEST_ATTEMPT exceeded max=3`. Resume: fresh process reading same log re-derives 3, no fresh budget.

**Edge cases:** Counter empty/non-integer → `decide_next` return 2 → Failure Path (never continue). Unreadable status.jsonl → `counter_count` return 2 → Failure Path. First-attempt 0 at prior-step routing (challenge-remediate Step 10, SOAK Step 3) → `counter_count` prints 0 exit 0 → continue branch (NOT Failure Path).

**Template adherence (§ Breaking Changes item 10–11):** No parent design exists; Narrative is agent-synthesised, not human-provided. This deviates from `docs/plans/template.md:46` which mandates a blocking fallback when design is missing. The plan chose to offer a synthesis to react to rather than a blank, on the judgment that reviewing a concrete sentence beats authoring one from scratch. This deviation is explicitly surface for human confirmation.

## Breaking Changes

1. **WS-3 derivation + WS-5 hardening ship atomically in sub-plan 2, one PR, squash merge.** Splitting them reproduces KN-26's original regression: hardening without derivation converts "may silently overrun" into "never retries". Non-negotiable.

2. **Sub-plan 2 is 14 tasks, 2 over the 12-task ceiling.** Justified exception — cutting it to 12 would land the cut on the KN-26 seam. The plan's own text ("Task order is load-bearing… do not reorder, do not split the PR along that seam") names this. Exception is flagged, not silent.

3. **`DEBUG_ATTEMPT` stays CROSS-run.** The fold reads all runs (`[.[] | select(.workflow=="debug")] | last`). Scope to active run would starve its budget on resume (Defect 3 by a side door). Fold is copied, not moved, at the counter-reset site (bkit-debug.md:432).

4. **The derivation rule makes the conversion's completeness self-policing.** No fenced block may read `$X_ATTEMPT` it did not itself derive (T5.3 audit). This was not hand-enumerated; it is rule-generated. If a site is unconverted, T5.3 goes RED, and T4.1 cannot pass.

5. **"No `*_ATTEMPT` in prose" is narrowed from the issue's literal wording.** Issue #58 says "no `*_ATTEMPT` variable referenced … including assignment and increment". Literal compliance is impossible: ~62 lines carry non-`$` brace placeholders (`{PLACEHOLDER}` substitutions and `MAX_*` names) that are not bare token references. Plan narrows to banning bare tokens while exempting the placeholders and constants. **Human confirmation required.**

6. **`CHALLENGE_REMEDIATE_ATTEMPT` violation is live in current shipped code.** Max is defined in config but literal `1` duplicated in prose; no shell gate enforces it. The issue's constraint 6 flags this. Plan fixes it by making the prose comparison a fenced derive (T3.3), but the `MAX_*` constant remains dead (referenced by T3.8's hardening, not used). This is intentional — a constant defined but not gated is better than a gate that bypasses the shared config.

7. **Workflow fold (`BKIT_STATUS_FOLD`) is single-sourced in `.bkit/scripts/bkit-status-fold.sh`.** Today it is inlined 15 times (5 workflows × 3 instances). Byte-identical blob (md5 `d04a2499…`, 1079 bytes). Sourcing once makes the derivation and workflows agree by construction.

8. **"No per-edit `bkit install`"** — new suites resolve the template, not the installed copy, until T8.3 (the only install run). Sub-plans 1 and 2 carry explicit prohibitions against running install early.

9. **Related-issues MCP search is unavailable.** `mcp__github__search_issues` returned `total_count: 0` for every probe including a control that must match (`repo:cbartens/bkit telemetry`). Related refs (#234, #209, #232, #183, #233) are carried from the issue body, not re-confirmed by search. Recurrence count 2 in friction log. Issue #341 named as fix path; no scope here.

10. **Acceptance Scenario Narrative is agent-synthesised.** Template mandates a blocking fallback when design is missing; this plan offered a synthesis instead, on judgment that a concrete sentence beats a blank. **Deviation flagged here for sign-off.** (Item 10a = the narrowed prose criterion; 10b = this narrative deviation.)

## Design Alignment

**Issue #58 verbatim acceptance criteria → plan tasks:**

- "No counter originates in orchestrator context" → WS-3 conversion tasks (T3.0–T3.7) + T5.3 (completeness rule)
- "Every one is read from `status.jsonl`" → counter_next/counter_current helpers (T2.1) + derivation shape repeated verbatim in each WS-3 task
- "No `*_ATTEMPT` referenced outside fenced blocks" → T5.1 widened prose audit + T4.1/T4.2 deletion
- "`decide_next`/`check_max` fail closed" → T3.8 hardening (return 2, no 2>/dev/null, Failure Path on any non-0/1 exit)
- "Resume re-derives" → T2.2 (fixture tests resume) and T2.10 (live resume characterisation)
- "No stored counters, only derived" → design decision from comments 3–4 ("derive, don't store")

Plan scope ⊆ design scope. Breaking Changes item 5 (the narrowed prose criterion) and item 10 (the agent-synthesised Narrative) are explicit deviations that require human sign-off; everything else maps verbatim or as a deliberate narrowing of the issue's impossible literal (the ~62 placeholder lines).

## Risks

**Residual risk in mapping rule (T5.4):** The plan validates the row-step → counter-step mapping via temporary edits and diffs, but pins the mapping mechanically rather than proving it. A site mis-mapped identically in both the derive call and the map goes green. The seeded-log fixture that would catch this was rejected as out of scope (#58 § Alternative Approaches). **Green T5.3 is necessary, not sufficient** — a clean audit does not prove the mapping is correct, only that the derive and map use the same counter for the same block.

**Unconverted sites may remain undetected:** The reviews flagged 12 of 18 counter `--argjson` sites as unconverted in the original draft (6 of 18 covered by the 7-site task list). The plan applies a rule (T5.3) that should detect any unconverted site — but the rule only looks inside fenced blocks, and the prose audit (T5.1) only looks outside them. A block that reads a bare `$X_ATTEMPT` with no derive would red T5.3; but if the rule itself has a blind spot (e.g. matching only on specific variable names, missing a variant), the unconverted site could pass silently. The rule is the only thing that can catch it; hand-enumeration was already incomplete.

**Workflow health:** MCP search unavailable on private repos (recurrence 2). Two subagent anomalies this run (Verdict PENDING left in artifact; API error with incomplete verification plan). Not plan-blocking, but note that integration testing will depend on live runs, not dry runs.

**Execution discipline required:** The KN-26 seam is protected by the plan's own gates and merge rules, but an implementer who reads only one sub-plan and splits it further, or an approver who signs off on the sub-plan 2 split without reading the full justification, could reproduce the regression. The plan is not idiot-proof.

## Action Items

**Before `/bkit-build`:**

1. **Human must review and confirm § Acceptance Scenario.** Two checkboxes (one 👤 section per § Breaking Changes items 5 and 10) gate Gate 1 and the entire feature. Confirm the narrowed "no bare `*_ATTEMPT`" prose criterion (exempting `{X_ATTEMPT}` and `MAX_*`). Confirm the agent-synthesised Narrative or replace it. Do not proceed without explicit checkbox.

2. **Execution order and merge discipline:** Sub-plans must execute in order (1 → 2 → 3). Sub-plan 2 must run as one uninterrupted session; do not stop mid-WS-3. All three sub-plans merge in ONE PR with squash (not three separate PRs or rebases). Gate 2b blocks T3.8 until T3.1–T3.7 are complete; this is enforced by the plan's own inline note but is critical.

3. **Monitor the completeness rule (T5.3).** If it goes RED after WS-3, the implementation is incomplete and must not advance. The rule is the only safety net for unconverted sites. If the rule passes but an independent audit (e.g. `grep -r '\$[A-Z]*_ATTEMPT'` over the five workflows inside fenced blocks) finds unconverted sites, the rule has a blind spot and needs adjustment before T4.1 runs.

4. **Watch for the edge case at T3.3 and T3.6:** `counter_current` returns 2 when count is 0, refusing the legitimate answer "0 rows exist yet". Plan specifies `counter_count` at those positions (challenge-remediate on first CONCERNS/FAIL, SOAK on first test failure). Verify the Done-when prescribes `counter_count`, not `counter_current`; if an implementer reaches for the routing helper, first-attempt routes will brick.

5. **Note the DEBUG_ATTEMPT cross-run scope.** Unlike all other counters, DEBUG_ATTEMPT reads all runs. This is intentional (soak detection needs long history). Do not scope it to active-run.

## Recommended Next Step

```
/bkit-build 58
Brief: Three-sub-plan feature (15 + 14 + 8 tasks) to move workflow retry counters from orchestrator prose to deterministic status.jsonl reads. KN-26 atomic core: sub-plan 2 (14 tasks, justified over-cap exception) combines derivation + fail-closed hardening in one uninterrupted session, one PR. Requires human sign-off: narrowed acceptance criterion on `*_ATTEMPT` prose references (exempts placeholders & constants) and agent-synthesised Acceptance Narrative. Residual risk: mapping rule pins but does not prove correctness; completeness detected by rule only. Read § Acceptance Scenario and § Breaking Changes items 5–10 first. Ledger: 6 deferrals / 0 deletions, 2 decisions / 0 deletions, byte-identical.
```

## Telemetry Summary

```

> @cbartens/bkit@4.5.0 bkit /Users/christian/Documents/GitHub/bkit/.worktrees/58-workflow-counters
> node dist/bkit-install.js telemetry summary --phase=plan

[bkit-telemetry] rows: 5 | malformed: 0 | versions: 4.1.4=2, 4.5.0=3
[bkit-telemetry] plan: 1 | design→ship chain total: 4 (from 5 rows)
```
