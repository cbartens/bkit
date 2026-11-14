# Brief: group 1 — The pre-push hook blocks a PR that no longer merges (tests)

Plan: Pre-push blocks a PR that no longer merges Implementation Plan

## Why and what

### Context & Goals

The pre-push hook runs the whole gate even when the branch's open PR conflicts with its base, so CI never starts. Add one open-PR lookup for feature-branch pushes and a fast trial-merge check before `bkit check`, plus a `bkit tips` entry for repos with an older hook copy (#923).

### Derived Test Matrix

`Type` is a tier from `docs/testing.md`. `Task` is the one runbook task that lands the row's test.

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| open PR whose base conflicts → exit 1, stderr names the file, no `bkit check` or gate call | Integration | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` | 1 |
| open PR that merges cleanly → gates run, no message | Integration | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` | 1 |
| no open PR → no fetch, gates run, no warning | Integration | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` | 1 |
| `gh` not on `PATH` → warns, gates run | Integration | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` | 1 |
| base fetch fails → warns, gates run | Integration | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` | 1 |
| dev push → no PR lookup, gates run | Integration | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` | 1 |
| min push of a conflicting PR → blocked | Integration | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` | 1 |
| tip fires for a hook without `merge-tree`; not for one with it; not without a hook | Unit | `.bkit/core/engine/checks/tips/catalogue.test.ts` | 2 |

## Where it fits

- Group 1: The pre-push hook blocks a PR that no longer merges — this group
  - TASK 1: One open-PR lookup for feature branches, and a trial-merge check before `bkit check` — open
  - TASK 2: Add a `bkit tips` entry for repos whose hook copy predates the conflict check — open
  - TASK 3: Document the conflict check — done

## The work

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** One open-PR lookup for feature branches, and a trial-merge check before `bkit check`
  - **UPDATE:** `.bkit/templates/.husky/pre-push`: move the `gh pr list --head "$BRANCH" --state open` call out of the CI-suppressor guard into one lookup that runs on every non-dev / main branch when `gh` is on `PATH`, returning the number and `baseRefName`; the guard reads the number from it
  - **UPDATE:** `.bkit/templates/.husky/pre-push`: a `PR conflict` block in the fast-checks section, before `pnpm bkit check`: open PR with a base and `PUSH_BRANCH_SHA` set → `git fetch --quiet origin "<base>"`, then `git merge-tree --write-tree --name-only "refs/remotes/origin/<base>" "$PUSH_BRANCH_SHA"`; exit 1 → BLOCKED with the conflicting files and the fix, exit 1; fetch failure or any other exit → WARN and continue; every git and gh call reads from `/dev/null`
  - **UPDATE:** `.husky/pre-push`: the same two changes in bkit's own copy (the guard and fast checks sit outside its `bkit-only` regions in `.bkit/core/engine/audits/repo/dogfood-templates.test.ts`, so the copy must match the template there)
  - **UPDATE:** `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts`: add the conflict-check tests below
  - **READ:** `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts`: the CI-suppressor suite's stub `gh` (prints `7` for any call), which the new lookup must still parse as "PR 7, no base"
  - **READ:** `docs/testing.md`: the integration tier the tests follow
  - **READ:** `docs/deployments.md`: pre-push and CI behaviour
  - **DONE WHEN:** every integration row of the Derived Test Matrix passes for both `.bkit/templates/.husky/pre-push` and `.husky/pre-push`, the existing CI-suppressor and graphify suites still pass, and `dogfood-templates.test.ts` passes
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` `open PR whose base conflicts → blocked before bkit check, names the file` fails on `bkit check` and the gate running
    - `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` `open PR that merges cleanly → gates run, no message` fails on a block or a message
    - `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` `no open PR → no fetch, gates run` fails on a recorded fetch or a warning
    - `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` `gh not on PATH → warns, gates run` fails on a missing warning or a block
    - `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` `base fetch fails → warns, gates run` fails on a block
    - `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` `dev push → no PR lookup` fails on a recorded `gh` call
    - `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` `min push of a conflicting PR → blocked` fails on the min gate running

<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->

- [ ] **TASK 2:** Add a `bkit tips` entry for repos whose hook copy predates the conflict check
  - **UPDATE:** `.bkit/core/engine/checks/tips/catalogue.ts`: a `pre-push-pr-conflict` tip next to `min-push`, firing when `.husky/pre-push` exists and does not contain `merge-tree`; its `ask` names the shared PR lookup and the `PR conflict` block of `.bkit/templates/.husky/pre-push` to paste
  - **UPDATE:** `.bkit/core/engine/checks/tips/catalogue.test.ts`: add the tip test below
  - **DEPENDS ON:** 1
  - **DONE WHEN:** the tip fires and stays quiet exactly as the Derived Test Matrix row says, and bkit's own repo does not fire it
  - **TEST FIRST:**
    - `.bkit/core/engine/checks/tips/catalogue.test.ts` `pre-push-pr-conflict fires only for a hook without merge-tree` fails on the tip not existing

<!-- bkit:task 2 end -->

### Derived Test Matrix rows

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| open PR whose base conflicts → exit 1, stderr names the file, no `bkit check` or gate call | Integration | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` | 1 |
| open PR that merges cleanly → gates run, no message | Integration | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` | 1 |
| no open PR → no fetch, gates run, no warning | Integration | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` | 1 |
| `gh` not on `PATH` → warns, gates run | Integration | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` | 1 |
| base fetch fails → warns, gates run | Integration | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` | 1 |
| dev push → no PR lookup, gates run | Integration | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` | 1 |
| min push of a conflicting PR → blocked | Integration | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` | 1 |
| tip fires for a hook without `merge-tree`; not for one with it; not without a hook | Unit | `.bkit/core/engine/checks/tips/catalogue.test.ts` | 2 |
