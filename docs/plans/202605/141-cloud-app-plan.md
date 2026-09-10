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
| [`141-cloud-app-plan-1.md`](./141-cloud-app-plan-1.md) | Block 1 | T1.1–T1.11 | 11 | D1 App auth (`id-token: write`), cloud-module split (`cloud=claude`/`cloud=cursor`), `--cloud=` value flag + `--force`, single `bkit.cloudAgents=claude \| cursor \| none` field, tracker/cloud constraint + tracker-switch hard-block, manifest split, advisory flip (App optional→required), `bkit check` consistency, postinstall reconciliation, dry-run parity, advisories regen. Carries Gate 1 (both human confirmations + #184 coordination). |
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
