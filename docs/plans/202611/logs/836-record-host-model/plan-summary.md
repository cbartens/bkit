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
| plan-worktree-setup | - | - | 1 | `docs/plans/202611/logs/836-record-host-model/plan-input-1.md` |
| plan-generate | - | - | 1 | `docs/plans/202611/logs/836-record-host-model/plan-v1-draft.md`, `docs/plans/202611/logs/836-record-host-model/plan-generate-check.md` |
| plan-fetch-context | - | - | 1 | `docs/plans/202611/logs/836-record-host-model/related-deferrals.md`, `docs/plans/202611/logs/836-record-host-model/related-failures.md`, `docs/plans/202611/logs/836-record-host-model/related-issues.md` |
| plan-review | CONCERNS | 6 | 1 | `docs/plans/202611/logs/836-record-host-model/plan-review-1.md`, `docs/plans/202611/logs/836-record-host-model/plan-review-2.md`, `docs/plans/202611/logs/836-record-host-model/plan-scope-check.md` |
| plan-apply-review | PASS | - | 1 | `docs/plans/202611/logs/836-record-host-model/plan-v2-reviewed.md`, `docs/plans/202611/logs/836-record-host-model/plan-update-check.md` |

## Acceptance Scenario

### Narrative
After a workflow finishes, I can tell from the repository which hosts and models did the work, including subagents and resumed sessions, and where the available evidence has gaps. I can also see the host responsible for each workflow commit in its `bkit-host` trailer.
### Success Criteria
1. Every start or resume on each supported host produces a session record with that host when the current caller is established, or explicit `unknown` when it cannot be distinguished.
2. Committed records contain chat fingerprints and normalized model facts, with no raw chat ids, local host paths or transcript content.
3. The run log, outcome and `bkit stats` show observed orchestrator and subagent models across recorded sessions, including switches; configured fallback models are labelled unverified and incomplete coverage is explicit.
4. Every workflow-created commit carries exactly one lowercase `bkit-host` trailer naming the committing operation's host, or `unknown`.
5. Missing, unreadable, unsupported, busy or oversized host records leave visible reporting gaps and never fail or indefinitely delay workflow completion.
### Process Sketch
- **WHEN** Codex runs inside a Claude Code shell **→ THEN** current-caller evidence identifies Codex, or reports uncertainty without selecting the inherited Claude chat.
- **WHEN** the host cannot be determined **→ THEN** the session and commit trailer explicitly say `unknown`.
- **WHEN** models change during a run **→ THEN** the final report includes observed models and their coverage.
- **WHEN** a subagent's actual model is unavailable **→ THEN** its dispatch-time configured model is shown as unverified, or configuration is explicitly unavailable.
- **WHEN** another host resumes the run **→ THEN** earlier persisted evidence remains represented and subsequent commits name their committing host.
- **WHEN** local host records cannot be read **→ THEN** the run completes within a bounded collection budget with the gap visible.
### Concrete Example

**Setup:** A maintainer starts a workflow in Codex from a Claude Code shell, then resumes it on another host with the committed run log available.

**Steps:**

1. The maintainer starts the workflow → a current-invocation session record names Codex when proven, with a fingerprint only when its chat association is proven.
2. The maintainer runs a subagent and switches model → checkpoints retain attributable observed facts and the subagent's dispatch-time configured fallback separately.
3. The maintainer resumes on another host and closes → committed evidence from the earlier machine remains in the outcome and stats; each new commit names its own operation's host.

**Outcome:** The repository answers which hosts and models worked on this run and identifies any unsupported or uncollected interval.
### Edge Cases

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| A host launches another and passes down its environment, or loads another host's visible skill. | Corroborate current caller independently; reject inherited identities and unbound declarations. |
| Concurrent chats and worktrees share a repository or host store. | Select exact invocation/session evidence and serialize checkpoint acknowledgement per run/source. |
| Models switch, subagents use different models, configuration changes, or a run resumes on another host or machine. | Preserve all acknowledged sessions and model facts; configuration snapshots remain unverified. |
| Model records lack a reliable run interval, agent relation or event boundary. | Retain supported session-scoped evidence and report ambiguous or unlinked ownership. |
| Records are deleted, incomplete, not flushed yet, unsupported or unavailable on the closing machine. | Preserve prior evidence, show range-specific coverage gaps and obey the collection deadline. |
| A landing or remote squash creates a commit after the final telemetry snapshot. | Resolve that operation's host and assert exactly one lowercase trailer in its final message. |
| A native identifier or model string is malformed. | Validate before path/query construction; exclude control characters and models longer than 256 characters. |
| A checkpoint append is failed, uncertain, truncated or followed by a crash. | Do not advance beyond a complete flushed and parsed acknowledgement; replay idempotently. |
| SQLite acquisition would create or change a host sidecar. | Leave that live reader disabled with `acquisition-unsupported` until a coherent no-write route is proven. |

## Open Questions

- **Assumption:** `session`, optional outcome fields and append-only status records can be extended additively → changing existing identities or rewriting old rows would break legacy reads and harvest joins.
- **Assumption:** The host requesting a remote squash is the committing operation's host → a literal server-process interpretation would change the trailer contract.
- **Assumption:** Actual supported host entrypoints and an authorized disposable remote target can be exercised during build → unavailable access leaves Tasks 12/13 incomplete and prevents a five-host completion claim.
- **Open Question:** Should implementation proceed with explicit unknown/partial results on entrypoints whose live evidence cannot be verified in the design spike?
  - **Options:** A) Proceed with shared components and per-route capability gates, requiring live proof before claiming five-host completion — permits useful progress while keeping the requested outcome pending. · B) Block implementation until all five hosts and supported entrypoints are live-verified — stronger pre-build confidence but needs access to every host.
  - **Recommended:** A), because it preserves progress and the five-host completion requirement.
  - **Default if unanswered:** A).
- **Open Question:** Should unproven Codex call semantics and unavailable Cursor/Antigravity/Claude/OpenCode live captures remain capability gates rather than be promoted from session-level model records?
  - **Options:** A) Keep the gates and retain selected/session models separately until sanitized fixtures plus live evidence establish run/agent ownership — honest coverage with unfinished capabilities visible. · B) Pause the affected readers until a dedicated live verification round supplies that evidence — less implementation rework but delays them.
  - **Recommended:** A), because the evidence categories already preserve the weaker facts without claiming actual usage.
  - **Default if unanswered:** A).
- **Open Question:** How should database-backed readers proceed while no no-host-write acquisition route is proven?
  - **Options:** A) Develop shared decoding/reporting and investigate a host-provided coherent export or enforced no-write source route, keeping affected live reads disabled and five-host acceptance pending — preserves the original constraint but leaves a load-bearing gate. · B) Pause database-backed implementation until such a route is demonstrated — avoids speculative reader work but blocks those hosts earlier.
  - **Recommended:** A), because the spike disproves a route rather than the whole metadata pipeline.
  - **Default if unanswered:** A). Neither option authorizes host sidecar mutations, permission changes or an unsafe DB/WAL copy.
- **Open Question:** Should the newly specified attachment/resume/acknowledgement protocol be implemented with its full crash, replacement, parser-context and overlap fixture matrix before enabling run-observed aggregation?
  - **Options:** A) Require the matrix before enabling aggregation — gives the previously blocked spike claim a concrete implementation gate. · B) Run a separate disposable protocol spike before implementation — buys earlier feedback but duplicates a small portion of protocol work.
  - **Recommended:** A), because the design now defines the policy the original spike could not exercise.
  - **Default if unanswered:** A).
- **Open Question:** Should remote CLI/MCP merge paths remain gated until exact payload and resulting squash-message verification succeeds?
  - **Options:** A) Require both integration checks during implementation before claiming trailer parity — preserves the accepted lowercase requirement beyond the local formatter. · B) Arrange a separate disposable remote integration exercise first — earlier API confidence but needs an authorized remote target.
  - **Recommended:** A), because the local fixture result does not establish remote delivery.
  - **Default if unanswered:** A).

## Risks and Action Items

None

## Recommended Next Step

```text
/bkit-build #836
```

Or, to address the reasons first: `/bkit-plan #836`
