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

- `build-plan-verify-6-1.md` (CONCERNS, 1 gap): TASK 12 `Codex run summary` fields did not match the plan's Data Schema row `Codex job summary line`. Remediated by `86f0c2f68` (`build-plan-gaps-remediate-6-1-log.md`: feat arm counts PR commits and comments since start, dev arm prints `-` for comments). The feat-arm and dev-arm fixes hold; the dispatch arm still misreports `commits` (gap below).

## Notes

- Judged against `build-diff-6-2.md` (all group 6 changes: `5e39b9a91` plan-tests, `9ee2b9160` plan-execute, `86f0c2f68` remediation). The adopted `.github/workflows/bkit-cloud.yml` equals the template once the `runs-on` and `node-version` fills are masked.
- Tests: `pnpm vitest run` on `cloud-ctx-step.integration.test.ts`, `workflow-templates.integration.test.ts` and `dogfood-templates.test.ts`: 3 files, 162 passed, none skipped. All 15 planned `TEST FIRST` tests (TASK 10: 6, TASK 11: 1, TASK 12: 8) pass.
- TASK 10: the `DONE WHEN` `git grep -nE 'grep -oE|\[0-9\]\+\|\[a-z\]\+-\[0-9\]\+'` on the template prints nothing (exit 1). Dev arm: `--prompt-file` → `.fidNamed`, merged-PR `--marker` fallback → `.fid`, `--branch "feat/$FID"` → `.issueId`; guard asserts `^[a-z0-9][a-z0-9-]*$` with the characters-not-shape comment. Satisfied.
- TASK 11: `BKIT_LINEAR_API_KEY` / `BKIT_JIRA_API_KEY` in the `run`, `opencode` and `codex` dispatch step envs and the ctx step, in no job or workflow `env`; `claude_args` comment updated. Satisfied.
- TASK 12: the eight planned tests, the TASK 11 test with the codex step and `dogfood-templates.test.ts` pass; display name `bkit-cloud-codex (${{ github.event_name }})` per the `build-plan-current.md` Reword. Left off `Tasks` for the dispatch-arm summary gap below, which keeps attempt 1's Data Schema finding open on one arm.
- Test-first audit `build-tests-green-6-2.md`: `Enforced: true`, `Gaps: 0`, `Unproven: 0`, no `Updated tests` section. Already landed (no gap): TASK 10 `dev arm passes the gate for a closed issue that still carries bkit:auto` (tests step: `bkit_gate` already read labels only) and TASK 10 `traversal FID from the subject or the merged-PR body is a no-FID no-op that writes nothing outside docs/plans/` (tests step: the old YAML slug allowlist already rejected `../x`).
- Decision records `build-decision-1-*` and `build-decision-2-1` cover groups 1 and 3; none accepts a group 6 gap.
- The `86f0c2f68` change to `docs/plans/202610/719-cloud-variants-add-plan.md` is the workflow's task tick, not a plan edit by a build step.
- Out of scope, proposed separately: the `workflow-templates.integration.test.ts:288-292` header comment still says the region "uses portable `grep -oE` + `sed`" (candidate for TASK 17, code comments).

## Identified Gaps Log

1 gap.

- TASK 12: `.bkit/templates/.github/workflows/bkit-cloud.yml` `Codex run summary` (template `:858-882`, branch test `:866`; adopted copy the same) — the remediated step picks its branch from the shape of `needs.context.outputs.arg` (`^[0-9]+$` → "feat arm: ARG is the PR number"), but the `workflow_dispatch` arm also sets a numeric `ARG="$IN_ISSUE"` (`:290`), which is a GitHub issue number, not a PR number. On that arm `gh api "repos/${GITHUB_REPOSITORY}/pulls/${ARG}/commits"` is a 404 that `2>/dev/null … || true` swallows, so `commits` always prints `0` even when the dispatched phase pushed commits: the same defect class gap 1 of attempt 1 logged for the dev arm, now on the dispatch arm. The planned test passes because it checks only that the three words appear. Fix in the template + adopted copy: branch on the event (`github.event_name` / the context arm), not on the ARG shape; on the dispatch arm keep the issue-comment count since `STARTED` and print `-` for `commits` (no `dev` or PR head is tied to the issue id), and keep the feat-arm and dev-arm branches as they are — Fixable: true
