Verdict: PASS
Failures: 0
Fixable: false
Tasks: 6
Loosened: none
Fingerprint: 2d0115279ea1c09ad13a319b906481596925aed6707d5363292d47b4f7c45117
<!-- verdict:end -->

# Plan Verification

## Scope

Group 4

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

None

## Notes

TASK 6 is satisfied. In the intent path of `appendLedgerRows` (`.bkit/core/engine/commands/workflow/ledgers.ts:1878-1883`), when the bytes at `intent.offset` differ from `intent.block` but `have.indexOf(want) !== -1`, the engine calls `receipt(intent)` and returns `result(intent, intent.block, true)` (`replayed: true`, `appended: 0`) without writing the ledger; the uncertain check and the "prepare afresh" path now run only when the block is nowhere in the file. `dist/commands/workflow/ledgers.js` carries the same change. The `TEST FIRST` test `receipts a lost-response block that a rebase moved behind upstream rows instead of appending it again` (`.bkit/core/engine/ledgers/journal.integration.test.ts:1051`) matches its spec (`op-moved`, `failAt("written")`, one foreign complete row line ahead of the landed bytes, expects `appended` 0, `receipt.replayed` true and an unchanged file). `pnpm vitest run .bkit/core/engine/ledgers/journal.integration.test.ts`: 23/23 passed, including `prepares afresh when nothing landed and a foreign row followed` (:1016) and `refuses to re-append a partly landed block after a foreign writer appended` (:985). Test-first audit `build-tests-green-4-1.md`: `Enforced: true`, 0 gaps, task 6 red then green; no Taken over, Unproven, Changed by a code step, Updated tests or Already landed sections. `build-decision-1-1.md` covers task 5 (group 3), not this group. No new error path, so `docs/observability.md` adds nothing here. `docs/architecture.md:220` already states a replay counts the rows held anywhere in the file, consistent with this change. Advisory, not a gap: the new branch records the receipt with the intent's original offset, which no longer matches the block's position; the receipt replay path searches the whole file, so nothing reads that offset as a position.

## Identified Gaps Log

None
