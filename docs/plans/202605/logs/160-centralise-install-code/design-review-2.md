Verdict: CONCERNS

<!-- verdict:end -->

# Design Review

Lens: Operability — failure modes, observability, on-call ergonomics.

## Failure-Mode Enumeration

### FM-1: Silent template-category drop via `existsSync` early-exit after path migration

What fails: A call-site (e.g. `runCoreTemplates`, `runClaudeModule`, `runValeModule`, `runHuskyModule`, `runRenovateModule`) builds a source path from a stale literal or a `getTemplatesRoot()` that resolves to a non-existent dir. The existing `if (!fs.existsSync(root)) return;` guards at lines 189, 238, 319, 1154, 1532, 1685, 1780 silently short-circuit — zero files are written, zero errors surface.

How detected: Not by the module itself. Only catches: (a) byte-identical hash comparison on a packed-tarball install/upgrade vs a pre-refactor baseline; (b) dry-run parity test (`dispatchModules` writeset diff). User-facing detection is consumer drift on `bkit check` after next upgrade, often days or weeks later.

Blast radius: Whole template category dropped (e.g. all of `.claude/`, all of `.github/`, all Husky hooks) for every consumer installing the release. Scope: all consumers, not tenant-scoped.

---

### FM-2: `runPayload` duplicates `getPkgRoot` resolution inline — resolver drift

What fails: `runPayload()` in `bkit-install.ts` at lines 627-630 contains its own inline copy of the `getPkgRoot()` suffix-check logic rather than delegating to `getPkgRoot()` from `bkit-paths.ts`. After the move from `.agents/scripts` to `.bkit/src`, both the canonical `getPkgRoot()` (in `bkit-paths.ts`) and this inline copy must be updated independently. A miss in one produces divergent root resolution in install vs upgrade paths (separate engines).

How detected: Upgrade integration test would catch it if it exercises the inline arm; if the test resolves from the same context it may not exercise the `tsx` arm. Otherwise, silent wrong-root → FM-1 territory.

Blast radius: Install engine and upgrade engine behave differently — consumers see drift between their newly installed files and what upgrade believes the canonical content is.

---

### FM-3: `isDogfood()` predicate is not yet implemented — self-overwrite risk is unmitigated until build

What fails: `isDogfood()` (`getPkgRoot() === process.cwd()`) is described in the design as the new explicit guard, but does not exist yet in the codebase (`bkit-paths.ts` has only `getPkgRoot()`). Until it is implemented and the templates arm of `runPayload` is deleted, the move to `.bkit/templates/` breaks the implicit `src === dst` no-op. An in-repo `bkit install` would copy `.bkit/templates/.agents/` over the live `.agents/` files.

How detected: Only by an integration test asserting in-repo `bkit install` is a zero-write no-op for `.agents/` — which the design calls for but does not yet exist. Without that test, a developer running `bkit install` in the bkit repo during the migration mid-state could corrupt their working tree silently (the copy would succeed, producing uncommitted churn that looks like a drift fix but is a self-overwrite).

Blast radius: bkit repo developers; `.agents/rules.md`, `.agents/docs.md`, `.agents/friction.md`, `.agents/skills.md` overwritten with template versions, losing the bkit-repo-authoring section and any out-of-block customisation. `check:dist` gate would not catch this.

---

### FM-4: `workflows/` and `prompts/` bkit-\*.md tarball inclusion is unresolved

What fails: The design explicitly marks this as an Open Question — `files[]` currently ships `.agents` wholesale. If `.agents` is dropped from `files[]` without a narrow glob re-admitting `.agents/{workflows,prompts}/bkit-*.md`, the payload pass in `runPayload` finds `fs.existsSync(srcDir)` false, hits `continue`, and no bkit-\* workflow/prompt files are written to consumers. No error is emitted.

How detected: Only by physically inspecting `npm pack` output (tarball content listing) or by the packed-tarball install test producing a `canonicalHashes` with zero workflow/prompt entries. Standard CI (`check:dist`, unit tests, dry-run parity) cannot catch this because they run from the repo source tree where `.agents/` is always present — not from a consumer perspective.

Blast radius: Every consumer loses all `bkit-*` workflow and prompt files on upgrade. The `bkit-cloud.yml` and associated Claude/Cursor mirror commands stop working.

---

### FM-5: Test path constants hardcode `.agents/scripts` two-level-up assumption

What fails: `bkit-modules.integration.test.ts:866` hardcodes `const PKG_ROOT = path.resolve(SCRIPTS_DIR, "..", "..")` directly, where `SCRIPTS_DIR` is derived from `import.meta.dirname`. After the move to `.bkit/src/`, the correct suffix becomes `../../..` (three levels up: `.bkit/src` → `.bkit` → repo root), but the test's hardcode will resolve to `.bkit` as PKG_ROOT, not the repo root. Templates and package.json lookups in tests will silently use the wrong root.

`bkit-templates.test.ts:15` uses `const TEMPLATES_ROOT = path.resolve(".agents/templates")` — a cwd-relative literal. In the `tsx`-from-source context during tests, cwd is the repo root, so `.agents/templates` resolves correctly pre-refactor. After the move, this points to a non-existent directory, causing all marker-presence tests to fail with ENOENT — but only if `fs.readFileSync` is called (not `existsSync`). This is a loud failure, not silent.

How detected: Test suite failures (`pnpm test` in CI). These are loud — they are ENOENT hard failures or assertion failures in the integration suite. Not a silent regression.

Blast radius: CI fails; no consumer impact until tests are fixed and code ships.

---

### FM-6: `dist/` commit policy docs become stale — authoring confusion

What fails: `docs/deployments.md:193` says "Any TypeScript change under `.agents/scripts/*.ts` MUST be accompanied by `pnpm build`". After the move, the canonical path becomes `.bkit/src/*.ts`. Similarly `docs/setup.md:53-54` references `pnpm tsx .agents/scripts/bkit-install.ts`. `docs/architecture.md:30` and `:48` document `.agents/scripts/` and `.agents/templates/`. `.agents/rules.md:106` references `.agents/scripts/bkit-preflight.ts`. These are developer-facing authoring rules; stale paths produce the wrong `git add` command and mislead contributors.

How detected: Developer attempts `pnpm tsx .agents/scripts/bkit-install.ts` and gets ENOENT. Or they attempt `git add .agents/scripts/*.ts` and add nothing, committing a stale `dist/`. CI `check:dist` gate catches the latter.

Blast radius: Developer experience; potential stale-dist push blocked by pre-push hook (`check:dist`), so not silent — but adds friction.

---

### FM-7: Two-way `rules.md` sync rule points at wrong path post-migration

What fails: `.agents/rules.md:102` currently says "Edits inside `.agents/rules.md` bkit:start/end block must be mirrored to `.agents/templates/.agents/rules.md`". After the move the canonical template location becomes `.bkit/templates/.agents/rules.md`. The design says this will be updated, but the current state (and the transition period) means contributors will mirror to the old location which no longer exists in the tarball.

Additionally, the design confirms (per `diff` output) the two files are already diverged: `.agents/rules.md` has the `### bkit Repo Authoring` section that the template does not. An incorrect manual sync could push bkit-repo-only rules into the consumer template.

How detected: Only via `diff` or a CI byte-equality assertion (the design mentions this as an Open Question — no such gate exists yet). A developer editing the bkit:start/end block in `.agents/rules.md` and mirroring to the wrong path produces silent drift; consumers get stale `rules.md` content on next install.

Blast radius: Consumer `rules.md` content drifts silently. Not a data-loss event, but a correctness regression for every consumer's agent runtime rules.

---

### FM-8: Big-bang release — no rollback path if byte-identical is violated post-release

What fails: The design acknowledges the big-bang cadence means no release-N fallback. If a hash-mismatch ships (e.g. the tarball content check was done in source-tree context, not packed-tarball), consumers who run `bkit upgrade` after the release see `canonicalHashes` drift on files that should be identical, and the upgrade either overwrites consumer content or emits conflicts.

How detected: Consumer `bkit upgrade --non-interactive` exits non-zero; consumer files are partially in conflict state. The consumer must report the issue; no bkit-side alert exists (CLI tool, no server telemetry per `docs/observability.md`).

Blast radius: All consumers on the new release. Rollback requires publishing a patch release; the `v{N}` sliding tag re-points on the next stable publish. Consumers pinned to the exact version are unaffected by the re-point.

---

## Observability Coverage

bkit has no server-side telemetry. All observability is CLI stdout/stderr during `bkit install`/`check`/`upgrade` in consumer environments (per `docs/observability.md`).

### FM-1 (silent template-category drop)

Logs: None — the `if (!fs.existsSync(root)) return;` guards emit nothing. The module exits without logging that it skipped. No `[bkit-modules]` bracketed error is emitted.

Metric: None.

Trace: None.

**Verdict: CRITICAL gap.** The only detection is the byte-identical hash oracle run during development, before shipping. Once shipped, a consumer only detects the drop when `bkit check` next runs and reports drift — days or weeks later. There is no log signature for on-call to grep.

The design specifies a "fail-loud guard when `getTemplatesRoot()` does not exist" mirroring the `PKG_AGENTS` hard-exit at `bkit-modules.ts:359`. This is the required fix. Without it, the `existsSync` guards are an observability black hole for a critical, wide-blast failure mode.

### FM-2 (`runPayload` inline resolver drift)

Logs: If the wrong root is resolved, the payload pass will silently find no files (existsSync false on the srcDir). Same observability gap as FM-1 for the workflows/prompts arm.

**Verdict: Covered only if the integration test exercises both run-contexts.** The design calls for a `tsx`-context dogfood integration test (not `dist/`-only) and a shared constant for the suffix string. This is the right mitigation but is not yet in place.

### FM-3 (`isDogfood()` not implemented — self-overwrite)

Logs: The self-overwrite would log normally (copyAdditive emits per-file copy lines) — but it looks like a legitimate install, not an error. On-call has no signal that `.agents/` was overwritten from the template.

The design integration test ("in-repo `bkit install` is a zero-write no-op for `.agents/`") would catch this during development, but does not exist yet.

**Verdict: Gap — currently no guard and no test. Developer-time detection only via code review of the migration diff.**

### FM-4 (tarball content — workflows/prompts not shipped)

Logs: `runPayload` logs `${LOG_PREFIX} ${tag}payload: ${path.join(dstDir, f)}` per file. If zero files are found (srcDir missing), zero lines are emitted — no warning. This is a silent zero-write that looks identical to "nothing changed" on a clean consumer.

Detection requires: `npm pack --dry-run | grep workflows` or the packed-tarball integration test comparing file counts. The design specifies this explicitly ("verify packed tarball _contents_") but it is a manual step, not a CI gate that blocks merge.

**Verdict: Gap — the Open Question in the design is load-bearing. No gate currently enforces tarball content for the `.agents/{workflows,prompts}/bkit-*.md` glob. Must be resolved before merge, not deferred.**

### FM-5 (test path constant breakage)

Logs: ENOENT from `fs.readFileSync` in tests — loud, not silent. Standard test output.

**Verdict: Covered by existing test suite. Loud failure.**

### FM-6 (stale doc paths)

Logs: Developer gets ENOENT running old command. `check:dist` blocks the push if they manage to omit the `dist/` re-build.

**Verdict: Adequately covered by the `check:dist` gate for the build-critical case. Doc staleness is a contributor-experience issue, not a production observability gap.**

### FM-7 (rules.md two-way sync wrong path)

Logs: None. Silent drift. No gate catches it until the design's Open Question (CI byte-equality assertion) is implemented.

**Verdict: Gap — the Open Question must be converted to an explicit task, not deferred. Severity is low (content drift, not data loss) but it is a silent regression.**

### FM-8 (post-release byte-identical violation)

Logs: `bkit upgrade` emits `[bkit-upgrade]` conflict lines to stderr with non-zero exit. Consumer sees actionable output. But bkit has no telemetry to aggregate this — each consumer's CI log is the only signal.

**Verdict: Acceptable given CLI-only delivery model. Consumer can file an issue; patch release re-points the sliding tag. The pre-release packed-tarball oracle is the correct mitigation.**

---

## On-Call Ergonomics

"On-call" for bkit is a bkit maintainer or a developer in a consumer repo. There is no paging infrastructure (no server, no log drain). The ergonomics question is: when something goes wrong, how fast can a developer diagnose it?

### Post-release silent template drop (FM-1 / FM-4)

Consumer reports: "Some files went missing after upgrade." Maintainer must reproduce by: (1) install the released tarball in a clean dir, (2) run `bkit install`, (3) diff against the baseline hashes. No log output guides them. The `[bkit-modules]` context prefix convention (per `docs/observability.md`) is not present on the silent-skip paths.

Recovery action: Publish a patch release with the corrected path. Human judgement required. Not automatic, not idempotent.

Noise tuning: N/A (no alert infrastructure).

**Gap: `bkit doctor` does not currently print the resolved templates root. The design says "Extend `bkit doctor` to print the resolved templates root for 3am diagnosability" — this is the correct mitigation and must be implemented. Without it, a developer diagnosing a silent template drop has no tool to verify which path was resolved at runtime.**

### Self-overwrite in bkit repo (FM-3)

Symptom: `git status` shows unexpected modifications to `.agents/rules.md`, `.agents/docs.md`, etc. Not obvious as an overwrite — looks like drift. Developer may commit the overwrite thinking it is a legitimate template update.

Recovery action: `git checkout .agents/` to restore the dogfood copy. Idempotent once understood, but requires recognising the symptom first.

**Gap: The explicit `isDogfood()` predicate and zero-write integration test are the required runbook entry points. Neither exists yet.**

### Contributor uses wrong path after migration (FM-6)

Symptom: `pnpm tsx .agents/scripts/bkit-install.ts install` fails with ENOENT. Developer is confused — the file is gone.

Recovery: Updated `docs/setup.md` pointing to `.bkit/src/bkit-install.ts`. The design scopes this as an explicit task ("grep `.agents/(templates|scripts)` across `docs/`, `README.md`, `.agents/docs.md`, `.agents/workflows.md`").

**Gap: The design inventories this as explicit scope but does not call it a gate or blocking condition. Given that `docs/setup.md`, `docs/architecture.md`, `docs/deployments.md`, `docs/knowledge.md`, and `.agents/rules.md` all have stale path references, this is a bulk update that must be part of the same PR — not left for follow-up. Without it, the first developer using the new tree after merge hits ENOENT on setup commands.**

---

## Operational Dependencies

This is a developer CLI tool with no server-side infrastructure. The operational dependencies introduced are all dev-time:

1. **Packed-tarball verification step** (new manual pre-release gate): maintainer must run `pnpm pack`, extract, and verify tarball contents include `.bkit/templates/gitignore` and `.agents/{workflows,prompts}/bkit-*.md` before tagging. The design specifies this but it is not codified as a CI gate — it is a manual runbook step. Risk: forgotten under pressure.

2. **Pre-refactor hash baseline** (one-time artefact): must be captured before any file moves. No CI enforces this; it is a discipline artefact the design correctly calls out. If missed, the byte-identical oracle has no reference to compare against.

3. **`bkit doctor` templates-root output** (new diagnostic): the design adds this to `bkit doctor` for 3am diagnosability. This is a new on-call tool that did not exist before — worth acknowledging as a net positive dependency.

4. **`check:dist` path update**: after `tsconfig.json` moves `rootDir` from `.agents/scripts` to `.bkit/src`, the `check:dist` script (`rm -rf dist && tsc && git diff --exit-code dist/`) continues to work correctly because it rebuilds from `tsconfig.json` without path assumptions. No change needed here.

5. **Renovate `ignorePaths`**: `docs/deployments.md` states `ignorePaths` includes `.agents/templates/**`. After the move this becomes `.bkit/templates/**`. If not updated, Renovate starts scanning the `.bkit/templates/` tree and may produce onboarding-PR noise for consumers. This is a consumer-facing operational change. The design does not explicitly call this out as a required update.

---

## Verdict Reasoning

The design is architecturally sound and the byte-identical oracle + single resolver seam approach is the right shape. However, four operability gaps prevent a clean PASS:

1. **FM-1/FM-4 silent-skip observability**: the `existsSync` early-exit guards currently emit nothing when the source path is absent. After the move, a mis-resolved `getTemplatesRoot()` would silently produce a zero-write install that CI (unit tests, dry-run parity, typecheck) cannot distinguish from a clean run. The design specifies a "fail-loud guard" — this is correct and must be implemented. Until it is, a mass-edit error that misses one call-site is undetectable in CI.

2. **FM-4 tarball content is an unresolved Open Question**: `files[]` dropping `.agents` without a narrow glob for `.agents/{workflows,prompts}/bkit-*.md` silently removes workflow/prompt files from the tarball. The design flags this as the one place the clean "line" needs a precise `files[]` rule, but leaves it as an Open Question. It must be resolved and CI-gated before merge.

3. **FM-3 `isDogfood()` not yet implemented**: the explicit guard and its integration test are described but do not exist. During the migration, the bkit repo is in a vulnerable state where an `bkit install` run could self-overwrite `.agents/`. The test must be written before moving any files.

4. **Doc staleness is wide and unverified**: references to `.agents/scripts` and `.agents/templates` exist in six doc files. The design scopes a grep-inventory as "explicit scope" but does not treat it as a merge gate. Given the observability model is CLI stdout, stale setup docs are the de facto runbook — they must be updated atomically with the code move.

None of these are architectural flaws — they are implementation completeness gaps the design has already identified. The `CONCERNS` verdict reflects that the design is operable with these mitigations applied during build, and that the design itself calls most of them out.

---

## CRITICAL

**C-1: Fail-loud guard for `getTemplatesRoot()` is described but not yet implemented.**
Every `if (!fs.existsSync(path)) return;` guard on a templates-derived path is a silent-skip vector after the migration. The design's mitigation (a hard-exit guard analogous to `bkit-modules.ts:359`) must be implemented as part of the build — not a follow-up task. A missing-templates-root must emit `[bkit-modules] Templates root not found at <resolved path> — package corrupt?` and `process.exit(1)`. Without this, a missed literal at any of the ~17 call-sites produces a zero-write install that passes all current CI gates.

**C-2: `files[]` tarball content for `.agents/{workflows,prompts}/bkit-*.md` must be resolved before merge.**
The Open Question in the design is load-bearing. Closing it incorrectly (dropping `.agents` from `files[]` without adding the narrow glob) silently removes workflow/prompt files for all consumers. The resolution must include a `npm pack --dry-run` output assertion or an equivalent CI step that verifies the glob is present in the tarball. This cannot remain an Open Question at the time of the PR merge.

**C-3: `isDogfood()` predicate and zero-write in-repo integration test must exist before moving any files.**
The implicit `src === dst` no-op in `runPayload` breaks the moment templates move to `.bkit/templates/`. The explicit predicate and the test asserting zero-write in-repo behaviour are the safety net for the migration mid-state. If a developer runs `bkit install` before the guard is in place, `.agents/` is silently overwritten with template content. Build order: implement `isDogfood()` + test FIRST, then move files.

**C-4: `runPayload` contains an inline copy of `getPkgRoot()` resolution logic (lines 627-630 in `bkit-install.ts`) that is not delegated to `bkit-paths.ts`.**
This inline copy must be replaced with a call to `getPkgRoot()` before the migration. After the move, the suffix string changes from `.agents/scripts` to `.bkit/src`. With two independent copies of the logic, one is guaranteed to be missed in a bulk edit. The single seam principle that the design espouses for `getTemplatesRoot()` must also apply here.

---

## OPTIONAL

**O-1: `bkit doctor` should print the resolved templates root.**
The design specifies this for "3am diagnosability." It is low-effort (one `console.log` line) and the highest-value diagnostic for a silent-skip post-mortem. Adding `[bkit-doctor] Templates root: <resolved path>` to the doctor output means any developer can verify path resolution without reading source code.

**O-2: CI byte-equality assertion for the `rules.md` two-way sync.**
The design raises this as an Open Question. The current state is already drifted (the `### bkit Repo Authoring` section exists in `.agents/rules.md` but not in the template). Converting this to a CI assertion (a test that compares the `bkit:start`/`bkit:end` block of both files) would retire the fragile manual sync rule. Cheaply bundled with this refactor.

**O-3: `Renovate ignorePaths` update for `.bkit/templates/**`.**
`docs/deployments.md`currently documents`ignorePaths`as including`.agents/templates/**`. After the move, Renovate in consumer repos will start scanning `.bkit/templates/**`until the`ignorePaths`glob is updated in the shipped`renovate.json5`template. The fix is a one-line glob change in`.bkit/templates/.github/renovate.json5` (new path), but it must ship in the same release as the move.

**O-4: Suffix constant for `getPkgRoot()` should be derived from a shared constant, not repeated as a string literal.**
The design calls this out explicitly. `bkit-paths.ts` currently uses a string literal `".agents/scripts"` in the suffix check. Extracting it to a named constant (`BKIT_SRC_SUBPATH`) and deriving the `getTemplatesRoot()` relative path from it eliminates the drift risk between `getPkgRoot()` and any call-site that assumes the same structure.

**O-5: Add a header comment to `bkit-paths.ts` enumerating the three run-contexts.**
The design calls this "the single most important doc artifact of the refactor (bus-factor mitigation)." It is correct — a future maintainer reading `getPkgRoot()` needs to understand all three resolution arms without reading the entire codebase. Should be implemented during the build phase.

---

## OUT OF SCOPE

**OOS-1: Moving `dist/` to `.bkit/dist/`.**
The design explicitly defers this as orthogonal to centralisation. It would change `bin`, consumer tooling, and the `check:dist` gate. Out of scope for this release.

**OOS-2: Full-mirror — moving `workflows/` and `prompts/` under `.bkit/templates/`.**
The design rejects this approach. The decision is correct (preserves `src === dst` no-op and byte-identical guarantee). Out of scope.

**OOS-3: Consumer-side `ignorePaths` migration for existing `renovate.json5` files.**
Consumers who have already installed `renovate.json5` will have the old `ignorePaths` glob (`.agents/templates/**`). Upgrading bkit will push the new glob via the managed block merge. No action needed from consumers; the upgrade engine handles it. The migration is transparent.

**OOS-4: `.bkit-version` schema migration.**
The design correctly identifies this as a non-problem — keys are destination paths, not source paths. No migration needed. Out of scope.
