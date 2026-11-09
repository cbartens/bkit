# Brief: group 2 — Revalidate concurrent changes and route refusals safely

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
  - TASK 5: Enforce fresh dev ancestry at the pre-merge gate — done
  - TASK 6: Distinguish moved-head and base-conflict merge refusals — done
  - TASK 7: Wire reconciliation and bounded retry routes across the ship workflow and resolver — done
  - TASK 8: Synchronize documentation, compiled output and provider renders — open

## The work

<!-- bkit:task 8 start -->

- [ ] **TASK 8:** Synchronize documentation, compiled output and provider renders
  - **UPDATE:** `.bkit/core/.bkit/workflows.md`: document the final reconciliation and retry flow, cleanup ownership, retained-remote behavior and residual API timing limit, including the separate repository-managed automatic deletion boundary.
  - **UPDATE:** `.bkit/core/.bkit/prompts.md`: document the conflict resolver's merge-target input.
  - **UPDATE:** `.bkit/core/.bkit/cli.md`: regenerate the command reference from final specs with `pnpm cli:sync`.
  - **UPDATE:** `docs/testing.md`: record the added Unit and Integration regression coverage in the existing ship section.
  - **UPDATE:** `docs/observability.md`: document final refusal codes, snapshot fields and preservation diagnostics.
  - **READ:** `package.json`: use existing build, upgrade, format, instructions-sync and test commands.
  - **DEPENDS ON:** 7
  - **DONE WHEN:** All Documentation Updates rows are reflected on disk, `pnpm build` and `pnpm cli:sync` succeed, one source upgrade regenerates every configured provider mirror, source/render parity checks pass, and compiled output contains the final engine behavior. Inspect the fresh scratch-consumer footprint through `node dist/cli.js` without network publication.
  - **TEST FIRST:** n/a — documentation and regenerated artifacts only; behavior tests belong to Tasks 1–7.

<!-- bkit:task 8 end -->

## Deviations

Resume bkit-build #842 from the existing worktree and finish it.
