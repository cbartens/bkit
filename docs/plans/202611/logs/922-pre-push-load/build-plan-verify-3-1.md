Verdict: CONCERNS
Failures: 1
Fixable: true
Tasks: 6, 7
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

- Mode: Group. Judged against `build-diff-3-1.md`; the brief has no `Deviations` section.
- TASK 6 satisfied: `vitest.setup.ts:113` deletes `BKIT_PRE_PUSH_LOGGED` with the `CI` / `GITHUB_ACTIONS` scrub. Re-run here: `BKIT_PRE_PUSH_LOGGED=1 pnpm exec vitest run -c vitest.unit.config.ts .../tips/catalogue.test.ts .../after/index.test.ts` gives 118 passed, and `BKIT_PRE_PUSH_LOGGED=1 pnpm exec vitest run .../install/install.integration.test.ts` gives 62 passed.
- TASK 7 satisfied: both hook copies use `[[:space:]]*[=:]` after the key group (POSIX BRE, no `\|`). Checked by hand: the extractor returns `A_KEY` (`A_KEY = spaced`), `B_KEY` (`B_KEY: colon`), `C_KEY` (`export C_KEY=x`) and `D_KEY`, and skips a `#` comment line. The `templates.md` sentence still matches ("every key `.bkit/.env` names").
- TASK 8 partly done: both hook copies unset the nine-key fixed list, which matches `docs/security.md` § `.bkit/.env` scope line 78 exactly, before and regardless of the `.bkit/.env` loop, and the tip `why` is accurate. The `templates.md:293` sentence is the gap (see log).
- The three `TEST FIRST` tests exist in `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` and pass (3 passed, re-run here). Derived Test Matrix rows 6, 7 and 8 map to those tests. The test-first audit (`build-tests-green-3-1.md`): `Enforced: true`, 0 gaps, 0 unproven; no updated or already-landed tests.
- `build-decision-1-1.md` (Q1 and Q2 `Fix now`) covers the group 2 tasks and accepts no group 3 gap.
- Advisory, not a gap: `node dist/cli.js check` reports DRIFT on `.bkit/templates.md`. The rendered copy still has the pre-group-3 sentence, because `.bkit/core/.bkit/templates.md` changed without a `bkit upgrade`. Per `.agents/rules.md` § Install to mirror, that runs once at the end of the session. Push stays blocked until it runs, because pre-push runs `bkit check` first.
- Out of scope, proposed separately: the hook header comment at `.husky/pre-push:29` (and the template copy) still says only "The keys in `.bkit/.env` are unset for the gate". It leaves out the fixed list Task 8 added. No task's `DONE WHEN` names that comment.

## Identified Gaps Log

1 gap.

TASK 8: `.bkit/core/.bkit/templates.md:293` does not promise exactly what the hook does — the sentence puts "the gate unsets the bkit tooling keys (...) however they were loaded" under "When the repo has an `.envrc`, `direnv` is on `PATH` and `CI` is unset", but the hook's fixed-list unset (`.husky/pre-push:61-65`, `.bkit/templates/.husky/pre-push:61-65`) runs in the inner run on every path, including the no-direnv cloud path this task exists for; split the unset into its own sentence that holds whether or not direnv runs — Fixable: true
