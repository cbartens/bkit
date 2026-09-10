<!-- bkit:anchor
baseSha: 607d7507a76c8c10eb56135c328e3daec0ed6a69
baseRef: origin/dev
designPath: docs/plans/202607/381-provider-egress-domains-design.md
designBaseSha:
-->

# Provider cloud-egress derivation — Sub-Plan 5: WS-6 cross-surface fan-out and WS-7 release integration

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

**This sub-plan covers Tasks 26–34:** Phase 4 / WS-6 (five-surface fan-out proof, unchanged-code-path proof, dry-run rule, `.bkit/providers.md` disclosures) and Phase 5 / WS-7 (`dist/`, ledger verification, the single mirror regeneration + T6, Criterion-1 end-to-end proof, full local gate run). Matrix rows owned: **T4, T6, T14**.

**Requires: sub-plans 2, 3 AND 4 — all three.** This is not advisory sequencing:

- Task 26's five-surface fan-out asserts the cloud paste fence (sub-plan 2), `.cursor/allowlist.json`, `.claude/settings.json` `WebFetch` (sub-plan 4), the OpenCode `permission.bash` globs, **and** the absence of a domain array in the installed hook (sub-plan 3). Any missing workstream makes it red or, worse, vacuously green.
- Task 32's **T6 is only satisfiable here**: sub-plan 3's Task 15 edited `.bkit/templates/.cursor/hooks/guardrails.cjs` and deliberately left the `.cursor/` mirror stale, because the single `bkit install` is batched to this task. Between Task 15 and Task 32 the two files necessarily differ.
- Task 28's T14 needs the provenance field present, which is sub-plan 4's Task 19–21 work.

**Blocks:** nothing. This is the last sub-plan.

**This sub-plan carries the plan-wide gates.** Gate 2 (9 items), Gate 2's Mandatory Tasks (5 items), Gate 3 and Gate 4 assert across **all 34 tasks in both directions** and are therefore executed once, here. Sub-plans 1–4 carry only their own scoped variants.

> [!CAUTION]
> **🛑 If sub-plan 1's Phase 0 (Task 1) went RED, this sub-plan is re-scoped too.** Read the handover; do not infer. On the RED branch: **Task 28 / T14 still runs, minus the provenance clause** — assert `bkit check` reports 0 writes on a clean install and a clean upgrade with **no** `.bkit/version` `webFetchDerived` field in play. Tasks 19, 20, 21, 23 and 24 never ran, so rows T8, T10 and T15 do not exist and **Gate 2's matrix mapping must be checked against the reduced set, not the full one**. Task 33's PR body must name **Success Criterion 4 as NOT MET**. Everything else in this sub-plan runs unchanged.

> [!CAUTION]
> **🛑 ANCHOR-SHIFT HAZARD — this sub-plan carries post-`:1461` work.** Task 3 (landed in `381-provider-egress-domains-plan-1.md`) deleted `OPENCODE_PROVIDER_DEFAULTS` at `.bkit/src/bkit-modules.ts:1461-1518` — **58 lines** — so every anchor **after** `:1461` in this document has shifted by roughly **57 lines**: `injectOpencodeNetworkCurlAllows` call sites `:1698` / `:1718` and definition `:1726-1734`, `enrichClaudeSettingsWebFetch` `:1751-1778`. **Tasks 26 and 27 both operate on `injectOpencodeNetworkCurlAllows` and MUST resolve it by symbol name.** Task 27 in particular must not diff a `bkit-modules.ts` line range: the whole-file diff is large and the pre-Task-3 range `:1726-1734` now names different code, so a line-range check there can neither pass nor fail meaningfully.

## Context & Goals

bkit's network allowlist was fragmented across five encoding surfaces and maintained by hand in two places that only a comment held together. Sub-plans 1–4 built the derivation (`.bkit/src/bkit-registry.ts` + `deriveEgressEntries`), fanned it out to the cloud paste surfaces, deleted the Cursor hook's embedded copy, and added a `webFetchDerived` provenance record with a prune.

**This sub-plan proves the fan-out actually reached all five surfaces and ships the result.** Two of the five surfaces — `injectOpencodeNetworkCurlAllows` and `writeNetworkAllowlistArtifact` — were never edited: they already call `resolveNetworkAllowlist` and pick up the widened set for free. WS-6's job is to **prove that, not to edit them**, and to prove it in a way that cannot pass vacuously. WS-7 then builds `dist/`, verifies the ledgers, regenerates the mirrors **once**, writes the template↔mirror byte-parity test that only becomes satisfiable after that regeneration, confirms Success Criterion 1 against a real scratch consumer in the encoding each surface actually uses, and runs the full local gate set.

> [!WARNING]
> **The parent design's ground truth drifted twice.** It was written 2026-07-29, amended 2026-08-03, re-checked 2026-08-24. Since that re-check, **#435 Phase 1** landed (`docs/decisions.jsonl` key `opencode-provider-allowlist-cut-to-four`). Every citation in this sub-plan was re-verified against the worktree on 2026-08-26; where it conflicts with the design or the re-check comment, **this plan is correct**. The two structural moves:
>
> 1. `OPENCODE_PROVIDER_DEFAULTS` (`.bkit/src/bkit-modules.ts:1461-1518`) is **4 keys**, not 10 — the deletion that created the anchor shift above.
> 2. `BKIT_SHIPPED_NETWORK_DOMAINS` is **10 bases**, not 13: `nvidia.com` / `z.ai` / `moonshot.ai` / `kimi.com` removed, `openrouter.ai` added — in all five copies.
>
> Consequences carried into this sub-plan directly: the registry is **13 rows**, the derived union is **15 bases**, and **two of the design's six named live gaps (`groq.com`, `cerebras.ai`) no longer exist while a third (`openrouter.ai`) is already shipped — so Task 33 asserts FOUR hosts, not six.**
>
> **15 is the derived-union count everywhere in this plan.** It is today's 10 plus `githubcopilot.com`, `models.dev`, `npmjs.org`, `skills.sh`, `tavily.com`. `npmjs.org` is the fifteenth and exists only because Open Question 2 resolves to option A. **Task 32's `Done when` asserts exactly 15 bases + their `*.` forms = 30 entries in `.cursor/allowlist.json`; a builder who anchors on 14 fails it.** Any "14" surviving anywhere in this document is a defect, not an alternative reading.

**Related Issues:** #381 (parent), #394, #376, #419, #422 (added the parity assertion sub-plan 3 deleted and T4 subsumes), #435 (Phase 1 landed; **Open Question 5's sequencing choice is dispositioned in Task 33's PR body**).

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

**This sub-plan proves Criteria 1, 2 and 3 end-to-end and reports on 4.** Task 33 is the Criterion-1 gate; Task 26/27 are the Criterion-2 gates; Task 28 is the Criterion-3 gate; Criterion 4 is delivered in `381-provider-egress-domains-plan-4.md` and **reported** here (met, or NOT MET on Task 1's RED branch).

> [!IMPORTANT]
> **Ground-truth correction to Criterion 1, verified 2026-08-26 — human please confirm.** The design named six unreachable hosts: `groq.com`, `cerebras.ai`, `openrouter.ai`, `githubcopilot.com`, `models.dev`, `skills.sh`. After #435 Phase 1 the first two belong to providers that no longer exist and the third is already shipped (`.bkit/src/bkit-cloud-env.ts:480`). The live gap list this plan is accountable for is **four hosts**: `api.githubcopilot.com` (base `githubcopilot.com`), `models.dev`, `skills.sh`, `api.tavily.com` (base `tavily.com`). Criterion-1 wording is unchanged; only the enumerated host list is corrected. **Task 33 asserts the four.**
>
> Criterion 3's "byte-equal-hash-gated" is restated as "hash-gated": `.cursor/hooks/guardrails.cjs` became `format: "markered-text"` in #422 (`.bkit/src/bkit-manifest.ts:554-559`). The **managed block** is still byte-equal (`bkit-manifest.ts:19`), so install-state-varying content there still breaks `bkit check` for every consumer. The constraint holds; the "whole-file byte-equal" framing does not.
>
> **Criterion 4's second clause is restated, because the plan cannot deliver it as inherited.** The deliverable clause is: **a grant bkit never recorded writing is never removed.** A hand-added grant whose exact string was also in bkit's derived set at the moment of a previous recording run **is** prunable, is disclosed in the advisory `detect` text, and is recoverable by re-declaring the apex.
>
> **Criterion 4 is scoped to the Claude `WebFetch` surface only.** The OpenCode `permission.bash` `curl *{base}*` / `wget *{base}*` grants are never revoked on any path — see `Security & Privacy § Grant lifecycle asymmetry`. This change adds ten more such keys per consumer and does not close that gap; **Task 29 documents it and Task 33's PR body states it plainly.**

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
2. Consumer opens `.claude/cloud.md` § 2 Network access → the doc says set **Custom** and tick **Also include default list of common package managers** (which EXTENDS the trusted defaults rather than replacing them), and the fenced block lists 32 lines — **15 derived bases + the 1 declared `sentry.io` = 16 bases, each as apex + `*.`** — including `githubcopilot.com`, `models.dev`, `skills.sh`, `tavily.com` and `sentry.io`. The 16 here is 15 + 1, not a competing derived-union count.
3. Consumer pastes the fence content verbatim into the Claude dashboard "Allowed domains" field and selects **Custom**. The italic line _after_ the fence reads `… Allowlist fingerprint: a1b2c3d4.` and is not part of the paste.
4. Consumer runs cloud `/bkit-debug` → the `context=web` block returns search results instead of `HTTP 000`, and the GitHub tracker MCP connects.
5. Consumer later deletes `sentry.io` from `allowed-domains` and re-runs `pnpm bkit install` → console prints one removal line, `.bkit/advisories.md` carries a `webfetch-grants-pruned` finding, and `git diff .claude/settings.json` shows exactly those two lines deleted. The fingerprint is unchanged, so no re-paste is prompted.

**Outcome:** One install, one paste. Every host bkit configured an agent to call is reachable from cloud, the consumer hand-declared none of them, and removing their own declared domain actually revoked its grant with a durable record of what was revoked.

_(**This sub-plan is where the whole example is executed against a real scratch consumer** — Task 32 performs step 1, Manual Verification Steps 1, 2, 6 and 7 perform steps 2–4, and Task 33 asserts step 1's outcome surface by surface.)_

### Edge Cases _(this sub-plan's share — the cross-surface asymmetry)_

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| _(plan)_ Consumer drops a domain from `allowed-domains` on a repo with an OpenCode provider installed | The Claude `WebFetch` grants are pruned; the OpenCode `permission.bash` `curl *{base}*` / `wget *{base}*` keys are **not** — `injectOpencodeNetworkCurlAllows` (`.bkit/src/bkit-modules.ts:1726-1734`, **pre-Task-3 coordinate — resolve by symbol**) only assigns, never deletes, and the injected keys are absent from the rendered template so `stripTier2JsonScope` leaves them on uninstall too. A broader (shell) grant outlives the narrower (`WebFetch`) one this change revokes. Stated in `Security & Privacy` and `.bkit/providers.md`, deferred as `381-opencode-bash-grants-never-revoked`. |

### Derived Test Matrix _(rows owned by this sub-plan)_

> Tiers per `docs/testing.md` § Tiers: bkit has **Unit** (`*.test.ts`) and **Integration** (`*.integration.test.ts`) only — no E2E project and no deployed boundary, so no `@live` row is available or appropriate. Rows that cross the real install boundary (spawned `bkit`, real filesystem, real `.bkit/version` round-trip) are Integration with no mocks at that boundary; `docs/testing.md:323` forbids mocking `fs`.

<!-- prettier-ignore -->
| Test description | Type | Target file |
| --- | --- | --- |
| **T4** Fan-out parity after a real tmp-dir install: every base in `BKIT_SHIPPED_NETWORK_DOMAINS` present in the `.claude/cloud.md` paste fence, `.cursor/allowlist.json` `domains`, `.claude/settings.json` `WebFetch(domain:…)`, `.opencode/opencode.json` `permission.bash` `curl *…*` globs — **and** the installed `.cursor/hooks/guardrails.cjs` carries no domain array (absence assertion) | Integration (Vitest) | `.bkit/src/bkit-cloud-env.integration.test.ts` _(new)_ |
| **T6** Hook byte parity: `.bkit/templates/.cursor/hooks/guardrails.cjs` byte-equal to `.cursor/hooks/guardrails.cjs`. **This test does NOT exist and must be written** — `.bkit/src/bkit-guardrails-cursor.integration.test.ts` carries exactly three `describe` blocks (`:28` shell, `:96` read, `:114` managed-block boundary) and references only the template (`:8`); the repo's only template↔mirror byte-parity test is `bkit-gateguard-dogfood.integration.test.ts:229`, which covers `gateguard.cjs`. **Owned by Task 32, in Phase 5, NOT by Task 17** — Task 15 edits the template only and the single mirror regeneration is deferred to Task 32, so between Task 15 and Task 32 the two files necessarily differ and T6 cannot be green | Integration (Vitest) | `.bkit/src/bkit-guardrails-cursor.integration.test.ts` _(new `describe`)_ |
| **T14** `bkit check` reports 0 writes on a clean install and on a clean upgrade with the provenance field present — the dry-run rule, asserted against the real engine rather than by inspection | Integration (Vitest) | `.bkit/src/bkit-upgrade.integration.test.ts` |

**Rows owned elsewhere, listed so this sub-plan does not re-write them:** T1, T2, T3, T5, T7 (WS-1/WS-2, `381-provider-egress-domains-plan-1.md`) · T9, T12, T13 (WS-3, `381-provider-egress-domains-plan-2.md`) · T11 (WS-4, `381-provider-egress-domains-plan-3.md`) · T8, T10, T15, T16, T17 (WS-5, `381-provider-egress-domains-plan-4.md`). **T14 shares `bkit-upgrade.integration.test.ts` with T17 and asserts the opposite condition** — 0 writes on a clean tree, versus a required write when only the derived set changed. Neither subsumes the other.

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
| `dist/bkit-registry.js` | NEW build output, must be committed | `pnpm bkit:check:dist` (`package.json:61`) fails CI otherwise. |

**No symbol is added, renamed or removed by this sub-plan.** WS-6 edits **no code at all** — `injectOpencodeNetworkCurlAllows` and `writeNetworkAllowlistArtifact` are verification targets, not edit targets, and Task 27's whole job is to prove their bodies are byte-identical to their pre-change copies. WS-7 builds, verifies ledgers, regenerates mirrors and runs gates.

### 👤 ✅ Human Confirmation

- [ ] **Breaking Changes confirmed:** I have reviewed all breaking changes and naming decisions above.

> [!CAUTION]
> **Agent:** Do NOT pass Gate 1 until this checkbox is `[x]`. Summary must issue `REVISE` if unchecked.

---

## 👤 ⚠️ Open Questions & Assumptions — HUMAN REVIEW REQUIRED

> [!CAUTION]
> **🛑 HUMAN MUST READ AND CONFIRM THIS SECTION.**
> Unknowns needing a decision, and assumptions this sub-plan relies on. **Task 33 dispositions all seven Open Questions in the PR body**, so this section is the checklist that task works from.

**Open Questions**

- **Open Question 7:** How is the OpenCode `permission.bash` grant lifecycle closed — WS-5's prune extended to it, or disclosed and deferred? → Decided in this plan as **B**; recorded here because it is a knowing acceptance the human is entitled to overturn. `injectOpencodeNetworkCurlAllows` (`.bkit/src/bkit-modules.ts:1726-1734`, **resolve by symbol**) only ever assigns `bash["curl *{base}*"] = "allow"` and `bash["wget *{base}*"] = "allow"`; nothing deletes them, on install, upgrade **or** uninstall, and this change adds ten more keys per consumer.
  - **Options:** A — Extend the prune to the OpenCode surface now; `previous \ current` maps cleanly onto the two glob keys, but it needs a second provenance record (`.opencode/opencode.json` has no `webFetchDerived` analogue) and a second recording contract on a surface with no rewrite path · B — Disclose the asymmetry in `Security & Privacy` and `.bkit/providers.md` in the same commit, and append `docs/deferrals.jsonl` key `381-opencode-bash-grants-never-revoked` · C — Say nothing; the existing `381-opencode-curl-glob-substring-bypass` row covers the glob **shape**.
  - **Recommended:** B — A is a second provenance mechanism on a second file with its own uninstall interaction; that is the same class of change as WS-5 on a different surface, so it is plan-sized, not a task. C is the one option that is not available: WS-6's "unchanged code path, prove it, do not edit it" currently reads as a considered decision when the question was never asked, and a _shell_ egress grant outliving the narrower `WebFetch` grant this plan takes such care to revoke is exactly the kind of thing a reader must not have to discover from source.
  - **Default if unanswered:** B.

**Open Questions 1–6, carried here because Task 33 must disposition all seven in the PR body:** OQ1 `kimi-docs` row (default A — drop the row and the `docs` kind) · OQ2 `pkg-npm` declaration (default A — `bases: ["npmjs.com", "npmjs.org"]` + `reason`) · OQ3 `models.dev` on the gateway rows (default A — keep pending verification; **settle by running an `opencode-zen` session with the host blocked if one is cheap to run**) · OQ4 `console.anthropic.com` / `api.cursor.com` as `hosts` (default A — declare both) · OQ5 sequencing versus #435 Phase 2 (default A — land this first) · OQ6 dashboard field upper bound (default A — ship and probe only if the fan-out grows past ~10x). Their full option sets and rationales are in `381-provider-egress-domains-plan-1.md` (OQ1–5) and `381-provider-egress-domains-plan-2.md` (OQ6); Task 33 needs the **disposition**, not a re-litigation.

**Assumptions**

- **Assumption:** `injectOpencodeNetworkCurlAllows` and `writeNetworkAllowlistArtifact` pick up the widened derived set for free because both already call `resolveNetworkAllowlist` and this change does not alter its signature. → If either were edited, Task 27's byte-identity proof fails and the "unchanged code path" claim in `.bkit/providers.md` becomes false.
- **Assumption:** The `.opencode/opencode.json` `permission.bash` map only exists when an opencode provider is installed. → This is why Task 26's install flags **must** include `--opencode=openrouter`; without it T4 silently skips the OpenCode surface and passes vacuously.

### 👤 ✅ Human Confirmation

- [ ] **Open Questions & Assumptions confirmed:** I have resolved or explicitly accepted every open question and assumption above.

> [!CAUTION]
> **Agent:** Do NOT pass Gate 1 until this checkbox is `[x]`. Summary must issue `REVISE` if unchecked.

---

## Out of Scope _(this sub-plan's share, plus the plan-wide ledger accounting)_

<!-- prettier-ignore -->
| Excluded item | Why `Exempt` | Where it belongs |
| --- | --- | --- |
| OpenCode `permission.bash` grants are never revoked, on any verb | Genuinely additive and knowingly accepted (Open Question 7 = B). `injectOpencodeNetworkCurlAllows` (`.bkit/src/bkit-modules.ts:1726-1734`) only assigns; the injected keys are absent from the rendered template so `stripTier2JsonScope` leaves them on uninstall too. Closing it needs a second provenance record on `.opencode/opencode.json` and a second recording contract — plan-sized, not a task, and it is the same shape as WS-5 on a surface with no rewrite path. This plan **states** the asymmetry in `Security & Privacy` and in `.bkit/providers.md` in the same commit rather than implying revocation parity. | Follow-up issue. NEW `docs/deferrals.jsonl` key `381-opencode-bash-grants-never-revoked` (`reason: own-cycle`). Distinct from `381-opencode-curl-glob-substring-bypass`, which covers the glob **shape**, not the **lifecycle**. |
| A stricter OpenCode encoding than `curl *{base}*` | Genuinely additive and hard-bounded by OpenCode's permission schema — no URL-host primitive exists to switch to. WS-6 **documents** the weakness rather than implying it. | Already recorded — `docs/deferrals.jsonl` key `381-opencode-curl-glob-substring-bypass`. No new row. |
| A unified runtime allowlist artifact read by all three IDE surfaces | Genuinely additive and blocked by Claude `permissions.allow` / OpenCode `permission.bash` requiring literal per-host strings. | Already recorded — `docs/deferrals.jsonl` key `381-unified-runtime-allowlist-artifact-all-hosts`. No new row. |

> [!CAUTION]
> **Default = in-scope.** Every row above is genuinely-additive: none is required by a `Success Criteria` bullet, a `Derived Test Matrix` row, or an Architecture change in this plan. **Ledger accounting for the whole change, which Task 31 verifies: 9 lines** match `"key":"381-` in `docs/deferrals.jsonl`, across **8 unique keys** — four recorded in the design phase, three appended by plan-generate, one NEW (`381-opencode-bash-grants-never-revoked`), plus one same-`key` correction line for `381-webfetch-grants-survive-uninstall-after-seed-emptied`. Never edit or delete a prior line (`.bkit/jsonl.md` § Updating a Row); never duplicate an unchanged row (§ Identity / Dedup). The other five `381-*` rows belong to sub-plans 1–4 and are already on disk: `381-provider-registry-key-mirror-consolidation`, `381-cloud-allowlist-staleness-detector`, `381-cursor-hook-ask-rate-signal`, `381-upgrade-does-not-write-advisories-artifact`, `381-webfetch-grants-survive-uninstall-after-seed-emptied`.

## Security & Privacy

> Reference: `docs/security.md`. Check all that apply; skip inapplicable rows.

- [ ] **New Secret/Env Var** — added to the env schema? → **N/A.** No new secret, no new env var, no new credential read.
- [ ] **Egress widening disclosure** — stated rather than implied? → **Applies. This sub-plan is where it gets written down.** Task 29 puts both consequences into `.bkit/providers.md` in the same commit.

### Grant lifecycle asymmetry — disclosed, not closed

After this change the five surfaces revoke three different ways, and the split is not obvious from any one of them:

<!-- prettier-ignore -->
| Surface | Revocation on a dropped domain | Revocation on `bkit uninstall` |
| --- | --- | --- |
| `.claude/cloud.md` / `.cursor/cloud.md` paste blocks | Full rewrite each install — revokes for free | File is untracked and deleted |
| `.cursor/allowlist.json` | Full rewrite each install — revokes for free | `generated: true`, removed |
| `.claude/settings.json` `WebFetch(domain:…)` | **WS-5 prune** — revokes what bkit recorded writing | Recomputed into template scope and stripped (`bkit-uninstall.ts:583-598`) |
| `.cursor/hooks/guardrails.cjs` | No list left to revoke — reads the artifact at runtime | Managed block removed |
| `.opencode/opencode.json` `permission.bash` | **Never.** `injectOpencodeNetworkCurlAllows` (`.bkit/src/bkit-modules.ts:1726-1734`) only assigns `bash["curl *{base}*"] = "allow"` / `bash["wget *{base}*"] = "allow"` | **Never.** The injected keys are absent from the rendered template, so `stripTier2JsonScope` leaves them |

Consequence, stated plainly because the `Concrete Example`'s step 5 could otherwise be read as "removing a domain revokes its reach": a consumer who drops `sentry.io` from `allowed-domains` loses `WebFetch(domain:sentry.io)` and keeps `curl *sentry.io*` = `allow` and `wget *sentry.io*` = `allow` forever. That is a **shell** egress grant, strictly broader than the `WebFetch` grant the prune removes, and it survives uninstall. This change adds ten more such keys per consumer (five new bases × `curl` + `wget`). Recorded as `docs/deferrals.jsonl` key `381-opencode-bash-grants-never-revoked` and written into `.bkit/providers.md` by **Task 29** in the same commit. The pre-existing `381-opencode-curl-glob-substring-bypass` row covers the glob **shape** and does not cover this.

**The substring weakness, restated because Task 29 must write it:** each added base is one more **substring** `curl *{base}*` glob on OpenCode, where a query parameter defeats the check — `curl https://evil.tld/?x=openrouter.ai` is **allowed** on OpenCode and **asked** on Cursor, whose check is host-parsed. Inherent to OpenCode's command-glob permission model; documented, and the fix is a recorded deferral.

_No new routes, no DB writes, no secrets, no new user-input handler._

## 🚨 Pre-Flight / Dependencies 🚨

**CRITICAL:** Check off ALL core items. Check conditional items only when applicable. Abort if anything required is missing.

### Core _(always verify)_

- [ ] **Package Management:** No new runtime dependency. Confirm `pnpm install --frozen-lockfile` is clean and `pnpm-lock.yaml` is untouched by the whole change, not just this sub-plan.
- [ ] **Dependency Versions:** `package.json:28-29` pins `engines.node >= 20`. Spot-check `node --version >= 20`, `npx tsc --version`, `pnpm --version` (pinned `pnpm@10.34.3`, `package.json:31`).
- [ ] **Existing-Solution Search (reuse over duplicate):** Done, and this sub-plan's whole WS-6 half **is** the reuse proof: `injectOpencodeNetworkCurlAllows` and `writeNetworkAllowlistArtifact` were extended by nothing — they already read `resolveNetworkAllowlist`. The only `[NEW]` artifacts in the change are `.bkit/src/bkit-registry.ts` (sub-plan 1) and its build output `dist/bkit-registry.js` (Task 30), plus the new test file `.bkit/src/bkit-cloud-env.integration.test.ts` (Task 26).
- [ ] **User Context:** All files are in this worktree. Manual Verification Steps 6 and 7 need vendor dashboard access and are **owner-only, advisory** — nothing in the runbook depends on them.
- [ ] **Project Context:** `docs/decisions.jsonl` and `docs/knowledge.jsonl` read. Load-bearing entries: **`bkit install` flips `core.bare=true` — run `git config core.bare false` after every install, and Task 32's `Done when` asserts it**; **`bkit check` != `bkit upgrade` — separate engines, verify both live**, which Task 32 does explicitly; decision key `opencode-provider-allowlist-cut-to-four` (#435 Phase 1). `docs/deferrals.jsonl` carries **9 lines** under 8 unique `381-*` keys — none may be duplicated, none may be edited in place. **Task 31 is the gate on that.**
- [ ] **Testing & Quality:** Aligned with `docs/testing.md`. bkit has **Unit** and **Integration** only — no E2E project, no deployed boundary, no `@live` tier (`docs/testing.md:325-333`). `docs/testing.md:323` forbids mocking `fs`: T4, T6 and T14 all use a real `os.tmpdir()` consumer with no mocks at the install boundary.
- [ ] **Prerequisite Plans:** **`381-provider-egress-domains-plan-2.md`, `381-provider-egress-domains-plan-3.md` AND `381-provider-egress-domains-plan-4.md` must all be complete.** Verify concretely before starting: every task in all three is `[x]`, `pnpm vitest run` is green unscoped, and sub-plan 1's handover states Task 1's branch (GREEN or RED).

### Conditional _(verify only when applicable)_

- [ ] **Secrets & Env Vars:** N/A — no new API key, credential or env var.
- [ ] **Schema State:** The `.bkit/version` envelope now carries `webFetchDerived` (on Task 1's GREEN branch). Confirm before Task 28 that it is present and required-with-parser-default `[]`.
- [ ] **Architecture & UI:** No `[NEW]` source file in this sub-plan; one new **test** file (`.bkit/src/bkit-cloud-env.integration.test.ts`) and one new build output (`dist/bkit-registry.js`). No UI.
- [ ] **Observability:** N/A for new code — this sub-plan adds none. Verify only that the prune's console lines use the existing `LOG_PREFIX` and that `webfetch-grants-pruned` matches the `PreflightFinding` shape with a self-contained `action`.
- [ ] **Notifications:** N/A.

### Ground-truth citations this sub-plan depends on — re-verified in this worktree, 2026-08-26

> Every row below was read from source in this worktree on 2026-08-26. Where a cell disagrees with the parent design or the 2026-08-24 re-check comment, **this table is correct**. Do not copy the design's line numbers forward. **Every `bkit-modules.ts` anchor greater than `:1461` is a PRE-Task-3 coordinate and has since shifted by ~57 lines — resolve by symbol.**

<!-- prettier-ignore -->
| Fact | **Now (verified 2026-08-26)** |
| --- | --- |
| `injectOpencodeNetworkCurlAllows` | definition `.bkit/src/bkit-modules.ts:1726-1734` — **post-`:1461`, resolve by symbol.** Design cited `:1706-1714` |
| `injectOpencodeNetworkCurlAllows` call sites | **two** — `.bkit/src/bkit-modules.ts:1698` and `:1718`. **Commenting one leaves the other writing the globs, so a discriminating proof must disable BOTH.** Cited by neither the design nor the re-check |
| `writeNetworkAllowlistArtifact` | `.bkit/src/bkit-cloud-env.ts:515-535`; calls `resolveNetworkAllowlist` at `:519`. Design cited `:510-538` |
| `.cursor/allowlist.json` manifest entry | `.bkit/src/bkit-manifest.ts:574` — it **IS** in the manifest, `format: "byte-equal-text"`, `generated: true`; hash lands in per-consumer `canonicalHashes`, so it varies per consumer by design. Design said "not in any manifest" |
| Cursor guardrails template↔mirror byte parity | **does not exist.** `.bkit/src/bkit-guardrails-cursor.integration.test.ts` has three `describe` blocks (`:28`, `:96`, `:114`) and references only `.bkit/templates/.cursor/hooks/guardrails.cjs` (`:8`). The repo's only template↔mirror byte-parity test is `bkit-gateguard-dogfood.integration.test.ts:229`, covering `gateguard.cjs`. **T6 is a NEW test, written here in Task 32** |
| dist staleness gate | script name is **`bkit:check:dist`**, `package.json:61`. Build is `pnpm build` (`:60`). Design cited `pnpm check:dist` — wrong name |
| Live gaps this change closes | **4 hosts** — `api.githubcopilot.com`, `models.dev`, `skills.sh`, `api.tavily.com`. `groq.com` / `cerebras.ai` no longer exist as providers; `openrouter.ai` already shipped. Design and re-check both said 6 |
| Derived union | **15 bases**, sorted unique: `anthropic.com`, `claude.com`, `cursor.com`, `github.com`, `githubcopilot.com`, `githubusercontent.com`, `linear.app`, `models.dev`, `npmjs.com`, `npmjs.org`, `ollama.com`, `opencode.ai`, `openrouter.ai`, `skills.sh`, `tavily.com`. Strict superset of today's 10 |
| `BKIT_SHIPPED_NETWORK_HOSTS` | exact hosts, emitted verbatim by `renderCursorNetworkAllowlist` with **no** `*.` expansion — the only surface carrying `api.githubcopilot.com` and `api.tavily.com` |
| `.bkit/providers.md` § Network allowlist | section header `:264`, **encoding table `:270-275` and source-of-truth `:266` — owned by this sub-plan**; hook-fallback `:277` (sub-plan 3), cloud-egress `:279` (sub-plan 2). Also **`:256`**, the host-capability table's Network-fetch row — `.cursor/allowlist.json` "(tooling ∪ consumer domains)" and `WebFetch` "tooling … enriches with consumer `allowed-domains`" — **owned by this sub-plan** |
| `bkit uninstall` and `.claude/settings.json` | `.bkit/src/bkit-uninstall.ts:583-598` — the **fourth** `resolveNetworkAllowlist` caller. Not edited by this plan; cited for the revocation table |

### 🔒 Gate 1: Prerequisites Check _(sub-plan scope)_

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all applicable boxes above. **DO NOT stop for user permission.** The plan-wide Gate 1 is executed once in `381-provider-egress-domains-plan-1.md`.

- [ ] **Acceptance Scenario confirmed:** Human confirmed `👤 Acceptance Scenario` section (checkbox is `[x]`).
- [ ] **Breaking Changes confirmed:** Human confirmed `⚠️ Breaking Changes & Naming Review` section (checkbox is `[x]`).
- [ ] **Open Questions confirmed:** Human confirmed `👤 Open Questions & Assumptions` section (checkbox is `[x]`).
- [ ] **All three predecessors landed:** `381-provider-egress-domains-plan-2.md`, `381-provider-egress-domains-plan-3.md` and `381-provider-egress-domains-plan-4.md` complete; `pnpm vitest run` green unscoped; sub-plan 1's handover read and Task 1's branch known.
- [ ] **Security & Privacy checked:** All applicable rows verified.
- [ ] **Gate 1 (sub-plan scope) - Verified.**

## Data Schema Integration

**No database, and no schema change in this sub-plan.** bkit ships no DB, no migration lane and no `docs/data-schema.md` rows. The `.bkit/version` envelope gained `webFetchDerived` in `381-provider-egress-domains-plan-4.md`; this sub-plan **reads** it (Task 28's T14 asserts 0 writes with the field present) and never writes a new field.

### Data Schema Usage (Inputs & Outputs)

- **Input (Read):** `.bkit/version` → all four fields, on the scratch consumers used by T4, T14 and Task 32.
- **Output (Write):** none new. Task 32's `bkit install` writes the normal install footprint.

### Data Schema Changes

**ADD:** none. **MODIFY:** none. **DELETE:** none.

## Architecture & Component Changes

**CRITICAL:** Prefer `[MODIFY]` over `[NEW]`. **CRITICAL:** never weaken a gate to pass — no `as any`, `@ts-ignore`, `.skip`, deleted assertions, empty `catch`, or mocking-away the unit under test. **CRITICAL:** `.agents/rules.md` § Repo Authoring — edit source only; **never** edit mirrors in `.claude/`, `.cursor/`, `.opencode/` directly, and batch `bkit install` mirror regeneration **once** at session end — **which is Task 32 in this sub-plan, and it is the only `bkit install` in the entire change.**

### Database Migrations

None. bkit ships no database and no migration lane.

### Cross-surface fan-out (WS-6)

#### [MODIFY] none — verification targets only

- `injectOpencodeNetworkCurlAllows` (`.bkit/src/bkit-modules.ts:1726-1734`, **resolve by symbol**) and `writeNetworkAllowlistArtifact` (`.bkit/src/bkit-cloud-env.ts:515-535`) are **unchanged code paths** — both already call `resolveNetworkAllowlist` and pick up the widened set for free. This workstream's job is to prove that, not to edit them. Listed explicitly so the absence of an edit does not read as an oversight.

### Cron Jobs & Scheduled Tasks

None.

## Documentation Updates _(this sub-plan's share)_

<!-- prettier-ignore -->
| Doc | Change required |
| --- | --- |
| `docs/decisions.jsonl` | Three ADR rows appended by the plan and plan-review phases: declaration-with-gate over PSL (carrying the `*.googleapis.com` example **verbatim** — otherwise the next maintainer adds `psl` "to do it properly" and re-widens everything); static whole-registry over installed-set reactive; delete the hook's fallback rather than codegen it. **Task 31 verifies them; do not re-append.** |
| `docs/deferrals.jsonl` | **9 lines, 8 unique `381-*` keys.** Four from the design phase; three appended by plan-generate (`381-upgrade-does-not-write-advisories-artifact`, `381-webfetch-grants-survive-uninstall-after-seed-emptied`, `381-cursor-hook-ask-rate-signal`); one NEW from the review pass (`381-opencode-bash-grants-never-revoked`, `reason: own-cycle`); one same-`key` correction line for `381-webfetch-grants-survive-uninstall-after-seed-emptied`, whose original premise the source disproves. Do **not** duplicate, do **not** edit or delete a prior line (`.bkit/jsonl.md` § Updating a Row). **Task 31 verifies.** |
| `docs/testing.md` | § Key test files gains `.bkit/src/bkit-cloud-env.integration.test.ts` (new — five-surface fan-out after a real tmp-dir install). Update the `bkit-permissions-parity.integration.test.ts` scope cell: it no longer asserts the network allowlist, only the destructive-command and secret-read table. **Both halves land in Task 29's commit** — the second half describes a deletion made in `381-provider-egress-domains-plan-3.md` Task 17, which is why it is batched here rather than there. |
| `.bkit/providers.md` | **Four distinct sections, three workstreams — deliberate, not a conflict.** (a) WS-4 (`381-provider-egress-domains-plan-3.md`): `:277`. (b) WS-3 (`381-provider-egress-domains-plan-2.md`): `:279`. (c) **WS-6 — this sub-plan:** the § Network allowlist encoding table (`:270-275`) gains **two** statements — the OpenCode substring-glob weakness (`curl *{base}*` is a **command** glob, so `curl https://evil.tld/?x=openrouter.ai` is allowed on OpenCode and asked on Cursor, and widening the base list widens that asymmetry) **and** the grant-lifecycle asymmetry (`permission.bash` keys are never revoked on any verb, so a dropped `allowed-domains` entry keeps its `curl`/`wget` allow forever while its `WebFetch` twin is pruned). Also `:266` — "Source of truth (stack domains)" needs the derived-registry half stated. (d) **WS-6 — this sub-plan:** `:256`, the host-capability table's Network-fetch row — `.cursor/allowlist.json` "(tooling ∪ consumer domains)" and `WebFetch` "tooling … enriches with consumer `allowed-domains`" both describe the hand-maintained model this change replaces; restate as derived-registry ∪ consumer. **ASCII operators only** (`!=`, `>=`, `<=`) in `.bkit/*.md`. |

_No row for `docs/architecture.md`, `docs/data-schema.md`, `docs/security.md`, `docs/deployments.md` or `docs/failures.jsonl` — this change adds no service boundary, no DB object, no auth/secret surface, no CI/CD rule, and discovers no bug._

## Rollback Strategy _(plan-wide — this sub-plan owns it, because it is the one that ships)_

<!-- prettier-ignore -->
| Axis | Action | Notes |
| --- | --- | --- |
| **DB** | None — bkit ships no database and no migration lane. | n/a |
| **Code** | `git revert {COMMIT}` on the squash-merge commit, then `pnpm build` and commit the regenerated `dist/` (including deleting `dist/bkit-registry.js`), then `pnpm bkit install` once to regenerate the `.claude/` / `.cursor/` / `.opencode/` mirrors and `.cursor/allowlist.json`. Finish with `git config core.bare false` — `bkit install` flips it. | `pnpm bkit:check:dist` fails CI if `dist/` is not reverted alongside the source. |
| **Consumer state** | `.bkit/version` retains `webFetchDerived` after a revert. Harmless: the reverted `parseBkitVersion` ignores unknown keys, and the reverted install writer builds a fresh literal that drops it on the next install. **No cleanup step is required and none should be added** — a migration-down would be new code on the rollback path. | Verified against the current parse/write shapes (`bkit-version.ts:81-112`, `bkit-modules.ts:955-959`). |
| **Consumer state — grants already pruned** | A revert does not restore a removed `WebFetch(domain:…)` grant, because the reverted enrich is additive-only and the domain is no longer in the derived set. Recovery is the same path the advisory names: declare the apex in `.agents/context.md` `allowed-domains` and re-run `bkit install`. Every removal is also a deleted line in `git diff .claude/settings.json`, so the exact strings are recoverable from history. | This is the only irreversible consumer-visible effect, and it is bounded to grants bkit itself recorded writing. |
| **Consumer state — dashboard paste** | A reverted allowlist is a **narrower** set than the pasted one, so a stale paste after rollback over-permits rather than under-permits — no cloud session breaks. No re-paste is required to roll back. | The fingerprint changes, so the next `cloud.md` read shows the mismatch. |
| **Risk window** | None. There is no deploy and no schema migration; the change is atomic in one commit and its `dist/` output. | Between merge and a consumer's next `bkit install`/`bkit upgrade`, consumers run entirely on the old behaviour. |

## Agent Execution Runbook

> [!IMPORTANT]
> **Continuous Execution:** Work runbook autonomously. No pause for user permission at any Gate. Check `[x]` tasks as you go.
> **Step Isolation:** Complete each task fully (verification + checkbox) before next task.
> **Integration Shape:** advisory only — delivering every task in ONE PR is always correct.

**Standing rules for every task below** (`.agents/rules.md` § Repo Authoring):

- **Edit source only** — `.bkit/src/`, `.bkit/templates/`, `.bkit/workflows/`, `.bkit/prompts/`, `.agents/`. **Never** edit `.claude/`, `.cursor/`, `.opencode/` mirrors directly. `.cursor/hooks/guardrails.cjs` is a mirror: edit the template, regenerate at the end — **the regeneration is Task 32, here.**
- **Batch `bkit install` once, at session end (Task 32)** — never per edit. **Task 32 is the only `bkit install` in the entire 34-task change**, which is precisely why T6 lives there.
- **Docs change in the same task as the code they describe.** Task 29 is WS-6's docs and lands in the same commit as Tasks 26–28.
- **Add no new `try`/`catch` anywhere in this change** — a catch-with-default-return bumps `defensive.error-obscuring` and fails `slop:delta` on net score even at net-zero finding count. Use `URL.canParse`.
- **After any `bkit install` / `bkit upgrade` in this repo, run `git config core.bare false`** — install flips it. Task 32's `Done when` asserts `git config core.bare` prints `false`.
- **🛑 Every `.bkit/src/bkit-modules.ts` line number in this plan is a PRE-Task-3 coordinate.** Task 3 (landed, `381-provider-egress-domains-plan-1.md`) deleted `OPENCODE_PROVIDER_DEFAULTS` at `:1461-1518` — 58 lines — so every anchor **after** `:1461` has shifted by roughly 57 lines: `injectOpencodeNetworkCurlAllows` call sites `:1698` / `:1718` and definition `:1726-1734`, `enrichClaudeSettingsWebFetch` `:1751-1778`, its JSDoc `:1736-1750`, its early return `:1770` and its `ws.writes` push `:1775-1777`. Anchors **before** `:1461` (`:174`, `:205`, `:887`, `:946`, `:955-959`, `:1062`, `:1309-1310`, `:1396-1400`) are unaffected. **Resolve every post-`:1461` anchor by symbol name, never by line number**, and never write a `Done when` that greps a post-`:1461` line range. **Tasks 26 and 27 both operate in shifted territory.**
- **ASCII operators only** (`!=`, `>=`, `<=`) in `.bkit/*.md` — never Unicode `≠ ≥ ≤`.
- **Deferral rows are append-only.** `docs/deferrals.jsonl` carries 9 lines under 8 unique `381-*` keys; a state change is a same-`key` append (`.bkit/jsonl.md` § Updating a Row), never an edit to a prior line. **Task 31 is the gate on that, and it verifies rather than appends.**

Task order is the design's dependency graph: **WS-1 → WS-2 → {WS-3, WS-4, WS-5} → WS-6 → WS-7**. This sub-plan is Phase 4 and Phase 5.

### Phase 4 — WS-6: cross-surface fan-out _(requires: WS-3, WS-4, WS-5)_

- [ ] **Task 26 — Write the five-surface fan-out parity test in a new `.bkit/src/bkit-cloud-env.integration.test.ts`.** One derived union asserted present in all five surfaces after a **real tmp-dir install run with `install --claude --cursor --opencode=openrouter --tracker=github`** — the flag set matters: `.opencode/opencode.json` `permission.bash` only exists when an opencode provider is installed, so an install without `--opencode=…` gives a T4 that silently skips the OpenCode surface. Surfaces: cloud paste fence, `.cursor/allowlist.json` `domains`, `.claude/settings.json` `WebFetch(domain:…)`, `.opencode/opencode.json` `permission.bash` globs — and, as an **absence** assertion, the installed hook carrying no domain array. No mocks at the install boundary. _(Owns matrix row **T4**.)_
  - **Done when:** T4 passes; deleting any one surface's wiring makes it fail — verify against `injectOpencodeNetworkCurlAllows` by temporarily commenting **both** of its call sites (`.bkit/src/bkit-modules.ts:1698` **and** `:1718`, pre-Task-3 coordinates; resolve by symbol), then restore. Commenting only one leaves the other path writing the globs and T4 passes vacuously, which is the exact false-green this step exists to rule out. The absence assertion greps the installed `.cursor/hooks/guardrails.cjs` for `SHIPPED_NETWORK_BASES` and finds none — noted as belt-and-braces, not independent evidence: the installed file is written from the template, so this can only restate T6.
- [ ] **Task 27 — Prove `injectOpencodeNetworkCurlAllows` and `writeNetworkAllowlistArtifact` are unchanged, and that no second domain list survives anywhere.** No code edit — verification only. **Resolve both functions by symbol name.** Do not diff a `bkit-modules.ts` line range: Task 3 deleted 58 lines at `:1461`, so the whole file diff is large and the pre-Task-3 range `:1726-1734` now names different code — a line-range check there can neither pass nor fail meaningfully.
  - **Done when:** the body of `injectOpencodeNetworkCurlAllows` in the working tree is byte-identical to `git show <baseline-sha>:.bkit/src/bkit-modules.ts`'s copy of the same function (extract both by symbol, compare); the body of `writeNetworkAllowlistArtifact` is likewise byte-identical to its pre-Task-1 copy; and the sweep for a second hand-maintained host list, **`rg -l --hidden --glob '!.git/' --glob '!*.test.ts' '"(github|npmjs|anthropic|opencode|ollama)\.(com|ai)"' .bkit/`, returns exactly one path — `.bkit/src/bkit-registry.ts`.** A **closed expected set of one**, not "only the registry and generated artifacts": an open-ended "and generated artifacts" lets any surprise match be rationalised away, which is the one outcome this sweep exists to prevent. Two corrections to the v2 form of this command, both verified 2026-08-26:
    - **`--hidden` is mandatory.** Without it `rg` skips `.bkit/templates/.cursor/hooks/`, so the sweep **cannot see `SHIPPED_NETWORK_BASES`** — the exact second list this task is proving gone. Baseline on the untouched tree: without `--hidden` it returns 1 file (`bkit-cloud-env.ts`); with it, 2 (`bkit-cloud-env.ts` **and** `.bkit/templates/.cursor/hooks/guardrails.cjs`). A sweep blind to its own target is worse than no sweep.
    - **`--glob '!dist/'` is inert and is dropped.** `dist/` sits at the repo root, outside the `.bkit/` search path, so the exclusion never applied to anything.

    Both baseline matches must be gone by this point: `bkit-cloud-env.ts` because Task 7 replaced the literal with a computed flatMap, `guardrails.cjs` because Task 15 deleted the array. If either still matches, a hand-maintained copy survived — fix the copy, never the glob.
- [ ] **Task 28 — Assert `bkit check` reports 0 writes on a clean install and a clean upgrade with the provenance field present.** The dry-run rule, tested against the real engine rather than argued by inspection. _(Owns matrix row **T14**.)_
  - **Done when:** T14 passes in `.bkit/src/bkit-upgrade.integration.test.ts` — after a clean install, `bkit check` reports 0 writes and `.bkit/version` is byte-identical before and after; same after a clean upgrade.
- [ ] **Task 29 — WS-6 docs, same commit. Three spots in `.bkit/providers.md`.** (a) § Network allowlist encoding table (`:270-275`) gains the explicit OpenCode substring-glob weakness. (b) The same table gains the **grant-lifecycle asymmetry**, stated plainly and never implied: `permission.bash` `curl *{base}*` / `wget *{base}*` keys are assigned by `injectOpencodeNetworkCurlAllows` and deleted by nothing — not on install, not on upgrade, not on uninstall — so a domain dropped from `allowed-domains` loses its `WebFetch` grant and keeps its broader **shell** egress grant permanently, and this change adds ten more such keys per consumer. (c) `:266` gains the derived-registry half of "source of truth", and **`:256`**'s host-capability row — `.cursor/allowlist.json` "(tooling ∪ consumer domains)" and `WebFetch` "tooling … enriches with consumer `allowed-domains`" — is restated as derived-registry ∪ consumer.
  - **Done when:** `rg -n 'substring' .bkit/providers.md` matches a sentence naming `curl *{base}*` and contrasting it with the host-parsed Cursor check; `rg -n 'never revoked|not revoked' .bkit/providers.md` matches a sentence naming `permission.bash`; `rg -n 'tooling ∪ consumer' .bkit/providers.md` returns nothing; `pnpm lint:prose` passes.

### Phase 5 — WS-7: release integration _(requires: WS-6)_

- [ ] **Task 30 — Build and commit `dist/`, including the new `dist/bkit-registry.js`.**
  - **Done when:** `pnpm build` succeeds and `pnpm bkit:check:dist` exits 0.
- [ ] **Task 31 — Verify the ledger rows, and update them only if the build changed the decision.** The **plan and plan-review phases already appended** three `docs/decisions.jsonl` ADR rows (`381-egress-base-derivation-declaration-with-gate-not-psl` — carrying the `*.googleapis.com` example **verbatim**; `381-static-whole-registry-egress-derivation-not-installed-set`; `381-delete-cursor-hook-fallback-list-not-codegen`) and **9 `docs/deferrals.jsonl` lines under 8 unique `381-*` keys**: four from the design phase, three from plan-generate, one NEW from the review pass (`381-opencode-bash-grants-never-revoked`), and one same-`key` correction line for `381-webfetch-grants-survive-uninstall-after-seed-emptied` whose original premise `.bkit/src/bkit-uninstall.ts:583-598` disproves. Do **not** re-append any of them. If the build changed a decision — most plausibly Open Question 1, 2 or 7 resolving against the recorded default, or Task 1 failing and the prune being re-scoped — record it by appending a **same-`key`** row, never by editing the existing line (`.bkit/jsonl.md` § Updating a Row; these ledgers are `merge=union`, so an edited line survives beside its replacement).
  - **Done when:** `rg -c '"key":"381-' docs/deferrals.jsonl` returns **9** (or more, if a same-`key` update was genuinely earned) across exactly **8 unique keys** (`rg -o '"key":"381-[a-z-]*"' docs/deferrals.jsonl | sort -u | wc -l` prints 8); `rg -c '"key":"381-webfetch-grants-survive-uninstall-after-seed-emptied"' docs/deferrals.jsonl` returns **2** — the original line plus its correction — and the **later** of the two carries the recomputation premise, not the seed-scoping one; `rg -c '"key":"381-' docs/decisions.jsonl` returns 3 (or more); every line parses (`while read -r l; do printf '%s' "$l" | jq -e . >/dev/null || echo "BAD: $l"; done < docs/decisions.jsonl` and the same over `docs/deferrals.jsonl` print nothing); and `git diff docs/decisions.jsonl docs/deferrals.jsonl` shows **additions only**, no modified or deleted lines.
- [ ] **Task 32 — Regenerate mirrors ONCE, write T6, then verify install and upgrade live on a dogfood consumer.** `pnpm bkit install` in this repo to regenerate `.claude/` / `.cursor/` / `.opencode/` and `.cursor/allowlist.json`; then `git config core.bare false`. **Then write T6** — a new `describe` in `.bkit/src/bkit-guardrails-cursor.integration.test.ts` asserting `.bkit/templates/.cursor/hooks/guardrails.cjs` is byte-equal to `.cursor/hooks/guardrails.cjs`. T6 does not exist today (that file has three `describe` blocks, `:28`, `:96`, `:114`, and references only the template at `:8`); the repo's only template↔mirror byte-parity precedent to copy is `bkit-gateguard-dogfood.integration.test.ts:229`, which covers `gateguard.cjs`. **T6 lives here and not in Task 17** because the mirror only matches the template after this task's `bkit install`. Then a **separate** scratch consumer under `tmp/`: `node dist/bkit-install.js install --claude --cursor --opencode=openrouter --tracker=github`, inspect the on-disk footprint, then `node dist/bkit-install.js upgrade` and `node dist/bkit-install.js check`. `check` is not `upgrade` — separate engines, verify both. _(Owns matrix row **T6**.)_
  - **Done when:** T6 passes and fails if the template is edited without a re-install (verify once by appending a byte to the template, observing red, then restoring and re-installing); `.cursor/hooks/guardrails.cjs` is byte-equal to its template and contains no `SHIPPED_NETWORK_BASES`; `.cursor/allowlist.json` carries exactly the 15 derived bases plus their `*.` forms — 30 entries, and `tavily.com` is present because it is now **derived**, not because `.agents/context.md` declares it (Task 14 removed that declaration); the scratch consumer's `.claude/cloud.md` fence contains `githubcopilot.com`, `models.dev`, `skills.sh` and `tavily.com`, carries the `Also include default list` tick instruction, and its fingerprint line sits **after** the closing fence; `bkit check` on the scratch consumer exits 0 with 0 writes after both install and upgrade; `git config core.bare` prints `false`.
- [ ] **Task 33 — Confirm Success Criterion 1 end-to-end and disposition the open questions.** Assert the four live gaps reach the scratch consumer's surfaces **in the encoding each surface actually uses**, and that the paste block carries provider/tooling hosts with **zero** declared `allowed-domains`. **The four gaps are hosts; four of the five surfaces carry only bases.** By design `.claude/cloud.md`, `.cursor/allowlist.json`, `.claude/settings.json` and `.opencode/opencode.json` are fed from `BKIT_SHIPPED_NETWORK_DOMAINS` (bases, apex + `*.`) and **never** contain `api.githubcopilot.com` or `api.tavily.com`; the only surface emitting exact hosts is `.cursor/cloud.md`, from `BKIT_SHIPPED_NETWORK_HOSTS`. So the assertion splits in two, and **`.cursor/cloud.md` must be in the file list** — the v2 criterion greppped exact hosts against four base-only surfaces and named `.cursor/cloud.md` in its parenthetical without ever opening it, making the plan's Criterion-1 gate unreachable and self-contradictory at once. Record the disposition of Open Questions 1–7 in the PR body — settle OQ3 (`models.dev`) by an `opencode-zen` session with the host blocked if one is cheap to run, otherwise carry the recorded default; OQ7 (OpenCode grant lifecycle) carries default B, so the PR body must state plainly that the `permission.bash` globs are never revoked and name `docs/deferrals.jsonl` key `381-opencode-bash-grants-never-revoked`.
  - **Done when — two assertions, run against the Task 32 scratch consumer (installed `--claude --cursor --opencode=openrouter --tracker=github`):**
    1. **Bases across the four wildcard surfaces.** For each of `githubcopilot.com`, `models.dev`, `skills.sh`, `tavily.com`: `rg -c "<base>" tmp/<scratch>/.claude/cloud.md tmp/<scratch>/.cursor/allowlist.json tmp/<scratch>/.claude/settings.json tmp/<scratch>/.opencode/opencode.json` is non-zero in **every** one of the four files.
    2. **Exact hosts on the Cursor cloud list.** For each of `api.githubcopilot.com`, `models.dev`, `skills.sh`, `api.tavily.com`: `rg -c "<host>" tmp/<scratch>/.cursor/cloud.md` is non-zero. This is the only surface that can carry the two `api.*` hosts, and it is the one that proves the `BKIT_SHIPPED_NETWORK_HOSTS` half of the derivation reached a real install.

    Plus: `rg -n 'allowed-domains' tmp/<scratch>/.agents/context.md` shows no declared block (the zero-declaration case Criterion 1 names), and `rg -c 'api\.githubcopilot\.com' tmp/<scratch>/.claude/settings.json` returns **0** — asserted deliberately, because a non-zero result there would mean exact hosts leaked into a base-only surface and the two encodings had been conflated. `models.dev` and `skills.sh` appear in both lists because their base equals their host; that is expected, not a duplicate.
- [ ] **Task 34 — Run the full local gate set and fix every failure at the root.** `pnpm bkit:gate:static-unit` plus `pnpm vitest run` unscoped plus `pnpm bkit check`.
  - **Done when:** `pnpm typecheck`, `pnpm lint`, `pnpm format:check`, `pnpm lint:prose`, `pnpm slop:delta`, `pnpm vitest run` (full suite, never scoped), `pnpm test:coverage:unit` (branches >= 70) and `pnpm bkit check` all exit 0, with **zero** `.skip`, `@ts-ignore`, `as any`, deleted assertions or new gate exemptions introduced anywhere in the diff.

### 🔒 Gate 2: Code Implementation Check _(PLAN-WIDE — asserts across all 34 tasks)_

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below. **DO NOT stop for user permission.** These items assert across the whole change, including the work done in `381-provider-egress-domains-plan-1.md` … `381-provider-egress-domains-plan-4.md`. Re-verify them against the tree, not against those sub-plans' own checkboxes.

- [ ] **No bolt-on / no gate-weakening:** the single `[NEW]` artifact (`.bkit/src/bkit-registry.ts`) is justified against extending an existing file by the import-cycle and coverage-lane arguments in `Architecture`; no `as any` / `as unknown as` / `@ts-ignore` / `.skip` / empty `catch` / error-swallowing was introduced to make a gate pass.
- [ ] **Source-only edits:** `git diff --name-only` contains no path under `.claude/`, `.cursor/` or `.opencode/` **except** mirror output regenerated by Task 32's single `bkit install`.
- [ ] **Every matrix row owned, and the mapping checked in BOTH directions:** T1→Task 8, T2→Task 8, T3→Task 6, T4→Task 26, T5→Task 7, **T6→Task 32** (Phase 5, after the single `bkit install` — never Task 17, which runs four phases before the mirror exists), T7→Task 9, T8→Task 23, T9→Task 12, T10→Task 24, T11→Task 17, T12→Task 13, T13→Task 11, T14→Task 28, **T15→Task 23**, **T16→Task 19**, **T17→Task 21**. No orphan rows, no invented tests. **On Task 1's RED branch, T8, T10 and T15 do not exist and are excluded from this check.**
- [ ] **No task mandates a test assertion that has no matrix row.** The row→task direction above is not sufficient on its own: a task can silently require a new assertion that the matrix never carries, which is how **T16** (`bkit-version.test.ts` parser default, mandated by Task 19) and **T17** (upgrade-writes-on-derived-change, mandated by Task 21) were missing from the v2 matrix. Walk every task's `Done when` and confirm each named test assertion resolves to a T-row. `.bkit/src/bkit-version.test.ts` now appears in the matrix (T16); `.bkit/src/bkit-upgrade.integration.test.ts` carries **two** rows (T14 and T17) asserting opposite conditions — 0 writes on a clean tree, and a required write when only the derived set changed — and neither subsumes the other.
- [ ] **No `Done when` grep matches this plan's own artifacts:** every repo-wide `rg` in a `Done when` either carries `--glob '!docs/plans/**'` or names explicit file paths. Archived plan artifacts under `docs/plans/**` are never edited to satisfy a grep.
- [ ] **Every `Done when` grep that traverses a directory carries `--hidden --glob '!.git/'`, or names explicit file paths.** `rg` skips hidden directories by default, and bkit's shipped source is full of them — `.agents/`, `.bkit/templates/.agents/`, `.bkit/templates/.cursor/hooks/`, `.bkit/templates/.claude/`. A sweep that traverses `.bkit/` without `--hidden` is silently blind to every template twin under it, which is how Task 14's twin-identity clause and Task 27's second-list sweep were each blind to the one file they existed to check. Naming a file explicitly is exempt: `rg` searches explicitly-named paths even when hidden.
- [ ] **Every `Done when` grep asserting "returns nothing" has its live match set enumerated and owned.** A repo-wide alternation that returns zero only after edits must list, at plan time, exactly which live lines it will be driven to zero from — otherwise an unowned match forces the builder to either weaken the grep or edit a file no task claims. Task 14 carries such an enumeration; any grep added later must too.
- [ ] **Every `Done when` grep whose result changes later in this runbook says so.** Point-in-time checks are legitimate; unlabelled ones read as regressions to the next verification pass. Labelled: Task 3 (Task 8's T1 adds an `OPENCODE_PROVIDER_DEFAULTS` import), Task 22 (Tasks 23 and 24 add `WebFetch(domain:…)` literals).
- [ ] **No `Done when` names a post-`:1461` `bkit-modules.ts` line range after Task 3 has run:** `injectOpencodeNetworkCurlAllows`, `enrichClaudeSettingsWebFetch` and their internals are resolved by symbol.
- [ ] **Gate 2 - Verified:** Every checkbox above independently verified and checked off against the plan.

**Mandatory Tasks (Testing & Documentation):**

- [ ] **Verify test coverage against Derived Test Matrix:** every T-row has a corresponding checked-off task above.
- [ ] **Update existing tests:** the three re-anchored cases in `bkit-cloud-env.test.ts` (Task 13) and the deleted parity block plus new negative case (Task 17) — no test case silently dropped. **`.bkit/src/bkit-uninstall.test.ts` is verified UNMODIFIED** (Task 22): its two `WebFetch(domain:…)` cases at `:672-704` and `:719-749` must pass with an empty `git diff` on that file.
- [ ] **Write new tests:** T4, T5, T6, T9, T10, T11, T13, T14, T15 are new — **T6 included; it does not exist today** and is written by Task 32; T1, T2, T3, T7, T8, **T16**, **T17** are new assertions in existing files (`bkit-cloud-env.test.ts`, `bkit-modules.test.ts`, **`bkit-version.test.ts`** for T16, **`bkit-upgrade.integration.test.ts`** for T17).
- [ ] **Verify observability:** the prune's console lines use the existing `LOG_PREFIX`, and the `webfetch-grants-pruned` finding matches the `PreflightFinding` shape with a self-contained `action`. No raw PII, no token, no path outside the repo. Update `docs/observability.md` only if a new log name is introduced — the prune reuses the existing prefix, so no new name is expected.
- [ ] **Update documentation:** every row in `Documentation Updates` — across all five sub-plans — completed in the same task as its code.

### 🔒 Gate 3: Testing & Documentation Check _(PLAN-WIDE)_

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below. **DO NOT stop for user permission.**

- [ ] **Docs updated:** every row in `Documentation Updates` — in this sub-plan and in `381-provider-egress-domains-plan-1.md`, `381-provider-egress-domains-plan-2.md`, `381-provider-egress-domains-plan-3.md`, `381-provider-egress-domains-plan-4.md` — completed. `.agents/docs.md` still accurate (no new doc file added, so no new row expected).
- [ ] **Gate 3 - Verified:** Every checkbox above independently verified and checked off.

## Verification Plan _(PLAN-WIDE)_

> [!IMPORTANT]
> **Advisory build-phase checks, NOT merge gates.** Only `Agent Execution Runbook` `Done when` lines gate the merge; nothing in this section does.

### Automated Tests

- [ ] **Full Local Gate Suite:** `pnpm bkit:gate:static-unit` — chains `typecheck`, `lint`, `format:check`, `lint:prose`, `slop:delta`, then `test`, `test:coverage:unit` and `bkit:test:bats`. Plus `pnpm bkit check` for drift. Do NOT weaken any gate to pass.
- [ ] **Test Synchronization:** no Playwright / E2E project exists in bkit (`docs/testing.md:332`), so nothing to synchronise there. The tests this change **breaks** are enumerated and owned: `bkit-cloud-env.test.ts:326-331`, `:399-403`, `:478-483` (Task 13) and `bkit-permissions-parity.integration.test.ts:173-191` (Task 17). The tests this change **touches without breaking**, and which must therefore be re-run and left byte-unmodified, are `.bkit/src/bkit-uninstall.test.ts:672-704` and `:719-749` (Task 22) — the two cases that assert `WebFetch(domain:…)` literals against the seed Task 22 empties; they survive only because `bkit-uninstall.ts:583-598` recomputes the derived set into template scope, and if either goes red the correct response is to re-open that reasoning, never to edit the test. Re-run `pnpm vitest run` unscoped after each — a scoped run hides cross-file breakage, which is exactly how the parity assertion and the uninstall cases would both have gone unnoticed.
- [ ] **Build Configuration:** no new mock file and no new test config; `tsconfig.json` already excludes `**/*.test.ts` from `tsc --noEmit`, which is why adding a required `BkitVersion` field does not break the existing test-side object literals. Confirm `dist/bkit-registry.js` appears in the build output and is committed.
- [ ] **Unit (`.bkit/src/bkit-cloud-env.test.ts`):** T1 completeness, T2 suffix invariant, T3 anti-widening + soft-warn set, T5 injected source, T7 rejection channels (all `381-provider-egress-domains-plan-1.md`), T9 fingerprint placement + stability, T12 retired branches, T13 Cursor exact hosts (all `381-provider-egress-domains-plan-2.md`). Data hygiene: all fixture rows are local constants; no `vi.mock` anywhere in the file. Re-run all eight rows here.
- [ ] **Unit (`.bkit/src/bkit-modules.test.ts`, `.bkit/src/bkit-version.test.ts`):** T8 prune round-trip and the seven recording-contract rows; T15 `ws.writes` under `dryRun` (drift signal preserved); **T16** the `webFetchDerived` parser default — asserted at **both** `parseBkitVersion` returns (`.bkit/src/bkit-version.ts:103`, `:112`), which are separate code paths. All written in `381-provider-egress-domains-plan-4.md`; re-run here.
- [ ] **Integration (`.bkit/src/bkit-cloud-env.integration.test.ts`, new):** T4 five-surface fan-out after a real tmp-dir install, including the hook-carries-no-array absence assertion.
- [ ] **Integration (`.bkit/src/bkit-install.integration.test.ts`):** T10 provenance survives a real install (written in `381-provider-egress-domains-plan-4.md`).
- [ ] **Integration (`.bkit/src/bkit-upgrade.integration.test.ts`):** T14 `bkit check` 0 writes after clean install and clean upgrade (Task 28, here); **T17** the inverse — an upgrade whose only change is the derived set **does** write `.bkit/version`, plus the `migrateStrayGitattributes` (`.bkit/src/bkit-upgrade.ts:547`) round-trip keeping `webFetchDerived` intact (`381-provider-egress-domains-plan-4.md`). T14 and T17 assert opposite conditions on the same file by design; neither subsumes the other.
- [ ] **Integration (`.bkit/src/bkit-guardrails-cursor.integration.test.ts`):** T11 hook asks on `api.github.com` with no artifact in `cwd` (Task 17, Phase 3b, `381-provider-egress-domains-plan-3.md`); T6 template ↔ mirror byte parity — a **new** `describe`, written in Phase 5 by Task 32, after the single `bkit install` regenerates the mirror.
- [ ] **Apply local migrations:** N/A — bkit ships no database and no migration lane.
- [ ] **Run all tests:** `pnpm vitest run` **unscoped** (`.agents/rules.md` § Repo Authoring: "Verify before complete" means the full suite, never a scoped run) plus `pnpm bkit:test:bats`. Fix all failures before Gate 4.

> [!IMPORTANT]
> **No Architectural Downgrades:** if a build, compiler or test error appears, never resolve it via a hot fix or an anti-pattern. In particular: do not add a `try`/`catch` to silence a URL-parsing edge (use `URL.canParse`), do not widen a denylist to make the gate pass (fix the row's `bases` and record a `reason`), do not `.skip` the parity or fan-out tests, do not edit or skip `.bkit/src/bkit-uninstall.test.ts` to make Task 22's grep green, and do not add `if (dryRun) return null;` above the `ws.writes` push to make the recording contract simpler. Halt if stuck.

### 🔒 Gate 4: Automated Verification Check _(PLAN-WIDE)_

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below. **DO NOT stop for user permission.**

- [ ] **Gate 4 - Verified:** every checkbox in Automated Tests independently verified and checked off, with explicit proof captured (test output, CLI exit codes, the on-disk footprint of the scratch consumer).

### 👤 Manual Verification

> [!CAUTION]
> **Owner-run acceptance checks — advisory only.** Run during build wherever a CLI can. An unticked box blocks nothing.

> [!WARNING]
> **Dashboard Ban:** use local CLIs to verify rather than asking the user to check a dashboard. The two boxes below that genuinely need a vendor dashboard are marked as such and are the only ones in the entire change.

- [ ] **Step 1 — Dogfood install footprint.** `pnpm build && cd tmp/<scratch> && node ../../dist/bkit-install.js install --claude --cursor --opencode=openrouter --tracker=github`. Inspect `.claude/settings.json`, `.cursor/allowlist.json`, `.opencode/opencode.json`, `.cursor/hooks/guardrails.cjs`, `.claude/cloud.md`, `.cursor/cloud.md`, `.bkit/version`. Then `git config core.bare false` in the bkit repo.
- [ ] **Step 2 — Install ≠ upgrade.** In the same scratch consumer: `node ../../dist/bkit-install.js upgrade` then `node ../../dist/bkit-install.js check`. Confirm `check` reports 0 writes after **both** verbs and that `.bkit/version` `webFetchDerived` survived the upgrade.
- [ ] **Step 6 _(vendor dashboard — owner only)_ — the paste actually works.** Paste the fence content into a Claude Code on the web environment set to **Custom**, run a cloud session, and confirm `/bkit-debug`'s `context=web` block returns results instead of `HTTP 000` and the GitHub tracker MCP connects. This is the only check that proves Success Criterion 1 against the real egress proxy; nothing local can substitute for it.
- [ ] **Step 7 _(vendor dashboard — owner only)_ — Cursor Allowlist-only mode.** Same paste into the Cursor Cloud Agents dashboard under **Security → Allowlist only**, and confirm a background agent reaches `api.githubcopilot.com`.
