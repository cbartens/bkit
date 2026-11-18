Enforced: true
Red: 1
Accepted: 0
Updated: 1
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 4, attempt 1

Plan: `docs/plans/202611/1028-gate-fails-workflow-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 10 | `scripts/gate/bkit-gate-changed.test.mjs` "a changed workflow or prompt file runs the text ceiling test" | red | failure: [bkit:gate:changed] related: vitest related --run --passWithNoTests .bkit/core/workflows/bkit-auto.md RUN v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/1028-gate-fails-workflow No affected test files found, exiting with code 0 [bkit:gate:changed] named: vitest run --passWithNoTests .bkit/core/engine/audits/workflows/auto-fid-guard.test.ts .bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts .bkit/core/engine/audits/workflows/generated-marker.test.ts .bkit/core/engine/audits/workflows/runtime-prose-audit.test.ts RUN v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/1028-gate-fails-workflow Test Files 4 passed (4) Tests 160 passed (160) Start at 09:34:23 Duration 546ms (setup 42%, tests 20%, transform 15%, import 13%, worker 9%) [bkit:gate:changed] format: prettier --check --ignore-unknown .bkit/core/workflows/bkit-auto.md Checking formatting... All matched files use Prettier code style! [bkit:gate:changed] every stage passed |
| 11 | `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts` "raise from a non-interactive caller refuses and leaves the record unchanged" | updated | taken over from TASK 8; it existed before the run (`a24d435a6`) and passes: the verifier judges its diff — it may add expectations, never remove or loosen one |

## Gaps

None.

## Lint output — `scripts/gate/bkit-gate-changed.test.mjs`

```

> @cbartens/bkit@6.2.0 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/1028-gate-fails-workflow
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern scripts/gate/bkit-gate-changed.test.mjs

```

## Runner output — `scripts/gate/bkit-gate-changed.test.mjs`

```

> @cbartens/bkit@6.2.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/1028-gate-fails-workflow
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs scripts/gate/bkit-gate-changed.test.mjs

✔ format skips a changed symlink instead of failing on it (1177.449125ms)
✔ format still fails a changed regular file prettier would rewrite (1328.137375ms)
✔ passes the limit args to the node --test stage (1353.311333ms)
✖ a changed workflow or prompt file runs the text ceiling test (2334.924667ms)
ℹ tests 4
ℹ suites 0
ℹ pass 3
ℹ fail 1
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 6271.267708

✖ failing tests:

test at scripts/gate/bkit-gate-changed.test.mjs:55:1
✖ a changed workflow or prompt file runs the text ceiling test (2334.924667ms)
  AssertionError [ERR_ASSERTION]: 
  [bkit:gate:changed] related: vitest related --run --passWithNoTests .bkit/core/workflows/bkit-auto.md
  
   RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/1028-gate-fails-workflow
  
  No affected test files found, exiting with code 0
  
  
  [bkit:gate:changed] named: vitest run --passWithNoTests .bkit/core/engine/audits/workflows/auto-fid-guard.test.ts .bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts .bkit/core/engine/audits/workflows/generated-marker.test.ts .bkit/core/engine/audits/workflows/runtime-prose-audit.test.ts
  
   RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/1028-gate-fails-workflow
  
  
   Test Files  4 passed (4)
        Tests  160 passed (160)
     Start at  09:34:23
     Duration  546ms (setup 42%, tests 20%, transform 15%, import 13%, worker 9%)
  
  
  [bkit:gate:changed] format: prettier --check --ignore-unknown .bkit/core/workflows/bkit-auto.md
  Checking formatting...
  All matched files use Prettier code style!
  
  [bkit:gate:changed] every stage passed
  
      at TestContext.<anonymous> (file:///Users/christian/Documents/GitHub/bkit/.worktrees/1028-gate-fails-workflow/scripts/gate/bkit-gate-changed.test.mjs:60:12)
      at Test.runInAsyncScope (node:async_hooks:227:14)
      at Test.run (node:internal/test_runner/test:1306:25)
      at Test.processPendingSubtests (node:internal/test_runner/test:897:18)
      at Test.postRun (node:internal/test_runner/test:1447:19)
      at Test.run (node:internal/test_runner/test:1372:12)
      at async Test.processPendingSubtests (node:internal/test_runner/test:897:7) {
    generatedMessage: false,
    code: 'ERR_ASSERTION',
    actual: '\n[bkit:gate:changed] related: vitest related --run --passWithNoTests .bkit/core/workflows/bkit-auto.md\n\n RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/1028-gate-fails-workflow\n\nNo affected test files found, exiting with code 0\n\n\n[bkit:gate:changed] named: vitest run --passWithNoTests .bkit/core/engine/audits/workflows/auto-fid-guard.test.ts .bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts .bkit/core/engine/audits/workflows/generated-marker.test.ts .bkit/core/engine/audits/workflows/runtime-prose-audit.test.ts\n\n RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/1028-gate-fails-workflow\n\n\n Test Files  4 passed (4)\n      Tests  160 passed (160)\n   Start at  09:34:23\n   Duration  546ms (setup 42%, tests 20%, transform 15%, import 13%, worker 9%)\n\n\n[bkit:gate:changed] format: prettier --check --ignore-unknown .bkit/core/workflows/bkit-auto.md\nChecking formatting...\nAll matched files use Prettier code style!\n\n[bkit:gate:changed] every stage passed\n',
    expected: /named: vitest run .*agent-text-ceiling\.test\.ts/,
    operator: 'match',
    diff: 'simple'
  }
 ELIFECYCLE  Command failed with exit code 1.
```

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

 ✓ .bkit/core/engine/audits/repo/agent-text-ceiling.test.ts (14 tests) 1596ms
   ✓ bkit-text-ceiling missing folders and a broken record (2)
     ✓ check fails and lower refuses when a text folder is missing or empty 334ms

 Test Files  1 passed (1)
      Tests  14 passed (14)
   Start at  09:34:25
   Duration  1.80s (tests 96%, setup 3%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-0DfmFr/junit.xml
```
