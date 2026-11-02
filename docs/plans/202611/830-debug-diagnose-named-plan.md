# Diagnose a named red CI run before rerunning local tests — Implementation Plan

> **Purpose:** Implement evidence-first debugging while preserving branch safety, explicit reproduction requests, and the final check on CI.
> **Rules:** Follow `.agents/rules.md`, `docs/templates/bkit-plan.md`, and the applicable sections of `.bkit/authoring.md`. This comment is the implementation plan; its task markers are inputs to the build workflow.

**Related issue:** [#830 — Debug: diagnose a named red CI run before rerunning local tests](https://github.com/cbartens/bkit/issues/830).

**Revision:** Addresses the review's six concerns: workflow selection, branch alignment, resume state, unavailable evidence, `[repro]`, and reproducible verification. Reuses the existing `bkit.testing.ciWorkflow` setting. No implementation has been performed or tests claimed as passing by this plan update.

## Context & Goals

A known red continuous integration (CI) run is evidence of a failure even when every local test passes. Debug should collect that evidence and diagnose it before running local gates. A gate is a consumer-declared package script that runs a set of checks. Local gates check a fix; the CI run on the pushed commit proves whether a CI-only failure was resolved.

Keep the existing local discovery path when a successful lookup establishes that there is no relevant red run, or the owner explicitly chooses `[local]`. An unavailable lookup is not a successful lookup with no failures.

## Acceptance Scenario

### Narrative

The owner runs `/bkit-debug #N`, optionally naming an existing branch, a run, or a pull request (PR). Debug resolves the relevant CI evidence, verifies that it belongs to the branch under repair, and diagnoses its logs before local tests. After remediation, debug runs the smallest declared gate covering the failed tiers and checks CI on the pushed commit before reporting success.

### Success Criteria

1. A selected red run reaches Fetch Context and Diagnose with logs for that exact repository, run, attempt and commit, without a discovery gate running first.
2. A newer successful run from an unrelated workflow cannot hide the configured CI workflow's failure. Missing tools, inaccessible logs and mismatched evidence cannot produce a clean outcome.
3. Debug edits only the adopted branch after validating its relationship to the selected run or PR. Resume retains the selected evidence and its progress; an explicit change cannot reuse a previous selection's fix or reproduction.
4. `[local]` explicitly replaces saved CI selection, and `[repro]` still requests a failing regression test before remediation. Post-fix local checks use declared gates and preserve `[live=off]`.
5. Completion requires the existing pushed-head CI gate and verification of the selected workflow when it differs from that gate. A new red result reports the new run and does not close as fixed.

### Process Sketch

- **WHEN** the owner names a branch → validate it and adopt it through the existing worktree path.
- **WHEN** CI evidence is selected → validate its branch and identity, record a CI failure round, and fetch its logs.
- **IF** `[repro]` is present → run Failure Reproduce after fetching evidence and before remediation.
- **WHEN** a fix for the current selection is complete → run local checks, then the existing summary, push and close sequence.
- **IF** evidence cannot be read or aligned → preserve the reference and stop with the missing information; do not substitute a local pass.
- **WHEN** the pushed commit passes the required CI checks → report both the original red run and the verifying green run.

### Concrete Example

Use a scratch checkout with the existing branch belonging to [#748 — Brand every consumer-facing script, check and style name bkit-*](https://github.com/cbartens/bkit/issues/748). Supply that exact existing branch with `branch=<actual-branch>` and explicitly pin [run 41405235221](https://github.com/cbartens/bkit/actions/runs/41405235221).

The first test-round artifact identifies the red run; it contains no invented local test result. Fetch Context contains the selected attempt's `fatal: invalid object name 'v6.0.0'` failures. Diagnosis cites those logs. If the branch already contains the fix, diagnosis reports that fact rather than manufacturing another change. This historical replay proves selection and diagnosis only; Task 10 separately verifies the complete fix-to-CI sequence with controlled fixtures.

## Selection and State Contract

### Reference precedence

Apply these rules in order:

1. `[local]` is an explicit override, including on resume and when run or PR references are also present.
2. A run reference in the prompt wins over a PR reference in the prompt.
3. With no prompt reference, retain an active run's saved selection, including a saved explicit local choice. Do not rediscover a newer run during an ordinary resume.
4. For a fresh selection, use a run reference, then a PR reference, from the issue's current description and human comments produced by `issues text`. Generated workflow comments do not supply references.
5. Otherwise, discover on the adopted branch using the existing `readBkitConfig(root).ciWorkflow`, sourced from `package.json` `bkit.testing.ciWorkflow`.

Two distinct references of the winning kind and source are ambiguous. Stop and request one reference. Ignore lower-priority references when a higher-priority source wins. Validate numeric IDs and repository identity. A named URL into another repository is a reported mismatch, not an ignored token followed by unrelated branch discovery. `[local]` intentionally overrides those references.

### CI lookup

- Use the existing GitHub transport in `runs.ts`. Workflow prose remains provider-neutral and log retrieval remains in the consumer's context block; this change adds no CI provider framework.
- Branch discovery lists the configured workflow's completed runs on the adopted branch, taking the newest one. The query includes the workflow selector. A successful unrelated workflow cannot mask the result.
- A PR lookup resolves its head repository, branch and commit first, then selects the configured workflow's run at that head. Do not copy `runContext`'s unfiltered five-run lookup unchanged.
- An explicit run identifies its workflow from the run metadata and retains it as the verification target, even if it differs from the configured workflow.
- Red conclusions are `failure`, `timed_out` and `startup_failure`. Capture the run attempt. An `/attempts/<n>` URL pins that attempt; otherwise select and freeze the attempt returned by the lookup. Job and log reads use that same attempt.
- For automatic branch discovery, a successfully read green, cancelled, skipped or empty result selects local discovery. An in-progress run does not displace the latest completed run of that workflow.
- An explicitly named run or PR with no completed red run is reported to the owner; it does not silently select local discovery. The owner can choose `[local]`.
- A network, authentication, scope, pagination, parsing or tool failure is unavailable evidence. Return the existing MCP fallback signal when appropriate. If the mapped read fallback cannot obtain the evidence, stop as blocked.
- Paginate failed jobs to completion. A truncated or failed page is partial evidence, not a complete failed-job list.

### Branch alignment

`branches parse` reads `branch=<name>` or a whitespace-delimited token containing `/` that is a valid existing local or `origin/` branch. URLs are excluded. An explicit missing branch stops; two existing candidates stop. Debug still creates no branch and refuses `main`.

After worktree adoption and before any test or source edit, compare the selected evidence's repository and head branch with the adopted branch. An explicit branch and run or PR that disagree stop with both identities. A run or PR reference alone does not silently change the adopted branch: tell the owner the required branch selector when they differ. A pre-existing worktree on another branch also stops rather than overriding the requested branch. Fork-head repositories and deleted or unavailable branches stop with a precise mismatch explanation.

Compare the selected run commit with the adopted branch head. Equal is current. An older commit is usable only after proving it is an ancestor; narrate that it is historical evidence and check whether intervening commits already fix the cause. A divergent commit, or unavailable ancestry because history is missing, blocks remediation until resolved. Do not label every unequal commit as merely older.

### Atomic saved selection

Store one validated `ciSelection` object on `workflow-meta`, rather than independent `ciRun` and `redTiers` fields:

```json
{
  "mode": "ci",
  "provider": "github",
  "repo": "owner/repo",
  "runId": "123",
  "runAttempt": 1,
  "runUrl": "https://github.com/owner/repo/actions/runs/123/attempts/1",
  "workflowId": "456",
  "workflowPath": ".github/workflows/consumer-ci.yml",
  "headBranch": "feat/example",
  "headSha": "<validated commit id>",
  "conclusion": "failure",
  "redTiers": ["integration"],
  "via": "prompt-run"
}
```

The local variant is `{ "mode": "local", "reason": "explicit-local" }` or a recorded successful discovery reason. The sample commit text is explanatory; validation accepts only a real commit ID. No selection in an older status log means the existing local path until discovery runs.

`status meta --ci-selection-file=<path>` validates and writes the entire selection atomically. The engine adds a monotonically increasing `ciGeneration` within the active debug run when the evidence identity or mode changes. The CI identity is provider, repository, workflow, run, attempt and commit. A repeated write of the same identity preserves the generation. Transport errors never overwrite the previous selection.

`status route --prompt-file` reads the active selection and exposes `ciRun`, `redTiers`, `ciGeneration` and the ordered gates as derived outputs. `[local]` immediately suppresses saved CI values in routing; Step 2 persists the local selection. A finished workflow's selection never carries into a new run.

An ordinary resume keeps the identity fixed even if the branch now has newer runs. An explicit different reference replaces it and increments the generation. Stamp CI rounds, reproduction, diagnosis, remediation and soak rows with that generation through the existing `steps finish --field` facility. Only DONE reproduction or fix rows in the active run and generation count for the selected evidence. Prior rows remain as history; global fix-attempt limits still count every actual fix attempt.

### Tests, reproduction and proof

- Before a fix for the current CI generation, `tests run` writes a `FAIL` evidence round with `source: ci`, `scope: ci:<id>`, `exitCode: null`, `failures: null`, the run attempt and the generation. It executes no local gate and does not invent a numeric failure count.
- After a DONE remediation or soak row for that generation, it executes a local gate and emits `source: local`.
- Failed job names matching the existing `bkit-tests-<tier>` convention supply tiers. `bkit-tests-check` is not a tier. Unknown failed jobs force the default deepest gate order because their required coverage is unknown; do not narrow from a partially mapped failure set.
- Otherwise, candidate gates from `BKIT_DEBUG_GATES` that cover every red tier come first, shallowest first, followed by the defaults without duplicates. Preserve `[live=off]`. Consumers with no declared covering gate fall back to the deepest declared default.
- `[repro]` still means write and observe a failing regression test before remediation. With CI evidence, Fetch Context routes to Failure Reproduce once per generation, even though the CI round is FAIL. `Reproduced: YES` routes directly to Diagnose or Soak using the observed reproduction and CI logs. `Reproduced: NO` with known red CI stops with a reproduction blocker; it never routes to Summary as passed. The owner may explicitly withdraw `[repro]` to continue from CI evidence alone.
- Gate 3 checks that evidence was recorded or local tests ran, as appropriate. It does not require a future green CI result before diagnosis can start. The final fail-then-pass assertion belongs at Close.
- A local pass after the fix is provisional. Close preserves the existing configured CI gate and additionally requires success of the selected workflow on the pushed commit when that workflow differs. Missing, skipped, cancelled or red verification does not prove the fix. Link the old red run and new green or red run separately.

## Edge Cases

<!-- prettier-ignore -->
| Scenario | Expected behavior |
| --- | --- |
| Newer green release or Renovate run, configured CI red | Select the configured CI failure. |
| Prompt names one run and the issue names another | The prompt wins. |
| No prompt reference, active selection, newer red run | Resume the saved run and attempt. |
| `[local]` with saved CI state or an explicit run | Local selection wins and is persisted; no saved tiers leak back. |
| Explicit new run after a previous fix | New generation; earlier fix and reproduction rows do not authorize local-only routing or remediation. |
| Same run ID has a new attempt | Resume remains on its saved attempt; explicitly selecting the new attempt creates a new generation. |
| Named run or PR belongs to another branch | Stop before tests or edits and identify both branches. |
| Explicit branch conflicts with an existing worktree | Stop without switching or replacing that worktree. |
| Red run is an ancestor of the current head | Fetch that exact run; disclose the age and inspect intervening changes. |
| Red run is divergent, from a fork, or ancestry is unknown | Stop before remediation with the mismatch or missing history. |
| Lookup unavailable with a known run | Preserve reference, attempt the mapped read fallback, otherwise block. |
| Lookup unavailable with no reference | Report CI discovery unavailable; do not claim no red run. `[local]` remains the explicit escape. |
| Branch lookup succeeds with no relevant red run | Existing local-first path and default gate order. |
| Explicit reference is green, incomplete or nonexistent | Report the reference state; do not silently repair something else. |
| Old consumer CI block ignores the pin | Customise its temporary execution copy to fetch and identify the selected evidence; validate the output identity. If that cannot be done, block before diagnosis. |
| Logs are empty, expired, partial or for another attempt | Evidence is unavailable or partial; do not claim successful collection or diagnose a different run. |
| `[repro]` plus red CI | Fetch the logs, then request and observe a failing regression test before remediation. |
| `[repro]` cannot reproduce a known red run | Preserve the red evidence and stop; no successful Summary. |
| Unknown failed job alongside a mapped tier | Default deepest gate order. |
| Final CI remains red | Failure Path names the new red run and preserves the original evidence link. |

## Pre-Flight / Dependencies

- Read the current workflow, status-row contracts, `.agents/context.md`, `docs/testing.md`, and the active knowledge and decision rows relevant to these surfaces before implementation.
- Read `.bkit/authoring.md` sections for each workflow, prompt or documentation edit. Run `pnpm instructions:show --file <basename>` before changing shared instructions.
- Locate all readers of test-run `exitCode`, `source`, `scope` and workflow metadata. Update typed row schemas and validators together. Do not assume nullable exit codes or arbitrary fields are accepted everywhere.
- Verify `steps finish` and status audit behavior for CI rounds without a local clamp record. The round still requires its artifact and normal step row.
- Use source files under `.bkit/core/`; regenerate mirrors once at the end. Do not edit managed portions of `.agents/context.md` or `.bkit/workflows.md` directly.
- No new dependency, database migration, automatic consumer-block migration, or `.github/workflows/` change is required. A later diagnosis proposing a CI workflow change still requires the owner's sign-off.

## Reuse Inventory

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| Branch parsing | `.bkit/core/engine/commands/workflow/branches.ts` | Scoped file inventory, bounded source reads and `rg` for debug, workflow, context, debugStart, BKIT_DEBUG_GATES, ciWorkflow and appendTestRun; existing runtime CLI/scripts provide the mechanism | Existing branch commands | EXTEND | Extend exact reference validation and explicit selection. |
| Branch adoption | `.bkit/core/engine/commands/workflow/worktrees.ts` | Scoped file inventory, bounded source reads and `rg` for debug, workflow, context, debugStart, BKIT_DEBUG_GATES, ciWorkflow and appendTestRun; existing runtime CLI/scripts provide the mechanism | Existing ship and debug adoption | EXTEND | Extend debug with a requested branch and conflict checks. |
| CI lookup | `.bkit/core/engine/commands/workflow/runs.ts` | Scoped file inventory, bounded source reads and `rg` for debug, workflow, context, debugStart, BKIT_DEBUG_GATES, ciWorkflow and appendTestRun; existing runtime CLI/scripts provide the mechanism | ciDeclared and workflow-filtered transport | EXTEND | Extend with locate; reuse the existing configured selector and read transport. |
| Selection codec | `.bkit/core/engine/ledgers/status.ts` | Scoped file inventory, bounded source reads and `rg` for debug, workflow, context, debugStart, BKIT_DEBUG_GATES, ciWorkflow and appendTestRun; existing runtime CLI/scripts provide the mechanism | Status contract and fold reducer | EXTEND | Extend the shared leaf type and validation to avoid status/runs import cycles. |
| Saved routing | `.bkit/core/engine/commands/workflow/status.ts` | Scoped file inventory, bounded source reads and `rg` for debug, workflow, context, debugStart, BKIT_DEBUG_GATES, ciWorkflow and appendTestRun; existing runtime CLI/scripts provide the mechanism | debugStart and BKIT_DEBUG_GATES | EXTEND | Extend atomic metadata, generations and ordered gates. |
| Evidence recording | `.bkit/core/engine/commands/workflow/tests.ts` | Scoped file inventory, bounded source reads and `rg` for debug, workflow, context, debugStart, BKIT_DEBUG_GATES, ciWorkflow and appendTestRun; existing runtime CLI/scripts provide the mechanism | appendTestRun and normal runner | EXTEND | Extend a bounded CI source variant without replacing local execution. |
| Step completion | `.bkit/core/engine/commands/workflow/steps.ts` | Scoped file inventory, bounded source reads and `rg` for debug, workflow, context, debugStart, BKIT_DEBUG_GATES, ciWorkflow and appendTestRun; existing runtime CLI/scripts provide the mechanism | Existing finish and clamp validation | EXTEND | Extend conditional CI evidence completion. |
| Context execution | `.bkit/core/engine/commands/workflow/context.ts` | Scoped file inventory, bounded source reads and `rg` for debug, workflow, context, debugStart, BKIT_DEBUG_GATES, ciWorkflow and appendTestRun; existing runtime CLI/scripts provide the mechanism | Existing fetch execution | EXTEND | Extend the selected environment and receipt validation. |
| GitHub blocks | `.bkit/templates/context/bkit-github.md` | Scoped file inventory, bounded source reads and `rg` for debug, workflow, context, debugStart, BKIT_DEBUG_GATES, ciWorkflow and appendTestRun; existing runtime CLI/scripts provide the mechanism | Existing CI and diff blocks | EXTEND | Extend exact attempt pinning and selected-commit diff. |
| Workflow routing | `.bkit/core/workflows/bkit-debug.md` | Scoped file inventory, bounded source reads and `rg` for debug, workflow, context, debugStart, BKIT_DEBUG_GATES, ciWorkflow and appendTestRun; existing runtime CLI/scripts provide the mechanism | Existing debug steps and final CI gates | EXTEND | Extend evidence-first routing and generation stamps. |
| Auto handoff | `.bkit/core/workflows/bkit-auto.md` | Scoped file inventory, bounded source reads and `rg` for debug, workflow, context, debugStart, BKIT_DEBUG_GATES, ciWorkflow and appendTestRun; existing runtime CLI/scripts provide the mechanism | Existing auto debug dispatch | EXTEND | Preserve its held run reference without changing policy. |
| Context contract | `.bkit/core/.agents/context.md` | Scoped file inventory, bounded source reads and `rg` for debug, workflow, context, debugStart, BKIT_DEBUG_GATES, ciWorkflow and appendTestRun; existing runtime CLI/scripts provide the mechanism | Managed context header | EXTEND | Extend the optional input and identity receipt contract. |
| Adopted GitHub blocks | `.agents/context.md` | Scoped file inventory, bounded source reads and `rg` for debug, workflow, context, debugStart, BKIT_DEBUG_GATES, ciWorkflow and appendTestRun; existing runtime CLI/scripts provide the mechanism | Consumer-owned CI/diff blocks below bkit:end | EXTEND | Keep the adopted blocks aligned with shipped blocks. |
| Workflow catalog | `.bkit/core/.bkit/workflows.md` | Scoped file inventory, bounded source reads and `rg` for debug, workflow, context, debugStart, BKIT_DEBUG_GATES, ciWorkflow and appendTestRun; existing runtime CLI/scripts provide the mechanism | Existing debug catalog | EXTEND | Extend the canonical documentation. |
| Template catalog | `.bkit/core/.bkit/templates.md` | Scoped file inventory, bounded source reads and `rg` for debug, workflow, context, debugStart, BKIT_DEBUG_GATES, ciWorkflow and appendTestRun; existing runtime CLI/scripts provide the mechanism | Existing context template catalog | EXTEND | Extend its input/output contract. |
| Prompt catalog | `.bkit/core/.bkit/prompts.md` | Scoped file inventory, bounded source reads and `rg` for debug, workflow, context, debugStart, BKIT_DEBUG_GATES, ciWorkflow and appendTestRun; existing runtime CLI/scripts provide the mechanism | Existing prompt index | EXTEND | Update only if a conflicting prompt statement changes. |
| Test strategy | `docs/testing.md` | Scoped file inventory, bounded source reads and `rg` for debug, workflow, context, debugStart, BKIT_DEBUG_GATES, ciWorkflow and appendTestRun; existing runtime CLI/scripts provide the mechanism | Existing CI and local tier rules | EXTEND | Clarify evidence, explicit reproduction, post-fix checks and final proof. |
| Decision ledger | `docs/decisions.jsonl` | Scoped file inventory, bounded source reads and `rg` for debug, workflow, context, debugStart, BKIT_DEBUG_GATES, ciWorkflow and appendTestRun; existing runtime CLI/scripts provide the mechanism | Existing decision schema | EXTEND | Append the requested decision through the ledger command. |
| Pinned GitHub block execution tests | `.bkit/core/engine/audits/templates/context-github-ci-block.test.ts` | `rg --files` in workflow/template audits and scoped searches for debug references; inspected sibling fixture suites | Existing focused suite absent | NEW | Existing context-templates.test.ts audits template structure and generic execution; it has no focused pinned-run, attempt and ancestral-diff suite. The requested dedicated suite has no existing file. |
| Complete CI debug sequence tests | `.bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts` | `rg --files` in workflow/template audits and scoped searches for debug references; inspected sibling fixture suites | Existing focused suite absent | NEW | Existing workflow snippet integration suites cover locks, archive and close independently; no file owns selection through context, generation-scoped fixes, local checks and pushed-head proof. |

The TypeScript symbol overview was unavailable for this worktree path; bounded text searches confirmed the existing owners. No new runtime dependency or CI provider framework is needed. Current practice for these contracts is the existing CLI transport, package scripts and fixture conventions already in this repository.

## Derived Test Matrix

Each row names the exact test and its sole implementing task.

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| parses explicit and existing branch tokens without consuming URLs | Unit | `.bkit/core/engine/commands/workflow/branches.test.ts` | 1 |
| rejects missing explicit and ambiguous existing branch selections | Unit | `.bkit/core/engine/commands/workflow/branches.test.ts` | 1 |
| adopts a requested debug branch without mutating conflicting worktrees | Unit | `.bkit/core/engine/commands/workflow/worktrees.test.ts` | 1 |
| locates CI evidence using prompt saved issue and local precedence | Unit | `.bkit/core/engine/commands/workflow/runs.test.ts` | 2 |
| rejects ambiguous cross-repository and malformed attempt references | Unit | `.bkit/core/engine/commands/workflow/runs.test.ts` | 2 |
| filters branch and PR discovery by configured workflow and exact head | Unit | `.bkit/core/engine/commands/workflow/runs.test.ts` | 2 |
| freezes explicit workflow run attempt and all failed job pages | Unit | `.bkit/core/engine/commands/workflow/runs.test.ts` | 2 |
| validates branch fork ancestor divergent and unavailable ancestry evidence | Unit | `.bkit/core/engine/commands/workflow/runs.test.ts` | 2 |
| distinguishes proven automatic no-red from explicit non-red and unavailable lookup | Unit | `.bkit/core/engine/commands/workflow/runs.test.ts` | 2 |
| validates normalized fallback evidence against the requested identity | Unit | `.bkit/core/engine/commands/workflow/runs.test.ts` | 2 |
| validates atomic CI and local selections with stable evidence identities | Unit | `.bkit/core/engine/ledgers/status.test.ts` | 2 |
| persists atomic selections and preserves identical evidence generations | Unit | `.bkit/core/engine/commands/workflow/status.test.ts` | 3 |
| resumes saved evidence and replaces it only on explicit new selection | Unit | `.bkit/core/engine/commands/workflow/status.test.ts` | 3 |
| clears saved CI routing immediately for explicit local selection | Unit | `.bkit/core/engine/commands/workflow/status.test.ts` | 3 |
| counts reproduction and fixes only in the active generation | Unit | `.bkit/core/engine/commands/workflow/status.test.ts` | 3 |
| orders covering gates for red tiers and preserves live off | Unit | `.bkit/core/engine/commands/workflow/status.test.ts` | 3 |
| records a CI evidence round without executing a local gate | Unit | `.bkit/core/engine/commands/workflow/tests.test.ts` | 4 |
| runs local gates only after current-generation remediation or soak | Unit | `.bkit/core/engine/commands/workflow/tests.test.ts` | 4 |
| rejects CI rounds without active matching debug selection | Unit | `.bkit/core/engine/commands/workflow/tests.test.ts` | 4 |
| accepts bounded CI evidence rows while preserving local exit validation | Unit | `.bkit/core/engine/ledgers/telemetry.test.ts` | 4 |
| finishes validated CI evidence rounds without local clamp records | Unit | `.bkit/core/engine/commands/workflow/steps.test.ts` | 5 |
| preserves local clamp enforcement when completing test rounds | Unit | `.bkit/core/engine/commands/workflow/steps.test.ts` | 5 |
| audits evidence-first debug rounds without requiring a local discovery run | Unit | `.bkit/core/engine/checks/status-holes.test.ts` | 5 |
| pins selected evidence variables and clears inherited pins without selection | Unit | `.bkit/core/engine/commands/workflow/context-fetch.test.ts` | 6 |
| accepts only matching complete CI receipts with nonempty logs | Unit | `.bkit/core/engine/commands/workflow/context-fetch.test.ts` | 6 |
| validates adapted legacy and fallback context through the same receipt path | Unit | `.bkit/core/engine/commands/workflow/context-fetch.test.ts` | 6 |
| fetches pinned attempts without branch discovery and filters unpinned discovery | Unit | `.bkit/core/engine/audits/templates/context-github-ci-block.test.ts` | 7 |
| emits complete receipts only after all selected job logs succeed | Unit | `.bkit/core/engine/audits/templates/context-github-ci-block.test.ts` | 7 |
| ends pinned diffs at selected commits with ancestral same-workflow baselines | Unit | `.bkit/core/engine/audits/templates/context-github-ci-block.test.ts` | 7 |
| keeps adopted GitHub context blocks equal to shipped blocks | Unit | `.bkit/core/engine/audits/templates/context-github-ci-block.test.ts` | 7 |
| routes selected evidence through context diagnosis and generation-scoped fixes | Unit | `.bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts` | 8 |
| honors CI reproduction before remediation and blocks unreproduced failures | Unit | `.bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts` | 8 |
| requires selected other-workflow success at the exact pushed head | Unit | `.bkit/core/engine/commands/workflow/runs.test.ts` | 8 |
| retains original and verifying run identities through close and auto handoff | Unit | `.bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts` | 8 |
| checks the complete selected CI fix sequence against green and red final runs | Integration | `.bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts` | 10 |
| reloads saved fixes and recollects explicitly replaced evidence generations | Integration | `.bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts` | 10 |
| preserves local and repro overrides across actual workflow command sequences | Integration | `.bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts` | 10 |
| blocks missing logs and wrong-branch evidence before source edits | Integration | `.bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts` | 10 |

Static documentation and generation audits run in Tasks 9 and 11. The historical smoke replay and fresh-consumer footprint inspection run in Task 11; they do not replace the deterministic integration tests.

## Agent Execution Runbook

The Selection and State Contract and Verification and Rollback sections are binding acceptance criteria for every task. After each task changes engine TypeScript, run `pnpm build` so its generated `dist/` output is ready for the orchestrator's same-step commit. Write and observe each planned test failing before its implementation. Fix existing tests broken by the task without weakening their expectations. Use the existing CLI help, output and exit-code conventions for each new verb or flag.

<!-- bkit:group 1 start -->

### TASK GROUP 1: Branch and evidence selection

<!-- bkit:task 1 start -->

- [x] **TASK 1:** Parse and safely adopt an explicitly named branch.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/branches.ts`: add `parse --prompt-file` with `branch`, `via` and `where` outputs. Validate candidates with `git check-ref-format --branch` and exact `refs/heads/` or `refs/remotes/origin/` existence checks. Deduplicate the same branch found locally and remotely.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/worktrees.ts`: accept `--branch` for debug, preserving ship behavior and keeping `--issue` ship-only. An existing worktree must match the requested branch. Reuse the existing adoption path; do not switch a conflicting checkout or create a missing branch.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/branches.ts`: `branches parse`: 0 for one branch or no candidate, 3 for a missing explicit branch, 8 for ambiguity. Existing setup refusal codes remain documented. Ambiguous or conflicting user input stops before edits.
  - **DEPENDS ON:** none.
  - **DONE WHEN:** matrix rows for Task 1 pass, including a sentinel proving a conflicting worktree and its branch remain unchanged; CLI help documents debug branch adoption. After engine TypeScript changes, `pnpm build` passes and the generated `dist/` changes are ready for the same-step commit.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/branches.test.ts` `parses explicit and existing branch tokens without consuming URLs` fails on branch selectors are ignored or URLs and non-branch paths are consumed.
    - `.bkit/core/engine/commands/workflow/branches.test.ts` `rejects missing explicit and ambiguous existing branch selections` fails on missing and ambiguous branch inputs are accepted.
    - `.bkit/core/engine/commands/workflow/worktrees.test.ts` `adopts a requested debug branch without mutating conflicting worktrees` fails on valid adoption is refused or a conflicting worktree is switched, replaced or accepted.

<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->

- [x] **TASK 2:** Locate and validate the relevant CI evidence.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/runs.ts`: add pure reference parsing and `runs locate --prompt-file --issue-text-file --branch --repo --file --selection-out`. `--file` is the active status log when available; `--selection-out` writes the validated candidate selection JSON for Task 3. Inputs and output paths are explicit; do not change active metadata from this read operation.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/runs.ts`: apply Reference precedence and CI lookup above. Read `readBkitConfig(root).ciWorkflow`; branch and PR discovery filter by that workflow. Reuse `runGh`, existing workflow-filtered queries and pagination helpers. Fetch selected-attempt metadata and jobs, retaining the workflow ID/path, head repository, head branch and head commit.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/runs.ts`: branch alignment and commit ancestry before emitting an actionable CI selection. Treat an ancestry check error distinctly from proven non-ancestry. Unknown failed jobs yield `redTiers: []` for default gate order and remain listed in `failedJobs`.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/runs.ts`: `selection`, `runId`, `runUrl`, `runAttempt`, `workflowId`, `workflowPath`, `headSha`, `headRelation` (`current`, `ancestor`, `divergent`, `unknown`), `failedJobs`, `tiers`, `via`, `reason`, `selectionFile`. CI summary fields are null or empty for local selection.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/runs.ts`: 0 for validated red selection; 1 only for a valid local selection (`[local]`, saved local, successful automatic no-red, or no configured CI). Exit 2 for invalid arguments, 8 for ambiguous/conflicting user references, 80 for unavailable transport eligible for the existing read fallback, and 82 when the named evidence or alignment needs owner action. A malformed response or incomplete required read is never exit 1.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/runs.ts`: add `--evidence-file` for a bounded, normalized response collected through the mapped GitHub read tools after exit 80. Validate it with the same parser and branch checks as the CLI response. Its schema carries the lookup request, selected run/attempt metadata and complete jobs, or an explicit successful no-red result with the inspected selector/head. Reject mismatched selectors and missing identity fields. Record the single transport transition with the existing transport-row mechanism and independently re-read the selected identity before proceeding.
  - **UPDATE:** `.bkit/core/engine/ledgers/status.ts`: place the shared selection type, validation and identity helper alongside the existing status-row contract, with focused cases in its existing test file. Both `runs.ts` and `status.ts` consume these helpers; do not make `status.ts` import `runs.ts`, which already imports `status.ts`.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/runs.ts`: read an active run's saved object through the existing metadata-folding helpers. Task 3 extends the metadata writer and routing; lookup does not depend on those future writer changes to read fixture state.
  - **DEPENDS ON:** none.
  - **DONE WHEN:** Task 2 matrix rows pass; a newer unrelated green workflow cannot change selection; unavailable and partially paged evidence cannot emit local selection; help documents every result and exit code. After engine TypeScript changes, `pnpm build` passes and the generated `dist/` changes are ready for the same-step commit.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/runs.test.ts` `locates CI evidence using prompt saved issue and local precedence` fails on lower-priority references override the winning source or generated comments supply references.
    - `.bkit/core/engine/commands/workflow/runs.test.ts` `rejects ambiguous cross-repository and malformed attempt references` fails on ambiguous references, mismatched repositories or invalid attempts produce actionable evidence.
    - `.bkit/core/engine/commands/workflow/runs.test.ts` `filters branch and PR discovery by configured workflow and exact head` fails on a newer unrelated successful workflow hides the configured failure or PR head constraints are omitted.
    - `.bkit/core/engine/commands/workflow/runs.test.ts` `freezes explicit workflow run attempt and all failed job pages` fails on the selected attempt changes, failed job pages are lost or unknown jobs narrow the tier set.
    - `.bkit/core/engine/commands/workflow/runs.test.ts` `validates branch fork ancestor divergent and unavailable ancestry evidence` fails on wrong-branch, fork, divergent or unproven ancestry is accepted as historical evidence.
    - `.bkit/core/engine/commands/workflow/runs.test.ts` `distinguishes proven automatic no-red from explicit non-red and unavailable lookup` fails on failed transport, parsing, pagination or explicit non-red evidence silently selects local discovery.
    - `.bkit/core/engine/commands/workflow/runs.test.ts` `validates normalized fallback evidence against the requested identity` fails on mismatched selectors, incomplete jobs or missing identity fields bypass normal selection validation.
    - `.bkit/core/engine/ledgers/status.test.ts` `validates atomic CI and local selections with stable evidence identities` fails on malformed selection fields pass validation or identity omits workflow, attempt or commit.

<!-- bkit:task 2 end -->

<!-- bkit:group 1 end -->

<!-- bkit:group 2 start -->

### TASK GROUP 2: Atomic state and evidence rounds

<!-- bkit:task 3 start -->

- [x] **TASK 3:** Persist selection atomically and route by its generation.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/status.ts`: implement `status meta --ci-selection-file` and generation assignment under Atomic saved selection. Extend `debugStart` and `status route` to expose the derived values and reorder `BKIT_DEBUG_GATES`.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/status.ts`: existing status/ledger row types and validators wherever metadata is constrained. Reuse the active-run predicate from `debugStart`; an unrelated or finished run cannot provide evidence or progress.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/status.ts`: mode changes or changed CI identities increment `ciGeneration`; identical identities preserve it. A local variant replaces the whole object, removing stale tiers and references. Route `[local]` before reading saved CI fields. Validate the complete object before appending any row.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/status.ts`: expose current-generation reproduction and fix completion in routing so the workflow does not perform its own unscoped search. Keep global attempt counters unchanged; they count actual fixes across generations and runs.
  - **DEPENDS ON:** 2.
  - **DONE WHEN:** Task 3 matrix rows pass; serialized/reloaded state preserves the same identity and generation; replacement makes prior fix/reproduction rows ineligible; existing no-CI routing is unchanged. After engine TypeScript changes, `pnpm build` passes and the generated `dist/` changes are ready for the same-step commit.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/status.test.ts` `persists atomic selections and preserves identical evidence generations` fails on identical writes increment generations or partial metadata survives replacement.
    - `.bkit/core/engine/commands/workflow/status.test.ts` `resumes saved evidence and replaces it only on explicit new selection` fails on ordinary resume rediscovers runs or a new run or attempt reuses prior progress.
    - `.bkit/core/engine/commands/workflow/status.test.ts` `clears saved CI routing immediately for explicit local selection` fails on saved run references or tiers leak into explicit local routing.
    - `.bkit/core/engine/commands/workflow/status.test.ts` `counts reproduction and fixes only in the active generation` fails on finished or unrelated runs and prior generations authorize current work or global counters reset.
    - `.bkit/core/engine/commands/workflow/status.test.ts` `orders covering gates for red tiers and preserves live off` fails on known tiers use overly broad gates, unknown jobs narrow coverage or live-off is ignored.

<!-- bkit:task 3 end -->

<!-- bkit:task 4 start -->

- [x] **TASK 4:** Record a CI round without pretending to execute local tests.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/tests.ts`: add `tests run --ci-run --ci-url`; require `--file`, an active debug run and a matching validated saved CI selection. Reject a flag/metadata mismatch. Read the current generation and its DONE remediation/soak rows.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/tests.ts`: before a matching fix, create the evidence artifact identifying repository, workflow, run, attempt, commit and URL. State that the local gate was not run. Append the test-run row defined in Tests, reproduction and proof; emit `source`, `verdict`, `scope`, `gate: null`, nullable `failures`, `runAttempt`, `ciGeneration`; return 1. After a matching fix, use the normal local gate runner and emit `source: local`.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/tests.ts`: `appendTestRun`, row types and telemetry/status validators to accept this bounded CI variant. Preserve numeric local exit codes and existing local validation. Do not loosen schemas for unrelated row kinds.
  - **READ:** `.bkit/core/engine/commands/workflow/steps.ts`: Task 5 owns CI evidence step completion and conditional local clamp enforcement.
  - **DEPENDS ON:** 3.
  - **DONE WHEN:** Task 4 matrix rows pass; a local-gate marker is absent before a matching fix and present after one; status audit, summary and telemetry accept the CI variant without treating it as a zero-failure local pass. After engine TypeScript changes, `pnpm build` passes and the generated `dist/` changes are ready for the same-step commit.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `records a CI evidence round without executing a local gate` fails on a local gate runs before the selected generation has a completed fix.
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `runs local gates only after current-generation remediation or soak` fails on old-generation fixes authorize local verification or matching fixes fail to enable it.
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `rejects CI rounds without active matching debug selection` fails on missing or closed state and mismatched run flags are accepted.
    - `.bkit/core/engine/ledgers/telemetry.test.ts` `accepts bounded CI evidence rows while preserving local exit validation` fails on CI null exit and failure counts are rejected or malformed local rows become valid.

<!-- bkit:task 4 end -->

<!-- bkit:task 5 start -->

- [x] **TASK 5:** Complete and audit CI evidence rounds without weakening local checks.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/steps.ts`: accept validated CI evidence rounds without local clamp records, checking source, artifact and selection identity while preserving local clamp enforcement.
  - **UPDATE:** `.bkit/core/engine/checks/status-holes.ts`: recognize the evidence-first debug path while retaining required evidence and step auditing.
  - **DEPENDS ON:** 4.
  - **DONE WHEN:** CI evidence artifact completion and status-hole tests pass; forged evidence is refused and local clamp enforcement stays intact. After engine TypeScript changes, `pnpm build` passes and the generated `dist/` changes are ready for the same-step commit.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `finishes validated CI evidence rounds without local clamp records` fails on a genuine CI evidence artifact requires a nonexistent local clamp or forged evidence is accepted.
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `preserves local clamp enforcement when completing test rounds` fails on local test artifacts complete without their required clamp evidence.
    - `.bkit/core/engine/checks/status-holes.test.ts` `audits evidence-first debug rounds without requiring a local discovery run` fails on valid CI rounds are flagged as missing steps or absent required evidence is ignored.

<!-- bkit:task 5 end -->

<!-- bkit:group 2 end -->

<!-- bkit:group 3 start -->

### TASK GROUP 3: Pinned context and workflow routing

<!-- bkit:task 6 start -->

- [x] **TASK 6:** Pin and validate context evidence.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/context.ts`: add `context fetch --ci-selection-file`. Validate the same selection schema. Set `BKIT_CI_RUN_ID`, `BKIT_CI_RUN_ATTEMPT`, `BKIT_CI_REPO` and `BKIT_CI_HEAD_SHA` in the child environment for a selected CI run; remove inherited values of these variables when no CI selection is supplied.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/context.ts`: a selected `ci` block emits one machine-readable identity line, `bkit-ci-evidence: <JSON>`, with `provider`, `repo`, `runId`, `runAttempt`, `headSha`, `workflowId`, and `complete: true`, followed by the logs. The block emits `complete: true` only after every required metadata/job/log read succeeds. Parse and compare the identity with the selection. Empty logs, skip breadcrumbs, partial evidence or mismatched identity cannot count as fetched evidence for diagnosis.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/context.ts`: existing consumer-owned blocks are not rewritten automatically. Step 4 already customises a temporary script; adapt that script to honor the selected identity and emit the receipt. If the block's provider or available tools cannot supply it, retain the output as unchecked evidence and stop before diagnosis. A matching header with no logs is insufficient.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/context.ts`: use the existing mapped metadata/log read tools when the block cannot use `gh`, preserving the repository, attempt, workflow and commit. Feed the normalized result through the same identity/content validation before producing a checked artifact; do not bypass validation by manually claiming CHECKED.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/context.ts`: `.bkit/core/.agents/context.md` (managed source) with the input environment and identity-line contract. Locate its source references before editing. Update the self-contained-block wording so the optional input pin is explicit; blocks still share no mutable state.
  - **DEPENDS ON:** 3.
  - **DONE WHEN:** Task 6 matrix rows pass; a legacy block returning another run is rejected; a correctly adapted temporary block succeeds; unavailable logs cannot route to Diagnose. After engine TypeScript changes, `pnpm build` passes and the generated `dist/` changes are ready for the same-step commit.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/context-fetch.test.ts` `pins selected evidence variables and clears inherited pins without selection` fails on child blocks see the wrong run, attempt, repository or commit or inherit stale pins.
    - `.bkit/core/engine/commands/workflow/context-fetch.test.ts` `accepts only matching complete CI receipts with nonempty logs` fails on wrong run, attempt, commit or workflow receipts and absent, empty, skipped or partial logs count as checked evidence.
    - `.bkit/core/engine/commands/workflow/context-fetch.test.ts` `validates adapted legacy and fallback context through the same receipt path` fails on legacy or fallback output bypasses identity checks or correctly adapted temporary blocks are refused.

<!-- bkit:task 6 end -->

<!-- bkit:task 7 start -->

- [x] **TASK 7:** Make the shipped evidence blocks honor the selection.
  - **UPDATE:** `.bkit/templates/context/bkit-github.md`: `.bkit/templates/context/bkit-github.md`, the `context=ci` block: when pinned, read the exact repository/run/attempt and do not call branch discovery. Validate returned metadata before fetching complete, bounded job logs. Include failed/timed-out/startup-failure evidence where available; missing logs remain unavailable, not a clean result.
  - **UPDATE:** `.bkit/templates/context/bkit-github.md`: its unpinned discovery to use the consumer's existing configured workflow selector. Resolve the setting through the existing configuration convention; do not add a second default filename or setting. Preserve no-config and tool-unavailable breadcrumbs.
  - **UPDATE:** `.bkit/templates/context/bkit-github.md`: the `context=diff` block to use the selected failing commit as the diff endpoint when pinned. Find a successful baseline of the same selected workflow on the configured baseline branch at or before the failing run; validate ancestry. Report an unavailable baseline honestly rather than diffing unrelated or newer code. Unpinned behavior retains the existing discovery path.
  - **UPDATE:** `.bkit/templates/context/bkit-github.md`: bkit's adopted blocks below `bkit:end` in `.agents/context.md` to match the shipped blocks. Do not edit the managed header; Task 6 changes its source and regeneration writes the mirror.
  - **CREATE:** `.bkit/core/engine/audits/templates/context-github-ci-block.test.ts`: NEW because no existing dedicated pinned-run, attempt and ancestral-diff suite exists; execute the actual bash blocks with a stub `gh` and temporary Git history. Assert repository/attempt pinning, query selectors, complete evidence receipts, multiple jobs, errors and baseline/end commit choice. Verify adopted/template equality.
  - **DEPENDS ON:** 6.
  - **DONE WHEN:** Task 7 matrix rows pass and existing context-fetch preflight tests report no unbounded command regression. A pin cannot be ignored without failing the test. After engine TypeScript changes, `pnpm build` passes and the generated `dist/` changes are ready for the same-step commit.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/templates/context-github-ci-block.test.ts` `fetches pinned attempts without branch discovery and filters unpinned discovery` fails on a selected run triggers branch discovery or unpinned lookup omits the configured workflow.
    - `.bkit/core/engine/audits/templates/context-github-ci-block.test.ts` `emits complete receipts only after all selected job logs succeed` fails on wrong-attempt or partial job reads produce complete evidence.
    - `.bkit/core/engine/audits/templates/context-github-ci-block.test.ts` `ends pinned diffs at selected commits with ancestral same-workflow baselines` fails on diffs end at current HEAD or use unrelated, newer or non-ancestral baselines.
    - `.bkit/core/engine/audits/templates/context-github-ci-block.test.ts` `keeps adopted GitHub context blocks equal to shipped blocks` fails on adopted CI or diff blocks differ from their shipped contract.

<!-- bkit:task 7 end -->

<!-- bkit:task 8 start -->

- [x] **TASK 8:** Wire selection, reproduction and final proof through Debug.
  - **UPDATE:** `.bkit/core/workflows/bkit-debug.md`: `.bkit/core/workflows/bkit-debug.md` header and Steps 1–2: parse branch input, adopt safely, resolve evidence with prompt/current issue text/active status, and validate branch alignment. Persist the validated selection, then rederive gates. Run this resolution before resuming a downstream step so explicit reference or `[local]` overrides cannot be skipped on resume.
  - **UPDATE:** `.bkit/core/workflows/bkit-debug.md`: Step 2 routing: exit 1 means an explicit local choice or a proven no-red result; exit 80 enters the existing mapped read fallback, not local-first; unresolved unavailable evidence stops with its reference. Ambiguous references or branch conflicts use an owner stop before tests or edits. Record fallback transport and pause state using existing mechanisms.
  - **UPDATE:** `.bkit/core/workflows/bkit-debug.md`: Step 3: pass CI flags only for the saved CI selection, record `source` and `ciGeneration`, and condition local clamp arguments on `source: local`. Preserve attempt counters and normal local FAIL loops. A changed CI generation restarts evidence collection regardless of previous fix rows.
  - **UPDATE:** `.bkit/core/workflows/bkit-debug.md`: Step 4: pass the selection file to every applicable fetch, require validated selected-run logs before diagnosis, and record explicit unavailable/partial outcomes. Capture current-generation context; do not let an older context artifact satisfy the evidence check.
  - **UPDATE:** `.bkit/core/workflows/bkit-debug.md`: Steps 4–5: route `[repro]` with known CI evidence to Failure Reproduce once for the current generation. Stamp its row. YES proceeds to Diagnose/Soak without an unnecessary discovery gate; NO stops with the reproduction blocker. Keep the existing local-only reproduction path. Do not clear `REPRO` merely because CI is red.
  - **UPDATE:** `.bkit/core/workflows/bkit-debug.md`: Steps 6–8: supply the selected evidence identity and stamp diagnosis, remediation and soak rows with `ciGeneration`. The DONE fix row authorizes the next local gate only for that generation.
  - **UPDATE:** `.bkit/core/workflows/bkit-debug.md`: Gate 3: verify the current evidence/test round and its artifact. Move the CI fail-then-pass requirement to Gate 11 after push and verification. Do not claim a future green result at Gate 3.
  - **UPDATE:** `.bkit/core/workflows/bkit-debug.md`: Steps 10–11 and `.bkit/core/engine/commands/workflow/runs.ts` only where necessary: retain the configured pushed-head gate; carry the selected workflow's ID/path through wait/gate for an explicit different workflow. Keep input evidence IDs separate from `VERIFY_RUN_ID`/verification URL. A completed red, skipped, cancelled, absent or unavailable verifying run cannot complete the CI-only fix. Close comments and the final report name both the original failure and the verifying run.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/runs.ts`: `.bkit/core/workflows/bkit-auto.md` dispatch. Its debug invocation must preserve the exact run it is acting on instead of assuming later branch discovery finds the same run. If it currently omits that reference, pass the existing held run explicitly and update the workflow catalog and audits in this task; do not change auto's routing policy.
  - **UPDATE:** `.bkit/core/workflows/bkit-debug.md`: existing debug workflow audits, status-hole tests and CLI tests for any expanded wait/gate parameters. Read diagnose/remediate/soak prompts for conflicts with the new evidence contract; edit only a conflicting input/routing statement, updating `.bkit/core/.bkit/prompts.md` if a prompt changes.
  - **DEPENDS ON:** 1, 2, 3, 4, 5, 6, 7.
  - **DONE WHEN:** Task 8 matrix rows pass; no CI-reproduction NO path reaches successful Summary; no path declares CI-only resolution before the pushed-head checks. Existing local-only debug and auto dispatch tests still pass. After engine TypeScript changes, `pnpm build` passes and the generated `dist/` changes are ready for the same-step commit.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts` `routes selected evidence through context diagnosis and generation-scoped fixes` fails on local discovery gates diagnosis, explicit resume overrides are skipped or generation stamps and conditional clamp handling are missing.
    - `.bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts` `honors CI reproduction before remediation and blocks unreproduced failures` fails on reproduction is bypassed, repeated across the same generation or NO reaches successful Summary.
    - `.bkit/core/engine/commands/workflow/runs.test.ts` `requires selected other-workflow success at the exact pushed head` fails on green configured CI alone authorizes an explicit other-workflow fix or skipped, cancelled, missing and red checks complete it.
    - `.bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts` `retains original and verifying run identities through close and auto handoff` fails on auto drops its held run or close conflates original evidence with verifying run links.

<!-- bkit:task 8 end -->

<!-- bkit:group 3 end -->

<!-- bkit:group 4 start -->

### TASK GROUP 4: Documentation and complete verification

<!-- bkit:task 9 start -->

- [x] **TASK 9:** Update the documentation, reference rows and decision record.
  - **UPDATE:** `.bkit/core/.bkit/workflows.md`: `.bkit/core/.bkit/workflows.md` source: Debug modes, Steps 1–8 and Close, branch adoption, the evidence-round artifact contract, current-generation progress and local gate ordering. Include auto's exact-run handoff if Task 8 changes it.
  - **UPDATE:** `.bkit/core/.bkit/workflows.md`: `.bkit/core/.bkit/templates.md` for the changed CI/diff block inputs and evidence output contract. Update `.bkit/core/.bkit/prompts.md` only if Task 8 changes a prompt. Regenerate the installed catalogs.
  - **UPDATE:** `docs/testing.md`: distinguish CI evidence, explicit reproduction, local post-fix checks and pushed-head proof. Document the new integration test and the retained `[live=off]`/live-skipped behavior.
  - **UPDATE:** `.bkit/core/.bkit/workflows.md`: CLI documentation through `pnpm cli:sync`, never by hand. Document the existing `bkit.testing.ciWorkflow` selector and the new selection-file flags, row fields, environment inputs, identity receipt and exit behavior in their canonical homes.
  - **UPDATE:** `docs/decisions.jsonl`: append one decision row through `bkit ledgers append --ledger=decisions --rows=-`, using an engine-generated timestamp and key `830-red-ci-run-is-the-first-test-round`. Reference the related issue with its title and URL. Record evidence-first routing, configured workflow filtering, branch validation, stable selection/generation, explicit local/repro precedence, unavailable-evidence blocking and final CI proof. Do not add a migration row.
  - **DEPENDS ON:** 8.
  - **DONE WHEN:** CLI-doc and ledger-integrity tests, prose lint and formatting pass. No edited catalog says all blocks independently discover their run, `[repro]` is ignored for CI, or an unavailable CI read proves there is no red run.
  - **TEST FIRST:** n/a — documentation and decision-ledger text only; behavior is verified by the preceding tasks.

<!-- bkit:task 9 end -->

<!-- bkit:task 10 start -->

- [x] **TASK 10:** Verify the complete sequence and regenerate the shipped output.
  - **CREATE:** `.bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts`: NEW because no existing integration suite owns the complete selected-evidence fix sequence. Follow existing workflow-snippet integration fixtures: use a fresh temporary consumer, real CLI commands/status files/context execution, the actual workflow command blocks and an argv-checking fake CI transport. Stub the remote boundary and agent-produced fix artifact, not selection, metadata folding, gate execution, context validation or final gate evaluation.
  - **UPDATE:** `.bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts`: generated outputs via the existing `pnpm bkit:generate` once after source edits. Run the prescribed build, CLI/instruction sync, mirror generation, snapshots and graph refresh through that script; inspect the generated diff. Do not hand-edit mirrors.
  - **UPDATE:** `.bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts`: run the unit and integration tests named by the matrix, then `pnpm bkit:gate:static-unit-integration` and `bkit check`. Run generation again only to prove idempotence or after a change; it must add no new delta. Inspect that the working tree contains only intended changes.
  - **UPDATE:** `.bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts`: build the actual distributable, install it into a fresh scratch consumer, and run the relevant built CLI commands. Inspect the selection metadata, evidence artifact, context logs, conditional local-gate sentinel and generated host files on disk. Keep fixtures under the repo's temporary directory and use no production mutation.
  - **UPDATE:** `.bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts`: in a scratch checkout, pass the exact existing branch and explicitly pinned historical run from Concrete Example. Record the selected attempt and confirm the fetched identity and diagnosis. Do not rely on that branch's latest run. If logs have expired or the branch is gone, report this smoke check as unavailable; the deterministic integration proof still runs and the historical replay is not falsely reported as passing.
  - **DEPENDS ON:** 9.
  - **DONE WHEN:** the complete deterministic green and red sequences pass, all matrix rows are covered, required gates pass, generated files are stable, and fresh-consumer artifacts demonstrate the shipped behavior. Report historical smoke availability separately from automated verification. After engine TypeScript changes, `pnpm build` passes and the generated `dist/` changes are ready for the same-step commit.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts` `checks the complete selected CI fix sequence against green and red final runs` fails on local gates run before diagnosis, context identity differs, a fix fails to enable the selected local gate or red final CI completes.
    - `.bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts` `reloads saved fixes and recollects explicitly replaced evidence generations` fails on serialized resume changes selection or a replaced generation reuses a previous fix despite a passing local gate.
    - `.bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts` `preserves local and repro overrides across actual workflow command sequences` fails on local clearing, reproduction order or reproduction failure differs from the selection contract.
    - `.bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts` `blocks missing logs and wrong-branch evidence before source edits` fails on unavailable or misaligned evidence reaches edits or a clean outcome.

<!-- bkit:task 10 end -->

<!-- bkit:task 11 start -->

- [x] **TASK 11:** Regenerate and inspect the distributable and fresh-consumer footprint.
  - **READ:** `package.json`: use the existing `pnpm bkit:generate` pipeline for build, CLI and shared-instruction sync, mirror regeneration, render snapshots and graph refresh.
  - **READ:** `docs/testing.md`: run the unit and integration matrix, `pnpm bkit:gate:static-unit-integration` and `bkit check`; report skipped tooling honestly.
  - **UPDATE:** `.bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts`: verify the complete fixture sequence without weakening the tests recorded by the test-writing step.
  - **DEPENDS ON:** 10.
  - **DONE WHEN:** Generated output is stable after a second generation, required gates pass, and the built CLI installed into a fresh scratch consumer demonstrates selection metadata, checked context, conditional local-gate execution and rendered host files on disk. Replay the exact pinned historical run and branch from Concrete Example in scratch and report its availability separately; expired logs or a deleted branch are unavailable, not a passing smoke test. Keep scratch fixtures under repo-root `tmp/` and inspect only intended changes.
  - **TEST FIRST:** n/a — generated baselines and fresh-consumer dogfood verification; behavioral regression tests belong to Task 10.

<!-- bkit:task 11 end -->

<!-- bkit:group 4 end -->

## Breaking Changes & Naming

- New verbs: `branches parse`, `runs locate`.
- Extended flags: debug `worktrees setup --branch`; `runs locate` prompt/issue/status/selection/fallback inputs; `status meta --ci-selection-file`; `tests run --ci-run/--ci-url`; `context fetch --ci-selection-file`; existing workflow-specific verification options only where needed.
- New status contract: atomic `ciSelection`, engine-owned `ciGeneration`, generation-stamped evidence/reproduction/fix steps, CI test-run `source`, nullable CI `exitCode`, and `scope: ci:<id>`.
- New block inputs: `BKIT_CI_RUN_ID`, `BKIT_CI_RUN_ATTEMPT`, `BKIT_CI_REPO`, `BKIT_CI_HEAD_SHA`. CI output adds the validated `bkit-ci-evidence` identity line.
- Existing configuration: reuse `bkit.testing.ciWorkflow`; no additional selector setting.
- New prompt behavior: branch selection and CI-first automatic discovery; explicit `[local]` wins, including on resume. `[repro]` retains its request for a failing test.
- Consumer-owned blocks are adapted only in the temporary execution copy unless the owner requests an adopted-block update. A block that cannot fetch the selected identity causes an explicit blocker. No automatic migration is included.

## Open Questions & Assumptions

- No product decision remains open for the six review findings. The contracts above are the implementation targets for this requested revision.
- GitHub lookup remains in the existing GitHub transport; context blocks own log retrieval. Other CI providers keep their existing behavior. Adding another provider's discovery is outside this change.
- The existing tier-name convention is the mapping contract. Unknown names use the deepest declared gate rather than a new configurable job mapping.
- Historical logs and branches can disappear. Their availability affects the advisory replay only; deterministic full-sequence verification is required and cannot be replaced with a diagnosis-only smoke run.
- A synthetic integration fixture proves bkit's orchestration and state handling, not an actual remote CI service. Final implementation reporting must distinguish fixture verification, fresh-consumer dogfood and any real CI evidence observed.

## Security & Privacy

- Validate reference IDs, repository/workflow identity and branch names before use. Pass external values as process arguments, not interpolated shell program text.
- Treat logs, issue text and fallback payloads as untrusted data. Keep existing secret redaction and bounded output. Read operations do not gain mutation permissions.
- Reject mismatched or incomplete evidence before allowing source changes. Preserve existing approval requirements for CI workflow edits and pushes outside pre-authorized workflows.

## Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why Exempt | Where it belongs |
| --- | --- | --- |
| The historical tag-reading test fix | This plan changes debug orchestration | [#748 — Brand every consumer-facing script, check and style name bkit-*](https://github.com/cbartens/bkit/issues/748) |
| A new CI provider framework or arbitrary job mapping system | Existing GitHub transport, selector and gate convention cover this change | Separate provider/configuration work |
| Prose branch interpretation such as “on dev” | Explicit selectors and existing slash-containing branches have deterministic meanings | Separate parsing work |
| Build's local test step and ship's branch parser | Neither is needed for evidence-first debugging | Their own workflow changes |
| Automatic migration of consumer-owned context blocks | Temporary adaptation and identity checks safely cover execution | Owner-requested migration work |

## Verification and Rollback

- Implementation gates: each task's tests, the full matrix, static/unit/integration gate, clean drift check, stable generated output and fresh-consumer dogfood.
- Evidence gate: selected repository/workflow/run/attempt/commit matches fetched logs; a missing or mismatched receipt blocks diagnosis.
- Completion gate: current-generation fix or an explicitly diagnosed already-fixed state, provisional local pass, then required green CI on the pushed commit. An already-fixed diagnosis must record that conclusion through a generation-stamped remediation/soak result before the local verification path; no fabricated source edit is required.
- Rollback is code-only: revert the implementation and regenerate distributables/mirrors. No database or consumer-block migration is introduced. Confirm that older readers tolerate the additive row fields during Task 4; if they do not, document the compatibility boundary before shipping.

## References

- [#830 — Debug: diagnose a named red CI run before rerunning local tests](https://github.com/cbartens/bkit/issues/830)
- `.bkit/core/workflows/bkit-debug.md`, `.bkit/core/workflows/bkit-auto.md`
- `.bkit/core/engine/commands/workflow/{branches,worktrees,runs,status,tests,steps,context}.ts`
- `.bkit/core/engine/shared/settings.ts` (`readBkitConfig`, `ciWorkflow`)
- `.bkit/core/engine/install/manifest.ts` (`BKIT_DEBUG_GATES`)
- `.bkit/core/prompts/bkit-debug-failure-reproduce.md`
- `.bkit/templates/context/bkit-github.md`, `.bkit/core/.agents/context.md`, `.agents/context.md`
- `.bkit/workflows.md` § Debug and § Local gate scripts; `.bkit/jsonl.md` § Write Idiom
- `docs/templates/bkit-plan.md`, `docs/testing.md`, `.bkit/authoring.md`
