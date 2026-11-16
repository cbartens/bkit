Verdict: CONCERNS
Affected: 7

<!-- verdict:end -->

# Plan Currency

## Affected Tasks

### TASK 2 — Write the shared shape with `decisions compose`

- **Class:** Reword
- **Landed change:** `1821a367f feat(891-build-gate-stuck): let a build pass tests already red on dev once the owner accepts them`. `.bkit/core/engine/commands/workflow/decisions.ts` gained `readBaseCheck`, the `--base-check` flag, and loop reasons and recommendations that depend on the base verdict (`loopRecommended = items.length > 0 ? "Decide" : "Stop"` when the verdict is `all`). It also gained `apply --by=rerun`, which writes `Decision: Re-run gate — …` under Q1. `.bkit/core/engine/commands/workflow/decisions.test.ts` gained `Try again is offered for every base verdict`, which asserts the old layout: `/\*\*Q1 — Verify:\*\*[^\n]*\nOptions: A\) Try again \/ B\) (Decide|Stop)/`. Also, `bkit-build.md:174` (the headless hard-blocker Failure Path line cited in the `itemLines` UPDATE) is now `.bkit/core/workflows/bkit-build.md:189`.
- **Re-run must resolve:** Add `Try again is offered for every base verdict` to the Task 2 UPDATE list of `decisions.test.ts` tests that change to the per-line layout, and check the other new `base check …` tests that match `Recommended: B) …` lines. State that `compose --loop` gives the `--base-check` path's `Stop` recommendation (verdict `all`, no items) the same fixed `Stop` effect. Repoint `bkit-build.md:174` to `:189`. A6 says this build must resolve the #891 overlap in `decisions.ts`; that overlap has now landed and is concrete.

### TASK 1 — Read one option per line and `Recommended: none` in `parseDecisionItems`

- **Class:** Reword
- **Landed change:** `1821a367f feat(891-build-gate-stuck)`. `DecisionItem` gained `fixTask` (read from a new `Fix task: {N}` item line), and the `decisions.ts` file header comment gained the `Fix task:` line. `.bkit/core/engine/commands/workflow/summary.ts` added the `decisionHeader` import and a second `parseDecisionItems` reader (`:379`, which reads `decision` and `fixTask` for `Fix now` credit). The lettered-`Decision:` read that the READ cites as `summary.ts:302-306` is now `summary.ts:513-517`.
- **Re-run must resolve:** Repoint the `buildSummary` READ from `:302-306` to `:513-517`, and add the new `:379` reader to the list of consumers that must keep working. Make the header-comment UPDATE keep the `Fix task:` line. Make the per-line parser leave `Fix task:` lines out of the options. Read `DecisionItem has the same fields as before` in DONE WHEN as including `fixTask`.

### TASK 6 — Debug Loop Question, branch check, CI-run lookup and foreign-path stop

- **Class:** Reword
- **Landed change:** `d57f0710f fix(912-debug-loop-question): stop the debug loop question claiming no progress when failure counts are unknown`. Every `**Q1 — …**` line in `.bkit/core/workflows/bkit-debug.md` § Loop Question (`:140-143`) now carries `{LOOP_TREND_LINE}` in place of the fixed `The last … attempt left no fewer failures` text. Separately, the header blocks added by `7ae1a3e8b feat(860-move-deterministic-bookkeeping)` shifted the cited debug lines by +6: `:48` -> `:54` (Foreign path), `:131-147` -> `:137-153`, `:200` / `:201-214` -> `:206` / `:207-220`, and `:342` -> `:348` (the exit 8 / 82 lock release). Engine anchors moved too: `locks.ts` `release` `:477-479` -> `:464-466` (`EXIT_NOT_OWNER`), and `runs.ts` `:2523` -> `:3208` and `branches.ts` `:3200` -> `:3437` (cited by A7, which this task depends on).
- **Re-run must resolve:** Repoint every `bkit-debug.md`, `locks.ts`, `runs.ts` and `branches.ts` line reference listed above. Word the Loop Question step 3 UPDATE against the `{LOOP_TREND_LINE}` question text. Make the fixed reason `Recommended: A) Stop — the last attempt left no fewer failures` agree with the engine trend line, so that it does not bring back the no-progress claim #912 removed.

### TASK 5 — Build Decision Pause (#5) in the shared shape

- **Class:** Reword
- **Landed change:** `1821a367f feat(891-build-gate-stuck)` and `60e5a66f0 fix(903-build-owner-s)`. In `.bkit/core/workflows/bkit-build.md`, the `hardBlockers` subset line cited as `:175` is now `:190`, and step 4 is now `:193-196`. Step 4 gained the bullet `Offer only the file's options for each question; NEVER add an Accept or any other option the file does not list.` and a route for a hard blocker answered `Fix now` with no direction. Step 2 gained `{BASE_FLAGS}`, and steps 5-6 gained the `Fix task: {N}` line. In `.bkit/core/.bkit/workflows.md`, the § Hard blockers line cited as `:989` is now `:996`, and it gained the sentence ``Fix now` on one needs the owner's direction: with none, the pause asks what the fix should do and builds no task.``
- **Re-run must resolve:** Repoint `:175` to `:190` and `:989` to `:996`. Make the step 4 rewrite keep the new "offer only the file's options" bullet and the no-direction `Fix now` route. Make the Hard blockers edit replace only `No recommendation; "yes" never answers one.` and keep the new `Fix now` sentence.

### TASK 4 — Reply-line wording and widened plain-English rule into their clauses

- **Class:** Reword
- **Landed change:** These carrier lines moved, with their text unchanged: `bkit-debug.md:139` -> `:145`, `bkit-ship.md:696` -> `:823` (`b46431c0d fix(911-ship-failed-merge)` restructured the Merge Question and dropped ship Step 11), `bkit-build.md:180` -> `:196`, `bkit-plan.md:510` -> `:538`, and `bkit-design.md:273` -> `:279`. Separately, `bcd1b8fc3 fix(934-instructions-sync-refresh): make instructions:sync rewrite a copied line when its source line is reworded` changed `pnpm instructions:sync`. It now refreshes a § Local Instructions copy that was reworded in place. It still reports deleted lines and new lines, which need a hand edit.
- **Re-run must resolve:** Repoint the five carrier line references. Reword the § Local Instructions hand-edit UPDATEs, and the runbook preamble that says `pnpm instructions:sync` does not drop stale entries: sync now refreshes reworded copies, so a hand edit is needed only for what sync still reports. The clause texts of `workflow-yes-takes-all`, `workflow-stop-writes-handover` and `workflow-question-plain` are unchanged on `origin/dev`, so the clause plan holds.

### TASK 8 — Design grill, draft scenario and the one-by-one pass

- **Class:** Reword
- **Landed change:** The header blocks added by `7ae1a3e8b feat(860-move-deterministic-bookkeeping)` shifted the cited lines in `.bkit/core/workflows/bkit-design.md` by +6: `GRILL_TURNS` `:252` / `:286` / `:300` -> `:258` / `:292` / `:306`, and the single `workflow-question-plain` copy `:273` -> `:279`. The grill and draft question text is unchanged.
- **Re-run must resolve:** Repoint the `GRILL_TURNS` and grill line references.

### TASK 10 — Plan and design open questions one option per line

- **Class:** Reword
- **Landed change:** The § Local Instructions `Audit templates` entry for the `bkit-audit-models.md` `Proposal` line, cited as `.bkit/instructions.md:14016`, is now `:14334` after entries landed on `dev`, such as those from `ca043dd57 docs(887-review-doc-starters)`. The `bkit-plan.md` template gained the `Documentation Consultation` and `Documentation Warnings` sections (#887), and its `Open Questions & Assumptions` placeholder is unchanged.
- **Re-run must resolve:** Repoint `:14016` to `:14334`.
