
> @cbartens/bkit@6.0.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/699-engine-run-completeness
> vitest run --reporter=default --reporter=junit --outputFile.junit="$BKIT_TEST_REPORT" .bkit/core/engine/ledgers/journal.test.ts


 RUN  v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/699-engine-run-completeness

 ❯ .bkit/core/engine/ledgers/journal.test.ts (9 tests | 9 failed) 17ms
   ❯ shouldRecordFriction (1)
     × writes no friction row for a declared routing exit 6ms
   ❯ frictionRow (3)
     × never leaves by.step empty 1ms
     × keeps the key under the identity-gated prune's truncation bound 1ms
     × writes a friction row with no run object when parentSha is unresolvable 3ms
   ❯ appendFrictionRow (2)
     × raises recurrenceCount on a same-key row 1ms
     × returns a failed result instead of throwing when the row is refused 1ms
   ❯ engineCallRow (1)
     × journals flag names only 1ms
   ❯ appendJournalRow (1)
     × appends one status line and reports a failed write instead of throwing 1ms
   ❯ journalEnabled (1)
     × writes no row when BKIT_ENGINE_JOURNAL is off 0ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 9 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/ledgers/journal.test.ts > shouldRecordFriction > writes no friction row for a declared routing exit
AssertionError: expected true to be false // Object.is equality

- Expected
+ Received

- false
+ true

 ❯ .bkit/core/engine/ledgers/journal.test.ts:45:52
     43|     const excluded = new Set([...SHARED, 3, 4]);
     44|     for (const code of [0, 1, 2, 3, 4, 80, 81, 82]) {
     45|       expect(shouldRecordFriction(code, excluded)).toBe(false);
       |                                                    ^
     46|     }
     47|     expect(shouldRecordFriction(9, excluded)).toBe(true);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/9]⎯

 FAIL  .bkit/core/engine/ledgers/journal.test.ts > frictionRow > never leaves by.step empty
TypeError: Cannot read properties of undefined (reading 'step')
 ❯ .bkit/core/engine/ledgers/journal.test.ts:57:46
     55|     for (const step of [undefined, ""]) {
     56|       const row = own(root, { step });
     57|       expect((row["by"] as { step: string }).step).toBe("workflows-sum…
       |                                              ^
     58|       expect(row["key"]).toBe("workflows-summary/workflows-summary");
     59|       expect(validate(row)).toEqual({ ok: true });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/9]⎯

 FAIL  .bkit/core/engine/ledgers/journal.test.ts > frictionRow > keeps the key under the identity-gated prune's truncation bound
AssertionError: expected 218 to be less than or equal to 60
 ❯ .bkit/core/engine/ledgers/journal.test.ts:70:73
     68|
     69|   it("keeps the key under the identity-gated prune's truncation bound"…
     70|     expect(frictionKey("workflows", "summary", "s".repeat(200)).length…
       |                                                                         ^
     71|   });
     72|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/9]⎯

 FAIL  .bkit/core/engine/ledgers/journal.test.ts > frictionRow > writes a friction row with no run object when parentSha is unresolvable
AssertionError: expected { ok: false, …(1) } to deeply equal { ok: true }

- Expected
+ Received

  {
-   "ok": true,
+   "ok": false,
+   "reason": "schema must be 3 (got: undefined)",
  }

 ❯ .bkit/core/engine/ledgers/journal.test.ts:77:27
     75|     const row = own(root, { parentSha: "" });
     76|     expect(row).not.toHaveProperty("run");
     77|     expect(validate(row)).toEqual({ ok: true });
       |                           ^
     78|     expect(appendFrictionRow(root, row)).toEqual({ ok: true });
     79|     const line = fs.readFileSync(path.join(root, ".bkit", "friction.js…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/9]⎯

 FAIL  .bkit/core/engine/ledgers/journal.test.ts > appendFrictionRow > raises recurrenceCount on a same-key row
Error: ENOENT: no such file or directory, open '/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-journal-aIImfe/.bkit/friction.jsonl'
 ❯ .bkit/core/engine/ledgers/journal.test.ts:93:8
     91|     appendFrictionRow(root, own(root, { step: "build-other" }));
     92|     const lines = fs
     93|       .readFileSync(path.join(root, ".bkit", "friction.jsonl"), "utf-8…
       |        ^
     94|       .trim()
     95|       .split("\n")

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/9]⎯

 FAIL  .bkit/core/engine/ledgers/journal.test.ts > appendFrictionRow > returns a failed result instead of throwing when the row is refused
AssertionError: expected true to be false // Object.is equality

- Expected
+ Received

- false
+ true

 ❯ .bkit/core/engine/ledgers/journal.test.ts:105:23
    103|     const root = tmp();
    104|     const result = appendFrictionRow(root, own(root, { workflow: "audi…
    105|     expect(result.ok).toBe(false);
       |                       ^
    106|     expect(fs.existsSync(path.join(root, ".bkit", "friction.jsonl"))).…
    107|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[6/9]⎯

 FAIL  .bkit/core/engine/ledgers/journal.test.ts > engineCallRow > journals flag names only
AssertionError: expected { type: 'engine-call', …(5) } to deeply equal { type: 'engine-call', …(5) }

- Expected
+ Received

@@ -1,12 +1,13 @@
  {
    "at": "2026-10-29T10:00:00Z",
    "flags": [
-     "step",
-     "token",
-     "file",
-     "json",
+     "--step=build-summary",
+     "--token=SECRET",
+     "--file",
+     "/home/me/x",
+     "--json",
    ],
    "noun": "steps",
    "type": "engine-call",
    "verb": "finish",
    "workflow": "build",

 ❯ .bkit/core/engine/ledgers/journal.test.ts:119:17
    117|       flags: ["--step=build-summary", "--token=SECRET", "--file", "/ho…
    118|     });
    119|     expect(row).toEqual({
       |                 ^
    120|       type: "engine-call",
    121|       workflow: "build",

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[7/9]⎯

 FAIL  .bkit/core/engine/ledgers/journal.test.ts > appendJournalRow > appends one status line and reports a failed write instead of throwing
Error: ENOENT: no such file or directory, open '/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-journal-XYxZWQ/status.jsonl'
 ❯ .bkit/core/engine/ledgers/journal.test.ts:137:15
    135|     const row = engineCallRow({ workflow: "build", noun: "a", verb: "b…
    136|     expect(appendJournalRow(file, row)).toEqual({ ok: true });
    137|     expect(fs.readFileSync(file, "utf-8").trim().split("\n")).toHaveLe…
       |               ^
    138|     const bad = appendJournalRow(path.join(root, "missing", "status.js…
    139|     expect(bad.ok).toBe(false);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[8/9]⎯

 FAIL  .bkit/core/engine/ledgers/journal.test.ts > journalEnabled > writes no row when BKIT_ENGINE_JOURNAL is off
AssertionError: expected true to be false // Object.is equality

- Expected
+ Received

- false
+ true

 ❯ .bkit/core/engine/ledgers/journal.test.ts:145:60
    143| describe("journalEnabled", () => {
    144|   it("writes no row when BKIT_ENGINE_JOURNAL is off", () => {
    145|     expect(journalEnabled({ BKIT_ENGINE_JOURNAL: "off" })).toBe(false);
       |                                                            ^
    146|     expect(journalEnabled({ BKIT_ENGINE_JOURNAL: "on" })).toBe(true);
    147|     expect(journalEnabled({})).toBe(true);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[9/9]⎯


 Test Files  1 failed (1)
      Tests  9 failed (9)
   Start at  06:58:16
   Duration  337ms (transform 62%, setup 23%, tests 8%, import 4%, worker 2%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-NH1b0L/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
