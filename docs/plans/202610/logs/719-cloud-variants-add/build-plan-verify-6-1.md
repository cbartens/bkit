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

None

## Notes

- Judged against `build-diff-6-1.md` (commits `5e39b9a91` plan-tests + `9ee2b9160` plan-execute). The working-tree template equals HEAD.
- Tests: `pnpm vitest run` on `cloud-ctx-step.integration.test.ts`, `workflow-templates.integration.test.ts` and `dogfood-templates.test.ts`: 3 files, 162 passed, 0 skipped. All 15 planned `TEST FIRST` tests (TASK 10: 6, TASK 11: 1, TASK 12: 8) ran and passed. The ctx-step tests needed their tools, and the actionlint test needed `actionlint` (present at `/opt/homebrew/bin/actionlint`); none of them was skipped.
- TASK 10: `git grep -nE 'grep -oE|\[0-9\]\+\|\[a-z\]\+-\[0-9\]\+' -- .bkit/templates/.github/workflows/bkit-cloud.yml` prints nothing (exit 1). The dev arm uses `--prompt-file` → `.fidNamed`, then the merged-PR `--marker` fallback → `.fid`, then `--branch "feat/$FID"` → `.issueId`, and calls `bkit_gate` before the stale-run guard and `bkit_dev_dispatch_guard`. The guard asserts `^[a-z0-9][a-z0-9-]*$` and has the new comment. The adopted `.github/` copy differs from the template only in `runs-on` and `node-version-file`.
- TASK 10 changed an existing test, `refuses to dispatch uncounted when package.json cannot be read`: it dropped the `refusing to dispatch uncounted` message assertion, kept `skip=true`, and added "no phase" plus "no counter row". This is not a gap. A broken `package.json` now stops at the gate, before the cap read, so the cap's jq-failure branch (`bkit-cloud.yml:335`) can no longer be reached and stays only as a second line of defence. The fail-closed behaviour is still asserted.
- TASK 11: `BKIT_LINEAR_API_KEY` / `BKIT_JIRA_API_KEY` are mapped in the ctx step and in the `run`, `opencode` and `codex` dispatch step envs, and in no job or workflow `env`. The `claude_args` comment is updated.
- TASK 12: the `openai/codex-action@bdf19a4a223ec2549a3e2274a0cf61556bc07675 # v1` pin was checked live. The annotated tag `v1` (`1d82a3db…`) resolves to that commit. Every `with:` input used (`openai-api-key`, `sandbox`, `allow-bots`, `codex-home`, `codex-version`, `prompt`) exists in the pinned `action.yml`. The first `customManagers` matchString in `renovate.json5` covers `codex-version:`. The `build-plan-current.md` Reword is resolved: the job has the display name `bkit-cloud-codex (${{ github.event_name }})` and keeps the job id `codex`, and the dogfood branded-name case passes. Concurrency `-codex`, the drop-sudo / Node 24 comment, the opencode install block (before its dispatch step) and the dogfood counts (`runs-on` 4, `node-version` 3) are present. TASK 12 is left off `Tasks` for the summary-step gap below.
- Test-first audit `build-tests-green-6-1.md`: `Enforced: true`, `Gaps: 0`, `Unproven: 0`, no `Updated tests` section. Already landed (no gap): TASK 10 `dev arm passes the gate for a closed issue that still carries bkit:auto`. The tests step said `bkit_gate` already read labels only. TASK 10 `traversal FID from the subject or the merged-PR body is a no-FID no-op that writes nothing outside docs/plans/`. The tests step said the old YAML slug allowlist already rejected `../x`.
- Decision records `build-decision-1-*` / `build-decision-2-1` cover groups 1 and 3. None of them accepts a group 6 gap.
- Out of scope, proposed separately: the `workflow-templates.integration.test.ts:288-292` header comment still says the region "uses portable `grep -oE` + `sed`". The template no longer has that grep. This is a candidate for TASK 17 (code comments).

## Identified Gaps Log

1 gap.

- TASK 12: `.bkit/templates/.github/workflows/bkit-cloud.yml` `Codex run summary` (template `:859-874`, adopted copy the same) — summary fields do not report what the plan's Data Schema row `Codex job summary line` defines (`commits` = "`dev` / PR head moved", `comments` = "PR comment landed" in the run window): `comments=$(gh api "repos/${GITHUB_REPOSITORY}/issues/${ARG}/comments" --jq length …)` uses `needs.context.outputs.arg`, which is the FID on the dev arm (`ARG="$FID"`, `:522`; `issues/363-widen-…` is a 404, so the field always prints 0) and the PR number on the feat arm (`ARG="$PR_NUMBER"`, `:568`; `length` counts every comment the PR ever had, not those landed since `BKIT_CODEX_STARTED`); `commits` counts only `origin/dev` commits since start and never sees the feat-arm PR head move. The planned test passes because it checks only that the three words appear. Fix in the template + adopted copy: filter comments by `created_at >= STARTED` on the PR (feat arm) / issue (dispatch arm), print `-` where no PR or issue number exists (dev arm), and compare the PR head (or `origin/dev` on the dev arm) before vs after the action for `commits` — Fixable: true
