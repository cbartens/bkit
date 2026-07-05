<!-- Note: Draft plan output for BAR-148 Option 1 (bkit-ci-router via claude-code-action). -->

# bkit-ci-router (Option 1 — `claude-code-action`) Implementation Plan

> [!CAUTION]
> **CRITICAL:** Do not hallucinate plan execution state.
>
> 1. ALWAYS read this actual `plan.md` file natively via the `read_file` tool _before_ executing any steps.
> 2. NEVER trust system-generated session summaries or previous conversation history to determine what has been completed.
> 3. Your source of truth is EXCLUSIVELY the literal `[x]` vs `[ ]` checkboxes in this physical document. If a box is `[ ]`, it is NOT DONE, regardless of what the conversation context implies.

## Context & Goals

`bkit-build` Step 17 closes the loop with a CI-trigger commit and exits. From there, the operator manually watches CI and dispatches `/bkit-ship` (green) or `/bkit-debug DEBUG_MODE=pr` (red). BAR-148 closes that gap with a **tiny separate router workflow** that wakes on CI completion, reads canonical state from `status.json`, and dispatches the matching skill in a fresh Claude Code session inside a GHA runner. Option 1 of the BAR-148 design is selected: dispatch via `anthropics/claude-code-action@v1`, scaffolding ported from gether's deleted `ci-complete.yml` (`03b0c502`).

The router is **not** Step 18 of `bkit-build`. Chaining ship/debug into the same orchestrator session triggers context-window pressure (per-step `COMMENT_BODY` accumulation, repeated `status.json` re-reads, cumulative gate verifications). The split keeps each orchestrator's context small and the contract — `status.json` + Linear comment-id + plan files on disk — already bears the load.

**Success Criteria:**

- A CI completion on a branch matching `feat/**` with the Linear `bkit:auto-route` label opt-in dispatches `/bkit-ship {FID}` on green or `/bkit-debug {FID}` on red, in a fresh Claude Code session, posting the session URL back to the Linear comment.
- The router only routes on the run matching the PR's current head SHA (stale-run guard) and never cancels an in-flight ship/debug session (concurrency `cancel-in-progress: false`).
- Consumer repos receive `.github/workflows/bkit-ci-router.yml` via `bkit install` (Tier-3 seed-or-print) without overwriting consumer customisations; required secret is `ANTHROPIC_API_KEY` documented in deployments.md.

---

## 👤 ⚠️ Acceptance Scenario — HUMAN REVIEW REQUIRED

> [!CAUTION]
> **🛑 HUMAN MUST READ AND CONFIRM THIS SECTION.**
> This is the testable contract for the feature. Everything below — implementation, tests, verification — is derived from what you confirm here. If this is wrong, everything downstream is wrong.

### Spec — what good looks like

> [!IMPORTANT]
> Subagents follow this spec. No subagent restates these rules; this section is the single source of truth.

### Narrative _(plan-authored — design doc absent for this FID)_

A bkit-build run pushes its CI-trigger commit and exits. Within seconds of CI finishing on the PR's head SHA, the bkit-ci-router workflow wakes, reads `status.json` to recover `{FID}`, decides ship-vs-debug from the PR's `statusCheckRollup`, and invokes `/bkit-ship {FID}` or `/bkit-debug {FID}` inside a fresh Claude Code session on the GHA runner. The router posts the session URL back to the existing Linear comment for the issue and exits. No human action is required between `bkit-build` close and the dispatched session starting.

### Success Criteria

- CI completes on a `feat/**` branch with `bkit:auto-route` label → router dispatches matching skill in a fresh Claude Code session within 60s.
- Green CI rollup → `/bkit-ship {FID}`; red → `/bkit-debug {FID}` (which auto-detects PR-mode and reads `MAX_DEBUG_ATTEMPT`-bounded debug counter from `status.json`).
- Router refuses to dispatch when `gh run` head SHA does not match the PR's current head SHA (stale-run guard).
- Two CI completions on the same branch never cancel an in-flight router session (`cancel-in-progress: false`).
- Linear `bkit:auto-route` label absent → router exits with a no-op comment (opt-in safety).

### Key Edge Cases _(plan-authored — design doc absent)_

- Stale CI run completing after a newer commit: router reads `gh run list --branch {BRANCH} --limit 1 --json databaseId,headSha,conclusion`; if `headSha != pr.headRefOid` → no-op exit with reason logged.
- `MAX_DEBUG_ATTEMPT` reached: `/bkit-debug` orchestrator's existing ceiling (read from `status.json`'s most recent `workflow == "debug"` entry) → router still dispatches; the debug skill itself fails fast and fires its handover path.
- Two CI runs complete back-to-back (debug pushed a new commit while previous router session still running): concurrency group `bkit-ci-router-${{ github.event.workflow_run.head_branch }}` with `cancel-in-progress: false` → second run queues behind first.
- `ANTHROPIC_API_KEY` secret missing: router job fails at the `anthropics/claude-code-action@v1` step with a clear error; consumer-side documentation explains the secret requirement.
- Label absent: router exits at the label-gate step with a "no-op (label `bkit:auto-route` absent)" comment.
- `bkit-build` failed before close-workflow: `status.json` is `failed` and there is no PR → router uses `gh pr list --head ${{ github.event.workflow_run.head_branch }} --base dev` to confirm; PR empty → no-op exit.

### Concrete Example

**Setup:** Consumer repo has `.github/workflows/bkit-ci-router.yml` installed (via `bkit install` v1.x), `ANTHROPIC_API_KEY` secret set, Linear issue `BAR-260` labelled `Build` + `bkit:auto-route`. `/bkit-build BAR-260` has just completed, pushed `feat/bar-260-foo-bar`, and PR #42 is open against `dev`. CI on that PR finishes red (1 failing test).

**Steps:**

1. Operator runs `/bkit-build BAR-260` → bkit-build closes, CI-trigger commit on PR head SHA `a1b2c3d`.
2. CI workflow on PR #42 finishes with `conclusion: failure` → fires `workflow_run` event of type `completed`.
3. `bkit-ci-router.yml` wakes, filters on `head_branch =~ feat/**` and `conclusion in (success, failure)`.
4. Router reads `docs/plans/logs/bar-260-foo-bar/status.json` → `{FID}` = `bar-260-foo-bar`. Confirms via `gh issue view` that the issue carries `bkit:auto-route` label → proceed.
5. Router calls `gh run list --branch feat/bar-260-foo-bar --limit 1 --json databaseId,headSha,conclusion` and `gh pr view 42 --json headRefOid` → asserts `headSha == headRefOid` (stale-run guard).
6. `conclusion == failure` → dispatch `anthropics/claude-code-action@v1` with `prompt: "/bkit-debug bar-260-foo-bar"` and `claude_args: "--allowed-tools=Bash,Edit,Write,Read,Grep,Glob,WebFetch,Skill,mcp__linear__*"`.
7. Router job appends `### bkit-ci-router → /bkit-debug bar-260-foo-bar` block to existing Linear comment with the GHA run URL.
8. Claude Code session starts; runs the existing `/bkit-debug` orchestrator end-to-end on the runner; debug pushes its `fix({FID}): debug attempt 1/3` commit to `feat/bar-260-foo-bar`; CI fires again.
9. Next CI completion → router wakes again; loop continues bounded by `MAX_DEBUG_ATTEMPT` = 3.

**Outcome:** Without operator intervention, debug is dispatched within ~60s of CI completion; subsequent CI runs auto-route through the same path until either green (ship dispatch) or `MAX_DEBUG_ATTEMPT` exhaustion (debug handover comment posted to Linear).

### Edge Cases

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| Stale CI run (run head SHA ≠ PR head SHA) | Router exits no-op; logs "stale run, skipping" to GHA + Linear comment. |
| Linear `bkit:auto-route` label absent | Router exits no-op; logs "opt-in absent" comment to Linear. |
| `ANTHROPIC_API_KEY` secret missing | `claude-code-action@v1` step fails with explicit error; router job ends `failure`; Linear comment captures GHA URL with stderr tail (Failure Path mirror). |
| Two CI runs back-to-back on same branch | Second router run queues behind first (`cancel-in-progress: false`); never cancels in-flight ship/debug. |
| `MAX_DEBUG_ATTEMPT` reached upstream | Router still dispatches `/bkit-debug`; debug orchestrator's existing ceiling enforces handover. |
| `status.json` missing or malformed | Router exits failure with explicit error; no skill dispatched. |
| PR closed (e.g. ship merged before router fires) | `gh pr view` returns no open PR → router exits no-op. |
| `feat/**` filter mismatch (e.g. branch `fix/...`) | `workflow_run` GHA branch filter rejects before router job even starts. |
| Runner 6h ceiling | Out of scope to enforce; debug `MAX_DEBUG_ATTEMPT` = 3 plus per-attempt 3600s timeout caps total runtime well under 6h in observed runs. |
| Consumer overwrote `bkit-ci-router.yml` | `bkit install` Tier-3 seed-or-print prints AI-actionable merge instructions; never overwrites. |

### Derived Test Matrix

> Each row → one Agent Execution Runbook task.

<!-- prettier-ignore -->
| Test description | Type | Target file |
| --- | --- | --- |
| `runCiRouterModule` seeds `.github/workflows/bkit-ci-router.yml` (Tier-3) when absent | Unit (Vitest) | `.agents/scripts/bkit-modules.test.ts` |
| `runCiRouterModule` prints merge instructions and does not overwrite when consumer file present | Unit (Vitest) | `.agents/scripts/bkit-modules.test.ts` |
| Installer integration writes router workflow + records `canonicalHash` (DE-10) | Integration (Vitest) | `.agents/scripts/bkit-install.integration.test.ts` |
| Installer parity: dry-run writes match real-run writes for router workflow | Integration (Vitest) | `.agents/scripts/bkit-dry-run-parity.integration.test.ts` |
| Action YAML lint of `.github/workflows/bkit-ci-router.yml` (top-level keys, schema) | Unit (Vitest) | `.agents/scripts/bkit-action-yaml.test.ts` |
| Templates snapshot includes `templates/.github/workflows/bkit-ci-router.yml` | Unit (Vitest) | `.agents/scripts/templates.test.ts` (snapshot) |
| `bkit check` reports drift if router workflow modified | Integration (Vitest) | `.agents/scripts/bkit-modules.integration.test.ts` |
| Router orchestrator (`bkit-ci-router.md`) authoring conventions pass `bkit check` | Unit (Vitest) | `.agents/scripts/release-workflow.test.ts` (or new check) |

### 👤 ✅ Human Confirmation

- [ ] **Acceptance Scenario confirmed:** I have reviewed the Narrative, Success Criteria, Concrete Example, Edge Cases, and Derived Test Matrix above. They correctly describe what "done" looks like.

> [!CAUTION]
> **Agent:** Do NOT pass Gate 1 until this checkbox is `[x]`. Summary must issue `REVISE` if unchecked.

---

## 👤 ⚠️ Breaking Changes & Naming Review — HUMAN REVIEW REQUIRED

> [!CAUTION]
> **🛑 HUMAN MUST READ AND CONFIRM THIS SECTION.**
> Review proposed names and breaking changes below.

> [!IMPORTANT]
> **No breaking changes.** Plan adds a new orchestrator (`.agents/workflows/bkit-ci-router.md`), a new GHA workflow (`.github/workflows/bkit-ci-router.yml`), a new template (`.agents/templates/.github/workflows/bkit-ci-router.yml`), a new installer module (`runCiRouterModule` in `.agents/scripts/bkit-modules.ts`), and a new Linear label (`bkit:auto-route`). Existing workflows, templates, and skills are untouched.

### Proposed names

<!-- prettier-ignore -->
| Artifact | Proposed name | Rationale |
| --- | --- | --- |
| Orchestrator file | `.agents/workflows/bkit-ci-router.md` | Mirrors existing 5 phase orchestrators' naming. |
| GHA workflow | `.github/workflows/bkit-ci-router.yml` | Same kebab as orchestrator; visible in GHA UI. |
| Consumer template | `.agents/templates/.github/workflows/bkit-ci-router.yml` | Mirrors `templates/.github/workflows/ci.yml` Tier-3 pattern. |
| Installer module fn | `runCiRouterModule` | Mirrors `runCiModule`, `runClaudeModule`, `runCursorModule`. |
| CLI flag | `--ci-router` | Mirrors `--ci`, `--claude`, `--cursor`. |
| Linear label | `bkit:auto-route` | Per-issue opt-in; survives across debug iterations; `bkit:` prefix scopes the label namespace. |
| Concurrency group | `bkit-ci-router-${{ github.event.workflow_run.head_branch }}` | Branch-scoped; `cancel-in-progress: false` (never cancel in-flight ship/debug). |
| Linear comment header | `### bkit-ci-router → /bkit-{ship | debug} {FID}` | Mirrors existing `### Step N — Name` comment shape. |

### Breaking changes

None. New artifacts only; no existing artifact replaced. Consumers without `bkit:auto-route` label see zero behavioural change.

### 👤 ✅ Human Confirmation

- [ ] **Breaking Changes confirmed:** I have reviewed all breaking changes and naming decisions above.

> [!CAUTION]
> **Agent:** Do NOT pass Gate 1 until this checkbox is `[x]`. Summary must issue `REVISE` if unchecked.

---

## Alternative Approaches & Recommendations

**Selected:** Option 1 — GitHub Actions → `anthropics/claude-code-action@v1` (Claude runs inside the GHA runner).

**Rejected (per design):**

- Option 2 — GHA → Anthropic Managed Agents Sessions API. Decommissioned in gether (`7475b499`); never functional. Skip until Anthropic ships a working v2.
- Option 3 — GHA → `RemoteTrigger` to operator's claude.ai session. Couples to operator presence; not autonomous.
- Option 4 — `schedule` skill cron poll from claude.ai. Same operator-presence coupling.
- Option 5 — Manual gate (GHA writes routing decision; operator dispatches). Defeats the purpose.

**Future phase (out of scope):**

- Step 18 in `bkit-build` (chained orchestrator). Re-evaluate only if context-window budget materially grows and `status.json` is no longer the canonical resume-point contract.
- Per-PR opt-in (alternative to per-issue label). Reconsider if the per-issue label proves too coarse during ship cycles.

## Out of Scope

- Anthropic Managed Agents Sessions API (Option 2 path).
- Runner 6h ceiling enforcement beyond `MAX_DEBUG_ATTEMPT` = 3 + 3600s per-step timeout (already in place).
- Dead-letter queue / retry policy if `claude-code-action` itself crashes mid-step. Failure surfaces in the GHA run and the same Linear comment; remediation is operator-triggered.
- Custom dispatch-failure auto-retry (e.g. exponential backoff). Out of scope for v1.
- Cross-repo dispatch (router lives in same repo as the PR).
- Replacement of `bkit-build` Step 17 with Step 18-style chained dispatch.

## Merge Method

**Merge method: always squash.** `bkit-ship.md` Step 3 is hardcoded to `gh pr merge --squash --delete-branch --body ""`.

## Supersession Inventory

None — plan adds without replacing.

## Security & Privacy

> Reference: `docs/security.md`. (No security.md exists in this repo; bkit-repo Tier-2 docs section may seed it. Items below pertain to consumer-facing surface area.)

- [x] **New secret/env var** — `ANTHROPIC_API_KEY` is added to consumer-side documentation in `docs/deployments.md` template (under § "Required GHA secrets") with kill-date-free guidance. Stored in GHA repo secrets per consumer.
- [x] **Webhook** — `workflow_run` is GHA-internal; no signature verification needed. Filtered to `feat/**` branches and `conclusion in (success, failure)` to limit dispatch surface.
- [x] **PII** — router never logs raw PII. Only `{FID}`, `PR_NUMBER`, `headSha`, GHA run URL flow into the Linear comment.
- [x] **Secrets** — `ANTHROPIC_API_KEY` and `GH_BKIT_TOKEN_INSTALL` (existing) referenced via `${{ secrets.* }}`; never echoed.
- [x] **Permissions hardening** — router job declares `permissions: { contents: read, pull-requests: write, issues: write, actions: read }` only.
- [x] **Allowed tools sandbox** — `claude_args` passes `--allowed-tools=Bash,Edit,Write,Read,Grep,Glob,WebFetch,Skill,mcp__linear__*` to lock the runner-side Claude session to the same surface that `.claude/settings.json` already grants the local orchestrator.

## 🚨 Pre-Flight / Dependencies 🚨

### Core (always verify)

- [ ] **Package Management:** No new `package.json` deps. `pnpm-lock.yaml` unchanged. Verify with `pnpm install --frozen-lockfile` after plan applied.
- [ ] **Dependency Versions:** Confirm `anthropics/claude-code-action@v1` is the current pinned tag. Confirm `actions/checkout@v4`, `actions/setup-node@v4`, `pnpm/action-setup@v4` aligned with existing `ci.yml` template.
- [ ] **User Context:** Verify write access to `.agents/workflows/`, `.github/workflows/`, `.agents/templates/.github/workflows/`, `.agents/scripts/bkit-modules.ts`, `.agents/scripts/bkit-cli.ts`.
- [ ] **Pending Blockers:** Linear → no open `blocker` label issues mention BAR-148 / `bkit-ci-router` / `claude-code-action`.
- [ ] **Project Context:** Re-read `docs/decisions.md` (DE-3, DE-10, DE-12, DE-13 cover registry/install/upgrade behaviour) and `docs/knowledge.md` (KN-8: silent overwrite of consumer drift).
- [ ] **Testing & Quality:** `docs/testing.md` rule applied — installer module changes covered by `*.test.ts` (unit) + `*.integration.test.ts`; no Playwright (no UI surface).
- [ ] **Prerequisite Plans:** None — feature is additive. (BAR-148 design doc was not produced; this plan is a self-contained Option-1 implementation per the input issue.)

### Conditional (verify only when applicable)

- [ ] **Secrets & Env Vars:** `ANTHROPIC_API_KEY` is consumer-managed (added to consumer GHA repo secrets). bkit repo itself does not need this secret unless dogfooding the router.
- [ ] **Architecture & UI:** Validate per `.agents/workflows.md` § "Workflow Authoring Rules" and § "Common Workflow Anatomy". Validate template installer hook adheres to DE-9 (`.bkit-staging/`) and DE-10 (`canonicalHashes`) flows.
- [ ] **Observability:** Linear comment lifecycle conventions (`.agents/workflows.md` § "Linear Comment Lifecycle") followed by router orchestrator. Router emits one comment-append per step, never rewrites.

### 🔒 Gate 1: Prerequisites Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all applicable boxes above. **DO NOT stop for user permission.** Once saved, immediately proceed to `Data Schema Integration`.

- [ ] **Acceptance Scenario confirmed:** Human confirmed `👤 Acceptance Scenario` section (checkbox is `[x]`). _(Unchecked → Summary must issue `REVISE`.)_
- [ ] **Breaking Changes confirmed:** Human confirmed `⚠️ Breaking Changes & Naming Review` section (checkbox is `[x]`). _(Unchecked → Summary must issue `REVISE`.)_
- [ ] **Gate 1 - Verified:** All Core items checked. All applicable Conditional items checked.

## Data Schema Integration

### Data Schema Usage (Inputs & Outputs)

None — bkit is a tooling/CLI repo with no DB. State is filesystem-only:

- **Input (Read):** `docs/plans/logs/{FID}/status.json`, `gh pr view --json headRefOid,statusCheckRollup`, `gh run list --branch ... --json databaseId,headSha,conclusion`, Linear issue label list.
- **Output (Append):** Linear comment for `{COMMENT_ID}` with one new fenced section.

### Data Schema Changes

None. `status.json` shape unchanged. No new bkit canonical-state file. The router consumes only existing fields (workflow `IN_PROGRESS|DONE|FAILED`, last `commitSha`, last debug `attempt`).

## Architecture & Component Changes

> File-group justification anchored in `.agents/workflows.md` § "File Layout" and DE-9 / DE-10 (installer transactional + drift-aware semantics).

### Bkit Orchestrator (canonical source — `.agents/workflows/`)

#### [NEW] `.agents/workflows/bkit-ci-router.md`

- **Purpose:** Tiny GHA-runner-resident orchestrator that reads `status.json`, validates the head-SHA stale-run guard, decides ship vs debug, dispatches via `Skill`/skill-equivalent invocation in the runner-side Claude session, and appends a single Linear comment block.
- **Step skeleton (matches `.agents/workflows.md` § "Common Workflow Anatomy"):**
  1. Start Workflow — read `OWNER_REPO`, current `BRANCH`, parse `{FID}` slug from `docs/plans/logs/` (single `IN_PROGRESS` or last `DONE` entry on `BRANCH`).
  2. Worktree Setup — runner is the worktree; `cd` into checkout root; ensure `docs/plans/logs/{FID}/` accessible.
  3. Label Gate — `get_issue({ id: ISSUE_ID })` → assert `bkit:auto-route` in labels; absent → no-op exit comment.
  4. Stale-Run Guard — `gh run list --branch {BRANCH} --limit 1 --json databaseId,headSha,conclusion` → assert `headSha == gh pr view {PR_NUMBER} --json headRefOid` → mismatch → no-op exit comment.
  5. Resolve PR & Conclusion — set `CONCLUSION` ∈ `success|failure|cancelled`. `cancelled` → no-op exit.
  6. Dispatch — invoke skill-equivalent `/bkit-ship {FID}` (CONCLUSION=success) or `/bkit-debug {FID}` (CONCLUSION=failure) inside the runner Claude session. The router `.md` is consumed by `claude-code-action@v1` itself (the action's `prompt:` is `/bkit-ci-router {FID}`); the `.md` is the leaf orchestrator that runs to completion on the runner.
  7. Close Workflow — append final fenced section to Linear comment with GHA run URL; release `.lock` if used (router uses `docs/plans/logs/{FID}/.router-lock` namespaced apart from the build/debug/ship `.lock`).
- **Failure Path:** standard pattern (mark router status entry `FAILED`, append `### Workflow Failure` block to Linear comment, no `@bkit-debug-abort-handover` invocation — router has no retry loop).
- **Status entry shape (new):** appended array element `{ "workflow": "ci-router", "startedAt": ..., "status": "DONE|FAILED", "steps": [...] }`. Field semantics conform to `.agents/workflows.md` § "status.json".

#### [MODIFY] `.agents/workflows.md`

- **Existence Check:** Verified — file exists at `.agents/workflows.md`.
- Add row to "File Layout" diagram with `bkit-ci-router.md` description and step-count.
- Add a new "Per-Phase Workflow" subsection `### /bkit-ci-router — N steps` mirroring existing per-workflow tables (`Step | Subagent(s) | Notes`).
- Update § "Linear Integration" `Phase labels (mutually exclusive)` table — confirm `Router` slot already exists (it does) and document its router-flip behaviour. Add note: router does NOT add `Router` to `{LABELS}`; the existing build/debug/ship label flip absorbs phase tracking. (Or revise based on existing semantics; verify by re-reading.)
- Add § subsection "GHA Trigger Half" describing how `.github/workflows/bkit-ci-router.yml` is the tirgger and the `.md` is the leaf orchestrator dispatched on the runner.
- Update "Authoring Checklist for New / Refined Workflows" to flag the router as a leaf orchestrator with no Worktree Setup creation step (runner provides the worktree).

### GHA Workflow (bkit repo dogfood + template seed)

#### [NEW] `.github/workflows/bkit-ci-router.yml`

- **Purpose:** GHA trigger half. Wakes on `workflow_run` completion of the `CI` workflow, branch-filtered to `feat/**`. Dispatches `anthropics/claude-code-action@v1` with `prompt: "/bkit-ci-router"` plus context env vars.
- **Skeleton:**

  ```yaml
  name: bkit-ci-router
  on:
    workflow_run:
      workflows: [CI]
      types: [completed]
      branches: [feat/**]
  permissions:
    contents: read
    pull-requests: write
    issues: write
    actions: read
  concurrency:
    group: bkit-ci-router-${{ github.event.workflow_run.head_branch }}
    cancel-in-progress: false
  jobs:
    route:
      if: ${{ github.event.workflow_run.conclusion == 'success' || github.event.workflow_run.conclusion == 'failure' }}
      runs-on: ubuntu-latest
      timeout-minutes: 350 # ≤ runner 6h cap; debug × 3 attempts × ~3600s plus margin
      steps:
        - uses: actions/checkout@v4
          with:
            ref: ${{ github.event.workflow_run.head_sha }}
        - uses: actions/setup-node@v4
          with:
            node-version-file: .nvmrc
        - uses: pnpm/action-setup@v4
        - uses: cbartens/bkit/.github/actions/setup-auth@v1
          with:
            token: ${{ secrets.GH_BKIT_TOKEN_INSTALL }}
        - run: pnpm install --frozen-lockfile
          env:
            GH_BKIT_TOKEN_INSTALL: ${{ secrets.GH_BKIT_TOKEN_INSTALL }}
        - uses: anthropics/claude-code-action@v1
          env:
            ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
            GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
            CI_RUN_CONCLUSION: ${{ github.event.workflow_run.conclusion }}
            CI_RUN_HEAD_SHA: ${{ github.event.workflow_run.head_sha }}
            CI_RUN_HEAD_BRANCH: ${{ github.event.workflow_run.head_branch }}
            CI_RUN_URL: ${{ github.event.workflow_run.html_url }}
          with:
            anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
            prompt: "/bkit-ci-router"
            claude_args: "--allowed-tools=Bash,Edit,Write,Read,Grep,Glob,WebFetch,Skill,mcp__linear__*"
  ```

- **Consumer parity:** seeded template at `.agents/templates/.github/workflows/bkit-ci-router.yml` is byte-identical except `cbartens/bkit/.github/actions/setup-auth@v1` reference (already used in templates `ci.yml`).

#### [NEW] `.agents/templates/.github/workflows/bkit-ci-router.yml`

- **Purpose:** Tier-3 seed-or-print template installed into consumer repos by `bkit install`. Token-substituted (none currently — workflow has no consumer-specific tokens beyond inherited `GH_BKIT_TOKEN_INSTALL`).
- Body matches `[NEW] .github/workflows/bkit-ci-router.yml` above 1:1.
- Installer hashes the rendered template into `.agents/.bkit-version#canonicalHashes` per DE-10.

### Bkit Installer (`.agents/scripts/`)

#### [MODIFY] `.agents/scripts/bkit-modules.ts`

- **Existence Check:** Verified — file exists.
- Add new module function `runCiRouterModule(ctx: ModuleContext): void` mirroring `runCiModule`:
  - Resolve template at `path.join(PKG_ROOT, ".agents", "templates", ".github", "workflows", "bkit-ci-router.yml")`.
  - Destination at `path.join(".github", "workflows", "bkit-ci-router.yml")`.
  - Tier-3 (`writeTier3`) seed-or-print with new `CI_ROUTER_YML_MERGE_INSTRUCTIONS` constant: instructs AI agent to add the bkit-ci-router workflow alongside any existing GHA workflows; warns about `concurrency` group naming and `permissions:` block; lists `ANTHROPIC_API_KEY` secret requirement.
  - Append advisory `bkit-ci-router-secret-missing` if `ANTHROPIC_API_KEY` cannot be detected via repo-secret listing (best-effort — `gh secret list` for repos where consumer has gh CLI auth; otherwise emit advisory unconditionally).
  - Add `console.log` parity with `runCiModule`: `${logPrefix} ${tag}ci-router: ${dstPath}` on write, `(exists; AI merge instructions printed)` on suggest.
- Add module entry to dispatch order constant: `core → claude → cursor → ci → ci-router → lint → git-hooks` (insert after `ci`).

#### [MODIFY] `.agents/scripts/bkit-cli.ts`

- **Existence Check:** Verified — file exists.
- Add `--ci-router` `ModuleFlag` parallel to `--ci`.
- Update help text and module-list output.
- Update CLI `--all` (or equivalent default flag) to include the new module.

#### [MODIFY] `.agents/scripts/bkit-modules.test.ts`

- **Existence Check:** Verified — file exists.
- Add tests:
  - `runCiRouterModule` seeds when `.github/workflows/bkit-ci-router.yml` absent.
  - `runCiRouterModule` prints merge instructions when present (no overwrite).
  - Module dispatch order includes `ci-router` between `ci` and `lint`.

#### [MODIFY] `.agents/scripts/bkit-modules.integration.test.ts`

- **Existence Check:** Verified — file exists.
- Add integration test: `bkit install --ci-router` produces a destination file matching the template; subsequent `bkit check` passes; modifying the file → `bkit check` reports drift.

#### [MODIFY] `.agents/scripts/bkit-install.integration.test.ts`

- **Existence Check:** Verified — file exists.
- Add assertion that `.bkit-version#canonicalHashes` records a sha256 entry for `.github/workflows/bkit-ci-router.yml` post-install.

#### [MODIFY] `.agents/scripts/bkit-dry-run-parity.integration.test.ts`

- **Existence Check:** Verified — file exists.
- Extend dry-run-vs-real-run parity scope to include the new template.

#### [MODIFY] `.agents/scripts/bkit-action-yaml.test.ts`

- **Existence Check:** Verified — file exists.
- Add cases:
  - `templates/.github/workflows/bkit-ci-router.yml` parses as valid YAML.
  - Top-level keys are exactly `name`, `on`, `permissions`, `concurrency`, `jobs`.
  - `on.workflow_run.workflows` is `[CI]`, `types` is `[completed]`, `branches` includes `feat/**`.
  - `concurrency.cancel-in-progress` is `false`.
  - `jobs.route.timeout-minutes` ≤ 360.

#### [MODIFY] `.agents/scripts/templates.test.ts`

- **Existence Check:** Verified — file exists.
- Snapshot the new template path so unintended drift is caught.

#### [MODIFY] `.agents/scripts/release-workflow.test.ts`

- **Existence Check:** Verified — file exists.
- Add validation that `.agents/workflows/bkit-ci-router.md` adheres to authoring conventions (frontmatter `description`, `## 🤖 Failure Path`, `## 🤖 Step 1 — Start Workflow`, `### 🔒 Gate N` per step, all matching the existing 5 workflows' shape).

### Documentation Surface (mandatory by `.agents/docs.md`)

#### [MODIFY] `.agents/docs.md`

- **Existence Check:** Verified.
- Update Workflow Matrix to include CI-router column and document docs-relevant rows.
- Add full-catalog row for `.agents/workflows/bkit-ci-router.md` (or fold into the existing `.agents/workflows.md` reference if router doesn't introduce its own meta-doc).

#### [MODIFY] `.agents/templates/.agents/docs.md`

- **Existence Check:** Verified.
- Mirror change so consumers receive the same doc index.

#### [MODIFY] `.agents/prompts.md`

- **Existence Check:** Verified.
- Add note that `/bkit-ci-router` is a workflow, not a subagent — no `.agents/prompts/*.md` file is added. Direct readers to `.agents/workflows.md` for the per-step contract.

#### [MODIFY] `docs/decisions.md`

- **Existence Check:** Verified.
- Append `DE-14: bkit-ci-router via claude-code-action (Option 1)` ADR. Status `active`. Source `phase`. Discarded options 2/3/4/5 cited.
- Append `DE-15: Router as separate workflow (not Step 18 of bkit-build)` ADR. Status `active`. Reason: orchestrator context-window pressure; canonical state already in `status.json`. Source `phase`.

#### [MODIFY] `docs/knowledge.md`

- **Existence Check:** Verified.
- Append `KN-N: stale-CI-run dispatch hazard` (symptom: router routes on stale `gh run list` result; root cause: head-SHA mismatch; fix: cross-check `gh pr view --json headRefOid`).

#### [MODIFY] `docs/deployments.md`

- **Existence Check:** Verified.
- Add subsection "Required GHA secrets for bkit-ci-router (Option 1)": `ANTHROPIC_API_KEY` (consumer-side; not bkit repo).
- Add subsection "Linear label `bkit:auto-route` opt-in".

#### [MODIFY] `docs/pending.md`

- **Existence Check:** Verified.
- Append entry: "Per-PR opt-in alternative to `bkit:auto-route` Linear label" (deferred; revisit if per-issue label proves too coarse).
- Append entry: "Router dead-letter / retry policy if `claude-code-action@v1` crashes mid-step" (deferred; out of scope for v1).

### Cron Jobs & Scheduled Tasks

None.

## Documentation Updates

> Index: `.agents/docs.md`. Treat as code changes — rewrite prose, no lazy bullet appends.

<!-- prettier-ignore -->
| File | Change required |
| --- | --- |
| `.agents/workflows.md` | Add bkit-ci-router section (file-layout row, per-phase table, label-flip note, GHA-trigger subsection). |
| `.agents/docs.md` | Workflow matrix + full catalog updates for new orchestrator. |
| `.agents/templates/.agents/docs.md` | Mirror the source-side doc index. |
| `.agents/prompts.md` | Note that `/bkit-ci-router` is a workflow (no per-prompt file). |
| `docs/decisions.md` | Append `DE-14` (Option 1 dispatch) and `DE-15` (separate workflow). |
| `docs/knowledge.md` | Append `KN-N` (stale-run dispatch hazard). |
| `docs/deployments.md` | Document `ANTHROPIC_API_KEY` consumer secret + `bkit:auto-route` Linear label. |
| `docs/pending.md` | Append per-PR-opt-in and dead-letter-retry deferrals. |

## Rollback Strategy

<!-- prettier-ignore -->
| Axis | Action | Notes |
| --- | --- | --- |
| **Code** | `git revert {COMMIT}` for the BAR-148 squash commit; consumers run `bkit upgrade` to drop the template per DE-10/DE-13 idempotent path. | No DB; code-only. |
| **Consumer rollback** | Consumer can delete `.github/workflows/bkit-ci-router.yml` locally; bkit will not re-create on subsequent `bkit install` runs without the `--ci-router` flag (Tier-3 seed-or-print is idempotent — template not present in canonicalHashes after delete, so `bkit upgrade` no-ops). | Per DE-12 conservative default. |
| **Risk window** | Router is opt-in via `bkit:auto-route` label; no risk window for consumers without the label. | Zero blast radius for default consumers. |

## Agent Execution Runbook

> [!IMPORTANT]
> **Continuous Execution:** Work through this runbook autonomously. Do not pause for user permission at any Gate.
> **Step Isolation:** Complete each task fully (including its specific verification and checking its box) before starting the exact next task.
> **Progress Updates:** After checking off each major task, post a structured summary as a Linear comment per `.agents/workflows.md` § "Linear Comment Lifecycle".

**Implementation Tasks (chronological):**

### Phase A — Templates and source artifacts

- [ ] **A1:** Create `.agents/templates/.github/workflows/bkit-ci-router.yml` with the body in Architecture § GHA Workflow. Run `pnpm prettier --check .agents/templates/.github/workflows/bkit-ci-router.yml` to confirm no formatting drift.
- [ ] **A2:** Create `.github/workflows/bkit-ci-router.yml` in this repo (dogfood). Mirror template byte-for-byte except for any consumer-specific tokens (none currently).
- [ ] **A3:** Create `.agents/workflows/bkit-ci-router.md` per Architecture § Bkit Orchestrator. Steps 1–7 implemented per `.agents/workflows.md` § Common Workflow Anatomy. Frontmatter, Caution block, Failure Path, every step gate, all `save_comment` append fenced sections, status.json shape (new `workflow: "ci-router"` array element).

### Phase B — Installer module wiring

- [ ] **B1:** In `.agents/scripts/bkit-modules.ts`, add `runCiRouterModule(ctx)` mirroring `runCiModule`. Define `CI_ROUTER_YML_MERGE_INSTRUCTIONS` constant.
- [ ] **B2:** Insert `runCiRouterModule` into the module-dispatch list (`core → claude → cursor → ci → ci-router → lint → git-hooks`).
- [ ] **B3:** In `.agents/scripts/bkit-cli.ts`, add `--ci-router` ModuleFlag, update help text, update default-all flag if applicable.
- [ ] **B4:** Wire installer to record `canonicalHashes` entry for `.github/workflows/bkit-ci-router.yml` per DE-10. Verify by reading `.agents/scripts/bkit-version.ts` `recordCanonicalHash` helper signature; no schema change.

### Phase C — Tests (Derived Test Matrix coverage)

- [ ] **C1:** `.agents/scripts/bkit-modules.test.ts` — add three cases: seed-when-absent, print-when-present, dispatch-order-includes-ci-router.
- [ ] **C2:** `.agents/scripts/bkit-modules.integration.test.ts` — add `bkit install --ci-router` integration test (write → drift → `bkit check` reports drift).
- [ ] **C3:** `.agents/scripts/bkit-install.integration.test.ts` — assert `.bkit-version#canonicalHashes` records the new path post-install.
- [ ] **C4:** `.agents/scripts/bkit-dry-run-parity.integration.test.ts` — extend parity coverage to the new template.
- [ ] **C5:** `.agents/scripts/bkit-action-yaml.test.ts` — add YAML structural tests (top-level keys, `cancel-in-progress: false`, branch filter, `timeout-minutes`).
- [ ] **C6:** `.agents/scripts/templates.test.ts` — extend the snapshot to include the new template path.
- [ ] **C7:** `.agents/scripts/release-workflow.test.ts` — add authoring-conventions check for `bkit-ci-router.md` (frontmatter, Failure Path section, every step has `### 🔒 Gate N`).

### Phase D — Documentation (per `.agents/docs.md` index)

- [ ] **D1:** Update `.agents/workflows.md`: add file-layout row, per-phase `### /bkit-ci-router` subsection (table form: Step | Subagent(s) | Notes), GHA trigger subsection, authoring-checklist note for leaf orchestrators with no Worktree Setup.
- [ ] **D2:** Update `.agents/docs.md` (and template mirror `.agents/templates/.agents/docs.md`) with new workflow matrix column (or row, depending on existing shape) and full-catalog row.
- [ ] **D3:** Update `.agents/prompts.md` with the "no per-prompt file" note.
- [ ] **D4:** Append `DE-14` and `DE-15` to `docs/decisions.md`.
- [ ] **D5:** Append `KN-N` (stale-run dispatch) to `docs/knowledge.md`.
- [ ] **D6:** Update `docs/deployments.md` with `ANTHROPIC_API_KEY` and `bkit:auto-route` label sections.
- [ ] **D7:** Append two deferral entries to `docs/pending.md`.

### Phase E — Mirror regen and bkit-repo-only checks

- [ ] **E1:** Run `pnpm bkit install` to regenerate `.claude/commands/` and `.cursor/commands/` mirrors per `.agents/rules.md` § "bkit Repo Authoring".
- [ ] **E2:** Run `pnpm check:dist` to regenerate `dist/` for any TS changes in `.agents/scripts/*.ts`.
- [ ] **E3:** Run `pnpm bkit check` to confirm no drift in mirrored artifacts (per the bkit-repo-only pre-push gate).

### 🔒 Gate 2: Code Implementation Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below.

- [ ] **Gate 2 - Verified:** Every checkbox above independently verified and checked off against the plan.

> [!IMPORTANT]
> **Testing Strategy (See `docs/testing.md`):** Backend/installer logic in Vitest (`*.test.ts` unit, `*.integration.test.ts` integration). No Playwright (no UI surface). All tests live in `.agents/scripts/*.test.ts` per existing pattern.

**Mandatory Tasks (Testing & Documentation):**

- [ ] **Verify test coverage against Derived Test Matrix:** Each row → corresponding C-task above. All eight rows covered.
- [ ] **Update existing tests:** Snapshot updates in `templates.test.ts`; existing module tests extended with the new dispatch-order assertion.
- [ ] **Write new tests:** Per Phase C (C1–C7).
- [ ] **Verify observability:** Router orchestrator's Linear comment append shape conforms to `.agents/workflows.md` § "Linear Comment Lifecycle". `console.error` not applicable (no runtime backend); router's failure surface is the GHA run log + Linear comment.
- [ ] **Update documentation:** Per Phase D (D1–D7).

### 🔒 Gate 3: Testing & Documentation Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below.

- [ ] **Docs updated:** Every row in § Documentation Updates completed. `.agents/docs.md` still accurate.
- [ ] **Gate 3 - Verified:** Every checkbox above independently verified and checked off.

## Verification Plan

### Automated Tests

- [ ] **Type Check & Lint:** `pnpm typecheck` and `pnpm lint:prose` pass with zero errors.
- [ ] **Test Synchronization:** No existing E2E/Playwright tests to update.
- [ ] **Build Configuration:** No `tsconfig.json` exclude additions needed (template files are not TS-compiled).
- [ ] **Unit (`bkit-modules.test.ts`):** Seed/print/dispatch-order cases pass.
- [ ] **Unit (`bkit-action-yaml.test.ts`):** YAML structural cases pass.
- [ ] **Unit (`templates.test.ts`):** Snapshot updated and committed.
- [ ] **Unit (`release-workflow.test.ts`):** Authoring-conventions check for `bkit-ci-router.md` passes.
- [ ] **Integration (`bkit-modules.integration.test.ts`):** Install-then-drift roundtrip passes.
- [ ] **Integration (`bkit-install.integration.test.ts`):** `canonicalHashes` records the new path.
- [ ] **Integration (`bkit-dry-run-parity.integration.test.ts`):** Dry-run / real-run parity holds for the new template.
- [ ] **Run all tests:** `pnpm turbo lint typecheck test` passes locally. (Integration tier is debug-workflow only per `.agents/rules.md`; pre-PR is unit only.)

> [!IMPORTANT]
> **No Architectural Downgrades**: If you encounter build/compiler/test errors during verification, NEVER resolve them via hot fixes. Halt if stuck.

### 🔒 Gate 4: Automated Verification Confirmed

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below.

- [ ] **Gate 4 - Verified:** Every checkbox in Automated Tests independently verified and checked off. Explicit proof gathered.

### Manual Verification

> [!WARNING]
> **Dashboard Ban:** Use local CLIs (`gh`, `pnpm bkit ...`) to verify pipelines.

- [ ] **Step 1:** In a temp consumer repo (or in this repo's dogfood), run `pnpm bkit install --ci-router` → confirm `.github/workflows/bkit-ci-router.yml` written; confirm `.agents/.bkit-version` `canonicalHashes` includes the new path; confirm `bkit check` reports no drift.
- [ ] **Step 2:** Run `pnpm bkit install --ci-router` a second time on the same checkout — confirm idempotent (no writes, no advisories beyond `bkit-ci-router-secret-missing` if `ANTHROPIC_API_KEY` not detected).
- [ ] **Step 3:** Locally introduce drift (modify the consumer-side workflow) → run `pnpm bkit check` → confirm drift detected per DE-12 (`isConsumerModified` defaults to `true` for unknown).
- [ ] **Step 4:** Run `pnpm bkit upgrade` on a repo where the prior canonical hash matches → confirm it's seeded into `canonicalHashes` per DE-13 reseed-on-skip path.
- [ ] **Step 5:** End-to-end smoke (post-merge, requires `ANTHROPIC_API_KEY` in this repo for dogfood): create a feature branch with `bkit:auto-route` label on the linked Linear issue, push a deliberately-failing commit → confirm CI fails → confirm `bkit-ci-router` GHA workflow wakes → confirm Claude session starts → confirm Linear comment appended with GHA run URL → confirm debug commit pushed back to `feat/...` branch.
