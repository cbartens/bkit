Verdict: SPLIT

<!-- verdict:end -->

# Plan Complexity Check

## Counts

- **Total checkboxes (tasks + gates + verification items):** 68
- **Execution tasks (WS-T items only):** 35 (WS1: 7, WS2: 5, WS3: 11, WS5: 1, WS6: 3, WS7: 2, WS4: 6)
- **Gates:** 8 (Gate WS-1, Gate WS-2, Gate WS-3, Gate WS-4, Gate WS-6, Gate 1, Gate 2, Gate 3/4)
- **Domain areas covered:** 4
  1. Engine/source code (TypeScript — `bkit-paths.ts`, `bkit-modules.ts`, `bkit-install.ts`, `bkit-uninstall.ts`, `bkit-preflight.ts`)
  2. Build/packaging config (`tsconfig.json`, `vitest.config.ts`, `package.json`)
  3. Tests — unit + integration + snapshots (~10 test files touched/authored)
  4. Docs/prose — 8+ documentation files updated atomically with the code move

## Session Fit Estimate

- **Task count:** 35 WS-T execution tasks exceeds the 15-task threshold by 2.3x.
- **Rough token estimate:** Each WS-T task involves reading 1-3 source files (average ~500-1500 lines), making targeted edits, and verifying. WS3-T3 alone touches 17 call-sites across 4 files; WS3-T10 re-points 10+ test files; WS3-T11 updates strings/comments across 5 files; WS-2 baseline capture requires live `pnpm pack` + dogfood runs; WS-4 requires two separate tarball install+upgrade verification cycles. Estimated token load: 180-250K — well above the 100K threshold.
- **Structural complexity driver:** The load-bearing ordering (WS-1 must complete and be gated before WS-3; WS-2 baseline must be captured before any `git mv`; WS-3 is the atomic big-move; WS-4 requires full post-move tarball verification) means each phase must be fully completed and verified before the next starts. This serial dependency chain prevents any parallelism and compounds the per-session load.

## Rationale

**SPLIT** — task count (35) exceeds 15 and estimated token load (180-250K) exceeds 100K.

The plan's own dependency graph provides the natural partition boundaries. The workstreams already encode the correct execution order and have explicit inter-WS dependency edges. Each partition below is self-contained: it starts from a fully verified prior state (committed, green), produces a committed verifiable artifact, and maps to one sub-issue (#161-#167).

---

### Proposed Sub-Plans

#### Sub-Plan A: WS-1 + WS-2 — Seam scaffolding and baseline capture (#161, #162)

**Dependencies:** none (roots of the DAG)

**Scope:**

- WS1-T1..WS1-T7: add `BKIT_SRC_SUBPATH`, `getTemplatesRoot()`, `isDogfood()`, header comment expansion, `runPayload()` PKG_ROOT refactor, fail-loud guard + path-agnostic test, dogfood-noop integration test, `getPkgRoot()` 3-context unit test
- Gate WS-1: `pnpm test` + `pnpm build` + `check:dist` green with tree STILL at `.agents/`
- WS2-T1..WS2-T5: `pnpm pack`, clean install, capture `bkit-version-hashes.json`, `agents-tree.txt`, `pack-filelist.txt`, `stale-consumer-setup.md`
- Gate WS-2: all four baseline artifacts committed; no `git mv` has run

**Exit state:** seam functions exist (pointing at old paths), all tests green, baseline artifacts committed. The move has NOT happened.

**Estimated tasks:** 13 (7 WS-T + 1 gate + 5 WS-T + 1 gate)

---

#### Sub-Plan B: WS-3 + WS-5 — Physical move, resolver re-point, dead-arm deletion, doctor observability (#163, #165)

**Dependencies:** Sub-Plan A (Gate WS-1 + Gate WS-2 must be green and committed)

**Scope:**

- WS3-T1: `git mv .agents/scripts .bkit/src` + `git mv .agents/templates .bkit/templates`
- WS3-T2: flip `BKIT_SRC_SUBPATH` + `getTemplatesRoot()` to `.bkit/` forms; re-run WS1-T5 guard test and WS1-T7 3-context test against relocated layout
- WS3-T3: replace 17 inline `path.join(..., ".agents", "templates", ...)` call-sites across 4 source files with `getTemplatesRoot()`
- WS3-T4: delete dead `runPayload` templates arm
- WS3-T5: D1 orphan-removal in upgrade path + WS-3-local integration smoke test (3 assertions)
- WS3-T6: `tsconfig.json` rootDir/include re-target
- WS3-T7: `vitest.config.ts` glob re-target
- WS3-T8: `package.json` `files[]` + `lint:no-tier-terms` path
- WS3-T9: confirm `NPM_STRIP_REMAP` unchanged, `.bkit/templates/gitignore` dot-less
- WS3-T10: re-point all test path-constants + regenerate snapshot
- WS3-T11: re-point engine-source strings/comments (prioritise `bkit-modules.ts:1255` consumer-facing error message)
- Gate WS-3: `pnpm build` + `check:dist` + `pnpm test` green; source-grep clean
- WS5-T1: extend `bkit doctor` to print templates root line + assert in integration test

**Exit state:** `.bkit/src/` and `.bkit/templates/` exist; all source-root references re-pointed; build + tests green; doctor observability added.

**Estimated tasks:** 13 (11 WS-T + 1 gate + 1 WS-T)

---

#### Sub-Plan C: WS-4 — Two-axis verification gate (#164)

**Dependencies:** Sub-Plan B (Gate WS-3 must be green and committed; WS-2 baseline artifacts must be present)

**Scope:**

- WS4-T1: post-move packed-tarball install → hash-set diff vs baseline (axis 1)
- WS4-T2: recursive `.agents/` tree diff vs baseline (axis 2)
- WS4-T3: tarball install over pre-move stale consumer → `bkit upgrade` → hash-set diff (axis 1)
- WS4-T4: upgraded-consumer tree diff + D1 orphan `.agents/templates/` confirmed gone (axis 2)
- WS4-T5: `npm pack --dry-run` file-list diff vs baseline
- WS4-T6: moved `bkit-dry-run-parity.integration.test.ts` re-verified green
- Gate WS-4: byte-identical confirmed on both engines; orphan removed; pack-filelist confirmed

**Exit state:** byte-identical guarantee on both install and upgrade axes confirmed against the WS-2 baseline; orphan removal verified end-to-end.

**Estimated tasks:** 7 (6 WS-T + 1 gate)

---

#### Sub-Plan D: WS-6 + WS-7 — Docs/prose atomic update and rules.md CI gate (#166, #167)

**Dependencies:** Sub-Plan B (Gate WS-3 must be green; WS-4 verification is a quality gate but docs can land once WS-3 is committed — per plan merge-gating requirement they ship together in the same PR as the code move)

**Scope:**

- WS6-T1: `.agents/rules.md` sync rule, central principle, preflight ref
- WS6-T2: update `docs/setup.md`, `docs/architecture.md`, `docs/deployments.md` (incl. shipped `renovate.json5` template `ignorePaths` glob + comment block), `docs/testing.md`, `docs/technology.md`, `docs/knowledge.md` (forward-looking only)
- WS6-T3: grep-and-re-point `\.agents/(templates|scripts)` across `docs/`, `README.md`, `.agents/docs.md`, `.agents/workflows.md`, `.bkitignore`, `.github/workflows/ci.yml` and its template source
- Gate WS-6: no setup/authoring doc points at a relocated source path; `renovate.json5` updated in lockstep
- WS7-T1: `bkit-rules-sync.test.ts` — managed-block byte-equality CI assertion (block-scoped; `### bkit Repo Authoring` section excluded)
- WS7-T2: new `docs/decisions.md` entry for the block-scoped gate (do NOT rewrite DE-19)
- Gate 2 / Gate 3: implementation + docs final checkpoint

**Exit state:** all doc files updated atomically; rules.md CI gate added and green; decisions.md entry committed.

**Estimated tasks:** 9 (3 WS-T + 1 gate + 2 WS-T + Gate 2 + Gate 3 checkboxes)
