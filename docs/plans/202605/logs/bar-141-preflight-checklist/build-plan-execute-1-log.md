<!-- verdict:start -->

Verdict: PASS

<!-- verdict:end -->

# Plan Execution Log

DONE — Task A1: Create bkit-preflight.ts with PreflightFinding interface, runPreflight stub, hasBkitMarkers helper — complete (`.agents/scripts/bkit-preflight.ts`)
DONE — Task A2: Create bkit-postinstall.ts with runPostInstallCheck stub, formatChecklist renderer — complete (`.agents/scripts/bkit-postinstall.ts`)
DONE — Task B1: Replace printSink: string[] with advisories: PreflightFinding[] in ModuleContext, update bkit-install.ts ctx construction — complete (`.agents/scripts/bkit-modules.ts`, `.agents/scripts/bkit-install.ts`)
DONE — Task B2: Migrate all printSink.push() call sites in bkit-modules.ts to ctx.advisories.push({id, severity, detect, action}) — complete (`.agents/scripts/bkit-modules.ts`)
DONE — Task B3: Replace printSink: string[] parameter on writeTier3 in bkit-tiers.ts with advisories: PreflightFinding[], update callers — complete (`.agents/scripts/bkit-tiers.ts`)
DONE — Task B4: Replace inline checklist formatter in bkit-install.ts main() with formatChecklist calls — complete (`.agents/scripts/bkit-install.ts`)
DONE — Task C1: Implement detectNoPackageJson + unit test (positive + negative) — complete (`.agents/scripts/bkit-preflight.ts`, `.agents/scripts/bkit-preflight.test.ts`)
DONE — Task C2: Implement detectMalformedPackageJson + unit test — complete (`.agents/scripts/bkit-preflight.ts`, `.agents/scripts/bkit-preflight.test.ts`)
DONE — Task C3: Implement detectNotGitRepo (gated on --core) + unit test (3 cases) — complete (`.agents/scripts/bkit-preflight.ts`, `.agents/scripts/bkit-preflight.test.ts`)
DONE — Task C4: Wire runPreflight to call all three blocker detectors with intra-phase dedup — complete (`.agents/scripts/bkit-preflight.ts`)
DONE — Task C5: Wire Phase 1 in bkit-install.ts main() before resolveTokens, with exit 1 on blockers — complete (`.agents/scripts/bkit-install.ts`)
DONE — Task D1: Implement detectHuskyNoMarkers (pre-commit + pre-push) + unit tests — complete (`.agents/scripts/bkit-preflight.ts`, `.agents/scripts/bkit-preflight.test.ts`)
DONE — Task D2: Implement detectPrettierignoreNoMarkers + unit test — complete (`.agents/scripts/bkit-preflight.ts`, `.agents/scripts/bkit-preflight.test.ts`)
DONE — Task D3: Implement detectLintProseF9Vulnerable + unit test — complete (`.agents/scripts/bkit-preflight.ts`, `.agents/scripts/bkit-preflight.test.ts`)
DONE — Task D4: Implement detectBkitVersionMajorDowngrade + unit test — complete (`.agents/scripts/bkit-preflight.ts`, `.agents/scripts/bkit-preflight.test.ts`)
DONE — Task D4b: Implement detectBkitVersionPinStale + unit test (5 cases) — complete (`.agents/scripts/bkit-preflight.ts`, `.agents/scripts/bkit-preflight.test.ts`)
DONE — Task D5: Wire all advisory detectors into runPreflight, seed ctx.advisories in bkit-install.ts — complete (`.agents/scripts/bkit-preflight.ts`, `.agents/scripts/bkit-install.ts`)
DONE — Task E1: Move checkBkitTokenSecret to bkit-postinstall.ts as detectGhSecret + unit test (3 cases) — complete (`.agents/scripts/bkit-postinstall.ts`, `.agents/scripts/bkit-postinstall.test.ts`)
DONE — Task E2: Implement detectShellToken (presence-only) + unit test — complete (`.agents/scripts/bkit-postinstall.ts`, `.agents/scripts/bkit-postinstall.test.ts`)
DONE — Task E3: Implement detectNpmrcAuth + unit test (present, missing-registry, missing-authtoken, missing-both, absent) — complete (`.agents/scripts/bkit-postinstall.ts`, `.agents/scripts/bkit-postinstall.test.ts`)
DONE — Task E4: Move detectVercelProject to bkit-postinstall.ts, implement detectVercelEnv (preview + production) + unit tests — complete (`.agents/scripts/bkit-postinstall.ts`, `.agents/scripts/bkit-postinstall.test.ts`)
DONE — Task F1: Implement detectCiYmlMissingTokenEnv + unit test — complete (`.agents/scripts/bkit-postinstall.ts`, `.agents/scripts/bkit-postinstall.test.ts`)
DONE — Task F2: Implement detectValePackageNotSynced + unit test (3 cases) — complete (`.agents/scripts/bkit-postinstall.ts`, `.agents/scripts/bkit-postinstall.test.ts`)
DONE — Task F3: Extend WriteEntry with devDepsAdded?: string[], implement detectDevDepsNeedFetch(ws) + unit test — complete (`.agents/scripts/bkit-install.ts`, `.agents/scripts/bkit-postinstall.ts`, `.agents/scripts/bkit-postinstall.test.ts`)
DONE — Task F4: Wire all detectors into runPostInstallCheck with intra-phase dedup + cross-phase dedup + dryRun guard; apply dedup in runPreflight — complete (`.agents/scripts/bkit-postinstall.ts`)
DONE — Task F5: formatChecklist snapshot test, formatChecklist([]) empty-string test, detectVercelEnv no-project silent-skip test, detectNpmrcAuth absent-file silent-skip test — complete (`.agents/scripts/bkit-postinstall.test.ts`)
DONE — Task G1: Wire runPostInstallCheck in bkit-install.ts (install + dry-run paths with guarded banner emit) — complete (`.agents/scripts/bkit-install.ts`)
DONE — Task G2: Delete GH_BKIT_TOKEN_MISSING_INSTRUCTIONS, GH_BKIT_TOKEN_UNKNOWN_INSTRUCTIONS, VERCEL_AUTH_INSTRUCTIONS from bkit-modules.ts; recreate verbatim as action strings in bkit-postinstall.ts — complete (`.agents/scripts/bkit-modules.ts`, `.agents/scripts/bkit-postinstall.ts`)
DONE — Task G3: Write bkit-install.integration.test.ts Scenario 1 (blocker exit 1) and Scenario 2 (advisory checklist) — complete (`.agents/scripts/bkit-install.integration.test.ts`)
DONE — Task G4: Add Scenario 3 (bkit check dry-run: Phase 1 advisories rendered, Phase 3 detectors NOT invoked) to integration test — complete (`.agents/scripts/bkit-install.integration.test.ts`)
DONE — Docs: Add ## Install lifecycle section to README.md with three-phase description, PreflightFinding shape, stable id registry, cross-link to Consumer CI auth — complete (`README.md`)
DONE — Docs: Append DE-4 ADR to docs/decisions.md (BAR-141 structured PreflightFinding replaces printSink) — complete (`docs/decisions.md`)
DONE — Docs: Append KN-4 gotcha to docs/knowledge.md (Phase 3 runs ONLY in install, not check — dry-run parity) — complete (`docs/knowledge.md`)
DONE — Gate 2 verified: All tasks A1–G4 complete. printSink.push() call sites migrated. GH_BKIT_TOKEN_MISSING_INSTRUCTIONS / GH_BKIT_TOKEN_UNKNOWN_INSTRUCTIONS / VERCEL_AUTH_INSTRUCTIONS deleted from bkit-modules.ts. 343 tests pass, 0 failures.
DONE — Gate 3 verified: README, decisions.md, knowledge.md all updated per Documentation Updates table. docs.md unchanged (no new doc files).
DONE — Gate 4 verified: pnpm typecheck, format:check, lint:slop, lint:prose all pass. 343 tests pass (13 test files). Integration test exercises blocker exit + advisory checklist + dry-run parity.
