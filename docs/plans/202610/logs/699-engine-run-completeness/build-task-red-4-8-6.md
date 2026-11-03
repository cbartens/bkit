
> @cbartens/bkit@6.0.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/699-engine-run-completeness
> vitest run --reporter=default --reporter=junit --outputFile.junit="$BKIT_TEST_REPORT" .bkit/core/engine/checks/status-holes.test.ts


 RUN  v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/699-engine-run-completeness

 ❯ .bkit/core/engine/checks/status-holes.test.ts (50 tests | 7 failed) 120ms
   ✓ source derivation (6)
     ✓ derives the expected step universe for every workflow 14ms
     ✓ reports table drift without failing 1ms
     ✓ records every BKIT literal in a step as a required call 0ms
     ✓ derives a required call from each {BKIT} literal of every live step section 8ms
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
     ✓ Path A with engine-action rows interleaved: same report 2ms
     ✓ Path B: no holes against real bkit-ship.md 1ms
     ✓ MERGED-on-entry: no holes against real bkit-ship.md 1ms
     ✓ retry-loop Path B: no holes (failure steps optional) 1ms
     ✓ holey fixture: ship-regression-guard missing surfaces in advisory report 1ms
     ✓ invented name (ship-resume-human-override) surfaces as unexpected 1ms
     ✓ aborted run with pre-abort hole detected 1ms
     ✓ empty status.jsonl → IN_PROGRESS, no holes, no crash 1ms
     ✓ unparseable lines skipped without crash 1ms
   ✓ formatAdvisoryReport (2)
     ✓ includes ADVISORY prefix + fail-open note 1ms
     ✓ includes path classification in output 1ms
   ✓ CLI main() — advisory exit 0 (4)
     ✓ exits 0 with advisory output on a known-holey fixture (no throw) 2ms
     ✓ finds bkit-ship.md from the built dist/ layout, not only from source 42ms
     ✓ main() with no args writes skip message and returns (exit 0) 0ms
     ✓ main() with missing file writes skip message and returns (exit 0) 0ms
   ✓ step conditionality (2)
     ✓ classifies a step conditional only under the column-0 marker rule 6ms
     ✓ does not report a conditional step as a step hole 0ms
   ✓ CLI sweep summary (1)
     ✓ prints a sweep summary line and exits 0 6ms
   ❯ check — hole classes (7)
     × names an evidence hole with its missing calls 5ms
     × reports a missing required step as a step hole 2ms
     × reports unexercised calls without marking the run holey 1ms
     × charges calls below a step's finish line to that step 6ms
     × reports an untaken route arm as unexercised 5ms
     × gives each group-loop repeat its own gaps 1ms
     × matches workflow-level calls outside any step 1ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 7 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/checks/status-holes.test.ts > check — hole classes > names an evidence hole with its missing calls
AssertionError: expected 'CLEAN' to be 'HOLEY' // Object.is equality

Expected: "HOLEY"
Received: "CLEAN"

 ❯ .bkit/core/engine/checks/status-holes.test.ts:922:27
    920|       contract,
    921|     );
    922|     expect(holey.verdict).toBe("HOLEY");
       |                           ^
    923|     expect(holey.evidenceHoles).toHaveLength(1);
    924|     expect(holey.evidenceHoles[0]).toMatchObject({ step: "build-a", nu…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/7]⎯

 FAIL  .bkit/core/engine/checks/status-holes.test.ts > check — hole classes > reports a missing required step as a step hole
AssertionError: expected [] to deeply equal [ 'build-b' ]

- Expected
+ Received

- [
-   "build-b",
- ]
+ []

 ❯ .bkit/core/engine/checks/status-holes.test.ts:959:30
    957|       contract,
    958|     );
    959|     expect(closed.stepHoles).toEqual(["build-b"]);
       |                              ^
    960|     expect(closed.holey).toBe(true);
    961|     // Not closed and not failed: nothing is a hole yet.

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/7]⎯

 FAIL  .bkit/core/engine/checks/status-holes.test.ts > check — hole classes > reports unexercised calls without marking the run holey
AssertionError: expected [] to deeply equal [ { step: 'build-route', …(1) } ]

- Expected
+ Received

- [
-   {
-     "call": {
-       "noun": "counters",
-       "verb": "route",
-     },
-     "step": "build-route",
-   },
- ]
+ []

 ❯ .bkit/core/engine/checks/status-holes.test.ts:1003:33
    1001|       deriveContract(md.replace("## 🧠 Step 1 — Route", '## 🧠 Step 1 …
    1002|     );
    1003|     expect(verdict.unexercised).toEqual([
       |                                 ^
    1004|       { step: "build-route", call: { noun: "counters", verb: "route" }…
    1005|     ]);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/7]⎯

 FAIL  .bkit/core/engine/checks/status-holes.test.ts > check — hole classes > charges calls below a step's finish line to that step
AssertionError: design: expected [ …(42) ] to deeply equal []

- Expected
+ Received

- []
+ [
+   {
+     "noun": "fids",
+     "verb": "parse",
+   },
+   {
+     "noun": "fids",
+     "verb": "parse",
+   },
+   {
+     "noun": "issues",
+     "verb": "fetch",
+   },
+   {
+     "noun": "fids",
+     "verb": "resolve",
+   },
+   {
+     "noun": "locks",
+     "verb": "acquire",
+   },
+   {
+     "noun": "issues",
+     "verb": "labels",
+   },
+   {
+     "noun": "issues",
+     "verb": "comment",
+   },
+   {
+     "noun": "steps",
+     "verb": "gate",
+   },
+   {
+     "noun": "ledgers",
+     "verb": "commit",
+   },
+   {
+     "noun": "worktrees",
+     "verb": "setup",
+   },
+   {
+     "noun": "branches",
+     "verb": "rebase",
+   },
+   {
+     "noun": "workflows",
+     "verb": "start",
+   },
+   {
+     "noun": "runtime",
+     "verb": "row",
+   },
+   {
+     "noun": "runtime",
+     "verb": "assert",
+   },
+   {
+     "noun": "workflows",
+     "verb": "input",
+   },
+   {
+     "noun": "steps",
+     "verb": "done",
+   },
+   {
+     "noun": "steps",
+     "verb": "finish",
+   },
+   {
+     "noun": "runtime",
+     "verb": "assert",
+   },
+   {
+     "noun": "counters",
+     "verb": "max",
+   },
+   {
+     "noun": "status",
+     "verb": "row",
+   },
+   {
+     "noun": "status",
+     "verb": "row",
+   },
+   {
+     "noun": "steps",
+     "verb": "finish",
+   },
+   {
+     "noun": "issues",
+     "verb": "related",
+   },
+   {
+     "noun": "steps",
+     "verb": "finish",
+   },
+   {
+     "noun": "steps",
+     "verb": "finish",
+   },
+   {
+     "noun": "steps",
+     "verb": "finish",
+   },
+   {
+     "noun": "steps",
+     "verb": "finish",
+   },
+   {
+     "noun": "steps",
+     "verb": "finish",
+   },
+   {
+     "noun": "steps",
+     "verb": "finish",
+   },
+   {
+     "noun": "workflows",
+     "verb": "promote",
+   },
+   {
+     "noun": "workflows",
+     "verb": "summary",
+   },
+   {
+     "noun": "steps",
+     "verb": "finish",
+   },
+   {
+     "noun": "branches",
+     "verb": "push",
+   },
+   {
+     "noun": "plans",
+     "verb": "parse",
+   },
+   {
+     "noun": "plans",
+     "verb": "comment",
+   },
+   {
+     "noun": "steps",
+     "verb": "finish",
+   },
+   {
+     "noun": "workflows",
+     "verb": "promote",
+   },
+   {
+     "noun": "workflows",
+     "verb": "close",
+   },
+   {
+     "noun": "branches",
+     "verb": "land",
+   },
+   {
+     "noun": "issues",
+     "verb": "labels",
+   },
+   {
+     "noun": "workflows",
+     "verb": "links",
+   },
+   {
+     "noun": "steps",
+     "verb": "gate",
+   },
+ ]

 ❯ .bkit/core/engine/checks/status-holes.test.ts:1018:40
    1016|       const verdict = check(replay(name, false), deriveContract(flowMd…
    1017|       expect(verdict.evidenceHoles, name).toEqual([]);
    1018|       expect(verdict.unexpected, name).toEqual([]);
       |                                        ^
    1019|       expect(verdict.unattributable, name).toEqual([]);
    1020|       expect(verdict.stepHoles, name).toEqual([]);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/7]⎯

 FAIL  .bkit/core/engine/checks/status-holes.test.ts > check — hole classes > reports an untaken route arm as unexercised
AssertionError: expected [] to deep equally contain { step: 'build-run-tests', …(1) }

- Expected:
{
  "call": {
    "noun": "counters",
    "verb": "route",
  },
  "step": "build-run-tests",
}

+ Received:
[]

 ❯ .bkit/core/engine/checks/status-holes.test.ts:1035:33
    1033|     const verdict = check(replay("build", false), build);
    1034|     expect(verdict.holey).toBe(false);
    1035|     expect(verdict.unexercised).toContainEqual({
       |                                 ^
    1036|       step: step12.keys[0],
    1037|       call: { noun: "counters", verb: "route" },

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/7]⎯

 FAIL  .bkit/core/engine/checks/status-holes.test.ts > check — hole classes > gives each group-loop repeat its own gaps
AssertionError: expected [] to have a length of 1 but got +0

- Expected
+ Received

- 1
+ 0

 ❯ .bkit/core/engine/checks/status-holes.test.ts:1069:33
    1067|     const holey = check(rows([]), contract);
    1068|     expect(holey.unattributable).toEqual([]);
    1069|     expect(holey.evidenceHoles).toHaveLength(1);
       |                                 ^
    1070|     expect(holey.evidenceHoles[0]).toMatchObject({
    1071|       step: "build-plan-execute",

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[6/7]⎯

 FAIL  .bkit/core/engine/checks/status-holes.test.ts > check — hole classes > matches workflow-level calls outside any step
AssertionError: expected [ …(5) ] to deeply equal []

- Expected
+ Received

- []
+ [
+   {
+     "noun": "runs",
+     "verb": "context",
+   },
+   {
+     "noun": "steps",
+     "verb": "finish",
+   },
+   {
+     "noun": "status",
+     "verb": "row",
+   },
+   {
+     "noun": "steps",
+     "verb": "finish",
+   },
+   {
+     "noun": "status",
+     "verb": "row",
+   },
+ ]

 ❯ .bkit/core/engine/checks/status-holes.test.ts:1100:32
    1098|       contract,
    1099|     );
    1100|     expect(verdict.unexpected).toEqual([]);
       |                                ^
    1101|     expect(verdict.unattributable).toEqual([]);
    1102|     expect(verdict.evidenceHoles).toEqual([]);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[7/7]⎯


 Test Files  1 failed (1)
      Tests  7 failed | 43 passed (50)
   Start at  12:12:04
   Duration  375ms (tests 45%, transform 38%, setup 10%, import 6%, worker 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-8Bj6Aa/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
