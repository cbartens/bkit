Enforced: true
Verdict: PASS
Gaps: 0
Unproven: 0

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202611/985-install-settings-merge-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Green |
| --- | --- | --- | --- |
| 9 | `.bkit/core/engine/install/write.test.ts` "shipped list holds mcp__claude_ai_Linear__* for .claude/settings.json permissions.allow" | taken-over | passed |
| 10 | `.bkit/core/engine/install/write.test.ts` "reports an edited variant as edited and never removes it" | taken-over | passed |
| 11 | `.bkit/core/engine/install/write.test.ts` "does not report an entry the template ships as edited" | taken-over | passed |
| 12 | `.bkit/core/engine/install/write.test.ts` "keeps an edited variant and warns with the file and the entry" | taken-over | passed |
| 13 | `.bkit/core/engine/install/modules/claude.integration.test.ts` "dry run names an edited variant as kept" | taken-over | passed |

## Gaps

None.

## Taken over

- Task 9 `.bkit/core/engine/install/write.test.ts` "shipped list holds mcp__claude_ai_Linear__* for .claude/settings.json permissions.allow" — taken over from Task 1; changed hands and passes after the rewrite: not proven failing, and never a gap

  ```diff
     it("shipped list holds mcp__claude_ai_Linear__* for .claude/settings.json permissions.allow", () => {
       expect(RETIRED_SETTINGS_ENTRIES).toBeDefined();
       const text = JSON.stringify(RETIRED_SETTINGS_ENTRIES);
       expect(text).toContain(".claude/settings.json");
       expect(text).toContain("permissions.allow");
       expect(text).toContain(RETIRED_LINEAR);
  -    expect(RETIRED_SETTINGS_ENTRIES).toHaveLength(1);
  +    expect(RETIRED_SETTINGS_ENTRIES).toHaveLength(11);
     });
  ```

- Task 10 `.bkit/core/engine/install/write.test.ts` "reports an edited variant as edited and never removes it" — taken over from Task 1; changed hands and passes after the rewrite: not proven failing, and never a gap

  ```diff
     it("reports an edited variant as edited and never removes it", () => {
  -    const edited = "mcp__claude_ai_Linear__get_issue";
  +    const edited = "mcp__claude_ai_Linear__my_own_tool";
       const doc = { permissions: { allow: [edited, "mcp__mine__*"] } };
       const found = findRetiredSettingsEntries(".claude/settings.json", doc as JsonValue);
       expect(found.retired).toHaveLength(0);
       expect(found.edited.length).toBeGreaterThan(0);
       expect(JSON.stringify(found.edited)).toContain(edited);
       const out = pruneRetiredSettingsEntries(".claude/settings.json", doc as JsonValue);
       expect(allowOf(out)).toEqual([edited, "mcp__mine__*"]);
     });
  ```

- Task 11 `.bkit/core/engine/install/write.test.ts` "does not report an entry the template ships as edited" — taken over from Task 1; changed hands and passes after the rewrite: not proven failing, and never a gap

  ```diff
     it("does not report an entry the template ships as edited", () => {
  -    const shipped = "mcp__claude_ai_Linear__get_issue";
  +    const shipped = "mcp__claude_ai_Linear__my_own_tool";
       const doc = { permissions: { allow: [shipped] } };
       const template = { permissions: { allow: [shipped] } };
       const found = findRetiredSettingsEntries(
         ".claude/settings.json",
         doc as JsonValue,
         template as JsonValue,
       );
       expect(found.edited).toHaveLength(0);
       expect(found.retired).toHaveLength(0);
     });
  ```

- Task 12 `.bkit/core/engine/install/write.test.ts` "keeps an edited variant and warns with the file and the entry" — taken over from Task 2; changed hands and passes after the rewrite: not proven failing, and never a gap

  ```diff
     it("keeps an edited variant and warns with the file and the entry", () => {
  -    const edited = "mcp__claude_ai_Linear__get_issue";
  +    const edited = "mcp__claude_ai_Linear__my_own_tool";
       const { src, dst } = seed(["Bash(*)", edited]);
       const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
       try {
         writeTier2JsonContained(src, dst, false, makeWriteSet());
         const after = JSON.parse(fs.readFileSync(dst, "utf-8"));
         expect(after.permissions.allow).toContain(edited);
         expect(warn).toHaveBeenCalled();
         const text = warn.mock.calls.map((c) => c.join(" ")).join("\n");
         expect(text).toContain(".claude/settings.json");
         expect(text).toContain(edited);
       } finally {
         warn.mockRestore();
       }
     });
  ```

- Task 13 `.bkit/core/engine/install/modules/claude.integration.test.ts` "dry run names an edited variant as kept" — taken over from Task 3; changed hands and passes after the rewrite: not proven failing, and never a gap

  ```diff
     it("dry run names an edited variant as kept", () => {
  -    const edited = "mcp__claude_ai_Linear__get_issue";
  +    const edited = "mcp__claude_ai_Linear__my_own_tool";
       seedSettings(["Bash(ls)", edited]);
       const ctx = makeCtx({ dryRun: true });
       runClaudeModule(ctx);
       const found = retiredAdvisories(ctx);
       expect(found).toHaveLength(1);
       expect(found[0]!.detect).toContain(edited);
       expect(found[0]!.detect).toMatch(/kept|edited/);
     });
  ```

