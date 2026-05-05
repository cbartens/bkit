# Ship — Update Docs (bar-130-ci-lint-scaffolding)

**FID:** bar-130-ci-lint-scaffolding
**Phase:** Ship (parallel with `@bkit-ship-summary`)
**Working tree:** `/Users/christian/Documents/GitHub/bkit` on branch `dev` (post-squash-merge)
**Date:** 2026-05-05

## Files updated

- [x] `docs/completed.md` — Appended one new entry: "bkit CI/lint scaffolding + 3-tier installer + module-flag CLI — BAR-130 (2026-05-05)". Points to archived plan locations at `docs/plans/completed/202605/bar-130-ci-lint-scaffolding-plan{,-1,-2,-3}.md` (orchestrator performs `mv` from `active/` to `completed/202605/` in Step 8). Entry summarises Scope A (self-gating), Scope B (installer engine — tokens, tiers, marker generalisation, WriteSet, templates), Scope C (CLI redesign — bkit-cli, bkit-modules, postDispatch pattern, deprecation stubs). Captures: 173 tests, MED-1..7 fixed, MED-8 deferred, manual smoke gates 4.5a/4.5b deferred to post-merge by design, in-flight CRITICAL fix on bkit's own ci.yml. Cross-refs DE-1, DE-2, KN-1, KN-2, BAR-200, BAR-131.

## Files reviewed but NOT touched

- [x] `docs/decisions.md` — DE-1 (3-tier file ownership) and DE-2 (composable module-flag CLI) already appended during build phase (Task 9.1). Both reference BAR-130 / paths / kill-date BAR-200. No ship-time additions warranted.
- [x] `docs/knowledge.md` — KN-1 (`runPayload` WriteSet threading) and KN-2 (`postDispatch` pattern) already captured during build/debug phase. No new gotchas surfaced post-merge that need recording.
- [x] `docs/pending.md` — Five v0.2 / future entries already appended during build phase (Task 9.2): `init` verb removal, `--host=` flag removal, helper auth action, `--no-X`/`--force` flags, `package.json` automated merging. Plus MED-8 (`runPayload` WriteSet threading) and `bkit-ship` tag-derivation entries. No additional pending items required for ship-doc-update scope itself; HOWEVER see "Surfaced for human/synthesizer review" below — post-merge dev CI failure at `Setup pnpm` step warrants a new pending entry but per sole-writer policy this agent cannot persist to `pending.md`.
- [x] `docs/deployments.md` — Empty stub (only `bkit:start`/`bkit:end` markers + Purpose header). No deployment topology / secrets sync / branch protection content added by this cycle that warrants writing into this doc — bkit is library tag-and-go; CI auth-shim documentation already lives in README and `.agents/README.md`.
- [x] `docs/testing.md` — Empty stub. The 173-test breakdown / unit vs integration tier convention is already documented in `.agents/rules.md` § Testing & Debugging and in `bkit-install.test.ts` co-located convention. No durable testing-strategy learnings unique to this cycle that need promoting here.
- [x] `docs/observability.md` — Out of scope. bkit logs to stdout/stderr with `[bkit-install]` / `[bkit-check]` / `[bkit] DEPRECATED:` prefixes; no log drains, no PII, convention preserved.
- [x] `docs/security.md` — Reviewed. `BKIT_READ_TOKEN` PAT setup is already documented in `README.md` § Consumer CI auth (Task 8.1) and the auth-shim scope-narrowing (MED-3 fix to `cbartens/bkit/` only) is captured in build-summary + decisions. No additional security-doc entry needed.
- [x] `docs/data-schema.md` — N/A (bkit is a CLI tool, no DB).
- [x] `.agents/docs.md` — No new docs introduced in this cycle (only existing docs updated). Workflow Matrix + Full Catalog unchanged.
- [x] `.agents/README.md` — Already rewritten in build phase (Task 8.2) to document 3-tier ownership + module-flag CLI + new template-write table.
- [x] `README.md` — Already rewritten in build phase (Task 8.1) — module-flag examples, deprecation stubs, `## Consumer CI auth` PAT setup section.

## Learnings preserved (already captured pre-ship; no re-write needed)

| Source | Preserved in | Subject |
| --- | --- | --- |
| build-summary.md | DE-1 | 3-tier file-ownership model (Tier 1/2/3 semantics) |
| build-summary.md | DE-2 | Composable module-flag CLI (collapse `init`+`install`+`--host=`) |
| build-challenge-remediate.md | KN-1 | `runPayload` WriteSet threading breaks dry-run parity (architectural — copyAdditive vs runPayload write-order) |
| build-challenge-remediate.md (MED-4 fix) | KN-2 | `postDispatch` callback pattern for deferred finalisation (`.bkit-version` write-LAST) |
| build-summary.md, plan v4-3 § Out of Scope | pending.md | v0.2 deprecation removal (BAR-200), helper auth action (BAR-131), `--no-X`/`--force` flags, `package.json` automated merging, MED-8 architectural fix |
| build-summary.md | pending.md | `bkit-ship` should auto-derive tag from `jq -r .version package.json` |

## Surfaced for human / synthesizer review (sole-writer policy: cannot persist these here)

1. **Post-merge dev CI failure at `Setup pnpm` step.** The first CI run on `dev` after the squash-merge of `bar-130-ci-lint-scaffolding` failed at the `Setup pnpm` step (per ship-context note from orchestrator). Root cause not yet investigated. Candidate explanation: `pnpm/action-setup@v4` requires `packageManager` field in `package.json` (currently `pnpm@10.33.0`) AND/OR Node setup ordering (Setup pnpm BEFORE Setup Node so the cache works). Worth a `docs/knowledge.md` entry once root-caused, OR a `docs/pending.md` issue for follow-up if the fix is non-trivial. Recommendation: owning agent (debugger / synthesizer) should investigate via `gh run list --branch dev --limit 3` and append to one of:
   - `docs/knowledge.md` — if cause is a recognised gotcha (e.g. action ordering, `packageManager` field, Node version mismatch).
   - `docs/pending.md` — if the fix is non-trivial / blocks future ships and needs tracking.

2. **MED-8 architectural follow-up.** Already in `docs/pending.md`, but flagged here for visibility: cross-module dry-run parity gap requires merging `copyAdditive` and `runPayload` into a single idempotent pass. Not yet ticketed in Linear (BAR-200 is the v0.2 catch-all but MED-8 is architectural and may warrant its own ticket).

3. **Cosmetic plan-text deviations** (build-summary § Implementation Quality): `lint:prose` script uses `find`-based enumerator vs plan's literal `vale .agents/ "*.md"` form; `.prettierignore` adds `docs/` and `pnpm-lock.yaml`; `.prettierrc.json` introduced without explicit plan authorisation. All functionally equivalent / pragmatic. No remediation required, but worth noting in case the orchestrator/synthesizer wants to reconcile plan text with shipped artefacts before archive.

## Verification

- [x] `docs/completed.md` entry references `docs/plans/completed/202605/bar-130-ci-lint-scaffolding-plan*.md` paths (orchestrator-pending `mv`).
- [x] No commits made by this agent (orchestrator handles git per protocol).
- [x] No edits outside doc-update + this log file.
- [x] No edits to `status.json`.

<!-- verdict:end -->
