# Brief: group 2 — Challenge round 1 findings

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
| BKIT_PR_CONFLICT_CHECK=false on a conflicting PR → no fetch, off line, gates run | Integration | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` | 5 |
| ship switches the PR conflict check off for its pushes before Step 4, and only those | Unit | `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` | 5 |
| open PR whose only conflict is a merge=union ledger → blocked | Integration | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` | 6 |
| single-branch fetch refspec → checks the fetched base, no false block | Integration | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` | 7 |
| pre-push-pr-conflict fires for a hook with merge-tree but no PUSH_BRANCH_SHA | Unit | `.bkit/core/engine/checks/tips/catalogue.test.ts` | 8 |
| fork PR with the same head branch name → ignored, gates run | Integration | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` | 9 |

## Where it fits

- Group 1: The pre-push hook blocks a PR that no longer merges — done
  - TASK 1: One open-PR lookup for feature branches, and a trial-merge check before `bkit check` — done
  - TASK 2: Add a `bkit tips` entry for repos whose hook copy predates the conflict check — done
  - TASK 3: Document the conflict check — done
  - TASK 4: Make the no-`gh` test's `PATH` helper safe to call once per hook copy — done
- Group 2: Challenge round 1 findings — this group
  - TASK 5: `/bkit-ship` on a branch whose open PR conflicts with dev dies at its Step 2 / Step 3 publish push, so it never reaches the Step 4 merge that would fix the conflict — open
  - TASK 6: A PR that conflicts on GitHub only in a `merge=union` ledger (`docs/knowledge.jsonl`, `.bkit/stats.jsonl`, `status.jsonl` ...) passes the check, because `git merge-tree` applies the work tree's `.gitattributes` union driver and GitHub does not, so CI still never starts — open
  - TASK 7: In a single-branch clone (fetch refspec covers only the branch, common for cloud agents), `git fetch origin dev` succeeds without creating `refs/remotes/origin/dev`, `git merge-tree` exits 1 with "not something we can merge", and the hook BLOCKS the push with an empty conflicting-files list — open
  - TASK 8: A consumer whose older hook lacks `PUSH_BRANCH_SHA` in its stdin loop follows the `pre-push-pr-conflict` tip, pastes the two blocks, and gets a check that silently never runs, while the tip stops firing because `merge-tree` is now present — open
  - TASK 9: An outside attacker opens a fork PR whose head branch has the same name as a bkit feature branch, and the pre-push hook trial-merges the victim's push against the attacker's chosen base, blocking it and printing a Fix that tells the agent to merge that base — open

## The work

<!-- bkit:task 5 start -->

- [ ] **TASK 5:** `/bkit-ship` on a branch whose open PR conflicts with dev dies at its Step 2 / Step 3 publish push, so it never reaches the Step 4 merge that would fix the conflict
      **Severity:** HIGH · **Class:** architectural · **Fixable:** false · **Location:** `.bkit/templates/.husky/pre-push:240` · **Round:** 1
  - **DONE WHEN:** Owner direction (decision 2): an on/off switch. Both `.bkit/templates/.husky/pre-push` and `.husky/pre-push` skip the whole `PR conflict` block (no fetch, no `git merge-tree`) when `BKIT_PR_CONFLICT_CHECK=false`, and print one line `[pre-push] PR conflict check off (BKIT_PR_CONFLICT_CHECK=false).` to stderr; unset or any other value runs the check as today. The open-PR lookup and the CI-suppressor guard are unchanged. `.bkit/core/workflows/bkit-ship.md` puts `BKIT_PR_CONFLICT_CHECK=false` in front of the three `branches push` calls that run before Step 4 `Integrate` (Step 2 publish after reconcile, Step 2 publish before `prs open`, Step 3 publish), and never on the Step 4 sub-step 3 push of the merged branch or any later push, so the merged head is checked normally. `.bkit/core/.bkit/templates.md` § Git hooks — Husky names the switch and why ship sets it, and `bkit install` regenerates `.bkit/templates.md` and the ship mirrors with the same text. Git passes the variable from `branches push` to the hook, so no engine change is needed.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` `BKIT_PR_CONFLICT_CHECK=false on a conflicting PR → no fetch, off line, gates run` fails on exit 1 with `BLOCKED` and no off line, for both hook copies
    - `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` `ship switches the PR conflict check off for its pushes before Step 4, and only those` fails on the Step 2 and Step 3 `branches push` lines lacking `BKIT_PR_CONFLICT_CHECK=false`

<!-- bkit:task 5 end -->

<!-- bkit:task 6 start -->

- [ ] **TASK 6:** A PR that conflicts on GitHub only in a `merge=union` ledger (`docs/knowledge.jsonl`, `.bkit/stats.jsonl`, `status.jsonl` ...) passes the check, because `git merge-tree` applies the work tree's `.gitattributes` union driver and GitHub does not, so CI still never starts
      **Severity:** HIGH · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/templates/.husky/pre-push:235` · **Round:** 1
  - **DONE WHEN:** Both hook copies run the trial merge with no attributes (for example `git --attr-source="$(git hash-object -t tree /dev/null)" merge-tree ...` or `GIT_ATTR_SOURCE` set to the empty tree), so a union-only conflict exits 1 and blocks exactly as GitHub reports it; a git too old for `--attr-source` lands on the existing WARN path. Verified by hand on git 2.56.0: with `*.jsonl merge=union`, both sides appending to `a.jsonl` gives `merge-tree` exit 0; with the empty-tree attribute source it gives exit 1 and names `a.jsonl`. The fixture in `setup()` has no `.gitattributes`, so no current test sees this.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` `open PR whose only conflict is a merge=union ledger → blocked` fails on exit 0 and the gate running, for both hook copies

<!-- bkit:task 6 end -->

<!-- bkit:task 7 start -->

- [ ] **TASK 7:** In a single-branch clone (fetch refspec covers only the branch, common for cloud agents), `git fetch origin dev` succeeds without creating `refs/remotes/origin/dev`, `git merge-tree` exits 1 with "not something we can merge", and the hook BLOCKS the push with an empty conflicting-files list
      **Severity:** HIGH · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/templates/.husky/pre-push:233` · **Round:** 1
  - **DONE WHEN:** Both hook copies fetch with an explicit refspec (`git fetch --quiet origin "+refs/heads/$PR_BASE:refs/remotes/origin/$PR_BASE"`) or merge against `FETCH_HEAD`, and they treat exit 1 as a conflict only when the first output line is a tree OID; a base ref that cannot be resolved lands on the WARN path, as `.bkit/core/.bkit/templates.md` § Git hooks already promises ("`git merge-tree` fails for another reason → the hook warns"). The same refspec gap also lets a stale `origin/<base>` decide the result. Verified by hand on git 2.56.0: `git clone --single-branch --branch feat` → `git fetch --quiet origin dev` exit 0 → `rev-parse refs/remotes/origin/dev` fails → `merge-tree` exit 1.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` `single-branch fetch refspec → checks the fetched base, no false block` fails on exit 1 with BLOCKED and no file named, after `git config remote.origin.fetch +refs/heads/feat/1-x:refs/remotes/origin/feat/1-x` and deleting `refs/remotes/origin/dev` on a clean-merging fixture

<!-- bkit:task 7 end -->

<!-- bkit:task 8 start -->

- [ ] **TASK 8:** A consumer whose older hook lacks `PUSH_BRANCH_SHA` in its stdin loop follows the `pre-push-pr-conflict` tip, pastes the two blocks, and gets a check that silently never runs, while the tip stops firing because `merge-tree` is now present
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/checks/tips/catalogue.ts:477` · **Round:** 1
  - **DONE WHEN:** The tip's `ask` also names the `PUSH_BRANCH_SHA` line of the stdin loop, and `fires` returns true for a hook that has `merge-tree` but no `PUSH_BRANCH_SHA=`, so the tip stays until the check can actually run. The `PR conflict` block's `[ -n "$PUSH_BRANCH_SHA" ]` guard skips with no message when the variable is unset, and the variable entered the template only in November 2026 (`git log -S` on `.bkit/templates/.husky/pre-push`).
  - **TEST FIRST:**
    - `.bkit/core/engine/checks/tips/catalogue.test.ts` `pre-push-pr-conflict fires for a hook with merge-tree but no PUSH_BRANCH_SHA` fails on `fires` returning false

<!-- bkit:task 8 end -->

<!-- bkit:task 9 start -->

- [ ] **TASK 9:** An outside attacker opens a fork PR whose head branch has the same name as a bkit feature branch, and the pre-push hook trial-merges the victim's push against the attacker's chosen base, blocking it and printing a Fix that tells the agent to merge that base
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/templates/.husky/pre-push:147` · **Round:** 1
  - **DONE WHEN:** the shared open-PR lookup in `.bkit/templates/.husky/pre-push` and `.husky/pre-push` (line 204) asks `gh pr list` for `isCrossRepository` and keeps only same-repo PRs (`map(select(.isCrossRepository | not)) | .[0]`), so an open fork PR with the same head branch name sets neither `OPEN_PR` nor `PR_BASE`, and neither the CI-suppressor guard nor the PR conflict check acts on it
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` `fork PR with the same head branch name → ignored, gates run` fails on the hook blocking the push (exit 1, `BLOCKED`) when stub `gh` applies the hook's own `--jq` filter with real `jq` to `[{"number":8,"baseRefName":"dev","isCrossRepository":true}]` in the conflicting fixture, for both hook copies

<!-- bkit:task 9 end -->
