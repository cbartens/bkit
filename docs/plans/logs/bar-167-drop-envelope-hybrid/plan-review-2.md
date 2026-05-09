Verdict: CONCERNS
Failures: 0

<!-- verdict:end -->

# Plan Review

## CRITICAL

### C1 — `bkit-manifest.ts` tier annotations will be wrong post-v2.0.0 and will corrupt `bkit uninstall`

Source file confirmed: `bkit-manifest.ts` (lines 49–65) lists `.claude/settings.json` as `tier: 1` and `.cursor/hooks.json` as `tier: 1`. The plan reclassifies both files from Tier-2 JSON (envelope) to Tier-2 deep-containment JSON semantics, yet the manifest entry tier integers are not listed anywhere in the Architecture & Component Changes or Runbook as needing update. `bkit-uninstall.ts` (line 156–165) branches on `entry.tier`: `case 1` → unconditionally deletes. If the manifest still reads `tier: 1` after v2.0.0, `bkit uninstall --claude` will delete `.claude/settings.json` in its entirety instead of strip-merging the template scope out, destroying consumer-added keys (`hooks.Stop`, `failClosed`, etc.). The plan must add a task to update CLAUDE_MANIFEST and CURSOR_MANIFEST entries to `tier: 2`, and add a `bkit-uninstall` test that verifies consumer keys survive uninstall of the updated manifest.

Note: the `CLAUDE_MANIFEST` comment at line 50 already says `tier: 1` for `settings.json` — this was the pre-v0.8.0 classification that was never updated when the file was reclassified to Tier-2 in v0.8.0. The plan is introducing `writeTier2JsonContained` which is a Tier-2 mechanic; the manifest must match or the uninstall path is broken.

### C2 — `bkit check` (read-only verb) JSON drift detection path is not specified for the new deep-containment world

The plan (Architecture & Component Changes, `bkit-preflight.ts`) only adds the `legacy-bkit-envelope-detected` advisory. However, `bkit check` also needs to perform `deepContains(template, consumerFile)` to detect drift — the equivalent of what `extractBkitNamespace + hash` did for Tier-2 JSON under v0.8.0. Nowhere in the plan is the `bkit check` → `deepContains` dispatch described. The current `bkit-preflight.ts` has no Tier-2 JSON drift-check logic (confirmed by reading the file — it only checks file markers via `hasBkitMarkers`). The `bkit check` verb must call `deepContains` and emit a drift advisory (distinct from `legacy-bkit-envelope-detected`) when the consumer file is missing template paths. Without this, `bkit check` exits 0 even when the consumer has drifted away from the template — the primary stated failure mode that motivated this entire redesign. The Derived Test Matrix (plan-v1-draft.md line 114) adds only the `legacy-bkit-envelope-detected` test; no test row covers "bkit check reports drift when consumer file is missing a template key".

### C3 — Two-version upgrade-chain fixture covers Tier-1 → Tier-2 (v0.5.x → v0.8.x) but not the actual v0.8.x → v2.0.0 chain mandated by the Success Criteria

The existing `bkit-modules.upgrade.integration.test.ts` (lines 1–8, 48) tests `Tier-1 (v0.5.x) → Tier-2 (v0.8.x)` — that is the existing scenario. The plan's Success Criterion 4 and Acceptance Scenario step (plan-v1-draft.md lines 63–64) require a `v0.7.x → v0.8.0 → v2.0.0` chain specifically testing that the **envelope migration** (`migrateLegacyBkitEnvelope`) preserves `hooks.Stop`, `failClosed`, `loop_limit` byte-identical. The plan's Runbook Task 9 (line 440) says "ADD the three new tests" but the current fixture at `tests/fixtures/heavy-customised-consumer/cursor-hooks.json` was written for the Tier-1 → Tier-2 scenario (confirmed by file path cross-reference). The plan does not say whether this existing fixture will be reused or whether a new `__bkit__`-envelope fixture (simulating a v0.8.x–v1.1.1 on-disk state) will be created. A build agent cannot execute Task 9 without knowing which fixtures to create. The plan must name the fixture files explicitly (e.g. `.agents/scripts/__fixtures__/v1-envelope-consumer/`) and specify their structure.

### C4 — `migrateLegacyBkitEnvelope` template path resolution is unspecified — `getPkgRoot()` usage in migration context is potentially incorrect

The plan (Architecture & Component Changes, `bkit-tiers.ts` ADD block, line 312) states `migrateLegacyBkitEnvelope` should "load template from `getPkgRoot()`-resolved path". However, `getPkgRoot()` is defined in `bkit-modules.ts` (line 90–95), not `bkit-tiers.ts`. The plan moves `migrateLegacyBkitEnvelope` into `bkit-tiers.ts` but imports of `getPkgRoot` from `bkit-modules` would create a circular dependency (`bkit-tiers.ts` is already imported by `bkit-modules.ts`). The plan does not address this: either `getPkgRoot` must be extracted to a shared helper (e.g. `bkit-paths.ts`), or the template path must be passed as a parameter into `migrateLegacyBkitEnvelope`. A build agent hitting this circular import will fail Task 3 with no recovery path described in the plan.

### C5 — `bkit-preflight.ts` `legacy-bkit-envelope-detected` advisory requires reading the template to know which files to check, but `bkit-preflight.ts` has no pkg-root access

Confirmed by reading `bkit-preflight.ts`: it imports only `node:fs`, `node:path`, and `bkit-cli.js`. It has no `getPkgRoot()` or template-path resolution. The `legacy-bkit-envelope-detected` advisory (plan Task 6) needs to check whether `.cursor/hooks.json` and `.claude/settings.json` contain `__bkit__` at top level. Checking for the key in those consumer-file paths is straightforward, but the plan also says (line 343) the advisory fires "when the recorded `canonicalHashes` indicates the file was last written under a pre-v2.0.0 bkit". Reading `canonicalHashes` requires `readBkitVersion` from `bkit-version.ts`. The plan does not show the import changes required in `bkit-preflight.ts`, and does not specify whether the advisory is triggered by (a) presence of `__bkit__` key alone or (b) `__bkit__` key + version-check. If (b), the plan must add `readBkitVersion` to the import list for `bkit-preflight.ts` — the no-circular constraint (line 2 of `bkit-preflight.ts`: "No imports from bkit-modules.ts") needs to be confirmed still satisfied.

### C6 — `bkit check` drift detection for `deepContains` has no defined `bkit-preflight.ts` call site or advisory ID, making Task 6 unexecutable

This is related to C2 but distinct: even if C2 is resolved by design, the plan does not define where `deepContains` is called from during `bkit check`. The `bkit check` verb dispatches through preflight → module checks → post-preflight report. The current architecture for Tier-2 JSON drift detection (using `extractBkitNamespace + hash`) lives in `runClaudeModule` / `runCursorModule` (confirmed at lines 467–493 and 557–580 of `bkit-modules.ts`). The plan replaces those calls but only for the write path. For the read-only `check` path, neither the plan's Architecture section nor the Runbook specifies where `deepContains` is invoked, what advisory ID is emitted, or what file handles it. A build agent executing Task 6 (Preflight advisory) will not know whether to add the drift-check there or leave it in the module functions. This is a build-blocking ambiguity.

---

## OPTIONAL

### O1 — `deepContains` mixed-array semantics (primitives + objects in the same array) are underdefined for the test matrix

The plan (line 303) specifies mixed arrays use "element-wise per element type; `missing` reports element index path." The Derived Test Matrix (lines 103–115) has rows for array-of-primitives and array-of-objects separately, but no row for a mixed array. The `.claude/settings.json` `hooks.SessionStart` is an array of objects — if the implementation silently coerces mixed arrays to the object path, it may miss string-element drift. Consider adding one explicit mixed-array test row if the implementation claims to handle it.

### O2 — `writeTier2JsonContained` deep-merge direction is inverted relative to consumer-wins semantics

The plan (line 306) states: "if `ok=false` → deep-merge template into existing via existing `deepMergeJson`, write result." Inspecting the actual `deepMergeJson` implementation (lines 33–59 of `bkit-tiers.ts`): the signature is `deepMergeJson(base, override)` where `override` wins at leaf level. If the call is `deepMergeJson(existing, template)` then template wins — correct for bkit enforcement. If reversed `deepMergeJson(template, existing)`, consumer wins and bkit scope is not enforced. The plan says "deep-merge template into existing" which is ambiguous about argument order. The plan should specify the argument order explicitly (e.g. `deepMergeJson(consumerDoc, template)` — template as override) to avoid the build agent inverting it.

### O3 — Rollback section describes post-revert behaviour as "envelope re-applied via deep-merge" but does not account for the renamed function

The Rollback Strategy (plan lines 410–415) says "next `bkit install` re-writes the envelope on top via the rolled-back `writeTier2Json` deep-merge." But `writeTier2Json` will be renamed to `writeTier2JsonContained` in Task 2, and the original `writeTier2Json` is deleted. A `git revert` on the squash commit restores the old name. The description is self-consistent only for a revert of the entire squash commit — which is the correct mechanism — but the wording "rolled-back `writeTier2Json`" may confuse a build agent that tries to call it before the revert is confirmed. Low risk, but worth clarifying.

### O4 — Task 0c references "BAR-131 sub-plan-2 heavy-customised consumer fixture" but the actual fixture lives at `tests/fixtures/heavy-customised-consumer/` — inconsistent path description

Task 0c (plan line 425) says "if missing, create one under `.agents/scripts/__fixtures__/heavy-customised-consumer-v0_7_x/`". The fixture already exists at `tests/fixtures/heavy-customised-consumer/` (confirmed via glob). The plan references two different fixture paths — the integration test file (line 22) uses `path.resolve(__dirname, "../../tests/fixtures/heavy-customised-consumer")`. Task 0c describes a different (non-existent) path. A build agent following Task 0c exactly will create a second redundant fixture directory. The plan should acknowledge the existing fixture at `tests/fixtures/heavy-customised-consumer/` and distinguish it from any new `__bkit__`-envelope fixture needed for v2.0.0 tests.

### O5 — `deepContains` return type `{ ok, missing, mismatched }` is not symmetric for all `null` inputs

The plan specifies `deepContains(template: JsonValue, consumer: JsonValue)`. If template is `null` and consumer is `null`, the semantics are clear (ok=true). But if template is `null` and consumer is a non-null object — or template is a non-null object and consumer is `null` — the plan does not specify what `missing` / `mismatched` paths look like (the pathPrefix would be the root). This is a minor boundary case worth covering in one test row.

### O6 — Version bump to v2.0.0 is assumed but no task updates `package.json` `"version"` field

The plan specifies CHANGELOG.md, DE-16, KN-9, README, and `docs/pending.md` updates, but no Runbook task is assigned to bump the `version` field in `package.json` from `1.1.1` to `2.0.0`. Without this bump, `npm publish` / `pnpm publish` will not produce a v2.0.0 artifact. The bkit CI publish gate presumably reads `package.json` version. Add a task or note that the version bump is handled separately by the ship workflow.

### O7 — `bkit doctor` (integration test at `bkit-doctor.integration.test.ts`) is not mentioned in the plan

Confirmed: `bkit-doctor.integration.test.ts` exists and tests the `doctor` verb. The plan's Architecture & Component Changes makes no mention of `bkit doctor`. The `doctor` verb presumably runs the same read-only preflight suite as `bkit check`. If `deepContains` drift is added to preflight (C2 resolution), `bkit doctor` will inherit it automatically — but if the drift check is added only inside module functions (C6 ambiguity), `bkit doctor` may not see it. This should be clarified so the `bkit-doctor.integration.test.ts` does not regress silently.

### O8 — `.agents/docs.md` Workflow Matrix says `docs/plans/template.md` is always read for Plan workflow — the Supersession Inventory does not note `docs/pending.md` as a target, even though the plan appends to it

The plan's Documentation Updates table includes `docs/pending.md` (line 396) but that file is not listed in the Supersession Inventory. This is not a blocking gap (it's an append-only log, not a superseded artifact) but the inconsistency may confuse a build agent executing Task 16 if it checks the supersession table for confirmation. Acceptable as-is; noting for completeness.

---

## OUT OF SCOPE

### OOS1 — Phase 2 and Phase 3 complexity-check trigger is not defined

The plan (line 501) says "if `plan-complexity-check.md` reports Phase 1 ≤ medium, bundle Phase 2." No such file exists yet and no task creates it. The bundling decision is therefore non-executable without external orchestrator action. This is a correct deferral — just flag that the trigger is human-decision-gated, not agent-automatable, so the build agent should not attempt to evaluate it.

### OOS2 — `bkit upgrade --prune` flag and `bkit uninstall` post-v2.0.0 orphan handling

The plan correctly defers `bkit upgrade --prune`. The stale-orphan scenario (accepted trade-off) and `bkit uninstall` not looking for `__bkit__` post-v2.0.0 are both correctly handled by the manifest tier fix (C1 covers uninstall) and the containment model (no `__bkit__` key to look for). These are out of scope for v2.0.0.
