# Brief: group 1 — Reconcile feature work and preserve unpublished changes (tests)

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

- Group 1: Reconcile feature work and preserve unpublished changes — this group
  - TASK 1: Reconcile the remote feature branch before base classification and publish code with CI — open
  - TASK 2: Fetch ship branches during setup and reject inherited unpublished dev work — open
  - TASK 3: Qualify the merged-on-entry shortcut against current feature work — open
  - TASK 4: Guard ship cleanup with one shared landed-content comparison — open
- Group 2: Revalidate concurrent changes and route refusals safely — next
  - TASK 5: Enforce fresh dev ancestry at the pre-merge gate — open
  - TASK 6: Distinguish moved-head and base-conflict merge refusals — open
  - TASK 7: Wire reconciliation and bounded retry routes across the ship workflow and resolver — open
  - TASK 8: Synchronize documentation, compiled output and provider renders — open

## The work

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** Reconcile the remote feature branch before base classification and publish code with CI
  - **UPDATE:** `syncVerb` in `.bkit/core/engine/commands/workflow/branches.ts`: add ship opt-in reconciliation, explicit feature fetch, fast-forward/divergence handling and resulting head outputs; preserve existing default sync callers.
  - **UPDATE:** `mergeDev` in `.bkit/core/engine/commands/workflow/branches.ts`: generalize the merge target and continuation safely, reuse mechanical settlement, and keep code-carrying commits free of skip tokens.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/branches.test.ts`: add the unit regressions below with real temporary Git repositories.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/worktrees.integration.test.ts`: add the reconciliation wiring test using its real bare-origin fixture and command dispatcher.
  - **READ:** `.bkit/core/engine/commands/workflow/runs.ts`: preserve `ENTRY_HEAD`, `CODE_HEAD` and bookkeeping carry-forward semantics when emitting heads.
  - **DONE WHEN:** The named Unit and Integration tests pass; behind/ahead/diverged branches retain all work, unknown refs and fetch failures stop safely, conflicts preserve the correct merge target, and a plain push containing new code has a CI-running head without bypassing hooks.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/branches.test.ts` `fetches the unseen feature head before classifying the base` fails on an unresolved remote-only head.
    - `.bkit/core/engine/commands/workflow/branches.test.ts` `fast forwards the feature before either base path is chosen` fails on a stale local feature tip.
    - `.bkit/core/engine/commands/workflow/branches.test.ts` `merges divergent feature tips without rebasing either side` fails on lost local or remote commits.
    - `.bkit/core/engine/commands/workflow/branches.test.ts` `continues the feature merge before starting a dev merge` fails on the wrong merge target being continued.
    - `.bkit/core/engine/commands/workflow/branches.test.ts` `publishes local code with a CI running head before bookkeeping` fails on a skip-token head carrying unpublished code.
    - `.bkit/core/engine/commands/workflow/branches.test.ts` `refuses feature reconciliation without losing work when fetch or merge fails` fails on a mutation after unavailable evidence or a discarded conflict.
    - `.bkit/core/engine/commands/workflow/worktrees.integration.test.ts` `reconciles cloud and laptop feature commits through the command boundary` fails on either contribution being absent from the published bare-origin branch.

<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->

- [ ] **TASK 2:** Fetch ship branches during setup and reject inherited unpublished dev work
  - **UPDATE:** `.bkit/core/engine/commands/workflow/worktrees.ts`: extend ship setup, adoption, fetch and inherited-work checks with commit identifiers and accurate failure diagnostics; expose the same check to each publication candidate.
  - **UPDATE:** `syncVerb` in `.bkit/core/engine/commands/workflow/branches.ts`: invoke that check on the fetched remote and reconciled heads before any push, including changed candidates on retries.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/worktrees.test.ts`: add the setup regressions below and fix affected existing expectations in this task.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/branches.test.ts`: cover imported unpublished dev ancestry and invalidated eligibility on retry.
  - **DEPENDS ON:** 1
  - **DONE WHEN:** The named Unit tests pass in created, resumed and adopted ship modes; inherited unpublished `dev` commits on local, freshly fetched remote or reconciled tips are refused before any PR or feature push, changed retry candidates are rechecked, a remote-only branch can be adopted, and an independent feature is allowed despite unrelated local `dev` work.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/worktrees.test.ts` `fetches a remote only ship branch before adopting it` fails on a missing tracking ref being reported as dirty work.
    - `.bkit/core/engine/commands/workflow/worktrees.test.ts` `refuses inherited unpublished dev commits in every ship mode` fails on ship accepting inherited local dev work.
    - `.bkit/core/engine/commands/workflow/worktrees.test.ts` `names inherited commits and ship recovery in the refusal` fails on a refusal without the commit identifiers or a ship-appropriate fix.
    - `.bkit/core/engine/commands/workflow/branches.test.ts` `refuses remote feature work that imports unpublished local dev ancestry` fails on a clean local feature publishing forbidden ancestry imported from an ahead or diverged remote tip.
    - `.bkit/core/engine/commands/workflow/branches.test.ts` `rechecks inherited dev work when a retry observes a new feature candidate` fails on a setup-time eligibility proof allowing later forbidden remote work to be published.

<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->

- [ ] **TASK 3:** Qualify the merged-on-entry shortcut against current feature work
  - **UPDATE:** `probePr` in `.bkit/core/engine/commands/workflow/prs.ts`: add an opt-in ship check of the reconciled local and remote feature state against a merged PR's recorded head, retaining open-PR priority and generic probe compatibility; accept validated scoped MCP facts through the same engine decision path.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/prs.test.ts`: add probe regressions and update output expectations together.
  - **DEPENDS ON:** 1, 2
  - **DONE WHEN:** The named Unit tests pass; newer local or remote feature commits produce the no-eligible-PR route for new PR creation, unchanged merged branches retain the shortcut, and unavailable evidence refuses rather than declares the branch shipped. The same decisions hold for scoped MCP facts with gh unavailable, and generic probe defaults retain their existing regression assertions.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/prs.test.ts` `does not adopt a merged PR when the feature has newer work` fails on the old merged PR being returned as eligible.
    - `.bkit/core/engine/commands/workflow/prs.test.ts` `refuses merged entry when current feature evidence cannot be read` fails on unavailable evidence being accepted as already shipped.
    - `.bkit/core/engine/commands/workflow/prs.test.ts` `qualifies MCP merged PR facts against newer feature work without gh` fails on old merged-PR facts bypassing new-PR eligibility or missing scoped facts being accepted.

<!-- bkit:task 3 end -->

<!-- bkit:task 4 start -->

- [ ] **TASK 4:** Guard ship cleanup with one shared landed-content comparison
  - **UPDATE:** `.bkit/core/engine/commands/workflow/worktrees.ts`: own the moved comparison, cover deleted files and Git tree-entry mode/type, inspect fresh local and remote tips and dirty work, and preserve unsafe or uncertain cleanup targets. Delete a local ref only with an atomic expected-tip check; preserve remote refs when conditional deletion cannot be guaranteed within the no-force-push policy.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/branches.ts`: import the shared helper for land and delete its original `notOnDev` implementation.
  - **DELETE:** `notOnDev` in `.bkit/core/engine/commands/workflow/branches.ts`: remove the old implementation after moving it to the worktree module.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/workflows.ts`: surface preservation results while keeping close landing and lock release correct.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/workflows.test.ts`: add close regressions and repair existing cleanup assertions in the same task.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/branches.test.ts`: assert mode/type preservation and shared design/plan land compatibility with squash-equivalent work.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/worktrees.integration.test.ts`: exercise preservation using real local and bare-origin refs.
  - **DEPENDS ON:** 1, 2, 3
  - **DONE WHEN:** The named Unit and Integration tests pass; close preserves unlanded additions, edits, deletions, mode/type changes, ledger rows, dirty work and a newly observed remote tip. A local or remote ref changed, disappeared or recreated after its proof is preserved/reported rather than unconditionally deleted; unsafe remote deletion is skipped with a reason. Squash-equivalent clean branches remain eligible for safe cleanup; land and ship use one comparison implementation with no import cycle, standalone removal retains ownership/dirty-work protections, and record landing/lock release succeed when a branch remains.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/workflows.test.ts` `preserves newer feature work when closing an already merged PR` fails on the branch containing the newer fix being deleted.
    - `.bkit/core/engine/commands/workflow/workflows.test.ts` `preserves unlanded file deletions and ledger additions on close` fails on content missing from dev being treated as landed.
    - `.bkit/core/engine/commands/workflow/workflows.test.ts` `preserves dirty work and uncertain branch evidence during close` fails on cleanup discarding work or interpreting a failed read as safety.
    - `.bkit/core/engine/commands/workflow/worktrees.integration.test.ts` `keeps a newer remote feature tip while closing the landed local tip` fails on deletion of a remote-only fix, including an advance after the safety proof and a disappeared/recreated remote ref in the real bare-origin fixture.
    - `.bkit/core/engine/commands/workflow/workflows.test.ts` `preserves a local feature ref changed after its cleanup proof` fails on an unconditional delete removing the changed ref instead of the expected-tip operation refusing it.
    - `.bkit/core/engine/commands/workflow/branches.test.ts` `preserves unlanded executable bit changes in the shared landed comparison` fails on identical blob bytes hiding an unlanded executable mode.
    - `.bkit/core/engine/commands/workflow/branches.test.ts` `preserves unlanded file type changes in the shared landed comparison` fails on identical blob bytes hiding a regular-file/symlink type change.
    - `.bkit/core/engine/commands/workflow/branches.test.ts` `uses tree entry equivalence for design and plan land cleanup` fails on the land caller deleting mode/type work while still allowing squash-equivalent clean entries through the shared helper.

<!-- bkit:task 4 end -->

### Derived Test Matrix rows

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| Fetch an unseen remote feature head before resolving the base-check head | Unit | `.bkit/core/engine/commands/workflow/branches.test.ts` | 1 |
| Fast-forward a behind feature before choosing either base path | Unit | `.bkit/core/engine/commands/workflow/branches.test.ts` | 1 |
| Merge divergent feature tips while retaining both contributions and merge-only history | Unit | `.bkit/core/engine/commands/workflow/branches.test.ts` | 1 |
| Continue the recorded feature merge before starting a dev merge | Unit | `.bkit/core/engine/commands/workflow/branches.test.ts` | 1 |
| Publish local code with a CI-running head before bookkeeping on both paths | Unit | `.bkit/core/engine/commands/workflow/branches.test.ts` | 1 |
| Preserve work and refuse mutation when feature fetch or merge evidence fails | Unit | `.bkit/core/engine/commands/workflow/branches.test.ts` | 1 |
| Fetch an unseen remote-only branch before ship adoption | Unit | `.bkit/core/engine/commands/workflow/worktrees.test.ts` | 2 |
| Refuse inherited unpublished dev commits in created, resumed and adopted ship modes | Unit | `.bkit/core/engine/commands/workflow/worktrees.test.ts` | 2 |
| Name inherited commit identifiers and ship-appropriate recovery in refusals | Unit | `.bkit/core/engine/commands/workflow/worktrees.test.ts` | 2 |
| Refuse remote work that imports unpublished local-dev ancestry before reconciliation can publish it | Unit | `.bkit/core/engine/commands/workflow/branches.test.ts` | 2 |
| Recheck inherited-dev eligibility when a retry observes a different remote or reconciled tip | Unit | `.bkit/core/engine/commands/workflow/branches.test.ts` | 2 |
| Treat newer work after a merged PR as unshipped while retaining the unchanged-branch shortcut | Unit | `.bkit/core/engine/commands/workflow/prs.test.ts` | 3 |
| Refuse merged-entry eligibility when current feature evidence is unavailable | Unit | `.bkit/core/engine/commands/workflow/prs.test.ts` | 3 |
| Apply merged-entry eligibility to scoped MCP PR facts when gh is unavailable | Unit | `.bkit/core/engine/commands/workflow/prs.test.ts` | 3 |
| Preserve newer feature work when closing an already merged PR | Unit | `.bkit/core/engine/commands/workflow/workflows.test.ts` | 4 |
| Preserve unlanded file deletions and ledger additions during close | Unit | `.bkit/core/engine/commands/workflow/workflows.test.ts` | 4 |
| Preserve dirty work and uncertain branch evidence during close | Unit | `.bkit/core/engine/commands/workflow/workflows.test.ts` | 4 |
| Preserve a local ref that changes after its safety proof and before deletion | Unit | `.bkit/core/engine/commands/workflow/workflows.test.ts` | 4 |
| Preserve an unlanded executable-bit change despite identical blob contents | Unit | `.bkit/core/engine/commands/workflow/branches.test.ts` | 4 |
| Preserve an unlanded regular-file/symlink type change despite identical blob contents | Unit | `.bkit/core/engine/commands/workflow/branches.test.ts` | 4 |
| Apply the shared tree-entry comparison to design/plan land and allow squash-equivalent clean work | Unit | `.bkit/core/engine/commands/workflow/branches.test.ts` | 4 |
| Classify a pinned-head merge refusal as revalidation when the reread head moved | Unit | `.bkit/core/engine/commands/workflow/prs.test.ts` | 6 |
| Classify a merge refusal with a new dev conflict as integration | Unit | `.bkit/core/engine/commands/workflow/prs.test.ts` | 6 |
| Give other merge refusals an explicit terminal reason without CI code remediation | Unit | `.bkit/core/engine/commands/workflow/prs.test.ts` | 6 |
| Apply the same moved-head and conflict decisions to independent MCP post-attempt facts | Unit | `.bkit/core/engine/commands/workflow/prs.test.ts` | 6 |
| Real command wiring preserves remote-only and local-only work through feature reconciliation | Integration | `.bkit/core/engine/commands/workflow/worktrees.integration.test.ts` | 1 |
| Real close wiring preserves a newer remote tip, including an advance after the safety proof and a disappeared/recreated ref | Integration | `.bkit/core/engine/commands/workflow/worktrees.integration.test.ts` | 4 |
