# Design Brainstorm & Ideas

Lens: Optimal trade-off — best long-term shape, legacy constraints set aside.

## Approach A — Define the action contract, then enforce at the narrowest reliable boundary ⭐ Recommended

Describe each hard limit by its prohibited outcome, approval exception, execution boundary and observed host behavior; select small guards at the point where the harmful action occurs, and retain a documented limitation wherever interception or trusted authorization is unavailable.

- **Complexity:** MEDIUM. The design needs a complete rule inventory and evidence for each host, but no new policy language, service or general authorization framework.
- **Extensibility:** A new rule or host adds evidence against the same action contract. The register distinguishes intended policy from shipped behavior and proposed changes, so an advisory cannot silently become an enforced control in the documentation.
- **Risk:** A shared evaluator can give a false impression of shared enforcement. A hook only sees the tool invocation delivered to it; a CLI's child processes and a direct tracker MCP call can use different routes. Treat the boundary, host trust state, runtime mode and bypasses as part of each claim.
- **Maintenance:** Keep one human-readable inventory beside the security and provider documentation, reference canonical rule text rather than copying it, and require behavioral evidence when a selected guard changes. Add a machine-readable register only if a concrete consumer needs it.
- **Friction vs ideal:** The current code already shares command classification, while Claude and OpenCode also ship native permission maps. Aligning their semantics touches shared hook parts, native settings, host adapters, permission tests and the corresponding prose. The immediate issue produces the inventory and separate follow-up proposals; those changes are not implemented here. No existing installation format needs a migration for this design artifact.

The contract classifies a rule as unconditional denial, approval required, verification before landing, advisory, or prose-only. It records partial enforcement and unknown behavior explicitly rather than forcing every rule into a binary enforced/not-enforced label. “Ask” counts as approval enforcement only where a demonstrated human prompt actually prevents execution pending the answer.

For pushing, ordinary pushes should require approval and pre-approved workflow pushes should retain their intended authorization. An active workflow row, lock file, branch name, environment variable, command prefix or instruction in a shell string is not sufficient proof of owner approval: the agent can usually write or reproduce it. The follow-up must identify a trusted authorization channel, bind any exception to the actual operation and target, and ask or block pending owner approval when it cannot establish that binding. If a host cannot provide that channel, record the limitation instead of claiming a cross-host exception is enforced.

For secret disclosure, prioritize controlled writes: tracker comment bodies, PR or merge bodies, commit messages and staged contents that bkit actually receives. These checks improve protection for those routes across hosts, but do not cover arbitrary shell output, external programs, direct MCP writes or chat replies. Use bounded detectors and redacted diagnostics; universal detection of secrets or personal data is not a defensible promise. Keep the broader written rule and narrow token scopes.

For destructive actions, evaluate the rule's actual scope before changing a permission tier. Unconditional prohibitions can become denials where a reliable interception exists. Contextual prohibitions retain explicit exceptions rather than becoming blanket global denials. Parsed fields can continue to use structural validation before the change lands, provided the inventory names which producer, parser and commit or workflow gate actually validates each field.

## Approach B — Enforce all privileged actions through a trusted capability broker

Remove publishing credentials and destructive privileges from the model's process, and let a separate trusted component execute only actions covered by an owner-issued authorization.

- **Complexity:** HIGH. A broker needs an authenticated approval channel, operation schemas, credential custody, concurrency control, authorization expiry and revocation, plus a local or hosted execution boundary.
- **Extensibility:** Strongest long-term control over publish and tracker actions when every path crosses the broker. Host adapters become clients of one operation contract.
- **Risk:** Any residual credential or filesystem permission in the agent's environment creates a bypass. A broker does not control ordinary local file destruction unless the surrounding sandbox removes that power too. Authorization inferred by the model is not a trusted substitute for owner consent.
- **Maintenance:** Security-sensitive lifecycle, deployment and credential rotation become product responsibilities. A broker creates a new privileged system that must itself be audited.
- **Friction vs ideal:** bkit currently ships a local CLI and payload without a server or runtime dependency. This approach changes its operating model, token provisioning and direct GitHub CLI/MCP fallbacks. It would break existing unrestricted tool routes until they are deliberately moved or disabled. It is a useful security upper bound, but building it exceeds this issue and is not a recommended follow-up merely to complete the map.

## Approach C — Use each host's native policy as the primary authority

Represent every eligible rule using the host's native permission settings, add only host-specific hooks where settings cannot express the condition, and document the resulting differences.

- **Complexity:** LOW initially, MEDIUM across five independently changing hosts.
- **Extensibility:** Each host can adopt new native capabilities quickly. Conditional workflow approval and outgoing-content inspection remain limited by the weakest applicable host contract.
- **Risk:** Identically named permission tiers do not guarantee identical behavior. Auto-approval modes, untrusted project configuration, shell wrappers and hooks that fail open can turn a nominal approval into an advisory or automatic approval.
- **Maintenance:** Five policy encodings and their runtime modes need repeated comparison. Documentation can drift unless evidence accompanies each row.
- **Friction vs ideal:** This is closest to the installed settings, but strengthening all “ask” settings would conflict with the owner's case-by-case decision and workflow exceptions. It also cannot, by itself, inspect text passed inside bkit subprocesses or establish that a workflow was authorized by a human.

## Evidence That Shapes the Choice

The issue's historical map is not a verified current capability table. The current source distinguishes the following cases:

<!-- prettier-ignore -->
| Evidence | Consequence for the design |
| --- | --- |
| `.bkit/core/hooks/guardrails-tiers.js`, `gitDenyRule` and `gitAskRule` | Command semantics are shared for three hook hosts, but plain push is not classified as ask and the destructive-command coverage is selective. Shared classification is reusable; it is not proof that every host stops the action. |
| `.bkit/core/.codex/hooks/bkit-guardrails.cjs`, opening contract and ask handling; `.bkit/providers.md` § Codex CLI | The installed Codex adapter deliberately turns ask into advisory context. It cannot be counted as human approval enforcement. Project-local hooks also require the configuration layer to be trusted. |
| `.bkit/providers.md` § Guardrails and § Google Antigravity | Secret-read coverage differs between native reads and shell reads. Antigravity's deny-once advisory is deliberately passed on an identical retry, so it must not be described as a persistent denial. |
| `.bkit/shared/.claude/settings.json` and `.bkit/core/hooks/guardrails-tiers.js` | Force-with-lease is treated separately from unconditional force flags. The final map must preserve the documented personal-branch exception and examine protected targets instead of saying all force pushes are denied. |
| `docs/security.md` § Untrusted Content & Prompt Injection | The security boundary already depends on narrow token scope and validation at privileged writes. Prose is defense in depth. |
| [Claude Code hooks reference](https://code.claude.com/docs/en/hooks) | The documented hook mechanism can decide tool permission before execution, including MCP tools. A concrete hook's registration and mode still need evidence. |
| [Cursor hooks reference](https://prod.cursor.com/docs/hooks) | The documented shell and MCP permission hook outputs include allow, deny and ask. This does not prove bkit registers all relevant events or that every host mode honors a human-approval requirement. |
| [OpenCode permissions](https://opencode.ai/docs/permissions/) | Native rules expose allow, ask and deny, but auto mode approves requests that are not explicitly denied. An ask setting alone is insufficient evidence of an owner approval gate in that mode. |

External pages were inspected on 2026-11-03. Their descriptions establish available mechanisms, not compatibility with an untested installed host version. The local provider notes establish current shipped intent; follow-up implementation acceptance must verify the actual host behavior before claiming enforcement.

## Decisions

<!-- prettier-ignore -->
| Decided | Alternatives | Why |
| --- | --- | --- |
| Recommend Approach A as the long-term shape, implemented incrementally through separate proposed changes. | A central trusted broker; independent native permission maps alone. | It measures the actual safety property, accommodates host limitations and keeps this issue within its decision-only scope. |
| Separate intended policy, observed control and proposed change in every inventory entry. | One “enforced” flag; treating installed settings as proof. | A rule can be partially intercepted, advisory on one host or bypassed in an auto-approval mode. |
| Treat owner approval as provenance that must cross a trusted boundary. | Trust a workflow flag, status row, lock or command name. | All of those can be reproduced by the same actor the approval guard is supposed to constrain. |
| Preserve the owner's ordinary-push approval requirement and workflow exception, with explicit host limitations. | Blanket push denial; silently exempting anything that appears to run bkit. | This follows settled Q1 without pretending that the exception has an available secure implementation on every host. |
| Reconcile each “never”/“ask” mismatch individually. | Raise every ask to deny; weaken every never to ask. | This follows settled Q2 and avoids expanding a workflow-scoped prohibition into a global ban. |
| Recommend targeted secret checks at controllable write boundaries and state all uncovered routes. | A universal outgoing-text scanner; scanning only file reads. | This follows settled Q3 and produces a measurable scope without promising complete secret or personal-data detection. |
| Keep a human-readable evidence register as the immediate deliverable. | Add a new executable policy schema or generator now. | A new policy engine is not needed to decide which guards are worth building and would add speculative implementation scope. |
| Suggest separate follow-up change proposals; create no tracker issues in this phase. | Build guards or create child issues during design. | The accepted scenario and workflow require reviewable proposals and defer implementation to the later authorized phases. |
