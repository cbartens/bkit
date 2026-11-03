
> @cbartens/bkit@6.0.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/705-build-plan-convert
> vitest run --reporter=default --reporter=junit --outputFile.junit="$BKIT_TEST_REPORT" .bkit/core/engine/tools/instructions-sources.test.ts


 RUN  v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/705-build-plan-convert

 ❯ .bkit/core/engine/tools/instructions-sources.test.ts (21 tests | 1 failed) 21ms
   ✓ rules and Project Rules (8)
     ✓ ruleBullets reads the bkit block and the Project Rules section, in file order 1ms
     ✓ parseRuleEntries reads id, text, retired and refs 1ms
     ✓ the fixture passes 0ms
     ✓ rule IDs match rules.md one to one 0ms
     ✓ a reworded rules.md bullet fails until sync retires the old text 0ms
     ✓ a refs section that does not exist fails 0ms
     ✓ refExists finds files, globs and headings in the repo 1ms
     ✓ the repo store matches rules.md 5ms
   ✓ Hook Text (4)
     ✓ hookMessages joins concatenated literals and keeps ${…} holes 0ms
     ✓ the fixture passes 0ms
     ✓ a message without an entry and an entry no longer emitted both fail 0ms
     ✓ every hook message has an entry and every entry is still emitted 4ms
   ✓ Permissions (4)
     ✓ the fixture passes 0ms
     ✓ a pattern missing, extra, doubled or miscounted fails 0ms
     ✓ an opencode permission block that differs fails 0ms
     ✓ shipped permission patterns and store groups match exactly 1ms
   ❯ Special Behaviors and Authoring Rules (5)
     ✓ catalogSection runs to the next heading of the same or a higher level, fences skipped 0ms
     ✓ the fixture passes 0ms
     ✓ an edited row or section fails until sync copies it 0ms
     ✓ a row with no entry fails 0ms
     × each Special Behaviors row and authoring section has one equal entry 6ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/tools/instructions-sources.test.ts > Special Behaviors and Authoring Rules > each Special Behaviors row and authoring section has one equal entry
AssertionError: expected [ Array(1) ] to deeply equal []

- Expected
+ Received

- []
+ [
+   "`cross-step-invariants`: text differs — run pnpm instructions:sync",
+ ]

 ❯ .bkit/core/engine/tools/instructions-sources.test.ts:367:40
    365|   it("each Special Behaviors row and authoring section has one equal e…
    366|     const cats = new Map(CATALOG_SOURCES.map((f) => [f, read(f)]));
    367|     expect(checkCatalogs(STORE, cats)).toEqual([]);
       |                                        ^
    368|   });
    369| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 20 passed (21)
   Start at  13:31:02
   Duration  109ms (transform 49%, tests 36%, import 7%, setup 7%, worker 2%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-jTBhLf/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
