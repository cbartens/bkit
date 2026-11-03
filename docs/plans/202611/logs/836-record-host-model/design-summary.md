Verdict: CONCERNS
Failures: 0
<!-- verdict:end -->

# Design Summary

## Verdict

CONCERNS

- design-review CONCERNS
- design-spike FAIL, answered by design-apply-review

## Steps

<!-- prettier-ignore -->
| Step | Verdict | Failures | Attempts | Artifact |
| --- | --- | --- | --- | --- |
| design-start-workflow | - | - | 1 | - |
| design-worktree-setup | - | - | 1 | `docs/plans/202611/logs/836-record-host-model/design-input-1.md` |
| design-grill | - | - | 1 | `docs/plans/202611/logs/836-record-host-model/design-grill-1.md`, `docs/plans/202611/logs/836-record-host-model/design-input-1.md` |
| design-brainstorm-ideate | - | - | 1 | `docs/plans/202611/logs/836-record-host-model/design-brainstorm-ideate-1.md`, `docs/plans/202611/logs/836-record-host-model/design-brainstorm-ideate-2.md`, `docs/plans/202611/logs/836-record-host-model/design-brainstorm-ideate-3.md` |
| design-generate | - | - | 1 | `docs/plans/202611/logs/836-record-host-model/design-v1-draft.md` |
| design-review | CONCERNS | - | 1 | `docs/plans/202611/logs/836-record-host-model/design-review-1.md`, `docs/plans/202611/logs/836-record-host-model/design-review-2.md` |
| design-spike | FAIL | - | 1 | `docs/plans/202611/logs/836-record-host-model/design-spike.md` |
| design-apply-review | PASS | - | 1 | `docs/plans/202611/logs/836-record-host-model/design-v2-reviewed.md` |
| design-organise | PASS | - | 1 | `docs/plans/202611/logs/836-record-host-model/design-v3-organised.md` |

## Suggested Plans

### P-1: Record workflow hosts, models and commit attribution

Covers: WS-1 (Shared execution evidence contracts and fold), WS-2 (Current caller identity and host entrypoint capability), WS-3 (Bounded host model readers and safe acquisition), WS-4 (Lifecycle checkpoints and dispatch configuration), WS-5 (Lowercase host trailers across workflow commits), WS-6 (Outcome reporting, compatibility and completion evidence)
Requires: []


## Open Questions

- **Late host flush:** Coverage ends at the last collected event. A close may precede the model record for its own final response; report the boundary rather than infer no usage.
- **Remote operation interpretation:** The design treats the host requesting a squash as the committing operation's host. This is the practical application of Q4; literal server-process identity would require a different contract.
- **Open question — capability proof boundary:** Should implementation proceed with explicit unknown/partial results on entrypoints whose live evidence cannot be verified in the design spike? Options: A) Proceed with shared components and per-route capability gates, requiring live proof before claiming five-host completion — permits useful progress while keeping the requested outcome pending. · B) Block implementation until all five hosts and supported entrypoints are live-verified — stronger pre-build confidence but needs access to every host. Recommended: A), because it preserves progress and the five-host completion requirement. Default if unanswered: A).
- **Open question — native model evidence:** Should unproven Codex call semantics and unavailable Cursor/Antigravity/Claude/OpenCode live captures remain capability gates rather than be promoted from session-level model records? Options: A) Keep the gates and retain selected/session models separately until sanitized fixtures plus live evidence establish run/agent ownership — honest coverage with unfinished capabilities visible. · B) Pause the affected readers until a dedicated live verification round supplies that evidence — less implementation rework but delays them. Recommended: A), because the evidence categories already preserve the weaker facts without claiming actual usage. Default if unanswered: A).
- **Open question — SQLite acquisition:** How should database-backed readers proceed while no no-host-write acquisition route is proven? Options: A) Develop shared decoding/reporting and investigate a host-provided coherent export or enforced no-write source route, keeping affected live reads disabled and five-host acceptance pending — preserves the original constraint but leaves a load-bearing gate. · B) Pause database-backed implementation until such a route is demonstrated — avoids speculative reader work but blocks those hosts earlier. Recommended: A), because the spike disproves a route rather than the whole metadata pipeline. Default if unanswered: A). Neither option authorizes host sidecar mutations, permission changes or an unsafe DB/WAL copy.
- **Open question — checkpoint proof:** Should the newly specified attachment/resume/acknowledgement protocol be implemented with its full crash, replacement, parser-context and overlap fixture matrix before enabling run-observed aggregation? Options: A) Require the matrix before enabling aggregation — gives the previously blocked spike claim a concrete implementation gate. · B) Run a separate disposable protocol spike before implementation — buys earlier feedback but duplicates a small portion of protocol work. Recommended: A), because the design now defines the policy the original spike could not exercise. Default if unanswered: A).
- **Open question — remote trailer delivery:** Should remote CLI/MCP merge paths remain gated until exact payload and resulting squash-message verification succeeds? Options: A) Require both integration checks during implementation before claiming trailer parity — preserves the accepted lowercase requirement beyond the local formatter. · B) Arrange a separate disposable remote integration exercise first — earlier API confidence but needs an authorized remote target. Recommended: A), because the local fixture result does not establish remote delivery. Default if unanswered: A).

## Risks and Action Items

None

## Recommended Next Step

```text
/bkit-plan #836
```

Or, to address the reasons first: `/bkit-design #836`
