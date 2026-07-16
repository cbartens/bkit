# Design Brainstorm & Ideas

Lens: Pragmatic — existing code, minimal new infra, ship fastest.

> Grounding facts verified in-repo (not assumed):
>
> - Prompt + workflow headers share one `> [!CAUTION]` block shape with `> - **Label:** …` bullets. Workflows carry `Read in full: .agents/rules.md` at the top of that block; the 45 leaf prompts do NOT (`.bkit/prompts/*.md`, `.bkit/workflows/*.md`).
> - The 9 existing bullets are byte-identical copy-paste (`bkit-design-review-1.md:30`, etc.), placed as the last CAUTION bullet after `No commits`. There is no assembler seam that injects them — coverage is literally per-file text.
> - `rules.md` Security & Data (`.agents/rules.md:95`) currently holds only a `Mechanics: docs/security.md` pointer, no untrusted-content rule.
> - Template-sync is already gated: `bkit-rules-sync.test.ts` byte-equals the `bkit:start→bkit:end` block of `.agents/rules.md` vs `.bkit/templates/.agents/rules.md`.
> - Enforcement-by-file-iteration is an established pattern: `bkit-counter-prose-audit.test.ts` loops workflow files and regex-asserts prose invariants.
> - `docs/security.md:53` already has a "CI Auto-Route Trust" trust-boundary section — the model to mirror for the threat-model write-up.
> - Structural guards (token scope, D1 merge-body) are #341, explicitly cross-referenced not re-tracked here. This issue is the prose CONTRACT + COVERAGE + ENFORCEMENT only.

---

## Approach A — Universal header bullet + dynamic-glob enforcement gate ⭐ Recommended

**Summary:** Ship the canonical invariant to `rules.md` Security & Data (mirrored to the template), add the one upgraded bullet as a universal last-CAUTION element to every workflow header and every leaf prompt (upgrading the existing 9 in the same pass), add the threat-model section to `docs/security.md`, and add one enforcement test that dynamically globs `.bkit/prompts/*.md` + `.bkit/workflows/*.md` and asserts the bullet's presence — so newly added prompts are covered-or-failing by construction, with no allowlist to maintain.

- **Complexity:** MEDIUM. Wide but purely mechanical: ~45 prompt edits + 8 workflow edits are the same one-line bullet; the rule text and threat-model prose are given in the input. The only genuinely new code is one test file, built on the `counter-prose-audit` iteration pattern + the `rules-sync` byte-equality pattern — both already in `.bkit/src`.
- **Extensibility:** HIGH. Rule wording changes in exactly two authored places (`rules.md` + the per-file bullet), and the enforcement test globs rather than lists, so every future prompt inherits the requirement automatically — this is the "zero-gap, no per-leaf classification debt" end-state the input recommends. The gate turns copy-paste fragility into a hard invariant.
- **Risk:** Drift between the 46 hand-edited bullets (a typo'd copy → the exact-string test fails loudly, which is the intended safety, but a too-strict exact-match could nag on benign whitespace). Mitigate by asserting on a normalised substring (the load-bearing clause), not byte-exact. Secondary risk: forgetting the batched `bkit install` → stale `.claude/.cursor/.opencode` mirrors; the existing mirror-drift tests + a single end-of-session install cover this.
- **Maintenance:** LOW ongoing. One rule, one gate, self-policing. The prose is defence-in-depth/coverage-of-record; the heavy lifting stays with #341's structural controls, so this layer rarely changes.
- **Reuse vs new:** Almost entirely reuse — existing CAUTION-block shape, existing bullet text (upgraded), existing `rules-sync` sync gate, existing file-iteration test pattern, existing `security.md` trust-boundary section as template. Net-new = one test file + prose additions. No render/infra changes.

## Approach B — Render-time injection via a shared header snippet (marker seam)

**Summary:** Introduce a single canonical bullet source and have the `bkit install`/upgrade renderer splice it into every prompt + workflow CAUTION block at build time — the same mechanism the tracker block already uses via `<!-- bkit:tracker … start/end -->` markers — so the invariant has exactly one authored copy and coverage is guaranteed by construction rather than by a test.

- **Complexity:** HIGH. The input's decisive fact is that `.bkit/src` assembles nothing for prompt headers today; this approach builds that seam from scratch — a new marker pair, renderer wiring, and updates across the install + upgrade + mirror-regen paths, each with its own integration/snapshot tests and cross-provider (claude/cursor/opencode) parity assertions.
- **Extensibility:** HIGH (highest of the three). Single source of truth; add/edit/remove the rule in one place and every surface re-renders. No enforcement test even strictly needed for coverage (though sync tests still guard the render output).
- **Risk:** Large blast radius on the most sensitive engine in the repo (install/upgrade), for a one-line invariant — high chance of mirror-drift regressions, snapshot churn, and opencode-format edge cases (per memory, opencode ≠ Claude/Cursor format). Directly tensions the #341/#342 guiding principle of "minimal, additive, not a rewrite of call sites," and YAGNI for a single static bullet.
- **Maintenance:** MIXED. Lower per-rule-edit cost, but a permanently heavier install engine and more render tests to keep green.
- **Reuse vs new:** Meaningful net-new render infra despite reusing the tracker-marker idea; touches the shipping engine rather than just content. Over-built for the payload.

## Approach C — Prioritised partial coverage (P0→P1 now, defer P2–P3) with allowlist gate

**Summary:** Cover only the trifecta-closing surfaces first — `rules.md` + the 8 workflow headers (P0) and the acting leaves that run Bash/Edit/Write on untrusted-derived content (P1) — upgrade the 9 existing bullets, and gate only that set via an explicit allowlist in the enforcement test; defer readers/summaries/audits (P2–P3) to a follow-up.

- **Complexity:** LOW immediate footprint; ships fastest of the three.
- **Extensibility:** LOW. The enforcement test must encode "which prompts require the bullet," so the allowlist itself becomes a new drift/classification surface — every new prompt forces a triage decision, re-opening exactly the per-leaf-classification gap #342 is closing. The input explicitly prefers the universal end-state over this.
- **Risk:** Partial coverage leaves first-reader leaves (`design-brainstorm-ideate-1/2/3`, plan/design authors) ungated, and the allowlist silently rots as prompts are added — the enforcement test passes while coverage regresses.
- **Maintenance:** MEDIUM-HIGH. Ongoing classification calls + a second rollout pass + an allowlist to keep honest.
- **Reuse vs new:** Same reuse profile as A but with a hand-maintained inclusion list instead of a glob — less code now, more judgement debt forever.

## Decisions

| Decided                                                                                      | Alternatives                                          | Why                                                                                                                                           |
| -------------------------------------------------------------------------------------------- | ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Universal per-file bullet across all 46 prompts + 8 workflows (Approach A)                   | Partial P0/P1 coverage (C); render-time injection (B) | Input names the zero-gap universal header as recommended end-state; A reaches it with only mechanical content edits and no engine risk.       |
| Enforcement test globs `.bkit/prompts/*.md` + `.bkit/workflows/*.md` dynamically             | Hardcoded allowlist of covered files (C)              | A glob makes new prompts covered-or-failing automatically; an allowlist becomes the next drift surface.                                       |
| Assert a normalised load-bearing substring, not byte-exact bullet                            | Byte-exact match like `rules-sync`                    | The DATA/never-execute/never-steer clause is the invariant; byte-exact would nag on benign whitespace while adding no safety.                 |
| Keep `rules.md`↔template sync on the existing `bkit-rules-sync` byte-equality gate           | New bespoke sync check for the security bullet        | The managed-block byte-equality gate already covers any rule added inside `bkit:start→bkit:end`; adding the invariant there is free coverage. |
| Prose = defence-in-depth only; structural guards stay in #341                                | Re-track token-scope / merge-body here                | Input non-goal; keeps this issue to contract + coverage + enforcement, avoids scope collision.                                                |
| `docs/security.md` threat-model section modelled on the existing "CI Auto-Route Trust" block | New standalone security doc                           | Reuses the in-repo trust-boundary precedent; `rules.md` already points here for mechanics.                                                    |
| One batched `bkit install` at session end to regenerate mirrors                              | Install after each edit                               | Memory + rules: never per-edit installs in this repo; end-of-session batch, cross-provider parity verified once.                              |
