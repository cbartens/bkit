Verdict: PASS
Failures: 0

<!-- verdict:end -->

# Plan Review

Lens: Regression risk, design-coverage.

## Surface-Area Map

Per task, the touched surfaces and their consumers (all path literals re-verified against the live tree):

**WS-1 (seam, pre-move) — `bkit-paths.ts`, `bkit-install.ts`, `bkit-modules.ts`**

- `getPkgRoot()` (`bkit-paths.ts:17-22`) — HIGH-RISK shared utility; consumed by every engine module + `runPayload`. The suffix walk (`endsWith(${sep}.agents${sep}scripts)`) is duplicated inline in `runPayload()` (`bkit-install.ts:627-630`) — confirmed byte-for-byte identical to the seam. WS1-T4 collapses the duplicate into the seam before any string change. This is the single highest-leverage failure surface (CI builds `dist/`, the dist arm; dev/test runs the tsx arm).
- New exports `getTemplatesRoot()`, `isDogfood()`, `BKIT_SRC_SUBPATH` — net-new public symbols; no external consumers (package-internal).
- Fail-loud guard in `bkit-modules.ts` — mirrors the existing `bkit-modules.ts:359-362` `process.exit(1)` "package corrupt?" hard-exit (confirmed present). Replaces silent `if (!fs.existsSync) return` for templates-derived paths.

**WS-3 (physical move + re-point) — engine source + tooling config**

- 16 inline source-template literals confirmed live (grep, non-test): `bkit-modules.ts` ×11 (188, 558, 620, 645, 670, 749, 1348, 1532, 1725, 1831, 1928), `bkit-install.ts` ×1 (upgrade `tplRoot` 736), `bkit-uninstall.ts` ×1 (425), `bkit-preflight.ts` ×2 (469, 516). All route through `getTemplatesRoot()`. The plan correctly carries the design's grounding-correction that `bkit-preflight.ts:469,516` were ABSENT from the design's WS-3 list — they are included in WS3-T3.
- `runPayload` dead templates arm (`bkit-install.ts:660-666`, incl. the `tplDst = path.join(".agents","templates")` at 661) — DELETE. Confirmed dead post-move (no consumer-side `.agents/templates` to mirror into). The workflows/prompts arm (639-658) keeps its `src === dst` skip — confirmed untouched.
- `tsconfig.json` `rootDir`/`include`, `vitest.config.ts:5` include globs (confirmed hardcoded `.agents/scripts/**`), `package.json` `files[]` (confirmed the three `!.agents/scripts/*` exclusions at 15-17) + `lint:no-tier-terms` (line 43).
- `NPM_STRIP_REMAP` (`bkit-install.ts:577-580`) — confirmed `{gitignore→.gitignore, npmignore→.npmignore}`; UNCHANGED. The `gitignore` template stored dot-less under `CORE_TEMPLATE_FILES` (`bkit-modules.ts:158`) — must continue to ship dot-less from `.bkit/templates/`.

**Schema / data contract — `.bkit-version`**

- `BkitVersion` (`bkit-version.ts:37-63`) — confirmed: `tier3Hashes`/`canonicalHashes` keys are consumer-relative DESTINATION paths (docstring: ".github/workflows/ci.yml", ".claude/agents/bkit-foo.md"). NO source-tree encoding. The "in-flight upgrade across the boundary" edge case is a non-issue: the upgrade engine reads destination keys, which the source move leaves identical. Plan's "no migration" stance is correct and grounded.

**WS-3 D1 orphan-removal (upgrade path) — `bkit-install.ts` upgrade flow**

- Insertion point confirmed: `migrateStrayGitattributes(process.cwd(), upgradeFlags.dryRun)` at `bkit-install.ts:731` is an existing precedent for a dry-run-aware, idempotent upgrade-time migration. WS3-T5's orphan-removal sits naturally here.

**WS-5 (doctor) — `bkit-install.ts` doctor verb (697-719, confirmed read-only).**

**WS-6 (docs / shipped config) — multi-subscriber shipped template**

- Shipped `renovate.json5` (`.agents/templates/.github/renovate.json5`) — HIGH-RISK consumer-facing config. `ignorePaths` line 81 = `.agents/templates/**` confirmed. WS6-T2 covers the glob flip. (See OPTIONAL for the comment block at lines 66-70.)
- `.agents/rules.md` managed block ends `bkit:end` at line 96; `### bkit Repo Authoring` at line 98 (OUTSIDE the block) — confirmed. Sync rule at line 102, preflight ref at line 106 — confirmed. D3's "managed-block-only" gate scope is correctly grounded; the bkit-repo-only section is never shipped, never compared.

**WS-7 (rules.md CI gate) — new test `bkit-rules-sync.test.ts`; compares managed block only (D3).**

## CRITICAL

None. The plan's grounding survived live re-verification on every load-bearing claim:

- All ~19 source literals are enumerated (16 templates literals + 2 preflight + the upgrade `tplRoot`); the design-missed `bkit-preflight.ts:469,516` are explicitly carried forward.
- The dotfile-strip remap (`NPM_STRIP_REMAP`) is correctly held UNCHANGED, with a verification task (WS3-T9) + tarball-content gate (WS4-T5) confirming `.bkit/templates/gitignore` actually ships dot-less.
- `files[]` correctly keeps `.agents` (KN-5 / `loadTrackers` hard-throw risk) and re-targets only the test/snapshot exclusions to `.bkit/src` — directly answering the design's RESOLVED open question; the tarball-removals-only diff (WS4-T5) is the gate.
- The vitest glob re-target is treated as REQUIRED (WS3-T7) with an explicit non-zero-test-count Done-when AND a dedicated Automated-Tests gate ("`pnpm test` reports a NON-ZERO test count") — the green-but-empty regression is caught at two layers.
- The upgrade-boundary `.bkit-version` concern is correctly dismissed: keys are destination-relative (confirmed in `bkit-version.ts`), so no migration runs and in-flight consumers are unaffected. D1 orphan-removal has a grounded insertion point and a dedicated assertion (WS4-T4).
- Migration ordering is load-bearing and correct: WS-1 (seam + guards + dogfood test, validated green at `.agents/`) and WS-2 (baseline, uncapturable post-move) BOTH gate WS-3 (`git mv`). The dangerous mid-state (templates moved before guards land → self-overwrite of live `.agents/`) never exists. Gates WS-1, WS-2, WS-3 enforce the order explicitly.
- Every design workstream (WS-1..WS-7) and every BINDING decision (D1 drop+auto-clean, D2 dist stays flat, D3 managed-block-only gate) maps to runbook tasks AND a Derived-Test-Matrix row. No design section identifying a touched surface is left without plan coverage.
- KN cross-reference: KN-5 (`files[]` ships `.ts` source) and KN-7 (dist staleness on `.agents/scripts/*.ts` edits) are the past regressions in these exact surfaces. The plan does NOT re-enter either: `files[]` keeps the test/snapshot exclusions (re-targeted, not dropped); `check:dist` is retained green in every gate and KN-7's forward-looking rule (knowledge.md:186) is flagged for WS-6 update. No re-entry into a known-broken pattern.

## OPTIONAL

1. **WS3-T10 test-file list omits `bkit-preflight.test.ts`.** A live grep for `.agents/templates` across test files returns 12 files; WS3-T10 enumerates 11. The omitted file is `bkit-preflight.test.ts`, whose two hits (lines 536, 858) are stale references inside an `it(...)` description string and a comment — non-load-bearing (they won't fail a test if left stale). Gate WS-3's `rg '\.agents/(scripts|templates)' .bkit/src` would surface them as unexpected residual hits, so the gate catches the miss. Suggest adding `bkit-preflight.test.ts` to the WS3-T10 enumeration (comment-string cleanup) so Gate WS-3 reads clean rather than flagging an "intended?" residual.

2. **WS6-T2 explicit doc list omits `docs/testing.md` and `docs/technology.md`.** Both carry forward-looking, load-bearing `.agents/scripts/` references: `docs/testing.md:37` (test colocation rule), `docs/testing.md:51` (CI-parity rule), `docs/technology.md:22` (source-language row), `docs/technology.md:39` (`tsc` compiles `.agents/scripts/*.ts → dist/`). WS6-T3's generic "Grep `\.agents/(templates|scripts)` across `docs/` ... re-point all hits" with a zero-non-historic-hit Done-when IS the safety net that catches these, so this is not an uncovered regression. The risk is purely that the WS6-T2 explicit enumeration reads as exhaustive and an implementer under-scopes before reaching WS6-T3. `docs/testing.md` is a Plan/Build `●` workflow-matrix doc, so a stale rule there is high-visibility. Suggest naming both files in WS6-T2.

3. **Shipped `renovate.json5` comment block (lines 66-70) describes `.agents/templates/**`as a bkit-owned mirror "written into the consumer working tree by`bkit install`/`bkit upgrade`."** Post-D1 this is factually false — consumers no longer receive `.agents/templates/`. WS6-T2 flips the `ignorePaths`glob (line 81) but does not mention the comment block, which ALSO ships to consumers (the whole file is a Tier-3 seed). Note`.agents/skills/\*\*`(line 82) stays correct (skills remain in`.agents/`). Suggest updating the lines 66-70 comment in lockstep so the shipped template's prose matches the new mirror set; WS6-T3's grep would flag line 66 as a residual hit regardless.

## OUT OF SCOPE

- **Renovate `.bkit/**`scan-noise on the bkit repo's OWN renovate config.** The shipped template's`ignorePaths`flip protects consumers; the bkit repo's own root`renovate-local.json5`/ renovate config (separate from the shipped template) may want a parallel`.bkit/templates/\*\*`ignore so the bkit repo itself does not get onboarding-PR noise on the relocated tree. This is bkit-repo-only dev hygiene, orthogonal to the consumer byte-identical guarantee, and not part of #160's scope. Raise as a follow-up only if the repo's renovate run starts scanning`.bkit/`.

- **Retire the duplicate `getPkgRoot` suffix-walk pattern repo-wide via a lint rule.** WS-1 collapses the one known duplicate (`runPayload`). A future-proofing lint that forbids inline `scriptDir.endsWith(...)` PKG_ROOT derivation outside `bkit-paths.ts` would prevent the failure mode recurring, but it is net-new tooling beyond #160's structural-move scope.
