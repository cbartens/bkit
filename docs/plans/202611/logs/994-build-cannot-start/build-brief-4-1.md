# Brief: group 4 — Challenge round 2 findings

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

- Group 1: Plan-log conflicts settled on the rebase target's copy — done
  - TASK 1: Classify a feature's own plan files as the plan-log conflict shape — done
  - TASK 2: Settle plan-log conflicts on the target's copy in `bkit branches rebase`, and prove the build start — done
- Group 2: Docs, built output and the failures row — done
  - TASK 3: Describe the new shape in the verb help and the docs — done
  - TASK 4: Rebuild `dist/` and refresh the rendered copies — done
  - TASK 5: Close the open failures row `951-build-rebase-plan-v2-reviewed-add-add-conflict` — done
- Group 3: Challenge round 1 findings — done
  - TASK 6: A resumed build whose plan edits (task ticks, appended challenge tasks, logs) touch lines `dev` also changed loses the whole commit's edits to that file, non-overlapping hunks included, and `branches rebase` exits 0 — done
- Group 4: Challenge round 2 findings — this group
  - TASK 7: A plan-log conflict whose branch copy differs makes `bkit branches rebase` write the absolute outbox path (`/Users/{name}/.../.git/bkit-outbox/{FID}/dropped-logs/...`) into `{LOG_DIR}/rebase-resolve-log.md`, a tracked plan log the build commits and ship lands on public `dev`, so the operator's OS user name and checkout layout enter permanent git history — open

## The work

<!-- bkit:task 7 start -->
- [ ] **TASK 7:** A plan-log conflict whose branch copy differs makes `bkit branches rebase` write the absolute outbox path (`/Users/{name}/.../.git/bkit-outbox/{FID}/dropped-logs/...`) into `{LOG_DIR}/rebase-resolve-log.md`, a tracked plan log the build commits and ship lands on public `dev`, so the operator's OS user name and checkout layout enter permanent git history
  **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/branches.ts:637` · **Round:** 2
  - **DONE WHEN:** the `RESOLVED {path}` line names the kept copy through `outboxRel` (`.bkit/core/engine/commands/lib.ts:1190`, "relative to the main checkout, never a home path"), as `.git/bkit-outbox/{FID}/dropped-logs/{time}/{path}`, so no line `branches rebase` appends to `--log-file` holds an absolute path; the test `keeps a differing branch copy larger than 1 MiB aside and names it` resolves the named path against the repo before its `statSync`; `docs/security.md` § PII ("Keep consumer names and paths out of tracked records") holds for the rebase log
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/branches.test.ts` `names the kept branch copy in the rebase log by an outbox-relative path, never an absolute one` fails on the `--log-file=docs/plans/202611/logs/994-x/rebase-resolve-log.md` line reading `kept at {dir}/.git/bkit-outbox/994-x/dropped-logs/...` (`path.isAbsolute` true) for `feat/994-x` with a differing branch copy of `plan-v2-reviewed.md` (verified in a scratch repo with `dist/cli.js branches rebase`: exit 0, the log file untracked and not ignored)
<!-- bkit:task 7 end -->
