Verdict: FAIL
Failures: 2
Fixable: false
Tasks: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15
Loosened: none
Fingerprint: 50d3e00a85fa10a853547a076b504eb3f42a798c8f43fe029ca8a2f36fb09708
<!-- verdict:end -->

# Plan Verification

## Scope

Holistic

## Groups Verified

5 of 5 (the plan has 5 groups).

## Integration Gaps

2 gaps. Both are failing tests from `bkit tests changed --base=origin/dev --fallback=bkit:gate:static-unit`, which exited 1 (`bkit:gate:changed` FAIL in its `related` and `named` phases). Neither test is in a file, or covers code, that any group of this plan changes. No integration gap between the plan's groups was found.

- `.bkit/core/engine/commands/land.test.ts:440` `pushToDev > dev moved before every push: exhausted, nothing landed` failed in both phases with `spawnSync git ETIMEDOUT`. The machine load average was 10.5 to 30 on 10 cores. `docs/failures.jsonl` already holds this test OPEN as a timeout under the full gate.
- `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts:700` `analyses dense script sources in linear time` failed in both phases. It measured 2805 ms, then 3048 ms, against a 1000 ms wall-clock budget (assertion at :704).

Both are `Fixable: false`. The plan does not say whether a test it never touches, which fails on timing under machine load, may be accepted. The holistic fix round cannot close them inside this plan's scope, so the owner decides: accept them as known load failures in a decision record, or rerun the gate on a quiet machine.

## Previously Attempted

None for the holistic pass. This is attempt 1. The group verifies it builds on, last attempt of each: `build-plan-verify-1-2.md` (PASS), `build-plan-verify-2-2.md` (PASS), `build-plan-verify-3-2.md` (PASS), `build-plan-verify-4-1.md` (PASS) and `build-plan-verify-5-2.md` (PASS).

## Notes

- Partial diff coverage: `tmp/bkit-diff-887-review-doc-starters.md` shows mostly the installed `design-doc-mermaid` skill. The engine, starter and doc changes were read straight from `git diff origin/dev...HEAD` and the files.
- All 15 tasks meet their `DONE WHEN`, checked again across groups:
  - All 41 `Derived Test Matrix` tests exist, one each in the target file their row names.
  - No new test skips, type escapes or linter disables appear in the diff.
  - `dist/` was committed with every engine source change (`2578727f1`, `40b2b5432`, `06a1d2fcb`). Later commits change only tests and docs.
  - `node dist/cli.js check` exits 0 with `0 write(s) would occur`, so there is no mirror drift. It prints the adoption-order pointer and the `project-docs` tip.
  - `.bkit/templates/docs/testing.md` has one `## Test first` heading (line 491), after `## What each tier must do`.
  - No starter and no `UNAUDITED_DOC_SECTIONS` key holds `Project facts to record`.
  - "Template is shape, prompt owns rules", "holds shape only" and "promote after the capstone" are gone from the files named.
  - No fenced block in `docs/*.md` holds `▼`, `▲`, `┌` or `┐`.
  - `DETAILS.md:325`, the tip's `line` and `.bkit/core/.bkit/templates.md:666` read the same.
  - `docs/architecture.md:31` names `adoptedProjectDocPath`.
  - The `docs/observability.md` table has no `project-docs-empty` row.
- Integration between groups:
  - Group 1's chart feeds the **Fill these first** / **Finish against** checks of the Group 2 and 3 starters, through `starterShape`.
  - Groups 2 and 3 set the `TOPIC_INFO` scopes that `projectDocRow` is checked against.
  - Group 4's tip calls `detectProjectDocs` without the ignore filter. `runPostInstallCheck` (`.bkit/core/engine/checks/after/index.ts:482-485`) now applies `isAdvisorySuppressed`, and it and the tip are the only callers.
  - Task 13's `adoptedProjectDocPath` uses Task 12's affirmative matcher. `formatTemplateChanges(changes, cwd)` takes a required `cwd`, and `upgrade.ts` passes `process.cwd()`.
  - Group 5's citation test passes against the starters from Groups 2 and 3.
  - Every test file this plan changed passed in the gate's `named` phase: `project-docs.test.ts`, `catalogue.test.ts`, `tools.test.ts`, `template-copies.integration.test.ts`, `upgrade.integration.test.ts`, `shipped-docs-refs.test.ts` and `dogfood-templates.test.ts`.
- Failures that are not gaps, because each one passed in the other phase of the same run (load timing, not a broken test):
  - The `related` phase had 22 failures in 7 files. The `steps.test.ts`, `locks.test.ts`, `worktrees.integration.test.ts` and `upgrade.integration.test.ts` (MCP jira entry, 58.5 s timeout) failures passed in the `named` phase, and so did 11 of the 12 `land.test.ts` failures.
  - `tracker.integration.test.ts` `preserves substantive step results under every comment boundary fault` failed only in `named`, with a 70.2 s timeout. `docs/failures.jsonl` holds `tracker-boundary-fault-matrix-concurrency-timeout` for it.
  - `test-file-script.integration.test.ts` (awake lock release) ran only in `related`. It is a timing failure in a file this plan does not touch.
  - Free disk was 3 GB during the run.
- I reran `guardrails-cursor.integration.test.ts`, `land.test.ts` and `test-file-script.integration.test.ts` alone (`pnpm bkit:test:file`), and the rerun finished just after the coordinator asked for the report. It failed 9 of 138 tests, a different set from the gate run, at a load average of 146 on 10 cores. That supports timing under load as the cause, but it does not prove these tests green, so the two gaps stand.
- Task 11 `DONE WHEN`: the string `project-docs-empty` is still in `.bkit/core/engine/checks/after/tools.test.ts:543`, as the planned test's negative assertion `not.toContain("project-docs-empty")`. I agree with `build-plan-verify-4-1.md` that this is not a gap. The assertion proves the criterion the grep stands for, and removing it would loosen a planned test.
- `docs/deferrals.jsonl` `864-move-project-docs-challenge-low-bkit-core-engine-install-project-docs-ts-429` is still OPEN. Task 12 fixed its cause. Closing the row is the ship deferred sweep's job, not a build `DONE WHEN`. The thirteen `887-*` decision rows and seven `887-*` deferral rows exist.
- bkit's own `docs/data-schema.md` and `docs/noise.md` are reported `project-docs-unpopulated`. They are older starter copies that the plan's Out of Scope row defers.
- No test-first audit report was supplied for this pass, and no `build-decision-*.md` records exist for this run.
- `docs/observability.md` does not apply further: the plan adds no new runtime error path.

## Identified Gaps Log

2 gaps.

INTEGRATION: `.bkit/core/engine/commands/land.test.ts` `pushToDev > dev moved before every push: exhausted, nothing landed` failed in both phases of `bkit tests changed --base=origin/dev` (git ETIMEDOUT under load average 10-30 on 10 cores); no group of this plan touches `land.ts` or its test, and `docs/failures.jsonl` holds this failure OPEN as a timeout under the full gate, so closing it needs an owner choice (accept as pre-existing load flake, or rerun on a quiet machine) the plan does not make — Fixable: false
INTEGRATION: `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` `cursor guardrails.cjs — shell edit evidence > analyses dense script sources in linear time` failed in both phases (2805 ms and 3048 ms against a 1000 ms wall-clock budget, at :704) under the same load; no group of this plan touches the guardrails hook or its test, so closing it needs an owner choice the plan does not make — Fixable: false

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** land.test.ts pushToDev > dev moved before every push: exhausted, nothing landed fails under machine load
  **Severity:** MEDIUM · **Class:** failing-test · **Fixable:** false · **Location:** `.bkit/core/engine/commands/land.test.ts:440` · **Round:** 1
  - **DONE WHEN:** The test passes in `bkit tests changed --base=origin/dev`, or the owner accepts it in a decision record as a known load failure outside this plan (docs/failures.jsonl holds it OPEN).
  - **TEST FIRST:**
    - .bkit/core/engine/commands/land.test.ts
<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->
- [ ] **TASK 2:** guardrails-cursor analyses dense script sources in linear time exceeds its 1000 ms budget under machine load
  **Severity:** MEDIUM · **Class:** failing-test · **Fixable:** false · **Location:** `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts:704` · **Round:** 1
  - **DONE WHEN:** The test passes in `bkit tests changed --base=origin/dev`, or the owner accepts it in a decision record as a known load failure outside this plan.
  - **TEST FIRST:**
    - .bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts
<!-- bkit:task 2 end -->
