Verdict: PASS
Failures: 0
Fingerprint: 7539eb013086ce986c6183c1c6ff91dcdf24cc9b41ebb28ae45365c98d8ef34e
<!-- verdict:end -->

# Build Challenge

Lens: Security — auth, secrets, input validation, data exposure, OWASP, data-access policies / tenancy.

## Scope

- Diff: `tmp/bkit-diff-1028-gate-fails-workflow.md`, full coverage (its first line is not `partial diff coverage`).
- Surfaces challenged: `scripts/gate/bkit-text-ceiling.mjs`, `scripts/gate/bkit-text-ceiling.json`, `scripts/gate/bkit-gate-changed.mjs`, `scripts/gate/bkit-gate-changed.test.mjs`, `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts`, `.bkit/core/engine/audits/repo/package-json.test.ts`, `package.json`, `docs/testing.md`, `docs/architecture.md`, and the rows the diff adds to `.bkit/friction.jsonl`, `docs/decisions.jsonl` and `docs/deferrals.jsonl`.
- Docs loaded: `.agents/docs.md`, `docs/security.md` (present), `docs/testing.md:574`; `docs/knowledge.jsonl` searched for terminal-check lessons (`isTTY`, pseudo-terminal): no entry.

## Notes

- Authorisation, owner-only `raise`: `main` refuses `raise` unless both `process.stdin.isTTY` and `process.stdout.isTTY` are set (`scripts/gate/bkit-text-ceiling.mjs:225`), and no flag or environment variable skips the check. `lower` writes only when every total is at or below a numeric ceiling (`scripts/gate/bkit-text-ceiling.mjs:207`, `:211`), so it can never raise a ceiling, even with a doctored `--root`, and it refuses any `--record` file without numeric ceilings, so it cannot overwrite an arbitrary JSON file.
- Not re-raised: the known ways around the owner-only rule (a pseudo-terminal wrapper, a host terminal session, an import of `raiseCeilings` with a confirming callback, a hand edit of the record) are recorded in `docs/deferrals.jsonl` key `1028-gate-fails-workflow-challenge-low-docs-testing-md-574` and in plan Task 8's out-of-scope list. The other LOW rows this diff adds to `docs/deferrals.jsonl` (keys ending `-mjs-67`, `-mjs-68`, `-mjs-174`, `-mjs-213`, `-mjs-243`, `-test-ts-301`) are likewise not re-raised. The step's no-duplicate rule names plan tasks and tests only; treating these ledger rows as cover is a judgement call to avoid duplicate tasks.
- Injection: every subprocess is `spawnSync("git", args)` with an argument array and no shell (`scripts/gate/bkit-text-ceiling.mjs:41`). `git show` takes `{sha}:{rel}`, with the sha from `git log` and `rel` from `readdirSync`, so no argument starts with `-` (`:51`); the record path follows `--` (`:47`). This matches `docs/security.md` § Shell Injection.
- Record parsing: `JSON.parse` (`:64`) cannot pollute prototypes here: only the `prompts` and `workflows` keys are read, and `writeRecord` rebuilds the object from `next()`.
- Secrets, PII and consumer names: none in the diff (scanned for token prefixes, local home paths, private-key headers and consumer names: no hits). The record holds word counts and reasons only, and the script prints repo-relative file names and counts, never file content.
- Supply chain: no new dependency; Node builtins only; one `package.json` script line, pinned by `.bkit/core/engine/audits/repo/package-json.test.ts`.
- Data access, tenancy and RLS: not applicable (`docs/security.md` § RLS: no database).
- Residual, below the bar: `raiseCeilings` prints record values without a type check (`:159`), so a hand-edited record can put escape sequences on the owner's confirmation prompt; the precondition is a hand edit of the record, which already defeats the control and is out of scope per Task 8. `listFiles` follows a symlinked `*.md` (`:36`), so a symlink to a FIFO hangs the gate; that needs repo write access, and file content is never printed.
- Observation for the owner, not a code finding: the plan marks Tasks 5 and 7 "accepted by owner", while the `docs/decisions.jsonl` rows `1028-challenge-ceiling-merge-conflict` and `1028-challenge-lower-counts-working-tree` give the rationale as relayed by the orchestrator session "under the owner's instruction to keep work going". No owner-written record of that instruction is in the diff.
