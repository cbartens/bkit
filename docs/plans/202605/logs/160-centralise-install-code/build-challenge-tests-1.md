# Build Challenge Tests — 160-centralise-install-code

## Summary

23 new edge-case tests added in `.bkit/src/bkit-challenge-tests-160.test.ts`.

### Areas covered

**F1 MEDIUM — `removeOrphanTemplatesDir` sentinel guard (13 tests)**

- Deletes when each known bkit sentinel is present: `AGENTS.md`, `CLAUDE.md`, `gitignore`, `.vale.ini`, `.github/workflows/`
- Skips deletion when no known sentinel is present (consumer-owned content)
- Skips deletion when directory is empty (no sentinels)
- No-op when `.agents/templates/` does not exist
- No-op when `.agents/` does not exist at all
- `dryRun: true` logs but does NOT delete when sentinel is present
- `dryRun: true` no-op when directory is absent
- Skipping consumer-owned dir logs a skip notice (not silently ignored)

**`getTemplatesRoot()` three-context resolution (6 tests)**

- Contains `.bkit` and `templates` as distinct path segments (never old `.agents/templates` form)
- Does NOT return the old pre-move `.agents/templates` path (regression guard)
- Equals `getPkgRoot()` joined with `.bkit/templates` (direct derivation)
- Resolves to an existing directory in the test (tsx-from-source) context
- Simulated dist/ arm: resolves one level up, produces `.bkit/templates`
- Simulated tsx-from-source arm: resolves two levels up, produces `.bkit/templates`

**`guardTemplatesRoot()` additional edge cases (4 tests)**

- Calls `process.exit(1)` for empty string path (falsy root)
- Emits error message for empty string path (gap in existing coverage)
- Includes the provided logPrefix in the error message
- Does NOT exit when passed the actual templates root

## Log

```
[2026-05-28] pnpm test .bkit/src/bkit-challenge-tests-160.test.ts → 23 passed (1 file)
[2026-05-28] pnpm test → 1164 passed, 2 skipped, 1 todo (33 files)
```

## Blockers

None

## Bugs Discovered

None

<!-- verdict:start -->

Verdict: PASS
Tests: 23 new tests added

<!-- verdict:end -->
