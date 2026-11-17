Verdict: CONCERNS
Failures: 1
Fixable: true
Tasks: 12, 13
Loosened: none

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

- Mode: Group. Judged against `build-diff-4-1.md`; the briefs carry no `Deviations` section, and no `build-decision-*.md` record exists.
- TASK 11: the code part of DONE WHEN is met. `.bkit/templates/scripts/ci/bkit-machine-lock.sh:302` now reads `unless (mkdir($queue) || -d $queue)`, so a regular file at the path still fails `-d` and replies `error cannot create $queue`; the existing test `run exits 73 naming the queue folder when it cannot be created` (`machine-lock.integration.test.ts:1370`) passed in the green run (67 of 68). `cmp` shows `scripts/ci/bkit-machine-lock.sh` byte-identical to the template. The task stays open only on its test-first audit gap (logged below): the TEST FIRST test fails on the correct code because it treats waiting-note stderr as a refusal.
- TASK 12: the wait-time handler sets TERM unconditionally and INT / HUP only when the inherited disposition is not `IGNORE`, in both the template and the `scripts/ci/` copy. Its TEST FIRST test was red at attempt 1 and passes now.
- TASK 13: `IS_CODEX_HOOK` also tests `process.argv[1]` in `.bkit/core/hooks/guardrails-tiers.js`. The rendered `.codex/hooks/bkit-guardrails.cjs`, `.cursor/hooks/bkit-guardrails.cjs` and `.agents/plugins/bkit/hooks/bkit-guardrails.cjs` carry the change, and the `.bkit/version` hashes for the Codex and Cursor copies match the files on disk. `.claude/hooks/bkit-guardrails.cjs` does not contain `IS_CODEX_HOOK`, so it needs no re-render. Its TEST FIRST test was red and passes now.
- Test-first audit (`build-tests-green-4-1.md`): `Enforced: true`, one gap (TASK 11 `not-green`, engine `Fixable: true`, kept). No `Unproven`, `Updated tests` or `Already landed` sections.
- Out of scope for this group: `build-plan-tasks-4-log.md` records a BLOCKED `bkit:gate:static` run on slop findings `defensive.error-obscuring` at `tests-jump.ts:23,34` and `tests-lock.integration.test.ts:493`. Those files are not in the group 4 diff, and group 3 and the holistic attempt 2 verifies did not log them. The next holistic pass should check them.
- Docs: `.agents/docs.md` loaded. `docs/testing.md`, `docs/observability.md`, `docs/architecture.md` and `docs/security.md` are present. Group 4 adds no error logging paths and has no `Documentation Updates` rows.

## Identified Gaps Log

Gaps: 1

- TASK 11: `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `runs that take a lock at once on a fresh cache never refuse over the queue folder` — not-green: the code fix is in place (`mkdir($queue) || -d $queue` at `.bkit/templates/scripts/ci/bkit-machine-lock.sh:302`, `scripts/ci/` copy byte-identical; an independent 20 x 8 burst gave no non-zero exit and no "cannot create"), but the test's final filter `!/ exit 0: $/` counts every take with any stderr as refused, so the legitimate "⏳ … in line" waiting notes (350 lines) fail it with or without the fix. Its red at attempt 2 was for the same wrong reason, so it never proved the race either. The tests step rewrites the assertion to flag only non-zero exits or "cannot create" / "File exists" stderr, and keeps take and round counts high enough that the pre-fix code fails it (the plan's TEST FIRST names 16 takes; the test uses 8) — Fixable: true
