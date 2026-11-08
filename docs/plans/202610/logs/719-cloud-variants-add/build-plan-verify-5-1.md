Verdict: CONCERNS
Failures: 1
Fixable: true
Tasks: 9
Loosened: none

<!-- verdict:end -->

# Plan Verification

## Scope

Group 5

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

None

## Notes

- Mode `Group`, judged against `build-diff-5-1.md`. Brief `build-brief-5-1.md` has no `Deviations` section.
- Test-first audit `build-tests-green-5-1.md`: `Enforced: true`, `Verdict: PASS`, `Gaps: 0`, `Unproven: 0`; no `Updated tests`, `Already landed` or `delete-still-referenced` entries, so nothing to decide.
- Re-ran the three DONE WHEN files: `cloud-ctx-step.integration.test.ts`, `workflow-templates.integration.test.ts`, `dogfood-templates.test.ts` — 3 files, 147 tests passed, none skipped. All 12 named `TEST FIRST` tests (TASK 8: 10, TASK 9: 2) pass by name in the verbose run.
- `git grep -n 'gh issue view' -- .bkit/templates/.github/workflows/bkit-cloud.yml` prints nothing; the GitHub-only no-op and the feat-arm marker regex + branch `sed` fallback are deleted (Supersession Inventory rows for TASK 8 done; dev-arm regex stays for TASK 10).
- Every `Derived Test Matrix` row for TASKS 8 and 9 has its test in that task's `DONE WHEN`. `Documentation Updates` rows for TASKS 8/9 done: `docs/observability.md` § `[bkit-cloud] gate:` annotations (verdicts + `jobs` column), `{{NODE_VERSION}}` row in `.bkit/core/.bkit/templates.md` and its `.bkit/templates.md` mirror.
- Cross-checked the gate against the engine: `fids parse` marker regexes (`fids.ts:592-596`, single-comment form incl. Jira `AB2-12`) and `fromBranch` feature-row rule match the router's use; `issues fetch` reads `BKIT_LINEAR_API_KEY` / `BKIT_JIRA_API_KEY` (`tracker.ts:82`), which the ctx step `env:` now carries next to `GH_TOKEN`.
- TASK 9 satisfied: the `jobs` field is filled from `SEL_AGENT` / `SEL_DISPATCHED` / `SEL_IGNORED` mapped from `steps.select.outputs.*`; `BKIT_` names only.
- TASK 8 left off `Tasks`: its DONE WHEN passes, but the logged step-order gap breaks the router on GitHub-hosted runners and no test can catch it.
- Out-of-scope proposal (not a gap; the plan names `continue-on-error` only on `Install bkit`): `actions/setup-node` and `pnpm/action-setup` also fail hard on a consumer without `package.json#packageManager` or a non-pnpm stack, which would turn the run red instead of reporting `bkit-unavailable` (SC3). Worth an owner call.
- Minor, not a gap: `cloud-ctx-step.integration.test.ts:554` keeps the title "a github tracker in package.json passes the tracker gate and dispatches"; its body is now a valid dev-arm `bkit_gate` pass through the real bkit, so only the wording is stale.
- Decision records `build-decision-1-*.md` and `build-decision-2-1.md` concern groups 1 and 3; none accepts a group 5 gap.

## Identified Gaps Log

Gaps: 1

TASK 8: `.bkit/templates/.github/workflows/bkit-cloud.yml:179-187` (and `.github/workflows/bkit-cloud.yml:179-187`) — step-order defect: the context job's `actions/setup-node` step sets `cache: pnpm` but runs BEFORE `pnpm/action-setup`. setup-node's pnpm cache shells out to `pnpm store path`, and the action does not install pnpm, so on a runner without pnpm (GitHub-hosted `ubuntu-latest`) the step fails with "Unable to locate executable file: pnpm". The step has no `continue-on-error`, so every enabled router run goes red and no agent ever starts, contradicting SC3 (exits green) and the step's own comment that a failed install yields `bkit-unavailable`. Every other `setup-node` in the repo omits `cache:`; this is the only `cache: pnpm`. No test covers it (the ctx tests extract bash only, and live checks are deferred to owner use). Fix: move `pnpm/action-setup` above `actions/setup-node` in the template, re-copy to the adopted copy (`node-version-file: .nvmrc` re-applied), keep `dogfood-templates.test.ts` green; optionally add a `workflow-templates.integration.test.ts` order pin. — Fixable: true
