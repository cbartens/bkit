# Brief: group 1 — Plan-log conflicts settled on the rebase target's copy (tests)

Plan: Build starts on a plan-closed branch Implementation Plan

## Why and what

### Context & Goals

A build resumes `feat/{FID}`, the branch the plan phase pushed and left on the remote, and rebases it onto `origin/dev`. The plan close already landed the feature's plan files on `dev`, so the same plan-log files exist on both sides and git reports an add/add conflict. `bkit branches rebase` (`resolveRebase` in `.bkit/core/engine/commands/workflow/branches.ts`) classifies those files as `refuse`, aborts, and the build never starts (seen three times: failures keys `951-build-rebase-plan-v2-reviewed-add-add-conflict`, `916-build-rebase-add-add-conflict-plan-logs`, `912-build-rebase-add-add-plan-v2-reviewed`).

Decided by the owner on 2026-11-17: the engine keeps `dev`'s copy of a plan-log file that exists on both sides, and the build starts. The rule stays narrow: only files under the feature's own `docs/plans/{YYYYMM}/logs/{FID}/` folder and its `docs/plans/{YYYYMM}/{FID}-plan.md` take `dev`'s copy; any other conflict still stops the build. The planning branch is not deleted at plan close, and the build does not keep refusing with a clearer message.

**Related Issues:**

- #994 — Build cannot start: the planning branch is kept at plan close and the build's rebase hits add/add conflicts in plan logs (open)
- #1050 — Host-made worktrees: gaps left after setup adopts them (lands first; both change `worktrees.ts`)
- #345 — Failures triage (parent tracker)

---

### Narrative

An owner starts a build on a feature whose planning branch was left on the remote after the plan close. The build's rebase meets the plan files that both `dev` and the branch hold, keeps `dev`'s copy of each, and the build starts with no stop and no hand repair.

### Success Criteria

- A build started after a plan close that kept its branch does not stop on an add/add conflict in that feature's plan-log files or its plan file.
- Each such file ends up with `dev`'s content, and the rebase log says so (`RESOLVED {path} — took the rebase target's copy`).
- A conflict in any other file (code, another feature's plan logs, a plan file on a branch not named `feat/{FID}`) still stops the build, and the refusal reason names the rule.
- The ledger row `951-build-rebase-plan-v2-reviewed-add-add-conflict` is closed with a CLOSED row appended through `bkit ledgers append`.

### Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why `Exempt` | Where it belongs |
| --- | --- | --- |
| A decision row saying why the planning branch is kept at plan close | The reason is not recorded anywhere; the owner must confirm it before it is written | A follow-up on #994 after the owner confirms the reason |
| The same plan-log rule in `sync --merge` (`resolvePath`, ship Step 4 and the docs merge) | The issue is about the build start's rebase; `docs` policy already takes `dev` for `docs/` paths and `full` policy hands the rest to a person | Keep deferred until a sighting shows it |
| Changes to `worktrees.ts` | The resume rebase needs none (see the assumption above) | n/a |
| Deleting a leftover planning branch | Owner decision of 2026-11-17 | n/a |

## Where it fits

- Group 1: Plan-log conflicts settled on the rebase target's copy — this group
  - TASK 1: Classify a feature's own plan files as the plan-log conflict shape — open
  - TASK 2: Settle plan-log conflicts on the target's copy in `bkit branches rebase`, and prove the build start — open
- Group 2: Docs, built output and the failures row — next
  - TASK 3: Describe the new shape in the verb help and the docs — open
  - TASK 4: Rebuild `dist/` and refresh the rendered copies — open
  - TASK 5: Close the open failures row `951-build-rebase-plan-v2-reviewed-add-add-conflict` — open

## The work

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** Classify a feature's own plan files as the plan-log conflict shape
  - **UPDATE:** `classifyConflict` in `.bkit/core/engine/commands/workflow/branches.ts`: optional third argument `fid`; returns `"planlog"` after the ledger check for `docs/plans/{YYYYMM}/logs/{fid}/**` and `docs/plans/{YYYYMM}/{fid}-plan.md`, and never without `fid`
  - **UPDATE:** `ConflictKind` in `.bkit/core/engine/commands/workflow/branches.ts`: adds `"planlog"`
  - **UPDATE:** `.bkit/core/engine/commands/workflow/branches.test.ts`: a case in `branches rebase: classification`
  - **READ:** `LEDGER_PATTERNS` in `.bkit/core/engine/commands/workflow/branches.ts`: the ledger check that must still win for `status.jsonl`
  - **DONE WHEN:** `classifyConflict("docs/plans/202611/logs/994-x/plan-v2-reviewed.md", new Map(), "994-x")` and the feature's `-plan.md` return `"planlog"`; `status.jsonl` in that folder returns `"ledger"`; another feature's log, a prefix-sharing id, `994-x-design.md` and every path without `fid` return `"refuse"`; the rest of `branches.test.ts` classification cases still pass
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/branches.test.ts` `classifies only the feature's own plan files as the plan-log shape` fails on `classifyConflict` ignoring the feature id and returning `refuse`, so the assertion "planlog" is not met

<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->

- [ ] **TASK 2:** Settle plan-log conflicts on the target's copy in `bkit branches rebase`, and prove the build start
  - **UPDATE:** `resolveRebase` in `.bkit/core/engine/commands/workflow/branches.ts`: reads the feature id of the branch being rebased, passes it to `classifyConflict`, settles a `planlog` path with `takeDevSide(top, f, "ours")`, records `how: "dev"`, logs `RESOLVED {path} — took the rebase target's copy`
  - **UPDATE:** `resolvePath` in `.bkit/core/engine/commands/workflow/branches.ts`: the `docs` policy block calls the extracted `takeDevSide(top, file, "theirs")`, behaviour unchanged
  - **UPDATE:** `resolvePath` in `.bkit/core/engine/commands/workflow/branches.ts`: the extracted helper `takeDevSide(top, file, dev)` checks out `--ours` / `--theirs` and adds the file, or `git rm`s it when that side deleted it (extracted, not new logic)
  - **UPDATE:** `rebaseOrigHead` in `.bkit/core/engine/commands/workflow/branches.ts`: its state-file read is generalised so a `rebasedFid` helper reads `head-name` from `rebase-merge` / `rebase-apply` and returns `{fid}` for `refs/heads/feat/{fid}`, else null
  - **UPDATE:** `NOT_RESOLVABLE` in `.bkit/core/engine/commands/workflow/branches.ts`: the reason adds "a plan file of this feature's own branch"; `REBASE_HOW` beside it covers `dev`
  - **UPDATE:** `.bkit/core/engine/commands/workflow/branches.test.ts`: a describe for a plan-closed branch with a leftover push, with a `feat/{fid}` fixture (two commits on the branch, a squashed copy on `main`)
  - **UPDATE:** `.bkit/core/engine/commands/workflow/worktrees.integration.test.ts`: two cases in `bkit worktrees setup — mint (resume)`; `advanceDev` makes parent folders
  - **READ:** `rebaseVerb` in `.bkit/core/engine/commands/workflow/branches.ts`: the caller of `resolveRebase` that must keep working
  - **READ:** `.bkit/core/engine/commands/workflow/worktrees.ts`: the resume rebase at `rebase --rebase-merges`, which stays unchanged
  - **DEPENDS ON:** 1
  - **DONE WHEN:** a rebase of `feat/{fid}` onto a target holding the same plan log, in one commit or across two, completes with `dev`'s content, `how: "dev"` and exit 0; `status.jsonl` is unioned in the same pass; a code conflict, another feature's log or a branch not named `feat/{fid}` is refused, aborted, and its `reason` contains "plan file of this feature"; through a real remote and worktree `setup` exits 3, `branches rebase` exits 0 and a second `setup` exits 0; the existing `sync` docs-policy cases in `branches.test.ts` still pass
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/branches.test.ts` `takes the rebase target's copy of a plan log both sides added, and completes the rebase` fails on the rebase being refused, the exit code being 3 so the check "expected 3 to be 0" shows
    - `.bkit/core/engine/commands/workflow/branches.test.ts` `takes the target's copy in each round when the branch changed the plan log in a later commit` fails on the second replayed commit's conflict stopping the rebase, "expected 3 to be 0"
    - `.bkit/core/engine/commands/workflow/branches.test.ts` `settles the feature's plan file on the target's copy and still unions status.jsonl in the same pass` fails on the plan file refusing the whole set, "expected 3 to be 0"
    - `.bkit/core/engine/commands/workflow/branches.test.ts` `refuses another feature's plan log and names the rule in the reason` fails on the refusal reason lacking the plan-file clause, "plan file of this feature"
    - `.bkit/core/engine/commands/workflow/branches.test.ts` `refuses a code conflict beside the plan logs, leaving the plan log unresolved` fails on the reason lacking the plan-file clause, "plan file of this feature"
    - `.bkit/core/engine/commands/workflow/branches.test.ts` `gives a branch not named feat/{fid} no plan-log rule` fails on the reason lacking the plan-file clause, "plan file of this feature"
    - `.bkit/core/engine/commands/workflow/worktrees.integration.test.ts` `a plan-closed branch with a leftover push: branches rebase keeps dev's copy and setup then starts` fails on `branches rebase` refusing the plan log, "expected 3 to be 0"
    - `.bkit/core/engine/commands/workflow/worktrees.integration.test.ts` `a code conflict beside the plan logs still stops the start, and the reason names the rule` fails on the reason lacking the plan-file clause, "plan file of this feature"

<!-- bkit:task 2 end -->

### Derived Test Matrix rows

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| `classifyConflict` returns the plan-log shape only for this feature's log folder (any depth) and `{FID}-plan.md`, keeps `status.jsonl` a ledger, and refuses other features, prefix-sharing ids, `{FID}-design.md` and any path when no feature id is given | Unit | `.bkit/core/engine/commands/workflow/branches.test.ts` | 1 |
| a plan log both sides added is settled on the rebase target's copy and the rebase completes (including a byte-identical copy that empties its commit) | Unit | `.bkit/core/engine/commands/workflow/branches.test.ts` | 2 |
| a plan log added in one commit and changed in a later one takes the target's copy in both rounds | Unit | `.bkit/core/engine/commands/workflow/branches.test.ts` | 2 |
| the feature's plan file takes the target's copy while `status.jsonl` in the same pass is unioned | Unit | `.bkit/core/engine/commands/workflow/branches.test.ts` | 2 |
| another feature's plan log is refused and the reason names the plan-file rule | Unit | `.bkit/core/engine/commands/workflow/branches.test.ts` | 2 |
| a code conflict beside the plan logs is refused with the plan log left unresolved and the reason naming the rule | Unit | `.bkit/core/engine/commands/workflow/branches.test.ts` | 2 |
| a branch not named `feat/{FID}` gets no plan-log rule | Unit | `.bkit/core/engine/commands/workflow/branches.test.ts` | 2 |
| a plan-closed branch with a leftover push: `setup` stops, `branches rebase` keeps `dev`'s copy, `setup` then starts (real remote, real worktree) | Integration | `.bkit/core/engine/commands/workflow/worktrees.integration.test.ts` | 2 |
| a code conflict beside the plan logs still stops the start with the sentinel and a reason naming the rule | Integration | `.bkit/core/engine/commands/workflow/worktrees.integration.test.ts` | 2 |
