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

- `build-plan-verify-6-1.md` (CONCERNS, 1 gap): the TASK 12 `Codex run summary` fields were wrong on the dev and feat arms. Remediated by `86f0c2f68` (`build-plan-gaps-remediate-6-1-log.md`).
- `build-plan-verify-6-2.md` (CONCERNS, 1 gap): the dispatch arm took the feat-arm branch from a numeric `ARG` and always printed `commits` `0`. Remediated by `a77128ad9` (`build-plan-gaps-remediate-6-2-log.md`).
- `build-plan-verify-6-3.md` (CONCERNS, 1 gap): dispatch-arm `comments` printed a false `0` for a Linear / Jira key. Remediated by `9af41e1f1` (`build-plan-gaps-remediate-6-3-log.md`). The fix holds: the dispatch arm counts issue comments only when `ARG` matches `^[0-9]+$` and prints `-` otherwise (template `:870-875`). The empty-`STARTED` path is still open (gap below).

## Notes

- Judged against `build-diff-6-4.md` (all group 6 changes through `9af41e1f1`). The working tree has no source changes beyond HEAD. The adopted `.github/workflows/bkit-cloud.yml` equals the template once the `runs-on` and `node-version` fills are masked (`diff` exit 0).
- Tests: `pnpm vitest run` on `cloud-ctx-step.integration.test.ts`, `workflow-templates.integration.test.ts` and `dogfood-templates.test.ts`: 3 files, 162 passed, none skipped. All 15 planned `TEST FIRST` tests (TASK 10: 6, TASK 11: 1, TASK 12: 8) exist by name and pass. Every group 6 `Derived Test Matrix` row maps to one of them, or to the `dogfood-templates.test.ts` row (TASK 12).
- TASK 10: the `DONE WHEN` `git grep -nE 'grep -oE|\[0-9\]\+\|\[a-z\]\+-\[0-9\]\+'` on the template prints nothing (exit 1). Satisfied, unchanged since attempt 1. The plan still shows `[ ]` for TASK 10; the workflow ticks it from this `Tasks` line.
- TASK 11: the tracker secrets sit in the ctx step and the `run`, `opencode` and `codex` dispatch step envs, and in no job or workflow `env`. Satisfied.
- TASK 12: the eight planned tests, the TASK 11 test with the codex step and `dogfood-templates.test.ts` pass. The display name is `bkit-cloud-codex (${{ github.event_name }})`, per the `build-plan-current.md` Reword. TASK 12 is left off `Tasks` for the empty-`STARTED` summary gap below.
- Test-first audit `build-tests-green-6-4.md`: `Enforced: true`, `Gaps: 0`, `Unproven: 0`, no `Updated tests` section. Already landed (no gap): TASK 10 `dev arm passes the gate for a closed issue that still carries bkit:auto`. The tests step's reason: `bkit_gate` already read labels only. TASK 10 `traversal FID from the subject or the merged-PR body is a no-FID no-op that writes nothing outside docs/plans/`. The tests step's reason: the old YAML slug allowlist already rejected `../x`.
- Decision records `build-decision-1-*` and `build-decision-2-1` cover groups 1 and 3. None of them accepts a group 6 gap.
- Out of scope, proposed separately: the `workflow-templates.integration.test.ts:288-292` header comment still says the region "uses portable `grep -oE` + `sed`" (a candidate for TASK 17, code comments). The summary step depends on `bc`, which a self-hosted `{{CLOUD_RUNNER}}` may lack.

## Identified Gaps Log

1 gap.

- TASK 12: `.bkit/templates/.github/workflows/bkit-cloud.yml` `Codex run summary` (template `:858-892`, filters `:871`, `:878-879`; adopted copy the same) — `STARTED` comes from `BKIT_CODEX_STARTED`, which only the `Trust the workspace in codex-home` step writes (`:838`). When an earlier step fails (checkout, vale, `pnpm install --frozen-lockfile`), the `if: always()` summary still runs with `STARTED` empty, and every jq filter `select(... >= "")` matches every item. The feat arm then reports every commit and comment the PR ever had, and the numeric dispatch arm every comment the issue ever had, beside `action` `skipped`. Checked locally: `jq '[.[] | select(.created_at >= "")] | length'` over two old comments prints `2`. The dev arm is not affected (`git log --since=""` prints nothing). This is the false-count defect class attempts 1-3 fixed, now on the failure path that `if: always()` exists for, and it breaks the Data Schema row `Codex job summary line` (`commits` = head moved in this run, `comments` = comment landed in this run). The planned test passes because it checks only that the three field words appear. Fix in the template and the adopted copy: when `STARTED` is empty, print `-` for `commits` and `comments` on every arm, and keep the current branches otherwise — Fixable: true
