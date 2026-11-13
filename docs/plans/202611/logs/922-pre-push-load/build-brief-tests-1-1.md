# Brief: group 1 — The pre-push hook loads the repo environment itself (tests)

Plan: Pre-push: load the repo environment Implementation Plan

## Why and what

### Context & Goals

The pre-push hook's inner, logged run goes through `direnv exec .`, so the gate always runs with the repo's `.envrc` variables, and an untrusted folder blocks in seconds with `direnv allow .`. A `bkit tips` entry tells repos with an older hook copy to paste the new block.

## Where it fits

- Group 1: The pre-push hook loads the repo environment itself — this group
  - TASK 1: Run the hook's inner, logged run through `direnv exec .`, and block an untrusted folder before it — open
  - TASK 2: Add a `bkit tips` entry for repos whose hook copy predates the direnv block — open
  - TASK 3: Document the hook's direnv behaviour — done

## The work

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** Run the hook's inner, logged run through `direnv exec .`, and block an untrusted folder before it
  - **UPDATE:** `.bkit/templates/.husky/pre-push`: the log block (`BKIT_PRE_PUSH_LOGGED`): when `.envrc` exists, `direnv` is on `PATH` and `CI` is empty, probe trust with `direnv exec . true`; probe fails → print the `direnv allow .` fix and exit 1 inside the logged group; probe passes → start the inner run as `BKIT_PRE_PUSH_LOGGED=1 FORCE_COLOR=1 direnv exec . sh "$0" "$@"`; otherwise keep `sh "$0" "$@"`; update the block's comment to say so
  - **UPDATE:** `.husky/pre-push`: the same change in bkit's own copy (its log block sits in the `bkit-only` region, so it is edited by hand)
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

### Derived Test Matrix rows

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| trusted `.envrc`, variable missing from the shell → the gate sees the variable | integration | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` | 1 |
| untrusted `.envrc` → exit 1, stderr names `direnv allow .`, no `bkit check` or gate call | integration | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` | 1 |
| no `.envrc` → no `direnv` call, gates run | integration | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` | 1 |
| `direnv` not on `PATH` → gates run, no warning | integration | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` | 1 |
| `CI` set → no `direnv` call, gates run | integration | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` | 1 |
| delete-only push through `direnv exec` → exit 0, no gate | integration | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` | 1 |
| tip fires for a hook without `direnv exec` when `.envrc` exists; not when the hook has it; not without `.envrc` | unit | `.bkit/core/engine/checks/tips/catalogue.test.ts` | 2 |
