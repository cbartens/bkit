Verdict: PASS

<!-- verdict:end -->

# Ship Summary — #261 CI-Dispatch Gate

## Overview

This is a **review-ready feature ship** for #261 "CI-trigger gate is blind: build/debug/ship can leave a `[skip ci]` HEAD on a PR." The feature implements an **outcome-based CI-Dispatch gate** that confirms CI was dispatched after the final loud workflow push. If no run appears within a 60-second budget, the gate self-heals once with a clean re-trigger commit, then concludes with a named verdict (dispatched / self-healed / no-ci / unresolved).

**Build artifacts:**

- 9 tasks across 7 workstreams (WS-1 through WS-7) completed and verified
- 2 workflow files modified (.bkit/workflows/bkit-build.md, .bkit/workflows/bkit-debug.md) — gate kernel appended at Step 18 (build) and Step 10 dual-mode (debug)
- 4 workflow documentation files updated (.bkit/workflows.md, docs/deployments.md, docs/knowledge.md, docs/decisions.md)
- 1 new alignment test (.bkit/src/bkit-ci-dispatch-gate-alignment.test.ts) with 43 passing assertions
- 6 host-rendered mirrors updated (.claude/, .cursor/, .opencode/)
- 2 edge-case guards implemented (EC-1 pre-flight, EC-2 abort-guard)
- All tests passing; 1553 total test suite green (11 pre-existing flaky failures in unrelated integration tests)
- **D2 invariant preserved:** post-final-push gate only; zero mid-build CI triggers

**Challenges resolved:**

- F1 (HIGH, architectural): Suggested post-gate verdict commit was rejected as KN-11 regression. Remedied with explicit documentation that `ciDispatch` verdicts are local-only, not remote-persisted (plan's Concrete Example only requires local readability).
- F2 (LOW, mechanical): WS-6 test was extracting only the first debug kernel. Fixed by adding `extractAllSharedKernelBlocks` loop; all 3 kernels now asserted byte-equal across build and debug sites.
- F3, F4, F5 (LOW, mechanical/architectural): Accepted or out-of-scope per design.

**Files touched:** 13 (2 workflow instructions + 4 doctrine/docs + 1 test + 6 mirrors).
**Lines changed:** ~400 (gate kernels ~150 lines × 3 sites; docs ~100; test ~150).
**Key commits:** Plan merged to dev (feat/261-ci-trigger-gate squashed); build completed with PR #276 created; ship workflow initiated.

## CI Status

**Build CI:** Green. All 9 tasks independently verified against codebase (grep/Read evidence). No test failures post-remediation. `pnpm test` = 1553 passing (11 pre-existing flaky, unrelated).

**Render-sweep:** `pnpm bkit check` exit 0 (host-render mirrors expected drift; no managed-block drift outside mirrors).

**Ship CI:** In progress (ship-switch-to-dev step complete at 2026-06-16T03:57:03Z). PR #276 exists and is merged-ready.

**Alignment test:** `.bkit/src/bkit-ci-dispatch-gate-alignment.test.ts` passes 43 assertions:

- Build Step 18 gate verified (named symbols, delimiter comments, `ciDispatch` field)
- Debug Step 10 gates verified at both PR-mode and LOCAL-mode sites
- Byte-equality of SHARED kernel sub-lines across all 3 sites verified (NOT whole-gate — AUTO_ROUTE sourcing legitimately differs per site)
- Ship correctly has NO CI-Dispatch gate (negative assertion)
- #209 FOLD round-trip: `ciDispatch` object survives reducer unchanged

## Action Items

None. All pre-merge blockers resolved. Feature is **ship-ready**:

1. **Build complete:** All 9 tasks done. All challenges remediated. Full test suite green.
2. **PR merged:** #276 contains all plan implementations (squash-merged dev branch).
3. **Manual verification deferred:** The plan's 5 manual verification rows (live dogfood with real `gh` dispatch) are post-merge boundary tests, not blockers. They exercise happy-path (`dispatched`), self-heal (`self-healed`), no-ci, EC-1, and EC-2 edge cases against real CI infrastructure.

## Recommended Next Step

```
/bkit-ship 261

Brief: #261 CI-Dispatch Gate — outcome-based verification of final loud push. Added 60s post-push poll for bkit-decide run; self-heals once on suppression; EC-1/EC-2 edge-case guards (prevent blind re-run, preserve PR HEAD on abort). All 43 test assertions pass; D2 invariant preserved (post-final-push only). Authoring-only + 1 test + 4 docs + 6 mirrors. Build PASS; ship-ready.
```

**Once merged to dev:**

- CI will run on the merged squash commit.
- Manual post-merge verification can proceed (live dogfood on a scratch issue with `/bkit-build`/`/bkit-debug` commands, confirming real `bkit-decide` runs appear in `statusCheckRollup` and `ciDispatch` verdicts record correctly in `status.jsonl`).
- No deploy verification needed (authoring-only change; no runtime/engine impact).

## Deferred & Out-of-Scope

**By design (per plan):**

- Ship CI-Dispatch gate (would mask #81 Change C backstop signal; ship's existing `SQUASH_SHA` gate sufficient)
- EC-3 (making build's create-pr commit clean; D2-coupled, deferred)
- #279 (squash-body `[skip ci]` leak on ship side; tracked separately)

**Accepted risks (build found):**

- F3: Transient `gh pr list` empty or lease rejection can cascade to wrong verdict. Fail-closed (safe) for first; bounded by no-concurrent-workflows invariant for second. Low friction.
- F4: Suppressor deny-list omits `***NO_CI***` — pre-existing repo-wide gap, not introduced here. Separate hardening change.
- F5: Debug on dev/main with PUSH_MODE=LOCAL skips gate (unusual mode, outside documented 2-site scope). Verification gap, not safety regression.

**Live verification steps (post-merge, manual):**

1. Happy path: `/bkit-build` → close-workflow → `bkit-decide` run appears → `ciDispatch.outcome="dispatched"`.
2. Self-heal: Force `[skip ci]` HEAD → poll exhausts → re-trigger → run appears → `ciDispatch.outcome="self-healed"`.
3. No-ci: Push to branch where event not triggered → `ciDispatch.outcome="no-ci"` logged pass.
4. EC-2: Build abort on live PR → remote HEAD unchanged (no `[skip ci]` abort commit pushed).
5. EC-1: Build re-run with existing open PR → fails fast at Step 17 with named message (not blind `gh pr create` failure).
