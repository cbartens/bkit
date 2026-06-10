Verdict: CONCERNS

<!-- verdict:end -->

# Ship Summary — #245 opencode provider host

## Overview

Shipped **opencode** as bkit's third execution host (additive alongside always-on Claude/Cursor), merged to `dev` via PR #248 (merge commit `b7b3543`, 2026-06-10). Scope:

- **Additive host install** — `bkit install --opencode=<provider>` renders `.opencode/agents/*.md` + `.opencode/commands/*.md` (Claude→opencode transform), `.opencode/opencode.json` (Tier-2 deep-contained), and `.opencode/plugin/gateguard.js` (a parallel GateGuard port using opencode's `tool.execute.before` hook).
- **`bkit mode` removed** — the ccr router lane and `.bkit/scripts/bkit-mode.sh` retired; provider selection is now an install-flag decision. Orphan-deletion advisory (`bkit-mode-sh-deletion-required`) added for upgrades.
- **Unified cloud lane** — `bkit-auto.yml` → `bkit-cloud.yml`, one workflow with two secret-gated jobs (claude + opencode); `--cloud=opencode` requires a remote provider + `tracker=github`.
- **Diagnostics** — read-only `bkit doctor` / `bkit status`.
- **Post-PR follow-ups** (this session): `ollama` → `ollama-local` with the npm `@ai-sdk/openai-compatible` custom-provider format; all opencode agents collapsed to one local model (`qwen2.5-coder:7b`) to avoid reload churn under `MAX_LOADED_MODELS=1`; Ollama memory-safety guidance (`OLLAMA_MAX_LOADED_MODELS=1` / `OLLAMA_NUM_PARALLEL=1` / `OLLAMA_KEEP_ALIVE=2m`) surfaced via the `opencode-setup` advisory + a read-only `bkit doctor` check (ollama-local-scoped, nvidia-excluded by test).

## CI Status

Green. PR #248 merged with `mergeStateStatus: CLEAN` (required checks passed). Local full suite green throughout: **1389 passed, 2 skipped, 1 todo** at final commit; `pnpm build`, `check:dist`, `lint:prose`, `lint:workflows` all clean (1 pre-existing unrelated `write-good` warning in `docs/knowledge.md`).

## Action Items

- None blocking. Branch `feat/245-opencode-provider-host` cleanup + `bkit:merged` label handled in this ship pass.

## Recommended Next Step

Live E2E dogfood of the opencode host against a real provider (see Deferred). Run once Ollama/NVIDIA is available; no code change expected.

## Deferred & Out-of-Scope

- **opencode E2E live-run verification** (human-owned) — the opencode job against a real provider, claude-job secret-gating, and a dogfood `--opencode=<provider>` install were NOT exercised live; the provider was offline during the build session. The spike that gated the milestone proved concurrent subagent dispatch separately, but a full pipeline run on a live model is unverified. Recorded in `docs/testing.md` § Manual recipe — opencode E2E and the `docs/completed.md` cycle entry. This is the sole reason the verdict is CONCERNS rather than PASS.
- Heavier L2/L3 opencode test depth — out of scope for this milestone.
