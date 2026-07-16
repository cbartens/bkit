Verdict: PASS

<!-- verdict:end -->

# Design Summary

## Overview

#342 establishes a universal, prose-based hardening contract against prompt injection via attacker-controlled content (issue/PR/comment/diff/log/web text). The design specifies two canonical, intentionally-distinct strings (one for `rules.md` doctrine, one for 54 header bullets) anchored on a shared threat-model doc (`docs/security.md`). A glob-based enforcement gate (source-only, dynamic enumeration) makes new prompts/workflows covered-or-failing by construction, eliminating classification drift. The approach treats prose as defence-in-depth (weakest layer) and defers load-bearing structural controls (narrowest-scoped token, skip-token-free merge-body scan) to #341.

## Design Quality

Well-reasoned. The design converged three brainstorms (universal bullets, render-time injection, prioritized coverage) onto a single approach with strong anti-theatre enforcement (three mandatory clauses plus stale-variant deny, not loose substring matching). Critical buildability concerns from review were addressed: clause 1 was re-anchored from non-contiguous `content is DATA` to contiguous `is DATA` (verified substring match), stale-variant deny was scoped to the glob set (not repo-wide, to avoid self-matching mirrors/logs), and placement fallback was specified for 2 worktree workflows lacking Git/tracker markers. The design correctly identifies trade-offs: accepting 54 near-identical copies in exchange for zero engine blast-radius and source-visible rules. Edge cases (prettier reflow, half-migrated corpus, mirror regen side-effects) are documented with mitigation strategies.

## Acceptance Scenario

On adding/editing a prompt or workflow, CI immediately flags missing untrusted-content guard; all 54 files (46 prompts + 8 workflows) carry the three-clause bullet; enforcement test prevents regression (glob catches new files automatically); `docs/security.md` documents threat model (ingest → broad token → act) with prose-only framing and structural deferral to #341; `.bkit/prompts.md` doctrine row updated to universal policy (no longer contradicts design). Success criteria all achievable as scoped; edge cases (prettier reflow, half-migrated corpus, dual placement shapes) handled. **Adherence verdict:** design meets `docs/plans/template.md` § Acceptance Scenario spec — narrative, criteria, and key edge cases all explicit; acceptance is measurable (CI gate + reviewed file state) and realistic (7 workstreams, clear dependencies, mechanical content edits).

## Breaking Changes

None. Content-only: new blockquote bullets in prompt/workflow headers, new `rules.md` paragraph, new `docs/security.md` section, updated `.bkit/prompts.md` row. No API/type/permission changes; rendered mirrors (`.claude/`, `.cursor/`, `.opencode/`) inherit deterministically (no breakage for consumers reading rendered docs). Mirror regen (batched, final step) has known side-effect (`git config core.bare false` post-install) already documented in memory.

## Feasibility

Spike validation passed (Review 1 — Buildability). All patterns already in-repo: `stripFencedBlocks` + per-file diagnostics (via `bkit-counter-prose-audit.test.ts`), `fs.readdirSync` globbing (established pattern, no new deps), rules-sync byte-equality gate (extend, not duplicate). Prettier config `proseWrap: preserve` (default) means no reflow occurs — matching with whitespace normalisation is sound. Review 2 (Operability) confirmed CI failure modes have high observability (structured `{file, missing clause}` diagnostics matching precedent). No unknowns remain; all correctness caveats from both reviews were incorporated into v3-organised.

## Synthesis Coverage

Three brainstorms; one kept (Approaches Considered section). (A) **KEPT:** Universal per-file bullet (all 54 files) + glob-enumerated enforcement gate (source-only, dynamic). Reaches zero-gap end-state with mechanical content edits, zero engine risk, drift-proof gate for new files. (B) **REJECTED:** Render-time/build-time single-source injection (via marker-based snippet) — contradicts "minimal, additive" principle, worst blast-radius on sensitive engine, breaks source visibility of rules, deferred to `docs/deferrals.jsonl` as long-term ideal. (C) **REJECTED:** Prioritised partial coverage (P0/P1 now, defer P2–P3) with allowlist registry — reintroduces classification drift, denylist rebuttal folded into A's universal default. Decision reasoning sound: per-file cost unavoidable regardless, so universal coverage retires classification debt.

## Scope Alignment

No creep. Original brief: establish untrusted-content contract + enforcement across all prompt-injection touch points. Design delivers exactly that: universal coverage (prose contract in all 54 files), enforcement (glob test + stale-deny), threat-model anchor (docs/security.md), and zero silent regressions (dynamic glob auto-covers new files). Structural controls (token scope, merge-body scan) correctly deferred to #341 § 6f / 6d — cross-referenced, not re-tracked. Optional-at-scope deferrals logged: render-time injection (long-term ideal, blocked by blast-radius), `security` GitHub label (manual-only, not auto-stamped). Scope is bounded and coherent.

## Risks

**Prose as weakest layer:** design frames explicitly as defence-in-depth; runtime injection detection is human-review-only, no metrics/logs (stated in Boundaries and confirmed for `docs/security.md` section). Structural controls deferred to #341 are load-bearing. **Two canonical strings divergence:** risk acknowledged, partially mitigated via rules-sync substring assert (string A); string B/A semantic drift held by code-comment intent (not enforced), acceptable per design rationale. **Prettier reflow false-red:** de-risked; repo config defaults to `proseWrap: preserve` (no reflow), normalisation is belt-and-suspenders. **Stale-variant migration ordering:** must upgrade 9 bullets + land deny-assert in same change; documented in WS-3 + WS-6 Requires edges. **Mirror regen side-effects:** `bkit install` flips `core.bare=true` (run `git config core.bare false` after); opencode↔claude parity checked; documented in Risks section.

## Action Items

None. All CRITICAL concerns from Review 1 (Buildability) and Review 2 (Operability) were incorporated into v3-organised: clause-1 re-anchor verified, stale-deny scoped correctly, dual workflow placement specified, `.bkit/prompts.md` row update explicit. Design is complete and ready for planning.

## Outstanding Questions

- **Q:** Should a `security` GitHub label be created to tag #342 and future injection-related work? — **Recommended:** Defer to post-planning; not auto-stamped per design. If team wants centralized tagging for security issues, create manually later (already noted in `docs/deferrals.jsonl`).

- **Q:** Should the 3-clause taxonomy (ingest / act / flag) be enforced as magic constants in the test, or encoded differently? — **Recommended:** Encode as named constants (e.g., `CLAUSE_DATA_NOT_INSTRUCTIONS`, `CLAUSE_ACT_LEG`, `CLAUSE_FLAG`) with a doc-comment mapping each to the trifecta leg it closes. This prevents a future refactor from "DRY-ing up" the three clauses into a single opaque regex and silently dropping the act-leg clause (the anti-theatre lever). Already promoted to Components/Flows § Enforcement test flow step 4.

## Suggested Workstreams

**WS-1: Canonical text + threat-model anchor** (Requires: none) — Lock canonical strings A (rules.md) and B (54-copy bullet), three clause literals, stale-variant deny string, and author `docs/security.md` lethal-trifecta section (ingest → broad token → act; prose-only with no telemetry; structural controls deferred to #341).

**WS-2: `rules.md` + template mirror + rules-sync gate** (Requires: WS-1) — Add string A to `.agents/rules.md` Security & Data + mirror to template; extend `bkit-rules-sync.test.ts` with substring assert of string A's load-bearing clause.

**WS-3: Per-prompt header rollout (46 prompts)** (Requires: WS-1) — Add string B as last CAUTION bullet in all 46 `.bkit/prompts/*.md` files (37 new + 9 upgraded-in-place).

**WS-4: Per-workflow header rollout (8 workflows)** (Requires: WS-1) — Add string B in CAUTION blocks (6 phase workflows after Git:/before tracker marker; 2 worktree utilities as last CAUTION line).

**WS-5: `.bkit/prompts.md` doctrine + deferrals** (Requires: WS-1) — Update "Untrusted-input prompt-defense" row to describe universal coverage (remove quoted stale text from bare prose); log render-time-injection and security-label deferrals to `docs/deferrals.jsonl`.

**WS-6: Enforcement gate** (Requires: WS-1, WS-3, WS-4) — New test: glob `.bkit/prompts/*.md` + `.bkit/workflows/*.md`; per-file `stripFencedBlocks` → assert all 3 clauses present (encoded as named constants) + glob-scoped stale-variant deny.

**WS-7: Batched mirror regen + verification** (Requires: WS-2, WS-3, WS-4, WS-5, WS-6) — One `bkit install` at session end; full test suite green; `git config core.bare false`; cross-provider parity spot-check.

## Recommended Next Step

```text
/bkit-plan 342
Brief: Universal untrusted-content prose contract + glob-based enforcement across 54 prompts/workflows. Defense-in-depth; structural controls deferred to #341. Seven workstreams: canonical-text lock, rules.md + template, per-prompt headers (46), per-workflow headers (8), doctrine update + deferrals, enforcement gate, mirror regen. Design: docs/plans/202607/logs/342-injection-hardening/design-v3-organised.md
```
