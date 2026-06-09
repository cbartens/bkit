<!-- Note: Plans live at `docs/plans/{YYYYMM}/{FID}-plan.md` (canonical month bucket). Logs sit at `docs/plans/{YYYYMM}/logs/{FID}/` and are delete-eligible. -->

# opencode Multi-Provider Execution Host (Approach B) — Sub-Plan D: Testing & Docs + Manual E2E + Approach-A removal

**Parent Plan:** [plan-v4-split.md](./plan-v4-split.md)

> [!CAUTION]
> **CRITICAL:** Do not hallucinate plan execution state.
>
> 1. ALWAYS read this actual sub-plan file natively via the `read_file` tool _before_ executing any steps.
> 2. NEVER trust system-generated session summaries or previous conversation history to determine what has been completed.
> 3. Your source of truth is EXCLUSIVELY the literal `[x]` vs `[ ]` checkboxes in this physical document. If a box is `[ ]`, it is NOT DONE, regardless of what the conversation context implies.

> [!IMPORTANT]
> **This is sub-plan 4 of 4 — the FINAL sub-plan.** It owns the Testing & Documentation mandatory tasks, 🔒 Gate 3, Phase 5 (manual end-to-end on a real provider: Task 5.1), Phase 6 (Approach-A removal — SEQUENCED LAST: Tasks 6.1, 6.2, 6.3), the Verification Plan, 🔒 Gate 4, and Manual Verification.
>
> **HARD PREREQUISITES:** [plan-v4-1.md](./plan-v4-1.md) (spike green), [plan-v4-2.md](./plan-v4-2.md) (render target + transforms), and [plan-v4-3.md](./plan-v4-3.md) (GateGuard plugin + mode redesign, Gate 2 green) MUST all be complete. Phase 6 (Approach-A removal) is the LAST work in the entire milestone and ships as its own PR so it lands only after the opencode host is proven.

## Context & Goals

This sub-plan closes out the milestone: it extends the test suite for the opencode module (round-trip + upgrade + advisory), rewrites all affected docs, runs the manual end-to-end on a real non-Anthropic provider, and then — sequenced LAST, as its own revertible PR — removes Approach A (the ccr router machinery, ollama/nvidia matrix columns, `--cloud=`/`--local=` flags, `.bkit/.env` route block, and router doc content). It also adds the upgrade-migration that detects a router-bearing seeded `bkit-mode.sh` (Tier-3 seed-or-print is not overwritten on upgrade) and advises reseed/replace.

**Success Criteria (this sub-plan):**

- Manifest round-trip + upgrade coverage and the router-bearing-`bkit-mode.sh` upgrade-migration drift assertion pass; all affected docs rewritten; `bkit check` clean.
- The 5 phase commands + worktree utilities execute end-to-end on opencode against a real provider (manual recipe), with concurrent Task fan-out, GateGuard advisory firing, and tracker writes landing — no Claude identity leak.
- Approach A is fully removed: `grep -ri 'claude-code-router\|ccr ' .bkit/ docs/` returns only historical decision-log references; `bkit mode --cloud=nvidia` is gone; direct Anthropic (`bkit mode --claude`) still works.

**Related Issues:** `#245` (this plan), `#243`/`#244` (Approach A — removed here), `DE-26` (decisions.md — superseded-by note added here).

> The full milestone-wide `👤 Acceptance Scenario` and `👤 Breaking Changes & Naming Review` live in [plan-v4-1.md](./plan-v4-1.md). Derived Test Matrix rows owned by THIS sub-plan: Approach-A removal (grep guard + `bkit-mode.test.ts`), upgrade-migration (router-bearing `bkit-mode.sh`), `mode-shim-not-sourced` advisory rewrite, manifest round-trip (upgrade half), and the End-to-end manual row.

## Merge Method

**Merge method: always squash.** Phase 6 (Approach-A removal) ships as its own squashed PR and lands LAST — the master decomposition uses PR boundaries (not non-squash merges) to guarantee removal follows the proven host.

## Supersession Inventory (DELETE tasks execute here — Phase 6)

> Approach A is removed, not deprecated. Each DELETE row below is mirrored as a removal task in Phase 6 (sequenced LAST). The `bkit-mode.sh` rows are deleted from the **canonical source + template**; because that file is Tier-3 seed-or-print (not overwritten on upgrade), Task 6.3 adds the consumer-side upgrade-migration that detects-and-advises a stale router-bearing seeded copy.

<!-- prettier-ignore -->
| Existing artifact | Replaced by | Decision | Justification |
| --- | --- | --- | --- |
| `_bkit_registry` rows `cloud/nvidia`, `local/ollama` (`.bkit/scripts/bkit-mode.sh` + template) | opencode host + provider selection in redesigned `bkit mode` | DELETE | Router lanes gone; opencode talks providers directly. |
| `_bkit_agent_matrix` `ollama` + `nvidia` columns (`.bkit/scripts/bkit-mode.sh` + template) | opencode model map (prompts.md `opencode model` column → opencode render) | DELETE | Per-host model pins move to the render target; router matrix obsolete. |
| `_bkit_router_*` machinery (`_bkit_router_bin`/`_config`/`_url`/`_ensure`/`_stop`) | none — opencode needs no router | DELETE | ccr no longer a bkit dependency. |
| `_bkit_env_route` + `.bkit/.env` `# bkit-mode:route` managed block | none | DELETE | Router env persistence obsolete. |
| `bkit mode --cloud=nvidia` / `--local=ollama` flag handling (`bkit()` shim) | `bkit mode --opencode=<provider>` | DELETE | Mode now selects host, not `ANTHROPIC_BASE_URL`. |
| ccr preflight branches in `_bkit_preflight` (router-missing / ollama-server / nvidia-key router framing) | opencode-host preflight (opencode binary present, provider creds, provider catalog) | DELETE | Preflight reframed around opencode, not ccr. |
| `.bkit/providers.md` § "Local / NVIDIA model swap" router content (incl. ccr log-verification subsection) | rewritten `bkit mode` + new opencode host rows | DELETE | Router narrative replaced by opencode host narrative. |
| ccr-related `.bkit/.env.example` route note (if any) + the `mode-shim-not-sourced` advisory's ccr/ollama/nvidia framing | opencode-framed advisory | DELETE | Advisory text references the removed router. |
| DE-26 router half (`docs/decisions.md`) | new decision entry (opencode host = Approach B shipped) | RETAIN-WITH-REASON | Decision log is append-only history; superseded-by note added, original kept as record (staged: superseding entry links it). |

> [!CAUTION]
> **Default = `DELETE`.** The one `RETAIN-WITH-REASON` is the append-only decision-log entry (history, not live code) — a new superseding entry references it; the router code/flags/docs it described are all DELETED.

## Security & Privacy

- [ ] **No plaintext keys / temp-only writes** — verify (during E2E, Task 5.1) that `opencode.json` references env vars only and the plugin wrote nothing into the consumer repo.
- [ ] **Removal does not touch global npm** — Approach-A removal (Phase 6) removes bkit's wiring only; the consumer's global `claude-code-router` binary is untouched (uninstall does not run global npm).

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

- **Existence Check:** Exists. Add opencode rows to § Supported hosts, § Subagent invocation, § Frontmatter, § Hooks (GateGuard MORE faithful — `tool.execute.before`), § Permissions, § MCP, § Models, § Tool name parity. DELETE § "Local / NVIDIA model swap" router content; replace with the redesigned `bkit mode` host/provider narrative.

#### [MODIFY] `.bkit/src/bkit-modules.ts` (advisory only)

- **Existence Check:** Exists. Update the `mode-shim-not-sourced` advisory to drop ccr/ollama/nvidia router framing; add the Task 6.3 upgrade-migration drift detection for a router-bearing seeded `bkit-mode.sh`.

## Documentation Updates

> Index: `.agents/docs.md`. Treat as code changes — rewrite prose, no lazy bullet appends.

<!-- prettier-ignore -->
| File | Change required |
| --- | --- |
| `docs/decisions.md` | New decision: opencode host (Approach B) shipped; Approach A removed. Add superseded-by note to DE-26. |
| `docs/knowledge.md` | opencode spec-churn gotcha (pin probed version), dry-run parity for the new module, GateGuard subagent-exemption mechanism difference, AND the Tier-3 seed-or-print upgrade-reach gotcha (Approach-A removal does not reach seeded consumers via the normal seed path → drift-detect + reseed advisory, mirrors KN-17). |
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

- [ ] **Verify test coverage against Derived Test Matrix:** Every matrix row has a corresponding checked-off task. Specifically: the CLI install-flag row → plan-v4-2 Task 2.3; the `bkit-mode.sh` redesign row → plan-v4-3 Task 4.1 (`bkit-mode.test.ts`); the spike row → plan-v4-1 Task 0.1 (`spike-verdict.md`); the end-to-end row → Task 5.1 (recorded in `e2e-verdict.md` / the Manual Verification log).
- [ ] **Add manifest round-trip + upgrade coverage:** Extend `bkit-uninstall.surgical.integration.test.ts` + `bkit-modules.upgrade.integration.test.ts` for `--opencode` (install → check zero drift → uninstall zero footprint → upgrade reconverges `opencode.json` per its confirmed tier) AND the Task 6.3 router-bearing-`bkit-mode.sh` upgrade-migration drift assertion.
  - **Done when:** both integration tests pass for the opencode module; uninstall leaves no `.opencode/` path on disk; the upgrade test asserts a router-bearing seeded `bkit-mode.sh` triggers the reseed/replace advisory (not silent preservation).
- [ ] **Update documentation:** Rewrite `.bkit/providers.md` (opencode rows + DELETE router section), `.bkit/prompts.md` (column), `AGENTS.md`/`.bkit/README.md` (routing), `docs/decisions.md` (new entry + DE-26 superseded note), `docs/knowledge.md`, `docs/testing.md`. Rewrite prose; no lazy appends.
  - **Done when:** `.agents/docs.md` still accurate; `bkit check` clean; no router content remains in `providers.md` outside historical decision refs.

### 🔒 Gate 3: Testing & Documentation Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below. **DO NOT stop for user permission.** Once saved, immediately proceed to Phase 4 verification → Phase 5 → Phase 6 → `Verification Plan`.

- [ ] **Docs updated:** Every `📚 Documentation Updates` row completed. `.agents/docs.md` accurate.
- [ ] **Gate 3 - Verified:** Every checkbox above independently verified.

### Phase 5 — Manual end-to-end on a real provider

- [ ] **Task 5.1:** Install `--opencode`, `bkit mode --opencode=<provider>` (real Ollama or NVIDIA), run the 5 phase commands + worktree utilities end-to-end in opencode. **Requires:** plan-v4-3 Task 4.1 (the redesigned `bkit-mode.sh` must be in place — running the end-to-end with the old route-block mode shim would not select the opencode host).
  - **Done when:** the manual verification recipe (Verification Plan § Manual) is executed and recorded to the end-to-end matrix artifact (`e2e-verdict.md` or inline in the Manual Verification log): the 5 phase workflows + utilities complete; parallel fan-out dispatches concurrent Task subagents; GateGuard advisory fires; tracker writes land. **Boundary test (no mock):** runs against live opencode + live provider; ground-truth = the provider serving each subagent (no Claude identity leak) + observed concurrency.

### Phase 6 — Approach A removal (SEQUENCED LAST; its own PR)

- [ ] **Task 6.1:** Remove all router machinery from `bkit-mode.sh` + template: `_bkit_router_*`, `_bkit_env_route`, `cloud/nvidia`+`local/ollama` registry rows, `ollama`/`nvidia` matrix columns, `_bkit_target_model` ollama/nvidia branches, ccr preflight branches, `--cloud=`/`--local=` flag handling.
  - **Done when:** `bkit-mode.test.ts` asserts none of the removed identifiers/flags remain in the canonical source + template; a repo-grep guard test asserts `claude-code-router`/`ccr ` appears in `.bkit/` + `docs/` ONLY in the appended decision-log history; `bkit check` clean. **The grep-guard's scope is explicitly canonical-source-only — it does NOT prove removal reached a seeded consumer copy (see Task 6.3, the upgrade-migration task).**
- [ ] **Task 6.2:** Strip ccr framing from advisories + docs: update the `mode-shim-not-sourced` advisory in `bkit-modules.ts`, remove the `providers.md` § "Local / NVIDIA model swap" router/ccr-log content, clean `.bkit/.env.example` route note. Add the DE-26 superseded-by decision entry.
  - **Done when:** `grep -ri 'claude-code-router\|ANTHROPIC_AUTH_TOKEN=bkit-router\|_bkit_router' .bkit/ docs/` returns only the historical decision-log lines; a unit assertion confirms the rewritten `mode-shim-not-sourced` advisory text contains NO `ccr`/`--cloud=`/`--local=`/`ollama`/`nvidia` router tokens; the new decision entry links DE-26; direct Anthropic mode (`bkit mode --claude`) still resolves the Anthropic key.
- [ ] **Task 6.3:** Add the upgrade-migration for a router-bearing seeded `bkit-mode.sh` (Tier-3 seed-or-print is NOT overwritten on upgrade — the #243/#244 consumer keeps the removed code). Detect a seeded `bkit-mode.sh` still carrying `_bkit_router_*`/`--cloud=`/`--local=` on upgrade and emit a forced-reseed / manual-replace advisory (mirror `detectTier2JsonDrift`, KN-17) — OR, if scoped fresh-install-only per the confirmed Breaking-Changes decision, document the manual-replace upgrade path. **Requires:** Task 6.1/6.2.
  - **Done when:** `bkit-modules.upgrade.integration.test.ts` asserts that upgrading over a fixture `.bkit/scripts/bkit-mode.sh` containing `_bkit_router_*`/`--cloud=` emits the reseed/replace advisory (drift signal), NOT silent preservation; the advisory text names the stale-router reason without citing internal tracker refs.

## Verification Plan

### Automated Tests

- [ ] **Type Check & Lint:** `pnpm typecheck` (`tsc --noEmit`) + ESLint clean across `.bkit/src/`.
- [ ] **Test Synchronization:** Update `bkit-install.test.ts`, `bkit-modules.test.ts` (advisory rewrite), `bkit-modules.integration.test.ts`, `bkit-dry-run-parity.integration.test.ts`, `bkit-manifest.test.ts`, `bkit-cli.test.ts`, `bkit-catalog-parity.test.ts`, `bkit-uninstall.surgical.integration.test.ts`, `bkit-modules.upgrade.integration.test.ts` (opencode round-trip + the router-bearing-`bkit-mode.sh` upgrade-migration drift assertion); add `bkit-gateguard-opencode.test.ts` + `bkit-mode.test.ts`.
- [ ] **Build:** Rebuild `dist/` (the engine compiles from `.bkit/src/`); confirm the new module/manifest/transform compile and ship.
- [ ] **Dogfood (tarball, clean dir):** `pnpm pack` → fresh consumer dir → install `--opencode` → confirm `.opencode/` renders + `bkit check --opencode` clean (per MEMORY: dogfood via packed tarball, not the repo; verify install AND upgrade live).
- [ ] **Run all tests:** `pnpm test` green; `pnpm bkit check` clean on dogfood.

> [!IMPORTANT]
> **No Architectural Downgrades:** On build/test errors, follow `docs/architecture.md` + `docs/knowledge.md`; never weaken a gate to pass (GateGuard's own contract). Halt if stuck.

### 🔒 Gate 4: Automated Verification Confirmed

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below. **DO NOT stop for user permission.** Once saved, immediately proceed to `Manual Verification`.

- [ ] **Gate 4 - Verified:** Every Automated Tests checkbox verified with explicit proof (test output, CLI results, `bkit check` exit codes).

### Manual Verification

> [!WARNING]
> **Dashboard Ban:** Use local CLIs (opencode, ollama, curl provider `/models`) to verify — do not ask the user to check a dashboard.

- [ ] **Step 1:** In a clean consumer repo, `bkit install --opencode`; confirm `.opencode/` tree (agents/commands/opencode.json/plugin) exists and `bkit check --opencode` exits 0.
- [ ] **Step 2:** `bkit mode --opencode=ollama` (server up, models pulled) OR `--opencode=nvidia` (valid key); `bkit mode --status` shows opencode host + provider, NO `ANTHROPIC_BASE_URL`, NO ccr.
- [ ] **Step 3:** Launch opencode; run `/bkit-plan #<issue>`; confirm the parallel review triplet dispatches 3 concurrent Task subagents and the orchestrator collects all verdicts; confirm via the provider's own logs/responses that the provider (not Claude) served the subagents. _(Closes the Derived Test Matrix "End-to-end" row — record in `e2e-verdict.md` / this log.)_
- [ ] **Step 4:** Edit a `tsconfig.json` in the opencode session; confirm the GateGuard plugin injects the gate-config advisory (advisory mode) and blocks (deny mode).
- [ ] **Step 5:** After Phase 6 merge, confirm `bkit mode --cloud=nvidia` is gone (usage error) and `bkit mode --claude` still routes direct Anthropic; `grep` confirms no live ccr references remain.
- [ ] **Step 6:** Upgrade-migration check — in a consumer dir that was seeded with a router-bearing `bkit-mode.sh` (simulate a #243/#244 install), run `bkit upgrade` and confirm bkit detects the stale shim and emits the forced-reseed / manual-replace advisory (NOT silent preservation of the removed router code). Verify the seeded `bkit-mode.sh` no longer carries `_bkit_router_*` after the advised reseed/replace. _(Live confirmation of the Derived Test Matrix "Upgrade-migration" row — the Vitest assertion lives in `bkit-modules.upgrade.integration.test.ts`, Task 6.3.)_

## Milestone Complete

This is the final sub-plan. On a green Gate 4 + Manual Verification, the opencode multi-provider execution host (Approach B) is shipped and Approach A is removed.
