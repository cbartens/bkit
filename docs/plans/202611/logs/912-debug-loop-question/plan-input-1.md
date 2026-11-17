## Session Prompt — this run's, newer than everything below

/bkit-plan #912

## Issue description — oldest

### Failing test or CI run

none yet

### What happened

A consumer's `/bkit-debug` run reached the Loop Question after fix attempt 2 of 2 and asked the owner:

> debug fix: attempt 2 of 2. Failures per test round: ? → ? (trend: stuck).
> **Q1 — Fix:** The last fix attempt left no fewer failures. Stop here instead of trying again?
> Recommended: A) Stop.

Neither test round recorded a failure count. Both `test-run` rows in the run's `status.jsonl` carry `"failures":null`, and the matching `step-done` rows carry no `failures` field:

- Round 1, `source: ci`, `scope: ci:<run id>`, `exitCode: null`: two CI jobs were red, but no count was recorded.
- Round 2, `source: local`, `scope: pnpm bkit:gate:static-unit-integration-e2e-live`, `exitCode: 1`: the gate failed, but no count was recorded.

`loopTrend` in `.bkit/core/engine/commands/workflow/counters.ts` returns `stuck` when either count is `undefined`. `loopProgress` then sets `recommend: "stop"` and prints each unknown count as `?`. So the workflow told the owner the fix "left no fewer failures" and recommended Stop, with no evidence behind either claim. The owner took the recommendation and stopped the run.

The two rounds are not comparable anyway. Round 1 was the CI run's result and round 2 was a different local gate, so the numbers would not show a trend even if both were present.

### What should happen

- Each test round records a failure count whenever one can be worked out. For a CI round that is at least the number of failed jobs. For a local gate that is the failed-test count from its output.
- When a count is unknown, the trend is not `stuck`. It is a separate state, for example `unknown`, that never recommends Stop by itself.
- The question wording matches what is known. It never says "left no fewer failures" when the counts are `?`.
- Rounds with different scopes (CI vs local gate, or two different gates) are not compared as if they were the same test.

### Steps to reproduce

1. Start `/bkit-debug` from a red CI run, so round 1 is `source: ci` and records no `failures`.
2. Let a fix attempt run and a local gate fail, so round 2 records `exitCode: 1` and `failures: null`.
3. Use up the fix attempts so the Loop Question runs: `counters progress --check=debug-run-tests` prints `counts: "? → ?"`, `trend: "stuck"`, `recommend: "stop"`.

### How often

Every debug run where a test round's failure count is not parsed. Round 1 from CI evidence always fits that today.

### Affected area

- `loopTrend` / `loopProgress` in `.bkit/core/engine/commands/workflow/counters.ts`
- `bkit tests run` failure-count capture (the `failures` field on `test-run` rows)
- `.bkit/core/workflows/bkit-debug.md` § Loop Question (the Q1 wording), Step 3 (`TEST_FAILURES` = null)
- The same `counters progress` trend feeds the build and ship loop questions; check those too.

### Evidence

`status.jsonl` rows from the run (paths shortened):

```text
{"type":"test-run","workflow":"debug","step":"debug-run-tests","attempt":1,"run":1,"verdict":"FAIL","exitCode":null,"failures":null,"scope":"ci:<run id>", ...}
{"type":"test-run","workflow":"debug","step":"debug-run-tests","attempt":2,"run":2,"verdict":"FAIL","exitCode":1,"failures":null,"scope":"pnpm bkit:gate:static-unit-integration-e2e-live", ...}
{"type":"owner-pause","workflow":"debug","reason":"loop"}
```

### References

- `.bkit/core/engine/commands/workflow/counters.ts` § `loopTrend` (`if (first === undefined || last === undefined) return "stuck";`)
- `.bkit/core/workflows/bkit-debug.md` § Loop Question
- #895 — One question format for every owner question in the workflows (https://github.com/cbartens/bkit/issues/895)

## Issue comment — posted 2026-11-10T06:11:19.000Z

**Label changed: `next:debug` → `next:plan`**

The cause is already known: `loopTrend` in `.bkit/core/engine/commands/workflow/counters.ts` treats an unknown count as `stuck`. "What should happen" sets the direction, and no test is red. `/bkit-debug` is only for a real failure whose cause is unknown (`.bkit/workflows.md:61`). What's missing is a plan for the four changes, so `/bkit-plan 912` is next.
