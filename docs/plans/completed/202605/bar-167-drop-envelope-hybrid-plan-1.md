Verdict: CONCERNS

<!-- verdict:end -->

# BAR-167 Sub-plan A — v2.0.0-alpha (Phase 1: Drop the JSON envelope)

**Parent Plan:** [bar-167-drop-envelope-hybrid-plan.md](./bar-167-drop-envelope-hybrid-plan.md)
**Master record (historical):** [plan-v3-checked.md](./plan-v3-checked.md)
**Hard prerequisites:** none — sub-plan A is the foundation.
**Hard downstream consumers:** sub-plan B (`bar-167-drop-envelope-hybrid-plan-2.md`) depends on Tasks 1, 4b, 6 of this sub-plan; sub-plan C (`bar-167-drop-envelope-hybrid-plan-3.md`) depends on Tasks 11–13 doc rewrites of this sub-plan.
**Ship target:** `bkit v2.0.0-alpha` (or first incremental landing of three-step `2.0.0` if the index chooses single-tag mode).

> [!CAUTION]
> **CRITICAL:** Do not hallucinate plan execution state.
>
> 1. ALWAYS read this `bar-167-drop-envelope-hybrid-plan-1.md` natively via `read_file` before executing any step.
> 2. NEVER trust system-generated session summaries or previous conversation history to determine what has been completed.
> 3. Source of truth is EXCLUSIVELY the literal `[x]` vs `[ ]` checkboxes in this physical document.

---

## Context & Goals (sub-plan-scoped)

bkit v0.8.0 introduced a `__bkit__` JSON envelope (DE-7/DE-8, BAR-131/142). A consumer audit on 2026-05-09 surfaced two real-world failure modes — duplicated content across `__bkit__` + top-level keys; and silent drift on `.github/workflows/ci.yml` losing its `pnpm bkit check` step. BAR-167 collapses Tier 1/2/3 into a single rule:

> Every template file in `.agents/templates/` declares a **bkit-owned scope**. The consumer file must contain that scope intact.

**Sub-plan A (Phase 1) scope:** Drop the `__bkit__` envelope; introduce JSON containment primitives (`deepContains`, `writeTier2JsonContained`, `migrateLegacyBkitEnvelope`, `stripTier2JsonScope`); rewrite the two JSON templates schema-clean; add Phase 1 preflight advisories + blocker; migrate existing pre-v2.0.0 consumers cleanly on first `bkit upgrade`; ship Phase 1 tests + Phase 1 docs (DE-16, KN-15, architecture rewrite, CHANGELOG, README, `package.json` v2.0.0-alpha bump). DE-7 + DE-8 are reversed; KN-8 is superseded.

**Sub-plan A success criteria (subset of master):**

1. After upgrading from v0.8.0–v1.1.1 to v2.0.0(-alpha), `pnpm bkit check` exits 0 with zero drift advisories on JSON surfaces (`.cursor/hooks.json`, `.claude/settings.json`). Pre-v0.8.0 direct upgrades are blocked at preflight with explicit advisory.
2. `.cursor/hooks.json` template ships in Cursor v1 keyed-object schema; `.claude/settings.json` template ships top-level-only; neither file contains `__bkit__`.
3. Consumer-added keys outside the template's deep tree (`hooks.Stop`, `failClosed`, `loop_limit`) survive a v0.5.x → v0.8.x → v2.0.0(-alpha) upgrade chain byte-identical.
4. Net deletion ≥ 200 LOC across the **path-scoped** Phase 1 deletion targets only (see Task 7 verification).

---

## 👤 ⚠️ Acceptance Scenario — HUMAN REVIEW REQUIRED

> [!CAUTION]
> **🛑 HUMAN MUST READ AND CONFIRM THIS SECTION.** This is the testable contract for Phase 1.

### Narrative _(plan-defined — no parent design)_

A consumer that installed bkit ≤ v1.1.1 runs `pnpm bkit upgrade` to v2.0.0(-alpha). On the next install, the legacy `__bkit__` envelope in `.claude/settings.json` and `.cursor/hooks.json` is stripped, the templates ship as schema-clean JSON, and `pnpm bkit check` reports zero drift on those JSON surfaces. The consumer's locally-added keys (`hooks.Stop`, `failClosed`, `loop_limit`) survive byte-identical. The bkit-owned subtree (`hooks.SessionStart`, `hooks.sessionStart`, `hooks.sessionStop`) is enforced as a deep-containment subset.

### Concrete Example

**Setup:** Consumer repo on bkit v1.1.1. `.cursor/hooks.json` contains `__bkit__` envelope plus duplicate top-level `hooks` array. `.claude/settings.json` contains `__bkit__` plus consumer-added `hooks.Stop` and `failClosed`.

**Steps:**

1. Consumer bumps `@cbartens/bkit` to `^2.0.0-alpha` and runs `pnpm install`.
2. Consumer runs `pnpm bkit upgrade`. bkit:
   - Detects `__bkit__` at top level of both JSON files; strips it; runs `deepContains(template, postStripConsumer)` and deep-merges the template (with template-wins schema-flip for the `.cursor/hooks.json` flat-array → keyed-object) where containment fails.
3. bkit logs once per migrated JSON file: `[bkit] migrated .cursor/hooks.json — schema flip applied (flat-array → keyed-object) (v2.0.0)` and `[bkit] migrated .claude/settings.json — stripped __bkit__ envelope (v2.0.0)`.
4. Consumer runs `pnpm bkit check` → exits 0; zero drift advisories on JSON surfaces.
5. `git diff` shows: `__bkit__` block gone; consumer-only keys (`hooks.Stop`, `failClosed`) byte-identical.

### Edge Cases (Phase 1 only)

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
| **Schema-flip on type-mismatched same-path values** (consumer flat-array `hooks: [...]` vs template keyed-object `hooks: {...}`) | `writeTier2JsonContained` detects type-flip during deep-merge: template wins. `migrateLegacyBkitEnvelope` returns `{ stripped: true, deepMerged: true, schemaFlipped: true }`; logged as schema-flip variant. |
| **Pre-v0.8.0 consumer (Tier-1 flat shape, no envelope) runs `bkit upgrade` directly to v2.0.0** | Preflight blocker `pre-envelope-bkit-version-detected` (severity blocker): `pinnedVersion < 0.8.0` AND no `__bkit__`. Action: route through v1.x first. |
| Consumer's `.bkit-version` is missing entirely AND consumer file lacks `__bkit__` | Treated as fresh install — template written as-is; pre-envelope blocker does NOT fire when no `pinnedVersion` is on record. |
| `deepContains` invoked with `null` template or `null` consumer at any path | `(null, null)` → ok. `(null, x)` → ok (consumer is superset of "nothing"). `(x, null)` → ok=false; `missing` lists the pathPrefix. |

### Derived Test Matrix (Phase 1 rows only)

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
| `deepContains` array-of-objects asymmetric size: template 1 element, consumer 2 elements (1 deep-equal + 1 consumer extra) → ok=true | Unit (Vitest) | `.agents/scripts/bkit-tiers.test.ts` |
| `deepContains` mixed-array (primitives + objects) uses element-wise per-type semantics; `missing` reports element index path | Unit (Vitest) | `.agents/scripts/bkit-tiers.test.ts` |
| `deepContains` null-input boundary cases: (null,null)→ok; (null,obj)→ok; (obj,null)→missing path | Unit (Vitest) | `.agents/scripts/bkit-tiers.test.ts` |
| `writeTier2JsonContained` writes template as-is when destination missing | Unit (Vitest) | `.agents/scripts/bkit-tiers.test.ts` |
| `writeTier2JsonContained` deep-merges and idempotents on re-run with identical state | Unit (Vitest) | `.agents/scripts/bkit-tiers.test.ts` |
| `writeTier2JsonContained` schema-flip: type-mismatched same-path values → template wins | Unit (Vitest) | `.agents/scripts/bkit-tiers.test.ts` |
| `migrateLegacyBkitEnvelope` strips `__bkit__`, retains top-level keys, deep-merges template if absent | Unit (Vitest) | `.agents/scripts/bkit-tiers.test.ts` |
| `migrateLegacyBkitEnvelope` reports `schemaFlipped: true` when post-strip top-level value type-flips against template — **MUST use Task-0c fixture** `tests/fixtures/heavy-customised-consumer-v1-envelope/cursor-hooks.json` BEFORE shape | Unit (Vitest) | `.agents/scripts/bkit-tiers.test.ts` |
| `stripTier2JsonScope` removes template scope, preserves consumer-only siblings, prunes empty intermediates only where template populated them | Unit (Vitest) | `.agents/scripts/bkit-uninstall.test.ts` |
| Cursor v1 keyed-object schema sanity: parsed template has `version === 1`, `hooks.sessionStart`/`hooks.sessionStop` arrays, no `__bkit__`, no flat-array `hooks` | Unit (Vitest) | `.agents/scripts/bkit-tiers.test.ts` (block `cursor-v1-schema`) |
| **Phase 1 — Upgrade chain & migration** |  |  |
| Pre-v2.0.0 fixture (`__bkit__` + top-level mirror) → upgrade → file matches schema-clean snapshot | Integration (Vitest) | `.agents/scripts/bkit-modules.upgrade.integration.test.ts` |
| Upgrade chain v0.5.x → v0.8.x → v2.0.0 preserves `hooks.Stop`, `failClosed`, `loop_limit` byte-identical | Integration (Vitest) | `.agents/scripts/bkit-modules.upgrade.integration.test.ts` |
| Heavy-customised consumer fixture (BAR-131 sub-plan-2) survives v2.0.0 upgrade with bkit scope intact | Integration (Vitest) | `.agents/scripts/bkit-modules.upgrade.integration.test.ts` |
| Idempotency — running `bkit upgrade` twice on a v2.0.0 file is a no-op | Integration (Vitest) | `.agents/scripts/bkit-modules.upgrade.integration.test.ts` |
| `bkit check` advisory `legacy-bkit-envelope-detected` surfaces on pre-v2.0.0 consumer fixture; exits 0 | Integration (Vitest) | `.agents/scripts/bkit-modules.integration.test.ts` |
| `bkit check` advisory `tier2-json-drift` surfaces when consumer file is missing a template key — covers `.cursor/hooks.json`, `.claude/settings.json`, **AND `slop-scan.config.json`** (the slop-scan row is gated by Sub-gate 2A in sub-plan B because it requires Task 19 reclassification) | Integration (Vitest) | `.agents/scripts/bkit-modules.integration.test.ts` |
| `bkit check` blocker `pre-envelope-bkit-version-detected` surfaces when on-disk `pinnedVersion < 0.8.0` and no `__bkit__` | Integration (Vitest) | `.agents/scripts/bkit-modules.integration.test.ts` |
| `bkit doctor` integration: drift advisory and `legacy-bkit-envelope-detected` surface through doctor verb | Integration (Vitest) | `.agents/scripts/bkit-doctor.integration.test.ts` |
| `bkit uninstall --claude` strips template scope; retains consumer-added `hooks.Stop`, `failClosed` byte-identical (PREREQ: Task 19 reclassification — gated by Sub-gate 2A in sub-plan B) | Integration (Vitest) | `.agents/scripts/bkit-modules.integration.test.ts` |
| `bkit uninstall --cursor` strips template scope (`hooks.sessionStart`/`hooks.sessionStop`); retains consumer-only top-level + nested keys (PREREQ: Task 19 reclassification — gated by Sub-gate 2A in sub-plan B) | Integration (Vitest) | `.agents/scripts/bkit-modules.integration.test.ts` |
| `bkit uninstall .cursor/Dockerfile` safe-delete: when consumer hash matches `tier3Hashes` entry → file deleted; when consumer modified → preserved | Integration (Vitest) | `.agents/scripts/bkit-modules.integration.test.ts` |

### 👤 ✅ Human Confirmation

- [x] **Acceptance Scenario confirmed:** Phase 1 narrative, success criteria, edge cases, and test matrix correctly describe what "done" looks like for sub-plan A.
- [x] **Breaking Changes confirmed:** Phase 1 breaking changes (envelope removal, public API deletions, `writeTier2Json` rename, Cursor v1 keyed-object schema flip) reviewed.

> [!CAUTION]
> **Agent:** Do NOT pass Gate 1 until both checkboxes above are `[x]`.

---

## Breaking Changes (Phase 1 only)

1. **`__bkit__` envelope removed** from `.agents/templates/.claude/settings.json` and `.agents/templates/.cursor/hooks.json`. Reverses DE-7 and DE-8.
2. **Public API surface deletions** from `.agents/scripts/bkit-tiers.ts`:
   - `applyBkitNamespace`, `extractBkitNamespace`, `migrateTier1JsonToTier2`, envelope branch of `writeTier2Json`, `BKIT_TIER1_DEFAULTS_BY_VERSION` (and the entire file `.agents/scripts/bkit-tier1-defaults.ts`).
3. **`writeTier2Json` rename → `writeTier2JsonContained`** — callers in `bkit-modules.ts` updated.
4. **`.cursor/hooks.json` template schema migrated** to Cursor v1 keyed-object.
5. **Migration mechanic** — `bkit upgrade` runs `migrateLegacyBkitEnvelope` once per consumer file. Idempotent. Logs on stripping or schema flip.
6. **CHANGELOG.md** v2.0.0(-alpha) entry per master plan §9.

### Naming decisions

- `deepContains(template, consumer, pathPrefix?)` — new pure unit primitive in `bkit-tiers.ts` (~60 LOC).
- `writeTier2JsonContained(srcPath, dstPath, dryRun, ws)` — replaces envelope branch of `writeTier2Json`.
- `migrateLegacyBkitEnvelope(doc, template) → { stripped, deepMerged, schemaFlipped, outDoc }` — pure JSON utility, no file I/O.
- `stripTier2JsonScope(consumerDoc, templateDoc) → trimmedDoc` — pure JSON helper.
- `.agents/scripts/bkit-paths.ts` — new module exporting `getPkgRoot()` lifted from `bkit-modules.ts`. Breaks the `bkit-preflight ↔ bkit-modules` cycle.
- `DE-16` (new), `KN-15` (new) — supersede DE-7+DE-8 and KN-8 respectively.

### Schema migrations

None in Phase 1 — `.bkit-version` writer narrowing is deferred to sub-plan C / Phase 3.

---

## Out of Scope (sub-plan A)

- Phase 2 (markers everywhere, manifest dispatch refactor) — see [bar-167-drop-envelope-hybrid-plan-2.md](./bar-167-drop-envelope-hybrid-plan-2.md).
- Phase 3 (terminology sweep, schema cleanup, lint script) — see [bar-167-drop-envelope-hybrid-plan-3.md](./bar-167-drop-envelope-hybrid-plan-3.md).
- Cursor v1 runtime spike — REMOVED per Plan-Phase Decision 2.
- Pre-v0.8.0 direct upgrades — blocked at preflight; consumer routed through v1.x first.
- `bkit upgrade --prune` flag — deferred to post-v2.0.0; tracked in `docs/pending.md`.

## Merge Method

**Merge method: always squash.**

## Supersession Inventory (Phase 1 only)

<!-- prettier-ignore -->
| Existing artifact | Replaced by | Decision | Justification |
| --- | --- | --- | --- |
| `.agents/scripts/bkit-tiers.ts` → `extractBkitNamespace` | `deepContains` | DELETE | Envelope contract removed. |
| `.agents/scripts/bkit-tiers.ts` → `applyBkitNamespace` | (none) | DELETE | Envelope removed; consumer file no longer wrapped. |
| `.agents/scripts/bkit-tiers.ts` → `migrateTier1JsonToTier2` | `migrateLegacyBkitEnvelope` | DELETE | Old function obsolete. |
| `.agents/scripts/bkit-tiers.ts` → envelope branch of `writeTier2Json` | `writeTier2JsonContained` | DELETE | Envelope-guard `throw` rolled back. |
| `.agents/scripts/bkit-tier1-defaults.ts` (full file) | (none) | DELETE | Sole consumer was `migrateTier1JsonToTier2`. |
| `.agents/scripts/bkit-tier1-defaults.test.ts` | (none) | DELETE | Tests for the deleted module. |
| `.agents/templates/.claude/settings.json` (envelope wrapper) | Schema-clean top-level template | DELETE | `__bkit__` block deleted. |
| `.agents/templates/.cursor/hooks.json` (envelope wrapper + flat-array `hooks`) | Cursor v1 keyed-object schema, schema-clean | DELETE | Migrated to keyed-object; envelope removed. |
| DE-7, DE-8 | DE-16 | RETAIN-WITH-REASON | Append-only history. |
| KN-8 | KN-15 | RETAIN-WITH-REASON | Append-only history. |
| `docs/pending.md` entry "Cursor v1 spike" | (deleted) | DELETE | Task 0a removed per Plan-Phase Decision 2. |

## Security & Privacy

N/A — refactor of bkit's own template ownership model; no new routes/DB/secrets/PII.

## 🚨 Pre-Flight / Dependencies 🚨

### Core (always verify)

- [ ] **Package Management:** `package.json` no new runtime deps; `pnpm-lock.yaml` syncs cleanly.
- [ ] **Dependency Versions:** `pnpm outdated`; spot-check `pnpm`, `node`, `vitest`.
- [ ] **User Context:** read/write to `.agents/scripts/`, `.agents/templates/`, `docs/decisions.md`, `docs/knowledge.md`, `docs/architecture.md`, `CHANGELOG.md`, `README.md`, `docs/pending.md`.
- [ ] **Pending Blockers:** query Linear for `blocker` issues touching bkit templates / Tier-2 / `__bkit__` / `bkit upgrade`.
- [ ] **Project Context:** read `docs/decisions.md` (DE-5, DE-6, DE-7, DE-8, DE-10, DE-12, DE-13), `docs/knowledge.md` (KN-8, KN-13), `docs/architecture.md` (Tier-2 JSON section).
- [ ] **Testing & Quality:** new tests under `.agents/scripts/*.test.ts` (unit) and `.agents/scripts/*.integration.test.ts` per `docs/testing.md`.
- [ ] **Prerequisite Plans:** none — sub-plan A is self-contained.

### Conditional (verify only when applicable)

- [ ] **Observability (new log lines):** confirm `[bkit] migrated <file> — stripped __bkit__ envelope (v2.0.0)` and the schema-flip variant follow `[Context] Message` regex.

### 🔒 Gate 1: Prerequisites Check

- [ ] **Acceptance Scenario confirmed:** human checkbox above `[x]`.
- [ ] **Breaking Changes confirmed:** human checkbox above `[x]`.
- [ ] **Gate 1 — Verified:** all Core items checked.

## Data Schema Integration

None — no DB tables read or written.

## Architecture & Component Changes

### Templates

#### [MODIFY] `.agents/templates/.cursor/hooks.json`

- Rewrite as Cursor v1 keyed-object schema. Drop `__bkit__`. Drop top-level mirror duplication.
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

#### [MODIFY] `.agents/templates/.claude/settings.json`

- Drop the `__bkit__` block. Top-level keys remain unchanged.

### Code

#### [ADD] `.agents/scripts/bkit-paths.ts`

- New file — single export `getPkgRoot(): string`. Lift from `bkit-modules.ts` ~lines 90–95. Imports allowed: `node:path`, `node:url`, `node:fs` only.

#### [MODIFY] `.agents/scripts/bkit-tiers.ts`

- **ADD `deepContains(template, consumer, pathPrefix?)`** (~60 LOC) — recursive walk; returns `{ ok, missing, mismatched }`. Object containment, array-of-primitive subset, array-of-object element-wise order-insensitive containment, mixed-array per-type, null boundary cases.
- **ADD `writeTier2JsonContained(srcPath, dstPath, dryRun, ws)`** — dest absent → write template as-is; dest present → `deepContains` → ok no-op; ok=false → `deepMergeJson(existing, template)` (template-wins). Schema-flip flag.
- **ADD `migrateLegacyBkitEnvelope(doc, template)`** — pure function, no file I/O. `__bkit__` absent → no-op. Strip → `deepContains` → if ok=true return; else `deepMergeJson` with `deepMerged: true` and `schemaFlipped` if any path type-flipped. Idempotent.
- **DELETE:** `applyBkitNamespace`, `extractBkitNamespace`, `migrateTier1JsonToTier2`, envelope-guard `throw` and inner branch of `writeTier2Json` (renamed). Doc-block update is deferred to sub-plan C Task 26.

#### [MODIFY] `.agents/scripts/bkit-modules.ts`

- `runClaudeModule`: read consumer at `settingsDst` → resolve template via `getPkgRoot()` (now from `./bkit-paths`) → call `migrateLegacyBkitEnvelope(parsedDoc, parsedTemplate)` → if `stripped` write `outDoc` via atomic write (temp + rename). Then `writeTier2JsonContained`. Log per protocol. Drop `versionFile`/`onDiskVersion` lookup.
- `runCursorModule`: mirror `.cursor/hooks.json`. Schema-flip log especially relevant here.
- Imports: drop `migrateTier1JsonToTier2`, `writeTier2Json`; add `migrateLegacyBkitEnvelope`, `writeTier2JsonContained`. Retain `readBkitVersion`.

#### [MODIFY] `.agents/scripts/bkit-preflight.ts`

- Allow-list extension (header comment): `readBkitVersion`, `deepContains`, `getPkgRoot`.
- ADD advisory `legacy-bkit-envelope-detected` — fires when `__bkit__` present at top-level. Severity advisory.
- ADD advisory `tier2-json-drift` — runs `deepContains` for `.cursor/hooks.json`, `.claude/settings.json`. Severity advisory.
- ADD blocker `pre-envelope-bkit-version-detected` — `pinnedVersion < 0.8.0` AND no top-level `__bkit__`. `bkit upgrade` exits non-zero.
- (Phase 2's `tier2-text-drift` is added in sub-plan B Task 21.)

#### [MODIFY] `.agents/scripts/bkit-uninstall.ts`

- Phase 1 surgical extension: detect JSON-format files (by file extension `.json` as Phase-1 stopgap; by manifest `format` field once sub-plan B Task 19 lands) and dispatch to `stripTier2JsonScope`.
- ADD function `stripTier2JsonScope(consumerDoc, templateDoc)`:
  1. Deep-clone consumer to `out`.
  2. Walk template; for each leaf path `p`: if `out[p]` deep-equals template → delete; else leave.
  3. Prune template-introduced empty intermediate objects (NOT arrays; NOT consumer-only siblings).
  4. Return `out`.
- Imports: add `getPkgRoot` from `./bkit-paths`. No `__bkit__` lookup anywhere.

#### [MODIFY] `.agents/scripts/bkit-version.ts`

- **No schema change in Phase 1.** Confirm `BkitVersion = { pinnedVersion, tier3Hashes, canonicalHashes }` — all three remain.
- After deletion of `bkit-tier1-defaults.ts`, grep for any other consumer of `BKIT_TIER1_DEFAULTS_BY_VERSION`; remove imports if only test+module remain.

### Code Deletions

- [DELETE] `.agents/scripts/bkit-tier1-defaults.ts` — sole consumer was `migrateTier1JsonToTier2`.
- [DELETE] `.agents/scripts/bkit-tier1-defaults.test.ts` — tests for the deleted module.

### Tests

#### [MODIFY] `.agents/scripts/bkit-tiers.test.ts`

- DELETE blocks: `extractBkitNamespace`, `applyBkitNamespace`, `migrateTier1JsonToTier2`, envelope-guard branch of `writeTier2Json`.
- ADD blocks: `deepContains` (8 rows), `writeTier2JsonContained` (write-as-is, deep-merge, idempotent, malformed-dest fallback, schema-flip), `migrateLegacyBkitEnvelope` (4 sub-cases), `cursor-v1-schema` static block.

#### [MODIFY] `.agents/scripts/bkit-uninstall.test.ts`

- ADD block: `stripTier2JsonScope` — leaf-deletion, consumer-only sibling preservation, empty-intermediate pruning, array preservation.

#### [MODIFY] `.agents/scripts/bkit-modules.upgrade.integration.test.ts`

- Imports update line 14: remove `migrateTier1JsonToTier2`, `writeTier2Json`; add `writeTier2JsonContained`, `migrateLegacyBkitEnvelope`.
- ADD: pre-v2.0.0 fixture test (`heavy-customised-consumer-v1-envelope`).
- ADD: v0.5.x → v0.8.x → v2.0.0 chain.
- ADD: heavy-customised consumer fixture survival.
- ADD: idempotency (second `bkit upgrade` no-op).

#### [MODIFY] `.agents/scripts/bkit-modules.integration.test.ts`

- ADD: `legacy-bkit-envelope-detected` advisory test.
- ADD: `tier2-json-drift` advisory test (note: the `slop-scan.config.json` row is gated by Sub-gate 2A in sub-plan B because it requires Task 19 reclassification).
- ADD: `pre-envelope-bkit-version-detected` blocker test.
- ADD: `bkit uninstall --claude` consumer-key survival (PREREQ: sub-plan B Task 19 reclassification — comment in file).
- ADD: `bkit uninstall --cursor` consumer-key survival (PREREQ: sub-plan B Task 19 reclassification — comment in file).
- ADD: `bkit uninstall .cursor/Dockerfile` safe-delete (two sub-rows: hash matches → delete; consumer modified → preserve).

#### [MODIFY] `.agents/scripts/bkit-doctor.integration.test.ts`

- ADD: drift advisory + `legacy-bkit-envelope-detected` surface through `doctor` verb.

### Static Fixture (committed)

#### [NEW] `tests/fixtures/heavy-customised-consumer-v1-envelope/`

- Static-input fixture for the v0.8.x → v2.0.0 leg of the upgrade chain.
- Files (BEFORE / AFTER shapes per master plan):
  - `cursor-hooks.json` BEFORE — envelope + flat-array + consumer keys; AFTER — schema-clean keyed-object + consumer keys.
  - `claude-settings.json` BEFORE — envelope + top-level mirror + consumer Stop hook; AFTER — schema-clean.
  - `bkit-version.json` — `{ "pinnedVersion": "0.8.5", "tier3Hashes": {}, "canonicalHashes": {} }`.

## Cron Jobs & Scheduled Tasks

None.

## Documentation Updates

> Phase 1 docs only; Phase 3 sweep is in sub-plan C.

- `docs/decisions.md` — DE-16 appended; DE-7 and DE-8 headers marked superseded.
- `docs/knowledge.md` — KN-15 appended; KN-8 header marked superseded.
- `docs/architecture.md` — Tier-2 JSON section rewrite (deep-containment + format-aware callout); ASCII tree comments updated. (Residual `Tier [123]` strings will be swept in sub-plan C Task 27.)
- `CHANGELOG.md` — v2.0.0(-alpha) entry per Breaking Changes.
- `README.md` — replace `__bkit__` user-facing mentions with deep-containment / format-aware language.
- `docs/pending.md` — DELETE Cursor-v1 spike entry; APPEND `bkit upgrade --prune` deferred + `.cursor/hooks.json` echoes deferred.
- `package.json` — version bump to `2.0.0` (or `2.0.0-alpha` if shipping incrementally — see parent index ship-mode decision).

## Rollback Strategy

<!-- prettier-ignore -->
| Axis | Action | Notes |
| --- | --- | --- |
| Code | `git revert {MERGE_COMMIT}` | Restores `__bkit__` templates + envelope helpers + Tier-1 defaults file. Consumer JSON files keep their post-strip schema-clean shape; next `bkit install` re-writes envelope on top via deep-merge. |
| Risk window | One `bkit upgrade` cycle | No data loss; brief schema-pollution window. |
| DB | N/A |  |

## Agent Execution Runbook (sub-plan A — Phase 1)

> Chronological. Each task includes scope, target file(s), and verification step.
>
> **Hard ordering:** Task 14a (package.json bump) MUST execute before Task 5. Task 0c MUST land before Tasks 3, 9, and 7.

### Phase 1 — Pre-implementation

- [x] **Task 0c — Static fixture for upgrade-chain regression.** Existing v0.5.x→v0.8.x fixture lives at `tests/fixtures/heavy-customised-consumer/`. Create new sibling fixture at `tests/fixtures/heavy-customised-consumer-v1-envelope/` with `cursor-hooks.json`, `claude-settings.json`, `bkit-version.json` per the JSON shapes in **Static Fixture (committed)**. Verify: `git status` shows the three new files; `pnpm vitest run bkit-modules.upgrade.integration.test.ts` does NOT yet reference them (added in Task 9).

- [x] **Task 0d — Static fixture for `.husky/pre-push` consumer customisation.** Create `tests/fixtures/heavy-customised-prepush/.husky/pre-push` with the bkit-owned `# bkit:start`/`# bkit:end` block (lines 3–7 of the template) PLUS three consumer-only lines below the closing marker prefixed `# bkit-repo only` (e.g. `pnpm typecheck`, `pnpm test`, `pnpm format:check`). Consumed by sub-plan B Task 23b. Verify: `git status` shows the new file; `grep -c '^# bkit-repo only' tests/fixtures/heavy-customised-prepush/.husky/pre-push` ≥ 1; the byte-content between markers is byte-identical to the template's marker block.

- [x] **Task 0e — Static fixture for heavy-customised `ci.yml`.** Create `tests/fixtures/heavy-customised-ci/.github/workflows/ci.yml` containing: (a) bkit's marker block per sub-plan B Task 18 spec wrapping `Install Dependencies` → `Run Bkit Check`, byte-identical to template inside markers; (b) consumer-added env vars on `Install Dependencies` step INSIDE the marker block (e.g. `NODE_AUTH_TOKEN: ${{ secrets.NODE_AUTH_TOKEN }}`); (c) consumer-only steps OUTSIDE the marker block. Verify: `git status` shows new file. Inside-marker (b) MUST cause sub-plan B Task 23a's drift assertion to flag `tier2-text-drift`; outside-marker (c) MUST be preserved across `bkit upgrade`.

  > **Note:** Task 0a (Cursor v1 spike) **REMOVED** per Plan-Phase Decision 2. Task 0b (read project decisions/knowledge) folded into Pre-Flight Core item.

### Phase 1 — Code (sequential)

- [x] **Task 1 — `deepContains` primitive.** Add `deepContains(template, consumer, pathPrefix?)` to `.agents/scripts/bkit-tiers.ts`. Implement object containment + array-of-primitive subset + array-of-object element-wise order-insensitive containment + asymmetric-size object-array (1→2 → ok=true) + mixed-array semantics + null-input boundary. ~60 LOC. Verify: `pnpm vitest run bkit-tiers.test.ts -t deepContains` green for the eight matrix rows.

- [x] **Task 1b — Extract `getPkgRoot()` to shared util.** Create `.agents/scripts/bkit-paths.ts` exporting `getPkgRoot()` (lift from `bkit-modules.ts:90–95`). Update `bkit-modules.ts` to import from `./bkit-paths`. Verify: `pnpm tsc --noEmit` clean; no circular import warnings.

- [x] **Task 2 — `writeTier2JsonContained`.** Rename `writeTier2Json` → `writeTier2JsonContained` in `.agents/scripts/bkit-tiers.ts`. Remove envelope-guard `throw`. Use `deepMergeJson(existing, template)` (template override; signature at `bkit-tiers.ts:33`). Add schema-flip handling. Verify: `pnpm vitest run bkit-tiers.test.ts -t writeTier2JsonContained` green; schema-flip row passes.

- [x] **Task 3 — `migrateLegacyBkitEnvelope`.** Add pure JSON helper to `.agents/scripts/bkit-tiers.ts`. Signature: `(doc, template) → { stripped, deepMerged, schemaFlipped, outDoc }`. NO file I/O, NO `getPkgRoot()` import. Verify: `pnpm vitest run bkit-tiers.test.ts -t migrateLegacyBkitEnvelope` green for all four sub-cases. **Schema-flip row:** MUST load Task-0c fixture `tests/fixtures/heavy-customised-consumer-v1-envelope/cursor-hooks.json` BEFORE shape — that fixture's compound shape is the canonical type-flip case (`schemaFlipped: true` AND `deepMerged: true` simultaneously).

- [x] **Task 4 — Update `runClaudeModule` + `runCursorModule`.** Edit `.agents/scripts/bkit-modules.ts`: read consumer file → resolve template via `getPkgRoot()` (from `bkit-paths.ts`) → call `migrateLegacyBkitEnvelope(doc, template)` → if `stripped` write `outDoc` via atomic-write (temp + rename). Then `writeTier2JsonContained`. Drop `versionFile`/`onDiskVersion`. Malformed-JSON falls through to `writeTier2JsonContained` malformed branch (do NOT call migration on unparsed string). Verify: `pnpm tsc --noEmit` clean; `pnpm vitest run bkit-modules.test.ts` green.

- [x] **Task 4b — Build JSON-aware `bkit uninstall` strip-merge path.** **STATE-CLARIFICATION:** in current `bkit-manifest.ts`, `.claude/settings.json` and `.cursor/hooks.json` are `tier: 1` → `bkit-uninstall.ts:case 1` dispatches `decision: "delete"` (full-file delete). The "zombie footprint" symptom appears in `case 2` only AFTER sub-plan B Task 19 reclassifies them to `format: "json"`. **Build sub-task:** add `stripTier2JsonScope(consumerDoc, templateDoc)` per Algorithm. Extend `case 2` (today calls `detectMarkerStyle(content)` → `null` for JSON → falls to `"preserve"`) to detect JSON-format files. New code path **dormant for `.claude/settings.json` and `.cursor/hooks.json` until sub-plan B Task 19**. **Verify (Phase 1):** `pnpm vitest run bkit-uninstall.test.ts -t stripTier2JsonScope` green (pure-function unit). **Verify (post-sub-plan-B-Task-19):** `pnpm vitest run bkit-modules.integration.test.ts -t "bkit uninstall --claude strips template scope"` and `--cursor` green. Mark these integration tests with a `// PREREQ: Task 19 reclassification` comment.

- [x] **Task 5 — Templates rewrite (JSON).** **PREREQ (HARD):** Tasks 1, 1b, 2, 3, 4, and 14a all complete. Without Tasks 1–4 first, `pnpm bkit install` against the worktree crashes (legacy `throw`) or no-ops. Rewrite `.agents/templates/.cursor/hooks.json` (Cursor v1 keyed-object) and `.agents/templates/.claude/settings.json` (drop `__bkit__`). Run `pnpm bkit install` in worktree against itself; confirm `pnpm bkit check` reports `Done. 0 write(s).`

- [x] **Task 6 — Preflight advisories + drift detection.** Edit `.agents/scripts/bkit-preflight.ts`: extend allow-list (header comment) for `readBkitVersion`, `deepContains`, `getPkgRoot`. Add advisories `legacy-bkit-envelope-detected`, `tier2-json-drift`, blocker `pre-envelope-bkit-version-detected`. Condition for `legacy-bkit-envelope-detected`: `__bkit__` present at top-level — full stop (no `canonicalHashes` predicate). (Phase 2's `tier2-text-drift` added in sub-plan B Task 21 — already prepared by allow-list.) Verify: `pnpm vitest run bkit-preflight.test.ts` green. End-to-end is Task 10.

- [x] **Task 7 — Delete obsolete code.** **HARD PREREQ:** Task 0c complete. Delete `.agents/scripts/bkit-tier1-defaults.ts` and `.agents/scripts/bkit-tier1-defaults.test.ts`. Delete `applyBkitNamespace`, `extractBkitNamespace`, `migrateTier1JsonToTier2` from `bkit-tiers.ts`. **Sub-task — fix existing test imports:** edit `bkit-modules.upgrade.integration.test.ts` line 14 — remove `migrateTier1JsonToTier2`, `writeTier2Json`; add `writeTier2JsonContained`, `migrateLegacyBkitEnvelope` (or remove import entirely if v0.8.x leg now driven by static fixture). Grep codebase for other imports. Verify: `pnpm tsc --noEmit` clean; `pnpm turbo lint typecheck format:check test` clean. **Phase 1 net-deletion verification (path-scoped, NOT whole-tree):** Run `git diff --stat dev..HEAD -- '.agents/scripts/bkit-tier1-defaults.ts' '.agents/scripts/bkit-tier1-defaults.test.ts' '.agents/scripts/bkit-tiers.ts' '.agents/templates/.cursor/hooks.json' '.agents/templates/.claude/settings.json'` and confirm net deletion ≥ 200 LOC across THESE FILES ONLY. Phase 2 marker additions (sub-plan B) are explicitly excluded.

### Phase 1 — Tests

- [x] **Task 8 — `bkit-tiers.test.ts` rewrite.** Apply test changes in **Tests** section. Include `cursor-v1-schema` static unit block. Verify: full file passes; mixed-array, null-boundary, schema-flip, `cursor-v1-schema` all green.

- [x] **Task 8b — `bkit-uninstall.test.ts` `stripTier2JsonScope` test block.** Add unit tests covering leaf-deletion, consumer-only sibling preservation, empty-intermediate pruning (only where template populated), array preservation. Verify: `pnpm vitest run bkit-uninstall.test.ts -t stripTier2JsonScope` green.

- [x] **Task 9 — Upgrade integration tests.** Add the integration test rows to `bkit-modules.upgrade.integration.test.ts`. v0.5.x→v0.8.x leg uses existing `tests/fixtures/heavy-customised-consumer/`; v0.8.x→v2.0.0 leg uses new sibling `tests/fixtures/heavy-customised-consumer-v1-envelope/`. Heavy-customised consumer fixture. Idempotency. Verify: `pnpm vitest run bkit-modules.upgrade.integration.test.ts` green.

- [x] **Task 10 — Modules integration tests.** Add `legacy-bkit-envelope-detected` advisory test, `tier2-json-drift` advisory test (for `.cursor/hooks.json`, `.claude/settings.json`, **and `slop-scan.config.json`** — drop one of ten required `rules` keys → `bkit check` raises `tier2-json-drift`), `pre-envelope-bkit-version-detected` blocker test, `bkit uninstall --claude` consumer-key survival, `bkit uninstall --cursor` consumer-key survival. **Add `bkit uninstall .cursor/Dockerfile` safe-delete row:** (i) consumer hash matches → file deleted; (ii) consumer modified → preserved. This row reuses existing `shouldDeleteTier3` byte-equal-text branch and is required to land in sub-plan A so sub-plan C Task 25 can verify writer narrowing didn't regress safe-delete. Verify green. **Note:** the `slop-scan.config.json` drift row depends on sub-plan B Task 19 reclassifying that file to `format: "json"` — gate behind Sub-gate 2A (in sub-plan B) OR mark `// PREREQ: Task 19 reclassification` and run after Task 19. Same for the `bkit uninstall --claude/--cursor` rows.

- [x] **Task 10a — `bkit doctor` integration test.** Edit `.agents/scripts/bkit-doctor.integration.test.ts` to assert `tier2-json-drift` and `legacy-bkit-envelope-detected` surface through the `doctor` verb. Verify green.

### Phase 1 — Documentation

- [x] **Task 11 — DE-16.** Append to `docs/decisions.md`. Edit DE-7 and DE-8 headers to mark superseded (`(superseded by DE-16, 2026-05-09)`). (Implemented as DE-18 since DE-16 was already taken by BAR-155; DE-7/DE-8 marked superseded by DE-18, 2026-05-11.)

- [x] **Task 12 — KN-15.** Append to `docs/knowledge.md`. Edit KN-8 header to mark superseded. Existing KN-9 preserved as-is; new entry uses next available number KN-15. (Implemented as KN-17 since KN-15 was already taken; KN-8 marked superseded by KN-17.)

- [x] **Task 13 — `docs/architecture.md` rewrite.** Tier-2 JSON section + ASCII tree annotations updated. (Residual `Tier [123]` strings outside this rewritten section are swept in sub-plan C Task 27.)

- [x] **Task 14 — CHANGELOG v2.0.0 entry.** Append breaking-change line per Breaking Changes §9.

- [x] **Task 14a — `package.json` version bump.** **ORDERING — CRITICAL:** version bump from `1.1.1` to `2.0.0` (or `2.0.0-alpha` if parent index chose pre-release ship-mode) MUST happen BEFORE Task 5. Filed under Documentation but pulled forward into Code section. (i) Edit `package.json` `"version"`; (ii) Task 5's install records correct `pinnedVersion`; (iii) post-Task-5, run `pnpm install` to refresh `pnpm-lock.yaml`. Verify: `git diff package.json` shows version bump; `cat .agents/.bkit-version | grep pinnedVersion` shows the new version.

- [x] **Task 15 — README.md sweep.** Replace `__bkit__` user-facing mentions with deep-containment / format-aware language.

- [x] **Task 16 — `docs/pending.md` follow-ups.** DELETE Cursor-v1 spike pending entry (Task 0a removed). APPEND `bkit upgrade --prune` (still deferred) and "Drop decorative `.cursor/hooks.json` echoes" (Plan-Phase Decision 3 = KEEP).

### 🔒 Gate 2: Code Implementation Check (Phase 1 partial)

- [ ] **Gate 2 (sub-plan A) — Verified:** Tasks 0c, 0d, 0e, 1–10a (Phase 1) complete; every checkbox above checked off. `pnpm turbo lint typecheck format:check test` clean. Phase 1 net LOC delta (path-scoped command from Task 7) ≥ 200 lines deleted across the five Phase 1 paths only. Sub-plan B (Phase 2) covers remaining Tier-3 drift regression and marker dispatch tasks; Sub-plan C (Phase 3) covers cleanup + lint script. Full Gate 2 (covering Phase 2 + Phase 3) lives in sub-plan B.

### Mandatory Tasks (Testing & Documentation — sub-plan A subset)

- [ ] **Verify test coverage against Phase 1 Test Matrix:** confirm each Phase 1 row has a corresponding green test.
- [ ] **Update existing tests:** all `extractBkitNamespace`/`applyBkitNamespace`/`migrateTier1JsonToTier2` references removed.
- [ ] **Write new tests:** seven `deepContains` cases + `writeTier2JsonContained` + `migrateLegacyBkitEnvelope` + `stripTier2JsonScope`.
- [ ] **Verify observability:** migration log lines conform to `[Context] Message` regex. No PII.
- [ ] **Update documentation (Phase 1 only):** `docs/architecture.md`, `docs/decisions.md`, `docs/knowledge.md`, `CHANGELOG.md`, `README.md`, `docs/pending.md` updated.

### 🔒 Gate 3: Testing & Documentation Check (sub-plan A scope)

- [ ] **Docs updated (Phase 1):** every Phase 1 row in **Documentation Updates** completed.
- [ ] **Gate 3 (sub-plan A) — Verified:** every checkbox above independently verified.

## Verification Plan (sub-plan A scope)

### Automated Tests

- [ ] **Type Check & Lint:** `pnpm turbo typecheck lint format:check` clean.
- [ ] **Test Synchronization:** all `*.test.ts` green: `pnpm turbo test`.
- [ ] **Unit (`bkit-tiers.test.ts`):** ≥ 8 `deepContains` rows; envelope-related tests removed.
- [ ] **Unit (`bkit-uninstall.test.ts`):** `stripTier2JsonScope` block green.
- [ ] **Integration (`bkit-modules.upgrade.integration.test.ts`):** v0.5.x→v0.8.x→v2.0.0 chain green; heavy-customised consumer fixture green; idempotency green.
- [ ] **Integration (`bkit-modules.integration.test.ts`):** envelope advisory + drift advisory + pre-envelope blocker green; `bkit uninstall --claude/--cursor` and `slop-scan.config.json` drift rows marked `// PREREQ: Task 19 reclassification`.
- [ ] **Integration (`bkit-doctor.integration.test.ts`):** drift + envelope advisories surface through `doctor`.
- [ ] **CLI smoke:** in temp dir, `pnpm bkit install --core --claude --cursor`; `pnpm bkit check` → `Done. 0 write(s).`
- [ ] **Migration smoke:** v1.1.1-fixture seeded temp dir → `pnpm bkit upgrade` → log lines emitted; files no longer contain `__bkit__`; `pnpm bkit check` green.
- [ ] **Run all tests:** `pnpm turbo lint typecheck format:check test`.

### 🔒 Gate 4: Automated Verification Confirmed (sub-plan A scope)

- [ ] **Gate 4 (sub-plan A) — Verified:** all Automated Tests boxes checked. Test outputs / CLI results captured.

### Manual Verification

- [ ] **Step 1:** clone `app-gether-life`; bump `@cbartens/bkit` to v2.0.0(-alpha) candidate; `pnpm install && pnpm bkit upgrade`. Confirm `.cursor/hooks.json` and `.claude/settings.json` no longer contain `__bkit__`; consumer-added `hooks.Stop`, `failClosed` retained byte-identical; `pnpm bkit check` exits 0 on JSON surfaces (markered-text surfaces verified in sub-plan B).
- [ ] **Step 2:** repeat against `visitfrasercoast-com`. Confirm same outcome.
- [ ] **Step 3:** Phase 1 net code reduction confirmation: path-scoped command from Task 7 — confirm ≥ 200 LOC net deletion across the five Phase 1 paths.

---

## Open-Question Disposition (sub-plan A scope)

<!-- prettier-ignore -->
| Question | Disposition | Where tracked |
| --- | --- | --- |
| Cursor v1 keyed-object schema runtime spike | **REMOVED** per Plan-Phase Decision 2 | `docs/pending.md` entry deleted (Task 16) |
| `bkit upgrade --prune` flag | **DEFERRED** post-v2.0.0 | `docs/pending.md` |
| Drop decorative `.cursor/hooks.json` echoes | **DEFERRED** per Plan-Phase Decision 3 (KEEP) | `docs/pending.md` |

---

## Reviewer notes

> Inherited CONCERNS verdict from `plan-v3-checked.md`. Reviewers — focus on:
>
> - array-containment semantics (`deepContains` for object-arrays — order-insensitive vs ordered).
> - migration mechanic (`migrateLegacyBkitEnvelope`) idempotency.
> - Phase 1 supersession inventory completeness.
> - Phase 1 test coverage realism (v0.5.x → v0.8.x → v2.0.0 keys retained).
