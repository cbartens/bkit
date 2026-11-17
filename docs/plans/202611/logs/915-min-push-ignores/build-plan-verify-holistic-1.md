Verdict: PASS
Failures: 0
Fixable: false
Tasks: 1, 2, 3, 4, 5, 6, 7
Loosened: none
Fingerprint: 5ad4a21e905021b4592364f6d05cae7e38831e2d8b21630bb8c533913df37035
<!-- verdict:end -->

# Plan Verification

## Scope

Holistic

## Groups Verified

2 of 2 (the plan has 2 groups).

## Integration Gaps

0. Checked across groups:

- One classifier: `minPushOutside` (`.bkit/core/engine/commands/ci/ci.ts`) serves `--ref` (`minPush`), `--update` (`increment`, `whole`), the receipt path (`hasVerifiedIncrement` gets `(a, b) => minPushOutside(cwd, a, b, paths)`), and the landing routine (`checkLanding` in `.bkit/core/engine/commands/land.ts`). `push-gate.ts` and `land.ts` no longer import `changedOutside`, and `push-gate.ts` does not import `ci.ts`, so there is no import cycle. `changedOutside` itself is unchanged, so `bkit ledgers only-bookkeeping` and ship's gate keep their contract.
- API contracts: the `outsideOf` callback type `{ ok: true; outside: string[] } | { ok: false }` is a supertype of `MinPushOutside`, and `pnpm typecheck` exits 0. `managedHead` (Task 1) is imported by `ci.ts` (Task 3) and refuses the same marker shapes as `replaceManagedBlock`. `gitRaw` is exported with no behaviour change.
- Shared state: `minPushPathspecs` (Task 2) adds `docs/audits/**` for every caller. The `bkit ci min-push` help text (`ci.ts`), the engine comments (`core.ts`, `settings.ts`) and the shipped doc (`.bkit/core/.bkit/templates.md`, Task 7) describe the same floor and the same audit-template rule.
- Cross-domain boundaries: both hook copies run `dist/cli.js`; `pnpm bkit:check:dist` exits 0, and the hook integration cases for Tasks 2 and 4 pass. bkit's own `bkit:gate:min` (Task 6) now runs `templates.test.ts` and `template-no-userpath.test.ts`, which are the two below-marker readers the Task 3 exception lets through. The seeded consumer `BKIT_GATE_SCRIPTS` is unchanged.

## Previously Attempted

- `build-plan-verify-1-1.md`: CONCERNS, 1 gap (Task 2 seed comment in `core.ts`), closed by `build-plan-gaps-remediate-1-1-log.md` (commit `a6d5a1f38`).
- `build-plan-verify-1-2.md`: PASS, Tasks 1-5.
- `build-plan-gaps-remediate-1-2-log.md`: group gate re-run with no file changes, exit 0.
- `build-decision-1-1.md`: group 1, the owner resumed the run and the gate re-ran. It accepts no gap.
- `build-plan-verify-2-1.md`: PASS, Tasks 6-7.
- No earlier holistic attempt.

## Notes

- `node dist/cli.js tests changed --base=origin/dev --fallback=bkit:gate:static-unit`: exit 0, `verdict: PASS`, gate `bkit:gate:changed`. Vitest reported `Test Files 234 passed (234)` and `Test Files 232 passed (232)`, with no FAIL lines. It never hit the tests lock (exit 81).
- Gates re-run by this verifier at HEAD `7eb5ce92a` plus the uncommitted plan and status files: `pnpm typecheck` exit 0; `pnpm bkit:check:dist` exit 0; `pnpm bkit:graph:check` exit 0; `pnpm bkit check` exit 0. `diff .bkit/core/.bkit/templates.md .bkit/templates.md` differs only on line 3, the managed-version marker.
- Every task's `DONE WHEN` is met: Tasks 1-5 per `build-plan-verify-1-2.md` and this run's full changed suite; Tasks 6-7 per `build-plan-verify-2-1.md`, with `package.json` `bkit:gate:min` and the `templates.md` text checked in the full diff.
- Derived Test Matrix: each of the 15 rows has its test in its task's `DONE WHEN`. All 25 `TEST FIRST` tests are in the diff: 5 in `managed-block.test.ts`, 13 in `ci.test.ts` (Tasks 2-4), 2 in `land.test.ts`, 1 in `push-gate.test.ts`, and 2 hook cases run once per hook copy (4 tests). The Task 6 rows are existing tests that `bkit:gate:min` now runs.
- Test-first audits (`build-tests-green-1-1.md`, `-1-2.md`, `-2-1.md`): `Enforced: true`, 0 gaps, 0 unproven, no updated or already-landed tests, so nothing was loosened.
- `docs/observability.md`: the new log line goes through `ctx.log`, which uses the command's `[bkit-ci]` prefix (§ Log Format). The change adds no new error path: `minPushOutside` passes `changedOutside`'s `{ ok: false, stderr }` through unchanged to callers that already report it. An unreadable blob fails closed to `outside`. `docs/testing.md` is present.
- Documentation Updates: the `templates.md` source and mirror are done; `docs/capabilities.md` is regenerated (`bkit:graph:check` passes); `docs/decisions.jsonl` holds `min-push-floor-is-ship-allow-list` (updates 2) and `915-min-push-audit-template-project-section`, where the updates-3 row (line 800) records the owner's option A; `.bkit/cli.md` and `docs/migrations.md` needed no change. `.agents/docs.md` needs no new row.
- Out-of-scope observation, not a gap: rows 805-807 of `docs/decisions.jsonl` are byte-identical copies of rows 797-799. This comes from the union merge of the plan commit that landed on `dev` (`af0f02ba0`). `ledger-integrity.test.ts` passes, and the latest row for each key is still the newest one.
- `DETAILS.md` and `.bkit/friction.jsonl` changes in the diff are graph-refresh and orchestrator output, outside every task, and harmless.

## Identified Gaps Log

None
