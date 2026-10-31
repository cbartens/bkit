
> @cbartens/bkit@6.0.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/699-engine-run-completeness
> vitest run --reporter=default --reporter=junit --outputFile.junit="$BKIT_TEST_REPORT" .bkit/core/engine/checks/status-holes.test.ts

[test-timeout-budget] load average 16.9 on 10 cores: unit limits 8432ms per test, 16863ms per hook (x1.69)

 RUN  v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/699-engine-run-completeness

 ❯ .bkit/core/engine/checks/status-holes.test.ts (55 tests | 1 failed) 213ms
   ✓ source derivation (6)
     ✓ derives the expected step universe for every workflow 21ms
     ✓ reports table drift without failing 1ms
     ✓ records every BKIT literal in a step as a required call 0ms
     ✓ derives a required call from each {BKIT} literal of every live step section 13ms
     ✓ parses a synthetic md with headings + literals 0ms
     ✓ flags a status write that lives outside any numbered step (orphanSteps) 0ms
   ✓ classifyRun (6)
     ✓ classifies a clean Path A run (no conflict-resolve) 0ms
     ✓ classifies a Path B run (conflict-resolve present) 0ms
     ✓ classifies a MERGED-on-entry run (Step 2 routed to Step 13 before its writes) 0ms
     ✓ does NOT read a double hole as MERGED_ON_ENTRY (regression) 0ms
     ✓ classifies an aborted run (workflow-failed, no close-workflow) 0ms
     ✓ classifies an in-progress run (no close-workflow, no workflow-failed) 0ms
   ✓ computeMandatoryForPath (5)
     ✓ Path A excludes conflict-resolve + retry-loop steps 0ms
     ✓ Path B includes conflict-resolve, excludes retry-loop steps 0ms
     ✓ MERGED-on-entry excludes the entire middle 0ms
     ✓ ABORTED returns empty mandatory set 0ms
     ✓ IN_PROGRESS returns empty mandatory set 0ms
   ✓ detectHoles (7)
     ✓ reports no holes for a clean Path A run 0ms
     ✓ reports ship-regression-guard as missing when skipped in a completed Path A run 0ms
     ✓ reports conflict-resolve as missing when skipped in a completed Path B run 0ms
     ✓ surfaces invented step names as unexpected (ship-resume-human-override) 0ms
     ✓ does NOT flag absence of failure-diagnose/remediate (retry-loop steps) 0ms
     ✓ aborted run: flags pre-abort holes but not post-abort absences 0ms
     ✓ in-progress run: no holes reported 0ms
   ✓ auditStatusJsonl (end-to-end) (10)
     ✓ Path A: no holes against real bkit-ship.md 2ms
     ✓ Path A with engine-action rows interleaved: same report 4ms
     ✓ Path B: no holes against real bkit-ship.md 2ms
     ✓ MERGED-on-entry: no holes against real bkit-ship.md 2ms
     ✓ retry-loop Path B: no holes (failure steps optional) 3ms
     ✓ holey fixture: ship-regression-guard missing surfaces in advisory report 3ms
     ✓ invented name (ship-resume-human-override) surfaces as unexpected 2ms
     ✓ aborted run with pre-abort hole detected 2ms
     ✓ empty status.jsonl → IN_PROGRESS, no holes, no crash 2ms
     ✓ unparseable lines skipped without crash 2ms
   ✓ formatAdvisoryReport (2)
     ✓ includes ADVISORY prefix + fail-open note 2ms
     ✓ includes path classification in output 2ms
   ✓ CLI main() — advisory exit 0 (4)
     ✓ exits 0 with advisory output on a known-holey fixture (no throw) 3ms
     ✓ finds bkit-ship.md from the built dist/ layout, not only from source 68ms
     ✓ main() with no args writes skip message and returns (exit 0) 0ms
     ✓ main() with missing file writes skip message and returns (exit 0) 0ms
   ✓ step conditionality (2)
     ✓ classifies a step conditional only under the column-0 marker rule 12ms
     ✓ does not report a conditional step as a step hole 0ms
   ✓ CLI sweep summary (1)
     ✓ prints a sweep summary line and exits 0 10ms
   ✓ check — hole classes (7)
     ✓ names an evidence hole with its missing calls 2ms
     ✓ reports a missing required step as a step hole 1ms
     ✓ reports unexercised calls without marking the run holey 0ms
     ✓ charges calls below a step's finish line to that step 26ms
     ✓ reports an untaken route arm as unexercised 13ms
     ✓ gives each group-loop repeat its own gaps 1ms
     ✓ matches workflow-level calls outside any step 0ms
   ❯ check — verdict metadata (5)
     ✓ gives a pre-journal run a steps-only verdict 0ms
     ✓ names a call no contract step owns 0ms
     ✓ excludes its own journaled call 0ms
     × takes the last completeness row and recomputes when rows follow it 7ms
     ✓ reports a hole in a long-closed run with no baseline 0ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/checks/status-holes.test.ts > check — verdict metadata > takes the last completeness row and recomputes when rows follow it
AssertionError: expected 'computed' to be 'stored' // Object.is equality

Expected: "stored"
Received: "computed"

 ❯ .bkit/core/engine/checks/status-holes.test.ts:1236:26
    1234|     const base = [stepRow("build-a"), stepRow("build-close-workflow")];
    1235|     const first = readCompleteness([...base, stored("CLEAN"), stored("…
    1236|     expect(first.source).toBe("stored");
       |                          ^
    1237|     expect(first.verdict.verdict).toBe("HOLEY");
    1238|     expect(first.verdict.holey).toBe(true);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 54 passed (55)
   Start at  12:21:15
   Duration  569ms (tests 47%, transform 37%, setup 9%, import 6%, worker 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-kboJDy/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
