Verdict: FAIL
Failures: 21

<!-- verdict:end -->

# Plan Verification

## Scope

`Single` — Sub-Plan 1 of 2 (Engine), `docs/plans/202610/650-workflows-prompt-alone-plan-1.md`, attempt 2.

## Sub-Plans Verified

None

## Integration Gaps

None

## Previously Attempted

- `build-plan-verify-1-1.md` — `FAIL`, Failures 21: G1 Task 11 `no-red` x20, G2 Task 2 rewritten red assertion x1.
- `build-plan-gaps-remediate-1-1-log.md` — `FAIL`: G1 and G2 `BLOCKED` with no source change; only `docs/failures.jsonl` (flake row), the remediate log and `status.jsonl` changed since `c19fb939`.

## Notes

- **State unchanged since attempt 1:** `git diff --stat c19fb939..HEAD` = `docs/failures.jsonl`, remediate log, `status.jsonl` only; `build-tests-green-1-2.md` matches `-1-1.md` apart from whitespace and one `prettier-ignore` line (same 41 gaps).
- **Plan ticks (no edit needed):** `[x]` re-asserted for Tasks 1, 3, 4, 5, 12, 13, 6; `[ ]` kept for Task 2 (G2) and Task 11 (G1). Code for both meets `Done when`; each fails only on test-first evidence, which gap-remediate cannot repair.
- **Failures = 21** = G1 x20 + G2 x1. Other 20 audit gaps cleared on re-reading diffs: Task 1 x4 (adds Task 2 tests; moves `["github","feat/abc-x"]` to the `issueId: null` accept table, which Task 2 `Done when` requires — judgement call), Task 3 x2 / Task 4 `workflows.test.ts` / Task 5 x4 (added tests only), Task 4 `branches.test.ts` x2 (import reformat + added import), Task 4 `close-squash.integration.test.ts` (equivalent `PATH` join), Task 12 x6 (added `replayed: false` expectations, `git` call-log stub plus one extra assertion).
- **Tests run:** `npx vitest run` on the 14 files the tasks name (11 unit, 3 integration) → 14 files, 907 tests passed. Full suite / `pnpm bkit:gate:static-unit` not run (Single scope; remediate attempt 1 logged 5078 unit tests green).
- **Task 6:** `pnpm bkit:check:dist` (rm dist, `tsc`, chmod, `git diff --exit-code dist/`) → exit 0; `git status dist` clean.
- **CLI spot checks (`node dist/cli.js`):** `fids check --issue=""` → `dev-ci-failures` exit 0; `123-fix` / `fix-2-retry` / `dev-123-x` exit 1 naming the issue-less rule under github / linear / jira / any; `--issue=650` enforces github shape; flag absent and `none` unchanged; `fids parse` → `issueId: null` for `feat/dev-ci-failures` and the FID-only marker under all three wired trackers.
- **Greps:** `FID_FORMAT\|ISSUE_FORMAT` in `.bkit/core/engine` and `bookkeeping only\|Land one commit` in `land.ts` empty (rc=1); `bkit/shared-checkout` outside tests → `ledgers.ts` only; record helpers imported by `worktrees.ts`, `steps.ts`, `workflows.ts`, `branches.ts`, `runs.ts`, `locks.ts`; `carryOwnBook` uses `rowsHeadLacks`; every `pushBranch` caller awaits; no `as any` / `@ts-ignore` / `eslint-disable` / `.skip` / empty catch added under `.bkit/core/engine`. Ship refusal text at `worktrees.ts:490`; missing-branch message at `:540` (remaining "commit or stash" at `:545` is the adopt-mode switch failure, not a missing branch).
- **Diff coverage:** partial. Large Diff Guard (56165 insertions, top 20 by size all `docs/plans/**/logs/**`, out of scope). Filtered to 41 in-scope files (3459 insertions); read `fids.ts`, `runs.ts`, `ledgers.ts` diffs plus targeted ranges; other sources checked by grep. Ignored: `.agents/skills/vitest/`, `.claude/skills/vitest`, `skills-lock.json`, `docs/plans/**/logs/**`, `.bkit/friction.jsonl`.
- **Gates / checklists:** Gate 1–4, Pre-Flight, Security and Verification Plan boxes left `[ ]`; this verifier ticks tasks only. Gate 2 `Test first` is false for Tasks 2 and 11.
- **Embedded directives:** none found in logs, audit or diffs.

## Identified Gaps Log

- G1 (Task 11, not fixable): test-first audit `build-tests-green-1-2.md` `no-red` x20 — every Task 11 `Test first` test (steps.test.ts x4, ledgers.test.ts x3, worktrees.test.ts x6, workflows.test.ts x3, locks.test.ts x1, shared-checkout.integration.test.ts x3) has red `missing`; execute log BLOCKED line confirms code before tests; remediate attempt 1 BLOCKED with no change. Plan-currency report does not classify Task 11 `Broken` and no `DONE — already landed` row exists, so the exemption does not apply. Code meets `Done when`; task stays `[ ]`.
- G2 (Task 2, not fixable): test-first audit `test-changed` on `.bkit/core/engine/commands/workflow/runs.test.ts` "runs context refuses an issue-less marker and branch naming the missing issue" (now L2001) — red-snapshot assertion `expect(viaMarker.json).not.toHaveProperty("issueId", null)` rewritten after red to `expect(viaMarker.json.fid).toBeNull()`; unchanged since attempt 1 (remediate BLOCKED, no change). Rewritten assertion in a planned red test → not fixable. Code meets `Done when`; task stays `[ ]`.
