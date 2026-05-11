Verdict: CONCERNS

<!-- verdict:end -->

# BAR-167 Sub-plan C — v2.0.0 (Phase 3: Schema cleanup + terminology sweep)

**Parent Plan:** [bar-167-drop-envelope-hybrid-plan.md](./bar-167-drop-envelope-hybrid-plan.md)
**Master record (historical):** [plan-v3-checked.md](./plan-v3-checked.md)
**Hard prerequisites:**
- Sub-plan B ([bar-167-drop-envelope-hybrid-plan-2.md](./bar-167-drop-envelope-hybrid-plan-2.md)) MUST be merged. Specifically:
  - **Task 19** of sub-plan B (`format` field on `ManifestEntry`) — required by Task 25 of this sub-plan (narrowed-writer test asserts emission only for `format: "byte-equal-text"`).
- Sub-plan A ([bar-167-drop-envelope-hybrid-plan-1.md](./bar-167-drop-envelope-hybrid-plan-1.md)) MUST be merged. Specifically:
  - **Tasks 11, 12, 13** of sub-plan A (DE-16 append, KN-15 append, `docs/architecture.md` rewrite) — required by Tasks 26 and 27 of this sub-plan as the canonical baseline for the terminology sweep. Task 27's `sed`/grep rewrites would conflict with Task 13's section rewrite if Task 13 had not landed first.
**Hard downstream consumers:** none — sub-plan C is the final ship.
**Ship target:** `bkit v2.0.0` (final). If parent index chose pre-release ship-mode, the final tag drops the `-alpha`/`-beta` suffix and lands on this merge.

> [!CAUTION]
> **CRITICAL:** Do not hallucinate plan execution state.
>
> 1. ALWAYS read this `bar-167-drop-envelope-hybrid-plan-3.md` natively via `read_file` before executing any step.
> 2. NEVER trust system-generated session summaries.
> 3. Source of truth is EXCLUSIVELY the literal `[x]` vs `[ ]` checkboxes in this document.

---

## Context & Goals (sub-plan-scoped)

Sub-plan A dropped the JSON envelope; sub-plan B added markers everywhere and refactored manifest dispatch to `format`-based. **Sub-plan C (Phase 3) scope:**

1. **Schema cleanup** — `.bkit-version` writer narrows `tier3Hashes` emission from "all tier-3 files" to "byte-equal-text files only" (currently `.cursor/Dockerfile`). Reader retains backward-compat parse for one minor version (v2.0.x). Field stays required in `BkitVersion` because `bkit-uninstall.ts:196` (`shouldDeleteTier3`) reads it for the `byte-equal-text` branch — dropping entirely would silently regress uninstall safety.
2. **Doc-block update** — rewrite `bkit-tiers.ts` doc-block to reflect single-model semantics: format-aware containment. Remove `Tier 1/2 distinction` section.
3. **Terminology sweep** — remove `Tier [123]` / `tier: [123]` strings from `docs/`. Excluded files (retain superseded context): `docs/decisions.md` DE-5/DE-7/DE-8 entries, `docs/knowledge.md` KN-8/KN-13 entries.
4. **Lint script** — add `lint:no-tier-terms` to `package.json`. Wire into `pnpm turbo lint` if appropriate.

**Sub-plan C success criteria (subset of master):**

5. Phase 3 cleanup: `Tier [123]` / `tier: [123]` strings removed from `docs/` (excluding superseded-history references); `bkit-manifest.ts` schema simplified to `{ path, format, module }` (already done in sub-plan B Task 19); `bkit-tiers.ts` doc-block rewritten.
6. `pnpm lint:no-tier-terms` exits 0 (excluding superseded historical entries).
7. **Schema migration verification:** `bkit uninstall .cursor/Dockerfile` still runs the safe-delete branch (preserve if consumer modified) — re-verifies the row from sub-plan A Task 10.

---

## 👤 ⚠️ Acceptance Scenario — HUMAN REVIEW REQUIRED

> [!CAUTION]
> **🛑 HUMAN MUST READ AND CONFIRM THIS SECTION.** This is the testable contract for Phase 3.

### Narrative _(plan-defined — no parent design)_

After sub-plans A and B land, sub-plan C closes BAR-167 by removing `Tier [123]` terminology from documentation, narrowing the `.bkit-version` writer to emit `tier3Hashes` only for `byte-equal-text` files (preserving the safe-delete invariant for `.cursor/Dockerfile`), rewriting the `bkit-tiers.ts` doc-block to single-model "format-aware containment" language, and adding a regression-guarding `lint:no-tier-terms` script.

### Concrete Example

**Setup:** Sub-plans A and B merged. Branch is on bkit v2.0.0-beta with all markers in place and manifest using `format`.

**Steps:**

1. Tasks 25–28 are executed in order.
2. After Task 25 (writer narrowing): `cat .agents/.bkit-version` after fresh install shows `tier3Hashes` map containing only the `.cursor/Dockerfile` hash; JSON and markered files do NOT appear in the map.
3. After Task 26 (doc-block): `grep -n "Tier [12]" .agents/scripts/bkit-tiers.ts` returns zero matches.
4. After Task 27 (sweep): `grep -rn "Tier [123]\|tier: [123]" docs/` returns only the excluded historical entries.
5. After Task 28: `pnpm lint:no-tier-terms` exits 0.

### Edge Cases (Phase 3 only)

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| Consumer's `.bkit-version` retains `tier3Hashes` field after schema cleanup | Writer narrows emission to `byte-equal-text` files only (`.cursor/Dockerfile`); writer drops emission for `json` and `markered-text` formats. Reader retains backward-compat parsing for one minor version. **Critical:** writer must continue to emit `tier3Hashes` for `byte-equal-text` files — otherwise `bkit uninstall` for `.cursor/Dockerfile` falls into the "always preserve" branch (regression in uninstall safety). No consumer data migration needed (additive cleanup). |

### Derived Test Matrix (Phase 3 rows only)

> Each row → one Agent Execution Runbook task.

<!-- prettier-ignore -->
| Test description | Type | Target file |
| --- | --- | --- |
| **Phase 3 — Schema & terminology cleanup** | | |
| `parseBkitVersion` reads a v2.0.0 `.bkit-version` JSON missing `tier3Hashes` and returns `tier3Hashes: {}` (backward-compat for one minor version) | Unit (Vitest) | `.agents/scripts/bkit-version.test.ts` |
| `writeBkitVersion` after narrowed writer change: emitted `tier3Hashes` map contains only `byte-equal-text` paths (`.cursor/Dockerfile`); `json` and `markered-text` paths absent | Unit (Vitest) | `.agents/scripts/bkit-version.test.ts` |
| `bkit uninstall .cursor/Dockerfile` safe-delete: when consumer hash matches `tier3Hashes` entry → file deleted; when consumer modified → preserved (re-verifies the sub-plan A Task 10 row after writer narrowing) | Integration (Vitest) | `.agents/scripts/bkit-modules.integration.test.ts` |
| `bkit-tiers.ts` doc-block grep: no `Tier 1`, `Tier 2`, `Tier 3` strings remain | Static check (Vitest snapshot or grep-in-test) | `.agents/scripts/bkit-tiers.test.ts` |
| `docs/` grep: no `Tier [123]` strings remain (excluding superseded-history references in `KN-8` and superseded `DE-` entries which retain context) | Static check (npm script + CI) | `package.json` `scripts.lint:no-tier-terms` |

### 👤 ✅ Human Confirmation

- [ ] **Acceptance Scenario confirmed:** Phase 3 narrative, success criteria, edge cases, and test matrix correctly describe what "done" looks like for sub-plan C.
- [ ] **Breaking Changes confirmed:** Phase 3 schema cleanup (`tier3Hashes` writer narrowing) and terminology sweep reviewed.

> [!CAUTION]
> **Agent:** Do NOT pass Gate 1 until both checkboxes above are `[x]`.

---

## Breaking Changes (Phase 3 only)

8. **Phase 3 schema cleanup** — `tier3Hashes` removed from `.bkit-version` writer **for `json` and `markered-text` files only** (writer continues to emit for `byte-equal-text`). Reader retains backward-compat for one minor version.
9. **Terminology removal** — `Tier [123]` / `tier: [123]` removed from `docs/` (excluding superseded historical entries).

### Naming decisions

- New decision entry: **`DE-16` already appended in sub-plan A Task 11**; sub-plan C only sweeps residual terminology and rewrites `bkit-tiers.ts` doc-block.
- New knowledge entry: **`KN-15` already appended in sub-plan A Task 12**; sub-plan C does not modify it.

### Schema migrations

- `.bkit-version` writer **narrows** `tier3Hashes` content from "all tier-3 files" to "byte-equal-text files only". Reader retains backward-compat parsing for one minor version (v2.0.x). Writer emits `{ pinnedVersion, canonicalHashes, tier3Hashes }` where `tier3Hashes` now contains only entries with `format: "byte-equal-text"` (currently `.cursor/Dockerfile`). Field still required by `bkit-uninstall.ts`'s `shouldDeleteTier3` for the byte-equal-text branch — dropping entirely would silently regress uninstall safety on `.cursor/Dockerfile`.

---

## Out of Scope (sub-plan C)

- Phase 1 (envelope drop, JSON primitives) — completed in sub-plan A.
- Phase 2 (markers, manifest dispatch) — completed in sub-plan B.

## Merge Method

**Merge method: always squash.**

## Supersession Inventory (Phase 3 only)

<!-- prettier-ignore -->
| Existing artifact | Replaced by | Decision | Justification |
| --- | --- | --- | --- |
| `.bkit-version` writer field `tier3Hashes` | (writer narrows to `byte-equal-text` files only — `.cursor/Dockerfile`; reader keeps backward-compat parse for one minor version) | RETAIN-WITH-REASON (writer-side narrowing) | `byte-equal-text` safe-delete in `bkit-uninstall.ts:196` (`shouldDeleteTier3`) still needs the hash. Field stays required in `BkitVersion`. |
| `Tier 1` / `Tier 2` / `Tier 3` terminology in `docs/architecture.md`, `docs/testing.md`, `docs/decisions.md` (DE-5 retained as historical), `docs/knowledge.md` (KN-8 retained as superseded history), `bkit-tiers.ts` doc-block | Format-aware containment / managed-scope terminology | DELETE | Phase 3 — single mental model. Historical references in superseded DE/KN entries explicitly retained per append-only docs contract. |

## Security & Privacy

N/A.

## 🚨 Pre-Flight / Dependencies 🚨

### Core (always verify)

- [ ] **Sub-plans A and B merged:** confirm Tasks 11, 12, 13 (sub-plan A) and Task 19 (sub-plan B) are merged into the working branch.
- [ ] **Package Management:** no new runtime deps; new `lint:no-tier-terms` script may use `grep` (POSIX) or a Node script — see Task 28.
- [ ] **User Context:** read/write to `.agents/scripts/bkit-version.ts`, `.agents/scripts/bkit-tiers.ts` (doc-block only), `docs/architecture.md`, `docs/knowledge.md`, `docs/deployments.md`, `docs/testing.md`, `README.md`, `package.json`, `docs/completed.md`.
- [ ] **Pending Blockers:** none anticipated.
- [ ] **Project Context:** confirm DE-16 and KN-15 are present (sub-plan A Tasks 11, 12).
- [ ] **Testing & Quality:** updates to `.agents/scripts/bkit-version.test.ts`, `.agents/scripts/bkit-tiers.test.ts` (static grep), `.agents/scripts/bkit-modules.integration.test.ts` (re-verify Dockerfile safe-delete row).

### Conditional (verify only when applicable)

_None applicable._

### 🔒 Gate 1: Prerequisites Check (sub-plan C)

- [ ] **Acceptance Scenario confirmed:** human checkbox above `[x]`.
- [ ] **Breaking Changes confirmed:** human checkbox above `[x]`.
- [ ] **Sub-plans A and B predecessors:** Tasks 11, 12, 13, 19 merged.
- [ ] **Gate 1 — Verified.**

## Data Schema Integration

None.

## Architecture & Component Changes

### Schema

#### [MODIFY] `.agents/scripts/bkit-version.ts`

- **Writer change (narrow, not drop):** writer emits `tier3Hashes` only for entries with `format: "byte-equal-text"` (currently `.cursor/Dockerfile`). For `format: "json"` and `format: "markered-text"` the writer no longer populates the map, because `stripTier2JsonScope` and marker extraction supersede the hash-based safe-delete check. **Do NOT drop the field entirely** — `bkit-uninstall.ts:196` (`shouldDeleteTier3`) reads it for the `byte-equal-text` branch.
- **Reader change:** retain backward-compat parsing — if `tier3Hashes` absent in older consumer files, default to `{}` for one minor version (v2.0.x). Reader-side parsing of pre-v2.0.0 files (where `tier3Hashes` covered all formats) tolerates the wider map.
- **Type:** `BkitVersion.tier3Hashes` stays `Record<string, string>` (required, non-optional). Narrowed writer still emits it (now sparse — only byte-equal-text paths). `tsc --noEmit` unaffected; no call-site type changes.
- **Verification:** `grep -rn 'tier3Hashes' .agents/scripts/` — confirm only `bkit-version.ts`, `bkit-version.test.ts`, and `bkit-uninstall.ts` (`shouldDeleteTier3` byte-equal-text branch) retain references.

### Doc-blocks

#### [MODIFY] `.agents/scripts/bkit-tiers.ts` doc-block

- Rewrite header to reflect single-model semantics: format-aware containment. Delete the `Tier 1/2 distinction` section. Document `deepContains`, `writeTier2JsonContained`, `migrateLegacyBkitEnvelope`, `stripTier2JsonScope` (cross-reference) as the public contract.

### Documentation

#### [MODIFY] `docs/architecture.md`

- Sub-plan A Task 13 already rewrote the Tier-2 JSON section + ASCII tree comments. Task 27 sweeps any **residual** `Tier [123]` strings outside that section. Add a "format-aware containment" callout if not already present.

#### [MODIFY] `docs/knowledge.md`

- Sub-plan A Task 12 already appended KN-15 and marked KN-8 superseded. Task 27 sweeps any **residual** `Tier [123]` strings (excluding KN-8/KN-13 retained historical entries).

#### [MODIFY] `docs/decisions.md`

- Sub-plan A Task 11 already appended DE-16 and marked DE-7/DE-8 superseded. Task 27 leaves DE-5/DE-7/DE-8 entries intact (excluded from sweep).

#### [MODIFY] `docs/testing.md`

- Search for `Tier [123]` strings; rewrite with `format` terminology. Surface the new test file `.agents/scripts/bkit-templates.test.ts` (created in sub-plan B Task 22) in the test inventory.

#### [MODIFY] `docs/deployments.md`

- Search for `Tier [123]` strings; replace with format terminology if any reference exists.

#### [MODIFY] `README.md`

- Sub-plan A Task 15 already swept `__bkit__` user-facing mentions. Task 27 sweeps any residual `Tier [123]` strings.

#### [MODIFY] `docs/completed.md`

- **APPEND** post-merge: `BAR-167 — Format-aware containment; v2.0.0 (2026-05-XX)`.

#### [MODIFY] `package.json`

- **ADD** `scripts.lint:no-tier-terms` — `"lint:no-tier-terms": "! grep -rn 'Tier [123]\\|tier: [123]' docs/ .agents/scripts/*.ts --include='*.md' --include='*.ts' || (echo 'Tier 1/2/3 terminology found — Phase 3 cleanup regression' && exit 1)"`. Excludes `docs/decisions.md` historical entries (DE-5, DE-7, DE-8) and `docs/knowledge.md` (KN-8, KN-13) which retain superseded context.
- **Implementation guidance — prefer Node script over inline `grep -v`:** the file-level `grep -v` approach skips the entire file, missing future regressions in NEW locations inside `docs/decisions.md` or `docs/knowledge.md` (outside DE-5/DE-7/DE-8/KN-8/KN-13). The Node script approach (`.agents/scripts/lint-no-tier-terms.ts`) lets the exclusion list be encoded as an explicit array of `{ file, sectionRegex }` tuples (e.g. `{ file: "docs/decisions.md", sectionRegex: /^## DE-(5|7|8)\b/ }`) — a top-of-script `EXCLUSIONS` constant. Build agent SHOULD pick the Node script approach; if `grep -v` is used, document the residual gap in DE-16.
- If shipping incrementally with version bump: bump `package.json` `"version"` from `2.0.0-beta` to `2.0.0` (final).

## Cron Jobs & Scheduled Tasks

None.

## Documentation Updates

> Already enumerated above under Phase 3 → Documentation. No additional rows.

## Rollback Strategy

| Axis | Action | Notes |
| --- | --- | --- |
| Code | `git revert {MERGE_COMMIT}` | Revert restores `tier3Hashes` writer to the wider emission (all tier-3 files) and re-introduces `Tier [123]` strings in docs. Consumers' `.bkit-version` files keep their narrowed `tier3Hashes` map; next install re-emits the wider map. No data loss. |
| Risk window | One install cycle | Brief schema-pollution + terminology-inconsistency window. |
| DB | N/A | |

## Agent Execution Runbook (sub-plan C — Phase 3)

> Chronological. **HARD ORDERING:** Tasks 26 and 27 MUST run AFTER Tasks 11–13 of sub-plan A are merged.

### Phase 3 — Cleanup

- [ ] **Task 25 — `.bkit-version` writer narrows `tier3Hashes` to byte-equal-text only.** Edit `.agents/scripts/bkit-version.ts`: writer continues to emit `tier3Hashes`, but content is narrowed — only `format: "byte-equal-text"` manifest entries (currently `.cursor/Dockerfile`) populate the map; `json` and `markered-text` entries skipped. Reader retains backward-compat parse (one minor version) for the wider pre-v2.0.0 map. **Do NOT remove the field from `BkitVersion`** — type stays required. Verify: `pnpm vitest run bkit-version.test.ts` green; `cat .agents/.bkit-version` after fresh install shows `tier3Hashes` map containing only `.cursor/Dockerfile` hash (or any byte-equal-text entries); JSON and markered files do NOT appear. Verify `bkit uninstall .cursor/Dockerfile` still runs the safe-delete branch (preserve if consumer modified) — integration test row in `bkit-modules.integration.test.ts`.

- [ ] **Task 26 — `bkit-tiers.ts` doc-block rewrite.** **HARD ORDERING — CRITICAL:** Tasks 26 and 27 BOTH touch files that Phase 1 docs Tasks 11–13 (in sub-plan A) also rewrite (`docs/architecture.md` in Task 13; `docs/testing.md` in surrounding section). Tasks 26 and 27 MUST run AFTER Tasks 11, 12, 13 are complete and merged — otherwise Task 27's `sed`/grep terminology rewrites conflict with Task 13's section rewrite. Update header to single-model semantics; delete Tier 1/2 distinction section. Verify: `grep -n "Tier [12]" .agents/scripts/bkit-tiers.ts` returns zero matches.

- [ ] **Task 27 — Terminology sweep across `docs/`.** **HARD ORDERING — CRITICAL:** must run AFTER sub-plan A Task 13 (`docs/architecture.md` rewrite) AND after any sub-plan A Tasks 11–16 doc changes have landed. Task 13's full section rewrite of `docs/architecture.md` is the canonical Phase 2/3 wording; Task 27 only sweeps residual `Tier [123]` / `tier: [123]` strings. Run `grep -rn "Tier [123]\|tier: [123]" docs/` and rewrite each match in format-aware terminology. Excluded files (retain superseded context): `docs/decisions.md` DE-5/DE-7/DE-8 entries, `docs/knowledge.md` KN-8/KN-13 entries. Update `docs/testing.md`, `docs/deployments.md`, `docs/architecture.md`, `README.md`. Verify: `pnpm lint:no-tier-terms` (added in Task 28) reports zero non-historical hits.

- [ ] **Task 28 — `lint:no-tier-terms` script.** Add to `package.json`: `"lint:no-tier-terms": "..."` per Architecture & Component Changes → Documentation → `package.json`. Wire into `pnpm turbo lint` if appropriate. Verify: script exits 0 after Task 27 sweep is complete.

### 🔒 Gate 2: Code Implementation Check (Phase 3 + cumulative)

- [ ] **Gate 2 (sub-plan C, full) — Verified:** Tasks 25–28 complete; every checkbox above checked off. `pnpm turbo lint typecheck format:check test` clean. Cumulative across sub-plans A+B+C: Phase 1 net LOC delta (path-scoped command from sub-plan A Task 7) ≥ 200 lines; Phase 2 marker dispatch refactor passes; Phase 3 cleanup green.

### Mandatory Tasks (Testing & Documentation — sub-plan C subset)

- [ ] **Verify test coverage against Phase 3 Test Matrix:** confirm each Phase 3 row has corresponding green test.
- [ ] **Write new tests:** Phase 3 schema cleanup (`bkit-version.test.ts` two rows + `bkit-tiers.test.ts` static grep + Dockerfile safe-delete re-verify).
- [ ] **Update documentation:** `docs/architecture.md` (residual sweep), `docs/testing.md`, `docs/deployments.md`, `README.md` (residual sweep), `docs/completed.md` post-merge.

### 🔒 Gate 3: Testing & Documentation Check (sub-plan C scope)

- [ ] **Docs updated (Phase 3):** every Phase 3 row in **Documentation Updates** completed; `.agents/docs.md` index unchanged.
- [ ] **Gate 3 (sub-plan C, full) — Verified.**

## Verification Plan (sub-plan C scope, plus full-suite re-run)

### Automated Tests

- [ ] **Type Check & Lint:** `pnpm turbo typecheck lint format:check` clean.
- [ ] **Unit (`bkit-version.test.ts`):** narrowed-writer test green; backward-compat reader test green.
- [ ] **Unit (`bkit-tiers.test.ts`):** static grep block — no `Tier 1`, `Tier 2`, `Tier 3` strings remain.
- [ ] **Integration (`bkit-modules.integration.test.ts`):** `.cursor/Dockerfile` safe-delete row re-verifies green after writer narrowing.
- [ ] **Phase 3 lint:** `pnpm lint:no-tier-terms` exits 0 (excluding superseded historical entries).
- [ ] **Run all tests (cumulative final):** `pnpm turbo lint typecheck format:check test`. Fix all failures before Gate 4.

### 🔒 Gate 4: Automated Verification Confirmed (sub-plan C scope, final)

- [ ] **Gate 4 (sub-plan C, final) — Verified:** all Automated Tests boxes checked. Test outputs / CLI results captured.

### Manual Verification

- [ ] **Step 3 (cumulative):** Phase 1 net code reduction confirmation: path-scoped command from sub-plan A Task 7 — confirm ≥ 200 LOC net deletion across the five Phase 1 paths. Phase 2 marker boilerplate (added in sub-plan B) is explicitly OUTSIDE this scoped diff.
- [ ] **Step 4:** Phase 3 terminology-cleanup confirmation: `pnpm lint:no-tier-terms` exits 0.

---

## Open-Question Disposition (sub-plan C scope)

| Question | Disposition | Where tracked |
| --- | --- | --- |
| Manual fixes in `app-gether-life` | **OUT-OF-SCOPE** per Plan-Phase Decision 5 — left uncommitted in consumer repo | Out-of-Scope section |

---

## Reviewer notes

> Inherited CONCERNS verdict from `plan-v3-checked.md`. Reviewers — focus on:
> - `tier3Hashes` writer narrowing safety (no regression of `bkit uninstall .cursor/Dockerfile` safe-delete).
> - Task 26/27 hard-ordering (must run AFTER sub-plan A Tasks 11–13 land).
> - `lint:no-tier-terms` Node-script vs `grep -v` choice (Node preferred per implementation guidance).
