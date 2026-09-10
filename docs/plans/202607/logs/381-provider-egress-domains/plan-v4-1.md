<!-- bkit:anchor
baseSha: 607d7507a76c8c10eb56135c328e3daec0ed6a69
baseRef: origin/dev
designPath: docs/plans/202607/381-provider-egress-domains-design.md
designBaseSha:
-->

# Provider cloud-egress derivation — Sub-Plan 1: proof obligation, registry leaf, derivation and gate

**Parent Plan:** [`plan-v4-split.md`](plan-v4-split.md)

> [!CAUTION]
> **CRITICAL:** Do not hallucinate plan execution state.
>
> 1. Read this sub-plan natively ONCE at session start. Do NOT re-read on every loop iteration.
> 2. NEVER trust session memory or previous conversation history.
> 3. Source of truth = literal `[x]` vs `[ ]` checkboxes in this document. `[ ]` = NOT DONE regardless of conversation context.

## Scope & Dependency Position

**This sub-plan covers Tasks 1–9:** Phase 0 (blocking proof obligation), Phase 1 / WS-1 (egress registry leaf), Phase 2 / WS-2 (derivation, gate, derived exports). Matrix rows owned: **T1, T2, T3, T5, T7**.

**Requires:** nothing. This is the dependency root.

**Gates:** everything. Sub-plans 2 (WS-3 cloud paste), 3 (WS-4 Cursor hook), 4 (WS-5 prune) and 5 (WS-6 + WS-7) are all unbuildable until `BKIT_EGRESS_SOURCES`, `deriveEgressEntries`, the recomputed `BKIT_SHIPPED_NETWORK_DOMAINS` and the new `BKIT_SHIPPED_NETWORK_HOSTS` exist in this repo.

> [!CAUTION]
> **Task 1's outcome re-scopes sub-plan 4 (WS-5) entirely, and the decision is made HERE, once, before any other workstream starts.**
>
> - **Task 1 green** → sub-plan 4 runs at full scope: Tasks 19, 20, 21, 22, 23, 24, 25 and matrix rows T8, T10, T15, T16, T17.
> - **Task 1 red** → execute Task 1's five-step STOP path in full, then hand over. Sub-plan 4 degrades to **Task 22 only** (plus a reduced Task 28 in sub-plan 5 with its provenance clause dropped); Tasks 19, 20, 21, 23, 24 and matrix rows T8, T10, T15 are dropped, and **Success Criterion 4 is reported as NOT MET** rather than allowed to read as met. Sub-plans 2, 3 and 5 remain buildable in full.
>
> The handover to sub-plans 2–5 must state which branch was taken. Do not let a downstream builder infer it.

**Parallel-viability of what follows:** once this sub-plan is complete, sub-plans 2, 3 and 4 are independent of one another and may run in any order or in parallel. Sub-plan 5 requires all three.

## Context & Goals

bkit's network allowlist is fragmented across five encoding surfaces and maintained by hand in two places that only a comment holds together. `BKIT_SHIPPED_NETWORK_DOMAINS` (`.bkit/src/bkit-cloud-env.ts:471-482`, 10 bases) is hand-typed and duplicated verbatim into `SHIPPED_NETWORK_BASES` (`.bkit/templates/.cursor/hooks/guardrails.cjs:115-126` + its `.cursor/` mirror), with a third partial copy in `.bkit/templates/.claude/settings.json:10-22`. Separately, the two cloud paste renderers read the **consumer's** `allowed-domains` alone (`renderCloudNetworkAllowlist` at `:543-544`, `renderCursorNetworkAllowlist` at `:643-644`) while local host permissions merge the shipped defaults (`resolveNetworkAllowlist` at `:502-503`) — so a host bkit ships configuration for is reachable locally and unreachable from a cloud agent session.

Both defects are already live. `api.githubcopilot.com`, `models.dev`, `skills.sh` and `tavily.com` are in **no** shipped list. This change derives one table of egress sources from bkit's own registries (`.bkit/src/bkit-registry.ts`, new leaf), computes the shipped base and host sets from it, fans them out to all five surfaces in the same install pass, deletes both hand-maintained copies, and adds a `webFetchDerived` provenance record to `.bkit/version`.

**This sub-plan builds the source of truth and its gate.** Nothing here reaches a consumer surface — the fan-out is sub-plans 2–5.

> [!WARNING]
> **The parent design's ground truth drifted twice.** It was written 2026-07-29, amended 2026-08-03, re-checked 2026-08-24. Since that re-check, **#435 Phase 1** landed (`docs/decisions.jsonl` key `opencode-provider-allowlist-cut-to-four`) and moved the two facts the design's row table is built on. Every citation in this sub-plan was re-verified against the worktree on 2026-08-26; where it conflicts with the design or the re-check comment, **this plan is correct**. The two structural moves:
>
> 1. `OPENCODE_PROVIDER_DEFAULTS` (`.bkit/src/bkit-modules.ts:1461-1518`) is **4 keys**, not 10: `openrouter`, `ollama`, `opencode-zen`, `opencode-go`. `ollama-local`, `nvidia`, `groq`, `cerebras`, `zai`, `moonshot` were deleted outright.
> 2. `BKIT_SHIPPED_NETWORK_DOMAINS` is **10 bases**, not 13: `nvidia.com` / `z.ai` / `moonshot.ai` / `kimi.com` removed, `openrouter.ai` added — in all five copies.
>
> Consequences: the registry is **13 rows**, not 20; the derived union is **15 bases**, not 19/20; two of the design's six named live gaps (`groq.com`, `cerebras.ai`) no longer exist and a third (`openrouter.ai`) is already shipped; and the `kimi-docs` row is dropped rather than re-added (Open Question 1).
>
> **15 is the derived-union count everywhere in this plan.** It is today's 10 plus `githubcopilot.com`, `models.dev`, `npmjs.org`, `skills.sh`, `tavily.com`. `npmjs.org` is the fifteenth and exists only because Open Question 2 resolves to option A; a builder who anchors on 14 drops it and Open Question 2's `reason` invariant becomes unmotivated. Any "14" surviving anywhere in this document is a defect, not an alternative reading.

**Related Issues:** #381 (parent), #394 (landed the tooling ∪ consumer union and the three per-host encodings; its two carried-forward items are in scope), #376 (source of the "registrable base, not raw subdomain" direction), #419 (`context=web` debug-fetch block), #422 (`564dfb53`, flipped the hook to `markered-text`), #435 (Phase 1 landed; Open Question 5 records the sequencing risk).

---

## 👤 ⚠️ Acceptance Scenario — HUMAN REVIEW REQUIRED

> [!CAUTION]
> **🛑 HUMAN MUST READ AND CONFIRM THIS SECTION.**
> This is the testable contract for the feature. Everything below — implementation, tests, verification — is derived from what you confirm here. If this is wrong, everything downstream is wrong.
>
> **You only need 👤-marked sections** (Acceptance Scenario, Breaking Changes, Open Questions & Assumptions). Agent handles rest.
>
> This is the **same single plan-level confirmation** carried by all five sub-plans, not five separate ones.

### Spec — what good looks like _(canonical for the plan phase)_

> [!IMPORTANT]
> Subagents (plan generate, plan review, plan summary) MUST follow this spec. No plan subagent restates rules; this section = single source of truth for the plan.

- **Narrative:** 1–2 sentences, user POV (not system POV). Describes what the user does and what they get back.
- **Success Criteria:** <=5 bullets, each measurable / testable. Outcomes, NOT implementation steps.
- **Process Sketch _(design produces; plan inherits / refines)_:** the SAME happy-path scenario (`Concrete Example`) and branches (`Edge Cases`) rendered as a glanceable `WHEN X → THEN Y` flow — process, NOT prose; reuse those exact examples, do NOT invent new ones. 3–7 lines.
- **Key Edge Cases _(design phase produces; plan phase inherits)_:** Design-shaping only — concurrency, conflict resolution, failure modes, cross-feature interactions.
- **Edge Cases _(plan phase)_:** Inherits design's Key Edge Cases verbatim + adds plan-level cases.
- **Concrete Example _(plan phase only)_:** Specific user role + starting state + numbered steps + observable outcome. One scenario, not a list.
- **Derived Test Matrix _(plan phase only)_:** One row per testable behaviour. Each row → exactly one task in the Agent Execution Runbook. No row without a target file.

### Narrative _(inherited from design — do not rewrite)_

As a consumer, I install bkit with whatever providers I want (`--opencode=openrouter`, a GitHub tracker, the skills registry), paste the network allowlist that `.claude/cloud.md` / `.cursor/cloud.md` generates into my Claude/Cursor dashboard once, and my cloud agent reaches every host bkit configured it to call — without me hand-declaring a single provider API host. Switching or adding a provider later needs no re-paste and no edit anywhere. My own stack domains in `.agents/config.md` stay the only thing I declare, and when I remove one it actually loses its grant.

### Success Criteria _(inherited from design — do not rewrite)_

1. After one install and one dashboard paste, a cloud session reaches every host bkit ships configuration for — including the hosts that are unreachable today — and the cloud paste block carries provider hosts even when the consumer declared no `allowed-domains`.
2. Adding or removing a provider/host source is a one-table edit: no other domain list exists in the repo, and CI fails if any of the five encoding surfaces (cloud paste, `.cursor/allowlist.json`, Claude `WebFetch`, OpenCode `curl`/`wget`, Cursor hook) misses an entry.
3. `bkit check` reports 0 writes on a clean install and a clean upgrade, for every module combination — no consumer-varying content lands in a hash-gated artifact.
4. A domain dropped from `allowed-domains`, or a host dropped from the registry, loses its `WebFetch(domain:…)` grant on the next install/upgrade; a grant the consumer added by hand is never removed.
5. Every doc that describes the allowlist states the derived-from-registry behaviour and the hook's runtime-artifact dependency, changed in the same commit as the code.

> [!IMPORTANT]
> **Ground-truth correction to Criterion 1, verified 2026-08-26 — human please confirm.** The design named six unreachable hosts: `groq.com`, `cerebras.ai`, `openrouter.ai`, `githubcopilot.com`, `models.dev`, `skills.sh`. After #435 Phase 1 the first two belong to providers that no longer exist and the third is already shipped (`.bkit/src/bkit-cloud-env.ts:480`). The live gap list this plan is accountable for is **four hosts**: `api.githubcopilot.com` (base `githubcopilot.com`), `models.dev`, `skills.sh`, `api.tavily.com` (base `tavily.com`). Criterion-1 wording is unchanged; only the enumerated host list is corrected. Verification tasks assert the four.
>
> Criterion 3's "byte-equal-hash-gated" is restated as "hash-gated": `.cursor/hooks/guardrails.cjs` became `format: "markered-text"` in #422 (`.bkit/src/bkit-manifest.ts:554-559`). The **managed block** is still byte-equal (`bkit-manifest.ts:19`) and `SHIPPED_NETWORK_BASES` sits at `guardrails.cjs:115`, inside the block (`// bkit:start` `:22` … `// bkit:end` `:258`), so install-state-varying content there still breaks `bkit check` for every consumer. The constraint holds; the "whole-file byte-equal" framing does not.
>
> **Criterion 4's second clause is restated, because the plan cannot deliver it as inherited.** "a grant the consumer added by hand is never removed" is false as written. `permissions.allow` carries no provenance, so bkit cannot distinguish a hand-added grant from one it wrote. The deliverable clause is: **a grant bkit never recorded writing is never removed.** A hand-added grant whose exact string was also in bkit's derived set at the moment of a previous recording run **is** prunable, is disclosed in the advisory `detect` text, and is recoverable by re-declaring the apex. Confirm this restatement, not the inherited wording.
>
> **Criterion 4 is scoped to the Claude `WebFetch` surface only.** The OpenCode `permission.bash` `curl *{base}*` / `wget *{base}*` grants are never revoked on any path. This change adds ten more such keys per consumer and does not close that gap; it discloses it and defers it.

### Process Sketch _(inherited from design — plan may refine)_

- **WHEN** `bkit install` / `bkit upgrade` runs **→ THEN** one derived host set (all bkit registries + explicitly declared non-derivable hosts) unions with consumer `allowed-domains` and reaches all five encoding surfaces in the same pass.
- **WHEN** a provider or host source is added to `BKIT_EGRESS_SOURCES` **→ THEN** every surface carries it on the next install, and no second list is edited anywhere.
- **WHEN** a registry entry yields no usable host (loopback, IP literal, empty `baseURL`) **→ THEN** it contributes nothing unless it declares an explicit egress host with a recorded `reason`.
- **IF** a derived base is a multi-tenant apex or a multi-label public suffix **→ THEN** CI fails in the bkit repo and nothing ships.
- **IF** `.cursor/allowlist.json` is absent or corrupt **→ THEN** the Cursor hook asks on every outbound `curl`/`wget` and its message names `.cursor/allowlist.json` + `bkit install` as the fix.
- **IF** a host leaves the derived set or a consumer removes an `allowed-domains` entry **→ THEN** its `WebFetch(domain:…)` grant is removed only if bkit recorded writing it; unrecorded entries survive untouched.
- **IF** a cloud session's model calls hang with no network error **→ THEN** the operator compares the fingerprint printed after the paste fence against the dashboard copy and re-pastes.

### Concrete Example _(plan expands from design)_

**Setup:** A consumer repo with the GitHub tracker and the OpenRouter opencode provider installed, an `.agents/config.md` `allowed-domains` block declaring exactly `sentry.io`, and a Claude Code on the web environment whose network mode is **Trusted** (the current default guidance). Cloud `/bkit-debug` runs return no external evidence: the shipped `context=web` block prints `HTTP 000` and the GitHub MCP tracker cannot reach `api.githubcopilot.com`.

**Steps:**

1. Consumer runs `pnpm bkit install --claude --cursor --opencode=openrouter --tracker=github` → bkit derives 15 bases from `BKIT_EGRESS_SOURCES`, unions `sentry.io`, and writes all five surfaces in one pass.
2. Consumer opens `.claude/cloud.md` § 2 Network access → the doc says set **Custom** and tick **Also include default list of common package managers** (which EXTENDS the trusted defaults rather than replacing them), and the fenced block lists 32 lines — **15 derived bases + the 1 declared `sentry.io` = 16 bases, each as apex + `*.`** — including `githubcopilot.com`, `models.dev`, `skills.sh`, `tavily.com` and `sentry.io`, none of which the consumer declared except the last. The 16 here is 15 + 1, not a competing derived-union count.
3. Consumer pastes the fence content verbatim into the Claude dashboard "Allowed domains" field and selects **Custom**. The italic line _after_ the fence reads `… Allowlist fingerprint: a1b2c3d4.` and is not part of the paste.
4. Consumer runs cloud `/bkit-debug` → the `context=web` block returns search results instead of `HTTP 000`, and the GitHub tracker MCP connects.
5. Consumer later deletes `sentry.io` from `allowed-domains` and re-runs `pnpm bkit install` → console prints one removal line, `.bkit/advisories.md` carries a `webfetch-grants-pruned` finding naming `WebFetch(domain:sentry.io)` and `WebFetch(domain:*.sentry.io)`, and `git diff .claude/settings.json` shows exactly those two lines deleted. The fingerprint is unchanged, so no re-paste is prompted.

**Outcome:** One install, one paste. Every host bkit configured an agent to call is reachable from cloud, the consumer hand-declared none of them, and removing their own declared domain actually revoked its grant with a durable record of what was revoked.

### Edge Cases _(this sub-plan's share — registry and derivation)_

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| _(design)_ Registry entry with no derivable host — empty `baseURL` on `opencode-zen` / `opencode-go` | Proposer contributes nothing; the row must declare `bases` + `hosts` + a `reason`. Never `""`, never `localhost`, never an IP literal. |
| _(design)_ Base collapse landing on a multi-tenant apex or multi-label public suffix (`*.googleapis.com`, `example.co.uk`) | Gate fails the unit suite in the bkit repo at authoring time. Nothing ships. |
| _(design)_ Host no `baseURL` can yield — MCP, package-registry, skills, agent-host, tooling-api | Declared row with explicit `hosts` + `bases`; `kind` carries no behaviour, only `opencode-provider` derives. |
| _(plan)_ A declared row's exact host sits on a sibling TLD its base cannot cover (`registry.npmjs.org` vs `npmjs.com`) | The suffix invariant is asserted over **derived** rows only; a declared row whose `hosts` are not covered by its `bases` must carry a `reason`. See Open Question 2. |
| _(plan)_ Derived base sits on a `.dev` / `.app` / `.run` TLD (`models.dev` today) | Soft warning only, never a build failure. The gate test asserts the warned set is exactly the known-accepted set, so a new one surfaces as a diff. |

### Derived Test Matrix _(rows owned by this sub-plan)_

> Tiers per `docs/testing.md` § Tiers: bkit has **Unit** (`*.test.ts`) and **Integration** (`*.integration.test.ts`) only — no E2E project and no deployed boundary, so no `@live` row is available or appropriate. Rows that cross the real install boundary are Integration with no mocks at that boundary; `docs/testing.md:323` forbids mocking `fs`.

<!-- prettier-ignore -->
| Test description | Type | Target file |
| --- | --- | --- |
| **T1** Completeness: exactly one `opencode-provider` row per `Object.keys(OPENCODE_PROVIDER_DEFAULTS)` key; every row has non-empty `bases` **or** a `reason`; every row with non-empty `bases` has non-empty `hosts`; every `id` unique; `ISSUE_TRACKERS` / `DEP_UPDATERS` iterated with the literal `"none"` skipped **and** the test asserting `"none"` was the only skip | Unit (Vitest) | `.bkit/src/bkit-cloud-env.test.ts` |
| **T2** Suffix invariant on derived rows: `host === base \|\| host.endsWith("." + base)` and `host === new URL(baseURL).hostname` for every `opencode-provider` row; a declared row whose `hosts` are not covered by its `bases` carries a `reason` | Unit (Vitest) | `.bkit/src/bkit-cloud-env.test.ts` |
| **T3** Anti-widening gate: no derived base in `MULTI_TENANT_APEXES` / `MULTI_LABEL_SUFFIXES`, every base `>= 2` labels, no IP literal, no `localhost`; the `.dev`/`.app`/`.run` soft-warn set equals the known-accepted set exactly | Unit (Vitest) | `.bkit/src/bkit-cloud-env.test.ts` |
| **T5** Injected-source: `deriveEgressEntries(fixtureRows)` with a synthetic row yields the synthetic base/host in its output, and every `bkit-cloud-env.ts` surface fed that output (cloud paste fence, Cursor exact-host block, `.cursor/allowlist.json` body, `networkAllowlistBases`) carries it — no `vi.mock`, asserted against the exported derivation rather than a hardcoded literal. The two `bkit-modules.ts` encoders are covered by T4, which is the only tier that can reach them | Unit (Vitest) | `.bkit/src/bkit-cloud-env.test.ts` |
| **T7** Negative / rejection-channel: both gateway rows contribute `opencode.ai` + `models.dev` and never `""`; a malformed `baseURL` yields no row without throwing; `https://1.2.3.4:8080/v1` and `https://[::1]/v1` are **silent proposer** rejections (contribute nothing, no throw); `https://api.pages.dev/v1` and `https://x.example.co.uk/v1` are **gate** rejections (test-red); `http://localhost:11434/v1` contributes nothing | Unit (Vitest) | `.bkit/src/bkit-cloud-env.test.ts` |

**Rows owned elsewhere, listed so this sub-plan does not invent them:** T9, T12, T13 (WS-3) · T11 (WS-4) · T8, T10, T15, T16, T17 (WS-5) · T4, T6, T14 (WS-6/WS-7). Do **not** write any of those here — T5's own text records that the two `bkit-modules.ts` encoders are T4's job, not T5's.

### 👤 ✅ Human Confirmation

- [ ] **Acceptance Scenario confirmed:** I have reviewed the Narrative, Success Criteria, Process Sketch, Concrete Example, Edge Cases, and Derived Test Matrix above. They correctly describe what "done" looks like.

> [!CAUTION]
> **Agent:** Do NOT pass Gate 1 until this checkbox is `[x]`. Summary must issue `REVISE` if unchecked.

---

## 👤 ⚠️ Breaking Changes & Naming Review — HUMAN REVIEW REQUIRED

> [!CAUTION]
> **🛑 HUMAN MUST READ AND CONFIRM THIS SECTION.**
> Review proposed names and breaking changes below.

**Naming — new and changed symbols owned by this sub-plan**

<!-- prettier-ignore -->
| Name | Kind | Where | Note |
| --- | --- | --- | --- |
| `.bkit/src/bkit-registry.ts` | NEW file | leaf, imports nothing | Only `[NEW]` artifact. Justified in `Architecture & Component Changes` — the cycle `bkit-modules.ts` → `bkit-cloud-env.ts` → registry is unsurvivable without a leaf, and `package.json:58` pins the unit-coverage lane to a literal file list, so the leaf must stay branch-free. |
| `EgressSource` | NEW type | `bkit-registry.ts` | `{ id, kind, hosts: readonly string[], bases: readonly string[], reason?: string }`. `bases` is a LIST, `id` is ATOMIC (never composite) — both forced by the completeness test keying on `id === key`. |
| `BKIT_EGRESS_SOURCES` | NEW const | `bkit-registry.ts` | 13 rows (Open Question 1 = A). |
| `MULTI_LABEL_SUFFIXES`, `MULTI_TENANT_APEXES` | NEW consts | `bkit-registry.ts` | Gate denylists, held as data. |
| `deriveEgressEntries(rows)` | NEW export | `bkit-cloud-env.ts` | Pure; exported so T5 can drive fixture rows with no `vi.mock`. |
| `BKIT_SHIPPED_NETWORK_HOSTS` | NEW export | `bkit-cloud-env.ts` | `readonly string[]`, exact hosts. Single consumer: `renderCursorNetworkAllowlist`. |
| `BKIT_SHIPPED_NETWORK_DOMAINS` | CHANGED | `bkit-cloud-env.ts:471-482` | **Same name, same `readonly string[]` type** — hand-listed literal becomes a module-init computed constant. No signature change, so `resolveNetworkAllowlist` and its four downstreams are untouched. |
| `OPENCODE_PROVIDER_DEFAULTS` | MOVED | `bkit-modules.ts:1461-1518` → `bkit-registry.ts` | Module-private `const`, 4 in-file call sites (`:1526`, `:1536`, `:1659`, `:1995`). Relocation plus one import line; **no external call site, no test import, no public API change.** |

**Not breaking, stated to pre-empt the question:** no CLI flag, no config key, no `.agents/config.md` syntax and no public export is renamed or removed by this sub-plan.

### 👤 ✅ Human Confirmation

- [ ] **Breaking Changes confirmed:** I have reviewed all breaking changes and naming decisions above.

> [!CAUTION]
> **Agent:** Do NOT pass Gate 1 until this checkbox is `[x]`. Summary must issue `REVISE` if unchecked.

---

## 👤 ⚠️ Open Questions & Assumptions — HUMAN REVIEW REQUIRED

> [!CAUTION]
> **🛑 HUMAN MUST READ AND CONFIRM THIS SECTION.**
> Unknowns needing a decision, and assumptions this sub-plan relies on. Each unresolved question is a risk — a wrong assumption breaks everything downstream.

**Assumptions**

- **Assumption:** The 4-key `OPENCODE_PROVIDER_DEFAULTS` and the 10-base shipped list are the shape this change builds on, not a transient state mid-#435. → If #435 Phase 2 lands a different provider registry shape while this is in flight, WS-1's move and the completeness test key on a set that no longer exists and WS-1/WS-2 need rebasing.
- **Assumption:** The derived union (15 bases) is a strict **superset** of today's shipped 10, so no existing grant is lost and the first prune has nothing to remove. Verified base-by-base against `.bkit/src/bkit-cloud-env.ts:471-482`: all ten of `github.com`, `githubusercontent.com`, `anthropic.com`, `claude.com`, `cursor.com`, `linear.app`, `opencode.ai`, `ollama.com`, `openrouter.ai`, `npmjs.com` appear in the 15. → If a base were dropped instead, the first post-record install would revoke a live grant.

**Open Questions**

- **Open Question 1:** Does the `kimi-docs` row survive, given #435 deliberately removed `kimi.com` from all five copies? → Human decision; reverses or respects `docs/decisions.jsonl` key `opencode-provider-allowlist-cut-to-four` (status `ACTIVE`).
  - **Options:** A — Drop the row **and** the `docs` variant from `EgressSource["kind"]`; the registry ships 13 rows and 6 kinds · B — Drop the row, keep the `docs` kind for a future docs-only host · C — Keep the row, re-adding `kimi.com` to every surface.
  - **Recommended:** A — #435 removed Moonshot/Kimi from the product; re-adding the host reverses an ACTIVE decision, and a `kind` with zero rows is speculative scope (`.agents/rules.md` § No speculative scope).
  - **Default if unanswered:** A.

- **Open Question 2:** What does the `pkg-npm` row declare, given `registry.npmjs.org` is on a sibling TLD its base `npmjs.com` cannot cover on a label boundary? → Decide in WS-1; affects the Cursor exact-host surface and cloud egress for `npm install`.
  - **Options:** A — `hosts: ["registry.npmjs.org"]`, `bases: ["npmjs.com", "npmjs.org"]` + `reason` recording the sibling TLD · B — `hosts: ["registry.npmjs.org"]`, `bases: ["npmjs.com"]` + `reason`, and scope the host-covered-by-base check to derived rows only (Cursor emits a host no base covers; Claude/OpenCode never grant `npmjs.org`) · C — `hosts: ["www.npmjs.com"]`, `bases: ["npmjs.com"]` — narrow, but then bkit emits no host the registry API actually uses.
  - **Recommended:** A — the Cursor cloud list is emitted verbatim, so a host with no matching base is exactly the silent-narrowing shape the design's `kimi-docs` invariant exists to stop; `npmjs.org` is single-tenant and adds one base.
  - **Default if unanswered:** A.

- **Open Question 3:** Does an opencode built-in gateway session actually contact `models.dev`? → Settle by running an `opencode-zen` session with the host blocked; cheap either way, not a blocker.
  - **Options:** A — Keep `models.dev` on both gateway rows pending verification · B — Drop it until proven, accepting that a gateway session may fail to resolve its catalog in cloud · C — Keep it and open a follow-up to probe.
  - **Recommended:** A — omitting it breaks `opencode-zen`/`opencode-go` in cloud if the call is real; including it is a two-label widening onto a single-tenant apex. `.bkit/prompts.md:226-228` states catalogs come from models.dev, which is the strongest evidence available without a live run.
  - **Default if unanswered:** A.

- **Open Question 4:** Are `console.anthropic.com` and `api.cursor.com` reachable-from-cloud requirements, or docs-only? → Affects only the `hosts` column, which the Cursor cloud renderer emits verbatim; the bases `anthropic.com` / `cursor.com` ship either way.
  - **Options:** A — Declare both as `hosts` on `agent-claude` / `agent-cursor` · B — Declare neither and give those rows `hosts` equal to their bases (`anthropic.com`, `cursor.com`) · C — Split each into an `agent-host` row plus a `docs` row.
  - **Recommended:** A — both are the vendor's own API host for the agent bkit configures; the base already grants them on every other surface, so the only delta is one extra line in the Cursor paste.
  - **Default if unanswered:** A.

- **Open Question 5:** Does this change land before, after, or interleaved with #435 Phase 2? → Human/sequencing decision; #435 Phase 1 already moved both facts WS-1 is built on, and `docs/deferrals.jsonl` key `381-provider-registry-key-mirror-consolidation` names `.bkit/src/bkit-registry.ts` as this change's artifact.
  - **Options:** A — Land this first; #435 Phase 2 then restructures a registry that already has one home · B — Wait for #435 Phase 2 and rebase WS-1/WS-2 onto whatever registry shape it lands · C — Coordinate: this change creates the leaf, #435 Phase 2 moves its own key maps into it.
  - **Recommended:** A — WS-1 relocates a module-private symbol and adds a leaf with no importers other than `bkit-cloud-env.ts` / `bkit-modules.ts`; a later restructure inherits a single home instead of creating one. Waiting leaves four live egress gaps unfixed for the duration.
  - **Default if unanswered:** A.

### 👤 ✅ Human Confirmation

- [ ] **Open Questions & Assumptions confirmed:** I have resolved or explicitly accepted every open question and assumption above.

> [!CAUTION]
> **Agent:** Do NOT pass Gate 1 until this checkbox is `[x]`. Summary must issue `REVISE` if unchecked.

---

## Out of Scope _(this sub-plan's share)_

<!-- prettier-ignore -->
| Excluded item | Why `Exempt` | Where it belongs |
| --- | --- | --- |
| Consolidating the opencode provider **key-set** mirrors (`bkit-cli.ts`, `bkit-install.ts` column maps, the two Models doc tables) | Genuinely additive: this issue is scoped to egress **hosts**. The key-set duplication is a separate list with a separate parity test, and folding it in would double the change's blast radius across the CLI surface. | Already recorded — `docs/deferrals.jsonl` key `381-provider-registry-key-mirror-consolidation`. No new row. |
| The #435 Phase 2 IDE-vs-model-provider restructure | Genuinely additive: a different issue's architecture. This plan builds on the post-Phase-1 shape and records the sequencing choice as Open Question 5. | #435. No deferral row — it is an open issue with its own plan. |

> [!CAUTION]
> **Default = in-scope.** Both rows above are genuinely-additive: neither is required by a `Success Criteria` bullet, a `Derived Test Matrix` row, or an Architecture change in this sub-plan.

## Security & Privacy

> Reference: `docs/security.md`. Check all that apply; skip inapplicable rows.

- [ ] **User Input** — validated by a schema with `parse()` called in the handler? → **Applies, adapted.** `BKIT_EGRESS_SOURCES` is bkit-authored data, not user input, but the derived bases are an **egress allowlist** and a wrong one widens every consumer's reach. The validator is the WS-2 gate (T3): a derived base that is a multi-tenant apex, a multi-label public suffix, an IP literal, `localhost`, or has fewer than 2 labels fails the unit suite in the bkit repo and never ships. Consumer `allowed-domains` input reaches `expandAllowedDomains` unchanged by this plan.
- [ ] **New Secret/Env Var** — added to the env schema? → **N/A.** No new secret, no new env var, no new credential read. Reachability is not a credential: an egress allowlist gates which hosts a session may contact, not what it may authenticate as.

**Deliberate widening, disclosed rather than implied.** This change adds five bases to the shipped set (`githubcopilot.com`, `models.dev`, `npmjs.org`, `skills.sh`, `tavily.com`) and removes none. Two consequences are accepted knowingly and stated in `.bkit/providers.md` in the same commit (by WS-6, sub-plan 5):

1. Each added base is one more `endsWith("." + base)` a lookalike host can aim at in the Cursor hook. Mitigated by the hook's label-boundary match and userinfo/port stripping (`guardrails.cjs:156-177`) — `github.com.attacker.io` and `https://github.com@evil.tld/x` both still ask.
2. Each added base is one more **substring** `curl *{base}*` glob on OpenCode, where a query parameter defeats the check (`curl https://evil.tld/?x=openrouter.ai` is allowed on OpenCode and asked on Cursor). Inherent to OpenCode's command-glob permission model; documented, and the fix is a recorded deferral.

_No new routes, no DB writes, no secrets, no new user-input handler._

## 🚨 Pre-Flight / Dependencies 🚨

**CRITICAL:** Check off ALL core items. Check conditional items only when applicable. Abort if anything required is missing.

### Core _(always verify)_

- [ ] **Package Management:** No new runtime dependency. `psl` / `tldts` were rejected; the denylists ship as data in the leaf. Confirm `pnpm install --frozen-lockfile` is clean and `pnpm-lock.yaml` is untouched by this change.
- [ ] **Dependency Versions:** `package.json:28-29` pins `engines.node >= 20`, so `URL.canParse` is available — this is load-bearing, because a `try`/`catch` around `new URL` would add a `defensive.error-obscuring` finding and fail `slop:delta` on net score even at net-zero finding count. Spot-check `node --version >= 20`, `npx tsc --version`, `pnpm --version` (pinned `pnpm@10.34.3`, `package.json:31`).
- [ ] **Existing-Solution Search (reuse over duplicate):** Done. `resolveNetworkAllowlist`, `expandAllowedDomains`, `networkAllowlistBases`, `writeNetworkAllowlistArtifact`, `injectOpencodeNetworkCurlAllows` and `enrichClaudeSettingsWebFetch` all already exist and are **extended, not replaced** — `resolveNetworkAllowlist` keeps its exact signature. `sha256` is already exported from `bkit-version.ts:190` and is cycle-free from `bkit-cloud-env.ts`. The single `[NEW]` artifact is `.bkit/src/bkit-registry.ts`.
- [ ] **User Context:** All files are in this worktree; no external credential or user-supplied value is needed. The plan-time proof obligation needs only a writable scratch directory.
- [ ] **Project Context:** `docs/decisions.jsonl` and `docs/knowledge.jsonl` read. Load-bearing entries: decision key `opencode-provider-allowlist-cut-to-four` (#435 Phase 1 — the reason the design's row table is stale, and the reason `kimi-docs` is dropped); `bkit install` flips `core.bare=true` (reset with `git config core.bare false` after every dogfood install); `bkit check` != `bkit upgrade` (separate engines — verify both live). `docs/deferrals.jsonl` carries **9 lines** under 8 unique `381-*` keys — none may be duplicated, none may be edited in place.
- [ ] **Testing & Quality:** Aligned with `docs/testing.md`. bkit has **Unit** (`*.test.ts`) and **Integration** (`*.integration.test.ts`) only — no E2E project, no deployed boundary, so no `@live` tier exists (`docs/testing.md:325-333`). `docs/testing.md:323` forbids mocking `fs`. **`package.json:58` pins the unit-coverage lane to a literal brace list including `bkit-cloud-env` and excluding `bkit-modules`, at `branches=70` — which is why all new branching stays in `bkit-cloud-env.ts` and the leaf stays branch-free.**
- [ ] **Prerequisite Plans:** None. `docs/plans/202607/381-provider-egress-domains-design.md` is the parent design (PASS). No sub-plan precedes this one.

### Conditional _(verify only when applicable)_

- [ ] **Secrets & Env Vars:** N/A — no new API key, credential or env var.
- [ ] **Schema State:** N/A for a database. The one schema is the `.bkit/version` JSON envelope, touched by Task 1's probe only. Confirm the envelope is still `{ pinnedVersion, tier3Hashes, canonicalHashes }` (`.bkit/src/bkit-version.ts:39`, `:46`, `:63`) before adding the fourth field.
- [ ] **Architecture & UI:** Applies — one `[NEW]` file. Import graph after Task 3: **both** `bkit-modules.ts` and `bkit-cloud-env.ts` may import `bkit-registry.ts` directly, and `bkit-modules.ts` keeps its existing edge to `bkit-cloud-env.ts`. **The leaf imports nothing.** That single rule is what guarantees acyclicity; the "one way only chain" phrasing from the design would read as violated by Task 3's direct `bkit-modules.ts` → leaf import, which is correct and intended. Verified: `bkit-cloud-env.ts` imports only `./bkit-manifest.js`, `./bkit-paths.js`, `./bkit-tokens.js` (`:17-19`); `bkit-version.ts` (source of `sha256`) imports only `node:fs`, `node:path`, `node:crypto` (`:29-31`). No UI.
- [ ] **Notifications:** N/A.

### Ground-truth citations this sub-plan depends on — re-verified in this worktree, 2026-08-26

> Every row below was read from source in this worktree on 2026-08-26. Where a cell disagrees with the parent design or the 2026-08-24 re-check comment, **this table is correct**. Do not copy the design's line numbers forward.

<!-- prettier-ignore -->
| Fact | **Now (verified 2026-08-26)** |
| --- | --- |
| `BKIT_SHIPPED_NETWORK_DOMAINS` | `.bkit/src/bkit-cloud-env.ts:471-482`, **10 bases** — `github.com`, `githubusercontent.com`, `anthropic.com`, `claude.com`, `cursor.com`, `linear.app`, `opencode.ai`, `ollama.com`, `openrouter.ai`, `npmjs.com`. `nvidia.com` / `z.ai` / `moonshot.ai` / `kimi.com` removed, `openrouter.ai` added (#435 Phase 1). Design cited `:471-485`, 13 bases — wrong. |
| `OPENCODE_PROVIDER_DEFAULTS` | `.bkit/src/bkit-modules.ts:1461-1518`, **4 keys** — `openrouter`, `ollama`, `opencode-zen`, `opencode-go`. In-file call sites `:1526`, `:1536`, `:1659`, `:1995`; still module-private. Design cited `:1397-1500`, 10 keys — wrong. |
| `resolveNetworkAllowlist` | `.bkit/src/bkit-cloud-env.ts:502-503` |
| `BKIT_SHIPPED_NETWORK_DOMAINS` assertions | `.bkit/src/bkit-cloud-env.test.ts:405-408` ✓ — negative (`not.toContain("vercel.com" / "supabase.com")`), survive the switch to a computed constant, **keep them** |
| Unit-coverage brace list | `package.json:58` (`test:coverage:unit`), `branches=70`; carries `bkit-cloud-env`, **not** `bkit-modules` |
| Live gaps this change closes | **4 hosts** — `api.githubcopilot.com`, `models.dev`, `skills.sh`, `api.tavily.com`. `groq.com` / `cerebras.ai` no longer exist as providers; `openrouter.ai` already shipped. Design and re-check both said 6 |
| Registry row count / derived union | **13 rows / 15 bases** (Open Questions 1, 2 = default). The union is a strict **superset** of today's 10 — nothing is removed. Design said 20 rows / 19–20 bases |
| `resolveNetworkAllowlist` callers | **FOUR, not three** — `writeNetworkAllowlistArtifact` (`.bkit/src/bkit-cloud-env.ts:519`), `injectOpencodeNetworkCurlAllows` (`.bkit/src/bkit-modules.ts:1730`), `enrichClaudeSettingsWebFetch` (`.bkit/src/bkit-modules.ts:1768`) and **`.bkit/src/bkit-uninstall.ts:589`**, which the design and the v1 plan draft both omitted. The fourth is not an edit target but is a blast-radius target: widening the resolved set widens what `bkit uninstall claude` treats as bkit-owned and deletes |
| slop-scan exemptions | `networkAllowlistBases` `_reason` at `slop-scan.config.json:166` — **file-scoped**, so new functions in `bkit-cloud-env.ts` inherit the pass-through exemption and no new exemption is needed |

### `.bkit/version` writers — repeated here because Task 1 depends on it

> **Invariant Conformance — corrected 2026-08-26, and the correction matters.** The earlier phrasing "`.bkit/version` has exactly **one writer per path**" is **wrong as stated**, and enumerating only two writers is what let a third go unexamined. `rg -n 'writeBkitVersion\(' .bkit/src/ --glob '!*.test.ts' --glob '!*.integration.test.ts'` returns the definition (`.bkit/src/bkit-version.ts:140`) plus **three** call sites:

<!-- prettier-ignore -->
| Call site | Shape | Does `webFetchDerived` survive it? |
| --- | --- | --- |
| `.bkit/src/bkit-modules.ts:955` — install, `runCoreModule` deferred `postDispatch` | **fresh object literal** — drops any field not named in it | **No, unless threaded explicitly.** This is the clobbering writer and the sole reason Task 1 exists |
| `.bkit/src/bkit-upgrade.ts:500` — `updateCanonicalHashesAfterUpgrade` | `{ ...bkitVersion, pinnedVersion, canonicalHashes }` (`:495-499`) | Yes — it spreads |
| `.bkit/src/bkit-upgrade.ts:547` — `migrateStrayGitattributes`, the dot-less-`gitattributes` repair | `{ ...bkitVersion, canonicalHashes }` | **Yes — verified by source read 2026-08-26: it spreads, so the field is preserved.** Also `dryRun`-safe: the function returns at its own `if (dryRun) return;` before this write |

The accurate invariant, and the one this change must not break, is therefore: **each write site either spreads the parsed payload or names every field explicitly, and no new write site is added.** The install literal is the only non-spreading one.

Related verified anchors: install-side fresh literal `.bkit/src/bkit-modules.ts:955-959`, `postDispatch.push` `:887`, `needsWrite` `:946`, `.bkit/version` excluded from `byteEqualPaths` `:900`; `parseBkitVersion` returns `.bkit/src/bkit-version.ts:103` and `:112`, required fields `:39`, `:46`, `:63`, `sha256` `:190`.

### 🔒 Gate 1: Prerequisites Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all applicable boxes above. **DO NOT stop for user permission.** Once saved, immediately proceed to `Architecture & Component Changes`.

- [ ] **Acceptance Scenario confirmed:** Human confirmed `👤 Acceptance Scenario` section (checkbox is `[x]`). _(Unchecked → Summary must issue `REVISE`.)_
- [ ] **Breaking Changes confirmed:** Human confirmed `⚠️ Breaking Changes & Naming Review` section (checkbox is `[x]`). _(Unchecked → Summary must issue `REVISE`.)_
- [ ] **Open Questions confirmed:** Human confirmed `👤 Open Questions & Assumptions` section (checkbox is `[x]`). _(Unchecked → Summary must issue `REVISE`.)_
- [ ] **Security & Privacy checked:** All applicable `Security & Privacy` rows verified (or "None" justified).
- [ ] **Gate 1 - Verified:** All Core items checked. All applicable Conditional items checked.

## Data Schema Integration

**No database.** bkit ships no DB, no migration lane and no `docs/data-schema.md` rows. The one persisted schema this sub-plan touches is the **`.bkit/version` JSON envelope**, and only via Task 1's probe — a per-consumer local state file, gitignored in consumer repos and excluded from the published package (`package.json:22`, `"!.bkit/version"`).

**Task 1 adds `webFetchDerived: string[]` in probe form only** — required on `BkitVersion`, parser-default `[]` at both `parseBkitVersion` returns, and carry-forward (`existingVersion?.webFetchDerived ?? []`) in the install literal. **No enrich change, no prune, no `ctx` threading.** The full schema treatment — the `Data Schema Changes` section, the required-not-optional argument, the three construction sites, backward compatibility, and the consumer-content disclosure — lives with WS-5 and is executed there. On Task 1's STOP path the probe edit is reverted and this sub-plan leaves the envelope untouched.

### Data Schema Usage (Inputs & Outputs)

- **Input (Read):** `.bkit/version` → `pinnedVersion`, `tier3Hashes`, `canonicalHashes` (existing, unchanged reads); `.bkit/version` → `webFetchDerived` (new read, install path, defaulting to `[]`).
- **Output (Write):** `.bkit/version` → `webFetchDerived` (probe only, carry-forward).

### Data Schema Changes

- **ADD (probe, Task 1 only):** `.bkit/version` → `webFetchDerived: string[]`, required-with-parser-default `[]`. **MODIFY:** none. **DELETE:** none.

## Architecture & Component Changes

**CRITICAL:** Prefer `[MODIFY]` over `[NEW]`. Every `[NEW]` states why an existing artifact cannot be evolved. **CRITICAL:** never weaken a gate to pass — no `as any`, `@ts-ignore`, `.skip`, deleted assertions, empty `catch`, or mocking-away the unit under test. **CRITICAL:** `.agents/rules.md` § Repo Authoring — edit source only (`.bkit/src`, `.bkit/templates`, `.bkit/workflows`, `.bkit/prompts`, `.agents/`); **never** edit mirrors in `.claude/`, `.cursor/`, `.opencode/` directly, and batch `bkit install` mirror regeneration **once** at session end — which for this change is Task 32, in sub-plan 5, **not** in this sub-plan.

### Database Migrations

None. bkit ships no database and no migration lane.

### Registry (WS-1)

#### [NEW] `.bkit/src/bkit-registry.ts`

- **Why an existing artifact cannot be evolved.** The data must be readable by both `bkit-cloud-env.ts` (which computes the derived exports) and `bkit-modules.ts` (which reads provider config). `bkit-modules.ts` already imports from `bkit-cloud-env.ts` (import block ending `bkit-modules.ts:74`), and both symbols are module-init `const`s, so putting the table in `bkit-cloud-env.ts` and the provider defaults in `bkit-modules.ts` leaves the existing one-way edge intact but keeps `OPENCODE_PROVIDER_DEFAULTS` unreachable from the derivation. Putting the table in `bkit-modules.ts` inverts the edge into a genuine cycle. A leaf that imports nothing is the only shape that satisfies both.
- **Pure data, import-free, branch-free.** Branch-free is load-bearing, not stylistic: `package.json:58` pins the unit-coverage lane to a literal brace list of measured files at `branches=70`, and a new file is not in that list. Any branching here would move gated branches out of the measured set — the same accounting hazard already recorded in `slop-scan.config.json:166` for `networkAllowlistBases`.
- **Contents:** the `EgressSource` type; `OPENCODE_PROVIDER_DEFAULTS` (relocated verbatim); `BKIT_EGRESS_SOURCES` (13 rows); `MULTI_LABEL_SUFFIXES`; `MULTI_TENANT_APEXES`; the one-sentence invariant that the gate is a **deny**, so an unknown platform apex passes; and the recorded deliberate absences.
- **`BKIT_EGRESS_SOURCES` — 13 rows** (Open Question 1 = A, 2 = A, 4 = A). `kind` carries **no behaviour**.
- **Where derivation runs — the one reading, stated once so WS-1 and WS-2 cannot disagree.** Every row in the table below, `opencode-provider` included, carries its `hosts` and `bases` as **literal arrays in the leaf**. The leaf performs **no** URL parsing, no base collapse and no rejection logic; it is pure data, which is what makes "zero control flow" satisfiable and keeps the branching inside the coverage-measured `bkit-cloud-env.ts`. `deriveEgressEntries` (WS-2) is the only place a `baseURL` is ever parsed, and for `opencode-provider` rows the **test** T2 is what ties the literals back to their source: it asserts `host === new URL(OPENCODE_PROVIDER_DEFAULTS[row.id].baseURL).hostname` for every derived row, so a literal that drifts from its provider's `baseURL` fails the suite at authoring time. "Derived" therefore means "gate-checked against `OPENCODE_PROVIDER_DEFAULTS` by T2", **never** "computed at leaf module init". A builder who computes them in the leaf fails Task 2's `Done when` and moves gated branches out of the measured set.

<!-- prettier-ignore -->
| kind | id | hosts | bases | note |
| --- | --- | --- | --- | --- |
| `opencode-provider` | `openrouter` | `openrouter.ai` | `openrouter.ai` | derived from `https://openrouter.ai/api/v1` |
| `opencode-provider` | `ollama` | `ollama.com` | `ollama.com` | derived from `https://ollama.com/v1` |
| `opencode-provider` | `opencode-zen` | `opencode.ai`, `models.dev` | `opencode.ai`, `models.dev` | `reason`: `baseURL` is `""` (builtin); endpoints resolved via models.dev |
| `opencode-provider` | `opencode-go` | `opencode.ai`, `models.dev` | `opencode.ai`, `models.dev` | `reason`: same — a **distinct** registry key, so a distinct row |
| `tracker-mcp` | `mcp-github` | `api.githubcopilot.com` | `githubcopilot.com` | declared — **gap today**; `github.com` does not cover it |
| `tracker-mcp` | `mcp-linear` | `mcp.linear.app`, `api.linear.app` | `linear.app` | declared |
| `agent-host` | `agent-claude` | `console.anthropic.com` | `anthropic.com`, `claude.com` | declared — the multi-base row that forces `bases` to be a list |
| `agent-host` | `agent-cursor` | `api.cursor.com` | `cursor.com` | declared |
| `agent-host` | `agent-opencode` | `opencode.ai` | `opencode.ai` | declared |
| `package-registry` | `pkg-npm` | `registry.npmjs.org` | `npmjs.com`, `npmjs.org` | declared; `reason`: the registry API host is on a sibling TLD its `.com` base cannot cover on a label boundary (Open Question 2) |
| `package-registry` | `pkg-github` | `npm.pkg.github.com`, `raw.githubusercontent.com` | `github.com`, `githubusercontent.com` | declared |
| `skills` | `skills-sh` | `skills.sh` | `skills.sh` | declared — **gap today**; the registry `.agents/skills.md:17` names and `npx skills` calls |
| `tooling-api` | `tooling-tavily` | `api.tavily.com` | `tavily.com` | declared — **gap today for every consumer.** Called at RUNTIME, headless, by the shipped `context=web` debug-fetch block (`.agents/config.md:237-260`). It reaches bkit's own surfaces only because bkit dogfoods the declaration in its own `.agents/config.md` `allowed-domains` (`:292`, `:310`); it was **never** in `BKIT_SHIPPED_NETWORK_DOMAINS` |

- **`tooling-api` is a distinct kind from `docs`, and the distinction is the point.** A `docs` row is a host an interactive agent may `WebFetch` for documentation — the surface #381's scope boundary explicitly carves OUT of cloud runtime egress. `tooling-api` is the inverse: a bkit-shipped host called at runtime, mid-workflow, where an unreachable host is a silent workflow degradation rather than a failed doc lookup. Filing Tavily under `docs` would invert its meaning and invite a future reader to drop it as docs-only.
- **Derived union — 15 bases, sorted unique:** `anthropic.com`, `claude.com`, `cursor.com`, `github.com`, `githubcopilot.com`, `githubusercontent.com`, `linear.app`, `models.dev`, `npmjs.com`, `npmjs.org`, `ollama.com`, `opencode.ai`, `openrouter.ai`, `skills.sh`, `tavily.com`. **Strict superset of today's 10** — five added, none removed.
- **Deliberate absences, recorded in-file so they are not "fixed" later:** `DEP_UPDATERS` / `RENOVATE_RUNNERS` hosts (egress happens on GitHub Actions runners, not in an agent session); the literal `"none"` member of `ISSUE_TRACKERS` / `DEP_UPDATERS` (a sentinel, not a source — the completeness test skips exactly `"none"` and asserts it was the only skip); `json.schemastore.org` (`.bkit/templates/.claude/settings.json:2` `$schema`, fetched by the editor's JSON language server, never by an agent tool call, so no `WebFetch` / `curl` / hook decision is ever taken against it); and `kimi.com` (removed by #435 Phase 1 — re-adding it would reverse the ACTIVE decision `opencode-provider-allowlist-cut-to-four`).

#### [MODIFY] `.bkit/src/bkit-modules.ts` — provider defaults relocation (WS-1)

- **Existence Check:** exists. `OPENCODE_PROVIDER_DEFAULTS` at `:1461-1518`.
- Delete the `const` and add one import from `./bkit-registry.js`. Blast radius verified by grep: the symbol is module-private with four in-file call sites (`:1526`, `:1536`, `:1659`, `:1995`) and **no** external call site or test import. Relocation, not an API change.

### Derivation and derived exports (WS-2)

#### [MODIFY] `.bkit/src/bkit-cloud-env.ts` — proposer, gate, exports

- **Existence Check:** exists.
- **Proposer** (runtime, silent, never throws, never fails CI). `URL.canParse` first — **never** `try`/`catch`, because a catch-with-default-return trips `defensive.error-obscuring` and fails `slop:delta` on net score even at net-zero finding count. Contribute nothing for: `""` host (both gateway rows), `localhost` / `*.localhost`, IP literal, `< 2` labels. Otherwise collapse to the last two labels.
- **`isIpLiteral(host)`** — two shapes, no library: `host.startsWith("[")` (IPv6 and IPv4-mapped IPv6, which `URL.hostname` always brackets) and `/^\d{1,3}(\.\d{1,3}){3}$/` (IPv4 — WHATWG normalises `0x7f.1`, `2130706433` and `127.1` into a dotted quad before the test sees them). Both are **proposer** rejections, so `1.2.3.4` never ships the garbage base `3.4` and `[::1]` never turns into a red build.
- **Gate** (test-only, bkit repo). Applied per candidate base: label-boundary suffix match (`base === host || host.endsWith("." + base)`), `>= 2` labels, not in `MULTI_LABEL_SUFFIXES`, not in `MULTI_TENANT_APEXES`. Gates are **deny checks, never rewriters** — a hit fails the suite at authoring time; a silent narrow-to-raw-host would ship a surprise to every consumer and be invisible in review. A row may override `bases` (or declare `bases: []` with a `reason`) **only** when the gate rejects the default; all four current derived entries pass unchanged.
- **Soft warning, never a block,** when a derived base sits on a `.dev` / `.app` / `.run` TLD — the deny-shaped gate cannot know a future PaaS apex (`*.modal.run`, `*.fly.dev`). T3 asserts the warned set equals the known-accepted set (`models.dev` today) exactly, so a new one surfaces as a test diff rather than as noise.
- **`deriveEgressEntries(rows)`** exported and pure, so T5 drives fixture rows with no `vi.mock`. A hoisted `vi.mock("./bkit-registry.js")` would apply to a whole test file and, inside `bkit-modules.integration.test.ts`, silently perturb every provider-rendering test in it.
- **`BKIT_SHIPPED_NETWORK_DOMAINS`** becomes a sorted-unique flatMap of every row's `bases` — **same name, same `readonly string[]` type**, so `resolveNetworkAllowlist` (`:502-503`) and its downstreams need no signature change. **`BKIT_SHIPPED_NETWORK_HOSTS`** added as the sorted-unique flatMap of every row's `hosts`; single consumer, `renderCursorNetworkAllowlist`.
- **`resolveNetworkAllowlist` has FOUR callers, not three.** `writeNetworkAllowlistArtifact` (`.bkit/src/bkit-cloud-env.ts:519`), `injectOpencodeNetworkCurlAllows` (`.bkit/src/bkit-modules.ts:1730`), `enrichClaudeSettingsWebFetch` (`.bkit/src/bkit-modules.ts:1768`) — and **`.bkit/src/bkit-uninstall.ts:589`**, which the design and the v1 plan draft both omitted. The fourth is not an edit target, but it is a blast-radius target: widening the resolved set widens what `bkit uninstall claude` treats as bkit-owned and deletes. No signature change reaches it; only the widened content does. Nothing in this plan edits `bkit-uninstall.ts`.
- `resolveNetworkAllowlist` and `expandAllowedDomains` are **untouched**.
- The JSDoc at `:465-470` ("Stack-agnostic tooling hosts only … **Never** ship observability / app stacks here") must be rewritten in the same edit to describe the derived source, not a hand-maintained list.
- No new slop-scan exemption is needed: the two cited exemptions are **file-scoped**, so new functions in this file inherit the pass-through exemption.

### Cron Jobs & Scheduled Tasks

None.

## Supersession Inventory _(this sub-plan's share)_

<!-- prettier-ignore -->
| Existing artifact | Replaced by | Decision | Justification |
| --- | --- | --- | --- |
| Hand-listed 10-element literal `BKIT_SHIPPED_NETWORK_DOMAINS`, `.bkit/src/bkit-cloud-env.ts:471-482` | Computed sorted-unique flatMap over `BKIT_EGRESS_SOURCES[].bases` | **DELETE** (the literal; the export name and type survive) | Same name, same `readonly string[]` type, so no downstream signature changes. The two existing assertions on it are negative and remain the right regression guard. |

> [!CAUTION]
> The `DELETE` above is mirrored as a `[MODIFY]` entry in `Architecture & Component Changes` and as Task 7 in the runbook. No `RETAIN-WITH-REASON` row: this is not an external contract and no `@deprecated`-but-still-exported resolution is accepted.

## Documentation Updates _(this sub-plan's share)_

<!-- prettier-ignore -->
| Doc | Change required |
| --- | --- |
| `docs/knowledge.jsonl` | One row if the plan-time proof obligation (Task 1) fails or surprises: the install-side `.bkit/version` writer is a fresh object literal, so any future field must be threaded into it explicitly or it is silently dropped, while the upgrade-side writer spreads and preserves it. **Written only on a real finding, not speculatively** — i.e. only on Task 1's STOP path. |

_No other doc row belongs to this sub-plan: WS-1 and WS-2 add no consumer-visible behaviour and change no shipped prose. The nine-file doc sweep is WS-3's, `.bkit/providers.md:277` is WS-4's, `.bkit/workflows.md` / `.bkit/README.md` are WS-5's, and the ledgers plus `docs/testing.md` are WS-6/WS-7's._

## Rollback Strategy _(workstream scope)_

<!-- prettier-ignore -->
| Axis | Action | Notes |
| --- | --- | --- |
| **DB** | None — bkit ships no database and no migration lane. | n/a |
| **Code** | `git revert` this sub-plan's commits, then `pnpm build` and commit the regenerated `dist/` **including deleting `dist/bkit-registry.js`**. No mirror regeneration is needed — this sub-plan runs no `bkit install`. | `pnpm bkit:check:dist` fails CI if `dist/` is not reverted alongside the source. |
| **Consumer state** | None reached. Nothing in Tasks 2–9 changes an installed artifact; Task 1's probe touches only a throwaway scratch consumer under `tmp/`. | Task 1's STOP path reverts its own probe edit by `Edit`, never by `git checkout` / `git restore` / `git reset`. |
| **Risk window** | None. No deploy, no schema migration reaching a real consumer. |  |

## Agent Execution Runbook

> [!IMPORTANT]
> **Continuous Execution:** Work runbook autonomously. No pause for user permission at any Gate. Check `[x]` tasks as you go.
> **Step Isolation:** Complete each task fully (verification + checkbox) before next task.
> **Integration Shape:** advisory only — delivering every task in ONE PR is always correct.

**Standing rules for every task below** (`.agents/rules.md` § Repo Authoring):

- **Edit source only** — `.bkit/src/`, `.bkit/templates/`, `.bkit/workflows/`, `.bkit/prompts/`, `.agents/`. **Never** edit `.claude/`, `.cursor/`, `.opencode/` mirrors directly. `.cursor/hooks/guardrails.cjs` is a mirror: edit the template, regenerate at the end.
- **Batch `bkit install` once, at session end** (Task 32, sub-plan 5) — never per edit, and **never in this sub-plan**.
- **Docs change in the same task as the code they describe.** No doc-only follow-up task exists in this runbook by design.
- **Add no new `try`/`catch` anywhere in this change** — a catch-with-default-return bumps `defensive.error-obscuring` and fails `slop:delta` on net score even at net-zero finding count. Use `URL.canParse`.
- **After any `bkit install` / `bkit upgrade` in this repo, run `git config core.bare false`** — install flips it.
- **🛑 Every `.bkit/src/bkit-modules.ts` line number in this plan is a PRE-Task-3 coordinate.** Task 3 deletes `OPENCODE_PROVIDER_DEFAULTS` at `:1461-1518` — 58 lines — so every anchor **after** `:1461` shifts by roughly 57 lines the moment Task 3 lands: `injectOpencodeNetworkCurlAllows` call sites `:1698` / `:1718` and definition `:1726-1734`, `enrichClaudeSettingsWebFetch` `:1751-1778`, its JSDoc `:1736-1750`, its early return `:1770` and its `ws.writes` push `:1775-1777`. Anchors **before** `:1461` (`:174`, `:205`, `:887`, `:946`, `:955-959`, `:1062`, `:1309-1310`, `:1396-1400`) are unaffected. **Resolve every post-`:1461` anchor by symbol name, never by line number**, and never write a `Done when` that greps a post-`:1461` line range after Task 3 has run. **This hazard is created here and is inherited by sub-plans 4 and 5, which carry the post-`:1461` work.**
- **Deferral rows are append-only.** `docs/deferrals.jsonl` carries 9 lines under 8 unique `381-*` keys; a state change is a same-`key` append (`.bkit/jsonl.md` § Updating a Row), never an edit to a prior line.

Task order is the design's dependency graph: **WS-1 → WS-2 → {WS-3, WS-4, WS-5} → WS-6 → WS-7**, with the proof obligation hoisted ahead of everything so a failure re-scopes the plan instead of the build. This sub-plan is Phase 0, Phase 1 and Phase 2.

### Phase 0 — Blocking proof obligation

- [ ] **Task 1 — 🛑 BLOCKING: prove a `.bkit/version` field survives a real install, BEFORE any WS-5 code is written.** **On the current worktree HEAD** — this build runs in a feature worktree; do **not** check out, edit or build `dev` to satisfy a proof obligation. Record the pre-task baseline SHA (`git rev-parse HEAD`) now; later tasks compare against that SHA, not against a moving `HEAD`. Add `webFetchDerived: string[]` to the `BkitVersion` interface and both `parseBkitVersion` returns (`.bkit/src/bkit-version.ts:63`-shape, `:103`, `:112`) and to the install-side literal at `.bkit/src/bkit-modules.ts:955-959` resolved as `existingVersion?.webFetchDerived ?? []` — **the carry-forward half only, no enrich change, no prune, no `ctx` threading.** Then: `pnpm build` → create a fresh scratch consumer under the repo's `tmp/` (never `/tmp`) → seed `.bkit/version` with a hand-written `{"pinnedVersion":"…","tier3Hashes":{},"canonicalHashes":{},"webFetchDerived":["WebFetch(domain:probe.example)"]}` → `node dist/bkit-install.js install --claude --cursor --tooling` in that directory → read `.bkit/version` back.
  - **If `webFetchDerived` is absent or emptied on read: STOP — and leave no half-applied schema edit behind.** Execute all five of these, in order, then stop:
    1. **Revert the probe edit** — `.bkit/src/bkit-version.ts` and `.bkit/src/bkit-modules.ts` go back to the pre-task baseline SHA's contents for the `webFetchDerived` hunks. On the STOP path Task 19 (which promotes the probe into the real change) never runs, so leaving the edit in ships a required-with-parser-default field that has no writer, no reader and no test. Revert by `Edit`, never by `git checkout` / `git restore` / `git reset` (`.agents/rules.md` § Destructive git PROHIBITED).
    2. **Drop Tasks 19, 20, 21, 23 and 24 entirely**, and with them matrix rows T8, T10 and T15.
    3. **Task 22 (empty the seed) still runs.** Its justification is independent of the prune: the seed is the fourth hand-maintained copy, it is a stale partial subset, and `enrichClaudeSettingsWebFetch` already tops it up additively in the same `runClaudeModule` pass. Its `Done when` is unchanged.
    4. **Task 28 / T14 still runs, minus the provenance clause** — assert `bkit check` reports 0 writes on a clean install and a clean upgrade, with no `.bkit/version` `webFetchDerived` field in play.
    5. Append a `docs/knowledge.jsonl` row recording the clobbering writer, and re-scope the prune sub-feature with the human before any further build.

    WS-1 → WS-4 and WS-6 → WS-7 remain buildable; the plan degrades to "derive and fan out, no prune", which still satisfies Success Criteria 1, 2, 3 and 5, and fails Criterion 4 — say so explicitly in the handover rather than letting it read as met.

  - **Done when:** `node -e "console.log(require('./tmp/<scratch>/.bkit/version'))"` (or `jq .webFetchDerived tmp/<scratch>/.bkit/version`) prints `["WebFetch(domain:probe.example)"]` after a real `node dist/bkit-install.js` run against a scratch consumer that did **not** have the field written by any test double; and `git config core.bare false` has been run. **On the STOP path, `Done when` is instead:** `git diff <baseline-sha> -- .bkit/src/bkit-version.ts .bkit/src/bkit-modules.ts` shows no `webFetchDerived` hunk, and the handover names Criterion 4 as not met.

> [!CAUTION]
> **Record Task 1's branch in the handover to sub-plans 2–5.** Tasks 19, 20, 21, 23 and 24 live in `plan-v4-4.md`, which cannot know which branch was taken unless this sub-plan says so. Sub-plan 4's scope preamble carries the same STOP-path text and expects an explicit statement, not an inference.

### Phase 1 — WS-1: egress registry leaf _(requires: nothing)_

- [ ] **Task 2 — Create `.bkit/src/bkit-registry.ts` as a pure-data, import-free, branch-free leaf.** Declare `EgressSource` exactly as in `Architecture § Registry`: `id` (stable, unique, **atomic** — never composite), `kind` (`opencode-provider | tracker-mcp | agent-host | package-registry | skills | tooling-api`), `hosts: readonly string[]`, `bases: readonly string[]` (a **list**, not a scalar), optional `reason` (required when `bases` is `[]` or overrides the derived default). Drop the `docs` variant per Open Question 1 default.
  - **Done when:** `.bkit/src/bkit-registry.ts` exists, exports `EgressSource`, contains **zero** `import` statements and zero `if` / `?:` / `&&` / `||` / `??` control flow — `rg -n 'import |if \(|\?\?|&&|\|\||\? ' .bkit/src/bkit-registry.ts` returns nothing. **The alternation must carry `\|\|` and `\? ` (the conditional operator), not just `\?\?`**: the v2 grep listed `?:` and `||` in its prose and matched neither, so a ternary or a logical-or would have slipped through the one gate Task 4 later re-runs. **Use `\? ` (question mark + space), never `\?:`** — `EgressSource` declares `reason?: string`, so a `\?:` term would match the optional-property marker and make this criterion permanently unreachable. `pnpm typecheck` passes.
- [ ] **Task 3 — Move `OPENCODE_PROVIDER_DEFAULTS` verbatim from `.bkit/src/bkit-modules.ts:1461-1518` into the leaf; add one import line back.** Relocation only — do not reshape the object, do not export it further.
  - **Done when:** `rg -n 'OPENCODE_PROVIDER_DEFAULTS' .bkit/src/` shows the definition only in `bkit-registry.ts` and four call sites plus one import in `bkit-modules.ts`; `pnpm typecheck` passes; `pnpm vitest run` shows no new failures versus the pre-task baseline. **This is an AT-TASK-TIME check, not a standing invariant** — Task 8's T1 imports `OPENCODE_PROVIDER_DEFAULTS` into `.bkit/src/bkit-cloud-env.test.ts` to key the completeness assertion, so from Phase 2 onward this grep legitimately returns one more import. A later re-verification pass must read the extra match as expected, never as a regression.
- [ ] **Task 4 — Author `BKIT_EGRESS_SOURCES` (13 rows), the two gate denylists, and the recorded absences.** Rows exactly as tabled in `Architecture § Registry`, with the four `opencode-provider` rows in registry-key order. **Their `hosts` and `bases` are LITERAL arrays**, matching the table byte for byte — the leaf parses no URL and runs no derivation at module init, which is what keeps Task 2's zero-control-flow gate satisfiable and keeps the branching inside the coverage-measured `bkit-cloud-env.ts`. The tie back to `OPENCODE_PROVIDER_DEFAULTS[key].baseURL` is enforced by **T2** at test time (`host === new URL(baseURL).hostname`), not by leaf code. `MULTI_LABEL_SUFFIXES` (`co.uk`, `com.au`, `com.cn`, `co.jp`, `com.br`, …) and `MULTI_TENANT_APEXES` (`amazonaws.com`, `googleapis.com`, `azure.com`, `azurewebsites.net`, `workers.dev`, `vercel.app`, `pages.dev`, `hf.space`, `run.app`, `appspot.com`, …) as data, plus the one-sentence invariant that the gate is a **deny**, so an unknown platform apex passes. Record the four deliberate absences in-file (`DEP_UPDATERS`/`RENOVATE_RUNNERS`, the literal `"none"` sentinel, `json.schemastore.org`, `kimi.com`).
  - **Done when:** `BKIT_EGRESS_SOURCES` has 13 entries with 13 unique `id`s; every row with non-empty `bases` has non-empty `hosts`; every `bases: []` or overriding row carries a `reason`; `rg -n 'new URL|OPENCODE_PROVIDER_DEFAULTS\[' .bkit/src/bkit-registry.ts` returns nothing (no derivation in the leaf); Task 2's zero-control-flow grep still returns nothing; `pnpm typecheck` and `pnpm format:check` pass.

### Phase 2 — WS-2: derivation, gate, exports _(requires: WS-1)_

- [ ] **Task 5 — Implement the proposer and `isIpLiteral` in `.bkit/src/bkit-cloud-env.ts`.** `URL.canParse` first, **never** `try`/`catch`. Contribute nothing for `""` host, `localhost` / `*.localhost`, IP literal, `< 2` labels; otherwise collapse to the last two labels. `isIpLiteral` = `host.startsWith("[")` OR `/^\d{1,3}(\.\d{1,3}){3}$/`.
  - **Done when — the positive clause first, because the two absence clauses below are green on an untouched file.** A builder who writes nothing at all satisfies "no new `try {`" and "no net-new `defensive.error-obscuring`", ticks the box, and the gap only surfaces four tasks later at Task 9 / T7. So: (1) **the proposer exists and behaves** — a temporary local assertion in `.bkit/src/bkit-cloud-env.test.ts` (T7 formalises it in Task 9; this one may be folded into T7 there, never deleted) shows `https://openrouter.ai/api/v1` → `openrouter.ai`, while `http://localhost:11434/v1`, `https://1.2.3.4:8080/v1` and `https://[::1]/v1` each contribute **nothing** and none of them throws; (2) `rg -n 'isIpLiteral' .bkit/src/bkit-cloud-env.ts` matches a definition and at least one call site. Then the two absence clauses: `rg -n 'try \{' .bkit/src/bkit-cloud-env.ts` shows no new occurrence versus `git show <baseline-sha>:.bkit/src/bkit-cloud-env.ts`, where `<baseline-sha>` is the pre-Task-1 SHA recorded in Task 1 — **not** `HEAD`, which stops being a baseline the moment the first commit of this phase lands; `pnpm slop:delta` reports no net-new `defensive.error-obscuring` finding.
- [ ] **Task 6 — Implement the gate as a test-only bkit-repo check, plus the `.dev`/`.app`/`.run` soft warning.** Deny checks, never rewriters: label-boundary suffix match, `>= 2` labels, not in either denylist. Warning is a warning — it must never fail the build. _(Owns matrix row **T3**.)_
  - **Done when:** the T3 anti-widening test in `.bkit/src/bkit-cloud-env.test.ts` passes; temporarily adding a fixture row with base `googleapis.com` makes it **fail** and removing it makes it pass again (record the observed failure message); the soft-warn assertion names `models.dev` as the only accepted warn.
- [ ] **Task 7 — Export pure `deriveEgressEntries(rows)`; recompute `BKIT_SHIPPED_NETWORK_DOMAINS`; add `BKIT_SHIPPED_NETWORK_HOSTS`.** Both are sorted-unique flatMaps. Same name and same `readonly string[]` type for the existing export. Rewrite the now-false JSDoc at `.bkit/src/bkit-cloud-env.ts:465-470`. Leave `resolveNetworkAllowlist` and `expandAllowedDomains` untouched. _(Owns matrix row **T5**.)_
  - **Done when:** `BKIT_SHIPPED_NETWORK_DOMAINS` evaluates to the 15 bases listed in `Architecture § Registry` and is a strict superset of the previous 10 (assert by diffing against `git show <baseline-sha>:.bkit/src/bkit-cloud-env.ts`, the pre-Task-1 SHA); the existing negative assertions at `.bkit/src/bkit-cloud-env.test.ts:405-408` still pass unmodified; the T5 injected-source test passes with **no** `vi.mock` in the file.
- [ ] **Task 8 — Write the completeness and suffix-invariant tests.** _(Owns matrix rows **T1**, **T2**.)_
  - **Done when:** T1 and T2 pass in `.bkit/src/bkit-cloud-env.test.ts`; T1 is table-driven over `Object.keys(OPENCODE_PROVIDER_DEFAULTS)` so adding a fifth provider key with no row makes it fail (verify by temporarily adding one); T1 asserts the literal `"none"` was the **only** thing skipped when iterating `ISSUE_TRACKERS` / `DEP_UPDATERS`.
- [ ] **Task 9 — Write the negative / rejection-channel tests, asserting the channel and not merely the outcome.** _(Owns matrix row **T7**.)_
  - **Done when:** T7 passes and distinguishes the two channels — `https://1.2.3.4:8080/v1` and `https://[::1]/v1` contribute nothing **without** throwing or failing the gate (silent proposer rejection), while `https://api.pages.dev/v1` and `https://x.example.co.uk/v1` fail the gate assertion (test-red). `http://localhost:11434/v1` contributes nothing, and no **rendered output** contains the string `localhost` — scoped to the four surfaces the derivation feeds, never repo-wide: the two cloud paste fences (`renderCloudNetworkAllowlist`, `renderCursorNetworkAllowlist`), the `.cursor/allowlist.json` body (`writeNetworkAllowlistArtifact`), the `WebFetch(domain:…)` set (`resolveNetworkAllowlist`) and the OpenCode `permission.bash` globs. A repo-wide `localhost` sweep is unbounded and green-impossible — `localhost` occurs legitimately across `.bkit/` and `docs/` — so asserting it that way is a criterion that can only be satisfied by weakening it.

### 🔒 Gate 2: Code Implementation Check _(sub-plan scope)_

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below. **DO NOT stop for user permission.** The plan-wide Gate 2, Gate 3 and Gate 4 — which assert across all 34 tasks in both directions — are executed once, in `plan-v4-5.md`. The boxes here are this sub-plan's own preconditions for handing over.

- [ ] **No bolt-on / no gate-weakening:** the single `[NEW]` artifact (`.bkit/src/bkit-registry.ts`) is justified against extending an existing file by the import-cycle and coverage-lane arguments in `Architecture`; no `as any` / `as unknown as` / `@ts-ignore` / `.skip` / empty `catch` / error-swallowing was introduced to make a gate pass.
- [ ] **Source-only edits:** `git diff --name-only` contains no path under `.claude/`, `.cursor/` or `.opencode/`. This sub-plan runs **no** `bkit install`.
- [ ] **Every matrix row this sub-plan owns is owned by exactly one task:** T1→Task 8, T2→Task 8, T3→Task 6, T5→Task 7, T7→Task 9. No orphan rows, no invented tests, and no row belonging to another sub-plan written here.
- [ ] **The leaf is still import-free and branch-free** after Task 4 added 13 rows and two denylists — Task 2's grep re-run, returning nothing.
- [ ] **Task 1's branch is recorded** in the handover, and on the STOP path the probe edit is provably reverted (`git diff <baseline-sha> -- .bkit/src/bkit-version.ts .bkit/src/bkit-modules.ts` shows no `webFetchDerived` hunk).
- [ ] **No new `try`/`catch` was added anywhere**, and `pnpm slop:delta` reports no net-new `defensive.error-obscuring` finding.
- [ ] **Gate 2 (sub-plan scope) - Verified.**

## Verification Plan

> [!IMPORTANT]
> **Advisory build-phase checks, NOT merge gates.** Only `Agent Execution Runbook` `Done when` lines gate the merge; nothing in this section does.

### Automated Tests

- [ ] **Unit (`.bkit/src/bkit-cloud-env.test.ts`):** T1 completeness, T2 suffix invariant, T3 anti-widening + soft-warn set, T5 injected source, T7 rejection channels. Data hygiene: all fixture rows are local constants; **no `vi.mock` anywhere in the file** — the other three rows this file carries (T9, T12, T13) belong to WS-3 and are written in `plan-v4-2.md`, into the same file and under the same no-`vi.mock` rule.
- [ ] **Build Configuration:** no new mock file and no new test config; `tsconfig.json` already excludes `**/*.test.ts` from `tsc --noEmit`, which is why adding a required `BkitVersion` field does not break the existing test-side object literals.
- [ ] **Run all tests:** `pnpm vitest run` **unscoped** (`.agents/rules.md` § Repo Authoring: "Verify before complete" means the full suite, never a scoped run) before handing over to sub-plans 2–4. A scoped run hides cross-file breakage, which is exactly how the recomputed constant's downstream fallout would go unnoticed.

> [!IMPORTANT]
> **No Architectural Downgrades:** if a build, compiler or test error appears, never resolve it via a hot fix or an anti-pattern. In particular: do not add a `try`/`catch` to silence a URL-parsing edge (use `URL.canParse`), do not widen a denylist to make the gate pass (fix the row's `bases` and record a `reason`), do not `.skip` the parity or fan-out tests, do not edit or skip `.bkit/src/bkit-uninstall.test.ts` to make Task 22's grep green, and do not add `if (dryRun) return null;` above the `ws.writes` push to make the recording contract simpler. Halt if stuck.

### 🔒 Gate 4: Automated Verification Check _(sub-plan scope)_

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` the box below. **DO NOT stop for user permission.**

- [ ] **Gate 4 (sub-plan scope) - Verified:** every checkbox in Automated Tests independently verified and checked off, with explicit proof captured (test output, CLI exit codes, and for Task 1 the on-disk `.bkit/version` of the scratch consumer). The full-suite Gate 4 for the whole change is run once in `plan-v4-5.md`.

### 👤 Manual Verification

> [!CAUTION]
> **Owner-run acceptance checks — advisory only.** Run during build wherever a CLI can. An unticked box blocks nothing.

> [!WARNING]
> **Dashboard Ban:** use local CLIs to verify rather than asking the user to check a dashboard. This sub-plan needs no vendor dashboard at all; the two checks that do are in `plan-v4-5.md`.

- [ ] **Task 1's scratch consumer, inspected by hand.** `jq . tmp/<scratch>/.bkit/version` — confirm `webFetchDerived` is present and carries `["WebFetch(domain:probe.example)"]`, then `git config core.bare` prints `false` in the bkit repo. This is the whole of Phase 0's evidence and it is worth reading with your own eyes rather than trusting the `Done when` grep alone.
