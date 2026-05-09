Verdict: CONCERNS
Failures: 0
<!-- verdict:end -->

# Plan Review (Reviewer 1 — tightness & scope discipline)

> Scope: file-path / symbol accuracy spot-checked against `bkit-tiers.ts`, `bkit-modules.ts`, `bkit-install.ts`, `bkit-preflight.ts`, `bkit-version.ts`, `bkit-tier1-defaults.ts`, `bkit-manifest.ts`, the heavy-customised consumer fixture, and the current Tier-2 templates. Cross-checked against `plan-input.md` §4–§7 and the existing `bkit-modules.upgrade.integration.test.ts`.

## CRITICAL

1. **Two-version upgrade chain "v0.7.x → v0.8.0 → v2.0.0" is under-specified relative to the existing fixture.**
   - **Acceptance Scenario → Success Criteria #4** and **Derived Test Matrix** both promise this chain. The existing fixture (`tests/fixtures/heavy-customised-consumer/`) was built for the v0.5.0 → v0.8.0 transition (see `bkit-modules.upgrade.integration.test.ts` line 22, 49–53; `migrateTier1JsonToTier2(... , "0.5.0")` at line 69). It has **no v0.8.0-shape variant** (i.e. with `__bkit__` envelope already present + top-level mirror) and **no v0.7.x variant** distinct from v0.5.x.
   - **Plan-input §5** is explicit: the migration target is "consumer JSON has `__bkit__` key — strip it." That's the v0.8.0–v1.1.1 → v2.0.0 hop. The v0.7.x → v0.8.0 hop is *already shipped* and is handled by the (now-deleted) `migrateTier1JsonToTier2`. Once `migrateTier1JsonToTier2` is deleted, **the v0.7.x → v0.8.0 transition no longer has a code path in v2.0.0**, so it cannot be verified in a v2.0.0 unit/integration test by replaying the chain. The chain test as written will require either (a) keeping the v0.7.x → v0.8.0 logic alive, contradicting the deletion list, or (b) generating the v0.8.0-envelope state in the test fixture as a starting point and only exercising the strip step.
   - **Action required:** The plan must either (i) drop the "v0.7.x → v0.8.0 → v2.0.0" framing and replace it with "v1.1.1 (envelope on disk) → v2.0.0", or (ii) explicitly add a fixture variant `tests/fixtures/heavy-customised-consumer-v0_8_0-envelope/` that captures the post-v0.8.0 on-disk shape (envelope + duplicated top-level mirror + consumer additions). Either way the plan must say which path. As written, Task 9 is ambiguous about where the v0.7.x state comes from when the v0.7.x → v0.8.0 migrator is gone.

2. **Pre-v0.5.0 / pre-Tier-1 consumers have no migration path under the plan.**
   - The plan deletes `bkit-tier1-defaults.ts` whose sole reason for existing was to migrate v0.5.x–v0.7.x Tier-1 shapes into envelopes. Plan §Code Deletions justifies the deletion as "the on-disk top-level mirror is already correct because v0.8.0–v1.1.1 always shipped the duplicate." That is true **only** for consumers who already passed through a v0.8.0+ install. A consumer who installs v2.0.0 as their first upgrade since v0.7.x has a Tier-1 shape with no envelope and **no top-level mirror that came from v0.8.0** — they have only their v0.5.x–v0.7.x bkit-shipped keys plus their own additions.
   - Under the plan: `migrateLegacyBkitEnvelope` returns `{ stripped: false, deepMerged: false }` (no `__bkit__` to strip). Then `writeTier2JsonContained` runs `deepContains(template, existing)`; since the v2.0.0 template's keyed-object `hooks: { sessionStart, sessionStop }` does NOT match a v0.5.x flat-array `hooks: [...]`, `ok=false` → it deep-merges. Deep-merging keyed-object `hooks` over a flat-array `hooks` is **a type-flip**, not a merge — `deepMergeJson` will overwrite the consumer's flat array with the template's keyed object, **losing any consumer-added hook elements** that were added at the array level.
   - **Action required:** Either (a) add an explicit pre-strip migration step that detects flat-array `hooks` in `.cursor/hooks.json` and lifts surviving consumer entries into `hooks.sessionStart` / `hooks.sessionStop` by event tag, OR (b) document v0.5.x–v0.7.x → v2.0.0 as a non-supported direct upgrade path (consumer must first upgrade through a v1.x release), and add an Edge-Case row that asserts a preflight blocker on this state. Currently Edge Cases line 91 mentions the inverse case (consumer has Tier-1 shape) only as "first `bkit upgrade` deep-merges template → file restored to a containing state" — that glosses over the schema-flip data-loss risk.

3. **`writeTier2JsonContained` deep-merge semantics are under-specified for the `.cursor/hooks.json` shape change.**
   - The plan rewrites `.cursor/hooks.json` template from `hooks: [{event, command}, ...]` (current on disk per `.agents/templates/.cursor/hooks.json` lines 14–23) to `hooks: { sessionStart: [...], sessionStop: [...] }` (Cursor v1 schema). For a v1.1.1 consumer whose on-disk file has both the `__bkit__` envelope and a top-level `hooks: [...]` flat array, `migrateLegacyBkitEnvelope` strips `__bkit__`, leaving `hooks: [...]` (flat array). Then `deepContains(templateKeyedObject, existingFlatArray)` returns `ok=false`. Deep-merge of `{hooks: {sessionStart: [...]}}` over `{hooks: [...]}` either (a) crashes if `deepMergeJson` insists on type-equality, (b) overwrites the array with the object (consumer hook entries lost silently), or (c) produces a malformed mixed-shape file.
   - The plan does not specify which behaviour `deepMergeJson` (existing function at `bkit-tiers.ts:33`) implements when the two values are different JSON kinds at the same path, nor does it add a new test row for "type-flip at template root path."
   - **Action required:** Add an Edge-Case row + Derived-Test-Matrix row covering the schema-flip: pre-v2.0.0 `hooks: [...]` (flat array) → post-strip → deep-merge → expected outcome (proposed: drop the flat-array `hooks` entirely, since it was a duplicate of the envelope contents which is the schema-clean keyed-object). State the expected behaviour explicitly in P1.T2 (`writeTier2JsonContained`) so it isn't implementation-defined.

## OPTIONAL

1. **Phase boundary cleanly deferrable — confirmed.** Phase 2 (markers in text Tier-1/3 files) and Phase 3 (terminology cleanup, `tier3Hashes` retire) are genuinely independent. Phase 1 ships a coherent v2.0.0 alone. Good scope discipline. Suggest reinforcing this by removing the inline Phase 2/3 detail blocks (lines 499–524 of the plan) and pointing to a separate `BAR-167-phase-2.md` / `BAR-167-phase-3.md` issue stub — keeping them in this plan invites scope creep at execution time.

2. **`bkit-install.ts` "no structural changes required" claim is correct but the line references are stale.** Plan §`[MODIFY] .agents/scripts/bkit-install.ts` cites `postDispatch` at "≈ line 896" and "canonical-hash recording at ≈ line 803". Verified: `postDispatch` allocated at line 896, but the canonical-hash call is `updateCanonicalHashesAfterUpgrade` at line 808 (the comment block at line 803). Tighten the citation or drop the line numbers — they will rot.

3. **`writeTier2JsonContained` rename — optional but recommended scope tightening.** Plan §Naming says `writeTier2Json` → `writeTier2JsonContained`. Since Phase 3 explicitly retires "Tier 1/2/3" terminology, baking "Tier2" into a new symbol that lives across Phase 2 and Phase 3 is friction. Consider `writeJsonContained` or `writeContainedJson` to avoid a forced second rename in Phase 3. Same applies to `migrateLegacyBkitEnvelope` (acceptable name but `Tier-1`/`Tier-2` hint absent — fine).

4. **Idempotency test for `migrateLegacyBkitEnvelope` lacks a re-run-on-already-stripped-file assertion in the runbook.** Edge Cases row (line 86) covers the "no `__bkit__` → returns `{ stripped: false, deepMerged: false }`" case, and Derived Test Matrix has "idempotent no-op when envelope absent." Good. But the runbook Task 3 verification doesn't explicitly call out `pnpm vitest run bkit-tiers.test.ts -t "migrateLegacyBkitEnvelope idempotent"` — add an explicit `-t` filter to the verification step so the gate cannot pass without the idempotency case being green.

5. **Rollback section glosses over a real risk.** §Rollback claims `git revert` restores `__bkit__` templates and "next `bkit install` re-writes the envelope on top via the rolled-back `writeTier2Json` deep-merge." After v2.0.0 strips `__bkit__` from a consumer file, the post-revert `writeTier2Json` (with its `__bkit__`-required guard) will produce `{ ...existingStripped, __bkit__: template.__bkit__ }` — fine, but the existing top-level `hooks` array (legacy mirror) is gone if v2.0.0 stripped it during normalisation. Result: `__bkit__` re-appears but without the duplicate top-level mirror, leaving the file in a state that **only the post-v0.8.0 envelope readers** can see. Cursor (which reads top-level only) would then have no hooks. Document this as the actual risk window or assert that v2.0.0 `migrateLegacyBkitEnvelope` does NOT delete the top-level `hooks` keys (it only strips `__bkit__`).

6. **`legacy-bkit-envelope-detected` advisory severity choice.** Plan §`[MODIFY] bkit-preflight.ts` marks the advisory as "advisory" not "blocker." Reasonable. But the advisory must trigger only when **`canonicalHashes` indicates the file was last written under a pre-v2.0.0 bkit** AND a top-level `__bkit__` is present. The plan says both conditions are required (good) but doesn't specify what happens for a fresh v2.0.0 install where a consumer manually adds a `__bkit__` key for their own purposes (Edge Cases line 94 says "out-of-scope" but still merits an explicit "advisory does not fire when no pre-v2.0.0 canonicalHashes record exists" assertion).

7. **Net LOC ≥ 200 deletion target — measurable but the gate (Task 7 verification) uses `git diff --stat dev..HEAD -- '.agents/scripts/'` which excludes `.agents/templates/` deletions.** If template byte-count is meaningful (e.g. dropping 24-line `hooks.json` envelope), include both `.agents/scripts/` and `.agents/templates/` in the gate command, or move the assertion to the broader `git diff --stat` summary.

## OUT OF SCOPE

1. **Tightening `BkitVersion` schema.** Plan §`[MODIFY] bkit-version.ts` correctly defers the schema change to Phase 3 and confirms `BkitVersion = { pinnedVersion, tier3Hashes, canonicalHashes }` — verified at `bkit-version.ts:37–67`. No action.

2. **`.cursor/hooks.json` decorative-echoes drop.** Plan §Out of Scope correctly defers to `docs/pending.md`. Good.

3. **Phase 2 marker extension across Tier-1 / Tier-3 files.** Plan correctly defers to v2.0.x patch; ship-decision contingent on complexity-check. Good.

4. **`bkit upgrade --prune`.** Plan correctly defers. Good.

5. **`ci.yml` heavy-customisation marker survival fixture.** Plan correctly defers to Phase 2. Good.

6. **Consumer-repo migrations (app-gether-life, visitfrasercoast-com).** Plan correctly scopes these as out-of-bkit-repo. Manual Verification Steps 1–2 cover the smoke-test path without committing to the consumer repo from this plan — clean.

---

### Summary

The plan is structurally sound and admirably tight: Phase 1 ships a coherent v2.0.0; Phases 2–3 are cleanly deferrable; deletions are matched 1:1 with replacements; new code surface is minimal (`deepContains` + rename + one migration helper); test matrix maps every Acceptance Scenario success criterion. Good scope discipline.

The three CRITICAL items all sit at one fault line: the **migration realism for consumers landing on v2.0.0 from anywhere earlier than v0.8.0** is treated as "deep-merge will sort it out" without acknowledging that the `.cursor/hooks.json` template is simultaneously changing its **JSON shape** (flat-array → keyed-object), turning what would otherwise be a benign deep-merge into a type-flip with silent-data-loss potential. Either tighten the migration scope to "v0.8.0–v1.1.1 → v2.0.0 only" with an explicit preflight-blocker for older states, or expand the migration helper to handle the schema flip explicitly. As-is, Success Criterion #4 ("v0.7.x → v0.8.0 → v2.0.0 byte-identical") is technically not exercisable once `migrateTier1JsonToTier2` is deleted in the same PR.

`PASS` would be merited after addressing CRITICAL #1 and CRITICAL #2; CRITICAL #3 can be folded into the same scoping decision.
