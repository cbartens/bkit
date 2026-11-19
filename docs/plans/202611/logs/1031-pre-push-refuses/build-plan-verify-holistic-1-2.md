Verdict: PASS
Failures: 0
Fixable: false
Tasks: 1, 2, 3, 4, 5, 6
Loosened: none
Fingerprint: 02b249646cde41754b8b632360996a60f82ddea62c567e66c75b3a0fe909e3fd
<!-- verdict:end -->

# Plan Verification

## Scope

Holistic

## Groups Verified

2 of 2 (the plan has 2 groups).

## Integration Gaps

0. Group 1's hook edit (Task 2) still drives group 2's reworked engine check (Tasks 4-6): both hook copies pass `--target=main` only for SHAs pushed to `refs/heads/main`, and `mainAuditFiles` now ignores `minPushPaths`, reads NUL-delimited names and refuses any project-section change measured against `origin/main`. The engine still logs the files on stderr (which the hook keeps) and exits 1 (`audit`) or 7 (`unknown`), and the hook's `if !` blocks both. The docs from Task 3 (`docs/deployments.md`, `.bkit/core/.bkit/templates.md`, `docs/security.md`) still match the widened Task 6 behaviour ("an audit template's project-section change"). The `dev` path is unchanged, because every change sits behind `target === "main"`.

## Previously Attempted

- `build-plan-verify-holistic-1-1.md` (holistic attempt 1, group 1 only): PASS, Tasks 1, 2, 3.
- `build-plan-verify-2-1.md` (group 2, attempt 1): CONCERNS, 1 gap (the Task 5 test leaked `GIT_CONFIG_*` env). `build-plan-gaps-remediate-2-1-log.md` fixed it.
- `build-plan-verify-2-2.md` (group 2, attempt 2): PASS, Tasks 4, 5, 6.

## Notes

- Re-ran here: `pnpm exec vitest run .bkit/core/engine/commands/ci/ci.test.ts` → 92/92 passed; `pnpm exec vitest run .bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` → 144/144 passed, for both hook copies.
- TASK 1: `minPush` runs today's check unchanged, then `mainAuditFiles` against the `origin/main` merge-base. It rejects `--target` values other than `main`, and `--target` combined with `--update`, as usage errors. `minPushPathspecs` is unchanged. The verb spec and `.bkit/cli.md` / `.bkit/core/.bkit/cli.md` list `--target`.
- TASK 2: the two hook hunks are identical (`PUSH_MAIN_SHAS` collection plus the `--target=main` call in the guard loop).
- TASK 3: no line in the four docs says an audit report may reach `main` under a `[skip ci]` head. The rendered `.bkit/templates.md` differs from its source only in the managed marker. All four `Documentation Updates` rows are done.
- TASK 4: `changedOutside(root, mb, sha, [])` is used, so `minPushPaths` and `ciSkipPaths` are never read.
- TASK 5: names come from `diff.changed` (`-z`). The quoted `git diff --name-only` call is gone from `ci.ts` and `dist/commands/ci/ci.js`. `ENV_KEYS` restores the three `GIT_CONFIG_*` keys.
- TASK 6: `projectSection` compares the text below `<!-- bkit:end -->`, with an absent file counted as empty.
- `dist/commands/ci/ci.js` mirrors the source `mainAuditFiles` and `projectSection`.
- All 17 `Derived Test Matrix` rows (Tasks 1: 7, 2: 6, 4: 1, 5: 1, 6: 2) have their test in the owning task's `TEST FIRST` and `DONE WHEN` file, and each test passes.
- The full suite is not run here. `build-holistic-gate-1-1.md` predates group 2, so the next holistic gate and the final run cover it.
- Errors are logged through `ctx.log` (stderr) and the hook's `[pre-push]` lines, per `docs/observability.md` § Log Format.
- Test-first audits for both groups (`build-tests-green-1-1.md`, `build-tests-green-2-2.md`, as read by the group verifies): Enforced true, 0 gaps. No decision records were supplied.
- Observations, not gaps (no `DONE WHEN` covers them):
  - Both hooks add `# shellcheck disable=SC2086` for the `$push_target` word. This follows the existing directive at `.bkit/templates/.husky/pre-push:229`. No `bkit:gate:*` or CI lane runs shellcheck on `.husky/*` (CI uses it only on workflow `run:` blocks), so it weakens no gate. A disable-free form, `${push_target:+"$push_target"}`, is available if the owner wants one.
  - The `docs/testing.md` `ci.test.ts` row does not mention the non-ASCII case or the origin/dev template cases from group 2. No task's `DONE WHEN` asks for it.
  - Three LOW challenge findings are deferred in `docs/deferrals.jsonl`: the audit sentence also prints on non-audit `main` refusals, the JSON `outside` holds audit files on `reason: "audit"`, and the base is a non-`origin` remote. No task covers them.

## Identified Gaps Log

None
