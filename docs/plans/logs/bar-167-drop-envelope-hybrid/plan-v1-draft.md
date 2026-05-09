<!-- verdict:end -->

Verdict: PENDING — awaiting parallel review by `@bkit-plan-review-1` and `@bkit-plan-review-2`.

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
- Two-version upgrade-survival regression: consumer keys `hooks.Stop`, `failClosed`, `loop_limit` survive byte-identical from v0.7.x → v0.8.0 → v2.0.0.
- A pre-v2.0.0 consumer with `__bkit__` at top level migrates cleanly on first `bkit upgrade`: envelope stripped, top-level keys retained, `bkit check` green afterward.
- Net code reduction ≥ 200 LOC after deletions in `.agents/scripts/` (tracked at PR review).

---

## 👤 ⚠️ Acceptance Scenario — HUMAN REVIEW REQUIRED

> [!CAUTION]
> **🛑 HUMAN MUST READ AND CONFIRM THIS SECTION.**
> This is the testable contract for the feature. Everything below is derived from what you confirm here.

### Narrative _(plan-defined — no parent design)_

A consumer that installed bkit ≤ v1.1.1 runs `pnpm bkit upgrade` to v2.0.0. On the next install, the legacy `__bkit__` envelope in `.claude/settings.json` and `.cursor/hooks.json` is stripped, the templates ship as schema-clean JSON, and `pnpm bkit check` reports zero drift. The consumer's locally-added keys (`hooks.Stop`, `failClosed`, `loop_limit`, etc.) survive byte-identical, and the bkit-owned subtree (`hooks.SessionStart`, `hooks.sessionStart`, `hooks.sessionStop`) is enforced as a **deep-containment** subset rather than as an envelope-vs-mirror duplication.

### Success Criteria _(plan-defined)_

1. After upgrading from v0.7.x or v0.8.0–v1.1.1 to v2.0.0, `pnpm bkit check` exits 0 with zero drift advisories for `.cursor/hooks.json` and `.claude/settings.json`.
2. `.cursor/hooks.json` template ships in Cursor v1 keyed-object schema (`hooks: { sessionStart: [...], sessionStop: [...] }`) — single-source — with no `__bkit__` key.
3. `.claude/settings.json` template ships top-level keys only, with no `__bkit__` key.
4. Consumer-added top-level keys + nested keys outside the template's deep tree (e.g. `hooks.Stop` in `.claude/settings.json`, `failClosed`, `loop_limit`) survive a v0.7.x → v0.8.0 → v2.0.0 upgrade chain byte-identical.
5. Net deletion of ≥ 200 LOC in `.agents/scripts/` (`applyBkitNamespace`, `extractBkitNamespace`, `migrateTier1JsonToTier2`, the envelope branch of `writeTier2Json`, and `bkit-tier1-defaults.ts` plus its test fixture).

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
| `writeTier2JsonContained` writes template as-is when destination missing | Unit (Vitest) | `.agents/scripts/bkit-tiers.test.ts` |
| `writeTier2JsonContained` deep-merges and idempotents on re-run with identical state | Unit (Vitest) | `.agents/scripts/bkit-tiers.test.ts` |
| `migrateLegacyBkitEnvelope` strips `__bkit__`, retains top-level keys, deep-merges template if absent | Unit (Vitest) | `.agents/scripts/bkit-tiers.test.ts` |
| Pre-v2.0.0 fixture (`__bkit__` + top-level mirror) → upgrade → file matches schema-clean snapshot | Integration (Vitest) | `.agents/scripts/bkit-modules.upgrade.integration.test.ts` |
| Two-version upgrade chain v0.7.x → v0.8.0 → v2.0.0 preserves `hooks.Stop`, `failClosed`, `loop_limit` byte-identical | Integration (Vitest) | `.agents/scripts/bkit-modules.upgrade.integration.test.ts` |
| Heavy-customised consumer fixture (BAR-131 sub-plan-2) survives v2.0.0 upgrade with bkit scope intact | Integration (Vitest) | `.agents/scripts/bkit-modules.upgrade.integration.test.ts` |
| `bkit check` advisory `legacy-bkit-envelope-detected` surfaces on pre-v2.0.0 consumer fixture | Integration (Vitest) | `.agents/scripts/bkit-modules.integration.test.ts` |
| Cursor v1 keyed-object schema spike: parsed template loads cleanly under both legacy and v1 Cursor schema validators | Unit (Vitest) | `.agents/scripts/bkit-tiers.test.ts` (new `cursor-v1-schema.test.ts` block) |

### 👤 ✅ Human Confirmation

- [ ] **Acceptance Scenario confirmed:** I have reviewed the Narrative, Success Criteria, Concrete Example, Edge Cases, and Derived Test Matrix above. They correctly describe what "done" looks like.

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
6. **CHANGELOG.md** v2.0.0 entry: `BREAKING — __bkit__ envelope removed; consumer files auto-migrated on first upgrade. See KN-9 / DE-16.`

### Naming decisions

- New unit primitive: **`deepContains(template: JsonValue, consumer: JsonValue): { ok: boolean; missing: string[]; mismatched: string[] }`** in `.agents/scripts/bkit-tiers.ts`.
- New top-level helper: **`writeTier2JsonContained(srcPath, dstPath, dryRun, ws)`** — replaces envelope branch.
- New migration helper: **`migrateLegacyBkitEnvelope(filePath: string): { stripped: boolean; deepMerged: boolean }`** — replaces `migrateTier1JsonToTier2`. (Names "Tier-1" intentionally avoided — Phase 3 retires that vocabulary.)
- New decision entry: **`DE-16: BAR-167 — Drop __bkit__ envelope; adopt format-aware containment (markers + JSON deep-contain) (2026-05-09)`** supersedes DE-7 + DE-8.
- New knowledge entry: **`KN-9: BAR-167 — Tier-2 deep-merge canonical superseded by deep-containment`** supersedes KN-8.

### Schema migrations

- `.bkit-version` schema **unchanged in Phase 1**. `tier3Hashes` and `canonicalHashes` continue to be written by `runCoreModule`. (Phase 3 may retire `tier3Hashes` once Tier-3 terminology is gone.)

### 👤 ✅ Human Confirmation

- [ ] **Breaking Changes confirmed:** I have reviewed all breaking changes and naming decisions above.

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
    - dest present → run `deepContains(template, existing)`. If `ok=true` and content unchanged → no-op. If `ok=false` → deep-merge template into existing via existing `deepMergeJson`, write result.
    - Idempotent on identical state.
  - `migrateLegacyBkitEnvelope(filePath: string): { stripped: boolean; deepMerged: boolean }`
    - Reads file; parses JSON; if top-level `__bkit__` absent → returns `{ stripped: false, deepMerged: false }`.
    - Strips `__bkit__` from doc.
    - Loads template from `getPkgRoot()`-resolved path; runs `deepContains(template, postStripDoc)`. If `ok=true` → write doc; return `{ stripped: true, deepMerged: false }`.
    - If `ok=false` → deep-merge template into doc; write; return `{ stripped: true, deepMerged: true }`.
    - Caller logs once: `[bkit] migrated <file> — stripped __bkit__ envelope (v2.0.0)`.
    - Idempotent: re-run on a file without `__bkit__` returns `{ stripped: false, deepMerged: false }`.
- **DELETE:**
  - `applyBkitNamespace`
  - `extractBkitNamespace`
  - `migrateTier1JsonToTier2`
  - Envelope-guard `throw` and inner branch in `writeTier2Json`. The function is renamed `writeTier2JsonContained` (signature unchanged). All call sites in `bkit-modules.ts` updated.
- **Doc-block update:** rewrite the `Tier 2` section header to describe deep-containment + deep-merge semantics; remove all references to `__bkit__`.

##### [MODIFY] `.agents/scripts/bkit-modules.ts`

- **Existence Check:** verified.
- **`runClaudeModule` (lines ~467–493):**
  - Replace the `migrateTier1JsonToTier2(settingsDst, ".claude/settings.json", onDiskVersion)` call with `migrateLegacyBkitEnvelope(settingsDst)`.
  - Replace `writeTier2Json(settingsSrc, settingsDst, dryRun, ws)` with `writeTier2JsonContained(settingsSrc, settingsDst, dryRun, ws)`.
  - Update log line to `${logPrefix} ${tag}claude: ${settingsDst} (migrated __bkit__ envelope)` when `stripped` is true.
  - Drop the `versionFile`/`onDiskVersion` lookup block (no longer needed — `migrateLegacyBkitEnvelope` is version-agnostic).
- **`runCursorModule` (lines ~557–580):**
  - Mirror the same swap for `.cursor/hooks.json`.
- **Imports:** drop `migrateTier1JsonToTier2`, `writeTier2Json`; add `migrateLegacyBkitEnvelope`, `writeTier2JsonContained`. Drop the unused `readBkitVersion` import in this branch (only used for the deleted version-lookup block — verify no other usage in module before removing).

##### [MODIFY] `.agents/scripts/bkit-install.ts`

- **Existence Check:** verified — `postDispatch` callbacks live at `bkit-install.ts` ≈ line 896; canonical-hash recording at ≈ line 803.
- **No structural changes required** for Phase 1 — `postDispatch` continues to record `canonicalHashes` per file as today. The recorded hash is now over the schema-clean file (no `__bkit__`), which is correct.
- **Verification only:** confirm `postDispatch` still flushes after all modules complete; confirm hash for `.claude/settings.json` and `.cursor/hooks.json` records the post-merge file (not the template).

##### [MODIFY] `.agents/scripts/bkit-preflight.ts`

- **ADD:** advisory `legacy-bkit-envelope-detected` — fires when `bkit check` (read-only path) sees `__bkit__` at top level of `.cursor/hooks.json` or `.claude/settings.json` and the recorded `canonicalHashes` indicates the file was last written under a pre-v2.0.0 bkit. Action text: `Run \`pnpm bkit upgrade\` to migrate to the v2.0.0 ownership model.`
- **Severity:** `advisory`. Does NOT block.

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

- [ ] **Task 0a — Cursor v1 spike re-run.** Open a fresh Cursor build, install a sandbox repo with the keyed-object `hooks.json`, trigger a session-start hook, confirm `[bkit] session started` echoes in Cursor log. Document outcome in DE-16 draft.
- [ ] **Task 0b — Read project decisions + knowledge.** `read_file` `docs/decisions.md` (DE-6 → DE-15), `docs/knowledge.md` (KN-8). Confirm no conflict with this plan's deletions.
- [ ] **Task 0c — Confirm BAR-131 sub-plan-2 heavy-customised consumer fixture exists.** Locate the fixture file; if missing, create one under `.agents/scripts/__fixtures__/heavy-customised-consumer-v0_7_x/` with the canonical pre-bkit shape.

### Phase 1 — Code (sequential)

- [ ] **Task 1 — `deepContains` primitive.** Add `deepContains` to `.agents/scripts/bkit-tiers.ts`. Implement object containment + array-of-primitive subset + array-of-object element-wise order-insensitive containment. Verify: `pnpm vitest run bkit-tiers.test.ts -t deepContains` green for the seven new test rows.
- [ ] **Task 2 — `writeTier2JsonContained`.** Rename `writeTier2Json` → `writeTier2JsonContained` in `.agents/scripts/bkit-tiers.ts`. Remove the envelope-guard `throw`. Replace internal `applyBkitNamespace(...)` call with `deepMergeJson(existing, template)` semantics. Verify: `pnpm vitest run bkit-tiers.test.ts -t writeTier2JsonContained` green.
- [ ] **Task 3 — `migrateLegacyBkitEnvelope`.** Add to `.agents/scripts/bkit-tiers.ts`. Verify: `pnpm vitest run bkit-tiers.test.ts -t migrateLegacyBkitEnvelope` green.
- [ ] **Task 4 — Update `runClaudeModule` + `runCursorModule`.** Edit `.agents/scripts/bkit-modules.ts`: swap function calls per **Architecture & Component Changes**. Drop `versionFile`/`onDiskVersion` blocks. Verify: `pnpm vitest run bkit-modules.test.ts` green.
- [ ] **Task 5 — Templates rewrite.** Rewrite `.agents/templates/.cursor/hooks.json` and `.agents/templates/.claude/settings.json` per spec. Run `pnpm bkit install` in this worktree against itself; confirm `pnpm bkit check` reports `Done. 0 write(s).`
- [ ] **Task 6 — Preflight advisory.** Add `legacy-bkit-envelope-detected` advisory to `.agents/scripts/bkit-preflight.ts`. Verify: `pnpm vitest run bkit-preflight.test.ts` green; manual fixture check on a `__bkit__`-containing file emits the advisory.
- [ ] **Task 7 — Delete obsolete code.** Delete `.agents/scripts/bkit-tier1-defaults.ts` and `.agents/scripts/bkit-tier1-defaults.test.ts`. Delete `applyBkitNamespace`, `extractBkitNamespace`, `migrateTier1JsonToTier2` from `.agents/scripts/bkit-tiers.ts`. Verify: `pnpm tsc --noEmit` clean; `pnpm turbo lint typecheck format:check test` clean. Run `git diff --stat` to confirm net deletion ≥ 200 LOC.

### Phase 1 — Tests

- [ ] **Task 8 — `bkit-tiers.test.ts` rewrite.** Apply the test changes in **Documentation / Tests** section above. Verify: full file passes.
- [ ] **Task 9 — Upgrade integration tests.** Add the three new tests to `.agents/scripts/bkit-modules.upgrade.integration.test.ts`. Two-version fixture chain v0.7.x → v0.8.0 → v2.0.0. Heavy-customised consumer fixture. Idempotency. Verify: `pnpm vitest run bkit-modules.upgrade.integration.test.ts` green.
- [ ] **Task 10 — Modules integration test.** Add `legacy-bkit-envelope-detected` advisory test to `.agents/scripts/bkit-modules.integration.test.ts`. Verify green.

### Phase 1 — Documentation

- [ ] **Task 11 — DE-16.** Append to `docs/decisions.md`. Edit DE-7 and DE-8 headers to mark superseded.
- [ ] **Task 12 — KN-9.** Append to `docs/knowledge.md`. Edit KN-8 header to mark superseded.
- [ ] **Task 13 — `docs/architecture.md` Tier-2 JSON section.** Rewrite per spec.
- [ ] **Task 14 — CHANGELOG v2.0.0 entry.** Append breaking-change line.
- [ ] **Task 15 — README.md sweep.** Replace any `__bkit__` user-facing mention with deep-containment language.
- [ ] **Task 16 — `docs/pending.md` follow-ups.** Append five entries (Phase 2, Phase 3, `--prune`, decorative-echoes question, `ci.yml` marker fixture).

### 🔒 Gate 2: Code Implementation Check

- [ ] **Gate 2 — Verified:** Tasks 1–10 complete; every checkbox above checked off. `pnpm turbo lint typecheck format:check test` clean. Net LOC delta from `git diff --stat` ≥ 200 lines deleted.

### Mandatory Tasks (Testing & Documentation)

- [ ] **Verify test coverage against Derived Test Matrix:** confirm each row in the matrix has a corresponding green test. Cross-reference `bkit-tiers.test.ts` and `bkit-modules.upgrade.integration.test.ts`.
- [ ] **Update existing tests:** all `extractBkitNamespace` / `applyBkitNamespace` / `migrateTier1JsonToTier2` references removed from test files.
- [ ] **Write new tests:** seven `deepContains` cases + four `writeTier2JsonContained` + four `migrateLegacyBkitEnvelope` + three integration scenarios.
- [ ] **Verify observability:** `[bkit] migrated <file> — stripped __bkit__ envelope (v2.0.0)` log line conforms to `[Context] Message` regex; no PII; no correlation ID needed (CLI is single-user).
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
- [ ] **Integration (`.agents/scripts/bkit-modules.upgrade.integration.test.ts`):** `pnpm vitest run bkit-modules.upgrade.integration.test.ts` green; two-version chain fixture green; heavy-customised consumer fixture green.
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
- [ ] **Step 3:** confirm net code reduction at PR review: `git diff --stat dev..HEAD -- '.agents/scripts/'` shows ≥ 200 LOC deleted.

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
