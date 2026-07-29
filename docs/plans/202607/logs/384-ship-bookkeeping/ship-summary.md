## Verdict: PASS

<!-- verdict:end -->

# Ship Summary

## Overview

Successfully shipped PR #395 (`feat/384-ship-bookkeeping`) which restructures `.bkit/workflows/bkit-ship.md` from an incompatible push-contract/CI-validation mismatch into a clean, tested Path A/B architecture with tiered quality carriers. The feature touches 95 files (+11,089/-1,273 lines), delivering:

- **Tier 1:** Tested `bkit-ship-gate.sh` merge gate (16/20 bats cases, 9 exit codes)
- **Tier 2:** Prose invariants enforced by `bkit-ship-invariants.test.ts` (now GREEN, 20 assertions)
- **Tier 3:** Advisory status-hole detector (`bkit-status-hole-detector.ts`)
- **Core fix:** Path A (dev hasn't moved) vs Path B (integration required) with mandatory re-validation
- **Seven findings resolved:** Push contract now explicit, single status tree, no head moves after validation, bookkeeping never rides the branch

## CI Status

**Path B integration (dev had moved 5 commits since build):**

- Validated PR head `6f539385` became non-mergeable
- Orchestrator merged origin/dev into worktree — **clean integration** (only overlap file was `status.jsonl`, no textual conflicts)
- Pushed to `74a76389`, CI re-validated (run `30419431014`, **all green**)
- Squash-merged to `80660ac0` on dev
- **MERGE_ATTEMPT=1, verdict PASS**

**Pre-fix workflow friction (worked around):**

- Step 6.8 `counter_current(ship-merge-pr)` refused 0 at first attempt (position-2 helper at pre-write site)
- Orchestrator used Step 6.1 `counter_next` value (1) instead — proceed unblocked

## Action Items

None — clean ship with only expected artifacts.

## Recommended Next Step

```
_No further bkit command — feature shipped._
```

Brief: Feature landed successfully via Path B re-validation. First real consumer Path A/B ships will provide live E2E evidence; mode-3 cloud runtime E2E deferred to `341-live-run-verification-mode-1-and-mode-3`. No follow-up action required.

## Deferred & Out-of-Scope

**Blocking Deferrals:** None

**Exempt (out-of-scope):**

- `384-extract-ship-git-ci-mechanics-into-a-tested-kernel` — Explicit design out-of-scope (Tier-1 gate ships, mechanics stay prose-constrained)
- `384-promote-status-hole-detector-from-advisory-to-gate` — Explicit design out-of-scope (detector ships advisory/fail-open by design)
- `384-ship-without-a-writable-branch-checkout-outside-b2` — Explicit design out-of-scope (B2 is common case; sub-findings absorbed)
- `per-workflow-rollback-path-for-shipped-bkit-workflow-changes` — Explicit design out-of-scope (cross-cutting gap, mitigated in-scope by `BKIT_SHIP_GATE_OVERRIDE` + rollback runbook)
- `384-ship-redesign-sequence-after-341` — Satisfied (status.jsonl confirms #341 landed first)
- `384-merge-queue-unavailable-private-non-enterprise` — Build out-of-scope mirror (Enterprise/Beta unavailable)
- `384-required-status-checks-on-dev-via-bkit-protect-main` — Build out-of-scope mirror (additive policy, branch-protection APIs 403 on this tier)
- `384-mode-3-bookkeeping-e2e-deferred-to-341-live-run` — Out-of-tree dependency (depends on OPEN `341-live-run-verification-mode-1-and-mode-3`)
- Live consumer-repo E2E (SC1/2/4/5) — Declared manual-terminal-workstream deferral (mechanical coverage in place: bats fixtures, invariant GREEN, real Path A evidence from #341)

**Known artifact:** `ship-merge-pr` status row was committed to the worktree branch AFTER the squash merge, so it is absent from the dev-side `status.jsonl`. This is the expected pre-fix bookkeeping-split artifact this very PR fixes (bookkeeping now writes to dev tree, not feature branch).
