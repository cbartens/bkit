Verdict: CONCERNS
Failures: 0

<!-- verdict:end -->

# Plan Verification

## Scope

Single — sub-plan 2 only (`docs/plans/completed/202605/bar-138-gh-packages-distribution-plan-2.md`).

## Gaps Identified

None blocking. Open items are explicitly human-gated (not implementation gaps):

1. Task C4 / C5 — registry install + smoke transcript at `docs/plans/logs/bar-138/smoke-pre.2.txt`. Requires real `GH_BKIT_TOKEN` with `read:packages` scope; agent shell does not carry that scope. Infrastructure (Task C3) is in place at `tmp/bar-138-smoke/` with conformant `.npmrc` and `package.json`. Plan acknowledges these as human-gated.
2. Tasks D2, D3, D4, D5 — squash merge, dev->main promotion, v0.4.0 tag, BAR-131 #2 resolution. All require explicit human approval per repo rules (squash merge by reviewer; main promotion needs explicit human approval; Linear write-status needs human Linear MCP access). PR #3 (Task D1) is opened and CI triggered.

Note on plan checkbox state: tasks B8-B15, C3, D1 ticked `[x]` based on verified codebase evidence. Tasks C4, C5, D2, D3, D4, D5 left `[ ]` because their acceptance criteria require artefacts not produced inside the agent's authority surface (registry install transcript, squash-merge SHA on dev, main promotion, v0.4.0 tag, Linear status flip).

## Sub-Plans Verified

N/A (Single scope).

## Integration Gaps

N/A.

## Previously Attempted

N/A — first verification attempt for sub-plan 2.

## Notes

Verification evidence per task:

- B8 README rewrite — `README.md` lines 7-96 verified: `pnpm add -D @cbartens/bkit@^0.4.0` present (line 10); no `github:cbartens/bkit` install fragments in install section; pnpm 10 allowlist section deleted; Consumer CI auth section (lines 38-68) carries PAT scope `read:packages`, GHA secret name `GH_BKIT_TOKEN`, `.npmrc` snippet, install step `env:` block, pnpm silent-ignore footgun warning; Consumer Vercel auth section (lines 70-94) is env-var-only with explicit `installCommand` git-shim removal block (lines 83-90); v0.4.0 breaking-changes note line 96.
- B9 .agents/README rewrite — Distribution section (lines 114-129) describes scoped-package distribution via GH Packages registry; legacy "not published to the npm registry" / "git dependency from `github.com/cbartens/bkit`" sentences removed; pnpm 10 allowlist subsection deleted; Install / regenerate prose (line 135) uses `pnpm add -D @cbartens/bkit@^0.4.0`.
- B10 ADR DE-3 — `docs/decisions.md` lines 34-42: `## DE-3: bkit Distribution via GitHub Packages npm Registry (2026-05-06)` with all required fields (Category, Status, Decision, Why, Discarded enumerating 5 alternatives, Source, Related referencing BAR-138, BAR-130, design doc, package.json, release.yml, KN-1).
- B11 pending.md — `docs/pending.md` lines 33-49+: two `## Consumer migration to @cbartens/bkit registry path` entries for `app-gether-life` and `www-visitfrasercoast-com` with required fields populated.
- B11.5 KN-1 — `docs/knowledge.md` lines 35-45: `## KN-1: pnpm v7.20+ silently ignores entire `.npmrc`when`${VAR}` env-var is unset (2026-05-06)` with Symptom / Root cause / Fix / Type / Confidence / Severity / Source / Related fields populated. Body text matches plan spec (silently ignores entire `.npmrc`, falls back to npmjs.org, opaque 401).
- B12 dist rebuild — execute log captures `pnpm check:dist` exit non-zero pre-stage and exit zero post-stage. `package.json#scripts.check:dist` (line 34) implements the expected staleness gate. Final commit on branch (`2fb96ca` per execute log) bundled dist with sources.
- B13 full local check suite — execute log records typecheck, test (221 passed), format:check, lint:prose (0 errors), lint:slop, check:dist all green.
- B14 version bump + tag — `package.json#version` = `0.4.0-pre.2` (line 3). Execute log references commit 2fb96ca pushed and tag `v0.4.0-pre.2` pushed.
- B15 GATE — execute log notes release.yml run 25409836293 green with `+ @cbartens/bkit@0.4.0-pre.2` in publish log.
- C3 scratch consumer infra — `tmp/bar-138-smoke/.npmrc` carries the two required lines (`@cbartens:registry=https://npm.pkg.github.com`, `//npm.pkg.github.com/:_authToken=${GH_BKIT_TOKEN}`); `tmp/bar-138-smoke/package.json` is valid (name, version, private, packageManager pnpm@10.33.0); `.gitignore` line 37 confirms `tmp/**` is gitignored.
- C4 / C5 — gated on registry install with a real PAT; transcripts not yet at `docs/plans/logs/bar-138/smoke-pre.2.txt`. Infrastructure verified.
- D1 PR open — execute log references PR #3 https://github.com/cbartens/bkit/pull/3 with CI triggered.
- D2-D5 — human action; plan checkboxes intentionally left `[ ]`.

Verdict CONCERNS (not FAIL) because every implementation-side deliverable in sub-plan 2 is present and verifiable; the unfinished items are explicitly human-gated steps (registry install with real PAT, squash merge, main promotion, v0.4.0 tag, Linear status flip) which the parent plan and the execute log already characterise as awaiting human action. None of these gaps are remediable by another agent build pass; they are blocked on human credentials / approvals.
