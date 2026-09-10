<!-- bkit:anchor
baseSha: 607d7507a76c8c10eb56135c328e3daec0ed6a69
baseRef: origin/dev
designPath: docs/plans/202607/381-provider-egress-domains-design.md
designBaseSha:
-->

# Provider cloud-egress derivation — Sub-Plan 3: WS-4 Cursor hook

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

**This sub-plan covers Tasks 15–18:** Phase 3b / WS-4 — deleting the hand-maintained `SHIPPED_NETWORK_BASES` array from the Cursor guardrails hook template, rewriting the now-false slop-scan exemption reason, deleting the cross-host parity assertion whose two halves this change removes, adding the hook's no-artifact negative case, and correcting `.bkit/providers.md:277`. Matrix row owned: **T11**.

**Requires:** sub-plan 1 (`381-provider-egress-domains-plan-1.md`, Tasks 1–9) complete. The hook's fallback list can only be deleted safely once `.cursor/allowlist.json` is written from the derived set — which is `writeNetworkAllowlistArtifact` picking up the recomputed `BKIT_SHIPPED_NETWORK_DOMAINS` for free.

**Parallel-viable with:** sub-plan 2 (WS-3 cloud paste) and sub-plan 4 (WS-5 prune). The three touch disjoint files except `.bkit/providers.md`, where each owns distinct, named line ranges — **this sub-plan owns `:277` only**; `:279` belongs to sub-plan 2 and `:256` / `:266` / `:270-275` to sub-plan 5. That is deliberate, not a conflict.

**Blocks:** sub-plan 5 (WS-6 + WS-7). Task 26's absence assertion and Task 27's second-list sweep both prove this sub-plan's deletion landed, and **T6 (template ↔ mirror byte parity) is written in Task 32, not here** — see the explicit note under Task 17.

> [!WARNING]
> **Nothing in this sub-plan touches `.bkit/src/bkit-modules.ts`,** so Task 3's anchor shift does not bite here. The standing rule is carried in full below anyway, because every `bkit-modules.ts` line number quoted anywhere in this plan family is a pre-Task-3 coordinate and straying into that file without knowing it is how a "verified" edit lands on the wrong function.

## Context & Goals

bkit's network allowlist is fragmented across five encoding surfaces and maintained by hand in two places that only a comment holds together. `BKIT_SHIPPED_NETWORK_DOMAINS` (`.bkit/src/bkit-cloud-env.ts:471-482`, 10 bases before sub-plan 1 recomputed it) is hand-typed and duplicated verbatim into `SHIPPED_NETWORK_BASES` (`.bkit/templates/.cursor/hooks/guardrails.cjs:115-126` **+ its `.cursor/` mirror**), with a third partial copy in `.bkit/templates/.claude/settings.json:10-22`. **This sub-plan removes the second copy outright.**

The hook already reads `.cursor/allowlist.json` at runtime and only falls back to the embedded array when that file is missing or corrupt. That fallback is the silent-drift vector: the array can rot against the constant it claims to mirror and nothing fails. Deleting it makes the degraded state **fail closed** — an ask on every parseable `curl`/`wget` URL — and makes the ask message the diagnostic.

> [!WARNING]
> **The parent design's ground truth drifted twice.** It was written 2026-07-29, amended 2026-08-03, re-checked 2026-08-24. Since that re-check, **#435 Phase 1** landed (`docs/decisions.jsonl` key `opencode-provider-allowlist-cut-to-four`). Every citation in this sub-plan was re-verified against the worktree on 2026-08-26; where it conflicts with the design or the re-check comment, **this plan is correct**. The two structural moves:
>
> 1. `OPENCODE_PROVIDER_DEFAULTS` (`.bkit/src/bkit-modules.ts:1461-1518`) is **4 keys**, not 10.
> 2. `BKIT_SHIPPED_NETWORK_DOMAINS` is **10 bases**, not 13: `nvidia.com` / `z.ai` / `moonshot.ai` / `kimi.com` removed, `openrouter.ai` added — in all five copies, **including the two `guardrails.cjs` copies this sub-plan deletes from**.
>
> Consequences: the registry is **13 rows**, not 20; the derived union is **15 bases**, not 19/20. **15 is the derived-union count everywhere in this plan** — today's 10 plus `githubcopilot.com`, `models.dev`, `npmjs.org`, `skills.sh`, `tavily.com`. Any "14" surviving anywhere in this document is a defect, not an alternative reading.

**Related Issues:** #381 (parent), #394 (established the fail-safe direction — "guessing here converts an ask into an allow" — and landed the host-parsed hook check), #422 (`564dfb53`, flipped `.cursor/hooks/guardrails.cjs` to `format: "markered-text"` and **added the `SHIPPED_NETWORK_BASES` ↔ `settings.json` WebFetch parity assertion that Task 17 deletes**), #435 (Phase 1 landed).

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

**This sub-plan is accountable for Criterion 2 (the "no other domain list exists in the repo" half — it deletes the second copy) and Criterion 5 (the hook's runtime-artifact dependency, written into `.bkit/providers.md:277`).**

> [!IMPORTANT]
> **Ground-truth correction to Criterion 1, verified 2026-08-26 — human please confirm.** The design named six unreachable hosts. After #435 Phase 1 the live gap list this plan is accountable for is **four hosts**: `api.githubcopilot.com` (base `githubcopilot.com`), `models.dev`, `skills.sh`, `api.tavily.com` (base `tavily.com`).
>
> **Criterion 3's "byte-equal-hash-gated" is restated as "hash-gated", and the restatement is this sub-plan's load-bearing constraint:** `.cursor/hooks/guardrails.cjs` became `format: "markered-text"` in #422 (`.bkit/src/bkit-manifest.ts:554-559`). The **managed block** is still byte-equal (`bkit-manifest.ts:19`) and `SHIPPED_NETWORK_BASES` sits at `guardrails.cjs:115`, **inside** the block (`// bkit:start` `:22` … `// bkit:end` `:258`), so install-state-varying content there still breaks `bkit check` for every consumer. The constraint holds; the "whole-file byte-equal" framing does not. This is why the answer is deletion, not codegen and not a reactive list.
>
> **Criterion 4** is scoped to the Claude `WebFetch` surface and is delivered in `381-provider-egress-domains-plan-4.md`, not here.

### Process Sketch _(inherited from design — plan may refine)_

- **WHEN** `bkit install` / `bkit upgrade` runs **→ THEN** one derived host set (all bkit registries + explicitly declared non-derivable hosts) unions with consumer `allowed-domains` and reaches all five encoding surfaces in the same pass.
- **WHEN** a provider or host source is added to `BKIT_EGRESS_SOURCES` **→ THEN** every surface carries it on the next install, and no second list is edited anywhere.
- **WHEN** a registry entry yields no usable host (loopback, IP literal, empty `baseURL`) **→ THEN** it contributes nothing unless it declares an explicit egress host with a recorded `reason`.
- **IF** a derived base is a multi-tenant apex or a multi-label public suffix **→ THEN** CI fails in the bkit repo and nothing ships.
- **IF** `.cursor/allowlist.json` is absent or corrupt **→ THEN** the Cursor hook asks on every outbound `curl`/`wget` and its message names `.cursor/allowlist.json` + `bkit install` as the fix.
- **IF** a host leaves the derived set or a consumer removes an `allowed-domains` entry **→ THEN** its `WebFetch(domain:…)` grant is removed only if bkit recorded writing it; unrecorded entries survive untouched.
- **IF** a cloud session's model calls hang with no network error **→ THEN** the operator compares the fingerprint printed after the paste fence against the dashboard copy and re-pastes.

### Concrete Example _(plan expands from design)_

**Setup:** A consumer repo with the GitHub tracker and the OpenRouter opencode provider installed, an `.agents/context.md` `allowed-domains` block declaring exactly `sentry.io`, and a Claude Code on the web environment whose network mode is **Trusted** (the current default guidance). Cloud `/bkit-debug` runs return no external evidence: the shipped `context=web` block prints `HTTP 000` and the GitHub MCP tracker cannot reach `api.githubcopilot.com`.

**Steps:**

1. Consumer runs `pnpm bkit install --claude --cursor --opencode=openrouter --tracker=github` → bkit derives 15 bases from `BKIT_EGRESS_SOURCES`, unions `sentry.io`, and writes all five surfaces in one pass.
2. Consumer opens `.claude/cloud.md` § 2 Network access → the doc says set **Custom** and tick **Also include default list of common package managers**, and the fenced block lists 32 lines — **15 derived bases + the 1 declared `sentry.io` = 16 bases, each as apex + `*.`**.
3. Consumer pastes the fence content verbatim into the Claude dashboard "Allowed domains" field and selects **Custom**.
4. Consumer runs cloud `/bkit-debug` → the `context=web` block returns search results instead of `HTTP 000`, and the GitHub tracker MCP connects.
5. Consumer later deletes `sentry.io` from `allowed-domains` and re-runs `pnpm bkit install` → the `WebFetch` grants are pruned with a durable record.

**Outcome:** One install, one paste. Every host bkit configured an agent to call is reachable from cloud, the consumer hand-declared none of them.

_(This sub-plan's slice of that example is step 1's "writes all five surfaces in one pass": the Cursor hook stops carrying its own list and reads `.cursor/allowlist.json`, written in the same `runCursorModule` pass.)_

### Edge Cases _(this sub-plan's share — the hook)_

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| _(design)_ `.cursor/allowlist.json` absent or corrupt, hook carries no fallback list | Hook asks on **every** parseable `curl`/`wget` URL including `github.com`; never allows. Ask message names `.cursor/allowlist.json` and `bkit install`. |

### Derived Test Matrix _(rows owned by this sub-plan)_

> Tiers per `docs/testing.md` § Tiers: bkit has **Unit** (`*.test.ts`) and **Integration** (`*.integration.test.ts`) only — no E2E project and no deployed boundary, so no `@live` row is available or appropriate. Rows that cross the real install boundary are Integration with no mocks at that boundary; `docs/testing.md:323` forbids mocking `fs`.

<!-- prettier-ignore -->
| Test description | Type | Target file |
| --- | --- | --- |
| **T11** Cursor hook with no `.cursor/allowlist.json` in `cwd` asks on `https://api.github.com/...` (the case the deleted fallback used to allow), and still asks on `curl https://evil.tld/?x=openrouter.ai` | Integration (Vitest) | `.bkit/src/bkit-guardrails-cursor.integration.test.ts` |

**T6 is NOT owned here.** It compares the template to the `.cursor/` mirror; Task 15 edits the template only and the single `bkit install` mirror regeneration is deferred to Task 32 in `381-provider-egress-domains-plan-5.md` — so between Task 15 and Task 32 the two files **necessarily differ** and T6 cannot be green at this point in the runbook no matter who writes it. Restated verbatim in Task 17, where a builder is most likely to reach for it.

**What T6 is, carried in full so this sub-plan does not have to guess what it is NOT writing** — this is a description of a row owned by `381-provider-egress-domains-plan-5.md`, deliberately kept out of the matrix table above so it cannot be mistaken for an owned row: _Hook byte parity: `.bkit/templates/.cursor/hooks/guardrails.cjs` byte-equal to `.cursor/hooks/guardrails.cjs`. **This test does NOT exist and must be written** — `.bkit/src/bkit-guardrails-cursor.integration.test.ts` carries exactly three `describe` blocks (`:28` shell, `:96` read, `:114` managed-block boundary) and references only the template (`:8`); the repo's only template↔mirror byte-parity test is `bkit-gateguard-dogfood.integration.test.ts:229`, which covers `gateguard.cjs`. **Owned by Task 32, in Phase 5, NOT by Task 17.** Integration (Vitest), `.bkit/src/bkit-guardrails-cursor.integration.test.ts` (new `describe`)._

**Rows owned elsewhere:** T1, T2, T3, T5, T7 (WS-1/WS-2) · T9, T12, T13 (WS-3) · T8, T10, T15, T16, T17 (WS-5) · T4, T6, T14 (WS-6/WS-7).

### 👤 ✅ Human Confirmation

- [ ] **Acceptance Scenario confirmed:** I have reviewed the Narrative, Success Criteria, Process Sketch, Concrete Example, Edge Cases, and Derived Test Matrix above. They correctly describe what "done" looks like.

> [!CAUTION]
> **Agent:** Do NOT pass Gate 1 until this checkbox is `[x]`. Summary must issue `REVISE` if unchecked.

---

## 👤 ⚠️ Breaking Changes & Naming Review — HUMAN REVIEW REQUIRED

> [!CAUTION]
> **🛑 HUMAN MUST READ AND CONFIRM THIS SECTION.**
> Review proposed names and breaking changes below.

**Breaking file-structure and content changes owned by this sub-plan**

<!-- prettier-ignore -->
| Artifact | Change | Consumer-visible effect |
| --- | --- | --- |
| `.cursor/hooks/guardrails.cjs` + its template twin | `SHIPPED_NETWORK_BASES` (`:115-126`) and its `keep in sync with …` comment **deleted**; `loadNetworkAllowlistBases()` starts from an empty `Set` | A consumer who deletes or gitignores `.cursor/allowlist.json` now gets an **ask** on every outbound `curl`/`wget`, including `github.com`. Fail-safe, but noisy, and reads as "bkit is broken" until they re-run `bkit install`. The ask message names the file and the command. |
| `.bkit/src/bkit-permissions-parity.integration.test.ts:173-191` | Whole `describe("cross-host gate parity — network allowlist")` block **deleted** | Both halves of its assertion are removed by this change (WS-4 deletes the array it regexes out of `guardrails.cjs`; WS-5 empties the `settings.json` side). T4 subsumes it properly, from a derived source. Without a named owner CI goes red mid-build. |

**No symbol is renamed.** `loadNetworkAllowlistBases`, `curlWgetHostAllowed`, `extractUrlHosts` and `hostMatchesBase` all keep their names and signatures; only the seed of the `Set` changes. No CLI flag, no config key, no public export is renamed or removed by this sub-plan.

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

- **Assumption:** The hook and `.cursor/allowlist.json` are written in the same pass — `runCursorModule` writes the hook at `.bkit/src/bkit-modules.ts:1309-1310` and the artifact at `:1396-1400`; upgrade writes the artifact at `.bkit/src/bkit-install.ts:2576` under the same cursor gate. → **If that pairing breaks, deleting the hook's fallback strands consumers asking on every `curl`.** This is the single assumption the whole workstream rests on. Both anchors are **before** `bkit-modules.ts:1461`, so Task 3's 58-line deletion does not shift them.

**Open Questions**

None specific to this sub-plan. Open Questions 1–5 shape the registry (`381-provider-egress-domains-plan-1.md`), 6 the dashboard field (`381-provider-egress-domains-plan-2.md`), 7 the OpenCode grant lifecycle (`381-provider-egress-domains-plan-5.md`).

### 👤 ✅ Human Confirmation

- [ ] **Open Questions & Assumptions confirmed:** I have resolved or explicitly accepted every open question and assumption above.

> [!CAUTION]
> **Agent:** Do NOT pass Gate 1 until this checkbox is `[x]`. Summary must issue `REVISE` if unchecked.

---

## Out of Scope _(this sub-plan's share)_

<!-- prettier-ignore -->
| Excluded item | Why `Exempt` | Where it belongs |
| --- | --- | --- |
| Ask-rate signal in the Cursor hook | Genuinely additive and declared out of scope by the design before work started: `guardrails.cjs` runs on every command in an editor session and its managed block is hash-gated, so adding output there is new runtime behaviour in a shipped, drift-gated hook — a different change with its own review surface. The degraded state is already self-diagnosing via the ask message naming `.cursor/allowlist.json` + `bkit install`. | Follow-up issue. Mirrored as `docs/deferrals.jsonl` key `381-cursor-hook-ask-rate-signal` (`reason: scope-declared`, referencing `docs/plans/202607/381-provider-egress-domains-design.md § Deferrals to record`). |

> [!CAUTION]
> **Default = in-scope.** The row above is genuinely-additive: it is not required by a `Success Criteria` bullet, a `Derived Test Matrix` row, or an Architecture change in this sub-plan.

## Security & Privacy

> Reference: `docs/security.md`. Check all that apply; skip inapplicable rows.

- [ ] **New Secret/Env Var** — added to the env schema? → **N/A.** No new secret, no new env var, no new credential read.
- [ ] **PII** — absent from logs? → **N/A for this sub-plan.** The hook's ask message names a file path and a command, nothing else.
- [ ] **Fail direction** — does the degraded state fail open or closed? → **Applies, and it is the point of the workstream.**

**Net security posture improves on the Cursor surface, within a stated bound:** deleting `SHIPPED_NETWORK_BASES` makes a missing or corrupt `.cursor/allowlist.json` fail **closed** (ask on everything) where today it fails to a hardcoded allow list. The bound: `hostMatchesBase` only ever runs for commands matching `\bcurl\b` / `\bwget\b`, so the improvement applies to `curl` / `wget` only. Every other network-capable command still reaches `allow()` at `guardrails.cjs:111` exactly as it does today — deleting the fallback neither improves nor regresses that, and this plan does not claim otherwise.

**One widening consequence lands on this surface and is disclosed rather than implied:** the derived set is five bases wider than today's shipped ten (`githubcopilot.com`, `models.dev`, `npmjs.org`, `skills.sh`, `tavily.com`), so each is one more `endsWith("." + base)` a lookalike host can aim at in the hook. Mitigated by the hook's label-boundary match and userinfo/port stripping (`guardrails.cjs:156-177`) — `github.com.attacker.io` and `https://github.com@evil.tld/x` both still ask. T11's second assertion (`curl https://evil.tld/?x=openrouter.ai` still asks) is the regression guard for exactly this.

## 🚨 Pre-Flight / Dependencies 🚨

**CRITICAL:** Check off ALL core items. Check conditional items only when applicable. Abort if anything required is missing.

### Core _(always verify)_

- [ ] **Package Management:** No new runtime dependency. Confirm `pnpm install --frozen-lockfile` is clean and `pnpm-lock.yaml` is untouched by this change.
- [ ] **Dependency Versions:** `package.json:28-29` pins `engines.node >= 20`. `guardrails.cjs` is a CommonJS hook run by Cursor, not by the bkit CLI — it gains no new syntax in this sub-plan, only a smaller `Set` seed. Spot-check `node --version >= 20`, `pnpm --version` (pinned `pnpm@10.34.3`, `package.json:31`).
- [ ] **Existing-Solution Search (reuse over duplicate):** Done. `loadNetworkAllowlistBases()` (`guardrails.cjs:128-147`) already reads `.cursor/allowlist.json`; `writeNetworkAllowlistArtifact` (`.bkit/src/bkit-cloud-env.ts:515-535`) already writes it from `resolveNetworkAllowlist`. **Nothing new is built here — a list is deleted and an existing read becomes the only source.** No `[NEW]` artifact.
- [ ] **User Context:** All files are in this worktree; no external credential or user-supplied value is needed.
- [ ] **Project Context:** `docs/decisions.jsonl` and `docs/knowledge.jsonl` read. Load-bearing entries: `bkit install` flips `core.bare=true` (reset with `git config core.bare false` after any dogfood install, though this sub-plan runs none); host-render mirrors are force-overwritten and are **not** drift-gated by `bkit check`, which is why editing the template and leaving the `.cursor/` mirror stale until Task 32 is correct rather than sloppy.
- [ ] **Testing & Quality:** Aligned with `docs/testing.md`. bkit has **Unit** and **Integration** only — no E2E project, no deployed boundary, no `@live` tier (`docs/testing.md:325-333`). `docs/testing.md:323` forbids mocking `fs`: T11 uses a real `os.tmpdir()` directory with no `.cursor/allowlist.json` in it.
- [ ] **Prerequisite Plans:** `381-provider-egress-domains-plan-1.md` (Tasks 1–9) must be complete. Verify concretely before starting: `BKIT_SHIPPED_NETWORK_DOMAINS` is a computed flatMap of the 15 derived bases rather than a hand-listed literal, so `.cursor/allowlist.json` will carry the derived set once regenerated.

### Conditional _(verify only when applicable)_

- [ ] **Secrets & Env Vars:** N/A — no new API key, credential or env var.
- [ ] **Schema State:** N/A. This sub-plan touches no persisted schema; `.bkit/version` is `381-provider-egress-domains-plan-4.md`'s.
- [ ] **Architecture & UI:** No `[NEW]` file. `guardrails.cjs` gains no import and loses one array. No UI.
- [ ] **Observability:** Applies narrowly — the hook's **ask message** (`guardrails.cjs:105-108`) becomes the diagnostic for the degraded state and must name both `.cursor/allowlist.json` and `bkit install`. No new log name is introduced, so `docs/observability.md` needs no row from this sub-plan.
- [ ] **Notifications:** N/A.

### Ground-truth citations this sub-plan depends on — re-verified in this worktree, 2026-08-26

> Every row below was read from source in this worktree on 2026-08-26. Where a cell disagrees with the parent design or the 2026-08-24 re-check comment, **this table is correct**. Do not copy the design's line numbers forward.

<!-- prettier-ignore -->
| Fact | **Now (verified 2026-08-26)** |
| --- | --- |
| `SHIPPED_NETWORK_BASES` | `guardrails.cjs:115-126`, **10 entries**, identical in `.bkit/templates/.cursor/hooks/guardrails.cjs` and `.cursor/hooks/guardrails.cjs`; `keep in sync with …` comment at `:114`. Design cited `:109-124`; the re-check cited `:115-129` |
| Hook managed-block bounds | **`// bkit:start` `:22` … `// bkit:end` `:258`** — `SHIPPED_NETWORK_BASES` at `:115` is **inside** |
| `loadNetworkAllowlistBases` | `:128-147`; empty catch at `:142-145`. Design cited `:126-145` |
| `curlWgetHostAllowed` | `:189-194`; `extractUrlHosts` `:156`, `hostMatchesBase` `:174`. Design cited `:154-192` |
| Hook manifest entry | `.bkit/src/bkit-manifest.ts:554-559`, **`format: "markered-text"`** + `noMarkerMigration`. Format semantics at `:19-20`: `markered-text` = marker-block extraction + **byte-equal on the block**. Design cited `bkit-manifest.ts:267`, `byte-equal-text` — wrong |
| `runCursorModule` hook + artifact same pass | **hook `.bkit/src/bkit-modules.ts:1309-1310`, artifact `:1396-1400`** — both **before** `:1461`, so unaffected by Task 3's shift. Upgrade-side artifact write `.bkit/src/bkit-install.ts:2576` |
| slop-scan exemptions | guardrails empty-catch `files` at `slop-scan.config.json:183`, `_reason` at **`:184`** — the prose Task 16 rewrites. (The other exemption, `networkAllowlistBases` `_reason` at `:166`, is not touched by this sub-plan) |
| Parity assertion to delete | **`.bkit/src/bkit-permissions-parity.integration.test.ts:173-191`** — whole `describe` block; `expect(block).not.toBeNull()` at `:177`. Design said "no test references it" — wrong |
| Cursor guardrails hook tests | **`.bkit/src/bkit-guardrails-cursor.integration.test.ts:44-92`** spawns the hook with `cwd` = repo root (the `run()` helper at `:15-18` passes **no** `cwd` option), so `.cursor/allowlist.json` (11 domains incl. `tavily.com`) supplies the `allow` — its `api.github.com` assertions **survive** this change but stop discriminating. WS-4 owes a no-artifact negative case (**T11**) |
| Cursor guardrails template↔mirror byte parity | **does not exist.** That file has three `describe` blocks (`:28`, `:96`, `:114`) and references only the template (`:8`). The repo's only template↔mirror byte-parity test is `bkit-gateguard-dogfood.integration.test.ts:229`, covering `gateguard.cjs`. **T6 is a NEW test, written in Task 32, not here** |
| `.bkit/providers.md` § Network allowlist | section header `:264`, encoding table `:270-275`, **hook-fallback sentence `:277` — this sub-plan owns `:277` only**, cloud-egress sentence `:279` (sub-plan 2), host-capability row `:256` and source-of-truth `:266` (sub-plan 5) |

### 🔒 Gate 1: Prerequisites Check _(sub-plan scope)_

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all applicable boxes above. **DO NOT stop for user permission.** Once saved, immediately proceed to `Architecture & Component Changes`. The plan-wide Gate 1 is executed once in `381-provider-egress-domains-plan-1.md`.

- [ ] **Acceptance Scenario confirmed:** Human confirmed `👤 Acceptance Scenario` section (checkbox is `[x]`).
- [ ] **Breaking Changes confirmed:** Human confirmed `⚠️ Breaking Changes & Naming Review` section (checkbox is `[x]`).
- [ ] **Open Questions confirmed:** Human confirmed `👤 Open Questions & Assumptions` section (checkbox is `[x]`).
- [ ] **Predecessor landed:** `381-provider-egress-domains-plan-1.md` Tasks 1–9 all `[x]`, `BKIT_SHIPPED_NETWORK_DOMAINS` computed, `pnpm vitest run` green on the tree this sub-plan starts from.
- [ ] **Same-pass assumption re-verified in source, not assumed:** `runCursorModule` writes the hook and `.cursor/allowlist.json` in one pass (`bkit-modules.ts:1309-1310` / `:1396-1400`) and the upgrade path writes the artifact under the same cursor gate (`bkit-install.ts:2576`). If either is no longer true, **stop** — deleting the fallback would strand consumers.
- [ ] **Security & Privacy checked:** All applicable rows verified.
- [ ] **Gate 1 (sub-plan scope) - Verified.**

## Data Schema Integration

**No database, and no persisted schema in this sub-plan.** bkit ships no DB, no migration lane and no `docs/data-schema.md` rows. The `.bkit/version` envelope change belongs to WS-5 and is executed in `381-provider-egress-domains-plan-4.md`.

### Data Schema Usage (Inputs & Outputs)

- **Input (Read):** `.cursor/allowlist.json` → `domains`, read by the hook at runtime. After this change it is the **only** source of bases the hook has.
- **Output (Write):** none. `.cursor/allowlist.json` is written by `writeNetworkAllowlistArtifact`, which this sub-plan does not edit.

### Data Schema Changes

**ADD:** none. **MODIFY:** none. **DELETE:** none.

## Architecture & Component Changes

**CRITICAL:** Prefer `[MODIFY]` over `[NEW]`. **CRITICAL:** never weaken a gate to pass — no `as any`, `@ts-ignore`, `.skip`, deleted assertions, empty `catch`, or mocking-away the unit under test. **CRITICAL:** `.agents/rules.md` § Repo Authoring — edit source only (`.bkit/src`, `.bkit/templates`, `.bkit/workflows`, `.bkit/prompts`, `.agents/`); **never** edit mirrors in `.claude/`, `.cursor/`, `.opencode/` directly, and batch `bkit install` mirror regeneration **once** at session end — which for this change is Task 32, in `381-provider-egress-domains-plan-5.md`, **not** here.

### Database Migrations

None. bkit ships no database and no migration lane.

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

### Cron Jobs & Scheduled Tasks

None.

## Supersession Inventory _(this sub-plan's share)_

<!-- prettier-ignore -->
| Existing artifact | Replaced by | Decision | Justification |
| --- | --- | --- | --- |
| `SHIPPED_NETWORK_BASES` array + `keep in sync with …` comment, `.bkit/templates/.cursor/hooks/guardrails.cjs:114-126` (and its `.cursor/` mirror) | `.cursor/allowlist.json`, read at runtime by `loadNetworkAllowlistBases()` | **DELETE** | Elimination beats automation — codegen would recreate the silent-drift vector this issue exists to remove. Same-pass write guarantee verified (`bkit-modules.ts:1309-1310` / `:1396-1400`; `bkit-install.ts:2576`); an empty set degrades to **ask**. |
| `describe("cross-host gate parity — network allowlist")`, `.bkit/src/bkit-permissions-parity.integration.test.ts:173-191` | **T4** fan-out parity, asserted across all five surfaces from the derived source after a real install (Task 26, `381-provider-egress-domains-plan-5.md`) | **DELETE** | Both halves of its assertion are removed by this change. T4 is a strictly stronger guard: five surfaces instead of two, derived source instead of two hand-typed literals, and it cannot be satisfied by a shared mistake. |

> [!CAUTION]
> Each `DELETE` above is mirrored as a `[DELETE]` entry in `Architecture & Component Changes` and as a removal task in the runbook. No `RETAIN-WITH-REASON` rows: nothing here is an external contract or a staged rollout.

## Documentation Updates _(this sub-plan's share — landed by Task 18, same commit)_

<!-- prettier-ignore -->
| Doc | Change required |
| --- | --- |
| `.bkit/providers.md` | **Four distinct sections, three workstreams — deliberate, not a conflict.** (a) **WS-4 — this sub-plan's only `.bkit/providers.md` edit:** `:277` "Missing file ⇒ guardrails falls back to tooling defaults embedded in the hook" becomes "missing file ⇒ ask on every `curl`/`wget`; re-run `bkit install`". (b) WS-3: `:279` becomes derived ∪ consumer plus the fingerprint triage note. (c) WS-6: the § Network allowlist encoding table (`:270-275`) gains the OpenCode substring-glob weakness **and** the grant-lifecycle asymmetry; `:266` gains the derived-registry half of "source of truth". (d) WS-6: `:256`, the host-capability table's Network-fetch row, restated as derived-registry ∪ consumer. **ASCII operators only** (`!=`, `>=`, `<=`) in `.bkit/*.md`. |
| `docs/testing.md` | The `bkit-permissions-parity.integration.test.ts` scope cell must stop claiming the network allowlist — it no longer asserts it, only the destructive-command and secret-read table. **This edit is owned by Task 29 in `381-provider-egress-domains-plan-5.md`**, batched with that file's other row (registering the new `bkit-cloud-env.integration.test.ts`), and is listed here so the deletion in Task 17 does not read as leaving a stale doc behind. |

## Rollback Strategy _(workstream scope)_

<!-- prettier-ignore -->
| Axis | Action | Notes |
| --- | --- | --- |
| **DB** | None — bkit ships no database and no migration lane. | n/a |
| **Code** | `git revert` this sub-plan's commits (template hook, `slop-scan.config.json`, the parity test file, `.bkit/providers.md`), then `pnpm build` and commit the regenerated `dist/`, then one `pnpm bkit install` to restore the `.cursor/hooks/guardrails.cjs` mirror. Finish with `git config core.bare false` — `bkit install` flips it. | The mirror is force-overwritten and untracked-by-drift, so a revert of the template alone leaves the mirror stale until an install runs. |
| **Consumer state** | A consumer already on the new hook who reverts gets the embedded fallback back on their next `bkit install`. Nothing is stranded: the artifact-reading path is unchanged and pre-dates this change. | The degraded state this change introduces (ask on every `curl`/`wget` with no artifact) disappears with the revert. |
| **Risk window** | None. There is no deploy and no schema migration. |  |

## Agent Execution Runbook

> [!IMPORTANT]
> **Continuous Execution:** Work runbook autonomously. No pause for user permission at any Gate. Check `[x]` tasks as you go.
> **Step Isolation:** Complete each task fully (verification + checkbox) before next task.
> **Integration Shape:** advisory only — delivering every task in ONE PR is always correct.

**Standing rules for every task below** (`.agents/rules.md` § Repo Authoring):

- **Edit source only** — `.bkit/src/`, `.bkit/templates/`, `.bkit/workflows/`, `.bkit/prompts/`, `.agents/`. **Never** edit `.claude/`, `.cursor/`, `.opencode/` mirrors directly. **`.cursor/hooks/guardrails.cjs` is a mirror: edit the template, regenerate at the end.** That rule is the whole reason T6 belongs to Task 32 and not to Task 17.
- **Batch `bkit install` once, at session end** (Task 32, in `381-provider-egress-domains-plan-5.md`) — never per edit, and **never in this sub-plan**.
- **Docs change in the same task as the code they describe.** No doc-only follow-up task exists in this runbook by design — Task 18 is WS-4's docs and lands in the same commit as Tasks 15–17.
- **Add no new `try`/`catch` anywhere in this change** — a catch-with-default-return bumps `defensive.error-obscuring` and fails `slop:delta` on net score even at net-zero finding count. Use `URL.canParse`. The hook's **existing** empty catch at `guardrails.cjs:142-145` is pre-existing and exempted at `slop-scan.config.json:183`; Task 16 rewrites its `_reason`, never the catch.
- **After any `bkit install` / `bkit upgrade` in this repo, run `git config core.bare false`** — install flips it.
- **🛑 Every `.bkit/src/bkit-modules.ts` line number in this plan is a PRE-Task-3 coordinate.** Task 3 (already landed, `381-provider-egress-domains-plan-1.md`) deleted `OPENCODE_PROVIDER_DEFAULTS` at `:1461-1518` — 58 lines — so every anchor **after** `:1461` has shifted by roughly 57 lines: `injectOpencodeNetworkCurlAllows` call sites `:1698` / `:1718` and definition `:1726-1734`, `enrichClaudeSettingsWebFetch` `:1751-1778`, its JSDoc `:1736-1750`, its early return `:1770` and its `ws.writes` push `:1775-1777`. Anchors **before** `:1461` — including this sub-plan's same-pass anchors `:1309-1310` and `:1396-1400` — are unaffected. **Resolve every post-`:1461` anchor by symbol name, never by line number.** No task here edits `bkit-modules.ts`; the rule binds only if you stray outside scope, which is itself the signal to stop.
- **ASCII operators only** (`!=`, `>=`, `<=`) in `.bkit/*.md` — never Unicode `≠ ≥ ≤`.
- **Deferral rows are append-only.** `docs/deferrals.jsonl` carries 9 lines under 8 unique `381-*` keys; a state change is a same-`key` append (`.bkit/jsonl.md` § Updating a Row), never an edit to a prior line. This sub-plan appends none — `381-cursor-hook-ask-rate-signal` already exists.

Task order is the design's dependency graph: **WS-1 → WS-2 → {WS-3, WS-4, WS-5} → WS-6 → WS-7**. This sub-plan is Phase 3b.

### Phase 3b — WS-4: Cursor hook _(requires: WS-2)_

- [x] **Task 15 — Delete `SHIPPED_NETWORK_BASES` and its `keep in sync with …` comment from `.bkit/templates/.cursor/hooks/guardrails.cjs:114-126`; make `loadNetworkAllowlistBases()` start from an empty `Set`.** Template **only** — the `.cursor/` copy is a mirror regenerated in Task 32. Update the ask message at `:105-108` to name `.cursor/allowlist.json` and `bkit install`. No two-entry safety floor.
  - **Done when:** `rg -n 'SHIPPED_NETWORK_BASES|keep in sync' .bkit/templates/.cursor/hooks/guardrails.cjs` returns nothing; `loadNetworkAllowlistBases` opens with `const bases = new Set();`; the ask string contains both `.cursor/allowlist.json` and `bkit install`.
- [x] **Task 16 — Rewrite the now-false `_reason` at `slop-scan.config.json:184`.** The exemption stays; its justification changes from "fail-OPEN … the shipped fallback is correct behaviour" to "must not crash the editor session; a corrupt or absent artifact degrades to **ask**".
  - **Done when:** `rg -n 'fail-OPEN' slop-scan.config.json` returns nothing; `pnpm lint:slop` runs and `pnpm slop:delta` reports zero net-new findings.
- [x] **Task 17 — Delete `.bkit/src/bkit-permissions-parity.integration.test.ts:173-191` and add the hook's no-artifact negative case.** Remove the whole `describe("cross-host gate parity — network allowlist")` block — both halves of its assertion are gone by design and T4 subsumes it. Then add T11 to `.bkit/src/bkit-guardrails-cursor.integration.test.ts`, spawning the hook with `cwd` set to a tmp dir containing **no** `.cursor/allowlist.json`. This matters because the existing assertions at `:44-92` spawn via a `run()` helper that passes **no** `cwd` option (`:15-18`), so cwd is the repo root, where `.cursor/allowlist.json` (git-tracked, matched by no rule in `.bkit/templates/gitignore`, so present in CI too) supplies the allow — they survive this change but stop discriminating. _(Owns matrix row **T11** only.)_
  - **T6 is NOT owned here.** It compares the template to the `.cursor/` mirror, Task 15 edits the template only, and the single `bkit install` mirror regeneration is deferred to Task 32 in Phase 5 — so between Task 15 and Task 32 the two files necessarily differ and T6 cannot be green at this point in the runbook no matter who writes it. T6 is written and asserted by **Task 32**.
  - **Done when:** `rg -n 'SHIPPED_NETWORK_BASES' .bkit/src/` returns nothing; T11 asserts `curl -s https://api.github.com/repos/x/y` returns `permission: "ask"` with no artifact in `cwd`, and `curl https://evil.tld/?x=openrouter.ai` still returns `"ask"`; `pnpm vitest run .bkit/src/bkit-permissions-parity.integration.test.ts .bkit/src/bkit-guardrails-cursor.integration.test.ts` is green.
- [x] **Task 18 — WS-4 docs, same commit.** `.bkit/providers.md:277` — "Missing file ⇒ guardrails falls back to tooling defaults embedded in the hook" becomes "Missing file ⇒ ask on every `curl`/`wget`; re-run `bkit install`".
  - **Done when:** `rg -n 'falls back to tooling defaults' .bkit/providers.md` returns nothing and the replacement sentence names `bkit install`; `pnpm lint:prose` passes.

### 🔒 Gate 2: Code Implementation Check _(sub-plan scope)_

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below. **DO NOT stop for user permission.** The plan-wide Gate 2, Gate 3 and Gate 4 — which assert across all 34 tasks in both directions — are executed once, in `381-provider-egress-domains-plan-5.md`.

- [ ] **No bolt-on / no gate-weakening:** no `as any` / `as unknown as` / `@ts-ignore` / `.skip` / empty `catch` / error-swallowing was introduced to make a gate pass. The parity block was **deleted with a named successor (T4)**, not skipped, and no assertion inside a surviving test was removed. No `[NEW]` artifact.
- [ ] **Source-only edits:** `git diff --name-only` contains no path under `.claude/`, `.cursor/` or `.opencode/`. Specifically, `.cursor/hooks/guardrails.cjs` is **untouched** by this sub-plan — it is a mirror and Task 32 regenerates it.
- [ ] **Every matrix row this sub-plan owns is owned by exactly one task:** T11→Task 17. **T6 is NOT written here** — verify no `describe` comparing the template to the mirror was added to `.bkit/src/bkit-guardrails-cursor.integration.test.ts`, because such a test cannot be green until Task 32 and its presence would either go red or be quietly weakened.
- [ ] **The same-pass guarantee is still true in source** after this deletion: `bkit-modules.ts:1309-1310` writes the hook and `:1396-1400` writes `.cursor/allowlist.json` in the same `runCursorModule` call; `bkit-install.ts:2576` writes the artifact on the upgrade path under the same cursor gate.
- [ ] **The exemption at `slop-scan.config.json:183-184` still covers the same file and the same rule** — only its `_reason` prose changed, and `pnpm slop:delta` reports zero net-new findings.
- [ ] **Gate 2 (sub-plan scope) - Verified.**

## Verification Plan

> [!IMPORTANT]
> **Advisory build-phase checks, NOT merge gates.** Only `Agent Execution Runbook` `Done when` lines gate the merge; nothing in this section does.

### Automated Tests

- [ ] **Integration (`.bkit/src/bkit-guardrails-cursor.integration.test.ts`):** T11 — hook asks on `api.github.com` with no artifact in `cwd`, and still asks on `curl https://evil.tld/?x=openrouter.ai`. **T6 (template ↔ mirror byte parity) is a new `describe` written in Phase 5 by Task 32, after the single `bkit install` regenerates the mirror — not here.**
- [ ] **Integration (`.bkit/src/bkit-permissions-parity.integration.test.ts`):** the file must still run green with its remaining `describe` blocks — the destructive-command and secret-read tables — after `:173-191` is removed. Re-run the file, do not assume the deletion was clean.
- [ ] **Slop:** `pnpm lint:slop` runs and `pnpm slop:delta` reports zero net-new findings after Task 16's `_reason` rewrite.
- [ ] **Prose:** `pnpm lint:prose` passes over `.bkit/providers.md`.
- [ ] **Run all tests:** `pnpm vitest run` **unscoped** (`.agents/rules.md` § Repo Authoring: "Verify before complete" means the full suite, never a scoped run) before handing over. A scoped run hides cross-file breakage — which is exactly how the parity assertion would have gone unnoticed in the first place.

> [!IMPORTANT]
> **No Architectural Downgrades:** if a build, compiler or test error appears, never resolve it via a hot fix or an anti-pattern. In particular: do not add a `try`/`catch` to silence a URL-parsing edge (use `URL.canParse`), do not widen a denylist to make the gate pass (fix the row's `bases` and record a `reason`), do not `.skip` the parity or fan-out tests, do not edit or skip `.bkit/src/bkit-uninstall.test.ts` to make Task 22's grep green, and do not add `if (dryRun) return null;` above the `ws.writes` push to make the recording contract simpler. Halt if stuck.

### 🔒 Gate 4: Automated Verification Check _(sub-plan scope)_

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` the box below. **DO NOT stop for user permission.**

- [ ] **Gate 4 (sub-plan scope) - Verified:** every checkbox in Automated Tests independently verified and checked off, with explicit proof captured (test output, CLI exit codes, the hook's actual JSON response in the no-artifact case). The full-suite Gate 4 for the whole change is run once in `381-provider-egress-domains-plan-5.md`.

### 👤 Manual Verification

> [!CAUTION]
> **Owner-run acceptance checks — advisory only.** Run during build wherever a CLI can. An unticked box blocks nothing.

> [!WARNING]
> **Dashboard Ban:** use local CLIs to verify rather than asking the user to check a dashboard. The box below needs no vendor dashboard; the two that do are in `381-provider-egress-domains-plan-5.md`.

- [ ] **Step 4 — Hook degrades to ask.** Delete `.cursor/allowlist.json` in the scratch consumer, then `echo '{"command":"curl -s https://api.github.com/repos/x/y"}' | node .cursor/hooks/guardrails.cjs`. Confirm `"permission":"ask"` and that the message names `.cursor/allowlist.json` and `bkit install`. Re-run install and confirm it flips back to `"allow"`. **This check needs a mirror that already carries the deletion, so run it after Task 32's `bkit install` — or against a scratch consumer installed from a built `dist/`.**
