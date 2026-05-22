# Design Brainstorm & Ideas

## Approach A — Minimal-surface atomic cutover ⭐ Recommended

Single PR wires up publishing and deletes all git-dep machinery in one pass. No toggles, no compatibility shims, no dead code left behind. The design input's suggested order (pipeline validate → message rewrites → doc rewrites → cut v0.4.0) maps directly to commit checkpoints within the branch — each checkpoint leaves the branch green.

- **Complexity:** LOW. Every change is a mechanical substitution: `private: false`, add `publishConfig`, new workflow file, string-swap `GH_BKIT_TOKEN_MISSING_INSTRUCTIONS` / `VERCEL_AUTH_INSTRUCTIONS` constants, update CI template, update README managed blocks.
- **Extensibility:** Registry distribution is the end state; nothing to extend. Future version bumps just push a tag.
- **Risk:** Two sources of publish-pipeline risk: (1) `GITHUB_TOKEN` permissions mismatch — mitigated by the `v0.4.0-pre.1` smoke-tag before any docs land; (2) `check:dist` running `tsc` inside the release job might diverge from the committed `dist/` — identical risk to current CI, already covered by the script.
- **Maintenance:** Near-zero ongoing cost. No shim code to keep synchronized between bkit and consumers.

**Specific implementation notes (fresh angle):**

- The release workflow should reuse `actions/setup-node@v4` with `registry-url: https://npm.pkg.github.com` + `scope: '@cbartens'` so `NODE_AUTH_TOKEN` is auto-wired. Using `npm publish` (not `pnpm publish`) avoids pnpm's stricter publish lifecycle hooks and matches the pattern GitHub Packages docs recommend.
- `private: true` in `package.json` must become `private: false`. The existing `description` field still says "installed as a git dependency" — that text is a lie post-migration; update it in the same commit to avoid drift.
- The `repository.url` field uses `git+https://` prefix — fine for npm, no change required. The GitHub Packages registry infers the owning org from `publishConfig.registry` + the scoped package name, not from `repository.url`.
- `onlyBuiltDependencies: ["@cbartens/bkit"]` in consumer `pnpm-workspace.yaml` — this was a workaround for the lifecycle-hook OOM (BAR-130 #5). With `prepare` already dropped in v0.3.0 and no lifecycle hooks in the published package, this entry is harmless but unnecessary. The first-install banner currently prints "Add to pnpm-workspace.yaml or package.json: onlyBuiltDependencies: …". That line should be dropped from the `printSink.push` block in `runCoreModule` since registry packages with no lifecycle hooks don't need it, and keeping it generates noise and confusion for new consumers.
- `checkBkitTokenSecret` in `bkit-modules.ts` uses `gh secret list` to verify the secret exists. The function and the secret name (`GH_BKIT_TOKEN`) stay identical — only the surrounding instruction strings change. Isolate the three string constants (`GH_BKIT_TOKEN_MISSING_INSTRUCTIONS`, `VERCEL_AUTH_INSTRUCTIONS`, `GH_BKIT_TOKEN_UNKNOWN_INSTRUCTIONS`) as the sole edit targets; the check function itself is zero-change.
- The consumer CI template at `.agents/templates/.github/workflows/ci.yml` currently has a "Configure private-repo auth" step (git config shim). That step must be removed and replaced with `env: GH_BKIT_TOKEN: ${{ secrets.GH_BKIT_TOKEN }}` on the install step. Because this template is Tier 3 (seed-or-print for existing consumers), existing consumers will receive the AI merge instructions string — which also needs updating to describe the registry `.npmrc` pattern instead of the git-shim pattern (`CI_YML_MERGE_INSTRUCTIONS` constant in `bkit-modules.ts`).

---

## Approach B — Gated dual-phase with feature flag

Separate the publish pipeline (Phase 1) from the installer-message and template rewrites (Phase 2) by introducing a bkit version constant that the installer reads to decide which instruction text to emit. Phase 1 ships as `v0.4.0-beta`; Phase 2 activates text rewrites once the publish pipeline is validated.

- **Complexity:** MEDIUM. Requires a flag/version gate in `bkit-modules.ts`, two deploy cycles, and careful coordination between what the installer says and what the shipped template contains.
- **Extensibility:** The gate pattern could be reused for future message-versioning, but this is speculative — YAGNI applies hard.
- **Risk:** The flag introduces a code path that needs its own test coverage. A consumer installing between Phase 1 and Phase 2 gets the old git-shim instructions while the package actually ships via registry — contradictory guidance.
- **Maintenance:** Dead code (the flag and old text branches) must be cleaned up post-Phase 2. History shows that "temporary" flags stay.

---

## Approach C — Dual-publish with backward-compat transition period

Publish to GitHub Packages registry while keeping the git-dep path functional for a transition window. Consumers migrate on their own schedule over 1-2 sprints. Remove the git-dep path in a follow-up `v0.4.1`.

- **Complexity:** MEDIUM-HIGH. Both auth surfaces must be documented simultaneously. The installer must print relevant instructions for both distribution modes or detect which one the consumer uses.
- **Extensibility:** N/A — transitional only.
- **Risk:** Design input explicitly calls this out of scope: "No dual-publish." The git-dep distribution path requires the existing `prepare`-hook OOM risk to remain documented. Extended surface for consumer mistakes (mixing old and new auth patterns). v0.3.x stays consumable; that's the backward-compat story — nothing extra needed in v0.4.0 itself.
- **Maintenance:** High — two code paths, two auth surfaces, two sets of consumer docs until the cleanup PR lands.

---

## Decisions

<!-- prettier-ignore -->
| Decided | Alternatives | Why |
| --- | --- | --- |
| Approach A — atomic cutover in one PR | B (feature-flag gating), C (dual-publish transition) | Design input explicitly excludes dual-publish and backward-compat support for old path. Flag gating adds dead code and creates a window of contradictory installer instructions. |
| Remove `onlyBuiltDependencies` from first-install banner | Keep it | The entry was a lifecycle-hook OOM workaround (BAR-130 #5). `prepare` was dropped in v0.3.0; registry packages with no lifecycle hooks don't need it. Keeping it generates noise. |
| Use `npm publish` in release workflow, not `pnpm publish` | `pnpm publish` | GitHub Packages docs use `npm publish`; avoids pnpm lifecycle hook surprises and the `--no-git-checks` flag requirement. |
| Edit string constants in `bkit-modules.ts` as isolated targets | Refactor auth-check into a module | Auth-check logic (`checkBkitTokenSecret`, `detectVercelProject`) is correct and unchanged. Only the instruction text differs. Surgical string edits are lower risk than structural refactors. |
| Update CI template + `CI_YML_MERGE_INSTRUCTIONS` in the same commit as installer text | Separate commits | Template and instruction text must be consistent; splitting them creates a window where the template seeds the new `.npmrc` pattern but the merge instructions still describe the git-shim. |
| `v0.4.0-pre.1` smoke tag before any docs land | Validate locally only | Local validation doesn't exercise the GHA `packages: write` permission path. A failed publish on `pre.1` is zero-cost to fix; discovering it on `v0.4.0` proper would require a patch release. |
