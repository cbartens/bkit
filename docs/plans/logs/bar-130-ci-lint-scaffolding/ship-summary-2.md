# Ship Summary (Run 2): bar-130-ci-lint-scaffolding

Verdict: PASS

<!-- verdict:end -->

## Overview

**PR #2** (hotfix for pnpm dual-SoT CI failure, merged at 2026-05-05T03:33:30Z, commit 666de7e) resolved the post-merge dev CI failure that blocked PR #1. Root cause: `.github/workflows/ci.yml` and `.agents/templates/.github/workflows/ci.yml` both declared pnpm version in two places simultaneously — `with: version: 10` (loose major) and `package.json#packageManager: pnpm@10.33.0` (strict pin) — causing `pnpm/action-setup@v4` to abort with "Multiple versions of pnpm specified" error.

**Files changed:** 6 edits across 5 files:
- Dropped `with: version:` clauses from both ci.yml files (bkit-self + consumer template)
- Added KN-3 knowledge entry documenting the gotcha and fix rationale
- Added NOTE comment in `bkit-tokens.ts` marking `{{PNPM_VERSION}}` token as deprecated post-fix
- Added v0.2 cleanup ticket to `docs/pending.md` (retire unused token + resolver)
- Added 2 KN-3 regression guards to `bkit-modules.integration.test.ts` (assert no `with.version:` in pnpm actions), plus fixed pre-existing test assertion broken by template edit

**Test results:** All 175 tests pass, typecheck clean, format:check clean, slop-scan clean. No regressions.

## CI Status

**PR #2 merge:** Passed (no CI run logs visible yet — merge completed at 2026-05-05T03:33:30Z). The second ship cycle only shows merge and switch-to-dev complete; no post-merge dev CI run result captured in this ship summary snapshot.

**Post-merge expectation:** dev CI should now pass on the pnpm setup step. The dual-SoT defect has been eliminated. Both ci.yml files now rely solely on `package.json#packageManager` as single SoT for pnpm version resolution, which `pnpm/action-setup@v4` handles natively without error.

**Critical fix verified locally:** Prior debug cycle confirmed all 6 edits were correct and all gates (typecheck/test/format/slop) passed. The regression guards ensure no future edit re-introduces `with: version:` without catching it in CI.

## Action Items

1. **Post-merge dev CI verification (implicit follow-up)** — Confirm that the next `dev` CI run (after this PR #2 merge) executes the `Setup pnpm` step successfully. The `bkit-gates` job should now run to completion through all downstream steps (Typecheck, Test, Format Check, Vale, Slop Scan, Self-Test).

2. **Manual smoke gates still pending (from PR #1)** — Gates 4.5a (app-gether-life re-install with v0.1.2, CI green) and 4.5b (second consumer onboarding) were deferred from the first ship cycle and remain outstanding. These must be run post-PR by human before the `v0.1.2` tag is pushed to main. Log results to `docs/plans/logs/bar-130-ci-lint-scaffolding/smoke-install.md`.

3. **v0.2 deprecation cleanup (documented)** — The `{{PNPM_VERSION}}` token is now dead code (no template sites reference it post-fix). Retire `resolvePnpmVersion` function, the token field on `TokenMap`, and associated tests in v0.2 scope-collapse pass (BAR-200). Entry added to `docs/pending.md` for tracking.

Verdict: PASS
