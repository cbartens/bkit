
> @cbartens/bkit@6.0.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/699-engine-run-completeness
> bash scripts/ci/test-file.sh .bkit/core/engine/ledgers/journal.integration.test.ts


 RUN  v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/699-engine-run-completeness

 ❯ .bkit/core/engine/ledgers/journal.integration.test.ts (5 tests | 1 failed) 522ms
   ❯ the dispatch seam on a real worktree (5)
     ✓ writes friction to the run's own book root 114ms
     ✓ writes no friction row for a declared routing exit 89ms
     ✓ skips a call made outside the run's worktree 121ms
     ✓ writes nothing when no run is active in the cwd 117ms
     × branches anchor-read with a plan --file journals into the active run 80ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/ledgers/journal.integration.test.ts > the dispatch seam on a real worktree > branches anchor-read with a plan --file journals into the active run
AssertionError: expected [] to have a length of 1 but got +0

- Expected
+ Received

- 1
+ 0

 ❯ .bkit/core/engine/ledgers/journal.integration.test.ts:171:19
    169|     );
    170|     const calls = rows(path.join(worktree, STATUS_REL)).filter((r) => …
    171|     expect(calls).toHaveLength(1);
       |                   ^
    172|     expect(calls[0]).toMatchObject({ workflow: "build", noun: "branche…
    173|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 4 passed (5)
   Start at  17:58:56
   Duration  937ms (tests 60%, transform 31%, import 5%, setup 3%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-BM8FMR/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
