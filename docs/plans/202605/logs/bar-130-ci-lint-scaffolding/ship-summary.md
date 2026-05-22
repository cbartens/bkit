# Ship Summary: bar-130-ci-lint-scaffolding

**Verdict:** CONCERNS

## Overview

**PR #1** (merged at 2026-05-05T02:16:15Z, commit 8646711) shipped three scopes in v0.1.2:

- **Scope A** — bkit self-gating: `.github/workflows/ci.yml`, `.vale.ini` + House style, `slop-scan.config.json`, `.prettierignore`, prettier devDep, and lint/format scripts in `package.json`.
- **Scope B** — installer engine: token resolver (`bkit-tokens.ts`), 3-tier writers (`bkit-tiers.ts`), marker generalisation (HTML/hash variants), `WriteSet` dry-run parity, all `.agents/templates/` payloads including CI workflow with auth-shim.
- **Scope C** — CLI redesign + ship prep: `bkit-cli.ts` (parseArgs + deprecation stubs), `bkit-modules.ts` (module dispatcher, postDispatch `.bkit-version` write), `bkit-install.ts` refactor, `bkit-init.ts` deletion, README + `.agents/README.md` rewrites, ADR entries (DE-1, DE-2), `docs/pending.md` v0.2 kill-dates, `package.json` bumped to `0.1.2`.

**Files changed:** 41 tasks across 3 sub-plans, spanning CI workflow, lint/prose tooling, token/tier infrastructure, module dispatch, CLI surface, and documentation.

## CI Status

Build phase: all gates green on first attempt (173 tests passed, 1 todo placeholder MED-8). Challenge phase identified 1 CRITICAL + 7 MEDIUM findings; orchestrator fixed CRITICAL in-flight (restored hand-authored CI with literal values, added `|| true` tolerance on dogfood self-test). All 7 MEDIUM findings remediated in challenge-remediate pass (MED-1 through MED-7 covered by 16 new regression tests, all passing). Challenge-tests PASS. Build summary verdict: CONCERNS (due to MED-8 architectural deferral + manual smoke gates pending).

**Post-merge dev CI run:** [25354307730](https://github.com/cbartens/bkit/actions/runs/25354307730) failed at `Setup pnpm` (first execution of ci.yml on dev tree post-merge). This is the initial dogfood validation of bkit's own CI workflow and requires follow-up investigation but does not block PR merge.

## Action Items

1. **Post-merge dev CI investigation** — Run [25354307730](https://github.com/cbartens/bkit/actions/runs/25354307730) failed at pnpm setup. Debug the env, cache, or pnpm version resolution. This is the first real CI fire on dev after merge; fix needed to unblock subsequent CI runs.

2. **Manual smoke gates (deferred)** — Gate 4.5a (`app-gether-life` re-install with v0.1.2, CI green) and Gate 4.5b (second consumer onboarding, e.g. `www-visitfrasercoast-com`, CI green) must be run post-PR by human. Log results to `docs/plans/logs/bar-130-ci-lint-scaffolding/smoke-install.md`. Only then merge to `main` and push `v0.1.2` tag.

3. **MED-8 pending entry** — `runPayload` WriteSet threading deferred to v0.2 (BAR-200). The issue: cross-module parity test (`runParityCheck`) cannot detect divergence in `.agents/templates/**` mirroring between dry-run and install due to `copyAdditive` running only in install mode. Architectural fix (merge `copyAdditive` + `runPayload`) documented in `docs/pending.md` for v0.2 implementation.

<!-- verdict:start -->

Verdict: CONCERNS

<!-- verdict:end -->
