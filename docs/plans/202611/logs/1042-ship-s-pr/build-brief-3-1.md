# Brief: group 3 — Challenge round 1 findings

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
- Group 3: Challenge round 1 findings — this group
  - TASK 9: A leftover tip carrying content the landing gate would reject (a malformed ledger row, a home-directory path, or a secret a consumer's `bkit:gate:min` scans for) reaches `dev` unchecked: `checkLanding` gated only the record, the merge commit is pushed without a gate, and the `[skip ci]` squash subject means no CI runs after it either — open

## The work

<!-- bkit:task 9 start -->

- [ ] **TASK 9:** A leftover tip carrying content the landing gate would reject (a malformed ledger row, a home-directory path, or a secret a consumer's `bkit:gate:min` scans for) reaches `dev` unchecked: `checkLanding` gated only the record, the merge commit is pushed without a gate, and the `[skip ci]` squash subject means no CI runs after it either
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/workflows.ts:1719` · **Round:** 1
  - **DONE WHEN:** after the leftover-tip merge commit and before the branch push, `closePr` runs the same landing gate `checkLanding` in `.bkit/core/engine/commands/land.ts` picks (`bkit:gate:min` for min-push changes, through `runPushGate`) on the merged checkout. A failing or missing gate pushes nothing, its failure names the branch and the gate, and the exit code is 10 or 11. `.bkit/core/.bkit/workflows.md` § One landing routine for every dev write says that "failed checks and a changed landing tree stop the push", and `docs/security.md` § Supply-Chain (GitHub Actions) records that no workflow, the secret scan included, runs on a `[skip ci]` push to `dev`.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/workflows.test.ts` `--flush refused by dev runs the landing gate on a merged leftover tip` fails on the flush exiting 0 with the gate never run on the merge (`dev`'s `package.json` declares `bkit:gate:min` as `test ! -e {REL}/poison.md`, and the leftover tip adds `{REL}/poison.md`; it expects exit 10, a log naming `ship-failed/{FID}` and `bkit:gate:min`, and the remote branch still at the leftover tip)

<!-- bkit:task 9 end -->

## Deviations

- What to build is decided in the issue: candidate (a), merge the leftover branch tip into the new record and reuse an open PR. No force push, no branch deletion, no new branch name. Do not build candidates (b) or (c).
- Every line number in the issue is stale: the builds of issues 811 and 958 both changed `.bkit/core/engine/commands/workflow/workflows.ts` since it was written. Find each place by its name (`closePr`, `shipClose`, `landFailedRecord`, `restoreBranchRows`, `pushToDev`, `probePr`, `mergePr`, `minPushOutside`, `minPushPathspecs`).
- Every test runs against temporary git repositories and a bare remote on this machine, with `gh` stubbed, as the existing tests in `workflows.test.ts` do. No test and no step of yours pushes to, or opens a pull request on, the real `origin`.
- Files you may change: `.bkit/core/engine/commands/workflow/workflows.ts`, `workflows.test.ts`, `branches.ts`, `branches.test.ts`, `prs.ts` and `prs.test.ts` only if the PR reuse needs it, the doc lines the issue's TASK 2 lists (`.bkit/core/.bkit/workflows.md` source, `docs/deployments.md`, `docs/testing.md`), the ledger rows the issue names, the built `dist/`, and the rendered copies that `pnpm tsx .bkit/core/engine/cli.ts upgrade` rewrites.
- Files you must not change: `.bkit/core/engine/commands/workflow/steps.ts`, `tests.ts`, `tasks.ts`, `summary.ts` and their tests (the build of issue 1051 and two helpers work on them now); `.bkit/core/engine/commands/land.ts` and `.bkit/core/engine/commands/ci/ci.ts` (read only, as the plan says); `.bkit/instructions.md`; every workflow and prompt file; `.husky/*`; `.github/workflows/*`. If the fix cannot be done without one of these, stop and say what you found.
- Word counts: no workflow or prompt text changes, so `pnpm bkit:text:ceiling check` must still pass at prompts 83,837 and workflows 57,977. Never `raise`.
