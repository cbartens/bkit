Verdict: CONCERNS
Failures: 0
<!-- verdict:end -->

# Build Summary

## Verdict

CONCERNS

- build-challenge round 1: LOW .bkit/core/engine/install/modules/core.ts:2123
- build-challenge round 1: LOW .bkit/core/engine/install/modules/index.ts:202
- 2 deferral(s) from this run remain open

Plan tasks: 6 of 6 ticked in `docs/plans/202611/1053-upgrade-leaves-stale-plan.md`.

Publish: held

Docs: not synced (ship syncs on landing)

## Steps

<!-- prettier-ignore -->
| Step | Verdict | Failures | Attempts | Artifact |
| --- | --- | --- | --- | --- |
| build-start-workflow | - | - | 1 | - |
| build-worktree-setup | - | - | 1 | `docs/plans/202611/logs/1053-upgrade-leaves-stale/build-input-1.md` |
| build-branch-sync | - | - | 1 | - |
| build-plan-convert | - | - | 1 | `docs/plans/202611/1053-upgrade-leaves-stale-plan.md`, `docs/plans/202611/logs/1053-upgrade-leaves-stale/build-plan-check.md` |
| build-plan-current | - | - | 1 | - |
| build-install-skills | - | - | 1 | `docs/plans/202611/logs/1053-upgrade-leaves-stale/build-install-skills.md` |
| build-group-start (group 1) | - | - | 1 | - |
| build-plan-tests (group 1) | PASS | - | 1 | `docs/plans/202611/logs/1053-upgrade-leaves-stale/build-plan-tests-1-log.md` |
| build-tests-red (group 1) | - | - | 1 | `docs/plans/202611/logs/1053-upgrade-leaves-stale/build-tests-red-1-1.md` |
| build-plan-tasks (group 1) | PASS | - | 1 | `docs/plans/202611/logs/1053-upgrade-leaves-stale/build-plan-tasks-1-log.md` |
| build-plan-verify (group 1) | PASS | 0 | 1 | `docs/plans/202611/logs/1053-upgrade-leaves-stale/build-plan-verify-1-1.md` |
| build-group-gate (group 1) | PASS | - | 1 | `docs/plans/202611/logs/1053-upgrade-leaves-stale/build-group-gate-1-1.md` |
| build-group-start (group 2) | - | - | 1 | - |
| build-plan-tasks (group 2) | PASS | - | 1 | `docs/plans/202611/logs/1053-upgrade-leaves-stale/build-plan-tasks-2-log.md` |
| build-plan-verify (group 2) | PASS | 0 | 1 | `docs/plans/202611/logs/1053-upgrade-leaves-stale/build-plan-verify-2-1.md` |
| build-plan-verify-holistic | PASS | 0 | 2 | `docs/plans/202611/logs/1053-upgrade-leaves-stale/build-plan-verify-holistic-1-2.md` |
| build-holistic-gate | PASS | - | 2 | `docs/plans/202611/logs/1053-upgrade-leaves-stale/build-holistic-gate-1-2.md` |
| build-plan-gaps-remediate-holistic | PASS | - | 1 | `docs/plans/202611/logs/1053-upgrade-leaves-stale/build-plan-gaps-remediate-holistic-1-1-log.md` |
| build-challenge | CONCERNS | 2 | 1 | `docs/plans/202611/logs/1053-upgrade-leaves-stale/build-challenge-1.md`, `docs/plans/202611/logs/1053-upgrade-leaves-stale/build-challenge-2.md` |
| build-run-tests | PASS | 0 | 1 | `docs/plans/202611/logs/1053-upgrade-leaves-stale/run-tests-1.md` |

## Resolved Findings

None

## Assessment History

<!-- prettier-ignore -->
| Step | Verdict | Attempt | Artifact |
| --- | --- | --- | --- |
| build-start-workflow | - | - | - |
| build-worktree-setup | - | - | `docs/plans/202611/logs/1053-upgrade-leaves-stale/build-input-1.md` |
| build-branch-sync | - | - | - |
| build-plan-convert | - | 1 | `docs/plans/202611/1053-upgrade-leaves-stale-plan.md`, `docs/plans/202611/logs/1053-upgrade-leaves-stale/build-plan-check.md` |
| build-plan-current | - | 1 | - |
| build-install-skills | - | 1 | `docs/plans/202611/logs/1053-upgrade-leaves-stale/build-install-skills.md` |
| build-group-start (group 1) | - | - | - |
| build-plan-tests (group 1) | PASS | 1 | `docs/plans/202611/logs/1053-upgrade-leaves-stale/build-plan-tests-1-log.md` |
| build-tests-red (group 1) | - | 1 | `docs/plans/202611/logs/1053-upgrade-leaves-stale/build-tests-red-1-1.md` |
| build-plan-tasks (group 1) | PASS | 1 | `docs/plans/202611/logs/1053-upgrade-leaves-stale/build-plan-tasks-1-log.md` |
| build-plan-verify (group 1) | PASS | 1 | `docs/plans/202611/logs/1053-upgrade-leaves-stale/build-plan-verify-1-1.md` |
| build-group-gate (group 1) | PASS | 1 | `docs/plans/202611/logs/1053-upgrade-leaves-stale/build-group-gate-1-1.md` |
| build-group-start (group 2) | - | - | - |
| build-plan-tasks (group 2) | PASS | 1 | `docs/plans/202611/logs/1053-upgrade-leaves-stale/build-plan-tasks-2-log.md` |
| build-plan-verify (group 2) | PASS | 1 | `docs/plans/202611/logs/1053-upgrade-leaves-stale/build-plan-verify-2-1.md` |
| build-plan-verify-holistic | CONCERNS | 1 | `docs/plans/202611/logs/1053-upgrade-leaves-stale/build-plan-verify-holistic-1-1.md` |
| build-holistic-gate | PASS | 1 | `docs/plans/202611/logs/1053-upgrade-leaves-stale/build-holistic-gate-1-1.md` |
| build-plan-gaps-remediate-holistic | PASS | 1 | `docs/plans/202611/logs/1053-upgrade-leaves-stale/build-plan-gaps-remediate-holistic-1-1-log.md` |
| build-plan-verify-holistic | PASS | 2 | `docs/plans/202611/logs/1053-upgrade-leaves-stale/build-plan-verify-holistic-1-2.md` |
| build-holistic-gate | PASS | 2 | `docs/plans/202611/logs/1053-upgrade-leaves-stale/build-holistic-gate-1-2.md` |
| build-challenge | CONCERNS | 1 | `docs/plans/202611/logs/1053-upgrade-leaves-stale/build-challenge-1.md`, `docs/plans/202611/logs/1053-upgrade-leaves-stale/build-challenge-2.md` |
| build-run-tests | PASS | 1 | `docs/plans/202611/logs/1053-upgrade-leaves-stale/run-tests-1.md` |

## Challenge

- LOW, deferred: 1053-upgrade-leaves-stale-challenge-low-bkit-core-engine-install-modules-core-ts-2123 — LOW build challenge finding at .bkit/core/engine/install/modules/core.ts:2123: A re-run of `bkit install` after a version bump (or a `bkit check` over a hand-edited mirror) prints "stale .bkit/version entries re-recorded" for every rendered file the run writes or would write, so the owner is told the install record was wrong when it was right. Done when: The rendered-output loop in the `.bkit/version` `postDispatch` counts a path as stale only when this run neither wrote nor would write it (its path is not in `ws.writes`); a real run that rewrites a rendered file and a dry run that would rewrite one print no "stale .bkit/version entries" line for that file, while an untouched file with a wrong entry still prints it and still fails `bkit check`.
- LOW, deferred: 1053-upgrade-leaves-stale-challenge-low-bkit-core-engine-install-modules-index-ts-202 — LOW build challenge finding at .bkit/core/engine/install/modules/index.ts:202: A committed symlink `.cursor/commands/bkit-leak.md -> ../../.claude/bkit-cloud.md` (or any file outside the repo) in a mirror dir whose host is not rendered this run gets followed, hashed and its sha256 recorded in the committed, public `.bkit/version`. Done when: `listRenderedOutputs` lists only regular files: a mirror entry whose own path is a symlink or not a regular file (`fs.lstatSync(abs).isFile()` false) is left out, while a regular file inside a symlinked host folder (the supported dotfiles `.codex` setup) is still listed; neither the install `postDispatch` (`core.ts:2119`) nor `updateCanonicalHashesAfterUpgrade` (via `upgrade.ts:1050`) reads or records a hash for such a path, so the docs/security.md § Secrets rule that machine-local secret files stay out of `canonicalHashes` holds. Today `listRenderedMirrors` takes every `bkit-*` name in every `RENDERED_MIRRORS` dir on disk, and orphan removal runs only for detected hosts (`hosts.ts` detects by `<host>/agents`), so a `.cursor/commands/` or `.opencode/commands/` entry with no `agents/` sibling survives the run, and `hashFile` / `readFileSync` follow the link.

## Tests

- Attempt 1: PASS, failures 0, ran `pnpm bkit:gate:static-unit-integration`

## Risks and Action Items

None

## Recommended Next Step

```text
/bkit-ship #1053
```
