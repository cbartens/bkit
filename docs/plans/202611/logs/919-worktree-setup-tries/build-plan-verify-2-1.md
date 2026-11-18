Verdict: CONCERNS
Failures: 1
Fixable: true
Tasks: 4
Loosened: none
Fingerprint: 8d62a863c6badb2f4f371aa6b6eb20ccc5ccc58924ddd31afc522f51d16b06a2
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

Group 2 holds one task (TASK 4, challenge round 1). Judged against `build-diff-2-1.md`.

- TASK 4 DONE WHEN met: `.bkit/core/engine/commands/workflow/worktrees.ts:1254-1264` throws `EXIT_REFUSED` (7) for design / plan / build when `worktrees` is true (set by `--worktrees` or by `--detect` resolving to worktrees) and the session is on the target and its top level equals `repoRoot`. The throw comes before any mint, log-dir or marker write. A linked worktree on `feat/{FID}` still adopts (its top level differs from `repoRoot`). Ship and debug are outside the condition, so their in-place adoption is unchanged. `dist/commands/workflow/worktrees.js` was rebuilt to match. The `docs/testing.md` row names the refusal.
- TEST FIRST test `refuses design, plan and build in place in the main checkout on feat/{fid} under --worktrees` exists in `worktrees.test.ts` and asserts exit 7, the `main checkout` message and no `docs/plans/{month}/logs/{fid}`. The test-first audit (`build-tests-green-2-1.md`) reports red, then passed, with `Enforced: true` and 0 gaps.
- Ran `worktrees.test.ts` and `worktrees.integration.test.ts` with vitest: 2 files, 158 tests, all passed. No existing test was changed, and none broke.
- The Derived Test Matrix row for TASK 4 is covered by the test above.
- Observability: the new refusal is a `CommandError` that the CLI prints, and no logging change is needed.
- Run note (the `adopted` row at `.bkit/core/.bkit/workflows.md:1365`): it no longer matches. It still says every workflow on `feat/{FID}` is adopted, with the repo root as the fallback `worktreePath`. That is now true only without worktrees, or for ship / debug. Logged as one doc-drift gap. A difference between the source and the installed `.bkit/workflows.md` was not judged.
- No decision records, earlier verify reports or remediation logs for group 2 exist.

## Identified Gaps Log

1 gap.

- TASK 4: `.bkit/core/.bkit/workflows.md:1365` `adopted` row still says a session already on `feat/{FID}` is adopted for "every workflow" with `worktreePath` "else the repo root", and `.bkit/core/.bkit/workflows.md:1374` (Refused exit 7 list) plus the `EXIT_REFUSED` text in `exitCodes` at `.bkit/core/engine/commands/workflow/worktrees.ts:1164` omit the new refusal; after TASK 4, design / plan / build in the main checkout on `feat/{FID}` under `--worktrees` (or `--detect` resolving to worktrees) exit 7 instead, so the docs and the command's help no longer match the behaviour (plan `Documentation Updates` row for `workflows.md`) — Fixable: true

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** Docs and setup help omit the main-checkout refusal TASK 4 added
  **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/.bkit/workflows.md:1365` · **Round:** 1
  - **DONE WHEN:** The `adopted` row at `.bkit/core/.bkit/workflows.md:1365` and the exit-7 list at `.bkit/core/.bkit/workflows.md:1374` say that design / plan / build in the main checkout on `feat/{FID}` under `--worktrees` (or `--detect` resolving to worktrees) exit 7, and only a linked worktree or ship / debug is adopted there. The `EXIT_REFUSED` text in `exitCodes` at `.bkit/core/engine/commands/workflow/worktrees.ts:1164` names the refusal, and `dist/` is rebuilt.
  - **TEST FIRST:**
<!-- bkit:task 1 end -->
