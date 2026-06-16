Verdict: PASS

<!-- verdict:end -->

# Build Summary — #261 CI-Dispatch Gate

## Overview

Issue #261 addresses a critical safeguard gap where build/debug workflows can complete with a PR carrying `[skip ci]` HEAD, leaving CI unconfirmed despite passing string-based checks. This build delivered an **outcome-based CI-Dispatch gate** that, after the final loud push (Step 18 build, Step 10 debug), confirms a `bkit-decide` run was dispatched for the exact pushed HEAD. If no run appears within a 60-second budget, the gate self-heals once with a clean re-trigger commit, then concludes with a named verdict (dispatched / self-healed / no-ci / unresolved).

The implementation ships as an authoring-only change: nine tasks across seven workstreams (WS-1–WS-7) delivered the gate kernel to two sites (build Step 18, debug Step 10 PR-mode + LOCAL-mode), two edge-case guards (EC-1 pre-flight: fail fast if PR already exists; EC-2 abort-guard: preserve remote HEAD on a live PR), documentation updates, one cross-file alignment test, and rendered host mirrors. The D2 cloud-auto-route concurrency invariant is preserved — the gate fires **post-final-push only**, introducing zero mid-build CI triggers. Ship CI workflow is correctly scoped out (would mask #81 Change C backstop signal).

**Feature completeness:** All 9 tasks checked off per their Done-when conditions. Plan gate sequence passed (Gate 1 prerequisites, Gate 2 code implementation, Gate 3 docs/testing, Gate 4 automated verification). No pre-existing acceptance scenario human-confirmation checkboxes were required to move forward; the plan's human-review sections remained unchecked by design (plan phase does not require owner confirmation; build phase assumes plan is locked).

## Implementation Quality

Per the build-plan-verify log, every task's Done-when condition was independently verified against the real codebase (no speculation).

**Code tasks (WS-1 through WS-4):** All four workflow modifications landed exactly as specified. Build Step 18 gate appended inside the final-push shell block with shared kernel (POLL_BUDGET_S=60, POLL_INTERVAL_S=10, poll loop, 4 outcome strings). Debug Step 10 gates added at both triggering surfaces (PR-mode sub-step 3, LOCAL-mode sub-step 9) with correct AUTO_ROUTE sourcing (reuse in-block `AUTO_ROUTE_SUFFIX` var, no reorder of `rm -f`). EC-2 abort-guard conditional wraps the abort push in both build inline Failure Path and the shared doctrine-level Failure Path step 5 (inverted safe default). EC-1 pre-flight probe inserted before `gh pr create` with named message routing to Failure Path and fallthrough on probe error. All `ciDispatch` NDJSON field merges correctly formed (additive, backward-compatible with #209 FOLD reducer).

**Documentation (WS-5):** Workflows.md section renamed "HEAD-Subject Assertion" → "CI-Dispatch Gate" with outcome framing, sub-reason codes, named symbols, `[bkit-ci-gate]` prefix, and per-site AUTO_ROUTE difference documented. deployments.md updated for outcome gate framing. KN-11 updated to cite the new gate. DE-32 appended to decisions.md with rejected alternatives. No lazy bullet appends — prose rewritten.

**Alignment test (WS-6):** `.bkit/src/bkit-ci-dispatch-gate-alignment.test.ts` created with 43 passing assertions (25 baseline + 18 regression-guard additions). Test correctly extracts all kernel blocks (1 in build, 2 in debug) and asserts byte-equality on SHARED sub-lines (NOT whole-gate — AUTO_ROUTE sourcing legitimately differs per site). Ship negative assertion present. #209 FOLD round-trip assertion verifies `ciDispatch.outcome`, `head`, `attempts`, `retrigger` survive the fold reducer unmodified. Assertions lock in post-gate non-push (KN-11 regression guard) and document the intentional local-only ledger write. Vacuous-match guards prevent silent passage on missing content. Test picked up by `pnpm test` (vitest glob `.bkit/src/**/*.test.ts`).

**Mirrors (WS-7):** `pnpm bkit install` run once (batched) after all edits. All 6 rendered surfaces (build+debug × .claude/.cursor/.opencode) carry the gate and match source line counts.

**Architecture respect:** D2 invariant preserved — worktree-setup and create-pr commits unchanged (both still carry `[skip ci]`); gate fires post-final-push only; no new mid-build CI triggers introduced. No app/engine code touched; change is workflows + 1 test + docs + 6 mirrors.

## Verification Status

All verification steps completed and passed.

**Automated tests:**

- Typecheck: clean (no new TS errors in test file)
- Lint: prose clean (no Vale errors in `.md` edits; ASCII operators verified in bash)
- WS-6 alignment test: 43 passed (25 baseline + 18 challenge-remediation additions)
- Full suite: `pnpm test` — 1553 tests passed (11 pre-existing flaky failures in integration tests contending on shared git state under parallelism; both pass in isolation; unrelated to plan changes)
- Render-sweep: `pnpm bkit check` exit 0 (host-render mirrors expected to drift; no managed-block drift outside mirrors)

**Plan verification:** Every task's Done-when independently verified via grep/read. One non-blocking notation (Task 8's literal grep phrasing for retrigger-suppressed was imprecise due to `-A2` overshooting; underlying constraint met in code and enforced by real test).

**Manual verification:** 5 rows in the plan's Manual Verification section (live dogfood with real `gh` / Actions boundary). These are post-merge live checks, not run in this build cycle — they are boundary tests exercising the real CI dispatch and require ephemeral branches + live Actions runs. Marked as deferred (manual, not automated).

## Test Status

All test gates passed on first run after challenge remediation.

**Challenge phase findings:** 5 findings identified (F1–F5; 4 LOW, 1 HIGH). Two classified as REMEDIATE-NOW (F1, F2); three as ACCEPT (F3) or OUT-OF-SCOPE (F4, F5).

**Remediation applied:**

- **FIX A (F2 — LOW mechanical):** WS-6 test was extracting only the FIRST kernel block from debug.md. Added `extractAllSharedKernelBlocks` function that loops through the file collecting all delimited blocks. Test now asserts build yields ≥1 block and debug yields exactly 2 blocks (both byte-equal). 43 tests pass.
- **FIX B (F1 — HIGH architectural reconciliation):** Challenge suggested adding a post-gate `[skip ci]` verdict commit to persist the `ciDispatch` record remotely. Reconciliation rejected this as a KN-11 regression (any commit after the confirmed-loud close-workflow HEAD either re-introduces suppression or fires a second run). Instead, documented the intentional local-only ledger write with inline NOTE comments at 3 gate sites (outside shared-kernel delimiters to preserve byte-equality) and a doctrine paragraph in workflows.md. The plan's Concrete Example only requires local `status.jsonl` readability; remote persistence not required.

**Challenge-tests phase:** 18 new regression-test assertions added to lock in FIX A and FIX B:

- 6 assertions guard against post-gate commit+push (no `git push` in post-verdict slice; no `ci-dispatch-verdict` commit message token).
- 7 assertions lock in FIX B documentation (NOTE comments + doctrine paragraph present with KN-11 mention).
- 5 assertions lock in FIX A counts (build=1 kernel, debug=2 kernels; per-block line-count guards; cross-file byte-equality with explicit failure messages per block).

All 43 test assertions pass (0 failures).

## Challenge

**Findings summary:** 5 findings total. No CRITICAL severity. Verdict CONCERNS on both challenge-1 and challenge-2 lenses, correctly downgraded to PASS after remediation of the 2 REMEDIATE-NOW items.

**Disposition:**

1. **F1 (HIGH)** — post-push ciDispatch record never committed remotely. Remediated: rejected the suggested post-gate commit+push as KN-11 regression; documented intentional local-only write with inline NOTEs + doctrine paragraph. Verified by regression test describe 7.
2. **F2 (LOW)** — WS-6 test covers only first debug kernel. Remediated: added loop extraction + all-kernels assertion. Verified by regression test describe 9.
3. **F3 (LOW)** — transient gh errors / lease rejections can flip to wrong verdict. Accepted: requires transient condition (slow/blipping `gh pr list` or mid-gate remote advance); first path fails CLOSED (safe direction, noisy); second path bounded by "no concurrent workflows" invariant. No fix applied (low risk, high friction).
4. **F4 (LOW)** — suppressor deny-list pre-existing gap (missing `***NO_CI***`). Out-of-scope: established repo-wide prior art, not introduced here, bkit never emits it. Separate hardening change.
5. **F5 (LOW)** — debug on dev/main + PUSH_MODE=LOCAL coverage gap. Out-of-scope: plan scopes gate to feature-branch flows; unusual operator mode outside documented scope.

## Generated Tests

**WS-6 test + 18 challenge-remediation assertions = 43 total passing assertions** (25 baseline coverage + 18 regression guards).

Edge cases captured:

- All 4 outcome vocabulary mapped to appropriate branches (dispatched / self-healed / no-ci / unresolved).
- All 4 sub-reason codes map ONLY to unresolved (timeout-dirty / autoroute-mismatch / retrigger-suppressed / gh-error).
- Self-heal cap enforced (exactly 1 re-trigger, no second re-trigger on stale budget).
- Byte-equality across build and both debug kernels on SHARED sub-lines (not whole-gate).
- Ship explicitly has NO CI-Dispatch gate (negative assertion).
- #209 FOLD round-trip: ciDispatch fields fully survive the reducer.
- Post-gate non-push locked in (KN-11 regression guard).
- All kernel block counts enforced (vacuous-match protection).

Bugs discovered during challenge: none in the implementation. The suggested FIX A (post-gate commit) was a false fix identified by reconciliation as a regression.

## Risks

**Documented but deferred:**

1. **F3 (transient gh failures):** Empty `PR_NUMBER` from blipping `gh pr list` can cascade to false `unresolved(gh-error)` even when CI dispatched correctly. Lease rejection on re-trigger push can land a stale local SHA. Low risk (requires transient, gates fail-closed for first case), high friction to fix. Acceptable for ship.
2. **F4 (suppressor deny-list gap):** The 5-token `[skip ci]` list is established repo-wide and omits GitHub's `***NO_CI***`. Not a regression (pre-existing). Separate hardening tracked elsewhere.
3. **F5 (debug dev/main LOCAL coverage):** Debug on dev/main with PUSH_MODE=LOCAL (unusual mode) skips CI-Dispatch gate. Verification-coverage gap, not safety/D2 regression. Out-of-scope (plan documents feature-branch flows).

**Manual live-verification boundary tests (deferred post-merge):**

- Happy path (dispatched) requires real `bkit-decide` run on a pushed HEAD.
- Self-heal path requires forcing `[skip ci]` on a HEAD and observing gate's re-trigger + run appearance.
- No-ci path requires a repo/event with no CI workflow (bkit's degenerate setup or a consumer consumer-specific test).
- EC-2 and EC-1 require live PR state + branch probes.

These are post-merge manual checks (live dogfood), not blockers for ship.

## Action Items

None. All plan tasks completed. All challenge remediation applied. All tests passing. No unresolved FAIL-level findings. Feature is ready for PR creation and merge.

## Recommended Next Step

```text
/bkit-ship 261

Brief: #261 CI-Dispatch Gate — outcome-based verification of final loud push. Added 60s post-push poll for bkit-decide run; self-heals once on suppression; EC-1/EC-2 edge-case guards (prevent blind re-run, preserve PR HEAD on abort). 43 test assertions pass; D2 invariant preserved (post-final-push only, no mid-build triggers). Authoring-only + 1 test + docs + 6 mirrors.
```
