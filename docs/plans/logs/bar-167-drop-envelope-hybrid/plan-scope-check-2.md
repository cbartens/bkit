Verdict: CONCERNS
Failures: 0

<!-- verdict:end -->

# Plan Scope Check

## CRITICAL

### C-SC2-1 — `bkit-uninstall.ts` `case 2` is text-marker-only; JSON files will silently "preserve" instead of strip-merging

**Evidence (current code):** `bkit-uninstall.ts` lines 166–184. The `case 2` branch calls `detectMarkerStyle(content)` which matches `<!-- bkit:start -->` and `# bkit:start` text patterns only (lines 94–97). For `.claude/settings.json` and `.cursor/hooks.json` (JSON files), `detectMarkerStyle` returns `null`, and the decision is `"preserve"` ("Tier-2 but no bkit markers found — 100% consumer content"). After the manifest reclassification from `tier: 1` → `tier: 2` (Task 4a), `bkit uninstall --claude` and `bkit uninstall --cursor` will silently preserve the entire file rather than strip-merging template scope out. Consumer-added keys survive, but so does bkit-owned content — the uninstall leaves a zombie bkit footprint.

**What is missing:**

- No `[MODIFY] .agents/scripts/bkit-uninstall.ts` entry in Architecture & Component Changes. The only mention of the required rewrite is a one-line note inside the `bkit-manifest.ts` section ("Companion change in `bkit-uninstall.ts`") with no implementation spec: no function name, no algorithm, no acceptance shape.
- No Supersession Inventory entry for the old marker-only `case 2` logic being extended/replaced for the JSON format. Template rule: existing code that is rewritten due to this plan's changes must appear in the inventory.
- Task 4b says "Inspect `bkit-uninstall.ts:156–165`. Confirm `case 2` strip-merges...rewrite if it was envelope-aware." This defers the design to build time ("rewrite if...") rather than specifying the algorithm. The required algorithm — walk the template JSON tree and `delete` each matching leaf path from the consumer doc — is named only in the manifest section prose, never formalized as a task scope item.

**Cross-task coupling hazard:** Task 4a (manifest flip) must complete before Task 4b (uninstall fix). If Task 4a ships and Task 4b is skipped or fails, the `case 1 → delete` bug is fixed but replaced by `case 2 → preserve`, which is a different failure mode with no test to catch it until the integration test in Task 10 runs.

**Needed to close:** Add `[MODIFY] .agents/scripts/bkit-uninstall.ts` to Architecture & Component Changes with explicit scope: "Extend `case 2` to detect JSON-format files (by file extension or manifest `format` field); for JSON files, implement JSON strip-merge: parse consumer, walk template tree, delete each template-matching leaf, write result. Preserve all consumer-only keys." Add a Supersession Inventory row for the old marker-only `case 2` behaviour. Sharpen Task 4b to include a build sub-task, not just a verification sub-task.

---

### C-SC2-2 — Upgrade chain test fixture ordering conflict: `migrateTier1JsonToTier2` deleted in Task 7, imported in Task 9 test file

**Evidence:** `bkit-modules.upgrade.integration.test.ts` line 14 imports `{ writeTier2Json, migrateTier1JsonToTier2 }` from `./bkit-tiers`. Task 7 deletes `migrateTier1JsonToTier2` from `bkit-tiers.ts`. Task 9 adds new upgrade chain tests to this same file. The plan's note in Task 9 ("The test runs against a fresh checkout's pre-deletion state of the helper, OR — preferred — bake the v0.8.x post-state into a static fixture as part of Task 0c") acknowledges the problem but does not enforce the resolution.

**Cross-task dependency gap:** Task 7 has a hard verify gate (`pnpm tsc --noEmit` clean; `pnpm turbo lint typecheck format:check test`). If the existing import on line 14 still references `migrateTier1JsonToTier2`, Task 7's own verify will fail, blocking Gate 2. The plan does not include a prerequisite step before Task 7 to update the import line in `bkit-modules.upgrade.integration.test.ts` — that update is only described as part of Task 9 ("ADD" test rows, not "FIX import"). A build agent following strict sequential order will hit a type error at Task 7's verify step with no actionable task to resolve it.

**Needed to close:** Task 7 must include an explicit sub-task: "Update `bkit-modules.upgrade.integration.test.ts` — remove the `migrateTier1JsonToTier2` and `writeTier2Json` imports from line 14; replace with `writeTier2JsonContained` and `migrateLegacyBkitEnvelope` (or remove entirely if the v0.8.x leg is moved to a static fixture in Task 0c)." Alternatively, make Task 0c a hard prerequisite for Task 7 with an explicit instruction to commit the static fixture and update the import.

---

### C-SC2-3 — `bkit-uninstall.ts` missing from Supersession Inventory

The Supersession Inventory (template rule: "Any replaced/superseded code must appear") has no entry for the `case 2` branch in `bkit-uninstall.ts` that must be rewritten to add JSON strip-merge awareness. The template's CAUTION block states "Each `DELETE` row MUST be mirrored as `[DELETE] path/to/file` in Architecture & Component Changes AND as a removal task in Agent Execution Runbook." The same applies to logic that is replaced — the marker-only `case 2` decision path for JSON files is superseded by a JSON-aware path. This must appear in the inventory with `RETAIN-WITH-REASON` (the file is not deleted but logic is extended) or as a `[MODIFY]` with justification.

---

## OPTIONAL

### O-SC2-1 — `migrateLegacyBkitEnvelope` round-trip: before/after fixture JSON shapes not specified

Matrix row (line 119, Integration test in `bkit-modules.upgrade.integration.test.ts`): "Pre-v2.0.0 fixture (`__bkit__` + top-level mirror) → upgrade → file matches schema-clean snapshot." Task 0c names the fixture directory (`tests/fixtures/heavy-customised-consumer-v1-envelope/`) and the three files inside it, but gives no inline JSON for what `cursor-hooks.json` and `claude-settings.json` must contain. A build agent must infer:

- Which `__bkit__` keys the envelope holds (e.g. `hooks.sessionStart`, `hooks.sessionStop` for Cursor; `hooks.SessionStart` for Claude).
- Which consumer-added keys must survive (`hooks.Stop`, `failClosed`, `loop_limit`).
- What the `bkit-version.json` `pinnedVersion: "0.8.5"` shape looks like beyond the single quoted string.

The "after" snapshot (what the files look like post-migration) is described only narratively. A build agent authoring the static fixture without reference to the live v1.1.1 consumer files (`app-gether-life`, `visitfrasercoast-com`) cannot confirm the fixture is realistic. Recommend adding abbreviated JSON samples (10–15 lines each) to Task 0c for both the `before` (envelope) and `after` (schema-clean) shapes.

---

### O-SC2-2 — `bkit-modules.test.ts` verify step in Task 4 may mask missing `migrateLegacyBkitEnvelope` export

Task 4's verify step is "`pnpm vitest run bkit-modules.test.ts` green." The existing `bkit-modules.test.ts` tests `runClaudeModule` and `runCursorModule` through a mocked surface. If the test file does not directly import `migrateLegacyBkitEnvelope` (it calls it indirectly through `runClaudeModule`), a typo in the export name in `bkit-tiers.ts` would not be caught until Task 8 (`bkit-tiers.test.ts` rewrite). A direct unit test of the new export (Task 8) should run before or alongside Task 4's integration verify. Consider making the Task 4 verify step reference `pnpm tsc --noEmit` explicitly (not just the test runner) to catch export-name errors at compile time.

---

### O-SC2-3 — Human confirmation gate unchecked; plan is marked `Verdict: PASS` at top before human sign-off

The plan's `plan-v2-reviewed.md` header reads `Verdict: PASS` but both human-confirmation checkboxes remain `[ ]` (lines 130 and 171). Gate 1 requires `[x]` on both before the agent proceeds. The reviewer verdict at the file top (`PASS`) refers to the plan-review verdict, not the acceptance-scenario sign-off, but a build agent scanning for `[x]` at Gate 1 will correctly block — this creates a misleading combination where the file externally signals `PASS` but internally blocks at Gate 1. Not a plan defect per se but worth flagging so the human knows to tick both boxes before handing off to a build agent.

---

### O-SC2-4 — No rollback path specified if `migrateLegacyBkitEnvelope` runs on a file with malformed JSON

The edge-case table (line 87) states: "Consumer file has `__bkit__` but the bkit subtree is invalid JSON — Fallback to overwrite with template." The `migrateLegacyBkitEnvelope` signature takes a parsed `doc: JsonValue` — so malformed JSON is caught by the caller before the helper is invoked. The plan's `bkit-modules.ts` section (lines 349–357) does not specify what the caller does if `JSON.parse` throws. The rollback section says "code-only `git revert` sufficient" but does not cover the in-flight case where the caller fails mid-write (partial write leaves a truncated JSON file). A try-catch with atomic write (write to temp then rename) is the standard pattern; the plan should specify this in the Task 4 scope.

---

## OUT OF SCOPE

### OOS-SC2-1 — `bkit-modules.upgrade.integration.test.ts` regression for manifest tier reclassification (charter question)

The charter asks whether the upgrade integration test covers the manifest tier reclassification. The test for uninstall consumer-key survival lives in `bkit-modules.integration.test.ts` (Task 10, Derived Test Matrix line 125), not in `bkit-modules.upgrade.integration.test.ts`. This split is architecturally correct (uninstall is not an upgrade path). Adding a manifest-tier regression to the upgrade integration test file would conflate two separate verification axes. No action needed within this plan.

---

### OOS-SC2-2 — Phase 2 marker encoding for `AGENTS.md` / `CLAUDE.md` (referenced in Phase 2 section)

Phase 2 is explicitly deferred. No tasks in Phase 1 touch those files for marker addition. Correctly out of scope.

---

### OOS-SC2-3 — `bkit upgrade --prune` flag implementation

Deferred per Out of Scope section and `docs/pending.md` tracking. Correctly excluded from v2.0.0.
