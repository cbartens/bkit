Verdict: CONCERNS
Failures: 1
Fixable: true
Tasks: 2
Loosened: none
Fingerprint: d2519256dcbd85cc5112c149c71875a6e49e06b0c4aaa66be830e8833b5828ba
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

- Mode Group, judged against `build-diff-1-1.md`. The brief has no `Deviations` section. No decision records, earlier verify reports or remediate logs exist for group 1.
- TASK 1 code matches every field: `sessionsRoot` and `commentRunProof` are exported from `.bkit/core/engine/commands/workflow/tracker.ts`; `sessionPublication` now resolves through `sessionsRoot` with its checks and throws unchanged; `endedRunActionKey` takes `workflow: string | undefined`; the guard in `issuesCommand` `comment.run` sits after the `--purpose` check and outside the `commentBody` try, with the planned message. The audit proof's `<outbox>/audit-{slug}/` path matches the `--body-file` that `.bkit/core/prompts/bkit-audit-generate.md:251` passes. All nine TEST FIRST tests pass, and `pnpm typecheck` passes.
- TASK 1 is not satisfied: it broke an existing `bkit issues comment` case in `.bkit/core/engine/ledgers/journal.integration.test.ts` and did not fix it (see the gap below). The static-unit group gate does not run that integration file, so the gap would otherwise go unseen until the final run.
- TASK 2 is satisfied: its summary test passes; the `comment` row in `.bkit/core/.bkit/cli.md` holds "workflow steps only, never for ad-hoc comments"; `tsx .bkit/core/engine/tools/cli-doc.ts` in check mode exits 0, so a second `pnpm cli:sync` would change nothing; `cli-doc.test.ts` passes; a fresh `tsc --outDir` compile into the scratchpad is byte-identical to the committed `dist/`.
- Every Group 1 `Derived Test Matrix` row (Tasks 1 and 2) maps to a test in its task's `DONE WHEN`, and each passes.
- Test-first audit (`build-tests-green-1-1.md`): `Enforced: true`, 0 gaps, 0 unproven, no `Updated tests` section. Already landed: Task 1 `.bkit/core/engine/commands/workflow/tracker.integration.test.ts` "accepts a session minted in the main checkout from a linked worktree". The tests step gave this reason: `sessionPublication` already resolves the Git-common sessions folder, so the call is accepted today; the test guards the new check against regressing.
- Not a gap: `.bkit/core/engine/audits/workflows/catalog-parity.test.ts` "rendered workflow comment contracts" timed out in its `beforeAll` hook during a 13-file run at load average 21.3 on 10 cores. Run alone, it passed 8/8. The group 1 diff does not touch workflow rendering.
- Observability: the refusal is a `CommandError(EXIT.USAGE)` raised before any write or tracker request. Missing optional association arguments are no tracker diagnostic (`docs/observability.md` § Tracker reporting diagnostics), so no `[bkit-tracker]` line is due.
- Tests run: `issues.test.ts`, `tracker.test.ts`, `tracker.integration.test.ts` and `cli-doc.test.ts` gave 227/227 passing. The 13 other test files that reference the comment verb gave 722 passing, 1 failing (the gap) and the catalog-parity load timeout. The full `pnpm test` / `pnpm test:integration` suites were not run end to end.

## Identified Gaps Log

1 gap.

TASK 1: `.bkit/core/engine/ledgers/journal.integration.test.ts` `keeps rendered audit report appended rows and tracker draft counts identical` — broken-test: the existing runless-audit draft call at lines 837-844 (`issues comment --kind=audit --audit-slug=security --result-file=result.json`) carries no run proof, so the new guard refuses it with exit 2 and `expect(draft.code).toBe(0)` fails; Task 1's DONE WHEN requires `pnpm test:integration` green with every existing `bkit issues comment` case, and the task did not fix this test (give the call a proof, e.g. a `--body-file` under `<outbox>/audit-security/` or a `--session-dir` under `<outbox>/sessions/`, without weakening its assertions) — Fixable: true

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** TASK 1 broke the runless-audit draft call in journal.integration.test.ts: no run proof, exit 2
  **Severity:** HIGH · **Class:** broken-test · **Fixable:** true · **Location:** `.bkit/core/engine/ledgers/journal.integration.test.ts:844` · **Round:** 1
  - **DONE WHEN:** pnpm test and pnpm test:integration pass with every existing bkit issues comment case green
  - **TEST FIRST:**
    - .bkit/core/engine/ledgers/journal.integration.test.ts keeps rendered audit report appended rows and tracker draft counts identical
<!-- bkit:task 1 end -->
