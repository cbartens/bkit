Verdict: CONCERNS
Spike: true

<!-- verdict:end -->

# Design Review

Lens: Buildability — prior art, stack feasibility, library fit, integration risk.

## Prior Art Search

The repository has substantial prior art for every capability. The dedicated OpenCode adapter is justified by settled Q1; it should reuse the existing plugin envelope and shared decision engine. No reuse violation requires replacing that decision.

<!-- prettier-ignore -->
| Capability | Existing candidate and fit | Recommendation |
| --- | --- | --- |
| Codex key denial and mixed-command precedence | `hooks/guardrails-tiers.js:193-290` already distinguishes `key` from `env`, but `shellSecretRead` and `classifyShell` return the first result. `.codex/hooks/bkit-guardrails.cjs:61-87` already has real deny mapping. This is mature, shipped local machinery covering most of the requirement. | EXTEND-EXISTING. Collect findings without losing secret kind, then apply host precedence. No new key classifier. |
| Download interpretation | `hooks/guardrails-shell.js:8-109,264-300` provides segmentation, words, wrappers and host policy. It is shipped across hosts, but segmentation splits on quoted separators and tokenization discards quote provenance. It is a useful base, not an enforcement-grade parser as written. | EXTEND-EXISTING. Tighten the shared lexical contract and add bounded curl/wget argument interpretation; retain current mappings for unrelated hosts. |
| URL authority | Node's built-in WHATWG `URL` supplies normalized hostname fields with no package dependency. Curl uses a different URL grammar. | ADAPT. Use `URL` only after a conservative raw-input gate and test agreement with the download clients; successful `new URL()` alone is not proof of the actual authority. |
| OpenCode enforcement and delivery | `.opencode/plugin/bkit-gateguard.js:163-174,262-276` supplies throw-to-refuse logic and v1/v2 registration. `render/parts.ts` and `install/manifest.ts` already render managed hooks. | ADAPT. Add the agreed dedicated adapter using those conventions, with persistent denial rather than GateGuard's deduplication. Prove loading and refusal on real supported runtimes. |
| Grant reconciliation and uninstall | `install/modules/claude.ts:239-289`, `install/modules/opencode.ts:347-450`, `install/version-file.ts:25-109` and `commands/install/uninstall.ts:700-770` own these writes today. Current Claude bookkeeping records the full needed set; OpenCode has no derived-entry provenance. | EXTEND-EXISTING. Correct ownership at the current merge seams and capture state before uninstall cleanup. Add a trustworthy-record discriminator before reusing old Claude records. |
| Recovery and serialization | `writeBkitVersion` is a direct write. `commands/workflow/locks.ts:113-129` provides exclusive file creation; `commands/workflow/disk.ts` uses it with process-aware lifecycle. Those helpers establish patterns, but workflow lock reclamation is not an installer contract. | ADAPT. Reuse the exclusive-create primitive where layering permits, with an installer-specific holder lifecycle and atomic state replacement. Do not import workflow idle semantics into installation. |
| Cloud freshness | `egressFingerprint()` at `install/cloud-env.ts:634-640` is a stable derived-registry stamp; `install/network-allowlist.ts:22-60` owns the resolved artifact. The existing bootstrap is the correct comparison surface. | EXTEND-EXISTING. Add the expected stamp to that artifact and compare the copied non-secret stamp, retaining the stated baseline-only guarantee. |

Search evidence: targeted `rg -l --hidden` across shared hooks, host adapters, install modules, version state, install commands and locking helpers; bounded symbol-name searches and reads at the cited ranges; `docs/capabilities.md` searched for guardrails, reconciliation, fingerprint and locking names. The map search had no match, while its known `# Capabilities` heading was present. Text searches found the candidates above. Serena's symbol query explicitly rejected the ignored worktree path, so language-server results are unavailable for this checkout and provide no absence evidence.

External queries covered built-in OpenCode pre-execution hooks, Node filesystem locking and atomic writes, URL parsing, and curl/wget configuration and redirect controls, including current-year best-practice searches. Only primary sources support the conclusions. Node documents WHATWG parsing, while curl warns against assuming different URL parsers agree. [Node URL API](https://nodejs.org/api/url.html), [curl URL syntax](https://curl.se/docs/url-syntax.html).

OpenCode documents pre-tool protection in its V1 plugin examples and distinct V2 registration. Its V2 migration guide says supported V1 configuration is normalized without rewriting the file; native V2 values take precedence when both forms exist. [V1 plugins](https://opencode.ai/docs/plugins/), [V2 server plugins](https://opencode.ai/v2/docs/build/plugins/server/), [V2 migration](https://opencode.ai/v2/docs/migrate-v1).

## Stack Feasibility

Feasible with the approved Node.js >=24, TypeScript, dependency-free JavaScript hooks and shell bootstrap. No service, database, browser automation or new runtime package is needed. The narrow supported-download profile makes static inspection tractable, provided unsupported syntax is rejected before lossy parsing and the guarantee remains limited to recognized shell downloads.

The design is not ready to treat the new boundaries as proven. OpenCode loading, actual tool IDs, refusal propagation and native permission interaction must be demonstrated for concrete supported versions. A V2-capable export does not establish V2 configuration or runtime behavior. The existing host experiment records OpenCode 2.1.4 after-execution advisories, not pre-execution security refusal.

The ownership model is implementable but changes a central install-state contract. Its durable-state transitions, schema discriminator and final writers must be made explicit before planning. Historic cleanup remains narrower than the original issue's unconditional criterion; the design correctly surfaces that unresolved owner policy rather than claiming it solved.

## Library / API Evaluation

<!-- prettier-ignore -->
| Library or API | Assessment |
| --- | --- |
| Node `URL`, `fs`, `crypto` | Mature built-ins already present in the runtime; no added bundle or package footprint. `@types/node` 24.19.2 is declared locally. Node is MIT-licensed with separately licensed bundled components. URL interpretation differs from curl, and filesystem primitives do not provide a two-file transaction. [Node license](https://raw.githubusercontent.com/nodejs/node/main/LICENSE), [Node 24 filesystem API](https://nodejs.org/download/release/v24.20.0/docs/api/fs.html). |
| Existing bkit shared hooks and installer | MIT repository code, no runtime dependencies in `package.json`. JavaScript hooks have no runtime type enforcement, so payload and ownership validation must be explicit. Reuse avoids a second parser or permission database. |
| OpenCode plugin API | OpenCode is MIT-licensed. The existing plain-object adapter adds no runtime SDK dependency. Official V2 docs supply typed interfaces, but V1/V2 export, input and permission contracts differ; test the actual supported binaries. [License](https://raw.githubusercontent.com/anomalyco/opencode/dev/LICENSE), [V2 plugin API](https://opencode.ai/v2/docs/build/plugins/server/). |
| curl and GNU Wget | Existing external executables, not bundled libraries. Their option sets and startup behaviors need a stated compatibility floor. Curl documents startup config and redirect controls; Wget documents `--no-config`, with explicit `--config` overriding it, and proxy environment variables. Reject conflicting options and distinguish the URL destination from the configured transport proxy. [curl manual](https://curl.se/docs/manpage.html), [GNU Wget manual](https://www.gnu.org/software/wget/manual/wget.html). |

No ecosystem package covers more of bkit's combined host policy and installer ownership requirement than the in-repository candidates. A general shell parser would still need a curl/wget option policy and would add a runtime dependency, so it is not recommended here.

## Integration Risk

- Shared lexer and finding changes reach Claude, Cursor, Codex and Antigravity as well as the new OpenCode adapter. Their existing advisory behavior must remain represented in rendered-host fixtures.
- `parseBkitVersion` and `serializeBkitVersion` currently reconstruct only three known fields. Core's deferred writer reconstructs them again, while upgrade has an early no-op check based on current fields. New ownership and pending intent can be dropped unless every writer and no-op condition participates.
- Install template merging currently precedes derived reconciliation, and OpenCode rule order affects behavior. Compare ownership against the original snapshot, not a template-overwritten value, and preserve user entry order as designed.
- Full uninstall deletes install state while targeted uninstall rewrites it. Both paths must preserve recovery evidence until permission cleanup completes; provider-only removal must not revoke grants still needed by the retained host.
- V2 can normalize V1 permission maps, but a native `permissions` value can supersede them. Removing a dormant V1 grant must not be reported as revoking an effective native V2 grant.
- Cloud diagnostics are a template change. Adopted copies need the explicitly described rollout; this is not an automatic update of every live cloud bootstrap.

This is a single package, not a service monorepo. The main blast radius is shared rendering and install-state lifecycle, not a new deployment topology.

## PoC Approach

Use separate minimal probes with synthetic data. First, load a tiny dedicated guard plugin in each supported OpenCode runtime. Configure a native allow, invoke the shell through the real host, and prove a thrown refusal prevents a sentinel file twice; prove the approved control writes its sentinel. Record version, plugin path, tool ID and permission shape. Verify Codex denial with a dummy `id_rsa` containing no credential.

Second, compare the bounded URL profile against installed curl and GNU Wget using local listeners only. Exercise ordinary hosts, quoted separators, multiple targets, configuration disabling and redirects; record which authority receives the request. Do not simulate a missing client or accept a stub as proof.

Third, use a small filesystem state-machine probe to interrupt intent/settings/ownership replacement and restart from before, after and conflicting hashes. Confirm that a competing holder cannot acquire the same installer lock. This proves the chosen primitive contract, not the eventual production integration.

## Unknowns & Blockers

- **S1 — Real-host enforcement:** Does the delivered plugin load and block shell execution before side effects despite matching native allows, on the supported V1 and V2 versions? Does denial remain effective on retry? Can the approved control execute? Real-host execution is required; source and mocked adapter objects are insufficient.
- **S2 — Parser agreement:** Does the proposed accepted URL and option subset identify the same destination in Node, curl and GNU Wget, including quoted separators and config/redirect controls? A bounded differential probe with local listeners is required. Unsupported binaries or unavailable runtimes are `BLOCKED`, not evidence of agreement.
- **S3 — Recovery primitive:** Does the selected atomic replacement and exclusive-lock lifecycle retain ownership intent through interruption and prevent two cooperating mutation processes from owning it? Exercise the stated filesystem and process assumptions. Arbitrary editor races remain outside a cooperative lock and must stay disclosed.
- Historical ownership policy and the exact schema discriminator resolve by design and owner decision, not experimentation. A probe cannot reconstruct authorship that was never recorded.

## Verdict Reasoning

CONCERNS: the architecture fits the current stack and uses the appropriate existing modules, but the addressable caveats below leave important contracts underspecified. No evidence establishes that the requirement is impossible. `Spike: true` because S1-S3 depend on executing the relevant hosts, clients or filesystem behavior.

## CRITICAL

1. **Define the whole accepted lexical profile, including URL-parser agreement.** The draft reuses shared segmentation, but `shellSegments` at `guardrails-shell.js:8-13` splits quoted separators and `shellWords` loses quote and escape provenance. Adding option parsing after those helpers cannot reliably identify all URLs in a compound invocation. Require quote-aware segmentation, preserved token metadata, explicit wrapper/recursion limits, and an unresolved result for unsupported syntax before information is discarded. Node's WHATWG URL parser and curl's RFC-derived parser are not interchangeable, as curl's own documentation states. Define a conservative raw-authority subset and differential acceptance evidence for both download clients. This is an addressable extension of the shared parser, not justification for a second parser.

2. **Make the ownership journal survive every state writer and use a trustworthy generation marker.** `version-file.ts:65-101` drops unknown fields, `modules/core.ts:1916-1920` reconstructs only old fields, and `upgrade.ts:526-550` can skip a write when only new ownership changes. `enrichClaudeSettingsAllows` returns the complete needed set, including identical pre-existing user grants, so an old `claudeAllowDerived` array is not proof of authorship. Specify how records produced by the corrected algorithm are distinguished from legacy arrays, and preserve ambiguous legacy rows under the default policy. Define read/validate/merge/write behavior for initial install, deferred finalization, upgrade, targeted uninstall and full uninstall. Both intent and final ownership state need atomic replacement; a torn intent write otherwise destroys the recovery premise. State the supported durability level rather than implying power-loss guarantees without syncing.

3. **Resolve lock scope and recovery before calling the journal complete.** The draft recommends a lock but leaves it outside the operative flow. Select the mutation boundary: acquire before reading ownership/settings and retain through template merge, permission replacement, ownership finalization and uninstall state cleanup. Specify location, ownership token, stale-holder rule, release behavior and how a pending intent is handled before a new mutation. `locks.ts` offers an exclusive-create primitive, but its workflow idle policy is unsuitable for installers and must not be reused wholesale. Retain the explicit limit that unrelated editors do not honor this lock.

4. **State the tested OpenCode version/configuration contract.** Name concrete supported V1/V2 versions, plugin discovery/registration paths, shell tool IDs and configuration shapes. Official docs permit V1 configuration on V2, so no blanket migration is required. However, native V2 `permissions` takes precedence over the V1 map, and the draft's `{path,value}` ownership applies only to the latter. Preserve and diagnose unsupported native or mixed shapes, or specify their ownership model; do not claim effective revocation from editing an inactive map. Gate the actual enforcement outcome on S1, including a positive control and a repeated refusal. The available OpenCode 2.1.4 advisory report does not settle it.

## OPTIONAL

- Clarify that an allowlisted URL may legitimately traverse the host's configured proxy. Rejecting command-level proxy overrides is consistent with the draft, but disabling the cloud's required environment proxy would break supported downloads and is not needed to claim URL-host validation.
- Specify minimum GNU Wget and curl capabilities for the strict profile. BusyBox wget is a different command surface; report it as unsupported unless separately verified.
- Make the eventual acceptance output separate automatic future revocation from unresolved historical cleanup. A successful upgrade must not conceal the latter behind one success message.

## OUT OF SCOPE

None. This review does not propose a network sandbox, a download broker, a general shell interpreter, or a broad OpenCode configuration migration.
