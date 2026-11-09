Verdict: CONCERNS
Failures: 1
Fixable: true
Tasks: 10, 11
Loosened: none

<!-- verdict:end -->

# Plan Verification

## Scope

Group 6

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

- `build-plan-verify-6-1.md` (CONCERNS, 1 gap): the TASK 12 `Codex run summary` fields did not match the plan's Data Schema row `Codex job summary line` on the dev and feat arms. Remediated by `86f0c2f68` (`build-plan-gaps-remediate-6-1-log.md`).
- `build-plan-verify-6-2.md` (CONCERNS, 1 gap): the dispatch arm picked the feat-arm branch from a numeric `ARG` and always printed `commits` `0`. Remediated by `a77128ad9` (`build-plan-gaps-remediate-6-2-log.md`): the step now branches on `github.event_name`, and the dispatch arm prints `commits` `-`. That fix holds for a GitHub issue number. Dispatch-arm `comments` still prints a false `0` under Linear / Jira (gap below).

## Notes

- Judged against `build-diff-6-3.md` (all group 6 changes through `a77128ad9`). The working tree has no source changes beyond HEAD. The adopted `.github/workflows/bkit-cloud.yml` equals the template once the `runs-on` and `node-version` fills are masked (`diff` exit 0).
- Tests: `pnpm vitest run` on `cloud-ctx-step.integration.test.ts`, `workflow-templates.integration.test.ts` and `dogfood-templates.test.ts`: 3 files, 162 passed, none skipped. `actionlint`, `shellcheck`, `jq`, `gh` and `bc` were all present. All 15 planned `TEST FIRST` tests (TASK 10: 6, TASK 11: 1, TASK 12: 8) pass.
- TASK 10: the `DONE WHEN` `git grep -nE 'grep -oE|\[0-9\]\+\|\[a-z\]\+-\[0-9\]\+'` on the template prints nothing (exit 1). Satisfied, unchanged since attempt 2.
- TASK 11: the tracker secrets sit in the ctx step and the `run`, `opencode` and `codex` dispatch step envs, and in no job or workflow `env`. Satisfied.
- TASK 12: the eight planned tests, the TASK 11 test with the codex step and `dogfood-templates.test.ts` pass. The display name is `bkit-cloud-codex (${{ github.event_name }})`, per the `build-plan-current.md` Reword. TASK 12 is left off `Tasks` for the dispatch-arm `comments` gap below. Dispatch-arm `commits` `-` means "not applicable" and makes no false claim, so it is not a gap.
- Test-first audit `build-tests-green-6-3.md`: `Enforced: true`, `Gaps: 0`, `Unproven: 0`, no `Updated tests` section. Already landed (no gap): TASK 10 `dev arm passes the gate for a closed issue that still carries bkit:auto`. The tests step's reason: `bkit_gate` already read labels only. TASK 10 `traversal FID from the subject or the merged-PR body is a no-FID no-op that writes nothing outside docs/plans/`. The tests step's reason: the old YAML slug allowlist already rejected `../x`.
- Decision records `build-decision-1-*` and `build-decision-2-1` cover groups 1 and 3. None of them accepts a group 6 gap.
- Out of scope, proposed separately: the `workflow-templates.integration.test.ts:288-292` header comment still says the region "uses portable `grep -oE` + `sed`" (a candidate for TASK 17, code comments). The summary step also depends on `bc`, which a self-hosted `{{CLOUD_RUNNER}}` may lack. In that case the `|| true` fallback prints `0`.

## Identified Gaps Log

1 gap.

- TASK 12: `.bkit/templates/.github/workflows/bkit-cloud.yml` `Codex run summary` (template `:867-870`; adopted copy the same) — the dispatch arm now branches on `EVENT == workflow_dispatch` and prints `commits` as `-`, which resolves attempt 2's gap for a GitHub issue number. But the dispatch input is "Tracker issue number/id" (`:56-59`), and the ctx guard (`:619`) lets through a Linear / Jira id such as `ENG-12` or `AB2-12`. Under those trackers, `gh api "repos/${GITHUB_REPOSITORY}/issues/${ARG}/comments"` gets a 404. `2>/dev/null … || true` swallows it, and `${comments:-0}` prints `0`, which claims that no comment landed. The phase's comments go to the Linear / Jira issue, which this step never reads. This is the defect class of attempt 1 (dev arm) and attempt 2 (dispatch-arm `commits`), now on dispatch-arm `comments` for non-GitHub trackers, and it runs against the plan's goal that every variant works with any wired tracker. The planned test passes because it checks only that the three field words appear. Fix in the template and the adopted copy: on the dispatch arm, count issue comments since `STARTED` only when `ARG` matches `^[0-9]+$`, and print `-` otherwise. Keep the feat-arm and dev-arm branches as they are — Fixable: true
