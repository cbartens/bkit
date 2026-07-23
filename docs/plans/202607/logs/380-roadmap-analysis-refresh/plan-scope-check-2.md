Verdict: PASS
Failures: 2

<!-- verdict:end -->

# Plan Scope Check

Lens: Scope, criteria, verification audit.

## CRITICAL

1. **Task 14's `Done when` under-verifies its own stated scope.** Task 14's scope text says: "add `kind: "completed"` + `ROADMAP_SCAN_COVERAGE` to `.bkit/jsonl.md`; append the `decisions.jsonl`/`knowledge.jsonl` rows from Documentation Updates" — but its `Done when` line (`docs/plans/202607/logs/380-roadmap-analysis-refresh/plan-v2-reviewed.md:501`) only checks the deferral-CLOSED row, the `docs/observability.md` `[bkit-roadmap]` section, and generic "bkit check + prose lint clean." Neither the `.bkit/jsonl.md` additions nor the `decisions.jsonl`/`knowledge.jsonl` appends have any named verification (no grep/assert, no test, no explicit manual-verification step). Fix: add an explicit check to Task 14's `Done when` (e.g. "`.bkit/jsonl.md` carries `kind: "completed"` + `ROADMAP_SCAN_COVERAGE`; `decisions.jsonl`/`knowledge.jsonl` each carry the new rows — grep-verifiable") so the scope item has a real verification, not just an implicit umbrella "docs updated" gate.

2. **Task 4's `Done when` omits the `docs/roadmap.md merge=union` addition it scopes.** Task 4 (`docs/plans/202607/logs/380-roadmap-analysis-refresh/plan-v2-reviewed.md:476`) explicitly scopes "add `docs/roadmap.md merge=union`" (mirrors the Architecture § `.gitattributes` MODIFY block, line 366–368), but its `Done when` only checks `.agents/docs.md` rows + `bkit check` drift on `.agents/docs.md`. Task 1's `Done when` verifies the `completed.jsonl merge=union` line but not `roadmap.md`'s. No task, automated test, or Manual Verification step anywhere in the plan asserts `docs/roadmap.md merge=union` actually lands in `.gitattributes` (+ template copy). Fix: add an explicit assertion (test or Manual Verification note) for this line, or fold it into Task 1's `.gitattributes` check.

## OPTIONAL

- Matrix row 16 (reconcile/recovery, Task 12) tests "a missing in-flight FID re-added"; the design's Edge Cases table promises "re-adds/flags" (two distinct behaviors — a silent re-add vs. a flagged-but-not-re-added case, e.g. when the FID can't be confidently reconstructed). Consider a second bats/integration case (or an explicit note in Task 12's `Done when`) exercising the flag-only branch, not just the re-add branch.
- The top of the file (`plan-v2-reviewed.md:1-2`) carries a pre-existing `Verdict: PASS <!-- verdict:end -->` header above `<!-- bkit:start -->`, outside the managed plan template shape (`docs/plans/template.md` has no such field). This appears to be an artifact from a prior review pass folded into this filename rather than a plan-content issue — flagging only for visibility; out of this audit's Scope/criteria/verification lens, not treated as a plan defect.

## OUT OF SCOPE

- A lightweight `docs/roadmap.md` visualization/export (e.g., HTML or terminal-rendered Kanban view) is a plausible follow-on but is not required by any Success Criterion — would belong as a future utility enhancement, not this plan.
- Notification/webhook integration (e.g., posting the "best next step" analysis to Slack/Discord on ship) is a natural extension of WS-3/WS-4 but is speculative beyond the stated Success Criteria and correctly absent from this plan.
- Multi-repo / cross-consumer roadmap aggregation (rolling up several `docs/roadmap.md` boards) is out of this plan's single-repo scope and not implied by any Acceptance Scenario row.
