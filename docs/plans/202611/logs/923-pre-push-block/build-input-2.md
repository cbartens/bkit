## Session Prompt — this run's, newer than everything below

#923

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

## Plan — docs/plans/202611/923-pre-push-block-plan.md — last committed 2026-11-14T05:07:01.000Z

# Pre-push blocks a PR that no longer merges Implementation Plan

## Context & Goals

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
| BKIT_PR_CONFLICT_CHECK=false on a conflicting PR → no fetch, off line, gates run | Integration | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` | 5 |
| ship switches the PR conflict check off for its pushes before Step 4, and only those | Unit | `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` | 5 |
| open PR whose only conflict is a merge=union ledger → blocked | Integration | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` | 6 |
| single-branch fetch refspec → checks the fetched base, no false block | Integration | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` | 7 |
| pre-push-pr-conflict fires for a hook with merge-tree but no PUSH_BRANCH_SHA | Unit | `.bkit/core/engine/checks/tips/catalogue.test.ts` | 8 |
| fork PR with the same head branch name → ignored, gates run | Integration | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` | 9 |

## Documentation Consultation

<!-- prettier-ignore -->
| Topic | Recommended path | Applies | Source used (path and section) | Coverage | Gap and action |
| --- | --- | --- | --- | --- | --- |
| architecture | `docs/architecture.md` | no — a hook-script change; no topology change | none | none | None |
| technology | `docs/technology.md` | no — no new dependency; uses git and gh already in the hook | none | none | None |
| security | `docs/security.md` | no — no credential or permission change | none | none | None |
| testing | `docs/testing.md` | yes | `docs/testing.md` (integration and unit tiers) | covered | None |
| deployments | `docs/deployments.md` | yes — pre-push and CI behaviour | `docs/deployments.md` | covered | None |

## Documentation Warnings

None

## Reuse Inventory

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| One shared open-PR lookup and the trial-merge check | `.bkit/templates/.husky/pre-push` | `grep -n "gh pr list" .bkit/templates/.husky/pre-push`, `.husky/pre-push` | the CI-suppressor guard's `gh pr list --head` call | EXTEND | Hoist the call into a shared lookup; add the `PR conflict` fast check |
| Same changes in bkit's own hook copy | `.husky/pre-push` | `grep -n "gh pr list" .husky/pre-push`, `dogfood-templates.test.ts` | the existing copy | EXTEND | The copy must match the template outside `bkit-only` regions |
| Tip for older hook copies | `.bkit/core/engine/checks/tips/catalogue.ts` | `grep -n "min-push" .bkit/core/engine/checks/tips/catalogue.ts` | the `min-push` tip | EXTEND | Add a sibling tip |
| Documentation of the check | `.bkit/core/.bkit/templates.md` | `grep -n "Husky" .bkit/core/.bkit/templates.md` | § Git hooks — Husky | EXTEND | Add the check to the fast-checks list |

## Agent Execution Runbook

<!-- bkit:group 1 start -->

### TASK GROUP 1: The pre-push hook blocks a PR that no longer merges

<!-- bkit:task 1 start -->

- [x] **TASK 1:** One open-PR lookup for feature branches, and a trial-merge check before `bkit check`
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

- [x] **TASK 2:** Add a `bkit tips` entry for repos whose hook copy predates the conflict check
  - **UPDATE:** `.bkit/core/engine/checks/tips/catalogue.ts`: a `pre-push-pr-conflict` tip next to `min-push`, firing when `.husky/pre-push` exists and does not contain `merge-tree`; its `ask` names the shared PR lookup and the `PR conflict` block of `.bkit/templates/.husky/pre-push` to paste
  - **UPDATE:** `.bkit/core/engine/checks/tips/catalogue.test.ts`: add the tip test below
  - **DEPENDS ON:** 1
  - **DONE WHEN:** the tip fires and stays quiet exactly as the Derived Test Matrix row says, and bkit's own repo does not fire it
  - **TEST FIRST:**
    - `.bkit/core/engine/checks/tips/catalogue.test.ts` `pre-push-pr-conflict fires only for a hook without merge-tree` fails on the tip not existing

<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->

- [x] **TASK 3:** Document the conflict check
  - **UPDATE:** `.bkit/core/.bkit/templates.md`: § Git hooks — Husky: list the PR-conflict check among the fast checks that run before the gate, with what blocks and what only warns
  - **DEPENDS ON:** 1
  - **DONE WHEN:** the section describes the behaviour Task 1 ships, and `bkit install` regenerates `.bkit/templates.md` with the same text
  - **TEST FIRST:** n/a — docs

<!-- bkit:task 3 end -->

<!-- bkit:task 4 start -->

- [x] **TASK 4:** Make the no-`gh` test's `PATH` helper safe to call once per hook copy
  - **UPDATE:** `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts`: `pathWithoutGh()` creates its `sysbin` folder with `fs.mkdirSync` on every call, so the `HOOKS` loop of `gh not on PATH → warns, gates run` throws `EEXIST` on the second hook copy; make the helper idempotent (create the folder recursively and skip links that already exist) so both `.bkit/templates/.husky/pre-push` and `.husky/pre-push` reach their assertions
  - **READ:** `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts`: `pathWithoutGh()` and the `gh not on PATH → warns, gates run` test
  - **DEPENDS ON:** 1
  - **DONE WHEN:** `gh not on PATH → warns, gates run` passes for both hook copies, and the other `PR conflict` tests still pass
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` `gh not on PATH → warns, gates run for both hook copies` fails on `EEXIST` from a second `pathWithoutGh()` call

<!-- bkit:task 4 end -->
<!-- bkit:group 1 end -->

<!-- bkit:group 2 start -->

### TASK GROUP 2: Challenge round 1 findings

<!-- bkit:task 5 start -->

- [x] **TASK 5:** `/bkit-ship` on a branch whose open PR conflicts with dev dies at its Step 2 / Step 3 publish push, so it never reaches the Step 4 merge that would fix the conflict
      **Severity:** HIGH · **Class:** architectural · **Fixable:** false · **Location:** `.bkit/templates/.husky/pre-push:240` · **Round:** 1
  - **DONE WHEN:** Owner direction (decision 2): an on/off switch. Both `.bkit/templates/.husky/pre-push` and `.husky/pre-push` skip the whole `PR conflict` block (no fetch, no `git merge-tree`) when `BKIT_PR_CONFLICT_CHECK=false`, and print one line `[pre-push] PR conflict check off (BKIT_PR_CONFLICT_CHECK=false).` to stderr; unset or any other value runs the check as today. The open-PR lookup and the CI-suppressor guard are unchanged. `.bkit/core/workflows/bkit-ship.md` puts `BKIT_PR_CONFLICT_CHECK=false` in front of the three `branches push` calls that run before Step 4 `Integrate` (Step 2 publish after reconcile, Step 2 publish before `prs open`, Step 3 publish), and never on the Step 4 sub-step 3 push of the merged branch or any later push, so the merged head is checked normally. `.bkit/core/.bkit/templates.md` § Git hooks — Husky names the switch and why ship sets it, and `bkit install` regenerates `.bkit/templates.md` and the ship mirrors with the same text. Git passes the variable from `branches push` to the hook, so no engine change is needed.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` `BKIT_PR_CONFLICT_CHECK=false on a conflicting PR → no fetch, off line, gates run` fails on exit 1 with `BLOCKED` and no off line, for both hook copies
    - `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` `ship switches the PR conflict check off for its pushes before Step 4, and only those` fails on the Step 2 and Step 3 `branches push` lines lacking `BKIT_PR_CONFLICT_CHECK=false`

<!-- bkit:task 5 end -->
<!-- bkit:task 6 start -->

- [x] **TASK 6:** A PR that conflicts on GitHub only in a `merge=union` ledger (`docs/knowledge.jsonl`, `.bkit/stats.jsonl`, `status.jsonl` ...) passes the check, because `git merge-tree` applies the work tree's `.gitattributes` union driver and GitHub does not, so CI still never starts
      **Severity:** HIGH · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/templates/.husky/pre-push:235` · **Round:** 1
  - **DONE WHEN:** Both hook copies run the trial merge with no attributes (for example `git --attr-source="$(git hash-object -t tree /dev/null)" merge-tree ...` or `GIT_ATTR_SOURCE` set to the empty tree), so a union-only conflict exits 1 and blocks exactly as GitHub reports it; a git too old for `--attr-source` lands on the existing WARN path. Verified by hand on git 2.56.0: with `*.jsonl merge=union`, both sides appending to `a.jsonl` gives `merge-tree` exit 0; with the empty-tree attribute source it gives exit 1 and names `a.jsonl`. The fixture in `setup()` has no `.gitattributes`, so no current test sees this.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` `open PR whose only conflict is a merge=union ledger → blocked` fails on exit 0 and the gate running, for both hook copies

<!-- bkit:task 6 end -->
<!-- bkit:task 7 start -->

- [x] **TASK 7:** In a single-branch clone (fetch refspec covers only the branch, common for cloud agents), `git fetch origin dev` succeeds without creating `refs/remotes/origin/dev`, `git merge-tree` exits 1 with "not something we can merge", and the hook BLOCKS the push with an empty conflicting-files list
      **Severity:** HIGH · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/templates/.husky/pre-push:233` · **Round:** 1
  - **DONE WHEN:** Both hook copies fetch with an explicit refspec (`git fetch --quiet origin "+refs/heads/$PR_BASE:refs/remotes/origin/$PR_BASE"`) or merge against `FETCH_HEAD`, and they treat exit 1 as a conflict only when the first output line is a tree OID; a base ref that cannot be resolved lands on the WARN path, as `.bkit/core/.bkit/templates.md` § Git hooks already promises ("`git merge-tree` fails for another reason → the hook warns"). The same refspec gap also lets a stale `origin/<base>` decide the result. Verified by hand on git 2.56.0: `git clone --single-branch --branch feat` → `git fetch --quiet origin dev` exit 0 → `rev-parse refs/remotes/origin/dev` fails → `merge-tree` exit 1.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` `single-branch fetch refspec → checks the fetched base, no false block` fails on exit 1 with BLOCKED and no file named, after `git config remote.origin.fetch +refs/heads/feat/1-x:refs/remotes/origin/feat/1-x` and deleting `refs/remotes/origin/dev` on a clean-merging fixture

<!-- bkit:task 7 end -->
<!-- bkit:task 8 start -->

- [x] **TASK 8:** A consumer whose older hook lacks `PUSH_BRANCH_SHA` in its stdin loop follows the `pre-push-pr-conflict` tip, pastes the two blocks, and gets a check that silently never runs, while the tip stops firing because `merge-tree` is now present
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/checks/tips/catalogue.ts:477` · **Round:** 1
  - **DONE WHEN:** The tip's `ask` also names the `PUSH_BRANCH_SHA` line of the stdin loop, and `fires` returns true for a hook that has `merge-tree` but no `PUSH_BRANCH_SHA=`, so the tip stays until the check can actually run. The `PR conflict` block's `[ -n "$PUSH_BRANCH_SHA" ]` guard skips with no message when the variable is unset, and the variable entered the template only in November 2026 (`git log -S` on `.bkit/templates/.husky/pre-push`).
  - **TEST FIRST:**
    - `.bkit/core/engine/checks/tips/catalogue.test.ts` `pre-push-pr-conflict fires for a hook with merge-tree but no PUSH_BRANCH_SHA` fails on `fires` returning false

<!-- bkit:task 8 end -->
<!-- bkit:task 9 start -->

- [x] **TASK 9:** An outside attacker opens a fork PR whose head branch has the same name as a bkit feature branch, and the pre-push hook trial-merges the victim's push against the attacker's chosen base, blocking it and printing a Fix that tells the agent to merge that base
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/templates/.husky/pre-push:147` · **Round:** 1
  - **DONE WHEN:** the shared open-PR lookup in `.bkit/templates/.husky/pre-push` and `.husky/pre-push` (line 204) asks `gh pr list` for `isCrossRepository` and keeps only same-repo PRs (`map(select(.isCrossRepository | not)) | .[0]`), so an open fork PR with the same head branch name sets neither `OPEN_PR` nor `PR_BASE`, and neither the CI-suppressor guard nor the PR conflict check acts on it
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` `fork PR with the same head branch name → ignored, gates run` fails on the hook blocking the push (exit 1, `BLOCKED`) when stub `gh` applies the hook's own `--jq` filter with real `jq` to `[{"number":8,"baseRefName":"dev","isCrossRepository":true}]` in the conflicting fixture, for both hook copies

<!-- bkit:task 9 end -->
<!-- bkit:group 2 end -->
