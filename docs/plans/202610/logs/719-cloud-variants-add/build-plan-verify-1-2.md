Verdict: PASS
Failures: 0
Fixable: false
Tasks: 1, 2

<!-- verdict:end -->

# Plan Verification

## Scope

Group 1

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

- `build-plan-verify-1-1.md`: CONCERNS, 1 gap (TASK 2 `delete-still-referenced`, `docs/architecture.md:177`, Fixable: true); TASK 1 satisfied.
- `build-plan-gaps-remediate-1-1-log.md`: PASS, Fixed 1. `docs/architecture.md:177` now names `preflight-tracker.sh` as the tracker guard; `bkit:generate` refreshed the two `bkit-preflight.sh` mirrors, `docs/capabilities.md` and `.bkit/version`.

## Notes

- Mode: Group. Judged against `build-diff-1-2.md`. The brief has no `Deviations` section. No decision records (`build-decision-*.md`) exist.
- TASK 1 satisfied. A shared `isTerminal` helper in `tracker.ts` feeds `fetchIssue` (GitHub `closed`, Linear `state { name type }`, Jira `fields.status.statusCategory.key`, with the evidence-view comment beside the call) and all three `readBlockers` arms. `fetchVerb` facts and spec list `terminal`, and the spec names the router contract on `labels`, `skipped` and `reason`. `dist/commands/workflow/{tracker,issues}.js` carry the change. `node dist/cli.js issues fetch --help` lists `terminal`. The five TEST FIRST tests and the `blockers` cases pass.
- TASK 2 satisfied. The attempt 1 gap is fixed: `docs/architecture.md:177` names `preflight-tracker.sh`, "the tracker guard (GitHub, Linear)". The rest is unchanged from attempt 1: `preflight-tracker.sh` replaces the deleted `preflight-linear.sh` (no alias), dispatches on `bkit.tracker.default`, reads GitHub over REST with `BKIT_GH_TOKEN` (HARD STOP naming it when unset), judges Linear by `state.type`, sets `--connect-timeout 5 --max-time 15` on every `curl`, and HARD STOPs naming tracker and reason. Both host wrappers splice `# {{BKIT_PART preflight-tracker.sh}}`. The five TEST FIRST tests and `.bkit/core/engine/render/parts.test.ts` pass.
- TASK 2 `DONE WHEN` grep (`git grep -l 'preflight-linear' -- .bkit/core/hooks .bkit/core/.claude .bkit/core/.cursor .bkit/core/engine`) prints one file, `.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts`. Its only hit (`:355`) is the locked TEST FIRST assertion that `preflight-linear.sh` no longer exists. As in attempt 1, this is treated as satisfied; the literal "prints nothing" can never hold while that assertion exists. The owner may want to reword that `DONE WHEN`.
- Test-first audit (`build-tests-green-1-2.md`): `Enforced: true`; all 10 tests went red first, then passed; Unproven 0; no `Updated tests` or `Already landed` sections. The added `terminal: false` lines in the existing `issues.test.ts` fetch case only add expectations.
- Decisions on the audit's one `delete-still-referenced` gap (Fixable: null), hit by hit (all hits from `git grep -n preflight-linear` outside `docs/plans`):
  - `.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts:355` asserts that the file is absent. It proves the deletion and does not use the file. No gap.
  - `.claude/hooks/bkit-preflight.sh:18` and `.cursor/hooks/bkit-preflight.sh:16` sit in the installed mirrors' header comments, outside `bkit:start/end`, which `bkit install` does not rewrite. The rules forbid editing mirrors directly. TASK 3 makes the source headers tracker-neutral (`plan.md:678-679`) and TASK 18 regenerates the mirrors and hand-syncs these headers (`plan.md:1004-1005`). Not a group 1 gap.
  - `docs/decisions.jsonl:421`, `docs/deferrals.jsonl:71` (`650-preflight-linear-issue-less`), `docs/deferrals.jsonl:132` and `docs/audits/202611/deferrals.md:422` are append-only ledger rows and a dated audit report. The plan (`plan.md:324`) refreshes the `650-*` row through the deferrals ledger in a separate change. No gap.
- Tests run locally: the 4 group files (178 tests) passed. 47 neighbouring files covering the preflight mirrors, `.bkit/version` hashes, `docs/architecture.md`, dogfood copies, install, check, upgrade and the claude module (2731 tests) also passed, so neither task nor the remediation broke a test.
- `build-plan-current.md` names only TASK 4 (group 3). It does not affect group 1.

## Identified Gaps Log

None
