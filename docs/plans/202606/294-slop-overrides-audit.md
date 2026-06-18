# 294 — slop-scan overrides audit & slim

> Applies the generalised slop-overrides audit procedure (issue #294 body) to the bkit repo.
> Goal: shrink the suppression surface by **fixing/deleting underlying code**, never by adding
> suppressions. Run isolated in worktree `294-slop-audit` off `dev` (the branch CI gates on).

## Headline

| Scan                                                   | Findings | Repo score |
| ------------------------------------------------------ | -------- | ---------- |
| Baseline (config ON = what CI gates on)                | 12       | 39.00      |
| Stripped (all overrides + suppressive ignores removed) | 27       | 109.13     |
| **Suppressed by overrides/ignores**                    | **15**   | **70.13**  |
| After slim                                             | 12       | 39.00      |

**Slim result:** suppression entries **9 -> 6** across **6 -> 5** override blocks; gated count and
score unchanged (`slop:delta` vs `dev` = net 0, added 0 / resolved 0 / worsened 0). Two were removed
by **code fix / staleness**, two by **dropping vacuous keys**, and one broad exemption was
**narrowed** from all test files to the single file that needs it. The remaining suppressions hide
no concrete bug; three are architectural and flagged for sign-off below.

## What changed (this branch)

| Action                                                                                                                                                                                          | Override touched               | Kind             |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ | ---------------- |
| Removed stale block — both `*.bkit-slop-type-suppression.mjs` copies are scanned and clean (only `as any`/`as unknown as` hits are doc **comments** the rule ignores)                           | B (`.mjs` type-suppression)    | DELETE (stale)   |
| **Fixed** test-teardown empty catch: `try{ unlinkSync }catch{}` -> `fs.rmSync(p,{force:true})` (force ignores ENOENT; no catch needed). Override no longer required                             | F (gateguard test empty-catch) | **FIX**          |
| Dropped vacuous key — **0** test files trigger duplicate-function-signatures even when stripped                                                                                                 | A (test glob)                  | DELETE (vacuous) |
| Narrowed `boundary/type-suppression` from `**/*.test.*` to the one fixture file that needs it (`bkit-slop-type-suppression.integration.test.ts`); accidental casts in any other test now caught | A -> precise block             | TIGHTEN          |

Net: `slop-scan.config.json` overrides 6 -> 5 blocks (9 -> 6 rule-suppressions); 1 test file fixed
in code; the broad test-cast exemption is now single-file.

## Remaining overrides — verdict

<!-- prettier-ignore -->
| # | Files | Disabled rule | Suppresses | Verdict |
| --- | --- | --- | --- | --- |
| A | `**/*.test.*` `**/*.spec.*` | tests.duplicate-mock-setup | 6x duplicate `vi.spyOn().mockImplementation()` setup | KEEP |
| A' | `bkit-slop-type-suppression.integration.test.ts` | boundary/type-suppression | 1x — deliberate fixture strings the plugin's own test feeds in | KEEP |
| C | `.bkit/src` `.bkit/src/**` | structure.directory-fanout-hotspot | 1x — `.bkit/src` 59 files | KEEP* |
| D | opencode `gateguard.js` (template + mirror) | defensive.empty-catch + duplicate-function-signatures | 2x empty-catch + 2x dup-fn-sig | KEEP* |
| E | claude `gateguard.cjs` (template + mirror) | duplicate-function-signatures | 2x dup-fn-sig | KEEP* |

`*` = architectural; see "Flagged for sign-off".

## KEEP rationale

- **A — duplicate mock setup.** Shared `vi.spyOn().mockImplementation()` across 6 test files is the
  canonical Vitest pattern. Extracting a shared helper couples test isolation; the procedure lists
  duplicate mock-setup as an almost-always-KEEP. No concrete bug.
- **A' — fixture casts.** The exempt file is the integration test for the type-suppression plugin
  itself; its `as any` / `@ts-ignore` strings are **inputs** that verify detection. Not real
  suppressions. Now scoped to that one file.
- **D — gcOldState empty catch (load-bearing).** The catch is **not** mere best-effort. `gcOldState()`
  is called immediately before the deny-mode `throw new Error(context)` in the hook; the outer hook
  catch fails **open** on any non-`[bkit GateGuard]` error. If GC threw (e.g. a stat/unlink race), it
  would pre-empt the deny throw and silently convert a **block into a fail-open allow**. The
  swallow-all guarantees GC never throws -> deny-mode stays correct, and per-file errors don't abort
  the sweep. Probed alternatives both fail: a logged catch trips `defensive.error-swallowing`
  instead (no net win), and a throwaway statement degrades the code. Genuine KEEP.
- **D / E — cross-provider duplicate signatures.** `isGateConfig`, `readState`, `markWarned`,
  `stateFile`, `investigationChecklist`, `configAdvisory` are duplicated across the Claude `.cjs`
  hook and the opencode `.js` plugin. These ship to consumers as **standalone** files (bkit is not a
  consumer runtime dependency), so neither can `import` shared logic. Framework-required by the
  distribution model. No concrete bug.

## Flagged for sign-off (architectural — not done as a lint side-effect)

`rules.md` and the procedure both prohibit clearing structural findings by delete/move/merge or
rewiring as a lint side effect; these need an explicit decision:

1. **`.bkit/src` directory fanout (Override C).** 59 files in one dir (testFileRatio 0.71). Clearing
   it means splitting the install-engine into sub-packages — a layout change. Recommendation: **KEEP**
   the flat layout (intentional, stack-independent); the override is honest.
2. **Cross-provider gateguard duplication (Overrides D/E dup-fn-sig).** Removing it means rendering
   both hooks from a single shared source at install time (a build-system change) or obfuscating the
   tiny helpers to dodge the rule (degrades). Recommendation: **KEEP**; revisit only if a shared
   render layer is built for other reasons.

## Honest residual (already visible / ungated)

12 gated findings the repo already shows as accepted residual — left visible, not suppressed; below
the net-delta gate and outside this audit's scope (the baseline is never fixed on the way out):

- 6x `defensive.error-obscuring` (`server.cjs`, `render-graphs.js`, `bkit-install.ts`,
  `bkit-postinstall.ts`, `bkit-preflight.ts`, `bkit-tiers.ts`)
- 4x `defensive.empty-catch` (`bkit-challenge-tests-160.test.ts`, `bkit-modules.test.ts`,
  `bkit-modules.ts`, `linear-to-github-import.ts`)
- 1x `defensive.error-swallowing` (`bkit-uninstall.ts`)
- 1x `structure.pass-through-wrappers` (`bkit-status.ts`)

## Reproduce

```sh
git worktree add -b 294-slop-audit .worktrees/294-slop-audit dev && cd .worktrees/294-slop-audit
SLOP=../../node_modules/.bin/slop-scan
"$SLOP" scan . --json > tmp/base.json            # baseline (config ON)
# strip: ignores=build-artifacts only, overrides=[], all rules ON -> tmp/stripped.json
# reconcile: findings in stripped but NOT baseline == suppressed; triage each by reading the site
```

Full procedure: issue #294 body. Scope discipline: fix code, never add a suppression.
