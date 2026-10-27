
> @cbartens/bkit@6.0.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/703-standardise-question-option
> vitest run --reporter=default --reporter=junit --outputFile.junit="$BKIT_TEST_REPORT" .bkit/core/engine/audits/workflows/question-option-format.test.ts


 RUN  v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/703-standardise-question-option

 ❯ .bkit/core/engine/audits/workflows/question-option-format.test.ts (14 tests | 1 failed) 89ms
   ❯ question option format: one layout across the corpus (8)
     ✓ counts the option lines found per directory 60ms
     ✓ the canonical layout letters every option and recommendation 1ms
     ✓ every option line in the workflows letters every entry 2ms
     ✓ every option line in the prompts, the templates and the authoring docs letters every entry 11ms
     ✓ every recommendation line in the workflows names a letter 1ms
     × every recommendation line in the templates and the prompts names a letter 9ms
     ✓ every open-question rule in the prompts names the lettered option form 3ms
     ✓ the plan template letters every option of its Open Questions placeholder 0ms
   ✓ question option format: the rules fire on a synthetic list (6)
     ✓ RED-PROOF: a synthetic `Options: A / B` line fires the option rule 0ms
     ✓ RED-PROOF: a synthetic `Options: Accept / Fix now` line fires the option rule 0ms
     ✓ RED-PROOF: a synthetic letterless `Recommended:` line fires the recommendation rule 0ms
     ✓ RED-PROOF: a second Options: list on one line still fires the option rule 0ms
     ✓ an option list whose entries span code spans letters every entry 0ms
     ✓ a lettered list of named options passes both rules 0ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/audits/workflows/question-option-format.test.ts > question option format: one layout across the corpus > every recommendation line in the templates and the prompts names a letter
AssertionError: expected [ Array(1) ] to deeply equal []

- Expected
+ Received

- []
+ [
+   ".bkit/core/docs/templates/bkit-plan.md:108: `Recommended: ** [A] — [why, 1 line]` — name the recommended letter",
+ ]

 ❯ .bkit/core/engine/audits/workflows/question-option-format.test.ts:249:73
    247|
    248|   it("every recommendation line in the templates and the prompts names…
    249|     expect(recommendationViolationsIn([PROMPTS, TEMPLATES, AUTHORING])…
       |                                                                         ^
    250|   });
    251|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 13 passed (14)
   Start at  06:38:12
   Duration  186ms (tests 73%, transform 20%, setup 4%, import 2%, worker 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-qWp7Nu/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
