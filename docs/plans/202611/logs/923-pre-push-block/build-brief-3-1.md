# Brief: group 3 — Challenge round 1 findings

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
| ship switches the PR conflict check off for every push | Unit | `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` | 10 |
| debug switches the PR conflict check off for every feature-branch push | Integration | `.bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts` | 11 |
| shallow clone → no base fetch, warns, gates run | Integration | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` | 12 |

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
- Group 3: Challenge round 1 findings — this group
  - TASK 10: A sibling PR merges into `dev` while `/bkit-ship` runs Steps 5-7 and appends to a shared `merge=union` ledger; ship's Step 8 `[skip ci]` bookkeeping push (or the Step 10 regenerate push) is then BLOCKED by the PR conflict check and ship takes the Failure Path, instead of reaching the Step 10 merge gate whose exit 19 (stale base) routes back to Step 3 / Step 4 integration — open
  - TASK 11: `/bkit-debug` remediates a red PR, and during the run `dev` gains a ledger row that collides with the debug branch's own `docs/failures.jsonl` / `docs/knowledge.jsonl` appends; the Step 9 remediation push is BLOCKED, debug takes the Failure Path, and its handover never pushes onto a branch with an open PR, so the fix commits exist only in the local worktree and are lost with a cloud sandbox — open
  - TASK 12: A cloud agent in a shallow (`--depth=1`) clone pushes its PR branch; the hook's base fetch downloads the whole history of the base branch, and `git merge-tree` then refuses with refusing to merge unrelated histories (exit 128), so the check costs a full-history download and still only warns, on every push from that sandbox — open

## The work

<!-- bkit:task 10 start -->

- [ ] **TASK 10:** A sibling PR merges into `dev` while `/bkit-ship` runs Steps 5-7 and appends to a shared `merge=union` ledger; ship's Step 8 `[skip ci]` bookkeeping push (or the Step 10 regenerate push) is then BLOCKED by the PR conflict check and ship takes the Failure Path, instead of reaching the Step 10 merge gate whose exit 19 (stale base) routes back to Step 3 / Step 4 integration
      **Severity:** HIGH · **Class:** architectural · **Fixable:** false · **Location:** `.bkit/core/workflows/bkit-ship.md:644` · **Round:** 1
  - **DONE WHEN:** Every `branches push` block in `.bkit/core/workflows/bkit-ship.md` starts with `BKIT_PR_CONFLICT_CHECK=false`: the Step 2 and Step 3 pushes as now, plus the Step 4 sub-step 3 merged-branch push (line 485), the Step 8 bookkeeping push (line 644) and the Step 10 regenerate push (line 746). The owner chose this at decision pause 1 (`build-decision-2-1.md`): a `dev` that moves after Step 4 is left to the Step 10 merge gate's `--fresh-base` (exit 19 -> Step 3), which already integrates it. The Step 4 push gets the switch too, because `dev` can move while `@bkit-ship-conflict-resolve` works and that push would then take the Failure Path the same way. Task 5's test `ship switches the PR conflict check off for its pushes before Step 4, and only those` asserts the opposite for the later pushes, so this task replaces it in `ship-invariants.test.ts` with the test below. Both copies of the switch bullet (`.bkit/core/.bkit/templates.md:329` and `.bkit/templates.md:329`) say `/bkit-ship` sets it on every push and leaves a `dev` that moved after Step 4 to the merge gate; they no longer say "never on later pushes, so the merged head is checked". The rendered snapshot `.bkit/core/engine/render/__snapshots__/bkit-ship.none.txt` and the host mirrors of `bkit-ship` match the workflow.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` `ship switches the PR conflict check off for every push` fails on the Step 4 sub-step 3 push (line 485), the Step 8 bookkeeping push (line 644) and the Step 10 regenerate push (line 746), which carry no `BKIT_PR_CONFLICT_CHECK=false`

<!-- bkit:task 10 end -->

<!-- bkit:task 11 start -->

- [ ] **TASK 11:** `/bkit-debug` remediates a red PR, and during the run `dev` gains a ledger row that collides with the debug branch's own `docs/failures.jsonl` / `docs/knowledge.jsonl` appends; the Step 9 remediation push is BLOCKED, debug takes the Failure Path, and its handover never pushes onto a branch with an open PR, so the fix commits exist only in the local worktree and are lost with a cloud sandbox
      **Severity:** MEDIUM · **Class:** architectural · **Fixable:** false · **Location:** `.bkit/core/workflows/bkit-debug.md:649` · **Round:** 1
  - **DONE WHEN:** Every `branches push --mode=feature` block in `.bkit/core/workflows/bkit-debug.md` starts with `BKIT_PR_CONFLICT_CHECK=false`: the Step 9 remediation push (line 649), the Step 10 summary push (line 680), the Step 11 close push to a feature branch (line 752) and the create-pr trigger push (line 792). The owner chose this at decision pause 1 (`build-decision-2-1.md`): the fix commits always reach `origin`, as they did before this change, and on a PR that conflicts with its base the `--require-ci` dispatch reports no CI, as before. The `branches push --mode=dev` close push (line 763) stays as it is, because a push to `dev` has no open PR and the check does not run there. Both copies of the switch bullet (`.bkit/core/.bkit/templates.md:329` and `.bkit/templates.md:329`) say `/bkit-debug` sets it on its feature-branch pushes. The rendered snapshot `.bkit/core/engine/render/__snapshots__/bkit-debug.none.txt` and the host mirrors of `bkit-debug` match the workflow.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts` `debug switches the PR conflict check off for every feature-branch push` fails on the four `branches push --mode=feature` blocks (lines 649, 680, 752, 792), which carry no `BKIT_PR_CONFLICT_CHECK=false`

<!-- bkit:task 11 end -->

<!-- bkit:task 12 start -->

- [ ] **TASK 12:** A cloud agent in a shallow (`--depth=1`) clone pushes its PR branch; the hook's base fetch downloads the whole history of the base branch, and `git merge-tree` then refuses with refusing to merge unrelated histories (exit 128), so the check costs a full-history download and still only warns, on every push from that sandbox
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/templates/.husky/pre-push:236` · **Round:** 1
  - **DONE WHEN:** Both `.bkit/templates/.husky/pre-push` and `.husky/pre-push` check `git rev-parse --is-shallow-repository` before the base fetch. If it prints `true` -> the hook skips the fetch and `git merge-tree`, prints one WARN naming the shallow clone and the fix (`git fetch --unshallow`), and goes on. A full clone behaves as now. `.bkit/core/.bkit/templates.md` § Git hooks — Husky lists the shallow case among the warn-only paths. Verified by hand on git 2.56.0: in a `git clone --depth=1 --single-branch --branch feat` clone, the hook's exact fetch line exits 0 and fetches all 5 `dev` commits, then its exact `merge-tree` line exits 128 with `fatal: refusing to merge unrelated histories`, both when the base conflicts and when it merges cleanly.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` `shallow clone → no base fetch, warns, gates run` fails on a recorded `fetch` line in `git.log` and a WARN naming `git merge-tree failed (exit 128)` instead of the shallow clone, for both hook copies, when `work` is a `--depth=1` clone of the fixture's `feat/1-x`

<!-- bkit:task 12 end -->
