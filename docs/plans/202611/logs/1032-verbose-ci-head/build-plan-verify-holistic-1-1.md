Verdict: PASS
Failures: 0
Fixable: false
Tasks: 1, 2, 3
Loosened: none

<!-- verdict:end -->

# Plan Verification

## Scope

Holistic

## Groups Verified

1 of 1 (the plan has one group).

## Integration Gaps

0. The plan has one group, so no cross-group contract can disagree. Within the feature the pieces agree:

- The "Read Verbose Marker (Manual Run)" step is byte-identical in the template and in `.github/workflows/bkit-ci.yml`, in both `bkit-tests-static` and `bkit-tests-unit`, before "Configure Verbose CI".
- "Configure Verbose CI" is gated `if: env.VERBOSE_CI == '1'`, so it reads the value the marker step writes. No later step in those jobs has a step-level `env:` that would replace `VERBOSE_CI`, `TURBO_LOG_LEVEL` or `DEBUG`.
- The `.bkit/core/.bkit/workflows.md` bullets, the line 1499 precedence sentence, the rendered `.bkit/workflows.md` and `docs/deployments.md` (lines 105 and 178) all describe the same behaviour as the YAML.

## Previously Attempted

- `build-plan-verify-1-1.md`: Group 1, CONCERNS, 1 gap (TASK 3, the line 1499 precedence sentence), Fixable: true.
- `build-plan-gaps-remediate-1-1-log.md`: PASS, fixed that gap in commit `bca32e216`.
- `build-plan-verify-1-2.md`: Group 1, PASS, Tasks 1, 2, 3.
- This is the first holistic attempt.

## Notes

- Mode: Holistic, judged against `tmp/bkit-diff-1032-verbose-ci-head.md`. There are no `build-decision-*.md` records and no test-first audit report in the supplied inputs. For reference, the group's `build-tests-green-1-2.md` shows `Enforced: true`, `Gaps: 0`, `Unproven: 0`.
- The diff also carries the `github-actions-hardening` skill install (`.agents/skills/github-actions-hardening/**`, the `.claude/skills` symlink, `skills-lock.json`), recorded in `build-install-skills.md`. It is not part of any task.
- TASK 1 satisfied. Its DONE WHEN command (`template-ci-yml.test.ts`, `ci-scripts.test.ts`, `dogfood-templates.test.ts`, plus `templates-content.test.ts`) passed: 4 files, 228 tests. `actionlint` also exits 0 on `.github/workflows/bkit-ci.yml`. A scratch repro of the step's script under `bash -e` was run three ways:
  - A head commit `x [verbose ci] $(touch pwned)` wrote the three fixed lines and created no file, so the message is never run as code.
  - An unknown `GITHUB_SHA` exited 128 ("fatal: bad object") and wrote nothing, so a `git log` failure fails the step.
  - No `${{ }}` appears in the `run:` body, and `NODE_OPTIONS` is never written.
- TASK 2 satisfied. The JOB 2f comment now reads "the head-commit markers also act on a dispatch". Both `templates-content.test.ts` tests are present and pass. The takeover of `never writes NODE_OPTIONS to $GITHUB_ENV` only adds expectations.
- TASK 3 satisfied. `grep -i inert` finds no marker-on-dispatch claim in `.bkit/core/.bkit/workflows.md`, `.bkit/workflows.md`, `docs/deployments.md` or either CI file. The rendered `.bkit/workflows.md` matches its source at both edited spots, and its sha256 `b99a9e35...` matches `.bkit/version`.
- Affected-test sweep: 10 further test files that read the changed CI or docs files passed, 1089 tests (template pins, path refs, templates, workflow-templates integration, shipped-docs-refs, release-workflow, workflow-shape, install check, version-file, project-docs). The full suite is left to the holistic gate and the final run.
- Derived Test Matrix: each of the 7 rows has its test in a TASK 1 or TASK 2 `TEST FIRST`, and that task's `DONE WHEN` command runs the file. Observability: `docs/observability.md` is present, and the plan adds no error path to log. Documentation Updates: the `.bkit/core/.bkit/workflows.md` and `docs/deployments.md` rows are done. The `docs/testing.md` and `docs/decisions.jsonl` rows require no change.
- Proposed follow-up, outside the plan's scope (not a gap): the shipped starter `.bkit/templates/docs/deployments.md:213` still says "Markers are inert on a dispatch, so steer it with inputs (`.bkit/workflows.md` § Commit-message force tags)". The section it cites now says the opposite. No task, Documentation Updates row or Supersession row names this file, so the owner decides whether to fix it. Also still open from the plan: the `TURBO_LOG_LEVEL` value is `full` on push and `debug` on a manual run (Suggested Scope Expansion), and the knowledge row `consumer-ci-dispatch-default-burns-build-quota` still needs correcting.

## Identified Gaps Log

None
