Verdict: CONCERNS
Failures: 2
Fixable: true
Tasks: 1, 2, 3, 4
Loosened: none

<!-- verdict:end -->

# Plan Verification

## Scope

Holistic

## Groups Verified

2 of 2 (the plan has 2 groups).

## Integration Gaps

2.

1. Group 1 TASK 2 and group 2 TASK 5: the `pre-push-direnv` tip's `ask` tells a consumer to replace only the `BKIT_PRE_PUSH_LOGGED` log block with the template's. TASK 5's `.bkit/.env` unset loop sits below that block (`.bkit/templates/.husky/pre-push:56-62`), so a consumer that follows the tip gets `direnv exec .` (which loads `.bkit/.env` through the `.envrc`) without the unset, and every agent push hands `BKIT_GH_TOKEN` and the other tooling keys to the gate. That is the exposure the owner chose to fix (`build-decision-1-1.md` Q2). `fires` also stays quiet for a copy with `direnv exec` but no unset loop.
2. The full-suite run fails on `.bkit/core/engine/audits/repo/ledger-integrity.test.ts` `no row since the cutoff carries a hand-typed whole-second ts`: `docs/decisions.jsonl:802` (the TASK 5 decision row `922-pre-push-gate-env-unsets-bkit-env-keys`, updates 2) carries the hand-typed `ts` 1794440000000.

## Previously Attempted

- `build-plan-verify-holistic-1.md`: PASS, 0 failures, Tasks 1, 2, 3. It ran before group 2 existed, so it covered one group.
- `build-plan-verify-1-1.md` (Group 1): PASS, Tasks 1, 2, 3.
- `build-plan-verify-2-1.md` (Group 2): CONCERNS, 3 gaps, closed by `build-plan-gaps-remediate-2-1-log.md`.
- `build-plan-verify-2-2.md` (Group 2): CONCERNS, 1 gap, closed by `build-plan-gaps-remediate-2-2-log.md`.
- `build-plan-verify-2-3.md` (Group 2): PASS, Tasks 4, 5.

## Notes

- `bkit tests changed --base=origin/dev --fallback=bkit:gate:static-unit` (via `node dist/cli.js`) exited 1, verdict FAIL. Related run: 46 files, 2773 tests passed. Named run: 1 failed, 226 files passed (9327 tests passed, 2 skipped); the one failure is integration gap 2. Typecheck ran. The `cloud-setup` lines about `cli` failing are marked non-blocking. No exit 81.
- TASK 1: both hook copies carry the same direnv log block (condition, `direnv exec . true` probe, `direnv allow .` block with exit 1, `direnv exec . sh "$0" "$@"` inner run, plain fallback). All six matrix rows in `describe(".husky/pre-push direnv")` loop over both hooks and pass.
- TASK 2: `pre-push-direnv` exists in source and `dist/checks/tips/catalogue.js`. Its matrix test passes, and this repo's `.husky/pre-push` contains `direnv exec` with an `.envrc` present, so bkit's own repo does not fire it once the branch lands. The DONE WHEN holds, so the task is named on `Tasks`. The cross-task gap with TASK 5 is logged as integration gap 1.
- TASK 3: § Git hooks — Husky and § direnv — `.envrc` describe the shipped behaviour, including TASK 5's unset. The § Git hooks section is identical in `.bkit/core/.bkit/templates.md` and the mirror `.bkit/templates.md`. TEST FIRST is n/a (docs only).
- TASK 4: `allowDirenv` in `.bkit/core/engine/commands/workflow/worktrees.ts` narrates "push will block" for a differing `.envrc` and for a failed `direnv allow`, and `dist/` matches. `.bkit/core/.bkit/workflows.md:1184` and its mirror are reworded the same way. The matrix test passes. The hook blocks exactly when the worktree narration says it will (an `.envrc`, direnv on `PATH`, `CI` unset, untrusted), so groups 1 and 2 agree there.
- TASK 5: both hook copies carry the same unset loop at the top of the inner run, and the matrix test `trusted .envrc → .bkit/.env tooling keys do not reach the gate` passes for both. The `gh-mcp` advisory and tip guards (`BKIT_PRE_PUSH_LOGGED`) have tests. The task is left off `Tasks` because its decision row breaks `ledger-integrity.test.ts` (integration gap 2), and the full suite must pass. Checked the hook's later `gh` calls: the docs have the `gh` CLI authenticate through `gh auth login`, not `.bkit/.env` (whose example holds only `BKIT_*` keys), so the unset does not break the hook's own `gh` steps.
- Decision record `build-decision-1-1.md` (Status: DECIDED): the owner answered "Fix now — fix now for both" for TASK 4 and TASK 5. It accepts neither gap logged here.
- No test-first audit report was supplied to this holistic step. The group audits (`build-tests-green-1-1.md`, `build-tests-green-2-3.md`) were decided in the group verify reports.
- Derived Test Matrix: all 9 rows have a test in the named target file, and each passes. The plan has no `Documentation Updates` section. `docs/testing.md` and `docs/observability.md` exist; the hook's block message uses the hook's existing `[pre-push]` prefix.
- Out of scope, proposed separately: `build-challenge-2.md` lists two LOW fixable findings (the `find-skills` `computedHash` in `skills-lock.json`, and the `direnv allow .` fix line not asking for a review of the `.envrc` change). They are not plan tasks. `docs/deferrals.jsonl` holds `922-pre-push-load-challenge-low-skills-lock-json-29` for the first; this report found no row for the second (the review step).

## Identified Gaps Log

2 gaps.

INTEGRATION: Group 1 TASK 2 and group 2 TASK 5 do not work together — the `pre-push-direnv` tip (`.bkit/core/engine/checks/tips/catalogue.ts`, `ask`: "Replace the log block of .husky/pre-push (the `BKIT_PRE_PUSH_LOGGED` block) with the one in .bkit/templates/.husky/pre-push") sends a consumer to paste only the `if [ -z "${BKIT_PRE_PUSH_LOGGED:-}" ] ... fi` block, but TASK 5's `.bkit/.env` unset loop sits after that block's `fi` (`.bkit/templates/.husky/pre-push:56-62`). A consumer that follows the tip gets `direnv exec .` loading `.envrc` (and with it `dotenv_if_exists .bkit/.env`) into the gate with no unset, so `BKIT_GH_TOKEN` and the other tooling keys reach every agent push's gate and `tmp/pre-push.log` — the exposure the owner chose "Fix now" for (`build-decision-1-1.md` Q2, decision row `922-pre-push-gate-env-unsets-bkit-env-keys`). `fires` (`!hook.includes("direnv exec")`) also stays quiet for a copy that has `direnv exec` but no unset loop. Fix: make the `ask` (and `why`) name both the log block and the `.bkit/.env` unset block that follows it, and have `fires` also fire when the hook has `direnv exec` but not the unset loop; extend `pre-push-direnv fires only for a hook without direnv exec in a repo with .envrc` in `.bkit/core/engine/checks/tips/catalogue.test.ts` to cover that case; rebuild `dist/checks/tips/catalogue.js`. — Fixable: true
INTEGRATION: TASK 5 (group 2, written by `build-plan-gaps-remediate-2-1-log.md` Gap 3) breaks the full suite — `bkit tests changed --base=origin/dev --fallback=bkit:gate:static-unit` exits 1 on `.bkit/core/engine/audits/repo/ledger-integrity.test.ts` `live ledgers are machine-readable > no row since the cutoff carries a hand-typed whole-second ts`: "docs/decisions.jsonl:802: ts=1794440000000 (2026-11-11T23:33:20.000Z) is whole-second". That is the `922-pre-push-gate-env-unsets-bkit-env-keys` row (updates 2), whose `ts` was hand-typed. The row has not landed on dev, so fix it on the branch: give it a real millisecond `ts` (e.g. from `Date.now()`, through the ledger write idiom in `.bkit/jsonl.md`), keeping `firstTs` 1794437893959 and `updates` 2, then re-run the test. — Fixable: true
