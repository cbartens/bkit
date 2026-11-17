# Brief: group 2 — Revalidate concurrent changes and route refusals safely (tests)

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
- Group 2: Revalidate concurrent changes and route refusals safely — this group
  - TASK 5: Enforce fresh dev ancestry at the pre-merge gate — open
  - TASK 6: Distinguish moved-head and base-conflict merge refusals — open
  - TASK 7: Wire reconciliation and bounded retry routes across the ship workflow and resolver — open
  - TASK 8: Synchronize documentation, compiled output and provider renders — done

## The work

<!-- bkit:task 5 start -->

- [ ] **TASK 5:** Enforce fresh dev ancestry at the pre-merge gate
  - **UPDATE:** `runGate` in `.bkit/core/engine/commands/workflow/runs.ts`: refresh scoped dev evidence, require it in the validated code head, and emit an additive distinct stale-base outcome with snapshot/refusal evidence; validate scoped MCP PR/CI/base facts through the same gate when gh is unavailable.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/runs.test.ts`: add the gate regressions below using real Git ancestry and the existing gh fixture boundary.
  - **DEPENDS ON:** 1
  - **DONE WHEN:** The named Unit tests pass; a dev commit absent from the validated code head prevents merge even with green CI or a matching override, foreign-repo checks use that repo, unavailable base evidence fails closed, and direct-head/post-merge capstone behavior is preserved. Scoped MCP facts produce the same deterministic stale-base or missing-evidence refusal as gh-backed facts, with no merge authorization from CI facts alone.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/runs.test.ts` `refuses green CI when dev advanced beyond the validated code head` fails on the gate allowing stale integrated code.
    - `.bkit/core/engine/commands/workflow/runs.test.ts` `does not let bookkeeping or a CI override waive stale dev ancestry` fails on stale-base acceptance through carry-forward or override.
    - `.bkit/core/engine/commands/workflow/runs.test.ts` `checks the named repository base and fails closed on missing evidence` fails on local-repo ancestry or unavailable evidence yielding a passing PR gate.
    - `.bkit/core/engine/commands/workflow/runs.test.ts` `refuses stale or missing MCP base evidence despite green CI without gh` fails on MCP CI facts bypassing fresh ancestry or being accepted without repository-scoped base evidence.

<!-- bkit:task 5 end -->

<!-- bkit:task 6 start -->

- [ ] **TASK 6:** Distinguish moved-head and base-conflict merge refusals
  - **UPDATE:** `mergePr` in `.bkit/core/engine/commands/workflow/prs.ts`: add ship opt-in retry classification from independently re-read PR state, checking moved head before new base conflicts and returning explicit terminal reasons otherwise; validate scoped independent MCP post-attempt facts through that same classifier.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/prs.test.ts`: add refusal regressions with a fixture that changes PR state between the attempted merge and reread.
  - **DEPENDS ON:** 5
  - **DONE WHEN:** The named Unit tests pass; moved head and conflict outcomes are distinct from red CI and other merge refusal, unreadable state is never a retry success, base!=dev remains forbidden, and generic merge callers retain their existing exit contract. Independent MCP post-attempt facts give the same head-before-conflict decision and terminal refusal for missing/mismatched facts; retain generic merge/default and docs-policy merge regression assertions.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/prs.test.ts` `classifies a refused merge whose pinned head moved as revalidation` fails on a moved head collapsing into the generic not-merged result.
    - `.bkit/core/engine/commands/workflow/prs.test.ts` `classifies a refused merge with a new dev conflict as integration` fails on a new base conflict collapsing into the generic not-merged result.
    - `.bkit/core/engine/commands/workflow/prs.test.ts` `returns an explicit terminal reason for other merge refusals` fails on an unrelated refusal being sent toward CI code remediation.
    - `.bkit/core/engine/commands/workflow/prs.test.ts` `classifies independent MCP merge refusal facts without gh` fails on moved-head or conflict facts returning generic failure, entering CI remediation, or missing scoped facts being accepted as safe.

<!-- bkit:task 6 end -->

<!-- bkit:task 7 start -->

- [ ] **TASK 7:** Wire reconciliation and bounded retry routes across the ship workflow and resolver
  - **UPDATE:** `.bkit/core/workflows/bkit-ship.md`: wire opt-in engine contracts, early publication, fresh head variables, new-PR handling, stale-base→Step 3 and moved-head→Step 9 routing, one durable attempt count and guarded post-merge cleanup; remove eager merge-time branch deletion. Wire exit-80 and runtime-gh-unavailable fact handoffs through the same engine classifiers with single-transition transport accounting and independent rereads.
  - **UPDATE:** `.bkit/core/prompts/bkit-ship-conflict-resolve.md`: verify and continue the engine-recorded merge target using the same mechanical-only resolution contract.
  - **UPDATE:** `.bkit/core/engine/audits/workflows/ship-invariants.test.ts`: assert the routes, counter consumption, target passing and cleanup ownership structurally, while retaining existing staging and head-pin assertions.
  - **READ:** `.bkit/core/.bkit/workflows.md`: maintain the existing canonical step keys and resume model.
  - **DEPENDS ON:** 1, 2, 3, 4, 5, 6
  - **DONE WHEN:** The named Unit tests pass; source workflow and resolver consume the exact new engine fields/codes, retries refresh state and do not repeat completed unrelated agent work when its recorded feature-code state is unchanged, each failed arrival consumes one existing merge attempt, exhaustion preserves work, and recoverable merge refusals never enter Steps 11–12. New feature code invalidates relevant sweep/docs completion; base-only integration can reuse it. Both MCP fallback triggers return scoped facts to the engine and refuse before mutation when evidence is unavailable, without bypassing gates, guessing safety, or losing the existing transport-row accounting and reread.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` `reconciles and publishes feature code before bookkeeping on every ship path` fails on an unreconciled no-PR or Path A route.
    - `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` `routes stale bases and refused merges through the bounded integration or validation loop` fails on stale-base or moved-head routes reaching CI diagnosis or bypassing the counter.
    - `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` `passes the actual merge target and defers branch deletion to guarded close` fails on a dev-only continuation or eager merge-time branch deletion.
    - `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` `routes MCP safety facts through engine decisions with transport accounting` fails on either fallback trigger bypassing eligibility/ancestry/refusal classification, skipping the independent reread, or sending a moved head/base conflict to CI remediation.
    - `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` `ties deferred sweep and docs reuse to the recorded feature code state` fails on imported feature code reusing stale completion evidence or base-only integration needlessly repeating covered work.

<!-- bkit:task 7 end -->

### Earlier tasks this group depends on

- TASK 1 (group 1, done): Reconcile the remote feature branch before base classification and publish code with CI — `.bkit/core/engine/commands/workflow/branches.ts`, `.bkit/core/engine/commands/workflow/branches.test.ts`, `.bkit/core/engine/commands/workflow/worktrees.integration.test.ts`
- TASK 2 (group 1, done): Fetch ship branches during setup and reject inherited unpublished dev work — `.bkit/core/engine/commands/workflow/worktrees.ts`, `.bkit/core/engine/commands/workflow/branches.ts`, `.bkit/core/engine/commands/workflow/worktrees.test.ts`, `.bkit/core/engine/commands/workflow/branches.test.ts`
- TASK 3 (group 1, done): Qualify the merged-on-entry shortcut against current feature work — `.bkit/core/engine/commands/workflow/prs.ts`, `.bkit/core/engine/commands/workflow/prs.test.ts`
- TASK 4 (group 1, done): Guard ship cleanup with one shared landed-content comparison — `.bkit/core/engine/commands/workflow/worktrees.ts`, `.bkit/core/engine/commands/workflow/branches.ts`, `.bkit/core/engine/commands/workflow/workflows.ts`, `.bkit/core/engine/commands/workflow/workflows.test.ts`, `.bkit/core/engine/commands/workflow/branches.test.ts`, `.bkit/core/engine/commands/workflow/worktrees.integration.test.ts`

### Derived Test Matrix rows

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| Treat newer work after a merged PR as unshipped while retaining the unchanged-branch shortcut | Unit | `.bkit/core/engine/commands/workflow/prs.test.ts` | 3 |
| Refuse merged-entry eligibility when current feature evidence is unavailable | Unit | `.bkit/core/engine/commands/workflow/prs.test.ts` | 3 |
| Apply merged-entry eligibility to scoped MCP PR facts when gh is unavailable | Unit | `.bkit/core/engine/commands/workflow/prs.test.ts` | 3 |
| Refuse green CI when current dev is absent from the validated integration head | Unit | `.bkit/core/engine/commands/workflow/runs.test.ts` | 5 |
| Keep bookkeeping carry-forward and CI override from waiving fresh-dev ancestry | Unit | `.bkit/core/engine/commands/workflow/runs.test.ts` | 5 |
| Scope foreign-repository base evidence to that repository | Unit | `.bkit/core/engine/commands/workflow/runs.test.ts` | 5 |
| Refuse a PR gate when scoped base evidence is unavailable | Unit | `.bkit/core/engine/commands/workflow/runs.test.ts` | 5 |
| Apply the stale-base decision to scoped MCP facts despite green CI | Unit | `.bkit/core/engine/commands/workflow/runs.test.ts` | 5 |
| Classify a pinned-head merge refusal as revalidation when the reread head moved | Unit | `.bkit/core/engine/commands/workflow/prs.test.ts` | 6 |
| Classify a merge refusal with a new dev conflict as integration | Unit | `.bkit/core/engine/commands/workflow/prs.test.ts` | 6 |
| Give other merge refusals an explicit terminal reason without CI code remediation | Unit | `.bkit/core/engine/commands/workflow/prs.test.ts` | 6 |
| Apply the same moved-head and conflict decisions to independent MCP post-attempt facts | Unit | `.bkit/core/engine/commands/workflow/prs.test.ts` | 6 |
| Route reconciliation and CI-running publication before bookkeeping on every ship path | Unit | `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` | 7 |
| Route stale bases and moved-head refusals through one bounded attempt counter | Unit | `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` | 7 |
| Pass the recorded merge target and defer deletion to guarded close | Unit | `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` | 7 |
| Feed MCP fallback facts through engine safety decisions, retain transport accounting and refuse missing facts | Unit | `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` | 7 |
| Reuse deferred-sweep/docs completion only for the feature code state it covered | Unit | `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` | 7 |

## Deviations

Resume bkit-build #842 from the existing worktree and finish it.
