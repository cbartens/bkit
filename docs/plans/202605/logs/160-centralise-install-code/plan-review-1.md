Verdict: CONCERNS
Failures: 1

<!-- verdict:end -->

# Plan Review

Lens: Tightness, scope discipline, design-coverage.

## CRITICAL

### C-1 — Stale `.agents/(templates|scripts)` references inside relocated ENGINE SOURCE (comments + a consumer-facing error message) have no fix task, and the Gate WS-3 regex flags them while no runbook task satisfies it

The plan's path-re-point scope (WS3-T3) and its `Done when` (`rg '"\.agents",\s*"templates"'`) target **only executable `path.join(PKG_ROOT, ".agents", "templates", …)` literals**. The prose-doc grep task (WS6-T3) scopes to `docs/`, `README.md`, `.agents/docs.md`, `.agents/workflows.md`, `.bkitignore`, `.github/workflows/ci.yml` — it does **NOT** include `.bkit/src/**`. So `.agents/(templates|scripts)` references living inside the relocated engine source fall through every assigned task. Verified live hits in `.agents/scripts/` (become `.bkit/src/` post-move), excluding test files and snapshots:

- `bkit-modules.ts:1255` — a **consumer-facing error message** string telling users to "Remove from `.agents/templates/.github/workflows/ci.yml`". Post-move this instructs consumers to edit a path that no longer exists in the tarball. This is load-bearing (ships in the engine, surfaces to consumers) and is the most important of these — it is not cosmetic.
- `bkit-modules.ts:272, 286, 300` — comments describing the template tree (`.agents/templates/.agents/`, `.agents/templates/.prettierignore`).
- `bkit-install.ts:568, 623, 734` — comments describing the payload mirror / strip remap / upgrade walk.
- `bkit-preflight.ts:266` — docstring citing `.agents/templates/.prettierignore`.
- `bkit-lint-no-tier-terms.ts:3, 18` — usage comments (functionally harmless: I verified `SCAN_DIRS = [docs]` only and `SCAN_EXTENSIONS = {.md}`, so the lint never actually scans `.agents/scripts/*.ts` — the comment is already inaccurate today; comment-only, downgrade to cosmetic).

Compounding tension: **Gate WS-3 - Verified** uses the broad regex `rg '\.agents/(scripts|templates)' .bkit/src tsconfig.json vitest.config.ts package.json` qualified as "returns only intended/dest-relative hits." Every comment hit above is in `.bkit/src` and is neither dest-relative nor intended, so a literal reading of the gate makes it **un-passable** unless these source references are fixed — yet no runbook task is assigned to fix them, and WS3-T3's own narrower `Done when` regex (`'"\.agents",\s*"templates"'`) will not even surface them. Either the gate is unsatisfiable as written, or the implementer silently waves it through — both are drift risks.

**Patch:** Add an explicit WS-3 (or WS-6, since it is prose-in-code) task that re-points `.agents/(templates|scripts)` references inside the relocated engine source — prioritising the consumer-facing error message at `bkit-modules.ts:1255` — and align WS3-T3 / Gate WS-3 `Done when` wording so the verification regex and the assigned tasks cover the same set (comments + literals), explicitly carving out the genuinely dest-relative / historic exceptions (e.g. `CORE_TEMPLATE_DIRS`, `.agents/templates/.agents/` describing the dest layout).

## OPTIONAL

### O-1 — Test-file source-comment references not inventoried for WS3-T10

WS3-T10 re-points "embedded `.agents/templates/...` literals" across the test files but does not mention test-file **describe-label strings and comments** that embed the old path (e.g. `bkit-templates.content.test.ts:14,66,176` describe labels; `bkit-modules.integration.test.ts:221,324` comments; `bkit-release-workflow.test.ts:253` describe label). The snapshot regen (WS3-T10) covers `bkit-templates.content.test.ts.snap` describe-label churn, but the in-file describe strings that PRODUCE those labels are the actual source. Tests will still pass with stale describe labels, so this is not a functional break — but it leaves misleading text behind and risks a confusing snapshot diff. Recommend WS3-T10 `Done when` add: "no `.agents/templates` describe-label or comment strings remain in re-pointed test files except dest-layout-describing ones."

### O-2 — WS-7 framing: plan correctly overrides stale input wording (no action needed, noted for the record)

The appended design Workstream table and the WS-7 design section still describe WS-7 as "Optional … deferred open question … Defer/confirm in planning." The BINDING decision D3 supersedes this ("bundle now, managed-block-scoped only"). The plan correctly resolves to in-scope (runbook Phase WS-7 with WS7-T1/WS7-T2, block-only comparison, DE-19 untouched). This is the right call and a good example of honouring the binding decision over the raw design text — flagging only so the orchestrator does not mistake the plan's in-scope treatment for expansion beyond the design.

### O-3 — `COPY_EXCLUDE` `scripts` entry left as "review whether to drop (cosmetic)"

`Architecture & Component Changes` notes `COPY_EXCLUDE` lists `scripts` (no longer under `.agents/` post-move) and says "review whether the `scripts` entry should be dropped (cosmetic)." This is correctly scoped as cosmetic and correctly NOT turned into a behaviour change (dropping it is harmless either way since the dir is gone), but it is not pinned to any `Done when`. Either give it a one-line WS3 sub-task `Done when` ("`COPY_EXCLUDE` reviewed; `scripts` entry retained-or-dropped decision recorded") or move it to Out of Scope to avoid a dangling "review" with no completion criterion.

### O-4 — WS2-T5 baseline `Done when` is the softest in the plan

WS2-T5 ("Capture a pre-move baseline on a consumer that HAS `.agents/templates/`") has `Done when: baseline/ records that a stale consumer's .agents/templates/ exists pre-move (fixture or documented setup for WS-4 upgrade test)`. The "fixture OR documented setup" disjunction is weaker than the other WS-2 `Done when`s (which name a committed artifact file). Since WS4-T4 (the D1 orphan-removal assertion) depends entirely on this fixture existing and being reproducible, recommend tightening to a named committed artifact (e.g. `baseline/stale-consumer-setup.md` or a committed fixture dir) so WS4-T4 has a deterministic input.

## OUT OF SCOPE

### OOS-1 — Engine-source comment-drift lint gate

A standing CI gate that greps relocated engine source (`.bkit/src/**`) for stale `.agents/(templates|scripts)` references (with an allow-list for dest-relative / historic strings) would prevent C-1-class drift from recurring on future relocations. This is adjacent to WS-7's spirit (CI-assert the invariant rather than rely on manual diligence) but is a new gate beyond #160's scope — do not add to this plan; capture as a follow-up if desired.

---

## Design-coverage check (all mapped — no omissions, no expansion)

- **WS-1** (#161, seam + dogfood scaffolding, pre-move) → runbook Phase WS-1 (WS1-T1..T6) + Gate WS-1. Covered: `BKIT_SRC_SUBPATH`, `getTemplatesRoot()`, `isDogfood()`, fail-loud guard, three-context header comment, dogfood-noop integration test in `tsx` context. ✓
- **WS-2** (#162, baseline) → Phase WS-2 (WS2-T1..T5) + Gate WS-2. All four design-mandated artifacts (tarball install, hash-set JSON, recursive tree listing, pack-filelist) plus the D1 stale-consumer fixture. ✓
- **WS-3** (#163, move + re-point + dead-arm) → Phase WS-3 (WS3-T1..T10) + Gate WS-3. `git mv`, seam string flip, 11 `bkit-modules.ts` literals + install/upgrade/uninstall/preflight, dead `runPayload` templates arm deletion, D1 upgrade orphan-removal, tsconfig/vitest/package.json, `NPM_STRIP_REMAP` confirm, test-constant + snapshot regen. ✓ (subject to C-1 on source comments)
- **WS-4** (#164, two-axis verify) → Verification Plan → Manual Verification WS4-T1..T6 + Gate WS-4. Both axes (hashes + recursive `.agents/` tree) for install AND upgrade; pack-filelist removals-only diff; dry-run-parity; D1 orphan-gone assertion. ✓
- **WS-5** (#165, doctor) → Phase WS-5 (WS5-T1). ✓
- **WS-6** (#166, docs/shipped-config, merge-gated) → Phase WS-6 (WS6-T1..T3) + Gate WS-6; Documentation Updates table; `renovate.json5` glob in lockstep. ✓
- **WS-7** (#167, rules.md block-equality gate, bundled per D3) → Phase WS-7 (WS7-T1..T2). Block-only comparison; `### bkit Repo Authoring` excluded; DE-19 untouched. ✓

**Binding decisions:**

- **D1 (drop + auto-clean):** WS3-T5 (active upgrade removal, dry-run aware, no-op when absent) + WS4-T4 (recursive-tree axis asserts orphan GONE after upgrade) + Supersession Inventory D1 row + Breaking Changes WARNING. ✓
- **D2 (dist stays at root):** Out of Scope; tsconfig task keeps `outDir: dist` and `bin` unchanged; Breaking Changes "Explicitly NOT changed (D2)" note; `check:dist` in Gate WS-3 / Automated Tests. ✓
- **D3 (rules.md gate bundled now, block-scoped):** WS-7 promoted to in-scope runbook phase; WS7-T1 compares managed block only and tests that mutating `### bkit Repo Authoring` does NOT fail the gate. ✓

**Dependency ordering (load-bearing):** Runbook is chronological WS-1 → WS-2 → WS-3 → (WS-5) → WS-6 → WS-7, with WS-4 in the Verification Plan after Gate WS-3. The pre-move invariant (WS-1 guards + WS-2 baseline MUST precede any `git mv`) is enforced by Gate WS-1 ("tree STILL at `.agents/`; no relocation yet") and Gate WS-2 ("no `git mv` has run"). The `requires` edges in Pre-Flight (`WS-1,WS-2 → WS-3 → WS-4; WS-1 → WS-5; WS-3 → WS-6 → WS-7`) match the design's WS dependency table exactly. ✓

**Grounding accuracy:** I independently verified the plan's "grounding correction vs design" claims against live source — 11 `bkit-modules.ts` template literals (188, 558, 620, 645, 670, 749, 1348, 1532, 1725, 1831, 1928), `bkit-install.ts:661` (dead-arm `tplDst`) + `736` (upgrade `tplRoot`), `bkit-uninstall.ts:425`, and the design-omitted `bkit-preflight.ts:469,516` — all confirmed present and correctly enumerated. The plan's correction (design said 8, live is 11; preflight call-sites absent from design's list) is accurate.

**Template adherence:** All template-mandated sections present and populated (Context & Goals, Acceptance Scenario with Narrative/Success Criteria/Concrete Example/Edge Cases/Derived Test Matrix, Breaking Changes, Alternatives, Out of Scope, Merge Method, Supersession Inventory, Security & Privacy, Pre-Flight + Gate 1, Data Schema Integration, Architecture & Component Changes, Documentation Updates, Rollback Strategy, Agent Execution Runbook with per-task `Done when`, Gates 2/3/4, Verification Plan, Manual Verification). The repo-specific gates (Gate WS-1..WS-4) are additive and well-formed. Every runbook task carries a terse, codebase-verifiable `Done when` (the softest is WS2-T5 — see O-4). Derived Test Matrix rows each map to a runbook/verification task. Acceptance Scenario and Derived Test Matrix are concrete, not vague.

## Verdict rationale

`CONCERNS` — one CRITICAL (C-1): a real coverage gap where stale path references in relocated engine source (notably a consumer-facing error message at `bkit-modules.ts:1255`) are unassigned, and the Gate WS-3 verification regex is in tension with the narrower task-level `Done when`. This is fixable with one added/expanded task and aligned `Done when` wording; it does not unravel the plan. Design-coverage (all WS-1..WS-7), binding decisions (D1/D2/D3), dependency ordering, grounding accuracy, and template adherence are otherwise tight with no scope expansion beyond the design.
