Verdict: PASS

<!-- verdict:end -->

# Build Summary

## Overview

Built #650: every bkit workflow runs from the prompt alone, with no issue, design or plan. A run with no issue warns and continues; the FID comes from the prompt, a `feat/` branch (verbatim, linked to an issue only when `.bkit/issues.jsonl` has a feature row for it), or a mint (`bkit fids free` takes `-b`, `-c`, … when an earlier run of the minted name finished). `/bkit-debug` on `dev` works in place on its own paths and commits, pushes only those, and waits for the `dev` CI run. `bkit prs open` / `prs merge` refuse a base other than `dev`; `/bkit-ship` of `dev` or `main` refuses and stops.

19 of 19 tasks ticked across 2 sub-plans (`650-workflows-prompt-alone-plan-1.md` Engine: Tasks 1–5, 11–13, 6; `650-workflows-prompt-alone-plan-2.md` Wording / Workflows / Docs / Mirrors / Verification: Tasks 7–10, 14–19). Steps 12–17 of this build run were done by the orchestrator in place of the subagents, on human instruction (2026-10-23), after the earlier session stopped at Step 11.

## Implementation Quality

- Sub-Plan 1: `build-plan-verify-1-1.md` PASS after the test-first redo of Task 11 and the Task 2 runs-context guard (bc3d010a → 581b4f25 → 188dd8e0 → d186268e), which replaced build run 1's retroactive reds (`build-handover.md`).
- Sub-Plan 2: `build-plan-verify-2-3.md` PASS (attempt 3).
- Holistic: `build-plan-verify-holistic.md` CONCERNS, 3 integration gaps; all three closed in b74c116e (debug close exit 10 → Foreign path STOP, line-1 no-issue warning on the two new STOPs, CHANGELOG entry for the gate-log fix). Task 14 ticked after gap 1.
- Challenge: 12 findings (`build-challenge.md`), all remediated (`build-challenge-remediate-log.md` PASS, 5cd42f91). Findings 6 and 7 were architectural; the human decided both rules and they are recorded in `docs/decisions.jsonl` (`650-issue-less-runs-warn-and-continue` updated, `650-repeated-issue-less-mint-takes-free-suffix`).
- `dist/` rebuilt; `bkit check` 0 writes (host-render mirrors in sync).

## Verification Status

All 19 tasks verified. Sub-Plan 1: 4 verify attempts in run 1 (FAIL, aborted), PASS on the run-2 redo. Sub-Plan 2: 3 attempts. Holistic: 1 attempt, gaps closed by hand afterwards and re-gated (`pnpm bkit:gate:static-unit` exit 0). Gates 1–4, Pre-Flight, Security & Privacy, Mandatory Tasks and Verification Plan checkboxes in both sub-plans are unticked: human review.

## Test Status

`run-tests-1.md` FAIL: 7 tests in 3 files timed out at 5000ms under host load, no assertion failed (`build-failure-diagnose-1.md`); the three files passed alone (190 tests). `run-tests-2.md` PASS: `pnpm bkit:gate:static-unit-integration`, unit 135 files / 5258 tests, integration 46 files / 1527 tests. After the holistic-gap prose fix, `pnpm bkit:gate:static-unit` exit 0 again.

Live dogfood from the packed tarball (`cbartens-bkit-5.5.1.tgz`) in clean dirs outside the repo, github tracker: `bkit install --claude` renders all five workflows with the `**No issue:**` bullet; `bkit fids parse` gives `feat/upgrade-react-19` → `upgrade-react-19` issue-less, `feat/42-foo` → issue-less with no `.bkit/issues.jsonl` row and `issueId` 42 with one, `feat/Fix_CI` → exit 3; `bkit fids free` gives `dev-ci-failures`, then `dev-ci-failures-b` after a finished run. Upgrade from published 5.5.0 to the tarball: `bkit upgrade` exit 0, `bkit check` 0 writes.

## Challenge

1. HIGH: dev push failed when local `dev` was behind `origin/dev`. Resolved (ancestry check, explicit SHA push, replay fallback).
2. MEDIUM: in-place `dev` run could pick the wrong or no shared-checkout record. Resolved (`--fid` binding, fail closed with exits 20 / 14, lock-fresh busy check, setup guard).
3. MEDIUM: re-trigger head not re-held as `{DEV_SHA}`. Resolved.
4. MEDIUM: ledger rows appended before the own-path refusal. Resolved (`ownSet` before any append).
5. MEDIUM: `--issue` not compared to the FID's id. Resolved.
6. MEDIUM, architectural: issue-less run on a hand-named branch with a digit word failed. Resolved per human decision (branch suffix verbatim, issue linked via `.bkit/issues.jsonl` inside `bkit fids parse`).
7. MEDIUM, architectural: repeated issue-less mint shared one counter. Resolved per human decision (`bkit fids free`, `-b`/`-c` suffix).
8. LOW: design / plan MCP merge fallback lacked a base `dev` assert. Resolved.
9. LOW: `main` guard spellings and merge base race. Resolved.
10. LOW: short `--sha` never matched. Resolved (40 hex required).
11. LOW: ledger prefix hash skipped eol filters. Resolved.
12. LOW: user-staged ledger lost the run's rows. Resolved.

## Generated Tests

Every finding has a regression test (`build-challenge-tests.md`), added with the fixes in 5cd42f91 across 12 test files; no bugs found while running them.

## Risks

- A FID taken from a `feat/` branch whose issue has no `.bkit/issues.jsonl` row yet runs issue-less (no labels or comments) until a phase close writes the row; later phases then link the issue.
- Diff coverage of the challenge and holistic reviews was partial (Large Diff Guard, ~195k-line diff, mostly run logs).
- Child-process tests at a flat 5000ms limit time out under heavy host load (`build-failure-diagnose-1.md` out-of-scope note).

## Action Items

None

## Recommended Next Step

```text
/bkit-ship #650
Brief: issue-less workflows, debug in place on dev, dev-only PR base guards; all 12 challenge findings fixed (6 and 7 per human decision); tarball install and upgrade dogfooded. Tick the sub-plan review gates. Plan: docs/plans/202610/650-workflows-prompt-alone-plan.md
```
