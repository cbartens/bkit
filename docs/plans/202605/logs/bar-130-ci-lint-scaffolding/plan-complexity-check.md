Verdict: SPLIT

<!-- verdict:end -->

# Plan Complexity Check

## Counts

- **Tasks:** 38 discrete tasks across 11 phases (Phases 0–10 + Gate tasks)
- **Gates:** 5 (Gate 1 — prerequisites, Gate 2 — implementation, Gate 3 — docs, Gate 4 — automated verification, Gate 4.5 — manual smoke; two sub-gates 4.5a and 4.5b require human sign-off)
- **Domain areas:** 4
  - Installer/scripting (TypeScript CLI modules, tier writers, token resolver)
  - CI/infra (bkit self-gating `ci.yml`, consumer template)
  - Test surface (~33 new tests across 5 new test files + extensions to existing `bkit-install.test.ts`)
  - Documentation (README, `.agents/README.md`, `docs/decisions.md`, `docs/pending.md`)
- **New files to create:**
  - 4 new source modules (`bkit-tokens.ts`, `bkit-tiers.ts`, `bkit-cli.ts`, `bkit-modules.ts`)
  - 5 new test files (`bkit-tokens.test.ts`, `bkit-tiers.test.ts`, `bkit-cli.test.ts`, `bkit-modules.integration.test.ts`, `bkit-dry-run-parity.integration.test.ts`)
  - ~9 template payload files (ci.yml, .vale.ini, House/ style rules, slop-scan.config.json, .prettierignore, .husky/pre-commit, .husky/pre-push, .cursor/hooks.json, .cursor/settings.json)
  - 2 bkit-self CI/lint files (.github/workflows/ci.yml, .vale.ini + House/ tree)
- **Deletions/refactors:** 1 file delete (`bkit-init.ts`), full refactor of `bkit-install.ts` `main()`, generalisation of 4 parser functions with new `markerStyle` arg and full call-site audit
- **Manual gates:** Gate 4.5a (`app-gether-life` smoke) + Gate 4.5b (second consumer onboarding) — both require a separate human session

## Session Fit Estimate

Rough token budget breakdown for a build agent executing the plan top-to-bottom:

<!-- prettier-ignore -->
| Area | Estimated tokens |
| --- | --- |
| Phase 0 — branch verify + 5 stub test files | ~4K |
| Phase 1 — token resolver: 3 tasks, 6 tests, 1 new module | ~10K |
| Phase 2 — marker generalisation: 4 tasks, call-site audit, tier writers, ~9 tests | ~20K |
| Phase 3 — CLI redesign: 3 tasks, 7 tests, new module | ~10K |
| Phase 4 — module dispatcher: 6 tasks (incl. sub-steps), integration tests, delete bkit-init.ts, grep audits | ~22K |
| Phase 5 — dry-run parity: 3 tasks, root-cause investigation + 7 tests | ~15K |
| Phase 6 — 9 template payloads + 2 extra integration tests | ~14K |
| Phase 7 — self-gating CI + Vale + slop + prettier scripts | ~8K |
| Phase 8 — README + .agents/README rewrites | ~7K |
| Phase 9 — decisions.md + pending.md appends | ~3K |
| Phase 10 — version bump, pre-PR gate run, smoke-install log, ship handoff audit | ~6K |
| Gate verification steps throughout | ~5K |
| **Total** | **~124K** |

The estimate is conservative. Phases 2 and 4 alone — which involve reading `bkit-install.ts` (large existing file), a full call-site grep audit across multiple files, root-cause investigation for an existing bug, and writing then verifying ~15 tests — are individually within the 25–30K range. Combined with the template-file authoring in Phase 6 and the README rewrites in Phase 8, the plan substantially exceeds the 100K single-session threshold.

The plan itself acknowledges this in the warning block at line 37: _"Single-session ship is unrealistic."_

## Rationale

**Verdict: SPLIT** — estimated ~124K agent tokens, exceeding the 100K ceiling by ~24K. The plan's three natural scope boundaries (A/B/C) map cleanly to sub-plans. Recommended partition:

---

### Sub-plan BAR-130-A: bkit-the-repo self-gating (Phase 7 + Phase 9 partial)

**Fits one session (~25K).** Purely additive: no existing code changed.

- Task 7.1 — `.github/workflows/ci.yml` for bkit itself
- Task 7.2 — `.vale.ini` + `.vale/styles/House/` for bkit
- Task 7.3 — `slop-scan.config.json` + `.prettierignore` for bkit
- Task 7.4 — `prettier` devDep + `package.json` lint/format scripts
- Task 9.1 partial — `docs/decisions.md` entry for CI scope
- Task 10.2 partial — run pre-PR gate (only the subset of scripts that exist after this sub-plan)

**Must precede:** BAR-130-B/C (CI gates must be live before the installer produces templates that reference them; also unblocks local `pnpm lint:prose` / `pnpm format:check` that B/C builds depend on).

---

### Sub-plan BAR-130-B: Installer core (Phases 0–2, Phase 5, Phase 6 templates)

**Fits one session (~60K — largest sub-plan, but scoped).** Core infrastructure work.

- Phase 0 — branch confirm + test stub scaffolding
- Phase 1 — `bkit-tokens.ts` + 6 tests (token resolver)
- Phase 2 — marker generalisation (`findLineAnchoredMarkers` + call-site audit) + `bkit-tiers.ts` + ~9 tests
- Phase 5 — dry-run parity investigation + `WriteSet` accumulator + ~7 tests
- Phase 6 — all 9 template payload files + 2 integration tests (6.1 auth-shim assertion, 6.1b substitution end-to-end)

**Must precede:** BAR-130-C (CLI dispatcher imports token resolver + tier writers; module integration tests depend on templates being in place).

**Risk areas:** Phase 2 call-site audit is the highest-thrash risk — `bkit-install.ts` is large, grep must hit all 4 functions across all files, and backward-compat regression must stay green. Phase 5 root-cause investigation is open-ended by design (the plan explicitly forbids pre-assuming the fix location).

---

### Sub-plan BAR-130-C: CLI redesign + module dispatcher + docs + ship prep (Phases 3–4, 8–10)

**Fits one session (~45K).** Builds on B's new modules.

- Phase 3 — `bkit-cli.ts` + 7 CLI tests (verbs, module flags, deprecation stubs)
- Phase 4 — `bkit-modules.ts` + 6 integration tests (dispatch, idempotence, write-order, first-run logging) + `bkit-install.ts` `main()` refactor + `bkit-init.ts` deletion + grep audits
- Phase 8 — README + `.agents/README.md` rewrites (5-grep acceptance checklist)
- Phase 9 — `docs/decisions.md` CLI entry + `docs/pending.md` 5 kill-date rows (each with Linear issue ID)
- Phase 10 — version bump to `0.1.2`, full pre-PR gate, smoke-install log (Task 10.3), ship handoff audit (Task 10.4)
- Gate 4 — automated verification (all tests + typecheck + build + self-test)
- Gate 4.5 — manual smoke (human session: `app-gether-life` + second consumer)

**Dependency:** requires BAR-130-A (lint scripts must exist for `pnpm lint:prose` in Gate 4) and BAR-130-B (token resolver, tier writers, templates must exist for module functions to import).

**Risk areas:** Phase 4 sub-steps carry multiple grep-based dead-code verifications (`runHost` removal, `printUsage` removal) — if `bkit-install.ts` has unexpected coupling, thrash risk is moderate. Gate 4.5 manual smoke is human-gated and may require a separate handoff.

---

### Execution order

```
BAR-130-A → BAR-130-B → BAR-130-C
```

Each sub-plan ends in green tests + typecheck and constitutes a preservable checkpoint per the plan's own guidance (line 37).
