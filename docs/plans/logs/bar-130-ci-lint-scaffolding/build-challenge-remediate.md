# Build Challenge Remediate — bar-130-ci-lint-scaffolding

**FID:** bar-130-ci-lint-scaffolding
**Verdict:** CONCERNS

## Findings addressed

| #     | Finding                        | Status   | Files touched                                                                                                                                                                       |
| ----- | ------------------------------ | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| MED-1 | --ci without --lint print-sink | FIXED    | `.agents/scripts/bkit-modules.ts`                                                                                                                                                   |
| MED-2 | Non-pnpm packageManager warn   | FIXED    | `.agents/scripts/bkit-tokens.ts`                                                                                                                                                    |
| MED-3 | Auth-shim narrowing            | FIXED    | `.agents/templates/.github/workflows/ci.yml`                                                                                                                                        |
| MED-4 | .bkit-version write LAST       | FIXED    | `.agents/scripts/bkit-modules.ts`, `.agents/scripts/bkit-install.ts`, `.agents/scripts/bkit-modules.integration.test.ts`, `.agents/scripts/bkit-dry-run-parity.integration.test.ts` |
| MED-5 | Copy-paste-safe print-sink     | FIXED    | `.agents/scripts/bkit-modules.ts`                                                                                                                                                   |
| MED-6 | .nvmrc comment-stripping       | FIXED    | `.agents/scripts/bkit-tokens.ts`                                                                                                                                                    |
| MED-7 | applyTokens $& escape          | FIXED    | `.agents/scripts/bkit-tokens.ts`                                                                                                                                                    |
| MED-8 | runPayload WriteSet threading  | DEFERRED | —                                                                                                                                                                                   |

## Verification commands run

| Command             | Exit                   |
| ------------------- | ---------------------- |
| `pnpm typecheck`    | 0                      |
| `pnpm test`         | 0 (157 tests, 7 files) |
| `pnpm format:check` | 0                      |
| `pnpm lint:slop`    | 0                      |

## Fix notes

**MED-1:** `runCiModule` now always pushes a `[bkit] ci:` print-sink entry listing the three
package.json scripts the generated ci.yml invokes (`lint:prose`, `lint:slop`, `format:check`), with
a reminder to run `bkit install --lint` or add them manually.

**MED-2:** `resolvePnpmVersion` now writes to `process.stderr` when `packageManager` is present but
not a pnpm specifier, before applying the default of `"10"`.

**MED-3:** Auth-shim `insteadOf` rewritten from `"https://github.com/"` to
`"https://github.com/cbartens/bkit/"` — scoped to the specific repo the PAT covers.

**MED-4:** `ModuleContext` gains `postDispatch: Array<() => void>`. `runCoreModule` pushes the
`.bkit-version` write into `postDispatch` instead of writing it immediately. `dispatchModules`
flushes all `postDispatch` callbacks after all module functions return. Tests updated: two `.bkit-version
write-order regression` tests now use `dispatchModules` (not raw `runCoreModule`); a new test
verifies `.bkit-version` is absent when `postDispatch` is not flushed (crash simulation). The
`.bkit-version before ci.yml` ordering test updated — `.bkit-version` now comes AFTER `ci.yml`
since postDispatch runs last.

**MED-5:** First-install print-sink script block built via `JSON.stringify` on a small object, then
stripped of outer braces. Resulting output is copy-paste-safe JSON (no backslash-escaped `$` or
escaped quotes outside string context).

**MED-6:** `extractNodeMajor` now scans `.nvmrc` content line-by-line, skipping blank lines and
lines starting with `#`. First non-empty, non-comment line is used as the version source.

**MED-7:** `applyTokens` uses function-form replacer callbacks (`() => value`) instead of passing
raw string values to `String.prototype.replace`. This prevents `$&`, `$$`, `$1` substitution
patterns from leaking through when token values contain dollar signs.

## Outstanding / deferred

### MED-8 — `runPayload` WriteSet threading (DEFERRED)

**Rationale:** Threading `ws` into `runPayload` / `mirrorDirAlways` breaks all 5 cross-module
dry-run parity tests. Root cause: `copyAdditive` (which runs before `runPayload` in install mode
but is a no-op in check/dry-run mode) writes `.agents/workflows/**`, `.agents/prompts/**`, and
`.agents/templates/**` to disk. When `runPayload` then runs in install mode, it finds those files
already present and equal → 0 writes tracked. In check mode, `copyAdditive` wrote nothing →
`runPayload` sees all files as new → N writes tracked. The check/install writesets diverge by ~90
entries. Fixing this correctly requires either merging `copyAdditive` and `runPayload` into a single
idempotent pass, or tracking `copyAdditive` writes in `ws` (also not currently done). This is an
architectural change beyond the surgical scope of this remediation.

**Pending entry:** recorded in `docs/pending.md` as PE-MED8-runPayload-WriteSet.

<!-- verdict:end -->
