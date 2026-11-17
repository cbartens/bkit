Verdict: PASS
Failures: 0
Fixable: false
Tasks: 1, 2
Loosened: none
Fingerprint: a4469075cb8fa37e9a3ef814b63e7ee741ca0bb56cf4eb161c099883a4368628
<!-- verdict:end -->

# Plan Verification

## Scope

Holistic

## Groups Verified

1 of 1 (the plan has one group).

## Integration Gaps

0. The plan has one group with two tasks. TASK 2's generated copies match TASK 1's source text: the bullet in `.bkit/core/.agents/rules.md:123`, the `### local-pre-commit` store entry in `.bkit/instructions.md:1702`, the five `.bkit/core/prompts/*.md` sources, `.agents/rules.md:123` and the `.claude`, `.codex`, `.cursor`, `.opencode` and `.agents/plugins/bkit` agent mirrors all hold the same text.

## Previously Attempted

- `docs/plans/202611/logs/920-build-agents-run/build-plan-verify-1-1.md` (Group 1, attempt 1): PASS, tasks 1 and 2, no gaps.

## Notes

- The feature diff (`git diff 7d63b8d15 HEAD`, 50 files) covers only the rule text, the store entry, the two corpus tests, the five prompts, the installed rules file, the host mirrors, `.bkit/version` (the install record merged during the rebase, per `rebase-resolve-log.md`) and run logs. The rest of `tmp/bkit-diff-920-build-agents-run.md` comes from local `dev` commits (#911, #915, #929) that are not yet on `origin/dev`, and is outside this plan.
- TASK 1: the store entry and the `rules.md` bullet hold the same new text ("Before a commit and while working ... naming each test file, never a folder, a pattern, the full suite or a `bkit:gate:*` script ... A `/bkit-*` step's named command is the only wider run."). The text names no test runner or stack. The old text sits first under `retired`. The `- carry:` line lists `bkit-build-plan-tasks`, `bkit-build-plan-tests`, `bkit-build-plan-verify`, `bkit-build-plan-gaps-remediate` and `bkit-debug-failure-remediate`.
- TASK 2: each of the five prompt sources holds the bullet once. `node dist/cli.js check` reported `0 write(s) would occur`, so the mirrors have no drift.
- `bkit tests changed --base=origin/dev --fallback=bkit:gate:static-unit` ran `bkit:gate:changed`. The related run passed (237 files, 9787 tests), including `.bkit/core/engine/tools/instructions.test.ts`. The named run had 1 failure out of 8544 tests: `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` `analyses dense script sources in linear time` took 1184ms against its fixed `toBeLessThan(1000)` limit, with a load average of 8.7 on 10 cores. Run alone with `pnpm bkit:test:file`, the file passed 76 of 76 at a load average of 11.9. This branch changes no hook source or hook test, so the failure is a timing flake under load, and it is not logged as a gap. Lint, format and typecheck passed.
- Test-first audit `build-tests-green-1-1.md`: `Enforced: true`, `Gaps: 0`, `Unproven: 0`. Both TEST FIRST tests went red and then green. It has no `Updated tests`, `Already landed` or `delete-still-referenced` entries.
- Derived Test Matrix: both rows map to TASK 1's TEST FIRST tests in `.bkit/core/engine/tools/instructions.test.ts`, which exist and pass. TASK 1's `DONE WHEN` does not name them. That is a point about the plan's shape, not an implementation gap, because the tests are present and pass.
- Docs: `.agents/docs.md` was loaded. `docs/testing.md` § Tests lock agrees with the new rule. `docs/observability.md` does not apply, because the plan adds no error path. The plan has no `Documentation Updates` section.
- No decision records or gaps-remediate logs exist for this run.
- Out-of-scope proposals, not gaps: (1) three `kept:` drift reasons in `.bkit/instructions.md` (lines 335, 1666 and 1821) still quote the retired wording "`local-pre-commit`: `/bkit-*` steps run their own gates". (2) The `guardrails-cursor.integration.test.ts:704` limit of 1000ms is fixed and does not scale with the load-based test timeout budget, so it can fail on a busy machine.

## Identified Gaps Log

None
