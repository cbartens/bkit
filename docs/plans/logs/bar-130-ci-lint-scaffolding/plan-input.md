# Plan Input — BAR-130

## Session Prompt

```
/bkit-plan bar-130
```

Workflow: Plan Feature (2/5). Generate plan in `docs/plans/drafts/` based on Linear issue BAR-130. No prior design draft (`docs/plans/drafts/bar-130-ci-lint-scaffolding-design.md` does not exist) — the Linear issue description below is comprehensive and serves as the design input.

## Linear Issue — BAR-130: CI lint etc scaffolding install optimisation

- **Status:** Todo → In Progress (set by Plan workflow Step 1)
- **Priority:** Medium
- **Project:** bkit / Initial Version
- **Assignee:** Christian Bartens
- **URL:** https://linear.app/bartens/issue/BAR-130/ci-lint-etc-scaffolding-install-optimisation

### Description

## Goal

Bring across CI/lint scaffolding from the seed (`app-gether-life`) that didn't make it into bkit during BAR-111 extraction, so consumers get a working gate stack out-of-the-box and bkit dogfoods its own discipline. Also absorbs blocking consumer-friction items #1 and #3 from BAR-131, plus the module-flag CLI surface, token substitution, and init-verb retirement absorbed from BAR-112.

Three scopes, one ship:

* **(A) bkit-the-repo gates its own PRs** — adds `ci.yml`, Vale, slop-scan, lint scripts to bkit itself.
* **(B) bkit-the-installer scaffolds the same stack into consumers** — extends `bkit-install.ts` with a three-tier file-ownership model and a module-flag CLI surface that handles greenfield AND existing files without clobbering consumer customizations.
* **(C) CLI redesign** — replaces `init` + `install` + `--host=` with a single `install` verb taking composable module flags (`--claude`, `--cursor`, `--ci`, `--lint`, `--git-hooks`, `--core`, `--full`).

Ships as `v0.1.2`. Old `init` verb and `--host=` flag kept as deprecation stubs through v0.1.x; removed in v0.2.

## Background

Audit comparing `bkit/` against seed `app-gether-life/` surfaced these gaps:

* `.github/workflows/` — bkit has zero CI.
* `.vale.ini`, `.vale/styles/House/` — prose lint config (write-good + House.LLMSlop) absent.
* `slop-scan.config.json` — anti-slop code lint config absent.
* `.cursor/hooks.json` — sessionStart/stop hook wiring absent.
* `.cursor/settings.json` — Cursor plugin allowlist absent.
* `.husky/` — pre-commit / pre-push absent.
* `.prettierignore` + prettier scripts absent.
* `package.json` lint scripts (`lint:prose`, `lint:slop`, `format:check`) absent — bkit only has `build/test/typecheck/prepare`.

`postflight.sh` (Stop-hook telemetry) stays **project-specific** — does NOT ship via bkit. Project owns its observability.

## Architecture: three-tier file ownership

Reality check: consumers are rarely greenfield. They already have a `ci.yml`, `.vale.ini`, `.husky/`, etc. with project-specific tweaks. Pure write-if-absent is too thin (consumer never gets bkit improvements); pure idempotent rewrite is too aggressive (clobbers consumer customizations). Versioned migrations or 3-way merge solve it correctly but are overkill for v0.1.2.

Solution: per-file ownership tier matching what each format and use case can support. `bkit-install.ts` already has the managed-block convention working for `.gitignore` and `rules.md` (markdown-comment markers `bkit:start` / `bkit:end`); we extend that pattern to the new files with format-specific marker syntax.

### Tier 1 — Fully managed

* **Semantics:** idempotent rewrite of whole file every install. Bkit owns 100%; consumer never edits.
* **Marker syntax:** none — whole file replaced.
* **Files:** `.cursor/hooks.json`, `.claude/hooks/preflight.sh`, `.cursor/hooks/preflight.sh`, `.vale/styles/House/**`.

### Tier 2 — Managed-block

* **Semantics:** bkit owns content between markers; consumer owns everything outside. File present without markers → append block at EOF. File absent → write whole file with block.
* **Marker syntax:** format-specific. Markdown-comment markers (`bkit:start` / `bkit:end` wrapped in `<!-- ... -->`) for markdown / `.gitignore`. Hash-comment markers (`# bkit:start` / `# bkit:end`) for YAML / INI / shell.
* **Files:** `.github/workflows/ci.yml`, `.vale.ini`, `.gitignore` (existing), `.husky/pre-commit`, `.husky/pre-push`, `.prettierignore`, `rules.md` (existing).

### Tier 3 — Seed-or-print

* **Semantics:** write if absent; if present, print suggested diff to stdout and exit clean. Used for formats that don't support comments.
* **Marker syntax:** none — file is JSON or stdout-only.
* **Files:** `slop-scan.config.json`, `.cursor/settings.json`, `package.json` script entries.

For `ci.yml` specifically: bkit owns one whole job (`bkit-gates`) inside the managed-block; consumer adds other jobs outside. Cleaner than mixing bkit steps and consumer steps inside one job.

## CLI surface

Single `install` verb replaces the current `init` + `install` triad. Module flags scope what gets installed. Multiple flags compose. No flags = `--full` = all modules.

**Verbs.**

* `bkit install` (with optional module flags) — idempotent install of selected modules. Default (no flags) installs all modules. Replaces both old `init` and old `install` verbs.
* `bkit check` (with optional module flags) — dry-run of `install` with the same flags. Exits non-zero if any module would write.
* `bkit help` — usage + module list.

**Module flags.**

* `--full` — explicit alias for all modules. Equivalent to no flags. Useful for self-documenting CI scripts.
* `--core` — `.agents/` payload + `.gitignore` block + `rules.md` block + `.bkit-version`. Implicit dep of every other module.
* `--claude` — Claude Code host. Includes `.claude/agents/`, `.claude/commands/`, `.claude/hooks/preflight.sh`, `.claude/settings.json`. Replaces old `--host=claude`.
* `--cursor` — Cursor host. Includes `.cursor/agents/`, `.cursor/commands/`, `.cursor/hooks/preflight.sh`, `.cursor/hooks.json`, `.cursor/settings.json`. Replaces old `--host=cursor`.
* `--ci` — `.github/workflows/ci.yml` (Tier 2 with auth-shim, token-substituted) plus `BKIT_READ_TOKEN` README docs.
* `--lint` — `.vale.ini`, `.vale/styles/House/`, `slop-scan.config.json`, `.prettierignore`, `package.json` lint scripts (Tier 3 print-only).
* `--git-hooks` — `.husky/pre-commit`, `.husky/pre-push`, `prepare: husky install` script entry (Tier 3 print-only).

**Module dependencies.**

`--core` is implicit for every other module — invoking `--ci` alone runs `--core` first then `--ci`. No explicit `--ci --core` needed.

No auto-imply between non-core modules. `--ci` does NOT pull in `--lint` or `--git-hooks` even though the seeded `ci.yml` references `lint:prose` / `lint:slop`. Consumers who want only the workflow get only the workflow; they will hit a missing-script error in their CI run and add `--lint` on a later install. Less magic, more predictable.

**Compose examples.**

* `bkit install` — all modules (same as `--full`).
* `bkit install --full` — explicit, same as above.
* `bkit install --claude` — core + Claude host only.
* `bkit install --claude --cursor` — core + both hosts.
* `bkit install --ci --lint` — core + CI + lint stack.
* `bkit install --core` — core only (rare; mostly for debugging).
* `bkit check --ci` — dry-run scoped to CI module.

**Deprecation surface** (kept through v0.1.x; removed in v0.2).

* `bkit init` — prints deprecation warn, runs `install --full`.
* `bkit install --host=claude` — prints deprecation warn, treats as `--claude`. Same for `--host=cursor`.

Both kept working through the v0.1.x line so existing consumer scripts do not break on `pnpm update @cbartens/bkit`.

## Resolved disambiguations

1. `package.json` script merging → **print-only (Tier 3)**. `bkit install` logs "add these scripts to your package.json:" with snippet at end of run, exits cleanly. JSON-merging an existing file is a real correctness hazard; conservative now, can tighten in v0.2.
2. **Husky** → **directory seeded if absent;** `pre-commit` / `pre-push` use Tier 2 managed-block. Consumer runs `pnpm install` to wire git hooks (a `prepare: husky install` entry is part of the print-only output from disambiguation 1). Bkit does not mutate consumer git config directly.
3. **First-run detection** → **per-tier semantics, no global gate**. Tier 1 always rewrites. Tier 2 reconciles managed-block on every install. Tier 3 uses file-existence per file. The `.bkit-version` file is still written/updated for upgrade tracking and is the signal for "is this a first install?" → triggers extra logging (BKIT_READ_TOKEN setup instructions, package.json scripts) but does not gate behaviour.
4. **Vale binary install** → **graceful skip with warn**. `lint:prose` script no-ops with warn if `vale` not in `$PATH`. CI workflow includes Vale install step (mirrors seed). Local dev is consumer's responsibility (documented in seeded `ci.yml` comments).
5. **Private-repo CI auth** (absorbed from BAR-131 #1) → **seeded** `ci.yml` includes PAT-shim step + README documents `BKIT_READ_TOKEN` secret setup. Without this, consumer CI fails on first `pnpm install` with "could not read Username for 'https://github.com'" because GHA runners can't auth into the private bkit repo (reproduced in `app-gether-life` CI run 25307065735). The shim:

```yaml
- name: Configure git auth for private bkit
  run: git config --global url."https://x-access-token:${{ secrets.BKIT_READ_TOKEN }}@github.com/".insteadOf "https://github.com/"
```

Sits inside the bkit-managed block before the `pnpm install` step. README adds a § "Consumer CI auth" section explaining the fine-grained PAT setup (`Contents: read` on `cbartens/bkit`). Helper action (`uses: cbartens/bkit/.github/actions/setup-auth@v1`) is **out of scope for v0.1.2** — stays in BAR-131 for v0.2+ consideration.

6. **Dry-run parity** (absorbed from BAR-131 #3) → `bkit check` write-set must match `bkit install` write-set. Today the templates-pass dry-run misses managed-block "append at EOF" writes; live install does the append, dry-run doesn't predict it (reproduced in `app-gether-life`: `check` reported 14 writes, `install` performed 15 — the extra was a `.gitignore` append-block). Fix: simulate the append rule in the dry-run path of `bkit-install.ts`. Regression test: install once → check → install with mock fs → assert dry-run write set ≡ real install write set.
7. **Token substitution** (absorbed from BAR-112) → `{{TOKEN}}` placeholders in templates, auto-detected from project state, sensible defaults if detection fails. Non-interactive only — no prompted fallback in v0.1.2. Token list:

| Token | Source priority | Default if all fail |
| -- | -- | -- |
| `{{NODE_VERSION}}` | `.nvmrc` (extract major) → `package.json.engines.node` (parse range, take min) | `22` |
| `{{PNPM_VERSION}}` | `package.json.packageManager` (e.g. `"pnpm@10.4.1"`, extract major) | `10` |
| `{{DEFAULT_BRANCH}}` | `git symbolic-ref refs/remotes/origin/HEAD` (strip prefix) | `main` |
| `{{PROJECT_NAME}}` | `package.json.name` | error — required |

Substitution happens once per install at template-write time, not at template-read time. Consumers see resolved values in the seeded file; no token leaks. If a consumer's project state changes (e.g. they bump Node), re-running `bkit install` updates the managed-block with the new value (Tier 2 idempotence handles this naturally).

**Skipped tokens from BAR-112** (`{{VERCEL_PROJECT_ID}}`, `{{LINEAR_TEAM_ID}}`) — those were `app-gether-life`-specific and are not part of bkit's surface. Permanently out of scope.

8. `bkit init` retirement (absorbed from BAR-112's `--ci` opt-in framing, generalized) → **collapse** `init` into `install --full`; old `--host=` flag becomes `--claude`/`--cursor`. Both kept as deprecation stubs in v0.1.2 (warn + delegate to new equivalents); removed entirely in v0.2. Reason: composable module flags cover both first-time bootstrap (`install --full`) and ongoing partial sync (`install --ci`) cleanly; the init-vs-install distinction added complexity without value.

## Scope: bkit-the-repo (A)

* Add `.github/workflows/ci.yml` to bkit. Steps: pnpm install, typecheck, vitest, `pnpm lint:prose`, `pnpm lint:slop`, slop-scan delta on PRs, bkit self-test (run install, assert no drift in `.claude/.cursor`).
* Add `.vale.ini` + `.vale/styles/House/` — slim to `.agents/**` + root `*.md` scopes (drop app-specific scopes from seed).
* Add `slop-scan.config.json` — copy from seed verbatim.
* Add to bkit `package.json` scripts: `lint:prose`, `lint:slop`, `format:check`.
* Add prettier devDep + `.prettierignore`.

## Scope: bkit-the-installer (B)

* Extend `bkit-install.ts` with three-tier write logic per the architecture above.
* Generalize the existing managed-block parser (currently used for `.gitignore` / `rules.md`) to handle format-specific marker syntax for YAML / INI / shell.
* Add `.agents/templates/` payload entries for each tiered file. For Tier 2 files, the template stores **only the bkit-managed block content**, not the whole consumer file.
* Implement token substitution: read project state once at install start, substitute `{{TOKEN}}` placeholders before writing each Tier 1/Tier 2 template. Token detection has unit tests for each source-priority chain + default fallback.
* Bake CI auth-shim mechanics into the seeded `ci.yml` template + add `BKIT_READ_TOKEN` § to README.

## Scope: CLI redesign (C)

* Refactor `parseArgs()` in `bkit-install.ts` from `verb + --host=` model to `verb + module-flags` model.
* Add module router: each `--claude` / `--cursor` / `--ci` / `--lint` / `--git-hooks` / `--core` flag maps to a module function. `--full` (or no flags) calls all of them. `--core` is implicit before any other module.
* Implement deprecation stubs: `init` verb prints warn + delegates to `install --full`. `--host=claude` prints warn + treats as `--claude`. Same for cursor.
* Update `bkit help` output with module list + compose examples.
* Tests covering:
  * Each module installed in isolation produces only that module's files.
  * Combinations (`--claude --ci`) install both modules' files.
  * `--full` (and no-flag) install all modules.
  * `bkit init` prints deprecation, then equivalent to `install --full`.
  * `--host=claude` prints deprecation, then equivalent to `--claude`.
  * Tier-by-tier semantics still hold within each module (Tier 1 idempotent rewrite; Tier 2 managed-block reconcile; Tier 3 seed-or-print).
  * Dry-run parity: `bkit check --ci` write-set ≡ `bkit install --ci` write-set.

## DoD

- [ ] bkit's own PRs run typecheck + vitest + Vale + slop-scan + self-test.
- [ ] `bkit install` (no flags) on empty repo seeds the full stack across all three tiers; `git diff` shows expected files added.
- [ ] `bkit install --claude` on empty repo seeds only `.claude/**` + core; `.cursor/`, `.github/`, `.vale*`, `.husky/` untouched.
- [ ] `bkit install --ci --lint` on empty repo seeds CI workflow + lint stack + core; no Cursor/Claude/husky.
- [ ] `bkit install --ci` on repo with existing customized `ci.yml` injects bkit-managed block (with substituted Node/pnpm/branch values) without clobbering consumer's other jobs.
- [ ] `bkit install` on repo with existing `slop-scan.config.json` (Tier 3) preserves it and prints update suggestion.
- [ ] `bkit install` (any module set, post-init) is idempotent — second run has zero diff.
- [ ] `bkit check --full` and `bkit install --full` produce identical write-sets (regression test).
- [ ] Token substitution: seeded `ci.yml` has `node-version: <consumer's .nvmrc value>` and `branches: [<consumer's default branch>]` post-install.
- [ ] `bkit init` prints deprecation warn and runs `install --full`.
- [ ] `bkit install --host=claude` prints deprecation warn and runs equivalent of `--claude`.
- [ ] Seeded `ci.yml` includes auth-shim step; README documents `BKIT_READ_TOKEN` secret setup.
- [ ] `app-gether-life` consumer re-installs bkit at v0.1.2 with no surprise drift; CI passes on first run after upgrading.
- [ ] At least one second consumer (e.g., `www-visitfrasercoast-com`) onboards via `bkit install --full` (replacing `bkit init`) and CI runs green.
- [ ] `package.json` bumped to `0.1.2`; tag pushed.
- [ ] README + `.agents/README.md` document the three-tier model, the module-flag CLI, and the `init` deprecation.

## Out of scope

* `postflight.sh` and Stop-hook wiring in `.claude/settings.json` — stays repo-specific.
* `package.json` automated merging — print-only this round, revisit in v0.2.
* Prompted fallback for token detection — non-interactive only in v0.1.2; revisit if "all defaults fail" cases prove painful.
* Husky auto-install — seed-only this round.
* Reusable-workflow distribution (`uses: cbartens/bkit/.github/workflows/gates.yml@v0.1.2`) — interesting v0.2 evolution once auth story is solid; out of scope here.
* 3-way merge / versioned migrations — considered and rejected as overkill for v0.1.2.
* Helper action `cbartens/bkit/.github/actions/setup-auth@v1` — stays in BAR-131 as v0.2+ consideration.
* `--no-X` invert flags, `--force` to override Tier 3 print-only — defer to v0.2 if any consumer asks.
* `{{VERCEL_PROJECT_ID}}` / `{{LINEAR_TEAM_ID}}` token substitution — `app-gether-life`-specific, permanently out of scope for bkit.
* `claude.yml` / `ci-complete.yml` / `smoke.yml` consumer scaffolding — `claude.yml` and `ci-complete.yml` belong to BAR-120 (downstream of the Managed Agents migration); `smoke.yml` is permanently project-specific.
* New CI workflows beyond `ci.yml` (e.g., release automation) — separate ticket.

## References

* Related: BAR-111 (bkit extract — the scaffolding gap was identified during post-ship audit of v0.1.1).
* Related: BAR-131 (consumer-issues catch-all — items #1 and #3 absorbed here; #2 and helper-action stretch remain there).
* Related: BAR-112 (canceled — `ci.yml` consumer-distribution scope absorbed here; CLI redesign + token substitution mechanics likewise; `claude.yml`/`ci-complete.yml` rolled into BAR-120; `smoke.yml` permanently OOS).
* Related: BAR-120 (`claude.yml` / `ci-complete.yml` consumer-distribution decisions live there, downstream of Managed Agents migration).
* Seed reference files in `app-gether-life`: `.github/workflows/{bkit,ci}.yml`, `.vale.ini`, `.vale/styles/`, `slop-scan.config.json`, `.cursor/hooks.json`, `.cursor/settings.json`, `.husky/`.

### Linear Comments

(No comments on the issue.)

## Design Draft

(No prior design draft — `docs/plans/drafts/bar-130-ci-lint-scaffolding-design.md` does not exist. The Linear issue description above already encodes the resolved architecture, CLI surface, scope decomposition, disambiguations, DoD, and out-of-scope list. Treat that as the design input for this plan.)
