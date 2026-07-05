Verdict: CONCERNS

<!-- verdict:end -->

# Plan Summary

## Overview

BAR-141 proposes a three-phase install lifecycle for bkit: Phase 1 (preflight read-only checks before any writes), Phase 2 (current install behavior), and Phase 3 (post-install re-detection and unified AI-pasteable checklist output). The plan replaces scattered `printSink` advisory strings with a structured `PreflightFinding` interface carrying `{id, severity, detect, action}` tuples. It introduces three blocker detectors (`no-package-json`, `malformed-package-json`, `not-git-repo`), four+ advisory detectors in Phase 1 (`husky-no-markers-*`, `lint-prose-f9-vulnerable`, `bkit-version-major-downgrade`), and seven+ Phase 3 detectors covering token surfaces (shell, `.npmrc`, GitHub secret, Vercel env), CI config, vale sync, and devDeps fetch. Findings are deduplicated by `id` within phases (first occurrence wins) and across phases (Phase 3 wins for accuracy). Output is rendered via a unified `formatChecklist(findings)` formatter producing the exact multi-line banner format specified in the issue. The plan spans new files (`bkit-preflight.ts`, `bkit-postinstall.ts`), migrations in existing files (`bkit-install.ts`, `bkit-modules.ts`, `bkit-tiers.ts`), comprehensive unit/integration tests, and documentation updates.

## Plan Quality

Plan is well-scoped, detailed, and operationally sound:

- **Scope boundaries** clearly defined: what's included (preflight, post-install, three blocker types, 16+ advisory types), what's excluded (auto-apply fixes, `--strict` flag, telemetry).
- **Dependencies** explicit and verified: Phase 1 is upstream (read-only before `resolveTokens`), Phase 2 unchanged, Phase 3 downstream (after `dispatchModules`). Dry-run (`bkit check`) path clearly distinguished — Phase 1 advisories rendered, Phase 3 detectors skipped.
- **Gates well-formed**: Gate 1 (Acceptance Scenario + Breaking Changes human confirmation, core/conditional prerequisites), Gate 2 (code implementation), Gate 3 (testing + docs), Gate 4 (automated verification).
- **Supersession inventory** correct: `printSink: string[]` → `advisories: PreflightFinding[]` (internal, no consumer breakage); inline formatter → reusable `formatChecklist`; constants moved to post-install detectors.
- **Test matrix** comprehensive: 24 rows covering blocker/advisory detectors, deduplication, formatter, and integration scenarios — one row per discrete testable behavior.
- **Runbook granular and ordered**: Tasks A1–G4 decompose into phases (foundation, migration, preflight blockers, preflight advisories, post-install token, post-install other, wiring) with checkpoints and verification steps embedded.

## Completeness

Plan-level coverage is thorough:

- **Scope coverage**: All features from issue body are present — three-phase install, structured findings, blocker detection, advisory detection (husky, prettier, lint-prose, version), token surfaces (shell, `.npmrc`, GitHub, Vercel), other detectors (ci.yml, vale, devDeps), deduplication logic, output formatter.
- **Edge cases**: 14 rows in the Edge Cases table cover missing/malformed `package.json`, git-repo gating on `--core`, token-surface unknown-state handling, Vercel silent skip on no-project, deduplication (within-phase, cross-phase, duplicate-within-phase), no-advisories silent output, `bkit check` dry-run parity, version downgrade advisory.
- **Testing** well-planned: Unit tests per detector (positive + negative), integration tests (blocker exit, advisory checklist, dry-run), snapshot test (formatter), zero-advisory no-banner edge case, Vercel/npmrc silent skips, deduplication assertions.
- **Documentation**: README (install lifecycle section + `PreflightFinding` shape + stable `id` registry), decisions.md (ADR), knowledge.md (gotcha on Phase 3 dry-run suppression).
- **No architectural downgrades**: Architecture & Component Changes section clearly specifies new files, modifications, and deletes. No anti-patterns; all code lives in `.agents/scripts/` alongside peers.

## Acceptance Scenario

**CONCERNS — Human-confirmation gates are UNCHECKED:**

The Acceptance Scenario section (lines 34–148) is complete and well-formed:

- **Narrative** (lines 56–60): Fallback provided because no design doc exists. Suggested wording from issue body for human approval.
- **Success Criteria** (lines 62–72): Fallback provided. Suggested 5 measurable outcomes from issue (blocker exit, no-checklist on health, token advisory, deduplication, format compliance).
- **Concrete Example** (lines 74–95): Setup → Steps → Outcome narrative is specific and testable (4-advisory run).
- **Edge Cases** (lines 99–113): 14-row table covering all design-shaped and plan-added cases.
- **Derived Test Matrix** (lines 115–144): 24 rows, each mapping to a discrete Runbook task and target file.

**HOWEVER:** Line 148 shows the human-confirmation checkbox **UNCHECKED** `[ ]`. Per the contract (line 151): "Do NOT pass Gate 1 until this checkbox is `[x]`. Summary must issue `CONCERNS` if unchecked."

Similarly, Breaking Changes section (lines 155–219) is complete and detailed, but line 216 shows the human-confirmation checkbox **UNCHECKED** `[ ]`.

## Design Alignment

No design doc exists for BAR-141 (per plan-input.md line 170). The plan correctly applies the design-missing fallback per the template spec (line 42 of template.md): Narrative and Success Criteria are replaced with ⚠️ MISSING placeholders and a request for human provision. The plan then supplies suggested wording from the issue body for human approval. This is the correct pattern — the acceptance scenario is not fabricated; it is offered for human confirmation.

Once human confirms the Acceptance Scenario section (checkbox line 148 `[x]`), the narrative and success criteria become the canonical contract. The plan's scope (three-phase install, structured findings, blocker/advisory detectors, token surfaces, post-install re-detection) exactly matches the issue body scope and the suggested acceptance criteria.

## Risks

**Primary risk — Unchecked human-confirmation gates (Gate 1):**

Per the contract in the plan itself (lines 150–151, 218–219), both Gate 1 checkboxes (`Acceptance Scenario confirmed` and `Breaking Changes confirmed`) must be `[x]` BEFORE building. The plan is not blocked on external dependencies (no new packages, no new secrets), but it IS blocked on explicit human sign-off of the acceptance scenario and breaking changes. Current state: UNCHECKED.

**Secondary risks (mitigated):**

- **Dry-run parity**: Phase 3 is skipped in `bkit check` mode to preserve read-only semantics. However, Phase 1 advisories MUST still render via `formatChecklist(ctx.advisories)` to avoid silent regression. Plan explicitly addresses this (lines 366–367, 489) and marks it as an edge case (lines 111–112).
- **Token value exposure**: Plan specifies token detectors MUST check presence only (never read value). Snapshot tests assert `ACTION` strings reference `${GH_BKIT_TOKEN_INSTALL}` form (line 273). Mitigated via code-review grep for `process.env.GH_BKIT_TOKEN_INSTALL` on read paths.
- **Deduplication cross-phase conflict**: If Phase 1 and Phase 3 emit the same `id` with different `detect`/`action` text, Phase 3 wins (re-detection is more accurate). Mitigated via explicit deduplication logic (lines 342) and unit tests (lines 137).
- **Silent skips on external tool absence**: Vercel and `.npmrc` absence are silent (no findings), while token-surface `unknown` is an advisory. Plan distinguishes these clearly (lines 106–107, 345–347, 349).

## Action Items

**BLOCKING (must be completed before building):**

1. **Human must confirm Acceptance Scenario** (line 148): Check the box `[x]` after reviewing Narrative, Success Criteria, Concrete Example, Edge Cases, and Derived Test Matrix.
2. **Human must confirm Breaking Changes** (line 216): Check the box `[x]` after reviewing the internal API change (`printSink` → `advisories`), new stable `id` registry (17 public ids + 12 internal ids), and exit-code change (Phase 1 can exit 1 before module dispatch).

**After Gate 1 confirmation, plan is build-ready.**

Non-blocking observations:

- Pre-Flight / Dependencies section (lines 278–304) shows all Core items unchecked but lists them correctly — Gate 1 instruction (line 300) directs the agent to verify and check `[x]` these without stopping for user permission. This is correctly scoped to the agent.
- Gate 2–4 checkboxes (code implementation, testing/docs, automated verification) are similarly unchecked — these are agent execution gates, not human gates.
