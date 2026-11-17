Enforced: true
Red: 5
Accepted: 0
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 2, attempt 1

Plan: `docs/plans/202611/929-hung-test-never-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 3 | `scripts/ci/bkit-test-limits.test.mjs` "gives --test-timeout from the integration budget and --test-force-exit" | red-not-loaded | `scripts/ci/bkit-test-limits.test.mjs` did not load: test failed |
| 3 | `scripts/ci/bkit-test-limits.test.mjs` "gives the bats limit in whole seconds, 30 under CI" | red-not-loaded | `scripts/ci/bkit-test-limits.test.mjs` did not load: test failed |
| 4 | `.bkit/core/engine/audits/repo/test-file-script.integration.test.ts` "node — a test awaiting a child that never exits fails within the limit" | red | failure: : expected Error: spawnSync pnpm ETIMEDOUT { …(5) } to be undefined |
| 4 | `scripts/gate/bkit-gate-changed.test.mjs` "passes the limit args to the node --test stage" | red | failure: [bkit:gate:changed] related: vitest related --run --passWithNoTests scripts/gate/probe-15RHAv/gate-limit-probe.test.mjs RUN v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/929-hung-test-never No affected test files found, exiting with code 0 [bkit:gate:changed] named: node --test scripts/gate/bkit-gate-changed.test.mjs scripts/gate/probe-15RHAv/gate-limit-probe.test.mjs [bkit:gate:changed] format: prettier --check --ignore-unknown scripts/gate/probe-15RHAv/gate-limit-probe.test.mjs Checking formatting... All matched files use Prettier code style! [bkit:gate:changed] every stage passed [test-timeout-budget] load average 11.1 on 10 cores: unit limits 10050ms per test, 20100ms per hook (x2.01) (node:71496) Warning: node:test run() is being called recursively within a test file. skipping running files. (Use `node --trace-warnings ...` to show where the warning was created) |
| 4 | `.bkit/core/engine/audits/repo/bats-setup-suite.integration.test.ts` "a hanging bats test fails with timeout after" | red | failure: 1..1 : expected Error: spawnSync /Users/christian/Documen… { …(5) } to be undefined |

## Gaps

None.

## Lint output — `scripts/ci/bkit-test-limits.test.mjs`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/929-hung-test-never
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern scripts/ci/bkit-test-limits.test.mjs

```

## Runner output — `scripts/ci/bkit-test-limits.test.mjs`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/929-hung-test-never
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs scripts/ci/bkit-test-limits.test.mjs

node:internal/modules/esm/resolve:271
    throw new ERR_MODULE_NOT_FOUND(
          ^

Error [ERR_MODULE_NOT_FOUND]: Cannot find module '/Users/christian/Documents/GitHub/bkit/.worktrees/929-hung-test-never/scripts/ci/bkit-test-limits.mjs' imported from /Users/christian/Documents/GitHub/bkit/.worktrees/929-hung-test-never/scripts/ci/bkit-test-limits.test.mjs
    at finalizeResolution (node:internal/modules/esm/resolve:271:11)
    at moduleResolve (node:internal/modules/esm/resolve:865:10)
    at defaultResolve (node:internal/modules/esm/resolve:992:11)
    at #cachedDefaultResolve (node:internal/modules/esm/loader:691:20)
    at #resolveAndMaybeBlockOnLoaderThread (node:internal/modules/esm/loader:708:38)
    at ModuleLoader.resolveSync (node:internal/modules/esm/loader:740:52)
    at #resolve (node:internal/modules/esm/loader:673:17)
    at ModuleLoader.getOrCreateModuleJob (node:internal/modules/esm/loader:593:35)
    at ModuleJob.syncLink (node:internal/modules/esm/module_job:163:33)
    at ModuleJob.link (node:internal/modules/esm/module_job:253:17) {
  code: 'ERR_MODULE_NOT_FOUND',
  url: 'file:///Users/christian/Documents/GitHub/bkit/.worktrees/929-hung-test-never/scripts/ci/bkit-test-limits.mjs'
}

Node.js v24.16.0
✖ scripts/ci/bkit-test-limits.test.mjs (109.939875ms)
ℹ tests 1
ℹ suites 0
ℹ pass 0
ℹ fail 1
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 126.890333

✖ failing tests:

test at scripts/ci/bkit-test-limits.test.mjs:1:1
✖ scripts/ci/bkit-test-limits.test.mjs (109.939875ms)
  'test failed'
 ELIFECYCLE  Command failed with exit code 1.
```

## Lint output — `.bkit/core/engine/audits/repo/test-file-script.integration.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/929-hung-test-never
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/audits/repo/test-file-script.integration.test.ts

```

## Runner output — `.bkit/core/engine/audits/repo/test-file-script.integration.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/929-hung-test-never
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/audits/repo/test-file-script.integration.test.ts

[test-timeout-budget] load average 34.8 on 10 cores: unit limits 21900ms per test, 43800ms per hook (x4.38)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/929-hung-test-never

 ❯ .bkit/core/engine/audits/repo/test-file-script.integration.test.ts (17 tests | 1 failed) 122826ms
   ✓ protects every declared local test and gate entry point 42ms
   ✓ bkit:test:file runs every test file kind into a JUnit report (9)
     ✓ node — scripts/ci/bkit-test-awake.test.mjs reports its named test passed 12561ms
     ✓ bats — tests/shell/bkit-gh-stub.bats reports its named test passed 2442ms
     ✓ node — scripts/harvest/bkit-harvest.test.mjs reports its named test passed 2219ms
     ✓ vitest — .bkit/core/engine/audits/repo/config-ke… reports its named test passed 1256ms
     ✓ node — with no report path the test file is left as it was 6986ms
     ✓ bats — with no report path the test file is left as it was 2153ms
     ✓ node — with no report path the test file is left as it was 1788ms
     ✓ vitest — with no report path the test file is left as it was 1198ms
     ✓ a run naming files of two kinds is refused as a usage error 889ms
   ✓ bkit:test:file reports a failing test file kind as a red (2)
     ✓ node — a failing probe.test.mjs exits non-zero with a <failure> for its named test 1210ms
     ✓ bats — a failing probe.bats exits non-zero with a <failure> for its named test 1676ms
   ✓ bkit:lint:file passes a test file its linter does not cover (4)
     ✓ node — scripts/ci/bkit-test-awake.test.mjs lints clean 609ms
     ✓ bats — tests/shell/bkit-gh-stub.bats lints clean 612ms
     ✓ node — scripts/harvest/bkit-harvest.test.mjs lints clean 1325ms
     ✓ vitest — .bkit/core/engine/audits/repo/config-ke… lints clean 776ms
   ❯ bkit:test:file ends a node --test file whose test awaits a child that never exits (1)
     × node — a test awaiting a child that never exits fails within the limit 85077ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/audits/repo/test-file-script.integration.test.ts > bkit:test:file ends a node --test file whose test awaits a child that never exits > node — a test awaiting a child that never exits fails within the limit
AssertionError: 
: expected Error: spawnSync pnpm ETIMEDOUT { …(5) } to be undefined

- Expected:
undefined

+ Received:
Error {
  "message": "spawnSync pnpm ETIMEDOUT",
  "errno": -60,
  "code": "ETIMEDOUT",
  "syscall": "spawnSync pnpm",
  "path": "pnpm",
  "spawnargs": [
    "-s",
    "bkit:test:file",
    "/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-file-gUZZW1/hang.test.mjs",
  ],
}

 ❯ .bkit/core/engine/audits/repo/test-file-script.integration.test.ts:190:57
    188|       });
    189|       const elapsed = Date.now() - started;
    190|       expect(res.error, `${res.stdout}\n${res.stderr}`).toBeUndefined(…
       |                                                         ^
    191|       expect(res.status, `${res.stdout}\n${res.stderr}`).toBe(1);
    192|       expect(elapsed).toBeLessThan(80_000);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 16 passed (17)
   Start at  15:57:09
   Duration  124.36s (tests 99%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-c2djnV/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```

## Lint output — `scripts/gate/bkit-gate-changed.test.mjs`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/929-hung-test-never
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern scripts/gate/bkit-gate-changed.test.mjs

```

## Runner output — `scripts/gate/bkit-gate-changed.test.mjs`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/929-hung-test-never
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs scripts/gate/bkit-gate-changed.test.mjs

✔ format skips a changed symlink instead of failing on it (779.582125ms)
✔ format still fails a changed regular file prettier would rewrite (943.750458ms)
✖ passes the limit args to the node --test stage (852.636209ms)
ℹ tests 3
ℹ suites 0
ℹ pass 2
ℹ fail 1
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2647.18525

✖ failing tests:

test at scripts/gate/bkit-gate-changed.test.mjs:42:1
✖ passes the limit args to the node --test stage (852.636209ms)
  AssertionError [ERR_ASSERTION]: 
  [bkit:gate:changed] related: vitest related --run --passWithNoTests scripts/gate/probe-15RHAv/gate-limit-probe.test.mjs
  
   RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/929-hung-test-never
  
  No affected test files found, exiting with code 0
  
  
  [bkit:gate:changed] named: node --test scripts/gate/bkit-gate-changed.test.mjs scripts/gate/probe-15RHAv/gate-limit-probe.test.mjs
  
  [bkit:gate:changed] format: prettier --check --ignore-unknown scripts/gate/probe-15RHAv/gate-limit-probe.test.mjs
  Checking formatting...
  All matched files use Prettier code style!
  
  [bkit:gate:changed] every stage passed
  [test-timeout-budget] load average 11.1 on 10 cores: unit limits 10050ms per test, 20100ms per hook (x2.01)
  (node:71496) Warning: node:test run() is being called recursively within a test file. skipping running files.
  (Use `node --trace-warnings ...` to show where the warning was created)
  
      at TestContext.<anonymous> (file:///Users/christian/Documents/GitHub/bkit/.worktrees/929-hung-test-never/scripts/gate/bkit-gate-changed.test.mjs:51:10)
      at Test.runInAsyncScope (node:async_hooks:227:14)
      at Test.run (node:internal/test_runner/test:1306:25)
      at Test.processPendingSubtests (node:internal/test_runner/test:897:18)
      at Test.postRun (node:internal/test_runner/test:1447:19)
      at Test.run (node:internal/test_runner/test:1372:12)
      at async Test.processPendingSubtests (node:internal/test_runner/test:897:7) {
    generatedMessage: false,
    code: 'ERR_ASSERTION',
    actual: '\n[bkit:gate:changed] related: vitest related --run --passWithNoTests scripts/gate/probe-15RHAv/gate-limit-probe.test.mjs\n\n RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/929-hung-test-never\n\nNo affected test files found, exiting with code 0\n\n\n[bkit:gate:changed] named: node --test scripts/gate/bkit-gate-changed.test.mjs scripts/gate/probe-15RHAv/gate-limit-probe.test.mjs\n\n[bkit:gate:changed] format: prettier --check --ignore-unknown scripts/gate/probe-15RHAv/gate-limit-probe.test.mjs\nChecking formatting...\nAll matched files use Prettier code style!\n\n[bkit:gate:changed] every stage passed\n[test-timeout-budget] load average 11.1 on 10 cores: unit limits 10050ms per test, 20100ms per hook (x2.01)\n(node:71496) Warning: node:test run() is being called recursively within a test file. skipping running files.\n(Use `node --trace-warnings ...` to show where the warning was created)\n',
    expected: /named: node --test .*--test-timeout=\d+/,
    operator: 'match',
    diff: 'simple'
  }
 ELIFECYCLE  Command failed with exit code 1.
```

## Lint output — `.bkit/core/engine/audits/repo/bats-setup-suite.integration.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/929-hung-test-never
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/audits/repo/bats-setup-suite.integration.test.ts

```

## Runner output — `.bkit/core/engine/audits/repo/bats-setup-suite.integration.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/929-hung-test-never
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/audits/repo/bats-setup-suite.integration.test.ts

[test-timeout-budget] load average 10.5 on 10 cores: unit limits 9750ms per test, 19500ms per hook (x1.95)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/929-hung-test-never

 ❯ .bkit/core/engine/audits/repo/bats-setup-suite.integration.test.ts (1 test | 1 failed) 85103ms
   × a hanging bats test fails with timeout after 85102ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/audits/repo/bats-setup-suite.integration.test.ts > a hanging bats test fails with timeout after
AssertionError: 1..1

: expected Error: spawnSync /Users/christian/Documen… { …(5) } to be undefined

- Expected:
undefined

+ Received:
Error {
  "message": "spawnSync /Users/christian/Documents/GitHub/bkit/.worktrees/929-hung-test-never/node_modules/.bin/bats ETIMEDOUT",
  "errno": -60,
  "code": "ETIMEDOUT",
  "syscall": "spawnSync /Users/christian/Documents/GitHub/bkit/.worktrees/929-hung-test-never/node_modules/.bin/bats",
  "path": "/Users/christian/Documents/GitHub/bkit/.worktrees/929-hung-test-never/node_modules/.bin/bats",
  "spawnargs": [
    "/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-bats-suite-Yp1Pjw",
  ],
}

 ❯ .bkit/core/engine/audits/repo/bats-setup-suite.integration.test.ts:40:26
     38|   });
     39|   const out = `${res.stdout}\n${res.stderr}`;
     40|   expect(res.error, out).toBeUndefined();
       |                          ^
     41|   expect(res.status, out).not.toBe(0);
     42|   expect(out).toContain("timeout after");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed (1)
   Start at  15:59:19
   Duration  85.33s (tests 100%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-SHZnCR/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
