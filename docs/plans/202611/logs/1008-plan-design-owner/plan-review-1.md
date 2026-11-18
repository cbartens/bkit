Verdict: CONCERNS
Failures: 4
Redesign: false
Fingerprint: 15744923cf519d8b95ef2f03114ec6e39e8f93eba436e3250fdb3db1882ada33
<!-- verdict:end -->

# Plan Review

Lens: Tightness — task dependency order, design-coverage.

**Scope:** `plan-v1-draft.md` for #1008, checked against the issue text in `plan-input-1.md`, the run brief's constraints and the code the plan names (`tracker.ts`, `issues.ts`, `workflows.ts`, `repo.ts`, `status.ts`, `bkit-plan.md`, `bkit-design.md`, `bkit-build-plan-tasks.md`). No design artifact exists for 1008 (no `docs/plans/*/1008*-design.md`), so the design-coverage steps run against the issue and the brief only.

**Notes:**

- Brief constraints: the #1005 fit is stated (`How this fits #1005`); the run link moves to the `workflow-started` row of `status.jsonl`, and a post with no proof is still refused (Task 4 tests); the `Removes:` line is present; the word change is named as zero for both totals; no new verb and no new proof. Q1 is the one miss (CRITICAL 1).
- Dependency graph: Task 1 produces `run.progress` in `fold`; Task 2 produces the `progress-id` file and a path-free `sessionPublication`; Task 3 consumes 1 and 2, writes `progress` on the start row and deletes `bindRunPublication` / `runPublicationFile`; Task 4 consumes 3, changes `runActionKey` and deletes `endedRunActionKey`; Task 5 consumes 4; Task 6 consumes 5. Every other consumed symbol is in the repo (`commentDiagnostic` `tracker.ts:1600`, `activeRunStart` `counters.ts:139`, `failVerb` `workflows.ts:354`, `issuesCommand` `issues.ts:1051`, `workflowsCommand` `workflows.ts:2045`). No cycle. Group caps hold (group 1: 4 tasks, 10 tests; group 2: 2 tasks, 1 test), and no group 1 test waits on a group 2 task.
- The two extra faults the plan fixes are not expansion. Once Q2 A is taken, a `--file` post after close keys `plan/2/...` (`runNumber`, `status.ts:610-613`), `progressBinding` finds no run 2 (`tracker.ts:1448-1450`) and opens a standalone comment, and the main checkout's path misses the path-keyed cache (`tracker.ts:1455-1462`). Both block the first criterion.
- Evidence gaps: this review had no shell, so the word totals 58536 / 86494 were not re-measured; `related-issues.md` reports the issue search unavailable, so open blocker issues could not be checked.

## CRITICAL

1. **Q1 does not take its recommended answer** (plan edit) — `plan-v1-draft.md:157`. The brief requires an open question with a recommended answer to be assumed in the plan, and names Q1. The draft keeps `Default if unanswered: the plan stops at Gate 1 until you answer`, and the Narrative at `:48` reads MISSING, so the run stops for a decision the brief has already settled. Fix: Q1's default reads `the plan assumes A`, and `### Narrative` holds option A's sentence, marked as assumed from Q1 A. The owner still confirms it through the Acceptance Scenario checkbox. The contract's MISSING rule bars an invented Narrative; the brief overrides it for this run.
2. **Task 2's `DONE WHEN` needs Task 4's code** (plan edit) — `plan-v1-draft.md:443`. Task 2 requires `pnpm bkit:test:file` to pass on the whole of `tracker.test.ts`. The tests step writes every group 1 `TEST FIRST` test before any code runs, so that file already holds Task 4's red `runActionKey names the latest run after it ended`, which only Task 4's code turns green. The code step must satisfy each task's `DONE WHEN` before it starts the next (`.bkit/core/prompts/bkit-build-plan-tasks.md:99`), so Task 2 cannot finish in runbook order. Fix: name the tests Task 2 must pass (its two `TEST FIRST` tests and the existing tests it keeps green) in place of the whole of `tracker.test.ts`, or leave whole-file passes to Task 4.
3. **Task 3's `DONE WHEN` needs Task 4's code** (plan edit) — `plan-v1-draft.md:460`. Task 3 requires the whole of `tracker.test.ts` to pass, which holds Task 4's unit test. It also requires the whole of `tracker.integration.test.ts`, which holds Task 4's `joins the run's progress comment with the Owner Answers after workflows close` and `keeps two Owner Answers rounds in one comment after a terminal close comment`. Fix: name Task 3's own four tests and the three existing integration tests it already lists. Also state that `keeps one progress comment when the status file moves to the main checkout` keeps the run `IN_PROGRESS` while the file moves. If the test moves the file through a close and `branches land`, its post's key needs Task 4's `runActionKey` change, and the test cannot pass at Task 3.
4. **Task 5's move takes the comment off the plan-check route** (plan edit) — `plan-v1-draft.md:498`. In `bkit-plan.md` Step 8 sub-step 8, the plan-check route reads `**If** exit 0 → the commit below.` (`.bkit/core/workflows/bkit-plan.md:553`). Task 5 puts the Owner Answers comment between that route and the commit bullet, so an agent that follows the route goes straight to the commit and skips the comment. The stop routes (`:554`, `:556`) say only "commit nothing from this round", so whether the comment posts on them is undefined. A post there leaves its `engine-action` row uncommitted in the main checkout's `status.jsonl` on `dev`. Fix: Task 5 re-points the exit 0 route to `the next bullet`, which keeps the word count and still reads right in the `none` render, where the comment block is stripped. It also says the stop routes post nothing, and the shape test asserts the route. The route line sits outside the tracker block, so Task 5 also updates `.bkit/core/engine/render/__snapshots__/bkit-plan.none.txt` and names `.bkit/core/engine/render/trackers.test.ts` (`none render baselines`) in its `DONE WHEN`. Design Step 12 sub-step 8 has no plan-check route, so only the plan workflow needs the route edit.

## OPTIONAL

- **Task 4's red reason is wrong for its first integration test** (`plan-v1-draft.md:484`). Before any group 1 code, a `--file` post writes no association friction, because `postForVerb` skips the session lookup whenever `o.file` is set (`tracker.ts:2146`). The red is the second comment only. Drop the friction half of the expected failure, or the red check reads a wrong cause.
- **Two answer rounds share one key** (`plan-v1-draft.md:87`). Both rounds key `plan/1/step/8/-/-/comment`; they differ only by body hash (`alreadyDone`, `status.ts:681`; section id = `actionHash(key, hash)`, `tracker.ts:1561`). Reword "its own engine-action key" to "its own engine-action row and section".
- **`repo info` still describes an empty session folder.** The `sessionDir` field text says "a new, empty folder per invocation" (`repo.ts:164`), which stops being true once Task 2 writes `progress-id`. Add it to Task 2's `UPDATE` lines.
- **The real tracked flow never takes the "appends to P" branch.** Step 8 sub-step 4 always posts the Close Workflow comment before any answers round whenever `ISSUE_ID` is set (`bkit-plan.md:520-525`), and terminal reports always open a new comment. So Concrete Example step 5's "appends to P when P is still the newest comment" never happens in a real run, and the first criterion's test proves only the issue's literal sequence. Make the example show the real flow (Q3 A). Have Manual Verification Step 3 check which comment the answers land in.
- **The #1005-first path has no owner.** If #1005 lands first, the post call moves into its answers command (engine code), and no task here covers it. "The engine work is unchanged" is true only for this plan's tasks. Say in `How this fits #1005` that the answers command must post with the run's status file, and must post before it commits, so its `engine-action` row lands in the commit.
- **One "new" test is green from the start.** `A --file post whose status file holds no run of --workflow exits 2` (matrix row, Task 4 `DONE WHEN`) already holds today, and `issues.test.ts:1065` (`status proof accepts a status file with a run of the workflow and refuses a missing file or one without that run`) covers it. Cite that test as kept green, or label the new one a regression guard so nobody looks for its red.
- **Stale line references.** The `.bkit/core/.bkit/workflows.md` tracker paragraph is line 45, not 44 (`plan-v1-draft.md:270`, `:402`, `:514`). `Documentation Consultation` says Tasks 3 and 4 refresh the graph (`:268`), but only Task 4's `DONE WHEN` runs `pnpm bkit:graph:refresh`.
- **Alternative: a `workflow-meta` row.** `fold` already merges `workflow-meta` fields onto the run (`status.ts:453-458`). Recording `progress` there would need no `fold` change (Task 1), and a resumed run that has no link could gain one. Trade-off: an extra row, against the start-row precedent (`parentSha`, `limits`) that decision `1008-run-progress-link-recorded-on-workflow-started-row` already chose.
- **Knowledge rows that apply.** `consumer-tests-guard-asserted-comment-prose`: Task 5's shape test should assert the flag, the route and the bullet order, not the bullet's prose. `tracker-post-unit-tests-clear-ambient-linear-credential`: any new unit test that posts clears `BKIT_LINEAR_API_KEY` in `beforeEach`.
- **Task 5 should run the `none` render baselines anyway.** Moving the tracker block can shift whitespace in the `none` render of both workflows, even without the CRITICAL 4 route edit. Add `.bkit/core/engine/render/trackers.test.ts` to Task 5's `DONE WHEN`.

## OUT OF SCOPE

- **The `steps` verbs' `--post` still keys the next run once a run ended.** It calls `runNumber` directly (`steps.ts:1658-1665`), not `runActionKey`, so this plan's latest-run rule does not reach it. No workflow posts through it after close today. Belongs in its own key-rule consistency issue.
- **Session-only posts always key run 1.** `postForVerb` builds `actionKey(publication.workflow, 1, ...)` for a session post with no file (`tracker.ts:2162-2174`), so it ignores which run of the workflow the session serves. No criterion here needs it. Belongs in its own issue.

## SUGGESTED SCOPE EXPANSION

None. `related-issues.md` reports the search unavailable; `related-deferrals.md` and `related-failures.md` read `None.`; no `related-knowledge.md` row is prior work on these surfaces. The plan's own candidates (#1005 item 4, deferral `918-ad-hoc-agent-challenge-low-bkit-core-engine-commands-workflow-tracker-ts-2019`) come from outside the `related-*.md` files, and their keep-separate recommendations hold.

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** Q1 does not take its recommended answer
  **Severity:** CRITICAL · **Class:** plan edit · **Fixable:** true · **Location:** `docs/plans/202611/logs/1008-plan-design-owner/plan-v1-draft.md:157` · **Round:** 1
  - **DONE WHEN:** Q1's `Default if unanswered` reads `the plan assumes A`, and `### Narrative` holds option A's sentence, marked as assumed from Q1 A.
  - **TEST FIRST:**
<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->
- [ ] **TASK 2:** Task 2's DONE WHEN needs Task 4's code
  **Severity:** CRITICAL · **Class:** plan edit · **Fixable:** true · **Location:** `docs/plans/202611/logs/1008-plan-design-owner/plan-v1-draft.md:443` · **Round:** 1
  - **DONE WHEN:** Task 2's DONE WHEN names the tests it must pass (its two TEST FIRST tests and the existing tests it keeps green) in place of the whole of `tracker.test.ts`, so no Task 4 test is in it.
  - **TEST FIRST:**
<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->
- [ ] **TASK 3:** Task 3's DONE WHEN needs Task 4's code
  **Severity:** CRITICAL · **Class:** plan edit · **Fixable:** true · **Location:** `docs/plans/202611/logs/1008-plan-design-owner/plan-v1-draft.md:460` · **Round:** 1
  - **DONE WHEN:** Task 3's DONE WHEN names its own four tests and the three existing integration tests in place of the whole of `tracker.test.ts` and `tracker.integration.test.ts`, and the moved-status-file test keeps the run IN_PROGRESS while the file moves.
  - **TEST FIRST:**
<!-- bkit:task 3 end -->

<!-- bkit:task 4 start -->
- [ ] **TASK 4:** Task 5's move takes the comment off the plan-check route
  **Severity:** CRITICAL · **Class:** plan edit · **Fixable:** true · **Location:** `docs/plans/202611/logs/1008-plan-design-owner/plan-v1-draft.md:498` · **Round:** 1
  - **DONE WHEN:** Task 5 re-points the plan-check exit 0 route (`.bkit/core/workflows/bkit-plan.md:553`) to the next bullet, says the stop routes post nothing, its shape test asserts the route, and it updates `.bkit/core/engine/render/__snapshots__/bkit-plan.none.txt` and names `.bkit/core/engine/render/trackers.test.ts` in its DONE WHEN.
  - **TEST FIRST:**
<!-- bkit:task 4 end -->
