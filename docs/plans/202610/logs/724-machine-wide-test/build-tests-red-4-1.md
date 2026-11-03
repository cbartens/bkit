Enforced: true
Red: 7
Accepted: 0
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 4, attempt 1

Plan: `docs/plans/202610/724-machine-wide-test-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 6 | `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` "a wrapped gate that runs another wrapped gate runs the inner one unlocked, never waiting on itself" | red | failure: [bkit-tests] running pnpm bkit:gate:static-unit — full output in logs/contrast.md [bkit-tests] [bkit-tests] > @ bkit:gate:static-unit /private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-tests-lock-wRkPsY/consumer [bkit-tests] > node gate.mjs [bkit-tests] [bkit-tests] no JUnit report in $BKIT_TEST_REPORT_DIR — failures unknown; turn on each test runner's JUnit reporter in the gate and point its output into $BKIT_TEST_REPORT_DIR (.bkit/workflows.md § Local gate scripts) [bkit-tests] verdict PASS (exit 0) : expected +0 to be 81 // Object.is equality |
| 6 | `.bkit/core/engine/audits/repo/package-json.test.ts` "bkit's root package.json wraps every test-running bkit:gate script in the tests lock" | red | failure: expected 'pnpm bkit:gate:static && pnpm test:co…' to match /^bash scripts\/ci\/bkit-machine-lo…/ci\ |
| 7 | `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts` "every tests run call site routes exit 81 to a re-run of its block" | red | failure: bkit-build.md build-run-tests: expected undefined to be defined |
| 7 | `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts` "a tests run command a workflow hands a subagent in Context is re-run on exit 81 by that subagent's prompt" | red | failure: bkit-build-plan-gaps-remediate: group gate's own retry: expected undefined to be defined |
| 11 | `.bkit/core/engine/commands/workflow/branches-lock.integration.test.ts` "branches push exits 81 naming the holder when the pre-push hook's gate gave up on the tests lock" | red | failure: [bkit-branches] git push -u origin feat/tests-lock failed: [machine-lock] ❌ bkit:test:file gave up after 0s waiting for tests, in use by external push holder — /private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-branches-lock-v8tRKj/consumer (pid 39719, since 10:02:02), no earlier run [machine-lock] Let that run finish, or stop it. LOCAL_STACK_LOCK_WAIT_S sets how long to wait. error: failed to push some refs to '/private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-branches-lock-v8tRKj/origin.git' : expected 8 to be 81 // Object.is equality |
| 11 | `.bkit/core/engine/commands/workflow/branches-lock.integration.test.ts` "branches push passes LOCAL_STACK_LOCK_WAIT_S and LOCAL_STACK_LOCK_WHO to git push" | red | failure: expected { wait: '', who: '' } to deeply equal { wait: '2', …(1) } |
| 11 | `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts` "every branches push call site routes exit 81 to a re-run of its block" | red | failure: bkit-build.md: "{BKIT}" branches push --mode=feature --set-upstream: expected undefined to be defined |

## Gaps

None.

## Lint output — `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts`

```

> @cbartens/bkit@6.0.0 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/724-machine-wide-test
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/workflow/tests-lock.integration.test.ts

```

## Runner output — `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts`

```

> @cbartens/bkit@6.0.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/724-machine-wide-test
> node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/workflow/tests-lock.integration.test.ts


 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/724-machine-wide-test

 ❯ .bkit/core/engine/commands/workflow/tests-lock.integration.test.ts (14 tests | 1 failed) 9879ms
   ❯ tests lock through a consumer's wrapped gate (14)
     × a wrapped gate that runs another wrapped gate runs the inner one unlocked, never waiting on itself 857ms
     ✓ tests run --file appends no test-run row when it exits 81 on a held tests lock 395ms
     ✓ tests changed exits 81 naming the holder when its wrapped gate gives up on the tests lock 419ms
     ✓ tests changed with an unwritable lock dir exits 4 naming the path 355ms
     ✓ tests run waits for a held tests lock and runs the gate once the holder finishes 1450ms
     ✓ tests run exits 81 naming the holder when the lock stays held past --lock-wait-s 1432ms
     ✓ tests run holds the tests lock for the whole gate, so a second tests run waits 1715ms
     ✓ tests red runs its test file without waiting for a held tests lock 702ms
     ✓ tests run under CI=true never waits on a held tests lock 685ms
     ✓ tests run under CI=1 never waits on a held tests lock 362ms
     ✓ tests run with an unwritable lock dir exits 4 naming the path 336ms
     ✓ tests run with --lock-wait-s=0 exits 81 at once against a held lock 394ms
     ✓ a gate that itself exits 75 is a FAIL verdict, not a lock wait 384ms
     ✓ the gate runs with BKIT_TEST_WORKERS and LOCAL_STACK_LOCK_OWNER_tests set, and a nested run --lock tests inside it does not wait 392ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/tests-lock.integration.test.ts > tests lock through a consumer's wrapped gate > a wrapped gate that runs another wrapped gate runs the inner one unlocked, never waiting on itself
AssertionError: [bkit-tests] running pnpm bkit:gate:static-unit — full output in logs/contrast.md
[bkit-tests] 
[bkit-tests] > @ bkit:gate:static-unit /private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-tests-lock-wRkPsY/consumer
[bkit-tests] > node gate.mjs
[bkit-tests] 
[bkit-tests] no JUnit report in $BKIT_TEST_REPORT_DIR — failures unknown; turn on each test runner's JUnit reporter in the gate and point its output into $BKIT_TEST_REPORT_DIR (.bkit/workflows.md § Local gate scripts)
[bkit-tests] verdict PASS (exit 0)
: expected +0 to be 81 // Object.is equality

- Expected
+ Received

- 81
+ 0

 ❯ .bkit/core/engine/commands/workflow/tests-lock.integration.test.ts:263:46
    261|     fs.writeFileSync(release, "release");
    262|     const result = await first.done;
    263|     expect(contrast.status, contrast.stderr).toBe(81);
       |                                              ^
    264|     expect(result.status, result.stderr).toBe(0);
    265|     expect(ownership.nested).toBe(0);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 13 passed (14)
   Start at  10:01:50
   Duration  9.95s (tests 100%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-QAmYX5/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```

## Lint output — `.bkit/core/engine/audits/repo/package-json.test.ts`

```

> @cbartens/bkit@6.0.0 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/724-machine-wide-test
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/audits/repo/package-json.test.ts

```

## Runner output — `.bkit/core/engine/audits/repo/package-json.test.ts`

```

> @cbartens/bkit@6.0.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/724-machine-wide-test
> node scripts/ci/bkit-test-file.mjs .bkit/core/engine/audits/repo/package-json.test.ts


 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/724-machine-wide-test

 ❯ .bkit/core/engine/audits/repo/package-json.test.ts (8 tests | 1 failed) 3ms
   ❯ package.json manifest invariants (BAR-138) (8)
     × bkit's root package.json wraps every test-running bkit:gate script in the tests lock 2ms
     ✓ private is false (package must be publishable) 0ms
     ✓ publishConfig.registry equals https://registry.npmjs.org/ 0ms
     ✓ publishConfig.access equals public 0ms
     ✓ repository.url is bare HTTPS (no git+ prefix) 0ms
     ✓ description does not claim a private git dependency 0ms
     ✓ files array carries no `!` negations (pnpm pack ignores them) 0ms
     ✓ pnpm.overrides never shadows a direct pin 0ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/audits/repo/package-json.test.ts > package.json manifest invariants (BAR-138) > bkit's root package.json wraps every test-running bkit:gate script in the tests lock
AssertionError: expected 'pnpm bkit:gate:static && pnpm test:co…' to match /^bash scripts\/ci\/bkit-machine-lo…/ci\

- Expected:
/^bash scripts\/ci\/bkit-machine-lock.sh run --lock tests -- sh -c '/

+ Received:
"pnpm bkit:gate:static && pnpm test:coverage:unit && pnpm bkit:test:bats"

 ❯ .bkit/core/engine/audits/repo/package-json.test.ts:18:55
     16|     };
     17|     const prefix = "bash scripts/ci/bkit-machine-lock.sh run --lock te…
     18|     expect(manifest.scripts["bkit:gate:static-unit"]).toMatch(new RegE…
       |                                                       ^
     19|     expect(manifest.scripts["bkit:gate:static-unit-integration"]).toMa…
     20|       new RegExp(`^${prefix}sh -c '`),

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 7 passed (8)
   Start at  10:02:00
   Duration  72ms (setup 57%, tests 16%, transform 15%, worker 7%, import 5%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-oxjAAT/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```

## Lint output — `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts`

```

> @cbartens/bkit@6.0.0 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/724-machine-wide-test
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/audits/workflows/local-gate-audit.test.ts

```

## Runner output — `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts`

```

> @cbartens/bkit@6.0.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/724-machine-wide-test
> node scripts/ci/bkit-test-file.mjs .bkit/core/engine/audits/workflows/local-gate-audit.test.ts


 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/724-machine-wide-test

 ❯ .bkit/core/engine/audits/workflows/local-gate-audit.test.ts (32 tests | 3 failed | 2 skipped) 22ms
   ❯ bkit-local-gate-audit (#437) (32)
     ✓ every prompt that runs bkit tests changed routes exit 81 to a re-run of the command 2ms
     ✓ no toolchain command is inlined at a call site (2)
       ✓ `pnpm turbo` appears nowhere unexempted — names a task runner instead of a bkit:gate* script 9ms
       ✓ `--filter='...[origin/dev]'` appears nowhere unexempted — turbo affected-selector inlined at a call site 2ms
     ✓ every call site dispatches through a named gate (9)
       ✓ .bkit/templates/.husky/pre-commit runs `pnpm bkit:gate:format` 0ms
       ✓ .bkit/templates/.husky/pre-push runs `pnpm bkit:gate:static-unit` 0ms
       ✓ .bkit/templates/.husky/pre-push runs `pnpm bkit:gate:static` 0ms
       ✓ .bkit/templates/.husky/pre-push runs `pnpm bkit:gate:min` 0ms
       ✓ .bkit/core/prompts/bkit-build-plan-tasks.md runs `--fallback=bkit:gate:static`` 0ms
       ✓ .bkit/core/prompts/bkit-build-plan-gaps-remediate.md runs `--fallback=bkit:gate:static-unit`` 0ms
       ✓ .bkit/core/prompts/bkit-debug-failure-remediate.md runs `--fallback=bkit:gate:static-unit`` 0ms
       ✓ .bkit/core/prompts/bkit-build-plan-verify.md runs `--fallback=bkit:gate:static-unit`` 0ms
       ✓ .bkit/core/prompts/bkit-ship-conflict-resolve.md runs `pnpm bkit:gate:install-static-unit-build` 0ms
     ✓ every gate a call site names is one install actually seeds 0ms
     ✓ workflows run the local gate only through `bkit tests run` 1ms
     × every tests run call site routes exit 81 to a re-run of its block 2ms
     × every branches push call site routes exit 81 to a re-run of its block 0ms
     × a tests run command a workflow hands a subagent in Context is re-run on exit 81 by that subagent's prompt 3ms
     ✓ every `tests run` call site of a workflow is probed 0ms
     ✓ bkit-build.md build-run-tests runs the deepest declared gate (through integration) (4)
       ✓ passes every candidate, in descending depth, at each of its 1 call site(s) 0ms
       ↓ routes the engine's gate list where a block passes {GATE_FLAGS}
       ✓ falls back to a gate install actually seeds, so the chain terminates 0ms
       ✓ never swallows a could-not-run exit, so an undeclared gate fails loud 0ms
     ✓ bkit-build.md build-group-gate- runs the deepest declared gate (through unit) (4)
       ✓ passes every candidate, in descending depth, at each of its 1 call site(s) 0ms
       ↓ routes the engine's gate list where a block passes {GATE_FLAGS}
       ✓ falls back to a gate install actually seeds, so the chain terminates 0ms
       ✓ never swallows a could-not-run exit, so an undeclared gate fails loud 0ms
     ✓ bkit-debug.md tests run runs the deepest declared gate (through live) (4)
       ✓ passes every candidate, in descending depth, at each of its 1 call site(s) 0ms
       ✓ routes the engine's gate list where a block passes {GATE_FLAGS} 0ms
       ✓ falls back to a gate install actually seeds, so the chain terminates 0ms
       ✓ never swallows a could-not-run exit, so an undeclared gate fails loud 0ms
     ✓ only debug reaches the live tier, and only its deepest gate carries the `live` word 0ms
     ✓ the seeded gates chain only scripts that exist here or are themselves gates 0ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 3 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/audits/workflows/local-gate-audit.test.ts > bkit-local-gate-audit (#437) > every tests run call site routes exit 81 to a re-run of its block
AssertionError: bkit-build.md build-run-tests: expected undefined to be defined
 ❯ expectWaitRoute .bkit/core/engine/audits/workflows/local-gate-audit.test.ts:85:22
     83|   expect(route, site).toMatch(/(?:Route|Decide)[^\n]*:/);
     84|   const wait = route.split("\n").find((line) => /exit\s+`?81\b/i.test(…
     85|   expect(wait, site).toBeDefined();
       |                      ^
     86|   expect(wait, site).toMatch(/end (?:the )?turn/i);
     87|   expect(wait, site).toMatch(/re-run (?:this |the )?block/i);
 ❯ .bkit/core/engine/audits/workflows/local-gate-audit.test.ts:228:39

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/3]⎯

 FAIL  .bkit/core/engine/audits/workflows/local-gate-audit.test.ts > bkit-local-gate-audit (#437) > every branches push call site routes exit 81 to a re-run of its block
AssertionError: bkit-build.md: "{BKIT}" branches push --mode=feature --set-upstream: expected undefined to be defined
 ❯ expectWaitRoute .bkit/core/engine/audits/workflows/local-gate-audit.test.ts:85:22
     83|   expect(route, site).toMatch(/(?:Route|Decide)[^\n]*:/);
     84|   const wait = route.split("\n").find((line) => /exit\s+`?81\b/i.test(…
     85|   expect(wait, site).toBeDefined();
       |                      ^
     86|   expect(wait, site).toMatch(/end (?:the )?turn/i);
     87|   expect(wait, site).toMatch(/re-run (?:this |the )?block/i);
 ❯ .bkit/core/engine/audits/workflows/local-gate-audit.test.ts:247:9

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/3]⎯

 FAIL  .bkit/core/engine/audits/workflows/local-gate-audit.test.ts > bkit-local-gate-audit (#437) > a tests run command a workflow hands a subagent in Context is re-run on exit 81 by that subagent's prompt
AssertionError: bkit-build-plan-gaps-remediate: group gate's own retry: expected undefined to be defined
 ❯ .bkit/core/engine/audits/workflows/local-gate-audit.test.ts:291:57
    289|         ?.split("\n")
    290|         .find((line) => /group gate.*exit(?:s)?\s+`?81\b/i.test(line));
    291|       expect(retry, `${agent}: group gate's own retry`).toBeDefined();
       |                                                         ^
    292|       expect(retry).toMatch(/run (?:the same |that |the )?command agai…
    293|     }

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/3]⎯


 Test Files  1 failed (1)
      Tests  3 failed | 27 passed | 2 skipped (32)
   Start at  10:02:01
   Duration  115ms (tests 35%, transform 24%, import 20%, setup 19%, worker 2%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-I0ANgM/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```

## Lint output — `.bkit/core/engine/commands/workflow/branches-lock.integration.test.ts`

```

> @cbartens/bkit@6.0.0 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/724-machine-wide-test
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/workflow/branches-lock.integration.test.ts

```

## Runner output — `.bkit/core/engine/commands/workflow/branches-lock.integration.test.ts`

```

> @cbartens/bkit@6.0.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/724-machine-wide-test
> node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/workflow/branches-lock.integration.test.ts


 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/724-machine-wide-test

 ❯ .bkit/core/engine/commands/workflow/branches-lock.integration.test.ts (2 tests | 2 failed) 574ms
   ❯ branches push through a real pre-push lock (2)
     × branches push exits 81 naming the holder when the pre-push hook's gate gave up on the tests lock 277ms
     × branches push passes LOCAL_STACK_LOCK_WAIT_S and LOCAL_STACK_LOCK_WHO to git push 297ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 2 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/branches-lock.integration.test.ts > branches push through a real pre-push lock > branches push exits 81 naming the holder when the pre-push hook's gate gave up on the tests lock
AssertionError: [bkit-branches] git push -u origin feat/tests-lock failed: [machine-lock] ❌ bkit:test:file gave up after 0s waiting for tests, in use by external push holder — /private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-branches-lock-v8tRKj/consumer (pid 39719, since 10:02:02), no earlier run
[machine-lock]    Let that run finish, or stop it. LOCAL_STACK_LOCK_WAIT_S sets how long to wait.
error: failed to push some refs to '/private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-branches-lock-v8tRKj/origin.git'
: expected 8 to be 81 // Object.is equality

- Expected
+ Received

- 81
+ 8

 ❯ .bkit/core/engine/commands/workflow/branches-lock.integration.test.ts:133:42
    131|     const holder = await hold();
    132|     const result = push({ BKIT_LOCK_WAIT_S: "0", LOCAL_STACK_LOCK_WAIT…
    133|     expect(result.status, result.stderr).toBe(81);
       |                                          ^
    134|     expect(result.json).toMatchObject({
    135|       pushed: false,

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/2]⎯

 FAIL  .bkit/core/engine/commands/workflow/branches-lock.integration.test.ts > branches push through a real pre-push lock > branches push passes LOCAL_STACK_LOCK_WAIT_S and LOCAL_STACK_LOCK_WHO to git push
AssertionError: expected { wait: '', who: '' } to deeply equal { wait: '2', …(1) }

- Expected
+ Received

  {
-   "wait": "2",
-   "who": "bkit branches push feat/tests-lock",
+   "wait": "",
+   "who": "",
  }

 ❯ .bkit/core/engine/commands/workflow/branches-lock.integration.test.ts:151:83
    149|     expect(result.status, result.stderr).toBe(0);
    150|     expect(result.json).toMatchObject({ pushed: true, ref: BRANCH });
    151|     expect(JSON.parse(fs.readFileSync(path.join(tmp, "hook-env.json"),…
       |                                                                                   ^
    152|       wait: "2",
    153|       who: `bkit branches push ${BRANCH}`,

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/2]⎯


 Test Files  1 failed (1)
      Tests  2 failed (2)
   Start at  10:02:02
   Duration  641ms (tests 97%, setup 2%, transform 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-Dm18KF/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
