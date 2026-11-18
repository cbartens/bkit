Enforced: true
Red: 0
Accepted: 2
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 3, attempt 1

Plan: `docs/plans/202611/1028-gate-fails-workflow-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 9 | `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts` "raise without a reason refuses and leaves the record unchanged" | passed-accepted | passes; accepted by the tests step: the test already wraps both refusal calls in expect(...).rejects.toThrow(/reason/) and the raiseCeilings export in scripts/gate/bkit-text-ceiling.mjs already satisfies it |
| 9 | `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts` "raise at a terminal shows the old and new ceilings and writes only after the typed confirmation" | passed-accepted | passes; accepted by the tests step: already wraps the declining call in rejects.toThrow(/cancelled\|confirmation/) and asserts the record is byte-identical; raiseCeilings in scripts/gate/bkit-text-ceiling.mjs satisfies it |

## Gaps

None.

## Lint output — `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts`

```

> @cbartens/bkit@6.2.0 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/1028-gate-fails-workflow
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/audits/repo/agent-text-ceiling.test.ts

```

## Runner output — `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts`

```

> @cbartens/bkit@6.2.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/1028-gate-fails-workflow
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/audits/repo/agent-text-ceiling.test.ts


 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/1028-gate-fails-workflow

 ✓ .bkit/core/engine/audits/repo/agent-text-ceiling.test.ts (14 tests) 1619ms
   ✓ bkit-text-ceiling missing folders and a broken record (2)
     ✓ check fails and lower refuses when a text folder is missing or empty 359ms

 Test Files  1 passed (1)
      Tests  14 passed (14)
   Start at  07:52:48
   Duration  1.80s (tests 97%, setup 2%, transform 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-ZNWbAu/junit.xml
```
