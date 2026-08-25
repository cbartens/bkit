Verdict: PASS

<!-- verdict:end -->

# Ship Summary

## Overview

Feature #363 widens `bkit-cloud.yml`'s `workflow_run` trigger from `['feat/**']` to `['feat/**', 'fix/**', 'dev']` and adds branch-aware routing that automatically dispatches `/bkit-debug` for post-merge `dev` CI failures. The 22-file change (+767/−341 net) addresses the post-merge blind spot where a squash-merge reintroduces a failure — merge conflict resolution gone wrong, a dependency only resolved on the PR head, or an env difference. Previously bkit was blind to these until an operator noticed and manually invoked `/bkit-debug`; now the cloud orchestrator auto-routes the failure, delivering autonomous fix attempts bounded by a cross-session loop cap.

**Key changes:**

- `bkit-cloud.yml`: trigger filter widened; branch-aware routing added; FID recovery from squash-merge commit scope; concurrency group `bkit-auto-dev` with `cancel-in-progress: false` for `dev`; loop-cap enforcement.
- `bkit-ship.md`: `AUTO_ROUTE_SUFFIX` derivation re-introduced (threaded onto squash-merge subject when `bkit:auto`-labeled).
- `bkit-build.md`, `bkit-debug.md`: marker-threading corrected to re-derive per-fence (not via cross-call handoff).
- `bkit-counter-bus-config.sh`: `MAX_DEV_DISPATCH_ATTEMPTS=3` added for loop-bounding.
- Version 4.10.0 → 4.11.0; all mirrors (`.claude/`, `.cursor/`, `.opencode/`) regenerated; `docs/deferrals.jsonl` row added for main-branch exclusion reversal.

## CI Status

**Build phase:** Initial attempt FAILED at build-challenge-reconcile after max-retry exhaustion (1 allowed STANDARD→PIVOT→FINAL cycle). Root cause: `${LABELS:-}` shell idiom was never assigned anywhere in `.bkit/` (pre-existing dead code on dev, not a #363 regression). The `bkit [auto route]` marker threading was functionally inert across all workflows.

**Follow-up debug session** (2026-07-30 02:57–03:09) re-analyzed and fixed the root cause: deleted the cross-call `$GITHUB_ENV`-based handoff; re-derived `AUTO_ROUTE_SUFFIX` per-fence in all five workflows using `gh issue view {ISSUE_ID} --json labels --jq` with anchored grep (`-qxF`); regenerated all host mirrors; mutation-tested all fixes (7 test failures on each fix revert, confirming fixes are load-bearing). All 11 build-challenge findings closed. Full test suite green (2707 tests passed, 77 files; typecheck, prettier, actionlint, `check:dist`, `slop:delta` net 0, `bkit check` exit 0). Commit `4eb90baf` pushed (22 files, +767/−341).

**Ship phase:** Green first attempt.

- **ship-regression-guard:** PASS — no merge-blocking issues detected.
- **ship-conflict-resolve:** PASS — rebase conflict on CHANGELOG.md resolved (non-overlapping additive entries under `## [Unreleased]` concatenated preserving both Added/Changed/Fixed convention). All post-rebase verifications passed (install, typecheck, test, build).
- **ship-deferred-sweep:** PASS — no deferred blocking items.
- **ship-merge-pr:** PASS — PR #407 squash-merged to dev without failures.
- **ship-switch-to-dev:** DONE — merged at commit fbd46ad0; branch deleted.

## Action Items

1. **Corrected code was never re-challenged after the debug fix.** This is an accepted, declared trade-off per the build-challenge protocol: the follow-up debug session fixed the root cause and ran the full suite + mutation tests locally, but the fix was never re-run through `build-challenge` (which exists to catch what the implementer missed). The deferred-sweep summary documents this: _"skipping the build re-run forgoes a fresh adversarial `build-challenge` pass over these fixes. All 11 findings are closed with mutation-proof and the full suite is green, but a challenge is specifically designed to catch what the implementer missed"_ (ship-input.md line 792–793). Reviewers should note this trade-off was made: the code is fully tested and mutation-proof, but did not receive a second-pass challenge review.

2. **`docs/deferrals.jsonl` row added for main-branch exclusion.** Feature reversed the pivot-comment D-final decision to include `main` in the trigger filter — a documented, evaluated decision recorded as deferral row `363-main-branch-trigger-excluded-reversal`. No further action required; the exclusion is intentional and the rationale is preserved.

3. **Follow-up: `bkit-debug.md:1258-1264` carries the same broken `$GITHUB_ENV`-handoff idiom.** The debug session noted this pre-existing pattern in bkit-debug.md (worth a follow-up issue). Not addressed in this cycle.

4. **Loop-cap self-resetability:** Deferral row `363-dev-dispatch-cap-self-resettable-by-controlled-principal` documents that `MAX_DEV_DISPATCH_ATTEMPTS` counter lives in a file the dispatched `/bkit-debug` session has permission to rewrite — the cap is self-resettable by the principal it bounds (operators / malfunctioning agents). This was known and accepted as a trade-off; future mitigation would derive the count from a source the session cannot rewrite (e.g., `gh run list` filtered by FID) or cross-check against GitHub's API history. Documented as an acknowledged design trade-off, not a hidden gap.

## Recommended Next Step

Feature merged successfully. No further bkit command required.

**Brief:** Post-merge dev CI trigger widened; autonomous debug dispatch added for post-merge failures; 3-attempt loop-bound enforced. Build encountered inert marker-threading (pre-existing dead code, fixed via debug session + full mutation-proof test suite). Ship green first attempt, rebase conflict resolved. Trade-off note: follow-up debug fix was mutation-tested and fully validated but did not receive a second-pass build-challenge review — acceptable because challenge is designed for a human oversight catch and the fix was already caught and verified. Main-branch exclusion recorded as documented reversal decision.

## Deferred & Out-of-Scope

**Blocking Deferrals:** None.

**Exempt (out-of-scope):**

1. **363-main-branch-trigger-excluded-reversal** (docs/deferrals.jsonl row 69) — `main` branch excluded from auto-trigger; reversal of pivot-comment D-final decision. Rationale: no bkit-authored dev→main promotion workflow exists to carry `bkit [auto route]` marker, and bkit policy locks `bkit:auto` to dev-only (dev→main always manual). Recorded for revisit if bkit gains an authored promotion workflow.

2. **363-dev-dispatch-cap-self-resettable-by-controlled-principal** (docs/deferrals.jsonl row 70) — Loop-cap counter (`MAX_DEV_DISPATCH_ATTEMPTS=3`) lives in docs/plans/{FID}/status.jsonl on origin/dev, which the dispatched `/bkit-debug` session has contents:write permission to rewrite. Cap is self-resettable by the principal it bounds. Documented as accepted security trade-off; future mitigation would derive count from a source the session cannot rewrite or cross-check against GitHub API history.

3. **384-separate-ship-redesign** — The follow-up debug found and fixed pre-existing broken `$GITHUB_ENV`-handoff idiom in bkit-debug.md:1258-1264 (same pattern, same fix needed). Out of scope for this cycle; noted for follow-up issue.
