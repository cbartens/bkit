Verdict: PASS

<!-- verdict:end -->

# Plan Summary

## Overview

Issue #160 centralises bkit's install machinery (engine source `.agents/scripts/` + install payload `.agents/templates/`) into a dedicated `.bkit/` root while preserving bkit's own runtime (workflows, prompts, rules, docs, skills) in `.agents/`. This is a structural refactor, not a behaviour change—the byte-identical guarantee ensures consumers receive unchanged output post-refactor.

The complexity-check split the umbrella plan into **four self-contained, sequentially-dependent child sub-plans** (WS-1+WS-2 → WS-3+WS-5 → WS-4; WS-6+WS-7 merge-gated), totaling **35 execution tasks** losslessly partitioned across the children:

- **Child 1 (plan-v4-1.md):** WS-1 (resolver seam) + WS-2 (baseline capture) — 12 tasks; produces `getTemplatesRoot()`, `isDogfood()`, and pre-move oracle artifacts.
- **Child 2 (plan-v4-2.md):** WS-3 (physical move + re-point) + WS-5 (doctor observability) — 12 tasks; executes the `git mv`, flips the seam, re-targets tooling, implements D1 orphan removal.
- **Child 3 (plan-v4-3.md):** WS-4 (two-axis verification) — 6 tasks; verifies install AND upgrade produce byte-identical output vs baseline on both `.bkit-version` hashes (axis-1) and recursive `.agents/` tree (axis-2), confirms D1 orphan removal.
- **Child 4 (plan-v4-4.md):** WS-6 (docs/prose/shipped-config) + WS-7 (rules.md byte-equality gate) — 5 tasks; updates all user-facing documentation, implements the D3 block-scoped rules.md CI gate, merge-gated with Child 2.

## Plan Quality

**Well-scoped, load-bearing dependencies correct, gates appropriately placed:**

- **Losslessness verified:** 12 + 12 + 6 + 5 = 35 tasks, matching the umbrella's 35 total. No tasks dropped or duplicated across the split.
- **Load-bearing ordering preserved:** Child 1 (seam + baseline) → Child 2 (move) → {Child 3 + Child 4 in either order after Child 2}. The ordering constraint "Child 1 must complete before Child 2's `git mv`" is explicit in Child 2's dependency header and Child 1's Gate WS-2 handoff. The mid-state hazard (self-overwrite of `.agents/` if move runs before seam is green) is mitigated by requiring both Gate WS-1 AND Gate WS-2 committed before Child 2 begins.
- **Byte-identical guarantee preserved:** The split preserves the dual-axis oracle (hashes + recursive tree) by capturing the baseline once in Child 1 (committed, immutable) and diffing against it in Child 3. The oracle is neither fragmented nor orphaned.
- **Merge method enforced:** The parent plan mandates "always squash"; all four children are scoped for a single atomic PR (Child 2 code move + Child 4 docs/gate ship together; Child 1 baseline artifacts and Child 3 verification may be separate commits within the same PR).

**All three binding decisions (D1/D2/D3) carried forward:**

- **D1 (drop + upgrade auto-clean):** Captured in Child 1's baseline, implemented in Child 2 (WS3-T5 upgrade orphan removal), asserted in Child 3 (WS4-T4 end-to-end orphan removal verification).
- **D2 (`dist/` stays at root):** Explicitly respected in Child 2 (WS3-T2 leaves `dist/` arm untouched) and Child 3 verification (no schema migration).
- **D3 (rules.md block-scoped gate):** Deferred from design as optional, now bundled per human decision; implemented as a separate WS-7 task in Child 4 with explicit block-scoped comparison (never whole-file).

## Completeness

**Plan-level scope complete; testing adequate; documentation planned.**

- **Scope:** All 7 workstreams (WS-1 through WS-7) are represented; no workstream is split across multiple children or orphaned.
- **Testing:** Each child includes explicit "Done when" pass/fail criteria for all tasks. The four-child structure places human-confirmation gates (Acceptance Scenario + Breaking Changes) in the root (Child 1), preventing parallel execution divergence. Automated verification tasks (build, tests, byte-identical oracle) are distributed to the children that own the code/baseline.
- **Documentation:** Child 4 explicitly covers all prose updates (setup.md, architecture.md, deployments.md, knowledge.md, rules.md, etc.) and marks them merge-gated with the move. A new decisions.md entry (DE-\*) is planned for the WS-7 gate.
- **Dogfood integration:** Child 1 and Child 2 both include explicit dogfood tests (zero-write-noop integration test for `isDogfood()` pre-move, re-verified post-move); Child 3 re-verifies the dry-run-parity test post-move.

## Acceptance Scenario

**Acceptance Scenario spec (from design) is properly inherited and expanded in the root sub-plan (Child 1).** The Narrative (unchanged from design) and Success Criteria (unchanged) are confirmed as testable. The Concrete Example is expanded with 5 execution steps that map to child tasks:

1. Step 1 (pack file-list diff): Child 3, WS4-T5.
2. Step 2 (fresh install): Child 3, WS4-T1 (hashes) + WS4-T2 (tree).
3. Step 3 (upgrade from stale consumer): Child 3, WS4-T3 (hashes) + WS4-T4 (tree + D1 orphan).
4. Step 4 (dogfood no-op): Child 1, WS1-T6.
5. Step 5 (doctor observability): Child 2, WS5-T1.

The Edge Cases table (8 rows) maps each scenario to the child task/gate that asserts it. All are covered.

**Two human-confirmation checkboxes (Acceptance Scenario + Breaking Changes) are present in Child 1 and correctly left unchecked.** The protocol correctly notes these are expected in pre-review state and do NOT downgrade the verdict; they are explicit gates that will be checked by the human reviewer before any child executes.

## Design Alignment

**Plan's Acceptance Scenario narrative and success criteria match design verbatim; plan scope ⊆ design scope.**

- **Narrative:** "A bkit maintainer opens the repo and finds all install machinery and payload under one obvious `.bkit/` root, while the repo's own `.agents/` looks exactly like an installed consumer's." ✓ Identical.
- **Success Criteria:** Five criteria from design are carried forward unchanged (source locations, byte-identical oracle, dogfood, `dist/` unchanged, no schema migration). ✓ Identical.
- **Scope:** The design's 7 workstreams (WS-1 through WS-7) map 1:1 to tasks across the four children. No scope creep (e.g., relocating `dist/` to `.bkit/dist/` is correctly out of scope per D2). The design's explicit constraints (fail-loud guard, three-context `getPkgRoot()`, managed-block-scoped rules.md gate, D1 orphan removal) appear as explicit tasks in the appropriate children.

## Risks

**Residual risks and mitigations:**

1. **Dual run-context divergence (highest-leverage):** A change could pass CI (builds `dist/`) but break `tsx`-from-source dev/test because `getPkgRoot()` has two arms. _Mitigation:_ Child 1, WS1-T7 explicitly authors the `bkit-paths.test.ts` unit test with three named assertions (dist, tsx-from-source, packed-tarball), each asserting the correct arm; the dist arm is asserted explicitly (not only via `check:dist`).

2. **Vitest glob re-target miss → green-but-empty discovery:** If `vitest.config.ts` globs are not re-targeted from `.agents/scripts/**` to `.bkit/src/**`, vitest discovers zero tests and CI passes green-but-empty, never running the byte-identical oracle. _Mitigation:_ Child 2, WS3-T7 explicitly re-targets both globs; Child 3, Gate WS-4 includes an automated check "Test discovery reports NON-ZERO test count from `.bkit/src/**`" to guard against this.

3. **Missed source-path literal → silent template skip:** A stale `.agents/templates/` reference not updated to `getTemplatesRoot()` resolves to a non-existent dir and silently skips. _Mitigation:_ Child 1, WS1-T5 implements the fail-loud guard (hard-exit instead of silent skip); Child 3, WS4-T5 asserts via `npm pack --dry-run` that only `.agents/scripts/**` and `.agents/templates/**` are removed (no unexpected `.agents/templates/` orphan in the tarball); source-grep post-move (Child 2, WS3-T3 + Gate WS-3) confirms all literals re-pointed.

4. **`files[]` + tarball sync — `.agents/` runtime reads missing:** Dropping `.agents/` wholesale from `files[]` would break `loadTrackers` (hard-throw on missing `trackers.md`) and lose the `copyAdditive` payload. _Mitigation:_ Child 2, WS3-T8 explicitly KEEPS `.agents` in `files[]` (only test/snapshot exclusions re-targeted under `.bkit/src`); Child 3, WS4-T5 verifies tarball content via `npm pack --dry-run` that all `.agents/` runtime reads still ship (trackers.md, IDEs.md, cloud.md, prompts.md, workflows.md, skills/\*_, workflows/bkit-_.md, prompts/bkit-\*.md).

5. **D1 orphan removal incomplete or asymmetric:** Upgrade removes `.agents/templates/` but install never writes it (or vice versa). _Mitigation:_ Child 3, WS4-T2 asserts fresh install never receives `.agents/templates/`; WS4-T4 asserts upgrade actively removes it on a consumer that had it pre-move (using the deterministic stale-consumer construction from Child 1, WS2-T5).

6. **Rules.md gate scope creep — whole file compared instead of block:** The WS-7 gate is incorrectly implemented as a whole-file byte-check, tripping on the `### bkit Repo Authoring` section (bkit-repo-only, never ships). _Mitigation:_ Child 4, WS7-T1 explicitly tests the MANAGED-BLOCK-ONLY comparison (marked as "Done when: deliberately mutating the managed block makes it fail; mutating the `### bkit Repo Authoring` section does NOT fail it").

7. **Renovate `ignorePaths` edit perturbs the hash-set gate:** The WS-6 source template edit to `renovate.json5` changes the default-flow hashed set, failing Child 3's WS4-T1/WS4-T3 empty-diff gate. _Mitigation:_ Documented flag-parity invariant: baseline and verify use identical (default, non-`--renovate`) flags; the `renovate.json5` source edit is opt-in and absent from the default-flow `ws.writes`, so it never enters the hashed set. If `--renovate` is exercised, the ONLY permitted delta is the intended `ignorePaths: [".bkit/templates/**"]`.

8. **Untracked human-confirmation gates on Child 1:** The two checkboxes (Acceptance Scenario + Breaking Changes) gate the entire workstream but are unchecked in a pre-review plan. _Mitigation:_ This is an expected pre-review state and does NOT downgrade the verdict per the contract. The checkboxes are explicit and will be checked by the human reviewer before any child executes.

## Action Items

None. The plan is complete and ready for build-phase execution.

All 35 tasks are accounted for, losslessly partitioned across four self-contained sub-plans with correct load-bearing dependency ordering. The byte-identical guarantee and all three binding decisions (D1/D2/D3) are carried forward and explicitly mapped to verification tasks. Human-confirmation gates are in place and correctly left unchecked for the human reviewer. Residual risks are identified with layered mitigations.
