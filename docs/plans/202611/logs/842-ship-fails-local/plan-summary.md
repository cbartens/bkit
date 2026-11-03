Verdict: CONCERNS
Failures: 0
<!-- verdict:end -->

# Plan Summary

## Verdict

CONCERNS

- plan-review CONCERNS
- 2 deferral(s) written this run

## Steps

<!-- prettier-ignore -->
| Step | Verdict | Failures | Attempts | Artifact |
| --- | --- | --- | --- | --- |
| plan-start-workflow | - | - | 1 | - |
| plan-worktree-setup | - | - | 1 | `docs/plans/202611/logs/842-ship-fails-local/plan-input-1.md` |
| plan-generate | - | - | 1 | `docs/plans/202611/logs/842-ship-fails-local/plan-v1-draft.md`, `docs/plans/202611/logs/842-ship-fails-local/plan-generate-check.md` |
| plan-fetch-context | - | - | 1 | `docs/plans/202611/logs/842-ship-fails-local/related-deferrals.md`, `docs/plans/202611/logs/842-ship-fails-local/related-failures.md`, `docs/plans/202611/logs/842-ship-fails-local/related-issues.md` |
| plan-review | CONCERNS | 8 | 1 | `docs/plans/202611/logs/842-ship-fails-local/plan-review-1.md`, `docs/plans/202611/logs/842-ship-fails-local/plan-review-2.md`, `docs/plans/202611/logs/842-ship-fails-local/plan-scope-check.md` |
| plan-apply-review | PASS | - | 1 | `docs/plans/202611/logs/842-ship-fails-local/plan-v2-reviewed.md`, `docs/plans/202611/logs/842-ship-fails-local/plan-update-check.md` |

## Acceptance Scenario

### Narrative
Ship finishes whenever the branch can be integrated without a person's judgement, however the local branch, GitHub's copy and `dev` have moved. Ship never merges a PR whose CI ran against an older `dev` without saying so.
### Success Criteria
- A ship whose local branch is behind GitHub's copy, on Path A or Path B, catches up and merges without a hand step.
- A ship whose local branch has unpushed code commits pushes them with CI running, on Path A as well as Path B. A ship whose local branch and GitHub's copy have both moved merges `origin/{SHIP_BRANCH}` in, and stops only on a non-mechanical conflict, as Step 4 does for `dev`.
- A ship whose `dev` moved after its validated CI run does not merge silently: it re-integrates and re-validates, or stops with the reason, per the decision below.
- A ship of a branch carrying unpushed `dev` commits is refused or warned before Step 2 opens a PR, naming the commits and the fix.
- A ship whose branch has commits past its merged PR never deletes them: it stops, or opens a new PR for them, and the close keeps any branch `notOnDev` reports. A merge GitHub refuses because the head moved, or because of a new conflict with `dev`, routes back to re-validation or integration, never to Step 11 / Step 12.
### Process Sketch
- **WHEN** ship starts after a cloud push → **THEN** it fetches the feature ref and reconciles the local branch before checking its relationship to `dev`.
- **WHEN** the local branch also has unpublished commits → **THEN** ship publishes the merged branch with a CI-running head.
- **WHEN** another ship advances `dev` while CI runs → **THEN** the merge gate returns to integration and validates the new head within the bounded merge counter.
- **WHEN** unpublished local `dev` commits are inherited → **THEN** ship refuses before opening a PR and names the commits and recovery.
- **WHEN** a prior PR is merged but the branch contains newer work → **THEN** ship creates a new PR and close preserves any work absent from `dev`.
- **WHEN** GitHub refuses a merge after the head or base changes → **THEN** ship returns to validation or integration and does not send the refusal to CI diagnosis.
### Concrete Example
**Setup:** An owner ships a feature built partly in a cloud session and partly on a laptop. GitHub has one additional feature commit, the laptop has one unpublished fix, and another feature can land on `dev` during CI.

**Steps:**

1. The owner runs `/bkit-ship` → the engine fetches the remote feature branch and merges its additional commit into the laptop branch.
2. Ship publishes the reconciled branch with CI enabled → the PR receives both feature commits and the fix.
3. Another feature lands on `dev` before the merge gate → ship integrates that `dev`, pushes the new head and validates it again.
4. The gate observes the validated head and current `dev` → ship merges and closes while retaining any later unlanded branch work.

**Outcome:** The feature's published work is preserved, CI validates the integrated code, and merge refusal is handled by the relevant retry route.
### Edge Cases
<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| Remote branch has commits not downloaded locally, with or without a PR | Fetch before no-PR publication and base inspection; fast-forward when possible. |
| Local branch has code past the remote branch | Publish before bookkeeping with a head that runs CI. |
| Local and remote branches diverged | Merge the remote feature ref; use the existing mechanical conflict settlement and code-conflict handover. |
| `dev` changes while the PR is validated or immediately before merge | Return to integration inside the merge attempt budget, or refuse with the precise reason. |
| Local `dev` has unpublished commits inherited by the feature | Refuse before PR creation; list commits and advise publishing `dev` separately. |
| The branch has commits past its merged PR | Reopen ship through a new PR; preserve the branch if close finds unlanded work. |
| The PR head changes after the gate | Return to CI validation, without CI-failure remediation. |
| GitHub refuses because the PR conflicts with new `dev` | Return to integration, without CI-failure remediation. |
| Adopt mode has never fetched the remote feature ref | Fetch the named feature ref before switching; report fetch or missing-ref failures accurately. |
| Fetch fails, branch is dirty, or a feature merge has real conflicts | Stop without destructive cleanup or publication; preserve work and return the existing conflict sentinel where applicable. |
| Squash merge makes source commits non-ancestors of `dev` | Judge cleanup with the existing patch-equivalence semantics of `notOnDev`, retaining genuinely new work. |

## Open Questions

- **Assumption:** Running ship authorizes publishing commits already present on its named feature branch. If this is wrong, automatic reconciliation would publish work the owner intended to keep local.
- **Assumption:** The existing bounded `ship.merge` attempt budget applies to both head changes and base changes. If concurrent changes exhaust it, ship stops with the branch intact and the reason recorded.
- **Open Question:** Confirm automatic feature reconciliation before the base check.
  - **Options:** A) Fetch in setup and merge inside `branches sync` — one engine owner, reuses conflict handling · B) Stop on divergence — simpler, requires a hand step.
  - **Recommended:** A) Follow the issue's proposal and merge the remote feature ref automatically.
  - **Default if unanswered:** A.
- **Open Question:** Confirm stale-base handling at Step 10.
  - **Options:** A) Re-enter Step 3 inside `ship.merge` — portable, may need another CI run · B) Require GitHub up-to-date protection — server enforcement, changes repository policy.
  - **Recommended:** A) Follow the issue's proposal; retain the post-merge squash capstone and record the base snapshot and any later movement explicitly. A client check cannot atomically lock GitHub's base between its final read and merge.
  - **Default if unanswered:** A. The documented residual API race is detected after merge and reported; this plan does not promise an atomic merge queue.
- **Open Question:** Confirm early refusal of inherited unpublished `dev` commits and treatment of newer work after a merged PR.
  - **Options:** A) Refuse inherited `dev` work; open a new PR for newer feature work — preserves ownership and matches the issue proposals · B) Warn and retain the old merged-PR shortcut — needs manual handling and risks publishing unrelated work.
  - **Recommended:** A) Refuse before publication and preserve all unlanded branch work on close.
  - **Default if unanswered:** A.

## Risks and Action Items

None

## Recommended Next Step

```text
/bkit-build #842
```

Or, to address the reasons first: `/bkit-plan #842`
