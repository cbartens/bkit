# Brief: group 2 — Atomic state and evidence rounds (tests)

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
- Group 2: Atomic state and evidence rounds — this group
  - TASK 3: Persist selection atomically and route by its generation. — open
  - TASK 4: Record a CI round without pretending to execute local tests. — open
  - TASK 5: Complete and audit CI evidence rounds without weakening local checks. — open
- Group 3: Pinned context and workflow routing — next
  - TASK 6: Pin and validate context evidence. — open
  - TASK 7: Make the shipped evidence blocks honor the selection. — open
  - TASK 8: Wire selection, reproduction and final proof through Debug. — open
- Group 4: Documentation and complete verification — later
  - TASK 9: Update the documentation, reference rows and decision record. — open
  - TASK 10: Verify the complete sequence and regenerate the shipped output. — open
  - TASK 11: Regenerate and inspect the distributable and fresh-consumer footprint. — open

## The work

<!-- bkit:task 3 start -->

- [ ] **TASK 3:** Persist selection atomically and route by its generation.
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

- [ ] **TASK 4:** Record a CI round without pretending to execute local tests.
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

- [ ] **TASK 5:** Complete and audit CI evidence rounds without weakening local checks.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/steps.ts`: accept validated CI evidence rounds without local clamp records, checking source, artifact and selection identity while preserving local clamp enforcement.
  - **UPDATE:** `.bkit/core/engine/checks/status-holes.ts`: recognize the evidence-first debug path while retaining required evidence and step auditing.
  - **DEPENDS ON:** 4.
  - **DONE WHEN:** CI evidence artifact completion and status-hole tests pass; forged evidence is refused and local clamp enforcement stays intact. After engine TypeScript changes, `pnpm build` passes and the generated `dist/` changes are ready for the same-step commit.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `finishes validated CI evidence rounds without local clamp records` fails on a genuine CI evidence artifact requires a nonexistent local clamp or forged evidence is accepted.
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `preserves local clamp enforcement when completing test rounds` fails on local test artifacts complete without their required clamp evidence.
    - `.bkit/core/engine/checks/status-holes.test.ts` `audits evidence-first debug rounds without requiring a local discovery run` fails on valid CI rounds are flagged as missing steps or absent required evidence is ignored.

<!-- bkit:task 5 end -->

### Earlier tasks this group depends on

- TASK 2 (group 1, done): Locate and validate the relevant CI evidence. — `.bkit/core/engine/commands/workflow/runs.ts`, `.bkit/core/engine/ledgers/status.ts`

### Derived Test Matrix rows

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
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

## Deviations

Continue bkit-build #830 from the handover. Ignore the one-hour workflow limit and keep going until the build is complete.
