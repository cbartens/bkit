# Plan Input — 141-cloud-app

## Session prompt

`/bkit-plan issue 141 BUT Implementation brief: plan from the FINAL SCOPE comment`
(`https://github.com/cbartens/bkit/issues/141#issuecomment-4542046671`).
**Earlier comments are exploration/diagnosis — superseded on conflict.**

## Authoritative source directive

> [!IMPORTANT]
> The **FINAL SCOPE** comment (`issuecomment-4542046671`, titled "🎯 FINAL SCOPE —
> bkit-cloud rebuild on the Claude GitHub App (one coherent change)") is the **master
> record** and the canonical scope for this plan. It explicitly states "Nothing
> deferred — all moving parts discovered here are in scope," and carries its own
> verification checklist.
>
> The issue body and the earlier comments (Discussion & decisions, integration check,
> `@claude` mention path, the "three real defects" diagnosis, the "Agreed design"
> comment, the "App = base install requirement" comment) are **exploration and
> diagnosis that led to the FINAL SCOPE**. Where any earlier comment conflicts with
> the FINAL SCOPE comment, the FINAL SCOPE comment wins. Earlier comments may be used
> for additional context/rationale only where they do not contradict it.
>
> This is a **standalone plan** (no parent design doc). Plan directly from the FINAL
> SCOPE comment's locked decisions, folded defects, coupling with #184, in-scope
> surfaces table, internal ordering, and verification checklist.

---

## Issue #141 — bkit-cloud GitHub issue-label trigger for design/plan/build

State: open · Labels: enhancement, bkit:plan · Milestone: Managed Cloud Agents

### Body

Follow-up to #119 (Phase 1 shipped in #139). Phase 1 built the phase-agnostic `bkit-cloud` workflow + made `design`/`plan`/`build` reachable via `workflow_dispatch`. Phase 2 adds the **event-driven trigger layer** so phases launch from tracker activity without a human touching CI.

#### Cloud-agent support matrix (the orienting model)

The two cloud stacks are **not symmetric** — each pairs with one tracker:

<!-- prettier-ignore -->
| Agent (the agent, not the editor) | Trigger paths | Tracker | NOT supported |
| --- | --- | --- | --- |
| **Claude Code** (terminal — any IDE host) | A) Claude iOS/desktop app → Claude-on-web env (`.claude/hooks/cloud-bootstrap.sh` + claude.ai env) · B) manual `workflow_dispatch` · C) **GitHub issue label/state → webhook → `bkit-cloud` GH Action** · D) GitHub CI pass/fail → `bkit-cloud` | **GitHub** | **Linear** |
| **Cursor** (native agent) | A) Cursor's built-in cloud-agent launch · B) GitHub integration on PR events (CI pass/fail) · C) **Linear → Cursor integration** | **Linear** (+ GitHub PR events) | **GitHub Projects/Issues** |

**Claude cloud ↔ GitHub; Cursor cloud ↔ Linear.** They overlap only on GitHub CI/PR events.

#### Phase 2 scope (narrowed by the matrix)

- **GitHub issue-label trigger (path C):** native `on: issues: types: [labeled]` (+ status-equivalent) → `bkit-cloud` workflow. Fires when the issue has `bkit:auto` **and** transitions into _In Progress_ (from any prior state — re-runs are _In Review → In Progress_ with the label still on). The workflow reads the issue's `bkit:` label to select the phase (`bkit:design`/`bkit:plan`/`bkit:build`; ship/debug stay CI-driven).
- **~~Linear webhook bridge~~ — DROPPED.** Linear → cloud agent goes through **Cursor's native Linear integration**, not a Linear→`repository_dispatch`→`bkit-cloud` bridge. No bridge infra needed. (This removes the open "bridge shape" question from #119.)

#### Label convention (decided 2026-05-24)

All bkit labels carry a **`bkit:` prefix on every tracker** — `bkit:auto` (opt-in gate), `bkit:design`/`bkit:plan`/`bkit:build`/`bkit:debug`/`bkit:ship` (phase). Migrate Linear's bare `Auto` → `bkit:auto` (preflight hooks + `.agents/trackers.md` Linear snippets currently still use bare `Auto`).

#### Carry-over cleanups from #119/#138

- [ ] **`bkit-cloud.yml` is GitHub-tracker-only** (Linear isn't a valid Claude-GH-Action path). The #138 tracker-conditional render's **Linear branch is vestigial** — simplify `renderCloudWorkflow`/`runCloudModule` to the GitHub variant, and scope `--cloud` (the Claude GH-Action) to GitHub-tracker repos. (The #138 advisory-gating stays correct.)
- [ ] **Runtime verification:** confirm `claude-code-action@v1` loads + authenticates the github MCP server on the runner (the `mcp__github__*` surface) via a live dispatch — required before relying on github-tracker auto-routing.
- [ ] Migrate Linear `Auto` → `bkit:auto` across preflight hooks + tracker snippets.

#### Consumer docs

The support matrix + manual `workflow_dispatch` path are being added to `.agents/cloud.md` (separate docs PR) — Phase 1 shipped the dispatch capability without documenting it.

#### Acceptance

- [ ] GitHub `issues: labeled` (+ status) triggers `bkit-cloud` for `design`/`plan`/`build` when `bkit:auto` is present.
- [ ] Phase selected from `bkit:` label; no Linear bridge shipped.
- [ ] `bkit:` label prefix consistent across trackers (Linear `Auto` migrated).
- [ ] `bkit-cloud.yml` simplified to GitHub-only; `--cloud` scoped to GitHub-tracker repos.
- [ ] github MCP runner auth confirmed via a live dispatch.

---

## Comments (chronological — exploration/diagnosis, superseded by FINAL SCOPE on conflict)

### Comment 1 (4527672196, 2026-05-24) — Discussion & decisions

Audit trail for the decisions baked into the body. Key decisions:

1. **Drop the Linear webhook bridge** — Linear → cloud agent runs through Cursor's native Linear integration. Phase 2 narrows to the GitHub `issues: labeled` trigger for design/plan/build.
2. **`bkit:` label prefix on every tracker** — route by reading `bkit:<phase>` off the issue; migrate Linear's bare `Auto` → `bkit:auto`.
3. **`bkit-cloud.yml` is GitHub-tracker-only** → #138 tracker-conditional render's Linear branch is vestigial; simplify `renderCloudWorkflow`/`runCloudModule` to GitHub variant; scope `--cloud` to GitHub-tracker repos.
4. **Trigger gate** = `bkit:auto` **and** status → In Progress (from any prior state).
5. **Open / runtime** — confirm `claude-code-action@v1` loads + authenticates the github MCP server via a live dispatch.

Also settled: `run-name` echoes triggering commit subject (shipped #119); `workflow_dispatch` doc gap + symmetric-framing fix in `.agents/cloud.md` → PR #142.
Cross-links: Phase 1 PR #139 (`b9eb63e`); docs PR #142.

### Comment 2 (4527738648, 2026-05-24) — Integration check (119 ↔ 141) + docs merged

Verified PR #142 (cloud.md docs) against shipped #119/#138 code — merged as `15027dc`.
Confirmed: `bkit-cloud.yml` has `workflow_dispatch` (`phase` choice + `issue`), github render is Linear-free, github orchestrator gates on `bkit:auto`; phase-resolution step branches on `github.event_name` so Phase 2's `on: issues: labeled` drops in additively.
Two more code-side lags found:

- [ ] `bkit-cloud.yml` header comment still reads "Required tracker label: `Auto`" → should be `bkit:auto`.
- [ ] Orchestrator rule-block still labels `bkit:auto` the "**CI-router** trigger gate" → rename to "bkit-cloud".

### Comment 3 (4533705670, 2026-05-25) — `@claude` mention launch path (path E)

Added optional `@claude` mention launch path (path E) in `16589d2`: `.agents/cloud.md` extends launch-path matrix with path E (`/install-github-app` → comment `@claude /bkit-plan`); `runCloudModule` `bkit-cloud-setup` advisory emits mention tip for github trackers (omitted for linear) + integration tests. Additive to path C; follows `claude.yml` shipped in #177. Marked experimental until verified live.

### Comment 4 (4538636251, 2026-05-26) — related #185

### Comment 5 (4541063736, 2026-05-26) — [updated] CI-driven cloud path: three real defects, surfaced by a live dispatch

Correction: the stale-run guard and `bkit:auto` opt-in gate were NOT dropped — both implemented in the orchestrator (`bkit-cloud.md` Step 2 stale-run guard, Step 3 opt-in gate), documented in `cloud.md` §Post-CI auto-routing. The YAML `if:` being conclusion-only is correct by design.

A `chore(76-…): worktree-setup` commit auto-fired `bkit-cloud` on a consumer repo. Tracing the live run surfaced three defects:

**Defect 1 — `bkit-cloud.yml` can't boot `claude-code-action` (BLOCKING).** Live run failed at ~26s: `Could not fetch an OIDC token. Did you remember to add id-token: write...`. `claude-code-action@v1` auto-detects `mode: agent`, calls `setupGitHubToken → getOidcToken`. Shipped permissions (`bkit-cloud.yml:67-73`: contents/pull-requests/issues/actions) lack `id-token`. Workflow passes `github.token` only as `env: GH_TOKEN` (`:149`) which the action does NOT consume for its own GitHub auth. Consequence: CI-driven ship/debug path has NEVER run end-to-end. Fix (RESOLVED): add `id-token: write` + require Claude GitHub App; delete the "github.token handles everything, no App" rationale (`:22-25`). App install becomes required consumer setup.

**Defect 2 — bookkeeping commits omit `[skip ci]` (HIGH).** Intended: router fires on one commit — `chore({FID}): close-workflow` (bkit-build Step 18). But `chore({FID}): worktree-setup` (`bkit-build.md:260`) and `chore({FID}): create-pr` (`:915`) lack `[skip ci]`. On re-build/re-entry where PR is open, worktree-setup commit synchronizes the open PR → `pull_request` CI → router fires mid-build (confirmed: CI #202 synchronize on open PR #102). Fix: add `bkit [skip ci]` to worktree-setup and create-pr commit messages.

**Defect 3 — incoherent concurrency key (LATENT race).** `bkit-cloud.yml:64` `group: bkit-cloud-${{ inputs.issue || github.event.workflow_run.head_branch }}`. Dispatched build (`bkit-cloud-<issue>`) and CI completion it triggers (`bkit-cloud-feat/<branch>`) resolve to different groups → `cancel-in-progress` can't serialise → auto-ship can race a still-running dispatched build. Fix: both surfaces resolve to one FID-derived token.

Ordering: Defect 1 first, then Defect 2, then Defect 3.

### Comment 6 (4541652710, 2026-05-26) — related #184

### Comment 7 (4541658153, 2026-05-26) — Agreed design — bkit-cloud rebuilt on the Claude GitHub App

Supersedes earlier Defect-1 `github_token` bypass lean — build on the App, not around it.
Principle: don't reinvent what the App provides (identity, PR/issue context, comment posting, `@claude`/assignment triggers, auto mode-detection); bkit adds phase routing, opt-in gate, stale guard, status.json. The GH Action remains the seam for CI pass/fail, authenticated as the App.
Auth model: `claude-code-action@v1` authenticates as the App via OIDC; workflow grants `id-token: write`; consumer installs App (`/install-github-app`, required). Delete `bkit-cloud.yml:22-25` rationale. Keep `ANTHROPIC_API_KEY`.
Triggers: design/plan/build + manual ship/debug → `@claude /bkit-<phase>` in comment (phase = typed command); auto ship/debug → `workflow_run` on CI, gated. Bare issue assignment NOT a phase carrier.
CI auto-route gating — two-tier: (1) Free tier — commit-message marker in job `if:` (`bkit [auto route]`), non-opted-in = job skipped = zero runner minutes; (2) Cheap tier — in-job `gh issue view {ISSUE} --json labels` re-checks `bkit:auto` = live kill switch; then invoke `claude-code-action` with `/bkit-cloud {ship|debug} {PR}`.
Marker convention: `bkit [auto route]` (bkit outside brackets, direction-neutral). Load-bearing on Defect 2.
Gate placement: opt-in + stale guards move INTO the YAML job; phase routing + status.json + comments stay in orchestrator. Ship YAML gate logic inside `bkit:start/end` markers.
Must land WITH #184 (shared HEAD-subject assertion). Implementation order: D1 → (D2 + #184) → CI gate → D3 → `@claude`/`claude.yml` wiring + `Auto`→`bkit:auto`.

### Comment 8 (4541789370, 2026-05-26) — Claude GitHub App = base install requirement + trigger reference

App moves from "optional path E" to base requirement for the entire bkit-cloud capability on GitHub-tracker repos. Consumer setup: run `/install-github-app` once (required, surfaced in advisory); `bkit-cloud.yml` grants `id-token: write`. Flip optional→required in `bkit-modules.ts` `bkit-cloud-setup` advisory (~line 2062) and `cloud.md` (matrix + path E, lines 23, 30). Delete Defect-1 framing (advisory ~2075 + `bkit-cloud.yml:22-25`). Lists App trigger surfaces (issue_comment, pull_request_review_comment, etc.). Primary surface: `issue_comment` → `@claude /bkit-<phase>`. Sequencing: cloud.md + advisory edits land WITH the Defect-1 code fix; `bkit-cloud-setup` advisory change needs assertions updated in `bkit-modules.integration.test.ts`.

---

### Comment 9 (4542046671, 2026-05-26) — 🎯 FINAL SCOPE — bkit-cloud rebuild on the Claude GitHub App (one coherent change) — **AUTHORITATIVE**

Master record of everything decided in this thread. **Nothing deferred** — all moving parts discovered here are in scope. Checklist at the end to verify at completion.

#### Decisions locked

1. **Auth = Claude GitHub App.** `claude-code-action@v1` authenticates as the App via OIDC; `bkit-cloud.yml` grants `id-token: write`. Keep `ANTHROPIC_API_KEY` (LLM). **Delete** the "github.token handles all repo git/gh; no App" framing (`bkit-cloud.yml:22-25` + advisory ~2075). Commits/PRs/comments appear as the App → enables `@claude` follow-ups.
2. **App = base requirement** for `cloud=claude` (not optional). Flip optional→required in `cloud.md` (matrix + path E) and the `bkit-cloud-setup` advisory (~2056-2062).
3. **`cloud=claude` / `cloud=cursor` module split** (mirrors `tracker=`), resolving the Cursor-config orphaning:
   - `cloud=claude` → `bkit-cloud.yml` + `cloud-bootstrap.sh`; requires `tracker=github` + App.
   - `cloud=cursor` → `.cursor/Dockerfile` + `environment.json`; requires `tracker=linear`.
   - Variant **constrained by tracker** (github→claude, linear→cursor); mismatch = hard error. Explicit `--cloud=claude|cursor` value (not auto-derived).
4. **Enforcement based on `package.json` recorded state** (`bkit.issueTracker`, `bkit.cloudAgents`/new cloud-variant field) — no API probing:
   - First-time tracker set: free. **Switching an established tracker: hard-block** with explicit `--force` (silent linear↔github flip strands the other stack + label semantics).
   - `cloud=claude` requires `tracker=github`; `cloud=cursor` requires `tracker=linear`. **Symmetric checks both ways** (cursor/linear side included).
5. **App presence: package.json-recorded + advisory + `bkit check` consistency** — _not_ a runtime API gate (a specific App's install isn't reliably detectable from a user PAT). `bkit.cloud=claude` recorded ⇒ advisory states the App + `/install-github-app` are required, and `bkit check` asserts config consistency (workflow has `id-token`, `ANTHROPIC_API_KEY` note, App advisory surfaced). Failure mode if skipped = the OIDC boot error (loud).
6. **Triggers:**
   - design/plan/build + **manual** ship/debug → **`@claude /bkit-<phase>`** in an issue/PR comment (phase = the typed command). Wire via `claude.yml`.
   - **auto** ship/debug → `bkit-cloud.yml` `workflow_run` on CI, two-tier gated (below).
   - Bare issue assignment is **not** a phase carrier (out of scope as a trigger).
7. **CI auto-route gate (two-tier, App session only when opted-in):**
   - **Free tier** — job `if: contains(github.event.workflow_run.head_commit.message, 'bkit [auto route]')` → non-opted-in = job skipped = **zero runner minutes**.
   - **Cheap tier** — in-job `gh issue view {ISSUE} --json labels` re-checks `bkit:auto` on the linked issue = **live kill switch**; absent → no-op exit.
   - Then dispatch `/bkit-cloud {ship|debug} {PR}` (success→ship, failure→debug). Orchestrator keeps phase routing + `status.json` + comments.
8. **Marker convention `bkit [auto route]`** (`bkit` outside brackets, per `bkit [skip ci]`; direction-neutral). On the close-workflow commit + the debug re-trigger commit, **only when** the issue carried `bkit:auto` at close time.

#### Defects folded in

- **D1** — missing `id-token: write` → action can't boot (proven live). Fix per decision 1.
- **D2** — `worktree-setup` (`bkit-build.md:260`) + `create-pr` (`:915`) lack `[skip ci]`, firing the router mid-build on an open PR. Add `[skip ci]`. Debug re-trigger commit must stay loud **and** carry `bkit [auto route]` (`bkit-debug.md`). **Load-bearing for the marker gate** (the marked close-workflow commit must be HEAD at CI time).
- **D3** — concurrency key incoherent (`bkit-cloud.yml:64`, `inputs.issue` vs `head_branch`). Reconcile to one FID-derived token across dispatch + CI surfaces.

#### Couples with #184 (must land together)

#184's single shared HEAD-subject assertion (HEAD of any push to a CI-validated ref has no `[skip ci]`; PR title clean) becomes the SoT for the commit-tag contract; build/debug/ship invoke it instead of re-deriving. It must treat `bkit [auto route]` as a **legitimate** HEAD token (not a skip tag). D2's skip-tag additions are the concrete build-path implementation of #184's invariant.

#### In-scope surfaces

<!-- prettier-ignore -->
| Layer | Files |
| --- | --- |
| Auth / install | `.github/workflows/bkit-cloud.yml` + `.agents/templates/.github/workflows/bkit-cloud.yml`; `renderCloudWorkflow` (id-token, drop Linear render branch + github.token framing); `bkit-modules.ts` (`runCloudModule` split, `MODULE_REGISTRY`, advisories, tracker/cloud enforcement); `bkit-cli.ts` (`--cloud=claude\ | cursor` parsing, help, OPTIN_MODULES); manifest |
| CI trigger discipline | `bkit-build.md` (`[skip ci]` on worktree-setup/create-pr; `bkit [auto route]` on close-workflow); `bkit-debug.md` (re-trigger marker + loud); `bkit-cloud.yml` (two-tier `if:` gate + in-job label re-check + concurrency key); `.agents/workflows/bkit-cloud.md` orchestrator (gates move to YAML; routing/status/comments stay) |
| Shared invariant (#184) | new HEAD-subject assertion snippet; build/debug/ship close-workflow + PR-create steps invoke it |
| Triggers | `.github/workflows/claude.yml` — `@claude /bkit-<phase>` dispatch as the App |
| Labels | migrate Linear bare `Auto` → `bkit:auto` in preflight hooks + `.agents/trackers.md` snippets (gate + @claude paths read `bkit:auto` — consistency required) |
| Docs | `.agents/cloud.md` (matrix, path E, Post-CI section, setup); generated `.agents/advisories.md` |
| Tests | `bkit-modules.integration.test.ts` (advisory asserts), render/`renderCloudWorkflow` tests, dry-run parity, manifest, preflight if touched |

#### Internal ordering

1. **D1 + App auth + cloud-module split + tracker/cloud enforcement + docs/advisory flip** (the install/auth foundation).
2. **#184 shared assertion** → **D2 skip-tags + `bkit [auto route]` marker** (depends on #184) → **two-tier CI gate** (depends on the marker being HEAD).
3. **D3 concurrency key.**
4. **`@claude` / `claude.yml` trigger wiring** + `Auto`→`bkit:auto` migration.

#### Verification checklist (check at completion)

- [ ] `claude-code-action@v1` authenticates as the Claude App (`id-token: write` + App installed); **live dispatch reaches a Claude turn** (this issue's standing runtime-verification item).
- [ ] `cloud=claude` requires `tracker=github`; `cloud=cursor` requires `tracker=linear`; mismatch hard-errors; symmetric both ways.
- [ ] Switching an established tracker hard-blocks without `--force`; first-set is free. All driven off `package.json` recorded state.
- [ ] Cursor scaffolding (`.cursor/Dockerfile` + `environment.json`) ships under `cloud=cursor`; not orphaned.
- [ ] App requirement surfaced in `cloud.md` + `bkit-cloud-setup` advisory (optional→required); `github.token`-only framing deleted; `bkit check` asserts cloud=claude config consistency.
- [ ] CI auto-route fires **only** for commits carrying `bkit [auto route]` (zero runner otherwise) **and** when the linked issue still carries `bkit:auto` (live kill switch).
- [ ] `worktree-setup`/`create-pr` carry `[skip ci]`; only close-workflow (+ debug re-trigger) is loud and marked.
- [ ] Concurrency key reconciled across dispatch + CI surfaces (#141 D3).
- [ ] #184 shared HEAD-subject assertion owns the commit-tag contract; build/debug/ship invoke it; it treats `bkit [auto route]` as legitimate.
- [ ] design/plan/build + manual ship/debug launch via `@claude /bkit-<phase>`; auto ship/debug via the gated CI route.
- [ ] Linear `Auto` → `bkit:auto` migrated across preflight hooks + tracker snippets.
- [ ] Vestigial Linear branch removed from `renderCloudWorkflow`; `bkit-cloud.yml` is GitHub-only.
- [ ] Tests updated/green (advisory asserts, render, dry-run parity, manifest).
