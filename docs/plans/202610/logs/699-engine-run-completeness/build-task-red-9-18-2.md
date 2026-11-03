
> @cbartens/bkit@6.0.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/699-engine-run-completeness
> bash scripts/ci/test-file.sh .bkit/core/engine/checks/status-holes.test.ts


 RUN  v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/699-engine-run-completeness

 ❯ .bkit/core/engine/checks/status-holes.test.ts (57 tests | 3 failed) 198ms
   ✓ source derivation (6)
     ✓ derives the expected step universe for every workflow 24ms
     ✓ reports table drift without failing 0ms
     ✓ records every BKIT literal in a step as a required call 0ms
     ✓ derives a required call from each {BKIT} literal of every live step section 18ms
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
     ✓ Path A: no holes against real bkit-ship.md 3ms
     ✓ Path A with engine-action rows interleaved: same report 7ms
     ✓ Path B: no holes against real bkit-ship.md 3ms
     ✓ MERGED-on-entry: no holes against real bkit-ship.md 3ms
     ✓ retry-loop Path B: no holes (failure steps optional) 3ms
     ✓ holey fixture: ship-regression-guard missing surfaces in advisory report 3ms
     ✓ invented name (ship-resume-human-override) surfaces as unexpected 3ms
     ✓ aborted run with pre-abort hole detected 4ms
     ✓ empty status.jsonl → IN_PROGRESS, no holes, no crash 3ms
     ✓ unparseable lines skipped without crash 3ms
   ✓ formatAdvisoryReport (2)
     ✓ includes ADVISORY prefix + fail-open note 3ms
     ✓ includes path classification in output 3ms
   ✓ CLI main() — advisory exit 0 (4)
     ✓ exits 0 with advisory output on a known-holey fixture (no throw) 4ms
     ✓ finds bkit-ship.md from the built dist/ layout, not only from source 34ms
     ✓ main() with no args writes skip message and returns (exit 0) 0ms
     ✓ main() with missing file writes skip message and returns (exit 0) 0ms
   ✓ step conditionality (2)
     ✓ classifies a step conditional only under the column-0 marker rule 17ms
     ✓ does not report a conditional step as a step hole 0ms
   ✓ CLI sweep summary (1)
     ✓ prints a sweep summary line and exits 0 14ms
   ❯ check — hole classes (9)
     ✓ names an evidence hole with its missing calls 1ms
     ✓ reports a missing required step as a step hole 0ms
     ✓ reports unexercised calls without marking the run holey 0ms
     × charges calls below a step's finish line to that step 15ms
     × calls outside the journal window are matched but never required 1ms
     × never requires the workflows start call, which a fresh run cannot journal 3ms
     ✓ reports an untaken route arm as unexercised 19ms
     ✓ gives each group-loop repeat its own gaps 0ms
     ✓ matches workflow-level calls outside any step 0ms
   ✓ check — verdict metadata (5)
     ✓ gives a pre-journal run a steps-only verdict 0ms
     ✓ names a call no contract step owns 0ms
     ✓ excludes its own journaled call 0ms
     ✓ takes the last completeness row and recomputes when rows follow it 0ms
     ✓ reports a hole in a long-closed run with no baseline 0ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 3 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/checks/status-holes.test.ts > check — hole classes > charges calls below a step's finish line to that step
AssertionError: design: expected [ { …(4) } ] to deeply equal []

- Expected
+ Received

- []
+ [
+   {
+     "index": 1,
+     "missing": [
+       {
+         "flags": [
+           "workflow",
+           "fid",
+           "month",
+           "lock-held",
+           "token",
+         ],
+         "noun": "workflows",
+         "verb": "start",
+       },
+     ],
+     "number": 2,
+     "step": "design-start-workflow",
+   },
+ ]

 ❯ .bkit/core/engine/checks/status-holes.test.ts:1026:43
    1024|     for (const name of FLOWS) {
    1025|       const verdict = check(replay(name, false), deriveContract(flowMd…
    1026|       expect(verdict.evidenceHoles, name).toEqual([]);
       |                                           ^
    1027|       expect(verdict.unexpected, name).toEqual([]);
    1028|       expect(verdict.unattributable, name).toEqual([]);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/3]⎯

 FAIL  .bkit/core/engine/checks/status-holes.test.ts > check — hole classes > calls outside the journal window are matched but never required
AssertionError: expected [ Array(1) ] to deeply equal []

- Expected
+ Received

- []
+ [
+   {
+     "index": 1,
+     "missing": [
+       {
+         "flags": [
+           "workflow",
+         ],
+         "noun": "workflows",
+         "verb": "start",
+       },
+     ],
+     "number": 2,
+     "step": "build-b",
+   },
+ ]

 ❯ .bkit/core/engine/checks/status-holes.test.ts:1062:33
    1060|     ] as StatusRow[];
    1061|     const clean = check(inWindow, contract);
    1062|     expect(clean.evidenceHoles).toEqual([]);
       |                                 ^
    1063|     expect(clean.verdict).toBe("CLEAN");
    1064|     // An outside call the journal does hold is matched, never unexpec…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/3]⎯

 FAIL  .bkit/core/engine/checks/status-holes.test.ts > check — hole classes > never requires the workflows start call, which a fresh run cannot journal
AssertionError: design: expected [ 'workflows start', …(26) ] to not include 'workflows start'
 ❯ .bkit/core/engine/checks/status-holes.test.ts:1079:34
    1077|         u.calls.map((c) => `${c.noun} ${c.verb}`),
    1078|       );
    1079|       expect(required, name).not.toContain("workflows start");
       |                                  ^
    1080|       const verdict = check(replay(name, false), contract);
    1081|       expect(verdict.evidenceHoles, name).toEqual([]);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/3]⎯


 Test Files  1 failed (1)
      Tests  3 failed | 54 passed (57)
   Start at  17:32:40
   Duration  374ms (tests 66%, transform 22%, setup 8%, import 4%, worker 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-c0xymI/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
