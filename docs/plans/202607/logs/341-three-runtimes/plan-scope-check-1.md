Verdict: CONCERNS
Failures: 2

<!-- verdict:end -->

# Plan Scope Check

Lens: Scope, criteria, verification audit.

## CRITICAL

1. **Matrix<->runbook mapping gap: T15 commits to a `tests/bkit-runtime.bats` behaviour test with no Derived Test Matrix row.** T15 Done-when (`plan-v2-reviewed.md:413`) states the two worktree helpers self-skipping loudly on `CAN_WORKTREE=false` is "asserted by a **behaviour** test in `tests/bkit-runtime.bats` ... NOT presence-only." No matrix row covers this: the 9 `tests/bkit-runtime.bats` rows are 1–4 (detection→T3), 5 (`bkit_wait_ci`→T7), 7–9 (close-guard→T9). The task mapping (`:423`) assigns nothing to T15 (`14–15→T16`). Per the matrix contract ("Each row → exactly one Agent Execution Runbook task"; bidirectional), a committed boundary-crossing test must have its own row. **Fix:** add a matrix row (e.g. row 16) — "`bkit-worktree-{prune,sync}` self-skip loudly on `CAN_WORKTREE=false` (Flow 7)" | Integration (bats) | `tests/bkit-runtime.bats` | T15 — so T15 gains a first-class verification row instead of resting on the aggregate live/prose rows.

2. **T15 debug-egress loudness change has a `Done when:` but no named verification mechanism.** T15 (`:413`) scopes a real behaviour change — debug egress "emits a loud signal instead of a silent `exit 0`" (`.agents/config.md`, `bkit-debug.md` egress block) so a self-skip `exit 0` never reads as "no runtime errors." Its Done-when asserts the behaviour but names no test, no matrix row, and no Manual-Verification step exercises it (Manual steps 1–4 at `:456-459` cover mode-1/2/3 close + `dev` config, not debug egress). This scoped change is currently unverifiable. **Fix:** either add a bats/behaviour assertion (the egress self-skip loudness is bash-observable, same class as the worktree self-skip in finding 1) and a matrix row, or add an explicit Manual-Verification step that runs `/bkit-debug` in a `CAN_WORKTREE=false` runtime and confirms the loud signal.

## OPTIONAL

1. **SC5 (empty/zero MCP read is never authoritative absence, D12) has no automated assertion.** It is carried by `rules.md` prose (T6) + fallback prose (T14) + the live run (row 14) only. T6 Done-when (`:404`) does verify the design Step-3.1 zero-hit call site reads the D12 invariant, but nothing mechanically asserts a zero-hit path routes to corroborate/report-unavailable rather than `None.`. Consider a small vitest/bats presence-or-behaviour check to lift SC5 off "live-only," matching the rigor SC2/SC3/SC6/SC7 get.
2. **Commit to T2's conditional FID-resolution bats assertion.** T2 (`:400`) offers "_if_ factorable... add a `tests/bkit-runtime.bats` assertion for non-`feat/` vs `feat/` resolution" to convert a mode-1/2 backwards-compat boundary from manual→automated. This is one of the two highest-blast-radius edits to the existing mode-1/2 path; recommend making the automated assertion the default target (with a matrix row) rather than leaving it to rest on prose-audit + live.
3. **New `bkit-runtime.sh` ships un-shellchecked.** Flagged in Suggested Scope Expansion (`:242`). Folding a `shellcheck -s sh` static step would also cover the new shim; otherwise it lands green and only surfaces in a consumer shell. Human decision.

## OUT OF SCOPE

- The three Suggested Scope Expansion candidates (`:239-243`) — shellcheck gate, `status.jsonl` run-boundary keys, prompt-injection hardening (`#342`) — are correctly surfaced as candidates, not tasks. Keep separate unless the human folds one in; #342 owns injection hardening and T14's max-1 fallback cap (D13) is the sanctioned mitigation here — do not duplicate #342's scope.

## Notes (in-remit confirmations)

- **Template completeness (step 5):** all mandated sections present and populated (Acceptance Scenario incl. Derived Test Matrix, Breaking Changes, Open Questions, Alternatives, Out of Scope, Security & Privacy, Pre-Flight + Gate 1, Data Schema Integration, Architecture, Supersession Inventory, Documentation Updates, Rollback, Runbook + Gates 2/3, Verification Plan + Gate 4, Manual Verification, Merge Method). `Database Migrations` correctly omitted (no DB).
- **Supersession Inventory (step 10):** 4 DELETE rows, each mirrored in Architecture `[DELETE]` (`:343-345`) and a removal task (kernel blocks + blind sleep→T7; `feat/` reject→T2; macOS path→T1). Complete.
- **Out of Scope (step 11):** all 8 rows genuinely-additive with a `docs/deferrals.jsonl`/`docs/failures.jsonl` home; none is required work parked out of scope (no `Blocking` deferral).
- **Scope→task coverage (step 7):** every Architecture change area maps to a build task (shim→T3, rules→T6, auto→T2, phase headers→T3/T7/T8/T9/T10/T11/T12/T13/T14, worktree helpers→T15, `.mcp.json`→T4, cloud-bootstrap→T5). Every T1–T16 carries a `Done when:`.
- **Conditional T12/row 12 (OQ-A/OQ-D):** the plan is written for D5(a) with explicit swap-to-D5 instructions in T12/T13; both OQ human-confirmation checkboxes are unchecked, so Gate 1 correctly blocks. This conditionality is by-design, not a scope gap.
- **bkit-repo managed-block edits (step 12):** T1/T6 edit `.agents/rules.md` and `docs/plans/template.md` managed blocks. In a consumer plan this would violate the "edit below `bkit:end`" rule, but this IS the bkit repo — the managed blocks + `.bkit/templates/` mirrors ARE the shipped source and are the correct edit sites here. No violation in context.
- **Stale anchors:** `docs/plans/template.md` currently shows no `/Users/` leak (T1 anchors `:191`/`:575` are stale, `:575` exceeds the file). T1's Done-when rests on a test asserting zero host-path leaks, so it is self-verifying regardless of anchor drift — acceptable given the plan-wide "re-locate at build" directive (`:392`).
