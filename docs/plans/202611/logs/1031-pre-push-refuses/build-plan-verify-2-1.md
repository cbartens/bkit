Verdict: CONCERNS
Failures: 1
Fixable: true
Tasks: 4, 6
Loosened: none
Fingerprint: 7cd3641ebe921aa969f034900fef60c9d6fee8341c6b1b42f7dc745cc1dcd8cc
<!-- verdict:end -->

# Plan Verification

## Scope

Group 2

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

None

## Notes

- TASK 4 satisfied: `mainAuditFiles` (`.bkit/core/engine/commands/ci/ci.ts:682`) now calls `changedOutside(root, mb, sha, [])`, so neither `minPushPaths` nor `ciSkipPaths` is read and every changed file is classified. The `minPushPaths: ["docs/**"]` test passes.
- TASK 5 code satisfied: the audit list comes from `diff.changed` (`git diff --name-only -z --no-renames`, NUL-split), and the separate quoted `git diff --name-only` call is gone from `ci.ts` and `dist/commands/ci/ci.js`. The non-ASCII test passes and names the path verbatim. Held off the `Tasks` line by one test-hygiene gap (environment leak, see the log).
- TASK 6 satisfied: the new `projectSection` helper compares the text below `<!-- bkit:end -->` at the `origin/main` merge-base (absent counts as empty) with the pushed commit, whether or not the managed block changed. Both TASK 6 tests pass. A template deleted at the pushed commit is not refused; it brings nothing onto `main`.
- `dev` behaviour unchanged: the change sits only behind `target === "main"`. `dist/` is rebuilt in the same diff.
- Ran `pnpm exec vitest run .bkit/core/engine/commands/ci/ci.test.ts`: 92 passed.
- Test-first audit (`build-tests-green-2-1.md`): Enforced true, 0 gaps, 0 unproven. All four tests went red, then green. No Taken over, Changed by a code step, Updated tests or Already landed sections.
- Derived Test Matrix rows for tasks 4, 5 and 6 each have their test in the task's TEST FIRST. The Documentation Updates rows were group 1's. The wording in `docs/deployments.md:586` and `.bkit/core/.bkit/templates.md:324` ("an audit template's project-section change") still matches the widened TASK 6 behaviour.
- No decision records or earlier verify or remediate attempts were supplied for group 2.

## Identified Gaps Log

1 gap.

- TASK 5: `.bkit/core/engine/commands/ci/ci.test.ts` `--target=main refuses a docs/audits file whose name has non-ASCII characters` — the test sets `GIT_CONFIG_COUNT`, `GIT_CONFIG_KEY_0` and `GIT_CONFIG_VALUE_0` in `process.env` but `ENV_KEYS` (ci.test.ts:28) does not list them, so `afterEach` never restores them and `core.quotePath=true` leaks into every later test in the file; TEST FIRST asks for the setting "for the run" only. Fix: add the three keys to `ENV_KEYS` — Fixable: true

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** TASK 5 test leaks GIT_CONFIG_* env into later tests
  **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/ci/ci.test.ts:28` · **Round:** 1
  - **DONE WHEN:** GIT_CONFIG_COUNT, GIT_CONFIG_KEY_0 and GIT_CONFIG_VALUE_0 are listed in ENV_KEYS in .bkit/core/engine/commands/ci/ci.test.ts, so afterEach restores them after the non-ASCII --target=main test, and ci.test.ts still passes
  - **TEST FIRST:**
    - .bkit/core/engine/commands/ci/ci.test.ts --target=main refuses a docs/audits file whose name has non-ASCII characters
<!-- bkit:task 1 end -->
