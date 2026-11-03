
> @cbartens/bkit@6.0.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/703-standardise-question-option
> vitest run --reporter=default --reporter=junit --outputFile.junit="$BKIT_TEST_REPORT" .bkit/core/engine/audits/workflows/question-option-format.test.ts


 RUN  v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/703-standardise-question-option

 ❯ .bkit/core/engine/audits/workflows/question-option-format.test.ts (13 tests | 2 failed) 38ms
   ✓ question option format: one layout across the corpus (7)
     ✓ counts the option lines found per directory 24ms
     ✓ the canonical layout letters every option and recommendation 1ms
     ✓ every option line in the workflows letters every entry 1ms
     ✓ every option line in the prompts, the templates and the authoring docs letters every entry 5ms
     ✓ every recommendation line in the workflows names a letter 1ms
     ✓ every open-question rule in the prompts names the lettered option form 2ms
     ✓ the plan template letters every option of its Open Questions placeholder 0ms
   ❯ question option format: the rules fire on a synthetic list (6)
     ✓ RED-PROOF: a synthetic `Options: A / B` line fires the option rule 0ms
     ✓ RED-PROOF: a synthetic `Options: Accept / Fix now` line fires the option rule 0ms
     ✓ RED-PROOF: a synthetic letterless `Recommended:` line fires the recommendation rule 0ms
     × RED-PROOF: a second Options: list on one line still fires the option rule 1ms
     × an option list whose entries span code spans letters every entry 1ms
     ✓ a lettered list of named options passes both rules 0ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 2 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/audits/workflows/question-option-format.test.ts > question option format: the rules fire on a synthetic list > RED-PROOF: a second Options: list on one line still fires the option rule
AssertionError: expected 0 to be greater than 0
 ❯ .bkit/core/engine/audits/workflows/question-option-format.test.ts:276:59
    274|     const line =
    275|       "the lettered option list `Options: A) {option} / B) {option}`, …
    276|     expect(optionViolations("synthetic.md", line).length).toBeGreaterT…
       |                                                           ^
    277|   });
    278|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/2]⎯

 FAIL  .bkit/core/engine/audits/workflows/question-option-format.test.ts > question option format: the rules fire on a synthetic list > an option list whose entries span code spans letters every entry
AssertionError: expected [] to deeply equal [ [ 'A) yes', 'no' ] ]

- Expected
+ Received

- [
-   [
-     "A) yes",
-     "no",
-   ],
- ]
+ []

 ❯ .bkit/core/engine/audits/workflows/question-option-format.test.ts:281:59
    279|   it("an option list whose entries span code spans letters every entry…
    280|     const line = "Options: `A) yes` / `no`";
    281|     expect(optionLists(line).map((list) => list.entries)).toEqual([["A…
       |                                                           ^
    282|     expect(optionViolations("synthetic.md", line)).toEqual([
    283|       "synthetic.md:1: `no` — write `B) {option}`",

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/2]⎯


 Test Files  1 failed (1)
      Tests  2 failed | 11 passed (13)
   Start at  06:37:37
   Duration  112ms (tests 61%, transform 28%, setup 6%, import 2%, worker 2%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-pgmFna/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
