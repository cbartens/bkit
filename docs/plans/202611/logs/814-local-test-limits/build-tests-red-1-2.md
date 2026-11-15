Enforced: true
Red: 1
Accepted: 0
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 1, attempt 2

Plan: `docs/plans/202611/814-local-test-limits-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 3 | `.bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts` "CONTROL — a bare numeric test limit is caught" | red | failure: limitFactor is not a function |

## Gaps

None.

## Lint output — `.bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/814-local-test-limits
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts

```

## Runner output — `.bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/814-local-test-limits
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts

[test-timeout-budget] load average 4.3 on 10 cores: unit limits 6650ms per test, 13300ms per hook (x1.33)

 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/814-local-test-limits

 ❯ .bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts (15 tests | 10 failed) 57ms
   ❯ the test budget is CI-strict and a fixed multiple locally (7)
     × limitFactor returns 1 under CI 2ms
     × limitFactor returns LOCAL_HANG_FACTOR off CI 1ms
     × tierTimeouts gives the strict bases under CI 0ms
     × tierTimeouts gives 6x the bases locally 0ms
     × localLimit scales a file's own limit locally only 0ms
     ✓ keeps the 5s unit and 30s integration bases 0ms
     × the budget reads no load 1ms
   ❯ the configs read the fixed budget (2)
     × vitest.config.ts spreads unitTimeouts and plans no load 0ms
     × the bats local default matches the integration hang limit 1ms
   ❯ no test file sets a bare limit (2)
     × no test file sets a bare numeric test or hook limit 51ms
     × CONTROL — a bare numeric test limit is caught 0ms
   ✓ the runners re-read the budget per test file (4)
     ✓ vitest.config.ts spreads the unit budget 0ms
     ✓ vitest.setup.ts re-reads it with vi.setConfig 0ms
     ✓ CONTROL — a setup that hard-codes a timeout is caught 0ms
     ✓ CONTROL — a config without the spread is caught 0ms

⎯⎯⎯⎯⎯⎯ Failed Tests 10 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts > the test budget is CI-strict and a fixed multiple locally > limitFactor returns 1 under CI
TypeError: limitFactor is not a function
 ❯ .bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts:33:12
     31|
     32|   it("limitFactor returns 1 under CI", () => {
     33|     expect(limitFactor({ CI: "true" })).toBe(1);
       |            ^
     34|     expect(limitFactor({ CI: "1" })).toBe(1);
     35|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/10]⎯

 FAIL  .bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts > the test budget is CI-strict and a fixed multiple locally > limitFactor returns LOCAL_HANG_FACTOR off CI
AssertionError: expected undefined to be 6 // Object.is equality

- Expected:
6

+ Received:
undefined

 ❯ .bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts:38:31
     36|
     37|   it("limitFactor returns LOCAL_HANG_FACTOR off CI", () => {
     38|     expect(LOCAL_HANG_FACTOR).toBe(6);
       |                               ^
     39|     expect(limitFactor({})).toBe(LOCAL_HANG_FACTOR);
     40|     expect(limitFactor({ CI: "" })).toBe(LOCAL_HANG_FACTOR);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/10]⎯

 FAIL  .bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts > the test budget is CI-strict and a fixed multiple locally > tierTimeouts gives the strict bases under CI
TypeError: limitFactor is not a function
 ❯ .bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts:45:20
     43|
     44|   it("tierTimeouts gives the strict bases under CI", () => {
     45|     const factor = limitFactor({ CI: "true" });
       |                    ^
     46|     expect(tierTimeouts(false, factor)).toEqual({ testTimeout: 5_000, …
     47|     expect(tierTimeouts(true, factor)).toEqual({ testTimeout: 30_000, …

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/10]⎯

 FAIL  .bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts > the test budget is CI-strict and a fixed multiple locally > tierTimeouts gives 6x the bases locally
TypeError: limitFactor is not a function
 ❯ .bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts:51:20
     49|
     50|   it("tierTimeouts gives 6x the bases locally", () => {
     51|     const factor = limitFactor({});
       |                    ^
     52|     expect(tierTimeouts(false, factor)).toEqual({ testTimeout: 30_000,…
     53|     expect(tierTimeouts(true, factor)).toEqual({ testTimeout: 180_000,…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/10]⎯

 FAIL  .bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts > the test budget is CI-strict and a fixed multiple locally > localLimit scales a file's own limit locally only
TypeError: limitFactor is not a function
 ❯ .bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts:57:31
     55|
     56|   it("localLimit scales a file's own limit locally only", () => {
     57|     expect(localLimit(60_000, limitFactor({ CI: "true" }))).toBe(60_00…
       |                               ^
     58|     expect(localLimit(60_000, limitFactor({}))).toBe(360_000);
     59|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/10]⎯

 FAIL  .bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts > the test budget is CI-strict and a fixed multiple locally > the budget reads no load
AssertionError: expected true to be false // Object.is equality

- Expected
+ Received

- false
+ true

 ❯ .bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts:68:31
     66|   it("the budget reads no load", () => {
     67|     const readsLoad = (src: string) => /loadavg|availableParallelism|P…
     68|     expect(readsLoad(budget)).toBe(false);
       |                               ^
     69|     // CONTROL: a source that calls os.loadavg() is caught
     70|     expect(readsLoad("const l = os.loadavg()[0];")).toBe(true);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[6/10]⎯

 FAIL  .bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts > the configs read the fixed budget > vitest.config.ts spreads unitTimeouts and plans no load
AssertionError: expected 'import * as path from "node:path";\n\…' not to match /planUnitLoad/

- Expected:
/planUnitLoad/

+ Received:
"import * as path from \"node:path\";

import { defineConfig } from \"vitest/config\";

import { planUnitLoad, unitTimeouts } from \"./vitest.timeout-budget.ts\";
import { testWorkers } from \"./vitest.test-lock.ts\";



planUnitLoad();



const reportDir = process.env.BKIT_TEST_REPORT_DIR;
const junit = reportDir
  ? {
      reporters: [\"default\", \"junit\"],
      outputFile: { junit: path.join(reportDir, `vitest-${process.pid}.xml`) },
    }
  : {};

export default defineConfig({
  test: {
    include: [
      \".bkit/core/engine*.test.ts\",
      \".bkit/core/engine*.integration.test.ts\",
      \"scripts/harvest*.test.ts\",
    ],



    setupFiles: [\"./vitest.setup.ts\"],
    globalSetup: [\"./vitest.test-lock.ts\"],
    ...testWorkers(),



    ...unitTimeouts(),
    ...junit,




    coverage: {
      provider: \"v8\",







      reporter: [[\"text\", { skipFull: false }], \"json-summary\", \"json\"],
      reportOnFailure: true,
    },
  },
});
"

 ❯ .bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts:78:24
     76|     const config = code("vitest.config.ts");
     77|     expect(config).toMatch(/\.\.\.unitTimeouts\(\)/);
     78|     expect(config).not.toMatch(/planUnitLoad/);
       |                        ^
     79|     // CONTROL: a config that still plans the load is caught
     80|     expect(/planUnitLoad/.test("planUnitLoad();\n...unitTimeouts()")).…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[7/10]⎯

 FAIL  .bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts > the configs read the fixed budget > the bats local default matches the integration hang limit
AssertionError: expected '180' to be 'NaN' // Object.is equality

Expected: "NaN"
Received: "180"

 ❯ .bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts:88:64
     86|       /else\s+export BATS_TEST_TIMEOUT="\$\{BATS_TEST_TIMEOUT:-(\d+)\}…
     87|     const expected = String((INTEGRATION_TEST_TIMEOUT_MS * LOCAL_HANG_…
     88|     expect(localDefault(read("tests/shell/setup_suite.bash"))).toBe(ex…
       |                                                                ^
     89|     // CONTROL: a mismatched value is caught
     90|     const bad = 'else\n    export BATS_TEST_TIMEOUT="${BATS_TEST_TIMEO…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[8/10]⎯

 FAIL  .bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts > no test file sets a bare limit > no test file sets a bare numeric test or hook limit
AssertionError: expected [ …(22) ] to deeply equal []

- Expected
+ Received

- []
+ [
+   ".bkit/core/engine/audits/hooks/antigravity-hook-commands.integration.test.ts",
+   ".bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts",
+   ".bkit/core/engine/audits/repo/bats-setup-suite.integration.test.ts",
+   ".bkit/core/engine/audits/repo/json-parse-owner.test.ts",
+   ".bkit/core/engine/audits/repo/test-file-script.integration.test.ts",
+   ".bkit/core/engine/audits/repo/vitest-child-deadline.test.ts",
+   ".bkit/core/engine/audits/templates/ci-scripts.test.ts",
+   ".bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts",
+   ".bkit/core/engine/audits/templates/machine-lock.integration.test.ts",
+   ".bkit/core/engine/audits/workflows/workflow-fence-syntax.test.ts",
+   ".bkit/core/engine/commands/ci/ci.test.ts",
+   ".bkit/core/engine/commands/install/check.integration.test.ts",
+   ".bkit/core/engine/commands/install/install.integration.test.ts",
+   ".bkit/core/engine/commands/install/upgrade.integration.test.ts",
+   ".bkit/core/engine/commands/workflow/disk.test.ts",
+   ".bkit/core/engine/commands/workflow/run-facts.test.ts",
+   ".bkit/core/engine/commands/workflow/runs.test.ts",
+   ".bkit/core/engine/commands/workflow/worktrees.integration.test.ts",
+   ".bkit/core/engine/commands/workflow/worktrees.test.ts",
+   ".bkit/core/engine/install/cloud-env.integration.test.ts",
+   ".bkit/core/engine/install/modules/core.integration.test.ts",
+   ".bkit/core/engine/tools/instructions-coverage.test.ts",
+ ]

 ❯ .bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts:110:23
    108|     );
    109|     const offenders = files.filter((f) => BARE.test(read(f)));
    110|     expect(offenders).toEqual([]);
       |                       ^
    111|   });
    112|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[9/10]⎯

 FAIL  .bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts > no test file sets a bare limit > CONTROL — a bare numeric test limit is caught
TypeError: limitFactor is not a function
 ❯ .bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts:118:31
    116|     expect(BARE.test('it("x", { timeout: localLimit(30_000) }, fn)')).…
    117|     // the wrapped form the guard accepts really is scaled by the fixe…
    118|     expect(localLimit(30_000, limitFactor({}))).toBe(30_000 * LOCAL_HA…
       |                               ^
    119|   });
    120| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[10/10]⎯


 Test Files  1 failed (1)
      Tests  10 failed | 5 passed (15)
   Start at  13:50:27
   Duration  160ms (tests 68%, setup 22%, transform 5%, worker 2%, import 2%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-fv9eHY/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
