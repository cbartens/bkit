Verdict: PASS
Failures: 0
Fingerprint: ffed90f9ee7eaf9b0343b517e04acf2fc477d76baebb5362ae5e8a96f31e0bd8
<!-- verdict:end -->

# Build Challenge

Lens: Security — auth, secrets, input validation, data exposure, OWASP, data-access policies / tenancy.

## Scope

Full diff `tmp/bkit-diff-1039-ledger-query-status.md` (no `partial diff coverage` line): `.bkit/core/engine/ledgers/telemetry.ts` (`defaultStatus`, `queryLedger` filter), `.bkit/core/engine/commands/workflow/ledgers.ts` (`appendLedgerRows` default), `.bkit/core/engine/checks/tips/detect.ts` (`hasUnsharedFriction`), their `dist/` builds and tests, `.bkit/core/.bkit/jsonl.md` and its `.bkit/jsonl.md` mirror, the `.bkit/version` hash, one new `.bkit/friction.jsonl` row and `docs/testing.md`.

## Notes

- Authentication and authorisation: no auth, session or permission surface touched (`docs/security.md` § Scope: no server or user-auth surface).
- Data access and tenancy: no database or row policy (`docs/security.md` § RLS; `docs/data-schema.md` holds no tables). `query --status=OPEN` now returns status-less `friction` / `deferral` / `failure` winners, but `query` with no `--status` already printed every winner from the same committed file, so no row reaches a caller it could not already read. The only `queryLedger` callers are the `query` command (`.bkit/core/engine/commands/workflow/ledgers.ts:2146`) and `ledgerKeys` (`.bkit/core/engine/commands/workflow/steps.ts:1772`, no filter); no shipped workflow, prompt or template passes `--status=OPEN|TRIAGED|CLOSED`, so no gate or publishing step changes its row set.
- Friction sharing: `hasUnsharedFriction` keeps the `scope !== "consumer"` exclusion unchanged, so consumer-scoped rows still never prompt a share.
- Input validation: `--status` is compared with `===` only; `--ledger` stays checked with `Object.hasOwn(APPEND_LEDGERS, ...)`; `defaultStatus` is a `Set.has` plus two string comparisons, with no injection, path or prototype surface. `String(e.kind)` was already evaluated on the same path before the change.
- Secrets and PII: the new `.bkit/friction.jsonl` row (`plan-tasks-gate-wait/build-plan-tasks`) names only bkit's own repo slug, a FID and an issue number; no token, key, personal data or consumer name (`docs/security.md` § Public repo content).
- Integrity: the new `.bkit/version` hash for `.bkit/jsonl.md` equals the file's actual SHA-256 (`2ee43214...`); the `dist/` hunks match the source hunks.
- Supply chain: no dependency added or changed.
- Outside this lens, not counted: `hasUnsharedFriction` now also counts a hand-edited friction row whose `status` is `null` (`null ?? "OPEN"`), which the old `=== undefined` test did not. `parse` and `normalize` keep a `null` status, and `appendLedgerRows` never writes one (`validate` rejects it). This is a correctness drift for the correctness lens to judge.
- Docs: `.agents/docs.md` read; `docs/security.md` read in full; `docs/data-schema.md` is the starter with no tables, which matches the no-database scope. No `docs/knowledge.jsonl` or `docs/decisions.jsonl` row covers friction sharing or ledger status reads.
