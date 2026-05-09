Verdict: CONCERNS
<!-- verdict:end -->

# BAR-167 — Template Ownership via Markers + JSON Containment (drop `__bkit__` envelope) Implementation Plan

> [!CAUTION]
> **CRITICAL:** Do not hallucinate plan execution state.
>
> 1. ALWAYS read this `plan.md` natively via `read_file` before executing any step.
> 2. NEVER trust system-generated session summaries or previous conversation history to determine what has been completed.
> 3. Source of truth is EXCLUSIVELY the literal `[x]` vs `[ ]` checkboxes in this physical document.

---

## Context & Goals

bkit v0.8.0 introduced a `__bkit__` JSON envelope (DE-7/DE-8, BAR-131/142) to give bkit a stable ownership record inside Tier-2 JSON files (`.claude/settings.json`, `.cursor/hooks.json`). A consumer audit on 2026-05-09 (app-gether-life + visitfrasercoast-com against v1.1.1) surfaced two real-world failure modes:

1. `.cursor/hooks.json` ships duplicated content — once inside `__bkit__`, once at the top level — because Cursor only reads the top-level keys but bkit's drift detection only inspects the envelope. Eight conversation turns were needed to explain the design to the user.
2. `.github/workflows/ci.yml` had silently lost its `pnpm bkit check` step — a drift class Tier-3's "advisory only" model never caught.

The redesign in BAR-167 collapses the artificial Tier 1/2/3 distinction into one rule:

> Every template file in `.agents/templates/` declares a **bkit-owned scope**. The consumer file must contain that scope intact. Everything outside is consumer territory.

Format mapping:

<!-- prettier-ignore -->
| Format | Bkit scope = | Drift check |
| --- | --- | --- |
| Text with `bkit:start..bkit:end` markers | Content between markers | Block byte-equal |
| Text without markers | Entire template | Whole-file byte-equal |
| JSON | Entire template's deep tree | Deep containment (template ⊆ consumer) |
| Empty scope | Nothing (consumer fully owns) | No check (advisory only) |

This plan is the **Phase 1** ship (drop the JSON envelope) released as **bkit v2.0.0** under the Major-Change contract reversal of DE-7/DE-8. Phase 2 (extend marker coverage to Tier 1/3 files) and Phase 3 (terminology cleanup) are scoped and time-boxed at the bottom of this plan; they can ship as v2.0.x patches if Phase 1 is large enough that the complexity-check forces a split.

**Success Criteria:**

- `pnpm bkit check` on a clean v2.0.0 install reports zero drift advisories for `.cursor/hooks.json` and `.claude/settings.json`.
- Upgrade-survival regression: consumer keys `hooks.Stop`, `failClosed`, `loop_limit` survive byte-identical across the v0.5.x → v0.8.x → v2.0.0 chain. The v0.5.x → v0.8.x leg is exercised by replaying the existing `migrateTier1JsonToTier2` fixture _before_ that helper is deleted in this PR (i.e. the fixture is captured at its v0.8.x post-state and committed as a static input for the v0.8.x → v2.0.0 leg). The v0.8.x → v2.0.0 leg uses a new sibling fixture `tests/fixtures/heavy-customised-consumer-v1-envelope/` that captures the live `__bkit__` envelope + top-level mirror + consumer additions on disk.
- A pre-v2.0.0 consumer with `__bkit__` at top level migrates cleanly on first `bkit upgrade`: envelope stripped, top-level keys retained, `bkit check` green afterward.
- Net code reduction ≥ 200 LOC after deletions in `.agents/scripts/` and `.agents/templates/` (tracked at PR review).

---

## 👤 ⚠️ Acceptance Scenario — HUMAN REVIEW REQUIRED

> [!CAUTION]
> **🛑 HUMAN MUST READ AND CONFIRM THIS SECTION.**
> This is the testable contract for the feature. Everything below is derived from what you confirm here.

### Narrative _(plan-defined — no parent design)_

A consumer that installed bkit ≤ v1.1.1 runs `pnpm bkit upgrade` to v2.0.0. On the next install, the legacy `__bkit__` envelope in `.claude/settings.json` and `.cursor/hooks.json` is stripped, the templates ship as schema-clean JSON, and `pnpm bkit check` reports zero drift. The consumer's locally-added keys (`hooks.Stop`, `failClosed`, `loop_limit`, etc.) survive byte-identical, and the bkit-owned subtree (`hooks.SessionStart`, `hooks.sessionStart`, `hooks.sessionStop`) is enforced as a **deep-containment** subset rather than as an envelope-vs-mirror duplication.

### Success Criteria _(plan-defined)_

1. After upgrading from v0.8.0–v1.1.1 to v2.0.0, `pnpm bkit check` exits 0 with zero drift advisories for `.cursor/hooks.json` and `.claude/settings.json`. (Pre-v0.8.0 direct upgrades — see Edge Cases — are blocked at preflight with an explicit advisory.)
2. `.cursor/hooks.json` template ships in Cursor v1 keyed-object schema (`hooks: { sessionStart: [...], sessionStop: [...] }`) — single-source — with no `__bkit__` key.
3. `.claude/settings.json` template ships top-level keys only, with no `__bkit__` key.
4. Consumer-added top-level keys + nested keys outside the template's deep tree (e.g. `hooks.Stop` in `.claude/settings.json`, `failClosed`, `loop_limit`) survive a v0.5.x → v0.8.x → v2.0.0 upgrade chain byte-identical. The v0.5.x → v0.8.x leg is exercised against the existing `tests/fixtures/heavy-customised-consumer/` fixture; the v0.8.x → v2.0.0 leg is exercised against the new sibling fixture `tests/fixtures/heavy-customised-consumer-v1-envelope/` (envelope-on-disk shape). See Runbook Task 0c.
5. Net deletion of ≥ 200 LOC across `.agents/scripts/` and `.agents/templates/` (`applyBkitNamespace`, `extractBkitNamespace`, `migrateTier1JsonToTier2`, the envelope branch of `writeTier2Json`, and `bkit-tier1-defaults.ts` plus its test fixture; plus envelope blocks in the two Tier-2 templates).

### Concrete Example

**Setup:** A consumer repo on bkit `v1.1.1` (`.cursor/hooks.json` contains the `__bkit__` envelope and a duplicate top-level `hooks` array; `.claude/settings.json` contains the `__bkit__` envelope plus consumer-added `hooks.Stop` and `failClosed` keys).

**Steps:**

1. Consumer bumps `@cbartens/bkit` to `^2.0.0` and runs `pnpm install`.
2. Consumer runs `pnpm bkit upgrade` → bkit detects `__bkit__` at top level of both Tier-2 JSON files, strips it, runs `deepContains(template, postStripConsumer)`; if absent (rare — only if consumer manually deleted top-level mirror) bkit deep-merges the template into the file.
3. bkit logs once per file: `[bkit] migrated .cursor/hooks.json — stripped __bkit__ envelope (v2.0.0)` and `[bkit] migrated .claude/settings.json — stripped __bkit__ envelope (v2.0.0)`.
4. Consumer runs `pnpm bkit check` → exits 0, zero drift advisories.
5. Consumer commits the upgraded files; in git diff, the `__bkit__` block is gone, the consumer's `hooks.Stop` and `failClosed` keys remain byte-identical.

**Outcome:** `.cursor/hooks.json` and `.claude/settings.json` are now schema-clean per their respective tools' canonical schemas. Every subsequent `bkit check` run validates by deep-containment alone. No bookkeeping key, no top-level/inner duplication.

### Edge Cases

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| Consumer file is fresh-install on v2.0.0 (no `__bkit__` ever existed) | Template written as-is; `bkit check` zero-drift. |
| Consumer file contains `__bkit__` and the post-strip top-level keys are missing the template's deep tree | Migration emits a deep-merge so template scope is restored, then logs the migration. Idempotent: re-running migration is a no-op. |
| Consumer file has `__bkit__` but the bkit subtree is invalid JSON | Fallback to overwrite with template (matching today's "malformed JSON" branch in `writeTier2Json`); `migrate` logs and returns. |
| Consumer adds keys nested **inside** template-owned objects (e.g. `hooks.SessionStart` extra entry) | `deepContains` passes because every template element is present; consumer's extra elements are tolerated. |
| Consumer adds keys outside the template tree (`hooks.Stop`, `failClosed`, `loop_limit`) | Survive byte-identical; not in template tree → not bkit's business. |
| `.cursor/hooks.json` template ships keyed-object schema; consumer locks Cursor to a build that only accepts the legacy flat-array schema | Out-of-scope for this plan — confirmed in DE-7 spike that current Cursor builds accept the keyed form. (Pre-flight task verifies the spike still holds.) |
| Array-of-objects element ordering varies between template and consumer (e.g. `hooks.SessionStart` reordered by consumer) | `deepContains` for object-arrays uses **order-insensitive deep-equal element-wise containment** — passes. (See P1.T1 array-containment rule.) |
| Pre-v2.0.0 consumer runs `bkit check` (read-only) before running `bkit upgrade` | Advisory `legacy-bkit-envelope-detected` surfaces with action `pnpm bkit upgrade`. No blocker — `bkit check` exits 0. |
| Consumer deleted the template's deep tree entirely (envelope stripped manually pre-v2.0.0; no top-level mirror) | First `bkit upgrade` deep-merges template → file restored to a containing state. |
| Consumer added a top-level `__bkit__` key for **their own purpose** post-upgrade | Out-of-scope: the migration runs once per file; subsequent `bkit check` ignores top-level `__bkit__` because `deepContains` only walks the template tree. We accept the rare collision risk and document it in `docs/knowledge.md`. |
| **Schema-flip on type-mismatched same-path values** (e.g. consumer has `hooks: [{event,command}, ...]` flat array while v2.0.0 template ships `hooks: { sessionStart: [...], sessionStop: [...] }` keyed object) | `writeTier2JsonContained` detects type-flip during deep-merge: when template and consumer values at the same path are different JSON kinds (object vs array, primitive vs object, etc.), template wins (i.e. consumer value is overwritten by template). The pre-strip `__bkit__` envelope is the canonical source for the keyed-object data, so the flat-array `hooks` is dropped (it was a duplicate of the envelope contents). This case **must** also be reported by `migrateLegacyBkitEnvelope` as `{ stripped: true, deepMerged: true, schemaFlipped: true }` and logged as `[bkit] migrated <file> — schema flip applied (flat-array hooks → keyed-object) (v2.0.0)`. |
| **Pre-v0.8.0 consumer (Tier-1 flat shape, no envelope) runs `bkit upgrade` directly to v2.0.0** | Preflight blocker `pre-envelope-bkit-version-detected`: the consumer's last-recorded `pinnedVersion` in `.bkit-version` is `< 0.8.0` AND the consumer file lacks `__bkit__` at top level. Action: `Upgrade through bkit v1.x first (e.g. \`pnpm add @cbartens/bkit@^1.1.1\` then \`pnpm bkit upgrade\`) before stepping to v2.0.0.` This avoids the silent schema-flip / data-loss path that would otherwise occur if the v0.5.x–v0.7.x flat-array `hooks` was deep-merged against the v2.0.0 keyed-object template. |
| Consumer's `.bkit-version` is missing entirely (fresh repo or hand-edited) and the consumer file lacks `__bkit__` | Treated as fresh install — template written as-is; the `pre-envelope-bkit-version-detected` blocker does NOT fire when no `pinnedVersion` is on record. |
| `deepContains` invoked with `null` template or `null` consumer at any path | `template === null` and `consumer === null` → ok=true. `template === null` and `consumer !== null` → ok=true (consumer is a superset of "nothing"). `template !== null` and `consumer === null` → ok=false; `missing` lists the pathPrefix. Covered by an explicit boundary test row. |

### Derived Test Matrix

> Each row → one Agent Execution Runbook task.

<!-- prettier-ignore -->
| Test description | Type | Target file |
| --- | --- | --- |
| `deepContains` returns ok=true when consumer is a superset of template (objects nested 4 levels) | Unit (Vitest) | `.agents/scripts/bkit-tiers.test.ts` |
| `deepContains` returns ok=false with `missing` paths when a template key is absent | Unit (Vitest) | `.agents/scripts/bkit-tiers.test.ts` |
| `deepContains` returns ok=false with `mismatched` paths when a leaf primitive value differs | Unit (Vitest) | `.agents/scripts/bkit-tiers.test.ts` |
| `deepContains` array-of-primitives uses subset semantics (template ⊆ consumer) | Unit (Vitest) | `.agents/scripts/bkit-tiers.test.ts` |
| `deepContains` array-of-objects uses order-insensitive deep-equal element-wise containment | Unit (Vitest) | `.agents/scripts/bkit-tiers.test.ts` |
| `deepContains` mixed-array (primitives + objects in same array) uses element-wise per-element-type semantics; `missing` reports element index path | Unit (Vitest) | `.agents/scripts/bkit-tiers.test.ts` |
| `deepContains` null-input boundary cases: (null,null)→ok; (null,obj)→ok; (obj,null)→missing path | Unit (Vitest) | `.agents/scripts/bkit-tiers.test.ts` |
| `writeTier2JsonContained` writes template as-is when destination missing | Unit (Vitest) | `.agents/scripts/bkit-tiers.test.ts` |
| `writeTier2JsonContained` deep-merges and idempotents on re-run with identical state | Unit (Vitest) | `.agents/scripts/bkit-tiers.test.ts` |
| `writeTier2JsonContained` schema-flip: type-mismatched same-path values (consumer `hooks: [...]` array vs template `hooks: {...}` object) → template wins, consumer value overwritten | Unit (Vitest) | `.agents/scripts/bkit-tiers.test.ts` |
| `migrateLegacyBkitEnvelope` strips `__bkit__`, retains top-level keys, deep-merges template if absent | Unit (Vitest) | `.agents/scripts/bkit-tiers.test.ts` |
| `migrateLegacyBkitEnvelope` reports `schemaFlipped: true` when post-strip top-level value type-flips against template | Unit (Vitest) | `.agents/scripts/bkit-tiers.test.ts` |
| Pre-v2.0.0 fixture (`__bkit__` + top-level mirror) → upgrade → file matches schema-clean snapshot | Integration (Vitest) | `.agents/scripts/bkit-modules.upgrade.integration.test.ts` |
| Upgrade chain v0.5.x → v0.8.x → v2.0.0 preserves `hooks.Stop`, `failClosed`, `loop_limit` byte-identical (chain replays existing v0.5.x→v0.8.x fixture into the new v0.8.x→v2.0.0 envelope fixture) | Integration (Vitest) | `.agents/scripts/bkit-modules.upgrade.integration.test.ts` |
| Heavy-customised consumer fixture (BAR-131 sub-plan-2) survives v2.0.0 upgrade with bkit scope intact | Integration (Vitest) | `.agents/scripts/bkit-modules.upgrade.integration.test.ts` |
| `bkit check` advisory `legacy-bkit-envelope-detected` surfaces on pre-v2.0.0 consumer fixture | Integration (Vitest) | `.agents/scripts/bkit-modules.integration.test.ts` |
| `bkit check` advisory `tier2-json-drift` (new) surfaces when consumer file is missing a template key (deep-containment failure) | Integration (Vitest) | `.agents/scripts/bkit-modules.integration.test.ts` |
| `bkit check` blocker `pre-envelope-bkit-version-detected` surfaces when on-disk `.bkit-version.pinnedVersion < 0.8.0` and no `__bkit__` envelope present | Integration (Vitest) | `.agents/scripts/bkit-modules.integration.test.ts` |
| `bkit doctor` integration: drift advisory and `legacy-bkit-envelope-detected` surface through doctor verb (verifies preflight reuse) | Integration (Vitest) | `.agents/scripts/bkit-doctor.integration.test.ts` |
| `bkit uninstall --claude` on a v2.0.0 consumer file strips template scope but retains consumer-added keys (`hooks.Stop`, `failClosed`) — verifies manifest tier reclassification (see C1) | Integration (Vitest) | `.agents/scripts/bkit-modules.integration.test.ts` |
| `bkit uninstall --cursor` on a v2.0.0 consumer file strips template scope (template's `hooks.sessionStart` / `hooks.sessionStop` keys removed) but retains consumer-added top-level + nested keys outside the template tree — verifies manifest tier reclassification applies bidirectionally | Integration (Vitest) | `.agents/scripts/bkit-modules.integration.test.ts` |
| Cursor v1 keyed-object schema spike: parsed template loads cleanly under both legacy and v1 Cursor schema validators | Unit (Vitest) | `.agents/scripts/bkit-tiers.test.ts` (new `cursor-v1-schema.test.ts` block) |

### 👤 ✅ Human Confirmation

- [x] **Acceptance Scenario confirmed:** I have reviewed the Narrative, Success Criteria, Concrete Example, Edge Cases, and Derived Test Matrix above. They correctly describe what "done" looks like. *(2026-05-09 — superseded by re-run; see issue addendum)*

> [!NOTE]
> The header verdict at the top of this file (`PASS|CONCERNS|FAIL`) is the **plan-review** verdict, set by the auto-review pipeline. It is **independent** from this human-confirmation checkbox. A build agent must verify both: (a) the header is `PASS`, AND (b) this checkbox is `[x]`. The header `PASS` does NOT auto-tick this box.

> [!CAUTION]
> **Agent:** Do NOT pass Gate 1 until this checkbox is `[x]`. Summary must issue `REVISE` if unchecked.

---

## 👤 ⚠️ Breaking Changes & Naming Review — HUMAN REVIEW REQUIRED

> [!CAUTION]
> **🛑 HUMAN MUST READ AND CONFIRM THIS SECTION.**

### Breaking changes (bkit v2.0.0)

1. **`__bkit__` envelope removed** from `.agents/templates/.claude/settings.json` and `.agents/templates/.cursor/hooks.json`. Tier-2 JSON ownership now uses **deep containment**: every template path must be present (deep-equal) in the consumer file. Reverses DE-7 and DE-8.
2. **Public API surface deletions** — these symbols are exported from `.agents/scripts/bkit-tiers.ts` and consumed by tests / `.agents/scripts/bkit-modules.ts`:
   - `applyBkitNamespace`
   - `extractBkitNamespace`
   - `migrateTier1JsonToTier2`
   - Envelope branch of `writeTier2Json` (function renamed; signature unchanged)
   - `BKIT_TIER1_DEFAULTS_BY_VERSION` (and its file `.agents/scripts/bkit-tier1-defaults.ts`)
3. **`writeTier2Json` rename → `writeTier2JsonContained`** in `.agents/scripts/bkit-tiers.ts`. Callers in `.agents/scripts/bkit-modules.ts` updated.
4. **`.cursor/hooks.json` template schema migrated** from legacy flat-array (`hooks: [...]`) to **Cursor v1 keyed-object** (`hooks: { sessionStart: [...], sessionStop: [...] }`). DE-7 spike confirmed acceptance; pre-flight repeats the spike before merge.
5. **Migration mechanic** — `bkit upgrade` post-v2.0.0 runs `migrateLegacyBkitEnvelope` once per consumer file. Idempotent. Logs `[bkit] migrated <file> — stripped __bkit__ envelope (v2.0.0)`.
6. **`bkit-manifest.ts` tier reclassification** — `.claude/settings.json` and `.cursor/hooks.json` entries flip from `tier: 1` (the pre-v0.8.0 classification that was never updated) to `tier: 2`. This aligns the manifest with the Tier-2 deep-containment mechanic introduced here and prevents `bkit uninstall --claude` / `--cursor` from unconditionally deleting the entire file via the `case 1` branch in `bkit-uninstall.ts` (lines 156–165). Without this fix, `uninstall` would destroy consumer-added keys (`hooks.Stop`, `failClosed`, etc.).
7. **CHANGELOG.md** v2.0.0 entry: `BREAKING — __bkit__ envelope removed; consumer files auto-migrated on first upgrade. Tier-2 JSON manifest entries reclassified (uninstall now strip-merges instead of deleting). See KN-9 / DE-16.`

### Naming decisions

- New unit primitive: **`deepContains(template: JsonValue, consumer: JsonValue): { ok: boolean; missing: string[]; mismatched: string[] }`** in `.agents/scripts/bkit-tiers.ts`.
- New top-level helper: **`writeTier2JsonContained(srcPath, dstPath, dryRun, ws)`** — replaces envelope branch.
- New migration helper: **`migrateLegacyBkitEnvelope(doc: JsonValue, template: JsonValue): { stripped: boolean; deepMerged: boolean; schemaFlipped: boolean; outDoc: JsonValue }`** — replaces `migrateTier1JsonToTier2`. **Pure JSON utility — no file I/O, no `getPkgRoot()` import.** Caller in `bkit-modules.ts` handles file read/parse/write + template resolution. (Names "Tier-1" intentionally avoided — Phase 3 retires that vocabulary.)
- New decision entry: **`DE-16: BAR-167 — Drop __bkit__ envelope; adopt format-aware containment (markers + JSON deep-contain) (2026-05-09)`** supersedes DE-7 + DE-8.
- New knowledge entry: **`KN-9: BAR-167 — Tier-2 deep-merge canonical superseded by deep-containment`** supersedes KN-8.

### Schema migrations

- `.bkit-version` schema **unchanged in Phase 1**. `tier3Hashes` and `canonicalHashes` continue to be written by `runCoreModule`. (Phase 3 may retire `tier3Hashes` once Tier-3 terminology is gone.)

### 👤 ✅ Human Confirmation

- [x] **Breaking Changes confirmed:** I have reviewed all breaking changes and naming decisions above. *(2026-05-09 — superseded by re-run; see issue addendum)*

> [!CAUTION]
> **Agent:** Do NOT pass Gate 1 until this checkbox is `[x]`. Summary must issue `REVISE` if unchecked.

---

## Alternative Approaches & Recommendations

| Option | Mechanism | Verdict |
| --- | --- | --- |
| A. Markers everywhere | `bkit:start..bkit:end` in every file | Rejected — JSON has no comments; falls back to a wrapper key (`__bkit__`). |
| B. Containment everywhere | Set/subset semantics for all formats | Rejected — text loses ordering and contiguity (`pnpm typecheck && pnpm test` ≠ `pnpm test && pnpm typecheck`). |
| C. Three-way merge everywhere (`diff3`) | Algorithmic merge using stored historical templates | Rejected — 3-5× hybrid LOC; bundled historical templates per version (already painful for `bkit-tier1-defaults.ts`); silent-corruption risk on overlapping edits. |
| **D. Hybrid — markers (text) + containment (JSON)** | Two mechanisms, one mental model: "bkit's scope must be intact" | **Selected.** Uses each format's native ownership signals; net code reduction ≥ 200 LOC; cheap migration. |

**Future phases (recommended):**

- **Phase 2 (v2.0.x patch or v2.1.0):** add `bkit:start..bkit:end` markers around current content in `AGENTS.md`, `CLAUDE.md`, `.cursor/rules/00-shared-rules.mdc`, `.vale/styles/House/*.yml`, `.agents/{rules,docs,friction,skills}.md`, `docs/plans/template.md`. Add small marker blocks in `.github/workflows/ci.yml` (`setup-auth + bkit check`), `.vale.ini` core keys, `slop-scan.config.json`. Simplify `bkit-manifest.ts` to `{ path, format }` only; retire Tier number.
- **Phase 3 (v2.0.x patch or v2.1.0):** retire `tier3Hashes` from `.bkit-version` schema, retire "Tier 1/2/3" terminology from docs, update `bkit-tiers.ts` doc-blocks.
- **`bkit upgrade --prune`** flag (deferred; not blocking v2.0.0): cleans orphan keys when bkit drops a previously-shipped key. Not needed unless v2.x drops a key.

## Out of Scope

- **Phase 2 marker extension** — explicitly deferred unless complexity-check shows Phase 1 is small enough to bundle. Default = ship Phase 1 alone as v2.0.0.
- **Phase 3 terminology cleanup** — deferred. Tracked in `docs/pending.md` post-merge.
- **`bkit upgrade --prune` flag** — deferred. Tracked in `docs/pending.md`.
- **Dropping decorative `.cursor/hooks.json` echoes** — separate decision; tracked in `docs/pending.md`. Not blocking v2.0.0.
- **`ci.yml` heavy-customisation marker survival fixture** — Phase 2 scope; deferred.
- Consumer-repo migrations beyond bkit's own templates (e.g. `app-gether-life`, `visitfrasercoast-com`) — out of bkit's scope; consumers run `pnpm bkit upgrade` themselves.

## Merge Method

**Merge method: always squash.** Plan does NOT request `rebase` or `merge-commit`. `bkit-ship.md` Step 3 is hardcoded to `gh pr merge --squash --delete-branch --body ""`.

## Supersession Inventory

<!-- prettier-ignore -->
| Existing artifact | Replaced by | Decision | Justification |
| --- | --- | --- | --- |
| `.agents/scripts/bkit-tiers.ts` → `extractBkitNamespace` | `deepContains` (new, same file) | DELETE | Envelope contract removed; deep-containment replaces extract+hash drift detection. |
| `.agents/scripts/bkit-tiers.ts` → `applyBkitNamespace` | (none — no longer needed) | DELETE | Envelope removed; consumer file is no longer wrapped under `__bkit__`. |
| `.agents/scripts/bkit-tiers.ts` → `migrateTier1JsonToTier2` | `migrateLegacyBkitEnvelope` (new, same file) | DELETE | Migrates the inverse direction: post-envelope → schema-clean. Old function obsolete. |
| `.agents/scripts/bkit-tiers.ts` → envelope branch of `writeTier2Json` | `writeTier2JsonContained` (renamed; envelope guard removed) | DELETE | Envelope-guard `throw` is rolled back; deep-merge is now the only Tier-2 JSON write path. |
| `.agents/scripts/bkit-tier1-defaults.ts` (full file) | (none) | DELETE | Sole consumer was `migrateTier1JsonToTier2`. New `migrateLegacyBkitEnvelope` does not need versioned defaults — the on-disk top-level mirror is already correct (because v0.8.0–v1.1.1 always shipped the duplicate). |
| `.agents/scripts/bkit-tier1-defaults.test.ts` | (none) | DELETE | Tests for the deleted module. |
| `.agents/templates/.claude/settings.json` (envelope wrapper) | Schema-clean top-level template | DELETE | Top-level keys remain; `__bkit__` block deleted. |
| `.agents/templates/.cursor/hooks.json` (envelope wrapper + flat-array `hooks`) | Cursor v1 keyed-object schema, schema-clean | DELETE | Migrated to `hooks: { sessionStart: [...], sessionStop: [...] }`; envelope removed. |
| `.agents/scripts/bkit-manifest.ts` `tier: 1` for `.claude/settings.json` and `.cursor/hooks.json` | `tier: 2` (manifest reclassification) | RETAIN-WITH-REASON | Manifest entries are not deleted, they are reclassified. Stale `tier: 1` integers post-v0.8.0 left `bkit uninstall` on the unconditional-delete branch (C1). |
| `.agents/scripts/bkit-uninstall.ts` `case 2` marker-only decision path (lines 166–184; calls `detectMarkerStyle(content)` returning `null` for JSON → `"preserve"`) | `case 2` extended with JSON-format detection + new `stripTier2JsonScope(consumer, template)` helper | RETAIN-WITH-REASON | File is not deleted, the `case 2` branch's logic is extended to handle JSON-format Tier-2 files. Without this extension, the manifest tier flip (above row) replaces the `case 1 → unconditional delete` bug with a `case 2 → preserve` zombie-footprint bug. See C-SC2-1 / C-SC2-3. |
| `getPkgRoot()` in `.agents/scripts/bkit-modules.ts` | Lifted to new `.agents/scripts/bkit-paths.ts` (re-exported, then imported by both `bkit-modules.ts` and `bkit-preflight.ts`) | RETAIN-WITH-REASON | Function body is not deleted, just relocated to break the `bkit-preflight ↔ bkit-modules` cycle. Old call site in `bkit-modules.ts` re-imports from the new location. |
| DE-7 (`__bkit__` namespace spike) | DE-16 (this plan) — supersedes | RETAIN-WITH-REASON | Decision history is append-only. New entry marks DE-7 superseded with date + BAR-ID. |
| DE-8 (`__bkit__` envelope contract) | DE-16 (this plan) — supersedes | RETAIN-WITH-REASON | Decision history is append-only. New entry marks DE-8 superseded with date + BAR-ID. |
| KN-8 (Tier-2 deep-merge canonical) | KN-9 (deep-containment canonical) — supersedes | RETAIN-WITH-REASON | Knowledge entries are append-only. KN-8 stays with a "superseded by KN-9 (BAR-167)" note. |

> [!CAUTION]
> Default = `DELETE`. Each `DELETE` row is mirrored as `[DELETE] path/to/file` in **Architecture & Component Changes** AND as a removal task in **Agent Execution Runbook**. Decision-history rows (DE-7, DE-8, KN-8) use `RETAIN-WITH-REASON` because `docs/decisions.md` and `docs/knowledge.md` are append-only.

## Security & Privacy

- [x] **New API route** — N/A.
- [x] **New DB table/column** — N/A.
- [x] **Role-gated mutation** — N/A.
- [x] **User input** — N/A; this is internal CLI behaviour.
- [x] **PII** — N/A.
- [x] **Redirect URL** — N/A.
- [x] **Webhook** — N/A.
- [x] **New secret/env var** — N/A.

_None apply — this is a refactor of bkit's own template ownership model with no new routes, DB writes, secrets, or user input._

## 🚨 Pre-Flight / Dependencies 🚨

### Core (always verify)

- [ ] **Package Management:** verify `package.json` (`@cbartens/bkit`) has no new runtime deps; `pnpm-lock.yaml` syncs cleanly. No new deps expected — `deepContains` is a pure recursive walk.
- [ ] **Dependency Versions:** run `pnpm outdated`; spot-check `pnpm --version`, `node --version`, `vitest --version`. Flag stale.
- [ ] **User Context:** verify read/write to `.agents/scripts/`, `.agents/templates/`, `docs/decisions.md`, `docs/knowledge.md`, `docs/architecture.md`, `CHANGELOG.md`, `README.md`.
- [ ] **Pending Blockers:** query Linear for open issues labelled `blocker` touching bkit templates / Tier-2 JSON / `__bkit__` / `bkit upgrade`.
- [ ] **Project Context:** read `docs/decisions.md` (DE-6, DE-7, DE-8, DE-10, DE-12, DE-13), `docs/knowledge.md` (KN-8), and `docs/architecture.md` (Tier-2 JSON section).
- [ ] **Testing & Quality:** confirm new tests live under `.agents/scripts/*.test.ts` (Vitest unit) and `.agents/scripts/*.integration.test.ts` per `docs/testing.md`.
- [ ] **Prerequisite Plans:** none — BAR-167 is self-contained. References completed BAR-131 / BAR-142 plans for context only.

### Conditional (verify only when applicable)

- [ ] **Cursor v1 keyed-object schema spike** _(BAR-167 §6 open question — IN-SCOPE for v2.0.0)_: re-run the DE-7 spike against current Cursor builds. Confirm `hooks: { sessionStart: [...], sessionStop: [...] }` parses without warnings; confirm round-trip with Cursor's debug log shows hooks fire. Document outcome inline in DE-16.
- [ ] **Architecture & UI** _(N/A)_.
- [ ] **Observability** _(new log lines)_: confirm `[bkit] migrated <file> — stripped __bkit__ envelope (v2.0.0)` log line follows `console.error("[Context] Message", payload)` convention from `.agents/rules.md` § Logs (square brackets around context).

### 🔒 Gate 1: Prerequisites Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all applicable boxes above. **DO NOT stop for user permission.** Once saved, immediately proceed to `Architecture & Component Changes`.

- [ ] **Acceptance Scenario confirmed:** Human confirmed `👤 Acceptance Scenario` (checkbox `[x]`).
- [ ] **Breaking Changes confirmed:** Human confirmed `⚠️ Breaking Changes & Naming Review` (checkbox `[x]`).
- [ ] **Cursor v1 spike confirmed** — DE-7 outcome reproducible against current Cursor build.
- [ ] **Gate 1 — Verified:** all Core items checked; all applicable Conditional items checked.

## Data Schema Integration

### Data Schema Usage (Inputs & Outputs)

None — no DB tables read or written. This plan operates exclusively on bkit's local template files and consumer's `.cursor/`, `.claude/` JSON files via the `bkit` CLI.

### Data Schema Changes

None.

## Architecture & Component Changes

> All paths absolute under repo root `.worktrees/bar-167-drop-envelope-hybrid/`.

### Phase 1 — Drop the JSON envelope (REQUIRED for v2.0.0)

#### Templates

##### [MODIFY] `.agents/templates/.cursor/hooks.json`

- **Existence Check:** verified — file currently contains the duplicated `__bkit__` + flat-array shape.
- **Change:** rewrite as Cursor v1 keyed-object schema. Drop `__bkit__`. Drop top-level mirror duplication.
- **Final shape:**
  ```json
  {
    "version": 1,
    "hooks": {
      "sessionStart": [{ "command": "echo '[bkit] session started'" }],
      "sessionStop": [{ "command": "echo '[bkit] session stopped'" }]
    }
  }
  ```
- **Rationale:** DE-7 spike showed Cursor accepts both shapes; v1 keyed-object is the documented schema.

##### [MODIFY] `.agents/templates/.claude/settings.json`

- **Existence Check:** verified — file currently has `__bkit__` wrapping `hooks.SessionStart`.
- **Change:** drop the `__bkit__` block. Top-level keys remain unchanged. Final file is identical to current state minus the `__bkit__` block.

#### Code

##### [ADD] `.agents/scripts/bkit-paths.ts` _(C4/C5 fix — break circular import)_

- **New file** — single export `getPkgRoot(): string`. Lift implementation verbatim from `bkit-modules.ts:90–95`.
- **Why:** `bkit-preflight.ts` (Tier-2 drift detection) and `bkit-modules.ts` (template resolution for the migration helper) both need pkg-root access. Putting it in `bkit-modules.ts` blocks `bkit-preflight.ts` (which has a "no imports from bkit-modules" rule) from using it. A standalone `bkit-paths.ts` module breaks the cycle without bloating the surface area.
- **Imports allowed in `bkit-paths.ts`:** `node:path`, `node:url`, `node:fs` only.

##### [MODIFY] `.agents/scripts/bkit-tiers.ts`

- **Existence Check:** verified.
- **ADD:**
  - `deepContains(template: JsonValue, consumer: JsonValue, pathPrefix?: string): { ok: boolean; missing: string[]; mismatched: string[] }`
    - Recursive walk; returns `missing` (template path absent in consumer) and `mismatched` (template leaf primitive ≠ consumer leaf primitive).
    - Object containment: every template key present in consumer at deep-equal value.
    - Array of primitives: subset semantics (template array's elements ⊆ consumer array's elements; element duplication tolerated).
    - Array of objects: element-wise — every template element has a deep-equal match in consumer array; **order-insensitive**.
    - Mixed arrays (primitives + objects): element-wise per element type; `missing` reports element index path.
  - `writeTier2JsonContained(srcPath: string, dstPath: string, dryRun: boolean, ws: WriteSet): void`
    - dest absent → write template as-is (current behaviour).
    - dest present → run `deepContains(template, existing)`. If `ok=true` and content unchanged → no-op. If `ok=false` → deep-merge with **template as override**: `deepMergeJson(existing, template)` (existing `deepMergeJson(base, override)` signature in `bkit-tiers.ts:33` — override wins at leaf level), write result.
    - **Schema-flip rule:** when template and consumer values at the same path are different JSON kinds (object vs array, primitive vs object, array vs primitive, etc.), template wins (consumer value is overwritten by template). The merge helper must recognise type-mismatch and surface a `schemaFlipped: true` flag through the return value (extend `deepMergeJson` return shape or use a sibling helper `deepMergeJsonWithReport`).
    - Idempotent on identical state.
  - `migrateLegacyBkitEnvelope(doc: JsonValue, template: JsonValue): { stripped: boolean; deepMerged: boolean; schemaFlipped: boolean; outDoc: JsonValue }`
    - **Pure function** — takes the parsed doc and the parsed template payload as arguments; performs no file I/O and does not import `getPkgRoot()`. This keeps `bkit-tiers.ts` pure JSON-utility and avoids the `bkit-tiers ↔ bkit-modules` circular import (see Architecture note on C4 resolution).
    - If top-level `__bkit__` absent on `doc` → returns `{ stripped: false, deepMerged: false, schemaFlipped: false, outDoc: doc }`.
    - Strips `__bkit__` from doc → `postStripDoc`.
    - Runs `deepContains(template, postStripDoc)`. If `ok=true` → return `{ stripped: true, deepMerged: false, schemaFlipped: false, outDoc: postStripDoc }`.
    - If `ok=false` → run `deepMergeJson(postStripDoc, template)` (template as override); return `{ stripped: true, deepMerged: true, schemaFlipped: <true if any path type-flipped>, outDoc: merged }`.
    - The **caller** in `bkit-modules.ts` is responsible for: file read, JSON parse, template resolution (via existing `getPkgRoot()` from `bkit-modules.ts`), file write, and logging `[bkit] migrated <file> — stripped __bkit__ envelope (v2.0.0)` (or the schema-flip variant when `schemaFlipped: true`).
    - Idempotent: re-run on a doc without `__bkit__` returns `{ stripped: false, deepMerged: false, schemaFlipped: false, outDoc: doc }`.
- **DELETE:**
  - `applyBkitNamespace`
  - `extractBkitNamespace`
  - `migrateTier1JsonToTier2`
  - Envelope-guard `throw` and inner branch in `writeTier2Json`. The function is renamed `writeTier2JsonContained` (signature unchanged). All call sites in `bkit-modules.ts` updated.
- **Doc-block update:** rewrite the `Tier 2` section header to describe deep-containment + deep-merge semantics; remove all references to `__bkit__`.

##### [MODIFY] `.agents/scripts/bkit-modules.ts`

- **Existence Check:** verified.
- **`runClaudeModule` (lines ~467–493):**
  - Read consumer file at `settingsDst` (existing fs.readFile pattern).
  - Resolve template payload via `getPkgRoot()` + `path.join(pkgRoot, ".agents/templates/.claude/settings.json")` (existing helper at `bkit-modules.ts:90–95`); JSON.parse.
  - Call `migrateLegacyBkitEnvelope(parsedDoc, parsedTemplate)`. Capture `{ stripped, deepMerged, schemaFlipped, outDoc }`. If `stripped` → write `outDoc` back to disk and append to `ws`.
  - Then call `writeTier2JsonContained(settingsSrc, settingsDst, dryRun, ws)` (replaces previous `writeTier2Json`).
  - Log lines: `${logPrefix} ${tag}claude: ${settingsDst} (migrated __bkit__ envelope)` when `stripped` is true; additionally `${logPrefix} ${tag}claude: ${settingsDst} (schema flip applied: flat-array → keyed-object)` when `schemaFlipped` is true.
  - Drop the `versionFile`/`onDiskVersion` lookup block (no longer needed — `migrateLegacyBkitEnvelope` is version-agnostic).
- **`runCursorModule` (lines ~557–580):**
  - Mirror the same swap for `.cursor/hooks.json`. Schema-flip log line is especially relevant here because the template format itself is changing.
- **Imports:** drop `migrateTier1JsonToTier2`, `writeTier2Json`; add `migrateLegacyBkitEnvelope`, `writeTier2JsonContained`. **Retain** `readBkitVersion` import — it remains used for `canonicalHashes` recording via `postDispatch` (verify with grep before any removal).
- **Circular-import note (C4 resolution):** `migrateLegacyBkitEnvelope` is a pure JSON helper that takes `doc` and `template` payloads as arguments. `bkit-modules.ts` is the only place that imports `getPkgRoot()`; the helper itself does not. This keeps `bkit-tiers.ts` (already imported by `bkit-modules.ts`) free of any back-reference into `bkit-modules.ts`.

##### [MODIFY] `.agents/scripts/bkit-manifest.ts` _(C1 fix — manifest tier reclassification)_

- **Existence Check:** verified — `CLAUDE_MANIFEST` (lines ~49–55) lists `.claude/settings.json` as `tier: 1`; `CURSOR_MANIFEST` (lines ~57–65) lists `.cursor/hooks.json` as `tier: 1`. The `tier: 1` values are stale: those files were reclassified to Tier-2 in v0.8.0 but the manifest was never updated.
- **Change:** flip both entries to `tier: 2`.
- **Why this matters:** `bkit-uninstall.ts` (lines ~156–165) branches on `entry.tier`. The `case 1` branch unconditionally deletes the file. The `case 2` branch must instead **strip-merge** template scope out (i.e. for each leaf in the template tree, remove the matching path from the consumer file; preserve everything else). Without flipping the tier integers, `bkit uninstall --claude` / `--cursor` will destroy consumer-added keys (`hooks.Stop`, `failClosed`, etc.) post-v2.0.0.
- **Companion change in `bkit-uninstall.ts`:** verify the `case 2` branch performs strip-merge correctly with the new template shapes (no `__bkit__` to look for); if the existing `case 2` was envelope-aware it must be rewritten to use the inverse of `deepMergeJson(existing, template)` — namely walk the template tree and `delete` each matching leaf path on the consumer doc. Add this as part of Task 4b (uninstall verification) below.

##### [MODIFY] `.agents/scripts/bkit-uninstall.ts` _(C-SC2-1 fix — JSON-aware `case 2` strip-merge)_

- **Existence Check:** verified — `case 2` branch lives at `bkit-uninstall.ts:166–184`. Today calls `detectMarkerStyle(content)` (lines 94–97) which only matches text-marker patterns (`<!-- bkit:start -->`, `# bkit:start`); for JSON files it returns `null` and the decision falls through to `"preserve"` (treats the file as 100% consumer content).
- **Scope:** extend the `case 2` branch to detect JSON-format files (by file extension `.json` OR by manifest `format` field if present) and dispatch to a new JSON strip-merge helper instead of the marker path. After Task 4a flips `.claude/settings.json` and `.cursor/hooks.json` to `tier: 2`, this branch is what fires for `bkit uninstall --claude` / `--cursor`; without this fix it silently preserves bkit-owned keys (zombie footprint).
- **ADD function:** `stripTier2JsonScope(consumerDoc: JsonValue, templateDoc: JsonValue): JsonValue` in the same file. **Algorithm sketch:**
  1. Deep-clone `consumerDoc` to a working copy `out`.
  2. Recursively walk `templateDoc`. For each leaf path `p` in the template (primitive, array, or `null`):
     - If `out` has the same path `p` AND the value at `p` deep-equals the template's value (i.e. bkit-owned content is intact), `delete` the leaf at path `p` from `out`.
     - If `out` has the same path `p` but the value differs (consumer customised the bkit-owned leaf), leave it untouched (consumer's edit wins; we do not destroy diverged content).
  3. After walking, prune any **template-introduced** intermediate objects in `out` that are now empty `{}` (i.e. only delete intermediates that the template itself populated; never delete intermediates that have consumer-only siblings). Do NOT prune arrays — preserve consumer-added array elements inside template-owned arrays.
  4. Return `out`.
- **Acceptance shape:** invariant — `out` contains every consumer-only top-level key byte-identical; every consumer-only nested key under template-owned objects byte-identical; every template-owned leaf removed (or retained where consumer customised). Pure function; no file I/O.
- **Caller:** the `case 2` branch in `bkit-uninstall.ts` reads the consumer file, parses to JSON, resolves the matching template via `getPkgRoot()` (now imported from `bkit-paths.ts`), parses template, calls `stripTier2JsonScope(consumer, template)`, writes result back via the existing atomic-write pattern in the file.
- **Imports:** add `getPkgRoot` from `./bkit-paths`. No `__bkit__` lookup anywhere.

##### [MODIFY] `.agents/scripts/bkit-install.ts`

- **Existence Check:** verified — `postDispatch` callbacks live at `bkit-install.ts` ≈ line 896; canonical-hash recording at ≈ line 803.
- **No structural changes required** for Phase 1 — `postDispatch` continues to record `canonicalHashes` per file as today. The recorded hash is now over the schema-clean file (no `__bkit__`), which is correct.
- **Verification only:** confirm `postDispatch` still flushes after all modules complete; confirm hash for `.claude/settings.json` and `.cursor/hooks.json` records the post-merge file (not the template).

##### [MODIFY] `.agents/scripts/bkit-preflight.ts` _(C2/C5/C6 resolution — drift advisory + envelope advisory + pre-envelope blocker)_

- **Import-constraint update (C5):** the existing `bkit-preflight.ts` header constraint ("No imports from `bkit-modules.ts`") is preserved. To support the new advisories, **extend the allowed-imports list to include `readBkitVersion` from `bkit-version.ts`** and `deepContains` from `bkit-tiers.ts`, plus `getPkgRoot()` lifted out (see next bullet). These do not introduce a cycle (none of them import `bkit-modules.ts`). Update the header comment in `bkit-preflight.ts` to reflect the new allow-list.
- **Shared util extraction:** lift `getPkgRoot()` from `bkit-modules.ts` into a new tiny module `.agents/scripts/bkit-paths.ts` (single export). `bkit-modules.ts` and `bkit-preflight.ts` both import from `bkit-paths.ts`. (This is the C4-aligned shared-util fix; the migration helper itself remains parameter-driven, but preflight needs template resolution.)
- **ADD advisory `legacy-bkit-envelope-detected`** — fires when `bkit check` / `bkit doctor` (read-only path) sees `__bkit__` at top level of `.cursor/hooks.json` or `.claude/settings.json` AND the recorded `canonicalHashes` (via `readBkitVersion`) indicates the file was last written under a pre-v2.0.0 bkit. Severity: `advisory` — does NOT block. Action text: `Run \`pnpm bkit upgrade\` to migrate to the v2.0.0 ownership model.` Does NOT fire on a fresh-v2.0.0 install where no `pinnedVersion` is on record (see Edge Cases).
- **ADD advisory `tier2-json-drift` (C2/C6 resolution — drift detection in the deep-containment world)** — fires when `bkit check` / `bkit doctor` runs `deepContains(template, consumerFile)` for `.cursor/hooks.json` or `.claude/settings.json` and `ok=false`. Payload includes `missing` and `mismatched` paths (truncated to 5 entries each). Severity: `advisory` — surfaces on `bkit check` exit-0 path. Action text: `Run \`pnpm bkit install\` to restore template scope; consumer-added keys are preserved.`
- **Call site for drift detection (C6):** drift detection runs **inside `bkit-preflight.ts`** (NOT inside `runClaudeModule` / `runCursorModule`), so `bkit doctor` (which dispatches through preflight) inherits drift detection automatically (resolves O7 by design). The dispatch loop reads each Tier-2 JSON file, resolves the matching template via `getPkgRoot()` (now via `bkit-paths.ts`), parses both, and calls `deepContains(template, consumer)`.
- **ADD blocker `pre-envelope-bkit-version-detected`** — fires when on-disk `.bkit-version.pinnedVersion < 0.8.0` AND no top-level `__bkit__` is present on `.cursor/hooks.json` or `.claude/settings.json`. Severity: `blocker` — `bkit upgrade` exits non-zero with action `Upgrade through bkit v1.x first (e.g. \`pnpm add @cbartens/bkit@^1.1.1\` then \`pnpm bkit upgrade\`) before stepping to v2.0.0.` This is the explicit migration-path scoping called for in Review-1 CRITICAL #2: pre-v0.8.0 consumers are routed through v1.x rather than handled by a flat-array→keyed-object schema-flip in `migrateLegacyBkitEnvelope`. (Note: `bkit-tier1-defaults.ts` is still deleted in v2.0.0; v0.5.x–v0.7.x consumers rely on a v1.x intermediate hop where `migrateTier1JsonToTier2` still exists.)

##### [MODIFY] `.agents/scripts/bkit-version.ts`

- **No schema change in Phase 1.** Confirm by reading: `BkitVersion = { pinnedVersion, tier3Hashes, canonicalHashes }` — all three remain.
- If after deletion of `bkit-tier1-defaults.ts` no consumer of `BKIT_TIER1_DEFAULTS_BY_VERSION` survives → drop the `BKIT_TIER1_DEFAULTS_BY_VERSION` import block in any other file (grep verified: only `bkit-tier1-defaults.ts` and its test consume it).

#### Code Deletions

##### [DELETE] `.agents/scripts/bkit-tier1-defaults.ts`

- **Reason:** sole consumer was `migrateTier1JsonToTier2` (now deleted). New `migrateLegacyBkitEnvelope` reads the consumer's on-disk file directly — no historical defaults needed because v0.8.0–v1.1.1 always shipped the top-level mirror.

##### [DELETE] `.agents/scripts/bkit-tier1-defaults.test.ts`

- **Reason:** tests for the deleted module.

#### Tests

##### [MODIFY] `.agents/scripts/bkit-tiers.test.ts`

- **DELETE** test blocks: `extractBkitNamespace`, `applyBkitNamespace`, `migrateTier1JsonToTier2`, envelope-guard branch of `writeTier2Json`.
- **ADD** test block: `deepContains` covering the seven row-cases in the Derived Test Matrix.
- **ADD** test block: `writeTier2JsonContained` (write-as-is, deep-merge, idempotent, malformed-dest fallback).
- **ADD** test block: `migrateLegacyBkitEnvelope` (strip-only, strip-and-deep-merge, idempotent no-op when envelope absent, malformed-JSON skip).
- **ADD** test block: Cursor v1 keyed-object schema sanity (parse template; assert shape); marks the DE-7 spike result.

##### [MODIFY] `.agents/scripts/bkit-modules.upgrade.integration.test.ts`

- **ADD** fixture: pre-v2.0.0 consumer (`.claude/settings.json` with `__bkit__` envelope + top-level mirror + consumer-added `hooks.Stop`, `failClosed`, `loop_limit`).
- **ADD** test: `v0.7.x → v0.8.0 → v2.0.0` chain. Assert byte-identical retention of consumer keys after final upgrade.
- **ADD** test: heavy-customised consumer fixture from BAR-131 sub-plan-2 (load fixture, run upgrade, assert deep-containment ok and consumer keys intact).
- **ADD** test: idempotency — running `bkit upgrade` twice on a v2.0.0 file is a no-op (no second write to ws).

##### [MODIFY] `.agents/scripts/bkit-modules.integration.test.ts`

- **ADD** test: `bkit check` on a pre-v2.0.0 fixture surfaces `legacy-bkit-envelope-detected` advisory; exits 0.

##### [DELETE] `.agents/scripts/bkit-tier1-defaults.test.ts`

(See Code Deletions above.)

#### Documentation Updates

| File | Change required |
| --- | --- |
| `docs/decisions.md` | **APPEND** `DE-16: BAR-167 — Drop __bkit__ envelope; adopt format-aware containment (markers + JSON deep-contain) (2026-05-09)` with full reasoning, the four-option matrix, supersession of DE-7 + DE-8. **EDIT** DE-7 and DE-8 headers to append `(superseded by DE-16, 2026-05-09)`. |
| `docs/knowledge.md` | **APPEND** `KN-9: BAR-167 — Tier-2 ownership uses format-aware containment, not envelope` with the eight-turn-confusion narrative as the symptom-→-root-cause-→-fix story. **EDIT** KN-8 header to append `(superseded by KN-9, BAR-167)`. |
| `docs/architecture.md` | **REWRITE** the Tier-2 JSON section. Remove all `__bkit__` references; describe `deepContains` + `deepMergeJson` as the canonical mechanism. Add a "Phase 1 / Phase 2 / Phase 3" callout explaining v2.0.0 ships Phase 1 and the others may follow as patches. |
| `CHANGELOG.md` | **APPEND** v2.0.0 entry: `BREAKING — __bkit__ envelope removed from .claude/settings.json and .cursor/hooks.json templates. Deep-containment is now the Tier-2 JSON ownership mechanism. Consumer files auto-migrated on first \`bkit upgrade\`. See DE-16 / KN-9.` |
| `README.md` | Search for `__bkit__`; if any user-facing mention exists, rewrite that paragraph to describe deep-containment. |
| `.agents/rules.md` | No change. Universal rules unaffected. |
| `docs/pending.md` | **APPEND** entries for: Phase 2 marker extension, Phase 3 terminology cleanup, `bkit upgrade --prune` flag, drop-decorative-`.cursor/hooks.json`-echoes question, `ci.yml` heavy-customisation marker survival fixture. |
| `docs/completed.md` | **APPEND** post-merge: `BAR-167 — drop __bkit__ envelope; v2.0.0 (2026-05-XX)`. |

### Cron Jobs & Scheduled Tasks

None.

## Documentation Updates

> Already enumerated above under **Code → Documentation Updates**. No additional rows.

## Rollback Strategy

| Axis | Action | Notes |
| --- | --- | --- |
| **Code** | `git revert {MERGE_COMMIT}` | Revert restores `__bkit__` templates + envelope helpers. Consumer `.cursor/hooks.json` and `.claude/settings.json` keep their post-strip schema-clean shape (envelope was stripped on first upgrade); next `bkit install` re-writes the envelope on top via the rolled-back `writeTier2Json` deep-merge. |
| **Risk window** | One `bkit upgrade` cycle | If a consumer ran `pnpm bkit upgrade` post-v2.0.0 and we then ship v2.0.1 reverting BAR-167, the consumer's file ends up with the legacy envelope re-applied via deep-merge. No data loss; brief schema-pollution window. |
| **DB** | N/A | No DB changes. |

_Code-only — `git revert` sufficient. Document the rollback path in DE-16's "Trade-offs accepted" section._

## Agent Execution Runbook

> Chronological. Each task includes scope, target file(s), and verification step.

### Phase 1 — Pre-implementation gates

- [ ] **Task 0a — Cursor v1 spike re-run.** Run against **Cursor build ≥ 0.45.0** (current stable channel as of 2026-05-09; record exact build string from `Cursor → About` in DE-16). Initialise a sandbox repo at `tmp/bar-167-cursor-spike/` (gitignored; created fresh per spike run) containing only the keyed-object `.cursor/hooks.json` from this plan's template rewrite (Task 5 final shape). Trigger a session-start by opening the sandbox in Cursor; confirm `[bkit] session started` appears in the Cursor log file at `~/Library/Application Support/Cursor/logs/<session-id>/main.log` (macOS) or platform equivalent. **Abort branch:** if the spike fails (hook does not fire OR Cursor reports schema-validation error), STOP — do NOT proceed to Task 1. File a Linear blocker tagged `bar-167-cursor-spike-fail` with the Cursor build string and log excerpt. Revert the planned template change to flat-array shape and revisit DE-16 disposition with the human reviewer; the v2.0.0 ship is blocked until the spike passes or the template format is reverted to legacy flat-array. Document outcome (PASS or FAIL with build string) inline in DE-16 draft.
- [ ] **Task 0b — Read project decisions + knowledge.** `read_file` `docs/decisions.md` (DE-6 → DE-15), `docs/knowledge.md` (KN-8). Confirm no conflict with this plan's deletions.
- [ ] **Task 0c — Resolve fixture paths for upgrade-chain regression.** Verified: the existing v0.5.x→v0.8.x fixture lives at `tests/fixtures/heavy-customised-consumer/` (referenced by `bkit-modules.upgrade.integration.test.ts:22`). Do NOT create a new directory under `.agents/scripts/__fixtures__/`. Instead: (i) confirm the existing fixture is intact, then (ii) **create a new sibling fixture** at `tests/fixtures/heavy-customised-consumer-v1-envelope/` representing the post-v0.8.x on-disk shape (`__bkit__` envelope + top-level mirror + consumer-added `hooks.Stop`, `failClosed`, `loop_limit`). The new fixture is a static input — it captures the on-disk state rather than re-running the v0.5.x→v0.8.x migrator. Files in the fixture: `cursor-hooks.json`, `claude-settings.json`, `bkit-version.json` (with `pinnedVersion: "0.8.5"`).

  **Abbreviated JSON shapes (build agent reference):**

  `cursor-hooks.json` (BEFORE — envelope on disk):

  ```json
  {
    "__bkit__": {
      "version": 1,
      "hooks": [
        { "event": "sessionStart", "command": "echo '[bkit] session started'" },
        { "event": "sessionStop", "command": "echo '[bkit] session stopped'" }
      ]
    },
    "version": 1,
    "hooks": [
      { "event": "sessionStart", "command": "echo '[bkit] session started'" },
      { "event": "sessionStop", "command": "echo '[bkit] session stopped'" }
    ],
    "failClosed": true,
    "loop_limit": 25
  }
  ```

  `cursor-hooks.json` (AFTER — schema-clean, post-migration, Cursor v1 keyed-object):

  ```json
  {
    "version": 1,
    "hooks": {
      "sessionStart": [{ "command": "echo '[bkit] session started'" }],
      "sessionStop": [{ "command": "echo '[bkit] session stopped'" }]
    },
    "failClosed": true,
    "loop_limit": 25
  }
  ```

  `claude-settings.json` (BEFORE — envelope on disk):

  ```json
  {
    "__bkit__": {
      "hooks": { "SessionStart": [{ "command": "pnpm bkit check" }] }
    },
    "hooks": {
      "SessionStart": [{ "command": "pnpm bkit check" }],
      "Stop": [{ "command": "echo 'consumer stop hook'" }]
    }
  }
  ```

  `claude-settings.json` (AFTER — schema-clean, post-migration):

  ```json
  {
    "hooks": {
      "SessionStart": [{ "command": "pnpm bkit check" }],
      "Stop": [{ "command": "echo 'consumer stop hook'" }]
    }
  }
  ```

  `bkit-version.json`:

  ```json
  { "pinnedVersion": "0.8.5", "tier3Hashes": {}, "canonicalHashes": {} }
  ```

### Phase 1 — Code (sequential)

- [ ] **Task 1 — `deepContains` primitive.** Add `deepContains` to `.agents/scripts/bkit-tiers.ts`. Implement object containment + array-of-primitive subset + array-of-object element-wise order-insensitive containment + mixed-array semantics + null-input boundary cases. Verify: `pnpm vitest run bkit-tiers.test.ts -t deepContains` green for the seven `deepContains` test rows in the matrix.
- [ ] **Task 1b — Extract `getPkgRoot()` to shared util.** Create `.agents/scripts/bkit-paths.ts` exporting `getPkgRoot()` (lift from `bkit-modules.ts:90–95`). Update `bkit-modules.ts` to import from `bkit-paths.ts`. Verify: `pnpm tsc --noEmit` clean; no circular import warnings.
- [ ] **Task 2 — `writeTier2JsonContained`.** Rename `writeTier2Json` → `writeTier2JsonContained` in `.agents/scripts/bkit-tiers.ts`. Remove the envelope-guard `throw`. Use `deepMergeJson(existing, template)` semantics (template is the override — confirm argument order matches the existing `deepMergeJson(base, override)` signature at `bkit-tiers.ts:33`; **template is the override**). Add the schema-flip handling per Edge Cases. Verify: `pnpm vitest run bkit-tiers.test.ts -t writeTier2JsonContained` green; the schema-flip test row passes.
- [ ] **Task 3 — `migrateLegacyBkitEnvelope`.** Add **pure JSON helper** to `.agents/scripts/bkit-tiers.ts` with signature `(doc, template) → { stripped, deepMerged, schemaFlipped, outDoc }`. NO file I/O, NO `getPkgRoot()` import (C4 fix). Verify: `pnpm vitest run bkit-tiers.test.ts -t "migrateLegacyBkitEnvelope idempotent"` green AND `pnpm vitest run bkit-tiers.test.ts -t migrateLegacyBkitEnvelope` green for all four sub-cases (strip-only, strip+deep-merge, idempotent no-op, schema-flip).
- [ ] **Task 4 — Update `runClaudeModule` + `runCursorModule`.** Edit `.agents/scripts/bkit-modules.ts`: read consumer file → resolve template via `getPkgRoot()` (now imported from `bkit-paths.ts`) → call `migrateLegacyBkitEnvelope(doc, template)` → write `outDoc` if `stripped`. Then call `writeTier2JsonContained`. Drop `versionFile`/`onDiskVersion` blocks. **Atomic-write pattern (O-SC2-4):** the caller wraps the write in a try-catch with the standard temp-file + rename pattern (write `outDoc` to `${dst}.bkit-tmp`, then `fs.renameSync` over `dst`) so a mid-write crash leaves the file either fully pre-migration or fully post-migration — never truncated. If `JSON.parse` of the consumer file throws, fall through to the existing "malformed JSON → overwrite with template" branch in `writeTier2JsonContained`; do NOT invoke `migrateLegacyBkitEnvelope` on an unparsed string. Verify: `pnpm tsc --noEmit` clean (catches export-name typos at compile time); `pnpm vitest run bkit-modules.test.ts` green.
- [ ] **Task 4a — Reclassify manifest tier integers (C1 fix).** Edit `.agents/scripts/bkit-manifest.ts`: change `.claude/settings.json` and `.cursor/hooks.json` entries from `tier: 1` to `tier: 2`. Verify: `pnpm vitest run bkit-manifest.test.ts` green (update the test if it asserts the old tier).
- [ ] **Task 4b — Build JSON-aware `bkit uninstall` strip-merge path.** Inspect `bkit-uninstall.ts:156–184` (`case 2` decision branch). Today's implementation calls `detectMarkerStyle(content)` which only matches text-marker patterns; for JSON files (`.claude/settings.json`, `.cursor/hooks.json`) it returns `null` → branches to `"preserve"` (treats the file as 100% consumer content). Post-tier-flip (Task 4a) this leaves bkit-owned keys behind on uninstall. **Build sub-task — name the new function `stripTier2JsonScope(consumerDoc: JsonValue, templateDoc: JsonValue): JsonValue`** in `.agents/scripts/bkit-uninstall.ts`. Algorithm sketch: parse consumer file; walk the parsed template JSON tree; for each leaf path in the template, `delete` the matching path from the consumer doc; clean up empty-object intermediates only when the template's own intermediate exists; return the trimmed doc. Extend the `case 2` branch to detect JSON-format files (by file extension `.json` OR by manifest `format` field if available) and dispatch to `stripTier2JsonScope` instead of the marker path. Preserve all consumer-only keys byte-identical; preserve consumer-added array elements inside template-owned arrays. Add **both** matrix rows: `bkit uninstall --claude` AND `bkit uninstall --cursor` consumer-key survival, with unique test titles `"bkit uninstall --claude strips template scope"` and `"bkit uninstall --cursor strips template scope"`. Verify: `pnpm vitest run bkit-modules.integration.test.ts -t "bkit uninstall --claude strips template scope"` green AND `pnpm vitest run bkit-modules.integration.test.ts -t "bkit uninstall --cursor strips template scope"` green.
- [ ] **Task 5 — Templates rewrite.** **PREREQ:** Task 14a's `package.json` `"version": "2.0.0"` edit MUST be applied first (so the `.bkit-version` regen triggered by `bkit install` below records `pinnedVersion: "2.0.0"`, not the stale `1.1.1`). Rewrite `.agents/templates/.cursor/hooks.json` and `.agents/templates/.claude/settings.json` per spec. Run `pnpm bkit install` in this worktree against itself; confirm `pnpm bkit check` reports `Done. 0 write(s).`
- [ ] **Task 6 — Preflight advisories + drift detection (C2/C5/C6 fix).** Edit `.agents/scripts/bkit-preflight.ts`: extend allow-list (header comment) to permit `readBkitVersion` from `bkit-version.ts`, `deepContains` from `bkit-tiers.ts`, `getPkgRoot` from `bkit-paths.ts`. Add three advisories/blockers: `legacy-bkit-envelope-detected` (advisory), `tier2-json-drift` (advisory; runs `deepContains` per Tier-2 JSON file), `pre-envelope-bkit-version-detected` (blocker; pre-v0.8.0 + no envelope). Verify: `pnpm vitest run bkit-preflight.test.ts` green. Authoritative end-to-end verification of the three advisories/blockers is the green outcome of the corresponding integration tests in **Task 10** (titles: `"bkit check legacy-bkit-envelope-detected advisory"`, `"bkit check tier2-json-drift advisory"`, `"bkit upgrade pre-envelope-bkit-version-detected blocker"`); Task 6 does NOT need a separate manual fixture check.
- [ ] **Task 7 — Delete obsolete code.** **HARD PREREQ:** Task 0c must be complete (static fixture `tests/fixtures/heavy-customised-consumer-v1-envelope/` committed) — Task 7 deletes `migrateTier1JsonToTier2` and any test file still importing it would break `pnpm tsc --noEmit`. Delete `.agents/scripts/bkit-tier1-defaults.ts` and `.agents/scripts/bkit-tier1-defaults.test.ts`. Delete `applyBkitNamespace`, `extractBkitNamespace`, `migrateTier1JsonToTier2` from `.agents/scripts/bkit-tiers.ts`. **Sub-task — fix existing test imports:** edit `.agents/scripts/bkit-modules.upgrade.integration.test.ts` line 14 — remove `migrateTier1JsonToTier2` and `writeTier2Json` from the import; add `writeTier2JsonContained` and `migrateLegacyBkitEnvelope` (or remove the import entirely if the v0.8.x leg in this test file is now driven exclusively by the static fixture from Task 0c, in which case the helpers are not directly invoked). Grep the rest of the codebase for any other import of the deleted symbols before running verify. Verify: `pnpm tsc --noEmit` clean; `pnpm turbo lint typecheck format:check test` clean. Run `git diff --stat dev..HEAD -- '.agents/scripts/' '.agents/templates/'` to confirm net deletion ≥ 200 LOC across both directories.

### Phase 1 — Tests

- [ ] **Task 8 — `bkit-tiers.test.ts` rewrite.** Apply the test changes in **Tests** section above. **Explicit coverage of the matrix's `Cursor v1 keyed-object schema spike` row** is provided here as a static unit test block named `cursor-v1-schema` (parses `.agents/templates/.cursor/hooks.json` and asserts the keyed-object shape: `version === 1`, `hooks.sessionStart` is an array, `hooks.sessionStop` is an array, no `__bkit__` key, no flat-array `hooks`). This static schema-shape check is distinct from Task 0a's runtime hook-firing spike — both rows must be green for the matrix to be fully covered. Verify: full file passes; mixed-array, null-boundary, schema-flip, and `cursor-v1-schema` blocks are all green.
- [ ] **Task 9 — Upgrade integration tests.** Add the integration test rows to `.agents/scripts/bkit-modules.upgrade.integration.test.ts`. The v0.5.x→v0.8.x leg is exercised exclusively via the **static-fixture approach committed in Task 0c**: the existing `tests/fixtures/heavy-customised-consumer/` captures the v0.5.x pre-state, and the new sibling `tests/fixtures/heavy-customised-consumer-v1-envelope/` captures the v0.8.x post-state (already-baked, no live replay of the deleted `migrateTier1JsonToTier2` helper). The v0.8.x→v2.0.0 leg runs against `tests/fixtures/heavy-customised-consumer-v1-envelope/`. Heavy-customised consumer fixture. Idempotency. Verify: `pnpm vitest run bkit-modules.upgrade.integration.test.ts` green.
- [ ] **Task 10 — Modules integration test.** Add the integration test rows from the matrix: `legacy-bkit-envelope-detected` advisory, `tier2-json-drift` advisory (consumer file missing a template key), `pre-envelope-bkit-version-detected` blocker, `bkit uninstall --claude` consumer-key survival. Verify green.
- [ ] **Task 10a — `bkit doctor` integration test (O7 fold-in).** Edit `.agents/scripts/bkit-doctor.integration.test.ts` to assert that `tier2-json-drift` and `legacy-bkit-envelope-detected` surface through the `doctor` verb (re-uses preflight by design). Verify green.

### Phase 1 — Documentation

- [ ] **Task 11 — DE-16.** Append to `docs/decisions.md`. Edit DE-7 and DE-8 headers to mark superseded.
- [ ] **Task 12 — KN-9.** Append to `docs/knowledge.md`. Edit KN-8 header to mark superseded.
- [ ] **Task 13 — `docs/architecture.md` Tier-2 JSON section.** Rewrite per spec.
- [ ] **Task 14 — CHANGELOG v2.0.0 entry.** Append breaking-change line.
- [ ] **Task 14a — `package.json` version bump (O6 fold-in).** **ORDERING — CRITICAL:** the `package.json` `"version"` bump from `1.1.1` to `2.0.0` MUST happen BEFORE Task 5 (`pnpm bkit install` against the worktree). Task 5's `bkit install` triggers the `.bkit-version` regen mechanism, which records the value in `package.json` at the moment of the install — if Task 14a runs after Task 5, regen records the stale `1.1.1` value. Concretely: (i) edit `package.json` `"version": "2.0.0"` as the first action of Task 14a (run this BEFORE Task 5); (ii) Task 5's `bkit install` then automatically writes `pinnedVersion: "2.0.0"` into `.bkit-version`; (iii) post-Task-5, complete Task 14a by running `pnpm install` to refresh `pnpm-lock.yaml`. Verify: `git diff package.json` shows the version bump; `cat .bkit-version | grep pinnedVersion` shows `"2.0.0"`; `pnpm-lock.yaml` updates cleanly.
- [ ] **Task 15 — README.md sweep.** Replace any `__bkit__` user-facing mention with deep-containment language.
- [ ] **Task 16 — `docs/pending.md` follow-ups.** Append five entries (Phase 2, Phase 3, `--prune`, decorative-echoes question, `ci.yml` marker fixture).

### 🔒 Gate 2: Code Implementation Check

- [ ] **Gate 2 — Verified:** Tasks 1–10a complete; every checkbox above checked off. `pnpm turbo lint typecheck format:check test` clean. Net LOC delta from `git diff --stat dev..HEAD -- '.agents/scripts/' '.agents/templates/'` ≥ 200 lines deleted.

### Mandatory Tasks (Testing & Documentation)

- [ ] **Verify test coverage against Derived Test Matrix:** confirm each row in the matrix has a corresponding green test. Cross-reference `bkit-tiers.test.ts`, `bkit-modules.upgrade.integration.test.ts`, `bkit-modules.integration.test.ts`, and `bkit-doctor.integration.test.ts`.
- [ ] **Update existing tests:** all `extractBkitNamespace` / `applyBkitNamespace` / `migrateTier1JsonToTier2` references removed from test files.
- [ ] **Write new tests:** seven `deepContains` cases (incl. mixed-array + null-boundary) + three `writeTier2JsonContained` (incl. schema-flip) + four `migrateLegacyBkitEnvelope` (incl. schema-flip) + integration scenarios per the matrix (envelope advisory, drift advisory, pre-envelope blocker, doctor reuse, uninstall consumer-key survival, upgrade chain).
- [ ] **Verify observability:** `[bkit] migrated <file> — stripped __bkit__ envelope (v2.0.0)` and `[bkit] migrated <file> — schema flip applied (flat-array hooks → keyed-object) (v2.0.0)` log lines conform to `[Context] Message` regex; no PII; no correlation ID needed (CLI is single-user).
- [ ] **Update documentation:** `docs/architecture.md`, `docs/decisions.md`, `docs/knowledge.md`, `CHANGELOG.md`, `README.md` updated. `docs/pending.md` follow-ups appended. `.agents/docs.md` index unchanged (no new doc files).

### 🔒 Gate 3: Testing & Documentation Check

- [ ] **Docs updated:** every row in **Documentation Updates** completed; `.agents/docs.md` still accurate.
- [ ] **Gate 3 — Verified:** every checkbox above independently verified.

## Verification Plan

### Automated Tests

- [ ] **Type Check & Lint:** `pnpm turbo typecheck lint format:check` clean.
- [ ] **Test Synchronization:** all `*.test.ts` files green: `pnpm turbo test`.
- [ ] **Build Configuration:** confirm `tsconfig.json` `exclude` array does not need a new fixture path (fixtures live under `.agents/scripts/__fixtures__/` already excluded).
- [ ] **Unit (`.agents/scripts/bkit-tiers.test.ts`):** `pnpm vitest run bkit-tiers.test.ts` green; ≥ 7 `deepContains` rows green; envelope-related tests removed.
- [ ] **Integration (`.agents/scripts/bkit-modules.upgrade.integration.test.ts`):** `pnpm vitest run bkit-modules.upgrade.integration.test.ts` green; v0.5.x→v0.8.x→v2.0.0 chain fixture green (using `tests/fixtures/heavy-customised-consumer/` for the existing leg + new sibling `tests/fixtures/heavy-customised-consumer-v1-envelope/` for the new leg); heavy-customised consumer fixture green.
- [ ] **Integration (`.agents/scripts/bkit-doctor.integration.test.ts`):** `pnpm vitest run bkit-doctor.integration.test.ts` green; drift advisory + envelope advisory both surface through the `doctor` verb.
- [ ] **CLI smoke:** in a temp dir, run `pnpm bkit install --core --claude --cursor` followed by `pnpm bkit check`. Expect `Done. 0 write(s).` and zero advisories.
- [ ] **Migration smoke:** in a temp dir seeded with v1.1.1 fixtures (`__bkit__` envelope), run `pnpm bkit upgrade`. Expect log lines `[bkit] migrated .cursor/hooks.json — stripped __bkit__ envelope (v2.0.0)` and `[bkit] migrated .claude/settings.json — stripped __bkit__ envelope (v2.0.0)`. Confirm files no longer contain `__bkit__`. Run `pnpm bkit check` → green.
- [ ] **Run all tests:** `pnpm turbo lint typecheck format:check test`. Fix all failures before Gate 4.

### 🔒 Gate 4: Automated Verification Confirmed

- [ ] **Gate 4 — Verified:** all Automated Tests boxes above checked. Test outputs / CLI results captured.

### Manual Verification

> Dashboard ban: use `gh`, `pnpm bkit`, `git` — never ask the user to check a dashboard.

- [ ] **Step 1:** clone `app-gether-life` to a scratch path, bump `@cbartens/bkit` to the v2.0.0 candidate (local `pnpm pack` tarball), run `pnpm install && pnpm bkit upgrade`. Confirm:
  - `.cursor/hooks.json` and `.claude/settings.json` no longer contain `__bkit__`.
  - Consumer-added `hooks.Stop` and `failClosed` keys retained byte-identical (compare with `git diff` against pre-upgrade HEAD).
  - `pnpm bkit check` exits 0 with zero drift advisories.
- [ ] **Step 2:** repeat Step 1 against `visitfrasercoast-com` (lighter customisation profile). Confirm same outcome.
- [ ] **Step 3:** confirm net code reduction at PR review: `git diff --stat dev..HEAD -- '.agents/scripts/' '.agents/templates/'` shows ≥ 200 LOC deleted (matches Task 7 / Gate 2 scope).

---

## Phase 2 — Collapse Tier 1/2/3 (DEFERRED to v2.0.x patch unless complexity-check bundles)

> **Status:** scoped, but ship-decision deferred until Phase 1 complexity is known. If `plan-complexity-check.md` reports Phase 1 ≤ medium, bundle Phase 2 into the same v2.0.0 PR. Otherwise ship Phase 2 as v2.0.x within two weeks.

**Templates:**

- ADD `bkit:start..bkit:end` markers around current bkit-owned content in: `AGENTS.md`, `CLAUDE.md`, `.cursor/rules/00-shared-rules.mdc`, `.vale/styles/House/*.yml`, `.agents/{rules,docs,friction,skills}.md`, `docs/plans/template.md`.
- ADD small marker blocks in: `.github/workflows/ci.yml` (around `setup-auth` + `pnpm bkit check` steps), `.vale.ini` (`StylesPath`, `Packages`, `MinAlertLevel`, House style enable), `slop-scan.config.json` (bkit's required core rules).

**Code:**

- Simplify `.agents/scripts/bkit-manifest.ts` to `{ path, format }` (drop `tier`).
- Single-dispatch in `.agents/scripts/bkit-install.ts` based on format.

**Tests:**

- Marker presence enforcement on Group-A migrations.
- Tier-3 drift detection regression (e.g. `app-gether-life` missing `bkit check` step now caught).
- `ci.yml` heavy-customisation marker survival fixture (BAR-167 §6 open question — IN-SCOPE for Phase 2).

## Phase 3 — Cleanup (DEFERRED)

- Remove `tier3Hashes` from `.bkit-version` schema.
- Remove "Tier 1/2/3" terminology from `docs/architecture.md`, `docs/knowledge.md`, `bkit-tiers.ts` doc-blocks.
- Update `bkit-tiers.ts` doc-block to reflect single-model semantics.

---

## Open-Question Disposition (BAR-167 §6)

| Question | Disposition | Where tracked |
| --- | --- | --- |
| Cursor v1 keyed-object schema spike | **IN-SCOPE for v2.0.0 (Phase 1 prerequisite)** | Pre-Flight Conditional + Task 0a |
| Drop decorative `.cursor/hooks.json` echoes | **DEFERRED** | `docs/pending.md` |
| `bkit upgrade --prune` flag | **DEFERRED** (post-v2.0.0; not needed unless we drop a key) | `docs/pending.md` |
| `ci.yml` heavy-customisation marker survival fixture | **IN-SCOPE under Phase 2 if shipped, else DEFERRED with rest of Phase 2** | Phase 2 Tests block + `docs/pending.md` |

---

## Reviewer notes

> Reviewers `@bkit-plan-review-1` and `@bkit-plan-review-2`: please scrutinise in parallel. Focus areas:
>
> - **Reviewer 1:** array-containment semantics (`deepContains` for object-arrays — order-insensitive vs ordered), migration mechanic (`migrateLegacyBkitEnvelope`) idempotency, supersession inventory completeness.
> - **Reviewer 2:** test coverage against the Derived Test Matrix, two-version upgrade-chain fixture realism (v0.7.x → v0.8.0 → v2.0.0 keys retained), Phase boundary clarity, complexity-split decision logic.
>
> Verdict header at top of file: replace `PENDING` with `PASS|CONCERNS|FAIL` per reviewer; both verdicts must be `PASS` for promotion to `plan-v2-reviewed.md`.
