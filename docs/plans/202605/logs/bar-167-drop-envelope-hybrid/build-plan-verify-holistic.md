Verdict: PASS
Failures: 0

<!-- verdict:end -->

# Plan Verification

## Scope

Holistic (master + 3 sub-plans).

## Sub-Plans Verified

3 — sub-plan A (Phase 1, plan-1.md), sub-plan B (Phase 2, plan-2.md), sub-plan C (Phase 3, plan-3.md). Count matches `docs/plans/active/bar-167-drop-envelope-hybrid-plan-*.md` glob.

## Integration Gaps

0 — no cross-sub-plan integration issues found.

## Previously Attempted

- Sub-plan A: build-plan-verify-1-1 (FAIL, 12 gaps) → gaps-remediate-1-1 (PASS) → verify-1-2 (PASS).
- Sub-plan B: build-plan-verify-2-1 (CONCERNS, 7 gaps) → gaps-remediate-2-1 (PASS) → verify-2-2 (PASS).
- Sub-plan C: build-plan-verify-3-1 (PASS, first attempt, 0 gaps).
- No prior holistic verification.

## Notes

Partial diff coverage — full diff (12,768 lines) exceeded 10,000 threshold; review used per-file budget mode (head -500 per file, top-20 files). Findings drawn from targeted greps across source/templates/docs to confirm cross-sub-plan invariants.

### 1. Cross-sub-plan integration

- **Manifest dispatch (sub-plan B Task 19) ↔ uninstall (sub-plan A Task 4b):** `bkit-uninstall.ts:219` runs `switch (entry.format)` with three cases (`json` → strip-block via stripTier2JsonScope; `markered-text` → detectMarkerStyle strip; `byte-equal-text` → shouldDeleteTier3 + hash compare). Phase-1 dormant code path is now live.
- **Drift advisory (sub-plan B Task 21) ↔ marker insertion (sub-plan B Task 17/18):** `detectTier2TextDrift` defined at `bkit-preflight.ts:433`; advisory id `tier2-text-drift`; consumed by `.agents/scripts/bkit-modules.upgrade.integration.test.ts:288/336` (heavy-customised ci.yml fixture, sub-plan A Task 0e). Indented-marker boundary documented in `docs/pending.md` (known limitation; sub-plan B verify-2-2).
- **JSON containment (sub-plan A Task 1) ↔ slop-scan deep-containment (sub-plan B Task 18b):** `slop-scan.config.json` is `format: "json"` in manifest (bkit-manifest.ts:82) — dispatches to deepContains. `bkit-templates.test.ts` enforces 10 required rule keys.
- **Writer narrowing (sub-plan C Task 25) ↔ Dockerfile safe-delete (sub-plan A Task 10):** `.cursor/Dockerfile` is `format: "byte-equal-text"` in manifest (bkit-manifest.ts:63); writer in `bkit-modules.ts` filters tier3Hashes emission via `getInstallManifest().filter(e => e.format === "byte-equal-text")`. `shouldDeleteTier3` byte-equal-text branch (bkit-uninstall.ts:261) preserved.
- **Doc-block sweep (sub-plan C Task 26) ↔ Phase 1 architecture rewrite (sub-plan A Task 13):** Task 27 sweep landed AFTER Task 13 rewrite per hard-ordering invariant. `docs/architecture.md` zero `Tier [123]` matches.
- **DE-18/KN-17 cross-supersession:** DE-7/DE-8 superseded by DE-18 (renumbered from DE-16 due to BAR-155 collision); KN-8 superseded by KN-17. Both directions linked. Plan-letter deviation documented in verify-1-2 notes; consistent across docs.

### 2. Orphaned reference scan

Greps for deleted symbols (`__bkit__`, `applyBkitNamespace`, `extractBkitNamespace`, `migrateTier1JsonToTier2`, `writeTier2Json` non-Contained, `bkit-tier1-defaults`, `BKIT_TIER1_DEFAULTS_BY_VERSION`):

- `__bkit__` in `.agents/scripts/`: only inside (a) `bkit-preflight.ts` advisory detection logic (intentional — fires on legacy consumers); (b) `migrateLegacyBkitEnvelope` strip helper (intentional); (c) test files asserting absence after migration; (d) `bkit-tiers.test.ts` `cursor-v1-schema` assertion that template lacks `__bkit__`.
- `applyBkitNamespace` / `extractBkitNamespace`: zero remaining call-sites; surfaces only in comments documenting deletion (`bkit-modules.test.ts:201` header, `bkit-modules.integration.test.ts:707/711`).
- `migrateTier1JsonToTier2`: zero remaining call-sites; surfaces only in deletion-documenting comments.
- `writeTier2Json` (bare): zero remaining call-sites; `bkit-tiers.ts:189` comment notes the rename to `writeTier2JsonContained`.
- `bkit-tier1-defaults`: zero references in `.agents/scripts/` (file deleted per sub-plan A Task 7). Stale `dist/bkit-tier1-defaults.js` build artefact remains — generated, not source; expected to disappear on next `pnpm build`.
- `tier: [123]` integer field in `.agents/scripts/`: zero matches. Replaced by `format: "json|markered-text|byte-equal-text"` (22 occurrences in `bkit-manifest.ts` across all 6 modules).
- Templates: zero `__bkit__` files; `.cursor/hooks.json` template confirmed as Cursor v1 keyed-object (version: 1, hooks.sessionStart/sessionStop arrays).
- Marker presence: 39 template files contain `bkit:start` (covers all Group A + Group B + previously-markered files).

### 3. Terminology consistency

`grep -E "Tier [123]" docs/`:

- Live docs (`docs/architecture.md`, `docs/testing.md`, `docs/deployments.md`, `docs/knowledge.md`, `docs/decisions.md`, `README.md`): zero matches (after sub-plan C Task 27 sweep).
- `docs/completed.md:40`: excluded per plan (`FILE_EXCLUSIONS` in lint-no-tier-terms.ts).
- `docs/plans/active/bar-167-*`: the plans themselves (self-referential; not subject to sweep).
- `docs/plans/logs/`, `docs/plans/completed/`: excluded per plan (immutable historical artefacts; `EXCLUDE_DIR_PREFIXES` skips `docs/plans/`).
- DE-5/DE-7/DE-8 sections in `docs/decisions.md` and KN-8/KN-13 sections in `docs/knowledge.md`: excluded per plan via `SECTION_EXCLUSIONS` in lint-no-tier-terms.ts.

### 4. Schema consistency

- `bkit-manifest.ts` `ManifestEntry`: `{ path, format: "json"|"markered-text"|"byte-equal-text", module, packageJsonKeys? }`. No `tier` integer field.
- `.bkit-version` writer (`bkit-modules.ts:359-431` per verify-3-1): emits `tier3Hashes` only for entries where `manifest.format === "byte-equal-text"`. Reader retains backward-compat parse (defaults to `{}` if absent).
- Type contract: `BkitVersion.tier3Hashes` remains `Record<string, string>` non-optional; `shouldDeleteTier3` byte-equal-text branch (`bkit-uninstall.ts:261`) consumes it unchanged. No regression in uninstall safety for `.cursor/Dockerfile`.

### 5. Test coverage holistic

Full acceptance-scenario E2E coverage spans:

- Phase 1 JSON primitives: `bkit-tiers.test.ts` (deepContains x8, writeTier2JsonContained, migrateLegacyBkitEnvelope x4, cursor-v1-schema), `bkit-uninstall.test.ts` (stripTier2JsonScope), `bkit-modules.upgrade.integration.test.ts` (v0.5.x → v0.8.x → v2.0.0 chain, heavy-customised consumer, idempotency), `bkit-modules.integration.test.ts` (envelope advisory, drift advisory, pre-envelope blocker, Dockerfile safe-delete).
- Phase 2 markers + dispatch: `bkit-templates.test.ts` (NEW — marker presence Group A+B, slop-scan deep-containment), `bkit-modules.test.ts:218` (single-dispatch on entry.format), `bkit-modules.integration.test.ts` (Tier-3 drift regression for ci.yml, .husky/pre-push fixture survival via Task-0d), `bkit-modules.upgrade.integration.test.ts:289-345` (heavy-customised ci.yml fixture via Task-0e — both outside-marker survival and inside-marker drift detection rows; indented-marker limitation documented).
- Phase 3 cleanup: `bkit-version.test.ts:226-263` (reader default, narrowed writer, shouldDeleteTier3 unchanged), `bkit-tiers.test.ts:919-928` (static grep regression test for `/Tier [123]/g`), `bkit-modules.integration.test.ts` Dockerfile safe-delete re-verified after writer narrowing.

Cross-sub-plan acceptance criteria from parent plan: (1) zero-drift on clean v2.0.0 install — JSON + markered-text + byte-equal-text all covered; (2) `__bkit__` removed, Cursor v1 schema, consumer keys preserved across upgrade chain — sub-plan A green; (3) markers + Tier-3 drift regression — sub-plan B green; (4) `Tier [123]` removed from docs, `format` field, doc-block rewritten, `lint:no-tier-terms` exits 0 — sub-plan C green.

### Manual verification (out-of-scope of this verify)

Acceptance criteria for clean consumer-side `pnpm bkit install + pnpm bkit check` zero-drift (sub-plan A Manual Step 1/2, sub-plan B Manual Step 1/2, sub-plan C Manual Step 3/4) remain `[ ]` — these are ship-phase smoke tests against `app-gether-life` / `visitfrasercoast-com` consumer repos and are not executable in this worktree.

Gate 2/3/4 sub-plan A checkboxes (plan-1.md lines 411, 422, 442) and sub-plan C Gate 2/3/4 checkboxes (plan-3.md lines 243, 253, 267) remain `[ ]` — these are agent-tick gates that close-build/ship workflows handle; underlying tasks all verified.

## Identified Gaps Log

None.
