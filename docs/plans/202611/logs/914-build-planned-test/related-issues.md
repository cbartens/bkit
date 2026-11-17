## #891 — Build: gate stuck on tests already red on dev, owner accept ignored (open)

## Rescope: no accepting red tests. Give better advice at the pause instead.

This replaces everything above it. The marker sits on the line above this heading, so the workflows read this comment and nothing earlier.

### What happened

A consumer's `dev` had 3 red unit tests that the build's branch did not cause. A clean `dev` checkout shows the same 3 failures: `Tests 3 failed | 8 passed (11)`. They were the consumer's own: a dead-code registry missing two new files, and a suppression-count ceiling that wasn't raised. `/bkit-build` built and verified task group 1, then its group gate (`bkit:gate:static-unit`) failed on those 3 tests. The first Decision Pause offered an `Accept`, and the owner took it. The gate failed again on the same tests. The second pause offered only `Try again` (a round that can't change anything) or `Stop`. Groups 2-6 never started.

### The shape stays

A failure a fix round can fix → `Try again`. A failure no round can fix → say so plainly, recommend `Stop`, and have the owner fix the cause first (here, `dev`) and then resume. That is the workflow's shape today. This issue does **not** add a way to accept red tests and build past them.

That is why the earlier design is dropped: accepted-failure records, `$BKIT_ACCEPTED_TESTS` passed into every test runner, and the same list passed through the pre-push hook. It only gets the branch *built*. CI on the PR runs the same red tests, so `/bkit-ship` still can't merge until `dev` is fixed. A lot of machinery for a branch that can't merge anyway.

### What's actually wrong (found by reading the code, not reproduced)

1. **"Try again or not" never asks why a test fails.** The loop question recommends from a trend alone (`loopTrend` / `loopProgress`, `.bkit/core/engine/commands/workflow/counters.ts:257-334`). After the first round it always recommends `Try again`. After that it recommends `Try again` only when there are fewer problems than the first round and the source changed in between; otherwise `Stop` / `Decide`. A test that also fails on `dev` can't be fixed by any round on this branch, and nothing checks for that.
2. **The pause's numbers ignore the group gate.** The verify loop's progress block counts the verify agent's problems, not the gate's failing tests (`LOOPS.verify.check` = `build-plan-verify`, `.bkit/core/engine/commands/workflow/decisions.ts:179`). In this run verify passed both rounds, so the pause showed "Problems after each round: 0 → 0" while 3 tests were red. The reason it gave ("another round is unlikely to close the remaining items") says nothing useful.
3. **"Stop, fix `dev`, resume" can loop on the old pause.**
   - Picking up the fix works in worktree mode. On every resume, Step 2's `bkit worktrees setup` fetches `dev` and rebases the branch onto it (`.bkit/core/engine/commands/workflow/worktrees.ts:1010`). In adopt mode (`RUNTIME_WORKTREES=false`, the cloud default, working on the branch in place) there is no rebase, so the owner must merge `dev` into the branch by hand.
   - The resume then goes straight back to the open pause (`.bkit/core/workflows/bkit-build.md:43`). That pause still shows the gate result from before the fix, and with no items it offers only `Try again` or `Stop`.
   - `Try again` starts a fix round (Step 9). The gate is now green, so the fix agent changes nothing, and a round that changes nothing goes back to the Decision Pause (`.bkit/core/workflows/bkit-build.md:820`). No answer re-runs the gate on its own, so the build loops on that pause.
4. **The `Accept` the owner was offered isn't in the workflow.** The Decision Pause says a group-gate failure is never an item (`.bkit/core/workflows/bkit-build.md:140`; the same goes for Step 12's suites, `:147`). So either the orchestrator made the item up, or the verify agent logged the gate's failing tests as gaps. The run's logs weren't available, so which one is not known.

### Scope

Items 1, 2 and 4 change only the information the pause shows. Item 3 is the one route change. No new options or owner answers.

1. **Check whether the failing tests also fail on the base commit.** At a pause after a red group gate (Step 8) or a red final run (Step 12), re-run only the failing test files on the commit the branch started from. If a CI run on that exact commit exists, use it instead. Then:
   - **all failures also red on base** → recommend `Stop`: "these N tests fail on `dev` too; no round here can fix them. Fix `dev`, then resume." In adopt mode, add: "merge `dev` into the branch before resuming."
   - **some** → say so: "a round can fix 2 of 5; the build will still stop on the 3 from `dev`." The owner chooses between `Try again` and stopping now.
   - **can't tell** (no JUnit report, no `bkit:test:file` script, no base run possible) → today's trend rule, and say the cause is unknown.
   - `Try again` stays offered in every case; only the recommendation and the wording change.
   - Never use "the last CI run on `dev`" as evidence. Most bkit commits are `[skip ci]`, so that run is often many commits old.
   - Cost: in bkit, a detached checkout of an older commit, an offline `pnpm install` and one test file took about 8 s (1 s + 2 s + 5 s). Installing dependencies is most of it and will be slower in heavier repos. It runs once per pause, not once per round.
   - `bkit tests run` doesn't record which file each failing test is in today. The check has to read that from the gate's JUnit report (`classname` / `file`).
2. **Count the gate's failing tests in the pause's progress numbers**, so the trend reflects the gate, not just verify.
3. **On a resume into a pause about a red gate, re-run the gate first.** That means Step 8 for a group gate, Step 12 for the final run. If it passes, carry on without asking. If it's still red, ask again with fresh numbers. Do not add a rebase or merge of `dev` for adopt mode: the pause text tells the owner to merge it instead.
4. **Never offer `Accept` for a group-gate or suite failure**, and make the verify agent's instructions say gate failures are not verify gaps.

Out of scope: `/bkit-debug`. It often runs to fix exactly such a failure, so a "came from `dev`, can't be fixed here" label would be wrong when that failure is the job. Also out of scope: `/bkit-ship`, which still needs green CI as today.

### The existing plan

`docs/plans/202611/891-build-gate-stuck-plan.md` on `dev` and the 4 decision rows and 5 deferral rows it added (`e452f6993`) assume the dropped accept design. A re-plan replaces the plan and corrects or closes those rows. Two exceptions:
- The deferral "Run a gate's failing cases on the base commit at the Decision Pause …" is now in scope as scope item 1, without the `Accept` part.
- The deferral "Document that a runner-less test file needs one JUnit case per planned test name" is unrelated and stays open.

Next step: `/bkit-plan #891`.

### Narrative

When `/bkit-build` pauses because a group gate or the final test run is red, the owner is told whether those failing tests also fail on the commit the branch started from. The recommendation follows from that: `Stop` and fix `dev` when no round here can help, or `Try again` when a round can. After the owner fixes `dev` and resumes, the build re-runs the red gate and carries on if it's now green, instead of looping on the old pause.

### Success Criteria

1. At a pause after a red group gate (Step 8) or a red final run (Step 12), the pause says how many failing tests also fail on the base commit: all, some, none, or "can't tell" with the reason.
2. When all failing tests are also red on the base commit, the pause recommends `Stop` and tells the owner to fix `dev` first. In adopt mode it also tells them to merge `dev` into the branch before resuming. `Try again` is still offered in every case.
3. The pause's "problems after each round" numbers include the group gate's failing tests, so a red gate never shows as "0 → 0".
4. Resuming into a pause about a red gate re-runs that gate first. If it passes, the build continues without asking. If it's still red, the pause is asked again with fresh numbers.
5. A group-gate or final-run failure is never offered as an `Accept` item, and the verify agent doesn't log gate failures as verify gaps.

Follow-up: #903 — Build: owner's Fix now answer is lost after the Decision Pause (agents, summary).

It holds #899 and #900, both closed as not planned in favour of #903. They are the same kind of bug as this issue: the owner answers at the Decision Pause, and a later step ignores the answer. #903 is marked blocked by this issue and runs after it ships, so this build's scope stays as it is.

When this issue ships, add anything from its body that the build left undone to #903 (its Part 3).

## #822 — Route raw test-runner commands through the tests lock per host (open)

### Problem

#724 — Machine-wide test lock: one test run at a time across agents makes bkit's own test scripts take a machine-wide lock. An agent that runs a test runner directly (for example `vitest run` or `pnpm exec vitest`) bypasses it, so two heavy runs can still overlap. No host hook wraps those commands: `git grep -l 'machine-lock\|--lock tests'` over `.bkit/core/hooks` and the host dirs is empty. #724's Out of Scope names this as a separate follow-up.

### Outcome

On every host, a raw heavy test-runner command either runs under the tests lock or is refused with the locked command to use instead.

### Success criteria

- On Claude, Codex, OpenCode and Cursor, a raw heavy test-runner command goes through the tests lock.
- A light run (a single test file) is not slowed down, or is exempt by a stated rule.
- The refusal text names the exact command to run instead.

### Constraints and non-goals

- Host parity (`.agents/rules.md` § Provider parity); POSIX shell only.
- Stack-agnostic: match `package.json` script names and runner binaries from config, not one test framework.

### Decisions already made

None.

### Open questions

- A) Wrap: the hook rewrites the command to run under the lock. B) Refuse: the hook blocks and names the locked script. Recommended: B, because not every host lets a hook rewrite a command.
- Light-run exemption? A) Exempt single-file runs. B) No exemption. Recommended: A.

### References

- **Audit reports:** docs/audits/202611/deferrals.md (findings deferrals-16)
- Audit parent: #344 — Deferrals triage
- #724 — Machine-wide test lock: one test run at a time across agents
- `docs/deferrals.jsonl` key `724-host-hook-catches-raw-test-runners`

## #743 — Build group gate re-runs integration tests after every group (closed)

### Narrative

After every task group except the last, the build's group gate (Step 8 in `.bkit/core/workflows/bkit-build.md`) runs `bkit tests run --gate=bkit:gate:static-unit-integration --gate=bkit:gate:static-unit`. The deepest declared gate wins, so in any repo that declares an integration gate, every group re-runs the whole integration suite. Step 12 then runs it once more. Build 701 ran 8 group gates at about 135s of integration tests each (`docs/plans/202610/logs/701-engine-work-build/build-group-gate-9-1.md`), so roughly 18 minutes went on integration before Step 12 even started.

The group gate should run static checks and the unit tier only (`bkit:gate:static-unit`). Integration runs once at Step 12, then again at pre-push and in CI before anything merges. Unit tests import the same code and catch most breaks a later group would hit. The cost is that a break only an integration test catches surfaces at Step 12, against the whole build's changes rather than the group that caused it.

### Success Criteria

- Step 8's group gate and the gate command Step 9 hands `@bkit-build-plan-gaps-remediate` run `bkit:gate:static-unit` only.
- Step 12 still runs the deepest declared build gate, integration included.
- `.bkit/workflows.md` § Group gate and the gate tables say which tier each step runs, and why.
- Debug Step 3 and `.husky/pre-push` are unchanged.

### Derived Test Matrix

<!-- prettier-ignore -->
| Test description | Type | Target file |
| --- | --- | --- |
| Rendered bkit-build workflow matches the snapshot | unit | `.bkit/core/engine/render/__snapshots__/bkit-build.none.txt` |

### Tasks

<!-- bkit:group 1 start -->
### TASK GROUP 1: Unit-only group gate
<!-- bkit:task 1 start -->
- [ ] **TASK 1:** Group gate and its fix-round handoff run `bkit:gate:static-unit` only
  - **UPDATE:** `.bkit/core/workflows/bkit-build.md`: Step 8 sub-step 8 and Step 9 Context gate command
  - **UPDATE:** `.bkit/core/.bkit/workflows.md`: § Group gate, the local gate script table, the build/debug candidate table
  - **UPDATE:** `.bkit/core/.bkit/pipeline.md`: group gate line
  - **UPDATE:** `BKIT_BUILD_GATES` in `.bkit/core/engine/install/manifest.ts`: doc comment
  - **DONE WHEN:** `pnpm bkit:gate:static-unit-integration` and `bkit check` exit 0 with regenerated mirrors and snapshot
  - **TEST FIRST:**
    - n/a — workflow text and docs only; covered by the render snapshot
<!-- bkit:task 1 end -->
<!-- bkit:group 1 end -->

### Out of Scope

- Choosing integration suites per group from the files it touched: no reliable file-to-suite map exists.
- Builds already in progress (699, 715): they keep the old gate until they rebase.

### References

- #723 — Build asks the owner needless questions and repeats fix rounds — https://github.com/cbartens/bkit/issues/723
- `.bkit/workflows.md` § Group gate
- `docs/decisions.jsonl` key `build-group-gate-unit-tier-only`

Done on dev in 6c115b758 (not pushed yet).

**What changed**
- The build's group gate (Step 8 in `.bkit/core/workflows/bkit-build.md`) now runs `bkit tests run --gate=bkit:gate:static-unit`: static checks and unit tests only. When the gate fails, Step 9 gives the fix agent the same command.
- Step 12 still runs the deepest gate the repo declares, integration included. Pre-push and CI also still run integration, and debug Step 3 is unchanged.
- The group gate's gate list is now its own constant, `BKIT_GROUP_GATES` in `.bkit/core/engine/install/manifest.ts`. `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts` checks each build call site against its own list, and fails if a new `tests run` call site appears without a check.
- `.bkit/workflows.md` § Group gate explains the new split and what it costs. The gate tables and `.bkit/pipeline.md` match it.
- The decision is recorded in `docs/decisions.jsonl` under the key `build-group-gate-unit-tier-only`.

**What we give up:** a break that only an integration test catches now shows up at Step 12, against the whole build's changes. Before, it showed up at the group that caused it. A failing test at Step 12 also asks the owner (`TESTS_LOOP`) before a fix round, unless `bkit.workflows.build.tests.ask` is false.

**Checks run**
- Full gate on the first version: everything passed except two tests, which this commit updates (the local gate audit and the instructions coverage check).
- After the fix: those two test files, the render snapshots and the ledger check passed (354 passed, 2 skipped), plus `typecheck`, `lint` on the changed files and `bkit check`.
- I didn't re-run the full gate after the fix. Pre-push runs it before anything is pushed.

Builds already in progress (699, 715) keep the old gate until they rebase.

## #626 — No-plan build: enforce test-first when the issue carries plan-shaped tasks (closed)

### Problem

`/bkit-build` with no plan (`--plan-source=brief`, also `lite:build`) treats test-first as telemetry only. Tests are written first, but no red run is recorded, `tests green` reports Enforced false, and a missing **Done when** is not a FAIL. The well-defined change issue form now asks for exactly the lines the plan path enforces: `- [ ] **Task N:** ... **Done when:** ... **Test first:** ...`. When the issue carries them, the build could check them the way it checks a plan.

### Outcome

A person writes a well-defined change issue with Tasks in the plan's shape, runs `/bkit-build #N` with no plan, and the build proves each **Test first** test failed before its code existed, the same as a planned build.

### Success criteria

- Issue Tasks in the exact shape → test-first enforced: red recorded per task, `tests green` Enforced true.
- Issue without that shape → behaviour unchanged (telemetry only).

### Constraints and non-goals

- Nothing ticks boxes in the issue.
- The parser stays the plan's (`.bkit/core/engine` test-first `TASK_LINE` regex and the literal `**Test first:**`); the issue is read through `bkit issues text`.

### Open questions

- Should a missing **Done when** on an issue task be a FAIL, or a warning?

### References

Related: #339 — Github issue templates (https://github.com/cbartens/bkit/issues/339)
Docs: `.bkit/trackers.md` § Issue shapes (change shape syntax)

## Agreed approach

**What's actually missing.** `/bkit-build` with no plan does run the tests. What it can't do is *prove test-first*: that each test failed before its code was written. That check (`bkit tests green`) reads `**Task N:** … **Test first:**` lines, but only from a plan file. With no plan it reported "no plan file — the build runs from its brief" and checked nothing. Meanwhile a change issue written in the form's shape carries exactly those lines.

**The fix.**

- `bkit tests green` gains `--brief=<file>`. It is used only when no `--plan` file exists. If the brief (the build input) has Task lines with `Test first`, they are audited exactly like a plan's: a named test that never failed before its code is a FAIL.
- Build Step 7.6 passes `--brief=docs/plans/{YYYYMM}/logs/{FID}/build-input-{RUN}.md`.
- The execute agent works the issue's `**Task N:**` lines by number when they are there, and otherwise builds the requested outcomes as before. Verify judges each task by its `Done when` where one is written.
- A brief with no Task lines is still built and still not checked. A missing `Done when` is not a FAIL. `lite:build` checks neither.
- The change form's intro, `.bkit/trackers.md`, `.bkit/templates.md`, `.bkit/README.md` and `.bkit/prompts.md` now say this.

Related: #339 — Github issue templates (https://github.com/cbartens/bkit/issues/339)

Done in f26e8c04 on `dev` (local, not pushed yet).

**What changed.** When a build has no plan file and the build input carries `- [ ] **Task N:**` lines with `**Test first:**`, the build now proves test-first for those Tasks, the same as with a plan: each named test must have failed before its code existed, or the step is a FAIL.

- `bkit tests green` gains `--brief=<file>`, read only when no `--plan` file exists. `/bkit-build` Step 7.6 passes `--brief=docs/plans/{YYYYMM}/logs/{FID}/build-input-{RUN}.md`.
- `bkit-build-plan-execute`: with no plan, it works the issue's `**Task N:**` lines by number (so the red-test records line up with what `tests green` checks). A brief without Task lines still builds from its listed outcomes and is not checked.
- `bkit-build-plan-verify`: same task source; a missing `Done when` is not a FAIL; it never creates or ticks a plan file.
- `lite:build` checks neither. The change form now says so: "builds from this issue too but checks nothing: no failing-test proof, gates, PR or CI."
- Tests in `tests.test.ts` cover the brief path, a brief with no Task lines, and `--plan` taking precedence.

Full suite: 5879 of 5879 tests pass; `bkit check` is clean.

## #660 — Test-first audit silently skips plans that write "Task N —" (closed)

### Failing test or CI run

none yet

### What happened

`bkit tests green` (the audit that checks every `Test first` test was seen failing before its task's code) reported `Enforced: false`, "the plan has no `Test first:` lines", on two gether builds whose plans had them:

- gether-life/app-gether-life#1338 — Inbound link/image filtering misses Bubble's rules — https://github.com/gether-life/app-gether-life/issues/1338: 11 `Test first:` lines. `build-tests-green-1-1.md` and `-1-2.md` both say `Enforced: false`.
- `docs/plans/202610/1505-test-email-bounces-plan.md`: 7 `Test first:` lines. `build-tests-green-1-1.md`, `-1-2.md` and `-1-3.md` all say `Enforced: false`.

`Enforced: false` produces no gaps, so verify passed the audit both times. The #1338 verifier noticed the reason was wrong, but per the audit contract it could not count it. The discipline was in fact followed on #1338 (`status.jsonl` holds a red per test), but nothing checked it.

**Cause.** `.bkit/core/engine/commands/workflow/tests.ts:229` only recognises a task line written exactly as the template has it:

```ts
const TASK_LINE = /^\s*- \[[ xX]\] \*\*Task (\d+):\*\*/;
```

These plans write `- [x] **Task 1 — Image skip line 100,000 px (D1; M1, M2).** …`, with a dash and the title inside the bold. No line matches, `readTestFirst` returns `[]`, and the `run` handler (`tests.ts:799-804`) reads "no tasks found" as "the plan has no `Test first:` lines", which turns enforcement off. The same is true on `dev` after #656 — Test-first fixes: smaller tasks, reject late reds, no futile retries — https://github.com/cbartens/bkit/issues/656 (`bc7b7d96`): #656 made the audit stricter but assumes it runs.

### What should happen

A plan whose tasks carry `Test first:` lines is always audited, whichever of the common task-line shapes it uses. If the audit can't find a task in a plan that clearly has tasks, it fails loudly and names the line it couldn't read. It never quietly reports "not enforced".

### Steps to reproduce

1. Make a plan with one task: `- [ ] **Task 1 — Add clamp.** **Done when:** test passes. **Test first:** \`a.test.ts\` \`clamps low\` fails on a low value passing through.`
2. Run `bkit tests green --plan=<that plan> --file=<status.jsonl> --workflow=build --sub-plan=1 --log=<out.md>`.
3. Expected: one task read, its test audited. Actual: `Enforced: false`, "the plan has no `Test first:` lines".

### How often

Every time a plan writes its task lines as `**Task N — title.**`. In gether `docs/plans/202610/` that is 4 plans out of the current month's set: `1338-inbound-link-image-plan.md`, `1505-test-email-bounces-plan.md`, `1473-paused-overlay-deletion-plan-1.md` and `-plan-2.md`.

### Affected area

- `.bkit/core/engine/commands/workflow/tests.ts` (`TASK_LINE`, `readTestFirst`, the `reason` in `tests green`'s `run`)
- `.bkit/core/docs/templates/bkit-plan.md` § Test first (line 414 shows `**Task 1:**`)
- `@bkit-plan-generate` / `@bkit-plan-update`, which wrote the dash form. `.bkit/core/prompts/bkit-plan-generate.md` doesn't state the task-line shape; it relies on the template.

### Suggested fixes

1. **Accept the dash form too** (recommended, smallest): widen `TASK_LINE` to also match `**Task N — …**` / `**Task N - …**`, with a test per shape in `tests.test.ts`.
2. **Never read "no tasks found" as "nothing to audit".** If the plan contains any `**Test first:**` text but no task line was read, fail with exit `USAGE` (or a gap) naming the first unread `Test first` line. This turns the next format drift into a loud failure instead of a silent pass.
3. **Check the shape at plan time.** Plan scope-check (or a `bkit` mechanical check before plan close) runs `readTestFirst` and rejects a plan where tasks with `Test first:` lines aren't read, so the build never starts on one.

Fix 1 solves today's plans; fix 2 is what stops this class of bug coming back.

### References

- gether-life/app-gether-life#1338 — Inbound link/image filtering misses Bubble's rules — https://github.com/gether-life/app-gether-life/issues/1338 (`docs/plans/202610/logs/1338-inbound-link-image/build-tests-green-1-1.md`, `build-plan-verify-1-1.md` "Test-first audit note", on branch `feat/1338-inbound-link-image`)
- #656 — Test-first fixes: smaller tasks, reject late reds, no futile retries — https://github.com/cbartens/bkit/issues/656
- #659 — Decision rows a plan promises never get written; build fails late — https://github.com/cbartens/bkit/issues/659 (found in the same run)
- `.bkit/core/engine/commands/workflow/tests.ts:229` (`TASK_LINE`)
- `.bkit/core/docs/templates/bkit-plan.md` § Test first
- `.bkit/trackers.md` § Issue shapes (change-shape Tasks syntax uses `**Task N:**`)

### Review, 2026-10-23: suggestions only, no code yet

**The diagnosis is right, and the bug reaches a little further than the dash form.** Checked against dev at `32289700`. `TASK_LINE` (`.bkit/core/engine/commands/workflow/tests.ts:229`) still only matches `**Task N:**`. The `run` handler (`tests.ts:799-806`) still reads "no task read" as "nothing to audit". Two more paths have the same weakness:
- **Briefs.** When the build has no plan file, `--brief=` goes through the same regex, so a brief written `**Task 1 — …**` is skipped the same way. The reason text at `tests.ts:802` also names only the `**Task N:**` shape.
- **Sub-bullets.** A task's text stops at the next line starting with `- ` or `#` (`tests.ts:270`). If a plan puts `**Test first:**` on an indented sub-bullet under its task, the task reads as `missing`. That case is loud (it shows up as a `no-test-first` gap), but the `Test first` text it lost is never reported.

(The body cites #656's commit as `bc7b7d96`. On dev it is now `445dc47a`.)

### Suggested fix, in the order I'd build it

1. **Accept the common shapes.** Let the task number be followed by `:`, `.`, `—`, `–`, `-`, `*` or a space, for example `/^\s*- \[[ xX]\] \*\*Task (\d+)(?=[\s:.*—–-])/`. Add one test per shape to `tests.test.ts`, including `**Task 12 — …**` to prove the number isn't cut short to `1`, and one brief-path test.
2. **Never read "no task found" as "nothing to audit".** `readTestFirst` also returns the line number of every `**Test first:**` that no task claimed. If there are any, `tests green` stops with exit `USAGE` and names the first one, e.g. `plan.md:42: **Test first:** is outside any task line`. I'd pick a hard stop over a gap. The build can't fix the plan's format, because plans belong to the plan phase, so a gap would just send gaps-remediate round the retry loop #656 removed. Build Step 7's gate only accepts exit 0 or 1 (`.bkit/core/workflows/bkit-build.md:520`), so the run stops there with the reason on screen.
3. **Catch it at plan time with an engine check shared with #656** (#656 — Test-first fixes: smaller tasks, reject late reds, no futile retries — https://github.com/cbartens/bkit/issues/656). Add one verb, e.g. `bkit tests plan-check --plan=<file> --log=<out.md>`, that runs the same `readTestFirst` and reports, per task, the tests named, the distinct test files, and any unclaimed `Test first` lines. Because it uses the same reader as `tests green`, the plan phase and the build can't disagree about what a task line is. The test-cap side is in #656's comment. For unclaimed lines, I'd run the check right after Step 8 (`@bkit-plan-update` writes `plan-v3-checked.md`). On a hit, re-ask plan-update once with the line named, then go to the Failure Path. Step 9 would be too late, because complexity-split can't fix a format problem.
4. **Write the shape down.** `.bkit/core/prompts/bkit-plan-generate.md` and `bkit-plan-update.md` never state the task-line shape. They rely on the template example at `.bkit/core/docs/templates/bkit-plan.md:414`. One line in the template's Test first block, "a task line starts `- [ ] **Task N:**`", records it. With fix 1 in place this is a guide, not something the reader depends on.

**Not suggested:** rewriting the four gether plans. With fix 1 they read as they are. For the live check, re-run `tests green` on #1338's branch after the fix. The verifier saw a red per test in `status.jsonl`, but nothing has yet proved those reds pass the late-red and test-changed checks.

### Open for the owner

1. At build time, should an unclaimed `Test first` line be a hard stop (exit `USAGE`) or a gap? I recommend the hard stop, for the reason in fix 2.
2. Should `**Task 1**` with no separator at all also be accepted? I recommend yes. It costs nothing.

### Owner decision, 2026-10-23: an unclaimed `Test first` line is a gap, not a hard stop

`tests green` keeps going. It audits every task it could read, and records each `**Test first:**` line that no task claimed as a gap of a new kind, e.g. `test-first-unread`, naming the plan file and line. One unreadable line then can't hide the rest of the audit, and `Enforced: false` is never the result while the plan has `Test first` text.

**One routing choice that follows, recommendation included.** Gaps-remediate can't really fix this gap. Fixing it means rewriting a task line in the plan during the build, and that changes which tests get audited. So the gap should count with the gaps that stop the build and name the decision, as `ORDER` does today (`Gaps:` header in `bkit-build-plan-verify`), rather than sending gaps-remediate round the retry loop. Recommended: list it in the same "stop and name it" set as the test-order gaps, with its own wording in the stop message ("plan line N is outside any task line"), not labelled as a test-order problem.

### Stopping it from happening in the first place

The gap is only a backstop. Four layers catch the problem before it reaches the build's audit:

1. **Writers are told the shape.** The template's Test first block states "a task line starts `- [ ] **Task N:**`", and `bkit-plan-generate.md` / `bkit-plan-update.md` point at it. That stops most drift at the source.
2. **The reader accepts the common shapes** (fix 1 above). The dash, colon and full-stop forms simply work, so most drift isn't a failure any more.
3. **The plan can't leave the plan phase with an unclaimed line.** Run `bkit tests plan-check` on the plan file after every step that writes it: plan-generate, both plan-update steps, and complexity-split's children. A hit re-asks that agent once, naming the line, then goes to the Failure Path. Best placed as a mechanical check inside `steps finish` for those agents, like the existing exit 5 / 6 re-ask, so no workflow step can forget to call it.
4. **The build checks at its start, not only at verify.** Plans that never went through `/bkit-plan` skip layer 3: hand-edited plans, and builds run from a brief (#650 — Run workflows from the prompt alone, without issue, design or plan — https://github.com/cbartens/bkit/issues/650). For those, run the same `plan-check` before plan-execute. Then the problem shows up in the first minute, not after an hour of execute when verify runs `tests green`.

With 3 and 4 in place, the gap in `tests green` should only ever fire if someone edits the plan mid-build.

## Work done (staged on `dev`, not committed yet)

Built as decided above: an unread `Test first` line becomes a recorded gap, and three earlier checks stop it from getting that far.

**What changed**
- **One wider task-line reader** (`.bkit/core/engine/commands/workflow/tests.ts`, `TASK_LINE`). A task is a bullet `- [ ] **Task N` followed by `:`, `.`, a dash, `*` or a space. So `**Task N:**`, `**Task N — title.**`, `**Task N.**` and plain `**Task N**` all count. The plans that used to be skipped silently are now audited.
- **Missed lines are a gap, not a silent skip.** If a `**Test first:**` line still sits outside every task (a loose line, or a sub-bullet), `tests green` keeps auditing every task it can read. It also records a plan-level `test-first-unread` gap naming the file and line. The audit no longer reports `Enforced: false` for that plan. `@bkit-build-plan-verify` marks the gap `Fixable: false`, so the build goes to the Decision Pause.
- **Prevention, in three places:**
  1. **Plan template** (`docs/templates/bkit-plan.md`, § Test first): tells plan writers that every task is one `- [ ] **Task N:**` bullet, with `**Test first:**` on that bullet.
  2. **Plan Step 9** runs the new `bkit tests plan-check`. On a loose line (exit 1), `@bkit-plan-update` rewrites `plan-v3-checked.md`. The check's report quotes each loose line, so the agent can find it even after line numbers shift. The check then runs once more; still failing → Failure Path.
  3. **Build Step 3** runs the same check before any code is written. A loose line stops the run on the Failure Path and names the line. This catches plans that never went through `/bkit-plan` (hand-edited plans, or a build input with tasks in it).

**A choice I made that wasn't discussed:** at build start, a loose line stops the run instead of being recorded as a gap. Nothing has been built at that point, so fixing the plan is cheap. "Keep going, record gap" still applies in the audit after the build.

**Verified:** full test suite passes (6,829 tests), and `bkit check` and the typecheck are clean. New tests cover each task-line shape, two-digit task numbers, a `Tasks 1-3` line that must not count as a task, loose lines and sub-bullets, and the report quoting the line text.

Reason recorded in `docs/decisions.jsonl` under key `656-660-engine-counts-plan-test-first`. Related: #656.

### Follow-up (staged on `dev`, not committed yet): loose lines now fixed in Step 6

This replaces the plan-time prevention point described above. The plan check no longer calls `@bkit-plan-update` as a separate repair step.

- **Plan Step 4** runs `bkit tests plan-check` on the first draft and writes `plan-draft-check.md`. The report quotes every `Test first` line that sits outside a task bullet.
- **Plan Step 6:** `@bkit-plan-update` applies those lines as CRITICAL findings, in the same pass as the review fixes.
- **Plan Step 9** (complexity check and split, now one step) checks again. A line still loose at that point goes to the Failure Path.
- **Unchanged:** the build-start check (build Step 3), the template wording, and the `test-first-unread` gap in `tests green`.

Details are on #656.

Follow-up on the engine reader from 5d5d1b48, fixed in 431461ac on dev.

**What was wrong.** The plan template's Gate 2 checklist carries the line `- [ ] **Test first:** every task naming `Test first` tests recorded a red per test before its code; ...` (template line 423). `bkit tests plan-check` read that as a `Test first` entry sitting outside every task and exited 1. Every plan written from the template copies that block, so all 37 current plans and sub-plans in bkit and app-gether-life failed the check, and every new plan would have ended at `/bkit-plan` Step 9 and `/bkit-build` Step 3 before any code. The unit fixture had no such line, which is why the suite stayed green.

**Fixes in 431461ac**

- A checkbox whose own label is `**Test first:**` is a checklist line, never an entry (`GATE_TEST_FIRST_LINE` in `tests.ts`). A checkbox with any other label, such as an older `- [ ] **T1:**` task with an inline `Test first`, is still reported, so those plans keep failing loudly rather than passing as "nothing to audit".
- Without `--children`, `plan-check` now checks the first existing `--plan` together with its `{stem}-N.md` sub-plans. A split feature's master plan has no tasks of its own, so before this `/bkit-build` Step 3 saw nothing and an unread line in a sub-plan surfaced only at `tests green` after the code was written. `--children` stays the split-time check that insists each child fits.
- A checked file with no task bullet and unread lines gets a relabel hint in the report's Unread section, since `**T1:**` labels and `Test first` sub-bullets are not tasks to the engine. In app-gether-life that is 1273, 1301, 1473, 1505 and 1517.
- The Session Fit Estimate names the files checked, so `--children` no longer prints "No plan file or brief exists, so nothing was checked." while it had checked two children.

**Checked after the fix.** The template and every current-format plan and sub-plan in both repos exit 0. The five older-label plans still exit 1 with the hint. Full suite 181 files, 6858 tests green. Reason recorded in `docs/decisions.jsonl` key `656-660-plan-check-gate-line-and-sub-plans`.

**Left as is, on purpose.** An unread line at plan Step 9 still goes straight to the Failure Path with no repair round, per the `656-660-engine-counts-plan-test-first` decision that places the repair in Step 6. With the Gate 2 line fixed, the only way to reach it is `bkit-plan-update` writing a loose line itself. No migration for the removed `bkit-plan-complexity-check` agent: `removeOrphans` prunes its host copies on upgrade, and a consumer's own `## Model Overrides` row naming it pins nothing.

## #894 — Show the progress line at step start and at task group boundaries (open)

### Narrative

Since #825, every `/bkit-*` workflow shows a progress line when a numbered step **finishes**. Long steps therefore start in silence: the owner doesn't see which step is running or why the wait is long until it's over. Run logs under `docs/plans/2026{10,11}/logs/*/status.jsonl` show the usual long silences:

<!-- prettier-ignore -->
| Step | Typical wait with no line |
| --- | --- |
| `plan-generate` | 10-45m |
| `build-plan-tasks` (per group) | 15-35m |
| `ship-deferred-sweep` | 7-29m |
| `build-run-tests`, `build-challenge` | 20-90m |

The orchestrator can't print while a subagent runs, so the fix is to announce each step **before** it starts and to mark the edges of task groups and retry loops clearly. This applies to **every** workflow: design, plan, build, debug, ship, and `/bkit-auto` forwarding the lines of the workflow it hands off to.

Three changes:

1. **Step start, all workflows.** Before each numbered step's work begins, show a start line:
   ```text
   Progress: ████░░░░░░ 44% · Starting Step 8/16 Plan Verify · Group 2 of 3
   ```
   The % is the work finished **before** this step, so a start line never shows more than the done line that follows it.
2. **Task group start (build).** [bkit-build.md:602](https://github.com/cbartens/bkit/blob/dev/.bkit/core/workflows/bkit-build.md) records `build-group-start` with `steps done ... >/dev/null`, so the line the engine returns is thrown away. Show a start line for the group's Step 7 instead, so `Group 3 of 4` appears before the long `build-plan-tasks` wait.
3. **Task group end (build).** A passing `build-group-gate` row prints a line today, but it reads the same as the verify line before it (both are titled `Plan Verify`). Add `· Group {g} of {G} done` to that line.

Retry loops in every workflow use the same start line: a step re-entered on attempt > 1 shows `Attempt {a} of {max}` in its **start** line, not only in its done line. The looped points are `build.verify`, `build.challenge`, `build.tests`, `debug.fix`, `debug.soak` and `ship.merge` (`progressPoint` in `.bkit/core/engine/commands/workflow/steps.ts`). Design and plan have no loops or groups, so they get the step-start line only.

### Success Criteria

- In all five step-listed workflows (design, plan, build, debug, ship), each numbered step that does work shows the engine's start line word for word before its work begins. `/bkit-auto` forwards those lines.
- The start line's % equals the % of the done line before it, and is never above the done line after it.
- In build, every task group shows a start line with `Group {g} of {G}` before Step 7 runs, and a passing group gate shows `Group {g} of {G} done`.
- A step re-entered by a retry loop, in any workflow, shows `Attempt {a} of {max}` in its start line.
- Start lines are worked out from `status.jsonl` and the plan alone and never write a status row, so a resumed run shows the same line it would have shown without the stop.

### Edge Cases

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| First step of a workflow | Start line shows 0% and an empty bar |
| Step skipped (e.g. Plan Convert when the plan is already in task-block form, ship Step 4 on Path A) | No start line; the done line still prints as today |
| Decision Pause, owner pause, unnumbered bookkeeping | No start line |
| Build before Step 4, so no plan yet | G counts as 1, as for done lines |
| Group gate that fails or goes to gaps remediation | No `done` suffix; the done suffix appears only on the passing gate |
| Retry loop that goes back to an earlier step | That step's start line shows the lower % and the attempt |
| Resume after a stop | The resumed step shows its start line once, worked out again from `status.jsonl` |
| Headless / cloud run | Start lines print; nothing waits on them |
| Start line on a 375px-wide phone | The `Progress: {bar} {pct}%` part never wraps, as for done lines |

### Derived Test Matrix

<!-- prettier-ignore -->
| Test description | Type | Target file |
| --- | --- | --- |
| Start line for a flat workflow uses the units finished before the step, with `Starting Step` wording | unit | `.bkit/core/engine/commands/workflow/step-table.test.ts` |
| Start line for the first step is 0% with an empty bar | unit | `.bkit/core/engine/commands/workflow/step-table.test.ts` |
| Build start line inside group 2 of 3 shows `Group 2 of 3` and the % before Step 7 of that group | unit | `.bkit/core/engine/commands/workflow/step-table.test.ts` |
| Start line on attempt 2 of a looped point shows `Attempt 2 of {max}` for each of build, debug and ship | unit | `.bkit/core/engine/commands/workflow/step-table.test.ts` |
| Passing group gate line ends `Group {g} of {G} done`; a failing one does not | unit | `.bkit/core/engine/commands/workflow/steps.test.ts` |
| Start command prints `progressLine` and writes no status row | unit | `.bkit/core/engine/commands/workflow/steps.test.ts` |
| Start command rejects an unknown step and prints no line for skipped or unnumbered steps | unit | `.bkit/core/engine/commands/workflow/steps.test.ts` |
| Every numbered step section in the five workflow files shows the start line before its work, and build's group-start blocks no longer discard their output | unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` |

### Tasks

<!-- bkit:group 1 start -->
### TASK GROUP 1: Engine works out start lines and group-end lines
<!-- bkit:task 1 start -->
- [ ] **TASK 1:** Work out a start line for any numbered step, including its group and attempt
  - **UPDATE:** `runProgress` in `.bkit/core/engine/commands/workflow/step-table.ts`: add a start mode that counts the units finished before the step and words the line `Starting Step {n}/{steps} {title}`
  - **READ:** `.bkit/workflows.md`: § Progress Lines for the done-line formulas the start line mirrors
  - **DONE WHEN:** the four step-table tests in the matrix pass
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/step-table.test.ts` `runProgress start flat` fails on a missing start mode
    - `.bkit/core/engine/commands/workflow/step-table.test.ts` `runProgress start first step` fails on a missing start mode
    - `.bkit/core/engine/commands/workflow/step-table.test.ts` `runProgress start build group` fails on a missing start mode
    - `.bkit/core/engine/commands/workflow/step-table.test.ts` `runProgress start attempt` fails on a missing start mode
<!-- bkit:task 1 end -->
<!-- bkit:task 2 start -->
- [ ] **TASK 2:** Mark a passing group gate's line as the end of its group
  - **UPDATE:** `stepProgress` in `.bkit/core/engine/commands/workflow/steps.ts`: add `· Group {g} of {G} done` when the row is a passing `build-group-gate`
  - **DEPENDS ON:** 1
  - **DONE WHEN:** a passing gate line ends with the done suffix and a failing one does not
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `group gate pass prints group done` fails on a missing suffix
<!-- bkit:task 2 end -->
<!-- bkit:task 3 start -->
- [ ] **TASK 3:** Add a read-only engine command that prints a step's start line without writing a row
  - **UPDATE:** `.bkit/core/engine/commands/workflow/steps.ts`: new read-only verb (name decided in the plan) taking `--file` `--workflow` `--step` `--group`, reusing `stepProgress` inputs (plan groups, saved attempts and limits)
  - **UPDATE:** `.bkit/cli.md`: verb row and `progressLine` output contract
  - **DEPENDS ON:** 1
  - **DONE WHEN:** the command prints `progressLine`, leaves `status.jsonl` unchanged, and refuses unknown steps
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `start prints progressLine without writing a row` fails on a missing verb
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `start rejects unknown and skips unnumbered steps` fails on a missing verb
<!-- bkit:task 3 end -->
<!-- bkit:group 1 end -->
<!-- bkit:group 2 start -->
### TASK GROUP 2: Every workflow shows the start lines
<!-- bkit:task 4 start -->
- [ ] **TASK 4:** Show the start line at the start of every numbered step in all workflows
  - **UPDATE:** `.bkit/instructions.md`: § `workflow-narrate` clause, adding wording without removing any
  - **UPDATE:** `.bkit/core/workflows/bkit-design.md`, `.bkit/core/workflows/bkit-plan.md`, `.bkit/core/workflows/bkit-build.md`, `.bkit/core/workflows/bkit-debug.md`, `.bkit/core/workflows/bkit-ship.md`: each numbered step that does work runs the start command and shows its line before its work
  - **UPDATE:** `.bkit/core/workflows/bkit-auto.md`: forwards start lines as it forwards done lines
  - **UPDATE:** `.bkit/core/engine/audits/workflows/workflow-shape.test.ts`: new `describe` block that walks each workflow's numbered step sections with `stepSections` and `WORKFLOW_STEPS`
  - **READ:** `stepSections` in `.bkit/core/engine/checks/status-holes.ts`: how a workflow file is split into step sections
  - **DEPENDS ON:** 3
  - **DONE WHEN:** the workflow-shape test passes and the instructions sync check reports no drift
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `every numbered step shows a start line` fails on steps with no start call
<!-- bkit:task 4 end -->
<!-- bkit:task 5 start -->
- [ ] **TASK 5:** Show a start line when each build task group starts, instead of discarding the group-start output
  - **UPDATE:** `.bkit/core/workflows/bkit-build.md`: the group-start blocks around lines 598-602 and 684 show the group's Step 7 start line instead of sending output to `/dev/null`
  - **DEPENDS ON:** 4
  - **DONE WHEN:** a build with 2+ groups shows `Group {g} of {G}` before each group's Step 7 work
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `build group start shows its start line` fails while the group-start output goes to `/dev/null`
<!-- bkit:task 5 end -->
<!-- bkit:task 6 start -->
- [ ] **TASK 6:** Update the docs that describe progress lines
  - **UPDATE:** `.bkit/workflows.md`: § Progress Lines and the **Narrate** row in the Protocol table
  - **UPDATE:** `CHANGELOG.md`: entry
  - **DEPENDS ON:** 5
  - **DONE WHEN:** the docs describe start lines, group-end lines and attempt start lines, and match the engine output
  - **TEST FIRST:** n/a — docs
<!-- bkit:task 6 end -->
<!-- bkit:group 2 end -->

### Open Questions & Assumptions

- Assumed: start-line wording is `Starting Step {n}/{steps} {title}`; the rest of the format matches #825.
- Assumed: a skipped step shows no start line, only its done line, since no work runs.
- Open: the new verb's name (`steps start` or a flag on an existing verb); the plan picks it, reusing existing code per `.agents/rules.md` § Improve over duplicate.
- Open: whether the done suffix should say `done` or `passed`.

### Breaking Changes & Naming

- New read-only verb that outputs `progressLine`. No existing key, row or output changes, apart from the added `done` suffix on passing group gate lines.

### Out of Scope

- A line per plan task inside Plan Execute (`Task {t} of {T}`). It needs subagent output changes, and should be a separate issue.
- Weighting the % by how long steps take. This changes accuracy, not how often lines appear.
- A live bar in a status line or app UI.

### References

- #825 — Show a progress bar line after every workflow step
- `.bkit/workflows.md` § Progress Lines
- `.bkit/core/engine/commands/workflow/step-table.ts` § `runProgress`
- `.bkit/core/engine/commands/workflow/steps.ts` § `stepProgress`, `progressPoint`
- `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` — existing checks on the shipped workflow files
- `.bkit/instructions.md` § `workflow-narrate`
- `.bkit/core/workflows/bkit-build.md` § Group Loop — Steps 7-9

🤖 Generated with [Claude Code](https://claude.com/claude-code)

###### bkit:blocked-by start
- #911
- #849
###### bkit:blocked-by end

**Blocked by [#911 — Ship: a failed merge never reaches the diagnose and fix steps](https://github.com/cbartens/bkit/issues/911) and [#849 — Keep local dev synchronized after workflow close](https://github.com/cbartens/bkit/issues/849).** Both are added to the `bkit:blocked-by` block at the end of the body and as GitHub "blocked by" links.

Why:

- **#911:** this plan adds a start line to every ship step, including Steps 11-12, which #911 deletes. Both change `step-table.ts`, `steps.ts`, `status-holes.ts` and the `bkit-ship.none.txt` snapshot. Building this first would mean adding start lines to steps that are about to disappear, then redoing the snapshot.
- **#849:** it retires ship Step 13 and renumbers Close Workflow. This plan writes a `--number=N` start block into every ship step, so it needs the final step list.

This issue is Low priority, so building it last, on the final ship step list, costs the least rework.

`/bkit-build #894` stops at its blocker check until both are closed.

Plan status: `docs/plans/202611/894-show-progress-line-plan.md` passes `bkit tests plan-check` with 0 problems. Its 5 open questions all have a default (option A), so build can run on the defaults. Moved to **Ready**.

## #554 — Test-first build: write each task's test and see it fail before writing the code (closed)

## What we want

`/bkit-build` should work test-first, i.e. TDD (test-driven development). For every task that changes behaviour, it would:

1. Write the test that describes what the task should do.
2. Run it and see it **fail**.
3. Write just enough code to make it pass.
4. Run it again and see it **pass**.
5. Tidy up.

The plan template, the build prompts and the shipped testing docs need to change so this is the default.

## Why it matters

A test written after the code tends to check what the code *does*, not what it *should* do. If the code is wrong, the test is usually written to match the mistake, and it goes green anyway.

A test that has been seen to fail before the code existed proves two things:
- it actually exercises the new behaviour;
- the code is what made it pass.

That makes the green tick more trustworthy, which is the whole point of bkit's fences.

## What bkit does today

**The groundwork is already there.**
- **Plan:** the plan template already decides the tests up front.
  - Every row of the Derived Test Matrix becomes one task (`.bkit/core/docs/templates/bkit-plan.md:51`).
  - "Tests ship with their task" (`bkit-plan.md:404`).
  - Each task's `Done when:` names its tests.
- **Debug is already test-first.** The shared rules say: "Reproduce first … ALWAYS add failing tests before touching code" (`.bkit/core/.agents/rules.md:102`).

**The gap is in build:**
- **`bkit-build-plan-execute`** implements each task and then satisfies `Done when` (`.bkit/core/prompts/bkit-build-plan-execute.md:47`, `:53`). Nothing tells it to write the test first, or to show that the test fails before the code exists.
- **`bkit-build-plan-verify`** ticks a task when its test passes (`.bkit/core/prompts/bkit-build-plan-verify.md:47`). It can't tell a real test from one that would have passed even without the new code.
- **`bkit-build-challenge-tests`** adds edge-case tests after the code is written. That's still useful as a second pass, but it isn't test-first.

## How others do it

- **[Superpowers](https://github.com/obra/superpowers)** has a `test-driven-development` skill.
  - It enforces red → green → refactor, with the rule "Write code before the test? Delete it."
  - Its `task-done` script marks a task complete only if the task's test command exits 0.
- **[Claude Task Master](https://github.com/eyaltoledano/claude-task-master)** has an "autopilot" TDD mode.
  - It won't move past the failing step without a failing test.
  - But the agent reports the pass and fail counts itself, and Task Master never runs the tests. That's the weakness to avoid: the agent could simply claim the test failed.

## Proposed changes (to discuss)

1. **Plan template:** every task that changes behaviour gets a `Test first:` line. It names the test file and the assertion that must fail before the code exists.
   - Tasks with no behaviour change (docs, config, pure refactors) write `Test first: n/a — <reason>`.
   - Plan review checks that each `n/a` is justified.
2. **`bkit-build-plan-execute`:** for each task, in this order:
   - write the test;
   - run it and record the failing output in the build log;
   - write the code;
   - run the test and record that it passes;
   - refactor.
3. **A check done by code, not the agent's word:** before ticking a task, the verifier (or `bkit steps finish`) re-runs the task's new test against the code *before* the task's changes, and it must fail there. A recorded failure message alone isn't enough, because the agent could make it up.
4. **Shipped docs:** add a test-first section to the testing doc consumers get (`.bkit/shared/docs/testing.md`) and to `docs/testing.md`, and keep the plan template's testing guidance in line with it.
5. **`bkit-build-challenge-tests`:** keep it as the edge-case pass after the code.
6. **Debug:** already test-first. Align its wording with build's so both use the same terms.

## Open questions

- **How to prove "failed before" cheaply.** Options:
  - check out the task's starting commit in a throwaway worktree and run the new test there;
  - temporarily take out the task's source changes and run it.
  - Commit after each red and green step? bkit already commits early and often, so a "red" commit per task would make the check simple.
- **Tests that can't run on a laptop.** End-to-end and `@live` tests run in CI, not locally. Is test-first required for unit and integration tests only, with the higher tiers still planned up front?
- **Cost:** two or three extra test runs per task. Should the run be limited to that one test file rather than the whole suite?
- **Default or opt-out:** on by default, with a per-plan way to turn it off for prototypes?

## Related

- #374 (coverage floor)
- The Superpowers "review and adopt patterns" issue from the October 2026 comparison (being filed now)
- `.bkit/comparison.md` § Part 3 lists missing test-first enforcement as a gap compared with the other frameworks

## Proposed implementation (agreed direction, input for `/bkit-design`)

Spike evidence behind each point is in the next comment.

### The core idea: bkit runs the red, not the agent

Today `bkit-build-plan-execute` writes a whole sub-plan in one go, and `bkit steps finish` makes one commit at the end (`.bkit/core/workflows/bkit-build.md:329`). Subagents may not commit. So there is never a saved "test written, code not yet written" moment to go back to later. That rules out both "prove it afterwards" options in the issue body:

- **Check out the task's starting commit in a throwaway worktree:** there is no per-task starting commit, only one per sub-plan.
- **Temporarily take out the task's source changes:** same problem, and a crash halfway leaves the worktree with code missing.

Instead, bkit checks the red **at the moment it happens**:

1. For each task, the agent writes the test and runs a new verb on the existing `tests` command: `bkit tests red --task=N --test=<file> --name=<test name>`.
2. bkit runs that one test through a new consumer-declared script that runs a single test file, and reads the JUnit report (a standard test-result file most test runners can write). It accepts the red only if **the named test ran and failed**. If the test passes, bkit refuses the checkpoint. This is what stops an agent that wrote the code first.
3. bkit writes a `build-task-red` row to `status.jsonl` (`steps done --commit=none`) holding:
   - the task number, test path and test name;
   - the hash of the test file at that moment (`git hash-object`);
   - the exit code;
   - the tree ID, kept for the record only.

   It also saves the trimmed test output.
4. The agent writes the code. The existing sub-plan test gate (`build-subplan-gate`) proves the suite passes, so green costs no extra run. In addition, the named test must show as **passed** in its report, not just "exit 0".
5. Before ticking a task, the verifier checks two things:
   - a red row exists for that task;
   - the test file's hash at HEAD still matches the hash recorded at red.

   The engine does the "every task has a red row" count, not the verifier agent.

The one thing bkit can't judge is whether the failure message is the *expected* one. The verifier reads the saved output for that.

### Decisions taken

- **Strict red.** A test failing only because it imports code that doesn't exist yet is not a valid red. The agent writes an empty stub first, so the red is a real assertion failure. Otherwise `expect(true).toBe(true)` would pass the moment the module exists. The named-test rule above enforces this automatically.
- **Tiers:** the red checkpoint is required for unit and integration tests only. Build never runs end-to-end or `@live` locally, so those rows write `Test first: n/a — runs in CI` and stay planned up front in the Derived Test Matrix.
- **No plan-wide opt-out.** Per-task `Test first: n/a — <reason>` covers prototypes and non-behaviour tasks; plan scope-check verifies each reason. Builds without a plan file (brief mode) record "not enforced" rather than failing.
- **Cost:** one extra single-file test run per behaviour task, about 1–3s each in this repo.
- **`bkit-build-challenge-tests` is unchanged.** It stays the edge-case pass after the code.
- **No git pin for the snapshot.** The hash stored in the row is enough and survives push and cloud resume (see the spike comment).

### The consumer contract

A new declared script runs one test file and writes a JUnit report to the path in `$BKIT_TEST_REPORT`. bkit calls it the same way it calls gates (`pnpm <script> <full path>`, resolved like `resolveGate` in `.bkit/core/engine/commands/workflow/tests.ts:35`). Example for vitest:

```json
"<single-test script>": "vitest run --reporter=default --reporter=junit --outputFile.junit=\"$BKIT_TEST_REPORT\""
```

The script name is still to be settled in design. bkit always passes the full repo-relative path, because vitest treats a short name like `add.test.ts` as "any path containing this" and also runs other matching files.

### Where the changes land

<!-- prettier-ignore -->
| What | File(s) |
| --- | --- |
| `Test first:` line per task: test file + test name + the assertion that must fail, or `n/a — <reason>` | `.bkit/core/docs/templates/bkit-plan.md` around `:402-410` |
| Check each `n/a` is justified | `bkit-plan-scope-check-1/2` prompts |
| Write test → stub → `bkit tests red` → code → tidy, per task | `.bkit/core/prompts/bkit-build-plan-execute.md` Process step 8 |
| `red` verb + JUnit parsing + tests | `.bkit/core/engine/commands/workflow/tests.ts`, `tests.test.ts` |
| Required fields for the new `build-task-red` row | `.bkit/core/engine/commands/workflow/steps.ts:285` |
| Red row required + test hash unchanged | `.bkit/core/prompts/bkit-build-plan-verify.md` step 8, plus an engine-side count |
| Single-test script name and contract; `bkit doctor` / `bkit check` warning when missing | `.bkit/workflows.md` § Local gate scripts, doctor/check modules |
| Test-first section | `.bkit/shared/docs/testing.md`, `docs/testing.md` |
| Debug uses the same wording; its "reproduce first" step can use `bkit tests red` | `.bkit/core/.agents/rules.md:102`, `.bkit/core/workflows/bkit-debug.md` |
| Mark the gap closed | `.bkit/comparison.md` § Part 3 |

### Existing consumers (migration)

- Plans already in flight have no `Test first:` lines. The verifier accepts them with a warning instead of failing them.
- Consumers must declare the new script.

Both get registered in `docs/migrations.md`.

### Still open for design

- The script name.
- How other runners produce JUnit. Not spiked: pytest and Playwright have it built in, jest needs the `jest-junit` add-on.
- Behaviour on a heavy consumer repo (app-gether-life).

## Spike results (2026-10-14)

Run in a throwaway worktree off `dev` at `22a726e3`. The git garbage-collection tests ran in a separate sandbox repo, so `gc --prune=now` could never touch the shared bkit object store. Nothing was committed, and the worktree and scripts have been removed.

### 1. Snapshot the worktree without committing: works

Method: point `GIT_INDEX_FILE` at a temporary file, then `read-tree HEAD`, `add -A`, `write-tree`.

- It captured the new, never-committed test file.
- It skipped gitignored files (`node_modules/`, `*.log`).
- The real index and `git status` were unchanged, including a change someone else had already staged.

### 2. Does the snapshot survive? Only if pinned, and the pin doesn't travel

<!-- prettier-ignore -->
| Case | Result |
| --- | --- |
| Snapshot nobody points at, after `reflog expire` + `gc --prune=now` | **deleted** |
| Pinned under `refs/bkit/red/...` | survived gc |
| Pinned under `refs/worktree/...` (private to one worktree) | survived gc; disappears when that worktree is removed |
| Plain `git push` / fresh `clone` | pins **not** carried (only `--mirror` carries them) |

So a pin would vanish when a build resumes in a fresh cloud container. **Recording the test file's hash in the status row works instead:**
- it detected an edit made after the red exactly as well as comparing against the snapshot;
- the row is committed and pushed, so it survives a resume.

Decision: no pin; the hash goes in the row.

### 3. Exit code alone accepts fake reds (vitest, run as `pnpm <script> <path>`)

<!-- prettier-ignore -->
| Case | Exit | What the JUnit report shows |
| --- | --- | --- |
| Assertion fails (`expected +0 to be 3`) | 1 | 1 test named `add > adds two numbers`, failed |
| Test imports a module not written yet | 1 | 1 "failure" named after the **file path**, no real test ran |
| Syntax error in the test | 1 | 1 "failure" named after the **file path** |
| Misspelled path ("No test files found") | 1 | **0 tests** |
| Test-name filter matching nothing | **0** | 1 test, skipped |
| Short name `add.test.ts` | 1 | ran 2 files, including unrelated `badd.test.ts` |
| Passing test | 0 | 1 test, passed |

What this means:
- **A red can't be judged by exit code.** A misspelled path and a syntax error both exit 1, exactly like a real failure.
- **vitest's report can't separate them by "failure vs error" either.** It reports load problems as "failures" too.
- **What reliably separates them: the specific named test appears in the report and failed.** That accepts only the first row.
- **Green needs the same rule.** A filter that matches nothing exits 0 with the test skipped.
- **bkit must pass the full path.** A short path runs other matching files too.

### 4. Script contract via environment variable: works

A script declared as `vitest run --reporter=default --reporter=junit --outputFile.junit="$BKIT_TEST_REPORT"` and called as `BKIT_TEST_REPORT=<path> pnpm <script> <test file>` wrote the report where bkit asked. The named-test rule then:
- accepted the red: assertion failure, exit 1;
- after the fix, accepted the green: same test passed, exit 0.

### 5. Writing the red record: works with today's verbs

- `bkit steps done --step=build-task-red --field=... --commit=none` wrote the row with every field: task, test, test name, test hash, exit code, tree ID.
- The status-holes audit stayed clean.
- An unregistered step name is accepted; the new step still gets an entry in the required-fields table at `.bkit/core/engine/commands/workflow/steps.ts:285`.
- It must be `--commit=none`. The default `--commit=auto` runs `git add -A` and would commit the half-written task.

### 6. Cost of the alternative "throwaway worktree at the starting commit"

- In this repo: worktree create 0.4s, `pnpm install` 0.9s, one test file 2.9s, **4.3s total**, 142M disk.
- Install isn't the blocker, since bkit already assumes pnpm (`.bkit/core/engine/shared/package-manager.ts:8`).
- The blocker is that build makes one commit per sub-plan, so there's no per-task starting commit to check out.
- Not tested: gitignored `.env` files won't exist in a fresh worktree, which would break integration tests there.

### Not covered

- Runners other than vitest.
- A heavy consumer repo.
- Several builds running red checks at the same time.

## Implementation (staged on `dev`, not yet committed)

Implements the approach from the earlier comments: bkit runs each task's tests itself, and a red only counts if the **named test** ran and failed. Changes from the original proposal are marked **(changed)**.

### How a build now works

1. **Plan.** Every task has a `**Test first:**` line after `Done when`, holding either:
   - one or more tests, separated by `;`, each written as `` `test file` `` `` `test name` `` fails on {assertion} **(changed: several tests per task)**; or
   - `n/a — {reason}` for docs, config, pure refactors, or E2E / `@live`-only work.

   Plan scope-check marks a missing, malformed or unjustified `n/a` line as CRITICAL.
2. **Red (Step 6).** For each task, the execute agent writes the tests plus stubs of the code they call, then runs `bkit tests red` once per test. bkit runs that one test file through the consumer's `bkit:test:file` script and reads the JUnit report.
   - It records the red only if the named test ran and failed on a non-zero exit.
   - A passing test (code written first), a skipped test, a test missing from the report, or no report at all is refused.
   - A recorded red writes a `build-task-red` status row (task, test, test name, file hash, failure message) plus the runner log and a `.snapshot` copy of the test file.
3. **Green audit (Step 7, run by the workflow before the verify agent).** `bkit tests green` checks each planned test:
   - a red was recorded for that exact task + file + name;
   - the test file hasn't changed since its red (if it has, the report includes the diff);
   - the named test passes now.

   It writes `build-tests-green-N-{attempt}.md`, which verify and gaps-remediate both read.
4. **Verify** first maps the audit's gaps, then ticks tasks:
   - `not-green` → fixable by gaps-remediate;
   - `test-changed` / `red-mismatch` → judged from the diff (added tests, formatting or a renamed test are fine; a weakened assertion is not fixable);
   - `no-red` and the plan-defect kinds → not fixable.
5. **Not enforced, never silent.** With no plan file, a plan without `Test first:` lines (plans already in flight), or no `bkit:test:file` declared, the audit reports `Enforced: false` with the reason instead of passing quietly.

### Consumer contract

`bkit:test:file` runs ONE test file (bkit appends the repo-relative path) and writes JUnit XML to `$BKIT_TEST_REPORT`.
- bkit never seeds it. Install shows a `test-file-script-missing` advisory, with a vitest example, until it's declared.
- Call the runner directly. Going through a caching task runner crashed in the app-gether-life spike, and turbo's test tasks also run upstream suites first.
- Wiring it up per stack is each consumer's own work. That's now a project rule: `.agents/rules.md` § Repo Authoring → **Stack-agnostic**.
- bkit's own `package.json` declares it.

### Where the changes are

<!-- prettier-ignore -->
| Area | Files |
| --- | --- |
| Engine | `.bkit/core/engine/commands/workflow/tests.ts` (`tests red`, `tests green`, JUnit reader, `Test first:` reader) + tests; `install/manifest.ts` (`BKIT_TEST_FILE_SCRIPT`); `install/modules/core.ts` (advisory) + test |
| Plan | `.bkit/core/docs/templates/bkit-plan.md` (`Test first` rule, examples, Gate 2 item); `bkit-plan-scope-check-1/2` |
| Build | `.bkit/core/workflows/bkit-build.md` (red command in Step 6 Context; audit before verify in Step 7; report passed to Step 8); `bkit-build-plan-execute`; `bkit-build-plan-verify` |
| Debug alignment | `.bkit/core/.agents/rules.md` "Reproduce first": "add failing tests and see them fail (red)" |
| Docs | `.bkit/workflows.md` § Test-first + step rows + commands table; `.bkit/prompts.md` index; `.bkit/templates.md`; shipped `docs/testing.md` § Test first; `docs/migrations.md` (detect-only row); `.bkit/comparison.md`; both READMEs; README features image (`scripts/readme/readme-art.mjs` + regenerated SVG/PNG) |
| Records | 7 rows in `docs/decisions.jsonl` (`554-*`) |

Also in this change: `.bkit/prompts.md` § Prompt Authoring Rules now says to use the plural for general rules and the singular only for one specific item. "Plurals" is added to the GateGuard pre-edit advisory's list of things to copy from existing files.

### Checks

- Static gate passes: typecheck, Prettier, prose, slop.
- `bkit check` exits 0; branch coverage passes, with `tests.ts` at 82%.
- Full suite: 5427 passed, 1 failed. The failure is `tools/wording.test.ts`, which also fails on `dev` without this change: the setup-tips sentences from #543 aren't in `.bkit/wording.md`. Logged in `docs/failures.jsonl` as `wording-test-setup-tips-lines-not-in-wording-file`.
- End to end with real vitest in a scratch repo:
  - a misspelled path was refused;
  - a stubbed test's red was recorded;
  - after the code, the audit was clean;
  - a second red after the code was refused;
  - a weakened assertion was flagged with its diff.

### Not done

- `/bkit-debug` uses the same "red" wording but doesn't call `bkit tests red` yet.
- No changelog entry; that's written at release.
- Not yet run from a packed tarball installed into a fresh consumer.
- app-gether-life still needs its own `bkit:test:file` (vitest per package, plus jest via `jest-junit` for mobile, plus the integration environment setup). That belongs in an issue on that repo.

### For whoever commits

Another change (the MIT licence switch) is in progress in the same checkout and touches many of the same files. Only this issue's work is staged. Commit it with a plain `git commit` (no file paths): `git commit -- <path>` would take the whole working copy of that path, including the licence edits.

## Follow-up: committed as `0f8ec8c8` on `dev` (not pushed yet)

Since the implementation comment above, a full read of every workflow, prompt and template that touches plan tasks found five holes. All are fixed in the commit.

1. **A resumed build got stuck.** Execute never ticks tasks (verify does), so a resumed build re-runs execute from Task 1, and every finished task's red would have been refused as "passed". Now:
   - `bkit tests red` returns "already recorded" without running anything when a red exists for that task, test and name and the test file hasn't changed;
   - refusals carry a kind (`no-report`, `not-run`, `passed`, `skipped`, `exit-mismatch`);
   - execute treats a `passed` refusal as `BLOCKED` and never undoes code to force a red.
2. **Already-landed tasks would FAIL an honest build.** When plan-current finds a task's work already on `dev`, no red is possible.
   - Execute now skips the red for tasks it logged `DONE — already landed`.
   - Verify now reads `build-plan-current.md` and treats that `no-red` as no gap.
3. **A moved or renamed test couldn't be cleared.** The audit now runs a recorded test the plan doesn't name and says whether it passes now. Verify treats "renamed or moved and passing now" as no gap.
4. **`bkit-plan-complexity-split`** now preserves `Test first` lines verbatim when splitting plans, and its self-check includes them.
5. **`bkit-plan-update`** now protects `Test first` like `Done when`: it may only tighten (`n/a` → named tests counts), never remove or weaken.

Also in the commit:
- **Several tests per task.** `Test first:` lists one or more tests separated by `;`. Each needs its own red, and each red log is named by the test's position in the line.
- **Plan-verify order.** It maps the audit gaps (step 8) before ticking tasks (step 9). The mapping only runs when a report is supplied, so holistic and no-plan runs skip it.
- **No-plan builds.** Execute writes tests first but records nothing.
- **Two new authoring rules:**
  - `.bkit/prompts.md` § Prompt Authoring Rules: plural for general rules, singular only for one specific item. "Plurals" is also added to the GateGuard advisory's list of things to copy from existing files.
  - `.agents/rules.md` → Project Rules → Repo Authoring, **Contract changes**: when changing what workflows or prompts pass between steps, read every workflow, prompt and template that mentions it in full, and trace it through the resume, no-plan, sub-plan split and remediation paths before editing.

Checks on the committed tree:
- static gate and `bkit check` pass;
- full suite: 5429 passed, 1 failed. The failure is `tools/wording.test.ts`, which already fails on `dev` without this change and is logged as `wording-test-setup-tips-lines-not-in-wording-file`;
- both pre-commit hooks passed.

Still open: debug doesn't call `bkit tests red` yet; changelog at release; no run from a packed tarball in a fresh consumer yet; app-gether-life's own `bkit:test:file`.

## #819 — Build the pre-commit dist freshness check from the staged tree (open)

### Narrative

When a commit stages a non-test engine `.ts` file, `.husky/pre-commit:18-22` runs `pnpm bkit:check:dist`. That script is `rm -rf dist && tsc && chmod +x dist/cli.js && git diff --exit-code dist/` (`package.json:87`). It compiles the whole working tree, not what is staged, and compares the output with the index.

Several agents often share one checkout. When another agent has an unstaged edit to an engine file, the compiled `dist/` includes that edit, the diff is not empty, and the commit is refused, even though the committer staged only their own files and a correct `dist/`. The check also rewrites `dist/` in the shared tree as a side effect.

`docs/failures.jsonl` key `precommit-check-dist-blocks-parallel-agents` records it. No open issue carries it.

### Success Criteria

- The dist check compiles the staged tree, not the working tree.
- An unstaged edit to an engine file beside a staged one does not refuse the commit when the staged `dist/` matches the staged sources.
- A staged engine edit with a stale staged `dist/` is still refused, with the same message.
- The check leaves the working tree's `dist/` untouched.

### Edge Cases

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| Staged source and staged `dist/` match; unstaged engine edit present | Commit allowed |
| Staged source changed, staged `dist/` stale | Commit refused with `[bkit] dist/ is stale — run pnpm build and commit the result` |
| Partially staged file (some hunks staged) | Only the staged hunks are compiled |
| Staged file deleted | Its output is expected to be gone from staged `dist/` |
| `tsc` fails on the staged tree | Commit refused with the compiler error |

### Derived Test Matrix

<!-- prettier-ignore -->
| Test description | Type | Target file |
| --- | --- | --- |
| Dist check passes for the staged tree with an unstaged engine edit beside it | integration | `.bkit/core/engine/audits/repo/check-dist.integration.test.ts` |
| Dist check refuses a stale staged dist | integration | `.bkit/core/engine/audits/repo/check-dist.integration.test.ts` |
| Dist check leaves the working tree's dist untouched | integration | `.bkit/core/engine/audits/repo/check-dist.integration.test.ts` |

### Tasks

<!-- bkit:group 1 start -->
### TASK GROUP 1: Check dist against the staged tree
<!-- bkit:task 1 start -->
- [ ] **TASK 1:** Compile the index into a scratch directory and compare with the staged `dist/`
  - **CREATE:** a script for the check, placed where `docs/architecture.md` puts repo scripts: export the index (`git checkout-index`) into a scratch dir under `tmp/`, link `node_modules`, run `tsc` there, and compare the output with `git ls-files -s dist/`
  - **UPDATE:** `package.json`: `bkit:check:dist` calls the script
  - **CREATE:** `.bkit/core/engine/audits/repo/check-dist.integration.test.ts`: tests in a scratch git repo
  - **READ:** `.husky/pre-commit`: `:18-22`, the caller
  - **DONE WHEN:** the three tests pass, and a real commit with another agent's unstaged engine edit present is allowed
  - **TEST FIRST:**
    - `check-dist.integration.test.ts` `passes for the staged tree with an unstaged engine edit beside it` fails on the current script refusing the commit
    - `check-dist.integration.test.ts` `refuses a stale staged dist` fails on a stale `dist/` being accepted
    - `check-dist.integration.test.ts` `leaves the working tree's dist untouched` fails on `dist/` being rewritten
<!-- bkit:task 1 end -->
<!-- bkit:group 1 end -->

### Open Questions & Assumptions

- Assumption: `tsc` output is the same whether it runs in the checkout or in a scratch copy with linked `node_modules`. The plan should confirm this on one real build.
- The check is bkit-repo only. Confirm it stays outside any shipped template.

### Out of Scope

- The pre-push gates.
- #707, closed, which fixed the build workflow's per-step commit against this check.

### References

**Audit reports:** docs/audits/202611/failures.md (findings failures-10)

- #345 — Failures triage (https://github.com/cbartens/bkit/issues/345)
- `docs/failures.jsonl` key `precommit-check-dist-blocks-parallel-agents`

## #724 — Machine-wide test lock: one test run at a time across agents (closed)

### Narrative

When several agents run test suites at the same time on one laptop, the machine grinds to a halt. One vitest run already sizes its worker pool to every core, and many bkit tests start their own `git`, `tsx` and `bkit` child processes. Measured on a 10-core MacBook (4 performance + 6 efficiency cores, 32 GB) during parallel agent runs: `uptime` load average 78.01 over 5 minutes, about eight runnable processes per core. The pain crosses repos: agents in bkit, app-gether-life and other consumer repos compete for the same CPU. `vitest.timeout-budget.ts` only stretches time limits so slow tests stop failing; runs still pile up.

This change adds a machine-wide **tests lock**: a full test gate takes it before it starts; a second gate waits its turn and says who it is waiting for (that waiting line is the "another agent is already running tests" warning). It ships to consumers as a script template, built by extending the existing stack lock, not by adding a second lock script.

Decisions already made:

1. **Fixed slots, not live load.** Default 1 heavy run per machine; `BKIT_TEST_SLOTS` overrides it. Each holder exports `BKIT_TEST_WORKERS` = cores / slots for its test runner. Live load average lags (two agents checking at once both see a quiet machine), so it never decides who runs.
2. **Agent tool timeouts.** `bkit tests run` waits for the lock up to `--lock-wait-s` (default 60, the same budget `bkit runs dispatch` polls with), then exits 81 naming the holder. 81 is the existing "hand the wait back to the agent's turn loop" code: the workflow ends its turn and re-runs the block. A raw `pnpm test` in bkit's repo just waits and prints the holder once a minute.
3. **Light runs skip the lock.** Single-file runs (`bkit tests red`, `bkit tests green`, `bkit:test:file`, a raw `vitest run` naming only existing test files) never wait. They use about one core; queuing an agent's write-test-then-fix loop behind a multi-minute gate costs more than the load.
4. **Rename the script** to `bkit-machine-lock.sh` and generalise it with named locks. The named-lock API comes from app-gether-life's adopted copy (`scripts/ci/local/local-stack-lock.sh`: `take_local_stack_lock "<who>" [name]`, `LOCAL_STACK_LOCK_OWNER_<name>`), which already runs a second named lock (`e2e-phones`) beside the stack lock. No migration: the script is copy-and-own, consumers keep their copies at paths and names of their own (app-gether-life's lives at `scripts/ci/local/local-stack-lock.sh`), and `syncTemplateCopies` already prunes the old name from `.bkit/templates/` and prints `removed:` on upgrade.
5. **Lock order.** A run that needs several locks takes the tests lock first, then any other named lock, then the unnamed stack lock. One fixed order means two runs can never each hold one lock and wait forever for the other.

### Success Criteria

- Two full test gates started at once on one machine (same repo, two worktrees, or two different repos) never run at the same time; the second waits and prints the first one's holder line.
- `bkit tests run` that cannot get the lock within `--lock-wait-s` exits 81 with the holder printed, never a hang past the agent's tool timeout.
- `bkit tests red` / `green`, `bkit:test:file` and the gate's own child processes never wait on the tests lock.
- `CI=true` / `CI=1`: no lock is taken anywhere.
- A consumer's existing copy of the stack lock and the new template still exclude each other on the unnamed stack lock (same lock file path, same function and env names).

### Edge Cases

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| Holder process killed mid-gate | Lock frees within a second (perl holder sees its parent change); the waiter starts |
| `BKIT_TEST_SLOTS=2`, three gates start | Two run, each with `BKIT_TEST_WORKERS` = cores / 2; the third waits naming both holders |
| `BKIT_TEST_SLOTS` not a whole number >= 1 | Falls back to 1 and says so once on stderr |
| Gate run inside `bkit tests run` reaches vitest's global setup | Sees `LOCAL_STACK_LOCK_OWNER_tests` alive, does not wait on its own parent |
| `vitest run integration.test` (a filter, not a file path) | Heavy run: takes the tests lock |
| `vitest run path/to/one.test.ts` (every filter is an existing file) | Light run: no lock |
| Run needs tests lock and the stack lock | Takes tests first, then stack; never the reverse |
| Consumer still on the old copy, bkit upgraded | Old copy keeps working; its unnamed stack lock and the new script's share one lock file |
| Lock dir `~/.cache/bkit/machine-lock/` not writable | Gate refuses with the path and the reason; exit 4 (could not run), not a test failure |

### Derived Test Matrix

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| a named lock is machine-wide: checkouts of two different repos wait on the same named lock | integration | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` | 1 |
| one process holds a named lock and the unnamed stack lock side by side | integration | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` | 1 |
| a runner started by a named-lock holder does not wait on that named lock | integration | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` | 1 |
| the unnamed stack lock keeps its lock file path, so an older copy and this one exclude each other | integration | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` | 1 |
| with N slots, N runs hold a named lock at once and run N+1 waits naming every holder | integration | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` | 1 |
| a slots value that is not a whole number >= 1 falls back to 1 and says so | integration | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` | 1 |
| the tests lock exports BKIT_TEST_WORKERS as cores divided by slots | integration | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` | 1 |
| `run --lock` holds the named lock for the command and passes its exit status on | integration | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` | 1 |
| `run` exits 75 when the wait gives up, distinct from the command's own failure | integration | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` | 1 |
| tests run waits for a held tests lock and runs the gate once the holder finishes | integration | `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` | 3 |
| tests run exits 81 naming the holder when the lock stays held past --lock-wait-s | integration | `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` | 3 |
| tests run holds the tests lock for the whole gate, so a second tests run waits | integration | `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` | 3 |
| tests red runs its test file without waiting for a held tests lock | integration | `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` | 3 |
| tests run under CI=true never waits on a held tests lock | integration | `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` | 3 |
| tests run with an unwritable lock dir exits 4 naming the path | integration | `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` | 3 |
| a run whose every filter is an existing test file is light and takes no lock | unit | `.bkit/core/engine/audits/repo/vitest-test-lock.test.ts` | 5 |
| a run with no filters, or a pattern filter, is heavy and takes the tests lock | unit | `.bkit/core/engine/audits/repo/vitest-test-lock.test.ts` | 5 |
| a run started under a live tests-lock owner takes no lock | unit | `.bkit/core/engine/audits/repo/vitest-test-lock.test.ts` | 5 |
| CI=true takes no lock | unit | `.bkit/core/engine/audits/repo/vitest-test-lock.test.ts` | 5 |
| BKIT_TEST_WORKERS sets maxWorkers when present | unit | `.bkit/core/engine/audits/repo/vitest-test-lock.test.ts` | 5 |

### Tasks

<!-- bkit:group 1 start -->
### TASK GROUP 1: Machine lock script
<!-- bkit:task 1 start -->
- [ ] **TASK 1:** Generalise the stack lock into `bkit-machine-lock.sh` with named, machine-wide, slotted locks
  - **CREATE:** `.bkit/templates/scripts/ci/bkit-machine-lock.sh`: the current script plus an optional `[name]` argument on `take_local_stack_lock` / `try_local_stack_lock` / `release_local_stack_lock` / `local_stack_lock_holder` (API as in app-gether-life's `scripts/ci/local/local-stack-lock.sh`); a named lock lives at `${XDG_CACHE_HOME:-$HOME/.cache}/bkit/machine-lock/<name>.lock` with no repo prefix, so it is machine-wide; `LOCAL_STACK_LOCK_OWNER_<name>` lets children skip; `BKIT_TEST_SLOTS` gives the `tests` lock N slot files and the holder exports `BKIT_TEST_WORKERS`; `run "<who>" [--lock <name>] -- <cmd>`; `run` exits 75 when the wait gives up; header states the lock order (tests, then other named locks, then the stack)
  - **DELETE:** `.bkit/templates/scripts/ci/bkit-local-stack-lock.sh`: replaced by `bkit-machine-lock.sh`
  - **CREATE:** `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts`: every test from `local-stack-lock.integration.test.ts`, pointed at the new script, plus the new ones below
  - **DELETE:** `.bkit/core/engine/audits/templates/local-stack-lock.integration.test.ts`: its tests move to `machine-lock.integration.test.ts`
  - **DONE WHEN:** `pnpm vitest run .bkit/core/engine/audits/templates/machine-lock.integration.test.ts` passes, including every carried-over stack-lock test unchanged in intent
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `a named lock is machine-wide: checkouts of two different repos wait on the same named lock` fails on the second repo starting at once
    - `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `one process holds a named lock and the unnamed stack lock side by side` fails on the second take refusing
    - `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `a runner started by a named-lock holder does not wait on that named lock` fails on the child waiting on its parent
    - `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `the unnamed stack lock keeps its lock file path, so an older copy and this one exclude each other` fails on both copies holding at once
    - `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `with N slots, N runs hold a named lock at once and run N+1 waits naming every holder` fails on the second run waiting with two slots
    - `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `a slots value that is not a whole number >= 1 falls back to 1 and says so` fails on two runs holding at once
    - `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `the tests lock exports BKIT_TEST_WORKERS as cores divided by slots` fails on the variable being unset
    - `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `run --lock holds the named lock for the command and passes its exit status on` fails on usage error for `--lock`
    - `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `run exits 75 when the wait gives up, distinct from the command's own failure` fails on exit 1
<!-- bkit:task 1 end -->
<!-- bkit:task 2 start -->
- [ ] **TASK 2:** Adopt the script in bkit's repo and point every doc at it
  - **CREATE:** `scripts/ci/bkit-machine-lock.sh`: byte-identical dogfood copy of the template
  - **UPDATE:** `.bkit/core/engine/audits/repo/dogfood-templates.test.ts`: the `scripts/ci/bkit-local-stack-lock.sh` "not-adopted" entry becomes `scripts/ci/bkit-machine-lock.sh` identical (bkit now uses the tests lock)
  - **UPDATE:** `.bkit/core/.bkit/templates.md`: § Local stack lock becomes § Machine lock — the stack lock, named locks, the tests lock, slots, `BKIT_TEST_WORKERS`, lock order, light vs heavy runs; a consumer's adopted copy keeps working
  - **UPDATE:** `.bkit/core/.agents/rules.md`: § Shared local stack names `.bkit/templates.md` § Machine lock
  - **UPDATE:** `.bkit/core/prompts/bkit-build-plan-execute.md`: Shared local stack line names § Machine lock
  - **UPDATE:** `.bkit/core/prompts/bkit-build-plan-gaps-remediate.md`: Shared local stack line names § Machine lock
  - **UPDATE:** `docs/testing.md`: new section on the tests lock — what takes it, what skips it, `BKIT_TEST_SLOTS`, exit 81
  - **DEPENDS ON:** 1
  - **DONE WHEN:** `pnpm vitest run .bkit/core/engine/audits/repo/dogfood-templates.test.ts` passes; `grep -rn 'local-stack-lock\|Local stack lock' .bkit/core docs/testing.md` finds nothing; `bkit install` regenerates the mirrors (`.bkit/templates.md`, `.agents/rules.md`, `.bkit/instructions.md`, agent mirrors) with no drift in `bkit check`
  - **TEST FIRST:** n/a — docs and the dogfood registry; the existing dogfood-templates test covers the copy
<!-- bkit:task 2 end -->
<!-- bkit:group 1 end -->

<!-- bkit:group 2 start -->
### TASK GROUP 2: `bkit tests run` takes the tests lock
<!-- bkit:task 3 start -->
- [ ] **TASK 3:** Gate runs take the tests lock through the packaged script; single-file runs do not
  - **UPDATE:** `testsCommand` in `.bkit/core/engine/commands/workflow/tests.ts`: the `run` verb runs the gate under `bash <getTemplatesRoot()>/scripts/ci/bkit-machine-lock.sh run "<workflow> <fid> <step>" --lock tests -- <gate>` with `LOCAL_STACK_LOCK_WAIT_S` = `--lock-wait-s` (default 60); exit 75 from the lock → exit 81 printing `lockHolder`; lock dir error → exit 4; `--lock-wait-s` flag and exit 81 added to the verb's help and `exitCodes`; `red` / `green` unchanged (no lock)
  - **READ:** `getTemplatesRoot` in `.bkit/core/engine/shared/package-roots.ts`: where the packaged template lives in a consumer install
  - **READ:** `runsCommand` in `.bkit/core/engine/commands/workflow/runs.ts`: the `--budget-s` / exit 81 pattern to mirror
  - **CREATE:** `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts`: the tests below, against a real lock script and a stub gate
  - **DEPENDS ON:** 1
  - **DONE WHEN:** `pnpm vitest run .bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` passes; `bkit tests run --help` lists `--lock-wait-s` and exit 81
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` `tests run waits for a held tests lock and runs the gate once the holder finishes` fails on the gate starting while the lock is held
    - `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` `tests run exits 81 naming the holder when the lock stays held past --lock-wait-s` fails on unknown flag
    - `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` `tests run holds the tests lock for the whole gate, so a second tests run waits` fails on both gates running at once
    - `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` `tests red runs its test file without waiting for a held tests lock` fails if red is wired to the lock
    - `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` `tests run under CI=true never waits on a held tests lock` fails if the CI no-op is lost
    - `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` `tests run with an unwritable lock dir exits 4 naming the path` fails on exit 1 counted as a test failure
<!-- bkit:task 3 end -->
<!-- bkit:task 4 start -->
- [ ] **TASK 4:** Workflows route exit 81 from the test gates back to the turn loop
  - **UPDATE:** `.bkit/core/workflows/bkit-build.md`: Step 7 sub-step 8 (group gate) and the Run-Tests block Route gain **If** exit 81 → end turn, re-run the block, before **Else** → Failure Path
  - **UPDATE:** `.bkit/core/workflows/bkit-debug.md`: the `tests run` block in Context (local tests) gains the same exit 81 route
  - **UPDATE:** `.bkit/core/.bkit/workflows.md`: § Commands names `bkit tests run` among the blocks that exit 81 (tests lock held)
  - **DEPENDS ON:** 3
  - **DONE WHEN:** every `tests run` block in `.bkit/core/workflows/*.md` routes exit 81 to a re-run; `pnpm vitest run .bkit/core/engine/audits/workflows/workflow-shape.test.ts` passes; mirrors regenerated with no `bkit check` drift
  - **TEST FIRST:** n/a — workflow prose; shape covered by the existing workflow-shape test
<!-- bkit:task 4 end -->
<!-- bkit:group 2 end -->

<!-- bkit:group 3 start -->
### TASK GROUP 3: bkit's own raw vitest runs queue too
<!-- bkit:task 5 start -->
- [ ] **TASK 5:** Vitest global setup takes the tests lock for heavy raw runs in bkit's repo
  - **CREATE:** `vitest.test-lock.ts`: a pure `testLockDecision({ filters, env, exists })` (light when every filter is an existing file; skip under CI or a live `LOCAL_STACK_LOCK_OWNER_tests`) and a global setup that takes the `tests` lock through `scripts/ci/bkit-machine-lock.sh` for heavy runs and releases it on teardown
  - **UPDATE:** `vitest.config.ts`: register the global setup; `maxWorkers` from `BKIT_TEST_WORKERS` when set
  - **CREATE:** `.bkit/core/engine/audits/repo/vitest-test-lock.test.ts`: the tests below, beside `vitest-timeout-budget.test.ts`
  - **DEPENDS ON:** 1
  - **DONE WHEN:** `pnpm vitest run .bkit/core/engine/audits/repo/vitest-test-lock.test.ts` passes; with one `pnpm test` running, a second `pnpm test` in another worktree prints the waiting line, and `pnpm bkit:test:file <one file>` does not wait
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/repo/vitest-test-lock.test.ts` `a run whose every filter is an existing test file is light and takes no lock` fails on module not found
    - `.bkit/core/engine/audits/repo/vitest-test-lock.test.ts` `a run with no filters, or a pattern filter, is heavy and takes the tests lock` fails on module not found
    - `.bkit/core/engine/audits/repo/vitest-test-lock.test.ts` `a run started under a live tests-lock owner takes no lock` fails on module not found
    - `.bkit/core/engine/audits/repo/vitest-test-lock.test.ts` `CI=true takes no lock` fails on module not found
    - `.bkit/core/engine/audits/repo/vitest-test-lock.test.ts` `BKIT_TEST_WORKERS sets maxWorkers when present` fails on maxWorkers left at vitest's default
<!-- bkit:task 5 end -->
<!-- bkit:group 3 end -->

### Reuse Inventory

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| Machine-wide named locks with slots | `.bkit/templates/scripts/ci/bkit-machine-lock.sh` | `grep -rln 'local-stack-lock' .bkit scripts`; `grep -rln flock .bkit scripts`; app-gether-life `git grep local-stack-lock` | `.bkit/templates/scripts/ci/bkit-local-stack-lock.sh` — waits, names the holder, never stale, CI no-op; missing named / machine-wide / slotted locks. app-gether-life's copy adds named locks | NEW | Rename of the existing script, extended with app-gether-life's named-lock API; the old file is deleted (Supersession Inventory) |
| Lock script tests | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` | `grep -rl 'bkit-local-stack-lock' .bkit/core/engine` | `.bkit/core/engine/audits/templates/local-stack-lock.integration.test.ts` | NEW | Its tests move here with the script rename, plus the named-lock tests |
| bkit's own copy of the lock | `scripts/ci/bkit-machine-lock.sh` | `ls scripts/ci`; `dogfood-templates.test.ts` entry | None — bkit does not adopt the stack lock today | NEW | bkit's repo now takes the tests lock from vitest's global setup |
| `bkit tests run` lock tests | `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` | `ls .bkit/core/engine/commands/workflow/tests*` | `.bkit/core/engine/commands/workflow/tests.test.ts` — unit tests, no real subprocess lock | NEW | Needs real lock processes; kept apart from the unit file |
| Heavy / light decision for raw vitest runs | `vitest.test-lock.ts` | `grep -n globalSetup vitest*.ts` | None — no global setup today; `vitest.timeout-budget.ts` is the sibling pattern | NEW | Root vitest helper beside `vitest.timeout-budget.ts` |
| Heavy / light decision tests | `.bkit/core/engine/audits/repo/vitest-test-lock.test.ts` | `grep -rl timeout-budget .bkit/core/engine` | `.bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts` — sibling | NEW | Same place the sibling helper's tests live |

### Supersession Inventory

<!-- prettier-ignore -->
| Existing artifact | Replaced by | Decision | Justification |
| --- | --- | --- | --- |
| `.bkit/templates/scripts/ci/bkit-local-stack-lock.sh` | `.bkit/templates/scripts/ci/bkit-machine-lock.sh` | DELETE | Renamed and generalised; adopted consumer copies are theirs and keep working |
| `.bkit/core/engine/audits/templates/local-stack-lock.integration.test.ts` | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` | DELETE | Tests move with the script |

### Open Questions & Assumptions

- **Assumption:** the engine may run the packaged template from `getTemplatesRoot()` (`.bkit/templates/` ships in the npm package, `package.json` `files`). That is a new pattern: no other engine verb executes a copy-and-own template. Planning confirms this, or moves an engine-owned copy under `.bkit/core/`.
- **Assumption:** vitest's global setup can read the run's CLI filters (vitest exposes `filters?: string[]` on its run APIs). Planning confirms the exact field available to a global setup; if none, the light-run rule falls back to `bkit:test:file` setting a skip variable.
- **Assumption:** `--lock-wait-s` default 60 matches `bkit runs dispatch`'s poll budget and stays well under the agent's 10-minute tool-timeout ceiling.

### Breaking Changes & Naming

- Template file renamed: `.bkit/templates/scripts/ci/bkit-local-stack-lock.sh` → `bkit-machine-lock.sh`. No migration: consumers' adopted copies are their own (any path, any name) and keep working; `syncTemplateCopies` prunes the old name from `.bkit/templates/` and the upgrade report prints `removed:`.
- Function names (`take_local_stack_lock` etc.), env names (`BKIT_LOCAL_STACK`, `LOCAL_STACK_LOCK_WAIT_S`, `LOCAL_STACK_LOCK_OWNER`) and the unnamed stack lock's file path are unchanged, so an adopted copy and the new script exclude each other.
- New: `BKIT_TEST_SLOTS`, `BKIT_TEST_WORKERS`, `LOCAL_STACK_LOCK_OWNER_<name>`, `bkit tests run --lock-wait-s`, `bkit tests run` exit 81.
- Doc section renamed: `.bkit/templates.md` § Local stack lock → § Machine lock.

### Out of Scope

- Catching raw `npx vitest` (or any runner) in consumer repos with a host-level hook on Claude / OpenCode / Codex / Cursor / Antigravity: separate follow-up.
- Upstreaming app-gether-life's `scripts/ci/local/load-gate.mjs` (one runner deciding whether to overlap its own jobs, by projected load and macOS memory pressure). Related, but it solves overlap inside one runner, not between agents.
- Changing `vitest.timeout-budget.ts`, or serializing anything on CI.

### References

- `.bkit/templates.md` § Local stack lock — one run at a time on a shared stack
- `.agents/rules.md` § Shared local stack
- `.bkit/workflows.md` § Commands (exit 81 turn-loop hand-back)
- `.bkit/templates/scripts/ci/bkit-local-stack-lock.sh`
- `.bkit/core/engine/audits/templates/local-stack-lock.integration.test.ts`
- `.bkit/core/engine/commands/workflow/tests.ts` (`runToLog`, `testsCommand`)
- `.bkit/core/engine/install/template-copies.ts` (`syncTemplateCopies` prunes removed templates)
- `vitest.timeout-budget.ts`
- app-gether-life `scripts/ci/local/local-stack-lock.sh` (named locks, lock order) and `scripts/ci/local/load-gate.mjs` (lag-aware overlap check)
- `docs/failures.jsonl` key `subprocess-integration-tests-time-out-at-5000ms-under-high-load`
- `docs/failures.jsonl` key `install-upgrade-integration-tests-flake-on-default-5s-timeout`
- `docs/knowledge.jsonl` key `local-pnpm-test-full-parallelism-integration-timeouts-flake`
- `docs/roadmap.md` item 10 — Fix the flake and timeout cluster

### Proposed answer to "one run at a time, or N slots?"

**Recommendation:** fixed slots worked out from the hardware, not decided from live CPU/RAM load. Plus a split between heavy and light runs, so a single-file test run never queues behind a full gate.

**Why not decide from live load**

- **It lags.** The load average is a smoothed ~1-minute figure. Two agents that check at the same moment both see a quiet machine and both start, which is the exact pile-up this issue is about. `vitest.timeout-budget.ts` already notes the reading "sees a quiet machine before that load has built up".
- **It counts everything.** Builds, Docker, the agents themselves and the browser all feed it. A threshold that works one day misfires the next, and "waited because load was 14" is hard to explain or debug.
- **RAM is platform-specific.** macOS memory pressure and Linux `/proc/meminfo` read differently, and a shipped template must work on both. RAM belongs in the slot calculation, not in a live check.

**Proposed shape**

1. **Fixed slots from hardware.** Work out how many heavy runs fit from the core count and RAM, with an env override. Every run gets the same answer, so behaviour is predictable. Note: Apple Silicon splits cores into fast and slow (the 10-core MacBook here is 4 performance + 6 efficiency, `sysctl hw.perflevel0.physicalcpu` / `hw.perflevel1.physicalcpu`), so real capacity is below the raw core count. That machine → 1 heavy slot.
2. **Each run gets its share.** With N slots, the lock script exports a worker count (e.g. `BKIT_TEST_WORKERS` = cores / N). Each consumer's gate script passes it to its own runner (`--maxWorkers` for vitest, the equivalent setting elsewhere), which keeps the shipped part independent of the stack.
3. **Heavy vs light runs.**
   - **Heavy:** full gates (`bkit tests run`) take a slot.
   - **Light:** single-file runs (`bkit tests red`, `bkit:test:file`) skip the heavy lock or use a small separate pool. They use about one core, and queuing an agent's write-test-then-fix loop behind a multi-minute gate costs more than the extra load.
4. **Live load as a guard only (optional).** Slot free but the machine already badly overloaded by something else → wait briefly and say why. Never the main rule.

**Mechanism:** N lock files, each held the way `.bkit/templates/scripts/ci/bkit-local-stack-lock.sh` holds its lock today (a perl process holds the `flock`, so a lock frees itself within a second of its holder dying). A run takes any free slot. When all are taken it waits and names every holder.

**To measure in design, not yet measured:** for CPU-bound work, two half-width runs finish in about the same total time as one full-width run after another. Two slots only win on idle gaps, such as a run's slow last few files and its startup. Time it: one full-width gate twice in a row, versus two half-width gates at once, on the same machine.

Body rewritten as a change issue (Narrative, Success Criteria, Derived Test Matrix, 5 tasks in 3 groups); `bkit tests plan-check` on the body: 0 problems, 0 existence findings. Label `next:design` → `next:plan`.

Where it differs from the slots comment above, the body wins:

- **Slots:** default 1 heavy run per machine plus a `BKIT_TEST_SLOTS` override. No hardware formula, no live-load guard, so no up-front 1-vs-2 timing is needed.
- **Rename without migration:** the script is copy-and-own. Consumers keep their copies at their own paths (app-gether-life: `scripts/ci/local/local-stack-lock.sh`), and `syncTemplateCopies` prunes the old name from `.bkit/templates/` on upgrade.
- **Named-lock API upstreamed:** comes from app-gether-life's adopted copy, which already holds a second named lock (`e2e-phones`) beside the stack lock.

## Owner answers to the plan's open questions

The owner has answered all 10 open questions in [724-machine-wide-test-plan.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202610/724-machine-wide-test-plan.md). Three answers differ from the plan's recommended option, so the plan has to be redone before it is built.

<!-- prettier-ignore -->
| # | Question | Answer |
| --- | --- | --- |
| 1 | Which copy of the lock script `bkit tests run` executes | **Changed: none of A/B/C.** The engine never runs the script. A consumer copies `bkit-machine-lock.sh` to `scripts/ci/`, customises it, and wraps their `bkit:gate:*` scripts in `package.json` (`bash scripts/ci/bkit-machine-lock.sh run --lock tests -- <gate>`), the same as every other template. bkit's own `package.json` does the same. `bkit tests run` only turns the script's exit 75 into exit 81. |
| 2 | `/usr/bin/perl` missing | A: refuse (`run` exits 73, `bkit tests run` exits 4) |
| 3 | Lock order enforced or documented | A: enforced |
| 4 | Worker count for raw `pnpm test` with slots > 1 | A: `maxWorkers` from `BKIT_TEST_WORKERS` only when present |
| 5 | Vitest watch mode | A: takes no lock |
| 6 | Pre-push hook and subagent prompts that run gates raw | **Changed: new option D.** No change to the hook or the prompts, because the wrapped gate scripts carry the lock. TASKS 7 and 8 drop out. A raw caller that gives up waiting sees exit 75 plus the holder line. |
| 7 | Long default wait when an agent with no terminal hits the lock | **Changed: A′.** The lock script itself waits 60 s instead of 3600 s when stdin is not a terminal and `LOCAL_STACK_LOCK_WAIT_S` is unset, then exits 75 naming the holder. This covers every repo that wires the script in, not only bkit's vitest setup. |
| 8 | Host sandbox can't write `~/.cache/bkit/` | A: refuse, naming the path and the host setting |
| 9 | Limit on retries after exit 81 | A: no limit |
| 10 | `BKIT_TEST_WORKERS` at 1 slot | A: floor(cores / slots) |

Recorded in `docs/decisions.jsonl`:
- `724-engine-runs-packaged-lock-template` (Q1)
- `724-lock-order-tests-named-stack-enforced` (Q3)
- `724-shipped-gate-calls-run-through-tests-run` (Q6)
- `724-lock-script-short-wait-without-tty` (Q7, new)

These are committed on `dev` (292cb9857, 90843c6ce, 1aca511ad, f83a0e77a) and not pushed yet.

**Next step:** re-run `/bkit-plan #724` so that the plan matches these answers.

**Plan brought up to date with recent commits.** Three new open questions need the owner's answer before building.

**Why:** bkit's plan-currency check (`bkit tasks currency`) compared the plan with every commit since it was last revised (0617256d0). No commit already builds this lock or adds a competing one. But how subagents run tests has changed:
- **Subagents no longer call the gates directly.** They now run `bkit tests changed --fallback=…`, which turns any gate failure into exit 1. So a subagent that gives up waiting for the lock would see a plain test failure, not the "exit 75 plus who holds the lock" message the plan promised.
- **There is a new test-running gate,** `bkit:gate:changed`.

**What changed in `docs/plans/202610/724-machine-wide-test-plan.md`:**
- **New TASK 10:**
  - `bkit tests changed` gets the same lock-wait handling as `bkit tests run`: a `--lock-wait-s` flag, exit 81 meaning "a wait, run it again", and the lock holder's name.
  - The four prompts that run `bkit tests changed` say to re-run on exit 81.
  - A lock wait writes no `test-run` status row.
  - This went into a new task because TASK 5 was already at its 10-test limit.
- **TASK 6:** also puts `bkit:gate:changed` under the lock.
- **TASK 7:**
  - Covers the `tests run` command handed to the gaps-remediate subagent, which the existing guard cannot see.
  - Fixes the notes on `GATE_CALLERS` and `PROBES`, plus moved line references.
- **TASK 5:** the `tests red` test and the Concrete Example use the current flags, `--group` / `--plan`.
- **TASKS 4 and 5:** regenerate the new `.bkit/core/.bkit/cli.md` with `pnpm cli:sync`, and check it with `cli-doc.test.ts`.
- **TASK 3:** updates the renamed `bkit-build-plan-tasks.md` and the new `bkit-build-plan-tests.md`.
- **TASK 1:** the `docs/architecture.md` lines it planned to add have already landed, so it now only checks they are there.

**Open questions for the owner:** new, unanswered. TASKS 6 and 10 are written for the recommended option, which is also the default if left unanswered.
- **Open Question 11:** how `bkit tests changed` reports a lock wait.
  - A) exit 81, like `tests run` (recommended)
  - B) the prompts tell subagents to spot the wait in the output
  - C) change nothing
- **Open Question 12:** whether a lock wait writes a `test-run` status row.
  - A) no row (recommended)
  - B) a row with no verdict
  - C) a new row type
- **Open Question 13:** whether `bkit:gate:changed` takes the lock.
  - A) wrap it like the full gates (recommended)
  - B) let each test run inside it decide
  - C) never lock it
  - Note: `vitest related` hands vitest no file filters, so the light-run rule would treat it as a heavy run anyway.

Open Question 6 keeps its answer D, with a note that its starting assumption has changed. The Open Questions confirmation box is still ticked from before, so it needs a fresh look now that there are new questions.

**Checks:** `bkit tests plan-check` reports 0 problems.

**Commit:** 9a305afda on local `dev` (not pushed yet).

## Owner answers, round 2 (2026-11-02)

**Why now.** Today two full test gates ran at the same time on one laptop and a `/bkit-build` run failed its group gate on load timeouts alone. That is the pile-up this issue fixes. Reading the plan's answers against it, I changed four and added two. Everything below is written into `docs/plans/202610/724-machine-wide-test-plan.md` in place (commit c65200076 on dev): Open Questions 7, 8, 9 and 10 carry an "Answered by owner, revised" line, Open Questions 14 and 15 are new, and TASK 11 is new. The per-host facts the answers rest on are in `.bkit/providers.md` § Long-running shell commands, with the sources.

### 1. The lock wait is a host budget, not a number in the script (new Open Question 14, answer B)

A fixed 60 s fits no repo. How long a waiter needs depends on how long the holder's gate runs. How long a waiter can afford depends on what its host does with a shell command that outlives one tool call, and that differs per host. Checked today:

- **Claude Code:** a `Bash` call that passes its timeout (2 minutes by default, up to 10) is moved to the background and Claude is told when it exits. Unattended sessions (`-p`, SDK, CI, cloud) stop a background command after 30 minutes.
- **Codex CLI:** unified exec keeps the process alive as a resumable session; the model reads on with `write_stdin` polls, at most 5 minutes per poll (`background_terminal_max_timeout`). Nobody tells the model when it ends.
- **Google Antigravity:** `run_command` goes async after `WaitMsBeforeAsync`; the agent polls it through `manage_task`. No completion signal documented.
- **Cursor:** the agent terminal has no documented timeout or background contract (the CLI's Shell Mode caps a command at 30 s). Forum reports describe auto-backgrounding after a timeout, but that is not a documented contract.
- **opencode:** `bash` runs in the foreground until the call's timeout; no background option.

Decision: `bkit tests run` and `bkit tests changed` default `--lock-wait-s` from `BKIT_LOCK_WAIT_S`, else 60. bkit ships `BKIT_LOCK_WAIT_S=1200` in the Claude Code settings `env` (a 20-minute wait plus a 10-minute gate stays inside the 30-minute cap on unattended sessions) and nothing for the other hosts, which loop on exit 81 in 60 s calls. That costs one re-run per minute waited and nothing else. The script's own 60 s no-TTY default stays as the floor for raw callers with no engine in front.

On "report back once the test run is done": on Claude Code that is exactly what happens now. The call moves to the background while the gate waits for the lock and runs, and the result arrives when it exits, with no 81 loop. On the other hosts the 81 loop is the report-back, because none of them tells the agent when a command ends.

### 2. The holder line says how long the wait will likely be (part of Open Question 14)

The script records each `tests` run's held time on release (`<lock dir>/tests.last`), and the waiting note and the give-up line end in `last run took 9m50s`, or `no earlier run`. This also gives Open Question 9 (no re-run ceiling) the test it lacked: a holder held past three times its last run is reported as stale, with pid and start time, instead of re-run again.

### 3. The push step (new Open Question 15, answer A, new TASK 11)

Under Open Question 6 D the shipped pre-push hook runs the gate raw. A workflow's `bkit branches push` behind a held lock therefore fails with git's exit code, the give-up line buried in the hook output, after only the script's 60 s. Decision: `branches push` passes the wait and its run name to `git push` (hooks inherit the environment), classifies the hook output with the same classifier `tests run` uses, and exits 81 with `lockHolder` on a `tests`-lock give-up. Every `branches push` block in `bkit-build.md`, `bkit-debug.md` and `bkit-ship.md` routes 81 → end turn, re-run, guarded in `local-gate-audit.test.ts`.

### 4. Open Question 10 revised to B

`BKIT_TEST_WORKERS` = max(1, floor(cores / slots) - 1). One gate at a time is the point of this change, and the agent, its hooks and the other sessions still run on the same cores. A gate given all 10 cores recreates the pile-up one gate at a time. At one slot this is vitest's own default width.

### 5. Open Question 8 stays A, plus shipped grants

Where a host has a setting that grants `~/.cache/bkit/`, bkit ships it in the host settings it already writes (Claude Code's sandbox write allow-list; the key is confirmed against the Claude Code sandbox docs at build time). Codex `sandbox_workspace_write.writable_roots` stays the owner's step, since bkit writes no `.codex/config.toml`.

### 6. Open Question 7 stays A′ in shape

The script defaults the wait when stdin is not a TTY and no wait is passed. The number is no longer the design; see 1.

**Unchanged:** Open Questions 1 to 6 and 11 to 13. The plan now has 11 tasks in 5 groups, every task at or under the ten-test cap (TASK 2 sits at 10). The issue body is untouched.

**Correction to point 2 above (the holder line's "last run took").** Keying the record by lock name would show repo A's gate time to a waiter queued behind repo B's gate, and the two can differ by a lot. The script now keeps one line per checkout in `<lock dir>/tests.last` (`<checkout path><TAB><seconds>`, replaced in place on every release), and the waiting note and the give-up line print the current holder's own last run, or `no earlier run` when that checkout has none. Open Question 14, TASK 2 and the matrix row are updated in the plan in place.

## #899 — Build: owner's Fix now direction never reaches the build agents (closed)

### Failing test or CI run

none yet

### What happened

During `/bkit-build #891`, challenge round 1 logged a hard blocker (TASK 16, `**Fixable:** false`). Its plan block put two design directions to the owner. At the Decision Pause the owner answered `Fix now` and picked one direction. The answer is written to `build-decision-1-3.md`.

The owner's direction never reached the agents that do the fix:

- Decision Pause step 5 says that for a challenge task answered `Fix now`, "keep that task open. It runs as it is." The task block is not reshaped. Only a new task block is shaped "by the owner's direction".
- So the plan block still holds the text written before the decision. Its `TEST FIRST` line describes the option the owner turned down ("fails on verdict `all` when the gate recorded a failed non-test stage").
- Step 7's `@bkit-build-plan-tests` and `@bkit-build-plan-tasks` get no decision file in their `Read:` list. The **Owner decisions** contract also bars the orchestrator from restating the answer in `Context`.

As a result, the test writer logged TASK 16 `BLOCKED` ("the owner must decide the signal") and `tests red` recorded the test as `missing`. Run as written, the retry blocks the same way, and the task reaches the summary unfixed even though the owner already decided it.

### What should happen

When the owner answers `Fix now` on a `Fixable: false` challenge task and gives a direction, the fix round builds that direction. Two possible shapes:

- The Decision Pause rewrites the task block (its `DONE WHEN` and `TEST FIRST`) to the owner's direction, the same way it shapes a new task block.
- Step 7's agents (and Step 8 verify) get the matching `build-decision-{RUN}-*.md` in their `Read:` list.

A hard blocker answered `Fix now` with no direction needs a defined route too, since no agent can settle it alone.

### Steps to reproduce

1. Run `/bkit-build` on a plan until a challenge round logs a `Fixable: false` task whose block offers alternatives.
2. Answer that Decision Pause item `Fix now` and name one alternative.
3. Watch Step 7: the tests agent's brief holds the original block, and its `Read:` list has no decision file.

### How often

Every `Fix now` answer to a `Fixable: false` challenge task.

### Affected area

`.bkit/core/workflows/bkit-build.md`: Decision Pause step 5 (`Fix now` for a challenge task), Step 7 sub-steps 4 and 7 (`Read:` lists), and the Contract **Owner decisions** bullet. Also check the matching Step 9 / Step 10 prompts and `/bkit-debug`, which may share the pause.

### References

- #891 (run where it was seen): `docs/plans/202611/logs/891-build-gate-stuck/build-decision-1-3.md`, `build-plan-tests-6-log.md`, `build-tests-red-6-1.md`

Merged into #903 as Part 1, with this issue's full text copied there. #903 runs after #891 ships, because #891's build is running now and changes the same Decision Pause code. #891, #899 and #900 are the same kind of bug: the owner answers at the Decision Pause, and a later step ignores the answer. Closing this one as not planned.
