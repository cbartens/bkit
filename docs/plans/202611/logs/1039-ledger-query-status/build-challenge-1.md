Verdict: PASS
Failures: 0
Fingerprint: a50702837165c492b6a1e84508cadc2f5ff8eae1cb2edba2a3a1643d2395c180
<!-- verdict:end -->

# Build Challenge

Lens: Bugs and edge cases — null safety, off-by-one, error paths, data integrity.

## Scope

Full diff `tmp/bkit-diff-1039-ledger-query-status.md` (371 lines, full coverage), read against `docs/plans/202611/1039-ledger-query-status-plan.md`. Code read: `defaultStatus`, `queryLedger` and `validate` in `.bkit/core/engine/ledgers/telemetry.ts`; `query` and `appendLedgerRows` in `.bkit/core/engine/commands/workflow/ledgers.ts`; `hasUnsharedFriction` in `.bkit/core/engine/checks/tips/detect.ts`; `ledgerKeys` in `.bkit/core/engine/commands/workflow/steps.ts`; every workflow and prompt that runs `bkit ledgers query`.

Checks run:

- `pnpm vitest run .bkit/core/engine/checks/tips/detect.test.ts`: 38 passed.
- `pnpm vitest run .bkit/core/engine/ledgers/telemetry.test.ts -t "status default|canonical winners"`: 4 passed (the 3 new tests plus the existing fold test).
- `pnpm vitest run .bkit/core/engine/commands/workflow/ledgers.test.ts -t "bkit ledgers query"`: 4 passed, including the new `query --status=OPEN` test.
- `node dist/cli.js ledgers query --ledger={deferrals|failures|friction} --status={OPEN|TRIAGED|CLOSED}` on this repo: deferrals 188 / 25 / 156 of 369 winners, failures 101 / 17 / 169 of 287, friction 77 / 1 / 20 of 98. Every severity-kind winner lands in exactly one status bucket.
- The full test files and the gates were not run, as the caller instructed.

Docs: `.agents/docs.md` read; `docs/architecture.md` read in full (the `ledgers/` tree is unchanged); `docs/security.md` searched, no ledger rule applies; `docs/testing.md` checked through its diffed row. `docs/data-schema.md` is still the starter: warning, no database here. `docs/knowledge.jsonl`, `docs/capabilities.md` and `.bkit/workflows.md` were searched for `ledgers query` / `queryLedger`, with no hits. `.bkit/prompts.md`, `.agents/skills.md` and `docs/observability.md` were not loaded, because the diff changes no prompt, skill or logging.

## Notes

- `hasUnsharedFriction` now counts a friction winner whose `status` is `null` (the old `=== undefined` test did not), so Task 2 is not strictly behaviour-preserving. It now reads `null` the same way `queryLedger` always did (`??`). `validate` refuses a `null` status on append, and this repo's ledgers hold no `"status":null`, so only a hand-written row reaches it. Not logged as a finding.
- The plan's edge case "older row `CLOSED`, newer winner has no status → returned for `OPEN`" has no test pinning it. It is the plain fold result. A probe of this repo found 0 status-less winners with an earlier `CLOSED` or `TRIAGED` row in deferrals, failures or friction. Not logged.
- No workflow, prompt, template or script runs `--status=OPEN`, so the larger result set starts no automated per-row work: no cost-amplification vector.
- The plan's "179 instead of 95" figure in Manual Verification is out of date (the ledger has grown to 188). The count is not a defect.
