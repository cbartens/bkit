# Design Brainstorm & Ideas

Lens: Risk premortem — failure modes, scale, time, handover.

## Approach A — Prevent false enforcement claims ⭐ Recommended

Build the design around a rule-by-rule evidence register, with a separate result for each host and action surface, so a shared classifier cannot be mistaken for shared enforcement. Complexity is MEDIUM because the evidence is distributed, but this approach reuses the existing rule source, provider documentation, permission tables, hook parts and parity tests. It adds no runtime service or policy framework.

The register records the rule, harm, intended scope and exceptions, host, intercepted action, current effect, evidence, failure behavior, gap decision and proposed follow-up. Current effects distinguish a persistent block, a human approval request, an advisory, a check before publication, a partial control and a prose-only rule. An unverified host capability stays unverified. Neither a warning nor a one-time denial counts as a persistent block.

### Source findings that shape the risks

<!-- prettier-ignore -->
| Evidence | What it establishes | Consequence for the design |
| --- | --- | --- |
| `.bkit/core/.codex/hooks/bkit-guardrails.cjs`, `decideShell` and the driver | The shared ask tier becomes `additionalContext`; the command runs. Deny is emitted separately. The driver catches errors and allows execution. | A row labelled ask in the shared classifier is advisory on the shipped Codex adapter. Do not promise a native approval prompt without new evidence. |
| `.bkit/core/hooks/guardrails-tiers.js`, `gitDenyRule` | `--force`, `-f` and leading `+` refspecs are denied. `--force-with-lease` is not included. | The issue's older claim that every force-push form is denied is too broad. Shared-branch protection and personal-branch exceptions need distinct coverage. |
| `.bkit/core/hooks/guardrails-tiers.js`, `gitAskRule` | `reset --hard` is ask-tier; other reset forms are not. Dry-run clean and staged-only restore are excluded from those ask checks. | Inventory command semantics and intended exceptions rather than assuming the prose and classifier have identical coverage. |
| `.bkit/core/.agents/plugins/bkit/hooks/bkit-guardrails.cjs` | Destructive deny returns a persistent deny decision; ask returns the host's ask decision. Fetch and shell-edit advisories use `adviseOnce`. | A denied first call can be an advisory delivery mechanism. Its retry behavior belongs in the evidence. |
| `.bkit/providers.md`, Guardrails and Permissions / auto-approve | Claude and OpenCode use command-text globs; Cursor, Codex and Antigravity use parsed command tiers. The docs describe glob gaps, hook trust prerequisites and fail-open behavior. | Equal policy intentions are not proof of equal action coverage. Record the adapter, tool matcher, installation prerequisites and bypass surface. |
| `docs/security.md`, Untrusted Content & Prompt Injection | Prose is defense in depth; narrow token scope is a structural control. | A recommendation cannot claim to prevent hostile behavior merely because the same agent follows a rule or writes a status row. |

These are observations of the checked-out bkit sources. They are not fresh runtime verification of the current upstream hosts. A claim that a host has no equivalent requires current primary documentation or a narrowly scoped probe before it becomes a final absence claim.

### Premortems

<!-- prettier-ignore -->
| Premortem | What breaks | Observability | Recovery |
| --- | --- | --- | --- |
| 10x scale | Many rules, hosts and tools make a short summary hide partial coverage; one policy row can affect every consumer. | Each rule retains its own rows and evidence, with counts of covered, partial, prose-only and unverified results. Spot checks expose a claimed control lacking an adapter or action surface. | Split an overbroad row into its actual conditions. Prioritize follow-ups by irreversible harm and exposure, without collapsing exceptions into a blanket deny. |
| 6 months later | A host changes tool names, hook payloads or approval behavior while the document still says enforced. Consumer-owned hook drivers may diverge from the template. | Every claim names the inspected source revision or host documentation date and the existing test or probe supporting it. A source change identifies which claims need review. | Downgrade stale evidence to unverified and re-check that host. Preserve the existing safe behavior while correcting the claim; do not infer new capability from a similarly named field. |
| On-call at 3am | A legitimate workflow push is blocked, or an advisory is mistaken for a block after publication. A scanner could leak the matched secret in its error. | Proposed guards report the rule, action, target, decision and reason without payload contents. Distinguish no authorization, unsupported interception, parse failure and actual denial. | Use the documented owner-approved path for the exact operation. For an actual leak, use the existing security incident process. Do not globally disable guards or automatically turn an unknown authorization into allow. |
| Author leaves | Maintainers remember which exceptions were intentional but the next author sees only contradictory prose and settings. | Each mismatch includes its intended policy, explicit exception, supporting decision and disposition. Follow-up proposals link back to the evidence. | A replacement maintainer can reproduce the classification from the recorded sources and decide one mismatch without reconstructing the entire discussion. |

### Risk-mitigation guidance

- Preserve the owner's three settled choices. Recommend ordinary-push approval, resolve mismatches individually, and evaluate targeted secret checks. Where a host cannot deliver the intended control, record the limitation and the nearest supported behavior instead of calling an advisory approval.
- Treat a workflow name, feature branch, environment variable, lock or `IN_PROGRESS` row as context only. They are writable by the acting agent and do not prove that the owner approved a particular remote, ref or publication. A proposed automatic exception needs evidence that binds the authorization to the intended operation. When that evidence is unavailable, recommend an explicit owner-controlled path or a documented limitation.
- Include concurrent workflows and worktrees in the push proposal. Authorization for one repository, target or run does not authorize another, and a stale run should not inherit a blanket bypass.
- Limit proposed secret checks to content available before the relevant side effect, such as bkit-owned tracker or commit payloads where the actual sink can be identified. Enumerate direct MCP calls, arbitrary shell subprocesses and final chat replies separately; a bkit helper cannot claim to cover all of them.
- Classify semantic rules, including personal-data exposure, tenant isolation and migration policy, as prose-only or partially supported where the stack-agnostic tool has no reliable signal. Keep the rationale specific to the rule rather than inventing a generic detector.
- Treat a follow-up as a proposal with scope, exceptions, recovery and host coverage. This design neither builds guards nor files child issues.

## Approach B — Prevent an unexamined path from bypassing the policy

Organize the investigation around concrete harmful action paths, then cross-reference every hard limit back to those paths. Complexity is MEDIUM to HIGH: this exposes bypasses clearly, but maintaining exhaustive rule coverage is harder than in Approach A. Reuse the existing permission tables and hook tests as evidence for direct shell, nested shell, engine subprocess, file tool, MCP write and publication paths.

### Premortems

<!-- prettier-ignore -->
| Premortem | What breaks | Observability | Recovery |
| --- | --- | --- | --- |
| 10x scale | Each operation has multiple tools, shell encodings and hosts; scenario combinations grow rapidly and reviewers miss a whole route. | A path table identifies the decision point and the irreversible side effect. A separate rule crosswalk reveals rules with no scenario. | Keep representative boundary cases for each distinct interception mechanism and classify unexamined routes explicitly. Use Approach A's rule register as the completeness check. |
| 6 months later | Examples become a frozen list while a new tool or engine helper bypasses the old entry point. | Record why each example represents a class and which tool matcher or helper owns the boundary. New entry points become visible as missing links. | Add the new path to the classification and re-evaluate only the affected controls. Do not treat a passing old example as proof about a new tool. |
| On-call at 3am | A failure report says only that a push happened; nobody knows whether it came from a shell command, bkit's subprocess or MCP. | Proposed diagnostics identify the invoking surface, normalized action, target and outcome without storing secrets or whole outgoing messages. | Trace the actual route, correct its classification and apply the narrow remedy at that boundary. A shell-only fix is not represented as a fix for MCP writes. |
| Author leaves | The original investigator knows why a command example was selected, but the maintainer interprets it as the entire policy. | Every scenario links to the exact rule, its scope and the equivalence class it represents. | Reconstruct scenarios from the rule crosswalk and interception contracts rather than copying examples without context. |

### Risk-mitigation guidance

- Layer the same authorization, redaction and host-evidence requirements from Approach A onto this approach.
- Include valid operations as counterexamples: authorized workflow pushes, personal-branch lease-protected pushes where policy permits them, recovery from an in-progress rebase, harmless file examples and dry-run operations. These reveal controls likely to be disabled because of false alarms.
- Distinguish subprocess coverage from top-level tool coverage. Seeing `bkit branches push` in a tool call does not by itself establish that a shell hook sees the child `git push`.
- State when enforcement happens. A pre-commit check can protect a committed artifact; it does not necessarily prevent a malformed working-tree field from being read before that commit.
- Use this approach as a challenge lens over Approach A. As the primary deliverable it risks becoming a collection of good examples that still misses a hard limit.

## Approach C — None

The two approaches differ in the failure they organize around. A separate generic policy engine or universal output scanner would add implementation scope without evidence that the hosts expose the required boundaries.

## Decisions

<!-- prettier-ignore -->
| Decided | Alternatives | Why |
| --- | --- | --- |
| Recommend Approach A, challenged with Approach B's action paths. | A five-row harm summary; an example-only audit. | The accepted outcome requires every hard limit and every host, while examples alone cannot establish completeness. |
| Record the actual enforcement effect per host and surface. | Copy the shared classifier's deny or ask label into every host column. | Codex's shipped ask adapter is advisory, and Antigravity's one-time denial can be advisory delivery. |
| Keep an automatic workflow-push exception conditional on credible authorization evidence. | Trust a branch name, active status row or environment flag. | Mutable run context is useful coordination data but does not independently establish owner approval. |
| Recommend bounded secret checks at identified outgoing boundaries. | Scan all replies and messages; treat a regex match as proof of complete protection. | The owner accepted targeted checks, and interception coverage and detector accuracy are separate limitations. |
| Preserve intended policy exceptions and classify mismatches individually. | Deny every prohibited command globally; weaken every never rule to ask. | Both blanket choices contradict the accepted decision and can either block valid work or permit irreversible harm. |
| Propose follow-up work without implementing guards or creating issues. | Expand this design into guard implementation. | The accepted draft makes separate proposals the output of this phase. |

## Cross-Approach Risks

- The apparent five-row map understates the scope. The rule source also contains hard limits around production merges, shared services, secret synchronization, tenant data, migrations, CI edits and structured tracker writes. The inventory must account for each relevant clause, including rules that have no general-purpose enforcement mechanism.
- A hook installed in an untrusted or disabled project layer provides no protection. The evidence needs installation and runtime-mode prerequisites, not just a path to a generated file.
- Existing hooks deliberately fail open. A proposal that changes that contract must state which operations stop on malformed input or internal failure and how a legitimate owner recovers; blanket fail-closed behavior is not implicitly approved by this design.
- Agent-editable settings and drivers, direct tools, alternate executables and unrestricted credentials limit resistance to a hostile agent. Describe the intended protection against accidental violations separately from a tamper-resistant security boundary.
- Secret detectors can miss transformed values and personal data, flag examples, or create a second disclosure through diagnostic text. Report detector identifiers and locations rather than matched values, and document residual exposure.
- A global change to the shipped permission tier affects all consumers and all workflow modes. Each follow-up needs a per-host rollout and rollback argument, with the intended owner approval exceptions retained.
- Test fixtures establish bkit's emitted payload and classification, not every live host's current response. Source evidence, primary host documentation and runtime probes should remain distinguishable.
- Publication includes tracker writes, tags and merges as well as package releases and pushes. A push guard is one selected control, not a complete solution for the publishing harm.

No implementation or live host probe was performed for this brainstorm. The evidence above is source inspection and existing documented decisions; unresolved host behavior remains a verification requirement for the final design.
