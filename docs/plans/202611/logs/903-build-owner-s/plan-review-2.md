Verdict: CONCERNS
Failures: 2
Redesign: false

<!-- verdict:end -->

# Plan Review

Lens: Regression risk — touched surfaces, backwards compatibility, design-coverage.

## Surface-Area Map

- **Task 1 (Part 4):**
  - Edits: `RESOLVED_BY` (`.bkit/core/engine/commands/workflow/summary.ts:66-72`, module-private, no other importer) and the `answer` lookup in `buildSummary` (`summary.ts:250-268`); `summary.test.ts` `describe("buildSummary")`.
  - Consumers: `bkit workflows summary` (`workflows.ts:1747`), which feeds build Step 15 and debug Step 10 routing (`SUMMARY_VERDICT` FAIL → Failure Path) and the summary comment.
  - Rows read: `step-done` `build-failure-remediate` / `debug-failure-remediate` (`attempt` from `--attempt-of=*-run-tests:current`, `bkit-build.md:1096`, `bkit-debug.md:587`) and `*-run-tests` rows with `scope` / `attempt` / `failures` (`bkit-build.md:1015`, `bkit-debug.md:387`). `input.rows` also holds `test-run` rows with the same `step` and `attempt` (`tests.ts:1907`), and a CI-sourced debug round records `scope: ci:{runId}` (`tests.ts:1765`, `:1801-1813`).
- **Task 2 (Part 2 parser):**
  - Edits: `DecisionItem` / `parseDecisionItems` (`decisions.ts:29-43`, `:85-113`); new export `decisionHeader`; file-header comment.
  - Consumers of `parseDecisionItems`: `summary.ts:303`, `:320`; `summary-findings.ts:151`; `challenge.ts` (`acceptedLocations`); `applyRecommendations` / `statusOf` / `apply` / `pending` inside `decisions.ts`. No consumer builds a `DecisionItem` literal, and `decisions.test.ts` asserts fields, never whole objects, so the new field breaks nothing.
  - File format: decision files from `decisions compose` (`decisions.ts:361-445`): header block, blank line, then with `--loop` a progress block and the loop question as Q1 (`:413-431`).
- **Task 3 (Part 2 summary rule):**
  - Edits: `buildSummary` per-group loop (`summary.ts:223-296`); reads `taskVerified` (`summary-findings.ts:21-57`).
  - Tests: `summary.test.ts`; `workflows.test.ts` `describe("bkit workflows summary")` (`:3043`, the `planOf` helper builds only GROUP 1, `:3067`).
  - Guards it must keep: `summary.test.ts:239` (remediation CONCERNS kept after verify PASS), `:426` (Accept-only pause, bare `build-decision` row), `:459`, `:717`.
- **Task 4 (Part 1 workflow text):**
  - Edits: `.bkit/core/workflows/bkit-build.md` § Decision Pause steps 4-6 (`:177-273`), Contract **Owner decisions** (`:44`), § Gate — Decision Pause (`:300-309`).
  - Generated copies: `.bkit/core/engine/render/__snapshots__/bkit-build.none.txt`, `.bkit/instructions.md` (`:9813`, `:9830`, `:9835` are local sentences, not shared clauses), host mirrors.
  - Downstream readers of the rewritten task block: `context brief` (`context.ts:1199`, `:1238-1248`, `:1593`), `tests red` / `tests green`, `tests plan-check`, Step 8 verify, `challengeResolution` (meta-line match on Location / Severity / Round, `summary-findings.ts:138-148`), `challenge merge` reopen-by-location (`challenge.ts:662-670`) on resume (`bkit-build.md:43`).
- **Task 5 (docs):** `.bkit/core/.bkit/workflows.md` § Summary / handover step Resolution evidence table (`:513-523`) and § Decision Pause bullets (`:982-1018`); `docs/testing.md` § Counter derivation test coverage (`:645`).
- **Task 6 (generated):** `dist/`, `.bkit/workflows.md`, `.bkit/instructions.md`, `docs/capabilities.md` via `pnpm bkit:generate` (`package.json:67`).
- **No schema, endpoint, event or queue topic** is touched; bkit has no database.
- **High-risk surfaces flagged:** `buildSummary` (shared verdict engine for all five workflows, gates PR creation); `parseDecisionItems` / `DecisionItem` (public type export, four consumers); the Decision Pause contract (shared by session and headless runs, and by resume).

## CRITICAL

1. **(plan edit) Fake data: the Part 2 fixtures leave out the loop question that a round-limit verify pause always has.**
   - The Concrete Example ("Group 9's verify fails at its round limit … Owner answers Q1 `Accept` and Q2 `Fix now`") and Task 3's `DONE WHEN` fixture ("Q1 `Accept`, Q2 `Fix now`, `Fix task: 42`") describe a decision file that `decisions compose` never writes for that pause.
   - At the round limit `PAUSE_LOOP` = `verify` (`bkit-build.md:733`), so `{LOOP_FLAGS}` carries `--loop=verify` (`bkit-build.md:151`). Compose then writes a `## Progress` block and the loop question as Q1, titled `Verify`, with options `Try again / Decide` (`decisions.ts:402-426`), and numbers the gap items from Q2 (`decisions.ts:431`). Step 6 writes `Decision: Decide — …` under that loop question (`bkit-build.md:227`), and headless runs write `Decision: Decide — recommended; applied without asking` (`decisions.ts:264`).
   - The planned rule has to read that loop item correctly: "every item has a decision", a `Decide` that is neither `Accept` nor `Fix now`, and the gap items that follow. A fixture without it cannot fail when an implementation rejects or miscounts a `Decide` item. That build passes all four Task 3 cases and the `workflows.test.ts` case, yet every real round-limit pause keeps its FAIL, which is the defect this plan exists to fix.
   - Fix: build the Task 3 fixtures in the exact layout compose writes. Either generate them with `decisions compose --loop=verify` the way `decisions.test.ts:127-135` does, or copy the layout: the header block `Status`, `Question: VERIFY_GAPS`, `From: verify`, `Pause step`, `Plan`, `Group`, `Verify attempt`, then a blank line, then the progress block, Q1 `Verify` with `Decision: Decide — …`, Q2 `Accept`, and Q3 `Fix now` with `Fix task: 42`. Also add one no-loop variant: a FAIL with `Fixable: false` before the limit (`bkit-build.md:737`) writes no loop item. Renumber the Concrete Example and the Edge Cases to match.
2. **(plan edit) The paused-group rule can clear CONCERNS rows. Remediation warnings would then disappear from a run's verdict.**
   - The rule in Architecture § `summary.ts` Part 2 and Task 3 names the steps (`build-plan-tasks`, `build-plan-verify`, `build-plan-gaps-remediate`), the group and the row order, but no verdict. The per-group loop lets both FAIL and CONCERNS rows through to that point (`summary.ts:230`). Placed "before that row" as specified, the rule would move a paused group's `build-plan-gaps-remediate` CONCERNS row (the remediation agent's own warnings) into `Resolved Findings` with `resolved.set` (`summary.ts:293`, rendered at `:393`).
   - That contradicts the contract the plan cites: "Separate remediation warnings and flakes remain concerns" (`.bkit/core/.bkit/workflows.md:520`). It also contradicts the existing guard `retains remediation warnings and unrelated group failures after a verification PASS` (`summary.test.ts:239-253`), which covers only the same-group path. A run that would be CONCERNS today would print PASS. The Breaking Changes row ("nothing that was PASS or CONCERNS becomes FAIL") does not cover that direction.
   - No `Derived Test Matrix` row covers a paused group's CONCERNS rows.
   - Fix: limit the rule to rows whose last verdict is `FAIL`, in Architecture, Task 3 `UPDATE` and `DONE WHEN`, matching the issue's wording ("A group's FAIL rows count as resolved"). Add a matrix row and a Task 3 assertion that a paused group's `build-plan-gaps-remediate` CONCERNS row stays under the reasons after its `Fix now` task is verified. Task 3 then holds 6 `TEST FIRST` tests, within the cap of 10.

## OPTIONAL

- **Debug CI-sourced first round (Task 1).** When debug's first failing round comes from CI evidence, the `debug-run-tests` row has `scope` = `ci:{runId}` (`tests.ts:1765`, `:1809`), so a later local pass never has the same scope. The same-scope rule therefore keeps `debug-failure-remediate FAIL` in that case. That matches `docs/testing.md:599` ("Local success alone does not resolve a CI-only failure"), but no matrix row pins it. Add a case asserting it stays FAIL, so a later "simplify the scope match" edit goes red.
- **Restrict the Part 4 scope lookup to `step-done` rows.** `input.rows` also holds `test-run` rows with the same `step` and `attempt` (`tests.ts:1907-1918`; `workflows.ts:1716` passes every row of the run). The two rows of one round carry the same scope today. Naming the row type keeps the lookup deterministic.
- **`build-plan-verify` CONCERNS at a pause.** `bkit-build.md:742` can pause on a CONCERNS verify. Say whether a `Fix now` on that pause clears the CONCERNS row, or whether it stays like CRITICAL 2's remediation warnings, and add the matching edge-case row.
- **Accept-only verify pause.** The `#900` debug notes (related-issues.md:69) ask for a recorded decision on whether a CONCERNS verify that lists only owner-accepted gaps resolves the group. `summary.test.ts:426` asserts that it does not, and no ledger row records why. The plan keeps the behaviour but writes no decision row for it. Add one to the `**Ledger rows:**` line, or name it under Out of Scope.
- **Resolution evidence table wording (Task 5).** The existing row "Failed group execution or gap remediation → The latest passing verification of the same group" (`.bkit/core/.bkit/workflows.md:520`) still reads as the only rule. Point it at the new `Fix now` row, so an agent reading the table does not treat same-group verification as the only evidence.
- **#846 acknowledgement.** `#846`'s issue says "a decision record, or a different group's verification never clears them" (related-issues.md:157), and Part 2 clears a group's rows on exactly that evidence. The `Fix task:` link is what makes the evidence scoped. Say so in the `903-fix-now-group-fail-resolved-by-verified-fix-tasks` decision row's rationale, with the `846-summary-retains-resolved-findings` failure key in its `references`.
- **Pin the mechanism in Task 4's guards.** Step 5 keeps "the task runs as it is" for a fixable item with no direction, so a guard written as `not.toMatch(/runs as it is/)` could never pass. Anchor the three cases on the instruction itself, as `docs/testing.md:238` asks: rewrite `**DONE WHEN:**` and `**TEST FIRST:**`, replace the matrix rows, keep the meta line, and step 6's `Fix task: {N}` line.
- **The no-direction fixable branch looks unreachable.** In the non-overflow case, every challenge item is a `**Fixable:** false` task (`bkit-build.md:143`). Overflow items have no task (`:142`). So the "fixable item with no direction → runs as it is" branch seems to have no input. Confirm a path reaches it, or drop the branch.
- **`**Fixable:** false` stays on a rewritten task.** Keeping the meta line keeps `challengeResolution`'s match (Location / Severity / Round only, `summary-findings.ts:138-148`), but the task block still says no agent can fix it after the owner gave a direction. State whether `**Fixable:**` stays `false` or flips to `true`. Either keeps the match.
- **Resume idempotence of step 5.** A run resumed at Decision Pause step 3 (`bkit-build.md:43`) after step 5 wrote a new task block, but before step 6's `steps finish`, runs step 5 again and appends a second block. That risk exists today, but Part 2 now depends on `Fix task:` naming the right task. Make step 5 reuse the task an item's `Fix task:` line already names.
- **Breaking Changes table.** Add the owner-visible change "a hard blocker answered `Fix now` with no direction now gets a follow-up question". It is in the Process Sketch and Edge Cases, but not in the table.
- **`workflows.test.ts` fixture realism.** `planOf` builds only GROUP 1 (`workflows.test.ts:3067`). Extend it, or add a two-group plan, so the verb case holds the paused group's tasks and the fix task in different groups, as a real run does.

## OUT OF SCOPE

- `build-failure-diagnose` FAIL has no `RESOLVED_BY` entry either. A diagnose step that ends FAIL followed by a passing `build-run-tests` keeps the summary at FAIL, the same pattern as Part 4. No issue names it.
- `#895` rewrites `parseDecisionItems` and the decision-file layout. Its plan must keep the `Fix task:` line and the header block that `decisionHeader` reads. Note it on `#895`.
