Verdict: CONCERNS

<!-- verdict:end -->

# Ship Summary

## Overview

**Feature shipped:** bkit-cloud rebuild on the Claude GitHub App (#141 + #184 folded, squash-merged as commit `b2cc83f` to `dev`). All 22 runbook tasks executed and verified across three child sub-plans. Deliverables: cloud-module split (`cloud=claude`/`cloud=cursor`), symmetric tracker/cloud constraints, `id-token: write` OIDC App auth on `bkit-cloud.yml`, D2 skip-tags on bookkeeping commits (`[skip ci]`), two-tier CI auto-route gate (`bkit [auto route]` marker + in-job `bkit:auto` label kill-switch), D3 concurrency key reconciliation (deferred to orchestrator stale-run guard + status.json locks), `Auto`→`bkit:auto` label migration, and 18 new regression tests locking in challenge remediation findings (1 HIGH mechanical, 1 HIGH architectural, 2 MEDIUM, 5 LOW — all fixed).

**Build outcome:** All 3 sub-plans verified PASS (1-1, 2-3 after 2 remediate cycles, 3-1). Holistic integration verdict CONCERNS (0 blocking, 3 non-blocking gaps logged: GAP-1 pre-existing internal refs in shipped comments, GAP-2 stale gitignored advisories.md, GAP-3 cosmetic prose drift). Full test suite 1082 passing (1064 existing + 18 new regression). Typecheck clean.

**Lines changed & files touched:** All diffs verified live against `git diff origin/dev..HEAD` before merge. Scope: cloud-variant module split (bkit-modules.ts, bkit-manifest.ts), tracker/cloud constraint enforcement (bkit-install.ts), two-tier CI gate + marker chain (bkit-cloud.yml template + canonical, .agents/workflows.md), D2 skip-tags (bkit-build.md, bkit-debug.md), D3 concurrency (bkit-cloud.yml, knowledge.md KN-30), `@claude` wiring (claude.yml dogfood-only, not shipped to consumers per DECISION-B), label migration (preflight hooks, trackers.md), challenge remediation edits (18 test additions, multiple targeted fixes), advisory flip (bkit-modules.ts, bkit-cloud-setup advisory), and docs/security.md hardening notes.

## CI Status

**Regression guard:** PASS (executed 2026-05-27 07:26:40Z). Pre-merge safety checks clear.

**Merge attempt 1:** PASS (2026-05-27 07:30:12Z, 0 failures). Squash merge to `dev` succeeded on first attempt. PR #201 merged via `gh pr merge --squash --delete-branch` (standard protocol). Head is now `dev` branch at commit `b2cc83f`. No rebase conflicts, no CI blocking (though live CI runs post-merge are async and not captured in this ship-cycle summary artifact).

**Build-phase CI history (upstream):** 1082 tests passing (was 1064, +18 regression tests). `pnpm typecheck` clean. `pnpm format` clean. No flakes. Sub-plan 2 required 2 remediate cycles (STANDARD attempt 1 found 3 failures, PIVOT attempt 2 restatement of D3, attempt 3 PASS). All build gates passed pre-merge. Challenge review (parallel) identified 10 findings (0 CRITICAL, 1 HIGH mechanical + 1 HIGH architectural + 2 MEDIUM + 5 LOW) — all fixed in-tree with 18 regression tests.

## Action Items

**Post-merge verification (HUMAN-GATED, BLOCKING):**

1. **Live-dispatch runtime check:** After the merge, a human must verify that `claude-code-action@v1` reaches a Claude turn in live GitHub Actions with the Claude GitHub App installed. This requires a real dispatch (via `@claude /bkit-build 141` comment or manual `workflow_dispatch`), observable App authentication (OIDC `id-token` path), and at least one Claude turn completing. This is the **single open acceptance item** that cannot be automated in-plan and must be confirmed before shipping to consumers. No timeline pressure; deferred to post-merge verification once the App is live on the test repo.

**Optional tidy (non-blocking, post-merge):**

- GAP-1: Scrub pre-existing internal issue refs (#119, #124, BAR-187) from consumer-shipped `bkit-cloud.yml` comment lines (pre-existing, not introduced by this PR, but worth a follow-up consumer-facing scrub per repo rule: no internal refs in shipped text).
- GAP-2: Run `bkit install` end-of-session to regenerate `.agents/advisories.md` (gitignored, not in PR diff, source is correct, regenerates on next `bkit install`/`bkit check`).
- GAP-3: Update `.agents/cloud.md:244` prose from "Auto label" → "bkit:auto label" (cosmetic, functional migration complete).

**Merge complete. No blockers for consumer shipment pending post-merge live-dispatch verification.**
