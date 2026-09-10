<!-- bkit:anchor
baseSha: 607d7507a76c8c10eb56135c328e3daec0ed6a69
baseRef: origin/dev
designPath: docs/plans/202607/381-provider-egress-domains-design.md
designBaseSha:
-->

# Provider cloud-egress derivation — Sub-Plan 2: WS-3 cloud paste surfaces

**Parent Plan:** [`plan-v4-split.md`](plan-v4-split.md)

> [!CAUTION]
> **CRITICAL:** Do not hallucinate plan execution state.
>
> 1. Read this sub-plan natively ONCE at session start. Do NOT re-read on every loop iteration.
> 2. NEVER trust session memory or previous conversation history.
> 3. Source of truth = literal `[x]` vs `[ ]` checkboxes in this document. `[ ]` = NOT DONE regardless of conversation context.

## Scope & Dependency Position

**This sub-plan covers Tasks 10–14:** Phase 3a / WS-3, the two cloud paste renderers, the allowlist fingerprint, the three re-anchored tests and the nine-file documentation sweep. Matrix rows owned: **T9, T12, T13**.

**Requires:** sub-plan 1 (`plan-v4-1.md`, Tasks 1–9) complete. Specifically, `BKIT_SHIPPED_NETWORK_DOMAINS` must already be the recomputed 15-base flatMap and `BKIT_SHIPPED_NETWORK_HOSTS` must already exist — Task 11 emits the latter verbatim and cannot be written before it does.

**Parallel-viable with:** sub-plan 3 (WS-4 Cursor hook) and sub-plan 4 (WS-5 prune). The three touch disjoint files except `.bkit/providers.md`, where each owns distinct, named line ranges — **this sub-plan owns `:279` only**; `:277` belongs to sub-plan 3 and `:256` / `:266` / `:270-275` to sub-plan 5. That is deliberate, not a conflict.

**Blocks:** sub-plan 5 (WS-6 + WS-7). Task 26's five-surface fan-out test and Task 33's Criterion-1 proof both read the paste fences this sub-plan produces.

**Nothing in this sub-plan touches `.bkit/src/bkit-modules.ts`,** so the Task 3 anchor-shift hazard does not bite here — but the standing rule is carried in full below because every line number in this document is a pre-Task-3 coordinate and a builder who later moves into `bkit-modules.ts` work must already know it.

## Context & Goals

bkit's network allowlist is fragmented across five encoding surfaces. The two cloud paste renderers read the **consumer's** `allowed-domains` alone (`renderCloudNetworkAllowlist` at `.bkit/src/bkit-cloud-env.ts:543-544`, `renderCursorNetworkAllowlist` at `:643-644`) while local host permissions merge the shipped defaults (`resolveNetworkAllowlist` at `:502-503`) — so a host bkit ships configuration for is reachable locally and unreachable from a cloud agent session. **That gap is the literal #381 defect and this sub-plan closes it.** Even a host that **is** on the shipped list never reaches the cloud dashboard paste today, so `--opencode=openrouter` in a cloud session is broken despite `openrouter.ai` sitting in the constant.

Sub-plan 1 built the derivation: one table of egress sources (`.bkit/src/bkit-registry.ts`), a proposer, a gate and two derived exports. This sub-plan fans that derivation out to the two cloud paste surfaces, adds an 8-hex fingerprint so a human can tell a stale paste from a fresh one, re-anchors the three tests that assert the retired behaviour, and rewrites the nine files whose prose becomes false the moment the renderers change.

> [!WARNING]
> **The parent design's ground truth drifted twice.** It was written 2026-07-29, amended 2026-08-03, re-checked 2026-08-24. Since that re-check, **#435 Phase 1** landed (`docs/decisions.jsonl` key `opencode-provider-allowlist-cut-to-four`) and moved the two facts the design's row table is built on. Every citation in this sub-plan was re-verified against the worktree on 2026-08-26; where it conflicts with the design or the re-check comment, **this plan is correct**. The two structural moves:
>
> 1. `OPENCODE_PROVIDER_DEFAULTS` (`.bkit/src/bkit-modules.ts:1461-1518`) is **4 keys**, not 10: `openrouter`, `ollama`, `opencode-zen`, `opencode-go`.
> 2. `BKIT_SHIPPED_NETWORK_DOMAINS` is **10 bases**, not 13: `nvidia.com` / `z.ai` / `moonshot.ai` / `kimi.com` removed, `openrouter.ai` added — in all five copies.
>
> Consequences: the registry is **13 rows**, not 20; the derived union is **15 bases**, not 19/20; two of the design's six named live gaps (`groq.com`, `cerebras.ai`) no longer exist and a third (`openrouter.ai`) is already shipped.
>
> **15 is the derived-union count everywhere in this plan.** It is today's 10 plus `githubcopilot.com`, `models.dev`, `npmjs.org`, `skills.sh`, `tavily.com`. `npmjs.org` is the fifteenth and exists only because Open Question 2 resolves to option A. Any "14" surviving anywhere in this document is a defect, not an alternative reading. In the Concrete Example below, **16** is 15 derived + 1 declared — not a competing union count.

**Related Issues:** #381 (parent), #394 (landed the apex + `*.` expansion and the three per-host encodings), #419 (the `context=web` debug-fetch block — wrote the local-vs-cloud split guidance into `.agents/config.md`, `.bkit/providers.md` and `docs/observability.md` that **this sub-plan makes false**), #435 (Phase 1 landed).

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

**This sub-plan is accountable for Criterion 1 (the paste-block half) and Criterion 5 (nine files).**

> [!IMPORTANT]
> **Ground-truth correction to Criterion 1, verified 2026-08-26 — human please confirm.** The design named six unreachable hosts: `groq.com`, `cerebras.ai`, `openrouter.ai`, `githubcopilot.com`, `models.dev`, `skills.sh`. After #435 Phase 1 the first two belong to providers that no longer exist and the third is already shipped (`.bkit/src/bkit-cloud-env.ts:480`). The live gap list this plan is accountable for is **four hosts**: `api.githubcopilot.com` (base `githubcopilot.com`), `models.dev`, `skills.sh`, `api.tavily.com` (base `tavily.com`). Criterion-1 wording is unchanged; only the enumerated host list is corrected.
>
> Criterion 3's "byte-equal-hash-gated" is restated as "hash-gated": `.cursor/hooks/guardrails.cjs` became `format: "markered-text"` in #422 (`.bkit/src/bkit-manifest.ts:554-559`). The **managed block** is still byte-equal (`bkit-manifest.ts:19`), so install-state-varying content there still breaks `bkit check` for every consumer. **Both `.claude/cloud.md` and `.cursor/cloud.md` are gitignored and untracked** — no manifest, no `canonicalHashes`, no hash gate — so this sub-plan's renderer output is not hash-gated at all.
>
> **Criterion 4's second clause is restated, because the plan cannot deliver it as inherited.** The deliverable clause is: **a grant bkit never recorded writing is never removed.** Criterion 4 is scoped to the Claude `WebFetch` surface and is delivered in `plan-v4-4.md`, not here.

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

_(Steps 1–4 are this sub-plan's; step 5's prune is `plan-v4-4.md`'s. Step 5's "the fingerprint is unchanged" clause **is** this sub-plan's — it is the property Task 12 delivers by hashing the derived set only.)_

### Edge Cases _(this sub-plan's share — cloud paste surfaces)_

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| _(design)_ Cloud allowlist is human-mediated; nothing detects a stale paste | 8-hex fingerprint as prose **after** the closing fence, hashed over the derived set only, paired with a symptom-first runbook sentence in both `cloud.md` templates. Detection itself stays deferred. |
| _(plan)_ Zero-declaration consumer moves from Trusted to the always-Custom block | The block MUST keep the Custom branch's `Also include default list of common package managers` tick instruction and its "this EXTENDS the trusted defaults …, it does not replace them" sentence verbatim (`.bkit/src/bkit-cloud-env.ts:556-559`). Without it, Custom **replaces** Trusted and the consumer loses PyPI, crates.io, the Go proxy and the cloud SDK hosts they reach today — a cloud-session breakage introduced by the change that exists to fix cloud-session breakage. The deleted Trusted branch (`:546-552`) does **not** contain that instruction, so "carry the existing pointer prose forward" is not sufficient. |

### Derived Test Matrix _(rows owned by this sub-plan)_

> Tiers per `docs/testing.md` § Tiers: bkit has **Unit** (`*.test.ts`) and **Integration** (`*.integration.test.ts`) only — no E2E project and no deployed boundary, so no `@live` row is available or appropriate. `docs/testing.md:323` forbids mocking `fs`.

<!-- prettier-ignore -->
| Test description | Type | Target file |
| --- | --- | --- |
| **T9** Fingerprint placement + stability: the fingerprint token appears **after** the closing fence and never between the fences in both `.claude/cloud.md` and `.cursor/cloud.md`; editing `allowed-domains` does not change it; changing the registry rows does | Unit (Vitest) | `.bkit/src/bkit-cloud-env.test.ts` |
| **T12** Both cloud renderers emit a paste fence with the shipped set when `allowed-domains` is empty — the retired zero-declared branches: no `"Set to **Trusted** (default)"` from `writeClaudeCloudDoc`, and the Cursor renderer now emits a fence where it previously asserted `not.toContain("\`\`\`")`. **Plus**: `toContain("Also include default list")` on **both** the zero-declared and the declared Claude render paths, so Custom can never be emitted without the extends-not-replaces tick instruction | Unit (Vitest) | `.bkit/src/bkit-cloud-env.test.ts` |
| **T13** Cursor cloud exact-host surface: `renderCursorNetworkAllowlist` emits `BKIT_SHIPPED_NETWORK_HOSTS` verbatim with **no** `*.` expansion, unioned with declared entries | Unit (Vitest) | `.bkit/src/bkit-cloud-env.test.ts` |

**Rows owned elsewhere, listed so this sub-plan does not invent them:** T1, T2, T3, T5, T7 (WS-1/WS-2, already landed) · T11 (WS-4) · T8, T10, T15, T16, T17 (WS-5) · T4, T6, T14 (WS-6/WS-7). `.bkit/src/bkit-cloud-env.test.ts` already carries T1, T2, T3, T5 and T7 from sub-plan 1; add T9, T12 and T13 to the same file, under the same **no `vi.mock` anywhere in the file** rule.

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

**Breaking file-structure and content changes owned by this sub-plan**

<!-- prettier-ignore -->
| Artifact | Change | Consumer-visible effect |
| --- | --- | --- |
| `.cursor/allowlist.json` | Content widens from 11 to 15 domains-with-wildcards on the bkit repo; full rewrite each install | Today's 11 = the 10 shipped bases ∪ `tavily.com`, which bkit dogfoods in its own `.agents/config.md:310`. After this change `tavily.com` is derived and **Task 14 drops the now-redundant declaration**, so the bkit repo lands on exactly the 15 derived bases. Manifest entry at `bkit-manifest.ts:574` is `format: "byte-equal-text"` with `generated: true`, so its hash lands in per-consumer `canonicalHashes` and varies per consumer by design. |
| `.claude/cloud.md`, `.cursor/cloud.md` | Always carry a paste fence; gain an 8-hex `Allowlist fingerprint: …` token in the italic line **after** the closing fence | Both files are gitignored and untracked — no manifest, no `canonicalHashes`, no hash gate. |

**Not breaking, stated to pre-empt the question:** no CLI flag, no config key, no `.agents/config.md` syntax and no public export is renamed or removed. `allowed-domains` keeps exactly its current meaning — consumer stack domains — and gains the rule that provider/tooling hosts must **not** be re-declared there. **That new rule is what Task 14 writes into `.agents/config.md` and its template twin.**

### 👤 ✅ Human Confirmation

- [ ] **Breaking Changes confirmed:** I have reviewed all breaking changes and naming decisions above.

> [!CAUTION]
> **Agent:** Do NOT pass Gate 1 until this checkbox is `[x]`. Summary must issue `REVISE` if unchecked.

---

## 👤 ⚠️ Open Questions & Assumptions — HUMAN REVIEW REQUIRED

> [!CAUTION]
> **🛑 HUMAN MUST READ AND CONFIRM THIS SECTION.**
> Unknowns needing a decision, and assumptions this sub-plan relies on.

**Open Questions**

- **Open Question 6:** Is there a practical upper bound on the Claude-web / Cursor "Allowed domains" dashboard field? → Unmeasured; 15 bases is 30 lines today.
  - **Options:** A — Ship and probe only if the fan-out grows past ~10x · B — Probe now by pasting a synthetic 200-line list into both dashboards before ship · C — Cap the emitted list and document truncation.
  - **Recommended:** A — 30 lines is far from any plausible cap, and B costs two live dashboard sessions to answer a question with no current consequence.
  - **Default if unanswered:** A.

**Assumptions carried in from sub-plan 1, restated because Task 14 depends on one of them**

- **Assumption:** The derived union (15 bases) is a strict **superset** of today's shipped 10, so no existing grant is lost. Verified base-by-base against `.bkit/src/bkit-cloud-env.ts:471-482`. → If a base were dropped instead, a consumer's already-pasted allowlist would silently narrow.
- **Assumption:** Every `.agents/config.md` / `docs/observability.md` edit inside a managed block lands in its `.bkit/templates/` twin in the same edit (`docs/knowledge.jsonl` key `managed-block-doc-edits-must-sync-template-or-bkit-check-drifts`). → If a twin is missed, `bkit check` drifts for every consumer. Task 14's `Done when` asserts twin identity above `<!-- bkit:end -->` for exactly this reason.

### 👤 ✅ Human Confirmation

- [ ] **Open Questions & Assumptions confirmed:** I have resolved or explicitly accepted every open question and assumption above.

> [!CAUTION]
> **Agent:** Do NOT pass Gate 1 until this checkbox is `[x]`. Summary must issue `REVISE` if unchecked.

---

## Out of Scope _(this sub-plan's share)_

<!-- prettier-ignore -->
| Excluded item | Why `Exempt` | Where it belongs |
| --- | --- | --- |
| Bootstrap-time cloud reachability probe / stale-paste detection | Genuinely additive: a new cloud-session capability, not a derivation change. This plan ships the fingerprint + runbook as the cheap half; detection needs the cloud bootstrap hook to echo and compare. | Already recorded — `docs/deferrals.jsonl` key `381-cloud-allowlist-staleness-detector`. No new row. |

> [!CAUTION]
> **Default = in-scope.** The row above is genuinely-additive: it is not required by a `Success Criteria` bullet, a `Derived Test Matrix` row, or an Architecture change in this sub-plan.

## Security & Privacy

> Reference: `docs/security.md`. Check all that apply; skip inapplicable rows.

- [ ] **New Secret/Env Var** — added to the env schema? → **N/A.** No new secret, no new env var, no new credential read. Reachability is not a credential: an egress allowlist gates which hosts a session may contact, not what it may authenticate as.
- [ ] **PII** — absent from logs? → **N/A for this sub-plan.** The renderers write to `.claude/cloud.md` and `.cursor/cloud.md`, both gitignored and untracked, and emit no log line. They do render the consumer's own `allowed-domains` entries into those local files, which is exactly what those files are for.
- [ ] **Egress widening** — bounded by a gate? → **Applies, and the gate is upstream.** The set these renderers emit is gate-checked at authoring time in the bkit repo: a base that is a multi-tenant apex, a multi-label public suffix, an IP literal, `localhost`, or has fewer than 2 labels fails the unit suite and never ships. This sub-plan adds no new base and no new host; it only changes which surfaces carry the already-gated set.

**One security-relevant property is created here and must not be lost:** the fingerprint is hashed over the **derived set only, never the consumer union**, so it changes at bkit-release cadence rather than on every `allowed-domains` edit. A fingerprint that churned on every consumer edit would train consumers to ignore it, which is the failure mode this token exists to prevent.

## 🚨 Pre-Flight / Dependencies 🚨

**CRITICAL:** Check off ALL core items. Check conditional items only when applicable. Abort if anything required is missing.

### Core _(always verify)_

- [ ] **Package Management:** No new runtime dependency. Confirm `pnpm install --frozen-lockfile` is clean and `pnpm-lock.yaml` is untouched by this change.
- [ ] **Dependency Versions:** `package.json:28-29` pins `engines.node >= 20`. Spot-check `node --version >= 20`, `npx tsc --version`, `pnpm --version` (pinned `pnpm@10.34.3`, `package.json:31`).
- [ ] **Existing-Solution Search (reuse over duplicate):** Done. `sha256` is already exported from `.bkit/src/bkit-version.ts:190` and is cycle-free from `bkit-cloud-env.ts` (`bkit-version.ts` imports only `node:fs`, `node:path`, `node:crypto` at `:29-31`), so the fingerprint needs **no second hasher and no `node:crypto` import**. `resolveNetworkAllowlist` (`:502-503`) already exists and already merges shipped defaults with `expandAllowedDomains(extractAllowedDomains(cwd))` — Task 10 switches the Claude renderer onto it rather than writing a new merge. **No `[NEW]` artifact in this sub-plan.**
- [ ] **User Context:** All files are in this worktree; no external credential or user-supplied value is needed.
- [ ] **Project Context:** `docs/decisions.jsonl` and `docs/knowledge.jsonl` read. Load-bearing entry for this sub-plan: knowledge key `managed-block-doc-edits-must-sync-template-or-bkit-check-drifts` — every `.agents/config.md` / `docs/observability.md` edit **above** `<!-- bkit:end -->` must land in the `.bkit/templates/` twin in the same edit. Also: `bkit install` flips `core.bare=true` (reset with `git config core.bare false`), though this sub-plan runs no install.
- [ ] **Testing & Quality:** Aligned with `docs/testing.md`. bkit has **Unit** and **Integration** only — no E2E project, no deployed boundary, no `@live` tier (`docs/testing.md:325-333`). `package.json:58` pins the unit-coverage lane to a literal brace list including `bkit-cloud-env` at `branches=70`, so all new branching in this sub-plan stays inside the measured file — which it does, because both renderers become **single-branch**.
- [ ] **Prerequisite Plans:** `plan-v4-1.md` (Tasks 1–9) must be complete. Verify concretely before starting: `rg -n 'BKIT_SHIPPED_NETWORK_HOSTS' .bkit/src/bkit-cloud-env.ts` matches an export, and `BKIT_SHIPPED_NETWORK_DOMAINS` is a computed flatMap rather than a hand-listed literal.

### Conditional _(verify only when applicable)_

- [ ] **Secrets & Env Vars:** N/A — no new API key, credential or env var.
- [ ] **Schema State:** N/A. This sub-plan touches no persisted schema; `.bkit/version` is `plan-v4-4.md`'s.
- [ ] **Architecture & UI:** No `[NEW]` file. `.bkit/src/bkit-cloud-env.ts` keeps its existing import set (`./bkit-manifest.js`, `./bkit-paths.js`, `./bkit-tokens.js` at `:17-19`) plus the leaf added in sub-plan 1, and gains a `sha256` import from `./bkit-version.js`. No UI.
- [ ] **Observability:** N/A — no new log point, no new advisory in this sub-plan.
- [ ] **Notifications:** N/A.

### Ground-truth citations this sub-plan depends on — re-verified in this worktree, 2026-08-26

> Every row below was read from source in this worktree on 2026-08-26. Where a cell disagrees with the parent design or the 2026-08-24 re-check comment, **this table is correct**. Do not copy the design's line numbers forward.

<!-- prettier-ignore -->
| Fact | **Now (verified 2026-08-26)** |
| --- | --- |
| `renderCloudNetworkAllowlist` | `.bkit/src/bkit-cloud-env.ts:543`; `declared` read `:544`; Trusted branch `:545-553`; Custom branch `:554-568`. Design cited `:546-557` |
| `renderCursorNetworkAllowlist` | `.bkit/src/bkit-cloud-env.ts:643`; `declared` read `:644`; zero-declared branch `:645-654` ("nothing extra is required here" at `:650`). Design cited `:646-669` |
| Claude cloud renderer branch prose | **Trusted branch `:546-552` carries NO tick instruction**; the "Also include default list of common package managers … EXTENDS the trusted defaults …, it does not replace them" sentence is in the **Custom** branch at `:556-559`. The entry-count sentence at `:563` reads `_${domains.length} entries — ${domains.length / 2} domain(s) from \`allowed-domains\`_` and attributes the whole list to the consumer. Not cited in the design or the re-check |
| `sha256` | `.bkit/src/bkit-version.ts:190`, exported, cycle-free from `bkit-cloud-env.ts` |
| Existing tests this change breaks | `.bkit/src/bkit-cloud-env.test.ts:326-331` (`"Set to **Trusted** (default)"`), `:399-403` (same + `"No \`allowed-domains\` block declared"`), and — not previously found — **`:478-483`**, the Cursor zero-declared case asserting `expect(out).not.toContain("\`\`\`")`, which flips when that branch retires |
| `.bkit/templates/.claude/cloud.md` sections | `## 2 · Network access` `:21`, token `@@CLOUD_NETWORK_ALLOWLIST@@` `:23`, `## 5 · Verify (first session)` `:87` |
| `.bkit/templates/.cursor/cloud.md` sections | `## 4 · Network access` `:67`, token `@@CURSOR_NETWORK@@` `:69`, `## 5 · Verify (first session)` `:71` |
| `.agents/config.md` § Cloud allowed domains | `:276` header, `:283` ("A `context=web` block's search host belongs here too … renders from THIS block alone"), example block `:287-298` (`tavily.com` `:292`), dogfood block `:307-312` (`tavily.com` `:310`); template twin identical at `.bkit/templates/.agents/config.md:276-298` |
| `docs/observability.md` § Debug Fetch | `:20` ✓ + template mirror `.bkit/templates/docs/observability.md` |
| `.bkit/cloud.md` Trusted guidance | `:113` (design cited `:109-111`) |
| `.bkit/providers.md` § Network allowlist | section header `:264`, encoding table `:270-275`, hook-fallback sentence `:277`, **cloud-egress-from-`allowed-domains` sentence `:279` — this sub-plan owns `:279` only** |
| `.cursor/allowlist.json` manifest entry | `bkit-manifest.ts:574` — it **IS** in the manifest, `format: "byte-equal-text"`, `generated: true`; hash lands in per-consumer `canonicalHashes`, so it still varies per consumer. Design said "not in any manifest" |
| Stale allowlist prose the v1 doc sweep missed | **`.bkit/templates/.agents/config.md:260`** (debug-fetch skip breadcrumb: "add tavily.com to the cloud Trusted-egress allowlist" — the exact re-declaration this sub-plan's new rule forbids) and **`:36`** ("host unreachable behind Trusted-egress"); **`.bkit/cloud.md:111`** ("`Custom` when repo declares `allowed-domains` block"); **`.bkit/workflows/bkit-debug.md:691`** ("Trusted egress may also silently block the host — see .agents/config.md § Cloud allowed domains"); **`.bkit/providers.md:256`** (host-capability table — owned by sub-plan 5, listed here so it is not double-edited). All carry `.agents/` twins where applicable |

### 🔒 Gate 1: Prerequisites Check _(sub-plan scope)_

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all applicable boxes above. **DO NOT stop for user permission.** Once saved, immediately proceed to `Architecture & Component Changes`. The plan-wide Gate 1 (the five prerequisite items covering package management, dependency versions, existing-solution search, user context and project context for the change as a whole) is executed once in `plan-v4-1.md`.

- [ ] **Acceptance Scenario confirmed:** Human confirmed `👤 Acceptance Scenario` section (checkbox is `[x]`). _(Unchecked → Summary must issue `REVISE`.)_
- [ ] **Breaking Changes confirmed:** Human confirmed `⚠️ Breaking Changes & Naming Review` section (checkbox is `[x]`).
- [ ] **Open Questions confirmed:** Human confirmed `👤 Open Questions & Assumptions` section (checkbox is `[x]`).
- [ ] **Predecessor landed:** `plan-v4-1.md` Tasks 1–9 all `[x]`, `BKIT_SHIPPED_NETWORK_HOSTS` exported, `BKIT_SHIPPED_NETWORK_DOMAINS` computed, `pnpm vitest run` green on the tree this sub-plan starts from.
- [ ] **Security & Privacy checked:** All applicable rows verified.
- [ ] **Gate 1 (sub-plan scope) - Verified.**

## Data Schema Integration

**No database, and no persisted schema in this sub-plan.** bkit ships no DB, no migration lane and no `docs/data-schema.md` rows. The `.bkit/version` envelope change belongs to WS-5 and is executed in `plan-v4-4.md`.

### Data Schema Usage (Inputs & Outputs)

- **Input (Read):** `.agents/config.md` `allowed-domains` block via `extractAllowedDomains`; `BKIT_SHIPPED_NETWORK_DOMAINS` and `BKIT_SHIPPED_NETWORK_HOSTS` (module-init constants).
- **Output (Write):** `.claude/cloud.md` and `.cursor/cloud.md` (untracked, regenerated every install).

### Data Schema Changes

**ADD:** none. **MODIFY:** none. **DELETE:** none.

## Architecture & Component Changes

**CRITICAL:** Prefer `[MODIFY]` over `[NEW]`. **CRITICAL:** never weaken a gate to pass — no `as any`, `@ts-ignore`, `.skip`, deleted assertions, empty `catch`, or mocking-away the unit under test. **CRITICAL:** `.agents/rules.md` § Repo Authoring — edit source only (`.bkit/src`, `.bkit/templates`, `.bkit/workflows`, `.bkit/prompts`, `.agents/`); **never** edit mirrors in `.claude/`, `.cursor/`, `.opencode/` directly, and batch `bkit install` mirror regeneration **once** at session end — which for this change is Task 32, in `plan-v4-5.md`, **not** here.

### Database Migrations

None. bkit ships no database and no migration lane.

### Cloud paste surfaces (WS-3)

#### [MODIFY] `.bkit/src/bkit-cloud-env.ts` — both renderers, fingerprint

- `renderCloudNetworkAllowlist` (`:543`): switch from `expandAllowedDomains(extractAllowedDomains(cwd))` to `resolveNetworkAllowlist(cwd)`. **This is the literal #381 defect.**
- **[DELETE] the Claude `declared.length === 0` "Trusted default" branch (`:545-553`)** — replaced by a single always-Custom block built from the **Custom** branch (`:555-568`), not from the Trusted one.
  - **The tick instruction is load-bearing and must survive verbatim.** `"Set to **Custom** and tick **Also include default list of common package managers** — this EXTENDS the trusted defaults (package registries, GitHub, cloud SDKs), it does not replace them."` (`:556-559`). The deleted Trusted branch does **not** contain it. Assemble the single branch from Trusted-branch prose alone and a zero-declaration consumer moves from Trusted (package registries + GitHub + cloud SDKs) to a 30-line Custom list **without** the checkbox and loses reach they have today — PyPI, crates.io, the Go proxy, the cloud SDK hosts. That is a new cloud-session breakage created by the change whose purpose is fixing cloud-session breakage, landing on the population least able to diagnose it. **T12 asserts `toContain("Also include default list")` on both render paths.**
  - The Trusted branch's `_No allowed-domains block declared …_` pointer prose (`:549-551`) is kept as the invitation to declare stack domains, appended **after** the paste block, reworded so it no longer promises a future Custom section that now always renders.
  - **The entry-count sentence at `:563` must be reworded in this same edit.** It reads ``_${domains.length} entries — ${domains.length / 2} domain(s) from `allowed-domains` in `.agents/config.md`, each as apex + `*.` wildcard._`` and would attribute all 30+ entries to the consumer's block. Split the attribution: derived-base count from `BKIT_SHIPPED_NETWORK_DOMAINS`, consumer-declared count from `extractAllowedDomains`.
- **[DELETE] the Cursor `declared.length === 0` branch (`:645-654`)** — "nothing extra is required here" becomes flatly false once shipped hosts always union in. `renderCursorNetworkAllowlist` unions `BKIT_SHIPPED_NETWORK_HOSTS` (exact hosts, **no `*.` expansion**) with the consumer's declared entries verbatim, preserving Cursor's deliberate no-wildcard policy. Both renderers end up single-branch.
- **Fingerprint:** 8 hex chars from the `sha256` already exported at `.bkit/src/bkit-version.ts:190` (cycle-free from here; no second hasher, no `node:crypto` import), hashed over the **derived set only, never the consumer union** — so it changes at bkit-release cadence rather than on every `allowed-domains` edit, which is what stops it training consumers to ignore it. Rendered as prose appended to the italic line that **follows the closing fence** in both renderers. Nothing inside the ` ```text ` fence changes, because the doc instructs the consumer to paste the fence content verbatim into a vendor "Allowed domains" field — a line inside it would be submitted as if it were a domain.
  - **"Derived set" = `BKIT_SHIPPED_NETWORK_DOMAINS` ∪ `BKIT_SHIPPED_NETWORK_HOSTS`, both sorted, not bases alone.** The Cursor renderer emits `BKIT_SHIPPED_NETWORK_HOSTS`, a different list from the bases the Claude renderer expands. Hash bases only and resolving Open Question 4 — or adding any `hosts` entry whose base already ships — changes the Cursor paste while leaving its fingerprint byte-identical, so the one surface with a human in the loop gets a "nothing changed" signal on a changed paste. Hashing the union costs nothing and preserves the property that matters: it is still invariant across `allowed-domains` edits. T9 asserts both halves.

### Cron Jobs & Scheduled Tasks

None.

## Supersession Inventory _(this sub-plan's share)_

<!-- prettier-ignore -->
| Existing artifact | Replaced by | Decision | Justification |
| --- | --- | --- | --- |
| Claude zero-declared "Trusted default" branch, `.bkit/src/bkit-cloud-env.ts:545-553` | Single always-Custom block from `resolveNetworkAllowlist`, assembled from the **Custom** branch (`:555-568`) — **keeping its `Also include default list of common package managers` / "EXTENDS, does not replace" instruction verbatim** — plus the deleted branch's `_No allowed-domains block declared …_` invitation moved below the fence | **DELETE** | Trusted covers package registries and GitHub, not `api.githubcopilot.com` / `api.tavily.com`; a zero-declaration consumer still needs Custom. Leaving it ships a documented falsehood. Dropping the tick instruction while retiring Trusted would **narrow** egress for exactly that consumer — Custom without the checkbox replaces the trusted defaults instead of extending them, costing them PyPI, crates.io, the Go proxy and the cloud SDK hosts. |
| Cursor zero-declared "nothing extra is required here" branch, `.bkit/src/bkit-cloud-env.ts:645-654` | Single always-emitted exact-host block from `BKIT_SHIPPED_NETWORK_HOSTS` | **DELETE** | Retiring only the Claude twin would ship the contradiction "why does Claude list hosts when Cursor says none are needed?". Both retire together. |
| `bkit-cloud-env.test.ts:326-331`, `:399-403`, `:478-483` assertions on the retired branches | Re-anchored assertions on the always-emitted paste block (**T12**) | **DELETE** the two `"Set to **Trusted** (default)"` assertions (`:329`, `:399-403`); **FLIP** `not.toContain("Also include default list")` at `:330` to `toContain`, and `not.toContain("\`\`\`")` at `:482` to a fence-present assertion. The three test **cases** are re-anchored, never removed | They assert the behaviour being retired; keeping them would freeze the bug as the expectation. `:330` in particular must flip rather than be dropped — carried forward as `not.toContain` it would freeze exactly the egress-narrowing regression Task 10 exists to prevent. Re-anchor rather than delete the cases, so the zero-declared path stays covered. |

> [!CAUTION]
> Each `DELETE` above is mirrored as a `[DELETE]` entry in `Architecture & Component Changes` and as a removal task in the runbook. No `RETAIN-WITH-REASON` rows: nothing here is an external contract or a staged rollout, and no `@deprecated`-but-still-exported resolution is accepted.

## Documentation Updates _(this sub-plan's share — all landed by Task 14, same commit)_

<!-- prettier-ignore -->
| Doc | Change required |
| --- | --- |
| `docs/observability.md` | **Two spots, not one.** (a) § Debug Fetch `:20` — the clause requiring the `context=web` search host in `allowed-domains` for cloud runs becomes false once WS-3 lands. **Delete, do not adapt.** Same edit in the template mirror `.bkit/templates/docs/observability.md`, which carries the identical sentence. (b) **`:149`** — the `debug-fetch` narration paragraph reads "a host blocked by the cloud Trusted-egress allowlist, `.agents/config.md` § Cloud allowed domains", pointing the reader at prose WS-3 deletes and naming Trusted as the gate. Re-point it at the derived allowlist and the `bkit install` + re-paste fix. **`:149` has NO template twin** — `.bkit/templates/docs/observability.md` is a stub carrying only § Debug Fetch, so this edit is single-file by design and a "sync the twin" check must not be asserted over it. |
| `.agents/config.md` | **Six spots, not four.** (a) § Cloud allowed domains `:283` — delete "A `context=web` block's search host belongs here too (Tavily example: `tavily.com`). Cloud Custom allowlist renders from THIS block alone — undeclared host → `HTTP 000` self-skip", replace with the rule that provider/tooling hosts are derived from bkit's registries and must **not** be re-declared here. (b) `:281` — the "Merges those **consumer** domains with stack-agnostic tooling defaults into host **local** permissions" sentence is the local-vs-cloud split WS-3 removes. (c) Drop the now-redundant `tavily.com` line from the example block (`:292`) and the dogfood block (`:310`). (d) **`:260` — the debug-fetch skip breadcrumb**, which today tells the consumer "000 = host unreachable (add `tavily.com` to the cloud Trusted-egress allowlist)". After WS-3 that instructs the consumer to perform exactly the re-declaration the new rule forbids, and it is the single most consumer-visible stale instruction this change creates. Replace with "000 = host unreachable; re-run `bkit install` and re-paste the cloud allowlist block". (e) **`:36`** — "host unreachable behind Trusted-egress — § Cloud allowed domains" → name the derived allowlist, not Trusted. (f) **`:391` — a SECOND copy of the `debug-fetch:tavily` skip breadcrumb, byte-identical in prose to `:260`.** It sits **below** `<!-- bkit:end -->` (`:300`), i.e. in bkit's own dogfood region, so it is **not** regenerated from the template and **has no twin** — the template carries only `:36`, `:260`, `:283`. Apply the same replacement as (d). Missing it leaves the exact instruction WS-3's new rule forbids live in bkit's own repo. Grep targets: `tavily`, `renders from THIS block alone`, `Trusted-egress`, `into host local permissions`. **All six spots share four alternation terms, so the sweep is one grep — but it must be run with `--hidden` (see Task 14).** |
| `.bkit/templates/.agents/config.md` | Same edits at **`:36`, `:260`, `:281`, `:283`, `:292` only — five spots, NOT six.** The template has no `:391` counterpart: the second breadcrumb copy is dogfood-only, below `bkit:end`, and adding it to the template would ship a duplicate into every consumer. The template twin is what ships into consumers, and a managed-block edit that misses the twin drifts `bkit check` (`docs/knowledge.jsonl` key `managed-block-doc-edits-must-sync-template-or-bkit-check-drifts`). **`rg` skips hidden directories by default and `.bkit/templates/.agents/` is one**, so any sweep that must reach this file needs `--hidden` or an explicit path — see Task 14. |
| `.bkit/workflows/bkit-debug.md` | `:691` — the SELF-SKIPPED narration cites "(Trusted egress may also silently block the host — see `.agents/config.md` § Cloud allowed domains)", pointing at prose WS-3 deletes. Re-point at the derived allowlist and the `bkit install` / re-paste fix. This is a mirror **source** (`.bkit/workflows/`), so the `.claude/` / `.cursor/` / `.opencode/` copies regenerate in Task 32 (`plan-v4-5.md`). |
| `.bkit/providers.md` | **Four distinct sections, three workstreams — deliberate, not a conflict.** (a) WS-4: `:277` "Missing file ⇒ guardrails falls back to tooling defaults embedded in the hook" becomes "missing file ⇒ ask on every `curl`/`wget`; re-run `bkit install`". (b) **WS-3 — this sub-plan's only `.bkit/providers.md` edit:** `:279` "the same `allowed-domains` also feed `.claude/cloud.md` / `.cursor/cloud.md`" becomes derived ∪ consumer, plus the triage-side note that the paste blocks carry an allowlist fingerprint and a "cloud agent can't reach host X" reporter should be asked for it. (c) WS-6: the § Network allowlist encoding table (`:270-275`) gains **two** statements — the OpenCode substring-glob weakness and the grant-lifecycle asymmetry. Also `:266` — "Source of truth (stack domains)" needs the derived-registry half stated. (d) WS-6: **`:256`**, the host-capability table's Network-fetch row — restate as derived-registry ∪ consumer. **ASCII operators only** (`!=`, `>=`, `<=`) in `.bkit/*.md`. |
| `.bkit/templates/.claude/cloud.md` | § 2 Network access (`:21-23`) and § 5 Verify (`:87`) gain the **symptom-first** runbook sentence: _"If a cloud session's model calls hang or time out with no network error, the dashboard allowlist is the first thing to check — a stale paste fails as an opaque timeout, not as a connection error. Re-run `bkit install` (or `bkit upgrade`) locally, compare the allowlist fingerprint printed below this block against the one in the copy you pasted into the dashboard, and re-paste the block if they differ."_ Verified: this file carries no troubleshooting or timeout prose today. |
| `.bkit/templates/.cursor/cloud.md` | § 4 Network access (`:67-69`) and § 5 Verify (`:71`) — same sentence, same reason. Verified: no troubleshooting or timeout prose today. |
| `.bkit/cloud.md` | **Two spots.** `:111` — "`Custom` when repo declares `allowed-domains` block" becomes false, because Custom is now always required; the rest of that paragraph (the tick instruction and the extends-not-replaces sentence) is correct and must be kept. `:113` — "No `allowed-domains` block → `Trusted` (default) enough — covers npm, GitHub Packages, vale tarball on `objects.githubusercontent.com`, Docker Hub, PyPI" is no longer true once provider/tooling hosts are in play. Rewrite both to name **Custom** as the unconditional instruction. |

## Rollback Strategy _(workstream scope)_

<!-- prettier-ignore -->
| Axis | Action | Notes |
| --- | --- | --- |
| **DB** | None — bkit ships no database and no migration lane. | n/a |
| **Code** | `git revert` this sub-plan's commits, then `pnpm build` and commit the regenerated `dist/`. The nine doc files revert with the same commit — they were changed in the same task as the code they describe, by design. | `pnpm bkit:check:dist` fails CI if `dist/` is not reverted alongside the source. |
| **Consumer state — dashboard paste** | A reverted allowlist is a **narrower** set than the pasted one, so a stale paste after rollback over-permits rather than under-permits — no cloud session breaks. No re-paste is required to roll back. | The fingerprint changes, so the next `cloud.md` read shows the mismatch. |
| **Consumer state — `.claude/cloud.md` / `.cursor/cloud.md`** | Both files are gitignored, untracked and fully regenerated on the next install. Nothing to clean up. |  |
| **Risk window** | None. There is no deploy and no schema migration. | Between merge and a consumer's next `bkit install` / `bkit upgrade`, consumers run entirely on the old behaviour. |

## Agent Execution Runbook

> [!IMPORTANT]
> **Continuous Execution:** Work runbook autonomously. No pause for user permission at any Gate. Check `[x]` tasks as you go.
> **Step Isolation:** Complete each task fully (verification + checkbox) before next task.
> **Integration Shape:** advisory only — delivering every task in ONE PR is always correct.

**Standing rules for every task below** (`.agents/rules.md` § Repo Authoring):

- **Edit source only** — `.bkit/src/`, `.bkit/templates/`, `.bkit/workflows/`, `.bkit/prompts/`, `.agents/`. **Never** edit `.claude/`, `.cursor/`, `.opencode/` mirrors directly. `.cursor/hooks/guardrails.cjs` is a mirror: edit the template, regenerate at the end.
- **Batch `bkit install` once, at session end** (Task 32, in `plan-v4-5.md`) — never per edit, and **never in this sub-plan**. Task 14 edits `.bkit/workflows/bkit-debug.md`, which is a mirror **source**; its `.claude/` / `.cursor/` / `.opencode/` copies regenerate there.
- **Docs change in the same task as the code they describe.** No doc-only follow-up task exists in this runbook by design — Task 14 is WS-3's docs and lands in the same commit as Tasks 10–13.
- **Add no new `try`/`catch` anywhere in this change** — a catch-with-default-return bumps `defensive.error-obscuring` and fails `slop:delta` on net score even at net-zero finding count. Use `URL.canParse`.
- **After any `bkit install` / `bkit upgrade` in this repo, run `git config core.bare false`** — install flips it.
- **🛑 Every `.bkit/src/bkit-modules.ts` line number in this plan is a PRE-Task-3 coordinate.** Task 3 (already landed, `plan-v4-1.md`) deleted `OPENCODE_PROVIDER_DEFAULTS` at `:1461-1518` — 58 lines — so every anchor **after** `:1461` has shifted by roughly 57 lines: `injectOpencodeNetworkCurlAllows` call sites `:1698` / `:1718` and definition `:1726-1734`, `enrichClaudeSettingsWebFetch` `:1751-1778`, its JSDoc `:1736-1750`, its early return `:1770` and its `ws.writes` push `:1775-1777`. Anchors **before** `:1461` are unaffected. **Resolve every post-`:1461` anchor by symbol name, never by line number.** No task in this sub-plan touches `bkit-modules.ts`, so the rule binds only if you stray outside scope — which is itself the signal to stop. All `.bkit/src/bkit-cloud-env.ts` anchors in this document are unaffected by Task 3, which edited a different file.
- **ASCII operators only** (`!=`, `>=`, `<=`) in `.bkit/*.md` — never Unicode `≠ ≥ ≤`.
- **Deferral rows are append-only.** `docs/deferrals.jsonl` carries 9 lines under 8 unique `381-*` keys; a state change is a same-`key` append (`.bkit/jsonl.md` § Updating a Row), never an edit to a prior line. This sub-plan appends none.

Task order is the design's dependency graph: **WS-1 → WS-2 → {WS-3, WS-4, WS-5} → WS-6 → WS-7**. This sub-plan is Phase 3a.

### Phase 3a — WS-3: cloud paste surfaces _(requires: WS-2)_

- [ ] **Task 10 — Switch `renderCloudNetworkAllowlist` to `resolveNetworkAllowlist` and delete the Claude "Trusted default" branch.** `.bkit/src/bkit-cloud-env.ts:543-568`; the `:545-553` branch goes. The single always-Custom block is assembled from the **Custom** branch (`:555-568`), **not** from the Trusted one, and three things are non-negotiable:
  1. **Keep verbatim** the tick instruction at `:556-559`: `"Set to **Custom** and tick **Also include default list of common package managers** — this EXTENDS the trusted defaults (package registries, GitHub, cloud SDKs), it does not replace them."` The deleted Trusted branch does not contain it; assembling the single branch from "the existing pointer prose" alone drops it, and a zero-declaration consumer then moves to a bare Custom list and **loses** PyPI, crates.io, the Go proxy and the cloud SDK hosts they reach today.
  2. **Carry forward** the Trusted branch's `_No allowed-domains block declared …_` invitation (`:549-551`), reworded so it no longer promises a Custom section that now always renders, placed **after** the paste block.
  3. **Reword the entry-count sentence at `:563`** — ``_${domains.length} entries — ${domains.length / 2} domain(s) from `allowed-domains` in `.agents/config.md`_`` attributes the whole 30+-entry list to the consumer's block. Split it: derived bases from `BKIT_SHIPPED_NETWORK_DOMAINS`, declared domains from `extractAllowedDomains`.
  - **Done when:** `rg -n 'Set to \*\*Trusted\*\* \(default\)' .bkit/src/bkit-cloud-env.ts` returns nothing; `rg -n 'Also include default list of common package' .bkit/src/bkit-cloud-env.ts` still matches, and the string is reachable on **both** render paths (no branch guards it); `renderCloudNetworkAllowlist` has no `declared.length === 0` branch; rendering against a tmp dir with no `.agents/config.md` emits a ` ```text ` fence containing `githubcopilot.com` **and** the text `Also include default list`; the count sentence names the derived and declared counts separately and never attributes derived entries to `allowed-domains`.
- [ ] **Task 11 — Rewrite `renderCursorNetworkAllowlist` to union `BKIT_SHIPPED_NETWORK_HOSTS` verbatim and delete its zero-declared branch.** `.bkit/src/bkit-cloud-env.ts:643-667`; `:645-654` goes. Exact hosts, **no `*.` expansion** — Cursor's deliberate no-wildcard policy. _(Owns matrix row **T13**.)_
  - **Done when:** `rg -n 'nothing extra is required here' .bkit/src/` returns nothing; T13 passes, asserting the output contains `api.githubcopilot.com` and `registry.npmjs.org` and does **not** contain `*.githubcopilot.com`.
- [ ] **Task 12 — Emit the 8-hex fingerprint as prose after the closing fence in both renderers.** `sha256` from `.bkit/src/bkit-version.ts:190`, truncated to 8 hex, hashed over the **derived set only, never the consumer union**. **"Derived set" = `BKIT_SHIPPED_NETWORK_DOMAINS` ∪ `BKIT_SHIPPED_NETWORK_HOSTS`, sorted — not bases alone**, because the Cursor renderer emits `BKIT_SHIPPED_NETWORK_HOSTS` and a bases-only hash leaves the Cursor fingerprint byte-identical across a changed Cursor paste (adding any `hosts` entry whose base already ships, e.g. resolving Open Question 4). Appended to the italic line that already follows the closing fence. Nothing inside the fence changes. _(Owns matrix row **T9**.)_
  - **Done when:** T9 passes, asserting the fingerprint token's index in the rendered string is **greater** than the index of the closing ` ``` ` in both `.claude/cloud.md` and `.cursor/cloud.md`; editing `allowed-domains` leaves the token byte-identical; changing a `BKIT_EGRESS_SOURCES` row's `bases` changes it; **and changing a row's `hosts` alone — without touching its `bases` — also changes it**.
- [ ] **Task 13 — Re-anchor the three existing tests this workstream breaks.** Per-case, verified against source on 2026-08-26:
  - **`:326-331`** (`"falls back to Trusted guidance when no allowed-domains are declared"`) has **two** assertions and **no** pointer-prose assertion: `toContain("Set to **Trusted** (default)")` at `:329` and `not.toContain("Also include default list")` at `:330`. The first is **deleted**; the second must **FLIP to `toContain`**, because the always-Custom block now carries the tick instruction on the zero-declared path too. Do not carry `not.toContain` forward — it would freeze exactly the regression Task 10 exists to prevent.
  - **`:399-403`** drops its `"Set to **Trusted** (default)"` assertion, keeps its pointer-prose assertion, and re-anchors on the always-Custom block. This is the only one of the three where "keep the pointer-prose one" applies.
  - **`:478-483`** (Cursor zero-declared) asserts `expect(out).not.toContain("\`\`\`")`at`:482`; it flips to asserting a fence **is** present with shipped hosts in it.
    _(Owns matrix row **T12**.)_
  - **Done when:** `pnpm vitest run .bkit/src/bkit-cloud-env.test.ts` is fully green with zero `.skip` and zero deleted test cases — all three cases still exist, re-anchored; `rg -n 'not\.toContain\("Also include default list"\)' .bkit/src/bkit-cloud-env.test.ts` returns nothing; T12 passes, including `toContain("Also include default list")` on both the zero-declared and the declared Claude render paths.
- [ ] **Task 14 — WS-3 docs, same commit. Nine files — and inside them, two spots the v2 draft missed.** `.bkit/templates/.claude/cloud.md` § 2 + § 5 and `.bkit/templates/.cursor/cloud.md` § 4 + § 5 gain the symptom-first runbook sentence (verbatim text in `Documentation Updates`). `.bkit/cloud.md` — **both** `:111` (the "`Custom` when repo declares `allowed-domains` block" condition) and `:113` (the "Trusted is enough" guidance); keep `:111`'s tick instruction and extends-not-replaces sentence, only the conditional goes. `.agents/config.md` `:36`, `:260`, `:281`, `:283`, `:292`, `:310`, **`:391`** — delete the `context=web`/`renders from THIS block alone`/local-only guidance, do not adapt it; drop the now-redundant `tavily.com` lines from the two `allowed-domains` blocks; **rewrite the debug-fetch skip breadcrumb at `:260`**, which currently tells the consumer to "add `tavily.com` to the cloud Trusted-egress allowlist" — the exact re-declaration WS-3's new rule forbids, and the most consumer-visible stale instruction this change creates; **and apply that same replacement again at `:391`, a SECOND byte-identical copy of that breadcrumb** living below `<!-- bkit:end -->` (`:300`) in bkit's own dogfood region. `.bkit/templates/.agents/config.md` gets the same edits at `:36`, `:260`, `:281`, `:283`, `:292` — **five spots, not seven: the template has no `:391` and no `:310` counterpart**, and adding one would ship a duplicate breadcrumb into every consumer. `.bkit/workflows/bkit-debug.md:691` — the SELF-SKIPPED narration's "(Trusted egress may also silently block the host — see `.agents/config.md` § Cloud allowed domains)" points at prose this task deletes; re-point it. `docs/observability.md` — **two spots**: `:20` (delete the cloud-declaration clause; the identical sentence in `.bkit/templates/docs/observability.md` goes with it) and **`:149`** (the `debug-fetch` narration's "a host blocked by the cloud Trusted-egress allowlist" — re-point at the derived allowlist; **`:149` has no template twin**, the template is a § Debug Fetch stub, so do not look for one). `.bkit/providers.md:279` — cloud egress is derived ∪ consumer, plus the fingerprint triage note. ASCII operators only in `.bkit/*.md`.
  - **Managed-block ordering, stated so the regeneration does not read as drift.** `.agents/config.md` `:36` / `:260` / `:281` / `:283` / `:292` are **above** `<!-- bkit:end -->` (`:300`) — inside the managed block. `:310` (dogfood `allowed-domains`) and `:391` (dogfood breadcrumb copy) are **below** it. Editing the managed half of the **runtime** copy is correct here **only because** the template twin is edited in the same task and Task 32's single `bkit install` regenerates the runtime copy from it. Hand-edit the runtime copy alone and `bkit check` drifts; skip the runtime copy and this task's own twin-identity clause fails (`docs/knowledge.jsonl` key `managed-block-doc-edits-must-sync-template-or-bkit-check-drifts`). Task 32's regeneration touching these lines is **expected output**, never a regression.
  - **Done when:** `rg -n --hidden --glob '!.git/' --glob '!docs/plans/**' 'renders from THIS block alone|into host local permissions|Trusted.*enough|Trusted-egress' .agents/ .bkit/ docs/` returns nothing. **Three things about that command are load-bearing and none may be dropped:**
    1. **`--glob '!docs/plans/**'` is mandatory** — this plan, `plan-input.md` and the parent design all quote those strings verbatim, and archived plan artifacts are never edited to satisfy a grep.
    2. **`--hidden --glob '!.git/'` is mandatory.** `rg` skips hidden directories by default, and `.bkit/templates/.agents/` is one — so without `--hidden` the sweep is **silently blind to the template twin**, which is the single file this task's twin-identity clause exists to protect. Verified 2026-08-26: without `--hidden` the command reports 6 matches; with it, 9.
    3. **The term is `into host local permissions`, not `LOCAL host permissions`.** Verified against source: `.agents/config.md:281` reads "Merges those **consumer** domains with stack-agnostic tooling defaults into host local permissions" — lowercase, unbolded. The v2 alternation's `LOCAL host permissions` matched **nothing**, so `:281` was named in the task and covered by no assertion.

    The complete owned match set this command must drive to zero, enumerated so reachability is checkable rather than assumed: `.agents/config.md` `:36`, `:260`, `:283`, **`:391`**; `.bkit/templates/.agents/config.md` `:36`, `:260`, `:283`; `.bkit/cloud.md:113`; **`docs/observability.md:149`**. Every one is owned by this task. If a match survives that is **not** on this list, the correct response is to give it an owner here — never to narrow the alternation, and never to edit an archived artifact.

    Plus: `rg -c '^tavily\.com$' .agents/config.md .bkit/templates/.agents/config.md` returns 0 for both — the `allowed-domains` declarations at `:292` / `:310` are gone (an exact-line anchor, because a bare `tavily` grep also hits the block markers, the `# Customise` comment, the `TAVILY_API_KEY` skip message and the `api.tavily.com` curl, none of which this task touches); `rg -n 'add tavily.com to the cloud' .agents/config.md .bkit/templates/.agents/config.md` returns nothing — **both** breadcrumb copies rewritten, `:260` and `:391`; `rg -n 'Trusted egress may also silently block' .bkit/workflows/bkit-debug.md` returns nothing; `rg -n 'hang or time out' .bkit/templates/.claude/cloud.md .bkit/templates/.cursor/cloud.md` matches both files; `.agents/config.md` and `.bkit/templates/.agents/config.md` are byte-identical across every edited line **above `<!-- bkit:end -->`** (managed-block twins; a missed twin drifts `bkit check`) — the below-`bkit:end` dogfood spots `:310` and `:391` have no twin and are excluded from that comparison by design; `pnpm lint:prose` and `pnpm format:check` pass.

### 🔒 Gate 2: Code Implementation Check _(sub-plan scope)_

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below. **DO NOT stop for user permission.** The plan-wide Gate 2, Gate 3 and Gate 4 — which assert across all 34 tasks in both directions — are executed once, in `plan-v4-5.md`.

- [ ] **No bolt-on / no gate-weakening:** no `as any` / `as unknown as` / `@ts-ignore` / `.skip` / empty `catch` / error-swallowing was introduced to make a gate pass. No `[NEW]` artifact in this sub-plan.
- [ ] **Source-only edits:** `git diff --name-only` contains no path under `.claude/`, `.cursor/` or `.opencode/`. This sub-plan runs **no** `bkit install`; the `.bkit/workflows/bkit-debug.md` mirrors regenerate in Task 32.
- [ ] **Every matrix row this sub-plan owns is owned by exactly one task:** T9→Task 12, T12→Task 13, T13→Task 11. No orphan rows, no invented tests, and no row belonging to another sub-plan written here.
- [ ] **No test case was deleted.** All three cases at `bkit-cloud-env.test.ts:326-331`, `:399-403` and `:478-483` still exist, re-anchored — not removed, not `.skip`ped.
- [ ] **Every `Done when` grep in this sub-plan that traverses a directory carries `--hidden --glob '!.git/'`, or names explicit file paths.** `rg` skips hidden directories by default and `.bkit/templates/.agents/` is one. Task 14's sweep carries both flags and its live match set is enumerated and owned.
- [ ] **No `Done when` grep matches this plan's own artifacts:** Task 14's sweep carries `--glob '!docs/plans/**'`. Archived plan artifacts are never edited to satisfy a grep.
- [ ] **Managed-block twins are byte-identical** above `<!-- bkit:end -->` for `.agents/config.md` and `docs/observability.md`; the two below-`bkit:end` dogfood spots (`.agents/config.md:310`, `:391`) are correctly excluded.
- [ ] **Gate 2 (sub-plan scope) - Verified.**

## Verification Plan

> [!IMPORTANT]
> **Advisory build-phase checks, NOT merge gates.** Only `Agent Execution Runbook` `Done when` lines gate the merge; nothing in this section does.

### Automated Tests

- [ ] **Unit (`.bkit/src/bkit-cloud-env.test.ts`):** T9 fingerprint placement + stability, T12 retired branches, T13 Cursor exact hosts. Data hygiene: all fixture rows are local constants; **no `vi.mock` anywhere in the file**. The file also carries T1, T2, T3, T5 and T7 from `plan-v4-1.md` — re-run all eight rows, not just the three added here.
- [ ] **Prose and format:** `pnpm lint:prose` and `pnpm format:check` pass over the nine doc files Task 14 touches.
- [ ] **Run all tests:** `pnpm vitest run` **unscoped** (`.agents/rules.md` § Repo Authoring: "Verify before complete" means the full suite, never a scoped run) before handing over. A scoped run hides cross-file breakage, which is exactly how the retired-branch assertions in other files would go unnoticed.

> [!IMPORTANT]
> **No Architectural Downgrades:** if a build, compiler or test error appears, never resolve it via a hot fix or an anti-pattern. In particular: do not add a `try`/`catch` to silence a URL-parsing edge (use `URL.canParse`), do not widen a denylist to make the gate pass (fix the row's `bases` and record a `reason`), do not `.skip` the parity or fan-out tests, do not edit or skip `.bkit/src/bkit-uninstall.test.ts` to make Task 22's grep green, and do not add `if (dryRun) return null;` above the `ws.writes` push to make the recording contract simpler. Halt if stuck.

### 🔒 Gate 4: Automated Verification Check _(sub-plan scope)_

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` the box below. **DO NOT stop for user permission.**

- [ ] **Gate 4 (sub-plan scope) - Verified:** every checkbox in Automated Tests independently verified and checked off, with explicit proof captured (test output, CLI exit codes, the rendered paste blocks). The full-suite Gate 4 for the whole change is run once in `plan-v4-5.md`.

### 👤 Manual Verification

> [!CAUTION]
> **Owner-run acceptance checks — advisory only.** Run during build wherever a CLI can. An unticked box blocks nothing.

> [!WARNING]
> **Dashboard Ban:** use local CLIs to verify rather than asking the user to check a dashboard. Neither box below needs a vendor dashboard; the two that do are in `plan-v4-5.md`.

- [ ] **Step 3b — Zero-declaration consumer still gets the package-manager tick.** In a scratch consumer with **no** `allowed-domains` block at all, open `.claude/cloud.md` § 2 and confirm the block says **Custom**, carries `Also include default list of common package managers`, and states that it EXTENDS rather than replaces the trusted defaults. Without that line the consumer loses PyPI, crates.io, the Go proxy and the cloud SDK hosts they reach on Trusted today.
- [ ] **Step 5 — Fingerprint is not pasteable.** Open the scratch consumer's `.claude/cloud.md` § 2 and `.cursor/cloud.md` § 4. Confirm the `Allowlist fingerprint: …` token sits in the italic line **after** the closing fence and that copying the fence content yields only domains.
