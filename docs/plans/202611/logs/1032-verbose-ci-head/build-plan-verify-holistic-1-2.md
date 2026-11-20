Verdict: PASS
Failures: 0
Fixable: false
Tasks: 1, 2, 3, 4
Loosened: none

<!-- verdict:end -->

# Plan Verification

## Scope

Holistic

## Groups Verified

2 of 2 (the plan has two groups: Group 1 with TASK 1 to TASK 3, Group 2 with TASK 4).

## Integration Gaps

0. Group 2 changes a value inside Group 1's step, and the two groups agree end to end:

- The "Read Verbose Marker (Manual Run)" step writes `TURBO_LOG_LEVEL=full` in `bkit-tests-static` and `bkit-tests-unit` of `.bkit/templates/.github/workflows/bkit-ci.yml` and `.github/workflows/bkit-ci.yml`. The four step blocks hash the same (`cd9ccf1b...`), and the value equals the `&& 'full' ||` on-value of the job-level `TURBO_LOG_LEVEL` expression in every job that declares it.
- TASK 1's test `verbose marker step writes VERBOSE_CI, TURBO_LOG_LEVEL and DEBUG to GITHUB_ENV for a [verbose ci] head commit` now asserts `full`, and TASK 4's `verbose marker step writes the TURBO_LOG_LEVEL value the job-level env sets on a marked push` ties the step to the job `env:`, so the two cannot drift apart again.
- TASK 2's `never writes NODE_OPTIONS to $GITHUB_ENV` and TASK 4's fixture fix both hold for the step TASK 1 added.
- Docs agree with the YAML: `.bkit/core/.bkit/workflows.md`, the rendered `.bkit/workflows.md`, `docs/deployments.md`, `.bkit/templates/docs/deployments.md`, `docs/testing.md` and `.bkit/templates/docs/testing.md` all say markers act on a dispatch, and every stated value is `full`. No file names `TURBO_LOG_LEVEL=debug` or says a marker is inert on a dispatch.

## Previously Attempted

- `build-plan-verify-1-1.md`: Group 1, CONCERNS, 1 gap (TASK 3, line 1499 precedence sentence), Fixable: true. Fixed by `build-plan-gaps-remediate-1-1-log.md` (commit `bca32e216`).
- `build-plan-verify-1-2.md`: Group 1, PASS, Tasks 1, 2, 3.
- `build-plan-verify-holistic-1-1.md`: Holistic, PASS, Tasks 1, 2, 3, when the plan had one group. Its proposed follow-ups (`.bkit/templates/docs/deployments.md:213` and the `debug` / `full` mismatch) became TASK 4 through the challenge round and `build-decision-1-1.md`.
- `build-plan-verify-2-1.md`: Group 2, PASS, Task 4.

## Notes

- Mode: Holistic, judged against `tmp/bkit-diff-1032-verbose-ci-head.md` and the working tree at `409e13ce8`. The tree has no uncommitted code change; only the plan and `status.jsonl` are modified, by the workflow.
- The diff also carries the `github-actions-hardening` skill install (`.agents/skills/github-actions-hardening/**`, the `.claude/skills` symlink, `skills-lock.json`) and workflow ledger rows in `.bkit/friction.jsonl`. They are not part of any task.
- TASK 1 satisfied: the step sits before "Configure Verbose CI" in both jobs of both files, gated `if: github.event_name == 'workflow_dispatch'`, compares the quoted message with a `case` against the fixed marker, appends only fixed literals and never writes `NODE_OPTIONS`. `actionlint` exits 0 on `.github/workflows/bkit-ci.yml`; the template's actionlint test passes.
- TASK 2 satisfied: the JOB 2f comment reads "the head-commit markers also act on a dispatch", and both `templates-content.test.ts` tests are present and pass.
- TASK 3 satisfied: no line in `.bkit/core/.bkit/workflows.md` or `docs/deployments.md` says a marker is inert on a dispatch. `.bkit/workflows.md` lines 1250-1256 match the source, and its sha256 `b99a9e35...` matches `.bkit/version`.
- TASK 4 satisfied: `full` in all four step copies; `.bkit/templates/docs/deployments.md:213` carries the directed sentence; the `runStep` fixture commits with `-c commit.gpgsign=false` and asserts status 0 on each git call; deferral row `1032-verbose-ci-head-challenge-low-bkit-core-engine-audits-templates-ci-scripts-test-ts-372` has a later `CLOSED` row (updates 2) in `docs/deferrals.jsonl`.
- DONE WHEN run: `pnpm vitest run` on `ci-scripts.test.ts`, `templates-content.test.ts`, `template-ci-yml.test.ts` and `dogfood-templates.test.ts` passed, 4 files and 231 tests.
- Affected-test sweep: 7 further files that read the changed template docs passed, 1013 tests (`project-docs.test.ts`, `workflow-shape.test.ts`, `templates.test.ts`, `template-action-pins.test.ts`, `shipped-docs-refs.test.ts`, `release-workflow.test.ts`, `checks/after/tools.test.ts`). The full suite is left to the holistic gate and the final run.
- No test-first audit report is in the supplied inputs. For reference, `build-tests-green-2-1.md` exists, and `build-plan-verify-2-1.md` recorded it as Enforced true, 0 gaps, 0 unproven, with one `Already landed` test (the signing fixture test) and one `Taken over` test (TASK 1's `GITHUB_ENV` test, `debug` to `full` only).
- Decision record `build-decision-1-1.md`: Q1 = B (Fix now), and TASK 4 follows its five directions. The record accepts no gap; it directs the fix. Its text says the v6.3 orchestrator gave the answer under the away rule: assumed, not the owner's acceptance.
- Derived Test Matrix: each of the 10 rows has its test in its named task's `TEST FIRST`, and that task's `DONE WHEN` command runs the file. Observability: `docs/observability.md` is present, and the change adds no runtime error path to log. Documentation Updates: the `.bkit/core/.bkit/workflows.md` and `docs/deployments.md` rows are done; the `docs/testing.md` and `docs/decisions.jsonl` rows require nothing.
- Still open outside the plan (not a gap): the knowledge row `consumer-ci-dispatch-default-burns-build-quota` still says markers are inert on `workflow_dispatch`; the plan sends it to the knowledge ledger.

## Identified Gaps Log

None
