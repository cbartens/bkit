# Design Brainstorm & Ideas

Lens: Pragmatic — existing code, minimal new infrastructure, fastest to ship.

## Approach A — Extend shared guards and existing ownership records ⭐ Recommended

Extend the current shell classifier and permission reconciliation, add the owner-selected thin OpenCode guardrails plugin, and retain grant ownership in the existing `.bkit/version` state.

<!-- prettier-ignore -->
| Trade-off | Assessment |
| --- | --- |
| Complexity | MEDIUM. Existing seams cover classification, host refusal, allowlist resolution, generated-file reconciliation and fingerprints. The main work is making enforcement precedence and grant ownership precise. |
| Extensibility | Additional host adapters can reuse the same classification and target inspection. Additional derived permission rows use the same ownership record rather than another merge algorithm. |
| Risk | A first-match classifier can hide a key read behind an earlier `.env` read or another tier, and can hide an unapproved fetch behind an advisory. Legacy OpenCode grants have no ownership history. |
| Maintenance | One shared security decision model, one small host adapter, and an extension of existing install state. Existing host verdict mappings remain independently testable. |
| Reuse vs new | Reuse `secretFileKind`, `shellSecretRead`, `classifyShell`, `commandLines`, allowlist loading and hostname matching, the OpenCode before-hook refusal mechanism, Claude's recorded-grant pruning pattern, and `egressFingerprint`. New work is the OpenCode adapter and the minimum state needed to record its generated permissions. |

The practical shape is:

- Keep policy in `.bkit/core/hooks/guardrails-tiers.js` and shell interpretation in the existing shared shell part. Carry key classification through to host decisions and inspect all relevant reads so a key read cannot disappear behind an earlier advisory. Codex denies key reads and keeps env-file reads advisory.
- Add `.bkit/core/.opencode/plugin/bkit-guardrails.js` with the existing plugin registration style and `tool.execute.before` refusal. It uses shared logic rather than copying GateGuard. A refused security operation remains refused on retry; GateGuard's warn-once deduplication is inappropriate here.
- Extend existing target inspection for the accepted download contract. The current `extractUrlHosts` scans URLs anywhere in the command and is not a complete curl/wget argument parser. Its successful return cannot prove every transfer target was found. Identify each fetch invocation, interpret the supported argument forms, and produce an explicit unresolved result for dynamic targets, unsupported target-bearing options and external config/input files. Refuse an invocation when any target is unapproved or unresolved. Reuse hostname normalization and label-boundary matching, including the existing userinfo handling.
- Treat redirects and alternate connection options as target-bearing behavior requiring an explicit policy. A check of the initial URL alone cannot establish the eventual destination. The fastest conservative implementation rejects redirect-following or connection-override forms whose destinations cannot be determined before execution. A policy intended to permit them needs a different enforcement boundary and should be surfaced explicitly.
- Let the plugin enforce shell targets before native permissions are consulted. Remove generated host-substring shell allows as an authorization mechanism, or replace them only with a coarse permission that is safe because every matching download first passes the plugin. Validate actual allowed-host behavior through OpenCode: a before-hook returning normally does not itself grant a native permission.
- Extend `.bkit/version` with the minimum OpenCode derived-grant ownership data, using Claude's existing pattern. Reconcile after the additive merge so stale rows are not reinserted. Prune only a recorded row whose current value still equals the value bkit wrote, and preserve unrelated custom permissions and edited values. Preserve last-match-wins ordering. Install, upgrade and check use the same dry-run computation; persist ownership only after successful real writes.
- Snapshot Claude's existing recorded derived grants before uninstall mutates the seed or version state. Use that snapshot for removal instead of recomputing solely from the emptied seed. Do the equivalent for recorded OpenCode grants. An absent record proves no authorship: it does not authorize deleting rows merely because their text resembles generated grants.
- Reuse the existing fingerprint calculation and expose a non-secret current-versus-configured comparison at bootstrap. Warn, show refresh instructions and continue when the recorded value is missing or differs. Make the source of the configured fingerprint explicit, such as a value copied with the dashboard setup. The existing fingerprint covers shipped derived egress only; it cannot detect consumer-domain changes or independently inspect a vendor dashboard.

Legacy ownership needs a stated limit. Exact old generated rows and user-authored identical rows are indistinguishable without historical state. Preserve unproven rows, warn about the remaining ambiguity, and keep the runtime target guard authoritative. If complete legacy deletion is required, the design must obtain the owner's policy for that ambiguity; it cannot silently relabel a pattern match as proof of authorship. Do not introduce a destructive migration as an incidental implementation detail.

## Approach B — Keep grant ownership in a dedicated managed artifact

Use the same shared guards and thin OpenCode adapter, but store the exact grants bkit added in a dedicated managed ownership artifact instead of extending `.bkit/version`.

<!-- prettier-ignore -->
| Trade-off | Assessment |
| --- | --- |
| Complexity | HIGH relative to Approach A. It requires a new artifact contract, lifecycle wiring and consistency rules alongside existing version state. |
| Extensibility | A host-keyed artifact can describe native permission entries independently of package pinning and can be reused by additional host adapters. |
| Risk | A crash can update permissions and ownership separately, losing evidence needed for the next prune. Legacy rows remain ambiguous exactly as in Approach A. |
| Maintenance | Another installed file, uninstall path, drift policy and compatibility contract. The extra separation is useful only if ownership grows beyond the current small set. |
| Reuse vs new | Reuse the same classifier, hooks, resolver and reconciliation functions as Approach A. Add an ownership file and writer rather than adding a small field to the existing state model. |

This fits the accepted behavior, but has no immediate benefit over the already-established `claudeAllowDerived` convention. Keep it as an alternative only if review identifies a concrete reason that version state cannot carry OpenCode ownership safely.

## Approach C — None

## Decisions

<!-- prettier-ignore -->
| Decided | Alternatives | Why |
| --- | --- | --- |
| Recommend Approach A. | A separate ownership artifact. | It extends the existing stack and its proven ownership concept with the fewest new lifecycle surfaces. |
| Keep a dedicated OpenCode guardrails plugin. | Extend GateGuard. | Settled Q1 selects the dedicated plugin; GateGuard retains its existing job. |
| Deny unapproved and unresolved OpenCode download targets. | Advisory or host approval fallback. | Settled Q3 requires refusal. A generic regex that finds one allowed URL is insufficient. |
| Preserve unrelated user permissions and require ownership evidence for pruning. | Replace whole maps or delete every matching pattern. | Settled Q4 and `modules-dispatch-render-and-reconcile-mechanics` require surgical removal. |
| Warn and continue for mismatched or missing cloud fingerprints. | Stop bootstrap or stay silent. | Settled Q2 and Q5 choose visibility with refresh instructions. SessionStart already reports failures without blocking the session. |
| Explicitly depart from the shell portion of `551-opencode-unanchored-host-allows-accepted-risk`. | Retain substring permission globs as the security check. | The new issue requires actual-target validation. Its native WebFetch glob risk is a separate surface and should not be silently expanded into this change. |
| Narrow the earlier advisory-only shell contract for the named hosts and tiers. | Change every host's fetch and secret behavior. | The issue requires Codex key denial and OpenCode target refusal; `.env` remains advisory on Codex and unrelated host mappings remain as specified today. |
| Keep operational hook errors distinct from an explicit unresolved target. | Treat parser uncertainty as a hook crash and allow it. | `guardrails-empty-catches-fail-open` describes internal failures. The owner's explicit refusal policy requires unsupported target syntax to be an ordinary classified refusal. |
| State fingerprint and legacy-provenance limits in the design. | Claim complete dashboard observation or infer authorship from a row shape. | Neither capability exists in the inspected code. Concealing the limits would produce success criteria the implementation cannot truthfully satisfy. |

Evidence: `.bkit/core/hooks/guardrails-tiers.js:193-197,229-284`; `.bkit/core/hooks/guardrails-shell.js:264-300`; `.bkit/core/.codex/hooks/bkit-guardrails.cjs:58-85`; `.bkit/core/.opencode/plugin/bkit-gateguard.js:160-173,270`; `.bkit/core/engine/install/modules/opencode.ts:336-450`; `.bkit/core/engine/install/modules/claude.ts:219-280`; `.bkit/core/engine/install/version-file.ts:52-101`; `.bkit/core/engine/commands/install/uninstall.ts:725-746`; `.bkit/core/engine/install/cloud-env.ts:632-643,685`; `.bkit/templates/.claude/hooks/bkit-cloud-bootstrap.sh:14-60`. The language-server query for the worktree path was unavailable because that path is ignored; the source ranges above were read directly.
