Verdict: CONCERNS
Failures: 1
Fixable: true
Tasks: 22, 23
Loosened: none
Fingerprint: d049904699b902b8bf2cc4f1d2a5b68a7bdc91309472594b7981b07ec606dec0
<!-- verdict:end -->

# Plan Verification

## Scope

Group 6

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

None

## Notes

- Judged against `build-diff-6-1.md` (commits `8ffb532fd`, `eaff38540`). The four `TEST FIRST` files pass: `audit-report.test.ts`, `workflows.test.ts`, `workflow-shape.test.ts`, `decisions.test.ts` (613 tests).
- Test-first audit `build-tests-green-6-1.md`: `Enforced: true`, `Gaps: 0`, `Unproven: 0`; all four tests went red then green. No `Taken over`, `Changed by a code step`, `Updated tests` or `Already landed` sections.
- Each `Derived Test Matrix` row for Tasks 22-24 (plan lines 196-199) is in its task's `TEST FIRST`.
- TASK 22 satisfied: `parseAuditReport` refuses a Location that is not `path:line` (`audit-report.ts:204-208`), naming the ID. The audit prompt and templates never say Location must be `path:line`, and the security template names findings that have no file (DMARC, headers). The refusal message is actionable; out-of-scope proposal: add the `path:line` rule to the Findings-table guidance.
- TASK 23 satisfied: `scrubFailureFiles` (`workflows.ts:356-375`) redacts through `redact` / `SECRET_KEYS` and cuts stderr to 20 lines, called in `failVerb` before state, commit or comment. The Failure Path calls `workflows fail` in its step 1, before the abort commit.
- TASK 24 not satisfied: the engine side (`--reason-file`, read as plain text, mutually exclusive with `--reason`) and the workflow-shape guard are done, and the rendered copies match. Step 6 does not tell the orchestrator to write the reason file with the file tool (gap below).
- Out-of-scope proposal: `.bkit/core/workflows/bkit-ship.md:406` still passes `--reason="{human's words}"` inside a double-quoted argument, the same shell-injection shape Task 24 removes from bkit-build.
- Advisory: the `docs/testing.md` rows for `audit-report.test.ts` (line 991) and `workflows.test.ts` (line 963) do not yet name the Location refusal or the failure-file scrub; the plan's `Documentation Updates` row for `docs/testing.md` is scoped to Task 16.
- Decision records `build-decision-1-1.md` and `build-decision-1-2.md` concern groups 3 and 5; none accepts a group 6 gap.

## Identified Gaps Log

1 gap.
TASK 24: `.bkit/core/workflows/bkit-build.md:290` — Decision Pause step 6 never tells the orchestrator to write the owner's words with the file tool to `build-owner-reason-{RUN}-{DECISION}.md` before the `--reason-file` call; the bullet reads only "Loop answer, owner's words in `--reason-file`:", so the file may be created with a shell `echo`/`printf` that reintroduces the injection (DONE WHEN: step 6 writes the owner's words with the file tool to a file) — Fixable: true

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** TASK 24: Decision Pause step 6 never tells the orchestrator to write the owner's words with the file tool to `build-owner-reason-{RUN}-{DECISION}.md` before the `--reason-file` call; the bullet reads only "Loop answer, owner's words in `--reason-file`:", so the file may be created with a shell `echo`/`printf` that reintroduces the injection
  **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/workflows/bkit-build.md:290` · **Round:** 1
  - **DONE WHEN:** Decision Pause step 6 writes the owner's words with the file tool to a file and passes it as `decisions apply --by=owner ... --reason-file=<path>`; `decisions apply` reads `--reason-file` as plain text (never shell-expanded); no bash block in `.bkit/core/workflows/bkit-build.md` (or its rendered copies) interpolates `{owner's words}` inside a double-quoted argument.
  - **TEST FIRST:**
    - .bkit/core/engine/audits/workflows/workflow-shape.test.ts engine calls > no bkit-build bash block puts the owner's words inside a double-quoted argument
    - .bkit/core/engine/commands/workflow/decisions.test.ts bkit decisions apply --by=owner and pending > --answer reads the owner's reason from --reason-file
<!-- bkit:task 1 end -->
