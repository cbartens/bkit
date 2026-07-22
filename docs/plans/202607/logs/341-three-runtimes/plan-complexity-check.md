Verdict: SPLIT

<!-- verdict:end -->

# Plan Complexity Check

## Counts

- **Tasks:** 16 (`T1`–`T16` in `## Agent Execution Runbook`, each a `- [ ] **T\d — ...**` checkbox).
- **Gates:** 4 numbered `🔒 Gate` blocks (Gate 1 Prerequisites, Gate 2 Code Implementation, Gate 3 Testing & Documentation, Gate 4 Automated Verification), plus the Manual Verification block (5 steps) and 3 `👤` human-confirmation checkboxes ahead of Gate 1.
- **Domain areas covered:** all within one repo (bkit tooling itself, no app stack — Static/Unit/Integration(bats)/Integration(vitest)/@live only) but spanning several structurally distinct surfaces that don't share edit context:
  - **Mechanism (shell):** new `.bkit/scripts/bkit-runtime.sh` + template (T3).
  - **Invariants (prose doctrine):** `.agents/rules.md` managed block (T6).
  - **Procedure (workflow headers):** `.bkit/workflows/bkit-{auto,design,plan,build,debug,ship,worktree-prune,worktree-sync}.md` — touched by T2, T7, T8, T9(indirectly via T10/T11), T10, T11, T12, T13, T15 (8 files, edited by 8 of the 16 tasks, several serialized on the same files per the plan's own note).
  - **Config/hook:** `.mcp.json` + `.claude/hooks/cloud-bootstrap.sh` (+ template mirrors) (T4, T5).
  - **Tests:** 2 new `tests/*.bats` files + 5 new/rewritten `.bkit/src/*.test.ts` vitest files, spread across T1, T3, T4, T5, T7, T9, T12, T15, T16.
  - **Docs:** `docs/decisions.jsonl`, `docs/knowledge.jsonl`, `docs/deployments.md`, `docs/testing.md`, `docs/observability.md`, `.bkit/workflows.md` (T9, T16, Documentation Updates table).
  - **Live verification:** real mode-1/mode-2/mode-3 runs, no CI harness (T16 terminal, Manual Verification Steps 1–5).

## Session Fit Estimate

Well over the ~85K-token single-session budget. Rough drivers:

- 16 discrete tasks, several individually large (T8 = 13 coupled sites across 5 files in one commit; T9 = 3 new close-guard kernel mechanisms + 3 bats assertions; T12 = enumerate-and-reconcile 6+ coupled subject/gate sites; T16 = full mirror regen + 3 live-runtime manual runs).
- The plan's own **Ordering (build-dependency DAG)** note states edits must **serialize** because T7/T10/T11 share `bkit-build.md`/`bkit-debug.md`/`bkit-ship.md`, and T8/T12 touch all five phase workflow files — i.e. the plan itself asserts these cannot safely be parallelized or compressed into one pass without repeated re-reads of large prose files.
- Each workflow-header edit (T2, T7, T8, T9, T10, T11, T12, T13, T15) requires reading large `.bkit/workflows/*.md` files (multi-hundred-line prose+bash hybrids) plus re-locating stale line anchors ("Line anchors are indicative, re-locate at build" — explicit rework tax), then writing bats/vitest assertions and running the local gate suite (typecheck/lint/format/vale/slop/drift/vitest/bats) — each full-suite run is costly and the plan implies multiple such passes.
- T16 alone (mirror regen + prose audit + live runs across 3 runtimes + SC1–7 assertion) is realistically its own session.
- 16 tasks > the 12-task ceiling regardless of the token estimate, independently triggering SPLIT.

## Rationale

**Verdict: SPLIT.** Both thresholds are breached: 16 tasks (> 12) and an estimated multi-session token footprint (> 85K) driven by serialized, large-file, cross-cutting edits that the plan's own DAG explicitly forbids parallelizing.

**Proposed sub-plan groupings**, following the plan's own **Ordering (build-dependency DAG)** (`Agent Execution Runbook` header note) so each sub-plan is a self-contained, buildable unit and no sub-plan violates the stated dependency edges:

1. **Sub-plan A — Independent roots (localized, no shared files):** T1 (macOS user-path fix), T2 (FID reorder in `bkit-auto.md`), T3 (runtime shim `bkit-runtime.sh` + capability table), T4 (C1 `.mcp.json` `actions` toolset), T5 (C2 `cloud-bootstrap.sh` gh hardening). 5 tasks, each touches disjoint files — fits one session.
2. **Sub-plan B — Invariants + CI-wait + branch model + close-guard kernel:** T6 (`rules.md` invariants — depends on nothing new), T7 (`bkit_wait_ci` + kernel extraction — depends on T3), T8 (adopt-or-mint 13-site commit — depends on T2), T9 (close-guard/close-audit kernel — depends on T3). 4 tasks, all consume T3/T2 from Sub-plan A; still land serially per the plan's own note but is a coherent single-session unit.
3. **Sub-plan C — Close shapes B and C:** T10 (close shape B: build/debug), T11 (close shape C: ship, skip dev-sync). 2 tasks, both depend on T9, both touch `bkit-build.md`/`bkit-debug.md`/`bkit-ship.md` (shared with T7 — must land after Sub-plan B).
4. **Sub-plan D — §6d skip-ci reconciliation + close shape A:** T12 (drop `[skip ci]` from close/status subjects + reconcile every coupled gate/counter/prose site — human-gated OQ-D), T13 (close shape A: design/plan D5(a) PR-close — depends on T9 + T12). 2 tasks, both touch `bkit-design.md`/`bkit-plan.md`/`bkit-ship.md`, high-risk reconciliation work best isolated.
5. **Sub-plan E — Fallback lane + peripherals:** T14 (gh→MCP fallback lane — depends on T4's `actions` toolset), T15 (worktree-prune/sync self-skip + debug egress loudness + Playwright artifact seam — depends on T4). 2 tasks.
6. **Sub-plan F — Terminal verification:** T16 (prose audit, batch mirror regen, live mode-1/2/3 runs, SC1–7 assertion, Manual Verification Steps 1–5). 1 task but disproportionately heavy (only reachable after all others land) — kept solo so a real live-session run isn't rushed inside a larger sub-plan.

Each sub-plan's task count (≤5) and file-touch footprint stays well under the single-session ceiling, and the grouping boundaries align exactly with the arrows in the plan's own Ordering DAG (`T1,T2,T3,T4,T5` → `T6,T7,T8,T9` → `T10,T11` → `T12,T13` → `T14,T15` → `T16`), so no sub-plan needs to re-derive dependency ordering — it inherits the plan's.
