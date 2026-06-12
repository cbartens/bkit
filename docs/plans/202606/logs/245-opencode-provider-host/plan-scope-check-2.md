Verdict: CONCERNS
Failures: 2

<!-- verdict:end -->

# Plan Scope Check

Lens: Scope, criteria, verification audit.

## CRITICAL

**C-1: Missing Derived Test Matrix row for Task 4.1 (`bkit-mode.test.ts` — bash shim redesign).**
Task 4.1 has a fully-specified `Done when:` that names `bkit-mode.test.ts` and asserts the redesigned flag grammar (`--claude`, `--opencode=<provider>`, `--status`, `--reset`), that opencode mode rewrites `.opencode/agent/*.md` headers (not `.bkit/.env` route block), and that no `ANTHROPIC_BASE_URL` is exported in opencode mode. This is a distinct testable behaviour. However, no row in the Derived Test Matrix maps to it. The matrix row "CLI parses `--opencode` module flag + `bkit mode --opencode=<provider>`" targets `bkit-cli.test.ts` (Task 2.3) and covers CLI flag parsing, not the bash shim's host-selection behavior. The bidirectional matrix-to-runbook mapping is broken: Task 4.1 has a verification task with no matrix row. Add a matrix row: `bkit-mode.sh redesign: --claude / --opencode=<provider> / --status / --reset grammar; opencode mode rewrites .opencode/agent/*.md headers; no ANTHROPIC_BASE_URL; no ccr` | Unit (Vitest / bash string-scan) | `.bkit/src/bkit-mode.test.ts` (new).

**C-2: Missing Derived Test Matrix row for Task 5.1 (manual end-to-end execution on a real provider).**
Task 5.1 is a distinct testable behaviour (5 phase commands + worktree utilities execute end-to-end on opencode against a real non-Anthropic provider, with observed concurrent fan-out, GateGuard advisory, tracker writes). The Spike row in the matrix covers the spike (Task 0.1), not the full-install end-to-end run. The gate-2 mandatory tasks paragraph states "the manual e2e maps to Manual Verification" but there is no matrix row for it. Add a matrix row: `End-to-end: 5 phase commands + worktree utilities execute on opencode + real non-Anthropic provider; parallel fan-out; GateGuard advisory; tracker writes; no Claude identity leak` | Manual (empirical) | `docs/plans/202606/logs/245-opencode-provider-host/e2e-verdict.md` (or inline in the manual verification log).

## OPTIONAL

**O-1: `opencode.json` tier decision left as implementation-time choice.**
Architecture § bkit-manifest.ts states "pick Tier-2 if consumers add their own mcp/provider keys (KN-17)" without committing the decision in the plan. Task 2.1's Done when requires the format to match the write fn, but which tier to pick is deferred. An implementer choosing seed-or-print would create the KN-17 consumer-drift problem this plan explicitly warns against. Recommend committing to Tier-2 deep-contained in the plan now, since `opencode.json` is acknowledged as ownership-mixed (consumers will add their own mcp/provider keys).

**O-2: opencode directory naming confirmation not in Task 0.1's Done when.**
The Breaking Changes section notes "Confirm opencode's actual dir names (`agent` vs `agents`, `command` vs `commands`) against current opencode docs during the spike." This is a plan-correctness concern because all manifest paths, templates, and agent/command write paths depend on the correct dir names. Task 0.1's Done when does not include this confirmation. If the spike runner captures concurrency and model pins but not dir names, Phase 2 manifests may be built against wrong paths. Recommend adding "(e) the actual opencode dir names (`agent`/`agents`, `command`/`commands`) confirmed against the probed CLI version" as item (e) in Task 0.1's Done when.

**O-3: Task 3.1 smoke test depends on plugin-API stability at pinned version — not confirmed in spike gate.**
Gate 1.5 checks concurrent subagents + deterministic collection + model pins. It does not confirm that the `tool.execute.before` plugin API contract is stable and matches the captured payload shape at the pinned version. If the plugin API churns between the spike version and the Phase 3 implementation version, the real-payload fixture becomes stale. Recommend adding a note to Task 3.1 that the smoke test MUST be run at the same pinned opencode version as Task 0.1, and that a version mismatch requires re-running the spike payload capture.

**O-4: Task 5.1's dependency on Task 4.1 is implicit.**
Task 5.1 uses `bkit mode --opencode=<provider>` which is Phase 4's output (redesigned `bkit-mode.sh`). The sequencing is correct (Phase 5 after Phase 4) but the dependency is not stated. Given the spike-gate precedent of explicit dependency callouts ("Requires: Task 0.1"), adding "Requires: Task 4.1" to Task 5.1 would prevent an implementer from attempting the end-to-end run with the old mode shim still in place.

## OUT OF SCOPE

- Per-agent capability override config (#246) — already marked out of scope in the plan.
- Codex CLI / OpenAI-native host (#247) — already marked out of scope.
- Cloud/managed-CI lane for opencode — already marked out of scope.
- Renovating/altering the existing `--auto=claude|cursor` cloud-agent environment vocabulary (DE-26) — already marked out of scope.
