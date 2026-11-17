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
| plan-worktree-setup | - | - | 1 | `docs/plans/202611/logs/911-ship-failed-merge/plan-input-1.md` |
| plan-generate | - | - | 1 | `docs/plans/202611/logs/911-ship-failed-merge/plan-v1-draft.md`, `docs/plans/202611/logs/911-ship-failed-merge/plan-generate-check.md` |
| plan-fetch-context | - | - | 1 | `docs/plans/202611/logs/911-ship-failed-merge/related-deferrals.md`, `docs/plans/202611/logs/911-ship-failed-merge/related-failures.md`, `docs/plans/202611/logs/911-ship-failed-merge/related-issues.md` |
| plan-review | CONCERNS | 8 | 1 | `docs/plans/202611/logs/911-ship-failed-merge/plan-review-1.md`, `docs/plans/202611/logs/911-ship-failed-merge/plan-review-2.md`, `docs/plans/202611/logs/911-ship-failed-merge/plan-scope-check.md` |
| plan-apply-review | CONCERNS | - | 1 | `docs/plans/202611/logs/911-ship-failed-merge/plan-v2-reviewed.md`, `docs/plans/202611/logs/911-ship-failed-merge/plan-update-check.md` |

## Resolved Findings

None

## Reassessed Findings

- plan-review CONCERNS, remaining findings assessed by plan-apply-review

## Assessment History

<!-- prettier-ignore -->
| Step | Verdict | Attempt | Artifact |
| --- | --- | --- | --- |
| plan-start-workflow | - | - | - |
| plan-worktree-setup | - | - | `docs/plans/202611/logs/911-ship-failed-merge/plan-input-1.md` |
| plan-generate | - | 1 | `docs/plans/202611/logs/911-ship-failed-merge/plan-v1-draft.md`, `docs/plans/202611/logs/911-ship-failed-merge/plan-generate-check.md` |
| plan-fetch-context | - | 1 | `docs/plans/202611/logs/911-ship-failed-merge/related-deferrals.md`, `docs/plans/202611/logs/911-ship-failed-merge/related-failures.md`, `docs/plans/202611/logs/911-ship-failed-merge/related-issues.md` |
| plan-review | CONCERNS | 1 | `docs/plans/202611/logs/911-ship-failed-merge/plan-review-1.md`, `docs/plans/202611/logs/911-ship-failed-merge/plan-review-2.md`, `docs/plans/202611/logs/911-ship-failed-merge/plan-scope-check.md` |
| plan-apply-review | CONCERNS | 1 | `docs/plans/202611/logs/911-ship-failed-merge/plan-v2-reviewed.md`, `docs/plans/202611/logs/911-ship-failed-merge/plan-update-check.md` |

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

- **WHEN** a ship run's merge gate finds the CI run red and regenerating cannot fix it, or the CI wait on a PR ship just opened ends with a failed check **→ THEN** the run takes the Failure Path, and the failure comment and the final message name `/bkit-debug {FID}` as the next step.
- **WHEN** the merge attempts are used up with `ship.merge.ask` on, in a session **→ THEN** the Merge Question asks Stop or Try again, and asks no diagnosis question; on a red run, Stop names `/bkit-debug {FID}` in the handover and the final message, and Try again clears it.
- **WHEN** the post-merge squash capstone is red at Close Workflow **→ THEN** the Failure Path names `/bkit-debug {FID}` the same way.
- **WHEN** GitHub refuses the merge for a reason no code fix can address **→ THEN** the run stops at the Failure Path naming the reason, and no diagnose or fix step runs.
- **IF** a run started before the change is resumed after a `ship-failure-diagnose` or `ship-failure-remediate` row **→ THEN** `bkit status resume` ignores those rows and resumes after the run's last `ship-merge-pr` row, which ship turns into a return to Step 3.
- **IF** `bkit workflows fail` gets a `--next-step` value that is not one line starting `/bkit-` **→ THEN** it exits 2 and writes nothing.

### Concrete Example

**Setup:** The owner runs `/bkit-ship 911-ship-failed-merge` in a session. The PR is open against `dev`, and CI at the validated head is red in a unit test (not a generated file).

**Steps:**

1. The run reaches Step 10 → `bkit runs gate` exits 12 with `regenerable` = false.
2. Step 10 holds `/bkit-debug 911-ship-failed-merge` as `NEXT_STEP` → the run takes the Failure Path.
3. The Failure Path runs `bkit workflows fail --post ... --next-step="/bkit-debug 911-ship-failed-merge"` → the issue gets a `### Workflow Failure` comment ending `Next step: `/bkit-debug 911-ship-failed-merge``.
4. The Failure Path flushes the book and stops → the final message ends with the same `Next step:` line.

**Outcome:** The owner sees, on the issue and in the session, that the PR's CI is red at Step 10 and that `/bkit-debug 911-ship-failed-merge` is the next command. No Failure Diagnose or Failure Remediate step ran, and `bkit-ship.md` has no such step.

### Edge Cases

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| A run started before the change is resumed after a `ship-failure-remediate` row with verdict `PASS` | `bkit status resume` ignores the row and prints `step` = `ship-merge-pr`, `number` = 10, `after` = `ship-merge-pr`; ship returns to Step 3, as for any merge-step resume |
| A run started before the change is resumed after a `ship-failure-diagnose` row | Same as above: the row places no resume point |
| `bkit workflows summary` reads a ship run holding `ship-failure-*` rows | The rows appear in the step table as any other row; the command exits 0 |
| The advisory hole detector (`bkit:audit:status`) reads a run holding `ship-failure-*` rows | The rows are listed under `unexpected`, no step is `missing` on their account, and the CLI still exits 0 |
| A regenerable red run (exit 12, `regenerable` = true) is fixed by `bkit branches regenerate` | The run re-validates at Step 9 as today; no `NEXT_STEP` is held |
| A regenerable red run is not fixed (`outcome` = `unchanged` or `undeclared`), or the merge attempts run out on it | The run takes the Failure Path with `NEXT_STEP` = `/bkit-debug {FID}` |
| The merge attempts run out on a regenerable red run with `ship.merge.ask` off, or outside a session | The used-up arm holds `NEXT_STEP` = `/bkit-debug {FID}` and takes the Failure Path |
| The merge attempts run out on a regenerable red run with `ship.merge.ask` on, in a session | The arm holds `NEXT_STEP` = `/bkit-debug {FID}` before the Merge Question, which asks Stop or Try again with no diagnosis variant. `Stop` writes the handover with the line `Next step: /bkit-debug {FID}` and ends the final message with it; `Try again` clears `NEXT_STEP` and grants a fresh allowance |
| The merge attempts run out on a refusal that is not a red run (exit 11, 14 or 10), with `ship.merge.ask` on | The Merge Question asks Stop or Try again; no `NEXT_STEP` is held, so `Stop` names no next step |
| Ship opened the PR itself and the Step 2 CI wait ends with `prs checks` exit 1 and `failed` > 0, or the MCP fallback reads a failed check | The run takes the Failure Path with `NEXT_STEP` = `/bkit-debug {FID}` |
| The Step 2 CI wait fails for a reason other than a failed check (no check, a pending check, `runs wait` timeout, unreadable rollup) | The Failure Path names the reason and no next-step line, as today |
| The Failure Path's `workflows fail --next-step` call exits 2 (the held value was refused) | The Failure Path re-runs the same `workflows fail` call without `--next-step`, so the run still records the failure, releases the lock and posts the comment |
| The merge gate refuses for a reason other than a red run (13, 15, 16, 18, 20) | The Failure Path names the gate's reason and no next-step line |
| `--next-step` holds a line break, or does not start with `/bkit-` | `bkit workflows fail` exits 2 (usage) before any write: no row, no lock release, no comment |
| `bkit workflows fail` runs without `--next-step`, or with an empty one (a value not held yet, as for `--fid` and `--token`) | `nextStep` prints null and the failure comment has no `Next step:` line, as today |
| The post-merge squash capstone is red at Step 12 (Close Workflow after the renumber) | The run takes the Failure Path with `NEXT_STEP` = `/bkit-debug {FID}` (Open Question 3, default A) |
| The post-merge capstone check exits non-zero for any other reason | The Failure Path names the reason and no next-step line, as today |

## Open Questions

> [!CAUTION]
> 🛑 The owner reads and confirms this section.
> These are the unknowns and assumptions this plan relies on. An unresolved question is a risk, and a wrong assumption breaks what follows. **If** there are none → write `None`.

- **Open Question 1:** The issue is a bug-shape issue, so it has no `Narrative` or `Success Criteria`, and the Acceptance Scenario carries the `⚠️ MISSING` marker. → The owner resolves it by choosing wording below, or writing their own, before ticking the Acceptance Scenario box.
  - **Options:** A) Adopt this wording — Narrative: "The owner runs `/bkit-ship` on a PR whose CI is red; ship stops at the merge gate and names `/bkit-debug {FID}` as the next step, and the workflow holds no diagnose or fix step that no route reaches." Success Criteria: (1) `bkit-ship.md` has no Failure Diagnose or Failure Remediate step and names no `ship-failure-*` key; (2) ship's steps are numbered 1-12 in the workflow, the step table and the docs; (3) a red CI run at the Step 2 CI wait, the merge gate or the post-merge capstone ends with `Next step: /bkit-debug {FID}` in the failure comment and the final message, and an owner's Stop at the Merge Question on a used-up red run ends with it in the handover and the final message; (4) `bkit status resume` and `bkit workflows summary` exit 0 on a status file holding `ship-failure-*` rows, and resume lands at the merge step; (5) `bkit-debug-failure-diagnose` and `bkit-debug-failure-remediate` keep serving build and debug unchanged. — matches the owner's scope comment one to one · B) The owner writes the Narrative and Success Criteria — exact wording, but one more round before build.
  - **Recommended:** A) — every criterion is the owner's own scope bullet, restated as an outcome.
  - **Default if unanswered:** None — the plan does not proceed to build until the owner picks A or B; plan-update then copies the chosen wording into `Narrative` and `Success Criteria`. A ticked Acceptance Scenario box alone does not adopt option A.
- **Open Question 2:** The advisory hole detector (`checks/status-holes.ts`) lists any recorded step the current workflow lacks as `unexpected (invented names)`, so a pre-change run holding `ship-failure-*` rows gets two `unexpected` entries. → The owner decides.
  - **Options:** A) Accept the `unexpected` entries — the build workflow's retired `build-challenge-*` rows already show the same way, `unexpected` never changes a verdict, and the CLI exits 0 · B) Teach the detector the retired names (read `RETIRED_STEPS` or a new list) so old rows are not reported — a quieter sweep, but it changes how build's retired rows report too and adds a list to keep in step.
  - **Recommended:** A) — it follows the existing precedent and keeps the detector a pure comparison against the current workflow.
  - **Default if unanswered:** A).
- **Open Question 3:** The owner's scope says that when ship stops on a red CI run, the stop message names `/bkit-debug {FID}`. Three places stop on a red run before the merge or after it: the Step 2 CI wait on a PR ship opened itself (`prs checks` with a failed check), the Step 10 merge gate (`runs gate` exit 12, including an owner's Stop at the Merge Question on a used-up regenerable red run), and the post-merge squash capstone in Close Workflow (Step 12 after the renumber, `runs gate --capstone-only` exit 12). The first two are pre-merge red-CI stops on the feature branch and are covered by the scope sentence; the post-merge capstone runs on `dev`. → The owner decides whether the post-merge capstone is covered.
  - **Options:** A) All three — one rule for every red CI stop; `/bkit-debug` runs on `dev` as well as on a feature branch · B) The two pre-merge stops only — the post-merge case keeps today's message, recorded as a `needs-decision` deferral · C) The post-merge case names a different next step — needs a command nobody has specified.
  - **Recommended:** A) — the owner's sentence names every red CI stop, and debug already supports a run on `dev`.
  - **Default if unanswered:** A).
- **Assumption:** Every `ship-failure-*` row in an old status file follows a `ship-merge-pr` row, because Step 11's finish used `--attempt-of=ship-merge-pr:current`. → If wrong, a resumed old run lands after its last earlier step instead of the merge step; ship still returns to Step 3 for any number from 3 to 10.
- **Assumption:** A run stopped between a `ship-failure-remediate` `PASS` row and its fix commit is too rare to need its own route, because Steps 11-12 have been reachable only on resume since #896. → If wrong, the uncommitted fix sits in the worktree when the resumed run returns to Step 3, and the owner commits or discards it by hand.
- **Assumption:** `bkit workflows summary` keeps its generic row handling, so a `FAIL` `ship-failure-diagnose` row in a resumed old run still makes a refreshed Step 6 summary `FAIL`, exactly as it does today. → If wrong (the owner wants old rows ignored), such a run stops at Step 6; a fresh `/bkit-ship` run starts a new run without the old rows and proceeds.
- **Assumption:** No external contract parses ship's step numbers: resume keys on step names, and old tracker comments that say "Step 13" or "Step 14" are history. → If wrong, a consumer script that matches `Step 13 — Update Local Dev` breaks after the renumber.
- **Assumption:** The two `docs/failures.jsonl` rows that describe these defects reach `origin/dev` through the owner's own push of local `dev`, and are closed by the ship of this change. → If wrong, the rows stay `OPEN` after the defect is gone, until a `/bkit-utility-update-failures` pass closes them.

## Risks and Action Items

None

## Recommended Next Step

```text
/bkit-build #911
```

Or, to address the reasons first: `/bkit-plan #911`
