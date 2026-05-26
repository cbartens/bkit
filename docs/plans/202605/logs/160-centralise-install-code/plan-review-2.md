Verdict: PASS
Failures: 0

<!-- verdict:end -->

# Plan Review

Lens: Dependency correctness, design-coverage.

## CRITICAL

None. No fabricated dependency edges, no missing prerequisites, no ordering inversions, no cycles, and every design-implied dependency is reflected as a task/workstream dependency. The load-bearing ordering the lens flags as decisive is correctly encoded.

**Dependency graph (declared, from Pre-Flight line 198 + per-WS `requires`):**

```
WS-1 (—)   WS-2 (—)
  |  \        |
  |   \       |
  v    \      v
WS-5   WS-3 <-+        (WS-3 requires WS-1, WS-2)
       |  \
       |   \
       v    v
     WS-6   WS-4        (WS-4 requires WS-2, WS-3; WS-6 requires WS-3)
       |
       v
     WS-7               (WS-7 requires WS-6)
```

Acyclic. Matches the design Step-9 table (#161–#167) edge-for-edge. Each declared edge is artefact-consuming (verified below), not fabricated.

**Edge verification (B consumes A's artefact):**

- **WS-1 → WS-3:** WS-1 produces the seam (`getTemplatesRoot()`, `isDogfood()`, `BKIT_SRC_SUBPATH`, consolidated `runPayload` PKG_ROOT, fail-loud guard, dogfood integration test). WS-3 consumes all of them — WS3-T2 flips `BKIT_SRC_SUBPATH` (created in WS1-T1), WS3-T3 replaces literals with `getTemplatesRoot()` (created in WS1-T2), WS3-T4 deletes the now-dead templates arm that WS1-T4 already decoupled. Real consumption; not fabricated. The lens-flagged invariant (WS-1 guards MUST precede WS-3 move or the move self-overwrites live `.agents/`) is correctly enforced by this edge AND restated in the runbook preamble (line 336) and Gate WS-1 (line 363, "tree STILL at `.agents/`; no file relocation").
- **WS-2 → WS-3:** WS-2 produces the four baseline artefacts under `baseline/`. WS-3 does not literally read them, but the edge is correct for the load-bearing reason the design states: the baseline is uncapturable once files relocate. The plan enforces this as a hard ordering via Gate WS-2 (line 380, "no `git mv` has run") — i.e. WS-2 must finish before WS-3's first task (WS3-T1 `git mv`). The lens-flagged "WS-2 MUST precede any relocation or the oracle has nothing to compare against" is satisfied.
- **WS-2 → WS-4 and WS-3 → WS-4:** WS-4 consumes both. WS4-T1/T3 diff against `baseline/bkit-version-hashes.json` (WS2-T2); WS4-T2/T4 against `baseline/agents-tree.txt` (WS2-T3); WS4-T5 against `baseline/pack-filelist.txt` (WS2-T4); WS4-T4's orphan assertion against the WS2-T5 stale-consumer fixture; and all of WS-4 runs against the post-move tree WS-3 produces (including the WS3-T5 D1 orphan-removal and the WS3-T3 `tplRoot` re-point that the upgrade engine walks). Two-axis × two-engine consumption is fully wired. No artefact consumed before it is produced.
- **WS-1 → WS-5:** WS5-T1 prints `getTemplatesRoot()` (WS1-T2). Reads only the seam, not the physical move — edge correctly minimal (matches design rationale "depends only on the seam, not the move").
- **WS-3 → WS-6:** WS-6 re-points prose to the post-move tree shape WS-3 establishes (`.bkit/src`, `.bkit/templates`). Correct — docs describe the relocated paths, so they depend on the relocation being the agreed target.
- **WS-6 → WS-7:** WS7-T1 asserts `.agents/rules.md` managed block byte-equals `.bkit/templates/.agents/rules.md` — the latter path and the re-pointed sync rule are established by WS6-T1. Correct consumption.

**Ordering inversions: none.** Runbook phase order is WS-1, WS-2, WS-3, WS-5, WS-6, WS-7, with WS-4 placed in the Verification Plan (Manual Verification). This is a valid topological order: WS-5 (requires WS-1) is placed after WS-3 but WS-1 precedes it, so no task reads an artefact produced later. WS-4 after all phases satisfies its WS-2+WS-3 deps. No task's `Done when` asserts against an artefact from a later task. WS3-T5's "covered by WS-4 upgrade assertion" is a verification forward-reference (WS-3 produces the orphan-removal code; WS-4 verifies it), not an artefact inversion.

**Dual run-context + dogfood src==dst sequencing: correct.** The design's crux (consolidate `runPayload`'s second inline PKG_ROOT copy into `getPkgRoot()` BEFORE any string flip, else `tsx`-from-`.bkit/src` resolves one level too shallow) is sequenced as WS1-T4 (consolidate, pre-move) strictly before WS3-T2 (flip `BKIT_SRC_SUBPATH`). The `isDogfood()` defence-in-depth + zero-write integration test (WS1-T6) lands and is proven green pre-move (Gate WS-1), so the vulnerable mid-state (templates moved, guards absent) never exists. The three-context `getPkgRoot()` enumeration is WS1-T3; the `tsx`-context (not `dist/`-only) constraint is explicit in WS1-T6 and the WS3-T2 `Done when` ("`getPkgRoot()` resolves correctly under `tsx`-from-`.bkit/src`"). `check:dist` covers the `dist/` arm at every gate.

**Design-coverage: complete.** Every workstream WS-1..WS-7 maps to a runbook phase; every binding decision maps to tasks:

- **D1 (drop + auto-clean):** WS3-T5 (upgrade orphan-removal, dry-run aware, no-op when absent) + WS4-T2 (fresh install never receives it) + WS4-T4 (orphan GONE after upgrade on a consumer that HAD it) + WS2-T5 (stale-consumer baseline fixture so WS4-T4 has something to assert against). The full D1 chain is present, including the often-missed baseline-fixture prerequisite.
- **D2 (`dist/` stays at root):** Enforced as a non-task constraint across WS3-T6 (`outDir: dist` unchanged, `bin` unchanged), Gate WS-3 (`check:dist` green), Success Criteria, and Out of Scope. No task violates it.
- **D3 (WS-7 bundled, managed-block-only):** WS7-T1 compares the `bkit:start`→`bkit:end` block ONLY with an explicit negative assertion ("mutating the `### bkit Repo Authoring` section does NOT fail it") + WS7-T2 records the block-scoped decision. The edge case row (line 83) and Breaking-Changes note (line 135) reinforce it.
- **Design's grounding correction** (`bkit-preflight.ts:469,516` absent from the design's WS-3 literal list) is captured: the Architecture section (line 225) flags it and WS3-T3 explicitly includes `bkit-preflight.ts` (469, 516). This is a coverage IMPROVEMENT over the design, correctly folded in.
- **Every Derived Test Matrix row maps to a task** (dogfood no-op→WS1-T6; fail-loud guard→WS1-T5; getPkgRoot 3-context→WS3-T2/WS1-T3; install/upgrade two-axis→WS4-T1..T4; dry-run-parity→WS4-T6; pack-filelist→WS4-T5; doctor→WS5-T1; snapshot→WS3-T10; WS-7 block equality→WS7-T1).

**Template adherence:** Structure follows `docs/plans/template.md` (Context & Goals, dual HUMAN-REVIEW sections, Alternatives, Out of Scope, Merge Method, Supersession Inventory, Security, Pre-Flight + Gate 1, Data Schema Integration, Architecture & Component Changes, Documentation Updates, Rollback, Agent Execution Runbook with Gates 2/3, Verification Plan with Gate 4). Every runbook task carries a `**Done when:**` line (template hard requirement) — verified across WS1-T1..WS7-T2 and WS4-T1..T6. Supersession `DELETE` rows are mirrored in Architecture & Component Changes and as runbook removal tasks (templates arm→WS3-T4; literals→WS3-T3; `git mv`→WS3-T1). Merge Method correctly declares squash + atomic move+docs+verify PR (matches WS-6 merge-gating).

## OPTIONAL

- **WS-5 runbook placement vs declared dep.** WS-5 declares `requires WS-1` only, but the runbook places Phase WS-5 after Gate WS-3 (line 409). This is dependency-correct (WS-1 precedes it) and the phase header notes "lands within the same PR." No change required, but a one-line note that WS-5 _could_ execute immediately after WS-1 (it never touches the relocated paths) would make the minimal-dependency intent explicit to an executor who reads phases strictly top-to-bottom.
- **WS3-T5 ↔ WS4-T4 cross-reference direction.** WS3-T5's `Done when` ("covered by WS-4 upgrade assertion") points forward to a task in a later section. This is correct (code-produces / verify-consumes) but slightly muddies step-isolation: an executor completing WS3-T5 cannot fully self-verify within WS-3. Consider adding a WS-3-local smoke assertion (e.g. a unit/integration check that upgrade removes a seeded `.agents/templates/` dir) so WS3-T5 is independently verifiable before the WS-4 gate, with WS4-T4 remaining the baseline-diff confirmation.
- **WS2-T5 artefact format is softer than T1–T4.** WS2-T1..T4 each commit a concrete file under `baseline/`; WS2-T5's `Done when` allows "fixture OR documented setup." Pinning it to a committed fixture/script (as the other four are) would remove ambiguity about what WS4-T4 consumes.

## OUT OF SCOPE

- **Sub-plan split.** The plan-input notes the complexity-check/split steps "will partition it into self-contained sub-plans if it exceeds a single execution session." This umbrella plan declares full coverage of WS-1..WS-7; if a later `bkit-plan-complexity-split` carves sub-plans, each sub-plan's declared coverage scope must preserve these same inter-WS edges (notably WS-1/WS-2 → WS-3 and the WS-2 baseline → WS-4 oracle). Out of remit for this review; flagged so the split step does not drop a cross-sub-plan edge.
- **A standing CI assertion that `BKIT_SRC_SUBPATH` matches `tsconfig` `rootDir`** (beyond the unit test) would close the design's named "cannot drift from rootDir" intent permanently. The design derives the suffix from a shared constant (sufficient for this release); a config-vs-constant equality test is a future hardening, not in this plan's scope.
