Verdict: PASS
Failures: 0
Fixable: false
Tasks: 1, 2, 3
Loosened: none
Fingerprint: 9b803b6fdfc4a3186854d2e228227c230b0d14ae3ccb14a568828e5cfdcf3be4
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

- Tasks 1, 2 and 3 are satisfied against `build-diff-1-1.md` (`counters.ts`, `counters.test.ts`, `decisions.ts`, `decisions.test.ts` and the rebuilt `dist/` copies).
- Task 1: `loopTrend` returns `unknown` on a missing first or last count. `recommend` is `null` on `first-round` and `unknown`. The two `loopProgress with a gate` cases now expect `unknown` with `recommend: null`. The `compose` per-trend map has an `unknown` key. `--loop=verify` on an uncounted red gate prints `Trend: unknown` and recommends `Try again`, because `p.recommend` is `null`.
- Task 2: the compared pair is the earliest round with the last round's `scope`, plus the last round. `codeChanged` is judged on that pair. `rounds[]` carries `scope`. The `--since-clean` regression case passes.
- Task 3: `trendLine` covers all seven cases from the plan's § Engine — loop trend, word for word. When the scopes differ, the different-scopes sentence takes precedence. No sentence names a unit.
- Evidence:
  - `pnpm vitest run` on `.bkit/core/engine/commands/workflow` plus `workflow-shape.test.ts`: 45 files, 2859 tests passed.
  - `pnpm typecheck` exited 0. `pnpm bkit:check:dist` exited 0.
  - `node dist/cli.js counters progress` on scratch logs gave these results:
    - `ci:123` (2) then the gate (`?`): `trend: unknown`, different-scopes `trendLine`, `recommend: null`.
    - CI (2), local (5), local (2): `closing`.
    - 2 → 5: `worse`.
    - A single round: `first-round`.
    - 4 → 4: `stuck`, "did not fall (4 → 4)".
    - `? → ?`: `unknown`, "recorded no count".
- Every Derived Test Matrix row mapped to Tasks 1-3 has its test in the diff, and each one passes.
- Test-first audit (`build-tests-green-1-1.md`): `Enforced: true`, 0 gaps, 0 unproven. It has no `Updated tests` section. The edited existing assertions (two `stuck` → `unknown` cases, and the relocated `loopTrend([r(5), r()], true)` line) are the planned Task 1 updates.
- Docs: `docs/testing.md` is present, and the new tests are unit-tier CLI cases. `docs/observability.md` is present, but the group adds no error path, so it has no logging duty here.
- No decision records, earlier verify reports or remediate logs were supplied.
- Out-of-scope observation, not a gap: the `closing` `trendLine` says "and the code changed" even when `codeChanged` is `null` (git cannot tell). This matches the plan's text and the existing `codeChanged !== false` rule in `loopTrend`.

## Identified Gaps Log

None
