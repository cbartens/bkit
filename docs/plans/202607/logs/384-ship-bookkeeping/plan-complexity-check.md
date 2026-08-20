Verdict: SPLIT
<!-- verdict:end -->

# Plan Complexity Check

## Counts

- **Tasks:** 12 (Task 0–11) — at the ≤12 SINGLE boundary, eligible on count alone.
- **🔒 Gates:** 4 (Gate 1 prerequisites, Gate 2 code implementation, Gate 3 testing & docs, Gate 4 automated verification).
- **Domain areas:** shell scripts (2 new byte-identical pairs + 1 modified = 5 files); bats tests (3 new files, 10+ named cases); vitest tests (3 new `.test.ts` files); workflow prose (structural rewrite of a 1278-line `bkit-ship.md` + Failure Path + Step 12 hardening + `.bkit/workflows.md` re-section); rendered mirrors (4 command surfaces via `bkit install`); documentation (6 docs: observability, deployments, decisions, knowledge, deferrals, testing); Tier-3 detector (new `.ts` + CLI subcommand); E2E validation (consumer-repo manual workstream).
- **Critical-path depth:** Task 0 → Task 2 → Task 4 → Task 5 → Task 7 → Task 8 → Task 9 → Task 11 = 8 sequential layers; no parallelism on the critical path.

## Session Fit Estimate

<!-- prettier-ignore -->
| Segment | Estimated tokens | Rationale |
| --- | --- | --- |
| Plan + design context (read once) | ~25K | 537-line dense plan + design ship-shape slice + current `bkit-ship.md` (1278 lines) |
| Task 0–3 (foundations) | ~21K | Serialisation verify + config (2 scripts, protect-main modify, test) + stub harness (7+ fixtures) + invariant test (RED) |
| Task 4–6 (gate + hardening) | ~25K | Gate script (8 exit codes, API queries, pagination, override) + 10 bats cases + failure-path/worktree hardening (2 bats files) + dogfood integration test |
| Task 7–8 (rewrite + mirrors) | ~31K | Full structural rewrite of 1278-line file (read current + write new) + Tier-2 GREEN + mirrors via `bkit install` + `workflows.md` re-section |
| Task 9–11 (docs + detector + E2E) | ~26K | 6 docs (prose rewrites, not bullets) + Tier-3 detector (new `.ts` + CLI + test) + E2E validation report |
| Full-suite verification + fix loop | ~12K | `pnpm test && pnpm test:bats && pnpm bkit check` + addressing failures |
| **Total** | **~140K** | **Far exceeds ~85K single-session threshold** |

A single agent session would need to hold the design, the gate script, the invariant test, the full 1278-line rewrite, the 4 mirrors, 6 docs, the detector, and the E2E contract simultaneously — while maintaining the RED→GREEN ordering invariant across the Tier-2 test. The rewrite of `bkit-ship.md` alone (~31K with context) approaches a third of the budget; doing it justice alongside 11 other tasks is not realistic.

## Rationale

**SPLIT.** The token estimate (~140K) exceeds the 85K single-session threshold by ~1.6×. Although the task count (12) sits exactly at the ≤12 boundary, the surface area is the deciding factor: this plan touches shell scripts, bats, vitest, a 1278-line structural rewrite, rendered mirrors, 6 documentation files, a new detector module, and consumer-repo E2E. No single session can hold all of this in working memory and produce high-quality work across every surface — especially the gate script (SC 1's primary carrier) and the prose rewrite (the Tier-2 RED→GREEN hinge), which each demand focused attention.

The plan partitions losslessly along clean dependency seams. Each seam is a tested, verifiable artifact that the next sub-plan can treat as a stable input:

<!-- prettier-ignore -->
| Sub-plan | Tasks | Est. tokens | Seams in / out |
| --- | --- | --- | --- |
| **1 — Foundations + Tier-1 Gate** | Task 0, 1, 2, 3, 4 | ~33K | In: none. Out: config keys + stub harness + invariant test RED + tested gate (10 bats cases pass). |
| **2 — Hardening + Prose Rewrite + Mirrors** | Task 5, 6, 7, 8 | ~44K | In: tested gate (Sub-1 Task 4), BOOK_ROOT contract (Sub-1 Task 3). Out: hardened failure path + worktree ownership + structural rewrite (Tier-2 GREEN) + byte-identical mirrors. |
| **3 — Docs + Detector + E2E** | Task 9, 10, 11 | ~26K | In: final workflow shape (Sub-2 Task 7), mirrors (Sub-2 Task 8). Out: 6 docs + Tier-3 detector + E2E validation report. |

**Why 3-way, not 4-way:** Each sub-plan is comfortably under 85K (33K / 44K / 26K), so adding a fourth split would only increase context-reload overhead without quality gain. The 4-task Sub-plan 2 is the heaviest but its tasks form a single coherent unit — harden the current `bkit-ship.md` (Task 5), then rewrite it preserving the hardening (Task 7), then mirror it (Task 8) — which is exactly the kind of sequential same-file work that benefits from staying in one session rather than being split across a context boundary.

**Why not SINGLE:** The RED→GREEN Tier-2 invariant is the plan's central quality mechanism. If the rewrite (Task 7) is attempted in the same session as 11 other tasks, the agent's attention is fragmented across shell scripts, fixtures, docs, and a detector — exactly the conditions under which a half-applied rewrite slips through. Splitting ensures Sub-plan 2's sole focus is the rewrite + its mirrors, with the gate already proven (Sub-plan 1) and the docs/detector/E2E deferred to a fresh session (Sub-plan 3).
