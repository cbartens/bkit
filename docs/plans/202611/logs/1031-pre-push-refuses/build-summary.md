Verdict: CONCERNS
Failures: 0
<!-- verdict:end -->

# Build Summary

## Verdict

CONCERNS

- build-challenge round 1: LOW .bkit/templates/.husky/pre-push:246
- build-challenge round 1: LOW .bkit/core/engine/commands/ci/ci.ts:748
- build-challenge round 1: LOW .bkit/core/engine/commands/ci/ci.ts:673
- build-challenge round 2: LOW .bkit/core/engine/commands/ci/ci.ts:672
- build-challenge round 2: LOW .bkit/core/engine/commands/ci/ci.ts:692
- build-challenge round 2: LOW .bkit/core/engine/commands/ci/ci.ts:683
- 6 deferral(s) from this run remain open

Plan tasks: 6 of 6 ticked in `docs/plans/202611/1031-pre-push-refuses-plan.md`.

Publish: held

Docs: not synced (ship syncs on landing)

## Steps

<!-- prettier-ignore -->
| Step | Verdict | Failures | Attempts | Artifact |
| --- | --- | --- | --- | --- |
| build-start-workflow | - | - | 1 | - |
| build-worktree-setup | - | - | 1 | `docs/plans/202611/logs/1031-pre-push-refuses/build-input-1.md` |
| build-branch-sync | - | - | 1 | - |
| build-plan-convert | - | - | 1 | `docs/plans/202611/1031-pre-push-refuses-plan.md`, `docs/plans/202611/logs/1031-pre-push-refuses/build-plan-check.md` |
| build-plan-current | - | - | 1 | - |
| build-install-skills | - | - | 1 | `docs/plans/202611/logs/1031-pre-push-refuses/build-install-skills.md` |
| build-group-start (group 1) | - | - | 1 | - |
| build-plan-tests (group 1) | PASS | - | 2 | `docs/plans/202611/logs/1031-pre-push-refuses/build-plan-tests-1-log.md` |
| build-tests-red (group 1) | - | - | 2 | `docs/plans/202611/logs/1031-pre-push-refuses/build-tests-red-1-2.md` |
| build-plan-tasks (group 1) | PASS | - | 1 | `docs/plans/202611/logs/1031-pre-push-refuses/build-plan-tasks-1-log.md` |
| build-plan-verify (group 1) | PASS | 0 | 1 | `docs/plans/202611/logs/1031-pre-push-refuses/build-plan-verify-1-1.md` |
| build-plan-verify-holistic | PASS | 0 | 2 | `docs/plans/202611/logs/1031-pre-push-refuses/build-plan-verify-holistic-1-2.md` |
| build-holistic-gate | PASS | - | 2 | `docs/plans/202611/logs/1031-pre-push-refuses/build-holistic-gate-1-2.md` |
| build-challenge | CONCERNS | 8 | 1 | `docs/plans/202611/logs/1031-pre-push-refuses/build-challenge-1.md`, `docs/plans/202611/logs/1031-pre-push-refuses/build-challenge-2.md` |
| build-group-start (group 2) | - | - | 1 | - |
| build-plan-tests (group 2) | PASS | - | 1 | `docs/plans/202611/logs/1031-pre-push-refuses/build-plan-tests-2-log.md` |
| build-tests-red (group 2) | - | - | 1 | `docs/plans/202611/logs/1031-pre-push-refuses/build-tests-red-2-1.md` |
| build-plan-tasks (group 2) | PASS | - | 1 | `docs/plans/202611/logs/1031-pre-push-refuses/build-plan-tasks-2-log.md` |
| build-plan-verify (group 2) | PASS | 0 | 2 | `docs/plans/202611/logs/1031-pre-push-refuses/build-plan-verify-2-2.md` |
| build-plan-gaps-remediate (group 2) | PASS | - | 1 | `docs/plans/202611/logs/1031-pre-push-refuses/build-plan-gaps-remediate-2-1-log.md` |
| build-challenge | CONCERNS | 4 | 1 | `docs/plans/202611/logs/1031-pre-push-refuses/build-challenge-1.md`, `docs/plans/202611/logs/1031-pre-push-refuses/build-challenge-2.md` |
| build-run-tests | PASS | 0 | 1 | `docs/plans/202611/logs/1031-pre-push-refuses/run-tests-1.md` |

## Resolved Findings

- build-challenge round 1: HIGH .bkit/core/engine/commands/ci/ci.ts:678, resolved by build-plan-verify (group 2, task 4)
- build-challenge round 1: MEDIUM .bkit/core/engine/commands/ci/ci.ts:676, resolved by build-plan-verify (group 2, task 5)
- build-challenge round 1: MEDIUM .bkit/core/engine/commands/ci/ci.ts:681, resolved by build-plan-verify (group 2, task 6)

## Assessment History

<!-- prettier-ignore -->
| Step | Verdict | Attempt | Artifact |
| --- | --- | --- | --- |
| build-start-workflow | - | - | - |
| build-worktree-setup | - | - | `docs/plans/202611/logs/1031-pre-push-refuses/build-input-1.md` |
| build-branch-sync | - | - | - |
| build-plan-convert | - | 1 | `docs/plans/202611/1031-pre-push-refuses-plan.md`, `docs/plans/202611/logs/1031-pre-push-refuses/build-plan-check.md` |
| build-plan-current | - | 1 | - |
| build-install-skills | - | 1 | `docs/plans/202611/logs/1031-pre-push-refuses/build-install-skills.md` |
| build-group-start (group 1) | - | - | - |
| build-plan-tests (group 1) | PASS | 1 | `docs/plans/202611/logs/1031-pre-push-refuses/build-plan-tests-1-log.md` |
| build-tests-red (group 1) | - | 1 | `docs/plans/202611/logs/1031-pre-push-refuses/build-tests-red-1-1.md` |
| build-plan-tests (group 1) | PASS | 2 | `docs/plans/202611/logs/1031-pre-push-refuses/build-plan-tests-1-log.md` |
| build-tests-red (group 1) | - | 2 | `docs/plans/202611/logs/1031-pre-push-refuses/build-tests-red-1-2.md` |
| build-plan-tasks (group 1) | PASS | 1 | `docs/plans/202611/logs/1031-pre-push-refuses/build-plan-tasks-1-log.md` |
| build-plan-verify (group 1) | PASS | 1 | `docs/plans/202611/logs/1031-pre-push-refuses/build-plan-verify-1-1.md` |
| build-plan-verify-holistic | PASS | 1 | `docs/plans/202611/logs/1031-pre-push-refuses/build-plan-verify-holistic-1-1.md` |
| build-holistic-gate | PASS | 1 | `docs/plans/202611/logs/1031-pre-push-refuses/build-holistic-gate-1-1.md` |
| build-challenge | CONCERNS | 1 | `docs/plans/202611/logs/1031-pre-push-refuses/build-challenge-1.md`, `docs/plans/202611/logs/1031-pre-push-refuses/build-challenge-2.md` |
| build-group-start (group 2) | - | - | - |
| build-plan-tests (group 2) | PASS | 1 | `docs/plans/202611/logs/1031-pre-push-refuses/build-plan-tests-2-log.md` |
| build-tests-red (group 2) | - | 1 | `docs/plans/202611/logs/1031-pre-push-refuses/build-tests-red-2-1.md` |
| build-plan-tasks (group 2) | PASS | 1 | `docs/plans/202611/logs/1031-pre-push-refuses/build-plan-tasks-2-log.md` |
| build-plan-verify (group 2) | CONCERNS | 1 | `docs/plans/202611/logs/1031-pre-push-refuses/build-plan-verify-2-1.md` |
| build-plan-gaps-remediate (group 2) | PASS | 1 | `docs/plans/202611/logs/1031-pre-push-refuses/build-plan-gaps-remediate-2-1-log.md` |
| build-plan-verify (group 2) | PASS | 2 | `docs/plans/202611/logs/1031-pre-push-refuses/build-plan-verify-2-2.md` |
| build-plan-verify-holistic | PASS | 2 | `docs/plans/202611/logs/1031-pre-push-refuses/build-plan-verify-holistic-1-2.md` |
| build-holistic-gate | PASS | 2 | `docs/plans/202611/logs/1031-pre-push-refuses/build-holistic-gate-1-2.md` |
| build-challenge | CONCERNS | 2 | `docs/plans/202611/logs/1031-pre-push-refuses/build-challenge-1.md`, `docs/plans/202611/logs/1031-pre-push-refuses/build-challenge-2.md` |
| build-run-tests | PASS | 1 | `docs/plans/202611/logs/1031-pre-push-refuses/run-tests-1.md` |

## Challenge

- Task 4 — HIGH — ticked (`docs/plans/202611/1031-pre-push-refuses-plan.md`)
- Task 5 — MEDIUM — ticked (`docs/plans/202611/1031-pre-push-refuses-plan.md`)
- Task 6 — MEDIUM — ticked (`docs/plans/202611/1031-pre-push-refuses-plan.md`)
- LOW, deferred: 1031-pre-push-refuses-challenge-low-bkit-templates-husky-pre-push-246 — LOW build challenge finding at .bkit/templates/.husky/pre-push:246: A `[skip ci]` push to `main` refused for code (`src/a.ts` outside the min-push paths), for an unresolved `origin/main` (exit 7) or for an older engine that rejects `--target` (`unknown flag --target`, exit 2) still prints "Audit reports and audit-template project sections may skip CI on dev only ... (the files are named above)", although no audit file was named; the hook keys the line on `push_target` being set, not on the refusal reason, and throws away the JSON `reason` on stdout. Done when: the dev-only audit sentence appears only when the refusal reason is `audit` (for example the engine logs it on its `reason: "audit"` path and both hook copies, `.bkit/templates/.husky/pre-push:246` and `.husky/pre-push:303`, drop the conditional echo), and a code, not-proven or usage refusal on `main` prints no claim that audit files were named
- LOW, deferred: 1031-pre-push-refuses-challenge-low-bkit-core-engine-commands-ci-ci-ts-748 — LOW build challenge finding at .bkit/core/engine/commands/ci/ci.ts:748: On the new `reason: "audit"` path, `min-push --json` puts the audit files in `outside` (files that DO match a min-push path, against the spec "the changed files no min-push path matches"), drops the real outside files of the same push, and mixes ranges: `changed` counts the `origin/dev` range while `outside` comes from the `origin/main` range, so in the "already on origin/dev" case `outside` names a file that `changed` never counted. Done when: the audit files are emitted in their own field (for example `audit`), declared in the `min-push` output spec, `outside` keeps its declared meaning and still lists real outside files when audit files are also refused, and the outside count is still logged
- LOW, deferred: 1031-pre-push-refuses-challenge-low-bkit-core-engine-commands-ci-ci-ts-673 — LOW build challenge finding at .bkit/core/engine/commands/ci/ci.ts:673: A `[skip ci]` push of an audit report to `main` on a remote other than `origin` (for example `git push upstream HEAD:main` while the fork's `origin/main` already holds the report) passes, because the main check measures from the local `origin/main` ref and not from the `main` SHA the pushed-to remote advertises on the hook's stdin. Done when: The owner decides which base the `main` audit check trusts. No agent can settle it, because the plan fixed `origin/main` as the base (Open Questions, first assumption) and the alternative changes the `min-push` flag contract and both hook copies: the hook would hand the `<remote sha>` it reads for `refs/heads/main` to `bkit ci min-push --target=main`, and the check would count as not proven when that SHA is all zeroes or missing locally. Either the check moves to that SHA, or `origin/main` stays and `docs/security.md` says the check assumes the push goes to `origin`
- LOW, deferred: 1031-pre-push-refuses-challenge-low-bkit-core-engine-commands-ci-ci-ts-672 — LOW build challenge finding at .bkit/core/engine/commands/ci/ci.ts:672: In a repo whose `minPushPaths` covers `docs/templates/**` (bkit's own `docs/**`), a `[skip ci]` push to `main` that adds a project-written `docs/templates/bkit-audit-custom.md` with no bkit markers, or edits an audit template whose managed block does not parse (CRLF line endings, a second line-anchored `<!-- bkit:end -->` in the project section), passes `--target=main`: `projectSection` maps a null `managedHead` to `""`, so both sides compare as an empty project section and the file is never refused. Done when: an audit template whose managed block does not parse at a side counts its whole text as project text at that side (for example `head === null ? res.stdout : res.stdout.slice(head.length)`), so a changed or added `docs/templates/bkit-audit-*.md` without a parseable block is refused on `main` whatever `minPushPaths` holds, and a template with a parseable block on both sides still compares only the text below `<!-- bkit:end -->`
- LOW, deferred: 1031-pre-push-refuses-challenge-low-bkit-core-engine-commands-ci-ci-ts-692 — LOW build challenge finding at .bkit/core/engine/commands/ci/ci.ts:692: A `[skip ci]` push to `main` whose changed audit template cannot be read at the pushed commit (a `spawnSync` error such as `EAGAIN` or `ENOBUFS`, a failed lazy blob fetch in a `--filter=blob:none` clone, or a non-blob entry at the path) passes `--target=main` in a repo whose `minPushPaths` covers it: `projectSection` turns every non-zero `cat-file` status into "absent", and `mainAuditFiles` treats an absent pushed side as a deletion, so a read failure fails open where today's `minPushOutside` fails closed. Done when: `mainAuditFiles` counts a template as absent at a side only when the diff says it was added or deleted there (for example from `git diff --name-status -z --no-renames`), and any other failed read of a changed `docs/templates/bkit-audit-*.md` makes it return `null`, so `min-push --target=main` exits 7 with `reason: "unknown"`
- LOW, deferred: 1031-pre-push-refuses-challenge-low-bkit-core-engine-commands-ci-ci-ts-683 — LOW build challenge finding at .bkit/core/engine/commands/ci/ci.ts:683: A `[skip ci]` push of `docs/audits/202611/security.md` to `main` passes `min-push --target=main` (exit 0, `minPush: true`) when the checkout holds a local branch or tag named `origin/main` at the pushed commit (`git checkout -b origin/main`, `git tag origin/main`), because `mainAuditFiles` passes the bare name `origin/main` to `rev-parse` and `merge-base`, git resolves it as `refs/tags/origin/main` or `refs/heads/origin/main` before `refs/remotes/origin/main`, so the merge-base is the pushed commit itself and the audit diff is empty. Done when: `mainAuditFiles` resolves `refs/remotes/origin/main` and takes its merge-base against that full ref, so no local branch or tag named `origin/main` can move the base: a `[skip ci]` push carrying a `docs/audits/**` file is refused on `main` and the file is named, whatever `refs/heads/origin/main` or `refs/tags/origin/main` hold, and a missing `refs/remotes/origin/main` still exits 7

## Tests

- Attempt 1: PASS, failures 0, ran `pnpm bkit:gate:static-unit-integration`

## Risks and Action Items

None

## Recommended Next Step

```text
/bkit-ship #1031
```
