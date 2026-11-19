Enforced: true
Red: 1
Accepted: 0
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 1, attempt 2

Plan: `docs/plans/202611/985-install-settings-merge-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 2 | `.bkit/core/engine/install/write.test.ts` "a second run after pruning writes nothing" | red | failure: expected [] to deeply equal [ { …(2) } ] |

## Gaps

None.

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
[bkit] Managed block markers present but unparseable in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-tiers-test-vxk38a/architecture.md — skipping (expected exactly one start/end)

 ❯ .bkit/core/engine/install/write.test.ts (96 tests | 11 failed) 50ms
   ✓ writeTier1 (5)
     ✓ writes file when dest missing 2ms
     ✓ rewrites file when dest exists with different content (idempotent rewrite) 1ms
     ✓ no-op when dest matches src (idempotent — no double-count) 1ms
     ✓ substitutes tokens in dest content 0ms
     ✓ dry-run does not write to disk but records write in WriteSet 0ms
   ✓ writeTier2 — html-comment markers (5)
     ✓ appends block at EOF when dest exists with no markers (consumer content preserved) 1ms
     ✓ updates only bkit block when dest already has markers 1ms
     ✓ writes whole file when dest is missing 1ms
     ✓ dry-run records write without touching disk 0ms
     ✓ does NOT append when dest has duplicate/unparseable markers (avoids compounding corruption) 1ms
   ✓ writeTier2 — retired Antigravity drivers (docs/migrations.md) (6)
     ✓ bkit-gateguard.cjs: an unedited 5.1.0 driver is replaced by the whole new file 2ms
     ✓ bkit-gateguard.cjs: dry-run reports the replacement without writing 1ms
     ✓ bkit-gateguard.cjs: an edited 5.1.0 driver is kept and gets a printed fix 1ms
     ✓ bkit-guardrails.cjs: an unedited 5.1.0 driver is replaced by the whole new file 2ms
     ✓ bkit-guardrails.cjs: dry-run reports the replacement without writing 1ms
     ✓ bkit-guardrails.cjs: an edited 5.1.0 driver is kept and gets a printed fix 2ms
   ✓ writeTier2 — retired Claude Code guardrails driver (docs/migrations.md) (5)
     ✓ an unedited 6.1.1 driver is replaced by the whole new file, which emits the deny 2ms
     ✓ an edited driver without a permissionDecision emit is kept and gets a printed fix 1ms
     ✓ an edited driver that already emits permissionDecision is kept with no warning 1ms
     ✓ the Antigravity fix never fires for a Claude driver writing hookSpecificOutput 1ms
     ✓ no retired hash matches the driver of the template bkit ships today 0ms
   ✓ ensurePackageJsonScripts (9)
     ✓ returns missingPkg=true when package.json does not exist 0ms
     ✓ returns malformed=true when package.json is invalid JSON 0ms
     ✓ seeds scripts block when absent 0ms
     ✓ adds only missing scripts; preserves existing values verbatim 0ms
     ✓ is a no-op (no write) when all scripts already present 0ms
     ✓ dryRun=true records drift in WriteSet but does not write to disk 0ms
     ✓ preserves 4-space indent style of original package.json 1ms
     ✓ preserves trailing newline of original package.json 0ms
     ✓ is idempotent across two consecutive runs 0ms
   ✓ detectMarkerStyle (11)
     ✓ bare html marker → a
<!-- bkit:start -->
x
<!-- bkit:end -->
 0ms
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
     ✓ marker quoted in prose → null 0ms
     ✓ hash marker with a trailing label → null 0ms
     ✓ indented hash marker → null 0ms
     ✓ marker embedded mid-line → null 0ms
     ✓ no markers → null 0ms
     ✓ empty content → null 0ms
     ✓ every detected style is one stripManagedBlock can strip 0ms
   ✓ stripManagedBlock — html-comment markers (7)
     ✓ removes the managed block and marker lines from content 0ms
     ✓ returns content unchanged when markers are absent 0ms
     ✓ returns content unchanged when markers are duplicated (safety guard) 0ms
     ✓ returns content unchanged when markers are inverted (safety guard) 0ms
     ✓ is idempotent — calling twice produces same result 0ms
     ✓ strips block when content only contains the managed block 0ms
     ✓ preserves consumer content above AND below the block 0ms
   ✓ stripManagedBlock — slash-comment markers (4)
     ✓ removes slash-comment managed block from JS/TS files 0ms
     ✓ returns content unchanged when slash markers are absent 0ms
     ✓ does not strip html-comment block when style is slash-comment 0ms
     ✓ does not strip slash-comment block when style is html-comment 0ms
   ✓ stripManagedBlock — whitespace handling (BAR-138 lesson) (2)
     ✓ does not use greedy whitespace regex — only removes the managed block region 0ms
     ✓ handles marker with no blank lines around it 0ms
   ✓ deepMergeJson (8)
     ✓ (1) primitives: override wins over base 0ms
     ✓ (2) arrays: override replaces base entirely (no concat) 0ms
     ✓ (3) objects: merge recursively; override keys win; base keys retained 0ms
     ✓ (4) array inside object: override array replaces base array (not concat) 0ms
     ✓ (5) claude settings.json case: consumer Stop hook survives bkit SessionStart update 0ms
     ✓ (6) null base with object override: override wins wholesale 0ms
     ✓ (7) template (override) key order wins for order-significant maps (#255 P2-10) 0ms
     ✓ (8) template keys first (template order), consumer-only keys appended 0ms
   ✓ deepContains (8)
     ✓ (1) ok=true when consumer is a superset of template (objects nested 4 levels) 0ms
     ✓ (2) ok=false with missing paths when a template key is absent from consumer 0ms
     ✓ (3) ok=false with mismatched paths when a leaf primitive differs 0ms
     ✓ (4) array-of-primitives uses subset semantics 0ms
     ✓ (5) array-of-objects uses order-insensitive deep-equal element-wise containment 0ms
     ✓ (6) array-of-objects asymmetric size: template 1 element, consumer 2 elements → ok=true 0ms
     ✓ (7) mixed-array (primitives + objects) uses element-wise per-type semantics; missing reports element index path 0ms
     ✓ (8) null-input boundary cases: (null,null)→ok; (null,obj)→ok; (obj,null)→missing 0ms
   ✓ writeTier2JsonContained (5)
     ✓ writes template as-is when destination is missing 1ms
     ✓ deep-merges and idempotents on re-run with identical state 0ms
     ✓ schema-flip: type-mismatched same-path values → template wins on deep-merge 0ms
     ✓ malformed destination → throws with actionable error message (does NOT overwrite) 1ms
     ✓ dry-run: records write in WriteSet without touching disk 0ms
   ❯ retired settings entries — find and prune (7)
     × shipped list holds mcp__claude_ai_Linear__* for .claude/settings.json permissions.allow 2ms
     × removes a retired entry and keeps the person's entries beside it 0ms
     × returns a document without the retired entry unchanged and a second prune changes nothing 0ms
     × reports an edited variant as edited and never removes it 0ms
     × does not report an entry the template ships as edited 0ms
     × matches the file by repo-relative path whether the destination is relative or absolute 0ms
     × prunes a retired entry in any host file the list names 0ms
   ❯ writeTier2JsonContained — retired settings entries (4)
     × drops a retired entry even when the template is otherwise contained 2ms
     × dry run records the same write and leaves the file untouched 1ms
     × a second run after pruning writes nothing 1ms
     × keeps an edited variant and warns with the file and the entry 1ms
   ✓ Phase 3 — install/write.ts doc-block no Tier 1/2/3 strings (1)
     ✓ install/write.ts contains no 'Tier 1', 'Tier 2', or 'Tier 3' strings (single-model semantics) 0ms
   ✓ cursor-v1-schema (1)
     ✓ parsed template has version===1, hooks.sessionStart/sessionStop arrays, no __bkit__, no flat-array hooks 0ms
   ✓ writeTier2 — markdown dest holding an older unmarked copy (2)
     ✓ skips instead of appending a second copy below the old one 1ms
     ✓ still appends to the consumer's own doc that only shares the title 0ms
   ✓ executable bit drift (4)
     ✓ writeTier2 dry run records a hook that lost its bit and leaves the mode alone 0ms
     ✓ writeTier2 restores the bit once, recorded once 1ms
     ✓ writeTier1 restores the bit on byte-identical content 0ms
     ✓ a non-executable source leaves the destination mode alone 0ms
   ✓ mergeManagedJson (2)
     ✓ merges managed lists while keeping consumer-added entries 0ms
     ✓ keeps a consumer hook placed inside a bkit hook group 0ms

⎯⎯⎯⎯⎯⎯ Failed Tests 11 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/install/write.test.ts > retired settings entries — find and prune > shipped list holds mcp__claude_ai_Linear__* for .claude/settings.json permissions.allow
AssertionError: expected undefined to be defined
 ❯ .bkit/core/engine/install/write.test.ts:922:38
    920| describe("retired settings entries — find and prune", () => {
    921|   it("shipped list holds mcp__claude_ai_Linear__* for .claude/settings…
    922|     expect(RETIRED_SETTINGS_ENTRIES).toBeDefined();
       |                                      ^
    923|     const text = JSON.stringify(RETIRED_SETTINGS_ENTRIES);
    924|     expect(text).toContain(".claude/settings.json");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/11]⎯

 FAIL  .bkit/core/engine/install/write.test.ts > retired settings entries — find and prune > removes a retired entry and keeps the person's entries beside it
TypeError: pruneRetiredSettingsEntries is not a function
 ❯ .bkit/core/engine/install/write.test.ts:935:17
    933|       env: { A: "1" },
    934|     };
    935|     const out = pruneRetiredSettingsEntries(".claude/settings.json", d…
       |                 ^
    936|     expect(allowOf(out)).toEqual(["Bash(*)", "mcp__mine__*"]);
    937|     expect((out as typeof doc).permissions.deny).toEqual(["Bash(rm -rf…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/11]⎯

 FAIL  .bkit/core/engine/install/write.test.ts > retired settings entries — find and prune > returns a document without the retired entry unchanged and a second prune changes nothing
TypeError: pruneRetiredSettingsEntries is not a function
 ❯ .bkit/core/engine/install/write.test.ts:943:18
    941|   it("returns a document without the retired entry unchanged and a sec…
    942|     const clean = { permissions: { allow: ["Bash(*)", "mcp__mine__*"] …
    943|     const once = pruneRetiredSettingsEntries(".claude/settings.json", …
       |                  ^
    944|     expect(once).toEqual(clean);
    945|     const dirty = { permissions: { allow: [RETIRED_LINEAR, "mcp__mine_…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/11]⎯

 FAIL  .bkit/core/engine/install/write.test.ts > retired settings entries — find and prune > reports an edited variant as edited and never removes it
TypeError: findRetiredSettingsEntries is not a function
 ❯ .bkit/core/engine/install/write.test.ts:955:19
    953|     const edited = "mcp__claude_ai_Linear__get_issue";
    954|     const doc = { permissions: { allow: [edited, "mcp__mine__*"] } };
    955|     const found = findRetiredSettingsEntries(".claude/settings.json", …
       |                   ^
    956|     expect(found.retired).toHaveLength(0);
    957|     expect(found.edited.length).toBeGreaterThan(0);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/11]⎯

 FAIL  .bkit/core/engine/install/write.test.ts > retired settings entries — find and prune > does not report an entry the template ships as edited
TypeError: findRetiredSettingsEntries is not a function
 ❯ .bkit/core/engine/install/write.test.ts:967:19
    965|     const doc = { permissions: { allow: [shipped] } };
    966|     const template = { permissions: { allow: [shipped] } };
    967|     const found = findRetiredSettingsEntries(
       |                   ^
    968|       ".claude/settings.json",
    969|       doc as JsonValue,

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/11]⎯

 FAIL  .bkit/core/engine/install/write.test.ts > retired settings entries — find and prune > matches the file by repo-relative path whether the destination is relative or absolute
TypeError: pruneRetiredSettingsEntries is not a function
 ❯ .bkit/core/engine/install/write.test.ts:980:19
    978|     const abs = path.join(tmpDir, ".claude", "settings.json");
    979|     for (const rel of [".claude/settings.json", abs]) {
    980|       const out = pruneRetiredSettingsEntries(rel, doc as JsonValue);
       |                   ^
    981|       expect(allowOf(out)).toEqual(["mine"]);
    982|       expect(findRetiredSettingsEntries(rel, doc as JsonValue).retired…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[6/11]⎯

 FAIL  .bkit/core/engine/install/write.test.ts > retired settings entries — find and prune > prunes a retired entry in any host file the list names
TypeError: pruneRetiredSettingsEntries is not a function
 ❯ .bkit/core/engine/install/write.test.ts:990:17
    988|   it("prunes a retired entry in any host file the list names", () => {
    989|     const doc = { permissions: { allow: ["retired-codex-entry", "keep"…
    990|     const out = pruneRetiredSettingsEntries(".codex/hooks.json", doc a…
       |                 ^
    991|     expect(allowOf(out)).toEqual(["keep"]);
    992|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[7/11]⎯

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

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[8/11]⎯

 FAIL  .bkit/core/engine/install/write.test.ts > writeTier2JsonContained — retired settings entries > dry run records the same write and leaves the file untouched
AssertionError: expected [] to deeply equal [ { …(2) } ]

- Expected
+ Received

- [
-   {
-     "action": "update",
-     "path": "/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-tiers-test-lZkCWL/.claude/settings.json",
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

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[9/11]⎯

 FAIL  .bkit/core/engine/install/write.test.ts > writeTier2JsonContained — retired settings entries > a second run after pruning writes nothing
AssertionError: expected [] to deeply equal [ { …(2) } ]

- Expected
+ Received

- [
-   {
-     "action": "update",
-     "path": "/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-tiers-test-SrFd9j/.claude/settings.json",
-   },
- ]
+ []

 ❯ .bkit/core/engine/install/write.test.ts:1027:26
    1025|     const first = makeWriteSet();
    1026|     writeTier2JsonContained(src, dst, false, first);
    1027|     expect(first.writes).toEqual([{ path: dst, action: "update" }]);
       |                          ^
    1028|     const second = makeWriteSet();
    1029|     writeTier2JsonContained(src, dst, false, second);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[10/11]⎯

 FAIL  .bkit/core/engine/install/write.test.ts > writeTier2JsonContained — retired settings entries > keeps an edited variant and warns with the file and the entry
AssertionError: expected "warn" to be called at least once
 ❯ .bkit/core/engine/install/write.test.ts:1041:20
    1039|       const after = JSON.parse(fs.readFileSync(dst, "utf-8"));
    1040|       expect(after.permissions.allow).toContain(edited);
    1041|       expect(warn).toHaveBeenCalled();
       |                    ^
    1042|       const text = warn.mock.calls.map((c) => c.join(" ")).join("\n");
    1043|       expect(text).toContain(".claude/settings.json");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[11/11]⎯


 Test Files  1 failed (1)
      Tests  11 failed | 85 passed (96)
   Start at  22:37:23
   Duration  163ms (tests 55%, setup 20%, import 14%, transform 8%, worker 2%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-nO33kK/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
