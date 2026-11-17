Verdict: CONCERNS
Failures: 3
Fixable: true
Tasks: 2
Loosened: none
Fingerprint: f3591c736c31d6dd62018eb070fdef7ea7a5328bf24b4d5afcbe2034074bbf26
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

- Mode `Group`, judged against `build-diff-1-1.md` (four files: `vitest.child-deadline.ts`, `vitest.setup.ts`, `vitest-child-deadline.test.ts`, `vitest-child-deadline.integration.test.ts`). No brief `Deviations`, no decision records, no earlier verify or remediate logs.
- Test-first audit (`build-tests-green-1-1.md`): `Enforced: true`, `Gaps: 0`, `Unproven: 0`; no `Updated tests`, `Already landed` or `delete-still-referenced` entries.
- Re-ran both test files in the worktree: 2 files, 5 tests passed in 5.63s.
- TASK 1: `DONE WHEN` met literally (four unit tests pass; `vitest.child-deadline.ts` imports only `type` from `node:child_process`, no vitest). Left off `Tasks` because its own files break `bkit:gate:static`: `tsc -p tsconfig.test.json` reports TS5097 at `vitest-child-deadline.test.ts:9` (the only TS error on the branch), and `pnpm bkit:slop:delta` exits 1 with two net-new `boundary/type-suppression` double casts (`vitest.child-deadline.ts:28`, `vitest-child-deadline.test.ts:17`), which `.agents/rules.md` § Fix code not gates also prohibits.
- TASK 2: satisfied. `vitest.setup.ts` wraps `node:child_process`, calls `syncBuiltinESMExports()`, sets the deadline in `beforeEach` from `ctx.task.timeout`, clears it in `afterEach`, falls back to `budget.hookTimeout` outside a test, and the header lists the fifth job. The integration test passes.
- Matrix row 4 ("with no current test the hook limit is used, and an expired limit becomes 1ms") is covered by `uses at least 1ms when the limit has already passed`, which asserts only the 1ms half; the hook-limit fallback (`vitest.setup.ts`) is implemented but no test asserts it. Recorded as an observation, not a gap: the plan's own `TEST FIRST` names this test for the row.
- Full suite not run here: `vitest.setup.ts` now wraps child calls in every worker, so the group gate (`bkit:gate:static-unit`) is the check that the rest of the suite still passes.
- `docs/observability.md`: not applicable (bkit-only test harness; the wrapper throws an `Error` with `cause`, no runtime logging). The plan has no `Documentation Updates` section; `docs/testing.md` changes belong to Task 5 (group 2).

## Identified Gaps Log

3 gaps.

TASK 1: `.bkit/core/engine/audits/repo/vitest-child-deadline.test.ts:9` — the import `../../../../../vitest.child-deadline.ts` ends in `.ts`, so `pnpm bkit:typecheck:tests` (part of `pnpm typecheck` in `bkit:gate:static`) fails with TS5097; sibling tests import root `vitest.*` files without the extension — Fixable: true
TASK 1: `vitest.child-deadline.ts:28` — `childProcess as unknown as Record<string, Fn>` is a double cast through `unknown`, a type-system escape that `pnpm bkit:slop:delta` flags as net-new `boundary/type-suppression` (gate exits 1) — Fixable: true
TASK 1: `.bkit/core/engine/audits/repo/vitest-child-deadline.test.ts:17` — `target as unknown as typeof childProcess` is a double cast through `unknown` that `pnpm bkit:slop:delta` flags as net-new `boundary/type-suppression` (gate exits 1) — Fixable: true

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** TASK 1: `.ts` import extension breaks `tsc -p tsconfig.test.json` (TS5097)
  **Severity:** HIGH · **Class:** gate-static · **Fixable:** true · **Location:** `.bkit/core/engine/audits/repo/vitest-child-deadline.test.ts:9` · **Round:** 1
  - **DONE WHEN:** `pnpm bkit:typecheck:tests` reports no TS5097: import `vitest.child-deadline` without the `.ts` extension, as sibling tests import root `vitest.*` files
  - **TEST FIRST:**
    - .bkit/core/engine/audits/repo/vitest-child-deadline.test.ts
<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->
- [ ] **TASK 2:** TASK 1: double cast through `unknown` in `withChildDeadline`
  **Severity:** HIGH · **Class:** type-suppression · **Fixable:** true · **Location:** `vitest.child-deadline.ts:28` · **Round:** 1
  - **DONE WHEN:** `pnpm bkit:slop:delta` reports no net-new `boundary/type-suppression` in `vitest.child-deadline.ts`: no `as unknown as` double cast
  - **TEST FIRST:**
<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->
- [ ] **TASK 3:** TASK 1: double cast through `unknown` in the unit test helper
  **Severity:** HIGH · **Class:** type-suppression · **Fixable:** true · **Location:** `.bkit/core/engine/audits/repo/vitest-child-deadline.test.ts:17` · **Round:** 1
  - **DONE WHEN:** `pnpm bkit:slop:delta` reports no net-new `boundary/type-suppression` in `vitest-child-deadline.test.ts`: no `as unknown as` double cast
  - **TEST FIRST:**
    - .bkit/core/engine/audits/repo/vitest-child-deadline.test.ts
<!-- bkit:task 3 end -->
