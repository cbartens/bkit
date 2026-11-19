Verdict: PASS
Failures: 0
Fixable: false
Tasks: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24
Loosened: none
Fingerprint: 008afe287ed867b949b92ff3d78dd6acd993c5434008c62ba0c790c3f18de133
<!-- verdict:end -->

# Plan Verification

## Scope

Holistic

## Groups Verified

6 of 6 (the plan has 6 groups).

## Integration Gaps

0. The groups work together:

- Groups 1 and 5: Task 20 changed `reportSection` in `challenge.ts` so that fenced lines are not counted. Two readers share it: the `## CRITICAL` count in `bodyProblem` (`steps.ts:1149`) and `parseFindings` (the challenge `## Findings Log`). The six count-checked prompts still declare the three rules `promptHeader` reads.
- Groups 3 and 5: the Decision Pause in `bkit-build.md` step 2 tells the orchestrator never to write `Source changed`, `Gate` or `Status`. Task 19's `itemProblem` refuses exactly those three lines, and it reads only the orchestrator's own header (`decisionHeader(text)`), so the engine file's `Source changed` never triggers a refusal. `decisions counts` runs before `decisions check`. As a result, Task 17's "no question" rule sees the engine file's `## Progress` on a loop-only `TESTS_LOOP` pause and accepts it. Every other pause kind writes at least one item.
- Groups 3 and 5: Task 18's `TAKEN_UNASKED` exception in `mergeItems` lets the orchestrator's answer beat only an engine line that was taken without asking. The loop answer that Task 12's `apply --by=owner --answer` writes (`Try again — {reason}`), the gate re-run line and ship's confirm or reject do not match it, so they still win. Every reader goes through `decisionItems` / `mergeItems`.
- Groups 3 and 6: Task 24's `--reason-file` feeds the same `--by=owner` path as `--reason`. The reason file `build-owner-reason-{RUN}-{DECISION}.md` does not match any decision-file listing (`^build-decision-` in `challenge.ts:256`, `workflows.ts:1834`, `decisions.ts:350`), so no reader takes it for a pause. No `{owner's words}` sits inside a double-quoted bash argument in `bkit-build.md` or its `.claude`, `.cursor`, `.opencode` and `.agents` copies.
- Groups 4 and 6: Task 14 moved the error and stderr files into `{LOG_DIR}`, and the abort commit carries them. Task 23's `scrubFailureFiles` (`workflows.ts:362-375`) rewrites both files in place, resolving them against `cwd`, before `failVerb` writes state, commits or posts.
- Groups 2 and 6: Task 22's `path:line` rule on `Location` matches the rule the replaced `parseAuditResult` enforced at the base commit (`issues.ts:664` at `2fa879a63`). The audit contract is no stricter than before.

## Previously Attempted

- `build-plan-verify-holistic-1-1.md`: `PASS` over groups 1-4 (Tasks 1-16), before the challenge added groups 5 and 6. Since then, groups 5 and 6 changed `decisions.ts`, `open-decision.ts`, `steps.ts`, `challenge.ts`, `audit-report.ts`, `workflows.ts` and `bkit-build.md` step 6. This round re-checks Tasks 1-16 against those changes.

## Notes

- Partial diff coverage: `tmp/bkit-diff-958-agents-orchestrator-write.md` shows 20 of 253 files. The cross-group check therefore used `git diff 3d79e25cb HEAD` (everything since holistic attempt 1, 32 files outside `docs/plans`) and the codebase itself, together with the group reports `build-plan-verify-5-2.md` and `build-plan-verify-6-2.md`.
- Tests run, all green: 24 unit files, 1862 tests (`steps`, `challenge`, `audit-report`, `issues`, `ledgers`, `open-decision`, `decisions`, `tasks`, `status`, `workflows`, `summary`, `context`, `context-fetch`, `verdict-vocabulary`, `workflow-shape`, `question-option-format`, `template-shape`, `branding`, `conventions`, `trackers`, `cli-doc`, `instructions-coverage`, `instructions`, `instructions-sources`). They cover every test named in any task's `DONE WHEN` or `TEST FIRST`. All 14 group 5 and 6 test names exist exactly once in their files. Each `Derived Test Matrix` row maps to one task's `TEST FIRST` (rows 186-199 → Tasks 17-24).
- Checks run: `pnpm exec tsx .bkit/core/engine/tools/instructions.ts` exits 0 and reports nothing. `pnpm bkit:text:ceiling check` reports ok at prompts 83844 and workflows 58001, both below 86494 / 58535. `bkit check` (run from source) exits 0 and leaves the tree unchanged.
- Removal greps (Task 16 `DONE WHEN`): the pattern finds nothing in `.bkit/core/.bkit/*.md`, the workflows or the prompts, and nothing in `.bkit/instructions.md` outside its `retired` blocks. No `<<'` heredoc remains in any workflow or prompt.
- Built CLI: `node dist/cli.js help`, `ledgers findings --help`, `decisions check --help`, `decisions counts --help`, `decisions apply --help` (which lists `--reason-file`) and `workflows fail --help` all exit 0. `decisions compose` exits 2. Every commit since holistic attempt 1 that changed engine TypeScript (`6c7f36cf9`, `0ea7c87c4`, `eaff38540`) also changed `dist/`. The fourth such commit, `494111548`, touched only a render snapshot.
- All 24 tasks are `[x]` in the plan; the Task 24 tick is in the working tree, not yet committed.
- Decision records: `build-decision-1-1.md` (group 3, loop answer `Try again`) accepts no gap. `build-decision-1-2.md` (Task 18 `Fix now`, direction (a)) was assumed by the orchestrator, not given in the owner's own words, and Task 18 is judged satisfied as it directs. No test-first audit report was supplied for this holistic round.
- Documentation Updates: every row is done, as attempt 1 found. Advisory, carried from `build-plan-verify-6-2.md`: the `docs/testing.md` rows for `audit-report.test.ts` (line 991) and `workflows.test.ts` (line 963) do not name the newer behaviours (the `Location` refusal, backslash cells and the lone `None` row; the failure-file scrub). No `DONE WHEN` names them. `docs/observability.md` needs nothing, because the refusals use the existing `problem` / `CommandError` output.
- Not run here, because this verifier does not build or run `bkit:gate:*` scripts: `pnpm build`, `pnpm cli:sync`, `ceiling lower` and Task 16's `pnpm bkit:gate:static-unit-integration`. Stand-ins: `cli-doc.test.ts` passes, the `dist/` probes and parity above pass, and `bkit check` exits 0. The holistic gate runs the full suite.
- Observations, not gaps (no `DONE WHEN` names them; propose separately):
  - `.bkit/core/workflows/bkit-ship.md:406` still passes `--reason="{human's words}"` inside a double-quoted argument. This is the same shell-injection shape Task 24 removed from bkit-build.
  - Decision Pause step 6's loop-answer block in `bkit-build.md` does not depend on whether the pause has a loop question. This is already recorded as deferral `958-agents-orchestrator-write-challenge-low-bkit-core-workflows-bkit-build-md-290`.
  - A multi-line `--reason-file` text is written raw into the engine file. This is already recorded as deferral `958-agents-orchestrator-write-challenge-low-bkit-core-engine-commands-workflow-decisions-ts-664`.

## Identified Gaps Log

None
