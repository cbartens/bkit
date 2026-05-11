Verdict: CONCERNS
Failures: 0

<!-- verdict:end -->

# Plan Review 2 (Re-Run — Build-Readiness + Complementary Risk)

## CRITICAL

### C1 — `slop-scan.config.json` ownership model mismatch: plan claims "deep-containment, not markers" but the charter's question about JSON-with-no-comments is never resolved for `slop-scan.config.json`

The plan's Breaking Changes §7 lists `slop-scan.config.json` under "partial-ownership markers," and the Group B section (Architecture §Phase 2 → Templates — Group B) explicitly says:

> `slop-scan.config.json` — **JSON file — uses deep-containment, not markers.** The "required core rules" enumerated in the task spec are owned via deep-containment.

That is consistent with the format the file is in (JSON, no comment syntax). However, the `bkit-manifest.ts` tier-to-format mapping table in the plan says old `tier: 3` JSON files include `slop-scan.config.json` → `format: "json"`, and the plan-input charter flagged this question specifically. The plan resolves it correctly (deep-containment for JSON), but the test matrix row says:

> Marker presence enforcement (partial-ownership): … `slop-scan.config.json` markers wrap the enumerated bkit core rules

That test description is misleading — it says "markers" for a file that is resolved as JSON deep-containment. Task 22 (`bkit-templates.test.ts`) says it will assert "slop-scan.config.json required rules enumerated," which is actually a deep-containment check, not a marker-presence check. The mismatch between the test matrix description ("markers wrap") and the implementation direction ("deep-containment") will confuse the build agent. The test matrix row must be corrected to say "deep-containment: each required rule key present" rather than "markers wrap the enumerated bkit core rules."

This is a build-readiness CRITICAL because Task 22's acceptance description is directly wrong, and a build agent executing the test verbatim will implement a marker check for a JSON file.

---

### C2 — `bkit check` / `bkit doctor` pre-v2.0.0 advisory fires on wrong condition: `legacy-bkit-envelope-detected` condition conflates `canonicalHashes` timing with `__bkit__` presence

Architecture section under `bkit-preflight.ts`:

> ADD advisory `legacy-bkit-envelope-detected` — fires when `bkit check` / `bkit doctor` sees `__bkit__` at top level of `.cursor/hooks.json` or `.claude/settings.json` AND `canonicalHashes` indicate a pre-v2.0.0 last-write.

The condition requires BOTH `__bkit__` present AND `canonicalHashes` indicate a pre-v2.0.0 write. But `canonicalHashes` is a sha256 map of managed file content at install time — it does not record the bkit version that wrote each file. There is no field in the current `BkitVersion` schema (`pinnedVersion`, `tier3Hashes`, `canonicalHashes`) that directly says "written by v2.0.0" vs "written by v1.x." The meaningful condition is simply: `__bkit__` present at top level (sufficient on its own to identify pre-v2.0.0 shape). The secondary `canonicalHashes` condition as described is unimplementable as written without a version-keyed canonicalHashes format change that is not described anywhere in the plan.

The plan should specify that `legacy-bkit-envelope-detected` fires when `__bkit__` is present in the consumer file — full stop. The `pinnedVersion` field (already on disk from `.bkit-version`) can be used as a belt-and-suspenders check (`pinnedVersion < "2.0.0"` or absent) if desired, but the `canonicalHashes`-based condition as written is not actionable. The build agent will be unable to implement this condition correctly.

---

### C3 — `bkit-uninstall.ts` `case 2` / `case 3` dispatch for Phase 1 JSON files: the plan specifies a Phase 1 surgical extension to `case 2` (by `.json` extension), but the existing `case 2` path covers only Tier-2 files — `.claude/settings.json` and `.cursor/hooks.json` are currently `tier: 1` in the manifest, landing in `case 1` (delete), not `case 2`

Verified from source: `bkit-manifest.ts` shows `.claude/settings.json` at `tier: 1` and `.cursor/hooks.json` at `tier: 1`. The uninstall switch at lines ~156–212 dispatches `case 1` to `decision: "delete"`. So the current uninstall of these files is a full delete, not a marker-strip or JSON-scope-strip.

Task 4b says: "Inspect `bkit-uninstall.ts:166–184`. Today's `case 2` calls `detectMarkerStyle(content)` which returns `null` for JSON → falls through to `'preserve'` (zombie footprint)." This description is inaccurate for the current state: these JSON files are `tier: 1`, so they land in `case 1` (delete), not `case 2`. The zombie-footprint problem described in Task 4b is a Phase 2 concern (after the manifest is changed to `format: "json"` in Task 19), not a current Phase 1 concern.

The practical consequence: Task 4b instructs the build agent to fix `case 2` for JSON files, but until Task 19 reclassifies the files to `format: "json"`, the new code path is unreachable for `.claude/settings.json` and `.cursor/hooks.json`. The plan must clarify that Task 4b adds the new dispatch but it only becomes active post-Task 19. The verification step in Task 4b ("run `bkit uninstall --claude strips template scope` green") may pass trivially (current `case 1` just deletes the file, which is not the same as a scope-strip). The integration test may assert the wrong outcome unless the fixture setup is carefully scoped to the Phase 2 world.

---

### C4 — Task 5 ordering dependency is stated correctly but the full dependency chain is incomplete: Task 5 depends on Task 14a (version bump), but Task 5 also depends on Tasks 1–3 (new `deepContains`, `writeTier2JsonContained`, `migrateLegacyBkitEnvelope`) being complete

Task 5 says: "PREREQ: Task 14a's `package.json` version bump MUST be applied first." It does not list Tasks 1, 2, 3, and 4 as prerequisites, even though Task 5 calls `pnpm bkit install` against the worktree, which invokes the rewritten `runClaudeModule` / `runCursorModule` that call `migrateLegacyBkitEnvelope` and `writeTier2JsonContained`. If the build agent follows the runbook strictly and runs Task 5 before tasks 1-4 are complete (e.g. if they are parallelising or following a different ordering heuristic), the install will crash or call the old `writeTier2Json` with the now-envelope-less template, triggering the `throw` that checks for `__bkit__` presence.

The ordering note in Task 5 must be expanded to say: "PREREQ: Tasks 1, 2, 3, 4, and 14a all complete."

---

### C5 — `deepContains` mixed-array semantics are under-specified for the actual consumer data

The plan specifies mixed-array semantics as "per-element-type semantics; `missing` reports element index path." The concrete example in `.claude/settings.json` contains `hooks.SessionStart` which is an array of objects of shape `{ hooks: [...] }`. The `deepContains` spec must handle this as object-array containment, not mixed-array. However, the plan also specs "array of primitives: subset semantics" and "array of objects: order-insensitive deep-equal element-wise containment." The actual SessionStart value is `[{ "hooks": [{ "type": "command", "command": "bash .claude/hooks/preflight.sh" }] }]` — a single-element array of objects. The spec is workable here.

The gap is: what does "order-insensitive deep-equal element-wise containment" mean for a 1-element array where the consumer adds a second element? Per the plan, both elements of the template (all one of them) must be present in the consumer's array as a deep-equal element somewhere in the array. That means if a consumer adds a second `SessionStart` hook, `deepContains` passes (template element found), which is correct. But the test matrix row "array-of-objects uses order-insensitive deep-equal element-wise containment" must explicitly cover this case: template has 1 element, consumer has 2 elements → ok=true. Currently the test matrix does not distinguish 1-to-2 from N-to-N containment. The seven listed rows do not include this scenario. Missing test coverage → implementation risk.

This is a CRITICAL because without this case, the "consumer adds keys nested inside template-owned objects" Edge Case ("deepContains passes — every template element is present; consumer extras tolerated") has no corresponding test row to enforce it.

---

### C6 — `ci.yml` partial-marker placement: the plan specifies marker insertion around `setup-auth` step + `pnpm bkit check` step, but the current `ci.yml` template has no `setup-auth` step

Verified from source: `.agents/templates/.github/workflows/ci.yml` (50 lines). The file contains `Install Dependencies` (which uses `pnpm install --frozen-lockfile` with `GH_BKIT_TOKEN` env) and `Run Bkit Check` step. There is no `setup-auth` step in the current template. The plan's Architecture §Phase 2 Group B says:

> Wrap **exactly** the `setup-auth` step + `pnpm bkit check` step in `# bkit:start` / `# bkit:end`

Task 18 says: "wrap `setup-auth` + `pnpm bkit check` steps." The marker placement spec references a step name that does not exist in the current template. The build agent will be unable to find the `setup-auth` step to place the marker above it.

The plan must either:
(a) specify that the marker will wrap only the `Run Bkit Check` step (the step that actually exists), or
(b) specify that a `setup-auth` step is to be added to the template in Task 18 (new content), and provide the exact step YAML.

This is a hard build-readiness blocker for Task 18: the build agent cannot insert the marker if the anchor step does not exist.

---

## OPTIONAL

### O1 — Two-version upgrade chain: v0.5.x fixture's `cursor-hooks.json` shape differs from what the plan assumes

The existing `tests/fixtures/heavy-customised-consumer/cursor-hooks.json` (verified) uses a `SessionStart` keyed-object shape (`hooks.SessionStart[...]`) — not the flat-array (`hooks: [...]`) shape. The plan's v0.5.x leg description implies "pre-envelope" and "pre-Cursor-v1" content. If the fixture's `cursor-hooks.json` is not the pre-Tier-2 flat-array shape, the v0.5.x → v0.8.x → v2.0.0 integration test may not exercise the schema-flip path at all. The build agent should verify the fixture shape before writing the test to confirm the correct leg is exercised by each fixture.

### O2 — `bkit doctor` inherits drift detection "automatically" via preflight only if doctor dispatches through the same preflight call site

The plan says "drift detection call site runs inside `bkit-preflight.ts` so `bkit doctor` inherits drift detection automatically." The `bkit-doctor.integration.test.ts` exists today and imports from `bkit-install.ts` (not preflight directly). The plan does not verify that the doctor verb calls the preflight path that will include the new `legacy-bkit-envelope-detected` and `tier2-json-drift` detectors. Task 10a adds a test that asserts these surface through `doctor`, which will enforce the wiring, but the Architecture section should note the specific call chain to prevent the build agent assuming auto-inheritance without a code change.

### O3 — `lint:no-tier-terms` exclusion list is fragile: using `grep -v` to exclude historical files may also suppress legitimate Tier-term hits in new content written in those files

The plan says "use `grep -v` filters to skip those specific files." If a future build agent adds new non-historical Tier-term content to `docs/decisions.md` (beyond the DE-5/7/8 entries), the exclusion will hide it. The script should use line-range exclusion or a file-specific allowlist rather than a whole-file skip. This is a minor quality concern but worth specifying in Task 28.

### O4 — `bkit-tiers.ts` `migrateTier1JsonToTier2` deletion ordering: Task 7 deletes this function but `bkit-modules.ts` currently calls it inside `runClaudeModule` (confirmed by source, line ~478). Task 4 updates `runClaudeModule` to call `migrateLegacyBkitEnvelope` instead, but Task 7 lists "HARD PREREQ: Task 0c complete" — it does not list Task 4 as a prereq for the deletion. The build agent must not delete `migrateTier1JsonToTier2` before Task 4 replaces all call sites. The plan's implicit ordering (Tasks 1-4 before Task 7) is correct by sequence number but the explicit PREREQ note in Task 7 should add "Task 4 complete."

### O5 — Phase 3 `bkit-tiers.ts` doc-block grep verification: Task 26 says `grep -n "Tier [12]" .agents/scripts/bkit-tiers.ts` returns zero matches. But the import line `import { lookupTier1Defaults } from "./bkit-tier1-defaults.js"` (line 14 of current source) will be deleted by Task 7, and the function name `writeTier2Json` will be renamed by Task 2. The Phase 3 grep will not see a "Tier" term in the function name once renamed to `writeTier2JsonContained`. However, the plan should check whether the word "Tier" appears in comments beyond the header — Task 26 only grepping for `Tier [12]` may miss leftover phrases like "Tier-2 JSON" in inline comments in `writeTier2JsonContained`'s body. A broader grep pattern `Tier` (not just `Tier [12]`) is recommended.

### O6 — Rollback safety gap: the rollback table says "next `bkit install` re-writes the envelope on top via the rolled-back `writeTier2Json` deep-merge." But a consumer that ran `bkit upgrade` to v2.0.0 and had `.cursor/hooks.json` schema-flipped from flat-array to keyed-object will have their file re-deep-merged by the rolled-back `writeTier2Json` which expects `__bkit__.hooks: [...]` (flat-array envelope). The `deepMergeJson` will merge the keyed-object consumer content with the rolled-back flat-array template under `__bkit__`, potentially producing a malformed intermediate. This is a known accepted risk but the rollback note should say: "consumers who had `.cursor/hooks.json` schema-flipped may need to manually restore the `hooks: [...]` flat-array shape if rolling back to v1.x."

### O7 — `bkit-version.ts` `BkitVersion` interface field `tier3Hashes` is `required: Record<string, string>` (not optional) in the current source. Phase 3 plans to make the writer stop emitting it while the reader tolerates absence. But if the type definition keeps the field as required, TypeScript will complain at call sites that construct `BkitVersion` without `tier3Hashes`. The plan should state explicitly that `tier3Hashes` becomes `tier3Hashes?: Record<string, string>` (optional) in the type definition as part of Task 25, or the `writeBkitVersion` call signature update will fail `tsc --noEmit`.

### O8 — Phase 2 marker addition to Group A files: the plan modifies the templates (`AGENTS.md`, `CLAUDE.md`, etc.) but does not specify what happens to the bkit repo's own copies of these files (i.e., the worktree's root-level `AGENTS.md` and `CLAUDE.md`). Task 24 runs `pnpm bkit install` against the worktree itself and asserts zero drift. This should work because the templates are the source of truth — but the plan does not explicitly state that the worktree's own consumer copies of `AGENTS.md`/`CLAUDE.md` will need to be upgraded by the `bkit install` run in Task 24. If those files currently lack markers (bkit is its own consumer), the install step will add markers. The plan should flag this as expected behaviour in Task 24's verification note.

### O9 — CHANGELOG v2.0.0 entry references `DE-16 / KN-15` but those entries are created in Tasks 11 and 12, which come after Task 14 (CHANGELOG). Strictly, the CHANGELOG task (Task 14) should run after Tasks 11 and 12 so it can reference valid decision/knowledge IDs that already exist. The current task ordering places Task 11 (DE-16) → Task 12 (KN-15) → Task 13 (architecture) → Task 14 (CHANGELOG), which is correct. This is a non-issue in the runbook as written, but the plan should note that Task 14 depends on Tasks 11-13.

---

## OUT OF SCOPE

### S1 — `bkit upgrade --prune` flag (deferred post-v2.0.0): mentioned in pending.md additions in Task 16. Not part of this plan.

### S2 — `app-gether-life` and `visitfrasercoast-com` consumer-side migrations: Manual Verification Steps 1 and 2 reference these repos. These are consumer actions after v2.0.0 ships, not bkit-repo tasks. The manual steps are fine as smoke tests but do not add scope to the bkit PR.

### S3 — Cursor v1 runtime spike: correctly removed per Plan-Phase Decision 2. Not re-introduced here.

### S4 — `bkit upgrade --interactive` merge mode (three-way diff): mentioned as a rejected alternative. No plan task. Correct.
