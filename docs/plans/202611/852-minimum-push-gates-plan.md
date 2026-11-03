# Minimum Push Gates Implementation Plan

> [!CAUTION]
> **Purpose:** Implement verified minimum gates for bookkeeping pushes and temporary landings.
> **Rules:** Keep classification conservative and record verification before completion.

## Context & Goals

Implement [#852 — Use minimum gates for verified bookkeeping across push paths](https://github.com/cbartens/bkit/issues/852) on `dev`, as requested on 2026-11-03. The existing branch-wide classifier reruns full tests after a checked code push when only bookkeeping was added. Temporary landings currently disable hooks entirely.

## Acceptance Scenario

### Narrative

A full local push gate checks a clean commit. Later pushes that add only allowed bookkeeping over that checked commit run `bkit:gate:min`. Every outgoing ref contributes to the decision. Temporary landings explicitly validate their exact committed tree.

### Success Criteria

- Successful full gates record local evidence bound to the unchanged clean commit and required gate.
- A fast-forward bookkeeping increment over a checked ancestor selects the minimum gate; missing evidence, code, rewritten history and mixed updates select the full gate.
- Existing whole-branch bookkeeping classification still works without a receipt.
- Temporary landings run minimum or full validation according to their actual changes, and a failed or mutating gate prevents the push.
- CI-suppressor enforcement remains separate; required CI still runs.

### Concrete Example

Push a code commit after the full gate passes. Add a ship summary and push again. The second push runs the minimum gate. Add a source change under a docs commit subject: the full gate runs.

### Edge Cases

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| Empty trigger commit | Minimum only with positive checked-ancestor evidence. |
| Missing, malformed or incompatible receipt | Full gate. |
| Dirty or mutating checkout | No reusable full-gate receipt. |
| Code in another outgoing ref | Full gate. |
| Remote old commit is not an ancestor | Full gate. |
| Debug code replay through a temporary checkout | Full gate. |
| Gate fails or changes the landing tree | No landing push. |

### Derived Test Matrix

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| Checked increments, missing evidence, rewritten history, mixed refs and receipt validity | Unit | `.bkit/core/engine/commands/ci/push-gate.test.ts` | 1 |
| Both hooks select minimum on subsequent bookkeeping and full on new code | Integration | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` | 2 |
| Temporary landings validate the exact tree and refuse failing checks | Unit | `.bkit/core/engine/commands/land.test.ts` | 3 |

## Breaking Changes & Naming Review

Extend `ci min-push` with repeated `--update=<old>:<new>` pairs. Add `ci push-gate --gate=<script>` to execute a gate and record successful full-gate evidence. Existing `--ref` and `--base` behavior remains available. Temporary landings now require their consumer gate to pass.

## Open Questions & Assumptions

The user's implementation request authorizes the recorded behavior change. Use local successful full-gate evidence rather than introducing network-dependent CI reads. Keep the optional `tests changed` fallback unchanged: targeted checks already cover that surface and replacing them is unnecessary for the push fix.

## Alternative Approaches & Recommendations

Remote presence alone is insufficient evidence. Querying CI for every push introduces availability and provider dependencies. Local gate receipts bind the shortcut to an actual successful run and fail conservatively in a new clone.

## Out of Scope

CI lane changes, broad documentation-path exemptions, workflow-specific bypass flags, and changes to build/debug validation loops.

## Security & Privacy

Receipts are local to the repository's Git metadata and contain commit identities and gate names, not secrets. Validate their shape before use. Never infer validation from a commit subject.

## Pre-Flight / Dependencies

- Current branch is `dev`.
- Preserve unrelated edits in `docs/failures.jsonl`, `docs/testing.md` and `vitest.unit.config.ts`.
- Use the existing package script runner, bookkeeping pathspecs, and real Git fixtures.

## Reuse Inventory

<!-- prettier-ignore -->
| Capability | Existing implementation | Decision |
| --- | --- | --- |
| Path classification | `minPushPathspecs`, `changedOutside` | Extend. |
| Consumer script execution | `scriptCommand` and existing process helpers | Reuse. |
| Push refs and gate dispatch | Both pre-push hooks | Extend once per hook. |
| Temporary landings | `pushToDev` | Add explicit validation before its push. |

## Architecture & Component Changes

Keep receipts and gate execution in the engine's CI command directory. Hooks pass Git's actual old/new pairs. Landing validation uses the same consumer script runner against the temporary checkout. Keep scripts consumer-owned.

## Documentation Updates

Update the hook and gate contracts in the source catalogs and deployment documentation. Regenerate managed copies and CLI documentation. Keep existing tests that read documents in the consumer's minimum gate.

## Rollback Strategy

Revert the explicitly named implementation commit. Existing receipt files then become unused local metadata; no migration or external data rollback is needed.

## Agent Execution Runbook

<!-- bkit:group 1 start -->

### TASK GROUP 1: Verified minimum gates

<!-- bkit:task 1 start -->

- [x] **TASK 1:** Add checked gate evidence and update-pair classification.
  - **UPDATE:** `.bkit/core/engine/commands/ci/ci.ts`: add update pairs and gate runner command.
  - **CREATE:** `.bkit/core/engine/commands/ci/push-gate.ts`: execute gates and bind successful full checks to clean commits.
  - **DONE WHEN:** Positive evidence permits bookkeeping increments and all uncertain/code cases remain full.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/ci/push-gate.test.ts` `executes the full gate and carries its proof across bookkeeping and empty commits` fails when checked bookkeeping increments still require the full gate.
    - `.bkit/core/engine/commands/ci/push-gate.test.ts` `requires proof for empty docs updates and refuses rewritten or unknown remote heads` fails when uncertain updates qualify for the minimum gate.
    - `.bkit/core/engine/commands/ci/push-gate.test.ts` `ignores malformed receipts` fails when invalid evidence permits minimum validation.
    - `.bkit/core/engine/commands/ci/push-gate.test.ts` `records no proof for a failed gate or lighter gate` fails when a failed or incomplete check creates reusable proof.
    - `.bkit/core/engine/commands/ci/push-gate.test.ts` `rejects new code, a mixed push, new branches with code, and non-ancestor old heads` fails when any outgoing code bypasses full validation.
    - `.bkit/core/engine/commands/ci/push-gate.test.ts` `invalidates proof when the gate definition changes` fails when incompatible gate evidence is reused.

<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->

- [x] **TASK 2:** Wire both hooks to the shared classifier and gate runner.
  - **UPDATE:** `.husky/pre-push`: retain old/new pairs and pass the selected script to the runner.
  - **UPDATE:** `.bkit/templates/.husky/pre-push`: retain old/new pairs and pass the selected script to the runner.
  - **DEPENDS ON:** 1
  - **DONE WHEN:** Full code push followed by bookkeeping or an empty trigger selects the minimum gate in both hooks; other code/ref cases remain full.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` `.husky/pre-push: checked code followed by bookkeeping runs only the minimum gate` fails when the local hook reruns the full gate for checked bookkeeping.
    - `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` `.bkit/templates/.husky/pre-push: checked code followed by bookkeeping runs only the minimum gate` fails when the template hook reruns the full gate for checked bookkeeping.
    - `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` `.husky/pre-push: a checked empty trigger uses minimum validation` fails when a checked empty trigger reruns the full gate.
    - `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` `.bkit/templates/.husky/pre-push: a checked empty trigger uses minimum validation` fails when the template rejects checked empty triggers.
    - `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` `.husky/pre-push: code on another outgoing ref prevents a bookkeeping shortcut` fails when another outgoing ref's code receives minimum validation.
    - `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` `.bkit/templates/.husky/pre-push: code on another outgoing ref prevents a bookkeeping shortcut` fails when the template overlooks another outgoing ref's code.

<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->

- [x] **TASK 3:** Validate temporary landings explicitly.
  - **UPDATE:** `.bkit/core/engine/commands/land.ts`: validate the built checkout before pushing.
  - **DEPENDS ON:** 1
  - **DONE WHEN:** Minimum/full selection follows the actual delta and failed/mutating gates prevent a push.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/land.test.ts` `runs %s through its declared gate in the built checkout` fails when a landing skips its selected gate or validates the wrong checkout.
    - `.bkit/core/engine/commands/land.test.ts` `refuses a failed or unverifiable landing before updating the remote: %j` fails when a failed, missing or mutating gate permits a push.
    - `.bkit/core/engine/commands/land.test.ts` `runs the full gate for replayed debug code` fails when replayed code receives minimum validation.

<!-- bkit:task 3 end -->

<!-- bkit:group 1 end -->

## Verification Plan

Run affected unit and hook integration tests through the repository's sleep/lock wrapper. Run typechecking, lint and formatting on changed files. Build the CLI and dogfood it in a fresh local scratch consumer. Review the diff, commit only owned paths on `dev`, and post the changes, checks and any limitations to the issue. A remote push requires separate authorization under repository rules.

## Verification Record

- The affected suites passed: 82 CI and receipt tests, 43 landing tests, 453 workflow-caller tests, 102 hook integration tests, 93 catalog and CLI documentation tests, and 26 runtime contract tests. Two existing conditional catalog checks were skipped. Six hook regressions also passed against the final built CLI.
- Production and test typechecking, scoped type-aware lint, formatting, shell syntax and prose checks passed. The prose checker reported 13 existing warnings and no errors. The authoring consistency check passed, and the plan parser found one group, three tasks and no errors.
- The built CLI passed a fresh scratch-consumer run covering full-gate receipts, bookkeeping and empty-trigger minimum selection, failure invalidation and new-code rejection. A real package-manager probe confirmed that landing installation leaves parent-workspace dependencies untouched.
- Specification and code-quality reviews passed after fixing overlapping gate attempts, missing scripts, failure boundaries and excessive ancestor checks. A killed runner can leave conservative pending evidence; a successful full check on a later commit supersedes it.
- Temporary landings install frozen dependencies when worktree installation is enabled. Local receipts do not replace required CI. The optional `tests changed` fallback retains its existing validation scope.
