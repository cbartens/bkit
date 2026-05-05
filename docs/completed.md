<!-- bkit:start -->

# Completed

> [!CAUTION]
> **Purpose:** Ledger of shipped plans — one entry per merged feature. Append-only.
> **Categories:** `infra | agentic | backend | frontend | data | integrations | ai | testing | security | other`.
>
> **Rules:**
>
> - Token-efficient dense phrasing; agent readers only.
> - Before writing, cross-check `.agents/docs.md` — verify topic does NOT belong in other doc.
> - Append-only at EOF, do NOT overwrite.
> - `Summary` dense enough to grok without reading plan.
>
> **Format:**
>
> ```markdown
> ## Title (YYYY-MM-DD)
>
> - **Category:** {one of above}
> - **Artifacts:** `docs/plans/completed/YYYYMM/{plan}.md`
> - **Summary:** what shipped (2–4 dense sentences)
> - **Related:** Linear IDs BAR-{N}, PRs PR-{N}, Commits {SHA}, Decisions DE-{N}, Knowledge KN-{N}, paths, etc
> ```

<!-- bkit:end -->

## bkit npm Package extraction — BAR-111 (2026-05-04)

- **Category:** agentic
- **Artifacts:** `docs/plans/completed/202605/bar-111-bkit-npm-package-plan.md` (master, trimmed manual runbook), `docs/plans/completed/202605/bar-111-bkit-npm-package-plan-{1,2,3}.md` (split sub-plans — A producer, B consumer migration, C smoke; only A executed in this repo, B and C remain in `app-gether-life`).
- **Summary:** Extracted canonical `.agents/` payload from `app-gether-life` into the standalone `bkit` repo. Implemented three CLI verbs (`init`, `install`, `check` — no `upgrade`, folded into install). `install` runs three passes: payload (mirrors `<pkg>/.agents/{workflows,prompts,templates}/` into consumer's `.agents/`), host (regen `.{claude,cursor}/{commands,agents}/` with T1/T2/T3 transforms), templates (managed-block updates per case 1/2/3a/3b). bkit-prefix ownership rule: bkit owns `bkit-*` files in six bkit-managed dirs; non-prefixed files are project-managed and never touched. Distributed as a **git dependency from a private GitHub repo** (`pnpm add -D github:cbartens/bkit#v0.1.1` + `pnpm.onlyBuiltDependencies` allowlist), not via npm registry — public scope `@bartens` was unpublished and renamed to `@cbartens` (matches GitHub identity). 63 vitest tests passing; consumer smoke verified end-to-end in `www-visitfrasercoast-com` against both `#v0.1.0` and `#v0.1.1` — `init`, idempotent re-`install`, and `check` all green.
- **Related:** BAR-111, https://github.com/cbartens/bkit/releases/tag/v0.1.1, tag `v0.1.1` (commit `da1bdee`), tag `v0.1.0` (commit `fb34d28`). Sub-plans B (consumer migration) and C (second-repo smoke) are owned by `app-gether-life` and remain open in that repo's `docs/plans/drafts/`.

## bkit CI/lint scaffolding + 3-tier installer + module-flag CLI — BAR-130 (2026-05-05)

- **Category:** agentic
- **Artifacts:** `docs/plans/completed/202605/bar-130-ci-lint-scaffolding-plan.md` (parent index), `docs/plans/completed/202605/bar-130-ci-lint-scaffolding-plan-{1,2,3}.md` (split sub-plans — A bkit self-gating, B installer engine, C CLI redesign + ship). Logs: `docs/plans/logs/bar-130-ci-lint-scaffolding/`.
- **Summary:** Shipped v0.1.2 closing CI/lint discipline gaps left after v0.1.1. **Scope A (self-gating):** bkit-the-repo gates its own PRs via `.github/workflows/ci.yml` (typecheck + vitest + format:check + Vale + slop-scan + self-test), `.vale.ini` + `.vale/styles/House/`, `slop-scan.config.json`, `.prettierignore` + `.prettierrc.json`, prettier devDep, lint scripts. **Scope B (installer engine):** new `bkit-tokens.ts` (token resolver — `.nvmrc`/`engines.node` chain, `packageManager` pnpm major, git default branch, hard-fail on missing `package.json.name`); new `bkit-tiers.ts` (Tier 1 fully-managed rewrite, Tier 2 managed-block with html-comment OR hash-comment markers, Tier 3 seed-or-print); marker generalisation in `bkit-install.ts` (default html-comment for backward compat); shared `WriteSet` accumulator for dry-run/install parity; full `.agents/templates/` payload (CI workflow with auth-shim scoped to `cbartens/bkit`, Vale, slop-scan, prettier, husky pre-commit/pre-push, cursor hooks/settings). **Scope C (CLI redesign):** new `bkit-cli.ts` (parseArgs + module-flag allowlist + `init`/`--host=` deprecation stubs); new `bkit-modules.ts` (module dispatcher with `MODULE_REGISTRY`, `postDispatch` callback queue so `.bkit-version` writes LAST after all modules complete); `bkit-install.ts` `main()` refactored to dispatch through registry; `bkit-init.ts` deleted (body folded into `runCoreModule`); README + `.agents/README.md` rewritten for module-flag surface + 3-tier ownership doc + `BKIT_READ_TOKEN` PAT setup. 173 tests pass (1 todo for MED-8 deferred to v0.2). Challenge surfaced 1 CRITICAL (unresolved tokens in bkit's own `ci.yml` — fixed in-flight by hand-authoring literal values + `|| true` on self-test) and 7 MEDIUM findings (MED-1..7 fixed in challenge-remediate; MED-8 architectural — deferred). Manual smoke gates 4.5a (app-gether-life) and 4.5b (second consumer) deferred to post-merge per design (cannot be automated pre-push).
- **Related:** BAR-130, BAR-200 (v0.2 deprecation removal kill-date), BAR-131 (v0.2 helper auth action), DE-1 (3-tier model), DE-2 (module-flag CLI), KN-1 (`runPayload` WriteSet threading gotcha), KN-2 (`postDispatch` deferred-finalisation pattern), MED-8 pending entry. Tag `v0.1.2` (push handed off to `bkit-ship` post-merge).
