Enforced: true
Red: 7
Accepted: 0
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 2, attempt 1

Plan: `docs/plans/202611/1028-gate-fails-workflow-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 6 | `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts` "check fails and lower refuses when a text folder is missing or empty" | red | failure: expected '[bkit:text:ceiling] FAIL\nprompts: 0 …' to contain '.bkit/core/prompts' |
| 6 | `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts` "check, lower and raise each fail with one line naming the record when it is not valid JSON" | red | failure: expected [ '<anonymous_script>:2', …(10) ] to have a length of 1 but got 11 |
| 8 | `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts` "raise from a non-interactive caller refuses and leaves the record unchanged" | red | failure: expected +0 not to be +0 // Object.is equality |
| 8 | `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts` "raise at a terminal shows the old and new ceilings and writes only after the typed confirmation" | red | failure: process.exit unexpectedly called with "1" (test file: /Users/christian/Documents/GitHub/bkit/.worktrees/1028-gate-fails-workflow/.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts) |
| 8 | `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts` "raise with a reason rewrites both ceilings and stores the reason on the folder that grew" | red | failure: process.exit unexpectedly called with "1" (test file: /Users/christian/Documents/GitHub/bkit/.worktrees/1028-gate-fails-workflow/.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts) |
| 8 | `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts` "raise without a reason refuses and leaves the record unchanged" | red | failure: process.exit unexpectedly called with "1" (test file: /Users/christian/Documents/GitHub/bkit/.worktrees/1028-gate-fails-workflow/.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts) |
| 8 | `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts` "fails above the ceiling and names total, ceiling, grown files and the raise command" | red | failure: expected '[bkit:text:ceiling] FAIL\nworkflows: …' to match /\b8\b/ |

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

stderr | .bkit/core/engine/audits/repo/agent-text-ceiling.test.ts > bkit-text-ceiling lower and raise > raise without a reason refuses and leaves the record unchanged
Usage: bkit-text-ceiling.mjs check|lower|raise [--reason <why>] [--root <dir>] [--record <file>]

 ❯ .bkit/core/engine/audits/repo/agent-text-ceiling.test.ts (13 tests | 7 failed) 338ms
   ❯ bkit-text-ceiling check (4)
     × fails above the ceiling and names total, ceiling, grown files and the raise command 37ms
     ✓ passes when a total equals its ceiling 22ms
     ✓ fails below the ceiling and names the lower command 21ms
     ✓ names only the files that grew since the record's last commit 79ms
   ❯ bkit-text-ceiling lower and raise (6)
     × raise without a reason refuses and leaves the record unchanged 10ms
     × raise with a reason rewrites both ceilings and stores the reason on the folder that grew 1ms
     × raise from a non-interactive caller refuses and leaves the record unchanged 21ms
     × raise at a terminal shows the old and new ceilings and writes only after the typed confirmation 2ms
     ✓ lower rewrites both ceilings and keeps each reason 41ms
     ✓ lower refuses when a total is above its ceiling 29ms
   ❯ bkit-text-ceiling missing folders and a broken record (2)
     × check fails and lower refuses when a text folder is missing or empty 23ms
     × check, lower and raise each fail with one line naming the record when it is not valid JSON 24ms
   ✓ bkit-text-ceiling on the real repo (1)
     ✓ bkit's own workflow and prompt folders sit exactly at the committed ceilings 29ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 7 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/audits/repo/agent-text-ceiling.test.ts > bkit-text-ceiling check > fails above the ceiling and names total, ceiling, grown files and the raise command
AssertionError: expected '[bkit:text:ceiling] FAIL\nworkflows: …' to match /\b8\b/

- Expected:
/\b8\b/

+ Received:
"[bkit:text:ceiling] FAIL
workflows: 20 words is above the ceiling of 12. Files that grew most:
    .bkit/core/workflows/a.md (+10, 10 words)
    .bkit/core/workflows/b.md (+10, 10 words)
  Shorten the text, or (owner only, never from a workflow, hook or agent) run: pnpm bkit:text:ceiling raise --reason \"<why>\"
"

 ❯ .bkit/core/engine/audits/repo/agent-text-ceiling.test.ts:107:19
    105|     expect(r.out).toContain("20");
    106|     expect(r.out).toContain("12");
    107|     expect(r.out).toMatch(/\b8\b/);
       |                   ^
    108|     expect(r.out).toMatch(/a\.md|b\.md/);
    109|     expect(r.out).not.toContain('raise --reason "<why>"');

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/7]⎯

 FAIL  .bkit/core/engine/audits/repo/agent-text-ceiling.test.ts > bkit-text-ceiling lower and raise > raise without a reason refuses and leaves the record unchanged
 FAIL  .bkit/core/engine/audits/repo/agent-text-ceiling.test.ts > bkit-text-ceiling lower and raise > raise with a reason rewrites both ceilings and stores the reason on the folder that grew
 FAIL  .bkit/core/engine/audits/repo/agent-text-ceiling.test.ts > bkit-text-ceiling lower and raise > raise at a terminal shows the old and new ceilings and writes only after the typed confirmation
Error: process.exit unexpectedly called with "1" (test file: /Users/christian/Documents/GitHub/bkit/.worktrees/1028-gate-fails-workflow/.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts)
 ❯ scripts/gate/bkit-text-ceiling.mjs:167:11
    165|     "Usage: bkit-text-ceiling.mjs check|lower|raise [--reason <why>] […
    166|   );
    167|   process.exit(1);
       |           ^
    168| }
    169|
 ❯ callRaise .bkit/core/engine/audits/repo/agent-text-ceiling.test.ts:78:65
 ❯ .bkit/core/engine/audits/repo/agent-text-ceiling.test.ts:150:5

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/7]⎯

 FAIL  .bkit/core/engine/audits/repo/agent-text-ceiling.test.ts > bkit-text-ceiling lower and raise > raise from a non-interactive caller refuses and leaves the record unchanged
AssertionError: expected +0 not to be +0 // Object.is equality
 ❯ .bkit/core/engine/audits/repo/agent-text-ceiling.test.ts:187:28
    185|         { encoding: "utf-8", cwd: fx.root, env: { ...process.env, ...v…
    186|       );
    187|       expect(r.status).not.toBe(0);
       |                            ^
    188|       expect(r.status).not.toBeNull();
    189|       expect(fs.readFileSync(fx.record, "utf-8")).toBe(before);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/7]⎯

 FAIL  .bkit/core/engine/audits/repo/agent-text-ceiling.test.ts > bkit-text-ceiling missing folders and a broken record > check fails and lower refuses when a text folder is missing or empty
AssertionError: expected '[bkit:text:ceiling] FAIL\nprompts: 0 …' to contain '.bkit/core/prompts'

- Expected
+ Received

- .bkit/core/prompts
+ [bkit:text:ceiling] FAIL
+ prompts: 0 words is below the ceiling of 5. Lower the ceiling in this change: pnpm bkit:text:ceiling lower
+

 ❯ .bkit/core/engine/audits/repo/agent-text-ceiling.test.ts:252:21
    250|       const c = run(["check"], fx);
    251|       expect(c.status).toBe(1);
    252|       expect(c.out).toContain(".bkit/core/prompts");
       |                     ^
    253|       for (const args of [["lower"], ["raise", "--reason", "why"]]) {
    254|         const r = run(args, fx);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/7]⎯

 FAIL  .bkit/core/engine/audits/repo/agent-text-ceiling.test.ts > bkit-text-ceiling missing folders and a broken record > check, lower and raise each fail with one line naming the record when it is not valid JSON
AssertionError: expected [ '<anonymous_script>:2', …(10) ] to have a length of 1 but got 11

- Expected
+ Received

- 1
+ 11

 ❯ .bkit/core/engine/audits/repo/agent-text-ceiling.test.ts:274:21
    272|       expect(r.status).not.toBeNull();
    273|       const lines = r.out.split("\n").filter((l) => l.trim() !== "");
    274|       expect(lines).toHaveLength(1);
       |                     ^
    275|       expect(r.out).toContain("scripts/gate/bkit-text-ceiling.json");
    276|       expect(r.out).toContain("not valid JSON");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/7]⎯


 Test Files  1 failed (1)
      Tests  7 failed | 6 passed (13)
   Start at  06:37:30
   Duration  414ms (tests 94%, setup 5%, transform 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-GnSSlq/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
