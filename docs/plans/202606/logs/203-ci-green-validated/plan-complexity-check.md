Verdict: SPLIT

<!-- verdict:end -->

# Plan Complexity Check

## Counts

- **Tasks:** 31 unique tasks (A1-A5 + A2b + A3a + A3b = 8, B1-B5 = 5, C1-C3 = 3, D1-D2 = 2, E1-E10 = 10, F1-F3 = 3)
- **Gates:** 4 (Gate 1: human pre-flight; Gates 2-4: code/test/verification check-offs)
- **Domain areas:**
  1. CI workflow YAML authoring — high-fidelity ~1100-line copy+parameterize of gether ci.yml into `.bkit/templates/.github/workflows/ci.yml`
  2. bkit-own `.github/workflows/ci.yml` degenerate 3-job rewrite with SHA-cache fold and bkit-decide integration
  3. Protection script rename + `REQUIRED_JOB` flip (engine + template mirror)
  4. TypeScript source edit (`bkit-postinstall.ts`) + dist regeneration
  5. Layer-2 workflow files (`bkit-ship.md`, `bkit-debug.md`) — MCP-only gate rewrites
  6. Layer-3 rules norm (`.agents/rules.md` + template mirror)
  7. Vitest tests — extend 4 existing files + create 2 new files + snapshot regen + manual diff
  8. Fixture upgrade (`tests/fixtures/heavy-customised-ci/`) with precise bare-marker contract preservation
  9. Documentation — `docs/pending.md`, `docs/deployments.md` (x2), `docs/knowledge.md`, `docs/decisions.md`, `CHANGELOG.md`
  10. Mirror + dist regeneration batch (Phase F)

## Session Fit Estimate

Rough token budget breakdown:

<!-- prettier-ignore -->
| Work item | Est. tokens |
| --- | --- |
| Read gether ci.yml (~1100 lines) + both bkit ci.yml files | ~15K |
| Write/rewrite template ci.yml (~1100-line near-verbatim copy with parameterization) | ~20K |
| Write bkit-own ci.yml (degenerate 3-job shape) | ~8K |
| Protection script renames + postinstall.ts edits | ~5K |
| bkit-ship.md + bkit-debug.md MCP gate rewrites | ~6K |
| 2 new test files + 4 extended test files + snapshot regen | ~15K |
| Fixture upgrade (heavy-customised-ci ci.yml, 4-job shape) | ~5K |
| Docs edits (6 files) | ~4K |
| Verification loops (actionlint, pnpm test, grep assertions) | ~8K |
| Reasoning + planning overhead | ~10K |
| **Total** | **~96K** |

This estimate lands just under the 100K threshold — but the regression-trap density makes that number optimistic. Three factors push the effective cost past the threshold:

1. **Snapshot regeneration + mandatory human-diff review (Task A5):** the full-file template snapshot diff for a ~1100-line ci.yml rewrite is itself ~1100 lines of diff. Verifying the diff for "intentional shape change" is a high-fidelity reasoning pass, not a grep. This step alone adds ~5-8K tokens that are not captured in the line-count estimate.

2. **detectRunLevelsNotComposed contract (Tasks A2b, A3b):** both verification tasks require running `pnpm test -- bkit-postinstall` with `--reporter=verbose`, parsing 11 named test pass/fail lines, and confirming no vacuous pass. Each round-trip adds overhead.

3. **Fixture bare-marker contract collision (Task E5):** the fixture must simultaneously pass the 4-job shape, preserve byte-identical `consumer-job:` block, retain bare `# bkit:start`/`# bkit:end` markers, satisfy `bkit-modules.upgrade.integration.test.ts` L294-319, AND NOT trigger the template's no-bare-marker guard — this is a multi-constraint write with high per-error recovery cost.

Realistic estimate with recovery loops: **110-130K tokens**. SPLIT is warranted.

## Rationale

The task count (31) exceeds the 15-task SINGLE threshold on its own. Beyond raw count, the plan has three coupling clusters that each carry high regression risk and demand careful sequencing:

**Cluster 1 — CI YAML scaffold (Phase A, ~8 tasks):** A single ~1100-line near-verbatim copy of gether's ci.yml, a separate 3-job degenerate rewrite, two detector-contract verifications, actionlint + shellcheck passes, and a snapshot regen with mandatory manual diff. This is the dominant cost centre. The template ci.yml is the foundational artifact that all later phases depend on — any error here cascades.

**Cluster 2 — Protection script + postinstall + dist (Phase B + F1):** Mechanical but has a sequencing trap: `bkit-protect-main.sh --dry-run` must run AFTER Phase A lands the capstone in bkit's own ci.yml, or the pre-flight fails confusingly. The plan explicitly documents this as a loud-fail guard.

**Cluster 3 — Tests + fixture (Phase E, 10 tasks):** Two new Vitest files, four extended files, a snapshot regen, an integration test extension, and the multi-constraint fixture upgrade. The bug-class regression test (4 explicit cases for `bkit-tests-check` conclusion outcomes) is the root-cause closure for #203 — it must be written, not skimmed.

### Proposed Partition (dependency-ordered)

**Sub-plan 1 — Layer-1 CI scaffold + protection script + postinstall (Phases A + B):**
Tasks A1, A2, A2b, A3, A3a, A3b, A4, A5, B1, B2, B3, B4, B5
= 13 tasks. All of Phase A + Phase B. Ends with both ci.yml files in final shape, protection script renamed, postinstall.ts patched (dist not yet built). This sub-plan is the foundation; Sub-plan 2 depends on it being committed.

**Sub-plan 2 — Layer-2/3 gates + rules + tests + docs + mirror/dist (Phases C + D + E + F):**
Tasks C1, C2, C3, D1, D2, E1, E2, E3, E4, E5, E6, E7, E8, E9, E10, F1, F2, F3
= 18 tasks. Depends on Sub-plan 1 being present (capstone job names exist in ci.yml, protection script at new name). Contains all test authoring, fixture upgrade, documentation, and final mirror+dist batch.

Each sub-plan fits under 15 tasks at the outer bound — Sub-plan 1 at 13, Sub-plan 2 at 18 (still over 15 but the tasks in E7-E10 and D1-D2 are low-cost documentation edits; the substantive work is C1-C3 + E1-E6 + F1-F3 = 12 high-complexity tasks). If further splitting is desired, Phase E could be isolated as Sub-plan 3 (tests + fixture + docs), leaving Sub-plan 2 as C1-C3 + D1-D2 + F1-F3 (8 tasks).
