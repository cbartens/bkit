Verdict: PASS

<!-- verdict:end -->

# Debug Summary

## Overview

Post-merge dev CI run [25354307730] failed at `Setup pnpm` (action-level non-zero exit). Single hard failure, attempt 1, resolved. Root cause: dual pnpm version source-of-truth in `.github/workflows/ci.yml` (explicit `with: version: 10`) + `package.json#packageManager` (exact `pnpm@10.33.0`). pnpm/action-setup@v4 enforces single-SoT and aborts when both are present and byte-mismatch. Blast radius: all downstream bkit-gates steps (Typecheck, Test, Format, Vale, Slop, Self-Test) unreachable. Strategy: STANDARD (targeted diagnosis + single-defect hotfix on fresh `fix/bar-130-ci-pnpm` hotfix branch cut from `origin/dev` due to squash-merge rebase conflict on original feat branch).

## Diagnosis Status

Root cause identified with high confidence. Dual SoT on pnpm version in two files (`.github/workflows/ci.yml` + `.agents/templates/.github/workflows/ci.yml`) plus asymmetry (loose major `10` vs. strict pin `pnpm@10.33.0`). Critical second-order regression: template parity drift — same defect will ship to every consumer running `bkit install --ci` (KN-3 gotcha). Diagnose strategy: STANDARD. Diagnose verdict: PASS (commit 22bb1cc).

## Remediation Status

6 edits applied + 2 KN-3 regression test cases added, all gates green (typecheck / vitest / prettier / slop-scan / vale), 175 tests pass. Edit 1–4: drop `with.version:` from both ci.yml files (bkit-self + template), add KN-3 warning comments, add NOTE to bkit-tokens.ts, append KN-3 entry to docs/knowledge.md. Edit 5: append v0.2 cleanup ticket to docs/pending.md (retire `{{PNPM_VERSION}}` token as dead code post-fix). Edit 6: add two regex-based regression guards to bkit-modules.integration.test.ts ensuring neither ci.yml file sets `with.version:` + `pnpm/action-setup@v4` simultaneously; update pre-existing `toContain("10")` assertion broken by Edit 2 (token removal). Remediate verdict: PASS (commit da592d6).

## Observation

Observe cycle not used. Diagnosis and remediation both STANDARD strategy on first debug attempt; all verification commands (typecheck / test / format:check / slop-scan / lint:prose) passed locally. No test regressions, no code-path flakiness. Logging: no observe-mode data collected; defect is deterministic action-config, independent of environment/timing.

## Risks

**Fragile mitigation:** `{{PNPM_VERSION}}` token kept in bkit-tokens.ts for backwards interface stability (TokenMap still exports it, `resolvePnpmVersion` still runs on every install), but no template references it. Design debt flagged in v0.2 cleanup ticket. Low blast radius — the token resolution code is live but unused; retiring it is safe in v0.2 scope-collapse pass alongside `init`/`--host=` deprecation removal.

**Resume note:** Prior remediation pass interrupted by upstream API failure; 4 partial unstaged edits (Edits 1–4) were retained and re-applied verbatim in this pass because they matched diagnose output exactly. Edit 5–6 applied fresh on this run.

**Template parity fixed:** Both bkit-self ci.yml and consumer template now mirror each other — single SoT (package.json#packageManager). Consumers will no longer inherit the `Multiple versions of pnpm` defect on first `bkit install --ci`.

## Action Items

Next action (explicit handover to orchestrator): open PR `fix/bar-130-ci-pnpm` → `dev` to trigger CI gates. Downstream `bkit-ship` cycle will land into `main` if PR CI passes. Do NOT manually approve Linear MCP tools (recurring friction logged in `.agents/friction.md`).

**Friction context:** Squash-merge rebase conflict on original `feat/bar-130-ci-lint-scaffolding` (already merged; 38 rename conflicts block rebase). Orchestrator already created hotfix branch `fix/bar-130-ci-pnpm` from `origin/dev` (logged in friction as "Debug workflow — post-ship hotfix on squash-merged feat branch fails rebase"). Three additional friction entries this debug run logged: (i) `pnpm turbo` command spec (Step 5, RECOVERED), (ii) `vale write-good` style missing after worktree seed (Step 5, RECOVERED), (iii) rebase friction from squash-merge (Step 2, RECOVERED). All marked RECOVERED; no blocking defects.

**Testing:** KN-3 regression tests (bkit-modules.integration.test.ts lines 534–557) prevent re-introduction. Both ci.yml files assert absence of `with.version:` in pnpm/action-setup@v4 step.

**Documentation:** KN-3 entry (docs/knowledge.md, lines 49–59) captures symptom, root cause, fix rationale, and severity (critical). v0.2 cleanup ticket (docs/pending.md, lines 105–114) defers token retirement to scope-collapse.
