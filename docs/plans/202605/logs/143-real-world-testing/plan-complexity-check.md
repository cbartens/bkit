Verdict: SPLIT

<!-- verdict:end -->

# Plan Complexity Check

## Counts

**Executable tasks:** 61 discrete checkbox items across the runbook (Task 0a-c = 3; WS1-1..WS1-8 = 8; WS2-1..WS2-3 = 3; WS3-1..WS3-4 = 4; WS4-1..WS4-3 = 3; WS5-1..WS5-3 = 3; WS6-1..WS6-6 = 6; WS7-1..WS7-7 = 7 top-level + 18 discrete guard sub-items inside WS7-7; WS8-1..WS8-5 = 5) plus 8 mandatory gate/verification tasks in Gates 2/3/4 and the Verification Plan block. Total runbook checkboxes across the file: 78.

**Gates:** 7 (Gate 1 prerequisites, Gate WS-1 atomic rename, Gate WS-3 foundation, Gate 2 code implementation, Gate 3 testing and docs, Gate 4 automated verification, Gate WS-7 no half-wired soak branch).

**Domain areas (7):**

1. Installer TypeScript source (`bkit-manifest.ts`, `bkit-modules.ts`, `dist/` compiled mirror)
2. CI / release / husky workflow files (`.github/workflows/ci.yml`, `release.yml`, `.husky/pre-push`)
3. Agent workflow corpus (`bkit-debug.md`, `bkit-build.md`) — large multi-step markdown files with ~16 precise guard-site edits in WS-7 alone
4. Prompts corpus (8 existing prompts + 1 new `bkit-debug-soak.md`)
5. Consumer templates (`templates/.github/workflows/ci.yml`, `templates/docs/testing.md`, etc.)
6. Installer test suite (5 test files + 1 snapshot file, new back-compat test)
7. Canonical mirror + reference docs (`.agents/workflows.md`, `docs/testing.md`, `docs/decisions.md`, `docs/pending.md`, and 8 further reference docs)

## Session Fit Estimate

WS-1 alone requires reading and atomically editing 20+ files (package.json, bkit-manifest.ts, bkit-modules.ts, ci.yml, release.yml, pre-push, 5 test files, 8 prompts, 2 workflow files, .agents/workflows.md non-catalog lines, plus 10+ template/reference docs), verifying every grep site, running the test suite, and confirming back-compat fixtures. That single workstream accounts for roughly 40-60K tokens of read + write + verification passes.

WS-3 through WS-7 add: two large workflow markdown files with intricate guard tables; one new prompt file; 6 prompt edits; status.json schema introduction; and the WS-7 guard-coverage table with 18 individually verifiable sites (the plan's own named top risk). This adds another 60-80K tokens.

WS-2 and WS-8 (docs/testing.md rewrite + canonical mirror lockstep) add ~10-15K tokens.

Total estimate: **~130-160K tokens**, well above the 100K single-session threshold, and 61+ tasks (>15) trigger the threshold independently on task count alone.

## Rationale

The plan fires both SPLIT criteria simultaneously: task count (61+) exceeds 15 and token estimate (~130-160K) exceeds 100K.

**Proposed partition seams follow the WS DAG exactly as the session prompt instructs:**

### Sub-plan A — WS-1 (atomic rename) + Task 0 pre-decisions

Scope: Task 0a-c + WS1-1..WS1-8 + Gate WS-1 + the WS1 test-suite pass (`pnpm test` green) + session-end mirror regen for the rename surface only.
Rationale: WS-1 is explicitly "atomic-or-red-CI" — every caller in one PR. It is self-contained and independently mergeable. Its 11 tasks + gate are already near the single-session limit when the file surface (20+ files, grep verification at every site) is counted.

### Sub-plan B — WS-2 + WS-3 (taxonomy docs + capability foundation)

Scope: WS2-1..WS2-3 + WS3-1..WS3-4 + Gate WS-3 + the associated test assertions and snapshot regen.
Rationale: WS-2 (docs/testing.md rewrite + SEEDED template ci.yml smoke job + cost-invariant guard) and WS-3 (LIVE_STACK resolver + status.json envelope) are the shared foundation WS-4/5/6 all build on. Isolating them lets the foundation be merged and verified before the gate edits begin. 10 tasks; fits one session.

### Sub-plan C — WS-4 + WS-5 + WS-6 (plan/build/debug gates — non-soak)

Scope: WS4-1..WS4-3 + WS5-1..WS5-3 + WS6-1..WS6-6.
Rationale: These three workstreams are parallelisable per the DAG and share no internal ordering constraint once WS-3 is merged. Together they cover 12 tasks across three prompt/workflow domains and constitute the core gate logic (plan mandate, build empirical-verify, debug reproduce-first + empirical-verify + escape-hatch). Fits one session.

### Sub-plan D — WS-7 + WS-8 (soak orchestration + canonical-mirror lockstep)

Scope: WS7-1..WS7-7 (incl. all 18 guard-site sub-items) + Gate WS-7 + WS8-1..WS8-5 + Gates 2/3/4 + Verification Plan (dogfood tarball, install+upgrade live, soak guard smoke-read).
Rationale: WS-7 is the plan's named top risk (a half-wired soak branch) and requires reading bkit-debug.md exhaustively against 18 discrete guard sites. WS-8 must follow WS-5/6/7 to mirror their exact command text. The Verification Plan (manual steps including tarball dogfood and live install+upgrade) belongs here as the final sign-off. 12 top-level tasks + 18 sub-items + verification; fits one session when the preceding sub-plans are already merged and the file surface is stable.
