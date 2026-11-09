Verdict: CONCERNS
Failures: 5
Redesign: false

<!-- verdict:end -->

# Plan Review

Lens: Regression risk — touched surfaces, backwards compatibility, design-coverage.

## Surface-Area Map

No design artifact exists (plan `Context & Goals`: "There is no design doc"), so step 7 design-coverage has nothing to check against.

- **Task 1** — `.bkit/core/engine/commands/workflow/tests.ts`: `JunitCase` (`:543`, public type export), `parseJunit` (`:582`), new `failingCases`, `MAX_FAILED_CASES`, `run` verb output and `test-run` row (`appendTestRun` `:178`, verdict `:1873-1880`).
  - Consumers of `parseJunit` / `JunitCase`: `countReportFailures` (`tests.ts:156-164`), `judgeRed` / `judgeGreen` (`:630`, `:661`), `runTestFile` (`:1126-1132`), green loop (`:2328`), `.bkit/core/engine/audits/repo/test-file-script.integration.test.ts:17,90,152`, `.bkit/core/engine/commands/workflow/tests.test.ts:707-764,796` (two `toEqual<JunitCase[]>` assertions at `:717-727` and `:737-745`).
  - Readers of `test-run` rows: `ledgers/status.ts:121` (`testRunProblem`), `commands/workflow/steps.ts:1177-1183`, `commands/workflow/run-facts.ts`, `checks/status-holes.ts:726,762`, `ledgers/telemetry.test.ts`, harvest (`scripts/harvest/bkit-harvest.mjs`). All read by key, so the additive fields are safe.
- **Task 2** — `tests.ts` `testsCommand` (new `accept` verb, writes the new `accepted-failures` status row); `run-facts.ts` `MARK_ROWS` (`:338-345`).
  - `MARK_ROWS` has a second, hand-kept copy at `scripts/harvest/bkit-harvest.mjs:1479` (used at `:1629`), pinned equal by `scripts/harvest/bkit-harvest.test.mjs:3021-3028`.
  - New verbs are `use: "workflow"`, so they land in the engine-call journal that `checks/status-holes.ts` (advisory, fail-open) matches against the workflow contract.
- **Task 3** — `tests.ts` `run` verb (`--accepted-from`, `{log}.accepted.json`, `BKIT_ACCEPTED_TESTS` in the `runToLog` env at `:1856-1860`). New consumer-facing env contract. The `run` verb's CI-evidence branch (`--ci-run`, `tests.ts:1790-1828`) returns before any gate runs, and debug Step 3 sends both modes through one call (`bkit-debug.md:374-376`). New `tests-accepted.integration.test.ts`.
- **Task 4** — `tests.ts` new `failures` verb, which reads `test-run` and `accepted-failures` rows. Unknown verbs today exit `EXIT.USAGE` = 2 (`commands/lib.ts:41`, `:583-584`).
- **Task 5** — `.bkit/core/engine/commands/workflow/decisions.ts` `pending` (`:527-583`) adds the `acceptedTests` output. Consumers: `bkit-ship.md:339` (holds `items` and `count` only), `bkit-ship.md:371` (`--defer`), `ledgers/telemetry.ts:428`. `count` and `--defer` are unchanged.
- **Task 6** — `.bkit/core/workflows/bkit-build.md` § Decision Pause step 2 (`:134-152`), step 5 (`:194-221`), § Gate (`:288-297`). Behaviour is driven by `decisions compose` / `applyRecommendations` (`decisions.ts:231-259`, `:389-417`). Per-group verify (`bkit-build-plan-verify.md` steps 6 and 9) also produces gap items for the same pause. Render snapshot `bkit-build.none.txt`. Shared instruction text goes through `.bkit/instructions.md`.
- **Task 7** — `bkit-build.md` Step 8 sub-step 8 (`:704`), Step 9 Context (`:792`, a prose `Context:` line, not a bash block), Step 12 (`:945`); `bkit-debug.md` Step 3 (`:376`, local and CI-evidence modes). Guarded by `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts` (call-site probes at `:333-401`, Context probe at `:302-331`). Render snapshots `bkit-build.none.txt` and `bkit-debug.none.txt`.
- **Task 8** — `.bkit/core/workflows/bkit-ship.md` § Confirm Assumed Items step 1 (`:337-346`). Routing on `ASSUMED_COUNT` is unchanged. Render snapshot `bkit-ship.none.txt`.
- **Task 9** — `.bkit/shared/docs/testing.md` (new consumer runner contract), `.bkit/core/.bkit/workflows.md` § Group gate / § Local gate scripts, `docs/testing.md` § Key test files, `.bkit/core/.bkit/cli.md` (generated), mirrors and `dist/`.
- **Untouched surfaces whose behaviour depends on the change**: `bkit tests changed` as run by holistic verify (`bkit-build-plan-verify.md:84`), gaps-remediate (`bkit-build-plan-gaps-remediate.md:104`) and debug-remediate (`bkit-debug-failure-remediate.md:77`). None of them receives `BKIT_ACCEPTED_TESTS`.

## CRITICAL

1. **(plan edit) Task 2 adds `accepted-failures` to one `MARK_ROWS` copy only, which repeats a known-broken pattern.**
   - The engine copy is `run-facts.ts:338-345`. The harvest copy at `scripts/harvest/bkit-harvest.mjs:1479-1485` is not in the task, and `scripts/harvest/bkit-harvest.test.mjs:3021-3028` asserts the two sets are equal.
   - Knowledge row `mark-rows-copies-must-stay-in-parity` (`docs/knowledge.jsonl:129`, winning row, no status so active) says: "Update both copies in the same change; the harvest parity test pins them equal."
   - Without the second edit, the parity test fails. Harvest would also count the minutes before each accept toward the next step, so engine and harvest step minutes disagree.
   - `test:harvest` (`package.json:83`) is in neither `bkit:gate:static-unit` nor CI, so no gate would catch this.
   - Fix: add `**UPDATE:** MARK_ROWS in scripts/harvest/bkit-harvest.mjs` to Task 2. Add a `TEST FIRST` (and matrix row) to `bkit-harvest.test.mjs` asserting that `accepted-failures` is a mark row, next to the existing `engine-call` / `completeness` check at `:3028`.
2. **(plan edit) Task 1 breaks two existing `parseJunit` tests and does not name them.**
   - `tests.test.ts:717-727` and `:737-745` assert `toEqual<JunitCase[]>` objects with no `classname`.
   - The fixture helpers `passed` / `failed` (`tests.test.ts:702-704`) write `classname="f"`, so after the change the parsed cases carry `classname: "f"`, or `""` for bare `<testcase>`.
   - Both assertions fail, and the typed literal arrays stop type-checking against the widened required field.
   - The tests step may only touch planned tests, so these updates must be declared.
   - Fix: add `**UPDATE:**` lines for both tests in Task 1, and list them as updated tests with additive `classname` expectations.
3. **(plan edit) Tests that cannot fail, or that are red only for an incidental reason.**
   - Task 4 `exits 2 when the step has no test-run row` already passes on today's code. `bkit tests failures` is an unknown verb, and `runCommand` returns `EXIT.USAGE` = 2 for it (`commands/lib.ts:41`, `:583-584`). The planned red ("fails on exit 0") cannot happen.
     - Fix: the test must also assert the verb's own refusal text (for example, that stderr names the step with no `test-run` row and does not say `unknown verb`). Alternatively, the verb can use a distinct exit code for "no row".
   - Task 2 `refuses a truncated run` and `refuses a PASS run` give "a row being written" as their red. On today's code, `tests accept` is an unknown verb that writes nothing and exits 2, so a test asserting only "no row" passes before any code lands.
     - Fix: each refusal test must assert exit 1 and the named refusal reason, as `DONE WHEN` already says.
4. **(plan edit) Debug Step 3's CI-evidence mode gets `--accepted-from` with no defined behaviour and no test.**
   - Task 7 adds `--accepted-from="{STATUS}"` to `bkit-debug.md:376`. That call also runs with `{CI_TEST_FLAGS}` = `--ci-run=… --ci-url=…` (`bkit-debug.md:374`).
   - In that mode, the `run` verb records CI evidence and returns at `tests.ts:1828` before any gate runs. Task 3 does not say whether `--accepted-from` is ignored, refused, or still computes `onlyAccepted` / `unaccepted` there.
   - An implementation that refuses the combination, or crashes on a missing JUnit folder, breaks debug's CI path. No `Derived Test Matrix` row exercises `--ci-run` with `--accepted-from`.
   - Fix: state in Task 3 that with `--ci-run` the flag is accepted and no list is written. Add a Unit row and `TEST FIRST` in `tests.test.ts`: a `--ci-run --accepted-from` call exits as today and writes the same CI `test-run` row.
5. **(plan edit) Accepted cases can still stall the build at Step 10 (holistic verify) and in fix rounds. The Out of Scope reason for deferring `tests changed` is contradicted by the code.**
   - The plan defers `891-tests-changed-honours-accepted-tests` because "Agent self-checks report and do not route the workflow".
   - That is not true of holistic verify. `bkit-build-plan-verify.md:84` runs `bkit tests changed --base=origin/dev --fallback=bkit:gate:static-unit` across the whole feature diff. With no `bkit:gate:changed`, the fallback is the full unit gate, with no `BKIT_ACCEPTED_TESTS`. Its result feeds the report's `Verdict` / `Fixable`, which routes Step 10 into fix rounds and the Decision Pause (#889).
   - Gaps-remediate (`bkit-build-plan-gaps-remediate.md:104`) and debug-remediate (`bkit-debug-failure-remediate.md:77`) are told "Every local test must pass". So any later fix round meets the accepted base-red tests and either edits the consumer's tests or reports `BLOCKED`.
   - The Concrete Example's own case shows the risk: a dead-code registry test that fails because new files were added is exactly the kind of test `tests changed` selects.
   - Fix (choose one, and add a matrix row for it):
     - bring `tests changed --accepted-from` into scope for these three prompts; or
     - add a task and Unit row proving that holistic verify and the remediate prompts treat failures of cases in an `accepted-failures` row (or in the build's decision file) as no gap / not theirs to fix. Then rewrite the Out of Scope reason to match.

## OPTIONAL

Flagged high-risk surfaces that no CRITICAL rule covers:

- the public `JunitCase` type export;
- the new consumer env contract `BKIT_ACCEPTED_TESTS`;
- the Decision Pause, which is shared routing for every pause kind.

Suggestions:

1. **`onlyAccepted` can remove `Try again` while a fixable, unnamed failure is also present.**
   - A gate that runs every stage (not chained with `&&`) can fail both on accepted cases its runner ignores and on a lint or typecheck step that writes no JUnit.
   - `failures` counts only JUnit cases (`tests.ts:1874-1880`), so `onlyAccepted` = true. The pause then drops the loop question, although a round could fix the lint error.
   - `Fix now` still leaves a way forward. Still, word the item so it says other unnamed failures may also be present, or set `onlyAccepted` only when no stage outside the reports failed, if that can be detected.
2. **The headless edge case is not "as today".**
   - Today, a stuck or worse `TESTS_LOOP` pause with no items gets options `Try again` / `Stop` with `Stop` recommended (`decisions.ts:389`, `:407-417`). A headless run then takes `Stop`: a handover, resumable.
   - With the new hard-blocker item, the options become `Try again` / `Decide` with `Decide` recommended, so `decisions apply --by=headless` exits 4 and goes to the Failure Path (`bkit-build.md:171`).
   - `ask` = false runs that are not headless now get asked, where today they are not (`bkit-build.md:172`).
   - Record this under Breaking Changes, and add a Unit row to `decisions.test.ts` for the composed options.
3. **The documented Vitest recipe skips by name, not by `classname` + `name`.**
   - Vitest `testNamePattern` matches the full test name, not the file. A recipe built from `$BKIT_ACCEPTED_TESTS` also skips a same-named test in another file, which can hide a new failure there and break Success Criterion 2.
   - The integration fixture skips by `classname` + `name`, so it does not reproduce this.
   - Have the § Accepted failures docs warn about it, or give a per-file filter.
4. **Task 7's test should cover the Step 9 `Context:` call explicitly.**
   - The bash-block helper (`local-gate-audit.test.ts:333-348`) does not see the prose `Context:` line at `bkit-build.md:792`. Only the separate Context probe (`:302-331`) does.
   - Without coverage, a missing `--accepted-from` there would leave the fix agent's gate red on accepted cases with no test failing.
5. **The same failing tests can reach the pause twice.**
   - The per-group verify report can also log the base-red failures as a gap (its step 9 checks `DONE WHEN` "a test passes"). In the reported incident, the owner's first `Accept` came from such an item, because `bkit-build.md:138` excludes gate failures.
   - With Task 6, the pause can hold both a verify-gap item and the named-failure item. An `Accept` on the gap item writes only the `docs/decisions.jsonl` row, which is the original bug.
   - Say in Task 6 which item wins, or run `tests accept` for any accepted gap that names the gate's failing cases. Add one `local-gate-audit.test.ts` assertion for it.
6. **Make the integration case "a new failing case still fails the gate after an accept" also assert that `unaccepted` names the new case.**
   - Its exit code comes from the fixture runner alone, so it does not show bkit's own matching.
7. **After Task 6, run `bkit completeness check` on a dogfood build that pauses.**
   - It confirms the new `tests failures` / `tests accept` journal entries in § Decision Pause match the derived contract (`checks/status-holes.ts` `workflowCalls`). The check is advisory, so a mismatch would otherwise go unseen.

## OUT OF SCOPE

1. **Wire bkit's own runners to `$BKIT_ACCEPTED_TESTS`** (deferral `891-bkit-repo-runners-skip-accepted-tests`). Until then, a `/bkit-build` of bkit itself on a red `dev` still stops at the "the gate does not skip accepted tests" item. The plan states this; it is noted here only so the dogfood run does not expect bkit's own gates to unblock.
2. **Base-commit check before `Accept`** (Q1 option B, deferral `891-check-accepted-failures-on-the-base-commit`). This is the only way a headless run could accept base-red failures safely.
3. **Make `MARK_ROWS` one shared source** (engine export read by harvest), so the parity gotcha in CRITICAL 1 cannot recur.
