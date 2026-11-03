Enforced: true
Red: 1
Accepted: 0
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 4, attempt 2

Plan: `docs/plans/202610/724-machine-wide-test-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 11 | `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts` "every branches push call site routes exit 81 to a re-run of its block" | red | failure: bkit-design.md: "{BKIT}" branches push --mode=feature: expected undefined to be defined |

## Gaps

None.

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

 ❯ .bkit/core/engine/audits/workflows/local-gate-audit.test.ts (32 tests | 1 failed | 2 skipped) 25ms
   ❯ bkit-local-gate-audit (#437) (32)
     ✓ every prompt that runs bkit tests changed routes exit 81 to a re-run of the command 3ms
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
     ✓ every tests run call site routes exit 81 to a re-run of its block 3ms
     × every branches push call site routes exit 81 to a re-run of its block 1ms
     ✓ a tests run command a workflow hands a subagent in Context is re-run on exit 81 by that subagent's prompt 2ms
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

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/audits/workflows/local-gate-audit.test.ts > bkit-local-gate-audit (#437) > every branches push call site routes exit 81 to a re-run of its block
AssertionError: bkit-design.md: "{BKIT}" branches push --mode=feature: expected undefined to be defined
 ❯ expectWaitRoute .bkit/core/engine/audits/workflows/local-gate-audit.test.ts:85:22
     83|   expect(route, site).toMatch(/(?:Route|Decide)[^\n]*:/);
     84|   const wait = route.split("\n").find((line) => /exit\s+`?81\b/i.test(…
     85|   expect(wait, site).toBeDefined();
       |                      ^
     86|   expect(wait, site).toMatch(/end (?:the )?turn/i);
     87|   expect(wait, site).toMatch(/re-run (?:this |the )?block/i);
 ❯ .bkit/core/engine/audits/workflows/local-gate-audit.test.ts:249:9

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 29 passed | 2 skipped (32)
   Start at  10:23:38
   Duration  122ms (tests 37%, transform 21%, setup 20%, import 20%, worker 2%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-AwHKHL/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
