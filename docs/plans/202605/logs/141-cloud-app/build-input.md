# Build Input — 141-cloud-app

## Session prompt

`/bkit-build issue 141`

Build the bkit-cloud rebuild on the Claude GitHub App per the merged plan
(`141-cloud-app-plan.md` + child sub-plans 1/2/3). Raise PR against `dev`.

---

## Issue #141 — Description

**Title:** bkit-cloud GitHub issue-label trigger for design/plan/build
**State:** open · **Labels:** enhancement, bkit:build · **Milestone:** Managed Cloud Agents

Follow-up to #119 (Phase 1 shipped in #139). Phase 1 built the phase-agnostic `bkit-cloud` workflow + made `design`/`plan`/`build` reachable via `workflow_dispatch`. Phase 2 adds the **event-driven trigger layer** so phases launch from tracker activity without a human touching CI.

### Cloud-agent support matrix (the orienting model)

The two cloud stacks are **not symmetric** — each pairs with one tracker:

<!-- prettier-ignore -->
| Agent | Trigger paths | Tracker | NOT supported |
| --- | --- | --- | --- |
| **Claude Code** (terminal) | A) Claude app → Claude-on-web env · B) manual `workflow_dispatch` · C) **GitHub issue label/state → `bkit-cloud` GH Action** · D) GitHub CI pass/fail → `bkit-cloud` | **GitHub** | **Linear** |
| **Cursor** (native agent) | A) Cursor cloud-agent launch · B) GitHub PR events (CI pass/fail) · C) **Linear → Cursor integration** | **Linear** (+ GitHub PR events) | **GitHub Projects/Issues** |

**Claude cloud ↔ GitHub; Cursor cloud ↔ Linear.** They overlap only on GitHub CI/PR events.

### Acceptance (from body)

- GitHub `issues: labeled` (+ status) triggers `bkit-cloud` for design/plan/build when `bkit:auto` present.
- Phase selected from `bkit:` label; no Linear bridge shipped.
- `bkit:` label prefix consistent across trackers (Linear `Auto` migrated).
- `bkit-cloud.yml` simplified to GitHub-only; `--cloud` scoped to GitHub-tracker repos.
- github MCP runner auth confirmed via a live dispatch.

> NOTE: The thread below SUPERSEDES the label-trigger framing — final design rebuilds on the
> Claude GitHub App with `@claude /bkit-<phase>` comment triggers + a two-tier CI auto-route gate.
> The merged plan (appended at the end of this file) is the authoritative, lossless scope.

---

## Issue #141 — Comments (verbatim digest, chronological)

### Comment 1 (2026-05-24) — Discussion & decisions

Reframing: cloud stacks are asymmetric across trackers. Claude cloud ↔ GitHub; Cursor cloud ↔ Linear. Decisions: (1) Drop Linear webhook bridge — Linear→cloud runs through Cursor's native Linear integration. (2) `bkit:` label prefix on every tracker; migrate Linear bare `Auto`→`bkit:auto`. (3) `bkit-cloud.yml` GitHub-only; #138 Linear render branch vestigial — simplify `renderCloudWorkflow`/`runCloudModule`; scope `--cloud` to GitHub-tracker repos. (4) Trigger gate = `bkit:auto` AND status→In Progress. (5) Open: confirm `claude-code-action@v1` loads + authenticates github MCP via live dispatch. Also: `run-name` echoes triggering commit subject; `workflow_dispatch` doc gap fixed in PR #142.

### Comment 2 (2026-05-24) — Integration check (119 ↔ 141) + docs merged

PR #142 merged as `15027dc`. `bkit-cloud.yml` has `workflow_dispatch` (phase choice + issue); github render Linear-free; gates on `bkit:auto`. Phase-resolution branches on `github.event_name` → Phase 2 `on: issues: labeled` drops in additively. Two more code lags: `bkit-cloud.yml` header still says "Required tracker label: `Auto`" → `bkit:auto`; orchestrator rule-block calls `bkit:auto` the "CI-router" gate → rename to "bkit-cloud".

### Comment 3 (2026-05-25) — `@claude` mention launch path (path E)

Added path E in `16589d2`: `.agents/cloud.md` extends matrix with path E (`/install-github-app` → comment `@claude /bkit-plan`). `runCloudModule` `bkit-cloud-setup` advisory emits mention tip for github trackers. Additive to path C. Marked experimental until verified live.

### Comment 4 (2026-05-26) — related #185

### Comment 5 (2026-05-26) — [updated] CI-driven cloud path: three real defects (live dispatch)

Correction: stale-run guard + `bkit:auto` opt-in gate ARE implemented (orchestrator Step 2/3); YAML `if:` conclusion-only is correct by design. Real findings:

- **D1 (BLOCKING):** `bkit-cloud.yml` can't boot `claude-code-action` — missing `id-token: write`. Live run failed ~26s at OIDC: "Could not fetch an OIDC token... add `id-token: write`". Action auto-detects `mode: agent` → `setupGitHubToken → getOidcToken`. `github.token` passed only as `env: GH_TOKEN` is NOT consumed for the action's own auth. CI ship/debug path has NEVER run end-to-end. Fix: add `id-token: write`; require Claude GitHub App; delete the "github.token handles everything, no App" rationale (`bkit-cloud.yml:22-25`). App install becomes required consumer step.
- **D2 (HIGH):** bookkeeping commits omit `[skip ci]` — `chore(FID): worktree-setup` (`bkit-build.md:260`) + `chore(FID): create-pr` (`:915`). On a re-build with PR already open, worktree-setup synchronizes the PR → `pull_request` CI → router fires mid-build (confirmed: CI #202, PR #102 synchronize). Fix: add `bkit [skip ci]` to both; only `close-workflow` is the loud trigger (Gate 18).
- **D3 (LATENT race):** incoherent concurrency key — `group: bkit-cloud-${{ inputs.issue || github.event.workflow_run.head_branch }}` (`bkit-cloud.yml:64`). Dispatched build (`bkit-cloud-<issue>`) vs CI completion (`bkit-cloud-feat/<branch>`) resolve to different groups → `cancel-in-progress` can't serialise. Fix: derive FID from branch on CI path to match dispatched `issue`.
  Ordering: D1 → D2 → D3.

### Comment 6 (2026-05-26) — related #184

### Comment 7 (2026-05-26) — Agreed design — rebuilt on the Claude GitHub App (LOCKED)

Principle: don't reinvent what the App provides (identity, PR/issue context, comment posting, `@claude`/assignment triggers, auto mode-detection). bkit adds: routing trigger→phase skill, opt-in gate, stale guard, `status.json`. App provides auth+identity+native triggers, not hosted compute → GitHub Action remains the seam for CI pass/fail, authenticated AS the App.
**Auth model:** `claude-code-action@v1` authenticates as the App via OIDC; `id-token: write`; consumer runs `/install-github-app` (required). Delete `bkit-cloud.yml:22-25` framing. Keep `ANTHROPIC_API_KEY`.
**Trigger surfaces:** design/plan/build + manual ship/debug → `@claude /bkit-<phase>` in issue/PR comment (phase = typed command). auto ship/debug → `workflow_run` on CI, gated. Bare issue assignment is NOT a phase carrier.
**CI auto-route gate (two-tier):** (1) Free tier — job `if: contains(head_commit.message, 'bkit [auto route]')` → non-opted-in skipped = zero runner minutes. (2) Cheap tier — in-job `gh issue view {ISSUE} --json labels` re-checks `bkit:auto` = live kill switch. (3) Dispatch `/bkit-cloud {ship|debug} {PR}` (success→ship, failure→debug).
**Marker:** `bkit [auto route]` (`bkit` outside brackets, direction-neutral). On close-workflow + debug re-trigger commit, only when issue carried `bkit:auto` at close. **Load-bearing on D2:** marker must be on HEAD when CI fires.
**Gate placement:** opt-in + stale guards move INTO the YAML job (reversing #59); routing + status.json + comments stay in orchestrator. Ship YAML gate logic inside `bkit:start/end` markers.
**Must land WITH #184:** #184's shared assertion (HEAD of push to CI-validated ref has no `[skip ci]`; PR title clean) becomes SoT for HEAD-commit contract; #141's marker + skip-tag changes expressed through it. Gate knows: HEAD must be loud; opted-in HEAD additionally carries `bkit [auto route]`. Land together.
Order: D1 → (D2 + #184) → CI gate → D3 → `@claude`/`claude.yml` wiring + `Auto`→`bkit:auto`.

### Comment 8 (2026-05-26) — Claude GitHub App = base install requirement + trigger reference

App moves from optional path E to **base requirement** for bkit-cloud on GitHub-tracker repos. Consumer setup: `/install-github-app` once (installs App + `ANTHROPIC_API_KEY` secret) — required, surfaced in advisory. `bkit-cloud.yml` grants `id-token: write`. Flip optional→required: advisory at `bkit-modules.ts` `bkit-cloud-setup` (~line 2062) + `cloud.md` matrix + path E (lines 23, 30). Delete D1 framing (advisory ~2075 + `bkit-cloud.yml:22-25`). App trigger surfaces: `issue_comment` (issue/PR) `@claude /bkit-<phase>` primary; others ad-hoc. Config levers: `trigger_phrase`, assignee-trigger, prompt mode. These cloud.md + advisory edits land WITH the D1 code fix as one change. Advisory change needs assertions updated in `bkit-modules.integration.test.ts`.

### Comment 8b (2026-05-26) — 🎯 FINAL SCOPE (master record — authoritative)

**Decisions locked:**

1. Auth = Claude GitHub App via OIDC; `bkit-cloud.yml` grants `id-token: write`; keep `ANTHROPIC_API_KEY`; delete "github.token handles all repo git/gh; no App" framing (`bkit-cloud.yml:22-25` + advisory ~2075). Commits/PRs/comments appear as App → enables `@claude` follow-ups.
2. App = base requirement for `cloud=claude` (not optional). Flip in `cloud.md` (matrix + path E) + `bkit-cloud-setup` advisory (~2056-2062).
3. **`cloud=claude` / `cloud=cursor` module split** (mirrors `tracker=`): `cloud=claude` → `bkit-cloud.yml` + `cloud-bootstrap.sh`, requires `tracker=github` + App. `cloud=cursor` → `.cursor/Dockerfile` + `environment.json`, requires `tracker=linear`. Variant constrained by tracker (github→claude, linear→cursor); mismatch = hard error. Explicit `--cloud=claude|cursor` (not auto-derived).
4. Enforcement on `package.json` recorded state (`bkit.issueTracker`, `bkit.cloudAgents`/new cloud-variant field) — no API probing. First-time tracker set: free. Switching established tracker: hard-block with explicit `--force`. `cloud=claude` requires `tracker=github`; `cloud=cursor` requires `tracker=linear`. Symmetric both ways.
5. App presence: package.json-recorded + advisory + `bkit check` consistency — NOT a runtime API gate. `bkit.cloud=claude` recorded ⇒ advisory states App + `/install-github-app` required, `bkit check` asserts config consistency (workflow has `id-token`, `ANTHROPIC_API_KEY` note, App advisory surfaced). Failure mode if skipped = OIDC boot error (loud).
6. Triggers: design/plan/build + manual ship/debug → `@claude /bkit-<phase>` in comment (wire via `claude.yml`). auto ship/debug → `bkit-cloud.yml` `workflow_run`, two-tier gated. Bare assignment not a phase carrier.
7. CI auto-route gate (two-tier): free tier job `if: contains(...,'bkit [auto route]')` = zero runner; cheap tier in-job `gh issue view {ISSUE} --json labels` re-checks `bkit:auto` = live kill switch; then dispatch `/bkit-cloud {ship|debug} {PR}`.
8. Marker `bkit [auto route]` on close-workflow + debug re-trigger, only when issue carried `bkit:auto` at close.
   **Defects:** D1 (id-token), D2 (skip-ci on worktree-setup/create-pr; debug re-trigger stays loud + marked), D3 (concurrency key).
   **Couples with #184 (land together):** #184's shared HEAD-subject assertion = SoT for commit-tag contract; build/debug/ship invoke it; treats `bkit [auto route]` as legitimate (not skip tag).
   **In-scope surfaces:** auth/install (`bkit-cloud.yml` + template, `renderCloudWorkflow`, `bkit-modules.ts` runCloudModule split + MODULE_REGISTRY + advisories + enforcement, `bkit-cli.ts` `--cloud` parsing/help/OPTIN_MODULES, manifest); CI trigger discipline (`bkit-build.md`, `bkit-debug.md`, `bkit-cloud.yml` gate/concurrency, `.agents/workflows/bkit-cloud.md` orchestrator); shared invariant (#184 snippet); triggers (`.github/workflows/claude.yml`); labels (Linear `Auto`→`bkit:auto` in preflight hooks + `.agents/trackers.md`); docs (`.agents/cloud.md`, generated `.agents/advisories.md`); tests (`bkit-modules.integration.test.ts`, render tests, dry-run parity, manifest, preflight).
   **Order:** 1) D1 + App auth + cloud-module split + enforcement + docs/advisory flip. 2) #184 shared assertion → D2 skip-tags + marker → two-tier gate. 3) D3 concurrency. 4) `@claude`/`claude.yml` + `Auto`→`bkit:auto`.
   **Verification checklist (13 items):** see plan child 3 Manual Verification.

### Comments 9-20 — Plan-workflow step comments (plan generated, reviewed, scope-checked, split into 3 children, merged to dev `fc52e44`). Plan requires human review before build. Human-gated prerequisites: Gate-1 confirmations (Acceptance Scenario + Breaking Changes), #184 shared-assertion shape resolution (same-PR coupling), post-merge live-dispatch runtime check.

---

## Merged plan (authoritative)

The master split index and three child sub-plans follow below.

---

===== docs/plans/202605/141-cloud-app-plan.md =====

Verdict: PASS

<!-- verdict:end -->

<!-- Note: Canonical plan path on promotion: `docs/plans/202605/141-cloud-app-plan.md`. This split index lives at `docs/plans/202605/logs/141-cloud-app/141-cloud-app-plan.md`. Source: `plan-v3-checked.md` (Verdict: PASS). {YYYYMM} = 202605. -->

# bkit-cloud rebuild on the Claude GitHub App — Split Plan Index (Parent)

> [!CAUTION]
> **THIS IS A SPLIT INDEX, NOT AN EXECUTABLE PLAN.** The master plan (`plan-v3-checked.md`) has been partitioned into three child sub-plans for execution-session sizing. Each child is self-contained and build-ready. Execute children in the stated order. This index carries context/goals/decisions; the children carry the tasks, gates, and verification.

> [!CAUTION]
> **CRITICAL:** Do not hallucinate plan execution state.
>
> 1. ALWAYS read the actual child `141-cloud-app-plan-N.md` file natively via the `read_file` tool _before_ executing any steps.
> 2. NEVER trust system-generated session summaries or previous conversation history to determine what has been completed.
> 3. Your source of truth is EXCLUSIVELY the literal `[x]` vs `[ ]` checkboxes in the physical child documents. If a box is `[ ]`, it is NOT DONE.

## ⛔ Land-Together Constraint (READ FIRST — applies to ALL children)

> [!CAUTION]
> **This is ONE coherent change that MUST land together as a single squashed PR — NOT three independent merges.**
>
> - The FINAL SCOPE comment (#141 `issuecomment-4542046671`) declares this "one coherent change" that "must land together" with **#184**'s single shared HEAD-subject assertion.
> - The three child sub-plans (`141-cloud-app-plan-1.md`, `141-cloud-app-plan-2.md`, `141-cloud-app-plan-3.md`) are **EXECUTION units sequenced on the SAME feature branch / single PR**. They are NOT separate PRs and NOT separate merges.
> - **A builder MUST NOT merge a partial change.** Completing child 1 does not mean "ship child 1." All three children + #184 land in one squashed PR (`bkit-ship.md` is hardcoded to `gh pr merge --squash --delete-branch --body ""`).
> - **#184 is FULLY FOLDED into this plan (RESOLVED 2026-05-27).** Its shared HEAD-subject assertion is the source of truth for the commit-tag contract that D2 (child 2) implements. The exact shape is resolved and recorded in [`141-cloud-app-plan-1.md`](./141-cloud-app-plan-1.md) § "#184 Shared HEAD-Subject Assertion — RESOLVED" (deny-list, home `.agents/workflows.md`, deterministic command, orchestrator-invoked). #184 has **no separate work product** — child 2 T2.1 + T2.5 discharge all four of its acceptance criteria; it is closed by this combined squash merge (or may be closed now as "folded into #141"). Do NOT split #141 and #184 into separate PRs.
> - Do NOT decompose into separate PRs. Do NOT propose `rebase` or `merge-commit`.

## Context & Goals

bkit's cloud-agent capability on GitHub-tracker repos has never run end-to-end: a live dispatch proved `claude-code-action@v1` cannot boot because `bkit-cloud.yml` lacks `id-token: write` and was designed to lean on `github.token` instead of the Claude GitHub App (D1). The same live trace surfaced two more defects — bookkeeping commits without `[skip ci]` fire the CI auto-router mid-build (D2), and an incoherent concurrency key lets a dispatched build race the auto-ship it triggers (D3). The authoritative FINAL SCOPE comment (#141 `issuecomment-4542046671`) rebuilds the whole capability **on** the Claude GitHub App (OIDC identity) rather than around it, splits the opt-in `cloud` module into `cloud=claude` / `cloud=cursor` variants constrained by tracker, moves the CI auto-route gate into a two-tier YAML guard (`bkit [auto route]` marker + in-job `bkit:auto` re-check), and migrates Linear's bare `Auto` label to `bkit:auto`. This change MUST land together with #184's single shared HEAD-subject assertion, which becomes the source of truth for the commit-tag contract that D2 implements.

**Success Criteria:**

- A live dispatch reaches a Claude turn: `claude-code-action@v1` authenticates as the Claude App via OIDC (`id-token: write` + App installed) on the `bkit-cloud.yml` CI path, gated by a coherent two-tier CI route and a single FID-derived concurrency key. (The `claude.yml` `@claude` mention path keeps its own existing `claude_code_oauth_token` auth — both surfaces _act as_ the Claude App, but they do NOT share one token input; see DECISION-A.)
- `cloud=claude` requires `tracker=github` and `cloud=cursor` requires `tracker=linear` (symmetric hard-error on mismatch); switching an established tracker hard-blocks without `--force`; all driven off `package.json` recorded state.
- The `bkit [auto route]` marker is the sole gate for zero-runner-minute CI routing, `bkit:auto` is consistent across every tracker, and all bkit tests stay green.

## Partition Rationale

The master plan (`plan-v3-checked.md`, 538 lines, ~31K tokens to read alone) carries **22 runbook tasks** (T1.1–T1.11, T2.1–T2.7, T3.1, T4.1–T4.3) across 20+ files in five layers (YAML, TypeScript, workflow prose, hook shell, docs). Total estimated end-to-end execution: ~180K agent tokens (plan read + ~10 TypeScript source reads + four workflow MDs + two YAML files + two preflight hooks + six docs + five test files + edits + iterating test failures). `ceil(180K / 100K) = 2`, but the FINAL-SCOPE four-block internal ordering plus the #184 hard dependency and the Block-2→Block-3 SHARED-DERIV coupling make a **3-way partition along block seams** the lossless, dependency-respecting split. Each child fits a single high-quality execution session (≤100K tokens) and is independently buildable in the stated order.

> [!NOTE]
> The complexity-check (`plan-complexity-check.md`) cites "24 tasks" but the actual runbook in `plan-v3-checked.md` contains exactly **22** T-prefixed tasks (T1.1–T1.11 = 11, T2.1–T2.7 = 7, T3.1 = 1, T4.1–T4.3 = 3). The 22-task count from the literal runbook is authoritative for losslessness. The complexity-check's proposed "Sub-plan A (human confirmations)" is folded into child 1's Gate 1 (it carries 0 runbook tasks); its "Sub-plan B / C / D" map to children 1 / 2 / 3 respectively.

**Partition backbone = FINAL SCOPE four-block internal ordering:**

- **Block 1** (cloud-module split + tracker/cloud enforcement + D1 App auth + docs/advisory flip) → **child 1** (`141-cloud-app-plan-1.md`).
- **Block 2** (#184 shared assertion → D2 skip-tags + `bkit [auto route]` marker → two-tier CI gate) **+ Block 3** (D3 concurrency, which reuses Block 2's SHARED-DERIV FID and cannot precede it) → **child 2** (`141-cloud-app-plan-2.md`).
- **Block 4** (`@claude` / `claude.yml` wiring + `Auto`→`bkit:auto` migration) + the full Gate 4 / Manual Verification pass → **child 3** (`141-cloud-app-plan-3.md`).

## Cross-Child Dependency Order (STRICT)

Execute in order. Each child names its upstream/downstream dependency.

1. **`141-cloud-app-plan-1.md` (Block 1)** — FIRST. The cloud-module split (`runCloudModule`, manifest) MUST precede tracker/cloud enforcement and the YAML two-tier gate in child 2 (the gate template edits build on child 1's `renderCloudWorkflow` GitHub-only render + `id-token`). **Gate 1 (two human confirmations + #184 coordination + preflight) is the blocking prerequisite for this child and must be cleared before T1.1.**
2. **`141-cloud-app-plan-2.md` (Block 2 + 3)** — SECOND. **Blocked on:** (a) #184's exact shared-assertion shape resolved (Gate-1 prerequisite, carried in child 1); (b) child 1's `bkit-cloud.yml` template/render edits landed (the two-tier gate + concurrency key edit the same template). T2.1 (#184 assertion) MUST resolve before T2.3/T2.4 (marker/skip-tag tasks) because #184 owns the shared assertion shape that treats `bkit [auto route]` as legitimate. Block 3's T3.1 reuses Block 2's SHARED-DERIV FID and MUST follow T2.7.
3. **`141-cloud-app-plan-3.md` (Block 4 + verification)** — THIRD/LAST. Block 4 is dogfood/bkit-repo-only (DECISION-B). The full Gate 4 + 13-item Manual Verification checklist runs here, mapping 1:1 onto the FINAL SCOPE checklist, and gates the single combined #141+#184 squash PR. Item (1) is HUMAN-GATED, POST-MERGE.

## Child Manifest

<!-- prettier-ignore -->
| Child | Block(s) | Tasks | Count | Scope summary |
| --- | --- | --- | --- | --- |
| [`141-cloud-app-plan-1.md`](./141-cloud-app-plan-1.md) | Block 1 | T1.1–T1.11 | 11 | D1 App auth (`id-token: write`), cloud-module split (`cloud=claude`/`cloud=cursor`), `--cloud=` value flag + `--force`, single `bkit.cloudAgents=claude | cursor | none` field, tracker/cloud constraint + tracker-switch hard-block, manifest split, advisory flip (App optional→required), `bkit check` consistency, postinstall reconciliation, dry-run parity, advisories regen. Carries Gate 1 (both human confirmations + #184 coordination). |
| [`141-cloud-app-plan-2.md`](./141-cloud-app-plan-2.md) | Block 2 + Block 3 | T2.1–T2.7, T3.1 | 8 | #184 shared HEAD-subject assertion, D2 skip-tags (`worktree-setup`/`create-pr` → `[skip ci]`), `bkit [auto route]` marker on close-workflow / debug re-trigger (mode-dependent, ordering-fixed), ship/debug/build invoke the shared assertion, orchestrator gate move into YAML + DECISION-E PR-label-mirror delete, two-tier CI gate + SHARED-DERIV (PR-body marker primary), D3 concurrency key reusing SHARED-DERIV. |
| [`141-cloud-app-plan-3.md`](./141-cloud-app-plan-3.md) | Block 4 | T4.1–T4.3 | 3 | `@claude` / `claude.yml` trigger wiring (bkit-repo-only, DECISION-B), `Auto`→`bkit:auto` migration in preflight hooks + `trackers.md`. Carries Gate 4 + full 13-item Manual Verification checklist (1:1 with FINAL SCOPE). |

**Total: 11 + 8 + 3 = 22 tasks** (matches the master runbook's 22 T-tasks — lossless).

## Gate Distribution

- **Gate 1 (Prerequisites + two human confirmations + #184 coordination)** → `141-cloud-app-plan-1.md` (blocks T1.1; the first build block).
- **Gate 2 (Code Implementation Check)** → split: each child carries a scoped Gate-2 covering its own tasks; the combined Gate-2 across all three children must pass before the single PR.
- **Gate 3 (Testing & Documentation Check)** → split across children by the docs each touches; `141-cloud-app-plan-3.md` carries the consolidated docs/advisories-regen confirmation.
- **Gate 4 (Automated Verification Confirmed)** → `141-cloud-app-plan-3.md` (full automated-test pass over all three children's output).

## Decisions Carried Into Children (A–E, all LOCKED)

These five decision points are LOCKED in the master and carried verbatim into the child(ren) that act on them. Human may override A–E only at Gate 1 (child 1); the runbooks assume the locked defaults and do NOT branch.

- **DECISION-A — `claude.yml` vs `bkit-cloud.yml` auth model (resolves R1-C1 / R3-C1a / R2-opt).** The two surfaces authenticate via **different** mechanisms by design and MUST NOT be reconciled into one input: `claude.yml` (the `@claude` mention path) keeps its existing `claude_code_oauth_token: ${{ secrets.CLAUDE_CODE_OAUTH_TOKEN }}` + `id-token: write` (Claude-subscription OAuth, App-generated workflow); `bkit-cloud.yml` (the CI auto-route path) gains `id-token: write` and keeps `ANTHROPIC_API_KEY`. Both _run as the Claude App_ at the identity level; "coherent" means "both surface as the App," NOT "same token surface." A builder MUST NOT migrate `claude.yml` onto `ANTHROPIC_API_KEY` or vice-versa. (Acts in child 1 T1.1/T1.7 and child 3 T4.1.)
- **DECISION-B — `claude.yml` is bkit-repo-only; `@claude /bkit-<phase>` is NOT a shipped consumer trigger this cycle (resolves R1-C2 / R2-opt / R3-C1b).** `Glob **/claude.yml` confirms there is NO `.agents/templates/**/claude.yml` — `claude.yml` is generated by the Claude GitHub App's `/install-github-app`, not by `bkit install`. **Do NOT ship a bkit `claude.yml` template this cycle.** Consequence: the consumer-facing `@claude /bkit-<phase>` capability rides entirely on (a) the consumer running `/install-github-app` (which generates their own `claude.yml` that already fires on any `@claude` comment and passes the typed command through as the prompt) and (b) the `bkit-cloud-setup` advisory (T1.7) directing them to do so. Block 4's `claude.yml` edits are **dogfood/bkit-repo-only**. (Acts in child 3 T4.1; advisory in child 1 T1.7.)
- **DECISION-C — single `bkit.cloudAgents` field carries presence + variant (`"claude" | "cursor" | "none"`). AMENDED 2026-05-27 (maintainer review, pre-build).** Supersedes the original two-field split (`bkit.cloudAgents` presence + a separate `bkit.cloud` variant). Widen the existing `bkit.cloudAgents` value space from `"enabled" | "none"` to **`"claude" | "cursor" | "none"`** — one self-describing field mirroring `bkit.issueTracker` (`"github" | "linear" | "none"`). **NO separate `bkit.cloud` field.** Presence = `value !== "none" && value !== undefined`. **Back-compat:** `parseCloudAgents` (`bkit-postinstall.ts`) must map legacy `"enabled"` → `"claude"` (the only meaning `enabled` ever had — Linear was vestigial). The `bkit check` consistency assertion (T1.8) and uninstall variant resolution read `bkit.cloudAgents`. Rationale: cleaner, self-describing, and removes the cross-reference-tracker-to-pick-variant logic in the advisories. (Acts in child 1 T1.5/T1.8.)
- **DECISION-D — manifest split, not variant-gated emission (resolves R1-O3 / R2-opt / R3-opt).** Split `CLOUD_MANIFEST` so `cloud=claude` owns `bkit-cloud.yml` (`byte-equal-text`) + `cloud-bootstrap.sh`, and `cloud=cursor` owns `.cursor/Dockerfile` (`markered-text`) + `environment.json` (or tag each manifest entry with its owning variant). Uninstall walks the manifest and MUST remove only the recorded variant's files — a single manifest with variant-gated _emission_ but unconditional _uninstall listing_ would orphan the unused variant's files on `uninstall`. The split makes uninstall mechanical. (Acts in child 1 T1.5.)
- **DECISION-E — drop the PR `bkit:auto` label mirror; the live kill switch is the in-job issue-label re-check. AMENDED 2026-05-27 (maintainer review, pre-build).** Supersedes the original "re-home the PR-label propagation into YAML." Investigation confirmed the PR `bkit:auto` label is **write/mirror-only** — the gate reads the **issue** label (`gh issue view`); nothing filters on the PR label. So **DELETE** the PR-label propagation from `kill-switch-check` (`trackers.md:169`/`274`) and the orchestrator (`bkit-cloud.md:193-196`) rather than re-homing it. The live kill switch is the cheap-tier in-job `gh issue view {ISSUE} --json labels` re-check of `bkit:auto` (FINAL SCOPE decision 7). **No PR-body `auto` flag** is introduced: the commit-message marker (`bkit [auto route]`) is the free runner gate; the issue-label read is the live revocation. (Acts in child 2 T2.6/T2.7.)

### Rejected & Future (carried for context)

- **Rejected (D1, pre-FINAL-SCOPE):** bypass the App by passing `github.token` as the action's own auth (`github_token` input). Superseded by Comment 7 / FINAL SCOPE decision 1 — build on the App (OIDC identity, PR/issue context, comment posting, `@claude` triggers) rather than around it.
- **Rejected:** runtime App-presence detection (probe whether the App is installed from a user PAT). Not reliably detectable from a user PAT (FINAL SCOPE decision 5). Use `package.json`-recorded state + advisory + `bkit check` consistency instead.
- **Rejected:** auto-derive `--cloud` variant from tracker. FINAL SCOPE decision 3 requires explicit `--cloud=claude|cursor`; the tracker constrains the variant (mismatch = hard error) but does not select it.
- **Future:** broaden App trigger surfaces beyond `issue_comment` (`pull_request_review_comment`, etc.) once the primary `@claude /bkit-<phase>` path is verified live. Bare issue assignment as a phase carrier is explicitly out of scope.

## Out of Scope (carried for context)

- Linear → `repository_dispatch` → `bkit-cloud` bridge (DROPPED in #119/Comment 1; Linear cloud routing is Cursor-native).
- Bare issue assignment as a phase-carrier trigger (FINAL SCOPE decision 6).
- Linear-side label migration in a live Linear workspace (bkit ships the renamed snippets/hooks; relabelling existing Linear issues is a consumer action).
- The live dispatch runtime-verification (requires a real GitHub Actions dispatch + Claude App install) — captured as a human-gated post-merge Manual Verification item (child 3 item 1), not automatable in-plan.

## Merge Method

**Merge method: always squash.** This plan MUST NOT propose `rebase` or `merge-commit`. `bkit-ship.md` is hardcoded to `gh pr merge --squash --delete-branch --body ""`. **#141 and #184 must land together — implement both on a single branch / single squashed PR** (the shared HEAD-subject assertion in #184 is invoked by D2's build-path changes; splitting them strands the contract). The three children are execution units on that single branch. Do NOT decompose into separate PRs.

## Rollback Strategy

<!-- prettier-ignore -->
| Axis | Action | Notes |
| --- | --- | --- |
| **DB** | N/A | bkit has no database. |
| **Code** | `git revert {SQUASH_SHA}` of the combined #141+#184 PR | Single squashed commit; revert restores prior `bkit-cloud.yml`, CLI, workflows, docs atomically. |
| **Risk window** | None for installed consumers until they re-run `bkit install`/`upgrade` | Shipped workflow/CLI changes only take effect on consumer re-install; live consumers on the old `--cloud` keep their existing (broken-at-boot) workflow until they upgrade. |

_Code-only — `git revert` sufficient._

## Sub-Plan Index

> The Agent Execution Runbook, gates, and verification have been moved into the child sub-plans. Execute in order:

1. [`141-cloud-app-plan-1.md`](./141-cloud-app-plan-1.md) — **Block 1:** D1 + cloud-module split + tracker/cloud enforcement + advisory flip (T1.1–T1.11). Carries Gate 1.
2. [`141-cloud-app-plan-2.md`](./141-cloud-app-plan-2.md) — **Block 2 + 3:** #184 assertion + D2 skip-tags + `bkit [auto route]` marker + two-tier CI gate + D3 concurrency (T2.1–T2.7, T3.1).
3. [`141-cloud-app-plan-3.md`](./141-cloud-app-plan-3.md) — **Block 4 + verification:** `@claude`/`claude.yml` wiring + `Auto`→`bkit:auto` (T4.1–T4.3) + Gate 4 + full 13-item Manual Verification.

===== docs/plans/202605/141-cloud-app-plan-1.md =====

<!-- Child sub-plan 1 of 3. Source: plan-v3-checked.md. {YYYYMM} = 202605. -->

# bkit-cloud rebuild on the Claude GitHub App — Child 1: Block 1 (D1 + cloud-module split + enforcement + advisory flip)

**Parent Plan:** [`141-cloud-app-plan.md`](./141-cloud-app-plan.md)

> [!CAUTION]
> **CRITICAL:** Do not hallucinate plan execution state.
>
> 1. ALWAYS read this actual file natively via the `read_file` tool _before_ executing any steps.
> 2. NEVER trust system-generated session summaries or previous conversation history.
> 3. Your source of truth is EXCLUSIVELY the literal `[x]` vs `[ ]` checkboxes in this physical document. If a box is `[ ]`, it is NOT DONE.

## ⛔ Land-Together Constraint (READ FIRST)

> [!CAUTION]
> **This child is ONE of THREE execution units on a SINGLE feature branch / single squashed PR — NOT an independent merge.** Completing this child does NOT mean "ship Block 1." All three children ([`141-cloud-app-plan-1.md`](./141-cloud-app-plan-1.md), [`141-cloud-app-plan-2.md`](./141-cloud-app-plan-2.md), [`141-cloud-app-plan-3.md`](./141-cloud-app-plan-3.md)) **plus #184** land together in one squashed PR (`bkit-ship.md` → `gh pr merge --squash`). A builder MUST NOT merge a partial change. See the [parent index](./141-cloud-app-plan.md) § Land-Together Constraint.

## Position in Sequence

- **This is child 1 of 3 — execute FIRST.**
- **Downstream:** [`141-cloud-app-plan-2.md`](./141-cloud-app-plan-2.md) (Block 2 + 3) depends on this child's `bkit-cloud.yml` template/render edits (the two-tier gate + concurrency key in child 2 edit the same template that T1.1–T1.3 establish here). The cloud-module split (T1.5) MUST precede tracker/cloud enforcement and the YAML gate.
- **Blocking prerequisite:** Gate 1 below (two human confirmations + #184 coordination + preflight) MUST be cleared before T1.1.

## Context & Goals

bkit's cloud-agent capability on GitHub-tracker repos has never run end-to-end: a live dispatch proved `claude-code-action@v1` cannot boot because `bkit-cloud.yml` lacks `id-token: write` and was designed to lean on `github.token` instead of the Claude GitHub App (D1). The same live trace surfaced two more defects — bookkeeping commits without `[skip ci]` fire the CI auto-router mid-build (D2), and an incoherent concurrency key lets a dispatched build race the auto-ship it triggers (D3). The authoritative FINAL SCOPE comment (#141 `issuecomment-4542046671`) rebuilds the whole capability **on** the Claude GitHub App (OIDC identity) rather than around it, splits the opt-in `cloud` module into `cloud=claude` / `cloud=cursor` variants constrained by tracker, moves the CI auto-route gate into a two-tier YAML guard (`bkit [auto route]` marker + in-job `bkit:auto` re-check), and migrates Linear's bare `Auto` label to `bkit:auto`. This change MUST land together with #184's single shared HEAD-subject assertion.

**This child (Block 1) delivers:** D1 fix (`id-token: write` + App-auth framing) on the `bkit-cloud.yml` template + rendered copy, the `renderCloudWorkflow` Linear-branch deletion (GitHub-only render), the `--cloud=claude|cursor` value-bearing flag + `--force`, the `runCloudModule` variant split + single `bkit.cloudAgents=claude|cursor|none` field + manifest split, the symmetric tracker/cloud constraint + tracker-switch hard-block, the `bkit-cloud-setup` advisory flip (App optional→required) + `Auto`→`bkit:auto` advisory text, the `bkit check` consistency assertion, the `bkit-postinstall.ts` Linear-coupling reconciliation, dry-run parity for both variants, and the `advisories.md` regen.

**Success Criteria (this child):**

- `cloud=claude` requires `tracker=github` and `cloud=cursor` requires `tracker=linear` (symmetric hard-error on mismatch); switching an established tracker hard-blocks without `--force`; all driven off `package.json` recorded state.
- `bkit-cloud.yml` renders GitHub-only with `id-token: write` and no `github.token`-handles-everything framing; `renderCloudWorkflow` has no Linear branch.
- The `bkit-cloud-setup` advisory states the App + `/install-github-app` are required; no bare `Auto` survives in advisory text; `bkit check` flags `cloud=claude` config inconsistency.

---

## 👤 ⚠️ Acceptance Scenario — HUMAN REVIEW REQUIRED

> [!CAUTION]
> **🛑 HUMAN MUST READ AND CONFIRM THIS SECTION.**
> This is the testable contract for the feature. Everything below — implementation, tests, verification — is derived from what you confirm here. If this is wrong, everything downstream is wrong.
>
> **You do NOT need to read the rest of this plan.** Focus here. The agent handles the rest.

### Spec — what good looks like

> [!IMPORTANT]
> Standalone plan (no `{FID}-design.md`). The FINAL SCOPE comment is the authoritative source. Narrative + Success Criteria are derived directly from it (not from a design doc), then expanded with plan-level edge cases, a concrete example, and a derived test matrix.

> [!NOTE]
> The Acceptance Scenario, Breaking Changes, Concrete Example, Edge Cases, and the FULL Derived Test Matrix below cover the ENTIRE feature (all three children), because they are the single testable contract for the whole coherent change. They are carried in this first child because Gate 1 (the human-confirmation gate) gates the first build block. Children 2 and 3 reference this section.

### Narrative

A bkit consumer on a GitHub-tracker repo runs `bkit install --cloud=claude`, installs the Claude GitHub App once (`/install-github-app`, which generates their own App-owned `claude.yml`), and labels an issue `bkit:auto`. From then on, `@claude /bkit-<phase>` comments launch design/plan/build (and manual ship/debug) as the App — via the consumer's App-generated `claude.yml`, not a bkit-shipped one (DECISION-B) — while a green/red CI run auto-routes to ship/debug through bkit's `bkit-cloud.yml` — but only for commits carrying `bkit [auto route]` and only while the linked issue still carries `bkit:auto`, with no runner minutes burned otherwise.

### Success Criteria

- `claude-code-action@v1` authenticates as the Claude App (`id-token: write` granted + App installed); a live dispatch reaches a Claude turn (standing runtime-verification item, human-gated post-merge).
- `cloud=claude` requires `tracker=github`; `cloud=cursor` requires `tracker=linear`; mismatch hard-errors symmetrically; first tracker-set is free, switching an established tracker hard-blocks without `--force` — all from `package.json` recorded state.
- CI auto-route fires only for commits carrying `bkit [auto route]` (zero runner minutes otherwise) and only while the linked issue still carries `bkit:auto` (live kill switch).
- `worktree-setup` / `create-pr` commits carry `bkit [skip ci]`; only the close-workflow commit (and the debug re-trigger commit) are loud and carry `bkit [auto route]`; #184's shared HEAD-subject assertion owns the contract and treats `bkit [auto route]` as legitimate.
- Linear bare `Auto` is migrated to `bkit:auto` across preflight hooks + tracker snippets; `bkit-cloud.yml` is GitHub-only (vestigial Linear render branch removed); all tests green.

### Concrete Example

**Setup:** A consumer repo with `bkit.issueTracker = "github"`. Maintainer runs `bkit install --cloud=claude`, sets the `ANTHROPIC_API_KEY` repo secret, and runs `/install-github-app` once. Issue #50 carries `bkit:auto`.

**Steps:**

1. Maintainer comments `@claude /bkit-build 50` on issue #50 → the consumer's App-generated `claude.yml` fires (NOT bkit-shipped — DECISION-B), `claude-code-action@v1` authenticates as the App (via `claude_code_oauth_token` on that path — DECISION-A), runs `/bkit-build 50` → bkit-build runs, pushing `chore(50-…): worktree-setup bkit [skip ci]` and `chore(50-…): create-pr bkit [skip ci]` (no CI fired by these), then a loud `chore(50-…): close-workflow … bkit [auto route]` as the trailing HEAD.
2. CI runs on the close-workflow push (HEAD has no `[skip ci]`) → `bkit-cloud.yml` `workflow_run` fires → free-tier `if:` sees `bkit [auto route]` in the head commit → job runs → in-job `gh issue view 50 --json labels` confirms `bkit:auto` still present → dispatches `/bkit-cloud ship 102` as the App.
3. Maintainer removes `bkit:auto` from issue #50 mid-flight → next CI completion: free-tier `if:` still matches the marker, but the in-job re-check finds no `bkit:auto` → no-op exit (live kill switch).

**Outcome:** Auto-routing fires exactly once per intended trigger, never on `[skip ci]` bookkeeping commits, never when the issue is un-opted-in, and the dispatched build and the ship it triggers share one concurrency group so they cannot race.

### Edge Cases

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| `worktree-setup` / `create-pr` commit on a re-build with an open PR | Commit carries `bkit [skip ci]` → no `pull_request` synchronize CI → router does NOT fire mid-build (D2 fixed) |
| Commit without `bkit [auto route]` triggers CI | Free-tier `if:` evaluates false → job skipped → zero runner minutes |
| Commit has `bkit [auto route]` but issue lost `bkit:auto` | Job runs (cheap tier), in-job `gh issue view` finds no `bkit:auto` → no-op exit 0 |
| Dispatched build still running when its CI completes | Both surfaces resolve to one FID-derived concurrency token → `cancel-in-progress` serialises them (D3 fixed) |
| `bkit install --cloud=claude` on a `tracker=linear` repo | Hard error (symmetric tracker/cloud constraint), no files written |
| `bkit install --cloud=cursor` on a `tracker=github` repo | Hard error (symmetric tracker/cloud constraint), no files written |
| `bkit install --tracker=linear` when `bkit.issueTracker` is already `github` | Hard-block with explicit message; requires `--force` to override; first-set (no recorded tracker) is free |
| `cloud=claude` recorded but workflow lacks `id-token` / advisory missing | `bkit check` flags config inconsistency (exit 1) |
| `@claude` bare issue assignment (no typed command) | NOT a phase carrier — no phase dispatched (assignment out of scope as a trigger) |
| Consumer wants `@claude /bkit-<phase>` on their own repo | They run `/install-github-app` once → the App generates their own `claude.yml` (fires on any `@claude` comment, passes the typed command through). bkit ships NO `claude.yml` template (DECISION-B); the `bkit-cloud-setup` advisory directs them to `/install-github-app`. |
| Debug re-trigger commit | Stays loud (no `[skip ci]`) AND carries `bkit [auto route]` so the marked commit is HEAD at CI time |
| `bkit [auto route]` token on HEAD when #184 assertion runs | Treated as a legitimate HEAD token, NOT a skip tag — assertion passes |

### Derived Test Matrix (FULL — all children)

> Each row → one Agent Execution Runbook task across the three children. Rows owned by this child (Block 1) are marked **[C1]**; rows owned by child 2 (Block 2/3) are marked **[C2]**; rows owned by child 3 (Block 4) are marked **[C3]**.

<!-- prettier-ignore -->
| Test description | Type | Target file | Owner |
| --- | --- | --- | --- |
| `cloud=claude` renders `bkit-cloud.yml` with `id-token: write` + no Linear branch + no `github.token`-handles-everything framing | Unit (Vitest) | `.agents/scripts/bkit-modules.integration.test.ts` | **[C1]** T1.2/T1.3 |
| `renderCloudWorkflow` accepts only `cloud=claude`/`github` shape; Linear render branch removed | Unit (Vitest) | `.agents/scripts/bkit-modules.integration.test.ts` | **[C1]** T1.2 |
| `--cloud=claude` requires `tracker=github`; `--cloud=cursor` requires `tracker=linear`; mismatch hard-errors symmetrically | Unit (Vitest) | `.agents/scripts/bkit-cli.test.ts` (+ install enforcement test) | **[C1]** T1.4/T1.6 |
| Switching an established tracker hard-blocks without `--force`; first-set is free | Integration (Vitest) | `.agents/scripts/bkit-modules.integration.test.ts` (or install-level test) | **[C1]** T1.6 |
| `cloud=cursor` ships `.cursor/Dockerfile` + `environment.json`; `cloud=claude` does not orphan Cursor config | Unit (Vitest) | `.agents/scripts/bkit-modules.integration.test.ts` | **[C1]** T1.5 |
| `bkit-cloud-setup` advisory states App + `/install-github-app` required (optional→required); `github.token`-only framing deleted; no bare `Auto` in advisory text | Unit (Vitest) | `.agents/scripts/bkit-modules.integration.test.ts` | **[C1]** T1.7 |
| `bkit-postinstall.ts` cloud advisories no longer couple `LINEAR_API_KEY` to `bkit-cloud.yml`; GitHub-only secret set for `cloud=claude` | Unit (Vitest) | `.agents/scripts/bkit-postinstall.ts` test / `bkit-modules.integration.test.ts` | **[C1]** T1.9 |
| `bkit check` asserts `cloud=claude` config consistency (workflow has `id-token`, `ANTHROPIC_API_KEY` note, App advisory surfaced) | Integration (Vitest) | `.agents/scripts/bkit-modules.integration.test.ts` / doctor test | **[C1]** T1.8 |
| Two-tier CI gate: job skipped without `bkit [auto route]` (negative) AND fires-to-dispatch when marked-commit-is-HEAD + `bkit:auto` present (positive); in-job `bkit:auto` re-check kill switch; `{ISSUE}` via SHARED-DERIV | Manual/YAML review + render/grep assertion (no unit harness for GHA `if:`) | `.github/workflows/bkit-cloud.yml` + template | **[C2]** T2.7 |
| Concurrency key reconciled to one FID-derived token across dispatch + CI surfaces | Unit (Vitest, render assertion) | `.agents/scripts/bkit-modules.integration.test.ts` | **[C2]** T3.1 |
| `worktree-setup` / `create-pr` carry `bkit [skip ci]`; close-workflow + debug re-trigger are loud + marked | Doc/workflow review (no executable test) | `.agents/workflows/bkit-build.md`, `.agents/workflows/bkit-debug.md` | **[C2]** T2.2/T2.3/T2.4 |
| `Auto` → `bkit:auto` migrated in preflight hooks | Integration (Vitest, rendered-file assertion via real tool path) | preflight render / `bkit-modules.integration.test.ts` | **[C3]** T4.2 |
| Dry-run parity for `cloud=claude` and `cloud=cursor` | Integration (Vitest) | `.agents/scripts/bkit-dry-run-parity.integration.test.ts` | **[C1]** T1.10 |
| Manifest entries for `cloud=claude` vs `cloud=cursor` variants | Unit (Vitest) | `.agents/scripts/bkit-manifest.test.ts` (existing suite) | **[C1]** T1.5 |

### 👤 ✅ Human Confirmation

- [x] **Acceptance Scenario confirmed:** I have reviewed the Narrative, Success Criteria, Concrete Example, Edge Cases, and Derived Test Matrix above. They correctly describe what "done" looks like.

> [!CAUTION]
> **Agent:** Do NOT pass Gate 1 until this checkbox is `[x]`. Summary must issue `REVISE` if unchecked.

---

## 👤 ⚠️ Breaking Changes & Naming Review — HUMAN REVIEW REQUIRED

> [!CAUTION]
> **🛑 HUMAN MUST READ AND CONFIRM THIS SECTION.**
> Review proposed names and breaking changes below.

> [!WARNING]
> **Consumer-facing breaking changes (bkit consumers on GitHub-tracker repos):**
>
> 1. **The Claude GitHub App becomes a base requirement** for `cloud=claude` (was optional "path E"). Consumers who installed `--cloud` and relied on `github.token` must now run `/install-github-app` once. Without it, `claude-code-action@v1` fails at boot with the OIDC error. This is surfaced in the `bkit-cloud-setup` advisory and `bkit check`.
> 2. **`--cloud` flag value is now mandatory and explicit:** `--cloud=claude` or `--cloud=cursor` (no bare `--cloud`, not auto-derived from tracker). Any script/CI invoking `bkit install --cloud` must update.
> 3. **Switching an established issue tracker now hard-blocks** without `--force`. First-set remains free. Reversing a previously silent `linear↔github` flip now errors loudly.
> 4. **`bkit-cloud.yml` no longer renders a Linear branch.** A `tracker=linear` repo that opted into the old `--cloud` workflow no longer gets a Linear-flavoured `bkit-cloud.yml`; Linear cloud routing is Cursor-native (`cloud=cursor` → `.cursor/` scaffolding).
> 5. **Linear bare `Auto` label renamed to `bkit:auto`** in shipped preflight hooks. Consumers on Linear must relabel issues (or the migration advisory must direct them).

> [!IMPORTANT]
> **New names / fields:**
>
> - New CLI value: `--cloud=claude|cursor` (replaces bare `--cloud`).
> - **Changed `package.json` field:** `bkit.cloudAgents` value space widens from `"enabled" | "none"` to **`"claude" | "cursor" | "none"`** (one self-describing field, mirrors `bkit.issueTracker`). **DECISION-C (AMENDED 2026-05-27):** a single field carries presence + variant; **NO separate `bkit.cloud` field**. Legacy `"enabled"` reads as `"claude"` (back-compat in `parseCloudAgents`). FINAL SCOPE decision 4's "new cloud-variant field" is resolved this way.
> - New commit marker: `bkit [auto route]` (literal, `bkit` outside the brackets, direction-neutral; mirrors `bkit [skip ci]`).
> - New workflow grant: `id-token: write` in `bkit-cloud.yml`.

### 👤 ✅ Human Confirmation

- [x] **Breaking Changes confirmed:** I have reviewed all breaking changes and naming decisions above.

> [!CAUTION]
> **Agent:** Do NOT pass Gate 1 until this checkbox is `[x]`. Summary must issue `REVISE` if unchecked.

---

## Decisions (A–E, all LOCKED — full text in [parent index](./141-cloud-app-plan.md))

This child acts on **DECISION-A** (T1.1/T1.7 — keep `bkit-cloud.yml` on `ANTHROPIC_API_KEY`+OIDC; do NOT migrate to/from `claude_code_oauth_token`), **DECISION-B** (T1.7 advisory directs consumers to `/install-github-app`; no shipped `claude.yml` template), **DECISION-C (AMENDED 2026-05-27)** (T1.5/T1.8 — single `bkit.cloudAgents = claude|cursor|none` field; legacy `enabled`→`claude`; NO separate `bkit.cloud` field), and **DECISION-D** (T1.5 — manifest split so uninstall removes only the recorded variant's files). DECISION-E acts in child 2. Human may override A–E only at Gate 1; the runbook assumes the locked defaults and does NOT branch.

## Supersession Inventory (FULL — carried in this child; rows acted on by all children)

> [!CAUTION]
> Each `DELETE` row is mirrored in `Architecture & Component Changes` and as a removal task in the relevant child's `Agent Execution Runbook`. Rows owned by this child marked **[C1]**; child 3 marked **[C3]**.

<!-- prettier-ignore -->
| Existing artifact | Replaced by | Decision | Justification | Owner |
| --- | --- | --- | --- | --- |
| `renderCloudWorkflow` Linear render branch (`isLinear` mcp/secret substitution) `.agents/scripts/bkit-modules.ts:1910-1921` | GitHub-only render (drop `@@CLOUD_TRACKER_*@@` Linear paths; add `id-token`) | DELETE | `bkit-cloud.yml` is GitHub-tracker-only; the Linear branch is vestigial (FINAL SCOPE "Vestigial Linear branch removed"). | **[C1]** T1.2 |
| `bkit-cloud.yml:23-25` "`github.token` handles all repo git/gh; no App" rationale (canonical + template; line 22 is the tracker-conditional sentence, framing is 23-25 per R3) | App-auth framing (`id-token: write` + App required) | DELETE | FINAL SCOPE decision 1: delete the framing; commits/PRs/comments appear as the App. | **[C1]** T1.1 |
| `bkit-modules.ts:2075` "Do NOT add `GH_BKIT_TOKEN_INSTALL` … github.token" advisory line | App-required advisory text | DELETE | Same as above; advisory must state App + `/install-github-app` required (decision 2). | **[C1]** T1.7 |
| Bare `Auto` label in `.agents/templates/.claude/hooks/preflight.sh:8,109-111` + `.agents/templates/.cursor/hooks/preflight.sh:8,96-98` | `bkit:auto` | DELETE | Label convention: `bkit:` prefix on every tracker (FINAL SCOPE Labels row; migrate bare `Auto`). | **[C3]** T4.2 |
| Bare `Auto` in `bkit-modules.ts` advisory text — `bkit-cloud-setup` strings at `:2051` ("reads the `Auto` opt-in label"), `:2054` ("labelled `Auto` in Linear"), `:2055` ("carries the `Auto` label") | `bkit:auto` (fix-in-place) OR removed-with-branch | DELETE | R3-2: consumer-facing advisory shipped by bkit must say `bkit:auto` for consistency with the migrated hooks that check `bkit:auto`. These live in the `isLinearCloud` branch — reconcile with the cloud-split (cursor=linear): if the split removes the branch wholesale, the strings go with it; otherwise fix them in place. Either way they MUST NOT survive saying bare `Auto`. | **[C1]** T1.7 |
| Bare `--cloud` flag (value-less) `.agents/scripts/bkit-cli.ts` | `--cloud=claude\|cursor` value-bearing flag | DELETE | FINAL SCOPE decision 3: explicit variant, tracker-constrained. | **[C1]** T1.4 |
| `bkit-postinstall.ts` `tracker==="linear"` → `LINEAR_API_KEY`-in-`bkit-cloud.yml` coupling in `buildCloudSetupAdvisory` (`:803`), `buildCloudDashboardsAdvisory` (`:849`), `buildCloudSecretsAdvisory` (`:895`) | GitHub-only secret set for `cloud=claude`/`tracker=github`; `LINEAR_API_KEY`/`.cursor` guidance moves to the `cloud=cursor`/`tracker=linear` path | DELETE | Decision 1 / "Vestigial Linear branch removed; `bkit-cloud.yml` is GitHub-only" — a Linear `bkit-cloud.yml` can no longer exist, so these three branches describe an impossible state and `buildCloudSecretsAdvisory` would tell a mis-recorded consumer to set a `LINEAR_API_KEY` the GitHub-only workflow never reads (downstream-reader regression). Removed by T1.9. | **[C1]** T1.9 |

## Security & Privacy

> bkit is a tooling repo, not the app-gether-life app — the template's API-route/RLS/Zod rows do not apply. Relevant rows:

- [x] **Webhook / event trigger** — `bkit-cloud.yml` `workflow_run` and `claude.yml` `issue_comment` are GitHub-native events; the two-tier gate (`bkit [auto route]` marker + in-job `bkit:auto` re-check) is the trust boundary. No raw webhook secret to verify (GitHub signs events).
- [x] **New secret/env var** — `ANTHROPIC_API_KEY` (existing) is the only required secret; `id-token: write` is an OIDC grant, not a stored secret. No new stored secret. `GH_BKIT_TOKEN_INSTALL` must NOT be added to `bkit-cloud.yml` (package-install scoped, no consumer-repo access).
- [x] **Auth model** — On the CI auto-route path (`bkit-cloud.yml`), `claude-code-action@v1` authenticates as the Claude App via OIDC (federated, `id-token: write`) + `ANTHROPIC_API_KEY` (LLM). On the `@claude` mention path (`claude.yml`), it authenticates via `claude_code_oauth_token` + `id-token: write`. **Two distinct token surfaces, same App identity — intentional, not to be reconciled (DECISION-A).** Confirm each `permissions:` block grants `id-token: write` and no broader scope than needed.

_No new API routes, DB writes, or user-input schemas — bkit ships workflow + CLI + docs only._

## 🚨 Pre-Flight / Dependencies 🚨

**CRITICAL:** Check off ALL core items. Check conditional items only when applicable. Abort if anything required is missing.

### Core (always verify)

- [ ] **Package Management:** No new npm deps expected (CLI + YAML + docs only). Verify `pnpm-lock.yaml` syncs cleanly after edits to `.agents/scripts/*.ts`.
- [ ] **Dependency Versions:** Spot-check `claude-code-action@v1` tag pin in both `bkit-cloud.yml` and `claude.yml`; `actions/checkout@v4`. Confirm `vale 3.9.1` / `pnpm 10.33.0` references in `cloud.md` unchanged.
- [ ] **User Context:** Verify read/write to `.agents/scripts/`, `.agents/workflows/`, `.agents/templates/`, `.github/workflows/`, `.agents/cloud.md`, `.agents/trackers.md`, `docs/`.
- [ ] **Pending Blockers:** Confirm **#184** state and land it on the same branch (shared HEAD-subject assertion is a hard dependency — see Prerequisite Plans). Check `docs/pending.md` for related deferrals.
- [ ] **Project Context:** Read `docs/knowledge.md` KN-11 (`[skip ci]` HEAD → empty rollup) + KN-23 (CI is the only quality gate); `docs/deployments.md` § "CI trigger on final workflow push" (the existing commit-tag contract that #184 formalises and D2 implements); `docs/decisions.md`.
- [ ] **Testing & Quality:** Align with bkit's Vitest suites (`bkit-modules.integration.test.ts`, `bkit-dry-run-parity.integration.test.ts`, `bkit-doctor.integration.test.ts`, `bkit-cli.test.ts`). Validate shipped config with the real tool/resolver, never string-presence-only (per repo memory).
- [ ] **Prerequisite Plans:** **#184** (shared HEAD-subject assertion) — MUST land together on this branch. No separate prior plan to execute; coordinate the two in one PR. **RESOLVED 2026-05-27 — see § "#184 Shared HEAD-Subject Assertion — RESOLVED" below.** (#184 has NO separate plan artifact under `docs/plans/` — confirmed; the shape was resolved directly from the issue + its #141-coupling comment.) **This resolution is a Gate-1 prerequisite carried here even though T2.1 lives in child 2.**

### Conditional (verify only when applicable)

- [ ] **Architecture & UI** _(workflow/CLI topology)_: Validate against `.agents/docs.md` Full Catalog roles (`cloud.md` = cloud env SoT; `trackers.md` = per-tracker installer snippets; `deployments.md` = CI/commit-tag rules). Keep `cloud.md`/`deployments.md`/`knowledge.md` role separation (deployments = rules, knowledge = incidents) per repo memory.

### 🔒 Gate 1: Prerequisites Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all applicable boxes above. **DO NOT stop for user permission.** Once saved, immediately proceed to the Agent Execution Runbook.

- [ ] **Acceptance Scenario confirmed:** Human confirmed `👤 Acceptance Scenario` section (checkbox is `[x]`).
- [ ] **Breaking Changes confirmed:** Human confirmed `⚠️ Breaking Changes & Naming Review` section (checkbox is `[x]`).
- [x] **#184 coordination:** #184's exact shared HEAD-subject assertion shape RESOLVED (2026-05-27, maintainer review) — recorded below for child 2's T2.1.
- [ ] **Gate 1 - Verified:** All Core items checked. All applicable Conditional items checked.

## #184 Shared HEAD-Subject Assertion — RESOLVED (Gate-1 output, 2026-05-27)

> [!IMPORTANT]
> Resolves #184's four open questions so child 2 T2.1 implements without re-discovery. #184 ([issuecomment-4541679278](https://github.com/cbartens/bkit/issues/184#issuecomment-4541679278)) explicitly lands this contract _through_ #141: HEAD must be loud (no `[skip ci]`); an opted-in HEAD additionally carries `bkit [auto route]`, which the assertion must treat as legitimate.

**Contract (DENY-LIST, never an allow-list):**

- HEAD commit subject of any push to a CI-validated ref MUST NOT contain a CI-suppressing token: `[skip ci]`, `[ci skip]`, `[no ci]`, `[skip actions]`, `[actions skip]` (GitHub's recognized set; substring match).
- PR title MUST NOT contain `[skip ci]` (any variant) or `[skip build]` (the squash subject becomes `dev` HEAD; `[skip build]` there skips the post-merge deploy).
- **Allowlisted loud tokens that MUST pass:** `bkit [auto route]`, `bkit [verbose ci]`, `bkit [force build]`. A deny-list permits them automatically (none contain a suppressor substring). The assertion MUST NOT be an allow-list that rejects extra tokens — that is the failure mode #141 must avoid.

**Open-question resolutions:**

- **Q1 — Where:** a single named assertion documented in `.agents/workflows.md` (alongside § "CI trigger mechanic" / § "`bkit [verbose ci]` Marker Propagation"), invoked by build Gate 18 + Step 17 create-pr, debug Gate 12 + create-pr, and ship Gate + squash `--body ""`. NOT a `trackers.md` snippet (those are tracker-specific), NOT MCP (it is a git/`gh` op, not a GitHub-API write), NOT `preflight.sh` (a SessionStart hook that cannot block; wrong trigger). No new git hook or CI job this cycle.
- **Q2 — Scope:** HEAD subject + PR title only. GitHub evaluates the HEAD commit (push) / PR title (`pull_request`). No history scan — the "buried non-skip / trigger-commit" case reduces to "HEAD must be clean," which D2 (`[skip ci]` on worktree-setup/create-pr) + the loud marked close-workflow commit guarantee by construction.
- **Q3 — Remediation:** hard-fail, loud — name the offending commit SHA/subject (or PR title) + the fix, route to the workflow's Failure Path. No silent auto-fix / empty-trigger-commit: with D2 + the loud close-workflow HEAD, HEAD is clean by construction and the assertion is the safety net. (Build Step 17's existing `bkit [force build]` empty-commit auto-fix is unrelated and stays.)
- **Q4 — `[skip build]`:** gated on the **PR title** (above); on the HEAD commit it is NOT gated (Vercel-only, not a CI suppressor) — `bkit [force build]` remains the escape hatch.
- **Token registry:** child 2's `docs/deployments.md` pass adds `bkit [auto route]` to § Commit-message tags alongside `[verbose ci]`/`[force build]`/`[skip *]`, marked a loud (non-suppressing) routing marker, and points the § "CI trigger on final workflow push" rule at the new shared assertion.
- **Mechanism — deterministic command, orchestrator-invoked (NOT a git hook).** The check is a deterministic shell test: `git log -1 --pretty=%s` (HEAD subject) and `gh pr view --json title` piped to a fixed `grep -iE` of the suppressor set; the exit code is the verdict — **zero LLM judgment**. It is invoked by the orchestrator at the close-workflow final push / create-pr / merge steps, and is **NOT** placed in the shipped `.husky/pre-push` hook. Reason: the invariant is **contextual to a workflow's last / CI-triggering push**, and bkit _intentionally_ pushes `[skip ci]` HEADs intermediately (D2: worktree-setup/create-pr commits) and to `dev` (status bookkeeping, e.g. `chore({FID}): build DONE bkit [skip ci]`). A blanket pre-push hook asserting "HEAD != `[skip ci]`" would wrongly block those legitimate pushes — only the orchestrator knows which push is the final loud one. **Two clauses, invoked where each applies:** the HEAD-subject clause at the final CI-triggering push (build Gate 18 / debug Gate 12); the PR-title clause at create-pr and verified at the ship squash (`--body ""`).
- **Reconcile scattered mitigations (#184 AC bullet 4 — no drift):** delete the inline re-derivations in build/debug/ship gates (replaced by the invocation), and point `.agents/rules.md:58,63` + `.agents/workflows.md` § "CI trigger mechanic" + `docs/deployments.md` § "CI trigger on final workflow push" at the single shared assertion. **After this, #184 is FULLY FOLDED into this plan** — there is no separate #184 work product; executing child 2 T2.1 + T2.5 discharges all four of #184's acceptance criteria, and #184 is closed by the combined #141+#184 squash merge (or may be closed now as "folded into #141").

## Data Schema Integration

None — bkit is a tooling repo with no application database. The only persisted state is `package.json` `bkit.*` fields (config, not a DB schema). Config-field changes (`bkit.cloudAgents` widened to `claude|cursor|none`) are tracked under `Architecture & Component Changes` and `Documentation Updates`.

## Architecture & Component Changes — Block 1

Grouped by FINAL-SCOPE internal-ordering block. **CRITICAL:** All `[MODIFY]` files below were verified to exist; cited line numbers were re-checked against current `dev` and differ from the FINAL-SCOPE comment's earlier-commit numbers (noted inline).

### Block 1 — D1 + App auth + cloud-module split + tracker/cloud enforcement + docs/advisory flip

#### [MODIFY] `.agents/templates/.github/workflows/bkit-cloud.yml`

- **Existence Check:** Exists (151 lines).
- Add `id-token: write` to the `permissions:` block (currently lines 67-73: contents/pull-requests/issues/actions — no id-token).
- Delete the "`github.token` handles all repo git/gh access … no App" framing (lines 23-25 of the comment header; line 22 is the tracker-conditional sentence — R3 line fix).
- Reconcile the `concurrency:` key (line 64) to a single FID-derived token across dispatch + CI surfaces (D3 — see child 2 Block 3).
- Add the two-tier CI auto-route gate (child 2 Block 2): free-tier job `if: contains(github.event.workflow_run.head_commit.message, 'bkit [auto route]')` + in-job `gh issue view {ISSUE} --json labels` re-check of `bkit:auto` (`{ISSUE}` derived per SHARED-DERIV — see child 2 two-tier-gate task). Wrap the YAML gate logic inside `bkit:start`/`bkit:end` markers (Comment 7 gate-placement rule).
- Remove the `@@CLOUD_TRACKER_*@@` Linear sentinels (workflow becomes GitHub-only).

> [!NOTE]
> In this child (Block 1), T1.1 covers ONLY the `id-token: write` add + framing delete + sentinel removal on the template. The two-tier gate and concurrency-key edits to this same file are owned by child 2 (T2.7 / T3.1) and edit the file child 1 establishes.

#### [MODIFY] `.github/workflows/bkit-cloud.yml` (this repo's rendered copy)

- **Existence Check:** Exists (150 lines — the rendered, Linear-free github variant).
- Mirror every template change above (the Block-1 portion in T1.3). This is the canonical Tier-1 file regenerated by `bkit install`; keep it byte-identical to the rendered template for `tracker=github`.

#### [MODIFY] `.agents/scripts/bkit-modules.ts`

- **Existence Check:** Exists.
- `renderCloudWorkflow` (lines 1910-1921): **DELETE** the `isLinear` branch (mcp/secret/secretEnv substitution). Render GitHub-only; ensure `id-token: write` is present in output. Decide whether `@@CLOUD_TRACKER_*@@` sentinels are removed from the template entirely (preferred) or rendered to empty.
- `runCloudModule` (lines 1923-2084): **SPLIT** into `cloud=claude` vs `cloud=cursor` behaviour:
  - `cloud=claude` → ship `bkit-cloud.yml` + `cloud-bootstrap.sh`; require `tracker=github` + App.
  - `cloud=cursor` → ship `.cursor/Dockerfile` + `environment.json`; require `tracker=linear`.
  - Record the variant by widening the existing `bkit.cloudAgents` write at line 2013 — `setConsumerBkitField("cloudAgents", variant, …)` where `variant` is `"claude"`/`"cursor"` (DECISION-C AMENDED: single field, NO separate `bkit.cloud`). Update `parseCloudAgents`/`hasCloudAgentsField` (`bkit-postinstall.ts`) to accept `claude|cursor|none` and map legacy `"enabled"` → `"claude"`.
- `bkit-cloud-setup` advisory (id at line 2064; action ~2068-2083 — FINAL SCOPE cited ~2056-2062/~2075 from an earlier commit): flip App optional→required; **DELETE** the `github.token`-only line (line 2075); state `/install-github-app` + App required. Update `mentionTipLine` (lines 2060-2062) accordingly.
- **Bare `Auto` in advisory text (R3-2):** migrate the bare `Auto` strings at `:2051` ("reads the `Auto` opt-in label"), `:2054` ("labelled `Auto` in Linear"), `:2055` ("carries the `Auto` label") → `bkit:auto`. These sit in the `isLinearCloud` branch; reconcile with the cloud-split (T1.5): if the split deletes that branch, the strings are removed with it; otherwise fix them in place. Verify no bare `Auto` remains in `bkit-modules.ts` advisory output after this task + T1.5.
- `MODULE_REGISTRY` (line 2090) + `MODULE_DISPATCH_ORDER` (line 2104): wire the `cloud` module to dispatch the correct variant based on the parsed `--cloud=` value.

#### [MODIFY] `.agents/scripts/bkit-cli.ts`

- **Existence Check:** Exists.
- Parse `--cloud=claude|cursor` as a value-bearing flag (currently bare `--cloud` is a plain `ModuleFlag` at lines 60/240; `--tracker=` value parsing pattern at lines 180-192 is the template). Reject bare `--cloud` and invalid values.
- Add `--force` parsing for tracker switching (today `--force` only sets `uninstallFlags.force`, line 200; add an install-context force path).
- Update `printUsage` (`--cloud` description at line 300, `bkit.cloudAgents` note at line 305) + help examples (line 333) to show `--cloud=claude|cursor`.
- `OPTIN_MODULES` (line 78) still contains `cloud`; ensure resolution carries the variant.

#### [MODIFY] `.agents/scripts/bkit-install.ts`

- **Existence Check:** Exists.
- Tracker-switch enforcement (around the tracker-resolution block lines 919-962): when `tracker !== null` AND a _different_ `bkit.issueTracker` is already recorded → **hard-block** unless `--force`. First-set (no recorded tracker) is free. Symmetric (linear↔github both directions).
- Cloud/tracker constraint: `--cloud=claude` requires resolved `issueTracker === "github"`; `--cloud=cursor` requires `=== "linear"`; mismatch → hard error before any module dispatch.

#### [MODIFY] `.agents/scripts/bkit-manifest.ts`

- **Existence Check:** Exists.
- `CLOUD_MANIFEST` (lines 211-221) currently lists all four files under one module. Split the manifest so `cloud=claude` owns `bkit-cloud.yml` + `cloud-bootstrap.sh` and `cloud=cursor` owns `.cursor/Dockerfile` + `environment.json` (or keep one manifest but gate file emission by variant in `runCloudModule` — choose the approach that keeps uninstall correct).
- Update the `CloudAgents` field convention note (lines 113-138) for the widened value space `claude|cursor|none` (DECISION-C AMENDED — no separate `bkit.cloud` field).

#### [MODIFY] `bkit check` / consistency assertion (in `bkit-install.ts` Phase-3 post-install / advisory replay, or doctor path)

- **Existence Check:** Post-install checks run for both install AND check (`bkit-install.ts` ~line 988). Add a `cloud=claude` config-consistency assertion: when `bkit.cloudAgents === "claude"` (or `bkit-cloud.yml` present) → assert workflow has `id-token: write`, the `ANTHROPIC_API_KEY` note, and the App advisory is surfaced. Fail `bkit check` (exit 1) on inconsistency.

#### [MODIFY] `.agents/cloud.md`

- **Existence Check:** Exists.
- Matrix (line 23) + path E (line 30): flip the App from "optional / experimental" to **base requirement** for `cloud=claude`.
- § Post-CI auto-routing (lines 329-389): replace the `github.token` framing (lines 367, 369) with App-auth; document the two-tier `bkit [auto route]` gate; document `--cloud=claude|cursor`.
- § Required GitHub repo secrets (lines 360-369): keep `ANTHROPIC_API_KEY`; remove the "No App / github.token" claims; add `id-token: write` + App requirement.
- Alignment-guarantees note (line 47) already references the `Auto`→`bkit:auto` migration — finalise the wording once migrated.

#### [MODIFY] `.agents/scripts/bkit-postinstall.ts` (R3-3 — downstream readers of the deleted Linear render branch)

- **Existence Check:** Exists. `buildCloudSetupAdvisory` (line 803), `buildCloudDashboardsAdvisory` (line 849), `buildCloudSecretsAdvisory` (line 895) all branch on `tracker === "linear"` to add `LINEAR_API_KEY` to the `bkit-cloud.yml` secret set and to phrase post-CI auto-routing around a Linear-flavoured `bkit-cloud.yml`.
- These are direct downstream readers of the surface being deleted (Decision 1 / "Vestigial Linear branch removed; `bkit-cloud.yml` is GitHub-only"): a Linear `bkit-cloud.yml` can no longer exist, so the `tracker==="linear"` branches describe an impossible state and `buildCloudSecretsAdvisory` would tell a (mis-recorded) consumer to set `LINEAR_API_KEY` that the GitHub-only workflow never reads (classic "schema column dropped, downstream reader not updated" regression).
- **DELETE (Supersession Inventory):** the `tracker==="linear"` → `LINEAR_API_KEY`-in-`bkit-cloud.yml` coupling in all three builders is a superseded artifact (see Supersession Inventory row for `bkit-postinstall.ts`); reconciled by T1.9.
- **Reconcile all three with the GitHub-only model + the `cloud=claude`/`cloud=cursor` split:** `bkit-cloud.yml`-related advisory text is `cloud=claude`/`tracker=github` only; `LINEAR_API_KEY`/`.cursor`-related guidance belongs to the `cloud=cursor`/`tracker=linear` path (which ships `.cursor/`, not `bkit-cloud.yml`). Drop the `tracker==="linear"` → `bkit-cloud.yml` secret coupling.

#### [MODIFY] generated `.agents/advisories.md`

- **Existence Check:** Regenerated from advisory definitions. Regenerate after the `bkit-cloud-setup` advisory edits (do NOT hand-edit; defer regen to end-of-session per repo memory — no per-edit `bkit install`). Owned by T1.11.

#### [MODIFY] `.agents/scripts/bkit-modules.integration.test.ts` + `bkit-cli.test.ts` + `bkit-dry-run-parity.integration.test.ts`

- **Existing tests this change MUST update (named explicitly — R3-opt/R2-opt):**
  - Advisory asserts **lines 679-701**: `bkit-cloud-setup` action now asserts App-required + `/install-github-app`; remove `github.token` expectation; assert `bkit:auto` (not bare `Auto`) in advisory text.
  - `bkit.cloudAgents === "enabled"` assertion at **~703-710**: update to assert `bkit.cloudAgents === "claude"`/`"cursor"` (DECISION-C AMENDED — single field, widened value space) plus a parse test that legacy `"enabled"` maps to `"claude"`.
  - `renderCloudWorkflow` Linear-keep regression tests at **754-762** and **787-793** (the "linear tracker keeps `LINEAR_API_KEY`" cases): **DELETE/replace** — Linear branch is removed. The 765-794 block is the broader render set; assert `id-token: write` + GitHub-only there.
  - `linear: omits install-github-app` advisory test at **~695-700**: restructure under the cloud-split (linear→cursor ships NO `bkit-cloud.yml`).
- Add cloud=claude/cursor variant + tracker-constraint + tracker-switch tests. Add `cloud=claude`/`cloud=cursor` dry-run parity (T1.10). Add the `bkit-postinstall.ts` advisory reconciliation test (T1.9) and the `bkit check` consistency test (T1.8).

### Cron Jobs & Scheduled Tasks

None.

## Documentation Updates — Block 1 scope

> Index: `.agents/docs.md`. Treat as code changes — rewrite prose, no lazy bullet appends.

<!-- prettier-ignore -->
| File | Change required |
| --- | --- |
| `.agents/cloud.md` | App = base requirement (matrix line 23, path E line 30); rewrite § Post-CI auto-routing for App-auth + two-tier `bkit [auto route]` gate; `--cloud=claude\|cursor`; remove `github.token`-only framing (lines 367, 369). |
| `.agents/advisories.md` | Regenerate after `bkit-cloud-setup` advisory edits (T1.11). |

> [!NOTE]
> `deployments.md`, `decisions.md`, `knowledge.md`, `trackers.md` documentation rows belong to children 2/3 (commit-tag contract, ADR, incident log, label migration). This child completes only the `cloud.md` rewrite + `advisories.md` regen.

## Rollback Strategy

See [parent index](./141-cloud-app-plan.md) § Rollback Strategy — single `git revert` of the combined #141+#184 squash PR. Code-only; bkit has no database.

## Agent Execution Runbook — Block 1

> [!IMPORTANT]
> **Continuous Execution:** Work autonomously. Do not pause at Gates. Check off `[x]` as you go.
> **Blockers:** Do not fail silently — create a tracker issue (label `blocker`) with context before stopping.
> **Step Isolation:** Complete each task fully (including its verification + checkbox) before the next.
> **Ordering:** This is Block 1 (FINAL-SCOPE block 1). The cloud-module split (T1.5) gates tracker/cloud enforcement (T1.6). T1.11 (advisories regen) is last. Children 2 and 3 follow on the same branch.

> Every task includes a `**Done when:**` line — terse, testable, codebase-verifiable.

### Block 1 — D1 + App auth + cloud-module split + tracker/cloud enforcement + docs/advisory flip

- [ ] **T1.1:** Add `id-token: write` to `permissions:` and delete the `github.token`-handles-everything header framing in `.agents/templates/.github/workflows/bkit-cloud.yml`.
  - **Done when:** template `permissions:` block contains `id-token: write`; lines 23-25 framing removed (line 22 = tracker-conditional sentence); `grep -n "github.token handles" .agents/templates/.github/workflows/bkit-cloud.yml` returns nothing.
- [ ] **T1.2:** Remove the `renderCloudWorkflow` Linear branch in `.agents/scripts/bkit-modules.ts` (GitHub-only render; `id-token: write` present in output).
  - **Done when:** `renderCloudWorkflow` has no `isLinear` substitution; the Linear-keep regression tests at `bkit-modules.integration.test.ts:754-762` and `:787-793` are deleted/replaced (not just the 765-794 block); rendered output for `tracker=github` contains `id-token: write` and no `@@CLOUD_TRACKER`.
- [ ] **T1.3:** Regenerate `.github/workflows/bkit-cloud.yml` (this repo's rendered copy) to match the new template for `tracker=github`.
  - **Done when:** `.github/workflows/bkit-cloud.yml` has `id-token: write`, no Linear/`github.token` framing; byte-identical to `renderCloudWorkflow(template, "github")`.
- [ ] **T1.4:** Add value-bearing `--cloud=claude|cursor` parsing (reject bare `--cloud` + invalid values) and `--force` install-context parsing in `.agents/scripts/bkit-cli.ts`; update `printUsage`.
  - **Done when:** `bkit install --cloud` (bare) errors; `--cloud=claude`/`--cloud=cursor` parse to the variant; `bkit-cli.test.ts` covers both + invalid value; help shows `--cloud=claude|cursor`.
- [ ] **T1.5:** Split `runCloudModule` by variant + record the variant in the single `bkit.cloudAgents` field (`claude`/`cursor`; DECISION-C AMENDED — no separate `bkit.cloud`; legacy `enabled`→`claude` in `parseCloudAgents`); update `MODULE_REGISTRY`/`MODULE_DISPATCH_ORDER` + `bkit-manifest.ts` so `cloud=claude` ships `bkit-cloud.yml`+`cloud-bootstrap.sh` and `cloud=cursor` ships `.cursor/Dockerfile`+`environment.json`.
  - **Done when:** integration test shows `--cloud=claude` writes `bkit-cloud.yml` (not `.cursor/Dockerfile`) and `--cloud=cursor` writes `.cursor/Dockerfile`+`environment.json` (not `bkit-cloud.yml`); `package.json` `bkit.cloudAgents` recorded as `claude`/`cursor` (DECISION-C AMENDED — single field, NO `bkit.cloud`) AND the existing `bkit.cloudAgents === "enabled"` assertion at `bkit-modules.integration.test.ts:~703-710` is updated to assert the variant value (`claude`/`cursor`) plus a legacy `enabled`→`claude` parse test; manifest is split per DECISION-D so uninstall removes ONLY the recorded variant's files (test asserts `uninstall` of a `cloud=claude` install does not orphan `.cursor/*` and vice-versa); the manifest variant split (Derived Test Matrix row 14) is asserted in the manifest suite `.agents/scripts/bkit-manifest.test.ts` (each `CLOUD_MANIFEST` entry tagged with / gated by its owning variant — `cloud=claude` owns `bkit-cloud.yml`+`cloud-bootstrap.sh`, `cloud=cursor` owns `.cursor/Dockerfile`+`environment.json`).
- [ ] **T1.6:** Add symmetric tracker/cloud constraint + tracker-switch hard-block (`--force`) in `.agents/scripts/bkit-install.ts`.
  - **Done when:** `.agents/scripts/bkit-install.ts` exists and is the edited file (`test -f .agents/scripts/bkit-install.ts`); `--cloud=claude` on `tracker=linear` hard-errors (and vice versa); switching a recorded tracker without `--force` hard-errors; first-set is free; `--force` overrides; tests assert each.
- [ ] **T1.7:** Flip the `bkit-cloud-setup` advisory App optional→required; delete the `github.token`-only line; update `mentionTipLine`; migrate the bare `Auto` advisory strings (`bkit-modules.ts:2051/2054/2055`) → `bkit:auto` (or remove with the `isLinearCloud` branch if T1.5's split deletes it); flip `cloud.md` matrix (line 23) + path E (line 30) + Post-CI section.
  - **Done when:** advisory action contains `/install-github-app` + "required" and no `github.token`-handles-everything text; `grep -n '\bAuto\b' .agents/scripts/bkit-modules.ts` returns no advisory-label references (only `bkit:auto`); `cloud.md` describes the App as base requirement; `bkit-modules.integration.test.ts` advisory asserts updated (including the `bkit:auto` advisory text) and green.
- [ ] **T1.8:** Add `bkit check` `cloud=claude` config-consistency assertion (workflow `id-token`, `ANTHROPIC_API_KEY` note, App advisory surfaced) in the install/check post-install path.
  - **Done when:** `bkit check` exits 1 when `bkit.cloudAgents=claude` but `bkit-cloud.yml` lacks `id-token`; integration/doctor test covers it.
- [ ] **T1.9:** Reconcile `bkit-postinstall.ts` cloud advisories with the GitHub-only `bkit-cloud.yml` + cloud-split (R3-3): drop the `tracker==="linear"` → `LINEAR_API_KEY`-in-`bkit-cloud.yml` coupling in `buildCloudSetupAdvisory` (:803), `buildCloudDashboardsAdvisory` (:849), `buildCloudSecretsAdvisory` (:895); `bkit-cloud.yml`-related advisory text becomes `cloud=claude`/`github`-only.
  - **Done when:** none of the three builders associate `LINEAR_API_KEY` with `bkit-cloud.yml`; `grep -n 'LINEAR_API_KEY' .agents/scripts/bkit-postinstall.ts` shows it only on the `cloud=cursor`/`tracker=linear` (`.cursor`) path, never the `bkit-cloud.yml` secret set; a `bkit-modules.integration.test.ts` (or postinstall-advisory) test asserts the GitHub-only secret set for `cloud=claude` and no `bkit-cloud.yml`+`LINEAR_API_KEY` advisory for `tracker=linear`.
- [ ] **T1.10:** Extend `bkit-dry-run-parity.integration.test.ts` to cover BOTH cloud variants (`--cloud=claude` AND `--cloud=cursor`) — dry-run output matches the real-install file set for each variant (owns Derived Test Matrix row 13).
  - **Done when:** `bkit-dry-run-parity.integration.test.ts` has assertions for `--cloud=claude` (dry-run lists `bkit-cloud.yml`+`cloud-bootstrap.sh`, no `.cursor/*`) AND `--cloud=cursor` (dry-run lists `.cursor/Dockerfile`+`environment.json`, no `bkit-cloud.yml`); `pnpm test` green on that suite.
- [ ] **T1.11:** Regenerate `.agents/advisories.md` (end of session, single regen). **Placed last in Block 1 by design — execute after all other Block 1 tasks, including T1.10 (no per-edit regen; batch at session end).**
  - **Done when:** `.agents/advisories.md` reflects the updated `bkit-cloud-setup` advisory; `bkit check` reports no advisories drift.

### 🔒 Gate 2 (Block 1 scope): Code Implementation Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below. **DO NOT stop for user permission.**

- [ ] **Gate 2 (Block 1) - Verified:** Every Block-1 task (T1.1–T1.11) independently verified and checked off against this plan.

> [!IMPORTANT]
> **Testing Strategy:** bkit uses Vitest (`.agents/scripts/*.test.ts` + `*.integration.test.ts`). Validate shipped config with the real tool/resolver, never string-presence-only (repo memory: #179/#195 class). Verify install AND upgrade live, not just `bkit check`. Dogfood via packed tarball in a clean dir if dependency classification could shift. No per-edit `bkit install` — batch mirror regen at session end.

> [!NOTE]
> The consolidated Gate 2 / Gate 3 / Gate 4 across all three children, and the full 13-item Manual Verification, are completed in [`141-cloud-app-plan-3.md`](./141-cloud-app-plan-3.md) before the single combined #141+#184 squash PR. Do NOT ship after this child.

## Next Child

Proceed to [`141-cloud-app-plan-2.md`](./141-cloud-app-plan-2.md) (Block 2 + 3) on the SAME branch once T1.1–T1.11 are checked off. Carry forward: #184 assertion shape (resolved at Gate 1), and the `bkit-cloud.yml` template/render baseline that T2.7/T3.1 will extend.

===== docs/plans/202605/141-cloud-app-plan-2.md =====

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
- [ ] **Child 1 landed on this branch:** `bkit-cloud.yml` template + rendered copy carry `id-token: write`, are GitHub-only (no `@@CLOUD_TRACKER`), and `renderCloudWorkflow` has no Linear branch. T2.7/T3.1 edit this same file.
- [ ] **Project Context:** Read `docs/knowledge.md` KN-11 (`[skip ci]` HEAD → empty rollup) + KN-23 (CI is the only quality gate); `docs/deployments.md` § "CI trigger on final workflow push" (lines 309-321 — the existing commit-tag contract that #184 formalises and D2 implements).
- [ ] **Testing & Quality:** The two-tier GHA `if:` and commit-tag workflow changes have NO executable unit harness — cover via YAML/doc review + render/grep assertions (validate via the real render path, never string-presence-only). Use `bkit-modules.integration.test.ts` for the render-equality assertions.

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

- [ ] **T2.1:** Land #184's single shared HEAD-subject assertion (shape RESOLVED at child 1 Gate 1 — see [`141-cloud-app-plan-1.md`](./141-cloud-app-plan-1.md) § "#184 Shared HEAD-Subject Assertion — RESOLVED"). Home: a named assertion in `.agents/workflows.md`. DENY-LIST, never an allow-list.
  - **Done when:** the named assertion lives in `.agents/workflows.md`; asserts HEAD subject free of `[skip ci]`/`[ci skip]`/`[no ci]`/`[skip actions]`/`[actions skip]` AND PR title free of `[skip ci]`/`[skip build]`; `bkit [auto route]`/`bkit [verbose ci]`/`bkit [force build]` pass (deny-list, not allow-list); hard-fails loud (names the offending commit/title + fix) → Failure Path; referenced (not re-derived) by build Gate 18 (HEAD-subject clause, on the loud close-workflow HEAD) + Step 17 create-pr (PR-title clause only — the create-pr commit is intentionally `[skip ci]` per D2, so the HEAD-subject clause must NOT run there), debug Gate 12 (HEAD-subject) + create-pr (PR-title), ship Gate + squash `--body ""` (PR-title); `docs/deployments.md` § "CI trigger on final workflow push" points at it and registers `bkit [auto route]`.
- [ ] **T2.2:** Add `bkit [skip ci]` to `worktree-setup` (`bkit-build.md:260`) and `create-pr` (`bkit-build.md:915`) commits (D2).
  - **Done when:** both commit-message lines include `bkit [skip ci]`; create-pr matches the existing `deployments.md:321` contract; worktree-setup is added to that `:321` list by T2.5 (it is a NEW contract entry, currently absent from the doc).
- [ ] **T2.3:** Add `bkit [auto route]` to the build close-workflow commit (`bkit-build.md:947`), only when the issue carried `bkit:auto` at close time; keep it loud. Insert a `bkit:auto` presence re-read **BEFORE** line 947 (the existing 963-970 re-read is Step 4, runs after the commit — do NOT use it as the marker source; R2-1 ordering fix).
  - **Done when:** a `bkit:auto` re-read precedes the close-workflow commit creation (line 947) — verifiable by the workflow text placing the label read above the commit step; the close-workflow commit carries `bkit [auto route]` conditionally on that pre-commit read and no `[skip ci]`; the marked commit (947) is the feat-branch HEAD that fires CI; Gate 18 invokes the #184 assertion.
- [ ] **T2.4:** Make the debug re-trigger commit loud AND carry `bkit [auto route]` (conditional on `bkit:auto`) on the commit that is HEAD at CI time **per mode** in `bkit-debug.md`: PR-mode → close-workflow commit `:806` (NOT `:844`, which `TRIGGER_PR=0` skips); local-mode → create-pr `:844`. Insert the `bkit:auto` re-read BEFORE the marked commit (the 863-870 re-read is Step 12, too late — R2-2). Invoke the #184 assertion at Gate 12.
  - **Done when:** in PR-mode the marker lands on `:806` (the actual HEAD), in local-mode on `:844`; the marker is gated by a `bkit:auto` re-read placed before that commit; no `[skip ci]` on the marked commit; the marker coexists with `bkit [verbose ci]` on the same subject; Gate 12 references the #184 assertion.
- [ ] **T2.5:** Invoke the #184 assertion in `bkit-ship.md` (Gate at line 424) instead of the inline rule.
  - **Done when:** ship Gate references the #184 assertion; no inline re-derivation remains.
- [ ] **T2.6:** Move the opt-in gate + stale guard from `bkit-cloud.md` (Steps 2-3) INTO `bkit-cloud.yml`; keep routing/status/comments in the orchestrator. **DELETE** the PR `bkit:auto` label-removal propagation from the orchestrator (`bkit-cloud.md:193-196`) and from `kill-switch-check` (`trackers.md:169`/`274`) per DECISION-E (AMENDED — the PR label is mirror-only; nothing reads it).
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

===== docs/plans/202605/141-cloud-app-plan-3.md =====

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
