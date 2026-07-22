Verdict: CONCERNS
Failures: 1

<!-- verdict:end -->

# Plan Scope Check

Lens: Scope, criteria, verification audit.

## CRITICAL

1. **T15's new worktree-prune/sync self-skip bats assertion has no Derived Test Matrix row (bidirectional 1:1 mapping broken).** `docs/plans/202607/logs/341-three-runtimes/plan-v2-reviewed.md:413` (T15 `Done when`) commits to a new **behaviour test** in `tests/bkit-runtime.bats` asserting the two `bkit-worktree-{prune,sync}.md` helpers "self-skip loudly on `CAN_WORKTREE=false`" and explicitly says "NOT presence-only" — i.e. a genuine new discriminating test, distinct from row 4 (which only covers `WORKTREE_PATH` mint/adopt resolution in the shim, not the worktree-helper self-skip behaviour). The Derived Test Matrix (lines 115–131) has exactly 15 rows, all already assigned to T1/T3/T4/T5/T7/T9/T12/T16 per the Gate-3 mapping line ("rows 1–4→T3, 5–6→T7, 7–9→T9, 10→T4, 11→T1, 12→T12, 13→T5, 14–15→T16"), and none of them is this self-skip assertion. Per audit step 8, this is a gap: "add task or row." Fix: add a 16th matrix row (Type: Integration (bats), Target: `tests/bkit-runtime.bats`, Task: T15) covering the `CAN_WORKTREE=false` self-skip behaviour, and update the Gate-2 "Verify test coverage against Derived Test Matrix" mapping line to include it.

## OPTIONAL

1. **T15's "debug egress blindness" fix has no dedicated verification artifact.** Same task (`:413`) also commits to making debug egress emit "a loud signal instead of a silent `exit 0`" (`.agents/config.md`, `bkit-debug.md:551-565`), but its `Done when` cites only "consumption verified live in T16" with no bats/vitest assertion and no matrix row — unlike the self-skip half of the same task, which at least claims an automated bats test. Consider either giving it the same automated-bats treatment or explicitly stating (as the plan does elsewhere for prose-only invariants, e.g. T6/T8) that it rests on prose-audit + live per the design's honest limit (D3), so the asymmetry within one task reads as intentional rather than an oversight.
2. **T2 (FID decoupling in `bkit-auto.md`) ships a hedged/conditional test commitment.** `:400` reads: "if the FID resolution can be factored into a shim helper... add a `tests/bkit-runtime.bats` assertion... otherwise it rests on prose-audit + live." This is one of the two highest-blast-radius edits to the existing mode-1/2 path per the plan's own framing, yet its automated-test coverage is conditional on a build-time judgment call with no fallback matrix row reserved either way. Consider pre-committing to the bats assertion (reserving matrix row 16/17) rather than leaving it a build-time coin flip with a prose-only fallback.
3. **OQ-A/OQ-D materially change task count and the Derived Test Matrix (T12 dropped, T13's tail swapped, row 12 dropped) if the human selects D5 over D5(a).** The plan handles this responsibly with explicit swap instructions in T12/T13 and OQ-A, but confirm at Gate 1 that whichever branch is taken, the matrix/runbook re-sync (dropping row 12 and re-pointing T13's target file/tier if D5 is chosen) is re-verified — this scope-check pass audited the D5(a) branch as written since that is the plan's default.

## OUT OF SCOPE

None identified beyond what the plan itself already tables in `Out of Scope` (all 8 rows there are genuinely additive — deferred to `docs/deferrals.jsonl`/`docs/failures.jsonl`, not required by Success Criteria/Derived Test Matrix/design sections) and `Suggested Scope Expansion` (3 candidates, correctly left as candidates, not folded into the runbook).
