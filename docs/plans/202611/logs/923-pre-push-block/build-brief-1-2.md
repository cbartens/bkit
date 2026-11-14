# Brief: group 1 — The pre-push hook blocks a PR that no longer merges

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
| `gh` not on `PATH` → warns, gates run, for both hook copies | Integration | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` | 4 |

## Where it fits

- Group 1: The pre-push hook blocks a PR that no longer merges — this group
  - TASK 1: One open-PR lookup for feature branches, and a trial-merge check before `bkit check` — done
  - TASK 2: Add a `bkit tips` entry for repos whose hook copy predates the conflict check — done
  - TASK 3: Document the conflict check — done
  - TASK 4: Make the no-`gh` test's `PATH` helper safe to call once per hook copy — open

## The work

<!-- bkit:task 4 start -->

- [ ] **TASK 4:** Make the no-`gh` test's `PATH` helper safe to call once per hook copy
  - **UPDATE:** `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts`: `pathWithoutGh()` creates its `sysbin` folder with `fs.mkdirSync` on every call, so the `HOOKS` loop of `gh not on PATH → warns, gates run` throws `EEXIST` on the second hook copy; make the helper idempotent (create the folder recursively and skip links that already exist) so both `.bkit/templates/.husky/pre-push` and `.husky/pre-push` reach their assertions
  - **READ:** `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts`: `pathWithoutGh()` and the `gh not on PATH → warns, gates run` test
  - **DEPENDS ON:** 1
  - **DONE WHEN:** `gh not on PATH → warns, gates run` passes for both hook copies, and the other `PR conflict` tests still pass
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` `gh not on PATH → warns, gates run for both hook copies` fails on `EEXIST` from a second `pathWithoutGh()` call

<!-- bkit:task 4 end -->
