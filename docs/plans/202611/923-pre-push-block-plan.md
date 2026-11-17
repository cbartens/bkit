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
| open PR whose only conflict is a merge=union ledger → blocked | Integration | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` | 6 |
| single-branch fetch refspec → checks the fetched base, no false block | Integration | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` | 7 |
| pre-push-pr-conflict fires for a hook with merge-tree but no PUSH_BRANCH_SHA | Unit | `.bkit/core/engine/checks/tips/catalogue.test.ts` | 8 |
| fork PR with the same head branch name → ignored, gates run | Integration | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` | 9 |
| ship switches the PR conflict check off for every push | Unit | `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` | 10 |
| debug switches the PR conflict check off for every feature-branch push | Integration | `.bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts` | 11 |
| shallow clone → no base fetch, warns, gates run | Integration | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` | 12 |
| fork contributor's own PR with a skip-ci head → blocked by the CI-suppressor guard | Integration | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` | 13 |
| fork PRs past gh's page limit → same-repo PR still found, conflict blocked | Integration | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` | 14 |

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
  - **DONE WHEN:** Owner direction (decision 2): an on/off switch. Both `.bkit/templates/.husky/pre-push` and `.husky/pre-push` skip the whole `PR conflict` block (no fetch, no `git merge-tree`) when `BKIT_PR_CONFLICT_CHECK=false`, and print one line `[pre-push] PR conflict check off (BKIT_PR_CONFLICT_CHECK=false).` to stderr; unset or any other value runs the check as today. The open-PR lookup and the CI-suppressor guard are unchanged. `.bkit/core/workflows/bkit-ship.md` puts `BKIT_PR_CONFLICT_CHECK=false` in front of the three `branches push` calls that run before Step 4 `Integrate` (Step 2 publish after reconcile, Step 2 publish before `prs open`, Step 3 publish), and never on the Step 4 sub-step 3 push of the merged branch or any later push, so the merged head is checked normally. `.bkit/core/.bkit/templates.md` § Git hooks — Husky names the switch and why ship sets it, and `bkit install` regenerates `.bkit/templates.md` and the ship mirrors with the same text. Git passes the variable from `branches push` to the hook, so no engine change is needed. Decision pause 1 (`build-decision-2-1.md`) widens the ship pushes to every `branches push`: Task 10 owns that scope, and its test `ship switches the PR conflict check off for every push` replaces this task's ship test.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` `BKIT_PR_CONFLICT_CHECK=false on a conflicting PR → no fetch, off line, gates run` fails on exit 1 with `BLOCKED` and no off line, for both hook copies

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

<!-- bkit:group 3 start -->

### TASK GROUP 3: Challenge round 1 findings

<!-- bkit:task 10 start -->

- [x] **TASK 10:** A sibling PR merges into `dev` while `/bkit-ship` runs Steps 5-7 and appends to a shared `merge=union` ledger; ship's Step 8 `[skip ci]` bookkeeping push (or the Step 10 regenerate push) is then BLOCKED by the PR conflict check and ship takes the Failure Path, instead of reaching the Step 10 merge gate whose exit 19 (stale base) routes back to Step 3 / Step 4 integration
      **Severity:** HIGH · **Class:** architectural · **Fixable:** false · **Location:** `.bkit/core/workflows/bkit-ship.md:644` · **Round:** 1
  - **DONE WHEN:** Every `branches push` block in `.bkit/core/workflows/bkit-ship.md` starts with `BKIT_PR_CONFLICT_CHECK=false`: the Step 2 and Step 3 pushes as now, plus the Step 4 sub-step 3 merged-branch push (line 485), the Step 8 bookkeeping push (line 644) and the Step 10 regenerate push (line 746). The owner chose this at decision pause 1 (`build-decision-2-1.md`): a `dev` that moves after Step 4 is left to the Step 10 merge gate's `--fresh-base` (exit 19 -> Step 3), which already integrates it. The Step 4 push gets the switch too, because `dev` can move while `@bkit-ship-conflict-resolve` works and that push would then take the Failure Path the same way. Task 5's test `ship switches the PR conflict check off for its pushes before Step 4, and only those` asserts the opposite for the later pushes, so this task replaces it in `ship-invariants.test.ts` with the test below. Both copies of the switch bullet (`.bkit/core/.bkit/templates.md:329` and `.bkit/templates.md:329`) say `/bkit-ship` sets it on every push and leaves a `dev` that moved after Step 4 to the merge gate; they no longer say "never on later pushes, so the merged head is checked". The rendered snapshot `.bkit/core/engine/render/__snapshots__/bkit-ship.none.txt` and the host mirrors of `bkit-ship` match the workflow.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` `ship switches the PR conflict check off for every push` fails on the Step 4 sub-step 3 push (line 485), the Step 8 bookkeeping push (line 644) and the Step 10 regenerate push (line 746), which carry no `BKIT_PR_CONFLICT_CHECK=false`

<!-- bkit:task 10 end -->
<!-- bkit:task 11 start -->

- [x] **TASK 11:** `/bkit-debug` remediates a red PR, and during the run `dev` gains a ledger row that collides with the debug branch's own `docs/failures.jsonl` / `docs/knowledge.jsonl` appends; the Step 9 remediation push is BLOCKED, debug takes the Failure Path, and its handover never pushes onto a branch with an open PR, so the fix commits exist only in the local worktree and are lost with a cloud sandbox
      **Severity:** MEDIUM · **Class:** architectural · **Fixable:** false · **Location:** `.bkit/core/workflows/bkit-debug.md:649` · **Round:** 1
  - **DONE WHEN:** Every `branches push --mode=feature` block in `.bkit/core/workflows/bkit-debug.md` starts with `BKIT_PR_CONFLICT_CHECK=false`: the Step 9 remediation push (line 649), the Step 10 summary push (line 680), the Step 11 close push to a feature branch (line 752) and the create-pr trigger push (line 792). The owner chose this at decision pause 1 (`build-decision-2-1.md`): the fix commits always reach `origin`, as they did before this change, and on a PR that conflicts with its base the `--require-ci` dispatch reports no CI, as before. The `branches push --mode=dev` close push (line 763) stays as it is, because a push to `dev` has no open PR and the check does not run there. Both copies of the switch bullet (`.bkit/core/.bkit/templates.md:329` and `.bkit/templates.md:329`) say `/bkit-debug` sets it on its feature-branch pushes. The rendered snapshot `.bkit/core/engine/render/__snapshots__/bkit-debug.none.txt` and the host mirrors of `bkit-debug` match the workflow.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts` `debug switches the PR conflict check off for every feature-branch push` fails on the four `branches push --mode=feature` blocks (lines 649, 680, 752, 792), which carry no `BKIT_PR_CONFLICT_CHECK=false`

<!-- bkit:task 11 end -->
<!-- bkit:task 12 start -->

- [x] **TASK 12:** A cloud agent in a shallow (`--depth=1`) clone pushes its PR branch; the hook's base fetch downloads the whole history of the base branch, and `git merge-tree` then refuses with refusing to merge unrelated histories (exit 128), so the check costs a full-history download and still only warns, on every push from that sandbox
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/templates/.husky/pre-push:236` · **Round:** 1
  - **DONE WHEN:** Both `.bkit/templates/.husky/pre-push` and `.husky/pre-push` check `git rev-parse --is-shallow-repository` before the base fetch. If it prints `true` -> the hook skips the fetch and `git merge-tree`, prints one WARN naming the shallow clone and the fix (`git fetch --unshallow`), and goes on. A full clone behaves as now. `.bkit/core/.bkit/templates.md` § Git hooks — Husky lists the shallow case among the warn-only paths. Verified by hand on git 2.56.0: in a `git clone --depth=1 --single-branch --branch feat` clone, the hook's exact fetch line exits 0 and fetches all 5 `dev` commits, then its exact `merge-tree` line exits 128 with `fatal: refusing to merge unrelated histories`, both when the base conflicts and when it merges cleanly.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` `shallow clone → no base fetch, warns, gates run` fails on a recorded `fetch` line in `git.log` and a WARN naming `git merge-tree failed (exit 128)` instead of the shallow clone, for both hook copies, when `work` is a `--depth=1` clone of the fixture's `feat/1-x`

<!-- bkit:task 12 end -->
<!-- bkit:group 3 end -->

<!-- bkit:group 4 start -->

### TASK GROUP 4: Challenge round 2 findings

<!-- bkit:task 13 start -->

- [x] **TASK 13:** A contributor working from a fork pushes a `[skip ci]` HEAD onto the branch of their own open PR to the upstream repo; the lookup's `isCrossRepository | not` filter drops their PR, so the CI-suppressor guard, which blocked this push before the change, now allows it and the PR's checks stay green without testing the pushed code
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/templates/.husky/pre-push:177` · **Round:** 2
  - **DONE WHEN:** The shared lookup in both hook copies (`.bkit/templates/.husky/pre-push:147`, `.husky/pre-push:204`) keeps the PR whose head repository is the push target: it also asks `gh pr list` for `headRepositoryOwner` and `headRepository`, and keeps a PR when `isCrossRepository` is false or when that owner / name matches the `owner/name` parsed from the push URL in `$2`. The contributor's own PR then sets `OPEN_PR`, so the CI-suppressor guard at line 177 blocks the `[skip ci]` push as it did before the change, and an unrelated fork PR with the same head branch name still sets neither `OPEN_PR` nor `PR_BASE` (plan Task 9 stays met). Before the change the guard used `--jq '.[0].number'`, which returned cross-repository PRs too; in a fork checkout whose `gh` default repo is the upstream, the contributor's PR comes back with `isCrossRepository: true`. No plan task covers this case: Task 9 introduced the filter and tests only the unrelated-fork case.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` `fork contributor's own PR with a skip-ci head → blocked by the CI-suppressor guard` fails on exit 0 with no `BLOCKED`, for both hook copies, when stub `gh` applies the hook's `--jq` filter with real `jq` to `[{"number":7,"baseRefName":"dev","isCrossRepository":true,"headRepositoryOwner":{"login":"contrib"},"headRepository":{"name":"repo"}}]`, stub `pnpm` exits 0 for `ci skip-token` and 1 for `ci bookkeeping-push`, and the hook runs with `origin https://github.com/contrib/repo.git` as its arguments

<!-- bkit:task 13 end -->
<!-- bkit:task 14 start -->

- [x] **TASK 14:** An outside attacker forks the repo, names a branch after the victim's feature branch and opens 30 PRs from it to 30 different base branches; `gh pr list --head` returns only the newest 30 PRs, the hook's new same-repo filter then finds none, and the hook treats the branch as having no open PR, so a `[skip ci]` code head passes the CI-suppressor guard and the conflict check is skipped with no message
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/templates/.husky/pre-push:147` · **Round:** 2
  - **DONE WHEN:** the open-PR lookup in both `.bkit/templates/.husky/pre-push:147` and `.husky/pre-push:204` finds the same-repo PR no matter how many fork PRs share the head branch name: either the query filters by head owner on the server (for example `gh api "repos/{owner}/{repo}/pulls?state=open&head={owner}:$BRANCH"`), or a lookup whose page is full (as many results as `--limit`) with no same-repo PR sets `PR_LOOKUP` to a failure reason, so the conflict check warns and the CI-suppressor guard never reads it as no open PR
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` `fork PRs past gh's page limit → same-repo PR still found, conflict blocked` fails on exit 0 with the gate running and no `BLOCKED`, for both hook copies, in the conflicting fixture with a stub `gh` that emulates GitHub for 30 newer fork PRs plus the same-repo PR `7 dev`: for `pr list` it applies the hook's `--jq` with real `jq` to only the first `--limit` entries (30 by default), and for `api` with `head=<owner>:` it applies the `--jq` to the same-repo PR only

<!-- bkit:task 14 end -->
<!-- bkit:group 4 end -->
