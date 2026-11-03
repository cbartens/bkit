Verdict: CONCERNS
Failures: 0
<!-- verdict:end -->

# Plan Summary

## Verdict

CONCERNS

- plan-review CONCERNS

## Steps

<!-- prettier-ignore -->
| Step | Verdict | Failures | Attempts | Artifact |
| --- | --- | --- | --- | --- |
| plan-start-workflow | - | - | 1 | - |
| plan-worktree-setup | - | - | 1 | `docs/plans/202611/logs/826-append-routine-workflow/plan-input-1.md` |
| plan-generate | - | - | 1 | `docs/plans/202611/logs/826-append-routine-workflow/plan-v1-draft.md`, `docs/plans/202611/logs/826-append-routine-workflow/plan-generate-check.md` |
| plan-fetch-context | - | - | 1 | `docs/plans/202611/logs/826-append-routine-workflow/related-deferrals.md`, `docs/plans/202611/logs/826-append-routine-workflow/related-failures.md`, `docs/plans/202611/logs/826-append-routine-workflow/related-issues.md` |
| plan-review | CONCERNS | 6 | 1 | `docs/plans/202611/logs/826-append-routine-workflow/plan-review-1.md`, `docs/plans/202611/logs/826-append-routine-workflow/plan-review-2.md`, `docs/plans/202611/logs/826-append-routine-workflow/plan-scope-check.md` |
| plan-apply-review | PASS | - | 1 | `docs/plans/202611/logs/826-append-routine-workflow/plan-v2-reviewed.md`, `docs/plans/202611/logs/826-append-routine-workflow/plan-update-check.md` |

## Acceptance Scenario

### Narrative
I can follow a workflow's progress without routine reports overwhelming the issue conversation. Decisions, failures, handovers and completion remain separate, visible comments, and replies already visible when bkit checks the issue keep their place in the conversation. If a tracker request has an uncertain outcome, I can see that uncertainty rather than being told that delivery was exactly once.
### Success Criteria
1. A clean uninterrupted build produces at most two bkit comments when progress fits one comment, identity and source state are available, and neither fallback nor an intervening comment requires another: progress and completion.
2. Decision pauses, failures, handovers and final close / Create PR reports each use a separate new comment; exact retries of those reports are deduplicated.
3. Before an edit, the engine establishes that its target is the newest created comment and still matches its last acknowledged revision. An intervening comment or external edit detected at that check causes a new progress segment; the remaining read/write race is disclosed.
4. Re-executing an acknowledged report adds no duplicate section. Prepared writes are reconciled before retry; an unresolved remote outcome or unchanged create-only fallback is reported as uncertain and can duplicate a report.
5. GitHub, Linear and Jira stay within their verified comment budgets, every section displays its original UTC time, and auto and its dispatched phase own separate progress state. Tracker edit-notification limitations are documented.

Criteria 3 and 4 carry the design's proposed departures from Q4; copying them is not owner approval. Until the owner answers the first two questions below, their strict defaults apply. A standalone degradation does not satisfy criterion 1 or an adapter's consolidation acceptance.
### Process Sketch
- **WHEN** a workflow starts → **THEN** its own progress comment opens.
- **WHEN** routine setup and execution reports arrive → **THEN** eligible progress receives each original section and UTC time once.
- **WHEN** a human reply, external edit or size overflow makes the segment ineligible → **THEN** only new progress starts another segment.
- **WHEN** an acknowledged report repeats → **THEN** its saved delivery is returned.
- **WHEN** a previous write is uncertain → **THEN** recovery inspects its identity before another write and reports unresolved ambiguity.
- **WHEN** attention is needed or the workflow ends → **THEN** a separate comment appears.
- **WHEN** auto dispatches a phase → **THEN** the phase opens separate progress state.
### Concrete Example
**Setup:** An operator runs build for an issue on a tracker whose adapter contract is verified. The owner has approved the chronology and uncertainty boundaries, and the progress body fits one comment.

**Steps:**

1. Start Workflow creates the progress comment with the generated first-line marker.
2. Worktree Setup and execution append timestamped sections to that comment after eligibility checks.
3. Repeating an acknowledged execution report returns its prior URL without adding a section.
4. A person replies; the next routine report starts a new progress segment after that reply.
5. A failure or decision report creates a separate attention comment; completion creates the final separate report.

**Outcome:** Routine progress remains readable, the person's reply stays ahead of later progress at the checked boundary, and attention and completion are distinct. With step 4 and attention reports omitted, the uninterrupted run has at most progress plus completion.
### Edge Cases
The first five rows retain the design's Key Edge Cases word for word.

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| Someone posts or edits a comment between the final read and the write; local serialization cannot make those provider actions atomic. | Apply the owner's selected chronology boundary; default to no consolidation edit without proven atomic support, and disclose postflight race detection. |
| A request succeeds remotely before its acknowledgment is saved locally. | Reconcile the same deterministic operation before retry; retain preparation and report ambiguity rather than infer absence. |
| A comment reaches its size budget, or one section itself needs multiple parts. | Measure the complete encoded body, roll over with only new content, and resume deterministic Unicode-safe parts at the first unacknowledged part. |
| A step retries with identical or changed output, a workflow resumes, or durable source state is missing. | Deduplicate acknowledged original-body identities; append changed versions immutably; seal missing or unsupported state without remote reconstruction. |
| An agent posts a fallback comment, a comment is deleted, or a tracker cannot expose adequate identity / revision evidence. | Keep create-only fallback verbatim, seal obsolete segments, and report aggregation unavailable; fallback does not establish consolidation acceptance. |
| Bootstrap adoption restarts or binds to a different target/run. | Reuse matching immutable files and binding; refuse conflicting adoption and preserve pending evidence. |
| Auto dispatch crosses worktrees or terminal posting follows the close commit. | Commit the auto bundle with phase setup under separate identity; prepare terminal source before close and retain a cleanup-safe acknowledgment journal. |
| Postflight inspection fails after a positive mutation acknowledgment. | Return done with the known URL, record postflight-unavailable, and seal the segment without requesting fallback. |
| Eligibility inspection fails before a mutation. | Return done: false with the exact standalone fallback bytes and perform no engine create/edit; a failed read does not establish absence. |
| Postflight inspection observes a comment created after the final eligibility read. | Keep the acknowledged write successful with its URL, seal that segment, and start a new segment for the next routine report under an explicitly approved chronology test contract. |
| Lock owner, pagination or remaining network budget is inconclusive. | Bound work, retain preparation, return the precise uncertainty reason, and release only the owned lock. |
| Pending routine delivery exists when attention is needed. | Allow independent attention operations under the short publication lock; seal prior progress after their new comment. |

## Open Questions

- **Open Question:** Accept newest-at-final-preflight with local serialization and postflight detection as the chronology boundary?
  - **Options:** A) Accept this boundary — consolidation ships with an explicit remote read/write race. · B) Retain the literal never-edit-after-an-intervening-comment guarantee — block editing on adapters without verified atomic support.
  - **Recommended:** A), because GitHub's documented update contract supplies no issue-wide newest predicate.
  - **Default if unanswered:** B). No aggregation edit without verified atomic chronology support; the qualified two-comment result remains blocked wherever this cannot be proved.
- **Open Question:** Accept that an unresolved write followed by the unchanged agent fallback may duplicate a report?
  - **Options:** A) Accept the disclosed exception after attempted reconciliation — preserves the required fallback behavior. · B) Require unconditional no-duplicate delivery — block posting changes until a compatible idempotent provider/fallback contract is proven.
  - **Recommended:** A), because local records cannot establish a remote outcome through an outage.
  - **Default if unanswered:** B). Do not claim unconditional duplicate-free acceptance or enable the proposed posting change under an unproved contract.
- **Open Question:** How should incomplete provider contract evidence affect delivery scope?
  - **Options:** A) Retain all three adapters and require authenticated disposable-target contract evidence for each — preserves the requested outcome without assuming a pass. · B) Ask the owner to narrow scope to verified adapters and file separate work — reduces the release but changes the issue's scope.
  - **Recommended:** A).
  - **Default if unanswered:** A). All three stay in this runbook; missing evidence blocks the affected acceptance, and standalone fallback does not satisfy it.
- **Open Question:** What evidence establishes lost-response recovery?
  - **Options:** A) Run bounded mutation-and-discard probes through each production inspection path and implementation fixtures — proves identity and representation survive the transport. · B) Ship without it as experimental — leaves essential delivery claims unverified.
  - **Recommended:** A).
  - **Default if unanswered:** A). Task 10 requires this evidence; the read-only design spike proves no mutation recovery.
- **Open Question:** What evidence establishes lifecycle persistence?
  - **Options:** A) Require restart, adoption, auto transfer, terminal acknowledgment loss, cleanup and fresh-clone fixtures — verifies deterministic ownership. · B) Drop those persistence guarantees — reduces work but breaks the proposed resume outcome.
  - **Recommended:** A).
  - **Default if unanswered:** A). Tasks 7 and 11 exercise these cases with actual local files and subprocesses.
- **Open Question:** How should source loss and cross-machine concurrency be handled?
  - **Options:** A) Require one active publisher per invocation and roll over on missing source or conflicting revision evidence — fits the CLI model. · B) Add a shared remote coordination service — adds deployment and ownership beyond this design.
  - **Recommended:** A).
  - **Default if unanswered:** A). A local lock does not coordinate another machine; conflicts remain explicit.
- **Assumption:** Exact generated source may be retained as committed run artifacts. If source is lost or cannot safely be retained, resume cannot append old source and must seal the segment.
- **Assumption:** The owner supplies disposable GitHub, Linear and Jira targets and appropriate least-privilege permissions for Task 10. Missing targets, Jira credentials, scopes or verified budgets prevent that adapter's acceptance.
- **Assumption:** The design's confirmed Q1-Q3 decisions hold: separate auto/phase identity, documented edit-notification limits and a qualified two-comment result. Changing them requires updating affected acceptance and task conditions.

## Risks and Action Items

None

## Recommended Next Step

```text
/bkit-build #826
```

Or, to address the reasons first: `/bkit-plan #826`
