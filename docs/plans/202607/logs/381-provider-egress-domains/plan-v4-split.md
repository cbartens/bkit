<!-- bkit:anchor
baseSha: 607d7507a76c8c10eb56135c328e3daec0ed6a69
baseRef: origin/dev
designPath: docs/plans/202607/381-provider-egress-domains-design.md
designBaseSha:
-->

Verdict: PASS

<!-- verdict:end -->

# Auto-derive provider cloud-egress domains from the provider registries — Split Plan Index

> [!CAUTION]
> **This file is an INDEX, not an executable plan.** It carries no tasks, no `Done when` criteria and no gates. Every task, matrix row, gate and constraint lives in exactly one sub-plan below. Do not execute from this file.

**Sub-plans:** [`plan-v4-1.md`](plan-v4-1.md) · [`plan-v4-2.md`](plan-v4-2.md) · [`plan-v4-3.md`](plan-v4-3.md) · [`plan-v4-4.md`](plan-v4-4.md) · [`plan-v4-5.md`](plan-v4-5.md)

**Split from:** `plan-v3-checked.md` (34 tasks, 17 matrix rows, 8 phases, PASS at scope check, SPLIT at complexity check).

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
> Consequences carried through this plan: the registry is **13 rows**, not 20; the derived union is **15 bases**, not 19/20; two of the design's six named live gaps (`groq.com`, `cerebras.ai`) no longer exist and a third (`openrouter.ai`) is already shipped; and the `kimi-docs` row is dropped rather than re-added (Open Question 1).
>
> **15 is the derived-union count everywhere in this plan.** It is today's 10 plus `githubcopilot.com`, `models.dev`, `npmjs.org`, `skills.sh`, `tavily.com`. `npmjs.org` is the fifteenth and exists only because Open Question 2 resolves to option A; a builder who anchors on 14 drops it and Open Question 2's `reason` invariant becomes unmotivated. Any "14" surviving anywhere in these documents is a defect, not an alternative reading.

**Related Issues:**

- #381 — Auto-derive provider cloud-egress domains from the provider registry (open) — this plan's parent.
- #394 — Domain allowlist sync base config.md Claude Cursor OpenCode (closed) — landed the tooling ∪ consumer union, apex + `*.` expansion, the host-parsed hook check, and the three per-host encodings. Its two carried-forward items (`enrichClaudeSettingsWebFetch` additive-only; `SHIPPED_NETWORK_BASES` hand-sync) are in this plan's scope.
- #376 — Add Z.AI (GLM) Moonshot (Kimi) OpenCode providers (closed, completed) — source of the "registrable base, not raw subdomain" direction and of the rejection of consumer content driving hash-gated shipped artifacts. Its `z.ai` / `moonshot.ai` / `kimi.com` grants were since removed by #435.
- #419 — the `context=web` debug-fetch block (implemented on `dev`) — wrote the local-vs-cloud split guidance into `.agents/config.md`, `.bkit/providers.md` and `docs/observability.md` that WS-3 makes false.
- #422 (`564dfb53`) — flipped `.cursor/hooks/guardrails.cjs` to `format: "markered-text"` and added the `SHIPPED_NETWORK_BASES` ↔ `settings.json` WebFetch parity assertion that WS-4 deletes.
- #435 — IDE-vs-model-provider restructure, Phase 1 landed — cut the opencode provider allowlist from ten to four and re-pointed the shipped egress list. Sequencing risk recorded in Open Question 5.

### Narrative _(inherited from design — do not rewrite)_

As a consumer, I install bkit with whatever providers I want (`--opencode=openrouter`, a GitHub tracker, the skills registry), paste the network allowlist that `.claude/cloud.md` / `.cursor/cloud.md` generates into my Claude/Cursor dashboard once, and my cloud agent reaches every host bkit configured it to call — without me hand-declaring a single provider API host. Switching or adding a provider later needs no re-paste and no edit anywhere. My own stack domains in `.agents/config.md` stay the only thing I declare, and when I remove one it actually loses its grant.

### Success Criteria _(inherited from design — do not rewrite)_

1. After one install and one dashboard paste, a cloud session reaches every host bkit ships configuration for — including the hosts that are unreachable today — and the cloud paste block carries provider hosts even when the consumer declared no `allowed-domains`.
2. Adding or removing a provider/host source is a one-table edit: no other domain list exists in the repo, and CI fails if any of the five encoding surfaces (cloud paste, `.cursor/allowlist.json`, Claude `WebFetch`, OpenCode `curl`/`wget`, Cursor hook) misses an entry.
3. `bkit check` reports 0 writes on a clean install and a clean upgrade, for every module combination — no consumer-varying content lands in a hash-gated artifact.
4. A domain dropped from `allowed-domains`, or a host dropped from the registry, loses its `WebFetch(domain:…)` grant on the next install/upgrade; a grant the consumer added by hand is never removed.
5. Every doc that describes the allowlist states the derived-from-registry behaviour and the hook's runtime-artifact dependency, changed in the same commit as the code.

**Criterion → sub-plan:** 1 → 2, 3, 5 (proven end-to-end in 5) · 2 → 1, 5 · 3 → 4, 5 · 4 → 4 (dropped entirely if sub-plan 1's Phase 0 fails) · 5 → 2, 3, 4, 5.

## Sub-Plan Index

<!-- prettier-ignore -->
| Sub-plan | Scope | Tasks | Matrix rows owned | Requires |
| --- | --- | --- | --- | --- |
| [`plan-v4-1.md`](plan-v4-1.md) | Phase 0 blocking proof obligation + WS-1 egress registry leaf + WS-2 derivation, gate and derived exports | 1–9 (9) | T1, T2, T3, T5, T7 | nothing — this sub-plan gates every other one |
| [`plan-v4-2.md`](plan-v4-2.md) | WS-3 cloud paste surfaces (both renderers, fingerprint, nine-file doc sweep) | 10–14 (5) | T9, T12, T13 | sub-plan 1 |
| [`plan-v4-3.md`](plan-v4-3.md) | WS-4 Cursor hook (delete `SHIPPED_NETWORK_BASES`, parity-block removal, no-artifact negative case) | 15–18 (4) | T11 | sub-plan 1 |
| [`plan-v4-4.md`](plan-v4-4.md) | WS-5 Claude `WebFetch` provenance and prune (`.bkit/version` field, both write paths, recording contract) | 19–25 (7) | T8, T10, T15, T16, T17 | sub-plan 1, **including Phase 0 / Task 1 green** |
| [`plan-v4-5.md`](plan-v4-5.md) | WS-6 cross-surface fan-out proof + WS-7 release integration (dist, ledgers, mirrors, T6, Criterion 1, full gate run) | 26–34 (9) | T4, T6, T14 | sub-plans 2, 3 **and** 4 |

## Dependency Graph

```text
                    ┌──────────────────────────────┐
                    │ plan-v4-1  Tasks 1–9         │
                    │ Phase 0 + WS-1 + WS-2        │
                    │ GATES EVERYTHING             │
                    └──────────────┬───────────────┘
                                   │
       ┌───────────────────────────┼───────────────────────────┐
       │                           │                           │
┌──────▼──────────┐       ┌────────▼────────┐        ┌─────────▼─────────────┐
│ plan-v4-2       │       │ plan-v4-3       │        │ plan-v4-4             │
│ Tasks 10–14     │       │ Tasks 15–18     │        │ Tasks 19–25           │
│ WS-3 cloud      │       │ WS-4 hook       │        │ WS-5 prune            │
│                 │       │                 │        │ ⚠ DROPPED/RE-SCOPED   │
│                 │       │                 │        │   if Task 1 fails     │
└──────┬──────────┘       └────────┬────────┘        └─────────┬─────────────┘
       │                           │                           │
       └───────────────────────────┼───────────────────────────┘
                                   │
                    ┌──────────────▼───────────────┐
                    │ plan-v4-5  Tasks 26–34       │
                    │ WS-6 + WS-7                  │
                    └──────────────────────────────┘
```

**Edges, stated explicitly:**

- **`plan-v4-1` gates everything.** Nothing in sub-plans 2–5 is buildable until `BKIT_EGRESS_SOURCES`, `deriveEgressEntries`, `BKIT_SHIPPED_NETWORK_DOMAINS` (recomputed) and `BKIT_SHIPPED_NETWORK_HOSTS` exist.
- **Sub-plan 1's Phase 0 (Task 1) re-scopes sub-plan 4 entirely.** If the `.bkit/version` field does not survive a real install, Task 1's STOP path drops Tasks 19, 20, 21, 23, 24 and matrix rows T8, T10, T15 from sub-plan 4; only Task 22 and a reduced Task 28 survive, and Success Criterion 4 is reported as not met. This branch is written out in full in **both** `plan-v4-1.md` (Task 1) and `plan-v4-4.md` (scope preamble).
- **Sub-plans 2, 3 and 4 are parallel-viable** once sub-plan 1 has landed. They touch disjoint files apart from `.bkit/providers.md`, where each owns distinct, named line ranges (`:277` sub-plan 3, `:279` sub-plan 2, `:256` / `:266` / `:270-275` sub-plan 5) — deliberate, not a conflict.
- **Sub-plan 5 requires 2, 3 and 4.** Task 26's five-surface fan-out cannot be green until every surface is wired; Task 32's T6 cannot be green until the single `bkit install` regenerates the mirror the hook edit in sub-plan 3 left stale.

**Anchor-shift hazard, carried into sub-plans 1, 4 and 5:** Task 3 (sub-plan 1) deletes `OPENCODE_PROVIDER_DEFAULTS` at `.bkit/src/bkit-modules.ts:1461-1518` — 58 lines — so every anchor **after** `:1461` shifts by roughly 57 lines. Sub-plans 4 and 5 carry post-`:1461` work (`enrichClaudeSettingsWebFetch`, `injectOpencodeNetworkCurlAllows`) and must resolve those by symbol name, never by line range. The warning is restated verbatim in the standing rules of every sub-plan.

## Task → Sub-Plan Map

<!-- prettier-ignore -->
| Task | Title (abbrev.) | Sub-plan | Phase |
| --- | --- | --- | --- |
| 1 | 🛑 BLOCKING: prove a `.bkit/version` field survives a real install | `plan-v4-1.md` | Phase 0 |
| 2 | Create `.bkit/src/bkit-registry.ts` as a pure-data leaf | `plan-v4-1.md` | Phase 1 / WS-1 |
| 3 | Move `OPENCODE_PROVIDER_DEFAULTS` into the leaf | `plan-v4-1.md` | Phase 1 / WS-1 |
| 4 | Author `BKIT_EGRESS_SOURCES` (13 rows) + denylists + absences | `plan-v4-1.md` | Phase 1 / WS-1 |
| 5 | Implement the proposer and `isIpLiteral` | `plan-v4-1.md` | Phase 2 / WS-2 |
| 6 | Implement the gate + `.dev`/`.app`/`.run` soft warning | `plan-v4-1.md` | Phase 2 / WS-2 |
| 7 | Export `deriveEgressEntries`; recompute both derived exports | `plan-v4-1.md` | Phase 2 / WS-2 |
| 8 | Completeness and suffix-invariant tests | `plan-v4-1.md` | Phase 2 / WS-2 |
| 9 | Negative / rejection-channel tests | `plan-v4-1.md` | Phase 2 / WS-2 |
| 10 | Switch `renderCloudNetworkAllowlist`; delete the Trusted branch | `plan-v4-2.md` | Phase 3a / WS-3 |
| 11 | Rewrite `renderCursorNetworkAllowlist`; delete its zero-declared branch | `plan-v4-2.md` | Phase 3a / WS-3 |
| 12 | Emit the 8-hex fingerprint after the closing fence | `plan-v4-2.md` | Phase 3a / WS-3 |
| 13 | Re-anchor the three existing tests WS-3 breaks | `plan-v4-2.md` | Phase 3a / WS-3 |
| 14 | WS-3 docs, same commit — nine files | `plan-v4-2.md` | Phase 3a / WS-3 |
| 15 | Delete `SHIPPED_NETWORK_BASES` from the hook template | `plan-v4-3.md` | Phase 3b / WS-4 |
| 16 | Rewrite the now-false `_reason` at `slop-scan.config.json:184` | `plan-v4-3.md` | Phase 3b / WS-4 |
| 17 | Delete the parity block; add the hook's no-artifact negative case | `plan-v4-3.md` | Phase 3b / WS-4 |
| 18 | WS-4 docs, same commit | `plan-v4-3.md` | Phase 3b / WS-4 |
| 19 | Land the `.bkit/version` field properly | `plan-v4-4.md` | Phase 3c / WS-5 |
| 20 | Thread the install write path | `plan-v4-4.md` | Phase 3c / WS-5 |
| 21 | Thread the upgrade write path | `plan-v4-4.md` | Phase 3c / WS-5 |
| 22 | Empty the `WebFetch(domain:…)` seed; own the two uninstall tests | `plan-v4-4.md` | Phase 3c / WS-5 |
| 23 | Implement the prune, recording contract and advisory | `plan-v4-4.md` | Phase 3c / WS-5 |
| 24 | Provenance-survives-a-real-install test | `plan-v4-4.md` | Phase 3c / WS-5 |
| 25 | WS-5 docs, same commit | `plan-v4-4.md` | Phase 3c / WS-5 |
| 26 | Five-surface fan-out parity test (new integration file) | `plan-v4-5.md` | Phase 4 / WS-6 |
| 27 | Prove the two unchanged code paths; no second domain list survives | `plan-v4-5.md` | Phase 4 / WS-6 |
| 28 | `bkit check` reports 0 writes on clean install and clean upgrade | `plan-v4-5.md` | Phase 4 / WS-6 |
| 29 | WS-6 docs, same commit — three spots in `.bkit/providers.md` | `plan-v4-5.md` | Phase 4 / WS-6 |
| 30 | Build and commit `dist/`, including `dist/bkit-registry.js` | `plan-v4-5.md` | Phase 5 / WS-7 |
| 31 | Verify the ledger rows | `plan-v4-5.md` | Phase 5 / WS-7 |
| 32 | Regenerate mirrors once, write T6, verify install and upgrade live | `plan-v4-5.md` | Phase 5 / WS-7 |
| 33 | Confirm Success Criterion 1 end-to-end; disposition OQ 1–7 | `plan-v4-5.md` | Phase 5 / WS-7 |
| 34 | Run the full local gate set | `plan-v4-5.md` | Phase 5 / WS-7 |

**Count check:** 9 + 5 + 4 + 7 + 9 = **34**, matching the master exactly. No task appears twice; no task is unplaced.

## Matrix Row → Sub-Plan Map

<!-- prettier-ignore -->
| Row | Owning task | Sub-plan |
| --- | --- | --- |
| T1 completeness | Task 8 | `plan-v4-1.md` |
| T2 suffix invariant | Task 8 | `plan-v4-1.md` |
| T3 anti-widening gate | Task 6 | `plan-v4-1.md` |
| T4 five-surface fan-out | Task 26 | `plan-v4-5.md` |
| T5 injected source | Task 7 | `plan-v4-1.md` |
| T6 hook byte parity (NEW test) | Task 32 | `plan-v4-5.md` |
| T7 negative / rejection channel | Task 9 | `plan-v4-1.md` |
| T8 prune round-trip + recording contract | Task 23 | `plan-v4-4.md` |
| T9 fingerprint placement + stability | Task 12 | `plan-v4-2.md` |
| T10 provenance survives a real install | Task 24 | `plan-v4-4.md` |
| T11 hook with no artifact asks | Task 17 | `plan-v4-3.md` |
| T12 retired zero-declared branches | Task 13 | `plan-v4-2.md` |
| T13 Cursor exact-host surface | Task 11 | `plan-v4-2.md` |
| T14 `bkit check` 0 writes | Task 28 | `plan-v4-5.md` |
| T15 drift signal survives `dryRun` | Task 23 | `plan-v4-4.md` |
| T16 parser default `[]` | Task 19 | `plan-v4-4.md` |
| T17 upgrade-path persistence, both writers | Task 21 | `plan-v4-4.md` |

**Count check:** 5 + 3 + 1 + 5 + 3 = **17**, matching the master exactly.

## Gate → Sub-Plan Map

<!-- prettier-ignore -->
| Master gate | Placed in | Note |
| --- | --- | --- |
| 👤 Acceptance Scenario confirmation | every sub-plan | One plan-level human confirmation, restated in each sub-plan because the brief requires human-gate sections to be repeated rather than cross-referenced. Ticking it once for the split is ticking it for all five. |
| 👤 Breaking Changes confirmation | every sub-plan | Same. |
| 👤 Open Questions & Assumptions confirmation | every sub-plan | Same. |
| 🔒 Gate 1: Prerequisites Check (5 master items) | `plan-v4-1.md`, verbatim | Sub-plans 2–5 carry an **additionally authored** child-scoped Gate 1 whose items are their own predecessor preconditions — new content, not a copy of the master's five items. |
| 🔒 Gate 2: Code Implementation Check (9 master items) | `plan-v4-5.md`, verbatim | Every item asserts across all 34 tasks (matrix mapping in both directions, `--hidden` sweeps, anchor-shift, source-only edits), so it is only verifiable from the last sub-plan. |
| 🔒 Gate 2 Mandatory Tasks (Testing & Documentation, 5 items) | `plan-v4-5.md`, verbatim | Same reason. |
| 🔒 Gate 3: Testing & Documentation Check | `plan-v4-5.md`, verbatim | Same reason. |
| 🔒 Gate 4: Automated Verification Check | `plan-v4-5.md`, verbatim | Same reason. Sub-plans 1–4 carry an authored per-workstream Gate 4 covering only their own automated checks. |

## Non-Task Content Partition

Everything the master carried that is not a task, matrix row or gate was placed as follows. Rows are partitioned by the sub-plan that must act on them; blocks marked **repeated** are shared context that more than one sub-plan needs and are copied verbatim rather than cross-referenced.

<!-- prettier-ignore -->
| Master section | Partition |
| --- | --- |
| Edge Cases (18 rows) | 1 → 5 rows (registry/derivation) · 2 → 2 · 3 → 1 · 4 → 9 · 5 → 1 |
| Breaking Changes — naming table (12 rows) | 1 → 8 (registry, derivation, exports, relocation) · 4 → 4 (`enrichClaudeSettingsWebFetch`, `updateCanonicalHashesAfterUpgrade`, `webFetchDerived`, `webfetch-grants-pruned`) |
| Breaking Changes — file/content table (8 rows) | 2 → 2 · 3 → 2 · 4 → 3 · 5 → 1 |
| Open Questions (7) | 1 → OQ1, OQ2, OQ3, OQ4, OQ5 · 2 → OQ6 · 5 → OQ7 (dispositioned by Task 33) |
| Assumptions (7) | 1 → 2 · 3 → 1 · 4 → 4 (including the `CORRECTED 2026-08-26` uninstall-test assumption) |
| Ground-truth citation delta (49 rows) | Partitioned by symbol; the three `.bkit/version` writer rows and the live-gap row are **repeated** in the sub-plans that need them |
| Data Schema Integration | 4, in full · the `Invariant Conformance — corrected 2026-08-26` three-writer table is **repeated** in 1 (Task 1 depends on it) |
| Architecture & Component Changes | 1 → Registry (WS-1) + Derivation (WS-2) · 2 → WS-3 · 3 → WS-4 · 4 → WS-5 · 5 → WS-6 |
| Supersession Inventory (7 rows) | 1 → 1 · 2 → 3 · 3 → 2 · 4 → 1 |
| Documentation Updates (16 rows) | 1 → 1 · 2 → 8 · 4 → 2 · 5 → 4 · the `.bkit/providers.md` row is **repeated** in 2, 3 and 5, which own its four distinct sections |
| Out of Scope (9 rows) | 1 → 2 · 2 → 1 · 3 → 1 · 4 → 2 · 5 → 3 (plus the ledger-accounting CAUTION) |
| Security & Privacy | 1 → User Input, New Secret/Env, deliberate widening · 3 → the Cursor fail-closed bound · 4 → PII · 5 → Grant lifecycle asymmetry |
| Rollback Strategy (6 rows) | 5, in full; sub-plans 1–4 carry an authored workstream-scoped rollback note |
| Verification Plan / Automated Tests (11 bullets) | Partitioned per test file; three bullets that name rows in two sub-plans were **split by row**, noted below |
| Manual Verification (8 steps) | 2 → Steps 3b, 5 · 3 → Step 4 · 4 → Step 3 · 5 → Steps 1, 2, 6, 7 |
| Alternative Approaches (11 rows), Suggested Scope Expansion (13 rows) | Retained here in the index — advisory rationale, explicitly not scope, and no sub-plan needs it to execute |
| `No Architectural Downgrades` warning block | **Repeated verbatim in all five sub-plans** — its five named prohibitions land in four different sub-plans and a partial copy would read as permission |

**Partition-forced changes, disclosed:** three `Verification Plan` bullets named test files whose rows straddle a seam and were split by row, with no wording change to any row: `bkit-cloud-env.test.ts` (T1/T2/T3/T5/T7 → sub-plan 1; T9/T12/T13 → sub-plan 2), `bkit-upgrade.integration.test.ts` (T17 → sub-plan 4; T14 → sub-plan 5), `bkit-guardrails-cursor.integration.test.ts` (T11 → sub-plan 3; T6 → sub-plan 5). No `Done when` was altered, merged or split.

## Alternative Approaches & Recommendations _(rationale retained — advisory)_

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

## Suggested Scope Expansion _(candidates, NOT scope)_

<!-- prettier-ignore -->
| Candidate | Source | Overlaps | Recommendation |
| --- | --- | --- | --- |
| Derive the CLI provider allowlist and the display/effort column maps from the new leaf, plus a key-set parity test over every mirror | `docs/deferrals.jsonl` key `381-provider-registry-key-mirror-consolidation` | WS-1 exactly — the deferral names `.bkit/src/bkit-registry.ts` as the home this change creates, and `bkit-cli.ts:40` carries the same `keep in sync with …` comment pattern this issue exists to remove | **Keep deferred.** Doubles the change's blast radius onto the CLI parse surface, and is far cheaper once the leaf exists. Revisit immediately after this lands. |
| `bkit upgrade` writes `.bkit/advisories.md` | `docs/deferrals.jsonl` key `381-upgrade-does-not-write-advisories-artifact` (new, this plan) | WS-5's removal-record contract — folding it in would make destination (2) apply on the upgrade path too | **Keep deferred.** Needs the upgrade branch's finalisation restructured; the prune is durable via `git diff` on every path without it. |
| Provenance-aware `bkit uninstall` for derived `WebFetch` grants — **premise corrected** | `docs/deferrals.jsonl` key `381-webfetch-grants-survive-uninstall-after-seed-emptied` (same-`key` correction appended by the review pass) | WS-2's widened base set is what creates the gap, **not** WS-5's emptied seed | **Needs design decision.** The gap is that `bkit-uninstall.ts:589` deletes by recomputation and cannot see provenance; `webFetchDerived` is exactly the record it would need. Weigh it against the corrected premise, not the v1 one. |
| Extend the WS-5 prune to the OpenCode `permission.bash` surface | `docs/deferrals.jsonl` key `381-opencode-bash-grants-never-revoked` (NEW) | WS-5's recording contract and WS-6's "unchanged code path" claim | **Keep deferred** (Open Question 7 = B). Needs a second provenance record on `.opencode/opencode.json` and a second recording contract; folding it in doubles the WS-5 review surface. |
| One revocation contract every surface implements, asserted by a single parity test | Review lens: regression risk. Generalises `381-opencode-bash-grants-never-revoked` | The five-surface fan-out (T4) proves **presence** parity; nothing proves **absence** parity | **Keep deferred.** Belongs beside `docs/deferrals.jsonl` key `381-unified-runtime-allowlist-artifact-all-hosts`; it is a cross-surface contract, not a derivation change. |
| `bkit uninstall` round-trip regression test | Review lens: regression risk | `Edge Cases` row for the widened uninstall strip scope — it would convert that disclosure into a guard | **Keep deferred.** Not required by any Success Criterion; `bkit-uninstall.test.ts:719-749` already exercises the path against the live template. Cheap once the provenance-aware uninstall above is decided, and premature before it. |
| `docs/knowledge.jsonl` row for the uninstall recompute mechanism (`bkit-uninstall.ts:583-598`) | Review lens: tightness | Nothing in this plan's build tasks | **Worth doing, but not here.** Two independent artefacts — the parent design and this plan's v1 draft — both missed it and both drew a wrong conclusion. A one-line gotcha row would stop the third. It is a ledger write about pre-existing behaviour, not part of this change. |
| Refresh the dated live-probe stamps in `.bkit/providers.md` | `docs/deferrals.jsonl` key `providers-md-dated-live-probe-stamps` | WS-3/WS-4/WS-6 all edit `.bkit/providers.md`, in three distinct sections | **Keep deferred.** Different section, different failure mode (stale model pins, not stale allowlist prose); bundling it would violate scope discipline. |
| Verify the `Bash(git push --force *)` matcher shape on the Claude surface | `related-issues.md` #394 | WS-5 edits `.bkit/templates/.claude/settings.json`, the same file | **Keep deferred.** A different permission axis, and settling it needs a live Claude Code matcher probe, not a code change. |
| Give `json.schemastore.org` a `docs`-kind registry row | Review lens: tightness; interacts with Open Question 1 = A | WS-1's `EgressSource["kind"]` union | **Keep deferred.** The plan's reasoning holds (editor JSON language server, never an agent tool call). Noted only because deleting the variant makes a later reversal a type change rather than a row addition. |
| Feed the upgrade-path enrich/prune writes into `canonicalHashes` | Review lens: regression risk (`bkit-install.ts:2615-2624` vs the `enrichWs` writes at `:2587-2593`) | Nothing in this plan — pre-existing, harmless for `format: "json"` files decided by `deepContains` | **Keep deferred.** Same install-vs-upgrade finalisation asymmetry as `381-upgrade-does-not-write-advisories-artifact`; it belongs in that issue. |
| A plan-time repo test over `Done when` greps in template-shaped runbooks | Scope-check lens: three unreachable-criterion defects of the same shape in this plan alone | Nothing in this plan's build tasks — bkit **workflow tooling** | **Worth doing, but not here, and not as a `381-*` deferral.** Belongs in a bkit tooling/friction issue with its own scope. |
| Deduplicate the `debug-fetch:tavily` skip breadcrumb, carried twice in `.agents/config.md` (`:260` in-block, `:391` dogfood) | Scope-check lens: found while giving `:391` an owner | Task 14 now edits **both** copies, so this plan leaves them correct-but-still-duplicated | **Keep deferred.** Repo hygiene on bkit's own dogfood config, not an egress change. |

> [!CAUTION]
> **Candidates, not scope.** Entries are surfaced for human review; they do NOT become sub-plan tasks and MUST NOT expand scope.
