Verdict: PASS
Failures: 0
Fingerprint: 4805a5ecb6d2ab7809ac337a6bf6c4b97afde15e6c97d5bbeb1105a145091f26
<!-- verdict:end -->

# Build Challenge

Lens: Security — auth, secrets, input validation, data exposure, OWASP, data-access policies / tenancy.

## Scope

Full diff `tmp/bkit-diff-1020-two-small-check.md` (not partial: its first line is a `diff --git` header). Twelve files against `dev`: `.agents/rules.md`, `.bkit/authoring.md`, `.bkit/core/.bkit/authoring.md`, `.bkit/core/.bkit/jsonl.md`, `.bkit/jsonl.md`, `.bkit/instructions.md`, `.bkit/version`, `.bkit/core/engine/commands/workflow/ledgers.ts`, `dist/commands/workflow/ledgers.js`, `.bkit/core/engine/commands/workflow/ledgers.test.ts`, `.bkit/core/engine/audits/repo/shipped-docs-refs.test.ts`, `docs/testing.md`.

## Notes

- Authorisation on append is unchanged. The new default at `.bkit/core/engine/commands/workflow/ledgers.ts:1798-1799` runs after the kind check against the ledger's allowed kinds and before `validate` (status allow-list `OPEN|TRIAGED|CLOSED`) and `writerProblem` (the per-kind writer allow-list). It adds only the constant `"OPEN"` when `status` is absent, so no caller-supplied value bypasses either check.
- Integrity of replay is unchanged. `actionHash` covers the caller's `{ledger, rows}`; the recorded block already holds the defaulted row, and a replay writes the recorded bytes. A replayed operation cannot diverge from its first write.
- Open-work visibility is unchanged. Readers already treat an absent `status` the same as `OPEN` (`.bkit/core/engine/checks/tips/detect.ts:273`; open counts test `status != "CLOSED"`, `.bkit/core/.bkit/jsonl.md` § Updating a Row). The default cannot hide a row from, or add a row to, an open-work count. An explicit `CLOSED` stays the caller's choice, as before this diff.
- `.bkit/core/engine/ledgers/journal.ts` writes its friction rows directly with `status: "OPEN"` and does not pass through the changed line.
- Prototype keys: a row key `__proto__` is still skipped by the existing `!(k in row)` copy at `ledgers.ts:1797`; the new line reads only `row["status"]` and `row["kind"]`.
- Docs, rules and instruction entries carry no secret, token, credential or consumer name. The commands they name (`pnpm exec tsx .bkit/core/engine/tools/instructions.ts`, `pnpm instructions:sync`) run only in the bkit repo. The text removed from the shipped `authoring.md` carried no security guidance.
- The new tests read fixed repo paths and temp git repos only.
- `.bkit/version` hashes for `.bkit/jsonl.md` and `.bkit/authoring.md` match `shasum -a 256` of the rendered files.
- Supply chain: no `package.json` or `pnpm-lock.yaml` change against `dev`, so no new dependency.
- No logging, PII or error-message change.
- Docs warning: `docs/data-schema.md` is still the 10-line starter with no content; bkit has no database (`docs/security.md` § RLS), so no tenancy or row-policy check applies.
- Cross-reference: `docs/security.md` § Scope (secrets, supply chain, shell injection, PII in logs) and `docs/observability.md:32` (ledger operation store kept 0600 / 0700 outside committed paths); the diff touches none of these surfaces.
