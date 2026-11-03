<!-- bkit:anchor
baseSha: 60e805249d8845b89fd7b17e9831923e10d91cac
baseRef: origin/dev
bkitVersion: 6.0.0
bkitLatest: 6.0.0
-->
Verdict: PASS
<!-- verdict:end -->


# Design: Map hard limits to enforcement across five hosts

## Related Issues

None.

The ranked related-issue search returned only the current issue. Parent references remain in the input as context rather than additional search matches.

## Acceptance Scenario

The scenario starts from the owner's accepted interview draft. The register describes current shipped controls; the selected proposals describe intended changes.

### Narrative

As bkit’s owner, I can see which hard limits are enforced across all five hosts and which depend on written instructions. I can decide which protections to build without losing legitimate, pre-approved workflow operations.

### Success Criteria

1. Every hard limit in `.bkit/core/.agents/rules.md` has an evidence-backed enforcement classification for each host.
2. Each gap has a decision: build a guard, retain approval, or retain written instructions with a reason.
3. Every “never” versus “ask first” mismatch has a proposed resolution that preserves intended exceptions.
4. Push protection distinguishes pre-approved workflow pushes; proposed secret checks identify exactly which outgoing content they cover.
5. Each recommended guard has a separate follow-up proposal covering all five hosts or documenting a sourced limitation.

### Key Edge Cases

- A push’s workflow authorization cannot be reliably established, or belongs to another target, worktree or run.
- A host cannot intercept an action, cannot request human approval, or does not load the project hook.
- Secret detection misses a value, flags harmless text, or discloses a value through its own diagnostic.
- A command is prohibited in a workflow but legitimately approved in another context.
- An internal hook error permits execution, or an automatic approval mode bypasses the human prompt.

### Process Sketch

- WHEN I inspect a hard limit → THEN I see its enforcement and evidence for each host.
- WHEN wording and enforcement disagree → THEN I see a proposed correction and its exceptions.
- WHEN push protection is proposed → THEN ordinary pushes require approval and authorized workflow pushes remain supported.
- WHEN authorization or interception is unavailable → THEN I see the limitation and the supported owner-controlled path.
- WHEN secret scanning is proposed → THEN its coverage and limitations are explicit.
- WHEN a guard is recommended → THEN it has a separate follow-up proposal; this design phase does not build it.

## Reuse & Prior Art

<!-- prettier-ignore -->
| Capability | Prior art | Verdict | Why |
| --- | --- | --- | --- |
| Rule inventory | `.bkit/core/.agents/rules.md`; `.bkit/core/.bkit/authoring.md` § All Agent-Read Files; this design record | EXTEND | The 29 capital-bearing rule bullets identify the existing hard limits. Add evidence and dispositions without a runtime policy schema. |
| Shell classification | `.bkit/core/hooks/guardrails-shell.js`, `guardrails-tiers.js`, `guardrails-read.js` | EXTEND | Reuse the existing parser and tier decisions for selected shell guards. |
| Host decisions | Cursor, Codex and Antigravity `bkit-guardrails.cjs` drivers; `.bkit/shared/.claude/settings.json`; `.bkit/shared/.opencode/opencode.json` | EXTEND | Native tables and adapters already define action surfaces. Their effective behaviors remain separately recorded. |
| Workflow pushes and landing | `.bkit/core/engine/commands/workflow/branches.ts`; `prs.ts` | EXTEND | Existing verbs know actual branch/target, avoid force on shared branches and pass explicit squash bodies. These are action boundaries, not independent proof of consent. |
| Controlled publication payloads | `commands/workflow/issues.ts`, `tracker.ts` and existing comment payload files | EXTEND | Outgoing bytes and destinations exist before side effects. Use that seam for bounded secret checks. |
| Staged-secret protection | Existing Git staging/commit paths, ignored secret paths and copy-and-own pre-commit template | EXTEND | Inspect the actual index; ignore rules do not prevent forced staging or secrets in innocently named files. |
| Complementary secret detection | Existing copy-and-own `.bkit/templates/.github/workflows/bkit-trivy.yml`; repository push protection described in `docs/security.md` | EXTEND | Reuse existing detection options where suitable. The Trivy template requires consumer adoption and scans in CI; service-side push protection depends on repository configuration and supported secret types. Neither covers every local candidate index or bkit-owned outgoing payload. No scanner dependency is selected here. |
| Parsed-field validation | `ledgers/telemetry.ts`; `commands/workflow/steps.ts`, `status.ts`, `tests.ts`; notation, workflow-shape and instruction audits | EXTEND | Existing consumers should reject malformed inputs. No second general schema is required. |
| Evidence verification | Hook integration tests, settings ask-rule audit, install permission-parity tests and provider notes | EXTEND | Fixtures show emitted behavior. Host probes establish that the host honors it. |

The sweep read shipped permission maps, shared hook parts, host drivers, provider notes, workflow command seams, relevant active decisions and the design document index. Text searches covered capital words, command tiers, push flags, label transitions, transport accounting, validation reasons and merge-body arguments. No new runtime component is selected.

Claude documents pre-tool permission decisions in its [hooks reference](https://code.claude.com/docs/en/hooks). OpenCode documents native allow/ask/deny, last-match-wins rules and automatic approval of non-denied requests in its [permissions reference](https://opencode.ai/docs/permissions/). These primary pages were inspected on 2026-11-03. They establish available mechanisms, not that an installed bkit adapter uses them. Current-source evidence is the basis of the register; no upstream absence claim rests on an unsuccessful search.

The feasibility review also checked [Git hooks](https://git-scm.com/docs/githooks), [Trivy secret scanning](https://trivy.dev/docs/latest/guide/scanner/secret/) and [GitHub push protection](https://docs.github.com/en/code-security/concepts/secret-security/push-protection). These establish the pre-commit bypass and complementary detector capabilities. Choosing a detector later requires its exact version, input support, redaction, footprint, license and maintenance to be evaluated; this design adds no detector or runtime dependency.

## Architecture

### Delivery and evidence boundaries

This phase delivers the completed evidence register and separate guard proposals. It adds no service, database, runtime dependency, policy language, broker or migration. The canonical design holds the decision record. Enduring operational facts continue to belong in the existing provider and security documentation when later changes update those facts.

The selected approach combines the pragmatic exploration's complete inventory, the long-term exploration's action/authorization boundaries and the risk exploration's challenge against alternate paths. Sharing a classifier does not establish shared enforcement.

The inspected baseline is source revision `d642905db4768fdace8aa07ef9a16d52cb58af49`, on 2026-11-03. All 29 source bullets containing `NEVER`, `ALWAYS`, `MUST`, `ONLY` or `PROHIBITED` are accounted for. Distinct destructive operations and exceptions are split into clause rows.

<!-- prettier-ignore -->
| Evidence | Source and claim supported | Level |
| --- | --- | --- |
| E1 | `.bkit/core/.agents/rules.md`, lines 34-166: intended rule, scope and exceptions | Source read |
| E2 | `.bkit/shared/.claude/settings.json`; `.bkit/shared/.opencode/opencode.json`: native command/read rows | Source read |
| E3 | `.bkit/core/hooks/guardrails-tiers.js` and `guardrails-shell.js`: parsed command classes and shell-read detection | Source read |
| E4 | Cursor, Codex and Antigravity `bkit-guardrails.cjs` drivers; `.bkit/providers.md` § Codex CLI, § Guardrails, § Permissions / auto-approve: translation, registration and limitations | Source read and existing provider record |
| E5 | `.bkit/core/hooks/gateguard-engine.js`, `configAdvisory`: default advice and optional first-touch denial | Source read |
| E6 | `.bkit/core/engine/commands/workflow/branches.ts`, `pushBranch`: ordinary push on shared branches, lease-protected push on personal branches | Source read |
| E7 | `commands/workflow/prs.ts`, `mergePr` and `crossCheckRows`: dev-only merge, explicit empty body and partial transport accounting | Source read |
| E8 | `ledgers/telemetry.ts` validation; `commands/workflow/issues.ts`, `transitionLabels`; `steps.ts`, `status.ts` | Source read |
| E9 | `audits/hooks/guardrails-cursor.integration.test.ts`, `guardrails-antigravity.integration.test.ts`, `gateguard-parity.integration.test.ts`; `audits/templates/settings-ask-rules.test.ts`; `install/modules/index.integration.test.ts` | Existing test sources; not newly executed |
| E10 | `audits/workflows/prompt-notation.test.ts`, `workflow-shape.test.ts`, `skip-ci-subject-audit.test.ts`; `tools/instructions.test.ts`; `commands/workflow/tests.ts` | Existing test/validator sources; not newly executed |
| E11 | `docs/security.md` § Untrusted Content & Prompt Injection and § Secrets Management: narrow token scope and semantic-output limits | Documentation and source intent |
| E12 | Current OpenCode permissions reference | Primary documentation, inspected 2026-11-03 |

Engine paths abbreviated in E7-E10 are under `.bkit/core/engine/`. No fresh live-host probe was performed. Source evidence proves what bkit emits/configures, not a current host's end-to-end response. A test reference does not mean that test ran during generation.

### Classification and prerequisites

Host cells use `P` for prose-only, `ADV` for advice, `ASK*` for a configured approval request with runtime prerequisites, `DENY*` for a configured block on the recognized surface, `PART` for narrower coverage and `CHECK` for a validator that rejects invalid data on its route. `P` means the inspected bkit surface has no control for this rule; it does not assert that the host has no possible security feature. Unknown consumer controls remain unverified.

All script hooks need registration, installation, compatible payloads and an enabled/trusted project layer. Their top-level error handling deliberately allows the action on payload/internal errors. Cursor's process-crash behavior is narrower than failing closed on every internal error. Agent-editable hooks/settings protect against accidental violations; they are not a tamper-resistant boundary against the agent.

Claude/OpenCode use command-text globs; Cursor/Codex/Antigravity use the shared parsed classifier. Their recognized sets differ. Codex's shipped ask translation is `ADV`, and execution continues. Antigravity's advisory delivery denies once and permits an identical retry; that differs from its persistent deny tier. OpenCode `ASK*` becomes automatic approval under `--auto`; explicit deny remains enforced. Bypass or automatic-approval modes require separate verification before a human-approval claim.

### Complete hard-limit register

Rule labels and line numbers refer to E1. A multi-clause bullet appears more than once where effects differ. Retaining prose is an explicit disposition with a reason, not a claim that capitals enforce the rule.

<!-- prettier-ignore -->
| Rule / source line and scope | Harm | Claude | Cursor | Codex | OpenCode | Antigravity | Evidence and disposition |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Major changes, 34: confirm major decisions; a forced workflow decision is surfaced | Approval | P | P | P | P | P | E1/E11. Retain prose: architectural/UX significance is semantic. Decision output is review evidence, not independent consent. |
| CI edits, 52: confirm before editing workflow files | Approval | P | P | P | P | P | E1/E5. GateGuard is general edit advice, not a CI-approval gate. Retain prose and review; a path-only ban cannot recognize prior task authorization. |
| Deferred work, 74: closed-enum reason on every deferral | Parsed field | CHECK/PART | CHECK/PART | CHECK/PART | CHECK/PART | CHECK/PART | E8. Retain `ledgers append` validation. Direct edits remain uncovered; source-repo integrity checks are not guaranteed in every consumer. |
| Tracker issue settings, 78: machine-readable blocked-by | Parsed field | P | P | P | P | P | E1 and tracker shape contract. Retain specified form and prose; tracker API constraints do not validate arbitrary body text. |
| Tracker next labels, 79: exactly one next label without phase, standing audits excepted | Parsed field / publication | PART | PART | PART | PART | PART | E8. Phase transition removes next labels, but does not enforce every external issue's exactly-one-next invariant. Retain helper and prose for direct writes/standing-parent semantics. |
| Tracker issue creation, 77: explicit confirmation | Approval / publication | P | P | P | P | P | E1/E11. Broad tool/MCP allows do not prove consent. Retain prose and this workflow's no-create behavior; no generic approval service selected. |
| Tracker context cut, 84: confirm context-discard marker | Approval / data loss | P | P | P | P | P | E1; `issues.ts` consumes the marker but cannot infer authorization. Retain prose; presence does not prove owner intent. |
| Docs commits, 93: skip marker only without code | Parsed field / publication | PART | PART | PART | PART | PART | E10. Audits constrain known literals/routes, not arbitrary commits. Retain route checks and prose. |
| Secrets, 95: never stage secret paths/values | Secret | PART | PART | PART | PART | PART | E1/E2/E11. Ignore defaults and read gates do not inspect the index or reject forced staging. Select G3; retain prose for unrecognized values. |
| Pushes, 96: one approval per ordinary push; mandated workflow exception | Publication / approval | P | P | P | P | P | E2-E6. Ordinary push is not ask-tier. Select G1 with scoped authorization and explicit host limitations. |
| Destructive git, 97: reset --hard | Data loss | ASK* | ASK* | ADV | ASK* | ASK* | E2-E4. Retain ask outside workflows; clarify workflow prohibition and deliberate owner-directed exception in wording. Ask does not enforce never. |
| Destructive git, 97: other reset modes | Data loss | P | P | P | P | P | E2/E3. Retain workflow prose and clarify scope; no blanket denial of intentional index operations. |
| Destructive git, 97: whole-tree checkout | Data loss | ASK*/PART | ASK* | ADV | ASK*/PART | ASK* | E2-E4. Retain ask outside workflows, prohibit unrequested loss inside them, and preserve rebase recovery. |
| Destructive git, 97: whole-tree restore | Data loss | ASK*/PART | ASK*/PART | ADV/PART | ASK*/PART | ASK*/PART | E2-E4. Parsed tier excludes staged-only restore; globs differ. Clarify destructive working-tree scope; retain ask for that scope. |
| Destructive git, 97: destructive clean | Data loss | ASK*/PART | ASK* | ADV | ASK*/PART | ASK* | E2-E4. Globs recognize forced forms; parsed tier excludes dry runs. Clarify destructive versus dry-run scope; retain ask outside workflows. |
| Destructive git, 97: interactive rebase | Data loss | ASK*/PART | ASK* | ADV | ASK*/PART | ASK* | E2-E4. Retain ask for deliberate owner-directed work outside workflows; automated initiation stays prohibited. Preserve continue/abort recovery. |
| Destructive git, 97: stash drop/clear | Data loss | ASK*/PART | ASK* | ADV | ASK*/PART | ASK* | E2-E4. Retain ask outside workflows and clarify the written prohibition's scope. |
| Destructive git, 97: unconditional force flags/plus refspec | Data loss / publication | DENY*/PART | DENY* | DENY* | DENY*/PART | DENY* | E2-E4. Retain deny and personal lease exception. Native glob gaps remain explicit; target-sensitive lease protection is G2. |
| Other parallel agents, 98: never revert/reformat/clean another's work | Data loss | PART | PART | PART | PART | PART | E1-E4. Some destructive actions ask, but ownership/reformatting is unclassified. Retain prose and isolation; dirty files do not establish ownership. |
| Other parallel agents, 98: no stash/switch/checkout/restore of untouched work | Data loss | PART | PART | PART | PART | PART | E1-E4. Whole-tree controls cover a subset; plain stash, navigation and file ownership remain prose. Avoid a global workspace-navigation ban. |
| Pre-push, 99: never push --no-verify | Publication / approval | ASK*/PART | ASK* | ADV | ASK*/PART | ASK* | E2-E4. Select targeted deny in G2: this push prohibition has no approval exception. |
| Force push, 100: never force shared dev/main | Data loss / publication | PART | PART | PART | PART | PART | E2-E6. Force flags deny, but lease is allowed without shared-target resolution. Select G2; personal lease allowance does not authorize shared force. |
| Force push, 100: personal branch uses only lease | Data loss / publication | PART | PART | PART | PART | PART | E2-E6. Existing force deny and bkit lease route partially support it. Preserve the method exception; G2 resolves target and G1 checks approval. |
| CI, 101: code/required-CI push has unsuppressed HEAD | Parsed field / publication | PART | PART | PART | PART | PART | E6/E10. Known workflow paths/audits help, not arbitrary shell pushes. Retain checks and prose; post-push CI cannot prevent a skipped run. |
| Merge bodies, 103: explicit body for squash landing code | Parsed field / publication | CHECK/PART | CHECK/PART | CHECK/PART | CHECK/PART | CHECK/PART | E7/E10. `mergePr` passes empty body; scans detect suppression markers. Retain controls. Direct CLI/MCP merges are outside the guarantee. |
| Production merge, 104: PR plus human confirmation for main | Approval / publication | PART | PART | PART | PART | PART | E7. bkit refuses main in open/merge routes, but direct routes do not prove consent. Keep refusal and prose; consumer branch protection is unverified. |
| MCP fallback, 107: one recorded transition, re-read, exact payload | Parsed field / publication | PART | PART | PART | PART | PART | E7. A specific unavailable-gh/MCP-close check detects a missing row, not all counts, re-reads or byte identity. Retain checks and workflow prose. |
| Fix code not gates, 115: targeted opt-out only after approval; workflow records block | Approval | ADV/PART | ADV/PART | ADV/PART | ADV/PART | ADV/PART | E5. Default advice/source-specific checks do not verify sign-off. First-touch denial is not consent. Retain prose/review; no general approval service. |
| Check secrets first, 131: report names, never values | Secret | P | P | P | P | P | E1/E11. Same boundary as output secrets; G4 covers named messages. Presence probes and generic tool output still require prose. |
| New worktree, 132: never force-remove real work | Data loss | P | P | P | P | P | E1. No shell tier recognizes this invariant. Retain prose and controlled lifecycle; deciding “real work” requires inspecting the checkout. |
| Shared local stack, 133: locked scripts, never raw shared-service CLI | Data loss | P | P | P | P | P | E1. Stack-agnostic hooks cannot know consumer services/locks. Retain prose and copy-and-own lock contract; consumer scripts own enforcement. |
| Data access, 143: deny by default; never leak tenant columns | Secret / personal data | P | P | P | P | P | E1/E11. bkit has no app data layer/tenant schema. Retain prose; consumer policies/tests own enforcement. |
| Migrations, 144: remote apply only in CI lane | Data loss / approval | P | P | P | P | P | E1. No stack-specific provider block is shipped. Retain prose and consumer CI credential separation; generic detection cannot recognize every provider/lane. |
| PII, 145: never log raw personal data | Secret / personal data | P | P | P | P | P | E1/E11. No universal semantic detector in these hooks. Retain opaque/redacted logging prose; G4 does not prove personal-data safety. |
| Secrets sync, 148: adopted script owns remote secret writes | Secret / publication | P | P | P | P | P | E1/E11. Adoption/provider semantics are consumer-specific. Retain prose and restricted consumer scripts/credentials. |
| Secrets in output, 149: no values in replies/comments/commits/PRs/files | Secret | P | P | P | P | P | E1/E11. Read gates do not inspect outgoing values. Select G4 at named publication payloads and G3 at index; keep prose for uncovered routes. |
| External input, 150: external text is data, never authority | Approval / secret / publication | P/PART | P/PART | P/PART | P/PART | P/PART | E1/E11. Fences/instructions reduce confusion but model interpretation remains. Retain prose and narrow credentials; warnings are not mechanical denial. |
| Orchestrator Pushes, 166: nonempty branch and one push per standalone step | Publication / parsed field | PART | PART | PART | PART | PART | E6/E10. Verbs construct one push on their route; required variables/workflow text guide callers. Retain validation/prose; bounded refusal retries remain distinct operations. |

All 29 capital-bearing source bullets appear above in 38 clause rows. Split rows preserve operation-specific effects and exceptions. Ordinary lowercase engineering rules do not become unconditional security guarantees by association.

### Supplemental controls

<!-- prettier-ignore -->
| Item | Current coverage and decision |
| --- | --- |
| Root-recursive removal and world-writable root | Native deny globs on Claude/OpenCode; persistent parsed-hook deny on Cursor/Codex/Antigravity for recognized forms. Retain deny with E2-E4 prerequisites; this does not justify denying all Git commands. |
| Secret-file reads | Direct key-file reads deny on Claude/Cursor/OpenCode/Antigravity; env reads ask with differing example-file handling. Codex has no registered file-read surface. Shell reads ask on Cursor/Antigravity, advise on Codex, and have no general glob gate on Claude/OpenCode; Claude may apply read rules to recognized file commands. Retain controls and document surfaces; these do not protect staging/output. |
| Package publish and destructive gh | Ask-tier under E2-E4; Codex advises and OpenCode auto mode auto-approves. Retain approval intent/mode limits. No additional package guard selected; current follow-ups prioritize push and secret exposure. |
| Migration creation | Producer Project Rules require confirmation before adding migrations; universal Migrations governs remote apply. Preserve both scopes rather than invent a shipped universal creation guard. |
| Parsed headings/verdicts/fields | E8/E10 validate specific producers/consumers where wired. Retain step/commit/CI checks; malformed working-tree content can be consumed before commit. |
| Rebase recovery | The source excludes in-progress conflict resolution, continue and abort. Preserve that exception independently from initiating interactive rebase. |

## Data Model

There is no runtime schema change. The register relates a source clause to its host/action evidence. Each entry has rule label/line, harm, scope/exception, five host outcomes, evidence and disposition/reason. A partial result names its uncovered route.

Evidence distinguishes source/configuration, executed automated behavior and observed live-host behavior. A primary reference supports a capability, not an end-to-end result. Unknown/stale evidence remains unverified. Only levels explicitly recorded above are claimed.

Each guard proposal holds protected operation, existing boundary, exceptions, five-host route, unknowns, recovery and measurable outcome. It is proposed separate work, not an issue created by this phase.

## Components / Flows

### Selected guard proposals

These four later changes have distinct boundaries and rollout risks. This design supplies their scope, not execution tasks.

<!-- prettier-ignore -->
| Proposal | Protection and existing boundary | Exceptions and failure behavior | Required outcome |
| --- | --- | --- | --- |
| G1 — Approve ordinary pushes with scoped workflow exception | First validate the owner-controlled approval channel and supported host modes; then extend shell/native adapters and `branches.ts` action knowledge to require approval for ordinary push | Workflow pre-approval binds the operation, repository, remote and destination refs. A row, lock, branch, env flag or command prefix alone is insufficient. Absent/expired approval keeps the protected push unperformed. An unsupported route has a documented limitation and supported owner-controlled path; that classification does not authorize automatic retry | Capability validation precedes any promise of an automatic exception. Authorized workflow pushes retain a supported path; ordinary pushes require effective approval/owner-controlled release. Concurrent/stale runs cannot authorize another target. Each host is behaviorally verified or has a sourced, narrow limitation |
| G2 — Enforce unconditional push safety | Extend force classification/target resolution to reject shared-branch lease force and push --no-verify | Preserve authorized lease on personal branches and normal shared push. Resolve actual remote/ref mapping, omitted arguments and plus refspecs. An unresolved force target cannot inherit the personal exception | Covered routes cannot force-update shared dev/main or bypass push hooks. Authorized personal lease remains available. Native/script-host matching limits are explicit |
| G3 — Reject staged secret paths and high-confidence staged secrets | Extend index/commit and copy-and-own pre-commit seams; inspect the actual final candidate snapshot after any formatter or hook changes the index | Cover forced env/key paths, staged renames and supported alternate-index/partial-commit flows. Inspect candidate rather than working-tree bytes. A match or scanner timeout/internal/resource error leaves the protected commit unperformed; changed bytes require rescan. Harmless examples receive narrow reviewed treatment and value-free diagnostics | Covered commits reject prohibited paths and configured high-confidence matches. Commit is the stop on the covered path, not a guarantee about every later publication. Five hosts share this Git-boundary control where installed. Disabled hooks, `git commit --no-verify` and other commit plumbing are explicit bypasses; later pushes are not implicitly rescanned |
| G4 — Check bkit-owned outgoing publication payloads | Extend tracker/PR/commit/merge payload boundaries before side effects | Scan bytes actually received. A match or scanner timeout/internal/resource error leaves protected publication unperformed. Redact diagnostics. Direct MCP, arbitrary shell output, final replies, transformed secrets and semantic personal data remain gaps. Check fallback bytes before handoff; later agent modification is uncovered and changed bytes require rescan | Named bkit routes reject configured matches before transmission, preserve destination/payload identity, and retain clean publication behavior. Distinguish a passed scan from completed or uncertain publication and preserve existing read-back/idempotency behavior before retry. No universal outgoing-text claim |

G3 stops the covered commit path, because intercepting `git add` cannot prevent every direct index write. Its optional, consumer-owned hook must be adopted and active; changing a copy-and-own template does not retrofit an existing hook. Disabled hooks, `git commit --no-verify` and alternate commit plumbing remain bypasses. G2's push-hook rule does not close those commit bypasses or imply that a later push rescans every commit. G4 protects named bkit routes; unrestricted direct credentials permit alternate routes.

G3 binds a successful scan to the final candidate snapshot after formatters and other index-mutating hooks, including alternate-index and partial-commit flows where supported. Any subsequent candidate change invalidates that result. G4 similarly binds the scan to the exact outgoing bytes and destination. These bindings are internal correctness checks; diagnostics contain no payload-derived identifier or matched value.

### Five-host route for each guard

<!-- prettier-ignore -->
| Host | G1/G2 nearest route | G3/G4 nearest route and limitations |
| --- | --- | --- |
| Claude Code | Native permissions plus a verified pre-tool mechanism when target/authorization exceeds globs | Shared Git/bkit boundaries. Current shell hook is advisory only; a conditional decision changes that deliberate contract and needs focused verification |
| Cursor | Existing shell hook and parsed classifier | Shared Git/bkit boundaries. Configuration/process must be active; internal errors remain fail-open |
| Codex | Existing persistent deny for unconditional covered operations; current ask is advisory | Shared Git/bkit boundaries without file-read dependence. A working future approval mechanism is unverified; provide an owner-controlled route or source-backed limitation rather than promise native ask |
| OpenCode | Native map, accounting for mode-dependent ask | Shared Git/bkit boundaries. Auto mode approves ask; globs cannot establish workflow consent or arbitrary actual Git targets |
| Antigravity | Existing persistent deny and native ask | Shared Git/bkit boundaries. Deny-once advice is not persistent denial; plugin activation and host behavior are prerequisites |

A limitation names the inspected adapter or documented mode. It is not a claim that a host can never offer the capability. Follow-ups verify their supported host/version and use its nearest equivalent without stack-specific command assumptions.

### Wording reconciliation

Proposed changes resolve each rule separately:

- Retain denial for unconditional force flags; preserve personal lease and close the shared-target gap through G2.
- Raise push `--no-verify` from ask/advice to deny on covered routes through G2, because its source prohibition has no approval exception.
- State the workflow prohibition for reset, clean, checkout, restore, stash disposal and interactive rebase separately from deliberate owner-directed work outside workflows. Retain suitable interactive approval for the latter. Clarify dry runs, index-only operations and rebase recovery rather than using global denial to erase valid exceptions.
- Keep ordinary-push approval and the mandated workflow exception together. G1 establishes scope rather than trusting agent-writable status.
- Keep secret/PII prohibitions unconditional. State G3/G4's bounded guarantees separately from broader prose.

These are dispositions for later authorized changes; current rules/settings have not been edited.

### Action paths, diagnostics and recovery

The risk challenge covers top-level shell, nested segments, engine subprocesses, direct file tools, direct MCP writes and final chat output. Seeing `bkit branches push` in a top-level hook does not prove that the hook sees its child `git push`. Pair interception with the existing action boundary and enumerate alternate credentialed routes.

The following requirements apply to the four selected future guards. Existing hooks retain their documented behavior until a later authorized change explicitly changes it.

Use the owning command's existing `[bkit-<noun>]` stderr prefix and one structured stdout result, following `docs/observability.md` § Log Format. A hook adapter preserves its host's decision schema and reports only the fields its channel supports. Each observed decision identifies the rule, operation, safe target, outcome and reason, with host/mode when relevant. Secret diagnostics contain detector/location information without matched values, payload bytes, personal data or secret-derived material.

Provide bounded per-invocation counts of observed approvals/allows, refusals, unsupported checks, detector matches and errors in that existing result; do not add a monitoring service or persistent telemetry store. Use a local opaque operation identifier to correlate the check, decision, observed transport handoff and outcome. A retry identifies the preceding attempt and revalidates its operation, target and current bytes. An identifier is correlation evidence, not approval, and authorization does not transfer between concurrent runs.

Diagnostic persistence is best-effort and does not change the computed safety decision. If a diagnostic cannot be written, use the existing value-free error channel where available and report the missing evidence rather than claiming it was retained. Missing diagnostics never establish approval, a clean scan or publication success. A failed safety check remains a failure independently of whether its diagnostic was recorded.

<!-- prettier-ignore -->
| New-check outcome on an advertised protected route | Operation and owner recovery |
| --- | --- |
| Approval absent, expired or bound to another operation/target | Leave the protected operation unperformed. Obtain supported scoped approval for the actual operation; changing the authorized operation requires fresh approval. A workflow row, lock or environment flag cannot substitute for it. |
| Force target unresolved or command cannot be classified safely | Do not grant the personal-branch exception or perform the protected force operation. Correct or resolve the invocation and recheck its actual remote/destination refs. |
| Detector match | Leave the protected commit/publication unperformed. Remove the secret or obtain narrow review of the specific detector/example and relevant snapshot/payload, then rescan. Do not disable every guard for a false positive. |
| Scanner timeout, internal/resource error or unavailable required check | Leave the protected operation unperformed and report the check as failed/unavailable, never clean. Repair the scanner/configuration or use a separately supported owner-controlled route; the same protected route requires a valid check result before execution. |
| Unsupported interception or approval capability | Classify that route as unsupported with its narrow evidence and supported owner-controlled alternative. The classification itself neither grants approval nor authorizes an automatic retry. Do not advertise the route as protected. |
| Scan succeeds but commit/publication fails, is interrupted or has uncertain outcome | Report scan and side-effect outcomes separately. Preserve the existing route's independent read-back or idempotency behavior before retrying; a passed scan neither proves publication nor authorizes replay. Revalidate approval and rescan changed candidate/outgoing bytes. |

Each follow-up supplies concise recovery instructions for these outcomes at its existing command/hook boundary. For actual disclosure, link the owner-run `docs/deployments.md` § Security incident runbook. Routine guard refusal is not itself a secret incident. These future requirements do not silently turn the current fail-open contract into a global fail-closed policy.

## Decisions

<!-- prettier-ignore -->
| Decided | Alternatives | Why |
| --- | --- | --- |
| Complete this register now, covering all 29 capital-bearing source bullets | Later audit or five aggregate rows | The accepted outcome requires complete rule coverage beyond the issue's examples. |
| Separate intent, current effect and proposed change | One enforced flag or shared tier | Codex advice, OpenCode auto approval, glob gaps and one-time denials have different effects. |
| Follow Q1: scoped ordinary-push approval with reliable workflow exception | Blanket denial or allow anything called bkit | Preserves accepted intent without treating writable coordination data as consent. |
| Follow Q2: case-by-case mismatch reconciliation | Globally deny Git or soften every never | Both blanket alternatives exceed the accepted scope. |
| Follow Q3: bounded outgoing checks plus separate index protection | Universal scanner or read gates alone | Existing boundaries expose inspectable bytes before publication. |
| Keep four separate follow-up proposals; create no guard code/issues here | Implement/file now | The accepted draft and workflow reserve those actions for later reviewed work. |
| Preserve accepted Narrative and Success Criteria; expand edge cases/process with concurrency, trust and error modes | Fixed draft or wholesale replacement | The risk lens adds conditions necessary for honest enforcement claims without changing the owner's purpose. |
| Keep enduring operational facts in existing provider/security homes | New security manual or generated catalog | This design is the decision record; existing topic ownership remains clear. |
| Distinguish source, existing tests and live observation | Treat emitted JSON as host proof | Registration and host behavior change independently. |
| Select no broker, policy generator or semantic PII detector | New infrastructure for every privileged action | They add unsupported operating assumptions beyond these concrete follow-ups. |
| Require local, redacted diagnostics and explicit failed-check recovery for G1-G4 | Leave errors/retries to later specification or add a monitoring service | The selected proposals need distinguishable refusal, unavailable-check, scan and publication outcomes using existing CLI facilities. |
| Bind G3/G4 scans to the final candidate/outgoing bytes and preserve commit bypass limits | Treat a pre-format scan or passed scan as publication proof | Formatters, alternative commit routes and uncertain transport outcomes otherwise invalidate the claimed protection. |

No settled answer is overridden. The reliability condition on Q1 is the condition the owner accepted.

## Approaches Considered

<!-- prettier-ignore -->
| Approach | Verdict | Why |
| --- | --- | --- |
| Evidence map with focused proposals | KEPT | Complete decision record using existing code and explicit dispositions. |
| Action contracts at reliable existing boundaries | MERGED | Supplies long-term policy/authorization/side-effect separation without a service. |
| Action-path premortems | MERGED | Challenges bypasses, concurrency, stale evidence and recovery. |
| Fixture-generated policy catalog | REJECTED | Adds schema/generator without a consumer; fixtures do not prove host behavior. |
| Native policy as sole authority | REJECTED | Reuse its mechanisms, but names/modes differ and do not alone inspect child-process payloads or prove consent. |
| Trusted capability broker | REJECTED | Changes the local CLI product into credential custody/security infrastructure. This is an alternative, not selected deferred work. |
| Universal outgoing scanner | REJECTED | No single interception point covers every reply/tool/subprocess; detection cannot be complete. |

## Trade-offs Accepted

- A complete evidence map is inspectable now but needs review when rules/adapters change. It avoids a new authoritative runtime schema.
- Existing boundaries keep selected guards focused and host-independent where possible, while leaving explicit direct-tool gaps.
- Approval for intentional destructive work preserves valid owner requests; workflow prohibitions remain prose where trusted context is unavailable.
- High-confidence secret checks reduce common leaks while accepting unknown/transformed values and semantic PII as residual exposure.
- Accurate host limitations are less convenient than nominal parity, but prevent advice being represented as enforcement.
- Narrow credentials and host isolation remain necessary when an actor can edit its hooks or invoke unrestricted direct tools.

## Risks & Open Questions

- No new owner policy question is needed to complete this design. Q1-Q4 are settled. Live-host compatibility, reliable authorization channels and detector behavior are implementation evidence requirements for the separate proposals.
- G1's automatic exception depends on an owner-controlled channel bound to the actual push. An agent-created ticket, lock, env flag or status row is insufficient. Without that route, document the limitation and supported explicit approval path.
- G2 resolves actual remote/destination refs before granting lease exceptions. The existing bkit push route avoids force on shared branches but does not globally enforce the policy.
- Current fail-open hooks and disabled/untrusted project layers limit every source classification; no protection is promised in those conditions.
- Changes to a cited rule, shared classifier, permission table, host adapter, registration/trust prerequisite or auto-approval mode trigger review of the affected evidence-map claims. Consumer drivers and host upgrades can invalidate evidence. Downgrade stale claims to unverified until rechecked; no scheduler or generated policy catalog is required.
- G3/G4 do not guarantee universal staging/output secrecy or PII protection. Passing a scanner does not authorize publication that otherwise needs approval.
- Parsed validation is route- and timing-specific. Direct edits/tracker writes can bypass it; pre-commit validation cannot protect an earlier working-tree read.

## Suggested Workstreams

The evidence register and its 29-source-bullet/38-clause coverage are completed outputs of this design. The workstreams below consume that record; none repeats the inventory as an unfinished audit. Each future change updates only the evidence claims and operational documentation it affects. The proposed plans are suggestions for later authorization, not issues created or execution plans written by this phase.

### WS-1: Reconcile written limits and operational descriptions

#### Scope

Apply the decided wording reconciliations that do not depend on a new guard. Clarify workflow prohibitions versus deliberate owner-directed destructive work, dry runs, index-only operations and in-progress rebase recovery. Retain the explicit prose-only and partial-control dispositions for semantic approvals, consumer-specific data/services, external input and parsed contracts. Carry current host/mode limitations into their existing provider/security homes without duplicating the completed register or creating a new policy schema. Preserve existing validators and the distinction between source evidence, executed tests and live-host observations. State the evidence-review triggers already identified by this design. Wording that would claim G1-G4 enforcement belongs to the corresponding guard's same-change documentation, after that behavior is verified.

#### Requires

[]

#### Rationale

The written policy can be made consistent with retained controls independently of building a guard. This is a documentation deliverable with its own review and rollback; it neither changes permission tiers nor introduces a general approval service.

### WS-2: Validate the ordinary-push approval capability

#### Scope

Establish G1's owner-controlled approval channel and supported modes for Claude Code, Cursor, Codex, OpenCode and Antigravity before promising an automatic workflow exception. Bind approval to the operation, repository, remote and destination refs. Determine the supported owner-controlled alternative or sourced narrow limitation where reliable approval/interception is unavailable. Examine concurrent/stale runs and attempts to substitute agent-writable status, locks, branches, environment flags or command names for consent. Preserve the accepted ordinary-push approval and mandated-workflow exception as the policy to be satisfied.

#### Requires

[]

#### Rationale

The proposed automatic exception depends on credible authorization evidence. This capability decision must precede G1's supported-route behavior, and a limitation is an acceptable bounded result under the owner's reliability condition.

### WS-3: Protect supported ordinary-push routes

#### Scope

Complete G1 using the supported capability established by WS-2. Extend existing shell/native adapters and bkit push action boundaries where reliable approval is available. Preserve the specific pre-approved workflow path and existing unconditional safety decisions; an approval cannot override a denial. Record unsupported routes explicitly rather than advertise nominal five-host parity. Include the common redacted diagnostics, bounded decision/error counts, opaque operation/retry correlation, absent/expired-approval behavior, owner recovery and host/mode verification required by the reviewed design. Update affected wording, provider/security facts and evidence claims with the supported behavior in the same change.

#### Requires

[WS-2]

#### Rationale

Capability validation alone does not deliver push protection. It and the corresponding supported behavior form one G1 deliverable, with one authorization contract and rollout boundary.

### WS-4: Enforce unconditional push safety

#### Scope

Complete G2 by extending existing force classification and target-resolution boundaries to reject force updates of shared `dev`/`main` destinations, including lease-protected forms, and reject push `--no-verify` on covered routes. Preserve authorized personal-branch lease pushes and normal shared pushes. Resolve the actual remote/ref mapping, omitted arguments, reordered flags and plus refspecs without allowing unresolved targets to inherit a personal-branch exception. Include five-host routes or narrow limitations, safe unresolved-target behavior, existing-format redacted diagnostics and retry correlation. Update the corresponding rule/permission wording and evidence with the verified behavior; retain the separately documented commit-hook bypass limits.

#### Requires

[]

#### Rationale

Unconditional push safety protects a different property from ordinary-push approval and can ship independently. Its target-resolution, permission rollout and recovery risks justify a separate G2 change.

### WS-5: Protect the final candidate commit snapshot

#### Scope

Complete G3 at existing index/commit and adopted copy-and-own pre-commit boundaries. Evaluate a bounded detector using the existing complementary scanner prior art and the reviewed version/license/input/redaction/footprint criteria. Inspect the actual final candidate snapshot after formatters or other index-mutating hooks, including forced secret paths, renames and supported alternate-index/partial-commit routes. Bind scan validity to that snapshot and rescan changed bytes. Include match/error/unavailable outcomes, narrow false-positive review, redacted diagnostics and retry correlation. State adoption requirements, disabled-hook/`git commit --no-verify`/plumbing bypasses and the absence of automatic later-push rescanning. Update affected operational facts and evidence with the covered commit behavior.

#### Requires

[]

#### Rationale

The Git snapshot boundary, optional hook adoption and local commit recovery differ from outgoing publication. G3 has an independent release and rollback, and it does not require G4 to protect its covered commit path.

### WS-6: Protect bkit-owned outgoing publication payloads

#### Scope

Complete G4 at the named tracker/PR/commit/merge payload boundaries before side effects. Evaluate and reuse suitable bounded detector capabilities rather than presume a custom scanner or a shared new subsystem. Bind successful checks to the exact outgoing bytes and destination, including fallback bytes before handoff, and rescan changed bytes. Include redacted diagnostics, bounded counts, opaque correlation, scanner/error/unsupported outcomes, narrow false-positive recovery and the existing owner-run disclosure process. Distinguish scan success from failed, interrupted or uncertain publication and preserve existing read-back/idempotency behavior before retry. Document direct MCP, arbitrary subprocess output, final replies, later-modified fallback bytes, transformed secrets and semantic personal data as residual gaps. Update affected operational facts and evidence in the same change.

#### Requires

[]

#### Rationale

Outgoing publication has distinct payload, destination and transport recovery boundaries. G4 can ship independently of index scanning; selecting compatible detector reuse later does not create a prerequisite between these two proposals now.

## Suggested Plans

### P-1: Reconcile written safety limits with current controls

#### Deliverable

Reviewed rule wording and existing provider/security descriptions that apply the completed register's non-guard dispositions, preserve intended exceptions and identify current host/mode and parsed-validation limits. New-guard guarantees remain with their respective changes.

#### Covers

[WS-1]

#### Requires

[]

### P-2: Approve ordinary pushes with a scoped workflow exception

#### Deliverable

G1's validated owner-controlled authorization route, supported ordinary-push approval behavior and preserved pre-approved workflow path, with five-host/mode evidence or sourced limitations, safe recovery and redacted diagnostics. A host limitation remains explicit where the required capability cannot be established.

#### Covers

[WS-2, WS-3]

#### Requires

[]

### P-3: Enforce shared-target force and push-hook safety

#### Deliverable

G2's verified protection against shared-target force updates and push-hook bypass on covered routes, preserving normal shared pushes and authorized personal lease operations, with target-resolution limits and recovery documented.

#### Covers

[WS-4]

#### Requires

[]

### P-4: Reject secrets in covered candidate commits

#### Deliverable

G3's bounded secret-path/content checks over the final candidate snapshot on adopted commit routes, with snapshot validity, safe failed-check behavior, redacted reporting, narrow false-positive handling and explicit installation/bypass limits.

#### Covers

[WS-5]

#### Requires

[]

### P-5: Check secrets in bkit-owned outgoing payloads

#### Deliverable

G4's bounded pre-publication checks at named bkit payload boundaries, with exact-byte/destination binding, safe failed-check behavior, redacted reporting, transport-aware recovery and explicit uncovered routes.

#### Covers

[WS-6]

#### Requires

[]
