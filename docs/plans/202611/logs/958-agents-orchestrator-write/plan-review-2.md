Verdict: CONCERNS
Failures: 12
Redesign: false
Fingerprint: 65ebcbbfc2f9c6b49491a3267d89297041be64034820b273ff3384cdd0e1b0be
<!-- verdict:end -->

# Plan Review

Lens: Regression risk — touched surfaces, backwards compatibility, design-coverage.

Notes:

- No design artifact: the plan has no parent design, so the step 7 design-coverage check does not apply.
- `related-failures.md` and `related-deferrals.md` are `None`. `related-issues.md` says the search was unavailable.
- Evidence gap: the review hit its turn limit before the end. In finding 10, the `issues.ts` -> `tracker.ts` import edge was traced earlier in the review but not re-read at the end. A single-line import grep shows only `./status.js` at `issues.ts:22`, and the tracker import is a multi-line one. That edge still needs a one-line check.

## Surface-Area Map

- **Task 1:**
  - Touches `promptHeader` (`.bkit/core/engine/commands/workflow/steps.ts:188-212`), `DeclaredField` (176-182) and the new `headerDeclaration`.
  - Consumers: `readHeader` (228-294), `finish` (1170-1232), `steps stub` and `steps verdict`.
  - Prompt headers changed: plan-review-1/2, scope-check, challenge-1/2 and plan-verify. Guard test in `verdict-vocabulary.test.ts`.
  - Untouched sibling with the same placeholder: `bkit-ship-deferred-sweep.md:117`.
- **Task 2:**
  - Touches `finish` (steps.ts:1170-1232), `failuresProblem` (379-387), and `findingsLog` / `parseFindings` (`challenge.ts:138-197`).
  - Consumers: every `steps finish` call in the five workflows, `challenge merge`, and the existing fixtures in `steps.test.ts` (52, 1083-1116, 1163-1179, 1181-1205).
  - High risk: every step passes through this shared gate.
- **Task 3:**
  - Touches the clauses `structured-result-file`, `structured-result-render` and `structured-supply-only` (`.bkit/instructions.md:5078-5097`) and their carrier lines in ten prompts.
  - Also touches Local Instructions entries such as 11358 (verify "engine never overrides").
  - Consumers: `instructions:sync` and `instructions-coverage.test.ts`.
- **Task 4:**
  - Touches `result-path-cleared` (instructions.md:5069) and the `workflow-finish` re-ask.
  - Workflow lines: `bkit-plan.md` 371-387, `bkit-design.md` 417-457, `bkit-build.md` 797-1223, `bkit-debug.md` 601-604.
  - Consumers: the render baselines `__snapshots__/bkit-{design,plan,build,debug}.none.txt`, checked by `.bkit/core/engine/render/trackers.test.ts:403-420`, and the Local Instructions entry 10404.
- **Task 5:**
  - Adds `parseAuditReport` and moves `ledgerKeys` from steps.ts to issues.ts.
  - Consumers: `issues comment`, `ledgers findings` (Task 6), and steps.ts, which imports it until Task 8.
- **Task 6:**
  - Adds the `ledgers findings` verb in `ledgers.ts`, which then imports `issues.ts`. Changes `issues comment` to `--report`.
  - Import graph: ledgers.ts -> issues.ts -> tracker.ts -> locks.ts:38 -> ledgers.ts.
  - High risk: the order in which the CLI loads its modules.
- **Task 7:**
  - Touches the 35 `bkit-audit-*.md` Findings tables (for example `bkit-audit-logs.md:192`), `bkit-audit-generate.md` steps 11 and 15 (177), and the Local Instructions entry 11068.
  - Consumers: the audit agents, `parseAuditReport` and `template-shape.test.ts`. No conflicting header assertion was found there.
- **Task 8:**
  - Removes `renderResult`, `readResult`, `artifactFingerprint` and `fingerprintProblem` (called from `readHeader` near line 246).
  - Removes the `--agent`, `--result-file` and `--invocation` flags of `steps stub`, and `--result-file` of `steps verdict`.
  - Removes `structuredFindings`, `renderFindingsLog`, `parseAuditResult`, and the `stub-seed-fingerprint` clause (5115) in three prompts.
  - The copy mode stays and keeps its tests (`steps.test.ts:1526-1563`).
  - Backwards compatibility: paused runs whose reports carry a `Fingerprint:` header line. Task 8's second test covers this.
- **Task 9:**
  - Adds `decisionItems` in `open-decision.ts`. Readers that move onto it:
    - In `open-decision.ts`: `decisionHeader`, `undecidedBesidesLoop` (115-123), `gateRerun` (134-147), `skipProblem` (159-180) and `openDecision` (205-251).
    - In `decisions.ts`: `statusOf` (76-79), `decisionFiles` (324-332), `skip` and `pending`.
    - Elsewhere: `acceptedLocations` (challenge.ts:229-246), `summary.ts` 436-441/587/604, `summary-findings.ts:151` and `tasks.ts` 163/487/512.
  - Callers that are not in the task: `status.ts:889-891`, `steps.ts:1113` (`continueCheck`) and `workflows.ts:1805-1812`.
- **Task 10:**
  - Adds the `decisions check` verb.
  - Consumer: the `bkit-build.md` Decision Pause, step 2.
- **Task 11:**
  - Adds the `decisions loop` verb. Its logic comes from `compose` (decisions.ts:348-520): the attempt line, `## Progress`, the base-check line and the loop `Q1`.
  - The loop options depend on the item count (491-496, 456, 501).
  - Moved tests: the compose cases at `decisions.test.ts:858` and 866.
- **Task 12:**
  - Moves the writes of `apply --by=headless|rerun|owner` and of `applyRecommendations` (260-288) into `-engine.md`.
  - `apply --by=rerun` reads the `Gate` and `Status` lines (around 576-580).
  - Consumers: ship's confirm and reject, and headless runs.
- **Task 13:**
  - Touches the `bkit-build.md` Decision Pause (159-388): step 2, step 4, step 6 (277-281), the step 8 handover and the gate box (383).
  - Removes `compose`, `composeItems` and `itemLines`.
  - Consumers: the resume flow (57-76), the subagent Read globs `build-decision-{RUN}-*.md (highest number)`, the `bkit-build.none.txt` render baseline, and the Local Instructions entries 10188, 10248 and 10299.
- **Task 14:**
  - Touches the `workflow-error-file` clause (instructions.md:5750-5757) in five workflows, plus `bkit-auto.md`, `.bkit/core/.bkit/workflows.md:807` and the Local Instructions entry 9966.
  - Consumers: `workflows fail --error-file`, and the render baselines for design, plan, build, debug and ship.
- **Task 15:**
  - Touches `cli.md`, `workflows.md`, `prompts.md`, `docs/testing.md` and the text ceilings.
  - Also runs `bkit upgrade` and the gate.

## CRITICAL

1. **(plan edit) Task 8's DONE WHEN can never pass.**
   - `plan-v1-draft.md:728` greps `.bkit/core/engine` for renderResult, result-file or Fingerprint, and expects it to find "only the guard tests".
   - The word Fingerprint also appears in code that no task touches:
     - `worktreeFingerprint` (`.bkit/core/engine/commands/lib.ts:674`)
     - `chatFingerprint` (`run-facts.ts:331`)
     - `egressFingerprint` (`.bkit/core/engine/install/cloud-env.ts:657`)
     - `.bkit/core/engine/checks/before/files.ts:156` and `checks/before/index.ts:35,162`
   - Fix: narrow the grep to the removed names (`artifactFingerprint`, `fingerprintProblem`, `withFingerprint`, `FINGERPRINT`), or anchor it on `^Fingerprint:`.

2. **(plan edit) Task 15's DONE WHEN grep can never pass.**
   - `plan-v1-draft.md:857` greps the workflows, the prompts and `.bkit/instructions.md` for `error.md`, and expects no hits.
   - Task 14 (`plan-v1-draft.md:834`) writes `{workflow}-error.md` and `ship-error.md` into the `workflow-error-file` clause (instructions.md:5750-5757) and five workflows. The same pattern matches them.
   - Old wording kept under a clause's `retired` block matches as well.
   - Fix: grep only for the removed paths (`{OUTBOX_ROOT}/error.md`, `{OUTBOX}/stderr.log`).

3. **(plan edit) Task 2 breaks existing `steps finish` tests that it does not name.**
   - Its DONE WHEN (`plan-v1-draft.md:568`) says every existing `bkit steps finish` test passes.
   - Three fixtures declare `Failures` but have no section to count:
     - `verify-1.md` at `steps.test.ts:52` has `Failures: 2` and no `## Identified Gaps Log`. The test at 1083-1116 uses it and expects exit 0.
     - The challenge fixture `c1.md` at 1163-1179 has `CONCERNS` and `Failures: 1`, but no Findings Log.
     - The plan-review fixtures at 1181-1205 have `FAIL` and `Failures: 1`, but no `## CRITICAL`.
   - Under the new count check all three exit 6.
   - Fix: give Task 2 UPDATE lines that name each fixture, its test and the section it gains. The change is then planned and reviewed, not left to the code step.

4. **(plan edit) The prompts would still ask agents for a count that the engine now refuses.**
   - Clause `set-failures` (instructions.md:3645-3651) says Failures counts "only complete" findings. Carriers: plan-review-1:92, plan-review-2:88, scope-check:84, challenge-1:89, challenge-2:96.
   - Clause `challenge-incomplete` (3899-3905) says a finding with an empty field does not count. Carriers: challenge-1:85, challenge-2:92.
   - Task 2's check counts every top-level item under `## CRITICAL` and every CRITICAL task block.
   - So a report that follows the prompt (an incomplete finding left in place and not counted) is refused with exit 6 and asked again. No task edits either clause.
   - Fix: in Task 1 (or 3), rewrite both clauses to match the counting rule, move the old wording to `retired`, and add a guard test.

5. **(plan edit) The verify count rule miscounts its own section.**
   - Task 1 declares `<count of lines under ## Identified Gaps Log>` (`plan-v1-draft.md:546`).
   - The section placeholder (`.bkit/core/prompts/bkit-build-plan-verify.md:167`) asks for "the gap count, and a brief description of each gap". So a correct report holds a count line plus the gap lines, and integration lines as well.
   - Counting every line makes a correct report fail.
   - Fix:
     - The rule counts only lines ending `Fixable: true` or `Fixable: false`.
     - Task 1 edits the placeholder to match.
     - Task 2's test covers a report that has a count line.

6. **(plan edit) Working out Status when the file is read reopens a pause the owner answered with "Try again".**
   - Today, step 6 has the orchestrator write `Status: DECIDED` by hand (`.bkit/core/workflows/bkit-build.md:281`), even when the owner answered only the loop question.
   - Task 13 makes step 6 write no Status line (`plan-v1-draft.md:809`). Task 9 then works out the status with `statusOf`, which returns OPEN while any item has no Decision line (`decisions.ts:76-79`).
   - A Try again answer leaves the other items undecided on purpose: see `applyRecommendations` (`decisions.ts:273-274`) and the test at `decisions.test.ts:1516-1532`.
   - `openDecision` then returns the old pause as OPEN on every later resume (`open-decision.ts:224-227`), and the run asks it again.
   - No Derived Test Matrix row covers this.
   - Fix: define the status of a pause whose loop answer is Try again as DECIDED, as today, and add a matrix row and a test in Task 9.

7. **(plan edit) Nobody is allowed to write the owner's answer to the loop question.**
   - The loop question `Q1` lives in the `-engine.md` file, which only the engine writes (`plan-v1-draft.md:166`).
   - Task 10's `decisions check` refuses a `Q1` in the orchestrator's file (`plan-v1-draft.md:768`).
   - Plan line 207 says the orchestrator writes "only the owner's answers in its own file".
   - Yet step 6 (`bkit-build.md:280`) adds `Decision: Try again|Decide` under the loop question. `skipProblem` (`open-decision.ts:172-174`), `gateRerun` and `applyRecommendations` all read that line.
   - Fix: name the writer, with a test. Two options:
     - A `decisions apply --by=owner --q=1 --answer=` form that writes the answer into the engine file.
     - Allow a Q1 that holds only a Decision line in the orchestrator's file, and say that `check` accepts it after step 6.

8. **(plan edit) Three callers of the decision readers still read only one file.** Task 9 (`plan-v1-draft.md:746`) moves `gateRerun` and `skipProblem` onto the reader that merges both files, but these callers are left out:
   - `status.ts:889-891` passes only the orchestrator file's text to `gateRerun`. There, `hasLoop` means a `## Progress` block before the first item (`open-decision.ts:116`), so it is false and a red-gate pause never re-runs its gate on resume.
   - `continueCheck` at `steps.ts:1113` passes only that text to `skipProblem`, so the loop "Decide" check is silently skipped.
   - The summary's decision-file list at `workflows.ts:1809` matches `-engine.md` files too, so the engine's items are read twice.
   - If `skipProblem` and `gateRerun` change signature, these callers stop compiling; if not, they read the wrong file.
   - No matrix row covers `openDecision`, `gateRerun` or `skipProblem` with the two-file layout.
   - Fix: add the three callers to Task 9, plus a matrix row and a test for each reader.

9. **(plan edit) `decisions loop` cannot know how many questions the orchestrator asked.**
   - The loop question's options and recommendation depend on the item count:
     - With items the options are `[Try again, Decide]`; without, `[Try again, Stop]` (`decisions.ts:491-496`).
     - A base check of `all` recommends Decide or Stop by the count (`decisions.ts:456`, `501`).
   - Task 11's flags (`plan-v1-draft.md:781`) give it no source for the items. Its DONE WHEN keeps the orchestrator's file byte-identical, without saying that the verb reads it.
   - Two moved compose cases cannot be written against that signature: "base check all with no items recommends Stop" (`decisions.test.ts:858`) and "with items recommends Decide" (866).
   - Fix: say that `loop` reads the question count from the `--out` file, so step 2 must write that file first, and name both cases on Task 11's TEST FIRST.

10. **(plan edit) Task 6 repeats a known-broken pattern: an import cycle among the workflow command modules.**
    - The new `ledgers findings` verb makes `ledgers.ts` import `issues.ts` (`plan-v1-draft.md:645`).
    - Existing imports: `locks.ts:38` imports `./ledgers.js`, `tracker.ts:28` imports `./locks.js`, and `issues.ts` imports `tracker.ts`. The last edge was traced earlier in this review. That import is a multi-line one, so it still needs a one-line check.
    - The new edge closes the loop ledgers -> issues -> tracker -> locks -> ledgers.
    - Knowledge row `workflow-ledgers-importing-tests-closes-a-steps-cycle` records that such a cycle passes the source tests and fails only in the built CLI, with a TDZ error.
    - The plan does not acknowledge the row, and DONE WHEN has no check on the built CLI.
    - Fix: put `parseAuditReport` in a leaf module that both files can import, or add `node dist/cli.js help` and `bkit ledgers findings` on the built CLI to Task 6's DONE WHEN.

11. **(plan edit) Deleting clause and workflow lines leaves stale Local Instructions entries, and the sync step the plan relies on does not remove them.**
    - Tasks 3, 4, 8, 13 and 14 delete clauses and workflow lines (`plan-v1-draft.md:579-589`, 603, 724). The plan says `pnpm instructions:sync` handles the clause lines.
    - `syncClauses` only rewrites retired wording and near-copies. It never deletes a carrier line (`.bkit/core/engine/tools/instructions.ts:982-1015`).
    - A local entry whose line is gone fails at `instructions.ts:1436` ("local entry no longer in the file").
    - Entries hit: instructions.md 9966, 10188, 10248, 10299, 10404, 11068 and 11358.
    - Knowledge rows `instructions-store-clause-text-and-local-entries-need-hand-edits` and `renumbering-a-workflow-leaves-instructions-md-local-entries-stale` describe exactly this. The plan does not acknowledge them.
    - Fix: each task removes its carrier lines and local entries by hand, and adds `instructions-coverage.test.ts`, `instructions.test.ts` and `instructions-sources.test.ts` to its DONE WHEN.

12. **(plan edit) No task updates the render baselines, so Task 15's gate cannot pass.**
    - `.bkit/core/engine/render/trackers.test.ts:403-420` byte-matches `__snapshots__/bkit-{design,plan,build,debug,ship}.none.txt` with `toMatchFileSnapshot`.
    - Those files hold 37 copies of text that Tasks 4, 13 and 14 remove: the Result lines, the renders, `decisions compose` and the outbox error file.
    - No task names updating them, and Task 15's DONE WHEN (`plan-v1-draft.md:857`) needs `pnpm bkit:gate:static-unit-integration` to pass.
    - Fix: Tasks 4, 13 and 14 each update the baselines that their edit changes, reviewed as a diff.

## OPTIONAL

- **Task 4's line anchors in bkit-build.md swap two lines.**
  - The Result lines are 797, 971, 1105, 1110 and 1220, and the renders are 800, 974, 1113, 1114 and 1223. `plan-v1-draft.md:606` lists 1113 as a Result line and 1110 as a render.
  - The prose line 1111 ("Once the subagents return, render...") also has to go.
  - The anchors are relative to the base commit, per knowledge row `plan-line-anchors-are-basesha-relative`.
- **Step 8's handover is missing the engine file.** The Decision Pause handover names "the decision file plus the line". It should also name the `-engine.md` file, so that a resumed session shows the loop question.
- **The subagent Read globs now also match the engine file.** The globs `build-decision-{RUN}-*.md (highest number)` in bkit-build.md also match `-engine.md` files. Exclude those files, or name both.
- **The reply trailer loses its writer.** `compose` wrote "Reply with a letter per question..." (`decisions.ts:507-509`). Task 13 should say who writes it now.
- **`Source changed` has no named owner file.** It records an engine fact (did the last round change code), but it stays an orchestrator header. Say which file owns it, since `skipProblem` refuses when it is missing (`open-decision.ts:176-178`).
- **The new challenge verdict check needs a defined error path.** Say what it does when `parseFindings` throws on an incomplete block: exit 22 as today, or ask the agent again.
- **The ship deferred-sweep prompt needs a decision.** `bkit-ship-deferred-sweep.md:117` keeps `Failures: <integer >= 0>`. Either scope Task 1's guard test so it does not demand a count rule there, or give that prompt a count rule.
- **Reports written before this change.** Runs paused before this change hold reports whose Failures counted every severity, and a resume that finishes such a report again would now be refused. A matrix row for running finish on a report the old render wrote would make the behaviour explicit.
- **Multi-agent Failures summing has no test.** A multi-agent `finish` sums Failures across agents. Add a two-agent case to Task 2's test, so the per-agent count check gets exercised.

## OUT OF SCOPE

- Moving the other `.git/bkit-outbox` markdown writes into the log folder. The plan already lists this as out of scope.
- #1016 items 2-4, which the plan keeps with #1016.

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** Task 8 DONE WHEN grep for Fingerprint can never pass
  **Severity:** CRITICAL · **Class:** unpassable-check · **Fixable:** true · **Location:** `docs/plans/202611/logs/958-agents-orchestrator-write/plan-v1-draft.md:728` · **Round:** 1
  - **DONE WHEN:** Task 8's DONE WHEN greps only the removed names (artifactFingerprint, fingerprintProblem, withFingerprint, FINGERPRINT, renderResult, result-file) or anchors on ^Fingerprint:, so worktreeFingerprint (lib.ts:674), chatFingerprint (run-facts.ts:331), egressFingerprint (install/cloud-env.ts:657) and checks/before/files.ts:156 do not match
  - **TEST FIRST:**
<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->
- [ ] **TASK 2:** Task 15 DONE WHEN grep for error.md matches the names Task 14 writes
  **Severity:** CRITICAL · **Class:** unpassable-check · **Fixable:** true · **Location:** `docs/plans/202611/logs/958-agents-orchestrator-write/plan-v1-draft.md:857` · **Round:** 1
  - **DONE WHEN:** Task 15's DONE WHEN greps only for the removed paths ({OUTBOX_ROOT}/error.md, {OUTBOX}/stderr.log), not the bare pattern error.md that matches {workflow}-error.md and ship-error.md written by Task 14 and retired clause wording in .bkit/instructions.md
  - **TEST FIRST:**
<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->
- [ ] **TASK 3:** Task 2 breaks existing steps finish fixtures it does not name
  **Severity:** CRITICAL · **Class:** unnamed-broken-tests · **Fixable:** true · **Location:** `docs/plans/202611/logs/958-agents-orchestrator-write/plan-v1-draft.md:568` · **Round:** 1
  - **DONE WHEN:** Task 2 carries UPDATE lines naming the steps.test.ts fixtures and tests it breaks (verify-1.md at steps.test.ts:52 used by 1083-1116; challenge c1.md at 1163-1179; plan-review fixtures at 1181-1205) and the counted section each gains
  - **TEST FIRST:**
<!-- bkit:task 3 end -->

<!-- bkit:task 4 start -->
- [ ] **TASK 4:** set-failures and challenge-incomplete clauses contradict the new count rule
  **Severity:** CRITICAL · **Class:** contract-mismatch · **Fixable:** true · **Location:** `.bkit/instructions.md:3651` · **Round:** 1
  - **DONE WHEN:** A task rewrites clauses set-failures (instructions.md:3645-3651) and challenge-incomplete (3899-3905) to match the engine's count of every top-level CRITICAL item or CRITICAL task block, moves the old wording to retired, syncs the carriers, and adds a guard test
  - **TEST FIRST:**
<!-- bkit:task 4 end -->

<!-- bkit:task 5 start -->
- [ ] **TASK 5:** Verify count rule counts every line, but the placeholder asks for a gap-count line
  **Severity:** CRITICAL · **Class:** unpassable-check · **Fixable:** true · **Location:** `docs/plans/202611/logs/958-agents-orchestrator-write/plan-v1-draft.md:546` · **Round:** 1
  - **DONE WHEN:** The verify count rule counts only lines ending Fixable: true or Fixable: false, Task 1 edits the Identified Gaps Log placeholder at bkit-build-plan-verify.md:167 to match, and Task 2's test covers a report with a count line
  - **TEST FIRST:**
<!-- bkit:task 5 end -->

<!-- bkit:task 6 start -->
- [ ] **TASK 6:** Computed Status reopens a pause answered Try again
  **Severity:** CRITICAL · **Class:** behaviour-regression · **Fixable:** true · **Location:** `docs/plans/202611/logs/958-agents-orchestrator-write/plan-v1-draft.md:809` · **Round:** 1
  - **DONE WHEN:** The plan defines the computed status of a pause whose loop answer is Try again as DECIDED (as bkit-build.md:281 does today), with a Derived Test Matrix row and a Task 9 test showing openDecision does not return it after the answer
  - **TEST FIRST:**
<!-- bkit:task 6 end -->

<!-- bkit:task 7 start -->
- [ ] **TASK 7:** No writer for the owner's answer to the loop question Q1
  **Severity:** CRITICAL · **Class:** missing-writer · **Fixable:** true · **Location:** `docs/plans/202611/logs/958-agents-orchestrator-write/plan-v1-draft.md:768` · **Round:** 1
  - **DONE WHEN:** The plan names who writes the owner's Decision line for Q1 (for example decisions apply --by=owner --q=1 --answer= writing into -engine.md, or a Decision-only Q1 that decisions check accepts after step 6), and a test covers skipProblem and gateRerun reading it
  - **TEST FIRST:**
<!-- bkit:task 7 end -->

<!-- bkit:task 8 start -->
- [ ] **TASK 8:** Decision-reader callers left on single-file reads
  **Severity:** CRITICAL · **Class:** missing-consumer · **Fixable:** true · **Location:** `docs/plans/202611/logs/958-agents-orchestrator-write/plan-v1-draft.md:746` · **Round:** 1
  - **DONE WHEN:** Task 9 updates status.ts:889-891 (gateRerun), steps.ts:1113 (continueCheck/skipProblem) and workflows.ts:1809 (summary decisionFiles skips -engine.md), with a matrix row and test each for openDecision, gateRerun and skipProblem on the two-file layout
  - **TEST FIRST:**
<!-- bkit:task 8 end -->

<!-- bkit:task 9 start -->
- [ ] **TASK 9:** decisions loop has no item-count input for the Decide/Stop branch
  **Severity:** CRITICAL · **Class:** missing-input · **Fixable:** true · **Location:** `docs/plans/202611/logs/958-agents-orchestrator-write/plan-v1-draft.md:781` · **Round:** 1
  - **DONE WHEN:** Task 11 says decisions loop reads the question count from the --out decision file (step 2 writes it first), and names the moved cases 'base check all with no items recommends Stop' (decisions.test.ts:858) and 'with items recommends Decide' (866) on its TEST FIRST
  - **TEST FIRST:**
<!-- bkit:task 9 end -->

<!-- bkit:task 10 start -->
- [ ] **TASK 10:** ledgers.ts importing issues.ts closes an import cycle (known-broken pattern)
  **Severity:** CRITICAL · **Class:** known-failure-reentry · **Fixable:** true · **Location:** `docs/plans/202611/logs/958-agents-orchestrator-write/plan-v1-draft.md:645` · **Round:** 1
  - **DONE WHEN:** parseAuditReport lives in a leaf module both ledgers.ts and issues.ts import, or Task 6's DONE WHEN runs node dist/cli.js help and bkit ledgers findings on the built CLI, acknowledging knowledge row workflow-ledgers-importing-tests-closes-a-steps-cycle (issues.ts -> tracker.ts edge traced earlier; needs a one-line confirmation)
  - **TEST FIRST:**
<!-- bkit:task 10 end -->

<!-- bkit:task 11 start -->
- [ ] **TASK 11:** Deleted clause and workflow lines leave stale Local Instructions entries
  **Severity:** CRITICAL · **Class:** known-failure-reentry · **Fixable:** true · **Location:** `docs/plans/202611/logs/958-agents-orchestrator-write/plan-v1-draft.md:579` · **Round:** 1
  - **DONE WHEN:** Tasks 3, 4, 8, 13 and 14 remove their carrier lines and Local Instructions entries by hand (instructions.md 9966, 10188, 10248, 10299, 10404, 11068, 11358) and list instructions-coverage.test.ts, instructions.test.ts and instructions-sources.test.ts in DONE WHEN, acknowledging the two knowledge rows
  - **TEST FIRST:**
<!-- bkit:task 11 end -->

<!-- bkit:task 12 start -->
- [ ] **TASK 12:** Render baselines are never regenerated
  **Severity:** CRITICAL · **Class:** unpassable-check · **Fixable:** true · **Location:** `docs/plans/202611/logs/958-agents-orchestrator-write/plan-v1-draft.md:612` · **Round:** 1
  - **DONE WHEN:** Tasks 4, 13 and 14 each update the __snapshots__/bkit-{design,plan,build,debug,ship}.none.txt baselines their edits change (trackers.test.ts:403-420), reviewed as a diff, so Task 15's pnpm bkit:gate:static-unit-integration can pass
  - **TEST FIRST:**
<!-- bkit:task 12 end -->
