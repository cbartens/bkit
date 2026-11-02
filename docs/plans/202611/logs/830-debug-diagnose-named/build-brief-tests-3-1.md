# Brief: group 3 — Pinned context and workflow routing (tests)

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

- Group 1: Branch and evidence selection — done
  - TASK 1: Parse and safely adopt an explicitly named branch. — done
  - TASK 2: Locate and validate the relevant CI evidence. — done
- Group 2: Atomic state and evidence rounds — done
  - TASK 3: Persist selection atomically and route by its generation. — done
  - TASK 4: Record a CI round without pretending to execute local tests. — done
  - TASK 5: Complete and audit CI evidence rounds without weakening local checks. — done
- Group 3: Pinned context and workflow routing — this group
  - TASK 6: Pin and validate context evidence. — open
  - TASK 7: Make the shipped evidence blocks honor the selection. — open
  - TASK 8: Wire selection, reproduction and final proof through Debug. — open
- Group 4: Documentation and complete verification — next
  - TASK 9: Update the documentation, reference rows and decision record. — open
  - TASK 10: Verify the complete sequence and regenerate the shipped output. — open
  - TASK 11: Regenerate and inspect the distributable and fresh-consumer footprint. — open

## The work

<!-- bkit:task 6 start -->

- [ ] **TASK 6:** Pin and validate context evidence.
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

- [ ] **TASK 7:** Make the shipped evidence blocks honor the selection.
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

- [ ] **TASK 8:** Wire selection, reproduction and final proof through Debug.
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

### Earlier tasks this group depends on

- TASK 1 (group 1, done): Parse and safely adopt an explicitly named branch. — `.bkit/core/engine/commands/workflow/branches.ts`, `.bkit/core/engine/commands/workflow/worktrees.ts`
- TASK 2 (group 1, done): Locate and validate the relevant CI evidence. — `.bkit/core/engine/commands/workflow/runs.ts`, `.bkit/core/engine/ledgers/status.ts`
- TASK 3 (group 2, done): Persist selection atomically and route by its generation. — `.bkit/core/engine/commands/workflow/status.ts`
- TASK 4 (group 2, done): Record a CI round without pretending to execute local tests. — `.bkit/core/engine/commands/workflow/tests.ts`
- TASK 5 (group 2, done): Complete and audit CI evidence rounds without weakening local checks. — `.bkit/core/engine/commands/workflow/steps.ts`, `.bkit/core/engine/checks/status-holes.ts`

### Derived Test Matrix rows

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| locates CI evidence using prompt saved issue and local precedence | Unit | `.bkit/core/engine/commands/workflow/runs.test.ts` | 2 |
| rejects ambiguous cross-repository and malformed attempt references | Unit | `.bkit/core/engine/commands/workflow/runs.test.ts` | 2 |
| filters branch and PR discovery by configured workflow and exact head | Unit | `.bkit/core/engine/commands/workflow/runs.test.ts` | 2 |
| freezes explicit workflow run attempt and all failed job pages | Unit | `.bkit/core/engine/commands/workflow/runs.test.ts` | 2 |
| validates branch fork ancestor divergent and unavailable ancestry evidence | Unit | `.bkit/core/engine/commands/workflow/runs.test.ts` | 2 |
| distinguishes proven automatic no-red from explicit non-red and unavailable lookup | Unit | `.bkit/core/engine/commands/workflow/runs.test.ts` | 2 |
| validates normalized fallback evidence against the requested identity | Unit | `.bkit/core/engine/commands/workflow/runs.test.ts` | 2 |
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

## Deviations

Continue bkit-build #830 from the handover. Ignore the one-hour workflow limit and keep going until the build is complete.
