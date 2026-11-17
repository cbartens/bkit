Verdict: CONCERNS
Failures: 1
Fixable: true
Tasks: none
Loosened: none

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

- Docs-only group: TASK 3 updates `.bkit/templates/docs/testing.md` (commit f09940e96); `TEST FIRST: n/a — docs only`, and the `Derived Test Matrix` row for task 3 is `none: docs-only change`, so no test is owed. The plan has no `Documentation Updates` section.
- Decision record `build-decision-1-1.md` (Fix now, option (b)) is the origin of TASK 3; it accepts no gap.
- Test-first audit `build-tests-green-2-1.md`: `Enforced: true`, `Gaps: 0`, `Unproven: 0`; no entries to decide.
- TASK 3 checks that hold: the new `## Test first` (line 368) sits right after `## What each tier must do`; its intro names `/bkit-build`, which marks the section as bkit practice; the Vitest, pytest, jest and Node commands are byte-identical to `docs/testing.md:302`; the leaf-name rule and the four conditional bullets (jest `--runTestsByPath`, undeclared, mixed runners, unset `$BKIT_TEST_REPORT`) are byte-identical to `docs/testing.md:303-307`; no bkit-only facts are copied. The workflow pointers in `.bkit/core/.bkit/workflows.md:1802` and `:1804` ("`docs/testing.md` § Test first") now resolve in a consumer copy adopted from the starter. `node dist/cli.js check` exits 0 with no drift lines.
- TASK 3 check that fails: the Node case-names bullet adds a clause the source does not have (see Gaps Log). Checked on Node v24.16.0 with `node --test --test-reporter=junit`: a plain script that throws writes `<testcase name="fail.mjs" ... failure="test failed">` and exits 1. One that exits 0 writes a passing `<testcase name="ok.mjs">`. So the case reflects the script's outcome and does not always count as passed. The plan's TASK 1 `DONE WHEN` wording "named after the path as passed" means "as passed to the command", not a pass status. TASK 3 is left off the `Tasks` line until the clause is removed.
- Full test gate not run: the group is docs-only and no group gate test is named.
- `docs/observability.md`: not applicable (no code paths, no errors to log).

## Identified Gaps Log

1 gap.

TASK 3: `.bkit/templates/docs/testing.md:373` Node case names bullet adds "and that case counts as passed", which `docs/testing.md:303` does not say and which is wrong: on Node v24.16.0 a plain script that throws reports its path-named case with `<failure>` (exit 1); drop the clause so the bullet matches the source wording — Fixable: true
