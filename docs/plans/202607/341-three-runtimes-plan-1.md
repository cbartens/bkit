# Three-Runtime Workflow Execution (#341) — Sub-Plan 1: Independent Roots

**Parent Plan:** [./341-three-runtimes-plan.md](./341-three-runtimes-plan.md)

> [!CAUTION]
> **CRITICAL:** Do not hallucinate plan execution state.
>
> 1. Read this sub-plan natively ONCE at session start. Do NOT re-read on every loop iteration.
> 2. NEVER trust session memory or previous conversation history.
> 3. Source of truth = literal `[x]` vs `[ ]` checkboxes in this document. `[ ]` = NOT DONE regardless of conversation context.

> [!IMPORTANT]
> This is the **bkit repo itself** — no app stack (no DB, no deployed URL, no browser). Test tiers reduce to **Static · Unit (vitest) · Integration (vitest, real subprocess/git) · Shell (bats)**; E2E/@live/migration/smoke are N/A (`docs/testing.md` § Stack / Tiers). "@live" here means a **real claude.ai (mode-3) session** — owned by Sub-Plan 6 (T16), not this sub-plan.

## Context & Goals (inherited from parent)

bkit's five phase workflows (`/bkit-{design,plan,build,debug,ship}`) + `bkit-auto` were authored for a laptop (mode 1) but now run in **four materially different runtimes**: laptop (mode 1), GitHub-Actions runner (mode 2), a **claude.ai cloud session** (mode 3, `CLAUDE_CODE_REMOTE=true`), and a **Cursor cloud agent** (mode 4). The settled design (`docs/plans/202607/341-three-runtimes-design.md`) is **minimal, additive changes gated on one capability table**: a sourced runtime shim (`bkit-runtime.sh`) emits a 5-row capability table (`RUNTIME` → `CAN_WORKTREE`/`CAN_PUSH_DEV`/`CAN_SLEEP`/`GH_OK`); workflow headers branch on `CAN_*`; invariants land in `.agents/rules.md`; the close path gains transport-agnostic guards (D23/D24/D25). Spikes A/B/C have **run and closed** — fold their findings; do NOT re-plan them.

**This sub-plan (1 of 6) — Independent roots (T1–T5).** Five tasks that touch disjoint files and consume nothing from each other (T4/T5 consume nothing from T3; T5 nothing from T4). This is the DAG's first layer; everything downstream (Sub-Plans 2–6) consumes T2's marker-primary FID (T8), T3's shim (T7/T9), and T4's `actions` toolset (T14/T15).

### Inherited Success Criteria (whole effort — this sub-plan contributes the roots)

1. All five phases + `bkit-auto` complete end-to-end in each of the four runtimes (mode 4 = Cursor, gated on detection-var confirmation); mode-1 verified non-regressed by a real run.
2. No run mutates the session's checked-out branch in a runtime that cannot restore it (D6/D23).
3. Every phase-close lands on `dev` with a body free of CI-suppression tokens (D24); `dev` CI-dispatch asserted (D1).
4. Any gh→MCP transition is bounded (max 1/run), recorded, and cross-checked (D25).
5. An MCP read returning empty/zero is never recorded as authoritative absence (D12).
6. A shim that fails to source is loud and distinguishable from a least-capable runtime (Flow 1).
7. No wait can hang — every bounded poll's cap survives a blocked `sleep` (D22).

## Global Execution Constraints (inherited from parent — apply to every sub-plan)

> [!IMPORTANT]
>
> - **Continuous Execution:** work autonomously; no pause at any Gate. Check `[x]` as you go.
> - **Serialise landing:** repo doctrine forbids concurrent bkit workflows on one clone; land in DAG order, never in parallel. (T1–T5 touch disjoint files, but do not run concurrent bkit workflows on the same clone.)
> - **Line anchors are indicative, re-locate at build.** Every `:NNN` anchor may be stale — re-grep before editing; NEVER edit by line number blind.
> - **Spikes A/B/C are CLOSED** — fold findings; do NOT re-plan them as open spikes.
> - **Blockers → tracker issue (`blocker`), then stop.** Never fail silently. Deferrals → `docs/deferrals.jsonl`; bugs → `docs/failures.jsonl` (`.bkit/jsonl.md` format; check existing first).
> - **Batch mirror regen (`bkit install`) at the END (Sub-Plan 6 / T16),** NOT after each edit. Host-render mirrors (`.claude`/`.cursor`/`.opencode`) are force-rendered and NOT drift-gated (D19).
> - **ASCII operators** (`!=` `>=` `<=`) in `.bkit/workflows/*.md` and `.bkit/prompts/*.md`; never Unicode.
> - **Merge method: always squash.** `gh pr merge --squash --delete-branch --body ""`.

## Naming & Behaviour Constraints (inherited — govern T1–T5)

> [!IMPORTANT]
> **Flag naming is non-negotiable (D1): `RUNTIME`, never `MODE`.** `bkit-auto.md:70-80` already binds `MODE=CI|BRIEF`. Applies to the **filename** too — the shim MUST be `bkit-runtime.sh`, never `bkit-mode.sh` (retired in #245).

- **New shipped file:** `.bkit/scripts/bkit-runtime.sh` (+ `.bkit/templates/.bkit/scripts/bkit-runtime.sh`), rides `bkit install` like the counter-bus pair; `.bkit/version` must track it.
- **New `status.jsonl` row type (T3):** `runtime-resolved` (additive; existing NDJSON artifact #234). No new artifact type.
- **FID resolution reorder (D9):** marker-primary → branch-derive fallback; the `feat/`-prefix hard-reject at `bkit-auto.md:86-87` is **deleted** (a reorder, not an invention). Fixes the `fix/{FID}` asymmetry (D18) for free.
- **`.mcp.json` toolset gains `actions`** (C1) — enables the CI/Actions + artifact-download MCP fallback map (consumed by Sub-Plan 5).
- **`cloud-bootstrap.sh` gh-auth hardening** (C2) — prefer the sanctioned `GH_TOKEN` env; add a loud dual-lane preflight; keep a single shared token (NO second secret).

## Security & Privacy (inherited)

- **NO new secret/env var (C2 decision):** no second MCP token; uses existing `GH_TOKEN` / `GH_BKIT_TOKEN`.
- **Untrusted input (§6f):** tracker/PR/comment bodies are untrusted; injection hardening is `#342`'s scope — do NOT duplicate.

## Architecture & Component Changes (this sub-plan)

### Mechanism — the runtime shim (Layer 0/1)

#### [NEW] `.bkit/scripts/bkit-runtime.sh` (+ `.bkit/templates/.bkit/scripts/bkit-runtime.sh`)

- **Why NEW, not evolve:** no existing script owns runtime detection; the retired `bkit-mode.sh` (#245) must NOT be resurrected by name (D1). Reuses the counter-bus's stateless re-source-per-block register 1:1 — not new infra (`.bkit/scripts/bkit-counter-bus.sh`, sourced at `bkit-build.md:573-574`, `bkit-ship.md:591-592`).
- `bkit_runtime_detect` → `RUNTIME` + 5-row capability table (`CAN_WORKTREE`/`CAN_PUSH_DEV`/`CAN_SLEEP`/`GH_OK`) + `WORKTREE_PATH` (mint/adopt). **Row 4 = Cursor Cloud Agent** (mode-2-equivalent: `CAN_WORKTREE`/`CAN_PUSH_DEV` true, `CAN_SLEEP` _verify_). Detection: bridge the `is_background_agent` hook signal (`.cursor/hooks/preflight.sh`, #75) to a bash-visible env marker via a bkit seam (`.cursor/environment.json` `env` or a hook export) — `CURSOR_AGENT`/`CURSOR_REMOTE_AGENT` are unconfirmed, not proof; an unmatched Cursor session must fall through to `unknown`, never mode 1. The exact bridge + the `sleep`-block behaviour are confirmed live in Sub-Plan 6 before mode 4 is asserted (verify-first). `GH_OK` is the only probe (`gh auth status`, once, loud). `CAN_PUSH_DEV` is NOT probed (D23). `unknown` → least-capable + loud. Ship the "table is a default, not a truth" comment.
- (`bkit_wait_ci` and close-guard helpers land in Sub-Plans 2 and 3 respectively — the shim file is created here; those functions are added there.)
- Install wiring: rides `bkit install` like the counter-bus pair; `.bkit/version` tracks it (`bkit-modules.ts` ships `.bkit/scripts/` templates by default).

#### [MODIFY] `.bkit/workflows/bkit-auto.md` (T2)

- **Existence Check:** exists. FID reorder (D9): hoist the PR-body marker read (`:93-112`) above the `feat/` check; **delete** the `feat/` hard-reject (`:86-87`); order = marker → branch-derive → Failure Path.

### Config / hook

#### [MODIFY] `.mcp.json` + `.bkit/templates/.mcp.json` (T4)

- **Existence Check:** both exist (toolsets = `context,issues,pull_requests,repos,users,projects`). Add `actions` to `X-MCP-Toolsets` (C1). Keep the two mirrors byte-identical.

#### [MODIFY] `.claude/hooks/cloud-bootstrap.sh` + `.bkit/templates/.claude/hooks/cloud-bootstrap.sh` (T5)

- **Existence Check:** both exist (`:61` `gh auth login --with-token`, silent `|| log`). gh hardening (C2): prefer `GH_TOKEN` env; loud preflight recording `GH_OK`; dual-lane abort **signal** when neither gh nor MCP authable; single shared token. **Two-file mirror edit** (this hook is tracked, `.bkit/version:42` — D19's "mirrors aren't edit sites" does NOT apply here).

#### [MODIFY] `.bkit/templates/docs/plans/template.md` + repo copies (T1)

- **Existence Check:** all exist. Remove `/Users/christian/...create-t3-turbo` (`:195` template, `:191`/`:575` repo copies); host-agnostic placeholder. Do NOT touch vendored `/Users/jesse` skill content (creates skill-sync drift, ships no consumer defect).

## 🚨 Pre-Flight / Dependencies 🚨

### 🔒 Gate 1: Prerequisites Check (owned by this sub-plan — first buildable unit)

- [x] **Acceptance Scenario confirmed** (parent `👤` checkbox `[x]`). _(Unchecked → `REVISE`.)_
- [x] **Breaking Changes confirmed** (parent `👤` checkbox `[x]`). _(Unchecked → `REVISE`.)_
- [x] **Open Questions confirmed** (parent `👤` checkbox `[x]`) — OQ-A/OQ-D govern Sub-Plan 4; OQ-B Sub-Plan 5; OQ-C Sub-Plans 3/6.
- [x] **Security & Privacy checked:** untrusted-input constraint acknowledged; no new secret confirmed.
- [x] **Package Management:** No new npm deps (bats + vitest present; `pnpm-lock.yaml` unchanged).
- [x] **Dependency Versions:** spot-check `npx tsc --version`, `pnpm --version`, `npx --yes bats --version`. — `tsc` 7.0.2, `pnpm` 10.34.3, `bats` 1.13.0.
- [x] **Existing-solution search:** shim reuses the counter-bus sourcing idiom; bats model on `tests/counter-bus.bats`.
- [x] **Project Context:** `docs/knowledge.jsonl` (KN-CORE-1 gh/MCP 401; KN-11/DE-32 skip-ci-not-HEAD); `docs/decisions.jsonl`; load `spike-findings.md` + `design-addendum-spikes.md`.
- [x] **Gate 1 - Verified:** All Core checked; applicable Conditional checked.

## Derived Test Matrix (this sub-plan)

<!-- prettier-ignore -->
| # | Test description | Type | Target file | Task |
| --- | --- | --- | --- | --- |
| 1 | `bkit_runtime_detect` maps env inputs → `RUNTIME` + 4 `CAN_*` per the 5-row table (incl. row 4 Cursor via a Cursor agent env var); `unknown` (no primitive) → least-capable, never mode-1 | Integration (bats) | `tests/bkit-runtime.bats` | T3 |
| 2 | Sourced shim state does NOT survive a Bash-call boundary; env-only flags re-derive per block; `GH_OK` round-trips through the `runtime-resolved` row (D21) | Integration (bats) | `tests/bkit-runtime.bats` | T3 |
| 3 | Shim-source failure / an unset `CAN_*` is loud + distinguishable from an explicit `false` (Flow 1 emptiness checks; distinct reason) | Integration (bats) | `tests/bkit-runtime.bats` | T3 |
| 4 | `WORKTREE_PATH` resolves mint (`CAN_WORKTREE=true` → `$REPO_ROOT/.worktrees/{FID}`) vs adopt (`false` → `$REPO_ROOT`) | Integration (bats) | `tests/bkit-runtime.bats` | T3 |
| 10 | `.mcp.json` `X-MCP-Toolsets` includes `actions`; the `.bkit/templates/.mcp.json` mirror is byte-identical to the live copy (C1) | Unit (vitest) | `.bkit/src/bkit-mcp-toolsets.test.ts` | T4 |
| 11 | No `/Users/<name>` absolute host path leaks in `.bkit/templates/docs/plans/template.md` + the two repo copies (D20) | Unit (vitest) | `.bkit/src/bkit-template-no-userpath.test.ts` | T1 |
| 13 | `cloud-bootstrap` gh-preflight prefers `GH_TOKEN`, records `GH_OK` loudly, and emits a loud NON-BLOCKING signal when neither gh nor MCP can authenticate (C2) | Integration (bats) | `tests/cloud-bootstrap-preflight.bats` | T5 |

## Agent Execution Runbook

- [x] **T1 — WS-5: Fix the shipped macOS user-path coupling (D20).** Remove `/Users/christian/...create-t3-turbo` from `.bkit/templates/docs/plans/template.md:195` and repo copies `docs/plans/template.md:191`/`:575`; use a host-agnostic placeholder. Do NOT touch the vendored `/Users/jesse` skill content. **Done when:** no `/Users/<name>` absolute path remains in those three files; **Unit (vitest)** `.bkit/src/bkit-template-no-userpath.test.ts` (matrix row 11) asserts zero host-path leaks and passes.
- [x] **T2 — WS-4: FID decoupling in `bkit-auto.md` (D9/D18).** Hoist the marker read (`:93-112`) above the `feat/` check; **delete** the `feat/` hard-reject (`:86-87`); order = marker → branch-derive → Failure Path. Record that `bkit-cloud.yml:190-198` already does marker-primary (no change). This is one of the two highest-blast-radius edits to the EXISTING mode-1/2 path — **if** the FID resolution can be factored into a shim helper WITHOUT a workflow call-site rewrite (respecting the guiding principle), add a `tests/bkit-runtime.bats` assertion for non-`feat/` vs `feat/` resolution to convert row-14's manual guard into an automated one for this backwards-compat boundary; otherwise it rests on prose-audit + live. **Done when:** `bkit-auto.md` has no `feat/`-prefix hard-reject; a non-`feat/` branch resolves FID from the marker; prose-audit (T16 row 15) sees no orphaned `${BRANCH#feat/}`-only path; consumption verified live in T16.
- [x] **T3 — WS-6: Layer 0 runtime shim + capability table + Flow 1 (D1/D2/D21/D23).** Create `.bkit/scripts/bkit-runtime.sh` (+ template): `bkit_runtime_detect` (`RUNTIME` incl. **row 4 = Cursor Cloud Agent** — bridge the `is_background_agent` hook signal (`.cursor/hooks/preflight.sh`, #75) to a bash-visible env marker via a bkit seam (`.cursor/environment.json` `env`; `CURSOR_AGENT`/`CURSOR_REMOTE_AGENT` unconfirmed, not proof), mode-2-equivalent, unmatched → `unknown` never mode 1; 4×`CAN_*`, `WORKTREE_PATH` mint/adopt, `GH_OK` probe-once, `unknown`→least-capable+loud, "default not truth" comment); Flow-1 loud source-failure + explicit-emptiness assertions; `runtime-resolved` row (+`ghProbeExit`/`ghProbeErr`). Wire into `.bkit/version` + `bkit install`. Record D14-rejected. **Done when:** shim exists + rides install; **Integration (bats)** `tests/bkit-runtime.bats` (matrix rows 1–4) passes: table mapping incl. `cursor` + `unknown` (exact detection bridge + `sleep`-block confirmed live in Sub-Plan 6 before mode 4 is asserted); state dies across Bash calls (`GH_OK` round-trips via the row); unset-vs-`false` distinguishable + loud; `WORKTREE_PATH` mint-vs-adopt.
- [x] **T4 — C1: Enable the `actions` MCP toolset.** Add `actions` to `X-MCP-Toolsets` in `.mcp.json` and `.bkit/templates/.mcp.json` (byte-identical). Re-map §6c to the verified names (`actions_list`, `actions_get`, `get_job_logs`, `download_workflow_run_artifact`). **Done when:** both files carry `actions`; **Unit (vitest)** `.bkit/src/bkit-mcp-toolsets.test.ts` (matrix row 10) asserts the toolset includes `actions` AND template==live, and passes.
- [x] **T5 — C2: gh hardening + loud dual-lane preflight (two layers — signal in the hook, enforce in Step 1).** In `.claude/hooks/cloud-bootstrap.sh` + its template: prefer the sanctioned `GH_TOKEN` env over `--with-token`; add a loud preflight that records `GH_OK` and emits a **loud non-blocking signal** when neither gh nor MCP can authenticate — the SessionStart hook **cannot hard-stop the session** (`cloud-bootstrap.sh:13-15`), so it signals, it does not abort. The **enforcing dual-lane ABORT lives in the workflow Step-1 preflight** (Flow 1 / the shim reading `GH_OK`), NOT the hook. Keep a single shared token (NO second secret). Prefer the proxy-brokered built-in in mode 3 when present (confirmed live in T16). **Done when:** both mirror copies updated; **Integration (bats)** `tests/cloud-bootstrap-preflight.bats` (matrix row 13) asserts `GH_TOKEN` preference, loud `GH_OK` recording, and a **loud non-blocking dual-lane signal** (not a hook hard-stop), and passes; the enforcing abort is covered by the Flow-1 assertion in T3 (`tests/bkit-runtime.bats`).

### 🔒 Gate 2: Code Implementation Check

- [x] **No bolt-on / no gate-weakening:** the `[NEW]` shim + the `[NEW]` test files (`bkit-mcp-toolsets`, `bkit-template-no-userpath`) justified against extending an existing artifact; no `as any` / `@ts-ignore` / `.skip` / empty `catch` / error-swallowing introduced to pass a gate.
- [x] **Gate 2 - Verified:** Every task checkbox independently verified against the plan.

**Mandatory Tasks (Testing & Documentation):**

- [x] **Verify test coverage:** rows 1–4→T3, 10→T4, 11→T1, 13→T5 each map to a checked task.
- [x] **Write new tests:** `tests/bkit-runtime.bats` (rows 1–4), `tests/cloud-bootstrap-preflight.bats` (row 13), `.bkit/src/bkit-mcp-toolsets.test.ts`, `.bkit/src/bkit-template-no-userpath.test.ts`.
- [x] **Update documentation (partial, this sub-plan's surfaces):** `docs/testing.md` note the new `tests/bkit-runtime.bats` + `tests/cloud-bootstrap-preflight.bats` + the two new vitest audits and the `runtime-resolved` row type; `docs/observability.md` note the Step-1 narrated capability line + the `runtime-resolved` row.

### 🔒 Gate 3: Testing & Documentation Check

- [x] **Docs updated:** this sub-plan's `Documentation Updates` rows done; `.agents/docs.md` still accurate.
- [x] **Gate 3 - Verified:** every checkbox independently verified.

## Verification Plan

### Automated Tests

- [x] **Full local gate suite:** `pnpm typecheck` (pass) · `pnpm format:check` (pass) · `pnpm lint:prose` (0/0/0) · `pnpm lint:slop` (10 pre-existing findings, unchanged) + `slop:delta` (net 0) · `pnpm test` (68 files / 2451 tests pass) · `pnpm test:bats` (79/79 pass). `pnpm bkit check` reports the EXPECTED `.bkit/workflows/bkit-auto.md` -> `.claude`/`.cursor`/`.opencode` mirror drift (host-render mirrors are force-rendered, NOT drift-gated per D19, and batch mirror regen is deliberately deferred to Sub-Plan 6/T16 per the Global Execution Constraints) — no other drift. No gate weakened to pass.
- [x] **New bats:** `tests/bkit-runtime.bats` (rows 1–4) + `tests/cloud-bootstrap-preflight.bats` (row 13) execute the real scripts in fresh subprocesses and pass.
- [x] **New vitest:** `bkit-mcp-toolsets` (row 10) + `bkit-template-no-userpath` (row 11) pass.
- [x] **Mirror parity:** `cloud-bootstrap.sh` ↔ template: identical modulo 2 pre-existing blank-line-only diffs (unrelated to this sub-plan's edit, applied identically to both copies). `.mcp.json` ↔ template: NOT naively byte-identical by design (`.mcp.json` is Tier-3 seed-or-print, tracker-filtered at install time) — validated instead against the real `buildMcpJson("github")` render (`.bkit/src/bkit-mcp-toolsets.test.ts`), which is the correct invariant. `.bkit/version` will pick up the new `.bkit/scripts/bkit-runtime.sh` hash automatically at the Sub-Plan 6 batch `bkit install`/`upgrade` regen (core-template-dir auto-discovery — no manual hash edit needed).

### 🔒 Gate 4: Automated Verification Confirmed

- [x] **Gate 4 - Verified:** every Automated Tests checkbox verified with explicit proof (test output / CLI results).

## Merge Method

**Merge method: always squash.** `gh pr merge --squash --delete-branch --body ""`. Never `rebase`/`merge-commit` into `dev`.
