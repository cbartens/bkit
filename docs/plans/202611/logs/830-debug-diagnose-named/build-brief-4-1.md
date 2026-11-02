# Brief: group 4 — Documentation and complete verification

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
- Group 4: Documentation and complete verification — this group
  - TASK 9: Update the documentation, reference rows and decision record. — open
  - TASK 10: Verify the complete sequence and regenerate the shipped output. — open
  - TASK 11: Regenerate and inspect the distributable and fresh-consumer footprint. — open

## The work

<!-- bkit:task 9 start -->

- [ ] **TASK 9:** Update the documentation, reference rows and decision record.
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

- [ ] **TASK 10:** Verify the complete sequence and regenerate the shipped output.
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

- [ ] **TASK 11:** Regenerate and inspect the distributable and fresh-consumer footprint.
  - **READ:** `package.json`: use the existing `pnpm bkit:generate` pipeline for build, CLI and shared-instruction sync, mirror regeneration, render snapshots and graph refresh.
  - **READ:** `docs/testing.md`: run the unit and integration matrix, `pnpm bkit:gate:static-unit-integration` and `bkit check`; report skipped tooling honestly.
  - **UPDATE:** `.bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts`: verify the complete fixture sequence without weakening the tests recorded by the test-writing step.
  - **DEPENDS ON:** 10.
  - **DONE WHEN:** Generated output is stable after a second generation, required gates pass, and the built CLI installed into a fresh scratch consumer demonstrates selection metadata, checked context, conditional local-gate execution and rendered host files on disk. Replay the exact pinned historical run and branch from Concrete Example in scratch and report its availability separately; expired logs or a deleted branch are unavailable, not a passing smoke test. Keep scratch fixtures under repo-root `tmp/` and inspect only intended changes.
  - **TEST FIRST:** n/a — generated baselines and fresh-consumer dogfood verification; behavioral regression tests belong to Task 10.

<!-- bkit:task 11 end -->

### Earlier tasks this group depends on

- TASK 8 (group 3, done): Wire selection, reproduction and final proof through Debug. — `.bkit/core/workflows/bkit-debug.md`, `.bkit/core/engine/commands/workflow/runs.ts`

Reuse Inventory rows left out: 4; Architecture entries left out: 0 — read them in docs/plans/202611/830-debug-diagnose-named-plan.md § Reuse Inventory and § Architecture & Component Changes.

## Deviations

Continue bkit-build #830 from the handover. Ignore the one-hour workflow limit and keep going until the build is complete.
