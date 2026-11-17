Verdict: CONCERNS
Failures: 4
Fingerprint: 4a9efb39856c118b151a50a3de3730483bb5cf4aa85e6e80ec140449e4d4bc2a
<!-- verdict:end -->

# Build Challenge

Lens: Bugs and edge cases — null safety, off-by-one, error paths, data integrity.

## Scope

- Diff: `tmp/bkit-diff-923-pre-push-block.md`, read in full (full coverage; no `partial diff coverage` line).
- Plan: `docs/plans/202611/923-pre-push-block-plan.md`, Tasks 1-12, all checked. Findings already covered by a plan task, or already recorded as a `low-severity` deferral in `docs/deferrals.jsonl` (the `jq`-dependent fork-PR test stub, the `base;id` Fix-line injection), are not repeated.
- Docs read: `.agents/docs.md`, `docs/architecture.md` (pre-push not covered), `docs/security.md` (line 191: fork PRs are untrusted, which Task 1 keeps), `docs/deployments.md` § Pre-push checklist.
- Pushes traced: every `branches push` in `.bkit/core/workflows/*.md`, plus the engine's own pushes in `.bkit/core/engine/commands/workflow/runs.ts` (re-trigger), `branches.ts` and `workflows.ts`.

## Notes

- Task 3 was re-checked by hand on git 2.56.0 in the scratchpad (exact hook fetch line, exit 1 with `Errors during submodule fetch: sub`, then exit 0 with `--no-recurse-submodules`).
- Tasks 1 and 3 repeat round-1 findings that reached neither the plan nor `docs/deferrals.jsonl`. The round-1 `step-done` row in `status.jsonl` lists the fork-contributor finding at `.bkit/templates/.husky/pre-push:147`, the same location as plan Task 9, and the submodule finding is absent; both look dropped by a location-keyed dedup in `bkit challenge merge`. That engine behaviour is outside this diff; it is noted here and not logged as a task.
- Checked and clean: the empty-tree `--attr-source` and the hex guard under `set -e`; old git without `--is-shallow-repository` (the literal echo is not `true`, so the check goes on); detached HEAD (`BRANCH=HEAD`, no `PUSH_BRANCH_SHA`, silent skip); `gitEnv()` (`.bkit/core/engine/ledgers/telemetry.ts:62`) passes `BKIT_PR_CONFLICT_CHECK` to `git push`; the concurrent-worktree fetch of `refs/remotes/origin/<base>` (the engine fetches for itself before `--ahead-of` and fast-forward checks); the edited laundering test in `ledgers.test.ts` (invocation `id` is `bkit-build-plan-tests`, which still may not write `decision` rows).
- Not logged, because the end state is the same Failure Path as before the change: the `runs dispatch` re-trigger push (`runs.ts:1114`, `:1213`) and the build `branches force-build --open-pr` marker push carry no switch, so on a conflicting PR they now fail with the hook's `BLOCKED` text where they used to end in no CI.
- `bkit check` in this worktree prints the `pre-push-pr-conflict` tip. Tips read the main checkout (`.bkit/core/engine/checks/tips/index.ts:31`), whose `.husky/pre-push` is still the `dev` copy; `fires` on this worktree returns false. Not a bug.
- Outside the lens, not logged: the diff widens `KIND_WRITERS.knowledge` to `ANY_WRITER` (`.bkit/core/engine/ledgers/telemetry.ts:446`) with no per-run cap, and `docs/knowledge.jsonl` is always read in Plan, Build and Debug. Decision `any-agent-writes-knowledge` records the owner's choice.
- `Failures` counts CRITICAL findings only (0); the engine re-derives it from `findings`.

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** A contributor working from a fork pushes a `[skip ci]` HEAD onto the branch of their own open PR to the upstream repo; the lookup's `isCrossRepository | not` filter drops their PR, so the CI-suppressor guard, which blocked this push before the change, now allows it and the PR's checks stay green without testing the pushed code
  **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/templates/.husky/pre-push:177` · **Round:** 1
  - **DONE WHEN:** The shared lookup in both hook copies (`.bkit/templates/.husky/pre-push:147`, `.husky/pre-push:204`) keeps the PR whose head repository is the push target: it also asks `gh pr list` for `headRepositoryOwner` and `headRepository`, and keeps a PR when `isCrossRepository` is false or when that owner / name matches the `owner/name` parsed from the push URL in `$2`. The contributor's own PR then sets `OPEN_PR`, so the CI-suppressor guard at line 177 blocks the `[skip ci]` push as it did before the change, and an unrelated fork PR with the same head branch name still sets neither `OPEN_PR` nor `PR_BASE` (plan Task 9 stays met). Before the change the guard used `--jq '.[0].number'`, which returned cross-repository PRs too; in a fork checkout whose `gh` default repo is the upstream, the contributor's PR comes back with `isCrossRepository: true`. No plan task covers this case: Task 9 introduced the filter and tests only the unrelated-fork case.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` `fork contributor's own PR with a skip-ci head → blocked by the CI-suppressor guard` fails on exit 0 with no `BLOCKED`, for both hook copies, when stub `gh` applies the hook's `--jq` filter with real `jq` to `[{"number":7,"baseRefName":"dev","isCrossRepository":true,"headRepositoryOwner":{"login":"contrib"},"headRepository":{"name":"repo"}}]`, stub `pnpm` exits 0 for `ci skip-token` and 1 for `ci bookkeeping-push`, and the hook runs with `origin https://github.com/contrib/repo.git` as its arguments
<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->
- [ ] **TASK 2:** `/bkit-plan` or `/bkit-design` re-runs on a feature branch that already has an open PR, and `dev` has gained a row in a `merge=union` ledger that the branch also appended to; the summary push is BLOCKED by the PR conflict check, the run takes the Failure Path, and the handover never pushes onto a branch with an open PR, so the summary commits exist only in the local worktree
  **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/workflows/bkit-plan.md:480` · **Round:** 1
  - **DONE WHEN:** The feature-branch summary pushes in `.bkit/core/workflows/bkit-plan.md:480` and `.bkit/core/workflows/bkit-design.md:534` start with `BKIT_PR_CONFLICT_CHECK=false`, the same as the debug pushes of plan Task 11. The owner's answer at decision pause 1 (`build-decision-2-1.md`) was "fix all with flag that require it", and these pushes carry only bookkeeping, so blocking them fixes nothing: the PR already conflicts, and `/bkit-ship` Step 4 merges `dev` in. `.bkit/core/.bkit/templates.md` § Git hooks — Husky (the switch bullet, line 329) names plan and design next to debug, `bkit install` regenerates `.bkit/templates.md`, and the rendered snapshots `.bkit/core/engine/render/__snapshots__/bkit-plan.none.txt` and `bkit-design.none.txt` plus the host mirrors match the workflows. Neither workflow probes for an open PR before this push, and their shared handover (`.bkit/core/workflows/bkit-plan.md:106`) already handles an open PR on `{BRANCH}`, so this path is reachable.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `plan and design switch the PR conflict check off on their feature-branch summary push` fails on the `branches push --mode=feature` lines of `bkit-plan.md` (line 480) and `bkit-design.md` (line 534), which carry no `BKIT_PR_CONFLICT_CHECK=false`
<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->
- [ ] **TASK 3:** In a repo with submodules, the base fetch follows git's default `fetch.recurseSubmodules=on-demand` and also fetches every submodule whose pointer the new base commits move; a slow or unreachable submodule remote stalls the push before the gates or fails the fetch, so the check is skipped with `could not fetch '<base>' from origin` although the base itself was fetched
  **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/templates/.husky/pre-push:239` · **Round:** 1
  - **DONE WHEN:** The base fetch in both hook copies (`.bkit/templates/.husky/pre-push:239`, `.husky/pre-push:296`) passes `--no-recurse-submodules`. The trial merge reads only the superproject's trees and gitlink entries, never submodule objects, so a base commit that moves a submodule pointer to a commit on an unreachable submodule remote still gets a conflict verdict. Verified by hand on git 2.56.0 in the scratchpad: with a populated submodule, a `dev` commit on `origin` that moves its pointer, and the submodule remote removed, the hook's exact fetch line exits 1 (`Errors during submodule fetch: sub`) although `refs/remotes/origin/dev` was updated to the new tip; the same fetch with `--no-recurse-submodules` exits 0.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` `base moves a submodule pointer whose remote is gone → check still runs` fails on `WARN: PR conflict check skipped — could not fetch 'dev' from origin` and no `BLOCKED`, for both hook copies, in the conflicting fixture plus a populated submodule (added with `-c protocol.file.allow=always`) whose `dev`-side pointer update targets a submodule remote the test then deletes
<!-- bkit:task 3 end -->

<!-- bkit:task 4 start -->
- [ ] **TASK 4:** A branch has two open same-repo PRs, one to `main` that merges cleanly and an older one to `dev` that conflicts; the lookup keeps only `.[0]`, the newest PR, so the hook trial-merges against `main`, lets the push through, and the `dev` PR's CI never starts
  **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/templates/.husky/pre-push:149` · **Round:** 1
  - **DONE WHEN:** The lookup in both hook copies (`.bkit/templates/.husky/pre-push:147-150`, `.husky/pre-push:204-207`) keeps every same-repo open PR on the branch, one `<number> <base>` line each, and the `PR conflict` block trial-merges the pushed commit against each base in turn; any conflict blocks and names that PR's number and base, and a fetch or `git merge-tree` failure for one base warns for that base only. The CI-suppressor guard still blocks when any of those PRs is open. GitHub allows several open PRs from one head branch to different bases, and `gh pr list` returns them newest first.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` `two open PRs, only the older one conflicts → blocked, names that PR` fails on exit 0 and no `BLOCKED`, for both hook copies, when `origin` holds a `main` at the base commit, the fixture's `dev` conflicts with the branch, and stub `gh` applies the hook's `--jq` filter with real `jq` to `[{"number":9,"baseRefName":"main","isCrossRepository":false},{"number":7,"baseRefName":"dev","isCrossRepository":false}]`
<!-- bkit:task 4 end -->
