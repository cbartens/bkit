Verdict: SPLIT

<!-- verdict:end -->

# Plan Complexity Check

## Counts

- **Tasks:** 20 numbered tasks (`T1.1`–`T7.2`, checkbox-marked `- [ ] **T…**`) across 7 workstreams (WS-1 … WS-7).
- **🔒 Gates:** 4 (Gate 1 Prerequisites, Gate 2 Code Implementation, Gate 3 Testing & Documentation, Gate 4 Automated Verification), plus a 5-step Manual Verification block (including a live dogfood install to a scratch consumer dir).
- **Domain areas:** single product domain (bkit repo tooling/docs — no DB/API/mobile/infra split), but touching **54 mechanically-edited source files** (46 prompts + 8 workflows) plus 4 doc pairs (`docs/security.md`×2, `.agents/docs.md`×2), `.agents/rules.md`×2, `.bkit/prompts.md`, `.bkit/workflows.md`, `docs/testing.md`, one new multi-assertion test file (`bkit-untrusted-input-coverage.test.ts`, 6 sub-tasks with negative controls), extensions to `bkit-rules-sync.test.ts` (2 negative-control asserts), one batched `bkit install` mirror regen (re-renders ~138 files across `.claude`/`.cursor`/`.opencode`), and a full-suite + cross-provider spot-check + real dogfood build.

## Session Fit Estimate

Rough build: WS-1 (~6K) + WS-2 incl. two negative-control test extensions with delete/restore/re-run cycles (~10K) + WS-3+WS-4 mechanical rollout, 54 files × Read+Edit+verify (~600-1000 tok/file → ~40-45K) + WS-5 doctrine rewrite + ledger verify (~6K) + WS-6 new test authoring with 5 sub-tasks, 3 named clause constants, slop-config sign-off, multiple negative controls (~20-25K) + WS-7 batched install + before/after mirror-count verification across 6 dirs + full `pnpm vitest run` + cross-provider spot-check (~15K) + Gate bookkeeping + 5-step Manual Verification incl. scratch-probe file create/delete and a real `dist/bkit-install.js` dogfood run against a fresh consumer directory (~15-20K). **Total ≈ 110-130K tokens** — comfortably over the 85K threshold even before accounting for this plan document's own ~41K-token re-read at session start (mandated: "Read this plan.md natively ONCE at session start").

## Rationale

Both legs of the mapping trip independently: 20 tasks > 12, and the realistic token estimate (~110-130K) exceeds 85K. The task count is not an artifact of over-granular splitting in the plan — each `T*.*` genuinely carries its own `Done when` verification with negative controls (T2.2/T2.3/T6.1/T6.4/T6.5), several requiring temporarily-break-then-restore cycles that each cost a full test run. This is real, not inflated, complexity.

The instinct that "54 near-identical edits = low judgment, should stay atomic" is correct for the **file-edit mechanics** but does not save the token/task budget: the _volume_ of Read+Edit+verify cycles across 54 files is the dominant cost, not the per-file judgment. A single session doing all of WS-1 through WS-7 plus the two full-suite runs plus a live dogfood install plausibly exceeds context budget for sustained high-quality execution (risk of rushed verification on the later gates, especially the negative controls and the 6-file rendered-mirror by-eye check in T7.2).

However, a **domain-parallel split is explicitly wrong for this plan** and must not be proposed: § Merge Method states "All 7 workstreams land in ONE PR — non-negotiable" and the design DAG requires WS-6 (the enforcement gate) to land only after WS-3 + WS-4 are both complete, or CI reds mid-migration (the "half-migrated corpus" edge case). Splitting into independent per-workstream PRs would violate both constraints directly.

The split that helps without breaking these invariants is **sequential, same-branch, same-PR**: partition by _execution session boundary_, not by _PR boundary_. Each sub-session commits directly to the same feature branch (per the existing "commit after every subagent return" convention already in force) and only the **final** session opens/finalizes the single PR. Proposed grouping, respecting the DAG:

- **Segment A — Coverage rollout** (WS-1 → WS-2 → WS-3 → WS-4): docs/threat-model anchor, `rules.md` invariant + its two negative-control test extensions, all 46 prompts, all 8 workflows, plus `.bkit/workflows.md`'s index row. Ends with T3.1/T3.2/T4.1/T4.2/T4.3 all `[x]` — the precondition WS-6 needs. No PR opened yet; work stays committed on the branch.
- **Segment B — Doctrine, enforcement, regen, verification** (WS-5 → WS-6 → WS-7 + Gates 2-4 + Manual Verification): rewrite `.bkit/prompts.md` doctrine row, verify the 5 deferral-ledger rows, author the new coverage-gate test (with its slop sign-off and negative controls), run the batched `bkit install`, run the full suite, cross-provider spot-check, real dogfood install, and open the single squash PR.

This ordering is exactly the plan's own topological order collapsed into two session-sized chunks at the one point the plan itself calls a hard sequencing boundary ("Do NOT start WS-6 until T3.1, T3.2, T4.1, T4.2 are all `[x]`"), so it introduces no new risk and preserves "green at every commit boundary" and the single-PR merge method.
