<!-- Archived plan — original location was `docs/plans/drafts/` → `docs/plans/active/` → here. -->

# bkit npm Package — BAR-111 Implementation Plan (trimmed, manual)

> [!IMPORTANT]
> **STATUS: SHIPPED 2026-05-04 as `@cbartens/bkit@v0.1.1`** — distributed as a git dependency from `github.com/cbartens/bkit` (private repo), **not** via the npm registry.
>
> **Deviations from the original plan:**
>
> - **Distribution model:** switched from public npm publish (success criterion 1) to git-dep from a private GitHub repo. Public npm wasn't desired; npm private packages cost money; GitHub Packages adds consumer config; git-dep is free + native to existing GitHub auth.
> - **Scope rename:** `@bartens/bkit` → `@cbartens/bkit`. The `bartens` npm scope was fictional; renamed to match the GitHub identity (`cbartens`) since git-dep distribution doesn't need a real npm scope.
> - **`upgrade` verb dropped** — folded into `install`. Three-pass install (payload + host + templates) is the universal sync; `pnpm update @cbartens/bkit && pnpm exec bkit install` replaces what `upgrade` would do.
> - **bkit-prefix ownership rule** added: bkit owns `bkit-*` files in `.agents/{workflows,prompts}/` and `.{claude,cursor}/{agents,commands}/`; non-prefixed files in those dirs are project-managed and never touched.
> - **Templates pass case 3a** added: when dest has no markers but template has a managed block, append the block at EOF (preserve existing content above).
>
> **Tags:**
>
> | Tag            | Commit    | Status                                                                                               |
> | -------------- | --------- | ---------------------------------------------------------------------------------------------------- |
> | `v0.1.0-pre.1` | `185be73` | broken historical (predates `prepare` script + scope rename)                                         |
> | `v0.1.0`       | `fb34d28` | canonical post-rename pin                                                                            |
> | `v0.1.1`       | `da1bdee` | current — UX patch (help default, `.agents/` guard, `[bkit-check]` log prefix, host-pass log parity) |
>
> **Smoke verified end-to-end** in `www-visitfrasercoast-com` against both `#v0.1.0` and `#v0.1.1` (per BAR-111 comments `280637c9` + post-`v0.1.1` confirm). Consumer-side `bkit init` + idempotent `bkit install` + `bkit check` (exit 0) all green. Sub-plan B (consumer migration) effectively closed by this smoke; the explicit migration runbook in `app-gether-life/docs/plans/drafts/bar-111-bkit-npm-package-plan-2.md` remains as historical record.
>
> **Sub-plans B (consumer migration in `app-gether-life`) and C (second-repo smoke + 0.1.x upgrade) remain in `app-gether-life/docs/plans/drafts/` and are owned by their respective repos** — out of scope for this bkit-side plan.

> [!CAUTION]
> **CRITICAL:** Do not hallucinate plan execution state. Source of truth is the literal `[x]` vs `[ ]` checkboxes in this file.
>
> **Mode:** Manual runbook. The `/bkit-build` orchestrator is NOT used for v0.1.0 — too much ceremony for a greenfield repo. Claude executes tasks in-chat, commits per phase.
>
> **Supersedes:** `bar-111-bkit-npm-package-plan-1.md` (sub-plan A — producer). Sub-plans `-2.md` (consumer migration) and `-3.md` (smoke + 0.1.1) live in other repos and are out of scope for this runbook.

## Context & Goals

Phase B of agent-stack consolidation: extract canonical `.agents/` payload from `app-gether-life` into the standalone `bkit` repo, package as `@bartens/bkit`, and publish `0.1.0` to npm so downstream repos consume via `pnpm dlx @bartens/bkit init`.

This plan is a **trimmed, single-repo runbook**. It absorbs the executable parts of the original sub-plan A and drops the heavy vitest test matrix, eslint, tsup, turbo, and the cross-repo phases — all of which were inherited from the `app-gether-life` plan template and are unnecessary for a greenfield Node CLI v0.1.0.

**Success Criteria:**

- `npm view @bartens/bkit version` returns `0.1.0`.
- `pnpm dlx @bartens/bkit@0.1.0 init` in a fresh empty repo creates `.agents/`, `.claude/`, `.cursor/`, `CLAUDE.md`, `AGENTS.md`, `.gitignore`, `.cursor/rules/00-shared-rules.mdc`, `.agents/.bkit-version`.
- `pnpm dlx @bartens/bkit@0.1.0 install` (re-run) yields empty `git diff` against the prior state.
- `pnpm dlx @bartens/bkit@0.1.0 check` exits 0 when in sync, non-zero with diff summary when drifted.

---

## Acceptance Scenario

> Human gates approved (per chat 2026-05-04): Narrative, Success Criteria, and Breaking Changes treated as confirmed for v0.1.0.

**Narrative.** Maintainer runs `pnpm dlx @bartens/bkit init` in a fresh repo and gets a working `.agents/` + `.claude/` + `.cursor/` setup, plus seeded `.gitignore`, `CLAUDE.md`, `AGENTS.md` redirect files. Re-running `install` yields zero git diff. After a `pnpm update @bartens/bkit`, re-running `install` refreshes the bkit-canonical content (everything in `.agents/{workflows,prompts}/bkit-*.md` and `.agents/templates/`) while preserving project customisations. `check` exits non-zero when generated output drifts from the pinned payload.

**Concrete Example.**

**Setup:** Maintainer on macOS, fresh git repo at `~/sandbox/test-repo`, Node 20+, pnpm 9+, `npm whoami` → `bartens`.

**Steps:**

1. `cd ~/sandbox/test-repo && pnpm dlx @bartens/bkit@0.1.0 init` → CLI creates the agent stack and pin file. Prints summary.
2. Run again → no new git diff.
3. Add a project bullet under `## Project Rules` in `.agents/rules.md` (outside `<!-- bkit:start -->` markers); run `install` → bullet preserved; managed block regenerated unchanged.
4. `pnpm dlx @bartens/bkit@0.1.0 check` → exit 0, prints `OK: pinned 0.1.0, no drift`.

### Edge Cases

| Scenario                                                                           | Expected Behavior                                                                                                                          |
| ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `init` re-run on a repo that already has `.agents/`                                | Additive only. No overwrites inside `.agents/`. Logs `[skip]`/`[add]` per file.                                                            |
| `install` when `.agents/` is missing                                               | Exit 1, message `not initialized — run bkit init first`.                                                                                   |
| `install` when user has files outside generator paths                              | Untouched.                                                                                                                                 |
| New version of `@bartens/bkit` adds a workflow `.agents/workflows/bkit-foo.md`     | Install's payload pass overwrites + adds it; mirrored to host dirs.                                                                        |
| New version of `@bartens/bkit` removes a workflow                                  | Install's payload pass prunes the orphan from `.agents/{workflows,prompts}/` (only `bkit-*.md` files; non-prefixed files preserved).       |
| Consumer adds `.agents/workflows/my-cmd.md` (no `bkit-` prefix)                    | Preserved on every install. Not mirrored to `.{claude,cursor}/commands/` either — bkit only manages the `bkit-` namespace.                 |
| Consumer edits `.agents/workflows/bkit-build.md`                                   | Overwritten on next install (bkit IP). Customisations belong in `## Project Rules` of `.agents/rules.md` or in non-prefixed sibling files. |
| `check` drift                                                                      | Exit non-zero, print path-by-path diff summary, instruct `bkit install`.                                                                   |
| `check` when `.agents/.bkit-version` missing                                       | Exit non-zero with `not initialized` message.                                                                                              |
| `## Project Rules` outside `<!-- bkit:start -->`/`<!-- bkit:end -->` in `rules.md` | Always preserved across `init` and `install`.                                                                                              |
| Existing `.gitignore` without bkit markers                                         | Append managed block at EOF; preserve all prior content.                                                                                   |
| Existing `.gitignore` with bkit markers                                            | Regen content between markers only; preserve outside.                                                                                      |
| Cursor T3 unknown agent name                                                       | Fail-fast with explicit `model lookup miss for {agent}` — do NOT default-substitute.                                                       |

### Naming (decided facts)

| Concern                   | Decision                                                                                     |
| ------------------------- | -------------------------------------------------------------------------------------------- |
| Package name              | `@bartens/bkit`                                                                              |
| Repo                      | `https://github.com/cbartens/bkit` (on disk `~/Documents/GitHub/bkit`)                       |
| CLI binary                | `bkit`                                                                                       |
| Version pin file          | `.agents/.bkit-version`                                                                      |
| Managed-block markers     | `<!-- bkit:start -->` / `<!-- bkit:end -->` (inside `.gitignore` etc., prefixed with `# `)   |
| Top-level repo dirs       | `agents/`, `hosts/`, `templates/` (project-root tmpls + `templates/<host>/` subdirs), `cli/` |
| Subagent prompt dir       | `agents/prompts/` (NOT `subagents/`)                                                         |
| Workflow dir              | `agents/workflows/` (NOT `commands/`)                                                        |
| Initial published version | `0.1.0`                                                                                      |

---

## Out of Scope (this plan)

- **Vitest test suite.** No `vitest.config.ts`, no `*.test.ts`, no `*.integration.test.ts`. Quality gate is `tsc --noEmit` + manual `pnpm pack` smoke (Phase 6). Test harness deferred to v0.2.x once CLI shape stabilises.
- **ESLint.** No `.eslintrc`, no lint script. TS strict catches the 90% case.
- **tsup / bundler.** Plain `tsc` to `dist/` is enough for a Node-only CLI.
- **turbo.** Single-package repo, no monorepo task graph.
- **`prepublishOnly` test runner.** `prepublishOnly` runs `tsc` only.
- **GitHub Actions CI.** Recommended later; tracked in `docs/pending.md` after Phase 7.
- **`bkit eval`.** Not even a placeholder dir for v0.1.0.
- **Consumer migration (`app-gether-life`).** Separate plan, separate repo.
- **Second-repo smoke + `0.1.1` publish.** Separate plan, separate repo.
- **`{{TOKEN}}` template substitution.** v0.1.0 ships templates literal.
- **`upgrade` verb.** Folded into `install`. After `pnpm update @bartens/bkit`, run `install` to refresh bkit-canonical content. No three-way merge, no `.bkit-cache/`, no cold-start fallback. Customisations go in `## Project Rules` (preserved by managed-block logic) or in non-`bkit-`-prefixed sibling files (left alone by the prefix-filter rule).
- **`cursorModelByAgent` parity gate.** Hand-maintained for v0.1.0; manual review on changes.
- **`bkit install --ci` flag.** Future.

## Pre-flight

- [x] `node --version` ≥ 20; `pnpm --version` ≥ 9.
- [x] `npm whoami` returns `bartens`. `npm access list packages @bartens` does not error.
- [x] Write access to `~/Documents/GitHub/bkit/` and read access to `~/Documents/GitHub/app-gether-life/.agents/` (source payload) and `~/Documents/GitHub/app-gether-life/.gitignore` (template source).
- [x] Source payload has the canonical names — `app-gether-life/.agents/prompts/` exists (NOT legacy `subagents/`); `app-gether-life/.agents/workflows/` exists (NOT legacy `commands/`). Abort if absent — do not silently fall back.

## Topology (target after Phase 5)

```
bkit/
├── agents/                          # canonical .agents/ payload (shipped)
│   ├── {rules,docs,workflows,IDEs,skills,friction}.md
│   ├── workflows/bkit-{design,plan,build,debug,ship,worktree-sync,worktree-prune}.md
│   ├── prompts/bkit-*.md            # all subagent prompts
│   └── skills/                      # if non-empty in source
├── hosts/
│   ├── claude.ts                    # passthrough — path map only
│   └── cursor.ts                    # T1 + T2 + T3 + cursorModelByAgent
├── templates/
│   ├── .gitignore.tmpl              # project-root → <cwd>/.gitignore (managed-block, host-agnostic)
│   ├── CLAUDE.md.tmpl               # project-root → <cwd>/CLAUDE.md (Claude redirect)
│   ├── AGENTS.md.tmpl               # project-root → <cwd>/AGENTS.md (Cursor redirect)
│   ├── claude/{settings.json.tmpl, hooks/preflight.sh}
│   └── cursor/{rules/00-shared-rules.mdc.tmpl, Dockerfile, environment.json.tmpl, settings.json.tmpl, hooks.json.tmpl, hooks/{preflight,postflight}.sh}
├── cli/
│   ├── bin.ts                       # verb dispatch
│   ├── init.ts
│   ├── install.ts
│   ├── upgrade.ts
│   ├── check.ts
│   └── managed-block.ts
├── package.json                     # name=@bartens/bkit, bin.bkit, files=[dist, agents, templates, README.md, LICENSE]
├── tsconfig.json
├── README.md
├── LICENSE
├── .gitignore                       # MUST include tmp/, dist/, node_modules/
├── .npmignore
└── .agents/, .claude/, .cursor/     # bkit's own dogfood (already present in repo)
```

## Architecture details

### `hosts/claude.ts` (passthrough)

Pure data. Maps canonical `agents/` paths → Claude target paths (`.claude/agents/`, `.claude/commands/`, `.claude/settings.json`, `.claude/hooks/`). No transform functions.

### `hosts/cursor.ts` (T1 / T2 / T3)

- **T1** — strip frontmatter from `agents/workflows/*.md` before writing to `.cursor/commands/`.
- **T2** — command-body invocation transform inside `**Subagent:**` lines: `Agent`→`Task`; `@<name>`→`/<name>`. Outside `**Subagent:**` lines: untouched (npm scopes, emails, etc.).
- **T3** — subagent frontmatter rewrite: drop `effort` / `permissionMode` / `maxTurns`; keep `name` / `description` / `tools` / `model`; resolve `model:` via `cursorModelByAgent: Record<string, string>` (hand-written for v0.1.0). Never emit `readonly:`.
- T3 unknown name → throw with explicit `model lookup miss for {agent}`.
- Tool name allowlist passthrough (`Read, Grep, Glob, Write, Edit, Bash, WebFetch, WebSearch`).

### CLI verbs

Three verbs: `init`, `install`, `check`. No `upgrade` — folded into `install`.

- **`init`** — first-time bootstrap. Additive copy of packaged `.agents/` → `<cwd>/.agents/` (skip-if-exists), excluding `skills/`, `scripts/`, `README.md`. Writes `<cwd>/.agents/.bkit-version` (= running CLI's `package.json#version`). Calls `install` at end.
- **`install`** — universal sync. Three passes:
  1. **Payload pass** — mirror `<pkg>/.agents/{workflows,prompts}/bkit-*.md` and `<pkg>/.agents/templates/**` into `<cwd>/.agents/`. Overwrite-always for these subtrees. Prune `bkit-*.md` orphans in `.agents/{workflows,prompts}/`. **Filter is bkit-prefix only — non-prefixed `.md` files in `.agents/{workflows,prompts}/` are project-managed and never touched.**
  2. **Host pass** — regen `.claude/{commands,agents}/bkit-*.md` (byte-identical from `.agents/{workflows,prompts}/`) and `.cursor/{commands,agents}/bkit-*.md` (after T1/T2/T3 transforms). **Same bkit-prefix filter on both write and prune.** Consumer's non-prefixed files in those host dirs preserved.
  3. **Templates pass** — walk `<cwd>/.agents/templates/` and apply per-file rules (case 1: write verbatim if dest missing; case 2: update managed block if dest has markers; case 3a: append managed block at EOF if dest no markers and template has block; case 3b: no-op).
- **`check`** — dry-run install. Iterates the same three passes, reports would-be writes/deletes, exits non-zero on any drift. No tempdir.

The `bkit-` prefix rule cleanly separates ownership: bkit owns `bkit-*` files in the six bkit-managed dirs (`.agents/{workflows,prompts}`, `.{claude,cursor}/{agents,commands}`); consumer owns everything else inside those dirs.

### Managed-block helpers (`.agents/scripts/bkit-install.ts`)

Existing helpers — already shipped, no separate file to author:

- `extractManagedBlock(content)` → inner content between markers (markers stripped).
- `extractFullManagedBlock(content)` → full block including marker lines (used to append on case 3a).
- `updateManagedBlock(filePath, newContent, dryRun)` → in-place block update.

Marker prefix is **auto-detected** from the marker line context (`""`, `"# "`, `"// "`). No `commentPrefix` opt needed.

### `package.json` (target shape)

```jsonc
{
  "name": "@bartens/bkit",
  "version": "0.1.0",
  "type": "module",
  "bin": { "bkit": "./dist/bin.js" },
  "main": "./dist/bin.js",
  "files": ["dist", "agents", "templates", "README.md", "LICENSE"],
  "engines": { "node": ">=20" },
  "scripts": {
    "build": "tsc",
    "typecheck": "tsc --noEmit",
    "prepublishOnly": "tsc",
  },
  "devDependencies": {
    "typescript": "^5.x",
    "@types/node": "^20.x",
  },
  "dependencies": {
    "mri": "^1.x",
  },
  "publishConfig": { "access": "public" },
}
```

### `templates/.gitignore.tmpl` (proposed contents)

Curated from `app-gether-life/.gitignore` with project-specific entries dropped (Next.js, vercel, GCP service-account keys, vale, slop-scan, migration assets) and bkit-specific entries added (`*.tgz`, `.bkit/tmp/`). The bkit-managed block sits at the EOF; consumers add project-specific entries above it.

```gitignore
# (consumer-specific entries above this line — preserved across upgrades)

# <!-- bkit:start -->
# Managed by @bartens/bkit — do not edit between markers

# Dependencies
node_modules/
.pnpm-store/

# Build outputs
dist/
build/
.cache/
*.tsbuildinfo
.turbo/

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# Env / secrets (force-allow .env.example)
.env
.env.*
!.env.example
*.pem
*.key

# OS / editor
.DS_Store
Thumbs.db
*.swp

# Tmp / pack artifacts
tmp/**
*.tgz

# bkit workflow artifacts
.worktrees/
.bkit/tmp/
docs/plans/logs/**/raw/
docs/plans/logs/**/.lock
# <!-- bkit:end -->
```

**Open question on contents:** see § Open questions. The above is a starting point; final list is reviewed before Phase 5.1.

### `.npmignore` (bkit's own, not the template)

Belt-and-braces alongside `package.json#files` whitelist. List `cli/`, `hosts/`, `*.ts`, `tsconfig.json`, `tmp/`, `.agents/`, `.claude/`, `.cursor/`, `docs/`, `.github/`.

---

## Runbook

> Manual execution. Each phase ends with one commit. Phase boundaries = review points.

### Phase 1 — Scaffold

- [x] **1.1** `cd ~/Documents/GitHub/bkit && pnpm init`. Edit `package.json` to match § package.json target shape.
- [x] **1.2** Add devDeps: `pnpm add -D typescript @types/node`. Add dep: `pnpm add mri`.
- [x] **1.3** Write `tsconfig.json` (strict, `target=ES2022`, `module=NodeNext`, `moduleResolution=NodeNext`, `outDir=dist`, `rootDir=.`, includes `cli/**/*.ts` + `hosts/**/*.ts`). Write `.gitignore` for the bkit repo itself (`dist/`, `node_modules/`, `tmp/`, `.DS_Store`, `*.tgz`). Write `.npmignore`. Write `LICENSE` (MIT, © Christian Bartens). Write `README.md` (stub; full content in 5.4).
- [x] **1.4** Stub `cli/bin.ts` with `#!/usr/bin/env node` + `console.log("bkit");`. Run `pnpm build` → expect `dist/bin.js`. Run `node dist/bin.js` → prints `bkit`. Restore `cli/bin.ts` to empty for Phase 4.
- [x] **1.5** Commit: `feat(bar-111): scaffold bkit package`.

### Phase 2 — Copy `.agents/` payload

- [x] **2.1** `mkdir -p agents/{workflows,prompts,skills}`. Copy from `~/Documents/GitHub/app-gether-life/.agents/`:
  - root `.md` files (`rules.md`, `docs.md`, `workflows.md`, `IDEs.md`, `skills.md`, `friction.md`) → `agents/`.
  - `workflows/*.md` → `agents/workflows/`.
  - `prompts/*.md` → `agents/prompts/` (verify source dir is `prompts/`, not legacy `subagents/`; abort if missing).
  - `skills/` → `agents/skills/` if non-empty in source.
- [x] **2.2** Sanitise `agents/rules.md`: confirm `## Project Rules` is empty / placeholder (`<!-- consumer-specific bullets here -->`). bkit-managed bullets stay inside `<!-- bkit:start -->`/`<!-- bkit:end -->`.
- [x] **2.3** Sanitise `agents/friction.md`: keep header + markers; clear body entries.
- [x] **2.4** Verify managed-block markers in `rules.md`, `docs.md`, `skills.md`, `friction.md`: `grep -l 'bkit:start' agents/`.
- [x] **2.5** Commit: `feat(bar-111): copy canonical agents payload`.

### Phase 3 — Hosts

- [x] **3.1** Implement `hosts/claude.ts` — pure path map. Export `claudeTargets`.
- [x] **3.2** Implement `hosts/cursor.ts` — T1 + T2 + T3 + `cursorModelByAgent` map. Hand-list every agent in `agents/prompts/` with its model.
- [x] **3.3** `pnpm typecheck` clean.
- [x] **3.4** Commit: `feat(bar-111): claude + cursor host transforms`.

### Phase 4 — CLI verbs

- [x] **4.1** Implement `cli/bin.ts` — `mri`-based verb dispatch. Recognised: `init`, `install`, `upgrade`, `check`. Unknown → exit 1 with usage.
- [x] **4.2** Implement `cli/managed-block.ts` (incl. `commentPrefix` support for `.gitignore`).
- [x] **4.3** Implement `cli/install.ts` (incl. `.gitignore` regeneration from `templates/.gitignore.tmpl` via `commentPrefix='# '`).
- [x] **4.4** Implement `cli/init.ts`.
- [x] **4.5** Implement `cli/upgrade.ts` (with cold-start fallback; regenerates `.gitignore` managed block too).
- [x] **4.6** Implement `cli/check.ts` (with `<cwd>/tmp/` then `<cwd>/.bkit/tmp/` fallback chain — never `os.tmpdir()`).
- [x] **4.7** `pnpm build && pnpm typecheck` clean. `node dist/bin.js` (no args) → usage, exit 1. `node dist/bin.js init --help` → at minimum doesn't crash.
- [x] **4.8** Commit: `feat(bar-111): implement init/install/upgrade/check`.

### Phase 5 — Templates

- [x] **5.1** Populate `templates/.gitignore.tmpl` with the proposed contents in § Architecture (or revised after review). Verify markers use `# <!-- bkit:start -->` / `# <!-- bkit:end -->`.
- [x] **5.2** Populate `templates/claude/`: copy `~/Documents/GitHub/app-gether-life/.claude/{settings.json, hooks/preflight.sh}` as `*.tmpl` + write `CLAUDE.md.tmpl`. Strip project-specific values where literal substitution is unsafe — otherwise ship literal.
- [x] **5.3** Populate `templates/cursor/`: `AGENTS.md.tmpl`, `rules/00-shared-rules.mdc.tmpl`, `Dockerfile`, `environment.json.tmpl`, `settings.json.tmpl`, `hooks.json.tmpl`, `hooks/{preflight,postflight}.sh`. Same literal-vs-strip call.
- [x] **5.4** Write full `README.md`: install (`pnpm dlx @bartens/bkit init`), four CLI verbs (with examples), managed-block convention (incl. `# `-prefixed in `.gitignore`), version-pin file, supported hosts, how to add a new host (link to `agents/IDEs.md`), eval status (placeholder).
- [x] **5.5** Commit: `feat(bar-111): host templates + .gitignore template + README`.

### Phase 6 — Manual smoke (HARD GATE before Phase 7)

- [x] **6.1** `pnpm pack` → produces `bartens-bkit-0.1.0.tgz`.
- [x] **6.2** Create scratch dir: `mkdir -p tmp/smoke-1 && cd tmp/smoke-1 && git init`.
- [x] **6.3** `pnpm dlx file:../../bartens-bkit-0.1.0.tgz init`.
- [x] **6.4** Inspect output: `.agents/` populated; `.agents/.bkit-version` = `0.1.0`; `.agents/.bkit-cache/0.1.0/` populated; `.claude/` + `.cursor/` generated; `CLAUDE.md`, `AGENTS.md`, `.cursor/rules/00-shared-rules.mdc`, `.gitignore` contain bkit markers (the `.gitignore` markers `# `-prefixed).
- [x] **6.5** Pre-seed `.gitignore` with custom entries above the managed block; re-run `init` (or `install`) → custom entries preserved verbatim, managed block regenerated.
- [x] **6.6** Re-run `pnpm dlx file:../../bartens-bkit-0.1.0.tgz install` → `git status` shows no new diff.
- [x] **6.7** Add a bullet in `.agents/rules.md` `## Project Rules`. Re-run `install` → bullet preserved.
- [x] **6.8** `pnpm dlx file:../../bartens-bkit-0.1.0.tgz check` → exit 0.
- [x] **6.9** Edit a generated file in `.cursor/`. Run `check` → exit 1 with diff summary.
- [x] **6.10** Cleanup: `cd ~/Documents/GitHub/bkit && rm -rf tmp/smoke-1 bartens-bkit-0.1.0.tgz`.
- [x] **6.11** If any of 6.4–6.9 fail: fix in bkit, re-pack, re-run smoke. Do NOT proceed to Phase 7.

### Phase 7 — Publish

- [x] **7.1** Confirm `package.json` says `0.1.0`.
- [x] **7.2** `npm whoami` → `bartens`. (If not, `npm login`.)
- [x] **7.3** `git tag v0.1.0`.
- [x] **7.4** `pnpm publish --access public --no-git-checks`. 2FA OTP if prompted.
- [x] **7.5** `npm view @bartens/bkit version` → `0.1.0`.
- [x] **7.6** From an arbitrary dir: `pnpm dlx @bartens/bkit@0.1.0 --help` → works.
- [x] **7.7** `git push origin <branch> && git push origin v0.1.0`.
- [x] **7.8** Commit: `chore(bar-111): publish 0.1.0`.

## Rollback

| Axis        | Action                                                                                                                            |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Bad publish | `npm deprecate @bartens/bkit@0.1.0 "rolled back"`; if within 72h, `npm unpublish @bartens/bkit@0.1.0`; publish `0.1.1` reverting. |
| Bad code    | `git revert {COMMIT}` per phase commit.                                                                                           |

## Open questions (resolve before Phase 1)

- **Branch strategy.** Per user instruction: create `dev` branch after this plan is reviewed. v0.1.0 implementation lands on `dev`, then merged into `main` for the publish commit. Tag `v0.1.0` on `main`.
- **Templates literal vs `{{TOKEN}}`.** Default for v0.1.0: ship literal. Revisit in v0.2.x if any token has consumer-specific value baked in.
- **`.gitignore` template contents.** Curation in § Architecture is a starting point. Confirm before Phase 5.1: should we also include `coverage/`, `.nyc_output/` (vitest/jest convention)? `.idea/`, `.vscode/*.local` (editor)? `*.swo`? Drop or keep `.turbo/` if non-turbo consumers? Default = ship the curated list as-is; trim/extend on review.
- ~~`.gitignore` template location~~ — RESOLVED: `templates/.gitignore.tmpl` flat, alongside `CLAUDE.md.tmpl` and `AGENTS.md.tmpl` (project-root targets at `templates/` root; host-specific files in `templates/<host>/` subdirs).

---

## Notes on dropped scope (vs. original sub-plan A)

If you're reviewing this trim relative to `bar-111-bkit-npm-package-plan-1.md`, the deltas are:

- 19 vitest test files (unit + integration) → 0. Replaced by Phase 6 manual smoke.
- `vitest.config.ts`, `tsup.config.ts`, `.eslintrc*`, ESLint deps → all dropped.
- `tests/fixtures/`, `bkit/eval/` placeholder → dropped.
- `cursor.parity.test.ts` drift gate → manual review only.
- `prepublishOnly` test runner → only `tsc`.
- BAR-110 prerequisite check (Task 0.1) → assumed merged.
- Sub-plan B (consumer migration) and sub-plan C (smoke + 0.1.1) → out of scope for this repo; live in their target repos as separate plans.
- Gate 1 / Gate 2 / Gate 3 / Gate 4 ceremonial markup → dropped (manual run; review at phase commits instead).
- **Added beyond original sub-plan A:** `templates/.gitignore.tmpl` (new template), `.gitignore` redirect-file handling in `init`/`upgrade`, `commentPrefix` support in `managed-block.ts`.
