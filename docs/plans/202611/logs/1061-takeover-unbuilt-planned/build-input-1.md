## Session Prompt — this run's, newer than everything below

#1061 publish=false

## Issue description — oldest

### What happened

A build stopped with no way forward, on a test that nobody had edited.

A planned test is a test the plan names for a task. The build locks it: `bkit steps finish` exits 11 when a later step changes it. A takeover is the one allowed way to rewrite an earlier task's planned test: a later task names the same test, its tests step rewrites it, and the lock of the earlier task moves onto the rewritten lines.

The lock moves only when the takeover's red record carries a `from` field (`lockBaselines`, `.bkit/core/engine/commands/workflow/tests.ts:518-531`). `bkit tests red` fills `from` with the nearest earlier task in the plan that names the test, and drops it when that task has no recorded test yet (`fromOf`, `tests.ts:2599-2606`).

The sequence that breaks it:

1. A done task (say TASK 12) owns a planned test. Its red is recorded.
2. The plan also has an open task in a later group (TASK 32) that takes that test over. Its group has not started, so it has no record.
3. A code step of an earlier group contradicts the test. `steps finish` exits 11 and adds an engine takeover task (TASK 38) at the end of the plan.
4. The tests step of TASK 38's group rewrites the test and `bkit tests red` records it. The nearest earlier task naming the test is TASK 32, which has no record, so the entry is written with no `from`.
5. TASK 12's lock stays on the old lines. The test now has two locks that disagree: TASK 12's (old lines) and TASK 38's (new lines).

From then on every later `steps finish` of a code step, and of a tests step in a group that does not name the test, exits 11 for that test. Putting the test back breaks TASK 38's lock; keeping it breaks TASK 12's. A `BLOCKED` line makes the engine add one more takeover task and ask for the test back again.

Seen in the second build run of "Agents and the orchestrator write their own .md files; the engine checks and counts" (https://github.com/cbartens/bkit/issues/958): six tests in `.bkit/core/engine/commands/workflow/decisions.test.ts`, owned by TASKS 10, 12, 24 and 25, taken over in the plan by TASKS 32 to 34 and by the engine's TASKS 38 to 43. The red rows of group 11 carry no `from` for any of the six. The tests step of the next group was refused with "are an earlier task's planned test that no open task of group 12 names", although its agent had edited no file.

### What should happen

- A takeover's red record moves the lock of every earlier task that names the same test, also when another open task that has no record yet names the test in between.
- A run whose rows are already written this way is not stuck: with the fixed engine the same `steps finish` call passes, with no status row edited by hand.
- `bkit tests red` records `from` as the nearest earlier task naming the test that has a record, so the final `bkit tests green` audit judges the test as taken over.

### How bad

High. The build cannot finish and no answer the owner can give at a pause gets it past the refusal. It needs an engine-added takeover of a test that the plan itself also takes over in a later group, which is rare, and nothing in `bkit tests plan-check` warns about such a plan.

### Possible fix

Both in `.bkit/core/engine/commands/workflow/tests.ts`, with tests in `.bkit/core/engine/commands/workflow/tests.test.ts`:

- `lockBaselines`: a red entry of one task for a test that an earlier-recorded key of another task names moves that key, whether or not the entry carries `from`. This is what unsticks rows already written.
- `fromOf` in `bkit tests red`: walk back to the nearest earlier task naming the test that has a recorded baseline, instead of giving up when the nearest one has none.

Test first, on rows shaped like the ones above: an earlier task's red, then a later task's red for the same test with no `from`, and the file holding the later lines. `touchedTests` must report nothing.

Related: "Build: one planned-test lock instead of four mechanisms" (https://github.com/cbartens/bkit/issues/1002) reworks the lock as a whole and waits on an owner decision. This bug is in the takeover path, which stays under its option (a).

### Removes

Nothing. No second way is added: the lock keeps one baseline per test.
