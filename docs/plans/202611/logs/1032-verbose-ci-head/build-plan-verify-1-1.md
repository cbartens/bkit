Verdict: CONCERNS
Failures: 1
Fixable: true
Tasks: 1, 2
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

None

## Notes

- Mode: Group. Judged against `build-diff-1-1.md`. The brief has no `Deviations` section. There are no decision records, earlier verify reports or remediation logs for this group.
- TASK 1 satisfied: the "Read Verbose Marker (Manual Run)" step sits before "Configure Verbose CI" in `bkit-tests-static` and `bkit-tests-unit` of `.bkit/templates/.github/workflows/bkit-ci.yml`, and byte for byte in `.github/workflows/bkit-ci.yml`. It is gated `if: github.event_name == 'workflow_dispatch'`, appends only fixed literals to `$GITHUB_ENV`, never writes `NODE_OPTIONS`, and never expands the message (a `case` match on a quoted variable, no `${{ }}` in `run:`). Neither file sets `defaults.run.shell`, so the runner default `bash -e` applies. A scratch repro with an unknown `GITHUB_SHA` exited 128 ("fatal: bad object"), so a `git log` failure fails the step. The `bkit-tests-scope` "Read Markers" step and the integration lane are unchanged.
- TASK 2 satisfied: the JOB 2f comment no longer says markers are inert on `workflow_dispatch`, and the new and taken-over tests in `templates-content.test.ts` are present.
- DONE WHEN run: `pnpm vitest run` on `template-ci-yml.test.ts`, `ci-scripts.test.ts`, `dogfood-templates.test.ts` and `templates-content.test.ts` passed, 4 files and 228 tests.
- TASK 3: its DONE WHEN holds. No line in `.bkit/core/.bkit/workflows.md`, `.bkit/workflows.md` or `docs/deployments.md` says a marker is inert on a dispatch. `.bkit/workflows.md` was re-rendered, its lines match the source and its `.bkit/version` hash was updated. TASK 3 is held back for one UPDATE field: the line 1499 precedence sentence did not land (see the gaps log).
- Test-first audit (`build-tests-green-1-1.md`): `Enforced: true`, `Gaps: 0`, `Unproven: 0`. It has no `Taken over`, `Changed by a code step`, `Updated tests` or `Already landed` sections. The plan's `never writes NODE_OPTIONS to $GITHUB_ENV` takeover by TASK 2 adds only expectations.
- Derived Test Matrix: each of its 7 rows has a test that a group task's `TEST FIRST` names, and the task's `DONE WHEN` command runs that test file. Observability: `docs/observability.md` is present, and the plan has no logging change. Documentation Updates: the `docs/deployments.md` rows (lines 105 and 178) are done. The `.bkit/core/.bkit/workflows.md` row is done apart from the TASK 3 gap.

## Identified Gaps Log

TASK 3: `.bkit/core/.bkit/workflows.md` § CI / Vercel commit tags precedence sentence (line 1499) is unchanged and still says bkit's own `bkit-ci.yml` reads markers from the head commit on pushes only, while the new § Commit-message force tags bullets say the "Read Verbose Marker (Manual Run)" step in bkit's copy also reads `[verbose ci]` from the head commit on a manual run; the UPDATE field asks it to agree with the new bullets (then re-render `.bkit/workflows.md` via build + upgrade) — Fixable: true
