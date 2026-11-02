## Session Prompt — this run's, newer than everything below

[$bkit-build](/Users/christian/Documents/GitHub/bkit/.agents/skills/bkit-build/SKILL.md) #830

## Issue description — oldest

### Problem

`/bkit-debug` treats the local test rerun (Step 3 — Run Tests, `.bkit/core/workflows/bkit-debug.md:319`) as the gate that decides whether there is anything to fix. A local PASS routes to Summary (Step 10) and Close (Step 11), which pushes the branch and waits for CI. The steps that read the evidence, Fetch Context (Step 4, `bkit-debug.md:385`, `**Run only if** TEST_VERDICT = FAIL or REPRO = true`), Diagnose (Step 6) and Remediate (Step 7), never run.

When the owner names a red CI run in the prompt, that run's logs are the primary evidence (the diagnose prompt says so: "The CI and runtime logs are the primary signal", `.bkit/core/prompts/bkit-debug-failure-diagnose.md:63`), yet Steps 1–3 never read the run id. The `ci` and `diff` context blocks that would fetch its job logs and the diff against the last green commit sit in Step 4, behind the local FAIL.

For a failure that only happens on CI, this is backwards:

- The local tests cannot show the failure, so they pass.
- The run closes, pushes, and CI goes red again for the same reason.
- Nobody has read the red run the owner pointed at.

Observed on #748 (Brand every consumer-facing script, check and style name bkit-*, https://github.com/cbartens/bkit/issues/748), run 1, prompt `/bkit-debug #748 https://github.com/cbartens/bkit/actions/runs/41405235221 red on tests-integration`:

- Step 3 ran the deepest gate, `bkit:gate:static-unit-integration-e2e-live`, although only `bkit-tests-integration` (and the dependent `bkit-tests-check`) was red. 1731 tests across 50 files passed locally.
- The agent then read the CI log on its own and found the cause: all 19 failures are `fatal: invalid object name 'v6.0.0'`. Four test helpers call `git show v6.0.0:<path>` (`.bkit/core/engine/commands/install/upgrade.integration.test.ts:1087`, `:1162`; `.bkit/core/engine/install/modules/core.integration.test.ts:1786`, `:1957`). The tag exists in the local checkout and not in the CI checkout.
- The workflow offered two exits: close as passed (pushes, CI goes red again) or restart with `[repro]`. Neither reaches Diagnose with the evidence already in hand, so the agent stopped and asked.

The order the owner expects is: read what is already red, form a theory, attempt a fix, check the fix, push and let CI give the verdict.

### Outcome

A `/bkit-debug` run that is given a red CI run (in the prompt, or found on the issue) reads that run first, diagnoses from its logs and the diff against the last green commit, applies a fix, checks the fix with the local lane that was red, and only then pushes. The local test run stops deciding whether there is a problem; CI already settled that.

The local test run keeps two jobs:

- Discovery, when no CI run is named and the issue holds none: running the tests locally is the only way to find the failure. Today's Step 3 behaviour stays for this case.
- Post-fix check, after Remediate: run the lane that was red, or the deepest gate when the lane is unknown. PASS means the fix did not break that lane further, not that the bug is gone. FAIL loops back to Diagnose as today.

### Success criteria

- A prompt naming a red run reaches Fetch Context and Diagnose without a local FAIL, and the diagnosis cites the run's job logs.
- A run with no CI run named behaves as today: local tests first, FAIL routes to Fetch Context.
- After a fix, the local check runs the red lane only when the consumer declares a gate for it, and otherwise the deepest declared gate.
- Gate 3's `Live fail-then-pass observed` is satisfied for a CI-only failure by the red run before and the green CI run after the push, not by a local fail.
- The close step still gates the pushed commit's CI run, so a fix that did not work still lands on the Failure Path with the new red run id.

### Constraints and non-goals

- bkit hardcodes no CI host, workflow filename, branch name or e2e framework (`.agents/context.md` § Contexts). Reading the run's logs stays in the consumer's `ci` context-fetch block; the workflow only has to reach that block earlier and hand it the run id.
- Mapping a red CI job to a local gate needs a consumer-declared mapping. Without one, the post-fix check runs the deepest declared gate, as today.
- No change to `/bkit-build` Step 12 (Run Tests): a build has no red run to read.
- The `[repro]` flag keeps its meaning (write a failing test first). It is not the fix for this issue, since the failure here is already reproduced by the CI run.
- The one-off cause on #748 (tests reading the `v6.0.0` tag) is fixed on that branch, not here.

### Decisions already made

- The local test run never gates a run that was given a red CI run. The red run is the evidence; local tests are a post-fix check.
- When no run is named, local tests remain the discovery step.
- Fail-then-pass for a CI-only failure is observed on CI, after the push, by the existing close.
- Any `.github/workflows/` change a diagnosis proposes still needs the owner's sign-off; this issue does not loosen that.

### Open questions

- How Step 1 learns the run id when the prompt names none: the latest failed run on the branch, the PR's failing checks, or an `actions/runs/<id>` link in the issue body or comments? Which wins when they disagree?
- Does `bkit status route --prompt-file` grow a `ciRun` output, or does a new `fids`-style parse verb own the URL?
- Where the lane-to-gate mapping lives (`package.json` `bkit.*`, or the `ci` context block's `# Customise:` knobs), and whether `bkit tests run` gains a `--gate=<one name>` call path for it or already covers it.
- Whether a cheap local reproduction attempt is still worth running early when the red lane has a local gate, since a failure that does reproduce locally gives a much faster fix loop (minutes per try against a full CI round trip).
- How the Loop Question and `debug.fix.maxAttempts` count when the first attempt starts at Diagnose instead of Run Tests.

### References

- `.bkit/core/workflows/bkit-debug.md` Step 3 (`:319`), Step 4 (`:383`), Step 9 (`:564`), Step 10 (`:589`), Gate 3 (`:374`)
- `.bkit/core/prompts/bkit-debug-failure-diagnose.md:56-63` (external context first; CI logs are the primary signal)
- `.agents/context.md` § Contexts (`ci`, `diff` blocks)
- `.bkit/workflows.md` § `debug-run-tests` artifact row
- `docs/testing.md:554` (debug gates on the declared live tier)
- Red run: https://github.com/cbartens/bkit/actions/runs/41405235221 (commit `9630471bf`, `bkit-tests-integration` and `bkit-tests-check` failed; scope, unit and static passed)
- #748 Brand every consumer-facing script, check and style name bkit-* — https://github.com/cbartens/bkit/issues/748 (the run that hit this)
- Parent: #750 Workflow optimisation — https://github.com/cbartens/bkit/issues/750

## Issue comment — posted 2026-11-02T07:45:31.000Z

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

The first test-round artifact identifies the red run; it contains no invented local test result. Fetch Context contains the selected attempt's `fatal: invalid object name 'v6.0.0'` failures. Diagnosis cites those logs. If the branch already contains the fix, diagnosis reports that fact rather than manufacturing another change. This historical replay proves selection and diagnosis only; Task 9 separately verifies the complete fix-to-CI sequence with controlled fixtures.

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
| Capability | Existing owner | Decision |
| --- | --- | --- |
| Consumer CI selector | `readBkitConfig` in `.bkit/core/engine/shared/settings.ts`; `ciDeclared`, workflow-filtered wait/gate queries in `commands/workflow/runs.ts` | EXTEND the callers; reuse `bkit.testing.ciWorkflow`, with no new config key. |
| Branch adoption | `.bkit/core/engine/commands/workflow/worktrees.ts` | EXTEND its existing debug adoption and ship `--branch` machinery. |
| CI and PR reads | `.bkit/core/engine/commands/workflow/runs.ts` | EXTEND with `locate`; reuse transport and identity checks, not the unfiltered `runContext` selection. |
| Resume and routing | `debugStart` and metadata folding in `.bkit/core/engine/commands/workflow/status.ts` | EXTEND with one atomic selection and generation. |
| Test-round recording | `.bkit/core/engine/commands/workflow/tests.ts` | EXTEND with a recorded CI evidence round and generation-scoped fix lookup. |
| Context execution | `.bkit/core/engine/commands/workflow/context.ts` and `.bkit/templates/context/bkit-github.md` | EXTEND with a pinned identity and validation of fetched evidence. |
| Reproduction | Existing Failure Reproduce step and `.bkit/core/prompts/bkit-debug-failure-reproduce.md` | REUSE its failing-test contract; extend routing to reach it for a CI round. |
| Final verification | `runs dispatch`, `runs wait`, `runs gate` | REUSE exact pushed-head checking; extend only where selecting another workflow requires carrying its selector. |

The searches for this revision inspected `debugStart`, `runContext`, `BKIT_DEBUG_GATES`, the existing `ciWorkflow` setting and query sites, the Debug workflow, the reproduction prompt, and the context blocks. Recheck changed symbol locations before implementation; line numbers from the original plan are not contracts.

## Derived Test Matrix

Paths in this table are relative to `.bkit/core/engine/`.

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| Branch tokens, explicit missing branch, ambiguous branches, URL exclusion | Unit | `commands/workflow/branches.test.ts` | 1 |
| Adopt existing branch; refuse missing/main and conflicting existing worktree without mutation | Unit | `commands/workflow/worktrees.test.ts` | 1 |
| Reference precedence, issue references, `[local]`, ambiguity, repository and attempt validation | Unit | `commands/workflow/runs.test.ts` | 2 |
| Configured workflow red while unrelated workflow green; PR selection at exact head | Unit | `commands/workflow/runs.test.ts` | 2 |
| Explicit workflow identity; branch mismatch, fork, ancestor, divergent and unknown-history cases | Unit | `commands/workflow/runs.test.ts` | 2 |
| Lookup failures never become no-red; fallback evidence validation; paginated jobs | Unit | `commands/workflow/runs.test.ts` | 2 |
| Atomic selection, stable resume, explicit clear, explicit replacement, new attempt, finished-run isolation | Unit | `commands/workflow/status.test.ts` | 3 |
| Gate order for one/multiple tiers, unknown failed job and `[live=off]` | Unit | `commands/workflow/status.test.ts` | 3 |
| CI evidence round executes no gate; matching fix runs gate; old-generation fix does not | Unit | `commands/workflow/tests.test.ts` | 4 |
| Invalid/no active debug state refused; CI rows accepted by row/schema readers | Unit | `commands/workflow/tests.test.ts`, relevant ledger tests | 4 |
| CI-only evidence artifact and step completion work without a local clamp; local clamp enforcement preserved | Unit | `commands/workflow/steps.test.ts`, `checks/status-holes.test.ts` | 4 |
| Context env is pinned and absent without selection; old/mismatched/empty/partial evidence rejected | Unit | `commands/workflow/context-fetch.test.ts` | 5 |
| Template fetches selected attempt without branch discovery; unpinned discovery uses configured workflow | Unit | `audits/templates/context-github-ci-block.test.ts` | 6 |
| Adopted CI block equals the shipped block; pinned diff ends at the selected commit | Unit | `audits/templates/context-github-ci-block.test.ts` | 6 |
| `[repro]` CI routing, generation-scoped reproduction, and NO cannot reach successful Summary | Unit | `audits/workflows/` existing debug contract suite | 7 |
| Close checks pushed SHA, preserves configured gate, verifies selected other workflow, retains both run links | Unit | `commands/workflow/runs.test.ts`, debug workflow audit suite | 7 |
| Complete CI round → logs → fix → local gate → close, with green and red final CI variants | Integration | `audits/workflows/debug-ci-evidence.integration.test.ts` | 9 |
| Resume and explicit replacement across serialized status files; unavailable evidence blocks before edits | Integration | `audits/workflows/debug-ci-evidence.integration.test.ts` | 9 |
| Docs, CLI help, mirrors and ledger rows agree with final contracts | Static | existing CLI, workflow, render and ledger audits | 8–9 |
| Explicit historical-run replay reaches diagnosis with matching logs and no local discovery gate | Smoke | scratch consumer artifacts | 9 |

## Agent Execution Runbook

For every code task, write the named behavioral tests first, run them and observe the intended failure, then implement and run the targeted tests. A missing test file or compile/import error is not the intended red. Commit only the task's files after its checks. Every new CLI verb or flag needs its help, output fields and exit codes per `commands/conventions.test.ts`.

<!-- bkit:group 1 start -->

### TASK GROUP 1: Engine — selection, state and recorded evidence

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** Parse and safely adopt an explicitly named branch.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/branches.ts`: add `parse --prompt-file` with `branch`, `via` and `where` outputs. Validate candidates with `git check-ref-format --branch` and exact `refs/heads/` or `refs/remotes/origin/` existence checks. Deduplicate the same branch found locally and remotely.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/worktrees.ts`: accept `--branch` for debug, preserving ship behavior and keeping `--issue` ship-only. An existing worktree must match the requested branch. Reuse the existing adoption path; do not switch a conflicting checkout or create a missing branch.
  - **EXIT CONTRACT:** `branches parse`: 0 for one branch or no candidate, 3 for a missing explicit branch, 8 for ambiguity. Existing setup refusal codes remain documented. Ambiguous or conflicting user input stops before edits.
  - **DEPENDS ON:** none.
  - **DONE WHEN:** matrix rows for Task 1 pass, including a sentinel proving a conflicting worktree and its branch remain unchanged; CLI help documents debug branch adoption.
  - **TEST FIRST:** tests fail because valid explicit adoption is refused, ambiguity is not surfaced, or a conflicting worktree is accepted. Include implicit non-branch paths and a URL so branch parsing cannot consume them.

<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->

- [ ] **TASK 2:** Locate and validate the relevant CI evidence.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/runs.ts`: add pure reference parsing and `runs locate --prompt-file --issue-text-file --branch --repo --file --selection-out`. `--file` is the active status log when available; `--selection-out` writes the validated candidate selection JSON for Task 3. Inputs and output paths are explicit; do not change active metadata from this read operation.
  - **IMPLEMENT:** apply Reference precedence and CI lookup above. Read `readBkitConfig(root).ciWorkflow`; branch and PR discovery filter by that workflow. Reuse `runGh`, existing workflow-filtered queries and pagination helpers. Fetch selected-attempt metadata and jobs, retaining the workflow ID/path, head repository, head branch and head commit.
  - **VALIDATE:** branch alignment and commit ancestry before emitting an actionable CI selection. Treat an ancestry check error distinctly from proven non-ancestry. Unknown failed jobs yield `redTiers: []` for default gate order and remain listed in `failedJobs`.
  - **OUTPUT:** `selection`, `runId`, `runUrl`, `runAttempt`, `workflowId`, `workflowPath`, `headSha`, `headRelation` (`current`, `ancestor`, `divergent`, `unknown`), `failedJobs`, `tiers`, `via`, `reason`, `selectionFile`. CI summary fields are null or empty for local selection.
  - **EXIT CONTRACT:** 0 for validated red selection; 1 only for a valid local selection (`[local]`, saved local, successful automatic no-red, or no configured CI). Exit 2 for invalid arguments, 8 for ambiguous/conflicting user references, 80 for unavailable transport eligible for the existing read fallback, and 82 when the named evidence or alignment needs owner action. A malformed response or incomplete required read is never exit 1.
  - **FALLBACK:** add `--evidence-file` for a bounded, normalized response collected through the mapped GitHub read tools after exit 80. Validate it with the same parser and branch checks as the CLI response. Its schema carries the lookup request, selected run/attempt metadata and complete jobs, or an explicit successful no-red result with the inspected selector/head. Reject mismatched selectors and missing identity fields. Record the single transport transition with the existing transport-row mechanism and independently re-read the selected identity before proceeding.
  - **UPDATE:** `.bkit/core/engine/ledgers/status.ts`: place the shared selection type, validation and identity helper alongside the existing status-row contract, with focused cases in its existing test file. Both `runs.ts` and `status.ts` consume these helpers; do not make `status.ts` import `runs.ts`, which already imports `status.ts`.
  - **IMPLEMENT:** read an active run's saved object through the existing metadata-folding helpers. Task 3 extends the metadata writer and routing; lookup does not depend on those future writer changes to read fixture state.
  - **DEPENDS ON:** none.
  - **DONE WHEN:** Task 2 matrix rows pass; a newer unrelated green workflow cannot change selection; unavailable and partially paged evidence cannot emit local selection; help documents every result and exit code.
  - **TEST FIRST:** use injected transport fixtures for unrelated workflows, explicit run/attempt, conflicting branches, PR heads, paginated jobs, no configured workflow, successful no-red, auth/network errors and fallback shape mismatch. Assert the workflow/head/attempt query arguments and selection identity, not merely exit status.

<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->

- [ ] **TASK 3:** Persist selection atomically and route by its generation.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/status.ts`: implement `status meta --ci-selection-file` and generation assignment under Atomic saved selection. Extend `debugStart` and `status route` to expose the derived values and reorder `BKIT_DEBUG_GATES`.
  - **UPDATE:** existing status/ledger row types and validators wherever metadata is constrained. Reuse the active-run predicate from `debugStart`; an unrelated or finished run cannot provide evidence or progress.
  - **IMPLEMENT:** mode changes or changed CI identities increment `ciGeneration`; identical identities preserve it. A local variant replaces the whole object, removing stale tiers and references. Route `[local]` before reading saved CI fields. Validate the complete object before appending any row.
  - **IMPLEMENT:** expose current-generation reproduction and fix completion in routing so the workflow does not perform its own unscoped search. Keep global attempt counters unchanged; they count actual fixes across generations and runs.
  - **DEPENDS ON:** 2.
  - **DONE WHEN:** Task 3 matrix rows pass; serialized/reloaded state preserves the same identity and generation; replacement makes prior fix/reproduction rows ineligible; existing no-CI routing is unchanged.
  - **TEST FIRST:** seed an active run with CI evidence and fix rows, then test `[local]`, identical write, a new run, a new attempt of the same run, malformed selection and a finished workflow. Assert both persisted state and computed routing.

<!-- bkit:task 3 end -->

<!-- bkit:task 4 start -->

- [ ] **TASK 4:** Record a CI round without pretending to execute local tests.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/tests.ts`: add `tests run --ci-run --ci-url`; require `--file`, an active debug run and a matching validated saved CI selection. Reject a flag/metadata mismatch. Read the current generation and its DONE remediation/soak rows.
  - **IMPLEMENT:** before a matching fix, create the evidence artifact identifying repository, workflow, run, attempt, commit and URL. State that the local gate was not run. Append the test-run row defined in Tests, reproduction and proof; emit `source`, `verdict`, `scope`, `gate: null`, nullable `failures`, `runAttempt`, `ciGeneration`; return 1. After a matching fix, use the normal local gate runner and emit `source: local`.
  - **UPDATE:** `appendTestRun`, row types and telemetry/status validators to accept this bounded CI variant. Preserve numeric local exit codes and existing local validation. Do not loosen schemas for unrelated row kinds.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/steps.ts` and its tests only where needed to complete a CI evidence round without a local clamp record. Validate the CI source, artifact and selection identity; preserve local clamp requirements. Workflow Step 3 passes the clamp argument only for local output.
  - **DEPENDS ON:** 3.
  - **DONE WHEN:** Task 4 matrix rows pass; a local-gate marker is absent before a matching fix and present after one; status audit, summary and telemetry accept the CI variant without treating it as a zero-failure local pass.
  - **TEST FIRST:** seed current/old-generation remediation and soak rows, exercise both branches, and assert exact row/artifact contents. Exercise missing status, closed run, mismatched run flags and local clamp enforcement.

<!-- bkit:task 4 end -->

<!-- bkit:task 5 start -->

- [ ] **TASK 5:** Pin and validate context evidence.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/context.ts`: add `context fetch --ci-selection-file`. Validate the same selection schema. Set `BKIT_CI_RUN_ID`, `BKIT_CI_RUN_ATTEMPT`, `BKIT_CI_REPO` and `BKIT_CI_HEAD_SHA` in the child environment for a selected CI run; remove inherited values of these variables when no CI selection is supplied.
  - **CONTRACT:** a selected `ci` block emits one machine-readable identity line, `bkit-ci-evidence: <JSON>`, with `provider`, `repo`, `runId`, `runAttempt`, `headSha`, `workflowId`, and `complete: true`, followed by the logs. The block emits `complete: true` only after every required metadata/job/log read succeeds. Parse and compare the identity with the selection. Empty logs, skip breadcrumbs, partial evidence or mismatched identity cannot count as fetched evidence for diagnosis.
  - **COMPATIBILITY:** existing consumer-owned blocks are not rewritten automatically. Step 4 already customises a temporary script; adapt that script to honor the selected identity and emit the receipt. If the block's provider or available tools cannot supply it, retain the output as unchecked evidence and stop before diagnosis. A matching header with no logs is insufficient.
  - **FALLBACK:** use the existing mapped metadata/log read tools when the block cannot use `gh`, preserving the repository, attempt, workflow and commit. Feed the normalized result through the same identity/content validation before producing a checked artifact; do not bypass validation by manually claiming CHECKED.
  - **UPDATE:** `.bkit/core/.agents/context.md` (managed source) with the input environment and identity-line contract. Locate its source references before editing. Update the self-contained-block wording so the optional input pin is explicit; blocks still share no mutable state.
  - **DEPENDS ON:** 3.
  - **DONE WHEN:** Task 5 matrix rows pass; a legacy block returning another run is rejected; a correctly adapted temporary block succeeds; unavailable logs cannot route to Diagnose.
  - **TEST FIRST:** execute fixture blocks with matching identity and logs, wrong run/attempt/commit, no identity, empty logs, a skip breadcrumb and partial status. Assert child env cleanup with stale inherited values and validate the fallback output through the same path.

<!-- bkit:task 5 end -->

<!-- bkit:group 1 end -->

<!-- bkit:group 2 start -->

### TASK GROUP 2: Templates, workflow, documentation and verification

<!-- bkit:task 6 start -->

- [ ] **TASK 6:** Make the shipped evidence blocks honor the selection.
  - **UPDATE:** `.bkit/templates/context/bkit-github.md`, the `context=ci` block: when pinned, read the exact repository/run/attempt and do not call branch discovery. Validate returned metadata before fetching complete, bounded job logs. Include failed/timed-out/startup-failure evidence where available; missing logs remain unavailable, not a clean result.
  - **UPDATE:** its unpinned discovery to use the consumer's existing configured workflow selector. Resolve the setting through the existing configuration convention; do not add a second default filename or setting. Preserve no-config and tool-unavailable breadcrumbs.
  - **UPDATE:** the `context=diff` block to use the selected failing commit as the diff endpoint when pinned. Find a successful baseline of the same selected workflow on the configured baseline branch at or before the failing run; validate ancestry. Report an unavailable baseline honestly rather than diffing unrelated or newer code. Unpinned behavior retains the existing discovery path.
  - **UPDATE:** bkit's adopted blocks below `bkit:end` in `.agents/context.md` to match the shipped blocks. Do not edit the managed header; Task 5 changes its source and regeneration writes the mirror.
  - **CREATE:** `.bkit/core/engine/audits/templates/context-github-ci-block.test.ts`: execute the actual bash blocks with a stub `gh` and temporary Git history. Assert repository/attempt pinning, query selectors, complete evidence receipts, multiple jobs, errors and baseline/end commit choice. Verify adopted/template equality.
  - **DEPENDS ON:** 5.
  - **DONE WHEN:** Task 6 matrix rows pass and existing context-fetch preflight tests report no unbounded command regression. A pin cannot be ignored without failing the test.
  - **TEST FIRST:** pinned CI calls `gh run view` or the attempt-specific API and never `gh run list`; unpinned CI includes the configured workflow; an older selected failure produces a diff ending at its SHA rather than current HEAD; a wrong attempt and partial job read fail validation.

<!-- bkit:task 6 end -->

<!-- bkit:task 7 start -->

- [ ] **TASK 7:** Wire selection, reproduction and final proof through Debug.
  - **UPDATE:** `.bkit/core/workflows/bkit-debug.md` header and Steps 1–2: parse branch input, adopt safely, resolve evidence with prompt/current issue text/active status, and validate branch alignment. Persist the validated selection, then rederive gates. Run this resolution before resuming a downstream step so explicit reference or `[local]` overrides cannot be skipped on resume.
  - **UPDATE:** Step 2 routing: exit 1 means an explicit local choice or a proven no-red result; exit 80 enters the existing mapped read fallback, not local-first; unresolved unavailable evidence stops with its reference. Ambiguous references or branch conflicts use an owner stop before tests or edits. Record fallback transport and pause state using existing mechanisms.
  - **UPDATE:** Step 3: pass CI flags only for the saved CI selection, record `source` and `ciGeneration`, and condition local clamp arguments on `source: local`. Preserve attempt counters and normal local FAIL loops. A changed CI generation restarts evidence collection regardless of previous fix rows.
  - **UPDATE:** Step 4: pass the selection file to every applicable fetch, require validated selected-run logs before diagnosis, and record explicit unavailable/partial outcomes. Capture current-generation context; do not let an older context artifact satisfy the evidence check.
  - **UPDATE:** Steps 4–5: route `[repro]` with known CI evidence to Failure Reproduce once for the current generation. Stamp its row. YES proceeds to Diagnose/Soak without an unnecessary discovery gate; NO stops with the reproduction blocker. Keep the existing local-only reproduction path. Do not clear `REPRO` merely because CI is red.
  - **UPDATE:** Steps 6–8: supply the selected evidence identity and stamp diagnosis, remediation and soak rows with `ciGeneration`. The DONE fix row authorizes the next local gate only for that generation.
  - **UPDATE:** Gate 3: verify the current evidence/test round and its artifact. Move the CI fail-then-pass requirement to Gate 11 after push and verification. Do not claim a future green result at Gate 3.
  - **UPDATE:** Steps 10–11 and `.bkit/core/engine/commands/workflow/runs.ts` only where necessary: retain the configured pushed-head gate; carry the selected workflow's ID/path through wait/gate for an explicit different workflow. Keep input evidence IDs separate from `VERIFY_RUN_ID`/verification URL. A completed red, skipped, cancelled, absent or unavailable verifying run cannot complete the CI-only fix. Close comments and the final report name both the original failure and the verifying run.
  - **CHECK:** `.bkit/core/workflows/bkit-auto.md` dispatch. Its debug invocation must preserve the exact run it is acting on instead of assuming later branch discovery finds the same run. If it currently omits that reference, pass the existing held run explicitly and update the workflow catalog and audits in this task; do not change auto's routing policy.
  - **UPDATE:** existing debug workflow audits, status-hole tests and CLI tests for any expanded wait/gate parameters. Read diagnose/remediate/soak prompts for conflicts with the new evidence contract; edit only a conflicting input/routing statement, updating `.bkit/core/.bkit/prompts.md` if a prompt changes.
  - **DEPENDS ON:** 1, 2, 3, 4, 5, 6.
  - **DONE WHEN:** Task 7 matrix rows pass; no CI-reproduction NO path reaches successful Summary; no path declares CI-only resolution before the pushed-head checks. Existing local-only debug and auto dispatch tests still pass.
  - **TEST FIRST:** audit the actual routing blocks and exercise their command sequences with fixtures. Assert `[repro]` ordering, generation fields, conditional clamp handling and both old/new run links. Unit-test an explicit other-workflow target so a green configured workflow alone is insufficient.

<!-- bkit:task 7 end -->

<!-- bkit:task 8 start -->

- [ ] **TASK 8:** Update the documentation, reference rows and decision record.
  - **UPDATE:** `.bkit/core/.bkit/workflows.md` source: Debug modes, Steps 1–8 and Close, branch adoption, the evidence-round artifact contract, current-generation progress and local gate ordering. Include auto's exact-run handoff if Task 7 changes it.
  - **UPDATE:** `.bkit/core/.bkit/templates.md` for the changed CI/diff block inputs and evidence output contract. Update `.bkit/core/.bkit/prompts.md` only if Task 7 changes a prompt. Regenerate the installed catalogs.
  - **UPDATE:** `docs/testing.md`: distinguish CI evidence, explicit reproduction, local post-fix checks and pushed-head proof. Document the new integration test and the retained `[live=off]`/live-skipped behavior.
  - **UPDATE:** CLI documentation through `pnpm cli:sync`, never by hand. Document the existing `bkit.testing.ciWorkflow` selector and the new selection-file flags, row fields, environment inputs, identity receipt and exit behavior in their canonical homes.
  - **CREATE:** one decision row through `bkit ledgers append --ledger=decisions --rows=-`, using an engine-generated timestamp and key `830-red-ci-run-is-the-first-test-round`. Reference the related issue with its title and URL. Record evidence-first routing, configured workflow filtering, branch validation, stable selection/generation, explicit local/repro precedence, unavailable-evidence blocking and final CI proof. Do not add a migration row.
  - **DEPENDS ON:** 7.
  - **DONE WHEN:** CLI-doc and ledger-integrity tests, prose lint and formatting pass. No edited catalog says all blocks independently discover their run, `[repro]` is ignored for CI, or an unavailable CI read proves there is no red run.
  - **TEST FIRST:** n/a for prose and ledger text; existing documentation and schema audits verify their format. Behavioral rules are covered by Tasks 1–7.

<!-- bkit:task 8 end -->

<!-- bkit:task 9 start -->

- [ ] **TASK 9:** Verify the complete sequence and regenerate the shipped output.
  - **CREATE:** `.bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts`. Follow existing workflow-snippet integration fixtures: use a fresh temporary consumer, real CLI commands/status files/context execution, the actual workflow command blocks and an argv-checking fake CI transport. Stub the remote boundary and agent-produced fix artifact, not selection, metadata folding, gate execution, context validation or final gate evaluation.
  - **TEST FIRST:** first fixture is a red selected integration run with a newer unrelated successful workflow. Assert that no local-gate sentinel exists before diagnosis, the context identity matches, a matching remediation row enables the selected local gate, and the final verifier queries the exact pushed commit. Run the final response once green and once red; only green may complete.
  - **TEST FIRST:** persist and reload an active run with a completed fix, then explicitly replace the evidence. Assert that a new CI generation reaches context/diagnosis again, even if a local gate would pass. Cover `[local]` clearing, `[repro]` ordering/failure, missing logs and wrong-branch selection without source edits.
  - **UPDATE:** generated outputs via the existing `pnpm bkit:generate` once after source edits. Run the prescribed build, CLI/instruction sync, mirror generation, snapshots and graph refresh through that script; inspect the generated diff. Do not hand-edit mirrors.
  - **VERIFY:** run the unit and integration tests named by the matrix, then `pnpm bkit:gate:static-unit-integration` and `bkit check`. Run generation again only to prove idempotence or after a change; it must add no new delta. Inspect that the working tree contains only intended changes.
  - **DOGFOOD:** build the actual distributable, install it into a fresh scratch consumer, and run the relevant built CLI commands. Inspect the selection metadata, evidence artifact, context logs, conditional local-gate sentinel and generated host files on disk. Keep fixtures under the repo's temporary directory and use no production mutation.
  - **HISTORICAL SMOKE:** in a scratch checkout, pass the exact existing branch and explicitly pinned historical run from Concrete Example. Record the selected attempt and confirm the fetched identity and diagnosis. Do not rely on that branch's latest run. If logs have expired or the branch is gone, report this smoke check as unavailable; the deterministic integration proof still runs and the historical replay is not falsely reported as passing.
  - **DEPENDS ON:** 8.
  - **DONE WHEN:** the complete deterministic green and red sequences pass, all matrix rows are covered, required gates pass, generated files are stable, and fresh-consumer artifacts demonstrate the shipped behavior. Report historical smoke availability separately from automated verification.

<!-- bkit:task 9 end -->

<!-- bkit:group 2 end -->

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
