# bkit v0.4.0 — Sub-Plan 1: Pipeline Foundation + Installer Print Constants + CI YAML Edits + Vitest Tests

**Parent Plan:** [plan-v4-split.md](./plan-v4-split.md)

> [!CAUTION]
> **CRITICAL:** Do not hallucinate plan execution state.
>
> 1. ALWAYS read this `plan-v4-1.md` file natively via the `read_file` tool _before_ executing any steps.
> 2. NEVER trust system-generated session summaries or previous conversation history to determine what has been completed.
> 3. Your source of truth is EXCLUSIVELY the literal `[x]` vs `[ ]` checkboxes in this physical document. If a box is `[ ]`, it is NOT DONE, regardless of what the conversation context implies.

> [!IMPORTANT]
> **This is the first half of a two-part runbook split for token-budget reasons.** The parent plan ([plan-v4-split.md](./plan-v4-split.md)) holds the full Acceptance Scenario, Breaking Changes, Supersession Inventory, and rollback context. Re-read it before starting if any context is missing here.
>
> When this sub-plan completes successfully, hand off to [plan-v4-2.md](./plan-v4-2.md) — do NOT start the docs/dist/smoke/ship work yourself.

## Scope of This Sub-Plan

- **Phase A (Pipeline foundation):** Tasks A1–A5 — branch off `main`, edit `package.json` manifest fields, create `.github/workflows/release.yml`, bump to `0.4.0-pre.1`, tag, and validate the publish pipeline before touching any prints.
- **Phase B (Code edits — print constants and CI templates only):** Tasks B1–B7 — rewrite installer print constants in `.agents/scripts/bkit-modules.ts`, remove the `onlyBuiltDependencies` line from the first-install banner, edit the consumer template `.github/workflows/ci.yml`, and remove the dead `Configure private-repo auth` step from bkit-self's `.github/workflows/ci.yml`.
- **Phase C (Test coverage for code edits made above):** Tasks C0, C1, C1.5, C2 — Vitest manifest test, installer-print-constants test, `release.yml` structural test, consumer ci.yml template snapshot test.

## Out of Scope (handed to sub-plan 2)

- Documentation rewrites (README.md, .agents/README.md, docs/decisions.md, docs/pending.md, docs/knowledge.md) — Tasks B8, B9, B10, B11, B11.5.
- `dist/` regeneration after print-constant edits — Task B12.
- Full local check suite + `0.4.0-pre.2` tag/publish + gate — Tasks B13, B14, B15.
- Scratch consumer smoke test — Tasks C3, C4, C5.
- PR open, squash-merge, dev→main promotion, `v0.4.0` production tag, BAR-131 resolution — Tasks D1–D5.
- Gates 2, 3, 4 + Verification Plan + Manual Verification — those run after sub-plan 2 completes.

## Acceptance & Edge Cases

Inherited verbatim from the parent plan ([plan-v4-split.md § Acceptance Scenario](./plan-v4-split.md#acceptance-scenario--human-review-required)). Tests created in this sub-plan map to the following Derived Test Matrix rows:

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| `package.json` manifest fields render correctly: `private:false`, `publishConfig.registry`, `publishConfig.access`, bare HTTPS `repository.url`, refreshed `description`. | Unit (Vitest) | `.agents/scripts/bkit-modules.test.ts` (extend) or new `.agents/scripts/package-manifest.test.ts` | C0 |
| `release.yml` triggers on tag-push (`v*`) and contains: setup-node 20 + registry-url + scope, full check suite, `npm publish` with `NODE_AUTH_TOKEN: GITHUB_TOKEN`, `permissions: packages: write`. | Schema/lint (yamllint + structural assertion) | `.agents/scripts/release-workflow.test.ts` (new) | C1.5 |
| `runCiModule` print sink contains the rewritten `GH_BKIT_TOKEN_MISSING_INSTRUCTIONS` (`.npmrc` + `read:packages` + pnpm silent-ignore warning) when `gh secret list` reports missing. | Unit (Vitest) | `.agents/scripts/bkit-modules.test.ts` (extend) | C1 |
| `runCiModule` print sink contains the rewritten `GH_BKIT_TOKEN_UNKNOWN_INSTRUCTIONS` (same pnpm silent-ignore warning) when `gh` is unavailable. | Unit (Vitest) | `.agents/scripts/bkit-modules.test.ts` (extend) | C1 |
| `runCiModule` print sink contains the rewritten `VERCEL_AUTH_INSTRUCTIONS` (env-var-only, NO `installCommand` shim) when `vercel.json` is detected. | Unit (Vitest) | `.agents/scripts/bkit-modules.test.ts` (extend) | C1 |
| `CI_YML_MERGE_INSTRUCTIONS` print sink contains rewritten `.npmrc` + `env: GH_BKIT_TOKEN` + `read:packages` guidance and no `Configure private-repo auth` directive. | Unit (Vitest) | `.agents/scripts/bkit-modules.test.ts` (extend) | C1 |
| `runCoreModule` first-install banner does NOT contain the `onlyBuiltDependencies` line. | Unit (Vitest) | `.agents/scripts/bkit-modules.test.ts` (extend) | C1 |
| Seeded consumer template `.agents/templates/.github/workflows/ci.yml` has NO `Configure private-repo auth` step and the install step carries `env: GH_BKIT_TOKEN`. | Snapshot/diff | `.agents/scripts/templates.test.ts` (extend or new) | C2 |
| bkit-self `.github/workflows/ci.yml` has NO `Configure private-repo auth` step (dead-code removal). | Manual + grep | shell command `grep -F 'Configure private-repo auth' .github/workflows/ci.yml` returns empty | B7 |
| `v0.4.0-pre.1` publishes successfully to GH Packages from `release.yml` (pipeline-only validation). | Live release smoke | GitHub Actions run on tag push | A4–A5 |

## 🚨 Pre-Flight / Dependencies 🚨

**CRITICAL:** Check off ALL core items. Check conditional items only when applicable. Abort if anything required is missing.

### Core (always verify)

- [ ] **Package Management:** Verify `package.json` for required packages. No new runtime deps; only manifest fields change. `pnpm-lock.yaml` should remain stable post-edit (no new entries).
- [ ] **Dependency Versions:** Spot-check `pnpm --version` (matches `package.json#packageManager` = `pnpm@10.33.0`), `node --version` (≥20), `gh --version`, `npm --version`. Confirm `actions/setup-node@v4`, `pnpm/action-setup@v4` are current pins (already used in `ci.yml`).
- [ ] **User Context:** Verify maintainer has push access to `cbartens/bkit` and `packages: write` is available on the built-in `GITHUB_TOKEN` (default for private repos in same owner). Verify maintainer has a local `GH_BKIT_TOKEN` PAT with `read:packages` for the scratch-consumer smoke test (used in sub-plan 2).
- [ ] **Pending Blockers:** Linear search for label `blocker` referencing BAR-138 / BAR-130 / BAR-131. Confirm `BKIT_READ_TOKEN → GH_BKIT_TOKEN` rename (v0.2.2) has fully landed (design assumes; out of scope here).
- [ ] **Project Context:** Re-read `docs/decisions.md` for prior `DE-*` entries (next ID = `DE-3` per current count). Re-read `docs/knowledge.md` for any BAR-130 lifecycle-hook lessons that constrain `dist/` handling.
- [ ] **Testing & Quality:** Align with `docs/testing.md` — Vitest unit only for installer print constants; no Playwright; no integration tests for build/distribution path.
- [ ] **Prerequisite Plans:** None. v0.3.0 (BAR-130) lifecycle-hook removal already shipped; this builds on top.

### Conditional (verify only when applicable)

- [ ] **Secrets & Env Vars:** No new secrets in bkit repo (uses built-in `GITHUB_TOKEN`). Verify the bkit repo's "Workflow permissions" setting allows `packages: write` for `GITHUB_TOKEN` (Settings → Actions → General → Workflow permissions). If repo defaults to read-only, the `permissions:` block in `release.yml` must explicitly grant `packages: write` (already in the design).
- [ ] **Architecture & UI:** No UI; architecture changes documented in ADR `DE-3` (sub-plan 2) and `.agents/README.md` Distribution section (sub-plan 2).
- [ ] **Observability:** Installer prints already follow `[bkit] {message}` convention. No new log names; no new tracing.

### 🔒 Gate 1: Prerequisites Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all applicable boxes above. **DO NOT stop for user permission.** Once saved, immediately proceed to `Agent Execution Runbook → Phase A`.

> [!CAUTION]
> **Gate 1 wiring rule:** The two upstream human-gate checkboxes — `👤 ✅ Human Confirmation → Acceptance Scenario confirmed` and `👤 ✅ Human Confirmation → Breaking Changes confirmed` — live in the parent plan ([plan-v4-split.md](./plan-v4-split.md)). They are the source of truth. The two echo checkboxes immediately below are mirrors for Gate 1's machine-readability. Gate 1 stays unchecked, AND `Gate 1 - Verified` MUST remain `[ ]`, until BOTH upstream `👤 ✅` boxes in the parent plan are `[x]`. If either upstream box is unchecked, the summary subagent MUST issue `REVISE` per the `docs/plans/template.md` contract.

- [ ] **Acceptance Scenario confirmed:** Human confirmed `👤 Acceptance Scenario` section in the parent plan (checkbox is `[x]`). _(Unchecked → Summary must issue `REVISE`.)_
- [ ] **Breaking Changes confirmed:** Human confirmed `⚠️ Breaking Changes & Naming Review` section in the parent plan (checkbox is `[x]`). _(Unchecked → Summary must issue `REVISE`.)_
- [ ] **Gate 1 - Verified:** All Core items checked. All applicable Conditional items checked. Both upstream `👤 ✅` boxes confirmed `[x]` in parent plan.

## Architecture & Component Changes (in scope of this sub-plan)

### Build & Distribution

#### [MODIFY] `package.json`

- **Existence Check:** Confirmed (read at session start).
- Flip `private: true` → `private: false`.
- Rewrite `description` to drop the "git dependency from a private GitHub repo (no npm registry)" lie; new copy describes scoped-package distribution via GitHub Packages.
- Strip `git+` prefix from `repository.url`: `git+https://github.com/cbartens/bkit.git` → `https://github.com/cbartens/bkit.git`.
- Add `publishConfig`:
  ```json
  "publishConfig": {
    "registry": "https://npm.pkg.github.com",
    "access": "restricted"
  }
  ```
- Bump `version` per cadence: `0.3.0` → `0.4.0-pre.1` (this sub-plan's tag). Subsequent bumps to `0.4.0-pre.2` and `0.4.0` happen in sub-plan 2.
- DO NOT add any `prepare` / `prepublishOnly` / `postinstall` script (invariant).
- `files` array stays: `["dist", ".agents", "README.md"]` (verified — already correct for registry shipping).

#### [NEW] `.github/workflows/release.yml`

- New file. Triggers `on: push: tags: ['v*']`.
- `permissions: { contents: read, packages: write }`.
- Job `release` on `ubuntu-latest`. Steps:
  1. `actions/checkout@v4`
  2. `actions/setup-node@v4` with `node-version: 20`, `registry-url: https://npm.pkg.github.com`, `scope: '@cbartens'`.
  3. `pnpm/action-setup@v4` (no `with:` — pnpm version sourced from `package.json#packageManager`).
  4. `pnpm install --frozen-lockfile`.
  5. `pnpm typecheck`.
  6. `pnpm test`.
  7. `pnpm format:check`.
  8. `pnpm lint:prose`.
  9. `pnpm lint:slop`.
  10. `pnpm check:dist`.
  11. `npm publish` with env `NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}`.
- Pinned Node 20 to match `ci.yml` (preserves `check:dist` determinism per design).
- `npm publish` (NOT `pnpm publish`) — matches GH Packages docs; `setup-node` registry-url wiring assumes `npm`.
- Full check suite re-run on tagged SHA (no `workflow_run` trust on prior CI) — design Open-Question resolution.

### Installer Print Constants

#### [MODIFY] `.agents/scripts/bkit-modules.ts`

- **Existence Check:** Confirmed.
- Replace `GH_BKIT_TOKEN_MISSING_INSTRUCTIONS` body — drop git-shim language; new copy directs the AI to:
  - Add `.npmrc` with `@cbartens:registry=https://npm.pkg.github.com` + `//npm.pkg.github.com/:_authToken=${GH_BKIT_TOKEN}`.
  - Set `GH_BKIT_TOKEN` GHA secret (PAT with `read:packages` / Packages: read scope; classic OR fine-grained).
  - Verbatim warning: pnpm v7.20+ silently ignores `.npmrc` when `${GH_BKIT_TOKEN}` env is unset → install falls back to npmjs.org → opaque 401 (NOT "token missing"). Phrase so an AI agent can map symptom → cause.
- Replace `GH_BKIT_TOKEN_UNKNOWN_INSTRUCTIONS` body — same shape as `_MISSING_`; include the same pnpm silent-ignore warning so symptom-to-cause is consistent across both states.
- Replace `VERCEL_AUTH_INSTRUCTIONS` body — Vercel env-var-only setup; explicitly tells AI to REMOVE any legacy `installCommand: "git config --global url.\"...\".insteadOf ... && pnpm install"` and replace with plain `pnpm install` (or remove `installCommand` entirely), plus add `GH_BKIT_TOKEN` via `vercel env add` for preview + production. Heuristic (`detectVercelProject`) unchanged.
- Replace `CI_YML_MERGE_INSTRUCTIONS` body — `.npmrc`-based merge guidance: tells AI to (a) ensure `.npmrc` exists at repo root, (b) ensure install step has `env: GH_BKIT_TOKEN: ${{ secrets.GH_BKIT_TOKEN }}`, (c) remove any `Configure private-repo auth` `git config --global url.…insteadOf` step, (d) ensure GHA secret `GH_BKIT_TOKEN` has `read:packages` scope.
- In `runCoreModule` first-install banner: REMOVE the `3. Add to pnpm-workspace.yaml or package.json: onlyBuiltDependencies: ["@cbartens/bkit"]` block. Renumber remaining steps. Update step 1 prose to reference `read:packages` scope.
- `checkBkitTokenSecret()` and `detectVercelProject()` function bodies unchanged — only the surrounding string constants change.

### Consumer CI Template

#### [MODIFY] `.agents/templates/.github/workflows/ci.yml`

- **Existence Check:** Confirmed.
- DELETE the "Configure private-repo auth" step (lines 23–24).
- Modify the "Install dependencies" step to add an `env:` block:
  ```yaml
  - name: Install dependencies
    run: pnpm install --frozen-lockfile
    env:
      GH_BKIT_TOKEN: ${{ secrets.GH_BKIT_TOKEN }}
  ```
- The consumer is expected to commit `.npmrc` at their repo root (out of scope for the bkit-side seed; documented in `CI_YML_MERGE_INSTRUCTIONS` and README — README is touched in sub-plan 2).
- Token replacements (`{{DEFAULT_BRANCH}}`, `{{NODE_VERSION}}`) unchanged.

### bkit-self CI

#### [MODIFY] `.github/workflows/ci.yml`

- **Existence Check:** Confirmed (read at session start).
- DELETE the "Configure private-repo auth" step (lines 23–24). Per design — bkit-self is the source repo, never a consumer of `@cbartens/bkit`; the `insteadOf` shim is dead code today. Cleanup fits this PR because the templated equivalent is being touched and leaving the dead step is misleading documentation for any agent reading bkit-self's ci.yml as a reference.
- DO NOT add any registry-auth step to bkit-self's ci.yml. bkit-self does NOT install `@cbartens/bkit` from the registry — it uses local source via `pnpm tsx .agents/scripts/bkit-install.ts` and `pnpm bkit`.

## Agent Execution Runbook (Sub-Plan 1)

> [!IMPORTANT]
> **Continuous Execution:** Work through this runbook autonomously. Do not pause for user permission at any Gate. Continuously check off `[x]` tasks as you go.
> **Blockers:** If a task cannot be completed, **DO NOT fail silently**. Create a Linear issue (label `blocker`) with context before stopping.
> **Step Isolation:** Do NOT jump ahead. Complete each task fully (including its specific verification and checking its box) before starting the exact next task in the list.
> **Progress Updates:** After checking off each major task, post a structured summary as a Linear comment on the issue per `.claude/workflows/conventions.md`.
> **Hand-off:** When all tasks below are checked, do NOT continue to docs/dist/smoke/ship work yourself — switch to [plan-v4-2.md](./plan-v4-2.md) instead.

### Phase A — Pipeline foundation (validates publishing path before touching prints)

- [ ] **Task A1: Branch off `main`.**
  - Scope: Create branch `feat/bar-138-gh-packages-distribution` off `main`.
  - Acceptance: `git rev-parse --abbrev-ref HEAD` returns `feat/bar-138-gh-packages-distribution`; branch tip matches `main` tip.
  - Verification: `git log -1 --oneline` matches `git log -1 --oneline main`.

- [ ] **Task A2: Edit `package.json` manifest fields (publish config + repo URL + description).**
  - Scope: Flip `private: true → false`. Strip `git+` prefix from `repository.url`. Rewrite `description` (drop the "git dependency from a private GitHub repo (no npm registry)" lie). Add `publishConfig: { registry: "https://npm.pkg.github.com", access: "restricted" }`. DO NOT bump `version` yet (`v0.4.0-pre.1` bump happens in Task A4 just before tag).
  - Acceptance: `node -e "console.log(JSON.parse(require('fs').readFileSync('package.json','utf-8')).publishConfig)"` prints the registry+access object. `private` is `false`. `repository.url` is bare HTTPS.
  - Verification: `git diff package.json` shows only those four field deltas; `pnpm install --frozen-lockfile` re-runs cleanly (lockfile untouched).

- [ ] **Task A3: Create `.github/workflows/release.yml`.**
  - Scope: New file per the design (tag-push trigger on `v*`, `permissions: packages:write`, Node 20, setup-node `registry-url: https://npm.pkg.github.com` + `scope: '@cbartens'`, pnpm/action-setup, frozen install, full check suite — typecheck → test → format:check → lint:prose → lint:slop → check:dist — then `npm publish` with `NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}`).
  - Acceptance: File exists at `.github/workflows/release.yml`. `yamllint` (or `actionlint` if available) passes. `grep -F 'npm publish' .github/workflows/release.yml` matches; `grep -F 'pnpm publish' .github/workflows/release.yml` returns empty.
  - Verification: Visual diff against the design doc § "Flow 1 — Release pipeline" step list — all 11 steps present in order.

- [ ] **Task A4: Bump `version` to `0.4.0-pre.1`, commit, tag.**
  - Scope: Edit `package.json#version` → `0.4.0-pre.1`. Commit with message `feat(bar-138): publishConfig + release.yml for GH Packages` (no `[skip ci]` / `[skip build]` trailers — `release.yml` must fire on the tag, so CI must run on this commit). Push branch FIRST and wait until the branch's HEAD shows up in `gh run list --workflow=ci.yml --limit=1` (this confirms GitHub has indexed `release.yml` against the new ref). Then tag `v0.4.0-pre.1` on the same SHA. Push tag.
  - Note (rationale): the negative `[skip ci]` form is excluded because this commit IS the code change that needs CI; embedding any "skip" marker would suppress the very workflow we are validating.
  - Note (tag-push timing gotcha): `release.yml` is introduced in this same commit. GitHub occasionally fails to fire a tag-triggered workflow when the tag ref arrives before the default-branch ref has been indexed. Pushing the branch first (and observing the workflow registered) eliminates this race. If, after pushing the tag, no `release.yml` run appears within ~30s, the recovery is `git push origin :refs/tags/v0.4.0-pre.1` followed by `git push origin v0.4.0-pre.1` — do NOT re-commit; the SHA is already correct.
  - Acceptance: `git describe --tags --exact-match` on the tip = `v0.4.0-pre.1`. `gh run list --workflow=release.yml --limit=1` shows the tagged run starting (within ~30s; otherwise apply the recovery above).
  - Verification: Wait for the run; `gh run view --log` for that run shows full check suite green and `npm publish` printing the published version. Visit `https://github.com/cbartens/bkit/packages` and confirm `@cbartens/bkit@0.4.0-pre.1` is listed.

- [ ] **Task A5 🔒 GATE — pre.1 publish smoke validates pipeline before any print/doc edits.**
  - Scope: If Task A4 fails (release.yml red, 401 on `npm publish`, `permissions: packages:write` mismatch, etc.), STOP. Diagnose and fix release.yml on the same branch; re-tag `v0.4.0-pre.1` only after deleting the failed tag (`git tag -d v0.4.0-pre.1; git push origin :refs/tags/v0.4.0-pre.1`); re-publish. Do NOT proceed to Phase B until pre.1 publish is green.
  - Acceptance: GH Packages UI shows `@cbartens/bkit@0.4.0-pre.1` published successfully. `release.yml` run on `v0.4.0-pre.1` is green end-to-end.
  - Verification: `gh api -H "Accept: application/vnd.github+json" /users/cbartens/packages/npm/bkit/versions` returns `0.4.0-pre.1` in the version list.

### Phase B (partial) — Installer print constants + consumer/bkit-self CI YAML edits

> Tasks B8–B15 (docs, dist rebuild, pre.2 tag/publish, pre.2 gate) live in [plan-v4-2.md](./plan-v4-2.md).

- [ ] **Task B1: Rewrite `GH_BKIT_TOKEN_MISSING_INSTRUCTIONS` constant in `.agents/scripts/bkit-modules.ts`.**
  - Scope: Replace body verbatim with the `.npmrc`-based AI-actionable block. MUST include: (a) `.npmrc` snippet (registry + `_authToken=${GH_BKIT_TOKEN}`), (b) `GH_BKIT_TOKEN` GHA secret instructions with `read:packages` (classic) / Packages: read (fine-grained) PAT scope, (c) verbatim pnpm v7.20+ silent-ignore-on-unset-env warning so an AI agent can map symptom → cause.
  - Acceptance: New constant body contains literal substrings `@cbartens:registry=https://npm.pkg.github.com`, `_authToken=${GH_BKIT_TOKEN}`, `read:packages`, `pnpm`, `silently ignores`. Old git-shim language strings (`insteadOf`, `git config --global url.`) are absent.
  - Verification: Vitest unit test (Task C1) asserts these substrings in the constant body. Manual inspection: `grep -n 'insteadOf' .agents/scripts/bkit-modules.ts` returns empty.

- [ ] **Task B2: Rewrite `GH_BKIT_TOKEN_UNKNOWN_INSTRUCTIONS` constant.**
  - Scope: Same shape as `_MISSING_`; same pnpm silent-ignore warning verbatim; copy adapted for "couldn't auto-check" framing (no `gh` CLI / not a GH repo).
  - Acceptance: New body contains the same `.npmrc`/`read:packages`/silent-ignore substrings. No `insteadOf` / git-shim language.
  - Verification: Vitest unit test (Task C1) asserts substrings.

- [ ] **Task B3: Rewrite `VERCEL_AUTH_INSTRUCTIONS` constant.**
  - Scope: New body — env-var-only Vercel setup. Tells AI to (a) `vercel env add GH_BKIT_TOKEN preview` + `production`, (b) commit `.npmrc` at repo root, (c) REMOVE any pre-existing `installCommand: "git config --global url.…insteadOf … && pnpm install"` (set `installCommand` to `pnpm install` or remove the key entirely), (d) trigger redeploy. Heuristic (`detectVercelProject`) unchanged.
  - Acceptance: New body contains `vercel env add GH_BKIT_TOKEN`, `.npmrc`, `Remove` (referring to `installCommand` shim). Old `git config --global url.…` literal absent.
  - Verification: Vitest unit test (Task C1) asserts substrings.

- [ ] **Task B4: Rewrite `CI_YML_MERGE_INSTRUCTIONS` constant.**
  - Scope: New body — `.npmrc`-based merge guidance for a consumer's existing ci.yml: (a) commit `.npmrc` at repo root, (b) ensure install step has `env: GH_BKIT_TOKEN: ${{ secrets.GH_BKIT_TOKEN }}`, (c) remove any `Configure private-repo auth` `git config --global url.…insteadOf` step, (d) GHA secret has `read:packages` PAT scope.
  - Acceptance: New body contains `.npmrc`, `env: GH_BKIT_TOKEN`, `Remove` (or equivalent for the dead auth-shim step), `read:packages`. Old auth-shim merge actions absent.
  - Verification: Vitest unit test (Task C1) asserts substrings.

- [ ] **Task B5: Remove `onlyBuiltDependencies` line from first-install banner in `runCoreModule`.**
  - Scope: In the `printSink.push(\`...\`)` block, delete step `3. Add to pnpm-workspace.yaml or package.json: onlyBuiltDependencies: ["@cbartens/bkit"]`. Renumber remaining steps. Update step 1 prose for `read:packages` scope (token requirement).
  - Acceptance: First-install banner string contains no `onlyBuiltDependencies` substring. Step numbering is contiguous (1, 2 only — `prepare` script note is part of step 2's `scriptEntries` JSON).
  - Verification: Vitest unit test (Task C1) asserts `onlyBuiltDependencies` is absent from the banner constant. `pnpm test` green.

- [ ] **Task B6: Edit `.agents/templates/.github/workflows/ci.yml` (consumer CI template).**
  - Scope: DELETE the "Configure private-repo auth" step (lines 23–24). Add `env: { GH_BKIT_TOKEN: ${{ secrets.GH_BKIT_TOKEN }} }` block to the "Install dependencies" step. Token replacements (`{{DEFAULT_BRANCH}}`, `{{NODE_VERSION}}`) unchanged.
  - Acceptance: `grep -F 'Configure private-repo auth' .agents/templates/.github/workflows/ci.yml` returns empty. `grep -A1 'Install dependencies' .agents/templates/.github/workflows/ci.yml` shows the install run line followed by the `env:` block.
  - Verification: `yamllint` passes against the template. Snapshot test (Task C2) asserts the diff.

- [ ] **Task B7: Edit `.github/workflows/ci.yml` (bkit-self CI).**
  - Scope: DELETE the "Configure private-repo auth" step (lines 23–24). DO NOT add any registry-auth — bkit-self does not consume the published package.
  - Acceptance: `grep -F 'Configure private-repo auth' .github/workflows/ci.yml` returns empty.
  - Verification: `yamllint` passes. Push to feature branch and confirm `ci.yml` runs green (the deleted step was dead — removal must not break anything).

### Phase C (partial) — Tests for code edits made above

> Tasks C3–C5 (scratch-consumer smoke + gate) live in [plan-v4-2.md](./plan-v4-2.md).

- [ ] **Task C0: Extend Vitest unit tests for `package.json` manifest fields.**
  - Scope: In `.agents/scripts/bkit-modules.test.ts` (extend) — match the existing test conventions for that source file by inspecting the dir before deciding (a sibling `.agents/scripts/package-manifest.test.ts` is acceptable if the existing file's scope makes extension awkward). Add tests asserting the manifest invariants set up by Task A2:
    - `package.json#private` is `false`.
    - `package.json#publishConfig.registry` equals `https://npm.pkg.github.com`.
    - `package.json#publishConfig.access` equals `restricted`.
    - `package.json#repository.url` is the bare HTTPS form (`https://github.com/cbartens/bkit.git`) — no `git+` prefix.
    - `package.json#description` does NOT contain the substring `git dependency from a private GitHub repo` (the old lie) and is non-empty.
  - Acceptance: New tests are in the file, `pnpm test` green. Reverting any one of the five manifest invariants in `package.json` causes the corresponding assertion to fail.
  - Verification: Locally flip `private` back to `true` → test fails; revert.

- [ ] **Task C1: Extend (or create) Vitest unit tests for installer print constants.**
  - Scope: In `.agents/scripts/bkit-modules.test.ts` (or a new `.agents/scripts/install-prints.test.ts` — match existing test conventions for that source file by inspecting the dir before deciding). Add tests asserting:
    - `GH_BKIT_TOKEN_MISSING_INSTRUCTIONS` contains `.npmrc`, `_authToken=${GH_BKIT_TOKEN}`, `read:packages`, `silently ignores`. Does NOT contain `insteadOf` or `git config --global url.`.
    - `GH_BKIT_TOKEN_UNKNOWN_INSTRUCTIONS` same.
    - `VERCEL_AUTH_INSTRUCTIONS` contains `vercel env add GH_BKIT_TOKEN`, `.npmrc`, `Remove` (referring to `installCommand`). Does NOT contain `git config --global url.`.
    - `CI_YML_MERGE_INSTRUCTIONS` contains `.npmrc`, `env: GH_BKIT_TOKEN`, `read:packages`. Does NOT contain `Configure private-repo auth` (as a directive to add).
    - `runCoreModule` first-install banner does NOT contain `onlyBuiltDependencies`.
  - Acceptance: New tests are in the file, `pnpm test` green.
  - Verification: Comment out one print constant edit locally → corresponding test fails; revert.

- [ ] **Task C1.5: Create `.agents/scripts/release-workflow.test.ts` with Vitest structural assertions for `release.yml`.**
  - Scope: New file `.agents/scripts/release-workflow.test.ts`. Read `.github/workflows/release.yml` (parse YAML with the project's existing YAML loader of choice — `js-yaml` is already in `node_modules` via toolchain; if absent, use `JSON.parse` after `yaml`-to-JSON via the simplest available path) and assert:
    - Trigger: `on.push.tags` includes the `v*` glob.
    - `permissions.packages` equals `write` and `permissions.contents` equals `read`.
    - A `setup-node` step exists with `node-version: 20`, `registry-url: https://npm.pkg.github.com`, and `scope: '@cbartens'`.
    - A `pnpm/action-setup` step exists.
    - The check-suite steps (`pnpm typecheck`, `pnpm test`, `pnpm format:check`, `pnpm lint:prose`, `pnpm lint:slop`, `pnpm check:dist`) all appear in the job's step list, in order.
    - A step running `npm publish` exists with `env.NODE_AUTH_TOKEN` referencing `${{ secrets.GITHUB_TOKEN }}`.
    - No step contains the literal `pnpm publish`.
  - Acceptance: New test file exists, `pnpm test` green. Locally dropping any one asserted field from `release.yml` makes the corresponding assertion fail.
  - Verification: Comment out the `permissions: packages: write` line in `release.yml` → test fails; revert.

- [ ] **Task C2: Add snapshot/diff test for `.agents/templates/.github/workflows/ci.yml`.**
  - Scope: Either (a) add to existing template-snapshot test file if one exists in `.agents/scripts/`, or (b) create `.agents/scripts/templates.test.ts` with a Vitest snapshot of the rendered template post-edit. Test asserts: no `Configure private-repo auth` substring; install step contains `env: GH_BKIT_TOKEN: ${{ secrets.GH_BKIT_TOKEN }}`.
  - Acceptance: `pnpm test` green. Manual edit to reintroduce the dead step → test fails; revert.
  - Verification: Snapshot diff is committed.

## Hand-off State to Sub-Plan 2

Confirm ALL of the following are true before marking this sub-plan complete and switching to [plan-v4-2.md](./plan-v4-2.md):

- [ ] **Branch:** `feat/bar-138-gh-packages-distribution` is checked out and pushed to origin.
- [ ] **Manifest:** `package.json` has `private: false`, the new `publishConfig`, bare HTTPS `repository.url`, refreshed `description`, and `version` = `0.4.0-pre.1`.
- [ ] **Workflow file:** `.github/workflows/release.yml` exists and matches the design's 11-step shape.
- [ ] **Pre.1 publish:** `gh api …/packages/npm/bkit/versions` lists `0.4.0-pre.1`; `release.yml` run on `v0.4.0-pre.1` is green end-to-end (Task A5 gate green).
- [ ] **Print constants:** All five print-constant rewrites + first-install banner edit have landed in `.agents/scripts/bkit-modules.ts`.
- [ ] **Consumer template:** `.agents/templates/.github/workflows/ci.yml` no longer has `Configure private-repo auth`; install step has `env: GH_BKIT_TOKEN`.
- [ ] **bkit-self CI:** `.github/workflows/ci.yml` no longer has `Configure private-repo auth`.
- [ ] **Vitest tests:** Tasks C0, C1, C1.5, C2 test files written; `pnpm test` green locally.
- [ ] **`dist/` NOT yet rebuilt:** Print-constant edits are present in source but `dist/` is intentionally still stale — sub-plan 2 will rebuild it (Task B12) so the rebuild fits inside the pre.2 commit.
- [ ] **No commits or pushes for the print-constant + test edits yet** (other than what was already committed for Task A4). Sub-plan 2 will fold the print-constant + test + docs + dist edits into the pre.2 commit (Task B14).

> [!IMPORTANT]
> If any hand-off box above is `[ ]`, do NOT switch sub-plans. Resolve the gap first, then check the box, then continue.

## Gates Deferred to Sub-Plan 2

The following hard gates are owned by sub-plan 2 and intentionally NOT executed here:

- **Task B15 🔒 GATE — pre.2 publish smoke**
- **Task C5 🔒 GATE — scratch-consumer smoke**
- **🔒 Gate 2: Code Implementation Check**
- **🔒 Gate 3: Testing & Documentation Check**
- **🔒 Gate 4: Automated Verification Confirmed**
- Manual Verification steps 1–7

Do NOT pre-tick or pre-execute these here.
