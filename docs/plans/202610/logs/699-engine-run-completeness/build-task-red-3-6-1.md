
> @cbartens/bkit@6.0.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/699-engine-run-completeness
> vitest run --reporter=default --reporter=junit --outputFile.junit="$BKIT_TEST_REPORT" .bkit/core/engine/checks/status-holes.test.ts


 RUN  v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/699-engine-run-completeness

 ❯ .bkit/core/engine/checks/status-holes.test.ts (41 tests | 7 failed) 119ms
   ❯ source derivation (6)
     × derives the expected step universe for every workflow 14ms
     × reports table drift without failing 2ms
     × records every {BKIT} literal in a step as a required call 1ms
     × derives a required call from each {BKIT} literal of every live step section 7ms
     × parses a synthetic md with headings + literals 0ms
     × flags a status write that lives outside any numbered step (orphanSteps) 0ms
   ✓ classifyRun (6)
     ✓ classifies a clean Path A run (no conflict-resolve) 1ms
     ✓ classifies a Path B run (conflict-resolve present) 0ms
     ✓ classifies a MERGED-on-entry run (Step 2 routed to Step 13 before its writes) 0ms
     ✓ does NOT read a double hole as MERGED_ON_ENTRY (regression) 2ms
     ✓ classifies an aborted run (workflow-failed, no close-workflow) 0ms
     ✓ classifies an in-progress run (no close-workflow, no workflow-failed) 0ms
   ✓ computeMandatoryForPath (5)
     ✓ Path A excludes conflict-resolve + retry-loop steps 0ms
     ✓ Path B includes conflict-resolve, excludes retry-loop steps 0ms
     ✓ MERGED-on-entry excludes the entire middle 0ms
     ✓ ABORTED returns empty mandatory set 0ms
     ✓ IN_PROGRESS returns empty mandatory set 0ms
   ✓ detectHoles (7)
     ✓ reports no holes for a clean Path A run 1ms
     ✓ reports ship-regression-guard as missing when skipped in a completed Path A run 0ms
     ✓ reports conflict-resolve as missing when skipped in a completed Path B run 0ms
     ✓ surfaces invented step names as unexpected (ship-resume-human-override) 0ms
     ✓ does NOT flag absence of failure-diagnose/remediate (retry-loop steps) 0ms
     ✓ aborted run: flags pre-abort holes but not post-abort absences 0ms
     ✓ in-progress run: no holes reported 0ms
   ✓ auditStatusJsonl (end-to-end) (10)
     ✓ Path A: no holes against real bkit-ship.md 1ms
     ✓ Path A with engine-action rows interleaved: same report 1ms
     ✓ Path B: no holes against real bkit-ship.md 0ms
     ✓ MERGED-on-entry: no holes against real bkit-ship.md 0ms
     ✓ retry-loop Path B: no holes (failure steps optional) 0ms
     ✓ holey fixture: ship-regression-guard missing surfaces in advisory report 1ms
     ✓ invented name (ship-resume-human-override) surfaces as unexpected 1ms
     ✓ aborted run with pre-abort hole detected 1ms
     ✓ empty status.jsonl → IN_PROGRESS, no holes, no crash 0ms
     ✓ unparseable lines skipped without crash 1ms
   ✓ formatAdvisoryReport (2)
     ✓ includes ADVISORY prefix + fail-open note 1ms
     ✓ includes path classification in output 0ms
   ✓ CLI main() — advisory exit 0 (4)
     ✓ exits 0 with advisory output on a known-holey fixture (no throw) 2ms
     ✓ finds bkit-ship.md from the built dist/ layout, not only from source 60ms
     ✓ main() with no args writes skip message and returns (exit 0) 1ms
     ✓ main() with missing file writes skip message and returns (exit 0) 0ms
   ❯ CLI sweep summary (1)
     × prints a sweep summary line and exits 0 16ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 7 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/checks/status-holes.test.ts > source derivation > derives the expected step universe for every workflow
TypeError: deriveContract is not a function
 ❯ .bkit/core/engine/checks/status-holes.test.ts:150:24
    148|   it("derives the expected step universe for every workflow", () => {
    149|     for (const name of FLOWS) {
    150|       const contract = deriveContract(flowMd(name), name);
       |                        ^
    151|       expect([...contract.universe].sort(), name).toEqual([...tableKey…
    152|       expect(contract.drift, name).toEqual([]);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/7]⎯

 FAIL  .bkit/core/engine/checks/status-holes.test.ts > source derivation > reports table drift without failing
TypeError: deriveContract is not a function
 ❯ .bkit/core/engine/checks/status-holes.test.ts:162:22
    160|       "\n",
    161|     );
    162|     const contract = deriveContract(md, "ship");
       |                      ^
    163|     expect(contract.drift).toContain("source-but-not-table:ship-invent…
    164|     expect(contract.drift).toContain("table-but-not-source:ship-merge-…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/7]⎯

 FAIL  .bkit/core/engine/checks/status-holes.test.ts > source derivation > records every {BKIT} literal in a step as a required call
TypeError: deriveContract is not a function
 ❯ .bkit/core/engine/checks/status-holes.test.ts:182:22
    180|       '"{BKIT}" branches push --remote=origin',
    181|     ].join("\n");
    182|     const contract = deriveContract(md, "build");
       |                      ^
    183|     expect(contract.steps.map((s) => s.number)).toEqual([1, 2]);
    184|     expect(contract.steps[0]!.calls).toEqual([

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/7]⎯

 FAIL  .bkit/core/engine/checks/status-holes.test.ts > source derivation > derives a required call from each {BKIT} literal of every live step section
TypeError: deriveContract is not a function
 ❯ .bkit/core/engine/checks/status-holes.test.ts:198:24
    196|     for (const name of FLOWS) {
    197|       const md = flowMd(name);
    198|       const contract = deriveContract(md, name);
       |                        ^
    199|       const inSteps = stepSections(md).reduce(
    200|         (n, s) => n + (s.body.match(/"\{BKIT\}"/g)?.length ?? 0),

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/7]⎯

 FAIL  .bkit/core/engine/checks/status-holes.test.ts > source derivation > parses a synthetic md with headings + literals
TypeError: deriveContract is not a function
 ❯ .bkit/core/engine/checks/status-holes.test.ts:220:12
    218|       "```",
    219|     ].join("\n");
    220|     expect(deriveContract(fakeMd, "ship").universe).toEqual([
       |            ^
    221|       "ship-start-workflow",
    222|       "ship-worktree-setup",

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/7]⎯

 FAIL  .bkit/core/engine/checks/status-holes.test.ts > source derivation > flags a status write that lives outside any numbered step (orphanSteps)
TypeError: deriveContract is not a function
 ❯ .bkit/core/engine/checks/status-holes.test.ts:237:22
    235|       "```",
    236|     ].join("\n");
    237|     const contract = deriveContract(fakeMd, "ship");
       |                      ^
    238|     expect(contract.universe).toEqual(["ship-start-workflow"]);
    239|     expect(contract.orphanSteps).toEqual(["ship-orphaned-write"]);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[6/7]⎯

 FAIL  .bkit/core/engine/checks/status-holes.test.ts > CLI sweep summary > prints a sweep summary line and exits 0
AssertionError: expected '\n/var/folders/td/lj74ml2d0jz3thjqszy…' to contain '[bkit-status-holes] sweep: 4 file(s),…'

- Expected
+ Received

- [bkit-status-holes] sweep: 4 file(s), 3 holey
+
+ /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-shd-sweep-GRSM1U/a.jsonl
+ [bkit-status-holes] ADVISORY — fail-open (exit 0 regardless)
+   path: PATH_A
+   observed: 3 step(s)
+   missing (mandatory for PATH_A): ship-bookkeeping-push, ship-deferred-sweep, ship-merge-pr, ship-prune-skills, ship-regression-guard, ship-summary, ship-switch-to-dev, ship-update-docs
+   unexpected: none
+
+ /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-shd-sweep-GRSM1U/b.jsonl
+ [bkit-status-holes] ADVISORY — fail-open (exit 0 regardless)
+   path: IN_PROGRESS
+   observed: 0 step(s)
+   missing: none
+   unexpected: none
+
+ /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-shd-sweep-GRSM1U/c.jsonl
+ [bkit-status-holes] ADVISORY — fail-open (exit 0 regardless)
+   path: IN_PROGRESS
+   observed: 0 step(s)
+   missing: none
+   unexpected: none
+
+ /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-shd-sweep-GRSM1U/d.jsonl
+ [bkit-status-holes] ADVISORY — fail-open (exit 0 regardless)
+   path: PATH_A
+   observed: 11 step(s)
+   missing: none
+   unexpected: none


 ❯ .bkit/core/engine/checks/status-holes.test.ts:766:19
    764|       const clean = write("d.jsonl", pathAStatus());
    765|       const out = capture([holeyShip, mixed, junk, clean]);
    766|       expect(out).toContain("[bkit-status-holes] sweep: 4 file(s), 3 h…
       |                   ^
    767|       expect(out.match(/\[bkit-status-holes\] sweep:/g)).toHaveLength(…
    768|       expect(out).toContain(`${junk}: no workflow rows`);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[7/7]⎯


 Test Files  1 failed (1)
      Tests  7 failed | 34 passed (41)
   Start at  08:01:07
   Duration  644ms (transform 52%, tests 27%, setup 15%, import 5%, worker 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-3V0og5/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
