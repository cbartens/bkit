# Design Input — 160-centralise-install-code

## Session Prompt

`/bkit-design issue 160`

Original user request that created the issue:

> create a new gh issue to centralise and clean up all bkit install related code and templates and scripts into `.bkit/` root repo folder ... from here we copy and install into `.agents` (any cross agent/IDE files) as well as `.claude` and `.cursor` and `.github` `.husky` etc etc — not from `.agents` as it is today.

## Issue #160 — Centralise all install code, templates & scripts into a `.bkit/` root folder

**State:** open
**Labels:** enhancement, bkit:design
**Milestone:** Initial Version

### Description

## Problem

Today the install/upgrade **machinery** and the install **payload** both live under `.agents/`, intermixed with content that `.agents/` legitimately owns (rules, skills, docs, prompts, workflows). This conflates three distinct concerns:

1. **Install/upgrade engine** — TypeScript under `.agents/scripts/` (`bkit-install.ts`, `bkit-upgrade.ts`, `bkit-modules.ts`, `bkit-tiers.ts`, `bkit-manifest.ts`, `bkit-version.ts`, `bkit-cli.ts`, `bkit-trackers.ts`, `bkit-tokens.ts`, `bkit-preflight.ts`, `bkit-postinstall.ts`, `bkit-uninstall.ts`).
2. **Install payload / templates** — `.agents/templates/**`, which contains files destined for the consumer's `.agents/`, `.claude/`, `.cursor/`, `.github/`, `.husky/`, plus root dotfiles (`.gitignore`, `.gitattributes`, `.mcp.json`, `.envrc`, `.vale.ini`, etc.).
3. **`.agents/`'s own content** — rules, skills, docs, prompts, workflows that bkit _uses_ as a tool, not just ships.

Because `.agents/` is simultaneously "the thing we install", "the thing we install _from_", and "the thing bkit runs against itself" (dogfooding), the boundaries are blurry. In particular: cross-agent / IDE template files (`.claude`, `.cursor`, `.github`, `.husky`, root dotfiles) live under `.agents/templates/` today, which is non-obvious — they aren't `.agents` content at all.

## Goal

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

## Current architecture (for reference)

- **Engine**: `.agents/scripts/bkit-*.ts`, compiled to `dist/`, exposed via `bin.bkit → ./dist/bkit-install.js`. Verbs: `install`, `check`, `doctor`, `upgrade`, `uninstall`.
- **Payload pass** (`runPayload()` in `bkit-install.ts`): mirrors `.agents/workflows/bkit-*.md`, `.agents/prompts/bkit-*.md`, and `.agents/templates/**` from the installed package into the consumer. In **dogfood mode** (running inside the bkit repo) src == dst, so the payload pass is a no-op — a constraint any move must preserve.
- **Mirror/regen**: the `claude` and `cursor` modules regenerate `.claude/{commands,agents}/bkit-*.md` and `.cursor/{commands,agents}/bkit-*.md` from `.agents/{workflows,prompts}/bkit-*.md` (with tier transforms + tracker substitution).
- **Write tiers**: Tier 1 canonical / Tier 2 managed-block merge / Tier 3 seed-once (`bkit-tiers.ts`).
- **Drift detection**: `canonicalHashes` / `tier3Hashes` / `pinnedVersion` in `.agents/.bkit-version`.
- **Dotfile remap**: `.gitignore` shipped as `gitignore` (npm strips dotfiles) and renamed at install (`NPM_STRIP_REMAP`).
- **package.json** `files[]`: ships `dist/` + `.agents/` (excluding tests/snapshots). A move to `.bkit/` must update `files[]`, `bin`, and any `dist` path expectations.

## Scope / tasks (high-level — design will refine)

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

## Notes / constraints

- This is a structural refactor, not a behaviour change: installed output in consumer repos should be byte-identical before/after the move (verify via drift gates).
- Migration must be backward-compatible for consumers upgrading across the boundary (the upgrade engine reads paths recorded in their existing `.bkit-version`).
- Likely large enough to warrant a `/design` pass before planning/build.

### Comments

(none)
