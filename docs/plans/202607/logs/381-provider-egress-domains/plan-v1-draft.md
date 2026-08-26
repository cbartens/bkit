# Auto-derive provider cloud-egress domains from the provider registries Implementation Plan

> [!CAUTION]
> **CRITICAL:** Do not hallucinate plan execution state.
>
> 1. Read this `plan.md` natively ONCE at session start. Do NOT re-read on every loop iteration.
> 2. NEVER trust session memory or previous conversation history.
> 3. Source of truth = literal `[x]` vs `[ ]` checkboxes in this document. `[ ]` = NOT DONE regardless of conversation context.

## Context & Goals

bkit's network allowlist is fragmented across five encoding surfaces and maintained by hand in two places that only a comment holds together. `BKIT_SHIPPED_NETWORK_DOMAINS` (`.bkit/src/bkit-cloud-env.ts:471-482`, 10 bases) is hand-typed and duplicated verbatim into `SHIPPED_NETWORK_BASES` (`.bkit/templates/.cursor/hooks/guardrails.cjs:115-126` + its `.cursor/` mirror), with a third partial copy in `.bkit/templates/.claude/settings.json:10-22`. Separately, the two cloud paste renderers read the **consumer's** `allowed-domains` alone (`renderCloudNetworkAllowlist` at `:543-544`, `renderCursorNetworkAllowlist` at `:643-644`) while local host permissions merge the shipped defaults (`resolveNetworkAllowlist` at `:502-503`) — so a host bkit ships configuration for is reachable locally and unreachable from a cloud agent session.

Both defects are already live. `api.githubcopilot.com` (the GitHub tracker MCP endpoint bkit writes into `.mcp.json`), `models.dev` (how OpenCode resolves the two gateway catalogs), `skills.sh` (the skills registry `.agents/skills.md` names) and `tavily.com` (called at runtime by the shipped `context=web` debug-fetch block) are in **no** shipped list. `tavily.com` reaches bkit's own surfaces only because bkit dogfoods the declaration in its own `.agents/config.md` `allowed-domains` (`:292`, `:310`); every consumer who does not hand-declare it gets no grant on any surface, and the shipped `context=web` block self-skips with `HTTP 000` everywhere. And even a host that **is** on the shipped list never reaches the cloud dashboard paste, so `--opencode=openrouter` in a cloud session is broken today despite `openrouter.ai` sitting in the constant.

This change derives one table of egress sources from bkit's own registries (`.bkit/src/bkit-registry.ts`, new leaf), computes the shipped base and host sets from it, fans them out to all five surfaces in the same install pass, deletes both hand-maintained copies, and adds a `webFetchDerived` provenance record to `.bkit/version` so a host that leaves the derived set can lose its `WebFetch` grant instead of accumulating forever.

Full scope: all seven workstreams (WS-1 … WS-7) from the parent design, in the dependency order the design records — WS-1 → WS-2 → {WS-3, WS-4, WS-5} → WS-6 → WS-7.

> [!WARNING]
> **The parent design's ground truth drifted twice.** It was written 2026-07-29, amended 2026-08-03, re-checked 2026-08-24. Since that re-check, **#435 Phase 1** landed (`docs/decisions.jsonl` key `opencode-provider-allowlist-cut-to-four`) and moved the two facts the design's row table is built on. Every citation in this plan was re-verified against the worktree on 2026-08-26; where it conflicts with the design or the re-check comment, **this plan is correct**. The two structural moves:
>
> 1. `OPENCODE_PROVIDER_DEFAULTS` (`.bkit/src/bkit-modules.ts:1461-1518`) is **4 keys**, not 10: `openrouter`, `ollama`, `opencode-zen`, `opencode-go`. `ollama-local`, `nvidia`, `groq`, `cerebras`, `zai`, `moonshot` were deleted outright.
> 2. `BKIT_SHIPPED_NETWORK_DOMAINS` is **10 bases**, not 13: `nvidia.com` / `z.ai` / `moonshot.ai` / `kimi.com` removed, `openrouter.ai` added — in all five copies.
>
> Consequences carried through this plan: the registry is **13 rows**, not 20; the derived union is **14 bases**, not 19/20; two of the design's six named live gaps (`groq.com`, `cerebras.ai`) no longer exist and a third (`openrouter.ai`) is already shipped; and the `kimi-docs` row is dropped rather than re-added (see Open Question 1). Full citation delta in `Pre-Flight / Dependencies § Project Context`.

**Related Issues:**

- #381 — Auto-derive provider cloud-egress domains from the provider registry (open) — this plan's parent.
- #394 — Domain allowlist sync base config.md Claude Cursor OpenCode (closed) — landed the tooling ∪ consumer union, apex + `*.` expansion, the host-parsed hook check, and the three per-host encodings. Its two carried-forward items (`enrichClaudeSettingsWebFetch` additive-only; `SHIPPED_NETWORK_BASES` hand-sync) are in this plan's scope.
- #376 — Add Z.AI (GLM) Moonshot (Kimi) OpenCode providers (closed, completed) — source of the "registrable base, not raw subdomain" direction and of the rejection of consumer content driving hash-gated shipped artifacts. Its `z.ai` / `moonshot.ai` / `kimi.com` grants were since removed by #435.
- #419 — the `context=web` debug-fetch block (implemented on `dev`) — wrote the local-vs-cloud split guidance into `.agents/config.md`, `.bkit/providers.md` and `docs/observability.md` that WS-3 makes false.
- #422 (`564dfb53`) — flipped `.cursor/hooks/guardrails.cjs` to `format: "markered-text"` and added the `SHIPPED_NETWORK_BASES` ↔ `settings.json` WebFetch parity assertion that WS-4 deletes.
- #435 — IDE-vs-model-provider restructure, Phase 1 landed — cut the opencode provider allowlist from ten to four and re-pointed the shipped egress list. Sequencing risk recorded in Open Question 5.

---

## 👤 ⚠️ Acceptance Scenario — HUMAN REVIEW REQUIRED

> [!CAUTION]
> **🛑 HUMAN MUST READ AND CONFIRM THIS SECTION.**
> This is the testable contract for the feature. Everything below — implementation, tests, verification — is derived from what you confirm here. If this is wrong, everything downstream is wrong.
>
> **You only need 👤-marked sections** (Acceptance Scenario, Breaking Changes, Open Questions & Assumptions). Agent handles rest.

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
2. Consumer opens `.claude/cloud.md` § 2 Network access → the doc says set **Custom**, and the fenced block lists 32 lines (16 bases × apex + `*.`), including `githubcopilot.com`, `models.dev`, `skills.sh`, `tavily.com` and `sentry.io` — none of which the consumer declared except the last.
3. Consumer pastes the fence content verbatim into the Claude dashboard "Allowed domains" field and selects **Custom**. The italic line _after_ the fence reads `… Allowlist fingerprint: a1b2c3d4.` and is not part of the paste.
4. Consumer runs cloud `/bkit-debug` → the `context=web` block returns search results instead of `HTTP 000`, and the GitHub tracker MCP connects.
5. Consumer later deletes `sentry.io` from `allowed-domains` and re-runs `pnpm bkit install` → console prints one removal line, `.bkit/advisories.md` carries a `webfetch-grants-pruned` finding naming `WebFetch(domain:sentry.io)` and `WebFetch(domain:*.sentry.io)`, and `git diff .claude/settings.json` shows exactly those two lines deleted. The fingerprint is unchanged, so no re-paste is prompted.

**Outcome:** One install, one paste. Every host bkit configured an agent to call is reachable from cloud, the consumer hand-declared none of them, and removing their own declared domain actually revoked its grant with a durable record of what was revoked.

### Edge Cases _(plan expands from design's Key Edge Cases)_

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| _(design)_ `.cursor/allowlist.json` absent or corrupt, hook carries no fallback list | Hook asks on **every** parseable `curl`/`wget` URL including `github.com`; never allows. Ask message names `.cursor/allowlist.json` and `bkit install`. |
| _(design)_ Registry entry with no derivable host — empty `baseURL` on `opencode-zen` / `opencode-go` | Proposer contributes nothing; the row must declare `bases` + `hosts` + a `reason`. Never `""`, never `localhost`, never an IP literal. |
| _(design)_ Base collapse landing on a multi-tenant apex or multi-label public suffix (`*.googleapis.com`, `example.co.uk`) | Gate fails the unit suite in the bkit repo at authoring time. Nothing ships. |
| _(design)_ Host no `baseURL` can yield — MCP, package-registry, skills, agent-host, tooling-api | Declared row with explicit `hosts` + `bases`; `kind` carries no behaviour, only `opencode-provider` derives. |
| _(design)_ Cloud allowlist is human-mediated; nothing detects a stale paste | 8-hex fingerprint as prose **after** the closing fence, hashed over the derived set only, paired with a symptom-first runbook sentence in both `cloud.md` templates. Detection itself stays deferred. |
| _(design)_ Prune with no provenance — first run after upgrade, or a hand-added grant | `webFetchDerived` absent parses to `[]`; `previous \ current` is empty; nothing is pruned. A grant bkit never recorded is never removed. |
| _(plan)_ Consumer hand-added a grant that bkit later derives independently, and it then leaves the derived set | It **is** pruned — `permissions.allow` carries no provenance and bkit cannot distinguish the two. Disclosed in the advisory `detect` text and recoverable by re-declaring the apex. Never stated as "provably cannot delete a hand-added grant". |
| _(plan)_ `enrichClaudeSettingsWebFetch` reaches a non-writing return (file absent / `JSON.parse` throws / `permissions.allow` not an array / `dryRun`) | Returns `null`. `.bkit/version` `webFetchDerived` is carried forward unchanged — never cleared, never overwritten with a claim about bytes that were not written. |
| _(plan)_ Steady-state run where `add` and `remove` are both empty | Writes nothing, but **does** return `current` as the record. Getting this backwards makes the prune permanently dead. |
| _(plan)_ `dryRun` (`bkit check`) | Enrich returns `null`, so the resolved `webFetchDerived` equals the existing value, `derivedChanged` is false, and no `.bkit/version` entry is pushed to `ws.writes`. Criterion 3 holds by construction. |
| _(plan)_ A declared row's exact host sits on a sibling TLD its base cannot cover (`registry.npmjs.org` vs `npmjs.com`) | The suffix invariant is asserted over **derived** rows only; a declared row whose `hosts` are not covered by its `bases` must carry a `reason`. See Open Question 2. |
| _(plan)_ Derived base sits on a `.dev` / `.app` / `.run` TLD (`models.dev` today) | Soft warning only, never a build failure. The gate test asserts the warned set is exactly the known-accepted set, so a new one surfaces as a diff. |
| _(plan)_ `.claude/settings.json` template seed is emptied while enrich now prunes | `deepContains` uses array-**subset** semantics (`.bkit/src/bkit-tiers.ts`), so shrinking the template can only relax containment; `bkit check` cannot regress. Uninstall hygiene does regress — recorded as a deferral, not solved. |
| _(plan)_ `bkit upgrade` prunes a grant | Console line + `git diff .claude/settings.json` apply. `.bkit/advisories.md` does **not** — `writeAdvisoriesArtifact` is called from the doctor branch (`.bkit/src/bkit-install.ts:2133`) and the install/check path (`:2945`) only. Stated, not hidden. |

### Derived Test Matrix

> Tiers per `docs/testing.md` § Tiers: bkit has **Unit** (`*.test.ts`) and **Integration** (`*.integration.test.ts`) only — no E2E project and no deployed boundary, so no `@live` row is available or appropriate. Rows that cross the real install boundary (spawned `bkit`, real filesystem, real `.bkit/version` round-trip) are Integration with no mocks at that boundary; `docs/testing.md:323` forbids mocking `fs`.

<!-- prettier-ignore -->
| Test description | Type | Target file |
| --- | --- | --- |
| **T1** Completeness: exactly one `opencode-provider` row per `Object.keys(OPENCODE_PROVIDER_DEFAULTS)` key; every row has non-empty `bases` **or** a `reason`; every row with non-empty `bases` has non-empty `hosts`; every `id` unique; `ISSUE_TRACKERS` / `DEP_UPDATERS` iterated with the literal `"none"` skipped **and** the test asserting `"none"` was the only skip | Unit (Vitest) | `.bkit/src/bkit-cloud-env.test.ts` |
| **T2** Suffix invariant on derived rows: `host === base \|\| host.endsWith("." + base)` and `host === new URL(baseURL).hostname` for every `opencode-provider` row; a declared row whose `hosts` are not covered by its `bases` carries a `reason` | Unit (Vitest) | `.bkit/src/bkit-cloud-env.test.ts` |
| **T3** Anti-widening gate: no derived base in `MULTI_TENANT_APEXES` / `MULTI_LABEL_SUFFIXES`, every base `>= 2` labels, no IP literal, no `localhost`; the `.dev`/`.app`/`.run` soft-warn set equals the known-accepted set exactly | Unit (Vitest) | `.bkit/src/bkit-cloud-env.test.ts` |
| **T4** Fan-out parity after a real tmp-dir install: every base in `BKIT_SHIPPED_NETWORK_DOMAINS` present in the `.claude/cloud.md` paste fence, `.cursor/allowlist.json` `domains`, `.claude/settings.json` `WebFetch(domain:…)`, `.opencode/opencode.json` `permission.bash` `curl *…*` globs — **and** the installed `.cursor/hooks/guardrails.cjs` carries no domain array (absence assertion) | Integration (Vitest) | `.bkit/src/bkit-cloud-env.integration.test.ts` _(new)_ |
| **T5** Injected-source: `deriveEgressEntries(fixtureRows)` with a synthetic row yields the synthetic base/host in its output, and every `bkit-cloud-env.ts` surface fed that output (cloud paste fence, Cursor exact-host block, `.cursor/allowlist.json` body, `networkAllowlistBases`) carries it — no `vi.mock`, asserted against the exported derivation rather than a hardcoded literal. The two `bkit-modules.ts` encoders are covered by T4, which is the only tier that can reach them | Unit (Vitest) | `.bkit/src/bkit-cloud-env.test.ts` |
| **T6** Hook byte parity: `.bkit/templates/.cursor/hooks/guardrails.cjs` byte-equal to `.cursor/hooks/guardrails.cjs` | Integration (Vitest) | `.bkit/src/bkit-guardrails-cursor.integration.test.ts` |
| **T7** Negative / rejection-channel: both gateway rows contribute `opencode.ai` + `models.dev` and never `""`; a malformed `baseURL` yields no row without throwing; `https://1.2.3.4:8080/v1` and `https://[::1]/v1` are **silent proposer** rejections (contribute nothing, no throw); `https://api.pages.dev/v1` and `https://x.example.co.uk/v1` are **gate** rejections (test-red); `http://localhost:11434/v1` contributes nothing | Unit (Vitest) | `.bkit/src/bkit-cloud-env.test.ts` |
| **T8** Prune round-trip + recording contract: record set A, shrink to B, `A \ B` grants gone from `permissions.allow`; a hand-added grant bkit never recorded survives; absent `webFetchDerived` prunes nothing; file-absent / unparseable-JSON / non-array-`allow` / `dryRun` each return `null` and leave the prior record unchanged; a steady-state no-op run **does** record `current`; a removal pushes a `webfetch-grants-pruned` advisory | Unit (Vitest) | `.bkit/src/bkit-modules.test.ts` |
| **T9** Fingerprint placement + stability: the fingerprint token appears **after** the closing fence and never between the fences in both `.claude/cloud.md` and `.cursor/cloud.md`; editing `allowed-domains` does not change it; changing the registry rows does | Unit (Vitest) | `.bkit/src/bkit-cloud-env.test.ts` |
| **T10** Provenance survives a real install: seed `.bkit/version` in a tmp consumer, spawn the real install, read the file back — `webFetchDerived` present, non-empty and equal to the resolved set; a second install with a shrunk `allowed-domains` updates it | Integration (Vitest) | `.bkit/src/bkit-install.integration.test.ts` |
| **T11** Cursor hook with no `.cursor/allowlist.json` in `cwd` asks on `https://api.github.com/...` (the case the deleted fallback used to allow), and still asks on `curl https://evil.tld/?x=openrouter.ai` | Integration (Vitest) | `.bkit/src/bkit-guardrails-cursor.integration.test.ts` |
| **T12** Both cloud renderers emit a paste fence with the shipped set when `allowed-domains` is empty — the retired zero-declared branches: no `"Set to **Trusted** (default)"` from `writeClaudeCloudDoc`, and the Cursor renderer now emits a fence where it previously asserted `not.toContain("\`\`\`")` | Unit (Vitest) | `.bkit/src/bkit-cloud-env.test.ts` |
| **T13** Cursor cloud exact-host surface: `renderCursorNetworkAllowlist` emits `BKIT_SHIPPED_NETWORK_HOSTS` verbatim with **no** `*.` expansion, unioned with declared entries | Unit (Vitest) | `.bkit/src/bkit-cloud-env.test.ts` |
| **T14** `bkit check` reports 0 writes on a clean install and on a clean upgrade with the provenance field present — the dry-run rule, asserted against the real engine rather than by inspection | Integration (Vitest) | `.bkit/src/bkit-upgrade.integration.test.ts` |

### 👤 ✅ Human Confirmation

- [ ] **Acceptance Scenario confirmed:** I have reviewed the Narrative, Success Criteria, Process Sketch, Concrete Example, Edge Cases, and Derived Test Matrix above. They correctly describe what "done" looks like.

> [!CAUTION]
> **Agent:** Do NOT pass Gate 1 until this checkbox is `[x]`. Summary must issue `REVISE` if unchecked.

---

## 👤 ⚠️ Breaking Changes & Naming Review — HUMAN REVIEW REQUIRED

> [!CAUTION]
> **🛑 HUMAN MUST READ AND CONFIRM THIS SECTION.**
> Review proposed names and breaking changes below.

> [!WARNING]
> **Runtime behaviour change every consumer sees: the "Trusted is enough" guidance retires.** Today a consumer with no `allowed-domains` block is told to leave Claude's network mode on **Trusted** (`.bkit/src/bkit-cloud-env.ts:545-553`) and is told by Cursor's renderer that "nothing extra is required here" (`:645-654`). Both become false the moment shipped hosts union into the cloud paste: Trusted covers package registries and GitHub, not `api.githubcopilot.com` or `api.tavily.com`. After this change **both renderers are single-branch** and always emit a paste block, so a zero-declaration consumer must move Claude to **Custom** and, if their org enforces it, Cursor to **Allowlist only**. This is the fix, not a regression — but it is a one-time manual dashboard step for every existing consumer, and nothing in the toolchain can perform it for them.

**Naming — new and changed symbols**

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
| `enrichClaudeSettingsWebFetch` | **BREAKING signature** | `bkit-modules.ts:1751` | `void` → `readonly string[] \| null`; gains an `advisories: PreflightFinding[]` parameter. Blast radius verified — exactly two call sites: `bkit-modules.ts:1062` (`runClaudeModule`) and `bkit-install.ts:2588` (upgrade), plus the import at `bkit-install.ts:33`. No test asserts its return today. |
| `updateCanonicalHashesAfterUpgrade` | **BREAKING options** | `bkit-upgrade.ts:465` | `options` gains `webFetchDerived?: readonly string[] \| null`. One call site: `bkit-install.ts:2615` (import at `:61`). Additive-optional, so existing callers compile unchanged. |
| `webFetchDerived` | NEW required field | `.bkit/version` JSON envelope | Required-with-parser-default `[]`, exactly like `canonicalHashes`. See `Data Schema Integration`. |
| `webfetch-grants-pruned` | NEW advisory id | `PreflightFinding.id` | `severity: "advisory"`. |
| `OPENCODE_PROVIDER_DEFAULTS` | MOVED | `bkit-modules.ts:1461-1518` → `bkit-registry.ts` | Module-private `const`, 4 in-file call sites (`:1526`, `:1536`, `:1659`, `:1995`). Relocation plus one import line; **no external call site, no test import, no public API change.** |

**Breaking file-structure and content changes**

<!-- prettier-ignore -->
| Artifact | Change | Consumer-visible effect |
| --- | --- | --- |
| `.cursor/hooks/guardrails.cjs` + its template twin | `SHIPPED_NETWORK_BASES` (`:115-126`) and its `keep in sync with …` comment **deleted**; `loadNetworkAllowlistBases()` starts from an empty `Set` | A consumer who deletes or gitignores `.cursor/allowlist.json` now gets an **ask** on every outbound `curl`/`wget`, including `github.com`. Fail-safe, but noisy, and reads as "bkit is broken" until they re-run `bkit install`. The ask message names the file and the command. |
| `.bkit/templates/.claude/settings.json:10-22` | 13 `WebFetch(domain:…)` entries **removed** (the seed is a stale partial subset — apex missing for 7 of 10 bases) | None at install: `enrichClaudeSettingsWebFetch` runs in the same pass that writes the file. `deepContains` array-subset semantics mean `bkit check` can only get looser. **Does** regress `bkit uninstall` hygiene — see `Out of Scope`. |
| `.cursor/allowlist.json` | Content widens from 11 to 16 domains-with-wildcards on the bkit repo; full rewrite each install | Manifest entry at `bkit-manifest.ts:574` is `format: "byte-equal-text"` with `generated: true`, so its hash lands in per-consumer `canonicalHashes` and varies per consumer by design. |
| `.claude/cloud.md`, `.cursor/cloud.md` | Always carry a paste fence; gain an 8-hex `Allowlist fingerprint: …` token in the italic line **after** the closing fence | Both files are gitignored and untracked — no manifest, no `canonicalHashes`, no hash gate. |
| `.bkit/version` | Gains `webFetchDerived: string[]` | Old payloads without the field parse to `[]` = "no record" = prune nothing. Excluded from the published package (`package.json:22`). |
| `dist/bkit-registry.js` | NEW build output, must be committed | `pnpm bkit:check:dist` (`package.json:61`) fails CI otherwise. |
| `.bkit/src/bkit-permissions-parity.integration.test.ts:173-191` | Whole `describe("cross-host gate parity — network allowlist")` block **deleted** | Both halves of its assertion are removed by this change (WS-4 deletes the array it regexes out of `guardrails.cjs`; WS-5 empties the `settings.json` side). T4 subsumes it properly, from a derived source. Without a named owner CI goes red mid-build. |

**Not breaking, stated to pre-empt the question:** no CLI flag, no config key, no `.agents/config.md` syntax and no public export is renamed or removed. `allowed-domains` keeps exactly its current meaning — consumer stack domains — and gains the rule that provider/tooling hosts must **not** be re-declared there.

### 👤 ✅ Human Confirmation

- [ ] **Breaking Changes confirmed:** I have reviewed all breaking changes and naming decisions above.

> [!CAUTION]
> **Agent:** Do NOT pass Gate 1 until this checkbox is `[x]`. Summary must issue `REVISE` if unchecked.

---

## 👤 ⚠️ Open Questions & Assumptions — HUMAN REVIEW REQUIRED

> [!CAUTION]
> **🛑 HUMAN MUST READ AND CONFIRM THIS SECTION.**
> Unknowns needing a decision, and assumptions this plan relies on. Each unresolved question is a risk — a wrong assumption breaks everything downstream. If none, write "None".

**Assumptions**

- **Assumption:** The 4-key `OPENCODE_PROVIDER_DEFAULTS` and the 10-base shipped list are the shape this change builds on, not a transient state mid-#435. → If #435 Phase 2 lands a different provider registry shape while this is in flight, WS-1's move and the completeness test key on a set that no longer exists and WS-1/WS-2 need rebasing.
- **Assumption:** `.bkit/version` is excluded from the published package (`package.json:22`, `"!.bkit/version"`) and is already consumer-varying via `canonicalHashes`, so recording the consumer's own `allowed-domains` in `webFetchDerived` is not a contradiction of "no consumer content in bkit-owned artifacts". → If `.bkit/version` were ever published or hash-gated cross-consumer, the provenance record would leak consumer stack domains.
- **Assumption:** The hook and `.cursor/allowlist.json` are written in the same pass — `runCursorModule` writes the hook at `.bkit/src/bkit-modules.ts:1309-1310` and the artifact at `:1396-1400`; upgrade writes the artifact at `.bkit/src/bkit-install.ts:2576` under the same cursor gate. → If that pairing breaks, deleting the hook's fallback strands consumers asking on every `curl`.
- **Assumption:** `deepContains` array-subset semantics make emptying the `settings.json` template WebFetch seed safe for `bkit check`. → If containment were changed to exact-array, emptying the seed would make every consumer's `settings.json` read as drift.
- **Assumption:** `ModuleContext` is one shared object across module fns and `MODULE_DISPATCH_ORDER` (`.bkit/src/bkit-modules.ts:3606-3609`) runs `core` before `claude` while core's `postDispatch` (`:887`) runs after all modules return. → If dispatch order changed, `ctx.webFetchRecorded` would be read before `runClaudeModule` set it and the record would be permanently `[]`.
- **Assumption:** No test anywhere asserts a `WebFetch(domain:…)` literal except the parity assertion WS-4 deletes — the cross-host gate-parity table covers **bash** gates. Re-verified: the only other `WebFetch(domain:` occurrences are `.bkit/src/bkit-modules.ts` JSDoc + generator and the template file itself. → If a hidden assertion exists, emptying the seed turns CI red with no owner.
- **Assumption:** The derived union (14 bases) is a strict **superset** of today's shipped 10, so no existing grant is lost and the first prune has nothing to remove. → If a base were dropped instead, the first post-record install would revoke a live grant.

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

- **Open Question 6:** Is there a practical upper bound on the Claude-web / Cursor "Allowed domains" dashboard field? → Unmeasured; 14 bases is ~28 lines today.
  - **Options:** A — Ship and probe only if the fan-out grows past ~10x · B — Probe now by pasting a synthetic 200-line list into both dashboards before ship · C — Cap the emitted list and document truncation.
  - **Recommended:** A — ~28 lines is far from any plausible cap, and B costs two live dashboard sessions to answer a question with no current consequence.
  - **Default if unanswered:** A.

### 👤 ✅ Human Confirmation

- [ ] **Open Questions & Assumptions confirmed:** I have resolved or explicitly accepted every open question and assumption above.

> [!CAUTION]
> **Agent:** Do NOT pass Gate 1 until this checkbox is `[x]`. Summary must issue `REVISE` if unchecked.

---

## Alternative Approaches & Recommendations

**Selection Rule:** pick the approach with the best quality-of-end-state, NOT the smallest diff / lowest cost-of-change. In-scope work = complete or explicitly moved to `Out of Scope` — no 90% solutions or silent shortcuts.

**Chosen:** derive one table (`BKIT_EGRESS_SOURCES`) from every shipped bkit registry, compute both derived exports from it in the coverage-measured file, fan out to all five surfaces in the same install pass, delete both hand-maintained copies outright, and record what was written in `.bkit/version` so a prune is possible.

<!-- prettier-ignore -->
| Approach | Verdict | Why |
| --- | --- | --- |
| Whole-registry **static** derivation into a consumer-invariant constant | **CHOSEN** | Keeps `BKIT_SHIPPED_NETWORK_DOMAINS` install-state-independent, which is what keeps the `guardrails.cjs` managed block byte-equal and `bkit check` clean for every consumer. Also survives a provider switch with no re-paste, which the issue's literal "reactive" ask does not. |
| Declared `egress` with a derivation **gate** | **CHOSEN (merged)** | Derive last-two-labels by default; a row declares `bases` only when the gate rejects the default. All four current `opencode-provider` entries pass unchanged, so routine authoring cost is zero while the next bad case fails the suite. |
| **Delete** the hook's fallback list | **CHOSEN** | Elimination beats automation. The hook and `.cursor/allowlist.json` are written in the same `runCursorModule` pass (`bkit-modules.ts:1309-1310` / `:1396-1400`) and under the same upgrade gate (`bkit-install.ts:2576`), so the artifact exists whenever the hook does; an empty set degrades to **ask**. |
| Prune via a `.bkit/version` provenance record | **CHOSEN** | `previous \ current` is the narrowest removal set available and is the only thing that makes Success Criterion 4 satisfiable, because `permissions.allow` carries no provenance. |
| Installed-set (**reactive**) derivation keyed on `bkit.opencodeProviders` — the issue body's literal ask | **REJECTED** | Install-state-varying content inside the `guardrails.cjs` managed block breaks `bkit check` for every consumer (the block is byte-equal under `markered-text`, `bkit-manifest.ts:19`, `:554-559`). It also forces `cwd` threading through the constant's downstreams and makes the human-pasted cloud allowlist go stale on every provider change. Reachability is not a credential — carrying `ollama.com` on a repo that installed `openrouter` costs nothing, because no `OLLAMA_API_KEY` exists to use it. |
| Two-tier static-floor / reactive-ceiling hybrid | **REJECTED** | Feasible — `.claude/cloud.md` is untracked and `.cursor/allowlist.json` is `generated` — but it creates a permanent per-surface asymmetry ("why does the Cursor hook allow a host Claude WebFetch does not?") and re-litigates static-vs-reactive once per surface forever. |
| Codegen the hook's array at `pnpm build`, or keep the copies with a parity test | **REJECTED** | Recreates the exact failure being removed: a build step that can silently not run, leaving two copies drifting. The parity test that exists today (`bkit-permissions-parity.integration.test.ts:173-191`) is precisely this shape, and it is being deleted, not extended. |
| `psl` / `tldts` runtime dep, or a vendored public-suffix subset | **REJECTED** | Solves `example.co.uk`, which barely occurs in AI-provider hosts, and does **not** solve the case that actually widens egress: `*.amazonaws.com` is every S3 bucket on the internet and `*.googleapis.com` is Drive, Gmail, GCS and IAM to an agent that may hold an ambient cloud token. Wrong tool for the risk, plus a snapshot dataset needing Renovate bumps. |
| Exact host only, no base collapse | **REJECTED** | Narrows relative to today's shipped constant, and a vendor moving an endpoint to a sibling subdomain would kill every cloud run until a bkit release **plus** a human re-paste. |
| Unified runtime artifact read by all three IDE surfaces | **REJECTED** | Blocked by the target tools' schemas, not by bkit: Claude `permissions.allow` and OpenCode `permission.bash` both need literal per-host strings with no file-reference primitive. Delivers for 1 of 3 surfaces. Already recorded as `docs/deferrals.jsonl` key `381-unified-runtime-allowlist-artifact-all-hosts`. |
| Let `enrichClaudeSettingsWebFetch` write `.bkit/version` itself | **REJECTED (plan-level)** | Install's `postDispatch` writer builds a **fresh object literal** (`bkit-modules.ts:955-959`) and reads the existing file only for the two hash maps, so anything enrich wrote is clobbered before the install ends — the record would be permanently `[]` and the prune dead code. Pushing `.bkit/version` into `ws.writes` from enrich instead makes `bkit check` permanently red. Threading through `ctx` into the one existing writer per path keeps `.bkit/version` single-writer and makes the dry-run rule fall out for free. |

**Future-phase recommendations:** fold the provider **key-set** mirrors (`OPENCODE_PROVIDERS` in `bkit-cli.ts`, `OPENCODE_PROVIDER_COLUMN` / `EFFORT_COLUMN_FOR_PROVIDER` in `bkit-install.ts`, the two Models doc tables) into the leaf this change creates — already recorded as `docs/deferrals.jsonl` key `381-provider-registry-key-mirror-consolidation`, and cheap once the leaf exists.

## Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why `Exempt` | Where it belongs |
| --- | --- | --- |
| `bkit upgrade` does not write `.bkit/advisories.md` | Genuinely additive: a general install/upgrade finalisation-parity gap that pre-dates this issue and affects **every** advisory, not just the prune's. `writeAdvisoriesArtifact` is called only from the doctor branch (`bkit-install.ts:2133`) and the install/check path (`:2945`). The prune does not depend on it — `git diff .claude/settings.json` is durable on every path. Plan-sized because closing it means restructuring the upgrade branch's finalisation, not adding a call. | Follow-up issue. Mirrored as `docs/deferrals.jsonl` key `381-upgrade-does-not-write-advisories-artifact` (`reason: own-cycle`). |
| WebFetch grants survive `bkit uninstall` once the template seed is emptied | Genuinely additive: `.claude/settings.json` uninstall uses `stripTier2JsonScope` against the manifest template, so with the seed empty, enrich-added grants are no longer template-scoped and are left behind. A real consequence of emptying the seed, but an uninstall-hygiene concern with its own shape — the fix is a provenance-aware uninstall path, which is the same class of change as the prune itself, on a different verb. | Follow-up issue. Mirrored as `docs/deferrals.jsonl` key `381-webfetch-grants-survive-uninstall-after-seed-emptied` (`reason: own-cycle`). |
| Ask-rate signal in the Cursor hook | Genuinely additive and declared out of scope by the design before work started: `guardrails.cjs` runs on every command in an editor session and its managed block is hash-gated, so adding output there is new runtime behaviour in a shipped, drift-gated hook — a different change with its own review surface. The degraded state is already self-diagnosing via the ask message naming `.cursor/allowlist.json` + `bkit install`. | Follow-up issue. Mirrored as `docs/deferrals.jsonl` key `381-cursor-hook-ask-rate-signal` (`reason: scope-declared`, referencing `docs/plans/202607/381-provider-egress-domains-design.md § Deferrals to record`). |
| Bootstrap-time cloud reachability probe / stale-paste detection | Genuinely additive: a new cloud-session capability, not a derivation change. This plan ships the fingerprint + runbook as the cheap half; detection needs the cloud bootstrap hook to echo and compare. | Already recorded — `docs/deferrals.jsonl` key `381-cloud-allowlist-staleness-detector`. No new row. |
| A stricter OpenCode encoding than `curl *{base}*` | Genuinely additive and hard-bounded by OpenCode's permission schema — no URL-host primitive exists to switch to. WS-6 **documents** the weakness rather than implying it. | Already recorded — `docs/deferrals.jsonl` key `381-opencode-curl-glob-substring-bypass`. No new row. |
| A unified runtime allowlist artifact read by all three IDE surfaces | Genuinely additive and blocked by Claude `permissions.allow` / OpenCode `permission.bash` requiring literal per-host strings. | Already recorded — `docs/deferrals.jsonl` key `381-unified-runtime-allowlist-artifact-all-hosts`. No new row. |
| Consolidating the opencode provider **key-set** mirrors (`bkit-cli.ts`, `bkit-install.ts` column maps, the two Models doc tables) | Genuinely additive: this issue is scoped to egress **hosts**. The key-set duplication is a separate list with a separate parity test, and folding it in would double the change's blast radius across the CLI surface. | Already recorded — `docs/deferrals.jsonl` key `381-provider-registry-key-mirror-consolidation`. No new row. |
| The #435 Phase 2 IDE-vs-model-provider restructure | Genuinely additive: a different issue's architecture. This plan builds on the post-Phase-1 shape and records the sequencing choice as Open Question 5. | #435. No deferral row — it is an open issue with its own plan. |

> [!CAUTION]
> **Default = in-scope.** Every row above is genuinely-additive: none is required by a `Success Criteria` bullet, a `Derived Test Matrix` row, or an Architecture change in this plan. Three carry NEW `docs/deferrals.jsonl` rows; four are already recorded from the design phase and must NOT be duplicated (`.bkit/jsonl.md` § Identity / Dedup — identity match with nothing changed → skip).

## Suggested Scope Expansion

<!-- prettier-ignore -->
| Candidate | Source | Overlaps | Recommendation |
| --- | --- | --- | --- |
| Derive the CLI provider allowlist and the display/effort column maps from the new leaf, plus a key-set parity test over every mirror | `docs/deferrals.jsonl` key `381-provider-registry-key-mirror-consolidation` | WS-1 exactly — the deferral names `.bkit/src/bkit-registry.ts` as the home this change creates, and `bkit-cli.ts:40` carries the same `keep in sync with …` comment pattern this issue exists to remove | **Keep deferred.** Doubles the change's blast radius onto the CLI parse surface, and is far cheaper once the leaf exists. Revisit immediately after this lands. |
| `bkit upgrade` writes `.bkit/advisories.md` | `docs/deferrals.jsonl` key `381-upgrade-does-not-write-advisories-artifact` (new, this plan) | WS-5's removal-record contract — folding it in would make destination (2) apply on the upgrade path too | **Keep deferred.** Needs the upgrade branch's finalisation restructured; the prune is durable via `git diff` on every path without it. |
| Provenance-aware `bkit uninstall` for enrich-added `WebFetch` grants | `docs/deferrals.jsonl` key `381-webfetch-grants-survive-uninstall-after-seed-emptied` (new, this plan) | WS-5's emptied template seed is what creates the gap | **Needs design decision.** `webFetchDerived` is exactly the record an uninstall would need, so the mechanism is now available — but the uninstall decision matrix is format-driven and this would add a fourth axis. |
| Refresh the dated live-probe stamps in `.bkit/providers.md` | `docs/deferrals.jsonl` key `providers-md-dated-live-probe-stamps` | WS-3/WS-4/WS-6 all edit `.bkit/providers.md`, in three distinct sections | **Keep deferred.** Different section, different failure mode (stale model pins, not stale allowlist prose); bundling it would violate scope discipline. |

> [!CAUTION]
> **Candidates, not scope.** Entries are surfaced for human review; they do NOT become `Agent Execution Runbook` tasks and MUST NOT expand plan scope.

## Security & Privacy

> Reference: `docs/security.md`. Check all that apply; skip inapplicable rows.

- [ ] **User Input** — validated by a schema with `parse()` called in the handler? → **Applies, adapted.** `BKIT_EGRESS_SOURCES` is bkit-authored data, not user input, but the derived bases are an **egress allowlist** and a wrong one widens every consumer's reach. The validator is the WS-2 gate (T3): a derived base that is a multi-tenant apex, a multi-label public suffix, an IP literal, `localhost`, or has fewer than 2 labels fails the unit suite in the bkit repo and never ships. Consumer `allowed-domains` input reaches `expandAllowedDomains` unchanged by this plan.
- [ ] **PII** — absent from logs? → **Applies.** The prune's console lines and the `webfetch-grants-pruned` advisory print exact `WebFetch(domain:…)` strings, which can include a consumer's own app domains from `allowed-domains`. Domains are not PII and this is the consumer's own local terminal / local `.bkit/advisories.md` (gitignored). No new log point emits a token, a key, or a path outside the repo.
- [ ] **New Secret/Env Var** — added to the env schema? → **N/A.** No new secret, no new env var, no new credential read. Reachability is not a credential: an egress allowlist gates which hosts a session may contact, not what it may authenticate as.

**Deliberate widening, disclosed rather than implied.** This change adds five bases to the shipped set (`githubcopilot.com`, `models.dev`, `npmjs.org`, `skills.sh`, `tavily.com`) and removes none. Two consequences are accepted knowingly and stated in `.bkit/providers.md` in the same commit:

1. Each added base is one more `endsWith("." + base)` a lookalike host can aim at in the Cursor hook. Mitigated by the hook's label-boundary match and userinfo/port stripping (`guardrails.cjs:156-177`) — `github.com.attacker.io` and `https://github.com@evil.tld/x` both still ask.
2. Each added base is one more **substring** `curl *{base}*` glob on OpenCode, where a query parameter defeats the check (`curl https://evil.tld/?x=openrouter.ai` is allowed on OpenCode and asked on Cursor). Inherent to OpenCode's command-glob permission model; documented, and the fix is a recorded deferral.

**Net security posture improves on the Cursor surface:** deleting `SHIPPED_NETWORK_BASES` makes a missing or corrupt `.cursor/allowlist.json` fail **closed** (ask on everything) where today it fails to a hardcoded allow list.

_No new routes, no DB writes, no secrets, no new user-input handler._

## 🚨 Pre-Flight / Dependencies 🚨

**CRITICAL:** Check off ALL core items. Check conditional items only when applicable. Abort if anything required is missing.

### Core _(always verify)_

- [ ] **Package Management:** No new runtime dependency. `psl` / `tldts` were rejected (see `Alternative Approaches`); the denylists ship as data in the leaf. Confirm `pnpm install --frozen-lockfile` is clean and `pnpm-lock.yaml` is untouched by this change.
- [ ] **Dependency Versions:** `package.json:28-29` pins `engines.node >= 20`, so `URL.canParse` is available — this is load-bearing, because a `try`/`catch` around `new URL` would add a `defensive.error-obscuring` finding and fail `slop:delta` on net score even at net-zero finding count. Spot-check `node --version >= 20`, `npx tsc --version`, `pnpm --version` (pinned `pnpm@10.34.3`, `package.json:31`).
- [ ] **Existing-Solution Search (reuse over duplicate):** Done. `resolveNetworkAllowlist`, `expandAllowedDomains`, `networkAllowlistBases`, `writeNetworkAllowlistArtifact`, `injectOpencodeNetworkCurlAllows` and `enrichClaudeSettingsWebFetch` all already exist and are **extended, not replaced** — `resolveNetworkAllowlist` keeps its exact signature. `sha256` is already exported from `bkit-version.ts:190` and is cycle-free from `bkit-cloud-env.ts`, so the fingerprint needs no second hasher and no `node:crypto` import. The single `[NEW]` artifact is `.bkit/src/bkit-registry.ts`, justified in `Architecture & Component Changes`.
- [ ] **User Context:** All files are in this worktree; no external credential or user-supplied value is needed. The plan-time proof obligation needs only a writable scratch directory.
- [ ] **Project Context:** `docs/decisions.jsonl` and `docs/knowledge.jsonl` read. Load-bearing entries: decision key `opencode-provider-allowlist-cut-to-four` (#435 Phase 1 — the reason the design's row table is stale, and the reason `kimi-docs` is dropped); `bkit install` flips `core.bare=true` (reset with `git config core.bare false` after every dogfood install); `bkit check` != `bkit upgrade` (separate engines — verify both live). Four `381-*` deferral rows already exist and must not be duplicated.
- [ ] **Testing & Quality:** Aligned with `docs/testing.md`. bkit has **Unit** (`*.test.ts`) and **Integration** (`*.integration.test.ts`) only — no E2E project, no deployed boundary, so no `@live` tier exists (`docs/testing.md:325-333`). `docs/testing.md:323` forbids mocking `fs`: every boundary row in the matrix uses a real `os.tmpdir()` consumer. `package.json:58` pins the unit-coverage lane to a literal brace list including `bkit-cloud-env` and **excluding** `bkit-modules`, at `branches=70` — which is why all new branching stays in `bkit-cloud-env.ts` and the leaf stays branch-free.
- [ ] **Prerequisite Plans:** None. `docs/plans/202607/381-provider-egress-domains-design.md` is the parent design (PASS). There is no superseded plan for this FID.

### Conditional _(verify only when applicable)_

- [ ] **Secrets & Env Vars:** N/A — no new API key, credential or env var.
- [ ] **Schema State:** N/A for a database. The one schema is the `.bkit/version` JSON envelope — see `Data Schema Integration`. Confirm the envelope is still `{ pinnedVersion, tier3Hashes, canonicalHashes }` (`.bkit/src/bkit-version.ts:39`, `:46`, `:63`) before adding the fourth field.
- [ ] **Architecture & UI:** Applies — one `[NEW]` file. Import direction must stay `bkit-modules.ts` → `bkit-cloud-env.ts` → `bkit-registry.ts`, one way only; the leaf imports nothing. No UI.
- [ ] **Observability:** Applies — the prune adds console output behind the existing `LOG_PREFIX` and one new `PreflightFinding`. Shape is `{ id, severity, detect, action }` (`.bkit/src/bkit-preflight.ts`), and `.agents/rules.md` § Repo Authoring requires the `action` text to **inline** the fix rather than link to `docs/*.md`.
- [ ] **Notifications:** N/A.

### Ground-truth citation delta — re-verified in this worktree, 2026-08-26

> Every row below was read from source in this worktree today. Where a cell disagrees with the parent design or the 2026-08-24 re-check comment, **the `Now` column is correct**. Do not copy the design's line numbers forward.

<!-- prettier-ignore -->
| Fact | Design cites | 2026-08-24 re-check | **Now (verified 2026-08-26)** |
| --- | --- | --- | --- |
| `BKIT_SHIPPED_NETWORK_DOMAINS` | `:471-485`, 13 bases | `:471-485`, 13 bases | **`.bkit/src/bkit-cloud-env.ts:471-482`, 10 bases** — `github.com`, `githubusercontent.com`, `anthropic.com`, `claude.com`, `cursor.com`, `linear.app`, `opencode.ai`, `ollama.com`, `openrouter.ai`, `npmjs.com`. `nvidia.com` / `z.ai` / `moonshot.ai` / `kimi.com` removed, `openrouter.ai` added (#435 Phase 1) |
| `OPENCODE_PROVIDER_DEFAULTS` | `bkit-modules.ts:1397-1500`, 10 keys | `:1438`, 10 keys | **`.bkit/src/bkit-modules.ts:1461-1518`, 4 keys** — `openrouter`, `ollama`, `opencode-zen`, `opencode-go`. In-file call sites `:1526`, `:1536`, `:1659`, `:1995`; still module-private |
| `resolveNetworkAllowlist` | `:505-507` | `:505-506` | **`:502-503`** |
| `writeNetworkAllowlistArtifact` | `:510-538` | `:518` | **`:515-535`** |
| `renderCloudNetworkAllowlist` | `:546-557` | `:547` | **`:543`**; `declared` read `:544`; Trusted branch `:545-553`; Custom branch `:554-568` |
| `renderCursorNetworkAllowlist` | `:646-669` | `:647` | **`:643`**; `declared` read `:644`; zero-declared branch `:645-654` ("nothing extra is required here" at `:650`) |
| `SHIPPED_NETWORK_BASES` | `guardrails.cjs:109-124` | `:115-129` | **`:115-126`, 10 entries**, identical in `.bkit/templates/.cursor/hooks/guardrails.cjs` and `.cursor/hooks/guardrails.cjs`; `keep in sync with …` comment at `:114` |
| Hook managed-block bounds | — | block `22-261` | **`// bkit:start` `:22` … `// bkit:end` `:258`** — `SHIPPED_NETWORK_BASES` at `:115` is inside |
| `loadNetworkAllowlistBases` | `:126-145` | `:131` | **`:128-147`**; empty catch at `:142-145` |
| `curlWgetHostAllowed` | `:154-192` | `:192` | **`:189-194`**; `extractUrlHosts` `:156`, `hostMatchesBase` `:174` |
| Hook manifest entry | `bkit-manifest.ts:267`, `byte-equal-text` | `:428-433`, `markered-text` | **`.bkit/src/bkit-manifest.ts:554-559`, `format: "markered-text"` + `noMarkerMigration`.** Format semantics at `:19-20`: `markered-text` = marker-block extraction + **byte-equal on the block** |
| `.claude/settings.json` manifest entry | `:239`, `format: "json"` | `:303` | **`bkit-manifest.ts:312`, `format: "json"`** |
| `.cursor/allowlist.json` manifest entry | "not in any manifest" | — | **`bkit-manifest.ts:574` — it IS in the manifest**, `format: "byte-equal-text"`, `generated: true`; hash lands in per-consumer `canonicalHashes`, so it still varies per consumer |
| `enrichClaudeSettingsWebFetch` | `:1716-1758` | `:1772` | **`.bkit/src/bkit-modules.ts:1751-1778`**; additive-only JSDoc `:1736-1750`; four non-writing returns at `:1757`, `:1763-1765`, `:1767`, `:1770` |
| `injectOpencodeNetworkCurlAllows` | `:1706-1714` | `:1747` | **`:1726-1734`** |
| enrich call in `runClaudeModule` | `:1033` | — | **`:1062`** |
| `runCursorModule` hook + artifact same pass | `:1272-1281` / `:1332-1341` | — | **hook `:1309-1310`, artifact `:1396-1400`** |
| Upgrade-side artifact / enrich / version writer | `bkit-install.ts:2595-2604` / `:2605-2616` | `:2627` / `:2639` | **artifact `bkit-install.ts:2576`, enrich `:2588`, `updateCanonicalHashesAfterUpgrade` `:2615`**; imports at `:33`, `:43`, `:61` |
| `updateCanonicalHashesAfterUpgrade` | `bkit-upgrade.ts:446-481` | — | **`.bkit/src/bkit-upgrade.ts:465-501`**; `dryRun` return `:469`, `!bkitVersion` `:474`, nothing-to-persist `:493`, spread `:495-499` |
| Install-side `.bkit/version` fresh literal | `:924-928` | — | **`.bkit/src/bkit-modules.ts:955-959`**; `postDispatch.push` `:887`, `needsWrite` `:946`, `.bkit/version` excluded from `byteEqualPaths` `:900` |
| `parseBkitVersion` returns / `BkitVersion` fields | `bkit-version.ts:104`, `:110` | — | **`.bkit/src/bkit-version.ts:103` and `:112`**; required fields `:39`, `:46`, `:63`; `sha256` `:190` |
| `ModuleContext` / dispatch order | `:3529-3542` / `:3511-3522` | — | **`ModuleContext` `bkit-modules.ts:174`, `postDispatch` field `:205`, `MODULE_DISPATCH_ORDER` `:3606-3609`** (`core` → `claude` → `cursor`) |
| Unit-coverage brace list | `package.json:47` | — | **`package.json:58`** (`test:coverage:unit`), `branches=70`; carries `bkit-cloud-env`, not `bkit-modules` |
| dist staleness gate | `pnpm check:dist` | — | **script name is `bkit:check:dist`**, `package.json:61`. Build is `pnpm build` (`:60`) |
| `.bkit/version` excluded from package | `package.json:22` | `:22` | **`package.json:22`** — `"!.bkit/version"` ✓ |
| slop-scan exemptions | `:155-163`, `:173-181` | `:166`, `:183` | **`networkAllowlistBases` `_reason` `slop-scan.config.json:166`; guardrails empty-catch `files` `:183`, `_reason` `:184`** (the prose to rewrite) |
| `settings.json` template WebFetch seed | `:10-28`, 19 entries, 7 of 13 apexes missing | 19 entries | **`.bkit/templates/.claude/settings.json:10-22`, 13 entries, apex missing for 7 of 10 bases** (`githubusercontent`, `anthropic`, `claude`, `linear`, `opencode`, `ollama`, `openrouter`) |
| Parity assertion to delete | "no test references it" | `:173-190` | **`.bkit/src/bkit-permissions-parity.integration.test.ts:173-191`** — whole `describe` block; `expect(block).not.toBeNull()` at `:177` |
| Existing tests this change breaks | `bkit-cloud-env.test.ts:326-330`, `:399-403` | — | **`:326-331`** (`"Set to **Trusted** (default)"`), **`:399-403`** (same + `"No \`allowed-domains\` block declared"`), and — not previously found — **`:478-483`**, the Cursor zero-declared case asserting `expect(out).not.toContain("\`\`\`")`, which flips when that branch retires |
| `BKIT_SHIPPED_NETWORK_DOMAINS` assertions | `:405-408`, negative only | `:405-408` | **`:405-408`** ✓ — negative (`not.toContain("vercel.com" / "supabase.com")`), survive the switch to a computed constant, keep them |
| Cursor guardrails hook tests | — | — | **`.bkit/src/bkit-guardrails-cursor.integration.test.ts:44-92`** spawns the hook with `cwd` = repo root, so `.cursor/allowlist.json` (11 domains incl. `tavily.com`) supplies the `allow` — its `api.github.com` assertions **survive** WS-4 but stop discriminating. WS-4 owes a no-artifact negative case (T11) |
| `.bkit/providers.md` § Network allowlist | `:260-275`, line 273 | `:279`, `:281` | **section header `:264`, encoding table `:270-275`, hook-fallback sentence `:277`, cloud-egress-from-`allowed-domains` sentence `:279`** |
| `.agents/config.md` § Cloud allowed domains | `:111-118` | `:283` | **`:276` header, `:283`** ("A `context=web` block's search host belongs here too … renders from THIS block alone"), example block `:287-298` (`tavily.com` `:292`), dogfood block `:307-312` (`tavily.com` `:310`); template twin identical at `.bkit/templates/.agents/config.md:276-298` |
| `docs/observability.md` § Debug Fetch | — | `:20` | **`:20`** ✓ + template mirror `.bkit/templates/docs/observability.md` |
| `.bkit/cloud.md` Trusted guidance | `:109-111` | — | **`:113`** |
| `.bkit/workflows.md` WebFetch row | `:1124` | — | **`:1277`** (permission table row, worded generically — "per host in the network allowlist"), plus `:1281` |
| `.bkit/README.md` allowlist pointer | `:345` | — | **`:270`** (`.cursor/allowlist.json` row) and **`:370`** (providers.md pointer) |
| `.bkit/templates/.claude/cloud.md` sections | § 2 + § 5 | — | **`## 2 · Network access` `:21`, token `@@CLOUD_NETWORK_ALLOWLIST@@` `:23`, `## 5 · Verify (first session)` `:87`** |
| `.bkit/templates/.cursor/cloud.md` sections | § 4 + § 5 | — | **`## 4 · Network access` `:67`, token `@@CURSOR_NETWORK@@` `:69`, `## 5 · Verify (first session)` `:71`** |
| Live gaps this change closes | 6 hosts | 6 hosts | **4 hosts** — `api.githubcopilot.com`, `models.dev`, `skills.sh`, `api.tavily.com`. `groq.com` / `cerebras.ai` no longer exist as providers; `openrouter.ai` already shipped |
| Registry row count / derived union | 20 rows / 19-20 bases | 20 rows | **13 rows / 15 bases** (Open Questions 1, 2 = default). The union is a strict **superset** of today's 10 — nothing is removed |

### 🔒 Gate 1: Prerequisites Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all applicable boxes above. **DO NOT stop for user permission.** Once saved, immediately proceed to `Data Schema Integration`.

- [ ] **Acceptance Scenario confirmed:** Human confirmed `👤 Acceptance Scenario` section (checkbox is `[x]`). _(Unchecked → Summary must issue `REVISE`.)_
- [ ] **Breaking Changes confirmed:** Human confirmed `⚠️ Breaking Changes & Naming Review` section (checkbox is `[x]`). _(Unchecked → Summary must issue `REVISE`.)_
- [ ] **Open Questions confirmed:** Human confirmed `👤 Open Questions & Assumptions` section (checkbox is `[x]`). _(Unchecked → Summary must issue `REVISE`.)_
- [ ] **Security & Privacy checked:** All applicable `Security & Privacy` rows verified (or "None" justified).
- [ ] **Gate 1 - Verified:** All Core items checked. All applicable Conditional items checked.

## Data Schema Integration

**No database.** bkit ships no DB, no migration lane and no `docs/data-schema.md` rows. The one persisted schema this change touches is the **`.bkit/version` JSON envelope** — a per-consumer local state file, gitignored in consumer repos and excluded from the published package (`package.json:22`, `"!.bkit/version"`).

**Invariant Conformance.** `.bkit/version` has exactly **one writer per path** and this change must not create a second. Install writes it from `runCoreModule`'s deferred `postDispatch` (`.bkit/src/bkit-modules.ts:887-962`, fresh object literal at `:955-959`); upgrade writes it from `updateCanonicalHashesAfterUpgrade` (`.bkit/src/bkit-upgrade.ts:465-501`, spread at `:495-499`). The two disagree today — install builds a fresh literal and drops unknown fields, upgrade spreads and preserves them — so a field added only to the upgrade side is silently clobbered on the next install. `enrichClaudeSettingsWebFetch` therefore **never** touches `.bkit/version`: it returns the set it wrote, and the existing writer on each path persists it. A write that cannot happen (dry-run, enrich early return, claude-less install) resolves to carry-forward, never clobber-to-empty; a failure is visible as `bkit check` reporting a write, which is what Success Criterion 3 gates.

### Data Schema Usage (Inputs & Outputs)

- **Input (Read):** `.bkit/version` → `pinnedVersion`, `tier3Hashes`, `canonicalHashes` (existing, unchanged reads); `.bkit/version` → `webFetchDerived` (new read, both paths, defaulting to `[]`). `.agents/config.md` `allowed-domains` block via `extractAllowedDomains`. `.claude/settings.json` → `permissions.allow`. `.cursor/allowlist.json` → `domains` (read by the hook at runtime).
- **Output (Write):** `.bkit/version` → `webFetchDerived` (new); `.claude/settings.json` → `permissions.allow` (now **add and remove**, previously add-only); `.cursor/allowlist.json` → `domains` (unchanged path, wider content); `.opencode/opencode.json` → `permission.bash` `curl *…*` / `wget *…*` keys (unchanged path, wider content); `.claude/cloud.md` / `.cursor/cloud.md` (untracked, regenerated).

### Data Schema Changes

- **ADD:** `.bkit/version` → `webFetchDerived: string[]` — the exact `WebFetch(domain:…)` strings bkit wrote into `.claude/settings.json` on the last install/upgrade that actually wrote it.
  - **Required, not optional.** `canonicalHashes` is a _required_ property of the `BkitVersion` interface with its `{}` default applied inside `parseBkitVersion` (`.bkit/src/bkit-version.ts:63`, `:97-103`). "Additive exactly like `canonicalHashes`" therefore means `webFetchDerived: string[]` required-with-parser-default `[]`, **not** `webFetchDerived?: string[]`.
  - **Three construction sites gain the field:** `.bkit/src/bkit-modules.ts:955-959` (install literal) and the two `parseBkitVersion` returns at `.bkit/src/bkit-version.ts:103` and `:112`. The `{ ...bkitVersion, … }` spreads in `bkit-upgrade.ts` are untouched.
  - **Typecheck blast radius: none in tests.** `tsconfig.json` excludes `**/*.test.ts` from `tsc --noEmit`, so the existing test-side `tier3Hashes:` object literals do not break.
  - **Backward compatibility:** old payloads without the field parse to `[]` = "no record" = prune nothing. This is why the first run after upgrading to this version can never remove a grant.
  - **Consumer content in the field, stated plainly:** the recorded set is `resolveNetworkAllowlist(cwd)`, which includes the consumer's own `allowed-domains`, so a consumer's `sentry.io` lands in `.bkit/version`. Accepted: `.bkit/version` is already consumer-varying (`canonicalHashes` keys are per-consumer paths) and is not published. The rule this design defends is about **hash-gated shipped** artifacts — the `guardrails.cjs` managed block — not the local state file. Recording only bkit's own subset would break Success Criterion 4, because a consumer-declared domain leaving `allowed-domains` is exactly the removal that criterion requires.
- **MODIFY:** none. **DELETE:** none.

## Architecture & Component Changes

**CRITICAL:** Prefer `[MODIFY]` over `[NEW]`. Every `[NEW]` states why an existing artifact cannot be evolved. **CRITICAL:** never weaken a gate to pass — no `as any`, `@ts-ignore`, `.skip`, deleted assertions, empty `catch`, or mocking-away the unit under test. **CRITICAL:** `.agents/rules.md` § Repo Authoring — edit source only (`.bkit/src`, `.bkit/templates`, `.bkit/workflows`, `.bkit/prompts`, `.agents/`); **never** edit mirrors in `.claude/`, `.cursor/`, `.opencode/` directly, and batch `bkit install` mirror regeneration **once** at session end.

### Database Migrations

None. bkit ships no database and no migration lane.

### Registry (WS-1)

#### [NEW] `.bkit/src/bkit-registry.ts`

- **Why an existing artifact cannot be evolved.** The data must be readable by both `bkit-cloud-env.ts` (which computes the derived exports) and `bkit-modules.ts` (which reads provider config). `bkit-modules.ts` already imports from `bkit-cloud-env.ts` (import block ending `bkit-modules.ts:74`), and both symbols are module-init `const`s, so putting the table in `bkit-cloud-env.ts` and the provider defaults in `bkit-modules.ts` leaves the existing one-way edge intact but keeps `OPENCODE_PROVIDER_DEFAULTS` unreachable from the derivation. Putting the table in `bkit-modules.ts` inverts the edge into a genuine cycle. A leaf that imports nothing is the only shape that satisfies both.
- **Pure data, import-free, branch-free.** Branch-free is load-bearing, not stylistic: `package.json:58` pins the unit-coverage lane to a literal brace list of measured files at `branches=70`, and a new file is not in that list. Any branching here would move gated branches out of the measured set — the same accounting hazard already recorded in `slop-scan.config.json:166` for `networkAllowlistBases`.
- **Contents:** the `EgressSource` type; `OPENCODE_PROVIDER_DEFAULTS` (relocated verbatim); `BKIT_EGRESS_SOURCES` (13 rows); `MULTI_LABEL_SUFFIXES`; `MULTI_TENANT_APEXES`; the one-sentence invariant that the gate is a **deny**, so an unknown platform apex passes; and the recorded deliberate absences.
- **`BKIT_EGRESS_SOURCES` — 13 rows** (Open Question 1 = A, 2 = A, 4 = A). `opencode-provider` rows derive from `OPENCODE_PROVIDER_DEFAULTS[key].baseURL` at module init; every other `kind` is declared, because no `baseURL` exists to derive from. `kind` carries **no behaviour**.

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
- **`BKIT_SHIPPED_NETWORK_DOMAINS`** becomes a sorted-unique flatMap of every row's `bases` — **same name, same `readonly string[]` type**, so `resolveNetworkAllowlist` (`:502-503`) and its four downstreams need no signature change. **`BKIT_SHIPPED_NETWORK_HOSTS`** added as the sorted-unique flatMap of every row's `hosts`; single consumer, `renderCursorNetworkAllowlist`.
- `resolveNetworkAllowlist` and `expandAllowedDomains` are **untouched**.
- The JSDoc at `:465-470` ("Stack-agnostic tooling hosts only … **Never** ship observability / app stacks here") must be rewritten in the same edit to describe the derived source, not a hand-maintained list.
- No new slop-scan exemption is needed: the two cited exemptions are **file-scoped**, so new functions in this file inherit the pass-through exemption.

### Cloud paste surfaces (WS-3)

#### [MODIFY] `.bkit/src/bkit-cloud-env.ts` — both renderers, fingerprint

- `renderCloudNetworkAllowlist` (`:543`): switch from `expandAllowedDomains(extractAllowedDomains(cwd))` to `resolveNetworkAllowlist(cwd)`. **This is the literal #381 defect.**
- **[DELETE] the Claude `declared.length === 0` "Trusted default" branch (`:545-553`)** — replaced by a single always-Custom block carrying the bkit set plus the existing pointer prose inviting stack domains.
- **[DELETE] the Cursor `declared.length === 0` branch (`:645-654`)** — "nothing extra is required here" becomes flatly false once shipped hosts always union in. `renderCursorNetworkAllowlist` unions `BKIT_SHIPPED_NETWORK_HOSTS` (exact hosts, **no `*.` expansion**) with the consumer's declared entries verbatim, preserving Cursor's deliberate no-wildcard policy. Both renderers end up single-branch.
- **Fingerprint:** 8 hex chars from the `sha256` already exported at `.bkit/src/bkit-version.ts:190` (cycle-free from here; no second hasher, no `node:crypto` import), hashed over the **derived set only, never the consumer union** — so it changes at bkit-release cadence rather than on every `allowed-domains` edit, which is what stops it training consumers to ignore it. Rendered as prose appended to the italic line that **follows the closing fence** in both renderers. Nothing inside the ` ```text ` fence changes, because the doc instructs the consumer to paste the fence content verbatim into a vendor "Allowed domains" field — a line inside it would be submitted as if it were a domain.

### Cursor hook (WS-4)

#### [DELETE] `SHIPPED_NETWORK_BASES` from `.bkit/templates/.cursor/hooks/guardrails.cjs:114-126`

- The array plus its `keep in sync with BKIT_SHIPPED_NETWORK_DOMAINS` comment. Edit the **template** only; `.cursor/hooks/guardrails.cjs` is a mirror regenerated by `bkit install` at session end (`.agents/rules.md` § Repo Authoring).
- `loadNetworkAllowlistBases()` (`:128-147`) starts from an empty `Set` and reads `.cursor/allowlist.json` alone. Empty set → `curlWgetHostAllowed` (`:189-194`) returns false for any parseable URL → **ask**, the fail-safe direction #394 established ("guessing here converts an ask into an allow").
- The ask message (`:105-108`) names `.cursor/allowlist.json` and `bkit install`, so the degraded state is self-diagnosing without a fallback list.
- **No two-entry safety floor** (`github.com` + `npmjs.com`): two entries is still a hand-maintained list that can rot, and the case it guards cannot occur — the hook only exists because `bkit install` put it there, and that same pass wrote the artifact.
- **Gating restated correctly:** the file is `format: "markered-text"` (`.bkit/src/bkit-manifest.ts:554-559`), not whole-file `byte-equal-text`. The **managed block** is still byte-equal (`bkit-manifest.ts:19`) and `SHIPPED_NETWORK_BASES` at `:115` sits inside it (`// bkit:start` `:22` … `// bkit:end` `:258`), so install-state-varying content there would still break `bkit check` for every consumer. The static-vs-reactive conclusion survives on this ground, plus two reasons that never depended on file format: a hand-pasted list goes stale on every provider switch, and reachability is not a credential.

#### [DELETE] `.bkit/src/bkit-permissions-parity.integration.test.ts:173-191`

- The whole `describe("cross-host gate parity — network allowlist")` block. It regex-extracts `SHIPPED_NETWORK_BASES = [...]` out of the template hook and compares it to the template `settings.json` WebFetch entries. **Both halves are removed by this change** — WS-4 deletes the array (`expect(block).not.toBeNull()` at `:177` fails), WS-5 empties the seed. Worth keeping in spirit as a cross-host divergence guard, which is exactly what T4 does properly, from a derived source. Named here so CI does not go red mid-build with nobody owning it.

#### [MODIFY] `slop-scan.config.json:183-184`

- The exemption stays; its `_reason` prose becomes factually wrong. Rewrite from "fail-OPEN … the shipped fallback is correct behaviour" to "must not crash the editor session; a corrupt or absent artifact degrades to **ask**". Same commit.

### Claude WebFetch — provenance and prune (WS-5)

#### [MODIFY] `.bkit/src/bkit-version.ts`

- `BkitVersion` gains required `webFetchDerived: string[]`; both `parseBkitVersion` returns (`:103`, `:112`) default it to `[]`.

#### [MODIFY] `.bkit/src/bkit-modules.ts` — install write path and prune

- `ModuleContext` (`:174`, `postDispatch` field at `:205`) gains `webFetchRecorded?: readonly string[] | null` (absent/null = "nothing to record this run").
- `runClaudeModule` assigns `enrichClaudeSettingsWebFetch`'s return to `ctx.webFetchRecorded` at the `:1062` call site.
- Core's `postDispatch` literal (`:955-959`) gains `webFetchDerived`, resolved as `ctx.webFetchRecorded ?? existingVersion?.webFetchDerived ?? []` — **carry-forward, never clobber-to-empty**. `needsWrite` (`:946`) extends from `versionChanged || hasNewEntries` to `… || derivedChanged`, a set comparison against `existingVersion?.webFetchDerived ?? []`; without it, a run whose only change is the derived set computes the new value and then does not write it.
- Viable only because `ModuleContext` is a single shared object handed to every module fn and `MODULE_DISPATCH_ORDER` (`:3606-3609`) runs `core` then `claude` while core's `postDispatch` executes after all modules return.
- `enrichClaudeSettingsWebFetch` (`:1751-1778`) signature becomes `(settingsDst, cwd, dryRun, ws, advisories) => readonly string[] | null`. Prune, in the same function: `previous = webFetchDerived` (absent → `[]`); `current = resolveNetworkAllowlist(cwd)` mapped to `WebFetch(domain:…)`; `add = current \ allow`; `remove = (previous \ current) ∩ allow`; `write = allow - remove + add`, only when `add` or `remove` is non-empty; `record = current`, **returned** to the caller and never written here.
- **Restructure — do not extend — the `if (missing.length === 0) return;` early return at `:1770`.** Today it is the no-op fast path; with a prune it must fall through to the removal computation, and the combined `add.length === 0 && remove.length === 0` case must still return `current` rather than `null`. Getting this backwards makes a steady-state install never record, and the prune never fires.
- **Recording contract — the record follows the write, never the intent.** Recording a claim on a non-writing path is strictly worse than the additive-only status quo, because the _next_ run's `previous \ current` would then be free to delete consumer entries bkit never authored.

<!-- prettier-ignore -->
| Path | Writes settings.json? | Returns | Why |
| --- | --- | --- | --- |
| file absent (`:1757`) | no | **null** | nothing to make a claim about |
| `JSON.parse` throws (`:1763-1765`) | no | **null** | contents unknown; a claim would be a guess |
| `permissions.allow` not an array (`:1767`) | no | **null** | same |
| `dryRun` | no | **null** | `bkit check` must never mutate provenance; this is what keeps Success Criterion 3 true |
| `add` and `remove` both empty | no (no-op) | **`current`** | the file already equals what bkit would write — the claim is true, and recording it is what lets a _later_ shrink prune |
| `add` or `remove` non-empty | yes | **`current`** | the claim matches the bytes just written |

- **The honest guarantee**, required verbatim in both the code comment and the JSDoc that replaces the additive-only one at `:1736-1750`: _the prune can only remove a grant bkit **recorded writing**. It cannot remove a grant bkit never recorded. It **can** remove a grant the consumer added by hand if that exact string was also in bkit's derived set at the moment of a previous recording run, because `permissions.allow` carries no provenance._ Never restate the false "provably cannot delete a consumer's hand-added grant".
- **Removals recorded in three destinations, ascending durability:** (1) one console line per removed grant behind the existing `LOG_PREFIX`; (2) a `webfetch-grants-pruned` `PreflightFinding` (`severity: "advisory"`, exact removed strings in `detect`, and an `action` that inlines the re-declare path plus the `git diff .claude/settings.json` pointer — `.agents/rules.md` forbids linking out to `docs/*.md` from advisory text) pushed onto `ctx.advisories` and flushed through `runPostInstallCheck` → checklist banner + `writeAdvisoriesArtifact` (`bkit-install.ts:2945`); (3) `git diff .claude/settings.json`, which is git-tracked and durable on every path. **Stated limitation:** `bkit upgrade` does not write `.bkit/advisories.md` today, so on upgrade only (1) and (3) apply.

#### [MODIFY] `.bkit/src/bkit-upgrade.ts:465-501` — upgrade write path

- `updateCanonicalHashesAfterUpgrade` `options` gains `webFetchDerived?: readonly string[] | null`, fed from the enrich call at `bkit-install.ts:2588` and applied to the `updated` literal (`:495-499`) only when non-null. It already spreads, so the field survives. Its "nothing to persist" early return (`:493`) must extend with `&& webFetchUnchanged`, or an upgrade whose only change is the derived set silently drops the record. Its `dryRun` return (`:469`) gives the dry-run rule for free.

#### [MODIFY] `.bkit/templates/.claude/settings.json:10-22`

- Remove the 13 `WebFetch(domain:…)` entries. It is a stale partial subset today (apex missing for 7 of 10 bases) that enrich silently tops up — the same hand-sync failure as the hook. Enrich runs in the same `runClaudeModule` pass that writes the file, and `deepContains` array-**subset** semantics mean shrinking the array strictly relaxes containment, so `bkit check` cannot regress.

### Cross-surface fan-out (WS-6)

#### [MODIFY] none — verification targets only

- `injectOpencodeNetworkCurlAllows` (`.bkit/src/bkit-modules.ts:1726-1734`) and `writeNetworkAllowlistArtifact` (`.bkit/src/bkit-cloud-env.ts:515-535`) are **unchanged code paths** — both already call `resolveNetworkAllowlist` and pick up the widened set for free. This workstream's job is to prove that, not to edit them. Listed explicitly so the absence of an edit does not read as an oversight.

### Cron Jobs & Scheduled Tasks

None.

## Supersession Inventory

<!-- prettier-ignore -->
| Existing artifact | Replaced by | Decision | Justification |
| --- | --- | --- | --- |
| `SHIPPED_NETWORK_BASES` array + `keep in sync with …` comment, `.bkit/templates/.cursor/hooks/guardrails.cjs:114-126` (and its `.cursor/` mirror) | `.cursor/allowlist.json`, read at runtime by `loadNetworkAllowlistBases()` | **DELETE** | Elimination beats automation — codegen would recreate the silent-drift vector this issue exists to remove. Same-pass write guarantee verified (`bkit-modules.ts:1309-1310` / `:1396-1400`; `bkit-install.ts:2576`); an empty set degrades to **ask**. |
| Hand-listed 10-element literal `BKIT_SHIPPED_NETWORK_DOMAINS`, `.bkit/src/bkit-cloud-env.ts:471-482` | Computed sorted-unique flatMap over `BKIT_EGRESS_SOURCES[].bases` | **DELETE** (the literal; the export name and type survive) | Same name, same `readonly string[]` type, so no downstream signature changes. The two existing assertions on it are negative and remain the right regression guard. |
| 13 `WebFetch(domain:…)` seed entries, `.bkit/templates/.claude/settings.json:10-22` | `enrichClaudeSettingsWebFetch`, which runs in the same pass that writes the file | **DELETE** | Already a stale partial subset (7 of 10 apexes missing) topped up invisibly — the fourth hand-maintained copy. A parity test would automate the sync; emptying eliminates it. |
| Claude zero-declared "Trusted default" branch, `.bkit/src/bkit-cloud-env.ts:545-553` | Single always-Custom block from `resolveNetworkAllowlist` | **DELETE** | Trusted covers package registries and GitHub, not `api.githubcopilot.com` / `api.tavily.com`; a zero-declaration consumer still needs Custom. Leaving it ships a documented falsehood. |
| Cursor zero-declared "nothing extra is required here" branch, `.bkit/src/bkit-cloud-env.ts:645-654` | Single always-emitted exact-host block from `BKIT_SHIPPED_NETWORK_HOSTS` | **DELETE** | Retiring only the Claude twin would ship the contradiction "why does Claude list hosts when Cursor says none are needed?". Both retire together. |
| `describe("cross-host gate parity — network allowlist")`, `.bkit/src/bkit-permissions-parity.integration.test.ts:173-191` | **T4** fan-out parity, asserted across all five surfaces from the derived source after a real install | **DELETE** | Both halves of its assertion are removed by this change. T4 is a strictly stronger guard: five surfaces instead of two, derived source instead of two hand-typed literals, and it cannot be satisfied by a shared mistake. |
| `bkit-cloud-env.test.ts:326-331`, `:399-403`, `:478-483` assertions on the retired branches | Re-anchored assertions on the always-emitted paste block (**T12**) | **DELETE** (the three assertions; the test cases are re-anchored, not removed) | They assert the behaviour being retired; keeping them would freeze the bug as the expectation. Re-anchor rather than delete the cases, so the zero-declared path stays covered. |

> [!CAUTION]
> Each `DELETE` above is mirrored as a `[DELETE]` entry in `Architecture & Component Changes` and as a removal task in `Agent Execution Runbook`. No `RETAIN-WITH-REASON` rows: nothing here is an external contract or a staged rollout, and no `@deprecated`-but-still-exported resolution is accepted.

## Documentation Updates

<!-- prettier-ignore -->
| Doc | Change required |
| --- | --- |
| `docs/decisions.jsonl` | Three ADR rows appended by this plan (see below): declaration-with-gate over PSL (carrying the `*.googleapis.com` example **verbatim** — otherwise the next maintainer adds `psl` "to do it properly" and re-widens everything); static whole-registry over installed-set reactive; delete the hook's fallback rather than codegen it. |
| `docs/deferrals.jsonl` | Three NEW rows appended by this plan (`381-upgrade-does-not-write-advisories-artifact`, `381-webfetch-grants-survive-uninstall-after-seed-emptied`, `381-cursor-hook-ask-rate-signal`). Four existing `381-*` rows already cover the rest — do **not** duplicate. |
| `docs/knowledge.jsonl` | One row if the plan-time proof obligation (Task 1) fails or surprises: the install-side `.bkit/version` writer is a fresh object literal, so any future field must be threaded into it explicitly or it is silently dropped, while the upgrade-side writer spreads and preserves it. Written only on a real finding, not speculatively. |
| `docs/testing.md` | § Key test files gains `.bkit/src/bkit-cloud-env.integration.test.ts` (new — five-surface fan-out after a real tmp-dir install). Update the `bkit-permissions-parity.integration.test.ts` scope cell: it no longer asserts the network allowlist, only the destructive-command and secret-read table. |
| `docs/observability.md` | § Debug Fetch `:20` — the clause requiring the `context=web` search host in `allowed-domains` for cloud runs becomes false once WS-3 lands. **Delete, do not adapt.** Same edit in the template mirror `.bkit/templates/docs/observability.md`. |
| `.agents/config.md` | § Cloud allowed domains `:276-298`. `:283` — delete "A `context=web` block's search host belongs here too (Tavily example: `tavily.com`). Cloud Custom allowlist renders from THIS block alone — undeclared host → `HTTP 000` self-skip", and replace with the rule that provider/tooling hosts are derived from bkit's registries and must **not** be re-declared here. `:281` — the "Merges those **consumer** domains with stack-agnostic tooling defaults into host **local** permissions" sentence is the local-vs-cloud split WS-3 removes. Drop the now-redundant `tavily.com` line from the example block (`:292`) and the dogfood block (`:310`). Grep targets: `tavily`, `renders from THIS block alone`. |
| `.bkit/templates/.agents/config.md` | Same edits at `:276-298` — the template twin is what ships into consumers. |
| `.bkit/providers.md` | **Three distinct sections, three workstreams — deliberate, not a conflict.** (a) WS-4: `:277` "Missing file ⇒ guardrails falls back to tooling defaults embedded in the hook" becomes "missing file ⇒ ask on every `curl`/`wget`; re-run `bkit install`". (b) WS-3: `:279` "the same `allowed-domains` also feed `.claude/cloud.md` / `.cursor/cloud.md`" becomes derived ∪ consumer, plus the triage-side note that the paste blocks carry an allowlist fingerprint and a "cloud agent can't reach host X" reporter should be asked for it. (c) WS-6: the § Network allowlist encoding table (`:270-275`) gains the explicit OpenCode substring-glob weakness — `curl *{base}*` is a **command** glob, so `curl https://evil.tld/?x=openrouter.ai` is allowed on OpenCode and asked on Cursor, and widening the base list widens that asymmetry. Also `:266` — "Source of truth (stack domains)" needs the derived-registry half stated. **ASCII operators only** (`!=`, `>=`, `<=`) in `.bkit/*.md`. |
| `.bkit/templates/.claude/cloud.md` | § 2 Network access (`:21-23`) and § 5 Verify (`:87`) gain the **symptom-first** runbook sentence: _"If a cloud session's model calls hang or time out with no network error, the dashboard allowlist is the first thing to check — a stale paste fails as an opaque timeout, not as a connection error. Re-run `bkit install` (or `bkit upgrade`) locally, compare the allowlist fingerprint printed below this block against the one in the copy you pasted into the dashboard, and re-paste the block if they differ."_ Verified: this file carries no troubleshooting or timeout prose today. |
| `.bkit/templates/.cursor/cloud.md` | § 4 Network access (`:67-69`) and § 5 Verify (`:71`) — same sentence, same reason. Verified: no troubleshooting or timeout prose today. |
| `.bkit/cloud.md` | `:113` — "No `allowed-domains` block → `Trusted` (default) enough" is no longer true once provider/tooling hosts are in play. Rewrite to name **Custom** as the default instruction. |
| `.bkit/workflows.md` | `:1277` permission-table row for `WebFetch(domain:…)` — worded generically ("per host in the network allowlist"), so **verify** it still holds after the template seed is emptied rather than assuming. `:1281` likewise. |
| `.bkit/README.md` | `:270` `.cursor/allowlist.json` row — "generated from tooling defaults + `.agents/config.md` allowed-domains" becomes derived-registry ∪ consumer. `:370` providers.md pointer — verify wording still holds. |

_No row for `docs/architecture.md`, `docs/data-schema.md`, `docs/security.md`, `docs/deployments.md` or `docs/failures.jsonl` — this change adds no service boundary, no DB object, no auth/secret surface, no CI/CD rule, and discovers no bug._

## Rollback Strategy

<!-- prettier-ignore -->
| Axis | Action | Notes |
| --- | --- | --- |
| **DB** | None — bkit ships no database and no migration lane. | n/a |
| **Code** | `git revert {COMMIT}` on the squash-merge commit, then `pnpm build` and commit the regenerated `dist/` (including deleting `dist/bkit-registry.js`), then `pnpm bkit install` once to regenerate the `.claude/` / `.cursor/` / `.opencode/` mirrors and `.cursor/allowlist.json`. Finish with `git config core.bare false` — `bkit install` flips it. | `pnpm bkit:check:dist` fails CI if `dist/` is not reverted alongside the source. |
| **Consumer state** | `.bkit/version` retains `webFetchDerived` after a revert. Harmless: the reverted `parseBkitVersion` ignores unknown keys, and the reverted install writer builds a fresh literal that drops it on the next install. **No cleanup step is required and none should be added** — a migration-down would be new code on the rollback path. | Verified against the current parse/write shapes (`bkit-version.ts:81-112`, `bkit-modules.ts:955-959`). |
| **Consumer state — grants already pruned** | A revert does not restore a removed `WebFetch(domain:…)` grant, because the reverted enrich is additive-only and the domain is no longer in the derived set. Recovery is the same path the advisory names: declare the apex in `.agents/config.md` `allowed-domains` and re-run `bkit install`. Every removal is also a deleted line in `git diff .claude/settings.json`, so the exact strings are recoverable from history. | This is the only irreversible consumer-visible effect, and it is bounded to grants bkit itself recorded writing. |
| **Consumer state — dashboard paste** | A reverted allowlist is a **narrower** set than the pasted one, so a stale paste after rollback over-permits rather than under-permits — no cloud session breaks. No re-paste is required to roll back. | The fingerprint changes, so the next `cloud.md` read shows the mismatch. |
| **Risk window** | None. There is no deploy and no schema migration; the change is atomic in one commit and its `dist/` output. | Between merge and a consumer's next `bkit install`/`bkit upgrade`, consumers run entirely on the old behaviour. |

## Agent Execution Runbook

> [!IMPORTANT]
> **Continuous Execution:** Work runbook autonomously. No pause for user permission at any Gate. Check `[x]` tasks as you go.
> **Step Isolation:** Complete each task fully (verification + checkbox) before next task.
> **Integration Shape:** advisory only — delivering every task in ONE PR is always correct.

**Standing rules for every task below** (`.agents/rules.md` § Repo Authoring):

- **Edit source only** — `.bkit/src/`, `.bkit/templates/`, `.bkit/workflows/`, `.bkit/prompts/`, `.agents/`. **Never** edit `.claude/`, `.cursor/`, `.opencode/` mirrors directly. `.cursor/hooks/guardrails.cjs` is a mirror: edit the template, regenerate at the end.
- **Batch `bkit install` once, at session end** (Task 32) — never per edit.
- **Docs change in the same task as the code they describe.** No doc-only follow-up task exists in this runbook by design.
- **Add no new `try`/`catch` anywhere in this change** — a catch-with-default-return bumps `defensive.error-obscuring` and fails `slop:delta` on net score even at net-zero finding count. Use `URL.canParse`.
- **After any `bkit install` / `bkit upgrade` in this repo, run `git config core.bare false`** — install flips it.

Task order is the design's dependency graph: **WS-1 → WS-2 → {WS-3, WS-4, WS-5} → WS-6 → WS-7**, with the proof obligation hoisted ahead of everything so a failure re-scopes the plan instead of the build.

### Phase 0 — Blocking proof obligation

- [ ] **Task 1 — 🛑 BLOCKING: prove a `.bkit/version` field survives a real install, BEFORE any WS-5 code is written.** On current `dev`, add `webFetchDerived: string[]` to the `BkitVersion` interface and both `parseBkitVersion` returns (`.bkit/src/bkit-version.ts:63`-shape, `:103`, `:112`) and to the install-side literal at `.bkit/src/bkit-modules.ts:955-959` resolved as `existingVersion?.webFetchDerived ?? []` — **the carry-forward half only, no enrich change, no prune, no `ctx` threading.** Then: `pnpm build` → create a fresh scratch consumer under the repo's `tmp/` (never `/tmp`) → seed `.bkit/version` with a hand-written `{"pinnedVersion":"…","tier3Hashes":{},"canonicalHashes":{},"webFetchDerived":["WebFetch(domain:probe.example)"]}` → `node dist/bkit-install.js install --claude --cursor --tooling` in that directory → read `.bkit/version` back.
  - **If `webFetchDerived` is absent or emptied on read:** STOP. Do not proceed to WS-5. Append a `docs/knowledge.jsonl` row recording the clobbering writer, and re-scope the prune sub-feature with the human before any further build. WS-1 → WS-4 and WS-6 → WS-7 remain buildable without it; the plan degrades to "derive and fan out, no prune", which still satisfies Success Criteria 1, 2, 3 and 5.
  - **Done when:** `node -e "console.log(require('./tmp/<scratch>/.bkit/version'))"` (or `jq .webFetchDerived tmp/<scratch>/.bkit/version`) prints `["WebFetch(domain:probe.example)"]` after a real `node dist/bkit-install.js` run against a scratch consumer that did **not** have the field written by any test double; and `git config core.bare false` has been run.

### Phase 1 — WS-1: egress registry leaf _(requires: nothing)_

- [ ] **Task 2 — Create `.bkit/src/bkit-registry.ts` as a pure-data, import-free, branch-free leaf.** Declare `EgressSource` exactly as in `Architecture § Registry`: `id` (stable, unique, **atomic** — never composite), `kind` (`opencode-provider | tracker-mcp | agent-host | package-registry | skills | tooling-api`), `hosts: readonly string[]`, `bases: readonly string[]` (a **list**, not a scalar), optional `reason` (required when `bases` is `[]` or overrides the derived default). Drop the `docs` variant per Open Question 1 default.
  - **Done when:** `.bkit/src/bkit-registry.ts` exists, exports `EgressSource`, contains **zero** `import` statements and zero `if` / `?:` / `&&` / `||` control flow (`rg -n 'import |if \(|\?\?|&&' .bkit/src/bkit-registry.ts` returns nothing), and `pnpm typecheck` passes.
- [ ] **Task 3 — Move `OPENCODE_PROVIDER_DEFAULTS` verbatim from `.bkit/src/bkit-modules.ts:1461-1518` into the leaf; add one import line back.** Relocation only — do not reshape the object, do not export it further.
  - **Done when:** `rg -n 'OPENCODE_PROVIDER_DEFAULTS' .bkit/src/` shows the definition only in `bkit-registry.ts` and four call sites plus one import in `bkit-modules.ts`; `pnpm typecheck` passes; `pnpm vitest run` shows no new failures versus the pre-task baseline.
- [ ] **Task 4 — Author `BKIT_EGRESS_SOURCES` (13 rows), the two gate denylists, and the recorded absences.** Rows exactly as tabled in `Architecture § Registry`, with the four `opencode-provider` rows in registry-key order and deriving from `OPENCODE_PROVIDER_DEFAULTS[key].baseURL` at module init. `MULTI_LABEL_SUFFIXES` (`co.uk`, `com.au`, `com.cn`, `co.jp`, `com.br`, …) and `MULTI_TENANT_APEXES` (`amazonaws.com`, `googleapis.com`, `azure.com`, `azurewebsites.net`, `workers.dev`, `vercel.app`, `pages.dev`, `hf.space`, `run.app`, `appspot.com`, …) as data, plus the one-sentence invariant that the gate is a **deny**, so an unknown platform apex passes. Record the four deliberate absences in-file (`DEP_UPDATERS`/`RENOVATE_RUNNERS`, the literal `"none"` sentinel, `json.schemastore.org`, `kimi.com`).
  - **Done when:** `BKIT_EGRESS_SOURCES` has 13 entries with 13 unique `id`s; every row with non-empty `bases` has non-empty `hosts`; every `bases: []` or overriding row carries a `reason`; `pnpm typecheck` and `pnpm format:check` pass.

### Phase 2 — WS-2: derivation, gate, exports _(requires: WS-1)_

- [ ] **Task 5 — Implement the proposer and `isIpLiteral` in `.bkit/src/bkit-cloud-env.ts`.** `URL.canParse` first, **never** `try`/`catch`. Contribute nothing for `""` host, `localhost` / `*.localhost`, IP literal, `< 2` labels; otherwise collapse to the last two labels. `isIpLiteral` = `host.startsWith("[")` OR `/^\d{1,3}(\.\d{1,3}){3}$/`.
  - **Done when:** `rg -n 'try \{' .bkit/src/bkit-cloud-env.ts` shows no new occurrence versus `git show HEAD:.bkit/src/bkit-cloud-env.ts`; `pnpm slop:delta` reports no net-new `defensive.error-obscuring` finding.
- [ ] **Task 6 — Implement the gate as a test-only bkit-repo check, plus the `.dev`/`.app`/`.run` soft warning.** Deny checks, never rewriters: label-boundary suffix match, `>= 2` labels, not in either denylist. Warning is a warning — it must never fail the build. _(Owns matrix row **T3**.)_
  - **Done when:** the T3 anti-widening test in `.bkit/src/bkit-cloud-env.test.ts` passes; temporarily adding a fixture row with base `googleapis.com` makes it **fail** and removing it makes it pass again (record the observed failure message); the soft-warn assertion names `models.dev` as the only accepted warn.
- [ ] **Task 7 — Export pure `deriveEgressEntries(rows)`; recompute `BKIT_SHIPPED_NETWORK_DOMAINS`; add `BKIT_SHIPPED_NETWORK_HOSTS`.** Both are sorted-unique flatMaps. Same name and same `readonly string[]` type for the existing export. Rewrite the now-false JSDoc at `.bkit/src/bkit-cloud-env.ts:465-470`. Leave `resolveNetworkAllowlist` and `expandAllowedDomains` untouched. _(Owns matrix row **T5**.)_
  - **Done when:** `BKIT_SHIPPED_NETWORK_DOMAINS` evaluates to the 15 bases listed in `Architecture § Registry` and is a strict superset of the previous 10 (assert by diffing against `git show HEAD:.bkit/src/bkit-cloud-env.ts`); the existing negative assertions at `.bkit/src/bkit-cloud-env.test.ts:405-408` still pass unmodified; the T5 injected-source test passes with **no** `vi.mock` in the file.
- [ ] **Task 8 — Write the completeness and suffix-invariant tests.** _(Owns matrix rows **T1**, **T2**.)_
  - **Done when:** T1 and T2 pass in `.bkit/src/bkit-cloud-env.test.ts`; T1 is table-driven over `Object.keys(OPENCODE_PROVIDER_DEFAULTS)` so adding a fifth provider key with no row makes it fail (verify by temporarily adding one); T1 asserts the literal `"none"` was the **only** thing skipped when iterating `ISSUE_TRACKERS` / `DEP_UPDATERS`.
- [ ] **Task 9 — Write the negative / rejection-channel tests, asserting the channel and not merely the outcome.** _(Owns matrix row **T7**.)_
  - **Done when:** T7 passes and distinguishes the two channels — `https://1.2.3.4:8080/v1` and `https://[::1]/v1` contribute nothing **without** throwing or failing the gate (silent proposer rejection), while `https://api.pages.dev/v1` and `https://x.example.co.uk/v1` fail the gate assertion (test-red). `http://localhost:11434/v1` contributes nothing and no surface anywhere contains the string `localhost`.

### Phase 3a — WS-3: cloud paste surfaces _(requires: WS-2)_

- [ ] **Task 10 — Switch `renderCloudNetworkAllowlist` to `resolveNetworkAllowlist` and delete the Claude "Trusted default" branch.** `.bkit/src/bkit-cloud-env.ts:543-568`; the `:545-553` branch goes, replaced by a single always-Custom block carrying the bkit set plus the existing pointer prose.
  - **Done when:** `rg -n 'Set to \*\*Trusted\*\* \(default\)' .bkit/src/bkit-cloud-env.ts` returns nothing; `renderCloudNetworkAllowlist` has no `declared.length === 0` branch; rendering against a tmp dir with no `.agents/config.md` emits a ` ```text ` fence containing `githubcopilot.com`.
- [ ] **Task 11 — Rewrite `renderCursorNetworkAllowlist` to union `BKIT_SHIPPED_NETWORK_HOSTS` verbatim and delete its zero-declared branch.** `.bkit/src/bkit-cloud-env.ts:643-667`; `:645-654` goes. Exact hosts, **no `*.` expansion** — Cursor's deliberate no-wildcard policy. _(Owns matrix row **T13**.)_
  - **Done when:** `rg -n 'nothing extra is required here' .bkit/src/` returns nothing; T13 passes, asserting the output contains `api.githubcopilot.com` and `registry.npmjs.org` and does **not** contain `*.githubcopilot.com`.
- [ ] **Task 12 — Emit the 8-hex fingerprint as prose after the closing fence in both renderers.** `sha256` from `.bkit/src/bkit-version.ts:190`, truncated to 8 hex, hashed over the **derived set only, never the consumer union**. Appended to the italic line that already follows the closing fence. Nothing inside the fence changes. _(Owns matrix row **T9**.)_
  - **Done when:** T9 passes, asserting the fingerprint token's index in the rendered string is **greater** than the index of the closing ` ``` ` in both `.claude/cloud.md` and `.cursor/cloud.md`; editing `allowed-domains` leaves the token byte-identical; changing a `BKIT_EGRESS_SOURCES` row changes it.
- [ ] **Task 13 — Re-anchor the three existing tests this workstream breaks.** `.bkit/src/bkit-cloud-env.test.ts:326-331` and `:399-403` (drop the `"Set to **Trusted** (default)"` assertions, keep the pointer-prose one, re-anchor on the always-Custom block) and `:478-483` (the Cursor zero-declared case asserting `expect(out).not.toContain("\`\`\`")`, which now flips to asserting a fence **is** present with shipped hosts in it). _(Owns matrix row **T12**.)_
  - **Done when:** `pnpm vitest run .bkit/src/bkit-cloud-env.test.ts` is fully green with zero `.skip` and zero deleted test cases — all three cases still exist, re-anchored; T12 passes.
- [ ] **Task 14 — WS-3 docs, same commit.** `.bkit/templates/.claude/cloud.md` § 2 + § 5 and `.bkit/templates/.cursor/cloud.md` § 4 + § 5 gain the symptom-first runbook sentence (verbatim text in `Documentation Updates`). `.bkit/cloud.md:113` loses the "Trusted is enough" guidance. `.agents/config.md:281`, `:283`, `:292`, `:310` **and** the identical spots in `.bkit/templates/.agents/config.md` — delete the `context=web`/`renders from THIS block alone`/local-only guidance, do not adapt it; drop the now-redundant `tavily.com` lines. `docs/observability.md:20` + `.bkit/templates/docs/observability.md` — delete the cloud-declaration clause. `.bkit/providers.md:279` — cloud egress is derived ∪ consumer, plus the fingerprint triage note. ASCII operators only in `.bkit/*.md`.
  - **Done when:** `rg -n 'renders from THIS block alone|LOCAL host permissions|Trusted.*enough' .agents/ .bkit/ docs/` returns nothing; `rg -n 'tavily' .agents/config.md .bkit/templates/.agents/config.md` matches only inside the `debug-fetch` block, not the `allowed-domains` blocks; `rg -n 'hang or time out' .bkit/templates/.claude/cloud.md .bkit/templates/.cursor/cloud.md` matches both files; `pnpm lint:prose` and `pnpm format:check` pass.

### Phase 3b — WS-4: Cursor hook _(requires: WS-2)_

- [ ] **Task 15 — Delete `SHIPPED_NETWORK_BASES` and its `keep in sync with …` comment from `.bkit/templates/.cursor/hooks/guardrails.cjs:114-126`; make `loadNetworkAllowlistBases()` start from an empty `Set`.** Template **only** — the `.cursor/` copy is a mirror regenerated in Task 32. Update the ask message at `:105-108` to name `.cursor/allowlist.json` and `bkit install`. No two-entry safety floor.
  - **Done when:** `rg -n 'SHIPPED_NETWORK_BASES|keep in sync' .bkit/templates/.cursor/hooks/guardrails.cjs` returns nothing; `loadNetworkAllowlistBases` opens with `const bases = new Set();`; the ask string contains both `.cursor/allowlist.json` and `bkit install`.
- [ ] **Task 16 — Rewrite the now-false `_reason` at `slop-scan.config.json:184`.** The exemption stays; its justification changes from "fail-OPEN … the shipped fallback is correct behaviour" to "must not crash the editor session; a corrupt or absent artifact degrades to **ask**".
  - **Done when:** `rg -n 'fail-OPEN' slop-scan.config.json` returns nothing; `pnpm lint:slop` runs and `pnpm slop:delta` reports zero net-new findings.
- [ ] **Task 17 — Delete `.bkit/src/bkit-permissions-parity.integration.test.ts:173-191` and add the hook's no-artifact negative case.** Remove the whole `describe("cross-host gate parity — network allowlist")` block — both halves of its assertion are gone by design and T4 subsumes it. Then add T11 to `.bkit/src/bkit-guardrails-cursor.integration.test.ts`, spawning the hook with `cwd` set to a tmp dir containing **no** `.cursor/allowlist.json`. This matters because the existing assertions at `:44-92` spawn with `cwd` = repo root, where `.cursor/allowlist.json` supplies the allow — they survive this change but stop discriminating. _(Owns matrix rows **T6**, **T11**.)_
  - **Done when:** `rg -n 'SHIPPED_NETWORK_BASES' .bkit/src/` returns nothing; T11 asserts `curl -s https://api.github.com/repos/x/y` returns `permission: "ask"` with no artifact in `cwd`, and `curl https://evil.tld/?x=openrouter.ai` still returns `"ask"`; T6 (template ↔ mirror byte parity) passes; `pnpm vitest run .bkit/src/bkit-permissions-parity.integration.test.ts .bkit/src/bkit-guardrails-cursor.integration.test.ts` is green.
- [ ] **Task 18 — WS-4 docs, same commit.** `.bkit/providers.md:277` — "Missing file ⇒ guardrails falls back to tooling defaults embedded in the hook" becomes "Missing file ⇒ ask on every `curl`/`wget`; re-run `bkit install`".
  - **Done when:** `rg -n 'falls back to tooling defaults' .bkit/providers.md` returns nothing and the replacement sentence names `bkit install`; `pnpm lint:prose` passes.

### Phase 3c — WS-5: Claude WebFetch provenance and prune _(requires: WS-2 and Task 1 green)_

- [ ] **Task 19 — Land the `.bkit/version` field properly.** Promote Task 1's probe edit into the real change: `webFetchDerived: string[]` required on `BkitVersion`, parser-default `[]` at both `parseBkitVersion` returns.
  - **Done when:** `pnpm typecheck` passes with no `?` on the field; a `.bkit/version` payload with no `webFetchDerived` parses to `[]` (asserted in `.bkit/src/bkit-version.test.ts`).
- [ ] **Task 20 — Thread the install write path.** `ModuleContext` gains `webFetchRecorded?: readonly string[] | null`; `runClaudeModule` assigns enrich's return at `.bkit/src/bkit-modules.ts:1062`; core's `postDispatch` literal resolves `ctx.webFetchRecorded ?? existingVersion?.webFetchDerived ?? []`; `needsWrite` at `:946` extends with `|| derivedChanged`. Enrich **never** writes `.bkit/version`.
  - **Done when:** `rg -n 'webFetchDerived' .bkit/src/bkit-modules.ts` shows it only inside the `postDispatch` closure; `rg -n 'writeBkitVersion' .bkit/src/` still shows exactly two writers (`bkit-modules.ts` postDispatch, `bkit-upgrade.ts`); `pnpm typecheck` passes.
- [ ] **Task 21 — Thread the upgrade write path.** `updateCanonicalHashesAfterUpgrade` (`.bkit/src/bkit-upgrade.ts:465`) `options` gains `webFetchDerived?: readonly string[] | null`, fed from the enrich call at `.bkit/src/bkit-install.ts:2588`, applied to the `updated` literal only when non-null; the nothing-to-persist return at `:493` extends with `&& webFetchUnchanged`.
  - **Done when:** an upgrade whose only change is the derived set writes `.bkit/version` (asserted in `.bkit/src/bkit-upgrade.integration.test.ts`); the `dryRun` return at `:469` is unchanged.
- [ ] **Task 22 — Empty the `WebFetch(domain:…)` seed from `.bkit/templates/.claude/settings.json:10-22`.**
  - **Done when:** `rg -c 'WebFetch\(domain:' .bkit/templates/.claude/settings.json` returns 0; the file is still valid JSON (`node -e "JSON.parse(require('fs').readFileSync('.bkit/templates/.claude/settings.json','utf8'))"`); `pnpm vitest run` shows no test asserting a `WebFetch(domain:` literal (`rg -c 'WebFetch\(domain:' .bkit/src/*.test.ts .bkit/src/*.integration.test.ts` returns 0).
- [ ] **Task 23 — Implement the prune, the recording contract and the advisory in `enrichClaudeSettingsWebFetch`.** Signature becomes `(settingsDst, cwd, dryRun, ws, advisories) => readonly string[] | null`. **Restructure — do not extend — the `if (missing.length === 0) return;` early return at `:1770`.** Replace the additive-only JSDoc at `:1736-1750` with the honest guarantee verbatim. Push a `webfetch-grants-pruned` finding whose `action` inlines the fix (no link to `docs/*.md`). _(Owns matrix row **T8**.)_
  - **Done when:** T8 passes with one case per recording-contract row — absent file / unparseable JSON / non-array `allow` / `dryRun` each return `null` and leave the prior `webFetchDerived` **unchanged**; a steady-state no-op run returns `current`; `A \ B` grants are removed; a hand-added grant bkit never recorded survives; an absent `webFetchDerived` prunes nothing; a removal emits the advisory. `rg -n 'provably cannot delete' .bkit/src/` returns nothing.
- [ ] **Task 24 — Add the provenance-survives-a-real-install test.** Not a one-off probe: the clobbering writer is a fresh literal that any future field addition can silently re-break, which is exactly what Task 1 exists to catch once and this test exists to catch forever. Real `os.tmpdir()` consumer, spawned install, no `fs` mock. _(Owns matrix row **T10**.)_
  - **Done when:** T10 passes in `.bkit/src/bkit-install.integration.test.ts` — seed, real install, read back, `webFetchDerived` present, non-empty and equal to the resolved set; a second install with a shrunk `allowed-domains` updates it; reverting Task 20's `postDispatch` change makes T10 fail (verify once, then restore).
- [ ] **Task 25 — WS-5 docs, same commit.** Verify `.bkit/workflows.md:1277` and `:1281` still hold after the seed is emptied (they are worded generically); verify `.bkit/README.md:270` and `:370`.
  - **Done when:** both files read correctly against the new behaviour, or are edited to; `pnpm lint:prose` passes.

### Phase 4 — WS-6: cross-surface fan-out _(requires: WS-3, WS-4, WS-5)_

- [ ] **Task 26 — Write the five-surface fan-out parity test in a new `.bkit/src/bkit-cloud-env.integration.test.ts`.** One derived union asserted present in all five surfaces after a **real tmp-dir install** — cloud paste fence, `.cursor/allowlist.json` `domains`, `.claude/settings.json` `WebFetch(domain:…)`, `.opencode/opencode.json` `permission.bash` globs — and, as an **absence** assertion, the installed hook carrying no domain array. No mocks at the install boundary. _(Owns matrix row **T4**.)_
  - **Done when:** T4 passes; deleting any one surface's wiring makes it fail (verify against `injectOpencodeNetworkCurlAllows` by temporarily commenting its call at `.bkit/src/bkit-modules.ts:1698`, then restore); the absence assertion greps the installed `.cursor/hooks/guardrails.cjs` for `SHIPPED_NETWORK_BASES` and finds none.
- [ ] **Task 27 — Prove `injectOpencodeNetworkCurlAllows` and `writeNetworkAllowlistArtifact` are unchanged, and that no second domain list survives anywhere.** No code edit — verification only.
  - **Done when:** `git diff HEAD -- .bkit/src/bkit-modules.ts` shows no change inside `:1726-1734`; `git diff HEAD -- .bkit/src/bkit-cloud-env.ts` shows no change inside `writeNetworkAllowlistArtifact`; and a repo-wide sweep for a second hand-maintained host list (`rg -n '"(github|npmjs|anthropic|opencode|ollama)\.(com|ai)"' .bkit/ --glob '!*.test.ts' --glob '!dist/'`) returns only `.bkit/src/bkit-registry.ts` and generated artifacts.
- [ ] **Task 28 — Assert `bkit check` reports 0 writes on a clean install and a clean upgrade with the provenance field present.** The dry-run rule, tested against the real engine rather than argued by inspection. _(Owns matrix row **T14**.)_
  - **Done when:** T14 passes in `.bkit/src/bkit-upgrade.integration.test.ts` — after a clean install, `bkit check` reports 0 writes and `.bkit/version` is byte-identical before and after; same after a clean upgrade.
- [ ] **Task 29 — WS-6 docs, same commit.** `.bkit/providers.md` § Network allowlist encoding table (`:270-275`) gains the explicit OpenCode substring-glob weakness, and `:266` gains the derived-registry half of "source of truth". Stated, never implied.
  - **Done when:** `rg -n 'substring' .bkit/providers.md` matches a sentence naming `curl *{base}*` and contrasting it with the host-parsed Cursor check; `pnpm lint:prose` passes.

### Phase 5 — WS-7: release integration _(requires: WS-6)_

- [ ] **Task 30 — Build and commit `dist/`, including the new `dist/bkit-registry.js`.**
  - **Done when:** `pnpm build` succeeds and `pnpm bkit:check:dist` exits 0.
- [ ] **Task 31 — Verify the ledger rows, and update them only if the build changed the decision.** The **plan phase already appended** three `docs/decisions.jsonl` ADR rows (`381-egress-base-derivation-declaration-with-gate-not-psl` — carrying the `*.googleapis.com` example **verbatim**; `381-static-whole-registry-egress-derivation-not-installed-set`; `381-delete-cursor-hook-fallback-list-not-codegen`) and three `docs/deferrals.jsonl` rows (`381-upgrade-does-not-write-advisories-artifact`, `381-webfetch-grants-survive-uninstall-after-seed-emptied`, `381-cursor-hook-ask-rate-signal`). Do **not** re-append them. If the build changed a decision — most plausibly Open Question 1 or 2 resolving against the recorded default, or Task 1 failing and the prune being re-scoped — record it by appending a **same-`key`** row, never by editing the existing line (`.bkit/jsonl.md` § Updating a Row; these ledgers are `merge=union`, so an edited line survives beside its replacement).
  - **Done when:** `rg -c '"key":"381-' docs/deferrals.jsonl` returns 7 and `rg -c '"key":"381-' docs/decisions.jsonl` returns 3 (or more, if a same-`key` update was genuinely earned); every line parses (`while read -r l; do printf '%s' "$l" | jq -e . >/dev/null || echo "BAD: $l"; done < docs/decisions.jsonl` and the same over `docs/deferrals.jsonl` print nothing); and `git diff docs/decisions.jsonl docs/deferrals.jsonl` shows **additions only**, no modified or deleted lines.
- [ ] **Task 32 — Regenerate mirrors ONCE, then verify install and upgrade live on a dogfood consumer.** `pnpm bkit install` in this repo to regenerate `.claude/` / `.cursor/` / `.opencode/` and `.cursor/allowlist.json`; then `git config core.bare false`. Then a **separate** scratch consumer under `tmp/`: `node dist/bkit-install.js install --claude --cursor --opencode=openrouter --tracker=github`, inspect the on-disk footprint, then `node dist/bkit-install.js upgrade` and `node dist/bkit-install.js check`. `check` is not `upgrade` — separate engines, verify both.
  - **Done when:** `.cursor/hooks/guardrails.cjs` is byte-equal to its template and contains no `SHIPPED_NETWORK_BASES`; `.cursor/allowlist.json` carries all 15 derived bases plus their `*.` forms; the scratch consumer's `.claude/cloud.md` fence contains `githubcopilot.com`, `models.dev`, `skills.sh` and `tavily.com` and its fingerprint line sits **after** the closing fence; `bkit check` on the scratch consumer exits 0 with 0 writes after both install and upgrade; `git config core.bare` prints `false`.
- [ ] **Task 33 — Confirm Success Criterion 1 end-to-end and disposition the open questions.** Assert the four live gaps (`api.githubcopilot.com`, `models.dev`, `skills.sh`, `api.tavily.com`) are present in every surface of the scratch consumer, and that the paste block carries provider/tooling hosts with **zero** declared `allowed-domains`. Record the disposition of Open Questions 1–6 in the PR body — settle OQ3 (`models.dev`) by an `opencode-zen` session with the host blocked if one is cheap to run, otherwise carry the recorded default.
  - **Done when:** for each of the four hosts, `rg -c "<host>" tmp/<scratch>/.claude/cloud.md tmp/<scratch>/.cursor/allowlist.json tmp/<scratch>/.claude/settings.json tmp/<scratch>/.opencode/opencode.json` is non-zero in every file (bases for the wildcard surfaces, exact hosts for the Cursor cloud list); and the scratch consumer has no `allowed-domains` block.
- [ ] **Task 34 — Run the full local gate set and fix every failure at the root.** `pnpm bkit:gate:static-unit` plus `pnpm vitest run` unscoped plus `pnpm bkit check`.
  - **Done when:** `pnpm typecheck`, `pnpm lint`, `pnpm format:check`, `pnpm lint:prose`, `pnpm slop:delta`, `pnpm vitest run` (full suite, never scoped), `pnpm test:coverage:unit` (branches >= 70) and `pnpm bkit check` all exit 0, with **zero** `.skip`, `@ts-ignore`, `as any`, deleted assertions or new gate exemptions introduced anywhere in the diff.

### 🔒 Gate 2: Code Implementation Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below. **DO NOT stop for user permission.**

- [ ] **No bolt-on / no gate-weakening:** the single `[NEW]` artifact (`.bkit/src/bkit-registry.ts`) is justified against extending an existing file by the import-cycle and coverage-lane arguments in `Architecture`; no `as any` / `as unknown as` / `@ts-ignore` / `.skip` / empty `catch` / error-swallowing was introduced to make a gate pass.
- [ ] **Source-only edits:** `git diff --name-only` contains no path under `.claude/`, `.cursor/` or `.opencode/` **except** mirror output regenerated by Task 32's single `bkit install`.
- [ ] **Every matrix row owned:** T1→Task 8, T2→Task 8, T3→Task 6, T4→Task 26, T5→Task 7, T6→Task 17, T7→Task 9, T8→Task 23, T9→Task 12, T10→Task 24, T11→Task 17, T12→Task 13, T13→Task 11, T14→Task 28. No orphan rows, no invented tests.
- [ ] **Gate 2 - Verified:** Every checkbox above independently verified and checked off against the plan.

**Mandatory Tasks (Testing & Documentation):**

- [ ] **Verify test coverage against Derived Test Matrix:** every T-row has a corresponding checked-off task above.
- [ ] **Update existing tests:** the three re-anchored cases in `bkit-cloud-env.test.ts` (Task 13) and the deleted parity block plus new negative case (Task 17) — no test case silently dropped.
- [ ] **Write new tests:** T4, T5, T9, T10, T11, T13, T14 are new; T1, T2, T3, T7, T8 are new assertions in existing files.
- [ ] **Verify observability:** the prune's console lines use the existing `LOG_PREFIX`, and the `webfetch-grants-pruned` finding matches the `PreflightFinding` shape with a self-contained `action`. No raw PII, no token, no path outside the repo. Update `docs/observability.md` only if a new log name is introduced — the prune reuses the existing prefix, so no new name is expected.
- [ ] **Update documentation:** every row in `Documentation Updates` completed in the same task as its code.

### 🔒 Gate 3: Testing & Documentation Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below. **DO NOT stop for user permission.**

- [ ] **Docs updated:** every row in `Documentation Updates` completed. `.agents/docs.md` still accurate (no new doc file added, so no new row expected).
- [ ] **Gate 3 - Verified:** Every checkbox above independently verified and checked off.

## Verification Plan

> [!IMPORTANT]
> **Advisory build-phase checks, NOT merge gates.** Only `Agent Execution Runbook` `Done when` lines gate the merge; nothing in this section does.

### Automated Tests

- [ ] **Full Local Gate Suite:** `pnpm bkit:gate:static-unit` — chains `typecheck`, `lint`, `format:check`, `lint:prose`, `slop:delta`, then `test`, `test:coverage:unit` and `bkit:test:bats`. Plus `pnpm bkit check` for drift. Do NOT weaken any gate to pass.
- [ ] **Test Synchronization:** no Playwright / E2E project exists in bkit (`docs/testing.md:332`), so nothing to synchronise there. The tests this change breaks are enumerated and owned: `bkit-cloud-env.test.ts:326-331`, `:399-403`, `:478-483` (Task 13) and `bkit-permissions-parity.integration.test.ts:173-191` (Task 17). Re-run `pnpm vitest run` unscoped after each — a scoped run hides cross-file breakage, which is exactly how the parity assertion would have gone unnoticed.
- [ ] **Build Configuration:** no new mock file and no new test config; `tsconfig.json` already excludes `**/*.test.ts` from `tsc --noEmit`, which is why adding a required `BkitVersion` field does not break the existing test-side object literals. Confirm `dist/bkit-registry.js` appears in the build output and is committed.
- [ ] **Unit (`.bkit/src/bkit-cloud-env.test.ts`):** T1 completeness, T2 suffix invariant, T3 anti-widening + soft-warn set, T5 injected source, T7 rejection channels, T9 fingerprint placement + stability, T12 retired branches, T13 Cursor exact hosts. Data hygiene: all fixture rows are local constants; no `vi.mock` anywhere in the file.
- [ ] **Unit (`.bkit/src/bkit-modules.test.ts`, `.bkit/src/bkit-version.test.ts`):** T8 prune round-trip and the six recording-contract rows; the `webFetchDerived` parser default.
- [ ] **Integration (`.bkit/src/bkit-cloud-env.integration.test.ts`, new):** T4 five-surface fan-out after a real tmp-dir install, including the hook-carries-no-array absence assertion.
- [ ] **Integration (`.bkit/src/bkit-install.integration.test.ts`):** T10 provenance survives a real install.
- [ ] **Integration (`.bkit/src/bkit-upgrade.integration.test.ts`):** T14 `bkit check` 0 writes after clean install and clean upgrade.
- [ ] **Integration (`.bkit/src/bkit-guardrails-cursor.integration.test.ts`):** T6 template ↔ mirror byte parity; T11 hook asks on `api.github.com` with no artifact in `cwd`.
- [ ] **Apply local migrations:** N/A — bkit ships no database and no migration lane.
- [ ] **Run all tests:** `pnpm vitest run` **unscoped** (`.agents/rules.md` § Repo Authoring: "Verify before complete" means the full suite, never a scoped run) plus `pnpm bkit:test:bats`. Fix all failures before Gate 4.

> [!IMPORTANT]
> **No Architectural Downgrades:** if a build, compiler or test error appears, never resolve it via a hot fix or an anti-pattern. In particular: do not add a `try`/`catch` to silence a URL-parsing edge (use `URL.canParse`), do not widen a denylist to make the gate pass (fix the row's `bases` and record a `reason`), and do not `.skip` the parity or fan-out tests. Halt if stuck.

### 🔒 Gate 4: Automated Verification Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below. **DO NOT stop for user permission.**

- [ ] **Gate 4 - Verified:** every checkbox in Automated Tests independently verified and checked off, with explicit proof captured (test output, CLI exit codes, the on-disk footprint of the scratch consumer).

### 👤 Manual Verification

> [!CAUTION]
> **Owner-run acceptance checks — advisory only.** Run during build wherever a CLI can. An unticked box blocks nothing.

> [!WARNING]
> **Dashboard Ban:** use local CLIs to verify rather than asking the user to check a dashboard. The two boxes below that genuinely need a vendor dashboard are marked as such and are the only ones.

- [ ] **Step 1 — Dogfood install footprint.** `pnpm build && cd tmp/<scratch> && node ../../dist/bkit-install.js install --claude --cursor --opencode=openrouter --tracker=github`. Inspect `.claude/settings.json`, `.cursor/allowlist.json`, `.opencode/opencode.json`, `.cursor/hooks/guardrails.cjs`, `.claude/cloud.md`, `.cursor/cloud.md`, `.bkit/version`. Then `git config core.bare false` in the bkit repo.
- [ ] **Step 2 — Install ≠ upgrade.** In the same scratch consumer: `node ../../dist/bkit-install.js upgrade` then `node ../../dist/bkit-install.js check`. Confirm `check` reports 0 writes after **both** verbs and that `.bkit/version` `webFetchDerived` survived the upgrade.
- [ ] **Step 3 — Prune, observed end-to-end.** Add `sentry.io` to the scratch consumer's `allowed-domains`, install, confirm both `WebFetch(domain:sentry.io)` forms appear. Remove it, install again, confirm both are gone, the console printed the removal, `.bkit/advisories.md` carries `webfetch-grants-pruned` naming the exact strings, and `git diff .claude/settings.json` shows the deleted lines.
- [ ] **Step 4 — Hook degrades to ask.** Delete `.cursor/allowlist.json` in the scratch consumer, then `echo '{"command":"curl -s https://api.github.com/repos/x/y"}' | node .cursor/hooks/guardrails.cjs`. Confirm `"permission":"ask"` and that the message names `.cursor/allowlist.json` and `bkit install`. Re-run install and confirm it flips back to `"allow"`.
- [ ] **Step 5 — Fingerprint is not pasteable.** Open the scratch consumer's `.claude/cloud.md` § 2 and `.cursor/cloud.md` § 4. Confirm the `Allowlist fingerprint: …` token sits in the italic line **after** the closing fence and that copying the fence content yields only domains.
- [ ] **Step 6 _(vendor dashboard — owner only)_ — the paste actually works.** Paste the fence content into a Claude Code on the web environment set to **Custom**, run a cloud session, and confirm `/bkit-debug`'s `context=web` block returns results instead of `HTTP 000` and the GitHub tracker MCP connects. This is the only check that proves Success Criterion 1 against the real egress proxy; nothing local can substitute for it.
- [ ] **Step 7 _(vendor dashboard — owner only)_ — Cursor Allowlist-only mode.** Same paste into the Cursor Cloud Agents dashboard under **Security → Allowlist only**, and confirm a background agent reaches `api.githubcopilot.com`.
