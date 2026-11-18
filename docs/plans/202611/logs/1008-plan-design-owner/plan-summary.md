Verdict: CONCERNS
Failures: 0
<!-- verdict:end -->

# Plan Summary

## Verdict

CONCERNS

- plan-apply-review CONCERNS
- 1 deferral(s) from this run remain open

## Steps

<!-- prettier-ignore -->
| Step | Verdict | Failures | Attempts | Artifact |
| --- | --- | --- | --- | --- |
| plan-start-workflow | - | - | 1 | - |
| plan-worktree-setup | - | - | 1 | `docs/plans/202611/logs/1008-plan-design-owner/plan-input-1.md` |
| plan-generate | - | - | 1 | `docs/plans/202611/logs/1008-plan-design-owner/plan-v1-draft.md`, `docs/plans/202611/logs/1008-plan-design-owner/plan-generate-check.md` |
| plan-fetch-context | - | - | 1 | `docs/plans/202611/logs/1008-plan-design-owner/related-deferrals.md`, `docs/plans/202611/logs/1008-plan-design-owner/related-failures.md`, `docs/plans/202611/logs/1008-plan-design-owner/related-issues.md` |
| plan-review | CONCERNS | 12 | 1 | `docs/plans/202611/logs/1008-plan-design-owner/plan-review-1.md`, `docs/plans/202611/logs/1008-plan-design-owner/plan-review-2.md`, `docs/plans/202611/logs/1008-plan-design-owner/plan-scope-check.md` |
| plan-apply-review | CONCERNS | - | 1 | `docs/plans/202611/logs/1008-plan-design-owner/plan-v2-reviewed.md`, `docs/plans/202611/logs/1008-plan-design-owner/plan-update-check.md` |

## Resolved Findings

None

## Reassessed Findings

- plan-review CONCERNS, remaining findings assessed by plan-apply-review

## Assessment History

<!-- prettier-ignore -->
| Step | Verdict | Attempt | Artifact |
| --- | --- | --- | --- |
| plan-start-workflow | - | - | - |
| plan-worktree-setup | - | - | `docs/plans/202611/logs/1008-plan-design-owner/plan-input-1.md` |
| plan-generate | - | 1 | `docs/plans/202611/logs/1008-plan-design-owner/plan-v1-draft.md`, `docs/plans/202611/logs/1008-plan-design-owner/plan-generate-check.md` |
| plan-fetch-context | - | 1 | `docs/plans/202611/logs/1008-plan-design-owner/related-deferrals.md`, `docs/plans/202611/logs/1008-plan-design-owner/related-failures.md`, `docs/plans/202611/logs/1008-plan-design-owner/related-issues.md` |
| plan-review | CONCERNS | 1 | `docs/plans/202611/logs/1008-plan-design-owner/plan-review-1.md`, `docs/plans/202611/logs/1008-plan-design-owner/plan-review-2.md`, `docs/plans/202611/logs/1008-plan-design-owner/plan-scope-check.md` |
| plan-apply-review | CONCERNS | 1 | `docs/plans/202611/logs/1008-plan-design-owner/plan-v2-reviewed.md`, `docs/plans/202611/logs/1008-plan-design-owner/plan-update-check.md` |

## Acceptance Scenario

> [!CAUTION]
> 🛑 The owner reads and confirms this section.
> This is the feature's testable contract. The implementation, the tests and the verification all follow from what you confirm here, so a mistake here carries into every later step.
>
> **You only need 👤-marked sections** (Acceptance Scenario, Breaking Changes, Open Questions & Assumptions). The agent handles the rest.

### Narrative

An owner answers a plan's or design's open questions after the run closed, and the answers comment lands with the run's other reports, with no friction row and no warning line.

> Assumed from Q1 A until the owner answers Q1: the issue has no Narrative, so this sentence is Q1's proposal, not text from the issue.

### Success Criteria

- After `workflows close --session-dir`, a post with `--session-dir` (plan Step 8, design Step 12) joins the same progress comment as the run's earlier reports. An integration test closes a run, then posts, and checks this.
- That sequence writes no `tracker-comment/comment-association` friction row and prints no "invocation association unavailable" line.
- The run's link is kept somewhere that outlives the session folder, for example the run's `status.jsonl`, and is not worked out from the folder's path.
- A post with no proof of a run at all is still refused, and a test keeps proving it.

> The criteria are the issue's words. Under Q2 A, the first criterion's "a post with `--session-dir`" is read as the plan Step 8 and design Step 12 Owner Answers post, which names the run's status file with `--file`.

### Process Sketch

- **WHEN** a plan or design run starts **→ THEN** `repo info` writes a random progress id into the session folder, the Step 1 report opens the run's progress comment, and `workflows start` writes the run's link as `progress` on its `workflow-started` row.
- **WHEN** a later step reports with the run's status file **→ THEN** the engine reads the link from `status.jsonl` and appends the report to the progress comment, from the worktree or the main checkout.
- **WHEN** `workflows close` has deleted the session folder and the owner answers **→ THEN** the Owner Answers post names the run's status file, finds the link there, joins the progress comment while it is the issue's newest comment, and writes no association friction.
- **IF** the Close Workflow comment is newer than the progress comment **→ THEN** the first answers round opens one new comment, and later rounds append to it.
- **IF** a post carries no proof of a run, or names a status file with no run of its workflow **→ THEN** it exits 2 and reaches no tracker.
- **IF** a run's start row holds no link **→ THEN** its posts use a link built from its FID, workflow, run number and start time, the same from every checkout.

### Concrete Example

**Setup:** The owner runs `/bkit-plan #1008` with the GitHub tracker wired. The run works in `.worktrees/1008-plan-design-owner`; its session folder is `.git/bkit-outbox/sessions/20261118T090000Z-1a2b3c4d/`.

**Steps:**

1. The orchestrator runs `repo info` → the engine creates the session folder with a random `progress-id` file, and the Step 1 report opens progress comment P on #1008.
2. The orchestrator runs `workflows start --session-dir=…` → the engine appends a `workflow-started` row whose `progress` field is the link P was opened with.
3. Steps 2-7 post with the run's status file → each report appends to P.
4. Step 8 runs `workflows close --session-dir=…` → the session folder is deleted, and `branches land` moves the run's `status.jsonl` to the main checkout on `dev`. Step 8 sub-step 4 posts the Close Workflow links comment C, a terminal report that opens a new comment after P.
5. The owner answers the open questions → the orchestrator runs `issues comment --post --workflow=plan --step-number=8 --step-title="Owner Answers" --file="{REPO_ROOT}/docs/plans/202611/logs/1008-plan-design-owner/status.jsonl"` → the engine reads the link from the run's start row and keys the post to run 1. Because C is newer than P, the post opens one answers comment A, linked to the run.
6. The orchestrator commits the round's files, including the post's `engine-action` row in `status.jsonl`.
7. The owner answers a second round → the post appends to A while A is the newest comment, and the round's commit holds a second `engine-action` row with the same key and a new body hash.

**Outcome:** The answers reports are linked to the run and share comment A. No `[bkit-tracker] invocation association unavailable` line is printed, `.bkit/friction.jsonl` gains no `tracker-comment/comment-association` row, and `status.jsonl` on `dev` holds each post's `engine-action` row in its round's commit.

### Edge Cases

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| The Close Workflow comment (`workflows links --post`, terminal) is newer than the progress comment | The newest-comment rule holds: the first answers round opens one new comment; later rounds append to that comment. |
| The owner answers in two rounds | Both rounds share the key `plan/{run}/step/8/comment`; each round's post gets its own `engine-action` row (the same key, a new body hash) and its own section; a re-run of the same round with the same body prints `deduped: true` and posts nothing. |
| A plan-check stop route ends the round (`commit nothing from this round`) | The round stops before the comment bullet, so nothing is posted and no `engine-action` row is written. |
| Local `dev` does not hold the run's `status.jsonl` (`branches land` did not fast-forward) | The step's existing `test -f` check stops the round, and nothing is posted. |
| The run was started by an older engine, so its start row has no `progress` | Posts use the link built from FID, workflow, run number and `startedAt`; the run may open one fresh progress comment. |
| The session folder was created by an older engine, so it has no `progress-id` file | A post before `workflows start` records association friction and posts a standalone comment, as a deleted folder does today. `workflows start` exits 0, prints the association line, records association friction and writes the start row without `progress`. |
| A post names only a deleted session folder and no status file | Association friction and a standalone comment, unchanged. |
| A `--file` post names a status file that holds no run of `--workflow` | Exit 2 with the "workflow steps only" message; no tracker call. |
| A post carries no proof of a run | Exit 2 with the "workflow steps only" message; no tracker call. |
| A run resumes with a new session folder | The run keeps the link of its first start; the resumed Step 1 report, posted before `workflows start`, opens a new comment, as it does today. |
| `ISSUE_ID` is empty or the tracker is `none` | The comment sub-step is skipped; the engine prints `skipped`. |
| The outbox is deleted or the repo is freshly cloned | The link survives in `status.jsonl`, but the progress cache is gone, so the next report opens a fresh comment (the existing degradation). |
| The post fails after the round's files are written | Delivery is nonfatal; no `engine-action` row is written, and the commit still lands the round. |

## Open Questions

> [!CAUTION]
> 🛑 The owner reads and confirms this section.
> These are the unknowns and assumptions this plan relies on. An unresolved question is a risk, and a wrong assumption breaks what follows. **If** there are none → write `None`.

- **Q1 — Narrative:** The issue has no Narrative: it is written as a bug report (What happens, Why, Where, Done when), not in the change shape, and there is no design. The Narrative above holds the proposal below, marked as assumed until you answer. You resolve it by taking the proposal or by writing one or two sentences of your own.
  - A) Take the proposal: "An owner answers a plan's or design's open questions after the run closed, and the answers comment lands with the run's other reports, with no friction row and no warning line." — it describes the outcome the four criteria measure.
  - B) Write your own Narrative — when you want the plan to stress a different outcome.
  - Recommended: A) the proposal — it adds nothing the Success Criteria do not already measure.
  - Default if unanswered: the plan assumes A
- **Q2 — How the Owner Answers post tells the engine which run it belongs to:** The first criterion says the post names the session folder (`--session-dir`). After close the session folder is gone, so the engine can find the run only through the run's status file, which the main checkout holds once the run has landed. The question is whether the two Owner Answers lines keep the session flag.
  - A) Replace `--session-dir` with `--file` naming the run's status file on both lines — the post finds its run and its link; each line keeps its word count, so neither workflow total grows. The criterion is read as "the plan Step 8 and design Step 12 post".
  - B) Keep `--session-dir` and add `--file` — the same behaviour, but the session flag does nothing after close and the workflow total grows by two words, which the run's brief forbids.
  - C) Keep only `--session-dir` and have the engine look the status file up from the issue number — the lookup is ambiguous when one issue has two FIDs, and it is a second way to find a run.
  - Recommended: A) replace the flag — it is the only option that finds the run without a second lookup and keeps the word totals.
  - Default if unanswered: the plan assumes A
- **Q3 — The Close Workflow comment comes between the progress comment and the answers:** The engine adds a report to the run's progress comment only while that comment is the issue's newest one, so a newer comment makes the next report open its own comment (decision `826-progress-chronology-owner-gate`). In a tracked plan or design run, Step 8 (design Step 12) posts the Close Workflow links comment, a terminal report that always opens a new comment, before the owner can answer. So in a real run the first answers round opens one new comment, and later rounds append to it. The first criterion's integration test closes a run and then posts, as the issue states, and joins the progress comment; a second test pins the real sequence.
  - A) Keep the newest-comment rule — the answers are linked to the run, deduped by the run's status file and free of friction, and they share one comment with each other.
  - B) Post the Close Workflow links comment as a routine report, so it and the answers append to the progress comment — changes the rule that terminal reports always open a new comment in every workflow, which is a major change.
  - Recommended: A) keep the rule — the issue's harm (friction, the warning line, the latest-5 fallback) goes away without changing how every workflow reports its close.
  - Default if unanswered: the plan assumes A
- **Assumption:** Q1 A is taken, so the Narrative is the plan's own proposal → if the owner meant a different outcome, the Narrative stresses one the owner did not intend; the Success Criteria, the matrix and the tests stay valid, because they come from the issue.
- **Assumption:** No workflow posts with `--file` before its own `workflows start`, so `runActionKey` can name the latest run, active or ended. Today this holds: ship Step 1 starts its run (`.bkit/core/workflows/bkit-ship.md:215`) before its `--file` post (`:238`), and the build's `--file` post (`.bkit/core/workflows/bkit-build.md:1471`) is the terminal Create PR post after close → a workflow that posted with `--file` before starting a new run would key that post to the previous run.
- **Assumption:** A session folder serves one run from `repo info` to `workflows close`, and `repo info` runs again only when the orchestrator lost `SESSION_DIR` → a folder shared by two runs would give both runs the same link and mix their reports.
- **Assumption:** Upgrading the engine in the middle of a run is rare, so a run whose session folder has no `progress-id` file, or whose start row has no `progress`, may open one fresh progress comment → if mid-run upgrades were common, owners would see an extra comment per upgraded run.

## Risks and Action Items

None

## Recommended Next Step

```text
/bkit-build #1008
```

Or, to address the reasons first: `/bkit-plan #1008`
