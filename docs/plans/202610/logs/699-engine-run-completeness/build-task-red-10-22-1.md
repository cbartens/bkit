
> @cbartens/bkit@6.0.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/699-engine-run-completeness
> bash scripts/ci/test-file.sh .bkit/core/engine/checks/status-holes.test.ts


 RUN  v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/699-engine-run-completeness

 ❯ .bkit/core/engine/checks/status-holes.test.ts (59 tests | 2 failed) 266ms
   ✓ source derivation (6)
     ✓ derives the expected step universe for every workflow 27ms
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
     ✓ Path A: no holes against real bkit-ship.md 4ms
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
     ✓ finds bkit-ship.md from the built dist/ layout, not only from source 37ms
     ✓ main() with no args writes skip message and returns (exit 0) 0ms
     ✓ main() with missing file writes skip message and returns (exit 0) 0ms
   ✓ step conditionality (2)
     ✓ classifies a step conditional only under the column-0 marker rule 17ms
     ✓ does not report a conditional step as a step hole 0ms
   ✓ CLI sweep summary (1)
     ✓ prints a sweep summary line and exits 0 14ms
   ❯ check — hole classes (11)
     × a tracker-none run that journals every rendered call is CLEAN 7ms
     ✓ names an evidence hole with its missing calls 0ms
     × a run whose journal starts mid-run reports no evidence hole for steps finished before its first engine-call row 0ms
     ✓ reports a missing required step as a step hole 0ms
     ✓ reports unexercised calls without marking the run holey 0ms
     ✓ charges calls below a step's finish line to that step 40ms
     ✓ calls outside the journal window are matched but never required 0ms
     ✓ never requires the workflows start call, which a fresh run cannot journal 34ms
     ✓ reports an untaken route arm as unexercised 19ms
     ✓ gives each group-loop repeat its own gaps 0ms
     ✓ matches workflow-level calls outside any step 0ms
   ✓ check — verdict metadata (5)
     ✓ gives a pre-journal run a steps-only verdict 0ms
     ✓ names a call no contract step owns 0ms
     ✓ excludes its own journaled call 0ms
     ✓ takes the last completeness row and recomputes when rows follow it 0ms
     ✓ reports a hole in a long-closed run with no baseline 0ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 2 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/checks/status-holes.test.ts > check — hole classes > a tracker-none run that journals every rendered call is CLEAN
AssertionError: design: expected [ { …(4) }, …(2) ] to deeply equal []

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
+           "run",
+           "file",
+           "prompt-file",
+         ],
+         "noun": "workflows",
+         "verb": "input",
+       },
+     ],
+     "number": 2,
+     "step": "design-start-workflow",
+   },
+   {
+     "index": 1,
+     "missing": [
+       {
+         "flags": [
+           "workflow",
+           "fid",
+           "month",
+           "resolve",
+         ],
+         "noun": "workflows",
+         "verb": "promote",
+       },
+       {
+         "flags": [
+           "workflow",
+           "file",
+         ],
+         "noun": "workflows",
+         "verb": "summary",
+       },
+     ],
+     "number": 10,
+     "step": "design-summary",
+   },
+   {
+     "index": 1,
+     "missing": [
+       {
+         "flags": [
+           "workflow",
+           "fid",
+           "month",
+           "file",
+         ],
+         "noun": "workflows",
+         "verb": "promote",
+       },
+       {
+         "flags": [
+           "workflow",
+           "fid",
+           "month",
+           "record-step",
+           "outbox",
+           "message",
+           "final-return",
+           "summary-file",
+           "session-dir",
+         ],
+         "noun": "workflows",
+         "verb": "close",
+       },
+     ],
+     "number": 12,
+     "step": "design-close-workflow",
+   },
+ ]

 ❯ .bkit/core/engine/checks/status-holes.test.ts:928:43
    926|     for (const name of ["design", "plan", "debug", "ship"] as const) {
    927|       const verdict = check(noneRows(name), deriveContract(flowMd(name…
    928|       expect(verdict.evidenceHoles, name).toEqual([]);
       |                                           ^
    929|       expect(verdict.verdict, name).toBe("CLEAN");
    930|     }

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/2]⎯

 FAIL  .bkit/core/engine/checks/status-holes.test.ts > check — hole classes > a run whose journal starts mid-run reports no evidence hole for steps finished before its first engine-call row
AssertionError: expected [ 'build-worktree-setup', 'build-b' ] to deeply equal [ 'build-b' ]

- Expected
+ Received

  [
+   "build-worktree-setup",
    "build-b",
  ]

 ❯ .bkit/core/engine/checks/status-holes.test.ts:991:53
    989|     );
    990|     expect(midRun.preJournal).toBe(false);
    991|     expect(midRun.evidenceHoles.map((h) => h.step)).toEqual(["build-b"…
       |                                                     ^
    992|     const none = check(
    993|       [stepRow("build", "build-worktree-setup"), stepRow("build", "bui…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/2]⎯


 Test Files  1 failed (1)
      Tests  2 failed | 57 passed (59)
   Start at  17:59:15
   Duration  429ms (tests 71%, transform 19%, setup 6%, import 3%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-Wqi9Ek/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
