Verdict: PASS
Failures: 0
Fixable: false
Tasks: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16
Loosened: none
Fingerprint: 49998ba1ee910c098b979342bcc824f03fa05fd7167fa778781caee3737ff23e
<!-- verdict:end -->

# Plan Verification

## Scope

Holistic

## Groups Verified

6 of 6 (the plan has 6 groups).

## Integration Gaps

0 gaps. No integration gap between the plan's groups was found, and `bkit tests changed --base=origin/dev --fallback=bkit:gate:static-unit` exited 0 (`bkit:gate:changed` PASS).

## Previously Attempted

- `build-plan-verify-holistic-1.md` (FAIL, 2 `Fixable: false` load-failure gaps, both accepted by the owner in `build-decision-1-1.md`).
- `build-plan-verify-holistic-2.md` (PASS, Tasks 1-15, 5 of 5 groups).
- Group 6 was added after `build-challenge-1.md`: `build-plan-verify-6-1.md` (CONCERNS, 1 gap), `build-plan-gaps-remediate-6-1-log.md` (fixed), `build-plan-verify-6-2.md` (PASS, Task 16).

## Notes

- Partial diff coverage: `tmp/bkit-diff-887-review-doc-starters.md` shows 20 of 97 files, 19 of them the vendored `design-doc-mermaid` skill. The engine, starter and doc changes were checked in the files and with `git diff` directly.
- Changes since `build-plan-verify-holistic-2.md` (commit `895333259`): the only code change is Group 6's `.bkit/core/engine/install/project-docs.test.ts`. `git diff --stat 895333259 HEAD -- dist .bkit/core/engine ':!*.test.ts'` is empty, so no engine source or `dist/` changed. The other changes are plan logs, `.bkit/friction.jsonl` and three LOW challenge deferral rows in `docs/deferrals.jsonl`. The working tree adds only the Task 16 tick in the plan and `status.jsonl` lines.
- Tasks 1-15 were rechecked against their `DONE WHEN`:
  - No starter and no `UNAUDITED_DOC_SECTIONS` key holds `Project facts to record`.
  - "Template is shape, prompt owns rules", "holds shape only" and "promote after the capstone" are gone from the files named.
  - `.bkit/templates/docs/testing.md` has one `## Test first` (line 491), after `## What each tier must do` (line 422).
  - `## Project docs — adoption order` is at line 664 of both `.bkit/core/.bkit/templates.md` and its mirror.
  - `formatTemplateChanges(changes, cwd)` has a required `cwd` (`template-copies.ts:152`), and `upgrade.ts:819` passes `process.cwd()`. `adoptedProjectDocPath` is exported at `project-docs.ts:480`.
  - The `project-docs` tip is at `catalogue.ts:399`, and `docs/architecture.md:31` names `adoptedProjectDocPath`.
  - `node dist/cli.js check` exits 0 with `0 write(s) would occur`, so there is no mirror drift. It prints the `project-docs-unpopulated` action that ends with the adoption-order pointer, and the `project-docs` tip.
- `project-docs-empty` is still at `.bkit/core/engine/checks/after/tools.test.ts:543`, as the planned test's negative assertion `not.toContain("project-docs-empty")`. This is not a gap, as `build-plan-verify-4-1.md` and both earlier holistic reports found: the assertion proves what the grep stands for, and removing it would loosen a planned test.
- Derived Test Matrix: all 43 rows have their test in the target file the row names. The two new Task 16 rows are included.
- Task 16 (Group 6) is met. `adoptionArrows(chart = adoptionChart())` takes the chart as a parameter. It reads labelled, chained, `&`-grouped and dotted-label edges, and throws on any arrow line it cannot parse. `docPaths` matches only a whole `docs/{topic}.md` path. `build-plan-verify-6-2.md` probed the edge forms, and I agree with its result. The diff since holistic attempt 2 adds no `.skip`, `.only`, `as any`, `as unknown as`, `@ts-` or linter disable.
- Integration with Task 16: the changed helpers feed every starter-shape test of Groups 2 and 3 through `starterShape`, which reads `adoptionArrows()` from the shipped chart (line 451), and the capabilities case (line 697). All of them passed in the gate run.
- Gate run, `bkit tests changed --base=origin/dev --fallback=bkit:gate:static-unit`: exit 0, verdict PASS.
  - `related`: 136 files, 6989 passed, 2 skipped.
  - `named`: 170 files, 8633 passed, 2 skipped. This includes `guardrails-cursor.integration.test.ts` and `land.test.ts`, the two tests `build-decision-1-1.md` accepted. Both passed, so that decision record was not needed for this run.
  - The `node --test` lanes passed (13 of 13 each), the bats lane passed, and prettier passed.
  - The run waited about 2 min for the machine-wide tests lock. Load average was 9.5 to 10.3 on 10 cores.
- Cloud setup: the gate printed `provision 'db' failed (non-blocking): db unavailable: 3 GB free, needs 10 GB` and `provision 'cli' failed (non-blocking): exit 1`. bkit has no database, and no task of this plan depends on either recipe.
- No test-first audit report was supplied for this pass.
- `docs/testing.md` and `docs/observability.md` are present. The plan adds no runtime error path, so it needs no new logging.
- Documentation Updates: the rows were verified in holistic attempts 1 and 2, and none of the files they name changed since then. `docs/deferrals.jsonl` `864-move-project-docs-challenge-low-bkit-core-engine-install-project-docs-ts-429` is still OPEN. Task 12 fixed its cause, and closing the row is the ship deferred sweep's job.

## Identified Gaps Log

None
