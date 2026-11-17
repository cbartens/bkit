Verdict: PASS
Failures: 0
<!-- verdict:end -->

# Plan Summary

## Verdict

PASS

- No unresolved finding, failing check, open task, accepted limitation or open deferral.

## Steps

<!-- prettier-ignore -->
| Step | Verdict | Failures | Attempts | Artifact |
| --- | --- | --- | --- | --- |
| plan-start-workflow | - | - | 1 | - |
| plan-worktree-setup | - | - | 1 | `docs/plans/202611/logs/914-build-planned-test/plan-input-1.md` |
| plan-generate | - | - | 1 | `docs/plans/202611/logs/914-build-planned-test/plan-v1-draft.md`, `docs/plans/202611/logs/914-build-planned-test/plan-generate-check.md` |
| plan-fetch-context | - | - | 1 | `docs/plans/202611/logs/914-build-planned-test/related-deferrals.md`, `docs/plans/202611/logs/914-build-planned-test/related-failures.md`, `docs/plans/202611/logs/914-build-planned-test/related-issues.md` |
| plan-review | CONCERNS | 13 | 1 | `docs/plans/202611/logs/914-build-planned-test/plan-review-1.md`, `docs/plans/202611/logs/914-build-planned-test/plan-review-2.md`, `docs/plans/202611/logs/914-build-planned-test/plan-scope-check.md` |
| plan-apply-review | PASS | - | 1 | `docs/plans/202611/logs/914-build-planned-test/plan-v2-reviewed.md`, `docs/plans/202611/logs/914-build-planned-test/plan-update-check.md` |

## Resolved Findings

- plan-review CONCERNS, resolved by plan-apply-review

## Assessment History

<!-- prettier-ignore -->
| Step | Verdict | Attempt | Artifact |
| --- | --- | --- | --- |
| plan-start-workflow | - | - | - |
| plan-worktree-setup | - | - | `docs/plans/202611/logs/914-build-planned-test/plan-input-1.md` |
| plan-generate | - | 1 | `docs/plans/202611/logs/914-build-planned-test/plan-v1-draft.md`, `docs/plans/202611/logs/914-build-planned-test/plan-generate-check.md` |
| plan-fetch-context | - | 1 | `docs/plans/202611/logs/914-build-planned-test/related-deferrals.md`, `docs/plans/202611/logs/914-build-planned-test/related-failures.md`, `docs/plans/202611/logs/914-build-planned-test/related-issues.md` |
| plan-review | CONCERNS | 1 | `docs/plans/202611/logs/914-build-planned-test/plan-review-1.md`, `docs/plans/202611/logs/914-build-planned-test/plan-review-2.md`, `docs/plans/202611/logs/914-build-planned-test/plan-scope-check.md` |
| plan-apply-review | PASS | 1 | `docs/plans/202611/logs/914-build-planned-test/plan-v2-reviewed.md`, `docs/plans/202611/logs/914-build-planned-test/plan-update-check.md` |

## Acceptance Scenario

> [!CAUTION]
> 🛑 The owner reads and confirms this section.
> This is the feature's testable contract. The implementation, the tests and the verification all follow from what you confirm here, so a mistake here carries into every later step.
>
> **You only need 👤-marked sections** (Acceptance Scenario, Breaking Changes, Open Questions & Assumptions). The agent handles the rest.

### Narrative

⚠️ MISSING: no design doc, no issue Narrative and no audit report — human must provide before plan proceeds

### Success Criteria

⚠️ MISSING: no design doc, no issue Narrative and no audit report — human must provide before plan proceeds

### Process Sketch

- **WHEN** a code step changes a planned test of an earlier group and its log names that test on no `BLOCKED` line **→ THEN** that step's `steps finish` exits 11, naming the test, and nothing is committed.
- **WHEN** a code step keeps a needed change to a planned test and its log holds `` BLOCKED — TASK {N}: test `{file}` `{name}` — {why} `` for it **→ THEN** the step finishes, and its `step-done` row records the test, its new lines' hash and the reason.
- **WHEN** a later code step leaves that recorded change as it is **→ THEN** it finishes without a `BLOCKED` line of its own.
- **WHEN** build Step 15 runs and `tests green` lists one or more `changed` tests **→ THEN** the owner answers each at a `CHANGED_TESTS` Decision Pause; a headless or `ask: false` run takes `Accept (assumed)`, and ship asks the owner to confirm it.
- **IF** a red row names a test that the plan's `TEST FIRST` fields no longer name **→ THEN** the lock skips it, and no step is refused for it.
- **IF** a code step's finish has no `--plan`, or its `--plan` is missing or names no test while red rows exist **→ THEN** it exits 2 (usage) and writes nothing.

### Concrete Example

**Setup:** The owner runs `/bkit-build` headless on a plan of 7 task groups. Group 3's Task 8 planned test `bkit decisions apply --by=rerun > records the re-run under Q1 and closes the file` in `.bkit/core/engine/commands/workflow/decisions.test.ts` is recorded red, then green. Group 6's first red row still names `bkit tests base > a gate red on a non-test stage as well never reads all`, state `missing`, a test the owner replaced in the plan after a decision.

**Steps:**

1. Group 7's code agent (Task 20) makes `decisions apply --by=rerun` refuse a `Gate: FAIL` file with no loop question. It changes the setup lines of group 3's planned test, keeps its assertions and appends `` BLOCKED — TASK 20: test `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions apply --by=rerun > records the re-run under Q1 and closes the file` — the file the test composes now needs a loop question; assertions unchanged `` to its log, then `DONE — TASK 20`. → `steps finish --step=build-plan-tasks --group=7 --plan=…` exits 0, and the row's `changedTests` names the test and the reason. Group 6's superseded test is not checked.
2. The holistic fix round edits help text only. → Its `steps finish` exits 0: group 3's test still matches the recorded change.
3. Step 15 runs `tests green` over the whole plan. → `changed` lists group 3's test with Task 20's reason. The run is headless, so the `CHANGED_TESTS` pause records `Decision: Accept (assumed)`.
4. The owner runs `/bkit-ship`. → Confirm Assumed Items asks the owner to confirm or reject the changed test.

**Outcome:** The build reaches its summary instead of the Failure Path, the owner sees the one planned-test change at ship, and no step was refused for a test it did not change.

### Edge Cases

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| A code step changes two planned tests, and its log's `BLOCKED` lines name only one | Exit 11 names only the unnamed test; nothing is written, so neither change is recorded. |
| A code step changes a test that a `BLOCKED` line recorded earlier in the run | Exit 11, unless this step's log names it on a new `BLOCKED` line, which records the newer lines. A line whose reason an earlier `changedTests` record of that test already carries is not new, so a line left in a log that a group's attempts share (`build-plan-tasks-{GROUP}-log.md` has no attempt number) lets no re-change through. |
| The tests step records a new red for a test after a code step recorded a change to it | The newer red row is the baseline, because the latest record in `status.jsonl` order wins. |
| A `BLOCKED` line names a planned test that the step did not change | Nothing is recorded for it; it stays an ordinary blocked-task line for verify to read. |
| A `BLOCKED` line names the test by the last ` > ` segment of its suite path | It matches, the same way the lock finds a test by its last segment. |
| A `BLOCKED` line has no `— {why}` reason after the test | It names no test, so the change is refused as an unlogged one. |
| A gaps-remediate log names the test on a `` BLOCKED — Gap {N}: test `{file}` `{name}` — {why} `` line | It lets the step through, the same as the `TASK` form. |
| The code step finishes with no `--plan` | Exit 2 (usage), nothing written. |
| A red row's test is still named by the plan but under a different task number | It is not plan-named under the recorded task, so it is skipped; the new task's own red row locks it. When the new task sits in a group whose red is already recorded, no new red row is written, so the test is locked nowhere until Step 7 is re-run for that group and records its red. |
| `--plan` names a missing file, or a plan whose `TEST FIRST` fields name no test while red rows exist | Exit 2 (usage), nothing written: an empty plan-named set would switch the lock off. |
| A later group's code step changes a planned test of a finished group, whose tasks Step 8's `tasks tick` has ticked `[x]` | The lock still checks it: done tasks stay in the plan-named set. |
| A `tests red` re-run (the tests step's restore on the loosened-test arm) meets a test a code step changed under a `BLOCKED` line | The test stands while its lines match the recorded change: it is not re-run, and the recorded change and its reason stay its baseline. |
| `tests green` runs on a plan with no recorded change | `changed` is `[]`, the report has no `Changed by a code step` section, and Step 15 goes straight to the `UNPROVEN` check. |
| The owner answers `Stop` at the `CHANGED_TESTS` pause | The run is handed over and stays `IN_PROGRESS`, as for any Decision Pause stop. |

## Open Questions

> [!CAUTION]
> 🛑 The owner reads and confirms this section.
> These are the unknowns and assumptions this plan relies on. An unresolved question is a risk, and a wrong assumption breaks what follows. **If** there are none → write `None`.

- **Open Question Q1:** The Narrative and Success Criteria have no source: there is no design doc, the issue is not in the change shape (`.bkit/trackers.md` § Issue shapes) and there is no audit report. → The owner resolves it by answering here.
  - **Options:** A) Adopt the issue's `Expected` bullets and the owner's three decisions word for word as the Success Criteria, and write a Narrative from the owner comment's `Why` paragraph — the criteria then come only from text the owner already wrote, and the owner confirms the wording. The criteria would be: point 1, a code step that changes another group's planned test is flagged in that step, not in a later holistic round; point 2, a red row whose test the plan no longer names is not checked; point 3, a `BLOCKED` line naming the test lets the step through, the change reaches the owner at the build Decision Pause, a headless or `ask: false` run records an assumed accept that ship asks the owner to confirm, and a changed test with no `BLOCKED` line naming it is still refused · B) The owner writes both sections — the exact words the owner wants, at the cost of a round trip before build.
  - **Recommended:** A) — every criterion the plan tests already sits in the issue's `Expected` list and the owner's decisions, so adopting them adds nothing new.
  - **Default if unanswered:** Both sections keep the `⚠️ MISSING` marker, and the plan does not proceed to build.
- **Open Question Q2:** Where a planned test that a code step changed under a `BLOCKED` line reaches the owner. → The owner resolves it; the plan is written for the recommendation.
  - **Options:** A) A separate `CHANGED_TESTS` Decision Pause at Step 15, asked once, before the `UNPROVEN` pause — clear item semantics and the same ask-once shape as `UNPROVEN`, but a run with both kinds stops twice at the end · B) Items inside the `UNPROVEN` pause — one stop, but an `UNPROVEN` Accept writes a `TEST EXCEPTION`, which is the wrong record for a changed test, and the ask-once rule then covers two kinds · C) A gap in the group's verify report (Step 8) — the owner hears sooner, but verify pauses only when a limit is used up or a gap is unfixable, and an unfixable gap is a hard blocker that sends a headless run to the Failure Path, against the owner's decision.
  - **Recommended:** A) — it is the only option that keeps a headless run going with an assumed accept and records an owner Accept as a `docs/decisions.jsonl` row.
  - **Default if unanswered:** A).
- **Open Question Q3:** What "reject" means for a changed-test item. → The owner resolves it; the plan is written for the recommendation.
  - **Options:** A) Options `Accept` / `Stop`: `Stop` hands the run over, and the owner restores the test or reworks the code before resuming — it mirrors the `UNPROVEN` item and adds no new routing. A headless run's assumed accept is asked again at ship, where Confirm Assumed Items merges either way (`bkit-ship.md:374`): a reject there records a `needs-decision` deferral and puts nothing back, so the changed test still merges · B) Options `Accept` / `Fix now` / `Stop`: `Fix now` adds a new last-group task that restores the test's intent — the reject stays inside the run, but `From: summary` needs a task-placement rule, and a change that the fix group itself makes needs asking again.
  - **Recommended:** A) — a rejected change means the code step's premise was wrong, which is a judgement the owner makes, not a task an agent can be briefed on from the pause.
  - **Default if unanswered:** A).
- **Open Question Q4:** How the code-step finish learns which tests the plan names. → The owner resolves it; the plan is written for the recommendation.
  - **Options:** A) A required `--plan` flag on the three code-step finishes, as `build-plan-tests` already has — explicit and tested, three workflow lines change, but an orchestrator session still holding the old workflow text exits 2 at its next code-step finish once its `{BKIT}` reaches the new engine, and recovers only by resuming (`Breaking Changes` row 2) · B) Derive the plan path from the status file's folder (`docs/plans/{YYYYMM}/logs/{FID}/status.jsonl` → `docs/plans/{YYYYMM}/{FID}-plan.md`) — no flag and no break for a run already in progress, but a hidden coupling to the folder layout · C) An optional `--plan` — no usage break, but a call without it silently keeps fault 2.
  - **Recommended:** A) — the superseded-test skip is then always on, and a missing flag fails loudly; Task 1 passes the flag from the workflow before the engine requires it, so only a session that read the old text before the change meets the exit 2.
  - **Default if unanswered:** A).
- **Assumption:** A code agent copies the `BLOCKED` line form from the refusal or its prompt, with an em dash, en dash or hyphen as `doneTasks` accepts. → If agents write another shape, the engine reads no line and refuses the step as it does today; the lock is never weaker.
- **Assumption:** A task whose log holds a `BLOCKED` test line followed by its `DONE — TASK {N}` line keeps `Verdict: PASS`, because the prompts' `FAIL` rule counts only a `BLOCKED` with no later `DONE`. The exit 11 re-ask appends the `BLOCKED` test line after the task's existing `DONE` line, so Task 6 has each re-ask append the `DONE — TASK {N}` (or `DONE — Gap {N}`) line again after it. → If wrong, the step's verdict reads `FAIL`, `summary.ts:510-515` keeps `BLOCKED` as the task's last disposition, and the group goes through verify and remediate for a task that is done.
- **Assumption:** The first `--artifact` of each code-step finish is the agent's own log (`reask.artifact` already relies on this). → If a step passes another file first, the engine reads `BLOCKED` lines from the wrong file.
- **Assumption:** Rows written by the current engine carry no `changedTests` field, and a row without it records no change. → Nothing breaks for runs in progress: their reds stay the baseline.
- **Assumption:** No caller outside `.bkit/core/workflows/bkit-build.md` runs `steps finish` for the three code steps (the verb is `use: workflow`, and `grep -l` over workflows, prompts and templates finds only that file). → If a consumer script does, it exits 2 until it passes `--plan`.
- **Assumption:** #891's change merges to `dev` before this build starts. #891's re-plan replaces `docs/plans/202611/891-build-gate-stuck-plan.md`, which assumes a dropped accept design, so the overlapping files (today `tests.ts`, `decisions.ts`, `bkit-build.md` and `bkit-build-plan-verify.md`) and this plan's line numbers in `tests.ts`, `bkit-build.md` § Decision Pause and Step 15 are re-checked once that change lands. → If this plan is built first, the two branches conflict in the same Decision Pause and test-first lines, and #891's build keeps hitting fault 1.

## Risks and Action Items

None

## Recommended Next Step

```text
/bkit-build #914
```
