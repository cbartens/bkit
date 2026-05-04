<!-- Save in `docs/plans/drafts/`. Move to `docs/plans/active/` when approved. -->

# Swap claude.yml runtime for Claude Managed Agents — Implementation Plan

**Feature ID:** `bar-120-managed-agents-runtime`
**Linear Issue:** [`BAR-120`](https://linear.app/bartens/issue/BAR-120)
**Design Doc:** none — Linear description is the de-facto design intake (see `docs/plans/logs/bar-120-managed-agents-runtime/plan-input.md`).
**Worktree:** `.worktrees/bar-120-managed-agents-runtime`
**Predecessor:** [`bar-101-linear-depot-claude-plan.md`](../completed/202604/bar-101-linear-depot-claude-plan.md)

> [!CAUTION]
> **CRITICAL:** Do not hallucinate plan execution state.
>
> 1. ALWAYS read this `plan.md` natively via `read_file` before executing any step.
> 2. NEVER trust session summaries or prior conversation to determine completion.
> 3. Source of truth is the literal `[x]` vs `[ ]` checkboxes here.

## Context & Goals

Replace the GHA `claude.yml` runtime with a Claude Managed Agents session (public beta `managed-agents-2026-04-01`, launched 2026-04-08). The Vercel `/api/webhooks/linear` route currently dispatches `repository_dispatch` → `claude.yml` boots Ubuntu, runs `pnpm install`, installs `@anthropic-ai/claude-code` globally, then `claude --print -- "$CLAUDE_PROMPT"`. Cold start dominates wall time. Managed Agents gives a pre-warmed cloud container with cached pkgs, declared network rules, and a streaming session API — exactly the surface `claude --print` was emulating.

Net change: route POSTs to the Sessions API instead of GitHub `repository_dispatch`; `ci-complete.yml` does the same chained dispatch; `claude.yml` is deleted as the **last** commit so the route can be exercised end-to-end before the GHA fallback disappears. Linear webhook ingestion, HMAC, loop guard, staleness check, prefix parse, GraphQL enrichment, AGENT_METADATA, worktree cleanup, `ci.yml`, skills in `.claude/commands/` all stay unchanged (lines proven below).

**Success Criteria:**

- `@claude /design BAR-TEST` → Vercel route → Managed Agents session created → design doc committed → Linear comment with `Claude session: <url>` posted, no `claude.yml` run recorded in GHA.
- `ci-complete.yml` after CI on a `feat/**` branch dispatches `/ship` (CI green) or `/debug` (CI red) into a Managed Agents session and posts session URL to Linear.
- p50 dispatch-to-first-token latency meets the Task 15 threshold (≤ 50% of baseline p50 OR ≥ 30 s absolute reduction) vs. measured baseline (captured before `claude.yml` deletion).
- `claude.yml` deleted in last commit; `ANTHROPIC_API_KEY` still in GHA secrets, `LINEAR_API_KEY` in Managed Agents env.

---

## 👤 ⚠️ Acceptance Scenario — HUMAN REVIEW REQUIRED

> [!CAUTION]
> **🛑 HUMAN MUST READ AND CONFIRM THIS SECTION.**
> Testable contract for the feature.
>
> **You do NOT need to read the rest of this plan.** Focus here.

### Narrative _(inherited — design doc missing, lifted from Linear `Acceptance` block)_

> ⚠️ MISSING: design doc has no Acceptance Scenario — human must confirm this proxy is acceptable.

Operator comments `@claude /design BAR-TEST` on a Linear issue. The Vercel route receives the webhook, verifies HMAC, enriches the issue, then opens a Managed Agents session via the Sessions API with payload `{comment_body, issue_id, issue_title, issue_description}`. The route extracts the session URL from the API response (or constructs `https://console.anthropic.com/agents/sessions/{id}` if the response omits `session_url`) and immediately posts a Linear comment `Claude session: <url>`. The agent runs end-to-end inside the Managed Agents container — clones the repo, runs the skill, commits the design doc, posts the completion comment — with the same observable outcome as today. No GHA run is created for `claude.yml`. The chained `ci-complete.yml` workflow does the same dispatch on CI completion, posting its own session URL.

### Success Criteria _(inherited — Linear `Acceptance` bullets verbatim)_

- `@claude /design BAR-TEST` in Linear → Vercel route → Managed Agents session → design doc committed → Linear comment posted. Same end-to-end behaviour as today, no GHA `claude.yml` run.
- A Linear comment containing the session URL is posted on dispatch, clickable to the live Anthropic console session view.
- `claude.yml` deleted from `.github/workflows/`.
- `ci-complete.yml` still dispatches debug/ship correctly on CI completion (target now Managed Agents, not GHA), and posts the session URL comment for chained runs.
- p50 dispatch-to-first-token latency improved vs. current cold-start baseline (capture before/after numbers).

### Concrete Example

**Setup:** Bartens team Linear issue `BAR-TEST` exists, `Automated` label present, operator is signed into the Anthropic console. Vercel preview deployment carries `LINEAR_WEBHOOK_SECRET`, `LINEAR_BOT_USER_ID`, `LINEAR_API_KEY`, `ANTHROPIC_API_KEY`, `ANTHROPIC_AGENT_ID`. GHA repo secrets carry `ANTHROPIC_API_KEY` (already present in `scripts/secrets-sync-github.sh` `GITHUB_KEYS` array — find via `grep -n ANTHROPIC_API_KEY scripts/secrets-sync-github.sh`), `LINEAR_API_KEY`, `GH_TOKEN`.

**Steps:**

1. Operator posts `@claude /design BAR-TEST` on the Linear issue.
2. Linear webhook → `POST /api/webhooks/linear` (HMAC ok, fresh, non-bot, prefix `@claude`).
3. Route enriches issue via Linear GraphQL, then `POST https://api.anthropic.com/v1/agents/{agent_id}/sessions` with header `anthropic-beta: managed-agents-2026-04-01`, body `{user_message, metadata: {issue_id, issue_title, issue_description}}`.
4. Sessions API returns `{id, session_url?}` — route resolves URL (response field if present, else constructed).
5. Route posts Linear comment via GraphQL `commentCreate`: `Claude session: https://console.anthropic.com/agents/sessions/<id>`.
6. Operator clicks URL → live session view shows the agent running `/design BAR-TEST` — clones repo, executes skill, commits doc, pushes branch, posts Linear completion comment via the agent's own Linear MCP tool.
7. `gh run list --workflow=claude.yml --limit=5` returns no run for this dispatch.

**Outcome:** Linear issue carries two new comments — `Claude session: <url>` (route, immediately) and the agent's own completion comment — and a new branch with the design doc. No `claude.yml` GHA run. Wall-time first-token latency (capture in Linear comment payload) is below the baseline captured pre-deletion.

### Edge Cases

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| Sessions API returns 5xx / network error | Route logs `[Linear Agent] Sessions API failed`, posts Linear comment `Claude session dispatch failed: <status> <message>`, returns 200 (no Linear retry storm — same invariant as today). |
| Sessions API response omits `session_url` field | Construct URL `https://console.anthropic.com/agents/sessions/{id}` from `id`, log structured `[Linear Agent] session_url field absent — using constructed URL`. |
| Concurrent `@claude /build BAR-X` while a prior session for `BAR-X` is live | **Accepted overlap (Open Q1 option b).** No active-session check in route; sessions are isolated; Anthropic enforces per-org rate limits; KV adds out-of-scope dep. Documented risk; revisit in BAR-NEXT if duplicate sessions cause Linear comment storms. |
| `ci-complete.yml` runs on a branch deleted before dispatch | `gh api ... pulls` filter returns null → existing `skip=true` exit branch (unchanged). |
| `api.anthropic.com` unreachable from GHA runner | Step `Verify api.anthropic.com reachability` pre-flight fails → CI red → operator addresses before merge. |
| Agent definition references skills that no longer exist in `.claude/commands/` | Agent invocation 4xx → route falls back to `Claude session dispatch failed` comment; rollback path. |
| Beta header rejected (`managed-agents-2026-04-01` rotated) | Sessions API returns 4xx with `beta_unsupported`; route catches, logs `[Linear Agent] beta header rejected — pin/refresh anthropic-beta`, posts Linear comment `Claude session dispatch failed: beta header rejected`, returns 200 (parity with other 5xx/error branches). |
| `ANTHROPIC_AGENT_ID` env missing | Route returns 200 + logs `[Linear Agent] ANTHROPIC_AGENT_ID not configured` (parity with current `GH_TOKEN not configured` early-return branch in `linear.ts`). |
| Session URL is auth-gated; non-Anthropic-account viewer clicks it | Anthropic shows sign-in. Acceptable per Open Q7 resolution: solo/team-internal. Linear comment text notes `(visible to Anthropic console signed-in operators only)`. |

### Derived Test Matrix

<!-- prettier-ignore -->
| Test description | Type | Target file |
| --- | --- | --- |
| Route dispatches to Managed Agents Sessions API instead of GitHub for `@claude` prefix | Unit (Vitest) | `packages/api/src/routes/linear.test.ts` |
| Route posts Linear `commentCreate` with session URL on success | Unit (Vitest) | `packages/api/src/routes/linear.test.ts` |
| Route falls back to constructed URL when Sessions API response omits `session_url` | Unit (Vitest) | `packages/api/src/routes/linear.test.ts` |
| Route posts dispatch-failed Linear comment on Sessions API 5xx, returns 200 | Unit (Vitest) | `packages/api/src/routes/linear.test.ts` |
| Route returns 200 + logs warning when `ANTHROPIC_AGENT_ID` env missing | Unit (Vitest) | `packages/api/src/routes/linear.test.ts` |
| Route still preserves HMAC, loop guard, staleness, UUID, prefix invariants from BAR-101 | Unit (Vitest) | `packages/api/src/routes/linear.test.ts` (existing cases retained) |
| Cursor branch is no-op (no Anthropic dispatch, no GitHub dispatch) — covered by inverting the existing `dispatches linear-cursor-task for @cursor comments` case | Unit (Vitest) | `packages/api/src/routes/linear.test.ts` |
| Outgoing Sessions API request asserts headers (`anthropic-beta: managed-agents-2026-04-01`, `x-api-key`) and body shape (`{user_message, metadata: {issue_id, issue_title, issue_description, agent}}`) — regression-pin against beta header rotation | Unit (Vitest) | `packages/api/src/routes/linear.test.ts` |
| `ci-complete.yml` dispatch step calls Managed Agents API and posts session URL via Linear `commentCreate` (yamllint shape + grep `api.anthropic.com` + grep `commentCreate` + grep `Claude session:`) | Static (yamllint + grep in runbook) | `.github/workflows/ci-complete.yml` |
| End-to-end dry-run: HMAC-signed POST to deployed preview → live Sessions API → real Linear comment | Integration (manual via `curl`) | runbook step, no committed test |
| Latency baseline measurement (pre-deletion) and post-swap measurement | Manual (CLI capture) | runbook step, results pasted into Linear comment |

### 👤 ✅ Human Confirmation

- [x] **Acceptance Scenario confirmed:** Narrative, Success Criteria, Concrete Example, Edge Cases, and Derived Test Matrix correctly describe what "done" looks like.

> [!CAUTION]
> **Agent:** Do NOT pass Gate 1 until this checkbox is `[x]`. Summary must issue `REVISE` if unchecked.

---

## 👤 ⚠️ Breaking Changes & Naming Review — HUMAN REVIEW REQUIRED

> [!CAUTION]
> **🛑 HUMAN MUST READ AND CONFIRM THIS SECTION.**

<!-- prettier-ignore -->
| Item | Decision |
| --- | --- |
| Delete `.github/workflows/claude.yml` | **YES — destructive but reversible via `git revert`. Last commit in sequence.** |
| New env var: `ANTHROPIC_AGENT_ID` | **NEW** — Vercel preview + production env (NOT GHA-only). Documented in `docs/webhooks.md`. |
| Reuse env var: `ANTHROPIC_API_KEY` | **REUSE** — already in GHA secrets (entry in `scripts/secrets-sync-github.sh` `GITHUB_KEYS` array, inside the `GITHUB_KEYS=( ... )` block alongside `LINEAR_API_KEY` / `GH_TOKEN`); add to Vercel preview + production. |
| Add `ANTHROPIC_AGENT_ID` to `scripts/secrets-sync-github.sh` `GITHUB_KEYS` | **REQUIRED** — script's cleanup phase deletes any GHA secret not in `GITHUB_KEYS`; manual `gh secret set` will be wiped on next sync. Append entry alongside existing `ANTHROPIC_API_KEY`. |
| New beta header: `anthropic-beta: managed-agents-2026-04-01` | **PINNED** — header value lives in code constant `ANTHROPIC_AGENT_BETA`, single point of rotation. Vitest regression-pin asserts the literal substring in the SDK/fetch call. Anthropic SDK bumps require manual review of this constant. |
| New dependency: `@anthropic-ai/sdk` in `packages/api` | **CONDITIONAL** — confirmed missing from `packages/api/package.json` `dependencies` block (lines 29-50; only `stripe`, `inngest`, `hono` etc.). **Decision:** use SDK if `@anthropic-ai/sdk` already exposes `client.beta.agents.sessions.create`; else raw `fetch` (parity with existing `linear.ts` style). Pin a concrete version range when adding. |
| Session URL visibility | Auth-gated; solo/team-internal acceptable per Linear description (Open Q7). Linear comment body annotates this. |
| Concurrency: drop GHA `concurrency: linear-claude-${issue_id}` | **ACCEPTED OVERLAP** (Open Q1 → option b). Sessions are isolated, low Linear traffic, KV adds out-of-scope dep. No active-session check; revisit in BAR-NEXT if duplicates cause comment storms. |
| Cursor branch becomes no-op (today: `linear-cursor-task` dispatch) | **DOCUMENTED CHANGE** — semantic shift from "dispatches `linear-cursor-task`" to "returns 200 no-op no-dispatch". Rationale: BAR-101 amendment confirms `@cursor` uses Linear native integration; `cursor.yml` does not exist; `linear-cursor-task` had no consumer. Existing test `dispatches linear-cursor-task for @cursor comments` in `linear.test.ts` is inverted (asserts no dispatch). |
| Beta maturity (Open Q6) | **ACCEPTED** — non-prod automation, ~3-week-old beta, single-operator team. Rollback trigger: 2+ consecutive 5xx in 24 h or beta header rejection. |
| Repo state per session | **Fresh `git fetch && git reset --hard origin/dev` in agent setup script** (Open Q3) — never assume clean cache. |
| Rollback path | Keep `claude.yml` content recoverable via `git show <sha>:.github/workflows/claude.yml`. Revert PR restores it bit-exact. PR merge mode MUST be **rebase-and-merge** (not squash) to preserve commit-boundary ordering of route swap before `claude.yml` deletion. |

> No DB schema change. No public API contract change. No UI change.

### 👤 ✅ Human Confirmation

- [x] **Breaking Changes confirmed:** I have reviewed all breaking changes and naming decisions above.

> [!CAUTION]
> **Agent:** Do NOT pass Gate 1 until this checkbox is `[x]`. Summary must issue `REVISE` if unchecked.

---

## Alternative Approaches & Recommendations

<!-- prettier-ignore -->
| Path | Verdict | Reason |
| --- | --- | --- |
| Keep `claude.yml`, just speed it up (Depot, prebuilt image) | Rejected | BAR-101 already tried Depot (deferred); cold-start ceiling remains. Managed Agents removes the install step entirely. |
| Run Managed Agents alongside `claude.yml`, feature-flag at the route | Rejected | Doubles surface area, two failure modes to monitor. Linear description explicitly says "delete `claude.yml`". Plan keeps deletion as last commit so the period of dual existence is one PR's worth, not a long-lived flag. |
| KV-tracked concurrency control (Open Q1 option a) | **Deferred to BAR-NEXT** | No KV in current stack scoped for this; Upstash exists (`packages/cache`) but adds dependency to a route that previously had none. Accept overlap; hard-guard later if overlap proves harmful. |
| Cursor parity (route the `@cursor` branch through Managed Agents too) | Out of scope | Cursor uses Linear's native integration (per BAR-101 post-merge amendment); this PR keeps the `@cursor` branch dead-code symmetric. |

## Out of Scope

Linear "What does NOT change" — verbatim, all 5 top-level bullets:

- Linear webhook receiver / HMAC verify / bot-loop guard / staleness check / @claude prefix parse / Linear GraphQL enrichment — preserved byte-for-byte in `linear.ts` lines above 155.
- `ci.yml` — untouched.
- `ci-complete.yml`'s `workflow_run` trigger / AGENT_METADATA parsing / Automated label check — only the dispatch step changes; the rest of the file is preserved.
- Skills in `.claude/commands/` — loaded into the agent definition unchanged.
- Worktree cleanup in `ship.md` / AGENT_METADATA agent field / debug attempt counter — out-of-scope, no edits.

Additional out-of-scope items:

- `@cursor` runtime swap — Cursor uses native Linear integration, not this webhook (BAR-101 amendment). Note: `@cursor` prefix in `linear.ts` becomes a 200 no-op (semantic shift documented in Breaking Changes table); not a "swap" because there is no replacement target.
- KV/DB-backed concurrency control — deferred (Open Q1 option a).
- Dropping `ANTHROPIC_API_KEY` from GHA — `ci-complete.yml` still needs it.
- Migrating `cursor.yml` (does not exist).
- Renaming the route or its webhook secret env var.
- Anonymous/public session share links (Anthropic does not yet support; tracked in claude-code#4305 and #27702 per Linear Open Q7).

## Security & Privacy

- [x] **New webhook**: existing `linear.ts` HMAC verify retained (no change). Outbound call to `api.anthropic.com` uses `ANTHROPIC_API_KEY` from server env only — never exposed client-side.
- [x] **New secret/env var**: `ANTHROPIC_AGENT_ID` added to `packages/env/src/index.ts` (server section, optional `z.string().min(1).optional()`). `ANTHROPIC_API_KEY` likewise (already a runtime secret on GHA, now also on Vercel).
- [x] **PII in payload**: issue title and description are forwarded into the Sessions API. Linear issues are operator-authored; no third-party PII surface. `comment_body` was already attacker-controllable in BAR-101 — same trust boundary.
- [x] **User input → Zod**: existing `LinearWebhookPayload` parse retained at `linear.ts:44-65`. Sessions API request body is **internally constructed**, not user-derived JSON, so no separate Zod schema needed.
- [x] **Logs**: structured `console.error("[Linear Agent] ...", {metadata})` retained; new log lines for Sessions API outcome use the same `[Linear Agent]` prefix for log-drain regex parity.
- [ ] No new RLS / role-gated mutation / redirect URL / new DB column.

## 🚨 Pre-Flight / Dependencies 🚨

### Core (always verify)

- [ ] **Package Management:** `pnpm add @anthropic-ai/sdk -F @app-gether-life/api`. Confirm `pnpm-lock.yaml` syncs (no other workspace bumps).
- [ ] **Dependency Versions:** `pnpm outdated --filter=@app-gether-life/api` clean. SDK must support `client.beta.agents.sessions.create` with `anthropic-beta: managed-agents-2026-04-01` header (verify against [Managed Agents quickstart](https://platform.claude.com/docs/en/managed-agents/quickstart) at task time; if SDK lacks `client.beta.agents`, fall back to direct `fetch` call documented in same task).
- [ ] **User Context:** read access to `linear.ts`, `claude.yml`, `ci-complete.yml`, `packages/env/src/index.ts`, `scripts/secrets-sync-github.sh` confirmed; `.env.preview` / `.env.production` are operator-controlled — agent must request operator action for Vercel env additions, not edit files.
- [ ] **Pending Blockers:** `gh issue list --label blocker` Linear query — none expected; flag if any block this scope.
- [ ] **Project Context:** `docs/knowledge.md` searched for "Anthropic" / "managed agents" / "GHA cold start" — no prior entries; new entry to be added in Documentation Updates step.
- [ ] **Testing & Quality:** Vitest unit only for route logic per `docs/testing.md` ("Backend Pipeline logic MUST be tested in Vitest only"). No Playwright. No integration test against real Sessions API in CI (cost). Manual integration via `curl` against deployed preview.
- [ ] **Prerequisite Plans:** `bar-101-linear-depot-claude-plan.md` (shipped 2026-04-19) must be merged. ✅ Already on `dev`.

### Conditional

- [ ] **Secrets & Env Vars:** `ANTHROPIC_API_KEY` add to Vercel preview + production via dashboard or `vercel env add`. `ANTHROPIC_AGENT_ID` likewise. `scripts/secrets-sync-github.sh` already lists `ANTHROPIC_API_KEY` for GHA in the `GITHUB_KEYS=( ... )` array — no action.
- [ ] **Architecture & UI:** `packages/api/src/routes/linear.ts` location stays per `docs/architecture.md` (Hono routes live there).
- [ ] **Observability:** new log names — `[Linear Agent] Sessions API ...`, `[Linear Agent] session_url field absent`, `[Linear Agent] overlap detected` — listed in `docs/observability.md`.
- [ ] **Beta-header re-verification (STOP gate):** between plan-write and code-commit, operator confirms `anthropic-beta: managed-agents-2026-04-01` is still accepted by `api.anthropic.com` (one-shot `curl` against `/v1/agents/{id}/sessions` with the header; expect 4xx auth/shape, NOT `beta_unsupported`). If Anthropic deprecates the beta value mid-PR, **STOP** code commits — escalate to human, swap the constant value to the successor in Breaking Changes table, and re-run this gate before resuming.

### 🔒 Gate 1: Prerequisites Check

- [ ] **Acceptance Scenario confirmed**
- [ ] **Breaking Changes confirmed**
- [ ] **Branch protection verified:** GitHub branch protection on `dev` permits rebase-and-merge (or document a one-time admin override). Run `gh api repos/gether-life/app-gether-life/branches/dev/protection` and inspect `required_pull_request_reviews` / merge-mode fields. If squash-only, plan splits into PR-A (Tasks 5-15) + PR-B (Task 16) up front.
- [ ] **Latency baseline captured:** Task 1 complete with at least 5 samples in `latency-baseline.md` BEFORE any code change lands on the branch.
- [ ] **Cost confirmed:** Task 4 complete with numeric estimate in `cost-estimate.md` and operator's `cost approved` reply (Linear comment) on file BEFORE any code change lands on the branch.
- [ ] **Gate 1 - Verified:** All Core items checked. All applicable Conditional items checked.

## Data Schema Integration

### Data Schema Usage (Inputs & Outputs)

None — route is stateless.

### Data Schema Changes

None.

## Architecture & Component Changes

> Routes in `packages/api/src/routes/`; envs in `packages/env/src/index.ts`; workflows in `.github/workflows/`.

### Backend (Vercel Hono Route)

#### [MODIFY] `packages/api/src/routes/linear.ts`

- **Existence Check:** confirmed (`linear.ts:1-212`).
- **Replace** the `// Dispatch to GitHub Actions via repository_dispatch` block (`linear.ts:157-202`) with a Sessions API call. Keep everything above (HMAC, Zod, loop guard, staleness, UUID, prefix parse, GraphQL enrichment) byte-for-byte unchanged.
- **New constant:** `const ANTHROPIC_AGENT_BETA = "managed-agents-2026-04-01";`
- **New env reads:** `process.env.ANTHROPIC_API_KEY`, `process.env.ANTHROPIC_AGENT_ID`. Mirror the existing "not configured" early-return pattern in `linear.ts` (the existing `GH_TOKEN not configured` early-return branch).
- **Sessions API call (sketch):**
  ```ts
  const sessionRes = await fetch(`https://api.anthropic.com/v1/agents/${agentId}/sessions`, {
    method: "POST",
    headers: {
      "x-api-key": anthropicApiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-beta": ANTHROPIC_AGENT_BETA,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      user_message: strippedBody,
      metadata: {
        issue_id: issueId,
        issue_title: issueTitle,
        issue_description: issueDescription,
        agent,
      },
    }),
  });
  ```
- **Response shape verification task** (Open Q2): at runbook task 2 below, fetch one real session against `BAR-TEST`; capture the raw response JSON in `docs/plans/logs/bar-120-managed-agents-runtime/sessions-api-response.json`; if `session_url` field present, use it; else compute `https://console.anthropic.com/agents/sessions/${json.id}`. Implementation must `??` fallback so both paths work.
- **Linear comment post (new):** after session URL resolution, fire `commentCreate` via Linear GraphQL using `LINEAR_API_KEY` (already in route env, see `linear.ts` — the existing GraphQL enrichment block). Body: `Claude session: <url> _(visible to Anthropic console signed-in operators)_`. On 5xx: build a failure body `Claude session dispatch failed: <status>` instead. Same `200` return invariant.
- **Cursor branch:** the `agent === "cursor"` path is dead code per BAR-101 amendment; leave the prefix detection intact; for `cursor`, return 200 no-op without dispatch (preserves symmetry but avoids paying Anthropic call for a path that's unused). Add comment `// @cursor uses Linear native integration; left as no-op`.
- **Naming:** keep export `linearAgentRoute`. Do not rename the route or mount path.

#### [MODIFY] `packages/api/src/routes/linear.test.ts`

- **Existence Check:** confirmed (`linear.test.ts:1-429`).
- **Adjust mocks:** existing fetch mocks need a third URL branch for `api.anthropic.com`. Replace the `.includes("api.github.com")` block with `.includes("api.anthropic.com")` returning `{ok:true, json: () => Promise.resolve({id:"sess_abc", session_url:"https://console.anthropic.com/agents/sessions/sess_abc"})}`.
- **Update existing test names** that reference GitHub dispatch — rename `dispatches linear-claude-task for @claude comments` → `dispatches Managed Agents session for @claude comments`. Same for cursor (now expecting no-op no-dispatch).
- **Add new tests** per Derived Test Matrix:
  - `dispatches Managed Agents session for @claude comments`
  - `posts Linear commentCreate with session URL on session success`
  - `falls back to constructed session URL when API response omits session_url`
  - `posts dispatch-failed Linear comment on Sessions API 5xx, returns 200`
  - `returns 200 + logs warning when ANTHROPIC_AGENT_ID env missing`
  - `cursor prefix returns 200 no-op (dead code path)`
- **Preserve** all 14 existing cases that test HMAC, JSON, Zod, loop guard, staleness, UUID, large body, unicode, missing fields. They are invariants from BAR-101.
- **Pre-edit name capture (Task 11a):** before any edit, run `grep -n "^  it(" packages/api/src/routes/linear.test.ts` and paste the resulting `it(...)` strings into `plan-build-1.md`. Post-edit assert: count = preserved-count + new-count (renames are 1-for-1, so the count of preserved test names should equal the pre-edit count minus 0; total post-edit count = pre-edit count + 6 new cases). If the pre-edit count is not 14, reconcile with the plan before continuing.

#### [MODIFY] `packages/env/src/index.ts`

- **Existence Check:** confirmed (47 lines; `server` block 6-18, `runtimeEnv` 28-44).
- **Add to `server` block (BAR-120 scope only — required for typed env access in `packages/api`; new BAR-120 envs only — no scope expansion):**
  ```ts
  ANTHROPIC_API_KEY: z.string().min(1).optional(),
  ANTHROPIC_AGENT_ID: z.string().min(1).optional(),
  ```
  _(BAR-101 envs `LINEAR_API_KEY`, `LINEAR_WEBHOOK_SECRET`, `LINEAR_BOT_USER_ID`, `GH_TOKEN` are intentionally NOT registered here — out of BAR-120 scope; tracked as follow-up in `docs/pending.md`. Route continues to read them via raw `process.env` for parity with existing `linear.ts` style.)_
- **Add to `runtimeEnv` block:** the matching two `process.env.*` lines.
- **Route consumption decision:** route reads via raw `process.env` for parity with existing `linear.ts` style; env-package additions are type-surface only — route does not import `@app-gether-life/env` for these in this PR.

#### [MODIFY] `packages/api/package.json`

- **Existence Check:** confirmed (`packages/api/package.json:29-49`); `@anthropic-ai/sdk` not present.
- **Add** `@anthropic-ai/sdk` to `dependencies`. Do NOT commit a literal `"^<latest>"` placeholder. Run `pnpm add @anthropic-ai/sdk -F @app-gether-life/api` in Task 5 and commit the resolved concrete pin pnpm chose; record the resolved version (`grep '"@anthropic-ai/sdk"' packages/api/package.json`) into `plan-build-1.md`.
- **Acceptance check:** `pnpm install` produces lockfile diff only in `pnpm-lock.yaml` and this `package.json`; nothing else changes. **STOP** if the diff touches any other workspace package.json — pnpm-lockfile cross-package bleed is a STOP-and-ask-human trigger.

### CI / Workflows

#### [MODIFY] `.github/workflows/ci-complete.yml`

- **Existence Check:** confirmed (`ci-complete.yml:1-133`).
- **Replace** the `Dispatch debug or ship` step's `gh api repos/.../dispatches` block in `ci-complete.yml` with a `curl` to `https://api.anthropic.com/v1/agents/$ANTHROPIC_AGENT_ID/sessions` carrying `x-api-key: $ANTHROPIC_API_KEY`, `anthropic-beta: managed-agents-2026-04-01`, body `{user_message: "$SKILL", metadata: {issue_id, agent, debugAttempt}}`. Capture response with `jq`, extract `.id` and `.session_url // empty`, fall back to constructed URL.
- **Add** a follow-up step `Post session URL to Linear` mirroring the existing failure-comment block in `claude.yml` (jq-built JSON, GraphQL `commentCreate`, `LINEAR_API_KEY` from secrets).
- **Keep** the `Find PR and parse AGENT_METADATA` and `Check Automated label` steps unchanged.
- **Env injection:** add `ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}` and `ANTHROPIC_AGENT_ID: ${{ secrets.ANTHROPIC_AGENT_ID }}` to the dispatch step env. Add `ANTHROPIC_AGENT_ID` to GHA secrets (manual via `gh secret set`).

#### [DELETE] `.github/workflows/claude.yml`

- **Reason:** Managed Agents replaces the entire job. The `if: failure()` Linear comment block is replaced by the route-level dispatch-failed comment plus the live session URL itself surfacing failure state in the Anthropic console.
- **Order constraint:** **last commit** in the sequence. Route + ci-complete swap commits land first and are operator-verified before deletion.

#### [UNCHANGED] `.github/workflows/ci.yml`

- Verified untouched. Lines 1-556 stay as-is.

### Managed Agent Definition (programmatic — `scripts/managed-agent-create.ts`)

The agent is created programmatically as part of this plan, not via the Anthropic console. The config below is **inline in the script** — version-controlled, code-reviewed, and reproducible.

#### [NEW] `scripts/managed-agent-create.ts`

- **Purpose:** create the Managed Agent referenced by `ANTHROPIC_AGENT_ID`. Replaces the alternative "operator clicks around the Anthropic console" path.
- **Run (one-shot, executed during Phase B):** `ANTHROPIC_API_KEY=<key> pnpm tsx scripts/managed-agent-create.ts`
- **Behavior:** POST `https://api.anthropic.com/v1/agents` with `anthropic-beta: managed-agents-2026-04-01` (use `client.beta.agents.create` from the SDK if exposed; else raw `fetch` — same SDK-vs-fetch decision as the route, gated by Task 2 verification). Body carries the config table values below. Print `agent_id` to stdout.
- **Operator follow-up:** copy the printed id; set `ANTHROPIC_AGENT_ID` in Vercel preview + production via `vercel env add`; set in GHA via `gh secret set ANTHROPIC_AGENT_ID --repo gether-life/app-gether-life`.
- **Re-creation:** if the config changes after first creation, re-run the script — a new `id` is returned, then rotate env vars. Idempotent in-place update via `PATCH /v1/agents/{id}` is **out of scope** for BAR-120; tracked in `docs/pending.md`.
- **Tests:** none — one-shot operator script, parity with other `scripts/*.{sh,ts}` in the repo. Manual verification = Task 7 below.
- **Failure mode:** if the create call returns 4xx (bad config / beta rejected), script exits non-zero with the response body printed; nothing else changes. No env-var update happens until a successful create.

#### Agent Config (inline in `scripts/managed-agent-create.ts`)

<!-- prettier-ignore -->
| Field | Value |
| --- | --- |
| Model | `claude-sonnet-4-6` (or current default — confirm at creation time) |
| System prompt | "You are the Gether build agent. Skills are in `.claude/commands/`. Default to `/build`/`/debug`/`/design`/`/plan`/`/ship` skills as instructed by the user_message." |
| Tools | `agent_toolset_20260401` (per Linear scope row 5) |
| MCP servers | Linear (auth via `LINEAR_API_KEY`) |
| Skills | `.claude/commands/{build,debug,ship,design,plan}.md` loaded from repo |
| Network | Limited: `api.linear.app`, `api.github.com`, `api.anthropic.com` |
| Secrets | `LINEAR_API_KEY`, `GITHUB_TOKEN` |
| Env setup script | `git fetch origin dev && git reset --hard origin/dev && git config user.email "agent@gether.life" && git config user.name "gether-agent"` (Open Q3 resolution: never trust prior session state) |
| Output | Script prints `agent_id` to stdout. Operator copies into Vercel preview + production env and into GHA secrets as `ANTHROPIC_AGENT_ID`. |

> [!IMPORTANT]
> The agent definition IS version-controlled in `scripts/managed-agent-create.ts`. Changes go through code review like any other source edit. The agent's `id` (returned by the create call) lives in env vars only — never committed.

### Database Migrations

None.

### Cron Jobs & Scheduled Tasks

None.

## Documentation Updates

<!-- prettier-ignore -->
| File | Change required |
| --- | --- |
| `docs/knowledge.md` | New entry: "Managed Agents replaced `claude.yml` runtime — cold-start latency removed; session URLs are auth-gated; SDK header `managed-agents-2026-04-01` is beta and may rotate." |
| `docs/decisions.md` | New ADR: "Use Anthropic Managed Agents (public beta) for Linear-triggered Claude runs; rationale = cold-start latency + cached env; agent definition version-controlled in `scripts/managed-agent-create.ts`, resulting `id` stored as `ANTHROPIC_AGENT_ID` env var." |
| `docs/architecture.md` | Update Linear→Claude flow diagram/section: replace `Vercel route → repository_dispatch → claude.yml` with `Vercel route → Anthropic Sessions API → Managed Agent`. |
| `docs/webhooks.md` | Update Linear webhook entry: outbound target now `api.anthropic.com/v1/agents/.../sessions` instead of GitHub `/dispatches`. New env var `ANTHROPIC_AGENT_ID` documented. |
| `docs/observability.md` | New log labels under `[Linear Agent]`: `Sessions API failed`, `session_url field absent`, `overlap detected`, `beta header rejected`, `ANTHROPIC_AGENT_ID not configured`. |
| `docs/testing.md` | Add `linear.test.ts` to test inventory if not present; note no integration test against live Sessions API (cost). |
| `docs/pending.md` | Append entry: register `LINEAR_API_KEY`, `LINEAR_WEBHOOK_SECRET`, `LINEAR_BOT_USER_ID`, `GH_TOKEN` in `packages/env/src/index.ts` (deferred from BAR-120 scope — out-of-scope BAR-101 envs). |

## Rollback Strategy

<!-- prettier-ignore -->
| Axis | Action | Notes |
| --- | --- | --- |
| **DB** | None — no migration. | n/a |
| **Code** | `git revert <merge SHA>` of the BAR-120 PR. Last commit deleting `claude.yml` is restored bit-exact (file was on `dev` at SHA captured in runbook task 8). | Single `git revert` covers route, ci-complete, env, and workflow. |
| **Vercel env** | Leave `ANTHROPIC_API_KEY` / `ANTHROPIC_AGENT_ID` in place — additive, harmless. | No rotation needed. |
| **GHA secret** | Leave `ANTHROPIC_AGENT_ID` in place. `ANTHROPIC_API_KEY` already required by reverted `claude.yml`. | No removal. |
| **Risk window** | ~2 min (Vercel build of revert) — during which both old route and old `claude.yml` may co-exist briefly; route is idempotent on no-match. | Low. |
| **Public-beta API rotation** | If `managed-agents-2026-04-01` is deprecated mid-PR, swap the constant value; if deprecated post-merge with no successor, full revert via above. | Track via Anthropic changelog. |

## Agent Execution Runbook

> Tasks ordered so the new route is verified end-to-end **before** `claude.yml` is deleted. Latency baseline must be captured before the deletion task.

**Phase A — Baseline & Setup**

- [ ] **Task 1 — Capture latency baseline.** Trigger one `@claude /design BAR-TEST` against current `dev`. From `gh run list --workflow=claude.yml --limit=1 --json databaseId,createdAt,updatedAt,jobs` and the corresponding Linear webhook delivery timestamp, compute dispatch-to-first-token p50 over **at least 5 runs**. Paste table into `docs/plans/logs/bar-120-managed-agents-runtime/latency-baseline.md`.
- [ ] **Task 2 — Verify Sessions API endpoint + response shape (Open Q2).** Create a **throwaway agent** for shape verification only — one-shot `curl POST https://api.anthropic.com/v1/agents` with the minimum config and `anthropic-beta: managed-agents-2026-04-01`. Capture its `id`, then `curl POST /v1/agents/{id}/sessions` and save the raw response JSON to `docs/plans/logs/bar-120-managed-agents-runtime/sessions-api-response.json`. **Delete the throwaway** via `curl DELETE /v1/agents/{id}` after capture (do not leave it billing). **Explicitly confirm and paste the verified request URL and HTTP method into the log file** (`POST https://api.anthropic.com/v1/agents/{id}/sessions`). If the SDK exposes `client.beta.agents.sessions.create`, read the SDK source to confirm the actual URL it calls and paste the SDK call site URL into the log. Confirm presence/absence of `session_url`. If absent, code path uses `https://console.anthropic.com/agents/sessions/${id}`. Cite the docs URL viewed in the log file. **STOP** if the response shape lacks the `id` field or carries fields substantially different from `{id, session_url?}` — escalate to human review before committing route code that assumes `??` fallback handles it. (The real, version-controlled agent is created later in Task 7 via `scripts/managed-agent-create.ts`; this throwaway exists only to unblock route-code design without committing anything.)
- [ ] **Task 3 — Verify api.anthropic.com reachability from GHA runner (Open Q4).** One-shot workflow_dispatch on a throwaway branch with `curl -s -o /dev/null -w "%{http_code}" https://api.anthropic.com/v1/messages -X POST -H "x-api-key: $ANTHROPIC_API_KEY" ...`. Expect 4xx (auth/shape), not connection error. Document outcome in `plan-build-1.md`. Confirm `ANTHROPIC_API_KEY` already in GHA secrets via `gh secret list` (expected per `secrets-sync-github.sh:33`).
- [ ] **Task 4 — Cost back-of-envelope (Open Q5).** Read [Managed Agents pricing](https://platform.claude.com/docs/en/managed-agents/overview) (or fall back to console). Estimate per-session cost vs current `(GHA minute × ~5 min × free-tier=0) + tokens`. **Write a numeric estimate to `docs/plans/logs/bar-120-managed-agents-runtime/cost-estimate.md`** in the form `$X/session vs $Y/(GHA-minute × 5)` with citation URLs. **Unblock signal:** operator replies in the Linear issue with the literal phrase `cost approved` (case-insensitive). The reply must be captured (URL + comment text) in `cost-estimate.md`. **Pre-code gate:** if pricing is unreadable / value unclear / operator has not replied `cost approved`, post a Linear comment `Pricing unconfirmed — pending operator decision` and STOP at this gate. Do not commit code (Tasks 5+) until unblocked.

**Phase B — Code**

- [ ] **Task 5 — Add SDK dep.** `pnpm add @anthropic-ai/sdk -F @app-gether-life/api`. Commit lockfile + `package.json`. **STOP** if the diff touches any other workspace `package.json` (cross-package lockfile bleed). If Task 2 confirmed the SDK lacks `client.beta.agents`, this task still installs the SDK for messages/types parity, but Tasks 6 + 10 use raw `fetch` instead.
- [ ] **Task 6 — Write `scripts/managed-agent-create.ts`.** Inline the agent config from the "Agent Config" table (model, system prompt, tools, MCP servers, skills, network, secrets, env-setup-script). Use `client.beta.agents.create` if Task 2 confirmed it; else raw `fetch POST https://api.anthropic.com/v1/agents` with `anthropic-beta: managed-agents-2026-04-01` and the same `ANTHROPIC_AGENT_BETA` constant exported from a shared location (or duplicated literal — flag as tech debt). On success print `agent_id` to stdout; on 4xx/5xx exit non-zero with the response body. Type-check + lint green. Commit alone.
- [ ] **Task 7 — Run the create script. Capture and provision `agent_id`.** `ANTHROPIC_API_KEY=<key> pnpm tsx scripts/managed-agent-create.ts`. Copy the printed id. Set `ANTHROPIC_AGENT_ID` in Vercel preview + production via `vercel env add ANTHROPIC_AGENT_ID preview` and `vercel env add ANTHROPIC_AGENT_ID production`. Set in GHA via `gh secret set ANTHROPIC_AGENT_ID --repo gether-life/app-gether-life`. Add `ANTHROPIC_API_KEY` to Vercel preview + production if not already. **Verify** with `gh secret list --repo gether-life/app-gether-life | grep ANTHROPIC_AGENT_ID` (must return a hit) so Task 13's `ci-complete.yml` smoke does not silently resolve `secrets.ANTHROPIC_AGENT_ID` to empty. Paste the printed `agent_id` (last 4 chars only — never the full id) and the run timestamp into `plan-build-1.md`.
- [ ] **Task 8 — Append `ANTHROPIC_AGENT_ID` to `scripts/secrets-sync-github.sh`.** The script's `GITHUB_KEYS=( ... )` array (lines 29-34) drives both push and cleanup; cleanup phase deletes any GHA secret not in `GITHUB_KEYS`. Append `"ANTHROPIC_AGENT_ID"` alongside existing `"ANTHROPIC_API_KEY"`. Verify via `bash scripts/secrets-sync-github.sh --dry-run` that the proposed action set does not include removal of `ANTHROPIC_AGENT_ID`. Without this edit, the next sync run will wipe the GHA secret set in Task 7.
- [ ] **Task 9 — Update `packages/env/src/index.ts`** with the two new optional env vars (`ANTHROPIC_API_KEY`, `ANTHROPIC_AGENT_ID`) in `server` and `runtimeEnv` blocks per Architecture section. `pnpm typecheck` clean. NOTE: do NOT register the 4 BAR-101 envs (`LINEAR_*`, `GH_TOKEN`) — out of scope.
- [ ] **Task 10 — Modify `packages/api/src/routes/linear.ts`.** Replace lines 157-202 with Sessions API call + Linear comment post. Keep all preceding lines verbatim. Constant `ANTHROPIC_AGENT_BETA`. Cursor branch becomes no-op with comment. Type-check + lint green.
- [ ] **Task 11 — Update `packages/api/src/routes/linear.test.ts`** per Derived Test Matrix. Re-mock `api.anthropic.com`. Add 6 new cases. Preserve all existing 14 cases. `pnpm turbo test --filter='packages/api'` green.
- [ ] **Task 12 — Modify `.github/workflows/ci-complete.yml`** dispatch step to call `api.anthropic.com` and post session URL via Linear `commentCreate`. yamllint clean.

**Phase C — End-to-end verification (claude.yml still in place)**

- [ ] **Task 13 — Push branch, open PR.** Confirm CI green. Push triggers `ci-complete.yml` (only on merge to dev would it actually fire `workflow_run` for CI — for PR validation, manual `workflow_dispatch` against the PR branch). Verify `ci-complete.yml` correctly calls Anthropic Sessions API for a real `BAR-TEST` issue.
- [ ] **Task 14 — Live route smoke.** With Vercel preview deployment up, post `@claude /design BAR-TEST` on Linear. Confirm:
  - Linear comment `Claude session: <url>` posted within 5 s.
  - URL opens a live Anthropic session showing the agent running.
  - Design doc committed to a new branch.
  - `gh run list --workflow=claude.yml --limit=1` shows **no new run** for this dispatch (because route now bypasses GHA).
- [ ] **Task 15 — Capture post-swap latency.** Repeat Task 1's measurement methodology over ≥5 sessions. Append to `latency-baseline.md`. **Threshold:** post-swap p50 must be **≤ 50% of baseline p50 OR ≥ 30 s absolute reduction**, whichever is met first. Anything weaker (e.g., 1ms reduction within sample noise) is insufficient — STOP and post a Linear blocker comment with the captured numbers. Record the delta + threshold-met decision in `latency-baseline.md`.

**Phase D — Removal (last commit)**

- [ ] **Task 16 — Delete `.github/workflows/claude.yml` (FINAL commit).** Capture deletion SHA and the file's content at that SHA into `plan-build-1.md` for rollback reference. Push as a separate commit `chore({FID}): delete claude.yml — superseded by Managed Agents`. **MANDATE:** this MUST be the FINAL commit on the branch, alone (no other file changes mixed in). **PR merge mode = `rebase-and-merge` (squash-merge prohibited)** so commit-boundary ordering of route swap before `claude.yml` deletion is preserved on `dev`. If repo policy forces squash, split into PR-A (Tasks 5-15) merged + smoke-verified on `dev` first, then PR-B (Task 16 alone). Re-run Task 14 smoke to confirm route still works.
- [ ] **Task 17 — Backup branch (rollback insurance, Open Q6 resolution).** Create `git branch backup/claude-yml-pre-bar-120 <SHA-before-delete>` and push: `git push origin backup/claude-yml-pre-bar-120`. Documented in `docs/decisions.md` ADR.

### 🔒 Gate 2: Code Implementation Check

- [ ] **Gate 2 - Verified:** Every checkbox above checked off against the plan. Tasks 13-15 produced visible Linear evidence (URLs pasted in the build log).

> [!IMPORTANT]
> Backend route logic = Vitest unit only (per `docs/testing.md`). No Playwright. No live integration test in CI.

**Mandatory Tasks (Testing & Documentation):**

- [ ] **Verify test coverage against Derived Test Matrix:** all 9 rows covered; rows 7-9 are runbook tasks, rows 1-6 are committed Vitest cases.
- [ ] **Update existing tests:** rename `dispatches linear-claude-task ...` → `dispatches Managed Agents session ...`; cursor case now asserts no dispatch.
- [ ] **Write new tests** per Derived Test Matrix rows 1-6.
- [ ] **Verify observability:** new `console.error("[Linear Agent] Sessions API failed", {metadata: {status, sessionId, issueId}})` lines added; `[Linear Agent]` prefix preserved for log-drain regex.
- [ ] **Update documentation** per `Documentation Updates` table — rewrite `docs/architecture.md` flow section (no lazy bullet append).

### 🔒 Gate 3: Testing & Documentation Check

- [ ] **Docs updated:** every row in `Documentation Updates` complete.
- [ ] **Gate 3 - Verified.**

## Verification Plan

### Automated Tests

- [ ] **Type Check & Lint:** `pnpm turbo lint typecheck format:check --filter='packages/api' --filter='packages/env'` green.
- [ ] **Unit Tests:** `pnpm turbo test --filter='packages/api'` green (≥20 cases).
- [ ] **YAML lint:** `npx js-yaml .github/workflows/ci-complete.yml` valid; `claude.yml` absent (`test ! -f .github/workflows/claude.yml`).
- [ ] **Workflow dry-run:** `gh workflow view ci-complete.yml` shows valid action graph.
- [ ] **Run all tests:** `pnpm turbo lint typecheck format:check test` clean across the monorepo. No integration tests touch live Sessions API in CI.

### 🔒 Gate 4: Automated Verification Confirmed

- [ ] **Gate 4 - Verified.**

### Manual Verification

> [!WARNING]
> **Dashboard Ban:** use `gh`, `vercel`, `curl` from CLI.

- [ ] **Step 1 — Live Linear smoke (post-deploy).** Post `@claude /design BAR-TEST`; observe `Claude session: <url>` Linear comment within 5 s; click URL; confirm session view live.
- [ ] **Step 2 — Confirm `claude.yml` extinction.** `gh run list --workflow=claude.yml --limit=10 --json createdAt,databaseId` — no runs newer than the deletion SHA.
- [ ] **Step 3 — Latency improvement.** Compare `latency-baseline.md` before/after blocks; confirm Task 15 threshold met (post-swap p50 ≤ 50% of baseline p50 OR ≥ 30 s absolute reduction).
- [ ] **Step 4 — `ci-complete.yml` chain.** Push a trivial commit on a `feat/**` branch with AGENT_METADATA + Automated label; observe `ci-complete.yml` run dispatch a Managed Agents session (not a GHA `claude.yml` run); session URL posted to Linear.
- [ ] **Step 5 — Rollback rehearsal (dry-run).** `git revert --no-commit <merge SHA>` locally; confirm `claude.yml` restored byte-exact via `git diff <revert> backup/claude-yml-pre-bar-120 -- .github/workflows/claude.yml` empty. Discard.
- [ ] **Step 6 — Cost spot-check.** After 24 h of post-merge usage, pull Anthropic console usage page; compare against pre-merge GHA + token cost. Annotate Linear issue with finding.
