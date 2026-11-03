
> @cbartens/bkit@6.0.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/699-engine-run-completeness
> bash scripts/ci/test-file.sh .bkit/core/engine/checks/status-holes.test.ts


 RUN  v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/699-engine-run-completeness

 ❯ .bkit/core/engine/checks/status-holes.test.ts (56 tests | 1 failed) 386ms
   ✓ source derivation (6)
     ✓ derives the expected step universe for every workflow 34ms
     ✓ reports table drift without failing 1ms
     ✓ records every BKIT literal in a step as a required call 1ms
     ✓ derives a required call from each {BKIT} literal of every live step section 18ms
     ✓ parses a synthetic md with headings + literals 1ms
     ✓ flags a status write that lives outside any numbered step (orphanSteps) 0ms
   ✓ classifyRun (6)
     ✓ classifies a clean Path A run (no conflict-resolve) 0ms
     ✓ classifies a Path B run (conflict-resolve present) 0ms
     ✓ classifies a MERGED-on-entry run (Step 2 routed to Step 13 before its writes) 0ms
     ✓ does NOT read a double hole as MERGED_ON_ENTRY (regression) 1ms
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
     ✓ aborted run: flags pre-abort holes but not post-abort absences 1ms
     ✓ in-progress run: no holes reported 0ms
   ✓ auditStatusJsonl (end-to-end) (10)
     ✓ Path A: no holes against real bkit-ship.md 4ms
     ✓ Path A with engine-action rows interleaved: same report 6ms
     ✓ Path B: no holes against real bkit-ship.md 3ms
     ✓ MERGED-on-entry: no holes against real bkit-ship.md 3ms
     ✓ retry-loop Path B: no holes (failure steps optional) 4ms
     ✓ holey fixture: ship-regression-guard missing surfaces in advisory report 3ms
     ✓ invented name (ship-resume-human-override) surfaces as unexpected 4ms
     ✓ aborted run with pre-abort hole detected 4ms
     ✓ empty status.jsonl → IN_PROGRESS, no holes, no crash 5ms
     ✓ unparseable lines skipped without crash 3ms
   ✓ formatAdvisoryReport (2)
     ✓ includes ADVISORY prefix + fail-open note 2ms
     ✓ includes path classification in output 4ms
   ✓ CLI main() — advisory exit 0 (4)
     ✓ exits 0 with advisory output on a known-holey fixture (no throw) 5ms
     ✓ finds bkit-ship.md from the built dist/ layout, not only from source 127ms
     ✓ main() with no args writes skip message and returns (exit 0) 0ms
     ✓ main() with missing file writes skip message and returns (exit 0) 0ms
   ✓ step conditionality (2)
     ✓ classifies a step conditional only under the column-0 marker rule 42ms
     ✓ does not report a conditional step as a step hole 1ms
   ✓ CLI sweep summary (1)
     ✓ prints a sweep summary line and exits 0 18ms
   ❯ check — hole classes (8)
     ✓ names an evidence hole with its missing calls 3ms
     ✓ reports a missing required step as a step hole 1ms
     ✓ reports unexercised calls without marking the run holey 1ms
     ✓ charges calls below a step's finish line to that step 43ms
     × calls outside the journal window are matched but never required 8ms
     ✓ reports an untaken route arm as unexercised 22ms
     ✓ gives each group-loop repeat its own gaps 2ms
     ✓ matches workflow-level calls outside any step 1ms
   ✓ check — verdict metadata (5)
     ✓ gives a pre-journal run a steps-only verdict 0ms
     ✓ names a call no contract step owns 0ms
     ✓ excludes its own journaled call 1ms
     ✓ takes the last completeness row and recomputes when rows follow it 1ms
     ✓ reports a hole in a long-closed run with no baseline 0ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/checks/status-holes.test.ts > check — hole classes > calls outside the journal window are matched but never required
AssertionError: expected [ 'branches check', …(7) ] to not include 'branches check'
 ❯ .bkit/core/engine/checks/status-holes.test.ts:1045:26
    1043|       u.calls.map((c) => `${c.noun} ${c.verb}`),
    1044|     );
    1045|     expect(required).not.toContain("branches check");
       |                          ^
    1046|     expect(required).not.toContain("prs probe");
    1047|     expect(required).toContain("tests run");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 55 passed (56)
   Start at  17:10:47
   Duration  1.21s (transform 43%, tests 42%, setup 10%, import 5%, worker 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-jDLGgz/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
