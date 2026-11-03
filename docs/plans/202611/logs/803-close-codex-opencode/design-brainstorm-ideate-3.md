# Design Brainstorm & Ideas

Lens: Risk premortem — failure modes, scale, time, handover.

## Approach A — Prevent silent bypasses and lost ownership ⭐ Recommended

Extend the shared classifier and parser, add the owner-approved thin OpenCode guardrails plugin, and retain explicit ownership of generated grants so security checks and permission removal remain correct after configuration changes.

### Premortems

<!-- prettier-ignore -->
| Situation | What breaks | Observability | Recovery |
| --- | --- | --- | --- |
| 10x scale | A long compound command hides a later key read or unapproved target behind an earlier advisory; repeated parsing of many hosts increases tool-call latency. | Shared cases cover mixed operations and the adapter reports the strongest applicable decision, with a reason category and sanitized target. Exercise long commands locally without remote telemetry. | Inspect every relevant operation before selecting a verdict; reuse parsed command information and one allowlist load per decision. An uncertain download is refused, as the owner selected. |
| 6 months later | A dropped seed grant survives because reconciliation forgot prior ownership; a plugin driver or copied bootstrap stays old while shared code updates. | Upgrade reports preserved conflicts and obsolete owned grants. Host-parity cases inspect the rendered output, not only the shared source. Bootstrap distinguishes current, stale and unavailable fingerprint evidence. | Reconcile previous owned grants against the next generated set, preserve unrelated entries, and retain ownership records until affected writes succeed. Give exact refresh instructions for copy-owned bootstrap files. |
| On-call at 3am | A legitimate download is refused with a generic host message, or a partial uninstall deletes provenance before stripping permissions. | Refusals distinguish unapproved target, unresolved target and unavailable allowlist; install failures identify the file and operation without printing commands or secret contents. | Rewrite an ambiguous download as an explicit supported target; repair the allowlist through the existing install path. Re-running uninstall must retain enough prior ownership to finish removal. Cloud fingerprint warnings continue the session. |
| Author leaves | The classifier's first-match ordering, OpenCode permission ordering and fingerprint meaning become undocumented assumptions. | A compact decision table links each host's deny, advisory and allow outcomes to the same fixtures. A grant lifecycle table covers add, remove, user edit, failed write and uninstall. | A maintainer changes one shared policy source and can reproduce each outcome with the corresponding rendered-host fixture. Keep the existing derived fingerprint semantics explicit. |

### Risk-mitigation guidance

- A change only to Codex's `case "secret"` is insufficient. `shellSecretRead` returns the first secret path, and `classifyShell` returns an ask-tier result before secret detection. Thus `.env` followed by a key, or a privileged operation followed by a key read, can mask the key. Aggregate the relevant findings or explicitly prioritize key reads before host advisory outcomes. Apply the same reasoning to OpenCode download denial, which must not disappear behind an unrelated ask-tier finding.
- Reuse `guardrails-shell.js` and `guardrails-tiers.js`; do not introduce a second OpenCode URL parser. Their current URL extraction scans explicit HTTP(S) strings throughout the command, which is weaker than proving every actual curl/wget destination. Validate actual invocation arguments and refuse unsupported dynamic targets, input-list/config-file targets and routing options whose destinations cannot be established safely. A quoted URL in unrelated text must not supply evidence for a different unresolved download.
- Treat redirects and transport-changing options as part of the uncertainty boundary. Static inspection cannot prove a redirected destination from the initial URL alone. The design must specify which forms are refused or constrained, rather than claiming complete target validation from the initial hostname.
- Extend existing `.bkit/version` provenance rather than creating an unrelated ownership database. It already records `claudeAllowDerived`. OpenCode needs equivalent ownership with enough information to preserve a user-modified value and precedence. Persisted provenance must describe successfully written grants, not a desired set that failed to reach disk.
- Capture prior settings and ownership before uninstall empties the seed or removes install metadata. Recomputing from the current seed cannot recover a previously removed grant. Preserve unknown user entries; do not infer authorship solely from a `curl` or `WebFetch` pattern.
- The new OpenCode plugin is the mandatory security boundary. Prove a rejection prevents execution in the real supported host, including when a native permission glob would otherwise allow it. A mocked callback proves only JavaScript behavior.
- Keep cloud warnings nonblocking. Print comparable fingerprints and clear refresh instructions, but never claim that a copied fingerprint proves the dashboard's actual network rules. The configured fingerprint is an operator assertion, unless the platform exposes independent configuration evidence.

## Approach B — Limit durable state and reconstruct ownership at each operation

Use the same dedicated plugin and shared hard-denial logic, but reconstruct managed grants from the pre-operation seed and installed templates instead of adding an OpenCode grant ownership record.

### Premortems

<!-- prettier-ignore -->
| Situation | What breaks | Observability | Recovery |
| --- | --- | --- | --- |
| 10x scale | Reconstructing candidates for every installed host and prior template increases work and the number of grant patterns potentially mistaken for user entries. | A dry-run distinguishes certain removals from unresolved ownership and reports their counts. | Remove only entries with demonstrable ownership; preserve ambiguous entries and explain the remaining gap. This means the full revocation outcome cannot always be met. |
| 6 months later | The user has already removed the seed grant, so the previous derived value is no longer reconstructible. Template changes make historical matching brittle. | Upgrade surfaces unverified stale candidates instead of claiming all grants were reconciled. | Recover an intact prior install record if available. Without it, obtain explicit ownership decisions rather than deleting by shape. |
| On-call at 3am | Uninstall succeeds structurally while stale permissions survive, or broad cleanup removes a user's permission. | Report exact affected configuration locations and distinguish removed, preserved and unresolved entries. | Restore a configuration backup after over-removal; resolve the uncertain entry explicitly before calling revocation complete. |
| Author leaves | Historical template reconstruction becomes a growing compatibility catalog whose rules are not obvious from current source. | Tests need old-install fixtures and collision cases for each supported historical shape. | Document the reconstruction boundary and move future installs to explicit ownership if reconstruction ceases to be reliable. |

### Risk-mitigation guidance

- Take a complete pre-mutation snapshot before seed cleanup and use it consistently for every uninstall surface.
- Share the exact rendering logic used by install instead of reproducing grant string formats in uninstall.
- Preserve unknown entries and report ambiguity. Never broaden deletion to all matching patterns to satisfy the success criterion.
- Layer Approach A's parser, severity, host-execution and fingerprint mitigations onto this approach as well; they are independent of ownership storage.
- This approach is useful only where pre-operation evidence proves the old grants. It does not meet the owner's general remove-from-seed-then-upgrade outcome when the old value has already disappeared. It is therefore not recommended as the final ownership model.

## Approach C — None

## Decisions

<!-- prettier-ignore -->
| Decided | Alternatives | Why |
| --- | --- | --- |
| Recommend Approach A with explicit grant provenance. | Reconstruct solely from current or pre-operation seed and templates. | A removed seed value cannot identify the stale grant it once generated; the repo already uses provenance for Claude grants. |
| Keep a dedicated OpenCode guardrails plugin and shared policy parts. | Extend GateGuard or duplicate policy in the adapter. | The owner selected the dedicated plugin; shared policy reduces drift while the plugin owns host translation. |
| Refuse unapproved or unresolved download targets. | Ask or permit on parse uncertainty. | Owner decision Q3; an allowlisted string is not proof of the actual target. |
| Preserve unrelated user permissions and surface ownership conflicts. | Replace the whole permission section or delete by pattern. | Owner decision Q4; generated and user-authored settings coexist. |
| Warn and continue on stale or absent cloud fingerprint evidence. | Fail bootstrap or silently report only an expected fingerprint. | Owner decisions Q2 and Q5. The diagnostic is advisory and must be actionable. |
| Scope hard-denial changes to the requested host outcomes while testing shared-parser effects across hosts. | Convert every host advisory to a denial. | Existing active decisions describe advisory shell checks and fail-open hook errors. Departures need explicit design treatment; this issue is not blanket policy replacement. |
| Supersede the shell-download portion of `551-opencode-unanchored-host-allows-accepted-risk` through target validation. | Keep substring matching as the security boundary. | The owner now requires actual curl/wget target checks. The native WebFetch portion is a separate surface; the final design must state its scope explicitly rather than imply this shell fix closes it. |
| Preserve the ownership and deferred-version-write invariants in `modules-dispatch-render-and-reconcile-mechanics`. | Prune grants by recognizable string shape or move version writes ahead of successful settings writes. | The existing decision rejects deletion of user-authored permissions and keeps retry state meaningful after failed install writes. |

## Cross-Approach Risks

- **Legacy ownership is unknowable from shape alone.** Existing OpenCode installs may lack a recorded grant set. The final design must distinguish safe future reconciliation from historical cleanup, identify what existing hashes or snapshots can prove, and expose any owner decision needed. Do not add an unapproved migration or silently abandon the existing-install outcome.
- **Host refusal and error handling are separate contracts.** Existing `guardrails-empty-catches-fail-open` and `guardrails-shell-advisory-scope-and-detection` decisions matter. A new strict OpenCode target check must not be converted to allow by a generic catch. Define malformed input and missing allowlist handling explicitly, and verify actual host blocking rather than infer it from a returned verdict.
- **Fingerprint meaning can overpromise.** `egressFingerprint()` hashes sorted shipped domains and hosts, excluding consumer `allowed-domains`. It therefore detects shipped-registry drift, not every consumer allowlist edit. The draft's broad “cloud allowlist is stale” wording needs this limit stated or a separately designed effective-configuration fingerprint. Neither fingerprint alone attests to live dashboard settings.
- **Copied bootstrap deployment matters.** `.bkit/templates/` files are copy-owned; changing the template alone does not update a previously adopted bootstrap. The rollout must include a concrete refresh path and cannot claim existing sessions gain diagnostics automatically.
- **Mixed commands require strongest-applicable decisions.** The current first-secret and first-tier behavior creates masking risks that a simple adapter patch misses. Include a key after an env read, a download after an advisory operation, and several curl/wget invocations in the same acceptance coverage.
- **Permission precedence is part of preservation.** Keeping unrelated OpenCode map entries but moving their order can alter last-match-wins behavior. Preserve relative user-entry order and check both entry values and effective decisions.
- **Diagnostics can leak data.** Full shell commands may contain credentials or private contents; reason messages should name the category and safe path or hostname only, with URL userinfo and queries excluded.
- **Concurrency and interrupted writes affect ownership.** A new install record written before its settings file can make retries forget a stale grant; simultaneous upgrade/uninstall can compute from different snapshots. Use the existing install lifecycle's concurrency guarantees where they exist, and define detectable retry behavior where cross-file atomicity is absent.

Evidence read: the supplied design input; `.agents/docs.md`; relevant architecture, technology, security, authoring, workflow and prompt catalog sections; current folded decision summaries; `guardrails-tiers.js` secret detection and classifier; `guardrails-shell.js` target matching; the Codex adapter; OpenCode grant injection and reconciliation; uninstall's Claude enrichment; `.bkit/version` provenance; and `egressFingerprint()`.
