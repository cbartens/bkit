Verdict: PASS
Failures: 0
Fingerprint: f9aed232f0f23e495457e436be55ca0f0341a044ea4ee7f35341f4696408d445
<!-- verdict:end -->

# Build Challenge

Lens: Security — auth, secrets, input validation, data exposure, OWASP, data-access policies / tenancy.

## Scope

- Diff: `tmp/bkit-diff-992-ledger-commands-six.md`, full coverage (no `partial diff coverage` line).
- Plan: `docs/plans/202611/992-ledger-commands-six-plan.md`, tasks 1 to 5.
- Code surfaces challenged: `decodeCursor` and `query`, the replay branch of `appendLedgerRows`, `ledgerEffect` and `recordLedgerOperation`, `correctionBook` and the later correction-row appends in `append`, the `ls-files` listing in `commitBookkeeping`, the `*.bkit-lock` entries in `.bkit/shared/gitignore` and `.gitignore`, the `dist/` mirrors, the new tests and the two new `.bkit/friction.jsonl` rows.
- Docs and generated files with no security surface: `.bkit/core/.bkit/jsonl.md`, `.bkit/jsonl.md`, `.bkit/instructions.md`, `.bkit/version`, `docs/architecture.md`, `docs/capabilities.md`, `DETAILS.md`.

## Findings Log

None

## Notes

- **Authentication and authorisation:** the diff adds no auth surface; bkit has none (`docs/security.md` § Scope).
- **Data access and tenancy:** the operations store stays keyed by the book root's realpath hash (`.bkit/core/engine/ledgers/status.ts:712`). The replay reads only `path.join(root, file)`, with `file` taken from the `APPEND_LEDGERS` table, under the target lock and then the operations lock (`.bkit/core/engine/commands/workflow/ledgers.ts:1813`, `:1825`). `ledgerEffect` pairs the first receipt with the latest intent of the same operation. Every intent of one operation carries the same hash (`ledgers.ts:1850`), and no intent is written once a receipt exists, so the pairing cannot mix two requests.
- **Input validation:** `decodeCursor` refuses a negative offset (`ledgers.ts:2104`). `Number.isInteger` already refuses NaN, Infinity and non-numbers, `-0` reads as offset 0, and an oversized offset gives an empty page. The cursor stays bound to the ledger snapshot and filter (`ledgers.ts:2132`). The new exclusion is a constant pathspec passed through `gitRaw` as an argv array to `spawnSync` with no shell (`ledgers.ts:176`), as `docs/security.md` § Shell Injection requires. `bookPathspecs` always returns at least seven positive pathspecs (`ledgers.ts:118`), so the exclude entry never stands alone, which would make `git ls-files` list the whole tree.
- **Secrets:** none added. A lock body holds `{pid, at, token}` only (`status.ts:921`).
- **Data exposure:** new receipts drop the second copy of the row block (`ledgers.ts:1860`), so prepared row bytes live once, in the 0600 operations file (`docs/observability.md` § Bookkeeping effects and receipts). The new refusal message names the operation id and the repo-relative ledger path, never an absolute path. The two friction rows carry relative paths and a commit SHA only, and no consumer name.
- **Private file permissions:** `correctionBook` creates `<id>.corrections.jsonl` with mode `0600` (`ledgers.ts:1653`), matching `docs/security.md:66`. The later appends in `append` and in `spendCorrection` (`.bkit/core/engine/commands/workflow/counters.ts:233`) pass no mode, but they write to the file that `correctionBook` created earlier in the same call. `mode` applies only on creation, so a corrections file left by an older bkit keeps its mode. Its rows hold no secret, row body or token (`docs/observability.md`), and each standalone invocation id is minted fresh, so this is not a finding.
- **Integrity:** the replay check matches the exact block bytes, which carry minted `ts` values, so a coincidental match is not practical. Only a user who can already write `.git/` can reach the operations store.
- **Supply chain:** no dependency change; the new test imports `node:child_process` only.
- **Out of scope (pre-existing, not in the diff):** `writeInvocation` creates `invocation-context/` with the default directory mode (`.bkit/core/engine/commands/lib.ts:667`), not `0700` as `privateDir` does for the operations store. The files inside are `0600`; only their names (invocation ids) are listable. Propose it separately if wanted.
- **Verification:** the conclusions rest on reading the code the diff leaves. I did not run the test suite. A scratch-repo probe of the `git ls-files` exclude behaviour was refused by the permission system; the `bookPathspecs` reading above covers the one case that probe targeted.
