Verdict: PASS

<!-- verdict:end -->

# Design Summary

## Overview

Ship bookkeeping currently mutates or mis-records state on `feat/{FID}` while gating merge on a CI-validated PR head — an unwritten push contract each agent resolves differently. The design restructures `bkit-ship.md` into verify → base-check → integrate → re-validate → merge → close, with bookkeeping never pushed to the feature branch before merge. Three tiered carriers: a tested `bkit-ship-gate.sh` merge gate (Tier 1), prose invariants enforced by vitest (Tier 2), and an advisory status-hole detector (Tier 3). Key conventions: `BOOK_ROOT`/`BOOK_PATHS`, outbox durability, push-timing invariant decoupled from #341's `CAN_PUSH_DEV`, and `--match-head-commit` on every merge.

## Design Quality

Exceptionally thorough — seven findings traced to one root cause, evidence from three repos, explicit rejection/deferral of alternatives (merge queue, surgical patch, kernel extraction). Trade-offs named honestly (tiered carriers, advisory detector, skipped-lane vs full `run_level` assertion). Reviews incorporated: gh stub harness as deliverable, config-home rule, dev-lock windowing, run-selection contract, paginated jobs query. Minor gap: Success Criteria 1–2 lean implementation-specific though still testable.

## Acceptance Scenario

Narrative and five success criteria are user-outcome focused and measurable. Process sketch is eight `WHEN → THEN` lines (spec prefers 3–7). Key edge cases are comprehensive (stale green, CONFLICTING PR, concurrent staging, cloud runtime, capstone pagination). **Verdict:** adheres to `docs/plans/template.md` § Acceptance Scenario spec with minor process-sketch length deviation; no blocking violation.

## Breaking Changes

- New `.bkit/scripts/bkit-ship-gate.sh` (+ template mirror) and managed timeout config script
- `package.json` keys: `bkit.capstoneJob`, `bkit.ciWorkflow`
- Canonical fourteen `ship-*` step keys frozen (numbers may move)
- `bkit-ship.md` structural rewrite (~1244 lines) propagating to four rendered command surfaces
- `[bkit-ship-gate]` observability prefix; consumer CI contract in `docs/deployments.md`
- bats wired into pre-push (`pnpm test:bats`); new `tests/ship-gate.bats`, gh stub fixtures
- Ship drops unconditional rebase-on-resume, Step 3 prior-run diffing, Step 8 source-file retry loop

## Feasibility

Buildable on existing stack (bash, jq, gh, bats, vitest). Design corrects draft over-claims about test harness — gh PATH-shim + fixture corpus is first-of-its-kind here (~half day, WS-2 go/no-go). Capstone assertion strength verified against cited `ci.yml` lines. #341 overlap is sequencing risk, not a technical blocker. End-to-end proof requires consumer-repo manual runs (outside CI).

## Synthesis Coverage

Three brainstorm lenses converged on structural A/B rewrite spine; pragmatic lens contributed `BOOK_ROOT`/`BOOK_PATHS`; risk lens contributed outbox and tiered carriers; optimal lens contributed head-move observation trigger. Dropped: surgical patch, full kernel extraction (deferred end state), remove-branch-write-access premise, merge queue (unavailable). Reasonable pruning — kept best ideas without losing viable alternatives.

## Scope Alignment

Matches issue brief (Path A/B, bookkeeping off branch, `.deferred-blocked`, Failure Path, verification detector) plus comment clarifications (#341 runtime, unconditional dispatch, path-scoped staging). Absorbs related issues #74, #68, #209, #71. Slight expansion: config consolidation, documentation/rollback path, pre-push bats — all justified by gate durability. #341 serialisation explicitly scoped to WS-1, not deferred silently.

## Risks

- **#341/384 both rewrite `bkit-ship.md`** — must serialise or carve overlap (WS-1)
- Step 12 force-remove on shared worktree (scoped in WS-8)
- Capstone assertion assumes `pull_request ⇒ run_level=full`; skipped-lane refusal (code 16) closes common case; present-but-degraded runs remain residual
- gh API rate limits unmeasured under Path B poll loop
- gh stub harness unproven — Tier 1 cost hinge (WS-2 checkpoint)
- Verification depends on consumer-repo E2E, not green pipeline alone

## Action Items

_None — design ready for planning. Resolve #341 landing sequence as WS-1 before implementation workstreams._

## Outstanding Questions

- **Q:** Which lands first — #341 or #384 ship-touching work, and who re-derives? — **Recommended:** Serialise 384 after #341 WS-8/9/10/12 land; 384 re-derives its diff against #341's ship shape. Honour repo doctrine: one clone, one workflow at a time.
- **Q:** Can the gh stub harness be settled in ~one day? — **Recommended:** Treat WS-2 as go/no-go; if stub slips beyond a day, revisit Tier-1 carrier scope explicitly rather than absorbing silently.
- **Q:** How to handle present-but-degraded CI (non-skipped, narrowed coverage)? — **Recommended:** Accept as documented residual in `docs/deployments.md`; revisit only if a consumer materially diverges from scaffold.

## Suggested Workstreams

- **WS-1:** #341 overlap carve-out — Requires: []
- **WS-2:** gh stub harness + fixtures — Requires: [WS-1]
- **WS-3:** Config surface (`bkit.capstoneJob`, `bkit.ciWorkflow`) — Requires: [WS-1]
- **WS-4:** `bkit-ship-gate.sh` + bats — Requires: [WS-2, WS-3]
- **WS-5:** Gate distribution / dogfood mirroring — Requires: [WS-3, WS-4]
- **WS-6:** Bookkeeping contract + Tier-2 invariant test — Requires: [WS-1]
- **WS-7:** `bkit-ship.md` structural rewrite — Requires: [WS-4, WS-6, WS-8]
- **WS-8:** Failure Path + worktree hardening — Requires: [WS-4, WS-6]
- **WS-9:** Rendered mirrors — Requires: [WS-7, WS-8]
- **WS-10:** Documentation + contract publication — Requires: [WS-4, WS-7]
- **WS-11:** Tier-3 status-hole detector (advisory) — Requires: [WS-6, WS-7]
- **WS-12:** E2E validation + rollout — Requires: [WS-4, WS-5, WS-7, WS-9, WS-10, WS-11]

## Recommended Next Step

```text
/bkit-plan 384
Brief: Plan gate-first landing (WS-2→4 before prose rewrite WS-7). WS-1 must resolve #341 serialisation before implementation. Design: docs/plans/202607/logs/384-ship-bookkeeping/design-v3-organised.md
```
