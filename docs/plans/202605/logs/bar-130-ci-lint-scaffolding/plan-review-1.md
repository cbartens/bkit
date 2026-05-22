Verdict: CONCERNS
Failures: 7

<!-- verdict:end -->

# Plan Review — BAR-130

Plan covers all 14 DoD bullets, anchors to real files (`bkit-install.ts` v0.1.1, `bkit-init.ts`, templates dir), and follows template structure. Three scopes (A/B/C) split cleanly. Reproduce-first cadence is honoured (failing tests precede implementation). Acceptance Scenario, Edge Cases, and a 21-row Derived Test Matrix are populated. However, several CRITICAL issues constrain single-session executability and one OOS boundary risk warrants flagging before build.

## CRITICAL

1. **Single-session scope is unrealistic.** Phase 0–10 totals ~36 distinct tasks across new modules `bkit-tokens.ts`, `bkit-tiers.ts`, `bkit-cli.ts`, `bkit-modules.ts`, deletion of `bkit-init.ts`, ~21 new tests, six new template payloads (CI, Vale, Vale styles tree, husky pair, prettierignore, cursor x2), self-gating CI workflow, README/`.agents/README.md` rewrites, and decisions/pending appends. Even a senior agent cannot ship this in one high-quality session — this is multi-session work. **Action:** Either (a) decompose BAR-130 into sub-issues (e.g., BAR-130A scopes A+B installer core, BAR-130B scope C CLI redesign + deprecations, BAR-130C templates + self-gating, BAR-130D docs + ship) and create separate plans, OR (b) explicitly call out the multi-session expectation in `## Context & Goals` and structure phases as commit-able milestones with self-contained verifications. Current plan claims single-session ship which the task list contradicts.

2. **Phase 7 Task 7.1 introduces `BKIT_READ_TOKEN` indirectly via auth-shim wording but bkit's OWN ci.yml does NOT need the shim** (per Task 7.1 itself: "auth-shim NOT needed for bkit's own repo since CI clones itself"). Conversely, bkit's `bun .agents/scripts/bkit-install.ts check` self-test step assumes `bun` is on the runner. **Action:** Task 7.1 must specify the `oven-sh/setup-bun@v2` step (or `pnpm tsx` alternative) before the self-test line; current plan silently assumes `bun` is preinstalled on `ubuntu-latest`, which it is not.

3. **Task 4.4 deletes `bkit-init.ts` but Supersession Inventory marks the `init` verb as `RETAIN-WITH-REASON`.** The file `bkit-init.ts` (84 LOC) is decided DELETE; the `init` verb is RETAIN. The plan body conflates this in the §B [DELETE] section ("Mirror in Supersession Inventory: tracked as RETAIN-WITH-REASON because the `init` verb itself remains…") but the Supersession table row is for `runInit()` in `bkit-init.ts`, which is RETAIN, not DELETE. **Action:** Add an explicit second Supersession row: `bkit-init.ts file → DELETE (logic migrates to runCoreModule); init verb → RETAIN-WITH-REASON in bkit-cli.ts (deprecation stub through v0.1.x).` Two separate artifacts, two separate decisions.

4. **`docs/pending.md` kill-date entries are mandatory but the plan only describes them in prose.** Per `.agents/rules.md` Supersession rules: every RETAIN-WITH-REASON requires a kill-date + follow-up tracked in `docs/pending.md`. Task 9.2 lists "init verb removal at v0.2, --host= removal at v0.2" but does not specify the issue ID to track these against. **Action:** Task 9.2 must specify creating Linear issues (or referencing an existing parking-lot issue, e.g., BAR-2XX) for the v0.2 removals; without an issue ID the kill-date is unenforceable.

5. **Pre-PR gate command in Task 10.2 references `pnpm turbo` but bkit's `package.json` has no `turbo` config and no `turbo` devDep.** Plan says "(or sequential equivalent if no turbo)" — but the rule (`pnpm turbo lint typecheck format:check test`) is what is mandated. Either bkit must add `turbo.json` + `turbo` devDep (NOT in scope per BAR-130), or the rule is bkit-consumer-facing only. **Action:** Task 10.2 must explicitly resolve to `pnpm lint:prose && pnpm lint:slop && pnpm typecheck && pnpm format:check && pnpm test` (sequential — bkit is a single-package repo, no turbo benefit). Remove `pnpm turbo` reference to avoid build-agent confusion.

6. **`lint:prose` script wording in Task 7.4 contains shell-quoting issues.** Plan writes `lint:prose: "vale .agents/ *.md || (echo 'vale not in PATH — skipping' && exit 0)"`. The `*.md` glob expands at the npm-script shell layer; on macOS zsh vs Linux bash this can mis-glob. Worse, `||` followed by `&& exit 0` swallows ALL non-zero exits including real Vale findings, which defeats `lint:prose`. **Action:** Specify `vale --no-exit .agents/ '*.md'` (Vale's own `--no-exit` returns 0 on findings; binary-missing returns 127, handled by separate `command -v vale >/dev/null || (echo skip; exit 0)` prefix). Plan should pick one of these patterns explicitly, not both via `||`.

7. **Edge Case row "Mid-install crash between Tier 1 and Tier 2" defers atomicity to "rerun fixes" but the plan lacks a Phase 6/7 task asserting `.bkit-version` write is the LAST step of `runCoreModule`.** Edge Cases promises ordering; runbook does not enforce it. **Action:** Add an explicit task in Phase 4 (Task 4.5 or amendment to 4.2): "In `runCoreModule`, ensure `.bkit-version` write is sequenced AFTER all other core writes (payload mirror, `rules.md` block, `.gitignore` block) so a partial install leaves the version file unwritten and a re-run is detected as upgrade-needed." Add a corresponding test in `bkit-modules.integration.test.ts`.

## OPTIONAL

1. **Test-count estimate inconsistent.** Plan states "~30 new tests" in Verification Plan but Test Matrix has 21 rows. Task 0.2 says "one `it.todo` per Derived Test Matrix row" → 21 stubs. Reconcile to avoid implicit scope creep during execution.

2. **`runCoreModule` absorbing `runInit` body** (Task 4.2) — `runInit` currently does additive copy of `.agents/` payload from `PKG_AGENTS` to consumer `cwd` AND `.bkit-version` write. The plan should explicitly note that `runCoreModule` must ALSO emit the `rules.md` block (Tier 2 markdown-comment) and `.gitignore` block (Tier 2 markdown-comment), since both are existing Tier 2 work currently in `runTemplates`. Otherwise selective `--claude` install loses the `rules.md`/`.gitignore` block updates that were always part of pre-v0.1.2 `init`.

3. **Token resolver fallback for `git symbolic-ref`** when `origin/HEAD` is not set (fresh `git init`, no remote) — `git symbolic-ref refs/remotes/origin/HEAD` exits non-zero. The plan says "default `main`" but doesn't specify whether the resolver swallows the non-zero exit silently or logs a warning. Pin the behaviour: silent fallback to `main` + single-line `[bkit-install] info: default branch fallback → main` log.

4. **Husky executable-bit handling** (Task 6.5) — `0o755` mode set at write-time only works if Tier 2 logic preserves mode on append-block reconcile. If consumer chmod-es differently, the second install should NOT clobber. Specify behaviour: bkit sets `0o755` on first write; preserves existing mode on subsequent writes.

5. **Tier 3 print-sink ordering** is unspecified. If `--ci --lint --git-hooks` all push to `printSink`, what order do they emit? Suggested rule: module-dispatch order (CI → lint → git-hooks) with section headers per module so consumers can copy-paste in chunks.

6. **Phase 0 Task 0.2 creates 5 test stubs but Phase 5 Task 5.1 references a 6th file** (`bkit-dry-run-parity.integration.test.ts`). Task 0.2 already lists this file. Cross-check: count is 5 in §B "Test files" prose but 5 listed in Task 0.2. Verify final list = 5: `bkit-tokens.test.ts`, `bkit-tiers.test.ts`, `bkit-cli.test.ts`, `bkit-modules.integration.test.ts`, `bkit-dry-run-parity.integration.test.ts`. Plus extension of existing `bkit-install.test.ts`. OK as-is — but ensure Task 0.2 verifies all 5 stub files in CI before phase progression.

7. **Self-test step in `.github/workflows/ci.yml`** (Task 7.1) runs `bun .agents/scripts/bkit-install.ts check` against bkit's own checkout. This will report drift on every PR until templates are byte-identical to `.agents/templates/` source files. Add an upfront test (post Task 6 / pre Task 7.1) asserting `bkit check` exit 0 against bkit-itself, so Task 7.1 push doesn't reveal latent drift.

8. **Verification Step 8** ("Second consumer onboarding `www-visitfrasercoast-com`") is marked as separate human session not auto. Good — but plan should explicitly note this DoD bullet 13 is not a Gate 4 blocker for this PR; it's a post-merge tracking item. Otherwise build agent may stall waiting for second-consumer signal.

## OUT OF SCOPE

1. **Plan adds prettier** as a devDep — bkit's lint discipline gain. Not flagged in BAR-130 OOS list, so this is in scope. But the broader question: should bkit also add ESLint? BAR-130 OOS does not exclude ESLint and `.agents/rules.md` § Pre-PR mentions `lint`. Plan does NOT add ESLint, only prettier. **Suggestion:** route ESLint adoption to `docs/pending.md` for v0.1.3+ — out of scope here, but worth flagging the gap so future maintainers don't think it was forgotten.

2. **Task 7.4 adds `format:check`/`format` scripts via prettier** — fine. But the plan does NOT add `lint` script (only `lint:prose` and `lint:slop`). The Pre-PR gate `pnpm turbo lint typecheck format:check test` calls `lint`. Adding a top-level `lint` script that aggregates `lint:prose && lint:slop` would honour the rule contract. Currently scoped under "out of scope for v0.1.2 build" implicitly. **Suggestion:** Either (a) include a top-level `lint: "pnpm lint:prose && pnpm lint:slop"` script in Task 7.4 (small, in-scope), or (b) explicitly document in `docs/pending.md` why bkit lacks a unified `lint` entrypoint.

3. **Plan does not touch `.github/workflows/release.yml` / `bkit-ship.yml`** — BAR-130 OOS list explicitly excludes "release-automation workflows" and "claude.yml/ci-complete.yml/smoke.yml", which the plan correctly avoids. No action needed; flagged as compliance check passed.

4. **Helper auth action `cbartens/bkit/.github/actions/setup-auth@v1`** — plan correctly defers to BAR-131. Reusable workflows likewise deferred. `--no-X` / `--force` flags deferred. `package.json` automated merging deferred. Husky auto-install confined to seed-only. All OOS items respected.

---

**Boundary checks:**

- Branch convention `feat/bar-130-ci-lint-scaffolding`: confirmed in Task 0.1.
- Commit format `{type}({FID}): {message}`: not explicitly mentioned but is universal rule; orchestrator/builder enforces.
- `--no-verify` ban: not violated; no `git` task in plan.
- Pre-PR gate: see CRITICAL #5 (turbo reference).
- Integration/E2E only post-PR: plan mixes `*.test.ts` and `*.integration.test.ts` in Vitest single suite, run pre-PR. **Note:** project rule says "Integration and E2E: Debug workflow only (post-PR)". Bkit's integration tests are filesystem-only (no DB, no live APIs) — arguably fine to run pre-PR for this CLI tool. Worth a one-line confirmation in plan that bkit's integration tier is filesystem-fast and does not need post-PR gating. Currently implicit.

**Files referenced (all absolute):**

- `/Users/christian/Documents/GitHub/bkit/.worktrees/bar-130-ci-lint-scaffolding/docs/plans/logs/bar-130-ci-lint-scaffolding/plan-v1-draft.md`
- `/Users/christian/Documents/GitHub/bkit/.worktrees/bar-130-ci-lint-scaffolding/docs/plans/logs/bar-130-ci-lint-scaffolding/plan-input.md`
- `/Users/christian/Documents/GitHub/bkit/.worktrees/bar-130-ci-lint-scaffolding/docs/plans/template.md`
- `/Users/christian/Documents/GitHub/bkit/.worktrees/bar-130-ci-lint-scaffolding/.agents/rules.md`
- `/Users/christian/Documents/GitHub/bkit/.worktrees/bar-130-ci-lint-scaffolding/.agents/scripts/bkit-install.ts`
- `/Users/christian/Documents/GitHub/bkit/.worktrees/bar-130-ci-lint-scaffolding/package.json`
