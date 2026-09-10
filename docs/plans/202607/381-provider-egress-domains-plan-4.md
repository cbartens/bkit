<!-- bkit:anchor
baseSha: 607d7507a76c8c10eb56135c328e3daec0ed6a69
baseRef: origin/dev
designPath: docs/plans/202607/381-provider-egress-domains-design.md
designBaseSha:
-->

# Provider cloud-egress derivation — Sub-Plan 4: WS-5 Claude WebFetch provenance and prune

**Parent Plan:** [`381-provider-egress-domains-plan.md`](381-provider-egress-domains-plan.md)

> [!CAUTION]
> **CRITICAL:** Do not hallucinate plan execution state.
>
> 1. Read this sub-plan natively ONCE at session start. Do NOT re-read on every loop iteration.
> 2. NEVER trust session memory or previous conversation history.
> 3. Source of truth = literal `[x]` vs `[ ]` checkboxes in this document. `[ ]` = NOT DONE regardless of conversation context.

> [!CAUTION]
> **Coordinate staleness -- `dev` has moved since this plan's `baseSha`.**
>
> Baseline is `607d7507` (2026-08-26). Landed since, and **already applied throughout this
> document**: `.agents/config.md` -> `.agents/context.md` (and its `.bkit/templates/` twin),
> and the `debug-fetch:*` marker/block vocabulary -> `context-fetch:*`. Both from commit
> `88638a42` (#454). The renamed cloud-env helpers are `extractContextFetchProvisionRecipes`,
> `renderCloudContextFetchProvision` and `renderCursorContextFetchProvision`. The
> `docs/observability.md` heading is still `## Debug Fetch` -- that reference is NOT stale.
>
> **Line numbers were deliberately NOT renumbered.** Sub-plans 2-5 carry coordinates written
> against their predecessors' post-landing state (see the existing `PRE-Task-3` banners), so a
> blanket rewrite to current `HEAD` would be wrong, not merely stale. Every cited file below
> has changed since `607d7507`; resolve its anchors **by symbol, marker or heading -- never by
> line number**:
>
> `.agents/context.md`, `.bkit/templates/.agents/context.md`, `.bkit/src/bkit-cloud-env.ts`,
> `.bkit/src/bkit-cloud-env.test.ts`, `.bkit/src/bkit-modules.ts`, `.bkit/src/bkit-install.ts`,
> `.bkit/src/bkit-manifest.ts`, `.bkit/src/bkit-uninstall.ts`, `.bkit/src/bkit-uninstall.test.ts`,
> `.bkit/src/bkit-upgrade.ts`, `.bkit/src/bkit-cli.ts`, `.bkit/src/bkit-preflight.ts`,
> `.bkit/src/bkit-postinstall.ts`, `.bkit/cloud.md`, `.bkit/README.md`, `.bkit/prompts.md`,
> `.bkit/providers.md`, `.bkit/workflows.md`, `.bkit/workflows/bkit-debug.md`,
> `.bkit/templates/.claude/cloud.md`, `.bkit/templates/.cursor/cloud.md`,
> `docs/observability.md`, `docs/testing.md`, `package.json`, `slop-scan.config.json`.
>
> Four anchors are confirmed **dead** (the cited content no longer exists at or near that line):
> `.bkit/workflows/bkit-debug.md:691`, `docs/observability.md:149`, `.bkit/providers.md:256`
> and `.bkit/cloud.md:111`. Re-locate each by its quoted prose before editing.
>
> Anchors into files absent from the list above still hold. `baseSha` is left at `607d7507`
> on purpose -- it records what this plan was written against, and must not be forged forward.

## Scope & Dependency Position

**This sub-plan covers Tasks 19–25:** Phase 3c / WS-5 — the `.bkit/version` `webFetchDerived` field, both write paths (install and upgrade), the emptied `.claude/settings.json` template seed, the prune with its seven-row recording contract and its advisory, the provenance-survives-a-real-install test, and two doc edits. Matrix rows owned: **T8, T10, T15, T16, T17**.

**Requires:** sub-plan 1 (`381-provider-egress-domains-plan-1.md`, Tasks 1–9) complete, **including Phase 0 / Task 1 green**.

> [!CAUTION]
> **🛑 Task 1's outcome re-scopes this entire sub-plan. Read the handover before writing a line of code — do not infer the branch.**
>
> Task 1 (in `381-provider-egress-domains-plan-1.md`) proves whether a new `.bkit/version` field survives a real install. The install-side writer at `.bkit/src/bkit-modules.ts:955-959` builds a **fresh object literal** and drops any field not named in it; if threading it does not work, every task here that depends on provenance is dead code.
>
> - **Task 1 GREEN → this sub-plan runs at full scope:** Tasks 19, 20, 21, 22, 23, 24, 25 and rows T8, T10, T15, T16, T17.
> - **Task 1 RED → the STOP path applies, and it was executed in sub-plan 1. In this sub-plan that means:**
>   1. **Tasks 19, 20, 21, 23 and 24 are DROPPED entirely**, and with them matrix rows **T8, T10 and T15**.
>   2. **Task 22 (empty the seed) still runs.** Its justification is independent of the prune: the seed is the fourth hand-maintained copy, it is a stale partial subset, and `enrichClaudeSettingsWebFetch` already tops it up additively in the same `runClaudeModule` pass. **Its `Done when` is unchanged.**
>   3. **Task 25 (docs) still runs**, minus any sentence that promises a prune.
>   4. **Task 28 / T14 (in `381-provider-egress-domains-plan-5.md`) still runs, minus the provenance clause** — assert `bkit check` reports 0 writes on a clean install and a clean upgrade, with no `.bkit/version` `webFetchDerived` field in play.
>   5. Sub-plan 1 already appended a `docs/knowledge.jsonl` row recording the clobbering writer and re-scoped the prune sub-feature with the human. **Do not re-append it.**
>   6. **Success Criterion 4 is reported as NOT MET.** Say so explicitly in the handover rather than letting it read as met. Criteria 1, 2, 3 and 5 are unaffected — the plan degrades to "derive and fan out, no prune".

**Parallel-viable with:** sub-plan 2 (WS-3 cloud paste) and sub-plan 3 (WS-4 Cursor hook). Disjoint files; this sub-plan touches no `.bkit/providers.md` line at all.

**Blocks:** sub-plan 5 (WS-6 + WS-7). Task 26's five-surface fan-out reads `.claude/settings.json` `WebFetch(domain:…)` and Task 28's T14 asserts 0 writes with the provenance field present.

> [!CAUTION]
> **🛑 ANCHOR-SHIFT HAZARD — this sub-plan carries post-`:1461` work and is where it bites hardest.** Task 3 (already landed, `381-provider-egress-domains-plan-1.md`) deleted `OPENCODE_PROVIDER_DEFAULTS` at `.bkit/src/bkit-modules.ts:1461-1518` — **58 lines** — so every anchor **after** `:1461` in this document has shifted by roughly **57 lines**: `enrichClaudeSettingsWebFetch` `:1751-1778`, its JSDoc `:1736-1750`, its early return `:1770`, its `ws.writes` push `:1775-1777`, its `resolveNetworkAllowlist` call `:1768`, and `injectOpencodeNetworkCurlAllows` `:1698` / `:1718` / `:1726-1734`. **Resolve every one of those by symbol name, never by line number**, and never write a `Done when` that greps a post-`:1461` line range. Anchors **before** `:1461` — `ModuleContext` `:174`, its `postDispatch` field `:205`, `postDispatch.push` `:887`, `needsWrite` `:946`, the install literal `:955-959`, the enrich call site `:1062` — are **unaffected** and may be used as written. Anchors in **other files** (`bkit-upgrade.ts`, `bkit-install.ts`, `bkit-version.ts`, `bkit-uninstall.ts`) are unaffected.

## Context & Goals

bkit's network allowlist is fragmented across five encoding surfaces. `enrichClaudeSettingsWebFetch` writes `WebFetch(domain:…)` grants into `.claude/settings.json` **additively only** — nothing has ever removed one. A consumer who drops a domain from `allowed-domains` keeps its grant forever, and the `.bkit/templates/.claude/settings.json:10-22` seed is a third hand-maintained copy of the shipped base list that is already stale (apex missing for 7 of 10 bases) and silently topped up by enrich.

This sub-plan adds a `webFetchDerived` provenance record to `.bkit/version` — the exact `WebFetch(domain:…)` strings bkit wrote on the last install/upgrade that actually wrote them — threads it through both write paths, empties the template seed, and turns enrich into an add-**and**-remove function bounded by that record. `previous \ current` is the narrowest removal set available and is the only thing that makes Success Criterion 4 satisfiable, because `permissions.allow` carries no provenance.

> [!WARNING]
> **The parent design's ground truth drifted twice.** It was written 2026-07-29, amended 2026-08-03, re-checked 2026-08-24. Since that re-check, **#435 Phase 1** landed (`docs/decisions.jsonl` key `opencode-provider-allowlist-cut-to-four`). Every citation in this sub-plan was re-verified against the worktree on 2026-08-26; where it conflicts with the design or the re-check comment, **this plan is correct**. The two structural moves:
>
> 1. `OPENCODE_PROVIDER_DEFAULTS` (`.bkit/src/bkit-modules.ts:1461-1518`) is **4 keys**, not 10 — the deletion that created the anchor shift above.
> 2. `BKIT_SHIPPED_NETWORK_DOMAINS` is **10 bases**, not 13: `nvidia.com` / `z.ai` / `moonshot.ai` / `kimi.com` removed, `openrouter.ai` added — in all five copies, **including the `.claude/settings.json` seed Task 22 empties, which carries 13 entries covering those 10 bases**.
>
> Consequences: the registry is **13 rows**, not 20; the derived union is **15 bases**, not 19/20. **15 is the derived-union count everywhere in this plan** — today's 10 plus `githubcopilot.com`, `models.dev`, `npmjs.org`, `skills.sh`, `tavily.com`. The union is a strict **superset** of today's 10, which is why the first post-record install can never revoke a live grant. Any "14" surviving anywhere in this document is a defect, not an alternative reading.

**Related Issues:** #381 (parent), #394 (its carried-forward item "`enrichClaudeSettingsWebFetch` additive-only" is exactly this sub-plan's scope), #422 (added the `SHIPPED_NETWORK_BASES` ↔ `settings.json` WebFetch parity assertion — WS-5 empties one half of it and sub-plan 3 deletes the assertion), #435 (Phase 1 landed).

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

As a consumer, I install bkit with whatever providers I want (`--opencode=openrouter`, a GitHub tracker, the skills registry), paste the network allowlist that `.claude/cloud.md` / `.cursor/cloud.md` generates into my Claude/Cursor dashboard once, and my cloud agent reaches every host bkit configured it to call — without me hand-declaring a single provider API host. Switching or adding a provider later needs no re-paste and no edit anywhere. My own stack domains in `.agents/context.md` stay the only thing I declare, and when I remove one it actually loses its grant.

### Success Criteria _(inherited from design — do not rewrite)_

1. After one install and one dashboard paste, a cloud session reaches every host bkit ships configuration for — including the hosts that are unreachable today — and the cloud paste block carries provider hosts even when the consumer declared no `allowed-domains`.
2. Adding or removing a provider/host source is a one-table edit: no other domain list exists in the repo, and CI fails if any of the five encoding surfaces (cloud paste, `.cursor/allowlist.json`, Claude `WebFetch`, OpenCode `curl`/`wget`, Cursor hook) misses an entry.
3. `bkit check` reports 0 writes on a clean install and a clean upgrade, for every module combination — no consumer-varying content lands in a hash-gated artifact.
4. A domain dropped from `allowed-domains`, or a host dropped from the registry, loses its `WebFetch(domain:…)` grant on the next install/upgrade; a grant the consumer added by hand is never removed.
5. Every doc that describes the allowlist states the derived-from-registry behaviour and the hook's runtime-artifact dependency, changed in the same commit as the code.

**This sub-plan is solely accountable for Criterion 4, and it is the only sub-plan that can fail it.** It also carries the `dryRun` half of Criterion 3 and two doc rows for Criterion 5.

> [!IMPORTANT]
> **Ground-truth correction to Criterion 1, verified 2026-08-26 — human please confirm.** The design named six unreachable hosts. After #435 Phase 1 the live gap list this plan is accountable for is **four hosts**: `api.githubcopilot.com` (base `githubcopilot.com`), `models.dev`, `skills.sh`, `api.tavily.com` (base `tavily.com`).
>
> Criterion 3's "byte-equal-hash-gated" is restated as "hash-gated": `.cursor/hooks/guardrails.cjs` became `format: "markered-text"` in #422 (`.bkit/src/bkit-manifest.ts:554-559`). The **managed block** is still byte-equal (`bkit-manifest.ts:19`), so install-state-varying content there still breaks `bkit check` for every consumer. `.claude/settings.json` is `format: "json"` (`bkit-manifest.ts:312`) and decided by `deepContains`, not by hash — which is why emptying its seed cannot regress `bkit check`.
>
> **🛑 Criterion 4's second clause is restated, because this sub-plan cannot deliver it as inherited.** "a grant the consumer added by hand is never removed" is **false as written**, and this plan says so in two places — the `Edge Cases` row for a hand-added grant bkit later derives independently, and the honest guarantee required **verbatim** in `enrichClaudeSettingsWebFetch`'s JSDoc. `permissions.allow` carries no provenance, so bkit cannot distinguish a hand-added grant from one it wrote. The deliverable clause is: **a grant bkit never recorded writing is never removed.** A hand-added grant whose exact string was also in bkit's derived set at the moment of a previous recording run **is** prunable, is disclosed in the advisory `detect` text, and is recoverable by re-declaring the apex. Confirm this restatement, not the inherited wording.
>
> **Criterion 4 is scoped to the Claude `WebFetch` surface only.** The OpenCode `permission.bash` `curl *{base}*` / `wget *{base}*` grants are never revoked on any path — `injectOpencodeNetworkCurlAllows` only assigns. This change adds ten more such keys per consumer and does not close that gap; it discloses it and defers it (`docs/deferrals.jsonl` key `381-opencode-bash-grants-never-revoked`, written into `.bkit/providers.md` by Task 29 in `381-provider-egress-domains-plan-5.md`).

### Process Sketch _(inherited from design — plan may refine)_

- **WHEN** `bkit install` / `bkit upgrade` runs **→ THEN** one derived host set (all bkit registries + explicitly declared non-derivable hosts) unions with consumer `allowed-domains` and reaches all five encoding surfaces in the same pass.
- **WHEN** a provider or host source is added to `BKIT_EGRESS_SOURCES` **→ THEN** every surface carries it on the next install, and no second list is edited anywhere.
- **WHEN** a registry entry yields no usable host (loopback, IP literal, empty `baseURL`) **→ THEN** it contributes nothing unless it declares an explicit egress host with a recorded `reason`.
- **IF** a derived base is a multi-tenant apex or a multi-label public suffix **→ THEN** CI fails in the bkit repo and nothing ships.
- **IF** `.cursor/allowlist.json` is absent or corrupt **→ THEN** the Cursor hook asks on every outbound `curl`/`wget` and its message names `.cursor/allowlist.json` + `bkit install` as the fix.
- **IF** a host leaves the derived set or a consumer removes an `allowed-domains` entry **→ THEN** its `WebFetch(domain:…)` grant is removed only if bkit recorded writing it; unrecorded entries survive untouched.
- **IF** a cloud session's model calls hang with no network error **→ THEN** the operator compares the fingerprint printed after the paste fence against the dashboard copy and re-pastes.

### Concrete Example _(plan expands from design)_

**Setup:** A consumer repo with the GitHub tracker and the OpenRouter opencode provider installed, an `.agents/context.md` `allowed-domains` block declaring exactly `sentry.io`, and a Claude Code on the web environment whose network mode is **Trusted**. Cloud `/bkit-debug` runs return no external evidence.

**Steps:**

1. Consumer runs `pnpm bkit install --claude --cursor --opencode=openrouter --tracker=github` → bkit derives 15 bases from `BKIT_EGRESS_SOURCES`, unions `sentry.io`, and writes all five surfaces in one pass.
2. Consumer opens `.claude/cloud.md` § 2 Network access → the doc says set **Custom** and tick **Also include default list of common package managers**, and the fenced block lists 32 lines — **15 derived bases + the 1 declared `sentry.io` = 16 bases, each as apex + `*.`**.
3. Consumer pastes the fence content verbatim into the Claude dashboard "Allowed domains" field and selects **Custom**.
4. Consumer runs cloud `/bkit-debug` → the `context=web` block returns search results instead of `HTTP 000`, and the GitHub tracker MCP connects.
5. **Consumer later deletes `sentry.io` from `allowed-domains` and re-runs `pnpm bkit install` → console prints one removal line, `.bkit/advisories.md` carries a `webfetch-grants-pruned` finding naming `WebFetch(domain:sentry.io)` and `WebFetch(domain:*.sentry.io)`, and `git diff .claude/settings.json` shows exactly those two lines deleted. The fingerprint is unchanged, so no re-paste is prompted.**

**Outcome:** One install, one paste. Every host bkit configured an agent to call is reachable from cloud, the consumer hand-declared none of them, and removing their own declared domain actually revoked its grant with a durable record of what was revoked.

_(**Step 5 is this sub-plan's deliverable, end to end.** It is also the step the `Security & Privacy` section corrects: the consumer loses `WebFetch(domain:sentry.io)` and keeps `curl *sentry.io*` = `allow` forever.)_

### Edge Cases _(this sub-plan's share — provenance, prune and uninstall interaction)_

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| _(design)_ Prune with no provenance — first run after upgrade, or a hand-added grant | `webFetchDerived` absent parses to `[]`; `previous \ current` is empty; nothing is pruned. A grant bkit never recorded is never removed. |
| _(plan)_ Consumer hand-added a grant that bkit later derives independently, and it then leaves the derived set | It **is** pruned — `permissions.allow` carries no provenance and bkit cannot distinguish the two. Disclosed in the advisory `detect` text and recoverable by re-declaring the apex. Never stated as "provably cannot delete a hand-added grant". |
| _(plan)_ `enrichClaudeSettingsWebFetch` reaches a non-writing return (file absent / `JSON.parse` throws / `permissions.allow` not an array / `dryRun`) | Returns `null`. `.bkit/version` `webFetchDerived` is carried forward unchanged — never cleared, never overwritten with a claim about bytes that were not written. |
| _(plan)_ Steady-state run where `add` and `remove` are both empty | Writes nothing, but **does** return `current` as the record. Getting this backwards makes the prune permanently dead. |
| _(plan)_ `dryRun` (`bkit check`) | Enrich returns `null`, so the resolved `webFetchDerived` equals the existing value, `derivedChanged` is false, and no `.bkit/version` entry is pushed to `ws.writes`. Criterion 3 holds by construction. **This says nothing about the `.claude/settings.json` entry**, which must still be pushed under `dryRun` when a grant is missing or prunable — see the row below and the recording contract's `ws.writes` column. |
| _(plan)_ `.claude/settings.json` template seed is emptied while enrich now prunes | `deepContains` uses array-**subset** semantics (`.bkit/src/bkit-tiers.ts`), so shrinking the template can only relax containment; `bkit check` cannot regress. **Uninstall hygiene does NOT regress** — verified 2026-08-26 at `.bkit/src/bkit-uninstall.ts:583-598`: uninstall recomputes `resolveNetworkAllowlist(ctx.cwd).map((d) => \`WebFetch(domain:${d})\`)` and folds it into `templateDoc.permissions.allow` **before** `stripTier2JsonScope`, so enrich-added grants were never seed-scoped in the first place. Emptying the seed strands nothing. |
| _(plan)_ `bkit uninstall` after this change removes a grant the consumer added by hand | It **does**, and this change widens the exposure. `bkit-uninstall.ts:589` deletes by **recomputation**, not by provenance: it treats the whole **current** `resolveNetworkAllowlist` output as bkit-owned. Widening 10 → 15 bases widens that strip scope by 10 entries (`githubcopilot.com`, `models.dev`, `npmjs.org`, `skills.sh`, `tavily.com`, each apex + `*.`), so a consumer who hand-added e.g. `WebFetch(domain:tavily.com)` before this change now loses it on `bkit uninstall claude`. Same disclosed-honesty shape as the prune, on a different verb, with no provenance available to it. Disclosed here; the fix is `docs/deferrals.jsonl` key `381-webfetch-grants-survive-uninstall-after-seed-emptied` (premise corrected by a same-`key` row, see `Out of Scope`). |
| _(plan)_ `bkit upgrade` prunes a grant | Console line + `git diff .claude/settings.json` apply. `.bkit/advisories.md` does **not** — `writeAdvisoriesArtifact` is called from the doctor branch (`.bkit/src/bkit-install.ts:2133`) and the install/check path (`:2945`) only. Stated, not hidden. |
| _(plan)_ `bkit check` (`dryRun`) on a consumer whose `.claude/settings.json` is missing a derived grant | Must still report **one write** for `.claude/settings.json`. Today the `ws.writes.push` at `.bkit/src/bkit-modules.ts:1775-1777` sits **outside** `if (!dryRun)` — that push is the entire drift signal. A `dryRun` early return placed above it silently kills the signal while every gate stays green. The recording contract carries an explicit `ws.writes` column for this, and **T15** asserts it. |

### Derived Test Matrix _(rows owned by this sub-plan)_

> Tiers per `docs/testing.md` § Tiers: bkit has **Unit** (`*.test.ts`) and **Integration** (`*.integration.test.ts`) only — no E2E project and no deployed boundary, so no `@live` row is available or appropriate. Rows that cross the real install boundary (spawned `bkit`, real filesystem, real `.bkit/version` round-trip) are Integration with no mocks at that boundary; `docs/testing.md:323` forbids mocking `fs`.

<!-- prettier-ignore -->
| Test description | Type | Target file |
| --- | --- | --- |
| **T8** Prune round-trip + recording contract: record set A, shrink to B, `A \ B` grants gone from `permissions.allow`; a hand-added grant bkit never recorded survives; absent `webFetchDerived` prunes nothing; file-absent / unparseable-JSON / non-array-`allow` / `dryRun` each return `null` and leave the prior record unchanged; a steady-state no-op run **does** record `current`; a removal pushes a `webfetch-grants-pruned` advisory | Unit (Vitest) | `.bkit/src/bkit-modules.test.ts` |
| **T10** Provenance survives a real install: seed `.bkit/version` in a tmp consumer, spawn the real install, read the file back — `webFetchDerived` present, non-empty and equal to the resolved set; a second install with a shrunk `allowed-domains` updates it | Integration (Vitest) | `.bkit/src/bkit-install.integration.test.ts` |
| **T15** Drift signal survives `dryRun` — the inverse of T14, and the only row that can catch a `dryRun` early return placed above the `ws.writes` push: enrich under `dryRun` against a `.claude/settings.json` **missing** one derived grant pushes exactly one `{ path: settingsDst, action: "write" }` onto `ws.writes` (and still returns `null`); the same under `dryRun` against a file carrying a **prunable** recorded grant likewise pushes one write; a file already equal to the derived set pushes none. T14 alone cannot catch this — it asserts 0 writes on a **clean** tree, which is green either way | Unit (Vitest) | `.bkit/src/bkit-modules.test.ts` |
| **T16** Parser default: a `.bkit/version` payload with **no** `webFetchDerived` key parses to `[]` at **both** `parseBkitVersion` returns (`.bkit/src/bkit-version.ts:103`, `:112`), and a payload carrying the field round-trips it unchanged. `[]` is the "no record" sentinel the whole prune rests on — an `undefined` leaking through makes `previous \ current` throw or prune everything | Unit (Vitest) | `.bkit/src/bkit-version.test.ts` |
| **T17** Upgrade-path persistence across **both** `.bkit/version` writers in `bkit-upgrade.ts`: (a) an upgrade whose **only** change is the derived set writes the file — i.e. the nothing-to-persist early return at `:493` no longer swallows it; (b) a payload carrying `webFetchDerived` round-tripped through `migrateStrayGitattributes`'s write at **`:547`** (`{ ...bkitVersion, canonicalHashes }`) comes back with the field intact. (b) exists because `:547` is a third `writeBkitVersion` call site that no other row reaches; it spreads today, so this is a **regression guard**, not a fix | Integration (Vitest) | `.bkit/src/bkit-upgrade.integration.test.ts` |

**Rows owned elsewhere, listed so this sub-plan does not invent them:** T1, T2, T3, T5, T7 (WS-1/WS-2) · T9, T12, T13 (WS-3) · T11 (WS-4) · T4, T6, T14 (WS-6/WS-7). **T14 lives in the same file as T17 (`bkit-upgrade.integration.test.ts`) and asserts the opposite condition** — 0 writes on a clean tree, versus a required write when only the derived set changed. Neither subsumes the other; T14 is written in `381-provider-egress-domains-plan-5.md` by Task 28.

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
| `enrichClaudeSettingsWebFetch` | **BREAKING signature** | `bkit-modules.ts:1751` _(pre-Task-3 coordinate — resolve by symbol)_ | `void` → `readonly string[] \| null`; gains an `advisories: PreflightFinding[]` parameter. Blast radius verified — exactly two call sites: `bkit-modules.ts:1062` (`runClaudeModule`, **pre-`:1461`, unshifted**) and `bkit-install.ts:2588` (upgrade), plus the import at `bkit-install.ts:33`. No test asserts its return today. |
| `updateCanonicalHashesAfterUpgrade` | **BREAKING options** | `bkit-upgrade.ts:465` | `options` gains `webFetchDerived?: readonly string[] \| null`. One call site: `bkit-install.ts:2615` (import at `:61`). Additive-optional, so existing callers compile unchanged. |
| `webFetchDerived` | NEW required field | `.bkit/version` JSON envelope | Required-with-parser-default `[]`, exactly like `canonicalHashes`. See `Data Schema Integration`. |
| `webfetch-grants-pruned` | NEW advisory id | `PreflightFinding.id` | `severity: "advisory"`. |

**Breaking file-structure and content changes owned by this sub-plan**

<!-- prettier-ignore -->
| Artifact | Change | Consumer-visible effect |
| --- | --- | --- |
| `.bkit/templates/.claude/settings.json:10-22` | 13 `WebFetch(domain:…)` entries **removed** (the seed is a stale partial subset — apex missing for 7 of 10 bases) | None at install: `enrichClaudeSettingsWebFetch` runs in the same pass that writes the file. `deepContains` array-subset semantics mean `bkit check` can only get looser. **Does NOT regress `bkit uninstall` hygiene** — `.bkit/src/bkit-uninstall.ts:583-598` recomputes `resolveNetworkAllowlist` into the template scope before stripping, so enrich-added grants were never seed-scoped. The real uninstall delta is the opposite one — see `Edge Cases`. |
| `bkit uninstall claude` strip scope | Widens by 10 entries — the 5 added bases, each apex + `*.` | `bkit-uninstall.ts:589` deletes by **recomputation** of the current derived set, so a grant the consumer hand-added for one of the five new bases (`githubcopilot.com`, `models.dev`, `npmjs.org`, `skills.sh`, `tavily.com`) is now removed by `bkit uninstall`. Consumer-visible only on the uninstall verb; disclosed in `Edge Cases`, deferred with a corrected premise. |
| `.bkit/version` | Gains `webFetchDerived: string[]` | Old payloads without the field parse to `[]` = "no record" = prune nothing. Excluded from the published package (`package.json:22`). |

**Not breaking, stated to pre-empt the question:** no CLI flag, no config key and no `.agents/context.md` syntax is renamed or removed. `resolveNetworkAllowlist` keeps its exact signature, so its four callers are untouched by this sub-plan's changes.

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

- **Assumption:** `.bkit/version` is excluded from the published package (`package.json:22`, `"!.bkit/version"`) and is already consumer-varying via `canonicalHashes`, so recording the consumer's own `allowed-domains` in `webFetchDerived` is not a contradiction of "no consumer content in bkit-owned artifacts". → If `.bkit/version` were ever published or hash-gated cross-consumer, the provenance record would leak consumer stack domains.
- **Assumption:** `deepContains` array-subset semantics make emptying the `settings.json` template WebFetch seed safe for `bkit check`. → If containment were changed to exact-array, emptying the seed would make every consumer's `settings.json` read as drift.
- **Assumption:** `ModuleContext` is one shared object across module fns and `MODULE_DISPATCH_ORDER` (`.bkit/src/bkit-modules.ts:3606-3609`) runs `core` before `claude` while core's `postDispatch` (`:887`) runs after all modules return. → If dispatch order changed, `ctx.webFetchRecorded` would be read before `runClaudeModule` set it and the record would be permanently `[]`.
- **Assumption — CORRECTED 2026-08-26, the v1 draft stated this wrongly.** Tests **do** assert `WebFetch(domain:…)` literals, in exactly one file: `.bkit/src/bkit-uninstall.test.ts`, at `:680`, `:691`, `:692`, `:701` (the `stripTier2JsonScope` synthetic-template case) and `:737`, `:738` (the `runUninstall` case that reads the **real** `.bkit/templates/.claude/settings.json` off disk at `:726-729`). Repo-wide, `rg -c 'WebFetch\(domain:' .bkit/src/*.test.ts .bkit/src/*.integration.test.ts` returns `.bkit/src/bkit-uninstall.test.ts:6` and nothing else. **Both cases still pass after Task 22 empties the seed**, and the reason is `bkit-uninstall.ts:583-598`: the synthetic case never touches the real template, and the real-template case appends `WebFetch(domain:github.com)` / `WebFetch(domain:npmjs.com)`, which `:589` recomputes back into template scope, so the file is still fully stripped and `:747`'s `expect(fileExists(".claude/settings.json")).toBe(false)` still holds. Task 22 owns re-verifying both, unmodified. → **If either case is edited or skipped to make Task 22 green, the change has weakened a gate rather than passed it** (`.agents/rules.md` § Fix code not gates).

**Open Questions**

None specific to this sub-plan's implementation. Open Questions 1–5 shape the registry (`381-provider-egress-domains-plan-1.md`), 6 the dashboard field (`381-provider-egress-domains-plan-2.md`), and 7 — the OpenCode grant lifecycle, resolved as **B: disclose and defer** — is dispositioned by Task 33 in `381-provider-egress-domains-plan-5.md`. Its consequence is carried in this sub-plan's `Security & Privacy` section because it is the asymmetry the prune creates.

### 👤 ✅ Human Confirmation

- [ ] **Open Questions & Assumptions confirmed:** I have resolved or explicitly accepted every open question and assumption above.

> [!CAUTION]
> **Agent:** Do NOT pass Gate 1 until this checkbox is `[x]`. Summary must issue `REVISE` if unchecked.

---

## Out of Scope _(this sub-plan's share)_

<!-- prettier-ignore -->
| Excluded item | Why `Exempt` | Where it belongs |
| --- | --- | --- |
| `bkit upgrade` does not write `.bkit/advisories.md` | Genuinely additive: a general install/upgrade finalisation-parity gap that pre-dates this issue and affects **every** advisory, not just the prune's. `writeAdvisoriesArtifact` is called only from the doctor branch (`bkit-install.ts:2133`) and the install/check path (`:2945`). The prune does not depend on it — `git diff .claude/settings.json` is durable on every path. Plan-sized because closing it means restructuring the upgrade branch's finalisation, not adding a call. | Follow-up issue. Mirrored as `docs/deferrals.jsonl` key `381-upgrade-does-not-write-advisories-artifact` (`reason: own-cycle`). |
| `bkit uninstall` deletes derived `WebFetch` grants by **recomputation**, not by provenance | **This row replaces the v1 draft's "grants survive uninstall once the seed is emptied" row, whose premise the source disproves.** `.bkit/src/bkit-uninstall.ts:583-598` recomputes `resolveNetworkAllowlist(ctx.cwd)` into `templateDoc.permissions.allow` before `stripTier2JsonScope`, so emptying the seed strands nothing. The genuine residual is the inverse and is genuinely additive: recomputation cannot distinguish a hand-added grant that collides with a derived base, and this change widens the collision surface by five bases. `webFetchDerived` is exactly the record a provenance-aware uninstall would read — but consuming it means adding a provenance axis to a decision matrix that is currently format-driven (fully-managed / markered-text / byte-equal-text / json), re-reasoning every format branch and the heavy-customised-consumer round-trip byte-identity fixture against it. Plan-sized, same class as the prune, different verb. | Follow-up issue. `docs/deferrals.jsonl` key `381-webfetch-grants-survive-uninstall-after-seed-emptied` (`reason: own-cycle`) — **premise corrected by a same-`key` append**, per `.bkit/jsonl.md` § Updating a Row. The prior line stays on disk untouched; fold is last-wins. |

> [!CAUTION]
> **Default = in-scope.** Both rows above are genuinely-additive: neither is required by a `Success Criteria` bullet, a `Derived Test Matrix` row, or an Architecture change in this sub-plan. **Both deferral rows already exist on disk** — this sub-plan appends nothing to `docs/deferrals.jsonl`; Task 31 in `381-provider-egress-domains-plan-5.md` verifies the ledger.

## Security & Privacy

> Reference: `docs/security.md`. Check all that apply; skip inapplicable rows.

- [ ] **PII** — absent from logs? → **Applies.** The prune's console lines and the `webfetch-grants-pruned` advisory print exact `WebFetch(domain:…)` strings, which can include a consumer's own app domains from `allowed-domains`. Domains are not PII and this is the consumer's own local terminal / local `.bkit/advisories.md` (gitignored). No new log point emits a token, a key, or a path outside the repo.
- [ ] **New Secret/Env Var** — added to the env schema? → **N/A.** No new secret, no new env var, no new credential read.
- [ ] **Provenance record contents** — consumer data in a bkit-owned file? → **Applies, and it is accepted deliberately.** The recorded set is `resolveNetworkAllowlist(cwd)`, which includes the consumer's own `allowed-domains`, so a consumer's `sentry.io` lands in `.bkit/version`. `.bkit/version` is already consumer-varying (`canonicalHashes` keys are per-consumer paths) and is not published (`package.json:22`). Recording only bkit's own subset would break Success Criterion 4, because a consumer-declared domain leaving `allowed-domains` is exactly the removal that criterion requires.

### Grant lifecycle asymmetry — the half this sub-plan creates

**Stated plainly because the `Concrete Example`'s step 5 could otherwise be read as "removing a domain revokes its reach":** a consumer who drops `sentry.io` from `allowed-domains` loses `WebFetch(domain:sentry.io)` and **keeps** `curl *sentry.io*` = `allow` and `wget *sentry.io*` = `allow` forever. That is a **shell** egress grant, strictly broader than the `WebFetch` grant the prune removes, and it survives uninstall too — `injectOpencodeNetworkCurlAllows` (`.bkit/src/bkit-modules.ts:1726-1734`, **pre-Task-3 coordinate, resolve by symbol**) only ever assigns, and the injected keys are absent from the rendered template so `stripTier2JsonScope` leaves them. This change adds ten more such keys per consumer (five new bases × `curl` + `wget`).

Recorded as `docs/deferrals.jsonl` key `381-opencode-bash-grants-never-revoked` and written into `.bkit/providers.md` by **Task 29 in `381-provider-egress-domains-plan-5.md`**, in the same commit as that workstream. The pre-existing `381-opencode-curl-glob-substring-bypass` row covers the glob **shape** and does not cover this. **Nothing in this sub-plan edits the OpenCode surface** — the asymmetry is created by the prune existing on one surface and not the other, and it is disclosed, not closed.

## 🚨 Pre-Flight / Dependencies 🚨

**CRITICAL:** Check off ALL core items. Check conditional items only when applicable. Abort if anything required is missing.

### Core _(always verify)_

- [ ] **Package Management:** No new runtime dependency. Confirm `pnpm install --frozen-lockfile` is clean and `pnpm-lock.yaml` is untouched by this change.
- [ ] **Dependency Versions:** `package.json:28-29` pins `engines.node >= 20`. Spot-check `node --version >= 20`, `npx tsc --version`, `pnpm --version` (pinned `pnpm@10.34.3`, `package.json:31`).
- [ ] **Existing-Solution Search (reuse over duplicate):** Done. `enrichClaudeSettingsWebFetch`, `resolveNetworkAllowlist`, `updateCanonicalHashesAfterUpgrade`, `parseBkitVersion` / `writeBkitVersion` and `PreflightFinding` all already exist and are **extended, not replaced**. **No `[NEW]` artifact in this sub-plan** — the only new file in the whole change is the registry leaf, created in `381-provider-egress-domains-plan-1.md`.
- [ ] **User Context:** All files are in this worktree; no external credential or user-supplied value is needed.
- [ ] **Project Context:** `docs/decisions.jsonl` and `docs/knowledge.jsonl` read. Load-bearing entries: `bkit install` flips `core.bare=true` (reset with `git config core.bare false` after every dogfood install); `bkit check` != `bkit upgrade` (**separate engines — verify both live**, which is exactly why T14 and T17 are separate rows). `docs/deferrals.jsonl` carries **9 lines** under 8 unique `381-*` keys — none may be duplicated, none may be edited in place.
- [ ] **Testing & Quality:** Aligned with `docs/testing.md`. bkit has **Unit** and **Integration** only — no E2E project, no deployed boundary, no `@live` tier (`docs/testing.md:325-333`). `docs/testing.md:323` forbids mocking `fs`: T10 uses a real `os.tmpdir()` consumer and a spawned install. **`package.json:58` pins the unit-coverage lane to a literal brace list that EXCLUDES `bkit-modules`** — so the branching this sub-plan adds inside `enrichClaudeSettingsWebFetch` is not coverage-gated, which makes T8's seven contract rows and T15 the only thing standing between the restructure and a silent regression.
- [ ] **Prerequisite Plans:** `381-provider-egress-domains-plan-1.md` (Tasks 1–9) must be complete **and Task 1's branch must be stated in the handover**. Verify concretely: `BKIT_SHIPPED_NETWORK_DOMAINS` is a computed flatMap of the 15 derived bases, and the handover says GREEN or RED for Task 1. **Do not start Task 19 on an inferred GREEN.**

### Conditional _(verify only when applicable)_

- [ ] **Secrets & Env Vars:** N/A — no new API key, credential or env var.
- [ ] **Schema State:** **Applies.** The one schema is the `.bkit/version` JSON envelope. Confirm the envelope is still `{ pinnedVersion, tier3Hashes, canonicalHashes }` (`.bkit/src/bkit-version.ts:39`, `:46`, `:63`) before adding the fourth field — or, if Task 1's probe edit is still in place from a GREEN run, that `webFetchDerived` is present exactly in the three probe locations and nowhere else.
- [ ] **Architecture & UI:** No `[NEW]` file. No new import edge: `bkit-modules.ts` already imports from `bkit-cloud-env.ts`, `bkit-install.ts` already imports `enrichClaudeSettingsWebFetch` (`:33`) and `updateCanonicalHashesAfterUpgrade` (`:61`). No UI.
- [ ] **Observability:** **Applies.** The prune adds console output behind the existing `LOG_PREFIX` and one new `PreflightFinding`. Shape is `{ id, severity, detect, action }` (`.bkit/src/bkit-preflight.ts`), and `.agents/rules.md` § Repo Authoring requires the `action` text to **inline** the fix rather than link to `docs/*.md`. No new log **name** is introduced, so `docs/observability.md` needs no row from this sub-plan.
- [ ] **Notifications:** N/A.

### Ground-truth citations this sub-plan depends on — re-verified in this worktree, 2026-08-26

> Every row below was read from source in this worktree on 2026-08-26. Where a cell disagrees with the parent design or the 2026-08-24 re-check comment, **this table is correct**. Do not copy the design's line numbers forward. **Every `bkit-modules.ts` anchor below that is greater than `:1461` is a PRE-Task-3 coordinate and has since shifted by ~57 lines — resolve by symbol.**

<!-- prettier-ignore -->
| Fact | **Now (verified 2026-08-26)** |
| --- | --- |
| `enrichClaudeSettingsWebFetch` | `.bkit/src/bkit-modules.ts:1751-1778`; additive-only JSDoc `:1736-1750`; four non-writing returns at `:1757`, `:1763-1765`, `:1767`, `:1770`. **Post-`:1461` — resolve by symbol.** Design cited `:1716-1758` |
| enrich call in `runClaudeModule` | `.bkit/src/bkit-modules.ts:1062` — **pre-`:1461`, unshifted.** Design cited `:1033` |
| `enrichClaudeSettingsWebFetch` `ws.writes` push | **`.bkit/src/bkit-modules.ts:1775-1777` — sits OUTSIDE `if (!dryRun)` (`:1771-1774`).** This push is the entire `bkit check` drift signal for `.claude/settings.json`. Preserving it across the WS-5 restructure is a hard requirement, gated by **T15**. Cited by neither the design nor the re-check |
| `ModuleContext` / dispatch order | `ModuleContext` `.bkit/src/bkit-modules.ts:174`, `postDispatch` field `:205`, `MODULE_DISPATCH_ORDER` `:3606-3609` (`core` → `claude` → `cursor`). All **pre-`:1461`** except `:3606-3609`, which is post- but is a stable symbol reference, not an edit target |
| Install-side `.bkit/version` fresh literal | `.bkit/src/bkit-modules.ts:955-959` — **pre-`:1461`, unshifted**; `postDispatch.push` `:887`, `needsWrite` `:946`, `.bkit/version` excluded from `byteEqualPaths` `:900` |
| `parseBkitVersion` returns / `BkitVersion` fields | `.bkit/src/bkit-version.ts:103` and `:112`; required fields `:39`, `:46`, `:63`; `sha256` `:190` |
| `writeBkitVersion` call sites | **THREE non-test call sites, not two** — `.bkit/src/bkit-modules.ts:955` (fresh literal), `.bkit/src/bkit-upgrade.ts:500` (`updateCanonicalHashesAfterUpgrade`, spreads) and **`.bkit/src/bkit-upgrade.ts:547`** (`migrateStrayGitattributes`, `{ ...bkitVersion, canonicalHashes }` — spreads, and sits after that function's own `if (dryRun) return;`). Definition `.bkit/src/bkit-version.ts:140`. The third was unenumerated in the design, the v1 draft and the v2 review; it preserves the field, but nothing proved that until **T17(b)** |
| `updateCanonicalHashesAfterUpgrade` | `.bkit/src/bkit-upgrade.ts:465-501`; `dryRun` return `:469`, `!bkitVersion` `:474`, nothing-to-persist `:493`, spread `:495-499`. Design cited `:446-481` |
| Upgrade-side artifact / enrich / version writer | artifact `.bkit/src/bkit-install.ts:2576`, enrich `:2588`, `updateCanonicalHashesAfterUpgrade` `:2615`; imports at `:33`, `:43`, `:61` |
| `.claude/settings.json` manifest entry | `.bkit/src/bkit-manifest.ts:312`, `format: "json"` — decided by `deepContains`, not by hash |
| `settings.json` template WebFetch seed | `.bkit/templates/.claude/settings.json:10-22`, **13 entries, apex missing for 7 of 10 bases** (`githubusercontent`, `anthropic`, `claude`, `linear`, `opencode`, `ollama`, `openrouter`). Design said `:10-28`, 19 entries |
| `bkit uninstall` and `.claude/settings.json` | **`.bkit/src/bkit-uninstall.ts:583-598`** — the **fourth** `resolveNetworkAllowlist` caller, named nowhere in the design or the v1 plan draft. It recomputes `resolveNetworkAllowlist(ctx.cwd).map((d) => \`WebFetch(domain:${d})\`)` (call at `:589`) into `templateDoc.permissions.allow` **before** `stripTier2JsonScope` (`:599`). Consequence A: emptying the template seed strands nothing. Consequence B: widening the derived set widens what uninstall **deletes** |
| Tests asserting `WebFetch(domain:…)` literals | **`.bkit/src/bkit-uninstall.test.ts` only — 6 occurrences** at `:680`, `:691`, `:692`, `:701`, `:737`, `:738`. `rg -c 'WebFetch\(domain:' .bkit/src/*.test.ts .bkit/src/*.integration.test.ts` returns exactly `.bkit/src/bkit-uninstall.test.ts:6` and nothing else. The `runUninstall` case at `:719-749` reads the **real** template off disk (`:726-729`) and asserts `fileExists(".claude/settings.json") === false` at `:747`; it survives Task 22 because of `bkit-uninstall.ts:589`, and `:748`'s `toContain("Bash(*)")` is untouched by emptying the WebFetch entries. Design said "no test references it" — wrong |
| `.bkit/version` excluded from package | `package.json:22` — `"!.bkit/version"` ✓ |
| `.bkit/workflows.md` WebFetch row | `:1277` (permission table row, worded generically — "per host in the network allowlist"), plus `:1281`. Design cited `:1124` |
| `.bkit/README.md` allowlist pointer | `:270` (`.cursor/allowlist.json` row) and `:370` (providers.md pointer). Design cited `:345` |
| `injectOpencodeNetworkCurlAllows` | `.bkit/src/bkit-modules.ts:1726-1734` — **post-`:1461`, resolve by symbol.** Not edited by this sub-plan; cited only for the disclosed asymmetry |

### 🔒 Gate 1: Prerequisites Check _(sub-plan scope)_

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all applicable boxes above. **DO NOT stop for user permission.** Once saved, immediately proceed to `Data Schema Integration`. The plan-wide Gate 1 is executed once in `381-provider-egress-domains-plan-1.md`.

- [ ] **Acceptance Scenario confirmed:** Human confirmed `👤 Acceptance Scenario` section (checkbox is `[x]`).
- [ ] **Breaking Changes confirmed:** Human confirmed `⚠️ Breaking Changes & Naming Review` section (checkbox is `[x]`).
- [ ] **Open Questions confirmed:** Human confirmed `👤 Open Questions & Assumptions` section (checkbox is `[x]`).
- [ ] **🛑 Task 1's branch is READ, not inferred.** The handover from `381-provider-egress-domains-plan-1.md` states GREEN or RED. On RED, apply the re-scope in `Scope & Dependency Position` before touching any file.
- [ ] **Predecessor landed:** `381-provider-egress-domains-plan-1.md` Tasks 1–9 all `[x]`, `pnpm vitest run` green on the tree this sub-plan starts from.
- [ ] **Security & Privacy checked:** All applicable rows verified.
- [ ] **Gate 1 (sub-plan scope) - Verified.**

## Data Schema Integration

**No database.** bkit ships no DB, no migration lane and no `docs/data-schema.md` rows. The one persisted schema this change touches is the **`.bkit/version` JSON envelope** — a per-consumer local state file, gitignored in consumer repos and excluded from the published package (`package.json:22`, `"!.bkit/version"`).

**Invariant Conformance — corrected 2026-08-26, and the correction matters.** The earlier phrasing "`.bkit/version` has exactly **one writer per path**" is **wrong as stated**, and enumerating only two writers is what let a third go unexamined. `rg -n 'writeBkitVersion\(' .bkit/src/ --glob '!*.test.ts' --glob '!*.integration.test.ts'` returns the definition (`.bkit/src/bkit-version.ts:140`) plus **three** call sites:

<!-- prettier-ignore -->
| Call site | Shape | Does `webFetchDerived` survive it? |
| --- | --- | --- |
| `.bkit/src/bkit-modules.ts:955` — install, `runCoreModule` deferred `postDispatch` | **fresh object literal** — drops any field not named in it | **No, unless threaded explicitly.** This is the clobbering writer and the sole reason Task 1 exists |
| `.bkit/src/bkit-upgrade.ts:500` — `updateCanonicalHashesAfterUpgrade` | `{ ...bkitVersion, pinnedVersion, canonicalHashes }` (`:495-499`) | Yes — it spreads. Task 21 threads the field so an upgrade can also **update** it, not merely preserve it |
| `.bkit/src/bkit-upgrade.ts:547` — `migrateStrayGitattributes`, the dot-less-`gitattributes` repair | `{ ...bkitVersion, canonicalHashes }` | **Yes — verified by source read 2026-08-26: it spreads, so the field is preserved.** Guarded by **T17(b)** as a regression guard, not a fix. It is also `dryRun`-safe: the function returns at its own `if (dryRun) return;` before this write, so Criterion 3 is unaffected |

The accurate invariant, and the one this change must not break, is therefore: **each write site either spreads the parsed payload or names every field explicitly, and no new write site is added.** The install literal is the only non-spreading one. **Task 20's `Done when` pins the exact call-site set so a fourth cannot appear unnoticed.**

The two write **paths** disagree today — install builds a fresh literal and drops unknown fields, upgrade spreads and preserves them — so a field added only to the upgrade side is silently clobbered on the next install. `enrichClaudeSettingsWebFetch` therefore **never** touches `.bkit/version`: it returns the set it wrote, and the existing writer on each path persists it. A write that cannot happen (dry-run, enrich early return, claude-less install) resolves to carry-forward, never clobber-to-empty; a failure is visible as `bkit check` reporting a write, which is what Success Criterion 3 gates.

### Data Schema Usage (Inputs & Outputs)

- **Input (Read):** `.bkit/version` → `pinnedVersion`, `tier3Hashes`, `canonicalHashes` (existing, unchanged reads); `.bkit/version` → `webFetchDerived` (new read, both paths, defaulting to `[]`). `.agents/context.md` `allowed-domains` block via `extractAllowedDomains`. `.claude/settings.json` → `permissions.allow`.
- **Output (Write):** `.bkit/version` → `webFetchDerived` (new); `.claude/settings.json` → `permissions.allow` (now **add and remove**, previously add-only).

### Data Schema Changes

- **ADD:** `.bkit/version` → `webFetchDerived: string[]` — the exact `WebFetch(domain:…)` strings bkit wrote into `.claude/settings.json` on the last install/upgrade that actually wrote it.
  - **Required, not optional.** `canonicalHashes` is a _required_ property of the `BkitVersion` interface with its `{}` default applied inside `parseBkitVersion` (`.bkit/src/bkit-version.ts:63`, `:97-103`). "Additive exactly like `canonicalHashes`" therefore means `webFetchDerived: string[]` required-with-parser-default `[]`, **not** `webFetchDerived?: string[]`.
  - **Three construction sites gain the field:** `.bkit/src/bkit-modules.ts:955-959` (install literal) and the two `parseBkitVersion` returns at `.bkit/src/bkit-version.ts:103` and `:112`. The `{ ...bkitVersion, … }` spreads in `bkit-upgrade.ts` are untouched.
  - **Typecheck blast radius: none in tests.** `tsconfig.json` excludes `**/*.test.ts` from `tsc --noEmit`, so the existing test-side `tier3Hashes:` object literals do not break.
  - **Backward compatibility:** old payloads without the field parse to `[]` = "no record" = prune nothing. This is why the first run after upgrading to this version can never remove a grant.
  - **Consumer content in the field, stated plainly:** the recorded set is `resolveNetworkAllowlist(cwd)`, which includes the consumer's own `allowed-domains`, so a consumer's `sentry.io` lands in `.bkit/version`. Accepted: `.bkit/version` is already consumer-varying (`canonicalHashes` keys are per-consumer paths) and is not published. The rule this design defends is about **hash-gated shipped** artifacts — the `guardrails.cjs` managed block — not the local state file. Recording only bkit's own subset would break Success Criterion 4, because a consumer-declared domain leaving `allowed-domains` is exactly the removal that criterion requires.
- **MODIFY:** none. **DELETE:** none.

## Architecture & Component Changes

**CRITICAL:** Prefer `[MODIFY]` over `[NEW]`. **CRITICAL:** never weaken a gate to pass — no `as any`, `@ts-ignore`, `.skip`, deleted assertions, empty `catch`, or mocking-away the unit under test. **CRITICAL:** `.agents/rules.md` § Repo Authoring — edit source only; **never** edit mirrors in `.claude/`, `.cursor/`, `.opencode/` directly, and batch `bkit install` mirror regeneration **once** at session end — Task 32, in `381-provider-egress-domains-plan-5.md`, **not** here.

### Database Migrations

None. bkit ships no database and no migration lane.

### Claude WebFetch — provenance and prune (WS-5)

#### [MODIFY] `.bkit/src/bkit-version.ts`

- `BkitVersion` gains required `webFetchDerived: string[]`; both `parseBkitVersion` returns (`:103`, `:112`) default it to `[]`.

#### [MODIFY] `.bkit/src/bkit-modules.ts` — install write path and prune

- `ModuleContext` (`:174`, `postDispatch` field at `:205`) gains `webFetchRecorded?: readonly string[] | null` (absent/null = "nothing to record this run").
- `runClaudeModule` assigns `enrichClaudeSettingsWebFetch`'s return to `ctx.webFetchRecorded` at the `:1062` call site.
- Core's `postDispatch` literal (`:955-959`) gains `webFetchDerived`, resolved as `ctx.webFetchRecorded ?? existingVersion?.webFetchDerived ?? []` — **carry-forward, never clobber-to-empty**. `needsWrite` (`:946`) extends from `versionChanged || hasNewEntries` to `… || derivedChanged`, a set comparison against `existingVersion?.webFetchDerived ?? []`; without it, a run whose only change is the derived set computes the new value and then does not write it.
- Viable only because `ModuleContext` is a single shared object handed to every module fn and `MODULE_DISPATCH_ORDER` (`:3606-3609`) runs `core` then `claude` while core's `postDispatch` executes after all modules return.
- `enrichClaudeSettingsWebFetch` (`:1751-1778`, **post-Task-3: resolve by symbol**) signature becomes `(settingsDst, cwd, dryRun, ws, advisories) => readonly string[] | null`. Prune, in the same function: `previous = webFetchDerived` (absent → `[]`); `current = resolveNetworkAllowlist(cwd)` mapped to `WebFetch(domain:…)`; `add = current \ allow`; `remove = (previous \ current) ∩ allow`; `write = allow - remove + add`, only when `add` or `remove` is non-empty; `record = current`, **returned** to the caller and never written here.
- **Restructure — do not extend — the `if (missing.length === 0) return;` early return at `:1770`.** Today it is the no-op fast path; with a prune it must fall through to the removal computation, and the combined `add.length === 0 && remove.length === 0` case must still return `current` rather than `null`. Getting this backwards makes a steady-state install never record, and the prune never fires.
- **🛑 The `ws.writes` push at `:1775-1777` MUST survive the restructure, and it MUST still fire under `dryRun`.** It sits **outside** `if (!dryRun)` today, and that is deliberate: it is the entire mechanism by which `bkit check` reports — and the CI drift gate exits non-zero on — a consumer whose `.claude/settings.json` is missing a grant bkit would add. The obvious restructure of "make `dryRun` return `null`" is `if (dryRun) return null;` near the top of the function; it satisfies every other line of this contract and **silently deletes a shipped drift signal for every consumer's CI**, going green the whole way. Returning `null` under `dryRun` is about **provenance**, not about the write set: enrich must still compute `add` / `remove` and still push `{ path: settingsDst, action: "write" }` when either is non-empty, and only then return `null` instead of `current`. Gated by **T15**, which is the only matrix row that can catch it — T14 asserts 0 writes on a **clean** tree, which is green either way.
- **Recording contract — the record follows the write, never the intent.** Recording a claim on a non-writing path is strictly worse than the additive-only status quo, because the _next_ run's `previous \ current` would then be free to delete consumer entries bkit never authored.

<!-- prettier-ignore -->
| Path | Writes settings.json? | Pushes to `ws.writes`? | Returns | Why |
| --- | --- | --- | --- | --- |
| file absent (`:1757`) | no | no (unchanged — the existing return is above the push) | **null** | nothing to make a claim about |
| `JSON.parse` throws (`:1763-1765`) | no | no (unchanged) | **null** | contents unknown; a claim would be a guess |
| `permissions.allow` not an array (`:1767`) | no | no (unchanged) | **null** | same |
| `dryRun`, `add` or `remove` non-empty | no | **YES — required.** This is `bkit check`'s only drift signal for this file | **null** | `bkit check` must never mutate provenance, but it must still **report** the drift. Provenance and write-reporting are separate concerns and the restructure must not collapse them |
| `dryRun`, `add` and `remove` both empty | no | no | **null** | nothing to report and nothing to claim |
| `add` and `remove` both empty (not dry-run) | no (no-op) | no | **`current`** | the file already equals what bkit would write — the claim is true, and recording it is what lets a _later_ shrink prune |
| `add` or `remove` non-empty (not dry-run) | yes | yes (unchanged) | **`current`** | the claim matches the bytes just written |

- **The honest guarantee**, required verbatim in both the code comment and the JSDoc that replaces the additive-only one at `:1736-1750`: _the prune can only remove a grant bkit **recorded writing**. It cannot remove a grant bkit never recorded. It **can** remove a grant the consumer added by hand if that exact string was also in bkit's derived set at the moment of a previous recording run, because `permissions.allow` carries no provenance._ Never restate the false "provably cannot delete a consumer's hand-added grant".
- **Removals recorded in three destinations, ascending durability:** (1) one console line per removed grant behind the existing `LOG_PREFIX`; (2) a `webfetch-grants-pruned` `PreflightFinding` (`severity: "advisory"`, exact removed strings in `detect`, and an `action` that inlines the re-declare path plus the `git diff .claude/settings.json` pointer — `.agents/rules.md` forbids linking out to `docs/*.md` from advisory text) pushed onto `ctx.advisories` and flushed through `runPostInstallCheck` → checklist banner + `writeAdvisoriesArtifact` (`bkit-install.ts:2945`); (3) `git diff .claude/settings.json`, which is git-tracked and durable on every path. **Stated limitation:** `bkit upgrade` does not write `.bkit/advisories.md` today, so on upgrade only (1) and (3) apply.

#### [MODIFY] `.bkit/src/bkit-upgrade.ts:465-501` — upgrade write path

- `updateCanonicalHashesAfterUpgrade` `options` gains `webFetchDerived?: readonly string[] | null`, fed from the enrich call at `bkit-install.ts:2588` and applied to the `updated` literal (`:495-499`) only when non-null. It already spreads, so the field survives. Its "nothing to persist" early return (`:493`) must extend with `&& webFetchUnchanged`, or an upgrade whose only change is the derived set silently drops the record. Its `dryRun` return (`:469`) gives the dry-run rule for free.
- **`migrateStrayGitattributes` (`:547`) is the third `writeBkitVersion` call site and is deliberately NOT edited.** It writes `{ ...bkitVersion, canonicalHashes }` on the dot-less-`gitattributes` repair path; the spread preserves `webFetchDerived`, and its own `if (dryRun) return;` sits above the write, so it is dry-run-safe. Listed here so the absence of an edit reads as verified rather than as an oversight — the same discipline WS-6 applies to `injectOpencodeNetworkCurlAllows`. **T17(b)** pins it: a payload carrying the field, round-tripped through this path, comes back with it intact.

#### [MODIFY] `.bkit/templates/.claude/settings.json:10-22`

- Remove the 13 `WebFetch(domain:…)` entries. It is a stale partial subset today (apex missing for 7 of 10 bases) that enrich silently tops up — the same hand-sync failure as the hook. Enrich runs in the same `runClaudeModule` pass that writes the file, and `deepContains` array-**subset** semantics mean shrinking the array strictly relaxes containment, so `bkit check` cannot regress.

### Cron Jobs & Scheduled Tasks

None.

## Supersession Inventory _(this sub-plan's share)_

<!-- prettier-ignore -->
| Existing artifact | Replaced by | Decision | Justification |
| --- | --- | --- | --- |
| 13 `WebFetch(domain:…)` seed entries, `.bkit/templates/.claude/settings.json:10-22` | `enrichClaudeSettingsWebFetch`, which runs in the same pass that writes the file | **DELETE** | Already a stale partial subset (7 of 10 apexes missing) topped up invisibly — the fourth hand-maintained copy. A parity test would automate the sync; emptying eliminates it. |

> [!CAUTION]
> The `DELETE` above is mirrored as a `[MODIFY]` entry in `Architecture & Component Changes` and as Task 22 in the runbook. No `RETAIN-WITH-REASON` row: nothing here is an external contract or a staged rollout.

## Documentation Updates _(this sub-plan's share — landed by Task 25, same commit)_

<!-- prettier-ignore -->
| Doc | Change required |
| --- | --- |
| `.bkit/workflows.md` | `:1277` permission-table row for `WebFetch(domain:…)` — worded generically ("per host in the network allowlist"), so **verify** it still holds after the template seed is emptied rather than assuming. `:1281` likewise. **Decision: KEEP, unedited** — see Task 25. |
| `.bkit/README.md` | `:270` `.cursor/allowlist.json` row — "generated from tooling defaults + `.agents/context.md` allowed-domains" becomes derived-registry ∪ consumer. `:370` providers.md pointer — after Task 22 empties the template seed nothing is **baked**; restate to name the enriched settings surface. **Decision: EDIT both.** |

_No `docs/observability.md` row: the prune reuses the existing `LOG_PREFIX` and introduces no new log name. No `.bkit/providers.md` row: its four sections belong to sub-plans 2, 3 and 5._

## Rollback Strategy _(workstream scope)_

<!-- prettier-ignore -->
| Axis | Action | Notes |
| --- | --- | --- |
| **DB** | None — bkit ships no database and no migration lane. | n/a |
| **Code** | `git revert` this sub-plan's commits, then `pnpm build` and commit the regenerated `dist/`. | `pnpm bkit:check:dist` fails CI if `dist/` is not reverted alongside the source. |
| **Consumer state** | `.bkit/version` retains `webFetchDerived` after a revert. Harmless: the reverted `parseBkitVersion` ignores unknown keys, and the reverted install writer builds a fresh literal that drops it on the next install. **No cleanup step is required and none should be added** — a migration-down would be new code on the rollback path. | Verified against the current parse/write shapes (`bkit-version.ts:81-112`, `bkit-modules.ts:955-959`). |
| **Consumer state — grants already pruned** | A revert does not restore a removed `WebFetch(domain:…)` grant, because the reverted enrich is additive-only and the domain is no longer in the derived set. Recovery is the same path the advisory names: declare the apex in `.agents/context.md` `allowed-domains` and re-run `bkit install`. Every removal is also a deleted line in `git diff .claude/settings.json`, so the exact strings are recoverable from history. | **This is the only irreversible consumer-visible effect in the entire change**, and it is bounded to grants bkit itself recorded writing. |
| **Risk window** | None. There is no deploy and no schema migration; the change is atomic in one commit and its `dist/` output. | Between merge and a consumer's next `bkit install`/`bkit upgrade`, consumers run entirely on the old behaviour. |

## Agent Execution Runbook

> [!IMPORTANT]
> **Continuous Execution:** Work runbook autonomously. No pause for user permission at any Gate. Check `[x]` tasks as you go.
> **Step Isolation:** Complete each task fully (verification + checkbox) before next task.
> **Integration Shape:** advisory only — delivering every task in ONE PR is always correct.

**Standing rules for every task below** (`.agents/rules.md` § Repo Authoring):

- **Edit source only** — `.bkit/src/`, `.bkit/templates/`, `.bkit/workflows/`, `.bkit/prompts/`, `.agents/`. **Never** edit `.claude/`, `.cursor/`, `.opencode/` mirrors directly.
- **Batch `bkit install` once, at session end** (Task 32, in `381-provider-egress-domains-plan-5.md`) — never per edit, and **never in this sub-plan**.
- **Docs change in the same task as the code they describe.** No doc-only follow-up task exists in this runbook by design — Task 25 is WS-5's docs and lands in the same commit as Tasks 19–24.
- **Add no new `try`/`catch` anywhere in this change** — a catch-with-default-return bumps `defensive.error-obscuring` and fails `slop:delta` on net score even at net-zero finding count. Use `URL.canParse`.
- **After any `bkit install` / `bkit upgrade` in this repo, run `git config core.bare false`** — install flips it.
- **🛑 Every `.bkit/src/bkit-modules.ts` line number in this plan is a PRE-Task-3 coordinate.** Task 3 (already landed, `381-provider-egress-domains-plan-1.md`) deleted `OPENCODE_PROVIDER_DEFAULTS` at `:1461-1518` — 58 lines — so every anchor **after** `:1461` has shifted by roughly 57 lines: `injectOpencodeNetworkCurlAllows` call sites `:1698` / `:1718` and definition `:1726-1734`, `enrichClaudeSettingsWebFetch` `:1751-1778`, its JSDoc `:1736-1750`, its early return `:1770` and its `ws.writes` push `:1775-1777`. Anchors **before** `:1461` (`:174`, `:205`, `:887`, `:946`, `:955-959`, `:1062`, `:1309-1310`, `:1396-1400`) are unaffected. **Resolve every post-`:1461` anchor by symbol name, never by line number**, and never write a `Done when` that greps a post-`:1461` line range. **This sub-plan is the one that carries the most post-`:1461` work — Tasks 20 and 23 both live inside shifted territory.**
- **Deferral rows are append-only.** `docs/deferrals.jsonl` carries 9 lines under 8 unique `381-*` keys; a state change is a same-`key` append (`.bkit/jsonl.md` § Updating a Row), never an edit to a prior line. **This sub-plan appends none** — both of its `Out of Scope` rows already exist on disk.

Task order is the design's dependency graph: **WS-1 → WS-2 → {WS-3, WS-4, WS-5} → WS-6 → WS-7**. This sub-plan is Phase 3c.

### Phase 3c — WS-5: Claude WebFetch provenance and prune _(requires: WS-2 and Task 1 green)_

- [ ] **Task 19 — Land the `.bkit/version` field properly.** Promote Task 1's probe edit into the real change: `webFetchDerived: string[]` required on `BkitVersion`, parser-default `[]` at both `parseBkitVersion` returns. _(Owns matrix row **T16**.)_
  - **Done when:** `pnpm typecheck` passes with no `?` on the field; **T16 passes** in `.bkit/src/bkit-version.test.ts` — a payload with no `webFetchDerived` key parses to `[]` at **both** returns (`.bkit/src/bkit-version.ts:103` and `:112` — cover both, they are separate code paths), and a payload carrying the field round-trips it unchanged.
- [ ] **Task 20 — Thread the install write path.** `ModuleContext` gains `webFetchRecorded?: readonly string[] | null`; `runClaudeModule` assigns enrich's return at `.bkit/src/bkit-modules.ts:1062`; core's `postDispatch` literal resolves `ctx.webFetchRecorded ?? existingVersion?.webFetchDerived ?? []`; `needsWrite` at `:946` extends with `|| derivedChanged`. Enrich **never** writes `.bkit/version`.
  - **Done when:** `rg -n 'webFetchDerived' .bkit/src/bkit-modules.ts` shows it only inside the `postDispatch` closure; **`rg -n 'writeBkitVersion\(' .bkit/src/ --glob '!*.test.ts' --glob '!*.integration.test.ts'` returns exactly these four lines and no others** — `.bkit/src/bkit-version.ts` (the definition), `.bkit/src/bkit-modules.ts` (`postDispatch`), `.bkit/src/bkit-upgrade.ts` (`updateCanonicalHashesAfterUpgrade`) and `.bkit/src/bkit-upgrade.ts` (`migrateStrayGitattributes`), i.e. **three** call sites, not two, and this task adds none. **The v2 criterion said "exactly two writers" and was wrong against the tree** — the count also swept in ~25 test-side lines because it lacked the test globs, so it could neither pass as written nor surface the third site. Resolve each match by enclosing symbol, not by line number. `pnpm typecheck` passes.
- [ ] **Task 21 — Thread the upgrade write path.** `updateCanonicalHashesAfterUpgrade` (`.bkit/src/bkit-upgrade.ts:465` — a different file from `bkit-modules.ts`, so this anchor is unshifted) `options` gains `webFetchDerived?: readonly string[] | null`, fed from the enrich call at `.bkit/src/bkit-install.ts:2588` (also unshifted), applied to the `updated` literal only when non-null; the nothing-to-persist return at `:493` extends with `&& webFetchUnchanged`. **Do not edit `migrateStrayGitattributes`** — it is the third `writeBkitVersion` call site (`:547`), it already spreads `{ ...bkitVersion, canonicalHashes }`, and this task's job on it is to **prove** the field survives, not to change it. _(Owns matrix row **T17**.)_
  - **Done when: T17 passes in `.bkit/src/bkit-upgrade.integration.test.ts`, both halves.** (a) An upgrade whose only change is the derived set writes `.bkit/version` — i.e. `:493` no longer swallows it. (b) A `.bkit/version` payload carrying a non-empty `webFetchDerived`, driven through `migrateStrayGitattributes` on a tree with a stray dot-less `gitattributes` file (the only condition under which `:547` writes), reads back with `webFetchDerived` **intact**. (b) is a regression guard, not a fix: source read on 2026-08-26 confirms `:547` spreads, so it preserves the field today — but nothing asserted that, and "most likely preserves" is exactly what Phase 0 exists to eliminate. If (b) is ever red, that is a pre-existing clobbering defect: record it in `docs/failures.jsonl` and stop — do **not** widen this task to fix it. The `dryRun` return at `:469` is unchanged, and `migrateStrayGitattributes`' own `if (dryRun) return;` above `:547` is unchanged.
- [ ] **Task 22 — Empty the `WebFetch(domain:…)` seed from `.bkit/templates/.claude/settings.json:10-22`, and own the two uninstall tests that assert those literals.** Remove `:10` through `:22` only — `Skill(*)`, `Bash(*)`, the two `mcp__*` globs, `WebSearch`, `Bash(git push --force-with-lease:*)` and the two `Read(./**/.env.example)` entries all stay. **The v1 draft's assumption that no test asserts a `WebFetch(domain:…)` literal was wrong**; `.bkit/src/bkit-uninstall.test.ts` carries six, at `:680`, `:691`, `:692`, `:701`, `:737`, `:738`. Neither case may be edited, skipped or have an assertion deleted (`.agents/rules.md` § Fix code not gates). Verify each stays green and record **why**:
  - `:672-704` — `stripTier2JsonScope` unit case, builds its own synthetic template inline and never reads the real file. Unaffected by construction.
  - `:719-749` — `runUninstall` case, reads the **real** `.bkit/templates/.claude/settings.json` off disk (`:726-729`), appends `WebFetch(domain:github.com)` / `WebFetch(domain:npmjs.com)` to simulate enrich (`:735-739`), then asserts `expect(fileExists(".claude/settings.json")).toBe(false)` (`:747`) and `expect(template.permissions.allow).toContain("Bash(*)")` (`:748`). Both still hold: `bkit-uninstall.ts:589` recomputes `resolveNetworkAllowlist(ctx.cwd)` into template scope before `stripTier2JsonScope`, so both appended strings are still bkit-owned and the whole file is still stripped and deleted; and `Bash(*)` survives at `:6` of the template because this task removes only the WebFetch entries.
  - **Done when:** `rg -c 'WebFetch\(domain:' .bkit/templates/.claude/settings.json` returns 0; `rg -n '"Bash\(\*\)"' .bkit/templates/.claude/settings.json` still matches; the file is still valid JSON (`node -e "JSON.parse(require('fs').readFileSync('.bkit/templates/.claude/settings.json','utf8'))"`); `pnpm vitest run .bkit/src/bkit-uninstall.test.ts` is green with **both** named cases passing **unmodified** (`git diff -- .bkit/src/bkit-uninstall.test.ts` is empty); and the only remaining `WebFetch(domain:` matches under `.bkit/src/*.test.ts` / `*.integration.test.ts` are those six in `bkit-uninstall.test.ts` (`rg -c 'WebFetch\(domain:' .bkit/src/*.test.ts .bkit/src/*.integration.test.ts` returns exactly `.bkit/src/bkit-uninstall.test.ts:6` and nothing else). **That last clause is an AT-TASK-TIME check, not a standing invariant** — Task 23 (T8, T15) and Task 24 (T10) both add `WebFetch(domain:…)` literals to `bkit-modules.test.ts` and `bkit-install.integration.test.ts` later in this same phase, so from Task 23 onward the command legitimately returns more files. Its purpose is to prove _this_ task changed no test, and `git diff -- .bkit/src/bkit-uninstall.test.ts` being empty is the clause that carries that forward. A later re-verification pass must not read the extra files as a regression.
- [ ] **Task 23 — Implement the prune, the recording contract and the advisory in `enrichClaudeSettingsWebFetch`.** Resolve the function by **symbol name**, not by line number — Task 3 has already shifted every `bkit-modules.ts` anchor past `:1461` by ~57 lines. Signature becomes `(settingsDst, cwd, dryRun, ws, advisories) => readonly string[] | null`. **Restructure — do not extend — the `if (missing.length === 0) return;` no-op fast path.** Replace the additive-only JSDoc with the honest guarantee verbatim. Push a `webfetch-grants-pruned` finding whose `action` inlines the fix (no link to `docs/*.md`). _(Owns matrix rows **T8**, **T15**.)_
  - **🛑 The `ws.writes.push({ path: settingsDst, action: "write" })` must survive and must still fire under `dryRun`.** It sits **outside** `if (!dryRun)` today and that is the entire `bkit check` drift signal for `.claude/settings.json` — the thing that makes the CI drift gate exit non-zero when a consumer is missing a grant bkit would add. `if (dryRun) return null;` placed near the top of the function satisfies every other line of this task and **silently deletes that signal for every consumer, going green the whole way**. Returning `null` under `dryRun` is a statement about **provenance**, not about the write set: compute `add` / `remove`, push the write when either is non-empty, **then** return `null`.
  - **Done when:** T8 passes with one case per recording-contract row — absent file / unparseable JSON / non-array `allow` / `dryRun` each return `null` and leave the prior `webFetchDerived` **unchanged**; a steady-state no-op run returns `current`; `A \ B` grants are removed; a hand-added grant bkit never recorded survives; an absent `webFetchDerived` prunes nothing; a removal emits the advisory. **T15 passes**: under `dryRun` against a `.claude/settings.json` missing one derived grant, `ws.writes` gains exactly one `{ path: settingsDst, action: "write" }` while the return is still `null`; under `dryRun` against a file carrying a prunable recorded grant, likewise one write; against a file already equal to the derived set, zero writes. Reverting the `ws.writes` push makes T15 fail and T14 stay green (verify once, then restore) — that asymmetry is the whole reason T15 exists. `rg -n 'provably cannot delete' .bkit/src/` returns nothing.
- [ ] **Task 24 — Add the provenance-survives-a-real-install test.** Not a one-off probe: the clobbering writer is a fresh literal that any future field addition can silently re-break, which is exactly what Task 1 exists to catch once and this test exists to catch forever. Real `os.tmpdir()` consumer, spawned install, no `fs` mock. _(Owns matrix row **T10**.)_
  - **Done when:** T10 passes in `.bkit/src/bkit-install.integration.test.ts` — seed, real install, read back, `webFetchDerived` present, non-empty and equal to the resolved set; a second install with a shrunk `allowed-domains` updates it; reverting Task 20's `postDispatch` change makes T10 fail (verify once, then restore).
- [ ] **Task 25 — WS-5 docs, same commit.** Two files, and the decision on each is **named here rather than left to a reading**, because "reads correctly" is a human judgment with no mechanical check and `pnpm lint:prose` is already green on the untouched tree — a criterion built on those two alone is green before the task starts.
  - **`.bkit/workflows.md:1277` / `:1281` — KEEP, unedited.** Verified against source 2026-08-26: `:1277`'s `allow` row says "`WebFetch(domain:…)` per host in the network allowlist (apex + `*.` wildcard)" and `:1281` says network allowlisting for Claude is `WebFetch(domain:…)`-only while Cursor gates `curl`/`wget` in `guardrails.cjs` "(host-parsed, not substring-matched)". Both are worded against the **allowlist**, never against the template seed or a hook-embedded list, so emptying the seed and deleting `SHIPPED_NETWORK_BASES` leaves both true.
  - **`.bkit/README.md:270` — EDIT.** The `.cursor/allowlist.json` row reads "generated from tooling defaults + `.agents/context.md` allowed-domains", which names the hand-maintained model this change replaces. Restate as derived-registry ∪ consumer `allowed-domains`.
  - **`.bkit/README.md:370` — EDIT.** The `.bkit/providers.md` pointer reads "network allowlist encodings (`.cursor/allowlist.json` vs baked settings)". After Task 22 empties the template seed nothing is **baked** — `.claude/settings.json` grants are written by `enrichClaudeSettingsWebFetch` at install time. Restate to name the enriched settings surface.
  - **Done when:** `rg -n 'per host in the network allowlist' .bkit/workflows.md` still matches at the `allow` row and `rg -n 'template seed|baked settings|embedded in the hook' .bkit/workflows.md` returns nothing (the KEEP decision, asserted rather than assumed); `rg -n 'tooling defaults' .bkit/README.md` returns nothing and the `.cursor/allowlist.json` row names the derived registry; `rg -n 'baked settings' .bkit/README.md` returns nothing; `git diff --stat -- .bkit/README.md` is non-empty and `git diff --stat -- .bkit/workflows.md` is empty (the two decisions above, made visible in the diff); `pnpm lint:prose` and `pnpm format:check` pass.

### 🔒 Gate 2: Code Implementation Check _(sub-plan scope)_

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below. **DO NOT stop for user permission.** The plan-wide Gate 2, Gate 3 and Gate 4 — which assert across all 34 tasks in both directions — are executed once, in `381-provider-egress-domains-plan-5.md`.

- [ ] **No bolt-on / no gate-weakening:** no `as any` / `as unknown as` / `@ts-ignore` / `.skip` / empty `catch` / error-swallowing was introduced to make a gate pass. **`.bkit/src/bkit-uninstall.test.ts` is verified UNMODIFIED** — `git diff -- .bkit/src/bkit-uninstall.test.ts` is empty and both its `WebFetch(domain:…)` cases (`:672-704`, `:719-749`) pass. No `[NEW]` artifact.
- [ ] **Source-only edits:** `git diff --name-only` contains no path under `.claude/`, `.cursor/` or `.opencode/`. This sub-plan runs **no** `bkit install`.
- [ ] **Every matrix row this sub-plan owns is owned by exactly one task:** T8→Task 23, T10→Task 24, T15→Task 23, T16→Task 19, T17→Task 21. No orphan rows, no invented tests, and no row belonging to another sub-plan written here. **T14 is NOT written here** even though it shares a file with T17 — it is Task 28's, in `381-provider-egress-domains-plan-5.md`, and it asserts the opposite condition.
- [ ] **🛑 The `ws.writes` push still fires under `dryRun`.** Verified by T15 going red when the push is reverted and T14 staying green through the same revert — the asymmetry, observed once, then restored.
- [ ] **`.bkit/version` still has exactly three non-test `writeBkitVersion` call sites**, each of which either spreads the parsed payload or names every field explicitly. This sub-plan added none.
- [ ] **No `Done when` names a post-`:1461` `bkit-modules.ts` line range:** `enrichClaudeSettingsWebFetch` and its internals were resolved by symbol in Tasks 20 and 23.
- [ ] **Every `Done when` grep whose result changes later says so:** Task 22's `WebFetch(domain:` count is labelled AT-TASK-TIME, because Tasks 23 and 24 legitimately add more matches.
- [ ] **The honest guarantee is present verbatim** in both the code comment and the replacement JSDoc, and `rg -n 'provably cannot delete' .bkit/src/` returns nothing.
- [ ] **Gate 2 (sub-plan scope) - Verified.**

## Verification Plan

> [!IMPORTANT]
> **Advisory build-phase checks, NOT merge gates.** Only `Agent Execution Runbook` `Done when` lines gate the merge; nothing in this section does.

### Automated Tests

- [ ] **Unit (`.bkit/src/bkit-modules.test.ts`, `.bkit/src/bkit-version.test.ts`):** T8 prune round-trip and the seven recording-contract rows; T15 `ws.writes` under `dryRun` (drift signal preserved); **T16** the `webFetchDerived` parser default in `.bkit/src/bkit-version.test.ts` — asserted at **both** `parseBkitVersion` returns (`.bkit/src/bkit-version.ts:103`, `:112`), which are separate code paths.
- [ ] **Integration (`.bkit/src/bkit-install.integration.test.ts`):** T10 provenance survives a real install.
- [ ] **Integration (`.bkit/src/bkit-upgrade.integration.test.ts`):** **T17** — an upgrade whose only change is the derived set **does** write `.bkit/version`, plus the `migrateStrayGitattributes` (`.bkit/src/bkit-upgrade.ts:547`) round-trip keeping `webFetchDerived` intact. The same file also carries **T14** (0 writes on a clean tree), written by Task 28 in `381-provider-egress-domains-plan-5.md`; T14 and T17 assert opposite conditions on the same file by design and neither subsumes the other.
- [ ] **Tests touched without being broken:** `.bkit/src/bkit-uninstall.test.ts:672-704` and `:719-749` — the two cases that assert `WebFetch(domain:…)` literals against the seed Task 22 empties. Re-run them and leave them **byte-unmodified**; they survive only because `bkit-uninstall.ts:583-598` recomputes the derived set into template scope, and **if either goes red the correct response is to re-open that reasoning, never to edit the test**.
- [ ] **Build Configuration:** no new mock file and no new test config; `tsconfig.json` already excludes `**/*.test.ts` from `tsc --noEmit`, which is why adding a required `BkitVersion` field does not break the existing test-side object literals.
- [ ] **Run all tests:** `pnpm vitest run` **unscoped** (`.agents/rules.md` § Repo Authoring: "Verify before complete" means the full suite, never a scoped run) before handing over. A scoped run hides cross-file breakage, which is exactly how the uninstall cases would have gone unnoticed.

> [!IMPORTANT]
> **No Architectural Downgrades:** if a build, compiler or test error appears, never resolve it via a hot fix or an anti-pattern. In particular: do not add a `try`/`catch` to silence a URL-parsing edge (use `URL.canParse`), do not widen a denylist to make the gate pass (fix the row's `bases` and record a `reason`), do not `.skip` the parity or fan-out tests, do not edit or skip `.bkit/src/bkit-uninstall.test.ts` to make Task 22's grep green, and do not add `if (dryRun) return null;` above the `ws.writes` push to make the recording contract simpler. Halt if stuck.

### 🔒 Gate 4: Automated Verification Check _(sub-plan scope)_

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` the box below. **DO NOT stop for user permission.**

- [ ] **Gate 4 (sub-plan scope) - Verified:** every checkbox in Automated Tests independently verified and checked off, with explicit proof captured (test output, CLI exit codes, the on-disk `.bkit/version` of the scratch consumer used by T10). The full-suite Gate 4 for the whole change is run once in `381-provider-egress-domains-plan-5.md`.

### 👤 Manual Verification

> [!CAUTION]
> **Owner-run acceptance checks — advisory only.** Run during build wherever a CLI can. An unticked box blocks nothing.

> [!WARNING]
> **Dashboard Ban:** use local CLIs to verify rather than asking the user to check a dashboard. The box below needs no vendor dashboard; the two that do are in `381-provider-egress-domains-plan-5.md`.

- [ ] **Step 3 — Prune, observed end-to-end — and the asymmetry observed with it.** Add `sentry.io` to the scratch consumer's `allowed-domains`, install, confirm both `WebFetch(domain:sentry.io)` forms appear **and** that `.opencode/opencode.json` `permission.bash` gained `curl *sentry.io*` and `wget *sentry.io*`. Remove it, install again, confirm both `WebFetch` forms are gone, the console printed the removal, `.bkit/advisories.md` carries `webfetch-grants-pruned` naming the exact strings, and `git diff .claude/settings.json` shows the deleted lines. **Then confirm the two `permission.bash` keys are still there** — that is the documented, deferred asymmetry (`docs/deferrals.jsonl` key `381-opencode-bash-grants-never-revoked`), and observing it once is what stops it being rediscovered as a bug later.
