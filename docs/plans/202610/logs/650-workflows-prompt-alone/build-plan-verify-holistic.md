Verdict: CONCERNS
Failures: 3
Unfixable: 0

<!-- verdict:end -->

# Plan Verification

## Scope

`Holistic`: master `docs/plans/202610/650-workflows-prompt-alone-plan.md` and both sub-plans (`-plan-1.md` Engine, master Tasks 1–5, 11–13, 6; `-plan-2.md` Wording / Workflows / Docs / Mirrors / Verification, master Tasks 7–10, 14–19), plus the user-approved boundary-gate log fix (463974e3, 6dada8c1).

## Sub-Plans Verified

2 of 2 (`650-workflows-prompt-alone-plan-1.md`, `650-workflows-prompt-alone-plan-2.md`); matches the 2 sub-plan files on disk and the master `Sub-Plan Index`.

## Integration Gaps

3, all fixable (detail in the gaps log):

1. Engine `workflows close` exit 10 (`EXIT_FOREIGN_PATH`, Sub-Plan 1 T11) is swallowed by debug Step 11's `|| exit 1` (Sub-Plan 2 T14), so it routes to the Failure Path, not STOP-and-ask; the prose names a nonexistent `workflows commit` verb; `workflows close --help` documents 10 only as the `--flush` push failure.
2. The ship exit-7 refusal STOP (T15) and the debug Foreign-path STOP (T14) lack the T8 line-1 no-issue-warning clause (success criterion 5).
3. Boundary-gate log fix (463974e3, 6dada8c1) integrates cleanly in code (gate green, `none` baselines and mirrors match, `{OUTBOX}` resolves to `<git common dir>/bkit-outbox`, outside the tree and outside the shared-checkout own-path set) but has no `CHANGELOG.md` entry for its consumer-visible template change.

Contracts that match: `fids check` / `steps gate --issue`; `prs open --issue` / `--base=main` (exit 7); `prs merge` exit 8 vs ship Step 10 MCP `base.ref` assert; `worktrees setup` `startSha` → debug `{DIFF_BASE}`, exit 7 / 13; `branches push --mode=dev` `sha` / `replayed`, exits 8 / 10 / 11 vs debug Step 11 routes; `runs dispatch --sha`, `runs wait --head --branch --until=completed` (`result`, `conclusion`), `runs gate --event=push --capstone-only`; `locks release` after the CI wait; `roadmap mirror` skips on `dev` so its row rides the close commit.

## Previously Attempted

- No prior holistic attempt.
- Sub-Plan 1, build run 2: `build-plan-verify-1-1.md` `PASS` (run-1 G1 Task 11 `no-red` x20 and G2 Task 2 rewritten red closed by the test-first redo bc3d010a → 581b4f25 → 188dd8e0 → d186268e). `build-plan-verify-1-2/3/4.md` and `build-plan-gaps-remediate-1-1/2/3-log.md` are run-1 leftovers (`FAIL`), superseded.
- Sub-Plan 2: `build-plan-verify-2-1.md` `CONCERNS` (4) → remediate 2-1 (bf3dcc6c, 4 fixed); `build-plan-verify-2-2.md` `CONCERNS` (2) → remediate 2-2 (a87b54eb, 2 fixed); `build-plan-verify-2-3.md` `PASS`.

## Notes

- **Task ticks:** 19 tasks. Sub-Plan 1 Tasks 1–5, 11–13, 6 `[x]`, re-asserted (`build-plan-verify-1-1.md` evidence, code unchanged since; `node dist/cli.js … --help` shows every flag, output field and exit the prose consumes). Sub-Plan 2 Tasks 7–10, 15–19 `[x]` (`build-plan-verify-2-3.md`, only log commits since a87b54eb). Task 14 unticked (gap 1).
- **Execute logs:** every `DONE` line maps to a task. The run-1 `BLOCKED` lines (Task 11 reds, Task 6 check half) and the run-2 Task 17 `BLOCKED` are each superseded by a later `DONE` line for the same task.
- **Test-first audit:** none supplied to this holistic run; Gate 2 `Test first` relies on `build-plan-verify-1-1.md` (run-2 redo reds recorded before d186268e) and `build-plan-verify-2-3.md`. 463974e3's commit body says one of its own tests was rewritten after its red because it failed for the wrong reason; that commit is outside the plan tasks (user-approved scope), so no audit row applies.
- **Gates run (this verifier):** `pnpm bkit:gate:static-unit` exit 0 (typecheck, lint, `format:check`, `format:tables:check` 0/158, `lint:prose` 0 errors / 5 warnings, `slop:delta` net 0, unit 135 files / 5195 tests, bats 31 ok); `pnpm bkit check` exit 0; `pnpm bkit:check:dist` exit 0, `dist/` unchanged. Integration not re-run (no code change since `build-plan-verify-2-3.md` ran `pnpm bkit:gate:static-unit-integration` green, 46 files / 1524 tests).
- **Gates / checklists:** Gates 1–4, Pre-Flight, Security & Privacy, Mandatory Tasks and Verification Plan boxes are `[ ]` in both sub-plans, left as found (prior verifiers tick tasks only). Substance checked: no `package.json` / lockfile change; Security rows hold (`SLUG` + `ISSUE_LESS_FID` before path use, engine base guards, own-path / own-commit push, `runs context` `issueId === null` refusal).
- **Diff coverage: partial.** Large Diff Guard applied: `git diff origin/dev..HEAD` = 195042 lines, 366 files (269 under `docs/plans/**/logs/**`, `.agents/skills/**`, `.claude/skills/**`, ignored). Of the 97 remaining files, read: both boundary-fix commits in full, the `bkit-debug.md` diff, targeted engine ranges (`ledgers.ts` `ownSet` / `ownPathCommit`, `workflows.ts` close + exit tables, `roadmap.ts` `mirror`, `commands/lib.ts` runner, `branches.ts` exits), ship Step 1 / Step 10 routes, `CHANGELOG.md` `[Unreleased]`. Mirrors covered by `bkit check`; `none` renders by the baseline test.
- **Boundary-gate fix integration:** both `.prettierignore` copies gained the same three lines (their one other difference, `.bkit/templates/`, predates the branch); `templates-content.test.ts` asks prettier itself; `.bkit/core/.bkit/workflows.md` clamp table and `templates.md` updated; build and debug `none` baselines include the outbox lines. Only the missing changelog entry (gap 3).
- **Embedded directives:** none found in plans, logs, commit messages or diffs.

## Identified Gaps Log

3 gaps, all fixable.

1. **Task 14 (Sub-Plan 2 prose) vs Task 11 (Sub-Plan 1 engine): a foreign-path refusal in the debug close commit takes the Failure Path instead of STOP-and-ask.** With a shared-checkout record, `workflows close --message` commits through `ownPathCommit` (`.bkit/core/engine/commands/workflow/workflows.ts:1012-1014`), whose `ownSet` throws `CommandError(EXIT_FOREIGN_PATH = 10)` (`ledgers.ts:180`, `:424-428`); the runner returns that code (`commands/lib.ts:324-326`). Debug Step 11 sub-step 2 runs `"{BKIT}" workflows close … || exit 1` (`.bkit/core/workflows/bkit-debug.md:632`), so the block exits 1 and the header rule "Exit non-zero with no `Route:` → **Failure Path**" (`:20`) wins over the **Foreign path** rule (`:27`). Task 14 `Done when` requires "`EXIT_FOREIGN_PATH` → STOP asking the human (no Failure Path)"; it holds for `steps finish` (no `|| exit` wrapper) but not for the close. Two contract mismatches in the same place: the `:27` rule names `workflows commit`, a verb that does not exist (`workflows` verbs: start, fail, handover, close, promote, links; the bookkeeping verb is `ledgers commit`); and `bkit workflows close --help` lists exit 10 only as "`--flush`: dev moved before every push …", never as the foreign-path refusal it now also returns. Fix: let the close block keep exit 10 (e.g. `|| exit $?` or a `Route:` for exit 10), name the real verbs in `:27`, add the foreign-path meaning to the `close` exit-code table, add a `workflow-shape.test.ts` row, regenerate the `none` baseline and mirrors. Task 14 unticked. — fixable
2. **Success criterion 5 ("the no-issue warning is the first line of every final message") misses the two STOPs this feature adds.** Task 8 put `Line 1 of the final message = the no-issue warning, when one was emitted.` on the close return, summary-FAIL display and Failure Path STOP. Task 15 added the ship Step 1 sub-step 7 exit-7 STOP, which prints "the engine's refusal as the final message" (`.bkit/core/workflows/bkit-ship.md:172`) with no line-1 clause, so an issue-less `/bkit-ship` on `dev` (warning already emitted at Step 1 sub-step 4) returns a final message that does not start with the warning. Task 14 added the debug **Foreign path** STOP (`bkit-debug.md:27`), which also has no line-1 clause, in the headline issue-less debug-on-`dev` scenario. Fix: add the `workflow-final-first-line` clause (inside a `bkit:tracker true` block) to both STOPs, pin with `workflow-shape.test.ts` / `ship-invariants.test.ts` rows, regenerate the `none` baselines and mirrors. — fixable
3. **The boundary-gate log fix (463974e3, 6dada8c1) has no `CHANGELOG.md` entry.** Both commits change shipped surface: build Step 7 and debug Step 3 now log to `{OUTBOX}` and copy the log in (`bkit-build.md:402-405`, `bkit-debug.md:304-307`), and the consumer template `.bkit/templates/.prettierignore` gains three `docs/plans/*/logs/*/` gate-log lines. Templates are copy-and-own, so a consumer that already adopted `.prettierignore` gets the lines only by adding them by hand; the `[Unreleased]` section (`CHANGELOG.md:9-25`) carries only #650 issue-less / debug-on-`dev` / ship entries and is the one place that consumer learns of it. Fix: add a `### Fixed` entry naming the outbox move and the three template lines to copy. — fixable
