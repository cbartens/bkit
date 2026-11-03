Verdict: PASS
Failures: 0
Lazy: 0

<!-- verdict:end -->

# Deferred Sweep

## Planned vs Delivered

Plan: `docs/plans/202611/825-show-progress-bar-plan.md` (5 of 5 tasks ticked). Verified on 2026-11-03 in `.worktrees/825-show-progress-bar` at `fae8ead2c`. `pnpm vitest run` on `step-table.test.ts`, `steps.test.ts`, `progress.integration.test.ts`, `counters.test.ts` and `.bkit/core/engine/render/hosts.test.ts` ran 5 files and 362 tests, and all passed.

<!-- prettier-ignore -->
| # | Intended deliverable (source) | Status | Evidence |
| --- | --- | --- | --- |
| 1 | Pure `runProgress` beside `WORKFLOW_STEPS` returning % and line (plan Task 1, § Engine step-table.ts) | Delivered | `.bkit/core/engine/commands/workflow/step-table.ts:232` `export function runProgress`; line format at `:259-262`; `dist/commands/workflow/step-table.js` contains it |
| 2 | Flat workflow: ship Step 10 of 14 is 71% with 7 filled cells (Acceptance Concrete Example; Derived Test Matrix row 1) | Delivered | `step-table.test.ts:61` `runProgress flat workflow`, passing |
| 3 | Build, 3 groups: Step 8 in group 2 is 50% with `Group 2 of 3`, sparse markers mapped to file order (Process Sketch; matrix row 2) | Delivered | `step-table.test.ts:68` `runProgress build groups`, passing |
| 4 | Build total grows when groups are added (Success Criteria; matrix row 3) | Delivered | `step-table.test.ts:79` `runProgress groups added`; `progress.integration.test.ts:228` `progress reads fresh plan groups`, both passing |
| 5 | Loop back lowers % and adds `Attempt {a} of {max}` / `Attempt {a}` (Success Criteria; matrix row 4) | Delivered | `step-table.test.ts:87` `runProgress loop back`, `:155` `runProgress attempt suffix`; `progress.integration.test.ts:283` `progress loop attempts and grants`, all passing |
| 6 | `Progress: ` prefix, 10-cell bar, no spaces, prefix <= 25 characters (matrix row 5) | Delivered | `step-table.test.ts:108` `runProgress bar width`, passing |
| 7 | All five tables, duplicate numbers, missing-plan fallback, nonfinal 99% clamp, final-only 100% (matrix row 7; Edge Cases) | Delivered | `step-table.test.ts:119` `runProgress all workflow numbers`, `:141` `runProgress missing plan fallback`, `:167` `runProgress final completion only`, all passing |
| 8 | `steps finish` and `steps done` print `progressLine` (Task 2 DONE WHEN; matrix row 6) | Delivered | `steps.ts` has 13 `progressLine` references; `steps.test.ts:269` `finish prints progressLine`, `:292` `done prints progressLine`, passing |
| 9 | Output metadata declares `progressLine` for every emitting verb (matrix row 11) | Delivered | `steps.test.ts:314` `progress output metadata`, passing; `steps.ts:1891` metadata entry |
| 10 | Optional validated `--progress-number` on `steps gate`; failed gates emit no line (Breaking Changes; Task 2) | Delivered | `steps.ts:451` usage error, `:1843` flag spec; `steps.test.ts:330` `gate progress number validation`, `progress.integration.test.ts:208` and `:498` `progress gate only completions`, passing |
| 11 | Resume reproduces the same line from saved rows; prior runs isolated; frozen limits (Success Criteria; matrix row 8) | Delivered | `progress.integration.test.ts:252` `progress resumes from saved run`, passing |
| 12 | Close, context finalise and dispatch wrappers forward the line once (Task 2) | Delivered | `progressLine` in `workflows.ts` (4), `context.ts` (2), `runs.ts` (5); `progress.integration.test.ts:384` `progress specialized completion producers`, passing |
| 13 | Pauses, test-red bookkeeping, refused writes and malformed inputs produce no line and no completion row or commit (Edge Cases; matrix rows 9-10) | Delivered | `progress.integration.test.ts:629` `progress excludes noncompletions`, passing |
| 14 | Challenge round 1 fix: debug cross-run attempts, saved soak counter, challenge round budget (Task 5) | Delivered | `progress.integration.test.ts:567`, `:589`, `:613`, passing |
| 15 | Narration clause in `.bkit/instructions.md` synced to all six workflow sources; ship Steps 3/9 and Step 1 gates numbered (Task 3) | Delivered | `progressLine` in `.bkit/instructions.md` and each of `bkit-{design,plan,build,debug,ship,auto}.md`; `bkit-ship.md:384` `--progress-number=3`, `:568` `--progress-number=9`; `--progress-number` in design/plan/build/debug; `tsx .bkit/core/engine/tools/instructions.ts` (check mode) exit 0 |
| 16 | Provider renders keep the rule (matrix row 12) | Delivered | `.bkit/core/engine/render/hosts.test.ts` passing; `.claude/commands/bkit-ship.md` carries `progressLine`; `node dist/cli.js check` exit 0 |
| 17 | Docs: `.bkit/core/.bkit/workflows.md`, `.bkit/core/.bkit/cli.md`, `docs/testing.md` § Key test files, `CHANGELOG.md` (Task 4; § Documentation Updates) | Delivered | `progressLine` in both `.bkit/core/.bkit/*.md` and their `.bkit/` mirrors; `docs/testing.md:677`, `:682-684` (below `bkit:end` at `:530`); `CHANGELOG.md:17`; `tsx .bkit/core/engine/tools/cli-doc.ts` (check mode) exit 0 |
| 18 | Phone verification procedure with explicit outcome carried to handover (Task 4; matrix row 13) | Delivered | `docs/plans/202611/logs/825-show-progress-bar/phone-verification.md` exists, `Outcome: not run`; the screenshot itself is listed under Exempt Deferrals |

## Blocking Deferrals

None.

`bkit branches scan-diff --disabled-tests --base=origin/dev` exited 0 with `found: false`, `disabled: []`.

## Exempt Deferrals

- `825-duration-weighted-progress`: leaves weighting steps by elapsed time uncovered. Declared in plan § Out of Scope and issue § Out of Scope, row written 2026-11-02 by `plan-generate`. `reason` `scope-declared`. `bkit ledgers triage` bucket `Exempt` (bounded-remediation holds, in-scope-surface fails, no-external-blocker holds, own-declaration fails); `written: false`.
- `825-live-status-bar-ui`: leaves a live status-line or app-UI bar uncovered. Declared in plan § Out of Scope and issue § Out of Scope, row written 2026-11-02 by `plan-generate`. `reason` `scope-declared`. `bkit ledgers triage` bucket `Exempt` (same test results); `written: false`.
- 375px Claude app screenshot (Success Criteria bullet 5; plan § Manual Verification): `phone-verification.md` records `Outcome: not run`. The plan marks it "Owner-run acceptance checks, advisory only. Unticked checks do not block merge", and Task 4 DONE WHEN says the criterion "remains unverified while the outcome is `not run`". The engine side (prefix <= 25 characters) is covered by `runProgress bar width`. Advisory, no ledger row.
- Plan process checkboxes left unticked: Gate 2, Mandatory Tasks, Gate 3, Verification Plan § Automated Tests and Gate 4 (plan lines 440-480). These are build-process and merge conditions, so they are advisory only. The checks they name were re-run here (tests, instructions and CLI drift checks, `bkit check`) and passed.

## Lazy Deferrals

None.

## Handover Notes

None.
