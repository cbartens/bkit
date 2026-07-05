Verdict: PASS

<!-- verdict:end -->

# Design Summary: BAR-138 — bkit v0.4.0 GitHub Packages npm Registry Distribution

## Overview

The design shifts `@cbartens/bkit` distribution from a git-dependency (`github:cbartens/bkit#vX.Y.Z`) to the GitHub Packages npm registry, eliminating private-repo clone friction, auth-shim complexity, and lifecycle-hook fragility that plagued v0.3.x. A new tag-push-triggered `release.yml` publishes via `npm publish` using the built-in `GITHUB_TOKEN`. Consumers migrate via `.npmrc` + `GH_BKIT_TOKEN_INSTALL` env (expanded scope to `read:packages`), standard npm-registry semantics. v0.3.x remains consumable for unmigrated consumers; v0.4.0 is a hard cutover with no dual-publish. Installer prints updated to guide consumers through `.npmrc` setup instead of git-shim instructions. Two pre-release tags (`v0.4.0-pre.1` pipeline-only, `v0.4.0-pre.2` prints+docs) isolate risk before production `v0.4.0` cut.

## Design Quality

**Well-reasoned.** The design systematically decomposes five orthogonal implementation axes (trigger pattern, installer-message strategy, `dist/` build model, pre-release validation cadence, `repository.url` cleanup) and weighs trade-offs transparently. Each decision is justified against explicit alternatives (e.g., A1 tag-push vs B1 release-UI event vs C1 reusable composite). The synthesis accepts realistic trade-offs (committed `dist/` review noise vs re-introducing lifecycle-hook invariant erosion; atomic cutover complexity vs avoiding contradictory-instruction windows) without over-engineering.

**Addresses prior friction points.** The design is clearly motivated by failures in v0.3.x (auth-shim duplication across GHA/Vercel, OOM from lifecycle hooks, pnpm tag-drop). Each proposal directly solves one friction point without scope creep.

**Edge cases considered.** The design enumerates tag-without-version-bump (fails fast via npm duplicate-version rejection), stale consumer PATs (caller must expand scope, installer print warns), pnpm silent-ignore of `.npmrc` on unset env (print copy explicitly flags the symptom), and legacy Vercel `installCommand` shims (print directs removal). These are concrete, not generic.

**Critical gaps resolved post-review.** Both review rounds flagged three critical issues: (1) Node version drift between release.yml (22) and ci.yml (20) undermining `check:dist` determinism, (2) release.yml lacking gate on prior CI status (risk of publishing broken SHA), (3) pnpm silent-ignore footgun not documented in print copy. Design-v2 resolves all three: pins release.yml to Node 20 (matching ci.yml), runs full check suite in release.yml (typecheck+test+format+lint+check:dist), and mandates explicit pnpm warning in print constants.

## Acceptance Scenario

**Adheres to template.** The design's Acceptance Scenario includes Narrative (user POV, 5 success criteria measurable/testable), Success Criteria (criteria 1-5 specify pre.1/pre.2 smoke gates + consumer install end-to-end + print message validation + CI template cleanup), and Key Edge Cases (4 scenarios: tag-without-bump, v0.3.x stale consumers, token scope drift, legacy Vercel shim). Concrete Example and Derived Test Matrix are correctly deferred to plan phase per template § Acceptance Scenario → Spec.

**Narrative is testable.** Success criteria map directly to implementation validation: criterion 1 (publish succeeds to GH Packages from tag-push), criterion 2 (scratch consumer can install with only `.npmrc` + env), criterion 3 (`bkit install --ci` prints `.npmrc` instructions not git-shim), criterion 4 (CI template drops dead auth step), criterion 5 (pre-release tags publish successfully, ADR recorded). None are ambiguous.

**Edge cases are concrete.** Rather than generic "invalid input" cases, the design covers actual missteps in the consumption/migration workflow: forgotten version bumps fail at registry (not silently), token scope mismatches produce 401 (not opaque timeout), and consumer template cleanup is explicit guidance.

## Feasibility

**Spike matches design.** The ecosystem search (review 1 & 2) confirms all moving parts exist: `actions/setup-node@v4` with `registry-url` + `scope` is the documented GH Packages publish pattern, `npm publish` + built-in `GITHUB_TOKEN` with `packages: write` is the canonical authentication, and `.npmrc` env interpolation is standard npm/pnpm behavior. All actions used are already in `ci.yml` (zero new dependencies). The stack is fully buildable.

**Implementation surface is small.** ~10 LOC of package.json changes, 1 new workflow file (~25 lines), 5 surgical string edits in `bkit-modules.ts` + 1 banner-line drop (no logic refactors), template ci.yml one-step removal + one env-var addition, README/ADR prose. Review 2 confirms blast radius is low (bkit-side only, no DB, no external services beyond GH Packages registry).

**No blockers remain.** Review 1 flagged two blockers (node-version mismatch, release.yml upstream gate, pnpm print footgun); review 2 flagged the same node-version and added DoD/design mismatch. Design-v2 resolves all three with explicit changes (Node 20, full check suite in release.yml, pnpm warning mandatory in print constants). Pre.1 smoke tag is the PoC gate; zero cost if it fails (tag is throwaway).

## Acceptance Scenario

## Synthesis Coverage

**5 axes, all deliberated.** Brainstorm enumerated 5 orthogonal decisions:

1. Trigger: A1 (tag-push) vs B1 (release UI) vs C1 (reusable composite) → **A1 kept** (smallest surface, pre-release tags reuse same pipeline)
2. Installer prints: A2 (hard cutover) vs B2 (dual-path detect) → **A2 kept** (design-input "no dual-publish", YAGNI on conditional detection)
3. `dist/` model: A3 (committed + check:dist) vs B3 (prepublishOnly) vs C3 (build in CI) → **A3 kept** (honors BAR-130 no-lifecycle-hooks invariant)
4. Pre-release cadence: A4 (two tags: pre.1 pipeline, pre.2 prints) vs B4 (single shot local validate) vs C4 (one combined pre.1) → **A4 kept** (matches implementation order, isolates failure surfaces)
5. Repository URL: A5 (drop `git+`) vs B5 (leave as-is) → **A5 kept** (free hygiene win, standard npm convention)

**Plus implementation notes merged from brainstorm-2:** `npm publish` (not `pnpm publish`), drop `onlyBuiltDependencies` line from banner — both justified (matches GH Packages docs, lifecycle-hook OOM workaround obsolete post-v0.3.0).

**Good option losses were avoided.** B3 (prepublishOnly) and C3 (build in CI) were rejected not because they're wrong in isolation, but because they erode the BAR-130 v0.3.0 invariant the team paid OOM debugging to establish — a forward-looking decision. B2 (dual-path detection) was rejected with explicit "carries dead code forever" rationale, consistent with "no dual-publish" design-input mandate.

**One notable reversion:** Design-v1 proposed Node 22 in release.yml "to match ci.yml discipline", but ci.yml is Node 20. Review 1 flagged this as a contradiction. Design-v2 corrected to Node 20, aligning the statement with actual intent (keep determinism, so match ci.yml's actual version, not a proposed future version).

## Risks

**Well-enumerated in design § Risks & Open Questions.** The design identifies seven risks with mitigations:

1. **`GITHUB_TOKEN` permissions mismatch on first publish** — mitigated by pre.1 smoke tag (zero-cost rollback if fail).
2. **`check:dist` divergence via Node version drift** — resolved in v2 by pinning release.yml to Node 20 (matching ci.yml).
3. **Pre-release versions visible in registry indefinitely** — acceptable for private package with `^0.4.0` semver (consumers won't pin to `pre.*` accidentally).
4. **`GH_BKIT_TOKEN_INSTALL` PAT scope drift on consumers** — mitigated by installer print copy calling out scope explicitly + per-consumer migration guide.
5. **pnpm v7.20+ silently ignores `.npmrc` on unset env** — mitigated by rewritten print constants explicitly enumerating this footgun verbatim so consumer AI agents map symptom → cause.
6. **Lifecycle-hook re-introduction by future contributors** — documented invariant in decisions.md + knowledge.md; code review must catch.
7. **`npm deprecate` untested in this codebase** — flagged for first-deprecation event, no pre-ship action needed.

**Open questions resolved post-review.** Design lists one open question: "Should release.yml run `pnpm test` and `pnpm lint:*`?" Both reviews flagged this as creating DoD/design mismatch (DoD says "gated by typecheck/test/check:dist" but design proposed "lean release.yml trusting prior CI"). Design-v2 resolves: release.yml **does** run the full check suite (typecheck+test+format+lint+check:dist) in-line before publishing. This becomes the single source of truth — release.yml does NOT trust prior CI; it re-runs the gate set on the tagged SHA.

**Dependencies/assumptions stated.** The design explicitly lists three dependencies: (1) `cbartens/bkit` repo has `packages: write` available to built-in `GITHUB_TOKEN`, (2) `BKIT_READ_TOKEN` → `GH_BKIT_TOKEN_INSTALL` rename (v0.2.2) landed for all consumers already, (3) Node 20 + pnpm 10.x on release runner with engines.node = ">=20". All are reasonable; (2) is a hard prerequisite per design-input already shipped.

## Scope

**Tight adherence to design-input.** The design-input explicitly lists in-scope and out-of-scope. The v2 design stays within in-scope: bkit-side package.json changes, release.yml, installer print updates, template ci.yml, README rewrites, ADR. Consumer migrations, backward-compat dual-publish, and `BKIT_READ_TOKEN` rename are correctly marked out-of-scope (handled in separate per-consumer PRs or prior releases).

**No creep observed.** The design mentions but defers: release-please/changesets (revisit post-v0.4.0), refactor of auth-check logic into a module (YAGNI at 2 callers), `npm deprecate` semantics investigation (deferred to first event). All are valid future work, not bundled here.

**Hard cutover is in scope; consumer PRs are not.** The design-input says v0.4.0 is the cutover (no dual-publish, no backward-compat). Design-v2 delivers that: flip `private: false`, drop git auth-shim from prints, update templates. Per-consumer migration of `package.json` specs, `.npmrc` setup, and token scope expansion happens in separate PRs post-v0.4.0.

## Action Items

No action items required. Design-v2-reviewed has resolved all critical concerns flagged by both review rounds:

1. **Node version mismatch**: Resolved to Node 20 (matching ci.yml), not 22.
2. **DoD/design gate mismatch**: Resolved — release.yml runs full check suite (typecheck+test+format+lint+check:dist) before publish.
3. **pnpm silent-ignore footgun**: Mandated in print copy — both `GH_BKIT_TOKEN_INSTALL_MISSING_INSTRUCTIONS` and `GH_BKIT_TOKEN_INSTALL_UNKNOWN_INSTRUCTIONS` must explicitly state pnpm's silent-ignore symptom.
4. **bkit-self ci.yml cleanup (optional)**: Design notes removal of legacy `Configure private-repo auth` step from lines 23-24 of `.github/workflows/ci.yml` as aligned cleanup (same step removed from template). Not required but fits in same PR.

The design is ready to enter planning. Pre.1 smoke tag is the validation gate; implementation can proceed immediately per the suggested implementation order in design-input.md.
