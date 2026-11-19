## Session Prompt — this run's, newer than everything below

#1063 publish=false

## Issue description — oldest

### What happened

Seen in the build of "Agents and the orchestrator write their own .md files; the engine checks and counts" (https://github.com/cbartens/bkit/issues/958), run 2, group 8.

A build pauses for the owner (the Decision Pause) when a fix loop has used up its rounds. The pause prints a trend (did the number of problems fall or rise between the first and the last round) and a recommendation taken from it: `Try again` when the count fell, `Stop` when it rose or stood still.

For the group loop the count of a round is the verify step's problems plus the failing tests of that round's group gate (the test run after a passing verify). The gate runs only when verify passes. A round whose verify said `CONCERNS` has no gate run at all, and the engine counts that as 0 failing tests:

- `gateFailuresOf` in `.bkit/core/engine/commands/workflow/counters.ts` (lines 332-358) returns 0 when the round has no `test-run` row (line 353).
- Round 1: verify `CONCERNS` with 3 problems, no `build-group-gate` row. Round 2: verify `PASS`, gate red.
- `bkit decisions compose` printed `Group gate failures after each round: 0 -> 34`, `Trend: worse`, and recommended `Stop`.

The gate had never run before round 2, so nothing got worse. Every failure came from the branch and one fix round could deal with them. `Stop` would have resumed into the same red gate with no code change. The orchestrator answered `Try again` against the printed recommendation. A headless run takes the recommendation (`bkit decisions apply --by=headless`) and would have stopped.

Friction row: `decision-compose-trend-counts-skipped-group-gate-as-zero` (lands on `dev` with that build).

### What should happen

A round whose gate did not run has no gate count. The trend compares only rounds that measured the same thing, and the pause never prints `0` for a gate that did not run.

- With one gate run in the loop, the gate has no trend yet, and the recommendation does not say `worse`.
- The printed line shows `?` (or a word such as `not run`) for a round with no gate run.
- A round that ran the gate and counted 0 failing tests still counts as 0.

### How bad

Medium. The recommendation is the answer a headless run takes, and the one an owner reads first. Here it pointed to `Stop` on a loop that one more round could close, which costs a resume and a hand restart ("Runs finish unattended").

### Possible fix

In `.bkit/core/engine/commands/workflow/counters.ts`:

- `gateFailuresOf` returns `null` (unknown), not 0, when the round has no `test-run` row for the gate step. `loopProgress` already turns a `null` gate count into a round with no count, and `loopTrend` already answers `unknown` for that, with `recommend: null`.
- Check `clean` in `loopProgress` (line 406): a round with a clean check and no gate row must not start counting as clean by accident. Today it needs `gateOf(r) === 0`, so `null` keeps it not clean. Say in the doc comment which case that is.
- Test first, in `.bkit/core/engine/commands/workflow/counters.test.ts`: two rounds, the first with a `CONCERNS` check and no gate row, the second with a `PASS` check and a red gate row. Today the trend is `worse` and `gateCounts` is `0 → N`; it should be `unknown` (or `first-round` for the gate) and `? → N`.

Check against "Build: one engine command decides each fix-loop round" (https://github.com/cbartens/bkit/issues/1000) and "Build: Try again on a red-gate pause re-runs the gate before another fix round" (https://github.com/cbartens/bkit/issues/1038), which change the same pause, so the three do not collide.

### Removes

Nothing.
