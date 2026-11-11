Verdict: CONCERNS
Failures: 1
Fixable: true
Tasks: 2
Loosened: none

<!-- verdict:end -->

# Plan Verification

## Scope

Group 1

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

- `build-plan-verify-1-1.md`: `CONCERNS`, 3 gaps (Task 1 not-green idempotency snapshot, live `.bkit/shared/docs/` references, managed-guide section links), Task 2 satisfied.
- `build-plan-gaps-remediate-1-1-log.md`: `FAIL`, fixed gaps 2 and 3, blocked on gap 1 (planned-test edit only) and on the group gate (1 failed, 7407 passed: the same test).

## Notes

- Mode `Group`, group 1 (Tasks 1, 2), judged against `build-diff-1-2.md`. The brief has no `Deviations` section. No decision records exist. `build-plan-current.md` reports no affected tasks.
- Test-first audit (`build-tests-green-1-2.md`): `Enforced: true`, `Unproven: 0`, no `Updated tests` or `Already landed` sections. The `not-green` gap stands at `Fixable: true` and is the one logged gap.
- `delete-still-referenced` (10 entries, `Fixable: null`), decided by `git grep -n 'shared/docs'` over tracked files outside `docs/audits/`, `docs/plans/` and the ledgers: the remaining hits are path fixtures in the gateguard hook tests and `.bkit/core/engine/tools/instructions.test.ts:106`, the legacy-revision note in `.bkit/core/engine/install/project-docs.ts:117` (and `dist/install/project-docs.js:93`) and `project-docs.test.ts:74`, the self-check in `templates.test.ts:306`, and a release entry in `CHANGELOG.md:331`. These are different things or history. The bare topic words (`technology`, `data-schema`, `deployments`, `observability`, `noise`) name topics or the consumer `docs/{topic}.md` paths. No gap. The SIGTERM "references not checked" entries are covered by the same grep.
- Attempt 1 gap 2 is closed: `.bkit/instructions.md`, `docs/testing.md`, `docs/templates/bkit-audit-security.md:379`, the four gateguard hook copies and `DETAILS.md` no longer name `.bkit/shared/docs/` as a live path.
- Attempt 1 gap 3 is closed: `.bkit/core/.bkit/prompts.md`, `.bkit/core/.bkit/templates.md` and `.bkit/core/.bkit/workflows.md` (and the installed `.bkit/*.md` copies) point at the managed sections, and the JUnit rules sit in `.bkit/core/.bkit/workflows.md` § Failure count from JUnit reports. No remaining `docs/security.md` or `docs/testing.md` section link in the three managed guides points at a section the starters dropped.
- Re-run on 2026-11-09: 9 group unit and audit test files pass (889 tests). Lifecycle integration tests (`install`, `uninstall`, `upgrade` `.integration.test.ts`): 153 of 154 pass, including all four Task 2 tests and five of six Task 1 tests.
- Task 2 stays satisfied (already `[x]` in the plan). Task 1 stays open on its one planned test. The `BLOCKED` lines in `build-plan-tasks-1-log.md` and `build-plan-gaps-remediate-1-1-log.md` do not satisfy its `DONE WHEN`.
- For the caller: the remaining gap needs a planned-test edit, which the remediation step may not make. Route it to the tests step, or it repeats. The source behaviour (the cache-bust bump on every upgrade, and `check` and `upgrade` each stamping their own `_Mode`) is intended, so no source change closes it.

## Identified Gaps Log

1 gap.

TASK 1: `.bkit/core/engine/commands/install/upgrade.integration.test.ts` `migrates legacy ownership without changing project text or core ownership` — not-green: still fails at `upgrade.integration.test.ts:2436` (`expect(snapshot()).toEqual(settled)`), re-run 2026-11-09 with 153 of 154 lifecycle tests passing; the whole-tree "second run changes nothing" snapshot captures `.claude/bkit-cloud.md` (`# cache-bust 2026-11-09-2` → `-3`, bumped on every upgrade by `renderCloudCacheBust` in `.bkit/core/engine/install/cloud-env.ts`) and `.bkit/advisories.md` (`_Mode: check_` → `_Mode: upgrade_`, because `check` runs before the settled snapshot); every project-doc, index and `.bkit/version` assertion before it passes; remediation attempt 1 blocked because only the tests step may edit a planned test, so the tests step narrows the idempotency snapshot to exclude those two per-run files (or compares the project docs, `.agents/docs.md` and `.bkit/version` only) — Fixable: true
