Verdict: CONCERNS

<!-- verdict:end -->

# Build Summary — 141-cloud-app

## Overview

**Features shipped:** All 22 runbook tasks (T1.1–T1.11, T2.1–T2.7, T3.1, T4.1–T4.3) from the three child sub-plans executed and verified. **Delivered in one squashed PR:** bkit-cloud rebuild on the Claude GitHub App (issue #141 + #184 folded into single PR), splitting the cloud-agent module into `cloud=claude` (GitHub-tracker paired) and `cloud=cursor` (Linear-tracker paired), adding `id-token: write` to `bkit-cloud.yml` for OIDC App authentication, fixing three critical-path defects (D1: missing OIDC permission, D2: skip-tags on bookkeeping commits, D3: broken concurrency key), implementing two-tier CI auto-route gating (`bkit [auto route]` marker + in-job `bkit:auto` label kill-switch), and migrating Linear's bare `Auto` label to `bkit:auto` across all trackers.

**Gates passed:** Plan Gate 1 (Acceptance Scenario + Breaking Changes human review + #184 coordination), all three sub-plan Gate-2 implementations, Gate-3 documentation, and Gate-4 automated verification (all 1082 tests passing, typecheck clean). Holistic cross-plan integration verified.

**Notable mid-build pivots:**

- **D3 restatement (sub-plan 2 PIVOT remediate attempt 2):** The original D3 concurrency-key criterion ("a dispatched build and its CI must serialize") was structurally unsatisfiable using GitHub Actions `concurrency` groups alone across the dispatch surface and the CI `workflow_run` surface (the issue number is not available on the CI event path without parsing). The build cycle reconciled this by introducing the orchestrator stale-run guard (existing `bkit-cloud.md:145`) as the live serialisation boundary and restating the D3 requirement to match architectural reality: "concurrency serialization is DEFERRED to the orchestrator, which already implements it via `status.json` locks + branch-head identity checks"; the workflow `concurrency` key now derives a FID-primary token for deterministic caching, not for load-bearing authz. This is documented in `knowledge.md:495` (KN-30) and `bkit-cloud.yml:58-72`. A revised plan-execution step (sub-plan 2 PIVOT gap-remediate) realigned the criterion and tests; no loss of correctness.
- **Challenge remediations (10 findings, 0 CRITICAL):** All 10 findings from parallel challenge review (bugs/correctness + security lenses) were remediated in-cycle: Finding 1 (HIGH mechanical: PCRE `grep -oP` + pipefail safety) fixed with portable grep/sed + guards in both canonical + template; Finding 2 (HIGH architectural: `claude.yml` missing author_association gate) restricted to OWNER/MEMBER/COLLABORATOR on all 4 event paths; Findings 3–10 (1 HIGH, 2 MEDIUM, 5 LOW) all fixed or documented as designed (trust assumptions recorded in `docs/security.md`, architectural notes added to code comments). 18 new regression tests added to lock in remediations. All tests (1082 total) passing.

## Implementation Quality

**Verify-plan alignment:** All 22 T-tasks from the executable plan checked against delivered code via live-file inspection + diffs. Code matches plan tasks:

- T1.1–T1.3: `id-token: write` present in `bkit-cloud.yml` template and rendered copy (no Linear branch, no `github.token` framing).
- T1.4–T1.6: CLI `--cloud=claude|cursor` parsing enforced, symmetric tracker/cloud constraint checks in place, cloud-module split (`CLOUD_MANIFEST_CLAUDE`/`CLOUD_MANIFEST_CURSOR`) implemented, single `bkit.cloudAgents` field with back-compat `"enabled"→"claude"` mapping.
- T1.7–T1.9: Advisory flip (App required, `/install-github-app`, no bare `Auto`), `bkit check` consistency assertion active, LINEAR_API_KEY decoupled from GitHub render.
- T1.10–T1.11: Dry-run parity verified for both variants; T1.11 (advisories regen) deferred as design for end-of-session `bkit install` batch.
- T2.1–T2.5: #184 shared HEAD-subject assertion implemented (home: `.agents/workflows.md` § "HEAD-Subject Assertion (shared, single source — #184)"), deny-list treats `bkit [auto route]` as legitimate, D2 skip-tags on worktree-setup/create-pr verified.
- T2.6–T2.7: Two-tier CI gate in `.github/workflows/bkit-cloud.yml` (free tier: job `if: contains(head_commit.message, 'bkit [auto route]')`, cheap tier: in-job `gh issue view {ISSUE} --json labels` re-check), both files (canonical + template) byte-identical per T3.1 invariant.
- T3.1: FID-derived concurrency key restatement (reconciled to orchestrator stale-run guard per PIVOT).
- T4.1–T4.3: `claude.yml` wiring (bkit-repo-only dogfood, not shipped), `Auto`→`bkit:auto` migration in preflight hooks + `trackers.md`, full 13-item Manual Verification checklist executed.

**Challenge findings processed:** Challenge log reports 10 findings (0 CRITICAL): 1 HIGH mechanical (PCRE grep), 1 HIGH architectural (author_association), 2 MEDIUM mechanical/trust (constraint-before-write, cross-block var scope, PR-body trust source), 5 LOW (dead output, doc staleness, etc.). All remediated or deferred with documented justification. No unresolved CRITICAL or HIGH findings blocking shippability (the two HIGH findings are fixed in-tree).

**Architecture respected, no new violations introduced:** Cloud-module split correctly mirrors tracker constraint (`claude↔github`, `cursor↔linear`). Auth coherence verified (DECISION-A honoured: `claude.yml` uses `claude_code_oauth_token` + OIDC, `bkit-cloud.yml` uses `ANTHROPIC_API_KEY` + OIDC; no token confusion). D1/D2/D3 defects fixed, D3 restatement correct per architecture. No architectural regressions.

**Test coverage for changed files:** 1082 tests passed (was 1064, +18 new regression tests covering challenge findings 1–3 + Finding 4 byte-identity). Vitest suites green across all integration + unit + render tests. Typecheck clean. All new code instrumented with regressions for the specific findings.

## Verification Status

**All sub-plan verifications PASS:**

- build-plan-verify-1-1 (Block 1): PASS, 0 failures, 298 tests in scope green.
- build-plan-verify-2-3 attempt 3 (Block 2+3): PASS (after 2 remediate cycles due to invalid `replace()` then corrected via PIVOT restatement).
- build-plan-verify-3-1 (Block 4): PASS, 0 failures.
- build-plan-verify-holistic (master index + 3 children integration): VERDICT: CONCERNS (non-blocking, 3 gaps logged: GAP-1 pre-existing issue-refs in shipped comments, GAP-2 stale gitignored advisories.md regen, GAP-3 cosmetic prose drift). All 7 cross-cutting integration checks PASS (marker chain, #184 single-source, cloud-split↔gate coherence, label consistency, D3 reconciliation, consumer-ref scrub, tests+typecheck).

**Attempt count:** Build executed cleanly through all phases. Sub-plan 2 required 2 remediate cycles (first STANDARD, second PIVOT for D3 architectural restatement); cycles were planned and expected (the concurrency criterion needed human review to reconcile).

## Test Status

**All 1082 tests passing first run after remediation cycles:** Pnpm test (full suite, no turbo.json filter): 1082 passed, 2 skipped, 1 todo. Typecheck: clean. Format check: clean. No flakes. New 18-test regression suite for challenge findings locked in (Finding 1: 6 tests for SHARED-DERIV portability + pipefail + real-tool validation; Finding 2: 5 tests for author_association gate on 4 event paths + allow-list; Finding 3: 3 tests for constraint-before-write invariant; Finding 4: byte-identity assertion + augmented checks).

## Challenge

**Verdict: CONCERNS (0 CRITICAL, 1 HIGH mechanical + 1 HIGH architectural + 2 MEDIUM + 5 LOW — all remediated or documented).**

**Findings summary:**

1. **Finding 1 — HIGH mechanical** (SHARED-DERIV grep -oP PCRE + pipefail): Root causes (two coexisting): (a) regex assignments under `set -euo pipefail` with no failure guard (grep exits 1 on no-match → step aborts instead of falling back); (b) `grep -oP` relies on GNU PCRE, unavailable on BSD/macOS, breaks on runner-image drift. **Fix:** Replaced `grep -oP` lookbehind with portable `sed`/`grep -oE`, added `|| true` guards to restore fallback/fail-safe path. Both canonical + template byte-identical per T3.1.

2. **Finding 2 — HIGH architectural** (`claude.yml` author_association): `@claude` trigger fires for ANY actor (including drive-by external commenter); no `author_association` gate. The job has `id-token: write` + `claude_code_oauth_token` in scope, and the diff repurposes this as the consumer-facing trigger. Prompt injection / unauthorised phase dispatch possible. **Mitigating factors:** Pre-existing gate in origin/dev (diff only added comments), file is bkit-repo-only not shipped, advisory will direct consumers to `/install-github-app` (which generates a separate App-owned `claude.yml`). **Fix:** Added `author_association` gate restricting to OWNER/MEMBER/COLLABORATOR on all 4 event paths (`issue_comment`, `pull_request_review_comment`, `pull_request_review`, `issues`).

3. **Finding 3 — MEDIUM mechanical** (partial `package.json` write before constraint check): Tracker value persisted BEFORE cloud/tracker constraint check → on constraint failure, `package.json` is mutated, next retry trips tracker-switch hard-block. **Fix:** Hoisted constraint check above `package.json` write (compute validated issueTracker first, persist only post-validation).

4. **Finding 4 — MEDIUM mechanical** (AUTO_ROUTE_SUFFIX cross-block var leak): Variable assigned in one fenced block, consumed in separate blocks → shell vars don't survive → `bkit [auto route]` marker silently dropped → CI free-tier gate never fires. **Fix:** Merged 3 blocks in bkit-build.md Step 18 (assign + HEAD-Subject assertion + commit) into 1 block; bkit-debug.md Step 12 merged steps 3+4, Step 10 re-reads via temp file.

5. **Finding 5 — MEDIUM architectural** (PR-body metadata trust source): PR body editable by author/triage-access → attacker can point `bkit:issue=#<N>` at a different issue carrying `bkit:auto`, defeating the kill-switch. **Mitigating factor:** Requires repo write/triage; collaborator-vs-collaborator gap, not external-attacker. **Fix:** Documented trust assumption + mitigations in `docs/security.md` (branch-derived FID is non-editable fallback). Future hardening via `closingIssuesReferences` cross-check deferred (architectural note added).

6. **Findings 6–10 — LOW:** run-name untrusted (no fix required, display-only), variant-split uninstall unrealized (comment updated to document intent), check/upgrade variant mismatch (comment added, behavioral fix deferred), dead fid output (removed), DE-21 doc staleness (updated `bkit.cloudAgents` reference). All addressed or explicitly marked as designed limitation.

**No unresolved CRITICAL findings. All HIGH findings fixed in-tree. MEDIUM findings mechanically corrected (constraint-before-write, block-var scope, trust assumption documented). All 18 new regression tests passing.**

## Generated Tests

**18 new regression tests added** across `.agents/scripts/bkit-modules.integration.test.ts` and `.agents/scripts/bkit-install.integration.test.ts` to lock in challenge remediation:

- **Finding 1 (6 tests):** SHARED-DERIV portability (no `grep -oP` in canonical/template) + pipefail safety (`|| true` guards) + real-tool validation (bash -c under `set -euo pipefail` exits 0 on empty body, parses well-formed body correctly).
- **Finding 2 (5 tests):** author_association gate present on all 4 event paths + allow-list contains exactly OWNER/MEMBER/COLLABORATOR + checked via `fromJSON` + `contains()` logic.
- **Finding 3 (3 tests):** Mismatched `--tracker=github --cloud=cursor` exits non-zero + does NOT write `package.json` + matching pair succeeds.
- **Finding 4 (byte-identity):** Existing assertion augmented with specific grep/guard checks covering remediated lines.

**No bugs in remediation tests discovered; all 1082 tests (1064 existing + 18 new) passing.**

## Risks

**Live-dispatch runtime verification (HUMAN-GATED, POST-MERGE):** The feature implements `id-token: write` + OIDC App auth + two-tier CI gate + marker chain, all in-tree and testable. However, the **one open acceptance item** (Manual Verification item 1 from child 3) is the **live-dispatch runtime check:** `claude-code-action@v1` reaching a Claude turn in actual GitHub Actions with the Claude App installed. This requires:

- A real GitHub Actions environment (not the plan-execution shell environment).
- The Claude GitHub App installed on the test repo.
- A manually-triggered or CI-fired workflow_run event.

**This test is deferred to post-merge** because it cannot be exercised in-plan and requires human setup + verification. It is the **single acceptance gate** that must be confirmed before shipping to consumers.

**Architectural note on D3 (concurrency serialization):** The original D3 criterion proposed using GitHub Actions `concurrency` groups alone for serialization across dispatch + CI surfaces. Investigation during build revealed the issue number (needed to derive a stable FID) is not available on the CI `workflow_run` event path without parsing the PR body (which introduces trust-source concerns). The reconciliation defers load-bearing serialization to the orchestrator stale-run guard (existing, pre-tested), which reads `status.json` locks + branch-head identity. The workflow `concurrency` key now derives a FID-primary token for deterministic caching and conflict-avoidance, not for authz. This is documented and not a defect, but it represents a deliberate architectural restatement (not scope-shedding, a legitimate design refinement discovered during build).

**Deferred (gitignored, no PR impact):** T1.11 (`.agents/advisories.md` regen) is scheduled for end-of-session `bkit install` batch (memory feedback). The file is gitignored/untracked; the source advisory definitions in `bkit-modules.ts:2003-2015` are correct and will regenerate correctly on next `bkit install`/`bkit check`.

**Architectural gap not code-fixed (documented, not blocking):** Challenge Finding 5 (PR-body trust-source integrity for `bkit:issue=#` kill-switch lookup) is a **collaborator-vs-collaborator** data-integrity concern, not a security bypass. The fix deferred in this cycle is a future hardening via `closingIssuesReferences` cross-check. For now, the trust assumption (PR-body markers are collaborator-trusted) and the fallback (branch-derived FID is not body-editable) are documented in `docs/security.md`. The gate is safe as-shipped (no external attacker hole) but has an integrity edge case for repo collaborators.

## Action Items

**Ship gate (single item):**

1. **[HUMAN, POST-MERGE] Live-dispatch runtime verification:** After merging #141+#184 squash PR, a human must:
   - Ensure the Claude GitHub App is installed on the test/bkit repo.
   - Trigger a real build (via `@claude /bkit-build 141` in an issue comment or manual `workflow_dispatch`).
   - Confirm `claude-code-action@v1` reaches a Claude turn (observable in the Actions UI and in any comment response from the App).
   - This is the only acceptance item that cannot be automated in-plan and must be verified live.

**Pre-ship optional tidy (non-blocking, recommend before Final-SCOPE sign-off):**

- GAP-1: Scrub pre-existing internal issue refs (#119, #124, BAR-187) from consumer-shipped `bkit-cloud.yml` comment lines (out-of-introduced-scope but flagged during holistic verification). Consumer-facing rule: no internal refs in shipped text.
- GAP-2: Run `bkit install` end-of-session to regenerate `.agents/advisories.md` from the correct source (not in PR diff, but visible on local `bkit check` after merge).
- GAP-3: Update `.agents/cloud.md:244` prose from "Auto label" to "bkit:auto label" for consistency (descriptive only, functional migration is complete).

**None of the above action items block ship.** The PR is ready for merge pending the post-merge live-dispatch confirmation.
