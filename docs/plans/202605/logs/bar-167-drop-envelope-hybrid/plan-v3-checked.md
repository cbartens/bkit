Verdict: CONCERNS

<!-- verdict:end -->

# BAR-167 — Template Ownership via Format-Aware Containment (v2.0.0 — Phases 1+2+3 bundled) Implementation Plan

> [!CAUTION]
> **CRITICAL:** Do not hallucinate plan execution state.
>
> 1. ALWAYS read this `plan.md` natively via `read_file` before executing any step.
> 2. NEVER trust system-generated session summaries or previous conversation history to determine what has been completed.
> 3. Source of truth is EXCLUSIVELY the literal `[x]` vs `[ ]` checkboxes in this physical document.

---

## Context & Goals

bkit v0.8.0 introduced a `__bkit__` JSON envelope (DE-7/DE-8, BAR-131/142) to give bkit a stable ownership record inside what was then called "Tier-2 JSON" (`.claude/settings.json`, `.cursor/hooks.json`). A consumer audit on 2026-05-09 (`app-gether-life` + `visitfrasercoast-com` against v1.1.1) surfaced two real-world failure modes:

1. `.cursor/hooks.json` ships duplicated content — once inside `__bkit__`, once at the top level — because Cursor only reads top-level keys but bkit's drift detection only inspects the envelope. Eight conversation turns were needed to explain the design to the user.
2. `.github/workflows/ci.yml` had silently lost its `pnpm bkit check` step — a drift class the "Tier-3 advisory only" model never caught.

BAR-167 collapses the artificial Tier 1/2/3 distinction into one rule:

> Every template file in `.agents/templates/` declares a **bkit-owned scope**. The consumer file must contain that scope intact. Everything outside is consumer territory.

Format mapping (applies uniformly across all formerly-Tier-1/2/3 files):

<!-- prettier-ignore -->
| Format | Bkit scope = | Drift check |
| --- | --- | --- |
| Text with `bkit:start..bkit:end` markers | Content between markers | Block byte-equal |
| Text without markers | Entire template | Whole-file byte-equal |
| JSON | Entire template's deep tree | Deep containment (template ⊆ consumer) |
| Empty scope (advisory-only) | Nothing (consumer fully owns) | No check |

This plan ships **bkit v2.0.0** as a single Major-Change PR bundling Phase 1 (drop the JSON envelope), Phase 2 (extend marker coverage to remaining template files + simplify manifest dispatch), and Phase 3 (terminology + schema cleanup). It supersedes plan-v3 (Phase-1-only) per the Plan-Phase Clarifications dated 2026-05-09. DE-7 and DE-8 are reversed; KN-8 is superseded.

**Success Criteria:**

- `pnpm bkit check` on a clean v2.0.0 install reports zero drift advisories on **all** surfaces (formerly-Tier-1/2/3 files alike — Group A full-ownership markers, Group B partial-ownership markers, Group C JSON deep-containment).
- `.cursor/hooks.json` schema-clean (Cursor v1 keyed-object: `hooks: { sessionStart: [...], sessionStop: [...] }`); `.claude/settings.json` top-level-only (no envelope).
- Two-version upgrade-survival regression: consumer keys (`hooks.Stop`, `failClosed`, `loop_limit`) survive byte-identical across v0.5.x → v0.8.x → v2.0.0 chain.
- Pre-v2.0.0 consumer with `__bkit__` envelope migrates cleanly on first `bkit upgrade`: envelope stripped, top-level keys retained, `bkit check` green.
- Tier-3 drift gate fires: a consumer who removes the `pnpm bkit check` step from `.github/workflows/ci.yml` post-Phase-2 will see `bkit check` flag the missing block (this is the regression class that broke `app-gether-life` silently on v1.1.1).
- Net code reduction (Phase 1 deletions only) ≥ 200 LOC across `.agents/scripts/` + `.agents/templates/`. Phase 2 may add some marker boilerplate; Phase 1 deletion target is tracked separately.
- No `Tier [123]` / `tier: [123]` strings remain in `docs/` after Phase 3 sweep (manifest data field becomes `format`).

---

## 👤 ⚠️ Acceptance Scenario — HUMAN REVIEW REQUIRED

> [!CAUTION]
> **🛑 HUMAN MUST READ AND CONFIRM THIS SECTION.**
> This is the testable contract for the feature. Everything below is derived from what you confirm here.

### Narrative _(plan-defined — no parent design)_

A consumer that installed bkit ≤ v1.1.1 runs `pnpm bkit upgrade` to v2.0.0. On the next install, the legacy `__bkit__` envelope in `.claude/settings.json` and `.cursor/hooks.json` is stripped, the templates ship as schema-clean JSON, and `pnpm bkit check` reports zero drift. The consumer's locally-added keys (`hooks.Stop`, `failClosed`, `loop_limit`) survive byte-identical. The bkit-owned subtree (`hooks.SessionStart`, `hooks.sessionStart`, `hooks.sessionStop`) is enforced as a deep-containment subset. Markered text files (`AGENTS.md`, `CLAUDE.md`, `.vale.ini` partial, `.github/workflows/ci.yml` partial) are validated by block byte-equal — consumer content outside the markers stays untouched, and a consumer who has accidentally removed bkit's marker block (e.g. the `pnpm bkit check` step from `ci.yml`) is now flagged at `bkit check` time instead of silently skipped.

### Success Criteria _(plan-defined)_

1. After upgrading from v0.8.0–v1.1.1 to v2.0.0, `pnpm bkit check` exits 0 with zero drift advisories on all formerly-Tier-1/2/3 surfaces. Pre-v0.8.0 direct upgrades are blocked at preflight with an explicit advisory routing through v1.x first.
2. `.cursor/hooks.json` template ships in Cursor v1 keyed-object schema; `.claude/settings.json` template ships top-level-only; neither file contains `__bkit__`.
3. Consumer-added keys outside the template's deep tree (e.g. `hooks.Stop`, `failClosed`, `loop_limit`) survive a v0.5.x → v0.8.x → v2.0.0 upgrade chain byte-identical.
4. Phase 2 markers added to `AGENTS.md`, `CLAUDE.md`, `.cursor/rules/00-shared-rules.mdc`, `.vale/styles/House/{Filler,Hedging,LLMSlop,Verbose}.yml`, `.agents/{rules,docs,friction,skills}.md`, `docs/plans/template.md` (full-ownership) and `.github/workflows/ci.yml`, `.vale.ini`, `slop-scan.config.json` (partial-ownership) — `bkit check` against each consumer surface enforces block byte-equal.
5. Phase 3 cleanup: `Tier [123]` / `tier: [123]` strings removed from `docs/`; `bkit-manifest.ts` schema simplified to `{ path, format, module }` (`format` ∈ `{"json", "markered-text", "byte-equal-text"}`); `bkit-tiers.ts` doc-block rewritten.
6. Net deletion ≥ 200 LOC across `.agents/scripts/` + `.agents/templates/` (Phase 1 deletions only — `applyBkitNamespace`, `extractBkitNamespace`, `migrateTier1JsonToTier2`, envelope branch of `writeTier2Json`, `bkit-tier1-defaults.ts`, plus envelope blocks in the two JSON templates).

### Concrete Example

**Setup:** A consumer repo on bkit `v1.1.1`. `.cursor/hooks.json` contains the `__bkit__` envelope and a duplicate top-level `hooks` array. `.claude/settings.json` contains the `__bkit__` envelope plus consumer-added `hooks.Stop` and `failClosed` keys. `.github/workflows/ci.yml` is a heavily customised v3+ CI workflow that previously lost its `pnpm bkit check` step (advisory-only Tier-3 never caught it). `AGENTS.md` is a 200-line consumer-tailored document.

**Steps:**

1. Consumer bumps `@cbartens/bkit` to `^2.0.0` and runs `pnpm install`.
2. Consumer runs `pnpm bkit upgrade`. bkit:
   - Detects `__bkit__` at top level of both JSON files; strips it; runs `deepContains(template, postStripConsumer)` and deep-merges the template (with template-wins schema-flip for the `.cursor/hooks.json` flat-array → keyed-object) where containment fails.
   - Wraps the existing bkit content in `AGENTS.md`, `CLAUDE.md`, etc. with `<!-- bkit:start --> ... <!-- bkit:end -->` markers (preserving consumer-added sections above/below).
   - Inserts the `Install Dependencies` (auth-bearing) + `Run Bkit Check` marker block into `.github/workflows/ci.yml`, restoring the missing `bkit check` step that v1.1.1 silently dropped. (Template has no `setup-auth` step — the `Install Dependencies` step is the auth surface.)
   - Inserts marker blocks for the required portions of `.vale.ini` and `slop-scan.config.json`.
3. bkit logs once per migrated JSON file: `[bkit] migrated .cursor/hooks.json — schema flip applied (flat-array → keyed-object) (v2.0.0)` and `[bkit] migrated .claude/settings.json — stripped __bkit__ envelope (v2.0.0)`.
4. Consumer runs `pnpm bkit check` → exits 0; zero drift advisories on Group A (full-marker), Group B (partial-marker), Group C (JSON containment).
5. Consumer commits. `git diff` shows: `__bkit__` block gone; Phase 2 markers added around bkit-owned content; consumer-only keys (`hooks.Stop`, `failClosed`) byte-identical.
6. Six months later, a teammate edits `.github/workflows/ci.yml` and inadvertently deletes the `pnpm bkit check` line inside the marker block. Next CI run, `pnpm bkit check` flags `tier2-text-drift` for `.github/workflows/ci.yml` — the regression that previously stayed silent is now caught.

**Outcome:** All bkit-managed surfaces — JSON, full-ownership text, partial-ownership text — validate by a single uniform model: "the template's bkit-owned scope must be intact in the consumer file." No envelope, no Tier number, no asymmetric advisory paths.

### Edge Cases

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| Consumer file is fresh-install on v2.0.0 (no `__bkit__` ever existed) | Template written as-is; `bkit check` zero-drift. |
| Consumer file contains `__bkit__` and post-strip top-level keys are missing the template's deep tree | Migration emits a deep-merge so template scope is restored, then logs the migration. Idempotent. |
| Consumer file has `__bkit__` but the bkit subtree is invalid JSON | Fallback to overwrite with template (matching today's malformed-JSON branch in `writeTier2Json`); migration logs and returns. |
| Consumer adds keys nested **inside** template-owned objects (e.g. `hooks.SessionStart` extra entry) | `deepContains` passes — every template element is present; consumer extras tolerated. |
| Consumer adds keys outside the template tree (`hooks.Stop`, `failClosed`, `loop_limit`) | Survive byte-identical. |
| Array-of-objects element ordering varies between template and consumer | `deepContains` for object-arrays uses order-insensitive deep-equal element-wise containment — passes. |
| Pre-v2.0.0 consumer runs `bkit check` before running `bkit upgrade` | Advisory `legacy-bkit-envelope-detected` surfaces; action `pnpm bkit upgrade`. No blocker. |
| Consumer deleted the template's deep tree pre-v2.0.0 (envelope stripped manually; no top-level mirror) | First `bkit upgrade` deep-merges template → file restored. |
| Consumer added a top-level `__bkit__` for **their own purpose** post-upgrade | Out-of-scope: migration runs once per file; subsequent `bkit check` ignores top-level `__bkit__` (deep-contains only walks template tree). Documented as collision risk in `docs/knowledge.md`. |
| **Schema-flip on type-mismatched same-path values** (consumer flat-array `hooks: [...]` vs template keyed-object `hooks: {...}`) | `writeTier2JsonContained` detects type-flip during deep-merge: template wins. Pre-strip envelope was the canonical source, so the flat-array `hooks` is dropped. `migrateLegacyBkitEnvelope` returns `{ stripped: true, deepMerged: true, schemaFlipped: true }`; logged as schema-flip variant. |
| **Pre-v0.8.0 consumer (Tier-1 flat shape, no envelope) runs `bkit upgrade` directly to v2.0.0** | Preflight blocker `pre-envelope-bkit-version-detected` (severity blocker): `pinnedVersion < 0.8.0` AND no `__bkit__`. Action: route through v1.x first. Avoids silent schema-flip / data-loss. |
| Consumer's `.bkit-version` is missing entirely AND consumer file lacks `__bkit__` | Treated as fresh install — template written as-is; pre-envelope blocker does NOT fire when no `pinnedVersion` is on record. |
| `deepContains` invoked with `null` template or `null` consumer at any path | `(null, null)` → ok. `(null, x)` → ok (consumer is superset of "nothing"). `(x, null)` → ok=false; `missing` lists the pathPrefix. |
| Phase 2: consumer file (e.g. `AGENTS.md`) has consumer content above + below the template content; no markers exist yet on first upgrade | `bkit upgrade` wraps the existing template content in markers in-place; consumer content above and below is preserved byte-identical. |
| Phase 2: consumer file has the marker block but content inside the markers is byte-different from template | `bkit check` flags `tier2-text-drift`. `bkit upgrade` restores the marker block to template content (block-level overwrite); content outside the markers is preserved. |
| Phase 2: consumer file has markers but the entire bkit content was deleted from inside the markers (e.g. `pnpm bkit check` step removed from `ci.yml`) | `bkit check` flags `tier2-text-drift` (block byte-equal fails). `bkit upgrade` restores the marker block. |
| Phase 2: consumer file removed the markers entirely (e.g. consumer deleted the `<!-- bkit:start -->` line by accident) | `bkit check` flags `markers-missing` advisory; `bkit upgrade` re-inserts markers + content above the closest reasonable insertion point. Edge case: if no insertion anchor exists, fallback is "append at EOF" with a one-time advisory log. |
| Phase 2: `.husky/pre-push` already has markers today; existing block expands or stays as-is | Existing marker block remains; bkit verifies byte-equal of the content between markers. Consumer's `bkit-repo only` lines below the markers are unchanged (already covered by the `# bkit-repo only — outside bkit:start..bkit:end` pattern in the current file). |
| Phase 3: consumer's `.bkit-version` retains `tier3Hashes` field after schema cleanup | Writer narrows emission to `byte-equal-text` files only (`.cursor/Dockerfile`); writer drops emission for `json` and `markered-text` formats. Reader retains backward-compat parsing for one minor version. **Critical:** writer must continue to emit `tier3Hashes` for `byte-equal-text` files — otherwise `bkit uninstall` for `.cursor/Dockerfile` falls into the "always preserve" branch (regression in uninstall safety). No consumer data migration needed (additive cleanup). |

### Derived Test Matrix

> Each row → one Agent Execution Runbook task.

<!-- prettier-ignore -->
| Test description | Type | Target file |
| --- | --- | --- |
| **Phase 1 — JSON containment primitives** |  |  |
| `deepContains` returns ok=true when consumer is a superset of template (objects nested 4 levels) | Unit (Vitest) | `.agents/scripts/bkit-tiers.test.ts` |
| `deepContains` returns ok=false with `missing` paths when a template key is absent | Unit (Vitest) | `.agents/scripts/bkit-tiers.test.ts` |
| `deepContains` returns ok=false with `mismatched` paths when a leaf primitive differs | Unit (Vitest) | `.agents/scripts/bkit-tiers.test.ts` |
| `deepContains` array-of-primitives uses subset semantics | Unit (Vitest) | `.agents/scripts/bkit-tiers.test.ts` |
| `deepContains` array-of-objects uses order-insensitive deep-equal element-wise containment | Unit (Vitest) | `.agents/scripts/bkit-tiers.test.ts` |
| `deepContains` array-of-objects asymmetric size: template has 1 element, consumer has 2 elements (1 deep-equal to template + 1 consumer extra) → ok=true (every template element present; consumer extras tolerated) | Unit (Vitest) | `.agents/scripts/bkit-tiers.test.ts` |
| `deepContains` mixed-array (primitives + objects) uses element-wise per-type semantics; `missing` reports element index path | Unit (Vitest) | `.agents/scripts/bkit-tiers.test.ts` |
| `deepContains` null-input boundary cases: (null,null)→ok; (null,obj)→ok; (obj,null)→missing path | Unit (Vitest) | `.agents/scripts/bkit-tiers.test.ts` |
| `writeTier2JsonContained` writes template as-is when destination missing | Unit (Vitest) | `.agents/scripts/bkit-tiers.test.ts` |
| `writeTier2JsonContained` deep-merges and idempotents on re-run with identical state | Unit (Vitest) | `.agents/scripts/bkit-tiers.test.ts` |
| `writeTier2JsonContained` schema-flip: type-mismatched same-path values → template wins | Unit (Vitest) | `.agents/scripts/bkit-tiers.test.ts` |
| `migrateLegacyBkitEnvelope` strips `__bkit__`, retains top-level keys, deep-merges template if absent | Unit (Vitest) | `.agents/scripts/bkit-tiers.test.ts` |
| `migrateLegacyBkitEnvelope` reports `schemaFlipped: true` when post-strip top-level value type-flips against template — **MUST use Task-0c fixture `tests/fixtures/heavy-customised-consumer-v1-envelope/cursor-hooks.json` BEFORE shape** (compound: `__bkit__` keyed-object + top-level flat-array `hooks`); template is the v1 keyed-object schema; expect `{ stripped: true, deepMerged: true, schemaFlipped: true }` | Unit (Vitest) | `.agents/scripts/bkit-tiers.test.ts` |
| `stripTier2JsonScope` removes template scope, preserves consumer-only siblings, prunes empty intermediates only where template populated them | Unit (Vitest) | `.agents/scripts/bkit-uninstall.test.ts` |
| Cursor v1 keyed-object schema sanity: parsed template has `version === 1`, `hooks.sessionStart` and `hooks.sessionStop` arrays, no `__bkit__`, no flat-array `hooks` | Unit (Vitest) | `.agents/scripts/bkit-tiers.test.ts` (block `cursor-v1-schema`) |
| **Phase 1 — Upgrade chain & migration** |  |  |
| Pre-v2.0.0 fixture (`__bkit__` + top-level mirror) → upgrade → file matches schema-clean snapshot | Integration (Vitest) | `.agents/scripts/bkit-modules.upgrade.integration.test.ts` |
| Upgrade chain v0.5.x → v0.8.x → v2.0.0 preserves `hooks.Stop`, `failClosed`, `loop_limit` byte-identical (v0.5.x leg uses existing `tests/fixtures/heavy-customised-consumer/`; v0.8.x leg uses new sibling fixture `tests/fixtures/heavy-customised-consumer-v1-envelope/`) | Integration (Vitest) | `.agents/scripts/bkit-modules.upgrade.integration.test.ts` |
| Heavy-customised consumer fixture (BAR-131 sub-plan-2) survives v2.0.0 upgrade with bkit scope intact | Integration (Vitest) | `.agents/scripts/bkit-modules.upgrade.integration.test.ts` |
| Idempotency — running `bkit upgrade` twice on a v2.0.0 file is a no-op | Integration (Vitest) | `.agents/scripts/bkit-modules.upgrade.integration.test.ts` |
| `bkit check` advisory `legacy-bkit-envelope-detected` surfaces on pre-v2.0.0 consumer fixture; exits 0 | Integration (Vitest) | `.agents/scripts/bkit-modules.integration.test.ts` |
| `bkit check` advisory `tier2-json-drift` surfaces when consumer file is missing a template key — covers `.cursor/hooks.json`, `.claude/settings.json`, **AND `slop-scan.config.json`** (drop one of the ten required `rules` keys from a fixture's `slop-scan.config.json` → `bkit check` raises `tier2-json-drift` for that file with the missing key in the `missing` payload) | Integration (Vitest) | `.agents/scripts/bkit-modules.integration.test.ts` |
| `bkit check` blocker `pre-envelope-bkit-version-detected` surfaces when on-disk `pinnedVersion < 0.8.0` and no `__bkit__` | Integration (Vitest) | `.agents/scripts/bkit-modules.integration.test.ts` |
| `bkit doctor` integration: drift advisory and `legacy-bkit-envelope-detected` surface through doctor verb | Integration (Vitest) | `.agents/scripts/bkit-doctor.integration.test.ts` |
| `bkit uninstall --claude` strips template scope; retains consumer-added `hooks.Stop`, `failClosed` byte-identical | Integration (Vitest) | `.agents/scripts/bkit-modules.integration.test.ts` |
| `bkit uninstall --cursor` strips template scope (`hooks.sessionStart`/`hooks.sessionStop`); retains consumer-only top-level + nested keys | Integration (Vitest) | `.agents/scripts/bkit-modules.integration.test.ts` |
| **Phase 2 — Marker enforcement & dispatch** |  |  |
| Marker presence enforcement: every newly-markered template file (`AGENTS.md`, `CLAUDE.md`, `.cursor/rules/00-shared-rules.mdc`, `.vale/styles/House/{Filler,Hedging,LLMSlop,Verbose}.yml`, `.agents/{rules,docs,friction,skills}.md`, `docs/plans/template.md`) has its bkit content within `bkit:start..bkit:end` markers | Unit (Vitest) | `.agents/scripts/bkit-templates.test.ts` (NEW) |
| Marker presence enforcement (partial-ownership): `.github/workflows/ci.yml` markers wrap exactly the `Install Dependencies` step + `Run Bkit Check` step (existing step names — see Task 18 spec); `.vale.ini` markers wrap `StylesPath` + `Packages` + `MinAlertLevel` + House style enable | Unit (Vitest) | `.agents/scripts/bkit-templates.test.ts` (NEW) |
| `slop-scan.config.json` deep-containment: each of the ten required rule keys (`comments.placeholder-comments`, `structure.over-fragmentation`, `structure.directory-fanout-hotspot`, `structure.duplicate-function-signatures`, `structure.barrel-density`, `structure.pass-through-wrappers`, `defensive.empty-catch`, `defensive.error-swallowing`, `defensive.error-obscuring`, `defensive.async-noise`) is present in the consumer file with `enabled: true` — JSON deep-containment, NOT markers (JSON has no comment syntax) | Unit (Vitest) | `.agents/scripts/bkit-templates.test.ts` (NEW) |
| Tier-3 drift regression: consumer `ci.yml` fixture with the `pnpm bkit check` step manually removed from inside marker block → `bkit check` flags `tier2-text-drift` for that file | Integration (Vitest) | `.agents/scripts/bkit-modules.integration.test.ts` |
| Heavy-customised `ci.yml` survival: consumer's surrounding job structure (other steps, custom env, custom matrix) is preserved byte-identical across `bkit upgrade`; only the marker block is enforced | Integration (Vitest) | `.agents/scripts/bkit-modules.upgrade.integration.test.ts` |
| `bkit check` single-dispatch by `format`: `format: "json"` runs `deepContains`; `format: "markered-text"` runs marker block extraction + byte-equal; `format: "byte-equal-text"` runs whole-file byte-equal | Unit (Vitest) | `.agents/scripts/bkit-modules.test.ts` |
| `.husky/pre-push` marker block survives consumer customisation (existing markers retained; consumer's `bkit-repo only` lines below markers preserved) | Integration (Vitest) | `.agents/scripts/bkit-modules.integration.test.ts` |
| **Phase 3 — Schema & terminology cleanup** |  |  |
| `parseBkitVersion` reads a v2.0.0 `.bkit-version` JSON missing `tier3Hashes` and returns `tier3Hashes: {}` (backward-compat for one minor version) | Unit (Vitest) | `.agents/scripts/bkit-version.test.ts` |
| `writeBkitVersion` after narrowed writer change: emitted `tier3Hashes` map contains only `byte-equal-text` paths (`.cursor/Dockerfile`); `json` and `markered-text` paths absent | Unit (Vitest) | `.agents/scripts/bkit-version.test.ts` |
| `bkit uninstall .cursor/Dockerfile` safe-delete: when consumer hash matches `tier3Hashes` entry → file deleted; when consumer modified → preserved | Integration (Vitest) | `.agents/scripts/bkit-modules.integration.test.ts` |
| `bkit-tiers.ts` doc-block grep: no `Tier 1`, `Tier 2`, `Tier 3` strings remain | Static check (Vitest snapshot or grep-in-test) | `.agents/scripts/bkit-tiers.test.ts` |
| `docs/` grep: no `Tier [123]` strings remain (excluding superseded-history references in `KN-8` and superseded `DE-` entries which retain context) | Static check (npm script + CI) | `package.json` `scripts.lint:no-tier-terms` |

### 👤 ✅ Human Confirmation

- [ ] **Acceptance Scenario confirmed:** I have reviewed the Narrative, Success Criteria, Concrete Example, Edge Cases, and Derived Test Matrix above. They correctly describe what "done" looks like.

> [!NOTE]
> The header verdict at the top of this file (`PASS|CONCERNS|FAIL`) is the **plan-review** verdict, set by the auto-review pipeline. It is **independent** from this human-confirmation checkbox. A build agent must verify both: (a) the header is `PASS` (or `CONCERNS` with reviewer waivers), AND (b) this checkbox is `[x]`.

> [!CAUTION]
> **Agent:** Do NOT pass Gate 1 until this checkbox is `[x]`. Summary must issue `REVISE` if unchecked.

---

## 👤 ⚠️ Breaking Changes & Naming Review — HUMAN REVIEW REQUIRED

> [!CAUTION]
> **🛑 HUMAN MUST READ AND CONFIRM THIS SECTION.**

### Breaking changes (bkit v2.0.0)

1. **`__bkit__` envelope removed** from `.agents/templates/.claude/settings.json` and `.agents/templates/.cursor/hooks.json`. Tier-2 JSON ownership now uses **deep containment** — every template path must be present (deep-equal) in the consumer file. Reverses DE-7 and DE-8.
2. **Public API surface deletions** (exported from `.agents/scripts/bkit-tiers.ts`):
   - `applyBkitNamespace`
   - `extractBkitNamespace`
   - `migrateTier1JsonToTier2`
   - Envelope branch of `writeTier2Json` (function renamed; signature unchanged)
   - `BKIT_TIER1_DEFAULTS_BY_VERSION` (and the entire file `.agents/scripts/bkit-tier1-defaults.ts`)
3. **`writeTier2Json` rename → `writeTier2JsonContained`**; callers in `.agents/scripts/bkit-modules.ts` updated.
4. **`.cursor/hooks.json` template schema migrated** from legacy flat-array to **Cursor v1 keyed-object** (`hooks: { sessionStart: [...], sessionStop: [...] }`). DE-7 spike confirmed acceptance; **no runtime spike re-run required for v2.0.0** (Plan-Phase Decision 2 — skip spike).
5. **Migration mechanic** — `bkit upgrade` post-v2.0.0 runs `migrateLegacyBkitEnvelope` once per consumer file. Idempotent. Logs `[bkit] migrated <file> — stripped __bkit__ envelope (v2.0.0)` (or schema-flip variant).
6. **`bkit-manifest.ts` schema simplified** — entries flip from `{ path, tier, module, packageJsonKeys? }` to `{ path, format, module, packageJsonKeys? }` where `format` ∈ `{"json", "markered-text", "byte-equal-text"}`. The `tier: 1|2|3` integer is removed entirely. All callers (`bkit-uninstall.ts`, `bkit-install.ts`, `bkit-modules.ts`) updated to dispatch on `format`.
7. **Phase 2 marker addition** — bkit's templates for `AGENTS.md`, `CLAUDE.md`, `.cursor/rules/00-shared-rules.mdc`, `.vale/styles/House/{Filler,Hedging,LLMSlop,Verbose}.yml`, `.agents/{rules,docs,friction,skills}.md`, `docs/plans/template.md` now include `<!-- bkit:start -->` / `<!-- bkit:end -->` (md/mdc) or `# bkit:start` / `# bkit:end` (YAML) wrapping the bkit-owned content. `.github/workflows/ci.yml`, `.vale.ini`, `slop-scan.config.json` get small marker blocks around required portions only.
8. **Phase 3 schema cleanup** — `tier3Hashes` removed from `.bkit-version` writer (reader retains backward-compat for one minor version). `Tier [123]` terminology removed from docs.
9. **CHANGELOG.md** v2.0.0 entry: `BREAKING — Format-aware containment replaces Tier 1/2/3 model. __bkit__ envelope removed; consumer JSON files auto-migrated on first upgrade. Phase 2 markers added to AGENTS.md, CLAUDE.md, .vale/styles/House/*.yml, .agents/*.md, docs/plans/template.md, .github/workflows/ci.yml (partial), .vale.ini (partial), slop-scan.config.json (partial). Phase 3 retires Tier terminology. See DE-16 / KN-15.`

### Naming decisions

- New unit primitive: **`deepContains(template: JsonValue, consumer: JsonValue, pathPrefix?: string): { ok: boolean; missing: string[]; mismatched: string[] }`** in `.agents/scripts/bkit-tiers.ts` (~60 LOC).
- New top-level helper: **`writeTier2JsonContained(srcPath, dstPath, dryRun, ws)`** — replaces envelope branch of `writeTier2Json`.
- New migration helper: **`migrateLegacyBkitEnvelope(doc, template) → { stripped, deepMerged, schemaFlipped, outDoc }`** — pure JSON utility, no file I/O. Caller in `bkit-modules.ts` handles read/parse/write + atomic-write pattern.
- New uninstall helper: **`stripTier2JsonScope(consumerDoc, templateDoc) → trimmedDoc`** — pure JSON; walks template tree, deletes matching leaves, preserves consumer-only siblings, prunes empty intermediates only where template populated them; does NOT prune arrays.
- New paths module: **`.agents/scripts/bkit-paths.ts`** — single export `getPkgRoot()` lifted from `bkit-modules.ts`. Breaks the `bkit-preflight ↔ bkit-modules` import cycle.
- New manifest field shape: **`{ path, format, module, packageJsonKeys? }`** with `format ∈ {"json", "markered-text", "byte-equal-text"}`. The `tier: 1|2|3` integer is deleted.
- New decision entry: **`DE-16: BAR-167 — Format-aware containment (markers + JSON deep-contain) replaces Tier 1/2/3 model (2026-05-09)`** supersedes DE-7 + DE-8.
- New knowledge entry: **`KN-15: BAR-167 — Format-aware containment is canonical for bkit ownership`** supersedes KN-8 (existing KN-9 is unrelated — `.bkit-version` migration reads — and stays).

### Schema migrations

- `.bkit-version` writer **narrows** `tier3Hashes` content from "all tier-3 files" to "byte-equal-text files only" (Phase 3). Reader retains backward-compat parsing for one minor version (v2.0.x). Writer emits `{ pinnedVersion, canonicalHashes, tier3Hashes }` where `tier3Hashes` now contains only entries with `format: "byte-equal-text"` (currently `.cursor/Dockerfile`). The field is still required by `bkit-uninstall.ts`'s `shouldDeleteTier3` for the byte-equal-text branch — dropping it entirely would silently regress uninstall safety on `.cursor/Dockerfile`.

### 👤 ✅ Human Confirmation

- [ ] **Breaking Changes confirmed:** I have reviewed all breaking changes and naming decisions above.

> [!CAUTION]
> **Agent:** Do NOT pass Gate 1 until this checkbox is `[x]`. Summary must issue `REVISE` if unchecked.

---

## Alternative Approaches & Recommendations

<!-- prettier-ignore -->
| Option | Mechanism | Verdict |
| --- | --- | --- |
| A. Markers everywhere | `bkit:start..bkit:end` in every file (incl. JSON via wrapper key) | Rejected — JSON has no comments; falls back to a wrapper key (`__bkit__`) — exactly the model BAR-167 reverses. |
| B. Containment everywhere | Set/subset semantics for all formats | Rejected — text loses ordering/contiguity (e.g. `pnpm typecheck && pnpm test` ≠ `pnpm test && pnpm typecheck`). |
| C. Three-way merge everywhere (`diff3`) | Algorithmic merge using stored historical templates | Rejected — 3–5× hybrid LOC; bundled historical templates per shipped version (already painful for `bkit-tier1-defaults.ts`); silent-corruption risk on overlapping edits. |
| **D. Hybrid — markers (text) + containment (JSON)** | Two mechanisms, one mental model: "bkit's scope must be intact" | **Selected.** Native ownership signals per format; net code reduction ≥ 200 LOC; cheap migration. |
| E. Phase 1 only (defer Phase 2/3) | Original plan-v3 scope | Rejected per Plan-Phase Decision 1 — bundle all three phases as v2.0.0 to avoid dragging the Tier terminology and partial-ownership test gap across two ship cycles. |

**Future phases (recommended — post-v2.0.0):**

- **`bkit upgrade --prune`** flag — cleans orphan keys when bkit drops a previously-shipped key. Not needed unless a future v2.x drops a key. Tracked in `docs/pending.md`.
- **Drop decorative `.cursor/hooks.json` echoes entirely** — Plan-Phase Decision 3 = KEEP; revisit if echo noise proves a confusion source. Tracked in `docs/pending.md`.

## Out of Scope

- **`bkit upgrade --prune` flag** — deferred. Tracked in `docs/pending.md`.
- **Drop decorative `.cursor/hooks.json` echoes** — Plan-Phase Decision 3 = KEEP. Tracked in `docs/pending.md`.
- **Consumer-repo migrations beyond bkit's own templates** — `app-gether-life` and `visitfrasercoast-com` run `pnpm bkit upgrade` themselves post-v2.0.0 release. Manual fixes already applied during the audit are left uncommitted in those consumer repos for human review (Plan-Phase Decision 5).
- **Cursor v1 runtime spike (Task 0a in plan-v3)** — REMOVED per Plan-Phase Decision 2; DE-7 already verified Cursor's keyed-object schema acceptance.
- **Pre-v0.8.0 direct upgrades** — blocked at preflight; consumer routed through v1.x first via `pre-envelope-bkit-version-detected` blocker. No v0.5.x → v2.0.0 schema-flip code path.

## Merge Method

**Merge method: always squash.** Plan does NOT request `rebase` or `merge-commit`. `bkit-ship.md` Step 3 is hardcoded to `gh pr merge --squash --delete-branch --body ""`.

## Supersession Inventory

<!-- prettier-ignore -->
| Existing artifact | Replaced by | Decision | Justification |
| --- | --- | --- | --- |
| `.agents/scripts/bkit-tiers.ts` → `extractBkitNamespace` | `deepContains` (new, same file) | DELETE | Envelope contract removed; deep-containment replaces extract+hash drift detection. |
| `.agents/scripts/bkit-tiers.ts` → `applyBkitNamespace` | (none — no longer needed) | DELETE | Envelope removed; consumer file is no longer wrapped under `__bkit__`. |
| `.agents/scripts/bkit-tiers.ts` → `migrateTier1JsonToTier2` | `migrateLegacyBkitEnvelope` (new, same file) | DELETE | Migrates the inverse direction: post-envelope → schema-clean. Old function obsolete. |
| `.agents/scripts/bkit-tiers.ts` → envelope branch of `writeTier2Json` | `writeTier2JsonContained` (renamed; envelope guard removed) | DELETE | Envelope-guard `throw` is rolled back; deep-merge is the only Tier-2 JSON write path. |
| `.agents/scripts/bkit-tier1-defaults.ts` (full file) | (none) | DELETE | Sole consumer was `migrateTier1JsonToTier2`. New `migrateLegacyBkitEnvelope` reads the on-disk top-level mirror directly. |
| `.agents/scripts/bkit-tier1-defaults.test.ts` | (none) | DELETE | Tests for the deleted module. |
| `.agents/templates/.claude/settings.json` (envelope wrapper) | Schema-clean top-level template | DELETE | Top-level keys remain; `__bkit__` block deleted. |
| `.agents/templates/.cursor/hooks.json` (envelope wrapper + flat-array `hooks`) | Cursor v1 keyed-object schema, schema-clean | DELETE | Migrated to `hooks: { sessionStart: [...], sessionStop: [...] }`; envelope removed. |
| `.agents/scripts/bkit-manifest.ts` `tier: 1 | 2 | 3` integer field | `format: "json" | "markered-text" | "byte-equal-text"` field | DELETE | Phase 2 collapses Tier numbering into format-aware dispatch. All callers switch on `format` instead of `tier`. |
| `.agents/scripts/bkit-uninstall.ts` `case 1`/`case 2`/`case 3` switch | Single dispatch on `entry.format` → `stripTier2JsonScope` (json) / marker extraction (markered-text) / hash-or-byte-equal (byte-equal-text) | DELETE | Phase 2 unifies uninstall semantics with install / check semantics. |
| `.bkit-version` writer field `tier3Hashes` | (writer narrows to `byte-equal-text` files only — namely `.cursor/Dockerfile`; reader keeps backward-compat parse for one minor version) | RETAIN-WITH-REASON (writer-side narrowing) | Phase 3 — `stripTier2JsonScope` (json) + marker extraction (markered-text) make `tier3Hashes` redundant for those branches. **`byte-equal-text` safe-delete in `bkit-uninstall.ts:196` (`shouldDeleteTier3`) still needs the hash** — without it, `.cursor/Dockerfile` becomes "always preserve" on uninstall, a silent regression in uninstall safety. Writer narrows to `byte-equal-text` only; reader-side parse retained for one minor version on graceful upgrade. Field stays required in `BkitVersion` since writer continues emitting it for the `byte-equal-text` branch. |
| `Tier 1` / `Tier 2` / `Tier 3` terminology in `docs/architecture.md`, `docs/testing.md`, `docs/decisions.md` (DE-5 retained as historical), `docs/knowledge.md` (KN-8 retained as superseded history), `bkit-tiers.ts` doc-block | Format-aware containment / managed-scope terminology | DELETE | Phase 3 — single mental model; old terminology is now misleading. Historical references in superseded DE/KN entries explicitly retained per append-only docs contract. |
| `getPkgRoot()` in `.agents/scripts/bkit-modules.ts` (current location) | Lifted to new `.agents/scripts/bkit-paths.ts` | RETAIN-WITH-REASON | Function body relocated, not deleted; old call site re-imports from new location. Breaks the `bkit-preflight ↔ bkit-modules` cycle. |
| `.agents/templates/.husky/pre-push` marker block (already exists today) | Same markers; verified scope expands to cover any new bkit content | RETAIN-WITH-REASON | File already conforms; Phase 2 only verifies block scope is correct. |
| DE-7 (`__bkit__` namespace spike) | DE-16 (this plan) | RETAIN-WITH-REASON | Decision history is append-only. New entry marks DE-7 superseded with date + BAR-ID. |
| DE-8 (`__bkit__` envelope contract) | DE-16 (this plan) | RETAIN-WITH-REASON | Decision history is append-only. New entry marks DE-8 superseded with date + BAR-ID. |
| KN-8 (Tier-2 deep-merge canonical) | KN-15 (deep-containment + format-aware canonical) | RETAIN-WITH-REASON | Knowledge entries are append-only. KN-8 stays with a "superseded by KN-15 (BAR-167)" note. |
| `docs/pending.md` entry "Cursor v1 keyed-object schema deeper validation if Task 0a spike surfaces issues (2026-05-09)" | (deleted — Task 0a removed per Plan-Phase Decision 2) | DELETE | Pending entry is obsolete — no spike runs in v2.0.0; if hooks ever fail in the wild a fresh issue is created. |

> [!CAUTION]
> Default = `DELETE`. Decision-history rows (DE-7, DE-8, KN-8) use `RETAIN-WITH-REASON` because `docs/decisions.md` and `docs/knowledge.md` are append-only.

## Security & Privacy

- [x] **New API route** — N/A.
- [x] **New DB table/column** — N/A.
- [x] **Role-gated mutation** — N/A.
- [x] **User input** — N/A; internal CLI behaviour.
- [x] **PII** — N/A.
- [x] **Redirect URL** — N/A.
- [x] **Webhook** — N/A.
- [x] **New secret/env var** — N/A.

_None apply — refactor of bkit's own template ownership model with no new routes, DB writes, secrets, or user input._

## 🚨 Pre-Flight / Dependencies 🚨

### Core (always verify)

- [ ] **Package Management:** verify `package.json` has no new runtime deps; `pnpm-lock.yaml` syncs cleanly. No new deps expected — `deepContains` is a pure recursive walk.
- [ ] **Dependency Versions:** `pnpm outdated`; spot-check `pnpm --version`, `node --version`, `vitest --version`.
- [ ] **User Context:** verify read/write to `.agents/scripts/`, `.agents/templates/`, `docs/decisions.md`, `docs/knowledge.md`, `docs/architecture.md`, `docs/testing.md`, `CHANGELOG.md`, `README.md`, `docs/pending.md`.
- [ ] **Pending Blockers:** query Linear for open issues labelled `blocker` touching bkit templates / Tier-2 / `__bkit__` / `bkit upgrade`.
- [ ] **Project Context:** read `docs/decisions.md` (DE-5, DE-6, DE-7, DE-8, DE-10, DE-12, DE-13), `docs/knowledge.md` (KN-8, KN-13), `docs/architecture.md` (Tier-2 JSON section).
- [ ] **Testing & Quality:** new tests under `.agents/scripts/*.test.ts` (unit) and `.agents/scripts/*.integration.test.ts` per `docs/testing.md`.
- [ ] **Prerequisite Plans:** none — BAR-167 is self-contained.

### Conditional (verify only when applicable)

- [ ] **Architecture & UI** _(N/A)_.
- [ ] **Observability** _(new log lines)_: confirm `[bkit] migrated <file> — stripped __bkit__ envelope (v2.0.0)` and the schema-flip variant follow `[Context] Message` regex from `.agents/rules.md`.

### 🔒 Gate 1: Prerequisites Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all applicable boxes above. **DO NOT stop for user permission.** Once saved, immediately proceed to `Architecture & Component Changes`.

- [ ] **Acceptance Scenario confirmed:** Human confirmed `👤 Acceptance Scenario` (checkbox `[x]`).
- [ ] **Breaking Changes confirmed:** Human confirmed `⚠️ Breaking Changes & Naming Review` (checkbox `[x]`).
- [ ] **Gate 1 — Verified:** all Core items checked; all applicable Conditional items checked.

## Data Schema Integration

### Data Schema Usage (Inputs & Outputs)

None — no DB tables read or written. Operates exclusively on bkit's local template files and consumer's `.cursor/`, `.claude/`, `.github/workflows/`, etc. via the `bkit` CLI.

### Data Schema Changes

None.

## Architecture & Component Changes

> All paths absolute under repo root `.worktrees/bar-167-drop-envelope-hybrid/`.

### Phase 1 — Drop the JSON envelope (REQUIRED for v2.0.0)

#### Templates

##### [MODIFY] `.agents/templates/.cursor/hooks.json`

- **Existence Check:** verified — currently contains `__bkit__` envelope + flat-array shape (24 lines).
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
- **Rationale:** DE-7 spike confirmed Cursor accepts both shapes; v1 keyed-object is the documented schema. **No runtime spike re-run** (Plan-Phase Decision 2).

##### [MODIFY] `.agents/templates/.claude/settings.json`

- **Existence Check:** verified — `__bkit__` wraps `hooks.SessionStart`.
- **Change:** drop the `__bkit__` block. Top-level keys remain unchanged (existing top-level `hooks.SessionStart` is the canonical source).

#### Code

##### [ADD] `.agents/scripts/bkit-paths.ts` _(break circular import)_

- **New file** — single export `getPkgRoot(): string`. Lift implementation verbatim from `bkit-modules.ts` ~lines 90–95.
- **Why:** `bkit-preflight.ts` (drift detection) and `bkit-modules.ts` (template resolution for migration) both need pkg-root. Stand-alone `bkit-paths.ts` breaks the `bkit-preflight ↔ bkit-modules` cycle.
- **Imports allowed in `bkit-paths.ts`:** `node:path`, `node:url`, `node:fs` only.

##### [MODIFY] `.agents/scripts/bkit-tiers.ts`

- **Existence Check:** verified.
- **ADD `deepContains(template, consumer, pathPrefix?)`** (~60 LOC):
  - Recursive walk; returns `{ ok, missing, mismatched }`.
  - Object containment: every template key present in consumer at deep-equal value.
  - Array of primitives: subset semantics (template ⊆ consumer; duplication tolerated).
  - Array of objects: element-wise; **order-insensitive** deep-equal containment.
  - Mixed arrays: per-element-type semantics; `missing` reports element index path.
  - Null-input boundary: `(null,null)` → ok; `(null,obj)` → ok; `(obj,null)` → ok=false with `missing=[pathPrefix]`.
- **ADD `writeTier2JsonContained(srcPath, dstPath, dryRun, ws): void`**:
  - dest absent → write template as-is.
  - dest present → run `deepContains(template, existing)`. `ok=true` and content unchanged → no-op. `ok=false` → `deepMergeJson(existing, template)` (template as override; existing helper signature at `bkit-tiers.ts:33`); write result.
  - **Schema-flip rule:** template and consumer values at the same path of different JSON kinds → template wins; surface `schemaFlipped: true` flag.
  - Idempotent on identical state.
- **ADD `migrateLegacyBkitEnvelope(doc, template) → { stripped, deepMerged, schemaFlipped, outDoc }`**:
  - **Pure function** — no file I/O, no `getPkgRoot()` import.
  - `__bkit__` absent → `{ stripped: false, deepMerged: false, schemaFlipped: false, outDoc: doc }`.
  - Strip `__bkit__` → `postStripDoc`. `deepContains(template, postStripDoc)` → if ok=true return without merge; else `deepMergeJson(postStripDoc, template)` → return with `deepMerged: true` and `schemaFlipped` reflecting any path type-flip.
  - Caller in `bkit-modules.ts` reads file, parses, resolves template, writes (atomic temp+rename), and logs.
  - Idempotent — re-run on a doc without `__bkit__` is a no-op.
- **DELETE:**
  - `applyBkitNamespace`
  - `extractBkitNamespace`
  - `migrateTier1JsonToTier2`
  - Envelope-guard `throw` and inner branch in `writeTier2Json`. Function renamed `writeTier2JsonContained`; signature unchanged.
- **Doc-block update (Phase 3):** rewrite the `Tier 2` header to describe deep-containment + deep-merge semantics; remove all references to `__bkit__` and `Tier 1/2/3`. Single-model semantics: format-aware containment.

##### [MODIFY] `.agents/scripts/bkit-modules.ts`

- **Existence Check:** verified.
- **`runClaudeModule`:**
  - Read consumer at `settingsDst`.
  - Resolve template via `getPkgRoot()` (now imported from `./bkit-paths`) + `path.join(pkgRoot, ".agents/templates/.claude/settings.json")`; JSON.parse.
  - Call `migrateLegacyBkitEnvelope(parsedDoc, parsedTemplate)`. Capture `{ stripped, deepMerged, schemaFlipped, outDoc }`. If `stripped` → write `outDoc` to disk via **atomic-write pattern** (write to `${dst}.bkit-tmp` → `fs.renameSync` over `dst`); append to `ws`.
  - Then call `writeTier2JsonContained(settingsSrc, settingsDst, dryRun, ws)`.
  - Log `[bkit] migrated <file> — stripped __bkit__ envelope (v2.0.0)` when stripped; additionally `[bkit] migrated <file> — schema flip applied (flat-array → keyed-object) (v2.0.0)` when `schemaFlipped`.
  - Drop the `versionFile` / `onDiskVersion` lookup block (migration is version-agnostic).
- **`runCursorModule`:** mirror `.cursor/hooks.json`. Schema-flip log line is especially relevant here (template format itself is changing).
- **Imports:** drop `migrateTier1JsonToTier2`, `writeTier2Json`; add `migrateLegacyBkitEnvelope`, `writeTier2JsonContained`. Retain `readBkitVersion` (still used by `postDispatch` for `canonicalHashes`).
- **Atomic-write rationale:** mid-write crash leaves file fully pre-migration or fully post-migration — never truncated. Malformed-JSON parse failure falls through to existing "malformed JSON → overwrite with template" branch in `writeTier2JsonContained`; do NOT invoke migration on unparsed string.
- **Circular-import note:** `migrateLegacyBkitEnvelope` is parameter-driven; only `bkit-modules.ts` imports `getPkgRoot`. `bkit-tiers.ts` imports nothing from `bkit-modules.ts`.

##### [MODIFY] `.agents/scripts/bkit-preflight.ts`

- **Allow-list extension (header comment):** permit `readBkitVersion` from `bkit-version.ts`, `deepContains` from `bkit-tiers.ts`, `getPkgRoot` from `bkit-paths.ts`. None introduce a cycle.
- **ADD advisory `legacy-bkit-envelope-detected`** — fires when `bkit check` / `bkit doctor` sees `__bkit__` at the top level of `.cursor/hooks.json` or `.claude/settings.json`. **Condition is simply `__bkit__` presence at the top level — no version-tag check.** (Rationale: `canonicalHashes` is a sha256 map of file content at install time; it does NOT record a per-file version stamp, so the originally-proposed "AND `canonicalHashes` indicate a pre-v2.0.0 last-write" predicate is unimplementable against the current `BkitVersion` schema.) **Optional belt-and-suspenders:** if `pinnedVersion` from `.bkit-version` is on disk and parses < `"2.0.0"`, suppress is unnecessary — fire regardless because the file shape itself is the signal. Severity advisory; non-blocking. Action: `Run pnpm bkit upgrade to migrate to the v2.0.0 ownership model.` Does NOT fire on fresh-v2.0.0 installs (no `__bkit__` at top level of the file).
- **ADD advisory `tier2-json-drift`** — runs `deepContains(template, consumerFile)` for `.cursor/hooks.json` and `.claude/settings.json`; payload includes `missing` and `mismatched` paths (truncated to 5 each). Severity advisory. Action: `Run pnpm bkit install to restore template scope; consumer-added keys are preserved.`
- **ADD advisory `tier2-text-drift` (Phase 2)** — runs marker block byte-equal for every markered template file (Group A full-ownership + Group B partial-ownership). Severity advisory. Action: same as JSON drift.
- **ADD blocker `pre-envelope-bkit-version-detected`** — `pinnedVersion < 0.8.0` AND no top-level `__bkit__` on the JSON files. Severity blocker; `bkit upgrade` exits non-zero with action: `Upgrade through bkit v1.x first (e.g. pnpm add @cbartens/bkit@^1.1.1 then pnpm bkit upgrade) before stepping to v2.0.0.`
- **Drift detection call site:** runs **inside `bkit-preflight.ts`** so `bkit doctor` (which dispatches through preflight) inherits drift detection automatically.

##### [MODIFY] `.agents/scripts/bkit-uninstall.ts`

- **Existence Check:** `case 2` branch lives at lines ~166–184; today calls `detectMarkerStyle(content)` which returns `null` for JSON → falls through to `"preserve"` (zombie footprint).
- **Phase 1 surgical extension:** detect JSON-format files (by file extension `.json` OR by manifest `format` field in Phase 2) and dispatch to `stripTier2JsonScope`.
- **ADD function `stripTier2JsonScope(consumerDoc, templateDoc): JsonValue`** in same file:
  1. Deep-clone `consumerDoc` to working copy `out`.
  2. Recursively walk `templateDoc`. For each leaf path `p`:
     - If `out[p]` deep-equals `templateDoc[p]` (bkit-owned content intact) → `delete` the leaf at `p`.
     - If `out[p]` differs (consumer customised the bkit-owned leaf) → leave untouched.
  3. After walking, prune **template-introduced** intermediate objects that are now empty `{}`. Do NOT prune intermediates with consumer-only siblings. Do NOT prune arrays — preserve consumer-added array elements inside template-owned arrays.
  4. Return `out`.
- **Caller:** `case 2` (or post-Phase-2: `format: "json"` branch) reads consumer file, parses, resolves template via `getPkgRoot()` (from `bkit-paths.ts`), parses template, calls `stripTier2JsonScope`, writes via existing atomic-write pattern.
- **Imports:** add `getPkgRoot` from `./bkit-paths`. No `__bkit__` lookup anywhere.

##### [MODIFY] `.agents/scripts/bkit-version.ts`

- **No schema change in Phase 1.** Confirm by reading: `BkitVersion = { pinnedVersion, tier3Hashes, canonicalHashes }` — all three remain.
- After deletion of `bkit-tier1-defaults.ts`, grep for any other consumer of `BKIT_TIER1_DEFAULTS_BY_VERSION`; remove imports if only test+module remain.

#### Code Deletions

##### [DELETE] `.agents/scripts/bkit-tier1-defaults.ts`

- **Reason:** sole consumer was `migrateTier1JsonToTier2` (now deleted). New `migrateLegacyBkitEnvelope` reads consumer's on-disk top-level mirror directly.

##### [DELETE] `.agents/scripts/bkit-tier1-defaults.test.ts`

- **Reason:** tests for the deleted module.

#### Tests

##### [MODIFY] `.agents/scripts/bkit-tiers.test.ts`

- **DELETE** test blocks: `extractBkitNamespace`, `applyBkitNamespace`, `migrateTier1JsonToTier2`, envelope-guard branch of `writeTier2Json`.
- **ADD** test block: `deepContains` covering the eight matrix rows (object containment, missing, mismatched, primitive-array subset, object-array order-insensitive, object-array asymmetric size 1→2, mixed-array, null-boundary).
- **ADD** test block: `writeTier2JsonContained` (write-as-is, deep-merge, idempotent, malformed-dest fallback, schema-flip).
- **ADD** test block: `migrateLegacyBkitEnvelope` (strip-only, strip+deep-merge, idempotent no-op, schema-flip).
- **ADD** test block: `cursor-v1-schema` — parses `.agents/templates/.cursor/hooks.json` and asserts `version === 1`, `hooks.sessionStart` and `hooks.sessionStop` are arrays, no `__bkit__`, no flat-array `hooks`.

##### [MODIFY] `.agents/scripts/bkit-uninstall.test.ts`

- **ADD** test block: `stripTier2JsonScope` — covers leaf-deletion, consumer-only sibling preservation, empty-intermediate pruning (only where template populated), array preservation (no array pruning).

##### [MODIFY] `.agents/scripts/bkit-modules.upgrade.integration.test.ts`

- **Imports update (`line 14`):** remove `migrateTier1JsonToTier2`, `writeTier2Json`; add `writeTier2JsonContained`, `migrateLegacyBkitEnvelope`. (Sub-task lives in the deletions task to enforce ordering — see Runbook Task 7.)
- **ADD** test: pre-v2.0.0 fixture (`__bkit__` envelope + top-level mirror + consumer-added `hooks.Stop`, `failClosed`, `loop_limit`) loaded from `tests/fixtures/heavy-customised-consumer-v1-envelope/` (committed in Task 0c).
- **ADD** test: v0.5.x → v0.8.x → v2.0.0 chain (uses both fixtures: existing `tests/fixtures/heavy-customised-consumer/` for the v0.5.x leg + new `tests/fixtures/heavy-customised-consumer-v1-envelope/` for the v0.8.x→v2.0.0 leg).
- **ADD** test: heavy-customised consumer fixture survival across v2.0.0 upgrade.
- **ADD** test: idempotency — second `bkit upgrade` is a no-op.

##### [MODIFY] `.agents/scripts/bkit-modules.integration.test.ts`

- **ADD** test: `bkit check` on pre-v2.0.0 fixture surfaces `legacy-bkit-envelope-detected` advisory; exits 0.
- **ADD** test: `tier2-json-drift` advisory when consumer is missing a template key.
- **ADD** test: `pre-envelope-bkit-version-detected` blocker.
- **ADD** test: `bkit uninstall --claude strips template scope` (consumer-key survival).
- **ADD** test: `bkit uninstall --cursor strips template scope` (consumer-key survival).

##### [MODIFY] `.agents/scripts/bkit-doctor.integration.test.ts`

- **ADD** test: drift advisory + `legacy-bkit-envelope-detected` surface through `doctor` verb (re-uses preflight by design).

#### Static Fixture (committed)

##### [NEW] `tests/fixtures/heavy-customised-consumer-v1-envelope/`

- **Reason:** static-input fixture for the v0.8.x → v2.0.0 leg of the upgrade chain. Captures the on-disk shape **after** the (now-deleted) `migrateTier1JsonToTier2` helper had run on a v0.5.x consumer.
- **Files:**
  - `cursor-hooks.json` (BEFORE — envelope on disk + flat-array + consumer keys):
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
  - `cursor-hooks.json` (AFTER — schema-clean keyed-object, consumer keys retained):
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
  - `claude-settings.json` (BEFORE — envelope + top-level mirror + consumer Stop hook):
    ```json
    {
      "__bkit__": { "hooks": { "SessionStart": [{ "command": "pnpm bkit check" }] } },
      "hooks": {
        "SessionStart": [{ "command": "pnpm bkit check" }],
        "Stop": [{ "command": "echo 'consumer stop hook'" }]
      }
    }
    ```
  - `claude-settings.json` (AFTER — schema-clean):
    ```json
    {
      "hooks": {
        "SessionStart": [{ "command": "pnpm bkit check" }],
        "Stop": [{ "command": "echo 'consumer stop hook'" }]
      }
    }
    ```
  - `bkit-version.json`:
    ```json
    { "pinnedVersion": "0.8.5", "tier3Hashes": {}, "canonicalHashes": {} }
    ```

### Phase 2 — Marker extension to all formerly-Tier-1/3 files (REQUIRED for v2.0.0)

#### Templates — Group A: full-ownership markers

**Comment syntax:** `<!-- bkit:start -->` / `<!-- bkit:end -->` for `.md` and `.mdc` files; `# bkit:start` / `# bkit:end` for YAML files.

**Anchor convention for full-ownership files:** for every Group A file listed below, the `bkit:start` marker is inserted on a new line immediately AFTER any pre-existing top-of-file frontmatter / shebang / license header (if absent, at line 1 column 0), and the `bkit:end` marker is inserted on a new line immediately BEFORE EOF (i.e. the LAST non-empty line of the bkit-owned content is followed by `bkit:end` on the next line). Effectively the marker block wraps the file content in its entirety from line 1 (or post-frontmatter) to EOF. Markers are at column 0 (no indentation) for both Markdown and YAML. **Verification (per file):** `grep -c '^<!-- bkit:start -->' <file>` returns `1` for `.md`/`.mdc`; `grep -c '^# bkit:start' <file>` returns `1` for `.yml`. Same for the matching `bkit:end`. The byte content BETWEEN the markers must equal the pre-Task-17 file content byte-for-byte (no content edits in this task — markers ONLY).

##### [MODIFY] `.agents/templates/AGENTS.md`

- Wrap entire bkit-owned content in `<!-- bkit:start -->` / `<!-- bkit:end -->`. **Anchor:** marker pair wraps line 1 → EOF (no frontmatter expected); column 0; content byte-identical between markers.

##### [MODIFY] `.agents/templates/CLAUDE.md`

- Wrap entire bkit-owned content in `<!-- bkit:start -->` / `<!-- bkit:end -->`. **Anchor:** marker pair wraps line 1 → EOF; column 0; content byte-identical between markers.

##### [MODIFY] `.agents/templates/.cursor/rules/00-shared-rules.mdc`

- Wrap entire bkit-owned content in `<!-- bkit:start -->` / `<!-- bkit:end -->`. **Anchor:** marker pair wraps line 1 → EOF (`.mdc` files have no frontmatter convention in this template); column 0; content byte-identical between markers.

##### [MODIFY] `.agents/templates/.vale/styles/House/Filler.yml`

- Wrap entire content in `# bkit:start` / `# bkit:end`. **Anchor:** marker pair wraps line 1 → EOF; column 0; content byte-identical between markers.

##### [MODIFY] `.agents/templates/.vale/styles/House/Hedging.yml`

- Wrap entire content in `# bkit:start` / `# bkit:end`. **Anchor:** marker pair wraps line 1 → EOF; column 0; content byte-identical between markers.

##### [MODIFY] `.agents/templates/.vale/styles/House/LLMSlop.yml`

- Wrap entire content in `# bkit:start` / `# bkit:end`. **Anchor:** marker pair wraps line 1 → EOF; column 0; content byte-identical between markers.

##### [MODIFY] `.agents/templates/.vale/styles/House/Verbose.yml`

- Wrap entire content in `# bkit:start` / `# bkit:end`. **Anchor:** marker pair wraps line 1 → EOF; column 0; content byte-identical between markers.

##### [MODIFY] `.agents/templates/.agents/rules.md`

- Already has `<!-- bkit:start -->` / `<!-- bkit:end -->` markers — **scope expansion check:** open the file and confirm the existing markers wrap the entire bkit-owned content (line 1 → EOF, post any frontmatter). If the existing block is narrower than full-file (i.e. consumer-territory content sits OUTSIDE the markers), the structural change IS required: relocate the closing marker to EOF so the entire template is bkit-owned. If the existing block already spans line 1 → EOF, no change. Verify: `grep -n '^<!-- bkit:start -->\|^<!-- bkit:end -->' .agents/templates/.agents/rules.md` shows the start at line ≤ 5 (post-frontmatter slot) and the end on the last line of the file.

##### [MODIFY] `.agents/templates/.agents/docs.md`

- Wrap entire bkit-owned content in `<!-- bkit:start -->` / `<!-- bkit:end -->`. **Anchor:** marker pair wraps line 1 → EOF; column 0; content byte-identical between markers.

##### [MODIFY] `.agents/templates/.agents/friction.md`

- Wrap entire bkit-owned content in `<!-- bkit:start -->` / `<!-- bkit:end -->`. **Anchor:** marker pair wraps line 1 → EOF; column 0; content byte-identical between markers.

##### [MODIFY] `.agents/templates/.agents/skills.md`

- Wrap entire bkit-owned content in `<!-- bkit:start -->` / `<!-- bkit:end -->`. **Anchor:** marker pair wraps line 1 → EOF; column 0; content byte-identical between markers.

##### [MODIFY] `.agents/templates/docs/plans/template.md`

- Wrap entire bkit-owned content in `<!-- bkit:start -->` / `<!-- bkit:end -->`. **Anchor:** marker pair wraps line 1 → EOF; column 0; content byte-identical between markers.

#### Templates — Group B: partial-ownership markers

##### [MODIFY] `.agents/templates/.github/workflows/ci.yml`

- Wrap **exactly** the existing `Install Dependencies` step (which carries the `GH_BKIT_TOKEN_INSTALL` env block — bkit's auth surface) AND the existing `Run Bkit Check` step in `# bkit:start` / `# bkit:end` (YAML comment syntax). Consumer's surrounding job structure (other steps — `Run Typecheck`, `Run Vitest Tests`, `Run Prettier Format Check`, `Run Vale Prose Lint`, `Run Slop Scan`; custom env; custom matrix) is untouched. **Note:** the plan-input charter referenced a `setup-auth` step name; this template does not have one. The `Install Dependencies` step IS the auth surface (it sets `GH_BKIT_TOKEN_INSTALL` in `env`). Marker covers `Install Dependencies` + `Run Bkit Check`. The intervening consumer steps (typecheck/test/format/vale/slop) are NOT inside the marker block.
- **Rationale:** would have caught the `app-gether-life` regression where the `pnpm bkit check` step was silently dropped.
- **Marker location precise spec:**
  - Insert `# bkit:start` immediately above the `- name: Install Dependencies` line (currently line 23 of the template). The marker is at the same indentation as the `- name:` line (6 spaces).
  - **Open-block intent:** the marker block opens at `Install Dependencies` and closes at `Run Bkit Check` — meaning the consumer steps `Run Typecheck`, `Run Vitest Tests`, `Run Prettier Format Check`, `Run Vale Prose Lint`, `Run Slop Scan` (lines 33–46) end up INSIDE the marker block. **This is acceptable** — those steps are part of bkit's "run all checks" CI contract; if a consumer customises them they will trigger `tier2-text-drift`. If finer granularity is needed in a future minor version, split into two marker blocks. v2.0.0 ships with one block covering `Install Dependencies` through `Run Bkit Check` inclusive.
  - Insert `# bkit:end` immediately below the `- name: Run Bkit Check` step's `run:` line (currently line 49). Marker at the same indentation as `- name:` (6 spaces).
- **Exact YAML to insert:**

  ```yaml
  # bkit:start
  - name: Install Dependencies
    # ... (existing body — preserved byte-identical)
    run: pnpm install --frozen-lockfile
    env:
      GH_BKIT_TOKEN_INSTALL: ${{ secrets.GH_BKIT_TOKEN_INSTALL }}

  - name: Run Typecheck
    # ... (existing body)

  # ... (existing Vitest, Prettier, Vale, Slop steps)

  - name: Run Bkit Check
    run: pnpm bkit check
  # bkit:end
  ```

##### [MODIFY] `.agents/templates/.vale.ini`

- Wrap **exactly** these keys in `# bkit:start` / `# bkit:end`: `StylesPath`, `Packages`, `MinAlertLevel`, the House-style enable line. Consumer's other Vale config keys remain outside the markers.

##### [MODIFY] `.agents/templates/slop-scan.config.json`

- **JSON file — uses deep-containment, not markers.** The "required core rules" enumerated below are owned via deep-containment (template's required rules must be present and have `enabled: true` in consumer; consumer rules outside this set are tolerated).
- **Required core rules — INLINED (read from `.agents/templates/slop-scan.config.json` as of plan-v2):**
  1. `comments.placeholder-comments` (`enabled: true`, `weight: 1.5`)
  2. `structure.over-fragmentation` (`enabled: true`)
  3. `structure.directory-fanout-hotspot` (`enabled: true`)
  4. `structure.duplicate-function-signatures` (`enabled: true`)
  5. `structure.barrel-density` (`enabled: true`)
  6. `structure.pass-through-wrappers` (`enabled: true`)
  7. `defensive.empty-catch` (`enabled: true`)
  8. `defensive.error-swallowing` (`enabled: true`)
  9. `defensive.error-obscuring` (`enabled: true`)
  10. `defensive.async-noise` (`enabled: true`)
- **Containment invariant:** every key listed in the template's `rules` object is bkit-mandated. `bkit check` runs `deepContains(template.rules, consumer.rules)` and reports any missing key under advisory `tier2-json-drift`. Consumers may add additional rule entries; they may NOT remove or set `enabled: false` on the listed ten.
- **Test fixture:** Task 22 asserts each of the ten keys exists in the consumer file with `enabled: true`. If the template adds/removes a rule in a future minor version, this enumeration in the plan must be updated alongside the template — DE-16 records the v2.0.0 baseline list.

##### [MODIFY] `.agents/templates/.husky/pre-push`

- **Existence Check:** verified — already has `# bkit:start` / `# bkit:end` block (lines 3–7) wrapping `pnpm typecheck && pnpm test && pnpm format:check`.
- **Change:** verify the marker block scope is correct for v2.0.0 (no new bkit content outside the existing block). If the consumer's `app-gether-life` pre-push duplicate-work pattern requires a wider scope (e.g. include `pnpm bkit check` or `pnpm check:dist` inside markers), expand. Plan-Phase Decision 4: pre-push duplicate-work in `app-gether-life` is resolved naturally on next `bkit upgrade` after Phase 2 markers ship.

#### Code

##### [MODIFY] `.agents/scripts/bkit-manifest.ts`

- **Existence Check:** verified — current shape `{ path, tier: 1|2|3, module, packageJsonKeys? }` (lines 12–34).
- **Change:** simplify schema to `{ path, format, module, packageJsonKeys? }` where `format ∈ {"json", "markered-text", "byte-equal-text"}`.
- **Tier-to-format mapping:**
  - Old `tier: 1` JSON files (`.claude/settings.json`, `.cursor/hooks.json`) → `format: "json"`.
  - Old `tier: 1` text files → `format: "markered-text"`:
    - `.claude/hooks/preflight.sh`, `.cursor/hooks/preflight.sh` — **markers already present** (`# <!-- bkit:start -->` / `# <!-- bkit:end -->` at lines 17/124 and 15/115 respectively; verified). No marker-addition task required; verification only (Task 17a).
    - `.cursor/rules/00-shared-rules.mdc` — markers added in Phase 2 (Group A — Task 17).
  - Old `tier: 2` files → `format: "markered-text"`. Marker-presence audit performed against the templates directory (verified):
    - `.agents/templates/gitignore` — markers present (`# <!-- bkit:start -->` line 35 / `# <!-- bkit:end -->` line 48). No marker-addition needed.
    - `.agents/templates/.prettierignore` — markers present (`# bkit:start` line 1 / `# bkit:end` line 20). No marker-addition needed.
    - `.agents/templates/.husky/pre-commit` — markers present (`# bkit:start` line 2 / `# bkit:end` line 6). No marker-addition needed.
    - `.agents/templates/.husky/pre-push` — markers present (lines 3–7; covered by Task 18a).
    - `AGENTS.md`, `CLAUDE.md` — markers added in Phase 2 (Group A — Task 17).
  - Old `tier: 3` text files (`.github/workflows/ci.yml`, `.vale.ini`) → `format: "markered-text"` (Group B partial markers added in Phase 2).
  - Old `tier: 3` JSON files (`slop-scan.config.json`, `.cursor/settings.json`, `.cursor/environment.json`) → `format: "json"`.
  - `.cursor/Dockerfile` → `format: "byte-equal-text"` (advisory-only — no markers; whole-file byte-equal).
  - `package.json` (in CI / LINT / GIT_HOOKS manifests) → retain via `packageJsonKeys` mechanism; `format: "byte-equal-text"` is unused for it (key-stripper logic is separate).
- **Existing tier integer field:** delete entirely from `ManifestEntry`. Test imports updated.

##### [MODIFY] `.agents/scripts/bkit-install.ts` and `.agents/scripts/bkit-modules.ts`

- **Single dispatch on `entry.format`:**
  - `format: "json"` → `writeTier2JsonContained` (install) / `deepContains` (check) / `stripTier2JsonScope` (uninstall).
  - `format: "markered-text"` → marker block extraction + byte-equal (check) / marker block insert-or-replace (install) / marker block strip (uninstall).
  - `format: "byte-equal-text"` → whole-file byte-equal (check) / overwrite (install) / hash-or-byte-equal delete (uninstall — preserve if consumer modified).
- Replace existing `entry.tier` switches with `entry.format` switches throughout `bkit-install.ts`, `bkit-modules.ts`, `bkit-uninstall.ts`.

##### [MODIFY] `.agents/scripts/bkit-uninstall.ts`

- **Single dispatch on `entry.format`:**
  - `format: "json"` → `stripTier2JsonScope`.
  - `format: "markered-text"` → marker block strip via existing `detectMarkerStyle` + block extraction.
  - `format: "byte-equal-text"` → existing hash-or-byte-equal delete (preserve if consumer modified).
- Old `case 1`/`case 2`/`case 3` switch deleted.

##### [MODIFY] `.agents/scripts/bkit-preflight.ts`

- Drift detection extends to all `format: "markered-text"` files: read consumer file, extract marker block, byte-equal vs template marker block. Surface `tier2-text-drift` advisory (rename to `markered-block-drift` or similar in Phase 3 doc-block; advisory key string retained for backward-compat).

#### Tests

##### [NEW] `.agents/scripts/bkit-templates.test.ts`

- **New test file** dedicated to template integrity checks.
- **Tests:**
  - Marker presence enforcement: every Group A template file (`AGENTS.md`, `CLAUDE.md`, `.cursor/rules/00-shared-rules.mdc`, `.vale/styles/House/{Filler,Hedging,LLMSlop,Verbose}.yml`, `.agents/{rules,docs,friction,skills}.md`, `docs/plans/template.md`) contains exactly one `bkit:start` and one matching `bkit:end` marker.
  - Marker presence enforcement: every Group B template file (`.github/workflows/ci.yml`, `.vale.ini`) contains the marker block wrapping the expected key sentences.
  - `slop-scan.config.json` deep-tree contains the enumerated bkit core rules (test asserts each required rule key is present).

##### [MODIFY] `.agents/scripts/bkit-modules.integration.test.ts`

- **ADD** test: Tier-3 drift regression — fixture with consumer `ci.yml` missing the `pnpm bkit check` step inside the marker block → `bkit check` flags `tier2-text-drift`.
- **ADD** test: heavy-customised `ci.yml` survival — consumer's surrounding job structure preserved byte-identical across `bkit upgrade`; only marker block enforced.
- **ADD** test: `.husky/pre-push` marker block survives consumer customisation (consumer's `bkit-repo only` lines below markers preserved).

##### [MODIFY] `.agents/scripts/bkit-modules.test.ts`

- **ADD** test: `bkit check` single-dispatch on `entry.format` runs the correct mechanism per format.

### Phase 3 — Cleanup (REQUIRED for v2.0.0)

#### Schema

##### [MODIFY] `.agents/scripts/bkit-version.ts`

- **Writer change (narrow, not drop):** writer emits `tier3Hashes` only for entries with `format: "byte-equal-text"` (currently `.cursor/Dockerfile`). For `format: "json"` and `format: "markered-text"` the writer no longer populates the map, because `stripTier2JsonScope` and marker extraction supersede the hash-based safe-delete check for those formats. **Do NOT drop the field entirely** — `bkit-uninstall.ts:196` (`shouldDeleteTier3`) reads it for the `byte-equal-text` branch; dropping leaves `.cursor/Dockerfile` "always preserve" on uninstall (regression).
- **Reader change:** retain backward-compat parsing — if `tier3Hashes` absent in older consumer files, default to `{}` for one minor version (v2.0.x). Reader-side parsing of pre-v2.0.0 files (where `tier3Hashes` covered all formats) tolerates the wider map.
- **Type:** `BkitVersion.tier3Hashes` stays `Record<string, string>` (required, non-optional). The narrowed writer still emits it (now sparse — only byte-equal-text paths). `tsc --noEmit` is therefore unaffected; no call-site type changes.
- **Verification:** `grep -rn 'tier3Hashes' .agents/scripts/` — confirm only `bkit-version.ts`, `bkit-version.test.ts`, and `bkit-uninstall.ts` (`shouldDeleteTier3` byte-equal-text branch) retain references.

#### Doc-blocks

##### [MODIFY] `.agents/scripts/bkit-tiers.ts` doc-block

- Rewrite header to reflect single-model semantics: format-aware containment. Delete the `Tier 1/2 distinction` section. Document `deepContains`, `writeTier2JsonContained`, `migrateLegacyBkitEnvelope`, `stripTier2JsonScope` (cross-reference) as the public contract.

#### Documentation

##### [MODIFY] `docs/architecture.md`

- **REWRITE** the Tier-2 JSON section. Remove all `__bkit__` references. Describe `deepContains` + `deepMergeJson` as canonical mechanism for JSON; marker block byte-equal as canonical mechanism for text; whole-file byte-equal for advisory-only files. Add a "format-aware containment" callout explaining the unified ownership model.
- **Tree comments:** update ASCII tree comments showing `Tier 1/2/3` annotations — replace with `format: "json"|"markered-text"|"byte-equal-text"` annotations.

##### [MODIFY] `docs/knowledge.md`

- **APPEND** `KN-15: BAR-167 — Format-aware containment is canonical for bkit ownership` with the eight-turn-confusion narrative as the symptom→root-cause→fix story. Cross-reference DE-16.
- **EDIT** KN-8 header: append `(superseded by KN-15, BAR-167, 2026-05-09)`.

##### [MODIFY] `docs/decisions.md`

- **APPEND** `DE-16: BAR-167 — Format-aware containment (markers + JSON deep-contain) replaces Tier 1/2/3 model (2026-05-09)` with full reasoning, the option matrix, supersession of DE-7 + DE-8.
- **EDIT** DE-7 header: append `(superseded by DE-16, 2026-05-09)`.
- **EDIT** DE-8 header: append `(superseded by DE-16, 2026-05-09)`.

##### [MODIFY] `docs/testing.md`

- Search for `Tier [123]` strings; rewrite with `format` terminology. Surface the new test file `.agents/scripts/bkit-templates.test.ts` in the test inventory.

##### [MODIFY] `docs/deployments.md`

- Search for `Tier [123]` strings; replace with format terminology if any reference exists.

##### [MODIFY] `CHANGELOG.md`

- **APPEND** v2.0.0 entry per Breaking Changes §9.

##### [MODIFY] `README.md`

- Search `__bkit__` and `Tier [123]` user-facing mentions; rewrite paragraphs in deep-containment / format-aware language.

##### [MODIFY] `docs/pending.md`

- **DELETE** entries (per Plan-Phase Decision 1, these are no longer deferred — they ship in v2.0.0):
  - "Cursor v1 keyed-object schema deeper validation if Task 0a spike surfaces issues (2026-05-09)" — Task 0a removed.
- **APPEND** new deferred entries:
  - `bkit upgrade --prune` flag (still deferred to post-v2.0.0).
  - "Drop decorative `.cursor/hooks.json` echoes" (Plan-Phase Decision 3 = KEEP; revisit if echo noise becomes a confusion source).

##### [MODIFY] `docs/completed.md`

- **APPEND** post-merge: `BAR-167 — Format-aware containment; v2.0.0 (2026-05-XX)`.

##### [MODIFY] `package.json`

- **ADD** `scripts.lint:no-tier-terms` — `"lint:no-tier-terms": "! grep -rn 'Tier [123]\\|tier: [123]' docs/ .agents/scripts/*.ts --include='*.md' --include='*.ts' || (echo 'Tier 1/2/3 terminology found — Phase 3 cleanup regression' && exit 1)"`. Excludes `docs/decisions.md` historical entries (DE-5, DE-7, DE-8) and `docs/knowledge.md` (KN-8, KN-13) which retain superseded context. **Implementation guidance — prefer Node script over inline `grep -v`:** the file-level `grep -v` approach skips the entire file, which means a future regression that introduces `Tier [123]` to a NEW location inside `docs/decisions.md` or `docs/knowledge.md` (outside DE-5/DE-7/DE-8/KN-8/KN-13) would NOT be caught. The Node script approach (`.agents/scripts/lint-no-tier-terms.ts`) lets the exclusion list be encoded as an explicit array of `{ file, sectionRegex }` tuples (e.g. `{ file: "docs/decisions.md", sectionRegex: /^## DE-(5|7|8)\b/ }`) — a top-of-script `EXCLUSIONS` constant — which makes future audits and regressions readable and testable. Build agent SHOULD pick the Node script approach; if for any reason `grep -v` is used, document the residual gap (new-section regressions in excluded files go undetected) in DE-16.

### Cron Jobs & Scheduled Tasks

None.

## Documentation Updates

> Already enumerated above under Phase 3 → Documentation. No additional rows.

## Rollback Strategy

<!-- prettier-ignore -->
| Axis | Action | Notes |
| --- | --- | --- |
| **Code** | `git revert {MERGE_COMMIT}` | Revert restores `__bkit__` templates + envelope helpers + Tier integers + Phase 2 marker absence. Consumer JSON files keep their post-strip schema-clean shape (envelope was stripped on first upgrade); next `bkit install` re-writes the envelope on top via the rolled-back `writeTier2Json` deep-merge. Markered consumer files keep their marker blocks intact (markers are valid YAML/markdown comments — no syntactic impact). |
| **Risk window** | One `bkit upgrade` cycle | If a consumer ran `pnpm bkit upgrade` post-v2.0.0 and we then ship v2.0.1 reverting BAR-167, the consumer's file ends up with the legacy envelope re-applied via deep-merge and Phase 2 markers retained as harmless comments. No data loss; brief schema-pollution + redundant-marker window. |
| **DB** | N/A | No DB changes. |

_Code-only — `git revert` sufficient. Document rollback path in DE-16 "Trade-offs accepted" section._

## Agent Execution Runbook

> Chronological. Each task includes scope, target file(s), and verification step.
>
> **Splittability note:** if `plan-complexity-check.md` flips to SPLIT, this runbook splits along clean phase boundaries:
>
> - **Phase 1 (sub-plan A):** Tasks 0c, 0d, 0e, 1, 1b, 2, 3, 4, 4a, 4b, 5, 6, 7, 8–10a, 11–16 — code primitives + JSON migration + Phase 1 docs + static fixtures (Task 0d for `.husky/pre-push` survival, Task 0e for heavy-customised `ci.yml`).
> - **Phase 2 (sub-plan B):** Tasks 17, 17a, 18, 18a, 18b, **Sub-gate 2A**, 19, 20, 21, 22, 23, 23a, 23b, 24 — markers in Group A + Group B templates, manifest simplification, dispatch refactor, marker tests, Tier-3 drift regression test.
> - **Phase 3 (sub-plan C):** Tasks 25–28 — schema cleanup, terminology sweep, doc-block update, lint:no-tier-terms script.
>
> **Cross-sub-plan dependencies (HARD):**
>
> - Sub-plan B HARD-DEPENDS on sub-plan A — specifically: Task 4b (`stripTier2JsonScope` defined; needed by Task 20's `format: "json"` uninstall branch) AND Task 1 (`deepContains` defined; needed by Task 21's `format: "markered-text"` drift detection chain via `bkit-preflight.ts` allow-list extended in Task 6) AND the manifest schema baseline established in Task 19 of sub-plan B itself. Sub-plan A's `// PREREQ: Task 19 reclassification` integration tests are blocked by Sub-gate 2A until Task 19 lands. Sub-plan B cannot start until sub-plan A's Tasks 1, 4b, and 6 are merged.
> - Sub-plan C HARD-DEPENDS on sub-plan B — Task 25's narrowed-writer test requires `format: "byte-equal-text"` to exist on `ManifestEntry` (introduced in Task 19); Tasks 26–27 reference Phase 2 doc-block + lint terms AND Tasks 26–27 must run AFTER sub-plan A's Tasks 11–13 (Phase 1 doc rewrites of `docs/architecture.md`, `docs/testing.md`, `docs/decisions.md`, `docs/knowledge.md`).

### Phase 1 — Pre-implementation

- [ ] **Task 0c — Static fixture for upgrade-chain regression.** Verified: existing v0.5.x→v0.8.x fixture lives at `tests/fixtures/heavy-customised-consumer/` (referenced by `bkit-modules.upgrade.integration.test.ts:22`). Do NOT create a new directory under `.agents/scripts/__fixtures__/`. Instead create a new sibling fixture at `tests/fixtures/heavy-customised-consumer-v1-envelope/` with `cursor-hooks.json`, `claude-settings.json`, `bkit-version.json` per the abbreviated JSON shapes in **Static Fixture (committed)** above. Verify: `git status` shows the three new files; `pnpm vitest run bkit-modules.upgrade.integration.test.ts` does NOT yet reference them (added in Task 9).

- [ ] **Task 0d — Static fixture for `.husky/pre-push` consumer customisation.** Create `tests/fixtures/heavy-customised-prepush/.husky/pre-push` with the bkit-owned `# bkit:start`/`# bkit:end` block (lines 3–7 of the template) PLUS three consumer-only lines below the closing marker prefixed `# bkit-repo only` (e.g. `pnpm typecheck`, `pnpm test`, `pnpm format:check` overrides). The fixture is consumed by Task 23b's marker-survival integration test. Verify: `git status` shows the new file; `grep -c '^# bkit-repo only' tests/fixtures/heavy-customised-prepush/.husky/pre-push` ≥ 1; the byte-content between markers is byte-identical to the template's marker block.

- [ ] **Task 0e — Static fixture for heavy-customised `ci.yml` (Task 23a).** Create `tests/fixtures/heavy-customised-ci/.github/workflows/ci.yml` containing: (a) bkit's marker block per Task 18 spec wrapping `Install Dependencies` → `Run Bkit Check`, byte-identical to template content INSIDE the markers; (b) consumer-added env vars on the `Install Dependencies` step INSIDE the marker block (e.g. `NODE_AUTH_TOKEN: ${{ secrets.NODE_AUTH_TOKEN }}`) — used by Task 23a's inside-marker drift assertion; (c) consumer-only steps OUTSIDE the marker block (above `Install Dependencies` and below `Run Bkit Check`). Verify: `git status` shows the new file. **Note:** the inside-marker consumer additions (b) MUST cause Task 23a's drift assertion to flag `tier2-text-drift`; outside-marker structure (c) MUST be preserved byte-identical across `bkit upgrade`.

  > **Note:** Task 0a (Cursor v1 spike) **REMOVED** per Plan-Phase Decision 2. Task 0b (read project decisions/knowledge) folded into Pre-Flight Core item "Project Context".

### Phase 1 — Code (sequential)

- [ ] **Task 1 — `deepContains` primitive.** Add `deepContains(template, consumer, pathPrefix?)` to `.agents/scripts/bkit-tiers.ts`. Implement object containment + array-of-primitive subset + array-of-object element-wise order-insensitive containment + asymmetric-size object-array (1-element template, 2-element consumer → ok=true) + mixed-array semantics + null-input boundary. ~60 LOC. Verify: `pnpm vitest run bkit-tiers.test.ts -t deepContains` green for the eight test rows in the matrix.

- [ ] **Task 1b — Extract `getPkgRoot()` to shared util.** Create `.agents/scripts/bkit-paths.ts` exporting `getPkgRoot()` (lift from `bkit-modules.ts:90–95`). Update `bkit-modules.ts` to import from `./bkit-paths`. Verify: `pnpm tsc --noEmit` clean; no circular import warnings.

- [ ] **Task 2 — `writeTier2JsonContained`.** Rename `writeTier2Json` → `writeTier2JsonContained` in `.agents/scripts/bkit-tiers.ts`. Remove the envelope-guard `throw`. Use `deepMergeJson(existing, template)` (template is the override — confirm signature at `bkit-tiers.ts:33`). Add schema-flip handling per Edge Cases. Verify: `pnpm vitest run bkit-tiers.test.ts -t writeTier2JsonContained` green; schema-flip test row passes.

- [ ] **Task 3 — `migrateLegacyBkitEnvelope`.** Add **pure JSON helper** to `.agents/scripts/bkit-tiers.ts`. Signature: `(doc, template) → { stripped, deepMerged, schemaFlipped, outDoc }`. NO file I/O, NO `getPkgRoot()` import. Verify: `pnpm vitest run bkit-tiers.test.ts -t migrateLegacyBkitEnvelope` green for all four sub-cases (strip-only, strip+deep-merge, idempotent no-op, schema-flip). **Schema-flip test row — fixture cross-link:** the schema-flip case MUST load the `cursor-hooks.json` BEFORE shape from the static fixture committed in Task 0c (`tests/fixtures/heavy-customised-consumer-v1-envelope/cursor-hooks.json`) — that fixture's compound shape is the only one that exercises the type-flip detection: post-strip top-level `hooks` is a flat-array `[...]` while the template's `hooks` is a keyed-object `{...}`, so `migrateLegacyBkitEnvelope` must surface `schemaFlipped: true` AND `deepMerged: true` simultaneously. Do NOT use a synthetic schema-flip case for this row; the `cursor-hooks.json` fixture is the canonical test input. (Synthetic minimal cases for the other three sub-cases — strip-only, strip+deep-merge, idempotent no-op — are fine and preferred for unit-test clarity.)

- [ ] **Task 4 — Update `runClaudeModule` + `runCursorModule`.** Edit `.agents/scripts/bkit-modules.ts`: read consumer file → resolve template via `getPkgRoot()` (now from `bkit-paths.ts`) → call `migrateLegacyBkitEnvelope(doc, template)` → if `stripped` write `outDoc` via **atomic-write** (temp + rename). Then call `writeTier2JsonContained`. Drop `versionFile`/`onDiskVersion` blocks. Malformed-JSON parse failure falls through to `writeTier2JsonContained` malformed branch (do NOT call migration on unparsed string). Verify: `pnpm tsc --noEmit` clean; `pnpm vitest run bkit-modules.test.ts` green.

- [ ] **Task 4b — Build JSON-aware `bkit uninstall` strip-merge path.** **STATE-CLARIFICATION:** in the current `bkit-manifest.ts`, `.claude/settings.json` and `.cursor/hooks.json` are tagged `tier: 1` — meaning `bkit-uninstall.ts:case 1` dispatches them to `decision: "delete"` (full-file delete). The "zombie footprint" symptom described below appears in `case 2` only AFTER Task 19 reclassifies these files to `format: "json"` (where the dispatcher routes JSON to the new `stripTier2JsonScope` branch). **Build sub-task:** add `stripTier2JsonScope(consumerDoc, templateDoc): JsonValue` per the Algorithm sketch in **Architecture & Component Changes**. Extend `case 2` (which today calls `detectMarkerStyle(content)` returning `null` for JSON → falls through to `"preserve"`) to detect JSON-format files (by `.json` extension as a Phase-1 stopgap; by manifest `format` field once Phase 2 lands). The new code path is **dormant for `.claude/settings.json` and `.cursor/hooks.json` until Task 19 reclassifies them to `format: "json"`** — until then, those two files keep `case 1` (full delete) semantics. **Verify (Phase 1):** `pnpm vitest run bkit-uninstall.test.ts -t stripTier2JsonScope` green (pure-function unit tests). **Verify (post-Task-19):** the integration tests `pnpm vitest run bkit-modules.integration.test.ts -t "bkit uninstall --claude strips template scope"` and `-t "bkit uninstall --cursor strips template scope"` green — these tests MUST run after Task 19 reclassification, or be gated with a fixture that injects `format: "json"` directly. Mark these integration tests with a `// PREREQ: Task 19 reclassification` comment in the file.

- [ ] **Task 5 — Templates rewrite (JSON).** **PREREQ (HARD):** Tasks 1, 1b, 2, 3, 4, and 14a all complete. Specifically:
  - Task 1 — `deepContains` defined.
  - Task 1b — `bkit-paths.ts` extracted (Task 4's `getPkgRoot` import path).
  - Task 2 — `writeTier2JsonContained` rename + envelope-guard `throw` removed (otherwise the new envelope-less templates trigger the legacy `throw` in `writeTier2Json`).
  - Task 3 — `migrateLegacyBkitEnvelope` defined.
  - Task 4 — `runClaudeModule` / `runCursorModule` rewritten to call `migrateLegacyBkitEnvelope` and `writeTier2JsonContained`.
  - Task 14a — `package.json` `"version": "2.0.0"` edit applied (so `bkit install` records `pinnedVersion: "2.0.0"`).
    Without Tasks 1–4 first, `pnpm bkit install` against the worktree crashes (legacy `throw` in `writeTier2Json` for envelope-less template) or no-ops. Rewrite `.agents/templates/.cursor/hooks.json` (Cursor v1 keyed-object) and `.agents/templates/.claude/settings.json` (drop `__bkit__`). Run `pnpm bkit install` in worktree against itself; confirm `pnpm bkit check` reports `Done. 0 write(s).`

- [ ] **Task 6 — Preflight advisories + drift detection.** Edit `.agents/scripts/bkit-preflight.ts`: extend allow-list (header comment) for `readBkitVersion`, `deepContains`, `getPkgRoot`. Add advisories `legacy-bkit-envelope-detected`, `tier2-json-drift`, blocker `pre-envelope-bkit-version-detected`. **`legacy-bkit-envelope-detected` condition: `__bkit__` present at the top level of the consumer file — full stop.** Do NOT predicate on `canonicalHashes`-based version check (that field is content-hash, not version-stamp; the predicate is unimplementable against the current `BkitVersion` schema). (Phase 2 adds `tier2-text-drift` for markered text — already prepared by allow-list.) Verify: `pnpm vitest run bkit-preflight.test.ts` green. End-to-end verification is the green outcome of Task 10 integration tests.

- [ ] **Task 7 — Delete obsolete code.** **HARD PREREQ:** Task 0c complete (static fixture committed). Delete `.agents/scripts/bkit-tier1-defaults.ts` and `.agents/scripts/bkit-tier1-defaults.test.ts`. Delete `applyBkitNamespace`, `extractBkitNamespace`, `migrateTier1JsonToTier2` from `.agents/scripts/bkit-tiers.ts`. **Sub-task — fix existing test imports:** edit `.agents/scripts/bkit-modules.upgrade.integration.test.ts` line 14 — remove `migrateTier1JsonToTier2`, `writeTier2Json`; add `writeTier2JsonContained`, `migrateLegacyBkitEnvelope` (or remove the import entirely if the v0.8.x leg is now driven exclusively by the static fixture from Task 0c). Grep codebase for any other import of deleted symbols. Verify: `pnpm tsc --noEmit` clean; `pnpm turbo lint typecheck format:check test` clean. **Phase 1 net-deletion verification (path-scoped, NOT whole-tree):** because Phase 2 marker additions ship in the same v2.0.0 PR and would otherwise mask Phase 1's deletion footprint, restrict the LOC delta check to exactly the Phase 1 deletion paths. Run `git diff --stat dev..HEAD -- '.agents/scripts/bkit-tier1-defaults.ts' '.agents/scripts/bkit-tier1-defaults.test.ts' '.agents/scripts/bkit-tiers.ts' '.agents/templates/.cursor/hooks.json' '.agents/templates/.claude/settings.json'` and confirm net deletion across THESE FILES ONLY ≥ 200 LOC. (`bkit-tiers.ts` will show a mix of additions for `deepContains`/`writeTier2JsonContained`/`migrateLegacyBkitEnvelope` ~60+30+30 LOC and deletions for the four removed symbols + envelope branch — net should still trend negative once `bkit-tier1-defaults.ts` and the two JSON envelope blocks are deleted.) Phase 2 marker additions in `.github/workflows/ci.yml`, `.vale.ini`, AGENTS.md, etc. are explicitly excluded from this check.

### Phase 1 — Tests

- [ ] **Task 8 — `bkit-tiers.test.ts` rewrite.** Apply test changes in **Tests** section. Include `cursor-v1-schema` static unit block. Verify: full file passes; mixed-array, null-boundary, schema-flip, `cursor-v1-schema` all green.

- [ ] **Task 8b — `bkit-uninstall.test.ts` `stripTier2JsonScope` test block.** Add unit tests covering leaf-deletion, consumer-only sibling preservation, empty-intermediate pruning (only where template populated), array preservation. Verify: `pnpm vitest run bkit-uninstall.test.ts -t stripTier2JsonScope` green.

- [ ] **Task 9 — Upgrade integration tests.** Add the integration test rows to `.agents/scripts/bkit-modules.upgrade.integration.test.ts`. v0.5.x→v0.8.x leg uses existing `tests/fixtures/heavy-customised-consumer/`; v0.8.x→v2.0.0 leg uses new sibling `tests/fixtures/heavy-customised-consumer-v1-envelope/`. Heavy-customised consumer fixture. Idempotency. Verify: `pnpm vitest run bkit-modules.upgrade.integration.test.ts` green.

- [ ] **Task 10 — Modules integration tests.** Add `legacy-bkit-envelope-detected` advisory test, `tier2-json-drift` advisory test (for `.cursor/hooks.json`, `.claude/settings.json`, **and `slop-scan.config.json`** — drop one of the ten required `rules` keys from a fixture's `slop-scan.config.json` and confirm `bkit check` raises `tier2-json-drift` for that file with the missing key surfaced in the advisory `missing` payload), `pre-envelope-bkit-version-detected` blocker test, `bkit uninstall --claude` consumer-key survival test, `bkit uninstall --cursor` consumer-key survival test. **Add `bkit uninstall .cursor/Dockerfile` safe-delete row:** two sub-cases — (i) consumer hash matches the `tier3Hashes` entry → file deleted; (ii) consumer modified the file (hash mismatch) → file preserved. This row reuses the existing `shouldDeleteTier3` byte-equal-text branch and is required to land in Phase 1 (Task 10) so Task 25 can verify the writer narrowing did not regress the safe-delete path. Verify green. **Note:** the `slop-scan.config.json` drift row depends on Task 19 reclassifying that file to `format: "json"` for end-to-end dispatch through `deepContains` — gate it behind Sub-gate 2A like the other `format: "json"` integration tests, OR mark it `// PREREQ: Task 19 reclassification` and run after Task 19.

- [ ] **Task 10a — `bkit doctor` integration test.** Edit `.agents/scripts/bkit-doctor.integration.test.ts` to assert `tier2-json-drift` and `legacy-bkit-envelope-detected` surface through the `doctor` verb. Verify green.

### Phase 1 — Documentation

- [ ] **Task 11 — DE-16.** Append to `docs/decisions.md`. Edit DE-7 and DE-8 headers to mark superseded.

- [ ] **Task 12 — KN-15.** Append to `docs/knowledge.md`. Edit KN-8 header to mark superseded. Note: existing KN-9 (`.bkit-version` migration reads — unrelated topic) is **preserved as-is**; new entry uses next available number KN-15.

- [ ] **Task 13 — `docs/architecture.md` rewrite.** Tier-2 JSON section + ASCII tree annotations updated.

- [ ] **Task 14 — CHANGELOG v2.0.0 entry.** Append breaking-change line.

- [ ] **Task 14a — `package.json` version bump.** **ORDERING — CRITICAL:** version bump from `1.1.1` to `2.0.0` MUST happen BEFORE Task 5 (`pnpm bkit install` against worktree). **NOTE for sequential-execution agents:** this task is filed under "Phase 1 — Documentation" but MUST be pulled forward and executed BEFORE Task 5 in the "Phase 1 — Code (sequential)" section. Task 5's PREREQ list explicitly names Task 14a — that is the canonical ordering signal. (i) Edit `package.json` `"version": "2.0.0"` first; (ii) Task 5's install records `pinnedVersion: "2.0.0"`; (iii) post-Task-5, run `pnpm install` to refresh `pnpm-lock.yaml`. Verify: `git diff package.json` shows version bump; `cat .agents/.bkit-version | grep pinnedVersion` shows `"2.0.0"`.

- [ ] **Task 15 — README.md sweep.** Replace `__bkit__` user-facing mentions with deep-containment / format-aware language.

- [ ] **Task 16 — `docs/pending.md` follow-ups.** DELETE the Cursor-v1 spike pending entry (Task 0a removed). APPEND `bkit upgrade --prune` (still deferred) and "Drop decorative `.cursor/hooks.json` echoes" (Plan-Phase Decision 3 = KEEP).

### Phase 2 — Markers + manifest dispatch (sequential)

- [ ] **Task 17 — Add Group A full-ownership markers.** Edit each of: `.agents/templates/AGENTS.md`, `.agents/templates/CLAUDE.md`, `.agents/templates/.cursor/rules/00-shared-rules.mdc`, `.agents/templates/.vale/styles/House/{Filler,Hedging,LLMSlop,Verbose}.yml`, `.agents/templates/.agents/{rules,docs,friction,skills}.md`, `.agents/templates/docs/plans/template.md`. Wrap entire bkit-owned content with the format-appropriate marker pair. Verify: each file has exactly one `bkit:start` and one matching `bkit:end`.

- [ ] **Task 17a — Verify markers already present on reclassified `markered-text` files.** No marker-addition; assertion-only. Run `grep -l 'bkit:start' .agents/templates/.claude/hooks/preflight.sh .agents/templates/.cursor/hooks/preflight.sh .agents/templates/gitignore .agents/templates/.prettierignore .agents/templates/.husky/pre-commit` and confirm all five paths print. Run `grep -c 'bkit:start' <path>` for each — must return `1`. If any file is missing markers, the manifest reclassification (Task 19) MUST exclude it OR Task 17 must be extended; do not silently add markers as part of this task.

- [ ] **Task 18 — Add Group B partial-ownership markers.** Edit `.agents/templates/.github/workflows/ci.yml`: insert `# bkit:start` immediately above the existing `- name: Install Dependencies` step (line 23 in current template) and `# bkit:end` immediately below the existing `- name: Run Bkit Check` step's `run:` line (line 49). The marker block covers `Install Dependencies` → `Run Bkit Check` inclusive (template currently has no `setup-auth` step — the `Install Dependencies` step IS the auth surface via its `GH_BKIT_TOKEN_INSTALL` env block). See the exact YAML in Architecture & Component Changes → Phase 2 Templates → Group B → `.github/workflows/ci.yml`. Edit `.agents/templates/.vale.ini` (wrap `StylesPath`/`Packages`/`MinAlertLevel`/House style enable). **`.vale.ini` markers are at column 0 (no indentation) — Vale INI files are flat key=value sections; leading spaces would break Vale's parser.** Verify: marker block content matches the spec exactly; surrounding consumer-territory comments remain. Verify (ci.yml): `grep -c '^        # bkit:start' .agents/templates/.github/workflows/ci.yml` returns `1`. **Verify (.vale.ini scope — four required keys inside marker block):** run `awk '/^# bkit:start/,/^# bkit:end/' .agents/templates/.vale.ini | grep -cE '^(StylesPath|Packages|MinAlertLevel|\[.*\][[:space:]]*$|House[[:space:]]*=)'` and confirm output ≥ 4 (one match each for `StylesPath`, `Packages`, `MinAlertLevel`, and the House-style enable line). Also: `grep -c '^# bkit:start' .agents/templates/.vale.ini` returns `1` and `grep -c '^# bkit:end' .agents/templates/.vale.ini` returns `1` (column-0, no indentation).

- [ ] **Task 18a — Verify `.husky/pre-push` markers.** Inspect existing markers (lines 3–7). If any new bkit content needs wrapping, expand block; otherwise no change. Verify: `pnpm bkit check` against worktree itself reports zero drift on `.husky/pre-push`.

- [ ] **Task 18b — Verify `slop-scan.config.json` required core rules.** JSON file uses deep-containment (no markers). The plan inlines the ten required rule keys (see Architecture & Component Changes → Phase 2 Templates → Group B → `slop-scan.config.json`). Reconcile: open `.agents/templates/slop-scan.config.json` and confirm the ten keys listed in the plan match the template byte-for-byte. If the template differs, update Task 22's fixture assertions AND record the delta in DE-16. Verify: `deepContains(template, consumer)` ok=true on a fresh install.

### 🔒 Sub-gate 2A: Manifest reclassification readiness (between Task 18b and Task 19)

> **PURPOSE:** Tasks 4b, 20, and 25's `format: "json"`/`format: "markered-text"`/`format: "byte-equal-text"` dispatch is **dormant** until the manifest actually carries the new `format` field. Running Task 4b's two integration tests (`bkit uninstall --claude/--cursor strips template scope`) BEFORE Task 19 reclassifies `.claude/settings.json` and `.cursor/hooks.json` to `format: "json"` will silently pass through the legacy `case 1` (full-delete) branch and not exercise the new `stripTier2JsonScope` path at all — a false green.

- [ ] **Sub-gate 2A — Verified:** Task 18b complete (template ten-key audit reconciled). Block any execution of the integration tests `bkit uninstall --claude strips template scope` and `bkit uninstall --cursor strips template scope` (and any other test marked `// PREREQ: Task 19 reclassification`) until Task 19 has been merged. If Phase 2 is split into a separate sub-plan B, this sub-gate is the boundary marker between sub-plan A's Task 4b and sub-plan B's Task 19.

- [ ] **Task 19 — Simplify `bkit-manifest.ts` schema.** Edit `.agents/scripts/bkit-manifest.ts`: change `ManifestEntry` from `{ path, tier: 1|2|3, module, packageJsonKeys? }` to `{ path, format: "json"|"markered-text"|"byte-equal-text", module, packageJsonKeys? }`. Apply tier-to-format mapping per **Architecture & Component Changes**. Verify: `pnpm tsc --noEmit` clean. **Post-Task-19 unblock:** the integration tests gated by Sub-gate 2A (`bkit uninstall --claude/--cursor strips template scope`) now route through `format: "json"` → `stripTier2JsonScope`; re-run them and confirm green. Also re-run the `.cursor/Dockerfile` safe-delete row from Task 10 to confirm `format: "byte-equal-text"` dispatch is correct.

- [ ] **Task 20 — Single dispatch on `entry.format` in install/check/uninstall.** Edit `.agents/scripts/bkit-install.ts`, `.agents/scripts/bkit-modules.ts`, `.agents/scripts/bkit-uninstall.ts`: replace `entry.tier` switches with `entry.format` switches. Verify: `pnpm vitest run bkit-modules.test.ts -t "single-dispatch"` green; `pnpm bkit check` against worktree reports zero drift.

- [ ] **Task 21 — Phase 2 advisory `tier2-text-drift`.** Edit `.agents/scripts/bkit-preflight.ts`: extend drift detection to `format: "markered-text"` files (read consumer, extract marker block, byte-equal vs template marker block). Surface advisory. Verify: `pnpm vitest run bkit-preflight.test.ts` green.

- [ ] **Task 22 — `bkit-templates.test.ts` (NEW).** Create `.agents/scripts/bkit-templates.test.ts` with marker-presence enforcement tests for Group A + Group B templates and `slop-scan.config.json` required-rules enumeration. Verify: `pnpm vitest run bkit-templates.test.ts` green.

- [ ] **Task 23 — Tier-3 drift regression test.** Add to `.agents/scripts/bkit-modules.integration.test.ts`: fixture with consumer `ci.yml` missing `pnpm bkit check` step inside marker block → `bkit check` flags `tier2-text-drift`. Verify green.

- [ ] **Task 23a — Heavy-customised `ci.yml` survival test.** **PREREQ:** Task 0e fixture (`tests/fixtures/heavy-customised-ci/.github/workflows/ci.yml`) committed. Add to `.agents/scripts/bkit-modules.upgrade.integration.test.ts`: TWO sub-rows — (i) **outside-marker survival:** consumer's surrounding job structure (additional steps, custom env, custom matrix) OUTSIDE the marker block is preserved byte-identical across `bkit upgrade`; (ii) **inside-marker drift detection:** consumer-added env vars on the `Install Dependencies` step INSIDE the marker block (e.g. `NODE_AUTH_TOKEN: ${{ secrets.NODE_AUTH_TOKEN }}` per Task 0e fixture) cause `bkit check` to flag `tier2-text-drift` for `.github/workflows/ci.yml` — this is the documented v2.0.0 trade-off (per Architecture & Component Changes → Group B → ci.yml note "if a consumer customises them they will trigger `tier2-text-drift`"). Both sub-rows MUST be green. Verify: `pnpm vitest run bkit-modules.upgrade.integration.test.ts -t "heavy-customised ci.yml"` shows both rows passing.

- [ ] **Task 23b — `.husky/pre-push` marker survival test.** **PREREQ:** Task 0d fixture (`tests/fixtures/heavy-customised-prepush/.husky/pre-push`) committed. Add to `.agents/scripts/bkit-modules.integration.test.ts`: load the Task-0d fixture; run `bkit upgrade`; assert the marker block content is byte-identical to template AND the consumer's `# bkit-repo only` lines below the closing marker are preserved byte-identical. Verify green.

- [ ] **Task 24 — Phase 2 verification: `pnpm bkit check` zero-drift on all surfaces.** Run `pnpm bkit install` against worktree; run `pnpm bkit check`; assert `Done. 0 write(s).` and zero advisories.

### Phase 3 — Cleanup

- [ ] **Task 25 — `.bkit-version` writer narrows `tier3Hashes` to byte-equal-text only.** Edit `.agents/scripts/bkit-version.ts`: writer continues to emit `tier3Hashes`, but its content is now narrowed — only `format: "byte-equal-text"` manifest entries (currently `.cursor/Dockerfile`) populate the map; `json` and `markered-text` entries are skipped. Reader retains backward-compat parse (one minor version) for the wider pre-v2.0.0 map. **Do NOT remove the field from `BkitVersion`** — type stays required. Verify: `pnpm vitest run bkit-version.test.ts` green; `cat .agents/.bkit-version` after fresh install shows `tier3Hashes` map containing only the `.cursor/Dockerfile` hash (or any byte-equal-text entries); JSON and markered files do NOT appear in the map. Verify `bkit uninstall .cursor/Dockerfile` still runs the safe-delete branch (preserve if consumer modified) — integration test row in `bkit-modules.integration.test.ts`.

- [ ] **Task 26 — `bkit-tiers.ts` doc-block rewrite.** **HARD ORDERING — CRITICAL:** Tasks 26 and 27 BOTH touch files that Phase 1 docs Tasks 11–13 also rewrite (`docs/architecture.md` in Task 13; `docs/testing.md` in Task 13's surrounding section). Tasks 26 and 27 MUST run AFTER Tasks 11, 12, 13 are complete and merged into `dev`/the working branch — otherwise Task 27's `sed`/grep terminology rewrites will conflict with or partially undo Task 13's section rewrite. Update header to single-model semantics; delete Tier 1/2 distinction section. Verify: `grep -n "Tier [12]" .agents/scripts/bkit-tiers.ts` returns zero matches.

- [ ] **Task 27 — Terminology sweep across `docs/`.** **HARD ORDERING — CRITICAL:** must run AFTER Task 13 (`docs/architecture.md` rewrite) AND after any Task 11–16 Phase 1 doc changes have landed. Task 13's full section rewrite of `docs/architecture.md` and any `docs/testing.md` edits are the canonical Phase 2 wording; Task 27 only sweeps residual `Tier [123]` / `tier: [123]` strings in those files (which should already be re-worded by Task 13). Run `grep -rn "Tier [123]\|tier: [123]" docs/` and rewrite each match in format-aware terminology. Excluded files (retain superseded context): `docs/decisions.md` DE-5/DE-7/DE-8 entries, `docs/knowledge.md` KN-8/KN-13 entries. Update `docs/testing.md`, `docs/deployments.md`, `docs/architecture.md`, `README.md`. Verify: `pnpm lint:no-tier-terms` (added in Task 28) reports zero non-historical hits.

- [ ] **Task 28 — `lint:no-tier-terms` script.** Add to `package.json`: `"lint:no-tier-terms": "..."` per **Architecture & Component Changes**. Wire into `pnpm turbo lint` if appropriate. Verify: script exits 0 after Task 27 sweep is complete.

### 🔒 Gate 2: Code Implementation Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below. **DO NOT stop for user permission.** Once saved, immediately proceed to `Testing & Documentation`.

- [ ] **Gate 2 — Verified:** Tasks 0c, 0d, 0e, 1–10a (Phase 1), 17–24 (Phase 2), 25–28 (Phase 3) complete; every checkbox above checked off. `pnpm turbo lint typecheck format:check test` clean. Phase 1 net LOC delta — use the **path-scoped command from Task 7** (`git diff --stat dev..HEAD -- '.agents/scripts/bkit-tier1-defaults.ts' '.agents/scripts/bkit-tier1-defaults.test.ts' '.agents/scripts/bkit-tiers.ts' '.agents/templates/.cursor/hooks.json' '.agents/templates/.claude/settings.json'`) ≥ 200 lines deleted across those specific paths only. Do NOT use the broader `'.agents/scripts/' '.agents/templates/'` glob — Phase 2 marker additions in the same PR would mask the Phase 1 deletion footprint.

### Mandatory Tasks (Testing & Documentation)

- [ ] **Verify test coverage against Derived Test Matrix:** confirm each row has a corresponding green test. Cross-reference `bkit-tiers.test.ts`, `bkit-uninstall.test.ts`, `bkit-modules.upgrade.integration.test.ts`, `bkit-modules.integration.test.ts`, `bkit-doctor.integration.test.ts`, `bkit-templates.test.ts`, `bkit-version.test.ts`.
- [ ] **Update existing tests:** all `extractBkitNamespace`/`applyBkitNamespace`/`migrateTier1JsonToTier2` references removed.
- [ ] **Write new tests:** seven `deepContains` cases + `writeTier2JsonContained` + `migrateLegacyBkitEnvelope` + `stripTier2JsonScope` + Phase 2 marker presence + Tier-3 drift regression + `.husky/pre-push` survival + Phase 3 schema cleanup.
- [ ] **Verify observability:** `[bkit] migrated <file> — stripped __bkit__ envelope (v2.0.0)` and schema-flip variant conform to `[Context] Message` regex. No PII.
- [ ] **Update documentation:** `docs/architecture.md`, `docs/decisions.md`, `docs/knowledge.md`, `docs/testing.md`, `docs/deployments.md`, `CHANGELOG.md`, `README.md`, `docs/pending.md` updated. `.agents/docs.md` index unchanged (no new doc files).

### 🔒 Gate 3: Testing & Documentation Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below. **DO NOT stop for user permission.** Once saved, immediately proceed to `Verification Plan`.

- [ ] **Docs updated:** every row in **Documentation Updates** completed; `.agents/docs.md` still accurate.
- [ ] **Gate 3 — Verified:** every checkbox above independently verified.

## Verification Plan

### Automated Tests

- [ ] **Type Check & Lint:** `pnpm turbo typecheck lint format:check` clean.
- [ ] **Test Synchronization:** all `*.test.ts` files green: `pnpm turbo test`.
- [ ] **Build Configuration:** confirm `tsconfig.json` `exclude` array does not need a new fixture path.
- [ ] **Unit (`.agents/scripts/bkit-tiers.test.ts`):** `pnpm vitest run bkit-tiers.test.ts` green; ≥ 8 `deepContains` rows (including the asymmetric-size object-array 1→2 case); envelope-related tests removed.
- [ ] **Unit (`.agents/scripts/bkit-uninstall.test.ts`):** `pnpm vitest run bkit-uninstall.test.ts` green; `stripTier2JsonScope` block green.
- [ ] **Unit (`.agents/scripts/bkit-templates.test.ts`):** `pnpm vitest run bkit-templates.test.ts` green; marker presence enforced for Group A + Group B; `slop-scan.config.json` required rules enumerated.
- [ ] **Integration (`.agents/scripts/bkit-modules.upgrade.integration.test.ts`):** `pnpm vitest run bkit-modules.upgrade.integration.test.ts` green; v0.5.x→v0.8.x→v2.0.0 chain green; heavy-customised consumer fixture green; heavy-customised `ci.yml` survival green.
- [ ] **Integration (`.agents/scripts/bkit-modules.integration.test.ts`):** `pnpm vitest run bkit-modules.integration.test.ts` green; envelope advisory + drift advisory + pre-envelope blocker + `bkit uninstall --claude/--cursor` consumer-key survival + Tier-3 drift regression + `.husky/pre-push` survival all green.
- [ ] **Integration (`.agents/scripts/bkit-doctor.integration.test.ts`):** drift advisory + envelope advisory surface through `doctor` verb.
- [ ] **CLI smoke:** in temp dir, run `pnpm bkit install --core --claude --cursor --ci --lint --git-hooks` followed by `pnpm bkit check`. Expect `Done. 0 write(s).` and zero advisories.
- [ ] **Migration smoke:** in temp dir seeded with v1.1.1 fixtures (`__bkit__` envelope), run `pnpm bkit upgrade`. Expect log lines `[bkit] migrated .cursor/hooks.json — schema flip applied (flat-array → keyed-object) (v2.0.0)` and `[bkit] migrated .claude/settings.json — stripped __bkit__ envelope (v2.0.0)`. Files no longer contain `__bkit__`. Run `pnpm bkit check` → green.
- [ ] **Phase 3 lint:** `pnpm lint:no-tier-terms` exits 0 (excluding superseded historical entries).
- [ ] **Run all tests:** `pnpm turbo lint typecheck format:check test`. Fix all failures before Gate 4.

### 🔒 Gate 4: Automated Verification Confirmed

- [ ] **Gate 4 — Verified:** all Automated Tests boxes above checked. Test outputs / CLI results captured.

### Manual Verification

> Dashboard ban: use `gh`, `pnpm bkit`, `git`.

- [ ] **Step 1:** clone `app-gether-life` to a scratch path; bump `@cbartens/bkit` to v2.0.0 candidate (local `pnpm pack` tarball); `pnpm install && pnpm bkit upgrade`. Confirm:
  - `.cursor/hooks.json` and `.claude/settings.json` no longer contain `__bkit__`.
  - Consumer-added `hooks.Stop`, `failClosed` retained byte-identical.
  - `.github/workflows/ci.yml` now contains the bkit marker block wrapping `Install Dependencies` (auth-bearing) through `Run Bkit Check` step inclusive (the regression that broke v1.1.1 silently is now enforced).
  - Markers in `AGENTS.md`, `CLAUDE.md`, `.vale.ini`, etc. wrap bkit-owned content; consumer-only content above/below markers preserved byte-identical.
  - `pnpm bkit check` exits 0 with zero drift advisories.
- [ ] **Step 2:** repeat Step 1 against `visitfrasercoast-com` (lighter customisation profile). Confirm same outcome.
- [ ] **Step 3:** Phase 1 net code reduction confirmation: use the path-scoped command from Task 7 — `git diff --stat dev..HEAD -- '.agents/scripts/bkit-tier1-defaults.ts' '.agents/scripts/bkit-tier1-defaults.test.ts' '.agents/scripts/bkit-tiers.ts' '.agents/templates/.cursor/hooks.json' '.agents/templates/.claude/settings.json'` — confirm ≥ 200 LOC net deletion across those specific paths. Phase 2 marker boilerplate (added in the same v2.0.0 PR) is explicitly OUTSIDE this scoped diff.
- [ ] **Step 4:** Phase 3 terminology-cleanup confirmation: `pnpm lint:no-tier-terms` exits 0.

---

## Open-Question Disposition

<!-- prettier-ignore -->
| Question | Disposition | Where tracked |
| --- | --- | --- |
| Cursor v1 keyed-object schema runtime spike | **REMOVED** per Plan-Phase Decision 2 | `docs/pending.md` entry deleted (Task 16) |
| Drop decorative `.cursor/hooks.json` echoes | **DEFERRED** per Plan-Phase Decision 3 (KEEP for v2.0.0) | `docs/pending.md` |
| `bkit upgrade --prune` flag | **DEFERRED** post-v2.0.0 (no key drops in v2.x yet) | `docs/pending.md` |
| `ci.yml` heavy-customisation marker survival fixture | **IN-SCOPE for v2.0.0 Phase 2** (Task 23a) | Runbook |
| Pre-push duplicate-work in `app-gether-life` | **RESOLVED** by Phase 2 marker addition to `.husky/pre-push` (Task 18a) per Plan-Phase Decision 4 | Runbook |
| Manual fixes in `app-gether-life` | **OUT-OF-SCOPE** per Plan-Phase Decision 5 — left uncommitted in consumer repo | Out-of-Scope section |

---

## Reviewer notes

> Reviewers `@bkit-plan-review-1` and `@bkit-plan-review-2`: please scrutinise in parallel. Focus areas:
>
> - **Reviewer 1:** array-containment semantics (`deepContains` for object-arrays — order-insensitive vs ordered), migration mechanic (`migrateLegacyBkitEnvelope`) idempotency, supersession inventory completeness, Phase 2 manifest-dispatch refactor correctness (no regression of Phase 1 JSON behaviour).
> - **Reviewer 2:** test coverage against Derived Test Matrix, two-version upgrade-chain fixture realism (v0.5.x → v0.8.x → v2.0.0 keys retained), Phase boundary clarity for splittability (Phase 1 / Phase 2 / Phase 3), Phase 2 marker scope correctness for partial-ownership files (`.github/workflows/ci.yml`, `.vale.ini`).
>
> Verdict header at top of file: replace `PENDING` with `PASS|CONCERNS|FAIL` per reviewer; both verdicts must be `PASS` (or `CONCERNS` with reviewer waivers) for promotion to `plan-v2-reviewed.md`.
