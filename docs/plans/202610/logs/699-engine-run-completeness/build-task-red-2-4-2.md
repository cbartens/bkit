
> @cbartens/bkit@6.0.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/699-engine-run-completeness
> vitest run --reporter=default --reporter=junit --outputFile.junit="$BKIT_TEST_REPORT" .bkit/core/engine/ledgers/journal.integration.test.ts


 RUN  v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/699-engine-run-completeness

 ❯ .bkit/core/engine/ledgers/journal.integration.test.ts (4 tests | 4 failed) 269ms
   ❯ the dispatch seam on a real worktree (4)
     × writes friction to the run's own book root 63ms
     × writes no friction row for a declared routing exit 86ms
     × skips a call made outside the run's worktree 59ms
     × writes nothing when no run is active in the cwd 59ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 4 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/ledgers/journal.integration.test.ts > the dispatch seam on a real worktree > writes friction to the run's own book root
AssertionError: expected [] to have a length of 1 but got +0

- Expected
+ Received

- 1
+ 0

 ❯ .bkit/core/engine/ledgers/journal.integration.test.ts:100:22
     98|
     99|     const friction = rows(path.join(worktree, ".bkit", "friction.jsonl…
    100|     expect(friction).toHaveLength(1);
       |                      ^
    101|     expect(friction[0]).toMatchObject({
    102|       kind: "friction",

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/4]⎯

 FAIL  .bkit/core/engine/ledgers/journal.integration.test.ts > the dispatch seam on a real worktree > writes no friction row for a declared routing exit
AssertionError: expected [] to have a length of 1 but got +0

- Expected
+ Received

- 1
+ 0

 ❯ .bkit/core/engine/ledgers/journal.integration.test.ts:125:7
    123|     expect(
    124|       rows(path.join(worktree, STATUS_REL)).filter((r) => r["type"] ==…
    125|     ).toHaveLength(1);
       |       ^
    126|   });
    127|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/4]⎯

 FAIL  .bkit/core/engine/ledgers/journal.integration.test.ts > the dispatch seam on a real worktree > skips a call made outside the run's worktree
AssertionError: expected [] to have a length of 1 but got +0

- Expected
+ Received

- 1
+ 0

 ❯ .bkit/core/engine/ledgers/journal.integration.test.ts:139:21
    137|     // Control: the same verb from inside the worktree is journaled, s…
    138|     await run(worktree, ["widgets", "odd"]);
    139|     expect(calls()).toHaveLength(1);
       |                     ^
    140|   });
    141|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/4]⎯

 FAIL  .bkit/core/engine/ledgers/journal.integration.test.ts > the dispatch seam on a real worktree > writes nothing when no run is active in the cwd
AssertionError: expected [] to have a length of 1 but got +0

- Expected
+ Received

- 1
+ 0

 ❯ .bkit/core/engine/ledgers/journal.integration.test.ts:155:69
    153|     fs.writeFileSync(status, saved);
    154|     await run(worktree, ["widgets", "odd"]);
    155|     expect(rows(status).filter((r) => r["type"] === "engine-call")).to…
       |                                                                     ^
    156|   });
    157| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/4]⎯


 Test Files  1 failed (1)
      Tests  4 failed (4)
   Start at  07:00:22
   Duration  391ms (tests 78%, transform 14%, setup 5%, import 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-NsYOd6/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
