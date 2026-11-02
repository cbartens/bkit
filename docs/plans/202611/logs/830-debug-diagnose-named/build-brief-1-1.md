# Brief: group 1 — Branch and evidence selection

Plan: Diagnose a named red CI run before rerunning local tests — Implementation Plan

## Why and what

### Context & Goals

A known red continuous integration (CI) run is evidence of a failure even when every local test passes. Debug should collect that evidence and diagnose it before running local gates. A gate is a consumer-declared package script that runs a set of checks. Local gates check a fix; the CI run on the pushed commit proves whether a CI-only failure was resolved.

Keep the existing local discovery path when a successful lookup establishes that there is no relevant red run, or the owner explicitly chooses `[local]`. An unavailable lookup is not a successful lookup with no failures.

### Narrative

The owner runs `/bkit-debug #N`, optionally naming an existing branch, a run, or a pull request (PR). Debug resolves the relevant CI evidence, verifies that it belongs to the branch under repair, and diagnoses its logs before local tests. After remediation, debug runs the smallest declared gate covering the failed tiers and checks CI on the pushed commit before reporting success.

### Success Criteria

1. A selected red run reaches Fetch Context and Diagnose with logs for that exact repository, run, attempt and commit, without a discovery gate running first.
2. A newer successful run from an unrelated workflow cannot hide the configured CI workflow's failure. Missing tools, inaccessible logs and mismatched evidence cannot produce a clean outcome.
3. Debug edits only the adopted branch after validating its relationship to the selected run or PR. Resume retains the selected evidence and its progress; an explicit change cannot reuse a previous selection's fix or reproduction.
4. `[local]` explicitly replaces saved CI selection, and `[repro]` still requests a failing regression test before remediation. Post-fix local checks use declared gates and preserve `[live=off]`.
5. Completion requires the existing pushed-head CI gate and verification of the selected workflow when it differs from that gate. A new red result reports the new run and does not close as fixed.

### Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why Exempt | Where it belongs |
| --- | --- | --- |
| The historical tag-reading test fix | This plan changes debug orchestration | [#748 — Brand every consumer-facing script, check and style name bkit-*](https://github.com/cbartens/bkit/issues/748) |
| A new CI provider framework or arbitrary job mapping system | Existing GitHub transport, selector and gate convention cover this change | Separate provider/configuration work |
| Prose branch interpretation such as “on dev” | Explicit selectors and existing slash-containing branches have deterministic meanings | Separate parsing work |
| Build's local test step and ship's branch parser | Neither is needed for evidence-first debugging | Their own workflow changes |
| Automatic migration of consumer-owned context blocks | Temporary adaptation and identity checks safely cover execution | Owner-requested migration work |

## Where it fits

- Group 1: Branch and evidence selection — this group
  - TASK 1: Parse and safely adopt an explicitly named branch. — open
  - TASK 2: Locate and validate the relevant CI evidence. — open
- Group 2: Atomic state and evidence rounds — next
  - TASK 3: Persist selection atomically and route by its generation. — open
  - TASK 4: Record a CI round without pretending to execute local tests. — open
  - TASK 5: Complete and audit CI evidence rounds without weakening local checks. — open
- Group 3: Pinned context and workflow routing — later
  - TASK 6: Pin and validate context evidence. — open
  - TASK 7: Make the shipped evidence blocks honor the selection. — open
  - TASK 8: Wire selection, reproduction and final proof through Debug. — open
- Group 4: Documentation and complete verification — later
  - TASK 9: Update the documentation, reference rows and decision record. — open
  - TASK 10: Verify the complete sequence and regenerate the shipped output. — open
  - TASK 11: Regenerate and inspect the distributable and fresh-consumer footprint. — open

## The work

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** Parse and safely adopt an explicitly named branch.
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

- [ ] **TASK 2:** Locate and validate the relevant CI evidence.
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

Reuse Inventory rows left out: 4; Architecture entries left out: 0 — read them in docs/plans/202611/830-debug-diagnose-named-plan.md § Reuse Inventory and § Architecture & Component Changes.
