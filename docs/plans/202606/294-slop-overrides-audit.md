# 294 — slop-scan overrides audit & slim

> Applies the generalised slop-overrides audit procedure (issue #294 body) to the bkit repo.
> Method: surface every finding the committed config suppresses, triage each by **reading the
> site**, and slim the override list by **fixing/deleting underlying code** — never by adding
> suppressions. Run isolated in worktree `294-slop-audit` off `dev` (the branch CI gates on).

## Headline

| Scan | Findings | Repo score |
| --- | --- | --- |
| Baseline (config ON = what CI gates on) | 12 | 39.00 |
| Stripped (all overrides + suppressive ignores removed) | 27 | 109.13 |
| **Suppressed by overrides/ignores** | **15** | **70.13** |
| After slim (Override B removed) | 12 | 39.00 |

**Slim result:** overrides 6 -> 5. One stale/vacuous override removed; zero code change; gated
count and score unchanged (`slop:delta` net 0). The other five overrides are legitimate KEEPs —
nothing genuinely hides behind them. The list was already tight.

## Per-override verdict

<!-- prettier-ignore -->
| # | Files | Disabled rules | Suppresses | Verdict |
| --- | --- | --- | --- | --- |
| A | `**/*.test.*` `**/*.spec.*` | duplicate-function-signatures, tests.duplicate-mock-setup, boundary/type-suppression | 6x duplicate-mock-setup + 1x type-suppression (fixture strings) | **KEEP** |
| B | `**/bkit-slop-type-suppression.mjs` (src + template) | boundary/type-suppression | nothing (vacuous) | **DELETE (stale)** |
| C | `.bkit/src` `.bkit/src/**` | structure.directory-fanout-hotspot | 1x fanout (`.bkit/src`, 59 files) | **KEEP** |
| D | opencode `gateguard.js` (template + mirror) | defensive.empty-catch, duplicate-function-signatures | 2x empty-catch + 2x duplicate-fn-sig | **KEEP** |
| E | claude `gateguard.cjs` (template + mirror) | duplicate-function-signatures | 2x duplicate-fn-sig | **KEEP** |
| F | `bkit-gateguard-opencode.test.ts` | defensive.empty-catch | 1x empty-catch (test teardown) | **KEEP** |

## Slim action — Override B (DELETE, stale)

Override B disabled `boundary/type-suppression` for the two copies of the slop type-suppression
plugin source (`.bkit/scripts/bkit-slop-type-suppression.mjs` + its template mirror). Both files
ARE scanned (in the 71-file set); the only `as any` / `as unknown as` occurrences are in **comment
lines** documenting what the plugin detects, which the rule already ignores. The override therefore
suppresses **nothing** — re-enabling the rule on these files surfaces 0 findings and would catch a
future regression if the plugin ever introduced a real cast. Removed the block; re-scan confirms
gated count stays 12 / score 39, no net-new findings.

This is the only config edit allowed without separate sign-off under the procedure (removing an
entry that points at already-clean code). It strengthens the gate; it does not weaken it.

## KEEP rationale (5 remaining)

- **A — test patterns.** Shared `vi.spyOn().mockImplementation()` setup repeated across test files
  is the canonical Vitest pattern; the type-suppression hits are deliberate **fixture strings** the
  plugin's own integration test feeds in to verify detection. De-duping mock setup or deleting
  fixtures degrades the tests. No concrete bug hidden.
- **C — directory fanout.** `.bkit/src` (59 files, testFileRatio 0.71) is the flat install-engine
  layout (source + colocated tests). Clearing the finding means splitting the directory — a major
  structural refactor that needs human sign-off, and `rules.md` + the procedure both prohibit
  delete/move/merge as a lint side-effect. No concrete bug.
- **D / E — cross-provider mirror duplication.** The gate logic (`isGateConfig`, `readState`,
  `markWarned`, ...) is deliberately duplicated across providers (Claude `.cjs` vs opencode `.js`)
  and between each template source and its installed mirror. Each hook MUST be standalone (no shared
  imports across provider runtimes), so dedup is impossible without breaking the cross-provider /
  mirror architecture. Framework-required shape. No concrete bug.
- **D / F — best-effort empty catches.** `gcOldState` (opportunistic 24h GC of temp session-state
  files) and the test `afterEach` teardown both ignore per-file `fs` errors by design — if a file is
  already gone, skipping is correct. Adding a log here would be noise in fire-and-forget paths
  (procedure: do NOT turn an empty catch into a throwaway statement). No concrete bug hidden.

## Honest residual (already visible / ungated)

The repo already shows 12 gated findings as accepted residual — left visible, not suppressed:

- 6x `defensive.error-obscuring` (`server.cjs`, `render-graphs.js`, `bkit-install.ts`,
  `bkit-postinstall.ts`, `bkit-preflight.ts`, `bkit-tiers.ts`)
- 4x `defensive.empty-catch` (`bkit-challenge-tests-160.test.ts`, `bkit-modules.test.ts`,
  `bkit-modules.ts`, `linear-to-github-import.ts`)
- 1x `defensive.error-swallowing` (`bkit-uninstall.ts`)
- 1x `structure.pass-through-wrappers` (`bkit-status.ts`)

These are below the net-delta gate and outside this audit's scope (the gate blocks net-new only;
the baseline is never ours to fix on the way out). Flagged here for visibility, not action.

## Reproduce

```sh
git worktree add -b 294-slop-audit .worktrees/294-slop-audit dev && cd .worktrees/294-slop-audit
SLOP=../../node_modules/.bin/slop-scan
"$SLOP" scan . --json > tmp/base.json            # baseline (config ON)
# strip: ignores=build-artifacts only, overrides=[], all rules ON -> tmp/stripped.json
# reconcile: findings in stripped but NOT baseline == suppressed; triage each by reading the site
```

Full procedure: issue #294 body. Scope discipline: fix code, never add a suppression.
