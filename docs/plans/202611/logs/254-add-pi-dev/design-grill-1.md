## Grill decisions — the owner's answers in this run, the newest text

Settled = the human's answer; the design follows it and flags any departure for the human to confirm. Assumed = unconfirmed default; override only with a stated reason. Open = unknown; the design states how it resolves each.

### Settled

- Q1 First release scope: Complete workflow support, including delegated agents, model selection and safeguards. The owner also directed attention to https://github.com/cbartens/bkit/issues/254#issuecomment-6703124017, incorporated into the input.
- Q2 Delegated-agent integration: Ship a bkit-maintained Pi extension based on Pi's official subagent example.
- Q3 Model providers: Reuse existing model selections with compatibility verified. The owner's initial clarification was OpenRouter only, using the OpenCode/OpenRouter settings; Q5 supersedes that provider restriction.
- Q4 Initial draft acceptance scenario: The owner requested configurable settings instead of fixed OpenRouter delegation; the revised Q6 scenario supersedes this draft.
- Q5 Configurability: Select the provider and override per-agent models and reasoning settings, similar to OpenCode; default to the existing OpenRouter selections. The owner answered A).
- Q6 Revised draft acceptance scenario: Accepted. The owner answered A).

### Assumed, not confirmed

None.

### Open

None.

### Draft Acceptance Scenario

> **DRAFT only:** reviewed in the design interview. Starting point for the design's Acceptance Scenario, not a fixed contract: the design may change any part, and records each change as a Decisions row.

#### Narrative

I install Pi support and run complete bkit workflows through skills. A bkit-maintained extension runs delegated agents with configurable providers, models and reasoning settings, defaulting to bkit's existing OpenRouter selections, while preserving safeguards and reporting failures clearly.

#### Success Criteria

- All five workflows and `bkit-auto` support their required delegation and gates.
- Agents run separately, including required parallel execution and result handling.
- Provider selection and per-agent model/reasoning overrides work; defaults reuse existing OpenRouter selections.
- Safeguards apply to both the coordinating session and delegated agents.
- Install, upgrade, check and uninstall preserve unrelated configuration and other hosts.

#### Key Edge Cases

- Pi and Codex discover skills in the same repository.
- A selected provider, model or reasoning setting is unsupported.
- A required extension or safeguard is unavailable.
- Agents fail, exceed limits or are cancelled; workflows resume or switch hosts.

#### Process Sketch

- WHEN I install Pi support → THEN workflows and the required extension become available.
- WHEN I configure a provider or agent override → THEN agents use the verified settings.
- WHEN I leave settings unchanged → THEN existing OpenRouter selections apply.
- WHEN a workflow delegates → THEN separate agents execute with its required safeguards.
- WHEN execution fails or is cancelled → THEN the outcome is recorded and running agents are handled.
- WHEN I upgrade or uninstall → THEN unrelated configuration remains intact.
