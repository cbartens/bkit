Verdict: PASS

<!-- verdict:end -->

# Design Summary

## Overview

**Problem:** Six provider/tooling hosts (`groq.com`, `cerebras.ai`, `openrouter.ai`, `githubcopilot.com`, `models.dev`, `skills.sh`) are unreachable from cloud agent sessions today because they are absent from bkit's shipped network allowlist and must be hand-declared by consumers. The allowlist itself is already fragmented across five surfaces (cloud paste blocks, Cursor hook, Claude WebFetch, OpenCode curl/wget, Cursor allowlist.json) with multiple hand-maintained copies drifting.

**Approach:** Auto-derive the complete allowlist from bkit's provider registries (opencode providers, MCP trackers, agent hosts, package registries, skills registry, docs-only hosts) into a single source table. Compute derived bases from each entry's `baseURL` via a gated proposer-vs-gate split (silent omit for IP literals/localhost, CI-fail for multi-tenant apexes/public suffixes). Fan out this one table to all five surfaces in the same pass, eliminate duplicate lists, and add a provenance field to `.bkit/version` so bkit can safely prune WebFetch grants when hosts leave the derived set.

**Key decisions:** (1) Static whole-registry derivation (install-state-independent) to keep the Cursor hook byte-equal-hash-gated and the cloud paste stable across provider switches; (2) Declared `egress` with a gate only where default fails (10 current entries pass unchanged); (3) Delete the hook's fallback list entirely rather than automate it (fail-safe to ask). (4) Thread the provenance record through the existing `.bkit/version` writer via `ModuleContext`, not as a separate file.

## Design Quality

Thoroughly reasoned and well-verified. Strengths: (1) all 19 registry rows are table-driven and derivable/declared explicitly, addressing v1's composite-id defect; (2) the proposer-vs-gate split cleanly separates silent rejections (IP literals, loopback) from CI-red rejections (multi-tenant apexes); (3) ground-truth table maps every claim to source line numbers, all re-verified in the organized design; (4) the `.bkit/version` write path was the v1 draft's largest defect and is now resolved via `ModuleContext` threading and `needsWrite` extension — dry-run rule falls out for free; (5) seven workstreams clearly seam on module/encoding-surface/chronological boundaries; (6) six deferrals and all open questions are explicitly recorded. Trade-offs are honestly stated, not papered over (e.g., the prune can remove hand-added grants if they collide with derived ones, and the removal is recorded in three durable places). The design reshaped twice through round-1 review — each reshaped addressed a material defect (type expressibility, fingerprint placement, prune honesty, write path) rather than style, so the two CONCERNS verdicts were structural, not cosmetic.

## Acceptance Scenario

**Narrative & Success Criteria:** Consumer installs bkit with any mix of providers, pastes the network allowlist into Claude/Cursor dashboard once (now containing all six live-gap hosts), and cloud sessions reach every configured host without hand-declaring a single provider domain. Adding/removing a provider or stack domain later requires no re-paste and no edits outside config.md, and grants for removed domains are pruned with an advisory. Spec adheres to `docs/plans/template.md` § Acceptance Scenario — Narrative is user-POV, Success Criteria are measurable (one-install-one-paste, all six hosts reachable, one-table sourcing, prune with provenance record, docs updated in same commit). **Key edge cases:** Cursor hook with missing/corrupt artifact fails to ask (safe); registry entries with no derivable host (ollama-local, gateway builtins) contribute nothing without throwing; multi-tenant apex collapse (*.googleapis.com) fails CI; prune removes only grants bkit recorded, hand-added grants survive if never derived (bounded residual case, disclosed).

## Breaking Changes

**Runtime behavior changes (no API breakage):** Cloud paste blocks now carry 19 bases (apex + wildcard) instead of consumer-only, so the "Trusted default" branch retires and consumers with zero declared `allowed-domains` must now select "Allowlist only" mode in Claude/Cursor dashboard (from "Trusted" or default). **File structure:** `.cursor/allowlist.json` artifact now carries the full derived set (currently same 13 bases -> 19 with this change); Cursor hook `guardrails.cjs` has `SHIPPED_NETWORK_BASES` array removed (hook now asks on every URL if artifact is missing/corrupt). **Templates:** `.bkit/templates/.claude/settings.json` WebFetch seed empties (was a stale partial subset). Both cloud templates gain a troubleshooting runbook sentence. **New artifact:** `.bkit/src/bkit-registry.ts` (leaf data module, builds to `dist/bkit-registry.js`). **Schema:** `.bkit/version` gains required `webFetchDerived: string[]` field (parsed to `[]` if absent in old payloads). No consumer-facing naming changes.

## Feasibility

**Verified buildable.** Round-1 review confirmed: (1) import graph has no cycle (new `bkit-registry.ts` leaf breaks the otherwise-fatal `bkit-modules.ts` -> `bkit-cloud-env.ts` -> `bkit-registry.ts` loop); (2) coverage-lane holds (`bkit-registry.ts` branch-free stays out of `package.json:47` measured list, `bkit-cloud-env.ts` derivation stays in); (3) `URL.canParse` + `hostname` available (Node >=20); (4) all 10 registry baseURLs derive correctly, IP-literal detection via bracketed IPv6 and dotted-quad regex is implementable; (5) `.bkit/version` write path is now resolved (thread via `ModuleContext`, extend `needsWrite`); (6) no new runtime deps needed (rejected `psl`/`tldts`, kept denylist as data); (7) `deepContains` subset semantics make emptying the template array safe for `bkit check`. PoC probe identified one unproven piece: the `.bkit/version` field surviving an install end-to-end (not a read → simulate write like unit tests). Design specifies this as a plan-time proof obligation (seed in tmp dir, run real install, read back) — if it fails, prune is re-scoped before build, not during it.

## Synthesis Coverage

Three brainstorms proposed 11 approaches total; design kept 4 (whole-registry static derivation + gated basis extraction + hook deletion + provenance-record prune), merged 1 (declared egress with gate), and rejected 6 with stated reasons. **Kept:** All three brainstorms converged on static derivation and provenance records. The gate was proposed only in brainstorm 3, so the design merged its two denylists and gate logic into the spine. **Merged:** Brainstorm 3's declared-egress direction was adopted but trimmed (declaration required only on gate rejection, not every entry). **Rejected with reasoning:** Installed-set reactivity (fails hash-gate, makes paste stale); two-tier hybrid (creates per-surface asymmetry); PSL/vendored suffix tables (unknown apex still widens silently); exact-host-only (narrows today's constant); parity-test-over-copies (doesn't solve the issue); unified runtime artifact (blocked by tool schemas). Each rejection includes the alternative considered and why it lost — no good options were dropped silently.

## Scope Alignment

**Scope creep:** Minimal and justified. Issue #381 asked for "auto-derive from registry, static, deterministic, reactive" (the last two are contradictory; resolved to static-whole-registry because it satisfies both user goals better). Round-1 comment 3 ("include all providers, not just opencode") widened scope to 5 registry kinds instead of 1 — justified because four of the six live gaps are outside opencode. Prune feature (Success Criterion 4) was unanimous across three brainstorms and is in the issue scope ("no consumer-varying content in a byte-equal-hash-gated artifact" and "a domain that leaves the set loses its grant"). **Deferrals:** Dep-updater hosts (runner-side egress, out of scope), bootstrap-time cloud reachability probe (new cloud session capability, separate change), ask-rate signal in hook (hash-gated artifact, separate review surface), `bkit upgrade` not writing `.bkit/advisories.md` (pre-existing parity gap), and tighter OpenCode encoding (blocked by tool schema). All six deferrals are recorded and their blockers stated.

## Risks

**HIGH:** (1) Cloud allowlist is human-pasted once; nothing detects a stale paste (symptom: opaque model-call timeout). Mitigation: static list (rarely changes), 8-hex fingerprint after fence, operator runbook sentence in both cloud templates, triage-side note in docs/providers.md. (2) `.bkit/version` regeneration missed ships drift to all consumers. Mitigation: test 6 (hook byte-parity regression guard) plus clean `bkit check` on dogfood as release gate. **MEDIUM:** (3) A grant removal scrolls off console unnoticed. Mitigation: advisory into `.bkit/advisories.md` naming removed strings + re-declare path, plus durable `git diff .claude/settings.json`. Residual: upgrade doesn't write advisories artifact today. (4) Future `.bkit/version` field addition re-breaks provenance (install-side fresh literal). Mitigation: test 10 asserts field survives real install; ground-truth table records install-vs-upgrade asymmetry. (5) Moving `OPENCODE_PROVIDER_DEFAULTS` from heavily-tested file. Mitigation: symbol is module-private, move is one import line, verified no external call sites. (6) Denylist rot (future provider on unknown multi-tenant apex). Mitigation: deny-shaped gate (unknown apex passes), soft warning on `.dev`/`.app`/`.run` TLDs, invariant recorded in registry file. **LOW:** (7) Stale slop-scan reason prose. Mitigation: rewrite in same commit. (8) Scale at 10x providers. Mitigation: not a perf concern (host check sub-ms), real limit is unmeasured dashboard field caps.

## Action Items

None. All four CRITICAL concerns from round-1 review were closed in the apply-review step: (1) `.bkit/version` write path resolved via `ModuleContext` threading; (2) `EgressSource` type reshaped to `bases: readonly string[]` (array not scalar) with atomic (non-composite) ids; (3) fingerprint placement moved outside fence; (4) prune safety claim restated honestly with explicit recording contract. One OPTIONAL (kimi-docs with `hosts: ["kimi.com"]` not empty `hosts`) was deliberately deferred to planning since it is expressible either way.

## Outstanding Questions

- **Q: Does an opencode built-in gateway session actually contact `models.dev`?** — **Recommended:** Include `models.dev` in the `opencode-zen`/`opencode-go` rows pending verification (cheap to settle by running a live session with host blocked; low risk either way, and not a blocker for planning).

- **Q: Are `console.anthropic.com` / `api.cursor.com` reachable-from-cloud requirements or docs-only hosts?** — **Recommended:** Feed back into WS-1's `hosts` column if resolved before ship; impacts only the exact-host list Cursor cloud renderer emits verbatim, not the base/apex derivation.

- **Q: Is there a practical upper bound on the Claude-web / Cursor "Allowed domains" dashboard field?** — **Recommended:** ~19 bases = ~38 lines today, far from any plausible cap; probe before fan-out grows beyond 10x providers, but not a blocker now.

- **Q: Should `registry.npmjs.org` be the declared host for `pkg-npm` row, or is `npmjs.com` alone sufficient?** — **Recommended:** The base `npmjs.com` covers both; exact host matters only for Cursor's non-wildcarded list; decide in WS-1 based on whether consumers call that specific subdomain from cloud agents (likely not).

## Suggested Workstreams

**WS-1: Egress registry leaf** — Create `.bkit/src/bkit-registry.ts` (data only, branch-free), move `OPENCODE_PROVIDER_DEFAULTS` from `bkit-modules.ts`, declare all 19 `EgressSource` rows with atomic ids, hold gate denylists. _Requires:_ none. _Rationale:_ root of all other workstreams; leaf imports nothing.

**WS-2: Derivation, gate, and exports** — Proposer (silent reject on `""` / `localhost` / IP literal / <2 labels) and gate (deny check: no denylisted bases, >=2 labels, label-boundary match). Export pure `deriveEgressEntries(rows)`. Compute and export `BKIT_SHIPPED_NETWORK_DOMAINS` and `BKIT_SHIPPED_NETWORK_HOSTS`. Tests 1-3. _Requires:_ WS-1. _Rationale:_ all branching in coverage-measured file; all downstream surfaces consume both exports.

**WS-3: Cloud paste surfaces** — Switch both Claude/Cursor renderers to `resolveNetworkAllowlist`, retire zero-declared "Trusted" branches, emit 8-hex fingerprint after fence, pair with operator runbook. Tests 9 + repair § 5b. _Requires:_ WS-2. _Rationale:_ both cloud.md are untracked, no manifest impact; fingerprint+runbook are one mechanism.

**WS-4: Cursor hook** — Delete `SHIPPED_NETWORK_BASES` array, rewrite slop-scan reason. Hook asks on every URL if artifact missing/corrupt. Tests 6 + negative edge. _Requires:_ WS-2. _Rationale:_ byte-equal-hash-gated artifact; deletion is entire goal, not automation.

**WS-5: Claude WebFetch** — Add `webFetchDerived` field to `.bkit/version` (required, parser-default `[]`), thread via `ModuleContext`, extend `needsWrite`. Empty template seed. Prune logic in enrich with recording contract. Tests 8 + provenance-survives. _Requires:_ WS-2. _Rationale:_ provenance record and prune are one mechanism; both halves needed for Success Criterion 4.

**WS-6: Cross-surface fan-out** — Verify OpenCode `curl`/`wget` and `.cursor/allowlist.json` unchanged (pick up widened set free). Tests 4 (all five surfaces), 5 (injected provider), 7 (negative/edge). _Requires:_ WS-3, WS-4, WS-5. _Rationale:_ can only assert fan-out when all surfaces exist.

**WS-7: Release integration** — Build `dist/bkit-registry.js`, verify `bkit check` 0 writes on clean install/upgrade, regenerate mirrors, record ADRs (static vs reactive, declaration-with-gate, hook deletion), record six deferrals, confirm Success Criterion 1 end-to-end. _Requires:_ WS-6. _Rationale:_ whole-change verification gates.

## Recommended Next Step

```
/bkit-plan 381
Brief: Auto-derive provider egress allowlist from registries into a single source table, fan out to five surfaces, add provenance-based WebFetch prune. Seven workstreams (leaf module, derivation+gate, cloud paste, hook, WebFetch+prune, fan-out parity, release integration). Plan-time proof obligation: seed .bkit/version, run real install, verify webFetchDerived survives before implementing prune. Design: docs/plans/202607/logs/381-provider-egress-domains/design-v3-organised.md
```
