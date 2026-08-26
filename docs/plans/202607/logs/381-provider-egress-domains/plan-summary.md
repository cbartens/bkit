Verdict: PASS

<!-- verdict:end -->

# Plan Summary: Auto-derive provider cloud-egress domains — Split into five sub-plans

## Overview

The plan splits a 34-task single plan into five sub-plans following a 12-task complexity ceiling. Sub-plan 1 (Tasks 1–9, Phase 0 + WS-1 + WS-2) creates the egress registry leaf and derivation gate; sub-plans 2–4 (Tasks 10–25, WS-3/4/5) fan out to the five consumer surfaces in parallel; sub-plan 5 (Tasks 26–34, WS-6/7) proves cross-surface parity and ships.

**Build phase execution:** Sub-plan 1 must complete first (gates everything). Once 1 lands, sub-plans 2, 3, 4 are independent and may run in any order or in parallel. Sub-plan 5 requires all of 2, 3, and 4 complete. Dependency graph in `plan-v4-split.md` § Dependency Graph.

The split preserves all 34 tasks and 17 matrix rows lossless across five files; task numbering is continuous (1–34) but mapped to sub-plan scope sections; all gates and acceptance criteria are preserved verbatim and distributed by workstream ownership.

## Plan Quality

Well-scoped and dependency-ordered. Acceptance Scenario and Success Criteria are inherited from the passed design (with explicit ground-truth corrections for #435 Phase 1 landing). The five sub-plans' scope boundaries align on workstream seams: WS-1/2 (sub-plan 1) → WS-3/4/5 (sub-plans 2/3/4 parallel) → WS-6/7 (sub-plan 5). Each sub-plan is self-contained for its workstream: no intra-workstream task spans two sub-plans.

Sub-plan 1 includes Phase 0 (a blocking proof obligation: seed `.bkit/version`, run a real install, verify `webFetchDerived` field survives). Its pass/fail branch re-scopes sub-plan 4 (WS-5 prune) explicitly and completely, with handover instructions written into both sub-plans. Sub-plan 4 documentation carries the full conditional scope so a builder does not infer the branch.

File conflicts prevented: `.bkit/providers.md` touched by sub-plans 2, 3, 5 in disjoint line ranges (`:279`, `:277`, `:256`/`:266`/`:270-275` respectively, all named). No other cross-sub-plan file overlap. `.bkit/src/bkit-modules.ts` anchor-shift hazard from WS-1's Task 3 (deleting `OPENCODE_PROVIDER_DEFAULTS` at `:1461-1518`, 58 lines) is disclosed in three sub-plans (1, 4, 5) with resolution instructions (symbol-name lookup, never line-range greps).

## Completeness

All 34 tasks preserved lossless. Each maps to exactly one sub-plan's `Agent Execution Runbook`. All 17 matrix rows (T1–T17) distributed: sub-plan 1 owns T1/T2/T3/T5/T7; sub-plan 2 owns T9/T12/T13; sub-plan 3 owns T11; sub-plan 4 owns T8/T10/T15/T16/T17; sub-plan 5 owns T4/T6/T14 (mapping at `plan-v4-split.md` § Sub-Plan Index, table row "Matrix rows owned").

Derivation: Phase 0 (blocking proof obligation), Phase 1/WS-1 (registry leaf), Phase 2/WS-2 (derivation + gate + derived exports), Phase 3a/WS-3 (cloud paste surfaces), Phase 3b/WS-4 (Cursor hook), Phase 3c/WS-5 (WebFetch prune), Phase 4/WS-6 (fan-out proof), Phase 5/WS-7 (release integration). All phases present in exactly one sub-plan each.

Acceptance Scenario and Success Criteria inherited from design, with explicit ground-truth corrections carried forward:

1. **Criterion 1 correction:** Design named six unreachable hosts (groq, cerebras, openrouter, githubcopilot, models.dev, skills.sh). After #435 Phase 1: groq/cerebras no longer exist (providers deleted), openrouter already shipped. Live gap list is four hosts (githubcopilot, models.dev, skills.sh, tavily). Criterion wording unchanged; enumerated list corrected.
2. **Criterion 3 correction:** Design framed as "byte-equal-hash-gated"; #422 changed hook to `format: "markered-text"`, so it is now "managed-block byte-equal". Cloud paste blocks are untracked (no manifest, no hash).
3. **Criterion 4 restatement:** Inherited clause "a grant the consumer added by hand is never removed" restated as "a grant bkit never recorded writing is never removed" — bkit cannot distinguish hand-added from recorded, only unknown from recorded. Hand-added grants whose exact string was in a previous derived set **are** prunable; disclosed in advisory.

Testing: Tiers per `docs/testing.md` (Unit, Integration only; bkit has no E2E or deployed boundary for @live). All 17 matrix rows assigned target files and tier. No false-green: each row asserts an affected surface, would fail if behaviour broke.

Docs: Nine files across three sub-plans, named and scoped (plan-input.md comments 5405 / 5396630826 carry grep targets and line ranges).

## Acceptance Scenario

**Narrative:**
As a consumer, I install bkit with whatever providers I want (`--opencode=openrouter`, a GitHub tracker, the skills registry), paste the network allowlist that `.claude/cloud.md` / `.cursor/cloud.md` generates into my Claude/Cursor dashboard once, and my cloud agent reaches every host bkit configured it to call — without me hand-declaring a single provider API host. Switching or adding a provider later needs no re-paste and no edit anywhere. My own stack domains in `.agents/config.md` stay the only thing I declare, and when I remove one it actually loses its grant.

**Success Criteria:**

1. After one install and one dashboard paste, a cloud session reaches every host bkit ships configuration for — including the four hosts that are unreachable today (api.githubcopilot.com base githubcopilot.com, models.dev, skills.sh, api.tavily.com base tavily.com) — and the cloud paste block carries provider hosts even when the consumer declared no `allowed-domains`.
2. Adding or removing a provider/host source is a one-table edit: no other domain list exists in the repo, and CI fails if any of the five encoding surfaces (cloud paste, `.cursor/allowlist.json`, Claude `WebFetch`, OpenCode `curl`/`wget`, Cursor hook) misses an entry.
3. `bkit check` reports 0 writes on a clean install and a clean upgrade, for every module combination — no consumer-varying content lands in a hash-gated artifact.
4. A domain dropped from `allowed-domains`, or a host dropped from the registry, loses its `WebFetch(domain:…)` grant on the next install/upgrade; a grant bkit never recorded writing is never removed (disclose hand-added grants in advisory if their exact string collides with a derived entry).
5. Every doc that describes the allowlist states the derived-from-registry behaviour and the hook's runtime-artifact dependency, changed in the same commit as the code.

**Process Sketch:**

- **WHEN** `bkit install` / `bkit upgrade` runs → **THEN** one derived host set (all bkit registries + explicitly declared non-derivable hosts) unions with consumer `allowed-domains` and reaches all five encoding surfaces in the same pass.
- **WHEN** a provider or host source is added to `BKIT_EGRESS_SOURCES` → **THEN** every surface carries it on the next install, and no second list is edited anywhere.
- **WHEN** a registry entry yields no usable host (loopback, IP literal, empty `baseURL`) → **THEN** it contributes nothing unless it declares an explicit egress host with a recorded `reason`.
- **IF** a derived base is a multi-tenant apex or a multi-label public suffix → **THEN** CI fails in the bkit repo and nothing ships.
- **IF** `.cursor/allowlist.json` is absent or corrupt → **THEN** the Cursor hook asks on every outbound `curl`/`wget` and its message names `.cursor/allowlist.json` + `bkit install` as the fix.
- **IF** a host leaves the derived set or a consumer removes an `allowed-domains` entry → **THEN** its `WebFetch(domain:…)` grant is removed only if bkit recorded writing it; unrecorded entries survive untouched.
- **IF** a cloud session's model calls hang with no network error → **THEN** the operator compares the fingerprint printed after the paste fence against the dashboard copy and re-pastes.

**Concrete Example:**
A consumer repo with GitHub tracker and OpenRouter opencode provider installed, `.agents/config.md` `allowed-domains` block declaring `sentry.io` only, Claude Code on web in **Trusted** mode. (1) Runs `pnpm bkit install --claude --cursor --opencode=openrouter --tracker=github` → derives 15 bases from registry, unions sentry.io, writes all five surfaces. (2) Opens `.claude/cloud.md` § 2, pastes the 32-line fence (15 derived + 1 declared = 16 bases apex + wildcard) into Claude dashboard **Custom** mode, noting fingerprint after fence is not pasted. (3) Cloud `/bkit-debug` runs → `context=web` block returns search results, GitHub tracker connects. (4) Later deletes sentry.io and re-runs install → console prints removal, `.bkit/advisories.md` records grant removal, git diff shows two WebFetch lines deleted. Fingerprint unchanged, no re-paste needed.

**Edge Cases:**

- Registry entry with no derivable host (empty `baseURL`, loopback, IP literal) contributes nothing or declares explicit host with reason.
- Base collapse on multi-tenant apex (*.googleapis.com, *.amazonaws.com) or multi-label suffix (example.co.uk) fails CI at authoring time.
- MCP, package-registry, skills, agent-host, tooling-api rows have no `baseURL`; all are declared with explicit `hosts` + `bases`.
- Declared row's exact host on sibling TLD (registry.npmjs.org vs npmjs.com base) requires a `reason`.
- `.dev` / `.app` / `.run` TLDs soft-warn only, never fail; gate test asserts warned set is exactly known-accepted set.
- `.cursor/allowlist.json` absent/corrupt while hook carries no fallback list → hook asks on every URL.
- Prune with no provenance (first run after field added, hand-added grants) → prune nothing, carry forward.

**Human Confirmation:** Acceptance Scenario gate checklist appears in all five sub-plans as a single shared checkbox (sub-plan 1 is the authoritative copy; sub-plans 2–5 reference it). Not all five need independent confirmation; sub-plan 1 alone gates planning.

## Breaking Changes

**Naming — new and changed:**

- `.bkit/src/bkit-registry.ts` (NEW file, leaf, imports nothing)
- `EgressSource` type (NEW, `{ id, kind, hosts: readonly string[], bases: readonly string[], reason?: string }`)
- `BKIT_EGRESS_SOURCES` const (NEW, 13 rows)
- `MULTI_LABEL_SUFFIXES`, `MULTI_TENANT_APEXES` consts (NEW, gate denylists)
- `deriveEgressEntries(rows)` export (NEW, pure derivation)
- `BKIT_SHIPPED_NETWORK_HOSTS` export (NEW, `readonly string[]` exact hosts)
- `BKIT_SHIPPED_NETWORK_DOMAINS` (CHANGED: same name/type, hand-listed → computed constant)
- `OPENCODE_PROVIDER_DEFAULTS` (MOVED: `bkit-modules.ts` → `bkit-registry.ts`, module-private, no external call sites)

**Not breaking:**

- No CLI flag, config key, `.agents/config.md` syntax or public export removed/renamed.

**Runtime behavior changes (no API breakage):**

- Cloud paste blocks now carry 15 bases (apex + wildcard) instead of consumer-only, so "Trusted default" branch retires; consumers with zero `allowed-domains` must select **Custom** mode in Claude/Cursor dashboard.
- `.cursor/allowlist.json` artifact now carries full derived set (same 10 bases expanded → 15 bases); Cursor hook no longer embeds fallback list.
- `.bkit/templates/.claude/settings.json` WebFetch seed empties (was stale partial subset).
- `.bkit/version` gains required `webFetchDerived: string[]` field (parsed to `[]` in old payloads).
- Two Cursor hook copies (template + mirror) become byte-identical after regeneration (sub-plan 3 edit + sub-plan 5 mirror regen in one pass).
- `.bkit/src/bkit-permissions-parity.integration.test.ts:173-190` deleted (sub-plan 3, Task 17) — WS-5 prune subsumes its cross-host divergence guard as T4.

## Design Alignment

Narrative and Success Criteria are inherited verbatim from the passed design (`design-v3-organised.md`). Plan scope matches design scope: all seven workstreams (WS-1 through WS-7) from the design are present in the plan, distributed across five sub-plans. Design's Acceptance Scenario Key Edge Cases are inherited verbatim in plan's Edge Cases; plan adds plan-level cases (validation, anchor-shift hazard, file conflicts).

Three explicit ground-truth corrections carried into the plan from the 2026-08-24 re-check comment (plan-input.md comment 5396630826) because #435 Phase 1 landed after the design was written:

1. `OPENCODE_PROVIDER_DEFAULTS` is 4 keys (not 10): openrouter, ollama, opencode-zen, opencode-go. Six were deleted outright.
2. `BKIT_SHIPPED_NETWORK_DOMAINS` is 10 bases (not 13): nvidia.com / z.ai / moonshot.ai / kimi.com removed, openrouter.ai added. The derived union is 15 bases (not 19/20).
3. Design's "six named unreachable hosts" reduced to four (groq/cerebras providers deleted, openrouter already shipped). Live gaps: githubcopilot.com, models.dev, skills.sh, tavily.com.

These corrections are verified against worktree on 2026-08-26 and reflected throughout the five sub-plans and the parent split index.

## Deferred & Out-of-Scope

**Out of Scope (from design, inherited):**

- Dep-updater hosts (runner-side egress, separate concern) — _Blocking_: #381 calls for one-table edit across five surfaces; dep-updater egress is a sixth surface outside that scope.
- Bootstrap-time cloud reachability probe (new cloud session capability, separate change) — _Exempt_: genuinely additive, not required for Success Criterion 1.
- Ask-rate signal in hook (hash-gated artifact, separate review surface) — _Exempt_: Cursor performance feature, additive.
- `bkit upgrade` not writing `.bkit/advisories.md` (pre-existing parity gap) — _Exempt_: pre-existing, disclosed separately.
- Tighter OpenCode encoding (blocked by tool schema) — _Exempt_: external blocker, known limitation.

**Deferred (discovered during planning, plan-input.md amendments):**

- **Kimi-docs row disposition:** Design carried 20 rows including `kimi-docs` (docs host, not API host). #435 deliberately deleted kimi.com from all five copies. Plan carries two open questions:
  - **Open Question 1:** Does the `kimi-docs` row survive? (reverses or respects `opencode-provider-allowlist-cut-to-four` decision). → Options: A (drop row + docs kind), B (drop row, keep kind for future), C (keep row, re-add kimi.com). Affects task 7 (test completeness). Deferred to Phase 0 human gate.
  - **Open Question 2:** Is `registry.npmjs.org` exact host sufficient or must `npmjs.com` base cover both? → Recommended: base alone is sufficient (exact host matters only for Cursor's non-wildcarded list). Affects task 2 (declared row shape). Deferred to Phase 0 human gate.

**Phase 0 blocking proof obligation:** Seed `.bkit/version` in a tmp dir, run a real install, read the file back to confirm `webFetchDerived` survives. If it does not, WS-5 prune is re-scoped before build starts (Success Criterion 4 reported NOT MET).

## Suggested Scope Expansion

None. The split itself is a response to the complexity ceiling (34 tasks vs 12-task limit), not an additive scope expansion. Three brainstorms (design phase) proposed 11 approaches; the design kept 4, merged 1, rejected 6 with stated reasons. Plan inherits those decisions unchanged.

## Risks

**HIGH:**

1. **Cloud allowlist is human-pasted once; no detection of stale paste** — symptom: opaque model-call timeout. Mitigation: static list (rarely changes), 8-hex fingerprint after fence, operator runbook sentence in both cloud templates, triage note in docs/providers.md.
2. **`.bkit/version` regeneration missed ships drift to all consumers** — mitigation: test T6 (hook byte-parity regression guard) + clean `bkit check` on dogfood as release gate.

**MEDIUM:** 3. **Grant removal scrolls off console unnoticed** — mitigation: advisory into `.bkit/advisories.md` naming removed strings + re-declare path. Residual: upgrade does not write advisories artifact today. 4. **Future `.bkit/version` field addition re-breaks provenance** — mitigation: test T17 (provenance-survives-install) asserts field survives real install; ground-truth table records install vs upgrade asymmetry. 5. **Moving `OPENCODE_PROVIDER_DEFAULTS`** — mitigation: module-private const, one import line, verified no external call sites. Relocation cost is minimal. 6. **Denylist rot (future provider on unknown multi-tenant apex)** — mitigation: gate test asserts warned set is exactly known-accepted set; invariant recorded.

**LOW:** 7. **Stale slop-scan reason prose** (sub-plan 3, Task 16) — mitigation: rewrite in same commit. 8. **Scale at 10x providers** — mitigation: not a perf concern (host check sub-ms), real limit is undocumented dashboard field caps. Probe before fan-out grows beyond 10x, not a blocker now.

## Action Items

None. All four CRITICAL concerns from design round-1 review were resolved in design round-2:

1. `.bkit/version` write path resolved via `ModuleContext` threading (sub-plan 4, Tasks 20–21).
2. `EgressSource` type reshaped to `bases: readonly string[]` (array not scalar) with atomic (non-composite) ids.
3. Fingerprint placement moved outside fence (sub-plan 2, Task 12).
4. Prune safety claim restated honestly with explicit recording contract (sub-plan 4, Task 23).

All OPTIONAL items from design were deliberately deferred to planning and are now Open Questions 1 and 2 (sub-plan 1, human gate).

## Outstanding Questions

- **Open Question 1:** Does the `kimi-docs` row survive, given #435 deliberately removed `kimi.com` from all five copies?
  - **Options:** A — Drop row and `docs` variant from `EgressSource["kind"]` · B — Drop row, keep `docs` kind for future · C — Keep row, re-add `kimi.com` to every surface.
  - **Recommended:** A (respects #435 decision, simplifies).
  - **Default if unanswered:** A.

- **Open Question 2:** Should `registry.npmjs.org` be the declared host for `pkg-npm` row, or is `npmjs.com` alone sufficient?
  - **Options:** A — Base `npmjs.com` covers both · B — Declare exact host `registry.npmjs.org` for Cursor non-wildcarded list.
  - **Recommended:** A (base covers both; exact host matters only for Cursor's non-wildcarded list; decide in WS-1 based on whether consumers call that specific subdomain from cloud agents — likely not).
  - **Default if unanswered:** A.

- **Open Question 3:** Are `console.anthropic.com` / `api.cursor.com` reachable-from-cloud requirements or docs-only hosts?
  - **Options:** A — Feed back into WS-1's `hosts` column if resolved before ship · B — Defer to next cycle.
  - **Recommended:** A.
  - **Default if unanswered:** B.

- **Open Question 4:** Is there a practical upper bound on Claude-web / Cursor "Allowed domains" dashboard field?
  - **Options:** A — ~19 bases = ~38 lines today, far from any plausible cap · B — Probe before fan-out grows beyond 10x providers, not a blocker now.
  - **Recommended:** B.
  - **Default if unanswered:** B.

- **Open Question 5:** #435 Phase 1 landed while this plan was in flight, cutting the opencode provider allowlist from 10 to 4. Should the plan's anchor-shift hazard (`.bkit/src/bkit-modules.ts:1461-1518` deletion) be re-verified before build starts?
  - **Options:** A — Yes, verify Task 3 (WS-1) landed first before any post-`:1461` work in sub-plans 4 and 5 · B — No, the plan's symbol-name resolution strategy suffices.
  - **Recommended:** A (sequencing choice: sub-plan 1 must land and CI must be green before sub-plans 4 and 5 touch `bkit-modules.ts` downstream from the move).
  - **Default if unanswered:** A. (Dispositioned in sub-plan 5, Task 33 PR body.)

## Recommended Next Step

`/bkit-build 381`

**Brief:** Five lossless sub-plans from a 34-task single plan, split on 12-task complexity ceiling. Sub-plan 1 (Tasks 1–9, Phase 0 proof obligation + WS-1 + WS-2) gates all; sub-plans 2–4 (Tasks 10–25, WS-3/4/5) run in parallel once 1 lands; sub-plan 5 (Tasks 26–34, WS-6/7) ships. Dependency graph in `plan-v4-split.md`. Ground truth verified 2026-08-26 against #435 Phase 1 (registry 13 rows, derived union 15 bases, four live gaps). Build phase consumes five sub-plan files, not one. [plan-v4-split.md](plan-v4-split.md)
