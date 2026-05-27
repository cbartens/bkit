<!-- Child sub-plan 2 of 3. Source: plan-v3-checked.md. {YYYYMM} = 202605. -->

# bkit-cloud rebuild on the Claude GitHub App — Child 2: Block 2 + 3 (#184 assertion + D2 skip-tags + two-tier CI gate + D3 concurrency)

**Parent Plan:** [`141-cloud-app-plan.md`](./141-cloud-app-plan.md)

> [!CAUTION]
> **CRITICAL:** Do not hallucinate plan execution state.
>
> 1. ALWAYS read this actual file natively via the `read_file` tool _before_ executing any steps.
> 2. NEVER trust system-generated session summaries or previous conversation history.
> 3. Your source of truth is EXCLUSIVELY the literal `[x]` vs `[ ]` checkboxes in this physical document. If a box is `[ ]`, it is NOT DONE.

## ⛔ Land-Together Constraint (READ FIRST)

> [!CAUTION]
> **This child is ONE of THREE execution units on a SINGLE feature branch / single squashed PR — NOT an independent merge.** Completing this child does NOT mean "ship Block 2/3." All three children ([`141-cloud-app-plan-1.md`](./141-cloud-app-plan-1.md), [`141-cloud-app-plan-2.md`](./141-cloud-app-plan-2.md), [`141-cloud-app-plan-3.md`](./141-cloud-app-plan-3.md)) **plus #184** land together in one squashed PR (`bkit-ship.md` → `gh pr merge --squash`). A builder MUST NOT merge a partial change. See the [parent index](./141-cloud-app-plan.md) § Land-Together Constraint.

## Position in Sequence

- **This is child 2 of 3 — execute SECOND, after [`141-cloud-app-plan-1.md`](./141-cloud-app-plan-1.md).**
- **Upstream (blocking):**
  1. **#184's exact shared HEAD-subject assertion shape** must be resolved (a Gate-1 prerequisite recorded in child 1). **T2.1 cannot proceed until #184's snippet shape is known.** T2.1 (#184 assertion) MUST resolve BEFORE T2.3/T2.4 (the `bkit [auto route]` marker / skip-tag tasks) because #184 owns the shared assertion shape that must treat `bkit [auto route]` as a legitimate HEAD token.
  2. **Child 1's `bkit-cloud.yml` template + rendered-copy edits** (T1.1–T1.3) — this child's two-tier gate (T2.7) and concurrency key (T3.1) edit the SAME template that child 1 established (`id-token`, GitHub-only render).
- **Internal ordering:** Block 3's T3.1 reuses Block 2's SHARED-DERIV FID (defined once in T2.7) and MUST follow T2.7 — do NOT introduce a second FID derivation.
- **Downstream:** [`141-cloud-app-plan-3.md`](./141-cloud-app-plan-3.md) (Block 4 + verification) runs the full Gate-4 + Manual Verification over all three children's output.

## Context & Goals

bkit's cloud-agent capability has never run end-to-end. Beyond D1 (fixed in child 1), the live trace surfaced D2 (bookkeeping commits without `[skip ci]` fire the CI auto-router mid-build) and D3 (an incoherent concurrency key lets a dispatched build race the auto-ship it triggers). The FINAL SCOPE comment moves the CI auto-route gate into a two-tier YAML guard (`bkit [auto route]` marker + in-job `bkit:auto` re-check) and reconciles the concurrency key to one FID-derived token. This change MUST land together with **#184**'s single shared HEAD-subject assertion, which becomes the source of truth for the commit-tag contract that D2 implements and which must treat `bkit [auto route]` as a legitimate HEAD token (not a skip tag).

**This child (Block 2 + 3) delivers:** the #184 shared HEAD-subject assertion (landed in its bkit-managed home, referenced by build/debug/ship), the D2 skip-tags on `worktree-setup`/`create-pr`, the `bkit [auto route]` marker on the build close-workflow commit and the debug re-trigger commit (mode-dependent placement + ordering fixes), the orchestrator gate move into the YAML job with DECISION-E PR-label-mirror delete, the two-tier CI gate + SHARED-DERIV `{ISSUE}`/`{FID}` derivation (PR-body marker primary), and the D3 concurrency-key reconciliation reusing the same SHARED-DERIV FID.

**Success Criteria (this child):**

- CI auto-route fires only for commits carrying `bkit [auto route]` (zero runner minutes otherwise) and only while the linked issue still carries `bkit:auto` (live kill switch).
- `worktree-setup` / `create-pr` commits carry `bkit [skip ci]`; only the close-workflow commit (and the debug re-trigger commit) are loud and carry `bkit [auto route]`; #184's shared HEAD-subject assertion owns the contract and treats `bkit [auto route]` as legitimate.
- The dispatched build and the ship it triggers resolve to one FID-derived concurrency token (D3) and cannot race.

## Acceptance Scenario (reference)

> The single testable contract for the whole feature lives in [`141-cloud-app-plan-1.md`](./141-cloud-app-plan-1.md) § Acceptance Scenario (Narrative, Success Criteria, Concrete Example, Edge Cases, full Derived Test Matrix). This child owns the matrix rows tagged **[C2]**:
>
> - Two-tier CI gate (negative skip + positive fires-to-dispatch + kill switch + SHARED-DERIV `{ISSUE}`) → T2.7.
> - Concurrency key reconciled to one FID-derived token across dispatch + CI surfaces → T3.1.
> - `worktree-setup`/`create-pr` carry `bkit [skip ci]`; close-workflow + debug re-trigger are loud + marked → T2.2/T2.3/T2.4.
>
> The Human Confirmation checkboxes (Acceptance Scenario + Breaking Changes) are confirmed at Gate 1 in child 1 and gate this child's execution.

## Decisions (acting in this child — full text in [parent index](./141-cloud-app-plan.md))

- **DECISION-E — drop the PR `bkit:auto` label mirror; the live kill switch is the in-job issue-label re-check. AMENDED 2026-05-27 (maintainer review, pre-build).** Supersedes the original "re-home the PR-label propagation into YAML." The PR `bkit:auto` label is **write/mirror-only** — the gate reads the **issue** label (`gh issue view`); nothing filters on the PR label. So **DELETE** the PR-label propagation from `kill-switch-check` (`trackers.md:169`/`274`) and the orchestrator (`bkit-cloud.md:193-196`) — do NOT re-home it. The live kill switch is the cheap-tier in-job `gh issue view {ISSUE} --json labels` re-check (T2.7). **No PR-body `auto` flag** — the commit-message marker (`bkit [auto route]`) is the free runner gate; the issue-label read is the live revocation.
- **DECISION-A (also relevant here):** the two auth surfaces stay distinct — this child does NOT touch `claude.yml` auth; the `bkit-cloud.yml` path keeps `ANTHROPIC_API_KEY` + OIDC.

## Supersession Inventory (reference)

> The full Supersession Inventory (7 rows) lives in [`141-cloud-app-plan-1.md`](./141-cloud-app-plan-1.md). Block 2/3 is additive (markers, gate move, derivation) plus the orchestrator gate-cede (a MOVE into YAML). The orchestrator's gates (Steps 2-3 of `bkit-cloud.md`) are ceded to YAML in T2.6, and per DECISION-E (AMENDED) the PR `bkit:auto` label-mirror propagation is **DELETED** from `kill-switch-check` (`trackers.md:169`/`274`) + the orchestrator (`bkit-cloud.md:193-196`) — it is mirror-only and nothing reads it.

## Security & Privacy

- [x] **Webhook / event trigger** — `bkit-cloud.yml` `workflow_run` is a GitHub-native event; the two-tier gate (`bkit [auto route]` marker + in-job `bkit:auto` re-check) is the trust boundary added by this child. No raw webhook secret to verify (GitHub signs events).
- [x] **Auth model** — On the CI auto-route path (`bkit-cloud.yml`), `claude-code-action@v1` authenticates as the Claude App via OIDC + `ANTHROPIC_API_KEY`. This child does NOT change the auth surface (DECISION-A); it adds the two-tier route gate and concurrency reconciliation on top of child 1's `id-token: write` grant.

## 🚨 Pre-Flight / Dependencies 🚨

> Gate 1 (the human-confirmation + #184-coordination + preflight gate) is owned by [`141-cloud-app-plan-1.md`](./141-cloud-app-plan-1.md) and MUST be cleared before this child. Re-confirm the two blocking upstreams below before starting.

### Core (verify before starting this child)

- [x] **#184 shape resolved (2026-05-27):** RESOLVED — see [`141-cloud-app-plan-1.md`](./141-cloud-app-plan-1.md) § "#184 Shared HEAD-Subject Assertion — RESOLVED". Deny-list contract; home = a named assertion in `.agents/workflows.md`; hard-fail loud; `bkit [auto route]`/`bkit [verbose ci]`/`bkit [force build]` are legitimate HEAD tokens, NOT skip tags.
- [x] **Child 1 landed on this branch:** `bkit-cloud.yml` template + rendered copy carry `id-token: write`, are GitHub-only (no `@@CLOUD_TRACKER`), and `renderCloudWorkflow` has no Linear branch. T2.7/T3.1 edit this same file.
- [x] **Project Context:** Read `docs/knowledge.md` KN-11 (`[skip ci]` HEAD → empty rollup) + KN-23 (CI is the only quality gate); `docs/deployments.md` § "CI trigger on final workflow push" (lines 309-321 — the existing commit-tag contract that #184 formalises and D2 implements).
- [x] **Testing & Quality:** The two-tier GHA `if:` and commit-tag workflow changes have NO executable unit harness — cover via YAML/doc review + render/grep assertions (validate via the real render path, never string-presence-only). Use `bkit-modules.integration.test.ts` for the render-equality assertions.

## Architecture & Component Changes — Block 2 + Block 3

**CRITICAL:** All `[MODIFY]` files below were verified to exist; cited line numbers were re-checked against current `dev` and differ from the FINAL-SCOPE comment's earlier-commit numbers (noted inline).

### Block 2 — #184 shared assertion → D2 skip-tags + `bkit [auto route]` marker → two-tier CI gate

#### [NEW] Shared HEAD-subject assertion (#184 — shape RESOLVED)

> Full contract in [`141-cloud-app-plan-1.md`](./141-cloud-app-plan-1.md) § "#184 Shared HEAD-Subject Assertion — RESOLVED". Summary:

- A single bkit-managed **deterministic** assertion (fixed `git log -1 --pretty=%s` / `gh pr view --json title` + `grep -iE` of the suppressor set `[skip ci]` / `[ci skip]` / `[no ci]` / `[skip actions]` / `[actions skip]`; PR title additionally rejects `[skip build]`; exit code = verdict, **no LLM judgment**). **DENY-LIST** → `bkit [auto route]` / `bkit [verbose ci]` / `bkit [force build]` pass automatically (legitimate HEAD tokens, not skip tags).
- **Home: a named section in `.agents/workflows.md`** (alongside § "CI trigger mechanic"). It becomes the SoT for the commit-tag contract documented in `docs/deployments.md` § "CI trigger on final workflow push" (lines 309-321).
- **Invoked by the orchestrator** at the final CI-triggering push (build Gate 18 / debug Gate 12, HEAD-subject clause) and at create-pr + ship squash (PR-title clause) — **NOT a git hook** (the invariant is contextual; bkit pushes `[skip ci]` HEADs intermediately and to `dev` by design — a blanket hook would block them).
- **Reconcile (AC4 — no drift):** delete the inline rules in build/debug/ship gates; point `.agents/rules.md:58,63` + `.agents/workflows.md` § "CI trigger mechanic" + `docs/deployments.md` at it. **Executing T2.1 + T2.5 fully discharges #184 → close #184 on the combined squash merge.**

#### [MODIFY] `.agents/workflows/bkit-build.md`

- **Existence Check:** Exists.
- Line 260 `chore({FID}): worktree-setup` → add `bkit [skip ci]` (D2). **Doc-drift note (R1-O2/R2-opt/R3-opt — two directions):** `deployments.md:321` lists `create-pr` (and start-workflow/summary/…) as retaining `[skip ci]` but does NOT list `worktree-setup` — so the worktree-setup half is a genuinely NEW contract addition, not a "workflow lags the doc" fix; `deployments.md:318` separately describes the close-workflow commit as already-loud (drops the tags), and the real workflow commit at `:947` is `chore({FID}): close-workflow` with no such tags to drop and a different name than `:318` claims. Fix BOTH drift directions in the `deployments.md` Documentation Updates row (Gate 3 "Update documentation"), not just create-pr.
- Line 915 `chore({FID}): create-pr` → add `bkit [skip ci]` (D2). (`deployments.md:321` documents this commit as skip-tagged; the workflow currently is not — this fixes that direction.)
- Line 947 close-workflow commit → add `bkit [auto route]` marker, **only when** the issue carried `bkit:auto` at close time. Keep it loud (no `[skip ci]`).
  - **ORDERING FIX (R2-1):** the existing kill-switch re-read at `bkit-build.md:963-970` is **Step 4 — it runs AFTER the close-workflow commit (`:947`) and its push (`:951`)**, so it CANNOT decide the marker on a commit that already exists. Do NOT "reuse the 963-970 re-read" as v1 stated. Instead, **insert a `bkit:auto` presence re-read immediately BEFORE line 947** (a fresh `gh issue view {ISSUE} --json labels` / tracker MCP read at commit-build time) and gate the marker on its result. Capture its value into the close-workflow commit-message construction. This is the authoritative "at close time" signal per decision 8; the downstream 963-970 re-read remains for the orchestrator-side kill switch and is NOT the marker source.
- Replace any inline re-derivation of the HEAD-clean rule with an invocation of the #184 shared assertion (Gate 18 line 984 "HEAD on remote does NOT contain `bkit [skip ci]`").

#### [MODIFY] `.agents/workflows/bkit-debug.md`

- **Existence Check:** Exists.
- The debug re-trigger commit must stay **loud** AND carry `bkit [auto route]` — only when the issue carried `bkit:auto` at close time. Load-bearing: **the marker must land on the commit that is actually HEAD at CI time, which is mode-dependent (R2-2):**
  - **PR-mode** (`DEBUG_MODE=pr`, existing PR — the dominant auto-route re-trigger): `TRIGGER_PR=0` (line 824) so the create-pr commit at `:844` **never runs**; the loud HEAD-at-CI-time commit is the **close-workflow commit at `bkit-debug.md:806`** (pushed `:810`). The marker MUST go on `:806`.
  - **local-mode:** the create-pr commit at `:844` creates the PR that fires CI — marker goes on `:844`.
  - v1 named only `:844`; that misses the common PR-mode case (marked commit never created → gate never sees the marker → auto-route silently fails). Mark **whichever commit is HEAD per mode** — `:806` in PR-mode, `:844` in local-mode.
- **ORDERING FIX (R2-2, mirrors R2-1):** the kill-switch re-read at `bkit-debug.md:863-870` is Step 12 — it runs AFTER BOTH `:806` and `:844`, so it cannot source the marker. Insert a `bkit:auto` presence re-read **BEFORE** the relevant commit (before `:806` for PR-mode, before `:844` for local-mode) and gate the marker on it. Do NOT reuse the 863-870 re-read as the marker source.
- Confirm the new `bkit [auto route]` marker coexists cleanly on the same subject with the existing conditional `bkit [verbose ci]` suffix (`:844` already appends `VERBOSE_SUFFIX`); the #184 assertion must treat BOTH `[auto route]` and `[verbose ci]` as legitimate HEAD tokens (not skip tags) — see T2.1.
- Invoke the #184 shared assertion at Gate 12 (line 887 "HEAD on remote does NOT contain `bkit [skip ci]`") instead of re-deriving.

#### [MODIFY] `.agents/workflows/bkit-ship.md`

- **Existence Check:** Exists (Gate references `HEAD on remote does NOT contain bkit [skip ci]` at line 424).
- Invoke the #184 shared assertion instead of the inline rule.

#### [MODIFY] `.agents/workflows/bkit-cloud.md` (orchestrator)

- **Existence Check:** Exists.
- Per Comment 7 gate-placement: the opt-in gate (Step 3, lines 185-230) + stale guard (Step 2, lines 143-181) MOVE INTO the YAML job (`bkit-cloud.yml`). Phase routing (Step 4) + `status.json` + comments STAY in the orchestrator. Update the orchestrator to drop the gates it cedes to YAML, keep routing/status/comments.
- **PR-label mirror removed (R3-4) — DECISION-E, AMENDED 2026-05-27.** The orchestrator's opt-in gate also removes the `bkit:auto` **PR** label (`bkit-cloud.md:193-196` / `trackers.md:169`/`274`). Investigation confirmed **nothing reads this PR label** — the gate reads the **issue** label. So **DELETE** the PR-label propagation from both the orchestrator and the `kill-switch-check` snippet — do NOT re-home it. The live kill switch is the YAML cheap-tier `gh issue view {ISSUE} --json labels` re-check alone (T2.7). No PR-body `auto` flag is introduced.

#### [MODIFY] `.github/workflows/bkit-cloud.yml` + template (two-tier gate)

- Add free-tier job `if:` on `bkit [auto route]` + in-job `gh issue view {ISSUE} --json labels` re-check of `bkit:auto` (cheap-tier live kill switch); on absence → no-op exit. Then dispatch `/bkit-cloud {ship|debug} {PR}`. Wrap gate logic in `bkit:start`/`bkit:end` markers.
- **`{ISSUE}`/`{FID}` derivation (SHARED-DERIV — specified once, reused by D3 T3.1). AMENDED 2026-05-27: the PR-body marker is the PRIMARY source.** On the `workflow_run` (CI-completion) path the job today resolves only a **PR number** (`gh pr list --head "$BRANCH"`, `bkit-cloud.yml:117-129`) — the `bkit:auto` label lives on the **issue**, not the PR, so `{ISSUE}` is currently undefined. Define a single derivation step reused by both the kill switch and the concurrency key:
  - **PRIMARY — parse the already-shipped `pr-body-metadata` marker** (`<!-- bkit:issue=#{ISSUE_ID} bkit:fid={FID} -->`, `trackers.md:62`/`176`/`283`) via `gh pr view {PR} --json body`. This is the canonical, fail-closed cross-ref that ship/debug already consume; one read yields **both** `{ISSUE}` and `{FID}`. (More robust than branch parsing: survives branch renames and is correct even where FID != issue number.)
  - **FALLBACK** (marker missing/malformed) — extract FID from `github.event.workflow_run.head_branch` (branch shape `feat/{FID}` / `feat/{FID}-…`; FID is the issue number on `tracker=github`, i.e. `feat/50-…` → issue `50`).
  - The dispatched (`workflow_dispatch`) path already has `inputs.issue` → FID directly.
  - Emit one normalized `FID`/`ISSUE` step output consumed by (a) the cheap-tier `gh issue view {ISSUE}` re-check (live kill switch) and (b) the `concurrency.group` (D3). On underivable FID → no-op exit (fail-safe: do not auto-route). **No PR-body `auto` flag** — opt-in at CI time is the commit marker (free gate); live revocation is the issue-label re-check.

### Block 3 — D3 concurrency key

#### [MODIFY] `.github/workflows/bkit-cloud.yml` + template

- Line 64 `group: bkit-cloud-${{ inputs.issue || github.event.workflow_run.head_branch }}` resolves dispatched (`bkit-cloud-<issue>`) and CI-completion (`bkit-cloud-feat/<branch>`) runs to _different_ groups. Reconcile to **one FID-derived token** computed identically across both surfaces using the **same SHARED-DERIV `FID` step output** that feeds the cheap-tier kill switch (Block 2 — PR-body `bkit:fid` marker primary, `head_branch` fallback): dispatched path → `inputs.issue` → FID; CI path → the SHARED-DERIV `FID`; both yield `bkit-cloud-<FID>`. `cancel-in-progress: true` then serialises a dispatched build against the auto-ship it triggers. **Specify the FID derivation once (SHARED-DERIV) and reuse here — do NOT duplicate divergent logic.**

### Cron Jobs & Scheduled Tasks

None.

## Documentation Updates — Block 2/3 scope

> Index: `.agents/docs.md`. Treat as code changes — rewrite prose, no lazy bullet appends.

<!-- prettier-ignore -->
| File | Change required |
| --- | --- |
| `.agents/workflows.md` + `.agents/rules.md` | **#184 home + reconcile (AC4):** land the named shared assertion in `.agents/workflows.md` (alongside § "CI trigger mechanic"); point `rules.md:58,63` and § "CI trigger mechanic" at it; delete the per-workflow inline re-derivations. No drift across the scattered mitigations. |
| `docs/deployments.md` | § "CI trigger on final workflow push" (lines 309-321): document `bkit [auto route]` as a loud HEAD token (not a skip tag), worktree-setup/create-pr now carry `[skip ci]`, the two-tier CI auto-route gate, and point the contract at #184's shared assertion. **Reconcile BOTH existing drift directions in one pass:** add `worktree-setup` to the `:321` skip-tagged list (currently absent), and fix the `:318` close-workflow description (its named commit `chore({FID}): close-workflow status trigger CI` + "drops `bkit [skip build] bkit [skip ci]`" does not match the real `bkit-build.md:947` commit, which is `chore({FID}): close-workflow` with no tags to drop). Cross-link KN-11. |
| `docs/decisions.md` | New ADR: bkit-cloud rebuilt on the Claude GitHub App (OIDC), cloud=claude/cursor split tracker-constrained, package.json-recorded enforcement, two-tier CI gate, `bkit [auto route]` marker. |
| `docs/knowledge.md` | Append incident: D1 OIDC boot failure (missing `id-token`), D2 mid-build router fire (missing `[skip ci]`), D3 concurrency race — symptom → root cause → fix. (Cross-link KN-11.) |

> [!NOTE]
> `cloud.md` + `advisories.md` rows are completed in child 1; `trackers.md` label-consistency in child 3. The `decisions.md` ADR and `knowledge.md` incident span the whole feature but are most naturally written here once D2/D3 + the gate move are implemented (the ADR captures the full OIDC/split/gate decision; the incident captures D1/D2/D3). They may alternatively be finalised in child 3's docs pass — but they are listed here as the Block-2/3 documentation obligation so they are not lost.

## Rollback Strategy

See [parent index](./141-cloud-app-plan.md) § Rollback Strategy — single `git revert` of the combined #141+#184 squash PR. Code-only; bkit has no database.

## Agent Execution Runbook — Block 2 + Block 3

> [!IMPORTANT]
> **Continuous Execution:** Work autonomously. Do not pause at Gates. Check off `[x]` as you go.
> **Blockers:** Do not fail silently — create a tracker issue (label `blocker`) with context before stopping.
> **Step Isolation:** Complete each task fully (including its verification + checkbox) before the next.
> **Ordering:** Block 2 depends on #184 (T2.1 first; it must resolve before T2.3/T2.4's marker tasks). Block 2's gate (T2.7) depends on the marker being HEAD (T2.3/T2.4 build-path tasks) and defines SHARED-DERIV. Block 3 (T3.1) reuses Block 2's SHARED-DERIV FID and MUST follow T2.7.

> Every task includes a `**Done when:**` line — terse, testable, codebase-verifiable.

### Block 2 — #184 shared assertion → D2 skip-tags + `bkit [auto route]` marker → two-tier CI gate

- [x] **T2.1:** Land #184's single shared HEAD-subject assertion (shape RESOLVED at child 1 Gate 1 — see [`141-cloud-app-plan-1.md`](./141-cloud-app-plan-1.md) § "#184 Shared HEAD-Subject Assertion — RESOLVED"). Home: a named assertion in `.agents/workflows.md`. DENY-LIST, never an allow-list.
  - **Done when:** the named assertion lives in `.agents/workflows.md`; asserts HEAD subject free of `[skip ci]`/`[ci skip]`/`[no ci]`/`[skip actions]`/`[actions skip]` AND PR title free of `[skip ci]`/`[skip build]`; `bkit [auto route]`/`bkit [verbose ci]`/`bkit [force build]` pass (deny-list, not allow-list); hard-fails loud (names the offending commit/title + fix) → Failure Path; referenced (not re-derived) by build Gate 18 (HEAD-subject clause, on the loud close-workflow HEAD) + Step 17 create-pr (PR-title clause only — the create-pr commit is intentionally `[skip ci]` per D2, so the HEAD-subject clause must NOT run there), debug Gate 12 (HEAD-subject) + create-pr (PR-title), ship Gate + squash `--body ""` (PR-title); `docs/deployments.md` § "CI trigger on final workflow push" points at it and registers `bkit [auto route]`.
- [x] **T2.2:** Add `bkit [skip ci]` to `worktree-setup` (`bkit-build.md:260`) and `create-pr` (`bkit-build.md:915`) commits (D2).
  - **Done when:** both commit-message lines include `bkit [skip ci]`; create-pr matches the existing `deployments.md:321` contract; worktree-setup is added to that `:321` list by T2.5 (it is a NEW contract entry, currently absent from the doc).
- [x] **T2.3:** Add `bkit [auto route]` to the build close-workflow commit (`bkit-build.md:947`), only when the issue carried `bkit:auto` at close time; keep it loud. Insert a `bkit:auto` presence re-read **BEFORE** line 947 (the existing 963-970 re-read is Step 4, runs after the commit — do NOT use it as the marker source; R2-1 ordering fix).
  - **Done when:** a `bkit:auto` re-read precedes the close-workflow commit creation (line 947) — verifiable by the workflow text placing the label read above the commit step; the close-workflow commit carries `bkit [auto route]` conditionally on that pre-commit read and no `[skip ci]`; the marked commit (947) is the feat-branch HEAD that fires CI; Gate 18 invokes the #184 assertion.
- [x] **T2.4:** Make the debug re-trigger commit loud AND carry `bkit [auto route]` (conditional on `bkit:auto`) on the commit that is HEAD at CI time **per mode** in `bkit-debug.md`: PR-mode → close-workflow commit `:806` (NOT `:844`, which `TRIGGER_PR=0` skips); local-mode → create-pr `:844`. Insert the `bkit:auto` re-read BEFORE the marked commit (the 863-870 re-read is Step 12, too late — R2-2). Invoke the #184 assertion at Gate 12.
  - **Done when:** in PR-mode the marker lands on `:806` (the actual HEAD), in local-mode on `:844`; the marker is gated by a `bkit:auto` re-read placed before that commit; no `[skip ci]` on the marked commit; the marker coexists with `bkit [verbose ci]` on the same subject; Gate 12 references the #184 assertion.
- [x] **T2.5:** Invoke the #184 assertion in `bkit-ship.md` (Gate at line 424) instead of the inline rule.
  - **Done when:** ship Gate references the #184 assertion; no inline re-derivation remains.
- [x] **T2.6:** Move the opt-in gate + stale guard from `bkit-cloud.md` (Steps 2-3) INTO `bkit-cloud.yml`; keep routing/status/comments in the orchestrator. **DELETE** the PR `bkit:auto` label-removal propagation from the orchestrator (`bkit-cloud.md:193-196`) and from `kill-switch-check` (`trackers.md:169`/`274`) per DECISION-E (AMENDED — the PR label is mirror-only; nothing reads it).
  - **Done when:** `bkit-cloud.md` no longer owns the YAML-ceded gates; `bkit-cloud.yml` performs them; orchestrator retains Step 4 routing + status + comments; the `bkit:auto` PR-label removal is deleted from both `bkit-cloud.md` and the `kill-switch-check` snippet (`grep -n 'update_pull_request' .agents/trackers.md` shows no `bkit:auto`-removal call in `kill-switch-check`); the live kill switch is the YAML cheap-tier `gh issue view {ISSUE}` re-check alone (T2.7) — no PR-label and no PR-body `auto` flag.
- [ ] **T2.7:** Implement the two-tier CI gate in `bkit-cloud.yml` + template: free-tier `if: contains(...head_commit.message, 'bkit [auto route]')`; SHARED-DERIV `{ISSUE}`/`{FID}` step (PRIMARY: parse the PR-body `pr-body-metadata` marker via `gh pr view {PR} --json body`; FALLBACK: branch `feat/{FID}` → FID; fail-safe no-op on underivable FID); in-job `gh issue view {ISSUE} --json labels` re-check of `bkit:auto` → no-op exit if absent; then dispatch `/bkit-cloud {ship|debug} {PR}`. Wrap in `bkit:start`/`bkit:end`.
  - **Done when:** (a) NEGATIVE — YAML review confirms job skips without the marker (zero runner minutes) and exits no-op when `bkit:auto` is absent; (b) POSITIVE — a render/grep assertion (or fixture-driven YAML review) demonstrates that when the marked close-workflow commit IS the `workflow_run.head_commit` (`bkit [auto route]` present) AND `bkit:auto` is present, the gate evaluates true and reaches the `/bkit-cloud {ship|debug} {PR}` dispatch step — closing the marker→HEAD→job-fires chain, not just the skip; (c) the `{ISSUE}` value used by the kill switch is produced by the SHARED-DERIV step (same FID expression as T3.1's concurrency key — assert one shared derivation, not two; the render test mechanically proves single-sourcing via string-equality of the FID expression between the SHARED-DERIV step output and the `gh issue view` consumer, not by human judgement); (d) gate logic is inside `bkit:start`/`bkit:end`; (e) canonical + template byte-match for `tracker=github`.

### Block 3 — D3 concurrency key

- [ ] **T3.1:** Reconcile the `concurrency.group` key (line 64) to one FID-derived token across dispatch + CI surfaces in `bkit-cloud.yml` + template, reusing the **same SHARED-DERIV FID** as T2.7's kill switch (do NOT introduce a second derivation).
  - **Done when:** dispatched and CI-completion runs for the same FID resolve to the same `concurrency.group` (`bkit-cloud-<FID>`); the FID expression is the SHARED-DERIV one also consumed by T2.7's `gh issue view` (single derivation, asserted reused — not duplicated); render test asserts a single FID-derived expression AND proves single-sourcing by string-equality of the FID expression appearing in `concurrency.group` against the SHARED-DERIV step output (not two divergent literals); `cancel-in-progress: true` retained.

### 🔒 Gate 2 (Block 2/3 scope): Code Implementation Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below. **DO NOT stop for user permission.**

- [ ] **Gate 2 (Block 2/3) - Verified:** Every Block-2/3 task (T2.1–T2.7, T3.1) independently verified and checked off against this plan. Per DECISION-E (AMENDED 2026-05-27) the PR `bkit:auto` label mirror is DELETED, not re-homed — no separate sign-off needed (this is the locked decision).

> [!IMPORTANT]
> **Testing Strategy:** the two-tier GHA `if:` and commit-tag workflow changes have NO executable unit harness — cover via YAML/doc review + render/grep assertion (`bkit-modules.integration.test.ts` render-equality for the SHARED-DERIV single-sourcing). Validate shipped config with the real render path, never string-presence-only. No per-edit `bkit install` — batch mirror regen at session end.

> [!NOTE]
> The consolidated Gate 2 / Gate 3 / Gate 4 across all three children, and the full 13-item Manual Verification, are completed in [`141-cloud-app-plan-3.md`](./141-cloud-app-plan-3.md) before the single combined #141+#184 squash PR. Do NOT ship after this child.

## Next Child

Proceed to [`141-cloud-app-plan-3.md`](./141-cloud-app-plan-3.md) (Block 4 + verification) on the SAME branch once T2.1–T2.7 and T3.1 are checked off.
