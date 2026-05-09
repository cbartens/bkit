Verdict: CONCERNS
Failures: 5

<!-- verdict:end -->

# Plan Scope Check

## CRITICAL

### C-1: Phase 2 Task 19 (manifest dispatch refactor) is a HARD prerequisite for Task 20, but Task 20 is listed AFTER Task 19 without explicit gate enforcement — coupling is asymmetric

The runbook lists tasks sequentially (Task 19 then Task 20), but the critical coupling is under-specified. Task 4b explicitly acknowledges the `format: "json"` dispatch is **dormant** until Task 19 reclassifies files, and says integration tests must be "gated with a fixture that injects `format: "json"` directly" or run post-Task-19. However there is no corresponding gate checkpoint between Task 19 and Task 20 — the existing Gate 2 only fires after ALL of Tasks 0c, 1–10a, 17–24, 25–28 complete. If a build agent completes Task 4b integration tests before Task 19 is done (e.g. as an optimisation or partial retry), the `bkit uninstall --claude/--cursor strips template scope` tests will silently pass because `case 1` (full-delete) still applies to those files. The `// PREREQ: Task 19 reclassification` comment is mentioned as a mitigation but the runbook does not enforce skipping those tests before Task 19. The plan should add a sub-gate between Task 18b and Task 19 that explicitly blocks Task 20 and the `format: "json"` uninstall integration tests until Task 19 is merged.

**Plan reference:** Runbook Task 4b ("Mark these integration tests with a `// PREREQ: Task 19 reclassification` comment") and Task 20. No intermediate gate exists in `### Phase 2 — Markers + manifest dispatch` section between Task 18b and Task 19.

---

### C-2: Phase 3 terminology sweep (Tasks 25–27) does NOT carry a hard ordering constraint relative to Phase 2 doc updates (Tasks 11–16)

The plan's splittability note says "Sub-plan C HARD-DEPENDS on sub-plan B — Task 25 requires `format: "byte-equal-text"` to exist on `ManifestEntry` (introduced in Task 19)." However Tasks 26 (doc-block rewrite in `bkit-tiers.ts`) and 27 (terminology sweep across `docs/`) are purely editorial and have no hard dependency on Phase 2 shipping — they can race with Phase 2 tasks. More critically, the terminology sweep in Task 27 targets `docs/testing.md` and `docs/architecture.md`, but the doc rewrite tasks for those files (Task 13 for `docs/architecture.md`) are in Phase 1, earlier in the runbook. If Task 27 runs before Task 13 completes, it may conflict with or partially undo the Task 13 rewrite. The runbook does not state "Task 27 must follow Task 13" explicitly — only that "Sub-plan C HARD-DEPENDS on sub-plan B." This leaves Tasks 26–27 floating relative to Tasks 11–16.

**Plan reference:** Runbook splittability note (lines ~797–803), Task 13 (Phase 1 docs), Task 27 (Phase 3 sweep). The implicit "Phase 3 after Phase 2" ordering is mentioned in the splittability note but NOT restated as a hard sequencing constraint at the task level.

---

### C-3: Phase 2 marker insertion points — Group A files lack precise insertion anchors (line numbers or regex anchors)

Every Group A full-ownership template file in Task 17 is described only as "Wrap entire bkit-owned content in `<!-- bkit:start -->` / `<!-- bkit:end -->`." For `.agents/templates/AGENTS.md`, `.agents/templates/CLAUDE.md`, `.agents/templates/.agents/{docs,friction,skills}.md`, and `.agents/templates/docs/plans/template.md`, there is no line number, heading anchor, or regex pattern specifying where the markers go. Contrast this with Group B (`.github/workflows/ci.yml`): the plan gives line numbers ("currently line 23", "currently line 49"), indentation ("6 spaces"), and an exact YAML snippet. For Group A "full-ownership" files, "wrap entire bkit-owned content" is ambiguous when those files have consumer sections already present on real consumer installs — a build agent might wrap only the currently-present template content rather than the intended full template scope. The `.agents/templates/.agents/rules.md` entry is even weaker: "Already has markers — verify scope expands if needed; no structural change expected." If scope expansion IS needed, there is no specification for what the expanded markers should cover.

**Plan reference:** Architecture & Component Changes → Phase 2 Templates → Group A section (lines ~541–587). Compare with the Group B `.github/workflows/ci.yml` entry (lines ~595–616) which gives precise line-level spec. No equivalent precision for Group A.

---

### C-4: `migrateLegacyBkitEnvelope` round-trip — `.claude/settings.json` BEFORE/AFTER fixture lacks the `hooks.Stop` consumer key in the AFTER shape

The static fixture in Architecture & Component Changes → Static Fixture committed shows the `claude-settings.json` AFTER shape as:
```json
{ "hooks": { "SessionStart": [...], "Stop": [...] } }
```
This appears correct. However the BEFORE shape for `claude-settings.json` shows `hooks.Stop` as an array element:
```json
"__bkit__": { "hooks": { "SessionStart": [{ "command": "pnpm bkit check" }] } },
"hooks": { "SessionStart": [...], "Stop": [{ "command": "echo 'consumer stop hook'" }] }
```
After `migrateLegacyBkitEnvelope` strips `__bkit__`, `postStripDoc` = `{ hooks: { SessionStart: [...], Stop: [...] } }`. Then `deepContains(template, postStripDoc)` checks that every template key is present — template has only `hooks.SessionStart`, which IS present. So `stripped: true`, `deepMerged: false`, `schemaFlipped: false`. The AFTER shape correctly retains `Stop`. This is internally consistent.

**However**, the Acceptance Scenario Concrete Example (line ~76) describes the migration log as `[bkit] migrated .cursor/hooks.json — schema flip applied (flat-array → keyed-object) (v2.0.0)` AND `[bkit] migrated .claude/settings.json — stripped __bkit__ envelope (v2.0.0)`. The `cursor-hooks.json` BEFORE fixture IS a flat-array shape (`"hooks": [...]`), so `schemaFlipped: true` should fire there. The BEFORE/AFTER samples for `cursor-hooks.json` correctly show this. The plan is internally consistent here, but the plan does NOT specify that the `migrateLegacyBkitEnvelope` matrix test row for "schema-flip" uses the `cursor-hooks.json` fixture specifically. The test matrix row (line ~132) says "Unit (Vitest) / `.agents/scripts/bkit-tiers.test.ts`" without naming the fixture. A build agent may write a synthetic schema-flip case rather than using the `cursor-hooks.json` fixture, causing the test to miss a corner: the BEFORE `cursor-hooks.json` has BOTH `__bkit__` (keyed-object) AND top-level `hooks` (flat-array). After stripping `__bkit__`, the top-level `hooks` is `[...]` (flat-array), but the template's `hooks` is `{...}` (keyed-object). The type-flip detection in `writeTier2JsonContained`/`deepContains` needs to fire here. The plan calls this out in the Edge Cases table but the unit test spec for `migrateLegacyBkitEnvelope` (Task 3) says "schema-flip" without tying it to this exact fixture shape. The fixture files committed in Task 0c should be referenced explicitly from Task 3's test block.

**Plan reference:** Architecture & Component Changes → Static Fixture (lines ~477–533), Test matrix row for `migrateLegacyBkitEnvelope` schemaFlipped (line ~133), Runbook Task 3.

---

### C-5: Consumer's heavily-customised `ci.yml` with modified `Install Dependencies` step — plan acknowledges the scenario but test fixture is under-specified

The plan's concrete example (line ~70–71) sets up "a heavily customised v3+ CI workflow that previously lost its `pnpm bkit check` step." The marker coverage spec says the block covers `Install Dependencies` (auth-surface) through `Run Bkit Check` inclusive, including `Run Typecheck`, `Run Vitest Tests`, `Run Prettier Format Check`, `Run Vale Prose Lint`, `Run Slop Scan` steps (lines ~596–597). The plan notes "if a consumer customises them they will trigger `tier2-text-drift`" and acknowledges this as a design trade-off for v2.0.0.

The `app-gether-life` consumer has a heavily-customised `Install Dependencies` step with additional env vars or matrix configuration. Task 23a adds a "heavy-customised `ci.yml` survival test," but the plan does not specify what the fixture's `Install Dependencies` step looks like. Specifically:
1. If the consumer has added env vars to the `Install Dependencies` step (e.g. `NODE_AUTH_TOKEN`), those additions will be INSIDE the marker block and will trigger `tier2-text-drift` on every `bkit check`. This is the scenario the `app-gether-life` precedent makes concrete but which the plan defers to post-v2.0.0 as "if finer granularity is needed in a future minor version."
2. Task 23a's fixture should include a consumer `Install Dependencies` step with customised env to demonstrate that `bkit upgrade` correctly handles the case — but the plan only says "consumer's surrounding job structure preserved byte-identical" without specifying whether the test fixture's marker block IS the template's content exactly, or whether it has consumer modifications inside the marker block.

This means Task 23a as written will pass even if the implementation does NOT handle the case where a consumer has modified content inside the marker block — because "surrounding structure preserved" only tests outside-marker content.

**Plan reference:** Architecture & Component Changes → Group B → `.github/workflows/ci.yml` marker spec comment "if a consumer customises them they will trigger `tier2-text-drift`" (line ~597). Runbook Task 23a (line ~888). Test matrix row "Heavy-customised `ci.yml` survival" (line ~151).

---

### C-6: `slop-scan.config.json` is classified `format: "json"` (deep-containment) in the manifest mapping — but the test matrix row and `bkit-templates.test.ts` treat it as a static template integrity check, not a dispatch-chain test

The manifest mapping (Architecture & Component Changes, line ~662) lists `slop-scan.config.json` under "Old `tier: 3` JSON files → `format: "json"`" alongside `.cursor/settings.json` and `.cursor/environment.json`. This means it goes through `deepContains` in the dispatch chain (Task 20). However the template-integrity test in `bkit-templates.test.ts` (Task 22, test matrix row line ~149) is described as: "each of the ten required rule keys... is present in the consumer file with `enabled: true` — JSON deep-containment, NOT markers." This is a static assertion against the template file itself, not an integration test of the dispatch path. There is no test matrix row that verifies `bkit check` raises `tier2-json-drift` specifically when a consumer `slop-scan.config.json` is missing one of the ten required rule keys. The `tier2-json-drift` matrix row (line ~141) covers only `.cursor/hooks.json` and `.claude/settings.json` ("consumer file is missing a template key" — integration test). The `slop-scan.config.json` drift-detection path is untested end-to-end.

**Plan reference:** Test matrix row at line ~149 (`slop-scan.config.json` deep-containment unit test in `bkit-templates.test.ts`), contrast with line ~141 (`tier2-json-drift` integration test not listing `slop-scan.config.json` as a target). Manifest mapping at line ~662.

## OPTIONAL

### O-1: `deepContains` mixed-array test is listed in the matrix but Task 1's implementation spec does not define "per-element-type semantics" precisely enough

The test matrix row (line ~127) says "Mixed-array (primitives + objects) uses element-wise per-type semantics; `missing` reports element index path." Task 1 says "Mixed arrays: per-element-type semantics." Neither specifies: if a mixed array `[1, {a: 1}]` in the template is compared to `[1, {a: 1}, {a: 2}]` in the consumer, does the object element match by deep-equal-exact or by deep-contains-partial? The answer should follow the same object-array rule (element-wise deep-equal containment) but this is not stated. A build agent implementing this could produce a semantically inconsistent result. Adding one sentence to Task 1 would close this ambiguity: "For each mixed-array element: if the element is a primitive, apply primitive equality; if the element is an object, apply `deepContains` recursively."

---

### O-2: `writeTier2JsonContained` idempotency test should specify the "content unchanged, no-op" assertion explicitly

The test matrix row (line ~129) says "`writeTier2JsonContained` deep-merges and idempotents on re-run with identical state." The "no-op" branch in the architecture spec says "`ok=true` and content unchanged → no-op." The test should assert that calling `writeTier2JsonContained` twice does NOT produce a different file hash and does NOT call the write function a second time. The plan does not specify this assertion form. Without it, a build agent might only assert the output content is equal but still call the write operation (which would reset mtime and potentially cause spurious CI failures in file-watchers).

---

### O-3: The `bkit:start` / `bkit:end` marker syntax for `.vale.ini` is not distinguished from `ci.yml` — both use `# bkit:start` but the indentation is different

For `ci.yml`, the plan explicitly specifies 6-space indentation for the marker comments (`# bkit:start` at 8 spaces inside a `steps:` list). For `.vale.ini`, no indentation spec is given. Vale INI files are typically flat key=value sections without indentation. If the build agent adds `# bkit:start` with leading spaces in `.vale.ini`, the Vale binary may fail to parse the file. Task 18 should add a one-line note: "`.vale.ini` markers are at column 0 (no indentation)."

---

### O-4: Phase 3 `lint:no-tier-terms` exclusion list uses `--include` glob patterns for `grep` but the implementation note says "OR use a small Node script"

The `package.json` script spec (line ~772) uses `grep -rn 'Tier [123]\|tier: [123]' docs/ .agents/scripts/*.ts --include='*.md' --include='*.ts'`. However this grep will match historical entries in `docs/decisions.md` (DE-5/DE-7/DE-8) and `docs/knowledge.md` (KN-8/KN-13). The exclusion strategy is described as "use `grep -v` filters to skip those specific files, OR use a small Node script." The plan delegates "build agent picks the simpler fitting approach" — but a `grep -v` filter on full file paths needs to be exact, and the spec does not enumerate which specific lines (or sections) to exclude, only the files. If a build agent uses file-level exclusion, it will miss any new `Tier [123]` regression in those files outside the designated historical sections. Recommending the Node script approach or specifying section-level exclusion would be safer.

---

### O-5: `bkit-doctor.integration.test.ts` Task 10a test scope is minimal — it only asserts that two advisories "surface through the doctor verb" without specifying the doctor output format

Task 10a says "assert `tier2-json-drift` and `legacy-bkit-envelope-detected` surface through the `doctor` verb." This is an existence check only. The test should also assert the doctor output format (e.g. exit code 0, advisory message includes the affected file path and action string `Run pnpm bkit upgrade...`). Without format assertions, a refactor of the doctor output format would not be caught by this test.

---

### O-6: `package.json` version bump Task 14a is listed UNDER "Phase 1 — Documentation" between Tasks 13 and 15 — ordering risk

Task 14a (version bump to 2.0.0) has a CRITICAL ordering note: "MUST happen BEFORE Task 5 (`pnpm bkit install` against worktree)." Task 5 is in "Phase 1 — Code" which precedes "Phase 1 — Documentation." The runbook correctly calls out this ordering in Task 5's PREREQ list, but a build agent reading tasks sequentially within "Phase 1 — Code" will reach Task 5 without having seen Task 14a (which is listed later). The plan mitigates this by listing Task 14a explicitly as a PREREQ in Task 5's text. This is adequate but an additional clarifying note at Task 14a ("NOTE: this task must be pulled forward and executed before Task 5 despite its location in the Documentation section") would prevent a sequential-execution agent from missing the cross-section dependency.

## OUT OF SCOPE

### X-1: `bkit upgrade --prune` flag — correctly deferred

The plan correctly identifies this as a post-v2.0.0 item and tracks it in `docs/pending.md`. No action required within this plan.

---

### X-2: Splitting into three sub-plans (A/B/C)

The runbook splittability note is informational only (if `plan-complexity-check.md` flips to SPLIT). This audit does not recommend splitting — it is an expansion of plan scope beyond what is needed to audit v2.0.0 as a single PR.

---

### X-3: Consumer-repo migration automation for `app-gether-life` and `visitfrasercoast-com`

The plan correctly scopes this as out-of-scope: consumers run `pnpm bkit upgrade` themselves post-v2.0.0 release. No action required within this plan.

