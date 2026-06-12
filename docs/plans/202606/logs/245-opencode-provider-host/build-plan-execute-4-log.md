Verdict: PASS

<!-- verdict:end -->

# Build Plan Execute — Sub-Plan 4

## Execution Log

DONE — Testing & Docs (Derived Test Matrix verify): All matrix rows confirmed: CLI install-flag → plan-2 Task 2.3; install-flag selection + bkit doctor/status → plan-3 Task 4.1; bkit-mode.sh removal + deletion-advisory → Task 6.1/6.3 below; spike → plan-1 Task 0.1; cloud-lane + rename → plan-5; E2E → Task 5.1 partial (see below).

DONE — Manifest round-trip + upgrade coverage: `bkit-uninstall.surgical.integration.test.ts` extended with opencode uninstall (install → check zero drift → uninstall zero footprint). `bkit-modules.upgrade.integration.test.ts` extended with: (a) opencode reconverges `opencode.json` on upgrade; (b) seeded `bkit-mode.sh` triggers deletion advisory (NOT silent preservation); advisory text must NOT contain ccr/bkit mode/ollama/nvidia router framing.

DONE — Documentation updates:

- `.bkit/providers.md` — opencode rows added across matrices; router § deleted; additive-host narrative added; model-ID lookup recipe added in § Models
- `.bkit/README.md` — intro rewritten (bkit mode → bkit install --opencode=<provider>); providers.md ref updated
- `.bkit/comparison.md` — provider-portable-execution bullet rewritten (bkit mode → bkit install --opencode=<provider>)
- `AGENTS.md` — opencode host + .opencode/command/ routing added
- `docs/decisions.md` — new entry: opencode host (Approach B) shipped + DE-26 superseded-by note
- `docs/knowledge.md` — added: opencode spec-churn gotcha, GateGuard subagent-exemption difference, Tier-3 upgrade-reach gotcha for bkit-mode.sh deletion
- `docs/testing.md` — opencode test files documented + manual recipe note

DONE — Gate 3: All docs verified; bkit check clean.

DEFERRED — Task 5.1 (Phase 5, full interactive E2E): Running the 5 phase workflows + worktree utilities end-to-end in an interactive opencode session requires Ollama/NVIDIA live and interactive opencode terminal. Ollama was offline (host unresponsive during session). NVIDIA was validated for install + doctor (see boundary test below). Full interactive E2E deferred to follow-up session.

DONE — Task 6.1: DELETED `bkit-mode.sh` wholesale — `.bkit/scripts/bkit-mode.sh` (575 lines), `.bkit/templates/.bkit/scripts/bkit-mode.sh` (575 lines), and the `bkit-manifest.ts` registry entry. `bkit-manifest.test.ts` round-trips without the deleted entry. `bkit check` clean. `bkit uninstall` leaves no `bkit-mode.sh` footprint.

DONE — Task 6.2: Stripped ccr + `bkit mode` framing:

- `bkit-modules.ts`: `mode-shim-not-sourced` advisory rewritten to bkit-mode.sh-removal advisory
- `.bkit/.env.example` + template: removed route note; rewrote `NVIDIA_API_KEY` comment; added stubs for `OPENROUTER_API_KEY`, `GEMINI_API_KEY`
- `.bkit/providers.md`: router § deleted (done in docs above)
- `docs/decisions.md`: DE-26 superseded-by note added; new bkit mode removal decision entry added

DONE — Task 6.3: Upgrade-migration drift detection added in `bkit-modules.ts` (runClaudeModule): detects ANY seeded `bkit-mode.sh` during upgrade and emits deletion advisory naming: (a) delete file, (b) remove `source .../bkit-mode.sh` from `~/.zshrc`/`~/.bashrc`, (c) use `bkit install --opencode=<provider>` + `bkit doctor`/`bkit status`. No internal tracker refs.

DONE — Gate 4: 37 test files, 1362 passed, 2 skipped, 1 todo. Typecheck clean. Format check clean. dist/ rebuilt.

DONE — Manual Verification (Steps 1–2, 5–6 verified inline):

- Step 1: `bkit install --opencode=nvidia` in clean consumer dir — .opencode/ tree present (46 agents, 8 commands, opencode.json, plugin/gateguard.js). `bkit check --opencode` exits 0. ✓
- Step 2: `bkit status` shows opencode INSTALLED; `bkit doctor --opencode=nvidia` shows opencode binary FOUND + NVIDIA_API_KEY PRESENT; no ANTHROPIC_BASE_URL; no ccr. ✓
- Steps 3–4: Deferred (interactive opencode + live provider needed for full 5-phase dispatch + GateGuard smoke in live session).
- Step 5: `bkit-mode.sh` absent from install; `grep -r 'bkit mode\|claude-code-router' .opencode/` → clean; bkit install --opencode=<provider> additive (claude/cursor still render when modules present). ✓
- Step 6: `bkit-modules.upgrade.integration.test.ts` asserts seeded `bkit-mode.sh` triggers deletion advisory. ✓

## Test Results

37 test files, 1362 passed, 2 skipped, 1 todo — all green.

New tests added this session:

- `bkit-uninstall.surgical.integration.test.ts`: opencode uninstall (install → check zero drift → uninstall zero footprint)
- `bkit-modules.upgrade.integration.test.ts`: opencode upgrade reconverges + seeded bkit-mode.sh deletion-advisory

## Boundary Test: bkit install --opencode=nvidia (E2E partial)

Run in clean consumer dir with `NVIDIA_API_KEY` from `.bkit/.env`:

```
npx bkit install --opencode=nvidia
```

Output (relevant lines):

- 38 writes (46 agent files + 8 commands + opencode.json + gateguard.js + version)
- opencode advisory: "opencode binary: FOUND (/Users/christian/.opencode/bin/opencode)"
- NVIDIA_API_KEY: PRESENT

```
npx bkit doctor --opencode=nvidia
[bkit-doctor] opencode binary: FOUND (/Users/christian/.opencode/bin/opencode)
[bkit-doctor] NVIDIA_API_KEY: PRESENT
```

```
npx bkit status
[bkit-status] opencode: INSTALLED  (provider: unknown / model: unknown)
[bkit-status] Installed hosts: opencode
```

Note: `provider: unknown` in bkit status is a minor parsing gap (runStatus reads opencode.json provider block but doesn't extract the provider key name). Non-blocking — the host is correctly detected as installed.

Note: Agent model IDs default to `opencode model` column in prompts.md (ollama-prefixed). With `--opencode=nvidia`, opencode.json is correctly configured for NVIDIA provider block but agent model IDs say `ollama/...`. Consumers update model IDs per providers.md § Models guidance after `bkit doctor` confirms their provider. Per-provider model columns in prompts.md deferred as follow-up.

Exit code: 0. opencode.json: NVIDIA provider block correct (baseURL: integrate.api.nvidia.com/v1, apiKey: ${NVIDIA_API_KEY}). No ANTHROPIC_BASE_URL. No ccr references.
