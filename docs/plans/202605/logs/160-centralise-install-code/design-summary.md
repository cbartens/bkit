Verdict: PASS

<!-- verdict:end -->

# Design Summary

## Overview

Issue #160 proposes to centralise bkit's install machinery (engine source + templates) from scattered locations in `.agents/` into a dedicated `.bkit/` root directory, while preserving bkit's own runtime content (workflows, prompts, rules, docs, skills) in `.agents/` to maintain the dogfooding invariant. The design is a **structural refactor, not a behaviour change**—the byte-identical guarantee ensures all consumer-facing output remains unchanged post-refactor. The refactor introduces a single resolver seam (`getTemplatesRoot()`) to eliminate ~17 scattered path literals, consolidates duplicate PKG_ROOT derivation logic into one `getPkgRoot()` function, and makes the dogfood no-op explicit via an `isDogfood()` predicate. Four workstreams build the solution in strict order: resolver consolidation + dogfood guards (WS-1, pre-move), baseline capture (WS-2), physical relocation + re-pointing (WS-3), and two-axis verification (WS-4, install AND upgrade). Two additional workstreams add observability (WS-5) and update prose/authoring rules (WS-6, merge-gated).

## Design Quality

The design is exceptionally well-reasoned with rigorous trade-off analysis. Strengths include:

- **Clear line-drawing (Lens 3):** The decision to move only install source (engine + templates) while keeping bkit's own runtime in `.agents/` is well-justified, preserving byte-identical self-install and the mental model "bkit's `.agents/` == a consumer's `.agents/`."
- **Dependency ordering is load-bearing:** The design correctly identifies that WS-1 (guards + seam) MUST precede WS-3 (physical move) to avoid mid-state self-overwrite, and that WS-2 (baseline capture) must occur before any relocation. This sequencing is explicitly mandated, not optional.
- **Dual-axis verification oracle:** The design moves beyond hashes alone to include a recursive consumer-tree diff, catching untracked `copyAdditive` payload the hash set omits—a strong mitigation for the highest-risk failure mode.
- **Fail-loud guards:** The proposal to replace silent `if (!fs.existsSync) return;` skips with hard `process.exit(1)` on missing templates-root is a net-zero-effort, high-leverage safety improvement.
- **Comprehensive trade-off inventory:** The Decisions table explicitly documents why big-bang is chosen over staged migration, why `.bkit/` does NOT absorb `dist/`, why no schema migration is needed, and why the full `.agents/` runtime is shipped (not dropped).
- **Acknowledged standing cost:** The manual `.agents/rules.md ↔ .bkit/templates/.agents/rules.md` two-way sync is identified as a fragile but accepted limitation, with a deferred open question (WS-7) to retire it via CI assertion.

Gaps or areas requiring planning-phase drill-down:

- **`files[]` + tarball-content verification gate phrasing is correct but operationally terse.** The design says "confirm `.bkit/templates/gitignore` actually ships" but does not spell out the exact `npm pack --dry-run` diff command or the baseline artifact format (e.g., captured as a `.json` file for CI comparison). Planning will need to operationalize this gate.
- **Snapshot regeneration is correctly identified as cosmetic but is listed only once.** The design mentions `bkit-templates.content.test.ts.snap` but the Risk section lists "Test path-constant churn across 12+ test files"—the scope of snapshot updates across all affected test files could be spelled out more explicitly (though the actual work is straightforward).
- **The "three run-contexts" in `getPkgRoot()` are well-documented in the design but the actual header comment block deliverable (WS-1) is not shown.** This is acceptable as design-level spec; implementation will need to enumerate the three arms concretely.

## Acceptance Scenario

The Acceptance Scenario is well-formed and testable:

- **Narrative:** Clear and user-POV ("A bkit maintainer opens the repo and finds all install machinery..."), with explicit byte-identical assertion for consumers across upgrades.
- **Success Criteria:** Five concrete, measurable bullets covering the install engine relocation, byte-identical `.agents/` tree matching, dogfood no-op preservation, build artefact location (unchanged), and schema stability.
- **Key Edge Cases:** Eight scenarios identified—dogfood self-overwrite, dual run-context divergence, silently-skipped templates, dotfile strip remap, in-flight upgrade consumer, etc. Each is concrete and design-shaping.
- **Verification:** The design explicitly specifies a **two-axis oracle** (hashes + recursive consumer-tree) and mandates verification on a **packed tarball** (not source tree), capturing pre-refactor baseline before any move. This is a strong, operationalizable spec.
- **Aligns with `docs/plans/template.md` spec:** The Narrative and Success Criteria are testable outcomes (not implementation steps), the Key Edge Cases are design-shaping, and the acceptance scenario is detailed enough to gate the design as ready for planning.

**No CONCERNS on Acceptance Scenario.** It is well-specified, verifiable, and aligned with template requirements.

## Feasibility

**Spike reference:** The design-v3-organised.md contains no separate "spike" artifact, but the design itself is grounded in:

1. **Factual verification of the tree structure:** The design correctly identifies that `.agents/templates/.agents/` contains only rules/docs/friction/skills/env copies (NOT workflows/prompts), verified by the author against the live codebase.
2. **Identification of dual PKG_ROOT derivation:** The design correctly spots that `runPayload()` has an inline suffix walk independent of `getPkgRoot()`, a correctness-critical observation. This is verified against `bkit-install.ts:627-630` in the design.
3. **Precise source-path audit:** The design lists ~17 call-sites building `path.join(PKG_ROOT, ".agents", "templates", …)` (8 in bkit-modules.ts, 2 in bkit-install.ts, plus upgrade/uninstall/integration-test), demonstrating detailed codebase familiarity.
4. **Hard-reads/hard-throws inventory:** The design documents engine dependencies on `trackers.md`, `prompts.md`, and `copyAdditive` payload, verified against line numbers in the source.
5. **Build-time constants audit:** The design identifies vitest.config.ts hardcoding `.agents/scripts/` glob and the NPM_STRIP_REMAP logic, preventing a silent CI-green-but-tests-empty failure mode.

**Feasibility is high.** The design demonstrates concrete, line-numbered understanding of the codebase and the risks. The sequencing (WS-1 pre-move, WS-2 baseline, WS-3 move, WS-4 verify) is sound. No technical blockers identified.

## Synthesis Coverage

The design explicitly documents three brainstorm lenses and their resolution:

- **Lens 1 (source relocation + seam):** Kept. Provides the single resolver seam.
- **Lens 2 (verification rigor):** Merged. The two-axis oracle and dry-run-parity gate are additive and are woven into the kept approach.
- **Lens 3 (the install-source vs. runtime line):** Kept. Establishes the `.bkit/` (source) vs. `.agents/` (runtime) boundary.

The Approaches table documents **eight alternatives considered:**

1. **Source-relocation + single resolver seam (KEPT):** The core design.
2. **Layer Lens 2's verification (MERGED):** Verification rigor added to the kept approach.
3. **Two-release staged migration (REJECTED):** Dual-tree-divergence risk outweighs the staged safety net; the hash oracle replaces the need for a release window.
4. **Full mirror (REJECTED):** Breaks workflows/prompts `src === dst` no-op; threatens byte-identical guarantee.
5. **Engine-only lift (REJECTED):** Incomplete refactor; `.agents/templates/` cross-agent files stay misplaced.
6. **Big-bang incl. `dist/`→`.bkit/dist/` (REJECTED):** Orthogonal churn; inlined literals repeat the problem next relocation.
7. **Build-time payload staging (REJECTED):** Keeps mislocation alive; permanent dual-location fallback fork.
8. **Symlink bridge (REJECTED):** Cosmetic; platform-fragile; adds a fourth alias.

**Coverage is thorough.** No significant brainstorm option was dropped without explicit rationale. The design merges the best reasoning from each lens rather than cherry-picking one.

## Risks

The design identifies and layers mitigations on **seven major risk clusters:**

1. **Byte-identical oracle blind spot:** `canonicalHashes`/`tier3Hashes` don't track `copyAdditive` payload. Mitigation: two-axis verification (hashes + recursive tree) on packed tarball. **CRITICAL.**
2. **Dual run-context resolution (highest-leverage failure):** A move can pass CI (dist builds) but break dev (tsx from source). Mitigation: three-arm `getPkgRoot()` constant-derived suffix, dogfood integration test in `tsx` context (not `dist/`-only), header comment enumerating all three arms. **Explicit mitigation layers.**
3. **`files[]` + tarball-content sync:** Dropped `.agents/` or missed `.bkit/templates/gitignore` → silent consumer drift. Mitigation: verify packed tarball contents via `npm pack --dry-run`; confirm runtime reads/copies still ship. **Operationalized gate.**
4. **Missed/mis-resolved source path → silent template skip:** ~17 scattered literals risk incomplete find-replace. Mitigation: single `getTemplatesRoot()` seam; fail-loud "templates root not found" guard (hard `process.exit(1)` instead of silent skip). **Strong.**
5. **Snapshot key regeneration:** Cosmetic; regenerate via `--update-snapshots`. **Low severity.**
6. **`vitest.config.ts` glob re-targeting:** If missed, tests discover zero tests post-move → CI passes green-but-empty. Mitigation: identified as CRITICAL tooling change; listed as required. **Explicit.**
7. **Prose doc-drift:** Setup commands, rules, architecture diagrams reference old paths. Mitigation: merge-gated WS-6 (atomically with move, not follow-up); inventory as explicit scope. **Gated.**

**Risk mitigation is comprehensive and multi-layered.** The design does not rely on a single gate; each risk has depth-of-defense.

## Scope

The design carefully delimits scope:

- **In scope:** Install source relocation (engine + templates) + resolver seam + dogfood guards + byte-identical verification + prose/authoring-rule updates + observability (doctor).
- **Out of scope:** `.bkit/dist/` relocation (orthogonal to centralisation; deferred to future); `.bkit-version` schema migration (not needed); per-refactor bug fixes orthogonal to the move; optional WS-7 (CI byte-equality assertion for `rules.md` sync, deferred/to-be-confirmed in planning).

**Scope is well-bounded and internally consistent.** The design acknowledges future possibilities without over-committing.

## Action Items

**No critical action items pre-planning.** The design is sufficiently detailed to enter planning. However, planners should note:

1. **WS-1 deliverable clarification:** The "header comment block enumerating the three `getPkgRoot()` run-contexts" (WS-1 scope) should be written out explicitly during plan write-up, not left as "describe the runs." This is a low-effort, high-bus-factor artifact.
2. **WS-2 baseline operationalisation:** Planning should define the exact format for capturing and storing the pre-refactor baseline (e.g., `.json` checksums + serialised tree listing, stored in a `docs/plans/202605/logs/160-centralise-install-code/baseline/` directory for CI comparison). The design concept is sound; the operationalisation is planning-level detail.
3. **WS-4 gate automation:** Define the exact `npm pack --dry-run` diff command and the tree-diff tool/format (e.g., `find -type f -printf...` serialised to a file). This is straightforward but needs explicit recipe in the plan.
4. **WS-6 prose inventory:** The design mentions "grep `\.agents/(templates|scripts)` across `docs/`, `README.md`, `.agents/docs.md`, `.agents/workflows.md`, `.bkitignore`, `.github/workflows/ci.yml:82`" but doesn't show the actual grep hits. Planning can surface the exact file/line count and flag any missed paths early.
5. **Snapshot regen scope:** Clarify which test files produce snapshots and how many snapshots will be regenerated in WS-3 (the design mentions `bkit-templates.content.test.ts.snap` but the Risk section implies broader churn). This is not a blocker—just clarity for planning.
6. **Dogfood integration test location:** The design mandates "a zero-write in-repo dogfood integration test asserting `bkit install` writes nothing to `.agents/` when `isDogfood()`" in WS-1. Planning should decide the test file name and location (e.g., `bkit-modules.integration.test.ts` or a new dedicated file) upfront to avoid mid-stream relocation.

**All action items are planning-level details, not design concerns.**

---

## Verdict Justification

The design merits **PASS** because:

1. **Acceptance Scenario is well-specified, testable, and aligns with `docs/plans/template.md` § Acceptance Scenario → Spec.** No Narrative/Success Criteria violations or vagueness.
2. **Synthesis is thorough—eight approaches considered, with explicit keep/reject/merge decisions and rationale.** No significant options dropped without justification.
3. **Trade-offs are transparent and accepted.** The design acknowledges the standing cost of the manual `rules.md` sync and offers a deferred open question (WS-7) to retire it.
4. **Feasibility is high.** The design demonstrates concrete codebase understanding (line-numbered citations, dual PKG_ROOT derivation identified, hard-reads/hard-throws inventory). Sequencing is sound and load-bearing. No technical blockers.
5. **Risks are identified and layered with depth-of-defense.** Multi-axis verification (hash + tree), fail-loud guards, constant-derived suffixes, integration tests in all run-contexts. Single points of failure are rare.
6. **Scope is well-bounded and internally consistent.** Future possibilities are acknowledged without over-committing. WS-6 (prose updates) is correctly classified as merge-gated, not deferred.
7. **No human-confirmation gates are unchecked.** The design does not require design-phase sign-off (unlike planning, which will need human review on Acceptance Scenario and Breaking Changes). The content-level technical soundness is evident from the design text itself.

The design is ready to enter planning with no revisions required.
