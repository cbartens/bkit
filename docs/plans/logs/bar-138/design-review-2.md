Verdict: CONCERNS

<!-- verdict:end -->

# Design Review

## Ecosystem Search

### Capability 1: GitHub Actions tag-push triggered publish via GITHUB_TOKEN

**What exists:** `actions/setup-node@v4` with `registry-url` + `scope` auto-writes `~/.npmrc` on the runner and wires `NODE_AUTH_TOKEN` into it. Combined with `permissions: packages: write`, `secrets.GITHUB_TOKEN` is sufficient for `npm publish` to `npm.pkg.github.com`. This is the canonical GH Packages publish pattern per official docs.

**Fit:** Exact match to design. No custom tooling needed. `pnpm/action-setup@v4` resolves pnpm version from `packageManager` field — correctly left without `with: version:`.

**Recommendation:** USE-AS-IS. The design snippet matches the documented approach precisely.

### Capability 2: Scoped package with publishConfig pointing to GH Packages

**What exists:** `publishConfig.registry` + `publishConfig.access` in `package.json` is the standard npm mechanism for scoped-registry override.

**Fit:** `access: "restricted"` is correct for a private scoped package on GH Packages. GH Packages enforces scoped package names (the `@cbartens/` scope is already satisfied).

**Gap noted:** `access: "restricted"` is semantically "private to users with `read:packages` scope". This is correct. The design correctly documents that `access: "public"` would be needed only for true open access.

**Recommendation:** USE-AS-IS.

### Capability 3: Consumer `.npmrc` token interpolation

**What exists:** `.npmrc` `_authToken=${GH_BKIT_TOKEN}` with env-var interpolation at install time is standard npm behavior (works with pnpm, npm, and Vercel's build container).

**Fit:** Vercel reads `.npmrc` from the repo root before running `pnpm install`. Token interpolation from Vercel env vars is well-established. No `installCommand` shim required for registry auth (only needed for git auth).

**Recommendation:** USE-AS-IS.

### Capability 4: Installer print constant replacement in bkit-modules.ts

**What exists:** Four named string constants (`GH_BKIT_TOKEN_MISSING_INSTRUCTIONS`, `GH_BKIT_TOKEN_UNKNOWN_INSTRUCTIONS`, `VERCEL_AUTH_INSTRUCTIONS`, `CI_YML_MERGE_INSTRUCTIONS`) plus the first-install banner in `runCoreModule`. All are surgical string replacements — no logic changes.

**Fit:** All four constants are confirmed present in the codebase. `checkBkitTokenSecret` and `detectVercelProject` logic is unchanged. The design's scope is correct.

**Recommendation:** USE-AS-IS (surgical edits, no structural refactor needed).

### Capability 5: check:dist gate as publish gate

**What exists:** `pnpm check:dist` script nukes `dist/`, runs `tsc`, then `git diff --exit-code dist/`. This is already the staleness gate in `ci.yml`.

**Fit:** Using this as the sole gate in `release.yml` (trusting prior CI green on the same SHA) is reasonable for a single-maintainer package. The design acknowledges this as an open question with a proposed resolution.

**Recommendation:** USE-AS-IS. The proposed lean workflow is sound.

---

## Stack Feasibility

Fully buildable with the approved stack (Node 22, pnpm 10.x, GitHub Actions, TypeScript, Vitest). No new runtime dependencies. All changes are:

- `package.json` manifest field edits
- New `.github/workflows/release.yml` (YAML, no new action dependencies beyond `actions/checkout@v4`, `actions/setup-node@v4`, `pnpm/action-setup@v4` — all already used in `ci.yml`)
- String constant replacements in `bkit-modules.ts`
- Template file (`ci.yml`) content update
- Prose edits to README and `docs/decisions.md`

**Constraint flagged:** The design proposes `node-version: 22` in `release.yml` "to match ci.yml discipline", but the current `ci.yml` uses `node-version: 20`. This is an internal inconsistency in the design narrative. The release.yml snippet in `design-input.md` shows `node-version: 22`; `ci.yml` runs `node-version: 20`; `package.json` declares `engines: { node: ">=20" }`. The two workflows would run on different Node versions, which undermines the "deterministic dist/" rationale for version pinning. This needs resolution before implementation (either upgrade ci.yml to 22 or use 20 in release.yml).

---

## Library / API Evaluation

No new libraries introduced. All registry/workflow mechanics use built-in GitHub Actions features:

| Component | Version | Status | License |
| --- | --- | --- | --- |
| `actions/checkout` | v4 | Stable, widely adopted | MIT |
| `actions/setup-node` | v4 | Stable; `registry-url` wiring confirmed working | MIT |
| `pnpm/action-setup` | v4 | Stable; auto-reads `packageManager` from `package.json` | MIT |
| GitHub Packages npm registry | N/A | GA, free for private packages | N/A |

No bundle size impact (server-side only, no consumer runtime additions).

---

## Integration Risk

**Blast radius: Low.**

- `package.json`: 3 field changes (`private`, `description`, `publishConfig`) + `repository.url` cleanup. No dependency changes.
- `release.yml`: New file only — no changes to existing `ci.yml`.
- `bkit-modules.ts`: String-constant-only edits; no logic changes, no new exports, no interface changes. Existing unit/integration tests for `runCiModule` will need string-match updates to reflect new print content — this is expected and low risk.
- `.agents/templates/.github/workflows/ci.yml`: Remove one step, add env to install step. Consumer repos on v0.3.x are unaffected until they run `bkit install` post-v0.4.0 upgrade.
- `README.md` / `.agents/README.md`: Prose only.
- `docs/decisions.md`: Append-only ADR.

**Systems touched:** bkit publishing pipeline only. Consumer repos are explicitly out of scope for v0.4.0.

**One risk not fully addressed in design:** The `bkit-modules.ts` tests (confirmed present: `bkit-modules.integration.test.ts`) assert on the current string content of the print constants. The design notes "tests barely change shape" but does not explicitly call out that test strings must be updated. This is not a blocker but should be explicit in the implementation plan.

---

## PoC Approach

1. Apply the three `package.json` field changes (`private: false`, `publishConfig`, `repository.url` cleanup) and create `release.yml` with the design-input snippet (resolving node-version to 20 to match `ci.yml`).
2. Bump version to `0.4.0-pre.1`, tag, push — observe the GitHub Actions run.
3. Confirm the package appears at `https://github.com/cbartens/bkit/packages`.
4. In a scratch repo, add `.npmrc` + `GH_BKIT_TOKEN` env and run `pnpm add -D @cbartens/bkit@0.4.0-pre.1`.

Steps 1-3 validate the entire pipeline-auth surface in isolation before any installer print changes are made. This is exactly the design's `pre.1` gate intent. The PoC surface is minimal (2 files + package.json).

---

## Unknowns & Blockers

| Item | Risk | Resolution |
| --- | --- | --- |
| Node version inconsistency (release.yml 22 vs ci.yml 20) | Medium — `check:dist` may produce divergent output between the two runs | Decide before pre.1: align both workflows to the same version. The design says "pin 22 to match ci.yml" but ci.yml is 20. |
| `GITHUB_TOKEN` `packages: write` availability for `cbartens/bkit` | Low-Medium — default for new repos but worth confirming | Resolved by pre.1 smoke tag; zero-cost if it fails. |
| `access: "restricted"` vs `access: "public"` for GH Packages | Low — restricted is correct for consumer-gated auth, but GH Packages access semantics differ slightly from npmjs | Confirmed by pre.1; fallback is flip to `access: "public"` which is still protected by token requirement. |
| `npm deprecate` availability on GH Packages | Low | Design explicitly flags this; no action needed pre-ship. |
| DoD item "gated by typecheck/test/check:dist" vs design's "minimal release.yml" | Low — not a blocker but creates a DoD/design discrepancy | Design-input DoD says "gated by typecheck/test/check:dist"; design-v1-draft proposes minimal workflow (check:dist only). Needs explicit resolution — recommend updating the DoD to match the design decision. |

---

## Verdict Reasoning

The design is architecturally sound, the approved stack supports every required capability without new dependencies, and the two-pre-release validation strategy correctly isolates the highest-risk surface (first-ever GH Packages publish). The decisions table is thorough and alternatives are well-reasoned.

Two items rise to CONCERNS level:

1. **Node version inconsistency between workflows.** The design narrative says "pin 22 to match ci.yml" but ci.yml is at 20. The `check:dist` gate's determinism argument depends on matching versions. This is a concrete implementation-phase bug if left unresolved — `tsc` output is generally stable across Node versions but is not guaranteed.

2. **DoD / design-v1-draft gate mismatch.** DoD in `design-input.md` requires release.yml to be "gated by typecheck/test/check:dist". Design-v1-draft proposes "install + check:dist + publish only". This needs an explicit decision before the plan step to avoid ambiguity during build.

Both are addressable with one-line clarifications in the plan. Neither blocks the design from proceeding.

---

## CRITICAL

- **Resolve node-version before pre.1 tag:** Choose one version (recommend 20 to match current ci.yml) and use it consistently in both `ci.yml` and `release.yml`. If upgrading ci.yml to 22, that is a separate change requiring a rebuilt `dist/` commit. Do NOT introduce a version split.
- **Resolve DoD gate wording:** Update `design-input.md` DoD item 2 (or the design) so plan and DoD agree on whether `pnpm test` / `pnpm typecheck` run in `release.yml`. The proposed minimal approach (check:dist only, trust prior CI) is reasonable — just make it explicit in the DoD.

---

## OPTIONAL

- Explicitly call out in the implementation plan that `bkit-modules.integration.test.ts` string assertions on the four print constants must be updated — not just "tests barely change shape".
- Consider pinning `actions/checkout`, `actions/setup-node`, and `pnpm/action-setup` to SHAs (not just `@v4`) in `release.yml` for supply-chain hygiene, consistent with best practice for publish workflows.
- The open question about `npm deprecate` on GH Packages is low priority but worth a first-time note in `docs/knowledge.md` when pre.1 ships.

---

## OUT OF SCOPE

- Per-consumer migration (`app-gether-life`, `www-visitfrasercoast-com`) — correctly deferred.
- Dual-publish or backward-compat detection in installer prints — correctly rejected.
- CI template node-version token (`{{NODE_VERSION}}`) resolution — separate bkit templating concern, not changed by this feature.
- `npm deprecate` semantics investigation — deferred to first-deprecation event as noted in design.
