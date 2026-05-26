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

**This child (Block 2 + 3) delivers:** the #184 shared HEAD-subject assertion (landed in its bkit-managed home, referenced by build/debug/ship), the D2 skip-tags on `worktree-setup`/`create-pr`, the `bkit [auto route]` marker on the build close-workflow commit and the debug re-trigger commit (mode-dependent placement + ordering fixes), the orchestrator gate move into the YAML job with DECISION-E kill-switch re-home, the two-tier CI gate + SHARED-DERIV `{ISSUE}` derivation, and the D3 concurrency-key reconciliation reusing the same SHARED-DERIV FID.

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

- **DECISION-E — re-home the kill-switch label propagation (resolves R3-4). LOCKED.** Moving the opt-in gate into YAML (T2.6) must NOT silently drop the orchestrator's kill-switch _propagation_ (removing the `bkit:auto` PR label, `bkit-cloud.md:193-196`). **Default (locked): re-home the label removal into the YAML job's no-op/kill-switch branch** (preserves existing behaviour). The runbook (T2.6) assumes re-homing and its `Done when:` asserts the single re-homed outcome. Dropping propagation + consumer-manual cleanup is an override that requires explicit human sign-off at Gate 2 — it is NOT a co-equal builder choice. Must be an explicit decision in T2.6, never a silent omission.
- **DECISION-A (also relevant here):** the two auth surfaces stay distinct — this child does NOT touch `claude.yml` auth; the `bkit-cloud.yml` path keeps `ANTHROPIC_API_KEY` + OIDC.

## Supersession Inventory (reference)

> The full Supersession Inventory (7 rows) lives in [`141-cloud-app-plan-1.md`](./141-cloud-app-plan-1.md). No Supersession-Inventory `DELETE` row is owned by this child — Block 2/3 is additive (markers, gate move, derivation) plus the orchestrator gate-cede (a MOVE into YAML, not a delete). The orchestrator's gates (Steps 2-3 of `bkit-cloud.md`) are ceded to YAML in T2.6 and the kill-switch propagation re-homed per DECISION-E (not dropped).

## Security & Privacy

- [x] **Webhook / event trigger** — `bkit-cloud.yml` `workflow_run` is a GitHub-native event; the two-tier gate (`bkit [auto route]` marker + in-job `bkit:auto` re-check) is the trust boundary added by this child. No raw webhook secret to verify (GitHub signs events).
- [x] **Auth model** — On the CI auto-route path (`bkit-cloud.yml`), `claude-code-action@v1` authenticates as the Claude App via OIDC + `ANTHROPIC_API_KEY`. This child does NOT change the auth surface (DECISION-A); it adds the two-tier route gate and concurrency reconciliation on top of child 1's `id-token: write` grant.

## 🚨 Pre-Flight / Dependencies 🚨

> Gate 1 (the human-confirmation + #184-coordination + preflight gate) is owned by [`141-cloud-app-plan-1.md`](./141-cloud-app-plan-1.md) and MUST be cleared before this child. Re-confirm the two blocking upstreams below before starting.

### Core (verify before starting this child)

- [ ] **#184 shape resolved:** #184's exact shared HEAD-subject assertion snippet, its bkit-managed home, and its token-allowlist contract are known (resolved at child 1 Gate 1). **T2.1 is blocked until this is confirmed.** Treat `bkit [auto route]` (and `bkit [verbose ci]`) as legitimate HEAD tokens, NOT skip tags.
- [ ] **Child 1 landed on this branch:** `bkit-cloud.yml` template + rendered copy carry `id-token: write`, are GitHub-only (no `@@CLOUD_TRACKER`), and `renderCloudWorkflow` has no Linear branch. T2.7/T3.1 edit this same file.
- [ ] **Project Context:** Read `docs/knowledge.md` KN-11 (`[skip ci]` HEAD → empty rollup) + KN-23 (CI is the only quality gate); `docs/deployments.md` § "CI trigger on final workflow push" (lines 309-321 — the existing commit-tag contract that #184 formalises and D2 implements).
- [ ] **Testing & Quality:** The two-tier GHA `if:` and commit-tag workflow changes have NO executable unit harness — cover via YAML/doc review + render/grep assertions (validate via the real render path, never string-presence-only). Use `bkit-modules.integration.test.ts` for the render-equality assertions.

## Architecture & Component Changes — Block 2 + Block 3

**CRITICAL:** All `[MODIFY]` files below were verified to exist; cited line numbers were re-checked against current `dev` and differ from the FINAL-SCOPE comment's earlier-commit numbers (noted inline).

### Block 2 — #184 shared assertion → D2 skip-tags + `bkit [auto route]` marker → two-tier CI gate

#### [NEW] Shared HEAD-subject assertion snippet (#184)

- A single bkit-managed snippet asserting: HEAD of any push to a CI-validated ref has no `bkit [skip ci]`; PR title is clean; and `bkit [auto route]` is a **legitimate** HEAD token (NOT a skip tag). This becomes the SoT for the commit-tag contract documented in `docs/deployments.md` § "CI trigger on final workflow push" (lines 309-321). Land per #184's chosen home (workflow snippet referenced by build/debug/ship close-workflow + PR-create steps). **Coordinate exact shape with #184.**

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
- **Label-propagation regression (R3-4) — DECISION-E:** the orchestrator's opt-in gate does MORE than read `bkit:auto` — it also _propagates_ the kill switch by **removing the `bkit:auto` PR label** (`bkit-cloud.md:193-196` / `trackers.md:169`). The YAML two-tier gate (T2.7) ports only the _check_ (`gh issue view … labels`), not this propagation. **Recommended call: re-home the label-removal propagation into the YAML job's no-op-exit branch** (when the cheap-tier re-check finds `bkit:auto` absent / the kill switch trips, perform the same label cleanup the orchestrator did), OR — if the maintainer prefers — explicitly decide to drop propagation and document that the consumer manages the label manually. Default to re-homing (preserves existing behaviour). This MUST be an explicit decision in T2.6, not a silent omission.

#### [MODIFY] `.github/workflows/bkit-cloud.yml` + template (two-tier gate)

- Add free-tier job `if:` on `bkit [auto route]` + in-job `gh issue view {ISSUE} --json labels` re-check of `bkit:auto` (cheap-tier live kill switch); on absence → no-op exit. Then dispatch `/bkit-cloud {ship|debug} {PR}`. Wrap gate logic in `bkit:start`/`bkit:end` markers.
- **`{ISSUE}` derivation (SHARED-DERIV — specified once, reused by D3 T3.1).** On the `workflow_run` (CI-completion) path the job today resolves only a **PR number** (`gh pr list --head "$BRANCH"`, `bkit-cloud.yml:117-129`) — the `bkit:auto` label lives on the **issue**, not the PR, so `{ISSUE}` is currently undefined. Define a single derivation step reused by both the kill switch and the concurrency key: from `github.event.workflow_run.head_branch` extract the FID (branch shape `feat/{FID}` / `feat/{FID}-…`), then map FID→issue number (FID is the issue number on `tracker=github`, i.e. `feat/50-…` → issue `50`; if the branch shape is ambiguous, fall back to `gh pr view {PR} --json body` and parse the bkit-managed issue cross-ref). The dispatched (`workflow_dispatch`) path already has `inputs.issue` → FID directly. Emit one normalized `FID`/`ISSUE` step output consumed by (a) the cheap-tier `gh issue view {ISSUE}` re-check and (b) the `concurrency.group` (D3). On underivable FID → no-op exit (fail-safe: do not auto-route).

### Block 3 — D3 concurrency key

#### [MODIFY] `.github/workflows/bkit-cloud.yml` + template

- Line 64 `group: bkit-cloud-${{ inputs.issue || github.event.workflow_run.head_branch }}` resolves dispatched (`bkit-cloud-<issue>`) and CI-completion (`bkit-cloud-feat/<branch>`) runs to _different_ groups. Reconcile to **one FID-derived token** computed identically across both surfaces using the **same SHARED-DERIV FID** that feeds the cheap-tier kill switch (Block 2): dispatched path → `inputs.issue` → FID; CI path → `head_branch` `feat/{FID}` → FID; both yield `bkit-cloud-<FID>`. `cancel-in-progress: true` then serialises a dispatched build against the auto-ship it triggers. **Specify the FID derivation once (SHARED-DERIV) and reuse here — do NOT duplicate divergent logic.**

### Cron Jobs & Scheduled Tasks

None.

## Documentation Updates — Block 2/3 scope

> Index: `.agents/docs.md`. Treat as code changes — rewrite prose, no lazy bullet appends.

<!-- prettier-ignore -->
| File | Change required |
| --- | --- |
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

- [ ] **T2.1:** Land #184's single shared HEAD-subject assertion snippet (coordinate exact shape with #184) treating `bkit [auto route]` as a legitimate HEAD token.
  - **Done when:** the assertion exists in its bkit-managed home; asserts HEAD has no `bkit [skip ci]`, PR title clean, `bkit [auto route]` allowed; referenced (not re-derived) by build/debug/ship.
- [ ] **T2.2:** Add `bkit [skip ci]` to `worktree-setup` (`bkit-build.md:260`) and `create-pr` (`bkit-build.md:915`) commits (D2).
  - **Done when:** both commit-message lines include `bkit [skip ci]`; create-pr matches the existing `deployments.md:321` contract; worktree-setup is added to that `:321` list by T2.5 (it is a NEW contract entry, currently absent from the doc).
- [ ] **T2.3:** Add `bkit [auto route]` to the build close-workflow commit (`bkit-build.md:947`), only when the issue carried `bkit:auto` at close time; keep it loud. Insert a `bkit:auto` presence re-read **BEFORE** line 947 (the existing 963-970 re-read is Step 4, runs after the commit — do NOT use it as the marker source; R2-1 ordering fix).
  - **Done when:** a `bkit:auto` re-read precedes the close-workflow commit creation (line 947) — verifiable by the workflow text placing the label read above the commit step; the close-workflow commit carries `bkit [auto route]` conditionally on that pre-commit read and no `[skip ci]`; the marked commit (947) is the feat-branch HEAD that fires CI; Gate 18 invokes the #184 assertion.
- [ ] **T2.4:** Make the debug re-trigger commit loud AND carry `bkit [auto route]` (conditional on `bkit:auto`) on the commit that is HEAD at CI time **per mode** in `bkit-debug.md`: PR-mode → close-workflow commit `:806` (NOT `:844`, which `TRIGGER_PR=0` skips); local-mode → create-pr `:844`. Insert the `bkit:auto` re-read BEFORE the marked commit (the 863-870 re-read is Step 12, too late — R2-2). Invoke the #184 assertion at Gate 12.
  - **Done when:** in PR-mode the marker lands on `:806` (the actual HEAD), in local-mode on `:844`; the marker is gated by a `bkit:auto` re-read placed before that commit; no `[skip ci]` on the marked commit; the marker coexists with `bkit [verbose ci]` on the same subject; Gate 12 references the #184 assertion.
- [ ] **T2.5:** Invoke the #184 assertion in `bkit-ship.md` (Gate at line 424) instead of the inline rule.
  - **Done when:** ship Gate references the #184 assertion; no inline re-derivation remains.
- [ ] **T2.6:** Move the opt-in gate + stale guard from `bkit-cloud.md` (Steps 2-3) INTO `bkit-cloud.yml`; keep routing/status/comments in the orchestrator. Re-home the kill-switch label-propagation (remove `bkit:auto` PR label, `bkit-cloud.md:193-196`) into the YAML no-op branch per DECISION-E (default: preserve; alternative: explicitly drop + document).
  - **Done when:** `bkit-cloud.md` no longer owns the YAML-ceded gates; `bkit-cloud.yml` performs them; orchestrator retains Step 4 routing + status + comments; per DECISION-E (LOCKED, default re-home) the `bkit:auto` label-removal propagation is re-homed into the YAML kill-switch branch — verifiable in `bkit-cloud.yml` (the no-op-exit branch performs the same `bkit:auto` PR-label cleanup the orchestrator did at `bkit-cloud.md:193-196`). The ONLY permitted alternative is an explicit drop + consumer-manual-cleanup note, and it requires recorded human sign-off at Gate 2 — absent that sign-off, re-home is mandatory and the propagation must NOT be silently lost.
- [ ] **T2.7:** Implement the two-tier CI gate in `bkit-cloud.yml` + template: free-tier `if: contains(...head_commit.message, 'bkit [auto route]')`; SHARED-DERIV `{ISSUE}` derivation step (branch `feat/{FID}` → FID → issue; fail-safe no-op on underivable FID); in-job `gh issue view {ISSUE} --json labels` re-check of `bkit:auto` → no-op exit if absent; then dispatch `/bkit-cloud {ship|debug} {PR}`. Wrap in `bkit:start`/`bkit:end`.
  - **Done when:** (a) NEGATIVE — YAML review confirms job skips without the marker (zero runner minutes) and exits no-op when `bkit:auto` is absent; (b) POSITIVE — a render/grep assertion (or fixture-driven YAML review) demonstrates that when the marked close-workflow commit IS the `workflow_run.head_commit` (`bkit [auto route]` present) AND `bkit:auto` is present, the gate evaluates true and reaches the `/bkit-cloud {ship|debug} {PR}` dispatch step — closing the marker→HEAD→job-fires chain, not just the skip; (c) the `{ISSUE}` value used by the kill switch is produced by the SHARED-DERIV step (same FID expression as T3.1's concurrency key — assert one shared derivation, not two; the render test mechanically proves single-sourcing via string-equality of the FID expression between the SHARED-DERIV step output and the `gh issue view` consumer, not by human judgement); (d) gate logic is inside `bkit:start`/`bkit:end`; (e) canonical + template byte-match for `tracker=github`.

### Block 3 — D3 concurrency key

- [ ] **T3.1:** Reconcile the `concurrency.group` key (line 64) to one FID-derived token across dispatch + CI surfaces in `bkit-cloud.yml` + template, reusing the **same SHARED-DERIV FID** as T2.7's kill switch (do NOT introduce a second derivation).
  - **Done when:** dispatched and CI-completion runs for the same FID resolve to the same `concurrency.group` (`bkit-cloud-<FID>`); the FID expression is the SHARED-DERIV one also consumed by T2.7's `gh issue view` (single derivation, asserted reused — not duplicated); render test asserts a single FID-derived expression AND proves single-sourcing by string-equality of the FID expression appearing in `concurrency.group` against the SHARED-DERIV step output (not two divergent literals); `cancel-in-progress: true` retained.

### 🔒 Gate 2 (Block 2/3 scope): Code Implementation Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below. **DO NOT stop for user permission.**

- [ ] **Gate 2 (Block 2/3) - Verified:** Every Block-2/3 task (T2.1–T2.7, T3.1) independently verified and checked off against this plan. If DECISION-E was overridden (drop propagation), the human sign-off is recorded here.

> [!IMPORTANT]
> **Testing Strategy:** the two-tier GHA `if:` and commit-tag workflow changes have NO executable unit harness — cover via YAML/doc review + render/grep assertion (`bkit-modules.integration.test.ts` render-equality for the SHARED-DERIV single-sourcing). Validate shipped config with the real render path, never string-presence-only. No per-edit `bkit install` — batch mirror regen at session end.

> [!NOTE]
> The consolidated Gate 2 / Gate 3 / Gate 4 across all three children, and the full 13-item Manual Verification, are completed in [`141-cloud-app-plan-3.md`](./141-cloud-app-plan-3.md) before the single combined #141+#184 squash PR. Do NOT ship after this child.

## Next Child

Proceed to [`141-cloud-app-plan-3.md`](./141-cloud-app-plan-3.md) (Block 4 + verification) on the SAME branch once T2.1–T2.7 and T3.1 are checked off.
