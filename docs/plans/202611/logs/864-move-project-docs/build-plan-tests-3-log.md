Verdict: PASS

<!-- verdict:end -->

# Build Plan Tests

## Test Log

SOURCE — TASK 9: fs.readFileSync reads in detectProjectDocs from .bkit/core/engine/install/project-docs.ts:239
WROTE — TASK 9: `.bkit/core/engine/checks/after/tools.test.ts` `resolves an indexed equivalent without a missing default warning` (repaired in place via vi.mock("node:fs") pass-through)
PASSES — TASK 9: `.bkit/core/engine/checks/after/tools.test.ts` `keeps an indexed equivalent warning-free and in-tree without spying on the fs namespace`: detectProjectDocs already resolves indexed equivalents and skips out-of-tree targets (task 5 code)
