Verdict: FAIL
Failures: 21

<!-- verdict:end -->

# Plan Verification

## Scope

`Single` — Sub-Plan 1 of 2 (Engine), `docs/plans/202610/650-workflows-prompt-alone-plan-1.md`, attempt 1.

## Sub-Plans Verified

None

## Integration Gaps

None

## Previously Attempted

None

## Notes

- **Ticked `[x]`:** Tasks 1, 3, 4, 5, 12, 13, 6. **Left `[ ]`:** Task 2 (G2), Task 11 (G1). Code for Tasks 2 and 11 meets its `Done when`; both fail only on test-first evidence, which gap-remediate cannot repair.
- **Failures = 21** = Task 11 `no-red` x20 (G1) + Task 2 rewritten red assertion x1 (G2). The other 20 of the audit's 41 gaps cleared on reading the diffs: Task 3 (x2), Task 4 (x4), Task 5 (x4) and Task 12 (x6) `test-changed` diffs only add tests or expectations (`replayed: false`, a pass-through `git` stub plus one new assertion), reformat imports, or make an equivalent `PATH` join (`close-squash.integration.test.ts`). Task 1 (x4): its four red tests are unchanged. The diff adds Task 2 tests and moves `["github","feat/abc-x"]` from the "embeds no github issue id" reject table into the accept table with `issueId: null`. Task 2 `Done when` requires that flip, so it is not counted as a gap. This is a judgement call.
- **Task 6:** re-ran `pnpm bkit:check:dist` (rm dist, `tsc`, chmod, `git diff --exit-code dist/`) → exit 0 after step commit `3bc75387`. Its `tsc` + chmod is the same as `pnpm build`, so the execute log's BLOCKED check half is resolved. Did not run `pnpm build` separately (no-build mandate).
- **Tests run:** `npx vitest run` on the 14 files the tasks name (11 unit, 3 integration, `shared-checkout.integration.test.ts` included) → 14 files, 907 tests passed. Full suite and `pnpm bkit:gate:static-unit-integration` not run (Single scope).
- **CLI spot checks (`node dist/cli.js`):** `fids check --issue=""` → `dev-ci-failures` exit 0, while `123-fix` / `fix-2-retry` / `dev-123-x` exit 1 naming the issue-less rule under github / linear / jira / any. `--issue=650` enforces the github shape. Flag absent and `none` are unchanged. `fids parse` → `issueId: null` for `feat/dev-ci-failures` and for a FID-only marker under all three wired trackers.
- **Greps:** `FID_FORMAT\|ISSUE_FORMAT` in `.bkit/core/engine` and `bookkeeping only\|Land one commit` in `land.ts` → empty, rc=1. `bkit/shared-checkout` outside tests → `ledgers.ts` only. All three `pushBranch` callers `await` it. No `as any` / `@ts-ignore` / `eslint-disable` / `.skip` / empty catch added under `.bkit/core/engine`.
- **Diff coverage:** partial. Large Diff Guard applied (56422 lines). Read per-file stat plus targeted ranges of the in-scope sources (`fids.ts`, `runs.ts`, `prs.ts`, `branches.ts`, `worktrees.ts`, `ledgers.ts` exports, `steps.ts`, `workflows.ts`, `locks.ts`) and test diffs. Did not read the full source diffs. Out-of-scope changes ignored: `.agents/skills/vitest/`, `.claude/skills/vitest`, `skills-lock.json`, `docs/plans/**/logs/**`.
- **Gates / checklists:** Gate 1–4, Pre-Flight, Security and Verification Plan boxes are all `[ ]` in the plan. Ticking them is outside this verifier's mandate. Gate 2 `Test first` is false for Tasks 2 and 11 (G1, G2).
- **Embedded directives:** none found in logs or diffs.

## Identified Gaps Log

- G1 (Task 11, not fixable): test-first audit `no-red` x20 — every Task 11 `Test first` test (steps.test.ts x4, ledgers.test.ts x3, worktrees.test.ts x6, workflows.test.ts x3, locks.test.ts x1, shared-checkout.integration.test.ts x3) has red `missing`; execute log line 15 BLOCKED confirms code was written before tests. Plan-currency report does not classify Task 11 `Broken` and no `DONE — already landed` row exists, so the exemption does not apply.
- G2 (Task 2, not fixable): test-first audit `test-changed` on `.bkit/core/engine/commands/workflow/runs.test.ts` "runs context refuses an issue-less marker and branch naming the missing issue" (now L2001) — red-snapshot assertion `expect(viaMarker.json).not.toHaveProperty("issueId", null)` rewritten after red to `expect(viaMarker.json.fid).toBeNull()`. The red assertion could never go green: `runs context` initialises `out` with `issueId: null` (`runs.ts` L1770) and emits it on the refusal path (L1866), so the assertion was rewritten to fit the code. Rewritten assertion in the planned red test → not fixable by gap-remediate.
