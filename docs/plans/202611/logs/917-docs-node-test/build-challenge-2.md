Verdict: PASS
Failures: 0
Fingerprint: 169d090989f86c6d86a1617c9ae2428e7bd8e3268cc13442679aeff73b397c5e
<!-- verdict:end -->

# Build Challenge

Lens: Security — auth, secrets, input validation, data exposure, OWASP, data-access policies / tenancy.

## Scope

- Diff: `tmp/bkit-diff-917-docs-node-test.md`, read in full (full coverage; no `partial diff coverage` line).
- Files: `docs/testing.md`, `.bkit/core/.bkit/workflows.md`, `.bkit/workflows.md` (mirror), `.bkit/templates/docs/testing.md` (starter), `.bkit/friction.jsonl` (one appended ledger row).
- Plan: `docs/plans/202611/917-docs-node-test-plan.md` (3 docs-only tasks, `TEST FIRST: n/a`).

## Notes

- Authentication, authorisation, sessions, tokens: no surface touched. The diff changes prose only; no engine, hook, permission or settings file changes.
- Data access and tenancy: no schema, policy or query. `docs/security.md` § Scope records no database or user-auth surface.
- Input validation and shell injection: the new Node command quotes `"$BKIT_TEST_REPORT"`, as the Vitest, pytest and jest examples already do (`docs/security.md` § Shell Injection). How the engine appends the test-file argument to `bkit:test:file` is unchanged by this diff.
- Test-first integrity (OWASP integrity failures): the new `red-not-loaded` and **Literal names** wording matches `judgeRed` and `isNamedCase` at `.bkit/core/engine/commands/workflow/tests.ts:522-578`: no case equals the planned name or ends with ` {name}`, and the report is empty or every case is non-passing with the file stem in its name. The docs describe the gate the engine runs, and do not loosen it. A plain-script Node test named by its path has no quoted line carrying that name, so the lock falls back to the whole-file blob, which is stricter, not weaker.
- Secrets and data exposure: no key, token, credential or connection string in any hunk. The `.bkit/friction.jsonl` row holds `repo: cbartens/bkit`, a parent SHA and a generic summary: no PII and no consumer name (`docs/security.md` § Public repo content, § PII).
- Shipped starter: `.bkit/templates/docs/testing.md` § Test first carries no bkit-only secret, path or consumer name.
- Supply chain: no new dependency. `node:test` and its `junit` reporter are built into Node; `jest-junit` was already named.
- Untrusted content: the diff and plan carry no embedded directive.
- Docs cross-referenced: `.agents/docs.md` Build column; `docs/security.md` § Untrusted Content & Prompt Injection, § Shell Injection, § Public repo content, § PII; `docs/testing.md` § Test first; `.bkit/workflows.md` § Test-first.
- Outside lens, not assessed: whether a `--test-reporter-destination=` with an empty `$BKIT_TEST_REPORT` behaves like the Vitest case the starter warns about. This is runner robustness, not security, and was not probed (no code was run).
