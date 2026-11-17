Enforced: true
Red: 22
Accepted: 0
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 2, attempt 1

Plan: `docs/plans/202611/891-build-gate-stuck-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 4 | `.bkit/core/engine/commands/workflow/tests-base.test.ts` "baseVerdict > all when every failing case also fails at base" | red-not-loaded | `.bkit/core/engine/commands/workflow/tests-base.test.ts` did not load: Cannot find module './tests-base' imported from /Users/christian/Documents/GitHub/bkit/.worktrees/891-build-gate-stuck/.bkit/core/engine/commands/workflow/tests-base.test.ts |
| 4 | `.bkit/core/engine/commands/workflow/tests-base.test.ts` "baseVerdict > some with the base-red and branch counts" | red-not-loaded | `.bkit/core/engine/commands/workflow/tests-base.test.ts` did not load: Cannot find module './tests-base' imported from /Users/christian/Documents/GitHub/bkit/.worktrees/891-build-gate-stuck/.bkit/core/engine/commands/workflow/tests-base.test.ts |
| 4 | `.bkit/core/engine/commands/workflow/tests-base.test.ts` "baseVerdict > none when each case passes, is absent, or its file is absent at base" | red-not-loaded | `.bkit/core/engine/commands/workflow/tests-base.test.ts` did not load: Cannot find module './tests-base' imported from /Users/christian/Documents/GitHub/bkit/.worktrees/891-build-gate-stuck/.bkit/core/engine/commands/workflow/tests-base.test.ts |
| 4 | `.bkit/core/engine/commands/workflow/tests-base.test.ts` "baseVerdict > unknown with a reason when no case is base-red and one is undetermined" | red-not-loaded | `.bkit/core/engine/commands/workflow/tests-base.test.ts` did not load: Cannot find module './tests-base' imported from /Users/christian/Documents/GitHub/bkit/.worktrees/891-build-gate-stuck/.bkit/core/engine/commands/workflow/tests-base.test.ts |
| 4 | `.bkit/core/engine/commands/workflow/tests-base.test.ts` "caseFile > resolves from file, then a classname path, then one matching tracked basename" | red-not-loaded | `.bkit/core/engine/commands/workflow/tests-base.test.ts` did not load: Cannot find module './tests-base' imported from /Users/christian/Documents/GitHub/bkit/.worktrees/891-build-gate-stuck/.bkit/core/engine/commands/workflow/tests-base.test.ts |
| 4 | `.bkit/core/engine/commands/workflow/tests-base.test.ts` "caseFile > a classname matching two tracked basenames leaves the case undetermined" | red-not-loaded | `.bkit/core/engine/commands/workflow/tests-base.test.ts` did not load: Cannot find module './tests-base' imported from /Users/christian/Documents/GitHub/bkit/.worktrees/891-build-gate-stuck/.bkit/core/engine/commands/workflow/tests-base.test.ts |
| 4 | `.bkit/core/engine/commands/workflow/tests-base.test.ts` "caseFile > an untracked or outside-repo file attribute leaves the case undetermined" | red-not-loaded | `.bkit/core/engine/commands/workflow/tests-base.test.ts` did not load: Cannot find module './tests-base' imported from /Users/christian/Documents/GitHub/bkit/.worktrees/891-build-gate-stuck/.bkit/core/engine/commands/workflow/tests-base.test.ts |
| 4 | `.bkit/core/engine/commands/workflow/tests-base.test.ts` "baseVerdict > unknown when a red gate has no failing case" | red-not-loaded | `.bkit/core/engine/commands/workflow/tests-base.test.ts` did not load: Cannot find module './tests-base' imported from /Users/christian/Documents/GitHub/bkit/.worktrees/891-build-gate-stuck/.bkit/core/engine/commands/workflow/tests-base.test.ts |
| 5 | `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts` "bkit tests base > reports all from a local run at the merge-base" | red | failure: expected 2 to be +0 // Object.is equality |
| 5 | `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts` "bkit tests base > a failing file absent at the base commit is the branch's" | red | failure: expected 2 to be +0 // Object.is equality |
| 5 | `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts` "bkit tests base > no JUnit report reads unknown" | red | failure: expected 2 to be +0 // Object.is equality |
| 5 | `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts` "bkit tests base > an undeclared bkit:test:file reads unknown" | red | failure: expected 2 to be +0 // Object.is equality |
| 5 | `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts` "bkit tests base > a failed base install reads unknown and removes the worktree" | red | failure: expected 2 to be +0 // Object.is equality |
| 5 | `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts` "bkit tests base > installs at base with --frozen-lockfile --prefer-offline" | red | failure: expected 2 to be +0 // Object.is equality |
| 5 | `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts` "bkit tests base > copies the worktreeCopy entries into the base checkout" | red | failure: expected 2 to be +0 // Object.is equality |
| 5 | `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts` "bkit tests base > no origin/dev ref reads unknown" | red | failure: expected 2 to be +0 // Object.is equality |
| 5 | `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts` "bkit tests base > a base file run that writes no report reads unknown" | red | failure: expected 2 to be +0 // Object.is equality |
| 5 | `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts` "bkit tests base > a missing required flag is a usage error" | red | failure: expected '[bkit-tests] unknown verb "base" — ru…' to contain '--log' |
| 6 | `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts` "bkit tests base > a passing CI run at the exact base sha settles none without a local run" | red | failure: expected 2 to be +0 // Object.is equality |
| 6 | `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts` "bkit tests base > a CI run that cannot settle the base falls back to the local run" | red | failure: skipped lane: expected 2 to be +0 // Object.is equality |
| 6 | `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts` "bkit tests base > adopt follows the run's runtimeWorktrees" | red | failure: Cannot read properties of undefined (reading 'adopt') |
| 6 | `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts` "bkit tests base > worktreeInstall off reads unknown" | red | failure: expected 2 to be +0 // Object.is equality |

## Gaps

None.

## Lint output — `.bkit/core/engine/commands/workflow/tests-base.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/891-build-gate-stuck
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/workflow/tests-base.test.ts

```

## Runner output — `.bkit/core/engine/commands/workflow/tests-base.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/891-build-gate-stuck
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/workflow/tests-base.test.ts

[test-timeout-budget] load average 12.9 on 10 cores: unit limits 10950ms per test, 21900ms per hook (x2.19)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/891-build-gate-stuck

 ❯ .bkit/core/engine/commands/workflow/tests-base.test.ts (0 test)

⎯⎯⎯⎯⎯⎯ Failed Suites 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/tests-base.test.ts [ .bkit/core/engine/commands/workflow/tests-base.test.ts ]
Error: Cannot find module './tests-base' imported from /Users/christian/Documents/GitHub/bkit/.worktrees/891-build-gate-stuck/.bkit/core/engine/commands/workflow/tests-base.test.ts
 ❯ .bkit/core/engine/commands/workflow/tests-base.test.ts:3:1
      1| import { describe, expect, it } from "vitest";
      2|
      3| import { baseVerdict, caseFile } from "./tests-base";
       | ^
      4| import type { JunitCase } from "./junit";
      5|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  no tests
   Start at  22:58:23
   Duration  241ms (setup 76%, transform 16%, worker 8%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-hR2pow/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```

## Lint output — `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/891-build-gate-stuck
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/workflow/tests-base.integration.test.ts

```

## Runner output — `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/891-build-gate-stuck
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/workflow/tests-base.integration.test.ts

[test-timeout-budget] load average 13.0 on 10 cores: unit limits 11000ms per test, 22000ms per hook (x2.20)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/891-build-gate-stuck

 ❯ .bkit/core/engine/commands/workflow/tests-base.integration.test.ts (14 tests | 14 failed) 2780ms
   ❯ bkit tests base (14)
     × reports all from a local run at the merge-base 236ms
     × a failing file absent at the base commit is the branch's 210ms
     × no JUnit report reads unknown 186ms
     × an undeclared bkit:test:file reads unknown 171ms
     × a failed base install reads unknown and removes the worktree 175ms
     × installs at base with --frozen-lockfile --prefer-offline 187ms
     × copies the worktreeCopy entries into the base checkout 204ms
     × no origin/dev ref reads unknown 180ms
     × a base file run that writes no report reads unknown 203ms
     × a missing required flag is a usage error 196ms
     × a passing CI run at the exact base sha settles none without a local run 203ms
     × a CI run that cannot settle the base falls back to the local run 209ms
     × adopt follows the run's runtimeWorktrees 197ms
     × worktreeInstall off reads unknown 219ms

⎯⎯⎯⎯⎯⎯ Failed Tests 14 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/tests-base.integration.test.ts > bkit tests base > reports all from a local run at the merge-base
AssertionError: expected 2 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 2

 ❯ .bkit/core/engine/commands/workflow/tests-base.integration.test.ts:248:20
    246|     ]);
    247|     const r = await testsBase(f);
    248|     expect(r.code).toBe(0);
       |                    ^
    249|     expect(r.json).toMatchObject({
    250|       verdict: "all",

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/14]⎯

 FAIL  .bkit/core/engine/commands/workflow/tests-base.integration.test.ts > bkit tests base > a failing file absent at the base commit is the branch's
AssertionError: expected 2 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 2

 ❯ .bkit/core/engine/commands/workflow/tests-base.integration.test.ts:273:20
    271|     gateReport(f, [["tests/new.test.ts", "n"]]);
    272|     const r = await testsBase(f);
    273|     expect(r.code).toBe(0);
       |                    ^
    274|     expect(r.json).toMatchObject({
    275|       verdict: "none",

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/14]⎯

 FAIL  .bkit/core/engine/commands/workflow/tests-base.integration.test.ts > bkit tests base > no JUnit report reads unknown
AssertionError: expected 2 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 2

 ❯ .bkit/core/engine/commands/workflow/tests-base.integration.test.ts:289:20
    287|     const f = fixture({ baseFiles: redOnBase });
    288|     const r = await testsBase(f);
    289|     expect(r.code).toBe(0);
       |                    ^
    290|     expect(r.json.verdict).toBe("unknown");
    291|     expect(r.json.reason).toContain("no JUnit report");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/14]⎯

 FAIL  .bkit/core/engine/commands/workflow/tests-base.integration.test.ts > bkit tests base > an undeclared bkit:test:file reads unknown
AssertionError: expected 2 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 2

 ❯ .bkit/core/engine/commands/workflow/tests-base.integration.test.ts:303:20
    301|     gateReport(f, [["tests/a.test.ts", "x"]]);
    302|     const r = await testsBase(f);
    303|     expect(r.code).toBe(0);
       |                    ^
    304|     expect(r.json.verdict).toBe("unknown");
    305|     expect(r.json.baseRed).toBe(0);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/14]⎯

 FAIL  .bkit/core/engine/commands/workflow/tests-base.integration.test.ts > bkit tests base > a failed base install reads unknown and removes the worktree
AssertionError: expected 2 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 2

 ❯ .bkit/core/engine/commands/workflow/tests-base.integration.test.ts:317:20
    315|     gateReport(f, [["tests/a.test.ts", "x"]]);
    316|     const r = await testsBase(f);
    317|     expect(r.code).toBe(0);
       |                    ^
    318|     expect(r.json.verdict).toBe("unknown");
    319|     expect(r.json.reason).toContain("base install failed");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/14]⎯

 FAIL  .bkit/core/engine/commands/workflow/tests-base.integration.test.ts > bkit tests base > installs at base with --frozen-lockfile --prefer-offline
AssertionError: expected 2 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 2

 ❯ .bkit/core/engine/commands/workflow/tests-base.integration.test.ts:327:20
    325|     gateReport(f, [["tests/a.test.ts", "x"]]);
    326|     const r = await testsBase(f);
    327|     expect(r.code).toBe(0);
       |                    ^
    328|     const args = fs
    329|       .readFileSync(path.join(f.cwd, ".git", "fixture-install-args"), …

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[6/14]⎯

 FAIL  .bkit/core/engine/commands/workflow/tests-base.integration.test.ts > bkit tests base > copies the worktreeCopy entries into the base checkout
AssertionError: expected 2 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 2

 ❯ .bkit/core/engine/commands/workflow/tests-base.integration.test.ts:340:20
    338|     gateReport(f, [["tests/a.test.ts", "e"]]);
    339|     const r = await testsBase(f);
    340|     expect(r.code).toBe(0);
       |                    ^
    341|     expect(r.json).toMatchObject({ verdict: "none", baseRed: 0, branch…
    342|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[7/14]⎯

 FAIL  .bkit/core/engine/commands/workflow/tests-base.integration.test.ts > bkit tests base > no origin/dev ref reads unknown
AssertionError: expected 2 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 2

 ❯ .bkit/core/engine/commands/workflow/tests-base.integration.test.ts:348:20
    346|     gateReport(f, [["tests/a.test.ts", "x"]]);
    347|     const r = await testsBase(f);
    348|     expect(r.code).toBe(0);
       |                    ^
    349|     expect(r.json.verdict).toBe("unknown");
    350|     expect(r.json.reason).toContain("no base commit");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[8/14]⎯

 FAIL  .bkit/core/engine/commands/workflow/tests-base.integration.test.ts > bkit tests base > a base file run that writes no report reads unknown
AssertionError: expected 2 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 2

 ❯ .bkit/core/engine/commands/workflow/tests-base.integration.test.ts:359:20
    357|     gateReport(f, [["tests/a.test.ts", "x"]]);
    358|     const r = await testsBase(f);
    359|     expect(r.code).toBe(0);
       |                    ^
    360|     expect(r.json.verdict).toBe("unknown");
    361|     expect(r.json.reason).toContain("no report from the base run");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[9/14]⎯

 FAIL  .bkit/core/engine/commands/workflow/tests-base.integration.test.ts > bkit tests base > a missing required flag is a usage error
AssertionError: expected '[bkit-tests] unknown verb "base" — ru…' to contain '--log'

- Expected
+ Received

- --log
+ [bkit-tests] unknown verb "base" — run `bkit tests --help`
+

 ❯ .bkit/core/engine/commands/workflow/tests-base.integration.test.ts:376:19
    374|     );
    375|     expect(r.code).toBe(2);
    376|     expect(r.err).toContain("--log");
       |                   ^
    377|     expect(r.err).not.toContain("unknown verb");
    378|     expect(fs.existsSync(f.out)).toBe(false);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[10/14]⎯

 FAIL  .bkit/core/engine/commands/workflow/tests-base.integration.test.ts > bkit tests base > a passing CI run at the exact base sha settles none without a local run
AssertionError: expected 2 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 2

 ❯ .bkit/core/engine/commands/workflow/tests-base.integration.test.ts:391:20
    389|     gateReport(f, [["tests/a.test.ts", "x"]]);
    390|     const r = await testsBase(f);
    391|     expect(r.code).toBe(0);
       |                    ^
    392|     expect(r.json).toMatchObject({
    393|       verdict: "none",

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[11/14]⎯

 FAIL  .bkit/core/engine/commands/workflow/tests-base.integration.test.ts > bkit tests base > a CI run that cannot settle the base falls back to the local run
AssertionError: skipped lane: expected 2 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 2

 ❯ .bkit/core/engine/commands/workflow/tests-base.integration.test.ts:450:30
    448|       gateReport(f, [["tests/a.test.ts", "x"]]);
    449|       const r = await testsBase(f);
    450|       expect(r.code, s.name).toBe(0);
       |                              ^
    451|       expect(r.json, s.name).toMatchObject({ verdict: "all", source: "…
    452|       expect(installRuns(f), s.name).toHaveLength(1);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[12/14]⎯

 FAIL  .bkit/core/engine/commands/workflow/tests-base.integration.test.ts > bkit tests base > adopt follows the run's runtimeWorktrees
TypeError: Cannot read properties of undefined (reading 'adopt')
 ❯ .bkit/core/engine/commands/workflow/tests-base.integration.test.ts:461:42
    459|     const adopt = fixture({ baseFiles: redOnBase, worktrees: false });
    460|     gateReport(adopt, [["tests/a.test.ts", "x"]]);
    461|     expect((await testsBase(adopt)).json.adopt).toBe(true);
       |                                          ^
    462|
    463|     const worktrees = fixture({ baseFiles: redOnBase, worktrees: true …

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[13/14]⎯

 FAIL  .bkit/core/engine/commands/workflow/tests-base.integration.test.ts > bkit tests base > worktreeInstall off reads unknown
AssertionError: expected 2 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 2

 ❯ .bkit/core/engine/commands/workflow/tests-base.integration.test.ts:476:20
    474|     gateReport(f, [["tests/a.test.ts", "x"]]);
    475|     const r = await testsBase(f);
    476|     expect(r.code).toBe(0);
       |                    ^
    477|     expect(r.json.verdict).toBe("unknown");
    478|     expect(r.json.reason).toContain("no install at the base commit");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[14/14]⎯


 Test Files  1 failed (1)
      Tests  14 failed (14)
   Start at  22:58:25
   Duration  3.39s (tests 86%, transform 7%, import 5%, setup 2%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-fyQC8u/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
