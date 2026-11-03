# Design Brainstorm & Ideas

Lens: Pragmatic — existing code, minimal new infrastructure, fastest to ship.

## Approach A — Evidence map with focused guard proposals ⭐ Recommended

Audit the existing rules against the existing enforcement sources, publish the decisions in the canonical design, and propose one follow-up change per selected guard.

- **Complexity:** LOW for this issue. A later guard has its own implementation cost and acceptance criteria.
- **Extensibility:** A row can change when a rule, host capability or guard changes. Source paths and verification evidence make the next review reproducible.
- **Risk:** A declaration such as an internal `ask` verdict can be mistaken for a prompt that actually stops execution. Each host cell therefore records the effective action and the evidence level.
- **Maintenance:** Keep the completed design as the decision record. Put enduring operational facts in the existing `.bkit/core/.bkit/providers.md` and security guidance in its existing home; link rather than maintain another overlapping security manual.
- **Reuse vs new:** Reuse the shared shell parser, shared tier classifier, existing read classifier, host hook drivers, native permission tables and parity tests. The issue adds an evidence map and follow-up proposals, with no new runtime infrastructure or policy language.

### Evidence that shapes the recommendation

These are findings from the source in this checkout, not fresh live-host probes.

<!-- prettier-ignore -->
| Existing mechanism | Current source evidence | Consequence for the map |
| --- | --- | --- |
| Parsed shell decisions | `.bkit/core/hooks/guardrails-tiers.js:96` and `:108` distinguish force push from ask-tier destructive operations; `:234` detects shell secret-file reads. | Reuse the classifier for focused shell proposals. Do not create a second command parser. |
| Claude Code permissions | `.bkit/shared/.claude/settings.json` supplies allow, ask and deny rows. `.bkit/core/.claude/hooks/bkit-guardrails.cjs:17` explicitly makes the shell hook advisory only. | Attribute blocking to native permissions. The hook does not enforce the shared tier table on Claude. |
| Cursor guardrails | `.bkit/core/.cursor/hooks/bkit-guardrails.cjs` returns native `permission` decisions and includes the shell and read classifiers. | Record the shell and direct-read surfaces separately. A shell private-key read asks; a direct private-key read denies. |
| Codex guardrails | `.bkit/core/.codex/hooks/bkit-guardrails.cjs:10` documents that `ask` is unimplemented; `:136` emits advisory context for the ask tier. `.bkit/core/.bkit/providers.md:58` requires a trusted project layer before these hooks load. | Mark ask-tier actions ADVISORY, with the trust prerequisite. An internal verdict named `ask` is not an enforced approval. |
| Antigravity guardrails | `.bkit/core/.agents/plugins/bkit/hooks/bkit-guardrails.cjs:66` handles direct reads and `:107` returns its native ask decision for ask-tier shell commands. Its advisory paths deny once and permit an identical retry. | Distinguish persistent deny, real ask and deny-once advisory. A blocked first attempt alone does not prove an invariant. |
| OpenCode permissions | `.bkit/shared/.opencode/opencode.json:4` and `:21` hold native read and bash maps. The bash map allows ordinary commands by default. | Record the permission glob behavior independently from the parsed script-host classifier. |
| Force-push exception | `.bkit/shared/.claude/settings.json:11` and `.bkit/shared/.opencode/opencode.json:69` explicitly allow `--force-with-lease`; `gitDenyRule` matches `--force`, short `f` flags and `+refspec`, not `--force-with-lease`. | Correct the issue's statement that every force-push form is denied. The personal-branch and shared-branch distinction remains a separate policy question. |
| GateGuard configuration notice | `.bkit/core/hooks/gateguard-engine.js:110` builds the approval advisory; `BKIT_ALLOW_CONFIG_EDIT` suppresses that special notice, and `BKIT_GATEGUARD` selects the existing optional deny mode. | Default GateGuard behavior is advice, not proof that an owner approved a change. An environment switch is not an approval record. |

The active decisions `guardrail-tiers-parsed-on-script-hosts-globs-on-permission-tables`, `guardrails-shell-advisory-scope-and-detection`, `gateguard-advisory-default-fail-open-pure-engine` and `501-capitals-mark-hard-limits-only` corroborate these boundaries. The first explicitly records that Claude and OpenCode have no shell secret-read permission rows, because a glob cannot reliably distinguish a read from a filename mention. The issue's older map should not be copied as a current enforcement claim.

### Shape of the evidence map

Use one row per hard-limit clause, including its explicit exception, and retain the source rule's label as its identity. A clause containing two distinct harms or exceptions can have more than one row. Do not reduce the deliverable to five aggregate rows.

Each row records the harm, rule and exception, five host outcomes, enforcement source, source or test evidence, proposed decision, and reason. Effective outcomes are deny, ask, advisory, commit-time check, prose-only or unverified. A mechanism with narrower coverage is marked partial and names the uncovered route. Separate source evidence, automated test evidence and a live host observation rather than treating them as interchangeable.

The inventory includes the published rules beyond the issue's examples: CI approval, production merge approval, explicit squash-merge bodies, staging protections, secrets in output, PII, destructive Git exceptions, push scope, and parsed-contract constraints. First identify every hard-limit clause in `.bkit/core/.agents/rules.md`; then account for each exactly once or explain a split. A rule that belongs to a stack or surface absent from bkit is recorded with its scope and prose-only reason, rather than silently omitted.

### Proposed outcomes for the five harms

<!-- prettier-ignore -->
| Harm | Practical decision |
| --- | --- |
| Destroying data | Preserve existing global denies and distinguish workflow prohibitions from commands the owner may deliberately request elsewhere. Resolve each ask-versus-never mismatch individually. Recommend targeted guards only where the intended prohibition and its exceptions can be recognized without a blanket Git ban. |
| Leaking secrets or personal data | Retain the existing direct-read and shell-read controls with their actual host limits. Recommend bounded scanning at bkit-controlled publishing and staging boundaries where bytes are available before transmission. Record arbitrary replies, generic logs, unrecognized secrets and direct connector writes as uncovered unless a verified host mechanism covers them. |
| Publishing or pushing | Recommend asking before ordinary pushes while preserving a workflow's specific pre-approved push. Reuse `bkit branches push` and `bkit branches land` as the workflow-owned boundaries. A branch name, lock, active status row, environment variable or text saying “workflow” does not itself prove authorization. If the proposed host route cannot reliably distinguish authorization, keep the exception unresolved for that route and report the limitation. |
| Skipping approval | Retain explicit owner approval for issue creation, migrations, CI changes, production merges and gate exceptions. Document their current enforcement separately. A targeted future approval mechanism must bind an approval to the operation it permits; this issue does not add a general approval service. |
| Breaking parsed fields | Reuse the existing notation, shape and contract tests plus workflow validators. Record which checks run at edit, commit, workflow-step or CI time and the content they cover. “A test exists” is insufficient to call every consumer commit protected if that consumer does not run the test. |

The secret-scanning follow-up should name a bounded first surface, such as bkit-generated tracker comment bodies and Git commit or merge messages. It should inspect text already being published, reject high-confidence matches before transmission, report only a redacted finding and handle false positives explicitly. A second staging guard can inspect staged paths and content independently. These are separate guard proposals when their execution boundaries differ. Existing `.gitignore` entries are helpful defaults, but they do not enforce the rule against forced staging.

The push proposal should first verify each host's supported prompt or block-and-authorize route. Codex's current source-backed ask limitation is an explicit gap. It is acceptable to recommend a guard for supported hosts and a sourced limitation for another host; claiming uniform prompting would contradict the owner's condition that authorization be reliably distinguished.

## Approach B — Fixture-driven enforcement catalog

Define a small rule-to-surface catalog and use the existing Vitest host fixtures to generate the enforcement matrix from tested examples.

- **Complexity:** MEDIUM. Catalog design, fixture coverage and generated-document ownership become additional work before the decisions can be delivered.
- **Extensibility:** A new rule or host adds examples to the same catalog, and a changed decision fails the matching fixture.
- **Risk:** Passing fixtures can overstate coverage of shell encodings, external connector writes or host behavior. Fixtures exercise bkit's emitted JSON rather than proving that the current host respects it.
- **Maintenance:** The catalog must stay synchronized with the rules and every native permission map. Human judgment is still needed for scope and policy exceptions.
- **Reuse vs new:** Extend `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts`, the Antigravity integration tests, install integration tests and the settings ask-rule audit. Add only the smallest catalog needed; do not replace native host configuration with a new policy interpreter.

This is a reasonable follow-up if the completed map is hard to maintain. It is slower than Approach A for an issue whose requested output is a decision about future guards, and it does not remove the need to verify actual host behavior.

## Approach C — Enforce through bkit-owned command boundaries

Route supported publishing and privileged operations through existing bkit verbs and place targeted guards immediately before their side effects, leaving host hooks to intercept recognized direct commands where possible.

- **Complexity:** MEDIUM to HIGH because command coverage and authorization semantics must be designed and verified for each chosen operation.
- **Extensibility:** A new bkit-managed action can reuse its command boundary. Operations performed directly through a host, shell program or connector require their own adapter or an explicit gap.
- **Risk:** A wrapper is easy to bypass when the agent can invoke the underlying tool. An agent-writable approval file or workflow status can also be mistaken for independent owner consent.
- **Maintenance:** Guard logic lives with the existing commands, but the documentation must name bypasses and the host restrictions that close them.
- **Reuse vs new:** Extend `commands/workflow/branches.ts`, `commands/workflow/issues.ts`, tracker helpers and the existing commit paths as appropriate. Do not add a generic tool proxy or broad authorization framework for this issue.

This is useful as the implementation direction for selected follow-ups, particularly bounded outgoing-text checks. It is not a substitute for the per-rule, per-host evidence map, and it cannot honestly promise universal approval enforcement.

## Decisions

<!-- prettier-ignore -->
| Decided | Alternatives | Why |
| --- | --- | --- |
| Recommend Approach A as the delivery approach for this issue. | Build a generated catalog first; centralize every privileged action first. | The owner needs a complete map and explicit guard choices. Existing source and test evidence can support that output without new runtime infrastructure. |
| Treat the five harms as organizing categories and inventory individual hard-limit clauses. | Audit only the five example rows. | The accepted criterion covers every hard limit in the source rules, including exceptions and surfaces absent from the old map. |
| Distinguish effective host action from a shared classifier's internal tier. | Assume a shared `ask` means every host prompts. | The Codex driver emits advisory context for ask, while Claude and OpenCode use native maps. Source-level parity does not imply enforcement parity. |
| Preserve the accepted push recommendation subject to reliable authorization and verified host support. | Allow based on active workflow status; promise native ask on all hosts. | The owner pre-approved workflow pushes, but an arbitrary status file is not independent consent and the Codex source documents no working ask hook. |
| Resolve prohibition and approval mismatches one rule at a time. | Globally promote asks to deny; globally soften never to ask. | Global permissions also affect valid owner-directed work, and the accepted answer explicitly preserves intended exceptions. |
| Prefer small outgoing-content and staging guard proposals at existing boundaries. | Scan every chat reply and arbitrary log; create a universal interception layer. | These boundaries expose the bytes before the side effect and can be tested without pretending that bkit controls every host output. |
| Retain source-backed limitations and prose-only decisions with their reasons. | Mark a rule enforced when any related control exists. | File-read restrictions, ignored paths and workflow prose do not enforce every route by which a secret can leave. |
| Suggest follow-up change issues on the parent rather than create them during design. | Create an issue automatically for each guard. | The accepted scenario asks for follow-up proposals, and the design workflow's catalog explicitly reserves filing issues to the owner. |

