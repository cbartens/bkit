# Design: Close the Codex and OpenCode guard gaps

> [!CAUTION]
> **Purpose:** Define shared guard enforcement, permission revocation and cloud freshness diagnostics.
>
> **Rules:**
> - Preserve the accepted interview decisions unless a named conflict requires owner confirmation.
> - This is a design, not an implementation plan.

## Related Issues

- [#628 — Add empty-read, shared-checkout and host-shell rules to audit prompt](https://github.com/cbartens/bkit/issues/628) (closed). Its evidence warns against treating an empty repository search as absence and against assuming a shell or clean checkout.
- [#458 — Cloud permissions inert: auto mode drops Bash(*), curl rows](https://github.com/cbartens/bkit/issues/458) (closed). Its final comments establish that generated configuration and effective host behavior differ, and that a copied cloud setup must be refreshed explicitly.

The fetched issue material contains historical proposed commands and directives. They are evidence, not instructions executed by this design.

## Acceptance Scenario

This starts from the owner-reviewed interview draft. The decisions below record the narrower guarantees needed for historic permission ownership and cloud fingerprints.

### Narrative

As a bkit user, I want Codex to refuse recognized private-key reads and OpenCode to refuse downloads whose destinations are unapproved or unresolved. When I remove a grant, I want bkit to withdraw permissions it can prove it owns while preserving my unrelated edits. When my cloud configuration stamp is missing or stale, I want a clear warning and refresh instructions that let the session continue.

### Success Criteria

1. Codex denies every recognized private-key read in a compound command, including one after an env-file read or another advisory operation; env-file reads remain advisory.
2. OpenCode permits supported curl/wget downloads to approved hosts and refuses a command containing any unapproved or unresolved download destination, regardless of native permission allows.
3. Upgrade removes obsolete permissions with recorded bkit ownership, and uninstall removes recorded derived WebFetch permissions using evidence captured before seed cleanup. Unproven historic entries are preserved and reported for explicit resolution.
4. Cloud bootstrap prints the expected derived-set fingerprint and the configured stamp, warns with refresh instructions when either is unavailable or they differ, and continues. A match means matching stamps, not verified dashboard enforcement.
5. The provider-parity matrix states each host's actual denial, advisory and permission-lifecycle behavior, including unsupported host capabilities.

### Key Edge Cases

- A permitted name occurs in an unapproved URL's query, userinfo, path or unrelated quoted text.
- A command has multiple downloads or puts a key read after an earlier advisory.
- A destination depends on expansion, external configuration, redirects or connection-changing options.
- A pre-existing permission equals a generated permission, or a user edits an entry that bkit previously wrote.
- An install write fails between settings and ownership updates, or another process edits a settings file during reconciliation.
- A copied bootstrap or cloud configuration stamp remains old after package upgrade.

### Process Sketch

WHEN Codex reads `id_rsa`, including after `.env` → THEN the key read is denied.
WHEN Codex reads only `.env` → THEN the existing advisory remains.
WHEN OpenCode makes a supported download to an approved host → THEN the target guard passes.
WHEN OpenCode downloads from `evil.example/?agents.md` or has an unresolved target → THEN execution is refused.
WHEN a seed grant is removed and upgrade runs → THEN its provably owned permission disappears and any ownership conflict is reported.
WHEN uninstall runs → THEN recorded derived WebFetch permissions disappear before ownership evidence is discarded.
WHEN cloud stamps differ or are unavailable → THEN bootstrap warns, gives refresh instructions and continues.

## Reuse & Prior Art

<!-- prettier-ignore -->
| Capability | Prior art | Verdict | Why |
| --- | --- | --- | --- |
| Secret-file and command classification | `.bkit/core/hooks/guardrails-tiers.js`: `secretFileKind`, `shellSecretRead`, `classifyShell` | EXTEND | These already distinguish keys and env files. Extend findings and precedence so a later denial cannot be masked. |
| Download invocation inspection and hostname policy | `.bkit/core/hooks/guardrails-shell.js`: command tokenization, `extractUrlHosts`, `hostMatchesBase`, allowlist loading; Node's built-in URL API | EXTEND | Existing code owns shell and hostname interpretation. Add bounded invocation parsing there and use the runtime URL parser for authority normalization. |
| Codex enforcement | `.bkit/core/.codex/hooks/bkit-guardrails.cjs`: `decideShell` and real deny mapping | EXTEND | Map shared key findings to denial without introducing another key detector. |
| OpenCode security adapter | No guardrails plugin in `.bkit/core/.opencode/plugin/`; GateGuard provides v1/v2 registration and throw-to-refuse examples | NEW | Extending GateGuard would mix edit investigation with persistent security enforcement and contradict settled Q1. Reuse its host adapter conventions, not its retry deduplication. |
| Shared hook delivery | `.bkit/core/engine/render/parts.ts`, install manifest and existing markered hook lifecycle | EXTEND | Render the existing shared parts into the new adapter and register its managed footprint through the same lifecycle. |
| Permission ownership and reconciliation | `.bkit/core/engine/install/version-file.ts`, `enrichClaudeSettingsAllows`, `reconcileOpencodeJson`, uninstall stripping | EXTEND | Extend installed state and existing reconciliation. No separate ownership database or configuration overlay is needed. |
| Expected fingerprint delivery | `egressFingerprint()` in `install/cloud-env.ts`; `renderNetworkAllowlist` in `install/network-allowlist.ts` | EXTEND | Keep the existing fingerprint meaning and add it to the existing non-secret `.bkit/allowlist.json` artifact for bootstrap to read without importing CLI internals. |
| Cloud comparison and refresh guidance | Generated cloud environment sections and `.bkit/templates/.claude/hooks/bkit-cloud-bootstrap.sh` | EXTEND | Add a non-secret configured stamp and compare it at bootstrap; preserve copy-and-own deployment. |

Repository sweep used the supplied code ranges, targeted searches under the shared hooks, host adapters, install modules, manifest and version state, and `docs/capabilities.md`. The capability register has no matching guard ownership entry; a known-heading control confirmed the search worked, and the text search found the existing candidates above. The language-server query could not read this ignored worktree, so it supplied no absence evidence.

There are no runtime dependencies supplying a shell policy parser in this package. Node supplies [URL parsing and hostname fields](https://nodejs.org/api/url.html), but it does not interpret curl/wget arguments. OpenCode supplies [pre-execution tool hooks](https://opencode.ai/v2/docs/build/plugins/) and [ordered permission patterns](https://opencode.ai/docs/permissions/); the hook is the place to enforce the parsed decision. The [curl manual](https://curl.se/docs/manpage.html) documents config-file input and redirect following, which require more than scanning literal URLs. GNU [Wget's manual](https://www.gnu.org/software/wget/manual/wget.pdf) supplies startup-configuration controls. Extend the existing dependency-free parser rather than add an execution service.

## Architecture

### Shared findings and policy

Keep guard tiers in `guardrails-tiers.js` and shell interpretation in `guardrails-shell.js`. Evaluate all relevant command segments before selecting each host's result. A shared result carries the existing tier details plus the secret kind and download inspection findings; names are design-level additions, not claims that these fields already exist.

The classifier exposes enough information for host-specific precedence. An unconditional deny remains strongest. Codex key denial and OpenCode download denial are considered before a weaker advisory anywhere in the command. Other hosts retain their current mappings, and the shared fixtures make those intentional differences explicit.

A recognized unsupported download is a normal `unresolved` result. It is not an exception that a top-level fail-open catch may silently turn into permission.

### OpenCode guardrails adapter

Add `.bkit/core/.opencode/plugin/bkit-guardrails.js`, the sole new architecture component. It uses rendered shared parts and the existing v1/v2 plugin envelopes. It inspects shell calls before execution, evaluates the shared findings, and throws a sanitized refusal for explicit deny decisions. Repeating the same unsafe call remains refused.

The plugin also delivers shared shell-as-edit-channel advisories and existing destructive/secret tier translations where OpenCode has a matching capability. It does not invent an approval dialog: native ask-tier permission rules retain that responsibility. The provider matrix states any remaining advisory-delivery limits.

Native curl/wget substring allows cease to authorize a destination. Generated convenience allows may continue only when the real-host probe proves that plugin refusal runs before execution even when those rows match. Approved supported commands must still satisfy native host permissions; a plugin returning normally is not a permission grant. If that ordering is false, the design's runtime boundary is unproven and the OpenCode part cannot be called complete.

### Permission ownership in existing install state

Extend `.bkit/version` with exact OpenCode derived-entry records and a bounded pending permission mutation. Extend the current Claude record's bookkeeping so future state contains only entries bkit actually inserted or previously owned and retained. A matching pre-existing permission is satisfied but unowned.

Ownership covers generated bash, WebFetch and MCP permission entries already derived by the installer. It contains exact configuration paths and values, not secrets. Reconciliation preserves the relative order of user entries because OpenCode evaluates the last matching pattern.

Install, upgrade, check and uninstall use the same pure computation for desired changes. Real writes and ownership changes are separated from that computation so dry runs report identical drift without mutating state.

### Cloud freshness signal

Keep `egressFingerprint()` as the fingerprint of shipped derived bases and hosts. Add its value as `derivedFingerprint` to `.bkit/allowlist.json`; the existing `domains` array remains unchanged for hook readers.

The generated cloud dashboard instructions include the proposed non-secret environment variable `BKIT_CLOUD_ALLOWLIST_FINGERPRINT` alongside the network paste. The owner copies both from the same generation. Bootstrap reads the expected fingerprint from the installed allowlist artifact and compares it with that environment stamp.

A match says that the supplied stamp matches the repository's installed derived baseline. It does not read the platform dashboard or detect edits only to consumer domains. Missing JSON tooling, missing artifact, malformed stamp and mismatch all produce a nonblocking diagnostic with an explicit reason.

## Data Model

<!-- prettier-ignore -->
| Existing store | Proposed addition or rule | Meaning |
| --- | --- | --- |
| `.bkit/version.claudeAllowDerived` | Retain only actual inserted or carried owned grants for future writes | A needed entry that already existed without ownership is not acquired by matching text. Historic records remain evidence with the ambiguity noted below. |
| `.bkit/version.opencodeAllowDerived` | Ordered list of `{ path: string[], value: string }` | Exact keys and values bkit inserted into the supported permission maps. Missing field means unknown ownership and no destructive pruning. |
| `.bkit/version.pendingPermissionMutation` | Optional operation, affected file, before/after content hashes, changed owned entries and resulting ownership | A recovery intent for one permission-file mutation. It is not committed ownership. No file contents or secret-bearing command arguments are stored. |
| `.bkit/allowlist.json.derivedFingerprint` | Eight lowercase hexadecimal characters from the existing generator | Expected shipped-derived-set stamp. |
| Cloud environment | `BKIT_CLOUD_ALLOWLIST_FINGERPRINT` | Owner-supplied stamp for the network configuration they applied. |

The existing version pin and canonical hashes remain deferred until successful install completion. Permission recovery intent may be checkpointed while retaining the previous pin and hashes; successful settings writes then resolve that intent to ownership. This is a deliberate extension of the current deferred-state contract, confined to avoiding lost permission provenance.

Unknown fields and absent new fields preserve current parsing compatibility. Validate every record shape before using it to delete a permission. A malformed record produces a preservation diagnostic, never broader removal.

## Components / Flows

### 1. Codex private-key reads

Collect recognized secret reads across command segments, preserve the `key` versus `env` classification, and choose key denial before weaker ask/advisory results. Continue excluding non-reading commands, copy destinations, redirect sinks and search patterns according to the existing shared classifier.

The denied reason names the category and safe path only. It does not echo the complete command or contents. Existing generic hook-crash behavior remains separate from an explicit policy denial; this change does not claim to confine arbitrary interpreters, aliases or scripts.

### 2. OpenCode download targets

Recognize each direct curl/wget invocation through the shared command segmentation and supported wrapper handling. Associate every URL with the invocation that uses it. An unrelated literal URL cannot validate a dynamic destination elsewhere.

Use a bounded grammar:
- Accept explicit HTTP(S) positional URLs and supported URL options, with quote-aware tokenization, option arity, multiple URLs and compound commands.
- Require curl's default configuration to be disabled by its first option, and wget's startup configuration to be disabled. Require wget redirect following to be disabled; refuse curl redirect-following options.
- Reject external config/input URL files, unresolved expansion or substitution in a destination, unknown options whose argument meaning cannot be proved, URL globbing, recursive retrieval, proxy or connection overrides, and unsupported schemes.
- Normalize authority through the built-in URL parser and apply the existing apex/subdomain label-boundary rule. Reject malformed authorities; ignore paths, queries and userinfo as authorization evidence.
- Refuse when any inspected destination is unapproved, the allowlist is missing/corrupt, or inspection is unresolved.

This strict profile means a plain command may need explicit safety flags before it passes, even when its visible host is allowed. The refusal gives a supported rewrite using the same explicit URL and flags, without executing it. There is no automatic shell rewriting. Curl reads default config unless disabled, so allowing an apparently simple literal URL without these controls would violate settled Q3.

Static inspection protects recognized shell downloads. It is not a network sandbox: DNS behavior, arbitrary code and a changed executable remain outside the host-hook guarantee. Existing external network controls continue to provide their own boundary.

### 3. Reconcile and revoke derived grants

Take an immutable snapshot of the existing permission file, recorded ownership and current derived set before merging. Reconcile owned entries after additive template merging so that stale entries cannot be reintroduced.

<!-- prettier-ignore -->
| Entry state | Result |
| --- | --- |
| Needed, absent | Insert and record ownership. |
| Needed, already identical and unowned | Preserve without acquiring ownership. |
| Previously owned, unchanged and still needed | Retain ownership. |
| Previously owned, unchanged and no longer needed | Remove and drop ownership after successful write. |
| Previously owned but edited by user | Preserve, report conflict and release automatic ownership. |
| Unknown historic entry | Preserve and report unresolved provenance when relevant. |
| Unrelated user entry | Preserve value and relative order. |

Before a permission-file mutation, persist its bounded recovery intent in version state without advancing the installed version. Replace the permission file atomically. On the next run, the before hash means the mutation has not landed, the after hash means it landed and ownership can be finalized, and any third hash means a conflict that preserves the file and requires resolution. Clear intent only after ownership is durable. A failed write remains a failure; it is never reported as completed revocation.

Concurrent installers and user writes are not assumed safe. Re-read the input hash before replacement and stop on a changed file; the remaining check-to-write race is a declared operational risk below. Do not silently overwrite a newly observed edit.

### 4. Uninstall

Capture recorded grants, permission files and required seed-derived facts before seed or install-state removal. Strip recorded owned grants by exact current equality, preserve user modifications, and finish permission cleanup before deleting the ownership state.

Use the same recovery mechanism while uninstall can still retry. A partial permission failure retains the required ownership/recovery evidence and reports the affected path. Recomputing from an already emptied seed cannot substitute for the captured record.

Legacy ownership is not reconstructed from a recognizable string shape. A whole-file canonical hash proves entry ownership only when its historical definition demonstrably excludes user content; current hashes alone must not be treated as that proof.

### 5. Cloud bootstrap and rollout

Print expected and configured stamps with a status of matching, mismatched or unavailable. For mismatched or unavailable evidence, explain that the diagnostic covers the shipped derived baseline and tell the owner to run `bkit upgrade`, regenerate the relevant cloud instructions, re-copy the network list and stamp together, and rebuild the cloud snapshot.

The bootstrap is copy-and-own. Updating its template does not update an adopted copy; the rollout instructions explicitly ask the owner to merge the fingerprint section into that copy and refresh the setup. A local session remains a no-op under the template's existing cloud-only guard.

Delivery updates the affected provider documentation, template catalog, hook manifest and existing host-parity coverage. Source templates are changed first and installed mirrors are regenerated through the existing upgrade path. Runtime validation must include actual OpenCode refusal before execution and Codex denial, not only adapter return objects.

## Decisions

<!-- prettier-ignore -->
| Decided | Alternatives | Why |
| --- | --- | --- |
| Follow settled Q1: dedicated OpenCode guardrails plugin. | Add security enforcement to GateGuard. | Security refusals persist on retry and have a different responsibility from edit advisories. |
| Follow Q2 and Q5: warn, give refresh instructions and continue for stale or missing stamps. | Block bootstrap; print only the expected value. | These are the owner's accepted choices. |
| Follow Q3 with a bounded download grammar and explicit config/redirect controls. | Scan every URL string; attempt arbitrary shell interpretation. | A literal allowed host does not prove every actual curl/wget target. Uncertainty is an ordinary refusal. |
| Follow Q4: preserve unrelated permissions and edited values. | Replace maps or prune by pattern. | Pattern shape cannot prove who authored an entry. |
| Extend shared findings before host mapping. | Change only Codex's secret branch. | First-match behavior can hide a key or download behind an earlier advisory. |
| Use recorded ownership in existing version state. | Separate ownership file; reconstruct from the current seed. | Existing state already carries Claude provenance; removed seeds cannot reconstruct the former derived value. |
| Add bounded recovery intent without advancing the installed version. | Persist only after all settings writes; claim pending grants as owned. | A crash must not permanently erase evidence needed for the next prune. Intent and committed ownership have different meanings. |
| Explicitly replace the shell-download part of `551-opencode-unanchored-host-allows-accepted-risk`. | Keep substring matching as authorization. | The new requirement selects actual-target refusal. Native WebFetch policy is not silently redefined by this shell change. |
| Narrow `guardrails-shell-advisory-scope-and-detection` for Codex keys and OpenCode downloads only. | Make every host strict. | The request names these hard outcomes; other host behavior stays explicit in the parity matrix. |
| Keep internal crash handling separate from classified unresolved downloads. | Turn all hook exceptions into denial or allow unresolved input through a catch. | This preserves the earlier fail-open availability contract while honoring the accepted uncertainty policy. |
| Change the draft's revocation criterion to provable ownership plus explicit historic conflict reporting. | Claim complete legacy cleanup without evidence. | Historic generated and user-authored identical entries cannot always be distinguished. This is an outstanding requirement boundary, not a claim of full legacy revocation. |
| Clarify the draft's cloud criterion to derived-set stamps. | Claim that a matching stamp proves the live cloud allowlist. | The current fingerprint excludes consumer-only changes and has no dashboard readback. |
| Expand the draft's key edge cases to mixed commands, interrupted writes and copied bootstrap rollout. | Keep the shorter draft unchanged. | The three lenses show these cases shape enforcement and lifecycle correctness. |
| Refine the draft's supported-download success path to require explicit config/redirect controls. | Permit hidden configuration and redirects after checking the initial URL. | Curl and wget can obtain destinations beyond the visible initial URL; a pre-execution host check cannot safely infer them. |

## Approaches Considered

<!-- prettier-ignore -->
| Approach | Verdict | Why |
| --- | --- | --- |
| Shared policy, thin adapters and exact permission ownership in existing state | KEPT | Covers the requested outcomes using existing boundaries. The risk-premortem mitigations are part of this approach. |
| Separate generated configuration overlays | REJECTED | Host composition support and precedence are not established across the supported hosts; moving configuration adds compatibility work without removing the runtime plugin requirement. |
| Standalone permission ownership artifact | MERGED | Keep its explicit ownership and recovery semantics, but store them in existing version state rather than add another installed database. |
| Reconstruct ownership from seed and templates | REJECTED | It cannot recover a removed seed's former grant or prove authorship of an identical user entry. |
| Constrained execution broker | REJECTED | A privileged service and host confinement would change the no-service architecture. This design remains within the requested hook and installer surfaces. |

## Trade-offs Accepted

- Shared policy and per-host mappings reduce drift while preserving intentional host differences. They require testing rendered adapters as well as the shared classifier.
- Conservative target inspection produces clear refusals for useful but unresolved forms, including redirects. It gives a bounded, explainable guarantee at the cost of rewriting some legitimate downloads into supported commands.
- Exact ownership preserves user configuration at the cost of reporting historic ambiguity instead of silently deleting matching entries.
- Recovery intent adds a small amount of state and lifecycle work. It preserves evidence across interrupted writes without pretending all install modules form one atomic transaction.
- Derived-set stamps are cheap, non-secret and available before dependency installation. They detect a stale supplied baseline but cannot attest to platform configuration or consumer-only domain edits.

## Risks & Open Questions

- **Historic permission ownership requires an owner policy.** Some OpenCode entries have no record, and the current Claude enrichment returns the whole needed set rather than only entries it inserted. Exact historic authorship may therefore be unrecoverable. Options: A) Preserve unproven entries, report exact locations for owner review, and automate future revocation with provenance — protects user permissions but leaves historic cleanup requiring a decision. · B) Authorize an idempotent migration that removes exact former generated shapes — improves legacy cleanup but can delete identical user entries and requires explicit migration approval. Recommended: A) because it follows settled Q4 and does not manufacture ownership evidence. Default if unanswered: A); existing installs with unresolved entries must not be reported as fully cleaned.
- **OpenCode hook ordering is unproven for the supported runtime versions.** A real-host probe must show a thrown refusal prevents a sentinel side effect even when a native allow matches, and must show an approved supported command can execute. Options: A) Verify both adapter versions supported by the project before relying on convenience allows — preserves the current host coverage but may expose runtime incompatibility. · B) Restrict the changed behavior to the one proven runtime version and document the other as unsupported — lowers initial validation work but narrows provider support. Recommended: A) because provider parity is required. Default if unanswered: A); inability to prove ordering blocks the affected host outcome.
- **Top-level hook exceptions remain fail-open under the existing policy.** Explicit parser uncertainty and unavailable allowlists produce ordinary refusal, but an unexpected internal hook crash can still bypass enforcement. Options: A) Preserve that existing availability trade-off with visible sanitized error reporting — limits this change to accepted policies. · B) Make recognized OpenCode shell calls fail closed on internal errors — stronger enforcement but can block legitimate work during hook defects. Recommended: A) because the interview did not approve changing the general crash contract. Default if unanswered: A), with the guarantee stated as enforcement when the hook operates.
- **Permission-state concurrency has a residual race.** Input-hash checks detect observed edits but cannot make concurrent processes or editors atomic across settings and version state. Options: A) Serialize install, upgrade and uninstall permission mutations with a repository-local exclusive lock and retain recovery intent — closes the installer race with a small lock lifecycle. · B) Declare concurrent installer mutation unsupported and rely on conflict checks — less machinery but a check-to-write race remains. Recommended: A) for the implementation design, using an existing lock primitive if its contract fits and adding no broad installer refactor. Default if unanswered: A); lock placement, stale-holder recovery and uninstall cleanup must be resolved before implementation.
- **Cloud stamps are an operator assertion.** A stamp can be copied without the matching network list. The status text states that limitation, and missing or mismatched evidence never blocks bootstrap. No dashboard-readback guarantee is made.
- **Copied or modified host drivers can remain stale.** The managed-part lifecycle cannot silently rewrite consumer-owned code around it. Installation must report required wiring changes and validate the rendered supported drivers; deployment instructions must cover old bootstrap copies.
- **Diagnostics can expose secrets.** Messages use reason categories, safe basenames or normalized hostnames. They omit complete shell commands, URL userinfo, query strings, request headers and file contents.
