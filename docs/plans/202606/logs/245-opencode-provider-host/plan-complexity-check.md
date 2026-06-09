Verdict: SPLIT

<!-- verdict:end -->

# Plan Complexity Check

## Counts

- **Tasks:** 13 explicit runbook tasks (Task 0.1 through Task 6.3) + 3 mandatory post-Gate-2 checklist items = **16 effective tasks**
- **Gates:** 5 (Gate 1 Prerequisites, Gate 1.5 Spike Verdict hard-gate, Gate 2 Code Implementation, Gate 3 Testing & Documentation, Gate 4 Automated Verification)
- **Domain areas covered:**
  1. Installer engine TypeScript (bkit-install.ts transforms, parseModelLookup generalisation)
  2. Module/manifest system (bkit-modules.ts, bkit-manifest.ts — new module + Tier-2 manifest)
  3. CLI flags (bkit-cli.ts — --opencode flag, default-install decision)
  4. Render templates (opencode.json seed, gateguard.js plugin)
  5. Bash scripting (bkit-mode.sh redesign + Approach-A router removal)
  6. Test suite (10 existing files extended + 2 new test files + 2 manual verdict artifacts)
  7. Documentation (providers.md, prompts.md, decisions.md, knowledge.md, testing.md, AGENTS.md, README.md)
  8. Manual/empirical gates (spike against live provider, end-to-end verification)

## Session Fit Estimate

The plan decomposes into 6 phases plus 5 gates. Each phase alone is medium-to-large:

- Phase 0 (spike): manual empirical work; produces a verdict artifact with real provider evidence — not code, but requires a live external boundary.
- Phase 1 (transform path): 3 tasks touching bkit-install.ts + prompts.md + 2 test files; moderate (~15–20K tokens of code + tests).
- Phase 2 (render module + manifest + CLI): 3 tasks touching 4 source files + 2 new templates + 3 test files; large (~20–25K tokens).
- Phase 3 (GateGuard plugin): 1 task but requires the spike payload as a fixture, authoring a non-trivial JS plugin, and a smoke boundary test; large (~15–20K tokens).
- Phase 4 (bkit mode redesign): 1 task but the bkit-mode.sh rewrite is the most complex bash change in the repo + new bkit-mode.test.ts; large (~15–20K tokens).
- Phase 5 (manual e2e): live provider run, no code.
- Phase 6 (Approach-A removal): 3 tasks touching mode shim + advisory + upgrade migration test; medium (~15K tokens).
- Testing & Documentation: 6+ doc rewrites + 10 test-file extensions + 2 new test files; large (~20K tokens).

Rough total estimate: **~120–140K tokens** — comfortably above the 100K threshold even before accounting for context loaded from the existing codebase (bkit-install.ts, bkit-modules.ts, bkit-manifest.ts, bkit-cli.ts, bkit-mode.sh, prompts.md, providers.md, and all touched test files must be read in full before editing).

Task count is exactly at the boundary (16 effective tasks) and the external-boundary constraint (Phase 0 spike MUST complete and produce a green verdict before Phases 1–6 start) makes this a natural split point.

## Rationale

The plan crosses the threshold on both axes: ~130K estimated tokens and 16 effective tasks. The hard sequencing constraint (Gate 1.5 spike verdict gates all implementation) provides a clean, forced split boundary. Proposed domain groupings:

**Sub-plan A — Spike only (Phase 0 + Gate 1.5)**

- Task 0.1: run spike against live provider; produce `spike-verdict.md` with concurrency evidence, real `tool.execute.before` payload, confirmed opencode dir names.
- Gate 1.5 human acknowledgement.
- Entirely manual/empirical; no bkit source changes. Fits one session easily (~10–15K tokens).

**Sub-plan B — Transform path + render module + manifest + CLI (Phases 1–2)**

- Tasks 1.1, 1.2, 1.3, 2.1, 2.2, 2.3.
- Reads spike-verdict.md for dir names; writes bkit-install.ts, bkit-modules.ts, bkit-manifest.ts, bkit-cli.ts, templates/opencode.json, prompts.md; extends 6–7 test files.
- Estimated ~50–60K tokens. Fits one session.

**Sub-plan C — GateGuard plugin + bkit mode redesign (Phases 3–4)**

- Tasks 3.1, 4.1.
- Reads spike payload fixture from spike-verdict.md; authors gateguard.js; rewrites bkit-mode.sh + template; adds bkit-gateguard-opencode.test.ts + bkit-mode.test.ts.
- Estimated ~35–40K tokens. Fits one session.

**Sub-plan D — Testing, documentation, manual e2e, Approach-A removal (Gates 2–4, Phase 5–6)**

- Mandatory post-Gate-2 checklist, all documentation rewrites, Phase 5 manual e2e, Tasks 6.1–6.3, full verification plan.
- Estimated ~40–50K tokens. Fits one session.
