# Brief: group 4 — Challenge round 2 findings

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
- Group 2: Challenge round 1 findings — done
  - TASK 4: Anyone who can push `ship-failed/{FID}` plants a symlinked `.jsonl` in the run's log folder, and the refused flush's `restoreBranchRows` follows it, creating a file outside the checkout at a path and with lines the attacker chose (a `.pth` or `profile.d` file runs code on the ship host) — done
  - TASK 5: An outsider opens a fork PR whose head branch is named `ship-failed/{FID}`; the refused flush takes it as the leftover branch's open PR, creates no PR of its own, and logs "close PR #N opened but not merged — merge it by hand", pointing the operator at the attacker's PR — done
  - TASK 6: A second refused flush pushes a `Merge commit '<sha>'` head with no `[skip ci]`, so the reused `ship-failed/{FID}` PR runs the full CI on every later attempt — done
  - TASK 7: A reused open PR is merged with `--match-head-commit` straight after the branch push, before GitHub has moved the PR's head to the pushed tip, so GitHub refuses the merge and the record waits for a human — done
  - TASK 8: Anyone who can push `ship-failed/{FID}` or `ship-close/{FID}` gets a new skill (`.claude/skills/x/SKILL.md` plus scripts), a `skills-lock.json` source, a `docs/*.md` rule or a `.bkit/issues.jsonl` `SHIPPED` row onto `dev`, inside bkit's own `[skip ci]` record commit, because the leftover-tip check allows every min-push path instead of the paths a record holds — done
- Group 3: Challenge round 1 findings — done
  - TASK 9: A leftover tip carrying content the landing gate would reject (a malformed ledger row, a home-directory path, or a secret a consumer's `bkit:gate:min` scans for) reaches `dev` unchecked: `checkLanding` gated only the record, the merge commit is pushed without a gate, and the `[skip ci]` squash subject means no CI runs after it either — done
- Group 4: Challenge round 2 findings — this group
  - TASK 10: Anyone who can push `ship-failed/{FID}` or `ship-close/{FID}` adds `docs/plans/x/y/logs/{FID}/.prettierrc.mjs` and a `.md` file beside it; the record-path check admits both, and `gateMerged` then runs `bkit:gate:min` (here `prettier --check .`) on the merged checkout, so Prettier imports the planted file and runs the attacker's code on the ship host with the operator's environment — open
  - TASK 11: Anyone who can push `ship-failed/{FID}` or `ship-close/{FID}` deletes ledger history on `dev`: a leftover tip that removes rows from `docs/decisions.jsonl`, deletes `docs/knowledge.jsonl` or empties another feature's `status.jsonl` (resetting its `dev-dispatch` budget) passes the record-path check and merges cleanly, because the check limits which paths change, not how they change — open

## The work

<!-- bkit:task 10 start -->
- [ ] **TASK 10:** Anyone who can push `ship-failed/{FID}` or `ship-close/{FID}` adds `docs/plans/x/y/logs/{FID}/.prettierrc.mjs` and a `.md` file beside it; the record-path check admits both, and `gateMerged` then runs `bkit:gate:min` (here `prettier --check .`) on the merged checkout, so Prettier imports the planted file and runs the attacker's code on the ship host with the operator's environment
  **Severity:** CRITICAL · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/workflows.ts:1726` · **Round:** 2
  - **DONE WHEN:** `closePr` admits a leftover tip only when every path its `mergeBase..tip` diff touches is a file a record writes: a `*.md` file directly in `docs/plans/*/logs/{fid}/` (what `carryLogs` copies) or a ledger. Every pattern carries `:(glob)` magic so `*` stops at `/`, as `SHARED_LEDGERS` at `.bkit/core/engine/commands/workflow/workflows.ts:734` already does. A tip that touches `docs/plans/x/y/logs/{fid}/a.md`, `{log folder}/.prettierrc.mjs`, `{log folder}/.gitattributes` or `{log folder}/sub/x.test.ts` is refused before the merge: nothing is merged or pushed, the failure names the branch and the paths, and the exit code is 10 for the flush and 11 for the close. Checked in this challenge: in a scratch repo, `git diff --name-only` with the pathspecs `closePr` passes (`docs/plans/*/logs/12-export-csv/*` plus `UNION_PATHSPECS`) listed `docs/plans/a/b/logs/12-export-csv/.prettierrc.mjs`, `docs/plans/a/b/logs/12-export-csv/x.md` and `docs/plans/202611/logs/12-export-csv/sub/pwn.test.ts` as allowed. `git check-ignore` with bkit's `.prettierignore` line `docs/plans/*/logs/**` reports `docs/plans/a/b/logs/12-export-csv/x.md` as not ignored. Prettier 3.9.10 searches for a config file upward from each checked file's folder (`loadPrettierConfig2`, `node_modules/.pnpm/prettier@3.9.10/node_modules/prettier/index.mjs:15283-15287`), and `.prettierrc.mjs` is in its list (line 13779). Not run: this session's permissions blocked running Prettier on a planted config, so the code execution step is read from Prettier's source and was not observed. `runPushGate` passes the full `process.env` through `gitEnv()`. Once merged, the file also sits on `dev`, where every later `prettier --check .` run imports it, including `bkit:gate:min` and `bkit:gate:static` on any machine that runs them. `docs/security.md` § Untrusted Content & Prompt Injection says the load-bearing control is structural, and § Trust boundaries says the CLI validates its inputs.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/workflows.test.ts` `--flush refused by dev does not merge a leftover tip that adds files below a deeper logs folder` fails on the flush exiting 0 with the files on the branch (the leftover tip adds `docs/plans/x/y/logs/${FID}/.prettierrc.mjs` and `docs/plans/x/y/logs/${FID}/a.md`; it expects exit 10, a log naming `ship-failed/{FID}` and `docs/plans/x/y/logs/${FID}/.prettierrc.mjs`, and the remote branch still at the leftover tip)
    - `.bkit/core/engine/commands/workflow/workflows.test.ts` `--flush refused by dev does not merge a leftover tip that adds a non-log file to the run's log folder` fails on the flush exiting 0 with the files on the branch (the leftover tip adds `${REL}/.prettierrc.mjs` and `${REL}/sub/x.test.ts`; it expects exit 10, a log naming `ship-failed/{FID}`, `${REL}/.prettierrc.mjs` and `${REL}/sub/x.test.ts`, and the remote branch still at the leftover tip)
<!-- bkit:task 10 end -->

<!-- bkit:task 11 start -->
- [ ] **TASK 11:** Anyone who can push `ship-failed/{FID}` or `ship-close/{FID}` deletes ledger history on `dev`: a leftover tip that removes rows from `docs/decisions.jsonl`, deletes `docs/knowledge.jsonl` or empties another feature's `status.jsonl` (resetting its `dev-dispatch` budget) passes the record-path check and merges cleanly, because the check limits which paths change, not how they change
  **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/workflows.ts:1725` · **Round:** 2
  - **DONE WHEN:** `closePr` refuses a leftover tip whose `mergeBase..tip` diff deletes any file (status `D`) or removes any line from a `.jsonl` file (a deleted-lines count above 0 in `git diff --numstat`). A record only appends ledger rows and adds or rewrites its own `.md` logs, so a tip an earlier attempt left never does either. On refusal nothing is merged or pushed, the failure names the branch and the paths, and the exit code is 10 for the flush and 11 for the close. Checked in this challenge: in a scratch repo with `*.jsonl merge=union`, a tip that removed one row from `docs/decisions.jsonl`, deleted `docs/knowledge.jsonl` and emptied `docs/plans/202607/logs/99-other/status.jsonl` had all three paths listed as allowed by the `closePr` pathspecs. The special-mode check (`--diff-filter=AMT`) flagged none of them, and `git merge --no-ff --no-commit -X ours` exited 0, leaving the row gone, `docs/knowledge.jsonl` removed and the other status log at 0 lines. `.agents/docs.md` marks `docs/decisions.jsonl` and `docs/knowledge.jsonl` append-only. `docs/security.md` § CI Auto-Route Trust (bkit-cloud) counts the dispatch budget from `dev-dispatch` rows on `origin/dev` and names only a principal with `dev` write as able to reset it; here a principal without `dev` write resets it through bkit's own merge.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/workflows.test.ts` `--flush refused by dev does not merge a leftover tip that deletes ledger rows` fails on the flush exiting 0 with the rows gone from the branch (while `dev` still takes pushes, a scratch clone pushes `dev` holding `docs/decisions.jsonl` with rows `r1` and `r2` and `docs/knowledge.jsonl` with row `k1`, then pushes `ship-failed/{FID}` cut from that `dev` with `r1` removed and `docs/knowledge.jsonl` deleted; it expects exit 10, a log naming `ship-failed/{FID}`, `docs/decisions.jsonl` and `docs/knowledge.jsonl`, and the remote branch still at the leftover tip)
<!-- bkit:task 11 end -->

## Deviations

- What to build is decided in the issue: candidate (a), merge the leftover branch tip into the new record and reuse an open PR. No force push, no branch deletion, no new branch name. Do not build candidates (b) or (c).
- Every line number in the issue is stale: the builds of issues 811 and 958 both changed `.bkit/core/engine/commands/workflow/workflows.ts` since it was written. Find each place by its name (`closePr`, `shipClose`, `landFailedRecord`, `restoreBranchRows`, `pushToDev`, `probePr`, `mergePr`, `minPushOutside`, `minPushPathspecs`).
- Every test runs against temporary git repositories and a bare remote on this machine, with `gh` stubbed, as the existing tests in `workflows.test.ts` do. No test and no step of yours pushes to, or opens a pull request on, the real `origin`.
- Files you may change: `.bkit/core/engine/commands/workflow/workflows.ts`, `workflows.test.ts`, `branches.ts`, `branches.test.ts`, `prs.ts` and `prs.test.ts` only if the PR reuse needs it, the doc lines the issue's TASK 2 lists (`.bkit/core/.bkit/workflows.md` source, `docs/deployments.md`, `docs/testing.md`), the ledger rows the issue names, the built `dist/`, and the rendered copies that `pnpm tsx .bkit/core/engine/cli.ts upgrade` rewrites.
- Files you must not change: `.bkit/core/engine/commands/workflow/steps.ts`, `tests.ts`, `tasks.ts`, `summary.ts` and their tests (the build of issue 1051 and two helpers work on them now); `.bkit/core/engine/commands/land.ts` and `.bkit/core/engine/commands/ci/ci.ts` (read only, as the plan says); `.bkit/instructions.md`; every workflow and prompt file; `.husky/*`; `.github/workflows/*`. If the fix cannot be done without one of these, stop and say what you found.
- Word counts: no workflow or prompt text changes, so `pnpm bkit:text:ceiling check` must still pass at prompts 83,837 and workflows 57,977. Never `raise`.
