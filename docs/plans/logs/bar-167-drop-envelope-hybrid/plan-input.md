# Plan input — BAR-167 (bar-167-drop-envelope-hybrid) — RE-RUN

## Session prompt

User invoked `/bkit-plan bar-167` for a SECOND time after the first run produced plan-v3-checked.md (verdict CONCERNS, build-ready under "Phase 1 only" scope).

Between runs, the user reviewed the plan summary and supplied four binding scope decisions via Linear comment (`Plan-Phase Clarifications`). The decisions materially expand scope:

1. **Phase scope:** Bundle Phase 1 + Phase 2 + Phase 3 into a single v2.0.0 ship. (plan-v3 had Phase 1 only with Phase 2/3 deferred — those deferrals are now reversed.)
2. **Cursor v1 spike (Task 0a):** SKIP. Trust DE-7 / current Cursor docs. Remove Task 0a entirely.
3. **Decorative `.cursor/hooks.json` echoes:** KEEP (no change vs plan-v3).
4. **Pre-push duplicate-work in `app-gether-life`:** Defer to v2.0.0 Phase 2 markers (no plan task change needed; Phase 2 marker addition to `.husky/pre-push` resolves it naturally).
5. **Manual fixes in `app-gether-life`:** Left uncommitted in consumer repo for human review. Not part of plan scope.

This re-run must produce a `plan-v1-draft.md` that:
- Bundles all of Phase 1 + Phase 2 + Phase 3 into v2.0.0.
- Carries forward all plan-v3 critical fixes (deepContains semantics, manifest reclassification, JSON-aware uninstall strip-merge via `stripTier2JsonScope`, static fixture for upgrade chain at `tests/fixtures/heavy-customised-consumer-v1-envelope/`, atomic-write pattern in migration call sites, schema-flip handling).
- Removes Task 0a (Cursor spike).
- Removes the parking-lot `docs/pending.md` entries that were Phase 2/3 deferrals (those are no longer valid).
- Anticipates that complexity-check may flip from `SINGLE` to `SPLIT` given the expanded scope; sub-plans are acceptable as long as the overall v2.0.0 cut bundles all three phases.

The current `docs/plans/drafts/bar-167-drop-envelope-hybrid-plan.md` (which is the previous plan-v3) remains in place as historical record but will be superseded by the v4 plan from this re-run.

## Issue description (BAR-167)

## TL;DR

Drop the `__bkit__` JSON envelope (introduced v0.8.0, BAR-131/142) and consolidate every template file under one ownership model: **format-aware containment** — `bkit:start..bkit:end` comment markers for text formats, deep-tree containment for JSON. The Tier 1/2/3 distinction collapses into a single mechanism with a single mental model: *"the template's bkit-owned scope must be intact in the consumer file."*

This reverses DE-7 and DE-8.

---

## 1. Debug — how this surfaced

Triggered during a routine bkit-consumer audit (app-gether-life + visitfrasercoast-com against the v1.1.1 template). Both consumers passed `pnpm bkit check` with `Done. 0 write(s).`. While reviewing the surface I'd just edited, the user inspected `.cursor/hooks.json` and asked why it contained the same hook content twice — once inside `__bkit__`, once at the top level.

Initial response defended the duplication as "two readers, two purposes" (Cursor reads top-level, `bkit check` reads `__bkit__`). The user pushed back across multiple turns. The pushback was correct. The envelope's job is bkit-CLI bookkeeping (drift detection + safe upgrade), but the value it adds is disproportionate to the in-file noise it creates.

## 2. Discussion — what the audit covered

### 2.1 Today's three ownership shapes (now reframed as one)

Reframed: **Every file has a bkit-owned scope and a consumer-owned remainder. The size of bkit's scope can be anywhere from 100% (whole file) to 0% (consumer fully owns post-seed). One model — only the scope size varies.**

### 2.2 Concrete cost the current model is paying

* **Visible duplication** in `.cursor/hooks.json` and `.claude/settings.json`.
* **Confusion** — eight conversation turns to explain `__bkit__`. Opposite of self-documenting.
* **Schema pollution** — `__bkit__` is a custom top-level key.
* **Tier-3 drift not caught** — app-gether-life's `.github/workflows/ci.yml` was heavily customised post-seed and lost the `pnpm bkit check` step. Tier-3's "advisory only" model meant this was never gated. Under a unified containment model, a small `bkit:start..bkit:end` block around `setup-auth + bkit check` would have made the gate non-removable without explicit `.bkitignore` opt-out.
* **Maintenance surface** — `bkit-tier1-defaults.ts` snapshots historical envelope shapes per shipped version. Maintenance burden grows with each version.
* **Asymmetric drift detection** — Tier-1 `canonicalHashes`, Tier-2 text marker-block extraction, Tier-2 JSON `__bkit__` hash. Three code paths, one purpose.

### 2.3 Decision

**Adopted: hybrid (markers for text + deep containment for JSON).** Replaces and supersedes DE-7 and DE-8.

**Single rule:** Every template file in `.agents/templates/` declares a **bkit-owned scope**. The consumer file must contain that scope intact. Everything outside is consumer territory.

**Format mapping:**

| Format | Bkit scope = | Drift check |
| -- | -- | -- |
| Text with `bkit:start..bkit:end` markers | Content between markers | Block byte-equal |
| Text without markers | Entire template | Whole-file byte-equal |
| JSON | Entire template's deep tree | Deep containment (template ⊆ consumer) |
| Empty scope | Nothing (consumer fully owns) | No check (advisory only) |

**Override mechanism:** `.bkitignore` (already exists, DE-6) retained as the explicit per-file / per-key opt-out.

### 2.4 One real wrinkle: JSON arrays

* `.cursor/hooks.json` — migrate template to Cursor v1 schema (`hooks: { eventName: [...commands] }`) — keyed object instead of flat array. Plain deep-object containment then works. **Per re-run Decision 2: SKIP runtime spike (Task 0a removed).** DE-7 already verified Cursor accepts both shapes.
* `.claude/settings.json` — `hooks.SessionStart` is an array of objects. Containment rule: "every element in template's array exists as a deep-equal element in consumer's array, order-insensitive."

---

## 3. Plan-Phase Clarifications (binding for plan-v4 re-run)

### Decision 1 — Phase scope: BUNDLE Phase 1 + Phase 2 + Phase 3 into v2.0.0

**Phase 1 scope to retain:** drop `__bkit__` JSON envelope, introduce `deepContains`, swap `writeTier2Json` envelope branch for `writeTier2JsonContained`, add `migrateLegacyBkitEnvelope`, reclassify `.claude/settings.json` and `.cursor/hooks.json` from manifest tier-1 to tier-2, extend `bkit-uninstall.ts` with `stripTier2JsonScope`, delete `applyBkitNamespace`/`extractBkitNamespace`/`migrateTier1JsonToTier2`/`bkit-tier1-defaults.ts`/`BKIT_TIER1_DEFAULTS_BY_VERSION`.

**Phase 2 scope to ADD into v2.0.0:**

- Add `bkit:start..bkit:end` markers around current content in: `AGENTS.md`, `CLAUDE.md`, `.cursor/rules/00-shared-rules.mdc`, `.vale/styles/House/*.yml` (4 files: Filler.yml, Hedging.yml, LLMSlop.yml, Verbose.yml), `.agents/{rules,docs,friction,skills}.md` (4 files), `docs/plans/template.md`.
- Add small marker blocks around required portions in:
  - `.github/workflows/ci.yml` — `setup-auth` step + `pnpm bkit check` step (would have caught the app-gether-life regression)
  - `.vale.ini` — `StylesPath`, `Packages`, `MinAlertLevel`, House style enable
  - `slop-scan.config.json` — bkit's required core rules
- Keep `.cursor/{settings,environment}.json`, `.cursor/Dockerfile` as advisory-only (no required portion worth gating).
- Add markers to `.husky/pre-push` (already markered today; verify the block expands or stays as-is) so the `app-gether-life` consumer's pre-push duplicate-work resolves naturally.
- Simplify `bkit-manifest.ts` to `{ path, format }` — Tier number gone; format determines scope-extraction mechanism.
- `bkit check` becomes single dispatch on format → markers extract / JSON containment / byte-equal.
- New tests: marker presence enforcement on Group-A migrations; Tier-3 drift detection regression (would `app-gether-life`'s missing `bkit check` step now be caught?).

**Phase 3 scope to ADD into v2.0.0:**

- Remove `tier3Hashes` from `.bkit-version` schema if no longer used.
- Remove "Tier 1/2/3" terminology from docs (`docs/architecture.md`, `docs/knowledge.md`, `docs/deployments.md`, etc.).
- Update `bkit-tiers.ts` doc-block to reflect single-model semantics.
- Update `docs/architecture.md` ASCII tree comments showing Tier numbers.

### Decision 2 — Cursor v1 spike (Task 0a): SKIP

DE-7 already verified Cursor's v1 keyed-object schema acceptance. No runtime spike required. The plan-v4 should proceed directly to the keyed-object migration without a runtime confirmation step. **Remove Task 0a entirely from the runbook.**

### Decision 3 — Decorative `.cursor/hooks.json` echoes: KEEP

(matches plan-v3 — no change). Drop the `__bkit__` wrapper but keep the echo statements.

### Decision 4 — Pre-push duplicate-work in `app-gether-life`: defer to v2.0.0 Phase 2 markers

(no plan-v4 task change needed beyond Phase 2 marker addition to `.husky/pre-push`).

### Decision 5 — Manual audit fixes in `app-gether-life`: LEAVE UNCOMMITTED

Two consumer-side edits left uncommitted in the consumer repo for human review. Not part of v2.0.0 plan scope.

---

## 4. plan-v3 critical fixes to carry forward into plan-v4

The previous plan-v3-checked.md addressed eight critical fixes during review/scope-check. plan-v4 must retain ALL of them:

1. **Deep-containment semantics (deepContains):** order-insensitive deep-equal for object-arrays; subset semantics for primitive arrays; null-input boundaries. Implementation target: ~60 LOC.
2. **Manifest reclassification:** `.claude/settings.json` and `.cursor/hooks.json` flipped from `tier: 1` to `tier: 2` (or under Phase 2 Tier collapse: just `format: "json"`).
3. **JSON-aware uninstall strip-merge:** new helper `stripTier2JsonScope(consumerDoc, templateDoc) → trimmedDoc`. Walks template tree, deletes matching leaves from consumer, preserves consumer-only siblings, prunes empty intermediates only where the template populated them.
4. **`bkit-uninstall.ts` extend `case 2`:** detect JSON-format files (by `.json` extension or manifest `format` field) and dispatch to `stripTier2JsonScope`.
5. **`bkit-preflight.ts` imports + advisories:** extended allow-list (`readBkitVersion`, `deepContains`, `getPkgRoot` from `bkit-paths.ts`); three new advisories: `legacy-bkit-envelope-detected` (advisory), `tier2-json-drift` (advisory, runs deepContains per Tier-2 JSON file), `pre-envelope-bkit-version-detected` (blocker; pre-v0.8.0 + no envelope → route through v1.x).
6. **Static fixture approach for upgrade chain:** Task commits `tests/fixtures/heavy-customised-consumer-v1-envelope/` (pre-v2.0.0 state with envelope + mirror + consumer keys). Used for v0.8.x → v2.0.0 leg of the regression.
7. **`bkit-modules.ts` migration call sites:** `runClaudeModule` and `runCursorModule` call `migrateLegacyBkitEnvelope(parsedDoc, parsedTemplate)` with atomic-write pattern (write to temp, rename). Logs migration on success; logs schema-flip variant if type-mismatch detected.
8. **Cursor v1 schema template migration:** `.cursor/hooks.json` rewritten from flat-array `hooks: [...]` to keyed-object `hooks: { sessionStart: [...], sessionStop: [...] }`. Resolves the array-containment ambiguity.

The detailed task breakdown of plan-v3 (24 tasks for Phase 1 alone) is at `docs/plans/drafts/bar-167-drop-envelope-hybrid-plan.md` for reference. plan-v4 should expand this with Phase 2 + Phase 3 tasks while keeping Phase 1's task structure intact.

---

## 5. Migration plan for existing consumers

On next `bkit upgrade` after v2.0.0 ships:

1. **Detect:** parse `.cursor/hooks.json` and `.claude/settings.json`; check for top-level `__bkit__` key.
2. **Strip:** remove `__bkit__` from consumer file.
3. **Verify:** run `deepContains(currentTemplate, postStripConsumerFile)`. Run deep-merge to inject template content if absent.
4. **Log:** `[bkit] migrated <file> — __bkit__ envelope stripped (v2.0.0 contract change)`.
5. **Commit:** as part of upgrade write-pass.
6. **Phase 2 markers** for `AGENTS.md`, `CLAUDE.md`, `.vale.ini`, etc. — bkit upgrade adds the marker-wrapped content; existing consumer content above/below the markers is preserved.

Pre-v2.0.0 consumers running `bkit check` against v2.0.0 will see one-time advisory `legacy-bkit-envelope-detected — run pnpm bkit upgrade to migrate to v2.0.0 ownership model`. No blocker.

---

## 6. Conversation context (for posterity)

This issue documents a real-time discovery during a consumer audit on 2026-05-09. The full conversation arc:

1. Initial audit flagged that `app-gether-life/.github/workflows/ci.yml` had lost its `pnpm bkit check` step (Tier-3 drift, not gated). Fixed manually.
2. While restoring `.cursor/hooks.json` top-level `hooks` array (also drifted from template), user questioned why the file contained duplicated content under `__bkit__` and at top level.
3. Eight-turn discussion exposed that `__bkit__` exists for bkit-CLI bookkeeping but the architecture is overweight relative to value delivered.
4. User proposed: "template should be the intended working file; compare consumer to template; no non-functional code in working files." This was the right insight.
5. Refined to: "every file has a bkit-owned scope; size can be 0% to 100%." Collapses Tier 1/2/3 into one model.
6. Evaluated four mechanism candidates; selected hybrid.
7. BAR-167 issue created.
8. First /bkit-plan run produced plan-v3-checked.md (Phase 1 only, SINGLE complexity, summary CONCERNS — build-ready).
9. Human review supplied four scope decisions via Linear comment (Phase 1+2+3 bundled, skip spike, etc.).
10. This re-run produces plan-v4 incorporating all decisions.

**Related decisions superseded:** DE-7, DE-8. Both should be marked "superseded by [BAR-167]".
**Related knowledge:** KN-8 (Tier-2 deep-merge canonical) — supersede with new KN entry once v2.0.0 ships.

**Manual fixes applied during the audit (not part of v2.0.0 plan):**
- `app-gether-life/.github/workflows/ci.yml` — added `Run Bkit Check` step
- `app-gether-life/.cursor/hooks.json` — restored top-level `hooks` array

---

## 7. Linear comments at re-run start

### Comment 1 (older) — Plan Workflow log from first /bkit-plan run

The first run produced plan-v3-checked.md with summary verdict CONCERNS, complexity SINGLE, build-ready under Phase 1 scope. Full verdict trail and 24-task runbook captured in `docs/plans/drafts/bar-167-drop-envelope-hybrid-plan.md` (still on disk as historical reference).

### Comment 2 (newer) — Plan-Phase Clarifications

The four binding scope decisions for plan-v4 (see Section 3 above).

### Comment 3 (newest) — Plan Workflow (re-run) Step 1

This run's start-workflow header. Same comment will accumulate Step 2..11 sections as the re-run proceeds.

---

## Parent design

(none — standalone plan)
