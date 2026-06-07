Verdict: SPLIT

<!-- verdict:end -->

# Plan Complexity Check

## Counts

**Tasks:** 30 WS-tagged tasks (WS1-T1..T9 = 9; WS2-T1..T6 = 6; WS3-T1..T4 = 4; WS4-T1..T5 = 5; WS5-T0,T1,T2,T2b,T3,T4 = 6). Plus 5 mandatory testing/docs tasks and 5 manual-verification steps.

**Gates:** 8 gate checkpoints (Gate 1 prerequisites; Gate 2 per-workstream x5; Gate 3 testing+docs; Gate 4 automated verification).

**Domain areas covered (6):**

1. TypeScript source — new codec (`bkit-telemetry.ts`), grader (`bkit-comply.ts`), path-policy (`bkit-paths-policy.ts`), harvest CLI (`bkit harvest`), analysis CLI (`bkit analysis`), migration CLI (`bkit telemetry migrate`), CLI dispatch extension (`bkit-cli.ts`), generated committed `.cjs` + drift test.
2. Shell/bats — counter bus helpers (`counter_init`/`inc`/`get`/`reset`/`check_max`/`decide_next`), `MAX_*` config, `counter-bus.bats`, `telemetry-failopen.bats`.
3. Workflow markdown — inline-jq close-step writers added to all 5 `bkit-{design,plan,build,debug,ship}.md` files; prose-to-shell counter migration across 4 workflow files; CAUTION header sweeps.
4. Config and git surface — `.gitattributes` (4 + 2 scoped `merge=union` lines); `slop-scan.config.json` ignores; `docs/telemetry.md` catalog; `.agents/rules.md`; `.agents/docs.md`; `docs/architecture.md`; `docs/testing.md`; `docs/observability.md`.
5. Data files and ledger migration — 4 seeded-empty `.jsonl` files (WS-1); destructive `.md` delete + row-count parity migration for `friction.md`/`pending.md` (WS-1); parity-gated destructive migration for `knowledge.md`/`decisions.md` with packed-tarball dogfood validation (WS-5).
6. Vitest boundary integration tests — git `check-attr`, real `git diff`, filesystem consumer-repo mtime, packed-tarball install, bkit upgrade isolation, real-corpus migration (bkit's own `knowledge.md`/`decisions.md`).

## Session Fit Estimate

**Rough token estimate:** Each WS tasks requires reading existing files (codec shape, workflow writers, CLI structure) + writing TS source, tests, and workflow edits + running verification checks. Conservative per-task estimate:

- WS-1 (9 tasks, heaviest — codec + 5 workflow files + 8 test files + config surface): ~30K tokens
- WS-2 (6 tasks — grader, paths-policy, generated .cjs, CLI extension, gate wiring + integration test): ~20K tokens
- WS-3 (4 tasks — reconcile dev change, counter bus bats, staged prose migration across 4 workflows, invariant test): ~18K tokens
- WS-4 (5 tasks — harvest CLI + 2 test files, analysis CLI, rollup writer, ship-chain wiring, agent delete + CLI plumbing): ~20K tokens
- WS-5 (6 tasks — 2 new jsonl files, KN-8 guard, destructive migrate CLI + 4 integration test scenarios, real-corpus + tarball dogfood, hand-run): ~22K tokens
- Overhead (mandatory testing/docs rows, verification plan, gate checks): ~10K tokens

**Total estimated: ~120K tokens**, which exceeds the 100K threshold even under optimistic assumptions. The plan also has 30 WS tasks vs the 15-task SINGLE ceiling.

## Rationale

This plan MUST be split. Two independent signals both exceed the SINGLE threshold:

1. **Task count (30 > 15):** The 30 WS-tagged tasks span 5 workstreams, 6 new TypeScript source files, 2 new bats test files, 10+ new Vitest test files (unit + boundary integration), 5 workflow file modifications, 6 config/doc files, and a destructive data migration. Even discarding support tasks, the raw WS count is double the SINGLE ceiling.

2. **Token estimate (~120K > 100K):** WS-1 alone (codec, 5 workflow write sites, 8 test-matrix unit rows, 3 boundary integration tests, 6 config/doc touchpoints) is a 30K-token session. WS-3's staged counter migration requires reading and rewriting 4 workflow files while reconciling a pre-existing dev branch change. WS-5's destructive migration involves real-corpus validation + packed-tarball dogfood + a mechanical upgrade-isolation boundary test — each requiring multi-round read+write+verify cycles.

**Proposed partition by workstream (each sub-plan fits one session):**

- **Sub-plan A (WS-1 only):** Codec + tests + data files + `.gitattributes`/slop + ledger cutover (friction/pending) + close-step writers (all 5 workflows) + run-outcome writer + summary read + rules/telemetry.md/docs-index. This is the root substrate; all other workstreams gate on it. Estimated ~30K tokens — fits SINGLE.

- **Sub-plan B (WS-2 only, after WS-1 ships):** Entrypoint/namespace decision (WS2-T1), path-policy + generated `.cjs` + drift test, grader pure functions + unit test, git-diff integration test, `comply` CLI extension, close-gate wiring + fail-open bats. Estimated ~20K tokens — fits SINGLE.

- **Sub-plan C (WS-3 only, after WS-1 ships, concurrent with B):** dev-branch reconciliation note, counter bus helpers + per-mode bats coverage, staged prose-to-shell migration (build then debug then plan/design), invariant test. Estimated ~18K tokens — fits SINGLE.

- **Sub-plan D (WS-4 only, after WS-1+WS-2+WS-3 ship):** Harvest CLI + copy-only boundary test, harvest dedup unit test, analysis CLI + regression + per-rule compliance rate, ship-chain rollup + rollup writer, harvest/analysis CLI plumbing + friction-agent DELETE. Estimated ~20K tokens — fits SINGLE.

- **Sub-plan E (WS-5 only, after WS-1 ships + WS2-T1 recorded):** knowledge/decisions `.jsonl` files + exemptions, KN-8 guard decision note, destructive migrate CLI + parity gate + lookup table, upgrade-isolation boundary test, real-corpus + tarball validation, hand-run dogfood on bkit repo. Estimated ~22K tokens — fits SINGLE.
