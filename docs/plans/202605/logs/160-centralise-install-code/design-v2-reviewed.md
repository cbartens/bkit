Verdict: CONCERNS

<!-- verdict:end -->

# Design: Centralise install code, templates & scripts into `.bkit/`

## Acceptance Scenario

### Narrative

A bkit maintainer opens the repo and finds all install machinery and payload under one obvious `.bkit/` root, while the repo's own `.agents/` looks exactly like an installed consumer's. A consumer who upgrades across this release sees no change at all — their `.agents/`, `.claude/`, `.cursor/`, `.github/`, `.husky/` and root dotfiles are written with byte-identical content to before.

### Success Criteria

- Install/upgrade engine lives under `.bkit/src/`; the full install payload (including `.claude`/`.cursor`/`.github`/`.husky` and root dotfiles) lives under `.bkit/templates/`; `.agents/` no longer contains any install **source** but DOES retain bkit's runtime content (rules/docs/skills + the `bkit-*` workflows/prompts + the `copyAdditive` canonical docs the engine ships), which continues to be packed in the tarball.
- A packed-tarball install AND upgrade into a clean consumer dir produce (a) `.bkit-version` `canonicalHashes`/`tier3Hashes` AND (b) a recursive `.agents/` consumer-tree listing identical to a pre-refactor baseline (the second axis covers the untracked `copyAdditive` payload the hash set omits).
- Running `bkit install` inside the bkit repo is a zero-write no-op for `.agents/` (dogfood preserved).
- `bin` stays `./dist/bkit-install.js` and `dist/` stays flat at repo root — no consumer re-config, `check:dist` still green.
- `.bkit-version` schema is unchanged and no consumer migration runs.

### Key Edge Cases

- **Dogfood self-overwrite:** in-repo install must not copy `.bkit/templates/.agents/` over the repo's live `.agents/` after the source move breaks the implicit `src === dst` no-op.
- **Dual run-context divergence:** a change passes CI (builds `dist/`) but breaks `tsx`-from-source dev/test, or vice versa, because `getPkgRoot()` has two resolution arms.
- **Silently skipped templates:** a missed/mis-resolved source path resolves to a non-existent dir; the existing `if (fs.existsSync)` guards turn this into a silent no-write → consumer drift rather than a loud failure.
- **Dotfile strip remap under new root:** if `.bkit/templates/gitignore` is not actually shipped in the tarball, the upgrade template walk silently skips it and consumers drift.
- **In-flight upgrade consumer:** upgrade reads paths from the consumer's existing `.bkit-version` (destination-keyed, unaffected) — confirm no source-shaped path exists anywhere in the version file or migration code.

## Architecture

This is a **structural refactor, not a behaviour change**. The installed output in a consumer repo must be byte-identical before and after. The whole change reduces to: relocate the install _source_ tree, funnel every source lookup through one resolver seam, and make the dogfood no-op explicit so it survives the move.

### The one line that matters: `.bkit/` (install source) vs `.agents/` (bkit's own runtime)

`.agents/` is three things today: (1) host of the install engine (`.agents/scripts/`), (2) the install _source_ (`.agents/templates/**`), and (3) bkit's _own_ dogfooded runtime content (workflows, prompts, rules, docs, skills). The issue's scope is "install-related code, templates, scripts" — which is exactly (1) and (2). (3) is not install machinery; it is content bkit runs against itself and that a consumer also has after install.

**The line:** move (1) + (2) to `.bkit/`; leave (3) in `.agents/`.

This is verified-correct against the tree, not assumed. The `.agents/templates/.agents/` subtree contains only consumer copies of `rules.md` / `docs.md` / `friction.md` / `skills.md` / `.env.example` — it does **NOT** contain `workflows/` or `prompts/`. bkit's own `.agents/workflows/bkit-*.md` and `.agents/prompts/bkit-*.md` at the repo top level are simultaneously runtime content and install source: `runPayload()` (`bkit-install.ts:639-658`) copies them from `PKG_ROOT/.agents/{workflows,prompts}` into a consumer's `.agents/`, and the claude/cursor mirror then reads them back from **cwd-relative** `.agents/{workflows,prompts}` (`bkit-modules.ts:531-533,707,728`), never from `PKG_ROOT`. Keeping these in `.agents/` means the bkit repo's own `.agents/` looks exactly like an installed consumer's `.agents/` — the dogfooding invariant and the simplest mental model: "edit `.agents/` like any consumer; edit `.bkit/` only when changing what bkit ships."

### Target layout

```
.bkit/
├── src/                    # engine — was .agents/scripts/bkit-*.ts (tsc rootDir)
│                           #   includes bkit-lint-no-tier-terms.ts + all *.test.ts
└── templates/              # install payload — was .agents/templates/**, dest layout unchanged
    ├── .agents/            # → consumer .agents/  (rules.md, docs.md, friction.md, skills.md, .env.example)
    ├── .claude/  .cursor/  .github/  .husky/  .vale/
    ├── docs/  scripts/
    └── gitignore .gitattributes .mcp.json .envrc .vale.ini AGENTS.md CLAUDE.md .prettierignore …

dist/                       # UNCHANGED — flat at repo root; bin = ./dist/bkit-install.js
.agents/                    # bkit's OWN runtime — STAYS
├── workflows/  prompts/     #   install source AND dogfood runtime (read cwd-relative by mirror)
├── rules.md docs.md friction.md skills.md workflows.md prompts.md cloud.md trackers.md
└── skills/                  #   curated manually (MEMORY: not auto-registered)
```

### The resolver seam

Today ~17 call-sites build `path.join(PKG_ROOT, ".agents", "templates", …)` inline (8 in `bkit-modules.ts`, 2 in `bkit-install.ts`, the upgrade walk at `bkit-install.ts:736`, uninstall at `bkit-uninstall.ts:425`, plus integration-test constants). The move introduces a single seam in `bkit-paths.ts`:

- `getPkgRoot()` — extend the suffix special-case from `.agents/scripts` to `.bkit/src` so the source-tree run-context (`tsx` dev/test) still resolves the package root. Derive the suffix from a shared named constant (e.g. `BKIT_SRC_SUBPATH`) so it cannot drift from `rootDir`. The `dist/` arm (`scriptDir/..`) is **untouched** — that is the arm consumers actually run.
- `getTemplatesRoot()` (new) — the _only_ place `.bkit/templates` is encoded: `path.join(getPkgRoot(), ".bkit", "templates")`. Every inline `path.join(PKG_ROOT, ".agents", "templates", …)` becomes `path.join(getTemplatesRoot(), …)`.
- `isDogfood()` (new) — `getPkgRoot() === process.cwd()`. Replaces the implicit `src === dst` path-equality coincidence (see Components / Flows).

**Consolidate the duplicated PKG_ROOT derivation BEFORE the move (CRITICAL — review-1/review-2).** `getPkgRoot()` is NOT the only place the suffix walk lives: `runPayload()` (`bkit-install.ts:627-630`) inlines its **own** `scriptDir.endsWith('${sep}.agents${sep}scripts')` PKG_ROOT derivation, independent of `getPkgRoot()` (verified against live code). With two independent copies of the suffix logic, a bulk find-replace from `.agents/scripts` → `.bkit/src` is guaranteed to miss one — leaving `runPayload`'s PKG_ROOT resolving against the stale suffix under `tsx`-from-`.bkit/src` (one level too shallow), which silently breaks the surviving workflows/prompts payload arm. **Required sequencing: first refactor `runPayload` to call `getPkgRoot()` (collapsing the inline copy into the single seam) BEFORE any path string changes.** The templates arm of `runPayload` is dead after the move and is deleted (see Components / Flows); but the workflows/prompts arm still needs a correct PKG_ROOT, so the derivation cannot simply vanish — it must route through `getPkgRoot()`. This makes "single resolver seam" literally true rather than aspirational.

`getPkgRoot()` has **three run-contexts** that all must keep working — this is the single highest-leverage failure surface (a change can pass CI, which builds `dist/`, yet break `tsx`-from-source dev/test, or vice versa):

1. consumer running `dist/bkit-install.js` → `scriptDir.../dist` → `scriptDir/..`
2. bkit repo running engine via `tsx` from `.bkit/src/` → `scriptDir.../.bkit/src` → `scriptDir/../..`
3. packed tarball installed into a clean dir → same as (1)

### Build / packaging boundary

- `tsconfig.json`: `rootDir` and `include` move from `.agents/scripts` → `.bkit/src`; `exclude` `.agents/skills` reference is dropped (skills stay in `.agents/` but are not TS sources — the `**/*.test.ts` exclude is retained). `outDir: dist` is **unchanged** → `dist/` stays flat at repo root, `bin: ./dist/bkit-install.js` is **unchanged** (no consumer re-config, `check:dist` gate keeps working).
- `package.json` `files[]`: add `".bkit"`; **keep `".agents"`** but exclude the relocated engine source. **Factual correction (review-1/review-2 CRITICAL):** bkit's `.agents/` runtime IS and MUST remain shipped in the tarball. Verified via `npm pack --dry-run`: today the tarball carries ~187 `.agents/` files, and the engine hard-reads/hard-ships several at consumer-install time:
  - `loadTrackers(pkgRoot)` reads `PKG_ROOT/.agents/trackers.md` and **hard-throws if absent** (`bkit-trackers.ts:204,206`).
  - `bkit-install.ts:904` reads `PKG_ROOT/.agents/prompts.md` for the cursor model lookup.
  - `runCoreModule` step 1 (`bkit-modules.ts:380`) does `fs.readdirSync(PKG_ROOT/.agents)` + `copyAdditive` of every entry except `COPY_EXCLUDE` (`{skills, scripts, README.md, .bkit-version, rules.md, friction.md, docs.md, skills.md, .env.example}`), so it copies `IDEs.md`, `cloud.md`, `prompts.md`, `workflows.md`, `trackers.md`, `workflows/`, `prompts/` into the consumer's `.agents/`. Of these, `IDEs.md`/`cloud.md`/`prompts.md`/`workflows.md` are `CANONICAL_OVERWRITE_RELPATHS` (`bkit-modules.ts:304-309`) — tracked canonical consumer output overwritten on every install.
  - `.agents/skills/**` ships today and must continue to.
- **Precise `files[]` rule** (resolves the open question — the answer is NOT "drop `.agents` wholesale"): retain `".agents"` in `files[]`; the relocated engine source leaves `.agents/` physically via `git mv .agents/scripts → .bkit/src`, so the `!.agents/scripts/*` exclusion lines are replaced by `!.bkit/src/*.test.ts`, `!.bkit/src/*.integration.test.ts`, `!.bkit/src/__snapshots__`. After the move, the only thing under `.agents/` that is install **source** (`templates/`) has also moved out (to `.bkit/templates/`), so it is no longer in `.agents/` to ship. Net `files[]`: `dist`, `.bkit`, `.agents`, `README.md`, `CHANGELOG.md`, with test/snapshot exclusions re-targeted under `.bkit/src`. The tarball thus continues to ship every `.agents/*` path the engine reads/copies (`trackers.md`, `IDEs.md`, `cloud.md`, `prompts.md`, `workflows.md`, `skills/**`, `workflows/bkit-*.md`, `prompts/bkit-*.md`) and no longer ships the relocated source. Verify by `npm pack --dry-run` diff against the pre-refactor file list (see verification gate) — the only deletions must be the relocated `.agents/scripts/**` and `.agents/templates/**` paths, now appearing under `.bkit/`.
- `package.json` scripts: `lint:no-tier-terms` path `.agents/scripts/bkit-lint-no-tier-terms.ts` → `.bkit/src/bkit-lint-no-tier-terms.ts`; the `lint:prose` `find .agents/scripts` reference is reviewed.
- **`vitest.config.ts` (`test.include`, line 5) hardcodes `.agents/scripts/**/_.test.ts`+`.agents/scripts/\*\*/_.integration.test.ts`** — re-target both globs to `.bkit/src/**`. **This is a required tooling change, not optional:** if missed, post-move vitest discovers **zero tests\*\* and CI passes green-but-empty (the byte-identical oracle would never run). Verified hardcoded against the live `vitest.config.ts`.
- `NPM_STRIP_REMAP` (`gitignore`→`.gitignore`, `npmignore`→`.npmignore`, `bkit-install.ts:577`) is **unchanged** and still applies under `.bkit/templates/`. npm strips `.gitignore`/`.npmignore` by basename anywhere in the tree, so the templates must continue to store them dot-less; `files[]` + tarball-content verification must confirm `.bkit/templates/gitignore` actually ships.

## Data Model

No schema changes. The consumer's `.agents/.bkit-version` is the data contract that anchors the byte-identical guarantee.

- `pinnedVersion: string`, `tier3Hashes: Record<path, sha256>`, `canonicalHashes: Record<path, sha256>` (`bkit-version.ts:37-60`).
- **Keys are consumer-relative DESTINATION paths** (e.g. `.github/workflows/ci.yml`, `.claude/agents/bkit-foo.md`) — they do NOT encode the package-internal source tree. Because this refactor changes only the source location and leaves every destination path identical, **no `.bkit-version` migration is needed**. Treating it as a migration would be solving a non-problem and risks corrupting valid pins.
- This is also the verification oracle — but with a **blind spot the gate must cover (CRITICAL — review-1/review-2):** `canonicalHashes`/`tier3Hashes` track only Tier-managed files (the 5 `.agents/*` canonical/Tier-3 keys + the cross-agent destinations). The bulk `copyAdditive` payload (`workflows/`, `prompts/`, `IDEs.md`, `cloud.md`, `trackers.md`) is **explicitly NOT added to the writeset** (`bkit-modules.ts:390` comment: copyAdditive writes are internal payload management, not consumer outputs). A dropped-file regression in this untracked payload would ship green if the gate trusted hashes alone.
- **Verification gate (corrected):** the byte-identical oracle is two-axis, run on a **packed tarball** built from the packed form (`pnpm pack` → install into a clean dir), not the source tree:
  1. `.bkit-version` hash-set diff (`canonicalHashes`/`tier3Hashes`) identical to the pre-refactor baseline.
  2. a **recursive `.agents/` tree diff** (full consumer-tree diff) of the clean-dir install against the pre-refactor baseline, covering the untracked `copyAdditive` payload the hash set omits.
     Both axes must run for **install AND upgrade** (separate engines). **Capture the baseline (both the `.bkit-version` hashes AND the recursive consumer-tree listing) BEFORE moving anything**, from a pre-refactor packed-tarball install into a clean dir. Also assert the `npm pack --dry-run` file-list diff: the only removals from the tarball must be `.agents/scripts/**` and `.agents/templates/**` (now appearing under `.bkit/`).

## Components / Flows

### Dogfood no-op preservation (the crux)

Today the no-op is **implicit and accidental**: `runPayload()` skips a subtree when `path.resolve(srcDir) === path.resolve(dstDir)`. In the bkit repo, `PKG_ROOT` resolves to the repo root, so `PKG_ROOT/.agents/templates` literally equals `<cwd>/.agents/templates` and the mirror copies nothing.

After templates move to `.bkit/templates/`, the source becomes `<repo>/.bkit/templates/**` while the equivalent destination is `<repo>/.agents/**` — they are no longer equal, so the path-equality guard stops firing. Left unfixed, an in-repo `bkit install` would start copying `.bkit/templates/.agents/` over the repo's live `.agents/`, a self-overwrite that can silently break the byte-identical guarantee.

**Resolution — split the no-op into two distinct mechanisms, because the two payload arms behave differently after the move:**

1. **Workflows / prompts arm** (`runPayload()` lines 639-658): src is `PKG_ROOT/.agents/{workflows,prompts}`, dst is `<cwd>/.agents/{workflows,prompts}`. Because bkit's own workflows/prompts **stay in `.agents/`**, these paths are still identical in the bkit repo — the existing `src === dst` skip continues to hold **unchanged**. No new guard needed for this arm. This is the direct payoff of drawing the line where Lens 3 draws it.

2. **Templates arm** (`runPayload()` lines 660-666): src moves to `getTemplatesRoot()` = `<repo>/.bkit/templates`; there is **no longer any consumer-side `.agents/templates`** to mirror into (templates live in `.bkit/` and are never copied into a consumer's `.agents/`). This arm becomes **dead code and is deleted entirely** — a net simplification, not a relocation. (The template _content_ still reaches consumers via the module install pass / `runCoreTemplates` reading from `getTemplatesRoot()`, which is unaffected.)

3. **Defence-in-depth:** add an explicit `isDogfood()` (`getPkgRoot() === process.cwd()`) predicate and a guard that short-circuits any future payload copy in the bkit repo, plus an integration test asserting in-repo `bkit install` is a zero-write no-op for `.agents/`. This makes the invariant correct-by-construction rather than dependent on the path-equality coincidence.

### Build sequence (ordering is load-bearing — review-2 CRITICAL C-3/C-4/C-1)

The migration mid-state is vulnerable: once templates move to `.bkit/templates/` but before the guards land, an in-repo `bkit install` self-overwrites the live `.agents/`. Therefore the build MUST proceed in this order — these are not follow-ups:

1. **First, before moving any files:** consolidate `runPayload`'s inline PKG_ROOT derivation into `getPkgRoot()` (CRITICAL #2); implement `isDogfood()` (`getPkgRoot() === process.cwd()`) and the fail-loud `getTemplatesRoot()` guard (next item); add the zero-write in-repo dogfood **integration test** (asserts `bkit install` writes nothing to `.agents/` when `isDogfood()`), running in the `tsx`-from-source context (not `dist/`-only). The guards and test land while the tree is still at `.agents/` so they can be validated green pre-move.
2. **Capture the pre-refactor baseline** (both `.bkit-version` hash set AND recursive consumer-tree listing, from a packed-tarball install into a clean dir) — see Data Model verification gate.
3. **Then `git mv`** `.agents/scripts → .bkit/src` and `.agents/templates → .bkit/templates`; re-point the resolver seam string, `tsconfig`, `vitest.config.ts`, `package.json` scripts/`files[]`; delete the (now dead) templates arm of `runPayload`.
4. **Verify** install AND upgrade on the packed tarball against the baseline (two-axis diff).

### Fail-loud guard (CRITICAL — review-1/review-2)

The ~17 `if (!fs.existsSync(...)) return;` early-exits on templates-derived paths (e.g. `bkit-modules.ts:189,238,319,1154,1532,1685,1780`) turn a missed/mis-resolved source path into a **silent no-write → consumer drift**, undetectable by current CI. Add a **fail-loud guard** mirroring the existing `bkit-modules.ts:359` "package corrupt?" hard-exit: when `getTemplatesRoot()` resolves to a non-existent dir, emit `[bkit-modules] Templates root not found at <resolved path> — package corrupt?` and `process.exit(1)`, instead of silently skipping. This must land in step 1 (before the move) so a missed literal at any call-site fails noisily in CI rather than shipping a zero-write install.

### Install flow (unchanged behaviour, re-pointed source)

`runInstall` → preflight → per-module passes (`runCoreModule`, claude/cursor mirror, github/husky/renovate/dependabot) → `runPayload` → write `.bkit-version`. Every module's `path.join(PKG_ROOT, ".agents", "templates", …)` lookup is re-pointed to `getTemplatesRoot()`. The claude/cursor mirror's cwd-relative `.agents/{workflows,prompts}` reads are **untouched** (they read from the consumer's installed `.agents/`, which the payload pass has already populated).

### Upgrade flow (separate engine — must be verified independently)

`runUpgrade` walks template candidates from `tplRoot = path.join(getPkgRoot(), ".bkit", "templates")` (was `.agents/templates`, `bkit-install.ts:736`), then diffs against the consumer's `canonicalHashes`. Backward-compat for in-flight consumers is intact: the upgrade reads paths recorded in their existing `.bkit-version`, which are destination paths, unaffected by the source move. The package-internal `tplRoot` change is transparent to the consumer.

### Hard-exit guards & observability

The fail-loud `getTemplatesRoot()`-not-found guard is specified above (Fail-loud guard, landed in build step 1). For observability: extend `bkit doctor` (read-only) to print the resolved templates root — e.g. `[bkit-doctor] Templates root: <resolved path>` — for 3am diagnosability. This is the only runtime tool a developer has to verify which path was resolved at install time when diagnosing a silent template drop; it is a net-new diagnostic dependency and a required task in this change (low effort, highest diagnostic value).

### Authoring rule + docs updates (merge-gated — review-1/review-2 CRITICAL)

These are **required tasks in the same PR as the move, not follow-ups.** Because bkit's observability model is CLI stdout, the setup/authoring docs are the de-facto runbook — stale `.agents/scripts`/`.agents/templates` paths mean the first developer using the new tree after merge hits ENOENT on setup commands, and a contributor mirroring the `rules.md` block to a path that no longer exists in the tarball silently drifts every consumer's `rules.md`. Update atomically with the code move:

- `.agents/rules.md` (the two-way `rules.md` sync rule at line 102): `.agents/rules.md ↔ .agents/templates/.agents/rules.md` re-points to `.agents/rules.md ↔ .bkit/templates/.agents/rules.md`. The concept is unchanged; the path lengthens. The block gains the central principle: "install source of truth lives in `.bkit/`; bkit's own agent runtime lives in `.agents/` exactly as a consumer's does." Also update the `.agents/scripts/bkit-preflight.ts` reference at `.agents/rules.md:106` → `.bkit/src/bkit-preflight.ts`.
- `docs/setup.md` (lines 53-54): the dogfood commands `pnpm tsx .agents/scripts/bkit-install.ts install` / `... check` → `pnpm tsx .bkit/src/bkit-install.ts ...`.
- `docs/architecture.md` (lines 30, 48): the tree diagram entries `.agents/scripts/` (CLI source) and `.agents/templates/` (consumer-templated files) → `.bkit/src/` and `.bkit/templates/`.
- `docs/deployments.md`: the build-freshness rule at line 193 (`Any TypeScript change under .agents/scripts/*.ts MUST be accompanied by pnpm build`) → `.bkit/src/*.ts`; the ci.yml template path (line 197) and template-workflow / husky template references (lines 202, 214, 260) `.agents/templates/...` → `.bkit/templates/...`; and the **Renovate `ignorePaths`** note (line 211: includes `.agents/templates/**`) → `.bkit/templates/**`. The shipped `renovate.json5` template's `ignorePaths` glob must change in lockstep, else consumer Renovate starts scanning `.bkit/templates/**` and produces onboarding-PR noise — a consumer-facing operational change that must ship in the same release.
- `docs/knowledge.md`: update only **forward-looking rules text** that contributors act on (e.g. KN-7's "Any TS edit under `.agents/scripts/*.ts` MUST be accompanied by `pnpm build`", line 162). Do NOT rewrite historical KN-\* incident narrative or commit-hashed `Related:` references — per the docs role-separation convention, knowledge.md records incidents as they happened; rewriting historic source paths there falsifies the record.
- Remaining prose doc-drift no gate catches: grep `\.agents/(templates|scripts)` across `docs/`, `README.md`, `.agents/docs.md`, `.agents/workflows.md`, `.bkitignore` (its header comment cites `.agents/templates/`), and `.github/workflows/ci.yml:82` (+ its template source) and update references. Inventory this as explicit, in-PR scope.
- `.agents/skills.md` stays curated manually (MEMORY: ship-prune of unlisted skills is by design — do not auto-register).

## Decisions

<!-- prettier-ignore -->
| Decided | Alternatives | Why |
| --- | --- | --- |
| Move install **source** (engine `.agents/scripts/` + `.agents/templates/**`) to `.bkit/`; bkit's **own** runtime `.agents/` (workflows, prompts, rules, docs, skills) STAYS | Move everything incl. workflows/prompts under `.bkit/templates/` (full mirror) | The issue's scope is "install-related." Workflows/prompts/rules are dogfooded runtime an installed consumer also has, NOT machinery. Keeping them in `.agents/` preserves the workflow/prompt payload `src === dst` no-op unchanged and keeps "bkit's `.agents/` == a consumer's `.agents/`" — the clearest mental model. Verified: `.agents/templates/.agents/` holds only rules/docs/friction/skills/env copies, never workflows/prompts. |
| **Big-bang** single-release physical move, with the byte-identical hash oracle + dry-run-parity gate as the safety net | Two-release staged (alias-first, then drop fallback); symlink bridge; build-time payload staging | The `.bkit-version` hash baseline gives a deterministic pass/fail oracle, making staged's dual-ship fallback redundant; staged adds a standing dual-tree-divergence risk and a permanent fallback resolver fork that contradicts the single-source-of-truth goal. Symlink/staging keep the mislocation alive. Migration *risk* is mitigated by verification rigor (below), not by a release window. |
| Single resolver seam: `getTemplatesRoot()` + extend `getPkgRoot()` suffix to `.bkit/src` + new `isDogfood()` in `bkit-paths.ts` | Inline find/replace `.agents/templates`→`.bkit/templates` at ~17 call-sites | One seam = one place to change next time and one place to assert in tests; eliminates the "missed literal → silent template skip" failure mode scattered literals invite. |
| Make dogfood no-op explicit (`isDogfood()` / `getPkgRoot() === cwd`); **delete** the templates arm of `runPayload` (dead after the move) | Rely on `src === dst` path-equality after the move (breaks → self-overwrite); re-point the templates arm at `.bkit/templates` | Templates no longer live inside any consumer's `.agents/`, so there is nothing to mirror there — the arm is dead code. The workflow/prompt arm keeps its `src === dst` skip unchanged. The explicit predicate is correct-by-construction and testable. |
| Keep `dist/` flat at repo root; `bin` and `outDir` unchanged | Move build output to `.bkit/dist/` and re-point `bin` | Build-output location is orthogonal to source location. Changing `bin`/`outDir` is unrelated churn that risks consumer tooling, lockfile bin resolution, and the `check:dist` gate, for zero centralisation benefit. Touch the `dist/` arm of `getPkgRoot` last (or never). |
| No `.bkit-version` schema migration | Rewrite `canonicalHashes`/`tier3Hashes` keys on upgrade | Keys are consumer-relative destination paths; the source move changes no destination. A migration would risk corrupting valid pins to solve a non-problem. |
| `files[]` ships `.bkit` + `dist` + **keeps `.agents`** (runtime), re-targeting only the test/snapshot exclusions to `.bkit/src` | Drop `.agents` wholesale + ship only a narrow `workflows/prompts/bkit-*.md` glob | **Corrected (review-1/review-2 CRITICAL):** dropping `.agents` would break `loadTrackers` (hard-throw on missing `PKG_ROOT/.agents/trackers.md`, `bkit-trackers.ts:204`) and stop shipping the canonical `.agents/*.md` docs (`IDEs.md`/`cloud.md`/`prompts.md`/`workflows.md`), `skills/**`, and the `copyAdditive` payload the engine reads/copies at install time. The relocated **source** (`.agents/scripts`, `.agents/templates`) leaves `.agents/` via `git mv`, so `.agents/` ships only runtime after the move. `NPM_STRIP_REMAP` is unchanged and still applies under `.bkit/templates/`. |
| Snapshot regeneration accepted as part of the move | Preserve old describe labels to avoid snapshot key churn | The snapshot key change is cosmetic (a describe label embedding the old `.agents/templates/...` path). Regenerating is one reviewable command; preserving the old label would be misleading. |

## Approaches Considered

The three brainstorm lenses converge on the same shape — source relocation behind a central resolver seam — and disagree only on (a) where the `.bkit/`↔`.agents/` line falls and (b) the migration cadence. The design merges Lens 1's seam, Lens 3's line, and Lens 2's verification rigor, then resolves the cadence conflict in favour of big-bang.

<!-- prettier-ignore -->
| Approach | Verdict | Why |
| --- | --- | --- |
| **Source-relocation + single resolver seam, line at install-source vs runtime** (Lens 1 A + Lens 3 A) | **KEPT** | Achieves the issue's structural goal with the smallest standing-complexity cost; one honest source of truth; preserves the dogfood model. This is the design. |
| **Layer Lens 2's verification rigor** (capture pre-refactor hash baseline; dry-run-parity CI gate on a clean consumer clone; verify install AND upgrade live on a packed tarball) | **MERGED** | Additive risk-mitigation, not a separate approach. Folded onto the kept approach as the byte-identical oracle; it is what lets us choose big-bang safely. |
| **Two-release staged migration** (alias-first then drop fallback) (Lens 2 A) | **REJECTED** | Its safety net (a release-N tarball shipping both trees) is made redundant by the hash-baseline oracle. It adds a dual-tree-divergence risk during the overlap and a permanent fallback resolver fork that re-introduces the dual-source ambiguity #160 exists to kill. Its *verification* discipline is kept (merged above); its *cadence* is not. |
| **Full mirror — move workflows/prompts/rules under `.bkit/templates/` too** (Lens 3 B) | **REJECTED** | Breaks the workflow/prompt `src === dst` no-op, turns bkit's own `.agents/workflows` into generated files (muscle-memory hand-edits silently revert), and risks non-byte-identical self-install — directly threatening the hard requirement. Conceptual purity not worth the divergence risk. |
| **Engine-only lift to `.bkit/src/`, leave `templates/` in `.agents/`** (Lens 3 C) | **REJECTED** | The incomplete-refactor trap: leaves the headline problem (cross-agent/IDE files under `.agents/templates/.claude` etc.) untouched and adds a third location, arguably worse clarity than today. Only acceptable as an explicitly-sequenced Phase 1 of the kept approach — not a terminal state. |
| **Big-bang move incl. `dist/`→`.bkit/dist/` + inline literals, no seam** (Lens 1 C) | **REJECTED** | Inlined literals repeat the exercise next relocation and invite missed-literal silent skips; relocating `dist/` gratuitously changes `bin` and risks consumer tooling for zero centralisation benefit. |
| **Build-time payload staging — source stays in `.agents/`, tarball generates `.bkit/`** (Lens 1 B) | **REJECTED** | Repo layout doesn't change, so the stated goal is only half-met; adds a generated-artifact pipeline + a permanent dual-location fallback resolver that can silently diverge. |
| **Symlink bridge — `.bkit/` symlinks into `.agents/`** (Lens 2 B) | **REJECTED** | Cosmetic rename that doesn't solve separation of concerns; npm/pnpm symlink packing is platform-fragile (Windows junctions), `git mv` can silently break links, and it adds a fourth alias on top of the triple-duty problem. |

## Trade-offs Accepted

**What we gain (vs status quo):** one honest source of truth (`.bkit/` = what bkit ships, `.agents/` = what bkit runs); the conceptually-misplaced cross-agent/IDE files (`.claude`/`.cursor`/`.github`/`.husky`/dotfiles) leave `.agents/templates/` for `.bkit/templates/`; a single resolver seam (`getTemplatesRoot()`) replaces ~17 scattered literals, so future relocations and new IDE targets touch one function; the implicit, accidental dogfood no-op becomes explicit and testable; the `runPayload` templates arm is deleted (net simplification).

**What we sacrifice (vs two-release staged):** no release-window fallback safety net — correctness rests entirely on the pre-refactor hash baseline + dry-run-parity gate landing before merge. A mass-edit error that also corrupts the test that would catch it could ship; mitigated by verifying install AND upgrade live on a packed tarball in a clean dir (separate engines) and per-constant granular verification rather than trusting the bulk edit.

**What we sacrifice (vs full-mirror purity):** `.agents/` is not reduced to a pure destination — bkit's own workflows/prompts/rules remain authored in place, so the "single root for literally everything" aspiration is deliberately not met. This is the right trade: it preserves the byte-identical guarantee and the dogfood-equals-consumer invariant.

**Standing cost accepted:** the `.agents/rules.md ↔ .bkit/templates/.agents/rules.md` two-way sync rule survives the move with a longer path; it remains a fragile manual sync (see Open Questions for a CI-assertion option to retire it).

## Risks & Open Questions

### Risks (with mitigations layered onto the chosen approach)

- **Byte-identical is verified by a TWO-AXIS oracle, not by hashes alone.** `canonicalHashes`/`tier3Hashes` do NOT cover the untracked `copyAdditive` payload (`workflows/`, `prompts/`, `IDEs.md`, `cloud.md`, `trackers.md` — `bkit-modules.ts:390`). Pass/fail oracle: packed-tarball install AND upgrade (separate engines) into a clean dir produce (1) identical `canonicalHashes`/`tier3Hashes` AND (2) an identical **recursive `.agents/` consumer-tree listing** vs a baseline. **Capture both baselines BEFORE moving anything**, from a packed-tarball install (not the source tree). Add a dry-run-parity CI gate: `bkit install --dry-run` diff must be empty on a clean consumer clone before/after.
- **Dual run-context resolution (`dist/` vs `tsx` source vs packed tarball) is the highest-leverage failure.** A move can pass CI (which builds `dist/`) yet break dev (`tsx` from `.bkit/src/`). Add a `tsx`-context dogfood integration test (not `dist/`-only). Derive the `getPkgRoot` suffix from a shared constant so it cannot drift from `rootDir`. Add a header comment block in `bkit-paths.ts` enumerating the three run-contexts and which arm each hits — the single most important doc artifact of the refactor (bus-factor mitigation).
- **`files[]` + `.npmignore` + `gitignore`→`.gitignore` strip remap must move together, AND `.agents/` runtime must stay shipped.** Verify packed tarball _contents_ (`npm pack --dry-run` → list), not just that it builds — confirm (a) `.bkit/templates/gitignore` actually ships, else upgrade silently skips it and consumers drift; (b) the `.agents/` runtime reads/copies still ship (`trackers.md`, `IDEs.md`, `cloud.md`, `prompts.md`, `workflows.md`, `skills/**`, `workflows/bkit-*.md`, `prompts/bkit-*.md`); (c) the only tarball removals vs baseline are `.agents/scripts/**` and `.agents/templates/**` (now under `.bkit/`). Dropping `.agents` wholesale would hard-throw in `loadTrackers`.
- **Missed/mis-resolved source path → silent template skip.** Grep all `\.agents.*templates` literals to zero; add a fail-loud "templates root not found" guard mirroring the existing `bkit-modules.ts:359` "package corrupt?" hard-exit.
- **Snapshot key regeneration** in `__snapshots__/bkit-templates.content.test.ts.snap` (the describe label embeds `.agents/templates/.github/workflows/ci.yml`). Cosmetic; regenerate via `--update-snapshots` and review the diff.
- **`vitest.config.ts:5` `include` globs hardcode `.agents/scripts/**`.** Re-target to `.bkit/src/\*\*` (required tooling change). If missed, vitest discovers zero tests post-move → CI green-but-empty and the byte-identical oracle never runs.
- **Test path-constant churn** across `bkit-templates.content.test.ts`, `bkit-modules.test.ts`, `bkit-modules.integration.test.ts`, `bkit-modules.upgrade.integration.test.ts`, `bkit-tiers.test.ts`, `bkit-release-workflow.test.ts`, `bkit-install.test.ts`, `bkit-templates.test.ts` — 12+ constants. Mechanical but per-constant verification required (this is the bulk of the work). Notes: the `path.resolve(SCRIPTS_DIR, "..", "..")` PKG_ROOT derivation (`bkit-modules.integration.test.ts:866`) stays **structurally correct** — `.bkit/src` is still two levels under the repo root, like `.agents/scripts` was; only embedded `.agents/templates/...` literals need re-pointing (`bkit-modules.integration.test.ts:678,869,1151,1263`). `bkit-templates.test.ts:15`'s cwd-relative `path.resolve(".agents/templates")` → `.bkit/templates` (loud ENOENT if missed). The dry-run-parity harness seed `fs.mkdirSync(tmpDir/.agents/templates)` (`bkit-dry-run-parity.integration.test.ts:29`) must re-point too. `CORE_TEMPLATE_DIRS` (`bkit-modules.ts:154` = `{docs, .agents, scripts}`) are dest-relative dir names within the template tree, NOT source paths — they are untouched by the move (note this to pre-empt a false-positive grep hit during the bulk edit).
- **Prose doc-drift** — see "Authoring rule + docs updates" (now a merge-gated task list, not a follow-up): `docs/setup.md`, `docs/architecture.md`, `docs/deployments.md` (incl. Renovate `ignorePaths` + the shipped `renovate.json5` glob), `docs/knowledge.md` (forward-looking rules only; not historic KN-\* narrative), `.agents/rules.md`, `README.md`, `.agents/docs.md`, `.agents/workflows.md`, `.bkitignore`, `.github/workflows/ci.yml:82` referencing `.agents/templates`/`.agents/scripts`. No gate catches these; they must land atomically with the move.

### Open Questions

- **RESOLVED — `files[]` keeps `.agents`.** This open question is now answered (see Build / packaging boundary and the Decisions `files[]` row): `.agents/` must stay in `files[]`, not be dropped. The engine ships AND consumes `.agents/trackers.md` (hard-read by `loadTrackers`), `.agents/prompts.md` (cursor model lookup), the `copyAdditive` canonical docs (`IDEs.md`/`cloud.md`/`prompts.md`/`workflows.md`), `skills/**`, and the `workflows/bkit-*.md` + `prompts/bkit-*.md` payload — all from `PKG_ROOT/.agents/`. Only the relocated **source** (`.agents/scripts`, `.agents/templates`) leaves `.agents/` (via `git mv`), so after the move `.agents/` ships only runtime and `files[]` is `dist`, `.bkit`, `.agents`, `README.md`, `CHANGELOG.md` with test/snapshot exclusions re-targeted under `.bkit/src`. Tarball-content verification (above) is the gate that proves this concrete.
- **Behaviour-visible change to acknowledge:** fresh consumers stop receiving `.agents/templates/` post-move. Today `runCoreModule`'s `copyAdditive` recurses `PKG_ROOT/.agents/templates` into the consumer's `.agents/templates/`; after the move there is no `PKG/.agents/templates` to recurse, so it is no longer copied. This is **untracked output** (the integration test at `bkit-modules.integration.test.ts:220-223` explicitly filters `.agents/templates/**` out of consumer-output comparison), so it does not violate the byte-identical guarantee on tracked files — but it IS a visible change and the recursive-tree-diff axis of the verification gate will surface it. Accepted as intended: consumers never needed bkit's internal template source in their tree.
- **Retire the manual `rules.md` two-way sync via a CI byte-equality assertion?** A gate asserting the managed block of bkit's own `.agents/rules.md` byte-equals `.bkit/templates/.agents/rules.md` would eliminate the fragile manual sync. Independent of this refactor but cheaply bundled. Defer/confirm in planning.
- **`outDir` final home.** Design keeps `dist/` flat at repo root for this release. Whether `.bkit/dist/` is ever desirable is explicitly out of scope (orthogonal to centralisation; would change `bin`).

### Assumptions

- pnpm always writes a fresh `node_modules` on install, so no partially-cached mix of old `.agents/` + new `.bkit/` source can occur in a consumer (removes the staged-migration edge case).
- No consumer tooling references the package-internal `.agents/templates` or `.agents/scripts` paths directly (only destination paths in `.bkit-version`).
