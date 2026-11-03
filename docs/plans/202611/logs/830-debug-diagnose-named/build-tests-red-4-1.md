Enforced: true
Red: 1
Accepted: 3
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 4, attempt 1

Plan: `docs/plans/202611/830-debug-diagnose-named-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 10 | `.bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts` "checks the complete selected CI fix sequence against green and red final runs" | passed-accepted | passes; accepted by the tests step: implemented groups 1-3 retain exact attempt identity, defer actual local package gate until diagnosis/fix, and reject selected red run 302 despite configured CI success after green run 301 |
| 10 | `.bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts` "reloads saved fixes and recollects explicitly replaced evidence generations" | passed-accepted | passes; accepted by the tests step: real fresh CLI processes reload saved generation/fix state and replacement run 124 starts generation 2 CI evidence without rerunning a locally passing gate |
| 10 | `.bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts` "preserves local and repro overrides across actual workflow command sequences" | red | failure: expected { Object (verdict, failures, ...) } to match object { repro: true, …(2) } (14 matching properties omitted from actual) |
| 10 | `.bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts` "blocks missing logs and wrong-branch evidence before source edits" | passed-accepted | passes; accepted by the tests step: shipped context script rejects unavailable pinned logs and real runs locate exits 82 on fix/other versus adopted fix/ci without writing a selection |

## Gaps

None.

## Lint output — `.bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts`

```

> @cbartens/bkit@6.0.0 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/830-debug-diagnose-named
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts

```

## Runner output — `.bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts`

```

> @cbartens/bkit@6.0.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/830-debug-diagnose-named
> node scripts/ci/bkit-test-file.mjs .bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts


 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/830-debug-diagnose-named

 ❯ .bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts (4 tests | 1 failed) 10493ms
   ❯ Debug CI evidence sequence (4)
     ✓ checks the complete selected CI fix sequence against green and red final runs 2384ms
     ✓ reloads saved fixes and recollects explicitly replaced evidence generations 2628ms
     × preserves local and repro overrides across actual workflow command sequences 4043ms
     ✓ blocks missing logs and wrong-branch evidence before source edits 1437ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts > Debug CI evidence sequence > preserves local and repro overrides across actual workflow command sequences
AssertionError: expected { Object (verdict, failures, ...) } to match object { repro: true, …(2) }
(14 matching properties omitted from actual)

- Expected
+ Received

  {
    "ciFixDone": false,
-   "ciReproduced": true,
+   "ciReproduced": false,
    "repro": true,
  }

 ❯ .bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts:441:8
    439|     expect
    440|       .soft(repro.route().json)
    441|       .toMatchObject({ repro: true, ciReproduced: true, ciFixDone: fal…
       |        ^
    442|     expect(repro.agent("diagnose").code).toBe(0);
    443|     expect(repro.events().filter((event) => event.kind === "local-gate…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 3 passed (4)
   Start at  00:50:49
   Duration  10.56s (tests 100%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-dFD1eq/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
