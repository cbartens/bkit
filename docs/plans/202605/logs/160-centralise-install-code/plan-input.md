# Plan Input — 160-centralise-install-code

## Session Prompt

`bkit-plan issue 160` — generate the implementation plan for GitHub issue #160 ("Centralise all install code, templates & scripts into a `.bkit/` root folder"). The design phase is complete (verdict PASS, merged to `dev`); this plan must operationalise the design (`160-centralise-install-code-design.md`, appended below) and honour the binding human-review decisions (D1/D2/D3) captured in the issue comments.

> Note: #160 is the umbrella design issue. The design decomposed the work into 7 workstreams (WS-1..WS-7) tracked as sub-issues #161–#167 with dependency edges. This plan covers the umbrella scope; the complexity-check/split steps will partition it into self-contained sub-plans if it exceeds a single execution session.

---

## Issue #160 — Description

**Title:** Centralise all install code, templates & scripts into a `.bkit/` root folder
**State:** open · **Labels:** enhancement, bkit:plan, dependencies · **Milestone:** Initial Version

### Problem

Today the install/upgrade **machinery** and the install **payload** both live under `.agents/`, intermixed with content that `.agents/` legitimately owns (rules, skills, docs, prompts, workflows). This conflates three distinct concerns:

1. **Install/upgrade engine** — TypeScript under `.agents/scripts/` (`bkit-install.ts`, `bkit-upgrade.ts`, `bkit-modules.ts`, `bkit-tiers.ts`, `bkit-manifest.ts`, `bkit-version.ts`, `bkit-cli.ts`, `bkit-trackers.ts`, `bkit-tokens.ts`, `bkit-preflight.ts`, `bkit-postinstall.ts`, `bkit-uninstall.ts`).
2. **Install payload / templates** — `.agents/templates/**`, which contains files destined for the consumer's `.agents/`, `.claude/`, `.cursor/`, `.github/`, `.husky/`, plus root dotfiles (`.gitignore`, `.gitattributes`, `.mcp.json`, `.envrc`, `.vale.ini`, etc.).
3. **`.agents/`'s own content** — rules, skills, docs, prompts, workflows that bkit _uses_ as a tool, not just ships.

Because `.agents/` is simultaneously "the thing we install", "the thing we install _from_", and "the thing bkit runs against itself" (dogfooding), the boundaries are blurry. In particular: cross-agent / IDE template files (`.claude`, `.cursor`, `.github`, `.husky`, root dotfiles) live under `.agents/templates/` today, which is non-obvious — they aren't `.agents` content at all.

### Goal

Introduce a new **`.bkit/` root folder** as the single source of truth for everything install-related. From `.bkit/` we copy/install into the consumer's destinations. `.agents/` stops being the install _source_ and reverts to being just one of the install _destinations_.

Proposed shape (to be refined during design):

```
.bkit/
├── src/                # install/upgrade engine (moved from .agents/scripts/bkit-*.ts)
├── templates/          # full install payload, mirroring consumer destination layout:
│   ├── .agents/        # → consumer .agents/
│   ├── .claude/        # → consumer .claude/   (cross-agent / IDE)
│   ├── .cursor/        # → consumer .cursor/   (cross-agent / IDE)
│   ├── .github/        # → consumer .github/   (CI/workflows)
│   ├── .husky/         # → consumer .husky/    (git hooks)
│   └──  # .gitignore, .gitattributes, .mcp.json, .envrc, .vale.ini, ...
└── (config/manifests as needed)
```

Key principle: **cross-agent and IDE integration files (`.claude`, `.cursor`, `.github`, `.husky`, root dotfiles) are install payload — they should live under `.bkit/`, not under `.agents/` as they do today.**

### Current architecture (for reference)

- **Engine**: `.agents/scripts/bkit-*.ts`, compiled to `dist/`, exposed via `bin.bkit → ./dist/bkit-install.js`. Verbs: `install`, `check`, `doctor`, `upgrade`, `uninstall`.
- **Payload pass** (`runPayload()` in `bkit-install.ts`): mirrors `.agents/workflows/bkit-*.md`, `.agents/prompts/bkit-*.md`, and `.agents/templates/**` from the installed package into the consumer. In **dogfood mode** (running inside the bkit repo) src == dst, so the payload pass is a no-op — a constraint any move must preserve.
- **Mirror/regen**: the `claude` and `cursor` modules regenerate `.claude/{commands,agents}/bkit-*.md` and `.cursor/{commands,agents}/bkit-*.md` from `.agents/{workflows,prompts}/bkit-*.md` (with tier transforms + tracker substitution).
- **Write tiers**: Tier 1 canonical / Tier 2 managed-block merge / Tier 3 seed-once (`bkit-tiers.ts`).
- **Drift detection**: `canonicalHashes` / `tier3Hashes` / `pinnedVersion` in `.agents/.bkit-version`.
- **Dotfile remap**: `.gitignore` shipped as `gitignore` (npm strips dotfiles) and renamed at install (`NPM_STRIP_REMAP`).
- **package.json** `files[]`: ships `dist/` + `.agents/` (excluding tests/snapshots). A move to `.bkit/` must update `files[]`, `bin`, and any `dist` path expectations.

### Scope / tasks (high-level — design refined these)

- [ ] Define the canonical `.bkit/` layout and the source→destination mapping.
- [ ] Move the install/upgrade engine (`.agents/scripts/bkit-*.ts`) into `.bkit/` (decide on `dist`/build path + `bin` impact).
- [ ] Move the install payload (`.agents/templates/**`) into `.bkit/templates/**`, including the cross-agent/IDE subtrees and root dotfiles.
- [ ] Update the payload pass, module mirror logic, manifests, and any hardcoded `.agents/templates` / `.agents/scripts` paths.
- [ ] Preserve dogfood-mode semantics (src == dst no-op) under the new layout.
- [ ] Update `package.json` (`files[]`, `bin`, scripts, build output paths) so the npm tarball ships `.bkit/` correctly, including the dotfile-strip remap.
- [ ] Migrate `.bkit-version` / drift-hash references that point at `.agents/templates`.
- [ ] Update tests, snapshots, and integration tests referencing old paths.
- [ ] Update docs (`.agents/rules.md`, architecture/setup docs) to describe `.bkit/` as the install source of truth.
- [ ] Verify both **install** and **upgrade** live on a dogfood tarball in a clean dir (the two engines are separate — exercise both).

### Notes / constraints

- This is a structural refactor, not a behaviour change: installed output in consumer repos should be byte-identical before/after the move (verify via drift gates).
- Migration must be backward-compatible for consumers upgrading across the boundary (the upgrade engine reads paths recorded in their existing `.bkit-version`).
- Likely large enough to warrant a `/design` pass before planning/build.

---

## Issue #160 — Comments (verbatim, chronological)

### Design Workflow comments (Steps 1–10) — summary references

The design workflow ran to completion. Key persisted artifacts:

- Canonical design: `docs/plans/202605/160-centralise-install-code-design.md` (appended below)
- Design summary verdict: **PASS** (full text reproduced below)
- Merge commit: `12fa904`

### Step 8 — Design Summary (verdict: PASS) — full text

Verdict: PASS

# Design Summary

## Overview

Issue #160 proposes to centralise bkit's install machinery (engine source + templates) from scattered locations in `.agents/` into a dedicated `.bkit/` root directory, while preserving bkit's own runtime content (workflows, prompts, rules, docs, skills) in `.agents/` to maintain the dogfooding invariant. The design is a **structural refactor, not a behaviour change**—the byte-identical guarantee ensures all consumer-facing output remains unchanged post-refactor. The refactor introduces a single resolver seam (`getTemplatesRoot()`) to eliminate ~17 scattered path literals, consolidates duplicate PKG_ROOT derivation logic into one `getPkgRoot()` function, and makes the dogfood no-op explicit via an `isDogfood()` predicate. Four workstreams build the solution in strict order: resolver consolidation + dogfood guards (WS-1, pre-move), baseline capture (WS-2), physical relocation + re-pointing (WS-3), and two-axis verification (WS-4, install AND upgrade). Two additional workstreams add observability (WS-5) and update prose/authoring rules (WS-6, merge-gated).

## Design Quality (excerpts)

Strengths: clear line-drawing (move install source, keep bkit runtime in `.agents/`); load-bearing dependency ordering (WS-1 guards+seam MUST precede WS-3 move; WS-2 baseline before relocation); dual-axis verification oracle (hashes + recursive consumer-tree diff catches untracked `copyAdditive` payload); fail-loud guards (replace silent skip with `process.exit(1)` on missing templates-root); comprehensive trade-off inventory; acknowledged standing cost of manual `rules.md` two-way sync (deferred WS-7 to retire via CI assertion).

Planning-phase drill-downs flagged:

1. WS-1 deliverable: write out the `getPkgRoot()` three-run-context header comment explicitly.
2. WS-2: define exact baseline capture format (e.g. `.json` checksums + serialised tree listing under `docs/plans/202605/logs/160-centralise-install-code/baseline/`).
3. WS-4: define exact `npm pack --dry-run` diff command + tree-diff tool/format.
4. WS-6: surface exact grep hits for `\.agents/(templates|scripts)` across docs/README/.agents/docs.md/.agents/workflows.md/.bkitignore/.github/workflows/ci.yml:82.
5. Snapshot regen scope: clarify which test files produce snapshots and count.
6. Dogfood integration test: decide test file name/location upfront.

## Acceptance Scenario / Feasibility / Risks / Scope

Acceptance Scenario: well-formed, testable; two-axis oracle (hashes + recursive consumer-tree) on a packed tarball; capture pre-refactor baseline before any move. Feasibility high (line-numbered codebase understanding; dual PKG_ROOT derivation identified at bkit-install.ts:627-630; ~17 path literals: 8 in bkit-modules.ts, 2 in bkit-install.ts, plus upgrade/uninstall/integration-test). Seven major risk clusters with layered mitigations (byte-identical oracle blind spot; dual run-context resolution highest-leverage failure; files[]+tarball sync; missed source path silent skip; snapshot regen; vitest.config.ts glob re-target; prose doc-drift). Scope well-bounded.

Verdict: **PASS** — design ready to enter planning with no revisions required.

### Step 9 — Design Workstream Issues

Created 7 workstream sub-issues with dependency edges:

| WS   | Title                                                                     | Issue | Requires (Blocked by) |
| ---- | ------------------------------------------------------------------------- | ----- | --------------------- |
| WS-1 | Resolver-seam consolidation & dogfood safety scaffolding                  | #161  | —                     |
| WS-2 | Pre-refactor baseline capture                                             | #162  | —                     |
| WS-3 | Physical move, resolver re-point, tooling/config & dead-arm deletion      | #163  | #161, #162            |
| WS-4 | Two-axis verification gate (install AND upgrade)                          | #164  | #162, #163            |
| WS-5 | Doctor observability for resolved templates root                          | #165  | #161                  |
| WS-6 | Authoring-rule, docs & shipped-config drift updates (merge-gated)         | #166  | #163                  |
| WS-7 | Optional rules.md byte-equality CI assertion (deferred → bundled, see D3) | #167  | #166                  |

### Step 10 — Design Close

Design phase complete (verdict **PASS**), merged to `dev`. Canonical design at `docs/plans/202605/160-centralise-install-code-design.md`. HARD STOP — design requires human review before planning.

### Human-review decisions (planning input) — BINDING

Resolved with the maintainer before planning. `/bkit-plan` must treat these as binding:

#### D1 — Consumer `.agents/templates/` → **Drop + auto-clean**

Confirmed: the payload pass (`bkit-install.ts:660-666`) currently mirrors `.agents/templates/**` into the consumer's `.agents/templates/`. After the source moves to `.bkit/templates/`, fresh consumers stop receiving it — **intended**. Additionally, the **upgrade engine must actively remove the now-orphaned `.agents/templates/` from existing consumers** (clean migration, not a stale leftover).

- **WS-3 (#163):** beyond deleting the dead `runPayload` templates arm, add the orphan-removal of consumer `.agents/templates/` to the upgrade path.
- **WS-4 (#164):** the recursive `.agents/` tree-diff axis must assert the orphan dir is _gone_ after upgrade on a consumer that had it pre-move (not merely absent on fresh install).

#### D2 — `dist/` stays at **root** (not under `.bkit/`)

`.bkit/` is the hand-authored **source of truth** (engine `src/` + `templates/`); `dist/` is generated `tsc` output and stays at root with `bin → ./dist/bkit-install.js` unchanged. Generated artifacts do not belong inside the source-of-truth folder, and moving them buys nothing but `bin`/tsconfig churn. No change to the design.

#### D3 — WS-7 (rules.md equality gate) → **bundle now**, managed-block-scoped only

Retire the manual two-way `rules.md` sync via a CI gate, included in this work (not deferred).

- **Critical implementation constraint:** the gate compares the **managed `bkit:start`→`bkit:end` block only**, never the whole file. The `### bkit Repo Authoring` section lives _outside_ the markers (`rules.md:98`, after `bkit:end`) and is **intentionally bkit-repo-only** — it must never ship to consumers and must never trip the gate. (Earlier review framing of this as "drift to reconcile" was incorrect; there is nothing to reconcile.)
- **WS-7 (#167):** promote from deferred/optional to in-scope, with the block-scoped comparison as a hard requirement.

---

## Parent Design Document — 160-centralise-install-code-design.md

<!-- design doc appended below -->

Verdict: PASS

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

## Design Workstreams

### WS-1: Resolver-seam consolidation & dogfood safety scaffolding (pre-move)

#### Scope

The safety scaffolding that MUST land while the tree is still at `.agents/` so it can be validated green before any physical file move (Build sequence step 1). All in `bkit-paths.ts` + `bkit-install.ts` + a new integration test, with no path-string relocation yet:

- Consolidate `runPayload`'s inline `scriptDir.endsWith('${sep}.agents${sep}scripts')` PKG_ROOT derivation (`bkit-install.ts:627-630`) into a single call to `getPkgRoot()`, collapsing the duplicate suffix walk into one seam so a later bulk find-replace cannot miss it. The workflows/prompts arm of `runPayload` keeps a correct PKG_ROOT via this route.
- Add `getTemplatesRoot()` to `bkit-paths.ts` (the only encoding of the templates sub-path) and `isDogfood()` (`getPkgRoot() === process.cwd()`).
- Add the fail-loud guard: when the resolved templates root does not exist, emit `[bkit-modules] Templates root not found at <resolved path> — package corrupt?` and `process.exit(1)`, mirroring the existing `bkit-modules.ts:359` hard-exit, replacing the silent `if (!fs.existsSync) return;` skip semantics for templates-derived paths.
- Add the zero-write in-repo dogfood **integration test** asserting `bkit install` writes nothing to `.agents/` when `isDogfood()`, running in the `tsx`-from-source context (not `dist/`-only).
- Add the `bkit-paths.ts` header comment block enumerating the three `getPkgRoot()` run-contexts (dist, tsx-from-source, packed tarball) and which arm each hits (bus-factor mitigation).

This workstream defines the seam (`getTemplatesRoot()`, `isDogfood()`, single PKG_ROOT derivation) but does NOT yet move files or change the `.agents/scripts`/`.agents/templates` literals; those happen in WS-3.

#### Requires

[]

#### Rationale

The design marks this as load-bearing build step 1 ("First, before moving any files") and CRITICAL: with two independent copies of the suffix logic, a bulk rename is guaranteed to miss one. The guards, the explicit-dogfood predicate, the fail-loud behaviour, and the dogfood test must all land and prove green while the tree is still at `.agents/`, so the migration mid-state (templates moved but guards absent → self-overwrite of live `.agents/`) never exists. This is the root workstream with no upstream prerequisites.

### WS-2: Pre-refactor baseline capture

#### Scope

Capture the byte-identical verification baseline BEFORE moving anything, from a **packed-tarball** install into a clean consumer dir (not from the source tree), per Build sequence step 2 and the Data Model verification gate:

- Build a pre-refactor packed tarball (`pnpm pack`) and install it into a clean dir.
- Capture the `.bkit-version` hash set baseline (`canonicalHashes` + `tier3Hashes`).
- Capture the recursive `.agents/` consumer-tree listing baseline (full consumer-tree diff input), covering the untracked `copyAdditive` payload (`workflows/`, `prompts/`, `IDEs.md`, `cloud.md`, `trackers.md`) that the hash set omits.
- Capture the pre-refactor `npm pack --dry-run` tarball file list for the later removals-only diff assertion.

#### Requires

[]

#### Rationale

The baseline is captured from the pre-refactor tree, so it cannot depend on any code change in WS-1 (the scaffolding is behaviour-preserving and the baseline must reflect the true pre-move shipped output regardless). It is an independent root workstream that the move (WS-3) and the verification gate (WS-4) both consume. Capturing it before the move is explicitly mandated; once files relocate the baseline can no longer be obtained.

### WS-3: Physical move, resolver re-point, tooling/config & dead-arm deletion

#### Scope

The big-bang physical relocation and all the literal/config re-pointing that follows from it (Build sequence step 3):

- `git mv .agents/scripts → .bkit/src` and `git mv .agents/templates → .bkit/templates` (engine incl. `bkit-lint-no-tier-terms.ts` and all `*.test.ts`; full install payload with dest layout unchanged).
- Re-point the resolver seam string: extend `getPkgRoot()` suffix special-case from `.agents/scripts` to `.bkit/src`, derived from a shared `BKIT_SRC_SUBPATH` constant so it cannot drift from `rootDir`; encode `.bkit/templates` only in `getTemplatesRoot()`. The `dist/` arm of `getPkgRoot()` stays untouched.
- Replace every inline `path.join(PKG_ROOT, ".agents", "templates", …)` call-site (8 in `bkit-modules.ts`, 2 in `bkit-install.ts`, upgrade walk at `bkit-install.ts:736`, uninstall at `bkit-uninstall.ts:425`) with `getTemplatesRoot()`.
- Delete the now-dead templates arm of `runPayload` (`runPayload()` lines 660-666); the workflows/prompts arm `src === dst` skip stays unchanged.
- `tsconfig.json`: move `rootDir`/`include` to `.bkit/src`; drop the `.agents/skills` exclude; retain `**/*.test.ts` exclude; keep `outDir: dist` and `bin` unchanged.
- `vitest.config.ts:5`: re-target both `test.include` globs (`*.test.ts` + `*.integration.test.ts`) to `.bkit/src/**`.
- `package.json` `files[]`: add `".bkit"`, keep `".agents"`, replace `!.agents/scripts/*` exclusions with `!.bkit/src/*.test.ts`, `!.bkit/src/*.integration.test.ts`, `!.bkit/src/__snapshots__`; net `files[]` = `dist`, `.bkit`, `.agents`, `README.md`, `CHANGELOG.md`.
- `package.json` scripts: `lint:no-tier-terms` path → `.bkit/src/bkit-lint-no-tier-terms.ts`; review the `lint:prose` `find .agents/scripts` reference.
- Confirm `NPM_STRIP_REMAP` (`bkit-install.ts:577`) is unchanged and still applies under `.bkit/templates/` (templates stored dot-less).
- Update all test path-constants (12+ across `bkit-templates.content.test.ts`, `bkit-modules.test.ts`, `bkit-modules.integration.test.ts`, `bkit-modules.upgrade.integration.test.ts`, `bkit-tiers.test.ts`, `bkit-release-workflow.test.ts`, `bkit-install.test.ts`, `bkit-templates.test.ts`, `bkit-dry-run-parity.integration.test.ts`), re-point embedded `.agents/templates/...` literals, leave structurally-correct `path.resolve(SCRIPTS_DIR, "..", "..")` and `CORE_TEMPLATE_DIRS` untouched; regenerate the `bkit-templates.content.test.ts.snap` snapshot.

#### Requires

[WS-1, WS-2]

#### Rationale

The design's Build sequence places the `git mv` and re-pointing at step 3, strictly after the safety scaffolding (WS-1) lands green and after the baseline (WS-2) is captured. WS-1 supplies the single seam (`getTemplatesRoot()`, consolidated PKG_ROOT, `isDogfood()`, fail-loud guard) that this workstream re-points and relies on; performing the move before that seam exists would re-introduce the missed-literal silent-skip and dogfood self-overwrite failure modes the design forbids. WS-2 must precede the move because the baseline is uncapturable once files relocate.

### WS-4: Two-axis verification gate (install AND upgrade, packed tarball)

#### Scope

The post-move verification that the structural refactor produced byte-identical consumer output (Build sequence step 4 + Data Model verification gate + dry-run-parity CI gate):

- Build the post-refactor packed tarball and install AND upgrade (separate engines) into clean dirs.
- Axis 1: `.bkit-version` hash-set diff (`canonicalHashes`/`tier3Hashes`) identical to the WS-2 baseline, for both install and upgrade.
- Axis 2: recursive `.agents/` consumer-tree diff identical to the WS-2 baseline, for both install and upgrade (covers the untracked `copyAdditive` payload).
- `npm pack --dry-run` file-list diff vs the WS-2 baseline: the only removals must be `.agents/scripts/**` and `.agents/templates/**` (now under `.bkit/`); confirm `.bkit/templates/gitignore` actually ships and the `.agents/` runtime reads/copies (`trackers.md`, `IDEs.md`, `cloud.md`, `prompts.md`, `workflows.md`, `skills/**`, `workflows/bkit-*.md`, `prompts/bkit-*.md`) still ship.
- Add the dry-run-parity CI gate: `bkit install --dry-run` diff must be empty on a clean consumer clone before/after.
- Acknowledge and confirm the intended behaviour-visible change (fresh consumers stop receiving `.agents/templates/`) is surfaced by the recursive-tree axis and accepted.

#### Requires

[WS-2, WS-3]

#### Rationale

Verification is the design's terminal build step (step 4) and the safety net the big-bang cadence rests on. It consumes both the captured baseline (WS-2) and the completed move (WS-3) — there is nothing to verify until the move has happened, and no baseline to verify against unless WS-2 ran first. The gate must exercise both install and upgrade engines, so it depends on the full re-point in WS-3 (which touches the `runUpgrade` `tplRoot` walk).

### WS-5: Doctor observability for resolved templates root

#### Scope

Extend `bkit doctor` (read-only) to print the resolved templates root, e.g. `[bkit-doctor] Templates root: <resolved path>`, using the `getTemplatesRoot()` seam — the only runtime tool a developer has to verify which path was resolved at install time when diagnosing a silent template drop.

#### Requires

[WS-1]

#### Rationale

The design names this a required, net-new diagnostic task (not a follow-up) with highest diagnostic value for low effort. It depends only on the `getTemplatesRoot()` seam introduced in WS-1, not on the physical move; it reads whatever path the seam resolves. Isolated as its own workstream because it is an observability addition orthogonal to the move-and-verify chain (it can land alongside WS-3 but only needs the seam).

### WS-6: Authoring-rule, docs & shipped-config drift updates (merge-gated)

#### Scope

All prose, authoring-rule and shipped-template references to the relocated paths, which the design mandates land **atomically in the same PR as the move** (no gate catches these):

- `.agents/rules.md`: re-point the two-way `rules.md` sync rule (line 102) to `.agents/rules.md ↔ .bkit/templates/.agents/rules.md`; add the central principle ("install source of truth lives in `.bkit/`; bkit's own agent runtime lives in `.agents/` exactly as a consumer's does"); update the `bkit-preflight.ts` reference (line 106) → `.bkit/src/bkit-preflight.ts`.
- `docs/setup.md` (lines 53-54): dogfood commands → `pnpm tsx .bkit/src/bkit-install.ts ...`.
- `docs/architecture.md` (lines 30, 48): tree entries → `.bkit/src/` and `.bkit/templates/`.
- `docs/deployments.md`: build-freshness rule (line 193) → `.bkit/src/*.ts`; ci.yml/template/husky references (lines 197, 202, 214, 260) → `.bkit/templates/...`; Renovate `ignorePaths` note (line 211) → `.bkit/templates/**` AND the shipped `renovate.json5` template `ignorePaths` glob in lockstep (consumer-facing operational change shipping same release).
- `docs/knowledge.md`: forward-looking rules text only (e.g. KN-7, line 162); do NOT rewrite historic KN-\* incident narrative or commit-hashed `Related:` refs.
- Grep `\.agents/(templates|scripts)` across `docs/`, `README.md`, `.agents/docs.md`, `.agents/workflows.md`, `.bkitignore` (header comment), `.github/workflows/ci.yml:82` (+ its template source) and update; inventory as explicit in-PR scope.
- `.agents/skills.md` stays curated manually (no auto-registration).

#### Requires

[WS-3]

#### Rationale

The design explicitly classes these as merge-gated tasks in the same PR as the move, not follow-ups: stale `.agents/scripts`/`.agents/templates` paths would make setup docs ENOENT on first use and a contributor mirroring `rules.md` to a vanished path would silently drift every consumer. They describe the post-move tree, so they depend on the relocation (WS-3) being the agreed target shape; the shipped `renovate.json5` glob change is a consumer-facing change that must ship with the move.

### WS-7: Optional rules.md byte-equality CI assertion (deferred open question)

#### Scope

Evaluate and, if confirmed in planning, add a CI gate asserting the managed block of bkit's own `.agents/rules.md` byte-equals `.bkit/templates/.agents/rules.md`, retiring the fragile manual two-way sync. Captured here as a tracked open question rather than committed scope.

#### Requires

[WS-6]

#### Rationale

The design lists this in Open Questions as "Independent of this refactor but cheaply bundled. Defer/confirm in planning." It is a distinct, optional unit that depends on the re-pointed sync rule and post-move template path established in WS-6. Isolating it keeps the deferred/optional nature explicit and prevents it from blocking the core move-and-verify chain.
