# Build Challenge Tests — bar-130-ci-lint-scaffolding

**FID:** bar-130-ci-lint-scaffolding
**Verdict:** CONCERNS

## Tests added

| Finding | Test file | Test name | Status |
| --- | --- | --- | --- |
| MED-1 | bkit-modules.integration.test.ts | MED-1: --ci only (no --lint) prints package.json script suggestions in print-sink → runCiModule always pushes lint:prose / lint:slop / format:check suggestions to printSink | PASS |
| MED-1 | bkit-modules.integration.test.ts | print-sink ci suggestion mentions bkit install --lint as the remedy | PASS |
| MED-2 | bkit-tokens.test.ts | MED-2: warns to stderr when packageManager is yarn@4.0.0 and returns '10' | PASS |
| MED-2 | bkit-tokens.test.ts | MED-2: warns to stderr when packageManager is npm@9.0.0 and returns '10' | PASS |
| MED-2 | bkit-tokens.test.ts | MED-2: does NOT warn to stderr when packageManager is absent (silent default) | PASS |
| MED-3 | bkit-install.test.ts | MED-3: auth-shim insteadOf is scoped to 'https://github.com/cbartens/bkit/' not bare 'https://github.com/' | PASS |
| MED-3 | bkit-install.test.ts | MED-3: auth-shim url rewrite key also contains cbartens/bkit/ (both sides scoped) | PASS |
| MED-4 | bkit-modules.integration.test.ts | .bkit-version is written LAST — after all modules complete (postDispatch) | PASS |
| MED-4 | bkit-modules.integration.test.ts | .bkit-version is absent if postDispatch is NOT flushed (mid-install crash simulation) | PASS |
| MED-5 | bkit-modules.integration.test.ts | MED-5: print-sink emitted on first install contains no literal \\$ sequence (backslash-dollar) | PASS |
| MED-5 | bkit-modules.integration.test.ts | MED-5: print-sink script block is valid JSON when extracted lines wrapped in braces (copy-paste safety) | PASS |
| MED-6 | bkit-tokens.test.ts | MED-6: .nvmrc with leading comment extracts version from first non-comment line | PASS |
| MED-6 | bkit-tokens.test.ts | MED-6: .nvmrc with multiple comment lines and blank lines before version | PASS |
| MED-6 | bkit-tokens.test.ts | MED-6: .nvmrc that is only comments falls through to engines.node fallback | PASS |
| MED-6 | bkit-tokens.test.ts | MED-6: .nvmrc version with 'v' prefix after leading comment parses correctly | PASS |
| MED-7 | bkit-tokens.test.ts | MED-7: token value '$&' substitutes as literal '$&', not as regex back-reference | PASS |
| MED-7 | bkit-tokens.test.ts | MED-7: token value '$$' substitutes as literal '$$', not as escaped dollar | PASS |
| MED-7 | bkit-tokens.test.ts | MED-7: token value '$1' substitutes as literal '$1', not as capture-group reference | PASS |
| MED-8 | bkit-dry-run-parity.integration.test.ts | (`it.todo`) WriteSet records core/payload writes once copyAdditive+runPayload are merged | TODO |

## Verification commands

| Command | Exit |
| --- | --- |
| `pnpm typecheck` | 0 |
| `pnpm test` | 0 (173 passed, 1 todo, 7 files) |
| `pnpm format:check` | 0 |
| `pnpm lint:slop` | 0 |

## Outstanding

- MED-8 — placeholder `it.todo` only; full test deferred until `copyAdditive`/`runPayload` merge per docs/pending.md.

<!-- verdict:end -->
