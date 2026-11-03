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
| plan-worktree-setup | - | - | 1 | `docs/plans/202611/logs/787-show-authoring-rules/plan-input-3.md` |
| plan-generate | - | - | 1 | `docs/plans/202611/logs/787-show-authoring-rules/plan-v1-draft.md`, `docs/plans/202611/logs/787-show-authoring-rules/plan-generate-check.md` |
| plan-fetch-context | - | - | 1 | `docs/plans/202611/logs/787-show-authoring-rules/related-deferrals.md`, `docs/plans/202611/logs/787-show-authoring-rules/related-failures.md`, `docs/plans/202611/logs/787-show-authoring-rules/related-issues.md` |
| plan-review | CONCERNS | 6 | 1 | `docs/plans/202611/logs/787-show-authoring-rules/plan-review-1.md`, `docs/plans/202611/logs/787-show-authoring-rules/plan-review-2.md`, `docs/plans/202611/logs/787-show-authoring-rules/plan-scope-check.md` |
| plan-apply-review | PASS | - | 1 | `docs/plans/202611/logs/787-show-authoring-rules/plan-v2-reviewed.md`, `docs/plans/202611/logs/787-show-authoring-rules/plan-update-check.md` |

## Acceptance Scenario

### Narrative

When an agent edits an agent-read file, I want the authoring reminder to appear before the edit, including edits made through shell commands or scripts. I want one general advisory across edit methods and supported hosts, keeping this change focused on reliable detection.

### Success Criteria

1. The shell check detects the script and command edit forms listed in the issue before execution, reporting exact targets where established and uncertainty elsewhere.
2. Known targets receive the existing per-file checklist and the same general authoring advisory used by edit tools, sharing the once-per-file warning record.
3. Scripts that might write to unknown targets receive a warning that their targets cannot be determined and authoring reads still apply. Clearly read-only commands are excluded.
4. Every supported host's edit tools are covered where hooks allow it; unavoidable gaps are documented with primary sources and the observed delivery boundary.
5. Consumer installs receive the hook improvements and applicable rules/header pointers. File-type-specific advisories are recorded as future work.

### Process Sketch

- WHEN an edit tool first touches a file → THEN show its checklist and the general advisory on the host's established channel, subject to the documented timing boundary.
- WHEN a shell edit has exact targets → THEN prepare the same advice for each target not already acknowledged.
- WHEN the command also has unknown effects → THEN keep its exact targets and warn that authoring reads apply to every edited file.
- WHEN a script is positively read-only → THEN omit its shell-edit reminder.
- WHEN a budget cannot fit all complete blocks → THEN report the omitted count and leave those paths unacknowledged.
- WHEN the host route has no verified delivery contract → THEN retain the documented limitation and leave new advice unacknowledged.

### Concrete Example

**Setup:** An agent is updating a consumer's `docs/testing.md` through a literal Python write, in a session with no prior reminder for that path. The host invokes its pre-execution shell hook.

**Steps:**

1. The agent submits the shell command → the hook identifies `docs/testing.md` without executing the Python source.
2. The hook prepares the existing per-file investigation checklist and the general authoring reminder → the adapter selects complete blocks within its host budget.
3. The adapter emits its established response → a verified complete-delivery route may acknowledge the path; an unverified route leaves it unacknowledged.
4. The agent later uses an edit tool on the same normalized path → a previously acknowledged reminder is omitted, while an unacknowledged path remains eligible.

**Outcome:** Installed hooks detect the edit consistently and emit the shared reminder, with truthful state and explicit delivery limits. A fixture response alone does not prove that the model could act before the pending edit.

### Edge Cases

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| Computed script targets cannot always be determined before execution. A command can have both known targets and additional unknown writes. | Preserve exact targets and independent safe uncertainty reasons. |
| A file touched through both shell and edit tools should not receive duplicate first-touch advice within the same session and agent scope. | Both channels normalize paths and share sequential acknowledgement on verified routes. |
| Parallel calls and unavailable state can produce repeated advice; they must not falsely acknowledge an unshown target. | Tolerate repeats and use the existing in-process fallback; do not claim transactional exactly-once behavior. |
| A hook failure retains the existing fail-open behavior: the hook does not stop the command because its analysis failed. | Preserve independent stronger enforcement decisions and emit safe diagnostics where the protocol allows them. |
| This change adds no shell blocking, after-edit checks or file-type-specific rule selection. Existing host delivery mechanisms and stronger shell protections retain their contracts. | Shell advice stays non-blocking even in deny mode. |
| Some hosts cannot deliver a default advisory before an edit. Such a host is an explicit coverage exception, not a reason to count an after-edit result as before-edit coverage. | Keep the design's sourced host table and the current probe limitations. |
| Quoted separators, heredocs, wrappers and literal directory changes occur together. | Associate source and working directory correctly; unsupported forms become uncertain. |
| Script source is missing, oversized, replaced, symlink-dependent or a special file. | Inspect bounded regular descriptors only, never execute source or block on a FIFO/device. |
| Output exceeds the host budget. | Emit complete blocks plus the omitted count within the reserve; unshown paths remain unacknowledged. |
| Off mode is selected. | Suppress GateGuard output and state changes while independent shell safeguards remain active. |

## Open Questions

No outstanding owner questions. The owner already selected one general advisory and authorized proceeding with unverified host-delivery boundaries and conservative budgets.

- **Assumption:** The design's host contracts and limitations remain the implementation baseline → a changed host contract requires updating its adapter evidence and guidance before claiming support.
- **Assumption:** Existing managed entry points can carry the new shared behavior → an incompatible consumer-owned driver remains an explicitly documented limitation; overwriting it or adding a migration requires separate authorization.
- **Assumption:** Bounded recognition is sufficient for useful reminders → arbitrary dynamic effects remain uncertain, and a claim of complete script analysis would be incorrect.
- **Assumption:** Sequential shared state describes reminders on verified routes → unverified routes may repeat advice, and concurrent callers may repeat it even with available state.

## Risks and Action Items

None

## Recommended Next Step

```text
/bkit-build #787
```

Or, to address the reasons first: `/bkit-plan #787`
