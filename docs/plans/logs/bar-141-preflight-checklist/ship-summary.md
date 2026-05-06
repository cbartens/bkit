# Ship Summary: bar-141-preflight-checklist

<!-- verdict:start -->Verdict: PASS<!-- verdict:end -->

## Overview

**Lines changed:** 6,460 additions, 763 deletions across 38 files

**Key changes:**
- Replaced bkit's ad-hoc `printSink: string[]` advisory pattern with structured three-phase install architecture
- Phase 1 (Preflight): Read-only blocker detection before any writes; exits 1 if critical issues found (`no-package-json`, `malformed-package-json`, `not-git-repo`)
- Phase 2 (Install): Current module dispatch with writes (unchanged)
- Phase 3 (Post-install): Re-detection of token surfaces, CI config, and environment after writes
- 2 new files: `.agents/scripts/bkit-preflight.ts`, `.agents/scripts/bkit-postinstall.ts`
- 3 blocker detectors, 10+ advisory detectors (husky markers, prettier markers, lint-prose F9 guard, version downgrade/stale pin, shell token, npmrc auth, GH secret, Vercel env, CI yml env, vale sync, devDeps fetch)
- `PreflightFinding` interface: `{id, severity, detect, action}` replacing unstructured strings
- Deduplication by id within phases (first occurrence wins) and across phases (Phase 3 wins on conflict)
- Unified output formatter: `formatChecklist(findings)` producing multi-line AI-pasteable banner with `--- i/N [severity] id ---` dividers
- Existing `printSink` messages migrated with stable public id registry (17 public + 12 internal ids)
- Documentation updates: README `## Install lifecycle` section, `docs/decisions.md` ADR (DE-4), `docs/knowledge.md` gotcha (KN-4)

## CI Status

**Green, no retries.** PR #5 merged at 2026-05-06T10:43:17Z with single squash commit.

Build phase completed with PASS verdict:
- All 371 tests pass (13 test files + 21 additional challenge tests)
- 0 test failures
- TypeScript type check, linting, formatting all pass
- Challenge phase identified 10 findings (5 MEDIUM, 5 LOW); all MEDIUM findings remediated and tested
- Integration tests verify blocker exit path, advisory checklist output, and dry-run Phase 1 parity (`bkit check`)

Code implementation verified against plan Derived Test Matrix:
- Phase A–G runbook tasks (A1–G4): all 28 tasks completed and independently verified
- Intra-phase deduplication by id (both preflight and postinstall)
- Cross-phase deduplication with Phase 3 winning on conflicts
- Dry-run path (bkit check) renders Phase 1 advisories while suppressing Phase 3 detectors (preserves read-only semantics)
- formatChecklist snapshot test validates exact output format per issue body specification

## Action Items

None. Feature shipped clean with no retries.

All PR acceptance criteria met:
- Phase 1 blockers exit 1 before any writes (prevents half-installed state)
- Structured findings with stable `id` strings ready for downstream tooling consumption
- Four-surface `GH_BKIT_TOKEN` sweep implemented (shell, .npmrc, GitHub secret, Vercel env)
- All previously emitted `printSink` strings migrated with no behavioral regression
- Comprehensive test coverage across unit, integration, and snapshot tests
- Documentation updated (README, decisions.md, knowledge.md)
