Verdict: PASS
Failures: 0
Fixable: false
Tasks: 1, 2, 3, 4, 5, 6
Loosened: none

<!-- verdict:end -->

# Plan Verification

## Scope

Holistic

## Groups Verified

2 of 2 (the plan has 2 groups).

## Integration Gaps

0. The groups fit together:

- Group 1's guard (`commentRunProof` in `.bkit/core/engine/commands/workflow/tracker.ts`, called from `issuesCommand` `comment.run` in `issues.ts`) accepts every call that Group 2's sources make. All 12 `issues comment` calls in `.bkit/core/workflows/*.md` carry `--session-dir="{SESSION_DIR}"` (10) or `--file="{STATUS}"` (`bkit-build.md:1349`, `bkit-ship.md:236`). `bkit-ship` starts its run (`workflows start`, line 213) before its Step 1 comment, so its `--file` proof holds a `ship` run.
- `bkit-auto.md:114` now holds `sessionDir` as `SESSION_DIR`, which its three calls (lines 84, 132, 155) pass.
- The audit proof compares the body file's folder with `<git-common-dir>/bkit-outbox/audit-{slug}`, which is `outboxRoot` + `audit-{slug}` (`lib.ts:1130`). That matches the `--body-file="{OUTBOX_ROOT}/audit-{slug}/comment.md"` at `.bkit/core/prompts/bkit-audit-generate.md:251`.
- #860's `--result-file` mode is already on the branch. The guard sits in front of it too, and the one existing result-file caller (`journal.integration.test.ts`) passes an audit body file as its proof.
- The Task 5 Comments clause, the Task 4 rule, the Task 2 CLI summary and the Task 6 § Comment Lifecycle paragraph all describe the same three proofs and the same refusal. No source names a proof that the engine does not accept.

## Previously Attempted

- `build-plan-verify-1-1.md`: Group 1, CONCERNS, 1 gap (Task 1 left `.bkit/core/engine/ledgers/journal.integration.test.ts` "keeps rendered audit report appended rows and tracker draft counts identical" broken), Tasks 2.
- `build-plan-gaps-remediate-1-1-log.md`: fixed that gap with an audit body file under `<outbox>/audit-security/`, assertions unchanged.
- `build-plan-verify-1-2.md`: Group 1, PASS, Tasks 1, 2.
- `build-plan-verify-2-1.md`: Group 2, PASS, Tasks 3, 4, 5, 6.
- This is the first holistic attempt.

## Notes

- Partial diff coverage: `tmp/bkit-diff-918-ad-hoc-agent.md` shows `origin/dev...HEAD`, which also carries unpushed local `dev` work (#860, #864, #891, #901) merged in at `5d83f9364`. The feature's own changes were judged from `git diff 90251a7c4 HEAD` (62 files outside `docs/plans`), read in full for the engine, tests, sources and docs.
- Tasks 1 to 6 are all satisfied. The nine Task 1 TEST FIRST names and the Task 2 summary test exist in `issues.test.ts` / `tracker.integration.test.ts`. The Task 3 and Task 5 `it` cases exist in `catalog-parity.test.ts`, and the Task 4 case exists in `rules-sync.test.ts`. Each `Derived Test Matrix` row maps to its task's `DONE WHEN`.
- Checks run this attempt:
  - `pnpm bkit check` exited 0 with no drift.
  - `pnpm bkit:graph:check` reported `docs/capabilities.md matches a rebuild at 2882df23d`.
  - Scratch git repo: `node dist/cli.js issues comment --issue=1 --step-number=1 --step-title=x` exits 2 with the refusal message. The same call with a `--session-dir` under the outbox `sessions/` folder and `--workflow=plan` exits 0 and prints the marked body.
  - `grep 'Omit \`--session-dir\`'` finds nothing in the workflow sources or the mirrors.
  - The rule sentence is identical in `.bkit/core/.agents/rules.md`, `.agents/rules.md`, `.bkit/instructions.md` and `bkit-utility-update-tracker.md`.
  - The five decision rows and the deferral row `918-repair-already-marked-consumer-comments` are present.
- `dist/` currency was checked from history, not with `pnpm bkit:check:dist`, because this verifier does not build. The last non-test engine `.ts` change and the last `dist/` change are the same commit (`ebfa26561`), and `build-plan-verify-1-2.md` byte-compared a fresh compile with `dist/` at that point.
- `bkit tests changed --base=origin/dev --fallback=bkit:gate:static-unit` exited 1. Its one failure was a 33300 ms timeout in `.bkit/core/engine/commands/install/upgrade.integration.test.ts` "upgrade creates a file a newer release adds to an installed opt-in host (#550)", in the `related` stage: 1 failed, 9568 passed, 2 skipped.
  - The same file passed in the gate's `named` stage (232/232 files, 9538 passed), and the case passed run alone in 7.76 s.
  - The 918 feature changes no install or upgrade code. The file is in the changed set only because of the merged #864 work.
  - This is a load timeout, not a failing test of this plan, so it is not logged as a gap. Every other stage passed: node `--test`, bats, oxlint, prettier and typecheck. A recurrence row in `docs/failures.jsonl` for that case is a suggested follow-up outside this plan.
- Deviations from the Architecture text, not gaps, because no `DONE WHEN` pins them and the behaviour holds:
  - `commentRunProof` takes the `RunContext` and returns `"status"`, not `"run"`.
  - `sessionsRoot` returns `null` instead of throwing.
  - The audit proof does not check the slug against `^[a-z0-9-]+$` itself. `buildComment` (`issues.ts:846`) refuses such a slug with exit 2 before any body is built, so a traversal slug cannot produce a body.
- No test-first audit report and no `build-decision-*.md` record was supplied, so Step 8 had nothing to decide.
- Observability: the refusal is a `CommandError(EXIT.USAGE)` raised before any write or tracker request. `docs/observability.md` § Tracker reporting diagnostics needs no `[bkit-tracker]` line for it.

## Identified Gaps Log

None

