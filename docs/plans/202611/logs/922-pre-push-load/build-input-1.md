## Session Prompt — this run's, newer than everything below

#922

## Issue description — oldest

### Narrative

If the shell running `git push` hasn't loaded the repo's `.envrc`, the pre-push hook still runs the whole gate. It only fails when it reaches the unit tests, around 10 minutes in, on tests that read variables the shell never had.

That's easy to hit. direnv (the tool that loads `.envrc` when you enter a folder) only loads it when an interactive shell shows its prompt. An agent's shell usually never does. So a folder can be trusted and still push with an empty environment.

Seen in app-gether-life on 2026-11-11: two pushes in a row failed with 26 unit tests in `@app-gether-life/services` red on missing variables (`RESEND_API_KEY` and others). Nothing in the change touched that package. The worktree's `.envrc` was trusted (`direnv status` → allowed). The variables just weren't in the shell. Running that package's tests with `env -i` gives the same 26 failures, so the cause is the environment and not the change.

Why the current checks miss it:

- `bkit check`, the first thing the hook runs, has `detectDirenvNotAllowed` (`.bkit/core/engine/checks/after/index.ts:509`), but it is advisory: it prints a warning and the push goes on. It also only asks "is this folder trusted?", never "are the variables in this shell?".
- `bkit worktrees setup` runs `direnv allow` on a new worktree. That's still only trust. It doesn't load anything into the shell that pushes later.

The change: the hook already runs itself once more so it can copy its output to `tmp/pre-push.log` (`BKIT_PRE_PUSH_LOGGED=1 FORCE_COLOR=1 sh "$0" "$@"`). That inner run goes through `direnv exec .` instead, so the hook always runs with the repo's environment, whatever shell called it. An untrusted folder blocks in the first second instead of failing ten minutes later. The hook is a copy each repo owns (`bkit install` never writes it), so a `bkit tips` entry tells repos with an older copy to paste the new block in.

### Success Criteria

- A push from a shell with none of the `.envrc` variables, in a trusted folder, runs the full gate with those variables loaded.
- A push from an untrusted folder stops before `bkit check` with the instruction `direnv allow .`, in well under 5 seconds, and runs no gate.
- A push with no `.envrc`, with no `direnv` on `PATH`, or with `CI` set behaves exactly as it does today.
- Git's ref list on stdin reaches the inner run unchanged, so the delete-only and min-push checks still see it.
- `bkit tips` names the block to paste for a repo whose `.husky/pre-push` predates it and that has an `.envrc`.

### Edge Cases

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| `.envrc` present, `direnv` installed, folder trusted | inner run is `direnv exec . sh "$0" "$@"`; the `.envrc`'s own `unset` lines apply as on `cd` |
| `.envrc` present, `direnv` installed, folder not trusted or denied | blocked before the inner run; message names `direnv allow .` and "push again"; exit 1; written to `tmp/pre-push.log` like every other run |
| shell already has the `.envrc` loaded (interactive) | still runs through `direnv exec`; the result is the same environment |
| no `.envrc` | unchanged, no `direnv` call |
| `direnv` not on `PATH` | unchanged, no warning |
| `CI` set (any non-empty value) | unchanged, no `direnv` call, even if `direnv` is installed |
| `.envrc` fails while loading (a syntax error) | the trust probe fails, so the push blocks with direnv's own error shown above the `direnv allow .` hint |
| delete-only push under `direnv exec` | still exits 0 with no gate |

### Derived Test Matrix

<!-- prettier-ignore -->
| Test description | Type | Target file |
| --- | --- | --- |
| trusted `.envrc`, variable missing from the shell → the gate sees the variable | integration | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` |
| untrusted `.envrc` → exit 1, stderr names `direnv allow .`, no `bkit check` or gate call | integration | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` |
| no `.envrc` → no `direnv` call, gates run | integration | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` |
| `direnv` not on `PATH` → gates run, no warning | integration | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` |
| `CI` set → no `direnv` call, gates run | integration | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` |
| delete-only push through `direnv exec` → exit 0, no gate | integration | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` |
| tip fires for a hook without `direnv exec` when `.envrc` exists; not when the hook has it; not without `.envrc` | unit | `.bkit/core/engine/checks/tips/catalogue.test.ts` |

### Tasks

<!-- bkit:group 1 start -->
### TASK GROUP 1: The pre-push hook loads the repo environment itself
<!-- bkit:task 1 start -->
- [ ] **TASK 1:** Run the hook's inner, logged run through `direnv exec .`, and block an untrusted folder before it
  - **UPDATE:** `.bkit/templates/.husky/pre-push`: the log block (`BKIT_PRE_PUSH_LOGGED`): when `.envrc` exists, `direnv` is on `PATH` and `CI` is empty, probe trust with `direnv exec . true`; probe fails → print the `direnv allow .` fix and exit 1 inside the logged group; probe passes → start the inner run as `BKIT_PRE_PUSH_LOGGED=1 FORCE_COLOR=1 direnv exec . sh "$0" "$@"`; otherwise keep `sh "$0" "$@"`; update the block's comment to say so
  - **UPDATE:** `.husky/pre-push`: the same change in bkit's own copy (its log block sits in the `bkit-only` region `set -e` → `# ── delete-only push` of `.bkit/core/engine/audits/repo/dogfood-templates.test.ts`, so it is edited by hand, not copied)
  - **READ:** `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts`: the `.husky/pre-push log` suite's stub `pnpm` and `PATH` setup, to add a stub `direnv`
  - **DONE WHEN:** every row of the Derived Test Matrix in `husky-pre-push.integration.test.ts` passes for both `.bkit/templates/.husky/pre-push` and `.husky/pre-push`, and the existing suites in that file still pass
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` `trusted .envrc → the gate sees its variables` fails on the gate running without the variable
    - `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` `untrusted .envrc → blocked before bkit check, names direnv allow` fails on `bkit check` and the gate running
    - `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` `no .envrc → no direnv call` fails on a `direnv` call being recorded
    - `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` `direnv not on PATH → gates run, no warning` fails on a warning or a missing gate
    - `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` `CI set → no direnv call` fails on a `direnv` call being recorded
    - `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` `delete-only push through direnv exec → exit 0, no gate` fails on a gate run or a non-zero exit
<!-- bkit:task 1 end -->
<!-- bkit:task 2 start -->
- [ ] **TASK 2:** Add a `bkit tips` entry for repos whose hook copy predates the direnv block
  - **UPDATE:** `.bkit/core/engine/checks/tips/catalogue.ts`: a `pre-push-direnv` tip next to `min-push`, firing when `.husky/pre-push` and `.envrc` exist and the hook does not contain `direnv exec`; its `ask` names the log block of `.bkit/templates/.husky/pre-push` to paste over the copy's own
  - **DEPENDS ON:** 1
  - **DONE WHEN:** the tip fires and stays quiet exactly as the Derived Test Matrix row says, and bkit's own repo does not fire it
  - **TEST FIRST:**
    - `.bkit/core/engine/checks/tips/catalogue.test.ts` `pre-push-direnv fires only for a hook without direnv exec in a repo with .envrc` fails on the tip not existing
<!-- bkit:task 2 end -->
<!-- bkit:task 3 start -->
- [ ] **TASK 3:** Document the hook's direnv behaviour
  - **UPDATE:** `.bkit/core/.bkit/templates.md`: § Git hooks — Husky: the inner run loads `.envrc` through `direnv exec` and an untrusted folder blocks in seconds; § direnv — `.envrc`: the hook loads it on push, so an agent's shell that never loaded it still pushes with it
  - **DEPENDS ON:** 1
  - **DONE WHEN:** both sections describe the behaviour Task 1 ships, and `bkit install` regenerates `.bkit/templates.md` with the same text
  - **TEST FIRST:** n/a — docs
<!-- bkit:task 3 end -->
<!-- bkit:group 1 end -->

### Open Questions & Assumptions

- Assumption: a cloud session without `direnv` installed is covered by the "no `direnv`" row and behaves as today. A cloud session that has `direnv` installed behaves like a local one.
- Assumption: `direnv exec . true` is a fast enough trust probe. It evaluates `.envrc` once, which the inner run then does again; both together stay well under the 5-second budget.
- Decided: `detectDirenvNotAllowed` stays advisory. `bkit check` also runs outside a push, and the hook's own probe now covers the push path.

### Out of Scope

- Unit tests that read real secrets from the shell. Those are each repo's own problem (gether-life/app-gether-life#1630).
- Rewriting copies of the hook in other repos. The hook is copy-and-own, and the Task 2 tip is how those repos find out.
- The pre-push check for a PR that conflicts with its base: #923 — Pre-push: block in seconds when the PR conflicts.

### References

- `.bkit/templates/.husky/pre-push` (the log block, `BKIT_PRE_PUSH_LOGGED`)
- `.bkit/core/.bkit/templates.md` § Git hooks — Husky, § direnv — `.envrc`
- `.bkit/core/engine/checks/tips/catalogue.ts` (`min-push` tip as the pattern)
- gether-life/app-gether-life#1630 — the repo-side half

## Issue comment — posted 2026-11-11T01:48:35.000Z

The repo-side half is filed as gether-life/app-gether-life#1630: unit tests in `api`, `services` and `observability` that only pass with the real environment loaded. visitfrasercoast-com was checked the same way and isn't affected.

## Issue comment — posted 2026-11-11T01:57:53.000Z

The other half of the same problem, a gate that only fails late, is now #923: the hook runs the whole gate on a branch whose open PR conflicts with its base, so CI never starts. Seen on the same day, on the same PR (gether-life/app-gether-life#1612).

## Issue comment — posted 2026-11-11T03:44:28.000Z

Body rewritten into the change shape (`.bkit/trackers.md` § Issue shapes) with a three-task group, so `/bkit-build #922` can start straight from the issue. Label set to `next:build`. Two additions to the original proposal: a `bkit tips` entry, because the hook is a copy each repo owns and `bkit install` never updates it, and the decision to keep `detectDirenvNotAllowed` advisory. #923 — Pre-push: block in seconds when the PR conflicts (https://github.com/cbartens/bkit/issues/923) is now blocked by this one, because both change the same hook and test file.
