Verdict: CONCERNS
Failures: 5
Redesign: false

<!-- verdict:end -->

# Plan Review

Lens: Regression risk — touched surfaces, backwards compatibility, design-coverage.

## Surface-Area Map

No design artifact exists for 894 (`docs/plans/*/894*-design.md` absent; the input references none), so Process step 7 (design-coverage) is not applicable.

- **Task 1 — `runProgress` start mode** (`.bkit/core/engine/commands/workflow/step-table.ts:250-282`).
  - Symbol: `runProgress` (exported). Single caller: `stepProgress` in `.bkit/core/engine/commands/workflow/steps.ts:448-517`. Its output feeds the `progressLine` field printed by `steps finish` / `steps done` / `steps gate`.
  - Data read: `WORKFLOW_STEPS` (same file). Downstream readers of `progressLine`: none in code. It is display-only (narrated by hosts). Asserted in `steps.test.ts:268-348` and `progress.integration.test.ts:185-284`.
  - Capability register: `docs/capabilities.md:330-331` (step-table symbol/edge counts).
  - Risk: shared utility (every workflow's progress output). Additive inputs, default path unchanged. Not a compat break.
- **Task 2 — `groupDone` suffix** (`runProgress`, `stepProgress`).
  - Surface: the `progressLine` of a `DONE` `build-group-gate` row with verdict `PASS`. Producer: `bkit-build.md` Step 8 sub-step 9 (`:724`, `--verdict={GATE_VERDICT} --attempt-of=build-plan-verify:current`), which runs only when a higher group exists.
  - Consumers: narration only. The existing group-gate fixture `steps.test.ts:2027+` writes `--verdict=PASS`. It asserts rows, not the line suffix (no break found).
- **Task 3 — `steps start` verb** (`stepsCommand` and `stepProgress` in `steps.ts`, `.bkit/core/.bkit/cli.md` through `pnpm cli:sync`).
  - Public CLI surface: a new verb. Existing verbs are unchanged.
  - Journal: each call writes an `engine-call` row (`.bkit/core/engine/ledgers/journal.ts`, resolved via `resolveActiveRun` `lib.ts:506-536`). Tests turn the journal off (`vitest.setup.ts`, `BKIT_ENGINE_JOURNAL`).
  - Completeness checker: `.bkit/core/engine/checks/status-holes.ts` treats every `"{BKIT}"` call inside a step section as a required call. See `requiredCalls` :237-250, `sectionCalls` :305-334, `branchLines` :254-287, `check` :558-808 and `deriveContract` :367-441.
  - Capability register: `docs/capabilities.md:384` (steps symbols, `steps -> lib` edges).
- **Task 4 — clause and design/plan/auto blocks.**
  - Files: `.bkit/instructions.md:2607-2621` (`workflow-narrate`, carriers `workflow all`, a `retired` block with two older texts) and the `## Local Instructions` entries; `.bkit/core/workflows/bkit-design.md`, `bkit-plan.md` (Narrate `:15`, Step 1 literal lookup `:110`, gate `:195`), `bkit-auto.md` Narrate.
  - Consumers:
    - Host renders (`.claude/`, `.opencode/`, `.codex/` mirrors, via upgrade).
    - None-render baselines `.bkit/core/engine/render/__snapshots__/bkit-{build,debug,design,plan,ship}.none.txt`, checked by `.bkit/core/engine/render/trackers.test.ts:389-402` (`toMatchFileSnapshot`).
    - `.bkit/core/engine/render/hosts.test.ts:707-742`.
    - `workflow-shape.test.ts` Step 1 tests (1504-1600; `commandLines(step1,"steps gate")` length 1, which a `steps start` line does not change).
    - `instructions-coverage.test.ts`.
    - The status-holes contract for every design/plan section.
- **Task 5 — debug/ship blocks.**
  - Files: `bkit-debug.md` (remediate finish `:587`, soak finish `:611` `--count-field=soakAttempt=debug-failure-soak:next:all`), `bkit-ship.md` (Steps 3 and 9 have no row; Steps 10-12 are the `ship-merge-pr` loop), and the instructions local entries.
  - Consumers: the status-holes contract, the none-baselines, `counter-prose-audit.test.ts`. That audit's `COUNTER_STEP_MAP` checks rows that derive a counter. `steps start` writes no row, so its `stepDoneLines` scan does not match.
- **Task 6 — build blocks.**
  - File: `bkit-build.md`.
    - Steps 4 (`:488-512`) and 5 (`:524-548`): the work sub-steps are **If**-targets, so a call there is a branch call.
    - Step 7 (`:587-656`): sub-step 2 (`:596-603`) holds `status route` and `steps done --step=build-group-start ... >/dev/null`.
    - Step 8 (`:670-744`) and Step 9 (`:758+`). Challenge finish `:961` (`--field=round={CHALLENGE_ROUND}`).
  - Consumers: the status-holes contract (Step 7 has an OPEN shared-row-key failure), the none-baseline `bkit-build.none.txt`, `workflow-shape.test.ts`.
- **Task 7 — docs and mirrors.**
  - Files: `.bkit/core/.bkit/workflows.md` § Progress Lines, the Protocol table, the Authoring Checklist; `CHANGELOG.md`.
  - Consumers: the `.bkit/workflows.md` / `.bkit/cli.md` mirrors (upgrade), `bkit check` drift. `docs/capabilities.md` is not listed in Documentation Updates.

## CRITICAL

1. **(plan edit) None-render baselines go red, and no task regenerates them.**
   - Tasks 4, 5 and 6 change the text of `bkit-design.md`, `bkit-plan.md`, `bkit-debug.md`, `bkit-ship.md` and `bkit-build.md`, and the Narrate line through the `workflow-narrate` clause.
   - Each `.bkit/core/engine/render/__snapshots__/bkit-*.none.txt` holds the full rendered workflow (the Narrate line is line 15). `.bkit/core/engine/render/trackers.test.ts:389-402` compares against those files with `toMatchFileSnapshot`.
   - `pnpm instructions:sync` and `bkit upgrade` do not rewrite them. Only `pnpm bkit:generate` (`package.json:67`, `vitest run .bkit/core/engine/render -u`) does.
   - No task's UPDATE list or DONE WHEN names the baselines or `trackers.test.ts`. The unit lane fails after Task 4.
   - Fix: add the five `.none.txt` baselines to Tasks 4-6 (each task the workflows it edits), with `pnpm bkit:generate` and `trackers.test.ts` passing in DONE WHEN.
   - The regenerated baseline is a follow-on artefact, not a TEST FIRST. Keep it out of TEST FIRST so it does not become a baseline-only test.
2. **(plan edit) The status-holes completeness contract changes, and nothing covers it.**
   - Every `"{BKIT}" steps start ...` line put into a step section becomes a required call for that section. See `.bkit/core/engine/checks/status-holes.ts:237-250` (`requiredCalls`), `:305-334` (`sectionCalls`) and `:558-808` (`check`). A start call under an **If** / sub-step target becomes a branch call (`:254-287`).
   - The Alternatives row claims "every call is journaled, so the status-holes sweep can see a skipped start call". That claim holds only if the checker parses the new verb as an ordinary call and the start line sits before the gate the section is judged by. No `Derived Test Matrix` row and no TEST FIRST exercises `status-holes.ts` with a `steps start` section. Task 6 DONE WHEN only requires the existing fixture-based `status-holes.test.ts` to keep passing, and it cannot fail on this change.
   - Backwards compat:
     - `readCompleteness` (`status-holes.ts:882-916`) recomputes completeness from the *current* workflow md when no stored completeness row exists.
     - `previousRunWarning` (`.bkit/core/engine/commands/workflow/workflows.ts:1126-1147`) and the CI sweep (`package.json:98` `bkit:audit:status`, `.github/workflows/bkit-ci.yml:523-525`) do the same.
     - So a run that is unclosed or spans the upgrade is judged against start calls it never made. It reports false holes.
   - The plan's Breaking Changes line ("No status row, flag or exit code of an existing verb changes") leaves this out.
   - Fix:
     - Add a matrix row and TEST FIRST at the `status-holes` unit tier: a fixture section with a `steps start` line plus its done line. The case fails when the journal has the done call but no start call, and passes when both are present. Name it in Task 4 or Task 3.
     - State in Breaking Changes how runs that span the upgrade are judged, or make the start call optional (not required) in the contract. Either way, assert the choice.
3. **(plan edit) The plan touches build Steps 7 and 8 without acknowledging two OPEN known failures.**
   - `related-failures.md` lists `status-holes-shared-row-key-splits-build-step-7` and `status-holes-tasks-tick-between-two-finish-lines` as OPEN.
   - Task 6 puts a new `steps start --number=7 --group={GROUP}` call into Step 7 sub-step 2, on every group entry, and adds start calls to Steps 8 and 9.
   - Under the first failure, split Step 7 visits are already judged against all of Step 7's calls. One more required call per section adds a false hole on each split visit.
   - The plan neither names these failures nor says how the new calls avoid making them worse.
   - Fix: name both failures in Task 6, and add a status-holes case for a two-group build (Step 7 entered twice, start call once per entry) whose expected holes are pinned.
4. **(plan edit) Capability register drift is not handled.**
   - Tasks 1-3 change symbols and edges in `step-table.ts` and `steps.ts`. The counts are recorded at `docs/capabilities.md:330-331,384`.
   - ACTIVE knowledge rows `capability-register-drift-reached-dev-through-warn-only-pre-push` and `capability-register-pr-gate-checks-the-merge-ref` record this exact drift reaching dev and failing the PR gate.
   - No task runs `pnpm bkit:graph:refresh` (which reads the *staged* tree) and commits the register, or checks `pnpm bkit:graph:check`. Documentation Updates omits `docs/capabilities.md`.
   - Fix: add both commands to Task 3's DONE WHEN, or to Task 7's.
5. **(plan edit) The "skipped step shows no start line" rule is tested only for design and plan.**
   - Task 4 has a matrix row and test for the rule that a skipped step prints no start line (start block after the **Run only if** / **Skip if** line).
   - Tasks 5 and 6 put start blocks after skip lines too:
     - debug's **Run only if** steps;
     - ship Step 4 Path A;
     - build Steps 4 and 5, where the start call sits inside the routed work sub-step.
   - Their TEST FIRST cases check only that a start call is present and that attempt/group arguments are there. A start block placed before the skip line in debug, ship or build passes every planned test, and it prints a start line for a step that never runs.
   - Fix: extend the Task 4 placement assertion (or a matrix row) to all five workflows, in Tasks 5 and 6.

## OPTIONAL

- **Task 1 `start attempt` case:** the done line already carries `Attempt 2 of 3` (`step-table.ts:279-280`). Make the start-mode case assert the `Starting Step` wording *and* the finished-before % together, so a case that reuses the done path cannot pass.
- **`hosts.test.ts:707-742`:** today's Narrate text already contains "step start" (`bkit-plan.md:15`). Pin the new start-rule phrase itself (for example `Starting Step`), so the new case fails on the current text.
- **Retired-prefix gotcha (knowledge row 93, ACTIVE):**
  - When moving the old `workflow-narrate` text to `retired`, keep each retired text's prefix distinct from the new text.
  - Add `instructions.test.ts` to Task 4's DONE WHEN, plus a second `pnpm instructions:sync` run that reports no change (idempotence).
  - Knowledge rows 96 and 103 say local entries need hand edits after line changes, which Tasks 4-6 already plan.
- **Build Step 7 sub-step 2 and the Resume rule:** on resume into Step 7 the Resume rule and sub-step 2 can both print the group start line. Say which one wins.
- **`--step=` in Start blocks:** avoid `--step=` on `steps start` lines in sections where `STEP_KEY_RE` (`status-holes.ts:195`) would read it as the section's row key. Or assert in the status-holes case above that it does not.
- **Attempt parity:** extend the attempt-parity test to each looped point. The sources were checked and match their finish lines: soak `--count-field` `:all` (`bkit-debug.md:611`), remediate (`:587`), challenge round (`bkit-build.md:961`). Pin all three.
- **Build Step 4 re-entry:** when Step 8's `CONVERT_RETRY` re-enters Step 4, the finished-before % can drop. Add one case pinning the expected % (the matrix's "take the smaller" rule).

## OUT OF SCOPE

- Version-gating the completeness contract: stamp the contract or workflow version on each run, so runs started before an upgrade are judged against the md they ran.
- Fixing the two OPEN status-holes failures (`status-holes-shared-row-key-splits-build-step-7`, `status-holes-tasks-tick-between-two-finish-lines`) themselves.
