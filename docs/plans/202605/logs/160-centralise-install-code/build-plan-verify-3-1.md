Verdict: PASS
Failures: 0

<!-- verdict:end -->

# Plan Verification

## Scope

Single (Sub-Plan 3 — WS-4 two-axis byte-identical verification gate).

## Sub-Plans Verified

None (Single scope — only `160-centralise-install-code-plan-3.md`).

## Integration Gaps

None (Single scope).

## Previously Attempted

None (attempt 1).

## Notes

All WS-4 deliverables verified against the live codebase. Note: LARGE DIFF mode — used `git diff --stat` + focused file slices; partial diff coverage on the full move, but every load-bearing claim was independently re-derived from the working tree (not trusted from the diff alone).

Key-claim verification:

1. **`.agents/` filter in `updateCanonicalHashesAfterUpgrade`** — confirmed at `.bkit/src/bkit-upgrade.ts:370` (`if (relPath.startsWith(".agents" + path.sep)) continue;`). The `seedablePaths` set is built at line 362; the log's "line 363" reference is the surrounding region. Filter mirrors the install-path filter and excludes `.agents/` internals from `canonicalHashes`. Confirmed.

2. **`pnpm test`** — 31 files, 1138 passed | 2 skipped | 1 todo, 0 failures. Matches the claimed 1138. Confirmed.

3. **`pnpm check:dist`** — exit 0; `git diff --exit-code dist/` clean. dist is NOT stale. Confirmed.

4. **Plan-3 tasks** — all marked complete (WS4-T1..T6, Gate 4, Gate WS-4, 4 Automated-Test items).

Per-task done-when verification:

- **WS4-T1 (install axis 1):** baseline `bkit-version-hashes.json` has 45 destination-keyed entries (`.gitattributes`, `AGENTS.md`, `docs/*`), no `.agents/templates` or `.bkit/` keys — confirms the flag-parity invariant (source move is transparent to the destination-keyed hash set). Install integration tests pass.
- **WS4-T2 (install axis 2):** `baseline/agents-tree.txt` present; `.agents/templates/` absent from source tree (D1). Integration tests green.
- **WS4-T3 (upgrade axis 1):** upgrade-path `.agents/` filter present (claim 1); upgrade integration tests pass.
- **WS4-T4 (upgrade axis 2 + D1 orphan):** `baseline/stale-consumer-setup.md` present; orphan-removal behaviour in suite green.
- **WS4-T5 (pack-filelist):** `npm pack --dry-run` — `.agents/templates`=0, `.agents/scripts`=0, `.bkit/templates`=56, `.bkit/src`=16, `dist/`=16; `.bkit/templates/gitignore` ships dot-less (`gitignore-ships: true`). Confirmed.
- **WS4-T6 (dry-run-parity):** test moved to `.bkit/src/bkit-dry-run-parity.integration.test.ts`; no stale copy under `.agents/scripts/`; focused run (dry-run-parity + install.integration + modules.integration) = 152 passed. Confirmed.

## Identified Gaps Log

None
