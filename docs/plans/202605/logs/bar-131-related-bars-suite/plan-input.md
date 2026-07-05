# Plan Input — bar-131-related-bars-suite

## Session Prompt

`/bkit-plan` invoked with arguments: **"one plan covering bar-131/139/142 as all related"**

User intent: produce a single unified plan that covers the work scoped across three related Linear issues:

- **BAR-131** — bkit consumer issues (mostly absorbed into BAR-130 v0.1.2; one stretch goal remains)
- **BAR-139** — `bkit uninstall` automate consumer cleanup + Phase 3 blocker auto-revert
- **BAR-142** — bkit install preflight checklist follow-ups (A1 Tier-2 refactor, A3 `bkit doctor`, A4-A7 from comments, B1-B5 polish)

Primary umbrella `ISSUE_ID = BAR-131` for workflow bookkeeping. Plan content addresses all three.

The relatedness chain:

1. BAR-139's uninstall primitive provides recovery for BAR-142 A2 (Phase 3 exit-1) — A2 was explicitly moved from BAR-142 to BAR-139.
2. BAR-142 A1 (Tier-2 refactor of `.cursor/hooks.json` + `.claude/settings.json`) overlaps with BAR-139's Tier-2 stripping helper.
3. BAR-131 is the original consumer-friction catch-all that surfaced the patterns now formalised in BAR-139 + BAR-142.

The plan must respect:

- Project conventions in `.agents/rules.md` (Universal + Project rules).
- Plan template `docs/plans/template.md`.
- Module-aware `bkit install` architecture and Tier-1/2/3 ownership rules in `.agents/docs.md`, `.agents/skills.md`, and `KN-8` of `docs/knowledge.md`.
- Existing `bkit-install.ts` / `bkit-tiers.ts` / `bkit-preflight.ts` / `bkit-modules.ts` / `bkit-cli.ts` source layout.

---

## BAR-131 — Description

Catch-all for friction observed during consumer-side adoption of `@cbartens/bkit#v0.1.x`. Each entry below is a discrete fix candidate; carve into sub-issues when work starts.

### Context

- Producer repo: `cbartens/bkit` (private GitHub, git-dep distribution, no public npm).
- Consumers tested so far: `www-visitfrasercoast-com` (smoke), `app-gether-life` (seed migration).
- Distribution model: `pnpm add -D github:cbartens/bkit#vX.Y.Z`, `prepare` runs `tsc` to produce `dist/`, `bkit` bin links via `node_modules/.bin/`.
- **2026-05-04 update:** items #1 (CI auth shim) and #3 (`check` ≠ `install` parity) absorbed into BAR-130 (v0.1.2). Stub entries retained for traceability. Helper-action stretch goal for #1 stays here for v0.2+ consideration.

### 1. Private repo + GitHub-Actions runner = `pnpm install` fails — ABSORBED INTO BAR-130

PAT-shim mitigation (the `git config --global url.insteadOf` trick using `BKIT_READ_TOKEN` secret) baked into seeded `ci.yml` + README docs as part of BAR-130 v0.1.2.

**Stretch goal remaining here:** evaluate shipping a helper action (e.g. `cbartens/bkit/.github/actions/setup-auth@v1`) so consumer workflows write `uses: cbartens/bkit/.github/actions/setup-auth@v1 with: token: ${{ secrets.BKIT_READ_TOKEN }}` instead of pasting the bash line. Reduces consumer-side ceremony but adds another bkit-owned surface to maintain. Defer to v0.2+ once v0.1.2 ships and we see how the bash-line shim lands in real consumer CI.

### 2. `pnpm add -D github:cbartens/bkit#vX.Y.Z` drops the tag pin from `package.json`

Reproduced in `app-gether-life`: `pnpm add -D -w github:cbartens/bkit#v0.1.1` resulted in:

```jsonc
"@cbartens/bkit": "git+https://github.com/cbartens/bkit.git",   // ← no #v0.1.1
```

The `#v0.1.1` tag suffix is dropped by pnpm's normalisation. The lockfile correctly captures the resolved commit, so `pnpm install --frozen-lockfile` is deterministic — but as soon as someone runs `pnpm update @cbartens/bkit` or wipes the lockfile, the dep floats to whatever's on `main`.

**Manual fix:** rewrite `package.json` to `"github:cbartens/bkit#v0.1.1"` after `pnpm add`, then `pnpm install` to re-lock.

**What bkit should do:** add a one-line note to the install snippet in `bkit/README.md` saying _"after `pnpm add`, verify the tag is preserved in `package.json` — if it shows `git+https://…` without `#vX.Y.Z`, rewrite to `github:cbartens/bkit#vX.Y.Z` and re-run `pnpm install`."_

**Possible upstream fix:** investigate whether bkit's `package.json` (`name`, `version`, `repository.url`) can be tweaked so pnpm's normaliser preserves the tag. Likely an upstream pnpm bug, but worth a 5-minute look before just documenting the workaround.

### 3. `bkit check` vs `bkit install` write-count discrepancy — ABSORBED INTO BAR-130

Dry-run parity bug folded into BAR-130 v0.1.2.

### 4. (Already documented — pnpm 10 `onlyBuiltDependencies` allowlist)

Already covered in BAR-111; fix shipped in bkit `README.md` commit `22b4ad5`.

### Suggested ordering

1. **#2 (tag drop)** — doc-note in `bkit/README.md` install section.
2. **Helper-action stretch from #1** — evaluate after BAR-130 ships.

### Out of scope

- npm-registry distribution.
- Adding new bkit verbs / changing payload structure.
- Per-consumer decisions about which workflows run `pnpm install`.

### BAR-131 Comments — Status sync (2026-05-05)

- **#1 (private-repo CI auth)** — DONE. PAT-shim baked into seeded `ci.yml` + README `## Consumer CI auth` section shipped in v0.1.2.
- **#3 (`check` vs `install` parity)** — DONE. `WriteSet` accumulator threads dry-run + install through the same code path; regression test in `bkit-dry-run-parity.integration.test.ts`.
- **#2 (pnpm tag-drop README note)** — pulled into BAR-130 dev follow-up.
- **#1 stretch (helper auth action `setup-auth@v1`)** — STILL OPEN. Defer until v0.2.0 ships and we have real consumer-CI data.
- **#4 (pnpm `onlyBuiltDependencies`)** — already documented; no action.

Net: BAR-131 work remaining is just the helper-action stretch (#1) and any new consumer friction surfaced post-v0.2.0.

---

## BAR-139 — Description

### Goal

Add a `pnpm bkit uninstall` command that reverses the install — removes every file and managed block bkit wrote on the consumer side, leaving the repo in a clean state ready for either a fresh re-install or full removal of bkit.

Also wire `bkit install`'s Phase 3 post-install blockers (BAR-141) into the uninstall primitive so a partial-install can be rolled back cleanly when a critical post-install gap is detected.

### Background

Currently bkit has no inverse of `bkit install`. Cleanup is manual and error-prone. Test scenarios that need a clean re-install (e.g., validating GHPR migration end-to-end on consumer repos) require the maintainer to remember the full file list and managed-block locations.

A second pressure surfaced in BAR-141 PR #5: Phase 3 post-install detectors can return `severity: "blocker"` (e.g. `ci-yml-missing-token-env` when `.npmrc` references `${GH_BKIT_TOKEN_INSTALL}` — the next CI run will 401). Currently the label changes but `process.exit(1)` doesn't fire, because Phase 3 runs _after_ writes and halting mid-install leaves a partially-applied state. Without a recovery primitive, exit-1 is just a worse failure mode than the current visibility-only treatment. Once `bkit uninstall` exists, Phase 3 can fail-loud-and-revert: render the banner, exit 1, and the consumer's recovery is `pnpm bkit uninstall && fix-the-gap && pnpm bkit install`.

### Scope — In scope

1. **New CLI subcommand:** `bkit uninstall` with module flags mirroring install (`--ci`, `--lint`, `--git-hooks`, `--core`, `--claude`, `--cursor`, `--full`).
2. Remove all Tier-1/2/3 files written by the matching modules:
   - Tier 1 (full ownership): `.agents/`, `.claude/`, `.cursor/`, `.vale.ini`, `slop-scan.config.json`, `.vale/styles/House/`, `.prettierignore`, `.husky/pre-{commit,push}` — delete outright.
   - Tier 2 (managed block): strip the `<!-- bkit:start --> ... <!-- bkit:end -->` region from `AGENTS.md`, `CLAUDE.md`, `.gitignore`, `docs/*.md`. Leave consumer content outside markers untouched.
   - Tier 3 (seed-or-print): `.github/workflows/ci.yml` — only delete if the file content matches the bkit template (hash-compare) or the user passes `--force`. Don't clobber consumer-customised CI by default.
3. Dry-run mode (`--dry-run`) showing what would be removed, no writes.
4. Idempotent — safe to run twice; reports cleanly when files are already absent.
5. Optional: also `pnpm remove @cbartens/bkit` if `--package` flag passed (default: leave the dep alone).
6. **Phase 3 blocker auto-revert hook (BAR-141 follow-up):**
   - `bkit-install.ts` Phase 3 path inspects `postFindings.some(f => f.severity === "blocker")` after rendering banner; if true, exit 1.
   - Action text on every Phase 3 blocker references the partial-state and tells consumer the fix path: `pnpm bkit uninstall <module-flags-used> && <apply-the-fix> && pnpm bkit install <same-flags>`.
   - Optional: `--auto-revert` install flag that triggers `bkit uninstall` automatically on Phase 3 blocker before exit 1 (off by default; opt-in for CI scripts that want fail-fast hygiene).
   - Integration test: `ci.yml` gap + `.npmrc` token ref → install completes writes, renders banner, exits 1; subsequent `bkit uninstall` returns repo to pre-install state cleanly.

### Scope — Out of scope

- Cleaning up `pnpm-lock.yaml` (consumer runs `pnpm install` after to refresh).
- Modifying `package.json` beyond what `pnpm remove` does.
- Restoring pre-install state of files that bkit only modified incrementally (impossible without backups).
- A "factory reset" mode that wipes all docs templates regardless of customisation.
- Auto-rollback as default behaviour. Default stays exit-1-with-instructions; `--auto-revert` is opt-in only.

### DoD

- [ ] `pnpm bkit uninstall --full` reverses a fresh `pnpm bkit install --full` to a directory state matching `git status -- :!node_modules :!.npmrc` = clean.
- [ ] `pnpm bkit uninstall --ci --dry-run` lists every file/block it would touch, no writes.
- [ ] Tier-2 managed-block stripping leaves consumer content intact (snapshot test on `AGENTS.md`).
- [ ] Tier-3 protection: skips a `ci.yml` whose content has been edited by the consumer; only removes a fresh-seeded one OR with `--force`.
- [ ] Vitest unit coverage for the new command.
- [ ] README "Uninstall" section.
- [ ] **Phase 3 blocker behaviour:** `bkit-install.ts` exits 1 when any Phase 3 finding has `severity: "blocker"`; banner rendered before exit; integration test asserts exit code + revert path.
- [ ] `--auto-revert` opt-in flag: when passed AND a Phase 3 blocker fires, `bkit install` invokes the uninstall primitive in-process and exits 1.
- [ ] No regression for advisory-only post-install runs (still exit 0).

### BAR-139 Suggested implementation order

1. Catalogue exactly what each install module writes (build a manifest from `bkit-modules.ts` Tier-1/2/3 calls).
2. Add `runUninstallModule` per install module, sharing the `WriteSet` plumbing (additive: tracks deletions, dry-run-aware).
3. Implement Tier-2 managed-block stripping helper (re-uses the existing marker regex from `bkit-tiers.ts`).
4. Wire the CLI subcommand + flags in `bkit-cli.ts`.
5. Tests + README update.
6. **Wire Phase 3 blocker exit-1** in `bkit-install.ts`.
7. **Optional** `--auto-revert` flag.

### BAR-139 Comments — Manual uninstall procedure (Visit Fraser Coast reference)

10-step manual sequence performed against `fcte-com-au/visitfrasercoast-com`:

1. `pnpm remove @cbartens/bkit husky prettier slop-scan` (note: husky/prettier/slop-scan only listed because consumer manually added them as workarounds for Finding 5; once F5 ships bkit uninstall should remove what it added — drive list from `.bkit-version` metadata or `.bkit-installed-deps` manifest).
2. `rm -rf .agents/ .claude/ .cursor/ .vale/ .husky/`
3. `rm -f .vale.ini slop-scan.config.json .prettierignore .github/workflows/ci.yml docs/plans/template.md` then `rmdir .github/workflows .github 2>/dev/null`
4. `rm -f .npmrc` (with caveats for non-bkit usage; detect via content scan)
5. Strip `<!-- bkit:start -->...<!-- bkit:end -->` regions from `.gitignore`, `AGENTS.md`, `CLAUDE.md`, `docs/*.md`. Use line-anchored regex (`^[ \t]*#?[ \t]*<!-- bkit:start -->[ \t]*\n.*?^[ \t]*#?[ \t]*<!-- bkit:end -->[ \t]*\n?` with DOTALL+MULTILINE) — naive `\s*<!-- bkit:start -->.*?<!-- bkit:end -->\n?` eats whitespace across newlines and clobbered surrounding non-bkit content during BAR-138 work.
6. Delete files that became 0-byte after stripping (`find docs -maxdepth 1 -name "*.md" -size 0 -delete`).
7. Strip bkit-added `package.json` scripts (`typecheck`, `format:check`, `lint:prose`, `lint:slop`, `prepare`) and `pnpm.onlyBuiltDependencies` entries — only if value matches bkit default at install time.
8. `pnpm install` to refresh lockfile.
9. Optional: `gh secret delete GH_BKIT_TOKEN_INSTALL`.
10. Verify with `grep -rln "bkit:start\|@cbartens/bkit\|\[bkit\]"` etc.

Recommended `bkit uninstall` shape:

```
pnpm bkit uninstall [--keep-npmrc] [--keep-tooling] [--dry-run]
```

### BAR-139 Comments — Surgical-uninstall pattern (gether-life heavily-customized consumer)

The blanket recipe destroys real consumer work on heavily-customized consumers. Surgical pattern:

#### Tier-by-tier semantics

1. **Tier 1 (fully managed by bkit):** safe to `rm -rf`. But preserve any non-`bkit-` prefixed `.md` in `.agents/skills/` (custom skills).
2. **Tier 2 (managed-block — bkit owns content between markers):** strip block ONLY, never delete file.
   - Files: `.prettierignore`, `.gitignore`, `AGENTS.md`, `CLAUDE.md`, `.husky/pre-commit`, `.husky/pre-push`, `docs/**/*.md`
   - Strip pattern: regex-match `[#<!]+\s*-?-?\s*bkit:start.*?[#<!]+\s*-?-?\s*bkit:end\s*-?-?\s*-?->?\n?` (handles both `# bkit:start` hash-comment and `<!-- bkit:start -->` html-comment forms).
   - **If the file has no markers** (e.g. gether's husky hooks, which were never bkit-managed), the file is 100% consumer content — leave it alone.
   - After strip, if file is empty/whitespace, leave it as-is. Don't `rm` because consumer may have intentionally kept the empty file.
3. **Tier 3 (seed-or-print):** hash-compare against template; only delete if content matches a known bkit-emitted template version. Otherwise preserve.
4. **Managed package.json keys:** scripts/devDeps checked against bkit-emitted defaults; preserve customisations.

#### Default behaviour vs. flags

```
bkit uninstall              # Surgical — default. Strip blocks, preserve consumer content. Never destroys.
bkit uninstall --dry-run    # Per-file table: DELETE / STRIP-BLOCK / PRESERVE with one-line reason.
bkit uninstall --force      # Override Tier-3 hash-match guard; still doesn't touch mid-block consumer content.
bkit uninstall --nuke       # Blanket recipe — for clean test repos only. Confirms via prompt.
bkit uninstall --module ci  # Only undo --ci changes. Mirrors install module flags.
```

#### Acceptance criteria additions

- [ ] `--dry-run` per-file table with DELETE / STRIP-BLOCK / PRESERVE decisions and one-line reason each.
- [ ] Tier-3 hash-match guard via `.bkit-version` lookup table; `--force` overrides.
- [ ] Tier-2 marker-absent guard: skip 100% consumer content even with `--force`.
- [ ] Managed-keys preservation guard for package.json scripts/devDeps.
- [ ] Snapshot test: install → uninstall on fixture with custom hooks/scripts/tuned `.vale.ini` → consumer-customized files are byte-identical to pre-install state.

The key insight: **bkit-managed-block markers are the SoT for "what bkit owns" inside a mixed-ownership file**. Same logic for managed scripts/devDeps — bkit only "owns" values matching its emitted defaults.

---

## BAR-142 — Description

### Goal

Close gaps deferred from BAR-141 PR #5 — items out of scope for a detector-only PR but worth tracking. Two categories: architectural follow-ups and LOW-priority cleanup.

Reference: BAR-141 PR #5 detection layer is 100% covered; this issue captures everything intentionally NOT shipped there, except Phase 3 blocker exit-1 + auto-revert which moved to BAR-139 (recovery primitive lives there naturally).

### Category A — Architectural follow-ups

#### A1. Tier-1 → Tier-2 refactor for `.cursor/hooks.json` and `.claude/settings.json`

**Problem:** These files ship as Tier-1 (full overwrite). Real consumers (`app-gether-life`) routinely add their own `Stop` hook blocks, postflight wiring, `failClosed`, `loop_limit` — full overwrite silently destroys them.

**Mitigation in BAR-141:** `detectHooksConfigOverwriteRisk` blocker exits Phase 1 if non-default content detected.

**Real fix:** Move to Tier-2 (managed-block) so bkit owns only its `SessionStart` entry; consumer's other hook events survive upgrades.

**Complications:**

- JSON has no native comment syntax — managed-block markers can't be inline.
- Options: (a) wrap bkit-managed JSON segment in `__bkit__: {...}` and merge on install; (b) use a sibling `.json` fragment file and have bkit deep-merge; (c) ship as TypeScript helper.
- Need a deep-merge primitive in `bkit-tiers.ts` that respects consumer keys.

**DoD:**

- [ ] `.cursor/hooks.json` and `.claude/settings.json` reclassified as Tier-2 (decide on JSON-merge mechanism first)
- [ ] `writeTier2Json()` (or equivalent) helper added with deep-merge semantics
- [ ] Consumer-added hook events survive bkit upgrade (regression test against the Gether scenario)
- [ ] `detectHooksConfigOverwriteRisk` becomes obsolete — remove or repurpose

**Cross-link:** KN-8 in `docs/knowledge.md` documents the architectural rule.

**Note from BAR-142 comments:** On `app-gether-life`, single largest source of upgrade friction (manual re-merge required 3 times across 0.4.1/0.5.0/0.5.1). Concrete deep-merge requirements:

- `.claude/settings.json`: bkit owns `permissions.*`, `mcpServers`, `hooks.SessionStart`. Consumer owns `hooks.Stop`, `hooks.PostToolUse`, `hooks.UserPromptSubmit`. Per-key ownership needed — both bkit and consumer can have entries under `hooks.*` simultaneously.
- `.cursor/hooks.json`: bkit ships `{ hooks: [{ event, command }] }` (flat array, no top-level `version`); Cursor's actual v1 schema is `{ version: 1, hooks: { sessionStart: [{ command, failClosed }], stop: [{ command, loop_limit }] } }`. **Before doing the Tier-2 work, verify which schema Cursor actually supports** — bkit's current shipped schema may be wrong outright.

Suggested merge mechanism: **option (a) `__bkit__` namespacing is the cleanest** — bkit-managed entries live under `__bkit__.hooks.SessionStart`, bkit's deep-merge step combines them into the live `hooks.SessionStart` array on install, leaving consumer's `hooks.Stop` outside `__bkit__` untouched.

#### A2. Phase 3 `exit 1` on blocker-severity findings → moved to BAR-139

The Phase 3 blocker exit-1 path needs `bkit uninstall` as the recovery primitive. Now scoped under BAR-139.

#### A3. `pnpm bkit doctor` CLI subcommand

**Problem:** `bkit-version-pin-stale` and similar drift conditions only surface during `bkit install` (writes) or `bkit check` (drift gate). A consumer who upgraded the dep with `pnpm add -D @cbartens/bkit@X` but didn't run `bkit install` has no read-only single-shot diagnostic.

**Real fix:** New CLI verb `pnpm bkit doctor` — thin wrapper around `runPreflight()` that exits 0, prints the unified checklist banner. Pure read-only.

**DoD:**

- [ ] `bkit-cli.ts` registers `doctor` verb
- [ ] Help text added
- [ ] README updated with usage
- [ ] Integration test: scratch consumer with stale version pin → `pnpm bkit doctor` exits 0, prints `bkit-version-pin-stale` advisory

**Implementation hint:** since `runPreflight()` is already a pure function with no side effects:

```ts
case "doctor": {
  const { blockers, advisories } = runPreflight(modules, process.cwd());
  const banner = formatChecklist([...blockers, ...advisories]);
  if (banner) console.log(banner);
  process.exit(0);  // doctor always exits 0 — diagnostic, not gate
}
```

Plus CLI verb registration, help text, README update.

**Strengthened priority from comments:** Fraser Coast 0.4.0 → 0.4.1 upgrade had two CI failures after a plain `pnpm add -D @cbartens/bkit@0.4.1` (no `bkit install` re-run). The `detectBkitVersionPinStale` advisory shipped in BAR-141 PR #5 _would_ have caught both — but only fires when consumer runs `bkit install` or `bkit check`. A `pnpm bkit doctor` between dep-bump and CI gives consumer a frictionless local diagnostic.

**Extension from gether-life feedback:** doctor should also re-evaluate **post-install detectors** (not just preflight). Some advisories like `gh-bkit-token-secret-unknown` and `vale-package-not-synced` describe state that drifts after install too.

**A3 deserves to LEAD the BAR-142 implementation order** ahead of B-batch polish — Fraser Coast is the second consumer (after Gether) hitting the version-pin-stale pattern in a week, and A3 is the cheapest fix with the highest compounding value.

#### A4. Transactional install (mid-failure rollback) — NEW from comments

**Problem:** When 0.5.0's `bkit-design-organise` lookup miss aborted `--cursor` install mid-stream, ~10 `.cursor/agents/*.md` files had already been written. Consumer was left in inconsistent state — half-installed `--cursor` module, no rollback, no resume primitive.

**Real fix:** Write each module's output to `.bkit-staging/<module>/` first, validate the whole module ran cleanly, then atomic-rename onto `.claude/` / `.cursor/` / etc. On any error: discard staging dir, leave consumer state untouched.

**Cross-link:** A2 (now BAR-139) addresses the _post-install_ recovery case via uninstall. A4 is the _during-install_ counterpart — different code path, complementary primitive.

**DoD sketch:**

- [ ] `runModule()` writes through a `WriteSet`-backed staging dir
- [ ] On unexpected error: staging dir cleaned, consumer files untouched
- [ ] On success: atomic rename per file (or per directory subtree)
- [ ] Test: simulate mid-module failure (e.g., throw in T3 transform), assert no consumer-side files modified

#### A5. `pnpm bkit upgrade` as first-class verb — NEW from comments

**Problem:** Current upgrade flow is `pnpm add -D @cbartens/bkit@<X> && pnpm exec bkit install`. On heavily-customized consumers, became a 5-step manual dance per upgrade. Three upgrades × 5 steps = 15 manual edits in one session.

**Real fix:** New verb that wraps both steps and detects upgrade-specific conditions:

- Reads `.bkit-version` to know previous version.
- Optionally runs `pnpm add` to bump.
- Diffs canonical bkit-owned files between old/new package versions.
- Only overwrites files where consumer hasn't customized vs. previous version (using stored hash from new `.bkit-version` payload metadata).
- Surfaces per-file decisions: keep yours / take new / 3-way merge.

**Structural payoff:** finding #10 from BAR-141 (the `bkit-design-organise` lookup miss caused by `copyAdditive`'s "skip if exists" logic against stale 0.4.1 `prompts.md`) becomes architecturally impossible — `bkit upgrade` would diff and force-merge canonical files.

**DoD sketch:**

- [ ] `bkit-cli.ts` registers `upgrade` verb
- [ ] `.bkit-version` extended to store hashes of canonical files at install time
- [ ] `runUpgrade()` diffs and prompts (or auto-applies in `--non-interactive`)
- [ ] Test: 0.4.x → 0.5.x with a customized `.cursor/hooks.json` does NOT silently overwrite

#### A6. `.bkitignore` for intentional drift — NEW from comments

**Problem:** After landing manual fixes on a heavily-customized consumer, `pnpm exec bkit check` exits 1 because `.cursor/hooks.json` and `.claude/settings.json` legitimately diverge from bkit's templates. CI consumers wanting to gate on `bkit check` can't — gate is permanently red.

**Real fix:** Support a `.bkitignore` file at repo root listing files (and optionally JSON paths within them) where drift is consumer-intentional.

```
# Files where consumer-specific drift is intentional and bkit should not flag.
.cursor/hooks.json
.claude/settings.json:hooks.Stop  # only this key; other drift in this file IS a problem
```

Per-key drift exclusions are nice-to-have; per-file is must-have. **Note:** A1 (Tier-2 refactor) reduces but doesn't eliminate the need — Tier-3 wholesale-replacements still drift, and `.bkitignore` lets the gate stay green.

**DoD sketch:**

- [ ] `.bkitignore` parser in `bkit-tiers.ts` (gitignore-style globs + optional `:json.path` suffix)
- [ ] `bkit check` consults `.bkitignore` before flagging drift
- [ ] README documents file format and use case
- [ ] Test: consumer with customized `.cursor/hooks.json` and `.bkitignore` listing it → `bkit check` exits 0

#### A7. Changelog surface in post-install output — NEW from comments

**Problem:** When consumer went 0.4.1 → 0.5.1, `bkit install` didn't say _what changed_.

**Real fix:** Prepend a header to the post-install banner showing version delta:

```
[bkit] Upgraded 0.4.1 → 0.5.1
  - Fixed: copyAdditive overwrites stale canonical .agents/ files (BAR-141 #10)
  - Added: bkit-design-organise subagent + workflow step
  - See full changelog: https://github.com/cbartens/bkit/blob/main/CHANGELOG.md#0-5-1
```

Sourced from `CHANGELOG.md` keyed on version, included in package payload at publish time. Only print when previous `.bkit-version` differs from package version. **Cheap, high-leverage** — answers "what should I retest after upgrading?" in 3 lines.

### Category B — Build-challenge LOW findings (polish)

#### B1. LOW-1: `hasBkitMarkers` naive substring → anchored matching

`bkit-preflight.ts#hasBkitMarkers` uses `content.includes(...)`. The install block uses `findLineAnchoredMarkers` for actual detection. Misalignment risk: a consumer file containing `<!-- bkit:start -->` inside a commented prose example falsely registers as having markers.

**DoD:** `hasBkitMarkers` rewritten to require line-anchored marker (regex `^\s*(<!--\s*bkit:start\s*-->|#\s*bkit:start)\s*$` line-by-line). All call sites verified.

#### B2. LOW-2: Cross-phase dedup re-orders findings

When Phase 3 supersedes a Phase 1 finding by id, the surviving entry moves to Phase 3's output position. Plan says "Phase 3 wins on conflict" — content semantics, not position.

**DoD:** `runPostInstallCheck` cross-phase merge preserves Phase 1 position when superseded; new test asserts position stability.

#### B3. LOW-3: Vercel CLI hang risk on unlinked projects

`detectVercelEnv` shells out to `vercel env ls`; on a repo with `vercel.json` but no linked project, the CLI may hang up to the 10s `execFileSync` timeout. Worst case 20s install (preview + production).

**DoD:** When timeout fires, return `"unknown"` and emit a low-priority advisory pointing the consumer to `vercel link`. Or pre-check for `.vercel/project.json` and skip the `env ls` call if absent.

#### B4. LOW-4: Empty-string `GH_BKIT_TOKEN_INSTALL=""` treated as "missing"

`Boolean("")` returns false → `detectShellToken()` returns "missing". Technically correct but action text doesn't distinguish "unset" from "empty".

**DoD:** `detectShellToken` separates `unset` and `empty` cases with action text differentiating. Or call out empty-string equivalence in existing action text.

#### B5. LOW-5: `[bkit-check]` log prefix missing on blocker banner in dry-run

In dry-run mode, `LOG_PREFIX` is set to `[bkit-check]` but the blocker banner from `formatChecklist(blockers)` doesn't apply it.

**DoD:** Banner output in `bkit-install.ts` blocker-exit path prepends `LOG_PREFIX` consistently.

#### B6 (NEW from comments). `.npmrc` `${GH_BKIT_TOKEN_INSTALL}` warning noise in local dev

Every `pnpm` invocation in a shell without `GH_BKIT_TOKEN_INSTALL` exported emits warnings — fired ~30 times across various invocations in one session.

Two mitigations:

1. **Cheap:** existing `[advisory] gh-bkit-token-secret-unknown` could include a clear DO step: "Add `export GH_BKIT_TOKEN_INSTALL=<paste>` to your shell rc — silences pnpm warnings in local dev."
2. **Long-term:** test whether pnpm supports POSIX-style `${VAR:-}` fallback syntax in `.npmrc`. If yes, ship `_authToken=${GH_BKIT_TOKEN_INSTALL:-}` — still works in CI when var is set, silent when unset.

### BAR-142 Out of scope

- Phase 3 blocker exit-1 + auto-revert — now in BAR-139.
- Anything that requires changes to `bkit install`'s overall phase architecture beyond what's already scoped.
- Anything that touches the preflight detector list itself — those should be net-new issues per detector.

### BAR-142 Suggested implementation order (with comment updates)

1. **A3 (bkit doctor)** — independent, low risk, high consumer value (LEAD per Fraser Coast feedback)
2. **B5 / B4 / B1 / B6** — quick polish wins, batch into one PR
3. **A7 (changelog surface)** — dirt-cheap, high-leverage
4. **A6 (.bkitignore)** — closes loop A1 leaves open for Tier-3-customized files
5. **A1 (Tier-2 refactor)** — biggest scope; do last when there's clear time. Could split.
6. **A4 (transactional install) / A5 (upgrade verb)** — structural unlocks; sequence after A1
7. **B2 / B3** — only if A1 hasn't already touched relevant code paths

---

## Cross-issue Sequencing & Coupling Analysis

### Tight couplings

<!-- prettier-ignore -->
| From | To | Why |
| --- | --- | --- |
| BAR-139 uninstall | BAR-142 A2 (now in BAR-139) | A2 needs uninstall as recovery primitive |
| BAR-139 Tier-2 stripping helper | BAR-142 A1 Tier-2 refactor | Both need a robust managed-block + deep-merge primitive in `bkit-tiers.ts` |
| BAR-142 A3 doctor | BAR-141 detectors (already shipped) | A3 is a thin wrapper over `runPreflight()` |
| BAR-142 A4/A5 | BAR-139 uninstall | A4 (staging-dir transactional install) parallel; A5 (upgrade verb) reuses uninstall + install primitives |
| BAR-142 A6 `.bkitignore` | BAR-139 + BAR-142 A1 | A1 reduces but doesn't eliminate need; A6 sits in `bkit check`, also relevant to `bkit doctor` (A3) |
| BAR-131 helper-action stretch | (independent) | Defer until v0.2+; lowest priority |

### Recommended unified sequencing

Phased rollout to ship value early and limit blast radius:

**Phase 1 — Quick wins + diagnostic (lowest risk, highest near-term value)**

1. BAR-142 A3: `pnpm bkit doctor` verb (Fraser Coast pattern compounds)
2. BAR-142 B1, B2, B4, B5, B6: polish batch
3. BAR-142 A7: changelog surface in post-install

**Phase 2 — Recovery primitive (enables A2 + safe upgrade story)** 4. BAR-139: `bkit uninstall` core (Tier-1 delete + Tier-2 surgical strip + Tier-3 hash-guard) 5. BAR-139: `--dry-run` table output, idempotency, module flags 6. BAR-139: Phase 3 blocker exit-1 wiring (was BAR-142 A2) 7. BAR-139: Optional `--auto-revert` install flag 8. BAR-142 A6: `.bkitignore` parser + `bkit check`/`bkit doctor` integration

**Phase 3 — Tier-2 deep-merge (unlocks safe-upgrade for hooks/settings)** 9. BAR-142 A1: Tier-2 refactor for `.cursor/hooks.json` and `.claude/settings.json` (verify Cursor v1 schema first; `__bkit__` namespace + deep-merge in `bkit-tiers.ts`) 10. BAR-142 B3: Vercel CLI guard (only if A1 work touches preflight)

**Phase 4 — Architectural ergonomics (compounds with prior phases)** 11. BAR-142 A4: Transactional install (staging dir + atomic rename) 12. BAR-142 A5: `pnpm bkit upgrade` verb 13. BAR-131 helper-action stretch: evaluate `setup-auth@v1` GH Action

### Versioning hint

- Phase 1 = v0.6.x (small, fast)
- Phase 2 = v0.7.x (uninstall is a major shape addition)
- Phase 3 = v0.8.x (Tier-2 refactor is the biggest semver pressure)
- Phase 4 = v0.9.x → v1.0
- BAR-131 helper-action: opportunistic; could land any time post-Phase-1

---

## Notes for plan generation

- **Single plan, multi-issue scope** — DO NOT split into per-issue plans during this run. The complexity-check step will decide whether to split (likely SPLIT given size).
- **Respect `.agents/rules.md`** — completeness over shortcuts, no half-finished implementations.
- **Tasks must reference concrete files** in `src/` (`bkit-install.ts`, `bkit-tiers.ts`, `bkit-preflight.ts`, `bkit-modules.ts`, `bkit-cli.ts`) and tests folder layout already in place.
- **DoD per task** — every task must have explicit acceptance criteria, verification steps, and observable artifacts.
- **No design doc available** — the plan should embed enough design rationale to be self-contained, especially the Tier-2 deep-merge mechanism (option-a `__bkit__` namespacing recommended) and the surgical-uninstall semantics (markers-as-SoT).
- **Constraint flags** — flag any cross-cutting concerns that may require human approval per the rules' "Major changes" bar.
