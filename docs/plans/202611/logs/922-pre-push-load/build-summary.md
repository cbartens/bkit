Verdict: CONCERNS
Failures: 0
<!-- verdict:end -->

# Build Summary

## Verdict

CONCERNS

- build-challenge round 1: LOW .bkit/templates/.husky/pre-push:42
- build-challenge round 1: LOW .bkit/core/engine/checks/tips/catalogue.ts:480
- build-challenge round 1: LOW .bkit/core/engine/checks/tips/catalogue.ts:475
- build-challenge round 1: LOW .bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts:1282
- build-challenge round 1: LOW skills-lock.json:29
- build-challenge round 2: LOW .bkit/core/engine/commands/workflow/worktrees.ts:651
- build-challenge round 2: LOW .bkit/core/engine/checks/after/github.ts:358
- build-challenge round 2: LOW .bkit/templates/.husky/pre-push:42
- build-challenge round 2: LOW skills-lock.json:29
- build-failure-diagnose CONCERNS
- build-failure-remediate CONCERNS
- 1 item(s) accepted at the Decision Pause
- 7 deferral(s) from this run remain open

Plan tasks: 9 of 9 ticked in `docs/plans/202611/922-pre-push-load-plan.md`.

Publish: held

Docs: not synced (ship syncs on landing)

## Steps

<!-- prettier-ignore -->
| Step | Verdict | Failures | Attempts | Artifact |
| --- | --- | --- | --- | --- |
| build-start-workflow | - | - | 1 | - |
| build-worktree-setup | - | - | 1 | `docs/plans/202611/logs/922-pre-push-load/build-input-1.md` |
| build-branch-sync | - | - | 1 | - |
| build-plan-convert | - | - | 1 | `docs/plans/202611/922-pre-push-load-plan.md`, `docs/plans/202611/logs/922-pre-push-load/build-plan-check.md` |
| build-plan-current | - | - | 1 | - |
| build-install-skills | - | - | 1 | `docs/plans/202611/logs/922-pre-push-load/build-install-skills.md` |
| build-group-start (group 1) | - | - | 1 | - |
| build-plan-tests (group 1) | PASS | - | 1 | `docs/plans/202611/logs/922-pre-push-load/build-plan-tests-1-log.md` |
| build-tests-red (group 1) | - | - | 1 | `docs/plans/202611/logs/922-pre-push-load/build-tests-red-1-1.md` |
| build-plan-tasks (group 1) | PASS | - | 1 | `docs/plans/202611/logs/922-pre-push-load/build-plan-tasks-1-log.md` |
| build-plan-verify (group 1) | PASS | 0 | 1 | `docs/plans/202611/logs/922-pre-push-load/build-plan-verify-1-1.md` |
| build-plan-verify-holistic | PASS | 0 | 5 | `docs/plans/202611/logs/922-pre-push-load/build-plan-verify-holistic-5.md` |
| build-challenge | CONCERNS | 0 | 1 | `docs/plans/202611/logs/922-pre-push-load/build-challenge-1.md`, `docs/plans/202611/logs/922-pre-push-load/build-challenge-2.md` |
| build-decision | - | - | 2 | `docs/plans/202611/logs/922-pre-push-load/build-decision-1-2.md` |
| build-group-start (group 2) | - | - | 1 | - |
| build-plan-tests (group 2) | PASS | - | 1 | `docs/plans/202611/logs/922-pre-push-load/build-plan-tests-2-log.md` |
| build-tests-red (group 2) | - | - | 1 | `docs/plans/202611/logs/922-pre-push-load/build-tests-red-2-1.md` |
| build-plan-tasks (group 2) | PASS | - | 1 | `docs/plans/202611/logs/922-pre-push-load/build-plan-tasks-2-log.md` |
| build-plan-verify (group 2) | PASS | 0 | 3 | `docs/plans/202611/logs/922-pre-push-load/build-plan-verify-2-3.md` |
| build-plan-gaps-remediate (group 2) | PASS | - | 2 | `docs/plans/202611/logs/922-pre-push-load/build-plan-gaps-remediate-2-2-log.md` |
| build-plan-gaps-remediate-holistic | FAIL | - | 2 | `docs/plans/202611/logs/922-pre-push-load/build-plan-gaps-remediate-holistic-4-log.md` |
| build-challenge | CONCERNS | 0 | 1 | `docs/plans/202611/logs/922-pre-push-load/build-challenge-1.md`, `docs/plans/202611/logs/922-pre-push-load/build-challenge-2.md` |
| build-group-start (group 3) | - | - | 1 | - |
| build-plan-tests (group 3) | PASS | - | 1 | `docs/plans/202611/logs/922-pre-push-load/build-plan-tests-3-log.md` |
| build-tests-red (group 3) | - | - | 1 | `docs/plans/202611/logs/922-pre-push-load/build-tests-red-3-1.md` |
| build-plan-tasks (group 3) | PASS | - | 1 | `docs/plans/202611/logs/922-pre-push-load/build-plan-tasks-3-log.md` |
| build-plan-verify (group 3) | PASS | 0 | 2 | `docs/plans/202611/logs/922-pre-push-load/build-plan-verify-3-2.md` |
| build-plan-gaps-remediate (group 3) | FAIL | - | 1 | `docs/plans/202611/logs/922-pre-push-load/build-plan-gaps-remediate-3-1-log.md` |
| build-group-start (group 4) | - | - | 1 | - |
| build-plan-tests (group 4) | PASS | - | 1 | `docs/plans/202611/logs/922-pre-push-load/build-plan-tests-4-log.md` |
| build-tests-red (group 4) | - | - | 1 | `docs/plans/202611/logs/922-pre-push-load/build-tests-red-4-1.md` |
| build-plan-tasks (group 4) | PASS | - | 1 | `docs/plans/202611/logs/922-pre-push-load/build-plan-tasks-4-log.md` |
| build-plan-verify (group 4) | PASS | 0 | 1 | `docs/plans/202611/logs/922-pre-push-load/build-plan-verify-4-1.md` |
| build-run-tests | PASS | 0 | 2 | `docs/plans/202611/logs/922-pre-push-load/run-tests-2.md` |
| build-failure-diagnose | CONCERNS | - | 1 | `docs/plans/202611/logs/922-pre-push-load/build-failure-diagnose-1.md` |
| build-failure-remediate | CONCERNS | - | 1 | `docs/plans/202611/logs/922-pre-push-load/build-failure-remediate-1-log.md` |

## Resolved Findings

- build-plan-gaps-remediate-holistic FAIL, resolved by build-plan-verify-holistic
- build-plan-gaps-remediate (group 3) FAIL, resolved by build-plan-verify-holistic
- build-challenge round 1: MEDIUM .bkit/templates/.husky/pre-push:39, resolved by build-plan-verify (group 2, task 4)
- build-challenge round 1: MEDIUM .bkit/templates/.husky/pre-push:40, resolved by build-plan-verify (group 2, task 5)
- build-challenge round 2: HIGH vitest.setup.ts:105, resolved by build-plan-verify (group 3, task 6)
- build-challenge round 2: MEDIUM .bkit/templates/.husky/pre-push:59, resolved by build-plan-verify (group 3, task 7)
- build-challenge round 2: MEDIUM .bkit/templates/.husky/pre-push:58, resolved by build-plan-verify (group 3, task 8)

## Assessment History

<!-- prettier-ignore -->
| Step | Verdict | Attempt | Artifact |
| --- | --- | --- | --- |
| build-start-workflow | - | - | - |
| build-worktree-setup | - | - | `docs/plans/202611/logs/922-pre-push-load/build-input-1.md` |
| build-branch-sync | - | - | - |
| build-plan-convert | - | 1 | `docs/plans/202611/922-pre-push-load-plan.md`, `docs/plans/202611/logs/922-pre-push-load/build-plan-check.md` |
| build-plan-current | - | 1 | - |
| build-install-skills | - | 1 | `docs/plans/202611/logs/922-pre-push-load/build-install-skills.md` |
| build-group-start (group 1) | - | - | - |
| build-plan-tests (group 1) | PASS | 1 | `docs/plans/202611/logs/922-pre-push-load/build-plan-tests-1-log.md` |
| build-tests-red (group 1) | - | 1 | `docs/plans/202611/logs/922-pre-push-load/build-tests-red-1-1.md` |
| build-plan-tasks (group 1) | PASS | 1 | `docs/plans/202611/logs/922-pre-push-load/build-plan-tasks-1-log.md` |
| build-plan-verify (group 1) | PASS | 1 | `docs/plans/202611/logs/922-pre-push-load/build-plan-verify-1-1.md` |
| build-plan-verify-holistic | PASS | 1 | `docs/plans/202611/logs/922-pre-push-load/build-plan-verify-holistic-1.md` |
| build-challenge | CONCERNS | 1 | `docs/plans/202611/logs/922-pre-push-load/build-challenge-1.md`, `docs/plans/202611/logs/922-pre-push-load/build-challenge-2.md` |
| build-decision | - | 1 | `docs/plans/202611/logs/922-pre-push-load/build-decision-1-1.md` |
| build-group-start (group 2) | - | - | - |
| build-plan-tests (group 2) | PASS | 1 | `docs/plans/202611/logs/922-pre-push-load/build-plan-tests-2-log.md` |
| build-tests-red (group 2) | - | 1 | `docs/plans/202611/logs/922-pre-push-load/build-tests-red-2-1.md` |
| build-plan-tasks (group 2) | PASS | 1 | `docs/plans/202611/logs/922-pre-push-load/build-plan-tasks-2-log.md` |
| build-plan-verify (group 2) | CONCERNS | 1 | `docs/plans/202611/logs/922-pre-push-load/build-plan-verify-2-1.md` |
| build-plan-gaps-remediate (group 2) | PASS | 1 | `docs/plans/202611/logs/922-pre-push-load/build-plan-gaps-remediate-2-1-log.md` |
| build-plan-verify (group 2) | CONCERNS | 2 | `docs/plans/202611/logs/922-pre-push-load/build-plan-verify-2-2.md` |
| build-plan-gaps-remediate (group 2) | PASS | 2 | `docs/plans/202611/logs/922-pre-push-load/build-plan-gaps-remediate-2-2-log.md` |
| build-plan-verify (group 2) | PASS | 3 | `docs/plans/202611/logs/922-pre-push-load/build-plan-verify-2-3.md` |
| build-plan-verify-holistic | CONCERNS | 2 | `docs/plans/202611/logs/922-pre-push-load/build-plan-verify-holistic-2.md` |
| build-plan-gaps-remediate-holistic | FAIL | 2 | `docs/plans/202611/logs/922-pre-push-load/build-plan-gaps-remediate-holistic-2-log.md` |
| build-plan-verify-holistic | PASS | 3 | `docs/plans/202611/logs/922-pre-push-load/build-plan-verify-holistic-3.md` |
| build-challenge | CONCERNS | 2 | `docs/plans/202611/logs/922-pre-push-load/build-challenge-1.md`, `docs/plans/202611/logs/922-pre-push-load/build-challenge-2.md` |
| build-group-start (group 3) | - | - | - |
| build-plan-tests (group 3) | PASS | 1 | `docs/plans/202611/logs/922-pre-push-load/build-plan-tests-3-log.md` |
| build-tests-red (group 3) | - | 1 | `docs/plans/202611/logs/922-pre-push-load/build-tests-red-3-1.md` |
| build-plan-tasks (group 3) | PASS | 1 | `docs/plans/202611/logs/922-pre-push-load/build-plan-tasks-3-log.md` |
| build-plan-verify (group 3) | CONCERNS | 1 | `docs/plans/202611/logs/922-pre-push-load/build-plan-verify-3-1.md` |
| build-plan-gaps-remediate (group 3) | FAIL | 1 | `docs/plans/202611/logs/922-pre-push-load/build-plan-gaps-remediate-3-1-log.md` |
| build-plan-verify (group 3) | PASS | 2 | `docs/plans/202611/logs/922-pre-push-load/build-plan-verify-3-2.md` |
| build-plan-verify-holistic | CONCERNS | 4 | `docs/plans/202611/logs/922-pre-push-load/build-plan-verify-holistic-4.md` |
| build-plan-gaps-remediate-holistic | FAIL | 4 | `docs/plans/202611/logs/922-pre-push-load/build-plan-gaps-remediate-holistic-4-log.md` |
| build-decision | - | 2 | `docs/plans/202611/logs/922-pre-push-load/build-decision-1-2.md` |
| build-group-start (group 4) | - | - | - |
| build-plan-tests (group 4) | PASS | 1 | `docs/plans/202611/logs/922-pre-push-load/build-plan-tests-4-log.md` |
| build-tests-red (group 4) | - | 1 | `docs/plans/202611/logs/922-pre-push-load/build-tests-red-4-1.md` |
| build-plan-tasks (group 4) | PASS | 1 | `docs/plans/202611/logs/922-pre-push-load/build-plan-tasks-4-log.md` |
| build-plan-verify (group 4) | PASS | 1 | `docs/plans/202611/logs/922-pre-push-load/build-plan-verify-4-1.md` |
| build-plan-verify-holistic | PASS | 5 | `docs/plans/202611/logs/922-pre-push-load/build-plan-verify-holistic-5.md` |
| build-run-tests | FAIL | 1 | `docs/plans/202611/logs/922-pre-push-load/run-tests-1.md` |
| build-failure-diagnose | CONCERNS | 1 | `docs/plans/202611/logs/922-pre-push-load/build-failure-diagnose-1.md` |
| build-failure-remediate | CONCERNS | 1 | `docs/plans/202611/logs/922-pre-push-load/build-failure-remediate-1-log.md` |
| build-run-tests | PASS | 2 | `docs/plans/202611/logs/922-pre-push-load/run-tests-2.md` |

## Challenge

- Task 4 — MEDIUM — ticked (`docs/plans/202611/922-pre-push-load-plan.md`)
- Task 5 — MEDIUM — ticked (`docs/plans/202611/922-pre-push-load-plan.md`)
- Task 6 — HIGH — ticked (`docs/plans/202611/922-pre-push-load-plan.md`)
- Task 7 — MEDIUM — ticked (`docs/plans/202611/922-pre-push-load-plan.md`)
- Task 8 — MEDIUM — ticked (`docs/plans/202611/922-pre-push-load-plan.md`)
- LOW, deferred: 922-pre-push-load-challenge-low-bkit-templates-husky-pre-push-42 — LOW build challenge finding at .bkit/templates/.husky/pre-push:42: A trusted `.envrc` that fails to load (a failing command, a `dotenv_if_exists` file that will not parse, a `use nix` that fails offline) is reported as "not trusted", so the user runs `direnv allow .`, pushes again and hits the same block. Done when: The probe-failure message in `.bkit/templates/.husky/pre-push` and `.husky/pre-push` names both causes (untrusted, or `.envrc` failed to load: read direnv's error above, then run `direnv allow .` if it says blocked) instead of asserting the folder is untrusted, and the doc sentence in `.bkit/core/.bkit/templates.md` § Git hooks — Husky matches.
- LOW, deferred: 922-pre-push-load-challenge-low-bkit-core-engine-checks-tips-catalogue-ts-480 — LOW build challenge finding at .bkit/core/engine/checks/tips/catalogue.ts:480: The `pre-push-direnv` tip goes silent for any hook that mentions `direnv exec` anywhere (a comment, or a repo extra such as `direnv exec . pnpm ...`), so a stale log block that still runs `sh "$0" "$@"` never gets the tip. Done when: `fires` matches the inner-run line itself (e.g. `direnv exec . sh "$0"`) rather than the bare substring `direnv exec`, in `.bkit/core/engine/checks/tips/catalogue.ts` and the rebuilt `dist/checks/tips/catalogue.js`, and bkit's own repo still does not fire it.
- LOW, deferred: 922-pre-push-load-challenge-low-bkit-core-engine-checks-tips-catalogue-ts-475 — LOW build challenge finding at .bkit/core/engine/checks/tips/catalogue.ts:475: A repo whose hook copy predates the log block entirely (no `BKIT_PRE_PUSH_LOGGED`) gets the `pre-push-direnv` tip asking it to "replace the log block", a block its hook does not have, so the agent following the ask has nothing to replace. Done when: Either `fires` requires `BKIT_PRE_PUSH_LOGGED` in the hook, or the `ask` says to add the template's log block below `set -e` when the hook has none, or replace it when it has one; `dist/checks/tips/catalogue.js` rebuilt to match.
- LOW, deferred: 922-pre-push-load-challenge-low-bkit-core-engine-audits-templates-husky-pre-push-integration-test-ts-1282 — LOW build challenge finding at .bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts:1282: The `direnv not on PATH` test errors instead of testing when `PATH` holds a file entry or an unreadable directory, because `fs.readdirSync(d)` sits outside the `try` and `fs.existsSync` passes non-directories. Done when: `pathWithoutDirenv` skips PATH entries that are not readable directories (`statSync(d).isDirectory()` guard, or `readdirSync` inside a `try`), so the test runs on any developer PATH.
- LOW, deferred: 922-pre-push-load-challenge-low-skills-lock-json-29 — LOW build challenge finding at skills-lock.json:29: The install-skills commit wipes the integrity hash of the universal `find-skills` skill (`computedHash: ""`), so a tampered `find-skills` body (a skill that tells agents to run `npx skills add`) no longer differs from the lock, and the lock fails `.agents/skills.md` § Install / Update step 2. Done when: `skills-lock.json` `skills["find-skills"].computedHash` is nonempty again: restored to the `main` value, or regenerated by the skills CLI for the unchanged `.agents/skills/find-skills` content. Every entry in the lock then has a nonempty `computedHash`.
- LOW, deferred: 922-pre-push-load-challenge-low-bkit-core-engine-commands-workflow-worktrees-ts-651 — LOW build challenge finding at .bkit/core/engine/commands/workflow/worktrees.ts:651: On a machine without direnv (most cloud agents) or with `CI` set, worktree setup still narrates that "the pre-push hook will block the first push" for a differing `.envrc`, although the hook skips direnv there and the push goes through, so an unattended agent following `.bkit/workflows.md` § Worktree Setup stops for a human it does not need. Done when: `allowDirenv` in `.bkit/core/engine/commands/workflow/worktrees.ts` (and the rebuilt `dist/commands/workflow/worktrees.js`) adds the "push will block" warning to the differing-`.envrc` narration only when direnv is on `PATH` and `CI` is unset, matching the hook's own condition; otherwise it narrates the differing file without the block claim. `.bkit/core/.bkit/workflows.md` § Worktree Setup says the same, and `bkit upgrade` re-renders `.bkit/workflows.md`.
- LOW, deferred: 922-pre-push-load-challenge-low-bkit-core-engine-checks-after-github-ts-358 — LOW build challenge finding at .bkit/core/engine/checks/after/github.ts:358: On every push, `bkit check` runs after the hook has unset `BKIT_GH_TOKEN`, so `ghAsEngine` falls back to the shell's `GH_TOKEN` or the `gh` keyring and `buildGithubProjectTokenScopeAdvisory` probes the wrong token: a `GH_TOKEN` without the `project` scope prints "Give `BKIT_GH_TOKEN` Projects read & write" into `tmp/pre-push.log` although the PAT is fine, and an agent reading the log rotates a working token. Only the `gh-mcp` advisory got the `BKIT_PRE_PUSH_LOGGED` skip. Done when: `buildGithubProjectTokenScopeAdvisory` returns `null` when `BKIT_PRE_PUSH_LOGGED` is set (beside its `isCloudOrCi()` short-circuit), the same as `detectGhMcpToken`'s call site in `runPostInstallCheck`, and `dist/checks/after/github.js` is rebuilt; no other `bkit check` advisory names `BKIT_GH_TOKEN` while that token is unset on purpose.

## Tests

- Attempt 1: FAIL, failures -, ran `pnpm bkit:gate:static-unit-integration`
- Attempt 2: PASS, failures 0, ran `pnpm bkit:gate:static-unit-integration`

## Documentation Warnings

- **knowledge ledger query** (`bkit ledgers query` named by the diagnose prompt does not exist in this checkout's engine (`[bkit-ledgers] unknown verb "query"`, exit 2)) — `.bkit/cli.md`
  - Evidence: Folded docs/knowledge.jsonl by hand with jq (group_by key, max_by ts, status ACTIVE or absent): 139 winning rows of 180 lines.
  - Action: Ship the `ledgers query` verb, or change the prompt and rules to name the existing read path.

## Risks and Action Items

- Accepted: docs/plans/202611/logs/922-pre-push-load/build-decision-1-2.md: Decision: Accept — yes (owner took every recommendation)

## Recommended Next Step

```text
/bkit-ship #922
```
