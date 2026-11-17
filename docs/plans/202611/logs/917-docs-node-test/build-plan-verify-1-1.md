Verdict: CONCERNS
Failures: 2
Fixable: true
Tasks: none
Loosened: none
Fingerprint: 8f91d7d905e34ee9990d26f9f4772df2f4f5fc41e982d896fe61696c2426117a
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

- Docs-only group (TASK 1 `docs/testing.md`, TASK 2 `.bkit/workflows.md`); both `TEST FIRST: n/a — docs only`. The `Derived Test Matrix` has one `none: docs-only change` row, so no test is owed.
- Test-first audit `build-tests-green-1-1.md`: `Enforced: true`, `Gaps: 0`, `Unproven: 0`; no `Updated tests`, `Already landed` or `Unproven` entries to judge.
- No decision records and no earlier verify or remediation logs for group 1.
- TASK 2 wording checked against `isNamedCase` and `judgeRed` in `.bkit/core/engine/commands/workflow/tests.ts:522-578`: the Red row, the report bullet and the Literal-names bullet all match (equal name or ` {name}` suffix; no named case, and no case or every case non-passing with the file's stem in its name). The content is right; the gap is only that it sits in the rendered mirror and not its source.
- TASK 1 Node claims checked by running Node v24.16.0's reporters in a scratch folder: the documented command works, a `node:test` file reports one case per `test` / `it`, a plain script reports one case named after the path as passed (`t/plain.mjs`), and a file whose import fails reports one failing case named after its path, which `judgeRed` reads as `red-not-loaded`. Only the nested-`describe` `suite > test` claim is wrong.
- The plan's own TASK 1 UPDATE line asks for "the leaf-test or `suite > test` naming for nested `describe`"; the doc follows the plan, but the plan's premise is false for Node's junit reporter, and the brief's goal is an accurate name contract, so the fix is the corrected sentence.
- `node dist/cli.js check` also lists `write version pin: .bkit/version`; that is the hash record and was not attributed to this group.
- `docs/observability.md`: not applicable (no code paths, no errors to log).

## Identified Gaps Log

2 gaps.

- TASK 1: `docs/testing.md:303` — the Node case-name bullet says a test inside a nested `describe` is reported as `suite > test`; on Node v24.16.0 the junit reporter writes the leaf name only (`<testcase name="deep">` inside `<testsuite name="outer">` / `<testsuite name="inner">`), and `parseJunit` in `.bkit/core/engine/commands/workflow/junit.ts` reads only the `<testcase name>`, so a plan that follows the doc and names `outer > inner > deep` is judged `missing`; reword it to say Node always reports the leaf `it` / `test` name. Its DONE WHEN `bkit check passes` also fails (exit 1, drift from TASK 2) — Fixable: true
- TASK 2: `.bkit/workflows.md:1797,1802,1804` — the edits landed only in the rendered mirror; the source `.bkit/core/.bkit/workflows.md` still has the old Red-row, report-bullet and Literal-names wording, so `node dist/cli.js check` exits 1 with `core: .bkit/workflows.md` / `DRIFT DETECTED` and `bkit upgrade` would revert the change; apply the same three edits to `.bkit/core/.bkit/workflows.md` (`.agents/rules.md` § Repo Authoring, Edit source) — Fixable: true

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** Node nested describe case name documented as suite > test; Node junit reporter writes the leaf name only
  **Severity:** MEDIUM · **Class:** doc-inaccurate · **Fixable:** true · **Location:** `docs/testing.md:303` · **Round:** 1
  - **DONE WHEN:** the bullet gives the Node command, says Node tests use node:test, and states that a non-node:test file reports one case named after the path as passed and the plan names it that way; bkit check passes
  - **TEST FIRST:**
<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->
- [ ] **TASK 2:** Edits landed only in the rendered mirror; source .bkit/core/.bkit/workflows.md unchanged, bkit check reports drift
  **Severity:** HIGH · **Class:** mirror-edited-not-source · **Fixable:** true · **Location:** `.bkit/workflows.md:1804` · **Round:** 1
  - **DONE WHEN:** both bullets match judgeRed and isNamedCase, and point to docs/testing.md § Test first for per-runner commands
  - **TEST FIRST:**
<!-- bkit:task 2 end -->
