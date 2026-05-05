# Build Input — BAR-130 CI Lint Scaffolding

**FID:** `bar-130-ci-lint-scaffolding`
**Linear issue:** [BAR-130](https://linear.app/bartens/issue/BAR-130/ci-lint-etc-scaffolding-install-optimisation)
**Plan files:**

- [docs/plans/active/bar-130-ci-lint-scaffolding-plan.md](../../active/bar-130-ci-lint-scaffolding-plan.md) — parent index
- [docs/plans/active/bar-130-ci-lint-scaffolding-plan-1.md](../../active/bar-130-ci-lint-scaffolding-plan-1.md) — Scope A (bkit self-gating)
- [docs/plans/active/bar-130-ci-lint-scaffolding-plan-2.md](../../active/bar-130-ci-lint-scaffolding-plan-2.md) — Scope B (installer engine)
- [docs/plans/active/bar-130-ci-lint-scaffolding-plan-3.md](../../active/bar-130-ci-lint-scaffolding-plan-3.md) — Scope C (CLI redesign + ship prep)

**Build execution order (mandatory):** v4-1 → v4-2 → v4-3.

---

## Session Prompt

`/bkit-build bar-130`

---

## Linear Issue Description

## Goal

Bring across CI/lint scaffolding from the seed (`app-gether-life`) that didn't make it into bkit during BAR-111 extraction, so consumers get a working gate stack out-of-the-box and bkit dogfoods its own discipline. Also absorbs blocking consumer-friction items #1 and #3 from BAR-131, plus the module-flag CLI surface, token substitution, and init-verb retirement absorbed from BAR-112.

Three scopes, one ship:

- **(A) bkit-the-repo gates its own PRs** — adds `ci.yml`, Vale, slop-scan, lint scripts to bkit itself.
- **(B) bkit-the-installer scaffolds the same stack into consumers** — extends `bkit-install.ts` with a three-tier file-ownership model and a module-flag CLI surface that handles greenfield AND existing files without clobbering consumer customizations.
- **(C) CLI redesign** — replaces `init` + `install` + `--host=` with a single `install` verb taking composable module flags (`--claude`, `--cursor`, `--ci`, `--lint`, `--git-hooks`, `--core`, `--full`).

Ships as `v0.1.2`. Old `init` verb and `--host=` flag kept as deprecation stubs through v0.1.x; removed in v0.2.

## Background

Audit comparing `bkit/` against seed `app-gether-life/` surfaced these gaps:

- `.github/workflows/` — bkit has zero CI.
- `.vale.ini`, `.vale/styles/House/` — prose lint config (write-good + House.LLMSlop) absent.
- `slop-scan.config.json` — anti-slop code lint config absent.
- `.cursor/hooks.json` — sessionStart/stop hook wiring absent.
- `.cursor/settings.json` — Cursor plugin allowlist absent.
- `.husky/` — pre-commit / pre-push absent.
- `.prettierignore` + prettier scripts absent.
- `package.json` lint scripts (`lint:prose`, `lint:slop`, `format:check`) absent — bkit only has `build/test/typecheck/prepare`.

`postflight.sh` (Stop-hook telemetry) stays **project-specific** — does NOT ship via bkit. Project owns its observability.

## Architecture: three-tier file ownership

Per-file ownership tier matching what each format and use case can support. `bkit-install.ts` already has the managed-block convention working for `.gitignore` and `rules.md` (markdown-comment markers `bkit:start` / `bkit:end`); extend that pattern to the new files with format-specific marker syntax.

### Tier 1 — Fully managed

- **Semantics:** idempotent rewrite of whole file every install.
- **Files:** `.cursor/hooks.json`, `.claude/hooks/preflight.sh`, `.cursor/hooks/preflight.sh`, `.vale/styles/House/**`.

### Tier 2 — Managed-block

- **Semantics:** bkit owns content between markers; consumer owns everything outside. File present without markers → append block at EOF. File absent → write whole file with block.
- **Marker syntax:** format-specific. Markdown-comment markers (`<!-- bkit:start -->` / `<!-- bkit:end -->`) for markdown / `.gitignore`. Hash-comment markers (`# bkit:start` / `# bkit:end`) for YAML / INI / shell.
- **Files:** `.github/workflows/ci.yml`, `.vale.ini`, `.gitignore` (existing), `.husky/pre-commit`, `.husky/pre-push`, `.prettierignore`, `rules.md` (existing).

### Tier 3 — Seed-or-print

- **Semantics:** write if absent; if present, print suggested diff to stdout and exit clean.
- **Files:** `slop-scan.config.json`, `.cursor/settings.json`, `package.json` script entries.

## CLI surface

Single `install` verb replaces the current `init` + `install` triad. Module flags scope what gets installed. Multiple flags compose. No flags = `--full` = all modules.

**Verbs:** `bkit install` (with optional module flags) / `bkit check` (dry-run) / `bkit help`.

**Module flags:** `--full` / `--core` / `--claude` / `--cursor` / `--ci` / `--lint` / `--git-hooks`.

`--core` is implicit for every other module. No auto-imply between non-core modules.

**Deprecation surface** (kept through v0.1.x; removed in v0.2): `bkit init` and `bkit install --host=claude|cursor`.

## Resolved disambiguations (8 items)

1. `package.json` script merging → **print-only (Tier 3)**.
2. **Husky** → directory seeded if absent; `pre-commit` / `pre-push` use Tier 2 managed-block.
3. **First-run detection** → per-tier semantics; `.bkit-version` triggers extra logging only.
4. **Vale binary install** → graceful skip with warn if not in `$PATH`; CI workflow installs it.
5. **Private-repo CI auth** → seeded `ci.yml` includes PAT-shim step; README documents `BKIT_READ_TOKEN`.
6. **Dry-run parity** → `bkit check` write-set must match `bkit install` write-set.
7. **Token substitution** → `{{NODE_VERSION}}`, `{{PNPM_VERSION}}`, `{{DEFAULT_BRANCH}}`, `{{PROJECT_NAME}}` (last is required-or-error).
8. **`bkit init` retirement** → collapse `init` into `install --full`; old `--host=` flag becomes `--claude`/`--cursor`.

## DoD

16 bullets, owned per the parent index DoD-Bullet-Ownership table. Includes:

- bkit's own PRs run typecheck + vitest + Vale + slop-scan + self-test (v4-1).
- `bkit install` (no flags) on empty repo seeds full stack across 3 tiers (v4-3).
- `bkit install --claude` seeds only `.claude/**` + core (v4-3).
- `bkit install --ci --lint` seeds CI + lint stack + core (v4-3).
- `bkit install --ci` on existing customised `ci.yml` injects bkit-managed block w/ substituted tokens (v4-2).
- `bkit install` on repo w/ existing `slop-scan.config.json` (Tier 3) preserves it + prints suggestion (v4-2).
- Idempotence — second run zero diff (v4-3).
- `bkit check --full` ≡ `bkit install --full` writeset (v4-2).
- Token substitution: seeded `ci.yml` has consumer's `.nvmrc` value + default branch (v4-2).
- `bkit init` deprecation stub (v4-3).
- `bkit install --host=claude` deprecation stub (v4-3).
- Seeded `ci.yml` includes auth-shim step; README documents `BKIT_READ_TOKEN` (v4-2 + v4-3).
- `app-gether-life` re-installs at v0.1.2 with no surprise drift (v4-3 Gate 4.5a).
- Second consumer onboards via `bkit install --full` (v4-3 Gate 4.5b).
- `package.json` bumped to `0.1.2`; tag pushed (v4-3).
- README + `.agents/README.md` document three-tier model, module-flag CLI, `init` deprecation (v4-3).

## Out of scope

- `postflight.sh` and Stop-hook wiring in `.claude/settings.json`.
- `package.json` automated merging.
- Prompted fallback for token detection.
- Husky auto-install.
- Reusable-workflow distribution.
- 3-way merge / versioned migrations.
- Helper action `cbartens/bkit/.github/actions/setup-auth@v1`.
- `--no-X` invert flags, `--force`.
- `{{VERCEL_PROJECT_ID}}` / `{{LINEAR_TEAM_ID}}` token substitution.
- `claude.yml` / `ci-complete.yml` / `smoke.yml` consumer scaffolding.
- New CI workflows beyond `ci.yml`.

---

## Linear Comments — Plan workflow summary (BAR-130 thread)

### Plan Workflow

🔗 Remote session: https://claude.ai/code/session_01Kt8zeAE7aESNeU1cJBWoEP

- Step 1 — Start Workflow ✓
- Step 2 — Worktree Setup ✓
- Step 3 — Generate Plan → `plan-v1-draft.md`
- Step 4 — Review Plan: CONCERNS (14 failures)
- Step 5 — Apply Review: PASS → `plan-v2-reviewed.md`
- Step 6 — Scope Check: CONCERNS (9 failures)
- Step 7 — Apply Scope: PASS → `plan-v3-checked.md`
- Step 8 — Complexity Check: SPLIT
- Step 9 — Complexity Split: PASS → `plan-v4-split.md`
- Step 10 — Summary: PASS → `plan-summary.md`
- Step 11 — Close Workflow → moved to In Review with Review label.

> [!CAUTION]
> **HARD STOP:** Plan requires human review before `/bkit-build` can be invoked. Confirm Gate 1 human checkboxes (Acceptance Scenario + Breaking Changes) in each of the three sub-plan drafts before build entry. ← (Confirmation visible in recent commits 67ca72d / 4965d6d / 275f7fa.)

**Build execution order (mandatory):** v4-1 → v4-2 → v4-3.

---

## Plan Parent Index — verbatim

(See [docs/plans/active/bar-130-ci-lint-scaffolding-plan.md](../../active/bar-130-ci-lint-scaffolding-plan.md) for the parent index. Sub-plans 1/2/3 are the executable child plans.)
