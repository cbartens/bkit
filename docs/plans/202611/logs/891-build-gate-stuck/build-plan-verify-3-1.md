Verdict: CONCERNS
Failures: 1
Fixable: true
Tasks: 8, 9
Loosened: none

<!-- verdict:end -->

# Plan Verification

## Scope

Group 3

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

None

## Notes

- Judged against `build-diff-3-1.md` (commit `05d45fd5d`). Inputs: `build-brief-3-1.md`, `build-plan-tests-3-log.md`, `build-plan-tasks-3-log.md`, `build-tests-green-3-1.md`, `build-plan-current.md` (Affected: 0). No earlier verify or remediation log exists for group 3; `build-decision-1-1.md` and `build-decision-1-2.md` cover group 1 only and accept nothing here.
- Test-first audit (`build-tests-green-3-1.md`): `Enforced: true`, 0 gaps, 0 unproven, no `Updated tests` or `Already landed` section. All 13 planned tests went red, then green. TASK 9's planned `toEqual` update (`gate: null`) only adds an expectation.
- Ran `vitest run` on `decisions.test.ts`, `workflows.test.ts` and `cli-doc.test.ts`: 3 files, 200 tests passed. `pnpm typecheck` exits 0.
- TASK 7: every other DONE WHEN clause holds. The 9 tests pass, `Try again` is in every options line, and `decisions.ts` has no import of `tests-base.ts` (imports at lines 18-26). The `--base-check` row in `.bkit/core/.bkit/cli.md` is regenerated, and `dist/commands/workflow/decisions.js` mirrors the source. It stays off `Tasks` only because of the gap below: `pnpm bkit:slop:delta` exits non-zero on the new double cast, so the group gate cannot pass.
- TASK 7 wording, no gap: the `all` reason reads "all N failing tests fail on `dev` too, so no round here can fix them. Fix `dev`, then resume." The Architecture wording is "these N tests fail on `dev` too; no round here can fix them." The adopt sentence starts "This run has no worktrees:" where the Architecture has "In adopt mode:". Every phrase the matrix rows and tests pin is present.
- TASK 8: `apply --by=rerun` checks for `Gate: FAIL` and then for `Status: OPEN` before it writes anything. It writes the `Decision: Re-run gate` line under Q1, sets `DECIDED` and emits `status`. The `--by` help reads `headless | owner | rerun`.
- TASK 9: `OpenDecision.gate` is read with `field("Gate")`, and the output help names `gate`.
- `pnpm bkit:check:dist` was not run, because it deletes and rebuilds `dist/` and this step must not build; a scratch `tsc --outDir` was denied by permissions. Instead I checked by eye that the `dist/` hunks match the source changes, and the tree has no uncommitted `dist/` change.
- No Derived Test Matrix row for tasks 7-9 is missing from a DONE WHEN. Errors surface as `CommandError(EXIT.USAGE)` with named causes, which matches how the CLI reports errors everywhere else.

## Identified Gaps Log

1 gap.

TASK 7: `.bkit/core/engine/commands/workflow/decisions.ts:227` `readBaseCheck` ends `return o as unknown as BaseCheck;`, a double cast through `unknown` that `.agents/rules.md` § Fix code not gates forbids; `pnpm bkit:slop:delta` (run inside `bkit:gate:static`, so inside the group gate `bkit:gate:static-unit`) reports it as 1 added `boundary/type-suppression` finding and fails, so the group gate cannot pass. Fix: build the `BaseCheck` from the already-checked fields (for example `{ verdict, reason: o.reason, base: o.base, source: o.source, failing: o.failing, baseRed: o.baseRed, adopt: o.adopt }` with narrowed locals) instead of casting; the 9 TASK 7 tests must stay green — Fixable: true
