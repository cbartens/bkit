# Brief: group 4 — Challenge round 2 findings

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
| open PR whose only conflict is a merge=union ledger → blocked | Integration | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` | 6 |
| single-branch fetch refspec → checks the fetched base, no false block | Integration | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` | 7 |
| pre-push-pr-conflict fires for a hook with merge-tree but no PUSH_BRANCH_SHA | Unit | `.bkit/core/engine/checks/tips/catalogue.test.ts` | 8 |
| fork PR with the same head branch name → ignored, gates run | Integration | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` | 9 |
| ship switches the PR conflict check off for every push | Unit | `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` | 10 |
| debug switches the PR conflict check off for every feature-branch push | Integration | `.bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts` | 11 |
| shallow clone → no base fetch, warns, gates run | Integration | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` | 12 |
| fork contributor's own PR with a skip-ci head → blocked by the CI-suppressor guard | Integration | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` | 13 |
| fork PRs past gh's page limit → same-repo PR still found, conflict blocked | Integration | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` | 14 |

## Where it fits

- Group 1: The pre-push hook blocks a PR that no longer merges — done
  - TASK 1: One open-PR lookup for feature branches, and a trial-merge check before `bkit check` — done
  - TASK 2: Add a `bkit tips` entry for repos whose hook copy predates the conflict check — done
  - TASK 3: Document the conflict check — done
  - TASK 4: Make the no-`gh` test's `PATH` helper safe to call once per hook copy — done
- Group 2: Challenge round 1 findings — done
  - TASK 5: `/bkit-ship` on a branch whose open PR conflicts with dev dies at its Step 2 / Step 3 publish push, so it never reaches the Step 4 merge that would fix the conflict — done
  - TASK 6: A PR that conflicts on GitHub only in a `merge=union` ledger (`docs/knowledge.jsonl`, `.bkit/stats.jsonl`, `status.jsonl` ...) passes the check, because `git merge-tree` applies the work tree's `.gitattributes` union driver and GitHub does not, so CI still never starts — done
  - TASK 7: In a single-branch clone (fetch refspec covers only the branch, common for cloud agents), `git fetch origin dev` succeeds without creating `refs/remotes/origin/dev`, `git merge-tree` exits 1 with "not something we can merge", and the hook BLOCKS the push with an empty conflicting-files list — done
  - TASK 8: A consumer whose older hook lacks `PUSH_BRANCH_SHA` in its stdin loop follows the `pre-push-pr-conflict` tip, pastes the two blocks, and gets a check that silently never runs, while the tip stops firing because `merge-tree` is now present — done
  - TASK 9: An outside attacker opens a fork PR whose head branch has the same name as a bkit feature branch, and the pre-push hook trial-merges the victim's push against the attacker's chosen base, blocking it and printing a Fix that tells the agent to merge that base — done
- Group 3: Challenge round 1 findings — done
  - TASK 10: A sibling PR merges into `dev` while `/bkit-ship` runs Steps 5-7 and appends to a shared `merge=union` ledger; ship's Step 8 `[skip ci]` bookkeeping push (or the Step 10 regenerate push) is then BLOCKED by the PR conflict check and ship takes the Failure Path, instead of reaching the Step 10 merge gate whose exit 19 (stale base) routes back to Step 3 / Step 4 integration — done
  - TASK 11: `/bkit-debug` remediates a red PR, and during the run `dev` gains a ledger row that collides with the debug branch's own `docs/failures.jsonl` / `docs/knowledge.jsonl` appends; the Step 9 remediation push is BLOCKED, debug takes the Failure Path, and its handover never pushes onto a branch with an open PR, so the fix commits exist only in the local worktree and are lost with a cloud sandbox — done
  - TASK 12: A cloud agent in a shallow (`--depth=1`) clone pushes its PR branch; the hook's base fetch downloads the whole history of the base branch, and `git merge-tree` then refuses with refusing to merge unrelated histories (exit 128), so the check costs a full-history download and still only warns, on every push from that sandbox — done
- Group 4: Challenge round 2 findings — this group
  - TASK 13: A contributor working from a fork pushes a `[skip ci]` HEAD onto the branch of their own open PR to the upstream repo; the lookup's `isCrossRepository | not` filter drops their PR, so the CI-suppressor guard, which blocked this push before the change, now allows it and the PR's checks stay green without testing the pushed code — open
  - TASK 14: An outside attacker forks the repo, names a branch after the victim's feature branch and opens 30 PRs from it to 30 different base branches; `gh pr list --head` returns only the newest 30 PRs, the hook's new same-repo filter then finds none, and the hook treats the branch as having no open PR, so a `[skip ci]` code head passes the CI-suppressor guard and the conflict check is skipped with no message — open

## The work

<!-- bkit:task 13 start -->
- [ ] **TASK 13:** A contributor working from a fork pushes a `[skip ci]` HEAD onto the branch of their own open PR to the upstream repo; the lookup's `isCrossRepository | not` filter drops their PR, so the CI-suppressor guard, which blocked this push before the change, now allows it and the PR's checks stay green without testing the pushed code
  **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/templates/.husky/pre-push:177` · **Round:** 2
  - **DONE WHEN:** The shared lookup in both hook copies (`.bkit/templates/.husky/pre-push:147`, `.husky/pre-push:204`) keeps the PR whose head repository is the push target: it also asks `gh pr list` for `headRepositoryOwner` and `headRepository`, and keeps a PR when `isCrossRepository` is false or when that owner / name matches the `owner/name` parsed from the push URL in `$2`. The contributor's own PR then sets `OPEN_PR`, so the CI-suppressor guard at line 177 blocks the `[skip ci]` push as it did before the change, and an unrelated fork PR with the same head branch name still sets neither `OPEN_PR` nor `PR_BASE` (plan Task 9 stays met). Before the change the guard used `--jq '.[0].number'`, which returned cross-repository PRs too; in a fork checkout whose `gh` default repo is the upstream, the contributor's PR comes back with `isCrossRepository: true`. No plan task covers this case: Task 9 introduced the filter and tests only the unrelated-fork case.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` `fork contributor's own PR with a skip-ci head → blocked by the CI-suppressor guard` fails on exit 0 with no `BLOCKED`, for both hook copies, when stub `gh` applies the hook's `--jq` filter with real `jq` to `[{"number":7,"baseRefName":"dev","isCrossRepository":true,"headRepositoryOwner":{"login":"contrib"},"headRepository":{"name":"repo"}}]`, stub `pnpm` exits 0 for `ci skip-token` and 1 for `ci bookkeeping-push`, and the hook runs with `origin https://github.com/contrib/repo.git` as its arguments
<!-- bkit:task 13 end -->

<!-- bkit:task 14 start -->
- [ ] **TASK 14:** An outside attacker forks the repo, names a branch after the victim's feature branch and opens 30 PRs from it to 30 different base branches; `gh pr list --head` returns only the newest 30 PRs, the hook's new same-repo filter then finds none, and the hook treats the branch as having no open PR, so a `[skip ci]` code head passes the CI-suppressor guard and the conflict check is skipped with no message
  **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/templates/.husky/pre-push:147` · **Round:** 2
  - **DONE WHEN:** the open-PR lookup in both `.bkit/templates/.husky/pre-push:147` and `.husky/pre-push:204` finds the same-repo PR no matter how many fork PRs share the head branch name: either the query filters by head owner on the server (for example `gh api "repos/{owner}/{repo}/pulls?state=open&head={owner}:$BRANCH"`), or a lookup whose page is full (as many results as `--limit`) with no same-repo PR sets `PR_LOOKUP` to a failure reason, so the conflict check warns and the CI-suppressor guard never reads it as no open PR
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` `fork PRs past gh's page limit → same-repo PR still found, conflict blocked` fails on exit 0 with the gate running and no `BLOCKED`, for both hook copies, in the conflicting fixture with a stub `gh` that emulates GitHub for 30 newer fork PRs plus the same-repo PR `7 dev`: for `pr list` it applies the hook's `--jq` with real `jq` to only the first `--limit` entries (30 by default), and for `api` with `head=<owner>:` it applies the `--jq` to the same-repo PR only
<!-- bkit:task 14 end -->
