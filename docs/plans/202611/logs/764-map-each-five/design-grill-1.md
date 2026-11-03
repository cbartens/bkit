## Grill decisions — the owner's answers in this run, the newest text

Settled = the human's answer; the design follows it and flags any departure for the human to confirm. Assumed = unconfirmed default; override only with a stated reason. Open = unknown; the design states how it resolves each.

### Settled

- Q1 Push approval: Recommend a guard that asks before ordinary pushes while preserving pre-approved workflow pushes, subject to reliably distinguishing authorized workflow pushes. Owner: "Yes to all. Continue with the recommended options."
- Q2 “Never” versus “ask first”: Resolve mismatches individually; deny unconditional prohibitions and clarify intended approval or workflow exceptions. Owner: "Yes to all. Continue with the recommended options."
- Q3 Secret scanning: Evaluate targeted checks on outgoing content bkit can actually inspect, prioritize reliable checks, and explicitly record uncovered surfaces and limitations. Owner: "Yes to all. Continue with the recommended options."
- Q4 Draft acceptance scenario: Accepted. Owner: "Yes, accept the draft. Continue with the design."
- Sandbox recovery: If an approved retry resolves a sandbox restriction, continue the workflow instead of treating it as a failure.

### Assumed, not confirmed

None.

### Open

None.

### Draft Acceptance Scenario

> **DRAFT only:** reviewed in the design interview. Starting point for the design's Acceptance Scenario, not a fixed contract: the design may change any part, and records each change as a Decisions row.

#### Narrative

As bkit’s owner, I can see which hard limits are enforced across all five hosts and which depend on written instructions. I can decide which protections to build without losing legitimate, pre-approved workflow operations.

#### Success Criteria

1. Every hard limit in `.bkit/core/.agents/rules.md` has an evidence-backed enforcement classification for each host.
2. Each gap has a decision: build a guard, retain approval, or retain written instructions with a reason.
3. Every “never” versus “ask first” mismatch has a proposed resolution that preserves intended exceptions.
4. Push protection distinguishes pre-approved workflow pushes; proposed secret checks identify exactly which outgoing content they cover.
5. Each recommended guard has a separate follow-up proposal covering all five hosts or documenting a sourced limitation.

#### Key Edge Cases

- A push’s workflow authorization cannot be reliably established.
- A host cannot intercept an action or inspect outgoing content.
- Secret detection misses a value or flags harmless text.
- A command is prohibited in one context but legitimately approved in another.

#### Process Sketch

- WHEN I inspect a hard limit → THEN I see its enforcement and evidence for each host.
- WHEN wording and enforcement disagree → THEN I see a proposed correction and its exceptions.
- WHEN push protection is proposed → THEN ordinary pushes require approval and authorized workflow pushes remain supported.
- WHEN secret scanning is proposed → THEN its coverage and limitations are explicit.
- WHEN a guard is recommended → THEN it has a separate follow-up proposal; this design phase does not build it.
