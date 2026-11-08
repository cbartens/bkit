Verdict: FAIL
Failures: 4
Fixable: true
Tasks: 1, 2, 3, 4, 5, 6, 19, 20, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18
Loosened: none

<!-- verdict:end -->

# Plan Verification

## Scope

Holistic

## Groups Verified

9 of 9 (the plan has 9 groups).

## Integration Gaps

4 integration gaps, each detailed in the Identified Gaps Log:

1. `docs/deployments.md:528` and `:672` describe the old router (two `{{CLOUD_RUNNER}}` jobs; `Check runner credentials` setting `claude=true`).
2. Router template comments (`bkit-cloud.yml` `:6-8`, `:90-95`, `:619`, `:631-632`, `:691-692`, template and adopted copy) still describe the two-job, credential-presence router.
3. Router test files keep the removed `grep -oE` / `sed` path in comments, and `cloud-ctx-step.integration.test.ts` still requires GNU sed, so its router tests skip on a machine without `gsed`.
4. The holistic `bkit tests changed` run fails its `format` stage on the committed `.claude/skills/vitest` symlink (a gate script defect outside the plan; owner decision).

Contracts checked and consistent across groups:

- `Select agent job` reads `bkit.cloud.agent` with the same values as `CLOUD_MODES` (`manifest.ts:104`).
- `bkit_gate` reads `bkit issues fetch --json` stdout (`labels`, exit 80 + `reason`), which `fetchVerb` emits (`issues.ts:738-751`); the guard's Jira branch reads the same `state` / `terminal` / `labels` facts (`preflight-tracker.sh:176-179`).
- Both router arms read `fid` / `issueId` / `fidNamed` from `bkit fids parse`.
- The advisory sniffs match the new template: it no longer carries `serves the GitHub tracker only` (`github.ts:415`), it carries `openai/codex-action` (`github.ts:424`) and `secrets.BKIT_` (`auth.ts:198`).
- The adopted `.github/workflows/bkit-cloud.yml` differs from the template only in `runs-on` x4 and `node-version-file` x3.

## Previously Attempted

First holistic attempt. Per-group reports: `build-plan-verify-1-1.md` .. `1-3.md`, `2-1.md`, `3-1.md`, `3-2.md`, `4-1.md`, `5-1.md`, `5-2.md`, `6-1.md` .. `6-5.md`, `7-1.md`, `7-2.md`, `8-1.md`, `8-2.md`, `9-1.md`, `9-2.md` (each group's last attempt PASS).

## Notes

- Mode: Holistic, every group of the plan, judged against the codebase at `7d2621102` plus the run's diff (`tmp/bkit-diff-719-cloud-variants-add.md`, partial; changed files read directly).
- Plan tick state: TASKS 2, 6, 19, 7 and 10 are unticked in the plan, although each group's last verify report named them. Their test-first audits carry entries the tick step does not clear on its own:
  - TASK 2: a `delete-still-referenced` gap in `build-tests-green-1-3.md`.
  - TASK 7: a `not-green` gap in `build-tests-green-4-1.md`.
  - TASKS 6, 19 and 10: `Already landed` entries in `build-tests-green-3-2.md` and `build-tests-green-6-5.md`.
  - TASK 18 is ticked in the uncommitted plan edit.
- TASK 2 satisfied. `.bkit/core/hooks/preflight-tracker.sh` exists and `preflight-linear.sh` is gone. The `DONE WHEN` grep prints one hit: `preflight-sh.integration.test.ts:502`, an assertion that `preflight-linear.sh` no longer exists. That hit is a different thing with the same name and proves the deletion. The audit's other `delete-still-referenced` hits are ledger rows, a dated audit report, and the two root mirror headers, which `build-plan-gaps-remediate-9-1-log.md` synced.
- TASK 6 satisfied. `validateCloudTrackerWired` (`install.ts:115`, call `:378`) is in place, with the `.codex/` and `.opencode/` one-shot checks (`install.ts:392`, `:404-407`). `git grep validateCloudTrackerMatch -- .bkit/core` prints nothing.
- TASK 19 satisfied. `install.integration.test.ts:883` asserts `.codex/hooks.json`. Decision record `build-decision-2-1.md` (Q1 and Q2, both `Decision: Fix now`) scheduled TASKS 19 and 20; it accepts no gap.
- TASK 7 satisfied. `Check runner credentials` reads only the `BKIT_` names. `Select agent job` (`bkit-cloud.yml:198-260`) sets at most one agent, with no fallback to whichever credential is present. The `DONE WHEN` grep prints nothing. The audit's `not-green` gap is cleared: vitest expands `recorded %s selects no router job` into the `cursor` and `none` cases, and both passed in this run.
- TASK 10 satisfied. The dev arm calls `fids parse --prompt-file`, then the merged-PR `--marker` fallback, then `--branch feat/$FID` (`bkit-cloud.yml:499-521`), and the charset assert is at `:321`. The `DONE WHEN` grep prints nothing.
- TASK 17 `DONE WHEN` grep prints `OPENCODE_PROVIDER_KEY_SENTINEL` / `@@OPENCODE_PROVIDER_KEY@@` at `opencode.ts:233`, `:288`. These are template sentinel identifiers, not secret names, so the grep counts as satisfied, as in `build-plan-verify-8-2.md`. The deployments doc inaccuracies are logged as integration gap 1 and do not fail TASK 17's `DONE WHEN`.
- Already landed (no gap): TASK 6 / TASK 19 `--tracker=jira --codex --auto=codex exits 0 and records codex`: the existing implementation already wrote `.codex/hooks.json`, and the tests step corrected only the stale footprint. TASK 10 `dev arm passes the gate for a closed issue that still carries bkit:auto`: `bkit_gate` already read labels only. TASK 10 `traversal FID from the subject or the merged-PR body is a no-FID no-op ...`: the slug assert already refused `../x`.
- Known open items from earlier groups, judged:
  - `docs/deployments.md:528` "in both jobs" is real: the template now has four `{{CLOUD_RUNNER}}` jobs (gap 1). The `:672` claude row's `Check runner credentials ... sets claude=true` was found in this pass and logged with it.
  - The `workflow-templates.integration.test.ts:288-292` header is real (gap 3), together with the matching `cloud-ctx-step.integration.test.ts:23-37` GNU sed comment and skip condition.
  - The claude-job header comment (now `bkit-cloud.yml:631-632`) is real (gap 2), together with four more stale router comments found in this pass.
- Holistic gate: `node_modules/.bin/bkit tests changed --base=origin/dev --fallback=bkit:gate:static-unit` exited 1 on its first run, with no lock wait (load 1.4). Every test, lint and typecheck stage passed, and only `format` failed (gap 4). `gsed` is installed here, so the ctx-step router tests ran rather than skipped.
- Derived Test Matrix: every row's test sits in its task's `DONE WHEN`. The full suite passes (this run, and `pnpm vitest run` 229 files in `build-plan-tasks-9-log.md`). `docs/observability.md` carries the `[bkit-cloud] gate:` table and the new finding rows. `docs/migrations.md` has the four detect-only rows. The Documentation Updates rows are done, except the deployments inaccuracies in gap 1.
- Out-of-scope finds (not plan gaps; propose separately):
  - `.bkit/core/engine/tools/instructions.ts:651-661` (`nearCandidate` pre-filter, commit `71407f480`) is on this branch but in no task. It appears to target the `instructions.test.ts` timeouts recorded in group 1.
  - `docs/migrations.md` carries a `migrateBrandedCheckNames` change that the plan does not mention (noted in `build-plan-tasks-8-log.md`).

## Identified Gaps Log

4 gaps (3 Fixable: true, 1 Fixable: false).

- Integration gap (Documentation Updates row `docs/deployments.md`, TASK 17 area): `docs/deployments.md:528` says the `bkit-cloud.yml` template ships `{{CLOUD_RUNNER}}` "in both jobs", but the template now has four `runs-on: {{CLOUD_RUNNER}}` jobs (context, claude, opencode, codex); `docs/deployments.md:672` (claude row of the lane jobs table) says "the `Check runner credentials` step sets `claude=true`", but that step now emits only `enabled` and `Select agent job` sets `claude`. Reword both to the current router — Fixable: true
- Integration gap (router template comments, TASK 7 / TASK 12 area): `.bkit/templates/.github/workflows/bkit-cloud.yml` and the adopted `.github/workflows/bkit-cloud.yml` keep comments from the credential-presence, two-job router: `:6-8` header names only `claude` and `opencode` as dispatch jobs (no `codex`); `:90-95` context-job comment says it resolves phase + arg "for both runner jobs" and "both runner jobs are skipped"; `:619` says the arg flows into "both runner jobs' model prompt"; `:631-632` claude-job comment says it "Runs only when the context job found a claude credential" (it runs only when `Select agent job` chose claude, as the opencode / codex comments `:713`, `:778` already say); `:691-692` says "a set ANTHROPIC_API_KEY secret takes precedence" (the job reads `secrets.BKIT_ANTHROPIC_API_KEY`). Consumers copy these comments; edit the template, re-copy to the adopted file with `runs-on` / `node-version-file` re-applied — Fixable: true
- Integration gap (router test files, TASK 10 area): TASK 10 removed every `grep -oE` / `sed` FID path from the router, but `.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts:288-292` still says the SHARED-DERIV region "uses portable `grep -oE` + `sed`", and `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts:23-26` still says the dev-arm FID extraction relies on GNU `sed -E ... \w+`. Its `hasTools` (`:33-37`) still requires GNU sed, so on a machine with BSD sed and no `gsed` both `describe.skipIf(!hasTools)` blocks (`:307`, `:1206`) skip, and with them the TASK 7-10 router tests, although the template calls no `sed`. Drop the GNU sed requirement and the `sed` shim (`:164-170`) if nothing else needs them, and rewrite both comments — Fixable: true
- Integration gap (holistic gate, outside every task): `bkit tests changed --base=origin/dev --fallback=bkit:gate:static-unit` exits 1, verdict FAIL, on its `format` stage only. `scripts/gate/bkit-gate-changed.mjs:96` passes every changed path to `prettier --check --ignore-unknown`, and prettier refuses the explicitly named symlink `.claude/skills/vitest` (mode 120000, added by the workflow's install-skills commit `852e3a87e`) with "Explicitly specified pattern ... is a symbolic link", although it reports "All matched files use Prettier code style!". The related and named Vitest stages (111 files / 5639 tests and 227 files / 9184 tests passed, 2 skipped), Node and Bats checks, lint and typecheck all passed. The root cause is the unchanged gate script, outside the plan's files; the owner decides whether to fix it here (skip symlinks in the format file list), in a separate change, or accept it — Fixable: false
