Verdict: PASS

<!-- verdict:end -->

# Build Plan Tests

## Test Log

SOURCE — TASK 9: exit 3/8/9 routes from .bkit/core/workflows/bkit-{design,plan,build,ship}.md Step 1 (e.g. bkit-build.md:354,368,398); debug exit 8 at bkit-debug.md:207
SOURCE — TASK 10: inline Options: rules from .bkit/core/prompts/bkit-plan-generate.md:48, bkit-design-generate.md:149; template placeholder .bkit/core/docs/templates/bkit-plan.md:106
WROTE — TASK 9: `.bkit/core/engine/audits/workflows/question-option-format.test.ts` `every workflow's Step 1 ambiguous-issue stop asks a formatted question`
WROTE — TASK 9: `.bkit/core/engine/audits/workflows/question-option-format.test.ts` `every workflow's Step 1 issue question shows Recommended: none and a Default if unanswered line`
WROTE — TASK 9: `.bkit/core/engine/audits/workflows/question-option-format.test.ts` `every workflow's Step 1 slug and bare-number stops show the Action needed line`
WROTE — TASK 9: `.bkit/core/engine/audits/workflows/question-option-format.test.ts` `the Step 1 issue question re-runs fids parse on the owner's answer file`
WROTE — TASK 10: `.bkit/core/engine/audits/workflows/question-option-format.test.ts` `the plan template letters every option of its Open Questions placeholder`
WROTE — TASK 10: `.bkit/core/engine/audits/workflows/question-option-format.test.ts` `the plan template puts each open-question option on its own line`
WROTE — TASK 10: `.bkit/core/engine/audits/workflows/question-option-format.test.ts` `every open-question rule in the prompts asks for one option per line`
WROTE — TASK 10: `.bkit/core/engine/audits/workflows/question-option-format.test.ts` `the design review flags an open question whose options share one line`
WROTE — TASK 10: `.bkit/core/engine/audits/workflows/question-option-format.test.ts` `the prompts index describes one option per line`
WROTE — TASK 10: `.bkit/core/engine/audits/workflows/question-option-format.test.ts` `no workflow, prompt, template or authoring doc carries an inline Options: list`
WROTE — TASK 10: `.bkit/core/engine/audits/workflows/question-option-format.test.ts` `every open-question writer asks for plain English`
