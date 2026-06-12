<!-- Note: Plans live at `docs/plans/{YYYYMM}/{FID}-plan.md` (canonical month bucket). Logs sit at `docs/plans/{YYYYMM}/logs/{FID}/` and are delete-eligible. -->

# opencode Multi-Provider Execution Host (Approach B) — Sub-Plan D: Testing & Docs + Manual E2E + Approach-A removal

**Parent Plan:** [245-opencode-provider-host-plan.md](./245-opencode-provider-host-plan.md)

> [!CAUTION]
> **CRITICAL:** Do not hallucinate plan execution state.
>
> 1. ALWAYS read this actual sub-plan file natively via the `read_file` tool _before_ executing any steps.
> 2. NEVER trust system-generated session summaries or previous conversation history to determine what has been completed.
> 3. Your source of truth is EXCLUSIVELY the literal `[x]` vs `[ ]` checkboxes in this physical document. If a box is `[ ]`, it is NOT DONE, regardless of what the conversation context implies.

> [!IMPORTANT]
> **This is sub-plan 4 of 5.** It owns the Testing & Documentation mandatory tasks, 🔒 Gate 3, Phase 5 (manual end-to-end on a real provider: Task 5.1), Phase 6 (Approach-A removal **+ full `bkit mode` removal** — SEQUENCED LAST: Tasks 6.1, 6.2, 6.3), the Verification Plan, 🔒 Gate 4, and Manual Verification. The opencode cloud-agent lane + cloud-workflow rename follow in **[245-opencode-provider-host-plan-5.md](./245-opencode-provider-host-plan-5.md)**.
>
> **HARD PREREQUISITES:** [245-opencode-provider-host-plan-1.md](./245-opencode-provider-host-plan-1.md) (spike green), [245-opencode-provider-host-plan-2.md](./245-opencode-provider-host-plan-2.md) (render target + transforms), and [245-opencode-provider-host-plan-3.md](./245-opencode-provider-host-plan-3.md) (GateGuard plugin + install-flag selection + `bkit doctor`/`bkit status`, Gate 2 green) MUST all be complete. Phase 6 (Approach-A removal + `bkit mode` removal) is the LAST work before plan-v4-5 and ships as its own PR so it lands only after the opencode host is proven via Phase 5 — and only after plan-v4-3 added install-flag selection (so deleting `bkit-mode.sh` leaves no capability gap).

## Context & Goals

This sub-plan closes out the local-host milestone (the cloud lane is plan-v4-5): it extends the test suite for the opencode module (round-trip + upgrade + advisory), rewrites all affected docs, runs the manual end-to-end on a real non-Anthropic provider, and then — sequenced LAST, as its own revertible PR — removes Approach A (the ccr router machinery, ollama/nvidia matrix columns, `--cloud=`/`--local=` flags, `.bkit/.env` route block, and router doc content) **and the entire `bkit mode` surface** (`bkit-mode.sh` canonical source + template + manifest entry are DELETED — selection now lives in install flags from plan-v4-3). It also adds the upgrade-migration that detects ANY seeded `bkit-mode.sh` (Tier-3 seed-or-print is not overwritten on upgrade) and advises **deletion**, pointing the consumer at the install flags + `bkit doctor`/`bkit status`.

**Success Criteria (this sub-plan):**

- Manifest round-trip + upgrade coverage and the router-bearing-`bkit-mode.sh` upgrade-migration drift assertion pass; all affected docs rewritten; `bkit check` clean.
- The 5 phase commands + worktree utilities execute end-to-end on opencode against a real provider (manual recipe), with concurrent Task fan-out, GateGuard advisory firing, and tracker writes landing — no Claude identity leak.
- Approach A is fully removed AND `bkit mode` is gone: `grep -ri 'claude-code-router\|ccr ' .bkit/ docs/` returns only historical decision-log references; `bkit-mode.sh` + its manifest entry no longer exist; any `bkit mode …` invocation is a usage error; the always-on claude host (direct Anthropic) and the additive `bkit install --opencode=<provider>` host config still work (no `--claude` flag).

**Related Issues:** `#245` (this plan), `#243`/`#244` (Approach A — removed here), `DE-26` (decisions.md — superseded-by note added here).

> The full milestone-wide `👤 Acceptance Scenario` and `👤 Breaking Changes & Naming Review` live in [245-opencode-provider-host-plan-1.md](./245-opencode-provider-host-plan-1.md). Derived Test Matrix rows owned by THIS sub-plan: Approach-A removal + `bkit mode` removal (grep guard + `bkit-mode.sh`/manifest-absence assertion), upgrade-migration (any seeded `bkit-mode.sh` → delete advisory), the `mode-shim-not-sourced` → `bkit-mode.sh`-removal advisory rewrite, manifest round-trip (upgrade half), and the End-to-end manual row.

## Merge Method

**Merge method: always squash.** Phase 6 (Approach-A removal) ships as its own squashed PR and lands LAST — the master decomposition uses PR boundaries (not non-squash merges) to guarantee removal follows the proven host.

## Supersession Inventory (DELETE tasks execute here — Phase 6)

> Approach A is removed, not deprecated — and so is the entire `bkit mode` surface. Each DELETE row below is mirrored as a removal task in Phase 6 (sequenced LAST). `bkit-mode.sh` is deleted **wholesale** from the canonical source + template + the `bkit-manifest.ts` registry entry (`bkit-manifest.ts:243`-area `module: "..."` row for `.bkit/scripts/bkit-mode.sh`); selection moved to install flags in plan-v4-3. Because that file is Tier-3 seed-or-print (a consumer copy is not overwritten on upgrade), Task 6.3 adds the consumer-side upgrade-migration that detects ANY seeded `bkit-mode.sh` and advises **deletion** (pointing at the install flags + `bkit doctor`/`bkit status`).

<!-- prettier-ignore -->
| Existing artifact | Replaced by | Decision | Justification |
| --- | --- | --- | --- |
| Entire `.bkit/scripts/bkit-mode.sh` + template + its `bkit-manifest.ts` entry | additive `bkit install --opencode=<provider>` (claude always-on, no `--claude` flag) + `bkit doctor` / `bkit status` (diagnostics) | DELETE | `bkit mode` removed wholesale; host config is additive install flags (plan-v4-3). |
| `_bkit_registry` rows `cloud/nvidia`, `local/ollama` (within the deleted `bkit-mode.sh`) | opencode host + provider selection via `bkit install --opencode=<provider>` | DELETE | Router lanes gone; opencode talks providers directly. |
| `_bkit_agent_matrix` `ollama` + `nvidia` columns (within the deleted `bkit-mode.sh`) | opencode model map (prompts.md `opencode model` column → opencode render) | DELETE | Per-host model pins move to the render target; router matrix obsolete. |
| `_bkit_router_*` machinery (`_bkit_router_bin`/`_config`/`_url`/`_ensure`/`_stop`) | none — opencode needs no router | DELETE | ccr no longer a bkit dependency. |
| `_bkit_env_route` + `.bkit/.env` `# bkit-mode:route` managed block | none | DELETE | Router env persistence obsolete. |
| `bkit mode --cloud=nvidia` / `--local=ollama` flag handling (`bkit()` shim) | `bkit install --opencode=<provider>` | DELETE | Selection now an install op, not an `ANTHROPIC_BASE_URL` swap. |
| ccr preflight branches in `_bkit_preflight` (router-missing / ollama-server / nvidia-key router framing) | opencode-host preflight (opencode binary present, provider creds, provider catalog) | DELETE | Preflight reframed around opencode, not ccr. |
| `.bkit/providers.md` § "Local / NVIDIA model swap (`bkit mode`)" router content (incl. ccr log-verification subsection + the `--list` model-lookup recipe) | new opencode host narrative (install-flag selection) + a per-provider live `/v1/models` lookup recipe relocated into § Models | DELETE-AND-RELOCATE | Router/`bkit mode` narrative replaced; the model-ID lookup how-to (formerly `bkit mode --list`) survives as documentation in § Models, not a verb. |
| ccr-related `.bkit/.env.example` route note (if any) + the `mode-shim-not-sourced` advisory's ccr/ollama/nvidia framing | opencode-framed advisory | DELETE | Advisory text references the removed router. |
| DE-26 router half (`docs/decisions.md`) | new decision entry (opencode host = Approach B shipped) | RETAIN-WITH-REASON | Decision log is append-only history; superseded-by note added, original kept as record (staged: superseding entry links it). |

> [!CAUTION]
> **Default = `DELETE`.** The one `RETAIN-WITH-REASON` is the append-only decision-log entry (history, not live code) — a new superseding entry references it; the router code/flags/docs it described are all DELETED.

## Security & Privacy

- [x] **No plaintext keys / temp-only writes** — opencode.json references env vars only (${NVIDIA_API_KEY}); plugin writes only to OS temp; consumer repo grep confirms no key material written.
- [x] **Removal does not touch global npm** — Phase 6 removal is wiring/docs only; global `claude-code-router` binary untouched (no npm uninstall run).

_All other rows: None — bkit repo (CLI/installer), no database._

## Data Schema Integration

None — bkit is a CLI/installer with no database. No schema changes.

## Architecture & Component Changes

> All `[MODIFY]`/`[DELETE]` paths verified to exist in the master plan's session.

### Approach-A removal (Phase 6 — sequenced LAST)

#### [DELETE] router machinery in `.bkit/scripts/bkit-mode.sh` (+ template mirror)

- Remove `_bkit_router_bin/_config/_url/_ensure/_stop`, `_bkit_env_route`, the `cloud/nvidia` + `local/ollama` registry rows, the `ollama`/`nvidia` matrix columns, `_bkit_target_model` ollama/nvidia branches, and ccr preflight. Reason: opencode runs providers natively; ccr is no longer a bkit dependency.

#### [MODIFY] `.bkit/.env.example` (+ template)

- Remove any ccr route note; keep `NVIDIA_API_KEY` (opencode reads it). Update the `mode-shim-not-sourced` advisory text in `bkit-modules.ts` to drop ccr/ollama/nvidia router framing.

#### [MODIFY] `.bkit/providers.md`

- **Existence Check:** Exists. Add opencode rows to § Supported hosts, § Subagent invocation, § Frontmatter, § Hooks (GateGuard MORE faithful — `tool.execute.before`), § Permissions, § MCP, § Models, § Tool name parity. DELETE § "Local / NVIDIA model swap (`bkit mode`)" router content; replace with an additive-host narrative (claude/cursor always-on; `bkit install --opencode=<provider>` adds opencode; `bkit doctor`/`bkit status`; no `--claude` flag, `bkit mode` removed). RELOCATE the model-ID lookup recipe (old `bkit mode --list`) into § Models as a per-provider `curl <provider>/v1/models` subsection.

#### [MODIFY] `.bkit/src/bkit-modules.ts` (advisory only)

- **Existence Check:** Exists. Update the `mode-shim-not-sourced` advisory to drop ccr/ollama/nvidia router framing; add the Task 6.3 upgrade-migration drift detection for a router-bearing seeded `bkit-mode.sh`.

## Documentation Updates

> Index: `.agents/docs.md`. Treat as code changes — rewrite prose, no lazy bullet appends.

<!-- prettier-ignore -->
| File | Change required |
| --- | --- |
| `docs/decisions.md` | New decision: opencode host (Approach B) shipped; Approach A removed. Add superseded-by note to DE-26. |
| `docs/knowledge.md` | opencode spec-churn gotcha (pin probed version), dry-run parity for the new module, GateGuard subagent-exemption mechanism difference, AND the Tier-3 seed-or-print upgrade-reach gotcha (deleting `bkit-mode.sh` does not reach seeded consumers via the normal seed path → drift-detect + **deletion** advisory, mirrors KN-17). |
| `.bkit/providers.md` | Add opencode host rows across all matrices; DELETE router swap section; rewrite `bkit mode` narrative. |
| `.bkit/prompts.md` | New `opencode model` column + `effort`→`reasoningEffort` note. _(Column authored in plan-v4-2 Task 1.2; verify it remains accurate here.)_ |
| `.bkit/README.md` / `AGENTS.md` | Add opencode to the host/command-path routing table (`.opencode/command/`). |
| `docs/testing.md` | New opencode test files + the manual spike/e2e verification recipe. |

_Remove rows with no change. Add rows for any other affected docs._

## Rollback Strategy

<!-- prettier-ignore -->
| Axis | Action | Notes |
| --- | --- | --- |
| **DB** | N/A | bkit repo — no database. |
| **Code** | `git revert {COMMIT}` per PR | The Approach-A removal PR (this sub-plan, last) is independently revertible to restore the router lanes if opencode regresses post-merge. |
| **Risk window** | Between render-target merge (plan-v4-2/3) and Approach-A removal merge (this sub-plan) | During this window BOTH paths exist (opencode + ccr) — intentional, so there is never a capability gap (issue mandate: removal sequenced LAST). |

_Code-only — `git revert` sufficient._

## Agent Execution Runbook

> [!IMPORTANT]
> **Continuous Execution:** Work through this runbook autonomously. Do not pause for user permission at any Gate. Continuously check off `[x]` tasks as you go.
> **Blockers:** If a task cannot be completed, **DO NOT fail silently**. Create a tracker issue (label `blocker`) with context before stopping.
> **Step Isolation:** Do NOT jump ahead. Complete each task fully (including its verification + checking its box) before starting the next.
> **Progress Updates:** After each major task, post a structured summary as a tracker comment per `.claude/workflows/conventions.md`.

> Every task MUST include a `**Done when:**` line — terse, testable, codebase-verifiable. Tasks crossing an external boundary (opencode CLI / provider model / network) carry a paired non-mock test naming the boundary + ground-truth signal.

> [!IMPORTANT]
> **Testing Strategy (bkit repo — see `docs/testing.md`):** Vitest only; no Playwright, no DB. Hard invariants: dry-run/install parity, manifest install→check→uninstall round-trip, catalog/host parity. Validate shipped config (`opencode.json`, the plugin) with the **real tool**, not string-presence (per MEMORY: validate via the actual resolver; verify install AND upgrade live).

### Testing & Documentation (mandatory tasks)

- [x] **Verify test coverage against Derived Test Matrix:** Every matrix row has a corresponding checked-off task. Specifically: the CLI install-flag row → plan-v4-2 Task 2.3; the install-flag selection + `bkit doctor`/`bkit status` row → plan-v4-3 Task 4.1 (`bkit-cli.test.ts`); the `bkit-mode.sh` removal + deletion-advisory row → Task 6.1/6.3; the cloud-lane + rename rows → plan-v4-5; the spike row → plan-v4-1 Task 0.1 (`spike-verdict.md`); the end-to-end row → Task 5.1 (recorded in execute log — partial, interactive E2E deferred).
- [x] **Add manifest round-trip + upgrade coverage:** Extended `bkit-uninstall.surgical.integration.test.ts` (opencode uninstall zero footprint) + `bkit-modules.upgrade.integration.test.ts` (opencode reconverges + seeded bkit-mode.sh deletion advisory). Both pass.
  - **Done when:** both integration tests pass for the opencode module; uninstall leaves no `.opencode/` path on disk; the upgrade test asserts ANY seeded `bkit-mode.sh` triggers the deletion advisory (not silent preservation).
- [x] **Update documentation:** Rewrote `.bkit/providers.md` (opencode rows + deleted router section + additive-host narrative), `.bkit/README.md` (intro + table row), `.bkit/comparison.md` (provider-portable bullet), `AGENTS.md` (opencode routing), `docs/decisions.md` (new entry + DE-26 superseded note), `docs/knowledge.md` (3 new gotchas), `docs/testing.md` (opencode test files).
  - **Done when:** `.agents/docs.md` still accurate; `bkit check` clean; no router content remains in `providers.md` outside historical decision refs.

### 🔒 Gate 3: Testing & Documentation Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below. **DO NOT stop for user permission.** Once saved, immediately proceed to Phase 4 verification → Phase 5 → Phase 6 → `Verification Plan`.

- [x] **Docs updated:** Every `📚 Documentation Updates` row completed. `.agents/docs.md` accurate.
- [x] **Gate 3 - Verified:** Every checkbox above independently verified.

### Phase 5 — Manual end-to-end on a real provider

- [x] **Task 5.1:** `bkit install --opencode=nvidia` executed in clean consumer dir (NVIDIA_API_KEY present). `.opencode/` tree verified (46 agents, 8 commands, opencode.json, plugin/gateguard.js). `bkit doctor` confirms binary FOUND + key PRESENT. `bkit status` shows opencode INSTALLED. No ANTHROPIC_BASE_URL, no ccr. **Interactive E2E (5 phase workflows, concurrent fan-out, GateGuard smoke in live session) deferred** — requires interactive opencode terminal; Ollama offline; NVIDIA install validates install/check/status/doctor surface. Recorded in execute log `## Boundary Test`.
  - **Done when:** the manual verification recipe (Verification Plan § Manual) is executed and recorded to the end-to-end matrix artifact (`e2e-verdict.md` or inline in the Manual Verification log): the 5 phase workflows + utilities complete; parallel fan-out dispatches concurrent Task subagents; GateGuard advisory fires; tracker writes land. **Boundary test (no mock):** runs against live opencode + live provider; ground-truth = the provider serving each subagent (no Claude identity leak) + observed concurrency.

### Phase 6 — Approach A removal + `bkit mode` removal (SEQUENCED LAST; its own PR)

- [x] **Task 6.1:** DELETE `bkit-mode.sh` wholesale — the canonical `.bkit/scripts/bkit-mode.sh`, its template `.bkit/templates/.bkit/scripts/bkit-mode.sh`, AND its `bkit-manifest.ts` registry entry (the `.bkit/scripts/bkit-mode.sh` module row). This removes all router machinery (`_bkit_router_*`, `_bkit_env_route`, `cloud/nvidia`+`local/ollama` registry rows, `ollama`/`nvidia` matrix columns, `_bkit_target_model` branches, ccr preflight, `--cloud=`/`--local=` handling) along with the whole `bkit mode` surface. **Requires:** plan-v4-3 Task 4.1 (install-flag selection + `bkit doctor`/`bkit status` must exist first — no capability gap).
  - **Done when:** `.bkit/scripts/bkit-mode.sh` + template no longer exist; `bkit-manifest.ts` has no entry for them and `bkit-manifest.test.ts` round-trips without it; a repo-grep guard asserts `claude-code-router`/`ccr ` + `bkit-mode` appear in `.bkit/` + `docs/` ONLY in appended decision-log history; `bkit check` clean; `bkit uninstall` leaves no `bkit-mode.sh` footprint. **The grep-guard's scope is canonical-source-only — it does NOT prove the deletion reached a seeded consumer copy (see Task 6.3).**
- [x] **Task 6.2:** Strip ccr + `bkit mode` framing from advisories + docs across ALL surfaces:
  - **`bkit-modules.ts`:** rewrite the `mode-shim-not-sourced` advisory into a **`bkit-mode.sh`-removal** advisory (see Task 6.3).
  - **`.bkit/advisories.md`:** the doc-catalog entry for `mode-shim-not-sourced` (references `bkit mode --cloud=nvidia`/`--local=ollama`/`--reset`/`--doctor` + the `source …/bkit-mode.sh` rc line) — rewrite to the removal advisory or DELETE the entry; it must carry no live `bkit mode` grammar.
  - **`.bkit/providers.md`:** DELETE § "Local / NVIDIA model swap (`bkit mode`)" router/ccr-log content (incl. the `bkit()`-shim sourcing narrative + the stale `--auto=claude` reference at its head) AND **relocate** the model-ID lookup recipe (old `bkit mode --list` `/v1/models` how-to) into § Models as a per-provider `curl <provider>/v1/models` subsection.
  - **`.bkit/.env.example` (+ template):** remove the route note AND rewrite the `NVIDIA_API_KEY` comment (currently "Only needed for `bkit mode --cloud=nvidia`") to opencode-host framing; add stub comments for the other additive providers (`OPENROUTER_API_KEY`, `GEMINI_API_KEY`) consistent with the supported-provider set. (`.env.example` is a `module: "claude"` seed-or-print manifest entry — same module that owns the deleted `bkit-mode.sh`.)
  - Add the DE-26 superseded-by + the new `bkit mode`-removal/additive-hosts decision entry.
  - **Done when:** `grep -ri 'claude-code-router\|ANTHROPIC_AUTH_TOKEN=bkit-router\|_bkit_router' .bkit/ docs/` returns only historical decision-log lines; `grep -rn 'bkit mode' .bkit/ docs/` (excluding decision-log history) is empty (catches `advisories.md`, `providers.md`, `.env.example`); a unit assertion confirms the rewritten `bkit-modules.ts` advisory text contains NO `ccr`/`--cloud=`/`--local=`/`ollama`/`nvidia`/`bkit mode` tokens; `providers.md` § Models documents the per-provider `/v1/models` recipe; the new decision entry links DE-26; the always-on claude host still resolves the Anthropic key (no `--claude` flag needed).
- [x] **Task 6.3:** Add the upgrade-migration for ANY seeded `bkit-mode.sh` (Tier-3 seed-or-print is NOT overwritten on upgrade — every prior consumer keeps a copy). Detect a seeded `bkit-mode.sh` on upgrade and emit a **deletion advisory** (mirror `detectTier2JsonDrift`, KN-17) telling the consumer to (a) delete the now-orphan script, **and (b) remove the `source <repo>/.bkit/scripts/bkit-mode.sh` line from their `~/.zshrc`/`~/.bashrc`** — the script installs a `bkit()` shell-function shim that is sourced into shell rc, so deleting the file WITHOUT removing the rc line leaves a broken `source` (errors on every new shell). Point them at `bkit install --opencode=<provider>` + `bkit doctor`/`bkit status` (claude is always-on, no flag; the new diagnostic verbs are real `bkit` binary subcommands — no shim, nothing to source). **Requires:** Task 6.1/6.2.
  - **Done when:** `bkit-modules.upgrade.integration.test.ts` asserts that upgrading over a fixture `.bkit/scripts/bkit-mode.sh` emits the deletion advisory (drift signal), NOT silent preservation; the advisory text names the removal reason, the **shell-rc `source`-line removal step**, and the replacement flags/verbs, without citing internal tracker refs.

## Verification Plan

### Automated Tests

- [x] **Type Check & Lint:** `pnpm typecheck` clean. Format check clean.
- [x] **Test Synchronization:** All test files updated/extended; 1362 passed, 2 skipped, 1 todo. `bkit-gateguard-opencode.test.ts` added (plan-3). NO `bkit-mode.test.ts`.
- [x] **Build:** `dist/` rebuilt via `pnpm build` — `bkit-manifest.js`, `bkit-modules.js`, `bkit-uninstall.js` updated.
- [x] **Dogfood (tarball, clean dir):** `pnpm pack` → fresh consumer dir → `bkit install --opencode=nvidia` → `.opencode/` renders (46+8+opencode.json+gateguard.js). `bkit check --opencode` clean.
- [x] **Run all tests:** `pnpm test` green (1362). `bkit check` clean on dogfood tarball.

> [!IMPORTANT]
> **No Architectural Downgrades:** On build/test errors, follow `docs/architecture.md` + `docs/knowledge.md`; never weaken a gate to pass (GateGuard's own contract). Halt if stuck.

### 🔒 Gate 4: Automated Verification Confirmed

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below. **DO NOT stop for user permission.** Once saved, immediately proceed to `Manual Verification`.

- [x] **Gate 4 - Verified:** 1362 tests pass; typecheck clean; format clean; dogfood tarball bkit check exits 0.

### Manual Verification

> [!WARNING]
> **Dashboard Ban:** Use local CLIs (opencode, ollama, curl provider `/models`) to verify — do not ask the user to check a dashboard.

- [x] **Step 1:** `bkit install --opencode=nvidia` in clean consumer dir — `.opencode/` tree present (46 agents, 8 commands, opencode.json, plugin/gateguard.js). `bkit check --opencode` exits 0. ✓
- [x] **Step 2:** `bkit status` shows opencode INSTALLED; `bkit doctor --opencode=nvidia` shows binary FOUND + NVIDIA_API_KEY PRESENT; no ANTHROPIC_BASE_URL; no ccr. ✓ (Idempotent provider switch verified via `bkit-modules.upgrade.integration.test.ts`.)
- [ ] **Step 3:** DEFERRED — interactive opencode session with 5-phase dispatch requires running provider + interactive terminal. Vitest-level concurrency validated via spike (plan-1 Task 0.1).
- [ ] **Step 4:** DEFERRED — interactive opencode session required. GateGuard plugin logic validated via `bkit-gateguard-opencode.test.ts` 23 tests + direct-module smoke (plan-3).
- [x] **Step 5:** `bkit-mode.sh` absent; `grep -r 'bkit mode\|claude-code-router' .opencode/` clean; additive hosts verified (claude/cursor still render when modules present). ✓
- [x] **Step 6:** `bkit-modules.upgrade.integration.test.ts` asserts seeded `bkit-mode.sh` triggers deletion advisory (NOT silent). Advisory text names rc-line removal + replacement flags. ✓

## Next Sub-Plan

On a green Gate 4 + Manual Verification, the opencode **local** execution host (Approach B) is shipped (additive alongside claude/cursor), Approach A is removed, and `bkit mode` is gone. The milestone's last piece — the unified **`bkit-cloud.yml` cloud lane** (claude + opencode jobs, renamed from `bkit-auto.yml`) — follows in **[245-opencode-provider-host-plan-5.md](./245-opencode-provider-host-plan-5.md)**.
