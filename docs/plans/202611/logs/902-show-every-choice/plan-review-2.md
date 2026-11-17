Verdict: CONCERNS
Failures: 6
Redesign: false

<!-- verdict:end -->

# Plan Review

Lens: Regression risk — touched surfaces, backwards compatibility, design-coverage.

## Surface-Area Map

No design artifact exists (`docs/plans/202611/902*` has no file; the owner settled the issue's questions in the issue comment), so the design-coverage step does not apply.

<!-- prettier-ignore -->
| Task | Files and symbols it changes | Consumers and downstream readers |
| --- | --- | --- |
| 1 | `decisionsCommand` (`.bkit/core/engine/commands/workflow/decisions.ts:326`): new `record` verb; `FOLDED_TYPES` neighbour map in `status.ts:363` / `row` verb `:695-723`; `MARK_ROWS` (`run-facts.ts:338-345`); `.bkit/core/.bkit/cli.md` | The CLI registry and `cli-doc.test.ts`; the engine journal (`lib.ts:507-536`) writes an `engine-call` row per `use: "workflow"` call; `stepsBlock` (`run-facts.ts:116-137`); `MARK_ROWS` has one copy only (no match in `scripts/`) |
| 2 | `decisionsCommand` `record --from-grill` | The grill file format written by `bkit-design.md:302-312` (`- Q{n} {title}: {answer}`) |
| 3 | `apply` verb (`decisions.ts:447-499`): required `--point`, exit 3, `recorded`; `applyRecommendations` (`:242-270`) read only | Caller `bkit-build.md:170` (Decision Pause step 3), routes `:172-176`; existing tests `decisions.test.ts:261-313` and `:460`; the CLI's unknown-flag refusal `lib.ts:238` |
| 4 | `buildSummary` (`summary.ts:194-545`): new section, removed Risks lines (`:519`), design concern | All five summaries; `workflows close --final-return`; the comment body (`buildComment`, `issues.ts:587`); design Step 10 routes PASS and CONCERNS alike (`bkit-design.md:518`); `bkit-auto.md` reads no verdict (0 matches) |
| 5 | `SummaryInput` (`summary.ts:80`) + `featureRows`; ship block `:493-501` removed; `summaryVerb` (`workflows.ts:1697-1784`) | Ship Step 6 summary line `bkit-ship.md:574`, run after Confirm Assumed Items (`:360`); decision-file states written by `decisions.ts:527` / `:531` / `:583`; ship `{STATUS}` is the worktree log (`bkit-ship.md:45`) |
| 6 | `bkit-build.md` Decision Pause step 3 and gate `:303`; `bkit-debug.md` Loop Question sub-step 1 (`:123`) and gate; `.bkit/instructions.md:9883`, `:10086`, `:10088`; render snapshots; `owner-wait-rows.test.ts` | `workflow-shape.test.ts:1905-1916` (pins the Loop Question's `counters progress` lines); the completeness contract (`deriveContract`, `checks/status-holes.ts:367`); the debug Loop Question and build Decision Pause sit outside every `Step N` section (`stepSections`, `:220-222`), so their calls are not required calls |
| 7 | `bkit-design.md` Step 3 Grill sub-step 5 (`:302-312`) and gate; `.bkit/instructions.md:10251-10256`; render snapshot; `owner-wait-rows.test.ts` | The completeness contract: a call inside `Step 3` is required unless it sits on an `**If**` / `**Else**` arm (`sectionCalls` / `branchLines`, `status-holes.ts:253-335`, `:807`); a holey design run warns at the next workflow start (`previousRunWarning`, `workflows.ts:1126-1142`) |
| 8 | `ship-verdict.integration.test.ts` | `dist/cli.js`, the fake `gh` fixture |
| 9 | `.bkit/core/.bkit/workflows.md` (event table, § Ask points, Grill row `:913`, Confirm Assumed Items row `:1124`); `docs/testing.md` | Rendered `.bkit/workflows.md`; prose lint |
| 10 | Mirrors, `dist/`, `docs/capabilities.md` | `bkit check`, `bkit:graph:check` (reads staged files) |

**High-risk surfaces flagged:**

- `buildSummary` is shared by all five workflows and is posted verbatim as the issue comment.
- The `status.jsonl` event contract has many readers: fold, `runStatusRows`, `stepsBlock`, completeness, `previousRunWarning` and harvest. `fold` and completeness `check` skip unknown types (`ledgers/status.ts:249-274`, `status-holes.ts:581-589`), and harvest filters rows by type.
- The `decisions apply --by=headless` signature changes.

## CRITICAL

1. **Task 6 breaks an existing test that no task names (plan edit).**
   - `workflow-shape.test.ts:1905-1909` asserts that the debug Loop Question section holds exactly one `"{BKIT}" counters progress` line. `commandLines` collects every line containing the call (`workflow-shape.test.ts:40-44`), and the test uses `toEqual([...one line])`.
   - Task 6 adds a second read of `counters progress` in sub-step 1 ("Read `counters progress` with sub-step 2's exact command").
   - Fix, either of:
     - Add `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` to Task 6's `UPDATE` lines, and say how the assertion changes.
     - Restructure the Loop Question so progress is read once, before the `LOOP_ASK` branch.

2. **The design grill record line can make every design run that asked the owner read as incomplete (plan edit).**
   - The completeness contract is derived from the shipped markdown. A `"{BKIT}"` call inside a `Step N` section is required unless it sits under a `- **If**` / `- **Else**` bullet, or in a sub-step that an `**If**` line routes to as `sub-step N` (`status-holes.ts:253-287`, `:807`).
   - Task 7 places `decisions record --from-grill` in Step 3 sub-step 5. Every path reaches that sub-step (`bkit-design.md:259`, `:285`, `:301` route with `→ step 5`, not `sub-step 5`), and the plan text says only "only when nobody was asked".
   - Written that way, every design run where someone was asked misses a required call. It gets an evidence hole in its `completeness` row (`workflows.ts:1095-1110`), and the next workflow start prints `previous run ... was incomplete` (`workflows.ts:1126-1142`).
   - No `Derived Test Matrix` row covers the completeness contract, which is a touched surface.
   - Fix:
     - Specify the line as a fence nested under `- **If** nobody was asked →`.
     - Add a matrix row and a `TEST FIRST` test that pins it. For example, in `.bkit/core/engine/checks/status-holes.test.ts`: `deriveContract(bkit-design.md)` gives the `decisions record` call `branch: true`, so a design run without it is not holey.

3. **Two refusal tests already pass, because the CLI already refuses an unknown flag (plan edit).**
   - `lib.ts:238` throws `EXIT.USAGE` with `unknown flag --${name}` and writes nothing.
   - Task 3 `refuses a point outside build`: today `--point=debug.fix` is not "accepted", it exits 2 as an unknown flag. A test whose only failure condition is "accepted" is green before any code is written.
   - Task 2 `refuses a malformed assumed line and writes no row at all`: on Task 1's code, `--from-grill` is an unknown flag, so the call exits 2 and writes no row. The test is green at red time.
   - Fix: each test asserts the specific refusal message the new code emits (for example, stderr names a `build.*` point, or names the malformed line), and asserts that the message is not `unknown flag`.

4. **Two "verdict unchanged" tests already pass on the code before their task (plan edit).**
   - Task 4 `leaves the verdict alone for automatic Fix now and Try again rows`: today only `Accept` decisions add a concern (`summary.ts:302-315`), and `auto-decision` rows are ignored. A build holding only those rows already reads PASS.
   - Task 5 `rolled-up rows leave the ship verdict alone`: on Task 4's code, `featureRows` is not read, and ship concerns come only from decision files (`summary.ts:317-326`). The ship already reads PASS.
   - A task that adds behaviour names a new test that fails first.
   - Fix: merge each verdict assertion into a test that also asserts the new line is listed. For example, "lists automatic Fix now and Try again rows and keeps the verdict PASS" fails today because the line is missing.

5. **Three Task 6 / Task 7 audit tests cannot go red first (plan edit).**
   - Task 6 `bkit-debug.md writes no record for a routine continue`: `bkit-debug.md:123-130` holds no `decisions record` line anywhere, so "no record in the routine branch" passes today.
   - Task 7 `classifies every ASK_POINTS entry`: the table is written inside the test, together with the assertion, so the test passes as soon as it is written. The matrix behaviour ("a new ask point with neither fails") is not proven red.
   - Task 7 `ship.merge goes only to the Failure Path`:
     - Task 7 changes nothing in `bkit-ship.md`. So the test passes at red time once #911 has landed (the plan's precondition).
     - Before #911 lands, it can never pass, because `bkit-ship.md:861` still narrates `fix round taken without asking`.
   - Fix:
     - Pair the routine-continue assertion with the presence assertion in one test, so the test fails today on the missing record line.
     - Keep the classification and `ship.merge` checks as guards outside `TEST FIRST` (or prove the classification's red with a synthetic missing point, as `question-option-format.test.ts:433-501` does with its RED-PROOF cases).
     - Record the #911 ordering as a precondition rather than a red test.

6. **The owner-confirmed Concrete Example contradicts the line shape the tests are written against (plan edit).**
   - The Concrete Example grill line (`plan-v1-draft.md:82`) reads `design.grill Q2 Storage: the design assumes keep one JSONL file per export (headless, GITHUB_ACTION). Needs your confirmation …`, with no reason.
   - The line shape (`:435`, `- {point} {question}: {verb} {chose} — {reason} ({why}, {runtime}). …`) and the `--from-grill` reason (`:398`, `recommended answer; nobody was asked`) render `… per export — recommended answer; nobody was asked (headless, GITHUB_ACTION). …`.
   - A Task 4 or Task 8 assertion written from the example fails against code built from the shape, and the reverse also holds.
   - Fix: make the example and the shape agree. Either drop `— {reason}` for `design.grill`, or add the reason to the example.

## OPTIONAL

- **MARK_ROWS gotcha (`docs/knowledge.jsonl` `mark-rows-copies-must-stay-in-parity`, ACTIVE):** the second copy it names (`scripts/harvest/bkit-harvest.mjs`) no longer holds `MARK_ROWS` (no match in `scripts/`), so Task 1's one edit is complete. Say so in Task 1, so the build does not hunt for the copy.
- **Runtime pinning:** `classify` returns `GITHUB_ACTION` whenever `CI` or `GITHUB_ACTIONS` is true (`runtime.ts:111`). The Task 1 "LOCAL" case must set `BKIT_RUNTIME=LOCAL`, as the existing tests do (`decisions.test.ts:288`). Otherwise it reads `headless` in the CI lane. The Verification Plan names only the `GITHUB_ACTION` case.
- **Positive assertions in Task 3:** `writes the loop answer alone on Try again` and `writes no row for a hard blocker` should assert exactly one loop row, and exit 4 with rows for the settled items. Today's exit 2 (`unknown flag --point`) writes zero rows and would satisfy a "no extra row" check.
- **One more existing caller:** `decisions.test.ts:460` (in `bkit decisions apply --by=owner and pending`) also runs `apply --by=headless` without `--point`. Task 3's `UPDATE` names only the `--by=headless` describe.
- **A claim in the plan is wrong:** no test asserts `## Ship Completed with Assumed Items` today. The heading appears only at `summary.ts:496`. Task 5's new test is the first to cover the block.
- **Fixture fidelity for state at ship:** build the confirmed, rejected and deferred fixtures from the lines the engine writes (`decisions.ts:527`, `:531`, `:583`), or by running `apply --by=owner` / `pending --defer`, and re-point them to #895's layout.
- **Dedupe key:** a `merge=union` duplicate is a byte-identical line, `at` included. Deduplicating on the whole row avoids collapsing two real choices that share point, artifact, question and choice.
- **Write order in `apply --by=headless`:** today the plan writes the decision file and then the rows. If the row append fails, a resumed run finds every item decided, so `applied` is empty and the `Fix now` / `Try again` records are never written. Append the rows first, or derive them from the items the file now holds.
- **Version skew:** a consumer who bumps the package but has not re-rendered still runs the old line without `--point`, so every headless Decision Pause takes the Failure Path. Name the existing preflight advisory (`checks/before/version.ts:41`) in the Breaking Changes row.
- **One locked status writer:** the #836 and #860 plans each build one locked append in `ledgers/status.ts` (`related-issues.md`). If either lands first, route `decisions record` through it rather than a raw `appendFileSync`.
- **Untested behaviour:** `state unknown ({artifact} not found)` at ship has no matrix row.
- **Assumption wording:** Task 8 runs one fabricated status file, so it cannot "show" the cross-branch assumption (design rows on `dev` before the build branch is cut). `kn-21-workflow-status-json-on-dev-for-all-five-workflows-single-t` is the backing fact; cite it instead.
- **Superseded knowledge key:** the plan cites `red-snapshot-freezes-the-test-file-write-it-lint-clean-first`, which is SUPERSEDED (`docs/knowledge.jsonl:131`). The winning ACTIVE row is `steps-finish-refuses-a-code-step-whose-planned-test-file-changed` (`:130`). It matters here because Tasks 3-5 edit existing cases in planned test files, so those edits belong in the tests step, before the red.
- **Grill parse ambiguity:** splitting `- Q{n} {title}: {answer}` at the first `: ` misreads a title that holds `: `. State the split rule, and test it in Task 2.

## OUT OF SCOPE

- The resume mapping `From: summary` → `build.summary` (`bkit-build.md:43`) is already exit 2 at `counters max`. It is listed as Suggested Scope Expansion row 2.
- The `.bkit/workflows.md` § Ask points sentence about loop questions (Suggested Scope Expansion row 1).
- `.bkit/stats.jsonl` outcome verdicts: design runs with assumed grill answers now read CONCERNS, which shifts any telemetry that counts design CONCERNS.
