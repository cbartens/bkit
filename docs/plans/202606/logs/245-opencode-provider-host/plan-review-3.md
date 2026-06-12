Verdict: CONCERNS
Failures: 3

<!-- verdict:end -->

# Plan Review

Lens: Regression risk, design-coverage.

## Surface-Area Map

Per-task touched surfaces and their consumers (all `[MODIFY]` paths verified to exist this session).

- **Task 1.1/1.2 — `bkit-install.ts`** (`applyOpencodeCommand`, `applyOpencodeAgent`, opencode model parser).
  - Touches: `Host` type (`bkit-install.ts:156` `"claude" | "cursor"`), `parseModelLookup` (`:159`), `applyT1/T2/T3` (`:199/:208/:266`).
  - Consumers of `Host`/`parseModelLookup`: `runCursorModule` (`bkit-modules.ts:871`), the install entry path (`bkit-modules`/`bkit-install` flow `:1029-1034`). Widening `Host` to add `"opencode"` is additive; switch/exhaustiveness sites must be checked.
  - New exported symbols (`applyOpencode*`) are net-new — no existing callers, low blast radius.

- **Task 1.3 — `prompts.md` § Models** (new `opencode model` column).
  - Consumers: `parseModelLookup` (claude/cursor path) reads existing columns by header; adding a column is additive IF the existing parser keys on header name, not column index. **Verify** `parseModelLookup` is header-addressed, not positional (a positional parser regresses claude/cursor model resolution silently). `bkit-catalog-parity.test.ts` is the guard.

- **Task 2.1 — `bkit-manifest.ts`** (`ModuleName` += `opencode`, `OPENCODE_MANIFEST`, `MODULE_MANIFESTS`).
  - `ModuleName` (`:46`) is consumed by `getInstallManifest`/`getModuleManifest`/`getManagedPackageJsonKeys` (`:352-375`) and `MODULE_MANIFESTS` (`:329`, typed `Record<ModuleName, …>`). Adding a key is type-safe and forces registration (good).

- **Task 2.2 — `bkit-modules.ts`** (`runOpencodeModule`, `MODULE_REGISTRY`, `MODULE_DISPATCH_ORDER`, `ModuleContext`).
  - `ModuleContext.modelLookup` (`:143`) is shared by ALL modules. Plan proposes extending it to a per-host map OR adding `opencodeModelLookup`. High-risk: changing the shape of `modelLookup` touches every module fn signature. The additive `opencodeModelLookup` variant is the contained choice — flag in OPTIONAL.
  - `MODULE_REGISTRY`/`MODULE_DISPATCH_ORDER` (`:2284/:2298`) — additive registration.

- **Task 2.3 — `bkit-cli.ts`** (`ModuleFlag`, `MODULE_FLAGS`, `ALL_MODULES`/`OPTIN_MODULES`, `printUsage`).
  - `ALL_MODULES` (`:90`) vs `OPTIN_MODULES` (`:93`) — the default-install decision drives which list. `--full` consumers get `.opencode/` IF added to `ALL_MODULES`. Additive to `ModuleFlag`/`MODULE_FLAGS`.

- **Task 3.1 — `.opencode/plugin/gateguard.js`** (new; parallel to `.claude/hooks/gateguard.cjs`).
  - The Claude original (`gateguard.cjs:148`) exempts subagents via `if (payload.agent_id) return;`. The opencode port must find an equivalent subagent-identity signal in `tool.execute.before`'s payload — and that signal is NOT one the spike validates.

- **Task 4.1 / 6.1 / 6.2 — `bkit-mode.sh` + template mirror** (redesign + Approach-A removal).
  - `bkit-mode.sh` carries 59 router-related identifiers (`_bkit_router_*`, `_bkit_env_route`, `_bkit_registry`, `_bkit_agent_matrix`, `--cloud=`/`--local=`, `_bkit_target_model`, ccr preflight, `ANTHROPIC_BASE_URL`).
  - **Critical consumer-propagation surface:** `.bkit/scripts/bkit-mode.sh` is registered in `bkit-manifest.ts:189-194` as `format: "byte-equal-text", seedOrPrint: true` and installed via `writeTier3` (`bkit-modules.ts:803`). It is **Tier-3 seed-or-print** — on upgrade an existing file is NOT overwritten (only AI-merge instructions are printed, `:813-816`).
  - `mode-shim-not-sourced` advisory (`bkit-modules.ts:820-827`) hard-codes ccr/ollama/nvidia/`--cloud=`/`--local=` framing — plan Task 6.2 targets it.

- **Removal-guard surface:** the Success Criteria grep (`grep -ri 'claude-code-router\|ccr '`) and the proposed repo-grep guard test run against the **canonical** `.bkit/` source + template — neither sees an already-seeded consumer copy.

## CRITICAL

1. **[Backwards-compat / migration ordering — `bkit-mode.sh` is Tier-3 seed-or-print; Approach-A removal does NOT reach existing consumers on upgrade.]**
   The plan's central guarantee ("Approach A removed; `claude-code-router` no longer referenced") is enforced only against the canonical source + template. But `.bkit/scripts/bkit-mode.sh` is `seedOrPrint: true` / `writeTier3` (`bkit-manifest.ts:189-194`, `bkit-modules.ts:803-816`): on `bkit upgrade`, an existing consumer file is **preserved untouched** — bkit prints merge instructions, never overwrites. A consumer who ran `bkit install` under #243/#244 (the exact population this milestone targets) keeps the full `_bkit_router_*` / `--cloud=`/`--local=` shim after upgrading to the opencode release. The breaking-change notice ("the route block is stripped on the next `bkit mode` run") assumes the NEW shim runs, but the consumer is still sourcing the OLD seeded shim. There is no migration task to detect-and-rewrite (or detect-and-advise-replace) a stale router-bearing `bkit-mode.sh` on upgrade. Phase 6's `Done when` grep-guard passes in the bkit repo while every real upgraded consumer still carries the removed code. **Required:** add a Phase 6 task that either (a) detects a router-bearing `bkit-mode.sh` on upgrade and emits a forced-reseed advisory / drift signal (mirror `detectTier2JsonDrift`, KN-17), or (b) explicitly scopes the removal as fresh-install-only and documents the upgrade path as a manual replace — and the grep-based `Done when` must name the consumer-upgrade reality, not only the canonical source.

2. **[Mock-only coverage at the GateGuard subagent boundary — the one unresolved opencode unknown is not gated by the spike and carries no non-mock test.]**
   Edge Cases (line 95) and the issue recon (Comment 4) both name the genuine open risk: opencode's subagent **result-collection / identity model is undocumented**, and the Claude exemption depends on `payload.agent_id` (`gateguard.cjs:148`). Task 3.1's boundary "smoke step" only asserts advisory-injection and deny-blocking on a _first edit_ — it does NOT assert the subagent-exempt branch fires against opencode's real subagent payload. If opencode does not surface an `agent_id`-equivalent on `tool.execute.before`, GateGuard nags on every subagent edit (the explicit failure mode in the Edge Case), and the unit test (`bkit-gateguard-opencode.test.ts`) would pass against a **mock payload the implementer invented** — encoding the assumption as the expectation (the KN-29 / "validate with the real tool" class). The Phase 0 spike validates concurrency + result collection but is silent on the plugin subagent signal. **Required:** the spike (or a Phase 3 boundary step) must capture opencode's _real_ `tool.execute.before` payload for a subagent-initiated edit and confirm the exemption signal exists; the unit test must assert against that recorded real shape, not a hand-authored mock.

3. **[Design-coverage gap — no `{FID}-design.md`; the parser-generalisation regression for the EXISTING claude/cursor model lookup has no guarding task.]**
   Per the design-missing fallback the issue mandate is accepted, but Task 1.2/1.3 generalise `parseModelLookup` (`bkit-install.ts:159`) — the function that today resolves the cursor `applyT3` model pins (`bkit-modules.ts:871`). The plan's tests assert the NEW opencode column parses to 46 names; **no task asserts the existing claude/cursor model resolution is unchanged** after the parser is generalised to take a column header. If the generalisation is implemented positionally or shifts the default-column behaviour, cursor agents silently get the wrong (or opencode) model pins, and no Derived-Test-Matrix row catches it (the matrix's parity row only checks _presence_ of an opencode mapping). **Required:** add a regression assertion that `parseModelLookup`/`parseOpencodeModelLookup` resolve the **claude/cursor** column to the same values as today (snapshot or explicit equality), gating the parser refactor.

## OPTIONAL

- **Contain the `ModuleContext.modelLookup` change.** Task 2.2 offers "extend `modelLookup` to a per-host map OR add `opencodeModelLookup`." `modelLookup` (`bkit-modules.ts:143`) is consumed by every module fn. Prefer the additive `opencodeModelLookup` field over reshaping the shared one — reshaping is a high-risk shared-utility change touching all module signatures for no functional gain.
- **Manifest format must match install dispatch (KN-13/KN-18/KN-16b).** Task 2.1 declares `.opencode/opencode.json` as `json`/seedOrPrint and `gateguard.js` as `byte-equal-text`. Per KN-18, set the manifest `format` to match the _actual_ write function called (`writeTier3` → `byte-equal-text`; `writeTier2JsonContained` → `json`). If `opencode.json` is ownership-mixed (consumer adds their own mcp/provider keys), it should be Tier-2 deep-contained (KN-17), not seed-or-print — otherwise consumer edits to `opencode.json` are never reconverged on upgrade. Worth an explicit decision in Task 2.1.
- **Malformed-`opencode.json` must throw, not overwrite (KN-19).** If `opencode.json` becomes a Tier-2/json file, the write path must throw on a malformed destination rather than silently replacing it.
- **Add an explicit transactional-staging assertion (KN-12).** The new module writes a multi-file `.opencode/` tree; a mid-install failure must leave zero `.opencode/` footprint. The uninstall round-trip test covers clean-state; add a discard-staging assertion for partial-write safety.
- **`mode-shim-not-sourced` advisory regression.** Task 6.2 rewrites the advisory text (`bkit-modules.ts:820-827`); add a unit assertion that the rewritten advisory contains no ccr/`--cloud=`/`--local=` tokens (closes the same grep-guard gap as CRITICAL #1 at the advisory layer).

## OUT OF SCOPE

- Codex CLI / OpenAI-native host (#247) — sibling host, explicitly deferred.
- Per-agent capability override config (#246) — generalises the convergent-reasoner override across hosts; out of plan scope.
- A cloud/managed-CI lane for opencode — issue § Scope boundaries marks opencode local-only; do not extend `--auto=` here.
- Curating opencode provider model IDs beyond seeded defaults — consumer-tuned, mirrors the Cursor catalog-churn caveat.
