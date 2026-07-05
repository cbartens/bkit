Verdict: CONCERNS

<!-- verdict:end -->

# Design Review

## Ecosystem Search

<!-- prettier-ignore -->
| Capability | What exists | Fit | Recommendation |
| --- | --- | --- | --- |
| Publish npm to GH Packages from Actions | `actions/setup-node@v4` writes `~/.npmrc` from `registry-url` + `scope`; auths via `NODE_AUTH_TOKEN` (built-in `GITHUB_TOKEN` w/ `packages: write`) | Direct match — design uses exactly this snippet. User-scope `@cbartens` (not org) so first-publish with `GITHUB_TOKEN` is documented to work. | USE-AS-IS |
| Tag-push trigger pattern | Standard `on: push: tags: ['v*']` | Standard idiom; matches design. Pre-release tags (`v0.4.0-pre.1`) fire identically. | USE-AS-IS |
| Auto-link package → repo | Manifest `repository.url` (bare HTTPS preferred) auto-links when published from same repo with `GITHUB_TOKEN` | Design drops the `git+` prefix which aligns with docs guidance. | USE-AS-IS |
| Consumer auth via `.npmrc` env interpolation | `${VAR}` substitution in `.npmrc` is npm/pnpm standard | Works with both. **Trap:** pnpm ≥7.20 silently ignores the entire `.npmrc` if `${GH_BKIT_TOKEN_INSTALL}` is unset (see Risks). | USE-AS-IS — but installer print MUST flag the silent-ignore failure mode. |
| Release-notes / changelog automation | `release-please`, `changesets`, `semantic-release` | All exist; design explicitly defers (single-maintainer, tag-push-only). YAGNI for v0.4.0. | OUT-OF-SCOPE — defer (see § OUT OF SCOPE). |
| Pre-release version retraction | `npm deprecate` works against GH Packages (community-confirmed); `npm unpublish` also supported within window | Design notes "untested in this codebase" — fair flag, no action needed yet. | USE-AS-IS when needed. |

## Stack Feasibility

Buildable as designed. All moving parts are off-the-shelf:

- `actions/setup-node@v4` + `pnpm/action-setup@v4` already in use in `.github/workflows/ci.yml` (verified — Node 20 currently; design correctly upgrades release.yml to Node 22 for parity with `package.json#engines >=20` and avoids drift).
- `dist/` ships pre-built (verified at `dist/bkit-*.js`); `pnpm check:dist` script exists and behaves as the design's gate (verified `package.json` line 30).
- Print constants `GH_BKIT_TOKEN_INSTALL_MISSING_INSTRUCTIONS` (line 544), `VERCEL_AUTH_INSTRUCTIONS` (592), `GH_BKIT_TOKEN_INSTALL_UNKNOWN_INSTRUCTIONS` (619), `CI_YML_MERGE_INSTRUCTIONS` (646), and the `onlyBuiltDependencies: ["@cbartens/bkit"]` line (357) all exist exactly where the design says — surgical edits feasible.
- `checkBkitTokenSecret` (line 527) and `detectVercelProject` (line 581) untouched per design — auth-detection logic survives the rewrite.

**Constraints / footguns identified:**

1. `ci.yml` currently pins `node-version: 20`; design pins release.yml at 22 — that's a deliberate divergence the design notes but does NOT propose harmonizing `ci.yml`. If `tsc` emit differs across major versions, `check:dist` will fail in release.yml even when ci.yml stayed green. Either (a) bump `ci.yml` to 22 in the same PR, or (b) keep release.yml at 20 to match ci.yml. **The design says "Pin `node-version: 22`" but `ci.yml` is on 20 — that's the inverse of "match ci.yml discipline".** This is the single biggest design contradiction.
2. Manifest currently has no `name`-scope concern: `@cbartens/bkit` is user-scoped, so `GITHUB_TOKEN` first-publish works (org scopes need extra config). Confirmed feasible.
3. `package.json` `engines.node = ">=20"` — fine for Node 22 release runner.

## Library / API Evaluation

No new dependencies introduced. All actions used already:

<!-- prettier-ignore -->
| Surface | Version pin | Risk |
| --- | --- | --- |
| `actions/checkout@v4` | major | None — existing in ci.yml. |
| `actions/setup-node@v4` | major | None — existing in ci.yml. |
| `pnpm/action-setup@v4` | major | None — existing in ci.yml. |
| Built-in `GITHUB_TOKEN` (no PAT) | n/a | None — workflow `permissions: packages: write` is the documented happy path. |
| `npm publish` (not `pnpm publish`) | bundled with Node 22 | Low — `setup-node` registry-url wiring assumes `npm`; matches GH Packages docs. |

License / bundle / types: no impact (shipping bits unchanged; tarball contents identical to v0.3.0 pre-built `dist/`).

## Integration Risk

- **Monorepo fit:** None — bkit is a single-package repo; release.yml does not interact with ci.yml jobs.
- **Systems touched:** `.github/workflows/release.yml` (new), `package.json` (manifest deltas), `.agents/scripts/bkit-modules.ts` (5 surgical string edits + 1 banner line drop), `.agents/templates/.github/workflows/ci.yml` (template for consumers, drop auth-shim step), `README.md`, `.agents/README.md`, `docs/decisions.md`. All in-repo, no external services beyond GH Packages registry.
- **Blast radius:** Limited to v0.4.0+ consumers. v0.3.x git-dep path remains consumable for un-migrated consumers. No DB, no runtime services. Worst case (pre.1 fails): tag is throwaway, retry costs zero.
- **Templates → bkit-self check:** `bkit install` mirrors `.agents/templates/.github/workflows/ci.yml` into the bkit repo's own `.github/workflows/ci.yml` only as a Tier 3 seed. Design touches the template; bkit's own ci.yml (Tier 3) needs the same edits applied (`Configure private-repo auth` step removal, `env: GH_BKIT_TOKEN_INSTALL` addition) — but this is bkit-self. Confirmed: `.github/workflows/ci.yml` lines 23-24 contain the `Configure private-repo auth` step the design removes from the template. If bkit-self continues using its own consumer auth-shim against bkit (it doesn't, since it's the source), this is moot. Verify the design intends to drop this step from bkit-self's ci.yml too — currently unstated.

## PoC Approach

Pre.1 cycle is the PoC:

1. Branch `feat/gh-packages-distribution` off `main`.
2. Edit `package.json`: `private: false`, drop `git+` prefix, add `publishConfig`, bump version `0.4.0-pre.1`.
3. Add `.github/workflows/release.yml` per design-input snippet (verbatim feasible).
4. Tag `v0.4.0-pre.1`, push. Observe workflow.
5. Pass criterion: package appears at `https://github.com/cbartens/bkit/packages` and `npm view @cbartens/bkit@0.4.0-pre.1 --registry=https://npm.pkg.github.com` (with auth) returns metadata.

Total scope: ~10 LoC change + 1 new workflow file. Description fits well under 200 words. **Verdict on PoC clarity: PASS.**

## Unknowns & Blockers

1. **`access: restricted` semantics on first user-scoped publish.** Design flags this. Documented behavior: GH Packages defaults user-scoped packages to private; explicit `access: restricted` should be redundant but not harmful. Confirmed via design's own pre.1 gate. Non-blocking.
2. **`tsc` emit determinism across Node 20 → 22 jump.** If `dist/` was built against Node 20 (current `ci.yml`) and `release.yml` runs `check:dist` on Node 22, emit could in principle drift. Resolve by harmonizing both workflows on the same Node version. **Blocker for pre.1 if not addressed — see CRITICAL.**
3. **pnpm silent-ignore of `.npmrc` when `${GH_BKIT_TOKEN_INSTALL}` is unset.** Affects consumer migration UX, not bkit publish. The new `GH_BKIT_TOKEN_INSTALL_MISSING_INSTRUCTIONS` print copy must call out: "if env var is unset, pnpm silently ignores `.npmrc` — symptom is 401 from npmjs.org, not GH Packages." Design lists "calls out the scope explicitly" but does NOT enumerate the silent-ignore footgun. See CRITICAL.
4. **bkit-self ci.yml has the legacy git auth-shim (line 23-24).** Design touches the consumer template but does not state whether the bkit repo's own ci.yml drops the step. Since bkit-self is the source repo (not a consumer of `@cbartens/bkit`), the shim is dead code today. Cleanup is OPTIONAL but in-scope-aligned. See OPTIONAL.
5. **Open question already in design — "Should `release.yml` also run `pnpm test` and `pnpm lint:*`?"** The proposed answer ("trust ci.yml on tagged SHA") is reasonable but only safe if **branch protection or a workflow check enforces that the tagged SHA has a green ci.yml run**. There is no such enforcement today. A tag pushed to a SHA where ci.yml never ran (or failed) will publish anyway. See CRITICAL.

## Verdict Reasoning

**CONCERNS**, not PASS, because three addressable issues need to be settled before pre.1:

1. Node version mismatch (release.yml=22 vs ci.yml=20) — produces flaky `check:dist` failures or silent emit drift.
2. release.yml has no upstream gate on ci.yml status — a broken-tests SHA can be tagged and published.
3. The new `.npmrc` print copy must include the pnpm silent-ignore footgun, otherwise consumer migrations will dead-end at a confusing 401.

None of these are stack-feasibility failures (everything is buildable), and none invalidate the design direction. They are pre-pre.1 corrections to the design as written.

PASS-able verdict elements: stack fit, ecosystem alignment, single-PR cutover trade-off, pre-release cadence, surgical edit strategy — all sound.

## CRITICAL

1. **Resolve Node version drift before pre.1.** Either bump `ci.yml` to Node 22 in this PR or pin `release.yml` at Node 20. Pick one — design currently mandates 22 in release.yml while leaving `ci.yml` at 20, contradicting its own "match ci.yml discipline" stated mitigation.
2. **Make ci.yml green on the tagged SHA a precondition for release.yml.** Either (a) add `needs:` / `workflow_run` dependency on ci.yml, (b) re-run `pnpm test` + `pnpm lint:*` inside release.yml (extra ~30s, design's own listed open question), or (c) document a hard maintainer protocol "never tag a SHA without green ci.yml". Option (b) is lowest-risk and the design's "lean release.yml" philosophy is YAGNI here when the cost is one extra `pnpm` invocation.
3. **Add pnpm silent-ignore footgun to the rewritten print copy.** New `GH_BKIT_TOKEN_INSTALL_MISSING_INSTRUCTIONS` body must explicitly state: "if `GH_BKIT_TOKEN_INSTALL` is unset at install time, pnpm v7.20+ ignores the entire `.npmrc` and falls back to npmjs.org → opaque 401." Without this, consumer migrations will mis-debug as "registry down" or "scope wrong".

## OPTIONAL

1. Drop the legacy `Configure private-repo auth` step from bkit's own `.github/workflows/ci.yml` (lines 23-24) in this same PR. bkit-self is the source repo; the shim was never needed and is now misleading documentation.
2. State explicitly in `release.yml` whether to use a concurrency group (e.g. `concurrency: { group: release-${{ github.ref }} }`) to prevent two simultaneous tag pushes from racing on `npm publish`. Low probability for a single-maintainer flow, but a 2-line insurance.
3. Add an explicit `if-no-files-found` style assertion that `dist/` is non-empty before `npm publish` — defense-in-depth against a future regression that empties `files`/`dist`. The current `check:dist` catches staleness but not emptiness.
4. Plan ADR `DE-3` to also note that **pre-release versions remain visible in registry indefinitely** unless `npm deprecate`'d — minor footgun for future maintainers browsing the package.

## OUT OF SCOPE

1. Auto-curated GitHub Release notes (release-please, changesets, semantic-release) — design explicitly defers; revisit post-v0.4.0.
2. Per-consumer migration PRs (`app-gether-life`, `www-visitfrasercoast-com`) — design-input expressly out of scope; tracked as separate per-repo work after v0.4.0 ships.
3. Dual-publish to npmjs.org for cost-free public mirror — design rejected; matches design-input "no dual-publish" mandate.
4. Refactor of `checkBkitTokenSecret` / `detectVercelProject` into a polymorphic auth-check module — premature; design's surgical-edit stance is correct.
5. Migration of `BKIT_READ_TOKEN` → `GH_BKIT_TOKEN_INSTALL` (already shipped in v0.2.2; hard prerequisite per design-input, not this PR's burden).
