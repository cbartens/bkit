Verdict: CONCERNS
Failures: 0
<!-- verdict:end -->

# Build Summary

## Verdict

CONCERNS

- build-challenge round 1: LOW .bkit/core/engine/commands/workflow/steps.ts:1426
- build-challenge round 1: LOW .bkit/core/engine/commands/workflow/steps.ts:1439
- build-challenge round 2: LOW .bkit/core/engine/commands/workflow/steps.ts:1122
- build-challenge round 2: LOW .bkit/core/engine/install/template-copies.ts:62
- build-challenge round 2: LOW .bkit/core/engine/shared/package-roots.ts:52
- build-failure-diagnose FAIL, tests passed since (build-run-tests)
- 5 deferral(s) from this run remain open

Plan tasks: 7 of 7 ticked in `docs/plans/202611/1051-build-code-step-plan.md`.

Publish: held

Docs: not synced (ship syncs on landing)

## Steps

<!-- prettier-ignore -->
| Step | Verdict | Failures | Attempts | Artifact |
| --- | --- | --- | --- | --- |
| build-start-workflow | - | - | 1 | - |
| build-worktree-setup | - | - | 1 | `docs/plans/202611/logs/1051-build-code-step/build-input-1.md` |
| build-branch-sync | - | - | 1 | - |
| build-plan-convert | - | - | 1 | `docs/plans/202611/1051-build-code-step-plan.md`, `docs/plans/202611/logs/1051-build-code-step/build-plan-check.md` |
| build-plan-current | - | - | 1 | - |
| build-install-skills | - | - | 1 | `docs/plans/202611/logs/1051-build-code-step/build-install-skills.md` |
| build-group-start (group 1) | - | - | 1 | - |
| build-plan-tests (group 1) | PASS | - | 1 | `docs/plans/202611/logs/1051-build-code-step/build-plan-tests-1-log.md` |
| build-tests-red (group 1) | - | - | 1 | `docs/plans/202611/logs/1051-build-code-step/build-tests-red-1-1.md` |
| build-plan-tasks (group 1) | PASS | - | 1 | `docs/plans/202611/logs/1051-build-code-step/build-plan-tasks-1-log.md` |
| build-plan-verify (group 1) | PASS | 0 | 1 | `docs/plans/202611/logs/1051-build-code-step/build-plan-verify-1-1.md` |
| build-plan-verify-holistic | PASS | 0 | 3 | `docs/plans/202611/logs/1051-build-code-step/build-plan-verify-holistic-1-3.md` |
| build-holistic-gate | PASS | - | 3 | `docs/plans/202611/logs/1051-build-code-step/build-holistic-gate-1-3.md` |
| build-challenge | CONCERNS | 0 | 1 | `docs/plans/202611/logs/1051-build-code-step/build-challenge-1.md`, `docs/plans/202611/logs/1051-build-code-step/build-challenge-2.md` |
| build-decision | - | - | 4 | `docs/plans/202611/logs/1051-build-code-step/build-decision-1-4.md` |
| build-group-start (group 2) | - | - | 1 | - |
| build-plan-tests (group 2) | PASS | - | 1 | `docs/plans/202611/logs/1051-build-code-step/build-plan-tests-2-log.md` |
| build-tests-red (group 2) | - | - | 1 | `docs/plans/202611/logs/1051-build-code-step/build-tests-red-2-1.md` |
| build-plan-tasks (group 2) | PASS | - | 1 | `docs/plans/202611/logs/1051-build-code-step/build-plan-tasks-2-log.md` |
| build-plan-verify (group 2) | PASS | 0 | 1 | `docs/plans/202611/logs/1051-build-code-step/build-plan-verify-2-1.md` |
| build-challenge | CONCERNS | 0 | 1 | `docs/plans/202611/logs/1051-build-code-step/build-challenge-1.md`, `docs/plans/202611/logs/1051-build-code-step/build-challenge-2.md` |
| build-group-start (group 3) | - | - | 1 | - |
| build-plan-tests (group 3) | PASS | - | 2 | `docs/plans/202611/logs/1051-build-code-step/build-plan-tests-3-log.md` |
| build-tests-red (group 3) | - | - | 2 | `docs/plans/202611/logs/1051-build-code-step/build-tests-red-3-2.md` |
| build-plan-tasks (group 3) | PASS | - | 2 | `docs/plans/202611/logs/1051-build-code-step/build-plan-tasks-3-log.md` |
| build-plan-verify (group 3) | PASS | 0 | 3 | `docs/plans/202611/logs/1051-build-code-step/build-plan-verify-3-3.md` |
| build-plan-gaps-remediate (group 3) | PASS | - | 1 | `docs/plans/202611/logs/1051-build-code-step/build-plan-gaps-remediate-3-1-log.md` |
| build-run-tests | PASS | 0 | 3 | `docs/plans/202611/logs/1051-build-code-step/run-tests-3.md` |
| build-failure-diagnose | FAIL | - | 2 | `docs/plans/202611/logs/1051-build-code-step/build-failure-diagnose-2.md` |
| build-failure-remediate | PASS | - | 2 | `docs/plans/202611/logs/1051-build-code-step/build-failure-remediate-2-log.md` |

## Resolved Findings

- build-challenge round 1: HIGH .bkit/core/engine/commands/workflow/steps.ts:1437, resolved by build-plan-verify (group 2, task 3)
- build-challenge round 1: MEDIUM .bkit/core/engine/commands/workflow/steps.ts:1679, resolved by build-plan-verify (group 2, task 4)
- build-challenge round 2: MEDIUM .bkit/core/engine/commands/workflow/steps.ts:1718, resolved by build-plan-verify (group 3, task 5)
- build-challenge round 2: MEDIUM .bkit/core/engine/commands/workflow/steps.ts:129, resolved by build-plan-verify (group 3, task 6)

## Assessment History

<!-- prettier-ignore -->
| Step | Verdict | Attempt | Artifact |
| --- | --- | --- | --- |
| build-start-workflow | - | - | - |
| build-worktree-setup | - | - | `docs/plans/202611/logs/1051-build-code-step/build-input-1.md` |
| build-branch-sync | - | - | - |
| build-plan-convert | - | 1 | `docs/plans/202611/1051-build-code-step-plan.md`, `docs/plans/202611/logs/1051-build-code-step/build-plan-check.md` |
| build-plan-current | - | 1 | - |
| build-install-skills | - | 1 | `docs/plans/202611/logs/1051-build-code-step/build-install-skills.md` |
| build-group-start (group 1) | - | - | - |
| build-plan-tests (group 1) | PASS | 1 | `docs/plans/202611/logs/1051-build-code-step/build-plan-tests-1-log.md` |
| build-tests-red (group 1) | - | 1 | `docs/plans/202611/logs/1051-build-code-step/build-tests-red-1-1.md` |
| build-plan-tasks (group 1) | PASS | 1 | `docs/plans/202611/logs/1051-build-code-step/build-plan-tasks-1-log.md` |
| build-plan-verify (group 1) | PASS | 1 | `docs/plans/202611/logs/1051-build-code-step/build-plan-verify-1-1.md` |
| build-plan-verify-holistic | PASS | 1 | `docs/plans/202611/logs/1051-build-code-step/build-plan-verify-holistic-1-1.md` |
| build-holistic-gate | PASS | 1 | `docs/plans/202611/logs/1051-build-code-step/build-holistic-gate-1-1.md` |
| build-challenge | CONCERNS | 1 | `docs/plans/202611/logs/1051-build-code-step/build-challenge-1.md`, `docs/plans/202611/logs/1051-build-code-step/build-challenge-2.md` |
| build-decision | - | 1 | `docs/plans/202611/logs/1051-build-code-step/build-decision-1-1.md` |
| build-group-start (group 2) | - | - | - |
| build-plan-tests (group 2) | PASS | 1 | `docs/plans/202611/logs/1051-build-code-step/build-plan-tests-2-log.md` |
| build-tests-red (group 2) | - | 1 | `docs/plans/202611/logs/1051-build-code-step/build-tests-red-2-1.md` |
| build-plan-tasks (group 2) | PASS | 1 | `docs/plans/202611/logs/1051-build-code-step/build-plan-tasks-2-log.md` |
| build-plan-verify (group 2) | PASS | 1 | `docs/plans/202611/logs/1051-build-code-step/build-plan-verify-2-1.md` |
| build-plan-verify-holistic | PASS | 2 | `docs/plans/202611/logs/1051-build-code-step/build-plan-verify-holistic-1-2.md` |
| build-holistic-gate | PASS | 2 | `docs/plans/202611/logs/1051-build-code-step/build-holistic-gate-1-2.md` |
| build-challenge | CONCERNS | 2 | `docs/plans/202611/logs/1051-build-code-step/build-challenge-1.md`, `docs/plans/202611/logs/1051-build-code-step/build-challenge-2.md` |
| build-decision | - | 2 | `docs/plans/202611/logs/1051-build-code-step/build-decision-1-2.md` |
| build-group-start (group 3) | - | - | - |
| build-plan-tests (group 3) | PASS | 1 | `docs/plans/202611/logs/1051-build-code-step/build-plan-tests-3-log.md` |
| build-tests-red (group 3) | - | 1 | `docs/plans/202611/logs/1051-build-code-step/build-tests-red-3-1.md` |
| build-plan-tasks (group 3) | PASS | 1 | `docs/plans/202611/logs/1051-build-code-step/build-plan-tasks-3-log.md` |
| build-plan-verify (group 3) | CONCERNS | 1 | `docs/plans/202611/logs/1051-build-code-step/build-plan-verify-3-1.md` |
| build-plan-gaps-remediate (group 3) | PASS | 1 | `docs/plans/202611/logs/1051-build-code-step/build-plan-gaps-remediate-3-1-log.md` |
| build-plan-verify (group 3) | CONCERNS | 2 | `docs/plans/202611/logs/1051-build-code-step/build-plan-verify-3-2.md` |
| build-decision | - | 3 | `docs/plans/202611/logs/1051-build-code-step/build-decision-1-3.md` |
| build-plan-tests (group 3) | PASS | 2 | `docs/plans/202611/logs/1051-build-code-step/build-plan-tests-3-log.md` |
| build-tests-red (group 3) | - | 2 | `docs/plans/202611/logs/1051-build-code-step/build-tests-red-3-2.md` |
| build-plan-tasks (group 3) | PASS | 2 | `docs/plans/202611/logs/1051-build-code-step/build-plan-tasks-3-log.md` |
| build-plan-verify (group 3) | PASS | 3 | `docs/plans/202611/logs/1051-build-code-step/build-plan-verify-3-3.md` |
| build-plan-verify-holistic | PASS | 3 | `docs/plans/202611/logs/1051-build-code-step/build-plan-verify-holistic-1-3.md` |
| build-holistic-gate | PASS | 3 | `docs/plans/202611/logs/1051-build-code-step/build-holistic-gate-1-3.md` |
| build-run-tests | FAIL | 1 | `docs/plans/202611/logs/1051-build-code-step/run-tests-1.md` |
| build-failure-diagnose | CONCERNS | 1 | `docs/plans/202611/logs/1051-build-code-step/build-failure-diagnose-1.md` |
| build-failure-remediate | PASS | 1 | `docs/plans/202611/logs/1051-build-code-step/build-failure-remediate-1-log.md` |
| build-run-tests | FAIL | 2 | `docs/plans/202611/logs/1051-build-code-step/run-tests-2.md` |
| build-decision | - | 4 | `docs/plans/202611/logs/1051-build-code-step/build-decision-1-4.md` |
| build-failure-diagnose | FAIL | 2 | `docs/plans/202611/logs/1051-build-code-step/build-failure-diagnose-2.md` |
| build-failure-remediate | PASS | 2 | `docs/plans/202611/logs/1051-build-code-step/build-failure-remediate-2-log.md` |
| build-run-tests | PASS | 3 | `docs/plans/202611/logs/1051-build-code-step/run-tests-3.md` |

## Challenge

- Task 3 — HIGH — ticked (`docs/plans/202611/1051-build-code-step-plan.md`)
- Task 4 — MEDIUM — ticked (`docs/plans/202611/1051-build-code-step-plan.md`)
- Task 5 — MEDIUM — ticked (`docs/plans/202611/1051-build-code-step-plan.md`)
- Task 6 — MEDIUM — ticked (`docs/plans/202611/1051-build-code-step-plan.md`)
- LOW, deferred: 1051-build-code-step-challenge-low-bkit-core-engine-commands-workflow-steps-ts-1426 — LOW build challenge finding at .bkit/core/engine/commands/workflow/steps.ts:1426: Finish runs `bkit:generate` before it stages the code step's edits, so this repo's last generate link `bkit:graph:refresh` (which rebuilds `docs/capabilities.md` from `git write-tree`, the index) builds the register from the pre-edit tree, and the code step's commit carries a stale register that the pre-push register gate refuses later. Done when: No agent can settle this, because both fixes cross a boundary this plan did not open. The owner decides between staging the tree (`addAllButCopied`) before generate in `finish`, which changes what the exit-8 index restore in `writeStepRow` puts back, and rewriting this repo's `bkit:generate` so the register is built from the working tree, as `.bkit/core/.bkit/workflows.md` § Local gate scripts says generate does. End state: a code step's commit carries a `docs/capabilities.md` built from the same tree as its sources (`scripts/graphify/bkit-graphify.sh:459`, `.husky/pre-push:415`).
- LOW, deferred: 1051-build-code-step-challenge-low-bkit-core-engine-commands-workflow-steps-ts-1439 — LOW build challenge finding at .bkit/core/engine/commands/workflow/steps.ts:1439: A `bkit:generate` killed by a signal (the out-of-memory killer, a host timeout) is logged as `pnpm bkit:generate exited undefined`, because `spawnSync` then sets `status` null and `signal`, not `error`, and the message reads only `res.status ?? res.error?.message`. Done when: The exit-16 headline names the signal (`res.signal`) when `status` is null and no `error` is set, and a signal-killed generate still exits 16 with no row and no commit.
- LOW, deferred: 1051-build-code-step-challenge-low-bkit-core-engine-commands-workflow-steps-ts-1122 — LOW build challenge finding at .bkit/core/engine/commands/workflow/steps.ts:1122: A step that leaves `package.json` unparseable (a trailing comma after a script edit) is now refused with exit 13 as "the step's own edit changes bkit.workflows" for every key HEAD holds, which no build step routes, where it used to skip the check and reach the commit, whose hook refusal (exit 8) the build routes back to a fix; `readWorkflows` returns `{}` for an unreadable file, so a parse failure reads as every key removed. Done when: `readWorkflows` returns null when the file cannot be parsed, and the `bkit.workflows` check skips (nothing refused on its account) when the HEAD reading, the reading before `bkit:generate` or the reading after it is null, as `workflowsChange` did before this build (`if (!head.ok || !work.ok) return [];`). A parseable `package.json` is checked exactly as now. The exit-8 route this restores is `.bkit/core/workflows/bkit-build.md:48` ("fix what the hook's message names, then re-run this block"). This rests on reading the code: the scratch-repo probe for it was refused by the host's permission check and did not run.
- LOW, deferred: 1051-build-code-step-challenge-low-bkit-core-engine-install-template-copies-ts-62 — LOW build challenge finding at .bkit/core/engine/install/template-copies.ts:62: `b771d80fd` switched the three install call sites (`syncPayloadLinks`, `syncTemplateCopies`, `warnMissingLintStagedConfig`) from `path.resolve(cwd) === getPkgRoot()` to `isBkitOwnRepo(cwd)`, so `bkit upgrade` in a linked worktree of a bkit checkout run with the main checkout's engine, or in a non-git folder inside that checkout, now skips the template copies, the payload links and the lint-staged warning; the owner's ruling covered only the `bkit.workflows` check, no test pins the new install behaviour, and `bkit uninstall` in the same worktree still uses the old check, so it deletes `.bkit/templates/` whole while install and upgrade call it bkit's own source. Done when: No agent can settle this, because the owner's ruling (`docs/plans/202611/logs/1051-build-code-step/build-decision-1-1.md:22`, "only as exception on bkit repo not in consumer repos") scoped the change to the `bkit.workflows` check in `bkit steps finish`, and plan task 4 widened it to install with no recorded decision. The owner picks one: (a) keep install's no-op as "cwd is the package root": `.bkit/core/engine/install/payload-links.ts:73`, `.bkit/core/engine/install/template-copies.ts:62` and `:184` go back to the exact check, and `isBkitOwnRepo` serves `steps.ts` only; (b) keep "cwd belongs to bkit's repository" for install: `.bkit/core/engine/commands/install/uninstall.ts:954` and `:967` call `isBkitOwnRepo` too, so install, upgrade and uninstall give one answer for the same folder, and a test pins the worktree case. End state: install, upgrade and uninstall agree on whether a folder is bkit's own repository, and a test fails when they disagree. Severity is LOW because no case was found where the new answer does worse than the old one: in the worktree case the old check copied the main checkout's templates over the worktree's own template sources; a consumer's package root sits under `node_modules`, so a consumer never gets true; the uninstall deletion predates this build. Probe (a scratch main checkout, a linked worktree, a subfolder and a nested repo, `dist/shared/package-roots.js`): worktree against the main root `new=true old=false`; non-git subfolder against the main root `new=true old=false`; nested repo with its own `.git` `new=false old=false`; an unrelated repo with an inherited `GIT_DIR` pointing at the main checkout `new=true` (no hook or shell test in this repo runs install or upgrade that way; `vitest.setup.ts` strips `GIT_*`). `bkit install` refuses a folder without `.git` (`.bkit/core/engine/checks/before/repo.ts:51`), but `bkit upgrade` runs no preflight (`.bkit/core/engine/commands/install/upgrade.ts:822`, `:832`). The install row of `docs/architecture.md` § Package boundaries names the install tests as its enforcement, and none of them covers a worktree or a subfolder.
- LOW, deferred: 1051-build-code-step-challenge-low-bkit-core-engine-shared-package-roots-ts-52 — LOW build challenge finding at .bkit/core/engine/shared/package-roots.ts:52: Running `bkit install` or `bkit upgrade` with bkit's main-checkout engine on a non-git folder inside that checkout (a scratch consumer at `tmp/scratch`) now classes the folder as bkit's own repository, so install writes the rest of the payload there but silently skips the `.bkit/templates/` copies, the `.bkit/core` / `.bkit/shared` view links and the lint-staged warning. Done when: `isBkitOwnRepo` answers true only for the package root itself, or for the top level of a checkout (`git rev-parse --show-toplevel` equals the resolved `cwd`) whose git common dir's parent is the package root. A folder inside a checkout that is not its own repository is then a consumer again at `syncPayloadLinks` (`.bkit/core/engine/install/payload-links.ts:73`), `syncTemplateCopies` (`.bkit/core/engine/install/template-copies.ts:62`) and `warnMissingLintStagedConfig` (`.bkit/core/engine/install/template-copies.ts:184`), as it was before this diff. The three call sites keep calling the helper, as plan task 4 requires. A linked worktree of the package root's checkout still answers true, and the `steps finish` use at `.bkit/core/engine/commands/workflow/steps.ts:1729`, whose input is already a top level, is unchanged.

## Tests

- Attempt 1: FAIL, failures -, ran `pnpm bkit:gate:static-unit-integration`
- Attempt 2: FAIL, failures -, ran `pnpm bkit:gate:static-unit-integration`
- Attempt 3: PASS, failures 0, ran `pnpm bkit:gate:static-unit-integration`

## Tests that changed hands

- TASK 1 → TASK 3: `a failing bkit:generate exits 16 with nothing written and nothing committed` recorded failing

## Risks and Action Items

None

## Recommended Next Step

```text
/bkit-ship #1051
```
