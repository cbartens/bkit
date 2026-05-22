# Changelog

All notable changes to `@cbartens/bkit` are documented here.

Format: `## [version] — YYYY-MM-DD`

---

## [Unreleased]

### Changed

- **`docs/plans/` layout collapsed to single `{YYYYMM}/` bucket — no more `drafts/` / `active/` / `completed/`. (issue #110)** Plans and designs live at `docs/plans/{YYYYMM}/{FID}-{plan,design}.md` for their full lifetime; logs at `docs/plans/{YYYYMM}/logs/{FID}/`. `{YYYYMM}` = creation month, set once at design start (`date +%Y%m`) and discovered by downstream workflows via `ls -d docs/plans/[0-9][0-9][0-9][0-9][0-9][0-9]/logs/{FID}/`. Files never move — fixes the dead-link problem where every workflow-posted issue/PR comment 404'd after ship's `mv active → completed` step and feature-branch deletion. Workflow state (`draft` / `active` / `completed`) moves from directory layout to `status.json`. All comment URLs for canonical artifacts switch to `blob/main/docs/plans/{YYYYMM}/{FID}-*.md` (survives branch deletion); log links remain `blob/{BRANCH}/...` as best-effort (logs are delete-eligible). bkit's own historical `docs/plans/{drafts,active,completed}/` and `docs/plans/logs/` are migrated in this release via `git mv` to preserve blame. **Consumer-side retrofix:** per-consumer runbook posted on issue [#110](https://github.com/cbartens/bkit/issues/110) (and cross-posted on [#39](https://github.com/cbartens/bkit/issues/39)) — copy-paste once into a Claude Code session in each consumer repo after upgrading.
- **SHA-pinned all `uses:` lines across `.github/workflows/` and `.agents/templates/.github/workflows/`.** Replaces floating `@v4` / `@v1` tags with 40-char commit SHAs and `# vX.Y.Z` comments — closes the long-standing `gha-actions-floating-tags` advisory in bkit's own dogfood. Affects `actions/checkout` (v4.3.1), `actions/setup-node` (v4.4.0), `pnpm/action-setup` (v4.4.0), and `anthropics/claude-code-action` (v1.0.99). Going forward, Dependabot version updates will refresh these pins on each upstream release; the bkit-repo-specific template-sync dance is documented in `.agents/README.md` § "bkit-repo dogfood rule".

### Security

- **CVE fixes via dependency bumps.** Bumped `vitest` `^2.1.0` → `^4.1.7` and added direct `vite` `^6.4.2` devDep + `pnpm.overrides` to force CVE-fixed transitives: closes GHSA-4w7w-66w2-5vf9 (vite path traversal in optimized-deps .map handling, CVE-2026-39365) and the esbuild dev-server-request CVE. Both were transitive dev-only deps coming through `vitest@2.x → vite@5.x → esbuild@0.21.x`. Side benefit: `vitest 4` adoption brings the new test runner to bkit's own suite (934 tests pass, no regressions). Snapshot-format compatibility preserved.

### Added

- **Dependabot config shipped as Tier 3.** `bkit install --ci` (or `bkit install` no-flags) now seeds `.github/dependabot.yml` (seed-or-print) alongside `.github/workflows/ci.yml`. Template at `.agents/templates/.github/dependabot.yml` ships the `github-actions` ecosystem with `target-branch: dev` (mandatory for bkit branch-protection — Dependabot PRs without it hit `main` and are rejected), `commit-message.prefix: "chore(deps)"`, weekly schedule, `open-pull-requests-limit: 10`, and `groups:` to bundle per-ecosystem PRs. `npm` ecosystem is shipped commented-out as opt-in. Existing consumer `.github/dependabot.yml` triggers `tier3-merge-suggested-dependabot.yml` advisory with AI-paste-ready merge instructions.
- **Repo-level Dependabot policy helper.** New `scripts/ci/bkit-set-dependabot.sh` (template at `.agents/templates/scripts/ci/bkit-set-dependabot.sh`) — one-shot, idempotent applier for the bkit-canonical Dependabot policy. Two actions: PUT `vulnerability-alerts` (enable — required for `.github/dependabot.yml` to be read at all) AND DELETE `automated-security-fixes` (defensive disable — bkit policy: never auto-PR to `main`, because that feature routes CVE PRs to the default branch which bkit branch protection rejects from non-`dev` sources). Supports `--dry-run` and `--print`. CVE handling stays manual via the repo Security tab.
- **Four new Phase 3 detectors.** `dependabot-target-branch-missing` fires when `.github/dependabot.yml` has `updates[]` entries but no `target-branch: dev` anywhere — silent-breakage prevention against the main-branch protection contract. `dependabot-config-invalid` fires on missing `version: 2`, missing `updates:`, or tab indentation. `dependabot-repo-prereqs-disabled` fires when the config exists but `vulnerability-alerts` is disabled at the repo level (probes via `gh api`; silent-skip if `gh` unavailable to avoid false positives). `dependabot-auto-security-fixes-enabled` fires when `automated-security-fixes` is ON — policy violation under the never-auto-on-main rule. All wired into `runPostInstallCheck`.
- **bkit repo dogfoods its own template.** `.github/dependabot.yml` added at bkit repo root; npm ecosystem deliberately omitted for v1 (low breaking-change tolerance on tooling deps — revisit if manual upgrade cadence becomes painful). GitHub issue #109 tracks the decision and acceptance criteria.

### Changed

- **`detectDependabotConfigMissing` advisory rewritten.** No longer embeds a snippet inline; points consumers at `pnpm bkit install --ci` AND the new `scripts/ci/bkit-set-dependabot.sh` helper for the repo-level prereqs step. Single source of truth for snippet shape is `.agents/templates/.github/dependabot.yml`. Eliminates parallel-copy drift between detector, `docs/security.md`, and the template.
- **`DEPENDABOT_YML_MERGE_INSTRUCTIONS` extended.** AI-paste-ready merge advisory now has four required actions (target-branch, commit-message prefix, default-branch propagation, run prereqs script — which enables alerts AND disables auto-security-fixes per bkit policy) rather than three. Aligns with the silent-breakage failure modes AND the never-auto-on-main policy encountered in the #109 rollout.
- **`docs/security.md` § Supply-Chain (GitHub Actions) updated.** Snippet now matches the shipped template (`target-branch: dev`, `chore(deps)` prefix). New callouts: (a) must-be-on-default-branch — GitHub reads the config ONLY from the default branch; (b) must-enable-vulnerability-alerts via the helper script; (c) **never-auto-on-main policy** — `automated-security-fixes` stays DISABLED, CVE handling stays manual via the Security tab. Notes that `bkit-ci-router` does not dispatch on Dependabot PRs by design. Mirror in `.agents/templates/docs/security.md`.
- **`docs/deployments.md` § GitHub Actions pinning pointer.** Updated to mention `target-branch: dev`, the default-branch propagation rule, AND the prereqs script; mirror in `.agents/templates/docs/deployments.md`.
- **README advisory IDs table.** Adds the five dependabot entries (`dependabot-config-missing`, `dependabot-target-branch-missing`, `dependabot-config-invalid`, `dependabot-repo-prereqs-disabled`, `dependabot-auto-security-fixes-enabled`).

---

## [2.2.3] — 2026-05-19

### Changed

- **`bkit check` now runs Phase 3 detectors for parity with `bkit install`.** Previously, `check` returned only Phase 1 preflight + Phase 2 module-dispatched advisories, masking runtime-state findings (`gh-bkit-token-unset-shell`, `npmrc-missing-gh-packages`, `ci-yml-missing-token-env`, `gha-actions-floating-tags`, `dependabot-config-missing`, `cloud-secrets-three-locations`, etc.) that only `install` would surface. Both commands now produce the identical advisory set against the same filesystem state — `check` is `install` minus the writes. CI drift gate semantics preserved: `bkit check` still exits 1 when any Tier-1/Tier-2 write would occur. The `dryRun` parameter on `runPostInstallCheck` is removed (was effectively dead code after this change).

---

## [2.2.2] — 2026-05-19

### Changed

- **Docs/config housekeeping.** `docs/deployments.md` documents the org/repo Workflow permissions setting required for `bkit-ci-router` (BAR-148). Subagent model pins swapped from `composer-2` to `composer-2.5` across Cursor configs. Autonomous workflow `CAUTION` blocks gain the Narrate invariant (BAR-229). `friction.md` entries captured by BAR-155 + BAR-230 pruned.

---

## [2.2.1] — 2026-05-18

### Added

- **`.agents/advisories.md` persistent artifact (preflight + post-install).** `bkit install` / `check` / `doctor` now write the most-recent preflight + post-install checklist to `.agents/advisories.md` so consumers can revisit findings between runs. Overwritten on every run; clean runs write a "no advisories" stub. New `bkit-postinstall.ts` module owns the rendering. Added to the bkit-managed `.gitignore` block (transient artifact, not committed).
- **README quick-install block.** Paste-ready installer prompt walks an AI through PAT setup + `.npmrc` configuration + initial `bkit install`. Lowers the barrier for first-time consumers.
- **GitHub Actions supply-chain pinning guide.** New `docs/security.md` § "Supply-Chain (GitHub Actions)" (also in template) — recommends SHA-pinning `uses:` lines and pairing with Dependabot for auto-bumps. `docs/deployments.md` gains a pointer to the new section.

---

## [2.2.0] — 2026-05-18

### Added

- **`[verbose ci]` commit-message / PR-title marker (BAR-224).** Opt-in max-detail CI logging — append `[verbose ci]` to a commit message or PR title to escalate one CI run. Lean knob set: `TURBO_LOG_LEVEL=full`, `NODE_OPTIONS=--trace-warnings --trace-deprecation`, `DEBUG=vercel:*,supabase:*`, plus Playwright `--trace=on` (when E2E stub enabled — `--video` and `--screenshot` are `playwright.config.ts use:` keys, NOT CLI flags; trace.zip covers their use case). Composes with `[force build]` / `[force cache]` in any order. Template ships:
  - `bkit:start verbose-ci-env` named env block at `jobs.run-tests:` level in `.agents/templates/.github/workflows/ci.yml`.
  - `Configure Verbose CI` step propagating verbose envs via `$GITHUB_ENV` (visible activation echo in CI logs).
  - Verbose-aware Playwright stub commentary — never pass `--reporter=line`, conditionally append trace/video/screenshot.
  - Canonical marker row in `.agents/templates/docs/deployments.md` § "Commit-message force tags" alongside `[force build]` / `[force cache]` / `[skip ci]`, including the explicit PR-title-vs-commit-message rule (push events read `head_commit.message`; pull_request events read `pull_request.title` — feature-branch pushes only fire pull_request, so the marker MUST go in the PR title there).
  - Testing-specific reference in `.agents/templates/docs/testing.md` § "CI verbosity" covering the knob list, when-to-use, hostile `--reporter=line` gap, and gitignore'd artifact paths.
- **Playwright artifact gitignore guardrail (BAR-224).** `.agents/templates/gitignore` now ignores `test-results/`, `playwright-report/`, `blob-report/`, `.last-run.json`, and `playwright/.auth/` inside the bkit-managed block. Prevents accidental commit of trace/video binaries (1-50MB each) under `[verbose ci]`, and protects the auth-state directory which contains live session tokens.
- **Cancel-resilient Playwright artifact upload (BAR-224).** `bkit-stub:e2e-artifacts` upload condition changed from `if: failure() && steps.e2e.conclusion == 'failure'` to `if: always()`. The HTML reporter only finalises `playwright-report/index.html` at suite `onEnd`; on job-timeout SIGTERM that file is never written. But per-test `trace.zip` files in `test-results/` write incrementally and survive mid-suite cancel. Previous condition skipped uploads on cancel (cancel ≠ failure in GH Actions), losing all traces. `if: always()` captures both failure and cancel paths.
- **Two new `bkit install` advisories (BAR-224).**
  - `ci-yml-verbose-ci-block-missing` — fires when consumer's ci.yml has bkit markers but is missing the new `bkit:start verbose-ci-env` block; directs to `pnpm bkit install`.
  - `playwright-reporter-line-override-hostile` — fires when a `playwright test` invocation passes `--reporter=line`, which silently overrides the configured reporter chain and causes verbose traces to be written but never surfaced.
- **`bkit-debug` orchestrator wires `[verbose ci]` on every CI-triggering push (BAR-224).** Debug mode is failure-recovery by definition — verbose is the right default, not a retry escalation. Two surfaces wired:
  - **Local mode (`DEBUG_MODE = local`, debug on dev/main push):** every commit-message in `.agents/workflows/bkit-debug.md` that does not carry `[skip ci]` gets `[verbose ci]` appended conditionally via `VERBOSE_SUFFIX=""; [ "$DEBUG_MODE" = "local" ] && VERBOSE_SUFFIX=" [verbose ci]"` (5 sites: failure-remediate fix, summary, observe-instrument, close-workflow, create-pr). `push.head_commit.message` reads the marker → CI runs verbose. PR-mode runs skip the suffix entirely so commit history stays clean (no `[verbose ci]` clutter in commit subjects or squash bodies).
  - **PR mode (`DEBUG_MODE = pr`, debug on feature-branch + open PR):** Step 7 sub-step 2a (off-mode push path) and Step 9 sub-step 4a (instrument-mode push path) set `[verbose ci]` in the PR title immediately before their push — set co-located with the push that needs it. Step 12 sub-step 1a strips it **only when `OBSERVE_MODE = off`** (successful remediation close). `pull_request.synchronize` events read `pull_request.title` (the `push` event does not fire for non-`main`/`dev` branches), so the title is the only surface that works for PR-mode CI. **`OBSERVE_MODE = instrument` close + analyse handover + Failure Path all intentionally preserve the marker** so the next consumer (analyse cycle, observe-revert push, post-handover human investigator) keeps getting verbose CI without manual re-adding.
  - `bkit-build.md` intentionally not wired — build's pushes are happy-path by definition; verbose is contraindicated on shippable commits. The build→debug handoff (when build's Failure Path triggers a debug cycle) is where verbose kicks in automatically via the rules above.
- **`bkit-debug` rot-signal hint via diagnose → summary / handover (BAR-219).** `bkit-debug-failure-diagnose` emits a `## Rot Signals` body section listing applicable lens slugs (subset of `architecture, hotpath, config, reliability, observability, debt, dead-code, deps, security, tests, docs-drift`) with one-line evidence per match when stack trace / root-cause analysis surfaces structural rot on-path. `bkit-debug-summary` + `bkit-debug-abort-handover` aggregate across diagnose attempts (dedupe slugs, retain all evidence) so the signal reaches humans regardless of debug-cycle outcome. Summary `Verdict` semantically extended — `CONCERNS` now covers rot-detected cases alongside the original "ambiguous root cause" meaning.
- **`bkit-debug-failure-diagnose` minimum-bundle hardening (BAR-198).** Four BAR-197-class failure modes retrofitted onto diagnose; remediate keeps its existing "loyal soldier" contract:
  - **Scar-tissue scan (A)** — Step 7 finds reverted commits with candidate files → `Prior Knowledge`. Catches lessons rolled back from code that never reached `docs/knowledge.md` (the BAR-166 / BAR-192 re-application gap).
  - **Blast Radius check (B)** — Step 14 enumerates affected surfaces when `Recommended Remediation` effects propagate beyond named files (loaders, schemas, public contracts, shared utilities, config globals, middleware, routing); unhandled break → `Verdict` = FAIL.
  - **Scope-split (C)** — Step 12 routes recommendations to either `Recommended Remediation` (in-scope, remediate applies) or `Out-of-Scope Recommendations` (deferred for human triage). `bkit-debug-summary` + `bkit-debug-abort-handover` aggregate the out-of-scope section across diagnose attempts.
  - **PIVOT / FINAL re-application check (F)** — Step 5 strategy clauses demand explicit answering: "Is this a re-application of prior commit SHA / debug log? What new evidence makes it work this time?" Anti-recurrence check (Step 13) provides the reactive backstop catching recommendations that resemble reverted attempts.
- **`/bkit-debug` Step 3 Context fetch refactor (BAR-198).** Workflow Step 3 renamed "Fetch Logs" → "Fetch Context"; expanded from 3 to 5 sub-fetches in priority order, with all deterministic data-gathering moved out of diagnose:
  - `debug-context-ci-{ATTEMPT}.md` — CI logs (`gh run view --log-failed`).
  - `debug-context-diff-{ATTEMPT}.md` — diff vs last-passing CI on `dev` (`gh run list --workflow ci.yml --status success` → `git diff <last-pass-sha>..HEAD --stat`). Filter pins to `ci.yml` so an unrelated workflow's success doesn't define the diff baseline.
  - `debug-context-tests-local-{ATTEMPT}.md` — `pnpm turbo lint typecheck test --filter='...[origin/dev]' --continue` stdout/stderr.
  - `debug-context-tests-e2e-{ATTEMPT}.md` — Playwright artifact (`gh run download -n playwright-report`).
  - `debug-context-runtime-{ATTEMPT}.md` — runtime fetch template from `docs/observability.md` (BAR-194 mechanism, now under the unified naming).

  Diagnose reads pre-staged context as supplied input; signal-weight hints inline ("local-test output = primary signal", "diff vs last-passing CI = scope-narrowing signal"). Workflow status step renamed `debug-fetch-logs` → `debug-fetch-context`. All references in `.agents/workflows.md`, `.agents/prompts.md`, `.agents/templates/docs/observability.md`, `docs/observability.md` updated.

### Changed

- **Cross-prompt output body description style normalised (BAR-198 / BAR-219).** Body section instructions across debug + audit / build / design / plan / ship summary prompts unified to "If X then \`Y\`" pattern (e.g. `If no rot signals then None`). Grammar fix `"NEVER assumed outcomes or infer results"` → `"NEVER assume outcomes or infer results"` across 6 summary prompts.
- **`.agents/rules.md` adds "End-state over diff-size" principle.** AI makes changes cheap — never pick solutions based on lower cost-of-change; always pick the solution with best quality-of-end-state. Sits alongside "Completeness over shortcuts" in § Principles.
- **`scripts/secrets/sync-github.sh` strips `GH_TOKEN` from gh env.** New `gh_clean()` wrapper drops the env var so the auth-login session takes precedence over a sourced fine-grained PAT that would otherwise 403 on `actions/secrets/public-key`. Plus `printf '%s'` over `echo -n` for portable secret value writes.

### Fixed

- **README.md historical-commentary cleanup.** Dropped `"(was only required for git-dep model)"` parenthetical and rephrased the `"Removed in v0.4.0 (breaking)"` block as forward-looking `"Upgrading from v0.3.x"` instruction. Historical context belongs here (CHANGELOG.md), not README.
- **`docs/architecture.md` historical-commentary cleanup.** Dropped `"bkit-tier1-defaults.ts DELETED (v2.0.0) — sole consumer migrateTier1JsonToTier2 removed"` comment from the `.agents/scripts/` tree (already in this file's v2.0.0 entry + `docs/decisions.md`). Dropped the trailing `(v2.0.0+)` annotation on `bkit-tiers.ts` description.

---

## [2.1.0] — 2026-05-14

### Added

- **`/bkit-ci-router` slash command + GHA plumbing (BAR-148).** New auto-dispatch router (`.claude/agents/bkit-ci-router.md`, `.github/workflows/bkit-ci-router.yml`) that picks ship vs debug after each phase completes and writes its decision to `docs/plans/logs/{FID}/status.json`. Tier-1 auto-mirror keeps `.claude/` and `.cursor/` copies in sync; Skill→Task T2 transform routes consumer Cursor work through Background Agents. PR_URL/RUN_ID extraction, close-on-SKIP, canonical CAUTION block, BAR-187-compliant per-step commits, `in`/`not in` membership, enum-value backticking per `workflows.md` authoring rules.
- **Cloud env recipe for Claude Code on the web + Cursor Background Agents (BAR-191).** `.agents/cloud.md` ships as canonical doc covering both providers. `bkit install` seeds `.claude/hooks/cloud-bootstrap.sh` (Tier-3 seed-or-print) and emits `cloud-env-customize` advisory pointing consumers at the customization seam. Cursor side ships Tier-2 markered `.cursor/Dockerfile` + `.cursor/hooks/cloud-bootstrap.sh` aligned to the Claude env. Docs spell out in-repo dispatch vs online-dashboard split so consumers pick the right entry point.
- **`/bkit-debug` Step 3 fetch-logs (BAR-194).** Diagnosis now fetches relevant GCP log lines via `<debug-fetch>` markers in `docs/observability.md` before forming hypotheses, so root-cause analysis runs on runtime evidence, not code reading. Consumers add markers per service; bkit fetches and inlines log snippets into the diagnose payload.
- **`bkit install` advisory expansion — 8 new detectors (BAR-195).** New advisories cover Tier-1 #7 concurrency drift, Tier-2 marker stubs without bodies, Tier-3 docs/script mismatch, plus wording cleanups across the existing advisory set. Catches more pre-flight drift before it becomes a CI failure.
- **`pnpm test:integration` direct turbo dispatch (BAR-195).** `pnpm test:integration` now runs `turbo run test:integration --continue` directly (previously routed through a missing wrapper script that silently no-op'd). Missing-script detector warns consumers whose `package.json` lacks the script. Dev-rollback runbook added; KN-25 captures the silent-skip incident.
- **`scripts/sync-github.sh` for managing GitHub Actions secrets (BAR-195).** One-shot `bash scripts/sync-github.sh` reads `.env` and applies via `gh secret set --env-file`, replacing the manual per-secret `gh secret set` dance. Bkit-repo-only; not shipped to consumers.
- **Done-when enforcement gates across plan + build agents (BAR-168).** `Done when:` criterion per plan task — introduced advisory in 2.0.5, now enforced by `bkit-plan-review-1/2/3`, `bkit-plan-scope-check-1/2`, and `bkit-plan-verify`. Missing or vacuous Done-when fails the gate. Build-time verification matches the criterion against the Derived Test Matrix.

### Changed

- **Prompt authoring rules — sweeping alignment (BAR-193).** All agent prompts revised: verbose process steps compressed, contract clauses tightened, role-differentiation across parallel siblings (`design-review-1` vs `-2`, `brainstorm-ideate-1/2/3`, `plan-review-1/2/3`, `plan-scope-check-1/2`, `build-challenge-1/2`) so each sibling produces a distinct angle instead of redundant output. Workflow hygiene fixes: canonical Comments rule, fresh-comment discipline, save_comment as last sub-step before gate. `.claude/`/`.cursor/` mirrors regenerated; Models table rows updated.
- **Bkit-shipped scripts renamed `bkit-*` and moved to `scripts/ci/` (BAR-195).** `scripts/bkit-set-protection.sh` replaces the prior loose script layout; `scripts/rollback-main.sh` removed (subsumed by the dev-rollback runbook + `bkit-set-protection.sh`). Prefix makes it obvious to consumers which scripts are bkit-managed Tier-3 templates vs their own. `deployments.md` tables wrapped with `<!-- prettier-ignore -->` for the new column widths.
- **`turbo --continue` widened to build paths (BAR-195).** Build pipeline no longer aborts on first failure — partial failures surface together so a single CI run pinpoints all regressions instead of one-at-a-time whack-a-mole.
- **Bkit-ci-router workflow compliance pass (BAR-148).** Per-step commit pattern aligned to BAR-187 (parentSha captured at step start, file-only writes between steps, single dev commit at Close Workflow). Step 4 (Append Decision) merged into Step 5 (Dispatch); DECISION variable dropped in favour of direct status.json read.

### Fixed

- **`.agents/cloud.md` missing from CANONICAL_OVERWRITE_RELPATHS (BAR-191).** First cut of the cloud doc shipped as Tier-2-style but the file wasn't in the canonical overwrite list, so consumer drift wouldn't trigger reconcile. Added to `CANONICAL_OVERWRITE_RELPATHS` in `bkit-modules.ts`; install now overwrites on every run.

### Docs

- **`.agents/` + `docs/` index files audited and resynced.** Top-level `.agents/docs.md`, `.agents/skills.md`, `.agents/prompts.md`, `.agents/workflows.md`, and `docs/dispatch.md` rewritten against current file state — entries for removed files dropped, new files added, descriptions tightened. Eliminates the staleness that's been accreting since 2.0.4.

---

## [2.0.6] — 2026-05-12

### Changed

- **Pre-worktree commit hygiene (BAR-190).** `bkit-{ship,design,plan,build}` Step 2.1 pre-worktree commit now always carries `[skip build] [skip ci]`. `bkit-ship` Step 2.1 staging tightened to an allow-list (`docs/`, `.agents/friction.md`) matching the design/plan/build 1.1.2 fix. Step 7 Switch-to-Dev tolerates `AHEAD>0` when every ahead commit is `[skip ci]`-tagged (rebase + silent push); non-skip-ci ahead commits still route to Failure Path. Step 11 Close Workflow adds a detection guard that looks up the squash-merge SHA's CI run and fails to Failure Path if the run was cancelled or its `test*` job was skipped; Gate 11 documents the check.
- **Worktree-safe repo-root resolution (BAR-155).** All 5 phase workflows and `.agents/workflows.md` replace `$(git rev-parse --show-toplevel)` with `$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")` so orchestrators whose cwd is already inside a worktree don't double-nest `.worktrees/`. `bkit-ship` Step 4 wraps `gh pr merge` in a `cd "$(dirname …)"` subshell so `--delete-branch` stops failing with `fatal: 'dev' is already used by worktree`.
- **Cross-workflow rebase alignment (BAR-155).** `--rebase-merges` ported from `bkit-ship` to `bkit-{debug,build,design,plan}` Step 2 worktree-resume `git rebase origin/dev`, per the Workflow Authoring Rules.

### Fixed

- **Vale self-trigger on compress-markdown prompt (BAR-189).** `bkit-utility-compress-markdown.md` enumerates hedging/verbose phrases verbatim as examples to strip, so `House.Hedging` and `House.Verbose` self-fired on every consumer running `pnpm lint:prose`. Adds a scoped exemption (mirrors the existing `skills/` pattern) in both the bkit `.vale.ini` and the `templates/.vale.ini` shipped to consumers.

### Docs

- **README upgrade callout — pnpm 10 manifest narrowing (KN-22).** `pnpm update @cbartens/bkit` on pnpm 10 silently rewrites `package.json` from `"^2"` to the resolved exact minor (e.g. `"^2.0.5"`) and pins the lockfile specifier to match. README now documents the check-and-restore sequence (`grep '"@cbartens/bkit"' package.json` → if narrowed, edit back to `"^2"` and `pnpm install --frozen-lockfile=false`). KN-22 captures the root cause for future reference.

---

## [2.0.5] — 2026-05-12

### Added

- **PR-base gates (BAR-170).** `bkit-build` Step 17 asserts `gh pr view --json baseRefName` = `dev` after PR creation; `bkit-ship` Step 2 reads `baseRefName` upfront and routes wrong-base to Failure Path. Prevents the BAR-95-class incident where a `feat/*` PR landed directly on `main`. Install-time advisory `main-branch-protection-missing` surfaces when `main` has no branch protection.
- **Rollback runbook (BAR-170).** `docs/deployments.md` ships a one-shot `bash scripts/rollback-main.sh <green-sha>` automating the GitHub protection save → disable → ref-reset → restore dance, plus a manual 5-step playbook fallback. `CORE_TEMPLATE_DIRS` extended with `scripts` so utility scripts propagate to consumers.
- **CI SHA-cache skip (BAR-170).** Pre-test step queries `gh run list` for prior green runs on the same SHA within 7 days; if found, all subsequent steps skip via per-step `if:` gating. Saves 10–20 min on rollback re-runs without disturbing required status checks.
- **Revert-branch pre-push bypass (BAR-170).** `.husky/pre-push` template detects `revert-*` branches or `Revert "*"` HEAD commits and downgrades to typecheck + format:check (test suite skipped), so recovery pushes can land when the source state is transitionally inconsistent.
- **ReAct `## Hypotheses` blocks (BAR-168).** Append-only ReAct sections added to `debug-failure-diagnose` and `debug-observe-analyse` outputs (`### Hypothesis {N} / #### Reason / #### Act / #### Observe / #### Result`). Refuted entries retained for future grep. `Result` enum: `CONFIRMED | REFUTED | INCONCLUSIVE | PENDING`.
- **`## Prior Knowledge` section in diagnose output (BAR-168).** Agent must cite matched `docs/knowledge.md` KN-N entries (or "No issues found.") — proves the agent used what the workflow matrix already mandates reading.
- **`**Done when:**` line per plan task (BAR-168 stage 1).** `bkit-plan-generate` mandates a Done-when criterion derived from the Derived Test Matrix where applicable. Enforcement gates (review / scope-check / verify) deferred.
- **Debug close-workflow opens PR when none exists (BAR-188).** When `/bkit-build` fails its summary gate no PR opens against `dev`, so subsequent `/bkit-debug` remediation pushes never trigger CI (feature branches are excluded from consumer workflow `push:` triggers). Step 11 now derives `TRIGGER_PR` via a three-way check: dev/main → push fires CI; feature + PR exists → push fires `pull_request`; feature + no PR (`DEBUG_MODE=local`) → `gh pr create --base dev`.

### Changed

- **Workflow commit/push count halved (BAR-187).** Per-step double-commit pattern (work + status) collapsed via `parentSha` captured at step START instead of post-commit `commitSha`. `Step.commitSha` → `Step.parentSha` in `.agents/scripts/bkit-status.ts`. Per-step writes are file-only between steps (uncommitted on dev); dev commit + push happens exactly once per run, at Close Workflow or Failure Path with `[skip ci]` on status-only commits. plan/design success uses `git merge --squash feat/{FID}` → one `docs({FID}): {phase} DONE` commit on dev. Ship close batches Steps 7-10 into a single `docs({FID}): ship DONE [skip ci]` commit.
- **`status.json` canonical location unified (BAR-187).** All five workflows now write to `$REPO_ROOT/docs/plans/logs/{FID}/status.json` (BAR-183 generalized from plan/design to build/debug/ship). Outside-worktree progress is readable via `cat` without entering the worktree or running `git show`.
- **`Failed` Linear label cleared on recovery (workflows).** `/bkit-debug` Step 1 and `/bkit-ship` Step 11 drop the `Failed` label if present, so a recovered or shipped issue does not carry a stale Failure Path marker. Failure Paths still re-add `Failed` on a new failure. Bundled tightening: every workflow's Failure Path note reworded from "additive — phase label persists" to "prior phase label persists".
- **Top-level docs and `.agents/` prose compressed.** Dense rewrites with explicit `<!-- prettier-ignore -->` markers around width-sensitive blocks. No semantic change.

---

## [2.0.4] — 2026-05-12

### Changed

- **`.husky/pre-commit` and `.husky/pre-push` migrated from Tier 2 (managed-block enforced) → Tier 3 (seed-or-print).** The `tier2-text-drift` gate failed `bkit check` in CI whenever a consumer customised the bkit-managed block, forcing them either back to the canonical content or to delete the block (which the next install would re-seed — there was no stable opt-out). The new tier ships the hook as a full-file template (no `bkit:start/bkit:end` markers): bkit seeds the canonical hook for new consumers and emits a `tier3-merge-suggested-pre-{commit,push}` advisory when one already exists, never enforcing drift. Declarative pattern files (`.gitignore`, `.prettierignore`) stay Tier 2 because their semantics genuinely require additive merging; imperative hook scripts don't. Migration is non-destructive — existing consumers with the legacy marker-block format keep their file unchanged on next install, get the advisory, can choose to migrate or ignore. **Manifest format flipped `markered-text` → `byte-equal-text`** for both husky paths; `bkit uninstall` now hash-guards deletion (preserves consumer-modified hooks rather than stripping a block). **Removed detectors:** `detectHuskyNoMarkers` and `detectHuskyBlockDuplicates` (and their `husky-no-markers-*` / `husky-block-duplicates-*` advisory IDs) — both keyed to the obsolete Tier-2 managed-block design.

---

## [2.0.3] — 2026-05-12

### Added

- **`utility-new-release` agent prompt** (`.claude/agents/utility-new-release.md` + `.agents/templates/`) — codifies the dev → main → tag → publish flow so future cuts avoid the KN-20 silent-skip trap (explicit scrubbed squash body, post-tag Release-workflow verification).
- **`lint-staged` adoption** — bkit pre-commit hook (consumer template + bkit-repo) now runs `pnpm lint-staged` so staged files are formatted via `prettier --write` at commit time. Pre-push keeps `pnpm format:check` as the safety net for hook-bypass cases (--no-verify, GitHub web edits, stale local config). Matches gether's pattern.
- **`.lintstagedrc.json` seed** — `bkit install` writes the lint-staged config (`"*": "prettier --write --ignore-unknown"`) as Tier-3 (seed-or-print) and adds `lint-staged` to consumer devDependencies so the new pre-commit call resolves without manual setup.

### Changed

- **`.prettierignore` bkit-managed block** narrowed — removed `.agents/prompts.md`, `.agents/workflows.md`, `.agents/IDEs.md`, and `docs/` from the canonical-overwrite ignore set so Prettier formats them in consumer repos. The affected paths are width-invariant under Prettier's default `proseWrap: "preserve"`: only one inline JSON example and one Markdown table in `workflows.md` were genuinely width-sensitive — both now wrapped with `<!-- prettier-ignore -->` (BAR-165 root-cause fix superseding the v1.1.1 ignore-list workaround). `templates.test.ts` BAR-165 invariant loop removed — no longer load-bearing.

### Fixed

- **`.npmrc` advisory copy: revert to plain `${GH_BKIT_TOKEN}` (reverses BAR-142 §B6).** The 2026-05-06 ship prescribed `_authToken=${GH_BKIT_TOKEN:-}` on the assumption pnpm parsed POSIX-style fallback. It does not: pnpm's npmrc env-var substitution only supports the simple `${VAR}` form and treats `GH_BKIT_TOKEN:-` as a literal var name, sending no auth header and producing an opaque 401 from the GH Packages registry — strictly worse than the original silent-fallback behaviour. Compounded by the fact that bkit's own `detectNpmrcAuth` validator (`bkit-postinstall.ts:45`) matches the plain form, so consumers who followed the buggy advisory failed bkit's own `npmrc-missing-gh-packages` check. Fixed the two advisory strings in `bkit-modules.ts` (first-install banner + CI guidance block) and the `gh-bkit-token-missing-shell` empty-token detect text. Flipped the enforcement test in `bkit-preflight.test.ts` to assert the plain form and explicitly forbid the broken `${VAR:-}` form across all script files.
- **Phantom `.prettierignore` "block broadened" advisory.** `BKIT_PRETTIERIGNORE_PATHS` in `bkit-preflight.ts` had drifted from the actual template at `.agents/templates/.prettierignore` — it listed `.agents/` and `docs/` (no longer in the template) and was missing `.claude/` and `.cursor/`. Every install on a consumer whose block contained `.agents/skills/` falsely fired "block is being broadened on this install: .agents/skills/ → .agents/" even though the install wrote `.agents/skills/` straight back. The constant now mirrors the template exactly; regression test added.

### Added

- **AGENT NOTE on token-missing advisories** — appended `AGENT_INLINE_SOURCE_GUIDANCE` to both `gh-bkit-token-missing-shell` advisories (missing + empty) explaining the `set -a; source <env-file>; set +a; <cmd>` single-Bash-call pattern. AI coding agents whose permission rules block `Read`/`grep` on `.env*` can still load `GH_BKIT_TOKEN` into a single command's environment without the token text entering their context, since `source` is a shell builtin and bypasses the permission layer that gates file I/O.

---

## [2.0.2] — 2026-05-11

### Added

- **Claude Cowork Dispatch support** — `BKIT_PREFLIGHT_BYPASS=dispatch` env var skips the Linear `Auto`/state guards so phone-triggered sessions without a Linear issue context can run. Destruction guards remain in force. (BAR-186)
- **`docs/dispatch.md`** documents Dispatch surfaces (Cowork bash sandbox vs computer-use), venv reproducibility (`uv` preferred, never commit `.venv/`), `direnv`/`mise` auto-activation requirement for tier-`click` terminals, keep-awake, and preflight interaction. Registered under a new "Operations" section in `.agents/docs.md` catalog + Workflow Matrix. (BAR-186)
- **`.agents/rules.md` Dispatch & Remote Sessions subsection** (canonical + template). (BAR-186)
- **Manual-seed templates** at `.agents/templates/.envrc.example` and `.agents/templates/.nvmrc` — copy into consumer repos when enabling Dispatch (NOT auto-installed; would otherwise overwrite consumer Node pins). Setup checklist in `docs/setup.md`. (BAR-186)
- **Preflight test coverage** — 7 new tests in `.agents/scripts/bkit-preflight.test.ts` covering Darwin gate, bypass position, additionalContext text, and 4 subprocess scenarios. (BAR-186)

### Fixed

- **Brew-bin preflight check is now Darwin-gated.** Previously `gh jq vale pnpm bun` were checked unconditionally and would hard-stop any Linux session (Cowork sandbox, CI, dev containers). (BAR-186)
- **Linear label rename `Automated` → `Auto`** propagated through preflight hooks (Claude + Cursor), rules, README, and Dispatch docs. The previous gate would have refused every cloud / Cursor Cloud Agent session against Linear workspaces using the new label name. (BAR-186)

---

## [2.0.1] — 2026-05-11

### Fixed

- **Re-publish patch:** bumps version to avoid E409 conflict from 2.0.0 GitHub Packages publish attempt. No code changes from 2.0.0. (BAR-167)

---

## [2.0.0] — 2026-05-11

### Removed (breaking)

- **`__bkit__` JSON envelope removed** from `.claude/settings.json` and `.cursor/hooks.json` templates. Reverses DE-7 and DE-8. Consumers upgrading from v0.8.0–v1.1.1 will have the `__bkit__` block stripped automatically on first `bkit upgrade`. Consumer-added keys outside the template tree survive byte-identical. (BAR-167)
- **Public API deletions from `bkit-tiers.ts`:** `applyBkitNamespace`, `extractBkitNamespace`, `migrateTier1JsonToTier2`, envelope-guard `throw` branch of `writeTier2Json`. (BAR-167)
- **`writeTier2Json` renamed to `writeTier2JsonContained`** — callers in `bkit-modules.ts` updated. (BAR-167)
- **`bkit-tier1-defaults.ts` deleted** — sole consumer was `migrateTier1JsonToTier2`. (BAR-167)

### Changed

- **Added `bkit:start..bkit:end` markers to 12 Group A templates:** `AGENTS.md`, `CLAUDE.md`, `.cursor/rules/00-shared-rules.mdc`, `.vale/styles/House/Filler.yml`, `.vale/styles/House/Hedging.yml`, `.vale/styles/House/LLMSlop.yml`, `.vale/styles/House/Verbose.yml`, `.agents/rules.md`, `.agents/docs.md`, `.agents/friction.md`, `.agents/skills.md`, `docs/plans/template.md`. (BAR-167)
- **Added partial-ownership `bkit:start..bkit:end` markers to 3 Group B templates:** `.github/workflows/ci.yml`, `.vale.ini`, `.husky/pre-push`. (BAR-167)
- **New `lint:no-tier-terms` script** enforces no `Tier [1-3]` terminology in docs. (BAR-167)
- **Simplified `bkit-manifest.ts` schema:** `tier` integer removed; `format` field added (`json | markered-text | byte-equal-text`). (BAR-167)
- **New advisory `tier2-text-drift`** emitted by `bkit check` when markered-text file content drifts from template block. (BAR-167)

### Changed (breaking)

- **`.cursor/hooks.json` template migrated to Cursor v1 keyed-object schema.** Old shape: `{"hooks": [{event, command}]}`. New shape: `{"version": 1, "hooks": {"sessionStart": [...], "sessionStop": [...]}}`. Existing consumers are migrated automatically on `bkit upgrade`. (BAR-167)
- **Ownership model for Tier-2 JSON is now deep-containment.** The template JSON tree is the declared bkit scope; `deepContains(template, consumer)` verifies every leaf is present. `writeTier2JsonContained` replaces the envelope-guard write path. No `__bkit__` key is written or expected. (BAR-167)

### Added

- **`deepContains(template, consumer, pathPrefix?)` primitive** — recursive walk; returns `{ ok, missing, mismatched }`. Supports object containment, array-of-primitive subset, array-of-object element-wise order-insensitive containment, null-input boundary cases. (BAR-167)
- **`migrateLegacyBkitEnvelope(doc, template)` helper** — pure function, no file I/O. Strips `__bkit__`, runs `deepContains`, deep-merges if containment fails. Returns `{ stripped, deepMerged, schemaFlipped, outDoc }`. Idempotent. (BAR-167)
- **`stripTier2JsonScope(consumerDoc, templateDoc)` helper** — for `bkit uninstall`: removes template scope, preserves consumer-only siblings, prunes empty intermediates only where template populated them. (BAR-167)
- **`bkit-paths.ts`** — new module exporting `getPkgRoot()`. Breaks `bkit-preflight ↔ bkit-modules` circular import. (BAR-167)
- **Preflight advisories:** `legacy-bkit-envelope-detected` (advisory, fires when `__bkit__` present), `tier2-json-drift` (advisory, fires when `deepContains` fails for `.cursor/hooks.json` or `.claude/settings.json`). (BAR-167)
- **Preflight blocker:** `pre-envelope-bkit-version-detected` (fires when `pinnedVersion < 0.8.0` AND no `__bkit__` — consumer must route through v1.x first). (BAR-167)
- **`workflow_dispatch:` trigger added** to `.github/workflows/ci.yml` and the consumer `ci.yml` template. Allows manual CI runs on feat branches without an open PR (`gh workflow run ci.yml --ref feat/{FID}`). (BAR-167)

### Migration

- Run `pnpm bkit upgrade` after bumping to v2.0.0. `migrateLegacyBkitEnvelope` strips the `__bkit__` block from `.claude/settings.json` and `.cursor/hooks.json` and logs `[bkit] migrated <file> — stripped __bkit__ envelope (v2.0.0)`. Run `pnpm bkit check` to verify zero drift.

---

## [1.1.2] — 2026-05-11

### Fixed

- **Pre-worktree `git add` in `bkit-design` and `bkit-plan` no longer absorbs unrelated in-flight edits into the workflow's commit.** Step 1 (start-workflow) and Step 2's pre-worktree-uncommitted guard execute on the originating branch (often `dev`) before `cd "$WORKTREE_PATH"`. The prior `git add -A` (design Step 1) and broad deny-list (both Step 2 guards) swept the user's working-tree state into the workflow's commit, which then rode `feat/{FID}` → `dev` on close-workflow merge. Both pre-worktree stages now allow-list `docs/plans/ .agents/friction.md` only, with `git diff --cached --quiet ||` guarding the commit so no empty commit fires when those paths weren't touched. `git worktree add` does not inherit dirty state, so leaving other edits on `dev`'s working dir is correct, not a hazard. Post-worktree (Step 3+) `git add -A` is unchanged — cwd is the workflow sandbox. Rationale documented in `.agents/workflows.md` § Common Workflow Anatomy. `bkit-build` / `bkit-debug` / `bkit-ship` still carry the same pattern and are deferred to a follow-up.

---

## [1.1.1] — 2026-05-09

### Fixed

- **Canonical-overwrite content (`.agents/prompts.md`, `.agents/workflows.md`, `.agents/IDEs.md`) added to bkit-managed block of `.agents/templates/.prettierignore`.** These files are force-overwritten by `bkit install` (`CANONICAL_OVERWRITE_RELPATHS` in `bkit-modules.ts`), and v1.1.0 added `pnpm format:check` to the pre-push hook template. A consumer whose prettier config resolved to a narrower `printWidth` than bkit's 100 (e.g. prettier defaults at 80) saw `format:check` fail on width-sensitive lines in the canonical content, with no consumer-side fix that survived the next install. Now consumer prettier no longer lints bkit-owned content — same precedent as the existing `.agents/skills/` exclusion. Test guard: `templates.test.ts` asserts every path in `CANONICAL_OVERWRITE_RELPATHS` is listed inside the bkit-managed block. (BAR-165)

---

## [1.1.0] — 2026-05-09

### Removed (breaking, but no consumer was usefully relying on it)

- **`setup-auth@v1` composite GitHub Action** (`.github/actions/setup-auth/`) and its meta-test workflow (`.github/workflows/test-action.yml`). The composite was unreachable from any consumer outside the `cbartens/` GitHub namespace while `bkit` stayed private — the runner's `GITHUB_TOKEN` cannot resolve cross-org private `uses:` references at action-resolution time, so `cbartens/bkit/.github/actions/setup-auth@<ref>` failed with "repository not found" before the install step ran. Both real consumers are on the env-var pattern and unaffected. (BAR-164)

### Changed

- **Canonical `ci.yml` template now uses the env-var pattern only.** `.agents/templates/.github/workflows/ci.yml` no longer references the deleted composite. The install step continues to receive `GH_BKIT_TOKEN` as env — the consumer's `.npmrc` (`//npm.pkg.github.com/:_authToken=${GH_BKIT_TOKEN}`) authenticates the registry directly. New consumers seeded after this release get the working template. (BAR-164)
- **README "Adding a new consumer — checklist"** added at the top of §Install — threads the existing §"Consumer CI auth" + §"Consumer Vercel auth" sections into a 7-step trail (PAT → secret → `.npmrc` → install → bkit install → Vercel → push). The §"Helper action: `setup-auth@v1`" and §"Consumer migration — pin to sliding `@v1`" sections were removed (composite no longer ships). (BAR-164)
- **`docs/deployments.md` § "`setup-auth@v1` composite GitHub Action"** removed; replaced by § "Consumer CI auth — env-var pattern (canonical)". § "Sliding major-version tag" retained — internal release-pipeline mechanics, orthogonal to the composite. (BAR-164)

### Added

- **Installer guard `scanForeignBkitUses`** (`bkit-modules.ts`). `runCiModule` now scans the canonical CI template for `uses: cbartens/bkit/...@<ref>` references before writing and throws if any are present. Catches BAR-164-class regressions at dev/CI time so a broken template can never reach a consumer repo. (BAR-164 AC #6)

### Notes

- Sliding `v1` git tag and the `release.yml` job that maintains it are kept untouched. Consumers transitioning to in-namespace tooling will pin to it later.

---

## [1.0.2] — 2026-05-08

### Fixed

- **Prevent bkit dogfood content from leaking into consumer `.agents/` on install.** `runCoreTemplates` now processes `.agents/` subtemplates from `templates/.agents/` (managed block sourced from the template), and `copyAdditive` excludes the Tier-2-style basenames (`rules.md`, `friction.md`, `docs.md`, `skills.md`) so it no longer additively copies bkit's own out-of-block content (e.g. `### bkit Repo Authoring`, bkit's `## Project Rules` body, friction-log entries) onto consumers. Added `bkit-modules.integration.test.ts` to lock the boundary. (commit `f6be98b`)

### Changed

- **`README.md` / `.agents/README.md` install docs.** Added explicit `GH_BKIT_TOKEN` export guidance for environments with restricted `.env*` access; clarified consumer-facing install flow. Trimmed redundant pre-push checklist from `.agents/rules.md`. (commit `f6be98b`)

---

## [1.0.1] — 2026-05-08

### Fixed

- **`bkit upgrade` no longer silently overwrites files lacking a recorded canonical hash.** Previously `isConsumerModified` returned `false` for unknown-hash files, which the upgrade engine treated as "no drift detected → safe to overwrite". Pre-v0.9.x installs (where `canonicalHashes` did not exist) and any managed file not re-written by `bkit install` since BAR-142 landed had no hash recorded — a single `bkit upgrade` could destroy consumer content. Default flipped: missing hash now returns `true` (treat as modified, surface a conflict, require explicit consumer resolution). `diffFile`'s idempotent `disk == template → skip` check moved earlier so identical files still skip cleanly. (DE-12, commit `954e827`)
- **`.claude/settings.json` template now matches consumer mirror for `apps/*/.env` and `packages/*/.env` reads.** Original deny→ask move (commit `1ecd15d`) only edited the consumer mirror; the canonical template still listed those reads under `deny`, so the next `bkit install` mirror-regen reverted the move. Now editing both in lockstep. (commit `8db6636`)

### Added

- **Auto-seed `canonicalHashes` for skipped files on `bkit upgrade`.** `updateCanonicalHashesAfterUpgrade` now records canonical hashes for files where `disk == template` (the upgrade engine's `skip` classification), in addition to the existing `update` path. Conflict files are explicitly NOT seeded — that would re-introduce the silent-overwrite bug. Effect: running `bkit upgrade` once after this release auto-heals the missing-hash gap for any consumer installed before BAR-142. Truly-customised files continue to surface as conflicts requiring manual resolution. (DE-13, commit `e2889e1`)

### Notes

- Pre-v0.9.x consumers will see all-conflict on first `bkit upgrade` after this release. This is the safe failure mode — review each conflict, accept or reject, and the auto-seed populates canonical hashes for any files where you accept the bkit template. Subsequent upgrades will only flag genuine drift.

---

## [1.0.0] — 2026-05-07

### Added

- **`setup-auth@v1` composite action** — GitHub Actions composite action at `.github/actions/setup-auth/action.yml` wraps the multi-line bash PAT-shim. Consumers reference `uses: cbartens/bkit/.github/actions/setup-auth@v1`. Requires `v1` annotated tag (pushed post-merge). Inputs: `token` (required, `GH_BKIT_TOKEN` PAT), `registry` (optional, defaults to `https://npm.pkg.github.com`). Exports `BKIT_READ_TOKEN` into the job env. (BAR-131 §1)
- **`v1` annotated tag** — pushed post-merge, pointing to the sub-plan-4 squash-merge commit. Required for `uses: cbartens/bkit/.github/actions/setup-auth@v1` to resolve in consumers.

### Notes

- Multi-line bash PAT-shim block in seeded `ci.yml` is **retained** (RETAIN-WITH-REASON: external contract — non-Actions CI fallback). Kill-date: v1.1.0.
- `.github/workflows/test-action.yml` meta-test workflow added for manual `workflow_dispatch` smoke testing.
- Offline acceptance test `bkit-action-yaml.test.ts` parses `action.yml` without network calls.

---

## [0.9.0] — 2026-05-07

### Added

- **Transactional install** — `bkit install` now writes to `.bkit-staging/<module>/` per module before committing. On success, staged files are atomically renamed to consumer destinations. On failure, `discardAllStaging` removes all staging dirs — consumer files left byte-identical to pre-install state. (BAR-142 §A4)
- **`bkit upgrade` verb** — diff engine compares old vs new template content against consumer drift. Non-conflicting changes applied automatically; conflicting files (consumer-modified since install) emitted to stderr without overwrite. `--non-interactive` flag: auto-apply non-conflicting; exit non-zero on any conflict (CI-safe). (BAR-142 §A5)
- **`canonicalHashes` in `.bkit-version`** — additive field (v0.9.x+) records sha256 of every bkit-managed file at install time. Used by `bkit upgrade` drift detection. Backward-compat: absent field defaults to `{}` (all files appear "unknown" → conservative no-overwrite). (BAR-142 §A5)
- **`isConsumerModified` helper** — exported from `bkit-version.ts`; returns true when a managed file's on-disk hash differs from its recorded canonical hash (consumer drift). (BAR-142 §A5)

### Breaking Changes

None. All new surface is additive. `canonicalHashes` absent in old `.bkit-version` payloads defaults to `{}` — backward-compat read.

---

## [0.8.0] — 2026-05-07

### Added

- **`__bkit__` JSON namespace (public contract)** — `.claude/settings.json` and `.cursor/hooks.json` now carry a `__bkit__` top-level envelope containing bkit's managed payload. Consumer-added keys live outside the envelope and survive every `bkit install` upgrade byte-identically. This is a public contract: the key name is stable from v0.8.0 onward. (BAR-142 §A1)
- **Tier-2 JSON deep-merge** (`writeTier2Json`) — replaces the Tier-1 full-overwrite for ownership-mixed JSON files. bkit updates only `__bkit__`; consumer keys are never touched. Throws explicitly when template lacks `__bkit__` envelope (rollback safety). (BAR-142 §A1)
- **Tier-1 → Tier-2 auto-migration** (`migrateTier1JsonToTier2`) — consumers upgrading from v0.5.x–v0.7.x have their existing files automatically migrated on the first v0.8.0 install. Consumer-added keys (e.g. `hooks.Stop`, `failClosed`, `loop_limit`) are preserved outside `__bkit__`. Idempotent. (BAR-142 §A1)
- **Versioned-defaults SoT** (`bkit-tier1-defaults.ts`) — `BKIT_TIER1_DEFAULTS_BY_VERSION` snapshots bkit's shipped template shapes at v0.5.x–v0.7.x. Used by migration to identify bkit-owned vs consumer-added keys when upgrading from pre-`__bkit__` installs. (BAR-142 §A1)
- **B3 — Vercel CLI hang guard** — `detectVercelEnv` now pre-checks `.vercel/project.json` before shelling out to `vercel env ls`. If the project is not linked (file absent), the CLI call is skipped entirely — no TTY hang, no login prompt in non-interactive CI. (BAR-142 §B3)

### Breaking Changes

- **`.claude/settings.json` and `.cursor/hooks.json` reclassified Tier-1 → Tier-2.** Files written by prior bkit versions are auto-migrated to the `__bkit__` envelope form on the first v0.8.0 install. Consumers with custom hook entries no longer need to skip `--claude` / `--cursor` to prevent overwrite. The `detectHooksConfigOverwriteRisk` preflight blocker is removed (architecturally redundant). **Action required: run `pnpm bkit install` after upgrading to v0.8.0** to apply migration.

### Removed

- **`detectHooksConfigOverwriteRisk`** — preflight blocker (ids `hooks-config-overwrite-risk-claude`, `hooks-config-overwrite-risk-cursor`) removed. No longer needed: Tier-2 deep-merge guarantees consumer keys survive upgrades without a preflight gate. (BAR-142 §A1)

---

## [0.7.0] — 2026-05-07

### Added

- **`bkit uninstall` verb** — surgical removal of bkit-managed content. Tier-1 files deleted, Tier-2 managed-block stripped (consumer content preserved), Tier-3 files protected by sha256 hash guard (deleted only if content matches install-time hash). Module flags mirror install (`--ci`, `--lint`, `--git-hooks`, etc.). (BAR-139)
- **`--dry-run` for uninstall** — prints a `FILE | DECISION | REASON` table without writing. (BAR-139)
- **`--nuke` for uninstall** — deletes ALL bkit-managed files regardless of tier; requires `--yes` or interactive confirm. (BAR-139)
- **`--auto-revert` for install** — on Phase 3 blocker, automatically reverts via `bkit uninstall` in-process before exiting 1. (BAR-139 §7)
- **`process.exit(1)` on Phase 3 blockers** — `bkit install` now exits 1 when a `severity: "blocker"` finding is detected in Phase 3. Prints a single-line recovery command: `pnpm bkit uninstall <flags> && <fix> && pnpm bkit install <flags>`. Advisory findings remain informational only. (BAR-142 §A6)
- **`.bkitignore` parser** — create `.bkitignore` at repo root to suppress `bkit check` drift for specific files (picomatch globs) or JSON keys (`:dotted.key` syntax, opt-in via `BKIT_BKITIGNORE_PER_KEY=1`). Comments (`#`) and blank lines ignored. (BAR-142 §A2)
- **`.bkit-version` schema extension** — file format upgraded from plain-text semver to JSON `{ pinnedVersion, tier3Hashes }`. Backward-compatible: old plain-text format is auto-parsed. `tier3Hashes` records sha256 of Tier-3 files at install time for safe-delete decisions during uninstall. (BAR-139)
- **Per-module install manifest** (`bkit-manifest.ts`) — typed record of files each module writes with tier classifications; drives uninstall and `package.json` key stripping. (BAR-139)

### Breaking Changes

- `process.exit(1)` on Phase 3 blockers: **consumers gating CI on `bkit install` exit code may see new failures** if Phase 3 blocker conditions are present. Advisories continue to exit 0. See § Phase 3 exit-1 and recovery in README.

---

## [0.6.0] — 2026-05-07

### Added

- **`bkit doctor` verb** — read-only preflight + post-install advisory replay. Run `pnpm bkit doctor` to diagnose drift without writing. Exits 0. (BAR-142 §A3)
- **CHANGELOG.md** — this file; shipped in tarball and surfaced as a version-delta header in post-install. (BAR-142 §A7)

### Fixed

- **B1 — Anchored marker regex** — `hasBkitMarkers` now uses line-anchored detection (matching `findLineAnchoredMarkers`). Prose-fenced `` `<!-- bkit:start -->` `` inside markdown no longer falsely suppresses the `husky-no-markers` advisory. (BAR-142 §B1)
- **B2 — Position-stable cross-phase dedup** — `runPostInstallCheck` cross-phase dedup now preserves preflight advisory order (preflight first, Phase 3 at back), matching `formatChecklist` display order. (BAR-142 §B2)
- **B4 — `detectShellToken` empty vs unset** — Empty-string `GH_BKIT_TOKEN=""` is now treated as missing (was silently "present"). Action text differentiates the two cases. (BAR-142 §B4)
- **B5 — `LOG_PREFIX` on dry-run blocker banner** — The dry-run blockers banner now carries the `[bkit-check]` or `[bkit-install]` log prefix. (BAR-142 §B5)
- **B6 — `.npmrc` `${GH_BKIT_TOKEN:-}` fallback + concrete action text** — Inline `.npmrc` literal in `bkit-modules.ts` now uses the POSIX `${GH_BKIT_TOKEN:-}` fallback form so pnpm does not silently ignore the entire `.npmrc` when the token is unset. Action text for `gh-bkit-token-secret-unknown` instructs: `export GH_BKIT_TOKEN=$(gh auth token)`. (BAR-142 §B6)
