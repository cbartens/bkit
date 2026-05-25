# Design: Centralise install code, templates & scripts into `.bkit/`

## Acceptance Scenario

### Narrative

A bkit maintainer opens the repo and finds all install machinery and payload under one obvious `.bkit/` root, while the repo's own `.agents/` looks exactly like an installed consumer's. A consumer who upgrades across this release sees no change at all — their `.agents/`, `.claude/`, `.cursor/`, `.github/`, `.husky/` and root dotfiles are written with byte-identical content to before.

### Success Criteria

- Install/upgrade engine lives under `.bkit/src/`; the full install payload (including `.claude`/`.cursor`/`.github`/`.husky` and root dotfiles) lives under `.bkit/templates/`; `.agents/` no longer contains any install source.
- A packed-tarball install AND upgrade into a clean consumer dir produce `.bkit-version` `canonicalHashes`/`tier3Hashes` identical to a pre-refactor baseline (byte-identical consumer output).
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

- `getPkgRoot()` — extend the suffix special-case from `.agents/scripts` to `.bkit/src` so the source-tree run-context (`tsx` dev/test) still resolves the package root. The `dist/` arm (`scriptDir/..`) is **untouched** — that is the arm consumers actually run.
- `getTemplatesRoot()` (new) — the _only_ place `.bkit/templates` is encoded: `path.join(getPkgRoot(), ".bkit", "templates")`. Every inline `path.join(PKG_ROOT, ".agents", "templates", …)` becomes `path.join(getTemplatesRoot(), …)`.
- `isDogfood()` (new) — `getPkgRoot() === process.cwd()`. Replaces the implicit `src === dst` path-equality coincidence (see Components / Flows).

`getPkgRoot()` has **three run-contexts** that all must keep working — this is the single highest-leverage failure surface (a change can pass CI, which builds `dist/`, yet break `tsx`-from-source dev/test, or vice versa):

1. consumer running `dist/bkit-install.js` → `scriptDir.../dist` → `scriptDir/..`
2. bkit repo running engine via `tsx` from `.bkit/src/` → `scriptDir.../.bkit/src` → `scriptDir/../..`
3. packed tarball installed into a clean dir → same as (1)

### Build / packaging boundary

- `tsconfig.json`: `rootDir` and `include` move from `.agents/scripts` → `.bkit/src`; `exclude` `.agents/skills` reference is dropped (skills stay in `.agents/` but are not TS sources — the `**/*.test.ts` exclude is retained). `outDir: dist` is **unchanged** → `dist/` stays flat at repo root, `bin: ./dist/bkit-install.js` is **unchanged** (no consumer re-config, `check:dist` gate keeps working).
- `package.json` `files[]`: drop `".agents"` as an install source; add `".bkit"`. Test/snapshot exclusions re-target `!.bkit/src/*.test.ts` etc. bkit's own `.agents/` runtime is NOT shipped in the tarball (it never was as content — only `.agents/templates/**` and `.agents/{workflows,prompts}/bkit-*.md` shipped; workflows/prompts ship as the payload-pass source and must remain in the tarball — see Open Questions).
- `package.json` scripts: `lint:no-tier-terms` path `.agents/scripts/bkit-lint-no-tier-terms.ts` → `.bkit/src/bkit-lint-no-tier-terms.ts`; the `lint:prose` `find .agents/scripts` reference is reviewed.
- `NPM_STRIP_REMAP` (`gitignore`→`.gitignore`, `npmignore`→`.npmignore`, `bkit-install.ts:577`) is **unchanged** and still applies under `.bkit/templates/`. npm strips `.gitignore`/`.npmignore` by basename anywhere in the tree, so the templates must continue to store them dot-less; `files[]` + tarball-content verification must confirm `.bkit/templates/gitignore` actually ships.

## Data Model

No schema changes. The consumer's `.agents/.bkit-version` is the data contract that anchors the byte-identical guarantee.

- `pinnedVersion: string`, `tier3Hashes: Record<path, sha256>`, `canonicalHashes: Record<path, sha256>` (`bkit-version.ts:37-60`).
- **Keys are consumer-relative DESTINATION paths** (e.g. `.github/workflows/ci.yml`, `.claude/agents/bkit-foo.md`) — they do NOT encode the package-internal source tree. Because this refactor changes only the source location and leaves every destination path identical, **no `.bkit-version` migration is needed**. Treating it as a migration would be solving a non-problem and risks corrupting valid pins.
- This is also the verification oracle: a packed-tarball install/upgrade into a clean dir must produce `canonicalHashes`/`tier3Hashes` identical to a pre-refactor baseline. Capture that baseline BEFORE moving anything.

## Components / Flows

### Dogfood no-op preservation (the crux)

Today the no-op is **implicit and accidental**: `runPayload()` skips a subtree when `path.resolve(srcDir) === path.resolve(dstDir)`. In the bkit repo, `PKG_ROOT` resolves to the repo root, so `PKG_ROOT/.agents/templates` literally equals `<cwd>/.agents/templates` and the mirror copies nothing.

After templates move to `.bkit/templates/`, the source becomes `<repo>/.bkit/templates/**` while the equivalent destination is `<repo>/.agents/**` — they are no longer equal, so the path-equality guard stops firing. Left unfixed, an in-repo `bkit install` would start copying `.bkit/templates/.agents/` over the repo's live `.agents/`, a self-overwrite that can silently break the byte-identical guarantee.

**Resolution — split the no-op into two distinct mechanisms, because the two payload arms behave differently after the move:**

1. **Workflows / prompts arm** (`runPayload()` lines 639-658): src is `PKG_ROOT/.agents/{workflows,prompts}`, dst is `<cwd>/.agents/{workflows,prompts}`. Because bkit's own workflows/prompts **stay in `.agents/`**, these paths are still identical in the bkit repo — the existing `src === dst` skip continues to hold **unchanged**. No new guard needed for this arm. This is the direct payoff of drawing the line where Lens 3 draws it.

2. **Templates arm** (`runPayload()` lines 660-666): src moves to `getTemplatesRoot()` = `<repo>/.bkit/templates`; there is **no longer any consumer-side `.agents/templates`** to mirror into (templates live in `.bkit/` and are never copied into a consumer's `.agents/`). This arm becomes **dead code and is deleted entirely** — a net simplification, not a relocation. (The template _content_ still reaches consumers via the module install pass / `runCoreTemplates` reading from `getTemplatesRoot()`, which is unaffected.)

3. **Defence-in-depth:** add an explicit `isDogfood()` (`getPkgRoot() === process.cwd()`) predicate and a guard that short-circuits any future payload copy in the bkit repo, plus an integration test asserting in-repo `bkit install` is a zero-write no-op for `.agents/`. This makes the invariant correct-by-construction rather than dependent on the path-equality coincidence.

### Install flow (unchanged behaviour, re-pointed source)

`runInstall` → preflight → per-module passes (`runCoreModule`, claude/cursor mirror, github/husky/renovate/dependabot) → `runPayload` → write `.bkit-version`. Every module's `path.join(PKG_ROOT, ".agents", "templates", …)` lookup is re-pointed to `getTemplatesRoot()`. The claude/cursor mirror's cwd-relative `.agents/{workflows,prompts}` reads are **untouched** (they read from the consumer's installed `.agents/`, which the payload pass has already populated).

### Upgrade flow (separate engine — must be verified independently)

`runUpgrade` walks template candidates from `tplRoot = path.join(getPkgRoot(), ".bkit", "templates")` (was `.agents/templates`, `bkit-install.ts:736`), then diffs against the consumer's `canonicalHashes`. Backward-compat for in-flight consumers is intact: the upgrade reads paths recorded in their existing `.bkit-version`, which are destination paths, unaffected by the source move. The package-internal `tplRoot` change is transparent to the consumer.

### Hard-exit guards

Keep the existing "package corrupt?" guard pattern. `bkit-modules.ts:359` hard-exits when `PKG_AGENTS` is absent; add an equivalent **fail-loud** guard when `getTemplatesRoot()` does not exist, so a missed/mis-resolved path fails noisily instead of silently skipping templates (the `if (fs.existsSync(...)) ` guards otherwise turn a missing source into a silent no-write → consumer drift). Extend `bkit doctor` (read-only) to print the resolved templates root for 3am diagnosability.

### Authoring rule + docs updates

- `.agents/rules.md` § "bkit Repo Authoring" (line 102): the two-way sync rule `.agents/rules.md ↔ .agents/templates/.agents/rules.md` re-points to `.agents/rules.md ↔ .bkit/templates/.agents/rules.md`. The concept is unchanged; the path lengthens. The block gains the central principle: "install source of truth lives in `.bkit/`; bkit's own agent runtime lives in `.agents/` exactly as a consumer's does."
- Prose doc-drift surfaces that no gate catches: grep `\.agents/(templates|scripts)` across `docs/`, `README.md`, `.agents/docs.md`, `.agents/workflows.md` and update references. Inventory this as explicit scope.
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
| `files[]` ships `.bkit` + `dist`; drop `.agents` as install source | Keep shipping `.agents` for a back-compat fallback | Payload lives entirely under `.bkit/templates/`; shipping `.agents` too re-creates the dual-source ambiguity #160 exists to remove. `NPM_STRIP_REMAP` is unchanged and still applies under `.bkit/templates/`. |
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

- **Byte-identical is verified by `.bkit-version` hashes, not eyeballing.** Pass/fail oracle: packed-tarball install AND upgrade (separate engines) into a clean dir produce identical `canonicalHashes`/`tier3Hashes` to a baseline. **Capture the baseline BEFORE moving anything.** Add a dry-run-parity CI gate: `bkit install --dry-run` diff must be empty on a clean consumer clone before/after.
- **Dual run-context resolution (`dist/` vs `tsx` source vs packed tarball) is the highest-leverage failure.** A move can pass CI (which builds `dist/`) yet break dev (`tsx` from `.bkit/src/`). Add a `tsx`-context dogfood integration test (not `dist/`-only). Derive the `getPkgRoot` suffix from a shared constant so it cannot drift from `rootDir`. Add a header comment block in `bkit-paths.ts` enumerating the three run-contexts and which arm each hits — the single most important doc artifact of the refactor (bus-factor mitigation).
- **`files[]` + `.npmignore` + `gitignore`→`.gitignore` strip remap must move together.** Verify packed tarball _contents_ (`npm pack` → list), not just that it builds — confirm `.bkit/templates/gitignore` actually ships, else upgrade silently skips it and consumers drift.
- **Missed/mis-resolved source path → silent template skip.** Grep all `\.agents.*templates` literals to zero; add a fail-loud "templates root not found" guard mirroring the existing `bkit-modules.ts:359` "package corrupt?" hard-exit.
- **Snapshot key regeneration** in `__snapshots__/bkit-templates.content.test.ts.snap` (the describe label embeds `.agents/templates/.github/workflows/ci.yml`). Cosmetic; regenerate via `--update-snapshots` and review the diff.
- **Test path-constant churn** across `bkit-templates.content.test.ts`, `bkit-modules.test.ts`, `bkit-modules.integration.test.ts` (incl. the hardcoded `path.resolve(SCRIPTS_DIR, "..", "..")` PKG_ROOT derivation at line 866), `bkit-modules.upgrade.integration.test.ts`, `bkit-tiers.test.ts`, `bkit-release-workflow.test.ts`, `bkit-install.test.ts`, `bkit-templates.test.ts` — 12+ constants. Mechanical but per-constant verification required (this is the bulk of the work).
- **Prose doc-drift** in `docs/`, `README.md`, `.agents/docs.md`, `.agents/workflows.md` referencing `.agents/templates`/`.agents/scripts` — no gate catches these; inventory via grep as explicit scope.

### Open Questions

- **Do bkit's own `.agents/{workflows,prompts}/bkit-*.md` still ship in the tarball?** They are the payload-pass source (`runPayload` reads them from `PKG_ROOT/.agents/{workflows,prompts}`). With `files[]` dropping `.agents`, the tarball must still carry these specific files (and only the `bkit-*` prefixed ones). Resolve in planning: either keep a narrow `.agents/{workflows,prompts}/bkit-*.md` glob in `files[]`, or relocate the payload-pass source for workflows/prompts under `.bkit/` too while keeping the dogfood copies in `.agents/`. **This is the one place the clean "line" needs a precise `files[]` rule — do not assume `.agents` can be dropped wholesale.**
- **Retire the manual `rules.md` two-way sync via a CI byte-equality assertion?** A gate asserting the managed block of bkit's own `.agents/rules.md` byte-equals `.bkit/templates/.agents/rules.md` would eliminate the fragile manual sync. Independent of this refactor but cheaply bundled. Defer/confirm in planning.
- **`outDir` final home.** Design keeps `dist/` flat at repo root for this release. Whether `.bkit/dist/` is ever desirable is explicitly out of scope (orthogonal to centralisation; would change `bin`).

### Assumptions

- pnpm always writes a fresh `node_modules` on install, so no partially-cached mix of old `.agents/` + new `.bkit/` source can occur in a consumer (removes the staged-migration edge case).
- No consumer tooling references the package-internal `.agents/templates` or `.agents/scripts` paths directly (only destination paths in `.bkit-version`).
