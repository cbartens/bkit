Verdict: SPLIT

<!-- verdict:end -->

# Plan Complexity Check

## Counts

- **Runbook tasks (T-prefixed):** 24 (T1.1–T1.11, T2.1–T2.7, T3.1, T4.1–T4.3)
- **Gates (🔒):** 4 (Gate 1 Prerequisites, Gate 2 Code Implementation, Gate 3 Testing & Documentation, Gate 4 Automated Verification)
- **Human decision points:** 5 (DECISION-A through DECISION-E, all locked in the plan; plus 2 human-confirmation checkboxes at Gate 1 that must be `[x]` before the agent proceeds)
- **Domain areas touched:**
  1. CI/GitHub Actions YAML (`.github/workflows/bkit-cloud.yml`, `.github/workflows/claude.yml`, both the canonical file and the template)
  2. CLI layer (`bkit-cli.ts` — new value-bearing flag, `--force` install path, usage rewrite)
  3. Module/manifest layer (`bkit-modules.ts` — `renderCloudWorkflow` Linear-branch deletion, `runCloudModule` split, advisory rewrites; `bkit-manifest.ts` — manifest split by variant)
  4. Install/check enforcement (`bkit-install.ts` — tracker-switch hard-block, cloud/tracker constraint; post-install consistency assertion)
  5. Postinstall advisories (`bkit-postinstall.ts` — three advisory builders, Linear coupling removal)
  6. Workflow prose (`.agents/workflows/bkit-build.md`, `bkit-debug.md`, `bkit-ship.md`, `bkit-cloud.md` — commit-marker additions, ordering fixes, gate rewiring)
  7. Hook templates (`.agents/templates/.claude/hooks/preflight.sh`, `.agents/templates/.cursor/hooks/preflight.sh` — label migration)
  8. Documentation (`cloud.md`, `trackers.md`, `deployments.md`, `decisions.md`, `knowledge.md`, `advisories.md`)
  9. Test suites (`bkit-modules.integration.test.ts`, `bkit-cli.test.ts`, `bkit-dry-run-parity.integration.test.ts`, `bkit-manifest.test.ts`, doctor integration test — many named-line deletions/additions)
  10. Cross-PR coupling (#184 shared HEAD-subject assertion — the T2.1 task cannot be resolved autonomously; its exact snippet shape must be coordinated with the #184 tracker issue before any Block 2 task proceeds)

## Session Fit Estimate

- **Task count:** 24 — exceeds the 15-task SINGLE threshold by 60 %.
- **Token estimate:** Reading the plan alone (538 lines, ~31 K tokens) plus every source file that must be read before editing (bkit-modules.ts is large; bkit-install.ts, bkit-cli.ts, bkit-manifest.ts, bkit-postinstall.ts, four workflow MDs, two YAML files, two preflight hooks, six doc files, five test files) will consume roughly 80–120 K tokens of context before a single edit is written. Writing the edits, running verification steps, and iterating on test failures adds another 60–100 K. Total estimated execution: 150–220 K tokens, well above the 100 K threshold.
- **Cross-file blast radius:** 20+ distinct files modified across five layers (YAML, TypeScript, workflow prose, hook shell scripts, docs). Many edits have named line-number dependencies that can silently drift between reads.
- **Hard dependency coupling:** T2.1 (Block 2 start) requires coordinating #184's exact assertion snippet from the GitHub tracker before any downstream Block 2–3 task can proceed. This introduces a blocking human/external-issue synchronisation point mid-session that cannot be batched away.

## Rationale

**Why SPLIT:**

The plan exceeds both the task-count limit (24 > 15) and the token ceiling (~180 K estimated vs ~100 K threshold). It also carries structural reasons that make single-session execution risky beyond just size:

1. **Task density per domain.** Block 1 alone has 11 tasks touching seven files in three layers (CLI, module/manifest, postinstall); Block 2 has 7 tasks spanning four workflow prose files plus two YAML files with ordering-sensitive commit-marker placement; Block 3 has 1 task but it depends on Block 2's SHARED-DERIV being finalised first; Block 4 has 3 tasks. Each block is independently coherent.

2. **The #184 hard dependency.** T2.1 cannot proceed until the exact shape of #184's shared HEAD-subject assertion is known. If #184 has not yet been planned/landed, Block 2–3 are blocked mid-session; if it has, its snippet must be read from the tracker before Block 2 starts. Either way, this is a natural seam.

3. **Two unconditional human confirmations at Gate 1** (Acceptance Scenario + Breaking Changes checkboxes). These are `[ ]` in the checked plan — if the session starts executing before they are confirmed, Gate 1 cannot be passed per the plan's own constraint. A session that begins at Block 1 T1.1 while Gate 1 is unconfirmed is invalid.

**Proposed sub-plan groupings (each fits one session):**

| Sub-plan                                                                               | Scope                                                                                                                                                                                                                          | Approx tasks                 |
| -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------- |
| **A — Human confirmations + prereqs**                                                  | Gate 1 human sign-off (Acceptance Scenario + Breaking Changes), #184 coordination (exact assertion snippet), preflight review                                                                                                  | 0 runbook tasks; human-gated |
| **B — Block 1: D1 + cloud split + enforcement + advisories**                           | T1.1–T1.11 (template/rendered YAML, renderCloudWorkflow, CLI flag, module/manifest split, bkit.cloud field, install constraints, advisory flip, check assertion, postinstall reconciliation, dry-run parity, advisories regen) | 11 tasks                     |
| **C — Block 2 + 3: #184 assertion + D2 skip-tags + two-tier CI gate + D3 concurrency** | T2.1–T2.7, T3.1 (depends on #184 shape known; depends on Block 1 YAML edits for the gate template)                                                                                                                             | 8 tasks                      |
| **D — Block 4 + verification pass**                                                    | T4.1–T4.3, full Vitest run, typecheck, render-parity, live install/upgrade dogfood, Gate 4 sign-off, documentation completion                                                                                                  | 3 tasks + verification       |

Sub-plan B is the largest at 11 tasks but stays under 15 and its token demand (reading ~10 TypeScript source files + editing them) is bounded below 100 K. Sub-plan C is the most coordination-sensitive; it must not start until sub-plan A delivers the #184 snippet and sub-plan B has landed its YAML edits.
