Verdict: CONCERNS
Failures: 0
<!-- verdict:end -->

# Design Summary

## Verdict

CONCERNS

- design-review CONCERNS
- design-spike CONCERNS
- 1 deferral(s) written this run

## Steps

<!-- prettier-ignore -->
| Step | Verdict | Failures | Attempts | Artifact |
| --- | --- | --- | --- | --- |
| design-start-workflow | - | - | 1 | - |
| design-worktree-setup | - | - | 1 | `docs/plans/202611/logs/787-show-authoring-rules/design-input-1.md` |
| design-grill | - | - | 1 | `docs/plans/202611/logs/787-show-authoring-rules/design-grill-1.md`, `docs/plans/202611/logs/787-show-authoring-rules/design-input-1.md` |
| design-brainstorm-ideate | - | - | 1 | `docs/plans/202611/logs/787-show-authoring-rules/design-brainstorm-ideate-1.md`, `docs/plans/202611/logs/787-show-authoring-rules/design-brainstorm-ideate-2.md`, `docs/plans/202611/logs/787-show-authoring-rules/design-brainstorm-ideate-3.md` |
| design-generate | - | - | 1 | `docs/plans/202611/logs/787-show-authoring-rules/design-v1-draft.md` |
| design-review | CONCERNS | - | 1 | `docs/plans/202611/logs/787-show-authoring-rules/design-review-1.md`, `docs/plans/202611/logs/787-show-authoring-rules/design-review-2.md` |
| design-spike | CONCERNS | - | 1 | `docs/plans/202611/logs/787-show-authoring-rules/design-spike.md` |
| design-apply-review | PASS | - | 1 | `docs/plans/202611/logs/787-show-authoring-rules/design-v2-reviewed.md` |
| design-organise | PASS | - | 1 | `docs/plans/202611/logs/787-show-authoring-rules/design-v3-organised.md` |

## Suggested Plans

### P-1: Reliable edit detection with one shared authoring advisory

Covers: WS-1 (Bounded shell and script edit recognition), WS-2 (Shared advice preparation, batching and warning state), WS-3 (Host payload coverage and managed delivery integration), WS-4 (Shipped authoring pointers and operational guidance), WS-5 (Rendered-hook and consumer-install evidence)
Requires: []


## Open Questions

- **Host delivery evidence:** The reviewed host table is the current evidence boundary. Claude's next-request timing is a documented limitation, Cursor and Codex live timing remain unverified, and OpenCode's current advisory route is after execution. Antigravity retains its established deny-once transport. No unverified claim is presented as owner approval or full before-edit coverage.
- **Parser regression:** The shared shell lexical helpers also support fetch and enforcement recognition. A richer scanner must retain those behaviors. Unsupported syntax yields uncertainty for the advisory, not a weakened enforcement verdict.
- **Runtime limits:** The proposed internal limits and cold-start acceptance bounds require implementation evidence. Reading a non-regular file, following imports or executing code is outside the analysis boundary even if it would yield a path. Cooperative time checks do not guarantee preemption of a stalled synchronous filesystem call.
- **Delivery acknowledgement:** A generated response fixture proves the adapter's output, not that a live host showed it to the model. Preparation, batching and acknowledgement must remain distinct. Unverified routes and omitted/truncated blocks do not suppress a later reminder.
- **Concurrency:** Existing read-modify-write warning storage can repeat advice during races. The feature's deduplication claim is sequential within a session/agent scope; it must not be advertised as transactional exactly-once delivery across processes.
- **Upgrade compatibility:** Default and customized drivers need separate installation evidence. The default Cursor outer driver emits `additional_context`, and a managed-body update does not validate or repair that envelope. Retain its stated limitation until verified; a necessary change outside managed ownership needs safe wiring guidance or a separately approved migration.
- **Secrets:** Safe reason codes and target paths are sufficient diagnostic output. Avoid command bodies, script source and environment values in output and state.

### Open Question 1 — Unsettled live delivery and Cursor upgrade outcome

Can a trusted Codex hook session and separately authorized Cursor edit/shell sessions establish that the model can read and act on the advisory before the pending edit, and that the default Cursor envelope carries it? C1 is `BLOCKED`: the Codex scratch hook fired zero times, and Cursor did not reach an authenticated session. Neither claim was disproven. The automatic approval reviewer rejected authenticated Cursor retries because the design request did not authorize sending the confined workspace prompt/data to the external Cursor destination. No further retry is part of this design run.

Options: A) Continue with the explicit unverified coverage boundaries and preserve current driver ownership — the core detection design can proceed without claiming live delivery. · B) Arrange a separately authorized and trusted live-host verification round before claiming coverage — this can settle timing and the default Cursor envelope, but requires the missing host setup and explicit Cursor destination/data approval.

Recommended: A) Continue with explicit boundaries, because the accepted scenario allows sourced host gaps and the probe did not establish a compatible live route.

Default if unanswered: A) Keep Cursor/Codex timing and the default Cursor upgrade outcome unverified; authorize no external probe or migration by silence.

### Open Question 2 — Unsettled complete-block visibility

Which complete advisory blocks remain visible around the actual host/version output thresholds? C2 is `BLOCKED` because no live scratch advisory hook ran, so no below/above-threshold visibility experiment took place. The common 64 KiB budget is not validated.

Options: A) Use the conservative per-host budgets and reserve/acknowledgement rules in this design — this bounds output using documented limits while retaining unverified visibility status. · B) After a live route is verified, measure its threshold behavior before increasing or claiming validated delivery budgets — this supplies stronger evidence but depends on resolving the live-session prerequisites.

Recommended: A) Use conservative budgets now, because their purpose is to avoid oversized responses while actual visibility remains unverified.

Default if unanswered: A) Keep the conservative limits, leave omitted/truncated/unverified blocks unacknowledged, and make no measured visibility claim.

These are unsettled technical verification questions with conservative defaults, not a request for the owner to guess host facts. The design preserves Q1/Q3 and the prohibition on new shell blocking whichever later evidence is obtained.

## Risks and Action Items

None

## Recommended Next Step

```text
/bkit-plan #787
```

Or, to address the reasons first: `/bkit-design #787`
