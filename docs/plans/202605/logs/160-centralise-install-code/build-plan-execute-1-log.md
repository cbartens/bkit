# Build Plan Execute Log — Sub-plan 1/4

<!-- verdict:start -->

Verdict: PASS

<!-- verdict:end -->

## Execution Log

DONE — Task WS1-T1: Add BKIT_SRC_SUBPATH constant to bkit-paths.ts, derive getPkgRoot() suffix from it — pnpm test + pnpm build green; no behaviour change (.agents/scripts/bkit-paths.ts)
DONE — Task WS1-T2: Add getTemplatesRoot() and isDogfood() to bkit-paths.ts — both exported; bkit-paths.test.ts asserts getTemplatesRoot() ends with .agents/templates and isDogfood() detects repo root (.agents/scripts/bkit-paths.ts)
DONE — Task WS1-T3: Expand bkit-paths.ts header comment to enumerate THREE run-contexts (dist, tsx-from-source, packed-tarball) — three-context comment block added (.agents/scripts/bkit-paths.ts)
DONE — Task WS1-T4: Refactor runPayload() to use getPkgRoot() instead of inline suffix walk — inline scriptDir.endsWith() deleted; getPkgRoot() called directly (.agents/scripts/bkit-install.ts)
DONE — Task WS1-T5: Add fail-loud guardTemplatesRoot() in bkit-modules.ts + path-agnostic unit test — exported function triggers process.exit(1) for any non-existent root; test contains no .agents/templates literal (.agents/scripts/bkit-modules.ts, .agents/scripts/bkit-modules.test.ts)
DONE — Task WS1-T6: Add bkit-dogfood-noop.integration.test.ts — exists, 4 tests pass in tsx context, asserts zero writes to .agents/ when isDogfood() (.agents/scripts/bkit-dogfood-noop.integration.test.ts)
DONE — Task WS1-T7: Add bkit-paths.test.ts with 3-context assertions — 9 tests pass; dist arm, tsx-from-source arm, packed-tarball arm each explicitly asserted (.agents/scripts/bkit-paths.test.ts)
DONE — Gate WS-1: scaffolding green pre-move — pnpm test (1137 pass) + pnpm build green; tree still at .agents/; no file relocation
DONE — Task WS2-T1: Build pre-refactor packed tarball and install into clean consumer dir (tmp/ws2-consumer) with default flags — install complete, .bkit-version written (tmp/cbartens-bkit-2.8.4.tgz)
DONE — Task WS2-T2: Capture .bkit-version hash-set baseline — bkit-version-hashes.json written (docs/plans/202605/logs/160-centralise-install-code/baseline/bkit-version-hashes.json)
DONE — Task WS2-T3: Capture recursive .agents/ consumer-tree listing — 123-line sorted agents-tree.txt written (docs/plans/202605/logs/160-centralise-install-code/baseline/agents-tree.txt)
DONE — Task WS2-T4: Capture npm pack --dry-run file list — 240-file sorted pack-filelist.txt written (docs/plans/202605/logs/160-centralise-install-code/baseline/pack-filelist.txt)
DONE — Task WS2-T5: Capture stale-consumer-setup.md with exact construction steps — stale-consumer-setup.md written naming pre-move tarball install as D1 orphan-removal input (docs/plans/202605/logs/160-centralise-install-code/baseline/stale-consumer-setup.md)
DONE — Gate WS-2: baseline captured before any move — all 4 artifacts in baseline/; captured from packed tarball; no git mv has run
