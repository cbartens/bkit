Enforced: true
Red: 12
Accepted: 0
Updated: 0
Gaps: 1

<!-- verdict:end -->

# Tests Red — group 1, attempt 1

Plan: `docs/plans/202611/985-install-settings-merge-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 1 | `.bkit/core/engine/install/write.test.ts` "shipped list holds mcp__claude_ai_Linear__* for .claude/settings.json permissions.allow" | red | failure: expected undefined to be defined |
| 1 | `.bkit/core/engine/install/write.test.ts` "removes a retired entry and keeps the person's entries beside it" | red | failure: pruneRetiredSettingsEntries is not a function |
| 1 | `.bkit/core/engine/install/write.test.ts` "returns a document without the retired entry unchanged and a second prune changes nothing" | red | failure: pruneRetiredSettingsEntries is not a function |
| 1 | `.bkit/core/engine/install/write.test.ts` "reports an edited variant as edited and never removes it" | red | failure: findRetiredSettingsEntries is not a function |
| 1 | `.bkit/core/engine/install/write.test.ts` "does not report an entry the template ships as edited" | red | failure: findRetiredSettingsEntries is not a function |
| 1 | `.bkit/core/engine/install/write.test.ts` "matches the file by repo-relative path whether the destination is relative or absolute" | red | failure: pruneRetiredSettingsEntries is not a function |
| 1 | `.bkit/core/engine/install/write.test.ts` "prunes a retired entry in any host file the list names" | red | failure: pruneRetiredSettingsEntries is not a function |
| 2 | `.bkit/core/engine/install/write.test.ts` "drops a retired entry even when the template is otherwise contained" | red | failure: expected [ 'Bash(*)', …(2) ] to deeply equal [ 'Bash(*)', 'mcp__mine__*' ] |
| 2 | `.bkit/core/engine/install/write.test.ts` "dry run records the same write and leaves the file untouched" | red | failure: expected [] to deeply equal [ { …(2) } ] |
| 2 | `.bkit/core/engine/install/write.test.ts` "a second run after pruning writes nothing" | vacuous | "a second run after pruning writes nothing" passes at its red, so it proves nothing |
| 2 | `.bkit/core/engine/install/write.test.ts` "keeps an edited variant and warns with the file and the entry" | red | failure: expected "warn" to be called at least once |
| 2 | `.bkit/core/engine/commands/install/upgrade.integration.test.ts` "upgrade over a seeded old-shape settings file removes the retired grant and keeps the person's" | red | failure: expected [ 'Skill(*)', 'Bash(*)', …(101) ] to not include 'mcp__claude_ai_Linear__*' |
| 2 | `.bkit/core/engine/commands/install/upgrade.integration.test.ts` "upgrade dry run lists the settings update and leaves the retired grant" | red | failure: expected '[bkit-upgrade] Running upgrade (dry-r…' to contain '.claude/settings.json' |

## Gaps

- TASK 2 `.bkit/core/engine/install/write.test.ts` "a second run after pruning writes nothing" `vacuous` — "a second run after pruning writes nothing" passes at its red, so it proves nothing

## Lint output — `.bkit/core/engine/install/write.test.ts`

```

> @cbartens/bkit@6.2.0 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/985-install-settings-merge
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/install/write.test.ts

```

## Runner output — `.bkit/core/engine/install/write.test.ts`

```

> @cbartens/bkit@6.2.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/985-install-settings-merge
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/install/write.test.ts


 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/985-install-settings-merge

stderr | .bkit/core/engine/install/write.test.ts > writeTier2 — html-comment markers > does NOT append when dest has duplicate/unparseable markers (avoids compounding corruption)
[bkit] Managed block markers present but unparseable in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-tiers-test-KWnGpg/architecture.md — skipping (expected exactly one start/end)

 ❯ .bkit/core/engine/install/write.test.ts (96 tests | 10 failed) 114ms
   ✓ writeTier1 (5)
     ✓ writes file when dest missing 4ms
     ✓ rewrites file when dest exists with different content (idempotent rewrite) 1ms
     ✓ no-op when dest matches src (idempotent — no double-count) 1ms
     ✓ substitutes tokens in dest content 1ms
     ✓ dry-run does not write to disk but records write in WriteSet 1ms
   ✓ writeTier2 — html-comment markers (5)
     ✓ appends block at EOF when dest exists with no markers (consumer content preserved) 2ms
     ✓ updates only bkit block when dest already has markers 2ms
     ✓ writes whole file when dest is missing 1ms
     ✓ dry-run records write without touching disk 1ms
     ✓ does NOT append when dest has duplicate/unparseable markers (avoids compounding corruption) 2ms
   ✓ writeTier2 — retired Antigravity drivers (docs/migrations.md) (6)
     ✓ bkit-gateguard.cjs: an unedited 5.1.0 driver is replaced by the whole new file 5ms
     ✓ bkit-gateguard.cjs: dry-run reports the replacement without writing 2ms
     ✓ bkit-gateguard.cjs: an edited 5.1.0 driver is kept and gets a printed fix 3ms
     ✓ bkit-guardrails.cjs: an unedited 5.1.0 driver is replaced by the whole new file 7ms
     ✓ bkit-guardrails.cjs: dry-run reports the replacement without writing 2ms
     ✓ bkit-guardrails.cjs: an edited 5.1.0 driver is kept and gets a printed fix 3ms
   ✓ writeTier2 — retired Claude Code guardrails driver (docs/migrations.md) (5)
     ✓ an unedited 6.1.1 driver is replaced by the whole new file, which emits the deny 4ms
     ✓ an edited driver without a permissionDecision emit is kept and gets a printed fix 3ms
     ✓ an edited driver that already emits permissionDecision is kept with no warning 3ms
     ✓ the Antigravity fix never fires for a Claude driver writing hookSpecificOutput 3ms
     ✓ no retired hash matches the driver of the template bkit ships today 1ms
   ✓ ensurePackageJsonScripts (9)
     ✓ returns missingPkg=true when package.json does not exist 1ms
     ✓ returns malformed=true when package.json is invalid JSON 1ms
     ✓ seeds scripts block when absent 1ms
     ✓ adds only missing scripts; preserves existing values verbatim 1ms
     ✓ is a no-op (no write) when all scripts already present 1ms
     ✓ dryRun=true records drift in WriteSet but does not write to disk 2ms
     ✓ preserves 4-space indent style of original package.json 1ms
     ✓ preserves trailing newline of original package.json 1ms
     ✓ is idempotent across two consecutive runs 1ms
   ✓ detectMarkerStyle (11)
     ✓ bare html marker → a
<!-- bkit:start -->
x
<!-- bkit:end -->
 1ms
     ✓ hash-prefixed html marker → # <!-- bkit:start -->
x
# <!-- bkit:end -->
 0ms
     ✓ slash-prefixed html marker → // <!-- bkit:start -->
x
// <!-- bkit:end -->
 0ms
     ✓ slash marker → // bkit:start
x
// bkit:end
 0ms
     ✓ marker quoted in prose → null 1ms
     ✓ hash marker with a trailing label → null 0ms
     ✓ indented hash marker → null 0ms
     ✓ marker embedded mid-line → null 0ms
     ✓ no markers → null 0ms
     ✓ empty content → null 0ms
     ✓ every detected style is one stripManagedBlock can strip 0ms
   ✓ stripManagedBlock — html-comment markers (7)
     ✓ removes the managed block and marker lines from content 1ms
     ✓ returns content unchanged when markers are absent 1ms
     ✓ returns content unchanged when markers are duplicated (safety guard) 0ms
     ✓ returns content unchanged when markers are inverted (safety guard) 0ms
     ✓ is idempotent — calling twice produces same result 1ms
     ✓ strips block when content only contains the managed block 0ms
     ✓ preserves consumer content above AND below the block 0ms
   ✓ stripManagedBlock — slash-comment markers (4)
     ✓ removes slash-comment managed block from JS/TS files 1ms
     ✓ returns content unchanged when slash markers are absent 0ms
     ✓ does not strip html-comment block when style is slash-comment 0ms
     ✓ does not strip slash-comment block when style is html-comment 1ms
   ✓ stripManagedBlock — whitespace handling (BAR-138 lesson) (2)
     ✓ does not use greedy whitespace regex — only removes the managed block region 0ms
     ✓ handles marker with no blank lines around it 0ms
   ✓ deepMergeJson (8)
     ✓ (1) primitives: override wins over base 1ms
     ✓ (2) arrays: override replaces base entirely (no concat) 0ms
     ✓ (3) objects: merge recursively; override keys win; base keys retained 0ms
     ✓ (4) array inside object: override array replaces base array (not concat) 1ms
     ✓ (5) claude settings.json case: consumer Stop hook survives bkit SessionStart update 0ms
     ✓ (6) null base with object override: override wins wholesale 1ms
     ✓ (7) template (override) key order wins for order-significant maps (#255 P2-10) 0ms
     ✓ (8) template keys first (template order), consumer-only keys appended 0ms
   ✓ deepContains (8)
     ✓ (1) ok=true when consumer is a superset of template (objects nested 4 levels) 1ms
     ✓ (2) ok=false with missing paths when a template key is absent from consumer 1ms
     ✓ (3) ok=false with mismatched paths when a leaf primitive differs 1ms
     ✓ (4) array-of-primitives uses subset semantics 1ms
     ✓ (5) array-of-objects uses order-insensitive deep-equal element-wise containment 1ms
     ✓ (6) array-of-objects asymmetric size: template 1 element, consumer 2 elements → ok=true 0ms
     ✓ (7) mixed-array (primitives + objects) uses element-wise per-type semantics; missing reports element index path 0ms
     ✓ (8) null-input boundary cases: (null,null)→ok; (null,obj)→ok; (obj,null)→missing 1ms
   ✓ writeTier2JsonContained (5)
     ✓ writes template as-is when destination is missing 1ms
     ✓ deep-merges and idempotents on re-run with identical state 1ms
     ✓ schema-flip: type-mismatched same-path values → template wins on deep-merge 1ms
     ✓ malformed destination → throws with actionable error message (does NOT overwrite) 2ms
     ✓ dry-run: records write in WriteSet without touching disk 1ms
   ❯ retired settings entries — find and prune (7)
     × shipped list holds mcp__claude_ai_Linear__* for .claude/settings.json permissions.allow 4ms
     × removes a retired entry and keeps the person's entries beside it 1ms
     × returns a document without the retired entry unchanged and a second prune changes nothing 1ms
     × reports an edited variant as edited and never removes it 0ms
     × does not report an entry the template ships as edited 1ms
     × matches the file by repo-relative path whether the destination is relative or absolute 0ms
     × prunes a retired entry in any host file the list names 0ms
   ❯ writeTier2JsonContained — retired settings entries (4)
     × drops a retired entry even when the template is otherwise contained 4ms
     × dry run records the same write and leaves the file untouched 3ms
     ✓ a second run after pruning writes nothing 2ms
     × keeps an edited variant and warns with the file and the entry 2ms
   ✓ Phase 3 — install/write.ts doc-block no Tier 1/2/3 strings (1)
     ✓ install/write.ts contains no 'Tier 1', 'Tier 2', or 'Tier 3' strings (single-model semantics) 1ms
   ✓ cursor-v1-schema (1)
     ✓ parsed template has version===1, hooks.sessionStart/sessionStop arrays, no __bkit__, no flat-array hooks 1ms
   ✓ writeTier2 — markdown dest holding an older unmarked copy (2)
     ✓ skips instead of appending a second copy below the old one 1ms
     ✓ still appends to the consumer's own doc that only shares the title 1ms
   ✓ executable bit drift (4)
     ✓ writeTier2 dry run records a hook that lost its bit and leaves the mode alone 1ms
     ✓ writeTier2 restores the bit once, recorded once 1ms
     ✓ writeTier1 restores the bit on byte-identical content 1ms
     ✓ a non-executable source leaves the destination mode alone 1ms
   ✓ mergeManagedJson (2)
     ✓ merges managed lists while keeping consumer-added entries 1ms
     ✓ keeps a consumer hook placed inside a bkit hook group 0ms

⎯⎯⎯⎯⎯⎯ Failed Tests 10 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/install/write.test.ts > retired settings entries — find and prune > shipped list holds mcp__claude_ai_Linear__* for .claude/settings.json permissions.allow
AssertionError: expected undefined to be defined
 ❯ .bkit/core/engine/install/write.test.ts:922:38
    920| describe("retired settings entries — find and prune", () => {
    921|   it("shipped list holds mcp__claude_ai_Linear__* for .claude/settings…
    922|     expect(RETIRED_SETTINGS_ENTRIES).toBeDefined();
       |                                      ^
    923|     const text = JSON.stringify(RETIRED_SETTINGS_ENTRIES);
    924|     expect(text).toContain(".claude/settings.json");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/10]⎯

 FAIL  .bkit/core/engine/install/write.test.ts > retired settings entries — find and prune > removes a retired entry and keeps the person's entries beside it
TypeError: pruneRetiredSettingsEntries is not a function
 ❯ .bkit/core/engine/install/write.test.ts:935:17
    933|       env: { A: "1" },
    934|     };
    935|     const out = pruneRetiredSettingsEntries(".claude/settings.json", d…
       |                 ^
    936|     expect(allowOf(out)).toEqual(["Bash(*)", "mcp__mine__*"]);
    937|     expect((out as typeof doc).permissions.deny).toEqual(["Bash(rm -rf…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/10]⎯

 FAIL  .bkit/core/engine/install/write.test.ts > retired settings entries — find and prune > returns a document without the retired entry unchanged and a second prune changes nothing
TypeError: pruneRetiredSettingsEntries is not a function
 ❯ .bkit/core/engine/install/write.test.ts:943:18
    941|   it("returns a document without the retired entry unchanged and a sec…
    942|     const clean = { permissions: { allow: ["Bash(*)", "mcp__mine__*"] …
    943|     const once = pruneRetiredSettingsEntries(".claude/settings.json", …
       |                  ^
    944|     expect(once).toEqual(clean);
    945|     const dirty = { permissions: { allow: [RETIRED_LINEAR, "mcp__mine_…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/10]⎯

 FAIL  .bkit/core/engine/install/write.test.ts > retired settings entries — find and prune > reports an edited variant as edited and never removes it
TypeError: findRetiredSettingsEntries is not a function
 ❯ .bkit/core/engine/install/write.test.ts:955:19
    953|     const edited = "mcp__claude_ai_Linear__get_issue";
    954|     const doc = { permissions: { allow: [edited, "mcp__mine__*"] } };
    955|     const found = findRetiredSettingsEntries(".claude/settings.json", …
       |                   ^
    956|     expect(found.retired).toHaveLength(0);
    957|     expect(found.edited.length).toBeGreaterThan(0);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/10]⎯

 FAIL  .bkit/core/engine/install/write.test.ts > retired settings entries — find and prune > does not report an entry the template ships as edited
TypeError: findRetiredSettingsEntries is not a function
 ❯ .bkit/core/engine/install/write.test.ts:967:19
    965|     const doc = { permissions: { allow: [shipped] } };
    966|     const template = { permissions: { allow: [shipped] } };
    967|     const found = findRetiredSettingsEntries(
       |                   ^
    968|       ".claude/settings.json",
    969|       doc as JsonValue,

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/10]⎯

 FAIL  .bkit/core/engine/install/write.test.ts > retired settings entries — find and prune > matches the file by repo-relative path whether the destination is relative or absolute
TypeError: pruneRetiredSettingsEntries is not a function
 ❯ .bkit/core/engine/install/write.test.ts:980:19
    978|     const abs = path.join(tmpDir, ".claude", "settings.json");
    979|     for (const rel of [".claude/settings.json", abs]) {
    980|       const out = pruneRetiredSettingsEntries(rel, doc as JsonValue);
       |                   ^
    981|       expect(allowOf(out)).toEqual(["mine"]);
    982|       expect(findRetiredSettingsEntries(rel, doc as JsonValue).retired…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[6/10]⎯

 FAIL  .bkit/core/engine/install/write.test.ts > retired settings entries — find and prune > prunes a retired entry in any host file the list names
TypeError: pruneRetiredSettingsEntries is not a function
 ❯ .bkit/core/engine/install/write.test.ts:990:17
    988|   it("prunes a retired entry in any host file the list names", () => {
    989|     const doc = { permissions: { allow: ["retired-codex-entry", "keep"…
    990|     const out = pruneRetiredSettingsEntries(".codex/hooks.json", doc a…
       |                 ^
    991|     expect(allowOf(out)).toEqual(["keep"]);
    992|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[7/10]⎯

 FAIL  .bkit/core/engine/install/write.test.ts > writeTier2JsonContained — retired settings entries > drops a retired entry even when the template is otherwise contained
AssertionError: expected [ 'Bash(*)', …(2) ] to deeply equal [ 'Bash(*)', 'mcp__mine__*' ]

- Expected
+ Received

  [
    "Bash(*)",
+   "mcp__claude_ai_Linear__*",
    "mcp__mine__*",
  ]

 ❯ .bkit/core/engine/install/write.test.ts:1010:37
    1008|     writeTier2JsonContained(src, dst, false, ws);
    1009|     const after = JSON.parse(fs.readFileSync(dst, "utf-8"));
    1010|     expect(after.permissions.allow).toEqual(["Bash(*)", "mcp__mine__*"…
       |                                     ^
    1011|     expect(ws.writes).toEqual([{ path: dst, action: "update" }]);
    1012|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[8/10]⎯

 FAIL  .bkit/core/engine/install/write.test.ts > writeTier2JsonContained — retired settings entries > dry run records the same write and leaves the file untouched
AssertionError: expected [] to deeply equal [ { …(2) } ]

- Expected
+ Received

- [
-   {
-     "action": "update",
-     "path": "/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-tiers-test-miHRIy/.claude/settings.json",
-   },
- ]
+ []

 ❯ .bkit/core/engine/install/write.test.ts:1020:25
    1018|     writeTier2JsonContained(src, dst, true, real);
    1019|     expect(fs.readFileSync(dst, "utf-8")).toBe(before);
    1020|     expect(real.writes).toEqual([{ path: dst, action: "update" }]);
       |                         ^
    1021|   });
    1022|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[9/10]⎯

 FAIL  .bkit/core/engine/install/write.test.ts > writeTier2JsonContained — retired settings entries > keeps an edited variant and warns with the file and the entry
AssertionError: expected "warn" to be called at least once
 ❯ .bkit/core/engine/install/write.test.ts:1039:20
    1037|       const after = JSON.parse(fs.readFileSync(dst, "utf-8"));
    1038|       expect(after.permissions.allow).toContain(edited);
    1039|       expect(warn).toHaveBeenCalled();
       |                    ^
    1040|       const text = warn.mock.calls.map((c) => c.join(" ")).join("\n");
    1041|       expect(text).toContain(".claude/settings.json");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[10/10]⎯


 Test Files  1 failed (1)
      Tests  10 failed | 86 passed (96)
   Start at  22:34:50
   Duration  332ms (tests 60%, setup 16%, import 12%, transform 11%, worker 2%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-9ZDaWV/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```

## Lint output — `.bkit/core/engine/commands/install/upgrade.integration.test.ts`

```

> @cbartens/bkit@6.2.0 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/985-install-settings-merge
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/install/upgrade.integration.test.ts

```

## Runner output — `.bkit/core/engine/commands/install/upgrade.integration.test.ts`

```

> @cbartens/bkit@6.2.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/985-install-settings-merge
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/install/upgrade.integration.test.ts


 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/985-install-settings-merge

stderr | .bkit/core/engine/commands/install/upgrade.integration.test.ts > upgrade integration: consumer customizations > detects conflict on customised .cursor/hooks.json (failClosed, loop_limit preserved)
[bkit-upgrade] conflict: .cursor/hooks.json — consumer drift detected, NOT overwriting

stderr | .bkit/core/engine/commands/install/upgrade.integration.test.ts > upgrade integration: consumer customizations > does not silently overwrite consumer drift in --non-interactive mode
[bkit-upgrade] conflict: .cursor/hooks.json — consumer drift detected, NOT overwriting
[bkit-upgrade] 1 conflict(s) detected. Manually merge or revert consumer changes:
  - .cursor/hooks.json

stderr | .bkit/core/engine/commands/install/upgrade.integration.test.ts > upgrade integration: consumer customizations > conflict list has relPath and both content versions for AI-actionable diff
[bkit-upgrade] conflict: .cursor/hooks.json — consumer drift detected, NOT overwriting
[bkit-upgrade] 1 conflict(s) detected. Manually merge or revert consumer changes:
  - .cursor/hooks.json

stderr | .bkit/core/engine/commands/install/upgrade.integration.test.ts > upgrade integration: consumer customizations > upgrades non-conflicting file while preserving conflicting consumer file
[bkit-upgrade] conflict: .cursor/hooks.json — consumer drift detected, NOT overwriting
[bkit-upgrade] 1 conflict(s) detected. Manually merge or revert consumer changes:
  - .cursor/hooks.json

stdout | .bkit/core/engine/commands/install/upgrade.integration.test.ts > upgrade integration: consumer customizations > upgrades non-conflicting file while preserving conflicting consumer file
[bkit-upgrade] upgrade: .claude/agents/bkit-test.md

stdout | .bkit/core/engine/commands/install/upgrade.integration.test.ts > upgrade-preservation > upgrade preserves consumer content outside the bkit block (markered-text) > .gitignore — consumer secret-protection rules survive; bkit block is updated (the #129 case)
[bkit-upgrade] upgrade (merge): .gitignore

stdout | .bkit/core/engine/commands/install/upgrade.integration.test.ts > upgrade-preservation > upgrade preserves consumer content outside the bkit block (markered-text) > .gitattributes — consumer custom attributes outside the block survive
[bkit-upgrade] upgrade (merge): .gitattributes

stdout | .bkit/core/engine/commands/install/upgrade.integration.test.ts > upgrade-preservation > upgrade preserves consumer content outside the bkit block (markered-text) > docs/*.md — consumer prose AFTER bkit:end survives even with NO manifest entry (content-detected)
[bkit-upgrade] upgrade (merge): docs/testing.md

stdout | .bkit/core/engine/commands/install/upgrade.integration.test.ts > upgrade-preservation > upgrade preserves consumer content outside the bkit block (markered-text) > dest has NO bkit markers — block is appended at EOF, all consumer content preserved
[bkit-upgrade] upgrade (merge): .gitignore

stdout | .bkit/core/engine/commands/install/upgrade.integration.test.ts > upgrade-preservation > upgrade preserves consumer keys (json deep-merge) > .claude/settings.json — consumer mcpServers survives; bkit keys merged in (the #129 case)
[bkit-upgrade] upgrade (merge): .claude/settings.json

stdout | .bkit/core/engine/commands/install/upgrade.integration.test.ts > upgrade-preservation > upgrade is idempotent for block-merge formats > records the merged on-disk hash and skips on the second run
[bkit-upgrade] upgrade (merge): .gitignore

stdout | .bkit/core/engine/commands/install/upgrade.integration.test.ts > upgrade-preservation > upgrade of an owned whole-file candidate > auto-updates when there is no consumer drift
[bkit-upgrade] upgrade: .bkit/owned/bkit-owned.sh

stdout | .bkit/core/engine/commands/install/upgrade.integration.test.ts > upgrade-preservation > upgrade of an owned whole-file candidate > honors contentOverride — writes rendered content, never the raw template
[bkit-upgrade] upgrade: .bkit/owned/bkit-owned.sh

stdout | .bkit/core/engine/commands/install/upgrade.integration.test.ts > upgrade-preservation > upgrade substitutes template tokens (#129 §2) > seeds an absent byte-equal file with {{DEFAULT_BRANCH}} resolved, not literal
[bkit-upgrade] upgrade: .bkit/owned/bkit-owned.sh

 ❯ .bkit/core/engine/commands/install/upgrade.integration.test.ts (82 tests | 2 failed) 107769ms
   ✓ upgrade integration: consumer customizations (4)
     ✓ detects conflict on customised .cursor/hooks.json (failClosed, loop_limit preserved) 6ms
     ✓ does not silently overwrite consumer drift in --non-interactive mode 2ms
     ✓ conflict list has relPath and both content versions for AI-actionable diff 2ms
     ✓ upgrades non-conflicting file while preserving conflicting consumer file 4ms
   ✓ issue #129 §5 — upgrade does not force-create opt-in module files (6)
     ✓ does not create .github/renovate.json5 or .github/dependabot.yml for a non-opted-in consumer 1362ms
     ✓ install --claude does not write Serena or graphify examples 620ms
     ✓ upgrade does not rewrite a consumer-owned bkit-graphify.sh 395ms
     ✓ does not rewrite a consumer-owned .github/renovate.json5 419ms
     ✓ preserves consumer prose after bkit:end in docs/*.md through a real `bkit upgrade` (#129 §1/§6) 445ms
     ✓ bkit upgrade prints the adopted marker for a changed starter with a project copy 436ms
   ✓ MCP config — install and upgrade own only bkit's tracker entry (7)
     ✓ present, unmodified .mcp.json + .cursor/mcp.json (github) → same-version upgrade leaves them byte-identical 1405ms
     ✓ present, unmodified .mcp.json + .cursor/mcp.json (linear) → same-version upgrade leaves them byte-identical 1427ms
     ✓ present, unmodified .mcp.json + .cursor/mcp.json (jira) → same-version upgrade leaves them byte-identical 1417ms
     ✓ upgrade restores bkit's edited github entry, keeps a consumer server, and check is then clean 2430ms
     ✓ upgrade restores bkit's edited linear entry, keeps a consumer server, and check is then clean 2454ms
     ✓ upgrade restores bkit's edited jira entry, keeps a consumer server, and check is then clean 2459ms
     ✓ malformed .mcp.json fails install instead of being overwritten 445ms
   ✓ #489 — install and upgrade leave the consumer's own files alone (4)
     ✓ an install with every host and cloud lane creates no template outside .bkit/templates/ 2189ms
     ✓ an adopted copy of every template survives upgrade and check 2621ms
     ✓ check flags a stale .agents/context.md block; upgrade refreshes it and keeps the consumer's content 2547ms
     ✓ check flags a stale .agents/skills.md block; upgrade refreshes it and keeps the consumer's content 2859ms
   ✓ #489 — managed-version marker on every file bkit writes (2)
     ✓ every written file carries a marker at the installing version, and check derives the same set 1155ms
     ✓ check flags an old marker; upgrade restamps every marker with no conflict; check is then clean 4430ms
   ✓ #717 — .codex/bkit-cloud.md through install, upgrade and check (1)
     ✓ codex install writes it gitignored at 0600; upgrade regenerates it; check stays clean 1901ms
   ✓ #1053 — upgrade re-records the entry of every rendered output (1)
     ✓ re-records a stale entry for a rendered mirror, doc and allowlist that are already current 1307ms
   ✓ #255 — upgrade does not force-create uninstalled host/tooling modules (12)
     ✓ claude-only install → upgrade seeds no cursor/lint files or templates, and check stays clean 1933ms
     ✓ upgrade creates a file a newer release adds to an installed opt-in host (#550) 2778ms
     ✓ upgrade moves a 5.1.0 Antigravity hooks.json onto the current matchers (guardrails gates view_file) 1890ms
     ✓ upgrade seeds missing bkit:gate:* names, so check stays clean (#489) 2089ms
     ✓ slop plugin migration upgrades old bytes, stays idempotent, and preserves customization 2908ms
     ✓ branded script migration is idempotent and dry-run writes nothing 2988ms
     ✓ copy-and-own migration second upgrade logs no branded line for the hook and CI file 2068ms
     ✓ a dry-run hook and CI token migration writes nothing 997ms
     ✓ a second template-file migration and a dry run leave scripts/ci and the hooks unchanged 2550ms
     ✓ a second check-name migration writes nothing 2474ms
     ✓ a dry-run check-name migration writes and moves nothing 962ms
     ✓ a second Vale migration and a dry run write nothing 2484ms
   ✓ #281 Task 3 — upgrade re-renders all installed provider blocks (1)
     ✓ upgrade reconverges ALL provider blocks — openrouter (active) + ollama (secondary) 1944ms
   ✓ #281 AC — bkit check exits 0 with multiple providers installed (1)
     ✓ bkit check exits 0 after installing two providers (openrouter + ollama) 1789ms
   ✓ #422 — gateguard markered-text upgrade round-trip (site-9 regression) (1)
     ✓ install, tamper outside the block AND stale the block content, upgrade: outside survives, block is refreshed 2050ms
   ✓ upgrade-preservation (9)
     ✓ upgrade preserves consumer content outside the bkit block (markered-text) (4)
       ✓ .gitignore — consumer secret-protection rules survive; bkit block is updated (the #129 case) 4ms
       ✓ .gitattributes — consumer custom attributes outside the block survive 2ms
       ✓ docs/*.md — consumer prose AFTER bkit:end survives even with NO manifest entry (content-detected) 3ms
       ✓ dest has NO bkit markers — block is appended at EOF, all consumer content preserved 2ms
     ✓ upgrade preserves consumer keys (json deep-merge) (1)
       ✓ .claude/settings.json — consumer mcpServers survives; bkit keys merged in (the #129 case) 3ms
     ✓ upgrade is idempotent for block-merge formats (1)
       ✓ records the merged on-disk hash and skips on the second run 3ms
     ✓ upgrade of an owned whole-file candidate (2)
       ✓ auto-updates when there is no consumer drift 2ms
       ✓ honors contentOverride — writes rendered content, never the raw template 2ms
     ✓ upgrade substitutes template tokens (#129 §2) (1)
       ✓ seeds an absent byte-equal file with {{DEFAULT_BRANCH}} resolved, not literal 2ms
   ✓ upgrade-render (11)
     ✓ #251 — bkit upgrade re-renders agents/commands + .bkit docs (6)
       ✓ restores tampered agents + docs and refreshes the prompts.md block while preserving consumer overrides 1441ms
       ✓ dead override reported: upgrade names an override row for an agent bkit no longer ships, exit 0 1252ms
       ✓ upgrade renders opencode.json with provider/tracker sentinels resolved for github (no raw @@…@@ leak, #245) 1219ms
       ✓ upgrade renders opencode.json with provider/tracker sentinels resolved for linear (no raw @@…@@ leak, #245) 1114ms
       ✓ upgrade renders opencode.json with provider/tracker sentinels resolved for jira (no raw @@…@@ leak, #245) 1082ms
       ✓ opencode-go gateway: install records the manifest provider; upgrade re-renders the opencode-go block (no ollama fallback) 1111ms
     ✓ #459 — bkit upgrade keeps bkit's recorded hash for a consumer-edited whole-file (3)
       ✓ a no-op upgrade does not re-record a hand-edited canonical file as bkit's content 1197ms
       ✓ re-records the hash of .bkit/allowlist.json when upgrade regenerates it, so uninstall still deletes it 1426ms
       ✓ upgrade moves a recorded .cursor/allowlist.json to .bkit/allowlist.json 1520ms
     ✓ advisories — check and upgrade report what install reports (2)
       ✓ surfaces test-file-script-missing on check, and upgrade rewrites .bkit/advisories.md 1606ms
       ✓ a dry-run upgrade leaves .bkit/advisories.md alone 827ms
   ✓ Scenario: bkit upgrade --to self-bump dry-run (#1) (5)
     ✓ previews the bump (pnpm add + re-render) and exits 0 without mutating 227ms
     ✓ bumps when --to names the installed version but package.json pins a file: tarball 259ms
     ✓ passes -w when the consumer is a pnpm workspace root 280ms
     ✓ starts the package runner for the install and the re-exec 767ms
     ✓ rejects --to=<version> with --latest (mutually exclusive) at exit 1 300ms
   ✓ #715 — upgrade retires a 5.2.4 .bkit/lite.md (1)
     ✓ upgrade from a 5.2.4 lite.md keeps the consumer section 2159ms
   ✓ #864 — upgrade migrates legacy project document ownership (4)
     ✓ leaves project docs, the index and the version file unchanged when upgrade runs twice 2223ms
     ✓ migrates legacy ownership without changing project text or core ownership 2938ms
     ✓ preserves ambiguous legacy markers and reports cleanup without blocking check 2030ms
     ✓ previews project document migration without mutating the checkout 1181ms
   ✓ #892 — upgrade replaces the old sample config names (1)
     ✓ upgrade replaces the old sample config names 1875ms
   ✓ #892 — install, check and upgrade warn about a missing root lint-staged config instead of writing one (8)
     ✓ upgrade writes no root lint-staged config for a consumer that relied on the nested sample 1175ms
     ✓ upgrade names the missing root lint-staged config with the copy command 1108ms
     ✓ install names the missing root lint-staged config under its own log prefix 968ms
     ✓ check names the missing root lint-staged config under its own log prefix 1181ms
     ✓ upgrade --dry-run names the missing root lint-staged config once and writes none 1060ms
     ✓ upgrade prints no missing lint-staged config line when the consumer's config is lint-staged.config.ts 1171ms
     ✓ upgrade prints no missing lint-staged config line when lint-staged is not a dependency 1281ms
     ✓ upgrade prints no missing lint-staged config line when the format gate passes lint-staged a config path 1432ms
   ✓ #803 — upgrade over legacy OpenCode substring fetch grants (1)
     ✓ upgrade keeps legacy OpenCode substring fetch grants and reports each for owner review 1302ms
   ❯ #985 — upgrade takes back a retired settings grant (2)
     × upgrade over a seeded old-shape settings file removes the retired grant and keeps the person's 1293ms
     × upgrade dry run lists the settings update and leaves the retired grant 1093ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 2 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/install/upgrade.integration.test.ts > #985 — upgrade takes back a retired settings grant > upgrade over a seeded old-shape settings file removes the retired grant and keeps the person's
AssertionError: expected [ 'Skill(*)', 'Bash(*)', …(101) ] to not include 'mcp__claude_ai_Linear__*'
 ❯ .bkit/core/engine/commands/install/upgrade.integration.test.ts:2904:23
    2902|       JSON.parse(fs.readFileSync(file, "utf-8")) as { permissions: { a…
    2903|     ).permissions.allow;
    2904|     expect(allow).not.toContain(RETIRED);
       |                       ^
    2905|     expect(allow).toContain("mcp__person__*");
    2906|     const second = runCli(["upgrade", "--auto-apply"]);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/2]⎯

 FAIL  .bkit/core/engine/commands/install/upgrade.integration.test.ts > #985 — upgrade takes back a retired settings grant > upgrade dry run lists the settings update and leaves the retired grant
AssertionError: expected '[bkit-upgrade] Running upgrade (dry-r…' to contain '.claude/settings.json'

- Expected
+ Received

- .claude/settings.json
+ [bkit-upgrade] Running upgrade (dry-run)
+ [bkit-upgrade] Done. updated: 0, skipped: 50, conflicts: 0, re-rendered: 0
+
+

 ❯ .bkit/core/engine/commands/install/upgrade.integration.test.ts:2916:33
    2914|     const dry = runCli(["upgrade", "--dry-run"]);
    2915|     expect(dry.status, combinedOutput(dry)).toBe(0);
    2916|     expect(combinedOutput(dry)).toContain(".claude/settings.json");
       |                                 ^
    2917|     expect(fs.readFileSync(file, "utf-8")).toBe(before);
    2918|     expect(before).toContain(RETIRED);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/2]⎯


 Test Files  1 failed (1)
      Tests  2 failed | 80 passed (82)
   Start at  22:34:52
   Duration  108.69s (tests 99%, transform 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-UrywUR/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
