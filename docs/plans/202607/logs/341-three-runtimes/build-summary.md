Verdict: PASS

<!-- verdict:end -->

# Build Summary

## Overview

Built #341 three-runtimes workflow execution across 6 sub-plans (T1–T16). All 16 tasks implemented to spec: Layer-0 runtime shim detection (`bkit_runtime.sh` 10 functions, `bkit_runtime_detect`/`bkit_wait_ci`/close-guard kernel), Layer-1 CI-wait primitive extraction, Layer-2 branch model (adopt-or-mint), Layer-3 invariant prose (`rules.md` updates), FID marker-primary reorder (D9), gh auth hardening + MCP fallback lane, and close-guard kernel (D23/D24/D25). All six sub-plans verified PASS; holistic verification PASS (0 integration gaps). Build-challenge surfaced 4 findings; F1–F3 (mechanical) remediated first pass + regression tested; F4 (architectural, FID path traversal validation) escalated to human per protocol, manually fixed, independently re-verified PASS (0 failures).

## Implementation Quality

Per `build-plan-verify-holistic.md`: all 16 tasks (T1–T16) across 6 sub-plans (`341-three-runtimes-plan-{1..6}.md`) completed per spec. Integration verified coherent: single shim API across all sub-plans (10 functions in `.bkit/scripts/bkit-runtime.sh`, byte-identical to template copy); T8 adopt-or-mint composes across all 5 phase workflows; T2 marker-primary FID reorder integrates with T8 adopt mode; T9 close-guard kernel wired per shape (build/debug shape B, design/plan shape A, ship shape C); T14 gh→MCP fallback aligns with T4 `actions` toolset; CI-wait invariant consistent; §6d skip-ci convention coherent. Feature diff (`origin/dev..HEAD`): 1753 insertions / 352 deletions across 23 source files; deletions exactly match planned supersessions (macOS user-path, `feat/` hard-reject, inline CI-dispatch kernels, blind sleep, close-subject skip-ci). No conflicting edits between sub-plans. Host-render mirrors (`.claude`/`.cursor`/`.opencode`) regenerated at T16 per D19 deferral. All checklist items `[x]` except 5 deliberately-deferred live/admin Manual Verification steps (T16) — logged OPEN in `docs/deferrals.jsonl`, not failing gaps per plan § Out of Scope.

## Verification Status

All 6 sub-plans verified individually (PASS / 0 failures each), then holistic verification (`build-plan-verify-holistic.md`) confirmed 0 integration gaps. Per-sub-plan logs: `build-plan-verify-{1..6}-1.md` all PASS. Every task (`Done when` criterion) independently verified against live codebase changes. Deferred live/admin Manual Verification steps (5 items: 3 live mode-1/2/3 runs, 1 repo-admin branch-protection config confirm, 1 debug-egress live allowlist check) logged in `docs/deferrals.jsonl` with keys `341-t16-manual-verification-steps-*`; these are EXPECTED deferrals per plan scope (unstageable without live sessions). Single attempt; no remediation loops needed.

## Test Status

Full test suite PASS after fixes. Challenge-tests (`build-challenge-tests.md`): PASS — 9 new regression tests added for F1/F2/F3 findings, all passing (F4 already had dedicated coverage in `.bkit/src/bkit-auto-fid-guard.test.ts`). Run-tests (`status.jsonl` row 50): PASS — scope `pnpm typecheck && pnpm test && pnpm format:check && pnpm lint:slop && pnpm lint:prose && pnpm test:coverage:unit`, 0 failures. Full aggregate `pnpm test:bats` → 107/107 pass (44 in `bkit-runtime.bats` including 9 new F1/F2/F3 regressions + 8 new cloud-bootstrap-preflight regressions); `pnpm test` → 2484 tests across 70 files (2 skipped, 1 todo, all passing). Pre-existing lint findings (slop:10) unchanged by build diff (delta net 0, no gate weakening).

## Challenge

Per `build-challenge.md` + `build-challenge-remediate-log.md`: 4 findings identified, max severity HIGH (CONCERNS threshold). All resolved.

**F1** [HIGH, mechanical]: D24 landed-body scan misses 3 of 5 CI-suppression tokens (`[ci skip]`, `[no ci]`, `[actions skip]`). **Status**: Remediated — regex widened to full case-insensitive set in `bkit_close_guard_scan_body` (`.bkit/scripts/bkit-runtime.sh:427`). Regression test added, PASS.

**F2** [HIGH, mechanical]: `bkit_wait_ci` hard-depends on GNU `timeout` absent on stock macOS. **Status**: Remediated — resolver detects timeout/gtimeout, falls back to unwrapped sleep; missing binary no longer misdiagnosed as D22 blocked-sleep abort (`.bkit/scripts/bkit-runtime.sh:269-330`). Regression test added (reproduce pre-fix bug confirmed), PASS.

**F3** [LOW, mechanical]: Command injection via branch name in close-guard EXIT trap. **Status**: Remediated — trap body switched to single-quoted (fire-at-exit-time expansion, never re-parsed as literal text) instead of double-quoted interpolation (`.bkit/scripts/bkit-runtime.sh:382-389`). Regression test added (embedded `$(...)` payload in branch name verified not executed), PASS.

**F4** [LOW, architectural]: Marker-primary FID reorder elevates untrusted PR-body input for filesystem path construction (directory traversal risk via `../../elsewhere` FID). **Status**: Escalated to human per protocol (architectural findings not remediated in first pass). Manually fixed: FID slug allowlist validation added. Independent re-challenge: PASS, 0 failures (existing `bkit-auto-fid-guard.test.ts` coverage confirms fix). No further blockers.

## Generated Tests

9 regression tests added to `tests/bkit-runtime.bats` in response to F1/F2/F3 findings, all passing:

- **F1** (5 cases): All 4 previously-missed CI-suppression tokens individually fail the guard (`[ci skip]`, `[no ci]`, `[skip actions]`, `[actions skip]`), plus case-insensitivity case (`[SKIP CI]`). Only `[skip ci]` had prior coverage.
- **F2** (2 cases): (a) Neither `timeout` nor `gtimeout` on PATH falls back to unwrapped sleep, resolves within budget; (b) `gtimeout` resolved when `timeout` absent (homebrew fallback exercised via marker file).
- **F3** (1 case): Branch name with embedded `'$(...)$IFS` payload checked out; EXIT trap must not execute payload (verified via marker file); test fails against pre-fix double-quoted trap, passes against single-quoted trap.

F4 already had dedicated coverage in `.bkit/src/bkit-auto-fid-guard.test.ts` (not duplicated). Full test suite integration: 44/44 `bkit-runtime.bats` pass (including 9 new regressions), 107/107 `pnpm test:bats` aggregate pass. Bugs caught: all 3 mechanical findings validated to reproduce against pre-fix code.

## Risks

**Informational — known unknowns and integration concerns to track post-ship (no action this cycle):**

1. **Live mode-3 code path only exercisable in real claude.ai sessions.** CI cannot pre-exercise the mode-3 code path; the design's honest limit (per `build-plan-verify-holistic.md` § Notes) is that bats/vitest prove detection + presence, not that prose rules honour the flags at runtime. Runtime-consumption guarantee rests on 5 deferred live/admin Manual Verification steps (T16), reachable only from genuine mode-1/2/3/repo-admin sessions. No CI pre-exercise.

2. **Marker-primary FID elevation carries path-traversal surface.** F4 (escalated, fixed, re-verified) established that FID marker precedence requires strict slug validation at extraction. The fix adds allowlist guard; residual risk is drift between the validation point and all 13+ FID-interpolation sites across 5 workflows. Mitigation: the parser and the path consumers must be reviewed together post-ship if FID sources diverge.

3. **Two close transports, mode-1 never exercises mode-3.** Mode-1 (laptop) uses local `git merge --squash`; mode-3 (claude.ai) uses PR-based merge. Per the design's §2.9, this is an accepted risk: silent divergence could occur if heads collide mid-merge. Mitigation: dev-head-unmoved precondition documented; the 5 live Manual Verification steps exercise mode-3 merge in real scenarios.

4. **Deferred live/admin sessions required for Manual Verification.** 5 items logged in `docs/deferrals.jsonl`: WS-16 manual verification steps 1–4 (mode-1/2/3 phase runs, branch-protection confirm) + SP5 T15 debug-egress live check. These are EXPECTED deferrals (out-of-scope per plan); not blockers, but ship gates them to post-release admin sessions.

## Action Items

None. All mechanical findings (F1–F3) remediated + regression tested. Architectural finding (F4) escalated to human, manually fixed, independently re-verified PASS. No blockers remain for ship. Deferred live/admin Manual Verification steps are logged OPEN in `docs/deferrals.jsonl` per plan scope (out-of-scope items) — not action items for this cycle.

## Recommended Next Step

```
/bkit-ship 341

Brief: Plan done, all 6 sub-plans (T1–T16) implemented per spec. All tests pass after fixes. Build-challenge: 4 findings (F1–F3 mechanical remediated + regression tested, F4 architectural escalated → human fix → re-verified PASS). 5 Manual Verification steps deferred to live/admin sessions (logged in docs/deferrals.jsonl). Ready to ship. Plan: docs/plans/202607/341-three-runtimes-plan.md
```
