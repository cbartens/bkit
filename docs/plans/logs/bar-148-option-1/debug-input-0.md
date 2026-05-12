# Debug Input — bar-148-option-1 — Attempt 0

## Session Parameters

- **Debug:** local
- **Observe:** off
- **Attempt:** 0
- **FID:** bar-148-option-1
- **Issue:** BAR-148

## Task Description

BAR-148 "Auto-route build PRs to ship/debug after CI" — bkit-ci-router feature.
All Phase A–E build work is complete and committed. One critical ordering bug (`commentId`) blocked the build challenge.

## Build Failure Summary

The build workflow (attempt 1) failed at Step 9 (Build Challenge) because:

**F1 — `commentId` ordering bug** (CRITICAL)

In all five orchestrator markdown files, the `jq` block that writes the initial `status.json` entry includes `--arg cid "{COMMENT_ID}"` BEFORE the `save_comment` call that resolves `{COMMENT_ID}`. The placeholder is empty at write time; the router reads `commentId: ""` from `status.json` and immediately fails.

Exact locations:
| Orchestrator | Status init (commentId written empty) | `save_comment` (ID resolved) |
|---|---|---|
| `.agents/workflows/bkit-build.md` | line 103-104 | line 115 |
| `.agents/workflows/bkit-debug.md` | line 113-114 | line 126 |
| `.agents/workflows/bkit-plan.md` | line 83-84 | line 95 |
| `.agents/workflows/bkit-design.md` | line 82-83 | line 94 |
| `.agents/workflows/bkit-ship.md` | line 102-103 | line 114 |

## Recommended Fix (from build-handover.md)

**Option 3 (split write + C8 ordering test):**

1. Split the status-init write into two `jq` passes in all 5 orchestrators: first pass writes the initial entry without `commentId` (or with `commentId: ""`), second pass immediately after `save_comment` patches `commentId` with the real value.
2. Extend `release-workflow.test.ts` C8 to assert that the `save_comment` line index < `commentId`-write line index in each orchestrator.

## Verified Resolutions (DO NOT ROLL BACK)

- C9f test fix at `.agents/scripts/release-workflow.test.ts:417-418` — regex assertions replace old `.not.toContain("MAX_DEBUG_ATTEMPT")`. Commit: `8a3e0febbfeea0f3961b594501b057f53d08a7c3`.
- All Phase A–E build work: templates, installer module, tests C1a–C9g, docs D1–D7, mirror regen — all complete and committed.

## CI Logs

N/A (DEBUG_MODE=local)

## Plan

`docs/plans/active/bar-148-option-1-plan.md`

## Issue Description

See BAR-148 Linear issue — bkit-ci-router feature implementing auto-routing from CI completion to bkit-ship or bkit-debug via claude-code-action.

## Prior Comments

See Linear issue BAR-148 comments — build workflow comment (id: 6f232e86-3acb-48dc-b403-b52bc353c3e2) contains full build history and handover.
