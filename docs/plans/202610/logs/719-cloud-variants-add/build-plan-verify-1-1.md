Verdict: CONCERNS
Failures: 1
Fixable: true
Tasks: 1

<!-- verdict:end -->

# Plan Verification

## Scope

Group 1

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

None

## Notes

- Mode: Group. Judged against `build-diff-1-1.md`. No brief `Deviations` section, no decision records, no earlier verify or remediation logs.
- TASK 1 satisfied. A shared `isTerminal` helper in `tracker.ts` feeds `fetchIssue` (GitHub `closed`, Linear `state { name type }`, Jira `fields.status.statusCategory.key`) and `readBlockers`. The Jira call carries the required comment that the `evidence` view returns `statusCategory`. `fetchVerb` facts and spec list `terminal`, with the router contract named on `labels` / `skipped` / `reason`. `dist/` is rebuilt and committed. `node dist/cli.js issues fetch --help` lists `terminal`. The five TEST FIRST tests and the existing `blockers` cases pass.
- TASK 2 not satisfied, for one reason only: the audit gap `delete-still-referenced` (`docs/architecture.md:177`, Fixable: true). The rest of the task is in place. `preflight-tracker.sh` replaces `preflight-linear.sh` (deleted, no alias). It dispatches on `bkit.tracker.default`, reads GitHub over REST with `BKIT_GH_TOKEN` (HARD STOP naming it when unset; issue id from `GITHUB_ISSUE_ID`, else the `feat/{N}` branch; owner/repo from `origin`), judges Linear by `state.type`, sets `--connect-timeout 5 --max-time 15` on every `curl`, and HARD STOPs on unreadable answers naming the tracker and the reason. Both host wrappers splice the new part. `runPreflight` takes a `cwd` option and uses fixture repos and a `curl` stub. The five TEST FIRST tests and `.bkit/core/engine/render/parts.test.ts` pass.
- Decisions on the `delete-still-referenced` hits (audit Fixable: null):
  - `.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts:355` asserts that `preflight-linear.sh` no longer exists. It is the proof of the deletion, not a use of the file, so it is no gap. This is the one line TASK 2's `DONE WHEN` grep prints. The plan's literal "prints nothing" can never hold while this locked TEST FIRST assertion exists, so treat the grep as satisfied when this is its only hit. The owner may want to reword that `DONE WHEN`.
  - `.claude/hooks/bkit-preflight.sh:18` and `.cursor/hooks/bkit-preflight.sh:16` are installed mirrors. Regenerating them, including the hand-synced header outside `bkit:start/end`, is planned in TASK 18 (`plan.md:1004-1005`, group 9), and the rules forbid editing mirrors directly. Not a group 1 gap.
  - `docs/decisions.jsonl`, `docs/deferrals.jsonl` (ledger keys such as `650-preflight-linear-issue-less`), `docs/audits/202611/deferrals.md` and `docs/plans/**` are historical, append-only records. They are not references to the file. No gap.
  - `docs/architecture.md:177` is a current-state doc that names the deleted file as the Linear guard. No task in the plan edits it, because the `Documentation Updates` row says "No change". Gap, Fixable: true.
- Test-first audit (`build-tests-green-1-1.md`): `Enforced: true`. All 10 tests went red first, then passed. Unproven 0. No `Updated tests` or `Already landed` sections. The added `terminal: false` expectations in the existing `issues.test.ts` fetch case only add expectations.
- Tests run locally: the 4 group files (178 tests) passed. 19 neighbouring files covering install, check, upgrade, the claude module, template copies, before-checks and workflow shape (1121 tests) also passed, so no test broke.
- `build-plan-current.md` names only TASK 4 (group 3). It does not affect group 1.

## Identified Gaps Log

Gaps: 1

- TASK 2: delete-still-referenced — `docs/architecture.md:177` still names `preflight-linear.sh` as "the Linear guard both `bkit-preflight` hooks splice in"; the file is deleted and no later task edits `docs/architecture.md` (its `Documentation Updates` row says "No change"). Rename the reference to `preflight-tracker.sh` and describe it as the tracker guard — Fixable: true
TASK 2: delete-still-referenced — Fixable: true
