Verdict: PASS

<!-- verdict:end -->

# Build Plan Tests

## Test Log

WROTE — TASK 1: `.bkit/core/engine/commands/workflow/ledgers.test.ts` `a --fid that climbs out of the log folder is refused and commits nothing`
WROTE — TASK 1: `.bkit/core/engine/commands/workflow/ledgers.test.ts` `a --month that is not six digits is refused and commits nothing`
WROTE — TASK 1: `.bkit/core/engine/commands/workflow/ledgers.test.ts` `only-bookkeeping refuses a wildcard or climbing --fid instead of passing a source change`
WROTE — TASK 2: `.bkit/core/engine/commands/workflow/decisions.test.ts` `pending refuses a --fid that climbs out of the log folder and reads and writes nothing`
WROTE — TASK 3: `.bkit/core/engine/commands/workflow/ledgers.test.ts` `a tracked *.bkit-lock that was removed is committed as a deletion by the bookkeeping commit`
