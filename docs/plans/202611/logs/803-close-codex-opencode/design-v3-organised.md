<!-- bkit:anchor
baseSha: 38102970a8a3a542798cc320c9691dced676efa2
baseRef: origin/dev
bkitVersion: 6.0.0
bkitLatest: 6.0.0
-->
Verdict: PASS
<!-- verdict:end -->


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

The compatibility contract distinguishes a candidate adapter from a verified runtime. No runtime has passed the new enforcement experiment in this design run. The following matrix defines the validation boundary; release support requires an exact version and observed tool ID in every retained row.

<!-- prettier-ignore -->
| Runtime / configuration | Registration and shell vocabulary | Ownership and validation boundary |
| --- | --- | --- |
| OpenCode 2.1.2, the repository's cloud pin | `.opencode/plugin/bkit-guardrails.js`, config-relative `./plugin/bkit-guardrails.js`; V2 `setup(ctx)` registers `execute.before`; expected tool `shell` | Candidate, not executed by this spike. Verify plugin discovery, actual tool ID, native allow interaction and persistent refusal before claiming support. |
| OpenCode 2.1.4, the available local binary | Same V2 envelope and discovery target | Version discovery only. The spike did not run a loaded plugin or tool session. Both V1-compatible configuration and native V2 configuration need separate fixtures. |
| OpenCode V1 compatibility | Existing `server()` envelope returns `tool.execute.before`; expected tool `bash` | No exact V1 binary or version was supplied, so no V1 version is certified. Select and record a concrete V1 version, actual tool ID and discovery path before retaining a V1 support claim. |
| V1 `permission` maps used by a supported V1 or normalized by V2 | Exact entries in `permission.bash`, `permission.webfetch` and existing derived MCP permission maps | Corrected ownership records cover these maps only. Preserve user order and prove that each edited map is effective. |
| Native V2 `permissions` or mixed native/V1 configuration | Native V2 values can supersede normalized V1 values | Preserve native entries and report unsupported ownership reconciliation. Do not generate a dormant V1 allow or report effective revocation by deleting one. Converting native permissions is outside this design; this shape remains an explicit completion boundary. |
| Codex CLI 0.165.0, the available local binary | `.codex/hooks.json` matcher `Bash`, trusted `.codex/` layer, stdin/stdout guardrails adapter | Version discovery only. A fresh trusted session must deny a synthetic key read, including after an env advisory, and allow a non-key control. |

The real-host evidence for each supported row records version, selected model/provider, trust, loaded plugin/hook path, actual tool ID and permission shape. It includes an executing positive control and two identical refused side-effect attempts despite a matching native allow. A direct shell API, a manually invoked callback or a mocked return object does not satisfy this gate.

The plugin also delivers shared shell-as-edit-channel advisories and existing destructive/secret tier translations where OpenCode has a matching capability. It does not invent an approval dialog: native ask-tier permission rules retain that responsibility. The provider matrix states any remaining advisory-delivery limits.

Native curl/wget substring allows cease to authorize a destination. Generated convenience allows may continue only when the real-host probe proves that plugin refusal runs before execution even when those rows match. Approved supported commands must still satisfy native host permissions; a plugin returning normally is not a permission grant. If that ordering is false, the design's runtime boundary is unproven and the OpenCode part cannot be called complete.

### Permission ownership in existing install state

Extend `.bkit/version` with exact OpenCode derived-entry records and a bounded pending permission mutation. Add `permissionOwnershipVersion: 1` as a discriminator written only by the corrected ownership algorithm. Extend the current Claude record's bookkeeping so future state contains only entries bkit actually inserted or previously owned and retained. A matching pre-existing permission is satisfied but unowned. An old `claudeAllowDerived` array without the discriminator is ambiguous historical evidence, because the old algorithm recorded the complete needed set; it cannot authorize deletion by itself.

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
| `.bkit/version.permissionOwnershipVersion` | Integer `1`, validated with the associated records | Identifies records produced by the corrected insertion-only algorithm. Absent or unknown versions cannot authorize pruning. |
| `.bkit/version.claudeAllowDerived` | Retain only actual inserted or carried owned grants for future writes | A needed entry that already existed without ownership is not acquired by matching text. Unversioned historic records remain ambiguous evidence. |
| `.bkit/version.opencodeAllowDerived` | Ordered list of `{ path: string[], value: string }` | Exact keys and values bkit inserted into the supported permission maps. Missing field means unknown ownership and no destructive pruning. |
| `.bkit/version.legacyPermissionEvidence` | Exact ambiguous historical records, with source and unresolved status | Keeps old Claude arrays and identified historic OpenCode conflicts separate from corrected ownership. Setting the new discriminator never promotes these records to owned entries. |
| `.bkit/version.pendingPermissionMutation` | Optional non-secret mutation ID, operation, affected file, before/after content hashes, changed owned entries and resulting ownership | A recovery intent for one permission-file mutation. It is not committed ownership. No file contents or secret-bearing command arguments are stored. |
| `.bkit/allowlist.json.derivedFingerprint` | Eight lowercase hexadecimal characters from the existing generator | Expected shipped-derived-set stamp. |
| Cloud environment | `BKIT_CLOUD_ALLOWLIST_FINGERPRINT` | Owner-supplied stamp for the network configuration they applied. |

The existing version pin and canonical hashes remain deferred until successful install completion. Permission recovery intent may be checkpointed while retaining the previous pin and hashes; successful settings writes then resolve that intent to ownership. This is a deliberate extension of the current deferred-state contract, confined to avoiding lost permission provenance.

The version parser and serializer explicitly validate and round-trip the new fields; unknown ownership schema versions are retained as opaque evidence and cannot authorize pruning. Absence of the new fields means legacy ownership, not an empty proven-owned set. A malformed record produces a preservation diagnostic, never broader removal.

Every state-writing path participates: initial install initializes corrected ownership from its original permission snapshot; core's deferred post-dispatch finalizer merges the current ownership and pending intent rather than reconstructing only the old fields; upgrade's no-op comparison includes ownership and recovery changes; targeted uninstall keeps records needed by retained hosts; full uninstall deletes state only after permission cleanup is complete. Read-only check and dry-run paths validate and report without checkpointing. A provider-only removal recomputes retained-host needs before removing an owned entry.

Write both intent and final ownership state by same-directory temporary-file replacement and atomic rename. Re-read validated state under the installer lock before each merge so a stale in-memory finalizer cannot erase newer intent. Preserve the previous version pin and canonical hashes until their normal successful finalization. The supported durability contract is recovery after process interruption on a local filesystem with atomic same-directory rename; it does not claim power-loss durability or arbitrary network-filesystem semantics. The spike tested primitive process exits only, so production integration and every finalizer still require interruption verification.

## Components / Flows

### 1. Codex private-key reads

Collect recognized secret reads across command segments, preserve the `key` versus `env` classification, and choose key denial before weaker ask/advisory results. Continue excluding non-reading commands, copy destinations, redirect sinks and search patterns according to the existing shared classifier.

The denied reason names the category and safe path only. It does not echo the complete command or contents. Existing generic hook-crash behavior remains separate from an explicit policy denial; this change does not claim to confine arbitrary interpreters, aliases or scripts.

### 2. OpenCode download targets

Recognize each direct curl/wget invocation through the shared command segmentation and supported wrapper handling. Associate every URL with the invocation that uses it. An unrelated literal URL cannot validate a dynamic destination elsewhere.

Extend the existing shared lexer before option interpretation. Preserve each token's raw span, decoded literal value, quote kind and expansion/substitution flags. Split `;`, `&&`, `||`, pipes and newlines only outside quotes and escapes; a quoted separator remains part of one token. Unclosed quotes, unsupported escapes, here-documents, functions, loops, process substitution and other unsupported shell constructs produce `unresolved` before token information is discarded.

The strict download profile accepts direct `curl` / GNU `wget` invocations and one literal `command` wrapper. It can inspect literal `sh -c`, `bash -c` or `zsh -c` bodies to a maximum of two nested shell levels, with the same lexical rules at each level. Expansion-derived executable names, wrapper option ambiguity, deeper nesting and unsupported wrappers around a recognized download are unresolved. This limit applies to the new enforcement result; other hosts retain their explicitly documented advisory mappings. Ordinary words naming curl/wget in a non-download command are not invocations.

Use a bounded grammar:
- Accept curl with first argument `-q`, required `--globoff`, optional exact flags `--silent`, `--show-error`, `--fail`, separated `--output PATH` / `-o PATH`, repeated separated `--url URL`, and HTTP(S) positional URLs. Accept GNU Wget with required `--no-config` and `--max-redirect=0`, optional `--quiet` and separated `--output-document PATH` / `-O PATH`, and HTTP(S) positional URLs. A literal `--` ends option parsing. Treat a following option-looking token as a URL only when it meets the URL grammar. Short-option clusters, abbreviations and every option outside this explicit profile are unresolved. Inspect all URL arguments, with quote-aware tokenization, option arity, multiple URLs and compound commands.
- Require curl's default configuration to be disabled by its first option, and wget's startup configuration to be disabled. Require wget redirect following to be disabled; refuse curl redirect-following options.
- Reject external config/input URL files, unresolved expansion or substitution in a destination, unknown options whose argument meaning cannot be proved, URL globbing, recursive retrieval, proxy or connection overrides, and unsupported schemes.
- Gate the raw authority before the built-in URL parser: require an explicit HTTP(S) scheme, an ASCII DNS hostname made of nonempty label-boundary-safe letters/digits/hyphens or canonical dotted-decimal IPv4, and an optional decimal port in `1..65535`. Reject userinfo, percent escapes in authority, backslashes, controls/whitespace, non-ASCII authorities, trailing-dot ambiguity, alternative numeric IP forms and bracketed IP literals until separately proven. Paths and queries may contain quoted separators, but provide no authorization evidence. Compare the parser's normalized hostname and port against this raw interpretation, then apply the existing apex/subdomain label-boundary rule. Any disagreement is unresolved.
- Refuse when any inspected destination is unapproved, the allowlist is missing/corrupt, or inspection is unresolved.

This strict profile means a plain command may need explicit safety flags before it passes, even when its visible host is allowed. The refusal gives a supported rewrite using the same explicit URL and flags, without executing it. There is no automatic shell rewriting. Curl reads default config unless disabled, so allowing an apparently simple literal URL without these controls would violate settled Q3.

Required client capabilities are curl's first-option `-q` default-config suppression, explicit HTTP(S) URLs and disabled redirect following; GNU Wget must support `--no-config`, explicit redirect suppression and the accepted option arities. Any later option that re-enables config input or redirects is unresolved. BusyBox wget and clients missing a required capability are unsupported. Curl 8.7.1 is the only client measured by this spike, and only for four local cases; no GNU Wget version or full parser/client compatibility floor is certified. The accepted corpus must be compared with both real clients before a version is listed as supported. The host's environment-configured proxy may transport an approved URL; command-level proxy/connection overrides remain unresolved. This is URL-destination validation, not a claim to bypass the cloud's required proxy.

Static inspection protects recognized shell downloads. It is not a network sandbox: DNS behavior, arbitrary code and a changed executable remain outside the host-hook guarantee. Existing external network controls continue to provide their own boundary.

### 3. Reconcile and revoke derived grants

Acquire the repository-local installer lock before reading permission files or ownership state. Take an immutable snapshot of the existing permission file, recorded ownership and current derived set before merging. Resolve any pending intent before starting another mutation. Reconcile owned entries after additive template merging so that stale entries cannot be reintroduced.

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

Serialize cooperating install, upgrade and uninstall mutations through `.bkit/.permission-mutation.lock`, outside `.bkit/version` so full uninstall can retain it until state cleanup finishes. Acquire it with exclusive file creation and record a random owner token, host identity, PID, process-start identity where available, command and start time. Contention fails immediately with a single `busy` diagnostic and a retry instruction; there is no unbounded wait or idle-time reclamation.

Retain this lock through original snapshots, template merge, every permission replacement, atomic ownership finalization and uninstall state cleanup. Before each replacement revalidate the settings hash and version-state hash under the lock. A normal finally block removes the lock only after matching its owner token. After a crash, automatic reclamation is permitted only when the same-host holder is provably dead and a final re-read still shows the same token; a live, foreign-host, malformed or unverifiable holder is preserved and reported for operator verification. A failed release is a reported failure. Reuse the exclusive-create pattern rather than the workflow lock's idle policy.

Unrelated editors need not honor the lock. Re-read the input hash immediately before replacement and stop on an observed change; a residual editor check-to-write race remains. The spike settled local exclusive-create and process-exit primitives only. Installer-wide integration, stale-holder recovery, all state writers and non-cooperating edits still require verification.

### Permission conflict recovery

Recovery results are `not-landed`, `landed`, `conflict-preserved`, `metadata-invalid`, `write-failed` or `complete`. The first two are automatic only when validated before/after hashes and schema match. A third hash or malformed intent retains the current settings, intent and previous ownership, emits an incomplete result and prevents a new permission mutation.

The operator runbook belongs in the existing install/operator documentation:

1. Keep the current settings and version-state evidence. Inspect the reported safe path, operation and mutation ID, and obtain an owner-only backup of those files before repair. Do not delete all version state or replace settings from a stale intended snapshot.
2. Compare the current values, desired derived entries and previous proven-owned entries. For each ambiguous entry, explicitly choose to preserve it as user-owned, retain a previously proven ownership claim, or authorize the exact removal. A text match alone cannot transfer an entry into bkit ownership.
3. Feed those decisions to a validated recovery mode of the existing upgrade/uninstall command. This is a proposed command capability, not an existing flag: its exact CLI shape is set in planning. The input is bounded to the reported mutation ID, current settings/state hashes, exact entry paths and explicit decisions; it contains no secret values. Headless execution requires this explicit decision input and never guesses an answer.
4. Under the same lock, revalidate schema, mutation ID and both hashes. Finalize a proven landed mutation, or abandon its stale intent while retaining still-valid previous ownership and recording unresolved legacy entries. Derive a fresh mutation from current settings rather than replaying the stale whole file. A changed hash or unvalidated record preserves evidence and stays incomplete.
5. Retry the original upgrade or uninstall after validated recovery. Upgrade reports future owned-grant reconciliation separately from unresolved historic cleanup. Uninstall remains partial until all applicable permission cleanup and recovery state are resolved; only then may it delete ownership state. A filesystem write failure is retried after its cause is fixed and cannot be converted into a successful cleanup status.

Malformed metadata never authorizes pruning. If no intact state can establish a record, the validated recovery path requires explicit owner decisions and preserves the invalid evidence in an owner-only backup before writing a repaired state. Its completion report names any preserved unproven entries and never claims that they were revoked.

### 4. Uninstall

Capture recorded grants, permission files and required seed-derived facts before seed or install-state removal. Strip recorded owned grants by exact current equality, preserve user modifications, and finish permission cleanup before deleting the ownership state.

Use the same recovery mechanism while uninstall can still retry. A partial permission failure retains the required ownership/recovery evidence and reports the affected path. Recomputing from an already emptied seed cannot substitute for the captured record.

Legacy ownership is not reconstructed from a recognizable string shape. A whole-file canonical hash proves entry ownership only when its historical definition demonstrably excludes user content; current hashes alone must not be treated as that proof.

### 5. Cloud bootstrap and rollout

Print expected and configured stamps with a status of matching, mismatched or unavailable. Emit one cloud status event per bootstrap, with reason `match`, `mismatch`, `missing-stamp`, `missing-artifact`, `malformed-artifact`, `malformed-stamp` or `missing-parser`; use one deterministic primary reason when multiple inputs are unavailable. The status always identifies its scope as the supplied derived-baseline stamp. For mismatched or unavailable evidence, explain that the diagnostic covers the shipped derived baseline and tell the owner to run `bkit upgrade`, regenerate the relevant cloud instructions, re-copy the network list and stamp together, and rebuild the cloud snapshot.

The bootstrap is copy-and-own. Updating its template does not update an adopted copy; the rollout instructions explicitly ask the owner to merge the fingerprint section into that copy and refresh the setup. A local session remains a no-op under the template's existing cloud-only guard.

Delivery updates the affected provider documentation, template catalog, hook manifest and existing host-parity coverage. Source templates are changed first and installed mirrors are regenerated through the existing upgrade path. Runtime validation must include actual OpenCode refusal before execution and Codex denial, not only adapter return objects.

Extend the existing install/check advisory surface to identify a missing OpenCode guardrails file, absent config-relative registration, stale known driver wiring and an adopted bootstrap missing the fingerprint section's version marker. These are static wiring findings and do not certify that a host loaded the plugin. A modified unknown driver is preserved and receives exact wiring instructions. After refresh, the owner runs `bkit check` and confirms those findings are cleared; cloud rollout additionally requires a rebuilt session's single stamp event, and host rollout requires the recorded real-host refusal and positive control. An old copied bootstrap stays a reported rollout gap until refreshed.

## Observability and completion evidence

Use existing CLI stdout/stderr and owning subsystem prefixes, retaining the brackets required by `docs/observability.md`. Guardrails emit `[bkit-guardrails]`; installer operations reuse `[bkit-install]`, `[bkit-upgrade]`, `[bkit-uninstall]` or `[bkit-check]`; bootstrap reuses its cloud subsystem prefix. No telemetry collector, persistent event database, paging or distributed tracing is added.

<!-- prettier-ignore -->
| Surface | Countable local event and result |
| --- | --- |
| Hook policy/refusal | One event per affected invocation with `event=guard-decision`, `host`, `operation`, `status` of denied, unresolved or advisory, stable `reason`, and an optional safe basename/hostname. Repeated denied calls produce repeated events. Existing opaque host/tool-call IDs may be included when available. |
| Hook internal failure | One sanitized `event=guard-error status=degraded reason=internal-error` per failed invocation, preserving the selected fail-open policy. State that enforcement was unavailable for that call and instruct the operator to refresh/validate the owning hook with `bkit upgrade` and `bkit check`, then repeat the synthetic host check. Never dump the command or raw exception text. |
| Permission mutation/recovery | Emit phase/result events at failure and recovery boundaries with host, operation, safe relative file path, non-secret mutation ID, stable reason and a result of complete, incomplete, failed or busy. Preserve the same mutation ID across interruption and retry. |
| Permission command summary | Print totals for inserted, retained, revoked, conflicted, unresolved, recovered-before, recovered-after and failed-write records, plus the final outcome. Distinguish automatic future reconciliation from unresolved historic cleanup. A requested cleanup with unresolved/conflicted entries is incomplete and exits nonzero; a failed write is failed and exits nonzero. |
| Cloud bootstrap | One event with status, primary reason, expected/configured safe stamps and `scope=derived-baseline-stamp`. Mismatch/unavailable events warn and continue, without repeating a warning on each command. |

Stable reason codes distinguish unapproved host, unresolved syntax, missing/corrupt allowlist, unsupported host configuration, unknown ownership, user-edited entry, malformed metadata, before/after recovery, third-hash conflict, write failure and lock contention. These events can be counted in local logs; no secret-bearing payload is a metric. Observability failure does not change a policy decision or erase recovery evidence.

Refusals, suggested rewrites and all exception paths apply the same redaction boundary: omit complete commands, URL userinfo and queries, headers, contents and secret values. A suggested rewrite shows the supported flag structure and safe hostname with placeholders for omitted URL portions. A policy-error path never echoes an untrusted exception that may contain a credential.

The spike's `S1` and `S2` remain `BLOCKED`. It discovered OpenCode 2.1.4 and Codex 0.165.0 but did not run their model tool paths, loaded-plugin controls or key-denial session. It observed four curl 8.7.1 cases only; GNU Wget and a completed lexer/profile were unavailable. `S3` is `SETTLED` only for exclusive-create and process-interruption primitives on the local filesystem. Production state writers, lock reclamation, editor races and power-loss behavior were not established. Completion evidence must retain those distinctions.

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
| Version corrected ownership and retain ambiguous legacy evidence separately. | Treat old Claude arrays or recognizable OpenCode text as authorship. | The old algorithm and unrecorded grants cannot prove insertion; every state writer must preserve the discriminator, intent and final records. |
| Serialize cooperating permission mutations with the installer-specific lock and validated recovery. | Reuse workflow idle reclamation or rely only on hash checks. | Permission state spans multiple files and uninstall cleanup; token ownership and process-aware recovery bound the cooperating-writer race. |
| Limit the strict parser to the explicit lexical, option and authority profile. | Trust lossy tokenization or successful Node URL parsing. | Shell quoting and download-client URL grammars can change the actual destination. Untested forms remain unresolved. |
| Separate candidate host versions from certified behavior. | Infer enforcement from a version check or V2-capable export. | The spike did not exercise real host tool execution; native V2 permission precedence also limits ownership reconciliation. |
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
- **OpenCode and Codex enforcement remain unproven (`S1`).** The spike found OpenCode 2.1.4 and Codex 0.165.0, but no configured default model, fresh trusted fixture, loaded-plugin test, executing positive control or repeated refusal. The cloud's OpenCode 2.1.2 pin is another candidate, and no exact V1 version is selected. Options: A) Select a concrete V1 version and verify every retained candidate row through real model tool sessions before relying on convenience allows — preserves intended host coverage but needs the missing session setup and binary. · B) Seek owner approval to restrict the changed behavior to versions actually proven and mark the rest unsupported — lowers validation scope but narrows provider support. Recommended: A) because provider parity is required. Default if unanswered: A); no row is certified by version discovery, and inability to prove enforcement blocks the affected host outcome.
- **The full download-client contract remains unproven (`S2`).** The spike measured four curl 8.7.1 cases, but GNU Wget and the completed lexical/option/authority profile were unavailable. Options: A) Complete the explicit profile and compare its accepted corpus with real curl and GNU Wget using local listeners before certifying their versions — preserves both requested clients and exposes grammar differences. · B) Seek owner approval to support only the proven client/profile and refuse the other — reduces validation work but narrows the requested behavior. Recommended: A) because both curl and wget are in scope. Default if unanswered: A); missing client evidence blocks the corresponding supported-download claim rather than allowing a simulated substitute.
- **Top-level hook exceptions remain fail-open under the existing policy.** Explicit parser uncertainty and unavailable allowlists produce ordinary refusal, but an unexpected internal hook crash can still bypass enforcement. Options: A) Preserve that existing availability trade-off with visible sanitized error reporting — limits this change to accepted policies. · B) Make recognized OpenCode shell calls fail closed on internal errors — stronger enforcement but can block legitimate work during hook defects. Recommended: A) because the interview did not approve changing the general crash contract. Default if unanswered: A), with the guarantee stated as enforcement when the hook operates.
- **Production recovery verification remains open after the primitive result (`S3`).** The local spike settled exclusive-create contention and before/after/third-hash classification after process exit. It did not exercise all installer state writers, stale-holder reclamation, permission finalization or partial uninstall. Options: A) Verify those integrated transitions and every interruption boundary under the stated local-filesystem contract — supports the proposed lock/journal without claiming power-loss guarantees. · B) Hold permission-lifecycle delivery until a supported environment can run that verification — delays delivery while preserving the same guarantee. Recommended: A) because the existing primitive evidence supports continuing with bounded integration validation. Default if unanswered: A); no primitive result substitutes for production recovery checks. Non-cooperating editors retain the disclosed check-to-write race.
- **Cloud stamps are an operator assertion.** A stamp can be copied without the matching network list. The status text states that limitation, and missing or mismatched evidence never blocks bootstrap. No dashboard-readback guarantee is made.
- **Copied or modified host drivers can remain stale.** The managed-part lifecycle cannot silently rewrite consumer-owned code around it. Installation must report required wiring changes and validate the rendered supported drivers; deployment instructions must cover old bootstrap copies.
- **Diagnostics can expose secrets.** Messages use reason categories, safe basenames or normalized hostnames. They omit complete shell commands, URL userinfo, query strings, request headers and file contents.

## Suggested Workstreams

The boundaries follow the runtime policy, permission lifecycle and cloud setup domains. Validation, diagnostics, documentation and rollout belong to the workstream that changes the behavior. Completion of one plan does not close the other outcomes in this design.

### WS-1: Shared command findings and Codex key denial

#### Scope

Extend the existing shared classifier and lexer to retain all relevant command findings, secret kinds, token spans, quote information and expansion flags. Define precedence so a later private-key read or download denial cannot be hidden by an earlier advisory. Map recognized Codex key reads to denial while retaining env-file advisories and each other host's documented mapping.

Cover mixed commands, supported wrappers and nesting, safe path reporting, non-reading controls and the boundary around arbitrary interpreters and changed executables. Preserve the selected internal-crash policy with sanitized, countable guard diagnostics. Carry the related shared-policy and Codex decisions, including the open crash-policy choice, into the provider matrix and regression coverage.

Verify the changed Codex behavior in a fresh trusted session with an executing control and repeated refused attempts. The available Codex version was discovered only; the real-host part of `S1` remains unproven until that evidence exists. Shared fixtures and rendered-adapter coverage preserve the intentional differences on the other hosts.

#### Requires

[]

#### Rationale

Shared command interpretation and result precedence form one policy boundary. Codex's mapping consumes that boundary directly, so a mapping-only change would leave mixed-command masking unresolved.

### WS-2: OpenCode download enforcement and host delivery

#### Scope

Build the dedicated OpenCode guardrails adapter from the shared findings. Complete the explicit curl/GNU Wget option, lexical and raw-authority profile, including config suppression, redirect controls, all destinations, hostname normalization and ordinary unresolved results. Compare the accepted corpus with real client versions and retain useful sanitized refusal/rewrite guidance. Preserve the distinction between URL-target checks and network confinement.

Cover plugin rendering, manifest ownership, config-relative registration, managed-part upgrades, uninstall footprint, stale driver findings and explicit wiring guidance for modified drivers. Implement the candidate-versus-verified OpenCode version/configuration matrix and its native allow interaction. Preserve native V2 entries and report unsupported ownership reconciliation rather than claim that dormant V1 maps control effective permissions. New grant-provenance mechanics remain in WS-3 and WS-4.

Keep persistent refusal independent of GateGuard retry suppression, retain native ask-tier responsibilities and include shell-edit advisories where supported. This scope includes runtime policy/error diagnostics, redaction, provider documentation and parity evidence for the shared parser, thin adapters and selected native permission formats.

Resolve the `S1` OpenCode and `S2` client-profile verification boundaries through the specified real tool sessions and local-listener experiments. No version check, direct shell API or mocked callback certifies enforcement. Convenience allows cannot serve as authorization before actual refusal-before-execution ordering is proved. Narrowing supported hosts or clients still requires the owner policy described in the open questions.

#### Requires

[WS-1]

#### Rationale

Parsing and the thin plugin must be delivered together to enforce actual download targets. Host registration, native permission interaction and real-host proof are part of that runtime outcome, rather than a separate documentation or test deliverable.

### WS-3: Durable permission ownership and mutation recovery

#### Scope

Extend the existing version-state parser and serializer with the ownership discriminator, exact OpenCode records, corrected Claude records, separate legacy evidence and bounded pending mutation intent. Preserve unknown schema evidence and validate malformed records without authorizing removal. Keep the current version pin and canonical hashes deferred while checkpointing permission recovery evidence.

Thread the new fields through every state-writing path, including initial install, the deferred finalizer, upgrade no-op detection, targeted uninstall and full uninstall. Define atomic state replacement, locked rereads and the installer-specific lock's full lifecycle: exclusive acquisition, owner identity, immediate contention, provably dead local-holder reclamation and token-checked release.

Provide before/after/third-hash recovery, safe operator decisions and the validated recovery input capability within existing upgrade/uninstall commands. Planning sets its precise command shape. Preserve current settings, previous ownership and invalid evidence during conflicts; headless recovery requires explicit decisions. Cover non-cooperating editor races, failure diagnostics, mutation correlation, the operator runbook and the stated local-filesystem durability boundary.

Verify the real state-writer and lock integration. The primitive result in `S3` supports this work but does not prove finalizer retention, stale-holder recovery, partial uninstall or power-loss behavior.

#### Requires

[]

#### Rationale

Ownership, the mutation journal, all state writers and installer serialization share one invariant: cleanup evidence survives until the corresponding permission change is known to have landed. Shipping only part of that invariant could lose provenance on the next install or retry.

### WS-4: Grant reconciliation, uninstall and operator completion

#### Scope

Apply the shared pure desired-change computation to install, upgrade, check, dry run and uninstall. Snapshot original permission state before additive merging, reconcile afterward, and retain user entry order. Insert only absent needed entries, acquire ownership only for proven insertions, revoke unchanged obsolete owned entries and preserve edited, unrelated or unproven entries.

Capture grant and seed-derived evidence before uninstall clears seeds or state. Recompute retained-host needs on targeted removal, retain pending/ownership evidence after partial failure and delete state only after applicable cleanup completes. Integrate the WS-3 recovery mode with retry, exact owner decisions and incomplete/failed exit behavior.

Resolve the historic-ownership policy using the existing open question and default. Unversioned Claude arrays and recognizable OpenCode text never become proof by matching shape. An approved migration, if selected by the owner, stays within the stated migration approval requirement. Report future automatic reconciliation separately from unresolved historic cleanup.

Cover mutation events and command totals, redaction, upgrade/uninstall operator guidance, provider behavior, fixture consumers and interruption checks across the completed lifecycle. Verify old-seed removal, user edits, identical unowned entries, targeted uninstall, failed writes and partial retry. This work closes the integrated permission-lifecycle portion of `S3`; primitive probe success is insufficient.

#### Requires

[WS-3]

#### Rationale

Reconciliation and uninstall consume the same ownership/recovery protocol and must agree on completion. They form one permission-cleanup deliverable with a common rollback and operator recovery path.

### WS-5: Cloud baseline stamps and copied-bootstrap rollout

#### Scope

Add the existing derived-set fingerprint to the existing allowlist artifact and include `BKIT_CLOUD_ALLOWLIST_FINGERPRINT` beside the generated network paste. Keep the fingerprint's shipped-derived-set meaning and preserve the existing domains consumed by hooks.

Compare expected and configured stamps in the cloud-only bootstrap path. Emit one sanitized status event with a deterministic primary reason, warn with refresh instructions on mismatch or unavailable evidence, and continue. Include malformed inputs and missing JSON tooling; a matching stamp remains an operator assertion rather than dashboard readback or coverage of consumer-only changes.

Deliver the copy-and-own bootstrap marker, static stale-copy findings, setup-refresh instructions, relevant cloud/provider and template documentation, and a rebuilt-session completion signal. Preserve modified adopted copies and instruct the owner how to merge the section. Verify local no-op behavior and each cloud reason without implying that a template update refreshed a deployed snapshot.

#### Requires

[]

#### Rationale

The expected stamp, copied configuration stamp and bootstrap comparison form an independent diagnostic with its own cloud snapshot rollout. They do not depend on the runtime denial or permission-ownership changes.

## Suggested Plans

Each plan is a suggested filed unit, not a newly created issue or an implementation plan. Each includes its workstreams' diagnostics, documentation, validation and rollout. The three deliverables can be released independently; shared files require coordinated edits but introduce no behavioral prerequisite between plans.

### P-1: Enforce Codex key reads and OpenCode download targets

#### Deliverable

Ship shared command findings, Codex key-read denial and the dedicated OpenCode download guard, with verified host/client compatibility and complete runtime delivery. Shared parsing and precedence keep these workstreams in one plan. Real-host `S1` and full-client `S2` evidence remain required before affected support claims are complete.

#### Covers

[WS-1, WS-2]

#### Requires

[]

### P-2: Revoke owned grants with durable recovery

#### Deliverable

Ship versioned ownership, the installer lock and mutation recovery together with grant reconciliation and uninstall cleanup. Preserve user edits and unresolved historic evidence, provide validated operator recovery and report incomplete cleanup accurately. All state writers and lifecycle transitions share one release and rollback boundary; integrated `S3` validation is part of this deliverable.

#### Covers

[WS-3, WS-4]

#### Requires

[]

### P-3: Detect stale cloud baseline stamps

#### Deliverable

Ship expected/configured derived-baseline stamps, nonblocking bootstrap diagnostics and the copied-bootstrap refresh path. The deliverable includes stale-copy detection and a rebuilt cloud session's status signal, with the operator-assertion and consumer-domain limitations stated explicitly.

#### Covers

[WS-5]

#### Requires

[]
