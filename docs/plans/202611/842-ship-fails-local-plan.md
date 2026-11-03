<!-- bkit:anchor
baseSha: 71951f2f2372e3fe4d752e33f0947391eff7609b
baseRef: origin/dev
bkitVersion: 6.0.0
bkitLatest: 6.0.0
-->

Verdict: PASS
<!-- verdict:end -->

# Ship branch reconciliation Implementation Plan

> [!CAUTION]
> **Purpose:** The implementation plan: pre-flight checks, gates, the runbook, verification and rollback.

## Context & Goals

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

## 👤 ⚠️ Acceptance Scenario

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

### Derived Test Matrix

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
| Real command wiring preserves remote-only and local-only work through feature reconciliation | Integration | `.bkit/core/engine/commands/workflow/worktrees.integration.test.ts` | 1 |
| Real close wiring preserves a newer remote tip, including an advance after the safety proof and a disappeared/recreated ref | Integration | `.bkit/core/engine/commands/workflow/worktrees.integration.test.ts` | 4 |
| Compiled output and every provider render match the updated source contract | Static | `.bkit/core/.bkit/workflows.md` | 8 |

### 👤 ✅ Human Confirmation

- [ ] **Acceptance Scenario confirmed:** I have reviewed the testable contract.

## 👤 ⚠️ Breaking Changes & Naming Review

No package, database, public API or file renames. New opt-in flags and additive output fields belong to existing workflow commands; the implementation selects unused exit codes from each command's registry and documents them together with their routes. Generic probe, sync and merge callers preserve their current behavior unless they opt into the ship contract.

Ship now refuses inherited unpublished `dev` commits before publication, can open a fresh PR after a prior PR merged, and may retain a branch/worktree after a successful ship when it still holds work absent from `dev`. These are deliberate safety changes. The shared comparison moves from `branches.ts` to `worktrees.ts`, with the old implementation deleted and all importers updated.

Local branch deletion must compare against the exact inspected tip atomically. A remote branch is retained and reported when an equivalent conditional deletion cannot be enforced under the merge-only/no-force-push policy, even when its inspected work is landed. Repository-managed automatic head deletion is a separate GitHub policy; this change does not alter that setting or claim to control it.

### 👤 ✅ Human Confirmation

- [ ] **Breaking Changes confirmed:** I have reviewed every breaking change and naming decision.

## 👤 ⚠️ Open Questions & Assumptions

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

### 👤 ✅ Human Confirmation

- [ ] **Open Questions & Assumptions confirmed:** I have resolved or accepted the questions and assumptions.

## Alternative Approaches & Recommendations

Extend the existing engine verbs. Keep feature reconciliation opt-in for ship so other callers of `branches sync` preserve their contract. Reuse Git's fetch, ancestry, fast-forward and merge operations, the existing conflict classifier, and the current bounded merge counter. Stop rather than guess when Git or the transport cannot establish the required facts.

Reject moving the fix solely into `addWorktree`: ship can adopt or resume a checkout, and reconciliation must also run after remote movement. Reject rebases and force-pushes because they break the existing merge-only contract. Keep repository protection and a global merge queue as alternative policies, not requirements of this portable workflow change.

## Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why `Exempt` | Where it belongs |
| --- | --- | --- |
| Skip full CI for docs-only `dev` movement | Correctness is met by re-integrating and revalidating every stale base; this optimization changes the skip-token contract and is an explicit issue non-goal. | Separate issue if requested; ledger `842-docs-only-dev-movement-ci-optimization`. |
| Cloud Actions concurrency group | A cloud-only queue does not implement cross-runtime branch safety and is an explicit issue non-goal. | Existing cloud concurrency work; ledger `842-cloud-concurrency-queue-non-goal`. |

Semantic conflict resolution remains the existing resolver's handover behavior; this plan adds no new excluded work or deferral for it.

## Suggested Scope Expansion

<!-- prettier-ignore -->
| Candidate | Source | Overlaps | Recommendation |
| --- | --- | --- | --- |
| Recover a FAILED record when a cloud runtime cannot push `dev` | `docs/deferrals.jsonl` key `639-refused-ship-failed-record-lost-in-cloud-container` | Ship close and handover publication | Keep separate; it changes failure-record transport rather than branch reconciliation. |
| Generated-file CI fix-round changes | Related issue #800 from input | Step 10 retry routes | Keep separate; preserve existing regenerate and red-CI handling. |
| Build test locking and missing-proof handling | Related issue #801 from input | Workflow task execution only | Keep separate; it is unrelated to ship's Git state. |
| Failed-record publication after a cloud merge | `docs/failures.jsonl` key `ship-cloud-failure-path-after-merge-has-no-publish-channel` | Close and handover publication | Keep with the existing failed-record transport candidate. |
| Cloud bookkeeping across live runtime modes | `docs/deferrals.jsonl` key `384-mode-3-bookkeeping-e2e-deferred-to-341-live-run` | Close across runtimes | Keep the broader live-runtime exercise separate from the deterministic cleanup tests. |
| Required checks and server-side merge serialization | `docs/deferrals.jsonl` keys `384-required-status-checks-on-dev-via-bkit-protect-main`, `384-merge-queue-unavailable-private-non-enterprise` | Residual base race | Keep as owner policy candidates without making them prerequisites. |
| Cloud queue eviction and duplicate dispatch | `docs/deferrals.jsonl` keys `397-ship-lane-reconciler-for-depth-1-queue-eviction`, `397-dual-agent-same-run-double-ship-when-both-secrets-set` | Concurrent ships | Keep under the excluded cloud concurrency work. |
| Capability-register drift at the squash commit | `docs/failures.jsonl` key `capability-register-drift-shipped-by-pr-708-reds-dev-capstone` | Generated output and post-merge capstone | Recheck current state before proposing work; the related enforcement deferral is closed. |
| Distributed-consumer workflow rollback | `docs/deferrals.jsonl` key `per-workflow-rollback-path-for-shipped-bkit-workflow-changes` | Rollout and rollback | Keep separate from this repository's revert recipe. |

## Security & Privacy

- [x] **User Input:** Validate any new branch/ref argument in command handlers and pass subprocess arguments as arrays. Fetch only the named feature ref and scoped `dev`; refuse detached or shared branches.
- [x] **Role-Gated Mutation:** Keep existing repository authorization, dev-only merge guard, pinned PR head, and explicit empty squash body. Do not broaden token scope.
- [x] **PII:** Diagnostics name commit identifiers and repository-relative paths; no credentials or fetched file contents enter status or errors.
- **Other template rows:** None — no new API routes, database writes, redirects, webhooks or secrets. Preserve work on failed or uncertain checks; never rebase or force-push the feature.

## Pre-Flight / Dependencies

### Core

- [x] **Package Management:** Existing `package.json` and `pnpm-lock.yaml` are available; this plan introduces no dependencies.
- [x] **Dependency Versions:** Ran `pnpm bkit:deps:outdated`; it reported newer `oxlint`, `oxlint-tsgolint`, `@types/node` and `vite` with diagnostic exit 1. Node `24.16.0`, pnpm `10.34.7`, Git `2.56.0`, and gh `2.102.0` are installed. No listed update blocks the planned Git/CLI changes.
- [x] **Existing-Solution Search (reuse over duplicate):** The Reuse Inventory records all owners and searches.
- [x] **User Context:** Required source and issue inputs are accessible. The issue supplies proposed answers that apply unless overridden.
- [x] **Project Context:** Folded the decisions, knowledge, deferrals and failures by key and timestamp. Applicable decisions include local merge-only integration and the shared bookkeeping-push allow-list. The narrow knowledge search found no matching active row; the source and broad ledger read supplied corroborating evidence.
- [x] **Testing & Quality:** Use Unit tests with real temporary Git repositories and the existing external-command fixture harness, plus Integration tests for command wiring. No deployed application exists.
- [x] **Prerequisite Plans:** None. Existing merge integration and CI-token safeguards are present in the checked-out source.

### Conditional

- [x] **Architecture & UI:** Extend the existing workflow command modules and shipped workflow source; there is no UI.
- [x] **Observability:** Read `docs/observability.md`; extend the existing `[bkit-*]` errors, structured output, snapshots and refusal records.
- **Secrets & Env Vars / Schema State / Notifications:** Not applicable; no new credentials, database, notification channel or service-account role.

### 🔒 Gate 1: Prerequisites Check

- [ ] **Acceptance Scenario confirmed:** The owner has confirmed the contract above.
- [ ] **Breaking Changes confirmed:** The owner has confirmed the names and behavior changes.
- [ ] **Open Questions confirmed:** The owner has accepted or overridden the defaults above.
- [ ] **Security & Privacy checked:** Applicable safeguards are verified.
- [ ] **Reuse Inventory complete:** Every capability has recorded searches and an existing owner.
- [ ] **Reuse reasons:** Every new file has a justified NEW row; none is currently proposed.
- [ ] **Gate 1 — Verified:** Every Core and applicable Conditional item is checked.

## Data Schema Integration

No database or persisted application schema changes. Existing structured CLI output and status snapshot fields are extended additively, with workflow readers updated together.

### Data Schema Usage

None.

### Data Schema Changes

None.

## Reuse Inventory

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| Feature reconciliation and CI-running publication | `.bkit/core/engine/commands/workflow/branches.ts` | Serena `find_symbol(syncVerb)` in generation; `rg -n -m 10 'syncVerb\|mergeDev\|pushPlain\|require-ci' .bkit/core/engine/commands/workflow/branches.ts`; read command specs and merge body; searched `docs/capabilities.md` | `syncVerb`, `mergeDev`, `fastForwardVerb`, `pushPlain`, Git fetch/merge built-ins | EXTEND | Parameterize the existing merge target and reuse settlement; add a ship opt-in rather than another synchronizer. |
| Early ship setup safety | `.bkit/core/engine/commands/workflow/worktrees.ts` | `rg -n -m 10 'addWorktree\|inheritedDevCommits\|fetchBranch\|switch' .bkit/core/engine/commands/workflow/worktrees.ts`; read setup and fetch paths | `fetchBranch`, `inheritedDevCommits`, `inheritedDevRefusal` | EXTEND | Fetch before ship adoption and extend the existing inherited-work refusal to each publication candidate without changing build's base selection. |
| Merged-PR qualification and refusal classification | `.bkit/core/engine/commands/workflow/prs.ts` | Serena `find_symbol(mergePr)` in generation; `rg -n -m 10 'probePr\|expect-merged\|match-head' .bkit/core/engine/commands/workflow/prs.ts`; read probe and merge body/specs | `probePr`, `mergePr`, `prOutput`, `PrInfo` | EXTEND | Add opt-in ship qualification and explicit refusal outcomes to existing outputs. |
| Shared tree-entry-equivalence cleanup | `.bkit/core/engine/commands/workflow/worktrees.ts` | `rg -l --hidden 'notOnDev\|inheritedDevCommits\|deleteBranch' .bkit/core/engine/commands/workflow --glob '*.ts'`; `rg -n -m 15 'notOnDev\|inheritedDevCommits\|deleteBranch\|function removeWorktree' .bkit/core/engine/commands/workflow/worktrees.ts .bkit/core/engine/commands/workflow/branches.ts` | `notOnDev` currently in `branches.ts`; `deleteBranch`, `removeWorktree`; Git tree-entry and expected-old-ref primitives | EXTEND | Move and tighten the existing comparison, including mode/type and conditional local deletion; retain remote refs when safe conditional deletion is unavailable. |
| Guarded-close reporting and lock release | `.bkit/core/engine/commands/workflow/workflows.ts` | `rg -n -m 5 'workflows close\|removeWorktree\|cleanup' .bkit/core/engine/commands/workflow/workflows.ts` | Existing close call to `removeWorktree` and `RemoveResult` | EXTEND | Report retained branches through the existing close result while completing record landing and lock release. |
| Fresh-base merge gate | `.bkit/core/engine/commands/workflow/runs.ts` | Serena `find_symbol(runGate)` in generation; `rg -n -m 10 'runGate\|onlyBookkeeping\|snapshot\|runRevalidate' .bkit/core/engine/commands/workflow/runs.ts`; read gate, snapshot and revalidation | `runGate`, `onlyBookkeeping`, current foreign-repo compare API | EXTEND | Enforce the ancestry fact currently written only to the snapshot; keep same-repo and foreign-repo reads scoped correctly. |
| Portable workflow routes and conflict continuation | `.bkit/core/workflows/bkit-ship.md` | `rg -n -m 10 'ENTRY_HEAD\|branches sync\|ship.merge\|expect-merged' .bkit/core/workflows/bkit-ship.md`; read Steps 2–4 and 10 | Existing Steps 2–5, 9–10 and `bkit-ship-conflict-resolve` | EXTEND | Route engine outcomes and pass the actual merge target through the existing resolver. |
| Recorded merge-target continuation | `.bkit/core/prompts/bkit-ship-conflict-resolve.md` | `rg -n -m 6 'merge\|target\|sentinel' .bkit/core/prompts/bkit-ship-conflict-resolve.md` | Existing merge-state verification and auto-resolver command | EXTEND | Accept and verify the engine's actual merge target in the existing resolver. |
| MCP evidence and deterministic safety classification | `.bkit/core/engine/commands/workflow/prs.ts`, `.bkit/core/engine/commands/workflow/runs.ts`, `.bkit/core/workflows/bkit-ship.md` | `rg -n -m 15 'runtimeGithubCli\|transport-row\|exit 80\|Fallback\|fallback' .bkit/core/workflows/bkit-ship.md`; `rg -n -m 8 'MergeInput\|MergeResult\|export.*probePr\|function probePr' .bkit/core/engine/commands/workflow/prs.ts` | Existing probe/merge/gate handlers and transport-fallback records | EXTEND | Validate scoped fact artifacts through the same engine decisions; an unavailable fact stops mutation rather than delegating a safety judgment to the model. |
| Command regression evidence | `.bkit/core/engine/commands/workflow/branches.test.ts`, `.bkit/core/engine/commands/workflow/worktrees.test.ts`, `.bkit/core/engine/commands/workflow/prs.test.ts`, `.bkit/core/engine/commands/workflow/workflows.test.ts`, `.bkit/core/engine/commands/workflow/runs.test.ts` | `rg -l --hidden 'describe\(\|makeRepo\|bare\|stub\|fixture'` scoped to these five exact files; `rg -n -m 2 'describe\(\|makeRepo\|bare\|stub\|fixture'` on the same files; read `docs/testing.md` § Ship merge-gate + bookkeeping test coverage | Existing temporary Git repositories and PATH-based gh fixtures | EXTEND | Add discriminating behavior regressions and retain generic probe/merge, docs-policy merge and standalone removal compatibility assertions in their existing suites. |
| Integration and workflow routing evidence | `.bkit/core/engine/commands/workflow/worktrees.integration.test.ts`, `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` | `rg -l --hidden 'describe\(\|makeRepo\|bare\|stub\|fixture'` and `rg -n -m 2 'describe\(\|makeRepo\|bare\|stub\|fixture'` scoped to these two exact files | Bare-origin command fixtures and source workflow invariants | EXTEND | Exercise real ref preservation and assert provider/fallback producers and consumers without a new test framework. |

## Architecture & Component Changes

**Ledger rows:** `842-ship-reconciles-feature-before-base-check`, `842-ship-revalidates-moving-base-before-merge`, `842-ship-preserves-unlanded-work`, `842-ship-mcp-facts-use-engine-safety-decisions`, `842-docs-only-dev-movement-ci-optimization`, `842-cloud-concurrency-queue-non-goal`.

### Database Migrations

None.

### Ship engine and workflow

#### [MODIFY] `.bkit/core/engine/commands/workflow/branches.ts`

- **Existence Check:** Opened `syncVerb`, `mergeDev`, push specs and `notOnDev` this session.
- Add an opt-in feature branch reconciliation mode to sync. Fetch its explicit remote ref, distinguish missing remote branches from fetch errors, fast-forward behind branches and merge divergence using the same mechanical settlement. Preserve old behavior without the opt-in.
- Resolve classification from the resulting local code head. Return both the observed remote head and reconciled head so the workflow can refresh `ENTRY_HEAD` and `CODE_HEAD` consistently.
- Publish local-only code before bookkeeping with CI running on both paths. Reuse `--require-ci` semantics where suitable; a skip-token head carrying unpublished code needs an ordinary trigger commit, not a loosened hook.
- Generalize merge continuation to remember and verify its target. A feature merge already in progress must complete before a merge of `origin/dev` starts.
- Recheck inherited unpublished dev work against each freshly fetched remote candidate and the resulting reconciled head before publication; a setup-time proof expires when either candidate changes.

#### [MODIFY] `.bkit/core/engine/commands/workflow/worktrees.ts`

- **Existence Check:** Opened setup, adoption, inherited-work and removal paths this session.
- Fetch the ship feature ref before adoption and before the no-PR route can publish. Check inherited unpublished `dev` commits on local, fetched remote and reconciled candidates in created, resumed and adopted ship modes, with commit identifiers and a truthful ship-specific recovery message. Reconciliation and retry callers reuse the same check before publishing a changed candidate.
- Own the shared tree-entry-equivalence helper moved from branches. Cover tracked deletions, additions/changes, entry mode and object type as well as content, retaining ledger union semantics. Exercise design/plan land through the same helper and keep squash-equivalent clean branches eligible.
- Refresh and inspect both local and remote feature tips before cleanup. Keep the worktree or branch when unlanded or dirty work exists, or safety cannot be established; report preserved paths/refs.
- Bind local deletion atomically to the exact inspected commit identifier, using Git's expected-old-ref operation rather than a second read followed by unconditional deletion. A changed, disappeared or recreated ref is preserved/reported. Keep existing worktree-ownership and checked-out-branch protections.
- Bind any remote deletion to its exact inspected tip. Under the existing no-force-push policy, retain and report the remote branch whenever the available transport cannot enforce that condition. Do not replace this with unconditional deletion or a final read; a safe retained branch does not prevent close-record landing or lock release.

#### [DELETE] `notOnDev` in `.bkit/core/engine/commands/workflow/branches.ts`

- Remove the original implementation after moving the tightened shared helper to `worktrees.ts`; design/plan land and ship cleanup import that one implementation.

#### [MODIFY] `.bkit/core/engine/commands/workflow/prs.ts`

- **Existence Check:** Opened `probePr`, `prOutput`, `mergePr` and merge command dispatch this session.
- Add opt-in ship probing that returns no eligible merged PR when the reconciled feature branch holds work beyond that PR's recorded head; preserve open-PR preference and existing generic probe callers.
- After a refused merge, classify a changed head before a conflict with current `dev`; unreadable and other refusals remain explicit terminal reasons. Return distinct retry outcomes/codes without changing existing callers that do not opt in.
- Accept validated, scoped PR fact artifacts from the MCP transport through an additive command input to the same eligibility/refusal decision logic. Require repository, PR identity, base, current head, merged head/state and mergeability as applicable; reject missing, mismatched or unreadable facts. Independently reread post-attempt PR facts before classifying a refused merge.
- Remove eager branch deletion from ship's merge invocation; cleanup owns deletion only after checking landed content.

#### [MODIFY] `.bkit/core/engine/commands/workflow/runs.ts`

- **Existence Check:** Opened `runGate`, `GATE`, snapshot creation and `runRevalidate` this session.
- Add a distinct stale-base refusal for the pre-merge PR gate. Refresh `dev` before comparison, or use the explicitly scoped API for foreign repositories. Compare against the head CI actually validated, so bookkeeping cannot disguise stale code.
- Fail closed on missing/failing base evidence. Emit the observed base, tested head and ancestry with the existing snapshot/refusal record; an override for red CI must not waive the stale-base prerequisite.
- Accept scoped MCP PR/CI/base facts through an additive command input and run the same deterministic gate. Resolve local ancestry through freshly fetched Git refs, or consume independently scoped compare facts for a foreign repository. Missing required evidence produces a refusal before mutation; green CI facts alone never stand in for base ancestry.
- Preserve direct-head and post-merge `--squash-of` behavior. The post-merge capstone remains required and later base movement remains visible in the audit trail.

#### [MODIFY] `.bkit/core/workflows/bkit-ship.md`

- **Existence Check:** Opened relevant route blocks this session.
- Reconcile before no-PR publication and Step 3 classification; route feature conflicts through the existing resolver, publish code before bookkeeping, and remove the late fast-forward as the sole catch-up mechanism.
- A stale-base refusal returns to Step 3; moved-head merge refusal returns to Step 9; a new base conflict returns to Step 3. Record every failed arrival exactly once in `ship.merge`; preserve exhaustion and headless behavior.
- Refresh code and PR head variables after reconciliation/integration and on each retry. Reuse deferred-sweep/docs completion only when its durable evidence covers the same feature-code state. Base-only integration may reuse that evidence; imported local/remote feature code invalidates it and requires the relevant sweep/docs work again before validation. Record the covered feature state alongside completion so resume makes the same decision.
- On exit 80 or `runtimeGithubCli=false`, fetch narrowly scoped MCP facts, record the existing single transport transition and independent reread, write those facts to the run outbox, and return them to the engine's eligibility/gate/refusal classifier. Route its result exactly as the gh-backed result. A fact the transport cannot establish stops before mutation with an explicit reason; a model never decides branch eligibility or reconciliation safety.
- Remove `--delete-branch` from the merge call and route post-merge cleanup through the guarded close.

#### [MODIFY] `.bkit/core/prompts/bkit-ship-conflict-resolve.md`

- **Existence Check:** Opened its merge-state verification and auto-resolver command.
- Accept the engine-recorded merge target and continue that merge; keep the current mechanical-only mandate and clean abort/handover for semantic conflicts.

#### [MODIFY] `.bkit/core/engine/commands/workflow/workflows.ts`

- **Existence Check:** Opened the ship close cleanup call this session.
- Surface guarded cleanup results without reporting an unsafe deletion as success. Keep close record landing and lock release correct when the feature branch must remain.

GitHub's repository-managed automatic head deletion is outside these bkit cleanup calls. Document the setting and its merge-time behavior from official evidence during implementation; do not change repository policy in this work. If the server has already removed the head, report that observed fact and preserve local recovery refs rather than claiming bkit's guard protected the server ref.

The existing adjacent test files and workflow invariant test are modified with their owning tasks. Compiled `dist/` and provider mirrors are regenerated only from source. The documentation paths are listed below.

### Cron Jobs & Scheduled Tasks

None.

## Supersession Inventory

<!-- prettier-ignore -->
| Existing artifact | Replaced by | Decision | Justification |
| --- | --- | --- | --- |
| `notOnDev` implementation in `.bkit/core/engine/commands/workflow/branches.ts` | Shared implementation in `.bkit/core/engine/commands/workflow/worktrees.ts` | DELETE | One content-equivalence implementation serves land and ship cleanup without introducing an import cycle. |

No existing file is superseded. Remove the old implementation when the shared helper is moved.

## Documentation Updates

<!-- prettier-ignore -->
| Doc | Change required |
| --- | --- |
| `.bkit/core/.bkit/workflows.md` | Describe feature catch-up, stale-base retries, fresh-PR handling, safe cleanup, and the residual non-atomic API window; regenerate `.bkit/workflows.md`. |
| `.bkit/core/.bkit/prompts.md` | Describe the resolver's explicit merge target; regenerate `.bkit/prompts.md`. |
| `.bkit/core/.bkit/cli.md` | Regenerate command flags, outputs and exit-code documentation from command specs via `pnpm cli:sync`; regenerate `.bkit/cli.md`. |
| `docs/testing.md` | Extend the existing ship coverage section with the new regressions and real-Git integration flows. |
| `docs/observability.md` | Add stale-base and merge-refusal outcomes, base snapshot evidence and branch-preservation diagnostics. |

No topology, technology, database or UI documentation changes are needed. Existing index rows already cover these documents.

## Rollback Strategy

Code-only — `git revert` sufficient. Revert the implementation and regenerated output together on a new branch. Retained feature branches remain available for recovery; inspect them before running an older ship implementation, whose cleanup lacks these protections. No database, migration or remote environment rollback is involved.

## Agent Execution Runbook

**Integration Shape:** One implementation PR is sufficient. The two groups keep each behavior change and its tests together; task dependencies express build order only.

<!-- bkit:group 1 start -->

### TASK GROUP 1: Reconcile feature work and preserve unpublished changes

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

<!-- bkit:group 1 end -->

<!-- bkit:group 2 start -->

### TASK GROUP 2: Revalidate concurrent changes and route refusals safely

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

<!-- bkit:group 2 end -->

### 🔒 Gate 2: Code Implementation Check

- [ ] **No bolt-on:** Every new capability extends its Reuse Inventory owner.
- [ ] **Extensions landed:** The shared comparison has one implementation and every named caller uses it.
- [ ] **No gate weakened:** Skip-token, pinned-head, base==dev and CI proof checks are retained.
- [ ] **Red before code:** Each named Unit/Integration test was proven red, or recorded as an updated existing test, before its owning task changed logic.
- [ ] **Tests unchanged:** Frozen proof assertions were not weakened or removed.
- [ ] **Unproven tests:** Any exception is owner-committed in its task.
- [ ] **Gate 2 — Verified:** The preceding checks have evidence.

**Mandatory Tasks (Testing & Documentation):** The numbered tasks above own all required test and documentation work. Sweep affected existing tests in each task and verify every matrix row against its owning task's DONE WHEN.

### 🔒 Gate 3: Testing & Documentation Check

- [ ] **Docs updated:** Every Documentation Updates row reflects the final code.
- [ ] **Docs index accurate:** Existing index rows still resolve to their canonical homes.
- [ ] **Gate 3 — Verified:** Documentation and rendered output checks have evidence.

## Verification Plan

### Automated Tests

- [ ] **Unit:** Run the changed command test files and `audits/workflows/ship-invariants.test.ts`; inspect actual ancestry, file content, local and remote refs, command exits and recorded routes.
- [ ] **Integration:** Run `worktrees.integration.test.ts` against its fresh bare origin, with multiple clones simulating cloud and laptop work. No live repository or production branch is mutated.
- [ ] **Full Local Gate Suite:** The build workflow runs `pnpm bkit:gate:static-unit-integration` and `bkit check` through its required gates. No `@live` tier is declared for bkit; existing gh API responses are exercised through its documented fixture boundary.
- [ ] **Test Synchronization:** Update affected generic probe, land, setup, merge, gate and close tests in the task that changes their implementation; keep generic defaults compatible.
- [ ] **Build Configuration:** `tsconfig.json` excludes `**/*.test.ts`; retain that exclusion and verify `pnpm build` produces only runtime code.
- [ ] **Provider parity:** Regenerate configured Claude Code, Cursor, Codex, Antigravity and opencode copies from source and run existing render tests; inspect the new routes and target context in each output.
- [ ] **Scratch consumer:** After `pnpm build`, install into a fresh local scratch consumer, invoke compiled sync/setup/gate/close paths with a bare Git remote and fixture gh, and inspect preserved work and emitted evidence. This required dogfood evidence completes Task 8's DONE WHEN.
- [ ] **Friction re-verification:** Map `.bkit/friction.jsonl` key `ship-bookkeeping-skip-ci-push-blocked-by-open-pr-guard` to Tasks 1/7's CI-running publication checks. Map `harvest/friction.jsonl` keys `ship-step9-dev-ahead-unpushed` and `ship-step9-dev-ahead-slop-blocked-push` to Task 2's inherited-work refusal and ship recovery diagnostics. Read the folded source and report unavailable harvested evidence as unavailable, rather than resolved; the behavior regressions remain required.
- [ ] **Repository deletion boundary:** Verify GitHub automatic head-deletion behavior from official documentation or disposable-repository evidence when a PR head advances around merge. Record that evidence and the existing setting without changing repository policy; distinguish server deletion from guarded bkit cleanup and inspect retained local recovery refs.

### 🔒 Gate 4: Automated Verification Check

- [ ] **Gate 4 — Verified:** Record actual outputs for the applicable automated checks.

### Manual Verification

> [!CAUTION]
> **Owner-run acceptance checks, advisory only.** Unticked boxes block neither plan approval nor merge.

- [ ] **Step 1:** In a disposable consumer, create cloud-only and laptop-only feature commits, run ship, and inspect the remote tree and CI head before merge.
- [ ] **Step 2:** Advance disposable `dev` during validation and confirm the gate requests integration again; repeat until the configured retry limit and confirm the stop explains the cause.
- [ ] **Step 3:** Add a fix after a disposable PR is merged and confirm ship opens a new PR; add another remote fix during close and confirm the branch is preserved.
- [ ] **Step 4:** Inspect the close output and pre/post-merge evidence for later base movement. A client observation cannot substitute for an atomic server merge queue.
