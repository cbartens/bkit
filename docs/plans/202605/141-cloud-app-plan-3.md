<!-- Child sub-plan 3 of 3. Source: plan-v3-checked.md. {YYYYMM} = 202605. -->

# bkit-cloud rebuild on the Claude GitHub App — Child 3: Block 4 (`@claude`/`claude.yml` wiring + `Auto`→`bkit:auto`) + Full Verification

**Parent Plan:** [`141-cloud-app-plan.md`](./141-cloud-app-plan.md)

> [!CAUTION]
> **CRITICAL:** Do not hallucinate plan execution state.
>
> 1. ALWAYS read this actual file natively via the `read_file` tool _before_ executing any steps.
> 2. NEVER trust system-generated session summaries or previous conversation history.
> 3. Your source of truth is EXCLUSIVELY the literal `[x]` vs `[ ]` checkboxes in this physical document. If a box is `[ ]`, it is NOT DONE.

## ⛔ Land-Together Constraint (READ FIRST)

> [!CAUTION]
> **This child is the FINAL of THREE execution units on a SINGLE feature branch / single squashed PR.** All three children ([`141-cloud-app-plan-1.md`](./141-cloud-app-plan-1.md), [`141-cloud-app-plan-2.md`](./141-cloud-app-plan-2.md), [`141-cloud-app-plan-3.md`](./141-cloud-app-plan-3.md)) **plus #184** land together in one squashed PR (`bkit-ship.md` → `gh pr merge --squash`). The verification gates below run over the COMBINED output of all three children. Do NOT ship until every Gate-4 check and every automatable Manual Verification item passes. Item (1) is HUMAN-GATED, POST-MERGE. See the [parent index](./141-cloud-app-plan.md) § Land-Together Constraint.

## Position in Sequence

- **This is child 3 of 3 — execute LAST, after [`141-cloud-app-plan-1.md`](./141-cloud-app-plan-1.md) and [`141-cloud-app-plan-2.md`](./141-cloud-app-plan-2.md).**
- **Upstream (blocking):** Children 1 and 2 fully checked off on this branch. The full Gate-4 automated pass + Manual Verification here exercise their combined output (render parity, Vitest suites, live install/upgrade dogfood).
- **Block 4 specifics:** Block 4 is dogfood/bkit-repo-only per DECISION-B (`claude.yml` is NOT shipped to consumers). The `Auto`→`bkit:auto` hook migration here is the consumer-shipped half.

## Context & Goals

The FINAL SCOPE comment rebuilds bkit-cloud on the Claude GitHub App, splits the `cloud` module, adds the two-tier CI gate, and migrates Linear's bare `Auto` label to `bkit:auto`. Children 1 and 2 delivered D1/D2/D3, the cloud-module split, enforcement, the two-tier gate, and the concurrency reconciliation. **This child (Block 4)** wires the `@claude /bkit-<phase>` dispatch in this repo's `claude.yml` (bkit-repo-only — DECISION-B), completes the `Auto`→`bkit:auto` migration in the preflight hook templates + `trackers.md`, and then runs the full automated + manual verification that gates the single combined #141+#184 squash PR.

**This child delivers:** `@claude /bkit-<phase>` trigger verification/wiring in `.github/workflows/claude.yml` (auth unchanged per DECISION-A; no shipped template per DECISION-B), the bare-`Auto`→`bkit:auto` migration in both preflight hook templates, `trackers.md` label-consistency confirmation, and the complete Gate-3/Gate-4/Manual-Verification pass mapping 1:1 onto the FINAL SCOPE checklist.

**Success Criteria (this child):**

- `@claude /bkit-<phase>` dispatches as the App on the `claude.yml` mention path (auth = `claude_code_oauth_token` + `id-token: write`, unchanged — DECISION-A); the typed command is the phase carrier; bare assignment is not; no `claude.yml` template is shipped (DECISION-B).
- No bare `Auto` survives in any shipped/advisory text (preflight hooks + `trackers.md` + the `bkit-modules.ts` advisory strings migrated in child 1).
- All tests green; render parity holds; live install AND upgrade dogfood pass for both variants.

## Acceptance Scenario (reference)

> The single testable contract for the whole feature lives in [`141-cloud-app-plan-1.md`](./141-cloud-app-plan-1.md) § Acceptance Scenario (Narrative, Success Criteria, Concrete Example, Edge Cases, full Derived Test Matrix). This child owns the matrix row tagged **[C3]**: `Auto` → `bkit:auto` migrated in preflight hooks → T4.2. The Human Confirmation checkboxes are confirmed at Gate 1 in child 1.

## Decisions (acting in this child — full text in [parent index](./141-cloud-app-plan.md))

- **DECISION-A — distinct auth surfaces.** This child does NOT migrate `claude.yml` auth onto `ANTHROPIC_API_KEY`; it keeps `claude_code_oauth_token` + `id-token: write`. (T4.1.)
- **DECISION-B — `claude.yml` is bkit-repo-only; NO shipped template this cycle.** `@claude /bkit-<phase>` consumer coverage rides on `/install-github-app` (App-generated `claude.yml`) + the `bkit-cloud-setup` advisory (child 1 T1.7). Block 4's `claude.yml` edits are dogfood/bkit-repo-only and do NOT reach consumers via `bkit install`. (T4.1.)

## Supersession Inventory (rows owned by this child)

> The full Supersession Inventory (7 rows) lives in [`141-cloud-app-plan-1.md`](./141-cloud-app-plan-1.md). This child owns the **preflight-hooks bare-`Auto`** row:

<!-- prettier-ignore -->
| Existing artifact | Replaced by | Decision | Justification | Owner |
| --- | --- | --- | --- | --- |
| Bare `Auto` label in `.agents/templates/.claude/hooks/preflight.sh:8,109-111` + `.agents/templates/.cursor/hooks/preflight.sh:8,96-98` | `bkit:auto` | DELETE | Label convention: `bkit:` prefix on every tracker (FINAL SCOPE Labels row; migrate bare `Auto`). | **[C3]** T4.2 |

## Security & Privacy

- [x] **Auth model** — On the `@claude` mention path (`claude.yml`), `claude-code-action@v1` authenticates via `claude_code_oauth_token` + `id-token: write`. This child confirms that surface is unchanged (DECISION-A); it does NOT introduce `ANTHROPIC_API_KEY` here. `claude.yml` is bkit-repo-only (DECISION-B) — not shipped to consumers.

## 🚨 Pre-Flight / Dependencies 🚨

> Gate 1 is owned by [`141-cloud-app-plan-1.md`](./141-cloud-app-plan-1.md). Re-confirm the upstreams below before starting.

### Core (verify before starting this child)

- [ ] **Children 1 + 2 landed on this branch:** all T1._ and T2._/T3.1 checkboxes `[x]`. The Gate-4 pass below exercises their combined output.
- [ ] **User Context:** Verify read/write to `.github/workflows/claude.yml`, `.agents/templates/.claude/hooks/preflight.sh`, `.agents/templates/.cursor/hooks/preflight.sh`, `.agents/trackers.md`, and the test suites.
- [ ] **Testing & Quality:** Align with bkit's Vitest suites. Validate shipped config with the real tool/resolver, never string-presence-only (per repo memory). Verify install AND upgrade live, not just `bkit check`. Dogfood via packed tarball in a clean dir if dependency classification could shift.

## Architecture & Component Changes — Block 4

**CRITICAL:** All `[MODIFY]` files below were verified to exist; cited line numbers were re-checked against current `dev`.

### Block 4 — `@claude` / `claude.yml` trigger wiring + `Auto`→`bkit:auto` migration

#### [MODIFY] `.github/workflows/claude.yml` (bkit-repo-only — NOT shipped to consumers, DECISION-B)

- **Existence Check:** Exists (already has `id-token: write` at line 25, uses `claude_code_oauth_token` at line 37). `Glob **/claude.yml` confirms there is **NO** `.agents/templates/**/claude.yml` — this file is bkit-repo-only (the App generates each consumer's own `claude.yml` via `/install-github-app`). bkit ships NO `claude.yml` template this cycle (DECISION-B); these edits are dogfood/bkit-repo-only and do NOT reach consumers via `bkit install`.
- Wire `@claude /bkit-<phase>` dispatch as the App: `issue_comment` is the primary surface (lines 3-5). Ensure the typed command (`/bkit-design|plan|build|ship|debug`) is the phase carrier and is passed through to `claude-code-action`. The stock App `claude.yml` `if:` already fires on any `@claude` comment and passes the typed command through as the prompt — verify this holds and is documented; do NOT migrate this file's auth onto `ANTHROPIC_API_KEY` (DECISION-A: keep `claude_code_oauth_token` + `id-token: write`). Confirm bare issue assignment (line 9 `assigned`) does NOT carry a phase (out of scope as a trigger).
- Consumer coverage for `@claude /bkit-<phase>` (checklist item 10) rides on `/install-github-app` + the `bkit-cloud-setup` advisory (child 1 T1.7), NOT on a bkit-shipped workflow.

#### [MODIFY] `.agents/templates/.claude/hooks/preflight.sh` + `.agents/templates/.cursor/hooks/preflight.sh`

- **Existence Check:** Both exist.
- Migrate bare `Auto` → `bkit:auto`: `.claude/hooks/preflight.sh` lines 8, 109-111 (`,Auto,` substring match + `FAIL_REASON`); `.cursor/hooks/preflight.sh` lines 8, 96-98. (`.agents/trackers.md` already uses `bkit:auto` — verify no bare `Auto` remains there.)

#### [MODIFY] `.agents/trackers.md`

- **Existence Check:** Exists. Already uses `bkit:auto` throughout (lines 61, 78, 95, 139, 169, 181, 196, 215, 251, 274, 288). Confirm no bare `Auto` snippet remains after the hook migration; update the `bkit:auto (CI-router trigger gate)` label description (lines 78, 196) to "bkit-cloud trigger gate" if Comment 2's rename is folded in.

### Cron Jobs & Scheduled Tasks

None.

## Documentation Updates — Block 4 scope

> Index: `.agents/docs.md`. Treat as code changes — rewrite prose, no lazy bullet appends.

<!-- prettier-ignore -->
| File | Change required |
| --- | --- |
| `.agents/trackers.md` | Confirm `bkit:auto` consistency post-hook-migration; optional label-description rename (lines 78, 196). |

> [!NOTE]
> `cloud.md` + `advisories.md` are completed in child 1; `deployments.md`, `decisions.md` ADR, and `knowledge.md` incident in child 2. **Gate 3 below confirms ALL `Documentation Updates` rows across the three children are complete** (the full set: `cloud.md`, `trackers.md`, `deployments.md`, `decisions.md`, `knowledge.md`, `advisories.md`). If the `decisions.md` ADR / `knowledge.md` incident were not finalised in child 2, complete them here before Gate 3.

## Rollback Strategy

See [parent index](./141-cloud-app-plan.md) § Rollback Strategy — single `git revert` of the combined #141+#184 squash PR. Code-only; bkit has no database.

## Agent Execution Runbook — Block 4

> [!IMPORTANT]
> **Continuous Execution:** Work autonomously. Do not pause at Gates. Check off `[x]` as you go.
> **Blockers:** Do not fail silently — create a tracker issue (label `blocker`) with context before stopping.
> **Step Isolation:** Complete each task fully (including its verification + checkbox) before the next.
> **Ordering:** Block 4 (FINAL-SCOPE block 4) runs after Blocks 1-3 on the same branch. Then complete Gate 3, Gate 4, and the full Manual Verification.

> Every task includes a `**Done when:**` line — terse, testable, codebase-verifiable.

### Block 4 — `@claude` / `claude.yml` wiring + `Auto`→`bkit:auto`

- [ ] **T4.1:** Verify/wire `@claude /bkit-<phase>` dispatch as the App in `.github/workflows/claude.yml` (bkit-repo-only, DECISION-B); confirm the typed command is the phase carrier and bare assignment is not. Do NOT ship a `claude.yml` template; do NOT migrate its auth (DECISION-A).
  - **Done when:** `grep -n 'claude_code_oauth_token' .github/workflows/claude.yml` still returns line ~37 AND `grep -n 'id-token: write' .github/workflows/claude.yml` returns line ~25 (auth unchanged per DECISION-A — no `ANTHROPIC_API_KEY` introduced here); **phase-carrier/prompt pass-through is verifiable: the `issue_comment` `if:` gate matches `@claude` in `github.event.comment.body` (`grep -n "contains(github.event.comment.body, '@claude')" .github/workflows/claude.yml` returns the `issue_comment` clause, line ~16) AND the `claude-code-action@v1` step sets NO literal `prompt:` input (`grep -n '^[^#]*prompt:' .github/workflows/claude.yml` returns nothing — only the commented `# prompt:` example at ~44), so the comment body carrying the typed `/bkit-<phase>` command is forwarded to the action as the prompt by its default "perform the instructions in the comment that tagged it" behaviour** (documented inline so the pass-through is not silently re-derived); the `assigned` trigger (line 9) carries no phase (the `issues` `if:` clause matches only on `@claude` in body/title, never on the bare `assigned` event); `Glob **/claude.yml` returns ONLY `.github/workflows/claude.yml` (no template shipped); the `bkit-cloud-setup` advisory (child 1 T1.7) directs consumers to `/install-github-app` for their own `claude.yml`.
- [ ] **T4.2:** Migrate bare `Auto` → `bkit:auto` in `.agents/templates/.claude/hooks/preflight.sh` (lines 8, 109-111) and `.agents/templates/.cursor/hooks/preflight.sh` (lines 8, 96-98).
  - **Done when:** `grep -rn '\bAuto\b' .agents/templates/.claude/hooks/preflight.sh .agents/templates/.cursor/hooks/preflight.sh` returns no label references; substring match is `,bkit:auto,`; rendered-file test (real tool path) passes.
- [ ] **T4.3:** Confirm `.agents/trackers.md` has no remaining bare `Auto`; optionally rename the `bkit:auto` label description.
  - **Done when:** `grep -n '\bAuto\b' .agents/trackers.md` returns no label references; description rename applied if folded in. **Verification limit:** the optional Comment-2 label-description rename (`bkit:auto (CI-router trigger gate)` → "bkit-cloud trigger gate", lines 78/196) has no executable test; IF applied, verify by a positive grep for the new description string (`grep -n 'bkit-cloud trigger gate' .agents/trackers.md` returns the renamed lines) — the bare-`Auto` grep alone does NOT prove the new text landed; IF skipped, no assertion required.

### 🔒 Gate 2 (Block 4 scope) + Consolidated Gate 2: Code Implementation Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below. **DO NOT stop for user permission.** Once saved, immediately proceed to `Testing & Documentation`.

- [ ] **Gate 2 (Block 4) - Verified:** T4.1–T4.3 independently verified and checked off.
- [ ] **Gate 2 (CONSOLIDATED) - Verified:** Every task across all three children (T1.1–T1.11, T2.1–T2.7, T3.1, T4.1–T4.3 = 22 tasks) independently verified and checked off against the plans. This is the combined Gate-2 for the single PR.

> [!IMPORTANT]
> **Testing Strategy:** bkit uses Vitest (`.agents/scripts/*.test.ts` + `*.integration.test.ts`). Validate shipped config with the real tool/resolver, never string-presence-only (repo memory: #179/#195 class). Verify install AND upgrade live, not just `bkit check`. Dogfood via packed tarball in a clean dir if dependency classification could shift. No per-edit `bkit install` — batch mirror regen at session end.

**Mandatory Tasks (Testing & Documentation):**

- [ ] **Verify test coverage against Derived Test Matrix:** Every matrix row (see [`141-cloud-app-plan-1.md`](./141-cloud-app-plan-1.md) § Derived Test Matrix) has a corresponding task/test across the three children. Add tasks for any uncovered row (note: the two-tier GHA `if:` and the commit-tag workflow changes have no executable unit harness — cover via YAML/doc review + render-assertion where possible).
- [ ] **Update existing tests (named):** `bkit-modules.integration.test.ts` — advisory asserts (679-701, incl. `bkit:auto` not `Auto`), `bkit.cloudAgents` assertion (~703-710, assert the variant value `claude`/`cursor` + a legacy `enabled`→`claude` parse test — DECISION-C AMENDED, single field, no `bkit.cloud`), `renderCloudWorkflow` Linear-keep tests (754-762 + 787-793 deleted/replaced), `linear: omits install-github-app` (~695-700 restructured under cloud-split); `bkit-cli.test.ts` (--cloud=value + invalid + --force); `bkit-dry-run-parity.integration.test.ts` (cloud=claude + cloud=cursor — child 1 T1.10); manifest tests (variant split); `bkit-postinstall.ts` advisory test (child 1 T1.9).
- [ ] **Write new tests:** tracker/cloud constraint, tracker-switch hard-block, `bkit check` consistency, preflight `bkit:auto` render.
- [ ] **Update documentation:** `cloud.md` (child 1), `deployments.md` (child 2), `decisions.md` (child 2), `knowledge.md` (child 2), `trackers.md` (this child), regenerate `.agents/advisories.md` (child 1 T1.11). Confirm ALL rows complete here.

### 🔒 Gate 3: Testing & Documentation Check

- [ ] **Docs updated:** Every row in the consolidated `Documentation Updates` (across all three children: `cloud.md`, `trackers.md`, `deployments.md`, `decisions.md`, `knowledge.md`, `advisories.md`) completed. `.agents/docs.md` still accurate.
- [ ] **Gate 3 - Verified:** Every checkbox above independently verified and checked off.

## Verification Plan

> [!IMPORTANT]
> This Verification Plan + the Manual Verification checklist below exercise the COMBINED output of all three children and gate the single squashed #141+#184 PR. The Manual Verification section maps 1:1 onto the FINAL SCOPE comment's verification checklist (items 1-13).

### Automated Tests

- [ ] **Type Check & Lint:** `pnpm typecheck` (`tsc --noEmit`) + ESLint clean across `.agents/scripts/`.
- [ ] **Render parity:** `renderCloudWorkflow(template, "github")` byte-equals the canonical `.github/workflows/bkit-cloud.yml`; install AND upgrade produce identical output (no drift fight).
- [ ] **Vitest:** `pnpm test` green — `bkit-modules.integration.test.ts`, `bkit-cli.test.ts`, `bkit-dry-run-parity.integration.test.ts`, `bkit-doctor.integration.test.ts`, manifest suite.
- [ ] **Live install/upgrade dogfood:** run `bkit install --cloud=claude` and `bkit install --cloud=cursor` on a clean fixture (and `bkit upgrade`) — confirm correct files, `bkit.cloudAgents` recorded as the variant (`claude`/`cursor`), tracker constraint enforced, `bkit check` consistency passes. (Verify install AND upgrade live, per repo memory.)

> [!IMPORTANT]
> **No Architectural Downgrades:** resolve build/test errors via best practices, never hot fixes. Halt if stuck.

### 🔒 Gate 4: Automated Verification Confirmed

- [ ] **Gate 4 - Verified:** Every checkbox in Automated Tests independently verified and checked off. Explicit proof (test output, CLI results, rendered diffs) gathered.

### Manual Verification

> [!WARNING]
> **Dashboard Ban:** use local CLIs (`gh`) over dashboards where possible.

This section maps 1:1 onto the FINAL SCOPE comment's verification checklist.

- [ ] **(1) 🔴 HUMAN-GATED, POST-MERGE — live dispatch reaches a Claude turn.** `claude-code-action@v1` authenticates as the Claude App (`id-token: write` + App installed). **NOT automatable in-plan:** requires a real GitHub Actions dispatch + a Claude App installation on a real repo. Verify after merge via `gh workflow run`/`@claude` mention on a fixture repo with the App installed and `ANTHROPIC_API_KEY` set; confirm the run reaches a Claude turn (no OIDC boot error). This is #141's standing runtime-verification item.
- [ ] **(2)** `cloud=claude` requires `tracker=github`; `cloud=cursor` requires `tracker=linear`; mismatch hard-errors; symmetric both ways. (Vitest + live install.)
- [ ] **(3)** Switching an established tracker hard-blocks without `--force`; first-set is free; all driven off `package.json` recorded state. (Vitest + live install.)
- [ ] **(4)** Cursor scaffolding (`.cursor/Dockerfile` + `environment.json`) ships under `cloud=cursor`; not orphaned. (Vitest + live install.)
- [ ] **(5)** App requirement surfaced in `cloud.md` + `bkit-cloud-setup` advisory (optional→required); `github.token`-only framing deleted; `bkit check` asserts `cloud=claude` config consistency. (Doc review + Vitest + `bkit check`.)
- [ ] **(6)** CI auto-route fires only for commits carrying `bkit [auto route]` (zero runner otherwise) AND only while the linked issue still carries `bkit:auto` (live kill switch). (YAML review + post-merge live confirmation alongside item 1.)
- [ ] **(7)** `worktree-setup`/`create-pr` carry `[skip ci]`; only close-workflow (+ debug re-trigger) is loud and marked. (Workflow review + grep.)
- [ ] **(8)** Concurrency key reconciled across dispatch + CI surfaces (D3). (Render assertion + YAML review.)
- [ ] **(9)** #184 shared HEAD-subject assertion (RESOLVED + folded — see child 1 § "#184 Shared HEAD-Subject Assertion — RESOLVED") owns the commit-tag contract; build/debug/ship invoke the single deterministic assertion in `.agents/workflows.md` (no inline re-derivation); it treats `bkit [auto route]`/`bkit [verbose ci]`/`bkit [force build]` as legitimate. (Workflow review + grep that gates invoke the assertion.)
- [ ] **(10)** design/plan/build + manual ship/debug launch via `@claude /bkit-<phase>`; auto ship/debug via the gated CI route. **Consumer coverage rides on `/install-github-app` (App-generated `claude.yml`) + the `bkit-cloud-setup` advisory — bkit ships NO `claude.yml` template (DECISION-B); this repo's `claude.yml` is dogfood-only.** Auth surfaces differ by design (DECISION-A: `claude.yml` = `claude_code_oauth_token`, `bkit-cloud.yml` = `ANTHROPIC_API_KEY`+OIDC). (`claude.yml` review bkit-repo-only + advisory review + post-merge live confirmation.)
- [ ] **(11)** Linear `Auto` → `bkit:auto` migrated across preflight hooks + tracker snippets **AND `bkit-modules.ts` advisory strings (`:2051/2054/2055`)** — no bare `Auto` survives in any shipped/advisory text. (grep + render test.)
- [ ] **(12)** Vestigial Linear branch removed from `renderCloudWorkflow`; `bkit-cloud.yml` is GitHub-only. (Vitest + grep.)
- [ ] **(13)** Tests updated/green (advisory asserts, render, dry-run parity, manifest). (Gate 4.)

## Ship

Once Gate 4 + every automatable Manual Verification item passes, the single combined **#141 + #184** change is ready to ship as ONE squashed PR (`gh pr merge --squash --delete-branch --body ""`). Item (1) remains a HUMAN-GATED, POST-MERGE runtime-verification item. Do NOT decompose into separate PRs.
