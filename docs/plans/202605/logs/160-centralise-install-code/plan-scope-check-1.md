Verdict: CONCERNS
Failures: 2

<!-- verdict:end -->

# Plan Scope Check

Lens: Scope, criteria, verification audit — every task has explicit scope, testable `Done when:`, and a concrete verification step; no scope creep beyond #160 design + D1/D2/D3; per-phase 🔒 Gates are satisfiable.

Grounding spot-checks performed against the live tree (still at `.agents/`):

- `bkit-paths.ts:17-22` — two-context `getPkgRoot()` walk, header names only two contexts. Confirmed.
- `vitest.config.ts:5` — hardcoded `.agents/scripts/**` include globs. Confirmed (green-but-empty risk real).
- `bkit-install.ts:626-630` runPayload inline suffix walk; `:660-666` dead templates arm; `:736` upgrade `tplRoot` inline walk. All confirmed verbatim.
- `bkit-modules.ts:1255` consumer-facing error string citing `.agents/templates/.github/workflows/ci.yml`. Confirmed verbatim — load-bearing.
- `bkit-modules.ts:359-361` existing fail-loud guard the WS1-T5 guard mirrors. Confirmed.
- `bkit-install.ts:697-719` doctor verb (read-only). Confirmed.
- Test files referenced by the matrix as EXISTING (`bkit-doctor.integration.test.ts`, `bkit-dry-run-parity.integration.test.ts`, `bkit-modules.integration.test.ts`, `bkit-modules.upgrade.integration.test.ts`, `bkit-templates.content.test.ts`) all present. Files marked NEW (`bkit-paths.test.ts`, `bkit-rules-sync.test.ts`, `bkit-dogfood-noop.integration.test.ts`) correctly absent.

The plan is structurally sound: all `docs/plans/template.md` mandated sections present and populated, every runbook task carries a `**Done when:**`, the Supersession Inventory is complete and each DELETE row is mirrored in Architecture & Component Changes plus a removal task. Verdict is CONCERNS (not PASS) for the two CRITICAL gaps below — both are matrix↔runbook 1:1 coverage defects, fixable in-place by plan-update.

## CRITICAL

1. **Matrix row 3 (`getPkgRoot()` resolves correctly under dist / tsx-from-source / packed-tarball) has no dedicated owning task — violates the "one row → exactly one runbook task" contract.** The row's target file is `bkit-paths.test.ts`, but no runbook task produces a unit test asserting all THREE contexts:
   - WS1-T2 writes a unit test that asserts only `getTemplatesRoot()` suffix + `isDogfood()` when `cwd === pkgRoot`. It does NOT cover the three `getPkgRoot()` contexts.
   - WS3-T2's `Done when` asserts "`getPkgRoot()` resolves correctly under `tsx`-from-`.bkit/src` (two levels up)" — only ONE of the three arms, and as a behavioural side-assertion, not a written 3-context unit test.
   - Gate 2 "Write new tests" lists "getPkgRoot 3-context unit test" as if it exists, but no runbook task is its source. The Verification-Plan "Run all tests" line also names "getPkgRoot-context" tests with no producing task.
     This is a green-but-uncovered trap: the dist arm of `getPkgRoot()` is deliberately left untouched (WS3-T2) yet is the arm `check:dist` exercises only indirectly. A consumer install runs from `dist/`; if the suffix-flip in WS3-T2 silently broke the non-`.bkit/src` fallback, no unit test would catch it. **Fix:** add an explicit runbook task (e.g. WS1-T2b or fold into WS3-T2) — "Write `bkit-paths.test.ts` asserting `getPkgRoot()` resolves to repo root under each of the three run-contexts (dist `→ ../`, tsx-from-source `→ ../..`, packed-tarball)" with a `Done when:` naming all three asserted cases — so the matrix row maps 1:1.

2. **Fail-loud guard (matrix row 2 / WS1-T5) is written and asserted BEFORE the path it guards is moved, then the guard's trigger condition silently changes under WS3 with no re-verification task.** WS1-T5 adds the `[bkit-modules] Templates root not found …` guard while `getTemplatesRoot()` still points at `.agents/templates` (WS1-T2), and its `Done when` asserts `process.exit(1)` against a non-existent templates root. After WS3-T2 flips `getTemplatesRoot()` to `.bkit/templates` and WS3-T1 `git mv`s the tree, nothing in WS-3 re-asserts the guard still fires for the relocated root, and Gate WS-3's grep-only check does not exercise it. Because the guard is the explicit replacement for the silent `if (!fs.existsSync) return` failure mode (a binding design intent), a guard that regressed to never-firing post-move would pass every gate. **Fix:** either (a) make the WS1-T5 unit test path-agnostic (inject/resolve the templates root) so it remains valid post-move, AND add a `Done when` line to WS3-T2 or Gate WS-3 confirming the guard test is still green after the flip; or (b) add a WS-3 verification sub-step re-running the guard test against the relocated layout.

## OPTIONAL

- **WS3-T11 `COPY_EXCLUDE` `scripts`-entry decision is deferred to "recorded inline" with no testable signal.** The `Done when` says the drop/retain decision "is recorded inline (cosmetic)" — there is no assertion that the decision was actually made versus forgotten. Since it is genuinely cosmetic (`.agents/scripts` is gone either way), this is OPTIONAL, but a one-line `Done when` ("`COPY_EXCLUDE` no longer lists `scripts`, or a comment states why it is retained") would make it verifiable.
- **WS2-T5 stale-consumer baseline `Done when` ("reproducibly establishes") lacks a concrete reproduction command.** It allows either a `stale-consumer-setup.md` OR a committed fixture dir, but does not pin HOW the stale `.agents/templates/` is created (e.g. install the 2.7.0 tarball, or hand-author the dir). WS4-T4 depends on this being deterministic; an under-specified setup risks a non-reproducible orphan-removal assertion. Tighten to name the exact construction step.
- **WS3-T5 (D1 orphan removal) and WS4-T4 (orphan-gone assertion) are the only coverage of the auto-clean; there is no unit test for the removal logic itself, only the WS-4 manual two-axis gate.** The edge-case table promises "no-op when the dir is already absent (fresh consumers) and dry-run aware," but WS3-T5's `Done when` asserts these only by reference to the WS-4 integration gate. A small unit/integration test on the upgrade orphan-removal (absent-dir no-op + dry-run no-write) would harden a consumer-visible behaviour change. OPTIONAL because WS4-T2/T4 do cover the observable outcome end-to-end.
- **Gate 2 "Update existing tests" claims "12 path-constant test files" but the plan never enumerates exactly 12.** WS3-T10 lists ~11 named files plus "+ `bkit-preflight.test.ts`". The count is informal; a divergence between the asserted "12" and the actual grep set could let a file slip. Consider replacing the literal "12" with "every file matching `rg '\.agents/templates' .bkit/src --glob '*.test.ts'`" so the gate is self-checking rather than count-pinned.

## OUT OF SCOPE

- **No task asserts the shipped `renovate.json5` template glob change does not itself perturb the byte-identical baseline.** WS6-T2 changes the shipped `renovate.json5` `ignorePaths` `.agents/templates/** → .bkit/templates/**`; this is a consumer-facing content change to a TRACKED template, so it WILL change `canonicalHashes`/`tier3Hashes` for that file. The Success Criteria promise "byte-identical hashes vs baseline." The plan treats the renovate glance as intended (Breaking Changes section flags it), but the WS-4 hash-diff `Done when` ("hash-set diff is empty") will NOT be empty for the renovate template. This is a genuine tension worth a design-level note — but resolving the baseline-vs-intended-renovate-change interaction is arguably a design clarification (is renovate.json5 in the hashed set, or untracked?), beyond a scope-check remit. Flagging for the parallel/orchestrator review; if renovate.json5 is in `canonicalHashes`, WS4-T1/T3 `Done when` must allow that one expected delta, otherwise the gate is unsatisfiable.
- **A regression guard preventing future re-introduction of `.agents/scripts`/`.agents/templates` source literals is not proposed.** WS-7 adds a rules.md block-equality CI gate but there is no standing CI lint asserting no source-root literal creeps back into `.bkit/src`. This is a future-hardening idea outside #160's stated scope.
- **`docs/completed.md` entry (WS6 table, "(Ship phase)") is correctly deferred to Ship and not a Plan task** — noted only to confirm it is intentionally out of the runbook, not a missing task.
