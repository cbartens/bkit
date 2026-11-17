Verdict: PASS
Failures: 0
Fixable: false
Tasks: 1, 2, 3, 4, 5, 6, 19, 20, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18
Loosened: none

<!-- verdict:end -->

# Plan Verification

## Scope

Holistic

## Groups Verified

9 of 9 (the plan has 9 groups).

## Integration Gaps

0 integration gaps. The four gaps from holistic attempt 1 are closed:

1. `docs/deployments.md:528` now names the `{{CLOUD_RUNNER}}` placeholder in each of the four jobs (`context`, `claude`, `opencode`, `codex`). The `:672` claude row says `Select agent job` sets `claude=true`, which matches the template (`bkit-cloud.yml:198-246`).
2. The router template comments (`:6-9`, `:91-96`, `:620`, `:633`, `:695`) describe one recorded agent per run, name the `codex` job and `BKIT_ANTHROPIC_API_KEY`. The adopted `.github/workflows/bkit-cloud.yml` differs from the template only in `runs-on` x4 and `node-version-file` x3.
3. `cloud-ctx-step.integration.test.ts` no longer checks for GNU sed or writes a `sed` shim. `hasTools` needs only `git`, `jq` and `bash`. Neither the template nor the test calls `sed`. The `workflow-templates.integration.test.ts:290-293` comment names `bkit fids parse` + `jq`.
4. `scripts/gate/bkit-gate-changed.mjs:97-99` passes only non-symlink files to `prettier`. The holistic `bkit tests changed` run below passes its `format` stage.

Contracts checked and consistent across groups:

- `Select agent job` reads `bkit.cloud.agent` (`bkit-cloud.yml:211-212`, absent reads `none`) with the values of `CLOUD_MODES` (`manifest.ts:104`).
- `bkit_gate` reads `bkit issues fetch --json` stdout: `labels` (`:461`, `:466`), and exit 80 + `reason` (`:439-453`). `fetchVerb` emits these (`issues.ts:709-713`). The guard's Jira branch reads the same `state` / `terminal` / `labels` facts (`preflight-tracker.sh:176-179`).
- Both router arms read `fid` / `issueId` / `fidNamed` from `bkit fids parse` (`:505-522`, `:581-584`). These are the field names `fids.ts` returns (`:601`, `:716`).
- The advisory sniffs match the new template. It no longer carries `serves the GitHub tracker only` (`github.ts:415`). It carries `openai/codex-action@` (`github.ts:424`) and `secrets.BKIT_` (`auth.ts:198`).

## Previously Attempted

- Holistic attempt 1 (commit `52d583a80`, same file): `FAIL`, 4 gaps. Gaps 1-3 (`Fixable: true`): `docs/deployments.md:528` / `:672` described the old two-job, credential-presence router; router template comments (`:6-8`, `:90-95`, `:619`, `:631-632`, `:691-692`, template and adopted copy) did the same; `cloud-ctx-step.integration.test.ts` still required GNU sed, and both router test files kept `grep -oE` / `sed` comments. Gap 4 (`Fixable: false`): the holistic `bkit tests changed` failed its `format` stage on the committed `.claude/skills/vitest` symlink.
- Commit `4c3518915` (`fix(719-cloud-variants-add): close holistic verify gaps`) addressed all four. No `build-plan-gaps-remediate-holistic-*-log.md` and no decision record for that round were supplied.
- Per-group reports: `build-plan-verify-1-1.md` .. `1-3.md`, `2-1.md`, `3-1.md`, `3-2.md`, `4-1.md`, `5-1.md`, `5-2.md`, `6-1.md` .. `6-5.md`, `7-1.md`, `7-2.md`, `8-1.md`, `8-2.md`, `9-1.md`, `9-2.md`; each group's last attempt is `PASS`.

## Notes

- Mode: Holistic, every group of the plan. Judged against the codebase at `88035b9af`. The run's diff (`tmp/bkit-diff-719-cloud-variants-add.md`) has partial diff coverage: it shows the 20 largest files only. The changed source files and commit `4c3518915` were therefore read directly. Since holistic attempt 1 (`7d2621102`), only `4c3518915` changed code, tests, the template or docs. The other commits changed the plan's tick boxes and build logs.
- Plan tick state: TASKS 1-20 are all `[x]`. Commit `6b357660b` ticked TASKS 2, 6, 19, 7 and 10.
- Every task's `DONE WHEN` grep was re-run on the current tree:
  - TASKS 4, 6, 7, 8, 10 and 18 print nothing. TASK 16 prints nothing for its forbidden text, and `.bkit/core/.bkit/cloud.md:409-411` names Linear and Jira router dispatch, the codex router job and the Cursor Jira guard as `not yet verified live`.
  - TASK 2 prints `.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts`. Its only hit asserts that `preflight-linear.sh` no longer exists, so it proves the deletion (as in `build-plan-verify-1-3.md`).
  - TASK 17 prints `opencode.ts:233`, `:288` (`OPENCODE_PROVIDER_KEY_SENTINEL` / `@@OPENCODE_PROVIDER_KEY@@`). These are template sentinel identifiers, not secret names, and the grep counts as satisfied, as in `build-plan-verify-8-2.md`.
- Per-task judgement is carried from each group's last `PASS` report, because nothing those tasks own has changed since, apart from the comment and doc lines above. TASK 19 and TASK 20 follow decision record `build-decision-2-1.md` (Q1, Q2: `Decision: Fix now`). That record schedules work and accepts no gap. `build-decision-1-1.md` .. `1-3.md` are `Decision: Try again` and accept no gap.
- Already landed (no gap; carried from the group audits):
  - TASK 6 / TASK 19 `--tracker=jira --codex --auto=codex exits 0 and records codex`: the existing install already wrote `.codex/hooks.json`, and the tests step corrected only the stale footprint.
  - TASK 10 `dev arm passes the gate for a closed issue that still carries bkit:auto`: `bkit_gate` already read labels only.
  - TASK 10 `traversal FID from the subject or the merged-PR body is a no-FID no-op that writes nothing outside docs/plans/`: the old slug allowlist already refused `../x`.
- No test-first audit report was supplied for this attempt. The per-group audits have no open `Unproven`, `Updated tests` or `test-loosened` entries.
- Holistic gate: `node_modules/.bin/bkit tests changed --base=origin/dev --fallback=bkit:gate:static-unit` exited 0, verdict `PASS`, on its first run with no lock wait (load 4.5). Stages: related Vitest 111 files / 5639 passed, 2 skipped; named Vitest 227 files / 9184 passed, 2 skipped; node `--test` and Bats checks passed; `oxlint` passed; `prettier --check` passed ("All matched files use Prettier code style!"); `pnpm typecheck` passed. `gsed` is installed on this machine, but the router tests no longer depend on it.
- Derived Test Matrix: every row's test sits in its task's `DONE WHEN`. The full suite passes (this run, and `pnpm vitest run` 229 files in `build-plan-tasks-9-log.md`). `docs/observability.md` carries the `[bkit-cloud] gate:` section, the `buildCloudSetupAdvisory` row and the `detectCiRouterSecrets` row. `docs/migrations.md` has the four detect-only rows. Every Documentation Updates row is done, including `docs/deployments.md` (fixed in `4c3518915`).
- Out-of-plan changes on this branch, for the owner (not plan gaps):
  - `scripts/gate/bkit-gate-changed.mjs` (symlink filter in the `format` stage, `4c3518915`). This is bkit's own gate script, not shipped, and no test covers it. It closes holistic attempt 1's gap 4.
  - `.bkit/core/engine/tools/instructions.ts:651-661` (`nearCandidate` pre-filter, commit `71407f480`) is in no task.
  - `docs/migrations.md` carries a `migrateBrandedCheckNames` change that the plan does not mention (noted in `build-plan-tasks-8-log.md`).
- Minor wording, not gaps (propose separately):
  - `bkit-cloud.yml:762` (opencode dispatch env comment) says "ANTHROPIC_API_KEY is absent". This is true, but it names the legacy secret rather than `BKIT_ANTHROPIC_API_KEY`.
  - `docs/deployments.md:681` gives the `ARG` allowlist as `^[0-9A-Za-z.*/-]+$`, but the template uses `^[0-9A-Za-z._/-]+$` (`bkit-cloud.yml:621`). The same text is already on `origin/dev`, so this branch did not introduce it.

## Identified Gaps Log

None

