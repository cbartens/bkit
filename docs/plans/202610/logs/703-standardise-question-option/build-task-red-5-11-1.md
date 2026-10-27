
> @cbartens/bkit@6.0.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/703-standardise-question-option
> vitest run --reporter=default --reporter=junit --outputFile.junit="$BKIT_TEST_REPORT" .bkit/core/engine/audits/workflows/question-option-format.test.ts


 RUN  v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/703-standardise-question-option

 ❯ .bkit/core/engine/audits/workflows/question-option-format.test.ts (16 tests | 1 failed) 98ms
   ❯ question option format: one layout across the corpus (10)
     ✓ counts the option lines found per directory 67ms
     ✓ the canonical layout letters every option and recommendation 1ms
     ✓ every option line in the workflows letters every entry 2ms
     ✓ every option line in the prompts, the templates and the authoring docs letters every entry 9ms
     ✓ every recommendation line in the workflows names a letter 1ms
     ✓ every recommendation line in the templates and the prompts names a letter 5ms
     ✓ every open-question rule in the prompts names the lettered option form 2ms
     ✓ every open-question rule in the prompts index names the lettered option form 6ms
     × the design review names every part the design prompts require 3ms
     ✓ the plan template letters every option of its Open Questions placeholder 0ms
   ✓ question option format: the rules fire on a synthetic list (6)
     ✓ RED-PROOF: a synthetic `Options: A / B` line fires the option rule 0ms
     ✓ RED-PROOF: a synthetic `Options: Accept / Fix now` line fires the option rule 0ms
     ✓ RED-PROOF: a synthetic letterless `Recommended:` line fires the recommendation rule 0ms
     ✓ RED-PROOF: a second Options: list on one line still fires the option rule 0ms
     ✓ an option list whose entries span code spans letters every entry 0ms
     ✓ a lettered list of named options passes both rules 0ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/audits/workflows/question-option-format.test.ts > question option format: one layout across the corpus > the design review names every part the design prompts require
AssertionError: .bkit/core/prompts/bkit-design-review-2.md does not name `Default if unanswered`: expected '8. Failure-mode coverage: cross-check…' to contain 'Default if unanswered'

Expected: "Default if unanswered"
Received: "8. Failure-mode coverage: cross-check `Risks & Open Questions` covers enumerated failure modes. Gaps → `OPTIONAL` or `CRITICAL` by `severity`. Any open questions lacking lettered options (`A)`, `B)`, `C)`) or a lettered `Recommended` → `OPTIONAL` findings naming missing parts."

 ❯ .bkit/core/engine/audits/workflows/question-option-format.test.ts:328:59
    326|       expect(rule, `${file} states no open-question rule`).not.toBe(""…
    327|       for (const part of OPEN_QUESTION_PARTS) {
    328|         expect(rule, `${file} does not name \`${part}\``).toContain(pa…
       |                                                           ^
    329|       }
    330|     }

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 15 passed (16)
   Start at  15:46:20
   Duration  186ms (tests 76%, transform 18%, setup 3%, worker 1%, import 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-z2shHz/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
