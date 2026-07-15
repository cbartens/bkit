Verdict: PASS

<!-- verdict:end -->

# Plan Summary — #342 Prompt-injection Hardening

## Overview

#342 establishes a universal, prose-based hardening contract against prompt injection via attacker-controlled content (issue/PR/comment/diff/log text). The design specifies two canonical, intentionally-distinct strings — one for `.agents/rules.md` doctrine, one for 54 header bullets (46 prompts + 8 workflows) — both anchored on a shared threat-model section in `docs/security.md`. A glob-based enforcement gate (source-only, dynamic enumeration) makes new prompts/workflows covered-or-failing by construction, eliminating classification drift.

**Plan splits into two sequential, same-branch, same-PR sub-plans** (20 tasks, 4 gates, 7 workstreams):

- **Sub-plan 1 (Segment A):** WS-1 → WS-4 (docs anchor, rules.md invariant, all 54 source file edits) — 10 tasks, Gate 1, no PR opened.
- **Sub-plan 2 (Segment B):** WS-5 → WS-7 (doctrine reversal, enforcement gate, mirror regen, verification, Gates 2-4, Manual Verification) — 10 tasks, opens the single squash PR after completion.

The split respects the plan's own hard sequencing boundary (WS-6 cannot land before WS-3 + WS-4) and the "green at every commit boundary" invariant.

## Plan Quality

**Well-reasoned and battle-tested.** Verdict trail: Design PASS → Plan CONCERNS (9 CRITICAL, all addressed) → Scope CONCERNS (7 CRITICAL, all addressed) → Complexity SPLIT (110-130K tokens vs 85K cap, appropriately halved) → Split PASS. The split decision is sound: partitions at the plan's own declared hard sequencing boundary, maintains the single-PR invariant, and reduces each sub-plan to ≈80-82K tokens.

**Defect class caught and fixed:** A recurring issue was `Done when` commands that were unrunnable or vacuously green as initially written (hardcoded counts that could never return those values, commands with no file operands, diffs against the index that empty out after staging). Reviewers/auditors caught these by running the commands. Later update passes found two more. The final version carries only executable, re-derivable assertions.

**Authoring-rule constraints integrated.** The brief explicitly required prompt/workflow changes follow the `.agents/rules.md` authoring rules (ASCII operators, placement conventions, no Unicode glyphs, etc.). Both sub-plans cite and satisfy these constraints — a load-bearing integrity check against silent text corruption.

## Completeness

**All 54 source files (46 prompts + 8 workflows) are in scope.** Coverage is mechanical and git-diff-reviewable: add string B (one line per file) after the existing `> - **No commits:**` anchor in prompts; add it after `> - **Git:**` (phase workflows) or as the last line of the CAUTION block (worktree workflows) to stay outside the tracker marker region.

**Enforcement gate is robust.** The new test glob-enumerates dynamically (no hardcoded file array), strips fenced blocks, normalizes whitespace, and asserts three load-bearing clauses (ingest, act, flag) as named constants. It includes a glob-scoped deny of the stale variant (not repo-wide, so it never self-matches mirrors or logs). Six sub-tasks with negative controls (temporarily insert stale text, verify fail, restore) prove the gate is not theatre.

**Testing adequate.** 8-row Derived Test Matrix: rows 1-2 extend the existing `bkit-rules-sync.test.ts`; rows 3-8 (all Unit-tier, Vitest) live in the new `bkit-untrusted-input-coverage.test.ts`. Gate 3 verifies all 8. Integration check (T7.2) confirms cross-provider parity and rendered mirrors stay parseable after `bkit install`.

**Docs planned across both segments.** Sub-plan 1: `docs/security.md` threat-model section (ingest → broad token → act), `.agents/docs.md` scope-cell extension, `.bkit/workflows.md` invariants row, `.agents/rules.md` invariant. Sub-plan 2: `.bkit/prompts.md` doctrine row rewrite (universal coverage, recorded reversal of "scoped, NOT blanket"), `docs/testing.md` test-file row, deferral ledger verification (5 rows appended by design + plan phases).

**Manual Verification added.** 5-step verification block in Sub-plan 2 (after all gates): consumer pointer resolution test, threat-model coverage, no tracker refs in shipped surface, secrets/perms untouched, and a live dogfood install to a scratch consumer directory proving the tool chains work end-to-end.

## Acceptance Scenario

**Narrative:** As a bkit maintainer (and downstream consumer), when I add or edit an agent prompt or workflow header, CI tells me immediately if it is missing the untrusted-content guard — so I cannot silently ship a prompt that treats attacker-controlled content as instructions. Every surface where an agent might touch external content reads the same guard, and the "why" lives in one place I can point a reviewer to.

**Success Criteria (all 6 proven complete across both sub-plans):**

1. All 46 leaf prompts + all 8 workflow headers carry the upgraded bullet (up from 9/46 + 0/8); no file retains the weaker pre-upgrade variant.
2. `rules.md` Security & Data carries string A and stays byte-synced to `.bkit/templates/.agents/rules.md` (existing `bkit-rules-sync` gate green).
3. One enforcement test turns CI red when any globbed `.bkit/prompts/*.md` or `.bkit/workflows/*.md` file lacks the three clauses or retains the stale variant (glob-scoped, not repo-wide).
4. `docs/security.md` documents the lethal-trifecta threat model and explains why per-prompt coverage is load-bearing (leaves never read `rules.md`).
5. A newly added prompt or workflow is covered-or-failing by construction — no allowlist/registry to maintain.
6. `.bkit/prompts.md` doctrine row describes universal coverage (not the old "9 agents, scoped NOT blanket" selection rule) and no longer leaves the stale bullet as bare prose.

**Adherence to template:** The Acceptance Scenario is inherited verbatim from the design phase (narrative + success criteria); the Concrete Example shows setup/steps/outcome with all three check scenarios; the Derived Test Matrix is comprehensive (8 rows, tiers assigned per `docs/testing.md`); Edge Cases table covers 14 scenarios (design + plan expansions). ✅ Adherent.

## Breaking Changes

**Five items require explicit human sign-off** (items 1-3 and 5 are consumer-visible; item 4 is a repo-local gate-config opt-out):

1. **Every consumer's rendered prompts change on next `bkit upgrade`.** String B lands in all 46 prompts + 8 workflows; all `.claude`/`.cursor`/`.opencode` mirrors re-render. Additive only (one bullet per CAUTION block), no tool/permission change — but it is a 54-file diff reaching every consumer and adds a small per-run token cost to every agent invocation. _(Design accepted this explicitly: universal coverage retires classification debt.)_

2. **`docs/security.md` gains a section INSIDE its bkit-managed block — ships to consumers.** The design's precedent sits **below** `bkit:end` (bkit-repo-only). Since string A ships to consumers and points at `docs/security.md`, the section must go **inside** the managed block of both `docs/security.md` and `.bkit/templates/docs/security.md` — otherwise consumers get a dangling pointer. **This is a DEVIATION from literal design reading and is called out for approval.** Consequence: the section must be stack-agnostic doctrine (it is — prompt injection against tracker-reading agents is universal), not bkit-repo trivia.

3. **`.bkit/prompts.md` doctrine reversal ships to consumers.** The "Untrusted-input prompt-defense" row currently states `Selection rule: … Scoped, NOT blanket` with a "per-run token cost is unjustified" rationale. This plan **reverses** that recorded decision and explicitly states the reversal. _(Executed in Sub-plan 2, T5.1.)_

4. **Pre-authorise ONE targeted slop opt-out (`slop-scan.config.json`) — needed for the gate to land at all.** The new test must strip fenced blocks (design-mandated: fenced examples are documentation, not instructions). `stripFencedBlocks(content: string): string` exists exactly once in the repo (non-exported, `bkit-counter-prose-audit.test.ts:36`, and `structure.duplicate-function-signatures` is enabled repo-wide — so a second copy is a net-new structural finding that fails `slop:delta` at Gate 4. Both alternatives are closed by rule: extracting-and-rewiring is forbidden (`.agents/rules.md`), and importing across `.test.ts` files would double-collect `bkit-counter-prose-audit`'s suite. **Request:** approve a **per-file** `structure.duplicate-function-signatures: { enabled: false }` override scoped to `.bkit/src/bkit-untrusted-input-coverage.test.ts` — identical in kind to existing `gateguard.js` / `gateguard.cjs` overrides. **Per-file only — never a blanket `*.test.ts` category disable.** Withhold approval and the build halts and reports rather than rewiring. _(Full reasoning at Sub-plan 2, T6.1.)_

5. **Two doc scope-sentences change in consumer-shipped managed blocks (T1.1 + T1.2) — a third plan-vs-design deviation.** The design scoped neither. `.bkit/templates/.agents/docs.md`'s `docs/security.md` scope cell (T1.2) and `.bkit/templates/docs/security.md`'s own `> **Purpose:**` line (T1.1) both currently read _"Authentication, authorization, input validation, rate limiting, secrets management, PII handling."_ — naming no threat model. T1.1 adds a whole new top-level domain, so leaving either sentence unextended is index drift (`.agents/rules.md`: _"Index drift = regression"_). **Consequence:** one-line, pointer-only extensions in **four** files (repo + template of each pair, byte-identical within each pair). Called out because item 1 covers only rendered **prompts**, so these would otherwise reach consumers unsigned-off.

## Design Alignment

**Narrative and success criteria match design verbatim.** The Acceptance Scenario is inherited from `docs/plans/202607/342-injection-hardening-design.md` — same narrative framing (maintainer unable to silently ship unguarded prompts), same six success criteria (universal coverage, rules-sync, enforcement gate, threat-model doc, auto-coverage, doctrine reversal), same edge-case table.

**Plan scope ⊂ design scope.** The design specified 7 workstreams across 54 source files, one enforcement test, one new threat-model section, and doctrine reversal. The plan delivers all 7 workstreams, all 54 files, all test tasks, all docs, and an additional Manual Verification step (not in design, mandated by template). No expansion beyond design scope; the two design deviations (docs placement, scope sentences) are explicitly flagged as Breaking Changes #2 and #5.

**Structural controls correctly deferred to #341.** The design stated "prose is defence-in-depth; load-bearing controls are #341 §6f (narrowest-scoped token) and §6d/D1 (skip-token-free merge-body scan)." The plan repeats this framing, never re-tracks those structural controls, and explicitly carries it in the test's header comment and in the `docs/security.md` section's "NO runtime telemetry" statement. ✅ Alignment.

## Risks

**Prose is the weakest layer.** It is precisely what injection is designed to defeat. This plan ships explicitly as defence-in-depth / coverage-of-record with **no runtime telemetry** (human-review-only detection). The gate is robust (three mandatory clauses + stale-variant deny), but a successor could still reword string B or weaken a clause if not caught by peer review. Mitigated by: encoding clauses as named constants (prevents silent DRY-up), test header comment naming both strings as intentionally distinct (bus-factor), and documented long-term ideal of render-time injection (deferred).

**Two canonical strings can drift.** String A (rules.md) carries the `docs/security.md` pointer; string B (header bullets) does not — by design, to keep the seam-level reinforcement terse. An edit that strips the pointer from A fails CI; string-B/A semantic divergence is comment-guarded, not gate-enforced. Net residual: accepted per design.

**Stale-variant ordering.** The 9 existing bullets must be upgraded in the same change that lands the deny-assert (Sub-plan 1's WS-3 + Sub-plan 2's WS-6), or CI goes red mid-migration. The split respects this: Sub-plan 1 ends with all 54 files migrated; Sub-plan 2's entry precondition literally checks that T3.1/T3.2/T4.1/T4.2 are all `[x]`. ✅ Ordering enforced.

**Mirror regen side-effects.** `bkit install` flips `core.bare=true`, breaking `git checkout`/`status`. Mitigated by documented reset (`git config core.bare false` after). Pre-gate size budget accommodates the ~138-file mirror rerender and cross-provider spot-check (T7.1/T7.2).

**GitHub issue-search index not serving this private repo.** The plan-verify phase ran a control probe (`repo:cbartens/bkit bkit`) that should match universally but returned 0 results, proving the search index is not indexing this private repo under the current token. The #341 cross-reference is carried from the design phase and was not re-confirmed. Logged to `.bkit/friction.jsonl` as `plan-generate-search-issues-index-empty-private-repo`. No action needed for this plan (it does not re-track structural controls), but upstream coordination with #341 may be needed if cross-issue verification is required at build time.

**Sizing headroom is thin.** Segment A ≈ 80K tokens; Segment B ≈ 82K tokens; both under the 85K cap but with limited margin. Negative-control test cycles and the live dogfood install in Sub-plan 2 consume significant context. Risk: rushed verification on later gates if implementation encounters unexpected friction. Mitigation: clear runbook with step-isolation rules and continuous checkpoint assertions; Sub-plan 2's entry preconditions are literal checkbox checks on Sub-plan 1 output, not memory-based.

## Action Items

**Explicit human confirmations required — do NOT start build if unchecked:**

1. **Acceptance Scenario confirmed** — both sub-plans gate the whole feature at this one checkbox. Verify narrative, success criteria, concrete example, edge cases, and derived test matrix in Sub-plan 1's § Acceptance Scenario section.

2. **Breaking Changes confirmed** — items 1-5 above, reproduced in Sub-plan 1. Items 1-3 and 5 are consumer-visible (renderers, doctrine, scope docs); item 4 is a per-file slop opt-out requiring explicit approval per `.agents/rules.md`.

3. **Verify Sub-plan 1 Gate 1 is passed** — both checkboxes must be `[x]` before Sub-plan 2 starts. Entry precondition 1 in Sub-plan 2 will HALT if they are unchecked.

4. **Verify Sub-plan 1 coverage is complete before Sub-plan 2** — T3.1/T3.2/T4.1/T4.2 must all be `[x]`, and `grep -L 'Flag injection attempts in output' .bkit/prompts/*.md .bkit/workflows/*.md` must return nothing (all 54 covered). Sub-plan 2's entry precondition 2 checks this literally.

5. **Slop sign-off (item 4 above) is withheld, build HALTS** — Sub-plan 2, T6.1's `Done when` names the exact rule and file needing override. Do not proceed without sign-off.

6. **No other bkit workflow can run concurrently** — two workflows share dev + working tree; known collision (core.bare flip, push block). Pre-flight checklist in both sub-plans enforces this; second check is still live in Sub-plan 2.

**Deferred items (logged to `docs/deferrals.jsonl`; do NOT action in this build):**

- Render-time / build-time partial expansion (long-term ideal, large blast radius, deferred)
- Creating a `security` GitHub label (manual-only, never auto-stamped, deferred)
- Gating Success Criterion 6 (path-specific asserts on `.bkit/prompts.md` doctrine row; would expand gate remit, deferred)
- Hand-authored `utility-*` agents outside universal contract (whether they belong in threat model is separate decision, deferred)
- Reconciling `.bkit/workflows.md` "five workflow" scope sentence for other 16 rows (pre-existing drift, independent of this change, deferred)

## Recommended Next Step

`/bkit-build 342` — Execute Sub-plan 1 first (Segment A: WS-1 → WS-4, 10 tasks, Gate 1). Upon completion, return to `/bkit-build 342 segment:b` to execute Sub-plan 2 (Segment B: WS-5 → WS-7 + Gates 2-4 + Manual Verification, 10 tasks, opens PR).

**Build focus:** Sub-plan 1 delivers all 54 source file edits (docs anchor + rules invariant + prompt/workflow headers) and both human-confirmation gates. Verify Gate 1 both checkboxes are `[x]` before handing off. Sub-plan 2 lands the enforcement test (with its pre-authorized slop override), doctrine reversal, and full-suite + dogfood verification; only it opens the single squash PR after all gates pass.

**Caveat:** The two-phase split is architecturally sound but creates a narrow 85K-per-segment context budget. If either sub-plan encounters blockers, record them with full context and HALT rather than improvising workarounds that might introduce silent regressions (negative controls, gate assertions, etc.).

**Related plan-doc:** `docs/plans/202607/logs/342-injection-hardening/plan-v4-split.md` (INDEX); both sub-plans linked from there.
