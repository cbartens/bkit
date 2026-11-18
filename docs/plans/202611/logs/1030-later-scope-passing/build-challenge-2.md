Verdict: CONCERNS
Failures: 1
Fingerprint: a08a06880c8c4ac8c26612b1f68d76c26623d4786521a315d94e440ef8de9c32
<!-- verdict:end -->

# Build Challenge

Lens: Security — auth, secrets, input validation, data exposure, OWASP, data-access policies / tenancy.

## Scope

- Diff: `tmp/bkit-diff-1030-later-scope-passing.md`, full coverage (its first line is a `diff --git` header, not `partial diff coverage`).
- Plan: `docs/plans/202611/1030-later-scope-passing-plan.md`, Tasks 1 to 3.
- Surfaces challenged: `RESOLVED_BY`, the new `DIAGNOSE` set, `SAME_SCOPE` and the new concern branch in `buildSummary` (`.bkit/core/engine/commands/workflow/summary.ts:78-99`, `:577-578`); the `dist/commands/workflow/summary.js` mirror; the six new cases in `summary.test.ts`; the Resolution evidence row in `.bkit/core/.bkit/workflows.md` and its render `.bkit/workflows.md`; the `docs/testing.md` row; the new `.bkit/friction.jsonl` and `docs/failures.jsonl` rows; the `.bkit/version` hash.
- Downstream routing read to judge impact: `.bkit/core/workflows/bkit-build.md` Steps 13 to 16, and `.bkit/core/workflows/bkit-debug.md` Steps 6 to 11 and its Failure Path.

## Notes

- Evidence for Task 1:
  - Both diagnose steps go on to the remediate step whatever their verdict: `bkit-debug.md` Step 6 sub-step 4 routes to Step 7 unless the mode is SOAK, and `bkit-build.md` Step 13 flows into Step 14. `steps finish` does not stop on a FAIL (`.bkit/core/engine/commands/workflow/steps.ts:1671` only marks the comment for attention). So the fix that a FAIL diagnosis warned about is applied and tested.
  - The diagnose prompt sets FAIL when the recommended fix leaves an unhandled break in a surface other code depends on, and names middleware and routing (`.bkit/core/prompts/bkit-debug-failure-diagnose.md:116-120`).
  - On `dev`, debug Steps 9 and 10 skip their pushes and leave them to the Step 11 close (`bkit-debug.md:691`, `:722`). Step 11 runs only on PASS or CONCERNS (`:728`) and pushes the run's own commits (`:763`). The Failure Path on a shared checkout lands only the run's record, as one commit built in a throwaway `origin/dev` checkout (`.bkit/core/engine/commands/workflow/workflows.ts:842`). So before the diff, the fix commits stayed local.
  - `docs/security.md` § CI Auto-Route Trust says `/bkit-debug` remediates on `dev` in place and is dispatched by CI on a red `dev`, so this path can run with no human watching.
  - A CI-sourced first round carries the scope `ci:<id>`, so a local pass cannot answer the diagnosis that follows it (the existing test `a debug fix FAIL after a CI-sourced round is not resolved by a local pass` shows the same rule for remediate). The path stays open for a second, local round of a CI-dispatched run, and for a debug run started by hand on `dev`.
  - Severity is MEDIUM, not HIGH: the harm needs a diagnosis that flags a break the gate does not test, the push reaches `dev` and not `main` (`main` takes a PR with `bkit-tests-check`, `docs/security.md` § Repository controls), and the `dev` CI run after the push still gates the run.
- Covered already, so no task block: the build path of the same rule. A diagnose FAIL answered by a later same-scope pass now gives CONCERNS and a reason line instead of PASS (plan Task 3, the owner's decision in `docs/plans/202611/logs/1030-later-scope-passing/build-decision-1-3.md`). In build, CONCERNS still opens a PR, so a human sees the concern before merge.
- Vectors checked with no finding:
  - Authentication, sessions and permissions: the diff touches none.
  - Data access and tenancy: bkit has no database (`docs/security.md` § RLS).
  - Input validation: the new concern line is built only from fixed step names (`g.label` from a `DIAGNOSE` key, `answer.row.step` from `RESOLVED_BY`), so no status-row text reaches the tracker comment through it. Scope matching stays exact string equality, and a missing or different scope keeps the FAIL. The scope lookup reads only this run's rows (`summary.ts:128`).
  - Verdict counting: `verdict` and `failures` come from the `fails` array (`summary.ts:616-617`, `:861`), so the word `FAIL` in the concern line is never counted as a failure.
  - Only FAIL rows reach the new branch: a diagnose CONCERNS row gets no answer list (`summary.ts:523-527`), so the fixed `FAIL` in the concern text is always true.
  - Soak exclusion: `debug/debug-failure-soak` is in none of `RESOLVED_BY`, `RESOLVED_BY_RUN`, `DIAGNOSE` or `SAME_SCOPE`.
  - Mirror: `dist/commands/workflow/summary.js` carries the same tables and branch as the source.
  - Secrets and data exposure: the new ledger rows hold no secret, token, personal data or consumer name, and `.bkit/version` holds content hashes only. The new `docs/failures.jsonl` row's `key` holds spaces, `+` and `:`, which the ledger contract allows (any non-empty string, `.bkit/jsonl.md:40`), so it is not an injection vector.
  - Supply chain: no new dependency.
- Outside this lens, proposed separately: the ACTIVE decision `903-diagnose-fail-resolved-by-later-pass-soak-not` in `docs/decisions.jsonl` still says a later pass resolves a diagnose FAIL, while the code now reports it as a concern. The owner chose to write no decision row (`build-decision-1-3.md`).
- Docs:
  - `docs/security.md` was read in full. § CI Auto-Route Trust backs Task 1.
  - `.agents/docs.md` was read. Warning: `docs/data-schema.md` is still the starter template (header only), and the review continued.
  - The other always-read Build docs (`docs/architecture.md`, `docs/capabilities.md`, `docs/knowledge.jsonl`, `docs/observability.md`, `.bkit/prompts.md`, `.agents/skills.md`) were searched for the summary command and the diagnose step, not read in full. Only `docs/observability.md:227` (documentation warnings, unchanged by the diff) and `.bkit/prompts.md` (agent catalogue rows) mention them.
- Verification: no test was run, because this agent's mandate excludes building or running code. The TEST FIRST case was checked by reading it against the code the diff leaves: the existing test `a debug-failure-diagnose FAIL resolved by a later passing test run on the same scope is historical` (`summary.test.ts:964`) asserts CONCERNS for the same rows, so a test that expects FAIL fails today.

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** A debug run on `dev` whose diagnose step reported FAIL for an unhandled break in a dependent surface such as middleware or routing applies the fix anyway, passes the gate on suites that never exercise that surface, gets the summary verdict CONCERNS, and the Step 11 close pushes the fix straight to the shared `dev` branch with no PR and no human, where before the diff the FAIL sent the run to the Failure Path and the fix commits stayed local
  **Severity:** MEDIUM · **Class:** architectural · **Fixable:** false · **Location:** `.bkit/core/engine/commands/workflow/summary.ts:85` · **Round:** 1
  - **DONE WHEN:** The owner has decided whether a debug run may push a fix to `dev` when its diagnose step reported FAIL and only a later same-scope green test run answers it, and the code matches that choice: either `debug/debug-failure-diagnose` keeps the debug summary at FAIL (out of `RESOLVED_BY`, `DIAGNOSE` and `SAME_SCOPE`), or the debug workflow stops before the Step 11 push on `dev` while the summary carries a diagnose concern, or the owner accepts the direct push and records it in `docs/decisions.jsonl` against `903-diagnose-fail-resolved-by-later-pass-soak-not`. No agent can settle this: the owner's decision in `docs/plans/202611/logs/1030-later-scope-passing/build-decision-1-3.md` was asked only about the build path ("so the build opens the PR"), where a CONCERNS still reaches a human through the PR. In debug, CONCERNS routes exactly like PASS (`.bkit/core/workflows/bkit-debug.md:728`), a run on `dev` has no PR, and the close pushes its own commits (`.bkit/core/workflows/bkit-debug.md:763`), so the concern line protects nothing there. Choosing between the three options changes either that decision or the debug workflow's routing.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/summary.test.ts` `a debug-failure-diagnose FAIL answered by a later same-scope pass still holds the debug summary at FAIL` fails on the verdict coming out CONCERNS, with `debug-failure-diagnose FAIL, tests passed since (debug-run-tests)` in `reasons` and no `debug-failure-diagnose FAIL` reason, for `workflow: "debug"` and the rows `scopedRun("debug-run-tests", 1, "FAIL", 1, "src/a.test.ts")`, a `debug-failure-diagnose` FAIL at attempt 1, and `scopedRun("debug-run-tests", 2, "PASS", 0, "src/a.test.ts")`
<!-- bkit:task 1 end -->
