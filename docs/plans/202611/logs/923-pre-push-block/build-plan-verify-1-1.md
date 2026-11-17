Verdict: CONCERNS
Failures: 1
Fixable: true
Tasks: 2, 3
Loosened: none
Fingerprint: 0aff28b5274f391e5f2bd8e78f70db0060325bcdc8eaa5a678d87945670a8fbe
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

- TASK 1 is not satisfied. Its `DONE WHEN` needs every integration row of the Derived Test Matrix to pass for both hook copies, and `gh not on PATH → warns, gates run` still fails. Re-run here (`vitest run husky-pre-push.integration.test.ts -t "PR conflict"`): 6 passed, 1 failed with `EEXIST ... mkdir '.../sysbin'`.
- The failure is in the test, not the hook. `pathWithoutGh()` (`.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts:1657-1659`) runs `fs.mkdirSync(path.join(tmp, "sysbin"))` on every call. The test calls it once per hook inside the `HOOKS` loop, so the second call (for `.husky/pre-push`) throws before the hook runs. The template copy passed on the first pass. The `Open-PR lookup` and `PR conflict` blocks in `.husky/pre-push` are byte-identical to the template's.
- The fix belongs to the tests step, because no code step may rewrite a planned test. Call `pathWithoutGh()` once before the loop, or make the `mkdirSync` recursive or idempotent. The build log's BLOCKED line for TASK 1 names the same cause.
- A standalone shell repro of a push without `gh` against `.husky/pre-push` was refused by the host's removal safety check, because the hook script contains `rm`. Nothing was worked around, so `.husky/pre-push` has no direct evidence for the case without `gh`.
- The rest of TASK 1 checks out. Both hooks carry the shared lookup (`--json number,baseRefName`, `< /dev/null`) and the `PR conflict` block before `pnpm bkit check`. Exit 1 blocks and lists the files. A failed fetch, a failed lookup, or any other `merge-tree` exit warns and goes on. The CI-suppressor guard reads `OPEN_PR` from the lookup, and its stub that prints `7` still parses as PR 7 with no base. The green report shows 116 existing tests still passing. `dogfood-templates.test.ts` passes (re-run here).
- TASK 2 is satisfied. The `pre-push-pr-conflict` tip is in `.bkit/core/engine/checks/tips/catalogue.ts`, and `dist/checks/tips/catalogue.js` is rebuilt. The tip test passes (re-run here: `catalogue.test.ts` and `dogfood-templates.test.ts`, 144 passed). bkit's own `.husky/pre-push` contains `merge-tree`, so the tip stays quiet here.
- TASK 3 is satisfied. § Git hooks — Husky in `.bkit/core/.bkit/templates.md` describes what Task 1 ships. The rendered `.bkit/templates.md` differs from the source only in its managed-marker line.
- Test-first audit (`build-tests-green-1-1.md`): `Enforced: true`. One gap (`not-green`, `Fixable: true`), logged below. The tests step accepted three tests that already passed before any code changed: `open PR that merges cleanly → gates run, no message` (today's hook has no conflict check), `no open PR → no fetch, gates run` (today's hook never fetches or warns) and `dev push → no PR lookup` (today's hook already skips the lookup on dev). No `Unproven` tests and no `Updated tests`.
- No decision records, earlier verify reports or remediation logs exist for group 1. The plan has no `Documentation Updates` section. Every Derived Test Matrix row is named in the `DONE WHEN` of TASK 1 or TASK 2.

## Identified Gaps Log

1 gap.

TASK 1: `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` `gh not on PATH → warns, gates run` — not-green — Fixable: true

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** TASK 1: `gh not on PATH → warns, gates run` — not-green (pathWithoutGh mkdirSync EEXIST on the second hook)
  **Severity:** HIGH · **Class:** not-green · **Fixable:** true · **Location:** `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts:1659` · **Round:** 1
  - **DONE WHEN:** every integration row of the Derived Test Matrix passes for both .bkit/templates/.husky/pre-push and .husky/pre-push, the existing CI-suppressor and graphify suites still pass, and dogfood-templates.test.ts passes
  - **TEST FIRST:**
    - .bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts `gh not on PATH → warns, gates run`
<!-- bkit:task 1 end -->
