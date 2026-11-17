Verdict: PASS
Failures: 0
Fixable: false
Tasks: 3, 4
Loosened: none
Fingerprint: 36df12531325abffdf771b61ae109ab853b3f1b579515fdf0fd8ccef97737de2
<!-- verdict:end -->

# Plan Verification

## Scope

Group 2

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

None

## Notes

Group 2 (TASK 3, TASK 4) verified against `build-diff-2-1.md`, all of it committed in `afa88e5bc`.

- TASK 3: `failVerb` in `.bkit/core/engine/commands/workflow/workflows.ts` validates `--next-step` before `failState` (empty = absent; a line break or no `/bkit-` prefix = `EXIT.USAGE` with "--next-step must be one /bkit-* command line"), passes `Next step: \`{value}\`` through `CommentInput.lines`, and prints `nextStep`. The `fail` spec declares `next-step` and documents `nextStep`. `.bkit/core/.bkit/cli.md` and `.bkit/cli.md` name `--next-step`; `pnpm cli:sync` left them unchanged. `dist/commands/workflow/workflows.js` carries the same change. `pnpm bkit:graph:check` exits 0 ("docs/capabilities.md matches a rebuild at afa88e5bc"), so the plan-tasks log's note about the unstaged graph refresh is settled by the commit.
- TASK 4: `.bkit/core/workflows/bkit-ship.md` holds `/bkit-debug {FID}` as `NEXT_STEP` on the Step 2 sub-step 5 failed-check arms (CLI exit 1 with `CHECKS_FAILED` > 0, and the exit-80 MCP arm), on the Step 10 exit-12 arms (new non-regenerable arm; regenerate `Else` on `unchanged` / `undeclared`; the used-up regenerable arm with `MERGE_ASK` true and false), and on the Step 12 sub-step 1 `Route:` exit 12. The Merge Question's `Try again` clears `NEXT_STEP`; `Stop` writes it into the handover and the final message. Failure Path step 1 passes `--next-step`, drops it when not held, and retries without it on exit 2; step 6 puts `Next step:` after any verbatim summary. The `prs checks` output does carry `failed` (`ChecksOut` in `prs.ts`), so `CHECKS_FAILED` reads a real field. `.bkit/instructions.md` and `bkit-ship.none.txt` were regenerated. The Claude, Cursor, OpenCode and `.agents` skill mirrors carry the change, and `node dist/cli.js check` reports no drift.
- Tests run by this verifier: `pnpm vitest run` on `workflows.test.ts`, `ship-invariants.test.ts`, `workflow-shape.test.ts`, `trackers.test.ts`, `instructions-coverage.test.ts`: 5 files, 627 tests passed.
- Test-first audit (`build-tests-green-2-1.md`): Enforced true, Verdict PASS, Gaps 0, Unproven 0. The tests-red report shows all 9 tests red before the code and Updated 0, so there is no updated or loosened test to judge.
- Derived Test Matrix rows for Tasks 3 and 4 each map to a test named in that task's `DONE WHEN` / `TEST FIRST`. The `trackers.test.ts` baseline row is covered by Task 4's `DONE WHEN`.
- Documentation Updates rows owned by this group are done: `.bkit/core/.bkit/cli.md`, `docs/capabilities.md`, and the `bkit-ship.md` `- source:` block in `.bkit/instructions.md`. The `failure-path` local entry for `.bkit/core/.bkit/workflows.md` and the workflows.md signature belong to Task 5 (group 3).
- `build-plan-current.md` (Verdict CONCERNS) affects TASK 5 only (group 3); it does not touch this group.
- No decision records (`build-decision-*.md`) and no earlier verify or remediate reports exist for group 2.
- The removal of the shared clauses `workflow-try-again-return` and `workflow-round-read-back` (commit b2b7b0ab5) was owner-approved, so it is not a gap.
- Observation, not a gap: Step 2 sub-step 5's last arm now reads `**Else** (the rollup is unreadable) → **Failure Path**`. That arm also catches exit 1 with `CHECKS_FAILED` = 0 (pending or no checks), so the parenthetical is narrower than the arm. Routing is still correct, because the arm sends every case to the Failure Path without `NEXT_STEP`. No `DONE WHEN` covers this wording.

## Identified Gaps Log

None
