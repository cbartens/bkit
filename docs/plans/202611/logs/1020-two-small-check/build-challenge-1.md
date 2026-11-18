Verdict: PASS
Failures: 0
Fingerprint: fa17c102488645bb4841e545a0a83b5034fa22cae0d5310110e8b57a7d772a54
<!-- verdict:end -->

# Build Challenge

Lens: Bugs and edge cases — null safety, off-by-one, error paths, data integrity.

## Scope

Full diff `tmp/bkit-diff-1020-two-small-check.md` (369 lines, 12 files; not `partial diff coverage`). The only behavioural change is the guarded default in `appendLedgerRows` → `build` (`.bkit/core/engine/commands/workflow/ledgers.ts:1798-1799`, compiled at `dist/commands/workflow/ledgers.js:1450-1451`). The rest is four unit tests, one static test, the moved authoring steps, the `.bkit/instructions.md` entries for the two new Project Rules, the rendered copies, the `.bkit/version` hashes and `docs/testing.md`.

## Notes

Vectors checked against the code the diff leaves:

- Null / undefined: the default fires on `undefined` only. `status: null` or `""` still reaches `validate` and is refused (`.bkit/core/engine/ledgers/telemetry.ts:1637-1643`), the same as before the change, so it fails closed. `String(row["kind"])` is safe because `kind` is already restricted by `takes.includes` (`ledgers.ts:1772`).
- Default scope: gated on `SEVERITY_KINDS` (`telemetry.ts:265`). If the gate were widened by mistake, `validate` would refuse `OPEN` on knowledge, decision, feature and stats rows, and the existing decision append tests would catch it (`ledgers.test.ts:1343-1350`).
- Replay / idempotence: the operation hash is taken over the raw rows (`ledgers.ts:1711`), so the default leaves it unchanged. The replay and intent paths write the recorded bytes (`ledgers.ts:1840-1930`). Only the fresh-prepare path rebuilds, and it mints a new `ts` anyway.
- Fold semantics: `fold` is last-write-wins with no field merge (`telemetry.ts:1951-1960`). Every shipped reader of the three ledgers filters `status != CLOSED`: prompts `bkit-audit-generate.md:178`, `bkit-ship-deferred-sweep.md:83`, `bkit-utility-update-failures.md:61`, `bkit-utility-update-deferrals.md:59`, `bkit-utility-update-roadmap.md:84`; engine `workflows.ts:1746`, `summary.ts:711`, `summary-findings.ts:163`, `ledgers.ts:2666`; and `checks/tips/detect.ts:273`, which accepts absent or `OPEN`. So absent and `OPEN` read the same way, and an update row that omits `status` reopens an entry exactly as it did before.
- Internal writers through `appendLedgerRows`: `challenge.ts:774` (`lowDeferrals`, now written `OPEN`), `decisions.ts:714` (already `OPEN`) and `ledgers.ts:2701` (`unjustifiedRow`, `TRIAGED` kept). The `journal.ts` friction rows bypass append and already carry `OPEN`.
- Tests: the four new append tests fail on the pre-change code, because the row reads back with no `status`. The static test checks the file exists, so it cannot pass vacuously, and its regex has no `g` flag, so there is no `lastIndex` carry-over between lines.
- Gate evidence: `build-holistic-gate-1-2.md` reports 51 files and 4192 tests passed, and every stage passed. This was read, not re-run, because the mandate forbids building.

Out-of-lens or out-of-scope observations (not findings; propose them separately):

1. `.bkit/core/.bkit/workflows.md:223`, which ships as `.bkit/workflows.md`, still says "then run `pnpm instructions:sync`". That is the same bkit-repo-only command this change removes from `authoring.md`, and the new guard scans only `authoring.md`.
2. `.bkit/core/.bkit/authoring.md` keeps `Checked by:` lines that name test files existing only in the bkit repo (lines 312, 354, 486, 490, 701, 711), while the change deletes the `instructions.test.ts` ones. The guard covers four tokens only.
3. Read-side default drift (already there before this change, and not touched by it): `queryLedger` defaults an absent `status` to `ACTIVE` for knowledge and decision only (`telemetry.ts:1990-2033`). So `bkit ledgers query --ledger=deferrals --status=OPEN` returns new rows but not older rows that have no `status`. No shipped prompt or workflow uses that filter on these ledgers, so no run is affected today.
4. `.agents/rules.md:198` (`Save checklist`) refers to "`Checked by:` lines", but the rule above it (`:197`) writes "Checked by `...`" with no colon. This is wording only.

Docs cross-reference: the `docs/architecture.md` § Knowledge / Decisions JSONL Ledgers paragraph lists no per-field fills, so there is no drift. The `docs/testing.md` § Key test files row the diff edits matches the tests. The new sentence in `.bkit/jsonl.md` § Updating a Row matches the code. `docs/security.md`: not applicable (no change to credentials, permissions or how far input is trusted; rows are still validated before the write). Warning: `docs/data-schema.md`, a Build-column doc, is still the 10-line starter. It is not applicable here, because the ledger schema lives in `.bkit/jsonl.md`. `docs/knowledge.jsonl` was searched for status-default gotchas and has none.
