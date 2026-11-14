## Session Prompt — this run's, newer than everything below

/bkit-build #923

## Issue description — oldest

### Narrative

If a branch's open PR conflicts with its base, the pre-push hook still runs the whole gate. The gate passes, the push goes out, and then CI never starts, because GitHub doesn't run `pull_request` checks on a PR that can't merge. You find out after the gate (about 8 minutes in app-gether-life), and then you have to merge the base and run the whole gate again.

Seen in app-gether-life on 2026-11-11, on gether-life/app-gether-life#1612. The gate passed at `5275fd4a6` and the push went out, but no checks started. dev had moved one commit ahead (`674e37077`), and the only clash was `.bkit/friction.jsonl`, where both sides had added rows. After the merge, the next push ran the full gate again.

Why the current checks miss it: the hook already asks whether the branch has an open PR (`gh pr list --head "$BRANCH"`, for the CI-suppressor guard), but only when HEAD carries a `[skip ci]`-class token, and it never asks whether that PR still merges. None of the fast checks that run before the gate read the base branch.

The change: one PR lookup for every feature-branch push, returning the PR number and its base. The CI-suppressor guard reuses the number. A new fast check before `bkit check` fetches the base (about 1s) and does a trial merge in memory with `git merge-tree --write-tree --name-only`, which touches no files (0.01s on app-gether-life). A conflict blocks the push and names the files. The hook is a copy each repo owns, so a `bkit tips` entry tells repos with an older copy to paste the new block in.

###### bkit:blocked-by start
- #922
###### bkit:blocked-by end

### Success Criteria

- A push of a branch whose open PR conflicts with its base stops in under 5 seconds, before `bkit check` and the gate, and names each conflicting file and the fix (merge the base, resolve, push again).
- A branch that merges cleanly, a branch with no open PR, and a dev / main push behave as they do today.
- A min push runs the check too, since a conflicting PR gets no CI there either.
- Missing evidence never blocks: no `gh`, a failed fetch, or a `git` without `merge-tree --write-tree` warns and lets the push go on.
- `bkit tips` names the block to paste for a repo whose `.husky/pre-push` predates it.

### Edge Cases

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| feature branch, open PR, trial merge with `origin/<base>` conflicts | exit 1 before `bkit check`; stderr lists the conflicting files and the fix |
| feature branch, open PR, merges cleanly | no message; gates run |
| feature branch, no open PR | no fetch, no message; gates run |
| dev or main | no PR lookup, no fetch; unchanged |
| `gh` not on `PATH` | warns that the conflict check was skipped; gates run; the CI-suppressor guard keeps its own `gh`-missing warning |
| `gh` answers but gives no base (unauthenticated, odd output) | treated as "no open PR"; gates run |
| `git fetch origin <base>` fails (offline) | warns that the conflict check was skipped; gates run |
| `git merge-tree --write-tree` unsupported (git older than 2.38) or exits other than 0 / 1 | warns; gates run |
| the push does not update the current branch (`PUSH_BRANCH_SHA` empty) | no check: the branch's PR is not what is being pushed |
| min push of a branch whose PR conflicts | blocked, same as a full push |
| HEAD carries `[skip ci]` with an open PR | the CI-suppressor guard reads the PR number from the shared lookup and behaves as today |

### Derived Test Matrix

<!-- prettier-ignore -->
| Test description | Type | Target file |
| --- | --- | --- |
| open PR whose base conflicts → exit 1, stderr names the file, no `bkit check` or gate call | integration | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` |
| open PR that merges cleanly → gates run, no message | integration | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` |
| no open PR → no fetch, gates run, no warning | integration | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` |
| `gh` not on `PATH` → warns, gates run | integration | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` |
| base fetch fails → warns, gates run | integration | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` |
| dev push → no PR lookup, gates run | integration | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` |
| min push of a conflicting PR → blocked | integration | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` |
| tip fires for a hook without `merge-tree`; not for one with it; not without a hook | unit | `.bkit/core/engine/checks/tips/catalogue.test.ts` |

### Tasks

<!-- bkit:group 1 start -->
### TASK GROUP 1: The pre-push hook blocks a PR that no longer merges
<!-- bkit:task 1 start -->
- [ ] **TASK 1:** One open-PR lookup for feature branches, and a trial-merge check before `bkit check`
  - **UPDATE:** `.bkit/templates/.husky/pre-push`: move the `gh pr list --head "$BRANCH" --state open` call out of the CI-suppressor guard into one lookup that runs on every non-dev / main branch when `gh` is on `PATH`, returning the number and `baseRefName`; the guard reads the number from it
  - **UPDATE:** `.bkit/templates/.husky/pre-push`: a `PR conflict` block in the fast-checks section, before `pnpm bkit check`: open PR with a base and `PUSH_BRANCH_SHA` set → `git fetch --quiet origin "<base>"`, then `git merge-tree --write-tree --name-only "refs/remotes/origin/<base>" "$PUSH_BRANCH_SHA"`; exit 1 → BLOCKED with the conflicting files and the fix, exit 1; fetch failure or any other exit → WARN and continue; every git and gh call reads from `/dev/null`
  - **UPDATE:** `.husky/pre-push`: the same two changes in bkit's own copy (the guard and fast checks sit outside its `bkit-only` regions in `.bkit/core/engine/audits/repo/dogfood-templates.test.ts`, so the copy must match the template there)
  - **READ:** `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts`: the CI-suppressor suite's stub `gh` (prints `7` for any call), which the new lookup must still parse as "PR 7, no base"
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
  - **DEPENDS ON:** 1
  - **DONE WHEN:** the tip fires and stays quiet exactly as the Derived Test Matrix row says, and bkit's own repo does not fire it
  - **TEST FIRST:**
    - `.bkit/core/engine/checks/tips/catalogue.test.ts` `pre-push-pr-conflict fires only for a hook without merge-tree` fails on the tip not existing
<!-- bkit:task 2 end -->
<!-- bkit:task 3 start -->
- [ ] **TASK 3:** Document the conflict check
  - **UPDATE:** `.bkit/core/.bkit/templates.md`: § Git hooks — Husky: list the PR-conflict check among the fast checks that run before the gate, with what blocks and what only warns
  - **DEPENDS ON:** 1
  - **DONE WHEN:** the section describes the behaviour Task 1 ships, and `bkit install` regenerates `.bkit/templates.md` with the same text
  - **TEST FIRST:** n/a — docs
<!-- bkit:task 3 end -->
<!-- bkit:group 1 end -->

### Open Questions & Assumptions

- Assumption: one `gh pr list` call on every feature-branch push (about 1s) is acceptable. Today it runs only when HEAD carries a skip token.
- Assumption: the base is fetched from `origin`, as every other check in the hook assumes.
- Decided: blocked by #922 because both edit the same hook and the same test file; building them one after the other avoids a merge conflict between the two branches.

### Out of Scope

- Resolving the conflict for the user. The hook names the files and the fix only.
- Running the check on dev / main, which have no PR.
- The direnv half of the same "the gate fails late" problem: #922 — Pre-push: load direnv itself; block in seconds if untrusted.

### References

- `.bkit/templates/.husky/pre-push` (CI-suppressor HEAD guard; fast checks before the gates)
- `.bkit/core/.bkit/templates.md` § Git hooks — Husky
- `.bkit/core/engine/checks/tips/catalogue.ts` (`min-push` tip as the pattern)
- gether-life/app-gether-life#1612 — the PR where this was seen

## Issue comment — posted 2026-11-11T03:44:30.000Z

Body rewritten into the change shape (`.bkit/trackers.md` § Issue shapes) with a three-task group. Label set to `next:build`. Two additions to the original proposal: one shared open-PR lookup that the CI-suppressor guard reuses, and a `bkit tips` entry for repos with an older copy of the hook. Blocked by #922 — Pre-push: load direnv itself; block in seconds if untrusted (https://github.com/cbartens/bkit/issues/922), because both change the same hook and test file. Build this one after #922 ships.
