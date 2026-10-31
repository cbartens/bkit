Verdict: CONCERNS
Failures: 0
Coverage: partial diff coverage

<!-- verdict:end -->

# Build Challenge

Lens: Bugs and edge cases — null safety, off-by-one, error paths, data integrity.

## Findings Log

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** A run whose journal sees only ambient commands (gate scripts, hooks) and none of the workflow's own `"{BKIT}"` calls is still HOLEY after the TASK 22 fix, because the "before the first `engine-call` row" cut-off keys on any call: this run's own `status.jsonl` holds 102 build `engine-call` rows, all `disk prune` / `ci prose` / `ci slop` (zero `steps finish`), against 129 `step-done` rows, and `BKIT_ENGINE_JOURNAL=off node dist/cli.js completeness check --file=docs/plans/202610/logs/699-engine-run-completeness/status.jsonl` reports 41 evidence holes each lacking `steps finish`, so the close row TASK 22 set out to keep clean will still make the ship start warn (same pattern on a consumer that runs `bkit upgrade` on a feature branch: the worktree's scripts journal, the main checkout's `{BKIT}` does not)
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/checks/status-holes.ts:592`
  - **DONE WHEN:** a visit whose own row-writing call (`steps finish` / `steps done` / the call that wrote its `step-done` row) has no journaled `engine-call` in its owned gaps is judged steps-only (no evidence hole, no `unexercised`), the way pre-journal visits are today; a visit whose writer call is journaled but which lacks another required call is still an evidence hole; and this run's own `status.jsonl` reports no evidence hole for a visit with no journaled `steps finish`. (The `journalSuspect` heartbeat does not fire on this shape either: `callCount` is 102, so `preJournal` is false.)
  - **TEST FIRST:**
    - `.bkit/core/engine/checks/status-holes.test.ts` `a run whose journal saw only ambient calls reports no evidence hole for steps whose finish call was not journaled` fails on `build-worktree-setup`, `build-b` and `build-close-workflow` listed in `evidenceHoles` (probed) for rows `[call disk prune, step build-worktree-setup, call disk prune, step build-b, step build-close-workflow]` checked against the TASK 22 test's three-step contract

<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->

- [ ] **TASK 2:** The CI sweep (`pnpm bkit:audit:status` → `main()`) still folds every run of one workflow in a file into one report, so a closed run 2 that recorded only `build-close-workflow` after a full run 1 prints `missing: none` and `sweep: 1 file(s), 0 holey`, while `bkit completeness check` on the same file reports run 2 HOLEY with six step holes (reproduced on a scratch two-run file); the TASK 23 per-run split landed in the verb only, and the summary line counts holey workflows per file, not holey runs
      **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/checks/status-holes.ts:1032`
  - **DONE WHEN:** `main()` splits each file's rows per run (each `workflow-started` to the next of that workflow, as `runsOf` in `completeness.ts` does), calls `auditRun` once per run, and counts holey runs in the sweep-summary line (plan § Architecture & Component Changes, `checks/status-holes.ts`: "each run in each `status.jsonl` positional infers its workflow from that run's own rows ... one sweep-summary line counting holey runs"), so the sweep and the verb agree on which runs have step holes.
  - **TEST FIRST:**
    - `.bkit/core/engine/checks/status-holes.test.ts` `the sweep audits each run of one workflow in a file separately` fails on `sweep: 1 file(s), 0 holey` (and one `missing: none` report) for a file holding a full closed build run followed by a closed build run that recorded only `build-close-workflow`

<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->

- [ ] **TASK 3:** `bkit completeness check --file=<another repo's status.jsonl>` renders the contract for the tracker of the cwd's repo (`readIssueTracker(ctx.cwd)`), while the close and start paths use the repo holding the file (`contractOf(workflow, path.dirname(file))`), so the maintainer reading a tracker-`none` consumer's unclosed or failed run from bkit's own checkout (tracker `github`) gets evidence holes for calls that consumer never runs (probed: a run journaling every tracker-`none` call reads CLEAN under the `none` contract and HOLEY under the `github` one, lacking `issues related` on design / plan, `issues related` + `issues fetch` on debug, `issues labels` + `issues comment` on ship), and the verb and the stored close row can disagree on one run
      **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/completeness.ts:91`
  - **DONE WHEN:** the verb reads the tracker with `readIssueTracker(path.dirname(file))`, the same source `contractOf` uses, so the verdict for a file depends only on the repo that holds it, never on where the verb is run from.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/completeness.test.ts` `the contract follows the tracker of the repo holding --file, not the cwd` fails on a HOLEY verdict naming `issues related` when the cwd is a temp git repo with `bkit.tracker.default` = `github` and `--file` is a fully journaled tracker-`none` design run (no stored `completeness` row) in a second temp git repo with no tracker set

<!-- bkit:task 3 end -->

<!-- bkit:task 4 start -->

- [ ] **TASK 4:** A friction row another writer appends to `.bkit/friction.jsonl` while the seam raises `recurrenceCount` on a same-`key` row is lost: `appendFrictionRow` reads the whole file, rewrites the matching line, writes `friction.jsonl.<pid>.tmp` and renames it over the file, so any line appended between the read and the rename (a parallel subagent's `bkit ledgers append`, or a second failing command in a parallel build) is overwritten; the rewrite also edits an existing line, where `.bkit/jsonl.md` § Friction Is a Drained Queue says a consumer repo may only append and § Updating a Row says update by appending a same-`key` row
      **Severity:** LOW · **Class:** architectural · **Fixable:** false · **Location:** `.bkit/core/engine/ledgers/journal.ts:174`
  - **DONE WHEN:** no agent can settle it alone: the plan (Derived Test Matrix "A same-`key` recurrence raises `recurrenceCount` on the one existing row") and `.bkit/jsonl.md` § Categories `tool-failure` both require the in-place raise, which conflicts with the append-only doctrine for consumer repos. The owner decides between (a) recording a recurrence as an appended same-`key` row with a raised `recurrenceCount` (readers fold last-wins by `ts`), changing the plan row and the `tool-failure` doc line, or (b) keeping the in-place raise and accepting the lost-append window, recorded as a decision.
  - **TEST FIRST:**
    - `.bkit/core/engine/ledgers/journal.test.ts` `a friction row appended while a recurrence is rewritten survives` fails on the foreign row missing from `friction.jsonl` when a `node:fs` mock appends a different-`key` friction row to the real file at the moment the `.tmp` copy is written, before the rename

<!-- bkit:task 4 end -->
