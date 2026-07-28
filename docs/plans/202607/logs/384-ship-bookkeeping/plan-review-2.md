Verdict: CONCERNS
Failures: 1
<!-- verdict:end -->

# Plan Review — Lens 2: Dependency Graph & Execution-Order Soundness

Lens: task dependency graph correctness, DAG/cycle check, topological-sort validity, conformance to the design's workstream dependency table, hidden-dependency detection, parallelisation soundness.

---

## 1. Task → Workstream mapping (reconstructed from runbook)

| Task | WS    | Title (short)                                | Declared deps (verbatim from runbook)                                         |
| ---- | ----- | -------------------------------------------- | ----------------------------------------------------------------------------- |
| 0    | WS-1  | #341 Serialisation Carve-Out                 | none                                                                          |
| 1    | WS-3  | Configuration Surface                        | Task 0                                                                        |
| 2    | WS-2  | gh Stub Harness (GO/NO-GO cost hinge)        | Task 0                                                                        |
| 3    | WS-6  | Bookkeeping Contract + Tier-2 invariant test | Task 0                                                                        |
| 4    | WS-4  | `bkit-ship-gate.sh` + bats                   | Task 1, Task 2                                                                |
| 5    | WS-8  | Failure Path + Worktree Hardening            | Task 4, **"Task 6 contract (BOOK_ROOT — refer to Task 3's published name…)"** |
| 6    | WS-5  | Gate Distribution / Dogfood Mirroring        | Task 1, Task 4                                                                |
| 7    | WS-7  | `bkit-ship.md` Structural Rewrite            | Task 4, Task 5, Task 3                                                        |
| 8    | WS-9  | Rendered Mirrors + Workflow Index            | Task 7, Task 5                                                                |
| 9    | WS-10 | Documentation + Contract Publication         | Task 4, Task 7, Task 8                                                        |
| 10   | WS-11 | Tier-3 Status-Hole Detector                  | Task 3, Task 7                                                                |
| 11   | WS-12 | E2E Validation + Rollout                     | Task 4, Task 5, Task 6, Task 7, Task 8, Task 9, Task 10                       |

## 2. Design vs plan — dependency conformance

Design workstream table is the source of truth (`plan-input.md` § Suggested Workstreams). Comparison (resolving Task 5's "Task 6 contract" to Task 3 per its own parenthetical):

| WS    | Design deps                            | Plan task | Plan deps (resolved)                                          | Match                                   |
| ----- | -------------------------------------- | --------- | ------------------------------------------------------------- | --------------------------------------- |
| WS-1  | []                                     | 0         | []                                                            | ✅                                      |
| WS-2  | [WS-1]                                 | 2         | [Task 0]                                                      | ✅                                      |
| WS-3  | [WS-1]                                 | 1         | [Task 0]                                                      | ✅                                      |
| WS-4  | [WS-2, WS-3]                           | 4         | [Task 2, Task 1]                                              | ✅                                      |
| WS-5  | [WS-3, WS-4]                           | 6         | [Task 1, Task 4]                                              | ✅                                      |
| WS-6  | [WS-1]                                 | 3         | [Task 0]                                                      | ✅                                      |
| WS-7  | [WS-4, WS-6, WS-8]                     | 7         | [Task 4, Task 3, Task 5]                                      | ✅                                      |
| WS-8  | [WS-4, WS-6]                           | 5         | [Task 4, Task 3] (functionally)                               | ⚠️ literal label wrong — see MAJOR 1    |
| WS-9  | [WS-7, WS-8]                           | 8         | [Task 7, Task 5]                                              | ✅                                      |
| WS-10 | [WS-4, WS-7]                           | 9         | [Task 4, Task 7, **Task 8**]                                  | ⚠️ stronger — see MINOR 1               |
| WS-11 | [WS-6, WS-7]                           | 10        | [Task 3, Task 7]                                              | ✅                                      |
| WS-12 | [WS-4, WS-5, WS-7, WS-9, WS-10, WS-11] | 11        | [Task 4, Task 6, Task 7, Task 8, Task 9, Task 10, **Task 5**] | ⚠️ adds transitive Task 5 — see MINOR 2 |

## 3. DAG / cycle check

Functional dependency graph (resolving Task 5's "Task 6 contract" → Task 3 per its own clarification) edges:

```
0 → {1,2,3}                 (foundations: WS-3, WS-2, WS-6 — parallelisable after WS-1)
1 → 4
2 → 4
3 → 5, 7, 10
4 → 5, 6, 7, 9, 11
5 → 7, 8, 11
6 → 11
7 → 8, 9, 10, 11
8 → 9, 11
9 → 11
10 → 11
11 → {}
```

**Result: acyclic.** Topological sort (Kahn) confirms the runbook's chronological order `0,1,2,3,4,5,6,7,8,9,10,11` is a valid topological order of the functional graph — no task is scheduled before a resolved dependency completes.

No fabricated edges (every declared edge consumes a concrete artefact: Task 4 consumes Task 1's config keys + Task 2's stub; Task 7 consumes Task 4's gate binary, Task 5's hardened Failure Path, Task 3's RED invariant test; Task 8 consumes Task 7's rewritten source + Task 5's `.bkit/workflows.md` `.deferred-blocked` wiring; Task 9 consumes Task 4's final exit codes, Task 7's workflow shape, Task 8's re-sectioned `workflows.md`; Task 11 consumes all upstream artefacts for E2E).

## 4. Spot-checks requested by the lens

- **WS-2 cost hinge (~half day, revisit Tier-1 carrier scope on slip):** ✅ Flagged twice. Task 2 title carries `(GO/NO-GO cost hinge, ~half day)`; body carries the explicit STOP + `docs/deferrals.jsonl` (`key: 384-gh-stub-cost-hinge`) + orchestrator escalation. Reinforced in Open Questions & Assumptions ("the plan's single cost hinge"). Matches design Risk 12.
- **WS-12 (E2E) depends on all implementation workstreams and is scheduled last:** ✅ Task 11 is the final task; deps cover Tasks 4, 5, 6, 7, 8, 9, 10 (all implementation/distribution/docs/detector workstreams). Superset of the design's WS-12 direct-dep list.
- **Parallelisable foundations not artificially serialised:** ✅ Task 1 (WS-3), Task 2 (WS-2), Task 3 (WS-6) each depend only on Task 0. Runbook intro explicitly names "foundations in parallel" in the build-dependency ordering narrative. (Caveat — see MINOR 3.)
- **Implicit hidden dependencies on `.bkit/workflows/bkit-ship.md` / mirrors:** ✅ None found.
  - Task 5 (WS-8) edits `bkit-ship.md` Failure Path + Step 12, and wires `.deferred-blocked` in `.bkit/workflows.md` — this is **before** Task 7's full rewrite, but is declared by design (WS-7 → WS-8) and the plan (Task 7 → Task 5). Not hidden.
  - Mirrors (`.claude/`, `.cursor/`, `.opencode/`, templates snapshot) are regenerated only by Task 8 (WS-9). No earlier task touches them. ✅
  - `.bkit/workflows.md` is edited by Task 5 (writer wiring) then re-sectioned by Task 8; Task 8 → Task 5. ✅

---

## CRITICAL

None. The functional dependency graph is acyclic, every declared edge consumes a real artefact, the chronological order is a valid topological sort, WS-12 is correctly terminal, the WS-2 cost hinge is flagged, and no hidden dependency on `bkit-ship.md` or the mirrors precedes its declared owner.

## MAJOR

### 1. Task 5 (WS-8) declares the wrong literal dependency target — "Task 6 contract" should be "Task 3"

**Location:** `plan-v1-draft.md` line 455, Task 5 `**Dependencies:**`.

**The defect.** The design requires `WS-8 → [WS-4, WS-6]`, i.e. Task 5 depends on Task 4 (WS-4) and Task 3 (WS-6, which publishes the `BOOK_ROOT` contract). The plan's Task 5 dep line reads:

> **Dependencies:** Task 4 (gate, per design ordering), **Task 6 contract (BOOK_ROOT — refer to Task 3's published name** even though the prose rewrite is Task 7).

The literal token **"Task 6"** points to Task 6 = WS-5 (Gate Distribution / Dogfood Mirroring) — which has nothing to do with `BOOK_ROOT`. The `BOOK_ROOT` contract is published by **Task 3** (WS-6). The parenthetical "(refer to Task 3's published name)" rescues the intent, but the literal dependency declaration is wrong. This reads as a WS-number vs Task-number conflation (WS-6 ↦ Task 3, not Task 6).

**Why it is a dependency-graph / execution-order defect, not just wording.**

- A literal / topological-sort reader of the dep line sees `Task 5 → Task 6`, while Task 5 is scheduled at position 5 and Task 6 at position 6 — i.e. **Task 5 is scheduled before a declared dependency completes.** That violates the lens's "flag any task scheduled before a dependency completes" rule under the literal reading.
- An executor honouring "Step Isolation: complete each task fully before next" and reading the dep literally would either (a) skip ahead to Task 6 and return, reordering the runbook, or (b) stall at Task 5 reporting an unsatisfied dependency. Neither deadlocks (Task 6 does not depend on Task 5, so there is no cycle), but both create friction and the second is a false blocker.
- The design's own `WS-8 → [WS-4, WS-6]` is not what the plan's literal text expresses.

**Fix.** Rewrite the dep line to `Task 4 (gate, per design ordering), Task 3 (BOOK_ROOT contract — the name published by the WS-6 invariant test, available before the prose rewrite)`.

**Not CRITICAL because:** the parenthetical clarification recovers the intent, no actual cycle is introduced, and the resolved graph is a valid DAG with a valid topological order. It is MAJOR because the literal declaration is incorrect and contradicts the design's workstream table.

## MINOR

### 1. Task 9 (WS-10) strengthens the design's dependency — adds Task 8

**Location:** line 463. Design: `WS-10 → [WS-4, WS-7]`. Plan Task 9: `[Task 4, Task 7, Task 8]`. The extra `Task 8` (WS-9, mirror + `workflows.md` regen) is justified by Task 9's own Done-when (`pnpm test` including prose audit passes — the audit reads `.bkit/workflows.md`'s re-sectioned step table), so it is a real but design-undeclared dependency that the plan surfaces. It tightens the schedule (docs cannot start until mirrors regen completes) without being wrong. Suggest either (a) recording it in the design's WS-10 dep list for traceability, or (b) relaxing Task 9's Done-when to not require the full prose audit if the intent is to keep WS-10 parallel with WS-9.

### 2. Task 11 (WS-12) lists a redundant transitive dependency (Task 5)

**Location:** line 467. Design's WS-12 direct deps: `[WS-4, WS-5, WS-7, WS-9, WS-10, WS-11]` — WS-8 is not listed (it reaches WS-12 transitively via WS-7 and WS-9). The plan's Task 11 adds `Task 5 (WS-8)` explicitly. Harmless — it is in the transitive closure — but it adds noise to the dep list and diverges from the design's declared direct-dep set without explanation. Suggest dropping `Task 5` from Task 11's dep line, or annotating it "(transitive via Task 7/Task 8)".

### 3. "Step Isolation" preamble vs "foundations in parallel" intro — tension

**Location:** line 440 (preamble) vs line 443 (intro). The preamble says "Complete each task fully (verification + checkbox) before next"; the intro says "serialisation gate → foundations in parallel → …". A literal executor could serialise Task 1 / Task 2 / Task 3 (and even Task 5 / Task 6, which both depend only on Task 4 and could run in parallel) unnecessarily. The intent (parallel foundations, serial gate-dependent chain) is recoverable from the intro, but the two statements sit in tension. Suggest explicit "(Task 1, Task 2, Task 3 may run in parallel after Task 0; Task 5 and Task 6 may run in parallel after Task 4)" guidance.

### 4. Task 7 rewrite must preserve Task 5's Failure Path hardening — guarded by the invariant test, not by the task text

**Location:** line 459, Task 7. Task 7 does a full structural rewrite of `bkit-ship.md`. Task 5 previously hardened the Failure Path (`.deferred-blocked` writer, `BOOK_ROOT` resolution, abort-before-append ordering, removed silencings, Step 12 ownership scoping). Task 7's description does not explicitly say "preserve Task 5's Failure Path hardening" — it says "Failure Path hardened underneath" in the dep line. The safety net is Task 3's Tier-2 invariant test turning GREEN (it asserts `.deferred-blocked` writer under `BOOK_ROOT`, etc.); if Task 7's rewrite drops a Task 5 fix, the test goes RED. So the property is enforced, but an executor rewriting the file from scratch could waste a cycle rediscovering Task 5's fixes. Suggest adding an explicit "preserve the Task 5 Failure Path block intact (asserted by Task 3's invariant test)" line to Task 7's scope.

---

## Verdict Rationale

The functional dependency graph is sound: acyclic, valid topological order, no fabricated edges, no hidden dependencies on `bkit-ship.md` or the rendered mirrors, WS-12 correctly terminal and exhaustive, WS-2 cost hinge flagged twice, parallel foundations acknowledged. One MAJOR defect — Task 5's literal "Task 6 contract" dependency target is wrong (should be Task 3); the parenthetical recovers the intent but the literal declaration contradicts the design's `WS-8 → [WS-4, WS-6]` table and creates an apparent scheduling-before-dependency under a literal reading. The four MINOR items are tightenings / redundancies / wording tensions that do not affect graph correctness. No CRITICAL. Verdict: CONCERNS; Failures: 1.
