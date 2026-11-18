Verdict: CONCERNS
Failures: 6
Redesign: false
Fingerprint: a238d581e0323d4bf2241e7c7f031ca2ddbf2e765ff1e37b5c2112044a569dde
<!-- verdict:end -->

# Plan Review

Lens: Regression risk — touched surfaces, backwards compatibility, design-coverage.

## Scope

Reviewed `docs/plans/202611/logs/1008-plan-design-owner/plan-v1-draft.md` (6 tasks in 2 groups) against `plan-input-1.md`, the `related-*` files and the current code on `feat/1008-plan-design-owner`. The orchestrator's constraints from the run's brief were checked as part of the review.

## Notes

- Docs loaded: `.agents/docs.md`; `docs/testing.md` § Which tier does a behaviour need?, § Tiers, § Routine tracker reporting coverage and § Spawning `bkit` from tests. Tier names used: Unit and Integration (`docs/testing.md:589-590`).
- Design coverage (Process step 7): no design artifact exists for this FID (`docs/plans/202611/1008-plan-design-owner-design.md` is absent and the input references none), so the step does not apply.
- `related-issues.md` reads `Search unavailable`; `related-deferrals.md` and `related-failures.md` read `None.`; `related-knowledge.md` (138 rows) was searched for tracker, progress, session, publication, close and tracker-marker rows.
- Evidence gaps: this agent has no shell, so the word totals (58536 and 86494), prettier and the none-render baselines were reasoned from source, not run. Issue #1005's text was not readable (GitHub MCP unavailable); its fit was judged from the plan's own section and `plan-input-1.md`.
- Orchestrator constraints met: the #1005 fit is stated (Context & Goals); the run link lives on the run's `status.jsonl` start row; the `Removes:` line names the path-hash derivation and the latest-5-comments fallback; both word totals are named and do not grow; no new verb and no new run proof. Missed: Q1 (CRITICAL 1).

## Surface-Area Map

**Task 1 — status fold**

- Edits `StatusEvent` (`.bkit/core/engine/ledgers/status.ts:383-397`) and `fold` (`status.ts:423-465`); `WorkflowRun` gains an optional `progress`.
- Consumers: every fold reader, among them `readRunsLenient` (`.bkit/core/engine/commands/workflow/locks.ts:285-296`, used by `progressBinding`, `commentKey` and `bindRunPublication`) and the `readRuns` / `runNumber` users in `steps.ts`, `counters.ts`, `workflows.ts` and `status.ts`. Dedup identity ignores the field (`status.ts:401-407`). The `workflow-meta` merge (`status.ts:453-458`) could overwrite it; no meta row carries `progress` today.
- The only writer of `workflow-started` rows is `workflows start` (`workflows.ts:2151-2158`). Raw-row readers: the cloud template's jq (`.bkit/templates/.github/workflows/bkit-cloud.yml:665`, reads `type` and `at` only) and `checks/status-holes.ts`. The field is additive; older engines ignore it.

**Task 2 — session id and session link**

- `newSessionDir` (`commands/workflow/repo.ts:113-130`); its only caller is `repo info` (`repo.ts:236`); pruning is unchanged (`repo.ts:116-122`).
- `sessionPublication` (`tracker.ts:2037-2049`). Callers: `postForVerb` (`tracker.ts:2146-2161`, every post without `--file`: Step 1 reports, `workflows close --post`, `workflows fail --post` before a status file exists, handover), `bindRunPublication` (`tracker.ts:2068`, deleted in Task 3) and the new call in `workflows start`.
- New failure branch: an existing session folder with no `progress-id` now throws; today the function hashes the path and succeeds.
- Unchanged: the session proof in `commentRunProof` (`tracker.ts:2001-2009`).

**Task 3 — start row and its readers**

- `workflows start` (`workflows.ts:2141-2165`): builds the row, appends it (`:2158`), then calls `bindRunPublication` (`:2163`, imported at `:151`). Every phase workflow runs it with `--session-dir` and `|| exit 1` (for example `.bkit/core/workflows/bkit-plan.md:240`; `catalog-parity.test.ts:154-158` asserts the flag).
- `progressBinding` (`tracker.ts:1425-1493`): the path-hash fallback (`:1455`) and the outbox cache read (`:1456-1462`) are replaced. Its result decides append against standalone, and which progress file `seal()` deletes for attention and terminal posts (`postCommentOnce`, `tracker.ts:1691-1699`, `:1724`), including the build's terminal Create PR post (`.bkit/core/workflows/bkit-build.md:1471`).
- Deleted: `runPublicationFile` and `bindRunPublication` (`tracker.ts:2051-2086`) with the `bkit-outbox/invocations/` cache.

**Task 4 — post key**

- `runActionKey`, `endedRunActionKey`, `commentKey` (`tracker.ts:2092-2126`); the status proof in `commentRunProof` (`tracker.ts:2015`); the `issues comment` key choice (`issues.ts:1347-1350`); the `failVerb` key (`workflows.ts:420-426`).
- `--file` posts in shipped workflows: ship Step 1 after its start (`bkit-ship.md:215`, `:238`), the build's terminal Create PR after close (`bkit-build.md:1471`) and the two new Owner Answers lines. None posts before its own `workflows start`, so the plan's assumption holds.
- Not a caller: `steps finish --post` builds its key with `runNumber` directly (`steps.ts:1658-1665`) and is unchanged.
- Key shape: `actionKey(workflow, run, kind, step, subStep, attempt, comment)` (`status.ts:655-656`, parts at `issues.ts:1340-1345`), so every Owner Answers round of one run gets the key `plan/1/step/8/-/-/comment`; rounds differ by body hash (`alreadyDone`, `status.ts:681-685`; section id, `tracker.ts:1558-1566`).

**Task 5 — workflow lines**

- `bkit-plan.md:529-563` (Step 8 sub-step 8: plan-check route `:552-556`, commit clause `:557`, tracker block `:558-563`); `bkit-design.md:623-648` (no plan-check route).
- Consumers: shared clauses `workflow-owner-answers-*` (`.bkit/instructions.md:7373-7429`) and the close-route clauses (`.bkit/instructions.md:10743`, `:10745`); the none-render baselines (`.bkit/core/engine/render/trackers.test.ts:403-420`, `__snapshots__/bkit-plan.none.txt:432-441`); `catalog-parity.test.ts:136-159`; `workflow-shape.test.ts:1574-1579`; the host mirrors through `upgrade`; the workflow word total.

**Task 6 — docs**

- `.bkit/core/.bkit/trackers.md:25`, `.bkit/core/.bkit/workflows.md:290` and `:476`, `docs/architecture.md:27`, `docs/security.md:66`, `docs/testing.md:860-862`; rendered `.bkit/trackers.md` and `.bkit/workflows.md`.

**High-risk surfaces flagged:** `fold` (the shared reader of all run state), `workflows start` (the entry of every phase run), `sessionPublication` and `progressBinding` (shared by every tracker post), and the committed, union-merged `status.jsonl` row shape. Each is covered by a matrix row or named in a CRITICAL below; the remaining risk is listed under OPTIONAL.

## CRITICAL

1. **Q1 Narrative is not taken as assumed (orchestrator constraint)** (plan edit). The brief requires an open question with a recommended answer to be taken as assumed, with the plan saying so. Q1 recommends A but reads `Default if unanswered: the plan stops at Gate 1 until you answer` (`plan-v1-draft.md:157`), and the Narrative still reads MISSING (`plan-v1-draft.md:48`). Fix: set Q1's default to assumed A, write option A's sentence into the Narrative, and mark it as assumed until the owner answers.
2. **The plan Step 8 exit-0 route skips the moved Owner Answers post** (plan edit). Task 5 moves the tracker block above the commit bullet, which in `bkit-plan.md` puts it between the plan-check route and the commit. The route's success line reads `**If** exit 0 → the commit below.` (`.bkit/core/workflows/bkit-plan.md:553`), so an agent following it jumps over the comment, and nothing follows the commit: the post this plan fixes is never made. No matrix row exercises the route, and Task 5's test checks only the flag and the order. Fix: in Task 5, reword that line so exit 0 continues with the next bullet (for example `→ the next bullet.`, the same three words, so the 58536 total holds and the none render still reads correctly); extend the Task 5 workflow-shape test, or add a TEST FIRST, asserting that the exit-0 route does not name the commit while the comment sits between them; keep both `commit nothing from this round` routes as they are (`workflow-shape.test.ts:1579` pins them; they are shared clauses at `.bkit/instructions.md:10743`, `:10745`). Design Step 12 has no such route (`bkit-design.md:637-642`).
3. **The new no-`progress-id` failure path in `sessionPublication` and `workflows start` has no test** (plan edit). Today `workflows start` appends the row first, and `bindRunPublication` swallows every error (`workflows.ts:2158-2163`, `tracker.ts:2079-2085`). Task 2 makes `sessionPublication` throw for an existing session folder with no `progress-id` (a folder from an older engine, the Edge Case at `plan-v1-draft.md:90`), and Task 3 calls it before the row is written, routing the error through `commentDiagnostic` and writing the row without `progress` (`plan-v1-draft.md:453`). That catch is the only thing between the new throw and a failed `workflows start`, which every phase workflow runs with `|| exit 1` (`bkit-plan.md:240`); yet no Derived Test Matrix row (`plan-v1-draft.md:104-117`) exercises it, and neither the Task 2 nor the Task 3 TEST FIRST names it. Fix: add matrix rows and TEST FIRST entries. Task 2, `tracker.test.ts`: a session folder with no `progress-id` gives no link (fails today, because `tracker.ts:2045-2048` hashes the path and returns one). Task 3, `workflows.test.ts` or `tracker.integration.test.ts`: `workflows start --session-dir` naming an existing folder with no `progress-id` exits 0, writes the `workflow-started` row without `progress` and records a `comment-association` friction row (fails today on the missing friction row).
4. **Task 5 moves an indented tracker block without the known-gotcha checks** (plan edit). ACTIVE knowledge rows `kn-43-prettier-blank-lines-around-bkit-tracker-markers-and-e` and `wording-retired-prefix-of-new-text-and-loose-list-items` say one blank line inside a marker-bearing list item makes prettier pad every block in it, and the render then leaves doubled blank lines in the mirrors; their fix is a tight block, `prettier --check` and a read of the none-render baseline diff. Task 5 moves the `bkit:tracker true` block inside list item 8 of both workflows (`bkit-plan.md:558-563`, `bkit-design.md:643-648`), cites neither row, and its DONE WHEN runs neither check. Fix: Task 5 READs both rows, and its DONE WHEN adds `pnpm exec prettier --check .bkit/core/workflows/bkit-plan.md .bkit/core/workflows/bkit-design.md` and `pnpm bkit:test:file .bkit/core/engine/render/trackers.test.ts`, with the none baselines unchanged except the one route line CRITICAL 2 rewords (`__snapshots__/bkit-plan.none.txt:437`, reviewed before `vitest -u`).
5. **Tasks 3 and 4 touch the terminal-post seal without acknowledging its prior fix** (plan edit). ACTIVE knowledge row `workflow-push-retry-keeps-close-effects-and-original-return-once` says to bind the final publication to the ended run to seal its progress cache. Today that is the `endedRunActionKey` branch for terminal posts (`issues.ts:1347-1349`) plus `progressBinding` resolving the session link, so `seal()` deletes the run's progress file (`tracker.ts:1691-1699`, `:1724`). Task 4 deletes `endedRunActionKey` and Task 3 changes where `progressBinding` gets the link; the seal still works only while the start row's `progress` equals the session link the earlier posts used. The plan cites neither the row nor its guard test `keeps published build completion and PR links in one terminal comment` (`tracker.integration.test.ts:457-505`, asserting an empty progress folder at `:504`). Fix: cite the row in Tasks 3 and 4, and name that test in both DONE WHEN fields.
6. **Task 6's DONE WHEN grep cannot pass** (plan edit). `grep -rln 'run association' docs .bkit/core/.bkit` always lists files under `docs/plans/**` that no task edits, for example `docs/plans/202611/826-append-routine-workflow-plan.md:77` and `docs/plans/202611/826-append-routine-workflow-design.md:242`, and this plan's own text, which says the old docs place the run association in `bkit-outbox` (`plan-v1-draft.md:269`, `:520`). Fix: scope the check to the files Task 6 edits, for example `grep -n 'bkit-outbox' docs/architecture.md docs/security.md .bkit/core/.bkit/trackers.md .bkit/core/.bkit/workflows.md` shows no sentence placing the run link or invocation files in the outbox.

## OPTIONAL

- **Row 12 already passes and has no writer.** The new `tracker.integration.test.ts` row for a `--file` post whose status file holds no run of `--workflow` sits only in Task 4's DONE WHEN. The current code already refuses that post (`tracker.ts:2010-2017`), and the unit test `status proof accepts a status file with a run of the workflow and refuses a missing file or one without that run` (`issues.test.ts:1065-1088`) covers it. Name the existing test, or say which step writes the new one.
- **Pin the expected `progress` value to the code, not a hand-written hash.** The plan does not fix the byte layout of the id-and-workflow hash. Task 3's start-row test should compare against `sessionPublication(...)?.invocation` or the `bkit:progress` marker of the Step 1 post, never a separately computed `actionHash` string.
- **Edge-case wording.** `Each round's post gets its own engine-action key` (`plan-v1-draft.md:87`) is not what the code does: all rounds share the key `plan/1/step/8/-/-/comment` and differ by body hash (`status.ts:655-656`, `:681-685`; `tracker.ts:1558-1566`). Reword it, and let the two-round test assert two `engine-action` rows with the same key and different hashes.
- **Coupling to #1005.** Task 5's new workflow-shape test pins the `issues comment` Owner Answers line. When #1005 replaces those lines with its answers command, #1005 has to take that test over or delete it; say so under How this fits #1005.
- **Success criterion 1 still says `--session-dir`.** With Q2 A assumed, restate it as the plan Step 8 and design Step 12 post, so the acceptance contract matches the Task 4 test, which posts with `--file`.
- **Graph refresh placement.** Documentation Consultation says Tasks 3 and 4 run `pnpm bkit:graph:refresh` (`plan-v1-draft.md:268`), but only Task 4's DONE WHEN does. Align the two.
- **Failed plan-check routes and the post.** The `commit nothing from this round` routes (`bkit-plan.md:554`, `:556`) do not say whether to post. With the comment now above the commit, an agent may still post answers whose plan edit never landed. The wording is a shared clause pinned by `workflow-shape.test.ts:1579`, so a change goes through `.bkit/instructions.md` § Clauses and names that test.
- **Runs in flight across the upgrade.** A run whose link sits only in the old `bkit-outbox/invocations/` cache opens one fresh progress comment. The plan accepts this (`plan-v1-draft.md:171`); a one-time read of the legacy cache would avoid it but conflicts with the `Removes:` line, so leaving it is reasonable.

## OUT OF SCOPE

- A resumed run with a new session could adopt the new session's link, so the resumed Step 1 report and the later reports share one comment; today and under this plan the run keeps its first link.
- `.bkit/core/.bkit/workflows.md:474` says every workflow step posts a new tracker comment and no bodies are concatenated, which no longer matches routine append; a docs fix for another issue.
- Q3 B, posting the Close Workflow comment as a routine report so the answers join the progress comment in real runs, changes every workflow's close; it stays an owner decision.

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** Q1 Narrative is not taken as assumed (orchestrator constraint)
  **Severity:** CRITICAL · **Class:** plan edit · **Fixable:** true · **Location:** `docs/plans/202611/logs/1008-plan-design-owner/plan-v1-draft.md:157` · **Round:** 1
  - **DONE WHEN:** Q1 reads Default if unanswered: the plan assumes A; the Narrative (plan-v1-draft.md:48) holds option A's sentence marked as assumed until the owner answers.
  - **TEST FIRST:**
<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->
- [ ] **TASK 2:** The plan Step 8 exit-0 route skips the moved Owner Answers post
  **Severity:** CRITICAL · **Class:** plan edit · **Fixable:** true · **Location:** `.bkit/core/workflows/bkit-plan.md:553` · **Round:** 1
  - **DONE WHEN:** Task 5 rewords the exit-0 line so it continues with the next bullet (same word count), a Task 5 TEST FIRST or the extended workflow-shape test asserts the exit-0 route does not jump past the comment, and the reviewed bkit-plan.none.txt:437 baseline change is the only none-render diff for that line.
  - **TEST FIRST:**
    - .bkit/core/engine/audits/workflows/workflow-shape.test.ts
    - .bkit/core/engine/render/trackers.test.ts
<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->
- [ ] **TASK 3:** The new no-progress-id failure path in sessionPublication and workflows start has no test
  **Severity:** CRITICAL · **Class:** plan edit · **Fixable:** true · **Location:** `docs/plans/202611/logs/1008-plan-design-owner/plan-v1-draft.md:453` · **Round:** 1
  - **DONE WHEN:** The Derived Test Matrix and TEST FIRST lists hold a Task 2 tracker.test.ts test that a session folder with no progress-id gives no link, and a Task 3 test that workflows start --session-dir naming an existing folder with no progress-id exits 0, writes the workflow-started row without progress and records a comment-association friction row.
  - **TEST FIRST:**
    - .bkit/core/engine/commands/workflow/tracker.test.ts
    - .bkit/core/engine/commands/workflow/workflows.test.ts
<!-- bkit:task 3 end -->

<!-- bkit:task 4 start -->
- [ ] **TASK 4:** Task 5 moves an indented tracker block without the known-gotcha checks
  **Severity:** CRITICAL · **Class:** plan edit · **Fixable:** true · **Location:** `.bkit/core/workflows/bkit-plan.md:558` · **Round:** 1
  - **DONE WHEN:** Task 5 READs knowledge rows kn-43-prettier-blank-lines-around-bkit-tracker-markers-and-e and wording-retired-prefix-of-new-text-and-loose-list-items, and its DONE WHEN runs pnpm exec prettier --check on bkit-plan.md and bkit-design.md and pnpm bkit:test:file .bkit/core/engine/render/trackers.test.ts with the none baselines unchanged except the reworded route line.
  - **TEST FIRST:**
    - .bkit/core/engine/render/trackers.test.ts
<!-- bkit:task 4 end -->

<!-- bkit:task 5 start -->
- [ ] **TASK 5:** Tasks 3 and 4 touch the terminal-post seal without acknowledging its prior fix
  **Severity:** CRITICAL · **Class:** plan edit · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/issues.ts:1347` · **Round:** 1
  - **DONE WHEN:** Tasks 3 and 4 cite knowledge row workflow-push-retry-keeps-close-effects-and-original-return-once, and both DONE WHEN fields name the passing test keeps published build completion and PR links in one terminal comment (tracker.integration.test.ts:457-505).
  - **TEST FIRST:**
    - .bkit/core/engine/commands/workflow/tracker.integration.test.ts
<!-- bkit:task 5 end -->

<!-- bkit:task 6 start -->
- [ ] **TASK 6:** Task 6's DONE WHEN grep cannot pass
  **Severity:** CRITICAL · **Class:** plan edit · **Fixable:** true · **Location:** `docs/plans/202611/logs/1008-plan-design-owner/plan-v1-draft.md:520` · **Round:** 1
  - **DONE WHEN:** Task 6's DONE WHEN check names only the files Task 6 edits (docs/architecture.md, docs/security.md, .bkit/core/.bkit/trackers.md, .bkit/core/.bkit/workflows.md) instead of grep -rln over all of docs, which always matches docs/plans/** files no task edits.
  - **TEST FIRST:**
<!-- bkit:task 6 end -->
