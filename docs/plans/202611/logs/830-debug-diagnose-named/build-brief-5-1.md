# Brief: group 5 — Challenge round 1 findings

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
- Group 3: Pinned context and workflow routing — done
  - TASK 6: Pin and validate context evidence. — done
  - TASK 7: Make the shipped evidence blocks honor the selection. — done
  - TASK 8: Wire selection, reproduction and final proof through Debug. — done
- Group 4: Documentation and complete verification — done
  - TASK 9: Update the documentation, reference rows and decision record. — done
  - TASK 10: Verify the complete sequence and regenerate the shipped output. — done
  - TASK 11: Regenerate and inspect the distributable and fresh-consumer footprint. — done
- Group 5: Challenge round 1 findings — this group
  - TASK 12: A local Debug round cannot finish because its missing source suppresses the required clamp argument. — open
  - TASK 13: Replacing CI evidence during a resumed run makes the next evidence round impossible to finish. — open
  - TASK 14: A fork's green PR run can validate a still-red same-repository workflow at the pushed commit. — open

## The work

<!-- bkit:task 12 start -->
- [ ] **TASK 12:** A local Debug round cannot finish because its missing source suppresses the required clamp argument.
  **Severity:** HIGH · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/tests.ts:1876` · **Round:** 1
  - **DONE WHEN:** Every executed local round returns `source: local`, including a fresh no-CI run and an explicit `[local]` replacement. Debug Step 3 passes the existing clamp record and completes the round through `steps finish`; local clamp enforcement remains intact.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts` `finishes local-only rounds through the actual Debug Step 3 commands` fails when a fresh local run or an explicit local override executes its gate successfully but the workflow-derived finish command exits 2 with `local test completion needs clamp evidence`.
<!-- bkit:task 12 end -->

<!-- bkit:task 13 start -->
- [ ] **TASK 13:** Replacing CI evidence during a resumed run makes the next evidence round impossible to finish.
  **Severity:** HIGH · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/workflows/bkit-debug.md:352` · **Round:** 1
  - **DONE WHEN:** The test-run row and its `steps finish` row use the same current test-round attempt, independently of the Debug workflow run number. A second evidence generation in the same run and the first evidence round in a later Debug run both finish with matching selection identity and without weakening CI evidence validation.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts` `finishes replacement CI evidence with the unchanged debug run number` fails when selection changes after a completed evidence round, `DEBUG_ATTEMPT` remains the run number, and the real Step 3 finish command rejects the new valid evidence.
    - `.bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts` `finishes the first CI evidence round of the second debug run` fails when `DEBUG_ATTEMPT=2` writes a test-run attempt of 2 but `steps finish --attempt=next` derives round 1.
<!-- bkit:task 13 end -->

<!-- bkit:task 14 start -->
- [ ] **TASK 14:** A fork's green PR run can validate a still-red same-repository workflow at the pushed commit.
  **Severity:** HIGH · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/runs.ts:2138` · **Round:** 1
  - **DONE WHEN:** The additional selected-workflow gate accepts only runs whose repository and head repository match the saved repository, whose branch and commit match the verification target, and whose event matches an explicitly requested event. Missing or mismatched provenance cannot replace the same-repository result. Keep this scoped to the newly added selected-workflow verification path.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/runs.test.ts` `rejects fork verification runs that shadow a red selected workflow at the same head` fails on the configured gate being green, selected-workflow run 301 being a red same-repository push, and newer run 302 being a green fork PR with the same workflow ID, head SHA and branch: the current gate returns exit 0, passed true and verifyingRunId 302. Require refusal both without an event flag and with `--event=push`, and require refusal when the head-repository identity is missing.
    - `.bkit/core/engine/commands/workflow/runs.test.ts` `preserves the requested event for selected-workflow verification` fails on a newer green same-repository pull_request result masking the selected workflow's red push despite `--event=push`; require the push result to decide the gate and retain a same-repository matching-event success control.
<!-- bkit:task 14 end -->

## Deviations

Continue bkit-build #830 from the handover. Ignore the one-hour workflow limit and keep going until the build is complete.
