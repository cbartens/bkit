Verdict: PASS
Failures: 0
Fixable: false
Tasks: 10, 11, 12, 13, 14
Loosened: none
Fingerprint: 8ae7ff5ba2dfc32b5857207068fe30772051a1d898b36042d8f12ca65013cb6b
<!-- verdict:end -->

# Plan Verification

## Scope

Group 4

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

None

## Notes

- All five tasks (10-14) are satisfied against the group diff `build-diff-4-1.md`. The test-first audit `build-tests-green-4-1.md` reports `Enforced: true`, 22 tests red then green, no gaps, no `Unproven`, no `Updated tests` and no `Already landed`, so it leaves nothing to decide.
- Test runs (one file per argument, through `pnpm bkit:test:file`): `checks/tips/catalogue.test.ts`, `checks/after/tools.test.ts`, `checks/after/index.test.ts`, `install/project-docs.test.ts`, `install/template-copies.integration.test.ts`, `audits/repo/dogfood-templates.test.ts` and `audits/templates/templates.test.ts` passed, 567 of 567. The full `commands/install/upgrade.integration.test.ts` ran under the machine-wide tests lock and passed, 78 of 78 in 101.86s. The first two attempts gave up on the lock (exit 75) while other worktrees held it; that was waiting, not a failure. `tsc --noEmit` exits 0.
- Moving the ignore filter (code agent note 1): `detectProjectDocs` no longer filters `bkit.advisories.ignore` ids, and `runPostInstallCheck` in `.bkit/core/engine/checks/after/index.ts:482-485` now does it with the same `isAdvisorySuppressed(cwd, f.id, f.severity)` call and the same `onSuppressed({ id, scope: "." })` report. `runPostInstallCheck` and the new tip's `fires` are its only callers, so what users see from `bkit check` / `bkit doctor` does not change. The tip has to see the unfiltered advisories so that `collectTips` can report it as suppressed, which the planned test `project-docs tip stays silent when project-docs-missing is ignored` asserts. The existing `index.test.ts` case `reports and suppresses project documentation advisories without a blocker` passes.
- The `project-docs-empty` string (code agent note 2): Task 11's DONE WHEN says the string appears in none of four files. It is gone from `tools.ts`, `catalogue.ts` and `docs/observability.md`, and also from `dist/`, `.bkit/core`, `.bkit/templates` and every `docs/*.md`. It is left once in `.bkit/core/engine/checks/after/tools.test.ts:543`, as the planned test's negative assertion `expect(findings.map((f) => f.id)).not.toContain("project-docs-empty")`. That assertion proves what the grep check exists to prove (no such advisory is emitted), and the code step may not rewrite a planned test. Judged a note, not a gap: the plan states the grep without an exception, but it gives no reason to strip a guard that enforces the same criterion.
- Task 14 checks: `node dist/cli.js check` reports `0 write(s) would occur` (no drift, so the `.bkit/authoring.md`, `.bkit/templates.md`, `.agents/docs.md` note and `.bkit/version` mirrors are current). The four `.agents/docs.md` Scope cells equal line 4 of `docs/deployments.md`, `docs/data-schema.md`, `docs/testing.md` and `docs/security.md`. No fenced block in `docs/*.md` holds a down arrow, up arrow or top corner box character. The `bkit check` run in this repo prints the adoption-order pointer and the `project-docs` tip. The scratch-consumer dogfood run is taken from the code agent's log line (`build-plan-tasks-4-log.md`), backed by the spawned-CLI upgrade test, which asserts the exact `— adopted at docs/architecture.md, review your copy` line. I did not repeat it because this step does not install.
- That repo `bkit check` run also flags bkit's own `docs/data-schema.md` and `docs/noise.md` as `project-docs-unpopulated`. Both files were last changed in the #864 work (`d51b44bc4`) and are older starter copies, so this group did not cause it, and the plan's Out of Scope row defers bringing bkit's own docs in line.
- `dist/` for every changed engine file is in commit `06a1d2fcb`. `DETAILS.md` § Templates ready to adopt row text, the tip's `line` and the first sentence of `.bkit/core/.bkit/templates.md` § Project docs — adoption order are identical.
- Out-of-scope observation, not a gap: `adoptedDocCopy` in `.bkit/core/engine/install/template-copies.ts` matches `rel` with `/^docs\/([^/]+)\.md$/`, while `listFilesRecursive` builds paths with `path.join`. On Windows the separator would be `\`, so the marker would quietly not appear there. No criterion or doc names Windows as a target. Raise it separately if Windows matters.
- The Documentation Updates rows for this group (`docs/architecture.md`, `docs/testing.md`, `docs/observability.md`, `.agents/docs.md`, `DETAILS.md`, `.bkit/version`) are done. The `docs/deferrals.jsonl` note that Task 12 fixes deferral `864-move-project-docs-challenge-low-bkit-core-engine-install-project-docs-ts-429` is a ledger action for the holistic pass or ship step, not a group 4 DONE WHEN.
- No decision records, earlier verify reports or remediation logs for group 4 exist.

## Identified Gaps Log

None
