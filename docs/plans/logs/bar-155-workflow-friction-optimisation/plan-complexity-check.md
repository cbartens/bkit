Verdict: SINGLE

<!-- verdict:end -->

# Plan Complexity Check

## Counts

- **Tasks:** 15 (Tasks 1–15; plan explicitly notes "compressed to 15 tasks" to stay within its own task-count gate)
- **Gates:** 4 (Gate 1: Prerequisites, Gate 2: Code Implementation, Gate 3: Testing & Documentation, Gate 4: Automated Verification)
- **Domain areas:** 1 — agent tooling / prompt+workflow surgery only (`.agents/prompts/`, `.agents/workflows/`, index docs, `docs/decisions.md`, `docs/pending.md`, `.agents/friction.md`). No API, no DB, no web UI, no mobile, no infra/deploy changes.

## Session Fit Estimate

The work is entirely markdown file edits across a tightly bounded set of canonical sources:

- Phase A (Tasks 1–3): Read ~10 prompt files, edit 2 + classify 8 utility prompts — ~8K tokens of reads + edits.
- Phase B (Tasks 4–6): Create 3 new prompt files (cp + patch + new write), delete 1 — ~6K tokens.
- Phase C (Tasks 7–9): Edit 3 workflow files (`bkit-plan.md`, `bkit-build.md`, `bkit-ship.md`) — `bkit-build.md` is the heaviest single file (17-step workflow, extensive renumber + remap table execution) — estimated ~20K tokens for reads + writes.
- Phase D (Tasks 10–11): Edit 2 index docs (`prompts.md`, `workflows.md`) — ~5K tokens.
- Phase E (Tasks 12–13): Edit `friction.md` (5 status lines), append to `decisions.md` and `pending.md` — ~4K tokens.
- Phase F (Tasks 14–15): `bkit install` + grep verification pass — ~5K tokens.

Total estimated execution tokens: ~50–65K, comfortably below the 100K threshold. The 15-task count is at the maximum allowed by the plan's own gate (≤15 = SINGLE); all 15 tasks are in a single domain (agent tooling) with no cross-cutting DB/API/UI concerns that would inflate scope.

## Rationale

The plan fits a single session because:

1. All edits are in one domain (`.agents/` markdown files + two `docs/` append targets). No environment setup, no build pipeline, no migrations, no service restarts.
2. The largest individual task (Task 8 — `bkit-build.md` renumber + forward-jump remap) is mechanical and table-driven; the plan supplies explicit before/after rows, so no inference work inflates token cost.
3. Verification is grep-only (no test runs, no deployments); each Task has a self-contained verify step that can be executed immediately after the edit.
4. The plan was explicitly self-constrained to 15 tasks to satisfy its own complexity gate — the author already performed the split/compress to ensure single-session fit.
