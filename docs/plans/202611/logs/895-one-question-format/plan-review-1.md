Verdict: CONCERNS
Failures: 4
Redesign: false

<!-- verdict:end -->

# Plan Review

Lens: Tightness — task dependency order, design-coverage.

Source: no design artifact exists (`docs/plans/202611/` holds no `895-*` design), so the issue (#895 description plus the 2026-11-09 comment) is the source. The design-coverage checks (Process steps 5 and 11) do not apply; expansion and drift were checked against the issue.

## CRITICAL

- **C1 — Two existing reply-line clauses have no task (plan edit).** `.bkit/instructions.md` § Clauses already holds `workflow-yes-takes-all` (`"yes" takes every recommendation.`, carriers `bkit-build`, `bkit-debug`, `bkit-ship`, lines 5622-5629) and `workflow-stop-writes-handover` (`"stop" writes a handover; the run can be resumed.`, carriers `bkit-debug`, `bkit-ship`, lines 5631-5638). The `Reuse Inventory` row "Shared reply line across workflows" says the old reply line "is a local entry in `bkit-debug`, with no clause", which is wrong, and no task rewords or retires either clause.
  - Tasks 4, 5 and 6 replace the carrier lines (`bkit-build.md:180`, `bkit-debug.md:139`, `bkit-ship.md:696`) with `or "yes" to take every recommendation.` and `"stop" ends here with a handover; the run can be resumed.`. That leaves both clauses with fewer carriers than `SHARED_MIN.workflow` = 2 (`.bkit/core/engine/tools/instructions.ts:90-95`). The new stop sentence is also close enough to the old clause text to be reported as a near-copy (`NEAR_COPY` = 0.8, `instructions.ts:88`, `:815-821`).
  - Effect: `instructions.test.ts` fails `has no findings` and `every clause reaches the cut-off of one surface it applies to` (`docs/knowledge.jsonl` `instructions-store-clause-text-and-local-entries-need-hand-edits`). Tasks 4, 5 and 6 each have the DONE WHEN `pnpm vitest run .bkit/core/engine/tools/ … passes`, so none of them can be closed, and no later task produces the fix.
  - Fix: one task that runs before the first carrier edit (Task 4) rewords `workflow-yes-takes-all` and `workflow-stop-writes-handover` to the new wording, moving the old text to `retired`, or retires them into `workflow-question-reply-line`. It runs the no-flag `instructions.ts` check and then `pnpm instructions:sync`, so all carriers change together. Tasks 4-7 then `DEPENDS ON` it. Correct the `Reuse Inventory` row to EXTEND those two clauses.
- **C2 — The `workflow-question-reply-line` clause is created after the tasks that use it (plan edit).** Task 7 creates the clause (carriers `bkit-debug`, `bkit-ship`, `bkit-design`), but Task 5 writes its sentence into `bkit-debug.md` and Task 6 into `bkit-ship.md` first.
  - Once Task 6 lands, two workflow files carry the same sentence with no clause behind it. `unlistedShared` reports that (`instructions.ts:917-941`, cut-off 2), so Task 6's DONE WHEN (`pnpm vitest run .bkit/core/engine/tools/` passes) cannot be met inside Task 6.
  - It also contradicts the runbook preamble ("For a clause change, edit the clause entry first") and the issue comment ("Add the instructions entry first, and run the check before `instructions:sync --write`").
  - Task 7 `DEPENDS ON 3, 5, 6` only because of this inversion.
  - Fix: create the clause in the same earlier task as C1, or in the first carrier task. Make Tasks 5, 6 and 7 depend on it and let `instructions:sync` place it.
- **C3 — Task 8's end check scans lines that no task edits (plan edit).** The Task 8 test `no workflow, prompt, template or authoring doc carries an inline Options: list` scans `.bkit/core/.bkit` and `.bkit/core/docs/templates` (`question-option-format.test.ts:28-33`). These inline lists are left in place:
  - `.bkit/core/.bkit/prompts.md` rows 309 (`bkit-design-generate`), 321 (`bkit-plan-generate`), 324 (`bkit-plan-scope-check`) and 325 (`bkit-plan-update`). Each carries `` the lettered `Options: A) …` `` (or `` `Options: A) {option} — {trade-off} · B) …` ``). Task 8 changes all four prompts (two by hand, two by `instructions:sync`), yet its `.bkit/core/.bkit/prompts.md` UPDATE names only rows 311 and 313. `.agents/rules.md` § Index updates requires these rows to change in the same change.
  - `.bkit/core/docs/templates/bkit-audit-models.md:119`: `` `Options: A) … / B) …` `` on the audit template's `Proposal` question. No task, `Out of Scope` row or test exclusion covers it.
  - Fix: add rows 309, 321, 324 and 325 to Task 8's `prompts.md` UPDATE. For `bkit-audit-models.md:119`, choose one:
    - Recommended: add it to Task 8. It is one line, and it is needed for the end state the plan chose.
    - Or: exclude the file from the end check, with an `Exempt` `Out of Scope` row and a deferral row.
- **C4 — The `.bkit/workflows.md` index is updated before the workflow edits it describes (plan edit).** `Documentation Updates` gives the workflow-index entry to Task 3 (Group 2): "the workflow index entry moves with the workflow edits (`.agents/rules.md` § Index updates) (Task 3)". The behaviour the index has to describe only lands in Tasks 4-7 (Group 3), and no later task touches `.bkit/core/.bkit/workflows.md`.
  - `.bkit/core/.bkit/workflows.md:244` (the `Foreign path` contract row: "**STOP** and ask the human to commit or revert it") goes stale with Task 5's `**Action needed — Foreign path:**` line.
  - `.bkit/core/.bkit/workflows.md:989` (hard blockers: "No recommendation; "yes" never answers one.") goes stale with Tasks 2 and 4's `Recommended: none`.
  - Task 9's grep (`No recommendation —`) does not catch `:989`, because there the words are followed by `;`.
  - Fix: each of Tasks 4-7 updates the `.bkit/core/.bkit/workflows.md` lines that describe its own question points (Task 4: `:989`; Task 5: `:244` plus any debug Step 1 / Step 2 stop descriptions). Point the `Documentation Updates` row at those tasks.

## OPTIONAL

- **Declared edges are incomplete.** Task 8's end check depends on every workflow edit, including Task 4's `bkit-build.md` Decision Pause, but `DEPENDS ON` lists only `3, 7`; Task 4 is reached only through group order. Add `4, 5, 6`. Task 3 `DEPENDS ON 2`, but it uses nothing Task 2 produces (the authoring examples are text), so either drop the edge or say why it is there.
- **Q2 leaves out a third point-true "stop" sentence.** Task 5 and `Architecture` give the debug Step 1 branch question the second sentence `"stop" ends here; nothing has changed yet, so the run can be started again.`, and the option `Stop — nothing changes; the run can be started again`. The issue's own example for #7 is `B) Stop — handover; the run can be resumed`. Q2's options name only the grill and #10. List the debug Step 1 variant in Q2 so the owner confirms it.
- **A3 understates the risk window for bkit's own parallel runs.** `{BKIT}` resolves to the main checkout's `node_modules/.bin/bkit` (`.bkit/cli.md` § Invocation), and bkit links itself as a dev dependency. Once this change merges to `dev` and the main checkout's `dist/` is rebuilt, any `/bkit-build` still running in a sibling worktree uses its own branch's `bkit-build.md` (bare-string `options`) with the new `compose`, so its next Decision Pause exits 2 and goes to the Failure Path. Name this in A3 and in the `Rollback Strategy` risk window ("rebase in-flight branches before their next Decision Pause").
- **The #8 exit 82 route may have no candidates to offer.** `runs locate` exit 82 reports unavailable evidence or a branch conflict, and may print no candidate references. Say what the question shows then (only `Use local discovery` and `Stop`), and add an `Edge Cases` row.
- **Task 9's final grep is narrower than the end state.** It checks only `Reply per question` and `No recommendation —`. Adding `No recommendation` without the dash, and `Options: A)` across `.claude/commands`, would catch drift in the mirrors that the source-only audit test cannot see.

## OUT OF SCOPE

- Step 1's issue-and-branch stops (`fids parse` exit 8 / 9, the exit 3 rename) in all five workflows. The plan already parks these as `895-start-step-issue-and-branch-stops-question-shape` (`needs-decision`); they are not rows of the #895 audit.
- Any change to the `Proposal` question convention across the `bkit-audit-*` templates beyond the one line C3 names. If the owner chooses to exclude `bkit-audit-models.md` rather than edit it, the wider audit-template question format belongs in its own issue.

## SUGGESTED SCOPE EXPANSION

- `703-standardise-question-option-challenge-low-bkit-core-engine-audits-workflows-question-option-format-test-ts-50` — source `related-deferrals.md` (LOW, open); overlap: Tasks 3 and 8 rewrite the same `optionLists` scanner, and C3's fix removes the last inline lists. Recommendation: close at ship once Task 8 lands, as the plan already proposes.
- `442-design-ideate-lens-predicates` — source `related-deferrals.md` (LOW, `needs-decision`, open); overlap: `.bkit/core/workflows/bkit-design.md` Step 3, which Task 7 edits for the grill. Recommendation: keep separate; it changes which subagents run, not the question layout.
- `895-start-step-issue-and-branch-stops-question-shape` — source `related-deferrals.md` (MEDIUM, `needs-decision`, open); overlap: the Step 1 routes of the five workflow sources Tasks 4-7 edit. Recommendation: the owner picks A, B or C. If A or B, it joins this plan only through the owner's decision, since the #895 audit does not list it.
- #55 (closed, `related-issues.md`) and failure `699-design-close-decision-rows-refused-by-writer-table` (closed, `related-failures.md`) — no overlap with the plan's surfaces. Recommendation: none.
