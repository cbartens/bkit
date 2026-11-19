Verdict: CONCERNS
Failures: 2
Fixable: true
Tasks: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 15, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44
Loosened: none
Fingerprint: 1b07d8cfa206770dfeaf184eb6947f49d7c010b71c8e65647610a196623841ad
<!-- verdict:end -->

# Plan Verification

## Scope

Holistic

## Groups Verified

12 of 12 (the plan has 12 groups, Tasks 1 to 44).

## Integration Gaps

0.

Checked and working together:

- The previous integration gap is closed: the `decisionProblem` comment at `.bkit/core/engine/commands/workflow/tasks.ts:160` and `dist/commands/workflow/tasks.js:126` now names the `decision-counts` row that `decisionFileHeader` reads (`5562d4190`).
- No `engine file` or `-engine.md` wording remains in `.bkit/core/**/*.md`, in `.bkit/instructions.md` outside `retired` blocks, or in non-test engine code under `.bkit/core/engine/commands/workflow/`.
- The engine verbs, the two row types, the single fold, old-layout reading, the resume route and the fixer calls are unchanged since `build-plan-verify-holistic-2-1.md` checked them; the fix round `5562d4190` changed only one comment in `tasks.ts` / `tasks.js`, the Failure Path line of five workflows, the clause's carrier list, render baselines and mirrors.

## Previously Attempted

- `build-plan-verify-holistic-1-1.md`, `-1-2.md` and `-1-3.md` (run 1): `PASS` over groups 1-4, 1-6 and 1-7.
- `build-plan-verify-holistic-2-1.md` (run 2, attempt 1): `CONCERNS`, 2 gaps, fixed in `c1772eefd`.
- `build-plan-verify-holistic-2-2.md` (run 2, attempt 2): `CONCERNS`, 2 gaps: the Task 14 carrier lines lost ship's `--pr` rule and the `;` separators, and the `tasks.ts` comment. `build-plan-gaps-remediate-holistic-2-2-log.md` reports both fixed in `5562d4190`.
- This is attempt 3 of run 2's holistic verify.

## Notes

- Partial diff coverage: `tmp/bkit-diff-958-agents-orchestrator-write.md` shows the 20 largest of 265 files. The cross-group check read the codebase, `git show 5562d4190` and `git show 2fa879a63:.bkit/core/workflows/bkit-ship.md`.
- Previous gap 1 (Task 14): the `;` separators are back on the plan, design, build and debug lines, and ship again drops `--pr` when `{PR_NUMBER}` is empty. To stay under the ceiling the fixer took ship off the clause's carriers and deleted ship's "`--error-file` dropped while not held", which opens new gap 1. Task 14 stays off the `Tasks` line.
- Previous gap 2 (`tasks.ts` comment): closed.
- Task 16 drops off the `Tasks` line: `bkit check` passed in attempt 2 and now reports drift, because `5562d4190` changed the mirrors without re-recording `.bkit/version` (new gap 2).
- Tasks 1 to 13, 15 and 17 to 44 are satisfied. Every task is `[x]` in the plan; the workflow, not this verifier, settles the ticks.
- Tests run: 22 files, 1813 passed, 0 failed (`pnpm exec vitest run -c vitest.unit.config.ts`, naming each file): `steps`, `challenge`, `audit-report`, `issues`, `ledgers`, `decisions`, `open-decision`, `status` (both), `workflows`, `tasks`, `context`, `summary`, `verdict-vocabulary`, `workflow-shape`, `template-shape`, `branding`, `trackers`, `cli-doc`, `instructions`, `instructions-coverage`, `instructions-sources`. `pnpm exec tsx .bkit/core/engine/tools/instructions.ts` exits 0. `pnpm bkit:text:ceiling check` prints `ok — prompts 83837, workflows 57977`; the ceiling file holds those totals, both lowered from 86494 and 58535 with no `raise`.
- DONE WHEN greps re-run on the current tree print what their tasks ask for: Tasks 3, 5, 6, 7, 8 (only the `refuses --result-file` test hits), 15, 16 (both forms), 30, 36 and 37.
- Not run, because this verifier does not build or run `bkit:gate:*` scripts: `pnpm build`, `pnpm cli:sync` and Task 16's `pnpm bkit:gate:static-unit-integration`. The fix round's log records `bkit tests changed` exit 0.
- Decision records (all in the old layout, read as written):
  - `build-decision-2-2.md` Q1 accepts Task 32's red confirmation test, which Task 44 takes over; that test passes. Q2 (`applyRecommendations` returns text) and Q3 (`apply --by=rerun` records `Re-run gate`) are also accepted. All three are `Accept (assumed)`: assumed, not the owner's acceptance.
  - `build-decision-1-2.md` (Task 18 `Fix now`) is assumed, not the owner's own words; Task 29's last-row-wins rule keeps that direction.
  - `build-decision-1-1.md`, `-2-1.md` and `-2-3.md` record loop answers and accept no gap.
- No test-first audit report was supplied for this round, so step 8 has nothing to decide.
- Derived Test Matrix: every row names a test in its task's `TEST FIRST` or `DONE WHEN`, and the files holding them pass.
- Documentation Updates: every row is done, as `build-plan-verify-holistic-2-1.md` recorded; neither fix round changed those docs. `docs/testing.md` and `docs/observability.md` are present, and the new refusals use the existing `problem` / `CommandError` output.
- `.agents/docs.md` lists `docs/capabilities.md`, `docs/architecture.md`, `docs/security.md`, `docs/data-schema.md`, `docs/testing.md` and `docs/observability.md` for Build; none is missing or a starter.

## Identified Gaps Log

2 gaps.

TASK 14: the holistic fix round (`5562d4190`) took `bkit-ship.md` off the `workflow-error-file` clause's carriers (`.bkit/instructions.md:5717`) and rewrote ship's Failure Path step 1 (`.bkit/core/workflows/bkit-ship.md:95`) without the rule to drop `--error-file` while its folder is not held, which Task 14 requires ("drops `--error-file` while the folder is not held"); ship's Step 1 routes to the Failure Path (`bkit-ship.md:158`, `:179`, `:181`) before `:200` holds `WORKTREE_PATH`, so the command at `:97` then passes `--error-file="/docs/plans/{YYYYMM}/logs/{FID}/ship-error.md"`, and `workflows fail` exits 2 on a missing error file (`readText`, `.bkit/core/engine/commands/workflow/workflows.ts:544-547`) before it posts the failure comment; the line also still defines `{STDERR_FILE}` as `{LOG_DIR}/{workflow}-stderr.md`, a folder ship never holds, with no rule to drop `--stderr-file` while `WORKTREE_PATH` is not held; restore both drop rules for ship in sources, rendered copies and the ship render baseline, keeping the `;` separators and the `--pr` rule, without raising a ceiling (workflows total is 57977, at its ceiling) — Fixable: true
TASK 16: `pnpm tsx .bkit/core/engine/cli.ts check` exits 1 with "1 write(s) would occur — DRIFT DETECTED", where Task 16's DONE WHEN needs `bkit check` to exit 0; the fix round (`5562d4190`) edited the 15 host-rendered workflow copies (`.claude/commands/`, `.cursor/commands/`, `.opencode/commands/` `bkit-{build,debug,design,plan,ship}.md`) but not `.bkit/version`, so the check would re-record those 15 stale entries; the copies' text matches the sources (ship line 95 is identical), so only the recorded entries are stale; run `pnpm tsx .bkit/core/engine/cli.ts upgrade` and land `.bkit/version` — Fixable: true

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** Ship Failure Path lost the rule to drop --error-file and --stderr-file while WORKTREE_PATH is not held
  **Severity:** MEDIUM · **Class:** incomplete · **Fixable:** true · **Location:** `.bkit/core/workflows/bkit-ship.md:95` · **Round:** 1
  - **DONE WHEN:** TASK 14 UPDATE: bkit-ship.md Failure Path step 1 again says to drop --error-file and --stderr-file while {WORKTREE_PATH} is not held, keeping the ; separators and the --pr rule, in the source, rendered copies and the ship render baseline, with no ceiling raised
  - **TEST FIRST:**
<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->
- [ ] **TASK 2:** bkit check reports drift: .bkit/version not re-recorded after the fix round edited the 15 rendered workflow copies
  **Severity:** LOW · **Class:** incomplete · **Fixable:** true · **Location:** `.bkit/version:1` · **Round:** 1
  - **DONE WHEN:** TASK 16: pnpm tsx .bkit/core/engine/cli.ts upgrade re-records .bkit/version and pnpm tsx .bkit/core/engine/cli.ts check exits 0
  - **TEST FIRST:**
<!-- bkit:task 2 end -->
