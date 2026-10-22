Verdict: FAIL
Failures: 2

<!-- verdict:end -->

# Plan Verification

## Scope

Single — `docs/plans/202610/651-sops-env-backup-plan.md` (sub-plan 1; no `-plan-1.md`), 12 runbook tasks.

## Sub-Plans Verified

None

## Integration Gaps

None

## Previously Attempted

None

## Notes

- Partial diff coverage: `git diff origin/dev..HEAD` = 74 307 lines (> 10 000) and origin/dev is 2 commits ahead; reviewed the merge-base diff (`git diff $(git merge-base origin/dev HEAD)..HEAD`) per file for in-scope paths; `.agents/skills/vitest/`, `build-task-red-*.snapshot`, version-stamp mirrors skipped.
- Tasks 1-10: `Done when` met — ticks kept. Evidence: `pnpm vitest run` unscoped 182 files / 6583 tests passed, 0 skipped (EB executed, `sops` 3.13.3 on PATH); EB + SS + vitest-tsx-bin + dogfood + templates + templates-content + catalogue + template-path-refs + rules-sync 606/606; disk-prune + local-gate-audit + ledger-integrity green; `actionlint` exit 0; CI step has VERSION + SHA256 + `sha256sum -c -` + renovate comments; `.sops.yaml` placeholder count 0, template differs only on the key line, prettier clean; script / config / post-commit / bkit-secrets root copies `cmp`-identical; modes `100755` match `bkit-secrets.mjs`; `.gitignore` `!.env.enc` / `!.env.*.enc`; no `allow-missing` under `.bkit/templates` or `scripts`; `compareExample` called from `check` and `sync`; `bkit:check:dist` exit 0 with `dist/` committed; rules source `:94` + mirror match, `core.bare` false; `bkit check` exit 0.
- Task 11 unticked (Gap 1); Task 12 unticked (Gap 2). Task 11 docs rows (templates.md sections incl. `pre-merge-commit`, `{{AGE_PUBLIC_KEY}}` row, security / testing / setup / technology) and 3 decision rows present; only the 4 deferral rows are missing.
- Test-first (checked by hand; `bkit tests green` reported `Enforced: false`): every named `Test first` test in Tasks 1-9 appears failed in its `build-task-red-1-{task}-*.md` log; `n/a` entries match the plan's declared regression guards. Snapshot vs current test file: only refactors (helper extraction, `stagedFiles` sorting, formatting) and the planned dogfood pre-commit re-anchor; no assertion weakened. The SS `:408-415` exit-2 test rewrite to warn-only is the planned Sweep change.
- Executor deviations accepted: `rekey` runs `rotate` then `updatekeys` (Task 1 contract pin; row 20 green); `restage` has no missing-sops warning.
- Gates 2-4, Security, Pre-Flight checkboxes are left `[ ]` by the executor; out of this verifier's tick scope (runbook tasks only).

## Identified Gaps Log

Count: 2 (1 not fixable by gap-remediate, 1 fixable).

- Gap 1 (Task 11, not fixable by gap-remediate): the 4 `docs/deferrals.jsonl` rows from plan § Out of Scope (`651-env-backup-store-sync`, `651-env-backup-ci-decryption`, `651-env-backup-hosted-secret-managers`, `651-env-backup-key-storage-automation`) are absent (`grep -c '"key":"651-' docs/deferrals.jsonl` = 0). Task 11 `Done when` requires every § Out of Scope key present exactly once. `@bkit-build-plan-execute` and `@bkit-build-plan-gaps-remediate` are barred from that ledger (`DEFERRAL_WRITERS`, `.bkit/core/engine/ledgers/telemetry.ts:308`; `ledger-integrity.test.ts:236`), so gap-remediate cannot close it; the orchestrator (row with no `subagent`) or `@bkit-utility-update-deferrals` must append the rows. Task 11 left `[ ]`.
- Gap 2 (Task 12, fixable by gap-remediate): `Done when` requires the four new templates installed into a scratch consumer "with modes equal to their bkit-repo sources (`stat`; `post-commit` + script executable)". Repo sources are `100755` (`.bkit/templates/.husky/post-commit`, `.bkit/templates/scripts/env-backup/bkit-env-backup.mjs`), but `pnpm pack` stores them `-rw-r--r--` (verified: `tar -tvzf` of a fresh `pnpm pack`), and `copyTemplates` copies the source mode as-is (`.bkit/core/engine/install/template-copies.ts:69` `fs.chmodSync(dstPath, fs.statSync(srcPath).mode)`), so a consumer gets both files non-executable. The execute log records this as a NOTE yet ticked Task 12. Pre-existing for `.husky/pre-commit`, `pre-push` and `bkit-secrets.mjs`. Fix: restore exec bits for executable templates at install (e.g. shebang-based in `template-copies.ts`) with a test, or a plan update that drops the mode clause. Scratch-consumer re-run was not possible in this session (sandbox denied the npm install). Task 12 left `[ ]`.
