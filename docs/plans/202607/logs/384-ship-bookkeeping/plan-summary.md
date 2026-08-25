Verdict: PASS
<!-- verdict:end -->

# Plan Summary

## Overview

This plan delivers a gate-first restructure of `bkit-ship.md` that resolves seven findings about an unwritten push contract and CI-head validation mismatch. The new workflow shape is verify → base-check → integrate → re-validate → merge → close, with bookkeeping moved off the branch to the dev tree (or adopt tree in mode 3) via tiered carriers: a tested `bkit-ship-gate.sh` merge gate (Tier 1), prose invariants enforced by vitest (Tier 2), and an advisory status-hole detector (Tier 3). The plan is split into three lossless sub-plans: Sub-plan 1 lands the serialisation carve-out, configuration surface, gh stub harness, and tested gate before any prose is touched; Sub-plan 2 hardens the Failure Path, performs the structural rewrite (turning the Tier-2 invariant GREEN), and regenerates rendered mirrors; Sub-plan 3 publishes contracts, ships the Tier-3 detector, and performs consumer-repo E2E validation. Key conventions include `BOOK_ROOT`/`BOOK_PATHS`, outbox durability, push-timing invariant decoupled from #341's `CAN_PUSH_DEV`, and `--match-head-commit` on every merge.

## Plan Quality

The plan is exceptionally tight and well-scoped. All 12 original design workstreams are covered across the three sub-plans with clear dependency seams. The gate-first landing order (tested gate before prose rewrite) is the direct antidote to the `01f8b8d9` anti-pattern where worktree model and head-match gate landed together without review. The dependency graph is sound: Sub-plan 1's outputs (tested gate + BOOK_ROOT contract + stub harness) are verified at the start of Sub-plan 2; Sub-plan 2's outputs (rewritten workflow + byte-identical mirrors) are verified at the start of Sub-plan 3. Every task is independently verifiable with concrete Done-when clauses using `pnpm test`, `pnpm test:bats`, `grep -c`, `diff`, `bkit install`, and `bkit check`. The RED→GREEN Tier-2 invariant is the plan's central quality mechanism and is split across sessions deliberately to prevent a half-applied rewrite.

## Review Outcome

The review cycle went through three passes with all CRITICAL/MAJOR findings resolved. Step 5 review (Lens 1/2/3) initially returned FAIL with 6 failures: (C1) Task 0 GO/NO-GO cited a marker absent from ship (bkit_close_guard_checkout); (M1) "first-of-its-kind gh stub" premise was false — the PATH-shim idiom already exists in bkit-runtime.bats, only the fixture-file dispatch is new; (M2) Suggested Scope Expansion ignored five pre-existing #384 deferrals in docs/deferrals.jsonl; plus three MINORs on dependency labels, supersession inventory, and implicit BOOK_ROOT conditional. Step 6 (plan-apply-review) incorporated all fixes: corrected markers, reframed Task 2 as "extend existing PATH-shim idiom", surfaced the five deferrals, and added explicit BOOK_ROOT conditional bullets. Step 7 scope-check returned CONCERNS with 1 MAJOR (forward-referenced Task 1/Task 4 Done-when clauses to Task 6's bkit-dogfood-noop extension, resolved by clarifying ownership). Step 8 (plan-apply-scope) applied the fix, achieving PASS. Step 9 complexity-check returned SPLIT with a 140K token estimate (1.6× the 85K single-session threshold), proposing a 3-way lossless partition. Step 10 (plan-complexity-split) executed the split with parent index (plan-v4-split.md) and three child sub-plans (plan-v4-1.md, plan-v4-2.md, plan-v4-3.md), achieving PASS.

## Breaking Changes

**New artifacts:** `.bkit/scripts/bkit-ship-gate.sh` + template byte-identical pair (Tier-1 merge gate); `.bkit/scripts/bkit-ship-timeouts.sh` + template byte-identical pair (managed config script); `tests/fixtures/gh/` fixture corpus with PATH-shimmed gh stub; `tests/ship-gate.bats` (10 cases); `tests/ship-failure-path.bats`; `tests/ship-worktree-ownership.bats`; `.bkit/src/bkit-ship-invariants.test.ts`; `.bkit/src/bkit-config-keys.test.ts`; `.bkit/src/bkit-status-hole-detector.ts` + test; `ship-e2e-validation.md`.

**New config keys:** `package.json` keys `bkit.capstoneJob` (default `bkit-tests-check`) and `bkit.ciWorkflow` (default `ci.yml`), consumer-tunable and survive stripManagedKeys.

**New named conventions:** `BOOK_ROOT` (single tree every status/artifact write targets); `BOOK_PATHS` (8-path frozen allow-list for staging); Outbox at `$GIT_COMMON_DIR/bkit-outbox/{FID}/` (crash-window buffer outside every worktree); canonical 14 `ship-*` step keys (stable schema); `BKIT_SHIP_GATE_OVERRIDE=<sha>` (escape honours only refused head).

**Prose changes:** `bkit-ship.md` structural rewrite (~1278 lines) to verify → base-check → integrate → re-validate → merge gate → merge → close shape; three deletions: ship's unconditional rebase-on-resume, Step 3's prior-run diffing, Step 8's `Update: Source files.` retry loop; Failure Path hardened (`.deferred-blocked` writer, BOOK_ROOT reads, append ordered after abort, six silencings removed); Step 12 worktree ownership scoped; `bkit-protect-main.sh` reads bkit.capstoneJob not literal.

**Rendered mirrors:** `.claude/commands/bkit-ship.md`, `.cursor/commands/bkit-ship.md`, `.opencode/commands/bkit-ship.md` regenerated via `bkit install`; `.bkit/workflows.md` step table re-sectioned; templates-content snapshot enforced.

**Observability:** `[bkit-ship-gate]` stderr prefix registered in `docs/observability.md`.

**Consumer contracts:** `docs/deployments.md` consumer CI contract (pull_request ⇒ run_level=full; narrowing = opt-out); rollback path (pin previous @cbartens/bkit; hold bkit upgrade for ship surfaces; audit BKIT_SHIP_GATE_OVERRIDE rows).

**CI wiring:** bats wired into `.husky/pre-push`.

**Mode-3 deferral:** live E2E validation for mode-3 (cloud runtime, RUNTIME_DEVPUSHES=false) deferred to row `384-mode-3-bookkeeping-e2e-deferred-to-341-live-run`.

## Feasibility

The plan is buildable on the existing stack with no new dependencies. Shell scripts use bash + jq + gh; tests use bats + vitest; documentation uses markdown. The gh stub harness reuses the existing PATH-shim idiom from `tests/bkit-runtime.bats:44-58` and adds only the fixture-file dispatch layer, making the cost hinge cheaper than originally claimed. #341 has landed (merged d64ef5be), so 384 re-derives against the post-#341 bkit-ship.md state (verified in Task 0). The only verification gap is consumer-repo E2E (Risk 11: bkit's own repo cannot dogfood; 0 sweeps across 21 log dirs; 2 ship rows are fixtures), which is addressed by the manual Task 11 validation workstream.

## Synthesis Coverage

Three review lenses (tightness, completeness, complexity) and two scope lenses (precision, creep/gaps) converged on the same structure. Lens 1 identified 6 failures (markers, stub premise, deferrals surfacing, dependency labels, inventory, implicit conditional) — all applied in Step 6. Lens 2 (gate structure) and Lens 3 (derived test matrix bidirectionality) passed. Scope check confirmed 12/12 tasks have explicit scope + criteria + verification with no scope creep or gaps. Complexity check proposed the 3-way split along clean dependency seams: tested gate (SP1) → RED→GREEN invariant + final workflow shape (SP2) → docs/detector/E2E (SP3). Deferrals: kernel extraction, detector promotion, ship-without-branch-checkout (outside B2), per-workflow rollback, ship-redesign-sequence-after-341 — all recorded in docs/deferrals.jsonl as follow-ups, not absorbed into scope.

## Scope Alignment

The plan's Acceptance Scenario and Success Criteria match the issue brief + comment clarifications verbatim. Scope covers the issue's stated "In" items: `.bkit/workflows/bkit-ship.md`, `.deferred-blocked` writer, Failure Path status target, `.bkit/workflows.md` step table, rendered mirrors, and verification-gap detector. It absorbs related issues #74 (cancel-in-progress recurring), #68 (main repo vs worktree cwd mismatch), #209 (workflow state model), and #71 (commit/push reduction) — each finding maps to a plan decision or deletion. Comment clarifications folded in: non-firing pull_request is general (CONFLICTING/buried skip-ci), cancel-in-progress is a second independent justification for frozen head, Path B2 is the common case, path-scoped staging constraint added, and #341 RUNTIME_DEVPUSHES-conditional BOOK_ROOT rule made explicit.

## Risks

**#341 overlap:** Serialisation resolved via Task 0 gate (verify #341 landed, no concurrent bkit-ship.md rewrite). Plan re-derives against post-#341 state.

**gh API rate limits:** Path B poll loop samples `gh api rate_limit` before loop; code 20 strictly distinguished from code 10 (no run). First real sample deferred to Task 11 E2E.

**gh stub harness cost hinge:** Task 2 is the plan's single cost hinge. Re-calibrated as "extend existing PATH-shim idiom + new dispatch layer" (cheaper than first-of-its-kind). NO-GO still halts whole plan — SC 1 would rest on Tier-2 alone, which design says is insufficient (Risk 9).

**Consumer-repo E2E outside CI:** Task 11 manual validation is the only way to prove a run honoured the contract (Risk 11). bkit's own telemetry cannot dogfood.

**Mode-3 live verification deferred:** Both validated paths are local-mode (RUNTIME_DEVPUSHES=true); mode-3 BOOK_ROOT prose contract is mechanically asserted by Task 3's Tier-2 presence check, but live E2E deferred to row `384-mode-3-bookkeeping-e2e-deferred-to-341-live-run` (depends on OPEN `341-live-run-verification-mode-1-and-mode-3`).

## Action Items

None — plan ready for build.

## Outstanding Questions

**WS-2 harness go/no-go timing:** Task 2 carries a GO/NO-GO escalation: if the gh stub harness cannot be settled in roughly half a day (8 agent turns), STOP and surface to orchestrator for explicit tiering revisit. The PATH-shim reuse recalibration makes this less likely, but the gate remains.

**Mode-3 live E2E sequencing with #341's deferral:** Task 11 records the gap and cross-references `341-live-run-verification-mode-1-and-mode-3`. The sequencing decision (run after that issue's live-run workstream lands) is in the deferral ledger, not resolved here.

## Sub-Plans (SPLIT)

**Sub-plan 1 — Foundations & Tier-1 Gate (`plan-v4-1.md`):** Tasks 0, 1, 2, 3, 4 (est. ~33K tokens). Dependencies: none (fresh start). Output: #341 serialisation decision recorded; `bkit.capstoneJob`/`bkit.ciWorkflow` config keys + `bkit-ship-timeouts.sh`; gh stub harness with fixture corpus; Tier-2 invariant test RED; tested `bkit-ship-gate.sh` (10 bats cases GREEN). SP1 Gate: tested gate GREEN + invariant RED + byte-identity manual diffs verified + pre-push wired.

**Sub-plan 2 — Hardening, Rewrite & Mirrors (`plan-v4-2.md`):** Tasks 5, 6, 7, 8 (est. ~44K tokens). Dependencies: SP1 outputs re-verified at start (Task 5 prelude). Output: hardened Failure Path + `.deferred-blocked` writer + Step 12 ownership (2 bats files GREEN); dogfood mirroring verified (bkit-dogfood-noop GREEN); structural rewrite of `bkit-ship.md` (Tier-2 invariant GREEN); byte-identical mirrors + re-sectioned `workflows.md`. SP2 Gate: invariant GREEN + mirrors byte-identical + no regression in Tier-1 carrier.

**Sub-plan 3 — Docs, Detector & E2E (`plan-v4-3.md`):** Tasks 9, 10, 11 (est. ~26K tokens). Dependencies: SP2 outputs re-verified at start (Task 9 prelude). Output: 6 docs (observability, deployments, decisions×2, knowledge, deferrals) with contracts published; Tier-3 status-hole detector (advisory, fail-open) shipped; consumer-repo E2E validation report. SP3 Gate: docs published + detector advisory + E2E evidence recorded.

**Seam contracts:**

- Seam 1 (SP1 → SP2): SP2 Task 5 re-verifies `bkit-ship-gate.sh` + `tests/ship-gate.bats` exist and pass; `.bkit/src/bkit-ship-invariants.test.ts` exists and RED; config present; stub harness present.
- Seam 2 (SP2 → SP3): SP3 Task 9 re-verifies Tier-2 invariant GREEN; `bkit check` reports no drift; mirrors byte-identical; hardening live; Tier-1 intact.

## Suggested Next Step

```text
/bkit-build 384
Brief: Build Sub-plan 1 first — foundations, config, gh stub harness, tested gate, Tier-2 invariant RED. Target: docs/plans/202607/logs/384-ship-bookkeeping/plan-v4-1.md (33K tokens). SP1 Gate verified before handoff to Sub-plan 2.
```
