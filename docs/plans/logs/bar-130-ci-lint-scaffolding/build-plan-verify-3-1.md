# Build Plan Verify — Sub-plan 3, attempt 1

**FID:** bar-130-ci-lint-scaffolding
**Sub-plan:** 3/3 (Scope C — CLI redesign + ship prep)
**Verdict:** CONCERNS
**Failures:** 0

## Sub-plan checklist coverage

- **Phase 3 (deprecation stubs in `bkit-cli.ts`)** — VERIFIED. `parseArgs` recognises `init` verb (sets `deprecations.initVerb`, normalises to `install --full`), `--host=claude/cursor` (sets `deprecations.hostFlag`, adds module flag). `printDeprecationWarnings()` emits `[bkit] DEPRECATED:` warnings to `console.warn` (stderr) including `removed in v0.2` substring. `printUsage()` includes module-flag matrix, compose examples, and Deprecated section. (`/Users/christian/Documents/GitHub/bkit/.worktrees/bar-130-ci-lint-scaffolding/.agents/scripts/bkit-cli.ts:1-168`).
- **Phase 4 (module dispatcher in `bkit-modules.ts`)** — VERIFIED. `resolveModules` ensures `core` is always implicit; `--full` expands to all six modules; `--full` ≡ no flags. `MODULE_REGISTRY` maps each `ModuleFlag` to module fn; `dispatchModules()` runs in `MODULE_DISPATCH_ORDER = [core, claude, cursor, ci, lint, git-hooks]`. Each module fn writes via shared `WriteSet` (`ctx.ws`). `runCoreModule` writes `.bkit-version` LAST (line 295-304 of bkit-modules.ts). First-install signal (printSink BKIT_READ_TOKEN block) gated on `isFirstInstall`.
- **Phase 4 (`bkit-install.ts` `main()` refactor)** — VERIFIED. `main()` (lines 624-684) imports `parseArgs`, `printDeprecationWarnings`, `printUsage` from `./bkit-cli.js`, and `dispatchModules` from `./bkit-modules.js`. Old `verb + --host=` parsing model removed; `printUsage` definition not present in `bkit-install.ts` (routes through `bkit-cli.ts`). `runHost` definition not present in `bkit-install.ts`. Greenfield guard (old `if (verb !== "init" && ...)`) removed.
- **Phase 4 (`bkit-init.ts` deleted)** — VERIFIED. File does not exist (`Read` returned not-found).
- **Phase 8 (README rewrites)** — VERIFIED. `README.md` has `## Consumer CI auth` section (lines 72-112) documenting fine-grained PAT setup (`Contents: read`), GitHub Settings → Secrets path, copy-paste `BKIT_READ_TOKEN` workflow snippet. New module-flag examples in `### Then in the consumer repo` (lines 40-68); init/`--host=` listed only in deprecation context. `.agents/README.md` has `## Three-tier file ownership` section (line 181), module-flag examples (lines 145-170), updated `### What install writes` table including `.github/workflows/ci.yml`, `.vale.ini`, `.husky/pre-commit`, `.husky/pre-push`, `slop-scan.config.json`, `.cursor/hooks.json`, `.cursor/settings.json`, `.prettierignore`.
- **Phase 9 (ADR + pending appends)** — VERIFIED. `docs/decisions.md` has `DE-1: Three-tier file-ownership model for bkit installer` (line 32) and `DE-2: Composable module-flag CLI (collapse init+install+--host=)` (line 42); both inside `<!-- bkit:start ... bkit:end -->`. `docs/pending.md` has 6 v0.2 entries: init verb removal, `--host=` flag removal, helper auth action, `--no-X`/`--force` flags, bkit-ship tag-derivation, `package.json` automated merging — all referencing Linear IDs (BAR-200, BAR-131).
- **Phase 10 (`package.json` version `0.1.2`)** — VERIFIED. `"version": "0.1.2"` (line 3).

## Test coverage

- **`.agents/scripts/bkit-cli.test.ts`** — 30 `it()` calls (plan claimed 29 — close enough; actual count > claim is acceptable). Covers verb parsing (6), module flags (12), init deprecation (3), --host= deprecation (4), unknown-flag rejection (2), help output (3).
- **`.agents/scripts/bkit-modules.integration.test.ts`** — 11 `it()` calls observed across 9 describe blocks: ci.yml token substitution end-to-end (2 tests, Task 6.1b), `--claude` only (1), `--ci --lint` (1), `--full ≡ no flags` (1), `--core` implicit (1), idempotence (1), `.bkit-version` write-order (2), first-run signal (2). Matches plan claim of 11.
- **`.agents/scripts/bkit-dry-run-parity.integration.test.ts`** — 4 `runTemplates` parity tests + 5 `runParityCheck` calls (cross-module: ci, claude, lint, git-hooks, core) = ~9 effective tests. Plan claim of 5 underspecified but inclusive.
- **`it.todo` audit** — In Plan Gate 3 it claims "0 todos remain". Spot-check of test files starts shows no `it.todo` markers in bkit-cli.test.ts, bkit-modules.integration.test.ts, or bkit-dry-run-parity.integration.test.ts. `printUsage` is imported from `./bkit-cli` (used).

## Diff review

- `bkit-cli.ts` — argv parser correct: handles `install`/`check`/`help`/`init`/`--help`/`-h`; rejects unknown verbs/flags via `console.error` + `process.exit(1)`. Deprecation warnings via `console.warn` (stderr per Node convention). VERIFIED.
- `bkit-modules.ts` — `MODULE_REGISTRY` maps each flag to fn (line 546-554); `dispatchModules` iterates `MODULE_DISPATCH_ORDER` ensuring core is first (line 557-577). `runCoreModule` writes `.bkit-version` after payload copy + payload pass + core templates pass (lines 234-329). VERIFIED.
- `bkit-install.ts` `main()` — uses `parseArgs` from bkit-cli.js, `dispatchModules` from bkit-modules.js. No `printUsage` definition; no `runHost` definition; no greenfield guard for `prompts.md`. VERIFIED.
- `package.json` — version `0.1.2`. VERIFIED.
- `README.md` — `## Consumer CI auth` anchor present at line 72. VERIFIED.
- `.agents/README.md` — three-tier model documented (`## Three-tier file ownership`, line 181). VERIFIED.
- `docs/decisions.md` — DE-1 + DE-2 BAR-130 ADR entries appended at EOF inside bkit-managed block. VERIFIED.
- `docs/pending.md` — 6 entries including BAR-200, BAR-131 references. VERIFIED.

## Concerns from execute-3

- **Self-test exits 1 (DRIFT DETECTED)** — Plan v4-1 expected exit 0. Reality: bkit-the-repo's `docs/decisions.md`, `docs/pending.md`, `.agents/.bkit-version`, and `.github/workflows/ci.yml` differ from templates because bkit-the-repo is the SoT, not a template consumer. Plan author already noted this in `Verification Plan` Self-test bullet (line 426: "CONCERN: exits 1 (drift detected — 4 writes pending). See build-plan-execute-3.md Concerns."). Acceptable CONCERN — not a blocker for shipping a CLI redesign + tag bump.
- **Manual smoke gates 4.5a (`app-gether-life`) and 4.5b (second consumer)** — deferred to post-PR human run per plan design (lines 444-454). Plan explicitly checkboxes these as `[ ]` (open) — they require a human to run pnpm link + bkit install against real consumer repos and observe CI green. Not blocking for code-level PR open; blocking for merge per Gate 4.5.
- **Task 10.3 (`docs/plans/logs/bar-130-ci-lint-scaffolding/smoke-install.md`) and Task 10.4** — deferred / pending human verification (`[ ]` open).

## Findings

None blocking. The remaining `[ ]` checkboxes (Task 10.3, 10.4, Steps 7-8, Gates 4-4.5) are all explicitly designed to be deferred to human + ship workflow per plan structure — they are not failures of the build phase but contractual gates downstream of code freeze.

## Decision

CONCERNS (0 fails) — All Phase 3, 4, 8, 9, 10.1 deliverables verified in the codebase. The unchecked plan boxes for self-test exit-0, Gate 4 CI, and Gate 4.5 manual smokes are explicitly deferred-by-design per the plan; the build-phase implementation is complete and matches plan intent.

<!-- verdict:end -->
