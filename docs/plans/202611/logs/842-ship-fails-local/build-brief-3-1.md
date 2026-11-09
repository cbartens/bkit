# Brief: group 3 — Challenge round 1 findings

Plan: Ship branch reconciliation Implementation Plan

## Why and what

### Context & Goals

Make ship reconcile the feature branch before it chooses its integration path, refuse inherited unpublished `dev` commits, re-check the integration base at merge time, and preserve unlanded work during close. The issue was established by code inspection, so the build first reproduces each gap with local Git repositories and the existing GitHub CLI fixture harness.

**Related Issues:**

- #99 — Friction triage (state not supplied)
- #799 — Ship Step 4 cannot integrate dev into a Path B PR (state not supplied)
- #838 — Rebase resolver: generated files, install record and the run log (state not supplied)
- #841 — Ship Step 4 merge push is blocked by the pre-push skip-ci guard (state not supplied)
- #788 — Build and debug PRs conflict on GitHub over union-merged ledgers (state not supplied)
- #639 — Land parallel workflow closes on dev without colliding (state not supplied)
- #800 — Pre-push misses CI's stale-file checks; ship has no fix round for them (state not supplied)
- #801 — Build friction: undo per-file test locking and hard stops on missing proof (state not supplied)
- #397 — bkit-cloud concurrency: global ship lock, FID arbitration (state not supplied)

### Narrative

Ship finishes whenever the branch can be integrated without a person's judgement, however the local branch, GitHub's copy and `dev` have moved. Ship never merges a PR whose CI ran against an older `dev` without saying so.

### Success Criteria

- A ship whose local branch is behind GitHub's copy, on Path A or Path B, catches up and merges without a hand step.
- A ship whose local branch has unpushed code commits pushes them with CI running, on Path A as well as Path B. A ship whose local branch and GitHub's copy have both moved merges `origin/{SHIP_BRANCH}` in, and stops only on a non-mechanical conflict, as Step 4 does for `dev`.
- A ship whose `dev` moved after its validated CI run does not merge silently: it re-integrates and re-validates, or stops with the reason, per the decision below.
- A ship of a branch carrying unpushed `dev` commits is refused or warned before Step 2 opens a PR, naming the commits and the fix.
- A ship whose branch has commits past its merged PR never deletes them: it stops, or opens a new PR for them, and the close keeps any branch `notOnDev` reports. A merge GitHub refuses because the head moved, or because of a new conflict with `dev`, routes back to re-validation or integration, never to Step 11 / Step 12.

### Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why `Exempt` | Where it belongs |
| --- | --- | --- |
| Skip full CI for docs-only `dev` movement | Correctness is met by re-integrating and revalidating every stale base; this optimization changes the skip-token contract and is an explicit issue non-goal. | Separate issue if requested; ledger `842-docs-only-dev-movement-ci-optimization`. |
| Cloud Actions concurrency group | A cloud-only queue does not implement cross-runtime branch safety and is an explicit issue non-goal. | Existing cloud concurrency work; ledger `842-cloud-concurrency-queue-non-goal`. |

Semantic conflict resolution remains the existing resolver's handover behavior; this plan adds no new excluded work or deferral for it.

## Where it fits

- Group 1: Reconcile feature work and preserve unpublished changes — done
  - TASK 1: Reconcile the remote feature branch before base classification and publish code with CI — done
  - TASK 2: Fetch ship branches during setup and reject inherited unpublished dev work — done
  - TASK 3: Qualify the merged-on-entry shortcut against current feature work — done
  - TASK 4: Guard ship cleanup with one shared landed-content comparison — done
- Group 2: Revalidate concurrent changes and route refusals safely — done
  - TASK 5: Enforce fresh dev ancestry at the pre-merge gate — done
  - TASK 6: Distinguish moved-head and base-conflict merge refusals — done
  - TASK 7: Wire reconciliation and bounded retry routes across the ship workflow and resolver — done
  - TASK 8: Synchronize documentation, compiled output and provider renders — done
- Group 3: Challenge round 1 findings — this group
  - TASK 9: A remote code push after bookkeeping reaches merge without reconciliation or refreshed feature coverage — open
  - TASK 10: Substitute unrelated green Actions evidence into scoped MCP facts to authorize a merge — open

## The work

<!-- bkit:task 9 start -->
- [ ] **TASK 9:** A remote code push after bookkeeping reaches merge without reconciliation or refreshed feature coverage
  **Severity:** HIGH · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/workflows/bkit-ship.md:645` · **Round:** 1
  - **DONE WHEN:** Newly observed feature code in Step 9 and non-bookkeeping head movement reported by Step 10 exit 17 both return through Step 3 reconciliation, inherited-unpublished-dev eligibility checks and Steps 5/6 coverage decisions before the new head can authorize merge. Step 9 consumes an explicit reconciliation-needed result instead of silently advancing `VALIDATED_HEAD`. The existing bounded retry accounting remains intact, and pure bookkeeping movement retains covered sweep/docs work. Update the existing engine/workflow owners and regenerate their shipped mirrors; no second reconciliation implementation is needed.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/runs.test.ts` `requires reconciliation for remote code first observed during revalidation while retaining bookkeeping reuse` fails because `runRevalidate` currently selects the changed remote code head and returns validation success without a reconciliation-needed outcome; the same test verifies that a bookkeeping-only descendant preserves the covered code head and does not request renewed feature review.
    - `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` `routes late revalidation code and gate seventeen through reconciliation before merge` fails because Step 9 accepts `validatedHead` without routing a newly observed code change to Step 3, and Step 10 exit 17 returns to Step 9 without setting `RECONCILE_REQUIRED` or otherwise requiring reconciliation; scope assertions to both route blocks and retain the bounded counter and bookkeeping-reuse assertions.
<!-- bkit:task 9 end -->

<!-- bkit:task 10 start -->
- [ ] **TASK 10:** Substitute unrelated green Actions evidence into scoped MCP facts to authorize a merge
  **Severity:** HIGH · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/runs.ts:2027` · **Round:** 1
  - **DONE WHEN:** The MCP adapter rejects CI evidence whose repository or configured workflow does not match the requested scope, and rejects jobs whose run identity or head does not match the selected run. Missing provenance fails closed. Update the fallback facts contract and fixtures together while retaining valid scoped evidence and paginated jobs.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/runs.test.ts` `rejects MCP green runs from another repository or workflow at the same head` fails because a correct PR/base envelope containing a successful run for another repository or workflow at the requested SHA currently passes. Give the foreign run a successful capstone, keep the envelope and base valid, and assert a nonzero gate exit with `passed: false`.
    - `.bkit/core/engine/commands/workflow/runs.test.ts` `rejects MCP capstone jobs belonging to another run` fails because the adapter returns the same `ci.jobs` payload for any requested run ID present in `ci.workflowRuns`; a successful capstone with a different `run_id`, `run_url` or `head_sha` can satisfy the selected run. Assert refusal with otherwise valid run, PR and base evidence, and acceptance of the matching control.
<!-- bkit:task 10 end -->

## Deviations

Resume bkit-build #842 from the existing worktree and finish it.
